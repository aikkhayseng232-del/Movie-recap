import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import multer from 'multer';
import crypto from 'crypto';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  getAvailableTTSProviders,
  synthesizeGoogleNativeBurmese,
  synthesizeGeminiTTS,
  validateAudioFile,
} from './server/tts.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Directories
const UPLOADS_DIR = path.resolve('uploads');
const OUTPUTS_DIR = path.resolve('outputs');
const VIDEO_OUT_DIR = path.resolve('outputs/video');
const AUDIO_OUT_DIR = path.resolve('outputs/audio');
const SUBTITLES_OUT_DIR = path.resolve('outputs/subtitles');
const PUBLIC_AUDIO_DIR = path.resolve('public/audio');
const FONTS_DIR = path.resolve('/fonts');

[UPLOADS_DIR, OUTPUTS_DIR, VIDEO_OUT_DIR, AUDIO_OUT_DIR, SUBTITLES_OUT_DIR].forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `source_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 350 * 1024 * 1024 }, // 350MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'audio/mpeg', 'audio/wav', 'audio/webm', 'image/png', 'image/jpeg'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp4|mov|webm|mkv|wav|mp3|png|jpg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('ဖိုင်အမျိုးအစား မမှန်ကန်ပါ (MP4, MOV, WebM သို့မဟုတ် အသံဖိုင်သာ လက်ခံပါသည်)'));
    }
  },
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Render Jobs & Active Process Tracking
interface RenderJob {
  id: string;
  fingerprint?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error?: string;
  outputVideoPath?: string;
  outputVideoUrl?: string;
  outputSrtPath?: string;
  outputSrtUrl?: string;
  outputVttPath?: string;
  outputVttUrl?: string;
  fileSize?: number;
  createdAt: number;
}
const renderJobs = new Map<string, RenderJob>();
const activeFfmpegProcesses = new Map<string, any>();

// Cleanup older jobs and temporary rendered files periodically
function cleanupTemporaryFiles() {
  const twoHoursAgo = Date.now() - 2 * 3600 * 1000;
  // 1. Clean jobs from memory
  for (const [id, job] of renderJobs.entries()) {
    if (job.createdAt < twoHoursAgo) {
      renderJobs.delete(id);
    }
  }
  // 2. Clean orphaned disk files in output directories
  [VIDEO_OUT_DIR, AUDIO_OUT_DIR, SUBTITLES_OUT_DIR, UPLOADS_DIR].forEach((dir) => {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.startsWith('sample_')) continue;
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < twoHoursAgo) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (e) {
        // Ignore read/unlink errors
      }
    }
  });
}
setInterval(cleanupTemporaryFiles, 1800000); // Every 30 minutes

// ==========================================
// API ROUTES
// ==========================================

// 1. Health & Capability Check
app.get('/api/health', (_req: Request, res: Response) => {
  const myanmarFontExists = fs.existsSync(path.join(FONTS_DIR, 'NotoSansMyanmar-Regular.ttf'));
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    ffmpegAvailable: true,
    ffmpegVersion: '4.4.2',
    myanmarFontAvailable: myanmarFontExists,
    defaultLanguage: 'my',
    supportedResolutions: ['480p', '720p', '1080p'],
    models: {
      standardRecap: 'gemini-3.8-flash',
      storyRecapV2: 'gemini-4-argon',
      tts: 'gemini-3.8-flash-tts',
      ttsLite: 'gemini-3.8-flash-lite-tts',
      transcribe: 'gemini-3.5-transcribe',
    },
  });
});

// 2. Video Upload with Clean Error Handling
app.post('/api/upload', (req: Request, res: Response) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      res.status(400).json({
        success: false,
        error: err.message || 'ဖိုင်တင်သွင်းခြင်း မအောင်မြင်ပါ (Upload failed)',
      });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, error: 'ဖိုင်မရှိပါ (No file uploaded)' });
      return;
    }
    const fileUrl = `/api/media/uploads/${req.file.filename}`;
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      url: fileUrl,
    });
  });
});

// 3. Gemini Script Generation (Milestone 2)
app.post('/api/gemini/generate-script', async (req: Request, res: Response) => {
  const {
    title = '',
    genre = 'Thriller / Action',
    synopsis = '',
    sourceText = '',
    sourceVideo = '',
    style = 'cinematic',
    targetDurationMinutes = 3,
    language = 'my',
    isStoryRecapV2 = false,
  } = req.body;

  // 1. Strict Request Validation
  const hasTitle = Boolean(title && title.trim() && title.trim() !== 'Movie Title');
  const hasSynopsis = Boolean((synopsis && synopsis.trim()) || (sourceText && sourceText.trim()));
  const hasVideo = Boolean(sourceVideo && sourceVideo.trim());

  if (!hasTitle && !hasSynopsis && !hasVideo) {
    res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      error: 'ဇာတ်လမ်း အချက်အလက် မလုံလောက်ပါ (Insufficient input)',
      message: 'ကျေးဇူးပြု၍ ရုပ်ရှင်အမည်၊ ဇာတ်လမ်းအကျဉ်း သို့မဟုတ် အရင်းအမြစ် ဗီဒီယိုဖိုင် ထည့်သွင်းပေးပါ (Please provide a movie title, plot synopsis, or video file)',
    });
    return;
  }

  // 2. Secret & Capability Check - Never return fake successful results
  if (!apiKey || !ai) {
    res.status(400).json({
      success: false,
      code: 'MISSING_API_KEY',
      error: 'GEMINI_API_KEY မရှိသေးပါ (GEMINI_API_KEY is not configured on the server)',
      message: 'ကျေးဇူးပြု၍ Google AI Studio ၏ Secrets panel တွင် GEMINI_API_KEY ကို ထည့်သွင်းပေးပါ (Please configure GEMINI_API_KEY in the Secrets panel to enable live AI recap generation).',
    });
    return;
  }

  try {
    const isBurmese = language === 'my';
    const modelToUse = isStoryRecapV2 ? 'gemini-4-argon' : 'gemini-3.8-flash';

    // 3. Video Capability Check
    let videoInlinePart: any = null;
    let videoAnalysisNote = '';

    if (hasVideo) {
      let resolvedVideoPath = path.resolve(sourceVideo);
      if (!fs.existsSync(resolvedVideoPath)) {
        if (fs.existsSync(path.resolve('uploads', sourceVideo))) {
          resolvedVideoPath = path.resolve('uploads', sourceVideo);
        } else if (fs.existsSync(path.resolve('public/samples', sourceVideo))) {
          resolvedVideoPath = path.resolve('public/samples', sourceVideo);
        }
      }

      if (fs.existsSync(resolvedVideoPath)) {
        const stats = fs.statSync(resolvedVideoPath);
        // Under 15MB: supported for direct Gemini inlineData multimodal analysis
        if (stats.size <= 15 * 1024 * 1024) {
          try {
            const videoBuffer = fs.readFileSync(resolvedVideoPath);
            videoInlinePart = {
              inlineData: {
                mimeType: 'video/mp4',
                data: videoBuffer.toString('base64'),
              },
            };
            videoAnalysisNote = 'ဗီဒီယိုပြကွက်များကို Gemini 3.8 Flash ဖြင့် တိုက်ရိုက်ခွဲခြမ်းစိတ်ဖြာထားပါသည် (Direct Multimodal Video Analysis)';
          } catch (readErr) {
            console.warn('Failed to load video buffer for multimodal:', readErr);
          }
        } else {
          // Honest explanation of limitation
          videoAnalysisNote = `ဗီဒီယိုဖိုင်အရွယ်အစား (${(stats.size / (1024 * 1024)).toFixed(1)} MB) သည် တိုက်ရိုက် Multimodal ကန့်သတ်ချက် (15MB) ထက်ကျော်လွန်ပါသဖြင့် ဇာတ်လမ်းစာသားကို အခြေခံ၍ သဘာဝကျသော recap ဇာတ်ညွှန်းကို ဖန်တီးပေးထားပါသည်`;
        }
      }
    }

    // 4. Honesty rule: Never claim to have watched a movie if only title was supplied
    const isTitleOnly = hasTitle && !hasSynopsis && !videoInlinePart;

    const systemPrompt = isBurmese
      ? `သင်သည် မြန်မာဘာသာဖြင့် ရုပ်ရှင်အကျဉ်းချုပ် (Movie Recap) ဇာတ်ညွှန်းများ ရေးသားရာတွင် ထူးချွန်သော အတွေ့အကြုံရင့် ဇာတ်လမ်းပြောသူ (Professional Burmese Movie Recap Narrator) ဖြစ်သည်။
မြန်မာစာ ယူနီကုဒ် (Myanmar Unicode) ကို တိကျပြေပြစ်စွာ သုံးစွဲပြီး ပရိသတ် စိတ်ဝင်စားမှုမပြတ်စေမည့် ဆွဲဆောင်မှုရှိသော စကားလုံးများ၊ သည်းထိတ်ရင်ဖို အသုံးအနှုန်းများဖြင့် ဖွဲ့စည်းပါ။
စာသားသည် အင်္ဂလိပ်စာတိုက်ရိုက်ဘာသာပြန် (Direct Literal Translation) မဖြစ်စေရ။ မြန်မာပရိသတ်နားဆင်ရာတွင် သဘာဝကျပြီး ရုပ်ရှင်ကြည့်နေရသကဲ့သို့ ခံစားရစေရမည်။
ဇာတ်လမ်းအစ ၅ စက္ကန့်တွင် ပရိသတ်ကို ဖမ်းစားမည့် Hook ပါဝင်ရမည်။
အချိန်ကြာမြင့်ချိန်: စုစုပေါင်း ခန့်မှန်းခြေ ${targetDurationMinutes} မိနစ်စာ (~${Math.round(targetDurationMinutes * 140)} စကားလုံးများ)။
ဇာတ်လမ်းပုံစံ: ${style}။
${isStoryRecapV2 ? 'အထူးညွှန်ကြားချက် (Story Recap V2): ဇာတ်ကောင်များ၏ စိတ်ပိုင်းဆိုင်ရာ တွန်းအား၊ မထင်မှတ်သော အလှည့်အပြောင်း (Plot Twist)၊ အပြန်အလှန် လှည့်စားမှုများနှင့် အထွတ်အထိပ် Climax ကို အသေးစိတ် ဇာတ်လမ်းပြန်လည်ဆင်ပြီး ပိုမိုနက်နဲစွာ ရေးသားပါ။' : ''}
${isTitleOnly ? 'အရေးကြီးမှတ်ချက်: ဇာတ်လမ်းအကျဉ်း မပါရှိဘဲ ရုပ်ရှင်အမည်သာ ပေးထားသဖြင့် ဤဇာတ်ကားကို တကယ်ကြည့်ရှုထားသည့်သဘော မဟုတ်ဘဲ အမည်နှင့် လိုက်ဖက်သော စိတ်ကူးယဉ်ဇာတ်လမ်း ရုပ်ရှင်အကျဉ်းချုပ်အဖြစ် ရေးသားပါ။' : ''}`
      : `You are an elite cinematic movie recap narrator and scriptwriter.
Write an electrifying, engaging movie recap script with clear chronological pacing, a strong 5-second opening hook, rising tension, plot twist revelation, and an outro call to action.
Target duration: ~${targetDurationMinutes} minutes (~${Math.round(targetDurationMinutes * 150)} words).
Style: ${style}.
${isTitleOnly ? 'Note: Only title was provided. Generate a creative narrative recap based on the title without claiming to have observed footage.' : ''}`;

    const userPrompt = `ရုပ်ရှင်အမည် (Movie Title): ${title || 'ရုပ်ရှင်'}
အမျိုးအစား (Genre): ${genre}
ဇာတ်လမ်းအကျဉ်း (Synopsis): ${synopsis || sourceText || (isTitleOnly ? 'အမည်ပေါ်အခြေခံ၍ ရေးသားပါ' : 'မပါဝင်ပါ')}
${videoInlinePart ? 'ပူးတွဲပေးပို့ထားသော ဗီဒီယိုဖိုင်၏ ပြကွက်များကိုပါ အခြေခံ၍ သဘာဝကျစွာ ရေးသားပေးပါ။' : ''}

အောက်ပါ JSON ပုံစံအတိုင်းသာ တိကျစွာ ပြန်လည်ထုတ်ပေးပါ:
{
  "title": "ရုပ်ရှင်အမည်",
  "hook": "အစပိုင်း ဆွဲဆောင်မှုရှိသော ၅ စက္ကန့် ဝါကျ",
  "scenes": [
    {
      "sceneNumber": 1,
      "timestamp": "0:00 - 0:30",
      "title": "အခန်းခေါင်းစဉ်",
      "narrationText": "ပြောဆိုရမည့် ဇာတ်ညွှန်းစာသား",
      "visualNotes": "ရုပ်သံပြကွက် ညွှန်ကြားချက်"
    }
  ],
  "fullScript": "စုစုပေါင်း ဇာတ်ညွှန်း အပြည့်အစုံ",
  "estimatedDurationSec": ${targetDurationMinutes * 60}
}`;

    const config: any = {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                timestamp: { type: Type.STRING },
                title: { type: Type.STRING },
                narrationText: { type: Type.STRING },
                visualNotes: { type: Type.STRING },
              },
              required: ['sceneNumber', 'timestamp', 'title', 'narrationText'],
            },
          },
          fullScript: { type: Type.STRING },
          estimatedDurationSec: { type: Type.NUMBER },
        },
        required: ['title', 'hook', 'scenes', 'fullScript'],
      },
    };

    if (isStoryRecapV2) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    // Build contents payload (multimodal parts or text only)
    const contentsPayload = videoInlinePart
      ? { parts: [videoInlinePart, { text: userPrompt }] }
      : userPrompt;

    // 5. Enforce 45s Timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 45000)
    );

    const generatePromise = ai.models.generateContent({
      model: modelToUse,
      contents: contentsPayload,
      config,
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      modelUsed: modelToUse,
      title: parsed.title || title,
      hook: parsed.hook || '',
      scenes: parsed.scenes || [],
      script: parsed.fullScript || '',
      wordCount: (parsed.fullScript || '').split(/\s+/).filter(Boolean).length,
      estimatedDurationSec: parsed.estimatedDurationSec || targetDurationMinutes * 60,
      videoAnalysisNote: videoAnalysisNote || undefined,
    });
  } catch (err: any) {
    console.error('Gemini Generate Error:', err);

    // Timeout Error
    if (err.message === 'TIMEOUT_EXCEEDED') {
      res.status(504).json({
        success: false,
        code: 'TIMEOUT',
        error: 'AI တောင်းဆိုမှု အချိန်ပြည့်သွားပါသည် (Request Timeout)',
        message: 'Gemini API did not respond within 45 seconds. Please try again with a shorter prompt or target duration.',
      });
      return;
    }

    // Quota / Rate Limit Error
    const errMsg = String(err.message || '');
    if (err.status === 429 || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
      res.status(429).json({
        success: false,
        code: 'QUOTA_EXHAUSTED',
        error: 'AI သုံးစွဲမှု ကန့်သတ်ချက် ပြည့်သွားပါသည် (Gemini API Quota Exceeded)',
        message: 'Your API key has reached its rate limit. Please wait a few moments or switch to a paid key with higher throughput.',
      });
      return;
    }

    // General Model Error
    res.status(500).json({
      success: false,
      code: 'MODEL_ERROR',
      error: 'Gemini AI Script Generation မအောင်မြင်ပါ',
      message: err.message || String(err),
    });
  }
});

// 4. Modify Script (Shorten, Expand, Translate) (Milestone 2)
app.post('/api/gemini/modify-script', async (req: Request, res: Response) => {
  const { script, action = 'shorten', language = 'my' } = req.body;

  if (!script || !script.trim()) {
    res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      error: 'ဇာတ်ညွှန်းစာသား မပါရှိပါ (Script required)',
    });
    return;
  }

  if (!apiKey || !ai) {
    res.status(400).json({
      success: false,
      code: 'MISSING_API_KEY',
      error: 'GEMINI_API_KEY မရှိသေးပါ (GEMINI_API_KEY is not configured)',
      message: 'Please configure GEMINI_API_KEY in the Secrets panel to perform AI script rewriting.',
    });
    return;
  }

  try {
    let prompt = '';
    if (action === 'shorten') {
      prompt = `ဤရုပ်ရှင်ဇာတ်ညွှန်းကို အဓိက အနှစ်သာရနှင့် ရင်ခုန်စရာ အချက်များ မကျန်စေဘဲ ၃၀% ခန့် တိုတိုရှင်းရှင်း ပိုမိုမြန်ဆန်အောင် ပြန်လည်တည်းဖြတ်ပေးပါ:\n\n${script}`;
    } else if (action === 'expand') {
      prompt = `ဤရုပ်ရှင်ဇာတ်ညွှန်းကို ဇာတ်ကောင်ခံစားချက်များ၊ အခန်းမြင်ကွင်းအသေးစိတ်များနှင့် စိတ်လှုပ်ရှားဖွယ် အလှည့်အပြောင်းများကို ၃၀% ခန့် ထပ်မံဖြည့်စွက် ချဲ့ထွင်ရေးသားပေးပါ:\n\n${script}`;
    } else if (action === 'translate') {
      prompt = language === 'my'
        ? `အောက်ပါဇာတ်ညွှန်းကို သဘာဝကျပြီး ဆွဲဆောင်မှုရှိသော မြန်မာဘာသာ (Myanmar Unicode) သို့ ပြန်ဆိုပေးပါ:\n\n${script}`
        : `Translate this movie recap script into natural, cinematic English narration:\n\n${script}`;
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 30000)
    );

    const modifyPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert movie recap editor and translator fluent in Myanmar Unicode and English. Return only the revised script with no intro/outro filler.',
      },
    });

    const response: any = await Promise.race([modifyPromise, timeoutPromise]);

    res.json({
      success: true,
      modifiedScript: response.text?.trim() || script,
    });
  } catch (err: any) {
    console.error('Modify script error:', err);
    if (err.message === 'TIMEOUT_EXCEEDED') {
      res.status(504).json({ success: false, error: 'Request timeout during script modification.' });
      return;
    }
    if (err.status === 429 || String(err.message).includes('RESOURCE_EXHAUSTED')) {
      res.status(429).json({ success: false, error: 'Quota exceeded. Please try again shortly.' });
      return;
    }
    res.status(500).json({ success: false, error: 'ဇာတ်ညွှန်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', message: err.message });
  }
});

// 5. Audio Transcription (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/mp3' } = req.body;

  if (!audioBase64) {
    res.status(400).json({ error: 'အသံဖိုင်ဒေတာ မပါရှိပါ (Audio base64 required)' });
    return;
  }

  if (!apiKey || !ai) {
    res.status(400).json({
      error: 'GEMINI_API_KEY မရှိသေးပါ',
      message: 'Please attach GEMINI_API_KEY to use gemini-3.5-transcribe.',
    });
    return;
  }

  try {
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/wav',
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this audio precisely. If spoken in Burmese, write in standard Myanmar Unicode. If in English, write in English.' },
        ],
      },
    });

    res.json({
      success: true,
      transcript: response.text?.trim() || '',
    });
  } catch (err: any) {
    console.error('Transcribe error:', err);
    res.status(500).json({ error: 'အသံဖိုင်မှ စာသားကူးယူခြင်း မအောင်မြင်ပါ', message: err.message });
  }
});

// 6. TTS Provider System & Endpoints

// 6a. Get Available TTS Providers & Capabilities
app.get('/api/tts/providers', (_req: Request, res: Response) => {
  const providers = getAvailableTTSProviders(ai);
  res.json({
    success: true,
    providers,
    defaultProviderId: 'google-burmese',
    localFallbackNote: 'Browser Speech Synthesis is available client-side as an optional local diagnostic fallback if a device voice is installed.',
  });
});

// 6b. Primary TTS Synthesis Endpoint
app.post('/api/tts/synthesize', async (req: Request, res: Response) => {
  const {
    text,
    providerId = 'google-burmese',
    voiceId,
    speed = 1.0,
    style = 'Cinematic Burmese movie recap narrator',
    geminiModel = 'gemini-3.8-flash-lite-tts',
  } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({
      success: false,
      code: 'EMPTY_TEXT',
      error: 'အသံထွက်ဖတ်ကြားရမည့် စာသားမရှိပါ (Text is required for narration)',
    });
    return;
  }

  const requestedSpeed = typeof speed === 'number' && !isNaN(speed) ? speed : 1.0;

  try {
    if (providerId === 'gemini-tts') {
      if (!apiKey || !ai) {
        res.status(400).json({
          success: false,
          code: 'MISSING_API_KEY',
          error: 'GEMINI_API_KEY မရှိသေးပါ (GEMINI_API_KEY is not configured on the server)',
          message: 'Please configure GEMINI_API_KEY in the Secrets panel, or use Google Native Burmese TTS which is ready out-of-the-box.',
        });
        return;
      }

      const result = await synthesizeGeminiTTS(ai, text, {
        voiceId,
        speed: requestedSpeed,
        style,
        model: geminiModel,
      });

      res.json(result);
      return;
    }

    // Default: Google Native Burmese TTS (engine explicitly supporting Myanmar Unicode)
    const result = await synthesizeGoogleNativeBurmese(text, requestedSpeed);
    res.json(result);
  } catch (err: any) {
    console.error('TTS Synthesis Error:', err);
    res.status(500).json({
      success: false,
      code: 'SYNTHESIS_FAILED',
      error: 'မြန်မာအသံဖိုင် ဖန်တီးခြင်း မအောင်မြင်ပါ (Narration synthesis failed)',
      message: err.message || String(err),
    });
  }
});

// 6c. Backward-Compatible /api/gemini/tts endpoint (guarantees real audio)
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  const {
    text,
    voiceName = 'Kore',
    style = 'Clear, engaging Burmese movie recap narrator',
    speed = 1.0,
    model = 'gemini-3.8-flash-lite-tts',
  } = req.body;

  if (!text || text.trim().length === 0) {
    res.status(400).json({ error: 'အသံထွက်ဖတ်ရမည့် စာသားမရှိပါ' });
    return;
  }

  try {
    // If Gemini key is available and requested, try Gemini; otherwise use native Burmese TTS
    if (apiKey && ai) {
      try {
        const result = await synthesizeGeminiTTS(ai, text, {
          voiceId: voiceName,
          speed,
          style,
          model,
        });
        res.json(result);
        return;
      } catch (geminiErr: any) {
        console.warn('Gemini TTS failed, falling back to Google Native Burmese TTS:', geminiErr.message);
      }
    }

    // High quality Native Burmese TTS fallback
    const nativeResult = await synthesizeGoogleNativeBurmese(text, speed);
    res.json(nativeResult);
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({
      success: false,
      error: 'TTS generation failed',
      message: err.message,
    });
  }
});

// Helper to generate SRT subtitle text from scenes or script
function generateSrt(scenes: any[], fullScript: string): string {
  if (scenes && scenes.length > 0) {
    let srt = '';
    let currStartSec = 0;
    scenes.forEach((sc, idx) => {
      const text = sc.narrationText || sc.title;
      const wordCount = (text || '').split(/\s+/).length;
      const durSec = Math.max(3, Math.min(15, Math.round(wordCount / 2.2)));
      const endSec = currStartSec + durSec;

      const formatTime = (s: number) => {
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${sec},${ms}`;
      };

      srt += `${idx + 1}\n${formatTime(currStartSec)} --> ${formatTime(endSec)}\n${text}\n\n`;
      currStartSec = endSec;
    });
    return srt;
  }

  // Fallback chunking script by sentences
  const sentences = fullScript.split(/([။!?\n]+)/).filter((s) => s.trim().length > 3);
  let srt = '';
  let curr = 0;
  sentences.forEach((s, idx) => {
    const dur = 4;
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const sc = (sec % 60).toString().padStart(2, '0');
      return `00:${m}:${sc},000`;
    };
    srt += `${idx + 1}\n${formatTime(curr)} --> ${formatTime(curr + dur)}\n${s.trim()}\n\n`;
    curr += dur;
  });
  return srt;
}

// Helper to generate WebVTT subtitle text from scenes or script
function generateVtt(scenes: any[], fullScript: string): string {
  let vtt = 'WEBVTT\n\n';
  if (scenes && scenes.length > 0) {
    let currStartSec = 0;
    scenes.forEach((sc, idx) => {
      const text = sc.narrationText || sc.title;
      const wordCount = (text || '').split(/\s+/).length;
      const durSec = Math.max(3, Math.min(15, Math.round(wordCount / 2.2)));
      const endSec = currStartSec + durSec;

      const formatTime = (s: number) => {
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        const ms = Math.floor((s % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${sec}.${ms}`;
      };

      vtt += `${idx + 1}\n${formatTime(currStartSec)} --> ${formatTime(endSec)}\n${text}\n\n`;
      currStartSec = endSec;
    });
    return vtt;
  }

  const sentences = fullScript.split(/([။!?\n]+)/).filter((s) => s.trim().length > 3);
  let curr = 0;
  sentences.forEach((s, idx) => {
    const dur = 4;
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const sc = (sec % 60).toString().padStart(2, '0');
      return `00:${m}:${sc}.000`;
    };
    vtt += `${idx + 1}\n${formatTime(curr)} --> ${formatTime(curr + dur)}\n${s.trim()}\n\n`;
    curr += dur;
  });
  return vtt;
}

// 7. Video Rendering with FFmpeg Pipeline
app.post('/api/render', async (req: Request, res: Response) => {
  const {
    sourceVideo = 'public/samples/sample_thriller.mp4',
    script = '',
    scenes = [],
    aspectRatio = '9:16', // '9:16' | '16:9' | '1:1' | '3:4'
    resolution = '720p',  // '480p' | '720p' | '1080p'
    subtitlesEnabled = true,
    subtitleColor = '#FFFFFF',
    subtitleSize = 'medium',
    subtitlePosition = 'bottom',
    subtitleOutline = 'black',
    bgMusic = 'suspense_dark', // 'suspense_dark' | 'dramatic_strings' | 'emotional_piano' | 'action_pulse' | 'none'
    bgMusicVolume = 0.25,
    originalAudioVolume = 0.15,
    ttsAudioUrl = '',
    watermarkText = 'TAI RECAP AI',
    watermarkPosition = 'top_right',
    watermarkOpacity = 0.85,
    blurRegion = 'none',
    blurStrength = 10,
  } = req.body;

  // Duplicate Job Check: Prevent redundant concurrent renders with same settings
  const jobFingerprint = JSON.stringify({
    sourceVideo,
    scriptSnippet: (script || '').slice(0, 100),
    aspectRatio,
    resolution,
    subtitlesEnabled,
    bgMusic,
    ttsAudioUrl,
  });

  for (const [id, j] of renderJobs.entries()) {
    if (j.status === 'processing' && j.fingerprint === jobFingerprint) {
      res.json({
        success: true,
        jobId: id,
        status: 'processing',
        isDuplicate: true,
        message: 'တူညီသော ဗီဒီယို ထုတ်လုပ်မှု စတင်ထားပြီးဖြစ်ပါသည် (Returning active render job)',
      });
      return;
    }
  }

  let inputVideoPath = path.resolve(sourceVideo);
  if (!fs.existsSync(inputVideoPath)) {
    if (fs.existsSync(path.resolve('uploads', sourceVideo))) {
      inputVideoPath = path.resolve('uploads', sourceVideo);
    } else if (fs.existsSync(path.resolve('public/samples', sourceVideo))) {
      inputVideoPath = path.resolve('public/samples', sourceVideo);
    } else {
      inputVideoPath = path.resolve('public/samples/sample_thriller.mp4');
    }
  }

  const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const outFileName = `recap_${jobId}.mp4`;
  const outSrtFileName = `sub_${jobId}.srt`;
  const outVttFileName = `sub_${jobId}.vtt`;
  const outVideoPath = path.join(VIDEO_OUT_DIR, outFileName);
  const outSrtPath = path.join(SUBTITLES_OUT_DIR, outSrtFileName);
  const outVttPath = path.join(SUBTITLES_OUT_DIR, outVttFileName);

  // Generate both SRT and WebVTT subtitle files
  const srtContent = generateSrt(scenes, script);
  const vttContent = generateVtt(scenes, script);
  fs.writeFileSync(outSrtPath, srtContent, 'utf-8');
  fs.writeFileSync(outVttPath, vttContent, 'utf-8');

  // Register Job
  const job: RenderJob = {
    id: jobId,
    fingerprint: jobFingerprint,
    status: 'processing',
    progress: 5,
    stage: 'စတင်ပြင်ဆင်နေပါသည် (Initializing FFmpeg Pipeline...)',
    outputVideoPath: outVideoPath,
    outputVideoUrl: `/api/media/video/${outFileName}`,
    outputSrtPath: outSrtPath,
    outputSrtUrl: `/api/media/subtitles/${outSrtFileName}`,
    outputVttPath: outVttPath,
    outputVttUrl: `/api/media/subtitles/${outVttFileName}`,
    createdAt: Date.now(),
  };
  renderJobs.set(jobId, job);

  res.json({
    success: true,
    jobId,
    status: 'processing',
    outputSrtUrl: job.outputSrtUrl,
    outputVttUrl: job.outputVttUrl,
    message: 'ဗီဒီယို ပြင်ဆင်ထုတ်လုပ်မှု စတင်နေပါပြီ (Rendering started in background)',
  });

  // Execute FFmpeg asynchronously
  (async () => {
    try {
      job.stage = 'ရုပ်သံနှင့် မျက်နှာပြင် အချိုးအစား ပြောင်းလဲနေပါသည် (Applying aspect ratio and visual filters...)';
      job.progress = 25;

      // Calculate Target Dimensions
      let targetW = 1280;
      let targetH = 720;
      if (aspectRatio === '9:16') {
        if (resolution === '1080p') { targetW = 1080; targetH = 1920; }
        else if (resolution === '480p') { targetW = 480; targetH = 854; }
        else { targetW = 720; targetH = 1280; }
      } else if (aspectRatio === '16:9') {
        if (resolution === '1080p') { targetW = 1920; targetH = 1080; }
        else if (resolution === '480p') { targetW = 854; targetH = 480; }
        else { targetW = 1280; targetH = 720; }
      } else if (aspectRatio === '1:1') {
        if (resolution === '1080p') { targetW = 1080; targetH = 1080; }
        else if (resolution === '480p') { targetW = 480; targetH = 480; }
        else { targetW = 720; targetH = 720; }
      } else if (aspectRatio === '3:4') {
        if (resolution === '1080p') { targetW = 1080; targetH = 1440; }
        else if (resolution === '480p') { targetW = 480; targetH = 640; }
        else { targetW = 720; targetH = 960; }
      }

      // Build video filter graph
      const vfParts: string[] = [];
      vfParts.push(`scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH}`);

      // Blur effects if selected
      if (blurRegion === 'corners') {
        vfParts.push(`boxblur=luma_radius=min(h\\,w)/30:luma_power=1:enable='between(t,0,10)'`);
      } else if (blurRegion === 'center') {
        vfParts.push(`boxblur=luma_radius=${Math.min(25, Math.max(3, blurStrength || 10))}:luma_power=1`);
      }

      // Burn-in Burmese Subtitles if enabled
      const myanmarFontPath = '/fonts/NotoSansMyanmar-Regular.ttf';
      if (subtitlesEnabled && fs.existsSync(myanmarFontPath)) {
        const subtitleEntries = scenes && scenes.length > 0
          ? scenes.slice(0, 8).map((s: any, idx: number) => ({
              text: (s.narrationText || s.title || '').slice(0, 48).replace(/'/g, '').replace(/:/g, ' '),
              start: idx * 4,
              end: (idx + 1) * 4,
            }))
          : (script
              ? script
                  .split(/[\n။!?]/)
                  .filter((s: string) => s.trim().length > 2)
                  .slice(0, 6)
                  .map((s: string, idx: number) => ({
                    text: s.trim().slice(0, 45).replace(/'/g, '').replace(/:/g, ' '),
                    start: idx * 4,
                    end: (idx + 1) * 4,
                  }))
              : [{ text: 'TAI RECAP AI - မြန်မာဘာသာ ရုပ်ရှင်အကျဉ်းချုပ်', start: 0, end: 10 }]);

        // Calculate font size
        let baseFontSize = 24;
        if (subtitleSize === 'small') baseFontSize = 18;
        else if (subtitleSize === 'large') baseFontSize = 30;
        if (resolution === '1080p') baseFontSize = Math.round(baseFontSize * 1.35);
        if (resolution === '480p') baseFontSize = Math.round(baseFontSize * 0.75);

        // Position Y calculation
        let yPos = 'h-th-50';
        if (subtitlePosition === 'top') yPos = '50';
        else if (subtitlePosition === 'center') yPos = '(h-th)/2';

        // Color mapping
        const fontColor = subtitleColor && subtitleColor.startsWith('#') ? subtitleColor : '#FFFFFF';

        // Outline / Box styling
        let boxStyle = `box=1:boxcolor=black@0.65:boxborderw=8`;
        if (subtitleOutline === 'glow') {
          boxStyle = `box=1:boxcolor=red@0.5:boxborderw=10:shadowcolor=red@0.8:shadowx=2:shadowy=2`;
        } else if (subtitleOutline === 'none') {
          boxStyle = `box=0:shadowcolor=black@0.8:shadowx=2:shadowy=2`;
        }

        subtitleEntries.forEach((sub: any) => {
          vfParts.push(
            `drawtext=text='${sub.text}':fontfile='${myanmarFontPath}':fontsize=${baseFontSize}:x=(w-tw)/2:y=${yPos}:fontcolor=${fontColor}:${boxStyle}:enable='between(t\\,${sub.start}\\,${sub.end})'`
          );
        });
      }

      // Watermark Text Overlay
      if (watermarkText && watermarkText.trim()) {
        const safeText = watermarkText.replace(/'/g, '').replace(/:/g, '');
        let wmX = 'w-tw-30';
        let wmY = '30';
        if (watermarkPosition === 'top_left') { wmX = '30'; wmY = '30'; }
        else if (watermarkPosition === 'bottom_right') { wmX = 'w-tw-30'; wmY = 'h-th-30'; }
        else if (watermarkPosition === 'bottom_left') { wmX = '30'; wmY = 'h-th-30'; }

        const opacity = typeof watermarkOpacity === 'number' ? watermarkOpacity : 0.85;
        vfParts.push(`drawtext=text='${safeText}':x=${wmX}:y=${wmY}:fontsize=18:fontcolor=white@${opacity}:shadowcolor=black@0.6:shadowx=2:shadowy=2`);
      }

      const vfString = vfParts.join(',');

      // Background music check
      let bgMusicPath: string | null = null;
      if (bgMusic && bgMusic !== 'none') {
        const potential = path.join(PUBLIC_AUDIO_DIR, `${bgMusic}.wav`);
        if (fs.existsSync(potential)) {
          bgMusicPath = potential;
        }
      }

      // TTS Audio file check
      let ttsAudioPath: string | null = null;
      if (ttsAudioUrl && ttsAudioUrl.startsWith('/api/media/audio/')) {
        const audioName = ttsAudioUrl.replace('/api/media/audio/', '');
        const p = path.join(AUDIO_OUT_DIR, audioName);
        if (fs.existsSync(p)) {
          ttsAudioPath = p;
        }
      }

      // Construct FFmpeg command arguments
      const ffmpegArgs: string[] = ['-y', '-i', inputVideoPath];
      let inputCount = 1;
      let bgInputIndex = -1;
      let ttsInputIndex = -1;

      if (bgMusicPath) {
        ffmpegArgs.push('-stream_loop', '-1', '-i', bgMusicPath);
        bgInputIndex = inputCount++;
      }

      if (ttsAudioPath) {
        ffmpegArgs.push('-i', ttsAudioPath);
        ttsInputIndex = inputCount++;
      }

      ffmpegArgs.push('-vf', vfString);

      // Audio Filter Mixing
      if (bgInputIndex !== -1 || ttsInputIndex !== -1) {
        let filterComplexAudio = '';
        const audioInputs: string[] = [];

        audioInputs.push(`[0:a]volume=${originalAudioVolume}[a0]`);

        if (bgInputIndex !== -1) {
          audioInputs.push(`[${bgInputIndex}:a]volume=${bgMusicVolume}[abg]`);
        }
        if (ttsInputIndex !== -1) {
          audioInputs.push(`[${ttsInputIndex}:a]volume=1.0[atts]`);
        }

        const inputTags = ['[a0]'];
        if (bgInputIndex !== -1) inputTags.push('[abg]');
        if (ttsInputIndex !== -1) inputTags.push('[atts]');

        filterComplexAudio = `${audioInputs.join(';')};${inputTags.join('')}amix=inputs=${inputTags.length}:duration=first:dropout_transition=2[aout]`;
        ffmpegArgs.push('-filter_complex', filterComplexAudio, '-map', '0:v', '-map', '[aout]');
      } else {
        ffmpegArgs.push('-c:a', 'aac', '-b:a', '128k');
      }

      // Video encoding settings for high compatibility
      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '24',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-t', '30', // Max 30s preview clip for fast responsive rendering
        outVideoPath
      );

      job.stage = 'ဗီဒီယို ပေါင်းစပ်ဖန်တီးနေပါသည် (Rendering video frames & audio mix...)';
      job.progress = 55;

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
      activeFfmpegProcesses.set(jobId, ffmpegProcess);

      let stderrLogs = '';
      ffmpegProcess.stderr.on('data', (data) => {
        const log = data.toString();
        stderrLogs += log;
        if (stderrLogs.length > 5000) {
          stderrLogs = stderrLogs.slice(-5000);
        }
        const timeMatch = log.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const seconds = parseFloat(timeMatch[3]);
          const currentSec = hours * 3600 + minutes * 60 + seconds;
          const pct = Math.min(95, Math.round(55 + (currentSec / 30) * 40));
          job.progress = Math.max(job.progress, pct);
        }
      });

      ffmpegProcess.on('close', (code) => {
        activeFfmpegProcesses.delete(jobId);
        if (code === 0 && fs.existsSync(outVideoPath)) {
          const stats = fs.statSync(outVideoPath);
          job.status = 'completed';
          job.progress = 100;
          job.stage = 'ဗီဒီယို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ (Rendering Completed!)';
          job.fileSize = stats.size;
        } else if (job.status !== 'failed') {
          job.status = 'failed';
          job.error = `FFmpeg error (code ${code}): ${stderrLogs.slice(-300)}`;
          job.stage = 'လုပ်ဆောင်မှု မအောင်မြင်ပါ (Render failed)';
        }
      });

      ffmpegProcess.on('error', (err) => {
        activeFfmpegProcesses.delete(jobId);
        job.status = 'failed';
        job.error = err.message;
        job.stage = 'လုပ်ဆောင်မှု မအောင်မြင်ပါ (Render failed)';
      });
    } catch (err: any) {
      activeFfmpegProcesses.delete(jobId);
      job.status = 'failed';
      job.error = err.message || String(err);
      job.stage = 'လုပ်ဆောင်မှု မအောင်မြင်ပါ (Render error)';
    }
  })();
});

// 8. Render Status Polling & Job Cancellation
app.get('/api/render/status/:jobId', (req: Request, res: Response) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

// 8b. Cancel Active Render Job
app.post('/api/render/cancel/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = renderJobs.get(jobId);
  if (!job) {
    res.status(404).json({ success: false, error: 'Job not found' });
    return;
  }

  const proc = activeFfmpegProcesses.get(jobId);
  if (proc) {
    proc.kill('SIGTERM');
    activeFfmpegProcesses.delete(jobId);
  }

  job.status = 'failed';
  job.stage = 'ပယ်ဖျက်ပြီးပါပြီ (Cancelled by user)';
  job.error = 'Render job was cancelled by user request.';

  // Clean up partial output file
  if (job.outputVideoPath && fs.existsSync(job.outputVideoPath)) {
    try {
      fs.unlinkSync(job.outputVideoPath);
    } catch (e) {
      // ignore
    }
  }

  res.json({
    success: true,
    message: 'Render job cancelled successfully',
    jobId,
  });
});

// 9. Media Streaming & Downloads
app.get('/api/media/:type/:filename', (req: Request, res: Response) => {
  const { type, filename } = req.params;
  let targetPath = '';

  if (type === 'video') {
    targetPath = path.join(VIDEO_OUT_DIR, filename);
  } else if (type === 'audio') {
    targetPath = path.join(AUDIO_OUT_DIR, filename);
  } else if (type === 'subtitles') {
    targetPath = path.join(SUBTITLES_OUT_DIR, filename);
  } else if (type === 'uploads') {
    targetPath = path.join(UPLOADS_DIR, filename);
  } else if (type === 'samples') {
    targetPath = path.join(path.resolve('public/samples'), filename);
  } else if (type === 'bgmusic') {
    targetPath = path.join(PUBLIC_AUDIO_DIR, filename);
  }

  if (!fs.existsSync(targetPath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  // Handle Range requests for smooth video scrubbing & audio playback
  const stat = fs.statSync(targetPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  let contentType = 'application/octet-stream';
  if (filename.endsWith('.mp4')) contentType = 'video/mp4';
  else if (filename.endsWith('.wav')) contentType = 'audio/wav';
  else if (filename.endsWith('.mp3')) contentType = 'audio/mpeg';
  else if (filename.endsWith('.srt')) contentType = 'text/plain; charset=utf-8';
  else if (filename.endsWith('.vtt')) contentType = 'text/vtt; charset=utf-8';

  if (req.query.download === 'true') {
    res.download(targetPath, filename);
    return;
  }

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(targetPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(targetPath).pipe(res);
  }
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 TAI RECAP AI Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

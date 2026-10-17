import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import { GoogleGenAI } from '@google/genai';

const execAsync = promisify(exec);

export interface TTSVoice {
  id: string;
  name: string;
  nameMy: string;
  gender: 'female' | 'male' | 'neutral';
  description: string;
}

export interface TTSProviderInfo {
  id: string;
  name: string;
  nameMy: string;
  description: string;
  supportsBurmese: boolean;
  available: boolean;
  reasonUnavailable?: string;
  supportsVoices: boolean;
  supportedVoices: TTSVoice[];
  supportsSpeed: boolean;
  speedRange: { min: number; max: number; default: number; step: number };
  requiresApiKey: boolean;
  isDefault: boolean;
}

export interface SynthesizeOptions {
  text: string;
  providerId?: string;
  voiceId?: string;
  speed?: number; // 0.5 to 2.0
  style?: string;
  geminiModel?: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
}

export interface SynthesizeResult {
  success: boolean;
  providerId: string;
  providerName: string;
  audioUrl: string;
  filePath: string;
  filename: string;
  mimeType: string;
  format: 'mp3' | 'wav';
  durationSec: number;
  fileSizeBytes: number;
  segmentsProcessed: number;
  speedApplied: number;
  validation: {
    isValid: boolean;
    hasAudioStream: boolean;
    sampleRate: number;
    channels: number;
    codec: string;
  };
}

// Ensure audio directory exists
const AUDIO_DIR = path.resolve('outputs/audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

/**
 * Validates any audio file using ffprobe.
 * Throws or returns detailed audio metadata.
 */
export async function validateAudioFile(filePath: string): Promise<{
  isValid: boolean;
  durationSec: number;
  sizeBytes: number;
  codec: string;
  sampleRate: number;
  channels: number;
}> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio validation failed: file does not exist at ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (stat.size < 200) {
    throw new Error(`Audio validation failed: file size (${stat.size} bytes) is too small to be valid audio.`);
  }

  try {
    const probeCmd = `ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate,duration:format=duration,size -of json "${filePath}"`;
    const { stdout } = await execAsync(probeCmd);
    const probe = JSON.parse(stdout);

    const stream = probe.streams?.[0];
    if (!stream) {
      throw new Error('Validation failed: No audio stream detected in output file.');
    }

    const duration = parseFloat(stream.duration || probe.format?.duration || '0');
    if (isNaN(duration) || duration <= 0.05) {
      throw new Error(`Validation failed: Audio duration is invalid (${duration}s).`);
    }

    return {
      isValid: true,
      durationSec: Number(duration.toFixed(2)),
      sizeBytes: stat.size,
      codec: stream.codec_name || 'unknown',
      sampleRate: parseInt(stream.sample_rate || '24000', 10),
      channels: parseInt(stream.channels || '1', 10),
    };
  } catch (err: any) {
    throw new Error(`Audio integrity validation failed: ${err.message}`);
  }
}

/**
 * Intelligent Burmese script chunker.
 * Splits on Burmese punctuation:
 *  - '။' (Section end / full stop)
 *  - '၊' (Comma / pause)
 *  - '\n' (Newlines)
 * Keeps chunks under maxChars (default ~140 chars) while preserving word and phrase boundaries.
 */
export function chunkBurmeseText(text: string, maxChars: number = 140): string[] {
  const clean = text
    .replace(/\r\n/g, '\n')
    .replace(/\[[^\]]+\]/g, ' ') // Strip timestamp headers like [0:00 - 0:15]
    .trim();

  if (!clean) return [];

  // Split on paragraph or full stop first
  const initialSections = clean.split(/(?<=[။\n])/);
  const chunks: string[] = [];

  for (const section of initialSections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChars) {
      chunks.push(trimmed);
      continue;
    }

    // Split further on comma '၊'
    const subSections = trimmed.split(/(?<=[၊])/);
    let currentChunk = '';

    for (const sub of subSections) {
      const subTrimmed = sub.trim();
      if (!subTrimmed) continue;

      if ((currentChunk + ' ' + subTrimmed).trim().length <= maxChars) {
        currentChunk = currentChunk ? `${currentChunk} ${subTrimmed}` : subTrimmed;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        if (subTrimmed.length <= maxChars) {
          currentChunk = subTrimmed;
        } else {
          // If still longer, break on spaces or chunk safely
          const words = subTrimmed.split(/\s+/);
          for (const word of words) {
            if ((currentChunk + ' ' + word).trim().length <= maxChars) {
              currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = word;
            }
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }
  }

  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Downloads a single chunk from Google Native Burmese TTS.
 */
function fetchGoogleTTSChunk(chunkText: string, lang: string = 'my'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      lang
    )}&client=tw-ob&q=${encodeURIComponent(chunkText)}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Google Burmese TTS request failed with HTTP status ${res.statusCode}`));
          return;
        }

        const data: Buffer[] = [];
        res.on('data', (d) => data.push(d));
        res.on('end', () => {
          const buffer = Buffer.concat(data);
          if (buffer.length < 100) {
            reject(new Error('Google Burmese TTS returned empty audio response.'));
            return;
          }
          resolve(buffer);
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Google Burmese TTS request timed out.'));
    });
  });
}

/**
 * Synthesizes Burmese script using Google Native Burmese TTS engine.
 * Features:
 * - Direct Myanmar Unicode voice model support
 * - Automatic chunking and multi-part stitching
 * - Tempo/speed scaling via FFmpeg `atempo`
 * - Audio validation with ffprobe
 */
export async function synthesizeGoogleNativeBurmese(
  text: string,
  speed: number = 1.0,
  onProgress?: (progress: number, message: string) => void
): Promise<SynthesizeResult> {
  const chunks = chunkBurmeseText(text, 140);
  if (chunks.length === 0) {
    throw new Error('စာသား မပါရှိပါ (No text provided for Burmese narration)');
  }

  onProgress?.(10, `စာသားကို အပိုင်း ${chunks.length} ပိုင်း ခွဲခြားပြီးဖြစ်ပါသည်`);

  const tempFiles: string[] = [];
  const sessionId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  try {
    // 1. Fetch each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const progressPercent = Math.round(15 + (i / chunks.length) * 55);
      onProgress?.(
        progressPercent,
        `မြန်မာအသံဖိုင် အပိုင်း ${i + 1}/${chunks.length} ကို ဖန်တီးနေပါသည်...`
      );

      const buffer = await fetchGoogleTTSChunk(chunk, 'my');
      const tempPath = path.join(AUDIO_DIR, `temp_${sessionId}_part_${i}.mp3`);
      fs.writeFileSync(tempPath, buffer);
      tempFiles.push(tempPath);
    }

    onProgress?.(75, 'အသံအပိုင်းများကို ချိတ်ဆက်ပြီး အမြန်နှုန်း ညှိယူနေပါသည်...');

    // 2. Stitch chunks and apply speed (atempo) using FFmpeg
    const outFilename = `burmese_narration_${sessionId}.mp3`;
    const outPath = path.join(AUDIO_DIR, outFilename);

    let ffmpegCmd = '';
    // Format speed between 0.5 and 2.0
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed || 1.0));
    const speedFilter = clampedSpeed !== 1.0 ? `-filter:a "atempo=${clampedSpeed.toFixed(2)}"` : '';

    if (tempFiles.length === 1) {
      if (speedFilter) {
        ffmpegCmd = `ffmpeg -y -i "${tempFiles[0]}" ${speedFilter} -c:a libmp3lame -q:a 2 "${outPath}"`;
      } else {
        // Just copy
        fs.copyFileSync(tempFiles[0], outPath);
      }
    } else {
      // Concat list file
      const listFilePath = path.join(AUDIO_DIR, `concat_${sessionId}.txt`);
      const listContent = tempFiles.map((p) => `file '${p}'`).join('\n');
      fs.writeFileSync(listFilePath, listContent);
      tempFiles.push(listFilePath);

      ffmpegCmd = `ffmpeg -y -f concat -safe 0 -i "${listFilePath}" ${speedFilter} -c:a libmp3lame -q:a 2 "${outPath}"`;
    }

    if (ffmpegCmd) {
      await execAsync(ffmpegCmd);
    }

    onProgress?.(90, 'ဖန်တီးထားသော အသံဖိုင် အရည်အသွေးကို စစ်ဆေးနေပါသည်...');

    // 3. Strict Validation with ffprobe
    const validation = await validateAudioFile(outPath);

    onProgress?.(100, 'မြန်မာအသံဖိုင် ဖန်တီးမှု အောင်မြင်ပါသည်!');

    return {
      success: true,
      providerId: 'google-burmese',
      providerName: 'Google Native Burmese TTS',
      audioUrl: `/api/media/audio/${outFilename}`,
      filePath: outPath,
      filename: outFilename,
      mimeType: 'audio/mpeg',
      format: 'mp3',
      durationSec: validation.durationSec,
      fileSizeBytes: validation.sizeBytes,
      segmentsProcessed: chunks.length,
      speedApplied: clampedSpeed,
      validation: {
        isValid: true,
        hasAudioStream: true,
        sampleRate: validation.sampleRate,
        channels: validation.channels,
        codec: validation.codec,
      },
    };
  } finally {
    // Cleanup temporary chunk files
    tempFiles.forEach((p) => {
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch (e) {
        /* ignore */
      }
    });
  }
}

/**
 * Synthesizes speech using Google GenAI SDK (Gemini 3.8 Flash TTS).
 */
export async function synthesizeGeminiTTS(
  ai: GoogleGenAI | null,
  text: string,
  options: {
    voiceId?: string;
    speed?: number;
    style?: string;
    model?: 'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts';
  },
  onProgress?: (progress: number, message: string) => void
): Promise<SynthesizeResult> {
  if (!ai || !process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please switch to Google Native Burmese TTS or configure your key.');
  }

  const validVoices = ['Kore', 'Fenrir', 'Puck', 'Charon', 'Zephyr'];
  const voice = validVoices.includes(options.voiceId || '') ? options.voiceId! : 'Kore';
  const modelToUse = options.model === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
  const speed = Math.max(0.5, Math.min(2.0, options.speed || 1.0));

  onProgress?.(20, `Gemini TTS စနစ်သို့ စာသား ပေးပို့နေပါသည် (${voice})...`);

  const cleanText = text.slice(0, 3500);

  const response = await ai.models.generateContent({
    model: modelToUse,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: cleanText,
            speechMetadata: {
              style: `${options.style || 'Cinematic movie recap narrator'}. Speaking rate: ${speed}x.`,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  onProgress?.(70, 'Gemini အသံဖိုင် ရယူပြီး စစ်ဆေးနေပါသည်...');

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Gemini TTS model did not return audio data.');
  }

  const sessionId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const outFilename = `gemini_tts_${voice}_${sessionId}.wav`;
  const outPath = path.join(AUDIO_DIR, outFilename);

  const wavBuffer = Buffer.from(base64Audio, 'base64');
  fs.writeFileSync(outPath, wavBuffer);

  onProgress?.(90, 'အသံဖိုင် အရည်အသွေး စစ်ဆေးနေပါသည်...');

  const validation = await validateAudioFile(outPath);

  onProgress?.(100, 'Gemini အသံဖိုင် ဖန်တီးပြီးစီးပါပြီ!');

  return {
    success: true,
    providerId: 'gemini-tts',
    providerName: `Gemini 3.8 Flash TTS (${voice})`,
    audioUrl: `/api/media/audio/${outFilename}`,
    filePath: outPath,
    filename: outFilename,
    mimeType: 'audio/wav',
    format: 'wav',
    durationSec: validation.durationSec,
    fileSizeBytes: validation.sizeBytes,
    segmentsProcessed: 1,
    speedApplied: speed,
    validation: {
      isValid: true,
      hasAudioStream: true,
      sampleRate: validation.sampleRate,
      channels: validation.channels,
      codec: validation.codec,
    },
  };
}

/**
 * Returns all configured TTS Providers with their capabilities.
 */
export function getAvailableTTSProviders(ai: GoogleGenAI | null): TTSProviderInfo[] {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasGoogleCloudKey = Boolean(process.env.GOOGLE_TTS_API_KEY && process.env.GOOGLE_TTS_API_KEY.trim());

  return [
    {
      id: 'google-burmese',
      name: 'Google Native Burmese TTS',
      nameMy: 'Google မြန်မာဘာသာ တိုက်ရိုက် စကားပြောစနစ် (Native)',
      description: 'Native Burmese pronunciation engine with high accuracy Myanmar phoneme support and automatic sentence stitching.',
      supportsBurmese: true,
      available: true,
      supportsVoices: false,
      supportedVoices: [
        {
          id: 'my-native-default',
          name: 'Burmese Natural Narrator',
          nameMy: 'မြန်မာဘာသာ သဘာဝဇာတ်လမ်းပြော အသံ',
          gender: 'female',
          description: 'Official Myanmar Unicode pronunciation engine',
        },
      ],
      supportsSpeed: true,
      speedRange: { min: 0.75, max: 1.5, default: 1.0, step: 0.05 },
      requiresApiKey: false,
      isDefault: true,
    },
    {
      id: 'gemini-tts',
      name: 'Gemini 3.8 Flash TTS',
      nameMy: 'Google Gemini 3.8 Flash AI အသံစနစ်',
      description: 'Multilingual neural voice studio with distinct personality personas.',
      supportsBurmese: true,
      available: hasGeminiKey,
      reasonUnavailable: hasGeminiKey ? undefined : 'GEMINI_API_KEY is not configured in server environment secrets.',
      supportsVoices: true,
      supportedVoices: [
        { id: 'Kore', name: 'Kore', nameMy: 'Kore (ဇာတ်လမ်းပြော မူလစံနှုန်း)', gender: 'female', description: 'Balanced cinematic narrator tone' },
        { id: 'Fenrir', name: 'Fenrir', nameMy: 'Fenrir (သည်းထိတ်ရင်ဖို နက်ရှိုင်းသောအသံ)', gender: 'male', description: 'Deep, intense thriller narration' },
        { id: 'Puck', name: 'Puck', nameMy: 'Puck (အရှိန်မြန် ဗိုင်းရပ်စ်အသံ)', gender: 'male', description: 'Fast, engaging short-form tempo' },
        { id: 'Zephyr', name: 'Zephyr', nameMy: 'Zephyr (နူးညံ့ငြိမ်းချမ်းသော မှတ်တမ်းအသံ)', gender: 'female', description: 'Warm, emotional documentary tone' },
        { id: 'Charon', name: 'Charon', nameMy: 'Charon (ပြတ်သားသော အစီရင်ခံအသံ)', gender: 'male', description: 'Authoritative dramatic voice' },
      ],
      supportsSpeed: true,
      speedRange: { min: 0.75, max: 1.5, default: 1.0, step: 0.05 },
      requiresApiKey: true,
      isDefault: false,
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Text-to-Speech (my-MM)',
      nameMy: 'Google Cloud Text-to-Speech (my-MM-Standard-A)',
      description: 'Enterprise Cloud TTS with standard my-MM-Standard-A voice model.',
      supportsBurmese: true,
      available: hasGoogleCloudKey,
      reasonUnavailable: hasGoogleCloudKey ? undefined : 'GOOGLE_TTS_API_KEY is optional and not currently configured on server.',
      supportsVoices: true,
      supportedVoices: [
        { id: 'my-MM-Standard-A', name: 'my-MM-Standard-A', nameMy: 'မြန်မာအသံ Standard-A (Female)', gender: 'female', description: 'Cloud TTS WaveNet model' },
      ],
      supportsSpeed: true,
      speedRange: { min: 0.5, max: 2.0, default: 1.0, step: 0.05 },
      requiresApiKey: true,
      isDefault: false,
    },
  ];
}

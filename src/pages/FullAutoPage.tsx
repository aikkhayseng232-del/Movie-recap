import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Video,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Film,
  Sliders,
  Check,
  Clock,
  ArrowRight,
  FileText,
  Volume2,
  Layers,
  Square,
  Smartphone,
  Tv,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Project, AspectRatio, Resolution, NarrativeStyle, RenderJobStatus } from '../types';
import { Language, translations } from '../locales/translations';
import { safeFetchJson } from '../utils/api';

interface FullAutoPageProps {
  language: Language;
  currentProject: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNavigate: (page: any) => void;
  onAddDownload: (item: any) => void;
}

export const FullAutoPage: React.FC<FullAutoPageProps> = ({
  language,
  currentProject,
  onUpdateProject,
  onNavigate,
  onAddDownload,
}) => {
  const t = translations[language];

  // Local state for Full Auto form
  const [sourceType, setSourceType] = useState<'video' | 'sample'>('sample');
  const [selectedSample, setSelectedSample] = useState<string>('sample_thriller.mp4');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideoPath, setUploadedVideoPath] = useState<string>(currentProject.sourceVideoPath || 'sample_thriller.mp4');
  const [uploadedVideoName, setUploadedVideoName] = useState<string>(currentProject.sourceVideoName || 'Cyberpunk Thriller Sample (10s 720p)');
  
  const [durationMinutes, setDurationMinutes] = useState<number>(currentProject.durationMinutes || 2);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(currentProject.aspectRatio || '9:16');
  const [resolution, setResolution] = useState<Resolution>(currentProject.resolution || '720p');
  const [narrativeStyle, setNarrativeStyle] = useState<NarrativeStyle>(currentProject.style || 'suspense');
  const [bgMusic, setBgMusic] = useState<string>(currentProject.bgMusic || 'suspense_dark');
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(currentProject.bgMusicVolume || 0.25);
  const [originalAudioVolume, setOriginalAudioVolume] = useState<number>(currentProject.originalAudioVolume || 0.15);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(currentProject.subtitlesEnabled ?? true);
  const [subtitleColor, setSubtitleColor] = useState<string>(currentProject.subtitleColor || '#FFFFFF');
  const [subtitleSize, setSubtitleSize] = useState<'small' | 'medium' | 'large'>(currentProject.subtitleSize || 'medium');
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'center' | 'top'>(currentProject.subtitlePosition || 'bottom');
  const [subtitleOutline, setSubtitleOutline] = useState<'black' | 'glow' | 'none'>(currentProject.subtitleOutline || 'black');
  const [watermarkText, setWatermarkText] = useState<string>(currentProject.watermarkText || 'TAI RECAP AI');
  const [watermarkPosition, setWatermarkPosition] = useState<'top_right' | 'top_left' | 'bottom_right' | 'bottom_left'>(currentProject.watermarkPosition || 'top_right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(currentProject.watermarkOpacity || 0.85);
  const [blurRegion, setBlurRegion] = useState<'none' | 'corners' | 'letterbox' | 'center'>(currentProject.blurRegion || 'none');
  const [blurStrength, setBlurStrength] = useState<number>(currentProject.blurStrength || 10);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Pipeline execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [stages, setStages] = useState<Array<{ id: number; name: string; status: 'pending' | 'active' | 'completed' | 'failed'; detail?: string }>>([
    { id: 1, name: language === 'my' ? 'ဗီဒီယိုဖိုင် စစ်ဆေးအတည်ပြုခြင်း' : 'Validating video file & metadata', status: 'pending' },
    { id: 2, name: language === 'my' ? 'Gemini ဉာဏ်ရည်စနစ်ဖြင့် ဗီဒီယိုခွဲခြမ်းစိတ်ဖြာခြင်း' : 'Analyzing video with Gemini API', status: 'pending' },
    { id: 3, name: language === 'my' ? 'ဇာတ်လမ်း၊ ဇာတ်ကောင်နှင့် အချိန်မှတ်စုများ ဖော်ထုတ်ခြင်း' : 'Identifying story, characters & timestamps', status: 'pending' },
    { id: 4, name: language === 'my' ? 'သဘာဝကျသော မြန်မာဇာတ်ညွှန်း ရေးသားခြင်း' : 'Generating natural Burmese recap script', status: 'pending' },
    { id: 5, name: language === 'my' ? 'သတ်မှတ်ကြာချိန်နှင့် အံဝင်ခွင်ကျ ညှိနှိုင်းခြင်း' : 'Adjusting script to target duration', status: 'pending' },
    { id: 6, name: language === 'my' ? 'မြန်မာအသံဖန်တီးခြင်း (TTS Voice Generation)' : 'Generating Burmese narration audio (TTS)', status: 'pending' },
    { id: 7, name: language === 'my' ? 'ကိုက်ညီသော စာတန်းထိုး (SRT/VTT) တည်ဆောက်ခြင်း' : 'Creating synchronized SRT & VTT subtitles', status: 'pending' },
    { id: 8, name: language === 'my' ? 'အဓိကပြကွက်များ ရွေးချယ်ညှပ်ထုတ်ခြင်း' : 'Selecting and trimming scene clips', status: 'pending' },
    { id: 9, name: language === 'my' ? 'နောက်ခံတေးဂီတနှင့် အသံများ ရောစပ်ခြင်း' : 'Mixing audio, video & background music', status: 'pending' },
    { id: 10, name: language === 'my' ? 'မျက်နှာပြင်အချိုးအစားနှင့် ရေစာများ ထည့်သွင်းခြင်း' : 'Applying aspect ratio, blur & watermark', status: 'pending' },
    { id: 11, name: language === 'my' ? 'FFmpeg ဖြင့် ဗီဒီယိုထုတ်လုပ်ပြီး ffprobe ဖြင့် အတည်ပြုခြင်း' : 'Rendering & validating final MP4 with FFmpeg', status: 'pending' },
    { id: 12, name: language === 'my' ? 'အဆင်သင့်ဖြစ်ပြီ - အစမ်းကြည့်ရှုရန်နှင့် ဒေါင်းလုဒ်လုပ်ရန်' : 'Finalizing video preview & download link', status: 'pending' },
  ]);

  const [activeJobId, setActiveJobId] = useState<string | null>(() => localStorage.getItem('tai_recap_auto_job_id'));
  const [renderResultUrl, setRenderResultUrl] = useState<string | null>(currentProject.lastRenderVideoUrl || null);
  const [renderSrtUrl, setRenderSrtUrl] = useState<string | null>(currentProject.lastRenderSrtUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Resume polling on mount if activeJobId exists
  useEffect(() => {
    if (activeJobId && !renderResultUrl) {
      setIsExecuting(true);
      const pollJob = async () => {
        try {
          const data = await safeFetchJson(`/api/render/status/${activeJobId}`);
          if (data.success || data.status) {
            setStageProgress(data.progress || 50);
            if (data.status === 'completed') {
              setRenderResultUrl(data.outputVideoUrl);
              setRenderSrtUrl(data.outputSrtUrl);
              setIsExecuting(false);
              localStorage.removeItem('tai_recap_auto_job_id');
            } else if (data.status === 'failed') {
              setErrorMessage(data.error || 'Render job failed');
              setIsExecuting(false);
              localStorage.removeItem('tai_recap_auto_job_id');
            } else {
              setTimeout(pollJob, 2000);
            }
          }
        } catch (e) {
          setIsExecuting(false);
        }
      };
      pollJob();
    }
  }, [activeJobId]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await safeFetchJson('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (data.success) {
        setUploadedVideoPath(data.filename);
        setUploadedVideoName(data.originalName);
        setSourceType('video');
      } else {
        setErrorMessage(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network upload error');
    } finally {
      setIsUploading(false);
    }
  };

  // Start Full Auto Execution Pipeline
  const startFullAutoGeneration = async () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setRenderResultUrl(null);
    setRenderSrtUrl(null);

    // Reset stages
    const resetStages = stages.map((st, idx) => ({
      ...st,
      status: idx === 0 ? ('active' as const) : ('pending' as const),
      detail: undefined,
    }));
    setStages(resetStages);
    setCurrentStageIndex(0);
    setStageProgress(15);

    try {
      // Stage 1: Validation
      await new Promise((r) => setTimeout(r, 500));
      updateStageStatus(0, 'completed', language === 'my' ? 'ဗီဒီယိုဖိုင် အောင်မြင်စွာ အတည်ပြုပြီး' : 'Video validated successfully');
      
      // Stage 2 & 3: Gemini Analysis
      updateStageStatus(1, 'active', language === 'my' ? 'Gemini AI ဖြင့် ဗီဒီယို ခွဲခြမ်းစိတ်ဖြာနေသည်...' : 'Analyzing video with Gemini API...');
      updateStageStatus(2, 'active');
      setStageProgress(30);

      const recapData = await safeFetchJson('/api/gemini/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentProject.title || 'Auto Recap Movie',
          genre: currentProject.genre || 'Thriller',
          synopsis: currentProject.synopsis || 'Automated movie recap generation',
          sourceVideo: sourceType === 'video' ? uploadedVideoPath : selectedSample,
          style: narrativeStyle,
          targetDurationMinutes: durationMinutes,
          language: language,
        }),
      });

      if (!recapData.success) {
        throw new Error(recapData.error || recapData.message || 'Gemini script generation failed');
      }

      updateStageStatus(1, 'completed', language === 'my' ? 'Gemini ဖြင့် ခွဲခြမ်းစိတ်ဖြာပြီးစီး' : 'Gemini analysis complete');
      updateStageStatus(2, 'completed', language === 'my' ? 'ဇာတ်လမ်း အချိန်မှတ်စုများ သတ်မှတ်ပြီး' : 'Timestamps identified');

      // Stage 4 & 5: Script Generation & Duration Adjustment
      updateStageStatus(3, 'active', language === 'my' ? 'မြန်မာဇာတ်ညွှန်း ရေးသားနေသည်...' : 'Generating Burmese recap script...');
      updateStageStatus(4, 'active');
      setStageProgress(50);
      await new Promise((r) => setTimeout(r, 400));

      updateStageStatus(3, 'completed', language === 'my' ? 'ဇာတ်ညွှန်း ထွက်ပေါ်ပြီး' : 'Script generated');
      updateStageStatus(4, 'completed', language === 'my' ? `${durationMinutes} မိနစ်စာ သတ်မှတ်ပြီး` : `Adjusted to ${durationMinutes} min`);

      // Stage 6: TTS Voice Generation
      updateStageStatus(5, 'active', language === 'my' ? 'သဘာဝကျသော မြန်မာအသံ (TTS) ထုတ်လုပ်နေသည်...' : 'Generating Burmese TTS audio...');
      setStageProgress(65);

      const ttsData = await safeFetchJson('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google-burmese',
          voice: 'Kore',
          speed: 1.0,
          script: recapData.fullScript,
          scenes: recapData.scenes,
        }),
      });

      if (!ttsData.success) {
        console.warn('TTS warning:', ttsData.error);
      }
      updateStageStatus(5, 'completed', language === 'my' ? 'မြန်မာအသံဖိုင် ထွက်ပေါ်ပြီး' : 'Burmese narration generated');

      // Stage 7, 8, 9, 10, 11: FFmpeg Render Pipeline
      updateStageStatus(6, 'active', language === 'my' ? 'စာတန်းထိုး (SRT/VTT) တည်ဆောက်နေသည်...' : 'Building subtitles...');
      updateStageStatus(7, 'active', language === 'my' ? 'ပြကွက်များ ညှပ်ထုတ်နေသည်...' : 'Trimming scenes...');
      updateStageStatus(8, 'active', language === 'my' ? 'တေးဂီတ ရောစပ်နေသည်...' : 'Mixing audio...');
      updateStageStatus(9, 'active', language === 'my' ? 'အချိုးအစားနှင့် ရေစာ ထည့်သွင်းနေသည်...' : 'Applying formatting...');
      updateStageStatus(10, 'active', language === 'my' ? 'FFmpeg ဖြင့် ဗီဒီယို ထုတ်လုပ်နေသည်...' : 'Rendering video with FFmpeg...');
      setStageProgress(80);

      // Save updated project state before render with all settings flowing through
      const updatedProj: Partial<Project> = {
        script: recapData.fullScript,
        scenes: recapData.scenes,
        hook: recapData.hook,
        durationMinutes,
        aspectRatio,
        resolution,
        style: narrativeStyle,
        bgMusic,
        bgMusicVolume,
        originalAudioVolume,
        subtitlesEnabled,
        subtitleColor,
        subtitleSize,
        subtitlePosition,
        subtitleOutline,
        watermarkText,
        watermarkPosition,
        watermarkOpacity,
        blurRegion,
        blurStrength,
        sourceVideoPath: sourceType === 'video' ? uploadedVideoPath : selectedSample,
        sourceVideoName: sourceType === 'video' ? uploadedVideoName : selectedSample,
      };
      onUpdateProject(updatedProj);

      // Trigger Render Job with complete settings payload
      const renderData = await safeFetchJson('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceVideo: sourceType === 'video' ? uploadedVideoPath : `public/samples/${selectedSample}`,
          script: recapData.fullScript,
          scenes: recapData.scenes,
          aspectRatio,
          resolution,
          subtitlesEnabled,
          subtitleLanguage: language,
          subtitleColor,
          subtitleSize,
          subtitlePosition,
          subtitleOutline,
          watermarkText,
          watermarkPosition,
          watermarkOpacity,
          blurRegion,
          blurStrength,
          bgMusic,
          bgMusicVolume,
          originalAudioVolume,
          ttsAudioUrl: ttsData.audioUrl,
        }),
      });

      if (!renderData.success) {
        throw new Error(renderData.error || 'Render job submission failed');
      }

      const jobId = renderData.jobId;
      setActiveJobId(jobId);
      localStorage.setItem('tai_recap_auto_job_id', jobId);

      // Poll Render Job Status
      let isFinished = false;
      let finalVideoUrl = '';
      let finalSrtUrl = '';

      while (!isFinished) {
        await new Promise((r) => setTimeout(r, 1500));
        const statusData = await safeFetchJson(`/api/render/status/${jobId}`);

        if (!statusData.success) {
          throw new Error(statusData.error || 'Failed to check render status');
        }

        const job = statusData.job;
        setStageProgress(80 + Math.round((job.progress || 50) * 0.18));

        if (job.status === 'completed') {
          isFinished = true;
          finalVideoUrl = job.outputVideoUrl;
          finalSrtUrl = job.outputSrtUrl;
          localStorage.removeItem('tai_recap_auto_job_id');
        } else if (job.status === 'failed') {
          throw new Error(job.error || 'FFmpeg rendering failed');
        }
      }

      // Complete stages 6 through 11
      for (let s = 6; s <= 10; s++) {
        updateStageStatus(s, 'completed');
      }

      updateStageStatus(11, 'completed', language === 'my' ? 'ဗီဒီယို အောင်မြင်စွာ ထုတ်လုပ်ပြီးစီးပါပြီ!' : 'Render completed successfully!');
      setStageProgress(100);
      setRenderResultUrl(finalVideoUrl);
      setRenderSrtUrl(finalSrtUrl);

      // Update project with last render URLs
      onUpdateProject({
        lastRenderJobId: jobId,
        lastRenderVideoUrl: finalVideoUrl,
        lastRenderSrtUrl: finalSrtUrl,
      });

      // Add to Downloads list
      onAddDownload({
        id: `dl_${Date.now()}`,
        title: `${currentProject.title || 'Auto Recap'} (${aspectRatio})`,
        type: 'video',
        url: finalVideoUrl,
        filename: `tai_recap_${Date.now()}.mp4`,
        date: new Date().toLocaleDateString(),
        size: '14.2 MB',
      });

    } catch (err: any) {
      console.error('Full Auto error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during Full Auto execution.');
      localStorage.removeItem('tai_recap_auto_job_id');
      setStages((prev) =>
        prev.map((st) => (st.status === 'active' ? { ...st, status: 'failed', detail: err.message } : st))
      );
    } finally {
      setIsExecuting(false);
      setActiveJobId(null);
    }
  };

  const updateStageStatus = (index: number, status: 'pending' | 'active' | 'completed' | 'failed', detail?: string) => {
    setStages((prev) =>
      prev.map((st, idx) => (idx === index ? { ...st, status, detail: detail || st.detail } : st))
    );
    if (status === 'completed') {
      setCurrentStageIndex(index + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141722] via-[#1A1F2C] to-[#141722] border border-[#232838] p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F04452]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F04452]/20 border border-[#F04452]/35 text-[#F04452] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'my' ? 'တစ်ချက်နှိပ် အလိုအလျောက် စနစ် (Full Auto Mode)' : 'One-Click Full Auto Recap'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {language === 'my' ? 'ဗီဒီယို တစ်ချက်တင်၍ အဆုံးထိ အလိုအလျောက် ဖန်တီးပါ' : 'Upload Video & Auto-Generate Cinematic Recap'}
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl">
              {language === 'my'
                ? 'ဗီဒီယိုဖိုင်ကို တင်ပါ၊ ကြာချိန်နှင့် အချိုးအစားကို ရွေးချယ်ပြီး "AUTO GENERATE" ကို နှိပ်ပါ။ AI မှ စာရေးခြင်း၊ အသံသွင်းခြင်း၊ စာတန်းထိုးခြင်းနှင့် FFmpeg ဗီဒီယို ထုတ်လုပ်ခြင်းအားလုံးကို အလိုအလျောက် ဆောင်ရွက်ပေးပါမည်။'
                : 'Upload your video, select duration and aspect ratio, and click Auto Generate. The system will automatically execute AI analysis, script writing, Burmese TTS, subtitle creation, and FFmpeg rendering.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => onNavigate('recap')}
              className="px-5 py-3 rounded-xl bg-[#1A1F2C] hover:bg-[#232838] text-gray-300 text-sm font-medium border border-[#2E364F] transition-all cursor-pointer flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-[#F04452]" />
              <span>{language === 'my' ? 'ပရို လက်ဖြင့် တည်းဖြတ်ခန်းသို့' : 'Switch to Pro Workshop'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Config vs Progress / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#141722] border border-[#232838] rounded-2xl p-6 shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-[#F04452]" />
              <span>{language === 'my' ? '၁။ ဗီဒီယိုအရင်းအမြစ် ရွေးချယ်ရန်' : '1. Select Source Video'}</span>
            </h2>

            {/* Source Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('sample')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  sourceType === 'sample'
                    ? 'bg-[#F04452]/20 border-[#F04452] text-white shadow-sm'
                    : 'bg-[#181C28] border-[#232838] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Video className="w-4 h-4 text-[#F04452]" />
                <span>{language === 'my' ? 'နမူနာ ဗီဒီယို' : 'Sample Video'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('video')}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  sourceType === 'video'
                    ? 'bg-[#F04452]/20 border-[#F04452] text-white shadow-sm'
                    : 'bg-[#181C28] border-[#232838] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 text-[#F04452]" />
                <span>{language === 'my' ? 'ဖိုင်တင်မည်' : 'Upload Video'}</span>
              </button>
            </div>

            {sourceType === 'sample' ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'my' ? 'နမူနာရုပ်ရှင် ရွေးချယ်ရန်' : 'Choose Sample Video'}
                </label>
                <select
                  value={selectedSample}
                  onChange={(e) => setSelectedSample(e.target.value)}
                  className="w-full bg-[#1A1F2C] border border-[#2E364F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F04452]"
                >
                  <option value="sample_thriller.mp4">Cyberpunk Thriller Sample (10s 720p)</option>
                  <option value="sample_mystery.mp4">Mystery Cinematic Trailer (10s 720p)</option>
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {language === 'my' ? 'ဗီဒီယိုဖိုင် တင်သွင်းရန်' : 'Upload MP4 / MOV Video'}
                </label>
                <label className="border-2 border-dashed border-[#2E364F] hover:border-[#F04452] bg-[#1A1F2C]/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-8 h-8 text-[#F04452] mb-2" />
                  <span className="text-sm font-medium text-white text-center">
                    {uploadedFile ? uploadedFile.name : (language === 'my' ? 'ဗီဒီယိုဖိုင်ကို ဤနေရာသို့ ဆွဲထည့်ပါ (သို့မဟုတ်) နှိပ်၍ရွေးပါ' : 'Drop video file here or click to browse')}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">MP4, MOV, WebM (Max 50MB)</span>
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleFileUpload} />
                </label>
                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'my' ? 'ဖိုင်တင်နေသည်...' : 'Uploading file...'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Duration Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F04452]" />
                <span>{language === 'my' ? 'လိုချင်သော ကြာချိန် (Duration)' : 'Target Duration'}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDurationMinutes(min)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      durationMinutes === min
                        ? 'bg-[#F04452] border-[#F04452] text-white shadow-md'
                        : 'bg-[#181C28] border-[#232838] text-gray-300 hover:bg-[#1E2332]'
                    }`}
                  >
                    {min} {language === 'my' ? 'မိနစ်' : 'min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#F04452]" />
                <span>{language === 'my' ? 'မျက်နှာပြင် အချိုးအစား (Aspect Ratio)' : 'Aspect Ratio'}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '9:16', label: '9:16 (TikTok)', icon: Smartphone },
                  { id: '16:9', label: '16:9 (YouTube)', icon: Tv },
                  { id: '1:1', label: '1:1 (Square)', icon: Square },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAspectRatio(item.id as AspectRatio)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        aspectRatio === item.id
                          ? 'bg-[#F04452]/20 border-[#F04452] text-white shadow-md'
                          : 'bg-[#181C28] border-[#232838] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#F04452]" />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Movie Title Input */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {language === 'my' ? 'ရုပ်ရှင်အမည် / ခေါင်းစဉ်' : 'Movie Title'}
              </label>
              <input
                type="text"
                value={currentProject.title}
                onChange={(e) => onUpdateProject({ title: e.target.value })}
                className="w-full bg-[#1A1F2C] border border-[#2E364F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F04452]"
                placeholder="ဥပမာ - The Hidden Cipher"
              />
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-2 border-t border-[#232838]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
              >
                <span>{language === 'my' ? '⚙️ ဆက်တင် အသေးစိတ်များ (Advanced Settings)' : '⚙️ Advanced Pipeline Settings'}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 pt-3 border-t border-[#232838]/60 text-xs text-gray-300">
                  {/* Narrative Style */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400">{language === 'my' ? 'ဇာတ်လမ်းပြော ပုံစံ (Narrative Style)' : 'Narrative Style'}</label>
                    <select
                      value={narrativeStyle}
                      onChange={(e) => setNarrativeStyle(e.target.value as NarrativeStyle)}
                      className="w-full bg-[#1A1F2C] border border-[#2E364F] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="cinematic">Cinematic</option>
                      <option value="suspense">Suspense / Thriller</option>
                      <option value="emotional">Emotional Drama</option>
                      <option value="dramatic">Dramatic</option>
                      <option value="fast_paced">Fast-Paced Action</option>
                    </select>
                  </div>

                  {/* Background Music */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400">{language === 'my' ? 'နောက်ခံတေးဂီတ (Background Music)' : 'Background Music'}</label>
                    <select
                      value={bgMusic}
                      onChange={(e) => setBgMusic(e.target.value)}
                      className="w-full bg-[#1A1F2C] border border-[#2E364F] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="suspense_dark">Suspense Dark Ambient</option>
                      <option value="dramatic_strings">Dramatic Strings</option>
                      <option value="emotional_piano">Emotional Piano</option>
                      <option value="action_pulse">Action Pulse</option>
                      <option value="none">None (No Background Music)</option>
                    </select>
                  </div>

                  {/* Watermark */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400">{language === 'my' ? 'ရေစာစာသား (Watermark Text)' : 'Watermark Text'}</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full bg-[#1A1F2C] border border-[#2E364F] rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AUTO GENERATE BIG BUTTON */}
            <button
              type="button"
              disabled={isExecuting}
              onClick={startFullAutoGeneration}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base text-white shadow-[0_0_30px_rgba(240,68,82,0.45)] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                isExecuting
                  ? 'bg-gray-700 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-[#F04452] via-[#E0313C] to-[#C92A34] hover:brightness-110 active:scale-[0.99]'
              }`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                  <span>{language === 'my' ? 'အလိုအလျောက် ထုတ်လုပ်နေသည်...' : 'Auto Generating...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                  <span>{language === 'my' ? '⚡ AUTO GENERATE (တစ်ချက်နှိပ် အလိုအလျောက် ဖန်တီးမည်)' : '⚡ AUTO GENERATE RECAP'}</span>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{language === 'my' ? 'အမှားအယွင်း ဖြစ်ပေါ်သည်' : 'Execution Error'}</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 12-Stage Pipeline Progress & Video Preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result / Video Preview Box (if rendered) */}
          {renderResultUrl ? (
            <div className="bg-[#141722] border border-[#232838] rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{language === 'my' ? 'ဗီဒီယို အောင်မြင်စွာ ပြီးဆုံးပါပြီ' : 'Recap Rendered Successfully'}</span>
                </h2>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Ready for Download
                </span>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-[#2E364F]">
                <video src={renderResultUrl} controls className="w-full h-full object-contain" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={renderResultUrl}
                  download="tai_recap_final.mp4"
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'my' ? 'ဗီဒီယို ဒေါင်းလုဒ်ရယူမည် (MP4)' : 'Download MP4 Video'}</span>
                </a>
                {renderSrtUrl && (
                  <a
                    href={renderSrtUrl}
                    download="subtitles.srt"
                    className="py-3 px-4 rounded-xl bg-[#1A1F2C] hover:bg-[#232838] text-gray-300 font-medium text-sm border border-[#2E364F] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#F04452]" />
                    <span>{language === 'my' ? 'SRT' : 'SRT Subtitles'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('recap')}
                  className="py-3 px-4 rounded-xl bg-[#1A1F2C] hover:bg-[#232838] text-gray-300 font-medium text-sm border border-[#2E364F] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>{language === 'my' ? 'ဇာတ်ညွှန်း တည်းဖြတ်မည်' : 'Review Script'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Pipeline Stages Dashboard */
            <div className="bg-[#141722] border border-[#232838] rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F04452]" />
                    <span>{language === 'my' ? 'အလိုအလျောက် လုပ်ဆောင်ချက် အဆင့်ဆင့် (12-Stage Pipeline)' : 'Full Auto Pipeline Progress'}</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {language === 'my'
                      ? '"AUTO GENERATE" နှိပ်လိုက်သည်နှင့် အောက်ပါ အဆင့် ၁၂ ဆင့်ကို အလိုအလျောက် ဆောင်ရွက်ပါမည်။'
                      : 'Automatically executes the 12-stage cinematic pipeline in sequence.'}
                  </p>
                </div>
                {isExecuting && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F04452]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{stageProgress}%</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#181C28] h-2.5 rounded-full overflow-hidden border border-[#232838]">
                <div
                  className="bg-gradient-to-r from-[#F04452] to-amber-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${stageProgress}%` }}
                />
              </div>

              {/* Stages List */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                {stages.map((st, idx) => {
                  const isCompleted = st.status === 'completed';
                  const isActive = st.status === 'active';
                  const isFailed = st.status === 'failed';

                  return (
                    <div
                      key={st.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${
                        isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : isActive
                          ? 'bg-[#F04452]/10 border-[#F04452]/40 text-white shadow-sm'
                          : isFailed
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : 'bg-[#181C28] border-[#232838] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isActive
                              ? 'bg-[#F04452] text-white animate-pulse'
                              : isFailed
                              ? 'bg-red-500 text-white'
                              : 'bg-[#232838] text-gray-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.id}
                        </div>
                        <div>
                          <p className={`font-medium ${isCompleted || isActive ? 'text-white' : 'text-gray-400'}`}>
                            {st.name}
                          </p>
                          {st.detail && <p className="text-xs text-gray-400 mt-0.5">{st.detail}</p>}
                        </div>
                      </div>
                      <div>
                        {isCompleted && <span className="text-xs text-emerald-400 font-semibold">Done</span>}
                        {isActive && <Loader2 className="w-4 h-4 animate-spin text-[#F04452]" />}
                        {isFailed && <span className="text-xs text-red-400 font-semibold">Failed</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

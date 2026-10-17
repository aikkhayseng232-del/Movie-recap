import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Video,
  FileText,
  Sparkles,
  Sliders,
  Mic,
  Subtitles,
  Download,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Save,
  AlertCircle,
  Clock,
  Volume2,
  Layers,
  ChevronDown,
  ChevronUp,
  FileAudio,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Film,
  Music,
  Maximize,
  Info,
  ShieldAlert,
  Type,
  Eye,
} from 'lucide-react';
import { Project, AspectRatio, Resolution, NarrativeStyle, SceneItem, RenderJobStatus, VideoMetadata } from '../types';
import { translations, Language } from '../locales/translations';
import { safeFetchJson } from '../utils/api';

interface WorkspacePageProps {
  currentProject: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onSaveProject: () => void;
  onAddDownload: (item: any) => void;
  language: Language;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  currentProject,
  onUpdateProject,
  onSaveProject,
  onAddDownload,
  language,
}) => {
  const t = translations[language];

  // UI Tabs & State
  const [activeTab, setActiveTab] = useState<'input' | 'script' | 'voice' | 'effects' | 'export'>('input');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isModifyingScript, setIsModifyingScript] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video Player state & ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Render Job
  const [renderJob, setRenderJob] = useState<RenderJobStatus | null>(null);

  // Polling for active render job
  useEffect(() => {
    if (renderJob && (renderJob.status === 'queued' || renderJob.status === 'processing')) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/render/status/${renderJob.id}`);
          if (res.ok) {
            const data: RenderJobStatus = await res.json();
            setRenderJob(data);
            if (data.status === 'completed') {
              clearInterval(interval);
              onUpdateProject({
                lastRenderJobId: data.id,
                lastRenderVideoUrl: data.outputVideoUrl,
                lastRenderSrtUrl: data.outputSrtUrl,
              });
              setStatusMessage({
                type: 'success',
                text: language === 'my' ? 'ဗီဒီယို ထုတ်လုပ်မှု ပြီးစီးပါပြီ!' : 'Video rendering completed successfully!',
              });
              if (data.outputVideoUrl) {
                onAddDownload({
                  id: data.id,
                  title: `${currentProject.title} (${currentProject.aspectRatio})`,
                  type: 'video',
                  url: data.outputVideoUrl,
                  filename: `recap_${currentProject.title.replace(/\s+/g, '_')}.mp4`,
                  date: new Date().toLocaleDateString(),
                  size: data.fileSize ? `${(data.fileSize / (1024 * 1024)).toFixed(1)} MB` : undefined,
                });
              }
            } else if (data.status === 'failed') {
              clearInterval(interval);
              setStatusMessage({
                type: 'error',
                text: data.error || (language === 'my' ? 'ဗီဒီယို ထုတ်လုပ်မှု မအောင်မြင်ပါ' : 'Rendering failed'),
              });
            }
          }
        } catch (e) {
          console.error('Poll error', e);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [renderJob?.id, renderJob?.status]);

  // Video Metadata loading callback
  const handleVideoMetadataLoaded = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      const w = videoRef.current.videoWidth || 0;
      const h = videoRef.current.videoHeight || 0;
      setVideoDuration(dur);
      setVideoDimensions({ width: w, height: h });
      onUpdateProject({
        videoMetadata: {
          ...currentProject.videoMetadata,
          durationSec: dur,
          width: w,
          height: h,
        },
      });
    }
  };

  // Handle Video File Upload with strict validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation (MP4, MOV, WebM, MKV)
    const validExtensions = /\.(mp4|mov|webm|mkv)$/i;
    const validMimes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

    if (!validExtensions.test(file.name) && !validMimes.includes(file.type)) {
      setStatusMessage({
        type: 'error',
        text: language === 'my'
          ? `ဖိုင်အမျိုးအစား မမှန်ကန်ပါ (${file.name})။ MP4, MOV သို့မဟုတ် WebM ဗီဒီယိုဖိုင်များကိုသာ လက်ခံပါသည်။`
          : `Invalid file format (${file.name}). Only MP4, MOV, and WebM video files are accepted.`,
      });
      return;
    }

    // File size validation (Max 350MB)
    if (file.size > 350 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: language === 'my'
          ? `ဖိုင်အရွယ်အစား ကြီးလွန်းပါသည် (${(file.size / (1024 * 1024)).toFixed(1)} MB)။ အများဆုံး 350MB ထက်မကျော်ရပါ။`
          : `File size too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum limit is 350MB.`,
      });
      return;
    }

    setStatusMessage({
      type: 'info',
      text: language === 'my' ? 'ဗီဒီယိုဖိုင် တင်သွင်းနေပါသည်...' : 'Uploading source video...',
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await safeFetchJson('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (data.success) {
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

        onUpdateProject({
          sourceType: 'video',
          sourceVideoPath: data.filename,
          sourceVideoName: file.name,
          sourceVideoSize: file.size,
          videoMetadata: {
            filename: file.name,
            fileSizeFormatted: sizeFormatted,
            mimeType: file.type || 'video/mp4',
          },
          title: currentProject.title === 'Movie Title' || currentProject.title === 'Untitled Movie Recap'
            ? file.name.replace(/\.[^/.]+$/, '')
            : currentProject.title,
        });

        setStatusMessage({
          type: 'success',
          text: language === 'my'
            ? `ဗီဒီယို တင်သွင်းမှု အောင်မြင်ပါသည် (${file.name} - ${sizeFormatted})`
            : `Video uploaded successfully (${file.name} - ${sizeFormatted})`,
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || (language === 'my' ? 'ဗီဒီယို တင်သွင်းမှု မအောင်မြင်ပါ' : 'Upload failed'),
      });
    }
  };

  // Primary Action 1 & 3: Generate Script
  const handleGenerateScript = async (isV2: boolean = false) => {
    if (!currentProject.title && !currentProject.synopsis && !currentProject.sourceVideoName) {
      setStatusMessage({
        type: 'error',
        text: language === 'my'
          ? 'ကျေးဇူးပြု၍ ရုပ်ရှင်အမည် သို့မဟုတ် ဇာတ်လမ်းအကျဉ်းကို ဖြည့်သွင်းပါ'
          : 'Please provide a movie title or story synopsis',
      });
      return;
    }

    const durationToUse = currentProject.isCustomDuration
      ? Math.max(1, (currentProject.customDurationMinutes || 1) + (currentProject.customDurationSeconds || 0) / 60)
      : currentProject.durationMinutes;

    setIsGeneratingScript(true);
    setStatusMessage({
      type: 'info',
      text: isV2
        ? (language === 'my' ? 'Gemini 4 Argon စနစ်ဖြင့် အဆင့်မြင့် ဇာတ်ကွက် ခွဲခြမ်းစိတ်ဖြာနေပါသည်...' : 'Analyzing story architecture with Gemini 4 Argon High-Thinking...')
        : (language === 'my' ? 'Gemini 3.8 Flash စနစ်ဖြင့် မြန်မာဘာသာ ဇာတ်ညွှန်း ရေးသားနေပါသည်...' : 'Generating authentic Burmese recap script with Gemini 3.8...'),
    });

    try {
      const res = await fetch('/api/gemini/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentProject.title,
          genre: currentProject.genre,
          synopsis: currentProject.synopsis,
          sourceText: currentProject.synopsis,
          sourceVideo: currentProject.sourceVideoPath,
          style: currentProject.style,
          targetDurationMinutes: durationToUse,
          language: language,
          isStoryRecapV2: isV2,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateProject({
          title: data.title || currentProject.title,
          script: data.script,
          scenes: data.scenes || [],
          hook: data.hook || '',
        });
        setActiveTab('script');
        setStatusMessage({
          type: 'success',
          text: isV2
            ? (language === 'my' ? 'Story Recap V2 ဇာတ်ညွှန်း အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ!' : 'Story Recap V2 generated with high-tension hooks!')
            : (language === 'my' ? 'မြန်မာဘာသာ ဇာတ်ညွှန်း အောင်မြင်စွာ ရေးသားပြီးပါပြီ!' : 'Burmese recap script generated successfully!'),
        });
      } else {
        const errorText = data.message || data.error || (language === 'my' ? 'AI ဇာတ်ညွှန်း ရေးသားခြင်း မအောင်မြင်ပါ' : 'Failed to generate script');
        setStatusMessage({
          type: 'error',
          text: errorText,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Script generation failed',
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Modify Script (Shorten, Expand, Translate)
  const handleModifyScript = async (action: 'shorten' | 'expand' | 'translate') => {
    if (!currentProject.script) return;
    setIsModifyingScript(true);

    try {
      const res = await fetch('/api/gemini/modify-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: currentProject.script,
          action,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.modifiedScript) {
        onUpdateProject({ script: data.modifiedScript });
        setStatusMessage({
          type: 'success',
          text: language === 'my' ? 'ဇာတ်ညွှန်းကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ' : 'Script updated successfully',
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to modify script' });
    } finally {
      setIsModifyingScript(false);
    }
  };

  // Generate TTS Audio
  const handleGenerateVoice = async () => {
    if (!currentProject.script) {
      setStatusMessage({
        type: 'error',
        text: language === 'my' ? 'ပထမဦးစွာ ဇာတ်ညွှန်းရေးသားရန် လိုအပ်ပါသည်' : 'Please generate or enter a script first',
      });
      return;
    }

    setIsGeneratingVoice(true);
    const chosenProvider = currentProject.ttsProvider || 'google-burmese';
    setStatusMessage({
      type: 'info',
      text:
        language === 'my'
          ? `${chosenProvider === 'gemini-tts' ? 'Gemini 3.8 Flash TTS' : 'Google Native Burmese TTS'} ဖြင့် မြန်မာအသံ ထွက်ဆိုနေပါသည်...`
          : `Synthesizing Burmese voiceover audio with ${chosenProvider}...`,
    });

    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentProject.script,
          providerId: chosenProvider,
          voiceId: chosenProvider === 'gemini-tts' ? currentProject.ttsVoice || 'Kore' : undefined,
          style: `Cinematic Burmese movie recap, tone: ${currentProject.style}`,
          speed: currentProject.ttsSpeed || 1.0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.audioUrl) {
        onUpdateProject({ ttsAudioUrl: data.audioUrl });
        setStatusMessage({
          type: 'success',
          text:
            language === 'my'
              ? `မြန်မာအသံဖိုင် အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ! (${data.durationSec}s, ${(data.fileSizeBytes / 1024).toFixed(1)} KB)`
              : `Voiceover synthesized successfully (${data.durationSec}s, ${(data.fileSizeBytes / 1024).toFixed(1)} KB)!`,
        });
        onAddDownload({
          id: `audio_${Date.now()}`,
          title: `${currentProject.title} (Narration)`,
          type: 'audio',
          url: data.audioUrl,
          filename: data.filename || `narration_${currentProject.title.replace(/\s+/g, '_')}.mp3`,
          date: new Date().toLocaleDateString(),
          size: `${(data.fileSizeBytes / 1024).toFixed(1)} KB`,
        });
      } else {
        throw new Error(data.error || data.message || 'TTS synthesis failed');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || (language === 'my' ? 'အသံဖိုင် ဖန်တီးခြင်း မအောင်မြင်ပါ' : 'TTS Error'),
      });
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Primary Action 2: Export Video with FFmpeg
  const handleExportVideo = async () => {
    if (!currentProject.script && !currentProject.sourceVideoName) {
      setStatusMessage({
        type: 'error',
        text: language === 'my'
          ? 'ဗီဒီယို သို့မဟုတ် ဇာတ်ညွှန်း အချက်အလက်များ လိုအပ်ပါသည်'
          : 'Source video or script required to export',
      });
      return;
    }

    setStatusMessage({
      type: 'info',
      text: language === 'my' ? 'FFmpeg ဗီဒီယို ပေါင်းစပ်ဖန်တီးမှု စတင်နေပါသည်...' : 'Starting FFmpeg render job...',
    });

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceVideo: currentProject.sourceVideoPath || 'public/samples/sample_thriller.mp4',
          script: currentProject.script,
          scenes: currentProject.scenes,
          aspectRatio: currentProject.aspectRatio,
          resolution: currentProject.resolution,
          subtitlesEnabled: currentProject.subtitlesEnabled,
          subtitleColor: currentProject.subtitleColor,
          subtitleSize: currentProject.subtitleSize,
          subtitlePosition: currentProject.subtitlePosition,
          subtitleOutline: currentProject.subtitleOutline,
          bgMusic: currentProject.bgMusic,
          bgMusicVolume: currentProject.bgMusicVolume,
          originalAudioVolume: currentProject.originalAudioVolume,
          ttsAudioUrl: currentProject.ttsAudioUrl,
          watermarkText: currentProject.watermarkText,
          watermarkPosition: currentProject.watermarkPosition,
          watermarkOpacity: currentProject.watermarkOpacity,
          blurRegion: currentProject.blurRegion,
          blurStrength: currentProject.blurStrength,
        }),
      });

      const data = await res.json();
      if (res.ok && data.jobId) {
        setRenderJob({
          id: data.jobId,
          status: 'processing',
          progress: 10,
          stage: data.message || 'Processing...',
        });
        setActiveTab('export');
      } else {
        throw new Error(data.error || 'Failed to start render');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Export failed' });
    }
  };

  // Word count & Speaking Duration calculation
  const wordCount = (currentProject.script || '').split(/\s+/).filter(Boolean).length;
  const speedMultiplier = currentProject.ttsSpeed || 1.0;
  // Natural Burmese speaking speed is ~150 words/min at 1.0x (2.5 words/sec)
  const estimatedSeconds = Math.max(0, Math.round(wordCount / (2.5 * speedMultiplier)));
  const estimatedMinutes = Math.floor(estimatedSeconds / 60);
  const estimatedRemainingSeconds = estimatedSeconds % 60;

  // Copy Script to Clipboard
  const handleCopyScript = () => {
    if (!currentProject.script) return;
    navigator.clipboard.writeText(currentProject.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Video Source URL helper
  const getVideoSourceUrl = () => {
    if (!currentProject.sourceVideoPath) {
      return '/api/media/samples/sample_thriller.mp4';
    }
    if (currentProject.sourceVideoPath.startsWith('source_')) {
      return `/api/media/uploads/${currentProject.sourceVideoPath}`;
    }
    if (currentProject.sourceVideoPath.startsWith('sample_')) {
      return `/api/media/samples/${currentProject.sourceVideoPath}`;
    }
    return '/api/media/samples/sample_thriller.mp4';
  };

  // Aspect Ratio preview style helper
  const getAspectRatioClass = () => {
    switch (currentProject.aspectRatio) {
      case '9:16': return 'aspect-[9/16] max-w-[280px]';
      case '1:1': return 'aspect-square max-w-[360px]';
      case '3:4': return 'aspect-[3/4] max-w-[320px]';
      case '16:9':
      default: return 'aspect-video w-full';
    }
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Top Action Bar with 3 Prominent Actions */}
      <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#F04452]/10 border border-[#F04452]/30 text-[#F04452]">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentProject.title}
                onChange={(e) => onUpdateProject({ title: e.target.value })}
                className="bg-transparent text-base md:text-lg font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-[#F04452] rounded px-1.5 py-0.5 border border-transparent hover:border-[#2D354A] transition-colors"
                placeholder="Movie Title"
              />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2130] text-gray-300 border border-[#2A3247]">
                {currentProject.aspectRatio}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2130] text-emerald-400 border border-[#2A3247]">
                {currentProject.resolution}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{currentProject.genre || 'Action / Thriller'}</span>
              <span>•</span>
              <span>
                {currentProject.isCustomDuration
                  ? `${currentProject.customDurationMinutes || 1}m ${currentProject.customDurationSeconds || 0}s`
                  : `${currentProject.durationMinutes} min`}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Prominent Required Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Generate Recap */}
          <button
            onClick={() => handleGenerateScript(false)}
            disabled={isGeneratingScript}
            className="flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isGeneratingScript ? t.generating : t.generateRecap}</span>
          </button>

          {/* Action 3: Story Recap V2 */}
          <button
            onClick={() => handleGenerateScript(true)}
            disabled={isGeneratingScript}
            title={t.storyRecapV2Desc}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-bold text-xs md:text-sm text-amber-300 bg-[#1D1B28] hover:bg-[#28253A] border border-amber-500/40 shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>{t.storyRecapV2}</span>
          </button>

          {/* Action 2: Export Video */}
          <button
            onClick={handleExportVideo}
            disabled={renderJob?.status === 'processing'}
            className="flex items-center gap-2 py-2 px-4 rounded-xl font-bold text-xs md:text-sm text-white bg-[#1A1F2C] hover:bg-[#252C3D] border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>{renderJob?.status === 'processing' ? t.exporting : t.exportVideo}</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={onSaveProject}
            className="p-2 rounded-xl bg-[#1A1F2C] hover:bg-[#252C3D] border border-[#2D364A] text-gray-300 hover:text-white cursor-pointer"
            title={t.saveDraft}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#1F2432]">
        {[
          { id: 'input', label: t.step1, icon: Upload },
          { id: 'script', label: t.step3, icon: FileText },
          { id: 'voice', label: t.step4, icon: Mic },
          { id: 'effects', label: t.step5, icon: Sliders },
          { id: 'export', label: t.step6, icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-4 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#141720] text-white border-t-2 border-[#F04452] border-x border-[#232838]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#10131C]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F04452]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Source Video & Text Input */}
      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Video Uploader & Real-time Video Preview Player with Metadata */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#F04452]" />
                  <span>{t.uploadVideo}</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  MP4, MOV, WebM (Max 350MB)
                </span>
              </div>

              {/* Upload Drop Zone */}
              <label className="border-2 border-dashed border-[#283042] hover:border-[#F04452]/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#0D1017] group">
                <Upload className="w-8 h-8 text-[#F04452] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-gray-200">{t.uploadHint}</span>
                <span className="text-[11px] text-gray-500 mt-1">
                  {language === 'my' ? 'ဖိုင်အမျိုးအစား စစ်ဆေးမှုနှင့် အရွယ်အစား စိစစ်ချက် ပါဝင်ပါသည်' : 'Automatic MIME validation and size checking'}
                </span>
                <input
                  type="file"
                  accept=".mp4,.mov,.webm,.mkv,video/mp4,video/quicktime,video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Built-in Demo Samples */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-400 block mb-2">
                  {t.orSelectSample}:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onUpdateProject({
                        sourceType: 'sample',
                        sourceVideoPath: 'sample_thriller.mp4',
                        sourceVideoName: 'Cyberpunk Thriller Sample (10s 720p)',
                        sourceVideoSize: 217088,
                        videoMetadata: {
                          filename: 'sample_thriller.mp4',
                          durationSec: 10,
                          width: 1280,
                          height: 720,
                          fileSizeFormatted: '212 KB',
                          mimeType: 'video/mp4',
                        },
                        title: currentProject.title === 'Movie Title' || currentProject.title === 'Untitled Movie Recap'
                          ? 'Cyberpunk Night City'
                          : currentProject.title,
                      });
                      setStatusMessage({
                        type: 'success',
                        text: language === 'my' ? 'နမူနာဗီဒီယို ရွေးချယ်ပြီးပါပြီ' : 'Cyberpunk sample video selected',
                      });
                    }}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      currentProject.sourceVideoPath === 'sample_thriller.mp4'
                        ? 'bg-[#1E2436] border-[#F04452] text-white shadow-sm'
                        : 'bg-[#10141F] border-[#222838] text-gray-300 hover:bg-[#161B29]'
                    }`}
                  >
                    <div className="font-bold">{t.sample1}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">10s • H.264 • 720p</div>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateProject({
                        sourceType: 'sample',
                        sourceVideoPath: 'sample_mystery.mp4',
                        sourceVideoName: 'Mystery SMPTE Sample (10s 720p)',
                        sourceVideoSize: 114688,
                        videoMetadata: {
                          filename: 'sample_mystery.mp4',
                          durationSec: 10,
                          width: 1280,
                          height: 720,
                          fileSizeFormatted: '112 KB',
                          mimeType: 'video/mp4',
                        },
                        title: currentProject.title === 'Movie Title' || currentProject.title === 'Untitled Movie Recap'
                          ? 'The Mystery Test'
                          : currentProject.title,
                      });
                      setStatusMessage({
                        type: 'success',
                        text: language === 'my' ? 'နမူနာဗီဒီယို ရွေးချယ်ပြီးပါပြီ' : 'Mystery sample video selected',
                      });
                    }}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      currentProject.sourceVideoPath === 'sample_mystery.mp4'
                        ? 'bg-[#1E2436] border-[#F04452] text-white shadow-sm'
                        : 'bg-[#10141F] border-[#222838] text-gray-300 hover:bg-[#161B29]'
                    }`}
                  >
                    <div className="font-bold">{t.sample2}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">10s • SMPTE • 720p</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Video Player & Real Metadata Display */}
            <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#F04452]" />
                  {t.videoPreview}
                </span>
                <span className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">
                  {currentProject.sourceVideoName || 'sample_thriller.mp4'}
                </span>
              </div>

              {/* Responsive Aspect-Ratio Video Container */}
              <div className="flex items-center justify-center p-2 rounded-lg bg-black/60 border border-[#222838] min-h-[200px]">
                <div className={`relative rounded-lg overflow-hidden bg-black mx-auto transition-all ${getAspectRatioClass()}`}>
                  <video
                    ref={videoRef}
                    src={getVideoSourceUrl()}
                    controls
                    onLoadedMetadata={handleVideoMetadataLoaded}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Real Video Metadata HUD */}
              <div className="p-3 rounded-lg bg-[#0E1017] border border-[#222838] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    {language === 'my' ? 'ကြာမြင့်ချိန်' : 'Duration'}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {videoDuration
                      ? `${Math.floor(videoDuration / 60)}:${Math.floor(videoDuration % 60).toString().padStart(2, '0')}`
                      : '00:10'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    {language === 'my' ? 'ကြည်လင်မှု' : 'Resolution'}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {videoDimensions ? `${videoDimensions.width}x${videoDimensions.height}` : '1280x720'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    {language === 'my' ? 'ဖိုင်အရွယ်အစား' : 'File Size'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currentProject.videoMetadata?.fileSizeFormatted ||
                      (currentProject.sourceVideoSize
                        ? `${(currentProject.sourceVideoSize / 1024).toFixed(0)} KB`
                        : '212 KB')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">
                    {language === 'my' ? 'မျက်နှာပြင် အချိုး' : 'Target Aspect'}
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {currentProject.aspectRatio}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story Plot, Duration (Presets + Custom), Style & Settings */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F04452]" />
                <span>{language === 'my' ? 'ဇာတ်လမ်း အချက်အလက်နှင့် ဆက်တင်များ' : 'Story Content & Recap Settings'}</span>
              </h3>

              {/* Title Input */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {t.movieTitleLabel} *
                </label>
                <input
                  type="text"
                  value={currentProject.title}
                  onChange={(e) => onUpdateProject({ title: e.target.value })}
                  placeholder={language === 'my' ? 'ဥပမာ - မထင်မှတ်သော အလှည့်အပြောင်း (Inception)' : 'e.g. Inception (2010)'}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F04452]"
                />
              </div>

              {/* Genre & Narrative Style */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {t.genreLabel}
                  </label>
                  <input
                    type="text"
                    value={currentProject.genre}
                    onChange={(e) => onUpdateProject({ genre: e.target.value })}
                    placeholder="Action, Sci-Fi, Mystery"
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F04452]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {t.styleLabel}
                  </label>
                  <select
                    value={currentProject.style}
                    onChange={(e) => onUpdateProject({ style: e.target.value as NarrativeStyle })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                  >
                    <option value="cinematic">{t.styleCinematic}</option>
                    <option value="suspense">{t.styleSuspense}</option>
                    <option value="emotional">{t.styleEmotional}</option>
                    <option value="dramatic">{t.styleDramatic}</option>
                    <option value="documentary">{t.styleDocumentary}</option>
                    <option value="fast_paced">{t.styleFastPaced}</option>
                  </select>
                </div>
              </div>

              {/* Duration Presets + Custom Duration Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">
                    {t.durationLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => onUpdateProject({ isCustomDuration: !currentProject.isCustomDuration })}
                    className="text-[11px] text-[#F04452] hover:underline font-semibold cursor-pointer"
                  >
                    {currentProject.isCustomDuration
                      ? (language === 'my' ? 'ကြိုတင်သတ်မှတ်ချိန် သုံးမည်' : 'Use Presets')
                      : (language === 'my' ? 'မိနစ်:စက္ကန့် စိတ်ကြိုက်ညှိမည်' : 'Custom Min:Sec')}
                  </button>
                </div>

                {!currentProject.isCustomDuration ? (
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 3, 5, 10, 15, 20].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => onUpdateProject({ durationMinutes: dur, isCustomDuration: false })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentProject.durationMinutes === dur && !currentProject.isCustomDuration
                            ? 'bg-[#F04452] text-white shadow-sm'
                            : 'bg-[#181C28] text-gray-400 hover:text-white border border-[#252C3D]'
                        }`}
                      >
                        {dur}m
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0E1017] border border-[#262D3D]">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1">
                        {language === 'my' ? 'မိနစ် (Minutes)' : 'Minutes'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={currentProject.customDurationMinutes ?? currentProject.durationMinutes}
                        onChange={(e) => onUpdateProject({ customDurationMinutes: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1 rounded bg-[#161B29] border border-[#2D364A] text-xs text-white font-mono"
                      />
                    </div>
                    <span className="text-gray-400 font-bold mt-4">:</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400 block mb-1">
                        {language === 'my' ? 'စက္ကန့် (Seconds)' : 'Seconds'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={currentProject.customDurationSeconds ?? 0}
                        onChange={(e) => onUpdateProject({ customDurationSeconds: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1 rounded bg-[#161B29] border border-[#2D364A] text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Aspect Ratio & Resolution Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {t.aspectRatioLabel}
                  </label>
                  <select
                    value={currentProject.aspectRatio}
                    onChange={(e) => onUpdateProject({ aspectRatio: e.target.value as AspectRatio })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                  >
                    <option value="9:16">9:16 (TikTok, Shorts, Reels)</option>
                    <option value="16:9">16:9 (YouTube, Cinema)</option>
                    <option value="1:1">1:1 (Instagram, Facebook)</option>
                    <option value="3:4">3:4 (Portrait Feed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {t.resolutionLabel}
                  </label>
                  <select
                    value={currentProject.resolution}
                    onChange={(e) => onUpdateProject({ resolution: e.target.value as Resolution })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                  >
                    <option value="720p">720p HD ({language === 'my' ? 'စံနှုန်း' : 'Recommended'})</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="480p">480p SD ({language === 'my' ? 'အမြန်' : 'Fast'})</option>
                    <option value="4K">4K UHD (Heavy Rendering)</option>
                  </select>
                </div>
              </div>

              {/* Synopsis / Source Transcript Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    {t.synopsisLabel}
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {currentProject.synopsis?.length || 0} characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={currentProject.synopsis}
                  onChange={(e) => onUpdateProject({ synopsis: e.target.value })}
                  placeholder={
                    language === 'my'
                      ? 'ဇာတ်လမ်း၏ အဓိက အကျဉ်းချုပ်၊ ဇာတ်ကွက် အလှည့်အပြောင်း သို့မဟုတ် အသံဖိုင်မှ ကူးယူထားသော ဇာတ်ညွှန်းကို ထည့်သွင်းပါ...'
                      : 'Paste movie plot summary, key twist, or transcribed scenes...'
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F04452] leading-relaxed resize-y"
                />
              </div>

              {/* Generate Prompt Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleGenerateScript(false)}
                  disabled={isGeneratingScript}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 inline mr-2 text-amber-300" />
                  {isGeneratingScript ? t.generating : t.generateRecap}
                </button>

                <button
                  onClick={() => handleGenerateScript(true)}
                  disabled={isGeneratingScript}
                  className="py-3 px-4 rounded-xl font-bold text-xs md:text-sm text-amber-300 bg-[#1F1C2B] hover:bg-[#2A263B] border border-amber-500/40 transition-all cursor-pointer disabled:opacity-50"
                  title={t.storyRecapV2Desc}
                >
                  <Cpu className="w-4 h-4 inline mr-1 text-amber-400" />
                  Story V2
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Burmese Script Editor */}
      {activeTab === 'script' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
            {/* Header with Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F2432]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F04452]" />
                  <span>{t.scriptEditorTitle}</span>
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {estimatedMinutes}:{estimatedRemainingSeconds.toString().padStart(2, '0')} min ({t.estimatedReadTime})
                  </span>
                  <span>•</span>
                  <span>{wordCount} {t.wordsCount}</span>
                </div>
              </div>

              {/* Action Buttons for Script */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleModifyScript('shorten')}
                  disabled={isModifyingScript || !currentProject.script}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] text-gray-300 hover:text-white cursor-pointer disabled:opacity-50"
                >
                  <Minimize2 className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                  {t.shortenBtn}
                </button>

                <button
                  onClick={() => handleModifyScript('expand')}
                  disabled={isModifyingScript || !currentProject.script}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] text-gray-300 hover:text-white cursor-pointer disabled:opacity-50"
                >
                  <Maximize2 className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
                  {t.expandBtn}
                </button>

                <button
                  onClick={() => handleGenerateScript(false)}
                  disabled={isGeneratingScript}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] text-gray-300 hover:text-white cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                  {t.regenerateBtn}
                </button>

                <button
                  onClick={handleCopyScript}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] text-gray-300 hover:text-white cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 inline mr-1" />}
                  {copied ? t.copiedText : t.copyBtn}
                </button>

                <button
                  onClick={() => {
                    onUpdateProject({
                      script: `[စတင်ဖွင့်ဟချက် (0:00 - 0:15)]\nဒီဇာတ်ကားဟာ အမှောင်ထုထဲက လူသတ်သမားတစ်ယောက်နဲ့ သူ့နောက်ကို တစ်ကောက်ကောက်လိုက်နေတဲ့ စုံထောက်တစ်ယောက်ရဲ့ အသက်လုတိုက်ပွဲအကြောင်း ဖြစ်ပါတယ်။ ပရိသတ်ကြီးရေ အဆုံးထိကြည့်မှ မထင်မှတ်ထားတဲ့ အလှည့်အပြောင်းကို သိရမှာဖြစ်လို့ မလွတ်တမ်း ကြည့်ရှုလိုက်ရအောင်။\n\n[ဇာတ်လမ်းအစ (0:15 - 0:50)]\nမြို့တော်ရဲ့ သာမန်ညတစ်ညမှာ ထူးဆန်းတဲ့ အခန်းပိတ်လူသတ်မှု စတင်ဖြစ်ပွားခဲ့ပါတယ်။ စုံထောက်မင်းသူ ဟာ အခင်းဖြစ်ပွားရာနေရာကို ရောက်ရှိလာပြီး အသေးစိတ်စစ်ဆေးတဲ့အခါ ထူးဆန်းတဲ့ မှတ်စုတိုလေးတစ်ခုကို တွေ့ရှိခဲ့ပါတယ်။\n\n[ဇာတ်ရှိန်မြင့်တက်လာခြင်း (0:50 - 1:40)]\nစုံစမ်းမှုတွေ ရှေ့ဆက်သွားလေလေ မြို့တော်ရဲ့ အာဏာပိုင်တွေပါ ပါဝင်ပတ်သက်နေတာကို သိရှိလာရပြီး မိသားစုပါ ခြိမ်းခြောက်ခံရပါတော့တယ်။\n\n[အထွတ်အထိပ် ရင်ဆိုင်မှု (1:40 - 2:30)]\nစွန့်ပစ်စက်ရုံဟောင်းကြီးထဲမှာ သေနတ်သံတွေကြား အသက်လုတိုက်ခိုက်ကြပြီး မင်းသူရဲ့ မထင်မှတ်တဲ့ လျှို့ဝှက်ဗျူဟာ ထွက်ပေါ်လာပါတယ်။\n\n[အလှည့်အပြောင်းနဲ့ နိဂုံး (2:30 - 3:00)]\nအဓိကတရားခံဟာ အယုံကြည်ရဆုံး လုပ်ဖော်ကိုင်ဖက် ဖြစ်နေတာကို ဖော်ထုတ်နိုင်ခဲ့ပါတယ်။ နောက်ထပ် ဗီဒီယိုတွေအတွက် Like & Follow လုပ်ထားပေးကြပါဦး။`,
                      hook: 'ဒီဇာတ်ကားဟာ အဆုံးထိ မခွာတမ်း ကြည့်ရမယ့် အသည်းတယားယား ဇာတ်လမ်းဖြစ်ပါတယ်!',
                    });
                    setStatusMessage({
                      type: 'info',
                      text: language === 'my' ? 'နမူနာ ဇာတ်ညွှန်းမူကြမ်းကို ထည့်သွင်းပြီးပါပြီ' : 'Starter script draft loaded',
                    });
                  }}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1C2233] hover:bg-[#252E44] border border-[#2E3752] text-amber-400 hover:text-amber-300 cursor-pointer"
                  title="Load starter draft for testing"
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  <span>{language === 'my' ? 'မူကြမ်းနမူနာယူမည်' : 'Starter Draft'}</span>
                </button>
              </div>
            </div>

            {/* AI Script Generation Loading Indicator */}
            {isGeneratingScript && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#171B28] to-[#141824] border border-[#F04452]/40 space-y-2.5 animate-pulse">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    {language === 'my' ? 'AI ဇာတ်ညွှန်း ရေးဖွဲ့နေပါသည်...' : 'AI Scriptwriter in progress...'}
                  </span>
                  <span className="text-[#F04452]">Working...</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400">
                  <div className="p-2 rounded bg-[#0E1017] border border-[#232838]">
                    1. {language === 'my' ? 'ဇာတ်လမ်းခွဲခြမ်းစိတ်ဖြာမှု' : 'Story Analysis'}
                  </div>
                  <div className="p-2 rounded bg-[#0E1017] border border-[#232838]">
                    2. {language === 'my' ? 'အချိန်အလိုက် ဇာတ်ကွက်စီစဉ်မှု' : 'Chronological Scenes'}
                  </div>
                  <div className="p-2 rounded bg-[#0E1017] border border-[#232838]">
                    3. {language === 'my' ? 'မြန်မာယူနီကုဒ် ရေးဖွဲ့မှု' : 'Burmese Narration'}
                  </div>
                </div>
              </div>
            )}

            {/* Opening Hook Highlight */}
            {currentProject.hook && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F04452]/10 to-transparent border border-[#F04452]/30 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#F04452] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-[#F04452] uppercase tracking-wider block">
                    {language === 'my' ? 'ဗိုင်းရပ်စ် အစချီ ဆွဲဆောင်မှု (Opening 5-Sec Hook)' : 'Viral Opening Hook (0:00 - 0:05)'}
                  </span>
                  <p className="text-xs text-white font-medium mt-0.5 leading-relaxed">
                    "{currentProject.hook}"
                  </p>
                </div>
              </div>
            )}

            {/* Main Script Textarea */}
            <div>
              <textarea
                rows={14}
                value={currentProject.script}
                onChange={(e) => onUpdateProject({ script: e.target.value })}
                placeholder={
                  language === 'my'
                    ? 'မြန်မာဘာသာ ရုပ်ရှင်အကျဉ်းချုပ် ဇာတ်ညွှန်း ဤနေရာတွင် တည်းဖြတ်နိုင်ပါသည်...'
                    : 'Edit full Burmese recap script here...'
                }
                className="w-full p-4 rounded-xl bg-[#0E1017] border border-[#262D3D] text-sm text-white focus:outline-none focus:border-[#F04452] leading-relaxed font-sans resize-y"
              />
            </div>

            {/* Next Step Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveTab('voice')}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>{language === 'my' ? 'အသံသွင်းခန်းသို့ ဆက်သွားမည်' : 'Proceed to Voice Studio'}</span>
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Burmese Voice Studio */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Voice Settings */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#F04452]" />
                <span>{t.voiceTitle}</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t.voiceSubtitle}
              </p>

              {/* TTS Provider Selector */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  {language === 'my' ? 'အသံစနစ် ရွေးချယ်ရန် (TTS Engine)' : 'TTS Engine'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateProject({ ttsProvider: 'google-burmese' })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      (currentProject.ttsProvider || 'google-burmese') === 'google-burmese'
                        ? 'bg-[#1E2436] border-[#F04452] text-white'
                        : 'bg-[#0E1017] border-[#222838] text-gray-400 hover:bg-[#141824]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Native Burmese</span>
                      <span className="text-[9px] py-0.2 px-1 rounded bg-emerald-500/20 text-emerald-400">Ready</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">မူလမြန်မာအသံ (No Key)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateProject({ ttsProvider: 'gemini-tts' })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      currentProject.ttsProvider === 'gemini-tts'
                        ? 'bg-[#1E2436] border-[#F04452] text-white'
                        : 'bg-[#0E1017] border-[#222838] text-gray-400 hover:bg-[#141824]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Gemini TTS</span>
                      <span className="text-[9px] py-0.2 px-1 rounded bg-indigo-500/20 text-indigo-400">AI Personas</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Gemini 3.8 Flash (Key)</div>
                  </button>
                </div>
              </div>

              {/* Voice Persona Selector (Only when provider supports multiple voices) */}
              {currentProject.ttsProvider === 'gemini-tts' ? (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    {t.selectVoice} (Gemini AI Personas)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'Kore', name: 'Kore (ရုပ်ရှင်ဇာတ်လမ်းပြော အသံ)', desc: 'Natural balanced cinematic narrator' },
                      { id: 'Fenrir', name: 'Fenrir (နက်ရှိုင်းသော သည်းထိတ်ရင်ဖိုသံ)', desc: 'Deep, suspenseful thriller tone' },
                      { id: 'Puck', name: 'Puck (အရှိန်မြန် တက်ကြွသော အသံ)', desc: 'Energetic, fast viral recap pace' },
                      { id: 'Zephyr', name: 'Zephyr (နူးညံ့ငြိမ်းချမ်းသော အသံ)', desc: 'Smooth, emotional documentary style' },
                    ].map((voice) => (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() => onUpdateProject({ ttsVoice: voice.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          currentProject.ttsVoice === voice.id
                            ? 'bg-[#1E2436] border-[#F04452] text-white shadow-sm'
                            : 'bg-[#0E1017] border-[#222838] text-gray-300 hover:bg-[#141824]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{voice.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{voice.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#0E1017] border border-[#222838] text-xs text-gray-300 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'my' ? 'မြန်မာဘာသာ သဘာဝဇာတ်လမ်းပြော အသံ (Native Voice)' : 'Native Burmese Voice Active'}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {language === 'my'
                      ? 'မြန်မာယူနီကုဒ် အသံထွက် မှန်ကန်မှုကို ဦးစားပေးဖတ်ကြားပေးပါသည်။'
                      : 'Authentic Burmese phoneme pronunciation engine with multi-sentence chunking.'}
                  </p>
                </div>
              )}

              {/* Speaking Speed */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-gray-300">{t.voiceSpeed}</span>
                  <span className="font-mono text-amber-400">{currentProject.ttsSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={currentProject.ttsSpeed}
                  onChange={(e) => onUpdateProject({ ttsSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-[#F04452] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>0.75x (အေးဆေး)</span>
                  <span>1.0x (စံနှုန်း)</span>
                  <span>1.5x (အမြန်)</span>
                </div>
              </div>

              {/* Synthesize Button */}
              <button
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice || !currentProject.script}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-4 h-4 inline mr-2 text-white" />
                {isGeneratingVoice ? (language === 'my' ? 'မြန်မာအသံဖိုင် ဖန်တီးနေပါသည်...' : 'Synthesizing Audio...') : t.generateVoiceBtn}
              </button>
            </div>
          </div>

          {/* Voice Player & Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#F04452]" />
                  {t.audioPreview}
                </span>
                {currentProject.ttsAudioUrl && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Audio Generated
                  </span>
                )}
              </h3>

              {/* Audio Waveform Visual Card */}
              <div className="p-6 rounded-xl bg-[#0E1017] border border-[#242B3D] text-center space-y-4">
                <div className="flex items-center justify-center gap-1 h-14">
                  {[40, 65, 30, 85, 95, 60, 45, 75, 90, 50, 65, 80, 35, 70, 95, 85, 60, 45, 90, 75].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        isPlayingAudio
                          ? 'bg-[#F04452] animate-pulse'
                          : currentProject.ttsAudioUrl
                          ? 'bg-indigo-400'
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                {currentProject.ttsAudioUrl ? (
                  <div className="space-y-3">
                    <audio
                      ref={audioRef}
                      src={currentProject.ttsAudioUrl}
                      controls
                      onPlay={() => setIsPlayingAudio(true)}
                      onPause={() => setIsPlayingAudio(false)}
                      className="w-full"
                    />

                    <div className="flex justify-center gap-3">
                      <a
                        href={`${currentProject.ttsAudioUrl}?download=true`}
                        download="burmese_narration.wav"
                        className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#1C2233] hover:bg-[#252E44] border border-[#2E3752] inline-flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>{t.downloadAudio}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    {language === 'my'
                      ? 'အသံဖိုင် ဖန်တီးရန် "အသံ ဖန်တီးမည်" ခလုတ်ကို နှိပ်ပါ'
                      : 'Click "Synthesize Voice" to generate high-fidelity audio narration.'}
                  </div>
                )}
              </div>

              {/* Script excerpt preview */}
              <div className="p-3.5 rounded-xl bg-[#0E1017] border border-[#222838]">
                <span className="text-[11px] font-bold text-gray-400 block mb-1">
                  {language === 'my' ? 'ဖတ်ကြားမည့် ဇာတ်ညွှန်း အစမ်းကြည့်ရှုမှု:' : 'Narration Text Preview:'}
                </span>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  {currentProject.script || (language === 'my' ? 'ဇာတ်ညွှန်း မရှိသေးပါ' : 'No script entered')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Subtitles & Effects Controls */}
      {activeTab === 'effects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Subtitle Configuration */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Subtitles className="w-4 h-4 text-[#F04452]" />
                <span>{language === 'my' ? 'မြန်မာ ယူနီကုဒ် စာတန်းထိုး' : 'Myanmar Subtitles (SRT)'}</span>
              </span>
              <input
                type="checkbox"
                checked={currentProject.subtitlesEnabled}
                onChange={(e) => onUpdateProject({ subtitlesEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#F04452] cursor-pointer"
              />
            </h3>

            <div className="space-y-3">
              {/* Language Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'စာတန်းထိုး ဘာသာစကား' : 'Subtitle Language'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateProject({ subtitleLanguage: 'my' })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentProject.subtitleLanguage === 'my'
                        ? 'bg-[#F04452] text-white'
                        : 'bg-[#0E1017] border border-[#242B3D] text-gray-400 hover:text-white'
                    }`}
                  >
                    မြန်မာစာ (Myanmar Unicode)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateProject({ subtitleLanguage: 'en' })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentProject.subtitleLanguage === 'en'
                        ? 'bg-[#F04452] text-white'
                        : 'bg-[#0E1017] border border-[#242B3D] text-gray-400 hover:text-white'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>

              {/* Subtitle Font Size */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'စာလုံး အရွယ်အစား' : 'Subtitle Font Size'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onUpdateProject({ subtitleSize: sz })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        currentProject.subtitleSize === sz
                          ? 'bg-[#F04452] text-white'
                          : 'bg-[#0E1017] border border-[#242B3D] text-gray-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Color Presets */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'စာတန်းထိုး အရောင်' : 'Subtitle Color'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'White', hex: '#FFFFFF' },
                    { label: 'Yellow', hex: '#FACC15' },
                    { label: 'Cyan', hex: '#22D3EE' },
                    { label: 'Gold', hex: '#F59E0B' },
                  ].map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => onUpdateProject({ subtitleColor: col.hex })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        currentProject.subtitleColor === col.hex
                          ? 'border-[#F04452] bg-[#1E2436] text-white'
                          : 'border-[#242B3D] bg-[#0E1017] text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: col.hex }} />
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'စာတန်းထိုး နေရာ' : 'Position'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bottom', 'center', 'top'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => onUpdateProject({ subtitlePosition: pos })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        currentProject.subtitlePosition === pos
                          ? 'bg-[#F04452] text-white'
                          : 'bg-[#0E1017] border border-[#242B3D] text-gray-400 hover:text-white'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Outline Style */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'စာလုံး အနားလိုင်း (Outline)' : 'Outline & Shadow'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['black', 'glow', 'none'] as const).map((out) => (
                    <button
                      key={out}
                      type="button"
                      onClick={() => onUpdateProject({ subtitleOutline: out })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        currentProject.subtitleOutline === out
                          ? 'bg-[#F04452] text-white'
                          : 'bg-[#0E1017] border border-[#242B3D] text-gray-400 hover:text-white'
                      }`}
                    >
                      {out === 'black' ? 'Black Outline' : out === 'glow' ? 'Red Glow' : 'None'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Background Music, Watermark & Blur Effects */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-[#F04452]" />
              <span>{language === 'my' ? 'အသံနှင့် အထူးပြုလုပ်ချက်များ' : 'Audio Mixing & Effects'}</span>
            </h3>

            <div className="space-y-3">
              {/* BGM selection */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'နောက်ခံ တေးဂီတ အမျိုးအစား' : 'Background Music Track'}
                </label>
                <select
                  value={currentProject.bgMusic}
                  onChange={(e) => onUpdateProject({ bgMusic: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                >
                  <option value="suspense_dark">Suspense Dark Ambient (သည်းထိတ်ရင်ဖို အမှောင်)</option>
                  <option value="dramatic_strings">Dramatic Strings (ဒရာမာ ကြိုးတပ်တူရိယာ)</option>
                  <option value="emotional_piano">Emotional Piano (ရင်ထဲထိရှသော စန္ဒယား)</option>
                  <option value="action_pulse">Action Pulse (အရှိန်မြန် တိုက်ခိုက်မှု)</option>
                  <option value="none">{language === 'my' ? 'တေးဂီတ မထည့်ပါ (None)' : 'No Background Music'}</option>
                </select>
              </div>

              {/* BGM Volume */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-gray-300">{t.bgMusicVolume}</span>
                  <span className="font-mono text-amber-400">{Math.round(currentProject.bgMusicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentProject.bgMusicVolume}
                  onChange={(e) => onUpdateProject({ bgMusicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#F04452] cursor-pointer"
                />
              </div>

              {/* Original Audio Volume */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-semibold text-gray-300">
                    {language === 'my' ? 'မူရင်း ဗီဒီယို အသံပမာဏ' : 'Original Video Volume'}
                  </span>
                  <span className="font-mono text-amber-400">{Math.round(currentProject.originalAudioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentProject.originalAudioVolume}
                  onChange={(e) => onUpdateProject({ originalAudioVolume: parseFloat(e.target.value) })}
                  className="w-full accent-[#F04452] cursor-pointer"
                />
              </div>

              {/* Watermark text & position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {t.watermarkLabel}
                  </label>
                  <input
                    type="text"
                    value={currentProject.watermarkText}
                    onChange={(e) => onUpdateProject({ watermarkText: e.target.value })}
                    placeholder="TAI RECAP AI"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {language === 'my' ? 'ရေစာ နေရာ' : 'Position'}
                  </label>
                  <select
                    value={currentProject.watermarkPosition || 'top_right'}
                    onChange={(e) => onUpdateProject({ watermarkPosition: e.target.value as any })}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                  >
                    <option value="top_right">Top Right (အပေါ် ညာ)</option>
                    <option value="top_left">Top Left (အပေါ် ဘယ်)</option>
                    <option value="bottom_right">Bottom Right (အောက် ညာ)</option>
                    <option value="bottom_left">Bottom Left (အောက် ဘယ်)</option>
                  </select>
                </div>
              </div>

              {/* Blur Region & Strength */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {language === 'my' ? 'မှုန်ဝါးခြင်း အပိုင်း' : 'Blur Region'}
                  </label>
                  <select
                    value={currentProject.blurRegion}
                    onChange={(e) => onUpdateProject({ blurRegion: e.target.value as any })}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                  >
                    <option value="none">None (မထည့်ပါ)</option>
                    <option value="corners">Corners (ထောင့်စွန်းများ)</option>
                    <option value="letterbox">Letterbox (အထက်/အောက်)</option>
                    <option value="center">Center (အလယ်ဗဟို)</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-300">
                      {language === 'my' ? 'အဆင့်' : 'Strength'}
                    </span>
                    <span className="font-mono text-amber-400">{currentProject.blurStrength || 10}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={currentProject.blurStrength || 10}
                    onChange={(e) => onUpdateProject({ blurStrength: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#F04452] cursor-pointer mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Video Rendering & Export */}
      {activeTab === 'export' && (
        <div className="space-y-5">
          {/* Render Settings Panel */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[#F04452]" />
              <span>{t.renderReady}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {t.aspectRatioLabel}
                </label>
                <select
                  value={currentProject.aspectRatio}
                  onChange={(e) => onUpdateProject({ aspectRatio: e.target.value as AspectRatio })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                >
                  <option value="9:16">9:16 (TikTok, Shorts, Reels)</option>
                  <option value="16:9">16:9 (YouTube, Cinema)</option>
                  <option value="1:1">1:1 (Facebook, Square)</option>
                  <option value="3:4">3:4 (Portrait Feed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {t.resolutionLabel}
                </label>
                <select
                  value={currentProject.resolution}
                  onChange={(e) => onUpdateProject({ resolution: e.target.value as Resolution })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white focus:outline-none focus:border-[#F04452]"
                >
                  <option value="720p">720p HD ({language === 'my' ? 'စံနှုန်း' : 'Recommended'})</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="480p">480p SD ({language === 'my' ? 'အမြန်' : 'Fast'})</option>
                  <option value="4K">4K UHD (High Compute)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'ဗီဒီယို ကုဒ်ဒက်' : 'Video Codec'}
                </label>
                <div className="p-2 rounded-lg bg-[#0E1017] border border-[#242B3D] text-xs text-gray-300 font-mono">
                  H.264 / AAC (MP4)
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  {language === 'my' ? 'ထုတ်လုပ်မည့် အင်ဂျင်' : 'Rendering Engine'}
                </label>
                <div className="p-2 rounded-lg bg-[#0E1017] border border-[#242B3D] text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  FFmpeg Linux v4.4.2
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportVideo}
                disabled={renderJob?.status === 'processing'}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_25px_rgba(240,68,82,0.4)] transition-all cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5 text-white" />
                <span>{renderJob?.status === 'processing' ? t.exporting : t.exportVideo}</span>
              </button>
            </div>
          </div>

          {/* Real-time Render Progress Job Card */}
          {renderJob && (
            <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#F04452]" />
                  Job ID: {renderJob.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    renderJob.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : renderJob.status === 'failed'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  }`}
                >
                  {renderJob.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{renderJob.stage}</span>
                  <span className="font-mono text-white font-bold">{renderJob.progress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#0E1017] overflow-hidden p-0.5 border border-[#242B3D]">
                  <div
                    style={{ width: `${renderJob.progress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#F04452] to-[#FF6B6B] transition-all duration-300"
                  />
                </div>
              </div>

              {/* Render Output Video Player & Downloads */}
              {renderJob.status === 'completed' && renderJob.outputVideoUrl && (
                <div className="pt-4 border-t border-[#1F2432] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.renderSuccess}
                    </span>
                    {renderJob.fileSize && (
                      <span className="text-xs text-gray-400 font-mono">
                        {(renderJob.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>

                  {/* Video Player */}
                  <div className="relative rounded-xl overflow-hidden bg-black max-w-xl mx-auto border border-[#222838] aspect-video">
                    <video
                      src={renderJob.outputVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Download Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`${renderJob.outputVideoUrl}?download=true`}
                      download={`recap_${currentProject.title.replace(/\s+/g, '_')}.mp4`}
                      className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.downloadMp4}</span>
                    </a>

                    {renderJob.outputSrtUrl && (
                      <a
                        href={`${renderJob.outputSrtUrl}?download=true`}
                        download={`subtitles_${currentProject.title.replace(/\s+/g, '_')}.srt`}
                        className="py-2.5 px-4 rounded-xl font-semibold text-xs text-gray-200 bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] inline-flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>{t.downloadSrt}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

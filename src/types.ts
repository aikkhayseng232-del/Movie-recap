export type PageId =
  | 'dashboard'
  | 'auto'
  | 'recap'
  | 'transcript'
  | 'voice'
  | 'projects'
  | 'downloads'
  | 'presets'
  | 'settings'
  | 'help';

export type AspectRatio = '9:16' | '16:9' | '1:1' | '3:4';
export type Resolution = '480p' | '720p' | '1080p' | '4K';
export type NarrativeStyle =
  | 'cinematic'
  | 'suspense'
  | 'emotional'
  | 'dramatic'
  | 'documentary'
  | 'fast_paced';

export interface SceneItem {
  sceneNumber: number;
  timestamp: string;
  title: string;
  narrationText: string;
  visualNotes?: string;
}

export interface VideoMetadata {
  durationSec?: number;
  width?: number;
  height?: number;
  fileSizeFormatted?: string;
  mimeType?: string;
  filename?: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  sourceType: 'video' | 'text' | 'sample';
  sourceVideoPath: string;
  sourceVideoName: string;
  sourceVideoSize?: number;
  videoMetadata?: VideoMetadata;
  durationMinutes: number;
  isCustomDuration?: boolean;
  customDurationMinutes?: number;
  customDurationSeconds?: number;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  style: NarrativeStyle;
  script: string;
  scenes: SceneItem[];
  hook: string;
  ttsAudioUrl?: string;
  ttsProvider?: 'google-burmese' | 'gemini-tts' | 'google-cloud';
  ttsVoice: string;
  ttsSpeed: number;
  bgMusic: string;
  bgMusicVolume: number;
  originalAudioVolume: number;
  subtitlesEnabled: boolean;
  subtitleLanguage: 'my' | 'en';
  subtitleColor: string;
  subtitleSize: 'small' | 'medium' | 'large';
  subtitlePosition: 'bottom' | 'center' | 'top';
  subtitleOutline: 'black' | 'glow' | 'none';
  watermarkText: string;
  watermarkPosition: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left';
  watermarkOpacity: number;
  blurRegion: 'none' | 'corners' | 'letterbox' | 'center';
  blurStrength: number;
  lastRenderJobId?: string;
  lastRenderVideoUrl?: string;
  lastRenderSrtUrl?: string;
  updatedAt: number;
  createdAt: number;
}

export interface RenderJobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  outputVideoUrl?: string;
  outputSrtUrl?: string;
  fileSize?: number;
  error?: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'subtitles';
  url: string;
  filename: string;
  date: string;
  size?: string;
}

export interface Preset {
  id: string;
  nameMy: string;
  nameEn: string;
  descMy: string;
  descEn: string;
  badge: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  durationMinutes: number;
  style: NarrativeStyle;
  bgMusic: string;
  subtitlesEnabled: boolean;
  watermarkText: string;
}

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

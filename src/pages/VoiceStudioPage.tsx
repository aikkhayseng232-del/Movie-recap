import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Play,
  Pause,
  Download,
  Sparkles,
  Volume2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Radio,
  HelpCircle,
  ShieldAlert,
  Server,
  Layers,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import { translations, Language } from '../locales/translations';
import { TTSProviderInfo } from '../types';

interface VoiceStudioPageProps {
  onAddDownload: (item: any) => void;
  language: Language;
}

export const VoiceStudioPage: React.FC<VoiceStudioPageProps> = ({
  onAddDownload,
  language,
}) => {
  const t = translations[language];

  const defaultSampleBurmese = `ဒီရုပ်ရှင်ဟာ စုံထောက်မင်းသူနဲ့ အမှောင်ထုထဲက လျှို့ဝှက်လူသတ်သမားတစ်ယောက်ရဲ့ အသည်းတယားယား အသက်လုတိုက်ပွဲအကြောင်း ဖြစ်ပါတယ်။ ဇာတ်လမ်းအဆုံးသတ်မှာ မထင်မှတ်ထားတဲ့ အလှည့်အပြောင်းက ပရိသတ်ကြီးကို အံ့ဩမှင်တက်သွားစေမှာ အသေအချာပါပဲ။`;

  // Main input state
  const [text, setText] = useState(defaultSampleBurmese);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('google-burmese');
  const [voiceName, setVoiceName] = useState('Kore');
  const [speed, setSpeed] = useState(1.0);
  const [stylePreset, setStylePreset] = useState('cinematic');

  // Providers & Diagnostics
  const [providers, setProviders] = useState<TTSProviderInfo[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [browserBurmeseVoice, setBrowserBurmeseVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [hasScannedBrowserVoices, setHasScannedBrowserVoices] = useState(false);
  const [browserVoicesCount, setBrowserVoicesCount] = useState(0);

  // Generation & Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState<{ percent: number; message: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string; code?: string } | null>(null);

  // Audio Playback state
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [audioMetadata, setAudioMetadata] = useState<{
    durationSec: number;
    fileSizeBytes: number;
    codec: string;
    sampleRate: number;
    providerName: string;
    filename: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Show Setup Modal/Drawer
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // History of generated narrations
  const [history, setHistory] = useState<
    Array<{
      id: string;
      provider: string;
      voice: string;
      date: string;
      url: string;
      snippet: string;
      durationSec: number;
      sizeFormatted: string;
    }>
  >([]);

  // 1. Fetch available providers from server
  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const res = await fetch('/api/tts/providers');
      if (res.ok) {
        const data = await res.json();
        if (data.providers && Array.isArray(data.providers)) {
          setProviders(data.providers);
          // Set initial provider if not set
          if (!selectedProviderId && data.defaultProviderId) {
            setSelectedProviderId(data.defaultProviderId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load TTS providers:', err);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // 2. Scan Browser Speech Synthesis for local Burmese voice
  const scanBrowserVoices = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setHasScannedBrowserVoices(true);
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setBrowserVoicesCount(voices.length);
      const myVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('my') ||
          v.lang.toLowerCase().includes('mya') ||
          v.name.toLowerCase().includes('burmese') ||
          v.name.toLowerCase().includes('myanmar')
      );
      setBrowserBurmeseVoice(myVoice || null);
      setHasScannedBrowserVoices(true);
    };

    checkVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
  };

  useEffect(() => {
    scanBrowserVoices();
  }, []);

  // Currently selected provider object
  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0] || {
    id: 'google-burmese',
    name: 'Google Native Burmese TTS',
    nameMy: 'Google မြန်မာဘာသာ တိုက်ရိုက် စကားပြောစနစ် (Native)',
    supportsBurmese: true,
    available: true,
    supportsVoices: false,
    supportsSpeed: true,
    speedRange: { min: 0.75, max: 1.5, default: 1.0, step: 0.05 },
    requiresApiKey: false,
    isDefault: true,
    description: 'Native Burmese pronunciation engine with high accuracy Myanmar phoneme support',
    supportedVoices: [],
  };

  // Handle Audio Synthesis
  const handleGenerate = async () => {
    if (!text.trim()) {
      setStatusMsg({
        type: 'error',
        text: language === 'my' ? 'ဖတ်ကြားရမည့် စာသားကို ရိုက်ထည့်ပါ' : 'Please enter narration text',
      });
      return;
    }

    setIsGenerating(true);
    setStatusMsg(null);
    setProgressStage({
      percent: 15,
      message: language === 'my' ? 'စာသားကို စစ်ဆေးပြီး အသံဖိုင် စတင်ဖန်တီးနေပါသည်...' : 'Validating text and preparing synthesis...',
    });

    try {
      // Simulate stepped progress during multi-chunk generation
      const progressTimer1 = setTimeout(() => {
        setProgressStage({
          percent: 45,
          message:
            language === 'my'
              ? 'မြန်မာအသံဖိုင် အပိုင်းများကို စီစဉ်ပေါင်းစပ်နေပါသည်...'
              : 'Synthesizing Burmese audio segments...',
        });
      }, 1200);

      const progressTimer2 = setTimeout(() => {
        setProgressStage({
          percent: 75,
          message:
            language === 'my'
              ? 'အသံအပိုင်းများကို ချိတ်ဆက်ပြီး အမြန်နှုန်း ညှိယူနေပါသည်...'
              : 'Concatenating audio & adjusting tempo with FFmpeg...',
        });
      }, 2400);

      const progressTimer3 = setTimeout(() => {
        setProgressStage({
          percent: 90,
          message:
            language === 'my'
              ? 'ffprobe ဖြင့် အသံဖိုင် အရည်အသွေးကို စစ်ဆေးနေပါသည်...'
              : 'Validating audio integrity with ffprobe...',
        });
      }, 3600);

      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          providerId: selectedProviderId,
          voiceId: activeProvider.supportsVoices ? voiceName : undefined,
          speed: activeProvider.supportsSpeed ? speed : 1.0,
          style: `Cinematic movie recap narration, style: ${stylePreset}`,
        }),
      });

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'TTS Synthesis failed');
      }

      // Validated audio response
      setProgressStage({
        percent: 100,
        message: language === 'my' ? 'မြန်မာအသံဖိုင် အောင်မြင်စွာ ဖန်တီးပြီးစီးပါပြီ!' : 'Audio synthesized successfully!',
      });

      setCurrentAudioUrl(data.audioUrl);
      setAudioMetadata({
        durationSec: data.durationSec,
        fileSizeBytes: data.fileSizeBytes,
        codec: data.validation?.codec || data.format,
        sampleRate: data.validation?.sampleRate || 24000,
        providerName: data.providerName,
        filename: data.filename,
      });

      setStatusMsg({
        type: 'success',
        text:
          language === 'my'
            ? `မြန်မာအသံဖိုင် ဖန်တီးမှု အောင်မြင်ပါသည် (${data.durationSec}s, ${(data.fileSizeBytes / 1024).toFixed(1)} KB)`
            : `Narration audio generated successfully (${data.durationSec}s, ${(data.fileSizeBytes / 1024).toFixed(1)} KB)`,
      });

      const newEntry = {
        id: `tts_${Date.now()}`,
        provider: data.providerName,
        voice: activeProvider.supportsVoices ? voiceName : 'Native Voice',
        date: new Date().toLocaleTimeString(),
        url: data.audioUrl,
        snippet: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        durationSec: data.durationSec,
        sizeFormatted: `${(data.fileSizeBytes / 1024).toFixed(1)} KB`,
      };
      setHistory((prev) => [newEntry, ...prev]);

      onAddDownload({
        id: newEntry.id,
        title: `Burmese Narration (${activeProvider.supportsVoices ? voiceName : 'Native'})`,
        type: 'audio',
        url: data.audioUrl,
        filename: data.filename || `narration_${Date.now()}.mp3`,
        date: new Date().toLocaleDateString(),
        size: newEntry.sizeFormatted,
      });
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setStatusMsg({
        type: 'error',
        text: err.message || (language === 'my' ? 'အသံဖိုင် ဖန်တီးခြင်း မအောင်မြင်ပါ' : 'TTS Generation failed'),
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgressStage(null), 3500);
    }
  };

  // Local Browser Speech Test (Diagnostic)
  const handleTestBrowserSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('SpeechSynthesis is not supported on your browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 150));
    if (browserBurmeseVoice) {
      utterance.voice = browserBurmeseVoice;
      utterance.lang = browserBurmeseVoice.lang;
    }
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Studio Header */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#F04452]" />
            <span>{t.voiceTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'my'
              ? 'စစ်မှန်သော မြန်မာဘာသာ အသံဖိုင် (Burmese Audio) ဖန်တီးခြင်းနှင့် အသံစနစ် စီမံခန့်ခွဲမှု'
              : 'Real Burmese audio narration synthesis and multi-provider voice studio'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#1C2233] border border-[#2B3549] text-xs text-gray-300 hover:text-white hover:border-[#F04452] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#F04452]" />
            <span>{language === 'my' ? 'အသံစနစ် လမ်းညွှန် (Setup)' : 'TTS Setup Guide'}</span>
          </button>

          <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-[#1A1F2C] border border-[#2B3549] text-xs text-gray-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-semibold">{activeProvider.name}</span>
          </div>
        </div>
      </div>

      {/* Setup Guide Card (Collapsible) */}
      {showSetupGuide && (
        <div className="p-5 rounded-2xl bg-[#101420] border border-[#2B3549] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F04452]" />
              <span>{language === 'my' ? 'TAI RECAP AI အသံစနစ် တည်ဆောက်ပုံနှင့် လမ်းညွှန်' : 'TTS Architecture & Setup Instructions'}</span>
            </h3>
            <button
              onClick={() => setShowSetupGuide(false)}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#242C3D] space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Google Native Burmese TTS</span>
              </div>
              <p className="text-gray-300">
                {language === 'my'
                  ? 'မြန်မာယူနီကုဒ် အသံထွက်ကို တိုက်ရိုက်ဖတ်ကြားနိုင်ပြီး စာသားရှည်များကို စာကြောင်းအလိုက် ခွဲခြားချိတ်ဆက်ပေးပါသည်။ API key မလိုအပ်ဘဲ ချက်ချင်း အသုံးပြုနိုင်ပါသည်။'
                  : 'Native Myanmar Unicode pronunciation engine with automatic sentence chunking & FFmpeg tempo control. Works out-of-the-box with no API keys.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#242C3D] space-y-1.5">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Gemini 3.8 Flash TTS</span>
              </div>
              <p className="text-gray-300">
                {language === 'my'
                  ? 'Google GenAI SDK ဖြင့် Kore, Fenrir, Puck, Zephyr အသံစတိုင်များကို ရွေးချယ်နိုင်ပါသည်။ Server-side GEMINI_API_KEY ကို AI Studio Secrets တွင် ထည့်သွင်းထားရန် လိုအပ်ပါသည်။'
                  : 'Multi-voice neural studio powered by @google/genai with voice personas. Credentials remain securely on the server.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161B26] border border-[#242C3D] space-y-1.5">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>Local Browser Speech Fallback</span>
              </div>
              <p className="text-gray-300">
                {language === 'my'
                  ? 'စက်တွင်း Web Speech API စနစ်။ သင့် Device/OS တွင် မြန်မာအသံဖိုင် မရှိပါက အသံထွက်မှားယွင်းခြင်း မဖြစ်စေရန် Server-side Native TTS သို့ အလိုအလျောက် လွှဲပြောင်းပေးပါသည်။'
                  : 'Optional local client preview. Checks real installed voices and prevents misleading speech if no Burmese voice pack exists on device.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress & Real-time Status Card */}
      {isGenerating && progressStage && (
        <div className="p-4 rounded-xl bg-[#161B28] border border-[#F04452]/40 shadow-[0_0_20px_rgba(240,68,82,0.15)] space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-[#F04452] animate-spin" />
              <span>{progressStage.message}</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{progressStage.percent}%</span>
          </div>
          <div className="w-full bg-[#0A0C12] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#F04452] to-[#FF6B78] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressStage.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Alert Banner */}
      {statusMsg && !isGenerating && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            statusMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>
      )}

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Script Text Input & Realtime Word Count */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">
                {language === 'my' ? 'ဖတ်ကြားရမည့် မြန်မာဘာသာ စာသား (Burmese Script)' : 'Narration Script'}
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {text.length} chars • ~{Math.round(text.split(/\s+/).filter(Boolean).length / 2.3)}s duration
              </span>
            </div>

            <textarea
              rows={11}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ရုပ်ရှင်ဇာတ်ညွှန်း သို့မဟုတ် ဖတ်ကြားလိုသော မြန်မာစာသားကို ရိုက်ထည့်ပါ..."
              className="w-full p-4 rounded-xl bg-[#0E1017] border border-[#262D3D] text-sm text-white focus:outline-none focus:border-[#F04452] leading-relaxed resize-y font-sans"
            />

            {/* Quick Sample Selector */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-[11px]">
              <span className="text-gray-400 shrink-0">{language === 'my' ? 'နမူနာ စာသားများ:' : 'Samples:'}</span>
              <button
                type="button"
                onClick={() =>
                  setText(
                    'ဒီရုပ်ရှင်ဟာ စုံထောက်မင်းသူနဲ့ အမှောင်ထုထဲက လျှို့ဝှက်လူသတ်သမားတစ်ယောက်ရဲ့ အသည်းတယားယား အသက်လုတိုက်ပွဲအကြောင်း ဖြစ်ပါတယ်။'
                  )
                }
                className="py-1 px-2.5 rounded-lg bg-[#1C2233] text-gray-300 hover:text-white hover:bg-[#252E45] transition-colors shrink-0"
              >
                သည်းထိတ်ရင်ဖို (Thriller)
              </button>
              <button
                type="button"
                onClick={() =>
                  setText(
                    'စွန့်ပစ်စက်ရုံဟောင်းကြီးအတွင်းမှာ နှစ်ဖက်ရင်ဆိုင်တိုက်ခိုက်ကြတဲ့ အခိုက်အတန့်ဟာ ရင်တမမ ဖြစ်စရာပါ။ သေနတ်သံတွေကြားမှာ မင်းသူဟာ ဒဏ်ရာပြင်းထန်စွာ ရရှိသွားခဲ့ပါတယ်။'
                  )
                }
                className="py-1 px-2.5 rounded-lg bg-[#1C2233] text-gray-300 hover:text-white hover:bg-[#252E45] transition-colors shrink-0"
              >
                အက်ရှင်တိုက်ခိုက်မှု (Action)
              </button>
              <button
                type="button"
                onClick={() =>
                  setText(
                    'တရားမျှတမှုဟာ အချိန်ယူရပေမဲ့ အမှန်တရားကတော့ အမြဲအနိုင်ရစမြဲပါ။ နောက်ထပ် စိတ်လှုပ်ရှားစရာ ရုပ်ရှင်အကျဉ်းချုပ်တွေကို ကြည့်ရှုဖို့ Channel ကို Like and Subscribe လုပ်ထားဖို့ မမေ့နဲ့နော်။'
                  )
                }
                className="py-1 px-2.5 rounded-lg bg-[#1C2233] text-gray-300 hover:text-white hover:bg-[#252E45] transition-colors shrink-0"
              >
                နိဂုံး (Outro)
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isGenerating
                    ? language === 'my'
                      ? 'မြန်မာအသံဖိုင် ဖန်တီးနေပါသည်...'
                      : 'Synthesizing Audio...'
                    : language === 'my'
                    ? 'မြန်မာအသံဖိုင် စစ်မှန်စွာ ထုတ်ယူမည် (Generate Real Narration)'
                    : 'Generate Real Burmese Audio'}
                </span>
              </button>
            </div>
          </div>

          {/* Local Browser Speech Diagnostics Card */}
          <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'my' ? 'စက်တွင်း စကားပြောစနစ် စစ်ဆေးတွေ့ရှိချက် (Local Browser Diagnostic)' : 'Local Browser Speech Diagnostics'}</span>
              </h4>
              <button
                type="button"
                onClick={scanBrowserVoices}
                className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'my' ? 'ပြန်လည်စစ်ဆေး' : 'Rescan'}</span>
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[#0E1017] border border-[#222838] text-xs">
              {browserBurmeseVoice ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'my' ? 'စက်တွင်း မြန်မာအသံ တွေ့ရှိပါသည်' : 'Local Burmese Voice Found'}</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    Voice: {browserBurmeseVoice.name} ({browserBurmeseVoice.lang})
                  </p>
                  <button
                    type="button"
                    onClick={handleTestBrowserSpeech}
                    className="mt-2 py-1 px-3 rounded-lg bg-[#1C2233] text-gray-200 hover:text-white text-[11px] font-semibold"
                  >
                    စက်တွင်း အသံဖြင့် စမ်းသပ်နားဆင်ရန် (Test Local Voice)
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'my'
                        ? 'သင့် Browser/OS တွင် မြန်မာဘာသာ အသံဖိုင် (Burmese Voice Pack) မရှိသေးပါ'
                        : 'No local Burmese voice package installed in your browser/OS'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    {language === 'my'
                      ? 'စက်တွင်း Web Speech API အသုံးပြုပါက အင်္ဂလိပ်အသံထွက်ဖြင့် ဖတ်ပြမည်ဖြစ်သဖြင့် Server-side Google Native Burmese TTS ဖြင့်သာ စစ်မှန်သော မြန်မာအသံဖိုင်ကို ဖန်တီးပေးထားပါသည်။'
                      : 'To prevent awkward English phoneme readings of Burmese Unicode, TAI RECAP AI automatically routes all narration to the server-side Native Burmese TTS engine.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Providers, Voice Personas & Real Audio Player */}
        <div className="lg:col-span-5 space-y-4">
          {/* Provider Selection */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#F04452]" />
                <span>{language === 'my' ? 'အသံစနစ် ရွေးချယ်ရန် (TTS Provider)' : 'Select TTS Engine'}</span>
              </span>
              <span className="text-[10px] text-gray-400">
                {providers.filter((p) => p.available).length} Active
              </span>
            </h3>

            <div className="space-y-2">
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProviderId(p.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedProviderId === p.id
                      ? 'bg-[#1C2233] border-[#F04452] text-white shadow-sm'
                      : 'bg-[#0E1017] border-[#222838] text-gray-300 hover:bg-[#141824]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>{language === 'my' ? p.nameMy : p.name}</span>
                      {p.isDefault && (
                        <span className="text-[9px] py-0.5 px-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {language === 'my' ? 'မူလစံနှုန်း' : 'Default'}
                        </span>
                      )}
                      {!p.available && (
                        <span className="text-[9px] py-0.5 px-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {language === 'my' ? 'Key လိုအပ်' : 'Key Required'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{p.description}</div>
                  </div>
                  {selectedProviderId === p.id && <Check className="w-4 h-4 text-[#F04452] shrink-0" />}
                </button>
              ))}
            </div>

            {/* Provider Notes */}
            {activeProvider.reasonUnavailable && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{activeProvider.reasonUnavailable}</span>
              </div>
            )}
          </div>

          {/* Voice Personas (Enabled only when provider supports multiple voices) */}
          <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#F04452]" />
                <span>{t.selectVoice}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-normal">
                {activeProvider.supportsVoices
                  ? `${activeProvider.supportedVoices.length} Voices`
                  : language === 'my'
                  ? 'သဘာဝ မြန်မာအသံ'
                  : 'Single Native Voice'}
              </span>
            </h3>

            {activeProvider.supportsVoices ? (
              <div className="space-y-2">
                {activeProvider.supportedVoices.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoiceName(v.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      voiceName === v.id
                        ? 'bg-[#1C2233] border-[#F04452] text-white shadow-sm'
                        : 'bg-[#0E1017] border-[#222838] text-gray-300 hover:bg-[#141824]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{v.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({v.nameMy})</span>
                      </div>
                      <div className="text-[10px] text-gray-500">{v.description}</div>
                    </div>
                    {voiceName === v.id && <CheckCircle2 className="w-4 h-4 text-[#F04452] shrink-0" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#0E1017] border border-[#222838] text-xs text-gray-300 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'my' ? 'မြန်မာဘာသာ သဘာဝဇာတ်လမ်းပြော အသံ (Native Voice)' : 'Native Burmese Voice Active'}</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {language === 'my'
                    ? 'ဤ Engine သည် မြန်မာစာလုံးပေါင်းနှင့် သံနေသံထား တိကျမှန်ကန်မှုကို ဦးစားပေးထားသဖြင့် သဘာဝကျသော အသံတစ်မျိုးတည်းကို အသုံးပြုထားပါသည်။'
                    : 'This engine focuses on maximum pronunciation accuracy for Myanmar Unicode.'}
                </p>
              </div>
            )}

            {/* Speaking Rate (Tempo adjustment) */}
            {activeProvider.supportsSpeed && (
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-300">{t.voiceSpeed}</span>
                  <span className="font-mono text-amber-400">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={activeProvider.speedRange.min}
                  max={activeProvider.speedRange.max}
                  step={activeProvider.speedRange.step}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#F04452] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>{activeProvider.speedRange.min}x (နှေး)</span>
                  <span>1.0x (စံနှုန်း)</span>
                  <span>{activeProvider.speedRange.max}x (မြန်)</span>
                </div>
              </div>
            )}
          </div>

          {/* Validated Audio Output Player */}
          {currentAudioUrl && audioMetadata && (
            <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>{t.audioPreview}</span>
                </h3>
                <span className="text-[10px] py-0.5 px-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Validated ({audioMetadata.codec.toUpperCase()})
                </span>
              </div>

              {/* Audio Player Component */}
              <div className="p-4 rounded-xl bg-[#0E1017] border border-[#242B3D] space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                  <span>{audioMetadata.filename}</span>
                  <span className="text-emerald-400 font-bold">
                    {audioMetadata.durationSec}s • {(audioMetadata.fileSizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <audio
                  ref={audioRef}
                  src={currentAudioUrl}
                  controls
                  className="w-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`${currentAudioUrl}?download=true`}
                    download={audioMetadata.filename}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {language === 'my'
                        ? `အသံဖိုင် ဒေါင်းလုဒ်ရယူမည် (${(audioMetadata.fileSizeBytes / 1024).toFixed(1)} KB)`
                        : `Download Validated Audio (${(audioMetadata.fileSizeBytes / 1024).toFixed(1)} KB)`}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

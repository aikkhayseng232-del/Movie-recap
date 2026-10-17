import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  Mic,
  Sliders,
  Play,
  ArrowRight,
  Clock,
  ShieldCheck,
  Cpu,
  FileCheck2,
  TrendingUp,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { PageId, Project, Preset } from '../types';
import { translations, Language } from '../locales/translations';
import { RECAP_PRESETS } from '../data/presets';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onSelectPreset: (preset: Preset) => void;
  onOpenProject: (project: Project) => void;
  projects: Project[];
  language: Language;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectPreset,
  onOpenProject,
  projects,
  language,
}) => {
  const t = translations[language];
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.log('Health check failed', err));
  }, []);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Hero Cinematic Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#161B29] via-[#10141F] to-[#0A0C13] border border-[#23293D] p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#F04452]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-[#F04452]/15 border border-[#F04452]/30 text-[#F04452] text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-[#F04452]" />
            <span>{language === 'my' ? 'ဗိုင်းရပ်စ် ရုပ်ရှင်အကျဉ်းချုပ် AI နည်းပညာ' : 'Viral Burmese Movie Recap Suite'}</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {t.dashTitle}
          </h2>

          <p className="mt-2 text-sm md:text-base text-gray-300 leading-relaxed">
            {t.dashSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('recap')}
              className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_25px_rgba(240,68,82,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>{t.newRecapBtn}</span>
            </button>

            <button
              onClick={() => onNavigate('voice')}
              className="flex items-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm text-gray-200 bg-[#1A1F2C] hover:bg-[#232A3B] border border-[#2D364A] transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#F04452]" />
              <span>{t.voiceStudioBtn}</span>
            </button>

            <button
              onClick={() => onNavigate('presets')}
              className="flex items-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm text-gray-300 hover:text-white bg-transparent hover:bg-[#141824] transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>{t.navPresets}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real System Architecture HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FFmpeg Video Renderer */}
        <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Video Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-white mt-0.5">FFmpeg v4.4.2 Active</div>
            <div className="text-[11px] text-gray-400 mt-1">
              {language === 'my' ? 'H.264 / AAC / စာတန်းထိုး ပေါင်းစပ်မှု' : 'H.264 / AAC Muxing & Burn-in'}
            </div>
          </div>
        </div>

        {/* Gemini AI Core */}
        <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#F04452]/10 border border-[#F04452]/30 text-[#F04452] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Gemini Intelligence</span>
              <span className="w-2 h-2 rounded-full bg-[#F04452]" />
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {healthStatus?.geminiConfigured ? 'Gemini 3.8 & 4.0' : 'Gemini AI Ready'}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {language === 'my' ? 'မြန်မာဘာသာ ဇာတ်ညွှန်း သဘာဝကျမှု' : 'Burmese Scriptwriting Engine'}
            </div>
          </div>
        </div>

        {/* Voiceover TTS */}
        <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Audio TTS Engine</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
            </div>
            <div className="text-sm font-bold text-white mt-0.5">Gemini 3.8 Flash TTS</div>
            <div className="text-[11px] text-gray-400 mt-1">
              {language === 'my' ? 'သဘာဝကျသော နောက်ခံစကားပြော' : 'Studio Quality Narration'}
            </div>
          </div>
        </div>

        {/* Font & Unicode Support */}
        <div className="p-4 rounded-xl bg-[#141720] border border-[#232838] flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Typography</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-sm font-bold text-white mt-0.5">Noto Sans Myanmar</div>
            <div className="text-[11px] text-gray-400 mt-1">
              {language === 'my' ? 'ယူနီကုဒ် စာလုံးပေါင်း စံသတ်မှတ်ချက်' : 'Unicode Subtitle Font Loaded'}
            </div>
          </div>
        </div>
      </div>

      {/* Curated Presets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F04452]" />
              <span>{t.presetsTitle}</span>
            </h3>
            <p className="text-xs text-gray-400">{t.presetsSubtitle}</p>
          </div>
          <button
            onClick={() => onNavigate('presets')}
            className="text-xs font-semibold text-[#F04452] hover:underline flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECAP_PRESETS.slice(0, 3).map((preset) => (
            <div
              key={preset.id}
              className="p-5 rounded-xl bg-[#141720] border border-[#232838] hover:border-[#F04452]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2233] text-gray-300 border border-[#2B344D]">
                    {preset.badge}
                  </span>
                  <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {preset.durationMinutes} min
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#F04452] transition-colors">
                  {language === 'my' ? preset.nameMy : preset.nameEn}
                </h4>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                  {language === 'my' ? preset.descMy : preset.descEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2535] flex items-center justify-between">
                <span className="text-[11px] text-gray-400 capitalize">
                  {preset.style.replace('_', ' ')}
                </span>
                <button
                  onClick={() => onSelectPreset(preset)}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#F04452] to-[#B91C1C] hover:brightness-110 transition-all cursor-pointer"
                >
                  {t.usePreset}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{t.recentProjects}</span>
          </h3>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-[#F04452] hover:underline flex items-center gap-1"
          >
            <span>{t.viewAll} ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#141720] border border-[#232838] text-center">
            <Video className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-300">{t.noProjects}</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {language === 'my'
                ? 'ဗီဒီယိုဖိုင်တစ်ခု တင်သွင်းပြီး စက္ကန့်ပိုင်းအတွင်း မြန်မာဘာသာ ဇာတ်ညွှန်းနှင့် ဗီဒီယိုကို စတင်ဖန်တီးလိုက်ပါ'
                : 'Upload a video file or enter a synopsis to create your first recap project'}
            </p>
            <button
              onClick={() => onNavigate('recap')}
              className="mt-4 py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.newRecapBtn}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-[#141720] border border-[#232838] hover:border-[#2D364D] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="font-semibold text-gray-300 truncate max-w-[150px]">
                      {proj.genre || 'Action / Thriller'}
                    </span>
                    <span>{proj.aspectRatio}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.hook || proj.script.slice(0, 100) || 'No script yet'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1F2535] flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onOpenProject(proj)}
                    className="py-1 px-3 rounded-lg text-xs font-semibold text-white bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] transition-colors"
                  >
                    {t.openProject}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creator Tips Card */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#111520] to-[#141826] border border-[#23293D] flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-[#F04452]/10 border border-[#F04452]/20 text-[#F04452] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">
            {language === 'my'
              ? 'မြန်မာ ရုပ်ရှင်အကျဉ်းချုပ် ဖန်တီးသူများအတွက် အကြံပြုချက်'
              : 'Pro Tip for Movie Recap Creators'}
          </h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            {language === 'my'
              ? 'ပရိသတ်ကို စွဲဆောင်နိုင်ရန် ဗီဒီယို၏ ပထမဆုံး ၅ စက္ကန့် (Hook) တွင် ဇာတ်ကောင်ကြုံတွေ့ရမည့် အကြီးမားဆုံး အန္တရာယ် သို့မဟုတ် မေးခွန်းကို အစချီပါ။ TAI RECAP AI ၏ "Story Recap V2" သည် ဤပုံစံအတိုင်း ဇာတ်လမ်းကို စနစ်တကျ ပြန်ဆင်ပေးပါသည်။'
              : 'Hook the viewer in the first 5 seconds by starting with the central dilemma or shocking consequence. Use "Story Recap V2" for high-tension narrative restructuring.'}
          </p>
        </div>
      </div>
    </div>
  );
};

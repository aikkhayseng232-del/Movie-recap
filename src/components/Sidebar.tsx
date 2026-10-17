import React from 'react';
import {
  LayoutDashboard,
  Video,
  FileText,
  Mic,
  FolderKanban,
  Download,
  Sliders,
  Settings,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PageId } from '../types';
import { BrandLogo } from './BrandLogo';
import { translations, Language } from '../locales/translations';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  language,
}) => {
  const t = translations[language];

  const navItems: { id: PageId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'auto', label: t.navAuto, icon: Zap, badge: 'AUTO' },
    { id: 'recap', label: t.navRecap, icon: Video, badge: 'PRO' },
    { id: 'transcript', label: t.navTranscript, icon: FileText },
    { id: 'voice', label: t.navVoice, icon: Mic },
    { id: 'projects', label: t.navProjects, icon: FolderKanban },
    { id: 'downloads', label: t.navDownloads, icon: Download },
    { id: 'presets', label: t.navPresets, icon: Sliders },
    { id: 'settings', label: t.navSettings, icon: Settings },
    { id: 'help', label: t.navHelp, icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0E1017] border-r border-[#1F2432] shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1F2432]">
        <BrandLogo language={language} />
      </div>

      {/* Primary Action Button */}
      <div className="px-4 py-3">
        <button
          onClick={() => onNavigate('recap')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] transition-all cursor-pointer active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{t.newRecapBtn}</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#181C28] text-white border border-[#F04452]/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#141722]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#F04452]' : 'text-gray-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#F04452]/20 text-[#F04452] border border-[#F04452]/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine Status Card */}
      <div className="p-3 m-3 rounded-xl bg-[#141722] border border-[#232838] text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-gray-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            AI & FFmpeg
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {language === 'my'
            ? 'မြန်မာယူနီကုဒ်နှင့် FFmpeg 4.4.2 တပ်ဆင်ထားပြီး ဖြစ်ပါသည်'
            : 'Gemini 3.8/4.0 & FFmpeg 4.4.2 Engine Active'}
        </p>
      </div>
    </aside>
  );
};

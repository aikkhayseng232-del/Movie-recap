import React from 'react';
import { Globe, Menu, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageId } from '../types';
import { BrandLogo } from './BrandLogo';
import { translations, Language } from '../locales/translations';

interface HeaderProps {
  currentPage: PageId;
  language: Language;
  onToggleLanguage: () => void;
  onOpenMobileMenu: () => void;
  onNavigate: (page: PageId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  language,
  onToggleLanguage,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const t = translations[language];

  const getPageTitle = (page: PageId) => {
    switch (page) {
      case 'dashboard': return t.navDashboard;
      case 'recap': return t.workspaceTitle;
      case 'transcript': return t.navTranscript;
      case 'voice': return t.voiceTitle;
      case 'projects': return t.projectsTitle;
      case 'downloads': return t.downloadsTitle;
      case 'presets': return t.presetsTitle;
      case 'settings': return t.navSettings;
      case 'help': return t.helpTitle;
      default: return t.brandName;
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-[#0E1017]/90 backdrop-blur-md border-b border-[#1F2432] flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#181C28] text-gray-300 hover:text-white border border-[#2A3144] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <BrandLogo size="sm" showTagline={false} language={language} />
        </div>

        <div className="hidden lg:flex flex-col">
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {getPageTitle(currentPage)}
          </h1>
          <span className="text-[11px] text-gray-400 font-medium">
            TAI RECAP AI • {t.tagline}
          </span>
        </div>
      </div>

      {/* Right: Engine Status & Language Switcher */}
      <div className="flex items-center gap-2.5">
        {/* System Online Pill */}
        <div className="hidden sm:flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#121520] border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.statusOnline}</span>
        </div>

        {/* Workspace Quick Jump */}
        {currentPage !== 'recap' && (
          <button
            onClick={() => onNavigate('recap')}
            className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#F04452] to-[#B91C1C] hover:brightness-110 shadow-[0_0_15px_rgba(240,68,82,0.3)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.navRecap}</span>
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[#181C28] hover:bg-[#202636] border border-[#2E364A] text-xs font-medium text-gray-200 transition-colors cursor-pointer"
          title={t.langToggle}
        >
          <Globe className="w-3.5 h-3.5 text-[#F04452]" />
          <span className="font-bold">{language === 'my' ? 'မြန်မာ (MY)' : 'English (EN)'}</span>
        </button>
      </div>
    </header>
  );
};

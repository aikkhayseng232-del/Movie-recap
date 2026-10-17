import React from 'react';
import {
  LayoutDashboard,
  Video,
  Mic,
  FolderKanban,
  Menu,
  X,
  FileText,
  Download,
  Sliders,
  Settings,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { PageId } from '../types';
import { BrandLogo } from './BrandLogo';
import { translations, Language } from '../locales/translations';

interface MobileNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  language,
  isOpen,
  onClose,
}) => {
  const t = translations[language];

  const allNavItems: { id: PageId; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'auto', label: t.navAuto, icon: Zap },
    { id: 'recap', label: t.navRecap, icon: Video },
    { id: 'transcript', label: t.navTranscript, icon: FileText },
    { id: 'voice', label: t.navVoice, icon: Mic },
    { id: 'projects', label: t.navProjects, icon: FolderKanban },
    { id: 'downloads', label: t.navDownloads, icon: Download },
    { id: 'presets', label: t.navPresets, icon: Sliders },
    { id: 'settings', label: t.navSettings, icon: Settings },
    { id: 'help', label: t.navHelp, icon: HelpCircle },
  ];

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Menu */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80%] bg-[#0E1017] border-r border-[#1F2432] p-4 flex flex-col justify-between shadow-2xl z-50">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1F2432]">
                <BrandLogo size="sm" language={language} />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-[#181C28] text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#181C28] text-white border border-[#F04452]/40 font-semibold'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#141722]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F04452]' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F2432] text-center text-xs text-gray-500">
              TAI RECAP AI v2.4 • Made for Mobile & Desktop
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0E1017]/95 backdrop-blur-lg border-t border-[#1F2432] flex items-center justify-around px-2 z-40">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentPage === 'dashboard' ? 'text-[#F04452]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">{t.navDashboard}</span>
        </button>

        <button
          onClick={() => onNavigate('recap')}
          className="relative flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F04452] to-[#D92D3B] flex items-center justify-center text-white shadow-[0_0_20px_rgba(240,68,82,0.5)] border-2 border-[#0E1017]">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 leading-tight">{t.navRecap}</span>
        </button>

        <button
          onClick={() => onNavigate('voice')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentPage === 'voice' ? 'text-[#F04452]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">{t.navVoice}</span>
        </button>

        <button
          onClick={() => onNavigate('projects')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentPage === 'projects' ? 'text-[#F04452]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">{t.navProjects}</span>
        </button>

        <button
          onClick={() => onNavigate('downloads')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg transition-colors ${
            currentPage === 'downloads' ? 'text-[#F04452]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight">{t.navDownloads}</span>
        </button>
      </nav>
    </>
  );
};

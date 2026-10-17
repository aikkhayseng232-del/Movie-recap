import React from 'react';
import {
  Sliders,
  Clock,
  Video,
  Sparkles,
  Music,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { Preset } from '../types';
import { RECAP_PRESETS } from '../data/presets';
import { translations, Language } from '../locales/translations';

interface PresetsPageProps {
  onSelectPreset: (preset: Preset) => void;
  language: Language;
}

export const PresetsPage: React.FC<PresetsPageProps> = ({
  onSelectPreset,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#F04452]" />
            <span>{t.presetsTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">{t.presetsSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#1A1F2C] border border-[#283247] text-xs text-gray-300">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>6 Viral Templates</span>
        </div>
      </div>

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RECAP_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="p-6 rounded-2xl bg-[#141720] border border-[#232838] hover:border-[#F04452]/40 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              {/* Badge & Duration */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1C2233] text-gray-200 border border-[#2B354C]">
                  {preset.badge}
                </span>
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {preset.durationMinutes} min
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-base font-bold text-white group-hover:text-[#F04452] transition-colors">
                {language === 'my' ? preset.nameMy : preset.nameEn}
              </h3>

              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                {language === 'my' ? preset.descMy : preset.descEn}
              </p>

              {/* Attributes Checklist */}
              <div className="mt-4 pt-3 border-t border-[#1F2535] space-y-2 text-xs text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Aspect Ratio:</span>
                  <span className="font-mono font-bold text-white">{preset.aspectRatio}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Resolution:</span>
                  <span className="font-mono text-emerald-400">{preset.resolution}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Style:</span>
                  <span className="capitalize text-white">{preset.style.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Background Score:</span>
                  <span className="text-indigo-400 flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    {preset.bgMusic.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="mt-6 pt-4 border-t border-[#1F2535]">
              <button
                onClick={() => onSelectPreset(preset)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t.usePreset}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

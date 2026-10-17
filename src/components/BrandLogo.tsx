import React from 'react';
import { Film, Sparkles, Play } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  language?: 'my' | 'en';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  language = 'my',
}) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#F04452] to-[#B91C1C] opacity-70 blur-sm animate-pulse" />
        
        {/* Film Emblem */}
        <div className="relative w-10 h-10 rounded-xl bg-[#141720] border border-[#F04452]/50 flex items-center justify-center shadow-inner">
          <Film className="w-5 h-5 text-[#F04452]" />
          <Play className="w-2.5 h-2.5 text-white absolute fill-white ml-0.5" />
          <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold tracking-wider text-white text-lg font-mono">
            TAI RECAP
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F04452] text-white shadow-[0_0_10px_rgba(240,68,82,0.6)]">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-gray-400 font-medium tracking-tight mt-1 truncate max-w-[200px]">
            {language === 'my' ? 'မြန်မာ ရုပ်ရှင်အကျဉ်းချုပ် AI' : 'AI Movie Recap Studio'}
          </span>
        )}
      </div>
    </div>
  );
};

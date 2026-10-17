import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  HardDrive,
  Key,
  ExternalLink,
} from 'lucide-react';
import { translations, Language } from '../locales/translations';
import { safeFetchJson } from '../utils/api';

interface SettingsPageProps {
  language: Language;
  onToggleLanguage: () => void;
  onClearStorage: () => void;
}

// Configuration Sub-Component for GEMINI_API_KEY Setup Guide
const ApiKeyConfiguration: React.FC<{ health: any; language: Language }> = ({ health, language }) => {
  return (
    <div className="p-5 rounded-2xl bg-[#141720] border border-[#232838] space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-[#F04452]" />
          <span>{language === 'my' ? 'Gemini API Key ဆက်တင်နှင့် စစ်ဆေးချက်' : 'GEMINI_API_KEY Configuration'}</span>
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
          health?.geminiConfigured 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
        }`}>
          {health?.geminiConfigured ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span>{language === 'my' ? 'ချိတ်ဆက်ပြီး (Configured)' : 'Active & Configured'}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              <span>{language === 'my' ? 'သော့မရှိသေးပါ (Not Configured)' : 'Missing API Key'}</span>
            </>
          )}
        </span>
      </div>

      {health?.geminiConfigured ? (
        <p className="text-xs text-gray-300 leading-relaxed">
          {language === 'my'
            ? 'GEMINI_API_KEY ကို System Environment တွင် အောင်မြင်စွာ ထည့်သွင်းထားပြီးဖြစ်ပါသည်။ AI ဖြင့် ဇာတ်ညွှန်းထုတ်လုပ်ခြင်းနှင့် ဗီဒီယိုဆန်းစစ်ခြင်းများကို အပြည့်အဝ အသုံးပြုနိုင်ပါသည်။'
            : 'GEMINI_API_KEY is successfully configured in environment variables. All AI recap analysis and script generation features are fully operational.'}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-300 leading-relaxed">
            {language === 'my'
              ? 'လက်တလောတွင် server-side ၌ GEMINI_API_KEY မရှိသေးပါ။ AI အင်္ဂါရပ်များ (ဗီဒီယိုဆန်းစစ်ခြင်းနှင့် ဇာတ်ညွှန်းထုတ်လုပ်ခြင်း) ကို အသုံးပြုနိုင်ရန်အတွက် အောက်ပါအတိုင်း ပြုလုပ်ပါ:'
              : 'The GEMINI_API_KEY environment variable is not currently configured on the server. To enable automated AI recap generation, please follow the steps below:'}
          </p>

          <div className="p-3.5 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F04452]/20 text-[#F04452] flex items-center justify-center text-[10px]">1</span>
              <span>{language === 'my' ? 'Google AI Studio တွင် API Key ရယူပါ' : 'Get a Free Gemini API Key'}</span>
            </div>
            <p className="text-gray-400 pl-7">
              {language === 'my'
                ? 'Google AI Studio သို့ဝင်ရောက်ပြီး API key အသစ်တစ်ခုကို အခမဲ့ ဖန်တီးပါ။'
                : 'Visit Google AI Studio to generate your free developer API key.'}
            </p>
            <div className="pl-7 pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F04452] text-white font-bold hover:bg-[#d63845] transition-all text-xs"
              >
                <span>Google AI Studio တွင် Key ရယူရန် (Get API Key)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F04452]/20 text-[#F04452] flex items-center justify-center text-[10px]">2</span>
              <span>{language === 'my' ? 'Application Secrets တွင် ထည့်သွင်းပါ' : 'Add to Application Secrets'}</span>
            </div>
            <p className="text-gray-400 pl-7">
              {language === 'my'
                ? 'သင့်၏ server environment တွင် GEMINI_API_KEY=your_actual_api_key ပုံစံဖြင့် Environment Variable သို့မဟုတ် .env ဖိုင်ထဲတွင် ထည့်သွင်းပေးပါ။'
                : 'Set GEMINI_API_KEY in your deployment secrets or local .env file.'}
            </p>
            <div className="pl-7 font-mono text-[11px] text-amber-300 bg-[#141720] p-2 rounded border border-[#232838]">
              GEMINI_API_KEY=AIzaSy...
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold">
                {language === 'my' ? 'မှတ်ချက် - Local Drafts များ ဆက်လက်အသုံးပြုနိုင်သည်' : 'Note: Local Drafts Still Supported'}
              </span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {language === 'my'
                  ? 'API Key မရှိသော်လည်း ဗီဒီယိုတင်သွင်းခြင်း၊ Manual Script တည်းဖြတ်ခြင်းနှင့် Local Video Preview များကို ပုံမှန်အတိုင်း အသုံးပြုနိုင်ပါသည်။'
                  : 'Without an API key, you can still upload videos, edit scripts manually, and test local preview features.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  language,
  onToggleLanguage,
  onClearStorage,
}) => {
  const t = translations[language];
  const [health, setHealth] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await safeFetchJson('/api/health');
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F04452]" />
            <span>{t.navSettings}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'my'
              ? 'စနစ် ဆက်တင်များ၊ AI အင်ဂျင် ချိတ်ဆက်မှု အခြေအနေနှင့် ဘာသာစကား ပြင်ဆင်ရန်'
              : 'Configure application engines, languages, and view system diagnostic status'}
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={isRefreshing}
          className="py-1.5 px-3 rounded-xl bg-[#1A1F2C] hover:bg-[#252C3D] border border-[#2A344A] text-xs text-gray-300 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* API Key Configuration Component */}
      <ApiKeyConfiguration health={health} language={language} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Language Preference */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F04452]" />
            <span>{language === 'my' ? 'ဘာသာစကား ဆက်တင်' : 'Language Preferences'}</span>
          </h3>

          <p className="text-xs text-gray-400 leading-relaxed">
            {language === 'my'
              ? 'TAI RECAP AI ကို မြန်မာဘာသာ (Myanmar Unicode) ဖြင့် အဓိက အသုံးပြုရန် ဖန်တီးထားပြီး English ဘာသာစကားသို့လည်း အချိန်မရွေး ပြောင်းလဲနိုင်ပါသည်'
              : 'TAI RECAP AI provides first-class support for Myanmar Unicode alongside an English interface.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={language === 'en' ? onToggleLanguage : undefined}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'my'
                  ? 'bg-[#F04452] text-white shadow-md'
                  : 'bg-[#0E1017] border border-[#262D3D] text-gray-400 hover:text-white'
              }`}
            >
              မြန်မာစာ (Myanmar Unicode)
            </button>

            <button
              onClick={language === 'my' ? onToggleLanguage : undefined}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#F04452] text-white shadow-md'
                  : 'bg-[#0E1017] border border-[#262D3D] text-gray-400 hover:text-white'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Zero Mandatory Payment Policy */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'my' ? 'ငွေပေးသွင်းရန်မလိုသော စနစ်' : 'Free-First Operation Policy'}</span>
          </h3>

          <p className="text-xs text-gray-400 leading-relaxed">
            {language === 'my'
              ? 'TAI RECAP AI သည် မည်သည့် လစဉ်ကြေး သို့မဟုတ် စာရင်းသွင်းခမျှ ပေးသွင်းရန် မလိုအပ်ပါ။ စက်တွင်း တည်းဖြတ်မှု၊ FFmpeg ဗီဒီယို ပေါင်းစပ်မှုများနှင့် Google AI Studio ၏ Developer ခွင့်ပြုချက်များဖြင့် အခမဲ့ အသုံးပြုနိုင်ရန် စီမံထားပါသည်။'
              : 'Zero mandatory subscriptions or hidden paywalls. Built for open creator access with local processing, FFmpeg rendering, and direct Gemini integration.'}
          </p>

          <div className="p-3 rounded-lg bg-[#0E1017] border border-[#242B3D] text-xs text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{language === 'my' ? 'မည်သည့် အခကြေးငွေမျှ မလိုအပ်ပါ (100% Free)' : '100% Free-First Access Guarantee'}</span>
          </div>
        </div>
      </div>

      {/* Engine Status & Models HUD */}
      <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#F04452]" />
          <span>{language === 'my' ? 'အင်ဂျင်နှင့် မော်ဒယ် စစ်ဆေးချက်များ' : 'Engine & Model Diagnostic Status'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838]">
            <span className="text-[11px] text-gray-500 font-medium">Video Processing</span>
            <div className="text-sm font-bold text-white mt-0.5">FFmpeg v4.4.2</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Linux System Package
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838]">
            <span className="text-[11px] text-gray-500 font-medium">Standard Recap Model</span>
            <div className="text-sm font-bold text-white mt-0.5">gemini-3.8-flash</div>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> Rapid Scriptwriting
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838]">
            <span className="text-[11px] text-gray-500 font-medium">Story Recap V2</span>
            <div className="text-sm font-bold text-white mt-0.5">gemini-4-argon</div>
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 mt-1">
              <Cpu className="w-3 h-3" /> High Thinking Mode
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838]">
            <span className="text-[11px] text-gray-500 font-medium">Burmese Subtitle Font</span>
            <div className="text-sm font-bold text-white mt-0.5">Noto Sans Myanmar</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> TrueType Unicode
            </span>
          </div>
        </div>
      </div>

      {/* Storage Reset */}
      <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white">
            {language === 'my' ? 'စက်တွင်း ဒေတာများ ရှင်းလင်းရန်' : 'Reset Local Storage Cache'}
          </h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {language === 'my'
              ? 'မူကြမ်းများနှင့် ဒေါင်းလုဒ်မှတ်တမ်းများကို ပြန်လည်ရှင်းလင်းပါမည်'
              : 'Clears saved drafts and recent download links'}
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm(language === 'my' ? 'ဒေတာများကို ရှင်းလင်းမည်မှာ သေချာပါသလား?' : 'Are you sure you want to clear local storage?')) {
              onClearStorage();
            }
          }}
          className="py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 cursor-pointer"
        >
          Clear Data
        </button>
      </div>
    </div>
  );
};

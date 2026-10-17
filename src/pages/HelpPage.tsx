import React from 'react';
import {
  HelpCircle,
  Sparkles,
  Video,
  Mic,
  Subtitles,
  Download,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { translations, Language } from '../locales/translations';

interface HelpPageProps {
  language: Language;
}

export const HelpPage: React.FC<HelpPageProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#F04452]" />
            <span>{t.helpTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">{t.helpSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#1A1F2C] border border-[#283247] text-xs text-gray-300">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Creator Masterclass</span>
        </div>
      </div>

      {/* 5-Step Workflow Guide */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#F04452]" />
          <span>
            {language === 'my'
              ? 'ရုပ်ရှင်အကျဉ်းချုပ် ဗီဒီယို ဖန်တီးနည်း အဆင့် (၅) ဆင့်'
              : '5-Step Viral Movie Recap Blueprint'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#F04452]/20 text-[#F04452] font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'my' ? 'အရင်းအမြစ် ဗီဒီယို သို့မဟုတ် စာသား' : 'Source Video or Story Plot'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'my'
                ? 'ရုပ်ရှင်ဗီဒီယိုဖိုင် (MP4/MOV/WebM) တင်သွင်းပါ သို့မဟုတ် ရုပ်ရှင်အမည်နှင့် ဇာတ်လမ်းအကျဉ်းကို ထည့်သွင်းပါ။ စမ်းသပ်လိုပါက Built-in နမူနာဗီဒီယိုများကို အသုံးပြုနိုင်ပါသည်။'
                : 'Upload source video or enter the movie title & synopsis. You can also select the built-in demo clips.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#F04452]/20 text-[#F04452] font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'my' ? 'AI ဇာတ်ညွှန်း ရေးသားခြင်း' : 'AI Script Generation'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'my'
                ? '"ခွဲခြမ်းစိတ်ဖြာ၍ ဇာတ်ညွှန်းဖန်တီးမည်" သို့မဟုတ် ပိုမိုနက်နဲသော ဇာတ်ကွက်များအတွက် "Story Recap V2" ကို နှိပ်ပါ။ စက္ကန့် ၅ Hook နှင့် အလှည့်အပြောင်းများကို အလိုအလျောက် ရေးဖွဲ့ပေးပါသည်။'
                : 'Click "Generate Recap" or "Story Recap V2" for deep suspense narrative restructuring with high retention hooks.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#F04452]/20 text-[#F04452] font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'my' ? 'ဇာတ်ညွှန်း စိတ်တိုင်းကျ တည်းဖြတ်ခြင်း' : 'Script Editing & Polishing'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'my'
                ? 'ရေးသားပေးထားသော မြန်မာစာသားကို စစ်ဆေးပြီး လိုအပ်ပါက "တိုတိုရှင်းရှင်း" သို့မဟုတ် "အသေးစိတ်ချဲ့ထွင်" ခလုတ်များဖြင့် ပြင်ဆင်နိုင်ပါသည်။'
                : 'Review the generated script, adjust pacing, or use the Shorten/Expand buttons to hit your target duration.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#F04452]/20 text-[#F04452] font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'my' ? 'အသံသွင်းခြင်းနှင့် တေးဂီတ' : 'Voiceover & Background Score'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'my'
                ? 'Gemini 3.8 Flash TTS ဖြင့် သဘာဝကျသော မြန်မာစကားပြောအသံကို ဖန်တီးပြီး Suspense Dark သို့မဟုတ် Emotional တေးဂီတနှင့် ပေါင်းစပ်ပါ။'
                : 'Generate natural narration with Gemini TTS personas (Kore, Fenrir, Puck, Zephyr) and mix with dark ambient scores.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#F04452]/20 text-[#F04452] font-bold text-xs flex items-center justify-center">
              5
            </div>
            <h4 className="text-sm font-bold text-white">
              {language === 'my' ? 'FFmpeg ဗီဒီယို ထုတ်လုပ်ခြင်း' : 'FFmpeg Video Export'}
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {language === 'my'
                ? '9:16 (TikTok) သို့မဟုတ် 16:9 (YouTube) အချိုးအစား ရွေးချယ်ပြီး "ဗီဒီယို ထုတ်လုပ်မည်" ကို နှိပ်ပါ။ စာတန်းထိုးနှင့် အသံများ ပေါင်းစပ်ပြီး MP4 ဗီဒီယိုကို ရယူပါ။'
                : 'Select aspect ratio (9:16 vertical or 16:9 widescreen), burn in subtitles, and render MP4 directly using FFmpeg.'}
            </p>
          </div>
        </div>
      </div>

      {/* YouTube & TikTok Creator Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'my' ? 'TikTok & Reels ဗိုင်းရပ်စ် ဖြစ်စေမည့် နည်းလမ်း' : 'TikTok & Reels Viral Strategy'}
            </span>
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {language === 'my'
                  ? 'ပထမ ၃ စက္ကန့်တွင် အထွတ်အထိပ် အဖြစ်အပျက်ကို မေးခွန်းဖြင့် အစချီပါ (ဥပမာ - "ဒီမိန်းကလေးဟာ သေတ္တာဖွင့်လိုက်တဲ့အခါ မထင်မှတ်ထားတာ ဖြစ်သွားခဲ့တယ်")။'
                  : 'Start with the climax question in the first 3 seconds to stop users from scrolling.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {language === 'my'
                  ? '9:16 ဒေါင်လိုက်မျက်နှာပြင်နှင့် ဖောင့်ကြီးကြီး မြန်မာစာတန်းထိုးများကို အလယ် သို့မဟုတ် အောက်ဘက်တွင် ထင်ရှားစွာ ထားပါ။'
                  : 'Use 9:16 vertical video with large, high-contrast burned-in subtitles.'}
              </span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-[#F04452]" />
            <span>
              {language === 'my' ? 'YouTube ၁၀ မိနစ် ရုပ်ရှင်အကျဉ်းချုပ် နည်းလမ်း' : 'YouTube 10-Minute Deep Dive'}
            </span>
          </h4>
          <ul className="space-y-2 text-xs text-gray-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {language === 'my'
                  ? 'ဇာတ်လမ်းကို အခန်းစဉ် ၅ ခန်း (စတင်ခြင်း၊ ဇာတ်ရှိန်တက်ခြင်း၊ အကျပ်အတည်း၊ အထွတ်အထိပ်၊ နိဂုံး) ခွဲခြားပြီး အသေးစိတ် ပြောပြပါ။'
                  : 'Break the movie down into 5 acts: Hook, Inciting Incident, Rising Tension, Climax, and Moral Twist.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {language === 'my'
                  ? 'နောက်ခံတေးဂီတကို စကားပြောသံထက် ၂၀-၂၅% ခန့်သာ လျှော့ထားခြင်းဖြင့် စကားပြောသံကို ပိုမိုကြည်လင်ပြတ်သားစေပါသည်။'
                  : 'Keep background music at 20-25% volume so the voiceover stays crystal clear.'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Burmese TTS Architecture & Setup Instructions */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#F04452]" />
          <span>
            {language === 'my'
              ? 'မြန်မာအသံစနစ် (TTS) ဖွဲ့စည်းပုံနှင့် စနစ်တပ်ဆင်ခြင်း လမ်းညွှန်'
              : 'Burmese TTS Engine Architecture & Setup Guide'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Google Native Burmese TTS</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {language === 'my'
                ? 'မြန်မာဘာသာ Unicode စာသားများကို တိုက်ရိုက်အသံထွက်ဖတ်ကြားပေးနိုင်သော မူလစနစ်ဖြစ်ပါသည်။ စာကြောင်းအလိုက် အလိုအလျောက် အပိုင်းခွဲပြီး FFmpeg ဖြင့် ချိတ်ဆက်ပေါင်းစပ်ပေးပါသည်။ API key မလိုအပ်ဘဲ ချက်ချင်း အသုံးပြုနိုင်ပါသည်။'
                : 'Native Burmese pronunciation engine with automatic multi-sentence chunking and FFmpeg concatenation. Available out-of-the-box with zero configuration.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Gemini 3.8 Flash TTS</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {language === 'my'
                ? 'Google GenAI SDK ၏ အသံစနစ်ဖြစ်ပြီး Kore, Fenrir, Puck, Zephyr စသည့် အသံ Persona များကို အသုံးပြုနိုင်ပါသည်။ Google AI Studio ၏ Secrets panel တွင် GEMINI_API_KEY ကို ထည့်သွင်းထားရန် လိုအပ်ပါသည်။'
                : 'Neural studio powered by @google/genai with voice personas. Requires GEMINI_API_KEY set securely on the server.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Local Browser Diagnostics</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {language === 'my'
                ? 'သင့် Browser သို့မဟုတ် OS တွင် မြန်မာအသံဖိုင် တပ်ဆင်ထားခြင်း ရှိမရှိ စစ်ဆေးပေးပါသည်။ အသံဖိုင် မရှိပါက အသံထွက်မှားယွင်းမှု မဖြစ်စေရန် Server-side Native TTS သို့ လွှဲပြောင်းပေးပါသည်။'
                : 'Client-side check for local voice packages. Honestly informs when no Burmese speech engine is installed locally.'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0D14] border border-[#1E2536] text-xs text-gray-400 flex items-center justify-between">
          <span>Automated Verification Suite: <code className="text-emerald-400 font-mono">npm test</code> (or <code className="text-emerald-400 font-mono">tsx tests/test_burmese_tts.js</code>)</span>
          <span className="text-emerald-400 font-semibold">100% Tested & Verified</span>
        </div>
      </div>

      {/* GEMINI_API_KEY Setup & Connection Testing */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F04452]" />
          <span>
            {language === 'my'
              ? 'GEMINI_API_KEY ထည့်သွင်းခြင်းနှင့် ချိတ်ဆက်မှု စစ်ဆေးခြင်း လမ်းညွှန်'
              : 'GEMINI_API_KEY Configuration & Connection Testing Guide'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#F04452]/20 text-[#F04452] flex items-center justify-center text-xs">1</span>
              <span>{language === 'my' ? 'API Key ထည့်သွင်းနည်း' : 'How to Configure GEMINI_API_KEY'}</span>
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {language === 'my'
                ? 'Google AI Studio ၏ Secrets panel တွင်ဖြစ်စေ၊ ဆာဗာ၏ .env ဖိုင်တွင်ဖြစ်စေ GEMINI_API_KEY=YOUR_KEY ကို ထည့်သွင်းပါ။ API key မရှိသေးပါက Google Native Burmese TTS နှင့် Local Draft များကို အပြည့်အစုံ ဆက်လက်အသုံးပြုနိုင်ပါသည်။'
                : 'Configure GEMINI_API_KEY in your server-side environment or AI Studio Secrets panel. Without a key, local video editing, sample previews, and Google Native Burmese TTS remain fully functional out-of-the-box.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0E1017] border border-[#222838] space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#F04452]/20 text-[#F04452] flex items-center justify-center text-xs">2</span>
              <span>{language === 'my' ? 'ချိတ်ဆက်မှု စစ်ဆေးနည်း (Health Check)' : 'Testing Connection Status'}</span>
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {language === 'my'
                ? 'ဘက်ခ်အန်းဒ်၏ ကျန်းမာရေး စစ်ဆေးမှု အမှတ် (Health Check) ကို GET /api/health သို့ တောင်းဆိုခြင်းဖြင့် `geminiConfigured: true` ဖြစ်မဖြစ် အလွယ်တကူ စစ်ဆေးနိုင်ပါသည်။'
                : 'Verify backend connection status by sending a request to GET /api/health, which returns json containing `geminiConfigured: true/false`, FFmpeg version, and Myanmar font status.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

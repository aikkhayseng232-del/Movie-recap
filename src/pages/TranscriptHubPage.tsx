import React, { useState, useRef } from 'react';
import {
  FileText,
  Mic,
  Upload,
  Play,
  Square,
  Sparkles,
  Download,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PageId } from '../types';
import { translations, Language } from '../locales/translations';

interface TranscriptHubPageProps {
  onSendToWorkspace: (title: string, text: string) => void;
  language: Language;
}

export const TranscriptHubPage: React.FC<TranscriptHubPageProps> = ({
  onSendToWorkspace,
  language,
}) => {
  const t = translations[language];

  const [transcriptText, setTranscriptText] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio File Upload for Transcription
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTranscribing(true);
    setStatusMsg({
      type: 'info',
      text: language === 'my'
        ? 'Gemini 3.5 Transcribe စနစ်ဖြင့် စာသားကူးယူနေပါသည်...'
        : 'Transcribing audio with Gemini 3.5 Transcribe...',
    });

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: file.type || 'audio/mp3',
          }),
        });

        const data = await res.json();
        if (res.ok && data.transcript) {
          setTranscriptText(data.transcript);
          setStatusMsg({
            type: 'success',
            text: language === 'my' ? 'စာသား ကူးယူမှု အောင်မြင်ပါသည်!' : 'Transcription successful!',
          });
        } else {
          throw new Error(data.message || data.error || 'Transcription failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Transcribe error' });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsTranscribing(true);
          setStatusMsg({
            type: 'info',
            text: language === 'my' ? 'အသံဖိုင်ကို စာသား ပြောင်းလဲနေပါသည်...' : 'Processing audio recording...',
          });

          try {
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Audio,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.transcript) {
              setTranscriptText((prev) => (prev ? `${prev}\n\n${data.transcript}` : data.transcript));
              setStatusMsg({
                type: 'success',
                text: language === 'my' ? 'အသံမှ စာသားကူးယူပြီးပါပြီ!' : 'Audio transcribed successfully!',
              });
            }
          } catch (e: any) {
            setStatusMsg({ type: 'error', text: e.message || 'Failed to transcribe' });
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusMsg({
        type: 'info',
        text: language === 'my' ? 'မိုက်ကရိုဖုန်းဖြင့် အသံဖမ်းယူနေပါသည်...' : 'Recording microphone audio...',
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: language === 'my' ? 'မိုက်ကရိုဖုန်း အသုံးပြုခွင့် မရရှိပါ' : 'Microphone permission denied',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!transcriptText) return;
    navigator.clipboard.writeText(transcriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send directly to Recap Studio
  const handleTransfer = () => {
    if (!transcriptText.trim()) return;
    onSendToWorkspace(movieTitle || 'Transcribed Movie', transcriptText);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F04452]" />
            <span>{t.navTranscript}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'my'
              ? 'အသံဖိုင် သို့မဟုတ် ဗီဒီယိုမှ စကားပြောသံများကို Gemini 3.5 Transcribe စနစ်ဖြင့် မြန်မာယူနီကုဒ် စာသားအဖြစ် အလိုအလျောက် ပြောင်းလဲပေးခြင်း'
              : 'Extract movie narration and dialogue automatically using Gemini 3.5 Transcribe engine.'}
          </p>
        </div>

        {transcriptText && (
          <button
            onClick={handleTransfer}
            className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>{language === 'my' ? 'ရုပ်ရှင်အကျဉ်းချုပ် ဖန်တီးခန်းသို့ ပို့မည်' : 'Send to Recap Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            statusMsg.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Input Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Audio / Video Upload */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#F04452]" />
            <span>{language === 'my' ? 'အသံဖိုင် သို့မဟုတ် ဗီဒီယို တင်သွင်းရန်' : 'Upload Audio / Video'}</span>
          </h3>

          <label className="border-2 border-dashed border-[#283042] hover:border-[#F04452]/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#0D1017]">
            <Upload className="w-8 h-8 text-[#F04452] mb-2" />
            <span className="text-xs font-semibold text-gray-200">
              {language === 'my' ? 'အသံဖိုင် (MP3, WAV, WebM) သို့မဟုတ် ဗီဒီယို ရွေးပါ' : 'Select MP3, WAV, WebM, or MP4 file'}
            </span>
            <span className="text-[11px] text-gray-500 mt-1">
              Model: gemini-3.5-transcribe
            </span>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleAudioUpload}
              disabled={isTranscribing}
              className="hidden"
            />
          </label>
        </div>

        {/* Live Mic Recording */}
        <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#F04452]" />
            <span>{language === 'my' ? 'တိုက်ရိုက် အသံသွင်း၍ စာသားပြောင်းရန်' : 'Live Voice Dictation'}</span>
          </h3>

          <div className="p-8 rounded-xl bg-[#0D1017] border border-[#242B3D] flex flex-col items-center justify-center text-center space-y-3">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.6)] animate-pulse cursor-pointer"
              >
                <Square className="w-6 h-6 fill-white" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={isTranscribing}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F04452] to-[#D92D3B] text-white flex items-center justify-center shadow-[0_0_20px_rgba(240,68,82,0.4)] hover:brightness-110 cursor-pointer"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}

            <div className="text-xs font-semibold text-gray-300">
              {isRecording
                ? (language === 'my' ? 'အသံဖမ်းယူနေပါသည်... (ရပ်တန့်ရန် နှိပ်ပါ)' : 'Recording in progress... (Click to stop)')
                : (language === 'my' ? 'အသံဖမ်းယူရန် မိုက်ခလုတ်ကို နှိပ်ပါ' : 'Click microphone to record audio')}
            </div>
          </div>
        </div>
      </div>

      {/* Transcribed Text View & Editor */}
      <div className="p-5 rounded-xl bg-[#141720] border border-[#232838] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1F2432]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {language === 'my' ? 'ရရှိလာသော စာသားများ' : 'Transcribed Content'}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              ({transcriptText.split(/\s+/).filter(Boolean).length} words)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!transcriptText}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1A1F2D] hover:bg-[#252C3D] border border-[#2D364A] text-gray-300 hover:text-white cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 inline mr-1" />}
              {copied ? t.copiedText : t.copyBtn}
            </button>
          </div>
        </div>

        <div>
          <input
            type="text"
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
            placeholder={language === 'my' ? 'ရုပ်ရှင် သို့မဟုတ် အကြောင်းအရာ ခေါင်းစဉ်' : 'Movie Title or Topic Name'}
            className="w-full px-3 py-2 rounded-lg bg-[#0E1017] border border-[#262D3D] text-xs text-white mb-2 focus:outline-none focus:border-[#F04452]"
          />

          <textarea
            rows={10}
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder={
              language === 'my'
                ? 'အသံမှ ကူးယူထားသော မြန်မာယူနီကုဒ် စာသားများ ဤနေရာတွင် ပေါ်လာပါမည် (တိုက်ရိုက်လည်း ရေးသားနိုင်ပါသည်)...'
                : 'Transcribed script text appears here (you can also type or paste directly)...'
            }
            className="w-full p-4 rounded-xl bg-[#0E1017] border border-[#262D3D] text-xs md:text-sm text-white focus:outline-none focus:border-[#F04452] leading-relaxed resize-y"
          />
        </div>
      </div>
    </div>
  );
};

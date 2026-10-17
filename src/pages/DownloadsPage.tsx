import React, { useState } from 'react';
import {
  Download,
  Film,
  FileAudio,
  FileText,
  Play,
  Calendar,
  Trash2,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { DownloadItem } from '../types';
import { translations, Language } from '../locales/translations';

interface DownloadsPageProps {
  downloads: DownloadItem[];
  onDeleteDownload: (id: string) => void;
  language: Language;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({
  downloads,
  onDeleteDownload,
  language,
}) => {
  const t = translations[language];
  const [selectedPreview, setSelectedPreview] = useState<DownloadItem | null>(null);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-[#F04452]" />
            <span>{t.downloadsTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'my'
              ? 'ထုတ်လုပ်ပြီးသော ရုပ်ရှင်အကျဉ်းချုပ် ဗီဒီယို (MP4)၊ အသံဖိုင် (WAV) နှင့် စာတန်းထိုး (SRT) များကို သိမ်းဆည်းရယူနိုင်သည့် နေရာ'
              : 'Exported MP4 videos, WAV voiceovers, and SRT subtitle files ready for download'}
          </p>
        </div>

        <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#1A1F2C] border border-[#283247] text-xs text-gray-300">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>{downloads.length} Files Available</span>
        </div>
      </div>

      {/* Downloads List */}
      {downloads.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#141720] border border-[#232838] text-center space-y-3">
          <Download className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">{t.noDownloads}</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            {language === 'my'
              ? 'ရုပ်ရှင်အကျဉ်းချုပ် ဖန်တီးခန်းတွင် ဗီဒီယို သို့မဟုတ် အသံဖိုင် ထုတ်လုပ်ပြီးပါက ဤနေရာတွင် အသင့်ဒေါင်းလုဒ် ရယူနိုင်ပါမည်'
              : 'Render a video or generate speech in the workspace to see download links here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#141720] border border-[#232838] hover:border-[#2D364D] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                      item.type === 'video'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.type === 'audio'
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {item.type === 'video' ? <Film className="w-3 h-3" /> : item.type === 'audio' ? <FileAudio className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {item.type}
                  </span>

                  {item.size && (
                    <span className="text-[11px] font-mono text-gray-400">{item.size}</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white truncate" title={item.title}>
                  {item.title}
                </h4>

                <span className="text-xs text-gray-400 font-mono mt-1 block truncate">
                  {item.filename}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2535] flex items-center justify-between">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPreview(item)}
                    className="p-1.5 rounded-lg bg-[#181C28] hover:bg-[#222838] text-gray-300 hover:text-white border border-[#272F42] cursor-pointer"
                    title="Preview"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`${item.url}?download=true`}
                    download={item.filename}
                    className="py-1 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  <button
                    onClick={() => onDeleteDownload(item.id)}
                    className="p-1.5 rounded-lg bg-[#181C28] hover:bg-rose-950 text-gray-400 hover:text-rose-400 border border-[#272F42] cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141720] border border-[#232838] rounded-2xl p-5 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2432]">
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {selectedPreview.title}
              </h3>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[220px]">
              {selectedPreview.type === 'video' ? (
                <video src={selectedPreview.url} controls autoPlay className="w-full max-h-[360px]" />
              ) : selectedPreview.type === 'audio' ? (
                <div className="p-8 w-full">
                  <audio src={selectedPreview.url} controls autoPlay className="w-full" />
                </div>
              ) : (
                <div className="p-4 text-xs text-gray-300 font-mono overflow-auto max-h-[300px] w-full">
                  {selectedPreview.url}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <a
                href={`${selectedPreview.url}?download=true`}
                download={selectedPreview.filename}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

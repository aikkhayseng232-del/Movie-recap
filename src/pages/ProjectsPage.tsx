import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Play,
  Copy,
  Trash2,
  Clock,
  Film,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Project, PageId } from '../types';
import { translations, Language } from '../locales/translations';

interface ProjectsPageProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
  onCreateNewProject: () => void;
  language: Language;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onCreateNewProject,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#141720] border border-[#232838] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#F04452]" />
            <span>{t.projectsTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'my'
              ? 'သိမ်းဆည်းထားသော ရုပ်ရှင်အကျဉ်းချုပ် ပရောဂျက်များအားလုံးကို စီမံခန့်ခွဲရန် နေရာ'
              : 'Manage, edit, duplicate, and export your movie recap projects'}
          </p>
        </div>

        <button
          onClick={onCreateNewProject}
          className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-[0_0_20px_rgba(240,68,82,0.35)] flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createProject}</span>
        </button>
      </div>

      {/* Projects List Grid */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#141720] border border-[#232838] text-center space-y-3">
          <Film className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">{t.noProjects}</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            {language === 'my'
              ? 'ပရောဂျက်အသစ် စတင်ဖန်တီးပြီး AI ဇာတ်ညွှန်းနှင့် ဗီဒီယိုများကို လျင်မြန်စွာ ဖန်တီးလိုက်ပါ'
              : 'Get started by creating a new movie recap project with script, voiceover, and video.'}
          </p>
          <button
            onClick={onCreateNewProject}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#F04452] to-[#D92D3B] hover:brightness-110 shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.createProject}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-xl bg-[#141720] border border-[#232838] hover:border-[#2D364D] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C2130] text-gray-300 border border-[#2A3347]">
                    {proj.aspectRatio}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {proj.durationMinutes} min
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-[#F04452] transition-colors truncate">
                  {proj.title}
                </h4>

                <span className="text-[11px] text-gray-400 font-medium capitalize mt-0.5 block">
                  {proj.genre || 'Action / Thriller'} • {proj.style.replace('_', ' ')}
                </span>

                <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                  {proj.hook || proj.script || proj.synopsis || (language === 'my' ? 'ဇာတ်ညွှန်း မရှိသေးပါ' : 'No script entered')}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#1F2535] flex items-center justify-between">
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(proj.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDuplicateProject(proj)}
                    className="p-1.5 rounded-lg bg-[#181C28] hover:bg-[#222838] text-gray-400 hover:text-white border border-[#262E40] cursor-pointer"
                    title={t.duplicateProject}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 rounded-lg bg-[#181C28] hover:bg-rose-950 text-gray-400 hover:text-rose-400 border border-[#262E40] cursor-pointer"
                    title={t.deleteProject}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenProject(proj)}
                    className="py-1 px-3 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-[#F04452] to-[#B91C1C] hover:brightness-110 shadow-sm cursor-pointer"
                  >
                    {t.openProject}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

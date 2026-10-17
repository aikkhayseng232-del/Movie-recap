import React, { useState, useEffect } from 'react';
import { PageId, Project, Preset, DownloadItem } from './types';
import { Language } from './locales/translations';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { FullAutoPage } from './pages/FullAutoPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { TranscriptHubPage } from './pages/TranscriptHubPage';
import { VoiceStudioPage } from './pages/VoiceStudioPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { PresetsPage } from './pages/PresetsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

const INITIAL_PROJECT: Project = {
  id: 'proj_default_1',
  title: 'မထင်မှတ်သော အလှည့်အပြောင်း (The Hidden Cipher)',
  genre: 'Suspense / Crime Thriller',
  synopsis: 'အမှောင်ထုထဲက လူသတ်သမားတစ်ယောက်နဲ့ သူ့နောက်ကို လိုက်နေတဲ့ စုံထောက်မင်းသူတို့ရဲ့ အသည်းတယားယား အသက်လုတိုက်ပွဲ။ အမှုရဲ့နောက်ကွယ်မှာ မြို့တော်ရဲ့ အကြီးမားဆုံး လျှို့ဝှက်ချက် ရှိနေပါတယ်။',
  sourceType: 'sample',
  sourceVideoPath: 'sample_thriller.mp4',
  sourceVideoName: 'Cyberpunk Thriller Sample (10s 720p)',
  durationMinutes: 3,
  aspectRatio: '9:16',
  resolution: '720p',
  style: 'suspense',
  script: `[စတင်ဖွင့်ဟချက် (0:00 - 0:15)]
ဒီဇာတ်ကားဟာ အမှောင်ထုထဲက လူသတ်သမားတစ်ယောက်နဲ့ သူ့နောက်ကို တစ်ကောက်ကောက်လိုက်နေတဲ့ စုံထောက်တစ်ယောက်ရဲ့ အသက်လုတိုက်ပွဲအကြောင်း ဖြစ်ပါတယ်။ ပရိသတ်ကြီးရေ အဆုံးထိကြည့်မှ မထင်မှတ်ထားတဲ့ အလှည့်အပြောင်းကို သိရမှာဖြစ်လို့ မလွတ်တမ်း ကြည့်ရှုလိုက်ရအောင်။

[ဇာတ်လမ်းအစ (0:15 - 0:50)]
ဇာတ်လမ်းစတင်ချိန်မှာတော့ မြို့တော်ရဲ့ သာမန်ညတစ်ညမှာ ထူးဆန်းတဲ့ လူသေမှုတစ်ခု စတင်ဖြစ်ပွားခဲ့ပါတယ်။ သေဆုံးသူဟာ နာမည်ကြီး ကုမ္ပဏီပိုင်ရှင်ဖြစ်ပြီး အခန်းတံခါးအားလုံး အထဲကနေ သော့ခတ်ထားတာပါ။ စုံထောက်မင်းသူ ဟာ အခင်းဖြစ်ပွားရာနေရာကို ရောက်ရှိလာပြီး အသေးစိတ်စစ်ဆေးတဲ့အခါ ထူးဆန်းတဲ့ မှတ်စုတိုလေးတစ်ခုကို တွေ့ရှိခဲ့ပါတယ်။

[ဇာတ်ရှိန်မြင့်တက်လာခြင်း (0:50 - 1:40)]
စုံစမ်းမှုတွေ ရှေ့ဆက်သွားလေလေ အမှုဟာ တစ်ယောက်တည်း ကျူးလွန်တာမဟုတ်ဘဲ မြို့တော်ရဲ့ အာဏာပိုင်တွေပါ ပါဝင်ပတ်သက်နေတာကို မင်းသူ သိရှိလာရပါတယ်။ ဒါပေမဲ့ ရန်သူတွေကလည်း လက်ဦးမှုရယူပြီး မင်းသူ ရဲ့ မိသားစုကို ခြိမ်းခြောက်လာပါတော့တယ်။

[အထွတ်အထိပ် ရင်ဆိုင်မှု (1:40 - 2:30)]
စွန့်ပစ်စက်ရုံဟောင်းကြီးအတွင်းမှာ နှစ်ဖက်ရင်ဆိုင်တိုက်ခိုက်ကြတဲ့ အခိုက်အတန့်ဟာ ရင်တမမ ဖြစ်စရာပါ။ သေနတ်သံတွေ၊ ပေါက်ကွဲသံတွေကြားမှာ မင်းသူဟာ ဒဏ်ရာပြင်းထန်စွာ ရရှိသွားခဲ့ပါတယ်။ ဒါပေမဲ့ သူ့မှာ လျှို့ဝှက်အစီအစဉ်တစ်ခု ရှိနေပါသေးတယ်။

[အလှည့်အပြောင်းနဲ့ နိဂုံး (2:30 - 3:00)]
နောက်ဆုံးမှာတော့ အဓိကတရားခံဟာ မင်းသူ အနီးကပ်ဆုံး ယုံကြည်ခဲ့တဲ့ လုပ်ဖော်ကိုင်ဖက် ဖြစ်နေတာကို ဖော်ထုတ်နိုင်ခဲ့ပါတယ်။ တရားမျှတမှုဟာ အချိန်ယူရပေမဲ့ အမှန်တရားကတော့ အမြဲအနိုင်ရစမြဲပါ။ နောက်ထပ် စိတ်လှုပ်ရှားစရာ ရုပ်ရှင်အကျဉ်းချုပ်တွေကို ကြည့်ရှုဖို့ Channel ကို Like and Subscribe လုပ်ထားဖို့ မမေ့နဲ့နော်။`,
  scenes: [
    { sceneNumber: 1, timestamp: '0:00 - 0:15', title: 'စတင်ဖွင့်ဟချက် (Opening Hook)', narrationText: 'ဒီဇာတ်ကားဟာ အမှောင်ထုထဲက လူသတ်သမားတစ်ယောက်နဲ့ စုံထောက်တစ်ယောက်ရဲ့ အသက်လုတိုက်ပွဲ ဖြစ်ပါတယ်။' },
    { sceneNumber: 2, timestamp: '0:15 - 0:50', title: 'ဇာတ်လမ်းစတင်ခြင်း (Inciting Incident)', narrationText: 'အခန်းပိတ် လူသတ်မှုတစ်ခု ဖြစ်ပွားခဲ့ပြီး စုံထောက်မင်းသူ ထူးဆန်းတဲ့ သဲလွန်စတစ်ခုကို တွေ့ရှိခဲ့ပါတယ်။' },
    { sceneNumber: 3, timestamp: '0:50 - 1:40', title: 'ဇာတ်ရှိန်မြင့်တက်ခြင်း (Rising Tension)', narrationText: 'အာဏာပိုင်တွေ ပါဝင်ပတ်သက်နေတာကို သိရှိလာရပြီး မိသားစုပါ ခြိမ်းခြောက်ခံရပါတော့တယ်။' },
    { sceneNumber: 4, timestamp: '1:40 - 2:30', title: 'အထွတ်အထိပ် ရင်ဆိုင်မှု (Climax)', narrationText: 'စွန့်ပစ်စက်ရုံဟောင်းထဲမှာ သေနတ်သံတွေကြား အသက်လုတိုက်ခိုက်ကြရပါတယ်။' },
    { sceneNumber: 5, timestamp: '2:30 - 3:00', title: 'အလှည့်အပြောင်းနဲ့ နိဂုံး (Twist & Outro)', narrationText: 'အဓိကတရားခံဟာ အယုံကြည်ရဆုံး လုပ်ဖော်ကိုင်ဖက် ဖြစ်နေတာကို ဖော်ထုတ်နိုင်ခဲ့ပါတယ်။' },
  ],
  hook: 'ဒီဇာတ်ကားဟာ အဆုံးထိ မခွာတမ်း ကြည့်ရမယ့် အသည်းတယားယား ဇာတ်လမ်းဖြစ်ပါတယ်!',
  ttsVoice: 'Kore',
  ttsSpeed: 1.0,
  bgMusic: 'suspense_dark',
  bgMusicVolume: 0.25,
  originalAudioVolume: 0.15,
  subtitlesEnabled: true,
  subtitleLanguage: 'my',
  subtitleColor: '#FFFFFF',
  subtitleSize: 'medium',
  subtitlePosition: 'bottom',
  subtitleOutline: 'black',
  watermarkText: 'TAI RECAP AI',
  watermarkPosition: 'top_right',
  watermarkOpacity: 0.85,
  blurRegion: 'none',
  blurStrength: 10,
  updatedAt: Date.now(),
  createdAt: Date.now(),
};

export default function App() {
  // Navigation & Language
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('tai_recap_lang') as Language) || 'my';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('tai_recap_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [INITIAL_PROJECT];
  });

  const [currentProject, setCurrentProject] = useState<Project>(() => {
    const saved = localStorage.getItem('tai_recap_active_project');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROJECT;
  });

  // Downloads
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const saved = localStorage.getItem('tai_recap_downloads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'dl_sample_1',
        title: 'Cyberpunk Thriller Preview (9:16 Vertical)',
        type: 'video',
        url: '/api/media/samples/sample_thriller.mp4',
        filename: 'sample_thriller_recap.mp4',
        date: new Date().toLocaleDateString(),
        size: '1.2 MB',
      },
      {
        id: 'dl_sample_2',
        title: 'Suspense Dark Ambient Loop (BGM)',
        type: 'audio',
        url: '/api/media/bgmusic/suspense_dark.wav',
        filename: 'suspense_dark.wav',
        date: new Date().toLocaleDateString(),
        size: '861 KB',
      },
    ];
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('tai_recap_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('tai_recap_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tai_recap_active_project', JSON.stringify(currentProject));
  }, [currentProject]);

  useEffect(() => {
    localStorage.setItem('tai_recap_downloads', JSON.stringify(downloads));
  }, [downloads]);

  // Language Toggle
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'my' ? 'en' : 'my'));
  };

  // Update current project
  const updateProject = (updated: Partial<Project>) => {
    setCurrentProject((prev) => {
      const next = { ...prev, ...updated, updatedAt: Date.now() };
      setProjects((all) => all.map((p) => (p.id === next.id ? next : p)));
      return next;
    });
  };

  // Save project
  const saveProject = () => {
    setProjects((all) => {
      const exists = all.some((p) => p.id === currentProject.id);
      if (exists) {
        return all.map((p) => (p.id === currentProject.id ? currentProject : p));
      }
      return [currentProject, ...all];
    });
  };

  // Create new project
  const createNewProject = () => {
    const newProj: Project = {
      ...INITIAL_PROJECT,
      id: `proj_${Date.now()}`,
      title: language === 'my' ? 'ရုပ်ရှင်အသစ် စတင်ခြင်း' : 'Untitled Movie Recap',
      script: '',
      scenes: [],
      hook: '',
      synopsis: '',
      sourceVideoPath: '',
      sourceVideoName: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentProject(newProj);
    setProjects((all) => [newProj, ...all]);
    setCurrentPage('recap');
  };

  // Open existing project
  const openProject = (proj: Project) => {
    setCurrentProject(proj);
    setCurrentPage('recap');
  };

  // Delete project
  const deleteProject = (id: string) => {
    setProjects((all) => all.filter((p) => p.id !== id));
    if (currentProject.id === id) {
      if (projects.length > 1) {
        const next = projects.find((p) => p.id !== id) || INITIAL_PROJECT;
        setCurrentProject(next);
      } else {
        createNewProject();
      }
    }
  };

  // Duplicate project
  const duplicateProject = (proj: Project) => {
    const dup: Project = {
      ...proj,
      id: `proj_${Date.now()}`,
      title: `${proj.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects((all) => [dup, ...all]);
  };

  // Apply Preset directly into workspace
  const handleSelectPreset = (preset: Preset) => {
    updateProject({
      aspectRatio: preset.aspectRatio,
      resolution: preset.resolution,
      durationMinutes: preset.durationMinutes,
      style: preset.style,
      bgMusic: preset.bgMusic,
      subtitlesEnabled: preset.subtitlesEnabled,
      watermarkText: preset.watermarkText,
    });
    setCurrentPage('recap');
  };

  // Transfer transcript text into workspace
  const handleSendTranscriptToWorkspace = (title: string, text: string) => {
    updateProject({
      title: title || currentProject.title,
      synopsis: text,
      script: text,
    });
    setCurrentPage('recap');
  };

  // Add download item
  const addDownloadItem = (item: DownloadItem) => {
    setDownloads((prev) => [item, ...prev]);
  };

  // Delete download item
  const deleteDownloadItem = (id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  // Clear all storage
  const handleClearStorage = () => {
    localStorage.removeItem('tai_recap_projects');
    localStorage.removeItem('tai_recap_active_project');
    localStorage.removeItem('tai_recap_downloads');
    setProjects([INITIAL_PROJECT]);
    setCurrentProject(INITIAL_PROJECT);
    setDownloads([]);
  };

  return (
    <div className="flex min-h-screen bg-[#090A0F] text-[#F3F4F6] font-sans antialiased overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        language={language}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header
          currentPage={currentPage}
          language={language}
          onToggleLanguage={toggleLanguage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={setCurrentPage}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentPage}
              onSelectPreset={handleSelectPreset}
              onOpenProject={openProject}
              projects={projects}
              language={language}
            />
          )}

          {currentPage === 'auto' && (
            <FullAutoPage
              language={language}
              currentProject={currentProject}
              onUpdateProject={updateProject}
              onNavigate={setCurrentPage}
              onAddDownload={addDownloadItem}
            />
          )}

          {currentPage === 'recap' && (
            <WorkspacePage
              currentProject={currentProject}
              onUpdateProject={updateProject}
              onSaveProject={saveProject}
              onAddDownload={addDownloadItem}
              language={language}
            />
          )}

          {currentPage === 'transcript' && (
            <TranscriptHubPage
              onSendToWorkspace={handleSendTranscriptToWorkspace}
              language={language}
            />
          )}

          {currentPage === 'voice' && (
            <VoiceStudioPage
              onAddDownload={addDownloadItem}
              language={language}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsPage
              projects={projects}
              onOpenProject={openProject}
              onDeleteProject={deleteProject}
              onDuplicateProject={duplicateProject}
              onCreateNewProject={createNewProject}
              language={language}
            />
          )}

          {currentPage === 'downloads' && (
            <DownloadsPage
              downloads={downloads}
              onDeleteDownload={deleteDownloadItem}
              language={language}
            />
          )}

          {currentPage === 'presets' && (
            <PresetsPage
              onSelectPreset={handleSelectPreset}
              language={language}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              language={language}
              onToggleLanguage={toggleLanguage}
              onClearStorage={handleClearStorage}
            />
          )}

          {currentPage === 'help' && (
            <HelpPage language={language} />
          )}
        </main>
      </div>

      {/* Mobile Sticky Nav & Drawer */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        language={language}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}

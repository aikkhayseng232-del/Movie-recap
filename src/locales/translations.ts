export type Language = 'my' | 'en';

export const translations = {
  my: {
    // Brand & Header
    brandName: 'TAI RECAP AI',
    tagline: 'မြန်မာဘာသာဖြင့် ရုပ်ရှင်အကျဉ်းချုပ် AI စနစ်',
    statusOnline: 'စနစ် အသင့်ရှိသည်',
    langToggle: 'English သို့ ပြောင်းရန်',

    // Navigation
    navDashboard: 'မူလစာမျက်နှာ',
    navAuto: 'တစ်ချက်နှိပ် အလိုအလျောက် (Full Auto)',
    navRecap: 'ရုပ်ရှင်အကျဉ်းချုပ်',
    navTranscript: 'စာသားအသံပြောင်း',
    navVoice: 'အသံစတူဒီယို',
    navProjects: 'ပရောဂျက်များ',
    navDownloads: 'ဒေါင်းလုဒ်များ',
    navPresets: 'ကြိုတင်ပုံစံများ',
    navSettings: 'ဆက်တင်များ',
    navHelp: 'အကူအညီနှင့် လမ်းညွှန်',

    // Primary Actions
    generateRecap: 'ခွဲခြမ်းစိတ်ဖြာ၍ ဇာတ်ညွှန်းဖန်တီးမည်',
    generating: 'AI ဇာတ်ညွှန်း ရေးသားနေပါသည်...',
    exportVideo: 'ဗီဒီယို ထုတ်လုပ်မည်',
    exporting: 'ဗီဒီယို ထုတ်လုပ်နေပါသည်...',
    storyRecapV2: 'အဆင့်မြင့် ဇာတ်လမ်းပုံစံ V2',
    storyRecapV2Desc: 'Gemini 4 Argon စနစ်ဖြင့် သည်းထိတ်ရင်ဖို ဇာတ်ကွက်များ အသေးစိတ် ခွဲခြမ်းစိတ်ဖြာရေးသားမှု',

    // Dashboard
    dashTitle: 'ရုပ်ရှင်အကျဉ်းချုပ် ဖန်တီးမှု စင်တာ',
    dashSubtitle: 'AI စနစ်ဖြင့် မြန်မာဘာသာ ဇာတ်ညွှန်း၊ သဘာဝကျသော နောက်ခံအသံနှင့် ဗီဒီယိုများကို အချိန်တိုအတွင်း အလွယ်တကူ ဖန်တီးပါ',
    quickStart: 'အမြန် စတင်ရန်',
    newRecapBtn: 'ဇာတ်ကားသစ် စတင်မည်',
    voiceStudioBtn: 'အသံသွင်းခန်းသို့ သွားမည်',
    systemStatus: 'စနစ် လုပ်ဆောင်နိုင်မှု အခြေအနေ',
    ffmpegReady: 'FFmpeg ဗီဒီယို အင်ဂျင် (တပ်ဆင်ပြီး)',
    geminiReady: 'Gemini AI ဉာဏ်ရည်စနစ် (ချိတ်ဆက်ပြီး)',
    ttsReady: 'မြန်မာအသံ ထွက်ဆိုမှု (အသင့်ရှိ)',
    totalRecaps: 'ဖန်တီးပြီးသော ဇာတ်ညွှန်းများ',
    totalRenders: 'ထုတ်လုပ်ပြီးသော ဗီဒီယိုများ',
    recentProjects: 'လတ်တလော ပရောဂျက်များ',
    viewAll: 'အားလုံးကြည့်မည်',

    // Workspace
    workspaceTitle: 'ရုပ်ရှင်အကျဉ်းချုပ် ဖန်တီးခန်း',
    step1: '၁။ အရင်းအမြစ် ဗီဒီယို/စာသား ထည့်သွင်းခြင်း',
    step2: '၂။ AI စနစ် ခွဲခြမ်းစိတ်ဖြာမှုနှင့် ဆက်တင်များ',
    step3: '၃။ မြန်မာဘာသာ ဇာတ်ညွှန်း တည်းဖြတ်ခန်း',
    step4: '၄။ အသံထွက်ဖတ်ကြားခြင်း (TTS)',
    step5: '၅။ စာတန်းထိုးနှင့် ဗီဒီယို အထူးပြုလုပ်ချက်များ',
    step6: '၆။ ဗီဒီယို ထုတ်လုပ်ခြင်းနှင့် သိမ်းဆည်းခြင်း',

    // Video & Source Input
    uploadVideo: 'ဗီဒီယိုဖိုင် တင်ရန်',
    uploadHint: 'MP4, MOV သို့မဟုတ် WebM ဖိုင်များကို ဆွဲထည့်ပါ (သို့မဟုတ် နှိပ်၍ ရွေးပါ)',
    orSelectSample: 'သို့မဟုတ် စမ်းသပ်ရန် နမူနာဗီဒီယို ရွေးပါ',
    sample1: 'သည်းထိတ်ရင်ဖို နမူနာ (Cyberpunk Thriller)',
    sample2: 'ဆန်းကြယ်မှု နမူနာ (Mystery SMPTE)',
    sourceTextTab: 'စာသား/ဇာတ်လမ်းအကျဉ်းသာ ထည့်မည်',
    movieTitleLabel: 'ရုပ်ရှင်အမည်',
    genreLabel: 'အမျိုးအစား (Genre)',
    synopsisLabel: 'ဇာတ်လမ်းအကျဉ်း သို့မဟုတ် ဇာတ်ညွှန်းမူကြမ်း',
    videoPreview: 'ဗီဒီယို အစမ်းကြည့်ရှုမှု',

    // Settings
    durationLabel: 'ဇာတ်ညွှန်း ကြာမြင့်ချိန်',
    aspectRatioLabel: 'မျက်နှာပြင် အချိုးအစား (Aspect Ratio)',
    resolutionLabel: 'ကြည်လင်ပြတ်သားမှု (Resolution)',
    styleLabel: 'ဇာတ်လမ်းပြော ပုံစံ (Narrative Style)',
    bgMusicLabel: 'နောက်ခံတေးဂီတ (Background Music)',
    bgMusicVolume: 'တေးဂီတ အသံပမာဏ',
    subtitlesToggle: 'မြန်မာစာတန်းထိုး ထည့်သွင်းမည်',
    watermarkLabel: 'ရေစာစာသား (Watermark)',

    // Styles
    styleCinematic: 'ရုပ်ရှင်ဆန်သော (Cinematic)',
    styleSuspense: 'သည်းထိတ်ရင်ဖို (Suspenseful)',
    styleEmotional: 'ရင်ထဲထိရှသော (Emotional Drama)',
    styleDramatic: 'ဒရာမာအသားပေး (Dramatic)',
    styleDocumentary: 'မှတ်တမ်းတင်ပုံစံ (Documentary)',
    styleFastPaced: 'အရှိန်မြန် တက်ကြွသော (Fast-Paced Action)',

    // Script Editor
    scriptEditorTitle: 'မြန်မာဘာသာ ရုပ်ရှင်ဇာတ်ညွှန်း',
    estimatedReadTime: 'ခန့်မှန်း အသံဖတ်ကြာချိန်',
    wordsCount: 'စကားလုံး အရေအတွက်',
    shortenBtn: 'တိုတိုရှင်းရှင်း ပြုလုပ်မည်',
    expandBtn: 'အသေးစိတ် ချဲ့ထွင်မည်',
    regenerateBtn: 'အသစ် ပြန်လည်ရေးသားမည်',
    copyBtn: 'ကူးယူမည်',
    copiedText: 'ကူးယူပြီးပါပြီ!',
    saveDraft: 'မူကြမ်း သိမ်းမည်',
    draftSaved: 'မူကြမ်း သိမ်းဆည်းပြီးပါပြီ',

    // Voice Studio
    voiceTitle: 'မြန်မာအသံစတူဒီယို (Burmese Voice Studio)',
    voiceSubtitle: 'Gemini 3.8 Flash TTS နှင့် သဘာဝကျသော နောက်ခံစကားပြော အသံဖန်တီးခြင်း',
    selectVoice: 'အသံ ရွေးချယ်ရန်',
    voiceSpeed: 'အသံ အမြန်နှုန်း',
    voicePitch: 'အသံ လေသံ (Pitch)',
    generateVoiceBtn: 'အသံ ဖန်တီးမည်',
    voiceGenerating: 'အသံ ဖန်တီးနေပါသည်...',
    audioPreview: 'အသံဖိုင် အစမ်းနားဆင်ရန်',
    downloadAudio: 'အသံဖိုင် ဒေါင်းလုဒ်ရယူမည် (WAV)',

    // Render & Export
    renderReady: 'ဗီဒီယို ထုတ်လုပ်ရန် အသင့်ဖြစ်ပါပြီ',
    renderInProgress: 'FFmpeg ဗီဒီယို ပေါင်းစပ်ထုတ်လုပ်နေပါသည်...',
    downloadMp4: 'ဗီဒီယို ရယူမည် (MP4)',
    downloadSrt: 'စာတန်းထိုး ရယူမည် (SRT)',
    renderSuccess: 'ဗီဒီယို အောင်မြင်စွာ ထုတ်လုပ်ပြီးပါပြီ!',

    // Presets
    presetsTitle: 'အသင့်သုံး ရုပ်ရှင်အကျဉ်းချုပ် ပုံစံများ',
    presetsSubtitle: 'TikTok, YouTube, Facebook Watch စသည်တို့အတွက် အကောင်းဆုံး ကြိုတင်သတ်မှတ်ချက်များ',
    usePreset: 'ဤပုံစံကို အသုံးပြုမည်',

    // Projects
    projectsTitle: 'ကျွန်ုပ်၏ ပရောဂျက်များ',
    noProjects: 'သိမ်းဆည်းထားသော ပရောဂျက် မရှိသေးပါ',
    createProject: 'ပရောဂျက်အသစ် ပြုလုပ်မည်',
    openProject: 'ပြန်လည် ဖွင့်မည်',
    duplicateProject: 'မိတ္တူပွားမည်',
    deleteProject: 'ဖျက်မည်',

    // Downloads
    downloadsTitle: 'ဒေါင်းလုဒ် ပြုလုပ်နိုင်သော ဖိုင်များ',
    noDownloads: 'ထုတ်လုပ်ထားသော ဖိုင် မရှိသေးပါ',

    // Help & FAQ
    helpTitle: 'အသုံးပြုပုံ လမ်းညွှန်နှင့် အကြံပြုချက်များ',
    helpSubtitle: 'မြန်မာဘာသာ ရုပ်ရှင်အကျဉ်းချုပ် ဗီဒီယိုများ အောင်မြင်စွာ ဖန်တီးနိုင်ရန် အဆင့်ဆင့် လမ်းညွှန်ချက်',

    // Messages
    warningUnsaved: 'မသိမ်းဆည်းရသေးသော အပြောင်းအလဲများ ပျက်ပြယ်သွားနိုင်ပါသည်။ ဆက်လုပ်မည်လား?',
  },

  en: {
    // Brand & Header
    brandName: 'TAI RECAP AI',
    tagline: 'AI Movie Recap in Burmese & English',
    statusOnline: 'System Online',
    langToggle: 'မြန်မာဘာသာသို့ ပြောင်းရန်',

    // Navigation
    navDashboard: 'Dashboard',
    navAuto: 'Full Auto Mode',
    navRecap: 'AI Movie Recap',
    navTranscript: 'Transcript Hub',
    navVoice: 'Voice Studio',
    navProjects: 'My Projects',
    navDownloads: 'Downloads',
    navPresets: 'Presets',
    navSettings: 'Settings',
    navHelp: 'Help & Guide',

    // Primary Actions
    generateRecap: 'Generate Recap',
    generating: 'Generating AI Script...',
    exportVideo: 'Export Video',
    exporting: 'Rendering Video...',
    storyRecapV2: 'Story Recap V2',
    storyRecapV2Desc: 'Deep narrative restructuring with Gemini 4 Argon reasoning',

    // Dashboard
    dashTitle: 'Movie Recap Creation Suite',
    dashSubtitle: 'Generate authentic Burmese recap scripts, realistic voiceover narration, and cinematic videos with real AI & FFmpeg',
    quickStart: 'Quick Launch',
    newRecapBtn: 'New Movie Recap',
    voiceStudioBtn: 'Voice Studio',
    systemStatus: 'System Architecture & Capabilities',
    ffmpegReady: 'FFmpeg Video Pipeline (Active)',
    geminiReady: 'Gemini AI Intelligence (Connected)',
    ttsReady: 'Burmese Voiceover Engine (Ready)',
    totalRecaps: 'Recap Scripts Created',
    totalRenders: 'Rendered Videos',
    recentProjects: 'Recent Projects',
    viewAll: 'View All',

    // Workspace
    workspaceTitle: 'Movie Recap Studio Workspace',
    step1: '1. Source Video & Text Input',
    step2: '2. AI Analysis & Recap Settings',
    step3: '3. Burmese Script Editor',
    step4: '4. Voiceover & Narration (TTS)',
    step5: '5. Subtitles & Visual Effects',
    step6: '6. Video Rendering & Export',

    // Video & Source Input
    uploadVideo: 'Upload Source Video',
    uploadHint: 'Drag and drop MP4, MOV, or WebM video (or click to browse)',
    orSelectSample: 'Or select a built-in demo sample video',
    sample1: 'Cyberpunk Thriller Sample',
    sample2: 'Mystery SMPTE Sample',
    sourceTextTab: 'Use Story Plot / Synopsis Only',
    movieTitleLabel: 'Movie Title',
    genreLabel: 'Genre',
    synopsisLabel: 'Plot Synopsis or Rough Transcript',
    videoPreview: 'Source Video Preview',

    // Settings
    durationLabel: 'Target Duration',
    aspectRatioLabel: 'Aspect Ratio',
    resolutionLabel: 'Resolution',
    styleLabel: 'Narration Style',
    bgMusicLabel: 'Background Music',
    bgMusicVolume: 'Music Volume',
    subtitlesToggle: 'Burn-in Burmese Subtitles',
    watermarkLabel: 'Watermark Text',

    // Styles
    styleCinematic: 'Cinematic',
    styleSuspense: 'Suspenseful Thriller',
    styleEmotional: 'Emotional Drama',
    styleDramatic: 'Dramatic',
    styleDocumentary: 'Documentary Breakdown',
    styleFastPaced: 'Fast-Paced Action',

    // Script Editor
    scriptEditorTitle: 'Burmese Recap Script',
    estimatedReadTime: 'Estimated Narration Time',
    wordsCount: 'Word Count',
    shortenBtn: 'Shorten Script',
    expandBtn: 'Expand Details',
    regenerateBtn: 'Regenerate',
    copyBtn: 'Copy Script',
    copiedText: 'Copied to clipboard!',
    saveDraft: 'Save Project Draft',
    draftSaved: 'Project draft saved',

    // Voice Studio
    voiceTitle: 'Burmese Voice Studio',
    voiceSubtitle: 'Gemini 3.8 Flash TTS with natural voice personas and speaking cadence',
    selectVoice: 'Select Voice Persona',
    voiceSpeed: 'Speaking Speed',
    voicePitch: 'Pitch Tone',
    generateVoiceBtn: 'Synthesize Voice',
    voiceGenerating: 'Synthesizing voice...',
    audioPreview: 'Audio Preview & Waveform',
    downloadAudio: 'Download Audio (WAV)',

    // Render & Export
    renderReady: 'Ready for Video Render',
    renderInProgress: 'FFmpeg Processing Pipeline in progress...',
    downloadMp4: 'Download Video (MP4)',
    downloadSrt: 'Download Subtitles (SRT)',
    renderSuccess: 'Video Rendered Successfully!',

    // Presets
    presetsTitle: 'Curated Recap Presets',
    presetsSubtitle: 'Optimized settings for TikTok, YouTube, and Facebook Reels',
    usePreset: 'Use This Preset',

    // Projects
    projectsTitle: 'My Saved Projects',
    noProjects: 'No saved projects yet. Create your first recap!',
    createProject: 'Create New Project',
    openProject: 'Open in Workspace',
    duplicateProject: 'Duplicate',
    deleteProject: 'Delete',

    // Downloads
    downloadsTitle: 'Downloads Hub',
    noDownloads: 'No generated files yet',

    // Help & FAQ
    helpTitle: 'Burmese Movie Recap Guide & FAQ',
    helpSubtitle: 'Professional workflows for high-retention movie recap creators',

    // Messages
    warningUnsaved: 'You have unsaved edits that will be lost. Do you wish to continue?',
  },
};

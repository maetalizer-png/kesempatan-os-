const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

export const HUMAN_VOICES = {
    professional_male: {
        name: "👨‍💼 Profesional Pria",
        pitch: 0.88, rate: 0.92,
        gender: 'male', age: 'adult', style: 'professional',
        accent: 'neutral', emotion: 'neutral',
        desc: "Tegas, meyakinkan, profesional",
        emoji: "👨‍💼"
    },
    professional_female: {
        name: "👩‍💼 Profesional Wanita",
        pitch: 1.08, rate: 0.95,
        gender: 'female', age: 'adult', style: 'professional',
        accent: 'neutral', emotion: 'neutral',
        desc: "Berwibawa, jelas, profesional",
        emoji: "👩‍💼"
    },
    executive_male: {
        name: "👔 Eksekutif Pria",
        pitch: 0.82, rate: 0.88,
        gender: 'male', age: 'senior', style: 'professional',
        accent: 'neutral', emotion: 'confident',
        desc: "Berwibawa, eksekutif, leadership",
        emoji: "👔"
    },
    executive_female: {
        name: "👔 Eksekutif Wanita",
        pitch: 1.02, rate: 0.9,
        gender: 'female', age: 'senior', style: 'professional',
        accent: 'neutral', emotion: 'confident',
        desc: "Tegas, eksekutif, berkarisma",
        emoji: "👔"
    },
    consultant_male: {
        name: "📊 Konsultan Pria",
        pitch: 0.9, rate: 0.9,
        gender: 'male', age: 'adult', style: 'professional',
        accent: 'neutral', emotion: 'calm',
        desc: "Analitis, terstruktur, konsultan",
        emoji: "📊"
    },
    consultant_female: {
        name: "📊 Konsultan Wanita",
        pitch: 1.1, rate: 0.92,
        gender: 'female', age: 'adult', style: 'professional',
        accent: 'neutral', emotion: 'calm',
        desc: "Detail, terstruktur, konsultan",
        emoji: "📊"
    },
    casual_male: {
        name: "🧑 Santai Pria",
        pitch: 0.95, rate: 0.88,
        gender: 'male', age: 'young', style: 'casual',
        accent: 'neutral', emotion: 'friendly',
        desc: "Ramah, santai, mudah akrab",
        emoji: "🧑"
    },
    casual_female: {
        name: "👩 Santai Wanita",
        pitch: 1.15, rate: 0.9,
        gender: 'female', age: 'young', style: 'casual',
        accent: 'neutral', emotion: 'friendly',
        desc: "Hangat, menyenangkan, ramah",
        emoji: "👩"
    },
    friendly_male: {
        name: "😊 Ramah Pria",
        pitch: 0.92, rate: 0.85,
        gender: 'male', age: 'adult', style: 'casual',
        accent: 'neutral', emotion: 'warm',
        desc: "Ramah, hangat, menyenangkan",
        emoji: "😊"
    },
    friendly_female: {
        name: "😊 Ramah Wanita",
        pitch: 1.12, rate: 0.88,
        gender: 'female', age: 'adult', style: 'casual',
        accent: 'neutral', emotion: 'warm',
        desc: "Lembut, hangat, menyenangkan",
        emoji: "😊"
    },
    energetic_male: {
        name: "⚡ Energik Pria",
        pitch: 1.05, rate: 1.1,
        gender: 'male', age: 'young', style: 'energetic',
        accent: 'neutral', emotion: 'excited',
        desc: "Bersemangat, memotivasi, hype",
        emoji: "⚡"
    },
    energetic_female: {
        name: "⚡ Energik Wanita",
        pitch: 1.25, rate: 1.08,
        gender: 'female', age: 'young', style: 'energetic',
        accent: 'neutral', emotion: 'excited',
        desc: "Ceria, inspiratif, bersemangat",
        emoji: "⚡"
    },
    motivational_male: {
        name: "🔥 Motivator Pria",
        pitch: 1.1, rate: 1.05,
        gender: 'male', age: 'adult', style: 'energetic',
        accent: 'neutral', emotion: 'enthusiastic',
        desc: "Inspiratif, memotivasi, powerful",
        emoji: "🔥"
    },
    motivational_female: {
        name: "🔥 Motivator Wanita",
        pitch: 1.3, rate: 1.02,
        gender: 'female', age: 'adult', style: 'energetic',
        accent: 'neutral', emotion: 'enthusiastic',
        desc: "Inspiratif, powerful, memukau",
        emoji: "🔥"
    },
    wise_male: {
        name: "🦉 Bijak Pria",
        pitch: 0.78, rate: 0.8,
        gender: 'male', age: 'senior', style: 'wise',
        accent: 'neutral', emotion: 'calm',
        desc: "Dalam, penuh pengalaman, bijak",
        emoji: "🦉"
    },
    wise_female: {
        name: "🦉 Bijak Wanita",
        pitch: 0.95, rate: 0.83,
        gender: 'female', age: 'senior', style: 'wise',
        accent: 'neutral', emotion: 'calm',
        desc: "Tenang, menenangkan, bijaksana",
        emoji: "🦉"
    },
    mentor_male: {
        name: "🎓 Mentor Pria",
        pitch: 0.85, rate: 0.85,
        gender: 'male', age: 'senior', style: 'wise',
        accent: 'neutral', emotion: 'warm',
        desc: "Bijak, membimbing, pengalaman",
        emoji: "🎓"
    },
    mentor_female: {
        name: "🎓 Mentor Wanita",
        pitch: 1.0, rate: 0.87,
        gender: 'female', age: 'senior', style: 'wise',
        accent: 'neutral', emotion: 'warm',
        desc: "Bijaksana, membimbing, hangat",
        emoji: "🎓"
    },
    youthful_male: {
        name: "🧑‍🎤 Muda Pria",
        pitch: 1.15, rate: 1.05,
        gender: 'male', age: 'teen', style: 'youthful',
        accent: 'modern', emotion: 'enthusiastic',
        desc: "Segar, semangat, dinamis",
        emoji: "🧑‍🎤"
    },
    youthful_female: {
        name: "👩‍🎤 Muda Wanita",
        pitch: 1.35, rate: 1.02,
        gender: 'female', age: 'teen', style: 'youthful',
        accent: 'modern', emotion: 'enthusiastic',
        desc: "Ceria, segar, energik",
        emoji: "👩‍🎤"
    },
    trendy_male: {
        name: "📱 Tren Pria",
        pitch: 1.1, rate: 1.0,
        gender: 'male', age: 'young', style: 'youthful',
        accent: 'modern', emotion: 'excited',
        desc: "Modern, trendi, kekinian",
        emoji: "📱"
    },
    trendy_female: {
        name: "📱 Tren Wanita",
        pitch: 1.3, rate: 0.98,
        gender: 'female', age: 'young', style: 'youthful',
        accent: 'modern', emotion: 'excited',
        desc: "Modern, trendi, stylish",
        emoji: "📱"
    },
    warm_male: {
        name: "🤗 Hangat Pria",
        pitch: 0.9, rate: 0.83,
        gender: 'male', age: 'adult', style: 'warm',
        accent: 'neutral', emotion: 'warm',
        desc: "Ramah, hangat, menyejukkan",
        emoji: "🤗"
    },
    warm_female: {
        name: "🤗 Hangat Wanita",
        pitch: 1.08, rate: 0.86,
        gender: 'female', age: 'adult', style: 'warm',
        accent: 'neutral', emotion: 'warm',
        desc: "Lembut, menenangkan, hangat",
        emoji: "🤗"
    },
    gentle_male: {
        name: "🌿 Lembut Pria",
        pitch: 0.88, rate: 0.8,
        gender: 'male', age: 'adult', style: 'warm',
        accent: 'neutral', emotion: 'calm',
        desc: "Lembut, menenangkan, teduh",
        emoji: "🌿"
    },
    gentle_female: {
        name: "🌿 Lembut Wanita",
        pitch: 1.05, rate: 0.84,
        gender: 'female', age: 'adult', style: 'warm',
        accent: 'neutral', emotion: 'calm',
        desc: "Lembut, halus, menenangkan",
        emoji: "🌿"
    },
    authoritative_male: {
        name: "🎯 Berwibawa Pria",
        pitch: 0.83, rate: 0.86,
        gender: 'male', age: 'adult', style: 'authoritative',
        accent: 'neutral', emotion: 'confident',
        desc: "Tegas, berwibawa, meyakinkan",
        emoji: "🎯"
    },
    authoritative_female: {
        name: "🎯 Berwibawa Wanita",
        pitch: 1.02, rate: 0.88,
        gender: 'female', age: 'adult', style: 'authoritative',
        accent: 'neutral', emotion: 'confident',
        desc: "Kuat, profesional, berwibawa",
        emoji: "🎯"
    },
    commanding_male: {
        name: "💪 Komandan Pria",
        pitch: 0.8, rate: 0.84,
        gender: 'male', age: 'senior', style: 'authoritative',
        accent: 'neutral', emotion: 'confident',
        desc: "Komandan, tegas, berkarisma",
        emoji: "💪"
    },
    commanding_female: {
        name: "💪 Komandan Wanita",
        pitch: 0.98, rate: 0.86,
        gender: 'female', age: 'senior', style: 'authoritative',
        accent: 'neutral', emotion: 'confident',
        desc: "Komandan, tegas, powerful",
        emoji: "💪"
    },
    accent_java_male: {
        name: "🇮🇩 Jawa Pria",
        pitch: 0.86, rate: 0.84,
        gender: 'male', age: 'adult', style: 'accent',
        accent: 'jawa', emotion: 'friendly',
        desc: "Logat Jawa khas, ramah",
        emoji: "🇮🇩"
    },
    accent_java_female: {
        name: "🇮🇩 Jawa Wanita",
        pitch: 1.06, rate: 0.87,
        gender: 'female', age: 'adult', style: 'accent',
        accent: 'jawa', emotion: 'warm',
        desc: "Logat Jawa lembut, hangat",
        emoji: "🇮🇩"
    },
    accent_sunda_male: {
        name: "🇮🇩 Sunda Pria",
        pitch: 0.88, rate: 0.86,
        gender: 'male', age: 'adult', style: 'accent',
        accent: 'sunda', emotion: 'friendly',
        desc: "Logat Sunda, ramah, khas",
        emoji: "🇮🇩"
    },
    accent_sunda_female: {
        name: "🇮🇩 Sunda Wanita",
        pitch: 1.08, rate: 0.89,
        gender: 'female', age: 'adult', style: 'accent',
        accent: 'sunda', emotion: 'warm',
        desc: "Logat Sunda lembut, hangat",
        emoji: "🇮🇩"
    },
    accent_batak_male: {
        name: "🇮🇩 Batak Pria",
        pitch: 0.9, rate: 0.88,
        gender: 'male', age: 'adult', style: 'accent',
        accent: 'batak', emotion: 'friendly',
        desc: "Logat Batak khas, bersemangat",
        emoji: "🇮🇩"
    },
    accent_batak_female: {
        name: "🇮🇩 Batak Wanita",
        pitch: 1.1, rate: 0.9,
        gender: 'female', age: 'adult', style: 'accent',
        accent: 'batak', emotion: 'warm',
        desc: "Logat Batak lembut, hangat",
        emoji: "🇮🇩"
    },
    podcast_host: {
        name: "🎙️ Host Podcast",
        pitch: 0.93, rate: 0.92,
        gender: 'male', age: 'adult', style: 'podcast',
        accent: 'neutral', emotion: 'enthusiastic',
        desc: "Host profesional, engaging",
        emoji: "🎙️"
    },
    podcast_cohost: {
        name: "🎙️ Co-Host",
        pitch: 1.1, rate: 0.94,
        gender: 'female', age: 'adult', style: 'podcast',
        accent: 'neutral', emotion: 'friendly',
        desc: "Co-host ramah, santai",
        emoji: "🎙️"
    },
    narrator: {
        name: "📖 Narator",
        pitch: 0.9, rate: 0.87,
        gender: 'male', age: 'adult', style: 'narrative',
        accent: 'neutral', emotion: 'calm',
        desc: "Narator jernih, profesional",
        emoji: "📖"
    },
    narrator_female: {
        name: "📖 Narator Wanita",
        pitch: 1.08, rate: 0.89,
        gender: 'female', age: 'adult', style: 'narrative',
        accent: 'neutral', emotion: 'calm',
        desc: "Narator jernih, elegan",
        emoji: "📖"
    },
    storyteller: {
        name: "📚 Pendongeng",
        pitch: 0.95, rate: 0.83,
        gender: 'female', age: 'senior', style: 'storytelling',
        accent: 'neutral', emotion: 'warm',
        desc: "Pendongeng hangat, memikat",
        emoji: "📚"
    },
    storyteller_male: {
        name: "📚 Pendongeng Pria",
        pitch: 0.88, rate: 0.85,
        gender: 'male', age: 'senior', style: 'storytelling',
        accent: 'neutral', emotion: 'warm',
        desc: "Pendongeng hangat, memikat",
        emoji: "📚"
    }
};

export const VOICE_EMOTIONS = {
    neutral: { pitch: 1.0, rate: 1.0, energy: 0.5, label: "😐 Netral" },
    friendly: { pitch: 1.05, rate: 0.95, energy: 0.7, label: "😊 Ramah" },
    excited: { pitch: 1.15, rate: 1.08, energy: 0.9, label: "🤩 Bersemangat" },
    calm: { pitch: 0.92, rate: 0.88, energy: 0.3, label: "🧘 Tenang" },
    warm: { pitch: 1.02, rate: 0.9, energy: 0.6, label: "🤗 Hangat" },
    confident: { pitch: 1.0, rate: 0.95, energy: 0.8, label: "💪 Percaya Diri" },
    enthusiastic: { pitch: 1.12, rate: 1.05, energy: 0.85, label: "🔥 Antusias" },
    storytelling: { pitch: 0.95, rate: 0.85, energy: 0.5, label: "📖 Bertutur" },
    persuasive: { pitch: 1.02, rate: 0.92, energy: 0.75, label: "🎯 Persuasif" }
};

export const LANGUAGES = {
    id: { name: "🇮🇩 Indonesia", code: "id-ID", label: "Indonesia" },
    en: { name: "🇬🇧 English", code: "en-US", label: "English" },
    en_uk: { name: "🇬🇧 English UK", code: "en-GB", label: "English UK" },
    en_au: { name: "🇦🇺 English AU", code: "en-AU", label: "English AU" },
    jv: { name: "🇮🇩 Jawa", code: "jv-ID", label: "Jawa" },
    su: { name: "🇮🇩 Sunda", code: "su-ID", label: "Sunda" },
    ms: { name: "🇲🇾 Melayu", code: "ms-MY", label: "Melayu" },
    zh: { name: "🇨🇳 中文", code: "zh-CN", label: "中文" },
    ja: { name: "🇯🇵 日本語", code: "ja-JP", label: "日本語" },
    ko: { name: "🇰🇷 한국어", code: "ko-KR", label: "한국어" },
    es: { name: "🇪🇸 Español", code: "es-ES", label: "Español" },
    fr: { name: "🇫🇷 Français", code: "fr-FR", label: "Français" },
    de: { name: "🇩🇪 Deutsch", code: "de-DE", label: "Deutsch" },
    ar: { name: "🇸🇦 العربية", code: "ar-SA", label: "العربية" },
    hi: { name: "🇮🇳 हिन्दी", code: "hi-IN", label: "हिन्दी" },
    pt: { name: "🇵🇹 Português", code: "pt-PT", label: "Português" },
    ru: { name: "🇷🇺 Русский", code: "ru-RU", label: "Русский" },
    it: { name: "🇮🇹 Italiano", code: "it-IT", label: "Italiano" }
};



export const THEMES = {
    dark: { bg: '#03050A', primary: '#00FFA3', secondary: '#9B59B6', text: '#FFFFFF', card: 'rgba(255,255,255,0.025)', border: 'rgba(255,255,255,0.07)' },
    neon: { bg: '#0A0A1A', primary: '#FF00FF', secondary: '#00FFFF', text: '#FFFFFF', card: 'rgba(255,255,255,0.025)', border: 'rgba(255,0,255,0.1)' },
    retro: { bg: '#1A0A0A', primary: '#FF6B35', secondary: '#F7C59F', text: '#EFEFEF', card: 'rgba(255,255,255,0.025)', border: 'rgba(255,107,53,0.1)' },
    forest: { bg: '#0A1A0A', primary: '#4CAF50', secondary: '#8BC34A', text: '#E8F5E9', card: 'rgba(255,255,255,0.025)', border: 'rgba(76,175,80,0.1)' },
    ocean: { bg: '#0A0A1A', primary: '#00BFFF', secondary: '#1E90FF', text: '#E0F7FA', card: 'rgba(255,255,255,0.025)', border: 'rgba(0,191,255,0.1)' },
    sunset: { bg: '#1A0A0A', primary: '#FF6B6B', secondary: '#FFA500', text: '#FFF3E0', card: 'rgba(255,255,255,0.025)', border: 'rgba(255,107,107,0.1)' },
    galaxy: { bg: '#0A0515', primary: '#7B68EE', secondary: '#FF69B4', text: '#E8D5F5', card: 'rgba(255,255,255,0.025)', border: 'rgba(123,104,238,0.1)' }
};

export const BG_MUSIC = {
    off: { name: "🔇 Off", url: null },
    lofi: { name: "🎵 Lo-Fi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    inspirational: { name: "🎶 Inspiratif", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    epic: { name: "🎼 Epic", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    jazz: { name: "🎷 Jazz", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    ambient: { name: "🌊 Ambient", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" }
};




export const AGENT_VOICES = {
    Kesempatan: { name: "👨 Kesempatan", pitch: 0.85, rate: 0.88, volume: 0.95, pauseFactor: 1.15, pitchVariance: 0.05, desc: "Bijak, santai, pengalaman" },
    NenekBijak: { name: "👵 Nenek Bijak", pitch: 1.1, rate: 0.75, volume: 0.85, pauseFactor: 1.4, pitchVariance: 0.08, desc: "Lembut, penuh pengalaman hidup, bicara pelan-pelan" },
    KakekSantai: { name: "👴 Kakek Santai", pitch: 0.7, rate: 0.78, volume: 0.85, pauseFactor: 1.3, pitchVariance: 0.06, desc: "Tenang, humoris sesekali, kaya nasihat" },
    CewekKece: { name: "👧 Cewek Kece", pitch: 1.3, rate: 1.08, volume: 0.95, pauseFactor: 0.65, pitchVariance: 0.09, desc: "Ceria, gaul, energik, banyak ekspresi" },
    CowokKalem: { name: "🧑 Cowok Kalem", pitch: 0.8, rate: 0.9, volume: 0.9, pauseFactor: 1.05, pitchVariance: 0.03, desc: "Kalem, to the point, gak banyak basa-basi" },
    KakakMotivator: { name: "💪 Kakak Motivator", pitch: 1.0, rate: 1.03, volume: 1.0, pauseFactor: 0.6, pitchVariance: 0.08, desc: "Membangkitkan semangat, penuh energi positif" },
    TanteBawel: { name: "👩 Tante Bawel", pitch: 1.25, rate: 1.12, volume: 0.95, pauseFactor: 0.55, pitchVariance: 0.1, desc: "Cerewet asik, banyak komentar spontan" },
    Manager: { name: "📋 Manager", pitch: 0.9, rate: 0.92, volume: 1.0, pauseFactor: 0.9, pitchVariance: 0.03, desc: "Tegas, profesional, terstruktur" },
    StartupFounder: { name: "🚀 Startup Founder", pitch: 1.08, rate: 1.05, volume: 1.0, pauseFactor: 0.75, pitchVariance: 0.07, desc: "Energik, optimis, visioner" },
    SundanyaAsep: { name: "😂 Sundanya Asep", pitch: 1.18, rate: 1.02, volume: 0.98, pauseFactor: 0.8, pitchVariance: 0.09, desc: "Lucu, santai, sunda banget" },
    Analyst: { name: "📊 Analyst", pitch: 0.86, rate: 0.88, volume: 0.9, pauseFactor: 1.1, pitchVariance: 0.03, desc: "Analitis, detail, objektif" },
    Moderator: { name: "🎙️ Moderator", pitch: 0.95, rate: 0.93, volume: 0.97, pauseFactor: 0.95, pitchVariance: 0.04, desc: "Netral, terstruktur, profesional" },
    
    
    discussion_host: {
        name: "🎙️ Host",
        pitch: 1.02, rate: 0.98, volume: 1.0, pauseFactor: 0.7, pitchVariance: 0.06,
        desc: "Ramah, membawa suasana, energik, suka bertanya"
    },
    discussion_expert: {
        name: "🧠 Expert",
        pitch: 0.68, rate: 0.8, volume: 0.92, pauseFactor: 1.25, pitchVariance: 0.02,
        desc: "Analitis, memberi data, tenang, bicara terukur"
    },
    discussion_storyteller: {
        name: "📖 Storyteller",
        pitch: 1.22, rate: 0.87, volume: 0.88, pauseFactor: 1.0, pitchVariance: 0.1,
        desc: "Suka analogi, cerita pengalaman, hangat, ekspresif"
    },
    discussion_skeptic: {
        name: "🤔 Skeptic",
        pitch: 0.84, rate: 1.08, volume: 0.95, pauseFactor: 1.35, pitchVariance: 0.05,
        desc: "Kritis, suka bertanya 'kenapa', jeda sebelum menyanggah"
    },

    
    
    
    discussion_host_pria: {
        name: "👨‍🎙️ Host (Pria)", pitch: 0.92, rate: 0.98, volume: 1.0, pauseFactor: 0.7, pitchVariance: 0.06,
        desc: "Ramah, membawa suasana, energik, suka bertanya"
    },
    discussion_host_wanita: {
        name: "👩‍🎙️ Host (Wanita)", pitch: 1.28, rate: 0.98, volume: 1.0, pauseFactor: 0.7, pitchVariance: 0.06,
        desc: "Ramah, membawa suasana, energik, suka bertanya"
    },
    discussion_expert_pria: {
        name: "👨‍💼 Expert (Pria)", pitch: 0.62, rate: 0.8, volume: 0.92, pauseFactor: 1.25, pitchVariance: 0.02,
        desc: "Analitis, memberi data, tenang, bicara terukur"
    },
    discussion_expert_wanita: {
        name: "👩‍💼 Expert (Wanita)", pitch: 1.15, rate: 0.8, volume: 0.92, pauseFactor: 1.25, pitchVariance: 0.02,
        desc: "Analitis, memberi data, tenang, bicara terukur"
    },
    discussion_storyteller_pria: {
        name: "👨‍📖 Storyteller (Pria)", pitch: 0.9, rate: 0.87, volume: 0.88, pauseFactor: 1.0, pitchVariance: 0.1,
        desc: "Suka analogi, cerita pengalaman, hangat, ekspresif"
    },
    discussion_storyteller_wanita: {
        name: "👩‍📖 Storyteller (Wanita)", pitch: 1.35, rate: 0.87, volume: 0.88, pauseFactor: 1.0, pitchVariance: 0.1,
        desc: "Suka analogi, cerita pengalaman, hangat, ekspresif"
    },
    discussion_skeptic_pria: {
        name: "🤔👨 Skeptic (Pria)", pitch: 0.72, rate: 1.08, volume: 0.95, pauseFactor: 1.35, pitchVariance: 0.05,
        desc: "Kritis, suka bertanya 'kenapa', jeda sebelum menyanggah"
    },
    discussion_skeptic_wanita: {
        name: "🤔👩 Skeptic (Wanita)", pitch: 1.22, rate: 1.08, volume: 0.95, pauseFactor: 1.35, pitchVariance: 0.05,
        desc: "Kritis, suka bertanya 'kenapa', jeda sebelum menyanggah"
    }
};


export const DB_COLLECTIONS = {
    analyses: 'analyses',
    podcasts: 'podcasts'
};

KESEMPATAN.Podcast.config = {
    HUMAN_VOICES: HUMAN_VOICES,
    VOICE_EMOTIONS: VOICE_EMOTIONS,
    LANGUAGES: LANGUAGES,
    THEMES: THEMES,
    BG_MUSIC: BG_MUSIC,
    AGENT_VOICES: AGENT_VOICES,
    VOICE_PRESETS: HUMAN_VOICES,
    DB_COLLECTIONS: DB_COLLECTIONS
};

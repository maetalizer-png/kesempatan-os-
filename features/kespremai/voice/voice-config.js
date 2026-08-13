const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const THEMES = {
dark: { bg: '#03050A', text: '#FFFFFF', card: 'rgba(0,255,163,0.05)', border: 'rgba(0,255,163,0.2)', input: '#0a0f1c' },
light: { bg: '#F5F5F5', text: '#1A1A2E', card: 'rgba(0,204,136,0.08)', border: 'rgba(0,204,136,0.2)', input: '#E8E8E8' }
};

const LANGUAGES = {
id: { name: '🇮🇩 Indonesia', code: 'id-ID', default: true },
en: { name: '🇺🇸 English US', code: 'en-US' },
engb: { name: '🇬🇧 English UK', code: 'en-GB' },
enau: { name: '🇦🇺 English AU', code: 'en-AU' },
zh: { name: '🇨🇳 中文', code: 'zh-CN' },
ja: { name: '🇯🇵 日本語', code: 'ja-JP' },
ko: { name: '🇰🇷 한국어', code: 'ko-KR' },
fr: { name: '🇫 Français', code: 'fr-FR' },
de: { name: '🇩🇪 Deutsch', code: 'de-DE' },
es: { name: '🇪🇸 Español', code: 'es-ES' },
hi: { name: '🇮🇳 हिन्दी', code: 'hi-IN' },
ar: { name: '🇸🇦 العربية', code: 'ar-SA' },
pt: { name: '🇵🇹 Português', code: 'pt-PT' },
ru: { name: '🇷🇺 Русский', code: 'ru-RU' }
};

const VOICE_CONFIG = {
presets: {
professional: { name: '👔 Profesional', pitch: 0.9, rate: 0.9, lang: 'id', effect: 'none' },
relaxed: { name: '😌 Santai', pitch: 0.95, rate: 0.85, lang: 'id', effect: 'none' },
energetic: { name: '⚡ Energik', pitch: 1.15, rate: 1.05, lang: 'id', effect: 'none' },
wise: { name: '🦉 Bijak', pitch: 0.85, rate: 0.88, lang: 'id', effect: 'none' },
funny: { name: '😂 Lucu', pitch: 1.1, rate: 1.0, lang: 'id', effect: 'none' },
robot: { name: '🤖 Robot', pitch: 0.7, rate: 1.2, lang: 'en', effect: 'robot' },
elderly: { name: '👴 Tua', pitch: 0.75, rate: 0.8, lang: 'id', effect: 'none' },
child: { name: '🧒 Anak', pitch: 1.4, rate: 1.1, lang: 'id', effect: 'none' },
mysterious: { name: '🌙 Misterius', pitch: 0.8, rate: 0.85, lang: 'en', effect: 'echo' },
enthusiastic: { name: '🎉 Antusias', pitch: 1.25, rate: 1.08, lang: 'id', effect: 'none' },
calm: { name: '🍃 Tenang', pitch: 0.88, rate: 0.82, lang: 'id', effect: 'none' },
authoritative: { name: '👑 Berwibawa', pitch: 0.82, rate: 0.88, lang: 'en', effect: 'none' },
whisper: { name: '🤫 Berbisik', pitch: 1.3, rate: 0.75, lang: 'id', effect: 'none' },
deep: { name: '🗿 Dalam', pitch: 0.65, rate: 0.85, lang: 'en', effect: 'reverb' },
high: { name: '🎵 Tinggi', pitch: 1.5, rate: 1.0, lang: 'id', effect: 'none' },
santa: { name: '🎅 Santa', pitch: 0.8, rate: 0.9, lang: 'en', effect: 'none' },
chipmunk: { name: '🐿️ Chipmunk', pitch: 1.8, rate: 1.3, lang: 'en', effect: 'chipmunk' },
demon: { name: '👿 Demon', pitch: 0.4, rate: 0.7, lang: 'en', effect: 'demon' },
angel: { name: '😇 Angel', pitch: 1.6, rate: 0.9, lang: 'en', effect: 'angel' }
},
bgMusic: {
none: { name: 'Off', url: null, volume: 0 },
ambient: { name: 'Ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', volume: 0.12 },
piano: { name: 'Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', volume: 0.1 },
nature: { name: 'Nature', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', volume: 0.08 }
},
speedPresets: {
slow: { name: 'Slow', rate: 0.6 },
normal: { name: 'Normal', rate: 0.95 },
fast: { name: 'Fast', rate: 1.3 },
super: { name: 'Super Fast', rate: 1.8 }
},
defaults: { preset: 'professional', language: 'id', rate: 0.95, pitch: 1.0, volume: 1.0, bgMusic: 'none', ssml: true, effect: 'none', speedPreset: 'normal' }
};

const STORAGE_KEYS = {
SETTINGS: 'kes_voice_suara_v21',
CLONES: 'kes_voice_clones_v21',
ACTIVE_CLONE: 'kes_active_voice_clone_v21',
HISTORY: 'kes_voice_history_v21',
ANALYTICS: 'kes_voice_analytics_v21',
FAVORITES: 'kes_voice_favorites_v21',
THEME: 'kes_voice_theme_v21'
};

const CLONE_CONFIG_DEFAULTS = { maxClones: 5, isRecording: false, mediaRecorder: null, audioChunks: [] };
const HISTORY_CONFIG_DEFAULTS = { maxItems: 50 };
const FAVORITES_DEFAULTS = { maxItems: 10 };
const ANALYTICS_DEFAULTS = { totalSpeaks: 0, totalDuration: 0, favoriteVoice: {}, languageUsage: {}, lastActivity: null };

const AGENT_PERSONALITIES = {
'RahmadRaharjo': 'Bijak, santai, pengalaman, memberi nasihat',
'Manager': 'Tegas, profesional, terstruktur, fokus pada hasil',
'StartupFounder': 'Energik, optimis, visioner, suka inovasi',
'DevilsAdvocate': 'Kritis, analitis, suka bertanya, menantang',
'SundanyaAsep': 'Lucu, santai, bersahaja, sunda banget'
};

const AGENT_DISPLAY = {
'RahmadRaharjo': 'Rahmad Raharjo',
'Manager': 'Manager',
'StartupFounder': 'StartupFounder',
'DevilsAdvocate': 'DevilsAdvocate',
'SundanyaAsep': 'Sundanya Asep'
};

export const VoiceConfig = {
    THEMES, LANGUAGES, VOICE_CONFIG, STORAGE_KEYS,
    CLONE_CONFIG_DEFAULTS, HISTORY_CONFIG_DEFAULTS,
    FAVORITES_DEFAULTS, ANALYTICS_DEFAULTS,
    AGENT_PERSONALITIES, AGENT_DISPLAY
};
KESEMPATAN.VoiceConfig = VoiceConfig;

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const STORAGE_KEYS = {
    HISTORY: 'kes_visual_agent_history',
    API_MODE: 'kes_vision_api_mode',
    GOOGLE_KEY: 'kes_google_vision_key',
    CLARIFAI_KEY: 'kes_clarifai_key',
    USE_AI: 'kes_use_ai_internal',
    DARK_MODE: 'kes_visual_dark_mode',
    VOICE: 'kes_voice_feedback'
};

const DEFAULT_VALUES = {
    API_MODE: 'canvas',
    USE_AI: true,
    DARK_MODE: true,
    VOICE: true,
    MAX_HISTORY: 100
};

const AVATAR_COLORS = {
    modern: 0x00FFA3,
    vintage: 0xFFD700,
    minimalist: 0x4ECDC4,
    colorful: 0x9B59B6
};

const STYLE_MAP = {
    modern: 'Modern',
    vintage: 'Vintage',
    minimalist: 'Minimalis',
    colorful: 'Colorful'
};

const MOOD_MAP = {
    energik: 'Energi',
    calm: 'Tenang',
    bold: 'Berani',
    ceria: 'Ceria'
};

const TAG_MAP = {
    modern: ['#Modern', '#Inovatif', '#Digital'],
    vintage: ['#Vintage', '#Klasik', '#Elegan'],
    minimalist: ['#Minimalis', '#Simpel', '#Efisien'],
    colorful: ['#Colorful', '#Kreatif', '#Ekspresif']
};

const SOCIAL_COLORS = {
    modern: '#00FFA3',
    vintage: '#FFD700',
    minimalist: '#4ECDC4',
    colorful: '#9B59B6'
};

export const VisualConfig = {
    STORAGE_KEYS: STORAGE_KEYS,
    DEFAULT_VALUES: DEFAULT_VALUES,
    AVATAR_COLORS: AVATAR_COLORS,
    STYLE_MAP: STYLE_MAP,
    MOOD_MAP: MOOD_MAP,
    TAG_MAP: TAG_MAP,
    SOCIAL_COLORS: SOCIAL_COLORS
};

KESEMPATAN.VisualConfig = VisualConfig;
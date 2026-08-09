/* ============================================================
   interactive/forum/for-config.js
   KONFIGURASI FORUM 55 AGEN — CONSTANTS SAJA
   ============================================================ */
    // 1. KONFIGURASI
    // ============================================================
    const FOR_CONFIG = {
        STORAGE_KEY: 'kes_chat_history_v25',
        THEME_KEY: 'kes_chat_theme',
        PREF_KEY: 'kes_chat_preferences',
        FEEDBACK_KEY: 'kes_chat_feedback',
        CACHE_KEY: 'kes_chat_cache_v25',
        MAX_HISTORY: 100,
        MAX_CACHE: 100,
        CACHE_TTL: 300000,
        STREAM_SPEED: 15,
        VOICE_LANG: 'id-ID',
        CONTEXT_WINDOW: 6,
        SEARCH_THRESHOLD: 0.1,
        MAX_RESULTS: 7,
        TOP_K_MEMORY: 5,
        DB_LIMIT: 3,
        EMOJIS: ['😊', '😂', '❤️', '🔥', '👍', '👏', '💪', '🎉', '✨', '🌟', '💡', '🤔', '😎', '🥳', '💯', '🚀', '🎯', '💎', '🌈', '⭐'],
        REACTIONS: ['❤️', '👍', '😂', '🎉', '🔥']
    };

    // ============================================================
    // 2. STATE (independen dari modul chat lain)

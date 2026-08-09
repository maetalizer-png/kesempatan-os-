/* ============================================================
   interactive/chat-agent/cag-config.js
   KONFIGURASI CHAT AGENT — CONSTANTS SAJA
   ============================================================ */
    // 1. KONFIGURASI
    // ============================================================
export const CAG_CONFIG = {
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

    // Prompt sistem dasar dipakai CAG_sendChatToAgent. (Sempat hilang saat
    // pemecahan chat.js — itulah akar penyebab Chat Agen tidak membalas
    // sama sekali.)
export const CAG_PROMPT_SAPAN = 'Kamu adalah asisten AI KESEMPATAN OS.\n\nCARA MENJAWAB:\n1. Kalau DATA di bawah relevan dengan pertanyaan, JADIKAN itu rujukan utama jawabanmu dan jangan mengarang angka/fakta yang seharusnya berasal dari DATA tapi tidak ada di sana.\n2. Kalau pertanyaan bersifat UMUM dan tidak tercakup DATA di bawah, JAWAB TETAP dari pengetahuan umummu sendiri secara akurat dan lengkap — JANGAN menolak atau bilang "saya tidak tahu" hanya karena DATA di bawah kosong atau tidak relevan.\n3. Kalau kamu benar-benar tidak yakin atau tidak tahu jawabannya (bukan sekadar karena DATA kosong), katakan dengan jujur bahwa kamu tidak yakin — jangan mengarang.\n4. Jawaban harus jelas, terstruktur, dan langsung ke poin — hindari jawaban generik yang tidak menjawab pertanyaan spesifik user.\n\nDATA YANG TERSEDIA (rujukan tambahan, BUKAN satu-satunya sumber jawaban):\n';

    // ============================================================

/* ============================================================
   interactive/chat-ai/cai-config.js
   KONFIGURASI CHAT AI — CONSTANTS & POLA DETEKSI SAJA
   Dimuat oleh lazy loader interactive/chat-ai/cai-chat-ai.js
   ============================================================ */

    // ============================================================
    // 1. KONFIGURASI
    // ============================================================
export const CAI_CONFIG = {
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
        // CATATAN: array ini SENGAJA tetap berisi emoji (dikecualikan dari
        // pembersihan emoji proyek) — ini DATA untuk widget emoji-picker
        // & reaction-picker; mengosongkannya membuat semua tombol picker
        // jadi kosong/tak terlihat (bukan cuma kosmetik, tapi merusak fitur).
        EMOJIS: ['😊', '😂', '❤️', '🔥', '👍', '👏', '💪', '🎉', '✨', '🌟', '💡', '🤔', '😎', '🥳', '💯', '🚀', '🎯', '💎', '🌈', '⭐'],
        REACTIONS: ['❤️', '👍', '😂', '🎉', '🔥']
    };

export const CAI_PROMPT_SAPAN = 'Kamu adalah asisten AI KESEMPATAN OS.\n\nCARA MENJAWAB:\n1. Kalau DATA di bawah relevan dengan pertanyaan, JADIKAN itu rujukan utama jawabanmu dan jangan mengarang angka/fakta yang seharusnya berasal dari DATA tapi tidak ada di sana.\n2. Kalau pertanyaan bersifat UMUM dan tidak tercakup DATA di bawah, JAWAB TETAP dari pengetahuan umummu sendiri secara akurat dan lengkap — JANGAN menolak atau bilang "saya tidak tahu" hanya karena DATA di bawah kosong atau tidak relevan.\n3. Kalau kamu benar-benar tidak yakin atau tidak tahu jawabannya (bukan sekadar karena DATA kosong), katakan dengan jujur bahwa kamu tidak yakin — jangan mengarang.\n4. Jawaban harus jelas, terstruktur, dan langsung ke poin — hindari jawaban generik yang tidak menjawab pertanyaan spesifik user.\n\nDATA YANG TERSEDIA (rujukan tambahan, BUKAN satu-satunya sumber jawaban):\n';

    // Pola deteksi sapaan & basa-basi "apa kabar" — dipakai CAI_detectGreetingIntent,
    // CAI_extractGreetingWord, CAI_detectKabarIntent. (Konstanta ini sempat hilang saat
    // pemecahan chat.js — itulah akar penyebab Chat AI tidak membalas sama sekali.)
export const CAI_GREETING_PATTERNS = /^(hai+|halo+|hallo+|hi+|hey+|hola|assalamualaikum|salam|selamat\s*(pagi|siang|sore|malam|datang)?|met\s*(pagi|siang|sore|malam)|sugeng\s*(enjing|siang|sonten)?|wilujeng\s*(enjing|sonten)?|horas|rahayu|om\s*swastiastu|selamat\s*(lebaran|idul\s*fitri|natal|nyepi|waisak|galungan|imlek|tahun\s*baru)|met\s*lebaran|gong\s*xi\s*fa\s*cai|isra\s*mi'?raj)[\s!.,]*$/i;
export const CAI_KABAR_PATTERNS = /\b(apa\s*kabar|gimana\s*kabar(nya|mu)?|bagaimana\s*kabar(nya|mu)?|kabar\s*(baik|nya)\??|how\s*are\s*you|apakabar)\b/i;

    // Deteksi gaya bicara sederhana — dipakai untuk memilih mood balasan
    // "kabar" yang senada dengan cara user bicara (santai vs formal),
    // supaya jawaban terasa lebih nyambung, bukan acak.
export const CAI_CASUAL_STYLE_HINTS = /\b(gue|gw|lu|lo|elo|kamu|km|gimana|gmn|nih|dong|banget|bgt|santai|santuy|ngobrol|yaudah|udah|gak|nggak|ga\b)\b/i;
export const CAI_FORMAL_STYLE_HINTS = /\b(anda|bapak|ibu|mohon|silakan|terima\s*kasih|apakah|dapatkah|berkenan)\b/i;
export function CAI_detectSpeakingStyle(message) {
        if (!message) {
            return null;
        }
        const hasCasual = CAI_CASUAL_STYLE_HINTS.test(message);
        const hasFormal = CAI_FORMAL_STYLE_HINTS.test(message);
        if (hasCasual && !hasFormal) {
            return 'santai';
        }
        if (hasFormal && !hasCasual) {
            return 'formal';
        }
        return null;
    }

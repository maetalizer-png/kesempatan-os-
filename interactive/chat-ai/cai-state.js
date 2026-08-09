/* ============================================================
   interactive/chat-ai/cai-state.js
   STATE BERSAMA CHAT AI (independen dari modul chat lain)
   Diimpor oleh cai-data-engine.js, cai-ui-render.js, cai-core.js —
   semuanya membaca/menulis field pada objek CAI_State yang sama
   (bukan variabel top-level terpisah lagi, karena ES module tidak
   membagi scope top-level antar file seperti classic script dulu).

   Catatan: CAI_State.userPreferences/feedbackHistory di sini SENGAJA
   memakai nilai default kosong, bukan langsung memanggil
   CAI_loadPreferences()/CAI_loadFeedback() — kedua fungsi itu baru
   didefinisikan di ui-render.js. core.js (dimuat paling akhir) yang
   bertugas memuat nilai asli dari localStorage saat CAI_initChatAi()
   berjalan.
   ============================================================ */
export const CAI_State = {
    speechEnabled: true,
    currentUtterance: null,
    recognition: null,
    isListening: false,
    currentAbortController: null,
    darkMode: true,
    typingSoundEnabled: true,
    typingSoundContext: null,
    userPreferences: {},
    feedbackHistory: [],
    stylePreference: 'casual',
    languagePreference: 'id',
    conversationContext: [],
    queryCache: new Map(),
    isSendingToAI: false
};

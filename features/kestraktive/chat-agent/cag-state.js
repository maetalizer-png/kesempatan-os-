/* ============================================================
   interactive/chat-agent/cag-state.js
   STATE BERSAMA CHAT AGENT (independen dari modul chat lain)
   Diimpor oleh cag-data-engine.js, cag-ui-render.js, cag-core.js —
   semuanya membaca/menulis field pada objek CAG_State yang sama
   (bukan variabel top-level terpisah lagi, karena ES module tidak
   membagi scope top-level antar file seperti classic script dulu).

   Catatan: CAG_State.userPreferences pakai default kosong dulu —
   dihidupkan dengan nilai asli localStorage di core.js saat
   CAG_initChatAgent().
   ============================================================ */
export const CAG_State = {
    currentUtterance: null,
    recognition: null,
    isListening: false,
    currentAbortController: null,
    darkMode: true,
    typingSoundEnabled: true,
    typingSoundContext: null,
    queryCache: new Map(),
    speechEnabled: true,
    userPreferences: {},
    stylePreference: 'casual',
    languagePreference: 'id',
    isSendingToAgent: false
};

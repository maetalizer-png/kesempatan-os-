/* ============================================================
   interactive/forum/for-state.js
   STATE BERSAMA FORUM (independen dari modul chat lain)
   Diimpor oleh for-data-engine.js, for-ui-render.js, for-core.js —
   semuanya membaca/menulis field pada objek FOR_State yang sama
   (bukan variabel top-level terpisah lagi, karena ES module tidak
   membagi scope top-level antar file seperti classic script dulu).

   Catatan: FOR_State.userPreferences pakai default kosong — dihidupkan
   di core.js saat FOR_initForum().
   ============================================================ */
export const FOR_State = {
    currentUtterance: null,
    recognition: null,
    isListening: false,
    typingSoundEnabled: true,
    typingSoundContext: null,
    queryCache: new Map(),
    forumAbort: false,
    forumRunning: false,
    darkMode: true,
    currentAbortController: null,
    userPreferences: {},
    stylePreference: 'casual',
    languagePreference: 'id'
};

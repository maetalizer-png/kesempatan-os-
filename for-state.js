/* ============================================================
   interactive/forum/for-state.js
   STATE BERSAMA FORUM (independen dari modul chat lain)
   Catatan: FOR_userPreferences pakai default kosong — dihidupkan di
   core.js saat FOR_initForum().
   ============================================================ */
let FOR_currentUtterance = null;
let FOR_recognition = null;
let FOR_isListening = false;
let FOR_typingSoundEnabled = true;
let FOR_typingSoundContext = null;
let FOR_queryCache = new Map();
let FOR_forumAbort = false;
let FOR_forumRunning = false;
let FOR_darkMode = true;
let FOR_currentAbortController = null;
let FOR_userPreferences = {};
let FOR_stylePreference = 'casual';
let FOR_languagePreference = 'id';

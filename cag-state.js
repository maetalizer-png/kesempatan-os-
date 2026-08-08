/* ============================================================
   interactive/chat-agent/cag-state.js
   STATE BERSAMA CHAT AGENT (independen dari modul chat lain)
   Catatan: CAG_userPreferences pakai default kosong dulu — dihidupkan
   dengan nilai asli localStorage di core.js saat CAG_initChatAgent().
   ============================================================ */
let CAG_currentUtterance = null;
let CAG_recognition = null;
let CAG_isListening = false;
let CAG_currentAbortController = null;
let CAG_darkMode = true;
let CAG_typingSoundEnabled = true;
let CAG_typingSoundContext = null;
let CAG_queryCache = new Map();
let CAG_speechEnabled = true;
let CAG_userPreferences = {};
let CAG_stylePreference = 'casual';
let CAG_languagePreference = 'id';
let CAG_isSendingToAgent = false;

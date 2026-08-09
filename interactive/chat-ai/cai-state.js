/* ============================================================
   interactive/chat-ai/cai-state.js
   STATE BERSAMA CHAT AI (independen dari modul chat lain)
   Dimuat oleh lazy loader interactive/chat-ai/cai-chat-ai.js, SETELAH
   config.js dan SEBELUM data-engine.js/ui-render.js/core.js —
   variabel di sini dibagikan lewat scope global classic-script
   (pola yang sama seperti CAI_escapeHtml/showToast di js/utils.js).

   Catatan: CAI_userPreferences/CAI_feedbackHistory di sini SENGAJA memakai
   nilai default kosong, bukan langsung memanggil CAI_loadPreferences()/
   CAI_loadFeedback() — kedua fungsi itu baru didefinisikan di
   ui-render.js yang dimuat SETELAH file ini. core.js (dimuat
   paling akhir) yang bertugas memuat nilai asli dari localStorage
   saat CAI_initChatAi() berjalan.
   ============================================================ */
    let CAI_speechEnabled = true;
    let CAI_currentUtterance = null;
    let CAI_recognition = null;
    let CAI_isListening = false;
    let CAI_currentAbortController = null;
    let CAI_darkMode = true;
    let CAI_typingSoundEnabled = true;
    let CAI_typingSoundContext = null;
    let CAI_userPreferences = {};
    let CAI_feedbackHistory = [];
    let CAI_stylePreference = 'casual';
    let CAI_languagePreference = 'id';
    let CAI_conversationContext = [];
    let CAI_queryCache = new Map();
    let CAI_isSendingToAI = false;

/* ============================================================
   KESEMPATAN OS v18.5 — UI MAIN
   ✅ Inisialisasi UI, hubungkan renderer & handlers, expose ke window.Podcast.ui
   ============================================================ */

(function() {
    'use strict';

    if (window.Podcast && window.Podcast.ui) return;
    window.Podcast = window.Podcast || {};

    const core = window.Podcast.core;
    const renderer = window.Podcast.uiRenderer;
    const handlers = window.Podcast.uiHandlers;

    if (!core || !renderer || !handlers) {
        console.warn('[Podcast UI Main] Modul UI belum lengkap!');
        return;
    }

    // ========== INIT UI ==========
    function initUI() {
        // Setup keyboard shortcuts
        handlers.setupKeyboardShortcuts();

        // Render awal
        handlers.render();

        // Attach event handlers
        handlers.attachEvents();

        // Auto update jika ada aggregated
        if (window.lastAggregated) {
            setTimeout(function() {
                handlers.updateScript();
            }, 500);
        }
    }

    // ========== EKSPOR window.Podcast.ui (untuk main.js) ==========
    window.Podcast.ui = {
        render: handlers.render,
        updateScript: handlers.updateScript,
        updateScriptWithAI: handlers.updateScriptWithAI,
        playPodcast: handlers.playPodcast,
        stopPodcast: handlers.stopPodcast,
        togglePlay: handlers.togglePlay,
        exportAudio: handlers.exportAudio,
        downloadScript: handlers.downloadScript,
        sharePodcast: handlers.sharePodcast,
        previewVoice: handlers.previewVoice,
        toggleAutoSchedule: handlers.toggleAutoSchedule,
        toggleLiveStream: handlers.toggleLiveStream,
        toggleCollaborative: handlers.toggleCollaborative,
        applyTheme: handlers.applyTheme,
        setEmotion: handlers.setEmotion,
        applyVoice: handlers.applyVoice,
        skipTime: handlers.skipTime,
        setSpeed: handlers.setSpeed,
        addBookmark: handlers.addBookmark,
        jumpToBookmark: handlers.jumpToBookmark,
        togglePlayerMode: handlers.togglePlayerMode,
        loadHistoryItem: handlers.loadHistoryItem,
        jumpToChapter: handlers.jumpToChapter,
        generatePodcastText: handlers.generatePodcastText,
        showToast: renderer.showToast,
        sanitizeHtml: renderer.sanitizeHtml,
        cleanupEventListeners: renderer.cleanupEventListeners,
        initUI: initUI
    };

    // Auto init jika main.js belum memanggil
    // (main.js akan memanggil ui.render, tapi kita sediakan initUI untuk dipanggil manual)
})();
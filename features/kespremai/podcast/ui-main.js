import { uiRenderer as renderer } from './podcast-renderer.js';
import { uiHandlers as handlers } from './podcast-handlers.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

function initUI() {
    handlers.setupKeyboardShortcuts();
    handlers.render();
    handlers.attachEvents();

    if (window.lastAggregated) {
        setTimeout(function() {
            handlers.updateScript();
        }, 500);
    }
}

export const ui = {
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

KESEMPATAN.Podcast.ui = ui;
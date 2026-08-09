(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__VoiceCloneLoaderLoaded) return;
    window.__VoiceCloneLoaderLoaded = true;

const MODULES = [
'voice-ai/voice-config.js',
'voice-ai/voice-state.js',
'voice-ai/voice-core.js',
'voice-ai/voice-visualizer.js',
'voice-ai/voice-layout.js',
'voice-ai/voice-renderer.js',
'voice-ai/voice-events.js'
];

let loaded = 0;
const total = MODULES.length;
let hasError = false;

function loadNext() {
    if (loaded >= total) {
        if (!hasError && KESEMPATAN.VoiceRenderer && typeof KESEMPATAN.VoiceRenderer.render === 'function') {
            KESEMPATAN.VoiceRenderer.render();
        }
        return;
    }
    const src = MODULES[loaded];
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = function() { loaded++; loadNext(); };
    script.onerror = function() { hasError = true; loaded++; loadNext(); };
    document.head.appendChild(script);
}

KESEMPATAN.VoiceClone = {
    render: function() { if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render(); },
    init: function() { if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render(); },
    speak: function(t, a) { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.speak(t, a); },
    stopSpeaking: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.stopSpeaking(); },
    startListening: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.startListening(); },
    stopListening: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.stopListening(); },
    testVoice: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.testVoice(); },
    startRecording: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.startRecording(); },
    stopRecording: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.stopRecording(); },
    exportSettings: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.exportSettings(); },
    importSettings: function() { if (KESEMPATAN.VoiceCore) KESEMPATAN.VoiceCore.importSettings(); },
    toggleTheme: function() { if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.toggleTheme(); },
    getSettings: function() { return KESEMPATAN.VoiceState ? KESEMPATAN.VoiceState.getSettings() : {}; },
    getHistory: function() { return KESEMPATAN.VoiceState ? KESEMPATAN.VoiceState.getHistory() : []; },
    getFavorites: function() { return KESEMPATAN.VoiceState ? KESEMPATAN.VoiceState.getFavorites() : []; },
    getClones: function() { return KESEMPATAN.VoiceState ? KESEMPATAN.VoiceState.getClones() : []; }
};

loadNext();
})();

(function() {
'use strict';
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
        if (!hasError && window.VoiceCloneRenderer && typeof window.VoiceCloneRenderer.render === 'function') {
            window.VoiceCloneRenderer.render();
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

window.VoiceClone = {
    render: function() { if (window.VoiceCloneRenderer) window.VoiceCloneRenderer.render(); },
    init: function() { if (window.VoiceCloneRenderer) window.VoiceCloneRenderer.render(); },
    speak: function(t, a) { if (window.VoiceCloneCore) window.VoiceCloneCore.speak(t, a); },
    stopSpeaking: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.stopSpeaking(); },
    startListening: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.startListening(); },
    stopListening: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.stopListening(); },
    testVoice: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.testVoice(); },
    startRecording: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.startRecording(); },
    stopRecording: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.stopRecording(); },
    exportSettings: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.exportSettings(); },
    importSettings: function() { if (window.VoiceCloneCore) window.VoiceCloneCore.importSettings(); },
    toggleTheme: function() { if (window.VoiceCloneRenderer) window.VoiceCloneRenderer.toggleTheme(); },
    getSettings: function() { return window.VoiceCloneState ? window.VoiceCloneState.getSettings() : {}; },
    getHistory: function() { return window.VoiceCloneState ? window.VoiceCloneState.getHistory() : []; },
    getFavorites: function() { return window.VoiceCloneState ? window.VoiceCloneState.getFavorites() : []; },
    getClones: function() { return window.VoiceCloneState ? window.VoiceCloneState.getClones() : []; }
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VoiceClone = window.VoiceClone;

loadNext();
})();
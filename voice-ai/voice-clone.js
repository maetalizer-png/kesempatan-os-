import './voice-config.js';
import './voice-state.js';
import { VoiceCore } from './voice-core.js';
import './voice-visualizer.js';
import './voice-layout.js';
import { VoiceRenderer } from './voice-renderer.js';
import { VoiceState } from './voice-state.js';
import './voice-events.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

export const VoiceClone = {
    render: function() { VoiceRenderer.render(); },
    init: function() { VoiceRenderer.render(); },
    speak: function(t, a) { VoiceCore.speak(t, a); },
    stopSpeaking: function() { VoiceCore.stopSpeaking(); },
    startListening: function() { VoiceCore.startListening(); },
    stopListening: function() { VoiceCore.stopListening(); },
    testVoice: function() { VoiceCore.testVoice(); },
    startRecording: function() { VoiceCore.startRecording(); },
    stopRecording: function() { VoiceCore.stopRecording(); },
    exportSettings: function() { VoiceCore.exportSettings(); },
    importSettings: function() { VoiceCore.importSettings(); },
    toggleTheme: function() { VoiceRenderer.toggleTheme(); },
    getSettings: function() { return VoiceState.getSettings(); },
    getHistory: function() { return VoiceState.getHistory(); },
    getFavorites: function() { return VoiceState.getFavorites(); },
    getClones: function() { return VoiceState.getClones(); }
};
KESEMPATAN.VoiceClone = VoiceClone;

VoiceRenderer.render();

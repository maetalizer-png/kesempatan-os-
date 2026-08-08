(function() {
'use strict';
if (window.__VoiceCloneState) return;
window.__VoiceCloneState = true;

const config = window.VoiceCloneConfig;
const STORAGE_KEYS = config.STORAGE_KEYS;
const VOICE_CONFIG = config.VOICE_CONFIG;

let settings = Object.assign({}, VOICE_CONFIG.defaults);
let clones = [];
let activeCloneId = null;
let history = [];
let analytics = Object.assign({}, config.ANALYTICS_DEFAULTS);
let favorites = [];
let isListening = false;
let isSpeaking = false;
let recognition = null;
let bgAudio = null;
let audioContext = null;
let voicesLoaded = false;
let voiceLoadAttempts = 0;
let waveformCanvas = null;
let waveformCtx = null;
let waveformAnimation = null;
let isRecordingMP3 = false;
let mediaRecorderMP3 = null;
let audioChunksMP3 = [];
let speedPreset = 'normal';
let currentUtterance = null;
let audioPosition = 0;
let audioDuration = 0;
let podcastText = '';
let cloneMediaRecorder = null;
let cloneAudioChunks = [];
let isCloneRecording = false;

const loadSettings = function() {
try {
const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
if (saved) settings = Object.assign({}, VOICE_CONFIG.defaults, JSON.parse(saved));
const cloneData = localStorage.getItem(STORAGE_KEYS.CLONES);
if (cloneData) clones = JSON.parse(cloneData);
const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLONE);
if (active) {
const exists = clones.find(function(c) { return c.id == active; });
if (exists) activeCloneId = active;
}
const historyData = localStorage.getItem(STORAGE_KEYS.HISTORY);
if (historyData) history = JSON.parse(historyData);
const analyticsData = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
if (analyticsData) analytics = Object.assign({}, config.ANALYTICS_DEFAULTS, JSON.parse(analyticsData));
const favData = localStorage.getItem(STORAGE_KEYS.FAVORITES);
if (favData) favorites = JSON.parse(favData);
} catch(e) {}
return true;
};

const saveSettings = function() {
try {
localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
localStorage.setItem(STORAGE_KEYS.CLONES, JSON.stringify(clones));
if (activeCloneId) localStorage.setItem(STORAGE_KEYS.ACTIVE_CLONE, activeCloneId);
else localStorage.removeItem(STORAGE_KEYS.ACTIVE_CLONE);
localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
} catch(e) {}
};

window.VoiceCloneState = {
getSettings: function() { return settings; },
getClones: function() { return clones; },
getActiveCloneId: function() { return activeCloneId; },
getHistory: function() { return history; },
getAnalytics: function() { return analytics; },
getFavorites: function() { return favorites; },
isListening: function() { return isListening; },
isSpeaking: function() { return isSpeaking; },
getRecognition: function() { return recognition; },
getBgAudio: function() { return bgAudio; },
getAudioContext: function() { return audioContext; },
isVoicesLoaded: function() { return voicesLoaded; },
getVoiceLoadAttempts: function() { return voiceLoadAttempts; },
getWaveformCanvas: function() { return waveformCanvas; },
getWaveformCtx: function() { return waveformCtx; },
getWaveformAnimation: function() { return waveformAnimation; },
isRecordingMP3: function() { return isRecordingMP3; },
getMediaRecorderMP3: function() { return mediaRecorderMP3; },
getAudioChunksMP3: function() { return audioChunksMP3; },
getSpeedPreset: function() { return speedPreset; },
getCurrentUtterance: function() { return currentUtterance; },
getAudioPosition: function() { return audioPosition; },
getAudioDuration: function() { return audioDuration; },
getPodcastText: function() { return podcastText; },
isCloneRecording: function() { return isCloneRecording; },
getCloneMediaRecorder: function() { return cloneMediaRecorder; },
getCloneAudioChunks: function() { return cloneAudioChunks; },
setSettings: function(val) { settings = val; },
setClones: function(val) { clones = val; },
setActiveCloneId: function(val) { activeCloneId = val; },
setHistory: function(val) { history = val; },
setAnalytics: function(val) { analytics = val; },
setFavorites: function(val) { favorites = val; },
setIsListening: function(val) { isListening = val; },
setIsSpeaking: function(val) { isSpeaking = val; },
setRecognition: function(val) { recognition = val; },
setBgAudio: function(val) { bgAudio = val; },
setAudioContext: function(val) { audioContext = val; },
setVoicesLoaded: function(val) { voicesLoaded = val; },
setVoiceLoadAttempts: function(val) { voiceLoadAttempts = val; },
setWaveformCanvas: function(val) { waveformCanvas = val; },
setWaveformCtx: function(val) { waveformCtx = val; },
setWaveformAnimation: function(val) { waveformAnimation = val; },
setIsRecordingMP3: function(val) { isRecordingMP3 = val; },
setMediaRecorderMP3: function(val) { mediaRecorderMP3 = val; },
setAudioChunksMP3: function(val) { audioChunksMP3 = val; },
setSpeedPreset: function(val) { speedPreset = val; },
setCurrentUtterance: function(val) { currentUtterance = val; },
setAudioPosition: function(val) { audioPosition = val; },
setAudioDuration: function(val) { audioDuration = val; },
setPodcastText: function(val) { podcastText = val; },
setIsCloneRecording: function(val) { isCloneRecording = val; },
setCloneMediaRecorder: function(val) { cloneMediaRecorder = val; },
setCloneAudioChunks: function(val) { cloneAudioChunks = val; },
load: loadSettings,
save: saveSettings
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VoiceState = window.VoiceCloneState;
})();
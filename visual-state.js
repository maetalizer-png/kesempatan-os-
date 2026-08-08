(function() {
'use strict';
if (window.__VisualAIState) return;
window.__VisualAIState = true;

const config = window.VisualAIConfig || {};
const STORAGE_KEYS = config.STORAGE_KEYS || {};
const DEFAULT = config.DEFAULT_VALUES || {};

const SafeStorage = {
    get: function(key, fallback) {
        fallback = (fallback === undefined) ? null : fallback;
        try { return localStorage.getItem(key) || fallback; }
        catch (e) { return fallback; }
    },
    set: function(key, value) {
        try { localStorage.setItem(key, value); return true; }
        catch (e) { return false; }
    },
    getJSON: function(key, fallback) {
        fallback = (fallback === undefined) ? null : fallback;
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
    },
    setJSON: function(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (e) { return false; }
    }
};

function obfuscate(value) {
    if (!value) return '';
    try { return btoa(encodeURIComponent(value)); }
    catch (e) { return ''; }
}
function deobfuscate(value) {
    if (!value) return '';
    try { return decodeURIComponent(atob(value)); }
    catch (e) { return ''; }
}

let history = SafeStorage.getJSON(STORAGE_KEYS.HISTORY, []);
let apiMode = SafeStorage.get(STORAGE_KEYS.API_MODE, DEFAULT.API_MODE);
let googleVisionKey = deobfuscate(SafeStorage.get(STORAGE_KEYS.GOOGLE_KEY, ''));
let clarifaiKey = deobfuscate(SafeStorage.get(STORAGE_KEYS.CLARIFAI_KEY, ''));
let useAIInternal = SafeStorage.get(STORAGE_KEYS.USE_AI, 'true') === 'true';
let darkMode = SafeStorage.get(STORAGE_KEYS.DARK_MODE, 'true') === 'true';
let voiceEnabled = SafeStorage.get(STORAGE_KEYS.VOICE, 'true') === 'true';
let isGenerating = false;
let currentResult = null;
let selectedFiles = [];
let currentFeatures = null;
let avatarInstance = null;
let progressSphere = null;
let backgroundInstance = null;
let tagCloudInstance = null;

function saveHistory() { SafeStorage.setJSON(STORAGE_KEYS.HISTORY, history); }
function addToHistory(result) {
    history.unshift({
        id: result.id || Date.now(),
        name: result.name,
        role: result.role,
        systemPrompt: result.systemPrompt,
        analysis: result.analysis || '',
        description: result.description || '',
        createdAt: result.createdAt || new Date().toISOString(),
        rating: result.rating || '',
        tags: result.tags || [],
        features: result.features || {}
    });
    if (history.length > (DEFAULT.MAX_HISTORY || 100)) history.pop();
    saveHistory();
}

const VisualAIState = {
    getHistory: function() { return history; },
    getApiMode: function() { return apiMode; },
    getGoogleKey: function() { return googleVisionKey; },
    getClarifaiKey: function() { return clarifaiKey; },
    getUseAI: function() { return useAIInternal; },
    getDarkMode: function() { return darkMode; },
    getVoice: function() { return voiceEnabled; },
    isGenerating: function() { return isGenerating; },
    getCurrentResult: function() { return currentResult; },
    getSelectedFiles: function() { return selectedFiles; },
    getCurrentFeatures: function() { return currentFeatures; },
    getAvatarInstance: function() { return avatarInstance; },
    getProgressSphere: function() { return progressSphere; },
    getBackgroundInstance: function() { return backgroundInstance; },
    getTagCloudInstance: function() { return tagCloudInstance; },
    setHistory: function(val) { history = val; saveHistory(); },
    setApiMode: function(val) { apiMode = val; SafeStorage.set(STORAGE_KEYS.API_MODE, val); },
    setGoogleKey: function(val) { googleVisionKey = val; SafeStorage.set(STORAGE_KEYS.GOOGLE_KEY, obfuscate(val)); },
    setClarifaiKey: function(val) { clarifaiKey = val; SafeStorage.set(STORAGE_KEYS.CLARIFAI_KEY, obfuscate(val)); },
    setUseAI: function(val) { useAIInternal = val; SafeStorage.set(STORAGE_KEYS.USE_AI, val); },
    setDarkMode: function(val) { darkMode = val; SafeStorage.set(STORAGE_KEYS.DARK_MODE, val); },
    setVoice: function(val) { voiceEnabled = val; SafeStorage.set(STORAGE_KEYS.VOICE, val); },
    setIsGenerating: function(val) { isGenerating = val; },
    setCurrentResult: function(val) { currentResult = val; },
    setSelectedFiles: function(val) { selectedFiles = val; },
    setCurrentFeatures: function(val) { currentFeatures = val; },
    setAvatarInstance: function(val) { avatarInstance = val; },
    setProgressSphere: function(val) { progressSphere = val; },
    setBackgroundInstance: function(val) { backgroundInstance = val; },
    setTagCloudInstance: function(val) { tagCloudInstance = val; },
    addHistory: addToHistory,
    saveHistory: saveHistory,
    clearHistory: function() { history = []; saveHistory(); },
    storage: SafeStorage
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VisualState = VisualAIState;
window.VisualAIState = VisualAIState;
})();
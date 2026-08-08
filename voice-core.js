(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__VoiceCloneCore) return;
    window.__VoiceCloneCore = true;

const state = KESEMPATAN.VoiceState;
const config = KESEMPATAN.VoiceConfig;
const showToast = window.Utils?.showToast || function() {};
const VOICE_CONFIG = config.VOICE_CONFIG;

let availableVoices = [];
let voicesLoaded = false;

function loadVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    const load = function() { availableVoices = speechSynthesis.getVoices(); voicesLoaded = true; };
    if (speechSynthesis.getVoices().length > 0) load();
    else speechSynthesis.addEventListener('voiceschanged', load);
}
loadVoices();

function getBestVoice(cfg) {
    if (!voicesLoaded || availableVoices.length === 0) return null;
    const targetLang = 'id-ID';
    const targetGender = cfg.voiceName;
    let voice = availableVoices.find(function(v) {
        return v.lang === targetLang &&
            (targetGender === 'female' ? v.name.toLowerCase().includes('female') :
             targetGender === 'male' ? v.name.toLowerCase().includes('male') : true);
    });
    if (!voice) voice = availableVoices.find(function(v) { return v.lang === targetLang; });
    if (!voice) voice = availableVoices[0];
    return voice;
}

function speak(text, agentName) {
    if (!text || text.length === 0) return;
    if (typeof speechSynthesis === 'undefined') return;
    const speechEnabled = localStorage.getItem('kes_speech_enabled') !== 'false';
    if (!speechEnabled) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const cfg = (agentName && VOICE_CONFIG.presets[agentName]) || VOICE_CONFIG.presets.professional;
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/ /g, ' ').substring(0, 800);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = cfg.rate;
    utterance.pitch = cfg.pitch;
    const voice = getBestVoice(cfg);
    if (voice) utterance.voice = voice;
    if (cfg.effect === 'robot') utterance.rate = 1.2;
    if (cfg.effect === 'chipmunk') { utterance.pitch = 1.8; utterance.rate = 1.3; }
    if (cfg.effect === 'demon') { utterance.pitch = 0.4; utterance.rate = 0.7; }
    speechSynthesis.speak(utterance);
}

function stopSpeaking() { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); }

function startRecording() {
    if (state.isCloneRecording()) return;
    if (!navigator.mediaDevices) { showToast('Browser tidak mendukung rekam', 'error'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        const rec = new MediaRecorder(stream);
        const chunks = [];
        rec.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };
        rec.onstop = function() {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = function(ev) {
                const clones = state.getClones();
                clones.unshift({ id: Date.now(), name: 'Clone ' + (clones.length + 1), audioBlob: ev.target.result, createdAt: Date.now() });
                if (clones.length > 5) clones.pop();
                state.setClones(clones);
                state.save();
                if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render();
                showToast('Voice clone tersimpan!', 'success');
            };
            reader.readAsDataURL(blob);
            stream.getTracks().forEach(function(t) { t.stop(); });
        };
        rec.start();
        state.setIsCloneRecording(true);
        state.setCloneMediaRecorder(rec);
        showToast('Merekam... klik STOP untuk selesai', 'info');
    }).catch(function() { showToast('Gagal akses mikrofon', 'error'); });
}

function stopRecording() {
    const rec = state.getCloneMediaRecorder();
    if (rec && state.isCloneRecording()) { rec.stop(); state.setIsCloneRecording(false); }
}

function playClone(id) {
    const clone = state.getClones().find(function(c) { return String(c.id) === String(id); });
    if (!clone || !clone.audioBlob) return;
    const audio = new Audio(clone.audioBlob);
    audio.play();
}

function useClone(id) { state.setActiveCloneId(id); state.save(); if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render(); showToast('Clone diaktifkan', 'success'); }

function deleteClone(id) {
    state.setClones(state.getClones().filter(function(c) { return String(c.id) !== String(id); }));
    if (String(state.getActiveCloneId()) === String(id)) state.setActiveCloneId(null);
    state.save();
    if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render();
    showToast('Clone dihapus', 'success');
}

function clearActiveClone() { state.setActiveCloneId(null); state.save(); if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render(); }

function toggleFavorite(id) {
    const favs = state.getFavorites();
    const idx = favs.indexOf(id);
    if (idx > -1) favs.splice(idx, 1); else favs.push(id);
    state.setFavorites(favs);
    state.save();
    if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render();
}

function isFavorite(id) { return state.getFavorites().indexOf(id) !== -1; }

function applySpeedPreset(id) {
    const sp = VOICE_CONFIG.speedPresets[id];
    if (!sp) return;
    const settings = state.getSettings();
    settings.rate = sp.rate;
    state.setSettings(settings);
    state.setSpeedPreset(id);
    state.save();
    if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render();
}

function exportSettings() {
    const data = { settings: state.getSettings(), clones: state.getClones(), favorites: state.getFavorites() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kes_voice_' + Date.now() + '.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('Settings diekspor!', 'success');
}

function importSettings(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.settings) state.setSettings(data.settings);
            if (data.clones) state.setClones(data.clones);
            if (data.favorites) state.setFavorites(data.favorites);
            state.save();
            if (KESEMPATAN.VoiceRenderer) KESEMPATAN.VoiceRenderer.render();
            showToast('Settings diimpor!', 'success');
        } catch (err) { showToast('Gagal impor: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
}

function exportVoiceMP3() { showToast('Gunakan perekam sistem untuk MP3', 'info'); }

function shareVoice(text) {
    if (navigator.share) navigator.share({ title: 'KESEMPATAN OS', text: text }).catch(function() {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text);
}

function testVoice() { speak('Halo! Ini adalah test suara KESEMPATAN OS.', 'professional'); }

const AIInternal = (function() {
    function getApiKey() {
        const input = document.getElementById('apiKeyInput');
        if (input && input.value && input.value.trim().length > 10) return input.value.trim();
        if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) return window.CONFIG.API_KEYS.openrouter;
        return null;
    }
    function isOfflineMode() {
        if (window.OfflineMode && typeof window.OfflineMode.isOnline === 'function') return !window.OfflineMode.isOnline();
        return false;
    }
    async function callAI(prompt) {
        const apiKey = getApiKey();
        if (!apiKey || isOfflineMode()) return null;
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'deepseek/deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 800, temperature: 0.7 })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) return data.choices[0].message.content;
            return null;
        } catch (e) { console.warn('[VoiceClone] callAI failed:', e.message); return null; }
    }
    async function analyzeImage(file) { return { style: 'modern', mood: 'enerjik' }; }
    async function generateAgent(features) {
        const ai = await callAI('Buat agen AI dari gambar gaya ' + features.style + '. Output JSON {name, role, systemPrompt}.');
        if (ai) {
            try {
                const parsed = JSON.parse(ai);
                if (parsed.name) return parsed;
            } catch (e) { console.warn('[VoiceClone] generateAgent parse failed:', e.message); }
        }
        return { name: 'Visual Agent ' + Date.now().toString().slice(-4), role: 'Visual Analyst', systemPrompt: 'Anda agen AI visual.' };
    }
    async function generateTags(features) { return ['#' + (features.style || 'Visual'), '#Kreatif', '#AI']; }
    async function generateDescription(features) { return 'Agen AI dengan gaya ' + features.style + '.'; }
    async function detectObjects(file) { return [{ label: 'Main Object', confidence: 85, x: 20, y: 20, width: 60, height: 60 }]; }
    async function getEvolutionSuggestion(current) { return { roleImprovement: current.role, promptImprovement: '' }; }
    return { getApiKey: getApiKey, isOfflineMode: isOfflineMode, callAI: callAI, analyzeImage: analyzeImage, generateAgent: generateAgent, generateTags: generateTags, generateDescription: generateDescription, detectObjects: detectObjects, getEvolutionSuggestion: getEvolutionSuggestion };
})();

let recognition = null;
function startListening() {
    const SpeechRecognitionApi = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognitionApi) { showToast('Browser tidak mendukung voice input', 'error'); return; }
    recognition = new SpeechRecognitionApi();
    recognition.lang = 'id-ID';
    recognition.onresult = function(e) {
        const text = e.results[0][0].transcript;
        showToast('Anda: ' + text, 'info');
    };
    recognition.start();
}
function stopListening() {
    if (recognition) {
        try { recognition.stop(); } catch (e) { console.warn('[VoiceClone] stopListening failed:', e.message); }
    }
}

KESEMPATAN.VoiceCore = {
    speak: speak, stopSpeaking: stopSpeaking,
    startRecording: startRecording, stopRecording: stopRecording,
    playClone: playClone, useClone: useClone, deleteClone: deleteClone, clearActiveClone: clearActiveClone,
    toggleFavorite: toggleFavorite, isFavorite: isFavorite,
    exportSettings: exportSettings, importSettings: importSettings,
    exportVoiceMP3: exportVoiceMP3, shareVoice: shareVoice, testVoice: testVoice,
    applySpeedPreset: applySpeedPreset,
    getApiKey: AIInternal.getApiKey, isOfflineMode: AIInternal.isOfflineMode,
    callAI: AIInternal.callAI, analyzeImage: AIInternal.analyzeImage,
    generateAgent: AIInternal.generateAgent, generateTags: AIInternal.generateTags,
    generateDescription: AIInternal.generateDescription, detectObjects: AIInternal.detectObjects,
    getEvolutionSuggestion: AIInternal.getEvolutionSuggestion,
    startListening: startListening, stopListening: stopListening
};
})();

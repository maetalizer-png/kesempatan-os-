(function() {
'use strict';
if (window.__WorkersAIState) return;
window.__WorkersAIState = true;

const config = window.WorkersAIConfig;
let workers = [];
let workerStats = {};
let logs = [];
let voiceSettings = { rate: 0.9, pitch: 1.2, lang: 'id-ID' };

function loadWorkers() {
    const saved = localStorage.getItem('kes_ai_workers');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            workers = config.AI_WORKERS_LIST.map(function(w) {
                const savedW = parsed.find(function(sw) { return sw.id === w.id; });
                return savedW ? Object.assign({}, w, savedW) : Object.assign({}, w);
            });
        } catch (e) {
            workers = config.AI_WORKERS_LIST.slice();
        }
    } else {
        workers = config.AI_WORKERS_LIST.slice();
    }
    return workers;
}
function saveWorkers() { localStorage.setItem('kes_ai_workers', JSON.stringify(workers)); }

function loadStats() {
    try { workerStats = JSON.parse(localStorage.getItem('kes_worker_stats')) || {}; }
    catch (e) { workerStats = {}; }
    return workerStats;
}
function saveStats() { localStorage.setItem('kes_worker_stats', JSON.stringify(workerStats)); }

function loadLogs() {
    try { logs = JSON.parse(localStorage.getItem('kes_ai_workers_logs')) || []; }
    catch (e) { logs = []; }
    return logs;
}
function saveLogs() { localStorage.setItem('kes_ai_workers_logs', JSON.stringify(logs.slice(0, 200))); }

function loadVoiceSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('kes_voice_settings'));
        if (saved) voiceSettings = Object.assign({}, voiceSettings, saved);
    } catch (e) {}
    return voiceSettings;
}
function saveVoiceSettings() { localStorage.setItem('kes_voice_settings', JSON.stringify(voiceSettings)); }

const WorkersAIState = {
    getWorkers: function() { return workers; },
    getStats: function() { return workerStats; },
    getLogs: function() { return logs; },
    getVoiceSettings: function() { return voiceSettings; },
    setWorkers: function(val) { workers = val; },
    setStats: function(val) { workerStats = val; },
    setLogs: function(val) { logs = val; },
    setVoiceSettings: function(val) { voiceSettings = val; },
    loadWorkers: loadWorkers,
    saveWorkers: saveWorkers,
    loadStats: loadStats,
    saveStats: saveStats,
    loadLogs: loadLogs,
    saveLogs: saveLogs,
    loadVoiceSettings: loadVoiceSettings,
    saveVoiceSettings: saveVoiceSettings
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.WorkersState = WorkersAIState;
window.WorkersAIState = WorkersAIState;
})();
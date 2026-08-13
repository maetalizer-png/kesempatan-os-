import { WorkersConfig } from './workers-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const config = WorkersConfig;
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
    if (window.KESEMPATAN?.KesDatabase?.migrateLegacySnapshotOnce) {
        window.KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce('worker_stats', 'kes_worker_stats');
    }
    return workerStats;
}
function saveStats() {
    localStorage.setItem('kes_worker_stats', JSON.stringify(workerStats));
    // Durable backup in IndexedDB — localStorage stays the source of truth.
    if (window.KESEMPATAN?.KesDatabase?.mirrorSnapshot) {
        window.KESEMPATAN.KesDatabase.mirrorSnapshot('worker_stats', workerStats);
    }
}

function loadLogs() {
    try { logs = JSON.parse(localStorage.getItem('kes_ai_workers_logs')) || []; }
    catch (e) { logs = []; }
    if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
        window.KESEMPATAN.KesDatabase.migrateArrayOnce('worker_logs', logs);
    }
    return logs;
}
function saveLogs() { localStorage.setItem('kes_ai_workers_logs', JSON.stringify(logs.slice(0, 200))); }

function loadVoiceSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('kes_voice_settings'));
        if (saved) voiceSettings = Object.assign({}, voiceSettings, saved);
    } catch (e) { console.warn('[Workers] Load voice settings failed:', e.message); }
    return voiceSettings;
}
function saveVoiceSettings() { localStorage.setItem('kes_voice_settings', JSON.stringify(voiceSettings)); }

export const WorkersState = {
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

KESEMPATAN.WorkersState = WorkersState;
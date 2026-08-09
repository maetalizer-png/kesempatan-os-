const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

class EventEmitter {
    constructor() {
        this._events = {};
    }
    on(event, listener) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(listener);
        return () => this.off(event, listener);
    }
    off(event, listener) {
        if (!this._events[event]) return;
        this._events[event] = this._events[event].filter(function(l) { return l !== listener; });
    }
    emit(event, data) {
        if (!this._events[event]) return;
        this._events[event].forEach(function(listener) { listener(data); });
    }
}

const emitter = new EventEmitter();

// ========== STATE VERSION ==========
const STATE_VERSION = 3; // dinaikkan dari 2

// ========== STATE ==========
const state = {
    // --- VOICE & AUDIO ---
    currentVoiceType: "professional_male",
    currentAgentVoice: null,
    useAgentVoice: false,
    currentRate: 0.9,
    currentLang: 'id',
    currentEmotion: 'neutral',
    currentBgMusic: "off",
    bgAudio: null,

    // --- TEXT ---
    podcastText: "",
    originalPodcastText: "",

    // --- PLAYBACK ---
    isPlaying: false,
    isDebatePlaying: false,
    currentUtterance: null,
    audioPosition: 0,
    audioDuration: 0,
    isSeeking: false,
    audioVisualizerInterval: null,

    // --- MODE ---
    speakerMode: 'single',
    debateAgents: ['RahmadRaharjo', 'Manager', 'Analyst'],

    // --- VOICE GENDER PER DISCUSSION CHARACTER ---
    discussionGenders: { Host: 'pria', Expert: 'wanita', Storyteller: 'pria', Skeptic: 'wanita' },

    // --- INTERNAL AI SOURCE INTEGRATION STATUS (World/Memory/Database) ---
    aiSourcesUsed: { world: 0, memory: 0, database: 0, internal: false },
    lastGenerateDurationMs: 0,
    lastExportAction: null, // { type: 'naskah'|'export'|'subtitle'|'shownotes', time: timestamp }

    // --- HISTORY & BOOKMARKS ---
    podcastHistory: [],
    bookmarks: [],
    autoScheduleActive: false,
    scheduleInterval: null,

    // --- UI ---
    currentPlayerMode: 'simple',
    currentTheme: 'dark',

    // --- STREAMING ---
    isLiveStreaming: false,

    // --- ANALYTICS ---
    analytics: {
        totalPlays: 0,
        totalDuration: 0,
        topics: {},
        voices: {},
        lastListen: null
    },

    // --- AI CONTEXT ---
    aiContext: null,
    currentRecommendations: [],
    currentChapters: [],

    // --- FLAGS ---
    isGenerating: false,

    // ========== FIELD BARU ==========
    userName: "Pengguna",
    favoriteVoices: [],
    lastGeneratedTopic: "",
    lastGeneratedDate: null,
    preferences: {
        autoSave: true,
        defaultVoice: "professional_male",
        defaultLang: "id",
        defaultTheme: "dark"
    },

    // ========== FIELD INTEGRASI EKSTERNAL ==========
    _memoryInstance: null,
    _databaseInstance: null,
    lastExternalFetch: null
};

// ========== HISTORY ==========
function loadHistory() {
    try {
        const saved = localStorage.getItem('kes_podcast_state_v19');
        if (saved) {
            const parsed = JSON.parse(saved);
            const savedVersion = parsed._version || 0;

            let migrated = parsed;
            if (savedVersion < STATE_VERSION) {
                migrated = migrateState(parsed, savedVersion);
            }

            Object.keys(state).forEach(function(key) {
                if (migrated[key] !== undefined && key !== 'bgAudio' && key !== 'currentUtterance') {
                    state[key] = migrated[key];
                }
            });
        }

        const legacyHistory = localStorage.getItem('kes_podcast_history_v18');
        if (legacyHistory && !saved) {
            try {
                const old = JSON.parse(legacyHistory);
                if (Array.isArray(old)) {
                    state.podcastHistory = old;
                }
            } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
        }

        const analyticsSaved = localStorage.getItem('kes_podcast_analytics_v18');
        if (analyticsSaved) {
            try {
                const parsed = JSON.parse(analyticsSaved);
                Object.assign(state.analytics, parsed);
            } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
        }

        const themeSaved = localStorage.getItem('kes_podcast_theme_v18');
        if (themeSaved && KESEMPATAN.Podcast.config && KESEMPATAN.Podcast.config.THEMES[themeSaved]) {
            state.currentTheme = themeSaved;
        }

        const emotionSaved = localStorage.getItem('kes_podcast_emotion_v18');
        if (emotionSaved) {
            state.currentEmotion = emotionSaved;
        }

    } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }

    // One-time durable backup of whatever episode history already
    // exists (localStorage remains the source of truth either way).
    if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
        window.KESEMPATAN.KesDatabase.migrateArrayOnce('podcast_history', state.podcastHistory);
    }
}

// ========== MIGRASI DATA ==========
function migrateState(oldData, oldVersion) {
    let data = { ...oldData };
    data._version = STATE_VERSION;

    if (oldVersion < 1) {
        data.userName = data.userName || 'Pengguna';
        data.favoriteVoices = data.favoriteVoices || [];
        data.lastGeneratedTopic = data.lastGeneratedTopic || '';
        data.lastGeneratedDate = data.lastGeneratedDate || null;
    }

    if (oldVersion < 2) {
        data.preferences = data.preferences || {
            autoSave: true,
            defaultVoice: data.currentVoiceType || 'professional_male',
            defaultLang: data.currentLang || 'id',
            defaultTheme: data.currentTheme || 'dark'
        };
    }

    // Migrasi ke v3: tambahkan field integrasi
    if (oldVersion < 3) {
        data._memoryInstance = null;
        data._databaseInstance = null;
        data.lastExternalFetch = null;
    }

    return data;
}

// ========== SAVE HISTORY ==========
function saveHistory() {
    try {
        const toSave = {
            _version: STATE_VERSION,
            ...state,
            bgAudio: null,
            currentUtterance: null,
            audioVisualizerInterval: null,
            scheduleInterval: null
        };

        localStorage.setItem('kes_podcast_state_v19', JSON.stringify(toSave));
        localStorage.setItem('kes_podcast_theme_v18', state.currentTheme);
        localStorage.setItem('kes_podcast_emotion_v18', state.currentEmotion);
    } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
}

// ========== GETTER/SETTER DENGAN AUTO-SAVE ==========
function getState(key) {
    return key ? state[key] : state;
}

function setState(key, value, autoSave) {
    if (key === undefined) return;
    const old = state[key];
    state[key] = value;
    emitter.emit('change', { key: key, value: value, old: old });

    if (autoSave !== false && state.preferences.autoSave !== false) {
        saveHistory();
    }
}

// ========== COMPUTED GETTERS ==========
function getComputedState() {
    const totalDuration = state.analytics.totalDuration || 0;
    const totalPlays = state.analytics.totalPlays || 0;
    const history = state.podcastHistory || [];
    const config = KESEMPATAN.Podcast.config || {};

    let currentVoiceName = 'Unknown';
    if (state.useAgentVoice && state.currentAgentVoice && config.AGENT_VOICES) {
        currentVoiceName = config.AGENT_VOICES[state.currentAgentVoice]?.name || 'Agent';
    } else if (config.VOICE_PRESETS && state.currentVoiceType) {
        currentVoiceName = config.VOICE_PRESETS[state.currentVoiceType]?.name || 'Unknown';
    }

    return {
        totalDuration: totalDuration,
        totalPlays: totalPlays,
        avgDuration: totalPlays > 0 ? Math.round(totalDuration / totalPlays) : 0,
        totalEpisodes: history.length,
        isHistoryEmpty: history.length === 0,
        lastEpisode: history[history.length - 1] || null,
        firstEpisode: history[0] || null,
        isDebateMode: state.speakerMode === 'debate',
        isProPlayer: state.currentPlayerMode === 'pro',
        isPlaying: state.isPlaying,
        isLive: state.isLiveStreaming,
        isAutoSchedule: state.autoScheduleActive,
        currentVoiceName: currentVoiceName,
        favoriteTopics: Object.keys(state.analytics.topics)
            .sort(function(a, b) { return state.analytics.topics[b] - state.analytics.topics[a]; })
            .slice(0, 5),
        userName: state.userName,
        favoriteVoices: state.favoriteVoices,
        lastGeneratedTopic: state.lastGeneratedTopic
    };
}

// ========== RESET ==========
function resetState() {
    if (!confirm('⚠️ Yakin ingin mereset SEMUA data? Tindakan ini tidak bisa dibatalkan!')) {
        return;
    }

    localStorage.removeItem('kes_podcast_state_v19');
    localStorage.removeItem('kes_podcast_history_v18');
    localStorage.removeItem('kes_podcast_analytics_v18');
    localStorage.removeItem('kes_podcast_theme_v18');
    localStorage.removeItem('kes_podcast_emotion_v18');

    location.reload();
}

// ========== EXPORT ==========
function exportState() {
    const data = {
        _version: STATE_VERSION,
        exportedAt: new Date().toISOString(),
        app: 'KESEMPATAN OS Podcast',
        state: {
            ...state,
            bgAudio: null,
            currentUtterance: null,
            audioVisualizerInterval: null,
            scheduleInterval: null
        },
        analytics: state.analytics,
        history: state.podcastHistory,
        bookmarks: state.bookmarks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kes_podcast_backup_' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
        KESEMPATAN.Podcast.uiRenderer.showToast('📦 Data berhasil diekspor!');
    }
}

// ========== IMPORT ==========
function importState(file) {
    if (!file) {
        alert('❌ Pilih file backup terlebih dahulu!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.state || typeof data.state !== 'object') {
                throw new Error('Format file tidak valid: missing "state" object');
            }

            if (!confirm('⚠️ Akan mengganti semua data saat ini. Lanjutkan?')) {
                return;
            }

            Object.keys(data.state).forEach(function(key) {
                if (state[key] !== undefined && key !== 'bgAudio' && key !== 'currentUtterance') {
                    state[key] = data.state[key];
                }
            });

            if (data.analytics) {
                Object.assign(state.analytics, data.analytics);
            }

            saveHistory();

            if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
                KESEMPATAN.Podcast.uiRenderer.showToast('✅ Data berhasil diimpor! Halaman akan refresh...');
            }

            setTimeout(function() { location.reload(); }, 1500);

        } catch (err) {
            alert('❌ Gagal import: ' + err.message);
            if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
                KESEMPATAN.Podcast.uiRenderer.showToast('❌ Import gagal: ' + err.message, 'error');
            }
        }
    };
    reader.readAsText(file);
}

export {
    state, emitter, getState, setState, loadHistory, saveHistory,
    getComputedState, resetState, exportState, importState
};

KESEMPATAN.Podcast.state = state;
KESEMPATAN.Podcast.emitter = emitter;
KESEMPATAN.Podcast.getState = getState;
KESEMPATAN.Podcast.setState = setState;
KESEMPATAN.Podcast.loadHistory = loadHistory;
KESEMPATAN.Podcast.saveHistory = saveHistory;
KESEMPATAN.Podcast.getComputedState = getComputedState;
KESEMPATAN.Podcast.resetState = resetState;
KESEMPATAN.Podcast.exportState = exportState;
KESEMPATAN.Podcast.importState = importState;

loadHistory();
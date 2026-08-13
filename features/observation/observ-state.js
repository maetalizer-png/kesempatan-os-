const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = KESEMPATAN.Observation || {};

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
        this._events[event] = this._events[event].filter(l => l !== listener);
    }
    emit(event, data) {
        if (!this._events[event]) return;
        this._events[event].forEach(listener => listener(data));
    }
}

const emitter = new EventEmitter();

const state = {
    signals: [],
    currentFilter: 'all',
    sentimentFilter: 'all',
    searchQuery: '',
    isRefreshing: false,
    refreshInterval: null,
    lastUpdate: null,
    sourceStatus: {},
    newSignalCount: 0,
    favorites: [],
    darkMode: true,
    chartInstance: null,
    autoTriggerState: {
        lastTrigger: 0,
        triggerCount: 0,
        isProcessing: false
    }
};

function setState(key, value) {
    const old = state[key];
    state[key] = value;
    emitter.emit('change', { key, value, old });
}

function getState(key) {
    return key ? state[key] : state;
}

OBS.state = state;
OBS.emitter = emitter;
OBS.setState = setState;
OBS.getState = getState;
OBS.getSignals = () => state.signals;
OBS.setSignals = (s) => { state.signals = s; emitter.emit('signals-updated', s); };
OBS.getFavorites = () => state.favorites;
OBS.setFavorites = (f) => { state.favorites = f; emitter.emit('favorites-updated', f); };
OBS.getDarkMode = () => state.darkMode;
OBS.setDarkMode = (d) => { state.darkMode = d; emitter.emit('theme-changed', d); };
OBS.getChartInstance = () => state.chartInstance;
OBS.setChartInstance = (c) => { state.chartInstance = c; };

export const Observation = OBS;
KESEMPATAN.Observation = OBS;
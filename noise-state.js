(function() {
    'use strict';
    if (window.__NoiseStateLoaded) {
        return;
    }
    window.__NoiseStateLoaded = true;

    const CONFIG = window.__NoiseConfig?.CONFIG || {};
    const Utils = window.__NoiseUtils?.Utils || {};
    const InternalLogger = window.__NoiseUtils?.InternalLogger || { info: function() {} };

    const IDB = {
        _db: null,
        _ready: false,
        _fallback: false,
        open: function() {
            const self = this;
            return new Promise(function(resolve) {
                if (self._ready) { resolve(); return; }
                if (!window.indexedDB) {
                    self._fallback = true;
                    resolve();
                    return;
                }
                const request = indexedDB.open('KESNoiseDB', 1);
                request.onupgradeneeded = function(e) {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('history')) {
                        db.createObjectStore('history', { keyPath: 'timestamp' });
                    }
                    if (!db.objectStoreNames.contains('signals')) {
                        const store = db.createObjectStore('signals', { keyPath: 'id' });
                        store.createIndex('timestamp', 'timestamp');
                    }
                };
                request.onsuccess = function(e) {
                    self._db = e.target.result;
                    self._ready = true;
                    resolve();
                };
                request.onerror = function() {
                    self._fallback = true;
                    resolve();
                };
            });
        },
        saveHistory: function(history) {
            const self = this;
            if (self._fallback || !self._ready) return Promise.resolve();
            return Utils.retry(function() {
                return new Promise(function(resolve, reject) {
                    const tx = self._db.transaction('history', 'readwrite');
                    const store = tx.objectStore('history');
                    const clearReq = store.clear();
                    clearReq.onsuccess = function() {
                        for (let i = 0; i < history.length; i++) {
                            store.add(history[i]);
                        }
                    };
                    tx.oncomplete = function() { resolve(); };
                    tx.onerror = function(e) { reject(e); };
                });
            });
        },
        loadHistory: function() {
            const self = this;
            if (self._fallback || !self._ready) return Promise.resolve([]);
            return Utils.retry(function() {
                return new Promise(function(resolve, reject) {
                    const tx = self._db.transaction('history', 'readonly');
                    const store = tx.objectStore('history');
                    const req = store.getAll();
                    req.onsuccess = function() { resolve(req.result || []); };
                    req.onerror = function(e) { reject(e); };
                });
            });
        },
        saveSignals: function(signals) {
            const self = this;
            if (self._fallback || !self._ready) return Promise.resolve();
            return Utils.retry(function() {
                return new Promise(function(resolve, reject) {
                    const tx = self._db.transaction('signals', 'readwrite');
                    const store = tx.objectStore('signals');
                    const clearReq = store.clear();
                    clearReq.onsuccess = function() {
                        for (let i = 0; i < signals.length; i++) {
                            store.add(signals[i]);
                        }
                    };
                    tx.oncomplete = function() { resolve(); };
                    tx.onerror = function(e) { reject(e); };
                });
            });
        },
        loadSignals: function() {
            const self = this;
            if (self._fallback || !self._ready) return Promise.resolve([]);
            return Utils.retry(function() {
                return new Promise(function(resolve, reject) {
                    const tx = self._db.transaction('signals', 'readonly');
                    const store = tx.objectStore('signals');
                    const req = store.getAll();
                    req.onsuccess = function() { resolve(req.result || []); };
                    req.onerror = function(e) { reject(e); };
                });
            });
        }
    };

    const _state = {
        signals: [],
        stats: { total: 0, blocked: 0, filtered: 0, allowed: 0 },
        isRunning: true,
        intervalId: null,
        intervalMs: CONFIG.INTERVAL_DEFAULT || 30000,
        threshold: CONFIG.THRESHOLD_DEFAULT || 60,
        blacklist: (CONFIG.DEFAULT_BLACKLIST || []).slice(),
        whitelist: (CONFIG.DEFAULT_WHITELIST || []).slice(),
        history: [],
        lastScan: null,
        isScanning: false,
        scanCount: 0,
        statusFilter: 'all',
        sentimentFilter: 'all'
    };

    const _verdictRegistry = new Map();
    const _aiCache = new Map();
    const _scanCountHistory = [];
    const _lastSignalTimestamps = [];
    let _cleanupFns = [];
    let _mounted = false;

    function setVerdict(id, signal) {
        if (!id) return;
        _verdictRegistry.set(id, {
            status: signal.status,
            reason: signal.reason,
            confidence: signal.confidence,
            credibilityScore: signal.credibilityScore,
            corroboratingSources: signal.corroboratingSources,
            isHoax: !!(signal.ai && signal.ai.isHoax)
        });
    }
    function getVerdict(id) {
        return _verdictRegistry.get(id) || null;
    }
    function getCachedAI(text) {
        const key = text.substring(0, 200);
        const cached = _aiCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < (CONFIG.CACHE_TTL || 3600000)) {
            return cached.result;
        }
        return null;
    }
    function setCachedAI(text, result) {
        const key = text.substring(0, 200);
        _aiCache.set(key, { result: result, timestamp: Date.now() });
    }
    function addCleanupFn(fn) {
        _cleanupFns.push(fn);
    }
    function getState() {
        return _state;
    }
    function getCleanupFns() {
        return _cleanupFns;
    }
    function getMounted() {
        return _mounted;
    }
    function setMounted(val) {
        _mounted = val;
    }

    window.__NoiseState = {
        IDB: IDB,
        state: _state,
        verdictRegistry: _verdictRegistry,
        aiCache: _aiCache,
        scanCountHistory: _scanCountHistory,
        lastSignalTimestamps: _lastSignalTimestamps,
        setVerdict: setVerdict,
        getVerdict: getVerdict,
        getCachedAI: getCachedAI,
        setCachedAI: setCachedAI,
        addCleanupFn: addCleanupFn,
        getState: getState,
        getCleanupFns: getCleanupFns,
        getMounted: getMounted,
        setMounted: setMounted
    };

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.NoiseState = window.__NoiseState;
})();
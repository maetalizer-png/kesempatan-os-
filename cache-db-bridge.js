(function() {
'use strict';
if (window.__CacheDbBridgeLoaded) return;
window.__CacheDbBridgeLoaded = true;

const DB_NAME = 'kes_response_cache_v1';
const STORE_NAME = 'cache';
const DB_VERSION = 1;
let dbPromise = null;

function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function(resolve, reject) {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB tidak tersedia di browser ini'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                store.createIndex('agent', 'agent', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        request.onsuccess = function(e) { resolve(e.target.result); };
        request.onerror = function() { reject(request.error || new Error('Gagal membuka IndexedDB cache')); };
    });
    return dbPromise;
}

const cacheDb = Object.freeze({
    getCachedResponse: function(key) {
        return openDb().then(function(db) {
            return new Promise(function(resolve, reject) {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const req = tx.objectStore(STORE_NAME).get(key);
                req.onsuccess = function() { resolve(req.result || null); };
                req.onerror = function() { reject(req.error); };
            });
        });
    },
    setCachedResponse: function(key, agentName, response) {
        return openDb().then(function(db) {
            return new Promise(function(resolve, reject) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).put({ key: key, agent: agentName, response: response, timestamp: Date.now() });
                tx.oncomplete = function() { resolve(true); };
                tx.onerror = function() { reject(tx.error); };
            });
        });
    },
    deleteCachedResponse: function(key) {
        return openDb().then(function(db) {
            return new Promise(function(resolve, reject) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).delete(key);
                tx.oncomplete = function() { resolve(true); };
                tx.onerror = function() { reject(tx.error); };
            });
        });
    },
    clearCache: function() {
        return openDb().then(function(db) {
            return new Promise(function(resolve, reject) {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                tx.objectStore(STORE_NAME).clear();
                tx.oncomplete = function() { resolve(true); };
                tx.onerror = function() { reject(tx.error); };
            });
        });
    },
    getAllCache: function() {
        return openDb().then(function(db) {
            return new Promise(function(resolve, reject) {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const req = tx.objectStore(STORE_NAME).getAll();
                req.onsuccess = function() { resolve(req.result || []); };
                req.onerror = function() { reject(req.error); };
            });
        });
    }
});

let attempts = 0;
const tryConnect = setInterval(function() {
    attempts++;
    const cachePage = window.KESEMPATAN?.ResponseCache || window.CachePage;
    if (cachePage && typeof cachePage.setDatabase === 'function') {
        cachePage.setDatabase(cacheDb);
        clearInterval(tryConnect);
    } else if (attempts > 40) {
        clearInterval(tryConnect);
    }
}, 500);

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.CacheDB = cacheDb;
window.KesCacheDB = cacheDb;
})();
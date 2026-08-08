/* ============================================================
KESEMPATAN OS - DATABASE ENTRY POINT
============================================================ */
(function () {
'use strict';

if (window.__DatabaseEntryLoaded) {
    return;
}

window.__DatabaseEntryLoaded = true;

const Utils = window.Utils || {};
const Logger = Utils.Logger || {
    info: function () {},
    warn: function () {},
    error: function () {}
};

// ============================================================
// DAFTAR MODULE — URUTAN PENTING
// ============================================================
const modules = [
    'kes-database/kes-dbconfig.js',
    'kes-database/kes-helpers.js',
    'kes-database/kes-security.js',
    'kes-database/kes-search.js',
    'kes-database/kes-monitor.js',
    'kes-database/kes-sync.js',
    'kes-database/kes-api.js'
];

let loaded = 0;
const total = modules.length;
let hasError = false;

// ============================================================
// FALLBACK DATABASE
// ============================================================
function createFallbackDatabase() {
    return {
        _isDummy: true,
        executeQuery: function () {
            return Promise.resolve([]);
        },
        saveQuantumEncrypted: function () {
            return Promise.resolve(null);
        },
        saveReport: function () {
            return Promise.resolve(null);
        },
        getReports: function () {
            return Promise.resolve([]);
        },
        getEncrypted: function () {
            return Promise.resolve(null);
        },
        getAllFromStore: function () {
            return Promise.resolve([]);
        },
        bulkInsert: function () {
            return Promise.resolve(0);
        },
        deleteRecord: function () {
            return Promise.resolve();
        },
        exportAllData: function () {
            return Promise.resolve({});
        },
        importAllData: function () {
            return Promise.resolve();
        },
        getStorageInfoEnhanced: function () {
            return Promise.resolve({
                stores: [],
                storageEstimate: null
            });
        },
        subscribe: function () {
            return function () {};
        },
        selfHeal: function () {
            return Promise.resolve({
                success: false,
                message: 'Database unavailable'
            });
        },
        cleanup: function () {
            return Promise.resolve();
        },
        destroy: function () {
            return Promise.resolve();
        }
    };
}

// ============================================================
// DATABASE READY HANDLER
// ============================================================
function handleDatabaseReady(dbInstance) {
    const safeDb = dbInstance || createFallbackDatabase();

    window.KESDatabase = safeDb;
    window.kesDatabase = safeDb;
    window.db = safeDb;

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('database-ready', {
            detail: safeDb
        }));
    }

    if (typeof window._onDatabaseReady === 'function') {
        window._onDatabaseReady(safeDb);
    }

    Logger.info('DatabaseEntry', 'Database instance exposed');
}

// ============================================================
// DATABASE ERROR HANDLER
// ============================================================
function handleBootstrapError(error) {
    Logger.error('DatabaseEntry', 'Database bootstrap failed: ' + error.message);

    const fallback = createFallbackDatabase();

    window.KESDatabase = fallback;
    window.kesDatabase = fallback;
    window.db = fallback;

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('database-error', {
            detail: error
        }));

        document.dispatchEvent(new CustomEvent('database-ready', {
            detail: fallback
        }));
    }

    if (typeof window._onDatabaseReady === 'function') {
        window._onDatabaseReady(fallback);
    }
}

// ============================================================
// BOOTSTRAP DATABASE
// ============================================================
function bootstrapDatabase() {
    if (hasError) {
        Logger.warn('DatabaseEntry', 'One or more database modules failed to load');
    }

    const initializer = window.getDatabase;

    if (typeof initializer !== 'function') {
        handleBootstrapError(new Error('Database initializer unavailable'));
        return;
    }

    initializer()
        .then(handleDatabaseReady)
        .catch(handleBootstrapError);
}

// ============================================================
// MODULE LOADER
// ============================================================
function loadNext() {
    if (loaded >= total) {
        bootstrapDatabase();
        return;
    }

    const src = modules[loaded];
    const script = document.createElement('script');

    script.src = src;
    script.async = false;

    script.onload = function () {
        loaded++;
        loadNext();
    };

    script.onerror = function () {
        hasError = true;
        loaded++;
        loadNext();
    };

    document.head.appendChild(script);
}

loadNext();

})();
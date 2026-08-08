/* ============================================================
KESEMPATAN OS - MEMORY ENTRY POINT
File: memory/m-memory.js
============================================================ */
(function () {
'use strict';
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__MemoryEntryLoaded) {
    return;
}

window.__MemoryEntryLoaded = true;

const Logger = KESEMPATAN.Utils?.Logger || (window.Utils && window.Utils.Logger) || {
    info: function () {},
    warn: function () {},
    error: function () {}
};

// ============================================================
// DAFTAR MODULE
// PENTING: path di bawah RELATIF TERHADAP HALAMAN HTML,
// bukan relatif terhadap file ini. Karena file ini berada di
// folder memory/ dan HTML memuat "memory/m-memory.js", maka
// path module tetap "memory/m-*.js". JANGAN diubah jadi
// "./m-*.js" atau "m-*.js" kecuali struktur folder/HTML berubah.
// ============================================================
const modules = [
    'm-config.js',
    'm-utilities.js',
    'm-metrics.js',
    'm-engines.js',
    'm-quantization.js',
    'm-indexers.js',
    'm-embeddings.js',
    'm-federated-learning.js',
    'm-tuner.js',
    'm-core.js',
    'm-index.js',
    'm-governance.js'
];

let loaded = 0;
const total = modules.length;
let hasError = false;
const failedModules = [];

// ============================================================
// COMPLETE HANDLER
// ============================================================
function handleComplete() {
    if (!hasError) {
        Logger.info('MemoryEntry', 'All ' + total + ' modules loaded');

        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('memory-ready'));
        }

        if (typeof window._onMemoryReady === 'function') {
            window._onMemoryReady();
        }

        return;
    }

    Logger.warn('MemoryEntry', 'Loaded with errors: ' + failedModules.join(', '));

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('memory-load-error', {
            detail: {
                failedModules: failedModules
            }
        }));
    }
}

// ============================================================
// MODULE LOADER
// ============================================================
function loadNext() {
    if (loaded >= total) {
        handleComplete();
        return;
    }

    const src = modules[loaded];
    const script = document.createElement('script');

    script.src = src;
    script.async = false;

    script.onload = function () {
        loaded++;
        Logger.info('MemoryEntry', 'Loaded: ' + src + ' (' + loaded + '/' + total + ')');
        loadNext();
    };

    script.onerror = function () {
        hasError = true;
        failedModules.push(src);
        Logger.error('MemoryEntry', 'Failed to load: ' + src);
        loaded++;
        loadNext();
    };

    document.head.appendChild(script);
}

// ============================================================
// START
// ============================================================
Logger.info('MemoryEntry', 'Loading ' + total + ' memory modules');

loadNext();

})();
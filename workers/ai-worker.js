(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__WorkersAILoaderLoaded) return;
window.__WorkersAILoaderLoaded = true;

const MODULES = [
    'workers/workers-config.js',
    'workers/workers-state.js',
    'workers/workers-core.js',
    'workers/workers-ui-layout.js',
    'workers/workers-ui-renderer.js',
    'workers/workers-ui-events.js'
];
let loaded = 0;
const total = MODULES.length;
let hasError = false;

function loadNext() {
    if (loaded >= total) {
        if (!hasError) {
            const pageContainer = document.getElementById('aiWorkersPage');
            if (pageContainer && pageContainer.style.display !== 'none') {
                KESEMPATAN.WorkersRenderer.renderWorkersPage();
            }
            const dataContainer = document.getElementById('aiWorkersDataPage');
            if (dataContainer && dataContainer.style.display !== 'none') {
                KESEMPATAN.WorkersRenderer.renderLogsPage();
            }
            if ((!pageContainer || pageContainer.style.display === 'none') &&
                (!dataContainer || dataContainer.style.display === 'none')) {
                const container = document.getElementById('aiWorkersContainer');
                if (container) KESEMPATAN.WorkersRenderer.renderWorkersPage();
            }
        }
        return;
    }
    const src = MODULES[loaded];
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = function() { loaded++; loadNext(); };
    script.onerror = function() { hasError = true; loaded++; loadNext(); };
    document.head.appendChild(script);
}

// Kept as a real global: offline-mode.js reads/replaces window.AIWorkers
// directly, and workers-core.js's AIWorkersCore constructor also assigns
// itself to window.AIWorkers once instantiated (this proxy is only the
// early-available shape before that happens).
window.AIWorkers = {
    get workers() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        return core ? core.workers : [];
    },
    get workerStats() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        return core ? core.workerStats : {};
    },
    toggleWorker: function(id, enabled) {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) core.toggleWorker(id, enabled);
    },
    runWorker: function(worker) {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) return core.runWorker(worker);
    },
    runWorkerNow: function(worker) {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) return core.runWorkerNow(worker);
    },
    saveWorkers: function() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) core.saveWorkers();
    },
    render: function() {
        if (KESEMPATAN.WorkersRenderer) KESEMPATAN.WorkersRenderer.renderWorkersPage();
    },
    getCategoryStats: function() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        return core ? core.getCategoryStats() : {};
    },
    getTotalStats: function() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        return core ? core.getTotalStats() : {};
    },
    getPoolStats: function() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        return core ? core.getPoolStats() : {};
    },
    setSchedule: function(workerId, schedule) {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) core.setSchedule(workerId, schedule);
    },
    testVoice: function() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) return core.testVoice();
    },
    destroy: function() {
        const core = KESEMPATAN.WorkersRenderer ? KESEMPATAN.WorkersRenderer.getCore() : null;
        if (core) core.destroy();
    }
};

KESEMPATAN.Workers = window.AIWorkers;

loadNext();
})();

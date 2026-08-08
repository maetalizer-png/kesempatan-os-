(function() {
'use strict';
if (window.__WorkersAILoaderLoaded) return;
window.__WorkersAILoaderLoaded = true;

const MODULES = [
    'config.js',
    'state.js',
    'core.js',
    'ui-layout.js',
    'ui-renderer.js',
    'ui-events.js'
];
let loaded = 0;
const total = MODULES.length;
let hasError = false;

function loadNext() {
    if (loaded >= total) {
        if (!hasError) {
            const pageContainer = document.getElementById('aiWorkersPage');
            if (pageContainer && pageContainer.style.display !== 'none') {
                window.WorkersAIRenderer.renderWorkersPage();
            }
            const dataContainer = document.getElementById('aiWorkersDataPage');
            if (dataContainer && dataContainer.style.display !== 'none') {
                window.WorkersAIRenderer.renderLogsPage();
            }
            if ((!pageContainer || pageContainer.style.display === 'none') &&
                (!dataContainer || dataContainer.style.display === 'none')) {
                const container = document.getElementById('aiWorkersContainer');
                if (container) window.WorkersAIRenderer.renderWorkersPage();
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

window.AIWorkers = {
    get workers() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        return core ? core.workers : [];
    },
    get workerStats() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        return core ? core.workerStats : {};
    },
    toggleWorker: function(id, enabled) {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) core.toggleWorker(id, enabled);
    },
    runWorker: function(worker) {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) return core.runWorker(worker);
    },
    runWorkerNow: function(worker) {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) return core.runWorkerNow(worker);
    },
    saveWorkers: function() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) core.saveWorkers();
    },
    render: function() {
        if (window.WorkersAIRenderer) window.WorkersAIRenderer.renderWorkersPage();
    },
    getCategoryStats: function() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        return core ? core.getCategoryStats() : {};
    },
    getTotalStats: function() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        return core ? core.getTotalStats() : {};
    },
    getPoolStats: function() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        return core ? core.getPoolStats() : {};
    },
    setSchedule: function(workerId, schedule) {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) core.setSchedule(workerId, schedule);
    },
    testVoice: function() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) return core.testVoice();
    },
    destroy: function() {
        const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
        if (core) core.destroy();
    }
};

window.renderAIWorkersPage = function() {
    if (window.WorkersAIRenderer) window.WorkersAIRenderer.renderWorkersPage();
};
window.renderAIWorkersDataPage = function() {
    if (window.WorkersAIRenderer) window.WorkersAIRenderer.renderLogsPage();
};
window.addAIWorkerLog = function(workerId, workerName, message) {
    if (window.WorkersAIRenderer) window.WorkersAIRenderer.updateLogsDisplay();
    const core = window.WorkersAIRenderer ? window.WorkersAIRenderer.getCore() : null;
    if (core) {
        const worker = { id: workerId, name: workerName };
        core._addLog(worker, message);
    }
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.Workers = window.AIWorkers;

loadNext();
})();
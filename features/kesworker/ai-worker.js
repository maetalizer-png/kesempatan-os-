import './workers-config.js';
import './workers-state.js';
import './workers-core.js';
import './workers-ui-layout.js';
import { WorkersRenderer } from './workers-ui-renderer.js';
import './workers-ui-events.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

// Kept as a real global: offline-mode.js reads/replaces window.AIWorkers
// directly, and workers-core.js's AIWorkersCore constructor also assigns
// itself to window.AIWorkers once instantiated (this proxy is only the
// early-available shape before that happens).
window.AIWorkers = {
    get workers() {
        const core = WorkersRenderer.getCore();
        return core ? core.workers : [];
    },
    get workerStats() {
        const core = WorkersRenderer.getCore();
        return core ? core.workerStats : {};
    },
    toggleWorker: function(id, enabled) {
        const core = WorkersRenderer.getCore();
        if (core) core.toggleWorker(id, enabled);
    },
    runWorker: function(worker) {
        const core = WorkersRenderer.getCore();
        if (core) return core.runWorker(worker);
    },
    runWorkerNow: function(worker) {
        const core = WorkersRenderer.getCore();
        if (core) return core.runWorkerNow(worker);
    },
    saveWorkers: function() {
        const core = WorkersRenderer.getCore();
        if (core) core.saveWorkers();
    },
    render: function() {
        WorkersRenderer.renderWorkersPage();
    },
    getCategoryStats: function() {
        const core = WorkersRenderer.getCore();
        return core ? core.getCategoryStats() : {};
    },
    getTotalStats: function() {
        const core = WorkersRenderer.getCore();
        return core ? core.getTotalStats() : {};
    },
    getPoolStats: function() {
        const core = WorkersRenderer.getCore();
        return core ? core.getPoolStats() : {};
    },
    setSchedule: function(workerId, schedule) {
        const core = WorkersRenderer.getCore();
        if (core) core.setSchedule(workerId, schedule);
    },
    testVoice: function() {
        const core = WorkersRenderer.getCore();
        if (core) return core.testVoice();
    },
    destroy: function() {
        const core = WorkersRenderer.getCore();
        if (core) core.destroy();
    }
};

KESEMPATAN.Workers = window.AIWorkers;

const pageContainer = document.getElementById('aiWorkersPage');
if (pageContainer && pageContainer.style.display !== 'none') {
    WorkersRenderer.renderWorkersPage();
}
const dataContainer = document.getElementById('aiWorkersDataPage');
if (dataContainer && dataContainer.style.display !== 'none') {
    WorkersRenderer.renderLogsPage();
}
if ((!pageContainer || pageContainer.style.display === 'none') &&
    (!dataContainer || dataContainer.style.display === 'none')) {
    const container = document.getElementById('aiWorkersContainer');
    if (container) WorkersRenderer.renderWorkersPage();
}

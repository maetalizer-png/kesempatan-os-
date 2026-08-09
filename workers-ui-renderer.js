(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__WorkersAIRenderer) return;
window.__WorkersAIRenderer = true;

const state = KESEMPATAN.WorkersState;
const layout = KESEMPATAN.WorkersLayout;
const core = KESEMPATAN.WorkersCore;
let _coreInstance = null;

function getCore() {
    if (!_coreInstance) _coreInstance = new core.AIWorkersCore();
    return _coreInstance;
}

function renderWorkersPage() {
    let container = document.getElementById('aiWorkersContainer');
    if (!container) {
        const pageContainer = document.getElementById('aiWorkersPage');
        if (pageContainer) {
            const newContainer = document.createElement('div');
            newContainer.id = 'aiWorkersContainer';
            pageContainer.appendChild(newContainer);
            container = newContainer;
        } else {
            return;
        }
    }
    const coreInstance = getCore();
    const workers = state.getWorkers();
    const stats = state.getStats();
    const filter = coreInstance.currentFilter || 'all';
    const search = coreInstance.searchQuery || '';
    const voiceEnabled = coreInstance.voiceEnabled;
    const enablePrediction = coreInstance.enablePrediction;
    const html = layout.buildWorkersLayout({
        workers: workers,
        stats: stats,
        filter: filter,
        search: search,
        voiceEnabled: voiceEnabled,
        enablePrediction: enablePrediction
    });
    container.innerHTML = html;
    if (KESEMPATAN.WorkersEvents) KESEMPATAN.WorkersEvents.attachWorkersEvents(container);
    updateLogsDisplay();
    if (enablePrediction) updatePredictions();
    const logCount = document.getElementById('logCount');
    if (logCount) {
        const logs = state.getLogs();
        logCount.textContent = logs.length + ' entries';
    }
}

function renderLogsPage() {
    const container = document.getElementById('aiWorkersDataContainer');
    if (!container) return;
    const coreInstance = getCore();
    const logs = state.getLogs();
    const filterWorker = coreInstance.logFilterWorker || 'all';
    const filterStatus = coreInstance.logFilterStatus || 'all';
    const searchQuery = coreInstance.logSearchQuery || '';
    const html = layout.buildLogsLayout(logs, filterWorker, filterStatus, searchQuery);
    container.innerHTML = html;
    if (KESEMPATAN.WorkersEvents) KESEMPATAN.WorkersEvents.attachLogsEvents(container);
    populateWorkerFilter();
}

function updateLogsDisplay() {
    const container = document.getElementById('aiWorkersLogs');
    if (!container) return;
    const logs = state.getLogs();
    if (logs.length === 0) {
        container.innerHTML = '<div class="text-dim" style="text-align:center; padding:20px;">Belum ada log aktivitas...</div>';
        return;
    }
    let html = '';
    const max = Math.min(logs.length, 30);
    for (let i = 0; i < max; i++) {
        const log = logs[i];
        html += '<div style="padding:6px 10px;border-bottom:1px solid rgba(255,215,0,0.15);font-size:11px;background:linear-gradient(90deg, #FFD70008, #00FFA308, #FF00FF08);">' +
            '<span style="color:#FFD700;">[' + new Date(log.timestamp).toLocaleTimeString() + ']</span> ' +
            '<span style="color:#FFD700;text-shadow:0 0 3px #FFD700;">' + log.workerName + '</span> ' +
            '<span style="color:#A0B3C9;">' + log.message + '</span>' +
            '</div>';
    }
    container.innerHTML = html;
    const logCount = document.getElementById('logCount');
    if (logCount) logCount.textContent = logs.length + ' entries';
}

function updatePredictions() {
    const coreInstance = getCore();
    const workers = state.getWorkers();
    for (let i = 0; i < workers.length; i++) {
        const worker = workers[i];
        const predContainer = document.getElementById('prediction-' + worker.id);
        if (predContainer) {
            const pred = coreInstance.predictor.predictWorker(worker.id);
            if (pred && pred.confidence > 50) {
                const color = pred.status === 'excellent' ? '#00FFA3' : pred.status === 'good' ? '#FFD700' : pred.status === 'warning' ? '#FFA500' : '#FF6B6B';
                predContainer.innerHTML = '[PRED] ' + pred.prediction;
                predContainer.style.color = color;
            } else {
                predContainer.innerHTML = '';
            }
        }
    }
}

function populateWorkerFilter() {
    const select = document.getElementById('logFilterWorker');
    if (!select) return;
    const currentValue = select.value;
    const workers = state.getWorkers();
    const enabledWorkers = workers.filter(function(w) { return w.enabled; });
    select.innerHTML = '<option value="all">Semua Worker</option>';
    for (let i = 0; i < enabledWorkers.length; i++) {
        const w = enabledWorkers[i];
        select.innerHTML += '<option value="' + w.id + '">' + (w.icon ? w.icon + ' ' : '') + w.name + '</option>';
    }
    select.value = currentValue || 'all';
}

function addAIWorkerLog(workerId, workerName, message) {
    const worker = { id: workerId, name: workerName };
    const coreInstance = getCore();
    // Fixed: was calling coreInstance.addLog (never existed on AIWorkersCore —
    // only the prototype method _addLog does), so the "Test Log" button always
    // threw a TypeError and the log was silently never added.
    coreInstance._addLog(worker, message);
    updateLogsDisplay();
    if (document.getElementById('aiWorkersDataContainer')) renderLogsPage();
}
function exportAIWorkersData() {
    const logs = state.getLogs();
    if (logs.length === 0) {
        if (window.Utils && window.Utils.showToast) window.Utils.showToast('Tidak ada log untuk diexport', 'warning');
        return;
    }
    let csv = 'Timestamp,Worker,Message\n';
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        csv += '"' + new Date(log.timestamp).toLocaleString() + '", "' + (log.workerName || 'Unknown') + '", "' + log.message.replace(/"/g, '""') + '"\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kes_log_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    if (window.Utils && window.Utils.showToast) window.Utils.showToast('Log exported successfully!', 'success');
}

KESEMPATAN.WorkersRenderer = {
    renderWorkersPage: renderWorkersPage,
    renderLogsPage: renderLogsPage,
    updateLogsDisplay: updateLogsDisplay,
    updatePredictions: updatePredictions,
    populateWorkerFilter: populateWorkerFilter,
    getCore: getCore,
    addAIWorkerLog: addAIWorkerLog,
    exportAIWorkersData: exportAIWorkersData
};
})();
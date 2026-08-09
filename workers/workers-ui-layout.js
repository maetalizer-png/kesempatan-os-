(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__WorkersAILayout) return;
window.__WorkersAILayout = true;

const state = KESEMPATAN.WorkersState;
const config = KESEMPATAN.WorkersConfig;
if (!state || !config) return;

const WORKERS_CSS = `<style>
#aiWorkersPage, #aiWorkersDataPage, #aiWorkersDataContainer, .result-container { overflow-x: hidden !important; width: 100% !important; max-width: 100% !important; word-break: break-word !important; }
.filter-btn-ai { transition: all 0.2s ease; }
.filter-btn-ai:hover { transform: scale(1.03); }
.filter-btn-ai.active { border-color: #00FFA3 !important; background: rgba(0, 255, 163, 0.15) !important; color: #00FFA3 !important; }
.worker-toggle-ai { accent-color: #00FFA3; width: 16px; height: 16px; cursor: pointer; transition: all 0.2s ease; }
.worker-toggle-ai:hover { transform: scale(1.1); }
.run-worker-ai { transition: all 0.2s ease; }
.run-worker-ai:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 255, 163, 0.2); }
.run-worker-ai:disabled { opacity: 0.5; cursor: not-allowed; }
.worker-grid-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.worker-grid-item:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0, 255, 163, 0.05); }
#aiWorkersLogs { scroll-behavior: smooth; }
#aiWorkersLogs::-webkit-scrollbar { width: 4px; }
#aiWorkersLogs::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
#aiWorkersLogs::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.15); border-radius: 4px; }
.log-entry-ai { transition: all 0.2s ease; }
.log-entry-ai:hover { background: rgba(255, 215, 0, 0.05) !important; }
.worker-status-online { color: #00FFA3; text-shadow: 0 0 10px rgba(0, 255, 163, 0.3); }
.worker-status-offline { color: #666; }
.worker-status-warning { color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
.worker-status-error { color: #FF6B6B; text-shadow: 0 0 10px rgba(255, 107, 107, 0.3); }
@media (max-width: 768px) { .worker-grid-item { min-width: 100%; } #aiWorkersLogs { height: 150px !important; } }
</style>`;

function getCategoryStats(workers) {
    const stats = {};
    if (!workers) return stats;
    workers.forEach(function(w) {
        if (!stats[w.category]) stats[w.category] = { total: 0, enabled: 0 };
        stats[w.category].total++;
        if (w.enabled) stats[w.category].enabled++;
    });
    return stats;
}

function getTotalStats(workers, workerStats) {
    const total = workers.length;
    const enabled = workers.filter(function(w) { return w.enabled; }).length;
    let totalSuccess = 0;
    let totalFailed = 0;
    for (const key in workerStats) {
        if (workerStats.hasOwnProperty(key)) {
            totalSuccess += workerStats[key].success || 0;
            totalFailed += workerStats[key].failed || 0;
        }
    }
    return {
        total: total,
        enabled: enabled,
        disabled: total - enabled,
        totalSuccess: totalSuccess,
        totalFailed: totalFailed,
        successRate: totalSuccess + totalFailed > 0 ? Math.round((totalSuccess / (totalSuccess + totalFailed)) * 100) : 0,
        ai: { workers: 0, attempts: 0, successRate: 0, insights: 0 },
        prediction: { accuracy: 0, totalPredictions: 0, activePredictions: 0 }
    };
}

function buildWorkersLayout(options) {
    options = options || {};
    const workers = options.workers || state.getWorkers() || [];
    const workerStats = options.stats || state.getStats() || {};
    const currentFilter = options.filter || 'all';
    const searchQuery = options.search || '';
    const voiceEnabled = options.voiceEnabled !== undefined ? options.voiceEnabled : true;
    const enablePrediction = options.enablePrediction !== undefined ? options.enablePrediction : true;
    const stats = getCategoryStats(workers);
    const totalStats = getTotalStats(workers, workerStats);
    const poolStats = { running: 0, queued: 0, completed: 0 };
    const optStats = { total: 0, byType: {} };
    let filtered = workers;
    if (currentFilter !== 'all') {
        filtered = filtered.filter(function(w) { return w.category === currentFilter; });
    }
    if (searchQuery) {
        filtered = filtered.filter(function(w) {
            return w.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
        });
    }
    const categories = [
        { id: 'crypto', name: 'KRIPTO', icon: '₿' },
        { id: 'design', name: 'DESAIN', icon: '' },
        { id: 'coding', name: 'CODING', icon: '' },
        { id: 'media', name: 'MEDIA', icon: '' },
        { id: 'tech', name: 'TECH', icon: '' },
        { id: 'viz', name: 'VIZ', icon: '' },
        { id: 'security', name: 'SECURITY', icon: '' },
        { id: 'cyber', name: 'CYBER', icon: '' },
        { id: 'automation', name: 'AUTO', icon: '' },
        { id: 'global', name: 'GLOBAL', icon: '' },
        { id: 'bonus', name: 'BONUS', icon: '' }
    ];
    let filterButtonsHtml = '<button class="filter-btn-ai' + (currentFilter === 'all' ? ' active' : '') + '" data-filter="all" style="padding:3px 12px;border-radius:15px;border:1px solid ' + (currentFilter === 'all' ? '#00FFA3' : 'rgba(0,255,163,0.15)') + ';background:' + (currentFilter === 'all' ? 'rgba(0,255,163,0.2)' : 'transparent') + ';color:' + (currentFilter === 'all' ? '#00FFA3' : '#A0B3C9') + ';cursor:pointer;font-size:10px;">All (' + workers.length + ')</button>';
    for (let ci = 0; ci < categories.length; ci++) {
        const c = categories[ci];
        const isActive = currentFilter === c.id;
        const catStats = stats[c.id];
        const count = catStats ? catStats.total : 0;
        const label = (c.icon ? c.icon + ' ' : '') + c.name + ' (' + count + ')';
        filterButtonsHtml += '<button class="filter-btn-ai' + (isActive ? ' active' : '') + '" data-filter="' + c.id + '" style="padding:3px 12px;border-radius:15px;border:1px solid ' + (isActive ? '#00FFA3' : 'rgba(0,255,163,0.15)') + ';background:' + (isActive ? 'rgba(0,255,163,0.2)' : 'transparent') + ';color:' + (isActive ? '#00FFA3' : '#A0B3C9') + ';cursor:pointer;font-size:10px;">' + label + '</button>';
    }
    let workersHtml = '';
    if (filtered.length === 0) {
        workersHtml = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">Tidak ada worker yang cocok dengan filter</div>';
    } else {
        for (let wi = 0; wi < filtered.length; wi++) {
            const worker = filtered[wi];
            const stat = workerStats[worker.id] || { success: 0, failed: 0 };
            const total = stat.success + stat.failed;
            const rate = total > 0 ? Math.round((stat.success / total) * 100) : 0;
            const lastRunText = worker.lastRun ? new Date(worker.lastRun).toLocaleTimeString() : 'Belum pernah';
            const borderColor = worker.enabled ? 'rgba(0,255,163,0.3)' : 'rgba(255,255,255,0.08)';
            workersHtml += '<div class="worker-grid-item" style="background:rgba(0,0,0,0.4);border-radius:12px;padding:10px;border:1px solid ' + borderColor + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;align-items:center;gap:6px;">' +
                '<span style="font-size:16px;">' + (worker.icon || '') + '</span>' +
                '<span style="color:' + (worker.enabled ? '#00FFA3' : '#666') + ';font-weight:bold;font-size:11px;">' + worker.name + '</span>' +
                (worker.priority >= 5 ? '<span style="color:#FFD700;font-size:8px;">P5</span>' : '') +
                '</div>' +
                '<label><input type="checkbox" class="worker-toggle-ai" data-id="' + worker.id + '" ' + (worker.enabled ? 'checked' : '') + ' style="accent-color:#00FFA3;width:16px;height:16px;"></label>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:9px;color:#666;margin-top:4px;">' +
                '<span>' + stat.success + '</span><span>' + stat.failed + '</span><span>' + rate + '%</span><span>' + worker.schedule + '</span>' +
                '</div>' +
                '<div id="prediction-' + worker.id + '" style="font-size:8px;margin-top:2px;"></div>' +
                '<div style="display:flex;justify-content:space-between;margin-top:4px;">' +
                '<div style="font-size:8px;color:#444;">' + lastRunText + '</div>' +
                '<button class="run-worker-ai" data-id="' + worker.id + '" style="background:rgba(0,255,163,0.15);border:1px solid #00FFA3;border-radius:12px;padding:1px 10px;color:#00FFA3;cursor:pointer;font-size:9px;">Run</button>' +
                '</div>' +
                '</div>';
        }
    }
    let html = WORKERS_CSS +
        `<div style="padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; background: rgba(0,255,163,0.05); border-radius: 16px; padding: 16px; border: 1px solid rgba(0,255,163,0.2);">
<div>
<h2 style="color:#00FFA3; margin:0; font-size: 20px;">MANAJEMEN WORKER</h2>
<p style="color:#A0B3C9; font-size: 12px; margin-top: 4px;">${totalStats.total} Worker • ${totalStats.enabled} Active • ${totalStats.totalSuccess} Success • ${totalStats.totalFailed} Failed • ${poolStats.running} Running • ${poolStats.queued} Queued</p>
<p style="color:#00FFA3; font-size: 11px;">Success Rate: ${totalStats.successRate}%</p>
<p style="color:#00FFA3; font-size: 10px;">Analisis: ${totalStats.ai.workers} workers trained • ${totalStats.ai.attempts} attempts • ${totalStats.ai.successRate}% success • ${totalStats.ai.insights} insights</p>
<p style="color:#FF6B6B; font-size: 10px;">Prediction: ${totalStats.prediction.accuracy}% accuracy • ${totalStats.prediction.totalPredictions} predictions • ${totalStats.prediction.activePredictions} active</p>
<p style="color:#00FFA3; font-size: 10px;">Optimizations: ${optStats.total} total</p>
</div>
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
<button id="testVoiceBtn" class="execute-btn secondary" style="padding: 6px 14px; font-size: 10px; background: linear-gradient(135deg, #FF6B6B, #FF3366); color: #fff; border: none; border-radius: 20px; font-weight: bold;">Test Voice</button>
<button id="optimizeNowBtn" class="execute-btn secondary" style="padding: 6px 14px; font-size: 10px; background: linear-gradient(135deg, #FF6B6B, #FF3366); color: #fff; border: none; border-radius: 20px; font-weight: bold;">Optimize Now</button>
<button id="startAllWorkersBtn" class="execute-btn secondary" style="padding: 6px 14px; font-size: 10px; background: rgba(0,255,163,0.2); border: 1px solid #00FFA3; border-radius: 20px; color: #00FFA3; cursor: pointer;">Start All</button>
<button id="stopAllWorkersBtn" class="execute-btn secondary" style="padding: 6px 14px; font-size: 10px; background: rgba(255,0,0,0.2); border: 1px solid #ff4444; border-radius: 20px; color: #ff4444; cursor: pointer;">Stop All</button>
<button id="clearWorkersLogsBtn" class="execute-btn secondary" style="padding: 6px 14px; font-size: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: #A0B3C9; cursor: pointer;">Clear Logs</button>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center;">
<input type="text" id="searchWorkerInput" placeholder="Cari worker..." style="flex: 1; min-width: 150px; padding: 6px 14px; background: rgba(10,15,28,0.8); border: 1px solid rgba(0,255,163,0.3); border-radius: 20px; color: white; font-size: 12px;">
<div style="display: flex; flex-wrap: wrap; gap: 4px;">${filterButtonsHtml}</div>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 16px;">${workersHtml}</div>
<div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 12px; border: 1px solid rgba(0,255,163,0.1);">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
<h3 style="color:#00FFA3; margin:0; font-size: 14px;">Log Aktivitas</h3>
<span style="color: #A0B3C9; font-size: 10px;" id="logCount">0 entries</span>
</div>
<div id="aiWorkersLogs" style="height: 200px; overflow-y: auto; font-size: 11px;">
<div class="text-dim" style="text-align:center; padding:20px;">Belum ada log aktivitas</div>
</div>
</div>
<div style="display: flex; justify-content: space-between; margin-top: 12px; padding: 8px; color: #444; font-size: 9px; border-top: 1px solid rgba(255,255,255,0.05);">
<span>KESEMPATAN OS</span>
<span>${poolStats.running} running • ${poolStats.queued} queued • ${poolStats.completed} completed</span>
<span>Analisis</span>
<span>Voice: ${voiceEnabled ? 'ON' : 'OFF'}</span>
<span>Production Ready</span>
</div>
</div>`;
    return html;
}

function buildLogsLayout(logs, filterWorker, filterStatus, searchQuery) {
    if (!logs || logs.length === 0) {
        return WORKERS_CSS +
            `<div style="text-align:center; padding:40px;">
<div style="color: #A0B3C9;">Belum ada log aktivitas</div>
<div style="font-size: 12px; color: #666; margin-top: 8px;">Jalankan worker terlebih dahulu</div>
<button id="testAIWorkerLogBtn" class="execute-btn secondary" style="margin-top: 16px;">Test Log</button>
</div>`;
    }
    let filtered = logs;
    if (filterWorker && filterWorker !== 'all') {
        filtered = filtered.filter(function(log) { return log.workerId === filterWorker; });
    }
    if (filterStatus && filterStatus !== 'all') {
        filtered = filtered.filter(function(log) {
            if (filterStatus === 'success') return log.message.indexOf('[OK]') !== -1;
            if (filterStatus === 'warning') return log.message.indexOf('[WARN]') !== -1;
            if (filterStatus === 'error') return log.message.indexOf('[ERR]') !== -1;
            if (filterStatus === 'info') return log.message.indexOf('[INFO]') !== -1 || log.message.indexOf('[PRED]') !== -1;
            return true;
        });
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(function(log) {
            return log.message.toLowerCase().indexOf(q) !== -1 || log.workerName.toLowerCase().indexOf(q) !== -1;
        });
    }
    let html = WORKERS_CSS +
        `<div style="padding: 16px;">
<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
<h2 style="color:#00FFA3; margin:0; font-size: 16px;">LOG AKTIVITAS WORKER</h2>
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.3); padding: 2px 10px; border-radius: 16px;">
<span style="color: #666; font-size: 10px;">Worker:</span>
<select id="logFilterWorker" style="background: transparent; border: none; color: #A0B3C9; font-size: 10px; padding: 2px 0;">
<option value="all">Semua</option>
</select>
</div>
<div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.3); padding: 2px 10px; border-radius: 16px;">
<span style="color: #666; font-size: 10px;">Status:</span>
<select id="logFilterStatus" style="background: transparent; border: none; color: #A0B3C9; font-size: 10px; padding: 2px 0;">
<option value="all">Semua</option>
<option value="success">Berhasil</option>
<option value="warning">Peringatan</option>
<option value="error">Gagal</option>
<option value="info">Info</option>
</select>
</div>
<input type="text" id="logSearchInput" placeholder="Cari log..." style="flex: 1; min-width: 120px; padding: 4px 12px; background: rgba(10,15,28,0.8); border: 1px solid rgba(0,255,163,0.3); border-radius: 16px; color: white; font-size: 10px;">
<button id="refreshAIWorkersDataBtn" class="execute-btn secondary" style="width:auto; padding:4px 12px; font-size: 10px;">Refresh</button>
<button id="exportAIWorkersDataBtn" class="execute-btn secondary" style="width:auto; padding:4px 12px; font-size: 10px;">Export</button>
<button class="execute-btn secondary" style="width:auto; padding:4px 12px; font-size: 10px;" onclick="window.showPage('dashboard')">Kembali</button>
</div>
</div>
<div style="max-height: 70vh; overflow-y: auto; padding: 4px;">`;
    if (filtered.length === 0) {
        html += '<div style="text-align:center; padding:40px; color:#666;">Tidak ada log yang cocok</div>';
    } else {
        for (let i = 0; i < filtered.length; i++) {
            const log = filtered[i];
            let color = '#A0B3C9';
            if (log.message.indexOf('[OK]') !== -1) color = '#00FFA3';
            else if (log.message.indexOf('[WARN]') !== -1 || log.message.indexOf('warning') !== -1) color = '#FFD700';
            else if (log.message.indexOf('[ERR]') !== -1 || log.message.indexOf('error') !== -1) color = '#FF6B6B';
            else if (log.message.indexOf('[INFO]') !== -1 || log.message.indexOf('[PRED]') !== -1) color = '#4ECDC4';
            html += '<div class="log-entry-ai" style="padding: 8px 12px; border-bottom: 1px solid rgba(255,215,0,0.05); font-size: 11px; background: linear-gradient(90deg, rgba(255,215,0,0.02), rgba(0,255,163,0.02)); border-left: 3px solid ' + color + '; margin-bottom: 4px; border-radius: 4px;">' +
                '<div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;">' +
                '<span style="color: #FFD700; font-weight: bold; font-size: 11px;">' + (log.workerName || 'Unknown') + '</span>' +
                '<span style="color: #666; font-size: 9px;">' + new Date(log.timestamp).toLocaleString() + '</span>' +
                '</div>' +
                '<div style="color: #A0B3C9; margin-top: 4px; font-size: 11px; line-height: 1.4;">' + log.message + '</div>' +
                '</div>';
        }
    }
    html += `</div>
<div style="text-align: center; margin-top: 16px;">
<button id="clearAllAIWorkersLogsBtn" class="execute-btn secondary" style="padding: 5px 15px;">Hapus Semua Log</button>
</div>
</div>`;
    return html;
}

KESEMPATAN.WorkersLayout = { buildWorkersLayout: buildWorkersLayout, buildLogsLayout: buildLogsLayout };
})();
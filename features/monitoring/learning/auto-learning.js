import { Utils } from '../../../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const InternalLogger = (function() {
    const _logs = [];
    const _maxLogs = 100;
    const _levels = { INFO: 1, WARN: 2, ERROR: 3 };
    function log(level, module, message) {
        _logs.push({ timestamp: Date.now(), level: level, module: module, message: message, id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6) });
        if (_logs.length > _maxLogs) _logs.shift();
    }
    return Object.freeze({
        info: function(m, msg) { log(_levels.INFO, m, msg); },
        warn: function(m, msg) { log(_levels.WARN, m, msg); },
        error: function(m, msg) { log(_levels.ERROR, m, msg); },
        getLogs: function(l) { return _logs.slice(-(l || 50)); }
    });
})();

const showToast = Utils.showToast;

function escapeHtml(text) {
    if (!text) return '';
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(text);
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function showConfirmDialog(title, message, onConfirm, confirmText) {
    confirmText = confirmText || 'Ya, Reset';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e;border-radius:16px;padding:24px;max-width:400px;width:90%;border:1px solid rgba(0,255,163,0.2);';
    box.innerHTML = '<h3 style="color:#FF6B6B;margin:0 0 8px 0;font-size:16px;">' + escapeHtml(title) + '</h3>' +
        '<p style="color:#A0B3C9;margin:0 0 20px 0;font-size:13px;line-height:1.5;">' + escapeHtml(message) + '</p>' +
        '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
        '<button class="confirm-cancel" style="padding:8px 20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:30px;color:#A0B3C9;cursor:pointer;font-size:13px;">Batal</button>' +
        '<button class="confirm-ok" style="padding:8px 20px;background:#FF4444;border:none;border-radius:30px;color:white;font-weight:bold;cursor:pointer;font-size:13px;">' + escapeHtml(confirmText) + '</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const close = function() { overlay.remove(); };
    const cancelBtn = box.querySelector('.confirm-cancel');
    const okBtn = box.querySelector('.confirm-ok');
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (okBtn) okBtn.addEventListener('click', function() { close(); if (typeof onConfirm === 'function') onConfirm(); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
}

const _state = {
    chartInstance: null, intervalId: null, handlers: [],
    currentFilter: 'all', currentSearch: '', currentApprovalFilter: 'all',
    historyData: [], isCompareMode: false, compareAgents: [], isRendering: false
};

async function renderChart(agentRanking) {
    const canvas = document.getElementById('learningChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (_state.chartInstance) { _state.chartInstance.destroy(); _state.chartInstance = null; }
    if (agentRanking.length === 0) { ctx.fillStyle = '#666'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Belum ada data untuk chart', canvas.width / 2, canvas.height / 2 + 4); return; }
    if (typeof Chart === 'undefined' && window.KESEMPATAN?.ChartManager?.ensureChartLib) {
        await window.KESEMPATAN.ChartManager.ensureChartLib().catch(function() {});
    }
    if (typeof Chart === 'undefined') { ctx.fillStyle = '#666'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Chart.js tidak tersedia', canvas.width / 2, canvas.height / 2 + 4); return; }
    const labels = agentRanking.map(function(a) { return a.agent; });
    const data = agentRanking.map(function(a) { return a.approvalRate || 0; });
    const thresholds = agentRanking.map(function(a) { return a.recThreshold || 70; });
    const colors = data.map(function(v) { if (v >= 80) return 'rgba(46,204,113,0.7)'; if (v >= 60) return 'rgba(241,196,15,0.7)'; return 'rgba(231,76,60,0.7)'; });
    const borderColors = data.map(function(v) { if (v >= 80) return '#2ecc71'; if (v >= 60) return '#f39c12'; return '#e74c3c'; });
    _state.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [
            { label: 'Approval Rate', data: data, backgroundColor: colors, borderColor: borderColors, borderWidth: 2, borderRadius: 4, barPercentage: 0.6 },
            { label: 'Adaptive Threshold', data: thresholds, type: 'line', borderColor: '#00FFA3', borderDash: [5, 5], borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#00FFA3', fill: false, tension: 0.1 }
        ] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#A0B3C9', font: { size: 11, family: 'Inter' } } }, tooltip: { callbacks: { label: function(c) { return c.dataset.label + ': ' + c.parsed.y + '%'; } } } },
            scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 9 }, callback: function(v) { return v + '%'; } } }, x: { grid: { display: false }, ticks: { color: '#666', font: { size: 8 }, maxRotation: 45, minRotation: 0 } } },
            onClick: function(ev, els) { if (els && els.length > 0) { const a = agentRanking[els[0].index]; if (a) showAgentDetail(a); } }
        }
    });
}

function showAgentDetail(agent) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;';
    const rate = agent.approvalRate || 0;
    const threshold = agent.recThreshold || 70;
    const status = rate >= threshold ? 'High Performer' : (rate >= threshold * 0.7 ? 'Developing' : 'Needs Improvement');
    const statusColor = rate >= threshold ? '#2ecc71' : (rate >= threshold * 0.7 ? '#f39c12' : '#e74c3c');
    const hist = _state.historyData.filter(function(h) { return h.agent === agent.agent; }).slice(-10);
    let histHtml = '';
    if (hist.length > 0) {
        let rows = '';
        hist.reverse().forEach(function(h) {
            const color = h.approved ? '#2ecc71' : '#e74c3c';
            rows += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:12px;"><span style="color:' + color + ';font-weight:bold;">' + (h.approved ? 'APPROVED' : 'REJECTED') + '</span><span style="color:#666;margin-left:auto;">' + new Date(h.timestamp).toLocaleTimeString() + '</span></div>';
        });
        histHtml = '<div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:12px;margin-bottom:16px;"><div style="font-size:11px;color:#A0B3C9;margin-bottom:8px;">Riwayat Terakhir</div>' + rows + '</div>';
    } else {
        histHtml = '<div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:12px;margin-bottom:16px;color:#666;text-align:center;font-size:12px;">Belum ada riwayat untuk agent ini</div>';
    }
    overlay.innerHTML = '<div style="background:#1a1a2e;border-radius:20px;padding:30px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;border:1px solid rgba(0,255,163,0.2);">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;"><div><h3 style="color:#00FFA3;margin:0 0 4px 0;font-size:20px;">' + escapeHtml(agent.agent) + '</h3><div style="color:#A0B3C9;font-size:12px;">Detail Performa Agent</div></div>' +
        '<button class="close-detail-btn" style="background:rgba(255,255,255,0.05);border:none;color:#A0B3C9;font-size:20px;cursor:pointer;padding:4px 12px;border-radius:8px;">✕</button></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">' +
        '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;text-align:center;"><div style="font-size:32px;font-weight:bold;color:' + (rate >= 70 ? '#2ecc71' : '#f39c12') + ';">' + rate + '%</div><div style="font-size:10px;color:#A0B3C9;margin-top:4px;">Approval Rate</div></div>' +
        '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;text-align:center;"><div style="font-size:32px;font-weight:bold;color:#00FFA3;">' + threshold + '%</div><div style="font-size:10px;color:#A0B3C9;margin-top:4px;">Adaptive Threshold</div></div></div>' +
        '<div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:12px;margin-bottom:16px;"><div style="font-size:11px;color:#A0B3C9;margin-bottom:4px;">Status</div><div style="font-weight:bold;color:' + statusColor + ';font-size:15px;">' + status + '</div></div>' +
        histHtml +
        '<div style="display:flex;gap:8px;"><button class="close-detail-btn-2" style="flex:1;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:30px;color:#A0B3C9;cursor:pointer;">Tutup</button>' +
        '<button class="compare-agent-btn" style="flex:1;padding:10px;background:rgba(0,255,163,0.1);border:1px solid rgba(0,255,163,0.3);border-radius:30px;color:#00FFA3;cursor:pointer;">Bandingkan</button></div></div>';
    document.body.appendChild(overlay);
    const close = function() { overlay.remove(); };
    const b1 = overlay.querySelector('.close-detail-btn');
    const b2 = overlay.querySelector('.close-detail-btn-2');
    const cmp = overlay.querySelector('.compare-agent-btn');
    if (b1) b1.addEventListener('click', close);
    if (b2) b2.addEventListener('click', close);
    if (cmp) cmp.addEventListener('click', function() { overlay.remove(); toggleCompareMode(agent.agent); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}

function toggleCompareMode(agentName) {
    if (!_state.isCompareMode) { _state.isCompareMode = true; _state.compareAgents = [agentName]; showToast('Mode Compare: Pilih agent lain untuk dibandingkan', 'info'); render(); return; }
    if (_state.compareAgents.includes(agentName)) {
        _state.compareAgents = _state.compareAgents.filter(function(a) { return a !== agentName; });
        if (_state.compareAgents.length === 0) _state.isCompareMode = false;
        render(); return;
    }
    _state.compareAgents.push(agentName);
    if (_state.compareAgents.length >= 3) _state.compareAgents.shift();
    render();
    showToast('Membandingkan: ' + _state.compareAgents.join(', '), 'info');
}

function getPredictiveInsight(agentRanking) {
    if (agentRanking.length === 0) return null;
    const insights = agentRanking.map(function(a) {
        const rate = a.approvalRate || 0;
        const threshold = a.recThreshold || 70;
        const gap = rate - threshold;
        let trend = 'Stabil', recommendation = 'Pertahankan performa', confidence = '70%';
        if (gap >= 15) { trend = 'Sangat Baik (melewati threshold 15%+)'; recommendation = 'Agent ini layak diberikan tugas lebih kompleks'; confidence = '90%'; }
        else if (gap >= 5) { trend = 'Baik (melewati threshold)'; recommendation = 'Agent ini konsisten, tingkatkan tantangan secara bertahap'; confidence = '80%'; }
        else if (gap >= -5) { trend = 'Di sekitar threshold'; recommendation = 'Perlu monitoring ketat, threshold mungkin perlu disesuaikan'; confidence = '65%'; }
        else if (gap >= -15) { trend = 'Di bawah threshold (5-15%)'; recommendation = 'Agent ini perlu evaluasi ulang atau pelatihan tambahan'; confidence = '75%'; }
        else { trend = 'Sangat Di Bawah Threshold (15%+)'; recommendation = 'Agent ini perlu perbaikan signifikan atau diganti'; confidence = '85%'; }
        return { agent: a.agent, trend: trend, recommendation: recommendation, confidence: confidence, gap: gap };
    });
    insights.sort(function(a, b) { return b.gap - a.gap; });
    return insights;
}

function exportCSV(agentRanking) {
    if (agentRanking.length === 0) { showToast('Tidak ada data untuk diekspor', 'warning'); return; }
    let csv = 'Rank,Agent,Approval Rate,Adaptive Threshold,Status,Gap\n';
    agentRanking.forEach(function(a, i) {
        const rate = a.approvalRate || 0, threshold = a.recThreshold || 70, gap = rate - threshold;
        const status = rate >= threshold ? 'High Performer' : (rate >= threshold * 0.7 ? 'Developing' : 'Needs Improvement');
        csv += (i + 1) + ',' + a.agent + ',' + rate + '%,' + threshold + '%,' + status + ',' + gap + '%\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'auto_learning_' + Date.now() + '.csv'; link.click();
    URL.revokeObjectURL(url);
    showToast('CSV berhasil diekspor!', 'success');
}

function exportJSON(agentRanking) {
    if (agentRanking.length === 0) { showToast('Tidak ada data untuk diekspor', 'warning'); return; }
    const data = { exportedAt: new Date().toISOString(), totalAgents: agentRanking.length, ranking: agentRanking, history: _state.historyData.slice(-50), insights: getPredictiveInsight(agentRanking) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'auto_learning_' + Date.now() + '.json'; link.click();
    URL.revokeObjectURL(url);
    showToast('JSON berhasil diekspor!', 'success');
}

function exportChartPNG() {
    const canvas = document.getElementById('learningChart');
    if (!canvas) { showToast('Chart tidak ditemukan', 'error'); return; }
    const link = document.createElement('a');
    link.download = 'learning_chart_' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Chart berhasil diekspor!', 'success');
}

function shareData(agentRanking) {
    if (!navigator.share) { showToast('Share tidak didukung di browser ini', 'warning'); return; }
    const topAgents = agentRanking.slice(0, 5).map(function(a) { return a.agent + ': ' + a.approvalRate + '%'; }).join('\n');
    navigator.share({ title: 'KESEMPATAN OS - Auto-Learning Stats', text: 'Auto-Learning Performance Report\n\nTop 5 Agents:\n' + topAgents + '\n\nTotal Agents: ' + agentRanking.length + '\n' + new Date().toLocaleDateString(), url: window.location.href })
        .then(function() { showToast('Berhasil dibagikan!', 'success'); })
        .catch(function(e) { console.warn('[AutoLearning] shareData cancelled/failed:', e.message); });
}

function setupEventDelegation(container, agentRanking) {
    const handler = function(e) {
        const target = e.target.closest('.agent-name-click');
        if (target) { const found = agentRanking.find(function(a) { return a.agent === target.dataset.agent; }); if (found) showAgentDetail(found); return; }
        const cmp = e.target.closest('.compare-toggle-btn');
        if (cmp) { toggleCompareMode(cmp.dataset.agent); }
    };
    container.addEventListener('click', handler);
    return handler;
}

function render() {
    if (_state.isRendering) return;
    _state.isRendering = true;
    const inner = document.getElementById('pageInner');
    if (!inner) { _state.isRendering = false; InternalLogger.warn('AutoLearning', 'Container #pageInner tidak ditemukan'); return; }

    let stats = {};
    try { stats = (window.AutoLearning && typeof window.AutoLearning.getOverallStats === 'function') ? window.AutoLearning.getOverallStats() : {}; }
    catch (e) { stats = { total: 0, approved: 0, rejectionRate: 0, agentRanking: [] }; InternalLogger.error('AutoLearning', 'Gagal mengambil stats: ' + e.message); }
    try { _state.historyData = (window.AutoLearning && typeof window.AutoLearning.getHistory === 'function') ? window.AutoLearning.getHistory() : []; }
    catch (e) { _state.historyData = []; }

    const total = stats.total || 0, approved = stats.approved || 0, rejectionRate = stats.rejectionRate || 0;
    let agentRanking = Array.isArray(stats.agentRanking) ? stats.agentRanking : [];

    if (_state.currentSearch) { const s = _state.currentSearch.toLowerCase(); agentRanking = agentRanking.filter(function(a) { return (a.agent || '').toLowerCase().includes(s); }); }
    if (_state.currentFilter !== 'all') {
        agentRanking = agentRanking.filter(function(a) {
            const r = a.approvalRate || 0;
            if (_state.currentFilter === 'high') return r >= 80;
            if (_state.currentFilter === 'developing') return r >= 60 && r < 80;
            if (_state.currentFilter === 'needs') return r < 60;
            return true;
        });
    }
    if (_state.currentApprovalFilter !== 'all') {
        const ap = new Set(), rj = new Set();
        _state.historyData.forEach(function(h) { if (h.approved) ap.add(h.agent); else rj.add(h.agent); });
        agentRanking = agentRanking.filter(function(a) {
            if (_state.currentApprovalFilter === 'approved') return ap.has(a.agent);
            if (_state.currentApprovalFilter === 'rejected') return rj.has(a.agent);
            return true;
        });
    }

    const insights = getPredictiveInsight(agentRanking);
    const compareLabel = _state.isCompareMode ? ' | Mode Compare: ' + _state.compareAgents.join(', ') : '';
    const historyNote = _state.historyData.length > 0 ? '<div style="font-size:9px;color:#666;margin-top:2px;">' + _state.historyData.length + ' tercatat</div>' : '';
    const pctApproved = total > 0 ? Math.round((approved / total) * 100) + '% dari total' : '';
    const rejectedCount = total - approved;
    const insightCount = insights ? insights.filter(function(i) { return i.gap >= 5; }).length : 0;

    let html = '<div style="padding:20px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">';
    html += '<div><h3 style="color:#00FFA3;margin:0 0 4px 0;font-size:20px;">Auto-Learning Statistics</h3><p style="color:#A0B3C9;font-size:12px;margin:0;">Sistem pembelajaran otomatis dari keputusan HITL' + compareLabel + '</p></div>';
    html += '<button id="toggleCompareBtn" class="execute-btn secondary" style="padding:4px 14px;font-size:11px;white-space:nowrap;">' + (_state.isCompareMode ? 'Exit Compare' : 'Compare Mode') + '</button></div>';
    html += '<div class="filter-stats" style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">';
    html += '<div class="filter-card" style="background:rgba(0,255,163,0.05);border-radius:12px;padding:12px 20px;min-width:100px;text-align:center;border:1px solid rgba(0,255,163,0.1);flex:1;"><div class="filter-number" style="font-size:28px;font-weight:bold;color:#00FFA3;">' + total + '</div><div style="font-size:10px;color:#A0B3C9;text-transform:uppercase;">Total Keputusan</div>' + historyNote + '</div>';
    html += '<div class="filter-card" style="background:rgba(46,204,113,0.05);border-radius:12px;padding:12px 20px;min-width:100px;text-align:center;border:1px solid rgba(46,204,113,0.1);flex:1;"><div class="filter-number" style="font-size:28px;font-weight:bold;color:#2ecc71;">' + approved + '</div><div style="font-size:10px;color:#A0B3C9;text-transform:uppercase;">Disetujui</div>' + (total > 0 ? '<div style="font-size:9px;color:#666;margin-top:2px;">' + pctApproved + '</div>' : '') + '</div>';
    html += '<div class="filter-card" style="background:rgba(231,76,60,0.05);border-radius:12px;padding:12px 20px;min-width:100px;text-align:center;border:1px solid rgba(231,76,60,0.1);flex:1;"><div class="filter-number" style="font-size:28px;font-weight:bold;color:#e74c3c;">' + rejectionRate + '%</div><div style="font-size:10px;color:#A0B3C9;text-transform:uppercase;">Rejection Rate</div>' + (total > 0 ? '<div style="font-size:9px;color:#666;margin-top:2px;">' + rejectedCount + ' ditolak</div>' : '') + '</div>';
    html += '<div class="filter-card" style="background:rgba(52,152,219,0.05);border-radius:12px;padding:12px 20px;min-width:100px;text-align:center;border:1px solid rgba(52,152,219,0.1);flex:1;"><div class="filter-number" style="font-size:28px;font-weight:bold;color:#3498db;">' + agentRanking.length + '</div><div style="font-size:10px;color:#A0B3C9;text-transform:uppercase;">Agent Aktif</div>' + (insights ? '<div style="font-size:9px;color:#666;margin-top:2px;">' + insightCount + ' di atas threshold</div>' : '') + '</div></div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">';
    html += '<div style="flex:1;min-width:150px;"><input type="text" id="searchAgentInput" placeholder="Cari agent..." value="' + escapeHtml(_state.currentSearch) + '" style="width:100%;padding:8px 12px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,163,0.2);border-radius:8px;color:white;font-size:12px;"></div>';
    html += '<select id="filterPerformanceSelect" style="padding:8px 12px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,163,0.2);border-radius:8px;color:#A0B3C9;font-size:12px;"><option value="all"' + (_state.currentFilter === 'all' ? ' selected' : '') + '>Semua Performa</option><option value="high"' + (_state.currentFilter === 'high' ? ' selected' : '') + '>High Performer (≥80%)</option><option value="developing"' + (_state.currentFilter === 'developing' ? ' selected' : '') + '>Developing (60-79%)</option><option value="needs"' + (_state.currentFilter === 'needs' ? ' selected' : '') + '>Needs Improvement (&lt;60%)</option></select>';
    html += '<select id="filterApprovalSelect" style="padding:8px 12px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,163,0.2);border-radius:8px;color:#A0B3C9;font-size:12px;"><option value="all"' + (_state.currentApprovalFilter === 'all' ? ' selected' : '') + '>Semua Status</option><option value="approved"' + (_state.currentApprovalFilter === 'approved' ? ' selected' : '') + '>Approved</option><option value="rejected"' + (_state.currentApprovalFilter === 'rejected' ? ' selected' : '') + '>Rejected</option></select></div>';
    html += '<div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:16px;margin-bottom:16px;"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;"><h4 style="color:#A0B3C9;margin:0;font-size:13px;">Approval Rate vs Threshold</h4><div style="display:flex;gap:6px;"><button id="exportChartBtn" class="execute-btn secondary" style="padding:2px 10px;font-size:9px;">PNG</button>' + (agentRanking.length > 0 ? '<span style="color:#666;font-size:10px;">Klik bar untuk detail</span>' : '') + '</div></div><div style="position:relative;width:100%;height:220px;"><canvas id="learningChart" style="width:100%;height:100%;"></canvas></div></div>';

    if (insights && insights.length > 0) {
        let cards = '';
        insights.slice(0, 4).forEach(function(i) {
            const color = i.gap >= 5 ? '#2ecc71' : (i.gap >= -5 ? '#f39c12' : '#e74c3c');
            cards += '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:10px;border-left:3px solid ' + color + ';"><div style="color:#00FFA3;font-weight:500;font-size:12px;">' + escapeHtml(i.agent) + '</div><div style="color:#A0B3C9;font-size:10px;">' + i.trend + '</div><div style="color:' + color + ';font-size:9px;margin-top:2px;">' + i.recommendation + '</div><div style="color:#666;font-size:8px;margin-top:2px;">Confidence: ' + i.confidence + '</div></div>';
        });
        html += '<div style="background:rgba(0,255,163,0.03);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(0,255,163,0.08);"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;"><h4 style="color:#00FFA3;margin:0;font-size:13px;">Predictive Insights</h4><span style="color:#666;font-size:9px;">Berdasarkan performa terkini</span></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:8px;">' + cards + '</div></div>';
    }

    html += '<div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:16px;overflow-x:auto;"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;"><h4 style="color:#00FFA3;margin:0;font-size:14px;">Agent Performance Ranking</h4><div style="display:flex;gap:6px;flex-wrap:wrap;"><button id="exportCSVBtn" class="execute-btn secondary" style="padding:2px 10px;font-size:9px;">CSV</button><button id="exportJSONBtn" class="execute-btn secondary" style="padding:2px 10px;font-size:9px;">JSON</button><button id="shareBtn" class="execute-btn secondary" style="padding:2px 10px;font-size:9px;">Share</button></div></div>';

    if (agentRanking.length === 0) {
        let filterNote = '';
        if (_state.currentSearch || _state.currentFilter !== 'all') {
            filterNote = '<div style="margin-top:8px;font-size:11px;color:#f39c12;">Filter aktif: ' + (_state.currentSearch ? '"' + _state.currentSearch + '"' : '') + (_state.currentFilter !== 'all' ? ' | ' + _state.currentFilter : '') + ' <button id="clearFiltersBtn" style="background:transparent;border:none;color:#00FFA3;cursor:pointer;text-decoration:underline;font-size:11px;">Hapus filter</button></div>';
        }
        html += '<div style="color:#666;text-align:center;padding:20px;">Belum ada data pembelajaran. Jalankan analisis dengan HITL terlebih dahulu.<div style="margin-top:12px;font-size:12px;color:#A0B3C9;">Tips: Buka Dashboard → Pilih agen → Jalankan analisis dengan mode HITL, lalu approve/reject hasilnya</div>' + filterNote + '</div>';
    } else {
        let rows = '';
        agentRanking.forEach(function(a, index) {
            const rate = a.approvalRate || 0, threshold = a.recThreshold || 70;
            const status = rate >= threshold ? 'High Performer' : (rate >= threshold * 0.7 ? 'Developing' : 'Needs Improvement');
            const statusColor = rate >= threshold ? '#2ecc71' : (rate >= threshold * 0.7 ? '#f39c12' : '#e74c3c');
            const isComparing = _state.isCompareMode && _state.compareAgents.includes(a.agent);
            rows += '<tr style="border-bottom:1px solid rgba(255,255,255,0.03);' + (isComparing ? 'background:rgba(0,255,163,0.05);' : '') + '"><td style="padding:8px 12px;color:#666;font-weight:bold;">' + (isComparing ? '✓' : '#' + (index + 1)) + '</td><td style="padding:8px 12px;color:#00FFA3;font-weight:500;cursor:pointer;" class="agent-name-click" data-agent="' + escapeHtml(a.agent) + '">' + escapeHtml(a.agent || 'Unknown') + '</td><td style="text-align:center;padding:8px 12px;"><div style="display:flex;align-items:center;gap:8px;justify-content:center;"><div style="width:80px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;"><div style="width:' + Math.min(100, rate) + '%;height:100%;background:' + (rate >= 70 ? '#2ecc71' : '#f39c12') + ';border-radius:3px;"></div></div><span style="font-weight:bold;color:' + (rate >= 70 ? '#2ecc71' : '#f39c12') + ';">' + rate + '%</span></div></td><td style="text-align:center;padding:8px 12px;color:#00FFA3;font-weight:bold;">' + threshold + '%</td><td style="text-align:center;padding:8px 12px;color:' + statusColor + ';font-size:12px;">' + status + '</td><td style="text-align:center;padding:8px 12px;"><button class="compare-toggle-btn" data-agent="' + escapeHtml(a.agent) + '" style="background:' + (isComparing ? 'rgba(0,255,163,0.2)' : 'rgba(255,255,255,0.05)') + ';border:' + (isComparing ? '1px solid #00FFA3' : '1px solid rgba(255,255,255,0.1)') + ';border-radius:12px;padding:2px 10px;color:' + (isComparing ? '#00FFA3' : '#A0B3C9') + ';cursor:pointer;font-size:10px;">' + (isComparing ? '✓ Compare' : 'Compare') + '</button></td></tr>';
        });
        html += '<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="border-bottom:2px solid rgba(0,255,163,0.1);"><th style="text-align:left;padding:8px 12px;color:#A0B3C9;font-weight:500;">Rank</th><th style="text-align:left;padding:8px 12px;color:#A0B3C9;font-weight:500;">Agent</th><th style="text-align:center;padding:8px 12px;color:#A0B3C9;font-weight:500;">Approval Rate</th><th style="text-align:center;padding:8px 12px;color:#A0B3C9;font-weight:500;">Adaptive Threshold</th><th style="text-align:center;padding:8px 12px;color:#A0B3C9;font-weight:500;">Status</th><th style="text-align:center;padding:8px 12px;color:#A0B3C9;font-weight:500;">Action</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }
    html += '</div>';

    if (_state.historyData.length > 0) {
        let items = '';
        _state.historyData.slice(-20).reverse().forEach(function(item) {
            const color = item.approved ? '#2ecc71' : '#e74c3c';
            items += '<div style="display:flex;align-items:center;gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:12px;"><span style="color:#00FFA3;font-weight:500;">' + escapeHtml(item.agent || 'Unknown') + '</span><span style="color:' + color + ';font-weight:bold;font-size:11px;">' + (item.approved ? 'APPROVED' : 'REJECTED') + '</span>' + (item.confidence ? '<span style="color:#666;font-size:10px;">Conf: ' + item.confidence + '%</span>' : '') + '<span style="color:#666;font-size:10px;margin-left:auto;">' + new Date(item.timestamp).toLocaleTimeString() + '</span></div>';
        });
        html += '<div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:16px;margin-top:16px;"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;"><h4 style="color:#A0B3C9;margin:0;font-size:13px;">Riwayat Keputusan (' + _state.historyData.length + ' terakhir)</h4><span style="color:#666;font-size:9px;">' + new Date().toLocaleString() + '</span></div><div style="max-height:150px;overflow-y:auto;">' + items + '</div></div>';
    }

    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;"><button id="resetLearningBtn" class="execute-btn secondary" style="border-color:#e74c3c;color:#e74c3c;padding:8px 20px;">Reset Learning Data</button><button id="refreshLearningBtn" class="execute-btn secondary" style="padding:8px 20px;">Refresh</button>' + (agentRanking.length > 0 ? '<button id="exportAllBtn" class="execute-btn secondary" style="padding:8px 20px;border-color:#3498db;color:#3498db;">Export All</button>' : '') + '</div>';
    html += '<div style="font-size:10px;color:#444;margin-top:16px;border-top:1px solid rgba(255,255,255,0.05);padding-top:12px;text-align:center;">Data diperbarui otomatis setiap kali HITL memberikan keputusan' + compareLabel + '</div></div>';

    inner.innerHTML = html;

    setTimeout(function() { renderChart(agentRanking); }, 100);

    const container = inner.querySelector('div');
    if (container) {
        const delegationHandler = setupEventDelegation(container, agentRanking);
        _state.handlers.push({ element: container, event: 'click', handler: delegationHandler });
    }

    const searchInput = document.getElementById('searchAgentInput');
    if (searchInput) {
        const h = function(e) { _state.currentSearch = e.target.value; render(); };
        searchInput.addEventListener('input', h);
        _state.handlers.push({ element: searchInput, event: 'input', handler: h });
    }
    const filterPerf = document.getElementById('filterPerformanceSelect');
    if (filterPerf) {
        const h = function(e) { _state.currentFilter = e.target.value; render(); };
        filterPerf.addEventListener('change', h);
        _state.handlers.push({ element: filterPerf, event: 'change', handler: h });
    }
    const filterApproval = document.getElementById('filterApprovalSelect');
    if (filterApproval) {
        const h = function(e) { _state.currentApprovalFilter = e.target.value; render(); };
        filterApproval.addEventListener('change', h);
        _state.handlers.push({ element: filterApproval, event: 'change', handler: h });
    }
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        const h = function() { _state.currentSearch = ''; _state.currentFilter = 'all'; _state.currentApprovalFilter = 'all'; render(); };
        clearFiltersBtn.addEventListener('click', h);
        _state.handlers.push({ element: clearFiltersBtn, event: 'click', handler: h });
    }
    const toggleCompareBtn = document.getElementById('toggleCompareBtn');
    if (toggleCompareBtn) {
        const h = function() {
            if (_state.isCompareMode) { _state.isCompareMode = false; _state.compareAgents = []; }
            else { _state.isCompareMode = true; showToast('Mode Compare: Klik tombol Compare di tabel', 'info'); }
            render();
        };
        toggleCompareBtn.addEventListener('click', h);
        _state.handlers.push({ element: toggleCompareBtn, event: 'click', handler: h });
    }
    const resetBtn = document.getElementById('resetLearningBtn');
    if (resetBtn) {
        const h = function() {
            showConfirmDialog('Reset Data Pembelajaran', 'Semua data pembelajaran (approval rate, adaptive threshold, agent ranking) akan dihapus permanen. Yakin?', async function() {
                try {
                    if (window.AutoLearning && window.AutoLearning.reset) await window.AutoLearning.reset();
                    _state.historyData = [];
                    showToast('Data pembelajaran direset!', 'success');
                    render();
                } catch (e) { showToast('Gagal reset: ' + e.message, 'error'); }
            });
        };
        resetBtn.addEventListener('click', h);
        _state.handlers.push({ element: resetBtn, event: 'click', handler: h });
    }
    const refreshBtn = document.getElementById('refreshLearningBtn');
    if (refreshBtn) {
        const h = function() { showToast('Data direfresh', 'info'); render(); };
        refreshBtn.addEventListener('click', h);
        _state.handlers.push({ element: refreshBtn, event: 'click', handler: h });
    }
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    if (exportCSVBtn) { const h = function() { exportCSV(agentRanking); }; exportCSVBtn.addEventListener('click', h); _state.handlers.push({ element: exportCSVBtn, event: 'click', handler: h }); }
    const exportJSONBtn = document.getElementById('exportJSONBtn');
    if (exportJSONBtn) { const h = function() { exportJSON(agentRanking); }; exportJSONBtn.addEventListener('click', h); _state.handlers.push({ element: exportJSONBtn, event: 'click', handler: h }); }
    const exportChartBtn = document.getElementById('exportChartBtn');
    if (exportChartBtn) { const h = function() { exportChartPNG(); }; exportChartBtn.addEventListener('click', h); _state.handlers.push({ element: exportChartBtn, event: 'click', handler: h }); }
    const exportAllBtn = document.getElementById('exportAllBtn');
    if (exportAllBtn) {
        const h = function() {
            showConfirmDialog('Export All Data', 'Ekspor semua data termasuk ranking, history, dan insights?', function() {
                exportJSON(agentRanking);
                setTimeout(function() { exportCSV(agentRanking); }, 500);
                setTimeout(function() { exportChartPNG(); }, 1000);
            }, 'Ya, Export Semua');
        };
        exportAllBtn.addEventListener('click', h);
        _state.handlers.push({ element: exportAllBtn, event: 'click', handler: h });
    }
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) { const h = function() { shareData(agentRanking); }; shareBtn.addEventListener('click', h); _state.handlers.push({ element: shareBtn, event: 'click', handler: h }); }

    if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    _state.intervalId = setInterval(function() {
        const cur = document.getElementById('pageInner');
        if (cur && cur.parentElement && cur.parentElement.style.display !== 'none' && cur.querySelector('.filter-stats')) render();
    }, 30000);

    _state.isRendering = false;
    InternalLogger.info('AutoLearning', 'Render complete - ' + agentRanking.length + ' agents');
}

function destroy() {
    if (_state.chartInstance) { _state.chartInstance.destroy(); _state.chartInstance = null; }
    (_state.handlers || []).forEach(function(h) { if (h.element && h.element.removeEventListener) h.element.removeEventListener(h.event, h.handler); });
    _state.handlers = [];
    if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    _state.isRendering = false;
}

export const LearningPage = {
    render: render,
    destroy: destroy,
    exportCSV: exportCSV,
    exportJSON: exportJSON,
    exportChartPNG: exportChartPNG,
    shareData: shareData,
    toggleCompareMode: toggleCompareMode,
    getState: function() {
        return { isCompareMode: _state.isCompareMode, compareAgents: _state.compareAgents.slice(), currentFilter: _state.currentFilter, currentSearch: _state.currentSearch, historyCount: _state.historyData.length };
    }
};
KESEMPATAN.LearningPage = LearningPage;


function loadChartJS() {
    if (typeof Chart !== 'undefined') return Promise.resolve();
    return new Promise(function(resolve) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.onload = function() { resolve(); };
        s.onerror = function() { resolve(); };
        document.head.appendChild(s);
    });
}

loadChartJS().then(function() {
    const inner = document.getElementById('pageInner');
    if (inner && inner.parentElement && inner.parentElement.style.display !== 'none') render();
});

window.addEventListener('beforeunload', function() { destroy(); });
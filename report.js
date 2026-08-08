(function() {
'use strict';
if (window.__ReportPageLoaded) return;
window.__ReportPageLoaded = true;

const Utils = window.Utils || {};
const showToast = Utils.showToast || function(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    const colors = { error: '#e74c3c', success: '#2ecc71', warning: '#f39c12', info: '#3498db' };
    toast.style.borderLeftColor = colors[type] || '#00FFA3';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
};

function escapeHtml(text) {
    if (!text) return '';
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(text);
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function simpleHash(obj) {
    if (!obj) return 'empty';
    try {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    } catch (e) {
        return 'error' + Date.now().toString(36);
    }
}

function injectBorderCSS() {
    if (document.getElementById('reportBorderStyle')) return;
    const style = document.createElement('style');
    style.id = 'reportBorderStyle';
    style.textContent =
        ':root{--rp-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--rp-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--rp-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));}' +
        '.rp-b{position:relative;isolation:isolate;clip-path:var(--rp-clip);background:rgba(26,255,156,.3);padding:1px;margin-bottom:14px;}' +
        '.rp-b::before{content:"";position:absolute;inset:1px;clip-path:var(--rp-clip);background:#0a1118;z-index:-1;}' +
        '.rp-in{display:block;padding:16px;}' +
        '.rp-div{height:1px;background:rgba(224,230,237,.14);margin:14px 0;}' +
        '.rp-h4{font-size:13px;font-weight:800;margin:0 0 8px;}' +
        '.rp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}' +
        '@media (max-width:640px){.rp-grid2{grid-template-columns:1fr;}}' +
        '.rp-score-num{font-size:44px;font-weight:800;line-height:1;}' +
        '.rp-score-lbl{font-size:10px;color:#A0B3C9;text-transform:uppercase;letter-spacing:.5px;margin-top:6px;}' +
        '.rp-score-st{font-size:11px;margin-top:4px;}' +
        '.rp-ba{position:relative;isolation:isolate;clip-path:var(--rp-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:6px 14px;color:var(--primary,#00FFA3);font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;}' +
        '.rp-ba::before{content:"";position:absolute;inset:1px;clip-path:var(--rp-clip-asym);background:#0a1118;z-index:-1;}' +
        '.rp-ba:active{transform:scale(.97);}' +
        '.rp-ba.danger{background:rgba(231,76,60,.5);color:#FF8080;}' +
        '.rp-ba.danger::before{background:#160608;}' +
        '@media (hover:hover) and (pointer:fine){.rp-ba:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.3));}}';
    document.head.appendChild(style);
}

const _state = {
    chartInstance: null,
    intervalId: null,
    handlers: [],
    isRendering: false,
    lastDataHash: null,
    autoRefreshInterval: 30000,
    isPageVisible: true
};

function showConfirmDialog(title, message, onConfirm, confirmText) {
    confirmText = confirmText || 'Ya, Hapus';
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

function renderChart(metrics) {
    const canvas = document.getElementById('reportMetricsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (_state.chartInstance) { _state.chartInstance.destroy(); _state.chartInstance = null; }
    if (!metrics || Object.keys(metrics).length === 0) {
        ctx.fillStyle = '#666'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Belum ada metrik untuk chart', canvas.width / 2, canvas.height / 2 + 4);
        return;
    }
    if (typeof Chart === 'undefined') {
        ctx.fillStyle = '#666'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Chart.js tidak tersedia', canvas.width / 2, canvas.height / 2 + 4);
        return;
    }
    const metricKeys = ['demand', 'competition', 'monetization', 'virality', 'sustainability', 'scalability', 'timing', 'attention', 'execution', 'longterm'];
    const names = { demand: 'Demand', competition: 'Competition', monetization: 'Monetization', virality: 'Virality', sustainability: 'Sustainability', scalability: 'Scalability', timing: 'Timing', attention: 'Attention', execution: 'Execution', longterm: 'Long-Term' };
    const labels = metricKeys.map(function(k) { return names[k] || k; });
    const data = metricKeys.map(function(k) { return metrics[k] || 0; });
    _state.chartInstance = new Chart(ctx, {
        type: 'radar',
        data: { labels: labels, datasets: [{ label: 'Metrics Score', data: data, backgroundColor: 'rgba(0,255,163,0.15)', borderColor: '#00FFA3', borderWidth: 2, pointBackgroundColor: '#00FFA3', pointRadius: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#A0B3C9', font: { size: 11, family: 'Inter' } } } },
            scales: { r: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, angleLines: { color: 'rgba(255,255,255,0.05)' }, pointLabels: { color: '#A0B3C9', font: { size: 10 } }, ticks: { color: '#666', backdropColor: 'transparent', font: { size: 9 } } } }
        }
    });
}

function exportReportJSON(agg) {
    if (!agg) { showToast('Tidak ada laporan untuk diekspor', 'warning'); return; }
    const data = { exportedAt: new Date().toISOString(), report: agg, metrics: agg.metrics || {}, score: agg.score || 0, insights: agg.insight || [], strategies: agg.strategy || [], risks: agg.risk || [], recommendation: agg.recommendation || '' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'report_' + Date.now() + '.json'; link.click();
    URL.revokeObjectURL(url);
    showToast('Laporan berhasil diekspor!', 'success');
}

function exportReportCSV(agg) {
    if (!agg) { showToast('Tidak ada laporan untuk diekspor', 'warning'); return; }
    const metrics = agg.metrics || {};
    let csv = 'Metric,Score\n';
    const metricNames = { demand: 'Demand', competition: 'Competition', monetization: 'Monetization', virality: 'Virality', sustainability: 'Sustainability', scalability: 'Scalability', timing: 'Timing', attention: 'Attention', execution: 'Execution', longterm: 'Long-Term' };
    Object.keys(metricNames).forEach(function(key) { csv += metricNames[key] + ',' + (metrics[key] || 0) + '\n'; });
    csv += '\nFinal Score,' + (agg.score || 0) + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'report_' + Date.now() + '.csv'; link.click();
    URL.revokeObjectURL(url);
    showToast('CSV berhasil diekspor!', 'success');
}

function exportChartPNG() {
    const canvas = document.getElementById('reportMetricsChart');
    if (!canvas) { showToast('Chart tidak ditemukan', 'error'); return; }
    const link = document.createElement('a');
    link.download = 'report_chart_' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Chart berhasil diekspor!', 'success');
}

function shareReport(agg) {
    if (!navigator.share) { showToast('Share tidak didukung di browser ini', 'warning'); return; }
    navigator.share({
        title: 'KESEMPATAN OS - Report',
        text: 'Intelligence Report\n\nScore: ' + (agg.score || 0) + '/100\n\n' + (agg.summary || '') + '\n\nInsights: ' + (agg.insight || []).slice(0, 3).join(', '),
        url: window.location.href
    }).then(function() { showToast('Berhasil dibagikan!', 'success'); }).catch(function() {});
}

function setupAutoRefresh() {
    if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    _state.intervalId = setInterval(function() {
        if (!_state.isPageVisible) return;
        const inner = document.getElementById('pageInner');
        if (!inner || !inner.parentElement) return;
        if (inner.parentElement.style.display === 'none') return;
        const newData = window.lastAggregated || window.__lastAggregated || null;
        const newHash = simpleHash(newData);
        if (newHash !== _state.lastDataHash) {
            _state.lastDataHash = newHash;
            render();
        }
    }, _state.autoRefreshInterval);
}

function setupPageVisibility() {
    const handler = function() {
        _state.isPageVisible = !document.hidden;
        if (_state.isPageVisible) setupAutoRefresh();
        else if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    };
    document.addEventListener('visibilitychange', handler);
    return handler;
}

function setupEventDelegation(container, agg) {
    const handler = function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const id = target.id;
        const handlers = {
            'refreshReportBtn': function() { showToast('Laporan direfresh', 'info'); render(); },
            'clearReportBtn': function() {
                showConfirmDialog('Clear Report', 'Laporan saat ini akan dihapus. Yakin?', function() {
                    try {
                        window.lastAggregated = null;
                        window.__lastAggregated = null;
                        localStorage.removeItem('kes_last_aggregated');
                        localStorage.removeItem('kes_report_history');
                        if (typeof window.resetReportDisplay === 'function') window.resetReportDisplay();
                        if (typeof window.renderHistoryPanel === 'function') window.renderHistoryPanel();
                        _state.lastDataHash = null;
                        showToast('Laporan dihapus', 'success');
                        render();
                    } catch (e2) { showToast('Gagal hapus: ' + e2.message, 'error'); }
                });
            },
            'gotoDashboardBtn': function() {
                if (typeof window.showPage === 'function') window.showPage('dashboard');
                else window.location.hash = '#dashboard';
            },
            'exportReportJSON': function() { exportReportJSON(agg); },
            'exportReportCSV': function() { exportReportCSV(agg); },
            'exportChartPNG': function() { exportChartPNG(); },
            'shareReportBtn': function() { shareReport(agg); },
            'printReportBtn': function() { window.print(); }
        };
        if (handlers[id]) handlers[id]();
    };
    container.addEventListener('click', handler);
    return handler;
}

function render() {
    if (_state.isRendering) return;
    _state.isRendering = true;
    injectBorderCSS();
    const inner = document.getElementById('pageInner');
    if (!inner) { _state.isRendering = false; return; }
    let agg = null;
    try { agg = window.lastAggregated || window.__lastAggregated || null; } catch (e) { agg = null; }
    _state.lastDataHash = simpleHash(agg);
    const hasData = agg && typeof agg === 'object' && agg.score !== undefined;
    const score = hasData ? (agg.score || 0) : 0;
    const summary = hasData ? (agg.summary || '') : '';
    const insights = hasData && Array.isArray(agg.insight) ? agg.insight : [];
    const strategies = hasData && Array.isArray(agg.strategy) ? agg.strategy : [];
    const risks = hasData && Array.isArray(agg.risk) ? agg.risk : [];
    const recommendation = hasData ? (agg.recommendation || '') : '';
    const metrics = hasData ? (agg.metrics || {}) : {};
    const timestamp = hasData ? (agg.timestamp || Date.now()) : Date.now();
    const scoreColor = score >= 70 ? '#2ecc71' : (score >= 50 ? '#f39c12' : '#e74c3c');
    let html = '<div style="padding:20px;" role="main" aria-label="Laporan Intelijen">';
    if (hasData) {
        html += '<div class="rp-b"><span class="rp-in">';
        html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">' +
            '<div><h3 style="color:#00FFA3;margin:0 0 4px 0;font-size:20px;" id="reportTitle">Final Intelligence Report</h3>' +
            '<p style="color:#A0B3C9;font-size:12px;margin:0;">Laporan agregasi dari agen-agen yang disetujui | ' + new Date(timestamp).toLocaleString() + (_state.isPageVisible ? '' : ' | Paused') + '</p></div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button id="exportReportJSON" class="rp-ba" aria-label="Ekspor sebagai JSON">JSON</button>' +
            '<button id="exportReportCSV" class="rp-ba" aria-label="Ekspor sebagai CSV">CSV</button>' +
            '<button id="exportChartPNG" class="rp-ba" aria-label="Ekspor chart sebagai PNG">PNG</button>' +
            '<button id="shareReportBtn" class="rp-ba" aria-label="Bagikan laporan">Share</button>' +
            '<button id="printReportBtn" class="rp-ba" aria-label="Cetak laporan">Print</button>' +
            '</div></div>';
        html += '<div class="rp-div"></div>';
        html += '<div style="text-align:center;padding:8px 0;" role="img" aria-label="Skor: ' + score + ' dari 100">' +
            '<div class="rp-score-num" style="color:' + scoreColor + ';">' + score + '</div>' +
            '<div class="rp-score-lbl">Final Score / 100</div>' +
            '<div class="rp-score-st" style="color:' + scoreColor + ';">' + (score >= 70 ? 'HIGH OPPORTUNITY' : (score >= 50 ? 'MODERATE OPPORTUNITY' : 'LOW OPPORTUNITY')) + '</div></div>';
        html += '<div class="rp-div"></div>';
        html += '<div><div style="font-size:12px;color:#A0B3C9;margin-bottom:4px;">Summary</div>' +
            '<div style="font-size:14px;line-height:1.5;">' + escapeHtml(summary) + '</div></div>';
        html += '<div class="rp-div"></div>';
        html += '<div><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">' +
            '<h4 class="rp-h4" style="color:#A0B3C9;margin:0;">Metrics Radar</h4><span style="color:#666;font-size:9px;">10 dimensi penilaian</span></div>' +
            '<div style="position:relative;width:100%;height:280px;"><canvas id="reportMetricsChart" style="width:100%;height:100%;"></canvas></div></div>';
        html += '<div class="rp-div"></div>';
        html += '<div class="rp-grid2">';
        if (insights.length > 0) {
            html += '<div><h4 class="rp-h4" style="color:#00FFA3;">Insights (' + insights.length + ')</h4>' +
                '<ul style="margin:0;padding-left:20px;color:#A0B3C9;font-size:12px;line-height:1.6;">' +
                insights.slice(0, 8).map(function(i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>' +
                (insights.length > 8 ? '<div style="color:#666;font-size:10px;margin-top:4px;">+ ' + (insights.length - 8) + ' lagi</div>' : '') + '</div>';
        }
        if (strategies.length > 0) {
            html += '<div><h4 class="rp-h4" style="color:#f39c12;">Strategies (' + strategies.length + ')</h4>' +
                '<ul style="margin:0;padding-left:20px;color:#A0B3C9;font-size:12px;line-height:1.6;">' +
                strategies.slice(0, 6).map(function(s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>' +
                (strategies.length > 6 ? '<div style="color:#666;font-size:10px;margin-top:4px;">+ ' + (strategies.length - 6) + ' lagi</div>' : '') + '</div>';
        }
        html += '</div>';
        if (risks.length > 0) {
            html += '<div class="rp-div"></div>';
            html += '<div><h4 class="rp-h4" style="color:#e74c3c;">Risks (' + risks.length + ')</h4>' +
                '<ul style="margin:0;padding-left:20px;color:#A0B3C9;font-size:12px;line-height:1.6;">' +
                risks.slice(0, 6).map(function(r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') + '</ul>' +
                (risks.length > 6 ? '<div style="color:#666;font-size:10px;margin-top:4px;">+ ' + (risks.length - 6) + ' lagi</div>' : '') + '</div>';
        }
        if (recommendation) {
            html += '<div class="rp-div"></div>';
            html += '<div><h4 class="rp-h4" style="color:#00FFA3;">Recommendation</h4>' +
                '<div style="color:#A0B3C9;font-size:13px;line-height:1.6;">' + escapeHtml(recommendation) + '</div></div>';
        }
        html += '<div class="rp-div"></div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:10px;">' +
            '<button id="refreshReportBtn" class="rp-ba" aria-label="Refresh laporan">Refresh</button>' +
            '<button id="clearReportBtn" class="rp-ba danger" aria-label="Hapus laporan">Clear Report</button></div>';
        html += '<div style="font-size:10px;color:#444;margin-top:14px;text-align:center;">Laporan dihasilkan dari ' + insights.length + ' insight, ' + strategies.length + ' strategi, ' + risks.length + ' risiko' + (_state.isPageVisible ? '' : ' | Auto-refresh paused') + '</div>';
        html += '</span></div>';
    } else {
        html += '<div role="region" aria-label="Belum ada laporan" style="color:#666;text-align:center;padding:60px 20px;">' +
            '<h4 style="color:#A0B3C9;margin:0 0 8px 0;">Belum ada laporan</h4>' +
            '<p style="font-size:13px;margin:0 0 16px 0;max-width:400px;margin-left:auto;margin-right:auto;">Jalankan START ENGINE dengan agen terpilih untuk menghasilkan laporan intelijen.</p>' +
            '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">' +
            '<button id="gotoDashboardBtn" class="rp-ba" aria-label="Ke Dashboard">Ke Dashboard</button>' +
            '<button id="refreshReportBtn" class="rp-ba" aria-label="Refresh">Refresh</button></div></div>';
    }
    html += '</div>';
    inner.innerHTML = html;
    setTimeout(function() { if (hasData && Object.keys(metrics).length > 0) renderChart(metrics); }, 150);
    const container = inner.querySelector('div');
    if (container) {
        const delegationHandler = setupEventDelegation(container, agg);
        _state.handlers.push({ element: container, event: 'click', handler: delegationHandler });
    }
    setupAutoRefresh();
    if (!window.__reportPageVisibilitySetup) {
        const visibilityHandler = setupPageVisibility();
        _state.handlers.push({ element: document, event: 'visibilitychange', handler: visibilityHandler });
        window.__reportPageVisibilitySetup = true;
    }
    _state.isRendering = false;
}

function destroy() {
    if (_state.chartInstance) { _state.chartInstance.destroy(); _state.chartInstance = null; }
    const handlers = _state.handlers || [];
    handlers.forEach(function(h) { if (h.element && h.element.removeEventListener) h.element.removeEventListener(h.event, h.handler); });
    _state.handlers = [];
    if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    window.__reportPageVisibilitySetup = false;
    _state.isRendering = false;
}

function loadChartJS() {
    if (typeof Chart !== 'undefined') return Promise.resolve();
    return new Promise(function(resolve) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = function() { resolve(); };
        script.onerror = function() { resolve(); };
        document.head.appendChild(script);
    });
}

function addPrintStyles() {
    if (document.getElementById('reportPrintStyles')) return;
    const style = document.createElement('style');
    style.id = 'reportPrintStyles';
    style.textContent = '@media print { .rp-ba { display: none !important; } #reportMetricsChart { height: 400px !important; } body { background: white !important; color: black !important; } }';
    document.head.appendChild(style);
}

window.ReportPage = {
    render: render,
    destroy: destroy,
    exportJSON: exportReportJSON,
    exportCSV: exportReportCSV,
    exportChartPNG: exportChartPNG,
    share: shareReport,
    print: function() { window.print(); }
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.ReportPage = window.ReportPage;

loadChartJS().then(function() {
    addPrintStyles();
    const inner = document.getElementById('pageInner');
    if (inner && inner.parentElement && inner.parentElement.style.display !== 'none') render();
});

window.addEventListener('beforeunload', function() { destroy(); });
})();
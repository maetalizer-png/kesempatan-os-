/**
TELEMETRY ANALYTICS - Self Contained Module
Gaya Observasion: transparan menyatu ke latar, bordir chamfer
BENTUK A/B TERSAMBUNG (teknik rim: outer warna garis + 1px,
inner ::before gelap opaque). Zero var, zero alert, zero console.log.
*/
(function() {
'use strict';
if (window.__TelemetryPageLoaded) return;
window.__TelemetryPageLoaded = true;
const Utils = window.Utils || {};
const showToast = Utils.showToast || function(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
    if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
};
const escapeHtml = window.escapeHtml || function(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
};

// ========== CSS (rim chamfer TERSAMBUNG) ==========
function injectCSS() {
    if (document.getElementById('telemetryStyle')) return;
    const s = document.createElement('style');
    s.id = 'telemetryStyle';
    s.textContent =
        ':root{--tl-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--tl-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);}' +
        '.tl-wrap{box-sizing:border-box;padding:4px 12px 16px;}' +
        '.tl-ch{display:flex;align-items:center;gap:10px;font-family:ui-monospace,monospace;font-size:10px;letter-spacing:2px;color:#00FFA3;margin:0 0 12px;}' +
        '.tl-ch::after{content:"";flex:1;height:1px;background:rgba(224,230,237,.08);}' +
        '.tl-head{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px;}' +
        '.tl-title{font-size:clamp(15px,4vw,19px);font-weight:800;color:#E0E6ED;}' +
        '.tl-sub{font-size:11px;color:#8fa3b8;margin-top:2px;}' +
        '.tl-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}' +
        '.tl-time{font-family:ui-monospace,monospace;font-size:9px;color:#5a6a7a;}' +
        /* RIM: luar = warna garis + 1px, dalam = gelap opaque => TERSAMBUNG */
        '.tl-b,.tl-ba{position:relative;isolation:isolate;}' +
        '.tl-b{clip-path:var(--tl-clip);background:rgba(26,255,156,.35);padding:1px;margin-bottom:14px;}' +
        '.tl-b::before{content:"";position:absolute;inset:1px;clip-path:var(--tl-clip);background:#0b1119;z-index:-1;}' +
        '.tl-ba{clip-path:var(--tl-clip-asym);background:rgba(26,255,156,.45);padding:9px 18px;border:0;color:#A0B3C9;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;}' +
        '.tl-ba::before{content:"";position:absolute;inset:1px;clip-path:var(--tl-clip-asym);background:#0b1119;z-index:-1;}' +
        '.tl-ba:active{transform:scale(.97);}' +
        '.tl-ba.danger{background:rgba(255,68,68,.5);color:#FF6B6B;}' +
        '.tl-ba.danger::before{background:#160608;}' +
        '.tl-in{display:block;padding:14px;}' +
        '.tl-in h4{margin:0 0 10px;font-size:11px;letter-spacing:1.5px;color:#A0B3C9;text-transform:uppercase;display:flex;gap:8px;align-items:center;}' +
        '.tl-in h4::before{content:"";width:3px;height:12px;background:#A0B3C9;}' +
        '.tl-strip{display:grid;grid-template-columns:repeat(4,1fr);}' +
        '.tl-cell{padding:14px 6px;text-align:center;border-left:1px solid rgba(224,230,237,.08);}' +
        '.tl-cell:first-child{border-left:0;}' +
        '.tl-num{font-size:24px;font-weight:800;color:#E0E6ED;}' +
        '.tl-lbl{font-size:9px;letter-spacing:1.5px;color:#7c8a99;text-transform:uppercase;margin-top:4px;}' +
        '.tl-heat-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(224,230,237,.08);}' +
        '.tl-heat-row:last-child{border-bottom:0;}' +
        '.tl-heat-name{flex:0 0 110px;font-size:11px;color:#cfe3d8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
        '.tl-dots{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}' +
        '.tl-dot{width:9px;height:9px;border-radius:50%;}' +
        '.tl-ms{margin-left:auto;font-family:ui-monospace,monospace;font-size:10px;color:#7c8a99;}' +
        '.tl-fail{font-size:9px;color:#FF6B6B;border:1px solid rgba(255,68,68,.3);border-radius:8px;padding:1px 6px;}' +
        '.tl-foot{font-size:9px;color:#5a6a7a;text-align:center;border-top:1px solid rgba(224,230,237,.08);padding-top:10px;margin-top:6px;}' +
        '@media (hover:hover) and (pointer:fine){.tl-ba:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.3));}}';
    document.head.appendChild(s);
}

let chartInstance = null;
let refreshInterval = null;
const REFRESH_INTERVAL_MS = 30000;

// ========== CONFIRM DIALOG ==========
function showConfirmDialog(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e;border-radius:16px;padding:24px;max-width:400px;width:90%;border:1px solid rgba(0,255,163,0.2);';
    box.innerHTML = '<h3 style="color:#FF6B6B;margin:0 0 8px 0;font-size:16px;">' + escapeHtml(title) + '</h3>' +
        '<p style="color:#A0B3C9;margin:0 0 20px 0;font-size:13px;line-height:1.5;">' + escapeHtml(message) + '</p>' +
        '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
        '<button class="confirm-cancel" style="padding:8px 20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:30px;color:#A0B3C9;cursor:pointer;font-size:13px;">Batal</button>' +
        '<button class="confirm-ok" style="padding:8px 20px;background:#FF4444;border:none;border-radius:30px;color:white;font-weight:bold;cursor:pointer;font-size:13px;">Ya, Reset</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const close = function() { overlay.remove(); };
    box.querySelector('.confirm-cancel').addEventListener('click', close);
    box.querySelector('.confirm-ok').addEventListener('click', function() { close(); if (typeof onConfirm === 'function') onConfirm(); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
}

// ========== CHART ==========
function renderChart(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (typeof Chart === 'undefined') {
        ctx.fillStyle = '#5a6a7a'; ctx.font = '12px sans-serif';
        ctx.fillText('Chart.js tidak tersedia', 10, 50);
        return;
    }
    const agents = Object.keys(data);
    const values = agents.map(function(a) { return data[a]; });
    if (agents.length === 0) {
        ctx.fillStyle = '#5a6a7a'; ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data latensi', canvas.width / 2, canvas.height / 2 + 4);
        return;
    }
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: agents, datasets: [{ label: 'Latency (ms)', data: values, backgroundColor: 'rgba(0,255,204,0.25)', borderColor: '#00ffcc', borderWidth: 1.5, borderRadius: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#A0B3C9', font: { size: 11 } } } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 9 } } },
                x: { grid: { display: false }, ticks: { color: '#666', font: { size: 8 } } }
            }
        }
    });
}

// ========== HEATMAP (dot-matrix) ==========
function renderHeatmap(container, heatmapData) {
    if (!container) return;
    if (!heatmapData || heatmapData.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#5a6a7a;font-size:11px;padding:12px;">Belum ada data performa</div>';
        return;
    }
    container.innerHTML = heatmapData.map(function(h) {
        const name = escapeHtml(h.agent || 'Unknown');
        const latency = h.avgLatency || 0;
        const failures = h.failures || 0;
        const color = latency < 100 ? '#00FFA3' : latency < 300 ? '#FFD700' : '#FF6B6B';
        const calls = Math.max(1, Math.min(12, h.calls || 5));
        let dots = '';
        for (let i = 0; i < calls; i++) {
            const on = i < Math.max(1, Math.round(calls * 0.7));
            dots += '<span class="tl-dot" style="background:' + (on ? color : 'rgba(255,255,255,0.12)') + ';"></span>';
        }
        return '<div class="tl-heat-row" style="border-left:3px solid ' + color + ';padding-left:8px;">' +
            '<span class="tl-heat-name">' + name + '</span>' +
            '<span class="tl-dots">' + dots + '</span>' +
            (failures > 0 ? '<span class="tl-fail">fail:' + failures + '</span>' : '') +
            '<span class="tl-ms">' + latency + 'ms</span></div>';
    }).join('');
}

// ========== METRICS STRIP ==========
function renderMetrics(container, records, avgLatency, agentsActive) {
    if (!container) return;
    const status = avgLatency < 100 ? 'SEHAT' : avgLatency < 300 ? 'WASPADA' : 'KRITIS';
    const statusColor = avgLatency < 100 ? '#00FFA3' : avgLatency < 300 ? '#FFD700' : '#FF6B6B';
    container.innerHTML = '<div class="tl-b"><div class="tl-strip">' +
        '<div class="tl-cell"><div class="tl-num">' + records + '</div><div class="tl-lbl">Records</div></div>' +
        '<div class="tl-cell"><div class="tl-num" style="color:#FFD700;">' + avgLatency + '</div><div class="tl-lbl">Avg ms</div></div>' +
        '<div class="tl-cell"><div class="tl-num" style="color:#4FC3F7;">' + agentsActive + '</div><div class="tl-lbl">Agents</div></div>' +
        '<div class="tl-cell"><div class="tl-num" style="color:' + statusColor + ';font-size:16px;padding-top:6px;">' + status + '</div><div class="tl-lbl">Status</div></div>' +
        '</div></div>';
}

// ========== MAIN RENDER ==========
function render() {
    injectCSS();
    const inner = document.getElementById('pageInner');
    if (!inner) return;
    const Telemetry = window.Telemetry;
    const FlowAnalytics = window.FlowAnalytics;
    const avgLatency = (Telemetry && Telemetry.getAverageLatency) ? Telemetry.getAverageLatency() : 0;
    const records = (Telemetry && Telemetry.records) ? Telemetry.records.length : 0;
    const heatmapData = (FlowAnalytics && FlowAnalytics.getHeatmap) ? FlowAnalytics.getHeatmap() : [];
    const latByAgent = (Telemetry && Telemetry.getLatencyByAgent) ? Telemetry.getLatencyByAgent() : {};

    inner.innerHTML = '<div class="tl-wrap">' +
        '<div class="tl-ch">CH.03 — TELEMETRY</div>' +
        '<div class="tl-head"><div><div class="tl-title">Telemetry Analytics</div>' +
        '<div class="tl-sub">Performa sistem • latensi • heatmap agen</div></div>' +
        '<div class="tl-actions"><span class="tl-time">' + new Date().toLocaleTimeString() + '</span>' +
        '<button id="refreshTelemetryBtn" class="tl-ba">Refresh</button>' +
        '<button id="resetTelemetryBtn" class="tl-ba danger">Reset</button></div></div>' +
        '<div id="telemetryMetricsContainer"></div>' +
        '<div class="tl-b"><span class="tl-in"><h4>Latency per Agent</h4>' +
        '<div style="position:relative;width:100%;height:200px;"><canvas id="telemetryDetailChart" style="width:100%;height:100%;"></canvas></div></span></div>' +
        '<div class="tl-b"><span class="tl-in"><h4>Performance Heatmap</h4><div id="telemetryHeatmap"></div></span></div>' +
        '<div class="tl-foot">Data diperbarui otomatis setiap 30 detik • ' + records + ' rekaman tersimpan</div>' +
        '</div>';

    renderMetrics(document.getElementById('telemetryMetricsContainer'), records, avgLatency, heatmapData.length);
    renderHeatmap(document.getElementById('telemetryHeatmap'), heatmapData);
    setTimeout(function() { renderChart(document.getElementById('telemetryDetailChart'), latByAgent); }, 50);

    const refreshBtn = document.getElementById('refreshTelemetryBtn');
    if (refreshBtn) {
        const nb = refreshBtn.cloneNode(true);
        refreshBtn.parentNode.replaceChild(nb, refreshBtn);
        nb.addEventListener('click', function() { showToast('Telemetry di-refresh', 'info'); render(); });
    }
    const resetBtn = document.getElementById('resetTelemetryBtn');
    if (resetBtn) {
        const nr = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(nr, resetBtn);
        nr.addEventListener('click', function() {
            showConfirmDialog('Reset Telemetry', 'Semua data telemetry (latensi, heatmap, riwayat) akan dihapus permanen. Yakin?', function() {
                if (Telemetry && typeof Telemetry.reset === 'function') Telemetry.reset();
                if (FlowAnalytics && typeof FlowAnalytics.reset === 'function') FlowAnalytics.reset();
                showToast('Telemetry direset!', 'success');
                render();
            });
        });
    }
}

// ========== AUTO-REFRESH & CLEANUP ==========
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(function() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent && pageContent.style.display !== 'none') {
            const inner = document.getElementById('pageInner');
            if (inner && inner.innerHTML.includes('Telemetry Analytics')) render();
        }
    }, REFRESH_INTERVAL_MS);
}
function stopAutoRefresh() { if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; } }
function destroy() {
    stopAutoRefresh();
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}
if (window.Telemetry && window.Telemetry.emitter) {
    window.Telemetry.emitter.on('data-updated', function() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent && pageContent.style.display !== 'none') render();
    });
}
window.TelemetryPage = { render: render, startAutoRefresh: startAutoRefresh, stopAutoRefresh: stopAutoRefresh, destroy: destroy };
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoRefresh);
} else {
    startAutoRefresh();
}
window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
});
})();
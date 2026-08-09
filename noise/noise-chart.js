(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__NoiseChartLoaded) {
        return;
    }
    window.__NoiseChartLoaded = true;

    const InternalLogger = KESEMPATAN.NoiseUtils?.InternalLogger || { info: function() {}, warn: function() {} };
    const NoiseState = KESEMPATAN.NoiseState || {};
    const _state = NoiseState.state || {};

    function renderHistoryChart() {
        try {
            const canvas = document.getElementById('noise-history-chart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            const history = _state.history.slice(0, 7).reverse();
            if (history.length < 2) {
                ctx.fillStyle = '#5A6B64';
                ctx.font = '11px ui-monospace, monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Minimal 2 scan untuk grafik', width / 2, height / 2 + 4);
                return;
            }
            const padding = { top: 15, bottom: 25, left: 30, right: 10 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;
            let maxVal = 10;
            try {
                maxVal = Math.max(10, ...history.map(function(h) { return h.total; }));
            } catch (e) {
                maxVal = 10;
            }
            const step = chartW / (history.length - 1);
            ctx.strokeStyle = 'rgba(0,255,163,0.06)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const y = padding.top + (i / 3) * chartH;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
                ctx.fillStyle = '#5A6B64';
                ctx.font = '8px ui-monospace, monospace';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(maxVal * (1 - i / 3)), padding.left - 4, y + 3);
            }
            ctx.beginPath();
            history.forEach(function(h, idx) {
                const x = padding.left + idx * step;
                const y = padding.top + chartH - (h.total / maxVal) * chartH;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = '#00FFA3';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(0,255,163,0.55)';
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
            const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            grad.addColorStop(0, 'rgba(0,255,163,0.15)');
            grad.addColorStop(1, 'rgba(0,255,163,0.01)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            history.forEach(function(h, idx) {
                const x = padding.left + idx * step;
                const y = padding.top + chartH - (h.total / maxVal) * chartH;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.lineTo(padding.left + (history.length - 1) * step, padding.top + chartH);
            ctx.lineTo(padding.left, padding.top + chartH);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            history.forEach(function(h, idx) {
                const x = padding.left + idx * step;
                const cred = typeof h.avgCredibility === 'number' ? h.avgCredibility : 0;
                const y = padding.top + chartH - (cred / 100) * chartH;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = '#8E7CFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
            history.forEach(function(h, idx) {
                const x = padding.left + idx * step;
                const y = padding.top + chartH - (h.total / maxVal) * chartH;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = '#05070A';
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#00FFA3';
                ctx.stroke();
                ctx.fillStyle = '#9DB2A8';
                ctx.font = '7px ui-monospace, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(h.total, x, y - 8);
                if (idx % 2 === 0 || idx === history.length - 1) {
                    const label = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    ctx.fillStyle = '#5A6B64';
                    ctx.font = '7px ui-monospace, monospace';
                    ctx.fillText(label, x, padding.top + chartH + 14);
                }
            });
        } catch (e) {
            InternalLogger.warn('Noise', 'Chart render error');
        }
    }

    function renderVerdictRing() {
        try {
            const canvas = document.getElementById('noise-verdict-ring');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            const stats = _state.stats;
            const total = Math.max(1, stats.total);
            const segments = [
                { value: stats.allowed, color: '#00FFA3' },
                { value: stats.filtered, color: '#FFB224' },
                { value: stats.blocked, color: '#FF4D5E' }
            ];
            const cx = w / 2, cy = h / 2;
            const outerR = Math.min(w, h) / 2 - 4;
            const innerR = outerR * 0.62;
            let startAngle = -Math.PI / 2;
            if (stats.total === 0) {
                ctx.beginPath();
                ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(0,255,163,0.08)';
                ctx.lineWidth = outerR - innerR;
                ctx.stroke();
            } else {
                segments.forEach(function(seg) {
                    if (seg.value <= 0) return;
                    const angle = (seg.value / total) * 2 * Math.PI;
                    ctx.beginPath();
                    ctx.arc(cx, cy, (outerR + innerR) / 2, startAngle, startAngle + angle);
                    ctx.lineWidth = outerR - innerR;
                    ctx.strokeStyle = seg.color;
                    ctx.shadowColor = seg.color;
                    ctx.shadowBlur = 5;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    startAngle += angle;
                });
            }
            ctx.fillStyle = '#E6F2EC';
            ctx.font = '800 22px ui-monospace, "SF Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(stats.total), cx, cy - 6);
            ctx.fillStyle = '#5A6B64';
            ctx.font = '7px ui-monospace, monospace';
            ctx.fillText('SINYAL', cx, cy + 11);
        } catch (e) {
            InternalLogger.warn('Noise', 'Ring chart render error');
        }
    }

    KESEMPATAN.NoiseChart = {
        renderHistoryChart: renderHistoryChart,
        renderVerdictRing: renderVerdictRing
    };
})();
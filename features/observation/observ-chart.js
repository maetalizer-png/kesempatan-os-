import { Observation } from './observ-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = Observation;
const state = OBS.getState();

function positionBeacon(container) {
    if (!state.chartInstance) return;
    const meta = state.chartInstance.getDatasetMeta(0);
    const lastPoint = meta.data[meta.data.length - 1];
    if (!lastPoint) return;

    let beacon = container.querySelector('.obsroom-chart-beacon');
    if (!beacon) {
        beacon = document.createElement('div');
        beacon.className = 'obsroom-chart-beacon';
        container.appendChild(beacon);
    }
    beacon.style.left = lastPoint.x + 'px';
    beacon.style.top = lastPoint.y + 'px';
}

function updateChartData() {
    const container = document.getElementById('trendChartContainer');
    if (!container) return;

    const canvas = container.querySelector('canvas');
    if (!canvas) {
        renderChart();
        return;
    }

    if (!state.chartInstance) {
        renderChart();
        return;
    }

    const today = new Date();
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('id-ID', { weekday: 'short' }));
        const count = state.signals.filter(s => {
            const sDate = new Date(s.timestamp);
            return sDate.toDateString() === d.toDateString();
        }).length;
        data.push(count);
    }

    state.chartInstance.data.labels = labels;
    state.chartInstance.data.datasets[0].data = data;

    const tickColor = state.darkMode ? '#6B7482' : '#888';
    const gridColor = state.darkMode ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)';
    state.chartInstance.options.plugins.legend.labels.color = tickColor;
    state.chartInstance.options.scales.y.ticks.color = tickColor;
    state.chartInstance.options.scales.y.grid.color = gridColor;
    state.chartInstance.options.scales.x.ticks.color = tickColor;

    state.chartInstance.update();
}

function renderChart() {
    const container = document.getElementById('trendChartContainer');
    if (!container) return;

    if (state.chartInstance) {
        state.chartInstance.destroy();
        state.chartInstance = null;
    }

    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div style="color:#8A94A6;font-size:10px;">Chart.js tidak tersedia</div>';
        return;
    }

    const today = new Date();
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('id-ID', { weekday: 'short' }));
        const count = state.signals.filter(s => {
            const sDate = new Date(s.timestamp);
            return sDate.toDateString() === d.toDateString();
        }).length;
        data.push(count);
    }

    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const fillGradient = ctx.createLinearGradient(0, 0, 0, 78);
    fillGradient.addColorStop(0, 'rgba(0,201,124,0.32)');
    fillGradient.addColorStop(1, 'rgba(0,201,124,0)');

    const pointRadii = data.map(() => 0);

    const glowLinePlugin = {
        id: 'obsGlowLine',
        beforeDatasetsDraw(chart) {
            chart.ctx.save();
            chart.ctx.shadowColor = 'rgba(0,201,124,0.5)';
            chart.ctx.shadowBlur = 7;
        },
        afterDatasetsDraw(chart) {
            chart.ctx.restore();
        }
    };

    state.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sinyal',
                data: data,
                borderColor: '#00C97C',
                borderWidth: 2,
                backgroundColor: fillGradient,
                fill: true,
                tension: 0.35,
                pointRadius: pointRadii,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#00FFA3'
            }]
        },
        plugins: [glowLinePlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                onComplete: () => positionBeacon(container)
            },
            plugins: {
                legend: {
                    labels: { color: state.darkMode ? '#6B7482' : '#888', font: { size: 10 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: state.darkMode ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)' },
                    ticks: { color: state.darkMode ? '#6B7482' : '#888', font: { size: 8 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: state.darkMode ? '#6B7482' : '#888', font: { size: 8 } }
                }
            }
        }
    });
}

OBS.Chart = {
    updateChartData,
    renderChart
};

KESEMPATAN.Observation = OBS;

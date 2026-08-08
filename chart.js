(function() {
"use strict";
if (window.__ChartLoaded) return;
window.__ChartLoaded = true;

let opportunityChart = null;
let timeAnalyticsChart = null;

const METRIC_KEYS = (window.KESEMPATAN?.Utils?.METRIC_KEYS) || (window.Utils && window.Utils.METRIC_KEYS) || [
    'demand', 'competition', 'monetization', 'virality',
    'sustainability', 'scalability', 'timing', 'attention',
    'execution', 'longterm'
];

const METRIC_LABELS = [
    'Demand', 'Competition', 'Monetization', 'Virality',
    'Sustainability', 'Scalability', 'Timing', 'Attention',
    'Execution', 'Long-term'
];

function updateChart(metrics) {
    const canvas = document.getElementById('opportunityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = [
        metrics.demand || 0,
        metrics.competition || 0,
        metrics.monetization || 0,
        metrics.virality || 0,
        metrics.sustainability || 0,
        metrics.scalability || 0,
        metrics.timing || 0,
        metrics.attention || 0,
        metrics.execution || 0,
        metrics.longterm || 0
    ];

    if (opportunityChart) opportunityChart.destroy();

    canvas.style.boxShadow = '0 0 20px rgba(0, 255, 163, 0.2)';
    canvas.style.borderRadius = '12px';

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 255, 204, 0.35)');
    gradient.addColorStop(0.3, 'rgba(0, 200, 150, 0.25)');
    gradient.addColorStop(0.7, 'rgba(0, 150, 100, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 255, 204, 0.05)');

    const avgScore = data.reduce((a, b) => a + b, 0) / 10;
    const borderColor = avgScore >= 70 ? '#00ffa3' : (avgScore >= 40 ? '#ffaa00' : '#ff4444');

    opportunityChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: METRIC_LABELS,
            datasets: [{
                label: 'Skor Peluang',
                data: data,
                backgroundColor: gradient,
                borderColor: borderColor,
                borderWidth: 3,
                pointBackgroundColor: function(context) {
                    const value = context.raw;
                    if (value >= 70) return '#00ffa3';
                    if (value >= 40) return '#ffaa00';
                    return '#ff4444';
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 12,
                pointHoverBorderWidth: 3,
                tension: 0.15,
                fill: true,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart',
                    animateRotate: true,
                    animateScale: true
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (tooltipContext) => {
                            const value = tooltipContext.raw;
                            let status = '';
                            let emoji = '';
                            if (value >= 70) { status = 'BAIK'; emoji = '✅'; }
                            else if (value >= 40) { status = 'SEDANG'; emoji = '⚠️'; }
                            else { status = 'RENDAH'; emoji = '❌'; }
                            return `${tooltipContext.label}: ${value}/100 ${emoji} ${status}`;
                        }
                    },
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: '#00ffcc',
                    bodyColor: '#ffffff',
                    borderColor: '#00ffcc',
                    borderWidth: 1,
                    cornerRadius: 10,
                    displayColors: false,
                    padding: 12,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 }
                },
                legend: {
                    labels: {
                        color: '#E0E6ED',
                        font: { size: 11, weight: 'bold' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15
                    },
                    position: 'top'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: '#A0B3C9',
                        backdropColor: 'transparent',
                        font: { size: 10 },
                        callback: (val) => `${val}`
                    },
                    grid: {
                        color: 'rgba(0, 255, 204, 0.15)',
                        circular: true,
                        lineWidth: 1
                    },
                    angleLines: {
                        color: 'rgba(0, 255, 204, 0.12)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        display: window.innerWidth >= 480,
                        color: '#00ffcc',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 11,
                            weight: 'bold'
                        },
                        padding: 10
                    },
                    title: { display: false }
                }
            },
            elements: {
                line: {
                    borderWidth: 3,
                    borderColor: borderColor,
                    backgroundColor: 'rgba(0, 255, 204, 0.15)',
                    tension: 0.15
                },
                point: {
                    radius: 6,
                    hoverRadius: 12,
                    backgroundColor: '#00ffcc',
                    borderColor: '#ffffff',
                    borderWidth: 2
                }
            },
            layout: {
                padding: { top: 25, bottom: 25, left: 15, right: 15 }
            }
        }
    });
}

function computeTrendLine(scores) {
    const count = scores.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < count; i++) {
        sumX += i;
        sumY += scores[i];
        sumXY += i * scores[i];
        sumX2 += i * i;
    }
    const slope = (count * sumXY - sumX * sumY) / (count * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / count;
    const trendData = scores.map((_, i) => slope * i + intercept);
    const trendLabel = slope > 0 ? '📈 Meningkat' : (slope < 0 ? '📉 Menurun' : '➡️ Stabil');
    return { slope, intercept, trendData, trendLabel };
}

function loadReportHistory() {
    let history = [];
    const saved = localStorage.getItem('kes_report_history');
    if (saved) {
        try {
            const reports = JSON.parse(saved);
            history = reports.slice(0, 15).reverse();
        } catch (error) {}
    }
    return history;
}

function initTimeAnalytics() {
    const canvas = document.getElementById('timeAnalyticsCanvas');
    if (!canvas) return;

    let history = loadReportHistory();

    if (history.length === 0) {
        history = [
            { score: 42, topic: 'Analisis Perdana', timestamp: Date.now() - 86400000 * 14 },
            { score: 48, topic: 'Analisis 2', timestamp: Date.now() - 86400000 * 12 },
            { score: 55, topic: 'Analisis 3', timestamp: Date.now() - 86400000 * 10 },
            { score: 52, topic: 'Analisis 4', timestamp: Date.now() - 86400000 * 8 },
            { score: 61, topic: 'Analisis 5', timestamp: Date.now() - 86400000 * 6 },
            { score: 68, topic: 'Analisis 6', timestamp: Date.now() - 86400000 * 4 },
            { score: 75, topic: 'Analisis 7', timestamp: Date.now() - 86400000 * 2 },
            { score: 82, topic: 'Analisis 8', timestamp: Date.now() - 86400000 * 1 }
        ];
    }

    const labels = history.map((entry, index) => {
        if (entry.timestamp) {
            const date = new Date(entry.timestamp);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return `${index + 1}`;
    });
    const scores = history.map(entry => entry.score);
    const topics = history.map(entry => entry.topic || 'Analisis');
    const { trendData, trendLabel } = computeTrendLine(scores);

    const ctx = canvas.getContext('2d');
    if (timeAnalyticsChart) timeAnalyticsChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0, 255, 204, 0.4)');
    gradient.addColorStop(0.5, 'rgba(0, 200, 150, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 255, 204, 0.02)');

    canvas.style.boxShadow = '0 0 20px rgba(0, 255, 163, 0.15)';
    canvas.style.borderRadius = '12px';

    timeAnalyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Skor Peluang',
                    data: scores,
                    borderColor: '#00ffcc',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: (pointContext) => {
                        const value = pointContext.raw;
                        if (value >= 70) return '#00ffa3';
                        if (value >= 40) return '#ffaa00';
                        return '#ff4444';
                    },
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 7,
                    pointHoverRadius: 12,
                    tension: 0.3,
                    fill: true,
                    animation: { duration: 1000, easing: 'easeOutQuart' }
                },
                {
                    label: 'Trend Line',
                    data: trendData,
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 2,
                    borderDash: [8, 6],
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                    animation: { duration: 800 }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (tooltipContext) => {
                            if (tooltipContext.dataset.label === 'Trend Line') return null;
                            const score = tooltipContext.raw;
                            let status = '';
                            let emoji = '';
                            if (score >= 70) { status = 'BAIK'; emoji = '✅'; }
                            else if (score >= 40) { status = 'SEDANG'; emoji = '⚠️'; }
                            else { status = 'RENDAH'; emoji = '❌'; }
                            return `Skor: ${score}/100 ${emoji} ${status}`;
                        },
                        afterLabel: (tooltipContext) => {
                            if (tooltipContext.dataset.label === 'Trend Line') return null;
                            const topic = topics[tooltipContext.dataIndex];
                            return `Topik: ${topic.substring(0, 45)}${topic.length > 45 ? '...' : ''}`;
                        },
                        footer: () => `Trend: ${trendLabel}`
                    },
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: '#00ffcc',
                    bodyColor: '#ffffff',
                    footerColor: '#ffaa00',
                    borderColor: '#00ffcc',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12
                },
                legend: {
                    labels: {
                        color: '#E0E6ED',
                        font: { size: 11, weight: 'bold' },
                        usePointStyle: true
                    },
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0, 255, 204, 0.08)' },
                    title: {
                        display: true,
                        text: '📊 Skor',
                        color: '#A0B3C9',
                        font: { size: 11, weight: 'bold' }
                    },
                    ticks: {
                        stepSize: 20,
                        color: '#A0B3C9',
                        callback: (val) => `${val}`
                    }
                },
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: '📅 Riwayat Analisis',
                        color: '#A0B3C9',
                        font: { size: 11, weight: 'bold' }
                    },
                    ticks: { color: '#A0B3C9', font: { size: 10 } }
                }
            },
            elements: {
                line: { borderWidth: 3, tension: 0.3 },
                point: { radius: 7, hoverRadius: 12, borderWidth: 2 }
            }
        }
    });
}

function updateTimeAnalytics() {
    const history = loadReportHistory();
    if (history.length === 0) return;

    const labels = history.map((entry, index) => {
        if (entry.timestamp) {
            const date = new Date(entry.timestamp);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return `${index + 1}`;
    });
    const scores = history.map(entry => entry.score);
    const { trendData } = computeTrendLine(scores);

    if (timeAnalyticsChart) {
        timeAnalyticsChart.data.labels = labels;
        timeAnalyticsChart.data.datasets[0].data = scores;
        timeAnalyticsChart.data.datasets[1].data = trendData;
        timeAnalyticsChart.update({ duration: 600, easing: 'easeOutQuart' });
    }
}

const ScoreEngine = {
    metricsKeys: METRIC_KEYS,
    updateFromAggregated(aggregated) {
        let metrics = aggregated.metrics;
        if (!metrics || Object.values(metrics).every(value => value === 0)) {
            metrics = {};
            for (const metricKey of this.metricsKeys) {
                metrics[metricKey] = aggregated[metricKey] || 0;
            }
        }
        for (const metricKey of this.metricsKeys) {
            const metricElement = document.getElementById(`m-${metricKey}`);
            if (metricElement) {
                let metricValue = metrics[metricKey];
                if (metricValue === undefined || isNaN(metricValue)) metricValue = 0;
                metricElement.textContent = Math.round(metricValue);
                delete metricElement.dataset.count;
                metricElement.style.opacity = "1";
                const metricRow = metricElement.closest('.metric-row');
                if (metricRow) {
                    const progressFill = metricRow.querySelector('.metric-progress-fill');
                    if (progressFill) progressFill.style.width = `${Math.round(metricValue)}%`;
                }
            }
        }
        const finalScore = aggregated.score !== undefined ? aggregated.score :
            Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 10);
        const scoreElement = document.getElementById("finalScoreDisplay");
        if (scoreElement) scoreElement.innerText = finalScore;
        const priorityElement = document.getElementById("priorityDisplay");
        if (priorityElement) {
            const priority = finalScore >= 85 ? "🔴 HIGH" :
                (finalScore >= 70 ? "🟡 MEDIUM" :
                (finalScore >= 50 ? "🟢 LOW" : "⚪ POOR"));
            priorityElement.innerText = priority;
        }
        updateChart(metrics);
        setTimeout(() => { updateTimeAnalytics(); }, 100);
    }
};

const ChartManager = Object.freeze({
    updateChart: updateChart,
    initTimeAnalytics: initTimeAnalytics,
    updateTimeAnalytics: updateTimeAnalytics,
    ScoreEngine: ScoreEngine,
    METRIC_KEYS: METRIC_KEYS,
    METRIC_LABELS: METRIC_LABELS,
    getChart: () => opportunityChart,
    getTimeChart: () => timeAnalyticsChart
});

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.ChartManager = ChartManager;
window.ChartManager = ChartManager;
window.updateChart = updateChart;
window.ScoreEngine = ScoreEngine;
window.initTimeAnalytics = initTimeAnalytics;
window.updateTimeAnalytics = updateTimeAnalytics;
})();

(function autoInitChart() {
    setTimeout(() => {
        if (typeof window.updateChart === 'function') {
            window.updateChart({
                demand: 0, competition: 0, monetization: 0, virality: 0,
                sustainability: 0, scalability: 0, timing: 0, attention: 0,
                execution: 0, longterm: 0
            });
        }
    }, 500);
})();
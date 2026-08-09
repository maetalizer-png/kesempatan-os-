import { ChartManager } from './chart.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function renderUI(container) {
    if (!container) return;
    container.className = 'card full-width';
    container.style.marginTop = '16px';
    container.innerHTML =
        '<div class="chart-container">' +
            '<h3>Score Trends (Time Analytics)</h3>' +
            '<canvas id="timeAnalyticsCanvas" width="400" height="200"></canvas>' +
            '<div class="viz-footer">Score progression from every analysis</div>' +
        '</div>';
}

export const TimeAnalyticsPanel = Object.freeze({ renderUI: renderUI });

KESEMPATAN.TimeAnalyticsPanel = TimeAnalyticsPanel;

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('timeAnalyticsContainer'));
    ChartManager.initTimeAnalytics();
});
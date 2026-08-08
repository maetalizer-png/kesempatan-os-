(function() {
'use strict';
if (window.__TimeAnalyticsPanelLoaded) return;
window.__TimeAnalyticsPanelLoaded = true;

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

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.TimeAnalyticsPanel = Object.freeze({ renderUI: renderUI });
window.TimeAnalyticsPanel = { renderUI: renderUI };

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('timeAnalyticsContainer'));
    if (typeof window.KESEMPATAN?.ChartManager?.initTimeAnalytics === 'function') {
        window.KESEMPATAN.ChartManager.initTimeAnalytics();
    } else if (typeof window.initTimeAnalytics === 'function') {
        window.initTimeAnalytics();
    }
});
})();
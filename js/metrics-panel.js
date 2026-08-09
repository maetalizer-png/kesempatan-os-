(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__MetricsPanelLoaded) return;
window.__MetricsPanelLoaded = true;

const METRICS = [
    { key: 'demand', label: '1. Demand' },
    { key: 'competition', label: '2. Competition' },
    { key: 'monetization', label: '3. Monetization' },
    { key: 'virality', label: '4. Virality' },
    { key: 'sustainability', label: '5. Sustainability' },
    { key: 'scalability', label: '6. Scalability' },
    { key: 'timing', label: '7. Timing' },
    { key: 'attention', label: '8. Attention' },
    { key: 'execution', label: '9. Execution' },
    { key: 'longterm', label: '10. Long-Term' }
];

function buildMetricsGridHTML() {
    return METRICS.map(function(metric) {
        return '<div class="metric-row">' +
            '<div class="km-rim-in">' +
                '<span class="metric-name">' + metric.label + '</span>' +
                '<span class="metric-score" id="m-' + metric.key + '">0</span>' +
                '<div class="metric-progress"><div class="metric-progress-fill"></div></div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function renderUI(container) {
    if (!container) return;
    container.className = 'card full-width';
    container.innerHTML =
        '<h2 class="km-h">10 Engine Score</h2>' +
        '<div class="matrix-grid" id="metricsGrid">' + buildMetricsGridHTML() + '</div>' +
        '<div class="total-score-wrapper">' +
            '<div class="total-score-label">' +
                '<span class="total-score-text">Total Score</span>' +
                '<span id="finalScoreDisplay">0</span>' +
                '<span class="total-score-max">/100</span>' +
            '</div>' +
            '<div class="priority-badge" id="priorityDisplay">NO DATA</div>' +
        '</div>' +
        '<div class="chart-container"><h3>Opportunity Radar</h3><canvas id="opportunityChart" width="400" height="200"></canvas></div>' +
        '<div class="viz-3d-container" id="viz3dContainer">' +
            '<div class="viz-header"><span>3D Intelligence Sphere</span><button class="viz-toggle" id="vizToggleBtn">−</button></div>' +
            '<div id="threeCanvas" style="width:100%;height:380px;"></div>' +
            '<div class="viz-footer">Drag to rotate | 90 Particles</div>' +
        '</div>';
}

KESEMPATAN.MetricsPanel = Object.freeze({ renderUI: renderUI, METRICS: METRICS });

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('metricsPanelContainer'));
});
})();
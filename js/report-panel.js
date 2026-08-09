const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function renderUI(container) {
    if (!container) return;
    container.className = 'card full-width';
    container.innerHTML =
        '<div class="chart-container">' +
            '<h3>Autonomous Intelligence Report</h3>' +
            '<div id="reportContainer" class="result-container"><p class="text-dim">Analysis results will appear here...</p></div>' +
            '<div id="hitlPanel" style="margin-top:20px; display:none;"></div>' +
        '</div>';
}

export const ReportPanel = Object.freeze({ renderUI: renderUI });

KESEMPATAN.ReportPanel = ReportPanel;

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('reportPanelContainer'));
});
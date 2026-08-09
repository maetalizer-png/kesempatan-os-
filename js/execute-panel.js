(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__ExecutePanelLoaded) return;
window.__ExecutePanelLoaded = true;

function renderUI(container) {
    if (!container) return;
    container.innerHTML =
        '<div style="margin:20px 0;"><button id="mainExecuteBtn" class="execute-btn" style="padding:14px; font-size:16px;">EKSEKUSI INTELLIGENCE LOOP</button></div>' +
        '<div id="loadingIndicator" style="display:none;">' +
            '<span>Memproses agen: <span id="agentProgress">0</span>/<span id="totalAgents">200</span></span>' +
            '<div class="progress-bar" style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:6px;"><div id="progressFill" style="width:0%; height:100%; background:#00FFA3; border-radius:2px;"></div></div>' +
            '<div style="margin-top:8px; font-size:11px; color:#A0B3C9;">Waktu eksekusi: <span id="timerDisplay">0.0</span> detik</div>' +
        '</div>';
}

KESEMPATAN.ExecutePanel = Object.freeze({ renderUI: renderUI });

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('executePanelContainer'));
});
})();
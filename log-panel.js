(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__LogPanelLoaded) return;
window.__LogPanelLoaded = true;

const SVG_TERMINAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M6 9l3 2-3 2"/><path d="M12 13h4"/><path d="M8 21h8"/></svg>';
const BAR_DIVIDER = '═'.repeat(40);

function renderUI(container) {
    if (!container) return;
    container.innerHTML =
        '<div class="kl-wrap">' +
            '<h3 class="kl-title">' +
                '<span class="kl-ico">' + SVG_TERMINAL + '</span>' +
                '<span class="kl-title-text">KES LOG</span>' +
            '</h3>' +
            '<div class="kl-rim">' +
                '<div class="log-box" id="systemLog">' +
                    '<div class="log-header">' + BAR_DIVIDER + '</div>' +
                    '<div class="log-header">KESEMPATAN OS - WORKFLOW</div>' +
                    '<div class="log-header">' + BAR_DIVIDER + '</div>' +
                    '<div class="log-entry text-dim">[SISTEM] Menunggu parameter input...</div>' +
                '</div>' +
            '</div>' +
        '</div>';
}

KESEMPATAN.LogPanel = Object.freeze({ renderUI: renderUI });

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('logPanelContainer'));
});
})();
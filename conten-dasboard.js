(function() {
'use strict';
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__ContenDasboardLoaded) return;
window.__ContenDasboardLoaded = true;

const SVG = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9.5 13.5l1.8 1.8 3.4-3.6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M8 21h8"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>'
};

const TILE_SIZE = 'padding:8px 14px !important;min-height:34px !important';
const ICON_SIZE = 'flex:0 0 18px;width:18px;height:18px';
const TEXT_SIZE = 'font-size:12.5px';

function stripParens(badgeElement) {
    try {
        const walker = document.createTreeWalker(badgeElement, 4);
        let node;
        while ((node = walker.nextNode())) {
            const nodeValue = node.nodeValue;
            if (nodeValue && nodeValue.indexOf('(') !== -1) {
                const cleaned = nodeValue.replace(/\s*\([^)]*\)/g, '');
                if (cleaned !== nodeValue) node.nodeValue = cleaned;
            }
        }
    } catch (error) { console.warn('[ContenDasboard] stripParens failed:', error.message); }
}

function renderUI(container) {
    if (!container) return;
    container.innerHTML =
        '<div class="kx-wrap">' +
            '<h2 class="kx-h">' +
                '<span class="kx-htext">PARAMETER INPUT</span>' +
                '<span id="workflowModeBadge" class="workflow-mode-badge auto">AUTO</span>' +
            '</h2>' +
            '<div class="kx-grp">' +
                '<div class="kx-lbl"><span class="kx-lico">' + SVG.chat + '</span>Probability Topic</div>' +
                '<div class="kx-rim kx-box"><div class="kx-rim-in">' +
                    '<textarea id="topicInput" rows="2" placeholder="Probability topic..."></textarea>' +
                '</div></div>' +
            '</div>' +
            '<div class="kx-grp">' +
                '<div class="kx-lbl"><span class="kx-lico">' + SVG.doc + '</span>Analysis Instructions</div>' +
                '<div class="kx-rim kx-box"><div class="kx-rim-in">' +
                    '<textarea id="promptInput" rows="5" placeholder="Analysis instructions..."></textarea>' +
                '</div></div>' +
            '</div>' +
            '<div class="kx-grp">' +
                '<div class="kx-lbl"><span class="kx-lico">' + SVG.upload + '</span>Upload Data (CSV/JSON/TXT) max 10MB:</div>' +
                '<div class="kx-pair">' +
                    '<label class="kx-rim kx-file"><div class="kx-rim-in"><div class="kx-tbody" style="' + TILE_SIZE + '">' +
                        '<span class="kx-tico" style="' + ICON_SIZE + '">' + SVG.file + '</span>' +
                        '<span class="kx-ttxt" style="' + TEXT_SIZE + '">Select File</span>' +
                        '<span class="kx-tsub"><span id="uploadStatus" class="upload-status"></span></span>' +
                    '</div></div>' +
                    '<input type="file" id="fileUpload" accept=".csv,.json,.txt">' +
                    '</label>' +
                    '<div class="kx-rim kx-vcell"><div class="kx-rim-in">' +
                        '<button id="voiceInputBtn" type="button" class="execute-btn secondary kx-btn kx-mic" style="' + TILE_SIZE + '">' +
                            '<span class="kx-tico" style="' + ICON_SIZE + '">' + SVG.mic + '</span>' +
                            '<span class="kx-ttxt" style="' + TEXT_SIZE + '">Audio Input</span>' +
                        '</button>' +
                        '<button id="stopVoiceBtn" type="button" class="execute-btn secondary kx-btn kx-mic kx-stop" style="' + TILE_SIZE + ';display:none">' +
                            '<span class="kx-tico" style="' + ICON_SIZE + '">' + SVG.stop + '</span>' +
                            '<span class="kx-ttxt" style="' + TEXT_SIZE + '">Stop</span>' +
                        '</button>' +
                    '</div></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    const badge = container.querySelector('#workflowModeBadge');
    if (badge) {
        stripParens(badge);
        if (window.MutationObserver) {
            const observer = new MutationObserver(function() { stripParens(badge); });
            observer.observe(badge, { childList: true, subtree: true, characterData: true });
        }
    }
}

KESEMPATAN.ContenDasboard = Object.freeze({ renderUI: renderUI });

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('contenDasboardContainer'));
});
})();
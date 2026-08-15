import { CommandSplitter } from './command-splitter.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const SVG = {
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9.5 13.5l1.8 1.8 3.4-3.6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M8 21h8"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'
};

const COMMAND_PLACEHOLDER = 'Describe your analysis in one command…';

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

let debounceTimer = null;

function applySplit(commandText) {
    const topicInput = document.getElementById('topicInput');
    const promptInput = document.getElementById('promptInput');
    const split = CommandSplitter.splitCommand(commandText);
    if (topicInput) topicInput.value = split.topic;
    if (promptInput) promptInput.value = split.instruction;
    return split;
}

function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

function openSheet(id) {
    if (KESEMPATAN.SheetController) KESEMPATAN.SheetController.open(id);
}

function renderUI(container) {
    if (!container) return;
    container.innerHTML =
        '<div class="pi-rotator" id="infoRotator">' +
            '<div class="pi-rotator-track" id="infoRotatorTrack"></div>' +
            '<div class="pi-rotator-dots" id="infoRotatorDots"></div>' +
        '</div>' +

        '<hr class="kos-divider pi-divider">' +

        '<div class="pi-input-wrap">' +
            '<textarea id="commandInput" rows="4" placeholder="' + escapeHtml(COMMAND_PLACEHOLDER) + '"></textarea>' +
        '</div>' +

        '<label class="pi-file-row" for="fileUpload">' +
            '<span class="pi-file-ico">' + SVG.file + '</span>' +
            '<span class="pi-file-txt" id="uploadStatus">SELECT FILE</span>' +
            '<input type="file" id="fileUpload" accept=".csv,.json,.txt" hidden>' +
        '</label>' +

        '<div class="pi-detail-hidden" hidden>' +
            '<textarea id="topicInput" rows="1"></textarea>' +
            '<textarea id="promptInput" rows="1"></textarea>' +
        '</div>' +

        '<div class="pi-util-row">' +
            '<button type="button" id="utilSheetTrigger" class="pi-icon-btn" aria-label="Options and mode">' + SVG.plus + '</button>' +
            '<button type="button" id="voiceInputBtn" class="pi-icon-btn" aria-label="Audio input">' + SVG.mic + '</button>' +
            '<button type="button" id="stopVoiceBtn" class="pi-icon-btn pi-icon-btn-stop" style="display:none" aria-label="Stop">' + SVG.stop + '</button>' +
            '<button type="button" id="agentSheetTrigger" class="pi-agent-text-btn">Agents (recommended: <span id="agentRecommendCount">—</span>)</button>' +
        '</div>' +

        '<button type="button" id="mainExecuteBtn" class="pi-cta">RUN ANALYSIS</button>';

    const commandInput = container.querySelector('#commandInput');
    if (commandInput) {
        commandInput.addEventListener('input', function() {
            autoGrow(commandInput);
            clearTimeout(debounceTimer);
            const value = commandInput.value;
            debounceTimer = setTimeout(function() { applySplit(value); }, 300);
        });
        applySplit('');
    }

    const utilTrigger = container.querySelector('#utilSheetTrigger');
    if (utilTrigger) utilTrigger.addEventListener('click', function() { openSheet('modeSheet'); });

    const agentTrigger = container.querySelector('#agentSheetTrigger');
    if (agentTrigger) {
        agentTrigger.addEventListener('click', function() {
            document.dispatchEvent(new CustomEvent('agentSheetRequested'));
            openSheet('agentSheet');
        });
    }
}

export const ContenDasboard = Object.freeze({ renderUI: renderUI, applySplit: applySplit });

KESEMPATAN.ContenDasboard = ContenDasboard;

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('contenDasboardContainer'));
});

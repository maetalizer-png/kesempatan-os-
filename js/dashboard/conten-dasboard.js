import { CommandSplitter } from './command-splitter.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const SVG = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9.5 13.5l1.8 1.8 3.4-3.6"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M8 21h8"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>'
};

const TILE_SIZE = 'padding:8px 14px !important;min-height:34px !important';
const ICON_SIZE = 'flex:0 0 18px;width:18px;height:18px';
const TEXT_SIZE = 'font-size:12.5px';

const QUICK_CHIPS = ['fokus risiko', 'modal kecil', 'target 8 bulan balik modal'];
const COMMAND_PLACEHOLDER = 'analisis warung kopi kontainer di pinggir tol, fokus modal di bawah 50 juta';

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
    renderChips(split);
    return split;
}

function renderChips(split) {
    const topicChip = document.getElementById('cmdChipTopic');
    const instructionChip = document.getElementById('cmdChipInstruction');
    if (topicChip) {
        topicChip.querySelector('.kx-chip-val').textContent = split.topic || '(kosong)';
        topicChip.dataset.value = split.topic || '';
    }
    if (instructionChip) {
        instructionChip.querySelector('.kx-chip-val').textContent = split.instruction || '(kosong)';
        instructionChip.dataset.value = split.instruction || '';
    }
}

function startChipEdit(chipEl, field) {
    if (chipEl.querySelector('input')) return;
    const currentValue = chipEl.dataset.value || '';
    const valueSpan = chipEl.querySelector('.kx-chip-val');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'kx-chip-edit';
    valueSpan.replaceWith(input);
    input.focus();
    input.select();

    function commit() {
        const newValue = input.value.trim();
        const span = document.createElement('span');
        span.className = 'kx-chip-val';
        span.textContent = newValue || '(kosong)';
        input.replaceWith(span);
        chipEl.dataset.value = newValue;

        const topicInput = document.getElementById('topicInput');
        const promptInput = document.getElementById('promptInput');
        if (field === 'topic' && topicInput) topicInput.value = newValue;
        if (field === 'instruction' && promptInput) promptInput.value = newValue;

        const commandInput = document.getElementById('commandInput');
        if (commandInput && commandInput.value.trim()) {
            const topic = topicInput ? topicInput.value : '';
            const instruction = promptInput ? promptInput.value : '';
            CommandSplitter.saveCorrection(commandInput.value, topic, instruction);
        }
    }

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    });
}

function renderUI(container) {
    if (!container) return;
    container.innerHTML =
        '<div class="kx-wrap">' +
            '<h2 class="kx-h">' +
                '<span class="kx-htext">Perintah Analisis</span>' +
                '<span id="workflowModeBadge" class="workflow-mode-badge auto">AUTO</span>' +
            '</h2>' +

            '<div class="kx-grp kx-command-grp">' +
                '<div class="kx-lbl"><span class="kx-lico">' + SVG.chat + '</span>Tulis satu perintah</div>' +
                '<div class="kx-rim kx-box"><div class="kx-rim-in">' +
                    '<textarea id="commandInput" rows="2" placeholder="' + escapeHtml(COMMAND_PLACEHOLDER) + '"></textarea>' +
                '</div></div>' +
                '<div class="kx-preview" id="commandPreview">' +
                    '<button type="button" class="kx-chip kx-chip-topic" id="cmdChipTopic" data-field="topic" data-value="">' +
                        '<span class="kx-chip-key">Topik</span><span class="kx-chip-val">(kosong)</span>' +
                    '</button>' +
                    '<button type="button" class="kx-chip kx-chip-instruction" id="cmdChipInstruction" data-field="instruction" data-value="">' +
                        '<span class="kx-chip-key">Instruksi</span><span class="kx-chip-val">(kosong)</span>' +
                    '</button>' +
                '</div>' +
                '<div class="kx-quickchips" id="commandQuickChips"></div>' +
                '<button type="button" class="kx-detail-toggle" id="commandDetailToggle">' +
                    '<span class="kx-lico" style="' + ICON_SIZE + '">' + SVG.sliders + '</span>Detail' +
                '</button>' +
            '</div>' +

            '<div class="kx-detail-panel" id="commandDetailPanel" hidden>' +
                '<div class="kx-grp">' +
                    '<div class="kx-lbl"><span class="kx-lico">' + SVG.chat + '</span>Topik (lanjutan)</div>' +
                    '<div class="kx-rim kx-box"><div class="kx-rim-in">' +
                        '<textarea id="topicInput" rows="2" placeholder="Probability topic..."></textarea>' +
                    '</div></div>' +
                '</div>' +
                '<div class="kx-grp">' +
                    '<div class="kx-lbl"><span class="kx-lico">' + SVG.doc + '</span>Instruksi (lanjutan)</div>' +
                    '<div class="kx-rim kx-box"><div class="kx-rim-in">' +
                        '<textarea id="promptInput" rows="5" placeholder="Analysis instructions..."></textarea>' +
                    '</div></div>' +
                '</div>' +
            '</div>' +

            '<div class="kx-grp">' +
                '<div class="kx-lbl"><span class="kx-lico">' + SVG.upload + '</span>Unggah Data (CSV/JSON/TXT) maks 10MB:</div>' +
                '<div class="kx-pair">' +
                    '<label class="kx-rim kx-file"><div class="kx-rim-in"><div class="kx-tbody" style="' + TILE_SIZE + '">' +
                        '<span class="kx-tico" style="' + ICON_SIZE + '">' + SVG.file + '</span>' +
                        '<span class="kx-ttxt" style="' + TEXT_SIZE + '">Pilih File</span>' +
                        '<span class="kx-tsub"><span id="uploadStatus" class="upload-status"></span></span>' +
                    '</div></div>' +
                    '<input type="file" id="fileUpload" accept=".csv,.json,.txt">' +
                    '</label>' +
                    '<div class="kx-rim kx-vcell"><div class="kx-rim-in">' +
                        '<button id="voiceInputBtn" type="button" class="execute-btn secondary kx-btn kx-mic" style="' + TILE_SIZE + '">' +
                            '<span class="kx-tico" style="' + ICON_SIZE + '">' + SVG.mic + '</span>' +
                            '<span class="kx-ttxt" style="' + TEXT_SIZE + '">Input Suara</span>' +
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

    const quickChipsEl = container.querySelector('#commandQuickChips');
    if (quickChipsEl) {
        quickChipsEl.innerHTML = QUICK_CHIPS.map(function(label) {
            return '<button type="button" class="kx-quickchip" data-append="' + escapeHtml(label) + '">' + escapeHtml(label) + '</button>';
        }).join('');
        quickChipsEl.addEventListener('click', function(e) {
            const btn = e.target.closest('.kx-quickchip');
            if (!btn) return;
            const commandInput = document.getElementById('commandInput');
            if (!commandInput) return;
            const current = commandInput.value.trim();
            commandInput.value = current ? current + ' ' + btn.dataset.append : btn.dataset.append;
            applySplit(commandInput.value);
            commandInput.focus();
        });
    }

    const commandInput = container.querySelector('#commandInput');
    if (commandInput) {
        commandInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            const value = commandInput.value;
            debounceTimer = setTimeout(function() { applySplit(value); }, 300);
        });
        applySplit('');
    }

    const detailToggle = container.querySelector('#commandDetailToggle');
    const detailPanel = container.querySelector('#commandDetailPanel');
    if (detailToggle && detailPanel) {
        detailToggle.addEventListener('click', function() {
            const isHidden = detailPanel.hasAttribute('hidden');
            if (isHidden) detailPanel.removeAttribute('hidden');
            else detailPanel.setAttribute('hidden', '');
            detailToggle.classList.toggle('active', isHidden);
        });
    }

    ['cmdChipTopic', 'cmdChipInstruction'].forEach(function(id) {
        const chip = container.querySelector('#' + id);
        if (chip) {
            chip.addEventListener('click', function() { startChipEdit(chip, chip.dataset.field); });
        }
    });
}

export const ContenDasboard = Object.freeze({ renderUI: renderUI });

KESEMPATAN.ContenDasboard = ContenDasboard;

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('contenDasboardContainer'));
});

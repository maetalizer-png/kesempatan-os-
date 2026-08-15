import { ProviderRouter } from '../../ai-agent/provider-router.js';
import { AgentRegistry } from '../../ai-agent/agent-registry.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const RECOMMEND_COUNT = 8;
let recommendDebounceTimer = null;

const HEAD_SEG =
    '<span class="ac-stat-head">' +
        '<span class="ac-stat-head-text">Select Agent</span>' +
    '</span>' +
    '<span class="ac-stat-div"></span>';

function cleanCount(value) {
    if (value === null || value === undefined) return value;
    const str = String(value);
    const match = str.match(/\d+\s*\/\s*\d+/);
    if (match) {
        const cleaned = match[0].replace(/\s+/g, '');
        if (cleaned !== str) return cleaned;
    }
    return str;
}

function guardCount(container) {
    if (!container || !window.MutationObserver) return;
    const observer = new MutationObserver(function() {
        const countSpan = container.querySelector('#selectedAgentsCount');
        if (countSpan) {
            const cleaned = cleanCount(countSpan.textContent);
            if (cleaned !== countSpan.textContent) countSpan.textContent = cleaned;
        }
    });
    observer.observe(container, { childList: true, subtree: true, characterData: true });
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.agent-checkbox');
    const checkedBoxes = document.querySelectorAll('.agent-checkbox:checked');
    const countSpan = document.getElementById('selectedAgentsCount');
    const totalSpan = document.getElementById('totalAgents');
    const totalCountSpan = document.getElementById('totalAgentCount');
    const totalCountHeaderSpan = document.getElementById('totalAgentCountHeader');
    if (countSpan) countSpan.textContent = checkedBoxes.length + '/' + checkboxes.length;
    if (totalSpan) totalSpan.textContent = checkboxes.length;
    if (totalCountSpan) totalCountSpan.textContent = checkboxes.length;
    if (totalCountHeaderSpan) totalCountHeaderSpan.textContent = checkboxes.length;
}

function applyRecommendation(text) {
    const recommendBtn = document.getElementById('recommendAgentsBtn');
    const noteEl = document.getElementById('recommendAgentsNote');
    if (!text || !text.trim()) {
        if (recommendBtn) recommendBtn.hidden = true;
        if (noteEl) noteEl.textContent = '';
        return;
    }
    if (recommendBtn) recommendBtn.hidden = false;
}

function runRecommendation() {
    const commandInput = document.getElementById('commandInput');
    const topicInput = document.getElementById('topicInput');
    const text = (commandInput && commandInput.value) || (topicInput && topicInput.value) || '';
    if (!text.trim()) return;
    const allAgents = AgentRegistry.listAnalysisAgents();
    const ranked = ProviderRouter.selectRelevantAgents(text, allAgents, RECOMMEND_COUNT);
    const recommendedIds = ranked.map(function(a) { return a.id; });
    document.querySelectorAll('.agent-checkbox').forEach(function(cb) {
        cb.checked = recommendedIds.indexOf(cb.dataset.agent) !== -1;
    });
    updateSelectedCount();
    const noteEl = document.getElementById('recommendAgentsNote');
    if (noteEl) {
        const names = ranked.slice(0, 4).map(function(a) { return a.id; }).join(', ');
        const more = ranked.length > 4 ? ' +' + (ranked.length - 4) + ' lagi' : '';
        noteEl.textContent = 'Dipilih: ' + names + more;
    }
    if (window.showToast) window.showToast(ranked.length + ' agen relevan dipilih otomatis', 'success');
}

function wireControls() {
    const selectAllBtn = document.getElementById('selectAllAgentsBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.agent-checkbox').forEach(function(cb) { cb.checked = true; });
            updateSelectedCount();
        });
    }
    const deselectAllBtn = document.getElementById('deselectAllAgentsBtn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.agent-checkbox').forEach(function(cb) { cb.checked = false; });
            updateSelectedCount();
        });
    }
    const recommendBtn = document.getElementById('recommendAgentsBtn');
    if (recommendBtn) {
        recommendBtn.addEventListener('click', runRecommendation);
    }
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('agent-checkbox')) {
            updateSelectedCount();
        }
    });
    document.addEventListener('input', function(e) {
        if (e.target && e.target.id === 'commandInput') {
            const value = e.target.value;
            clearTimeout(recommendDebounceTimer);
            recommendDebounceTimer = setTimeout(function() { applyRecommendation(value); }, 500);
        }
    });
}

function renderUI(container) {
    if (!container) return;
    container.className = 'agent-controls';
    container.innerHTML =
        '<div class="agent-buttons">' +
            '<button id="selectAllAgentsBtn" class="btn-agent-select"><span class="ac-btn-label">Select All</span></button>' +
            '<button id="deselectAllAgentsBtn" class="btn-agent-deselect"><span class="ac-btn-label">Deselect</span></button>' +
            '<button id="recommendAgentsBtn" class="btn-agent-select" hidden><span class="ac-btn-label">Rekomendasikan Agen</span></button>' +
        '</div>' +
        '<div class="ac-recommend-note" id="recommendAgentsNote"></div>' +
        '<div class="agent-stats">' +
            HEAD_SEG +
            '<span class="ac-stat-num" id="selectedAgentsCount">0/0</span>' +
            '<span class="ac-stat-div"></span>' +
            '<span class="ac-stat-num" id="totalAgentCount">0</span>' +
            '<span class="ac-stat-lbl">total agents</span>' +
        '</div>';
    wireControls();
    updateSelectedCount();
    guardCount(container);
}

export const AgentControl = Object.freeze({ renderUI: renderUI, updateSelectedCount: updateSelectedCount });

KESEMPATAN.AgentControl = AgentControl;

document.addEventListener('DOMContentLoaded', function() {
    const controlContainer = document.getElementById('agentControlContainer');
    renderUI(controlContainer);
    setTimeout(function() { updateSelectedCount(); }, 700);
});

window.addEventListener('load', function() {
    setTimeout(function() { updateSelectedCount(); }, 300);
});
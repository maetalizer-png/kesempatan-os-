(function() {
'use strict';
if (window.__AgentControlLoaded) return;
window.__AgentControlLoaded = true;

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
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('agent-checkbox')) {
            updateSelectedCount();
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
        '</div>' +
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

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.AgentControl = Object.freeze({ renderUI: renderUI, updateSelectedCount: updateSelectedCount });
window.AgentControl = { renderUI: renderUI, updateSelectedCount: updateSelectedCount };
window.updateSelectedCount = updateSelectedCount;

document.addEventListener('DOMContentLoaded', function() {
    const controlContainer = document.getElementById('agentControlContainer');
    renderUI(controlContainer);
    setTimeout(function() { updateSelectedCount(); }, 700);
});

window.addEventListener('load', function() {
    setTimeout(function() { updateSelectedCount(); }, 300);
});
})();
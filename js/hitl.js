import { Utils } from './utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const escapeHtml = Utils.escapeHtml || function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(char) {
        const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return entityMap[char] || char;
    });
};

const Logger = Utils.Logger || {
    system: function() {}, log: function() {}, info: function() {},
    warn: function() {}, error: function() {}, success: function() {}
};

const showToast = Utils.showToast || function() {};

const InternalLogger = Object.freeze({
    _logs: [],
    _maxLogs: 500,
    _levels: Object.freeze({ DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 }),
    _level: 1,
    log: function(level, module, message, data) {
        const entry = Object.freeze({
            timestamp: Date.now(),
            level: level,
            module: module,
            message: message,
            data: data || null,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
        });
        this._logs.push(entry);
        if (this._logs.length > this._maxLogs) this._logs.shift();
        return entry;
    },
    debug: function(module, message, data) { return this.log(this._levels.DEBUG, module, message, data); },
    info: function(module, message, data) { return this.log(this._levels.INFO, module, message, data); },
    warn: function(module, message, data) { return this.log(this._levels.WARN, module, message, data); },
    error: function(module, message, data) { return this.log(this._levels.ERROR, module, message, data); },
    critical: function(module, message, data) { return this.log(this._levels.CRITICAL, module, message, data); },
    getLogs: function(level, limit) {
        limit = limit || 100;
        let result = this._logs;
        if (level !== undefined) result = result.filter(function(log) { return log.level >= level; });
        return result.slice(-limit);
    },
    clear: function() { this._logs = []; },
    setLevel: function(level) { this._level = level; },
    getLevel: function() { return this._level; }
});

let pendingAgentResults = [];
let onConfirmCallback = null;
let autoProcessTimeout = null;
let isProcessing = false;

function ensureHitlPanelStructure() {
    let panel = document.getElementById('hitlPanel');
    if (!panel) {
        let container = document.getElementById('reportContainer');
        if (!container) container = document.querySelector('.card.full-width');
        if (!container) container = document.body;
        panel = document.createElement('div');
        panel.id = 'hitlPanel';
        panel.style.cssText = 'margin-top:20px; display:none;';
        container.appendChild(panel);
    }
    if (!document.getElementById('hitlResultsList')) {
        panel.innerHTML = '';
        const title = document.createElement('h3');
        title.className = 'hitl-legacy-title';
        title.textContent = 'Human-in-the-Loop Review';
        panel.appendChild(title);
        const listDiv = document.createElement('div');
        listDiv.id = 'hitlResultsList';
        panel.appendChild(listDiv);
        const btn = document.createElement('button');
        btn.id = 'confirmAggregationBtn';
        btn.className = 'hitl-confirm-btn';
        btn.textContent = 'Process Final Aggregation';
        panel.appendChild(btn);
        InternalLogger.info('HITL', 'Panel structure created');
    }
    return panel;
}

function renderHitlPanel(results) {
    const panel = ensureHitlPanelStructure();
    panel.style.display = 'block';
    const listDiv = document.getElementById('hitlResultsList');
    if (!listDiv) {
        InternalLogger.error('HITL', 'listDiv not found');
        return;
    }
    listDiv.innerHTML = '';

    pendingAgentResults = results.map(function(result) {
        return {
            agent: result.agent,
            originalResult: result,
            approved: true,
            editedScore: result.score || 50
        };
    });

    for (let i = 0; i < pendingAgentResults.length; i++) {
        const item = pendingAgentResults[i];
        const div = document.createElement('div');
        div.className = 'hitl-item';
        div.innerHTML =
            '<div class="hitl-item-header">' +
                '<span class="hitl-agent-name">' + escapeHtml(item.agent) + '</span>' +
                '<div class="hitl-actions">' +
                    '<button class="approve-btn" data-agent="' + escapeHtml(item.agent) + '">Approve</button>' +
                    '<button class="reject-btn" data-agent="' + escapeHtml(item.agent) + '">Reject</button>' +
                    '<span class="hitl-score-label">Score:</span>' +
                    '<input type="number" class="hitl-score-edit" data-agent="' + escapeHtml(item.agent) + '" value="' + item.editedScore + '" min="0" max="100">' +
                '</div>' +
            '</div>' +
            '<div class="hitl-summary"><strong>Summary:</strong> ' + escapeHtml(item.originalResult.summary?.substring(0, 150) || '') + '</div>' +
            '<div class="hitl-rationale">' + escapeHtml(item.originalResult.reasoning_summary || '') + '</div>';
        listDiv.appendChild(div);
    }

    document.querySelectorAll('.approve-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const agent = this.dataset.agent;
            const item = pendingAgentResults.find(function(i) { return i.agent === agent; });
            if (item) {
                item.approved = true;
                this.textContent = 'Approved';
                this.disabled = true;
                if (typeof broadcastHitlDecision !== 'undefined') {
                    broadcastHitlDecision(agent, true, item.editedScore);
                }
                if (pendingAgentResults.every(function(i) { return i.approved; })) {
                    const confirmBtn = document.getElementById('confirmAggregationBtn');
                    if (confirmBtn && !isProcessing) {
                        isProcessing = true;
                        setTimeout(function() {
                            confirmBtn.click();
                            isProcessing = false;
                        }, 500);
                    }
                }
            }
        });
    });

    document.querySelectorAll('.reject-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const agent = this.dataset.agent;
            const item = pendingAgentResults.find(function(i) { return i.agent === agent; });
            if (item) {
                item.approved = false;
                this.textContent = 'Rejected';
                this.disabled = true;
                if (typeof broadcastHitlDecision !== 'undefined') {
                    broadcastHitlDecision(agent, false, item.editedScore);
                }
            }
        });
    });

    document.querySelectorAll('.hitl-score-edit').forEach(function(input) {
        input.addEventListener('change', function() {
            const agent = this.dataset.agent;
            const item = pendingAgentResults.find(function(i) { return i.agent === agent; });
            if (item) {
                const value = parseInt(this.value, 10);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                    item.editedScore = value;
                    item.originalResult.score = value;
                }
            }
        });
    });

    const confirmBtn = document.getElementById('confirmAggregationBtn');
    if (confirmBtn) {
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        newBtn.addEventListener('click', function() {
            if (window._hitlCallback) {
                const approved = pendingAgentResults.filter(function(i) { return i.approved; });
                if (approved.length === 0) {
                    InternalLogger.info('HITL', 'No approved, using all results');
                    window._hitlCallback(pendingAgentResults);
                } else {
                    window._hitlCallback(approved);
                }
            }
        });
    }

    if (autoProcessTimeout) {
        clearTimeout(autoProcessTimeout);
        autoProcessTimeout = null;
    }

    autoProcessTimeout = setTimeout(function() {
        const panelVisible = document.getElementById('hitlPanel')?.style.display !== 'none';
        const confirmBtnEl = document.getElementById('confirmAggregationBtn');
        if (panelVisible && confirmBtnEl && !isProcessing) {
            if (pendingAgentResults.every(function(i) { return i.approved; })) {
                InternalLogger.info('HITL', 'Auto-processing all approved');
                isProcessing = true;
                confirmBtnEl.click();
                isProcessing = false;
            } else {
                const approved = pendingAgentResults.filter(function(i) { return i.approved; });
                if (approved.length > 0) {
                    InternalLogger.info('HITL', 'Auto-processing ' + approved.length + ' approved');
                    isProcessing = true;
                    pendingAgentResults = approved;
                    confirmBtnEl.click();
                    isProcessing = false;
                } else if (pendingAgentResults.length > 0) {
                    InternalLogger.info('HITL', 'Auto-processing all (' + pendingAgentResults.length + ')');
                    pendingAgentResults.forEach(function(i) { i.approved = true; });
                    isProcessing = true;
                    confirmBtnEl.click();
                    isProcessing = false;
                }
            }
        }
        autoProcessTimeout = null;
    }, 30000);

    InternalLogger.info('HITL', 'Panel rendered with ' + pendingAgentResults.length + ' agents');
}

function setHitlConfirmCallback(callback) {
    onConfirmCallback = callback;
    window._hitlCallback = callback;
    const confirmBtn = document.getElementById('confirmAggregationBtn');
    if (confirmBtn) {
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        newBtn.addEventListener('click', function() {
            if (onConfirmCallback) {
                const approved = pendingAgentResults.filter(function(i) { return i.approved; });
                if (approved.length === 0) {
                    InternalLogger.info('HITL', 'No approved, using all results');
                    onConfirmCallback(pendingAgentResults);
                } else {
                    onConfirmCallback(approved);
                }
            }
        });
    }
}

function getApprovedResults() {
    return pendingAgentResults.filter(function(item) { return item.approved; });
}

function getAllResults() {
    return pendingAgentResults;
}

function hideHitlPanel() {
    const panel = document.getElementById('hitlPanel');
    if (panel) panel.style.display = 'none';
    if (autoProcessTimeout) {
        clearTimeout(autoProcessTimeout);
        autoProcessTimeout = null;
    }
}

function clearHitlPanel() {
    pendingAgentResults = [];
    const listDiv = document.getElementById('hitlResultsList');
    if (listDiv) listDiv.innerHTML = '';
    if (autoProcessTimeout) {
        clearTimeout(autoProcessTimeout);
        autoProcessTimeout = null;
    }
    hideHitlPanel();
}

function autoApproveResults(results, mode) {
    if (mode !== 'act') return null;
    const autoApproved = results.map(function(result) {
        const recommendedThreshold = window.AutoLearning?.getRecommendedThreshold(result.agent) || 70;
        const approved = result.confidence >= recommendedThreshold;
        if (window.AutoLearning) {
            window.AutoLearning.recordApproval(result.agent, result.confidence, approved);
        }
        return {
            agent: result.agent,
            originalResult: result,
            approved: approved,
            editedScore: result.score
        };
    });
    const approvedCount = autoApproved.filter(function(item) { return item.approved; }).length;
    if (typeof Logger !== 'undefined') {
        Logger.system('[AUTONOMY:ACT] Auto-approved ' + approvedCount + '/' + results.length + ' agents');
    }
    if (approvedCount === 0) return null;
    return autoApproved;
}

function renderHITLInReport(results, onConfirm) {
    if (!results || results.length === 0) {
        if (window.showToast) window.showToast('No results to review', 'error');
        return;
    }
    const reportContainer = document.getElementById('reportContainer');
    if (!reportContainer) {
        if (window.showToast) window.showToast('Report container not found', 'error');
        return;
    }
    const oldPanel = document.getElementById('hitlReportPanel');
    if (oldPanel) oldPanel.remove();

    const state = {
        results: results,
        approved: {},
        editedScores: {},
        onConfirm: onConfirm || null
    };
    results.forEach(function(result) {
        state.approved[result.agent] = true;
        state.editedScores[result.agent] = result.score || 50;
    });

    const panel = document.createElement('div');
    panel.id = 'hitlReportPanel';
    panel.style.marginTop = '24px';

    const header = document.createElement('div');
    header.className = 'hitl-header';
    header.innerHTML =
        '<div class="hitl-header-left">' +
            '<h3 class="hitl-title">Human-in-the-Loop Review</h3>' +
            '<span id="hitlStatusBadge" class="hitl-badge">' + results.length + ' agents</span>' +
        '</div>' +
        '<div class="hitl-header-right">' +
            '<span id="hitlProgressText" class="hitl-progress"><span id="hitlApprovedCount">' + results.length + '</span>/' + results.length + ' approved</span>' +
            '<button id="hitlToggleBtn" class="hitl-toggle">− Hide</button>' +
        '</div>';
    panel.appendChild(header);

    const infoBar = document.createElement('div');
    infoBar.className = 'hitl-infobar';
    infoBar.innerHTML =
        '<span>Review each agent, check to approve</span>' +
        '<div class="hitl-infobar-actions">' +
            '<button id="hitlApproveAllBtn" class="hitl-approve-all">Approve All</button>' +
            '<button id="hitlRejectAllBtn" class="hitl-reject-all">Reject All</button>' +
        '</div>';
    panel.appendChild(infoBar);

    const listDiv = document.createElement('div');
    listDiv.id = 'hitlReportList';
    listDiv.className = 'hitl-list';

    results.forEach(function(result) {
        const isApproved = state.approved[result.agent] !== false;
        const editedScore = state.editedScores[result.agent];
        const score = (editedScore !== undefined && editedScore !== null) ? editedScore
            : (result.score !== undefined && result.score !== null) ? result.score
            : 50;

        let explainTitle = '';
        try {
            if (window.AutoLearning && typeof window.AutoLearning.explain === 'function') {
                const explanation = window.AutoLearning.explain(result.agent);
                if (explanation && explanation.threshold && explanation.threshold.reason) {
                    explainTitle = explanation.threshold.reason.replace(/"/g, '&quot;');
                }
            }
        } catch (error) { console.warn('[HITL] AutoLearning explain failed:', error.message); }

        const explainIcon = explainTitle
            ? '<span title="' + explainTitle + '" class="hitl-explain">?</span>'
            : '';

        const agentDiv = document.createElement('div');
        agentDiv.className = 'hitl-report-item' + (isApproved ? '' : ' rejected');
        agentDiv.dataset.agent = result.agent;
        agentDiv.innerHTML =
            '<div class="hitl-item-main">' +
                '<input type="checkbox" class="hitl-approve-checkbox" data-agent="' + escapeHtml(result.agent) + '" ' + (isApproved ? 'checked' : '') + '>' +
                '<span class="hitl-item-name">' + escapeHtml(result.agent) + '</span>' +
                '<span class="hitl-conf">conf: ' + (result.confidence || 70) + '%' + explainIcon + '</span>' +
            '</div>' +
            '<div class="hitl-item-side">' +
                '<span class="hitl-score-label">Score:</span>' +
                '<input type="number" class="hitl-score-input" data-agent="' + escapeHtml(result.agent) + '" value="' + score + '" min="0" max="100">' +
                '<span class="hitl-status-label">' + (isApproved ? 'Approved' : 'Rejected') + '</span>' +
            '</div>';
        listDiv.appendChild(agentDiv);
    });
    panel.appendChild(listDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'hitl-actions-row';
    actionsDiv.innerHTML =
        '<button id="hitlCancelBtn" class="hitl-cancel">Cancel</button>' +
        '<button id="hitlConfirmBtn" class="hitl-confirm">Process Aggregation</button>';
    panel.appendChild(actionsDiv);

    reportContainer.appendChild(panel);

    const toggleBtn = document.getElementById('hitlToggleBtn');
    const listContainer = listDiv;
    const infoBarEl = infoBar;
    const actionsEl = actionsDiv;
    let isVisible = true;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            isVisible = !isVisible;
            listContainer.style.display = isVisible ? 'block' : 'none';
            infoBarEl.style.display = isVisible ? 'flex' : 'none';
            actionsEl.style.display = isVisible ? 'flex' : 'none';
            this.textContent = isVisible ? '− Hide' : '+ Show';
        });
    }

    document.querySelectorAll('.hitl-approve-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            const agent = this.dataset.agent;
            state.approved[agent] = this.checked;
            updateHitlStatus(agent);
            updateHitlStats();
        });
    });

    document.querySelectorAll('.hitl-score-input').forEach(function(input) {
        input.addEventListener('change', function() {
            const agent = this.dataset.agent;
            const value = parseInt(this.value, 10);
            if (!isNaN(value) && value >= 0 && value <= 100) {
                state.editedScores[agent] = value;
                const result = state.results.find(function(r) { return r.agent === agent; });
                if (result) result.score = value;
            } else {
                this.value = state.editedScores[agent] || 50;
            }
        });
    });

    const approveAllBtn = document.getElementById('hitlApproveAllBtn');
    if (approveAllBtn) {
        approveAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.hitl-approve-checkbox').forEach(function(checkbox) {
                checkbox.checked = true;
                const agent = checkbox.dataset.agent;
                state.approved[agent] = true;
                updateHitlStatus(agent);
            });
            updateHitlStats();
            if (window.showToast) window.showToast('All agents approved', 'success');
        });
    }

    const rejectAllBtn = document.getElementById('hitlRejectAllBtn');
    if (rejectAllBtn) {
        rejectAllBtn.addEventListener('click', function() {
            document.querySelectorAll('.hitl-approve-checkbox').forEach(function(checkbox) {
                checkbox.checked = false;
                const agent = checkbox.dataset.agent;
                state.approved[agent] = false;
                updateHitlStatus(agent);
            });
            updateHitlStats();
            if (window.showToast) window.showToast('All agents rejected', 'info');
        });
    }

    const cancelBtn = document.getElementById('hitlCancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const panelEl = document.getElementById('hitlReportPanel');
            if (panelEl) panelEl.style.display = 'none';
            if (window.showToast) window.showToast('Review cancelled', 'info');
        });
    }

    const confirmBtn = document.getElementById('hitlConfirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const approvedList = state.results.filter(function(result) {
                return state.approved[result.agent] !== false;
            });
            if (approvedList.length === 0) {
                if (window.showToast) window.showToast('No agents approved!', 'error');
                return;
            }
            approvedList.forEach(function(result) {
                const editedScore = state.editedScores[result.agent];
                result.score = (editedScore !== undefined && editedScore !== null) ? editedScore
                    : (result.score !== undefined && result.score !== null) ? result.score
                    : 50;
            });
            if (window.showToast) window.showToast(approvedList.length + ' agents processed', 'success');
            if (typeof state.onConfirm === 'function') {
                state.onConfirm(approvedList);
            } else if (typeof window._hitlCallback === 'function') {
                window._hitlCallback(approvedList);
            } else {
                window.__hitlApprovedResults = approvedList;
                if (window.showToast) window.showToast('Results saved, continue to aggregation', 'success');
                const event = new CustomEvent('hitlConfirmed', { detail: { approved: approvedList } });
                document.dispatchEvent(event);
            }
            const panelEl = document.getElementById('hitlReportPanel');
            if (panelEl) panelEl.style.display = 'none';
        });
    }

    function updateHitlStatus(agent) {
        const item = document.querySelector('.hitl-report-item[data-agent="' + agent + '"]');
        if (!item) return;
        const isApproved = state.approved[agent] !== false;
        item.classList.toggle('rejected', !isApproved);
        const label = item.querySelector('.hitl-status-label');
        if (label) label.textContent = isApproved ? 'Approved' : 'Rejected';
    }

    function updateHitlStats() {
        const total = state.results.length;
        const approved = state.results.filter(function(result) {
            return state.approved[result.agent] !== false;
        }).length;
        const countSpan = document.getElementById('hitlApprovedCount');
        if (countSpan) countSpan.textContent = approved;
        const badge = document.getElementById('hitlStatusBadge');
        if (badge) {
            badge.textContent = approved + '/' + total + ' approved';
            badge.classList.toggle('partial', approved !== total);
        }
    }

    updateHitlStats();
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return panel;
}

function addHITLButtonToReport(results) {
    const reportContainer = document.getElementById('reportContainer');
    if (!reportContainer) return;
    if (document.getElementById('hitlReportButton')) return;

    const btnWrapper = document.createElement('div');
    btnWrapper.id = 'hitlReportButton';
    btnWrapper.className = 'hitl-report-button-wrap';
    const btn = document.createElement('button');
    btn.id = 'hitlShowPanelBtn';
    btn.innerHTML = 'Review & Approve Agents';
    btn.title = 'Open HITL panel to review each agent';
    btn.addEventListener('click', function() {
        const existingPanel = document.getElementById('hitlReportPanel');
        if (existingPanel) {
            existingPanel.style.display = existingPanel.style.display === 'none' ? 'block' : 'none';
            if (existingPanel.style.display === 'block') {
                existingPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        renderHITLInReport(results, function(approved) {
            window.__hitlApprovedResults = approved;
            document.dispatchEvent(new CustomEvent('hitlConfirmed', { detail: { approved: approved } }));
            if (window.showToast) window.showToast(approved.length + ' agents re-aggregated', 'success');
        });
    });
    btnWrapper.appendChild(btn);
    reportContainer.appendChild(btnWrapper);
}

export const HITL = Object.freeze({
    renderPanel: renderHitlPanel,
    setConfirmCallback: setHitlConfirmCallback,
    getApprovedResults: getApprovedResults,
    getAllResults: getAllResults,
    hidePanel: hideHitlPanel,
    clearPanel: clearHitlPanel,
    autoApproveResults: autoApproveResults,
    renderHITLInReport: renderHITLInReport,
    addHITLButtonToReport: addHITLButtonToReport
});

KESEMPATAN.HITL = HITL;

KESEMPATAN.setWorkflowResultsForHITL = function(results) {
    window.__lastWorkflowResults = results;
    setTimeout(function() {
        addHITLButtonToReport(results);
        const globalInternalLogger = KESEMPATAN.InternalLogger || window.InternalLogger;
        if (globalInternalLogger) globalInternalLogger.info('HITL', 'HITL button added to report');
    }, 600);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureHitlPanelStructure);
} else {
    ensureHitlPanelStructure();
}

InternalLogger.info('HITL', 'HITL module loaded');
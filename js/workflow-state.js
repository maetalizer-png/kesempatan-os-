(function() {
'use strict';
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__WorkflowStateLoaded) return;
window.__WorkflowStateLoaded = true;

const { showToast, InternalLogger } = window.Utils || {};

let analyticsData = [];
const WORKFLOW_STATE_KEY = 'kes_workflow_state';
const ANALYTICS_KEY = 'kes_workflow_analytics';

function addWorkflowControls(mode) {
    let panel = document.getElementById('workflowControlPanel');
    if (panel) return;
    panel = document.createElement('div');
    panel.id = 'workflowControlPanel';
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.right = '20px';
    panel.style.zIndex = '9999';
    panel.style.background = 'rgba(0,0,0,0.92)';
    panel.style.backdropFilter = 'blur(12px)';
    panel.style.borderRadius = '50px';
    panel.style.padding = '8px 16px';
    panel.style.border = '2px solid ' + (mode === 'parallel' ? '#FFD700' : '#00FFA3');
    panel.style.display = 'flex';
    panel.style.alignItems = 'center';
    panel.style.gap = '10px';
    panel.style.boxShadow = '0 0 30px ' + (mode === 'parallel' ? 'rgba(255,215,0,0.2)' : 'rgba(0,255,163,0.2)');
    const modeLabel = mode === 'parallel' ? '⚡ PARALEL' : '🐢 SEQUENTIAL';
    const modeColor = mode === 'parallel' ? '#FFD700' : '#00FFA3';
    panel.innerHTML =
        '<span style="color:' + modeColor + ';font-size:11px;font-weight:bold;padding-right:10px;border-right:1px solid rgba(255,255,255,0.1);">' + modeLabel + '</span>' +
        '<button id="workflowPauseBtn" style="background:#FFD700; border:none; border-radius:30px; padding:6px 16px; color:#03050A; font-weight:bold; cursor:pointer; font-size:11px;">⏸️ PAUSE</button>' +
        '<button id="workflowStopBtn" style="background:#ff4444; border:none; border-radius:30px; padding:6px 16px; color:white; font-weight:bold; cursor:pointer; font-size:11px;">⏹️ STOP</button>' +
        '<button id="workflowModeToggleBtn" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:30px; padding:6px 12px; color:#A0B3C9; font-size:10px; cursor:pointer; transition:0.2s;">🔄 Mode</button>' +
        '<span id="workflowStatus" style="color:#00FFA3;font-size:10px;font-weight:bold;padding-left:6px;">● RUNNING</span>';
    document.body.appendChild(panel);

    document.getElementById('workflowPauseBtn')?.addEventListener('click', function() {
        KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused = !KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused;
        const btn = document.getElementById('workflowPauseBtn');
        const status = document.getElementById('workflowStatus');
        if (KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused) {
            btn.textContent = '▶️ RESUME';
            btn.style.background = '#00FFA3';
            if (status) {
                status.textContent = '⏸️ PAUSED';
                status.style.color = '#FFD700';
            }
            if (showToast) showToast('⏸️ Workflow dijeda', 'info');
        } else {
            btn.textContent = '⏸️ PAUSE';
            btn.style.background = '#FFD700';
            if (status) {
                status.textContent = '● RUNNING';
                status.style.color = '#00FFA3';
            }
            if (showToast) showToast('▶️ Workflow dilanjutkan', 'info');
        }
    });

    document.getElementById('workflowStopBtn')?.addEventListener('click', function() {
        KESEMPATAN.Runtime.WorkflowRuntimeFlags.abort = true;
        KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused = false;
        const status = document.getElementById('workflowStatus');
        if (status) {
            status.textContent = '⏹️ STOPPED';
            status.style.color = '#ff4444';
        }
        if (showToast) showToast('⏹️ Workflow dihentikan', 'info');
    });

    document.getElementById('workflowModeToggleBtn')?.addEventListener('click', function() {
        const newMode = mode === 'sequential' ? 'parallel' : 'sequential';
        KESEMPATAN.Runtime.WorkflowRuntimeFlags.userMode = newMode;
        localStorage.setItem('kes_workflow_mode', newMode);
        const label = newMode === 'parallel' ? '⚡ PARALEL' : '🐢 SEQUENTIAL';
        const color = newMode === 'parallel' ? '#FFD700' : '#00FFA3';
        panel.style.borderColor = color;
        const modeSpan = panel.querySelector('span:first-child');
        if (modeSpan) {
            modeSpan.textContent = label;
            modeSpan.style.color = color;
        }
        if (showToast) showToast('🔄 Mode: ' + newMode.toUpperCase(), 'info');
    });
}

function removeWorkflowControls() {
    const panel = document.getElementById('workflowControlPanel');
    if (panel) panel.remove();
}

function saveWorkflowState(state, mode) {
    try {
        localStorage.setItem(WORKFLOW_STATE_KEY, JSON.stringify({
            ...state,
            mode: mode,
            savedAt: Date.now()
        }));
    } catch (e) {
        InternalLogger.warn('Workflow', 'Save state failed: ' + e.message);
    }
}

function loadWorkflowState() {
    try {
        const saved = localStorage.getItem(WORKFLOW_STATE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        InternalLogger.warn('Workflow', 'Load state failed: ' + e.message);
    }
    return null;
}

function clearWorkflowState() {
    try {
        localStorage.removeItem(WORKFLOW_STATE_KEY);
    } catch (e) {
        InternalLogger.warn('Workflow', 'Clear state failed: ' + e.message);
    }
}

function showResumeDialog(savedState) {
    const timeAgo = Math.floor((Date.now() - savedState.savedAt) / 1000 / 60);
    return confirm('⚠️ Ada workflow yang belum selesai!\n\nTopik: "' + (savedState.topic?.substring(0, 50) || 'Unknown') + '"\nProgress: ' + savedState.completedCount + '/' + savedState.totalAgents + ' agen\nMode: ' + (savedState.mode || 'unknown') + '\nWaktu: ' + timeAgo + ' menit lalu\n\nLanjutkan dari mana terakhir?');
}

function saveAnalytics(data) {
    analyticsData.push({ ...data, timestamp: Date.now() });
    if (analyticsData.length > 100) analyticsData.shift();
    try {
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analyticsData));
    } catch (e) {
        InternalLogger.warn('Workflow', 'Save analytics failed: ' + e.message);
    }
}

function loadAnalytics() {
    try {
        const saved = localStorage.getItem(ANALYTICS_KEY);
        if (saved) analyticsData = JSON.parse(saved);
    } catch (e) {
        InternalLogger.warn('Workflow', 'Load analytics failed: ' + e.message);
    }
}

loadAnalytics();

KESEMPATAN.WorkflowState = Object.freeze({
    addWorkflowControls: addWorkflowControls,
    removeWorkflowControls: removeWorkflowControls,
    saveWorkflowState: saveWorkflowState,
    loadWorkflowState: loadWorkflowState,
    clearWorkflowState: clearWorkflowState,
    showResumeDialog: showResumeDialog,
    saveAnalytics: saveAnalytics,
    loadAnalytics: loadAnalytics
});
})();
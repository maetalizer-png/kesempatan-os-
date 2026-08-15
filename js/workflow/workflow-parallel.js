import { Utils } from '../core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const { Logger, showToast } = Utils;





let workflowStartTime = null;
let timerInterval = null;
let estimasiInterval = null;
let estimasiWaktuMulai = null;
let updateWorkflowUIModeRef = null;

function detectOptimalBatchSize() {
    try {
        const ram = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        if (ram >= 8 && cores >= 8) return 10;
        if (ram >= 6 && cores >= 6) return 7;
        if (ram >= 4 && cores >= 4) return 5;
        if (ram >= 2 && cores >= 2) return 3;
        return 2;
    } catch (e) {
        return 3;
    }
}

function getOptimalBatchSize() {
    const detected = detectOptimalBatchSize();
    return Math.min(KESEMPATAN.Runtime.WorkflowConfig.maxBatchSize, Math.max(KESEMPATAN.Runtime.WorkflowConfig.minBatchSize, detected));
}

function getRateLimit(agent) {
    const priorityAgents = ['RahmadRaharjo', 'Manager', 'StartupFounder', 'Hunter', 'Strategist'];
    if (priorityAgents.includes(agent)) return 300;
    const techAgents = ['Analyst', 'Verifier', 'Researcher', 'Optimizer'];
    if (techAgents.includes(agent)) return 500;
    return 700;
}

function prioritySortAgents(agents) {
    if (!KESEMPATAN.Runtime.WorkflowConfig.enablePriorityQueue) return agents;
    const priorityAgents = ['RahmadRaharjo', 'Manager', 'StartupFounder', 'Hunter', 'Strategist'];
    const sorted = [];
    const remaining = [];
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        if (priorityAgents.includes(agent)) sorted.push(agent);
        else remaining.push(agent);
    }
    return sorted.concat(remaining);
}

function startTimer() {
    workflowStartTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay && !KESEMPATAN.Runtime.WorkflowRuntimeFlags.abort && !KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused) {
            timerDisplay.textContent = ((Date.now() - workflowStartTime) / 1000).toFixed(1);
        }
    }, 100);
}

function stopTimer(mode) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    const totalTime = workflowStartTime ? (Date.now() - workflowStartTime) / 1000 : 0;
    if (Logger) {
        Logger.system('Eksekusi selesai dalam ' + totalTime.toFixed(1) + ' detik (' + mode + ')');
    }
    return totalTime;
}

function selectMode(agentCount) {
    const userMode = localStorage.getItem('kes_workflow_mode') || 'auto';
    if (userMode === 'parallel') return 'parallel';
    if (userMode === 'sequential') return 'sequential';
    if (userMode === 'manual') return 'manual';
    if (userMode === 'auto' || !KESEMPATAN.Runtime.WorkflowConfig.autoMode) {
        return agentCount < KESEMPATAN.Runtime.WorkflowConfig.sequentialThreshold ? 'sequential' : 'parallel';
    }
    return 'sequential';
}

function mulaiEstimasiWaktu(totalAgen, mode) {
    estimasiWaktuMulai = Date.now();
    if (estimasiInterval) clearInterval(estimasiInterval);
    const multiplier = mode === 'parallel' ? 0.25 : 1;
    const batchInfo = mode === 'parallel' ? ' ' + getOptimalBatchSize() + 'x' : '';
    estimasiInterval = setInterval(function() {
        if (KESEMPATAN.Runtime.WorkflowRuntimeFlags.abort || KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused) return;
        const progressSpan = document.getElementById('agentProgress');
        if (!progressSpan) return;
        const parts = progressSpan.textContent.split('/');
        const completed = parseInt(parts[0]) || 0;
        if (completed === 0) return;
        const elapsed = (Date.now() - estimasiWaktuMulai) / 1000;
        const estimasiPerAgen = elapsed / completed;
        const remaining = totalAgen - completed;
        let estimasiDetik = Math.ceil(remaining * estimasiPerAgen * multiplier);
        let estimasiSpan = document.getElementById('estimasiWaktu');
        if (!estimasiSpan) {
            const loadingDiv = document.getElementById('loadingIndicator');
            if (loadingDiv) {
                estimasiSpan = document.createElement('div');
                estimasiSpan.id = 'estimasiWaktu';
                estimasiSpan.style.marginTop = '8px';
                estimasiSpan.style.fontSize = '11px';
                estimasiSpan.style.color = '#A0B3C9';
                loadingDiv.appendChild(estimasiSpan);
            }
        }
        if (estimasiSpan) {
            const modeLabel = mode === 'parallel' ? '⚡ Paralel' + batchInfo : '🐢 Sequential';
            if (estimasiDetik < 60) {
                estimasiSpan.innerHTML = modeLabel + ' — Estimasi selesai: ' + estimasiDetik + ' detik lagi';
            } else {
                const menit = Math.floor(estimasiDetik / 60);
                const detik = estimasiDetik % 60;
                estimasiSpan.innerHTML = modeLabel + ' — Estimasi selesai: ' + menit + ' menit ' + detik + ' detik lagi';
            }
        }
    }, 2000);
}

function hentikanEstimasiWaktu(mode) {
    if (estimasiInterval) clearInterval(estimasiInterval);
    const estimasiSpan = document.getElementById('estimasiWaktu');
    if (estimasiSpan && estimasiWaktuMulai) {
        estimasiSpan.innerHTML = '✅ Selesai dalam ' + ((Date.now() - estimasiWaktuMulai) / 1000).toFixed(1) + ' detik (' + mode + ')';
        setTimeout(function() {
            if (estimasiSpan) estimasiSpan.innerHTML = '';
        }, 5000);
    }
}

function renderParallelPage() {
    const inner = document.getElementById('premiumPageInner');
    if (!inner) return;
    const parallelMode = localStorage.getItem('kes_workflow_mode') === 'parallel';
    inner.innerHTML = '<div style="padding:20px;">' +
        '<h3 style="color:#00FFA3;">⚡ Mode Paralel (Cepat)</h3>' +
        '<label style="display:flex; align-items:center; gap:10px; margin:16px 0;">' +
        '<input type="checkbox" id="parallelModeSetting"' + (parallelMode ? ' checked' : '') + '>' +
        '<span>Aktifkan eksekusi paralel (3x lebih cepat)</span></label>' +
        '<p class="text-dim">Mode paralel menjalankan 3 agen sekaligus, mempercepat eksekusi 200 agen dari ~5 menit menjadi ~1.5 menit.</p></div>';
    const toggle = document.getElementById('parallelModeSetting');
    if (toggle) {
        toggle.addEventListener('change', function(e) {
            const mode = e.target.checked ? 'parallel' : 'auto';
            if (updateWorkflowUIModeRef) {
                updateWorkflowUIModeRef(mode);
            } else {
                localStorage.setItem('kes_workflow_mode', mode);
            }
            if (showToast) {
                showToast(e.target.checked ? '⚡ Parallel mode ON' : '🐢 Parallel mode OFF (Auto)', 'info');
            }
        });
    }
}

function injectWorkflowBadgeStyle() {
    const styleId = 'workflow-badge-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent =
        '.workflow-mode-badge { display: inline-block; padding: 2px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-left: 8px; }' +
        '.workflow-mode-badge.sequential { background: var(--primary); color: var(--bg-dark); }' +
        '.workflow-mode-badge.parallel { background: var(--color-yellow); color: var(--bg-dark); }' +
        '.workflow-mode-badge.auto { background: var(--color-purple); color: white; }' +
        '#workflowModeContainer .btn-workflow-mode {' +
            'position: relative; isolation: isolate;' +
            'clip-path: var(--kx-clip-asym);' +
            'width: auto !important; flex: 1 1 0 !important;' +
            'text-align: center;' +
            'border: 0; border-radius: 0;' +
            'padding: 6px 4px !important; font-size: 10px !important; font-weight: 700; letter-spacing: 0; white-space: nowrap;' +
            'cursor: pointer; overflow: hidden;' +
            '-webkit-appearance: none; appearance: none;' +
            '-webkit-tap-highlight-color: transparent; outline: none;' +
            'background: rgba(0,255,163,0.35); color: #00FFA3;' +
            'text-shadow: 0 0 6px rgba(0,255,163,0.25);' +
            'transition: transform .15s ease, filter .25s ease, background .25s ease, color .2s ease;' +
        '}' +
        '#workflowModeContainer .btn-workflow-mode::before {' +
            'content: \'\'; position: absolute; inset: 1px;' +
            'clip-path: var(--kx-clip-asym);' +
            'background: rgba(5,8,12,.78);' +
            'z-index: -1;' +
        '}' +
        '#workflowModeContainer .btn-workflow-mode:focus,' +
        '#workflowModeContainer .btn-workflow-mode:focus-visible { outline: none; }' +
        '#workflowModeContainer .btn-workflow-mode:active { transform: scale(.97); }' +
        '#workflowModeContainer .btn-workflow-mode.mode-auto.active {' +
            'background: rgba(155,89,182,.55); color: #9B59B6;' +
            'filter: drop-shadow(0 0 6px rgba(155,89,182,.35));' +
        '}' +
        '#workflowModeContainer .btn-workflow-mode.mode-sequential.active {' +
            'background: rgba(0,255,163,.55); color: #00FFA3;' +
            'filter: drop-shadow(0 0 6px rgba(0,255,163,.3));' +
        '}' +
        '#workflowModeContainer .btn-workflow-mode.mode-parallel.active {' +
            'background: rgba(255,215,0,.55); color: #FFD700;' +
            'filter: drop-shadow(0 0 6px rgba(255,215,0,.3));' +
        '}' +
        '#workflowModeContainer .btn-workflow-mode.mode-manual.active {' +
            'background: rgba(255,157,77,.55); color: #FF9D4D;' +
            'filter: drop-shadow(0 0 6px rgba(255,157,77,.3));' +
        '}' +
        '#workflowModeContainer {' +
            'box-sizing: border-box !important;' +
            'padding-left: 12px !important;' +
            'padding-right: 12px !important;' +
        '}' +
        '#workflowModeContainer .wf-mode-rim {' +
            'position: relative;' +
            'clip-path: var(--kx-clip);' +
            'background: rgba(0,255,163,.3);' +
            'padding: 1px;' +
            'margin: 12px 0;' +
        '}' +
        '#workflowModeContainer .wf-mode-rim-in {' +
            'position: relative;' +
            'clip-path: var(--kx-clip);' +
            'background: #05080c;' +
            'padding: 14px 16px;' +
        '}' +
        '@media (hover: hover) and (pointer: fine) {' +
            '#workflowModeContainer .btn-workflow-mode:hover { transform: translateY(-2px); }' +
        '}';
    document.head.appendChild(style);
}

function renderWorkflowModeSelector() {
    const container = document.getElementById('workflowModeContainer');
    if (!container || container.dataset.rendered === 'true') return;
    container.dataset.rendered = 'true';
    container.innerHTML = '<div class="wf-mode-rim">' +
        '<div class="wf-mode-rim-in">' +
        '<div style="font-size:11px; color:#A0B3C9; font-weight:600; margin-bottom:8px;">Execution Mode:</div>' +
        '<div style="display:flex; gap:8px; align-items:stretch; flex-wrap:wrap;">' +
            '<button id="workflowModeAuto" class="execute-btn btn-workflow-mode mode-auto">Auto</button>' +
            '<button id="workflowModeSequential" class="execute-btn btn-workflow-mode mode-sequential">Sequential</button>' +
            '<button id="workflowModeParallel" class="execute-btn btn-workflow-mode mode-parallel">Parallel</button>' +
            '<button id="workflowModeManual" class="execute-btn btn-workflow-mode mode-manual">HITL</button>' +
        '</div>' +
        '<div id="workflowModeStatus" style="font-size:9px; color:#A0B3C9; margin-top:8px; text-align:right;">Mode: <strong id="workflowModeDisplay">Auto</strong></div>' +
        '</div>' +
        '</div>';
}

function initWorkflowModeUI() {
    try {
        injectWorkflowBadgeStyle();
        renderWorkflowModeSelector();
        const modeAuto = document.getElementById('workflowModeAuto');
        const modeSeq = document.getElementById('workflowModeSequential');
        const modePar = document.getElementById('workflowModeParallel');
        const modeManual = document.getElementById('workflowModeManual');
        const modeDisplay = document.getElementById('workflowModeDisplay');
        const modeBadge = document.getElementById('workflowModeBadge');
        if (!modeAuto && !modeSeq && !modePar && !modeManual) return;

        function updateWorkflowUI(mode) {
            [modeAuto, modeSeq, modePar, modeManual].forEach(function(btn) {
                if (btn) btn.classList.remove('active');
            });
            let label = 'Auto';
            let badgeClass = 'auto';
            if (mode === 'auto') {
                if (modeAuto) modeAuto.classList.add('active');
                label = 'Auto';
                badgeClass = 'auto';
            } else if (mode === 'sequential') {
                if (modeSeq) modeSeq.classList.add('active');
                label = 'Sequential';
                badgeClass = 'sequential';
            } else if (mode === 'parallel') {
                if (modePar) modePar.classList.add('active');
                label = 'Parallel';
                badgeClass = 'parallel';
            } else if (mode === 'manual') {
                if (modeManual) modeManual.classList.add('active');
                label = 'HITL';
                badgeClass = 'manual';
            }
            if (modeDisplay) modeDisplay.textContent = label;
            if (modeBadge) {
                modeBadge.textContent = label;
                modeBadge.className = 'workflow-mode-badge pi-mode-badge ' + badgeClass;
            }
            if (KESEMPATAN.WorkflowEngine && KESEMPATAN.WorkflowEngine.setMode) {
                KESEMPATAN.WorkflowEngine.setMode(mode);
            }
            if (KESEMPATAN.WorkflowEngine) {
                KESEMPATAN.WorkflowEngine.currentMode = mode;
            }
            const changeEvent = new CustomEvent('workflowModeChanged', { detail: { mode: mode } });
            document.dispatchEvent(changeEvent);
        }

        updateWorkflowUIModeRef = updateWorkflowUI;

        if (modeAuto) {
            modeAuto.addEventListener('click', function(e) {
                e.preventDefault();
                updateWorkflowUI('auto');
                if (showToast) showToast('🔄 Auto mode', 'info');
            });
        }
        if (modeSeq) {
            modeSeq.addEventListener('click', function(e) {
                e.preventDefault();
                updateWorkflowUI('sequential');
                if (showToast) showToast('🐢 Sequential mode', 'info');
            });
        }
        if (modePar) {
            modePar.addEventListener('click', function(e) {
                e.preventDefault();
                updateWorkflowUI('parallel');
                if (showToast) showToast('⚡ Parallel mode ACTIVE!', 'success');
            });
        }
        if (modeManual) {
            modeManual.addEventListener('click', function(e) {
                e.preventDefault();
                updateWorkflowUI('manual');
                if (showToast) showToast('🙋 HITL mode (manual approval) ACTIVE', 'info');
            });
        }

        const savedMode = localStorage.getItem('kes_workflow_mode') || 'auto';
        updateWorkflowUI(savedMode);
    } catch (error) {
        const container = document.getElementById('workflowModeContainer');
        if (container) {
            container.innerHTML = '<div style="padding:8px 12px; color:#FF6B6B; font-size:11px; border:1px solid #FF6B6B; border-radius:8px;">⚠️ Execution Mode failed to load: ' + error.message + '</div>';
        }
        if (Logger) {
            Logger.error('Workflow', 'initWorkflowModeUI gagal: ' + error.message);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkflowModeUI);
} else {
    initWorkflowModeUI();
}

export const WorkflowParallel = Object.freeze({
    detectOptimalBatchSize: detectOptimalBatchSize,
    getOptimalBatchSize: getOptimalBatchSize,
    getRateLimit: getRateLimit,
    prioritySortAgents: prioritySortAgents,
    startTimer: startTimer,
    stopTimer: stopTimer,
    selectMode: selectMode,
    mulaiEstimasiWaktu: mulaiEstimasiWaktu,
    hentikanEstimasiWaktu: hentikanEstimasiWaktu,
    renderParallelPage: renderParallelPage,
    renderWorkflowModeSelector: renderWorkflowModeSelector,
    initWorkflowModeUI: initWorkflowModeUI
});

KESEMPATAN.WorkflowParallel = WorkflowParallel;
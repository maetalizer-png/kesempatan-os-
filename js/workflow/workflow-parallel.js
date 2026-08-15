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
  } catch (e) { return 3; }
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
    if (priorityAgents.includes(agents[i])) sorted.push(agents[i]);
    else remaining.push(agents[i]);
  }
  return sorted.concat(remaining);
}
function startTimer() {
  workflowStartTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(function () {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay && !KESEMPATAN.Runtime.WorkflowRuntimeFlags.abort && !KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused) {
      timerDisplay.textContent = ((Date.now() - workflowStartTime) / 1000).toFixed(1);
    }
  }, 100);
}
function stopTimer(mode) {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const totalTime = workflowStartTime ? (Date.now() - workflowStartTime) / 1000 : 0;
  if (Logger) Logger.system('Eksekusi selesai dalam ' + totalTime.toFixed(1) + ' detik (' + mode + ')');
  return totalTime;
}
function selectMode(agentCount) {
  const userMode = localStorage.getItem('kes_workflow_mode') || 'auto';
  if (userMode === 'parallel') return 'parallel';
  if (userMode === 'sequential') return 'sequential';
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
  estimasiInterval = setInterval(function () {
    if (KESEMPATAN.Runtime.WorkflowRuntimeFlags.abort || KESEMPATAN.Runtime.WorkflowRuntimeFlags.paused) return;
    const progressSpan = document.getElementById('agentProgress');
    if (!progressSpan) return;
    const completed = parseInt(progressSpan.textContent.split('/')[0]) || 0;
    if (completed === 0) return;
    const elapsed = (Date.now() - estimasiWaktuMulai) / 1000;
    const estimasiDetik = Math.ceil((totalAgen - completed) * (elapsed / completed) * multiplier);
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
      estimasiSpan.innerHTML = estimasiDetik < 60
        ? modeLabel + ' — Estimasi selesai: ' + estimasiDetik + ' detik lagi'
        : modeLabel + ' — Estimasi selesai: ' + Math.floor(estimasiDetik / 60) + ' menit ' + (estimasiDetik % 60) + ' detik lagi';
    }
  }, 2000);
}
function hentikanEstimasiWaktu(mode) {
  if (estimasiInterval) clearInterval(estimasiInterval);
  const estimasiSpan = document.getElementById('estimasiWaktu');
  if (estimasiSpan && estimasiWaktuMulai) {
    estimasiSpan.innerHTML = '✅ Selesai dalam ' + ((Date.now() - estimasiWaktuMulai) / 1000).toFixed(1) + ' detik (' + mode + ')';
    setTimeout(function () { if (estimasiSpan) estimasiSpan.innerHTML = ''; }, 5000);
  }
}
function renderParallelPage() {
  const inner = document.getElementById('premiumPageInner');
  if (!inner) return;
  const parallelMode = localStorage.getItem('kes_workflow_mode') === 'parallel';
  inner.innerHTML = '<div style="padding:20px;">' +
    '<h3 style="color:#00FFA3;">⚡ Mode Paralel (Cepat)</h3>' +
    '<label style="display:flex;align-items:center;gap:10px;margin:16px 0;">' +
    '<input type="checkbox" id="parallelModeSetting"' + (parallelMode ? ' checked' : '') + '>' +
    '<span>Aktifkan eksekusi paralel (3x lebih cepat)</span></label>' +
    '<p class="text-dim">Mode paralel menjalankan 3 agen sekaligus, mempercepat eksekusi 200 agen dari ~5 menit menjadi ~1.5 menit.</p></div>';
  const toggle = document.getElementById('parallelModeSetting');
  if (toggle) {
    toggle.addEventListener('change', function (e) {
      const mode = e.target.checked ? 'parallel' : 'auto';
      if (updateWorkflowUIModeRef) updateWorkflowUIModeRef(mode);
      else localStorage.setItem('kes_workflow_mode', mode);
      if (showToast) showToast(e.target.checked ? '⚡ Mode paralel ON' : '🐢 Mode paralel OFF (Auto)', 'info');
    });
  }
}

function injectWorkflowBadgeStyle() {
  const styleId = 'workflow-badge-style';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent =
    '.workflow-mode-badge { display:inline-block; padding:2px 12px; border-radius:20px; font-size:10px; font-weight:700; margin-left:8px; }' +
    '.workflow-mode-badge.sequential { background:var(--primary); color:var(--bg-dark); }' +
    '.workflow-mode-badge.parallel { background:var(--color-yellow); color:var(--bg-dark); }' +
    '.workflow-mode-badge.auto { background:var(--color-purple); color:white; }' +
    '#workflowModeContainer { box-sizing:border-box !important; padding-left:12px !important; padding-right:12px !important; }' +
    '.wf-mode-rim { position:relative; clip-path:var(--kx-clip); background:rgba(0,255,163,.3); padding:1px; margin:12px 0; }' +
    '.wf-mode-rim-in { position:relative; clip-path:var(--kx-clip); background:#05080c; padding:14px 16px; }' +
    '.wf-mode-rim .btn-workflow-mode { position:relative; isolation:isolate; clip-path:var(--kx-clip-asym); width:auto !important; flex:1 1 0 !important; text-align:center; border:0; border-radius:0; padding:6px 4px !important; font-size:10px !important; font-weight:700; white-space:nowrap; cursor:pointer; overflow:hidden; -webkit-appearance:none; appearance:none; -webkit-tap-highlight-color:transparent; outline:none; background:rgba(0,255,163,0.35); color:#00FFA3; text-shadow:0 0 6px rgba(0,255,163,0.25); transition:transform .15s ease, filter .25s ease, background .25s ease, color .2s ease; }' +
    '.wf-mode-rim .btn-workflow-mode::before { content:""; position:absolute; inset:1px; clip-path:var(--kx-clip-asym); background:rgba(5,8,12,.78); z-index:-1; }' +
    '.wf-mode-rim .btn-workflow-mode:focus, .wf-mode-rim .btn-workflow-mode:focus-visible { outline:none; }' +
    '.wf-mode-rim .btn-workflow-mode:active { transform:scale(.97); }' +
    '.wf-mode-rim .btn-workflow-mode.mode-auto.active { background:rgba(155,89,182,.55); color:#9B59B6; filter:drop-shadow(0 0 6px rgba(155,89,182,.35)); }' +
    '.wf-mode-rim .btn-workflow-mode.mode-sequential.active { background:rgba(0,255,163,.55); color:#00FFA3; filter:drop-shadow(0 0 6px rgba(0,255,163,.3)); }' +
    '.wf-mode-rim .btn-workflow-mode.mode-parallel.active { background:rgba(255,215,0,.55); color:#FFD700; filter:drop-shadow(0 0 6px rgba(255,215,0,.3)); }' +
    '@media (hover:hover) and (pointer:fine) { .wf-mode-rim .btn-workflow-mode:hover { transform:translateY(-2px); } }' +
    '.kx-sheet { position:fixed; inset:0; z-index:9990; display:none; }' +
    '.kx-sheet.on { display:block; }' +
    '.kx-sheet-back { position:absolute; inset:0; background:rgba(0,0,0,.55); }' +
    '.kx-sheet-card { position:absolute; left:0; right:0; bottom:0; max-height:72vh; overflow-y:auto; background:#05080c; border-top:1px solid rgba(0,255,163,.4); border-radius:16px 16px 0 0; padding:14px 16px 20px; }' +
    '.kx-sheet-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-weight:800; color:var(--primary); letter-spacing:1px; }' +
    '.kx-sheet-sub { font-size:11px; letter-spacing:1.2px; color:var(--primary); margin:12px 0 6px; font-weight:800; }' +
    '#sheetAgentsHost #agentControlContainer, #sheetAgentsHost #agentPoolContainer { box-sizing:border-box; padding:0 !important; margin-top:10px; }';
  document.head.appendChild(style);
}

function hasNewPanel() {
  return !!document.getElementById('btnMode');
}
function createModeSheet() {
  let sheet = document.getElementById('modeSheet');
  if (sheet) return sheet;
  sheet = document.createElement('div');
  sheet.id = 'modeSheet';
  sheet.className = 'kx-sheet';
  sheet.innerHTML =
    '<div class="kx-sheet-back"></div>' +
    '<div class="kx-sheet-card">' +
      '<div class="kx-sheet-head"><span>EXECUTION</span>' +
      '<button type="button" class="kx-icon" id="modeSheetClose" aria-label="Tutup">×</button></div>' +
      '<div id="modeSheetBody"></div>' +
      '<div class="kx-sheet-sub">AGENTS</div>' +
      '<div id="sheetAgentsHost"></div>' +
    '</div>';
  document.body.appendChild(sheet);
  sheet.querySelector('.kx-sheet-back').addEventListener('click', closeModeSheet);
  sheet.querySelector('#modeSheetClose').addEventListener('click', closeModeSheet);
  return sheet;
}
function openModeSheet() {
  const sheet = createModeSheet();
  const host = sheet.querySelector('#sheetAgentsHost');
  ['agentControlContainer', 'agentPoolContainer'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('skeleton-loading');
      el.style.display = '';
      if (el.parentNode !== host) host.appendChild(el);
    }
  });
  sheet.classList.add('on');
}
function closeModeSheet() {
  const sheet = document.getElementById('modeSheet');
  if (sheet) sheet.classList.remove('on');
}
function parkDashboardBlocks() {
  if (!hasNewPanel()) return;
  ['workflowModeContainer', 'agentControlContainer', 'agentPoolContainer'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('skeleton-loading');
      el.style.display = 'none';
    }
  });
}
function renderWorkflowModeSelector() {
  const container = hasNewPanel()
    ? createModeSheet().querySelector('#modeSheetBody')
    : document.getElementById('workflowModeContainer');
  if (!container || container.dataset.rendered === 'true') return;
  container.dataset.rendered = 'true';
  container.innerHTML =
    '<div class="wf-mode-rim"><div class="wf-mode-rim-in">' +
      '<div style="font-size:11px;color:#A0B3C9;font-weight:600;margin-bottom:8px;">Mode Eksekusi:</div>' +
      '<div style="display:flex;gap:8px;align-items:stretch;">' +
        '<button id="workflowModeAuto" class="execute-btn btn-workflow-mode mode-auto">Auto</button>' +
        '<button id="workflowModeSequential" class="execute-btn btn-workflow-mode mode-sequential">Sequential</button>' +
        '<button id="workflowModeParallel" class="execute-btn btn-workflow-mode mode-parallel">Parallel</button>' +
      '</div>' +
      '<div id="workflowModeStatus" style="font-size:9px;color:#A0B3C9;margin-top:8px;text-align:right;">Mode: <strong id="workflowModeDisplay">Auto</strong></div>' +
    '</div></div>';
}
function bindModeSheetToggles() {
  const btnMode = document.getElementById('btnMode');
  if (btnMode && !btnMode.dataset.sheetBound) {
    btnMode.dataset.sheetBound = 'true';
    btnMode.addEventListener('click', openModeSheet);
  }
}

function initWorkflowModeUI() {
  try {
    injectWorkflowBadgeStyle();
    createModeSheet();
    renderWorkflowModeSelector();
    parkDashboardBlocks();
    bindModeSheetToggles();

    const modeAuto = document.getElementById('workflowModeAuto');
    const modeSeq = document.getElementById('workflowModeSequential');
    const modePar = document.getElementById('workflowModeParallel');
    const modeDisplay = document.getElementById('workflowModeDisplay');
    const modeBadge = document.getElementById('workflowModeBadge');
    if (!modeAuto && !modeSeq && !modePar) return;

    function updateWorkflowUI(mode) {
      [modeAuto, modeSeq, modePar].forEach(function (btn) { if (btn) btn.classList.remove('active'); });
      let label = 'Auto';
      let badgeClass = 'auto';
      if (mode === 'sequential') { if (modeSeq) modeSeq.classList.add('active'); label = 'Sequential'; badgeClass = 'sequential'; }
      else if (mode === 'parallel') { if (modePar) modePar.classList.add('active'); label = 'Parallel'; badgeClass = 'parallel'; }
      else if (modeAuto) modeAuto.classList.add('active');
      if (modeDisplay) modeDisplay.textContent = label;
      if (modeBadge) {
        modeBadge.textContent = label;
        modeBadge.className = 'workflow-mode-badge ' + badgeClass;
      }
      if (KESEMPATAN.WorkflowEngine && KESEMPATAN.WorkflowEngine.setMode) KESEMPATAN.WorkflowEngine.setMode(mode);
      if (KESEMPATAN.WorkflowEngine) KESEMPATAN.WorkflowEngine.currentMode = mode;
      document.dispatchEvent(new CustomEvent('workflowModeChanged', { detail: { mode: mode } }));
    }
    updateWorkflowUIModeRef = updateWorkflowUI;

    if (modeAuto) modeAuto.addEventListener('click', function (e) { e.preventDefault(); updateWorkflowUI('auto'); if (showToast) showToast('🔄 Mode Auto', 'info'); });
    if (modeSeq) modeSeq.addEventListener('click', function (e) { e.preventDefault(); updateWorkflowUI('sequential'); if (showToast) showToast('🐢 Mode Sequential', 'info'); });
    if (modePar) modePar.addEventListener('click', function (e) { e.preventDefault(); updateWorkflowUI('parallel'); if (showToast) showToast('⚡ Mode Parallel AKTIF!', 'success'); });

    updateWorkflowUI(localStorage.getItem('kes_workflow_mode') || 'auto');
  } catch (error) {
    const container = document.getElementById('workflowModeContainer');
    if (container) container.innerHTML = '<div style="padding:8px 12px;color:#FF6B6B;font-size:11px;border:1px solid #FF6B6B;border-radius:8px;">⚠️ Mode Eksekusi gagal dimuat: ' + error.message + '</div>';
    if (Logger) Logger.error('Workflow', 'initWorkflowModeUI gagal: ' + error.message);
  }
}

if (document.readyState === 'complete') initWorkflowModeUI();
else document.addEventListener('DOMContentLoaded', initWorkflowModeUI);

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
  initWorkflowModeUI: initWorkflowModeUI,
  createModeSheet: createModeSheet,
  openModeSheet: openModeSheet,
  closeModeSheet: closeModeSheet
});
KESEMPATAN.WorkflowParallel = WorkflowParallel;

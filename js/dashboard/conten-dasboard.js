const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const SVG = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M8 21h8"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>',
  run: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};

const MARKERS = ['dengan fokus', 'fokus ke', 'fokus pada', 'dengan instruksi',
  'prioritas', 'target', 'anggaran', 'modal', 'bandingkan dengan',
  'abaikan', 'untuk kalangan'];

function splitCommand(text) {
  const t = (text || '').trim();
  const low = t.toLowerCase();
  let idx = -1;
  for (let i = 0; i < MARKERS.length; i++) {
    const p = low.indexOf(MARKERS[i]);
    if (p > 0 && (idx === -1 || p < idx)) idx = p;
  }
  if (idx === -1) return { topic: t, instruction: '' };
  return { topic: t.slice(0, idx).trim(), instruction: t.slice(idx).trim() };
}

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
      '<div class="kx-rim kx-box"><div class="kx-rim-in" style="padding:14px 16px;">' +
        '<div class="kx-info" id="infoRotator">' +
          '<div class="kx-slide is-on">1. Insert file (CSV/JSON/TXT)</div>' +
          '<div class="kx-slide">2. Write your analysis topic</div>' +
          '<div class="kx-slide">3. Add instruction (optional)</div>' +
          '<div class="kx-slide">4. [+] button = attach data file (max 10MB)</div>' +
          '<div class="kx-slide">5. [MIC] button = voice input</div>' +
          '<div class="kx-slide">6. [SLIDERS] button = execution mode & agents</div>' +
          '<div class="kx-slide">7. [ARROW] button = run analysis</div>' +
          '<div class="kx-slide">8. Badge = active mode (Auto/Sequential/Parallel)</div>' +
        '</div>' +
        '<div class="kx-dots" id="infoDots"><span class="on"></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
        '<div class="kx-div"></div>' +
        '<textarea id="analysisInput" rows="6" placeholder="Enter analysis..."></textarea>' +
        '<textarea id="topicInput" hidden></textarea>' +
        '<textarea id="promptInput" hidden></textarea>' +
        '<div class="kx-iconrow">' +
          '<button id="btnFile" type="button" class="kx-icon" aria-label="Select File">' + SVG.plus + '</button>' +
          '<button id="btnMic" type="button" class="kx-icon" aria-label="Audio Input">' + SVG.mic + '</button>' +
          '<button id="btnMode" type="button" class="kx-icon" aria-label="Mode dan agen">' + SVG.sliders + '</button>' +
          '<button id="mainExecuteBtn" type="button" class="kx-icon kx-run" aria-label="Run Analysis">' + SVG.run + '</button>' +
        '</div>' +
        '<div class="kx-vh">' +
          '<span id="uploadStatus" class="upload-status"></span>' +
          '<input type="file" id="fileUpload" accept=".csv,.json,.txt">' +
          '<button id="voiceInputBtn" type="button"></button>' +
          '<button id="stopVoiceBtn" type="button" style="display:none"></button>' +
        '</div>' +
      '</div></div>' +
    '</div>';

  const slides = container.querySelectorAll('.kx-slide');
  const dots = container.querySelectorAll('#infoDots span');
  let si = 0;
  setInterval(function () {
    si = (si + 1) % slides.length;
    slides.forEach(function (el, i) { el.classList.toggle('is-on', i === si); });
    dots.forEach(function (el, i) { el.classList.toggle('on', i === si); });
  }, 6000);

  const analysis = container.querySelector('#analysisInput');
  const topicEl = container.querySelector('#topicInput');
  const promptEl = container.querySelector('#promptInput');
  let deb = null;
  function syncHidden() {
    const r = splitCommand(analysis.value);
    topicEl.value = r.topic;
    promptEl.value = r.instruction;
  }
  analysis.addEventListener('input', function () {
    clearTimeout(deb);
    deb = setTimeout(syncHidden, 300);
  });

  container.querySelector('#btnFile').addEventListener('click', function () {
    container.querySelector('#fileUpload').click();
  });

  const micBtn = container.querySelector('#btnMic');
  micBtn.addEventListener('click', function () {
    const stop = container.querySelector('#stopVoiceBtn');
    const start = container.querySelector('#voiceInputBtn');
    const running = stop && getComputedStyle(stop).display !== 'none';
    if (running) { stop.click(); micBtn.classList.remove('rec'); }
    else { start.click(); micBtn.classList.add('rec'); }
  });

  container.querySelector('#btnMode').addEventListener('click', function () {
    if (KESEMPATAN.WorkflowParallel && KESEMPATAN.WorkflowParallel.openModeSheet) {
      KESEMPATAN.WorkflowParallel.openModeSheet();
    }
  });

  container.querySelector('#mainExecuteBtn').addEventListener('click', syncHidden);

  const badge = container.querySelector('#workflowModeBadge');
  if (badge) {
    stripParens(badge);
    if (window.MutationObserver) {
      const observer = new MutationObserver(function () { stripParens(badge); });
      observer.observe(badge, { childList: true, subtree: true, characterData: true });
    }
  }
}

export const ContenDasboard = Object.freeze({ renderUI: renderUI });
KESEMPATAN.ContenDasboard = ContenDasboard;
document.addEventListener('DOMContentLoaded', function () {
  renderUI(document.getElementById('contenDasboardContainer'));
});

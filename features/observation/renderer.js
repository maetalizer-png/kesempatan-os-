import { CONFIG, AUTO_TRIGGER_CONFIG, CATEGORIES } from './observ-config.js';
import { Observation } from './observ-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = Observation;
const state = OBS.getState();
const autoTriggerState = state.autoTriggerState;
let _lastStatValues = {};

function showToast(message, type) {
    type = type || 'info';
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        padding: 8px 20px; border-radius: 30px; z-index: 9999;
        background: ${type === 'success' ? '#00C97C' : type === 'error' ? '#D64545' : '#9B6FC9'};
        color: ${type === 'success' ? '#03050A' : '#fff'};
        font-size: var(--obs-type-title-size, 13px); font-weight: 600;
        animation: fadeInUp var(--obs-motion-slow, 240ms ease-out);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}
OBS.showToast = showToast;

function loadFavorites() {
    try {
        const saved = localStorage.getItem(CONFIG.FAVORITES_KEY);
        if (saved) {
            state.favorites = JSON.parse(saved);
            return true;
        }
    } catch(e) { console.warn('[ObsRenderer] loadFavorites failed:', e.message); }
    return false;
}

function saveFavorites() {
    try {
        localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(state.favorites));
    } catch(e) { console.warn('[ObsRenderer] saveFavorites failed:', e.message); }
}

function toggleFavorite(id) {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push(id);
    }
    saveFavorites();
    OBS.emitter.emit('favorites-updated', state.favorites);
}

function loadTheme() {
    try {
        const saved = localStorage.getItem(CONFIG.THEME_KEY);
        if (saved === 'light') state.darkMode = false;
    } catch(e) { console.warn('[ObsRenderer] loadTheme failed:', e.message); }
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    localStorage.setItem(CONFIG.THEME_KEY, state.darkMode ? 'dark' : 'light');
    OBS.emitter.emit('theme-changed', state.darkMode);
}

function getFilteredSignals() {
    let filtered = state.signals;
    if (state.currentFilter !== 'all') {
        if (state.currentFilter === 'favorites') {
            filtered = filtered.filter(s => state.favorites.includes(s.id));
        } else {
            filtered = filtered.filter(s => s.category === state.currentFilter);
        }
    }
    if (state.sentimentFilter !== 'all') {
        filtered = filtered.filter(s => {
            const a = OBS.analyzeSignal(s);
            return a.sentiment.label === state.sentimentFilter;
        });
    }
    if (state.searchQuery.trim().length > 0) {
        const q = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.desc.toLowerCase().includes(q)
        );
    }
    return filtered;
}

function renderAutoTriggerStatus() {
    const container = document.getElementById('autoTriggerStatus');
    if (!container) return;

    const status = AUTO_TRIGGER_CONFIG.enabled ? 'AKTIF' : 'NONAKTIF';
    const color = AUTO_TRIGGER_CONFIG.enabled ? 'var(--obs-accent, #00C97C)' : 'var(--obs-text-dim, #8A94A6)';
    const dot = OBS.UI && OBS.UI.icon ? OBS.UI.icon('bot', 12) : '';
    const targetIcon = OBS.UI && OBS.UI.icon ? OBS.UI.icon('target', 11) : '';
    const loaderIcon = OBS.UI && OBS.UI.icon ? OBS.UI.icon('loader', 11) : '';
    const barIcon = OBS.UI && OBS.UI.icon ? OBS.UI.icon('bar-chart-2', 11) : '';
    const historyIcon = OBS.UI && OBS.UI.icon ? OBS.UI.icon('file-text', 10) : '';
    const resetIcon = OBS.UI && OBS.UI.icon ? OBS.UI.icon('refresh-cw', 10) : '';
    const powerIcon = OBS.UI && OBS.UI.icon ? OBS.UI.icon(AUTO_TRIGGER_CONFIG.enabled ? 'x' : 'refresh-cw', 10) : '';

    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: var(--obs-type-body-size, 11px); background: linear-gradient(180deg, rgba(22,27,32,0.5), rgba(4,6,9,0.6)); padding: var(--obs-space-2, 8px) var(--obs-space-4, 16px); border-radius: var(--obs-radius-md, 8px); margin-bottom: var(--obs-space-3, 12px); box-shadow: var(--obs-shadow-module, inset 0 2px 5px rgba(0,0,0,0.4));">
            <span style="display:flex; align-items:center; gap:5px;">${dot} Auto-Trigger: <strong style="color:${color}; letter-spacing:var(--obs-type-caption-ls, 1.1px); text-transform:uppercase;">${status}</strong></span>
            <span style="display:flex; align-items:center; gap:5px;">${targetIcon} Threshold: <strong style="color:#C99A2E;">${AUTO_TRIGGER_CONFIG.minConfidence}%</strong></span>
            <span style="display:flex; align-items:center; gap:5px;">${loaderIcon} Cooldown: <strong style="color:var(--obs-text-dim, #8A94A6);">${AUTO_TRIGGER_CONFIG.cooldownMs/1000}s</strong></span>
            <span style="display:flex; align-items:center; gap:5px;">${barIcon} Triggers: <strong style="color:#9B6FC9;">${autoTriggerState.triggerCount}/${AUTO_TRIGGER_CONFIG.maxPerSession}</strong></span>
            <div style="display: flex; gap: 4px;">
                <button id="toggleAutoTriggerBtn" style="padding: 3px 12px; background: ${AUTO_TRIGGER_CONFIG.enabled ? 'rgba(214,69,69,0.12)' : 'rgba(0,201,124,0.12)'}; border: 1px solid ${AUTO_TRIGGER_CONFIG.enabled ? '#D64545' : '#00C97C'}; border-radius: var(--obs-radius-sm, 6px); color: ${AUTO_TRIGGER_CONFIG.enabled ? '#D64545' : '#00C97C'}; cursor: pointer; font-size: var(--obs-type-caption-size, 9px); display:inline-flex; align-items:center; gap:4px; transition: filter 180ms ease-out; box-shadow: ${AUTO_TRIGGER_CONFIG.enabled ? 'var(--obs-glow-critical, none)' : 'var(--obs-glow-soft, none)'};">
                    ${powerIcon} ${AUTO_TRIGGER_CONFIG.enabled ? 'Matikan' : 'Aktifkan'}
                </button>
                <button id="resetTriggerCounterBtn" style="padding: 3px 10px; background: transparent; border: none; border-radius: var(--obs-radius-sm, 6px); color: var(--obs-text-dim, #8A94A6); cursor: pointer; font-size: var(--obs-type-caption-size, 9px); display:inline-flex; align-items:center; gap:4px; opacity: 0.75; transition: opacity 180ms ease-out, color 180ms ease-out;">${resetIcon} Reset</button>
                <button id="showTriggerHistoryBtn" style="padding: 3px 10px; background: transparent; border: none; border-radius: var(--obs-radius-sm, 6px); color: #9B6FC9; cursor: pointer; font-size: var(--obs-type-caption-size, 9px); display:inline-flex; align-items:center; gap:4px; opacity: 0.85; transition: opacity 180ms ease-out;">${historyIcon} History</button>
            </div>
        </div>
    `;
}

function showDetail(title) {
    const signal = state.signals.find(s => s.title === title);
    if (!signal) return;

    const analyzed = OBS.analyzeSignal(signal);
    const cfg = CATEGORIES[signal.category] || { color: '#8A94A6', emoji: 'newspaper' };

    const modal = document.getElementById('signalDetailModal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.getElementById('detailTitle').textContent = signal.title;
    OBS.UI.buildDetailContent(signal, analyzed, cfg);

    const btn = document.querySelector('#signalDetailModal .execute-btn[data-title]');
    if (btn) btn.setAttribute('data-title', signal.title);
}

function sendToDashboard(title) {
    const signal = state.signals.find(s => s.title === title);
    if (!signal) return;

    const analyzed = OBS.analyzeSignal(signal);

    const topicInput = document.getElementById('topicInput');
    if (topicInput) topicInput.value = signal.title;

    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = `Analisis Peluang dari Observation Engine\n\nTopik: ${signal.title}\nDeskripsi: ${signal.desc}\nKategori: ${signal.category}\nConfidence: ${analyzed.confidence}%\nSentimen: ${analyzed.sentiment.label}\n\nInstruksi: Lakukan analisis mendalam untuk peluang bisnis ini.`;
    }

    if (typeof window.showPage === 'function') window.showPage('dashboard');
    showToast('Sinyal dikirim ke dashboard!', 'success');
}

function render() {
    const container = document.getElementById('obsEngine');
    if (!container) {
        const fallback = document.getElementById('pageInner');
        if (fallback) {
            fallback.innerHTML = '<p style="color:#D64545;padding:20px;">Container #obsEngine tidak ditemukan.</p>';
        }
        return;
    }

    const filtered = getFilteredSignals();
    const total = state.signals.length;
    const uniqueSources = new Set(state.signals.map(s => s.source));
    const categories = new Set(state.signals.map(s => s.category));
    const stats = OBS.getCategoryStats(state.signals);

    const textColor = state.darkMode ? '#8A94A6' : '#555';
    const borderColor = state.darkMode ? 'rgba(0,255,163,0.05)' : 'rgba(0,0,0,0.05)';

    const prevChartContainer = document.getElementById('trendChartContainer');
    const preservedChart = (prevChartContainer && prevChartContainer.querySelector('canvas') && state.chartInstance)
        ? prevChartContainer : null;

    const html = OBS.UI.buildMainHTML(filtered, total, uniqueSources, categories, stats, textColor, borderColor);
    container.innerHTML = html;

    if (preservedChart) {
        const freshChartContainer = document.getElementById('trendChartContainer');
        if (freshChartContainer && freshChartContainer.parentNode) {
            freshChartContainer.parentNode.replaceChild(preservedChart, freshChartContainer);
        }
    }

    document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;
        const key = el.dataset.stat || el.dataset.target;
        if (_lastStatValues[key] === target) {
            el.textContent = target;
            return;
        }
        _lastStatValues[key] = target;
        const duration = 220;
        const startTime = performance.now();
        function tick(now) {
            const progress = Math.min(1, (now - startTime) / duration);
            el.textContent = Math.round(target * progress);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    });

    OBS.UI.fillSignalCards();

    const insight = OBS.generateAIInsight(state.signals);
    const summaryEl = document.getElementById('aiSummary');
    const predEl = document.getElementById('aiPrediction');
    if (summaryEl) summaryEl.textContent = insight.summary.replace(/<[^>]*>/g, '');
    if (predEl) predEl.textContent = insight.prediction.replace(/<[^>]*>/g, '');

    document.querySelectorAll('.favorite-toggle').forEach(el => {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            if (id) toggleFavorite(id);
        });
    });

    document.querySelectorAll('.analyze-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.dataset.title;
            if (title) sendToDashboard(title);
        });
    });

    const modalBtn = document.querySelector('#signalDetailModal .execute-btn[data-title]');
    if (modalBtn) {
        modalBtn.addEventListener('click', function() {
            const title = this.dataset.title;
            if (title) sendToDashboard(title);
            document.getElementById('signalDetailModal').style.display = 'none';
        });
    }

    const resetBtn = document.getElementById('resetFilterBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            state.currentFilter = 'all';
            state.sentimentFilter = 'all';
            state.searchQuery = '';
            const searchInput = document.getElementById('searchSignals');
            if (searchInput) searchInput.value = '';
            render();
        });
    }

    OBS.Chart.updateChartData();
    renderAutoTriggerStatus();

    OBS.Events.attachEvents();

    if (!window.__obs_subscribed) {
        window.__obs_subscribed = true;
        OBS.emitter.on('signals-updated', function() {
            OBS.Chart.updateChartData();
        });
        OBS.emitter.on('favorites-updated', function() {
            render();
        });
        OBS.emitter.on('theme-changed', function() {
            render();
        });
    }
}

async function init() {
    loadTheme();
    loadFavorites();
    OBS.loadAutoTriggerPrefs();

    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            state.signals = JSON.parse(saved);
        }
    } catch(e) { console.warn('[ObsRenderer] init: load signals failed:', e.message); }

    if (state.signals.length === 0) {
        state.isRefreshing = true;
        render();
        await OBS.generateSignals();
        state.isRefreshing = false;
    }

    render();

    if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
    }
    state.refreshInterval = setInterval(OBS.refreshSignals, CONFIG.REFRESH_INTERVAL);

    showToast('Observation Engine siap! (Auto-Trigger Aktif)', 'info');
}

function start() {
    if (!state.refreshInterval) {
        state.refreshInterval = setInterval(OBS.refreshSignals, CONFIG.REFRESH_INTERVAL);
    }
}

function stop() {
    if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
        state.refreshInterval = null;
    }
}

OBS.loadFavorites = loadFavorites;
OBS.saveFavorites = saveFavorites;
OBS.toggleFavorite = toggleFavorite;
OBS.loadTheme = loadTheme;
OBS.toggleTheme = toggleTheme;
OBS.getFilteredSignals = getFilteredSignals;
OBS.renderAutoTriggerStatus = renderAutoTriggerStatus;
OBS.showDetail = showDetail;
OBS.sendToDashboard = sendToDashboard;
OBS.render = render;
OBS.init = init;
OBS.start = start;
OBS.stop = stop;

KESEMPATAN.Observation = OBS;

KESEMPATAN.ObservationPage = {
    render: render,
    init: init,
    start: start,
    stop: stop,
    refresh: OBS.refreshSignals,
    showDetail: showDetail,
    sendToDashboard: sendToDashboard,
    toggleFavorite: toggleFavorite,
    toggleTheme: toggleTheme,
    exportJSON: OBS.Export.exportJSON,
    exportCSV: OBS.Export.exportCSV,
    showTriggerHistory: OBS.showTriggerHistory,
    getSignals: () => state.signals,
    CONFIG: CONFIG,
    AUTO_TRIGGER_CONFIG: AUTO_TRIGGER_CONFIG
};

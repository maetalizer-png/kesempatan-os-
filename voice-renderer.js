(function() {
'use strict';
if (window.__VoiceCloneRenderer) return;
window.__VoiceCloneRenderer = true;

const state = window.VoiceCloneState;
const config = window.VoiceCloneConfig;
const core = window.VoiceCloneCore;
const visualizer = window.VoiceCloneVisualizer;
const layout = window.VoiceCloneUILayout;
const showToast = window.Utils?.showToast || function() {};

function ensureContainer() {
    let container = document.getElementById('voiceClonePanel');
    if (!container) {
        const page = document.getElementById('voicechatsuaraPage');
        const target = page || document.body;
        container = document.createElement('div');
        container.id = 'voiceClonePanel';
        container.style.cssText = 'display:block;padding:0;margin:0;';
        target.appendChild(container);
    }
    return container;
}

function renderHistory() {
    const container = document.getElementById('voiceHistoryContainer');
    if (!container) return;
    const history = state.getHistory();
    if (history.length === 0) {
        container.innerHTML = '<div style="font-size:10px;color:#666;text-align:center;padding:8px;">Belum ada riwayat.</div>';
        return;
    }
    let html = '';
    for (let i = 0; i < Math.min(20, history.length); i++) {
        const item = history[i];
        html += '<div style="display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;">' +
            '<span style="color:#A0B3C9;">' + (item.text || '').substring(0, 40) + '</span>' +
            '<span style="color:' + (item.feedback === 'like' ? '#00FFA3' : '#FF8888') + ';">' + (item.feedback || '') + '</span></div>';
    }
    container.innerHTML = html;
}

function render() {
    layout.injectCSS();
    const container = ensureContainer();
    const layoutState = {
        currentTheme: state.getSettings().preset ? (localStorage.getItem('kes_voice_theme_v21') || 'dark') : 'dark',
        clones: state.getClones(),
        activeCloneId: state.getActiveCloneId(),
        settings: state.getSettings(),
        history: state.getHistory(),
        favorites: state.getFavorites(),
        speedPreset: state.getSpeedPreset()
    };
    container.innerHTML = layout.buildVoiceLayout(layoutState);
    if (window.VoiceCloneEvents && typeof window.VoiceCloneEvents.attach === 'function') {
        window.VoiceCloneEvents.attach(container);
    }
    visualizer.initWaveform();
    renderHistory();
}

function toggleTheme() {
    const current = localStorage.getItem('kes_voice_theme_v21') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('kes_voice_theme_v21', next);
    document.body.classList.toggle('voice-light', next === 'light');
    render();
}

window.VoiceCloneRenderer = { render: render, renderHistory: renderHistory, toggleTheme: toggleTheme };

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VoiceRenderer = window.VoiceCloneRenderer;
})();
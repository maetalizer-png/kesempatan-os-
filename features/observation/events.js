import { AUTO_TRIGGER_CONFIG } from './observ-config.js';
import { Observation } from './observ-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = Observation;
const state = OBS.getState();
const autoTriggerState = state.autoTriggerState;

function attachEvents() {
    const container = document.getElementById('obsEngine');
    if (!container) return;

    if (!container.__obsEventsBound) {
        container.__obsEventsBound = true;
        container.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('filter-btn')) {
            const filter = target.dataset.filter;
            if (filter) {
                state.currentFilter = filter;
                OBS.render();
            }
        }

        if (target.classList.contains('filter-sentiment')) {
            const sentiment = target.dataset.sentiment;
            if (sentiment) {
                state.sentimentFilter = sentiment;
                OBS.render();
            }
        }

        if (target.id === 'clearFiltersBtn') {
            state.currentFilter = 'all';
            state.sentimentFilter = 'all';
            state.searchQuery = '';
            const searchInput = document.getElementById('searchSignals');
            if (searchInput) searchInput.value = '';
            OBS.render();
        }

        if (target.id === 'refreshObsBtn') {
            OBS.refreshSignals();
        }

        if (target.id === 'obsBackToDashboardBtn') {
            if (typeof window.showPage === 'function') window.showPage('dashboard');
        }

        if (target.id === 'toggleAutoTriggerBtn') {
            AUTO_TRIGGER_CONFIG.enabled = !AUTO_TRIGGER_CONFIG.enabled;
            OBS.saveAutoTriggerPrefs();
            OBS.renderAutoTriggerStatus();
            OBS.showToast(AUTO_TRIGGER_CONFIG.enabled ? 'Auto-Trigger AKTIF' : 'Auto-Trigger NONAKTIF', 'info');
        }

        if (target.id === 'resetTriggerCounterBtn') {
            autoTriggerState.triggerCount = 0;
            OBS.renderAutoTriggerStatus();
            OBS.showToast('Counter reset', 'success');
        }

        if (target.id === 'showTriggerHistoryBtn') {
            OBS.showTriggerHistory();
        }

        if (target.id === 'themeToggleBtn' || target.closest('[onclick*="toggleTheme"]')) {
            OBS.toggleTheme();
        }

        if (target.textContent.includes('JSON')) {
            OBS.Export.exportJSON();
        }
        if (target.textContent.includes('CSV')) {
            OBS.Export.exportCSV();
        }
        });
    }

    const searchInput = document.getElementById('searchSignals');
    if (searchInput) {
        let timeout = null;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                state.searchQuery = e.target.value;
                OBS.render();
            }, 300);
        });
    }
}

OBS.Events = {
    attachEvents
};

KESEMPATAN.Observation = OBS;

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__NoiseEventsLoaded) {
        return;
    }
    window.__NoiseEventsLoaded = true;

    const Utils = KESEMPATAN.NoiseUtils?.Utils || {};
    const NoiseState = KESEMPATAN.NoiseState || {};
    const NoiseCore = KESEMPATAN.NoiseCore || {};
    const NoiseExport = KESEMPATAN.NoiseExport || {};
    const _state = NoiseState.state || {};

    function attachEvents(container) {
        if (!container) return;

        const filterContainer = container.querySelector('.noise-page');
        if (filterContainer) {
            filterContainer.addEventListener('click', function(e) {
                const target = e.target.closest('.filter-btn');
                if (!target) return;
                const filter = target.dataset.filter;
                const sentiment = target.dataset.sentiment;
                if (filter) {
                    if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.setStatusFilter) KESEMPATAN.NoiseUI.setStatusFilter(filter);
                } else if (sentiment) {
                    if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.setSentimentFilter) KESEMPATAN.NoiseUI.setSentimentFilter(sentiment);
                }
            });
        }

        const startBtn = document.getElementById('noise-start-btn');
        const stopBtn = document.getElementById('noise-stop-btn');
        const exportBtn = document.getElementById('noise-export-btn');
        const printBtn = document.getElementById('noise-print-btn');
        const settingsBtn = document.getElementById('noise-settings-btn');
        const saveSettingsBtn = document.getElementById('noise-save-settings-btn');
        const notifyBtn = document.getElementById('noise-notify-btn');
        const clearBtn = document.getElementById('noise-clear-btn');
        const intervalInput = document.getElementById('noise-interval-input');
        const thresholdInput = document.getElementById('noise-threshold-input');
        const blacklistInput = document.getElementById('noise-blacklist-input');
        const whitelistInput = document.getElementById('noise-whitelist-input');
        const settingsPanel = document.getElementById('noise-settings-panel');

        if (startBtn) {
            startBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (NoiseCore.start) NoiseCore.start();
                if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.renderDashboard) KESEMPATAN.NoiseUI.renderDashboard();
            });
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (NoiseCore.stop) NoiseCore.stop();
                if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.renderDashboard) KESEMPATAN.NoiseUI.renderDashboard();
            });
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const choice = confirm('Ekspor JSON? (OK = JSON, Cancel = CSV)');
                if (choice) {
                    if (NoiseExport.exportData) NoiseExport.exportData('json');
                } else {
                    if (NoiseExport.exportData) NoiseExport.exportData('csv');
                }
                exportBtn.blur();
            });
        }
        if (printBtn) {
            printBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (NoiseExport.printDashboard) NoiseExport.printDashboard();
            });
        }
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (settingsPanel) {
                    settingsPanel.style.display = (settingsPanel.style.display === 'none' || settingsPanel.style.display === '') ? 'block' : 'none';
                }
            });
        }
        if (notifyBtn) {
            notifyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (NoiseCore.requestNotificationPermission) NoiseCore.requestNotificationPermission();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (NoiseExport.clearHistory) NoiseExport.clearHistory();
            });
        }
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const intervalVal = Utils.validateNumber(intervalInput ? intervalInput.value : 30, 5, 300, 30);
                const thresholdVal = Utils.validateNumber(thresholdInput ? thresholdInput.value : 70, 20, 95, 70);
                const blacklistVal = blacklistInput ? blacklistInput.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
                const whitelistVal = whitelistInput ? whitelistInput.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
                if (intervalVal) {
                    _state.intervalMs = intervalVal * 1000;
                    if (_state.isRunning) {
                        if (NoiseCore.stop) NoiseCore.stop();
                        if (NoiseCore.start) NoiseCore.start();
                    }
                }
                if (thresholdVal) {
                    _state.threshold = thresholdVal;
                }
                _state.blacklist = blacklistVal;
                _state.whitelist = whitelistVal;
                if (NoiseCore.saveState) NoiseCore.saveState();
                Utils.showToast('Pengaturan disimpan', 'success');
                if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.renderDashboard) KESEMPATAN.NoiseUI.renderDashboard();
            });
        }
    }

    KESEMPATAN.NoiseEvents = {
        attachEvents: attachEvents
    };
})();
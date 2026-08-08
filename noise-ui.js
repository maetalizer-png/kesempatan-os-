(function() {
    'use strict';
    if (window.__NoiseUILoaded) {
        return;
    }
    window.__NoiseUILoaded = true;

    const Utils = window.__NoiseUtils?.Utils || {};
    const InternalLogger = window.__NoiseUtils?.InternalLogger || { info: function() {} };
    const NoiseState = window.__NoiseState || {};
    const NoiseCore = window.NoiseCore || {};
    const NoiseChart = window.NoiseChart || {};
    const NoiseExport = window.NoiseExport || {};
    const _state = NoiseState.state || {};
    let _cleanupFns = NoiseState.getCleanupFns ? NoiseState.getCleanupFns() : [];

    function render() {
        const container = document.getElementById('noisePage');
        if (!container) {
            setTimeout(render, 200);
            return;
        }
        if (window.__NoiseUIRender && window.__NoiseUIRender.renderDashboard) {
            window.__NoiseUIRender.renderDashboard();
        }
        if (_state.isRunning && Utils.isOnline()) {
            if (!_state.intervalId) {
                _state.intervalId = setInterval(function() {
                    if (_state.isRunning && NoiseCore.scan) NoiseCore.scan();
                }, _state.intervalMs);
            }
            if (NoiseCore.scan) NoiseCore.scan();
        }
    }

    function destroy() {
        _cleanupFns.forEach(function(fn) { fn(); });
        _cleanupFns.length = 0;
        if (_state.intervalId) {
            clearInterval(_state.intervalId);
            _state.intervalId = null;
        }
        _state.isRunning = false;
        if (NoiseState.setMounted) NoiseState.setMounted(false);
        InternalLogger.info('Noise', 'Destroyed');
    }

    window.NoiseUI = {
        render: render,
        renderDashboard: function() { if (window.__NoiseUIRender) window.__NoiseUIRender.renderDashboard(); },
        destroy: destroy,
        updateSignalList: function(s) { if (window.__NoiseUIRender) window.__NoiseUIRender.updateSignalList(s); },
        updateHistoryList: function(h) { if (window.__NoiseUIRender) window.__NoiseUIRender.updateHistoryList(h); },
        renderHistoryChart: NoiseChart.renderHistoryChart,
        renderVerdictRing: NoiseChart.renderVerdictRing,
        updateStatsUI: function() { if (window.__NoiseUIRender) window.__NoiseUIRender.updateStatsUI(); },
        updateStatusUI: function(s) { if (window.__NoiseUIRender) window.__NoiseUIRender.updateStatusUI(s); },
        setStatusFilter: function(f) { if (window.__NoiseUIRender) window.__NoiseUIRender.setStatusFilter(f); },
        setSentimentFilter: function(f) { if (window.__NoiseUIRender) window.__NoiseUIRender.setSentimentFilter(f); },
        exportData: NoiseExport.exportData,
        clearHistory: NoiseExport.clearHistory,
        printDashboard: NoiseExport.printDashboard
    };
    window.NoisePage = { render: render, destroy: destroy };

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.NoiseUI = window.NoiseUI;
    window.KESEMPATAN.NoisePage = window.NoisePage;
})();
(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__NoiseUILoaded) {
        return;
    }
    window.__NoiseUILoaded = true;

    const Utils = KESEMPATAN.NoiseUtils?.Utils || {};
    const InternalLogger = KESEMPATAN.NoiseUtils?.InternalLogger || { info: function() {} };
    const NoiseState = KESEMPATAN.NoiseState || {};
    const NoiseCore = KESEMPATAN.NoiseCore || {};
    const NoiseChart = KESEMPATAN.NoiseChart || {};
    const NoiseExport = KESEMPATAN.NoiseExport || {};
    const _state = NoiseState.state || {};
    let _cleanupFns = NoiseState.getCleanupFns ? NoiseState.getCleanupFns() : [];

    function render() {
        const container = document.getElementById('noisePage');
        if (!container) {
            setTimeout(render, 200);
            return;
        }
        if (KESEMPATAN.NoiseUIRender && KESEMPATAN.NoiseUIRender.renderDashboard) {
            KESEMPATAN.NoiseUIRender.renderDashboard();
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

    KESEMPATAN.NoiseUI = {
        render: render,
        renderDashboard: function() { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.renderDashboard(); },
        destroy: destroy,
        updateSignalList: function(s) { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.updateSignalList(s); },
        updateHistoryList: function(h) { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.updateHistoryList(h); },
        renderHistoryChart: NoiseChart.renderHistoryChart,
        renderVerdictRing: NoiseChart.renderVerdictRing,
        updateStatsUI: function() { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.updateStatsUI(); },
        updateStatusUI: function(s) { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.updateStatusUI(s); },
        setStatusFilter: function(f) { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.setStatusFilter(f); },
        setSentimentFilter: function(f) { if (KESEMPATAN.NoiseUIRender) KESEMPATAN.NoiseUIRender.setSentimentFilter(f); },
        exportData: NoiseExport.exportData,
        clearHistory: NoiseExport.clearHistory,
        printDashboard: NoiseExport.printDashboard
    };
    KESEMPATAN.NoisePage = { render: render, destroy: destroy };
    // Kept as a real global: 8 other modules (observ-ui-renderer, cai/cag/for/deb-data-engine,
    // tor-tournament-arena, rap-engine, ui-generator) read window.NoisePage directly.
    window.NoisePage = KESEMPATAN.NoisePage;
})();
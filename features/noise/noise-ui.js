import { NoiseUtils } from './noise-utils.js';
import { NoiseState } from './noise-state.js';
import { NoiseCore } from './noise-core.js';
import { NoiseChart } from './noise-chart.js';
import { NoiseExport } from './noise-export.js';
import { NoiseUIRender } from './noise-ui-render.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

    const Utils = NoiseUtils.Utils;
    const InternalLogger = NoiseUtils.InternalLogger;
    const _state = NoiseState.state;
    let _cleanupFns = NoiseState.getCleanupFns();

    function render() {
        const container = document.getElementById('noisePage');
        if (!container) {
            setTimeout(render, 200);
            return;
        }
        NoiseUIRender.renderDashboard();
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

    export const NoiseUI = {
        render: render,
        renderDashboard: function() { NoiseUIRender.renderDashboard(); },
        destroy: destroy,
        updateSignalList: function(s) { NoiseUIRender.updateSignalList(s); },
        updateHistoryList: function(h) { NoiseUIRender.updateHistoryList(h); },
        renderHistoryChart: NoiseChart.renderHistoryChart,
        renderVerdictRing: NoiseChart.renderVerdictRing,
        updateStatsUI: function() { NoiseUIRender.updateStatsUI(); },
        updateStatusUI: function(s) { NoiseUIRender.updateStatusUI(s); },
        setStatusFilter: function(f) { NoiseUIRender.setStatusFilter(f); },
        setSentimentFilter: function(f) { NoiseUIRender.setSentimentFilter(f); },
        exportData: NoiseExport.exportData,
        clearHistory: NoiseExport.clearHistory,
        printDashboard: NoiseExport.printDashboard
    };
    KESEMPATAN.NoiseUI = NoiseUI;
    export const NoisePage = { render: render, destroy: destroy };
    KESEMPATAN.NoisePage = NoisePage;
    // Kept as a real global: 8 other modules (observ-ui-renderer, cai/cag/for/deb-data-engine,
    // tor-tournament-arena, rap-engine, ui-generator) read window.NoisePage directly.
    window.NoisePage = KESEMPATAN.NoisePage;
/* ============================================================
   📁 rap/ui.js (AGGREGATOR)
   🔥 GABUNGKAN RENDERER + EVENTS, EKSPOR KE window.RapBattle.ui
   ============================================================ */

(function() {
    'use strict';

    if (window.__RapUIAggregator) return;
    window.__RapUIAggregator = true;

    // Pastikan semua modul sudah dimuat
    if (!window.RapUIRenderer || !window.RapUIEvents || !window.RapBattle.logic) {
        return;
    }

    const renderer = window.RapUIRenderer;
    const events = window.RapUIEvents;
    const logic = window.RapBattle.logic;

    // ========== GABUNGKAN ==========
    window.RapBattle = window.RapBattle || {};

    window.RapBattle.ui = {
        // Renderer
        render: renderer.render,
        ensureContainer: renderer.ensureContainer,
        showToast: renderer.showToast,

        // Events & Interactions
        attachEvents: events.attachEvents,
        addMessage: events.addMessage,
        showResult: events.showResult,
        updateRapStats: events.updateRapStats,
        updateFlowStats: events.updateFlowStats,
        startRapTimer: events.startRapTimer,
        showHistoryModal: events.showHistoryModal,
        showHallOfFameModal: events.showHallOfFameModal,
        exportResult: events.exportResult,

        // 🔥 FIX: visualizer sebelumnya tidak pernah tersambung ke sini
        startVisualizer: events.startVisualizer,
        stopVisualizer: events.stopVisualizer,
        updateVisualizerLyric: events.updateVisualizerLyric,
        clearVisualizerLyric: events.clearVisualizerLyric,

        // Passthrough ke logic (biar ui.js tetap kompatibel)
        toggleBeat: logic.toggleBeat,
        loadHistory: logic.loadHistory,
        getRapBattleActive: logic.getRapBattleActive
    };

})();
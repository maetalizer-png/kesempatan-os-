/* ============================================================
   📁 rap/ui.js (AGGREGATOR)
   🔥 GABUNGKAN RENDERER + EVENTS, EKSPOR KE KESEMPATAN.RapBattle.ui
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__RapUIAggregator) return;
    window.__RapUIAggregator = true;

    // Pastikan semua modul sudah dimuat
    if (!KESEMPATAN.RapUIRenderer || !KESEMPATAN.RapUIEvents || !KESEMPATAN.RapBattle.logic) {
        return;
    }

    const renderer = KESEMPATAN.RapUIRenderer;
    const events = KESEMPATAN.RapUIEvents;
    const logic = KESEMPATAN.RapBattle.logic;

    // ========== GABUNGKAN ==========
    KESEMPATAN.RapBattle = KESEMPATAN.RapBattle || {};

    KESEMPATAN.RapBattle.ui = {
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
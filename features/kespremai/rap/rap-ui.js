/* ============================================================
   📁 rap/ui.js (AGGREGATOR)
   🔥 GABUNGKAN RENDERER + EVENTS, EKSPOR KE KESEMPATAN.RapBattle.ui
   ============================================================ */

import { RapUIRenderer as renderer } from './rap-ui-renderer.js';
import { RapUIEvents as events } from './rap-ui-events.js';
import { logic } from './rap-logic.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.RapBattle = KESEMPATAN.RapBattle || {};

export const ui = {
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

KESEMPATAN.RapBattle.ui = ui;

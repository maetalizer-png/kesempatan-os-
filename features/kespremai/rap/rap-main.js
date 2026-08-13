import { logic } from './rap-logic.js';
import { ui } from './rap-ui.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function init() {
    try {
        ui.render();
        ui.attachEvents();
    } catch (e) {
        console.error('[Rap Battle] Init error:', e);
        ui.showToast('⚠️ Gagal inisialisasi Rap Battle', 'error');
    }
}

export const RapBattleMain = {
    init: init,
    render: ui.render,
    startRapBattle: logic.startRapBattle,
    abort: logic.abortRap,
    exportResult: ui.exportResult,
    toggleBeat: logic.toggleBeat,
    loadHistory: logic.loadHistory,
    showHistoryModal: ui.showHistoryModal,
    showToast: ui.showToast
};

KESEMPATAN.RapBattleMain = RapBattleMain;

// Internal logic/ui references are re-added onto the same public
// KESEMPATAN.RapBattle object that rap-logic.js/rap-ui.js already populated
// with .logic/.ui, alongside the flattened passthrough methods above.
KESEMPATAN.RapBattle = {
    render: ui.render,
    startRapBattle: logic.startRapBattle,
    abort: logic.abortRap,
    exportResult: ui.exportResult,
    toggleBeat: logic.toggleBeat,
    loadHistory: logic.loadHistory,
    showHistoryModal: ui.showHistoryModal,
    showToast: ui.showToast,

    logic: logic,
    ui: ui
};

if (document.readyState === 'complete') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
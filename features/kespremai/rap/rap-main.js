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
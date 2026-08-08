/* ============================================================
   KESEMPATAN OS v14.0 — RAP BATTLE MAIN
   ✅ Inisialisasi, hubungkan logic & ui, expose API publik
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (KESEMPATAN.RapBattleMain) return;
    KESEMPATAN.RapBattleMain = {};

    const logic = KESEMPATAN.RapBattle.logic;
    const ui = KESEMPATAN.RapBattle.ui;

    if (!logic || !ui) {
        return;
    }

    function init() {
        try {
            ui.render();
            ui.attachEvents();
            // (log dihapus)
        } catch(e) {
            // error handling tetap pakai console.error
            console.error('[Rap Battle] Init error:', e);
            ui.showToast('⚠️ Gagal inisialisasi Rap Battle', 'error');
        }
    }

    // ========== EXPOSE PUBLIC API ==========
    KESEMPATAN.RapBattleMain = {
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

    // ========== EXPOSE KESEMPATAN.RapBattle ==========
    KESEMPATAN.RapBattle = {
        render: ui.render,
        startRapBattle: logic.startRapBattle,
        abort: logic.abortRap,
        exportResult: ui.exportResult,
        toggleBeat: logic.toggleBeat,
        loadHistory: logic.loadHistory,
        showHistoryModal: ui.showHistoryModal,
        showToast: ui.showToast,

        // Internal untuk logic
        logic: logic,
        ui: ui
    };

    // ========== AUTO INIT ==========
    if (document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
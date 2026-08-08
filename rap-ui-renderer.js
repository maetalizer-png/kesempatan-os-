/* ============================================================
   📁 rap/ui-renderer/ui-renderer.js
   🔥 ORCHESTRATOR — memanggil ui-layout.js (markup) dan
   ui-style.js (CSS). Tidak lagi berisi HTML/CSS panjang.
   Public API KESEMPATAN.RapUIRenderer TIDAK berubah bentuknya,
   supaya ui-events.js dan file lain tetap bekerja tanpa perubahan.
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__RapUIRenderer) return;
    window.__RapUIRenderer = true;

    // ========== SHOW TOAST ==========
    function showToast(msg, type) {
        const container = document.getElementById('toastContainer');
        if (!container) {
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#00FFA3; color:#03050A; padding:10px 20px; border-radius:30px; z-index:9999; font-weight:bold; font-size:13px;';
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 2500);
            return;
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
        else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
        else if (type === 'warn') toast.style.borderLeftColor = '#FFA500';
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3500);
    }

    // ========== ENSURE CONTAINER ==========
    function ensureContainer() {
        let container = document.getElementById('rapBattlePanel');
        if (!container) {
            const page = document.getElementById('rapbattlearenaPage');
            const target = page || document.body;
            container = document.createElement('div');
            container.id = 'rapBattlePanel';
            container.style.cssText = 'display:block; padding:0; margin:0;';
            target.appendChild(container);
        }
        return container;
    }

    // ========== RENDER (orchestrator) ==========
    function render() {
        const container = ensureContainer();
        if (container.dataset.rendered === 'true') return;
        container.dataset.rendered = 'true';

        container.innerHTML = KESEMPATAN.RapUILayout.buildHTML();

        // Isi Cypher Lounge (roster semua rapper) & daftar lagu — data ini
        // baru tersedia saat runtime (dari character.js/soundbank.js).
        KESEMPATAN.RapUILayout.renderCypherLounge(container);
        KESEMPATAN.RapUILayout.renderSongSelect(container);

        // CSS
        KESEMPATAN.RapUIStyle.inject();
    }

    // ========== EKSPOS ==========
    // Bentuk objek publik TIDAK berubah - semua key sama persis seperti
    // sebelum refactor, cuma implementasinya sekarang didelegasikan ke
    // ui-layout.js. ui-events.js dan pemanggil lain tidak perlu diubah.
    KESEMPATAN.RapUIRenderer = {
        render: render,
        ensureContainer: ensureContainer,
        showToast: showToast,
        renderCypherLounge: KESEMPATAN.RapUILayout.renderCypherLounge,
        renderSongSelect: KESEMPATAN.RapUILayout.renderSongSelect,
        markRole: KESEMPATAN.RapUILayout.markRole,
        clearRole: KESEMPATAN.RapUILayout.clearRole,
        syncHiddenSelects: KESEMPATAN.RapUILayout.syncHiddenSelects
    };
})();

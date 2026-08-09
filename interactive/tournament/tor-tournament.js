/* ============================================================
   interactive/tournament/tor-tournament.js (LAZY LOADER)
   MEMUAT SEMUA MODUL TURNAMEN SECARA SEQUENTIAL
   tor-config.js → tor-state.js → tor-data-engine.js →
   tor-classes.js → tor-tournament-arena.js → tor-core.js

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveTournamentPanel) — index.html sekarang cuma
   punya id kontainer kosong. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, ditimpa total oleh TRN_renderTournamentPanel() di
   tor-core.js begitu modul terakhir selesai dimuat.
   ============================================================ */
(function() {
    'use strict';
    if (window.__TournamentModuleLoaded) {
        return;
    }
    window.__TournamentModuleLoaded = true;

    // Placeholder loading — persis markup yang dulu inline di index.html
    const panel = document.getElementById('interactiveTournamentPanel');
    if (panel && !panel.dataset.placeholderRendered) {
        panel.dataset.placeholderRendered = 'true';
        panel.innerHTML = '<div class="kes-loading-placeholder" style="text-align:center; padding:40px 16px; color:#A0B3C9; font-size:13px;"><div style="font-size:28px; margin-bottom:10px; animation: kesSpin 1s linear infinite;"></div>Memuat modul...</div>';
    }

    const MODULES = [
        'interactive/tournament/tor-config.js',
        'interactive/tournament/tor-state.js',
        'interactive/tournament/tor-data-engine.js',
        'interactive/tournament/tor-classes.js',
        'interactive/tournament/tor-tournament-arena.js',
        'interactive/tournament/tor-core.js'
    ];

    // Prefetch semua file modul secara PARALEL (browser bisa unduh
    // banyak file sekaligus) — eksekusi tetap berurutan lewat loadNext()
    // di bawah, tapi karena bytenya sudah/segera ter-cache, rantai
    // eksekusi jadi jauh lebih cepat. Mengurangi jeda "panel kosong
    // sesaat" yang terlihat saat modul masih dimuat satu per satu.
    MODULES.forEach(function(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        document.head.appendChild(link);
    });

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (hasError) {
                if (window.Utils && window.Utils.showToast) {
                    window.Utils.showToast('Turnamen: sebagian modul gagal dimuat. Coba muat ulang halaman.', 'error');
                } else {
                    console.error('[Tournament] Sebagian modul gagal dimuat.');
                }
            }
            return;
        }
        const src = MODULES[loaded];
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = function() {
            loaded++;
            loadNext();
        };
        script.onerror = function() {
            hasError = true;
            if (!window.Utils || !window.Utils.showToast) {
                console.error('[Tournament] Gagal memuat modul:', src);
            }
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    loadNext();
})();

/* ============================================================
   interactive/forum/for-forum.js (LAZY LOADER)
   MEMUAT SEMUA MODUL FORUM SECARA SEQUENTIAL
   for-config.js → for-state.js → for-data-engine.js →
   for-ui-render.js → for-core.js

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveForumPanel) — index.html sekarang cuma
   punya id kontainer kosong. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, ditimpa total oleh FOR_renderForumPanel() di
   for-core.js begitu modul terakhir selesai dimuat.
   ============================================================ */
(function() {
    'use strict';
    if (window.__ForumModuleLoaded) {
        return;
    }
    window.__ForumModuleLoaded = true;

    // Placeholder loading — persis markup yang dulu inline di index.html
    const panel = document.getElementById('interactiveForumPanel');
    if (panel && !panel.dataset.placeholderRendered) {
        panel.dataset.placeholderRendered = 'true';
        panel.innerHTML = '<div class="kes-loading-placeholder" style="text-align:center; padding:40px 16px; color:#A0B3C9; font-size:13px;"><div style="font-size:28px; margin-bottom:10px; animation: kesSpin 1s linear infinite;"></div>Memuat modul...</div>';
    }

    const MODULES = [
        'for-config.js',
        'for-state.js',
        'for-data-engine.js',
        'for-ui-render.js',
        'for-core.js'
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
                    window.Utils.showToast('Forum: sebagian modul gagal dimuat. Coba muat ulang halaman.', 'error');
                } else {
                    console.error('[Forum] Sebagian modul gagal dimuat.');
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
                console.error('[Forum] Gagal memuat modul:', src);
            }
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    loadNext();
})();

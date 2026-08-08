/* ============================================================
   📁 interactive/chat-ai/cai-chat-ai.js (LAZY LOADER)
   🔥 MEMUAT SEMUA MODUL CHAT AI SECARA SEQUENTIAL
   🔥 Modularisasi total — setiap file punya satu tanggung jawab:
      cai-config.js       → konstanta & pola deteksi
      cai-state.js        → state bersama (independen dari chat lain)
      cai-data-engine.js  → integrasi World/Memory/Database, smart
                            search, deteksi sapaan/kabar, prompt, AI
      cai-ui-render.js    → suara, riwayat, tema, reaksi, render bubble
      cai-core.js         → kirim pesan, render panel, init, ekspor
                            window.ChatModule
   Pola sama seperti workers/ai-worker.js, memory.js, world.js.

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveChatAiPanel) — index.html sekarang cuma
   punya id kontainer kosong, konsisten dgn pola self-contained
   module lain di proyek ini. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, lalu ditimpa total oleh CAI_renderChatAiPanel() di
   cai-core.js begitu modul terakhir selesai dimuat & CAI_initChatAi()
   berjalan.
   ============================================================ */
(function() {
    'use strict';
    if (window.__ChatAiModuleLoaded) {
        return;
    }
    window.__ChatAiModuleLoaded = true;

    // Placeholder loading — persis markup yang dulu inline di index.html
    const panel = document.getElementById('interactiveChatAiPanel');
    if (panel && !panel.dataset.placeholderRendered) {
        panel.dataset.placeholderRendered = 'true';
        panel.innerHTML = '<div class="kes-loading-placeholder" style="text-align:center; padding:40px 16px; color:#A0B3C9; font-size:13px;"><div style="font-size:28px; margin-bottom:10px; animation: kesSpin 1s linear infinite;"></div>Memuat modul...</div>';
    }

    const MODULES = [
        'cai-config.js',
        'cai-state.js',
        'cai-data-engine.js',
        'cai-ui-render.js',
        'cai-core.js'
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
                console.error('[ChatAI] ❌ Sebagian modul gagal dimuat — fitur Chat AI mungkin tidak lengkap.');
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
            console.error('[ChatAI] Gagal memuat modul:', src);
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    loadNext();
})();

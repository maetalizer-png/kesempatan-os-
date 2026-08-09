/* ============================================================
   interactive/chat-agent/cag-chat-agent.js (LAZY LOADER)
   MEMUAT SEMUA MODUL CHAT AGENT SECARA SEQUENTIAL
   cag-config.js → cag-state.js → cag-data-engine.js →
   cag-ui-render.js → cag-core.js
   Pola sama seperti workers/ai-worker.js, chat-ai/cai-chat-ai.js.

   RENDER PLACEHOLDER LOADING dipindah ke SINI dari index.html (dulu
   inline di #interactiveChatAgentPanel) — index.html sekarang cuma
   punya id kontainer kosong. Placeholder ditampilkan SEBELUM modul
   mulai dimuat, ditimpa total oleh CAG_renderChatAgentPanel() di
   cag-core.js begitu modul terakhir selesai dimuat.
   ============================================================ */
(function() {
    'use strict';
    if (window.__ChatAgentModuleLoaded) {
        return;
    }
    window.__ChatAgentModuleLoaded = true;

    // Placeholder loading — persis markup yang dulu inline di index.html
    const panel = document.getElementById('interactiveChatAgentPanel');
    if (panel && !panel.dataset.placeholderRendered) {
        panel.dataset.placeholderRendered = 'true';
        panel.innerHTML = '<div class="kes-loading-placeholder" style="text-align:center; padding:40px 16px; color:#A0B3C9; font-size:13px;"><div style="font-size:28px; margin-bottom:10px; animation: kesSpin 1s linear infinite;"></div>Memuat modul...</div>';
    }

    const MODULES = [
        'interactive/chat-agent/cag-config.js',
        'interactive/chat-agent/cag-state.js',
        'interactive/chat-agent/cag-data-engine.js',
        'interactive/chat-agent/cag-ui-render.js',
        'interactive/chat-agent/cag-core.js'
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
                    window.Utils.showToast('Chat Agent: sebagian modul gagal dimuat. Coba muat ulang halaman.', 'error');
                } else {
                    console.error('[ChatAgent] Sebagian modul gagal dimuat.');
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
                console.error('[ChatAgent] Gagal memuat modul:', src);
            }
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    loadNext();
})();

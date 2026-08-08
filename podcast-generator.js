/* ============================================================
   KESEMPATAN OS  — PODCAST GENERATOR LOADER
   ✅ Lazy load semua modul podcast (11 modul)
   ✅ Urutan: config → state → ai-engine → core → UI (layout → renderer → generator → player → handlers → main)
   ✅ Auto init setelah semua modul siap
   ============================================================ */

(function() {
    'use strict';

    if (window.__PodcastLoaderLoaded) return;
    window.__PodcastLoaderLoaded = true;

    // Daftar modul yang harus dimuat secara sequential
    const MODULES = [
        'config.js',
        'state.js',
        'ai-engine.js',
        'core.js',
        'ui-layout.js',      // 🆕 Layout HTML murni
        'ui-renderer.js',    // DOM render + update
        'ui-generator.js',   // Generate script
        'ui-player.js',      // Play/stop/audio controls
        'ui-handlers.js',    // Event handlers
        'ui-main.js',        // UI aggregator
        'main.js'            // Entry point publik
    ];

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (!hasError && window.PodcastMain && typeof window.PodcastMain.init === 'function') {
                if (!window.__PodcastInitDone) {
                    window.__PodcastInitDone = true;
                    window.PodcastMain.init();
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
            console.error('[PodcastLoader] ❌ Gagal load:', src);
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    // ========== EKSPOS GLOBAL AWAL (sebelum modul selesai) ==========
    window.PodcastGenerator = {
        // Ini akan di-override oleh main.js setelah semua modul dimuat
        _initialized: false,
        _pendingCalls: [],

        // Fungsi sementara yang menampung panggilan sampai main.js siap
        _callLater: function(fn, args) {
            if (this._initialized) {
                return fn.apply(null, args);
            }
            this._pendingCalls.push({ fn: fn, args: args });
            return null;
        }
    };

    // ========== MULAI LOADING ==========
    loadNext();
})();

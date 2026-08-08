/* ============================================================
   📁 rap/rap-battle.js (LAZY LOADER)
   ✅ Load semua modul rap secara sequential
   🔥 ✅ SUDAH TUNGGU MEMORY.JS SIAP!
   🔥 ✅ LOAD ENGINE-ENGINE BARU (character, intelligence, optimizer)!
   ============================================================ */

(function() {
    'use strict';

    if (window.__RapLoaderLoaded) return;
    window.__RapLoaderLoaded = true;

    // ============================================================
    // 🔥 WAIT FOR MEMORY.JS
    // ============================================================
    const waitForMemory = function() {
        return new Promise(function(resolve) {
            // 1. CEK LANGSUNG
            if (window.VectorMemory || window.VectorMemoryV5) {
                resolve();
                return;
            }

            // 2. CEK DARI _memoryClass (CORE)
            if (window._memoryClass) {
                setTimeout(function() {
                    if (window.VectorMemory || window.VectorMemoryV5) {
                        resolve();
                        return;
                    }
                    // Fallback: buat instance manual
                    try {
                        const Core = window._memoryClass;
                        const instance = new Core();
                        window.VectorMemory = instance;
                        window.VectorMemoryV5 = instance;
                        resolve();
                    } catch(e) {
                        resolve();
                    }
                }, 500);
                return;
            }

            // 3. TUNGGU DENGAN INTERVAL (10 DETIK)
            let attempts = 0;
            const maxAttempts = 100;
            const checkInterval = setInterval(function() {
                attempts++;
                
                if (window.VectorMemory || window.VectorMemoryV5) {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }
                
                if (window._memoryClass) {
                    clearInterval(checkInterval);
                    try {
                        const Core = window._memoryClass;
                        const instance = new Core();
                        window.VectorMemory = instance;
                        window.VectorMemoryV5 = instance;
                    } catch(e) {}
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    };

    // ============================================================
    // 📦 MODULES (URUTAN PENTING!)
    // ============================================================
    const MODULES = [
        // 1. Konfigurasi & Helpers
        'config.js',
        'helpers.js',
        
        // ============================================================
        // 🔥🔥🔥 ENGINE BARU (LOAD DULU SEBELUM ENGINE WRAPPER) 🔥🔥🔥
        // ============================================================
        'character.js',      // Character Engine (35+ persona + emosi)
        'intelligence.js',    // Intelligence Engine (multi-agen + strategi)
        'optimizer.js',       // Optimizer Engine (learning + quality)
        'soundbank.js',       // 🔥 BARU: Soundbank Engine (24 lagu + rekomendasi per rapper)
        
        // ============================================================
        // 🔥 ENGINE WRAPPER (INTEGRATOR KETIGANYA)
        // ============================================================
        'engine.js',                 // Wrapper / Integrator
        
        // ============================================================
        // 🔥 CORE RAP BATTLE
        // ============================================================
        'orchestrator.js',
        'logic.js',
        
        // ============================================================
        // 🔥 UI
        // ============================================================
        'ui-style.js',
        'ui-layout.js',
        'ui-renderer.js',
        'ui-events.js',
        'ui.js',
        
        // ============================================================
        // 🔥 MAIN
        // ============================================================
        'main.js'
    ];

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    // ============================================================
    // 🔥 LOAD NEXT
    // ============================================================
    const loadNext = function() {
        if (loaded >= total) {
            if (!hasError && window.RapBattleMain && typeof window.RapBattleMain.init === 'function') {
                if (!window.__RapInitDone) {
                    window.__RapInitDone = true;
                    waitForMemory().then(function() {
                        // (init log dihapus)
                        window.RapBattleMain.init();
                    });
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
            // (progress log dihapus)
            loadNext();
        };
        
        script.onerror = function() {
            hasError = true;
            // (error log dihapus)
            loaded++;
            loadNext();
        };
        
        document.head.appendChild(script);
    };

    // ============================================================
    // 🚀 START
    // ============================================================
    // (start log dihapus)
    loadNext();
})();
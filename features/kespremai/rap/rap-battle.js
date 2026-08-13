



import './rap-config.js';
import './rap-helpers.js';
import './rap-character.js';
import './rap-intelligence.js';
import './rap-optimizer.js';
import './rap-soundbank.js';
import './rap-engine.js';
import './rap-orchestrator.js';
import './rap-logic.js';
import './rap-ui-style.js';
import './rap-ui-layout.js';
import './rap-ui-renderer.js';
import './rap-ui-events.js';
import './rap-ui.js';
import './rap-main.js';

(function() {
    'use strict';
    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    
    
    
    
    
    
    const waitForMemory = function() {
        return new Promise(function(resolve) {
            
            if (window.VectorMemory || window.VectorMemoryV5) {
                resolve();
                return;
            }

            
            if (window._memoryClass) {
                setTimeout(function() {
                    if (window.VectorMemory || window.VectorMemoryV5) {
                        resolve();
                        return;
                    }
                    
                    try {
                        const Core = window._memoryClass;
                        const instance = new Core();
                        window.VectorMemory = instance;
                        window.VectorMemoryV5 = instance;
                        if (window.KESEMPATAN) window.KESEMPATAN.VectorMemory = instance;
                        resolve();
                    } catch(e) {
                        resolve();
                    }
                }, 500);
                return;
            }

            
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
                        if (window.KESEMPATAN) window.KESEMPATAN.VectorMemory = instance;
                    } catch(e) { console.warn('[RapBattle] Fallback memory instance creation failed:', e.message); }
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

    if (KESEMPATAN.RapBattleMain && typeof KESEMPATAN.RapBattleMain.init === 'function') {
        waitForMemory().then(function() {
            KESEMPATAN.RapBattleMain.init();
        });
    }
})();
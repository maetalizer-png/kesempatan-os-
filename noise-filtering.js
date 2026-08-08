(function() {
    'use strict';
    if (window.__NoiseFilteringLoaded) {
        return;
    }
    window.__NoiseFilteringLoaded = true;

    const MODULES = [
        'noise-config.js',
        'noise-utils.js',
        'noise-state.js',
        'noise-core.js',
        'noise-chart.js',
        'noise-export.js',
        'noise-events.js',
        'noise-ui-render.js',
        'noise-ui.js'
    ];

    const Logger = {
        info: function() {},
        warn: function() {},
        error: function() {}
    };

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (!hasError) {
                Logger.info('NoiseLoader', 'All noise modules loaded!');
                document.dispatchEvent(new CustomEvent('noise-ready'));
                if (window.NoiseUI && typeof window.NoiseUI.render === 'function') {
                    window.NoiseUI.render();
                }
            } else {
                Logger.warn('NoiseLoader', 'Loaded with errors, but continuing...');
                const container = document.getElementById('noisePage');
                if (container) {
                    container.innerHTML = [
                        '<div style="padding:40px; text-align:center; color:#ff4444;">',
                            '<div style="font-size:48px; margin-bottom:16px;">⚠️</div>',
                            '<h3>Noise Filtering - Loaded with Errors</h3>',
                            '<p style="color:#A0B3C9; font-size:13px;">Beberapa modul gagal dimuat. Silahkan refresh halaman.</p>',
                            '<button class="execute-btn secondary" onclick="window.showPage(\'dashboard\')" style="margin-top:16px;">',
                                '← Kembali ke Dasbor',
                            '</button>',
                        '</div>'
                    ].join('');
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
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.NoiseFiltering = { modules: MODULES };

    loadNext();
})();

(function() {
    'use strict';
    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__ObservationLoaderLoaded) return;
    window.__ObservationLoaderLoaded = true;

    const MODULES = [
        'observ/observ-config.js',
        'observ/observ-state.js',
        'observ/fetcher.js',
        'observ/analyzer.js',
        'observ/observ-ui-renderer.js',
        'observ/observ-chart.js',
        'observ/observ-export.js',
        'observ/events.js',
        'observ/renderer.js'
    ];

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (!hasError) {
                if (KESEMPATAN.ObservationPage && typeof KESEMPATAN.ObservationPage.init === 'function') {
                    if (!window.__OBS_INIT_DONE) {
                        window.__OBS_INIT_DONE = true;
                        KESEMPATAN.ObservationPage.init();
                    }
                }
            } else {
                console.warn('[ObservationLoader] Loaded with errors');
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
            console.error('[ObservationLoader] Failed to load:', src);
            loaded++;
            loadNext();
        };
        document.head.appendChild(script);
    }

    loadNext();
})();


(function() {
    'use strict';

    if (window.__ObservationLoaderLoaded) return;
    window.__ObservationLoaderLoaded = true;

    const MODULES = [
        'observ-config.js',
        'observ-state.js',
        'fetcher.js',
        'analyzer.js',
        'observ-ui-renderer.js',
        'observ-chart.js',
        'observ-export.js',
        'events.js',
        'renderer.js'
    ];

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (!hasError) {
                if (window.ObservationPage && typeof window.ObservationPage.init === 'function') {
                    if (!window.__OBS_INIT_DONE) {
                        window.__OBS_INIT_DONE = true;
                        window.ObservationPage.init();
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

(function() {
'use strict';
if (window.__PagesEntryLoaded) return;
window.__PagesEntryLoaded = true;

const Logger = window.Utils?.Logger || {
    info: function() {},
    warn: function() {},
    error: function() {}
};

const modules = [
    'memory-manager.js',
    'report.js',
    'telemetry.js',
    'auto-learning.js',
    'settings.js'
];

let loaded = 0;
const total = modules.length;
let hasError = false;

function loadNext() {
    if (loaded >= total) {
        if (!hasError) {
            Logger.info('PagesEntry', 'All ' + total + ' page modules loaded');
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('pages-ready'));
            }
            if (window._onPagesReady && typeof window._onPagesReady === 'function') {
                window._onPagesReady();
            }
        } else {
            Logger.warn('PagesEntry', 'Loaded with errors, continuing');
        }
        return;
    }
    const src = modules[loaded];
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = function() {
        loaded++;
        Logger.info('PagesEntry', 'Loaded: ' + src + ' (' + loaded + '/' + total + ')');
        loadNext();
    };
    script.onerror = function() {
        hasError = true;
        Logger.error('PagesEntry', 'Failed to load: ' + src);
        loaded++;
        loadNext();
    };
    document.head.appendChild(script);
}

Logger.info('PagesEntry', 'Loading ' + total + ' page modules');
loadNext();

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.Pages = Object.freeze({
    modules: modules,
    getLoadedCount: function() { return loaded; },
    getTotal: function() { return total; },
    hasError: function() { return hasError; }
});
})();
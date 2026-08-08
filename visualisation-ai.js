(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__VisualAILoaderLoaded) return;
    window.__VisualAILoaderLoaded = true;

const MODULES = [
    'visual-config.js',
    'visual-state.js',
    'visual-core.js',
    'visual-engine.js',
    'visual-layout.js',
    'visual-renderer.js',
    'visual-events.js'
];

let loaded = 0;
const total = MODULES.length;
let hasError = false;
const failedFiles = [];
window.__VisualAIFailedFiles = failedFiles;

function loadNext() {
    if (loaded >= total) {
        if (!hasError) {
            if (KESEMPATAN.VisualRenderer && typeof KESEMPATAN.VisualRenderer.init === 'function') {
                KESEMPATAN.VisualRenderer.init();
            }
        }
        return;
    }
    const src = MODULES[loaded];
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = function() { loaded++; loadNext(); };
    script.onerror = function() { hasError = true; failedFiles.push(src); loaded++; loadNext(); };
    document.head.appendChild(script);
}

const visualAIProxy = {
    render: function() {
        if (KESEMPATAN.VisualRenderer && typeof KESEMPATAN.VisualRenderer.render === 'function') {
            KESEMPATAN.VisualRenderer.render();
            return;
        }
        const inner = document.getElementById('premiumPageInner');
        if (inner) {
            const failed = window.__VisualAIFailedFiles || [];
            const failedText = failed.length > 0
                ? '<br><b>File yang gagal dimuat:</b> ' + failed.join(', ') +
                  '<br>(kemungkinan nama file salah ketik, atau file tersebut belum ada di folder visual-ai/ pada server Anda)'
                : '<br>Tidak ada file yang gagal dimuat, tapi KESEMPATAN.VisualRenderer tetap tidak tersedia — ' +
                  'kemungkinan salah satu file dimuat tapi ada error saat dijalankan (cek Console F12 untuk pesan error JavaScript lain, bukan "Failed to load").';
            inner.innerHTML = '<div style="padding:20px; color:#FF6B6B;">' +
                'Modul Visualisation gagal dimuat (KESEMPATAN.VisualRenderer tidak tersedia).' +
                failedText +
                '</div>';
        }
    },
    init: function() {
        if (KESEMPATAN.VisualRenderer && typeof KESEMPATAN.VisualRenderer.init === 'function') {
            KESEMPATAN.VisualRenderer.init();
        }
    }
};

KESEMPATAN.VisualisationAI = visualAIProxy;

loadNext();
})();

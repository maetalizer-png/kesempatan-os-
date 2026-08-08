(function() {
'use strict';
if (window.__VisualAILoaderLoaded) return;
window.__VisualAILoaderLoaded = true;

const MODULES = [
    'visual-ai/visual-config.js',
    'visual-ai/visual-state.js',
    'visual-ai/visual-core.js',
    'visual-ai/visual-engine.js',
    'visual-ai/visual-layout.js',
    'visual-ai/visual-renderer.js',
    'visual-ai/visual-events.js'
];

let loaded = 0;
const total = MODULES.length;
let hasError = false;
const failedFiles = [];
window.__VisualAIFailedFiles = failedFiles;

function loadNext() {
    if (loaded >= total) {
        if (!hasError) {
            if (window.VisualAIRenderer && typeof window.VisualAIRenderer.init === 'function') {
                window.VisualAIRenderer.init();
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
        if (window.VisualAIRenderer && typeof window.VisualAIRenderer.render === 'function') {
            window.VisualAIRenderer.render();
            return;
        }
        const inner = document.getElementById('premiumPageInner');
        if (inner) {
            const failed = window.__VisualAIFailedFiles || [];
            const failedText = failed.length > 0
                ? '<br><b>File yang gagal dimuat:</b> ' + failed.join(', ') +
                  '<br>(kemungkinan nama file salah ketik, atau file tersebut belum ada di folder visual-ai/ pada server Anda)'
                : '<br>Tidak ada file yang gagal dimuat, tapi window.VisualAIRenderer tetap tidak tersedia — ' +
                  'kemungkinan salah satu file dimuat tapi ada error saat dijalankan (cek Console F12 untuk pesan error JavaScript lain, bukan "Failed to load").';
            inner.innerHTML = '<div style="padding:20px; color:#FF6B6B;">' +
                'Modul Visualisation gagal dimuat (window.VisualAIRenderer tidak tersedia).' +
                failedText +
                '</div>';
        }
    },
    init: function() {
        if (window.VisualAIRenderer && typeof window.VisualAIRenderer.init === 'function') {
            window.VisualAIRenderer.init();
        }
    }
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VisualAI = visualAIProxy;
window.VisualisationAI = visualAIProxy;
window.VisualAgentGenerator = visualAIProxy;

loadNext();
})();
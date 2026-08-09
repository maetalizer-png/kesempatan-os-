import './memory-manager.js';
import './report.js';
import './telemetry.js';
import './auto-learning.js';
import './settings.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

document.dispatchEvent(new CustomEvent('pages-ready'));
if (window._onPagesReady && typeof window._onPagesReady === 'function') {
    window._onPagesReady();
}

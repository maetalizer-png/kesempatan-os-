import './memory-manager/memory-manager.js';
import './monitoring/report/report.js';
import './monitoring/telemetry/telemetry.js';
import './monitoring/learning/auto-learning.js';
import './settings/settings.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

document.dispatchEvent(new CustomEvent('pages-ready'));
if (window._onPagesReady && typeof window._onPagesReady === 'function') {
    window._onPagesReady();
}

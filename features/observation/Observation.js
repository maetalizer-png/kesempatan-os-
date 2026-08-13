



import './observ-config.js';
import './observ-state.js';
import './fetcher.js';
import './analyzer.js';
import './observ-ui-renderer.js';
import './observ-chart.js';
import './observ-export.js';
import './events.js';
import './renderer.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (KESEMPATAN.ObservationPage && typeof KESEMPATAN.ObservationPage.init === 'function') {
    KESEMPATAN.ObservationPage.init();
}

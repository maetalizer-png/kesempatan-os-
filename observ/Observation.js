// Static imports (in dependency order) replace the old runtime
// document.createElement('script') loader: the ES module graph itself now
// guarantees observ-config.js -> observ-state.js -> ... -> renderer.js finish
// evaluating, in this order, before any code below runs.
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

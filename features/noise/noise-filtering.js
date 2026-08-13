import './noise-config.js';
import './noise-utils.js';
import './noise-state.js';
import './noise-core.js';
import './noise-chart.js';
import './noise-export.js';
import './noise-events.js';
import './noise-ui-render.js';
import { NoiseUI } from './noise-ui.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

document.dispatchEvent(new CustomEvent('noise-ready'));
NoiseUI.render();

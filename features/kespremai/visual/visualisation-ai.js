import './visual-config.js';
import './visual-state.js';
import './visual-core.js';
import './visual-engine.js';
import './visual-layout.js';
import { VisualRenderer } from './visual-renderer.js';
import './visual-events.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const visualAIProxy = {
    render: function() { VisualRenderer.render(); },
    init: function() { VisualRenderer.init(); }
};

KESEMPATAN.VisualisationAI = visualAIProxy;

VisualRenderer.init();

// Static imports (in dependency order) replace the old runtime
// document.createElement('script') loader: the ES module graph itself now
// guarantees podcast-config.js -> podcast-state.js -> ... -> podcast-main.js
// finish evaluating, in this order, before any code below runs. Each of
// those files sets window.KESEMPATAN.PodcastGenerator itself (podcast-main.js
// is the one that sets the real, final version), so this loader no longer
// needs to expose a placeholder object.
import './podcast-config.js';
import './podcast-state.js';
import './ai-engine.js';
import './podcast-core.js';
import './podcast-layout.js';
import './podcast-renderer.js';
import './ui-generator.js';
import './ui-player.js';
import './podcast-handlers.js';
import './ui-main.js';
import './podcast-main.js';

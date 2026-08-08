/**
 * KESEMPATAN OS v2.0 - Main Entry Point
 * Platform Multi-Agent AI Berbahasa Indonesia
 */

import logger from './utils/logger.js';
import eventBus from './core/event-bus.js';
import cache from './utils/cache.js';
import { VERSION } from './index.js';

// Import core modules (lazy loaded for performance)
let AppInit = null;
let StateManager = null;
let AgentPool = null;

logger.info('╔════════════════════════════════════════════╗');
logger.info('║   KESEMPATAN OS v2.0                       ║');
logger.info('║   Platform Multi-Agent AI                  ║');
logger.info('║   Initializing...                          ║');
logger.info('╚════════════════════════════════════════════╝');

const startTime = performance.now();

/**
 * Initialize Application
 */
async function initApp() {
  try {
    logger.time('app-init');
    
    // Dynamic imports for code splitting
    const coreModules = await Promise.all([
      import('./core/app-init.js'),
      import('./core/state-manager.js'),
      import('./agents/agent-pool.js')
    ]);
    
    [AppInit, StateManager, AgentPool] = coreModules.map(m => m.default);
    
    // Initialize core systems
    const appInit = new AppInit();
    await appInit.initialize();
    
    const stateManager = new StateManager();
    await stateManager.initialize();
    
    const agentPool = new AgentPool();
    await agentPool.initialize();
    
    // Register global event handlers
    setupGlobalEventHandlers();
    
    // Update UI status
    updateStatusBar();
    
    const endTime = performance.now();
    const initTime = (endTime - startTime).toFixed(2);
    
    logger.info(`✓ Application initialized in ${initTime}ms`);
    logger.info(`✓ Version: ${VERSION}`);
    logger.info(`✓ Cache stats:`, cache.getStats());
    
    // Emit ready event
    eventBus.emit('app:ready', { version: VERSION, initTime });
    
    return { appInit, stateManager, agentPool };
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    eventBus.emit('app:error', { error });
    throw error;
  } finally {
    logger.timeEnd('app-init');
  }
}

/**
 * Setup Global Event Handlers
 */
function setupGlobalEventHandlers() {
  // Connection status
  window.addEventListener('online', () => {
    eventBus.emit('network:online');
    updateConnectionStatus(true);
  });
  
  window.addEventListener('offline', () => {
    eventBus.emit('network:offline');
    updateConnectionStatus(false);
  });
  
  // Visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      eventBus.emit('app:visible');
      logger.debug('App became visible');
    } else {
      eventBus.emit('app:hidden');
      logger.debug('App became hidden');
    }
  });
  
  // Before unload
  window.addEventListener('beforeunload', () => {
    eventBus.emit('app:beforeunload');
    logger.debug('App unloading...');
  });
  
  // Error handling
  window.addEventListener('error', (event) => {
    logger.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
  });
}

/**
 * Update Status Bar UI
 */
function updateStatusBar() {
  const connectionEl = document.getElementById('connection-status');
  const connectionText = document.getElementById('connection-text');
  const agentCountEl = document.getElementById('agent-count');
  const memoryEl = document.getElementById('memory-usage');
  const cacheEl = document.getElementById('cache-stats');
  
  updateConnectionStatus(navigator.onLine);
  
  // Update memory usage periodically
  setInterval(() => {
    if (performance.memory) {
      const usedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
      if (memoryEl) memoryEl.textContent = `${usedMB} MB`;
    }
  }, 5000);
  
  // Update cache stats periodically
  setInterval(() => {
    const stats = cache.getStats();
    if (cacheEl) cacheEl.textContent = `${stats.size} items (${stats.hitRate})`;
  }, 3000);
}

/**
 * Update Connection Status UI
 * @param {boolean} isOnline - Connection status
 */
function updateConnectionStatus(isOnline) {
  const connectionEl = document.getElementById('connection-status');
  const connectionText = document.getElementById('connection-text');
  
  if (connectionEl) {
    connectionEl.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
  }
  
  if (connectionText) {
    connectionText.textContent = isOnline ? 'Online' : 'Offline';
  }
}

/**
 * Navigation Handler
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const page = e.target.dataset.page;
      
      // Update active state
      navButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Load page
      logger.debug(`Navigating to page: ${page}`);
      eventBus.emit('navigation:change', { page });
      
      // Lazy load page content
      await loadPage(page);
    });
  });
}

/**
 * Load Page Content
 * @param {string} pageName - Page to load
 */
async function loadPage(pageName) {
  const container = document.getElementById('page-container');
  
  if (!container) return;
  
  try {
    container.innerHTML = '<div class="loading-screen"><div class="spinner"></div><p>Loading...</p></div>';
    
    // Dynamic import for code splitting
    const pageModule = await import(`./ui/pages/${pageName}.js`);
    
    if (pageModule.default && typeof pageModule.default.render === 'function') {
      container.innerHTML = '';
      await pageModule.default.render(container);
      logger.debug(`Page loaded: ${pageName}`);
    } else {
      throw new Error(`Invalid page module: ${pageName}`);
    }
  } catch (error) {
    logger.error(`Failed to load page ${pageName}:`, error);
    container.innerHTML = `
      <div class="error-screen">
        <h2>Error Loading Page</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()">Reload</button>
      </div>
    `;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Setup navigation after init
document.addEventListener('DOMContentLoaded', setupNavigation);

// Export for external access
export { initApp, updateStatusBar, setupNavigation };

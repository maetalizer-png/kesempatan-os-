/**
 * AppInit - Application Initialization Module
 * KESEMPATAN OS v2.0
 */

import logger from '../utils/logger.js';
import eventBus from '../core/event-bus.js';
import cache from '../utils/cache.js';

class AppInit {
  constructor() {
    this.initialized = false;
    this.modules = new Map();
    this.config = {};
  }

  /**
   * Initialize application
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('App already initialized');
      return;
    }

    logger.time('app-init-sequence');
    
    try {
      // Load configuration
      await this._loadConfig();
      
      // Register core modules
      await this._registerCoreModules();
      
      // Setup service worker
      await this._setupServiceWorker();
      
      // Initialize IndexedDB
      await this._initIndexedDB();
      
      // Warm up cache
      await this._warmupCache();
      
      this.initialized = true;
      eventBus.emit('app:init:complete');
      
      logger.info('✓ Application initialization complete');
    } catch (error) {
      logger.error('Application initialization failed:', error);
      eventBus.emit('app:init:error', { error });
      throw error;
    } finally {
      logger.timeEnd('app-init-sequence');
    }
  }

  /**
   * Load application configuration
   * @private
   */
  async _loadConfig() {
    logger.debug('Loading configuration...');
    
    try {
      // Load from localStorage or defaults
      const stored = localStorage.getItem('kes_config');
      this.config = stored ? JSON.parse(stored) : this._getDefaultConfig();
      
      logger.info('✓ Configuration loaded');
    } catch (error) {
      logger.warn('Using default configuration:', error);
      this.config = this._getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   * @private
   * @returns {Object} Default config
   */
  _getDefaultConfig() {
    return {
      version: '2.0.0',
      language: 'id',
      theme: 'dark',
      autoSave: true,
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000,
      maxAgents: 55,
      llmProvider: 'auto',
      debugMode: false,
      telemetryEnabled: true
    };
  }

  /**
   * Register core modules
   * @private
   */
  async _registerCoreModules() {
    logger.debug('Registering core modules...');
    
    const coreModules = [
      'eventBus',
      'logger',
      'cache',
      'stateManager',
      'agentPool',
      'llmEngine'
    ];
    
    for (const module of coreModules) {
      this.modules.set(module, { registered: true, timestamp: Date.now() });
      logger.debug(`Module registered: ${module}`);
    }
    
    logger.info(`✓ Registered ${coreModules.length} core modules`);
  }

  /**
   * Setup service worker for PWA
   * @private
   */
  async _setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        logger.info('✓ Service Worker registered:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          logger.debug('Service Worker update found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              eventBus.emit('sw:update', { ready: true });
              logger.info('New content available, please refresh.');
            }
          });
        });
      } catch (error) {
        logger.warn('Service Worker registration failed:', error);
      }
    } else {
      logger.debug('Service Workers not supported');
    }
  }

  /**
   * Initialize IndexedDB
   * @private
   */
  async _initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('KESEMPATAN_DB', 1);
      
      request.onerror = () => {
        logger.warn('IndexedDB unavailable, using fallback storage');
        resolve();
      };
      
      request.onsuccess = () => {
        logger.info('✓ IndexedDB initialized');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('agents')) {
          db.createObjectStore('agents', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('workflows')) {
          db.createObjectStore('workflows', { keyPath: 'id' });
        }
        
        logger.debug('IndexedDB schema created');
      };
    });
  }

  /**
   * Warm up cache with frequently used data
   * @private
   */
  async _warmupCache() {
    logger.debug('Warming up cache...');
    
    const warmupData = {
      'config:version': this.config.version,
      'config:language': this.config.language,
      'system:ready': true,
      'system:timestamp': Date.now()
    };
    
    cache.setMany(warmupData, 60 * 60 * 1000); // 1 hour TTL
    
    logger.info('✓ Cache warmed up');
  }

  /**
   * Get initialization status
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Get registered modules
   * @returns {Map} Registered modules
   */
  getModules() {
    return new Map(this.modules);
  }

  /**
   * Get configuration
   * @returns {Object} Current config
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    try {
      localStorage.setItem('kes_config', JSON.stringify(this.config));
      logger.debug('Configuration saved');
    } catch (error) {
      logger.warn('Failed to save configuration:', error);
    }
    
    eventBus.emit('config:update', { config: this.config });
  }

  /**
   * Reset to default configuration
   */
  resetConfig() {
    this.config = this._getDefaultConfig();
    localStorage.removeItem('kes_config');
    eventBus.emit('config:reset', { config: this.config });
    logger.info('Configuration reset to defaults');
  }
}

export default AppInit;

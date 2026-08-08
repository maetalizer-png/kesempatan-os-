/**
 * StateManager - Centralized State Management
 * KESEMPATAN OS v2.0
 */

import logger from '../utils/logger.js';
import eventBus from '../core/event-bus.js';
import cache from '../utils/cache.js';

class StateManager {
  constructor() {
    this.state = new Map();
    this.subscribers = new Map();
    this.history = [];
    this.maxHistory = 100;
    this.initialized = false;
  }

  /**
   * Initialize state manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('StateManager already initialized');
      return;
    }

    logger.time('state-manager-init');
    
    try {
      // Load persisted state
      await this._loadState();
      
      // Setup auto-save
      this._setupAutoSave();
      
      this.initialized = true;
      eventBus.emit('statemanager:ready');
      
      logger.info('✓ State Manager initialized');
    } catch (error) {
      logger.error('State Manager initialization failed:', error);
      throw error;
    } finally {
      logger.timeEnd('state-manager-init');
    }
  }

  /**
   * Load state from storage
   * @private
   */
  async _loadState() {
    try {
      const stored = localStorage.getItem('kes_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        for (const [key, value] of Object.entries(parsed)) {
          this.state.set(key, value);
        }
        
        logger.debug(`Loaded ${this.state.size} state items from storage`);
      }
    } catch (error) {
      logger.warn('Failed to load state from storage:', error);
    }
  }

  /**
   * Setup auto-save
   * @private
   */
  _setupAutoSave() {
    setInterval(() => {
      this._saveState();
    }, 30000); // Save every 30 seconds
    
    window.addEventListener('beforeunload', () => {
      this._saveState();
    });
  }

  /**
   * Save state to storage
   * @private
   */
  _saveState() {
    try {
      const stateObj = {};
      
      for (const [key, value] of this.state.entries()) {
        // Only save serializable values
        if (this._isSerializable(value)) {
          stateObj[key] = value;
        }
      }
      
      localStorage.setItem('kes_state', JSON.stringify(stateObj));
      logger.debug('State saved to storage');
    } catch (error) {
      logger.warn('Failed to save state:', error);
    }
  }

  /**
   * Check if value is serializable
   * @private
   * @param {any} value - Value to check
   * @returns {boolean} Serializable status
   */
  _isSerializable(value) {
    try {
      JSON.stringify(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set state value
   * @param {string} key - State key
   * @param {any} value - State value
   * @param {boolean} persist - Whether to persist to storage
   */
  set(key, value, persist = true) {
    const previousValue = this.state.get(key);
    this.state.set(key, value);
    
    // Add to history
    this._addToHistory(key, previousValue, value);
    
    // Notify subscribers
    this._notifySubscribers(key, value, previousValue);
    
    // Persist if requested
    if (persist) {
      this._saveState();
    }
    
    logger.debug(`State set: ${key}`);
    eventBus.emit('state:set', { key, value, previousValue });
  }

  /**
   * Get state value
   * @param {string} key - State key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} State value
   */
  get(key, defaultValue = null) {
    const value = this.state.get(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Delete state value
   * @param {string} key - State key
   */
  delete(key) {
    const previousValue = this.state.get(key);
    this.state.delete(key);
    
    this._addToHistory(key, previousValue, null);
    this._notifySubscribers(key, null, previousValue);
    this._saveState();
    
    logger.debug(`State deleted: ${key}`);
    eventBus.emit('state:delete', { key, previousValue });
  }

  /**
   * Check if key exists
   * @param {string} key - State key
   * @returns {boolean} Exists status
   */
  has(key) {
    return this.state.has(key);
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key).add(callback);
    logger.debug(`Subscriber added for: ${key}`);
    
    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {string} key - State key
   * @param {Function} callback - Callback function
   */
  unsubscribe(key, callback) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).delete(callback);
      logger.debug(`Subscriber removed for: ${key}`);
    }
  }

  /**
   * Notify subscribers of change
   * @private
   * @param {string} key - State key
   * @param {any} newValue - New value
   * @param {any} oldValue - Old value
   */
  _notifySubscribers(key, newValue, oldValue) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          logger.error(`Error in state subscriber for ${key}:`, error);
        }
      });
    }
    
    // Also notify wildcard subscribers
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(callback => {
        try {
          callback(key, newValue, oldValue);
        } catch (error) {
          logger.error(`Error in wildcard state subscriber:`, error);
        }
      });
    }
  }

  /**
   * Add change to history
   * @private
   * @param {string} key - State key
   * @param {any} oldValue - Old value
   * @param {any} newValue - New value
   */
  _addToHistory(key, oldValue, newValue) {
    this.history.push({
      key,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
    
    // Trim history
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * Get state history
   * @param {string} key - Optional key filter
   * @returns {Array<Object>} History entries
   */
  getHistory(key = null) {
    if (key) {
      return this.history.filter(entry => entry.key === key);
    }
    return [...this.history];
  }

  /**
   * Undo last change
   * @param {string} key - Optional key filter
   * @returns {boolean} Success status
   */
  undo(key = null) {
    let lastEntry;
    
    if (key) {
      const keyHistory = this.getHistory(key);
      lastEntry = keyHistory[keyHistory.length - 1];
    } else {
      lastEntry = this.history[this.history.length - 1];
    }
    
    if (!lastEntry) {
      logger.warn('No history to undo');
      return false;
    }
    
    // Restore previous value without adding to history
    const previousValue = this.state.get(lastEntry.key);
    this.state.set(lastEntry.key, lastEntry.oldValue);
    this._notifySubscribers(lastEntry.key, lastEntry.oldValue, previousValue);
    
    logger.debug(`Undo performed for: ${lastEntry.key}`);
    return true;
  }

  /**
   * Get all state as object
   * @returns {Object} State object
   */
  getAll() {
    const stateObj = {};
    
    for (const [key, value] of this.state.entries()) {
      stateObj[key] = value;
    }
    
    return stateObj;
  }

  /**
   * Set multiple state values
   * @param {Object} stateObj - State object
   * @param {boolean} persist - Whether to persist
   */
  setMany(stateObj, persist = true) {
    for (const [key, value] of Object.entries(stateObj)) {
      this.set(key, value, false); // Don't persist individually
    }
    
    if (persist) {
      this._saveState();
    }
    
    logger.debug(`Set ${Object.keys(stateObj).length} state values`);
  }

  /**
   * Clear all state
   */
  clear() {
    const previousState = this.getAll();
    this.state.clear();
    
    this._addToHistory('__clear__', previousState, null);
    this._saveState();
    
    logger.info('State cleared');
    eventBus.emit('state:clear', { previousState });
  }

  /**
   * Get state size
   * @returns {number} Number of state items
   */
  size() {
    return this.state.size;
  }

  /**
   * Export state
   * @returns {Object} Exportable state
   */
  export() {
    return {
      state: this.getAll(),
      history: this.getHistory(),
      exportedAt: Date.now()
    };
  }

  /**
   * Import state
   * @param {Object} data - Imported state data
   */
  import(data) {
    if (data.state) {
      this.setMany(data.state);
    }
    
    if (data.history) {
      this.history = data.history.slice(-this.maxHistory);
    }
    
    logger.info('State imported');
  }

  /**
   * Destroy state manager
   */
  destroy() {
    this._saveState();
    this.subscribers.clear();
    this.history = [];
    this.state.clear();
    this.initialized = false;
    
    logger.info('State Manager destroyed');
  }
}

export default StateManager;

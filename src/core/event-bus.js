/**
 * EventBus - Centralized Event System
 * KESEMPATAN OS v2.0
 */

import logger from '../utils/logger.js';

class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
    this.maxListeners = 100;
    this.wildcardEnabled = true;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const listeners = this.events.get(event);
    
    if (listeners.size >= this.maxListeners) {
      logger.warn(`Event "${event}" has reached max listeners (${this.maxListeners})`);
    }

    listeners.add(listener);
    logger.debug(`Subscribed to event: ${event}`);

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };

    this.on(event, onceWrapper);
    
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }
    this.onceEvents.get(event).add(listener);

    return () => this.off(event, onceWrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  off(event, listener) {
    if (this.events.has(event)) {
      this.events.get(event).delete(listener);
      
      if (this.onceEvents.has(event)) {
        this.onceEvents.get(event).delete(listener);
      }

      logger.debug(`Unsubscribed from event: ${event}`);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    logger.debug(`Emitting event: ${event}`, args);

    // Emit to specific event listeners
    if (this.events.has(event)) {
      const listeners = this.events.get(event);
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          logger.error(`Error in event listener for "${event}":`, error);
        }
      });
    }

    // Emit to wildcard listeners
    if (this.wildcardEnabled) {
      this._emitWildcard(event, ...args);
    }
  }

  /**
   * Emit to wildcard listeners (*.* pattern)
   * @private
   */
  _emitWildcard(event, ...args) {
    const parts = event.split('.');
    
    // Match patterns like "*.agent" or "agent.*"
    for (const [pattern, listeners] of this.events.entries()) {
      if (pattern === '*') {
        listeners.forEach(listener => {
          try {
            listener(event, ...args);
          } catch (error) {
            logger.error(`Error in wildcard listener:`, error);
          }
        });
      } else if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        if (event.startsWith(prefix + '.')) {
          listeners.forEach(listener => {
            try {
              listener(...args);
            } catch (error) {
              logger.error(`Error in wildcard listener:`, error);
            }
          });
        }
      } else if (pattern.startsWith('*.')) {
        const suffix = pattern.slice(1);
        if (event.endsWith(suffix)) {
          listeners.forEach(listener => {
            try {
              listener(...args);
            } catch (error) {
              logger.error(`Error in wildcard listener:`, error);
            }
          });
        }
      }
    }
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, removes all if not provided)
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
      this.onceEvents.delete(event);
      logger.debug(`Removed all listeners for event: ${event}`);
    } else {
      this.events.clear();
      this.onceEvents.clear();
      logger.info('Removed all event listeners');
    }
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    if (!this.events.has(event)) return 0;
    return this.events.get(event).size;
  }

  /**
   * Get all registered events
   * @returns {Array<string>} List of event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Set max listeners
   * @param {number} n - Max number of listeners
   */
  setMaxListeners(n) {
    this.maxListeners = n;
    logger.debug(`Set max listeners to: ${n}`);
  }

  /**
   * Get max listeners
   * @returns {number} Max number of listeners
   */
  getMaxListeners() {
    return this.maxListeners;
  }
}

// Singleton instance
const eventBus = new EventBus();

export default eventBus;
export { EventBus };

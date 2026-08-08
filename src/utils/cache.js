/**
 * Cache - In-Memory & IndexedDB Cache System
 * KESEMPATAN OS v2.0
 */

import logger from './logger.js';

class Cache {
  constructor(options = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.ttl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0
    };
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => this._cleanup(), 60000);
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check expiration
    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key);
      this.stats.expirations++;
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    // Update LRU order
    this.cache.delete(key);
    this.cache.set(key, item);
    
    this.stats.hits++;
    logger.debug(`Cache hit: ${key}`);
    return item.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in ms (optional)
   */
  set(key, value, ttl) {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this._evict();
    }

    const expiry = ttl ?? this.ttl;
    this.cache.set(key, {
      value,
      expiry: expiry ? Date.now() + expiry : null,
      created: Date.now()
    });

    logger.debug(`Cache set: ${key}`);
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if deleted
   */
  delete(key) {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    
    if (existed) {
      logger.debug(`Cache delete: ${key}`);
    }
    
    return existed;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if exists and not expired
   */
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) return false;

    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache size
   * @returns {number} Number of items in cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Evict oldest item (LRU)
   * @private
   */
  _evict() {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.stats.evictions++;
      logger.debug(`Cache eviction: ${firstKey}`);
    }
  }

  /**
   * Cleanup expired items
   * @private
   */
  _cleanup() {
    const now = Date.now();
    let expired = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
        expired++;
        this.stats.expirations++;
      }
    }

    if (expired > 0) {
      logger.debug(`Cleaned up ${expired} expired cache items`);
    }
  }

  /**
   * Destroy cache and stop cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    logger.info('Cache destroyed');
  }

  /**
   * Get or set with factory function
   * @param {string} key - Cache key
   * @param {Function} factory - Factory function to generate value
   * @param {number} ttl - Time to live in ms
   * @returns {any} Cached or generated value
   */
  async getOrSet(key, factory, ttl) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Batch get multiple keys
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Object} Object with key-value pairs
   */
  getMany(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.get(key);
    });
    return result;
  }

  /**
   * Batch set multiple keys
   * @param {Object} items - Object with key-value pairs
   * @param {number} ttl - Time to live in ms
   */
  setMany(items, ttl) {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }
}

// Singleton instance
const cache = new Cache({
  maxSize: 1000,
  ttl: 5 * 60 * 1000
});

export default cache;
export { Cache };

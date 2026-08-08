/**
 * AgentBase - Base Class for All Agents
 * KESEMPATAN OS v2.0
 */

import logger from '../utils/logger.js';
import eventBus from '../core/event-bus.js';

class AgentBase {
  constructor(config = {}) {
    this.id = config.id || `agent_${Date.now()}`;
    this.name = config.name || 'Anonymous Agent';
    this.type = config.type || 'base';
    this.status = 'idle'; // idle, busy, paused, stopped
    this.priority = config.priority || 5;
    this.capabilities = config.capabilities || [];
    this.metadata = config.metadata || {};
    
    this.state = {
      currentTask: null,
      completedTasks: 0,
      failedTasks: 0,
      lastActive: null
    };

    this.eventHandlers = new Map();
    
    logger.info(`Agent initialized: ${this.name} (${this.id})`);
  }

  /**
   * Initialize agent
   * @returns {Promise<void>}
   */
  async initialize() {
    logger.debug(`Initializing agent: ${this.name}`);
    this.status = 'idle';
    this._emit('agent:initialized', { agentId: this.id });
  }

  /**
   * Execute a task
   * @param {Object} task - Task object
   * @returns {Promise<any>} Task result
   */
  async execute(task) {
    if (this.status !== 'idle') {
      throw new Error(`Agent ${this.name} is not available (status: ${this.status})`);
    }

    this.status = 'busy';
    this.state.currentTask = task;
    this.state.lastActive = Date.now();

    logger.debug(`Agent ${this.name} executing task:`, task);
    this._emit('agent:task:start', { agentId: this.id, task });

    try {
      const result = await this._process(task);
      this.state.completedTasks++;
      this._emit('agent:task:complete', { agentId: this.id, task, result });
      return result;
    } catch (error) {
      this.state.failedTasks++;
      this._emit('agent:task:error', { agentId: this.id, task, error });
      logger.error(`Agent ${this.name} task failed:`, error);
      throw error;
    } finally {
      this.status = 'idle';
      this.state.currentTask = null;
    }
  }

  /**
   * Process task (to be overridden by subclasses)
   * @protected
   * @param {Object} task - Task object
   * @returns {Promise<any>} Task result
   */
  async _process(task) {
    logger.warn(`Agent ${this.name}: _process not implemented, returning null`);
    return null;
  }

  /**
   * Pause agent
   */
  pause() {
    if (this.status === 'busy') {
      logger.warn(`Cannot pause agent ${this.name} while busy`);
      return false;
    }
    this.status = 'paused';
    this._emit('agent:paused', { agentId: this.id });
    logger.debug(`Agent paused: ${this.name}`);
    return true;
  }

  /**
   * Resume agent
   */
  resume() {
    if (this.status !== 'paused') {
      logger.warn(`Agent ${this.name} is not paused`);
      return false;
    }
    this.status = 'idle';
    this._emit('agent:resumed', { agentId: this.id });
    logger.debug(`Agent resumed: ${this.name}`);
    return true;
  }

  /**
   * Stop agent
   */
  stop() {
    this.status = 'stopped';
    this._emit('agent:stopped', { agentId: this.id });
    logger.debug(`Agent stopped: ${this.name}`);
  }

  /**
   * Check if agent is available
   * @returns {boolean} True if available
   */
  isAvailable() {
    return this.status === 'idle';
  }

  /**
   * Get agent stats
   * @returns {Object} Agent statistics
   */
  getStats() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      priority: this.priority,
      capabilities: this.capabilities,
      ...this.state
    };
  }

  /**
   * Subscribe to agent events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, handler) {
    const agentEvent = `agent.${this.id}.${event}`;
    
    const wrappedHandler = (...args) => handler(...args);
    eventBus.on(agentEvent, wrappedHandler);
    
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(wrappedHandler);

    return () => this.off(event, wrappedHandler);
  }

  /**
   * Unsubscribe from agent events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    const agentEvent = `agent.${this.id}.${event}`;
    eventBus.off(agentEvent, handler);
    
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  /**
   * Emit agent event
   * @private
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  _emit(event, data) {
    const agentEvent = `agent.${this.id}.${event}`;
    eventBus.emit(agentEvent, data);
    eventBus.emit('agent.*', event, data); // Wildcard
  }

  /**
   * Update agent metadata
   * @param {Object} metadata - New metadata
   */
  updateMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    this._emit('agent:metadata:update', { agentId: this.id, metadata: this.metadata });
  }

  /**
   * Add capability
   * @param {string} capability - Capability to add
   */
  addCapability(capability) {
    if (!this.capabilities.includes(capability)) {
      this.capabilities.push(capability);
      this._emit('agent:capability:add', { agentId: this.id, capability });
    }
  }

  /**
   * Remove capability
   * @param {string} capability - Capability to remove
   */
  removeCapability(capability) {
    const index = this.capabilities.indexOf(capability);
    if (index > -1) {
      this.capabilities.splice(index, 1);
      this._emit('agent:capability:remove', { agentId: this.id, capability });
    }
  }

  /**
   * Destroy agent
   */
  destroy() {
    this.stop();
    
    // Remove all event handlers
    for (const [event, handlers] of this.eventHandlers.entries()) {
      handlers.forEach(handler => this.off(event, handler));
    }
    this.eventHandlers.clear();

    this._emit('agent:destroyed', { agentId: this.id });
    logger.info(`Agent destroyed: ${this.name}`);
  }
}

export default AgentBase;

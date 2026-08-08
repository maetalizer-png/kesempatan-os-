/**
 * Agent Pool - Manages All AI Agents
 * KESEMPATAN OS v2.0
 */

import logger from '../utils/logger.js';
import eventBus from '../core/event-bus.js';
import AgentBase from './agent-base.js';

class AgentPool {
  constructor() {
    this.agents = new Map();
    this.initialized = false;
    this.maxAgents = 55;
    this.agentTypes = new Map();
  }

  /**
   * Initialize agent pool
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('AgentPool already initialized');
      return;
    }

    logger.time('agent-pool-init');
    
    try {
      // Register default agent types
      await this._registerAgentTypes();
      
      // Load agents from storage
      await this._loadAgents();
      
      this.initialized = true;
      eventBus.emit('agentpool:ready', { count: this.agents.size });
      
      logger.info(`✓ Agent Pool initialized with ${this.agents.size} agents`);
    } catch (error) {
      logger.error('Agent Pool initialization failed:', error);
      eventBus.emit('agentpool:error', { error });
      throw error;
    } finally {
      logger.timeEnd('agent-pool-init');
    }
  }

  /**
   * Register default agent types
   * @private
   */
  async _registerAgentTypes() {
    const defaultTypes = [
      { id: 'general', name: 'General Agent', capabilities: ['chat', 'analysis'] },
      { id: 'researcher', name: 'Research Agent', capabilities: ['search', 'summarize'] },
      { id: 'coder', name: 'Coding Agent', capabilities: ['code', 'debug'] },
      { id: 'analyst', name: 'Data Analyst', capabilities: ['analyze', 'visualize'] },
      { id: 'writer', name: 'Content Writer', capabilities: ['write', 'edit'] }
    ];

    for (const type of defaultTypes) {
      this.agentTypes.set(type.id, type);
      logger.debug(`Agent type registered: ${type.id}`);
    }
  }

  /**
   * Load agents from storage
   * @private
   */
  async _loadAgents() {
    // Placeholder for loading from IndexedDB or localStorage
    // For now, create default agents
    await this._createDefaultAgents();
  }

  /**
   * Create default agents
   * @private
   */
  async _createDefaultAgents() {
    const regions = [
      'ASEAN', 'Asian', 'African', 'American', 'European'
    ];

    let agentId = 1;
    
    // Create regional agents
    for (const region of regions) {
      const agent = new AgentBase({
        id: `agent_${region.toLowerCase()}`,
        name: `${region} Regional Agent`,
        type: 'regional',
        capabilities: ['regional-analysis', 'data-collection'],
        metadata: { region }
      });

      await agent.initialize();
      this.agents.set(agent.id, agent);
      
      if (agentId++ >= this.maxAgents) break;
    }

    logger.debug(`Created ${agentId - 1} default agents`);
  }

  /**
   * Add agent to pool
   * @param {AgentBase} agent - Agent instance
   * @returns {boolean} Success status
   */
  add(agent) {
    if (!(agent instanceof AgentBase)) {
      logger.error('Invalid agent type');
      return false;
    }

    if (this.agents.size >= this.maxAgents) {
      logger.warn('Agent pool at capacity');
      return false;
    }

    this.agents.set(agent.id, agent);
    logger.info(`Agent added: ${agent.name}`);
    eventBus.emit('agentpool:add', { agentId: agent.id });
    
    return true;
  }

  /**
   * Remove agent from pool
   * @param {string} agentId - Agent ID
   * @returns {boolean} Success status
   */
  remove(agentId) {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      logger.warn(`Agent not found: ${agentId}`);
      return false;
    }

    agent.destroy();
    this.agents.delete(agentId);
    logger.info(`Agent removed: ${agentId}`);
    eventBus.emit('agentpool:remove', { agentId });
    
    return true;
  }

  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {AgentBase|null} Agent instance
   */
  get(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get available agents
   * @returns {Array<AgentBase>} Available agents
   */
  getAvailable() {
    const available = [];
    
    for (const agent of this.agents.values()) {
      if (agent.isAvailable()) {
        available.push(agent);
      }
    }
    
    return available;
  }

  /**
   * Get agents by capability
   * @param {string} capability - Required capability
   * @returns {Array<AgentBase>} Matching agents
   */
  getByCapability(capability) {
    const matching = [];
    
    for (const agent of this.agents.values()) {
      if (agent.capabilities.includes(capability) && agent.isAvailable()) {
        matching.push(agent);
      }
    }
    
    return matching;
  }

  /**
   * Execute task on best available agent
   * @param {Object} task - Task object
   * @returns {Promise<any>} Task result
   */
  async executeTask(task) {
    let candidates = [];
    
    // Find agents with required capability
    if (task.requiredCapability) {
      candidates = this.getByCapability(task.requiredCapability);
    }
    
    // Fallback to any available agent
    if (candidates.length === 0) {
      candidates = this.getAvailable();
    }
    
    if (candidates.length === 0) {
      throw new Error('No agents available');
    }

    // Select agent by priority
    candidates.sort((a, b) => a.priority - b.priority);
    const selectedAgent = candidates[0];

    logger.debug(`Executing task on agent: ${selectedAgent.name}`);
    return await selectedAgent.execute(task);
  }

  /**
   * Broadcast task to all available agents
   * @param {Object} task - Task object
   * @returns {Promise<Array>} Results from all agents
   */
  async broadcastTask(task) {
    const available = this.getAvailable();
    
    if (available.length === 0) {
      logger.warn('No agents available for broadcast');
      return [];
    }

    logger.debug(`Broadcasting task to ${available.length} agents`);
    
    const results = await Promise.allSettled(
      available.map(agent => agent.execute(task))
    );

    return results.map((result, index) => ({
      agentId: available[index].id,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool stats
   */
  getStats() {
    const agents = Array.from(this.agents.values());
    
    return {
      total: this.agents.size,
      available: agents.filter(a => a.isAvailable()).length,
      busy: agents.filter(a => a.status === 'busy').length,
      paused: agents.filter(a => a.status === 'paused').length,
      stopped: agents.filter(a => a.status === 'stopped').length,
      maxCapacity: this.maxAgents,
      utilizationRate: ((agents.filter(a => a.status === 'busy').length / this.agents.size) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Get all agents
   * @returns {Array<Object>} Agent summaries
   */
  getAll() {
    return Array.from(this.agents.values()).map(agent => agent.getStats());
  }

  /**
   * Pause all agents
   */
  pauseAll() {
    for (const agent of this.agents.values()) {
      agent.pause();
    }
    logger.info('All agents paused');
    eventBus.emit('agentpool:pauseall');
  }

  /**
   * Resume all agents
   */
  resumeAll() {
    for (const agent of this.agents.values()) {
      agent.resume();
    }
    logger.info('All agents resumed');
    eventBus.emit('agentpool:resumeall');
  }

  /**
   * Stop all agents
   */
  stopAll() {
    for (const agent of this.agents.values()) {
      agent.stop();
    }
    logger.info('All agents stopped');
    eventBus.emit('agentpool:stopall');
  }

  /**
   * Destroy pool and all agents
   */
  destroy() {
    this.stopAll();
    
    for (const agent of this.agents.values()) {
      agent.destroy();
    }
    
    this.agents.clear();
    this.agentTypes.clear();
    this.initialized = false;
    
    logger.info('Agent Pool destroyed');
  }
}

export default AgentPool;

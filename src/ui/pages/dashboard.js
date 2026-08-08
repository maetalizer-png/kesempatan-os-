/**
 * Dashboard Page Component
 * KESEMPATAN OS v2.0
 */

import logger from '../../utils/logger.js';
import eventBus from '../../core/event-bus.js';
import cache from '../../utils/cache.js';

class DashboardPage {
  constructor() {
    this.container = null;
    this.data = {};
  }

  /**
   * Render dashboard page
   * @param {HTMLElement} container - Container element
   */
  async render(container) {
    this.container = container;
    
    await this._loadData();
    this._renderLayout();
    this._attachEventListeners();
    this._updateMetrics();
    
    logger.debug('Dashboard rendered');
  }

  /**
   * Load dashboard data
   * @private
   */
  async _loadData() {
    this.data = {
      agentCount: 55,
      activeAgents: 0,
      workflowsCompleted: 0,
      cacheStats: cache.getStats(),
      systemStatus: 'operational',
      lastUpdate: Date.now()
    };
  }

  /**
   * Render page layout
   * @private
   */
  _renderLayout() {
    this.container.innerHTML = `
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <section class="dashboard-welcome">
          <h2>Selamat Datang di KESEMPATAN OS v2.0</h2>
          <p>Platform Multi-Agent AI Berbahasa Indonesia</p>
        </section>

        <!-- Stats Cards -->
        <section class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-icon">🤖</div>
            <div class="stat-content">
              <h3 id="agent-count">0</h3>
              <p>Total Agents</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h3 id="active-agents">0</h3>
              <p>Active Now</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3 id="workflows-count">0</h3>
              <p>Workflows</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💾</div>
            <div class="stat-content">
              <h3 id="cache-hit-rate">--</h3>
              <p>Cache Hit Rate</p>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="dashboard-actions">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <button class="action-btn" data-action="new-workflow">
              <span class="action-icon">➕</span>
              <span>New Workflow</span>
            </button>
            <button class="action-btn" data-action="view-agents">
              <span class="action-icon">👥</span>
              <span>View Agents</span>
            </button>
            <button class="action-btn" data-action="run-analysis">
              <span class="action-icon">🔍</span>
              <span>Run Analysis</span>
            </button>
            <button class="action-btn" data-action="settings">
              <span class="action-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="dashboard-activity">
          <h3>Recent Activity</h3>
          <div id="activity-log" class="activity-list">
            <div class="activity-item">
              <span class="activity-time">Just now</span>
              <span class="activity-text">System initialized</span>
            </div>
          </div>
        </section>

        <!-- System Health -->
        <section class="dashboard-health">
          <h3>System Health</h3>
          <div class="health-indicators">
            <div class="health-item">
              <span class="health-label">API Status</span>
              <span class="health-status status-ok">✓ Operational</span>
            </div>
            <div class="health-item">
              <span class="health-label">Database</span>
              <span class="health-status status-ok">✓ Connected</span>
            </div>
            <div class="health-item">
              <span class="health-label">Cache</span>
              <span class="health-status status-ok">✓ Active</span>
            </div>
            <div class="health-item">
              <span class="health-label">Workers</span>
              <span class="health-status status-ok">✓ Ready</span>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachEventListeners() {
    // Quick action buttons
    const actionButtons = this.container.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this._handleAction(action);
      });
    });

    // Listen for system events
    eventBus.on('app:ready', () => this._updateMetrics());
    eventBus.on('agent:*', (data) => this._onAgentEvent(data));
  }

  /**
   * Handle quick actions
   * @private
   * @param {string} action - Action name
   */
  _handleAction(action) {
    logger.debug(`Dashboard action: ${action}`);
    
    switch (action) {
      case 'new-workflow':
        eventBus.emit('navigation:change', { page: 'workflow' });
        break;
      case 'view-agents':
        eventBus.emit('navigation:change', { page: 'agents' });
        break;
      case 'run-analysis':
        eventBus.emit('analysis:start');
        break;
      case 'settings':
        eventBus.emit('navigation:change', { page: 'settings' });
        break;
    }
  }

  /**
   * Update metrics display
   * @private
   */
  _updateMetrics() {
    const agentCountEl = document.getElementById('agent-count');
    const activeAgentsEl = document.getElementById('active-agents');
    const workflowsEl = document.getElementById('workflows-count');
    const cacheHitEl = document.getElementById('cache-hit-rate');

    if (agentCountEl) agentCountEl.textContent = this.data.agentCount;
    if (activeAgentsEl) activeAgentsEl.textContent = this.data.activeAgents;
    if (workflowsEl) workflowsEl.textContent = this.data.workflowsCompleted;
    if (cacheHitEl) cacheHitEl.textContent = this.data.cacheStats.hitRate;
  }

  /**
   * Handle agent events
   * @private
   * @param {Object} data - Event data
   */
  _onAgentEvent(data) {
    logger.debug('Agent event received:', data);
    
    // Update active agents count
    if (data.status === 'busy') {
      this.data.activeAgents++;
    } else if (data.status === 'idle') {
      this.data.activeAgents = Math.max(0, this.data.activeAgents - 1);
    }
    
    this._updateMetrics();
    this._addActivityItem(`Agent ${data.agentId}: ${data.status}`);
  }

  /**
   * Add activity log item
   * @private
   * @param {string} text - Activity text
   */
  _addActivityItem(text) {
    const activityLog = document.getElementById('activity-log');
    if (!activityLog) return;
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <span class="activity-time">Now</span>
      <span class="activity-text">${text}</span>
    `;
    
    activityLog.insertBefore(item, activityLog.firstChild);
    
    // Keep only last 10 items
    while (activityLog.children.length > 10) {
      activityLog.removeChild(activityLog.lastChild);
    }
  }

  /**
   * Destroy page
   */
  destroy() {
    this.container = null;
    this.data = {};
  }
}

export default new DashboardPage();

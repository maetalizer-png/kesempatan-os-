/**
 * AI Worker - Web Worker for AI Processing
 * KESEMPATAN OS v2.0
 */

// Self-contained worker code
const workerCode = `
let workerContext = {
  taskId: null,
  status: 'idle',
  startTime: null
};

// Message handler
self.onmessage = async function(event) {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'INIT':
      initWorker(payload);
      break;
    
    case 'PROCESS':
      await processTask(payload);
      break;
    
    case 'CANCEL':
      cancelTask(payload.taskId);
      break;
    
    case 'GET_STATUS':
      sendStatus();
      break;
    
    default:
      console.warn('[AI Worker] Unknown message type:', type);
  }
};

/**
 * Initialize worker
 */
function initWorker(config) {
  workerContext = {
    ...workerContext,
    config: config || {},
    initialized: true
  };
  
  self.postMessage({
    type: 'INITIALIZED',
    payload: { timestamp: Date.now() }
  });
}

/**
 * Process AI task
 */
async function processTask(task) {
  workerContext.status = 'busy';
  workerContext.taskId = task.id;
  workerContext.startTime = Date.now();
  
  try {
    const result = await executeAITask(task);
    
    self.postMessage({
      type: 'TASK_COMPLETE',
      payload: {
        taskId: task.id,
        result,
        duration: Date.now() - workerContext.startTime
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'TASK_ERROR',
      payload: {
        taskId: task.id,
        error: error.message,
        stack: error.stack
      }
    });
  } finally {
    workerContext.status = 'idle';
    workerContext.taskId = null;
  }
}

/**
 * Execute AI task based on type
 */
async function executeAITask(task) {
  switch (task.type) {
    case 'INFERENCE':
      return runInference(task.data);
    
    case 'EMBEDDING':
      return generateEmbedding(task.data);
    
    case 'TOKENIZE':
      return tokenize(task.data);
    
    case 'CLASSIFY':
      return classify(task.data);
    
    case 'EXTRACT':
      return extractEntities(task.data);
    
    case 'SUMMARIZE':
      return summarize(task.data);
    
    default:
      throw new Error('Unknown task type: ' + task.type);
  }
}

/**
 * Run AI inference
 */
function runInference(data) {
  // Placeholder for actual inference logic
  // In production, this would use TensorFlow.js or ONNX Runtime
  return {
    output: 'Inference result placeholder',
    confidence: 0.95,
    metadata: {
      model: 'kes-llm-v2',
      tokens: data.length
    }
  };
}

/**
 * Generate text embedding
 */
function generateEmbedding(data) {
  // Placeholder for embedding generation
  return {
    embedding: new Array(768).fill(0).map(() => Math.random()),
    dimensions: 768,
    normalized: true
  };
}

/**
 * Tokenize text
 */
function tokenize(text) {
  // Simple tokenization (placeholder for proper tokenizer)
  const tokens = text.split(/\\s+/).filter(t => t.length > 0);
  
  return {
    tokens,
    count: tokens.length,
    ids: tokens.map((t, i) => i) // Placeholder IDs
  };
}

/**
 * Classify text
 */
function classify(data) {
  // Placeholder classification
  return {
    label: 'general',
    confidence: 0.85,
    allLabels: [
      { label: 'general', score: 0.85 },
      { label: 'technical', score: 0.10 },
      { label: 'creative', score: 0.05 }
    ]
  };
}

/**
 * Extract entities from text
 */
function extractEntities(text) {
  // Placeholder entity extraction
  return {
    entities: [],
    relations: [],
    keywords: text.split(/\\s+/).slice(0, 10)
  };
}

/**
 * Summarize text
 */
function summarize(text) {
  // Placeholder summarization
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    summary: sentences.slice(0, 3).join('. ') + '.',
    originalLength: text.length,
    summaryLength: sentences.slice(0, 3).join('. ').length,
    compressionRatio: sentences.length > 0 ? 
      (sentences.slice(0, 3).length / sentences.length).toFixed(2) : 0
  };
}

/**
 * Cancel running task
 */
function cancelTask(taskId) {
  if (workerContext.taskId === taskId && workerContext.status === 'busy') {
    workerContext.status = 'cancelled';
    workerContext.taskId = null;
    
    self.postMessage({
      type: 'TASK_CANCELLED',
      payload: { taskId }
    });
  }
}

/**
 * Send current status
 */
function sendStatus() {
  self.postMessage({
    type: 'STATUS',
    payload: {
      status: workerContext.status,
      taskId: workerContext.taskId,
      uptime: Date.now() - (workerContext.startTime || Date.now())
    }
  });
}
`;

// Create blob URL for worker
const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);

/**
 * AIWorker Class - Manages AI Web Worker
 */
class AIWorker {
  constructor(options = {}) {
    this.worker = null;
    this.taskQueue = [];
    this.pendingTasks = new Map();
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 30000,
      autoStart: options.autoStart ?? true
    };
    this.initialized = false;
    this.taskCounter = 0;
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * Start the worker
   */
  start() {
    if (this.worker) {
      console.warn('[AIWorker] Already started');
      return;
    }
    
    this.worker = new Worker(workerUrl);
    this.worker.onmessage = this._handleMessage.bind(this);
    this.worker.onerror = this._handleError.bind(this);
    
    console.log('[AIWorker] Started');
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.taskQueue = [];
      this.pendingTasks.clear();
      console.log('[AIWorker] Stopped');
    }
  }

  /**
   * Submit a task
   */
  async submit(task) {
    const taskId = `task_${++this.taskCounter}_${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._rejectTask(taskId, new Error('Task timeout'));
      }, this.options.timeout);
      
      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        timeout,
        retries: 0,
        submittedAt: Date.now()
      });
      
      if (this.worker && this.initialized) {
        this._sendTask(taskId, task);
      } else {
        this.taskQueue.push({ taskId, task });
      }
    });
  }

  /**
   * Send task to worker
   */
  _sendTask(taskId, task) {
    this.worker.postMessage({
      type: 'PROCESS',
      payload: {
        id: taskId,
        ...task
      }
    });
  }

  /**
   * Handle worker messages
   */
  _handleMessage(event) {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'INITIALIZED':
        this.initialized = true;
        this._processQueue();
        break;
      
      case 'TASK_COMPLETE':
        this._resolveTask(payload.taskId, payload.result);
        break;
      
      case 'TASK_ERROR':
        this._handleTaskError(payload.taskId, payload.error);
        break;
      
      case 'TASK_CANCELLED':
        this._rejectTask(payload.taskId, new Error('Task cancelled'));
        break;
      
      case 'STATUS':
        console.log('[AIWorker] Status:', payload);
        break;
    }
  }

  /**
   * Handle worker errors
   */
  _handleError(error) {
    console.error('[AIWorker] Error:', error);
    
    // Reject all pending tasks
    for (const [taskId, task] of this.pendingTasks.entries()) {
      this._rejectTask(taskId, error);
    }
  }

  /**
   * Resolve a task
   */
  _resolveTask(taskId, result) {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      clearTimeout(task.timeout);
      task.resolve(result);
      this.pendingTasks.delete(taskId);
    }
  }

  /**
   * Reject a task
   */
  _rejectTask(taskId, error) {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      clearTimeout(task.timeout);
      task.reject(error);
      this.pendingTasks.delete(taskId);
    }
  }

  /**
   * Handle task error with retry
   */
  async _handleTaskError(taskId, error) {
    const task = this.pendingTasks.get(taskId);
    if (!task) return;
    
    if (task.retries < this.options.maxRetries) {
      task.retries++;
      console.log(`[AIWorker] Retrying task ${taskId} (${task.retries}/${this.options.maxRetries})`);
      
      setTimeout(() => {
        const queuedTask = this.taskQueue.find(t => t.taskId === taskId);
        if (queuedTask) {
          this._sendTask(taskId, queuedTask.task);
        }
      }, 1000 * task.retries);
    } else {
      this._rejectTask(taskId, new Error(error));
    }
  }

  /**
   * Process queued tasks
   */
  _processQueue() {
    while (this.taskQueue.length > 0 && this.initialized) {
      const { taskId, task } = this.taskQueue.shift();
      this._sendTask(taskId, task);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize() {
    return this.taskQueue.length;
  }

  /**
   * Get pending task count
   */
  getPendingCount() {
    return this.pendingTasks.size;
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      queueSize: this.getQueueSize(),
      pendingCount: this.getPendingCount(),
      status: this.worker ? 'running' : 'stopped'
    };
  }
}

export default AIWorker;

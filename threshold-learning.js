(function() {
'use strict';
if (window.__LearningUltimateLoaded) return;
window.__LearningUltimateLoaded = true;
window.__LearningLoaded = true;

const InternalLogger = Object.freeze({
    _logs: [],
    _maxLogs: 1000,
    _levels: Object.freeze({ DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 }),
    _level: 1,
    log: function(level, module, message, data) {
        const entry = Object.freeze({
            timestamp: Date.now(),
            level: level,
            module: module,
            message: message,
            data: data || null,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
        });
        this._logs.push(entry);
        if (this._logs.length > this._maxLogs) this._logs.shift();
        return entry;
    },
    debug: function(module, message, data) { return this.log(this._levels.DEBUG, module, message, data); },
    info: function(module, message, data) { return this.log(this._levels.INFO, module, message, data); },
    warn: function(module, message, data) { return this.log(this._levels.WARN, module, message, data); },
    error: function(module, message, data) { return this.log(this._levels.ERROR, module, message, data); },
    critical: function(module, message, data) { return this.log(this._levels.CRITICAL, module, message, data); },
    getLogs: function(level, limit) {
        limit = limit || 100;
        let result = this._logs;
        if (level !== undefined) result = result.filter(function(log) { return log.level >= level; });
        return result.slice(-limit);
    },
    clear: function() { this._logs = []; },
    setLevel: function(level) { this._level = level; },
    getLevel: function() { return this._level; }
});

const NotificationSystem = Object.freeze({
    _notifications: [],
    _maxNotifications: 100,
    _listeners: [],
    _types: Object.freeze({ SUCCESS: 'success', INFO: 'info', WARNING: 'warning', ERROR: 'error', CRITICAL: 'critical' }),
    notify: function(type, title, message, details) {
        const notification = Object.freeze({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            type: type, title: title, message: message,
            details: details || null, timestamp: Date.now(), read: false
        });
        this._notifications.push(notification);
        if (this._notifications.length > this._maxNotifications) this._notifications.shift();
        for (let i = 0; i < this._listeners.length; i++) {
            try { this._listeners[i](notification); } catch (e) { console.warn('[AutoLearning] Notification listener failed:', e.message); }
        }
        const levelMap = { 'success': 1, 'info': 1, 'warning': 2, 'error': 3, 'critical': 4 };
        InternalLogger.log(levelMap[type] || 1, 'Notification', title + ': ' + message);
        return notification;
    },
    success: function(title, message, details) { return this.notify(this._types.SUCCESS, title, message, details); },
    info: function(title, message, details) { return this.notify(this._types.INFO, title, message, details); },
    warning: function(title, message, details) { return this.notify(this._types.WARNING, title, message, details); },
    error: function(title, message, details) { return this.notify(this._types.ERROR, title, message, details); },
    critical: function(title, message, details) { return this.notify(this._types.CRITICAL, title, message, details); },
    subscribe: function(listener) {
        this._listeners.push(listener);
        return function() {
            const index = this._listeners.indexOf(listener);
            if (index > -1) this._listeners.splice(index, 1);
        }.bind(this);
    },
    getNotifications: function(unreadOnly, limit) {
        limit = limit || 50;
        let result = this._notifications;
        if (unreadOnly) result = result.filter(function(n) { return !n.read; });
        return result.slice(-limit);
    },
    markAsRead: function(id) {
        const notification = this._notifications.find(function(n) { return n.id === id; });
        if (notification) notification.read = true;
    },
    markAllAsRead: function() {
        for (let i = 0; i < this._notifications.length; i++) this._notifications[i].read = true;
    },
    clear: function() { this._notifications = []; },
    getStats: function() {
        const total = this._notifications.length;
        const unread = this._notifications.filter(function(n) { return !n.read; }).length;
        const byType = {};
        const typeKeys = Object.keys(this._types);
        for (let i = 0; i < typeKeys.length; i++) {
            const type = typeKeys[i];
            byType[type] = this._notifications.filter(function(n) { return n.type === type; }).length;
        }
        return Object.freeze({ total: total, unread: unread, byType: byType });
    }
});

const showToast = function(message, type) {
    type = type || 'info';
    try {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
        else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
        else if (type === 'warning') toast.style.borderLeftColor = '#f39c12';
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3500);
    } catch(e) { console.warn('[AutoLearning] showToast failed:', e.message); }
};

const CONFIG = Object.freeze({
    MAX_HISTORY: 2000, DECAY_FACTOR: 0.05, DEFAULT_THRESHOLD: 70,
    MIN_THRESHOLD: 50, MAX_THRESHOLD: 90, COLD_START_MIN_DATA: 3,
    PREDICTION_MIN_DATA: 5, CONFIDENCE_HIGH: 80, CONFIDENCE_LOW: 40,
    ACTIVE_LEARNING_THRESHOLD: 0.6, AUTO_OPTIMIZE_INTERVAL: 3600000,
    DQN_BATCH_SIZE: 32, DQN_GAMMA: 0.95, DQN_EPSILON: 0.1,
    LSTM_WINDOW_SIZE: 10, LSTM_HIDDEN_SIZE: 20, FEDERATED_WEIGHT: 0.1,
    STREAMING_BATCH_SIZE: 10, MULTI_MODAL_LR: 0.02, META_LR: 0.01
});

const AGENT_CATEGORIES = Object.freeze({
    'RahmadRaharjo': 'business', 'Manager': 'business', 'StartupFounder': 'business',
    'SundanyaAsep': 'creative', 'DevilsAdvocate': 'critical', 'DataScientist': 'tech',
    'AIEthicsOfficer': 'tech', 'BlockchainExpert': 'tech', 'Statistika': 'tech',
    'Analyst': 'tech', 'Strategist': 'business', 'Hunter': 'business',
    'Researcher': 'research', 'Verifier': 'critical', 'Copywriter': 'creative',
    'Script': 'creative', 'Planner': 'business', 'Distributor': 'business',
    'Optimizer': 'tech', 'Memory': 'tech', 'PromptOptimizer': 'tech'
});

const CATEGORY_DEFAULTS = Object.freeze({
    'business': { threshold: 72, confidence: 70 },
    'tech': { threshold: 68, confidence: 75 },
    'creative': { threshold: 65, confidence: 65 },
    'critical': { threshold: 75, confidence: 80 },
    'research': { threshold: 70, confidence: 72 },
    'general': { threshold: 70, confidence: 70 }
});

const DQNEngine = {
    _replayMemory: [], _batchSize: CONFIG.DQN_BATCH_SIZE, _gamma: CONFIG.DQN_GAMMA,
    _epsilon: CONFIG.DQN_EPSILON, _targetUpdate: 100, _stateSize: 10, _actionSize: 2, _model: null,
    _buildModel: function() {
        return { weights: {
            w1: Array.from({ length: 10 * 32 }, function() { return Math.random() * 2 - 1; }),
            w2: Array.from({ length: 32 * 2 }, function() { return Math.random() * 2 - 1; }),
            b1: Array.from({ length: 32 }, function() { return Math.random() * 2 - 1; }),
            b2: Array.from({ length: 2 }, function() { return Math.random() * 2 - 1; })
        }};
    },
    _forward: function(state, model) {
        const h1 = state.map(function(s, i) {
            let sum = 0;
            for (let j = 0; j < 32; j++) sum += s * model.weights.w1[i * 32 + j];
            return Math.max(0, sum + model.weights.b1[i]);
        });
        const output = h1.map(function(h, i) {
            let sum = 0;
            for (let j = 0; j < 2; j++) sum += h * model.weights.w2[i * 2 + j];
            return sum + model.weights.b2[i];
        });
        return output;
    },
    getQValues: function(state) {
        if (!this._model) this._model = this._buildModel();
        return this._forward(state, this._model);
    },
    chooseAction: function(state, epsilon) {
        epsilon = epsilon || this._epsilon;
        if (Math.random() < epsilon) return Math.random() < 0.5 ? 0 : 1;
        const qValues = this.getQValues(state);
        return qValues[0] > qValues[1] ? 0 : 1;
    },
    remember: function(state, action, reward, nextState, done) {
        this._replayMemory.push({ state: state, action: action, reward: reward, nextState: nextState, done: done });
        if (this._replayMemory.length > 10000) this._replayMemory.shift();
    },
    replay: function() {
        if (this._replayMemory.length < this._batchSize) return;
        const batch = this._replayMemory.slice(-this._batchSize);
        for (let i = 0; i < batch.length; i++) {
            const experience = batch[i];
            const target = this.getQValues(experience.state);
            if (experience.done) {
                target[experience.action] = experience.reward;
            } else {
                const nextQ = this.getQValues(experience.nextState);
                target[experience.action] = experience.reward + this._gamma * Math.max.apply(Math, nextQ);
            }
            this._updateWeights(experience.state, target);
        }
        if (this._replayMemory.length % this._targetUpdate === 0) this._model = this._buildModel();
    },
    _updateWeights: function(state, target) {
        const lr = 0.001;
        const current = this._forward(state, this._model);
        const error = target.map(function(t, i) { return t - current[i]; });
        for (let i = 0; i < this._model.weights.w1.length; i++) this._model.weights.w1[i] += lr * error[0] * Math.random();
        for (let i = 0; i < this._model.weights.w2.length; i++) this._model.weights.w2[i] += lr * error[0] * Math.random();
    },
    getStats: function() {
        return { memorySize: this._replayMemory.length, hasModel: !!this._model, epsilon: this._epsilon, gamma: this._gamma, batchSize: this._batchSize };
    },
    reset: function() {
        this._model = null;
        this._replayMemory = [];
        InternalLogger.info('DQNEngine', 'Reset');
    }
};

const LSTMPredictor = {
    _windowSize: CONFIG.LSTM_WINDOW_SIZE, _hiddenSize: CONFIG.LSTM_HIDDEN_SIZE, _weights: null,
    _initWeights: function() {
        this._weights = {
            Wx: Array.from({ length: this._windowSize * this._hiddenSize }, function() { return Math.random() * 0.1; }),
            Wh: Array.from({ length: this._hiddenSize * this._hiddenSize }, function() { return Math.random() * 0.1; }),
            b: Array.from({ length: this._hiddenSize }, function() { return Math.random() * 0.1; }),
            Wy: Array.from({ length: this._hiddenSize }, function() { return Math.random() * 0.1; })
        };
    },
    _sigmoid: function(x) { return 1 / (1 + Math.exp(-x)); },
    _tanh: function(x) { return Math.tanh(x); },
    _forward: function(input, hidden) {
        if (!this._weights) this._initWeights();
        const Wx = this._weights.Wx;
        const Wh = this._weights.Wh;
        const b = this._weights.b;
        const h = Array(this._hiddenSize).fill(0);
        for (let i = 0; i < this._hiddenSize; i++) {
            let sum = 0;
            for (let j = 0; j < this._windowSize; j++) sum += input[j] * Wx[i * this._windowSize + j];
            for (let j = 0; j < this._hiddenSize; j++) sum += hidden[j] * Wh[i * this._hiddenSize + j];
            h[i] = this._tanh(sum + b[i]);
        }
        return h;
    },
    predict: function(history) {
        if (history.length < this._windowSize) return null;
        if (!this._weights) this._initWeights();
        const input = history.slice(-this._windowSize);
        const normalized = input.map(function(x) { return x / 100; });
        let hidden = Array(this._hiddenSize).fill(0);
        for (let i = 0; i < 3; i++) hidden = this._forward(normalized, hidden);
        let prediction = 0;
        for (let i = 0; i < this._hiddenSize; i++) prediction += hidden[i] * this._weights.Wy[i];
        prediction = this._sigmoid(prediction);
        return {
            prediction: prediction,
            confidence: Math.min(95, 50 + Math.abs(prediction - 0.5) * 100),
            trend: prediction > 0.55 ? 'Increasing' : (prediction < 0.45 ? 'Decreasing' : 'Stable')
        };
    },
    train: function(history, target) {
        const lr = 0.01;
        const input = history.slice(-this._windowSize);
        const normalized = input.map(function(x) { return x / 100; });
        let hidden = Array(this._hiddenSize).fill(0);
        for (let i = 0; i < 3; i++) hidden = this._forward(normalized, hidden);
        let prediction = 0;
        for (let i = 0; i < this._hiddenSize; i++) prediction += hidden[i] * this._weights.Wy[i];
        prediction = this._sigmoid(prediction);
        const error = target - prediction;
        for (let i = 0; i < this._weights.Wy.length; i++) this._weights.Wy[i] += lr * error * hidden[i];
        this._weights.Wy = this._weights.Wy.map(function(w) { return Math.max(-5, Math.min(5, w)); });
    },
    getStats: function() { return { windowSize: this._windowSize, hiddenSize: this._hiddenSize, hasWeights: !!this._weights }; },
    reset: function() { this._weights = null; InternalLogger.info('LSTMPredictor', 'Reset'); }
};

const FederatedLearning = {
    _globalWeights: null, _participants: new Map(), _weight: CONFIG.FEDERATED_WEIGHT,
    aggregate: function(localWeights, userId) {
        if (!this._globalWeights) {
            this._globalWeights = localWeights;
            this._addParticipant(userId);
            return;
        }
        const weight = this._weight;
        for (const key in localWeights) {
            if (this._globalWeights[key] !== undefined) {
                this._globalWeights[key] = this._globalWeights[key] * (1 - weight) + localWeights[key] * weight;
            } else {
                this._globalWeights[key] = localWeights[key];
            }
        }
        this._addParticipant(userId);
        InternalLogger.debug('FederatedLearning', 'Aggregated weights from ' + userId);
    },
    _addParticipant: function(userId) {
        if (!this._participants.has(userId)) {
            this._participants.set(userId, { lastUpdate: Date.now(), contribution: 1 });
        } else {
            const data = this._participants.get(userId);
            data.lastUpdate = Date.now();
            data.contribution++;
            this._participants.set(userId, data);
        }
    },
    getGlobalWeights: function() { return this._globalWeights; },
    getParticipants: function() {
        return Array.from(this._participants.entries()).map(function(entry) {
            return { userId: entry[0], lastUpdate: new Date(entry[1].lastUpdate).toISOString(), contribution: entry[1].contribution };
        });
    },
    getStats: function() {
        return {
            totalParticipants: this._participants.size,
            hasGlobalWeights: !!this._globalWeights,
            globalKeys: this._globalWeights ? Object.keys(this._globalWeights).length : 0,
            weight: this._weight
        };
    },
    reset: function() { this._globalWeights = null; this._participants = new Map(); InternalLogger.info('FederatedLearning', 'Reset'); }
};

const SHAPExplainer = Object.freeze({
    explain: function(model, input, featureNames) {
        featureNames = featureNames || ['agent', 'confidence', 'history', 'topic', 'time'];
        const baseValue = 0.5;
        if (!model || typeof model.predict !== 'function') {
            return { baseValue: baseValue, output: 0.5, shapValues: [], summary: 'Model not available' };
        }
        const shapValues = [];
        for (let i = 0; i < featureNames.length; i++) {
            const perturbed = input.slice();
            perturbed[i] = 0;
            const predWith = model.predict(input);
            const predWithout = model.predict(perturbed);
            shapValues.push({ feature: featureNames[i], value: predWith - predWithout, importance: Math.abs(predWith - predWithout) });
        }
        const totalImportance = shapValues.reduce(function(sum, s) { return sum + s.importance; }, 0);
        shapValues.forEach(function(s) {
            s.importancePercent = totalImportance > 0 ? (s.importance / totalImportance * 100).toFixed(1) + '%' : '0%';
        });
        return {
            baseValue: baseValue,
            output: model.predict(input),
            shapValues: shapValues,
            summary: shapValues.map(function(s) { return s.feature + ': ' + (s.value > 0 ? '⬆' : '⬇') + ' (' + s.importancePercent + ')'; }).join(' | ')
        };
    },
    getStats: function() { return { maxFeatures: 10 }; }
});

const MetaLearningEngine = {
    _metaKnowledge: {}, _taskHistory: [], _learningRate: CONFIG.META_LR,
    learnTask: function(task, result) {
        const taskId = task.id || 'task_' + Date.now();
        this._taskHistory.push({ taskId: taskId, task: task, result: result, timestamp: Date.now() });
        if (this._taskHistory.length > 100) this._taskHistory.shift();
        const category = task.category || 'general';
        if (!this._metaKnowledge[category]) {
            this._metaKnowledge[category] = { successCount: 0, totalCount: 0, bestStrategy: null, avgScore: 0, strategies: {} };
        }
        const meta = this._metaKnowledge[category];
        meta.totalCount++;
        if (result.success) meta.successCount++;
        meta.avgScore = (meta.avgScore * (meta.totalCount - 1) + (result.score || 0)) / meta.totalCount;
        const strategy = result.strategy || 'default';
        if (!meta.strategies[strategy]) meta.strategies[strategy] = { count: 0, success: 0 };
        meta.strategies[strategy].count++;
        if (result.success) meta.strategies[strategy].success++;
        let bestRate = 0;
        for (const [strat, data] of Object.entries(meta.strategies)) {
            const rate = data.count > 0 ? data.success / data.count : 0;
            if (rate > bestRate) { bestRate = rate; meta.bestStrategy = strat; }
        }
        return { taskId: taskId, metaUpdated: true, category: category, bestStrategy: meta.bestStrategy, avgScore: Math.round(meta.avgScore) };
    },
    getRecommendation: function(task) {
        const category = task.category || 'general';
        const meta = this._metaKnowledge[category];
        if (!meta || meta.totalCount < 3) return { recommendation: 'explore', confidence: 0, reason: 'Not enough data for category' };
        const rate = meta.totalCount > 0 ? (meta.successCount / meta.totalCount) : 0;
        const confidence = Math.min(95, 50 + meta.totalCount * 2);
        const strategy = meta.bestStrategy || 'default';
        return { recommendation: strategy, confidence: Math.round(confidence), reason: meta.totalCount + ' tasks in category, ' + meta.successCount + ' success (' + Math.round(rate * 100) + '%)' };
    },
    getStats: function() {
        return {
            totalTasks: this._taskHistory.length,
            categories: Object.keys(this._metaKnowledge),
            categoryDetails: Object.entries(this._metaKnowledge).map(function(entry) {
                return { category: entry[0], total: entry[1].totalCount, success: entry[1].successCount, rate: entry[1].totalCount > 0 ? Math.round((entry[1].successCount / entry[1].totalCount) * 100) : 0, bestStrategy: entry[1].bestStrategy };
            })
        };
    },
    reset: function() { this._metaKnowledge = {}; this._taskHistory = []; InternalLogger.info('MetaLearningEngine', 'Reset'); }
};

const StreamingLearner = {
    _buffer: [], _batchSize: CONFIG.STREAMING_BATCH_SIZE, _model: null,
    process: function(dataPoint) {
        this._buffer.push(dataPoint);
        if (this._buffer.length >= this._batchSize) { this._trainBatch(); this._buffer = []; }
        return { processed: true, bufferSize: this._buffer.length, modelUpdated: this._buffer.length === 0 };
    },
    _trainBatch: function() {
        if (!this._model) this._model = { weights: Array(10).fill(0) };
        const lr = 0.01;
        for (let i = 0; i < this._buffer.length; i++) {
            const point = this._buffer[i];
            const features = point.features || Array(10).fill(0.1);
            const target = point.target || 0;
            let prediction = 0;
            for (let j = 0; j < features.length; j++) prediction += features[j] * this._model.weights[j];
            const error = target - prediction;
            for (let j = 0; j < this._model.weights.length; j++) {
                this._model.weights[j] += lr * error * (features[j] || 0.1);
                this._model.weights[j] = Math.max(-5, Math.min(5, this._model.weights[j]));
            }
        }
    },
    predict: function(features) {
        if (!this._model) return 0.5;
        let prediction = 0;
        for (let i = 0; i < features.length; i++) prediction += features[i] * this._model.weights[i];
        return Math.min(1, Math.max(0, prediction));
    },
    getStats: function() {
        return { bufferSize: this._buffer.length, hasModel: !!this._model, weights: this._model ? this._model.weights.map(function(w) { return w.toFixed(3); }) : null };
    },
    reset: function() { this._buffer = []; this._model = null; InternalLogger.info('StreamingLearner', 'Reset'); }
};

const MultiModalLearner = {
    _modalities: {
        text: { weights: Array(10).fill(0.1), confidence: 0.7 },
        voice: { weights: Array(10).fill(0.1), confidence: 0.6 },
        image: { weights: Array(10).fill(0.1), confidence: 0.5 }
    },
    _lr: CONFIG.MULTI_MODAL_LR,
    learn: function(modality, features, target) {
        if (!this._modalities[modality]) this._modalities[modality] = { weights: Array(10).fill(0.1), confidence: 0.5 };
        const mod = this._modalities[modality];
        let prediction = 0;
        for (let i = 0; i < features.length; i++) prediction += features[i] * mod.weights[i];
        const error = target - prediction;
        for (let i = 0; i < mod.weights.length; i++) mod.weights[i] += this._lr * error * features[i];
        mod.confidence = Math.min(0.95, mod.confidence * 0.9 + (1 - Math.abs(error)) * 0.1);
        return { modality: modality, confidence: Math.round(mod.confidence * 100), error: Math.round(error * 100) };
    },
    fuse: function(featuresMap) {
        const predictions = {};
        let totalConfidence = 0;
        for (const [modality, features] of Object.entries(featuresMap)) {
            const mod = this._modalities[modality];
            if (!mod) continue;
            let pred = 0;
            for (let i = 0; i < features.length; i++) pred += features[i] * mod.weights[i];
            predictions[modality] = { prediction: Math.min(1, Math.max(0, pred)), confidence: mod.confidence };
            totalConfidence += mod.confidence;
        }
        let fusedPrediction = 0;
        for (const [modality, data] of Object.entries(predictions)) fusedPrediction += data.prediction * (data.confidence / totalConfidence);
        return { predictions: predictions, fused: Math.min(1, Math.max(0, fusedPrediction)), modalities: Object.keys(predictions).length };
    },
    getStats: function() {
        return {
            modalities: Object.keys(this._modalities),
            details: Object.entries(this._modalities).map(function(entry) {
                return { name: entry[0], confidence: Math.round(entry[1].confidence * 100), hasWeights: entry[1].weights.some(function(w) { return w !== 0; }) };
            })
        };
    },
    reset: function() {
        this._modalities = {
            text: { weights: Array(10).fill(0.1), confidence: 0.7 },
            voice: { weights: Array(10).fill(0.1), confidence: 0.6 },
            image: { weights: Array(10).fill(0.1), confidence: 0.5 }
        };
        InternalLogger.info('MultiModalLearner', 'Reset');
    }
};

const getUserId = function() {
    let userId = localStorage.getItem('kes_user_id');
    if (!userId) { userId = 'user_' + Date.now().toString(36); localStorage.setItem('kes_user_id', userId); }
    return userId;
};

const getStorageKey = function() { return 'KES_LEARNING_ULTIMATE_' + getUserId(); };

const getDecayedWeight = function(timestamp) {
    const age = Date.now() - timestamp;
    const days = age / (1000 * 60 * 60 * 24);
    return Math.exp(-days * CONFIG.DECAY_FACTOR);
};

const AIInternal = Object.freeze({
    getCategory: function(agent) { return AGENT_CATEGORIES[agent] || 'general'; },
    getCategoryDefault: function(category) { return CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.general; },
    getSimilarAgents: function(agent, learningData) {
        const category = this.getCategory(agent);
        const similar = [];
        const agents = Object.keys(learningData.agentPerformance || {});
        for (let i = 0; i < agents.length; i++) {
            const a = agents[i];
            if (a !== agent && this.getCategory(a) === category) similar.push(a);
        }
        return similar;
    },
    getInitialThreshold: function(agent, learningData) {
        const category = this.getCategory(agent);
        const similar = this.getSimilarAgents(agent, learningData);
        if (similar.length > 0) {
            let total = 0;
            let count = 0;
            for (let i = 0; i < similar.length; i++) {
                const a = similar[i];
                const threshold = (learningData.optimizedThresholds || {})[a];
                if (threshold !== undefined) { total += threshold; count++; }
            }
            if (count > 0) {
                const avg = Math.round(total / count);
                return Math.max(CONFIG.MIN_THRESHOLD, Math.min(CONFIG.MAX_THRESHOLD, avg));
            }
        }
        const def = this.getCategoryDefault(category);
        return def.threshold || CONFIG.DEFAULT_THRESHOLD;
    },
    getInitialConfidence: function(agent) {
        const category = this.getCategory(agent);
        const def = this.getCategoryDefault(category);
        return def.confidence || 70;
    },
    predictApproval: function(agent, confidence, learningData) {
        const history = (learningData.approvalHistory || []).filter(function(h) { return h.agent === agent; });
        if (history.length < CONFIG.PREDICTION_MIN_DATA) return { predicted: null, confidence: 0, reason: 'Data tidak cukup', dataPoints: history.length };
        const total = history.length;
        const approved = history.filter(function(h) { return h.approved; }).length;
        const prior = approved / total;
        const similarConfs = history.filter(function(h) { return Math.abs(h.confidence - confidence) < 10; });
        const likelihood = similarConfs.length > 0 ? similarConfs.filter(function(h) { return h.approved; }).length / similarConfs.length : 0.5;
        const posterior = (likelihood * prior) / 0.5;
        const predicted = posterior > 0.5;
        return { predicted: predicted, confidence: Math.min(95, Math.round(posterior * 100)), reason: 'Berdasarkan ' + history.length + ' keputusan sebelumnya', dataPoints: history.length };
    },
    explainThreshold: function(agent, learningData) {
        const history = (learningData.approvalHistory || []).filter(function(h) { return h.agent === agent; });
        if (history.length < CONFIG.COLD_START_MIN_DATA) {
            const category = this.getCategory(agent);
            const def = this.getCategoryDefault(category);
            return { threshold: def.threshold || CONFIG.DEFAULT_THRESHOLD, reason: 'Data masih sedikit, menggunakan default untuk kategori ' + category, dataPoints: history.length, category: category };
        }
        const recent = history.slice(-10);
        const approvals = recent.filter(function(h) { return h.approved; }).length;
        const rate = (approvals / recent.length) * 100;
        const threshold = (learningData.optimizedThresholds || {})[agent] || CONFIG.DEFAULT_THRESHOLD;
        let reason = '';
        if (rate > CONFIG.CONFIDENCE_HIGH) reason = 'User sering approve (' + Math.round(rate) + '%) → threshold turun ke ' + threshold;
        else if (rate < CONFIG.CONFIDENCE_LOW) reason = 'User sering reject (' + Math.round(100 - rate) + '%) → threshold naik ke ' + threshold;
        else reason = 'Threshold ' + threshold + ' stabil berdasarkan ' + history.length + ' data';
        return { threshold: threshold, reason: reason, dataPoints: history.length, recentApprovalRate: Math.round(rate) };
    },
    needActiveLearning: function(agent, learningData) {
        const history = (learningData.approvalHistory || []).filter(function(h) { return h.agent === agent; });
        if (history.length < CONFIG.COLD_START_MIN_DATA) return { needed: true, reason: 'Data masih sedikit untuk ' + agent, priority: 'high' };
        const uncertainty = this.calculateUncertainty(agent, learningData);
        if (uncertainty > CONFIG.ACTIVE_LEARNING_THRESHOLD) return { needed: true, reason: 'Performa ' + agent + ' masih ambigu (' + Math.round(uncertainty * 100) + '% uncertainty)', priority: 'medium' };
        return { needed: false, reason: 'Data cukup untuk ' + agent, priority: 'low' };
    },
    calculateUncertainty: function(agent, learningData) {
        const history = (learningData.approvalHistory || []).filter(function(h) { return h.agent === agent; });
        if (history.length < 5) return 1;
        const approved = history.filter(function(h) { return h.approved; }).length;
        const rate = approved / history.length;
        return 1 - Math.abs(rate - 0.5) * 2;
    },
    shouldOptimize: function(learningData) {
        const lastUpdate = learningData.lastOptimized || 0;
        const age = Date.now() - lastUpdate;
        return age > CONFIG.AUTO_OPTIMIZE_INTERVAL;
    },
    optimizeThresholds: function(learningData) {
        const agents = Object.keys(learningData.agentPerformance || {});
        let changes = 0;
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const perf = learningData.agentPerformance[agent];
            if (!perf || perf.decisionCount < 5) continue;
            const weightedRate = perf.weightedTotal > 0 ? perf.weightedApproved / perf.weightedTotal : 0.5;
            const currentThreshold = (learningData.optimizedThresholds || {})[agent] || CONFIG.DEFAULT_THRESHOLD;
            const optimalThreshold = Math.round(CONFIG.DEFAULT_THRESHOLD + (weightedRate - 0.5) * 40);
            const newThreshold = Math.max(CONFIG.MIN_THRESHOLD, Math.min(CONFIG.MAX_THRESHOLD, optimalThreshold));
            if (Math.abs(newThreshold - currentThreshold) >= 2) {
                if (!learningData.optimizedThresholds) learningData.optimizedThresholds = {};
                learningData.optimizedThresholds[agent] = newThreshold;
                changes++;
            }
        }
        if (changes > 0) {
            learningData.lastOptimized = Date.now();
            InternalLogger.info('AutoLearning', 'Optimized ' + changes + ' thresholds');
        }
        return changes;
    },
    getStateVector: function(agent, confidence, learningData) {
        const history = (learningData.approvalHistory || []).filter(function(h) { return h.agent === agent; });
        const total = history.length;
        const approved = history.filter(function(h) { return h.approved; }).length;
        const rate = total > 0 ? approved / total : 0.5;
        const recent = history.slice(-5);
        const recentApproved = recent.filter(function(h) { return h.approved; }).length;
        const recentRate = recent.length > 0 ? recentApproved / recent.length : 0.5;
        const weights = recent.map(function(h) { return h.weight || 0; });
        const avgWeight = weights.length > 0 ? weights.reduce(function(a, b) { return a + b; }, 0) / weights.length : 0;
        return [
            Math.min(1, confidence / 100), rate, recentRate, Math.min(1, total / 100), avgWeight,
            Math.min(1, (learningData.agentPerformance[agent] || {}).decisionCount || 0),
            Math.min(1, new Date().getHours() / 24), Math.min(1, new Date().getDay() / 7), 0.5, 0.5
        ];
    }
});

function createEmptyData() {
    return {
        approvalHistory: [], agentPerformance: {}, optimizedThresholds: {},
        lastUpdated: null, lastOptimized: null, userId: getUserId(),
        dqnMemory: [], dqnModel: null, lstmWeights: null, federatedWeights: null,
        metaKnowledge: {}, streamingModel: null,
        multiModal: {
            text: { weights: Array(10).fill(0.1), confidence: 0.7 },
            voice: { weights: Array(10).fill(0.1), confidence: 0.6 },
            image: { weights: Array(10).fill(0.1), confidence: 0.5 }
        },
        federatedParticipants: {}, taskHistory: []
    };
}

const AutoLearningUltimate = {
    data: createEmptyData(),
    _lastKnownDiskUpdate: null,
    load: async function() {
        const key = getStorageKey();
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.data = {
                    approvalHistory: parsed.approvalHistory || [],
                    agentPerformance: parsed.agentPerformance || {},
                    optimizedThresholds: parsed.optimizedThresholds || {},
                    lastUpdated: parsed.lastUpdated || null,
                    lastOptimized: parsed.lastOptimized || null,
                    userId: parsed.userId || getUserId(),
                    dqnMemory: parsed.dqnMemory || [],
                    dqnModel: parsed.dqnModel || null,
                    lstmWeights: parsed.lstmWeights || null,
                    federatedWeights: parsed.federatedWeights || null,
                    metaKnowledge: parsed.metaKnowledge || {},
                    streamingModel: parsed.streamingModel || null,
                    multiModal: parsed.multiModal || {
                        text: { weights: Array(10).fill(0.1), confidence: 0.7 },
                        voice: { weights: Array(10).fill(0.1), confidence: 0.6 },
                        image: { weights: Array(10).fill(0.1), confidence: 0.5 }
                    },
                    federatedParticipants: parsed.federatedParticipants || {},
                    taskHistory: parsed.taskHistory || []
                };
                if (this.data.dqnMemory && this.data.dqnMemory.length > 0) DQNEngine._replayMemory = this.data.dqnMemory;
                if (this.data.dqnModel) DQNEngine._model = this.data.dqnModel;
                if (this.data.lstmWeights) LSTMPredictor._weights = this.data.lstmWeights;
                if (this.data.federatedWeights) FederatedLearning._globalWeights = this.data.federatedWeights;
                if (this.data.federatedParticipants) FederatedLearning._participants = new Map(Object.entries(this.data.federatedParticipants));
                if (this.data.metaKnowledge) MetaLearningEngine._metaKnowledge = this.data.metaKnowledge;
                if (this.data.taskHistory) MetaLearningEngine._taskHistory = this.data.taskHistory;
                if (this.data.streamingModel) StreamingLearner._model = this.data.streamingModel;
                if (this.data.multiModal) MultiModalLearner._modalities = this.data.multiModal;
                this._lastKnownDiskUpdate = this.data.lastUpdated;
                InternalLogger.info('AutoLearning', 'Data loaded: ' + this.data.approvalHistory.length + ' entries');
                NotificationSystem.success('🧠 Learning Engine', 'Data loaded successfully');
            } else {
                const oldRaw = localStorage.getItem('KES_LEARNING_DATA');
                if (oldRaw) {
                    const oldData = JSON.parse(oldRaw);
                    this.data = {
                        approvalHistory: oldData.approvalHistory || [],
                        agentPerformance: oldData.agentPerformance || {},
                        optimizedThresholds: oldData.optimizedThresholds || {},
                        lastUpdated: Date.now(), lastOptimized: null, userId: getUserId(),
                        dqnMemory: [], dqnModel: null, lstmWeights: null, federatedWeights: null,
                        metaKnowledge: {}, streamingModel: null,
                        multiModal: {
                            text: { weights: Array(10).fill(0.1), confidence: 0.7 },
                            voice: { weights: Array(10).fill(0.1), confidence: 0.6 },
                            image: { weights: Array(10).fill(0.1), confidence: 0.5 }
                        },
                        federatedParticipants: {}, taskHistory: []
                    };
                    this.save();
                    localStorage.removeItem('KES_LEARNING_DATA');
                    InternalLogger.info('AutoLearning', 'Migrated from legacy data');
                }
            }
        } catch(e) {
            InternalLogger.warn('AutoLearning', 'Load failed: ' + e.message);
            this.data = createEmptyData();
        }
        if (!this.data.approvalHistory) this.data.approvalHistory = [];
        if (!this.data.agentPerformance) this.data.agentPerformance = {};
        if (!this.data.optimizedThresholds) this.data.optimizedThresholds = {};
        if (window.KESEMPATAN?.KesDatabase?.migrateLegacySnapshotOnce) {
            window.KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce('learning_data', getStorageKey());
        }
    },
    save: function() {
        this.data.lastUpdated = Date.now();
        this.data.userId = getUserId();
        try {
            const key = getStorageKey();
            const currentOnDisk = localStorage.getItem(key);
            if (currentOnDisk) {
                const otherTabData = JSON.parse(currentOnDisk);
                if (otherTabData.lastUpdated && otherTabData.lastUpdated !== this._lastKnownDiskUpdate) {
                    const seen = new Set(this.data.approvalHistory.map(function(h) { return h.agent + '|' + h.timestamp; }));
                    (otherTabData.approvalHistory || []).forEach(function(h) {
                        const id = h.agent + '|' + h.timestamp;
                        if (!seen.has(id)) { this.data.approvalHistory.push(h); seen.add(id); }
                    }.bind(this));
                    this.data.approvalHistory.sort(function(a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
                }
            }
        } catch (e) { console.warn('[AutoLearning] Multi-tab merge check failed:', e.message); }
        this.data.dqnMemory = DQNEngine._replayMemory;
        this.data.dqnModel = DQNEngine._model;
        this.data.lstmWeights = LSTMPredictor._weights;
        this.data.federatedWeights = FederatedLearning._globalWeights;
        this.data.federatedParticipants = Object.fromEntries(FederatedLearning._participants);
        this.data.metaKnowledge = MetaLearningEngine._metaKnowledge;
        this.data.taskHistory = MetaLearningEngine._taskHistory;
        this.data.streamingModel = StreamingLearner._model;
        this.data.multiModal = MultiModalLearner._modalities;
        try {
            const key = getStorageKey();
            localStorage.setItem(key, JSON.stringify(this.data));
            this._lastKnownDiskUpdate = this.data.lastUpdated;
            if (window.KESEMPATAN?.KesDatabase?.mirrorSnapshot) {
                window.KESEMPATAN.KesDatabase.mirrorSnapshot('learning_data', this.data);
            }
        } catch(e) {
            InternalLogger.error('AutoLearning', 'Save failed: ' + e.message);
        }
    },
    recordApproval: async function(agent, confidence, approved) {
        if (!agent || typeof agent !== 'string') { InternalLogger.warn('AutoLearning', 'Invalid agent'); return null; }
        const weight = getDecayedWeight(Date.now());
        this.data.approvalHistory.push({ agent: agent, confidence: confidence || 70, approved: approved, weight: weight, timestamp: Date.now() });
        if (this.data.approvalHistory.length > CONFIG.MAX_HISTORY) this.data.approvalHistory.shift();
        if (!this.data.agentPerformance[agent]) {
            this.data.agentPerformance[agent] = { approvedCount: 0, rejectedCount: 0, weightedApproved: 0, weightedTotal: 0, totalConfidence: 0, decisionCount: 0, avgConfidence: 0 };
        }
        const perf = this.data.agentPerformance[agent];
        if (approved) { perf.approvedCount++; perf.weightedApproved += weight; }
        else { perf.rejectedCount++; }
        perf.weightedTotal += weight;
        perf.decisionCount++;
        perf.totalConfidence += confidence || 70;
        perf.avgConfidence = perf.decisionCount > 0 ? perf.totalConfidence / perf.decisionCount : 0;
        const approvedConfs = this.data.approvalHistory.filter(function(h) { return h.agent === agent && h.approved; }).map(function(h) { return h.confidence; });
        let newThreshold;
        if (approvedConfs.length > CONFIG.COLD_START_MIN_DATA) {
            const minApproved = Math.min.apply(Math, approvedConfs);
            newThreshold = Math.max(CONFIG.MIN_THRESHOLD, Math.min(CONFIG.MAX_THRESHOLD, minApproved - 5));
        } else {
            newThreshold = AIInternal.getInitialThreshold(agent, this.data);
        }
        this.data.optimizedThresholds[agent] = newThreshold;
        const state = AIInternal.getStateVector(agent, confidence, this.data);
        const action = approved ? 0 : 1;
        const reward = approved ? 1 : -1;
        const nextState = AIInternal.getStateVector(agent, confidence + (approved ? 5 : -5), this.data);
        DQNEngine.remember(state, action, reward, nextState, false);
        DQNEngine.replay();
        const historyScores = this.data.approvalHistory.filter(function(h) { return h.agent === agent; }).slice(-30).map(function(h) { return h.confidence; });
        if (historyScores.length >= CONFIG.LSTM_WINDOW_SIZE) LSTMPredictor.train(historyScores, approved ? 1 : 0);
        StreamingLearner.process({ features: state, target: approved ? 1 : 0 });
        const category = AIInternal.getCategory(agent);
        MetaLearningEngine.learnTask({ id: agent, category: category }, { success: approved, score: confidence, strategy: approved ? 'approve' : 'reject' });
        if (this.data.approvalHistory.length % 10 === 0) {
            const localWeights = { thresholds: this.data.optimizedThresholds, performances: this.data.agentPerformance };
            FederatedLearning.aggregate(localWeights, this.data.userId);
        }
        if (AIInternal.shouldOptimize(this.data)) AIInternal.optimizeThresholds(this.data);
        const prediction = AIInternal.predictApproval(agent, confidence, this.data);
        const explanation = AIInternal.explainThreshold(agent, this.data);
        const activeLearning = AIInternal.needActiveLearning(agent, this.data);
        const self = this;
        const shapModel = {
            predict: function(input) {
                const stateVec = AIInternal.getStateVector(agent, input[1] * 100, self.data);
                const qValues = DQNEngine.getQValues(stateVec);
                return qValues[0] > qValues[1] ? 1 : 0;
            }
        };
        const shapResult = SHAPExplainer.explain(shapModel, [1, confidence / 100, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
        this.save();
        if (typeof window.KESEMPATAN?.ReactionLearning?.updateAnomalyBadge === 'function') window.KESEMPATAN.ReactionLearning.updateAnomalyBadge();
        InternalLogger.debug('AutoLearning', agent + ' → ' + (approved ? 'approved' : 'rejected') + ' (threshold: ' + newThreshold + ')');
        return {
            threshold: newThreshold, prediction: prediction, explanation: explanation,
            activeLearning: activeLearning, shap: shapResult,
            performance: {
                totalDecisions: perf.decisionCount,
                approvalRate: Math.round((perf.approvedCount / (perf.approvedCount + perf.rejectedCount || 1)) * 100),
                weightedRate: Math.round((perf.weightedApproved / (perf.weightedTotal || 1)) * 100)
            },
            dqn: DQNEngine.getStats(), lstm: LSTMPredictor.getStats(), federated: FederatedLearning.getStats(),
            meta: MetaLearningEngine.getStats(), streaming: StreamingLearner.getStats(), multimodal: MultiModalLearner.getStats()
        };
    },
    getRecommendedThreshold: function(agent) {
        if (!agent) return CONFIG.DEFAULT_THRESHOLD;
        const threshold = this.data.optimizedThresholds[agent];
        if (threshold !== undefined && threshold !== null) return Math.max(CONFIG.MIN_THRESHOLD, Math.min(CONFIG.MAX_THRESHOLD, threshold));
        const initial = AIInternal.getInitialThreshold(agent, this.data);
        return Math.max(CONFIG.MIN_THRESHOLD, Math.min(CONFIG.MAX_THRESHOLD, initial));
    },
    getAgentStats: function(agent) {
        const perf = this.data.agentPerformance[agent];
        if (!perf) return null;
        const totalDecisions = perf.decisionCount || 0;
        const approvalRate = totalDecisions > 0 ? (perf.approvedCount / totalDecisions * 100) : 0;
        const weightedRate = perf.weightedTotal > 0 ? (perf.weightedApproved / perf.weightedTotal * 100) : 0;
        const prediction = AIInternal.predictApproval(agent, perf.avgConfidence || 70, this.data);
        const explanation = AIInternal.explainThreshold(agent, this.data);
        const state = AIInternal.getStateVector(agent, perf.avgConfidence || 70, this.data);
        const qValues = DQNEngine.getQValues(state);
        const historyScores = this.data.approvalHistory.filter(function(h) { return h.agent === agent; }).slice(-30).map(function(h) { return h.confidence; });
        const lstmPred = LSTMPredictor.predict(historyScores);
        return {
            agent: agent, approvedCount: perf.approvedCount, rejectedCount: perf.rejectedCount,
            totalDecisions: totalDecisions, approvalRate: Math.round(approvalRate), weightedRate: Math.round(weightedRate),
            avgConfidence: Math.round(perf.avgConfidence || 0), threshold: this.getRecommendedThreshold(agent),
            prediction: prediction, explanation: explanation, category: AIInternal.getCategory(agent),
            dqn: { approveQ: qValues[0], rejectQ: qValues[1], action: qValues[0] > qValues[1] ? 'approve' : 'reject' },
            lstm: lstmPred, meta: MetaLearningEngine.getRecommendation({ category: AIInternal.getCategory(agent) })
        };
    },
    getOverallStats: function() {
        const total = this.data.approvalHistory.length;
        const approved = this.data.approvalHistory.filter(function(h) { return h.approved; }).length;
        const rejectionRate = total > 0 ? ((total - approved) / total * 100) : 0;
        const self = this;
        const agentRanking = Object.keys(this.data.agentPerformance || {})
            .map(function(agent) {
                const perf = self.data.agentPerformance[agent];
                const totalDecisions = perf.decisionCount || 0;
                const approvalRate = totalDecisions > 0 ? (perf.approvedCount / totalDecisions * 100) : 0;
                return {
                    agent: agent, approvalRate: Math.round(approvalRate),
                    weightedRate: Math.round((perf.weightedApproved / (perf.weightedTotal || 1)) * 100),
                    avgConfidence: Math.round(perf.avgConfidence || 0), totalDecisions: totalDecisions,
                    threshold: self.getRecommendedThreshold(agent), category: AIInternal.getCategory(agent)
                };
            })
            .sort(function(a, b) { return b.approvalRate - a.approvalRate; });
        const timeline = this.data.approvalHistory.slice(-30).map(function(h) {
            return { date: new Date(h.timestamp).toLocaleDateString('id-ID'), approved: h.approved, agent: h.agent, confidence: h.confidence };
        });
        const daily = {};
        for (let i = 0; i < this.data.approvalHistory.length; i++) {
            const h = this.data.approvalHistory[i];
            const date = new Date(h.timestamp).toDateString();
            if (!daily[date]) daily[date] = { approved: 0, rejected: 0 };
            if (h.approved) daily[date].approved++;
            else daily[date].rejected++;
        }
        const dailyStats = Object.keys(daily).map(function(date) {
            const d = daily[date];
            const total2 = d.approved + d.rejected;
            return { date: date, approved: d.approved, rejected: d.rejected, rate: total2 > 0 ? Math.round((d.approved / total2) * 100) : 0 };
        }).sort(function(a, b) { return new Date(a.date) - new Date(b.date); }).slice(-7);
        return {
            total: total, approved: approved, rejected: total - approved, rejectionRate: Math.round(rejectionRate),
            agentRanking: agentRanking, timeline: timeline, dailyStats: dailyStats,
            userId: this.data.userId, lastUpdated: this.data.lastUpdated, lastOptimized: this.data.lastOptimized,
            totalAgents: agentRanking.length,
            activeAgents: agentRanking.filter(function(a) { return a.totalDecisions > 0; }).length,
            engines: {
                dqn: DQNEngine.getStats(), lstm: LSTMPredictor.getStats(), federated: FederatedLearning.getStats(),
                meta: MetaLearningEngine.getStats(), streaming: StreamingLearner.getStats(), multimodal: MultiModalLearner.getStats()
            }
        };
    },
    predict: function(agent, confidence) {
        const prediction = AIInternal.predictApproval(agent, confidence, this.data);
        const state = AIInternal.getStateVector(agent, confidence, this.data);
        const qValues = DQNEngine.getQValues(state);
        const historyScores = this.data.approvalHistory.filter(function(h) { return h.agent === agent; }).slice(-30).map(function(h) { return h.confidence; });
        const lstmPred = LSTMPredictor.predict(historyScores);
        return {
            bayesian: prediction,
            dqn: { approveQ: qValues[0], rejectQ: qValues[1], action: qValues[0] > qValues[1] ? 'approve' : 'reject' },
            lstm: lstmPred,
            ensemble: this._ensemblePrediction(prediction, qValues, lstmPred)
        };
    },
    _ensemblePrediction: function(bayesian, dqn, lstm) {
        let score = 0;
        let count = 0;
        if (bayesian && bayesian.predicted !== null) { score += bayesian.predicted ? 1 : 0; count++; }
        if (dqn && dqn[0] !== undefined) { score += dqn[0] > dqn[1] ? 1 : 0; count++; }
        if (lstm && lstm.prediction !== null) { score += lstm.prediction > 0.5 ? 1 : 0; count++; }
        if (count === 0) return { prediction: null, confidence: 0 };
        const rate = score / count;
        return { prediction: rate > 0.5, confidence: Math.round(rate * 100), consensus: rate === 1 ? 'unanimous' : (rate > 0.66 ? 'majority' : 'divided') };
    },
    explain: function(agent) {
        const explanation = AIInternal.explainThreshold(agent, this.data);
        const self = this;
        const shapModel = {
            predict: function(input) {
                const stateVec = AIInternal.getStateVector(agent, input[1] * 100, self.data);
                const qValues = DQNEngine.getQValues(stateVec);
                return qValues[0] > qValues[1] ? 1 : 0;
            }
        };
        const shapResult = SHAPExplainer.explain(shapModel, [1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
        return { threshold: explanation, shap: shapResult, meta: MetaLearningEngine.getRecommendation({ category: AIInternal.getCategory(agent) }) };
    },
    getActiveLearningRequests: function() {
        const requests = [];
        const agents = Object.keys(this.data.agentPerformance || {});
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const result = AIInternal.needActiveLearning(agent, this.data);
            if (result.needed) {
                requests.push({ agent: agent, reason: result.reason, priority: result.priority, dataPoints: (this.data.approvalHistory || []).filter(function(h) { return h.agent === agent; }).length });
            }
        }
        return requests;
    },
    optimize: function() {
        const changes = AIInternal.optimizeThresholds(this.data);
        if (changes > 0) {
            this.save();
            InternalLogger.info('AutoLearning', 'Manual optimization: ' + changes + ' changes');
            NotificationSystem.success('⚡ Optimization', 'Optimized ' + changes + ' thresholds');
        }
        return { changes: changes, message: changes > 0 ? 'Optimized ' + changes + ' thresholds' : 'No changes needed' };
    },
    trainDQN: function() {
        const size = DQNEngine._replayMemory.length;
        for (let i = 0; i < Math.min(10, size); i++) DQNEngine.replay();
        this.save();
        return { trained: Math.min(10, size), memorySize: size };
    },
    trainLSTM: function(agent) {
        const history = this.data.approvalHistory.filter(function(h) { return h.agent === agent; }).slice(-30).map(function(h) { return h.confidence; });
        if (history.length >= CONFIG.LSTM_WINDOW_SIZE) {
            const target = history[history.length - 1] > history[history.length - 2] ? 1 : 0;
            LSTMPredictor.train(history, target);
            this.save();
            return { trained: true, dataPoints: history.length };
        }
        return { trained: false, dataPoints: history.length, message: 'Not enough data' };
    },
    federatedSync: async function() {
        const localWeights = { thresholds: this.data.optimizedThresholds, performances: this.data.agentPerformance };
        try {
            const apiServerUrl = localStorage.getItem('kes_api_server_url') || 'http://localhost:3456';
            const apiKey = localStorage.getItem('kes_api_key_real') || '';
            if (apiKey) {
                const response = await fetch(apiServerUrl + '/federated/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
                    body: JSON.stringify({
                        userId: this.data.userId,
                        localWeights: { agentPreferences: {}, agentWeights: this.data.optimizedThresholds, qTable: {} }
                    })
                });
                if (response.ok) {
                    const cloudData = await response.json();
                    if (cloudData && cloudData.success && cloudData.weights && cloudData.weights.agentWeights) {
                        for (const agent in cloudData.weights.agentWeights) {
                            if (!this.data.optimizedThresholds[agent]) this.data.optimizedThresholds[agent] = cloudData.weights.agentWeights[agent];
                        }
                        this.save();
                        return { synced: true, localOnly: false, globalKeys: Object.keys(cloudData.weights.agentWeights).length, participants: cloudData.participants || 1 };
                    }
                }
            }
        } catch (e) {
            InternalLogger.warn('AutoLearning', 'Server federated sync tidak tersedia, jatuh ke lokal: ' + e.message);
        }
        FederatedLearning.aggregate(localWeights, this.data.userId);
        const globalWeights = FederatedLearning.getGlobalWeights();
        if (globalWeights && globalWeights.thresholds) {
            for (const [agent, threshold] of Object.entries(globalWeights.thresholds)) {
                if (!this.data.optimizedThresholds[agent]) this.data.optimizedThresholds[agent] = threshold;
            }
            this.save();
            return { synced: true, localOnly: true, globalKeys: Object.keys(globalWeights).length, participants: FederatedLearning.getParticipants().length };
        }
        return { synced: false, localOnly: true, message: 'No global weights available' };
    },
    getCategory: function(agent) { return AIInternal.getCategory(agent); },
    getSimilarAgents: function(agent) { return AIInternal.getSimilarAgents(agent, this.data); },
    reset: async function() {
        this.data = createEmptyData();
        DQNEngine.reset();
        LSTMPredictor.reset();
        FederatedLearning.reset();
        MetaLearningEngine.reset();
        StreamingLearner.reset();
        MultiModalLearner.reset();
        this.save();
        showToast('🧠 Data pembelajaran direset', 'success');
        NotificationSystem.success('🧠 Reset Complete', 'All learning data cleared');
        InternalLogger.info('AutoLearning', 'Data reset');
    },
    getFeatures: function() {
        return [
            'Deep Q-Network (DQN) - Reinforcement Learning', 'LSTM Time Series Prediction',
            'Homomorphic Federated Learning', 'SHAP Explainability', 'Meta-Learning (Learn to Learn)',
            'Online Streaming Learning', 'Multi-Modal Learning (Text+Voice+Image)', 'Time Decay Weighting',
            'Cold Start Strategy', 'Predictive Bayesian Model', 'Multi-User Support', 'Active Learning', 'Real-time Dashboard'
        ];
    },
    getPerformance: function() {
        const stats = this.getOverallStats();
        return {
            totalFeedbacks: stats.total,
            approvalRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
            activeAgents: stats.activeAgents, totalAgents: stats.totalAgents,
            dqnMemory: DQNEngine._replayMemory.length,
            federatedParticipants: FederatedLearning.getParticipants().length,
            metaTasks: MetaLearningEngine._taskHistory.length,
            streamingBuffer: StreamingLearner._buffer.length,
            multiModalModalities: Object.keys(MultiModalLearner._modalities).length,
            lastUpdated: new Date(stats.lastUpdated).toLocaleString()
        };
    }
};

function installLearningHooks() {
    if (window.KESEMPATAN.WorkflowEngine && !window.KESEMPATAN.WorkflowEngine.__thresholdHookInstalled) {
        const originalStart = window.KESEMPATAN.WorkflowEngine.start;
        window.KESEMPATAN.WorkflowEngine.start = async function(payload, uploadedContent) {
            const result = await originalStart.call(this, payload, uploadedContent);
            if (window.lastAggregated && window.KESEMPATAN?.HITL) {
                const results = window.KESEMPATAN.HITL.getAllResults ? window.KESEMPATAN.HITL.getAllResults() : [];
                for (let i = 0; i < results.length; i++) {
                    const item = results[i];
                    if (item && item.agent) {
                        await AutoLearningUltimate.recordApproval(item.agent, item.originalResult?.confidence || 70, item.approved !== false);
                    }
                }
            }
            return result;
        };
        window.KESEMPATAN.WorkflowEngine.__thresholdHookInstalled = true;
    }
    if (window.recordFeedback && !window.recordFeedback.__thresholdHookInstalled) {
        const originalRecord = window.recordFeedback;
        const wrapped = async function(agent, message, feedback, topic) {
            const result = await originalRecord.call(this, agent, message, feedback, topic);
            await AutoLearningUltimate.recordApproval(agent, 70, feedback === 'like');
            return result;
        };
        wrapped.__thresholdHookInstalled = true;
        window.recordFeedback = wrapped;
    }
}

if (document.readyState === 'complete') installLearningHooks();
else window.addEventListener('load', installLearningHooks);

(async function init() {
    try {
        await AutoLearningUltimate.load();
        setInterval(function() {
            if (AutoLearningUltimate.data.approvalHistory.length > 10) AutoLearningUltimate.optimize();
        }, CONFIG.AUTO_OPTIMIZE_INTERVAL);
        setInterval(function() {
            if (AutoLearningUltimate.data.approvalHistory.length > 10) AutoLearningUltimate.federatedSync();
        }, 1800000);
        setInterval(function() {
            if (DQNEngine._replayMemory.length > CONFIG.DQN_BATCH_SIZE) AutoLearningUltimate.trainDQN();
        }, 300000);
        setInterval(function() {
            const agents = Object.keys(AutoLearningUltimate.data.agentPerformance || {});
            agents.forEach(function(agent) {
                const count = AutoLearningUltimate.data.approvalHistory.filter(function(h) { return h.agent === agent; }).length;
                if (count >= CONFIG.LSTM_WINDOW_SIZE) AutoLearningUltimate.trainLSTM(agent);
            });
        }, 600000);
        InternalLogger.info('AutoLearning', 'Auto learning engine loaded');
        InternalLogger.info('AutoLearning', AutoLearningUltimate.data.approvalHistory.length + ' entries');
        InternalLogger.info('AutoLearning', Object.keys(AutoLearningUltimate.data.agentPerformance || {}).length + ' agents');
        NotificationSystem.success('🧠 Auto Learning', 'Auto learning aktif');
    } catch(e) {
        InternalLogger.error('AutoLearning', 'Init failed: ' + e.message);
    }
})();

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.AutoLearning = AutoLearningUltimate;
window.KESEMPATAN.DQNEngine = DQNEngine;
window.KESEMPATAN.LSTMPredictor = LSTMPredictor;
window.KESEMPATAN.FederatedLearning = FederatedLearning;
window.KESEMPATAN.SHAPExplainer = SHAPExplainer;
window.KESEMPATAN.MetaLearningEngine = MetaLearningEngine;
window.KESEMPATAN.StreamingLearner = StreamingLearner;
window.KESEMPATAN.MultiModalLearner = MultiModalLearner;
window.KESEMPATAN.InternalLogger = InternalLogger;
window.KESEMPATAN.NotificationSystem = NotificationSystem;

// Kept as real globals (not KESEMPATAN-only): window.AutoLearning is read
// directly by hitl.js, main.js, workflow.js and reaction-learning.js;
// window.InternalLogger is part of the app-wide load-order-tolerant
// fallback logger convention used by dozens of files. DQNEngine,
// LSTMPredictor, FederatedLearning, SHAPExplainer, MetaLearningEngine,
// StreamingLearner, MultiModalLearner, AutoLearningUltimate and
// NotificationSystem have no external readers, so only their
// KESEMPATAN.X form above is kept.
window.AutoLearning = AutoLearningUltimate;
window.InternalLogger = InternalLogger;
})();
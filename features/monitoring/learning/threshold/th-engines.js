import { CONFIG } from './th-config.js';
import { InternalLogger } from './th-logger.js';

export const DQNEngine = {
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

export const LSTMPredictor = {
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

export const FederatedLearning = {
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

export const SHAPExplainer = Object.freeze({
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

export const MetaLearningEngine = {
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

export const StreamingLearner = {
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

export const MultiModalLearner = {
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

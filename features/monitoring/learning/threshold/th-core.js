import { CONFIG } from './th-config.js';
import { InternalLogger, NotificationSystem, showToast } from './th-logger.js';
import { DQNEngine, LSTMPredictor, FederatedLearning, SHAPExplainer, MetaLearningEngine, StreamingLearner, MultiModalLearner } from './th-engines.js';
import { getUserId, getStorageKey, getDecayedWeight, AIInternal } from './th-ai-internal.js';

export function createEmptyData() {
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

export const AutoLearningUltimate = {
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

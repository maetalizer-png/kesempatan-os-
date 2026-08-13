import { CONFIG, AGENT_CATEGORIES, CATEGORY_DEFAULTS } from './th-config.js';
import { InternalLogger } from './th-logger.js';

export const getUserId = function() {
    let userId = localStorage.getItem('kes_user_id');
    if (!userId) { userId = 'user_' + Date.now().toString(36); localStorage.setItem('kes_user_id', userId); }
    return userId;
};

export const getStorageKey = function() { return 'KES_LEARNING_ULTIMATE_' + getUserId(); };

export const getDecayedWeight = function(timestamp) {
    const age = Date.now() - timestamp;
    const days = age / (1000 * 60 * 60 * 24);
    return Math.exp(-days * CONFIG.DECAY_FACTOR);
};

export const AIInternal = Object.freeze({
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

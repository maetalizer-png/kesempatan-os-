(function() {
"use strict";

if (window.__AIFeedbackLoadedV4) return;
window.__AIFeedbackLoadedV4 = true;
window.__AIFeedbackLoaded = true;

const InternalLogger = Object.freeze({
    _logs: [],
    _maxLogs: 500,
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

const CONFIG = Object.freeze({
    STORAGE_KEY: 'kes_rl_learning_v4',
    MAX_HISTORY: 2000,
    MIN_LIKES_FOR_STYLE: 5,
    DECAY_FACTOR: 0.95,
    CONFIDENCE_LIKE: 80,
    CONFIDENCE_DISLIKE: 40,
    MAX_FEEDBACK_PER_AGENT: 100,
    ANOMALY_THRESHOLD: 0.5,
    PREDICTION_MIN_DATA: 5,
    FEDERATED_LEARNING_ENABLED: true,
    WEBSOCKET_ENABLED: false,
    CHART_ENABLED: true,
    SYNC_INTERVAL: 3600000,
    BATCH_SIZE: 10,
    CACHE_TTL: 30000,
    Q_LEARNING_RATE: 0.1,
    Q_DISCOUNT_FACTOR: 0.9,
    Q_EXPLORATION_RATE: 0.1,
    AUTO_SYNC_INTERVAL: 5000,
    ENCRYPTION_ENABLED: true
});

const RLCache = Object.freeze({
    _cache: new Map(),
    _maxSize: 1000,
    get: function(key) {
        const item = this._cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this._cache.delete(key);
            return null;
        }
        return item.value;
    },
    set: function(key, value, ttl) {
        ttl = ttl || CONFIG.CACHE_TTL;
        if (this._cache.size >= this._maxSize) {
            const firstKey = this._cache.keys().next().value;
            this._cache.delete(firstKey);
        }
        this._cache.set(key, { value: value, expiry: Date.now() + ttl });
    },
    clear: function() { this._cache.clear(); },
    getSize: function() { return this._cache.size; }
});

const MAX_Q_ENTRIES = 2000;

const QLearningEngine = {
    _qTable: {},
    _qTableTimestamps: {},
    _learningRate: CONFIG.Q_LEARNING_RATE,
    _discountFactor: CONFIG.Q_DISCOUNT_FACTOR,
    _explorationRate: CONFIG.Q_EXPLORATION_RATE,
    getQ: function(state, action) {
        const key = state + '|' + action;
        return this._qTable[key] || 0;
    },
    updateQ: function(state, action, reward, nextState) {
        const currentQ = this.getQ(state, action);
        const key = state + '|' + action;
        let maxNextQ = 0;
        if (nextState && nextState !== state) {
            const nextKeyPrefix = nextState + '|';
            for (const k in this._qTable) {
                if (k.startsWith(nextKeyPrefix)) {
                    if (this._qTable[k] > maxNextQ) maxNextQ = this._qTable[k];
                }
            }
        }
        const newQ = currentQ + this._learningRate * (reward + this._discountFactor * maxNextQ - currentQ);
        this._qTable[key] = newQ;
        this._qTableTimestamps[key] = Date.now();
        if (Object.keys(this._qTable).length > MAX_Q_ENTRIES) this.prune();
        return newQ;
    },
    prune: function() {
        const keys = Object.keys(this._qTable);
        const excess = keys.length - MAX_Q_ENTRIES;
        if (excess <= 0) return 0;
        const sorted = keys.sort(function(a, b) {
            return (this._qTableTimestamps[a] || 0) - (this._qTableTimestamps[b] || 0);
        }.bind(this));
        for (let i = 0; i < excess; i++) {
            delete this._qTable[sorted[i]];
            delete this._qTableTimestamps[sorted[i]];
        }
        return excess;
    },
    chooseAction: function(state, actions) {
        if (Math.random() < this._explorationRate) {
            return actions[Math.floor(Math.random() * actions.length)];
        }
        let bestAction = actions[0];
        let bestQ = -Infinity;
        for (const action of actions) {
            const q = this.getQ(state, action);
            if (q > bestQ) {
                bestQ = q;
                bestAction = action;
            }
        }
        return bestAction;
    },
    getStats: function() {
        return {
            totalStates: Object.keys(this._qTable).length,
            learningRate: this._learningRate,
            discountFactor: this._discountFactor,
            explorationRate: this._explorationRate
        };
    },
    exportTable: function() { return JSON.stringify(this._qTable); },
    importTable: function(data) {
        try {
            this._qTable = JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }
};

let learningData = {
    agentPreferences: {},
    feedbackHistory: [],
    topicPreferences: {},
    agentWeights: {},
    lastUpdated: null,
    cloudSyncedAt: null,
    qTable: {}
};
let isInitialized = false;
let memoryEnabled = false;
let chartInstances = {};
let syncInterval = null;
let ws = null;
let feedbackQueue = [];
let feedbackTimer = null;
let realtimeInterval = null;
let autoSyncInterval = null;

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getDateString(timestamp) { return new Date(timestamp).toDateString(); }
function generateId() { return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8); }
function getHour(timestamp) { return new Date(timestamp).getHours(); }
function getDay(timestamp) { return new Date(timestamp).getDay(); }

function getUserId() {
    try {
        let userId = localStorage.getItem('kes_user_id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36);
            localStorage.setItem('kes_user_id', userId);
        }
        return userId;
    } catch (e) {
        return 'anonymous_' + Date.now().toString(36);
    }
}

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password || 'default_key'), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptData(data, password) {
    if (!CONFIG.ENCRYPTION_ENABLED) return data;
    try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(password, salt);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, dataBuffer);
        const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
        return btoa(String.fromCharCode.apply(null, combined));
    } catch (e) {
        InternalLogger.error('AI Feedback', 'Encrypt failed: ' + e.message);
        return data;
    }
}

async function decryptData(encrypted, password) {
    if (!CONFIG.ENCRYPTION_ENABLED) return encrypted;
    try {
        const combined = atob(encrypted);
        const combinedBytes = new Uint8Array(combined.length);
        for (let i = 0; i < combined.length; i++) combinedBytes[i] = combined.charCodeAt(i);
        const salt = combinedBytes.slice(0, 16);
        const iv = combinedBytes.slice(16, 28);
        const ciphertext = combinedBytes.slice(28);
        const key = await deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ciphertext);
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
        InternalLogger.warn('AI Feedback', 'Decrypt failed: ' + e.message);
        return null;
    }
}

function showToast(message, type) {
    type = type || 'info';
    try {
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
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
    } catch(e) {}
}

function loadLearningData() {
    try {
        if (typeof localStorage === 'undefined') return false;
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            learningData = {
                agentPreferences: parsed.agentPreferences || {},
                feedbackHistory: parsed.feedbackHistory || [],
                topicPreferences: parsed.topicPreferences || {},
                agentWeights: parsed.agentWeights || {},
                lastUpdated: parsed.lastUpdated || null,
                cloudSyncedAt: parsed.cloudSyncedAt || null,
                qTable: parsed.qTable || {}
            };
            if (learningData.qTable) QLearningEngine._qTable = learningData.qTable;
            InternalLogger.info('AI Feedback', 'Data loaded: ' + learningData.feedbackHistory.length + ' feedbacks');
            return true;
        }
    } catch (error) {
        InternalLogger.warn('AI Feedback', 'Failed to load data: ' + error.message);
    }
    return false;
}

function saveLearningData() {
    try {
        if (typeof localStorage === 'undefined') return false;
        learningData.qTable = QLearningEngine._qTable;
        learningData.lastUpdated = Date.now();
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(learningData));
        InternalLogger.debug('AI Feedback', 'Data saved');
        return true;
    } catch (error) {
        InternalLogger.error('AI Feedback', 'Failed to save data: ' + error.message);
        return false;
    }
}

async function processFeedbackQueue() {
    const queue = feedbackQueue || [];
    if (queue.length === 0) {
        feedbackTimer = null;
        return;
    }
    const batch = queue.splice(0, CONFIG.BATCH_SIZE);
    feedbackQueue = queue;
    try {
        if (isMemoryAvailable()) {
            const items = batch.map(function(item) {
                return { text: item.text, metadata: item.metadata };
            });
            if (window.VectorMemory && window.VectorMemory.batchSave) {
                await window.VectorMemory.batchSave(items);
            } else {
                for (const item of items) await window.VectorMemory.save(item.text, item.metadata);
            }
            memoryEnabled = true;
            InternalLogger.debug('AI Feedback', 'Batch processed: ' + items.length + ' items');
        }
    } catch (error) {
        InternalLogger.warn('AI Feedback', 'Batch processing failed: ' + error.message);
        feedbackQueue = batch.concat(feedbackQueue);
    }
    if (feedbackQueue.length > 0) scheduleFeedbackProcessing();
    else feedbackTimer = null;
}

function scheduleFeedbackProcessing() {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(processFeedbackQueue, 2000);
}

function isMemoryAvailable() {
    try {
        return !!(window.VectorMemory && window.VectorMemory.save && window.VectorMemory.search);
    } catch(e) {
        return false;
    }
}

async function saveFeedbackToMemory(agent, message, feedback, topic) {
    if (!isMemoryAvailable()) return false;
    try {
        const text = 'Agent: ' + agent + ' | Feedback: ' + feedback + ' | Topic: ' + (topic || 'general') + ' | Message: ' + message.substring(0, 100);
        const metadata = Object.freeze({
            agent: agent, feedback: feedback, message: message.substring(0, 200),
            topic: topic || 'general', timestamp: Date.now(), type: 'rl_feedback', feedbackId: generateId()
        });
        feedbackQueue.push({ text: text, metadata: metadata });
        scheduleFeedbackProcessing();
        InternalLogger.debug('AI Feedback', 'Queued to memory: ' + agent);
        return true;
    } catch (error) {
        InternalLogger.warn('AI Feedback', 'Memory queue failed: ' + error.message);
        return false;
    }
}

async function syncFromMemory() {
    if (!isMemoryAvailable()) return;
    try {
        const results = await window.VectorMemory.search('rl_feedback', {
            topK: 100, threshold: 0.1, filter: { type: 'rl_feedback' }
        });
        let synced = 0;
        for (const item of results) {
            const metadata = item.metadata || {};
            const id = metadata.feedbackId || item.id;
            if (!learningData.feedbackHistory.find(function(h) { return h.id === id; })) {
                learningData.feedbackHistory.push({
                    id: id, agent: metadata.agent || 'Unknown', feedback: metadata.feedback || 'like',
                    message: metadata.message || '', topic: metadata.topic || 'general',
                    timestamp: metadata.timestamp || Date.now()
                });
                synced++;
            }
        }
        if (synced > 0) {
            saveLearningData();
            InternalLogger.info('AI Feedback', 'Synced ' + synced + ' items from memory');
            if (window.renderLearningStatsRL) window.renderLearningStatsRL();
        }
    } catch (error) {
        InternalLogger.warn('AI Feedback', 'Memory sync failed: ' + error.message);
    }
}

async function recordFeedback(agent, message, feedback, topic) {
    topic = topic || 'general';
    if (!agent || typeof agent !== 'string') {
        InternalLogger.warn('AI Feedback', 'Invalid agent name');
        return false;
    }
    if (!message || message.length < 3) {
        InternalLogger.warn('AI Feedback', 'Message too short');
        return false;
    }
    if (!['like', 'dislike'].includes(feedback)) {
        InternalLogger.warn('AI Feedback', 'Invalid feedback type');
        return false;
    }
    if (!learningData.feedbackHistory) learningData.feedbackHistory = [];
    learningData.feedbackHistory.push({
        id: generateId(), agent: agent, message: message.substring(0, 200),
        feedback: feedback, topic: topic, timestamp: Date.now()
    });
    if (learningData.feedbackHistory.length > CONFIG.MAX_HISTORY) learningData.feedbackHistory.shift();
    if (!learningData.agentPreferences[agent]) {
        learningData.agentPreferences[agent] = {
            likes: 0, dislikes: 0, avgMessageLength: 0, preferredStyle: 'neutral', topics: {}
        };
    }
    const pref = learningData.agentPreferences[agent];
    const DECAY = CONFIG.DECAY_FACTOR;
    pref.likes = pref.likes * DECAY + (feedback === 'like' ? 1 : 0);
    pref.dislikes = pref.dislikes * DECAY + (feedback === 'dislike' ? 1 : 0);
    const msgLen = message.length;
    const totalFeedback = pref.likes + pref.dislikes;
    pref.avgMessageLength = ((pref.avgMessageLength || 0) * (totalFeedback - 1) + msgLen) / totalFeedback;
    if (!learningData.topicPreferences) learningData.topicPreferences = {};
    if (!learningData.topicPreferences[topic]) learningData.topicPreferences[topic] = {};
    if (!learningData.topicPreferences[topic][agent]) learningData.topicPreferences[topic][agent] = { likes: 0, dislikes: 0 };
    const topicPref = learningData.topicPreferences[topic][agent];
    if (feedback === 'like') topicPref.likes++;
    else topicPref.dislikes++;
    if (!learningData.agentWeights) learningData.agentWeights = {};
    if (!learningData.agentWeights[agent]) learningData.agentWeights[agent] = 1;
    const reward = feedback === 'like' ? 1 : -1;
    const learningRate = 0.01;
    learningData.agentWeights[agent] += reward * learningRate;
    learningData.agentWeights[agent] = Math.max(0.5, Math.min(2, learningData.agentWeights[agent]));
    const state = agent + '|' + topic;
    const action = feedback;
    QLearningEngine.updateQ(state, action, reward, null);
    if (pref.likes > CONFIG.MIN_LIKES_FOR_STYLE) {
        const avgLen = pref.avgMessageLength || 0;
        if (avgLen < 200) pref.preferredStyle = 'concise';
        else if (avgLen > 500) pref.preferredStyle = 'detailed';
        else pref.preferredStyle = 'balanced';
    }
    saveLearningData();
    await saveFeedbackToMemory(agent, message, feedback, topic);
    if (window.AutoLearning && window.AutoLearning.recordApproval) {
        const confidence = feedback === 'like' ? CONFIG.CONFIDENCE_LIKE : CONFIG.CONFIDENCE_DISLIKE;
        const approved = feedback === 'like';
        await window.AutoLearning.recordApproval(agent, confidence, approved);
    }
    const toastMsg = '🧠 ' + agent + ' belajar dari ' + (feedback === 'like' ? '👍 LIKE' : '👎 DISLIKE') + ' Anda!';
    showToast(toastMsg, 'success');
    InternalLogger.info('AI Feedback', agent + ' → ' + feedback + ' (topic: ' + topic + ')');
    return true;
}

function getLearningPrompt(agent, originalPrompt, topic) {
    topic = topic || 'general';
    const cacheKey = 'prompt_' + agent + '_' + topic;
    const cached = RLCache.get(cacheKey);
    if (cached) return cached;
    const pref = learningData.agentPreferences[agent];
    if (!pref || pref.likes < 2) {
        RLCache.set(cacheKey, originalPrompt, 60000);
        return originalPrompt;
    }
    let style = pref.preferredStyle || 'balanced';
    if (learningData.topicPreferences && learningData.topicPreferences[topic]) {
        const topicPref = learningData.topicPreferences[topic][agent];
        if (topicPref && topicPref.likes + topicPref.dislikes > 3) {
            const rate = topicPref.likes / (topicPref.likes + topicPref.dislikes);
            if (rate > 0.7 && (pref.avgMessageLength || 0) < 200) style = 'concise';
            else if (rate > 0.7 && (pref.avgMessageLength || 0) > 500) style = 'detailed';
            else style = 'balanced';
        }
    }
    let styleInstruction = '';
    if (style === 'concise') styleInstruction = '\n\nUser sebelumnya menyukai jawaban yang SINGKAT dan PADAT. Jawab dalam maksimal 200 karakter.';
    else if (style === 'detailed') styleInstruction = '\n\nUser sebelumnya menyukai jawaban yang DETAIL dan LENGKAP. Berikan penjelasan mendalam.';
    else styleInstruction = '\n\nJawab dengan seimbang, tidak terlalu pendek tidak terlalu panjang.';
    const result = originalPrompt + styleInstruction;
    RLCache.set(cacheKey, result, 60000);
    return result;
}

function predictUserPreference(agent, topic) {
    topic = topic || 'general';
    const cacheKey = 'pred_' + agent + '_' + topic;
    const cached = RLCache.get(cacheKey);
    if (cached) return cached;
    const pref = learningData.agentPreferences[agent];
    if (!pref || pref.likes + pref.dislikes < CONFIG.PREDICTION_MIN_DATA) {
        const result = { prediction: 'unknown', confidence: 0, rate: '0%', reason: 'Belum cukup data' };
        RLCache.set(cacheKey, result, 30000);
        return result;
    }
    const total = pref.likes + pref.dislikes;
    const rate = pref.likes / total;
    let topicRate = null;
    if (learningData.topicPreferences && learningData.topicPreferences[topic]) {
        const topicPref = learningData.topicPreferences[topic][agent];
        if (topicPref && topicPref.likes + topicPref.dislikes > 3) {
            topicRate = topicPref.likes / (topicPref.likes + topicPref.dislikes);
        }
    }
    const finalRate = topicRate !== null ? (topicRate * 0.6 + rate * 0.4) : rate;
    const confidence = Math.min(95, (total * 2) + 20);
    let prediction = 'neutral';
    if (finalRate > 0.6) prediction = 'like';
    else if (finalRate < 0.4) prediction = 'dislike';
    const state = agent + '|' + topic;
    const actions = ['like', 'dislike', 'neutral'];
    const qAction = QLearningEngine.chooseAction(state, actions);
    if (qAction && qAction !== 'neutral') prediction = qAction;
    const result = {
        prediction: prediction,
        confidence: Math.round(confidence),
        rate: (finalRate * 100).toFixed(1) + '%',
        reason: topicRate !== null ? 'Berdasarkan preferensi untuk topik ini' : 'Berdasarkan preferensi umum'
    };
    RLCache.set(cacheKey, result, 30000);
    return result;
}

function detectAnomaly(agent) {
    const history = learningData.feedbackHistory
        .filter(function(h) { return h.agent === agent; })
        .slice(-30);
    if (history.length < 15) return null;
    const recent = history.slice(-5);
    const older = history.slice(-15, -5);
    const recentLikes = recent.filter(function(h) { return h.feedback === 'like'; }).length;
    const olderLikes = older.filter(function(h) { return h.feedback === 'like'; }).length;
    const recentRate = recentLikes / recent.length;
    const olderRate = olderLikes / older.length;
    const rates = [];
    for (let i = 5; i < history.length; i++) {
        const slice = history.slice(i - 5, i);
        const likes = slice.filter(function(h) { return h.feedback === 'like'; }).length;
        rates.push(likes / slice.length);
    }
    const avgRate = rates.reduce(function(a, b) { return a + b; }, 0) / rates.length;
    const lastRate = rates[rates.length - 1] || 0;
    if (recentRate < olderRate * CONFIG.ANOMALY_THRESHOLD && recentRate < 0.3) {
        return {
            anomaly: true, agent: agent,
            message: '⚠️ Feedback untuk ' + agent + ' turun drastis!',
            severity: 'high',
            suggestion: 'Mungkin perlu perbaikan prompt atau gaya jawaban',
            recentRate: (recentRate * 100).toFixed(1) + '%',
            olderRate: (olderRate * 100).toFixed(1) + '%',
            patternChange: Math.abs(lastRate - avgRate) > 0.3
        };
    }
    if (Math.abs(lastRate - avgRate) > 0.3) {
        return {
            anomaly: true, agent: agent,
            message: '⚠️ Pola feedback ' + agent + ' berubah!',
            severity: 'medium',
            suggestion: lastRate < avgRate ? 'Performa menurun' : 'Performa meningkat',
            recentRate: (lastRate * 100).toFixed(1) + '%',
            olderRate: (avgRate * 100).toFixed(1) + '%',
            patternChange: true
        };
    }
    return null;
}

function getFeedbackTrend(agent, days) {
    days = days || 7;
    const cutoff = Date.now() - (days * 86400000);
    const history = learningData.feedbackHistory
        .filter(function(h) { return h.agent === agent && h.timestamp > cutoff; });
    const daily = {};
    history.forEach(function(h) {
        const date = getDateString(h.timestamp);
        if (!daily[date]) daily[date] = { likes: 0, dislikes: 0 };
        if (h.feedback === 'like') daily[date].likes++;
        else daily[date].dislikes++;
    });
    return Object.entries(daily).map(function(entry) {
        const date = entry[0];
        const data = entry[1];
        const total = data.likes + data.dislikes;
        return {
            date: date, likes: data.likes, dislikes: data.dislikes,
            rate: total > 0 ? (data.likes / total * 100).toFixed(1) : '0'
        };
    });
}

function detectFeedbackPatterns(agent) {
    const cacheKey = 'pattern_' + agent;
    const cached = RLCache.get(cacheKey);
    if (cached) return cached;
    const history = learningData.feedbackHistory
        .filter(function(h) { return h.agent === agent; })
        .slice(-50);
    if (history.length < 20) {
        const result = { pattern: 'insufficient_data', message: '📊 Butuh lebih banyak data untuk deteksi pola', count: history.length };
        RLCache.set(cacheKey, result, 60000);
        return result;
    }
    const hourlyPattern = {};
    const dayPattern = {};
    history.forEach(function(h) {
        const hour = getHour(h.timestamp);
        const day = getDay(h.timestamp);
        if (!hourlyPattern[hour]) hourlyPattern[hour] = { likes: 0, dislikes: 0 };
        if (!dayPattern[day]) dayPattern[day] = { likes: 0, dislikes: 0 };
        if (h.feedback === 'like') {
            hourlyPattern[hour].likes++;
            dayPattern[day].likes++;
        } else {
            hourlyPattern[hour].dislikes++;
            dayPattern[day].dislikes++;
        }
    });
    let bestHour = 0;
    let bestRate = 0;
    Object.entries(hourlyPattern).forEach(function(entry) {
        const hour = parseInt(entry[0]);
        const data = entry[1];
        const total = data.likes + data.dislikes;
        if (total > 3) {
            const rate = data.likes / total;
            if (rate > bestRate) {
                bestRate = rate;
                bestHour = hour;
            }
        }
    });
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    let bestDay = 0;
    let bestDayRate = 0;
    Object.entries(dayPattern).forEach(function(entry) {
        const day = parseInt(entry[0]);
        const data = entry[1];
        const total = data.likes + data.dislikes;
        if (total > 3) {
            const rate = data.likes / total;
            if (rate > bestDayRate) {
                bestDayRate = rate;
                bestDay = day;
            }
        }
    });
    const result = {
        pattern: bestRate > 0.7 ? 'strong_pattern' : 'stable',
        bestHour: bestHour,
        bestHourRate: (bestRate * 100).toFixed(1) + '%',
        bestDay: dayNames[bestDay],
        bestDayRate: (bestDayRate * 100).toFixed(1) + '%',
        suggestion: bestRate > 0.7
            ? '💡 Agen ini paling disukai pada jam ' + bestHour + ':00 dan hari ' + dayNames[bestDay]
            : '📊 Pola feedback cukup stabil sepanjang waktu',
        hourlyPattern: hourlyPattern,
        dayPattern: dayPattern
    };
    RLCache.set(cacheKey, result, 60000);
    return result;
}

function analyzeFeedbackSentiment(agent) {
    const cacheKey = 'sentiment_' + agent;
    const cached = RLCache.get(cacheKey);
    if (cached) return cached;
    const history = learningData.feedbackHistory
        .filter(function(h) { return h.agent === agent && h.feedback === 'like'; })
        .slice(-30);
    if (history.length < 5) {
        const result = { sentiment: 'insufficient_data', message: '📝 Belum cukup data untuk analisis sentimen', count: history.length };
        RLCache.set(cacheKey, result, 60000);
        return result;
    }
    const wordFrequency = {};
    history.forEach(function(h) {
        const words = h.message.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
        words.forEach(function(w) {
            if (w.length > 3) wordFrequency[w] = (wordFrequency[w] || 0) + 1;
        });
    });
    const topWords = Object.entries(wordFrequency)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 10);
    const positiveWords = ['baik', 'bagus', 'hebat', 'luar', 'biasa', 'mantap', 'keren', 'top', 'sangat', 'suka'];
    const foundPositive = topWords.filter(function(w) { return positiveWords.includes(w[0]); });
    const result = {
        sentiment: foundPositive.length > 0 ? 'positive' : 'neutral',
        topWords: topWords,
        positiveWords: foundPositive,
        suggestion: topWords.length > 0
            ? '📝 User menyukai kata-kata: ' + topWords.slice(0, 5).map(function(w) { return w[0]; }).join(', ')
            : '📝 Belum cukup data untuk analisis sentimen',
        message: foundPositive.length > 0
            ? '😊 User merespons positif terhadap kata-kata: ' + foundPositive.map(function(w) { return w[0]; }).join(', ')
            : '😐 Sentimen netral, belum ada pola kata yang kuat'
    };
    RLCache.set(cacheKey, result, 60000);
    return result;
}

function generateSmartResponse(agent, userMessage, topic) {
    topic = topic || 'general';
    const prediction = predictUserPreference(agent, topic);
    const pattern = detectFeedbackPatterns(agent);
    const sentiment = analyzeFeedbackSentiment(agent);
    const pref = learningData.agentPreferences[agent];
    let responseStyle = 'balanced';
    let responseLength = 'medium';
    let confidence = prediction.confidence || 50;
    if (prediction.prediction === 'like' && prediction.confidence > 70) {
        responseStyle = 'enthusiastic';
        responseLength = 'detailed';
        confidence = prediction.confidence;
    } else if (prediction.prediction === 'dislike' && prediction.confidence > 70) {
        responseStyle = 'concise';
        responseLength = 'short';
        confidence = prediction.confidence;
    }
    if (pattern && pattern.bestHour && pattern.bestHour === getHour(Date.now())) responseLength = 'detailed';
    if (sentiment && sentiment.sentiment === 'positive') responseStyle = 'warm';
    if (pref && pref.preferredStyle === 'concise') {
        responseStyle = 'concise';
        responseLength = 'short';
    } else if (pref && pref.preferredStyle === 'detailed') {
        responseStyle = 'detailed';
        responseLength = 'detailed';
    }
    return {
        style: responseStyle, length: responseLength, confidence: confidence,
        suggestion: sentiment && sentiment.suggestion ? sentiment.suggestion : '📝 Gaya jawaban berdasarkan preferensi umum',
        prediction: prediction, pattern: pattern
    };
}

function getAgentStats(agent) {
    const cacheKey = 'stats_' + agent;
    const cached = RLCache.get(cacheKey);
    if (cached) return cached;
    const pref = learningData.agentPreferences[agent];
    if (!pref) return null;
    const total = pref.likes + pref.dislikes;
    const rate = total > 0 ? (pref.likes / total * 100) : 0;
    const anomalies = detectAnomaly(agent);
    const trend = getFeedbackTrend(agent, 7);
    const pattern = detectFeedbackPatterns(agent);
    const sentiment = analyzeFeedbackSentiment(agent);
    const state = agent + '|general';
    const qValues = {
        like: QLearningEngine.getQ(state, 'like'),
        dislike: QLearningEngine.getQ(state, 'dislike')
    };
    const result = {
        agent: agent,
        likes: Math.round(pref.likes),
        dislikes: Math.round(pref.dislikes),
        total: Math.round(total),
        rate: rate.toFixed(1) + '%',
        style: pref.preferredStyle || 'neutral',
        avgMessageLength: Math.round(pref.avgMessageLength || 0),
        weight: learningData.agentWeights[agent] || 1,
        anomalies: anomalies, pattern: pattern, sentiment: sentiment,
        trend: trend.slice(-7), qValues: qValues
    };
    RLCache.set(cacheKey, result, 30000);
    return result;
}

function getOverallStats() {
    const cacheKey = 'overall_stats';
    const cached = RLCache.get(cacheKey);
    if (cached) return cached;
    const agents = Object.keys(learningData.agentPreferences);
    const stats = agents.map(function(agent) { return getAgentStats(agent); }).filter(function(s) { return s !== null; });
    stats.sort(function(a, b) { return parseFloat(b.rate) - parseFloat(a.rate); });
    const totalFeedbacks = learningData.feedbackHistory.length;
    const totalLikes = learningData.feedbackHistory.filter(function(h) { return h.feedback === 'like'; }).length;
    const totalDislikes = learningData.feedbackHistory.filter(function(h) { return h.feedback === 'dislike'; }).length;
    const anomalies = stats.filter(function(s) { return s.anomalies !== null; });
    const result = {
        agents: stats, totalFeedbacks: totalFeedbacks, totalLikes: totalLikes, totalDislikes: totalDislikes,
        overallRate: totalFeedbacks > 0 ? (totalLikes / totalFeedbacks * 100).toFixed(1) + '%' : '0%',
        anomalies: anomalies.length, memoryEnabled: memoryEnabled,
        lastUpdated: learningData.lastUpdated,
        topAgent: stats.length > 0 ? stats[0].agent : null,
        topRate: stats.length > 0 ? stats[0].rate : '0%',
        qLearning: QLearningEngine.getStats(), cacheSize: RLCache.getSize()
    };
    RLCache.set(cacheKey, result, 10000);
    return result;
}

function predictFuture(agent, days) {
    days = days || 7;
    const history = learningData.feedbackHistory
        .filter(function(h) { return h.agent === agent; })
        .slice(-30);
    if (history.length < 10) {
        return { agent: agent, predictions: [], trend: 'insufficient_data', confidence: 0 };
    }
    const x = history.map(function(_, i) { return i; });
    const y = history.map(function(h) { return h.feedback === 'like' ? 1 : 0; });
    const n = x.length;
    const sumX = x.reduce(function(a, b) { return a + b; }, 0);
    const sumY = y.reduce(function(a, b) { return a + b; }, 0);
    const sumXY = x.reduce(function(a, b, i) { return a + b * y[i]; }, 0);
    const sumXX = x.reduce(function(a, b) { return a + b * b; }, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const predictions = [];
    for (let i = 1; i <= days; i++) {
        const pred = slope * (n + i) + intercept;
        predictions.push({
            day: i,
            predictedRate: Math.max(0, Math.min(1, pred)),
            confidence: Math.min(95, 60 + history.length)
        });
    }
    return {
        agent: agent, predictions: predictions,
        trend: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable',
        confidence: Math.min(95, 60 + history.length)
    };
}

function collaborateAgents() {
    const agents = Object.keys(learningData.agentPreferences);
    if (agents.length < 2) return false;
    let changes = 0;
    for (const agent of agents) {
        const pref = learningData.agentPreferences[agent];
        if (!pref) continue;
        const similar = agents.filter(function(a) {
            if (a === agent) return false;
            const other = learningData.agentPreferences[a];
            if (!other) return false;
            return Math.abs(pref.likes - other.likes) < 5;
        });
        if (similar.length > 0) {
            let avgLikes = 0;
            let avgDislikes = 0;
            for (const a of similar) {
                const other = learningData.agentPreferences[a];
                if (other) {
                    avgLikes += other.likes || 0;
                    avgDislikes += other.dislikes || 0;
                }
            }
            avgLikes = avgLikes / similar.length;
            avgDislikes = avgDislikes / similar.length;
            const oldLikes = pref.likes;
            const oldDislikes = pref.dislikes;
            pref.likes = pref.likes * 0.7 + avgLikes * 0.3;
            pref.dislikes = pref.dislikes * 0.7 + avgDislikes * 0.3;
            if (Math.abs(pref.likes - oldLikes) > 0.1) changes++;
        }
    }
    if (changes > 0) {
        saveLearningData();
        InternalLogger.info('AI Feedback', 'Collaboration: ' + changes + ' agents updated');
    }
    return changes > 0;
}

async function syncWithCloud() {
    if (!CONFIG.FEDERATED_LEARNING_ENABLED) return false;
    try {
        const userId = getUserId();
        const localWeights = {
            agentPreferences: learningData.agentPreferences,
            agentWeights: learningData.agentWeights,
            qTable: QLearningEngine._qTable
        };
        let dataToSend = localWeights;
        if (CONFIG.ENCRYPTION_ENABLED) {
            const encrypted = await encryptData(localWeights, userId);
            dataToSend = { encrypted: encrypted, userId: userId };
        }
        const response = await fetch('/api/federated/aggregate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, data: dataToSend })
        });
        if (!response.ok) throw new Error('Server response: ' + response.status);
        let cloudData = await response.json();
        if (cloudData && cloudData.weights) {
            let globalWeights = cloudData.weights;
            if (cloudData.encrypted) {
                const decrypted = await decryptData(cloudData.encrypted, userId);
                if (decrypted) globalWeights = decrypted;
            }
            if (globalWeights && globalWeights.agentPreferences) {
                const LOCAL_WEIGHT = 0.6;
                const CLOUD_WEIGHT = 0.4;
                for (const agent in globalWeights.agentPreferences) {
                    if (learningData.agentPreferences[agent]) {
                        const local = learningData.agentPreferences[agent];
                        const cloud = globalWeights.agentPreferences[agent];
                        local.likes = local.likes * LOCAL_WEIGHT + cloud.likes * CLOUD_WEIGHT;
                        local.dislikes = local.dislikes * LOCAL_WEIGHT + cloud.dislikes * CLOUD_WEIGHT;
                    }
                }
                if (globalWeights.qTable) {
                    for (const key in globalWeights.qTable) {
                        if (!QLearningEngine._qTable[key]) QLearningEngine._qTable[key] = globalWeights.qTable[key];
                        else QLearningEngine._qTable[key] = QLearningEngine._qTable[key] * 0.7 + globalWeights.qTable[key] * 0.3;
                    }
                }
                learningData.cloudSyncedAt = Date.now();
                saveLearningData();
                InternalLogger.info('AI Feedback', 'Synced with cloud successfully');
                showToast('☁️ Data pembelajaran disinkronkan!', 'success');
                return true;
            }
        }
        return false;
    } catch (error) {
        InternalLogger.warn('AI Feedback', 'Cloud sync failed: ' + error.message);
        return false;
    }
}

function startRealtimeUpdates() {
    if (realtimeInterval) clearInterval(realtimeInterval);
    realtimeInterval = setInterval(function() {
        try {
            const stats = getOverallStats();
            const elements = {
                'rlLiveLikes': stats.totalLikes,
                'rlLiveDislikes': stats.totalDislikes,
                'rlLiveRate': stats.overallRate,
                'rlLiveFeedbacks': stats.totalFeedbacks,
                'rlLiveAgents': stats.agents.length
            };
            for (const [id, value] of Object.entries(elements)) {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            }
            if (window.updateAnomalyBadge) window.updateAnomalyBadge();
        } catch (e) {}
    }, 5000);
    InternalLogger.info('AI Feedback', 'Real-time updates started');
}

function updateAnomalyBadge() {
    try {
        const agents = Object.keys(learningData.agentPreferences);
        const anomalies = agents.map(function(agent) { return detectAnomaly(agent); }).filter(function(a) { return a !== null; });
        const badge = document.getElementById('rlAnomalyBadge');
        if (badge) {
            if (anomalies.length > 0) {
                badge.textContent = '⚠️ ' + anomalies.length;
                badge.style.display = 'inline';
                badge.style.background = '#FF6B6B';
                badge.style.color = '#fff';
                badge.style.padding = '2px 8px';
                badge.style.borderRadius = '12px';
                badge.style.fontSize = '10px';
                badge.style.marginLeft = '8px';
                badge.title = anomalies.map(function(a) { return a.agent + ': ' + a.message; }).join('\n');
            } else {
                badge.style.display = 'none';
            }
        }
    } catch(e) {}
}

function createAnomalyBadge() {
    try {
        let badge = document.getElementById('rlAnomalyBadge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'rlAnomalyBadge';
            badge.style.cssText = 'display: none;';
            const header = document.querySelector('.chat-header-premium .chat-header-right') ||
                           document.querySelector('.topbar-info .status-area');
            if (header) header.appendChild(badge);
            else document.body.appendChild(badge);
        }
        updateAnomalyBadge();
        return badge;
    } catch(e) {
        return null;
    }
}

function renderFeedbackChart(agent, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !CONFIG.CHART_ENABLED) return;
    const trend = getFeedbackTrend(agent, 30);
    if (trend.length < 2) {
        container.innerHTML = '<div style="color: #666; font-size: 11px; padding: 10px;">📊 Belum cukup data untuk grafik</div>';
        return;
    }
    if (chartInstances[containerId]) {
        try { chartInstances[containerId].destroy(); } catch(e) {}
        delete chartInstances[containerId];
    }
    if (typeof Chart === 'undefined') {
        container.innerHTML = '<div style="color: #666; font-size: 11px; padding: 10px;">⚠️ Chart.js tidak tersedia</div>';
        return;
    }
    try {
        const canvas = document.createElement('canvas');
        canvas.id = 'chart-' + containerId;
        canvas.style.width = '100%';
        canvas.style.height = '150px';
        container.innerHTML = '';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const labels = trend.map(function(t) { return t.date; });
        const rates = trend.map(function(t) { return parseFloat(t.rate); });
        chartInstances[containerId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Approval Rate (%)', data: rates,
                    borderColor: '#00FFA3', backgroundColor: 'rgba(0, 255, 163, 0.1)',
                    fill: true, tension: 0.3,
                    pointBackgroundColor: '#00FFA3', pointBorderColor: '#03050A', pointRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#A0B3C9', font: { size: 9 } } },
                    tooltip: { callbacks: { label: function(context) { return 'Rate: ' + context.raw + '%'; } } }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#A0B3C9', font: { size: 8 } } },
                    x: { grid: { display: false }, ticks: { color: '#A0B3C9', font: { size: 7 }, maxTicksLimit: 10 } }
                }
            }
        });
        InternalLogger.debug('AI Feedback', 'Chart rendered for ' + agent);
    } catch(e) {
        container.innerHTML = '<div style="color: #666; font-size: 11px; padding: 10px;">⚠️ Gagal render chart</div>';
    }
}

function renderLearningStats() {
    const container = document.getElementById('learningStatsContainer');
    if (!container) return;
    const stats = getOverallStats();
    if (stats.agents.length === 0) {
        container.innerHTML = '<p class="text-dim" style="padding: 12px;">📭 Belum ada feedback. Like/dislike jawaban agen untuk melatih mereka!</p>';
        return;
    }
    let html = '<div style="margin-top: 16px; padding: 12px; background: rgba(0,255,163,0.05); border-radius: 16px; border: 1px solid rgba(0,255,163,0.1);">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">';
    html += '   <h4 style="color: #00FFA3; margin: 0;">🧠 Reinforcement Learning</h4>';
    html += '   <span style="font-size: 10px; color: #666;">' + stats.totalFeedbacks + ' feedbacks • ' + stats.agents.length + ' agents</span>';
    html += '</div>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; margin-bottom: 12px; padding: 8px; background: rgba(0,0,0,0.15); border-radius: 8px;">';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Total</div><div style="font-size: 16px; font-weight: bold; color: #00FFA3;" id="rlLiveFeedbacks">' + stats.totalFeedbacks + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Likes</div><div style="font-size: 16px; font-weight: bold; color: #00FFA3;" id="rlLiveLikes">' + stats.totalLikes + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Dislikes</div><div style="font-size: 16px; font-weight: bold; color: #FF6B6B;" id="rlLiveDislikes">' + stats.totalDislikes + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Rate</div><div style="font-size: 16px; font-weight: bold; color: #FFD700;" id="rlLiveRate">' + stats.overallRate + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Anomalies</div><div style="font-size: 16px; font-weight: bold; color: #FF6B6B;">' + stats.anomalies + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Memory</div><div style="font-size: 16px; font-weight: bold; color: ' + (stats.memoryEnabled ? '#00FFA3' : '#666') + ';">' + (stats.memoryEnabled ? '✅' : '❌') + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Q-Table</div><div style="font-size: 16px; font-weight: bold; color: #9B59B6;">' + (stats.qLearning?.totalStates || 0) + '</div></div>';
    html += '   <div style="text-align: center;"><div style="font-size: 9px; color: #666;">Cache</div><div style="font-size: 16px; font-weight: bold; color: #00D4FF;">' + (stats.cacheSize || 0) + '</div></div>';
    html += '</div>';
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px;">';
    for (const agent of stats.agents) {
        const color = parseFloat(agent.rate) > 70 ? '#00FFA3' : (parseFloat(agent.rate) > 40 ? '#FFD700' : '#FF6B6B');
        const emoji = agent.style === 'concise' ? '📝' : (agent.style === 'detailed' ? '📚' : '⚖️');
        const hasAnomaly = agent.anomalies !== null;
        const hasPattern = agent.pattern && agent.pattern.pattern !== 'insufficient_data';
        const hasSentiment = agent.sentiment && agent.sentiment.sentiment !== 'insufficient_data';
        html += '<div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 10px; border: 1px solid ' + (hasAnomaly ? '#FF6B6B' : 'rgba(0,255,163,0.05)') + ';">';
        html += '   <div style="display: flex; justify-content: space-between; align-items: center;">';
        html += '       <span style="color: #00FFA3; font-weight: bold; font-size: 12px;">' + escapeHtml(agent.agent) + '</span>';
        html += '       <span style="font-size: 10px; color: ' + color + ';">' + agent.rate + '</span>';
        html += '   </div>';
        html += '   <div style="display: flex; gap: 8px; font-size: 9px; color: #666; margin-top: 4px; flex-wrap: wrap;">';
        html += '       <span>👍 ' + agent.likes + '</span>';
        html += '       <span>👎 ' + agent.dislikes + '</span>';
        html += '       <span>' + emoji + ' ' + agent.style + '</span>';
        html += '       <span>📏 ' + agent.avgMessageLength + ' ch</span>';
        html += '       <span>⚖️ ' + agent.weight.toFixed(2) + '</span>';
        if (agent.qValues) html += '       <span style="color:#9B59B6;">Q: ' + (agent.qValues.like || 0).toFixed(2) + '</span>';
        html += '   </div>';
        if (hasPattern && agent.pattern.bestHour !== undefined) {
            html += '   <div style="font-size: 8px; color: #00D4FF; margin-top: 2px;">⏰ Best: ' + agent.pattern.bestHour + ':00 (' + agent.pattern.bestHourRate + ')</div>';
        }
        if (hasSentiment && agent.sentiment.positiveWords && agent.sentiment.positiveWords.length > 0) {
            html += '   <div style="font-size: 8px; color: #FFD700; margin-top: 2px;">😊 ' + agent.sentiment.positiveWords.map(function(w) { return w[0]; }).join(', ') + '</div>';
        }
        if (hasAnomaly) {
            html += '   <div style="font-size: 8px; color: #FF6B6B; margin-top: 2px;">⚠️ ' + agent.anomalies.message.substring(0, 40) + '</div>';
        }
        html += '   <button class="view-chart-btn" data-agent="' + escapeHtml(agent.agent) + '" style="margin-top: 4px; padding: 2px 8px; background: rgba(0,255,163,0.1); border: 1px solid rgba(0,255,163,0.2); border-radius: 12px; color: #00FFA3; cursor: pointer; font-size: 8px;">📊 Chart</button>';
        html += '</div>';
    }
    html += '</div>';
    html += '<div id="feedbackChartContainer" style="margin-top: 12px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 8px; display: none;">';
    html += '   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">';
    html += '       <span style="color: #00FFA3; font-size: 11px;">📈 Feedback Trend</span>';
    html += '       <button id="closeChartBtn" style="background: none; border: none; color: #666; cursor: pointer; font-size: 11px;">✖</button>';
    html += '   </div>';
    html += '   <div id="chartCanvasContainer" style="height: 150px;"></div>';
    html += '</div>';
    html += '<div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">';
    html += '   <button id="resetRLBtn" class="execute-btn secondary" style="padding: 4px 12px; font-size: 10px;">🔄 Reset</button>';
    html += '   <button id="exportRLBtn" class="execute-btn secondary" style="padding: 4px 12px; font-size: 10px;">📤 Export</button>';
    html += '   <button id="importRLBtn" class="execute-btn secondary" style="padding: 4px 12px; font-size: 10px;">📥 Import</button>';
    html += '   <button id="exportEncryptedBtn" class="execute-btn secondary" style="padding: 4px 12px; font-size: 10px;">🔒 Export Encrypted</button>';
    html += '   <button id="collaborateBtn" class="execute-btn secondary" style="padding: 4px 12px; font-size: 10px;">🤝 Collaborate</button>';
    html += '   <span style="font-size: 8px; color: #444; align-self: center;">🧠 ' + (memoryEnabled ? 'Memory: ✅' : 'Memory: ❌') + '</span>';
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;

    document.getElementById('resetRLBtn')?.addEventListener('click', resetLearningData);
    document.getElementById('exportRLBtn')?.addEventListener('click', exportLearningData);
    document.getElementById('exportEncryptedBtn')?.addEventListener('click', exportEncryptedData);
    document.getElementById('collaborateBtn')?.addEventListener('click', function() {
        const result = collaborateAgents();
        showToast(result ? '🤝 Kolaborasi berhasil!' : '🤝 Tidak ada perubahan', result ? 'success' : 'info');
        renderLearningStats();
    });
    document.getElementById('importRLBtn')?.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.bin';
        input.onchange = function(e) {
            if (e.target.files[0]) {
                const isEncrypted = e.target.files[0].name.endsWith('.bin');
                if (isEncrypted) importEncryptedData(e.target.files[0]);
                else importLearningData(e.target.files[0]);
            }
        };
        input.click();
    });
    document.getElementById('closeChartBtn')?.addEventListener('click', function() {
        const chartContainer = document.getElementById('feedbackChartContainer');
        if (chartContainer) chartContainer.style.display = 'none';
    });
    document.querySelectorAll('.view-chart-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const agent = this.dataset.agent;
            const chartContainer = document.getElementById('feedbackChartContainer');
            const canvasContainer = document.getElementById('chartCanvasContainer');
            if (chartContainer && canvasContainer) {
                chartContainer.style.display = 'block';
                renderFeedbackChart(agent, 'chartCanvasContainer');
                chartContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
    updateAnomalyBadge();
}

function addFeedbackButtonsToMessages() {
    const containers = [
        document.getElementById('chatAiMessages'),
        document.getElementById('chatAgentMessages'),
        document.getElementById('interactiveForumMessages')
    ];
    for (const container of containers) {
        if (container) observeAndAddButtons(container);
    }
}

function observeAndAddButtons(container) {
    try {
        const observer = new MutationObserver(function(mutations) {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.classList &&
                        (node.classList.contains('ai-message') ||
                         node.classList.contains('agent-message') ||
                         node.classList.contains('message'))) {
                        addButtonsToMessage(node);
                    }
                }
            }
        });
        observer.observe(container, { childList: true, subtree: true });
        const existingMessages = container.querySelectorAll('.ai-message, .agent-message, .message');
        for (const msg of existingMessages) addButtonsToMessage(msg);
    } catch(e) {}
}

function addButtonsToMessage(messageDiv) {
    try {
        if (messageDiv.querySelector('.feedback-buttons-rl')) return;
        let agentName = 'Unknown';
        const strongTag = messageDiv.querySelector('strong');
        if (strongTag) {
            const text = strongTag.innerText;
            const mapping = {
                '👨 Rahmad Raharjo': 'RahmadRaharjo',
                'Rahmad Raharjo': 'RahmadRaharjo',
                'Manager': 'Manager',
                'StartupFounder': 'StartupFounder',
                '👿 DevilsAdvocate': 'DevilsAdvocate',
                'Sundanya Asep': 'SundanyaAsep'
            };
            for (const [display, key] of Object.entries(mapping)) {
                if (text.includes(display)) {
                    agentName = key;
                    break;
                }
            }
        }
        const messageText = messageDiv.innerText.substring(0, 300);
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-buttons-rl';
        feedbackDiv.style.cssText = 'margin-top: 6px; display: flex; gap: 8px; justify-content: flex-end;';
        feedbackDiv.innerHTML =
            '<button class="feedback-like-rl" data-agent="' + escapeHtml(agentName) + '" data-msg="' + escapeHtml(messageText) + '" ' +
                    'style="background: none; border: none; color: #00FFA3; cursor: pointer; font-size: 12px; padding: 2px 8px; border-radius: 12px; transition: all 0.2s ease;">' +
                '👍 Membantu' +
            '</button>' +
            '<button class="feedback-dislike-rl" data-agent="' + escapeHtml(agentName) + '" data-msg="' + escapeHtml(messageText) + '" ' +
                    'style="background: none; border: none; color: #FF8888; cursor: pointer; font-size: 12px; padding: 2px 8px; border-radius: 12px; transition: all 0.2s ease;">' +
                '👎 Tidak membantu' +
            '</button>';
        messageDiv.appendChild(feedbackDiv);
        const likeBtn = feedbackDiv.querySelector('.feedback-like-rl');
        const dislikeBtn = feedbackDiv.querySelector('.feedback-dislike-rl');
        likeBtn?.addEventListener('click', function(e) {
            e.stopPropagation();
            const agent = this.dataset.agent;
            const msg = this.dataset.msg;
            const topic = document.getElementById('topicInput')?.value || 'general';
            recordFeedback(agent, msg, 'like', topic);
            this.style.opacity = '0.5';
            this.disabled = true;
            if (dislikeBtn) {
                dislikeBtn.style.opacity = '0.5';
                dislikeBtn.disabled = true;
            }
        });
        dislikeBtn?.addEventListener('click', function(e) {
            e.stopPropagation();
            const agent = this.dataset.agent;
            const msg = this.dataset.msg;
            const topic = document.getElementById('topicInput')?.value || 'general';
            recordFeedback(agent, msg, 'dislike', topic);
            this.style.opacity = '0.5';
            this.disabled = true;
            if (likeBtn) {
                likeBtn.style.opacity = '0.5';
                likeBtn.disabled = true;
            }
        });
    } catch(e) {}
}

function overrideAIClients() {
    try {
        if (window.AIClients && window.AIClients.generateWithFallback) {
            const originalGenerate = window.AIClients.generateWithFallback;
            window.AIClients.generateWithFallback = async function(prompt, agentName, initialProvider, topic) {
                const enhancedPrompt = getLearningPrompt(agentName, prompt, topic);
                return originalGenerate.call(this, enhancedPrompt, agentName, initialProvider);
            };
            InternalLogger.info('AI Feedback', 'AIClients override successful');
        }
    } catch(e) {}
}

function exportLearningData() {
    const data = {
        exportDate: new Date().toISOString(),
        totalFeedbacks: learningData.feedbackHistory.length,
        agents: Object.keys(learningData.agentPreferences).length,
        data: learningData,
        qTable: QLearningEngine._qTable
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rl_learning_' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Data pembelajaran diekspor!', 'success');
    InternalLogger.info('AI Feedback', 'Data exported');
}

async function exportEncryptedData() {
    try {
        const password = prompt('🔒 Buat password untuk enkripsi:');
        if (!password) return;
        const data = {
            exportDate: new Date().toISOString(),
            totalFeedbacks: learningData.feedbackHistory.length,
            agents: Object.keys(learningData.agentPreferences).length,
            data: learningData,
            qTable: QLearningEngine._qTable
        };
        const encrypted = await encryptData(data, password);
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rl_data_encrypted_' + Date.now() + '.bin';
        a.click();
        URL.revokeObjectURL(url);
        showToast('🔒 Data dienkripsi dan diekspor!', 'success');
        InternalLogger.info('AI Feedback', 'Encrypted data exported');
    } catch (error) {
        showToast('❌ Gagal enkripsi: ' + error.message, 'error');
        InternalLogger.error('AI Feedback', 'Export encrypted failed: ' + error.message);
    }
}

async function importEncryptedData(file) {
    try {
        const password = prompt('🔑 Masukkan password:');
        if (!password) return;
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const encrypted = e.target.result;
                const data = await decryptData(encrypted, password);
                if (!data || !data.data) throw new Error('Invalid encrypted data');
                if (data.data && data.data.agentPreferences) {
                    learningData = {
                        agentPreferences: data.data.agentPreferences || {},
                        feedbackHistory: data.data.feedbackHistory || [],
                        topicPreferences: data.data.topicPreferences || {},
                        agentWeights: data.data.agentWeights || {},
                        lastUpdated: Date.now(),
                        cloudSyncedAt: data.data.cloudSyncedAt || null,
                        qTable: data.qTable || {}
                    };
                    if (data.qTable) QLearningEngine._qTable = data.qTable;
                    saveLearningData();
                    showToast('📥 Data terenkripsi diimpor! (' + learningData.feedbackHistory.length + ' feedbacks)', 'success');
                    InternalLogger.info('AI Feedback', 'Encrypted data imported: ' + learningData.feedbackHistory.length + ' feedbacks');
                    renderLearningStats();
                } else {
                    throw new Error('Format data tidak valid');
                }
            } catch (error) {
                showToast('❌ Gagal impor: ' + error.message, 'error');
                InternalLogger.error('AI Feedback', 'Import encrypted failed: ' + error.message);
            }
        };
        reader.readAsText(file);
    } catch (error) {
        showToast('❌ Gagal: ' + error.message, 'error');
        InternalLogger.error('AI Feedback', 'Import encrypted failed: ' + error.message);
    }
}

function importLearningData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.data && data.data.agentPreferences) {
                learningData = {
                    agentPreferences: data.data.agentPreferences || {},
                    feedbackHistory: data.data.feedbackHistory || [],
                    topicPreferences: data.data.topicPreferences || {},
                    agentWeights: data.data.agentWeights || {},
                    lastUpdated: Date.now(),
                    cloudSyncedAt: data.data.cloudSyncedAt || null,
                    qTable: data.qTable || {}
                };
                if (data.qTable) QLearningEngine._qTable = data.qTable;
                saveLearningData();
                showToast('📥 Data pembelajaran diimpor! (' + learningData.feedbackHistory.length + ' feedbacks)', 'success');
                InternalLogger.info('AI Feedback', 'Data imported: ' + learningData.feedbackHistory.length + ' feedbacks');
                renderLearningStats();
            } else {
                throw new Error('Format file tidak valid');
            }
        } catch (error) {
            showToast('❌ Gagal impor: ' + error.message, 'error');
            InternalLogger.error('AI Feedback', 'Import failed: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function resetLearningData() {
    if (!confirm('Hapus semua data pembelajaran Reinforcement Learning?')) return;
    learningData = {
        agentPreferences: {}, feedbackHistory: [], topicPreferences: {},
        agentWeights: {}, lastUpdated: Date.now(), cloudSyncedAt: null, qTable: {}
    };
    QLearningEngine._qTable = {};
    RLCache.clear();
    saveLearningData();
    showToast('🧠 Data pembelajaran direset!', 'success');
    InternalLogger.info('AI Feedback', 'Data reset');
    renderLearningStats();
}

function setupWebSocket() {
    if (!CONFIG.WEBSOCKET_ENABLED) return;
    try {
        let wsUrl = 'ws://localhost:3000';
        try {
            const savedUrl = localStorage.getItem('kes_ws_url');
            if (savedUrl) wsUrl = savedUrl;
        } catch(e) {}
        ws = new WebSocket(wsUrl);
        ws.onopen = function() {
            InternalLogger.info('AI Feedback', 'WebSocket connected for RL');
        };
        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'rl_update') {
                    renderLearningStats();
                    updateAnomalyBadge();
                }
            } catch (e) {}
        };
        ws.onclose = function() {
            InternalLogger.info('AI Feedback', 'WebSocket disconnected, reconnecting...');
            setTimeout(setupWebSocket, 5000);
        };
        ws.onerror = function() {};
    } catch (error) {
        InternalLogger.warn('AI Feedback', 'WebSocket setup failed: ' + error.message);
    }
}

function startAutoSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(function() { syncWithCloud(); }, CONFIG.SYNC_INTERVAL);
    InternalLogger.info('AI Feedback', 'Auto-sync started');
}

function init() {
    try {
        loadLearningData();
        memoryEnabled = isMemoryAvailable();
        if (memoryEnabled) InternalLogger.info('AI Feedback', 'Memory.js detected — vector storage enabled!');
        else InternalLogger.info('AI Feedback', 'Memory.js not available — using localStorage only');
        overrideAIClients();
        setupWebSocket();
        startAutoSync();
        createAnomalyBadge();
        startRealtimeUpdates();
        if (memoryEnabled) {
            autoSyncInterval = setInterval(function() { syncFromMemory(); }, CONFIG.AUTO_SYNC_INTERVAL);
            setTimeout(syncFromMemory, 2000);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(addFeedbackButtonsToMessages, 1000);
            });
        } else {
            setTimeout(addFeedbackButtonsToMessages, 1000);
        }
        const learningPage = document.getElementById('learning');
        if (learningPage) {
            const observer = new MutationObserver(function() {
                if (learningPage.style.display !== 'none') setTimeout(renderLearningStats, 100);
            });
            observer.observe(learningPage, { attributes: true });
        }
        isInitialized = true;
        InternalLogger.info('AI Feedback', 'Module loaded — Memory: ' + (memoryEnabled ? 'ON' : 'OFF'));
    } catch(e) {
        InternalLogger.error('AI Feedback', 'Init failed: ' + e.message);
    }
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.ReactionLearning = Object.freeze({
    recordFeedback: recordFeedback,
    getLearningPrompt: getLearningPrompt,
    predictUserPreference: predictUserPreference,
    detectAnomaly: detectAnomaly,
    getFeedbackTrend: getFeedbackTrend,
    detectFeedbackPatterns: detectFeedbackPatterns,
    analyzeFeedbackSentiment: analyzeFeedbackSentiment,
    generateSmartResponse: generateSmartResponse,
    getAgentStats: getAgentStats,
    getOverallStats: getOverallStats,
    exportLearningData: exportLearningData,
    importLearningData: importLearningData,
    resetLearningData: resetLearningData,
    renderLearningStats: renderLearningStats,
    addFeedbackButtonsToMessages: addFeedbackButtonsToMessages,
    isMemoryAvailable: isMemoryAvailable,
    syncWithCloud: syncWithCloud,
    renderFeedbackChart: renderFeedbackChart,
    updateAnomalyBadge: updateAnomalyBadge,
    predictFuture: predictFuture,
    collaborateAgents: collaborateAgents,
    exportEncryptedData: exportEncryptedData,
    importEncryptedData: importEncryptedData,
    syncFromMemory: syncFromMemory,
    QLearningEngine: QLearningEngine,
    RLCache: RLCache
});

window.recordFeedback = recordFeedback;
window.getLearningPrompt = getLearningPrompt;
window.predictUserPreference = predictUserPreference;
window.detectAnomaly = detectAnomaly;
window.getFeedbackTrend = getFeedbackTrend;
window.detectFeedbackPatterns = detectFeedbackPatterns;
window.analyzeFeedbackSentiment = analyzeFeedbackSentiment;
window.generateSmartResponse = generateSmartResponse;
window.getAgentStats = getAgentStats;
window.getOverallStats = getOverallStats;
window.exportLearningData = exportLearningData;
window.importLearningData = importLearningData;
window.resetLearningData = resetLearningData;
window.renderLearningStatsRL = renderLearningStats;
window.addFeedbackButtonsToMessages = addFeedbackButtonsToMessages;
window.isMemoryAvailable = isMemoryAvailable;
window.syncWithCloud = syncWithCloud;
window.renderFeedbackChart = renderFeedbackChart;
window.updateAnomalyBadge = updateAnomalyBadge;
window.predictFuture = predictFuture;
window.collaborateAgents = collaborateAgents;
window.exportEncryptedData = exportEncryptedData;
window.importEncryptedData = importEncryptedData;
window.QLearningEngine = QLearningEngine;
window.RLCache = RLCache;
window.syncFromMemory = syncFromMemory;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    setTimeout(init, 500);
}

InternalLogger.info('AI Feedback', 'Reinforcement learning module ready');
})();
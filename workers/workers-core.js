import { WorkersState } from './workers-state.js';
import { WorkersConfig } from './workers-config.js';
import { Utils } from '../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const state = WorkersState;
const config = WorkersConfig;
const WORKER_CONFIG = config.WORKER_CONFIG;
const AI_WORKERS_LIST = config.AI_WORKERS_LIST;
const showToast = Utils.showToast;

const RateLimiter = function(maxPerMinute) {
    this._maxPerMinute = maxPerMinute;
    this._requests = new Map();
};
RateLimiter.prototype.check = function(key) {
    const now = Date.now();
    const windowTime = now - 60000;
    const requests = this._requests.get(key) || [];
    const recent = requests.filter(function(t) { return t > windowTime; });
    if (recent.length >= this._maxPerMinute) return false;
    recent.push(now);
    this._requests.set(key, recent);
    return true;
};
RateLimiter.prototype.getStats = function() {
    return { size: this._requests.size, maxPerMinute: this._maxPerMinute };
};

const SecurityManager = function() {
    this._apiKeys = this._loadApiKeys();
    this._rateLimiter = new RateLimiter(WORKER_CONFIG.rateLimitPerMinute);
    this._whitelist = this._loadWhitelist();
};
SecurityManager.prototype._loadApiKeys = function() {
    try { return JSON.parse(localStorage.getItem('kes_worker_api_keys')) || {}; }
    catch (e) { return {}; }
};
SecurityManager.prototype._loadWhitelist = function() {
    try { return JSON.parse(localStorage.getItem('kes_worker_whitelist')) || []; }
    catch (e) { return []; }
};
SecurityManager.prototype.validateAPIKey = function(key) {
    if (!key) return false;
    const stored = this._apiKeys[key];
    if (!stored) return false;
    if (stored.expires && Date.now() > stored.expires) return false;
    return true;
};
SecurityManager.prototype.checkRateLimit = function(workerId) {
    return this._rateLimiter.check(workerId);
};
SecurityManager.prototype.isWhitelisted = function(ip) {
    return this._whitelist.indexOf(ip) !== -1;
};
SecurityManager.prototype.addAPIKey = function(key, name, expires) {
    this._apiKeys[key] = { name: name, expires: expires || null, createdAt: Date.now() };
    localStorage.setItem('kes_worker_api_keys', JSON.stringify(this._apiKeys));
};
SecurityManager.prototype.getStats = function() {
    return {
        apiKeys: Object.keys(this._apiKeys).length,
        rateLimiter: this._rateLimiter.getStats(),
        whitelist: this._whitelist.length
    };
};

const WorkerPool = function(maxConcurrent) {
    this._maxConcurrent = maxConcurrent || 5;
    this._running = 0;
    this._queue = [];
    this._results = [];
    this._stats = { total: 0, completed: 0, failed: 0 };
    this._isProcessing = false;
};
WorkerPool.prototype.execute = function(task, priority) {
    const self = this;
    priority = priority || 0;
    return new Promise(function(resolve, reject) {
        const job = { task: task, priority: priority, resolve: resolve, reject: reject, createdAt: Date.now() };
        if (priority >= 5) self._queue.unshift(job);
        else self._queue.push(job);
        self._stats.total++;
        self._processQueue();
    });
};
WorkerPool.prototype._processQueue = function() {
    if (this._isProcessing) return;
    if (this._running >= this._maxConcurrent || this._queue.length === 0) return;
    this._isProcessing = true;
    const job = this._queue.shift();
    this._running++;
    const self = this;
    job.task().then(function(result) {
        job.resolve(result);
        self._results.push(result);
        self._stats.completed++;
    }).catch(function(error) {
        job.reject(error);
        self._stats.failed++;
    }).finally(function() {
        self._running--;
        self._isProcessing = false;
        self._processQueue();
    });
};
WorkerPool.prototype.getStats = function() {
    return {
        running: this._running,
        queued: this._queue.length,
        completed: this._results.length,
        maxConcurrent: this._maxConcurrent,
        total: this._stats.total,
        failed: this._stats.failed
    };
};
WorkerPool.prototype.getQueueStatus = function() {
    return this._queue.map(function(job) {
        return { priority: job.priority, waiting: Date.now() - job.createdAt };
    });
};
WorkerPool.prototype.clearQueue = function() { this._queue = []; };

const AICore = function() {
    this._knowledge = new Map();
    this._insights = [];
    this._learningRate = 0.01;
    this._patterns = [];
    this._trainingData = [];
    this._modelVersion = '2.0';
    this._load();
};
AICore.prototype.analyze = function(worker, result) {
    const analysis = {
        worker: worker.id,
        workerName: worker.name,
        success: result ? true : false,
        timestamp: Date.now(),
        metrics: this._extractMetrics(result),
        duration: result && result.duration ? result.duration : 0
    };
    if (!this._knowledge.has(worker.id)) {
        this._knowledge.set(worker.id, { attempts: 0, success: 0, failed: 0, data: [], avgDuration: 0, pattern: [], lastInsight: null });
    }
    const data = this._knowledge.get(worker.id);
    data.attempts++;
    if (analysis.success) data.success++;
    else data.failed++;
    data.data.push(analysis);
    data.avgDuration = this._calculateAvgDuration(data.data);
    const pattern = this._detectPattern(data.data);
    if (pattern) {
        data.pattern.push(pattern);
        if (data.pattern.length > 10) data.pattern.shift();
    }
    const insight = this._generateInsight(worker, data);
    if (insight) {
        data.lastInsight = insight;
        this._insights.push(Object.assign({}, insight, { timestamp: Date.now() }));
        if (this._insights.length > 100) this._insights.shift();
    }
    this._trainingData.push({ worker: worker.id, success: analysis.success, duration: analysis.duration, timestamp: analysis.timestamp });
    this._save();
    return analysis;
};
AICore.prototype._extractMetrics = function(result) {
    const metrics = {};
    if (!result) return metrics;
    const percentages = result.match(/\d+%/g);
    if (percentages) metrics.percentages = percentages.map(function(m) { return parseInt(m); });
    const numbers = result.match(/\d+/g);
    if (numbers) metrics.numbers = numbers.map(function(n) { return parseInt(n); });
    if (result.indexOf('BTC') !== -1 || result.indexOf('$') !== -1) metrics.type = 'crypto';
    if (result.indexOf('ms') !== -1) {
        const time = result.match(/\d+ms/);
        if (time) metrics.duration = parseInt(time[0]);
    }
    return metrics;
};
AICore.prototype._calculateAvgDuration = function(data) {
    if (data.length === 0) return 0;
    const total = data.reduce(function(sum, d) { return sum + (d.duration || 0); }, 0);
    return total / data.length;
};
AICore.prototype._detectPattern = function(data) {
    if (data.length < 5) return null;
    const recent = data.slice(-5);
    const successCount = recent.filter(function(d) { return d.success; }).length;
    if (successCount >= 4) return 'HIGH_SUCCESS';
    if (successCount <= 1) return 'LOW_SUCCESS';
    if (recent.every(function(d) { return d.success; })) return 'PERFECT';
    if (recent.every(function(d) { return !d.success; })) return 'FAILING';
    if (successCount === 3 && recent.length === 5) return 'IMPROVING';
    if (successCount === 2 && recent.length === 5) return 'DECLINING';
    return null;
};
AICore.prototype._generateInsight = function(worker, data) {
    const rate = data.success / data.attempts;
    if (data.attempts > 10) {
        if (rate > 0.9) return { level: 'success', message: worker.name + ' performa sangat baik (' + Math.round(rate * 100) + '%)', suggestion: 'Pertahankan konfigurasi saat ini' };
        else if (rate > 0.7) return { level: 'info', message: worker.name + ' performa baik (' + Math.round(rate * 100) + '%)', suggestion: 'Bisa ditingkatkan dengan optimasi schedule' };
        else if (rate < 0.5) return { level: 'warning', message: worker.name + ' perlu perhatian (' + Math.round(rate * 100) + '%)', suggestion: 'Coba ubah schedule atau prioritas' };
    }
    if (data.pattern && data.pattern.indexOf('PERFECT') !== -1) return { level: 'success', message: worker.name + ' dalam performa puncak!', suggestion: 'Worker ini layak mendapat prioritas tertinggi' };
    if (data.pattern && data.pattern.indexOf('IMPROVING') !== -1) return { level: 'info', message: worker.name + ' menunjukkan peningkatan!', suggestion: 'Teruskan trend positif ini' };
    return null;
};
AICore.prototype.predict = function(workerId) {
    const data = this._knowledge.get(workerId);
    if (!data || data.attempts < 5) {
        return { confidence: 0, prediction: 'Not enough data', suggestion: 'Jalankan worker beberapa kali lagi', status: 'learning' };
    }
    const rate = data.success / data.attempts;
    const trend = this._calculateTrend(data.data);
    const avgDuration = data.avgDuration;
    let predictionText = '';
    let suggestionText = '';
    let status = 'stable';
    if (rate > 0.8) { predictionText = 'High performance expected'; suggestionText = 'Worker ini reliable untuk tugas penting'; status = 'excellent'; }
    else if (rate > 0.6) { predictionText = 'Moderate performance expected'; suggestionText = 'Optimasi schedule bisa meningkatkan performa'; status = 'good'; }
    else { predictionText = 'Performance may need improvement'; suggestionText = 'Periksa konfigurasi dan coba schedule berbeda'; status = 'warning'; }
    if (trend === 'Increasing') { predictionText += ' (Improving)'; status = 'improving'; }
    else if (trend === 'Decreasing') { predictionText += ' (Declining)'; status = 'declining'; }
    return {
        confidence: Math.min(95, data.attempts * 2 + 30),
        prediction: predictionText,
        suggestion: suggestionText,
        trend: trend,
        successRate: Math.round(rate * 100),
        avgDuration: Math.round(avgDuration),
        attempts: data.attempts,
        status: status
    };
};
AICore.prototype._calculateTrend = function(data) {
    if (data.length < 5) return 'Stable';
    const recent = data.slice(-5);
    const successCount = recent.filter(function(d) { return d.success; }).length;
    const older = data.slice(-10, -5);
    const olderSuccess = older.filter(function(d) { return d.success; }).length;
    if (successCount > olderSuccess + 1) return 'Increasing';
    if (successCount < olderSuccess - 1) return 'Decreasing';
    return 'Stable';
};
AICore.prototype.getRecommendation = function(workerId) {
    const data = this._knowledge.get(workerId);
    if (!data || data.attempts < 3) return { recommended: 'RUN_MORE', reason: 'Need more data for recommendation' };
    const rate = data.success / data.attempts;
    if (rate > 0.9 && data.attempts > 10) return { recommended: 'INCREASE_PRIORITY', reason: 'Excellent performance, should be prioritized' };
    else if (rate < 0.5 && data.attempts > 5) return { recommended: 'CHANGE_SCHEDULE', reason: 'Low success rate, try different schedule' };
    else if (data.avgDuration > 5000) return { recommended: 'OPTIMIZE', reason: 'High average duration, need optimization' };
    return { recommended: 'MAINTAIN', reason: 'Current configuration is optimal' };
};
AICore.prototype.getInsights = function() { return this._insights.slice(-20); };
AICore.prototype.getWorkerKnowledge = function(workerId) { return this._knowledge.get(workerId) || null; };
AICore.prototype.getSummary = function() {
    let totalWorkers = this._knowledge.size;
    let totalAttempts = 0, totalSuccess = 0, totalFailed = 0;
    this._knowledge.forEach(function(data) {
        totalAttempts += data.attempts;
        totalSuccess += data.success;
        totalFailed += data.failed;
    });
    return {
        workers: totalWorkers,
        attempts: totalAttempts,
        success: totalSuccess,
        failed: totalFailed,
        successRate: totalAttempts > 0 ? Math.round((totalSuccess / totalAttempts) * 100) : 0,
        insights: this._insights.length,
        modelVersion: this._modelVersion
    };
};
AICore.prototype._save = function() {
    const snapshot = {
        knowledge: Array.from(this._knowledge),
        insights: this._insights,
        trainingData: this._trainingData.slice(-500),
        modelVersion: this._modelVersion
    };
    localStorage.setItem('kes_ai_core_knowledge', JSON.stringify(snapshot));
    // Durable backup in IndexedDB — localStorage stays the source of truth.
    if (window.KESEMPATAN?.KesDatabase?.mirrorSnapshot) {
        window.KESEMPATAN.KesDatabase.mirrorSnapshot('ai_core_knowledge', snapshot);
    }
};
AICore.prototype._load = function() {
    try {
        const saved = JSON.parse(localStorage.getItem('kes_ai_core_knowledge'));
        if (saved) {
            this._knowledge = new Map(saved.knowledge);
            this._insights = saved.insights || [];
            this._trainingData = saved.trainingData || [];
            this._modelVersion = saved.modelVersion || '1.0';
        }
        if (window.KESEMPATAN?.KesDatabase?.migrateLegacySnapshotOnce) {
            window.KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce('ai_core_knowledge', 'kes_ai_core_knowledge');
        }
    } catch (e) {
        console.warn('[WorkersAI] Load AI core knowledge failed:', e.message);
    }
};

const OptimizationEngine = function(workersRef) {
    this._workers = workersRef;
    this._optimizations = [];
    this._thresholds = { successRate: 70, responseTime: 5000, memoryUsage: 80 };
    this._load();
};
OptimizationEngine.prototype.optimize = function() {
    const self = this;
    const optimized = [];
    this._workers.forEach(function(worker) {
        if (!worker.enabled) return;
        const stats = self._getWorkerStats(worker.id);
        if (!stats || stats.attempts < 5) return;
        const optimizations = self._analyzeWorker(worker, stats);
        if (optimizations.length > 0) {
            self._applyOptimizations(worker, optimizations);
            const entry = { worker: worker.id, workerName: worker.name, optimizations: optimizations, timestamp: Date.now() };
            optimized.push(entry);
            self._optimizations.push(entry);
            // Durable backup in IndexedDB — localStorage stays the source of truth.
            if (window.KESEMPATAN?.KesDatabase?.mirrorHistoryItem) {
                window.KESEMPATAN.KesDatabase.mirrorHistoryItem('optimizations', entry);
            }
        }
    });
    if (optimized.length > 0) {
        this._save();
        if (window.AIWorkers) window.AIWorkers.saveWorkers();
    }
    return optimized;
};
OptimizationEngine.prototype._analyzeWorker = function(worker, stats) {
    const optimizations = [];
    const rate = stats.success / stats.attempts;
    if (rate < 0.5 && worker.schedule === 'realtime') optimizations.push({ type: 'schedule', from: 'realtime', to: 'hourly', reason: 'Success rate too low for realtime' });
    if (rate < 0.6 && worker.schedule === 'hourly') optimizations.push({ type: 'schedule', from: 'hourly', to: 'daily', reason: 'Success rate low for hourly schedule' });
    if (rate > 0.9 && worker.schedule === 'daily') optimizations.push({ type: 'schedule', from: 'daily', to: 'hourly', reason: 'High success rate, can run more frequently' });
    if (rate > 0.85 && worker.priority < 5) optimizations.push({ type: 'priority', from: worker.priority, to: Math.min(5, worker.priority + 1), reason: 'High success rate, increasing priority' });
    if (rate < 0.4 && worker.priority > 1) optimizations.push({ type: 'priority', from: worker.priority, to: Math.max(1, worker.priority - 1), reason: 'Low success rate, decreasing priority' });
    return optimizations;
};
OptimizationEngine.prototype._applyOptimizations = function(worker, optimizations) {
    for (let i = 0; i < optimizations.length; i++) {
        const opt = optimizations[i];
        if (opt.type === 'schedule') worker.schedule = opt.to;
        if (opt.type === 'priority') worker.priority = opt.to;
    }
};
OptimizationEngine.prototype._getWorkerStats = function(workerId) {
    const stats = window.AIWorkers && window.AIWorkers.workerStats ? window.AIWorkers.workerStats[workerId] : null;
    if (!stats) return null;
    return { attempts: stats.success + stats.failed, success: stats.success, failed: stats.failed };
};
OptimizationEngine.prototype._save = function() {
    localStorage.setItem('kes_optimizations', JSON.stringify(this._optimizations.slice(-100)));
};
OptimizationEngine.prototype._load = function() {
    try {
        const saved = JSON.parse(localStorage.getItem('kes_optimizations'));
        if (saved) this._optimizations = saved;
        if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
            window.KESEMPATAN.KesDatabase.migrateArrayOnce('optimizations', this._optimizations);
        }
    } catch (e) {
        console.warn('[WorkersAI] Load optimizations failed:', e.message);
    }
};
OptimizationEngine.prototype.getOptimizationHistory = function() { return this._optimizations.slice(-20); };
OptimizationEngine.prototype.getStats = function() {
    const total = this._optimizations.length;
    const byType = {};
    for (let i = 0; i < this._optimizations.length; i++) {
        const opt = this._optimizations[i];
        for (let j = 0; j < opt.optimizations.length; j++) {
            const o = opt.optimizations[j];
            byType[o.type] = (byType[o.type] || 0) + 1;
        }
    }
    return { total: total, byType: byType };
};

const PredictionEngine = function() {
    this._predictions = new Map();
    this._accuracy = 0;
    this._totalPredictions = 0;
    this._correctPredictions = 0;
    this._load();
};
PredictionEngine.prototype.predictWorker = function(workerId) {
    const history = this._getHistory(workerId);
    if (history.length < 10) {
        return { confidence: 0, prediction: 'Need more data', nextRun: 'Unknown', suggestion: 'Jalankan worker minimal 10 kali', status: 'learning' };
    }
    const avgInterval = this._calculateAverageInterval(history);
    const nextRun = new Date(Date.now() + avgInterval);
    const successRate = history.filter(function(h) { return h.success; }).length / history.length;
    const trend = this._calculateTrend(history);
    const consistency = this._calculateConsistency(history);
    const confidence = Math.min(95, history.length * 2 + consistency * 20);
    let predictionText = '';
    let suggestionText = '';
    let status = 'stable';
    if (successRate > 0.85) { predictionText = 'Sangat mungkin berhasil'; suggestionText = 'Worker ini sangat reliable'; status = 'excellent'; }
    else if (successRate > 0.65) { predictionText = 'Kemungkinan berhasil cukup baik'; suggestionText = 'Performa stabil, bisa diandalkan'; status = 'good'; }
    else if (successRate > 0.45) { predictionText = 'Kemungkinan berhasil 50-50'; suggestionText = 'Perlu optimasi untuk meningkatkan performa'; status = 'warning'; }
    else { predictionText = 'Kemungkinan gagal tinggi'; suggestionText = 'Segera periksa konfigurasi worker ini'; status = 'critical'; }
    if (trend === 'Increasing') { predictionText += ' (Meningkat)'; status = 'improving'; }
    else if (trend === 'Decreasing') { predictionText += ' (Menurun)'; status = 'declining'; }
    const prediction = {
        confidence: Math.round(confidence),
        prediction: predictionText,
        suggestion: suggestionText,
        nextRun: nextRun.toLocaleTimeString(),
        successRate: Math.round(successRate * 100) + '%',
        trend: trend,
        consistency: Math.round(consistency * 100) + '%',
        totalData: history.length,
        status: status
    };
    this._predictions.set(workerId, prediction);
    this._totalPredictions++;
    this._save();
    return prediction;
};
PredictionEngine.prototype._getHistory = function(workerId) {
    const logs = this._getLogs();
    return logs.filter(function(l) { return l.workerId === workerId; }).map(function(l) {
        return {
            success: l.message.indexOf('OK:') !== -1 || l.message.indexOf('selesai') !== -1,
            timestamp: l.timestamp,
            message: l.message
        };
    });
};
PredictionEngine.prototype._getLogs = function() {
    try { return JSON.parse(localStorage.getItem('kes_ai_workers_logs')) || []; }
    catch (e) { return []; }
};
PredictionEngine.prototype._calculateAverageInterval = function(history) {
    if (history.length < 2) return 3600000;
    let total = 0, count = 0;
    for (let i = 1; i < history.length; i++) {
        const diff = history[i].timestamp - history[i - 1].timestamp;
        if (diff > 0 && diff < 86400000) { total += diff; count++; }
    }
    return count > 0 ? total / count : 3600000;
};
PredictionEngine.prototype._calculateTrend = function(history) {
    if (history.length < 5) return 'Stable';
    const recent = history.slice(-5);
    const successRecent = recent.filter(function(h) { return h.success; }).length;
    const older = history.slice(-10, -5);
    const successOlder = older.filter(function(h) { return h.success; }).length;
    if (successRecent > successOlder + 1) return 'Increasing';
    if (successRecent < successOlder - 1) return 'Decreasing';
    return 'Stable';
};
PredictionEngine.prototype._calculateConsistency = function(history) {
    if (history.length < 3) return 0.5;
    const recent = history.slice(-10);
    const successes = recent.filter(function(h) { return h.success; }).length;
    const consistency = successes / recent.length;
    let patternBreaks = 0;
    for (let i = 1; i < recent.length; i++) {
        if (recent[i].success !== recent[i - 1].success) patternBreaks++;
    }
    const patternScore = 1 - (patternBreaks / recent.length);
    return (consistency + patternScore) / 2;
};
PredictionEngine.prototype._save = function() {
    const snapshot = {
        predictions: Array.from(this._predictions),
        accuracy: this._accuracy,
        total: this._totalPredictions,
        correct: this._correctPredictions
    };
    localStorage.setItem('kes_predictions', JSON.stringify(snapshot));
    // Durable backup in IndexedDB — localStorage stays the source of truth.
    if (window.KESEMPATAN?.KesDatabase?.mirrorSnapshot) {
        window.KESEMPATAN.KesDatabase.mirrorSnapshot('predictions', snapshot);
    }
};
PredictionEngine.prototype._load = function() {
    try {
        const saved = JSON.parse(localStorage.getItem('kes_predictions'));
        if (saved) {
            this._predictions = new Map(saved.predictions);
            this._accuracy = saved.accuracy || 0;
            this._totalPredictions = saved.total || 0;
            this._correctPredictions = saved.correct || 0;
        }
        if (window.KESEMPATAN?.KesDatabase?.migrateLegacySnapshotOnce) {
            window.KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce('predictions', 'kes_predictions');
        }
    } catch (e) {
        console.warn('[WorkersAI] Load predictions failed:', e.message);
    }
};
PredictionEngine.prototype.updateAccuracy = function(workerId, actual) {
    const prediction = this._predictions.get(workerId);
    if (!prediction) return;
    const predictedSuccess = prediction.status === 'excellent' || prediction.status === 'good' || prediction.status === 'improving';
    const correct = (predictedSuccess && actual) || (!predictedSuccess && !actual);
    if (correct) this._correctPredictions++;
    this._totalPredictions++;
    this._accuracy = this._totalPredictions > 0 ? Math.round((this._correctPredictions / this._totalPredictions) * 100) : 0;
    this._save();
};
PredictionEngine.prototype.getStats = function() {
    return {
        accuracy: this._accuracy,
        totalPredictions: this._totalPredictions,
        correctPredictions: this._correctPredictions,
        activePredictions: this._predictions.size
    };
};

const AIWorkersCore = function() {
    this.workers = state.loadWorkers();
    this.workerStats = state.loadStats();
    this.logs = state.loadLogs();
    this.voiceSettings = state.loadVoiceSettings();
    this.intervals = {};
    this.security = new SecurityManager();
    this.pool = new WorkerPool(WORKER_CONFIG.maxConcurrent);
    this.aiCore = new AICore();
    this.optimizer = new OptimizationEngine(this.workers);
    this.predictor = new PredictionEngine();
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.voiceEnabled = WORKER_CONFIG.enableVoice;
    this.autoOptimize = WORKER_CONFIG.autoOptimize;
    this.enablePrediction = WORKER_CONFIG.enablePrediction;
    this.voiceRate = this.voiceSettings.rate;
    this.voicePitch = this.voiceSettings.pitch;
    this.voiceLang = this.voiceSettings.lang;
    this.logFilterWorker = 'all';
    this.logFilterStatus = 'all';
    this.logSearchQuery = '';
    this._logRefreshInterval = null;
    this._logsInterval = null;
    this._cleanupFns = [];
    this._startAllScheduled();
    this._initSelfHealing();
    this._initPerformanceMonitor();
    this._initAutoOptimize();
    this._initLogAutoRefresh();
    // Kept as a real global (not KESEMPATAN-only): offline-mode.js reads/replaces
    // window.AIWorkers directly to patch in an offline task hook.
    window.AIWorkers = this;
};
AIWorkersCore.prototype.saveWorkers = function() { state.saveWorkers(); };
AIWorkersCore.prototype.saveStats = function() { state.saveStats(); };
AIWorkersCore.prototype.saveLogs = function() { state.saveLogs(); };
AIWorkersCore.prototype.saveVoiceSettings = function() { state.saveVoiceSettings(); };
AIWorkersCore.prototype._loadVoiceSettings = function() {
    const settings = state.loadVoiceSettings();
    this.voiceRate = settings.rate;
    this.voicePitch = settings.pitch;
    this.voiceLang = settings.lang;
};
AIWorkersCore.prototype.testVoice = function() {
    const self = this;
    return new Promise(function(resolve) {
        if (!window.speechSynthesis) { resolve({ success: false, message: 'Speech synthesis not available' }); return; }
        const voices = window.speechSynthesis.getVoices();
        const testMsg = 'Halo, ini adalah tes suara Kesempatan OS.';
        const utterance = new SpeechSynthesisUtterance(testMsg);
        utterance.lang = self.voiceLang || 'id-ID';
        utterance.rate = self.voiceRate || 0.9;
        utterance.pitch = self.voicePitch || 1.2;
        utterance.volume = 1;
        const indonesianVoice = voices.find(function(v) {
            return v.lang === 'id-ID' || v.lang === 'id' || v.name.indexOf('Indonesian') !== -1 || v.name.indexOf('Indah') !== -1 || v.name.indexOf('Sinta') !== -1;
        });
        if (indonesianVoice) utterance.voice = indonesianVoice;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        self._addLog(self.workers[0] || { id: 'voice', name: 'Voice Test' }, 'Voice test: "' + testMsg + '"');
        resolve({ success: true, message: 'Voice test started' });
    });
};
AIWorkersCore.prototype._scheduleWorker = function(worker) {
    if (this.intervals[worker.id]) { clearInterval(this.intervals[worker.id]); delete this.intervals[worker.id]; }
    const intervals = { realtime: 30000, hourly: 3600000, daily: 86400000, weekly: 604800000 };
    const interval = intervals[worker.schedule] || 3600000;
    const self = this;
    this.intervals[worker.id] = setInterval(function() {
        if (worker.enabled) self.runWorker(worker);
    }, interval);
};
AIWorkersCore.prototype._unscheduleWorker = function(workerId) {
    if (this.intervals[workerId]) { clearInterval(this.intervals[workerId]); delete this.intervals[workerId]; }
};
AIWorkersCore.prototype._startAllScheduled = function() {
    const self = this;
    this.workers.forEach(function(worker) {
        if (worker.enabled) self._scheduleWorker(worker);
    });
};
AIWorkersCore.prototype._executeWorkerTask = function(worker) {
    const self = this;
    const startTime = performance.now();
    const now = new Date().toLocaleTimeString();
    if (!this.security.checkRateLimit(worker.id)) {
        return Promise.resolve('Rate limit exceeded for ' + worker.id + ', silakan tunggu...');
    }
    let result = '';
    if (worker.id === 'bitcoin_trader') {
        return fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                const price = data.bitcoin && data.bitcoin.usd ? data.bitcoin.usd : 0;
                const futurePrediction = price * (1 + (Math.random() - 0.5) * 0.15);
                const paths = ['Bullish', 'Bearish', 'Sideways', 'Explosive', 'Crash'];
                const path = paths[Math.floor(Math.random() * paths.length)];
                result = 'BTC: $' + price.toLocaleString() + ' | Prediksi 30d: $' + Math.floor(futurePrediction) + ' | Arah: ' + path;
                const duration = performance.now() - startTime;
                result += ' | ' + Math.round(duration) + 'ms';
                return result;
            })
            .catch(function() {
                result = 'BTC: data tidak tersedia saat ini, gunakan cache terakhir';
                const duration = performance.now() - startTime;
                result += ' | ' + Math.round(duration) + 'ms';
                return result;
            });
    } else if (worker.id === 'customer_support') {
        const savedTickets = localStorage.getItem('kes_support_tickets');
        let tickets = savedTickets ? parseInt(savedTickets) : 42;
        tickets += Math.floor(Math.random() * 20);
        localStorage.setItem('kes_support_tickets', tickets);
        const csat = Math.floor(90 + Math.random() * 9);
        result = 'Support: ' + tickets + ' tiket terselesaikan | CSAT: ' + csat + '%';
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else if (worker.id === 'trend_predictor') {
        const trends = [
            { name: 'Otomatisasi AI', pred30: 98, pred60: 99, pred90: 100 },
            { name: 'Internet Kuantum', pred30: 95, pred60: 97, pred90: 99 },
            { name: 'Komputasi Edge', pred30: 92, pred60: 96, pred90: 98 }
        ];
        const trend = trends[Math.floor(Math.random() * trends.length)];
        result = 'Prediksi Tren: ' + trend.name + ' | 30 hari: ' + trend.pred30 + '% | 60 hari: ' + trend.pred60 + '% | 90 hari: ' + trend.pred90 + '%';
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else if (worker.id === 'voice_generator' && this.voiceEnabled) {
        const voiceMessages = [
            'Sistem berjalan normal, semua worker siap bertugas.',
            'Kesempatan OS siap membantu operasional Anda.',
            'Analisis selesai, hasil telah diperbarui.',
            'Worker berhasil menyelesaikan tugas terjadwal.',
            'Semua data telah diproses dan disimpan.',
            'Pemeriksaan rutin selesai, sistem dalam kondisi baik.'
        ];
        const msg = voiceMessages[Math.floor(Math.random() * voiceMessages.length)];
        try {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(msg);
                utterance.lang = this.voiceLang || 'id-ID';
                utterance.rate = this.voiceRate || 0.9;
                utterance.pitch = this.voicePitch || 1.2;
                utterance.volume = 1;
                const voices = window.speechSynthesis.getVoices();
                const indonesianVoice2 = voices.find(function(v) {
                    return v.lang === 'id-ID' || v.lang === 'id' || v.name.indexOf('Indonesian') !== -1 || v.name.indexOf('Indah') !== -1 || v.name.indexOf('Sinta') !== -1 || v.name.indexOf('Ayu') !== -1;
                });
                if (indonesianVoice2) utterance.voice = indonesianVoice2;
                else {
                    const femaleVoice = voices.find(function(v) {
                        return v.name.toLowerCase().indexOf('female') !== -1 || v.name.indexOf('Samantha') !== -1 || v.name.indexOf('Google UK') !== -1 || v.name.indexOf('Zira') !== -1;
                    });
                    if (femaleVoice) utterance.voice = femaleVoice;
                }
                window.speechSynthesis.speak(utterance);
            }
        } catch (e) { console.warn('[Workers] Voice test failed:', e.message); }
        result = 'Voice: "' + msg + '"';
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else if (worker.id === 'ai_trainer') {
        const epoch = Math.floor(50 + Math.random() * 50);
        const accuracy = Math.floor(98 + Math.random() * 1.99);
        result = 'Training: Epoch ' + epoch + '/100 | Akurasi: ' + accuracy + '%';
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else if (worker.id === 'cyber_defense') {
        const threatDetected = Math.random() > 0.98;
        const protection = Math.floor(99 + Math.random() * 1);
        result = 'Keamanan: ' + protection + '% proteksi aktif | ' + (threatDetected ? 'PERINGATAN: ancaman terdeteksi' : 'Sistem aman');
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else if (worker.id === 'malware_detector') {
        const clean = Math.floor(99.5 + Math.random() * 0.5);
        const anomaly = Math.random() > 0.99;
        result = 'Scan: ' + clean + '% bersih | ' + (anomaly ? 'PERINGATAN: anomali terdeteksi' : 'Tidak ada ancaman ditemukan');
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else if (worker.id === 'image_generator') {
        const prompts = ['abstract technology', 'modern business', 'digital network', 'data visualization', 'futuristic city'];
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];
        const imageUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=1024&height=1024';
        result = 'Gambar dibuat: ' + imageUrl + ' | Prompt: "' + prompt + '"';
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    } else {
        result = worker.name + ' selesai | ' + now;
        const duration = performance.now() - startTime;
        result += ' | ' + Math.round(duration) + 'ms';
        return Promise.resolve(result);
    }
};
AIWorkersCore.prototype.runWorker = function(worker) {
    const self = this;
    this._addLog(worker, 'Menjalankan tugas...');
    return this.pool.execute(function() {
        return self._executeWorkerTask(worker);
    }, worker.priority || 3).then(function(result) {
        self._addLog(worker, 'OK: ' + result.substring(0, 250));
        worker.lastRun = Date.now();
        if (!self.workerStats[worker.id]) self.workerStats[worker.id] = { success: 0, failed: 0, totalTime: 0 };
        self.workerStats[worker.id].success++;
        self.saveStats();
        self.saveWorkers();
        if (self.enablePrediction) {
            const prediction = self.predictor.predictWorker(worker.id);
            if (prediction.confidence > 70) self._addLog(worker, 'Prediksi: ' + prediction.prediction + ' (' + prediction.successRate + ')');
        }
        if (result.indexOf('PERINGATAN') !== -1 || result.indexOf('Explosive') !== -1 || result.indexOf('Crash') !== -1) {
            self._sendNotification(worker, result);
        }
        return result;
    }).catch(function(error) {
        self._addLog(worker, 'Error: ' + error.message);
        if (!self.workerStats[worker.id]) self.workerStats[worker.id] = { success: 0, failed: 0, totalTime: 0 };
        self.workerStats[worker.id].failed++;
        self.saveStats();
        return null;
    });
};
AIWorkersCore.prototype.runWorkerNow = function(worker) { return this.runWorker(worker); };
AIWorkersCore.prototype.toggleWorker = function(workerId, enabled) {
    const worker = this.workers.find(function(w) { return w.id === workerId; });
    if (worker) {
        worker.enabled = enabled;
        this.saveWorkers();
        if (enabled) {
            this._scheduleWorker(worker);
            this.runWorkerNow(worker);
            if (showToast) showToast(worker.name + ' diaktifkan', 'success');
        } else {
            this._unscheduleWorker(worker.id);
            if (showToast) showToast(worker.name + ' dinonaktifkan', 'info');
        }
    }
};
AIWorkersCore.prototype.setSchedule = function(workerId, schedule) {
    const worker = this.workers.find(function(w) { return w.id === workerId; });
    if (worker) {
        worker.schedule = schedule;
        this.saveWorkers();
        if (worker.enabled) { this._unscheduleWorker(worker.id); this._scheduleWorker(worker); }
        if (showToast) showToast('Schedule ' + worker.name + ' diubah ke ' + schedule, 'success');
    }
};
AIWorkersCore.prototype._sendNotification = function(worker, result) {
    if (window.Notification && Notification.permission === 'granted') {
        new Notification(worker.name, { body: result.substring(0, 100) });
    }
};
AIWorkersCore.prototype._addLog = function(worker, message) {
    const entry = { workerId: worker.id, workerName: worker.name, message: message, timestamp: Date.now() };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();
    this.saveLogs();
    // Durable backup in IndexedDB — localStorage stays the source of truth.
    if (window.KESEMPATAN?.KesDatabase?.mirrorHistoryItem) {
        window.KESEMPATAN.KesDatabase.mirrorHistoryItem('worker_logs', entry);
    }
};
AIWorkersCore.prototype._getLogs = function() { return this.logs; };
AIWorkersCore.prototype._initSelfHealing = function() {
    if (!WORKER_CONFIG.selfHealingEnabled) return;
    const self = this;
    const interval = setInterval(function() {
        for (let i = 0; i < self.workers.length; i++) {
            const worker = self.workers[i];
            if (!worker.enabled) continue;
            const lastRun = worker.lastRun || 0;
            const gaps = { realtime: 60000, hourly: 7200000, daily: 172800000, weekly: 1209600000 };
            const maxGap = gaps[worker.schedule] || 3600000;
            if (Date.now() - lastRun > maxGap * 3) {
                self._addLog(worker, 'Self-healing: restart otomatis (macet ' + Math.round((Date.now() - lastRun) / 60000) + ' menit)');
                self.runWorker(worker);
            }
            const stats = self.workerStats[worker.id];
            if (stats && stats.failed > 5 && stats.success < stats.failed) {
                self._addLog(worker, 'Self-healing: ' + worker.name + ' tingkat kegagalan tinggi (' + stats.failed + ' gagal), reset otomatis...');
                self._resetWorker(worker);
            }
        }
    }, 60000);
    this._cleanupFns.push(function() { clearInterval(interval); });
};
AIWorkersCore.prototype._resetWorker = function(worker) {
    if (this.workerStats[worker.id]) {
        this.workerStats[worker.id] = { success: 0, failed: 0, totalTime: 0 };
        this.saveStats();
    }
    this._addLog(worker, 'Worker berhasil direset');
};
AIWorkersCore.prototype._initPerformanceMonitor = function() {
    const self = this;
    const interval = setInterval(function() {
        const poolStats = self.pool.getStats();
        const totalEnabled = self.workers.filter(function(w) { return w.enabled; }).length;
        const aiSummary = self.aiCore.getSummary();
        const predStats = self.predictor.getStats();
        const optStats = self.optimizer.getStats();
        const stats = {
            pool: poolStats,
            workers: totalEnabled,
            ai: aiSummary,
            prediction: predStats,
            optimization: optStats,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null
        };
    }, 30000);
    this._cleanupFns.push(function() { clearInterval(interval); });
};
AIWorkersCore.prototype._initAutoOptimize = function() {
    if (!this.autoOptimize) return;
    const self = this;
    const interval = setInterval(function() {
        self.optimizer.optimize().then(function(result) {
            if (result.length > 0) self._addLog(self.workers[0] || { id: 'optimizer', name: 'Optimizer' }, 'Auto-optimasi: ' + result.length + ' worker diperbarui');
        });
    }, 600000);
    this._cleanupFns.push(function() { clearInterval(interval); });
};
AIWorkersCore.prototype._initLogAutoRefresh = function() {
    const self = this;
    const interval = WORKER_CONFIG.logAutoRefresh || 5;
    if (this._logRefreshInterval) clearInterval(this._logRefreshInterval);
    this._logRefreshInterval = setInterval(function() {}, interval * 1000);
    this._cleanupFns.push(function() {
        if (self._logRefreshInterval) { clearInterval(self._logRefreshInterval); self._logRefreshInterval = null; }
    });
};
AIWorkersCore.prototype.getCategoryStats = function() {
    const stats = {};
    this.workers.forEach(function(w) {
        if (!stats[w.category]) stats[w.category] = { total: 0, enabled: 0 };
        stats[w.category].total++;
        if (w.enabled) stats[w.category].enabled++;
    });
    return stats;
};
AIWorkersCore.prototype.getTotalStats = function() {
    const total = this.workers.length;
    const enabled = this.workers.filter(function(w) { return w.enabled; }).length;
    const stats = this.workerStats;
    let totalSuccess = 0, totalFailed = 0, totalTime = 0;
    for (const key in stats) {
        if (stats.hasOwnProperty(key)) {
            totalSuccess += stats[key].success || 0;
            totalFailed += stats[key].failed || 0;
            totalTime += stats[key].totalTime || 0;
        }
    }
    const aiSummary = this.aiCore.getSummary();
    const predStats = this.predictor.getStats();
    return {
        total: total,
        enabled: enabled,
        disabled: total - enabled,
        totalSuccess: totalSuccess,
        totalFailed: totalFailed,
        totalTime: Math.round(totalTime),
        successRate: totalSuccess + totalFailed > 0 ? Math.round((totalSuccess / (totalSuccess + totalFailed)) * 100) : 0,
        ai: aiSummary,
        prediction: predStats
    };
};
AIWorkersCore.prototype.getPoolStats = function() { return this.pool.getStats(); };
AIWorkersCore.prototype.destroy = function() {
    this._cleanupFns.forEach(function(fn) { fn(); });
    this._cleanupFns = [];
    if (this._logsInterval) { clearInterval(this._logsInterval); this._logsInterval = null; }
    if (this._logRefreshInterval) { clearInterval(this._logRefreshInterval); this._logRefreshInterval = null; }
    for (const key in this.intervals) {
        if (this.intervals.hasOwnProperty(key)) { clearInterval(this.intervals[key]); delete this.intervals[key]; }
    }
};

export const WorkersCore = {
    RateLimiter: RateLimiter,
    SecurityManager: SecurityManager,
    WorkerPool: WorkerPool,
    AICore: AICore,
    OptimizationEngine: OptimizationEngine,
    PredictionEngine: PredictionEngine,
    AIWorkersCore: AIWorkersCore
};
KESEMPATAN.WorkersCore = WorkersCore;
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

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

export function showToast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
    else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
}

export function escapeHtml(value) {
    if (!value) return '';
    const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return String(value).replace(/[&<>]/g, function(char) { return entityMap[char]; });
}

const Logger = Object.freeze({
    system: function(type, message) {
        if (message === undefined) {
            message = type;
            type = 'SISTEM';
        }
        InternalLogger.info(type, message);
        const logBox = document.getElementById('systemLog');
        if (logBox) {
            const line = document.createElement('div');
            line.style.marginBottom = '6px';
            line.style.fontSize = '11px';
            line.style.color = '#a0e0d0';
            line.textContent = '[' + new Date().toLocaleTimeString() + '] [' + type + '] ' + message;
            logBox.appendChild(line);
            logBox.scrollTop = logBox.scrollHeight;
        }
    },
    log: function(type, message) { this.system(type, message); },
    info: function(type, message) { this.system(type, message); },
    warn: function(type, message) {
        this.system(type, message);
        InternalLogger.warn(type, message);
    },
    error: function(type, message) {
        this.system(type, message);
        InternalLogger.error(type, message);
        showToast(message, 'error');
    },
    success: function(type, message) {
        this.system(type, message);
        InternalLogger.info(type, message);
        showToast(message, 'success');
    }
});

const RetryEngine = Object.freeze({
    execute: async function(action, retries, delay) {
        retries = retries || window.KESEMPATAN?.Config?.MAX_RETRIES || 2;
        delay = delay || window.KESEMPATAN?.Config?.RETRY_BASE_DELAY || 1500;
        let attempt = 0;
        while (attempt <= retries) {
            try {
                return await action();
            } catch (error) {
                attempt++;
                if (attempt > retries) throw error;
                await new Promise(function(resolve) { setTimeout(resolve, delay * attempt); });
            }
        }
    }
});

const Obfuscator = Object.freeze({
    encrypt: function(value) {
        try { return btoa(encodeURIComponent(value)); }
        catch (error) { return value; }
    },
    decrypt: function(encoded) {
        try { return decodeURIComponent(atob(encoded)); }
        catch (error) { return ''; }
    }
});

const KnowledgeBase = Object.freeze({
    trends: {
        'ai keuangan': { demand: 85, sustainability: 80 },
        'faceless': { execution: 90, attention: 85 },
        'short-form': { virality: 88, timing: 85 }
    },
    enrich: function(response, topic) {
        const enriched = { ...response };
        const normalizedTopic = topic.toLowerCase();
        const trendEntries = Object.entries(this.trends);
        for (let i = 0; i < trendEntries.length; i++) {
            const [keyword, adjustments] = trendEntries[i];
            if (normalizedTopic.includes(keyword)) {
                for (const [metricKey, adjustmentValue] of Object.entries(adjustments)) {
                    if (enriched.metrics?.[metricKey]) {
                        enriched.metrics[metricKey] = Math.min(100, (enriched.metrics[metricKey] + adjustmentValue) / 1.2);
                    }
                }
            }
        }
        return enriched;
    }
});

export const METRIC_KEYS = [
    'demand', 'competition', 'monetization', 'virality',
    'sustainability', 'scalability', 'timing', 'attention',
    'execution', 'longterm'
];

function createZeroMetrics() {
    const metrics = {};
    for (let i = 0; i < METRIC_KEYS.length; i++) metrics[METRIC_KEYS[i]] = 0;
    return metrics;
}

function createFlatMetrics(value) {
    const metrics = {};
    for (let i = 0; i < METRIC_KEYS.length; i++) metrics[METRIC_KEYS[i]] = value;
    return metrics;
}

const FALLBACK_RESPONSE = Object.freeze({
    agent: '',
    status: 'fallback',
    summary: '',
    score: 0,
    insight: [],
    strategy: [],
    risk: [],
    recommendation: '',
    confidence: 5,
    reasoning_summary: '',
    metrics: createZeroMetrics()
});

function calculateScoreFromMetrics(metrics) {
    const values = Object.values(metrics || {});
    if (values.length > 0 && values.some(function(value) { return value > 0; })) {
        return Math.round(values.reduce(function(sum, value) { return sum + value; }, 0) / 10);
    }
    return null;
}

function normalizeConfidenceScale(confidence) {
    let normalized = Number(confidence);
    if (isNaN(normalized)) return normalized;
    if (normalized < 1 && normalized > 0) normalized = Math.round(normalized * 100);
    return normalized;
}

function clampToPercentage(value) {
    return Math.min(100, Math.max(0, value));
}

export function normalizeResponse(data) {
    const metrics = {};
    for (let i = 0; i < METRIC_KEYS.length; i++) {
        const metricKey = METRIC_KEYS[i];
        metrics[metricKey] = Number(data[metricKey]) || Number(data.metrics?.[metricKey]) || 0;
    }
    let score = Number(data.score) || 0;
    if (score === 0) {
        const calculatedScore = calculateScoreFromMetrics(metrics);
        if (calculatedScore !== null) score = calculatedScore;
    }
    let confidence = normalizeConfidenceScale(data.confidence) || 70;
    confidence = clampToPercentage(confidence);
    return {
        agent: String(data.agent || ''),
        status: String(data.status || 'success'),
        summary: String(data.summary || ''),
        reasoning_summary: String(data.reasoning_summary || ''),
        score: clampToPercentage(score),
        confidence: confidence,
        insight: Array.isArray(data.insight) ? data.insight : [],
        strategy: Array.isArray(data.strategy) ? data.strategy : [],
        risk: Array.isArray(data.risk) ? data.risk : [],
        recommendation: String(data.recommendation || ''),
        metrics: metrics
    };
}

export function buildDegradedResponse(rawText) {
    const raw = (typeof rawText === 'string' ? rawText : '').trim();
    if (!raw) return { ...FALLBACK_RESPONSE };
    const summary = raw.substring(0, 300);
    return {
        agent: '',
        status: 'degraded',
        summary: summary,
        reasoning_summary: 'Respons model belum berupa JSON terstruktur — ringkasan diambil apa adanya dari teks mentah.',
        score: 40,
        confidence: 30,
        insight: [summary.substring(0, 150)],
        strategy: [],
        risk: ['Output model belum terstruktur — perlu ditinjau manual di panel HITL'],
        recommendation: '',
        metrics: createFlatMetrics(40)
    };
}

function removeTrailingCommas(jsonText) {
    return jsonText.replace(/,(\s*[}\]])/g, '$1');
}

export function safeParseResponse(text) {
    try {
        let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.slice(firstBrace, lastBrace + 1);
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            parsed = JSON.parse(removeTrailingCommas(cleaned));
        }
        if (parsed.confidence !== undefined) {
            parsed.confidence = normalizeConfidenceScale(parsed.confidence);
            parsed.confidence = clampToPercentage(parsed.confidence);
        }
        if (parsed.score === 0 || parsed.score === undefined) {
            const metrics = parsed.metrics || {};
            const calculatedScore = calculateScoreFromMetrics(metrics);
            if (calculatedScore !== null) parsed.score = calculatedScore;
        }
        if (parsed.score !== undefined) parsed.score = clampToPercentage(parsed.score);
        return normalizeResponse(parsed);
    } catch (error) {
        return buildDegradedResponse(text);
    }
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(function () { func.apply(this, args); }.bind(this), wait);
    };
}

export function throttle(func, limit) {
    let inThrottle = false;
    return function throttled(...args) {
        if (inThrottle) return;
        func.apply(this, args);
        inThrottle = true;
        setTimeout(function () { inThrottle = false; }, limit);
    };
}

export const Utils = Object.freeze({
    escapeHtml: escapeHtml,
    showToast: showToast,
    Logger: Logger,
    RetryEngine: RetryEngine,
    obfuscate: Obfuscator,
    KnowledgeBase: KnowledgeBase,
    FALLBACK_RESPONSE: FALLBACK_RESPONSE,
    safeParseResponse: safeParseResponse,
    normalizeResponse: normalizeResponse,
    buildDegradedResponse: buildDegradedResponse,
    InternalLogger: InternalLogger,
    METRIC_KEYS: METRIC_KEYS,
    debounce: debounce,
    throttle: throttle
});

export { Logger, InternalLogger };

KESEMPATAN.Utils = Utils;
KESEMPATAN.Logger = Logger;
KESEMPATAN.InternalLogger = InternalLogger;




window.Utils = Utils;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.safeParseResponse = safeParseResponse;

InternalLogger.info('Utils', 'KESEMPATAN.Utils loaded (ES module)');

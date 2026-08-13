import { NoiseConfig } from './noise-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

    const CONFIG = NoiseConfig.CONFIG;

    const InternalLogger = (function() {
        const _logs = [];
        const _maxLogs = 500;
        const _levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 };
        let _level = 1;

        function log(level, module, message, data) {
            const entry = Object.freeze({
                timestamp: Date.now(),
                level: level,
                module: module,
                message: message,
                data: data || null,
                id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
            });
            _logs.push(entry);
            if (_logs.length > _maxLogs) _logs.shift();
            return entry;
        }

        return Object.freeze({
            debug: function(module, message, data) { return log(_levels.DEBUG, module, message, data); },
            info: function(module, message, data) { return log(_levels.INFO, module, message, data); },
            warn: function(module, message, data) { return log(_levels.WARN, module, message, data); },
            error: function(module, message, data) { return log(_levels.ERROR, module, message, data); },
            critical: function(module, message, data) { return log(_levels.CRITICAL, module, message, data); },
            getLogs: function(level, limit) {
                limit = limit || 100;
                let result = _logs;
                if (level !== undefined) result = result.filter(function(l) { return l.level >= level; });
                return result.slice(-limit);
            },
            setLevel: function(level) { _level = level; },
            getLevel: function() { return _level; }
        });
    })();

    const Utils = Object.freeze({
        escapeHtml: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        showToast: function(msg, type) {
            const container = document.getElementById('toastContainer');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = msg;
            if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
            else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
            else if (type === 'warning') toast.style.borderLeftColor = '#f39c12';
            container.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 3500);
        },
        getApiKey: function() {
            const input = document.getElementById('apiKeyInput');
            if (input && input.value && input.value.trim().length > 10) return input.value.trim();
            if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) {
                return window.CONFIG.API_KEYS.openrouter;
            }
            return null;
        },
        isOnline: function() { return navigator.onLine; },
        generateId: function() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 8); },
        similarity: function(a, b) {
            if (a.length === 0 || b.length === 0) return 0;
            const longer = a.length > b.length ? a : b;
            const shorter = a.length > b.length ? b : a;
            const longerLength = longer.length;
            if (longerLength === 0) return 1.0;
            const costs = new Array();
            for (let i = 0; i <= longerLength; i++) costs[i] = i;
            for (let i = 1; i <= shorter.length; i++) {
                let lastValue = i;
                for (let j = 1; j <= longerLength; j++) {
                    const value = costs[j - 1];
                    const cost = (shorter[i - 1] === longer[j - 1]) ? 0 : 1;
                    costs[j - 1] = lastValue;
                    lastValue = Math.min(value + cost, costs[j] + 1, lastValue + 1);
                }
                costs[longerLength] = lastValue;
            }
            return 1 - (costs[longerLength] / longerLength);
        },
        hasSuspiciousUrl: function(text) {
            const patterns = [
                /bit\.ly/i, /tinyurl\.com/i, /shorturl\.at/i, /ow\.ly/i,
                /https?:\/\/[^\s]{1,5}\.[a-z]{2,3}\//i,
                /clck\.ru/i, /goo\.gl/i, /t\.co/i
            ];
            return patterns.some(function(p) { return p.test(text); });
        },
        isSpamPattern: function(text) {
            const clean = text.replace(/\s/g, '');
            if (/(\d)\1{4,}/.test(clean)) return true;
            if (/([a-zA-Z])\1{5,}/.test(clean)) return true;
            if (/([!@#$%^&*()])\1{3,}/.test(clean)) return true;
            return false;
        },
        validateNumber: function(value, min, max, fallback) {
            const num = parseInt(value);
            if (isNaN(num)) return fallback;
            if (min !== undefined && num < min) return fallback;
            if (max !== undefined && num > max) return fallback;
            return num;
        },
        buildExportSnapshot: function(state) {
            return {
                exportedAt: new Date().toISOString(),
                stats: state.stats,
                signals: state.signals.slice(0, 50),
                history: state.history.slice(0, 20),
                settings: {
                    intervalMs: state.intervalMs,
                    threshold: state.threshold,
                    blacklist: state.blacklist,
                    whitelist: state.whitelist,
                    statusFilter: state.statusFilter,
                    sentimentFilter: state.sentimentFilter
                }
            };
        },
        retry: function(fn, maxRetries, delay) {
            maxRetries = maxRetries || CONFIG.IDB_RETRY_COUNT || 3;
            delay = delay || CONFIG.IDB_RETRY_DELAY || 300;
            return new Promise(function(resolve, reject) {
                let attempts = 0;
                function tryFn() {
                    attempts++;
                    fn().then(resolve).catch(function(err) {
                        if (attempts < maxRetries) {
                            setTimeout(tryFn, delay * attempts);
                        } else {
                            reject(err);
                        }
                    });
                }
                tryFn();
            });
        },
        internalAI: function(text) {
            const lower = text.toLowerCase();
            let isHoax = false;
            let sentiment = 'neutral';
            let isBot = false;
            let credibilityScore = 65;
            let reason = 'Lolos analisis internal (tanpa AI)';

            const hoaxKeywords = ['hoax', 'palsu', 'bodoh', 'tipu', 'scam', 'klaim', 'rahasia', 'ajaib', 'instant'];
            let hoaxScore = 0;
            hoaxKeywords.forEach(function(kw) {
                if (lower.includes(kw)) hoaxScore += 15;
            });
            if (hoaxScore > 30) {
                isHoax = true;
                credibilityScore = Math.max(5, credibilityScore - hoaxScore);
                reason = 'Terindikasi hoax (keyword)';
            }

            const posWords = ['baik', 'bagus', 'hebat', 'sukses', 'cerah', 'optimis', 'berkembang'];
            const negWords = ['buruk', 'jelek', 'gagal', 'turun', 'rugi', 'suram', 'krisis'];
            let pos = 0, neg = 0;
            posWords.forEach(function(w) { if (lower.includes(w)) pos++; });
            negWords.forEach(function(w) { if (lower.includes(w)) neg++; });
            if (pos > neg) sentiment = 'positive';
            else if (neg > pos) sentiment = 'negative';

            if (Utils.hasSuspiciousUrl(text)) {
                isBot = true;
                credibilityScore = Math.max(10, credibilityScore - 20);
                reason = 'URL mencurigakan';
            }
            if (Utils.isSpamPattern(text)) {
                isBot = true;
                credibilityScore = Math.max(10, credibilityScore - 15);
                reason = 'Pola spam terdeteksi';
            }

            const letters = text.replace(/[^a-zA-Z]/g, '');
            const capsLetters = text.replace(/[^A-Z]/g, '');
            const capsRatio = letters.length > 10 ? capsLetters.length / letters.length : 0;
            const exclaimCount = (text.match(/!/g) || []).length;
            const clickbaitPhrases = ['tidak disangka', 'bikin geger', 'heboh', 'viral banget', 'wow', 'gak nyangka', 'sampai menangis', 'terungkap'];
            let clickbaitScore = 0;
            if (capsRatio > 0.4) clickbaitScore += 15;
            if (exclaimCount >= 2) clickbaitScore += 10;
            clickbaitPhrases.forEach(function(p) { if (lower.includes(p)) clickbaitScore += 10; });
            if (clickbaitScore >= 20) {
                credibilityScore = Math.max(10, credibilityScore - clickbaitScore);
                reason = 'Pola clickbait terdeteksi';
            }
            if (text.length > 100) credibilityScore = Math.min(100, credibilityScore + 10);
            if (text.length < 20) credibilityScore = Math.max(10, credibilityScore - 15);
            credibilityScore = Math.min(100, Math.max(0, credibilityScore));

            return {
                isHoax: isHoax,
                confidence: Math.min(100, Math.max(0, credibilityScore)),
                sentiment: sentiment,
                isBot: isBot,
                credibilityScore: credibilityScore,
                reason: reason
            };
        }
    });

export const NoiseUtils = {
    InternalLogger: InternalLogger,
    Utils: Utils
};
KESEMPATAN.NoiseUtils = NoiseUtils;
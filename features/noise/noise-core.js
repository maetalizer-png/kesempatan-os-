import { NoiseConfig } from './noise-config.js';
import { NoiseUtils } from './noise-utils.js';
import { NoiseState } from './noise-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

    const CONFIG = NoiseConfig.CONFIG;
    const Utils = NoiseUtils.Utils;
    const InternalLogger = NoiseUtils.InternalLogger;
    const noiseIcon = NoiseConfig.noiseIcon;
    const _state = NoiseState.state;
    const _verdictRegistry = NoiseState.verdictRegistry || new Map();
    const _aiCache = NoiseState.aiCache || new Map();
    const _scanCountHistory = NoiseState.scanCountHistory || [];
    const _lastSignalTimestamps = NoiseState.lastSignalTimestamps || [];
    let _notificationPermission = false;

    function updateNotificationButton() {
        const btn = document.getElementById('noise-notify-btn');
        if (!btn) return;
        if (_notificationPermission) {
            btn.innerHTML = noiseIcon('bell', 12) + ' Aktif';
            btn.style.borderColor = '#2ecc71';
            btn.style.color = '#2ecc71';
            btn.title = 'Notifikasi aktif - klik untuk nonaktifkan';
        } else {
            btn.innerHTML = noiseIcon('bell', 12) + ' Izinkan';
            btn.style.borderColor = 'rgba(255,255,255,0.15)';
            btn.style.color = '#A0B3C9';
            btn.title = 'Notifikasi nonaktif - klik untuk mengizinkan';
        }
    }

    function requestNotificationPermission() {
        if (!('Notification' in window)) {
            Utils.showToast('Browser tidak mendukung notifikasi', 'error');
            return;
        }
        if (Notification.permission === 'granted') {
            _notificationPermission = true;
            Utils.showToast('Notifikasi desktop diizinkan', 'success');
            updateNotificationButton();
            return;
        }
        if (Notification.permission === 'denied') {
            Utils.showToast('Notifikasi desktop telah ditolak sebelumnya', 'warning');
            updateNotificationButton();
            return;
        }
        Notification.requestPermission().then(function(permission) {
            _notificationPermission = (permission === 'granted');
            if (_notificationPermission) {
                Utils.showToast('Notifikasi desktop diaktifkan', 'success');
            } else {
                Utils.showToast('Notifikasi desktop ditolak', 'warning');
            }
            updateNotificationButton();
        });
    }

    function notifyHoax(signal) {
        const msg = 'Hoax terdeteksi: ' + signal.content.substring(0, 80) + '...';
        Utils.showToast(msg, 'error');
        if (_notificationPermission) {
            try {
                new Notification('KESEMPATAN OS - Hoax Alert', {
                    body: signal.content.substring(0, 200),
                    icon: '/favicon.ico'
                });
            } catch (e) { InternalLogger.warn('Noise', 'Desktop notification failed: ' + e.message); }
        }
    }

    function adjustInterval(signalCount) {
        _scanCountHistory.push(signalCount);
        if (_scanCountHistory.length > 5) _scanCountHistory.shift();
        if (_scanCountHistory.length < 3) return;
        const avg = _scanCountHistory.reduce(function(a, b) { return a + b; }, 0) / _scanCountHistory.length;
        let newInterval = CONFIG.INTERVAL_DEFAULT || 30000;
        if (avg < 3) {
            newInterval = Math.min(CONFIG.ADAPTIVE_INTERVAL_MAX || 120000, _state.intervalMs * 1.5);
        } else if (avg > 15) {
            newInterval = Math.max(CONFIG.ADAPTIVE_INTERVAL_MIN || 10000, _state.intervalMs * 0.7);
        } else {
            newInterval = CONFIG.INTERVAL_DEFAULT || 30000;
        }
        newInterval = Math.min(CONFIG.ADAPTIVE_INTERVAL_MAX || 120000, Math.max(CONFIG.ADAPTIVE_INTERVAL_MIN || 10000, newInterval));
        if (Math.abs(newInterval - _state.intervalMs) > 5000) {
            _state.intervalMs = newInterval;
            if (_state.isRunning) {
                if (_state.intervalId) {
                    clearInterval(_state.intervalId);
                    _state.intervalId = null;
                }
                _state.intervalId = setInterval(function() {
                    if (_state.isRunning) scan();
                }, _state.intervalMs);
                InternalLogger.info('Noise', 'Interval adjusted to ' + (_state.intervalMs / 1000) + 's');
            }
        }
    }

    function detectBot(signal, allSignals) {
        const similar = allSignals.slice(-50).some(function(s) {
            if (s.id === signal.id) return false;
            const sim = Utils.similarity(s.content, signal.content);
            return sim > (CONFIG.SIMILARITY_THRESHOLD || 0.8);
        });
        if (similar) return true;
        const now = signal.timestamp || Date.now();
        const recent = _lastSignalTimestamps.filter(function(t) {
            return (now - t) < (CONFIG.BOT_TIME_WINDOW || 2000);
        });
        if (recent.length >= 2) return true;
        if (Utils.hasSuspiciousUrl(signal.content)) return true;
        if (Utils.isSpamPattern(signal.content)) return true;
        return false;
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEY || 'kes_noise_filter_data_v2');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.blacklist) _state.blacklist = data.blacklist;
                if (data.whitelist) _state.whitelist = data.whitelist;
                if (data.threshold) _state.threshold = data.threshold;
                if (data.intervalMs) _state.intervalMs = data.intervalMs;
                if (data.history) _state.history = data.history.slice(0, CONFIG.MAX_HISTORY || 200);
                if (data.signals) _state.signals = data.signals.slice(0, 100);
                if (data.statusFilter) _state.statusFilter = data.statusFilter;
                if (data.sentimentFilter) _state.sentimentFilter = data.sentimentFilter;
                InternalLogger.info('Noise', 'State loaded from localStorage');
            }
        } catch (e) {
            InternalLogger.warn('Noise', 'Load state from localStorage failed');
        }
        const IDB = NoiseState.IDB;
        if (IDB) {
            IDB.open().then(function() {
                IDB.loadHistory().then(function(history) {
                    if (history && history.length > 0) {
                        _state.history = history.slice(0, CONFIG.MAX_HISTORY || 200);
                        InternalLogger.info('Noise', 'History loaded from IndexedDB');
                    }
                });
                IDB.loadSignals().then(function(signals) {
                    if (signals && signals.length > 0) {
                        _state.signals = signals.slice(0, 100);
                        InternalLogger.info('Noise', 'Signals loaded from IndexedDB');
                    }
                });
            });
        }
    }

    function saveState() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY || 'kes_noise_filter_data_v2', JSON.stringify({
                blacklist: _state.blacklist,
                whitelist: _state.whitelist,
                threshold: _state.threshold,
                intervalMs: _state.intervalMs,
                history: _state.history.slice(0, CONFIG.MAX_HISTORY || 200),
                signals: _state.signals.slice(0, 100),
                statusFilter: _state.statusFilter,
                sentimentFilter: _state.sentimentFilter
            }));
        } catch (e) {
            InternalLogger.warn('Noise', 'Save state to localStorage failed');
        }
        const IDB = NoiseState.IDB;
        if (IDB) {
            IDB.saveHistory(_state.history.slice(0, CONFIG.MAX_HISTORY || 200)).catch(function() {
                InternalLogger.warn('Noise', 'Save history to IDB failed');
            });
            IDB.saveSignals(_state.signals.slice(0, 100)).catch(function() {
                InternalLogger.warn('Noise', 'Save signals to IDB failed');
            });
        }
    }

    function autoExportIfNeeded() {
        _state.scanCount++;
        if (_state.scanCount >= (CONFIG.AUTO_EXPORT_INTERVAL || 10)) {
            _state.scanCount = 0;
            try {
                const data = Utils.buildExportSnapshot(_state);
                const key = 'kes_noise_auto_export_' + Date.now();
                localStorage.setItem(key, JSON.stringify(data));
                const keys = Object.keys(localStorage).filter(function(k) {
                    return k.startsWith('kes_noise_auto_export_');
                });
                if (keys.length > 5) {
                    keys.sort().slice(0, keys.length - 5).forEach(function(k) {
                        localStorage.removeItem(k);
                    });
                }
                InternalLogger.info('Noise', 'Auto-export saved');
            } catch (e) {
                InternalLogger.warn('Noise', 'Auto-export failed');
            }
        }
    }

    async function fetchSources() {
        const results = [];
        if (CONFIG.SOURCES && CONFIG.SOURCES.OBSERVATION && window.KESEMPATAN?.Observation && typeof window.KESEMPATAN?.Observation.getSignals === 'function') {
            try {
                let obsSignals = window.KESEMPATAN?.Observation.getSignals();
                if ((!obsSignals || obsSignals.length === 0) && typeof window.KESEMPATAN?.Observation.generateSignals === 'function') {
                    obsSignals = await window.KESEMPATAN?.Observation.generateSignals();
                }
                if (obsSignals && obsSignals.length) {
                    obsSignals.forEach(function(sig) {
                        results.push({
                            id: sig.id,
                            content: (sig.title || '') + (sig.desc ? ' — ' + sig.desc : ''),
                            source: sig.source || 'Observation',
                            sourceTier: sig.sourceTier || 2,
                            timestamp: sig.timestamp || Date.now(),
                            corroboratingSources: sig.corroboratingSources || 1,
                            sourcesList: sig.sourcesList || [sig.source],
                            raw: sig
                        });
                    });
                }
            } catch (e) {
                InternalLogger.warn('Noise', 'Observation fetch failed');
            }
        }
        if (results.length === 0 && CONFIG.SOURCES && CONFIG.SOURCES.BROWSING_AGENT && window.BrowserAgent && typeof window.BrowserAgent.search === 'function') {
            try {
                const topics = ['bisnis', 'teknologi', 'startup', 'ekonomi', 'digital'];
                const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                const data = await window.BrowserAgent.search(randomTopic, 3);
                if (data && data.length) {
                    data.forEach(function(item) {
                        results.push({
                            id: Utils.generateId(),
                            content: item.title || item.snippet || item.content || '',
                            source: item.url || 'Browsing Agent',
                            timestamp: Date.now(),
                            raw: item
                        });
                    });
                }
            } catch (e) {
                InternalLogger.warn('Noise', 'Browsing Agent fetch failed');
            }
        }
        if (results.length === 0 && CONFIG.SOURCES && CONFIG.SOURCES.NEWS_AGGREGATOR && window.NewsAggregator && typeof window.NewsAggregator.getNews === 'function') {
            try {
                const news = await window.NewsAggregator.getNews('teknologi', 5);
                if (news && news.length) {
                    news.forEach(function(item) {
                        results.push({
                            id: Utils.generateId(),
                            content: item.title || item.headline || '',
                            source: item.source || 'News Aggregator',
                            timestamp: Date.now(),
                            raw: item
                        });
                    });
                }
            } catch (e) {
                InternalLogger.warn('Noise', 'News Aggregator fetch failed');
            }
        }
        if (results.length === 0) {
            const fallbacks = [
                { content: 'AI untuk UMKM akan Melonjak Drastis di 2026', source: 'ANTARA' },
                { content: 'Pemerintah Siapkan Paket Kebijakan Digital 2026', source: 'Kompas' },
                { content: 'Bitcoin Tembus Level $100.000, Rekor Baru!', source: 'Detik' },
                { content: 'Startup AI Dapat Pendanaan Seri B Rp1 Triliun', source: 'CNN Indo' },
                { content: 'Hoax: Aplikasi Pemerintah Akan Ditutup', source: 'CekFakta' }
            ];
            fallbacks.forEach(function(f) {
                results.push({
                    id: Utils.generateId(),
                    content: f.content,
                    source: f.source,
                    timestamp: Date.now(),
                    raw: f
                });
            });
        }
        return results;
    }

    async function aiFilter(text) {
        const cached = NoiseState.getCachedAI ? NoiseState.getCachedAI(text) : null;
        if (cached) return cached;
        const apiKey = Utils.getApiKey();
        if (!apiKey) {
            const fallback = Utils.internalAI(text);
            if (NoiseState.setCachedAI) NoiseState.setCachedAI(text, fallback);
            return fallback;
        }
        const prompt = [
            'Anda adalah asisten AI untuk mendeteksi hoax, bot, dan sentimen dari teks berita/artikel.',
            '',
            'Instruksi:',
            '- Berikan output hanya dalam format JSON (tanpa teks lain).',
            '- Nilai "isHoax" jika teks mengandung klaim tidak berdasar, konten palsu, atau menyesatkan.',
            '- "confidence" adalah keyakinan Anda (0-100).',
            '- "sentiment" bisa "positive", "negative", atau "neutral".',
            '- "isBot" jika teks terlihat seperti dihasilkan oleh bot (repetitif, tidak natural).',
            '- "credibilityScore" nilai kredibilitas sumber berdasarkan konten (0-100).',
            '',
            'Contoh:',
            'Teks: "Dapatkan 10 juta sebulan dengan modal 50rb! Klik di sini!"',
            'Output: { "isHoax": true, "confidence": 95, "sentiment": "negative", "isBot": true, "credibilityScore": 10, "reason": "Klaim tidak realistis dan mengarahkan ke tautan mencurigakan" }',
            '',
            'Sekarang analisis teks berikut:',
            'Teks: "' + text.substring(0, 300) + '"'
        ].join('\n');
        const controller = new AbortController();
        const timeout = setTimeout(function() { controller.abort(); }, 10000);
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: CONFIG.AI_MODEL || 'deepseek/deepseek-chat',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: CONFIG.AI_MAX_TOKENS || 300,
                    temperature: CONFIG.AI_TEMPERATURE || 0.3
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                let resultText = data.choices[0].message.content;
                resultText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const first = resultText.indexOf('{');
                const last = resultText.lastIndexOf('}');
                if (first !== -1 && last !== -1) resultText = resultText.slice(first, last + 1);
                const parsed = JSON.parse(resultText);
                const result = {
                    isHoax: !!parsed.isHoax,
                    confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
                    sentiment: parsed.sentiment || 'neutral',
                    isBot: !!parsed.isBot,
                    credibilityScore: Math.min(100, Math.max(0, parsed.credibilityScore || 50)),
                    reason: parsed.reason || 'Analisis AI'
                };
                if (NoiseState.setCachedAI) NoiseState.setCachedAI(text, result);
                return result;
            }
            throw new Error('No choices in response');
        } catch (e) {
            clearTimeout(timeout);
            const fallback2 = Utils.internalAI(text);
            if (NoiseState.setCachedAI) NoiseState.setCachedAI(text, fallback2);
            return fallback2;
        }
    }

    function ruleFilter(text) {
        const lower = text.toLowerCase();
        for (let i = 0; i < _state.blacklist.length; i++) {
            if (lower.includes(_state.blacklist[i].toLowerCase())) {
                return { blocked: true, reason: 'Blacklist keyword: "' + _state.blacklist[i] + '"', severity: 'high' };
            }
        }
        for (let i = 0; i < _state.whitelist.length; i++) {
            if (lower.includes(_state.whitelist[i].toLowerCase())) {
                return { blocked: false, reason: 'Whitelist keyword: "' + _state.whitelist[i] + '"', severity: 'low' };
            }
        }
        return { blocked: false, reason: 'Lolos aturan dasar', severity: 'low' };
    }

    async function processSignal(item) {
        const text = item.content || '';
        const ruleResult = ruleFilter(text);
        if (ruleResult.blocked) {
            return {
                id: item.id,
                content: text,
                source: item.source || 'Unknown',
                timestamp: item.timestamp || Date.now(),
                status: 'blocked',
                reason: ruleResult.reason,
                severity: ruleResult.severity || 'high',
                ai: null,
                confidence: 0
            };
        }
        let aiResult = { isHoax: false, confidence: 50, sentiment: 'neutral', isBot: false, credibilityScore: 50, reason: 'AI tidak dijalankan' };
        if (Utils.getApiKey()) {
            aiResult = await aiFilter(text);
        } else {
            aiResult = Utils.internalAI(text);
        }
        const allSignals = _state.signals.slice(-50);
        const isBot = detectBot(item, allSignals) || aiResult.isBot;
        const corroboratingSources = item.corroboratingSources || 1;
        let credibilityScore = aiResult.credibilityScore || 50;
        if (corroboratingSources >= 3) credibilityScore = Math.min(100, credibilityScore + 20);
        else if (corroboratingSources === 2) credibilityScore = Math.min(100, credibilityScore + 10);
        else credibilityScore = Math.max(0, credibilityScore - 10);
        if (item.sourceTier === 1) credibilityScore = Math.min(100, credibilityScore + 8);
        let confidence = aiResult.confidence || 50;
        if (aiResult.isHoax) confidence = 100 - confidence;
        if (isBot) confidence = Math.max(10, confidence - 20);
        if (ruleResult.blocked) confidence = 0;
        let status = 'allowed';
        let reason = aiResult.reason || 'Lolos AI';
        if (aiResult.isHoax && confidence > _state.threshold) {
            status = 'blocked';
            reason = 'Hoax terdeteksi (AI)';
        } else if (isBot && confidence > _state.threshold) {
            status = 'filtered';
            reason = 'Aktivitas bot terdeteksi';
        } else if (confidence < _state.threshold && confidence > 0) {
            status = 'filtered';
            reason = 'Confidence di bawah threshold (' + confidence + '%)';
        } else if (corroboratingSources === 1 && credibilityScore < 30) {
            status = 'filtered';
            reason = 'Belum dikonfirmasi sumber lain & kredibilitas rendah';
        }
        const signal = {
            id: item.id,
            content: text,
            source: item.source || 'Unknown',
            timestamp: item.timestamp || Date.now(),
            status: status,
            reason: reason,
            severity: status === 'blocked' ? 'high' : (status === 'filtered' ? 'medium' : 'low'),
            ai: aiResult,
            confidence: confidence,
            isBot: isBot,
            sentiment: aiResult.sentiment || 'neutral',
            credibilityScore: credibilityScore,
            corroboratingSources: corroboratingSources,
            sourceTier: item.sourceTier || 2,
            sourcesList: item.sourcesList || [item.source]
        };
        if (status === 'blocked' && aiResult.isHoax) {
            notifyHoax(signal);
        }
        if (NoiseState.setVerdict) NoiseState.setVerdict(signal.id, signal);
        return signal;
    }

    async function scan() {
        if (_state.isScanning) return;
        if (!Utils.isOnline()) {
            Utils.showToast('Offline: tidak bisa scan', 'error');
            return;
        }
        _state.isScanning = true;
        if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.updateStatusUI) KESEMPATAN.NoiseUI.updateStatusUI(true);
        InternalLogger.info('Noise', 'Scanning...');
        try {
            const sources = await fetchSources();
            const processed = [];
            for (let i = 0; i < sources.length; i++) {
                const result = await processSignal(sources[i]);
                processed.push(result);
            }
            _state.stats.total = processed.length;
            _state.stats.blocked = processed.filter(function(s) { return s.status === 'blocked'; }).length;
            _state.stats.filtered = processed.filter(function(s) { return s.status === 'filtered'; }).length;
            _state.stats.allowed = processed.filter(function(s) { return s.status === 'allowed'; }).length;
            const avgCredibility = processed.length
                ? Math.round(processed.reduce(function(sum, s) { return sum + (s.credibilityScore || 0); }, 0) / processed.length)
                : 0;
            processed.forEach(function(s) {
                _lastSignalTimestamps.push(s.timestamp);
            });
            if (_lastSignalTimestamps.length > 50) _lastSignalTimestamps.splice(0, _lastSignalTimestamps.length - 50);
            adjustInterval(processed.length);
            _state.history.unshift({
                timestamp: Date.now(),
                total: processed.length,
                blocked: _state.stats.blocked,
                filtered: _state.stats.filtered,
                allowed: _state.stats.allowed,
                avgCredibility: avgCredibility,
                signals: processed.slice(0, 20)
            });
            if (_state.history.length > (CONFIG.MAX_HISTORY || 200)) _state.history.pop();
            _state.signals = processed;
            _state.lastScan = Date.now();
            saveState();
            autoExportIfNeeded();
            if (window.KESEMPATAN?.Observation && typeof window.KESEMPATAN?.Observation.render === 'function') {
                window.KESEMPATAN?.Observation.render();
            }
            if (KESEMPATAN.NoiseUI) {
                if (KESEMPATAN.NoiseUI.updateStatsUI) KESEMPATAN.NoiseUI.updateStatsUI();
                if (KESEMPATAN.NoiseUI.updateSignalList) KESEMPATAN.NoiseUI.updateSignalList(_state.signals);
                if (KESEMPATAN.NoiseUI.updateHistoryList) KESEMPATAN.NoiseUI.updateHistoryList(_state.history);
                if (KESEMPATAN.NoiseUI.renderHistoryChart) KESEMPATAN.NoiseUI.renderHistoryChart();
                if (KESEMPATAN.NoiseUI.renderVerdictRing) KESEMPATAN.NoiseUI.renderVerdictRing();
            }
            InternalLogger.info('Noise', 'Scan complete: ' + processed.length + ' signals');
        } catch (e) {
            InternalLogger.error('Noise', 'Scan error');
            Utils.showToast('Gagal scan', 'error');
        } finally {
            _state.isScanning = false;
            if (KESEMPATAN.NoiseUI && KESEMPATAN.NoiseUI.updateStatusUI) KESEMPATAN.NoiseUI.updateStatusUI(false);
        }
    }

    function startScan() {
        if (_state.isRunning) return;
        _state.isRunning = true;
        scan();
        if (_state.intervalId) {
            clearInterval(_state.intervalId);
        }
        _state.intervalId = setInterval(function() {
            if (_state.isRunning) scan();
        }, _state.intervalMs);
        Utils.showToast('Noise Filtering started', 'success');
    }

    function stopScan() {
        if (!_state.isRunning) return;
        _state.isRunning = false;
        if (_state.intervalId) {
            clearInterval(_state.intervalId);
            _state.intervalId = null;
        }
        Utils.showToast('Noise Filtering stopped', 'info');
    }

    loadState();

    export const NoiseCore = {
        scan: scan,
        start: startScan,
        stop: stopScan,
        ruleFilter: ruleFilter,
        processSignal: processSignal,
        fetchSources: fetchSources,
        aiFilter: aiFilter,
        loadState: loadState,
        saveState: saveState,
        adjustInterval: adjustInterval,
        detectBot: detectBot,
        requestNotificationPermission: requestNotificationPermission,
        updateNotificationButton: updateNotificationButton,
        getState: function() { return _state; }
    };
    KESEMPATAN.NoiseCore = NoiseCore;
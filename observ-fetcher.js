
(function() {
    'use strict';

    if (window.__OBS_FETCHER) return;
    window.__OBS_FETCHER = true;

    const OBS = window.OBS || {};
    const CONFIG = window.OBS_CONFIG.CONFIG;
    const RSS_SOURCES = window.OBS_CONFIG.RSS_SOURCES;
    const FALLBACK_SIGNALS = window.OBS_CONFIG.FALLBACK_SIGNALS;
    const CATEGORIES = window.OBS_CONFIG.CATEGORIES;

    const CIRCUIT_KEY = 'kes_obs_circuit_v1';
    let _circuit = {};
    try {
        _circuit = JSON.parse(localStorage.getItem(CIRCUIT_KEY) || '{}');
    } catch (e) { _circuit = {}; }

    function saveCircuit() {
        try { localStorage.setItem(CIRCUIT_KEY, JSON.stringify(_circuit)); } catch (e) {}
    }

    function isInCooldown(sourceName) {
        const c = _circuit[sourceName];
        if (!c || c.fails < (CONFIG.MAX_CONSECUTIVE_FAILS || 3)) return false;
        const cooldownMs = CONFIG.SOURCE_COOLDOWN_MS || 600000;
        return (Date.now() - c.lastFail) < cooldownMs;
    }

    function recordFailure(sourceName) {
        const c = _circuit[sourceName] || { fails: 0, lastFail: 0 };
        c.fails++;
        c.lastFail = Date.now();
        _circuit[sourceName] = c;
        saveCircuit();
    }

    function recordSuccess(sourceName) {
        if (_circuit[sourceName]) {
            _circuit[sourceName].fails = 0;
            saveCircuit();
        }
    }

    function getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return minutes + ' menit lalu';
        if (hours < 24) return hours + ' jam lalu';
        return days + ' hari lalu';
    }
    OBS.getTimeAgo = getTimeAgo;

    function sanitizeText(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function detectCategory(text) {
        const lower = text.toLowerCase();
        const map = {
            'Bisnis': ['bisnis', 'usaha', 'investasi', 'market', 'ekonomi', 'keuangan', 'saham', 'bank', 'finance', 'inflasi', 'harga', 'business', 'economy', 'stock', 'trade', 'markets'],
            'Teknologi': ['teknologi', 'digital', 'ai', 'kecerdasan', 'startup', 'software', 'robot', 'internet', 'gadget', 'data', 'technology', 'tech'],
            'Politik': ['politik', 'pemerintah', 'presiden', 'kebijakan', 'parlemen', 'menteri', 'kabinet', 'program', 'president', 'government', 'election', 'minister', 'parliament', 'policy'],
            'Global': ['global', 'internasional', 'dunia', 'asing', 'amerika', 'china', 'eropa', 'asia', 'imf', 'world', 'international', 'israel', 'gaza', 'ukraine', 'russia', 'europe', 'africa'],
            'Olahraga': ['olahraga', 'sepakbola', 'sepak bola', 'basket', 'badminton', 'liga', 'timnas', 'football', 'sport', 'match', 'championship']
        };
        let best = 'Umum';
        let bestScore = 0;
        for (const [cat, words] of Object.entries(map)) {
            let score = 0;
            for (const w of words) {
                if (lower.includes(w)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                best = cat;
            }
        }
        return best;
    }

    async function fetchWithRetry(url, retries = CONFIG.MAX_RETRIES || 2, delay = CONFIG.RETRY_DELAY || 1000) {
        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, {
                    headers: { 
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    signal: AbortSignal.timeout(5000)
                });
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return await response.json();
            } catch (err) {
                lastError = err;
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }
        throw lastError;
    }

    function extractRssUrl(apiUrl) {
        try {
            const url = new URL(apiUrl);
            const rssParam = url.searchParams.get('rss_url');
            return rssParam ? decodeURIComponent(rssParam) : null;
        } catch {
            return null;
        }
    }

    async function fetchRSSDirect(rssUrl) {
        const proxies = [
            'https://corsproxy.io/?url=',        // terbukti berhasil untuk ANTARA
            'https://api.allorigins.win/raw?url=',
            'https://api.codetabs.com/v1/proxy?quest='
        ];

        let lastError = null;
        for (const proxy of proxies) {
            try {
                const proxyUrl = proxy + encodeURIComponent(rssUrl);
                const response = await fetch(proxyUrl, {
                    signal: AbortSignal.timeout(10000),
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (!response.ok) throw new Error('HTTP ' + response.status);

                const xmlText = await response.text();
                const trimmed = xmlText.trim();
                if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
                    throw new Error('Proxy mengembalikan HTML, bukan XML');
                }

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) throw new Error('XML Parse Error');

                let items = xmlDoc.querySelectorAll('item');
                if (items.length === 0) items = xmlDoc.querySelectorAll('entry');
                if (items.length === 0) throw new Error('Tidak ditemukan item');

                const result = [];
                for (const el of items) {
                    const title = el.querySelector('title')?.textContent?.trim() || 'No Title';
                    const descEl = el.querySelector('description') || el.querySelector('summary') || el.querySelector('content');
                    let desc = descEl ? descEl.textContent.trim().replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
                    const pubDateEl = el.querySelector('pubDate') || el.querySelector('published') || el.querySelector('updated');
                    const pubDate = pubDateEl ? pubDateEl.textContent.trim() : new Date().toISOString();
                    let link = el.querySelector('link')?.getAttribute('href') || el.querySelector('link')?.textContent?.trim() || '';
                    if (!link) {
                        const guidEl = el.querySelector('guid');
                        if (guidEl) link = guidEl.textContent.trim();
                    }
                    result.push({ title, description: desc, pubDate, link: link || '#' });
                }

                if (result.length === 0) throw new Error('Item kosong');
                console.log(`[Proxy] ${proxy} berhasil untuk ${rssUrl}`);
                return { items: result };

            } catch (err) {
                lastError = err;
                console.warn(`[Proxy Fallback] ${proxy} gagal:`, err.message);
            }
        }
        throw new Error(`Semua proxy gagal. Terakhir: ${lastError?.message || 'Unknown'}`);
    }

    async function fetchOneSource(src, state) {
        if (isInCooldown(src.name)) {
            const c = _circuit[src.name];
            const remainMin = Math.ceil(((CONFIG.SOURCE_COOLDOWN_MS || 600000) - (Date.now() - c.lastFail)) / 60000);
            state.sourceStatus[src.name].success = false;
            state.sourceStatus[src.name].error = 'Istirahat (gagal ' + c.fails + 'x) — coba lagi ~' + remainMin + ' menit';
            state.sourceStatus[src.name].cooldown = true;
            return [];
        }

        let items = [];
        let success = false;
        let errorMsg = null;

        try {
            const data = await fetchWithRetry(src.url);
            if (data && data.items && data.items.length > 0) {
                items = data.items.slice(0, CONFIG.ITEMS_PER_SOURCE || 3);
                success = true;
            } else {
                errorMsg = 'Tidak ada item dari rss2json';
            }
        } catch (err) {
            errorMsg = 'rss2json gagal: ' + (err.message || 'Unknown error');
        }

        if (!success) {
            try {
                const rssUrl = extractRssUrl(src.url);
                if (rssUrl) {
                    const directData = await fetchRSSDirect(rssUrl);
                    if (directData && directData.items && directData.items.length > 0) {
                        items = directData.items.slice(0, CONFIG.ITEMS_PER_SOURCE || 3);
                        success = true;
                        errorMsg = null;
                    } else {
                        errorMsg = (errorMsg ? errorMsg + '; ' : '') + 'Fallback RSS tidak menghasilkan item';
                    }
                } else {
                    errorMsg = (errorMsg ? errorMsg + '; ' : '') + 'Tidak dapat mengekstrak rss_url';
                }
            } catch (fallbackErr) {
                errorMsg = (errorMsg ? errorMsg + '; ' : '') + 'Fallback gagal: ' + (fallbackErr.message || 'Unknown');
            }
        }

        const resultItems = [];
        if (success && items.length > 0) {
            state.sourceStatus[src.name].success = true;
            state.sourceStatus[src.name].count = items.length;
            state.sourceStatus[src.name].error = null;
            recordSuccess(src.name);

            for (const item of items) {
                const rawTitle = item.title || 'No Title';
                const rawDesc = item.description || '';
                const cleanDesc = rawDesc
                    .replace(/<img[^>]*>/g, '')
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                let timestamp = Date.now();
                try {
                    const d = new Date(item.pubDate);
                    if (!isNaN(d.getTime())) timestamp = d.getTime();
                } catch (e) {}

                resultItems.push({
                    id: 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    title: rawTitle,
                    desc: cleanDesc.substring(0, 120),
                    source: src.name,
                    sourceIcon: src.icon,
                    sourceTier: src.tier || 2,
                    region: src.region || 'nasional',
                    category: detectCategory(rawTitle + ' ' + cleanDesc),
                    url: item.link || '#',
                    timestamp: timestamp,
                    isNew: true
                });
            }
        } else {
            state.sourceStatus[src.name].success = false;
            state.sourceStatus[src.name].error = errorMsg || 'Gagal mengambil data dari semua metode';
            recordFailure(src.name);
        }
        return resultItems;
    }

    async function generateSignals() {
        const state = OBS.getState();
        const allItems = [];
        state.sourceStatus = {};

        for (const src of RSS_SOURCES) {
            state.sourceStatus[src.name] = { success: false, count: 0, icon: src.icon, error: null };
        }

        const BATCH_SIZE = 4;
        const BATCH_DELAY_MS = 400;
        for (let i = 0; i < RSS_SOURCES.length; i += BATCH_SIZE) {
            const batch = RSS_SOURCES.slice(i, i + BATCH_SIZE);
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
            }
            const batchResults = await Promise.all(batch.map(src => fetchOneSource(src, state)));
            batchResults.forEach(items => allItems.push(...items));
        }

        if (allItems.length === 0) {
            const now = Date.now();
            for (let i = 0; i < FALLBACK_SIGNALS.length; i++) {
                const fb = FALLBACK_SIGNALS[i];
                const src = RSS_SOURCES[i % RSS_SOURCES.length];
                allItems.push({
                    id: 'fb_' + Date.now() + '_' + i,
                    title: fb.title,
                    desc: fb.desc,
                    source: src.name,
                    sourceIcon: src.icon,
                    sourceTier: src.tier || 2,
                    region: src.region || 'nasional',
                    category: fb.cat || 'Umum',
                    url: '#',
                    timestamp: now - (i * 600000),
                    isNew: true
                });
                state.sourceStatus[src.name].success = true;
                state.sourceStatus[src.name].count = (state.sourceStatus[src.name].count || 0) + 1;
            }
        }

        function wordSet(title) {
            return new Set(
                title.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(function(w) { return w.length > 3; })
            );
        }
        function jaccard(setA, setB) {
            if (setA.size === 0 || setB.size === 0) return 0;
            let intersection = 0;
            setA.forEach(function(w) { if (setB.has(w)) intersection++; });
            const union = setA.size + setB.size - intersection;
            return union === 0 ? 0 : intersection / union;
        }

        allItems.sort((a, b) => b.timestamp - a.timestamp);
        const unique = [];
        for (const item of allItems) {
            item._words = wordSet(item.title);
            let match = null;
            for (const u of unique) {
                if (jaccard(item._words, u._words) >= 0.5) { match = u; break; }
            }
            if (!match) {
                item.corroboratingSources = 1;
                item.sourcesList = [item.source];
                unique.push(item);
            } else if (!match.sourcesList.includes(item.source)) {
                match.sourcesList.push(item.source);
                match.corroboratingSources = match.sourcesList.length;
            }
        }
        unique.forEach(function(u) { delete u._words; });

        const oldIds = new Set(state.signals.map(s => s.id));
        state.newSignalCount = unique.filter(s => !oldIds.has(s.id)).length;

        state.signals = unique.slice(0, CONFIG.MAX_SIGNALS || 50);
        state.lastUpdate = Date.now();

        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.signals));
        } catch (e) {}

        return state.signals;
    }

    async function refreshSignals() {
        const state = OBS.getState();
        if (state.isRefreshing) return;
        state.isRefreshing = true;

        const btn = document.getElementById('refreshObsBtn');
        if (btn && window.OBS.UI && window.OBS.UI.icon) btn.innerHTML = window.OBS.UI.icon('loader', 12, null, 'animation:spin 0.8s linear infinite;');

        try {
            await generateSignals();
            OBS.emitter.emit('signals-updated', state.signals);
            if (state.newSignalCount > 0) {
                OBS.showToast(state.newSignalCount + ' sinyal baru!', 'success');
            }
        } catch (e) {
            OBS.showToast('Gagal refresh: ' + e.message, 'error');
        }

        state.isRefreshing = false;
        if (btn && window.OBS.UI && window.OBS.UI.icon) btn.innerHTML = window.OBS.UI.icon('refresh-cw', 12) + ' Refresh';
    }

    OBS.detectCategory = detectCategory;
    OBS.fetchWithRetry = fetchWithRetry;
    OBS.fetchOneSource = fetchOneSource;
    OBS.generateSignals = generateSignals;
    OBS.refreshSignals = refreshSignals;
    OBS.sanitizeText = sanitizeText;
    OBS.fetchRSSDirect = fetchRSSDirect;
    OBS.extractRssUrl = extractRssUrl;

    window.OBS = OBS;
})();
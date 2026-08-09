/* ============================================================
   interactive/chat-agent/cag-data-engine.js
   OTAK CHAT AGENT — cache, integrasi World/Memory/Database,
   smart search, roster agen dinamis, panggilan AI.
   ============================================================ */

// ---------- CACHE SYSTEM ----------
function CAG_getCached(key) {
        const entry = CAG_queryCache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > CAG_CONFIG.CACHE_TTL) {
            CAG_queryCache.delete(key);
            return null;
        }
        return entry.data;
    }

function CAG_setCache(key, data) {
        if (CAG_queryCache.size >= CAG_CONFIG.MAX_CACHE) {
            const firstKey = CAG_queryCache.keys().next().value;
            CAG_queryCache.delete(firstKey);
        }
        CAG_queryCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

function CAG_clearCache() {
        CAG_queryCache.clear();
    }

function CAG_getCacheStats() {
        return {
            size: CAG_queryCache.size,
            maxSize: CAG_CONFIG.MAX_CACHE,
            keys: Array.from(CAG_queryCache.keys())
        };
    }

// ---------- INTEGRASI DATA (World / Memory / Database) ----------
function CAG_getStaticData() {
        return window.__STATIC_DATA || [];
    }

function CAG_getMemoryInstance() {
        return window.KESEMPATAN?.VectorMemory || window.VectorMemory || window.VectorMemoryV5 || null;
    }

function CAG_getDatabaseInstance() {
        return window.KESDatabase || window.getDatabaseV10 || null;
    }

function CAG_smartSearch(query, data, threshold) {
        threshold = threshold || CAG_CONFIG.SEARCH_THRESHOLD;
        if (!data || data.length === 0) {
            return [];
        }
        
        const keywords = query.toLowerCase().split(' ');
        const results = [];
        
        for (const item of data) {
            const text = (item.text || '').toLowerCase();
            
            let score = 0;
            let matchCount = 0;
            
            // FAKTOR 1: Keyword match (weighted)
            for (const kw of keywords) {
                if (text.includes(kw)) {
                    matchCount++;
                    score += kw.length * 2;
                }
            }
            
            // FAKTOR 2: Semantic similarity (kalau ada embedding)
            if (item.embedding) {
                const queryEmbedding = window.KESEMPATAN?.Memory?.MemoryUtils?.simpleEmbed ? 
                    window.KESEMPATAN.Memory.MemoryUtils.simpleEmbed(query) : null;
                if (queryEmbedding && item.embedding) {
                    const sim = CAG_calculateSimilarity(queryEmbedding, item.embedding);
                    score += sim * 10;
                }
            }
            
            // FAKTOR 3: Metadata boost
            if (item.metadata) {
                if (item.metadata.type === 'country' || item.metadata.type === 'language') {
                    score += 5;
                }
                if (item.metadata.category === 'marplace') {
                    score += 3;
                }
                if (item.metadata.category === 'sapaan') {
                    score += 5;
                }
                if (item.metadata.source) {
                    score += 2;
                }
                if (item.metadata.priority === 'high') {
                    score += 8;
                }
            }
            
            // FAKTOR 4: Recency boost
            if (item.timestamp) {
                const age = Date.now() - item.timestamp;
                const days = age / (1000 * 60 * 60 * 24);
                if (days < 7) {
                    score += 10;
                } else if (days < 30) {
                    score += 5;
                } else if (days < 90) {
                    score += 2;
                }
            }
            
            // FAKTOR 5: Length boost (data lebih panjang = lebih informatif)
            if (text.length > 100) {
                score += 2;
            }
            if (text.length > 500) {
                score += 3;
            }
            
            // FAKTOR 6: Keyword density
            const wordCount = text.split(' ').length || 1;
            const density = matchCount / wordCount;
            score += density * 10;
            
            results.push({ 
                ...item, 
                _score: score,
                _matchCount: matchCount,
                _keywordDensity: density
            });
        }
        
        results.sort(function(a, b) {
            return b._score - a._score;
        });
        
        const filtered = results.filter(function(item) {
            return item._score > threshold;
        });
        
        return filtered.slice(0, CAG_CONFIG.MAX_RESULTS);
    }

function CAG_calculateSimilarity(vec1, vec2) {
        if (!vec1 || !vec2) {
            return 0;
        }
        let dot = 0;
        let norm1 = 0;
        let norm2 = 0;
        const len = Math.min(vec1.length, vec2.length);
        for (let i = 0; i < len; i++) {
            dot += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }
        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

function CAG_fetchStaticData(query) {
        const staticData = CAG_getStaticData();
        if (staticData.length === 0) {
            return [];
        }
        
        const results = CAG_smartSearch(query, staticData, CAG_CONFIG.SEARCH_THRESHOLD);
        results.forEach(function(item) {
            item._source = 'static';
            item._priority = 1;
        });
        
        return results;
    }

// ---------- FETCH KONTEKS (3 SUMBER) ----------
async function CAG_fetchFromVectorMemory(query, topK) {
        const memory = CAG_getMemoryInstance();
        if (!memory || typeof memory.search !== 'function') {
            return [];
        }
        
        try {
            const results = await memory.search(query, { 
                topK: topK || CAG_CONFIG.TOP_K_MEMORY,
                threshold: CAG_CONFIG.SEARCH_THRESHOLD
            });
            if (results && Array.isArray(results)) {
                results.forEach(function(item) {
                    item._source = 'memory';
                    item._priority = 2;
                });
                return results;
            }
            return [];
        } catch (_) {
            return [];
        }
    }

    // BARU: dulu Chat Agent cuma MEMBACA dari Vector Memory, tidak
    // pernah menyimpan hasil percakapan kembali. Meniru pola yang sudah
    // terbukti di Debate (DEB_saveDebateToMemory) dan Chat AI.
    async function CAG_saveMessageToMemory(userMessage, aiResponse, agentName) {
        const memory = CAG_getMemoryInstance();
        if (!memory) return;

        const metadata = {
            userMessage: userMessage,
            aiResponse: aiResponse,
            agent: agentName,
            timestamp: Date.now(),
            type: 'chat-agent'
        };

        try {
            const fullText = 'User: ' + userMessage + '\\n' + (agentName || 'Agent') + ': ' + aiResponse;
            if (typeof memory.save === 'function') {
                await memory.save(fullText, metadata);
            } else if (typeof memory.add === 'function') {
                await memory.add(metadata);
            }
        } catch (_) { console.warn('[CagDataEngine] memory save failed'); }
    }

async function CAG_fetchFromDatabase(query, limit) {
        const db = CAG_getDatabaseInstance();
        if (!db) {
            return [];
        }
        const maxResults = limit || CAG_CONFIG.DB_LIMIT;

        // KESDatabase (kes-database.js) mengekspos API generik: query/get/
        // find/add/insert/save — bukan queryParser.parseAndExecute atau
        // executeQuery (API itu tidak pernah ada di implementasi sungguhan,
        // jadi lapisan Database selama ini selalu kosong). database/search.js
        // kemungkinan menambah method .search() — dicoba lebih dulu, lalu
        // fallback ke find/query yang memang ada di instance KESDatabase.
        const attempts = [
            function() { return db.search ? db.search(query, { limit: maxResults }) : null; },
            function() { return db.find ? db.find({ text: query, limit: maxResults }) : null; },
            function() { return db.find ? db.find(query, maxResults) : null; },
            function() { return db.query ? db.query({ text: query, limit: maxResults }) : null; },
            function() { return db.get ? db.get(query) : null; }
        ];

        for (let i = 0; i < attempts.length; i++) {
            try {
                const result = await attempts[i]();
                if (result && Array.isArray(result) && result.length > 0) {
                    result.forEach(function(item) {
                        item._source = 'database';
                        item._priority = 3;
                    });
                    return result.slice(0, maxResults);
                }
            } catch (_) {
                // Coba strategi API berikutnya
            }
        }
        return [];
    }

async function CAG_getAllContext(query, options) {
        options = options || {};
        const cacheKey = query + '|' + JSON.stringify(options);
        
        const cached = CAG_getCached(cacheKey);
        if (cached && !options.forceRefresh) {
            return cached;
        }
        
        const startTime = Date.now();
        
        const [staticData, memoryData, dbData] = await Promise.all([
            new Promise(function(resolve) {
                resolve(CAG_fetchStaticData(query));
            }),
            new Promise(function(resolve) {
                CAG_fetchFromVectorMemory(query, options.topK || CAG_CONFIG.TOP_K_MEMORY).then(resolve);
            }),
            new Promise(function(resolve) {
                CAG_fetchFromDatabase(query, options.dbLimit || CAG_CONFIG.DB_LIMIT).then(resolve);
            })
        ]);
        
        const combined = [];
        const seenIds = new Set();
        
        // PRIORITAS 1: STATIC DATA (World) — paling valid
        for (const item of staticData) {
            const id = item.id || item.text?.substring(0, 50);
            if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({ ...item, _priority: 1 });
            }
        }
        
        // PRIORITAS 2: MEMORY DATA
        for (const item of memoryData) {
            const id = item.id || item.text?.substring(0, 50);
            if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({ ...item, _priority: 2 });
            }
        }
        
        // PRIORITAS 3: DATABASE
        for (const item of dbData) {
            const id = item.id || item.text?.substring(0, 50);
            if (!seenIds.has(id)) {
                seenIds.add(id);
                combined.push({ ...item, _priority: 3 });
            }
        }
        
        // SORT BY PRIORITY + SCORE
        combined.sort(function(a, b) {
            if (a._priority !== b._priority) {
                return a._priority - b._priority;
            }
            return (b._score || 0) - (a._score || 0);
        });
        
        // BARU: OBSERVATION ENGINE + NOISE FILTERING
        let obsContext = { marketInsight: '', credibilityNote: '' };
        try {
            if (window.KESEMPATAN?.Observation && typeof window.KESEMPATAN?.Observation.getSignals === 'function' && typeof window.KESEMPATAN?.Observation.generateAIInsight === 'function') {
                const signals = window.KESEMPATAN?.Observation.getSignals();
                if (signals && signals.length > 0) {
                    const insight = window.KESEMPATAN?.Observation.generateAIInsight(signals);
                    obsContext.marketInsight = (insight && insight.summary) ? insight.summary.replace(/<[^>]+>/g, '') : '';
                }
            }
        } catch (e) { console.warn('[CagDataEngine] Observation insight lookup failed:', e.message); }
        try {
            if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && query) {
                const check = window.NoisePage.checkText(query);
                if (check && check.blocked) {
                    obsContext.credibilityNote = 'Query mengandung kata yang perlu diverifikasi: ' + check.reason;
                }
            }
        } catch (e) { console.warn('[CagDataEngine] NoisePage credibility check failed:', e.message); }

        const result = {
            static: staticData,
            memory: memoryData,
            database: dbData,
            observation: obsContext,
            combined: combined.slice(0, options.maxResults || CAG_CONFIG.MAX_RESULTS),
            totalSources: {
                static: staticData.length,
                memory: memoryData.length,
                database: dbData.length,
                total: combined.length
            },
            elapsed: Date.now() - startTime,
            query: query
        };
        
        CAG_setCache(cacheKey, result);
        
        return result;
    }

// ---------- PREFERENSI ----------
function CAG_loadPreferences() {
        try {
            const saved = localStorage.getItem(CAG_CONFIG.PREF_KEY);
            if (saved) {
                const prefs = JSON.parse(saved);
                return {
                    categories: prefs.categories || ['politik', 'ekonomi'],
                    sources: prefs.sources || [],
                    updateInterval: prefs.updateInterval || 60000,
                    language: prefs.language || 'id',
                    style: prefs.style || 'casual',
                    name: prefs.name || '',
                    preferences: prefs.preferences || {}
                };
            }
        } catch (_) {
            // Silent fail
        }
        return {
            categories: ['politik', 'ekonomi', 'teknologi'],
            sources: [],
            updateInterval: 60000,
            language: 'id',
            style: 'casual',
            name: '',
            preferences: {}
        };
    }

function CAG_savePreferences(prefs) {
        try {
            localStorage.setItem(CAG_CONFIG.PREF_KEY, JSON.stringify(prefs));
            CAG_userPreferences = prefs;
            if (prefs.language) {
                CAG_languagePreference = prefs.language;
            }
            if (prefs.style) {
                CAG_stylePreference = prefs.style;
            }
        } catch (_) {
            // Silent fail
        }
    }

// ---------- ROSTER AGEN DINAMIS (dari .agent-checkbox dashboard) ----------
function CAG_humanizeAgentName(agent) {
        if (!agent || typeof agent !== 'string') {
            return '';
        }
        return agent
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
    }

function CAG_getAgentProfile(agent) {
        if (window.getAgentConfig) {
            const cfg = window.getAgentConfig(agent);
            if (cfg) {
                return {
                    name: cfg.name || cfg.displayName || CAG_humanizeAgentName(agent),
                    role: cfg.role || cfg.expertise || cfg.description || '',
                    emoji: cfg.emoji || cfg.icon || '',
                    systemPrompt: cfg.systemPrompt || ''
                };
            }
        }
        return { name: CAG_humanizeAgentName(agent), role: '', emoji: '', systemPrompt: '' };
    }

function CAG_getAgentDisplayName(agent) {
        const profile = CAG_getAgentProfile(agent);
        return (profile.emoji ? profile.emoji + ' ' : '') + profile.name;
    }

function CAG_getFullAgentPool() {
        let boxes = document.querySelectorAll('.agent-checkbox[data-agent]');
        if (boxes.length === 0 && window.KESEMPATAN?.AgentRenderer?.renderAllAgents) {
            window.KESEMPATAN?.AgentRenderer?.renderAllAgents();
            boxes = document.querySelectorAll('.agent-checkbox[data-agent]');
        }
        const seen = {};
        const pool = [];
        boxes.forEach(function(cb) {
            const agent = cb.dataset.agent;
            if (agent && !seen[agent]) {
                seen[agent] = true;
                pool.push(agent);
            }
        });
        return pool;
    }

function CAG_populateAgentSelect(selectEl) {
        if (!selectEl) {
            return;
        }
        const pool = CAG_getFullAgentPool();
        if (pool.length === 0) {
            selectEl.innerHTML = '<option value="">(Tidak ada agen terdeteksi dari dashboard)</option>';
            return;
        }
        selectEl.innerHTML = pool.map(function(agent) {
            return '<option value="' + CAG_escapeHtml(agent) + '">' + CAG_escapeHtml(CAG_getAgentDisplayName(agent)) + '</option>';
        }).join('');
    }

function CAG_getAgentAvatar(agent) {
        const profile = CAG_getAgentProfile(agent);
        return profile.emoji || '';
    }

// ---------- PANGGILAN AI ----------
async function CAG_callAI(prompt, apiKey) {
        if (CAG_currentAbortController) {
            CAG_currentAbortController.abort();
        }
        CAG_currentAbortController = new AbortController();
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                // DISAMAKAN dengan Debate/Tournament (800/0.7) atas
                // permintaan user — dulu 500/0.3 membuat respons Chat
                // Agent terasa lebih datar dibanding Debate.
                max_tokens: 1200,
                temperature: 0.7
            }),
            signal: CAG_currentAbortController.signal
        });
        const data = await response.json();
        if (data.choices?.[0]) {
            return data.choices[0].message.content;
        }
        throw new Error(data.error?.message || 'Gagal');
    }

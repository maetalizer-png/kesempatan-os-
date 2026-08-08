/* ============================================================
   interactive/forum/for-data-engine.js
   OTAK FORUM — cache, integrasi World/Memory/Database, smart
   search, penyusun prompt forum, panggilan AI.
   ============================================================ */

// ---------- CACHE SYSTEM ----------
function FOR_getCached(key) {
        const entry = FOR_queryCache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > FOR_CONFIG.CACHE_TTL) {
            FOR_queryCache.delete(key);
            return null;
        }
        return entry.data;
    }

function FOR_setCache(key, data) {
        if (FOR_queryCache.size >= FOR_CONFIG.MAX_CACHE) {
            const firstKey = FOR_queryCache.keys().next().value;
            FOR_queryCache.delete(firstKey);
        }
        FOR_queryCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

function FOR_clearCache() {
        FOR_queryCache.clear();
    }

function FOR_getCacheStats() {
        return {
            size: FOR_queryCache.size,
            maxSize: FOR_CONFIG.MAX_CACHE,
            keys: Array.from(FOR_queryCache.keys())
        };
    }

// ---------- INTEGRASI DATA (World / Memory / Database) ----------
function FOR_getStaticData() {
        return window.__STATIC_DATA || [];
    }

function FOR_getMemoryInstance() {
        return window.VectorMemory || window.VectorMemoryV5 || null;
    }

function FOR_getDatabaseInstance() {
        return window.KESDatabase || window.getDatabaseV10 || null;
    }

function FOR_smartSearch(query, data, threshold) {
        threshold = threshold || FOR_CONFIG.SEARCH_THRESHOLD;
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
                const queryEmbedding = window.MemoryUtils?.simpleEmbed ? 
                    window.MemoryUtils.simpleEmbed(query) : null;
                if (queryEmbedding && item.embedding) {
                    const sim = FOR_calculateSimilarity(queryEmbedding, item.embedding);
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
        
        return filtered.slice(0, FOR_CONFIG.MAX_RESULTS);
    }

function FOR_calculateSimilarity(vec1, vec2) {
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

function FOR_fetchStaticData(query) {
        const staticData = FOR_getStaticData();
        if (staticData.length === 0) {
            return [];
        }
        
        const results = FOR_smartSearch(query, staticData, FOR_CONFIG.SEARCH_THRESHOLD);
        results.forEach(function(item) {
            item._source = 'static';
            item._priority = 1;
        });
        
        return results;
    }

// ---------- FETCH KONTEKS (3 SUMBER) ----------
async function FOR_fetchFromVectorMemory(query, topK) {
        const memory = FOR_getMemoryInstance();
        if (!memory || typeof memory.search !== 'function') {
            return [];
        }
        
        try {
            const results = await memory.search(query, { 
                topK: topK || FOR_CONFIG.TOP_K_MEMORY,
                threshold: FOR_CONFIG.SEARCH_THRESHOLD
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

    // BARU: dulu Forum cuma MEMBACA dari Vector Memory, tidak pernah
    // menyimpan hasil diskusi kembali. Meniru pola yang sudah terbukti
    // di Debate (DEB_saveDebateToMemory), Chat AI, dan Chat Agent.
    async function FOR_saveMessageToMemory(userMessage, aiResponse, agentName) {
        const memory = FOR_getMemoryInstance();
        if (!memory) return;

        const metadata = {
            userMessage: userMessage,
            aiResponse: aiResponse,
            agent: agentName,
            timestamp: Date.now(),
            type: 'forum'
        };

        try {
            const fullText = 'User: ' + userMessage + '\\n' + (agentName || 'Forum') + ': ' + aiResponse;
            if (typeof memory.save === 'function') {
                await memory.save(fullText, metadata);
            } else if (typeof memory.add === 'function') {
                await memory.add(metadata);
            }
        } catch (_) {}
    }

async function FOR_fetchFromDatabase(query, limit) {
        const db = FOR_getDatabaseInstance();
        if (!db) {
            return [];
        }
        const maxResults = limit || FOR_CONFIG.DB_LIMIT;

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

async function FOR_getAllContext(query, options) {
        options = options || {};
        const cacheKey = query + '|' + JSON.stringify(options);
        
        const cached = FOR_getCached(cacheKey);
        if (cached && !options.forceRefresh) {
            return cached;
        }
        
        const startTime = Date.now();
        
        const [staticData, memoryData, dbData] = await Promise.all([
            new Promise(function(resolve) {
                resolve(FOR_fetchStaticData(query));
            }),
            new Promise(function(resolve) {
                FOR_fetchFromVectorMemory(query, options.topK || FOR_CONFIG.TOP_K_MEMORY).then(resolve);
            }),
            new Promise(function(resolve) {
                FOR_fetchFromDatabase(query, options.dbLimit || FOR_CONFIG.DB_LIMIT).then(resolve);
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
            if (window.OBS && typeof window.OBS.getSignals === 'function' && typeof window.OBS.generateAIInsight === 'function') {
                const signals = window.OBS.getSignals();
                if (signals && signals.length > 0) {
                    const insight = window.OBS.generateAIInsight(signals);
                    obsContext.marketInsight = (insight && insight.summary) ? insight.summary.replace(/<[^>]+>/g, '') : '';
                }
            }
        } catch (e) {}
        try {
            if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && query) {
                const check = window.NoisePage.checkText(query);
                if (check && check.blocked) {
                    obsContext.credibilityNote = 'Query mengandung kata yang perlu diverifikasi: ' + check.reason;
                }
            }
        } catch (e) {}

        const result = {
            static: staticData,
            memory: memoryData,
            database: dbData,
            observation: obsContext,
            combined: combined.slice(0, options.maxResults || FOR_CONFIG.MAX_RESULTS),
            totalSources: {
                static: staticData.length,
                memory: memoryData.length,
                database: dbData.length,
                total: combined.length
            },
            elapsed: Date.now() - startTime,
            query: query
        };
        
        FOR_setCache(cacheKey, result);
        
        return result;
    }

// ---------- BUILD PROMPT FORUM ----------
function FOR_buildForumPrompt(agent, role, question, context, agentSystemPrompt) {
        let prompt = 'Kamu adalah ' + agent + ', ' + role + '.\n\n';
        if (agentSystemPrompt) {
            // FIX KUALITAS: sebelumnya cuma "Kamu adalah X, role satu
            // kalimat". Sekarang selipkan PROFIL KEAHLIAN LENGKAP
            // (systemPrompt dari prompts/*.txt, sama yg dipakai Dashboard)
            // supaya jawaban forum benar2 mencerminkan keahlian spesifik
            // agen, bukan jawaban generik yg bisa ditulis agen mana pun.
            prompt += 'PROFIL & KEAHLIAN LENGKAP ANDA:\n' + agentSystemPrompt + '\n';
            prompt += '(CATATAN: instruksi "Output dalam format JSON" di profil di atas TIDAK berlaku di forum ini — tetap terapkan cara berpikir & ketajaman analisisnya, tapi jawab dengan bahasa natural sesuai instruksi di bawah, bukan JSON.)\n\n';
        }
        prompt += 'CARA MENJAWAB:\n';
        prompt += '1. Kalau DATA di bawah relevan dengan pertanyaan, jadikan itu rujukan utama dan jangan mengarang angka/fakta yang seharusnya berasal dari DATA tapi tidak ada di sana.\n';
        prompt += '2. Kalau pertanyaan tidak tercakup DATA di bawah, JAWAB TETAP dari pengetahuan dan keahlianmu sendiri sebagai ' + agent + ' — jangan menolak atau bilang "tidak tahu" hanya karena DATA kosong.\n';
        prompt += '3. Kalau kamu benar-benar tidak yakin (bukan sekadar karena DATA kosong), katakan dengan jujur, jangan mengarang.\n';
        prompt += '4. Jawaban harus jelas, terstruktur, dan langsung ke poin.\n\n';
        
        if (context && context.combined && context.combined.length > 0) {
            prompt += 'DATA YANG TERSEDIA (dari World/Memory/Database):\n';
            context.combined.slice(0, FOR_CONFIG.MAX_RESULTS).forEach(function(item, i) {
                const text = item.text || '';
                const source = item._source || 'unknown';
                let sourceLabel = 'Sumber';
                if (source === 'static') {
                    sourceLabel = 'World';
                } else if (source === 'memory') {
                    sourceLabel = 'Memory';
                } else if (source === 'database') {
                    sourceLabel = 'Database';
                }
                prompt += (i + 1) + '. [' + sourceLabel + '] ' + text.substring(0, 300) + '...\n';
            });
            prompt += '\nTotal data: ' + context.totalSources.total +
                      ' (World: ' + context.totalSources.static +
                      ', Memory: ' + context.totalSources.memory +
                      ', Database: ' + context.totalSources.database + ')\n';

            if (context.observation && context.observation.marketInsight) {
                prompt += '\nSENTIMEN PASAR/BERITA TERKINI:\n' + context.observation.marketInsight + '\n';
            }
            if (context.observation && context.observation.credibilityNote) {
                prompt += '\n' + context.observation.credibilityNote + '\n';
            }
        } else {
            prompt += '\n(Tidak ada data proyek yang relevan tersedia — jawab dari keahlianmu sendiri sebagai ' + agent + ')\n';
        }
        
        prompt += '\nPERTANYAAN: ' + question + '\n\n';
        prompt += 'JAWABAN (utamakan DATA di atas kalau relevan; kalau tidak, jawab dari keahlianmu sebagai ' + agent + '):';
        
        return prompt;
    }

// ---------- PREFERENSI ----------
function FOR_loadPreferences() {
        try {
            const saved = localStorage.getItem(FOR_CONFIG.PREF_KEY);
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

function FOR_savePreferences(prefs) {
        try {
            localStorage.setItem(FOR_CONFIG.PREF_KEY, JSON.stringify(prefs));
            FOR_userPreferences = prefs;
            if (prefs.language) {
                FOR_languagePreference = prefs.language;
            }
            if (prefs.style) {
                FOR_stylePreference = prefs.style;
            }
        } catch (_) {
            // Silent fail
        }
    }

// ---------- IDENTITAS AGEN ----------
function FOR_humanizeAgentName(agent) {
        if (!agent || typeof agent !== 'string') {
            return '';
        }
        return agent
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
    }

function FOR_getAgentProfile(agent) {
        if (window.getAgentConfig) {
            const cfg = window.getAgentConfig(agent);
            if (cfg) {
                return {
                    name: cfg.name || cfg.displayName || FOR_humanizeAgentName(agent),
                    role: cfg.role || cfg.expertise || cfg.description || '',
                    emoji: cfg.emoji || cfg.icon || '',
                    systemPrompt: cfg.systemPrompt || ''
                };
            }
        }
        return { name: FOR_humanizeAgentName(agent), role: '', emoji: '', systemPrompt: '' };
    }

function FOR_getAgentDisplayName(agent) {
        const profile = FOR_getAgentProfile(agent);
        return (profile.emoji ? profile.emoji + ' ' : '') + profile.name;
    }

function FOR_getAgentAvatar(agent) {
        const profile = FOR_getAgentProfile(agent);
        return profile.emoji || '';
    }

// ---------- PANGGILAN AI ----------
async function FOR_callAI(prompt, apiKey) {
        if (FOR_currentAbortController) {
            FOR_currentAbortController.abort();
        }
        FOR_currentAbortController = new AbortController();
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
                // permintaan user — dulu 500/0.3 membuat respons Forum
                // terasa lebih datar dibanding Debate.
                max_tokens: 1200,
                temperature: 0.7
            }),
            signal: FOR_currentAbortController.signal
        });
        const data = await response.json();
        if (data.choices?.[0]) {
            return data.choices[0].message.content;
        }
        throw new Error(data.error?.message || 'Gagal');
    }

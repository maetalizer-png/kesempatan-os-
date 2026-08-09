/* ============================================================
   interactive/chat-ai/cai-data-engine.js
   OTAK CHAT AI — cache, integrasi World/Memory/Database,
   smart search, deteksi sapaan & kabar, penyusun prompt.
   Butuh config.js & state.js sudah dimuat lebih dulu.
   ============================================================ */

// ---------- CACHE SYSTEM ----------
function CAI_getCached(key) {
        const entry = CAI_queryCache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > CAI_CONFIG.CACHE_TTL) {
            CAI_queryCache.delete(key);
            return null;
        }
        return entry.data;
    }

function CAI_setCache(key, data) {
        if (CAI_queryCache.size >= CAI_CONFIG.MAX_CACHE) {
            const firstKey = CAI_queryCache.keys().next().value;
            CAI_queryCache.delete(firstKey);
        }
        CAI_queryCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

function CAI_clearCache() {
        CAI_queryCache.clear();
    }

function CAI_getCacheStats() {
        return {
            size: CAI_queryCache.size,
            maxSize: CAI_CONFIG.MAX_CACHE,
            keys: Array.from(CAI_queryCache.keys())
        };
    }

// ---------- INTEGRASI DATA (World / Memory / Database) ----------
function CAI_getStaticData() {
        return window.__STATIC_DATA || [];
    }

function CAI_getMemoryInstance() {
        return window.KESEMPATAN?.VectorMemory || window.VectorMemory || window.VectorMemoryV5 || null;
    }

function CAI_getDatabaseInstance() {
        return window.KESDatabase || window.getDatabaseV10 || null;
    }

function CAI_smartSearch(query, data, threshold) {
        threshold = threshold || CAI_CONFIG.SEARCH_THRESHOLD;
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
                    const sim = CAI_calculateSimilarity(queryEmbedding, item.embedding);
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
        
        return filtered.slice(0, CAI_CONFIG.MAX_RESULTS);
    }

function CAI_calculateSimilarity(vec1, vec2) {
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

function CAI_fetchStaticData(query) {
        const staticData = CAI_getStaticData();
        if (staticData.length === 0) {
            return [];
        }
        
        const results = CAI_smartSearch(query, staticData, CAI_CONFIG.SEARCH_THRESHOLD);
        results.forEach(function(item) {
            item._source = 'static';
            item._priority = 1;
        });
        
        return results;
    }

// ---------- SAPAAN & KABAR (dataries/sapaan) ----------
function CAI_getGreetingData() {
        const fromStatic = CAI_getStaticData().filter(function(item) {
            return item.metadata && item.metadata.category === 'sapaan';
        });
        if (fromStatic.length > 0) {
            return fromStatic;
        }
        const register = window.__DATA_REGISTER || [];
        return register.filter(function(item) {
            return item.metadata && item.metadata.category === 'sapaan';
        });
    }

function CAI_detectGreetingIntent(message) {
        if (!message) return false;
        const trimmed = message.trim();
        if (trimmed.split(/\s+/).length > 4) return false; // terlalu panjang untuk sapaan murni
        return CAI_GREETING_PATTERNS.test(trimmed);
    }

function CAI_extractGreetingWord(message) {
        if (!message) return null;
        const match = CAI_GREETING_PATTERNS.exec(message.trim());
        if (!match) return null;
        const word = (match[2] || match[3] || '').toLowerCase();
        return word || null; // '' kalau cuma "halo"/"hai" tanpa kata waktu
    }

function CAI_getGreetingByWord(word) {
        if (!word) return null;
        const codeMap = { pagi: 'PAGI', siang: 'SIANG', sore: 'SORE', malam: 'MALAM', datang: 'DATANG' };
        const code = codeMap[word];
        if (!code) return null;
        return CAI_getGreetingData().find(function(item) {
            return item.metadata && item.metadata.type === 'waktu' && item.metadata.code === code;
        }) || null;
    }

function CAI_waitForGreetingData(maxWaitMs, requiredType) {
        maxWaitMs = maxWaitMs || 1500;
        function hasRequiredData() {
            const data = CAI_getGreetingData();
            if (!requiredType) return data.length > 0;
            return data.some(function(item) {
                return item.metadata && item.metadata.type === requiredType;
            });
        }
        return new Promise(function(resolve) {
            if (hasRequiredData()) {
                resolve();
                return;
            }
            const start = Date.now();
            const interval = setInterval(function() {
                if (hasRequiredData() || Date.now() - start > maxWaitMs) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        });
    }

function CAI_getTimeBasedGreeting(now) {
        now = now || new Date();
        const hour = now.getHours();
        const pool = CAI_getGreetingData().filter(function(item) {
            return item.metadata && item.metadata.type === 'waktu' && typeof item.metadata.jamMulai === 'number';
        });
        for (const item of pool) {
            const start = item.metadata.jamMulai;
            const end = item.metadata.jamSelesai;
            const inRange = start <= end
                ? (hour >= start && hour < end)
                : (hour >= start || hour < end); // rentang melewati tengah malam
            if (inRange) {
                return item;
            }
        }
        // Fallback: sapaan umum kalau tidak ada rentang jam yang cocok
        return CAI_getGreetingData().find(function(item) {
            return item.metadata && item.metadata.code === 'UMUM';
        }) || null;
    }

function CAI_getCountryGreeting(countryOrCode) {
        if (!countryOrCode) return null;
        const q = countryOrCode.toLowerCase();
        return CAI_getGreetingData().find(function(item) {
            if (!item.metadata || item.metadata.type !== 'negara') return false;
            const country = (item.metadata.country || '').toLowerCase();
            const code = (item.metadata.countryCode || '').toLowerCase();
            return country === q || code === q;
        }) || null;
    }

function CAI_getRegionalOrHolidayGreeting(message) {
        if (!message) {
            return null;
        }
        const lower = message.toLowerCase().trim();
        const candidates = CAI_getGreetingData().filter(function(item) {
            return item.metadata && (item.metadata.type === 'daerah' || item.metadata.type === 'hari-raya');
        });
        return candidates.find(function(item) {
            const name = (item.metadata.name || '').toLowerCase();
            const code = (item.metadata.code || '').toLowerCase().replace(/_/g, ' ');
            const firstWord = (item.text || '').split(/[!,.]/)[0].toLowerCase().trim();
            return lower.includes(firstWord) ||
                   (name && lower.includes(name)) ||
                   (code && lower.includes(code));
        }) || null;
    }

function CAI_detectKabarIntent(message) {
        if (!message) return false;
        const trimmed = message.trim();
        if (trimmed.split(/\s+/).length > 8) return false; // terlalu panjang untuk basa-basi kabar murni
        return CAI_KABAR_PATTERNS.test(trimmed);
    }

function CAI_getKabarReply(message) {
        const style = CAI_detectSpeakingStyle(message);
        if (style) {
            const matched = CAI_getKabarReplyByMood(style);
            if (matched) {
                return matched;
            }
        }
        const pool = CAI_getGreetingData().filter(function(item) {
            return item.metadata && item.metadata.type === 'kabar' && item.metadata.mood !== 'negara';
        });
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

function CAI_getKabarReplyByMood(mood) {
        const pool = CAI_getGreetingData().filter(function(item) {
            return item.metadata && item.metadata.type === 'kabar' && item.metadata.mood === mood;
        });
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

// ---------- FETCH KONTEKS (3 SUMBER) ----------
async function CAI_fetchFromVectorMemory(query, topK) {
        const memory = CAI_getMemoryInstance();
        if (!memory || typeof memory.search !== 'function') {
            return [];
        }
        
        try {
            const results = await memory.search(query, { 
                topK: topK || CAI_CONFIG.TOP_K_MEMORY,
                threshold: CAI_CONFIG.SEARCH_THRESHOLD
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

    // BARU: dulu Chat AI cuma MEMBACA dari Vector Memory, tidak pernah
    // menyimpan hasil percakapan kembali — jadi obrolan tidak pernah
    // "diingat" untuk sesi berikutnya. Meniru pola yang sudah terbukti
    // di Debate (DEB_saveDebateToMemory).
    async function CAI_saveMessageToMemory(userMessage, aiResponse) {
        const memory = CAI_getMemoryInstance();
        if (!memory) return;

        const metadata = {
            userMessage: userMessage,
            aiResponse: aiResponse,
            timestamp: Date.now(),
            type: 'chat-ai'
        };

        try {
            const fullText = 'User: ' + userMessage + '\\nAI: ' + aiResponse;
            if (typeof memory.save === 'function') {
                await memory.save(fullText, metadata);
            } else if (typeof memory.add === 'function') {
                await memory.add(metadata);
            }
        } catch (_) {
            // Diam saja — kegagalan simpan memori tidak boleh mengganggu
            // percakapan yang sedang berlangsung.
        }
    }

async function CAI_fetchFromDatabase(query, limit) {
        const db = CAI_getDatabaseInstance();
        if (!db) {
            return [];
        }
        const maxResults = limit || CAI_CONFIG.DB_LIMIT;

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

async function CAI_getAllContext(query, options) {
        options = options || {};
        const cacheKey = query + '|' + JSON.stringify(options);
        
        const cached = CAI_getCached(cacheKey);
        if (cached && !options.forceRefresh) {
            return cached;
        }
        
        const startTime = Date.now();
        
        const [staticData, memoryData, dbData] = await Promise.all([
            new Promise(function(resolve) {
                resolve(CAI_fetchStaticData(query));
            }),
            new Promise(function(resolve) {
                CAI_fetchFromVectorMemory(query, options.topK || CAI_CONFIG.TOP_K_MEMORY).then(resolve);
            }),
            new Promise(function(resolve) {
                CAI_fetchFromDatabase(query, options.dbLimit || CAI_CONFIG.DB_LIMIT).then(resolve);
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
        
        // BARU: OBSERVATION ENGINE + NOISE FILTERING — sentimen pasar/
        // berita real-time & cek kredibilitas dasar query, ditambahkan
        // sebagai field terpisah (bukan digabung ke combined[]) karena
        // bentuk datanya beda (ringkasan teks, bukan potongan pengetahuan
        // ber-id/skor seperti static/memory/database).
        let obsContext = { marketInsight: '', credibilityNote: '' };
        try {
            if (window.KESEMPATAN?.Observation && typeof window.KESEMPATAN?.Observation.getSignals === 'function' && typeof window.KESEMPATAN?.Observation.generateAIInsight === 'function') {
                const signals = window.KESEMPATAN?.Observation.getSignals();
                if (signals && signals.length > 0) {
                    const insight = window.KESEMPATAN?.Observation.generateAIInsight(signals);
                    obsContext.marketInsight = (insight && insight.summary) ? insight.summary.replace(/<[^>]+>/g, '') : '';
                }
            }
        } catch (e) { console.warn('[CaiDataEngine] Observation insight lookup failed:', e.message); }
        try {
            if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && query) {
                const check = window.NoisePage.checkText(query);
                if (check && check.blocked) {
                    obsContext.credibilityNote = 'Query mengandung kata yang perlu diverifikasi: ' + check.reason;
                }
            }
        } catch (e) { console.warn('[CaiDataEngine] NoisePage credibility check failed:', e.message); }

        const result = {
            static: staticData,
            memory: memoryData,
            database: dbData,
            observation: obsContext,
            combined: combined.slice(0, options.maxResults || CAI_CONFIG.MAX_RESULTS),
            totalSources: {
                static: staticData.length,
                memory: memoryData.length,
                database: dbData.length,
                total: combined.length
            },
            elapsed: Date.now() - startTime,
            query: query
        };
        
        CAI_setCache(cacheKey, result);
        
        return result;
    }

// ---------- BUILD PROMPT ----------
function CAI_buildChatPrompt(userMessage, context) {
        let prompt = CAI_PROMPT_SAPAN;
        
        if (context && context.combined && context.combined.length > 0) {
            prompt += '\nDATA YANG TERSEDIA (diurutkan berdasarkan prioritas):\n';
            
            context.combined.slice(0, CAI_CONFIG.MAX_RESULTS).forEach(function(item, i) {
                const text = item.text || '';
                const source = item._source || 'unknown';
                const priority = item._priority || 0;
                
                let sourceLabel = 'Sumber';
                let priorityLabel = '';
                
                if (source === 'static' && item.metadata && item.metadata.category === 'sapaan') {
                    sourceLabel = 'Sapaan (World)';
                } else if (source === 'static') {
                    sourceLabel = 'World';
                } else if (source === 'memory') {
                    sourceLabel = 'Memory';
                } else if (source === 'database') {
                    sourceLabel = 'Database';
                }
                
                if (priority === 1) {
                    priorityLabel = '⭐ PRIORITAS UTAMA';
                } else if (priority === 2) {
                    priorityLabel = 'Sekunder';
                } else if (priority === 3) {
                    priorityLabel = 'Tambahan';
                }
                
                prompt += (i + 1) + '. [' + sourceLabel + '] ' + text.substring(0, 500) + 
                          (priorityLabel ? ' (' + priorityLabel + ')' : '') + '\n';
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
            prompt += '\n(Tidak ada data proyek yang relevan tersedia — kalau pertanyaan bersifat umum, jawab dari pengetahuan umummu)\n';
        }
        
        prompt += '\nPERTANYAAN USER:\n' + userMessage + '\n\n';
        prompt += 'JAWABAN (utamakan DATA di atas kalau relevan; kalau pertanyaan umum di luar cakupan DATA, jawab dari pengetahuan umum secara akurat):';
        
        return prompt;
    }

// ---------- PANGGILAN AI ----------
async function CAI_callAI(prompt, apiKey) {
        if (CAI_currentAbortController) {
            CAI_currentAbortController.abort();
        }
        CAI_currentAbortController = new AbortController();

        if (apiKey) {
            try {
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
                        // permintaan user — dulu 500/0.3 membuat respons Chat AI
                        // terasa lebih datar dibanding Debate.
                        max_tokens: 1200,
                        temperature: 0.7
                    }),
                    signal: CAI_currentAbortController.signal
                });
                const data = await response.json();
                if (data.choices?.[0]) {
                    return data.choices[0].message.content;
                }
                throw new Error(data.error?.message || 'Gagal');
            } catch (error) {
                if (error.name === 'AbortError') throw error;
                // OpenRouter specifically failed (missing/invalid key, rate limit,
                // network) — fall through to the multi-provider fallback below
                // instead of failing outright, so Chat AI still works when the
                // user has a different provider (Groq/Gemini/Claude/etc) configured.
            }
        }

        const aiClients = window.KESEMPATAN?.AIClients || window.AIClients;
        if (aiClients && typeof aiClients.generateWithFallback === 'function') {
            return await aiClients.generateWithFallback(prompt, 'ChatAI');
        }
        throw new Error('Tidak ada provider AI yang tersedia. Masukkan API Key OpenRouter atau konfigurasi provider lain di Pengaturan.');
    }

/* ============================================================
   interactive/debate/deb-data-engine.js
   OTAK DEBAT — cache, smart search, integrasi World/Memory/
   Database, simpan hasil debat ke memory.
   ============================================================ */

    function DEB_getCached(key) {
        const entry = DEB_queryCache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() - entry.timestamp > DEB_CONFIG.CACHE_TTL) {
            DEB_queryCache.delete(key);
            return null;
        }
        return entry.data;
    }

    function DEB_setCache(key, data) {
        if (DEB_queryCache.size >= DEB_CONFIG.MAX_CACHE) {
            const firstKey = DEB_queryCache.keys().next().value;
            DEB_queryCache.delete(firstKey);
        }
        DEB_queryCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    function DEB_clearCache() {
        DEB_queryCache.clear();
    }

    function DEB_getCacheStats() {
        return {
            size: DEB_queryCache.size,
            maxSize: DEB_CONFIG.MAX_CACHE,
            keys: Array.from(DEB_queryCache.keys())
        };
    }

    // ============================================================
    // 4. SMART SEARCH — 6 FAKTOR SCORING!
    // ============================================================

    function DEB_smartSearch(query, data, threshold) {
        threshold = threshold || DEB_CONFIG.SEARCH_THRESHOLD;
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

            // FAKTOR 2: Semantic similarity
            if (item.embedding) {
                const queryEmbedding = window.KESEMPATAN?.Memory?.MemoryUtils?.simpleEmbed ?
                    window.KESEMPATAN.Memory.MemoryUtils.simpleEmbed(query) : null;
                if (queryEmbedding && item.embedding) {
                    const sim = DEB_calculateSimilarity(queryEmbedding, item.embedding);
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

            // FAKTOR 5: Length boost
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

        return filtered.slice(0, DEB_CONFIG.MAX_RESULTS);
    }

    // ============================================================
    // 5. SIMILARITY CALCULATOR
    // ============================================================
    function DEB_calculateSimilarity(vec1, vec2) {
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

    // ============================================================
    // 6. FUNGSI INTEGRASI EKSTERNAL
    // ============================================================

    function DEB_getMemoryInstance() {
        return window.VectorMemory || window.VectorMemoryV5 || null;
    }

    function DEB_getStaticData() {
        return window.__STATIC_DATA || [];
    }

    function DEB_getDatabaseInstance() {
        return window.KESDatabase || window.getDatabaseV10 || null;
    }

    // DARI WORLD.JS (STATIS) — PAKAI SMART SEARCH
    function DEB_fetchStaticData(topic) {
        const staticData = DEB_getStaticData();
        if (staticData.length === 0) {
            return [];
        }

        const results = DEB_smartSearch(topic, staticData, DEB_CONFIG.SEARCH_THRESHOLD);
        results.forEach(function(item) {
            item._source = 'static';
            item._priority = 1;
        });

        return results;
    }

    // DARI VECTOR MEMORY (DINAMIS)
    async function DEB_fetchFromVectorMemory(topic, topK) {
        const memory = DEB_getMemoryInstance();
        if (!memory || typeof memory.search !== 'function') {
            return [];
        }

        try {
            const results = await memory.search(topic, {
                topK: topK || DEB_CONFIG.TOP_K_MEMORY,
                threshold: DEB_CONFIG.SEARCH_THRESHOLD
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

    // DARI KES DATABASE
    async function DEB_fetchFromDatabase(topic, limit) {
        const db = DEB_getDatabaseInstance();
        if (!db) {
            return [];
        }
        const maxResults = limit || DEB_CONFIG.DB_LIMIT;

        // KESDatabase (kes-database.js) mengekspos API generik: query/get/
        // find/add/insert/save — bukan queryParser.parseAndExecute atau
        // executeQuery (API itu tidak pernah ada di implementasi sungguhan,
        // jadi lapisan Database selama ini selalu kosong). database/search.js
        // kemungkinan menambah method .search() — dicoba lebih dulu, lalu
        // fallback ke find/query yang memang ada di instance KESDatabase.
        const attempts = [
            function() { return db.search ? db.search(topic, { limit: maxResults }) : null; },
            function() { return db.find ? db.find({ text: topic, limit: maxResults }) : null; },
            function() { return db.find ? db.find(topic, maxResults) : null; },
            function() { return db.query ? db.query({ text: topic, limit: maxResults }) : null; },
            function() { return db.get ? db.get(topic) : null; }
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

    // GABUNGKAN SEMUA DARI 3 SUMBER — DENGAN CACHE & PARALLEL!
    async function DEB_getAllContext(topic, options) {
        options = options || {};
        const cacheKey = topic + '|' + JSON.stringify(options);

        const cached = DEB_getCached(cacheKey);
        if (cached && !options.forceRefresh) {
            return cached;
        }

        const startTime = Date.now();

        const [staticData, memoryData, dbData] = await Promise.all([
            new Promise(function(resolve) {
                resolve(DEB_fetchStaticData(topic));
            }),
            new Promise(function(resolve) {
                DEB_fetchFromVectorMemory(topic, options.topK || DEB_CONFIG.TOP_K_MEMORY).then(resolve);
            }),
            new Promise(function(resolve) {
                DEB_fetchFromDatabase(topic, options.dbLimit || DEB_CONFIG.DB_LIMIT).then(resolve);
            })
        ]);

        const combined = [];
        const seenIds = new Set();

        // PRIORITAS 1: STATIC DATA (World)
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
        } catch (e) {}
        try {
            if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && topic) {
                const check = window.NoisePage.checkText(topic);
                if (check && check.blocked) {
                    obsContext.credibilityNote = 'Topik mengandung kata yang perlu diverifikasi: ' + check.reason;
                }
            }
        } catch (e) {}

        const result = {
            static: staticData,
            memory: memoryData,
            database: dbData,
            observation: obsContext,
            combined: combined.slice(0, options.maxResults || DEB_CONFIG.MAX_RESULTS),
            totalSources: {
                static: staticData.length,
                memory: memoryData.length,
                database: dbData.length,
                total: combined.length
            },
            elapsed: Date.now() - startTime,
            topic: topic
        };

        DEB_setCache(cacheKey, result);

        return result;
    }

    async function DEB_saveDebateToMemory(debateData) {
        const memory = DEB_getMemoryInstance();
        const db = DEB_getDatabaseInstance();

        const metadata = {
            topic: debateData.topic,
            agentA: debateData.agentA,
            agentB: debateData.agentB,
            winner: debateData.winner,
            scoreA: debateData.scoreA,
            scoreB: debateData.scoreB,
            rounds: debateData.rounds,
            timestamp: Date.now(),
            type: 'debate'
        };

        if (memory) {
            try {
                let fullText = '';
                if (debateData.history && Array.isArray(debateData.history)) {
                    fullText = debateData.history.map(function(h) {
                        return h.sender + ': ' + h.message;
                    }).join('\n');
                }
                if (typeof memory.save === 'function') {
                    await memory.save(fullText || metadata.topic, metadata);
                } else if (typeof memory.add === 'function') {
                    await memory.add(metadata);
                }
            } catch (_) {}
        }

        if (db) {
            try {
                const record = { ...metadata, history: debateData.history || [] };
                if (db.saveQuantumEncrypted && typeof db.saveQuantumEncrypted === 'function') {
                    await db.saveQuantumEncrypted('debate_history', 'debate_' + Date.now(), record);
                } else if (db.insert && typeof db.insert === 'function') {
                    await db.insert('debate_history', record);
                } else if (db.save && typeof db.save === 'function') {
                    await db.save('debate_history', record);
                }
            } catch (_) {}
        }
    }

    // ============================================================
    // 7. SECURE CONFIGURATION
    // ============================================================

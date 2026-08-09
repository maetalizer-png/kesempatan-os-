/* ============================================================
   interactive/tournament/tor-data-engine.js
   OTAK TURNAMEN — integrasi World/Memory/Database, simpan
   hasil ke memory.
   ============================================================ */
    function TRN_getMemoryInstance() {
        return window.KESEMPATAN?.VectorMemory || window.VectorMemory || window.VectorMemoryV5 || null;
    }

    function TRN_getStaticData() {
        return window.__STATIC_DATA || [];
    }

    function TRN_getDatabaseInstance() {
        return window.KESDatabase || window.getDatabaseV10 || null;
    }

    function TRN_fetchStaticData(topic) {
        const staticData = TRN_getStaticData();
        if (staticData.length === 0) {
            return [];
        }
        
        const keywords = topic.toLowerCase().split(' ');
        const results = staticData.filter(function(item) {
            const text = (item.text || '').toLowerCase();
            return keywords.some(function(kw) {
                return text.includes(kw);
            });
        });
        
        results.sort(function(a, b) {
            const textA = (a.text || '').toLowerCase();
            const textB = (b.text || '').toLowerCase();
            let scoreA = 0;
            let scoreB = 0;
            keywords.forEach(function(kw) {
                if (textA.includes(kw)) {
                    scoreA++;
                }
                if (textB.includes(kw)) {
                    scoreB++;
                }
            });
            return scoreB - scoreA;
        });
        
        return results.slice(0, 5);
    }

    async function TRN_fetchFromVectorMemory(topic, topK) {
        const memory = TRN_getMemoryInstance();
        if (!memory || typeof memory.search !== 'function') {
            return [];
        }
        
        try {
            const results = await memory.search(topic, { topK: topK || 3 });
            return results || [];
        } catch (_) {
            return [];
        }
    }

    async function TRN_fetchFromDatabase(topic, limit) {
        const db = TRN_getDatabaseInstance();
        if (!db) {
            return [];
        }
        const maxResults = limit || 3;

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

    async function TRN_saveDebateToMemory(debateData) {
        const memory = TRN_getMemoryInstance();
        const db = TRN_getDatabaseInstance();
        
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
            } catch (_) { console.warn('[TorDataEngine] memory save failed'); }
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
            } catch (_) { console.warn('[TorDataEngine] db save failed'); }
        }
    }

    // ============================================================
    // 2. SECURE CONFIGURATION
    // ============================================================

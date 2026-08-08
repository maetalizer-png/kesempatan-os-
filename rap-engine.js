/* ============================================================
   📁 rap/engine.js
   🔥 RAP ENGINE v5.0 — INTEGRATOR 3 ENGINE!
   🔥 FIX: persona.vibe → persona.signature (bug fix)
   🔥 ENHANCE: Prompt dengan CONTOH RAPPER ASLI + STORYTELLING
   🔥 ENHANCE: Temperature lebih tinggi untuk kreativitas maksimal
   🔥 ENHANCE: Fokus ke CERITA & EMOSI, bukan teknis
   ============================================================ */

(function() {
    'use strict';

    if (window.__RapEngineWrapper) return;
    window.__RapEngineWrapper = true;

    // ============================================================
    // 1. CEK 3 ENGINE SUDAH LOAD
    // ============================================================
    
    const CharacterEngine = window.RapCharacterEngine;
    const IntelligenceEngine = window.RapIntelligenceEngine;
    const OptimizerEngine = window.RapOptimizerEngine;

    if (!CharacterEngine || !IntelligenceEngine || !OptimizerEngine) {
        return;
    }

    // ============================================================
    // 2. RAP ENGINE — INTEGRATOR
    // ============================================================
    
    const RapEngine = {
        // ============================================================
        // 🔥 CHARACTER ENGINE
        // ============================================================
        
        getPersona: function(agent) {
            return CharacterEngine.getPersona(agent);
        },
        
        getEmotion: function(round, totalRounds) {
            return CharacterEngine.getEmotion(round, totalRounds);
        },

        getEmotionModifier: function(round, totalRounds) {
            return CharacterEngine.getEmotionModifier ? CharacterEngine.getEmotionModifier(round, totalRounds) : { rateMult: 1, pitchMult: 1 };
        },
        
        getAllPersonas: function() {
            return CharacterEngine.getAllPersonas();
        },

        // 🔥 BARU: roster lengkap untuk UI "Cypher Lounge" & profil suara
        getAllPersonaCards: function() {
            return CharacterEngine.getAllPersonaCards ? CharacterEngine.getAllPersonaCards() : [];
        },

        getVoiceProfile: function(agent) {
            return CharacterEngine.getVoiceProfile ? CharacterEngine.getVoiceProfile(agent) : null;
        },
        
        // ============================================================
        // 🔥 INTELLIGENCE ENGINE
        // ============================================================
        
        getAgents: function() {
            return IntelligenceEngine.AGENTS;
        },
        
        createBattleDirector: function(topic, agentA, agentB, rounds) {
            return new IntelligenceEngine.BattleDirector(topic, agentA, agentB, rounds);
        },
        
        predictCrowdReaction: function(verse) {
            return IntelligenceEngine.predictCrowdReaction(verse);
        },
        
        getReactions: function() {
            return IntelligenceEngine.REACTIONS;
        },
        
        getBattlePlan: function(round, totalRounds) {
            return IntelligenceEngine.getBattlePlan(round, totalRounds);
        },
        
        // ============================================================
        // 🔥 OPTIMIZER ENGINE
        // ============================================================
        
        learn: function(battleResult) {
            return OptimizerEngine.LearningEngine.learn(battleResult);
        },
        
        getLessons: function() {
            return OptimizerEngine.LearningEngine.getLessons();
        },
        
        optimizeVerse: function(verse, issues) {
            return OptimizerEngine.optimizeVerse(verse, issues);
        },
        
        checkQuality: function(verse) {
            return OptimizerEngine.checkQuality(verse);
        },
        
        // ============================================================
        // 🔥 AI CALL — DENGAN TEMPERATURE LEBIH TINGGI
        // ============================================================
        
        callAI: async function(prompt, apiKey) {
            const controller = new AbortController();
            // 🔥 Timeout dipangkas 30s → 18s. Bersama fix di optimizer.js
            // (ritme tidak lagi memaksa retry), ini memangkas jeda mulai
            // battle secara signifikan — sebelumnya worst-case bisa nunggu
            // 3× percobaan × 30 detik sebelum baris pertama muncul.
            const timeoutId = setTimeout(() => controller.abort(), 18000);

            // 🔥 Ambil temperature & max_tokens dari CONFIG
            let temperature = 1.0;
            let maxTokens = 800;
            try {
                if (window.RapConfig && window.RapConfig.CONFIG) {
                    const cfg = window.RapConfig.CONFIG;
                    if (cfg.AI_TEMPERATURE) temperature = cfg.AI_TEMPERATURE;
                    if (cfg.AI_MAX_TOKENS) maxTokens = cfg.AI_MAX_TOKENS;
                }
            } catch(e) {}

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
                        max_tokens: maxTokens,
                        temperature: temperature    // 🔥 Lebih tinggi = lebih kreatif
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                const data = await response.json();
                if (data.choices && data.choices[0]) {
                    return data.choices[0].message.content;
                }
                throw new Error(data.error?.message || 'Gagal');
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('API timeout setelah 18 detik');
                }
                throw error;
            }
        },
        
        // ============================================================
        // 🔥 GET RAP — GENERATE DENGAN QUALITY CONTROL
        // ============================================================
        
        getRap: async function(agent, topic, opponentRap, round, totalRounds, apiKey, memory, memoryContext, songContext) {
            // 🔥 3 → 2 percobaan maksimal. Dulu tiap verse bisa memicu
            // sampai 3 panggilan AI berurutan (worst-case ~90 detik cuma
            // untuk 1 baris pertama). Bersama fix optimizer.js, mayoritas
            // verse sekarang lolos di percobaan pertama.
            const MAX_GEN_ATTEMPTS = 2;
            
            let correction = null;
            let best = null;

            for (let attempt = 1; attempt <= MAX_GEN_ATTEMPTS; attempt++) {
                const prompt = this.buildRapPrompt(agent, topic, opponentRap, round, totalRounds, memory, correction, memoryContext, songContext);
                
                let verse;
                try {
                    verse = await this.callAI(prompt, apiKey);
                } catch (e) {
                    return 'Yo! Aku ' + agent + ', yang terbaik di sini! 🎤';
                }

                const quality = this.checkQuality(verse);
                
                if (!best || quality.score > best.quality.score) {
                    best = { verse: verse, quality: quality };
                }
                
                if (quality.isProfessional || attempt === MAX_GEN_ATTEMPTS) {
                    if (memory) {
                        const sig = this._extractSignature(best.verse);
                        sig.endings.forEach(function(e) { memory.usedEndings.add(e); });
                        memory.ownVerses.push(best.verse);
                        if (memory.ownVerses.length > 2) memory.ownVerses.shift();
                    }
                    return best.verse;
                }
                
                correction = 'Percobaan sebelumnya bermasalah: ' + quality.issues.join(', ') + '. Perbaiki itu!';
            }
            
            return best ? best.verse : 'Yo! Aku ' + agent + ', yang terbaik di sini! 🎤';
        },
        
        // ============================================================
        // 🔥 JUDGE — PENILAIAN PROFESIONAL DENGAN BREAKDOWN
        // ============================================================
        
        judgeRap: async function(topic, agentA, agentB, rapA, rapB, apiKey) {
            const qualityA = this.checkQuality(rapA);
            const qualityB = this.checkQuality(rapB);

            const prompt = 'Kamu adalah juri RAP BATTLE internasional profesional. Nilai battle antara ' +
                agentA + ' vs ' + agentB + ' tentang "' + topic + '".\n\n' +
                'FULL VERSE ' + agentA + ':\n' + rapA + '\n\n' +
                'FULL VERSE ' + agentB + ':\n' + rapB + '\n\n' +
                '📊 QUALITY SCORE (otomatis):\n' +
                agentA + ': ' + qualityA.score + '/100 (Issues: ' + qualityA.issues.join(', ') + ')\n' +
                agentB + ': ' + qualityB.score + '/100 (Issues: ' + qualityB.issues.join(', ') + ')\n\n' +
                '🎯 KRITERIA PENILAIAN (5 kriteria):\n' +
                '1. Rhyme quality (teknik rima)\n' +
                '2. Flow & cadence (aliran & irama)\n' +
                '3. Punchline/wordplay strength (kekuatan lirik)\n' +
                '4. Kreativitas & orisinalitas\n' +
                '5. Seberapa telak respons terhadap lawan\n\n' +
                'Output HANYA JSON valid (tanpa markdown):\n' +
                '{ "winner": "nama pemenang", "reason": "alasan singkat", "scoreA": 0-100, "scoreB": 0-100, "breakdown": { "rhyme": { "A": 0-100, "B": 0-100 }, "flow": { "A": 0-100, "B": 0-100 }, "punchline": { "A": 0-100, "B": 0-100 }, "creativity": { "A": 0-100, "B": 0-100 } } }';

            try {
                const result = await this.callAI(prompt, apiKey);
                let cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
                const first = cleaned.indexOf('{');
                const last = cleaned.lastIndexOf('}');
                if (first !== -1 && last !== -1) {
                    cleaned = cleaned.slice(first, last + 1);
                }
                const parsed = JSON.parse(cleaned);
                if (!parsed.breakdown) {
                    parsed.breakdown = {
                        rhyme: { A: 0, B: 0 },
                        flow: { A: 0, B: 0 },
                        punchline: { A: 0, B: 0 },
                        creativity: { A: 0, B: 0 }
                    };
                }
                return parsed;
            } catch(e) {
                const winner = qualityA.score >= qualityB.score ? 
                    window.RapHelpers.getDisplayName(agentA) : 
                    window.RapHelpers.getDisplayName(agentB);
                return {
                    winner: winner,
                    reason: 'Penilaian berdasarkan quality score',
                    scoreA: qualityA.score,
                    scoreB: qualityB.score,
                    breakdown: {
                        rhyme: { A: qualityA.rhymes * 20, B: qualityB.rhymes * 20 },
                        flow: { A: qualityA.score, B: qualityB.score },
                        punchline: { A: qualityA.punchlines.length * 20, B: qualityB.punchlines.length * 20 },
                        creativity: { A: 50, B: 50 }
                    }
                };
            }
        },
        
        // ============================================================
        // 🔥 BUILD PROMPT — DENGAN CONTOH RAPPER & STORYTELLING
        // ============================================================
        
        buildRapPrompt: function(agent, topic, opponentRap, round, totalRounds, memory, correction, memoryContext, songContext) {
            const persona = this.getPersona(agent);
            const emotion = this.getEmotion(round, totalRounds);
            const plan = this.getBattlePlan(round, totalRounds);
            
            const staticData = this._fetchRelevantData(topic);
            const opponentAnalysis = opponentRap ? this._analyzeOpponent(opponentRap) : null;

            // 🔥 BUILD CONTOH GAYA dari persona
            let styleExamples = '';
            if (persona.styleExample && persona.styleExample.length > 0) {
                styleExamples = '\n🎤 CONTOH GAYA RAP KAMU (pelajari ini!):\n';
                persona.styleExample.forEach(function(line, i) {
                    styleExamples += '  ' + (i + 1) + '. "' + line + '"\n';
                });
                styleExamples += '\n';
            }

            let vibeWords = '';
            if (persona.vibeWords && persona.vibeWords.length > 0) {
                vibeWords = '🎯 KATA-KATA VIBE KAMU: ' + persona.vibeWords.join(', ') + '\n\n';
            }

            // 🔥 LAGU/BEAT AKTIF — supaya verse terasa MENYATU dengan lagu
            // yang sedang diputar (fitur lagu), bukan sekadar dibacakan
            // di atasnya. Kalau ronde ini kebetulan ronde "Callback"
            // (lihat BATTLE_PLANS di intelligence.js), rapper didorong
            // secara eksplisit menyanyikan ulang/memelesetkan hook lagu —
            // momen "hook callback" seperti di panggung battle internasional.
            let songSection = '';
            if (songContext && songContext.hook) {
                songSection = '🎵 LAGU/BEAT SAAT INI: "' + songContext.title + '" (' + songContext.genre +
                    ', ' + songContext.bpm + ' BPM, mood: ' + songContext.mood + ')\n' +
                    'Hook lagu ini: "' + songContext.hook + '"\n';
                if (plan.strategy === 'Callback') {
                    songSection += '🔥 INI RONDE CALLBACK: sisipkan atau plesetkan hook lagu ini di verse-mu — ' +
                        'seperti rapper yang "menyanyikan" ulang hook di momen klimaks battle, bikin penonton ikut teriak.\n';
                } else {
                    songSection += 'Sesekali gemakan mood/hook ini secara halus supaya versemu terasa satu nafas dengan lagunya.\n';
                }
                songSection += '\n';
            }

            // 🔥 PROMPT — FOKUS CERITA & EMOSI
            let prompt = '🔥 KAMU ADALAH RAPPER PROFESIONAL KELAS DUNIA — INI PANGGUNG INTERNASIONAL!\n\n' +
                'Nama: ' + agent + '\n' +
                'Persona: ' + persona.archetype + '\n' +
                'Signature: ' + persona.signature + '\n' +
                'Cara berpikir: ' + persona.thinking + '\n' +
                'Cara menyerang: ' + persona.attack + '\n' +
                'Catchphrase: "' + persona.catchphrase + '"\n' +
                'Emosi: ' + emotion.name + '\n' +
                'Stage presence: ' + persona.stage + '\n' +
                '🎤 Gaya Rap: ' + persona.flow + '\n' +
                '💥 Punchline Style: ' + persona.punchline + '\n' +
                '😂 Humor Style: ' + persona.humor + '\n\n' +
                vibeWords +
                styleExamples +
                songSection +

                '📌 TOPIK RAP BATTLE: "' + topic + '"\n' +
                '🎯 RONDE ' + round + ': ' + plan.strategy + ' (' + plan.goal + ')\n\n' +

                '📝 CARA MENULIS RAP YANG BAIK (seperti rapper asli):\n' +
                '  - CERITAKAN sesuatu! Bukan sekadar "bicara tentang topik", tapi "ceritakan pengalaman" tentang topik itu.\n' +
                '  - PAKAI EMOSI: tulis dengan perasaan, bukan dengan logika. Marah? Sedih? Bangga? Ejekan? Tuangkan!\n' +
                '  - JADI DIRI SENDIRI: jangan meniru rapper lain. Tunjukkan kepribadian dan sudut pandang unikmu.\n' +
                '  - PUNCHLINE YANG MENUSUK: setiap beberapa baris, kasih satu kalimat yang "nusuk" dan berkesan.\n' +
                '  - RIMA ITU ALAT, BUKAN TUJUAN: rima membantu flow, tapi jangan paksakan sampai makna jadi kacau.\n' +
                '  - FLOW YANG ENTAK: jangan kaku. Panjang baris boleh bervariasi untuk efek dramatis.\n' +
                '  - AKHIRI DENGAN "mic drop!" — itu penanda kemenangan.\n\n' +

                '🌍 TEKNIK PENULISAN LIRIK KELAS DUNIA (supaya verse bisa jadi LAGU, bukan cuma dibacakan):\n' +
                '  - MULTISYLLABLE RHYME: sesekali samakan 2-3 suku kata terakhir antar baris, bukan cuma 1 huruf akhir.\n' +
                '  - INTERNAL RHYME: selipkan rima di TENGAH baris, bukan cuma di akhir — bikin flow terasa padat & profesional.\n' +
                '  - ALITERASI & ASONANSI: mainkan pengulangan bunyi konsonan/vokal biar baris enak diucapkan & "nempel" di telinga.\n' +
                '  - BREATH CONTROL: bayangkan napasmu sendiri saat membacakan ini — sisipkan jeda alami (koma, akhir klausa) supaya nggak kedengaran seperti membaca daftar.\n' +
                '  - CLOSING COUPLET: 2 baris terakhir harus jadi satu unit yang paling gampang diingat & dinyanyikan ulang — itu yang bikin sebuah verse jadi lagu, bukan cuma battle line.\n\n' +

                '🎯 YANG HARUS KAMU LAKUKAN:\n' +
                '  - Tulis 8-16 baris rap yang KERAS, TAJAM, dan BERKARAKTER.\n' +
                '  - Gunakan persona dan gaya di atas.\n' +
                '  - Ceritakan sudut pandangmu tentang topik ini, serang lawan jika perlu.\n' +
                '  - Akhiri dengan "mic drop!"\n' +
                '  - ⚠️ JANGAN PAKAI MARKDOWN: tanpa tanda bintang (**tebal**, *miring*), tanpa tanda pagar (#), tanpa list bernomor. Tulis PLAIN TEXT murni — verse ini akan dibacakan lewat suara (text-to-speech), tanda baca markdown akan ikut terbaca aneh.\n\n';

            // Tambahan data & fakta
            if (staticData.length > 0) {
                prompt += '📊 DATA & FAKTA (bisa dipakai untuk memperkuat argumen):\n';
                staticData.slice(0, 3).forEach(function(item, i) {
                    prompt += (i + 1) + '. ' + (item.text || '').substring(0, 200) + '...\n';
                });
                prompt += '\n';
            }

            const obsContext = this._fetchObservationContext(topic);
            if (obsContext.marketInsight) {
                prompt += '📡 SENTIMEN PASAR/BERITA TERKINI (bisa dipakai buat argumen):\n' + obsContext.marketInsight + '\n\n';
            }
            if (obsContext.credibilityNote) {
                prompt += obsContext.credibilityNote + '\n\n';
            }

            // Analisis kelemahan lawan
            if (opponentAnalysis && opponentAnalysis.weaknesses.length > 0) {
                prompt += '🎯 KELEMAHAN LAWAN (manfaatkan ini!):\n';
                opponentAnalysis.weaknesses.forEach(function(w) {
                    prompt += '  - ' + w + '\n';
                });
                prompt += '\n';
            }

            // Inspirasi battle sebelumnya
            if (memoryContext && memoryContext.length > 0) {
                prompt += '🔮 INSPIRASI DARI BATTLE SEBELUMNYA:\n';
                memoryContext.slice(0, 2).forEach(function(item, i) {
                    prompt += (i + 1) + '. ' + (item.text || '').substring(0, 150) + '...\n';
                });
                prompt += '\n';
            }

            // Verse lawan (untuk dibalas)
            if (opponentRap) {
                prompt += '🗣️ VERSE LAWAN (balas ini!):\n' + opponentRap.substring(0, 400) + '\n\n';
            }

            // Koreksi dari percobaan sebelumnya
            if (correction) {
                prompt += '⚠️ PERBAIKAN DARI PERCOBAAN SEBELUMNYA: ' + correction + '\n\n';
            }

            prompt += '🔥 OUTPUT: HANYA teks rap (baris per baris), tanpa judul, tanpa penjelasan tambahan.\n' +
                'TULIS DARI HATI, SERANG DENGAN KATA-KATA, HIDUPKAN PERSONA-MU!\n' +
                'JANGAN PAKAI ASTERISK (*) ATAU TANDA BACA BERLEBIHAN. LANGKUNG RAP!';
            
            return prompt;
        },
        
        // ============================================================
        // 🔥 PRIVATE METHODS (TETAP SAMA)
        // ============================================================
        
        _fetchRelevantData: function(topic) {
            const staticData = window.__STATIC_DATA || [];
            if (staticData.length === 0) return [];
            
            const keywords = topic.toLowerCase().split(' ');
            const results = staticData.filter(function(item) {
                const text = (item.text || '').toLowerCase();
                return keywords.some(function(kw) { return text.includes(kw); });
            });
            
            results.sort(function(a, b) {
                const textA = (a.text || '').toLowerCase();
                const textB = (b.text || '').toLowerCase();
                let scoreA = 0, scoreB = 0;
                keywords.forEach(function(kw) {
                    if (textA.includes(kw)) scoreA++;
                    if (textB.includes(kw)) scoreB++;
                });
                return scoreB - scoreA;
            });
            
            return results.slice(0, 5);
        },

        // 🔥 BARU: OBSERVATION ENGINE + NOISE FILTERING — sentimen pasar/
        // berita real-time & cek kredibilitas dasar topik, meniru pola
        // _fetchRelevantData di atas. Toleran kalau modul belum termuat.
        _fetchObservationContext: function(topic) {
            let marketInsight = '';
            let credibilityNote = '';
            try {
                if (window.OBS && typeof window.OBS.getSignals === 'function' && typeof window.OBS.generateAIInsight === 'function') {
                    const signals = window.OBS.getSignals();
                    if (signals && signals.length > 0) {
                        const insight = window.OBS.generateAIInsight(signals);
                        marketInsight = (insight && insight.summary) ? insight.summary.replace(/<[^>]+>/g, '') : '';
                    }
                }
            } catch (e) {}
            try {
                if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && topic) {
                    const check = window.NoisePage.checkText(topic);
                    if (check && check.blocked) {
                        credibilityNote = '⚠️ Topik mengandung kata yang perlu diverifikasi: ' + check.reason;
                    }
                }
            } catch (e) {}
            return { marketInsight: marketInsight, credibilityNote: credibilityNote };
        },
        
        _analyzeOpponent: function(opponentVerse) {
            if (!opponentVerse) {
                return { keywords: [], repeatedWords: [], weaknesses: [] };
            }
            
            const lines = opponentVerse.split('\n').filter(function(l) { return l.trim().length > 0; });
            const words = opponentVerse.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
            
            const freq = {};
            const stopwords = new Set(['yang','dan','di','ke','dari','ini','itu','untuk','dengan','pada','adalah',
                'aku','kamu','kau','saya','anda','dia','kita','kami','akan','sudah','belum','tidak','bukan',
                'atau','juga','saja','lagi','karena','jadi','ada','apa','siapa','bisa','harus','masih','pun','yg']);
            
            words.forEach(function(w) {
                if (w.length > 4 && !stopwords.has(w)) {
                    freq[w] = (freq[w] || 0) + 1;
                }
            });
            
            const sorted = Object.entries(freq).sort(function(a, b) { return b[1] - a[1]; });
            const keywords = sorted.slice(0, 6).map(function(e) { return e[0]; });
            const repeatedWords = sorted.filter(function(e) { return e[1] >= 3; }).map(function(e) { return e[0]; });
            
            const weaknesses = [];
            if (lines.length < 4) weaknesses.push('Verse terlalu pendek, kurang isi');
            if (words.length < 40) weaknesses.push('Kurang kata, terkesan malas');
            if (repeatedWords.length > 2) weaknesses.push('Banyak pengulangan kata, kurang variasi');
            
            const cliches = ['aku yang terbaik', 'yo yo', 'siapkan mental', 'kau cuma bayang'];
            cliches.forEach(function(c) {
                if (opponentVerse.toLowerCase().includes(c)) {
                    weaknesses.push('Mengandung klise: "' + c + '"');
                }
            });
            
            return {
                keywords: keywords,
                repeatedWords: repeatedWords,
                weaknesses: weaknesses,
                lineCount: lines.length
            };
        },
        
        _extractSignature: function(verse) {
            const lines = verse.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
            const endings = lines.map(function(l) {
                const w = l.split(/\s+/);
                return (w[w.length - 1] || '').slice(-3);
            }).filter(function(s) { return s.length >= 2; });
            return { endings: endings };
        }
    };

    // ============================================================
    // 3. EXPOSE
    // ============================================================
    
    window.RapEngine = RapEngine;

})();
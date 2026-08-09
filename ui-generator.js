/* ============================================================
   KESEMPATAN OS v18.6 — UI GENERATOR (FULL INTEGRASI)
   ✅ Generate podcast text, chapters, debate, AI context
   ✅ FIX: cooldown untuk mencegah generate beruntun
   ✅ FIX: guard isGenerating tetap
   ✅ TERINTEGRASI DENGAN MEMORY.JS, WORLD.JS, & KES DATABASE!
   ✅ AMBIL DATA STATIS DARI __STATIC_DATA
   ✅ AMBIL DATA DINAMIS DARI VECTOR MEMORY
   ✅ AMBIL DATA HISTORIS DARI KES DATABASE
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (KESEMPATAN.Podcast && KESEMPATAN.Podcast.uiGenerator) return;
    KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

    const core = KESEMPATAN.Podcast.core;
    const config = KESEMPATAN.Podcast.config;
    const renderer = KESEMPATAN.Podcast.uiRenderer;
    if (!core || !config || !renderer) {
        return;
    }

    const state = core.state;
    const VOICE_PRESETS = config.VOICE_PRESETS;
    const AGENT_VOICES = config.AGENT_VOICES;
    const showToast = renderer.showToast;
    const sanitizeHtml = renderer.sanitizeHtml;

    // ========== COOLDOWN ==========
    let lastGenerateTime = 0;
    const GENERATE_COOLDOWN = 2000;

    // ============================================================
    // 🔥 FUNGSI BANTU AMBIL TOPIK
    // ============================================================
    // 🆕 Normalisasi kode bahasa dropdown (18 pilihan) ke kunci konten yang
    // benar-benar didukung penuh oleh generateText() (id/en/de). Varian
    // English (en_uk/en_au) dipetakan ke 'en'. Bahasa lain fallback ke 'id'
    // - jujur, bukan pura-pura semua 18 bahasa punya naskah asli.
    let langFallbackWarned = {};
    function contentLangKey(currentLang) {
        if (currentLang === 'en' || currentLang === 'en_uk' || currentLang === 'en_au') return 'en';
        if (currentLang === 'de') return 'de';
        if (currentLang !== 'id' && !langFallbackWarned[currentLang]) {
            langFallbackWarned[currentLang] = true;
            const langName = (config.LANGUAGES[currentLang] && config.LANGUAGES[currentLang].label) || currentLang;
            if (renderer.showToast) {
                renderer.showToast('ℹ️ Naskah ' + langName + ' belum didukung penuh, memakai Bahasa Indonesia. Suara tetap pakai aksen ' + langName + '.', 'info');
            }
        }
        return 'id';
    }

    function getTopic() {
        const podcastInput = document.getElementById('podcastTopicInput');
        const dashboardInput = document.getElementById('topicInput');
        let topic = podcastInput && podcastInput.value.trim()
            ? podcastInput.value.trim()
            : (dashboardInput ? dashboardInput.value.trim() : '');
        if (!topic) {
            // FIX UX: sebelumnya string placeholder "Topik tidak disebutkan"
            // dipakai LANGSUNG sebagai kata benda topik di kalimat template
            // ("Peluang Topik tidak disebutkan sangat menjanjikan..."), bikin
            // gramatikal rusak dan kelihatan seperti bug AI. Sekarang pakai
            // topik umum yang tetap masuk akal secara bahasa, plus kasih tahu
            // user kenapa - bukan diam-diam menghasilkan kalimat aneh.
            if (renderer.showToast) {
                renderer.showToast('💡 Belum ada topik diisi - pakai topik umum. Isi kolom Topik di atas untuk hasil yang lebih relevan.', 'info');
            }
            topic = 'peluang bisnis dan pengembangan diri';
        }
        return topic;
    }

    // ============================================================
    // 🔥 AMBIL DATA STATIS DARI WORLD.JS
    // ============================================================
    function fetchStaticData(topic) {
        const staticData = window.__STATIC_DATA || [];
        if (staticData.length === 0) return [];
        
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
            let scoreA = 0, scoreB = 0;
            keywords.forEach(function(kw) {
                if (textA.includes(kw)) scoreA++;
                if (textB.includes(kw)) scoreB++;
            });
            return scoreB - scoreA;
        });
        
        return results.slice(0, 5);
    }

    // ============================================================
    // 🔥 BARU: OBSERVATION ENGINE + NOISE FILTERING — konteks sentimen
    // pasar/berita real-time dan pengecekan kredibilitas dasar topik,
    // meniru pola fetchStaticData di atas. Dibuat toleran kalau modulnya
    // belum termuat (tidak boleh menggagalkan generate podcast).
    // ============================================================
    function fetchObservationContext(topic) {
        let marketInsight = '';
        let credibilityNote = '';
        try {
            if (window.KESEMPATAN?.Observation && typeof window.KESEMPATAN?.Observation.getSignals === 'function' && typeof window.KESEMPATAN?.Observation.generateAIInsight === 'function') {
                const signals = window.KESEMPATAN?.Observation.getSignals();
                if (signals && signals.length > 0) {
                    const insight = window.KESEMPATAN?.Observation.generateAIInsight(signals);
                    marketInsight = (insight && insight.summary) ? insight.summary.replace(/<[^>]+>/g, '') : '';
                }
            }
        } catch (e) { console.warn('[Podcast] Non-fatal error:', e.message); }
        try {
            if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && topic) {
                const check = window.NoisePage.checkText(topic);
                if (check && check.blocked) {
                    credibilityNote = '⚠️ Topik mengandung kata yang perlu diverifikasi: ' + check.reason;
                }
            }
        } catch (e) { console.warn('[Podcast] Non-fatal error:', e.message); }
        return { marketInsight: marketInsight, credibilityNote: credibilityNote };
    }

    // ============================================================
    // 🔥 AMBIL DARI VECTOR MEMORY
    // ============================================================
    async function fetchFromVectorMemory(topic, topK) {
        const memory = window.KESEMPATAN?.VectorMemory || window.VectorMemory || window.VectorMemoryV5;
        if (!memory || typeof memory.search !== 'function') return [];
        
        try {
            const results = await memory.search(topic, { topK: topK || 3 });
            return results || [];
        } catch (_) {
            return [];
        }
    }

    // ============================================================
    // 🔥 AMBIL DARI KES DATABASE
    // ============================================================
    async function fetchFromDatabase(topic, limit) {
        const db = window.KESDatabase || window.getDatabaseV10;
        if (!db) return [];
        
        try {
            let results = [];
            if (db.queryParser && typeof db.queryParser.parseAndExecute === 'function') {
                const sql = "SELECT * FROM podcast_history WHERE topic LIKE '%" + topic + "%' ORDER BY timestamp DESC LIMIT " + (limit || 3);
                results = await db.queryParser.parseAndExecute(sql);
            } else if (db.executeQuery && typeof db.executeQuery === 'function') {
                results = await db.executeQuery("SELECT * FROM podcast_history WHERE topic LIKE '%" + topic + "%' ORDER BY timestamp DESC LIMIT " + (limit || 3));
            } else if (db.getAllFromStore && typeof db.getAllFromStore === 'function') {
                const all = await db.getAllFromStore('podcast_history');
                results = all.filter(function(item) {
                    return item.topic && item.topic.toLowerCase().includes(topic.toLowerCase());
                }).slice(0, limit || 3);
            }
            return results || [];
        } catch (_) {
            return [];
        }
    }

    // ============================================================
    // 🔥 GENERATE PODCAST (DENGAN SEMUA DATA)
    // ============================================================
    async function generatePodcastText() {
        const topic = getTopic();
        // FIX: kalau user mengisi kolom topik manual DENGAN topik yang BEDA dari
        // topik Dashboard, ini harus jadi "podcast mandiri" sesuai janji di UI
        // ("Isi di sini untuk podcast mandiri") - artinya TIDAK boleh dicampur
        // dengan skor/insight/strategi dari analisis Dashboard yang topiknya lain,
        // karena itu bikin naskah gak nyambung (judul topik A tapi isinya insight topik B).
        const podcastInputEl = document.getElementById('podcastTopicInput');
        const manualTopic = podcastInputEl ? podcastInputEl.value.trim() : '';
        const dashboardInputEl = document.getElementById('topicInput');
        const dashboardTopic = dashboardInputEl ? dashboardInputEl.value.trim() : '';
        const isIndependentTopic = manualTopic.length > 0 && manualTopic.toLowerCase() !== dashboardTopic.toLowerCase();
        const lastAggregated = isIndependentTopic ? null : window.lastAggregated;
        const ai = core.ai;
        const voiceEngine = core.voiceEngine;

        const previousContexts = ai.getPreviousContext();
        const lastTopics = previousContexts.map(function(c) { return c.topic; }).filter(Boolean).join(', ');
        const contextInfo = lastTopics ? 'Topik sebelumnya: ' + lastTopics + '. ' : '';
        const userHistory = state.podcastHistory.length;
        const historyInfo = userHistory > 0 ? 'Sudah ada ' + userHistory + ' episode sebelumnya. ' : '';

        // ============================================================
        // 🔥🔥🔥 AMBIL DATA DARI 3 SUMBER 🔥🔥🔥
        // ============================================================
        let staticData = [];
        let memoryData = [];
        let dbData = [];

        try {
            // 1. DATA STATIS DARI WORLD.JS
            staticData = fetchStaticData(topic);
            if (staticData.length > 0) {
                showToast('📚 Data World: ' + staticData.length + ' item', 'info');
            }
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }

        try {
            // 2. DATA DINAMIS DARI VECTOR MEMORY
            memoryData = await fetchFromVectorMemory(topic, 3);
            if (memoryData.length > 0) {
                showToast('🧠 Data Memory: ' + memoryData.length + ' item', 'info');
            }
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }

        try {
            // 3. DATA HISTORIS DARI KES DATABASE
            dbData = await fetchFromDatabase(topic, 3);
            if (dbData.length > 0) {
                showToast('📊 Data Database: ' + dbData.length + ' item', 'info');
            }
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }

        // ============================================================
        // 🔥 BUILD PROMPT DENGAN SEMUA DATA
        // ============================================================
        let text;

        // FIX: cek mode Debat/Diskusi LEBIH DULU - kedua fungsi itu sudah toleran
        // terhadap lastAggregated null/undefined (pakai optional chaining `?.`),
        // jadi tetap harus jalan walau podcast ini independen (tanpa data Dashboard).
        // Sebelumnya urutan terbalik menyebabkan mode Debat/Diskusi diam-diam
        // diabaikan setiap kali podcast dibuat independen dari topik Dashboard.
        if (state.speakerMode === 'debate') {
            text = generateDebateScript(topic, lastAggregated, staticData, memoryData, dbData);
        } else if (state.speakerMode === 'discussion') {
            text = generateDiscussionScript(topic, lastAggregated, staticData, memoryData, dbData);
        } else if (!lastAggregated) {
            let enhancedPrompt = 'Buat podcast profesional tentang "' + topic + '" untuk pengusaha dan pebisnis. ' +
                'Gaya: informatif, inspiratif, dan mudah dipahami. ' +
                'Struktur: Pembukaan menarik → Analisis utama → Tips praktis → Penutup. ' +
                'Durasi: 3-5 menit. Target: Pengusaha Indonesia yang ingin berkembang. ' +
                historyInfo + contextInfo +
                'Gunakan bahasa yang profesional namun santai, mudah dicerna, dan memotivasi.';

            // 🔥 TAMBAHKAN DATA STATIS DARI WORLD.JS
            if (staticData && staticData.length > 0) {
                enhancedPrompt += '\n\n📚 DATA & FAKTA DARI WORLD:\n';
                staticData.forEach(function(item, i) {
                    const text = item.text || '';
                    enhancedPrompt += (i + 1) + '. ' + text.substring(0, 200) + '...\n';
                });
                enhancedPrompt += '\nGunakan data di atas untuk memperkaya konten podcast!\n';
            }

            // 🔥 TAMBAHKAN DATA DINAMIS DARI VECTOR MEMORY
            if (memoryData && memoryData.length > 0) {
                enhancedPrompt += '\n\n🧠 INSPIRASI DARI MEMORY:\n';
                memoryData.forEach(function(item, i) {
                    const text = item.text || '';
                    enhancedPrompt += (i + 1) + '. ' + text.substring(0, 200) + '...\n';
                });
                enhancedPrompt += '\nGunakan inspirasi ini untuk membuat podcast yang lebih kaya!\n';
            }

            // 🔥 TAMBAHKAN DATA DARI KES DATABASE
            if (dbData && dbData.length > 0) {
                enhancedPrompt += '\n\n📊 DATA DARI DATABASE:\n';
                dbData.forEach(function(item, i) {
                    const summary = item.summary || item.insight || '';
                    enhancedPrompt += (i + 1) + '. ' + summary.substring(0, 200) + '...\n';
                });
                enhancedPrompt += '\nGunakan data historis ini sebagai referensi!\n';
            }

            text = ai.generateText(enhancedPrompt, 800, 0.7, contentLangKey(state.currentLang));

        } else {
            const score = lastAggregated.score || 0;
            const summary = lastAggregated.summary || '';
            const insights = (lastAggregated.insight || []).slice(0, 3).join('. ');
            const strategies = (lastAggregated.strategy || []).slice(0, 2).join('. ');
            const recommendation = lastAggregated.recommendation || '';

            const aiContext = state.aiContext || {};
            const competitorAnalysis = aiContext.competitorAnalysis || { hasCompetitor: false };
            const marketScore = aiContext.marketScore || 0;
            const executiveSummary = aiContext.executiveSummary || '';

            let prompt = 'Buat podcast tentang "' + topic + '". ';
            prompt += 'Skor: ' + score + '/100. ';
            if (summary) prompt += 'Ringkasan: ' + summary + '. ';
            if (insights) prompt += 'Insight: ' + insights + '. ';
            if (strategies) prompt += 'Strategi: ' + strategies + '. ';
            if (recommendation) prompt += 'Rekomendasi: ' + recommendation + '. ';

            if (contextInfo) prompt += contextInfo;
            if (historyInfo) prompt += historyInfo;

            if (competitorAnalysis.hasCompetitor) {
                prompt += 'Kompetitor terdeteksi dengan kata kunci: ' + competitorAnalysis.keywords.join(', ') + '. ';
                prompt += 'Berikan analisis kompetitif dan strategi diferensiasi. ';
            }
            if (marketScore > 0) {
                prompt += 'Skor peluang pasar: ' + marketScore + '/100. ';
                prompt += 'Jelaskan prospek pasar berdasarkan skor ini. ';
            }
            if (executiveSummary) {
                prompt += 'Executive summary: ' + executiveSummary + '. ';
            }

            // 🔥 TAMBAHKAN SEMUA DATA KE PROMPT
            if (staticData && staticData.length > 0) {
                prompt += '\n📚 DATA DARI WORLD:\n';
                staticData.forEach(function(item, i) {
                    const text = item.text || '';
                    prompt += (i + 1) + '. ' + text.substring(0, 150) + '...\n';
                });
            }

            if (memoryData && memoryData.length > 0) {
                prompt += '\n🧠 INSPIRASI DARI MEMORY:\n';
                memoryData.forEach(function(item, i) {
                    const text = item.text || '';
                    prompt += (i + 1) + '. ' + text.substring(0, 150) + '...\n';
                });
            }

            if (dbData && dbData.length > 0) {
                prompt += '\n📊 DATA DARI DATABASE:\n';
                dbData.forEach(function(item, i) {
                    const summary = item.summary || item.insight || '';
                    prompt += (i + 1) + '. ' + summary.substring(0, 150) + '...\n';
                });
            }

            prompt += ' Buat podcast dengan gaya profesional dan informatif, cocok untuk pengusaha dan pebisnis. ';
            prompt += 'Gunakan bahasa yang mengalir, berikan analogi yang mudah dipahami, dan akhiri dengan call to action yang kuat.';

            text = ai.generateText(prompt, 800, 0.7, contentLangKey(state.currentLang));
        }

        // ============================================================
        // 🔥 TAMBAHKAN SUBSCRIBE TEXT & SIMPAN
        // ============================================================
        const subscribeText = '\n\n📢 Jangan lupa SUBSCRIBE KESEMPATAN OS! 🔔\n' +
            '👉 Subscribe: youtube.com/@KESEMPATANOS\n' +
            '📱 Follow: @kesempatanos\n' +
            '💬 Gabung: t.me/kesempatanos\n\n' +
            '🚀 Sampai jumpa di episode berikutnya!';
        text = text + subscribeText;

        state.currentChapters = generateChapters(text);

        const aiUnderstanding = ai.understandContext(text);
        state.aiContext = aiUnderstanding;

        state.currentRecommendations = ai.getRecommendations({
            score: lastAggregated ? lastAggregated.score : 0,
            sentiment: state.aiContext.sentiment.sentiment,
            topics: state.aiContext.topics
        });

        const voiceRec = voiceEngine.recommendVoice(text);
        if (voiceRec && VOICE_PRESETS[voiceRec.voice]) {
            state.currentVoiceType = voiceRec.voice;
        }

        ai.rememberContext({
            topic: topic,
            score: lastAggregated ? lastAggregated.score : 0,
            summary: state.aiContext.summary,
            insight: state.aiContext.insight || '',
            recommendation: lastAggregated ? lastAggregated.recommendation : ''
        });

        // 🔥 SIMPAN KE MEMORY + DATABASE
        try {
            await core.savePodcastToExternalModules({
                topic: topic,
                script: text,
                score: lastAggregated ? lastAggregated.score : 0,
                voice: state.currentVoiceType,
                summary: text.substring(0, 200),
                staticDataUsed: staticData.length,
                memoryDataUsed: memoryData.length,
                dbDataUsed: dbData.length
            });
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }

        // 🆕 SIMPAN STATUS SUMBER AI INTERNAL KE STATE (dipakai badge di
        // Podcast Room supaya integrasi AI Internal/World/Memory/Database
        // terlihat nyata, bukan cuma toast sekilas yang cepat hilang)
        state.aiSourcesUsed = {
            world: staticData.length,
            memory: memoryData.length,
            database: dbData.length,
            internal: true
        };

        // 🔥 TAMPILKAN STATUS INTEGRASI
        const totalData = staticData.length + memoryData.length + dbData.length;
        if (totalData > 0) {
            showToast('📊 Podcast menggunakan ' + totalData + ' data dari World/Memory/Database!', 'success');
        }

        return text;
    }

    // ============================================================
    // 🔥 GENERATE DEBATE SCRIPT (DENGAN DATA)
    // ============================================================
    function generateDebateScript(topic, lastAggregated, staticData, memoryData, dbData) {
        const ai = core.ai;
        const score = lastAggregated.score || 0;
        const summary = lastAggregated.summary || '';
        const insights = (lastAggregated.insight || []).slice(0, 3).join('. ');
        const recommendation = lastAggregated.recommendation || '';
        const agents = state.debateAgents.slice(0, 5);
        const agentNames = agents.map(function(a) {
            return AGENT_VOICES[a] ? AGENT_VOICES[a].name : a;
        });
        const agentRoles = ['(PRO)', '(KONTRA)', '(MEDIATOR)', '(ANALIS)', '(MODERATOR)'];
        let script = '🎙️ DEBAT: ' + topic + '\n\n📊 SKOR: ' + score + '/100\n\n📝 TOPIK: ' + (summary || 'Analisis peluang') + '\n\n👥 PESERTA: ' + agentNames.join(' vs ') + '\n\n═══════════════════════════════════\n\n';

        // 🔥 TAMBAHKAN DATA KE PROMPT
        let dataContext = '';
        if (staticData && staticData.length > 0) {
            dataContext += '\n📚 DATA DARI WORLD:\n';
            staticData.slice(0, 2).forEach(function(item, i) {
                dataContext += (i + 1) + '. ' + (item.text || '').substring(0, 150) + '...\n';
            });
        }
        if (memoryData && memoryData.length > 0) {
            dataContext += '\n🧠 INSPIRASI DARI MEMORY:\n';
            memoryData.slice(0, 2).forEach(function(item, i) {
                dataContext += (i + 1) + '. ' + (item.text || '').substring(0, 150) + '...\n';
            });
        }

        const competitorInfo = state.aiContext && state.aiContext.competitorAnalysis
            ? state.aiContext.competitorAnalysis
            : { hasCompetitor: false };
        const marketInfo = state.aiContext && state.aiContext.marketScore
            ? state.aiContext.marketScore
            : 0;

        for (let round = 1; round <= 3; round++) {
            script += '📍 ROUND ' + round + '\n\n';
            for (let idx = 0; idx < agents.length; idx++) {
                const agent = agents[idx];
                const role = agentRoles[idx % agentRoles.length];
                const name = AGENT_VOICES[agent] ? AGENT_VOICES[agent].name : agent;

                let argPrompt = 'Buat argumen ' + role + ' tentang "' + topic + '" untuk debat. ';
                argPrompt += 'Skor: ' + score + '. Insight: ' + insights + '. ';
                argPrompt += dataContext;
                if (competitorInfo.hasCompetitor) {
                    argPrompt += 'Kompetitor: ' + competitorInfo.keywords.join(', ') + '. ';
                }
                if (marketInfo > 0) {
                    argPrompt += 'Peluang pasar: ' + marketInfo + '/100. ';
                }
                argPrompt += 'Argumen harus kuat, berbasis data, dan persuasif.';

                const argument = ai.generateText(argPrompt, 70, 0.7, contentLangKey(state.currentLang));
                script += name + ' ' + role + ':\n' + (argument || 'Argumen disiapkan...') + '\n\n';
            }
            script += '───\n\n';
        }
        script += '═══════════════════════════════════\n\n🎯 KESIMPULAN DEBAT:\n';
        script += ai.generateText('Kesimpulan debat tentang "' + topic + '". Skor akhir: ' + score + '/100. Rekomendasi: ' + recommendation + '.', 100, 0.7, contentLangKey(state.currentLang));
        script += '\n\n📢 Jangan lupa SUBSCRIBE KESEMPATAN OS! 🔔';
        return script;
    }

    // ============================================================
    // 🔥 GENERATE DISCUSSION SCRIPT (DENGAN DATA)
    // ============================================================
    // 🆕 Kamus dialog Diskusi multi-bahasa (id/en/de) - lihat contentLangKey()
    const DISCUSSION_PHRASES = {
        id: {
            coldOpen: function(topic, score) { return score > 0 ? ('Bayangin, dari 100 skor peluang, ' + topic + ' dapet ' + score + '. Penasaran gak kenapa?') : ('Ada satu hal soal ' + topic + ' yang menurut saya wajib banget kita bahas hari ini.'); },
            open: function(topic) { return 'Halo semua, selamat datang lagi di KESEMPATAN OS! Hari ini kita ngobrolin soal ' + topic + '. Seru nih kayaknya.'; },
            scoreIntro: function(topic, score) { return 'Iya, dan datanya juga mendukung — skor peluang ' + topic + ' ada di ' + score + ' dari 100.'; },
            noScoreIntro: function(topic) { return topic + ' ini memang lagi banyak dibahas belakangan.'; },
            askSummary: 'Coba dong dijelasin, ringkasannya gimana?',
            insight1: function(i) { return 'Salah satu insight utamanya: ' + i + '.'; },
            story1: function(topic) { return 'Jadi inget, ini kayak waktu saya lihat orang mulai dari nol di ' + topic + ', terus lama-lama berkembang. Prosesnya emang gak instan.'; },
            dataSnippet1: function(d) { return 'Ada data menarik juga nih soal ini: ' + d + '...'; },
            skeptic1: function(topic) { return 'Hmm, tapi apa itu berlaku buat semua orang? Rasanya agak terlalu optimis kalau digeneralisir ke ' + topic + ' secara umum.'; },
            insight2: function(i) { return 'Wajar sih kalau skeptis. Tapi coba lihat juga insight ini: ' + i + '.'; },
            askStep: function(topic) { return 'Jadi menurut kalian, apa langkah paling realistis buat yang mau mulai serius di ' + topic + '?'; },
            strategy1: function(s) { return 'Strategi yang saya rekomendasikan: ' + s + '.'; },
            strategy2: function(s) { return 'Setuju, dan biasanya yang berhasil juga nerapin ' + s + '.'; },
            skeptic2: function(topic) { return 'Oke, itu masuk akal. Tapi tetap harus hati-hati sama risikonya ya, jangan asal ikut tren ' + topic + '.'; },
            dataSnippet2: function(d) { return 'Betul, dan datanya juga menunjukkan: ' + d + '...'; },
            recommendation: function(r) { return 'Jadi kalau ditarik kesimpulan, rekomendasi utamanya adalah: ' + r + '.'; },
            closingStory: function(topic) { return topic + ' ini memang butuh kesabaran, tapi hasil akhirnya sering di luar ekspektasi.'; },
            closingSkeptic: function(topic) { return 'Setuju juga — asal jangan buru-buru dan tetap realistis soal ' + topic + '.'; },
            closingHost: function(topic) { return 'Nah, itu dia obrolan seru kita soal ' + topic + ' hari ini. Makasih Expert, Storyteller, dan Skeptic udah sharing insight-nya!'; }
        },
        en: {
            coldOpen: function(topic, score) { return score > 0 ? ('Picture this — out of a 100-point opportunity score, ' + topic + ' scored ' + score + '. Curious why?') : ('There\'s one thing about ' + topic + ' we really need to talk about today.'); },
            open: function(topic) { return 'Hey everyone, welcome back to KESEMPATAN OS! Today we\'re talking about ' + topic + '. This should be fun.'; },
            scoreIntro: function(topic, score) { return 'Right, and the data backs it up — the opportunity score for ' + topic + ' is ' + score + ' out of 100.'; },
            noScoreIntro: function(topic) { return topic + ' has been getting a lot of buzz lately.'; },
            askSummary: 'So walk us through it, what\'s the summary?',
            insight1: function(i) { return 'One of the key insights: ' + i + '.'; },
            story1: function(topic) { return 'This reminds me of when I saw someone start from zero in ' + topic + ' and slowly grow from there. It\'s definitely not instant.'; },
            dataSnippet1: function(d) { return 'There\'s some interesting data on this too: ' + d + '...'; },
            skeptic1: function(topic) { return 'Hmm, but does that apply to everyone? Feels a bit optimistic to generalize about ' + topic + ' like that.'; },
            insight2: function(i) { return 'Fair to be skeptical. But take a look at this insight too: ' + i + '.'; },
            askStep: function(topic) { return 'So what do you all think is the most realistic step for someone serious about ' + topic + '?'; },
            strategy1: function(s) { return 'The strategy I\'d recommend: ' + s + '.'; },
            strategy2: function(s) { return 'Agreed, and people who succeed usually apply ' + s + ' too.'; },
            skeptic2: function(topic) { return 'Okay, that makes sense. Still gotta be careful with the risks though, don\'t just chase the ' + topic + ' trend blindly.'; },
            dataSnippet2: function(d) { return 'True, and the data also shows: ' + d + '...'; },
            recommendation: function(r) { return 'So if we wrap it up, the main recommendation is: ' + r + '.'; },
            closingStory: function(topic) { return topic + ' definitely takes patience, but the results are often beyond expectations.'; },
            closingSkeptic: function(topic) { return 'Agreed too — just don\'t rush and stay realistic about ' + topic + '.'; },
            closingHost: function(topic) { return 'Well, that was a great conversation about ' + topic + ' today. Thanks Expert, Storyteller, and Skeptic for sharing your insights!'; }
        },
        de: {
            coldOpen: function(topic, score) { return score > 0 ? ('Stellt euch vor — von 100 möglichen Punkten hat ' + topic + ' ' + score + ' erreicht. Neugierig, warum?') : ('Es gibt da etwas zu ' + topic + ', worüber wir heute unbedingt sprechen sollten.'); },
            open: function(topic) { return 'Hallo zusammen, willkommen zurück bei KESEMPATAN OS! Heute sprechen wir über ' + topic + '. Das wird sicher spannend.'; },
            scoreIntro: function(topic, score) { return 'Genau, und die Daten bestätigen das — die Chancen-Punktzahl für ' + topic + ' liegt bei ' + score + ' von 100.'; },
            noScoreIntro: function(topic) { return 'Über ' + topic + ' wird momentan viel gesprochen.'; },
            askSummary: 'Erzähl mal, wie sieht die Zusammenfassung aus?',
            insight1: function(i) { return 'Eine der wichtigsten Erkenntnisse: ' + i + '.'; },
            story1: function(topic) { return 'Das erinnert mich daran, wie ich jemanden bei ' + topic + ' bei null anfangen und sich langsam entwickeln sah. Das geht wirklich nicht von heute auf morgen.'; },
            dataSnippet1: function(d) { return 'Dazu gibt es auch interessante Daten: ' + d + '...'; },
            skeptic1: function(topic) { return 'Hmm, aber gilt das für alle? Es wirkt etwas zu optimistisch, das bei ' + topic + ' so zu verallgemeinern.'; },
            insight2: function(i) { return 'Skepsis ist verständlich. Aber schau dir auch diese Erkenntnis an: ' + i + '.'; },
            askStep: function(topic) { return 'Was ist eurer Meinung nach der realistischste Schritt für jemanden, der bei ' + topic + ' ernsthaft starten will?'; },
            strategy1: function(s) { return 'Die Strategie, die ich empfehlen würde: ' + s + '.'; },
            strategy2: function(s) { return 'Stimmt, und wer erfolgreich ist, setzt meist auch auf ' + s + '.'; },
            skeptic2: function(topic) { return 'Okay, das klingt vernünftig. Trotzdem sollte man mit den Risiken vorsichtig sein und nicht blind dem ' + topic + '-Trend folgen.'; },
            dataSnippet2: function(d) { return 'Stimmt, und die Daten zeigen auch: ' + d + '...'; },
            recommendation: function(r) { return 'Zusammengefasst lautet die Hauptempfehlung: ' + r + '.'; },
            closingStory: function(topic) { return topic + ' braucht wirklich Geduld, aber das Ergebnis übertrifft oft die Erwartungen.'; },
            closingSkeptic: function(topic) { return 'Stimme zu — solange man nicht überstürzt handelt und bei ' + topic + ' realistisch bleibt.'; },
            closingHost: function(topic) { return 'Nun, das war ein tolles Gespräch über ' + topic + ' heute. Danke an Expert, Storyteller und Skeptic fürs Teilen eurer Erkenntnisse!'; }
        }
    };

    function generateDiscussionScript(topic, lastAggregated, staticData, memoryData, dbData) {
        // FIX AKAR MASALAH: sebelumnya fungsi ini menyusun instruksi format
        // "[Host]/[Expert]/[Storyteller]/[Skeptic]" lalu menyerahkannya ke
        // ai.generateText() - padahal generateText() adalah mesin template,
        // BUKAN LLM yang bisa mengikuti instruksi format bahasa natural.
        // Hasilnya: teks yang keluar TIDAK PERNAH punya tag pembicara, dan
        // playDiscussion() di ui-player.js selalu gagal mem-parsingnya lalu
        // diam-diam fallback ke mode single voice. Sekarang dialog disusun
        // langsung secara deterministik di sini - tag selalu benar 100%.
        const P = DISCUSSION_PHRASES[contentLangKey(state.currentLang)] || DISCUSSION_PHRASES.id;
        const score = lastAggregated ? (lastAggregated.score || 0) : 0;
        const summary = lastAggregated ? (lastAggregated.summary || '') : '';
        const insightList = lastAggregated ? (lastAggregated.insight || []).slice(0, 3) : [];
        const strategyList = lastAggregated ? (lastAggregated.strategy || []).slice(0, 2) : [];
        const recommendation = lastAggregated ? (lastAggregated.recommendation || '') : '';

        const dataSnippets = [];
        (staticData || []).slice(0, 2).forEach(function(item) {
            if (item.text) dataSnippets.push(item.text.substring(0, 140));
        });
        (memoryData || []).slice(0, 2).forEach(function(item) {
            if (item.text) dataSnippets.push(item.text.substring(0, 140));
        });
        (dbData || []).slice(0, 2).forEach(function(item) {
            const t = item.summary || item.insight || '';
            if (t) dataSnippets.push(t.substring(0, 140));
        });

        const lines = [];
        const say = function(role, text) { lines.push('[' + role + '] ' + text); };

        say('Skeptic', P.coldOpen(topic, score));
        say('Host', P.open(topic));
        say('Expert', score > 0 ? P.scoreIntro(topic, score) : P.noScoreIntro(topic));

        if (summary) {
            say('Host', P.askSummary);
            say('Expert', summary);
        }
        if (insightList[0]) {
            say('Expert', P.insight1(insightList[0]));
        }

        say('Storyteller', P.story1(topic));
        if (dataSnippets[0]) {
            say('Storyteller', P.dataSnippet1(dataSnippets[0]));
        }

        say('Skeptic', P.skeptic1(topic));
        if (insightList[1]) {
            say('Expert', P.insight2(insightList[1]));
        }

        say('Host', P.askStep(topic));
        if (strategyList[0]) {
            say('Expert', P.strategy1(strategyList[0]));
        }
        if (strategyList[1]) {
            say('Storyteller', P.strategy2(strategyList[1]));
        }

        say('Skeptic', P.skeptic2(topic));
        if (dataSnippets[1]) {
            say('Expert', P.dataSnippet2(dataSnippets[1]));
        }
        if (recommendation) {
            say('Host', P.recommendation(recommendation));
        }

        say('Storyteller', P.closingStory(topic));
        say('Skeptic', P.closingSkeptic(topic));
        say('Host', P.closingHost(topic));

        return lines.join('\n');
    }

    // ============================================================
    // 🔥 GENERATE CHAPTERS
    // ============================================================
    function generateChapters(text) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chapters = [];
        const total = sentences.length;
        const step = Math.max(1, Math.floor(total / 4));
        let lastTimestamp = 0;
        for (let i = 0; i < total && chapters.length < 5; i += step) {
            const sentence = sentences[i] || '';
            const title = sentence.substring(0, 40) + (sentence.length > 40 ? '...' : '');
            chapters.push({
                title: title.trim(),
                start: lastTimestamp,
                end: lastTimestamp + 30,
                index: chapters.length + 1
            });
            lastTimestamp += 30;
        }
        if (chapters.length === 0) {
            chapters.push({ title: 'Pembukaan', start: 0, end: 30, index: 1 });
            chapters.push({ title: 'Isi Utama', start: 30, end: 60, index: 2 });
            chapters.push({ title: 'Penutup', start: 60, end: 90, index: 3 });
        }
        return chapters;
    }

    // ============================================================
    // 🔥 UPDATE SCRIPT
    // ============================================================
    async function updateScript() {
        const now = Date.now();
        if (state.isGenerating || (now - lastGenerateTime < GENERATE_COOLDOWN)) {
            return;
        }
        state.isGenerating = true;
        lastGenerateTime = now;
        const genStart = Date.now(); // 🆕 waktu generate REAL, buat status bar
        try {
            state.originalPodcastText = await generatePodcastText();
            state.podcastText = state.originalPodcastText;
            state.lastGenerateDurationMs = Date.now() - genStart;
            renderer.render();
            showToast('✅ Naskah podcast siap dengan data dari World, Memory, & Database!');
            core.trackAnalytics('generate', { topic: getTopic() });
        } finally {
            state.isGenerating = false;
        }
    }

    // ============================================================
    // 🔥 UPDATE SCRIPT DENGAN AI
    // ============================================================
    async function updateScriptWithAI() {
        const now = Date.now();
        if (state.isGenerating || (now - lastGenerateTime < GENERATE_COOLDOWN)) {
            return;
        }
        state.isGenerating = true;
        lastGenerateTime = now;
        try {
            const topic = getTopic() || 'bisnis digital';
            const ai = core.ai;

            const previousContexts = ai.getPreviousContext();
            const lastTopics = previousContexts.map(function(c) { return c.topic; }).filter(Boolean).join(', ');
            const contextInfo = lastTopics ? 'Topik sebelumnya: ' + lastTopics + '. ' : '';

            // 🔥 AMBIL DATA DARI WORLD + MEMORY
            const staticData = fetchStaticData(topic);
            const memoryData = await fetchFromVectorMemory(topic, 3);
            const obsContext = fetchObservationContext(topic);

            let prompt = 'Buat podcast profesional tentang "' + topic + '" untuk pengusaha. ' +
                contextInfo +
                'Gaya: profesional dan inspiratif. Struktur: pembukaan menarik, analisis, tips, penutup.';

            if (staticData && staticData.length > 0) {
                prompt += '\n\n📚 DATA DARI WORLD:\n';
                staticData.slice(0, 3).forEach(function(item, i) {
                    prompt += (i + 1) + '. ' + (item.text || '').substring(0, 150) + '...\n';
                });
            }

            if (memoryData && memoryData.length > 0) {
                prompt += '\n\n🧠 INSPIRASI DARI MEMORY:\n';
                memoryData.slice(0, 2).forEach(function(item, i) {
                    prompt += (i + 1) + '. ' + (item.text || '').substring(0, 150) + '...\n';
                });
            }

            if (obsContext.marketInsight) {
                prompt += '\n\n📡 SENTIMEN PASAR/BERITA TERKINI:\n' + obsContext.marketInsight;
            }
            if (obsContext.credibilityNote) {
                prompt += '\n\n' + obsContext.credibilityNote + ' Sampaikan dengan hati-hati dan sertakan catatan verifikasi.';
            }

            const text = ai.generateText(prompt, 800, 0.7, contentLangKey(state.currentLang));
            state.podcastText = text;
            state.originalPodcastText = text;

            const aiUnderstanding = ai.understandContext(text);
            state.aiContext = aiUnderstanding;
            ai.rememberContext({ topic: topic, summary: aiUnderstanding.summary });

            renderer.render();
            showToast('🤖 AI generated new script with data from World & Memory!');
        } finally {
            state.isGenerating = false;
        }
    }

    // ============================================================
    // 🔥 UPDATE AI CONTEXT
    // ============================================================
    // 🆕 HOOK ANALYZER — menilai kalimat pembuka podcast layaknya produser
    // berpengalaman: apakah cukup singkat buat nangkep perhatian, ada unsur
    // engagement (pertanyaan/seru), dan relevan sama topik.
    function analyzeHook(text, topic) {
        const firstSentenceMatch = text.match(/[^.!?]+[.!?]/);
        const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : text.substring(0, 80);
        const wordCount = firstSentence.split(/\s+/).length;
        let score = 50;
        const tips = [];

        if (wordCount >= 6 && wordCount <= 18) {
            score += 20;
        } else if (wordCount > 18) {
            score -= 15;
            tips.push('Kalimat pembuka agak panjang — coba dipersingkat biar lebih nendang.');
        } else {
            score -= 5;
            tips.push('Kalimat pembuka terlalu pendek, tambahkan sedikit konteks.');
        }

        if (/[?!]/.test(firstSentence)) {
            score += 15;
        } else {
            tips.push('Coba tambahkan pertanyaan atau seruan di awal biar lebih engaging.');
        }

        if (topic && firstSentence.toLowerCase().indexOf(topic.toLowerCase().split(' ')[0]) !== -1) {
            score += 15;
        } else {
            tips.push('Sebutkan topik lebih eksplisit di kalimat pertama.');
        }

        score = Math.max(0, Math.min(100, score));
        const label = score >= 75 ? '🔥 Hook Kuat' : (score >= 50 ? '👍 Hook Cukup' : '⚠️ Hook Perlu Diperkuat');
        return { score: score, label: label, tip: tips[0] || 'Hook pembuka sudah solid!' };
    }

    function updateAIContext() {
        if (!state.podcastText) return;

        const ai = core.ai;
        state.aiContext = ai.understandContext(state.podcastText);
        state.currentRecommendations = ai.getRecommendations({
            score: window.lastAggregated ? window.lastAggregated.score : 0,
            sentiment: state.aiContext.sentiment.sentiment,
            topics: state.aiContext.topics
        });
        ai.rememberContext({
            topic: getTopic(),
            summary: state.aiContext.summary,
            insight: state.aiContext.insight || ''
        });

        const container = document.getElementById('aiContextContainer');
        if (container) {
            const ctx = state.aiContext;
            const theme = config.THEMES[state.currentTheme] || config.THEMES.dark;
            const hook = analyzeHook(state.podcastText, getTopic());
            container.innerHTML = `
                <div style="background:rgba(155,89,182,0.1); border-radius:8px; padding:8px; margin-top:8px; border:1px solid ${theme.secondary}44;">
                    <div style="color:${theme.secondary}; font-size:10px; font-weight:bold;">🧠 AI Context</div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:8px; color:${theme.text}; opacity:0.7; margin-top:4px;">
                        <span>📝 ${ctx.wordCount || 0} kata</span>
                        <span>⏱️ ${ctx.estimatedDuration || 0} menit</span>
                        <span>📊 Kompleksitas: ${ctx.complexity || 0}%</span>
                        <span>💬 Sentimen: ${ctx.sentiment ? ctx.sentiment.label : 'Netral'}</span>
                        ${ctx.competitorAnalysis && ctx.competitorAnalysis.hasCompetitor ? '<span>👥 Kompetitor terdeteksi</span>' : ''}
                        ${ctx.marketScore ? '<span>📈 Peluang pasar: ' + ctx.marketScore + '/100</span>' : ''}
                    </div>
                    ${ctx.executiveSummary ? '<div style="font-size:8px; color:' + theme.primary + '; margin-top:4px;">📌 ' + ctx.executiveSummary + '</div>' : ''}
                    <div style="margin-top:6px; padding-top:6px; border-top:1px solid ${theme.secondary}33; display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span style="font-size:8px; color:${theme.text}; opacity:0.8;">${hook.label} (${hook.score}/100)</span>
                        <span style="font-size:7px; color:${theme.text}; opacity:0.5;">${hook.tip}</span>
                    </div>
                    <div style="font-size:7px; color:${theme.text}; opacity:0.3; margin-top:4px;">
                        🔄 Memory: ${core.ai.conversationHistory.length} konteks tersimpan
                    </div>
                </div>
            `;
        }

        const recContainer = document.getElementById('recommendationsContainer');
        if (recContainer && state.currentRecommendations.length > 0) {
            const theme = config.THEMES[state.currentTheme] || config.THEMES.dark;
            let recHtml = '<div style="background:rgba(0,255,163,0.05); border-radius:8px; padding:8px; margin-top:8px; border:1px solid ' + theme.primary + '44;">';
            recHtml += '<div style="color:' + theme.primary + '; font-size:10px; font-weight:bold;">💡 Rekomendasi</div>';
            for (let i = 0; i < Math.min(state.currentRecommendations.length, 4); i++) {
                const r = state.currentRecommendations[i];
                recHtml += '<div style="display:flex; align-items:center; gap:4px; font-size:8px; color:' + theme.text + '; opacity:0.8; margin-top:2px;">';
                recHtml += '<span>' + (r.icon || '•') + '</span>';
                recHtml += '<span style="font-weight:bold;">' + r.action + '</span>';
                recHtml += '<span style="opacity:0.5;">- ' + r.detail + '</span>';
                recHtml += '</div>';
            }
            recHtml += '</div>';
            recContainer.innerHTML = recHtml;
        }
    }

    // ============================================================
    // 🔥 EKSPOR
    // ============================================================
    KESEMPATAN.Podcast.uiGenerator = {
        getTopic: getTopic,
        generatePodcastText: generatePodcastText,
        generateChapters: generateChapters,
        generateDebateScript: generateDebateScript,
        generateDiscussionScript: generateDiscussionScript,
        updateScript: updateScript,
        updateScriptWithAI: updateScriptWithAI,
        updateAIContext: updateAIContext
    };

})();
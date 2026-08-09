/* ============================================================
   KESEMPATAN OS v18.5 — AI ENGINE (UPGRADE)
   ✅ Prompt engineering cerdas & terstruktur
   ✅ Vocabulary 50+ kata bisnis & analisis
   ✅ Context memory (ingatan percakapan)
   ✅ Analisis kompetitor & peluang pasar
   ✅ Executive summary generator
   ✅ Rekomendasi personalized
   ✅ SUBSCRIBE TEXT DIHAPUS (hanya di ui-generator)
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (KESEMPATAN.Podcast && KESEMPATAN.Podcast.aiEngine) return;
    KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

    const config = KESEMPATAN.Podcast.config;
    if (!config) {
        console.warn('[AI Engine] Config belum dimuat!');
        return;
    }

    const VOICE_EMOTIONS = config.VOICE_EMOTIONS;
    const VOICE_PRESETS = config.VOICE_PRESETS;

    // ========== VOICE CLONING ENGINE ==========
    class VoiceCloningEngine {
        analyzeSpeech(text) {
            const length = text.length;
            const pitch = 0.8 + (Math.sin(length * 0.01) * 0.1) + 0.1;
            const rate = 0.85 + (Math.sin(length * 0.015) * 0.05);
            return {
                pitch: Math.min(1.5, Math.max(0.5, pitch)),
                rate: Math.min(1.5, Math.max(0.5, rate)),
                length: length,
                wordCount: text.split(' ').length
            };
        }
        cloneVoice(text, sourceVoice, emotion) {
            const emotionKey = emotion || 'neutral';
            const emotionMod = VOICE_EMOTIONS[emotionKey] || VOICE_EMOTIONS.neutral;
            const sourcePitch = sourceVoice.pitch || 0.9;
            const sourceRate = sourceVoice.rate || 0.9;
            return {
                pitch: Math.max(0.5, Math.min(2.0, sourcePitch * emotionMod.pitch)),
                rate: Math.max(0.5, Math.min(2.0, sourceRate * emotionMod.rate)),
                emotion: emotionKey,
                energy: emotionMod.energy,
                confidence: 0.85,
                naturalness: 0.9
            };
        }
        recommendVoice(text) {
            const lower = text.toLowerCase();
            if (lower.includes('wow') || lower.includes('luar biasa') || lower.includes('fantastis')) {
                return { voice: 'energetic_male', confidence: 0.85 };
            }
            if (lower.includes('bijak') || lower.includes('pengalaman') || lower.includes('pelajaran')) {
                return { voice: 'wise_male', confidence: 0.8 };
            }
            if (lower.includes('cerita') || lower.includes('kisah') || lower.includes('dongeng')) {
                return { voice: 'storyteller', confidence: 0.8 };
            }
            if (text.length > 500) return { voice: 'narrator', confidence: 0.75 };
            if (text.split(' ').length < 50) return { voice: 'podcast_host', confidence: 0.7 };
            return { voice: 'professional_male', confidence: 0.6 };
        }
    }

    const voiceEngine = new VoiceCloningEngine();

    // ========== AI INTERNAL ENGINE ==========
    // ============================================================
    // 🌍 LANG_STRINGS — kamus konten multi-bahasa untuk generateText()
    // Cakupan penuh: id (default), en, de. Bahasa lain di dropdown
    // fallback ke id (lihat catatan di generateText). Struktur ini
    // sengaja dibuat data-driven supaya gampang nambah bahasa baru -
    // tinggal tambah 1 blok objek baru dengan key bahasa yang sesuai.
    // ============================================================
    const LANG_STRINGS = {
        id: {
            noTopicLabel: 'peluang bisnis',
            hooks: function(topic) {
                return [
                    '🎙️ Halo Bos! Hari ini kita akan membahas topik yang sangat menarik: ' + topic + '.',
                    '💡 Pernahkah Anda berpikir tentang ' + topic + '? Yuk kita bahas tuntas!',
                    '🚀 Selamat datang di KESEMPATAN OS! Hari ini kita akan mengupas ' + topic + ' secara mendalam.'
                ];
            },
            skorAkhir: function(score) { return '📈 SKOR AKHIR: ' + score + '/100'; },
            ringkasanHeader: '📝 RINGKASAN EKSEKUTIF',
            insightHeader: '💡 INSIGHT UTAMA',
            strategiHeader: '🎯 STRATEGI YANG DIREKOMENDASIKAN',
            opportunity: {
                high: { label: '✅ PELUANG TINGGI', body: function(score) { return 'Skor ' + score + '/100 menunjukkan peluang yang sangat menjanjikan. Dengan insight yang kuat dan strategi yang tepat, peluang ini layak untuk segera dieksekusi. Jangan tunda lagi, karena competitor juga pasti sedang mengincar peluang ini!'; } },
                mid: { label: '🔍 PELUANG MENENGAH', body: function(score) { return 'Skor ' + score + '/100 menunjukkan potensi yang perlu dikaji lebih dalam. Meskipun ada indikasi positif, diperlukan validasi pasar dan riset tambahan sebelum eksekusi penuh. Gunakan data ini sebagai dasar untuk mengambil keputusan yang lebih matang.'; } },
                low: { label: '⚠️ PELUANG RENDAH', body: function(score) { return 'Skor ' + score + '/100 menunjukkan risiko yang perlu dipertimbangkan. Disarankan untuk mengevaluasi ulang atau mencari alternatif lain dengan potensi lebih baik. Jangan takut untuk pivot jika diperlukan!'; } }
            },
            rekomendasiHeader: '🎯 REKOMENDASI STRATEGIS',
            kompetitorHeader: '👥 ANALISIS KOMPETITOR',
            kompetitorBody: function(keywords) { return 'Dari data yang ada, terlihat bahwa kompetitor juga bergerak di area ini. Kata kunci yang muncul: ' + keywords + '. Ini menunjukkan bahwa persaingan cukup ketat, namun juga menandakan pasar yang sehat.'; },
            peluangPasarHeader: '📊 PELUANG PASAR',
            marketScoreLine: function(score) { return 'Skor peluang pasar: ' + score + '/100. '; },
            market: {
                high: 'Pasar menunjukkan pertumbuhan yang positif dan prospek cerah. Ini adalah waktu yang tepat untuk masuk dan mengambil posisi strategis.',
                mid: 'Pasar masih dalam tahap perkembangan. Diperlukan edukasi pasar dan pendekatan yang lebih personal.',
                low: 'Pasar masih belum matang. Pertimbangkan untuk menunggu hingga ada lebih banyak sinyal positif.'
            },
            kesimpulanHeader: '📌 KESIMPULAN',
            kesimpulanBody: function(topic, score) { return 'Berdasarkan analisis dari 12 agen, peluang "' + topic + '" memiliki skor ' + score + '/100. '; },
            rekomendasiUtama: function(rec) { return 'Rekomendasi utama: ' + rec + '. '; },
            perluAnalisis: 'Perlu analisis lebih lanjut untuk menentukan langkah terbaik. ',
            langkahHeader: '🚀 LANGKAH SELANJUTNYA',
            steps: {
                high: ['🏃 Segera eksekusi dengan strategi yang matang', '📊 Pantau perkembangan pasar secara intensif', '🔄 Evaluasi dan optimasi setiap 3 bulan', '🤝 Bangun kemitraan strategis untuk mempercepat pertumbuhan'],
                mid: ['🔍 Lakukan riset tambahan dan validasi pasar', '📋 Kumpulkan data yang lebih lengkap', '🗣️ Konsultasikan dengan tim atau ahli terkait', '📝 Buat prototype / MVP untuk uji coba'],
                low: ['🔄 Evaluasi ulang strategi dan positioning', '🔍 Cari alternatif peluang lain', '💪 Perbaiki aspek yang menjadi kelemahan', '🎯 Fokus pada kompetensi inti terlebih dahulu']
            },
            sentenceTemplates: [
                function(topic) { return '🚀 Peluang ' + topic + ' sangat menjanjikan untuk dieksplorasi.'; },
                function(topic) { return '💡 Strategi ' + topic + ' yang tepat akan membawa hasil optimal.'; },
                function(topic) { return '🔥 Inovasi ' + topic + ' adalah kunci untuk tetap relevan.'; },
                function(topic) { return '📊 Data menunjukkan ' + topic + ' terus mengalami pertumbuhan positif.'; },
                function(topic) { return '🎯 Rekomendasi: fokus pada ' + topic + ' sebagai prioritas utama.'; },
                function(topic) { return '📈 Analisis ' + topic + ' menunjukkan tren yang sangat menarik.'; },
                function(topic) { return '💪 ' + topic + ' membutuhkan ketekunan dan konsistensi.'; },
                function(topic) { return '🌟 ' + topic + ' adalah peluang emas di era digital.'; }
            ],
            recommendations: [
                '🚀 Langkah selanjutnya: eksekusi dengan cepat dan tepat.',
                '📊 Prioritaskan inovasi dan adaptasi terhadap perubahan.',
                '🔍 Jangan lupa pantau pergerakan kompetitor secara berkala.',
                '💎 Fokus pada kepuasan pelanggan sebagai prioritas utama.',
                '⚡ Optimalkan efisiensi operasional untuk hasil maksimal.',
                '🎯 Tentukan target yang jelas dan terukur.',
                '🤝 Bangun kolaborasi dengan mitra strategis.',
                '📈 Evaluasi kinerja secara rutin untuk perbaikan berkelanjutan.'
            ]
        },
        en: {
            noTopicLabel: 'business opportunities',
            hooks: function(topic) {
                return [
                    '🎙️ Hey there! Today we\'re diving into a fascinating topic: ' + topic + '.',
                    '💡 Have you ever thought about ' + topic + '? Let\'s break it down!',
                    '🚀 Welcome to KESEMPATAN OS! Today we\'re exploring ' + topic + ' in depth.'
                ];
            },
            skorAkhir: function(score) { return '📈 FINAL SCORE: ' + score + '/100'; },
            ringkasanHeader: '📝 EXECUTIVE SUMMARY',
            insightHeader: '💡 KEY INSIGHT',
            strategiHeader: '🎯 RECOMMENDED STRATEGY',
            opportunity: {
                high: { label: '✅ HIGH OPPORTUNITY', body: function(score) { return 'A score of ' + score + '/100 shows a very promising opportunity. With strong insight and the right strategy, this is worth executing right away. Don\'t wait too long, competitors are likely eyeing this too!'; } },
                mid: { label: '🔍 MODERATE OPPORTUNITY', body: function(score) { return 'A score of ' + score + '/100 shows potential worth digging into further. While there are positive signals, more market validation and research are needed before full execution. Use this data as a base for a more informed decision.'; } },
                low: { label: '⚠️ LOW OPPORTUNITY', body: function(score) { return 'A score of ' + score + '/100 suggests risks worth considering. It\'s advisable to re-evaluate or look for better alternatives. Don\'t be afraid to pivot if needed!'; } }
            },
            rekomendasiHeader: '🎯 STRATEGIC RECOMMENDATION',
            kompetitorHeader: '👥 COMPETITOR ANALYSIS',
            kompetitorBody: function(keywords) { return 'Available data shows competitors are also active in this space. Keywords that surfaced: ' + keywords + '. This indicates fairly tight competition, but also a healthy market.'; },
            peluangPasarHeader: '📊 MARKET OPPORTUNITY',
            marketScoreLine: function(score) { return 'Market opportunity score: ' + score + '/100. '; },
            market: {
                high: 'The market shows positive growth and bright prospects. This is a good time to enter and secure a strategic position.',
                mid: 'The market is still developing. Market education and a more personal approach are needed.',
                low: 'The market isn\'t mature yet. Consider waiting for more positive signals.'
            },
            kesimpulanHeader: '📌 CONCLUSION',
            kesimpulanBody: function(topic, score) { return 'Based on analysis from 12 agents, the opportunity "' + topic + '" scores ' + score + '/100. '; },
            rekomendasiUtama: function(rec) { return 'Main recommendation: ' + rec + '. '; },
            perluAnalisis: 'Further analysis is needed to determine the best next step. ',
            langkahHeader: '🚀 NEXT STEPS',
            steps: {
                high: ['🏃 Execute right away with a solid strategy', '📊 Monitor market developments closely', '🔄 Evaluate and optimize every 3 months', '🤝 Build strategic partnerships to accelerate growth'],
                mid: ['🔍 Do additional research and market validation', '📋 Gather more complete data', '🗣️ Consult with your team or relevant experts', '📝 Build a prototype / MVP to test'],
                low: ['🔄 Re-evaluate strategy and positioning', '🔍 Look for other opportunities', '💪 Improve weak areas', '🎯 Focus on core competencies first']
            },
            sentenceTemplates: [
                function(topic) { return '🚀 The ' + topic + ' opportunity is very promising to explore.'; },
                function(topic) { return '💡 The right strategy for ' + topic + ' will bring optimal results.'; },
                function(topic) { return '🔥 Innovation in ' + topic + ' is key to staying relevant.'; },
                function(topic) { return '📊 Data shows ' + topic + ' is seeing continued positive growth.'; },
                function(topic) { return '🎯 Recommendation: focus on ' + topic + ' as a top priority.'; },
                function(topic) { return '📈 Analysis of ' + topic + ' shows a very interesting trend.'; },
                function(topic) { return '💪 ' + topic + ' requires persistence and consistency.'; },
                function(topic) { return '🌟 ' + topic + ' is a golden opportunity in the digital era.'; }
            ],
            recommendations: [
                '🚀 Next step: execute quickly and precisely.',
                '📊 Prioritize innovation and adaptation to change.',
                '🔍 Keep tracking competitor movements regularly.',
                '💎 Focus on customer satisfaction as the top priority.',
                '⚡ Optimize operational efficiency for maximum results.',
                '🎯 Set clear, measurable targets.',
                '🤝 Build strategic partnerships.',
                '📈 Evaluate performance regularly for continuous improvement.'
            ]
        },
        de: {
            noTopicLabel: 'Geschäftschancen',
            hooks: function(topic) {
                return [
                    '🎙️ Hallo zusammen! Heute sprechen wir über ein spannendes Thema: ' + topic + '.',
                    '💡 Haben Sie schon einmal über ' + topic + ' nachgedacht? Lassen Sie es uns gemeinsam durchgehen!',
                    '🚀 Willkommen bei KESEMPATAN OS! Heute beleuchten wir ' + topic + ' ausführlich.'
                ];
            },
            skorAkhir: function(score) { return '📈 ENDPUNKTZAHL: ' + score + '/100'; },
            ringkasanHeader: '📝 ZUSAMMENFASSUNG',
            insightHeader: '💡 WICHTIGSTE ERKENNTNIS',
            strategiHeader: '🎯 EMPFOHLENE STRATEGIE',
            opportunity: {
                high: { label: '✅ HOHE CHANCE', body: function(score) { return 'Eine Punktzahl von ' + score + '/100 zeigt eine sehr vielversprechende Chance. Mit starken Erkenntnissen und der richtigen Strategie lohnt es sich, diese Chance sofort umzusetzen. Warten Sie nicht zu lange, die Konkurrenz hat das sicher auch im Blick!'; } },
                mid: { label: '🔍 MITTLERE CHANCE', body: function(score) { return 'Eine Punktzahl von ' + score + '/100 zeigt Potenzial, das genauer untersucht werden sollte. Trotz positiver Signale sind weitere Marktvalidierung und Recherche vor einer vollständigen Umsetzung nötig. Nutzen Sie diese Daten als Grundlage für eine fundiertere Entscheidung.'; } },
                low: { label: '⚠️ GERINGE CHANCE', body: function(score) { return 'Eine Punktzahl von ' + score + '/100 deutet auf Risiken hin, die berücksichtigt werden sollten. Es wird empfohlen, neu zu bewerten oder bessere Alternativen zu suchen. Scheuen Sie sich nicht, bei Bedarf die Richtung zu wechseln!'; } }
            },
            rekomendasiHeader: '🎯 STRATEGISCHE EMPFEHLUNG',
            kompetitorHeader: '👥 WETTBEWERBSANALYSE',
            kompetitorBody: function(keywords) { return 'Die vorliegenden Daten zeigen, dass auch Wettbewerber in diesem Bereich aktiv sind. Aufgetauchte Schlüsselwörter: ' + keywords + '. Das deutet auf einen recht intensiven Wettbewerb hin, aber auch auf einen gesunden Markt.'; },
            peluangPasarHeader: '📊 MARKTCHANCE',
            marketScoreLine: function(score) { return 'Marktchancen-Punktzahl: ' + score + '/100. '; },
            market: {
                high: 'Der Markt zeigt positives Wachstum und rosige Aussichten. Jetzt ist ein guter Zeitpunkt, um einzusteigen und sich strategisch zu positionieren.',
                mid: 'Der Markt befindet sich noch in der Entwicklung. Marktbildung und ein persönlicherer Ansatz sind erforderlich.',
                low: 'Der Markt ist noch nicht ausgereift. Erwägen Sie, auf weitere positive Signale zu warten.'
            },
            kesimpulanHeader: '📌 FAZIT',
            kesimpulanBody: function(topic, score) { return 'Basierend auf der Analyse von 12 Agenten erreicht die Chance "' + topic + '" eine Punktzahl von ' + score + '/100. '; },
            rekomendasiUtama: function(rec) { return 'Hauptempfehlung: ' + rec + '. '; },
            perluAnalisis: 'Weitere Analysen sind nötig, um den besten nächsten Schritt zu bestimmen. ',
            langkahHeader: '🚀 NÄCHSTE SCHRITTE',
            steps: {
                high: ['🏃 Sofort mit einer soliden Strategie umsetzen', '📊 Marktentwicklungen genau beobachten', '🔄 Alle 3 Monate evaluieren und optimieren', '🤝 Strategische Partnerschaften aufbauen, um das Wachstum zu beschleunigen'],
                mid: ['🔍 Zusätzliche Recherche und Marktvalidierung durchführen', '📋 Vollständigere Daten sammeln', '🗣️ Mit dem Team oder Experten Rücksprache halten', '📝 Einen Prototyp / MVP zum Testen bauen'],
                low: ['🔄 Strategie und Positionierung neu bewerten', '🔍 Nach anderen Chancen suchen', '💪 Schwachstellen verbessern', '🎯 Zunächst auf Kernkompetenzen fokussieren']
            },
            sentenceTemplates: [
                function(topic) { return '🚀 Die Chance rund um ' + topic + ' ist sehr vielversprechend.'; },
                function(topic) { return '💡 Die richtige Strategie für ' + topic + ' bringt optimale Ergebnisse.'; },
                function(topic) { return '🔥 Innovation bei ' + topic + ' ist der Schlüssel, um relevant zu bleiben.'; },
                function(topic) { return '📊 Daten zeigen, dass ' + topic + ' weiterhin positiv wächst.'; },
                function(topic) { return '🎯 Empfehlung: ' + topic + ' als Top-Priorität setzen.'; },
                function(topic) { return '📈 Die Analyse von ' + topic + ' zeigt einen sehr interessanten Trend.'; },
                function(topic) { return '💪 ' + topic + ' erfordert Ausdauer und Beständigkeit.'; },
                function(topic) { return '🌟 ' + topic + ' ist eine goldene Chance im digitalen Zeitalter.'; }
            ],
            recommendations: [
                '🚀 Nächster Schritt: schnell und präzise umsetzen.',
                '📊 Innovation und Anpassungsfähigkeit priorisieren.',
                '🔍 Wettbewerber regelmäßig im Blick behalten.',
                '💎 Kundenzufriedenheit als oberste Priorität setzen.',
                '⚡ Betriebliche Effizienz für maximale Ergebnisse optimieren.',
                '🎯 Klare, messbare Ziele setzen.',
                '🤝 Strategische Partnerschaften aufbauen.',
                '📈 Leistung regelmäßig für kontinuierliche Verbesserung bewerten.'
            ]
        }
    };

    class AIInternal {
        constructor() {
            this.vocabulary = [
                'bisnis', 'peluang', 'strategi', 'inovasi', 'digital',
                'startup', 'investasi', 'pemasaran', 'produk', 'layanan',
                'pelanggan', 'pasar', 'kompetitor', 'risiko', 'keuntungan',
                'analisis', 'data', 'tren', 'pertumbuhan', 'skalabilitas',
                'efisiensi', 'otomatisasi', 'teknologi', 'kreatif', 'solusi',
                // 🔥 TAMBAHAN
                'ekosistem', 'sinergi', 'disrupsi', 'agilitas', 'resiliensi',
                'kapitalisasi', 'monetisasi', 'akuisisi', 'ekspansi', 'diversifikasi',
                'optimasi', 'kolaborasi', 'transformasi', 'adaptasi', 'visibilitas',
                'kredibilitas', 'sustainabilitas', 'akselerasi', 'diferensiasi',
                'kuantitatif', 'kualitatif', 'iterasi', 'validasi', 'proyeksi',
                'profitabilitas', 'likuiditas', 'solvabilitas', 'valuasi', 'ekuitas',
                'margin', 'burn rate', 'runway', 'pivot', 'scale up'
            ];
            this.contextMemory = [];
            this.conversationHistory = [];
            this.userPreferences = {
                preferredTone: 'professional',
                preferredLength: 'medium',
                favoriteTopics: [],
                lastTopic: null
            };
        }

        // ============================================================
        // 🌍 SISTEM MULTI-BAHASA — LANG_STRINGS
        // ============================================================
        // FIX AKAR MASALAH: sebelumnya dropdown Bahasa cuma mengubah kode
        // TTS (aksen suara) - naskah yang DIBACAKAN tetap Bahasa Indonesia
        // apapun bahasanya, jadi kalau pilih Jerman, hasilnya teks
        // Indonesia dibaca dengan pengucapan Jerman yang aneh/salah.
        // Sekarang konten naskah BENERAN ikut bahasa yang dipilih untuk
        // Indonesia/English/Deutsch (cakupan penuh). Untuk 15 bahasa
        // lainnya di dropdown, sistem transparan: fallback ke Bahasa
        // Indonesia + toast pemberitahuan (bukan pura-pura sudah lengkap),
        // sambil struktur LANG_STRINGS ini didesain gampang diperluas.
        generateText(prompt, maxTokens, temperature, lang) {
            maxTokens = maxTokens || 400;
            // 🔥 Default temperature dinaikkan 0.5 -> 0.7 (menyamai Debate)
            // atas permintaan user — respons jadi lebih variatif/mendalam
            // untuk pemanggil mana pun yang tidak set temperature sendiri.
            temperature = temperature || 0.7;
            const L = LANG_STRINGS[lang] || LANG_STRINGS.id;

            const hasData = prompt.includes('Skor:') ||
                           prompt.includes('Ringkasan:') ||
                           prompt.includes('Insight:');

            if (hasData) {
                const scoreMatch = prompt.match(/Skor:\s*(\d+)/);
                const topicMatch = prompt.match(/tentang\s*"([^"]+)"/);
                const summaryMatch = prompt.match(/Ringkasan:\s*([^.]+)/);
                const insightMatch = prompt.match(/Insight:\s*([^.]+)/);
                const strategyMatch = prompt.match(/Strategi:\s*([^.]+)/);
                const recMatch = prompt.match(/Rekomendasi:\s*([^.]+)/);

                const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
                const topic = topicMatch ? topicMatch[1] : L.noTopicLabel;
                const summary = summaryMatch ? summaryMatch[1].trim() : '';
                const insight = insightMatch ? insightMatch[1].trim() : '';
                const strategy = strategyMatch ? strategyMatch[1].trim() : '';
                const rec = recMatch ? recMatch[1].trim() : '';

                const contextAnalysis = this.analyzeContext(topic, score, summary, insight);
                const competitorInsight = this.analyzeCompetitors(prompt);
                const marketScore = this.analyzeMarketOpportunity(prompt);

                let text = '';

                const hooks = L.hooks(topic);
                text += hooks[Math.floor(Math.random() * hooks.length)] + '\n\n';

                text += L.skorAkhir(score) + '\n\n';

                if (summary) {
                    text += L.ringkasanHeader + '\n' + summary + '\n\n';
                }
                if (insight) {
                    text += L.insightHeader + '\n' + insight + '\n\n';
                }
                if (strategy) {
                    text += L.strategiHeader + '\n' + strategy + '\n\n';
                }

                const tier = score >= 70 ? 'high' : (score >= 50 ? 'mid' : 'low');
                text += L.opportunity[tier].label + '\n';
                text += L.opportunity[tier].body(score) + '\n\n';

                if (rec) {
                    text += L.rekomendasiHeader + '\n' + rec + '\n\n';
                }

                if (competitorInsight.hasCompetitor) {
                    text += L.kompetitorHeader + '\n';
                    text += L.kompetitorBody(competitorInsight.keywords.join(', ')) + '\n\n';
                }

                text += L.peluangPasarHeader + '\n';
                text += L.marketScoreLine(marketScore);
                const marketTier = marketScore >= 70 ? 'high' : (marketScore >= 50 ? 'mid' : 'low');
                text += L.market[marketTier] + '\n\n';

                text += L.kesimpulanHeader + '\n';
                text += L.kesimpulanBody(topic, score);
                text += rec ? L.rekomendasiUtama(rec) : L.perluAnalisis;
                text += '\n\n';

                text += L.langkahHeader + '\n';
                L.steps[tier].forEach(function(step, i) {
                    text += (i + 1) + '. ' + step + '\n';
                });
                text += '\n';

                this.rememberContext({
                    topic: topic,
                    score: score,
                    summary: summary,
                    insight: insight,
                    recommendation: rec
                });

                return text;
            }

            // ========== FALLBACK (TANPA SUBSCRIBE TEXT) ==========
            // FIX: sebelumnya topik asli dari input mandiri user TIDAK PERNAH dipakai
            // di sini - hanya vocabulary acak yang dipilih, sehingga naskah podcast
            // independen (topik manual) selalu berisi buzzword acak dan tidak pernah
            // menyebut topik yang benar-benar diketik user. Sekarang ambil topik asli
            // dari prompt (pola sama seperti di cabang hasData) dan prioritaskan itu.
            const topicMatch = prompt.match(/tentang\s*"([^"]+)"/);
            const actualTopic = topicMatch ? topicMatch[1] : null;

            const topicWords = ['bisnis', 'digital', 'startup', 'inovasi', 'strategi', 'peluang', 'pemasaran', 'investasi', 'teknologi', 'kreatif'];
            let mainTopic = actualTopic || 'bisnis';
            if (!actualTopic) {
                const promptLower = prompt.toLowerCase();
                for (let i = 0; i < topicWords.length; i++) {
                    const t = topicWords[i];
                    if (promptLower.includes(t)) { mainTopic = t; break; }
                }
            }

            const sentenceTemplates = L.sentenceTemplates;

            const result = [];
            const numSentences = 6 + Math.floor(Math.random() * 4);
            for (let i = 0; i < numSentences; i++) {
                const template = sentenceTemplates[i % sentenceTemplates.length];
                // FIX: topik asli diprioritaskan di sebagian besar kalimat; vocabulary
                // cuma dipakai sesekali sebagai variasi tambahan, bukan pengganti topik.
                let topic;
                if (actualTopic && (i % 3 !== 2)) {
                    topic = actualTopic;
                } else {
                    const vocabIndex = Math.floor(Math.random() * this.vocabulary.length);
                    const vocabWord = this.vocabulary[vocabIndex];
                    topic = actualTopic ? (actualTopic + ' (' + vocabWord + ')') : vocabWord;
                }
                result.push(template(topic));
            }

            const recommendations = L.recommendations;
            for (let i = 0; i < 2; i++) {
                const recIndex = Math.floor(Math.random() * recommendations.length);
                result.push(recommendations[recIndex]);
            }
            // 🔥 SUBSCRIBE TEXT DIHAPUS DARI SINI (hanya di ui-generator)
            return result.join(' ');
        }

        // ===== FUNGSI-FUNGSI LAINNYA (tetap sama) =====

        rememberContext(context) {
            this.conversationHistory.push({
                timestamp: Date.now(),
                ...context,
                summary: context.summary ? context.summary.substring(0, 100) : ''
            });
            if (this.conversationHistory.length > 10) {
                this.conversationHistory.shift();
            }
            if (context.topic) {
                this.userPreferences.lastTopic = context.topic;
                if (!this.userPreferences.favoriteTopics.includes(context.topic)) {
                    this.userPreferences.favoriteTopics.push(context.topic);
                }
                if (this.userPreferences.favoriteTopics.length > 10) {
                    this.userPreferences.favoriteTopics.shift();
                }
            }
        }

        getPreviousContext() {
            return this.conversationHistory.slice(-3);
        }

        analyzeCompetitors(text) {
            const keywords = ['kompetitor', 'pesaing', 'saingan', 'rival', 'kompetisi', 'persaingan'];
            let found = [];
            for (let i = 0; i < keywords.length; i++) {
                if (text.toLowerCase().includes(keywords[i])) {
                    found.push(keywords[i]);
                }
            }
            return {
                hasCompetitor: found.length > 0,
                keywords: found,
                confidence: Math.min(found.length / keywords.length, 1)
            };
        }

        analyzeMarketOpportunity(text) {
            const opportunitySignals = [
                'tumbuh', 'berkembang', 'meningkat', 'peluang',
                'potensi', 'permintaan', 'pasar', 'kesempatan',
                'prospek', 'cerah', 'positif', 'ekspansi'
            ];
            let score = 0;
            for (let i = 0; i < opportunitySignals.length; i++) {
                if (text.toLowerCase().includes(opportunitySignals[i])) {
                    score += 8;
                }
            }
            return Math.min(score, 100);
        }

        analyzeContext(topic, score, summary, insight) {
            return {
                topicComplexity: topic.split(' ').length > 3 ? 'complex' : 'simple',
                scoreLevel: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low',
                hasSummary: summary.length > 0,
                hasInsight: insight.length > 0,
                timestamp: Date.now()
            };
        }

        analyzeSentiment(text) {
            const positive = ['baik', 'bagus', 'hebat', 'sukses', 'cerah', 'optimis', 'berkembang', 'gemilang', 'luar biasa', 'fantastis', 'menjanjikan', 'positif', 'progresif', 'inovatif'];
            const negative = ['buruk', 'jelek', 'risiko', 'gagal', 'turun', 'rugi', 'suram', 'pesimis', 'krisis', 'ancaman', 'hambatan', 'negatif', 'stagnan', 'mundur'];
            const words = text.toLowerCase().split(/\s+/);
            let score = 0, pos = 0, neg = 0;
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const clean = word.replace(/[^a-zA-Z]/g, '');
                if (positive.includes(clean)) { score += 1.5; pos++; }
                if (negative.includes(clean)) { score -= 1.5; neg++; }
            }
            const total = pos + neg || 1;
            const normalizedScore = score / (total * 1.5);
            const sentiment = normalizedScore > 0.3 ? 'positive' : normalizedScore < -0.3 ? 'negative' : 'neutral';
            let intensity = 'moderate';
            if (Math.abs(normalizedScore) > 0.6) intensity = 'strong';
            else if (Math.abs(normalizedScore) < 0.15) intensity = 'weak';

            return {
                score: normalizedScore,
                sentiment: sentiment,
                positive: pos,
                negative: neg,
                intensity: intensity,
                confidence: Math.min((Math.abs(normalizedScore) * 100), 100),
                label: normalizedScore > 0.4 ? 'Sangat Positif' : normalizedScore > 0.15 ? 'Positif' : normalizedScore > -0.15 ? 'Netral' : normalizedScore > -0.4 ? 'Negatif' : 'Sangat Negatif'
            };
        }

        extractTopics(text) {
            const words = text.toLowerCase().split(/\s+/);
            const wordCount = {};
            for (let i = 0; i < this.vocabulary.length; i++) {
                const vocab = this.vocabulary[i];
                let count = 0;
                for (let j = 0; j < words.length; j++) {
                    if (words[j].includes(vocab)) count++;
                }
                if (count > 0) wordCount[vocab] = count;
            }
            const sorted = Object.entries(wordCount).sort(function(a, b) { return b[1] - a[1]; });
            const total = words.length || 1;
            const result = [];
            const maxItems = Math.min(sorted.length, 7);
            for (let i = 0; i < maxItems; i++) {
                const item = sorted[i];
                result.push({
                    topic: item[0],
                    relevance: Math.min((item[1] / total) * 100, 100),
                    count: item[1]
                });
            }
            return result;
        }

        summarize(text, maxLength) {
            maxLength = maxLength || 200;
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            const scored = [];
            for (let i = 0; i < sentences.length; i++) {
                const s = sentences[i];
                scored.push({ text: s.trim(), score: this.scoreSentence(s) });
            }
            const sorted = scored.sort(function(a, b) { return b.score - a.score; });
            let summary = '', length = 0;
            for (let i = 0; i < sorted.length; i++) {
                const item = sorted[i];
                if (length + item.text.length <= maxLength) {
                    summary += item.text + ' ';
                    length += item.text.length;
                }
            }
            if (!summary.trim()) {
                return text.substring(0, maxLength) + '...';
            }
            return summary.trim();
        }

        generateExecutiveSummary(text, maxLength) {
            maxLength = maxLength || 150;
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            const important = sentences.filter(s => 
                s.toLowerCase().includes('strategi') ||
                s.toLowerCase().includes('rekomendasi') ||
                s.toLowerCase().includes('kesimpulan') ||
                s.toLowerCase().includes('insight') ||
                s.toLowerCase().includes('peluang')
            );
            if (important.length > 0) {
                return important.slice(0, 2).join(' ').substring(0, maxLength);
            }
            return text.substring(0, maxLength) + '...';
        }

        scoreSentence(sentence) {
            let score = 0;
            for (let i = 0; i < this.vocabulary.length; i++) {
                const vocab = this.vocabulary[i];
                if (sentence.toLowerCase().includes(vocab)) score += 2;
            }
            score += 1;
            score += Math.min(sentence.split(' ').length / 5, 3);
            const keywords = ['penting', 'utama', 'kunci', 'rekomendasi', 'strategi', 'insight', 'peluang'];
            for (let i = 0; i < keywords.length; i++) {
                if (sentence.toLowerCase().includes(keywords[i])) score += 3;
            }
            return score;
        }

        getRecommendations(analysis) {
            const score = analysis.score || 0;
            const sentiment = analysis.sentiment || 'neutral';
            const topics = analysis.topics || [];
            const recs = [];

            if (score > 80) {
                recs.push({ priority: 'high', action: '🚀 Eksekusi Segera', detail: 'Skor sangat tinggi! Ambil tindakan sekarang.', icon: '🚀' });
                recs.push({ priority: 'high', action: '📈 Scaling Up', detail: 'Siapkan infrastruktur untuk ekspansi cepat.', icon: '📈' });
            } else if (score > 60) {
                recs.push({ priority: 'high', action: '📊 Analisis Mendalam', detail: 'Skor baik. Lakukan analisis lebih detail untuk konfirmasi.', icon: '📊' });
                recs.push({ priority: 'medium', action: '🔍 Riset Pasar', detail: 'Validasi dengan riset pasar langsung.', icon: '🔍' });
            } else if (score > 40) {
                recs.push({ priority: 'medium', action: '🔍 Riset Tambahan', detail: 'Skor menengah. Perlu riset dan validasi lebih lanjut.', icon: '🔍' });
                recs.push({ priority: 'medium', action: '🤝 Konsultasi', detail: 'Diskusikan dengan tim atau mentor.', icon: '🤝' });
            } else {
                recs.push({ priority: 'low', action: '🔄 Evaluasi Ulang', detail: 'Skor rendah. Pertimbangkan opsi lain.', icon: '🔄' });
                recs.push({ priority: 'low', action: '💡 Cari Alternatif', detail: 'Eksplorasi peluang lain yang lebih menjanjikan.', icon: '💡' });
            }

            if (sentiment === 'positive') {
                recs.push({ priority: 'high', action: '💪 Pertahankan Momentum', detail: 'Sentimen positif. Lanjutkan strategi yang berjalan.', icon: '💪' });
            } else if (sentiment === 'negative') {
                recs.push({ priority: 'medium', action: '⚠️ Mitigasi Risiko', detail: 'Ada sentimen negatif. Siapkan mitigasi risiko.', icon: '⚠️' });
            } else {
                recs.push({ priority: 'low', action: '🧐 Observasi', detail: 'Sentimen netral. Amati perkembangan lebih lanjut.', icon: '🧐' });
            }

            if (topics.length > 0) {
                recs.push({ priority: 'medium', action: '🎯 Fokus: ' + topics[0].topic, detail: 'Relevansi ' + topics[0].relevance.toFixed(0) + '%', icon: '🎯' });
                if (topics.length > 1) {
                    recs.push({ priority: 'low', action: '📌 Juga Perhatikan: ' + topics[1].topic, detail: 'Relevansi ' + topics[1].relevance.toFixed(0) + '%', icon: '📌' });
                }
            }

            if (this.userPreferences.lastTopic) {
                recs.push({ priority: 'medium', action: '🔄 Konsistensi', detail: 'Topik sebelumnya: ' + this.userPreferences.lastTopic, icon: '🔄' });
            }

            return recs.slice(0, 6);
        }

        improveScript(text, style) {
            style = style || 'professional';
            let improved = text;

            const commonWords = ['sangat', 'baik', 'menarik', 'bagus', 'bisa', 'dapat'];
            for (let i = 0; i < commonWords.length; i++) {
                const word = commonWords[i];
                const regex = new RegExp('\\b' + word + '\\b', 'gi');
                const matches = text.match(regex) || [];
                if (matches.length > 3) {
                    const alternatives = {
                        'sangat': ['amat', 'terlalu', 'begitu', 'sungguh', 'ekstrem', 'luar biasa'],
                        'baik': ['bagus', 'prima', 'unggul', 'berkualitas', 'istimewa', 'optimal'],
                        'menarik': ['memikat', 'menawan', 'menggoda', 'menantang', 'memukau', 'fascinasi'],
                        'bagus': ['hebat', 'keren', 'mantap', 'top', 'luar biasa', 'istimewa'],
                        'bisa': ['mampu', 'dapat', 'mungkin', 'sanggup', 'berpotensi'],
                        'dapat': ['bisa', 'mampu', 'memperoleh', 'mendapat', 'menerima']
                    };
                    const alt = alternatives[word] || ['lainnya'];
                    improved = improved.replace(regex, function() {
                        return alt[Math.floor(Math.random() * alt.length)];
                    });
                }
            }

            if (style === 'professional') {
                improved = improved.replace(/aku/g, 'saya').replace(/kamu/g, 'Anda');
                improved = improved.replace(/gak/g, 'tidak').replace(/nggak/g, 'tidak');
            } else if (style === 'casual') {
                improved = improved.replace(/saya/g, 'aku').replace(/Anda/g, 'kamu');
                improved = improved.replace(/tidak/g, 'gak').replace(/dan/g, '&');
            } else if (style === 'inspiring') {
                const inspiration = [
                    '💪 Ini adalah kesempatan Anda untuk berubah!',
                    '🌟 Jadilah bagian dari perubahan besar!',
                    '🚀 Masa depan dimulai dari langkah kecil hari ini!',
                    '🔥 Jangan takut gagal, takutlah untuk tidak mencoba!',
                    '✨ Setiap perjalanan dimulai dengan satu langkah!'
                ];
                improved += '\n\n' + inspiration[Math.floor(Math.random() * inspiration.length)];
            } else if (style === 'storytelling') {
                improved = 'Bayangkan sebuah perjalanan...\n' + improved + '\n\nDan itulah kisahnya.';
            }

            return improved;
        }

        generateQA(text, numQuestions) {
            numQuestions = numQuestions || 3;
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            const scored = [];
            for (let i = 0; i < sentences.length; i++) {
                const s = sentences[i];
                scored.push({ text: s.trim(), score: this.scoreSentence(s) });
            }
            const sorted = scored.sort(function(a, b) { return b.score - a.score; });
            const topSentences = sorted.slice(0, Math.min(numQuestions * 2, sorted.length));

            const templates = [
                function(s) { return 'Apa yang dimaksud dengan "' + s.substring(0, 35) + '..."?'; },
                function(s) { return 'Mengapa ' + s.substring(0, 25) + '...?'; },
                function(s) { return 'Bagaimana cara ' + s.substring(0, 25) + '...?'; },
                function(s) { return 'Apa manfaat dari ' + s.substring(0, 25) + '...?'; },
                function(s) { return 'Kapan waktu yang tepat untuk ' + s.substring(0, 20) + '...?'; },
                function(s) { return 'Siapa yang paling diuntungkan dari ' + s.substring(0, 20) + '...?'; }
            ];

            const questions = [];
            const usedIndices = [];
            for (let i = 0; i < Math.min(numQuestions, topSentences.length); i++) {
                let idx;
                let attempts = 0;
                do {
                    idx = Math.floor(Math.random() * topSentences.length);
                    attempts++;
                } while (usedIndices.includes(idx) && attempts < 20);
                usedIndices.push(idx);
                const s = topSentences[idx];
                const template = templates[i % templates.length];
                const question = template(s.text);
                const answer = this.generateText('Jawab: ' + question + '. Berdasarkan: ' + s.text, 50);
                questions.push({ 
                    question: question, 
                    answer: answer || 'Tidak tersedia', 
                    source: s.text.substring(0, 100) + '...' 
                });
            }
            return questions;
        }

        translate(text, targetLang) {
            targetLang = targetLang || 'en';
            const dict = {
                'bisnis': 'business', 'peluang': 'opportunity', 'strategi': 'strategy',
                'inovasi': 'innovation', 'digital': 'digital', 'startup': 'startup',
                'investasi': 'investment', 'pemasaran': 'marketing', 'produk': 'product',
                'layanan': 'service', 'pelanggan': 'customer', 'pasar': 'market',
                'kompetitor': 'competitor', 'risiko': 'risk', 'keuntungan': 'profit',
                'analisis': 'analysis', 'data': 'data', 'tren': 'trend', 'pertumbuhan': 'growth',
                'skalabilitas': 'scalability', 'efisiensi': 'efficiency', 'otomatisasi': 'automation',
                'teknologi': 'technology', 'kreatif': 'creative', 'solusi': 'solution',
                'ekosistem': 'ecosystem', 'sinergi': 'synergy', 'disrupsi': 'disruption',
                'agilitas': 'agility', 'resiliensi': 'resilience', 'kapitalisasi': 'capitalization',
                'monetisasi': 'monetization', 'akuisisi': 'acquisition', 'ekspansi': 'expansion',
                'diversifikasi': 'diversification', 'optimasi': 'optimization', 'kolaborasi': 'collaboration',
                'transformasi': 'transformation', 'adaptasi': 'adaptation', 'visibilitas': 'visibility',
                'kredibilitas': 'credibility', 'sustainabilitas': 'sustainability', 'akselerasi': 'acceleration',
                'diferensiasi': 'differentiation', 'kuantitatif': 'quantitative', 'kualitatif': 'qualitative',
                'iterasi': 'iteration', 'validasi': 'validation', 'proyeksi': 'projection',
                'profitabilitas': 'profitability', 'likuiditas': 'liquidity', 'solvabilitas': 'solvency',
                'valuasi': 'valuation', 'ekuitas': 'equity', 'margin': 'margin'
            };
            let translated = text;
            if (targetLang === 'en') {
                const entries = Object.entries(dict);
                for (let i = 0; i < entries.length; i++) {
                    const pair = entries[i];
                    const from = pair[0];
                    const to = pair[1];
                    translated = translated.replace(new RegExp('\\b' + from + '\\b', 'gi'), to);
                }
            } else if (targetLang === 'id') {
                const reverseDict = {};
                const entries = Object.entries(dict);
                for (let i = 0; i < entries.length; i++) {
                    const pair = entries[i];
                    reverseDict[pair[1]] = pair[0];
                }
                const revEntries = Object.entries(reverseDict);
                for (let i = 0; i < revEntries.length; i++) {
                    const pair = revEntries[i];
                    const from = pair[0];
                    const to = pair[1];
                    translated = translated.replace(new RegExp('\\b' + from + '\\b', 'gi'), to);
                }
            }
            return translated;
        }

        understandContext(text) {
            const topics = this.extractTopics(text);
            const sentiment = this.analyzeSentiment(text);
            const summary = this.summarize(text);
            const executiveSummary = this.generateExecutiveSummary(text);
            const voiceRec = voiceEngine.recommendVoice(text);
            const competitor = this.analyzeCompetitors(text);
            const marketScore = this.analyzeMarketOpportunity(text);

            return {
                topics: topics,
                sentiment: sentiment,
                summary: summary,
                executiveSummary: executiveSummary,
                voiceRecommendation: voiceRec,
                competitorAnalysis: competitor,
                marketScore: marketScore,
                wordCount: text.split(/\s+/).length,
                estimatedDuration: Math.ceil(text.split(/\s+/).length / 150),
                complexity: this.calculateComplexity(text),
                timestamp: Date.now()
            };
        }

        calculateComplexity(text) {
            const words = text.split(/\s+/);
            let longWords = 0;
            for (let i = 0; i < words.length; i++) {
                if (words[i].length > 7) longWords++;
            }
            const uniqueWords = new Set(words.map(function(w) { return w.toLowerCase(); })).size;
            const ratio = longWords / words.length;
            const diversity = uniqueWords / words.length;
            return Math.min(((ratio * 2) + diversity) * 50, 100);
        }
    }

    const ai = new AIInternal();

    // ========== EKSPOR ==========
    KESEMPATAN.Podcast.aiEngine = {
        ai: ai,
        voiceEngine: voiceEngine
    };
})();
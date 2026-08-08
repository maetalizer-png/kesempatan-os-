/* ============================================================
   interactive/debate/deb-debate-arena.js
   KELAS UTAMA DEB_DebateArena — orkestrasi penuh 1 pertandingan
   debat (opening, bantahan per ronde, closing, penjurian).
   Dipakai juga oleh Turnamen (interactive/tournament/) sebagai
   mesin "satu pertandingan" dalam bracket.
   ============================================================ */
    class DEB_DebateArena {
        constructor() {
            this.state = new DEB_DebateState();
            this.config = new DEB_SecureConfig();
            this.voice = new DEB_VoiceManager();
            this.analytics = new DEB_DebateAnalytics();
            this.history = new DEB_DebateHistory();
            this.exporter = DEB_DebateExporter;
            this.security = DEB_SecurityManager;

            this.onUpdate = null;
            this.onRoundComplete = null;
            this.onDebateEnd = null;
            this.onMessage = null;

            this.setupAutoSave();
            this.setupVoice();
        }

        setupAutoSave() {
            setInterval(function() {
                if (this.state.status === 'running' && this.state.history.length > 0) {
                    this.autoSave();
                }
            }.bind(this), this.config.AUTO_SAVE_INTERVAL);
        }

        setupVoice() {
            document.addEventListener('click', function() {
                if (this.voice.synthesis) {
                    this.voice.loadVoices();
                }
            }.bind(this), { once: true });
        }

        // ===== AMBIL SEMUA DATA DARI 3 SUMBER DENGAN CACHE =====
        async fetchAllData(topic) {
            const context = await DEB_getAllContext(topic, {
                forceRefresh: false,
                topK: DEB_CONFIG.TOP_K_MEMORY,
                dbLimit: DEB_CONFIG.DB_LIMIT,
                maxResults: DEB_CONFIG.MAX_RESULTS
            });

            this.state.staticData = context.static;
            this.state.memoryData = context.memory;
            this.state.dbData = context.db;
            this.state.context = context;

            return {
                static: context.static,
                memory: context.memory,
                database: context.db,
                total: context.totalSources.total,
                combined: context.combined
            };
        }

        // ===== UPDATE DASHBOARD =====
        updateDashboard() {
            const scoreA = this.analytics.getScore('agentA');
            const scoreB = this.analytics.getScore('agentB');
            const round = this.state.currentRound;
            const maxRounds = this.state.maxRounds;
            const elA = document.getElementById('debateScoreA');
            const elB = document.getElementById('debateScoreB');
            const barA = document.getElementById('debateBarA');
            const barB = document.getElementById('debateBarB');
            const roundEl = document.getElementById('debateRoundDisplay');
            const timerEl = document.getElementById('debateTimerDisplay');
            if (elA) {
                elA.textContent = Math.round(scoreA) + '%';
            }
            if (elB) {
                elB.textContent = Math.round(scoreB) + '%';
            }
            if (barA) {
                barA.style.width = Math.min(100, scoreA) + '%';
            }
            if (barB) {
                barB.style.width = Math.min(100, scoreB) + '%';
            }
            if (roundEl) {
                roundEl.textContent = round + '/' + maxRounds;
            }
            if (timerEl && this.state.startTime) {
                const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
                const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
                const secs = String(elapsed % 60).padStart(2, '0');
                timerEl.textContent = mins + ':' + secs;
            }
        }

        startTimer() {
            if (this.state.timerId) {
                clearInterval(this.state.timerId);
            }
            this.state.timerId = setInterval(function() {
                if (this.state.status === 'running') {
                    this.updateDashboard();
                }
            }.bind(this), 1000);
        }

        // ===== BUILD PROMPT DENGAN DATA + SOURCE LABEL =====
        buildPromptWithData(agent, topic, type, options) {
            options = options || {};
            let prompt = '';
            let dataContext = '';

            if (this.state.context && this.state.context.combined && this.state.context.combined.length > 0) {
                dataContext += '\nDATA YANG TERSEDIA (diurutkan berdasarkan prioritas):\n';
                this.state.context.combined.slice(0, DEB_CONFIG.MAX_RESULTS).forEach(function(item, i) {
                    const text = (item.text || '').substring(0, 200);
                    const source = item._source || 'unknown';
                    const priority = item._priority || 0;

                    let sourceLabel = 'Sumber';
                    let priorityLabel = '';

                    if (source === 'static') {
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

                    dataContext += (i + 1) + '. [' + sourceLabel + '] ' + text +
                                  (priorityLabel ? ' (' + priorityLabel + ')' : '') + '\n';
                });

                dataContext += '\nTotal data: ' + this.state.context.totalSources.total +
                              ' (World: ' + this.state.context.totalSources.static +
                              ', Memory: ' + this.state.context.totalSources.memory +
                              ', Database: ' + this.state.context.totalSources.database + ')\n';

                if (this.state.context.observation && this.state.context.observation.marketInsight) {
                    dataContext += '\nSENTIMEN PASAR/BERITA TERKINI:\n' + this.state.context.observation.marketInsight + '\n';
                }
                if (this.state.context.observation && this.state.context.observation.credibilityNote) {
                    dataContext += '\n' + this.state.context.observation.credibilityNote + '\n';
                }
            } else {
                dataContext += '\n(Tidak ada data yang tersedia)\n';
            }

            const profile = DEB_getAgentProfile(agent);
            const persona = profile.name + (profile.role ? ', seorang ' + profile.role : '');
            // FIX KUALITAS: sebelumnya persona cuma "nama + role 1 kalimat".
            // Sekarang selipkan PROFIL KEAHLIAN LENGKAP (systemPrompt dari
            // prompts/*.txt, sama yg dipakai Dashboard) supaya argumen debat
            // benar2 mencerminkan cara berpikir & ketajaman analisis khas
            // agen tsb, bukan argumen generik yang bisa ditulis agen mana pun.
            const expertiseBlock = profile.systemPrompt
                ? '\nPROFIL & KEAHLIAN ANDA:\n' + profile.systemPrompt + '\n(CATATAN: instruksi "Output dalam format JSON" di profil di atas TIDAK berlaku di debat ini — tetap terapkan cara berpikir & ketajaman analisisnya, tapi jawab sebagai ARGUMEN DEBAT natural sesuai instruksi di bawah, bukan JSON.)\n'
                : '';

            switch(type) {
                case 'pro':
                    prompt = 'Anda adalah ' + persona + '. Dalam debat tentang "' + topic + '", Anda berada di posisi MENDUKUNG ide ini. ';
                    prompt += expertiseBlock;
                    prompt += 'Gunakan data dan fakta di bawah ini untuk memperkuat argumen Anda.\n' + dataContext;
                    prompt += '\nBerikan argumen yang kuat, logis, dan meyakinkan sesuai keahlian Anda. Maksimal 300 kata.';
                    break;
                case 'con':
                    prompt = 'Anda adalah ' + persona + '. Dalam debat tentang "' + topic + '", Anda berada di posisi MENENTANG ide ini. ';
                    prompt += expertiseBlock;
                    prompt += 'Gunakan data dan fakta di bawah ini untuk memperkuat argumen Anda.\n' + dataContext;
                    prompt += '\nBerikan argumen yang kuat, logis, dan meyakinkan sesuai keahlian Anda. Maksimal 300 kata.';
                    break;
                case 'rebuttal':
                    prompt = 'Anda adalah ' + persona + '. Dalam debat tentang "' + topic + '", lawan Anda baru saja mengatakan: "' + (options.opponentArg || '').substring(0, 500) + '". ';
                    prompt += expertiseBlock;
                    prompt += dataContext;
                    prompt += '\nBerikan bantahan Anda untuk ronde ke-' + options.round + '. Bantah poin-poin SPESIFIK lawan (bukan argumen umum) dengan argumen Anda sendiri. Maksimal 250 kata.';
                    break;
                case 'closing':
                    prompt = 'Anda adalah ' + persona + '. Ini adalah closing statement Anda dalam debat tentang "' + topic + '". ';
                    prompt += expertiseBlock;
                    prompt += dataContext;
                    prompt += '\nSimpulkan mengapa posisi Anda lebih kuat. Maksimal 200 kata.';
                    break;
                default:
                    throw new Error('Unknown type: ' + type);
            }
            return prompt;
        }

        // ===== START DEBATE =====
        async startDebate(options) {
            try {
                const topic = this.security.validateTopic(options.topic);
                const agentA = this.security.validateAgent(options.agentA);
                const agentB = this.security.validateAgent(options.agentB);
                const rounds = this.security.validateRounds(options.rounds || 3);
                const model = options.model || this.config.DEFAULT_MODEL;
                const moderatorMode = options.moderator || 'ai';

                if (this.state.status === 'running') {
                    throw new Error('Debat sedang berjalan');
                }
                if (this.state.status === 'finished') {
                    this.state.reset();
                }

                const allData = await this.fetchAllData(topic);
                if (allData.total > 0 && DEB_showToast) {
                    DEB_showToast('' + allData.total + ' data dari World/Memory/Database!', 'info');
                }

                this.state.reset();
                this.state.status = 'running';
                this.state.maxRounds = rounds;
                this.state.topic = topic;
                this.state.agentA = agentA;
                this.state.agentB = agentB;
                this.state.model = model;
                this.state.moderatorMode = moderatorMode;
                this.state.startTime = Date.now();
                this.state.abortController = new AbortController();

                this.updateUI('start');
                this.startTimer();

                const container = document.getElementById('debateLiveContainer');
                if (container) {
                    const liveIndicator = document.createElement('div');
                    liveIndicator.className = 'live-indicator-light';
                    liveIndicator.id = 'liveIndicator';
                    liveIndicator.innerHTML = '<span class="live-dot-light"></span><span>LIVE DEBATE</span><span class="live-timer" id="debateTimerDisplay">00:00</span>';
                    container.prepend(liveIndicator);
                }

                this.addMessage('MODERATOR', 'Debat dimulai! Topik: "' + topic + '" (Data: ' + allData.total + ' item dari World/Memory/Database)');
                if (this.voice.isActive) {
                    DEB_speakText('Debat dimulai! Topik ' + topic);
                }

                const displayA = this.getDisplayName(agentA);
                const displayB = this.getDisplayName(agentB);

                const startA = Date.now();
                this.addMessage('SISTEM', displayA + ' menyiapkan opening statement...');
                const openingA = await this.getAIResponse(agentA, topic, 'pro', model);
                this.analytics.responseTimes.push(Date.now() - startA);
                this.addMessage(displayA, 'OPENING: ' + openingA);
                this.analytics.analyzeArgument(openingA, 'agentA');
                if (this.voice.isActive) {
                    DEB_speakText(openingA, agentA);
                }
                this.updateDashboard();
                if (this.state.status === 'error') {
                    throw new Error('Debat dihentikan');
                }

                const startB = Date.now();
                this.addMessage('SISTEM', displayB + ' menyiapkan opening statement...');
                const openingB = await this.getAIResponse(agentB, topic, 'con', model);
                this.analytics.responseTimes.push(Date.now() - startB);
                this.addMessage(displayB, 'OPENING: ' + openingB);
                this.analytics.analyzeArgument(openingB, 'agentB');
                if (this.voice.isActive) {
                    DEB_speakText(openingB, agentB);
                }
                this.updateDashboard();
                if (this.state.status === 'error') {
                    throw new Error('Debat dihentikan');
                }

                let lastA = openingA;
                let lastB = openingB;

                for (let round = 1; round <= rounds; round++) {
                    if (this.state.status === 'error') {
                        break;
                    }
                    this.state.currentRound = round;
                    this.addMessage('MODERATOR', '--- RONDE ' + round + ' ---');
                    if (this.voice.isActive) {
                        DEB_speakText('Ronde ' + round);
                    }
                    this.updateDashboard();

                    const rtA = Date.now();
                    this.addMessage('SISTEM', displayA + ' menyiapkan bantahan...');
                    const rebutA = await this.getAIResponse(agentA, topic, 'rebuttal', model, { opponentArg: lastB, round: round });
                    this.analytics.responseTimes.push(Date.now() - rtA);
                    this.addMessage(displayA, 'BANTAHAN R' + round + ': ' + rebutA);
                    this.analytics.analyzeArgument(rebutA, 'agentA');
                    if (this.voice.isActive) {
                        DEB_speakText(rebutA, agentA);
                    }
                    this.updateDashboard();
                    if (this.state.status === 'error') {
                        break;
                    }

                    const rtB = Date.now();
                    this.addMessage('SISTEM', displayB + ' menyiapkan bantahan...');
                    const rebutB = await this.getAIResponse(agentB, topic, 'rebuttal', model, { opponentArg: lastA, round: round });
                    this.analytics.responseTimes.push(Date.now() - rtB);
                    this.addMessage(displayB, 'BANTAHAN R' + round + ': ' + rebutB);
                    this.analytics.analyzeArgument(rebutB, 'agentB');
                    if (this.voice.isActive) {
                        DEB_speakText(rebutB, agentB);
                    }
                    this.updateDashboard();

                    lastA = rebutA;
                    lastB = rebutB;
                    this.updateAnalyticsScores();
                    if (this.onRoundComplete) {
                        this.onRoundComplete(round, { rebuttalA: rebutA, rebuttalB: rebutB });
                    }
                }

                if (this.state.status === 'error') {
                    throw new Error('Debat dihentikan');
                }

                const ctA = Date.now();
                this.addMessage('SISTEM', displayA + ' menyiapkan closing statement...');
                const closingA = await this.getAIResponse(agentA, topic, 'closing', model);
                this.analytics.responseTimes.push(Date.now() - ctA);
                this.addMessage(displayA, 'CLOSING: ' + closingA);
                if (this.voice.isActive) {
                    DEB_speakText(closingA, agentA);
                }
                this.updateDashboard();

                const ctB = Date.now();
                this.addMessage('SISTEM', displayB + ' menyiapkan closing statement...');
                const closingB = await this.getAIResponse(agentB, topic, 'closing', model);
                this.analytics.responseTimes.push(Date.now() - ctB);
                this.addMessage(displayB, 'CLOSING: ' + closingB);
                if (this.voice.isActive) {
                    DEB_speakText(closingB, agentB);
                }
                this.updateDashboard();

                this.addMessage('MODERATOR', 'Penjurian dimulai...');
                if (this.voice.isActive) {
                    DEB_speakText('Penjurian dimulai');
                }
                const winner = await this.judge(
                    topic, agentA, agentB,
                    openingA, openingB, lastA, lastB,
                    closingA, closingB,
                    moderatorMode, model
                );

                this.state.status = 'finished';
                this.updateUI('end');
                if (this.state.timerId) {
                    clearInterval(this.state.timerId);
                    this.state.timerId = null;
                }

                const debateData = {
                    topic: topic,
                    agentA: displayA,
                    agentB: displayB,
                    rounds: rounds,
                    winner: winner.winner,
                    reason: winner.reason,
                    scoreA: winner.scoreA,
                    scoreB: winner.scoreB,
                    history: this.state.history.slice(-30),
                    analytics: this.analytics.getStats(),
                    model: model,
                    duration: Math.floor((Date.now() - this.state.startTime) / 1000),
                    staticDataUsed: this.state.staticData.length,
                    memoryDataUsed: this.state.memoryData.length,
                    dbDataUsed: this.state.dbData.length,
                    totalDataUsed: this.state.context?.totalSources?.total || 0
                };
                this.history.save(debateData);
                this.showResult(winner, displayA, displayB);

                const liveInd = document.getElementById('liveIndicator');
                if (liveInd) {
                    liveInd.remove();
                }

                if (this.voice.isActive) {
                    DEB_speakText('Pemenangnya adalah ' + winner.winner);
                }
                if (DEB_showToast) {
                    DEB_showToast('Pemenang debat: ' + winner.winner + ' (Data: ' + debateData.totalDataUsed + ' dari World/Memory/Database)', 'success');
                }
                if (this.onDebateEnd) {
                    this.onDebateEnd(winner);
                }
                return winner;

            } catch (e) {
                if (e.message === 'Debat dihentikan') {
                    this.state.status = 'idle';
                    this.addMessage('FORUM', 'Debat dihentikan oleh user.');
                    if (DEB_showToast) {
                        DEB_showToast('Debat dihentikan', 'warn');
                    }
                } else {
                    this.state.status = 'error';
                    this.addMessage('ERROR', 'Debat gagal: ' + e.message);
                    if (DEB_showToast) {
                        DEB_showToast('Error: ' + e.message, 'error');
                    }
                }
                throw e;
            } finally {
                if (this.state.status === 'running') {
                    this.state.status = 'idle';
                }
                this.updateUI('idle');
                const liveInd = document.getElementById('liveIndicator');
                if (liveInd) {
                    liveInd.remove();
                }
            }
        }

        // ===== AI RESPONSE =====
        async getAIResponse(agent, topic, type, model, options) {
            options = options || {};
            const prompt = this.buildPromptWithData(agent, topic, type, options);
            try {
                const response = await this.callAI(prompt, model);
                return response || 'Maaf, saya ' + agent + ' tidak bisa memberikan argumen saat ini.';
            } catch (_) {
                return 'Maaf, saya ' + agent + ' tidak bisa memberikan argumen saat ini.';
            }
        }

        // ===== CALL AI =====
        async callAI(prompt, model) {
            model = model || DEB_CONFIG.DEFAULT_MODEL;
            try {
                const apiKey = window.CONFIG?.API_KEYS?.openrouter;
                if (!apiKey) {
                    throw new Error('No API key available');
                }
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model === 'deepseek' ? 'deepseek/deepseek-chat' : model,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: this.config.MAX_TOKENS,
                        // Jitter kecil di atas TEMPERATURE dasar (bukan diganti,
                        // cuma ditambah variasi acak 0-0.15) — mencegah gaya
                        // argumen terasa monoton/template persis sama tiap
                        // pertandingan, tanpa mengorbankan koherensi jawaban.
                        temperature: Math.min(1, this.config.TEMPERATURE + Math.random() * 0.15)
                    }),
                    signal: this.state.abortController?.signal
                });
                if (!response.ok) {
                    throw new Error('API Error: ' + response.status);
                }
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                return data.choices?.[0]?.message?.content || '';
            } catch (e) {
                if (e.name === 'AbortError') {
                    throw new Error('Debat dihentikan');
                }
                throw e;
            }
        }

        // ===== JUDGE =====
        async judge(topic, agentA, agentB, openingA, openingB, rebuttalA, rebuttalB, closingA, closingB, mode, model) {
            let dataContext = '';
            if (this.state.context && this.state.context.combined && this.state.context.combined.length > 0) {
                dataContext += 'DATA DARI WORLD/MEMORY/DATABASE:\n';
                this.state.context.combined.slice(0, 3).forEach(function(item, i) {
                    const source = item._source || 'unknown';
                    let sourceLabel = 'Sumber';
                    if (source === 'static') sourceLabel = 'World';
                    else if (source === 'memory') sourceLabel = 'Memory';
                    else if (source === 'database') sourceLabel = 'Database';
                    dataContext += (i + 1) + '. [' + sourceLabel + '] ' + (item.text || '').substring(0, 150) + '...\n';
                });
            }

            if (mode === 'user') {
                return new Promise(function(resolve) {
                    this.showUserJudging(agentA, agentB, resolve);
                }.bind(this));
            }

            let prompt = 'Anda adalah juri debat profesional. Nilai debat antara ' + agentA + ' dan ' + agentB + ' tentang "' + topic + '".\n';
            prompt += 'OPENING ' + agentA + ': ' + openingA.substring(0, 300) + '\n';
            prompt += 'OPENING ' + agentB + ': ' + openingB.substring(0, 300) + '\n';
            prompt += 'REBUTTAL ' + agentA + ': ' + rebuttalA.substring(0, 300) + '\n';
            prompt += 'REBUTTAL ' + agentB + ': ' + rebuttalB.substring(0, 300) + '\n';
            prompt += 'CLOSING ' + agentA + ': ' + closingA.substring(0, 300) + '\n';
            prompt += 'CLOSING ' + agentB + ': ' + closingB.substring(0, 300) + '\n';
            prompt += dataContext;
            prompt += '\nBerdasarkan argumen, logika, dan kekuatan bukti, tentukan pemenangnya.\n';
            prompt += 'Output dalam format JSON: { winner: "nama pemenang", reason: "alasan singkat", scoreA: 0-100, scoreB: 0-100 }';
            try {
                const result = await this.callAI(prompt, model);
                const parsed = this.parseJSON(result);
                return {
                    winner: parsed.winner || this.getDisplayName(agentA),
                    reason: parsed.reason || "Berdasarkan penilaian AI",
                    scoreA: parsed.scoreA || 50,
                    scoreB: parsed.scoreB || 50
                };
            } catch(_) {
                return {
                    winner: this.getDisplayName(agentA),
                    reason: "Penilaian default",
                    scoreA: 50,
                    scoreB: 50
                };
            }
        }

        // ===== UI METHODS =====
        addMessage(sender, message) {
            const container = document.getElementById('debateLiveContainer');
            if (!container) {
                return;
            }
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            div.style.padding = '10px 14px';
            div.style.borderRadius = '10px';
            div.style.animation = 'fadeIn 0.4s ease';
            div.style.borderLeft = '3px solid #00FFA3';
            div.style.background = 'rgba(0,255,163,0.03)';
            const safeSender = this.security.sanitizeHTML(sender);
            const safeMessage = this.security.sanitizeHTML(this.security.stripMarkdown(message));
            let color = '#00FFA3';
            if (sender.includes('Agent A') || sender.includes('Rahmad')) {
                color = '#00FFA3';
            } else if (sender.includes('Agent B') || sender.includes('Manager')) {
                color = '#FF6B6B';
            } else if (sender.includes('MODERATOR')) {
                color = '#FFD700';
            } else if (sender.includes('SISTEM')) {
                color = '#A0B3C9';
            }
            div.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;"><strong style="color:' + color + ';">' + safeSender + '</strong><span style="font-size:9px; color:rgba(255,255,255,0.2);">' + time + '</span></div><div style="font-size:13px; line-height:1.5;">' + safeMessage + '</div>';
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
            this.state.history.push({ sender: sender, message: message, time: time });
            if (this.onMessage) {
                this.onMessage(sender, message, time);
            }
        }

        showResult(winner, displayA, displayB) {
            const container = document.getElementById('debateResult');
            if (!container) {
                return;
            }
            const dataCount = this.state.context?.totalSources?.total || 0;
            container.innerHTML = '<div style="text-align:center; padding:24px; background:linear-gradient(135deg, rgba(0,255,163,0.08), rgba(0,212,255,0.03)); border-radius:16px; border:1px solid rgba(0,255,163,0.15); animation: pulse 2s infinite;"><div style="font-size:48px; margin-bottom:4px;"></div><div style="font-size:24px; color:#00FFA3; font-weight:bold;">' + this.security.sanitizeHTML(winner.winner) + '</div><div style="color:#A0B3C9; font-size:13px; max-width:500px; margin:8px auto;">' + this.security.sanitizeHTML(this.security.stripMarkdown(winner.reason)) + '</div><div style="margin-top:16px; display:flex; justify-content:center; gap:60px; flex-wrap:wrap;"><div style="text-align:center;"><div style="font-size:12px; color:#888;">' + this.security.sanitizeHTML(displayA) + '</div><div style="font-size:28px; color:#00FFA3; font-weight:bold;">' + winner.scoreA + '</div></div><div style="text-align:center;"><div style="font-size:12px; color:#888;">' + this.security.sanitizeHTML(displayB) + '</div><div style="font-size:28px; color:#FF6B6B; font-weight:bold;">' + winner.scoreB + '</div></div></div>' + (dataCount > 0 ? '<div style="margin-top:8px; font-size:10px; color:#666;">' + dataCount + ' data dari World/Memory/Database</div>' : '') + (this.state.history.length ? '<div style="margin-top:12px; font-size:11px; color:#666;">' + this.state.history.length + ' pesan dalam debat</div>' : '') + '</div>';
        }

        showUserJudging(agentA, agentB, resolve) {
            const container = document.getElementById('debateResult');
            if (!container) {
                resolve({ winner: this.getDisplayName(agentA), reason: "Default", scoreA: 50, scoreB: 50 });
                return;
            }
            container.innerHTML += '<div style="margin-top:20px; padding:20px; background:rgba(0,255,163,0.08); border-radius:16px; border:1px solid rgba(0,255,163,0.15);"><div style="font-weight:bold; margin-bottom:16px; font-size:18px; text-align:center;">Anda adalah Juri!</div><div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:16px; justify-content:center;"><button id="voteA" style="flex:1; min-width:150px; padding:12px 20px; border-radius:12px; border:2px solid #00FFA3; background:rgba(0,255,163,0.1); color:#00FFA3; cursor:pointer; transition:all 0.3s;">Pilih ' + this.security.sanitizeHTML(this.getDisplayName(agentA)) + '</button><button id="voteB" style="flex:1; min-width:150px; padding:12px 20px; border-radius:12px; border:2px solid #FF6B6B; background:rgba(255,107,107,0.1); color:#FF6B6B; cursor:pointer; transition:all 0.3s;">Pilih ' + this.security.sanitizeHTML(this.getDisplayName(agentB)) + '</button></div><textarea id="juryReason" placeholder="Tuliskan alasan Anda memilih..." style="width:100%; padding:12px; border-radius:10px; border:1px solid rgba(0,255,163,0.1); background:rgba(0,0,0,0.2); color:#fff; min-height:50px; font-size:13px;"></textarea></div>';
            const voteA = document.getElementById('voteA');
            const voteB = document.getElementById('voteB');
            if (voteA) {
                voteA.addEventListener('click', function() {
                    const reason = document.getElementById('juryReason')?.value || "User memilih berdasarkan penilaian pribadi";
                    if (DEB_showToast) {
                        DEB_showToast('Anda memilih ' + this.getDisplayName(agentA), 'success');
                    }
                    resolve({ winner: this.getDisplayName(agentA), reason: reason, scoreA: 100, scoreB: 0 });
                }.bind(this));
            }
            if (voteB) {
                voteB.addEventListener('click', function() {
                    const reason = document.getElementById('juryReason')?.value || "User memilih berdasarkan penilaian pribadi";
                    if (DEB_showToast) {
                        DEB_showToast('Anda memilih ' + this.getDisplayName(agentB), 'success');
                    }
                    resolve({ winner: this.getDisplayName(agentB), reason: reason, scoreA: 0, scoreB: 100 });
                }.bind(this));
            }
        }

        updateUI(status) {
            const startBtn = document.getElementById('startDebateBtn');
            const stopBtn = document.getElementById('stopDebateBtn');
            const voiceBtn = document.getElementById('voiceDebatToggle');
            const inputs = document.querySelectorAll('#debateTopic, #debateRounds, #debateModerator, #debateModel');
            if (startBtn) {
                startBtn.style.display = (status === 'running' || status === 'error') ? 'none' : 'inline-block';
                startBtn.disabled = (status === 'running');
            }
            if (stopBtn) {
                stopBtn.style.display = (status === 'running') ? 'inline-block' : 'none';
            }
            if (voiceBtn) {
                voiceBtn.disabled = (status === 'running');
            }
            inputs.forEach(function(el) {
                if (el) {
                    el.disabled = (status === 'running');
                }
            });

            const progress = document.getElementById('debateProgress');
            if (progress) {
                if (status === 'running') {
                    progress.style.display = 'block';
                    const percent = this.state.maxRounds ? Math.round((this.state.currentRound / this.state.maxRounds) * 100) : 0;
                    progress.innerHTML = '<div style="display:flex; justify-content:space-between; font-size:11px; color:#888; margin-bottom:4px;"><span>Debat berjalan...</span><span>' + this.state.currentRound + '/' + this.state.maxRounds + ' ronde</span></div><div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;"><div style="width:' + percent + '%; height:100%; background:linear-gradient(90deg, #00FFA3, #00D4FF); border-radius:4px; transition:width 0.5s;"></div></div>';
                } else {
                    progress.style.display = 'none';
                }
            }
        }

        updateAnalyticsScores() {
            const sA = this.analytics.getAverageSentiment('agentA');
            const sB = this.analytics.getAverageSentiment('agentB');
            const wA = this.analytics.getAverageWordCount('agentA');
            const wB = this.analytics.getAverageWordCount('agentB');
            this.analytics.updateScore('agentA', 'logic', Math.max(0, Math.min(100, 50 + sA * 10)));
            this.analytics.updateScore('agentB', 'logic', Math.max(0, Math.min(100, 50 + sB * 10)));
            const maxW = Math.max(wA, wB, 1);
            this.analytics.updateScore('agentA', 'evidence', Math.min(100, Math.round((wA / maxW) * 100)));
            this.analytics.updateScore('agentB', 'evidence', Math.min(100, Math.round((wB / maxW) * 100)));
            this.analytics.updateScore('agentA', 'rhetoric', Math.round((this.analytics.scores.agentA.logic + this.analytics.scores.agentA.evidence) / 2));
            this.analytics.updateScore('agentB', 'rhetoric', Math.round((this.analytics.scores.agentB.logic + this.analytics.scores.agentB.evidence) / 2));
            this.updateDashboard();
        }

        autoSave() {
            if (this.state.history.length) {
                this.history.save({
                    topic: this.state.topic || 'Unknown',
                    agentA: this.state.agentA || 'Unknown',
                    agentB: this.state.agentB || 'Unknown',
                    rounds: this.state.currentRound,
                    history: this.state.history.slice(-10),
                    timestamp: new Date().toISOString()
                });
                this.state.lastSave = Date.now();
            }
        }

        getDisplayName(agent) {
            const profile = DEB_getAgentProfile(agent);
            return (profile.emoji ? profile.emoji + ' ' : '') + profile.name;
        }

        parseJSON(str) {
            try {
                let cleaned = str.replace(/```json/gi, "").replace(/```/g, "").trim();
                const first = cleaned.indexOf("{");
                const last = cleaned.lastIndexOf("}");
                if (first !== -1 && last !== -1) {
                    cleaned = cleaned.slice(first, last + 1);
                }
                return JSON.parse(cleaned);
            } catch(_) {
                return {};
            }
        }

        abort() {
            if (this.state.abortController) {
                this.state.abortController.abort();
                this.state.abortController = null;
            }
            this.state.status = 'error';
            this.addMessage('FORUM', 'Debat dihentikan oleh user.');
            this.updateUI('idle');
            if (this.voice.isActive) {
                this.voice.stopSpeaking();
                this.voice.stopListening();
            }
            if (DEB_showToast) {
                DEB_showToast('Debat dihentikan', 'warn');
            }
            const live = document.getElementById('liveIndicator');
            if (live) {
                live.remove();
            }
        }

        getState() {
            return {
                status: this.state.status,
                currentRound: this.state.currentRound,
                maxRounds: this.state.maxRounds,
                topic: this.state.topic,
                agentA: this.state.agentA,
                agentB: this.state.agentB,
                historyCount: this.state.history.length,
                isVoiceActive: this.voice.isActive,
                analytics: this.analytics.getStats(),
                duration: this.state.startTime ? Math.floor((Date.now() - this.state.startTime) / 1000) : 0,
                dataCount: this.state.context?.totalSources?.total || 0
            };
        }

        async exportResult(format) {
            format = format || 'pdf';
            if (!this.state.history.length) {
                if (DEB_showToast) {
                    DEB_showToast('Tidak ada hasil debat untuk di-export', 'warn');
                }
                return false;
            }
            const data = {
                topic: this.state.topic || 'Unknown',
                agentA: this.getDisplayName(this.state.agentA),
                agentB: this.getDisplayName(this.state.agentB),
                rounds: this.state.currentRound,
                history: this.state.history,
                analytics: this.analytics.getStats(),
                winner: document.querySelector('#debateResult .winner-name')?.textContent || 'Unknown',
                scoreA: this.analytics.getScore('agentA'),
                scoreB: this.analytics.getScore('agentB'),
                reason: document.querySelector('#debateResult .winner-reason')?.textContent || 'No reason',
                totalDataUsed: this.state.context?.totalSources?.total || 0
            };
            try {
                if (format === 'pdf') {
                    await this.exporter.exportToPDF(data);
                } else if (format === 'json') {
                    this.exporter.exportToJSON(data);
                } else if (format === 'text') {
                    this.exporter.exportToText(data);
                }
                if (DEB_showToast) {
                    DEB_showToast('Berhasil export ' + format.toUpperCase(), 'success');
                }
                return true;
            } catch(_) {
                if (DEB_showToast) {
                    DEB_showToast('Gagal export', 'error');
                }
                return false;
            }
        }
    }

    // ============================================================
    // 15. UI UPGRADE
    // ============================================================

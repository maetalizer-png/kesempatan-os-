
import { TRN_showToast, TRN_getAgentProfile, TRN_getAgentLabel } from './tor-config.js';
import { TRN_fetchStaticData, TRN_fetchFromVectorMemory, TRN_fetchFromDatabase } from './tor-data-engine.js';
import {
    TRN_DebateState, TRN_SecureConfig, TRN_VoiceManager, TRN_DebateAnalytics,
    TRN_DebateHistory, TRN_DebateExporter, TRN_SecurityManager, TRN_getAgentVoiceOptions
} from './tor-classes.js';

    export class TRN_DebateArena {
        constructor() {
            this.state = new TRN_DebateState();
            this.config = new TRN_SecureConfig();
            this.voice = new TRN_VoiceManager();
            this.analytics = new TRN_DebateAnalytics();
            this.history = new TRN_DebateHistory();
            this.exporter = TRN_DebateExporter;
            this.security = TRN_SecurityManager;

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

        
        async fetchAllData(topic) {
            const staticData = TRN_fetchStaticData(topic);
            const memoryData = await TRN_fetchFromVectorMemory(topic, 3);
            const dbData = await TRN_fetchFromDatabase(topic, 3);

            
            
            let obsContext = { marketInsight: '', credibilityNote: '' };
            try {
                if (window.KESEMPATAN?.Observation && typeof window.KESEMPATAN?.Observation.getSignals === 'function' && typeof window.KESEMPATAN?.Observation.generateAIInsight === 'function') {
                    const signals = window.KESEMPATAN?.Observation.getSignals();
                    if (signals && signals.length > 0) {
                        const insight = window.KESEMPATAN?.Observation.generateAIInsight(signals);
                        obsContext.marketInsight = (insight && insight.summary) ? insight.summary.replace(/<[^>]+>/g, '') : '';
                    }
                }
            } catch (e) { console.warn('[TorTournamentArena] Observation insight lookup failed:', e.message); }
            try {
                if (window.NoisePage && typeof window.NoisePage.checkText === 'function' && topic) {
                    const check = window.NoisePage.checkText(topic);
                    if (check && check.blocked) {
                        obsContext.credibilityNote = 'Topik mengandung kata yang perlu diverifikasi: ' + check.reason;
                    }
                }
            } catch (e) { console.warn('[TorTournamentArena] NoisePage credibility check failed:', e.message); }
            
            this.state.staticData = staticData;
            this.state.memoryData = memoryData;
            this.state.dbData = dbData;
            this.state.obsContext = obsContext;
            
            return {
                static: staticData,
                memory: memoryData,
                database: dbData,
                observation: obsContext,
                total: staticData.length + memoryData.length + dbData.length
            };
        }

        
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

        
        buildPromptWithData(agent, topic, type, options) {
            options = options || {};
            let prompt = '';
            let dataContext = '';
            
            if (this.state.staticData && this.state.staticData.length > 0) {
                dataContext += '\nDATA & FAKTA DARI WORLD:\n';
                this.state.staticData.slice(0, 3).forEach(function(item, i) {
                    dataContext += (i + 1) + '. ' + (item.text || '').substring(0, 200) + '...\n';
                });
            }
            
            if (this.state.memoryData && this.state.memoryData.length > 0) {
                dataContext += '\nINSPIRASI DARI MEMORY:\n';
                this.state.memoryData.slice(0, 2).forEach(function(item, i) {
                    dataContext += (i + 1) + '. ' + (item.text || '').substring(0, 200) + '...\n';
                });
            }
            
            if (this.state.dbData && this.state.dbData.length > 0) {
                dataContext += '\nDATA DARI DATABASE:\n';
                this.state.dbData.slice(0, 2).forEach(function(item, i) {
                    const summary = item.summary || item.insight || '';
                    dataContext += (i + 1) + '. ' + summary.substring(0, 200) + '...\n';
                });
            }

            if (this.state.obsContext && this.state.obsContext.marketInsight) {
                dataContext += '\nSENTIMEN PASAR/BERITA TERKINI:\n' + this.state.obsContext.marketInsight + '\n';
            }
            if (this.state.obsContext && this.state.obsContext.credibilityNote) {
                dataContext += '\n' + this.state.obsContext.credibilityNote + '\n';
            }

            const profile = TRN_getAgentProfile(agent);
            const persona = profile.name + (profile.role ? ', seorang ' + profile.role : '');
            const expertiseBlock = profile.systemPrompt
                ? '\nPROFIL & KEAHLIAN ANDA:\n' + profile.systemPrompt + '\n(CATATAN: instruksi "Output dalam format JSON" di profil di atas TIDAK berlaku di pertandingan ini — tetap terapkan cara berpikir & ketajaman analisisnya, tapi jawab sebagai ARGUMEN natural sesuai instruksi di bawah, bukan JSON.)\n'
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
                if (allData.total > 0 && TRN_showToast) {
                    TRN_showToast('' + allData.total + ' data dari World/Memory/Database!', 'info');
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

                const container = document.getElementById('tournamentContainer');
                if (container) {
                    const liveIndicator = document.createElement('div');
                    liveIndicator.className = 'live-indicator-light';
                    liveIndicator.id = 'liveIndicator';
                    liveIndicator.innerHTML = '<span class="live-dot-light"></span><span>LIVE DEBATE</span><span class="live-timer" id="debateTimerDisplay">00:00</span>';
                    container.prepend(liveIndicator);
                }

                this.addMessage('MODERATOR', 'Debat dimulai! Topik: "' + topic + '" (Data: ' + allData.total + ' item dari World/Memory/Database)');
                if (this.voice.isActive) {
                    await this.voice.speak('Debat dimulai! Topik ' + topic);
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
                    await this.voice.speak(openingA, TRN_getAgentVoiceOptions(agentA));
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
                    await this.voice.speak(openingB, TRN_getAgentVoiceOptions(agentB));
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
                        await this.voice.speak('Ronde ' + round);
                    }
                    this.updateDashboard();

                    const rtA = Date.now();
                    this.addMessage('SISTEM', displayA + ' menyiapkan bantahan...');
                    const rebutA = await this.getAIResponse(agentA, topic, 'rebuttal', model, { opponentArg: lastB, round: round });
                    this.analytics.responseTimes.push(Date.now() - rtA);
                    this.addMessage(displayA, 'BANTAHAN R' + round + ': ' + rebutA);
                    this.analytics.analyzeArgument(rebutA, 'agentA');
                    if (this.voice.isActive) {
                        await this.voice.speak(rebutA, TRN_getAgentVoiceOptions(agentA));
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
                        await this.voice.speak(rebutB, TRN_getAgentVoiceOptions(agentB));
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
                    await this.voice.speak(closingA, TRN_getAgentVoiceOptions(agentA));
                }
                this.updateDashboard();

                const ctB = Date.now();
                this.addMessage('SISTEM', displayB + ' menyiapkan closing statement...');
                const closingB = await this.getAIResponse(agentB, topic, 'closing', model);
                this.analytics.responseTimes.push(Date.now() - ctB);
                this.addMessage(displayB, 'CLOSING: ' + closingB);
                if (this.voice.isActive) {
                    await this.voice.speak(closingB, TRN_getAgentVoiceOptions(agentB));
                }
                this.updateDashboard();

                this.addMessage('MODERATOR', 'Penjurian dimulai...');
                if (this.voice.isActive) {
                    await this.voice.speak('Penjurian dimulai');
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
                    dbDataUsed: this.state.dbData.length
                };
                this.history.save(debateData);
                this.showResult(winner, displayA, displayB);

                const liveInd = document.getElementById('liveIndicator');
                if (liveInd) {
                    liveInd.remove();
                }

                if (this.voice.isActive) {
                    await this.voice.speak('Pemenangnya adalah ' + winner.winner);
                }
                if (TRN_showToast) {
                    TRN_showToast('Pemenang debat: ' + winner.winner + ' (Data: ' + debateData.staticDataUsed + ' dari World)', 'success');
                }
                if (this.onDebateEnd) {
                    this.onDebateEnd(winner);
                }
                return winner;

            } catch (e) {
                if (e.message === 'Debat dihentikan') {
                    this.state.status = 'idle';
                    this.addMessage('FORUM', 'Debat dihentikan oleh user.');
                    if (TRN_showToast) {
                        TRN_showToast('Debat dihentikan', 'warn');
                    }
                } else {
                    this.state.status = 'error';
                    this.addMessage('ERROR', 'Debat gagal: ' + e.message);
                    if (TRN_showToast) {
                        TRN_showToast('Error: ' + e.message, 'error');
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

        
        async getAIResponse(agent, topic, type, model, options) {
            options = options || {};
            const prompt = this.buildPromptWithData(agent, topic, type, options);
            try {
                const response = await this.callAI(prompt, model);
                return response || 'Maaf, saya ' + agent + ' tidak bisa memberikan argumen saat ini.';
            } catch (e) {
                return 'Maaf, saya ' + agent + ' tidak bisa memberikan argumen saat ini.';
            }
        }

        
        async callAI(prompt, model) {
            model = model || 'deepseek';
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

        
        async judge(topic, agentA, agentB, openingA, openingB, rebuttalA, rebuttalB, closingA, closingB, mode, model) {
            let dataContext = '';
            if (this.state.staticData && this.state.staticData.length > 0) {
                dataContext += 'DATA DARI WORLD:\n';
                this.state.staticData.slice(0, 3).forEach(function(item, i) {
                    dataContext += (i + 1) + '. ' + (item.text || '').substring(0, 150) + '...\n';
                });
            }

            if (mode === 'user') {
                return new Promise(function(resolve) {
                    this.showUserJudging(agentA, agentB, resolve);
                }.bind(this));
            } else {
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
                } catch(e) {
                    return {
                        winner: this.getDisplayName(agentA),
                        reason: "Penilaian default",
                        scoreA: 50,
                        scoreB: 50
                    };
                }
            }
        }

        
        addMessage(sender, message) {
            const container = document.getElementById('tournamentContainer');
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
            const container = document.getElementById('tournamentChampion');
            if (!container) {
                return;
            }
            const dataCount = this.state.staticData.length + this.state.memoryData.length + this.state.dbData.length;
            container.innerHTML = '<div style="text-align:center; padding:24px; background:linear-gradient(135deg, rgba(0,255,163,0.08), rgba(0,212,255,0.03)); border-radius:16px; border:1px solid rgba(0,255,163,0.15); animation: pulse 2s infinite;"><div style="font-size:48px; margin-bottom:4px;"></div><div style="font-size:24px; color:#00FFA3; font-weight:bold;">' + this.security.sanitizeHTML(winner.winner) + '</div><div style="color:#A0B3C9; font-size:13px; max-width:500px; margin:8px auto;">' + this.security.sanitizeHTML(this.security.stripMarkdown(winner.reason)) + '</div><div style="margin-top:16px; display:flex; justify-content:center; gap:60px; flex-wrap:wrap;"><div style="text-align:center;"><div style="font-size:12px; color:#888;">' + this.security.sanitizeHTML(displayA) + '</div><div style="font-size:28px; color:#00FFA3; font-weight:bold;">' + winner.scoreA + '</div></div><div style="text-align:center;"><div style="font-size:12px; color:#888;">' + this.security.sanitizeHTML(displayB) + '</div><div style="font-size:28px; color:#FF6B6B; font-weight:bold;">' + winner.scoreB + '</div></div></div>' + (dataCount > 0 ? '<div style="margin-top:8px; font-size:10px; color:#666;">' + dataCount + ' data dari World/Memory/Database</div>' : '') + (this.state.history.length ? '<div style="margin-top:12px; font-size:11px; color:#666;">' + this.state.history.length + ' pesan dalam debat</div>' : '') + '</div>';
        }

        showUserJudging(agentA, agentB, resolve) {
            const container = document.getElementById('tournamentChampion');
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
                    if (TRN_showToast) {
                        TRN_showToast('Anda memilih ' + this.getDisplayName(agentA), 'success');
                    }
                    resolve({ winner: this.getDisplayName(agentA), reason: reason, scoreA: 100, scoreB: 0 });
                }.bind(this));
            }
            if (voteB) {
                voteB.addEventListener('click', function() {
                    const reason = document.getElementById('juryReason')?.value || "User memilih berdasarkan penilaian pribadi";
                    if (TRN_showToast) {
                        TRN_showToast('Anda memilih ' + this.getDisplayName(agentB), 'success');
                    }
                    resolve({ winner: this.getDisplayName(agentB), reason: reason, scoreA: 0, scoreB: 100 });
                }.bind(this));
            }
        }

        updateUI(status) {
            const startBtn = document.getElementById('startTournamentBtn');
            const inputs = document.querySelectorAll('#tournamentTopic, #tournamentFormat, #tournamentMode');
            if (startBtn) {
                startBtn.disabled = (status === 'running');
                startBtn.textContent = (status === 'running') ? 'Turnamen berjalan...' : 'MULAI TURNAMEN';
            }
            inputs.forEach(function(el) {
                if (el) {
                    el.disabled = (status === 'running');
                }
            });

            const progress = document.getElementById('tournamentProgress');
            if (progress) {
                if (status === 'running') {
                    progress.style.display = 'block';
                    const percent = this.state.maxRounds ? Math.round((this.state.currentRound / this.state.maxRounds) * 100) : 0;
                    progress.innerHTML = '<div style="display:flex; justify-content:space-between; font-size:11px; color:#888; margin-bottom:4px;"><span>Pertandingan berjalan...</span><span>' + this.state.currentRound + '/' + this.state.maxRounds + ' ronde</span></div><div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;"><div style="width:' + percent + '%; height:100%; background:linear-gradient(90deg, #00FFA3, #00D4FF); border-radius:4px; transition:width 0.5s;"></div></div>';
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
            return TRN_getAgentLabel(agent);
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
            } catch(e) {
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
            if (TRN_showToast) {
                TRN_showToast('Debat dihentikan', 'warn');
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
                dataCount: this.state.staticData.length + this.state.memoryData.length + this.state.dbData.length
            };
        }

        async exportResult(format) {
            format = format || 'pdf';
            if (!this.state.history.length) {
                if (TRN_showToast) {
                    TRN_showToast('Tidak ada hasil debat untuk di-export', 'warn');
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
                winner: document.querySelector('#tournamentChampion .winner-name')?.textContent || 'Unknown',
                scoreA: this.analytics.getScore('agentA'),
                scoreB: this.analytics.getScore('agentB'),
                reason: document.querySelector('#tournamentChampion .winner-reason')?.textContent || 'No reason',
                staticDataUsed: this.state.staticData.length,
                memoryDataUsed: this.state.memoryData.length,
                dbDataUsed: this.state.dbData.length
            };
            try {
                if (format === 'pdf') {
                    await this.exporter.exportToPDF(data);
                } else if (format === 'json') {
                    this.exporter.exportToJSON(data);
                } else if (format === 'text') {
                    this.exporter.exportToText(data);
                }
                if (TRN_showToast) {
                    TRN_showToast('Berhasil export ' + format.toUpperCase(), 'success');
                }
                return true;
            } catch(e) {
                if (TRN_showToast) {
                    TRN_showToast('Gagal export: ' + e.message, 'error');
                }
                return false;
            }
        }
    }

    
    
    

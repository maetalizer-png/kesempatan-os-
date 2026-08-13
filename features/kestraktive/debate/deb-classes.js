
import { DEB_CONFIG } from './deb-config.js';
import { DEB_State } from './deb-state.js';

import { DEB_speakText, DEB_stopAllSpeech } from './deb-voice-engine.js';
import { DEB_saveDebateToMemory } from './deb-data-engine.js';

    export class DEB_SecureConfig {
        constructor() {
            this.API_PROXY = '/api/ai/debate';
            this.STORAGE_KEY = DEB_CONFIG.STORAGE_KEY;
            this.MAX_HISTORY = DEB_CONFIG.MAX_HISTORY;
            this.AUTO_SAVE_INTERVAL = DEB_CONFIG.AUTO_SAVE_INTERVAL;
            this.SUPPORTED_MODELS = DEB_CONFIG.SUPPORTED_MODELS;
            this.DEFAULT_MODEL = DEB_CONFIG.DEFAULT_MODEL;
            this.MAX_TOKENS = DEB_CONFIG.MAX_TOKENS;
            this.TEMPERATURE = DEB_CONFIG.TEMPERATURE;
        }
        getApiKey() {
            return null;
        }
    }

    
    
    
    export class DEB_DebateState {
        constructor() {
            this.status = 'idle';
            this.currentRound = 0;
            this.maxRounds = 3;
            this.topic = '';
            this.agentA = '';
            this.agentB = '';
            this.history = [];
            this.analytics = {
                totalTokens: 0,
                responseTime: [],
                sentimentScores: [],
                argumentLength: []
            };
            this.abortController = null;
            this.timerId = null;
            this.startTime = null;
            this.lastSave = null;
            this.model = DEB_CONFIG.DEFAULT_MODEL;
            this.moderatorMode = 'ai';
            this.staticData = [];
            this.memoryData = [];
            this.dbData = [];
            this.context = null;
        }
        reset() {
            this.status = 'idle';
            this.currentRound = 0;
            this.history = [];
            this.analytics = {
                totalTokens: 0,
                responseTime: [],
                sentimentScores: [],
                argumentLength: []
            };
            this.staticData = [];
            this.memoryData = [];
            this.dbData = [];
            this.context = null;
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
            this.startTime = null;
            this.lastSave = null;
        }
    }

    
    
    
    export class DEB_SecurityManager {
        static sanitizeHTML(str) {
            if (!str) {
                return '';
            }
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
        
        
        
        
        static stripMarkdown(str) {
            if (!str) {
                return '';
            }
            return str
                .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
                .replace(/\*\*(.+?)\*\*/g, '$1')
                .replace(/\*(.+?)\*/g, '$1')
                .replace(/__(.+?)__/g, '$1')
                .replace(/_(.+?)_/g, '$1')
                .replace(/^#{1,6}\s+/gm, '')
                .replace(/`{1,3}([^`]*)`{1,3}/g, '$1');
        }
        static sanitizeInput(str) {
            if (!str) {
                return '';
            }
            return str.replace(/[<>'"&]/g, function(match) {
                const map = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return map[match];
            });
        }
        static validateTopic(topic) {
            if (!topic || topic.trim().length < 3) {
                throw new Error('Topik minimal 3 karakter');
            }
            if (topic.length > 500) {
                throw new Error('Topik maksimal 500 karakter');
            }
            return topic.trim();
        }
        static validateAgent(agent) {
            
            
            
            
            
            if (typeof agent !== 'string' || agent.length === 0 || agent.length > 64) {
                throw new Error('Agent tidak valid: ' + agent);
            }
            if (!/^[A-Za-z0-9_\- ]+$/.test(agent)) {
                throw new Error('Agent tidak valid: ' + agent);
            }
            return agent;
        }
        static validateRounds(rounds) {
            const num = parseInt(rounds);
            if (isNaN(num) || num < 1) {
                return 3;
            }
            if (num > 10) {
                return 10;
            }
            return num;
        }
    }

    
    
    
    export class DEB_DebateAnalytics {
        constructor() {
            this.scores = {
                agentA: { logic: 0, evidence: 0, rhetoric: 0, total: 0 },
                agentB: { logic: 0, evidence: 0, rhetoric: 0, total: 0 }
            };
            this.sentiments = [];
            this.wordCounts = [];
            this.responseTimes = [];
            this.argumentCount = { agentA: 0, agentB: 0 };
        }
        analyzeArgument(text, agent) {
            const words = text.split(/\s+/).length;
            const sentences = text.split(/[.!?]+/).length;
            const positiveWords = ['baik', 'bagus', 'hebat', 'luar biasa', 'unggul', 'berhasil', 'sukses', 'efektif', 'meningkat', 'maju'];
            const negativeWords = ['buruk', 'jelek', 'gagal', 'lemah', 'kurang', 'tidak', 'bukan', 'masalah', 'rugi', 'hancur'];
            let posScore = 0;
            let negScore = 0;
            const lowerText = text.toLowerCase();
            positiveWords.forEach(function(w) {
                if (lowerText.includes(w)) {
                    posScore++;
                }
            });
            negativeWords.forEach(function(w) {
                if (lowerText.includes(w)) {
                    negScore++;
                }
            });
            const sentiment = posScore - negScore;
            this.sentiments.push({ agent: agent, sentiment: sentiment, words: words, sentences: sentences });
            this.wordCounts.push({ agent: agent, count: words });
            const key = agent === 'agentA' ? 'agentA' : 'agentB';
            this.argumentCount[key] = (this.argumentCount[key] || 0) + 1;
            return {
                wordCount: words,
                sentenceCount: sentences,
                avgWordLength: (text.replace(/\s/g, '').length / (words || 1)).toFixed(1),
                sentiment: sentiment,
                readability: (sentences > 0 ? (words / sentences) : 0).toFixed(1)
            };
        }
        getScore(agent) {
            const key = agent === 'agentA' ? 'agentA' : 'agentB';
            const total = this.scores[key].logic + this.scores[key].evidence + this.scores[key].rhetoric;
            return Math.min(100, Math.round(total / 3));
        }
        updateScore(agent, type, value) {
            const key = agent === 'agentA' ? 'agentA' : 'agentB';
            if (this.scores[key][type] !== undefined) {
                this.scores[key][type] = Math.min(100, Math.max(0, value));
            }
        }
        getAverageSentiment(agent) {
            const filtered = this.sentiments.filter(function(s) {
                return s.agent === agent;
            });
            if (!filtered.length) {
                return 0;
            }
            return filtered.reduce(function(a, b) {
                return a + b.sentiment;
            }, 0) / filtered.length;
        }
        getAverageWordCount(agent) {
            const filtered = this.wordCounts.filter(function(w) {
                return w.agent === agent;
            });
            if (!filtered.length) {
                return 0;
            }
            return Math.round(filtered.reduce(function(a, b) {
                return a + b.count;
            }, 0) / filtered.length);
        }
        getStats() {
            return {
                agentA: {
                    arguments: this.argumentCount.agentA || 0,
                    avgSentiment: this.getAverageSentiment('agentA'),
                    avgWords: this.getAverageWordCount('agentA'),
                    score: this.getScore('agentA')
                },
                agentB: {
                    arguments: this.argumentCount.agentB || 0,
                    avgSentiment: this.getAverageSentiment('agentB'),
                    avgWords: this.getAverageWordCount('agentB'),
                    score: this.getScore('agentB')
                },
                totalRounds: this.argumentCount.agentA || 0,
                avgResponseTime: this.responseTimes.length ? Math.round(this.responseTimes.reduce(function(a, b) {
                    return a + b;
                }, 0) / this.responseTimes.length) : 0
            };
        }
    }

    
    
    
    export class DEB_VoiceManager {
        constructor() {
            this.isActive = false;
            this.recognition = null;
            this.synthesis = window.speechSynthesis || null;
            this.voices = [];
            this.currentVoice = null;
            this.isSpeaking = false;
            this.queue = [];
            this.loadVoices();
        }

        loadVoices() {
            if (!this.synthesis) {
                return;
            }
            const self = this;
            const load = function() {
                try {
                    self.voices = self.synthesis.getVoices() || [];
                    self.currentVoice = self.voices.find(function(v) {
                        return v.lang === 'id-ID' || v.lang.startsWith('id');
                    }) || self.voices.find(function(v) {
                        return v.lang === 'en-US';
                    }) || self.voices[0] || null;
                } catch(_) {
                    
                }
            };
            if (this.voices.length === 0) {
                this.synthesis.onvoiceschanged = load;
                setTimeout(load, 1000);
            } else {
                load();
            }
        }

        
        speak(text, options) {
            options = options || {};
            if (!this.isActive || !text || text.length === 0) {
                return Promise.resolve();
            }
            if (!this.synthesis) {
                return Promise.resolve();
            }
            return DEB_speakText(text, options.agentKey);
        }

        startListening(options) {
            options = options || {};
            if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                throw new Error('Browser tidak support voice input');
            }
            if (this.recognition) {
                this.recognition.stop();
                this.recognition = null;
            }
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = options.continuous || false;
            this.recognition.interimResults = options.interimResults || false;
            this.recognition.lang = options.lang || 'id-ID';
            this.recognition.maxAlternatives = options.maxAlternatives || 1;
            const self = this;
            return new Promise(function(resolve, reject) {
                self.recognition.onstart = function() {
                    if (options.onStart) {
                        options.onStart();
                    }
                };
                self.recognition.onend = function() {
                    if (options.onEnd) {
                        options.onEnd();
                    }
                    self.recognition = null;
                };
                self.recognition.onresult = function(e) {
                    const transcript = e.results[0][0].transcript;
                    const confidence = e.results[0][0].confidence;
                    if (options.onResult) {
                        options.onResult(transcript, confidence);
                    }
                    resolve(transcript);
                };
                self.recognition.onerror = function(e) {
                    if (options.onError) {
                        options.onError(e);
                    }
                    reject(e);
                };
                self.recognition.start();
            });
        }

        stopListening() {
            if (this.recognition) {
                try {
                    this.recognition.stop();
                } catch(_) { console.warn('[DebClasses] recognition.stop failed'); }
                this.recognition = null;
            }
        }

        stopSpeaking() {
            DEB_stopAllSpeech();
            this.isSpeaking = false;
        }

        
        toggle() {
            this.isActive = !this.isActive;
            DEB_State.speechEnabled = this.isActive;
            if (!this.isActive) {
                this.stopSpeaking();
                this.stopListening();
            }
            return this.isActive;
        }

        isSupported() {
            return !!(this.synthesis || window.webkitSpeechRecognition || window.SpeechRecognition);
        }
    }

    
    
    
    export class DEB_DebateExporter {
        static async exportToPDF(debateData, filename) {
            filename = filename || 'debate-result.pdf';
            try {
                const { jsPDF } = window.jspdf || {};
                if (!jsPDF) {
                    return this.exportToText(debateData, filename.replace('.pdf', '.txt'));
                }
                const doc = new jsPDF('p', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                let y = 20;
                doc.setFontSize(20);
                doc.setTextColor(0, 200, 0);
                doc.text('DEBATE RESULT', pageWidth / 2, y, { align: 'center' });
                y += 12;
                doc.setTextColor(0);
                doc.setFontSize(12);
                doc.text('Topic: ' + (debateData.topic || 'N/A'), 20, y);
                y += 8;
                doc.text('Date: ' + new Date().toLocaleString(), 20, y);
                y += 8;
                doc.text('Rounds: ' + (debateData.rounds || 0), 20, y);
                y += 12;
                doc.setFontSize(14);
                doc.text((debateData.agentA || 'Agent A') + ' vs ' + (debateData.agentB || 'Agent B'), 20, y);
                y += 10;
                doc.setFontSize(16);
                doc.setTextColor(0, 200, 0);
                doc.text('WINNER: ' + (debateData.winner || 'Unknown'), 20, y);
                y += 10;
                doc.setTextColor(0);
                doc.setFontSize(12);
                doc.text('Score: ' + (debateData.scoreA || 0) + ' vs ' + (debateData.scoreB || 0), 20, y);
                y += 8;
                const reason = debateData.reason || 'No reason provided';
                const splitReason = doc.splitTextToSize('Reason: ' + reason, pageWidth - 40);
                doc.text(splitReason, 20, y);
                y += splitReason.length * 6 + 10;
                if (debateData.history && debateData.history.length) {
                    doc.setFontSize(14);
                    doc.text('Debate History', 20, y);
                    y += 8;
                    doc.setFontSize(9);
                    const limit = Math.min(debateData.history.length, 20);
                    for (let i = 0; i < limit; i++) {
                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                        const entry = debateData.history[i];
                        doc.text((entry.sender || 'Unknown') + ': ' + (entry.message || '').substring(0, 80) + '...', 20, y);
                        y += 5;
                    }
                }
                doc.save(filename);
                return true;
            } catch (_) {
                return this.exportToText(debateData, filename.replace('.pdf', '.txt'));
            }
        }
        static exportToText(debateData, filename) {
            filename = filename || 'debate-result.txt';
            let content = '========================================\n        DEBATE RESULT\n========================================\n\n';
            content += 'Topic: ' + (debateData.topic || 'N/A') + '\nDate: ' + new Date().toLocaleString() + '\nRounds: ' + (debateData.rounds || 0) + '\n\n';
            content += 'Winner: ' + (debateData.winner || 'Unknown') + '\nScore: ' + (debateData.scoreA || 0) + ' vs ' + (debateData.scoreB || 0) + '\nReason: ' + (debateData.reason || 'No reason') + '\n\n';
            content += '----------------------------------------\nDEBATE HISTORY\n----------------------------------------\n\n';
            if (debateData.history) {
                debateData.history.forEach(function(entry) {
                    content += '[' + (entry.time || 'N/A') + '] ' + (entry.sender || 'Unknown') + ': ' + (entry.message || '') + '\n';
                });
            }
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }
        static exportToJSON(debateData) {
            const json = JSON.stringify(debateData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'debate-' + Date.now() + '.json';
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }
    }

    
    
    
    export class DEB_DebateHistory {
        constructor() {
            this.storageKey = DEB_CONFIG.STORAGE_KEY;
            this.maxItems = DEB_CONFIG.MAX_HISTORY;
        }
        save(debateData) {
            try {
                const history = this.loadAll();
                const entry = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...debateData,
                    history: debateData.history ? debateData.history.slice(-20) : []
                };
                history.unshift(entry);
                if (history.length > this.maxItems) {
                    history.length = this.maxItems;
                }
                localStorage.setItem(this.storageKey, JSON.stringify(history));
                DEB_saveDebateToMemory(entry);
                return true;
            } catch (_) {
                return false;
            }
        }
        loadAll() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : [];
            } catch(_) {
                return [];
            }
        }
        load(id) {
            const h = this.loadAll();
            return h.find(function(item) {
                return item.id === id;
            }) || null;
        }
        delete(id) {
            try {
                const h = this.loadAll().filter(function(item) {
                    return item.id !== id;
                });
                localStorage.setItem(this.storageKey, JSON.stringify(h));
                return true;
            } catch(_) {
                return false;
            }
        }
        clear() {
            try {
                localStorage.removeItem(this.storageKey);
                return true;
            } catch(_) {
                return false;
            }
        }
        getCount() {
            return this.loadAll().length;
        }
    }

    
    
    

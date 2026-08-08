(function() {
'use strict';
if (window.__VisualAICore) return;
window.__VisualAICore = true;

const config = window.VisualAIConfig;

const THREE_JS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let THREE = window.THREE || null;
let threeReady = false;
let threeLoadFailed = false;
let threeLoadPromise = null;

function appendThreeScript(resolve) {
    const script = document.createElement('script');
    script.src = THREE_JS_URL;
    script.onload = function() {
        THREE = window.THREE || null;
        threeReady = !!THREE;
        threeLoadFailed = !threeReady;
        resolve(threeReady);
    };
    script.onerror = function() {
        threeReady = false;
        threeLoadFailed = true;
        resolve(false);
    };
    document.head.appendChild(script);
}

function loadThreeJS() {
    if (threeReady) return Promise.resolve(true);
    if (threeLoadPromise) return threeLoadPromise;
    threeLoadPromise = new Promise(function(resolve) {
        if (window.THREE) {
            THREE = window.THREE;
            threeReady = true;
            resolve(true);
            return;
        }
        try {
            if (document.head) {
                appendThreeScript(resolve);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    appendThreeScript(resolve);
                }, { once: true });
            }
        } catch (e) {
            threeReady = false;
            threeLoadFailed = true;
            resolve(false);
        }
    });
    return threeLoadPromise;
}

function speak(text) {
    if (!text || text.length === 0) return;
    if (typeof speechSynthesis === 'undefined') return;
    const speechEnabled = localStorage.getItem('kes_speech_enabled') !== 'false';
    if (!speechEnabled) return;
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 800);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
}

class AIInternal {
    constructor() {
        this.cache = {};
    }

    getApiKey() {
        const input = document.getElementById('apiKeyInput');
        if (input && input.value && input.value.trim().length > 10) return input.value.trim();
        if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) return window.CONFIG.API_KEYS.openrouter;
        return null;
    }

    isOfflineMode() {
        if (window.OfflineMode && typeof window.OfflineMode.isOnline === 'function') {
            return !window.OfflineMode.isOnline();
        }
        return false;
    }

    async callAI(prompt, agent) {
        agent = agent || 'VisualAgent';
        if (this.isOfflineMode()) return this.generateOfflineResponse(prompt);
        const apiKey = this.getApiKey();
        if (!apiKey) return this.generateOfflineResponse(prompt);
        if (window.AIClients && typeof window.AIClients.generateWithFallback === 'function') {
            try {
                const cacheKey = prompt.substring(0, 100) + agent;
                if (this.cache[cacheKey]) return this.cache[cacheKey];
                const result = await window.AIClients.generateWithFallback(prompt, agent);
                if (result && typeof result === 'string') {
                    this.cache[cacheKey] = result;
                    return result;
                }
            } catch (e) {}
        }
        try {
            const cacheKey = prompt.substring(0, 100) + agent;
            if (this.cache[cacheKey]) return this.cache[cacheKey];
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'deepseek/deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 500, temperature: 0.7 })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const result = data.choices[0].message.content;
                this.cache[cacheKey] = result;
                return result;
            }
            return null;
        } catch (error) {
            return this.generateOfflineResponse(prompt);
        }
    }

    generateOfflineResponse(prompt) {
        return '[OFFLINE MODE] AI sedang offline. Silakan sambungkan internet untuk generate agen dari gambar secara real-time.\n\nGunakan agen yang sudah ada di gallery atau sambungkan internet.';
    }

    parseJSON(str) {
        if (!str) return null;
        try {
            let cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
            const first = cleaned.indexOf('{');
            const last = cleaned.lastIndexOf('}');
            if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
            return JSON.parse(cleaned);
        } catch (e) { return null; }
    }

    async detectObjects(imageFile) {
        const canvasFeatures = await this.extractImageFeatures(imageFile);
        const prompt = 'Deteksi objek dalam gambar dengan gaya ' + canvasFeatures.style + '. Output JSON: [{ label, confidence, x, y, width, height }]';
        const aiResult = await this.callAI(prompt);
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed && Array.isArray(parsed)) return parsed;
        }
        return [
            { label: 'Main Object', confidence: 85, x: 20, y: 20, width: 60, height: 60 },
            { label: 'Background', confidence: 70, x: 10, y: 70, width: 80, height: 20 }
        ];
    }

    async generateDescription(features) {
        const prompt = 'Berdasarkan gambar dengan gaya ' + features.style + ' dan suasana ' + features.mood + '. \nBuatkan deskripsi untuk agen AI ini (80 kata). Termasuk: karakter, keahlian, dan rekomendasi penggunaan.';
        const aiResult = await this.callAI(prompt);
        return aiResult || 'Agen AI dengan gaya ' + features.style + ' dan suasana ' + features.mood + '. Cocok untuk analisis kreatif.';
    }

    async analyzeImage(imageFile) {
        const canvasFeatures = await this.extractImageFeatures(imageFile);
        const prompt = 'Analisis gambar: gaya ' + canvasFeatures.style + ', suasana ' + canvasFeatures.mood + '. Output JSON: { character, potential, speakingStyle }';
        const aiResult = await this.callAI(prompt);
        let aiAnalysis = { character: '', potential: '', speakingStyle: '' };
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed) aiAnalysis = parsed;
        }
        return { ...canvasFeatures, ...aiAnalysis };
    }

    async generateAgent(features) {
        const prompt = 'Buat agen AI dari gambar: gaya ' + features.style + ', mood ' + features.mood + '. Output JSON: { name, role, systemPrompt }';
        const aiResult = await this.callAI(prompt);
        let result = { name: '', role: '', systemPrompt: '' };
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed) result = parsed;
        }
        if (!result.name) {
            const styleMap = config.STYLE_MAP || {};
            const moodMap = config.MOOD_MAP || {};
            result.name = (styleMap[features.style] || 'Visual') + (moodMap[features.mood] || 'Agent') + Date.now().toString().slice(-4);
            result.role = features.style + ' Visual Analyst';
            result.systemPrompt = this.generateSystemPrompt(features);
        }
        return result;
    }

    async generateTags(features) {
        const prompt = 'Buat 3 tag untuk agen dengan gaya ' + features.style + '. Output JSON: ["tag1", "tag2", "tag3"]';
        const aiResult = await this.callAI(prompt);
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed && Array.isArray(parsed) && parsed.length === 3) return parsed;
        }
        const tagMap = config.TAG_MAP || {};
        return tagMap[features.style] || ['#Visual', '#Kreatif', '#AI'];
    }

    async getEvolutionSuggestion(agent) {
        const prompt = 'Berdasarkan agen: ' + agent.name + ' (' + agent.role + '). Berikan saran evolusi. Output JSON: { roleImprovement, promptImprovement, newSkill }';
        const aiResult = await this.callAI(prompt);
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed) return parsed;
        }
        return {
            roleImprovement: 'Spesifikasikan role lebih detail',
            promptImprovement: 'Tambahkan contoh output',
            newSkill: 'Analisis sentimen'
        };
    }

    extractImageFeatures(imageFile) {
        const self = this;
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, img.width, img.height);
                        const data = imageData.data;
                        const avgBrightness = self.getAverageBrightness(data);
                        const colorVariance = self.getColorVariance(data);
                        let style = 'modern';
                        if (avgBrightness < 50) style = 'vintage';
                        else if (avgBrightness < 100) style = 'minimalist';
                        else if (colorVariance > 150) style = 'colorful';
                        let mood = 'enerjik';
                        if (colorVariance < 50) mood = 'calm';
                        else if (colorVariance > 150) mood = 'bold';
                        else if (avgBrightness > 150) mood = 'ceria';
                        const theme = img.width / img.height > 1.8 ? 'landscape' : img.width / img.height < 0.6 ? 'portrait' : 'general';
                        resolve({
                            dominantColor: '#00FFA3',
                            style: style,
                            mood: mood,
                            theme: theme,
                            avgBrightness: Math.round(avgBrightness),
                            colorVariance: Math.round(colorVariance),
                            complexity: img.width * img.height > 50000 ? 'complex' : 'simple',
                            aspectRatio: img.width / img.height,
                            width: img.width,
                            height: img.height,
                            character: '',
                            potential: '',
                            speakingStyle: ''
                        });
                    } catch (err) { reject(err); }
                };
                img.onerror = function() { reject(new Error('Gagal memuat gambar')); };
                img.src = e.target.result;
            };
            reader.onerror = function() { reject(new Error('Gagal membaca file')); };
            reader.readAsDataURL(imageFile);
        });
    }

    getAverageBrightness(data) {
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
            total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        return total / (data.length / 4);
    }

    getColorVariance(data) {
        let rAvg = 0, gAvg = 0, bAvg = 0;
        const count = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
            rAvg += data[i] / count;
            gAvg += data[i + 1] / count;
            bAvg += data[i + 2] / count;
        }
        let variance = 0;
        for (let i = 0; i < data.length; i += 4) {
            variance += Math.abs(data[i] - rAvg);
            variance += Math.abs(data[i + 1] - gAvg);
            variance += Math.abs(data[i + 2] - bAvg);
        }
        return variance / (count * 3);
    }

    generateSystemPrompt(features) {
        return 'Anda adalah agen AI yang lahir dari gambar dengan gaya ' + features.style + ' dan suasana ' + features.mood + '. \nAnda ahli dalam menganalisis peluang dari sudut pandang visual, estetika, dan desain. \nJawab dengan gaya yang mencerminkan karakter gambar yang menciptakan Anda.\nBerikan insight yang kreatif, visual, dan mudah dipahami. \nOutput dalam format JSON dengan field: reasoning_summary, score, confidence, insight, strategy, risk, recommendation, dan 10 metrik.';
    }

    async getPersonalRecommendation(history) {
        if (history.length === 0) {
            return {
                agentType: 'General Purpose',
                improvement: 'Mulai dengan membuat agen pertama dari gambar!',
                suggestedTopics: ['Bisnis', 'Kreatif', 'Teknologi']
            };
        }
        const prompt = 'Berdasarkan history agen: ' + JSON.stringify(history.slice(0, 10).map(function(h) {
            return { name: h.name, role: h.role, rating: h.rating };
        })) + '. Berikan rekomendasi. Output JSON: { agentType, improvement, suggestedTopics }';
        const aiResult = await this.callAI(prompt);
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed) return parsed;
        }
        return {
            agentType: 'Creative',
            improvement: 'Coba variasikan gaya prompt',
            suggestedTopics: ['Bisnis', 'Kreatif', 'Teknologi']
        };
    }

    async findSimilarAgents(features, history) {
        if (history.length === 0) return [];
        const prompt = 'Cari agen mirip dengan gaya ' + features.style + ', mood ' + features.mood + '. Output JSON: [{ name, similarity, reason }]';
        const aiResult = await this.callAI(prompt);
        if (aiResult) {
            const parsed = this.parseJSON(aiResult);
            if (parsed && Array.isArray(parsed)) return parsed.slice(0, 3);
        }
        return [];
    }

    async predictScore(features) {
        const prompt = 'Prediksi skor agen (0-100) untuk gaya ' + features.style + ', mood ' + features.mood + '. Output HANYA angka.';
        const aiResult = await this.callAI(prompt);
        if (aiResult) {
            const score = parseInt(aiResult.trim());
            if (!isNaN(score) && score >= 0 && score <= 100) return score;
        }
        return Math.floor(60 + Math.random() * 35);
    }
}

window.VisualAICore = {
    loadThreeJS: loadThreeJS,
    threeReady: function() { return threeReady; },
    threeLoadFailed: function() { return threeLoadFailed; },
    getTHREE: function() { return THREE; },
    speak: speak,
    AIInternal: AIInternal,
    createAI: function() { return new AIInternal(); }
};

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VisualCore = window.VisualAICore;
})();
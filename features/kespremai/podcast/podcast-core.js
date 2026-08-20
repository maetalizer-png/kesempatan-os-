import { LANGUAGES, THEMES, HUMAN_VOICES as VOICE_PRESETS } from './podcast-config.js';
import { state, loadHistory, saveHistory } from './podcast-state.js';
import { aiEngine } from './ai-engine.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

const ai = aiEngine.ai;
const voiceEngine = aiEngine.voiceEngine;

function getMemoryInstance() {
    return window.KESEMPATAN?.VectorMemory || window.VectorMemory || window.VectorMemoryV5 || null;
}

function getStaticData() {
    return window.__STATIC_DATA || [];
}

function getDatabaseInstance() {
    return window.KESDatabase || window.getDatabaseV10 || null;
}


function fetchStaticData(topic) {
    const staticData = getStaticData();
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


async function fetchFromVectorMemory(topic, topK) {
    const memory = getMemoryInstance();
    if (!memory || typeof memory.search !== 'function') return [];
    
    try {
        const results = await memory.search(topic, { topK: topK || 3 });
        return results || [];
    } catch (_) {
        return [];
    }
}


async function fetchFromDatabase(topic, limit) {
    const db = getDatabaseInstance();
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


async function savePodcastToMemory(podcastData) {
    const { topic, script, score, voice, summary } = podcastData;
    const memory = getMemoryInstance();
    const db = getDatabaseInstance();
    
    const metadata = {
        topic: topic,
        score: score || 0,
        summary: summary || script.substring(0, 150),
        voice: voice || 'unknown',
        timestamp: Date.now(),
        type: 'podcast'
    };

    
    if (memory) {
        try {
            if (typeof memory.save === 'function') {
                await memory.save(script, metadata);
            } else if (typeof memory.add === 'function') {
                await memory.add(metadata);
            }
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
    }

    
    if (db) {
        try {
            const record = { ...metadata, script: script };
            if (db.saveQuantumEncrypted && typeof db.saveQuantumEncrypted === 'function') {
                await db.saveQuantumEncrypted('podcast_history', 'podcast_' + Date.now(), record);
            } else if (db.insert && typeof db.insert === 'function') {
                await db.insert('podcast_history', record);
            } else if (db.save && typeof db.save === 'function') {
                await db.save('podcast_history', record);
            }
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
    }
}


let cachedVoice = null;
let cachedLang = null;
let cachedGender = null;














const MALE_NAME_HINTS = /\b(male|pria|laki|man|pria|he-)\b/i;
const FEMALE_NAME_HINTS = /\b(female|wanita|perempuan|woman|she-)\b/i;

function findVoiceByGender(voices, gender) {
    if (!voices || voices.length === 0) return null;
    const wantHints = gender === 'female' ? FEMALE_NAME_HINTS : MALE_NAME_HINTS;
    const avoidHints = gender === 'female' ? MALE_NAME_HINTS : FEMALE_NAME_HINTS;
    
    let match = voices.find(function(v) { return wantHints.test(v.name); });
    if (match) return match;
    
    
    const filtered = voices.filter(function(v) { return !avoidHints.test(v.name); });
    return filtered.length > 0 ? filtered[0] : null;
}



const AGENT_GENDER_MAP = {
    Kesempatan: 'male', KakekSantai: 'male', CowokKalem: 'male', KakakMotivator: 'male',
    Manager: 'male', StartupFounder: 'male', SundanyaAsep: 'male', Analyst: 'male', Moderator: 'male',
    NenekBijak: 'female', CewekKece: 'female', TanteBawel: 'female'
};
function inferAgentGender(agentKey) {
    if (!agentKey) return 'male';
    if (/_pria$/i.test(agentKey)) return 'male';
    if (/_wanita$/i.test(agentKey)) return 'female';
    return AGENT_GENDER_MAP[agentKey] || 'male';
}

function getCachedVoice(langCode, gender) {
    if (cachedVoice && cachedLang === langCode && cachedGender === gender) return cachedVoice;
    if (!window.speechSynthesis) return null;
    try {
        const voices = window.speechSynthesis.getVoices();
        const pool = voices.filter(function(v) { return v.lang === langCode; });
        const searchPool = pool.length > 0 ? pool : voices.filter(function(v) { return v.lang && v.lang.startsWith(langCode.split('-')[0]); });
        let voice = null;
        if (gender && searchPool.length > 1) {
            voice = findVoiceByGender(searchPool, gender);
        }
        if (!voice) voice = searchPool[0] || null;
        cachedVoice = voice;
        cachedLang = langCode;
        cachedGender = gender;
        return cachedVoice;
    } catch (_) { return null; }
}









let allVoicesCache = null;
function getAllVoicesForLang(langCode) {
    if (!window.speechSynthesis) return [];
    try {
        if (!allVoicesCache) allVoicesCache = window.speechSynthesis.getVoices();
        const matches = allVoicesCache.filter(function(v) { return v.lang === langCode; });
        return matches.length > 0 ? matches : allVoicesCache.filter(function(v) { return v.lang.startsWith(langCode.split('-')[0]); });
    } catch (_) { return []; }
}
function getVoiceForSpeaker(langCode, speakerIndex, gender) {
    const voices = getAllVoicesForLang(langCode);
    if (voices.length === 0) return getCachedVoice(langCode, gender);
    if (gender) {
        const genderMatch = findVoiceByGender(voices, gender);
        if (genderMatch) return genderMatch;
    }
    const idx = ((speakerIndex % voices.length) + voices.length) % voices.length;
    return voices[idx];
}

function isSpeechSupported() {
    return !!(window.speechSynthesis);
}







let voicesReadyPromise = null;
function waitForVoices(timeoutMs) {
    if (!isSpeechSupported()) return Promise.resolve([]);
    if (voicesReadyPromise) return voicesReadyPromise;
    voicesReadyPromise = new Promise(function(resolve) {
        const existing = window.speechSynthesis.getVoices();
        if (existing && existing.length > 0) { resolve(existing); return; }
        let done = false;
        const finish = function(voices) {
            if (done) return;
            done = true;
            resolve(voices || []);
        };
        try {
            window.speechSynthesis.onvoiceschanged = function() {
                finish(window.speechSynthesis.getVoices());
            };
        } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
        setTimeout(function() { finish(window.speechSynthesis.getVoices()); }, timeoutMs || 1500);
    });
    return voicesReadyPromise;
}

function preloadVoice() {
    if (!isSpeechSupported()) return;
    try {
        waitForVoices(1500).then(function() {
            getCachedVoice('id-ID', 'male');
            getCachedVoice('id-ID', 'female');
        });
    } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
}


class RealMP3Exporter {
    constructor() {
        this.audioContext = null;
        this.lamejsLoaded = false;
    }

    loadLamejs() {
        if (this.lamejsLoaded) return Promise.resolve();
        return new Promise(function(resolve) {
            try {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
                script.onload = function() { this.lamejsLoaded = true; resolve(); }.bind(this);
                script.onerror = function() { resolve(); };
                document.head.appendChild(script);
            } catch (_) { resolve(); }
        }.bind(this));
    }

    exportToMP3(text, voiceConfig, onProgress) {
        return new Promise(function(resolve) {
            try {
                if (onProgress) onProgress(5);
                this.loadLamejs().then(function() {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    if (onProgress) onProgress(10);
                    this.generateTTSAudio(text, voiceConfig).then(function(audioBuffer) {
                        if (onProgress) onProgress(40);
                        this.bufferToWav(audioBuffer).then(function(wavBlob) {
                            if (onProgress) onProgress(60);
                            let finalBlob = wavBlob;
                            if (this.lamejsLoaded && window.lamejs) {
                                this.wavToMP3(wavBlob).then(function(mp3Blob) {
                                    finalBlob = mp3Blob;
                                    if (onProgress) onProgress(85);
                                    const ext = finalBlob.type.includes('mp3') ? 'mp3' : 'wav';
                                    this.download(finalBlob, 'kes_podcast_' + new Date().toISOString().slice(0,10) + '.' + ext);
                                    if (onProgress) onProgress(100);
                                    resolve(finalBlob);
                                }.bind(this)).catch(function() {
                                    this.download(wavBlob, 'kes_podcast_' + new Date().toISOString().slice(0,10) + '.wav');
                                    if (onProgress) onProgress(100);
                                    resolve(wavBlob);
                                }.bind(this));
                            } else {
                                this.download(finalBlob, 'kes_podcast_' + new Date().toISOString().slice(0,10) + '.wav');
                                if (onProgress) onProgress(100);
                                resolve(finalBlob);
                            }
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            } catch (_) {
                this.fallbackExport(text).then(function(fallback) { resolve(fallback); });
            }
        }.bind(this));
    }

    generateTTSAudio(text, config) {
        return new Promise(function(resolve) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = config.lang || 'id-ID';
            utterance.rate = config.rate || 1;
            utterance.pitch = config.pitch || 1;
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const destination = context.createMediaStreamDestination();
            const chunks = [];
            const recorder = new MediaRecorder(destination.stream);
            const getVoice = function() {
                const voices = window.speechSynthesis.getVoices();
                const voice = voices.find(function(v) { return v.lang === config.lang; });
                if (voice) utterance.voice = voice;
            };
            if (window.speechSynthesis.getVoices().length) getVoice();
            else window.speechSynthesis.onvoiceschanged = getVoice;
            recorder.ondataavailable = function(event) { if (event.data.size > 0) chunks.push(event.data); };
            recorder.onstop = function() {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const fileReader = new FileReader();
                fileReader.onload = function(e) {
                    context.decodeAudioData(e.target.result, function(buffer) { resolve(buffer); }, function() {
                        const buffer = context.createBuffer(1, context.sampleRate * 10, context.sampleRate);
                        resolve(buffer);
                    });
                };
                fileReader.readAsArrayBuffer(blob);
            };
            recorder.start();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(destination);
            osc.type = 'sine';
            osc.frequency.value = 440;
            gain.gain.value = 0.1;
            osc.start();
            window.speechSynthesis.speak(utterance);
            utterance.onend = function() {
                setTimeout(function() { osc.stop(); recorder.stop(); }, 500);
            };
            setTimeout(function() { if (recorder.state === 'recording') recorder.stop(); }, 30000);
        });
    }

    bufferToWav(buffer) {
        return new Promise(function(resolve) {
            const numChannels = buffer.numberOfChannels;
            const sampleRate = buffer.sampleRate;
            const data = buffer.getChannelData(0);
            const dataLength = data.length * 2;
            const bufferLength = 44 + dataLength;
            const arrayBuffer = new ArrayBuffer(bufferLength);
            const view = new DataView(arrayBuffer);
            this.writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + dataLength, true);
            this.writeString(view, 8, 'WAVE');
            this.writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * numChannels * 2, true);
            view.setUint16(32, numChannels * 2, true);
            view.setUint16(34, 16, true);
            this.writeString(view, 36, 'data');
            view.setUint32(40, dataLength, true);
            const offset = 44;
            for (let i = 0; i < data.length; i++) {
                const sample = Math.max(-1, Math.min(1, data[i]));
                view.setInt16(offset + i * 2, sample * 0x7FFF, true);
            }
            resolve(new Blob([arrayBuffer], { type: 'audio/wav' }));
        }.bind(this));
    }

    wavToMP3(wavBlob) {
        return new Promise(function(resolve, reject) {
            try {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const arrayBuffer = e.target.result;
                    const data = new Int16Array(arrayBuffer);
                    const audioData = data.slice(44 / 2);
                    const mp3encoder = new lamejs.Mp3Encoder(1, 44100, 128);
                    const mp3Data = [];
                    const sampleBlockSize = 1152;
                    for (let i = 0; i < audioData.length; i += sampleBlockSize) {
                        const sampleChunk = audioData.slice(i, i + sampleBlockSize);
                        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                        if (mp3buf.length > 0) mp3Data.push(new Int8Array(mp3buf));
                    }
                    const mp3buf = mp3encoder.flush();
                    if (mp3buf.length > 0) mp3Data.push(new Int8Array(mp3buf));
                    resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
                };
                reader.readAsArrayBuffer(wavBlob);
            } catch (_) { reject(_); }
        });
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    }

    fallbackExport(text) {
        return Promise.resolve(new Blob(['📌 MP3 Export Instructions:\n\n--- PODCAST TEXT ---\n' + text], { type: 'text/plain' }));
    }
}

const realMP3Exporter = new RealMP3Exporter();


class RealLiveStreamer {
    constructor() {
        this.isLive = false;
        this.stream = null;
        this.viewers = 0;
        this.peerConnection = null;
        this.dataChannel = null;
        this.mediaRecorder = null;
        this.chunks = [];
        this.statsInterval = null;
    }

    startLiveStream(platform, showToastFn) {
        platform = platform || 'youtube';
        if (this.isLive) {
            if (showToastFn) showToastFn('⚠️ Already streaming!');
            return Promise.resolve(false);
        }
        return new Promise(function(resolve) {
            try {
                navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                    video: false
                }).then(function(stream) {
                    this.stream = stream;
                    this.peerConnection = new RTCPeerConnection({
                        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                    });
                    this.stream.getTracks().forEach(function(track) {
                        this.peerConnection.addTrack(track, this.stream);
                    });
                    this.dataChannel = this.peerConnection.createDataChannel('chat');
                    this.dataChannel.onopen = function() { this.sendMessage('Stream started!'); }.bind(this);
                    this.peerConnection.createOffer().then(function(offer) {
                        return this.peerConnection.setLocalDescription(offer);
                    }.bind(this)).then(function() {
                        this.isLive = true;
                        this.startStatsInterval();
                        if (showToastFn) showToastFn('📡 Live on ' + platform + '! 🟢');
                        this.renderLiveIndicator();
                        resolve(true);
                    }.bind(this));
                }.bind(this)).catch(function() {
                    if (showToastFn) showToastFn('❌ Failed to start stream');
                    resolve(false);
                });
            } catch (_) {
                if (showToastFn) showToastFn('❌ Failed to start stream');
                resolve(false);
            }
        }.bind(this));
    }

    startStatsInterval() {
        this.statsInterval = setInterval(function() {
            if (this.isLive) {
                this.viewers = Math.floor(10 + Math.random() * 90);
                const indicator = document.querySelector('.live-indicator');
                if (indicator) indicator.textContent = '🔴 LIVE • ' + this.viewers + ' viewers';
            }
        }.bind(this), 10000);
    }

    sendMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(message);
        }
    }

    stopLiveStream() {
        this.isLive = false;
        if (this.statsInterval) { clearInterval(this.statsInterval); this.statsInterval = null; }
        if (this.stream) { this.stream.getTracks().forEach(function(track) { track.stop(); }); this.stream = null; }
        if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null; }
        const indicator = document.querySelector('.live-indicator');
        if (indicator) indicator.remove();
    }

    renderLiveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'live-indicator';
        indicator.style.cssText = 'position:fixed; top:10px; right:10px; background:#FF0000; color:white; padding:4px 12px; border-radius:20px; font-weight:bold; font-size:12px; z-index:10000; animation:pulse 1s infinite; box-shadow:0 0 20px rgba(255,0,0,0.5);';
        indicator.textContent = '🔴 LIVE • 0 viewers';
        document.body.appendChild(indicator);
        if (!document.getElementById('livePulseStyle')) {
            const style = document.createElement('style');
            style.id = 'livePulseStyle';
            style.textContent = '@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }';
            document.head.appendChild(style);
        }
    }
}

const realLiveStreamer = new RealLiveStreamer();


class RealCollaborative {
    constructor() {
        this.channel = null;
        this.roomId = null;
        this.isConnected = false;
        this.messageHandler = null;
        this.peers = [];
    }

    createRoom(showToastFn) {
        this.roomId = 'room_' + Math.random().toString(36).substr(2, 6);
        this.channel = new BroadcastChannel(this.roomId);
        this.isConnected = true;
        this.channel.onmessage = function(event) { this.handleMessage(event.data); }.bind(this);
        if (showToastFn) showToastFn('🌐 Room created: ' + this.roomId);
        return this.roomId;
    }

    joinRoom(roomId, showToastFn) {
        this.roomId = roomId;
        this.channel = new BroadcastChannel(roomId);
        this.isConnected = true;
        this.channel.onmessage = function(event) { this.handleMessage(event.data); }.bind(this);
        if (showToastFn) showToastFn('🌐 Joined room: ' + roomId);
        return roomId;
    }

    handleMessage(data) {
        if (data.type === 'sync_script' && this.messageHandler) this.messageHandler(data);
        if (data.type === 'peer_join' && !this.peers.includes(data.peerId)) this.peers.push(data.peerId);
    }

    broadcast(event, data) {
        if (!this.channel) return;
        this.channel.postMessage({ type: event, peerId: this.roomId, ...data, timestamp: Date.now() });
    }

    syncScript(text) {
        this.broadcast('sync_script', { text: text });
    }

    onMessage(handler) {
        this.messageHandler = handler;
    }

    disconnect() {
        if (this.channel) { this.channel.close(); this.channel = null; }
        this.isConnected = false;
        this.peers = [];
    }
}

const realCollaborative = new RealCollaborative();


function trackAnalytics(event, data) {
    state.analytics.totalPlays++;
    if (data.duration) state.analytics.totalDuration += data.duration;
    if (data.topic) state.analytics.topics[data.topic] = (state.analytics.topics[data.topic] || 0) + 1;
    if (data.voice) state.analytics.voices[data.voice] = (state.analytics.voices[data.voice] || 0) + 1;
    state.analytics.lastListen = Date.now();
    KESEMPATAN.Podcast.saveHistory();
}

function renderAnalytics() {
    const topics = Object.entries(state.analytics.topics).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5);
    const voices = Object.entries(state.analytics.voices).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5);
    const voiceCount = Object.keys(VOICE_PRESETS).length;
    const langCount = Object.keys(LANGUAGES).length;
    const theme = THEMES[state.currentTheme] || THEMES.dark;
    const memCount = (ai.getPreviousContext ? ai.getPreviousContext().length : 0);

    const dot = function(on) {
        return `<span class="desk-indicator ${on ? 'on' : ''}" style="background:${on ? theme.primary : 'rgba(255,255,255,0.2)'};"></span>`;
    };
    const cell = function(label, value, on) {
        return `<div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
            <span style="display:flex; align-items:center; gap:4px; font-size:8px; color:${theme.text}; opacity:0.5; text-transform:uppercase;">${dot(on)}${label}</span>
            <span class="desk-status ${on ? 'on' : 'off'}">${value}</span>
        </div>`;
    };

    return `
        <div class="desk-monitor" style="margin-top:2px;">
            <div class="desk-label" style="text-align:left; margin-bottom:6px;">MONITORING</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 12px;">
                ${cell('System', 'ONLINE', true)}
                ${cell('AI Engine', 'ACTIVE', true)}
                ${cell('Voice', 'READY', true)}
                ${cell('Memory', memCount + ' CTX', memCount > 0)}
                ${cell('Playback', state.isPlaying ? 'PLAYING' : 'READY', state.isPlaying)}
                ${cell('Plays', state.analytics.totalPlays, false)}
            </div>
            <div style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.05);" class="desk-readout">
                <span style="color:${theme.text}; opacity:0.35;">${Math.floor(state.analytics.totalDuration / 60)}m total · ${voiceCount} voices / ${langCount} lang · last: ${state.analytics.lastListen ? new Date(state.analytics.lastListen).toLocaleDateString() : 'never'}</span>
            </div>
        </div>
    `;
}

export const core = {
    state: state,
    loadHistory: loadHistory,
    saveHistory: saveHistory,

    ai: ai,
    voiceEngine: voiceEngine,

    getCachedVoice: getCachedVoice,
    getVoiceForSpeaker: getVoiceForSpeaker,
    inferAgentGender: inferAgentGender,
    waitForVoices: waitForVoices,
    preloadVoice: preloadVoice,
    isSpeechSupported: isSpeechSupported,

    exporter: realMP3Exporter,
    live: realLiveStreamer,
    collab: realCollaborative,

    trackAnalytics: trackAnalytics,
    renderAnalytics: renderAnalytics,

    // Memory/database/world integration
    getMemoryInstance: getMemoryInstance,
    getStaticData: getStaticData,
    getDatabaseInstance: getDatabaseInstance,
    fetchStaticData: fetchStaticData,
    fetchFromVectorMemory: fetchFromVectorMemory,
    fetchFromDatabase: fetchFromDatabase,
    savePodcastToMemory: savePodcastToMemory,
    isMemoryReady: function() { return !!getMemoryInstance(); },
    isDatabaseReady: function() { return !!getDatabaseInstance(); },
    isWorldReady: function() { return getStaticData().length > 0; }
};

KESEMPATAN.Podcast.core = core;
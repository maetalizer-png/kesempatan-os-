

import { RapConfig } from './rap-config.js';
import { RapHelpers } from './rap-helpers.js';
import { RapEngine } from './rap-engine.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const CONFIG = RapConfig.CONFIG;
const rapState = RapConfig.rapState;
const getRapBattleActive = RapConfig.getRapBattleActive;
const setRapBattleActive = RapConfig.setRapBattleActive;
const getRapAbort = RapConfig.getRapAbort;
const setRapAbort = RapConfig.setRapAbort;

const getDisplayName = RapHelpers.getDisplayName;
const getApiKey = RapHelpers.getApiKey;

const memory = window.KESEMPATAN?.VectorMemory || window.VectorMemory || window.VectorMemoryV5;




let beatContext = null;
let beatInterval = null;
let beatActive = false;
let beatPattern = 'trap';
let beatStep = 0;




let activeSong = null;
let currentBPM = CONFIG.BEAT_BPM;

const BEAT_PATTERNS = {
    'trap': {
        kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        snare: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        hat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        bass: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]
    },
    'boom-bap': {
        kick: [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
        snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        hat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        bass: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
    },
    'drill': {
        kick: [1,0,0,1, 0,0,0,0, 1,0,0,1, 0,0,0,0],
        snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        hat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        bass: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
    }
};

function initBeat() {
    try {
        beatContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        
    }
}

function playKick() {
    try {
        const osc = beatContext.createOscillator();
        const gain = beatContext.createGain();
        osc.connect(gain);
        gain.connect(beatContext.destination);
        osc.frequency.value = 60;
        osc.type = 'sine';
        gain.gain.value = 0.1;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, beatContext.currentTime + 0.05);
        osc.stop(beatContext.currentTime + 0.05);
    } catch (e) {
        
    }
}

function playSnare() {
    try {
        const osc = beatContext.createOscillator();
        const gain = beatContext.createGain();
        osc.connect(gain);
        gain.connect(beatContext.destination);
        osc.frequency.value = 180;
        osc.type = 'square';
        gain.gain.value = 0.08;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, beatContext.currentTime + 0.03);
        osc.stop(beatContext.currentTime + 0.03);
    } catch (e) {
        
    }
}

function playHat() {
    try {
        const osc = beatContext.createOscillator();
        const gain = beatContext.createGain();
        osc.connect(gain);
        gain.connect(beatContext.destination);
        osc.frequency.value = 8000;
        osc.type = 'square';
        gain.gain.value = 0.03;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, beatContext.currentTime + 0.02);
        osc.stop(beatContext.currentTime + 0.02);
    } catch (e) {
        
    }
}

function playBass() {
    try {
        const osc = beatContext.createOscillator();
        const gain = beatContext.createGain();
        osc.connect(gain);
        gain.connect(beatContext.destination);
        osc.frequency.value = 40;
        osc.type = 'sawtooth';
        gain.gain.value = 0.06;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, beatContext.currentTime + 0.1);
        osc.stop(beatContext.currentTime + 0.1);
    } catch (e) {
        
    }
}

function playBeat() {
    if (!beatContext || beatActive) {
        return;
    }
    beatActive = true;
    beatStep = 0;

    const bpm = currentBPM;
    const interval = 60000 / bpm;

    beatInterval = setInterval(function() {
        if (!beatActive) {
            return;
        }
        try {
            const step = beatStep % 16;
            const p = BEAT_PATTERNS[beatPattern] || BEAT_PATTERNS['trap'];
            
            if (p.kick[step]) playKick();
            if (p.snare[step]) playSnare();
            if (p.hat[step]) playHat();
            if (p.bass[step]) playBass();
            
            beatStep++;
        } catch (e) {
            
        }
    }, interval);

    const beatIndicator = document.getElementById('beatIndicator');
    if (beatIndicator) {
        const label = activeSong ? activeSong.title : beatPattern.toUpperCase();
        beatIndicator.textContent = '🥁 ' + label + ' 🔴';
        beatIndicator.style.background = 'rgba(255,0,0,0.15)';
        beatIndicator.style.borderColor = '#FF0000';
    }
}

function stopBeat() {
    beatActive = false;
    if (beatInterval) {
        clearInterval(beatInterval);
        beatInterval = null;
    }
    const beatIndicator = document.getElementById('beatIndicator');
    if (beatIndicator) {
        const label = activeSong ? activeSong.title : beatPattern.toUpperCase();
        beatIndicator.textContent = '🥁 ' + label + ' ' + currentBPM + ' BPM';
        beatIndicator.style.background = 'rgba(255,215,0,0.05)';
        beatIndicator.style.borderColor = 'rgba(255,215,0,0.1)';
    }
}

function toggleBeat() {
    if (beatActive) {
        stopBeat();
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('🔇 Beat dihentikan', 'info');
        }
    } else {
        if (!beatContext) {
            initBeat();
        }
        playBeat();
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('🥁 Beat dimulai! 🔥', 'success');
        }
    }
}

function setBeatPattern(pattern) {
    const valid = ['trap', 'boom-bap', 'drill'];
    if (valid.includes(pattern)) {
        beatPattern = pattern;
        
        
        activeSong = null;
        currentBPM = CONFIG.BEAT_BPM;
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('🎵 Pattern: ' + pattern, 'info');
        }
        
        const select = document.getElementById('beatPatternSelect');
        if (select) {
            select.value = pattern;
        }
        if (beatActive) {
            stopBeat();
            playBeat();
        }
    }
}

function getBeatPattern() {
    return beatPattern;
}




function setActiveSong(songId) {
    if (!KESEMPATAN.RapSoundbank) return null;
    const song = KESEMPATAN.RapSoundbank.getSongById(songId);
    if (!song) return null;
    activeSong = song;
    beatPattern = song.genre;
    currentBPM = song.bpm;
    if (KESEMPATAN.RapBattle.ui) {
        KESEMPATAN.RapBattle.ui.showToast('🎵 Lagu: ' + song.title + ' (' + song.bpm + ' BPM)', 'info');
    }
    const patternSelect = document.getElementById('beatPatternSelect');
    if (patternSelect) {
        patternSelect.value = songId;
    }
    const beatIndicator = document.getElementById('beatIndicator');
    if (beatIndicator && !beatActive) {
        beatIndicator.textContent = '🥁 ' + song.title + ' ' + song.bpm + ' BPM';
    }
    if (beatActive) {
        stopBeat();
        playBeat();
    }
    return song;
}

function getActiveSong() {
    return activeSong;
}

function getCurrentBPM() {
    return currentBPM;
}







function buildSongContext() {
    let song = activeSong;
    if (!song && KESEMPATAN.RapSoundbank) {
        song = KESEMPATAN.RapSoundbank.getDefaultSongForGenre(beatPattern);
    }
    if (!song) return null;
    return {
        id: song.id,
        title: song.title,
        genre: song.genre,
        bpm: song.bpm,
        mood: song.mood,
        hook: song.hook
    };
}




function speakHook(hookText) {
    if (!hookText) return;
    try {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        const cleanHook = hookText.replace(/\*/g, '');
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(function(v) { return v.lang === 'id-ID'; }) ||
            voices.find(function(v) { return v.lang && v.lang.indexOf('id') === 0; });
        const utterance = new SpeechSynthesisUtterance(cleanHook);
        utterance.lang = 'id-ID';
        utterance.rate = 0.82;
        utterance.pitch = 1.12;
        utterance.volume = 1.0;
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        
    }
}




let audienceReactions = [];
let reactionInterval = null;

function addAudienceReaction(emoji) {
    const container = document.getElementById('audienceReactions');
    if (!container) {
        return;
    }

    const reaction = document.createElement('span');
    reaction.textContent = emoji;
    reaction.style.cssText = 'display:inline-block; font-size:24px; animation:reactionPop 0.6s ease forwards; margin:2px;';
    container.appendChild(reaction);

    setTimeout(function() {
        if (reaction.parentNode) {
            reaction.remove();
        }
    }, 3000);

    audienceReactions.push({ emoji: emoji, time: Date.now() });
    if (audienceReactions.length > 20) {
        audienceReactions.shift();
    }

    const countEl = document.getElementById('reactionCount');
    if (countEl) {
        countEl.textContent = '🔥 ' + audienceReactions.length;
    }
}

function randomReaction() {
    const emojis = CONFIG.REACTIONS;
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function startAutoReactions() {
    if (reactionInterval) {
        return;
    }
    reactionInterval = setInterval(function() {
        if (getRapBattleActive()) {
            addAudienceReaction(randomReaction());
        }
    }, 3000);
}

function stopAutoReactions() {
    if (reactionInterval) {
        clearInterval(reactionInterval);
        reactionInterval = null;
    }
}
























function speakRap(text, sender, agentKey, round, totalRounds) {
    if (!text || text.length === 0) {
        return;
    }
    try {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const profile = (KESEMPATAN.RapCharacterEngine && agentKey)
            ? KESEMPATAN.RapCharacterEngine.getVoiceProfile(agentKey)
            : { rate: CONFIG.VOICE_RATE, pitch: CONFIG.VOICE_PITCH, pauseMs: 350, punchlineBoost: 0.15, adlibs: [] };

        
        
        
        
        
        
        const emoMod = (KESEMPATAN.RapCharacterEngine && KESEMPATAN.RapCharacterEngine.getEmotionModifier && round)
            ? KESEMPATAN.RapCharacterEngine.getEmotionModifier(round, totalRounds || round)
            : { rateMult: 1, pitchMult: 1 };

        const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\*/g, '').substring(0, 500);
        const lines = cleanText.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
        if (lines.length === 0) return;

        const voices = window.speechSynthesis.getVoices();
        const indonesianVoice = (KESEMPATAN.RapCharacterEngine && KESEMPATAN.RapCharacterEngine.pickVoiceForAgent)
            ? KESEMPATAN.RapCharacterEngine.pickVoiceForAgent(agentKey || sender, voices)
            : (voices.find(function(v) { return v.lang === 'id-ID'; }) ||
               voices.find(function(v) { return v.lang && v.lang.indexOf('id') === 0; }));

        
        
        const beatUnitMs = 60000 / (currentBPM || CONFIG.BEAT_BPM || 140);
        const lineGapMs = Math.round((profile.pauseMs + beatUnitMs) / 2);

        let prevEnding = '';
        function lineEnding(line) {
            const w = line.replace(/[!?.,]/g, '').trim().split(/\s+/);
            return (w[w.length - 1] || '').toLowerCase().slice(-3);
        }

        function speakOneLine(line, isLast, progress) {
            return new Promise(function(resolve) {
                if (getRapAbort && getRapAbort()) { resolve(); return; }
                const isPunchline = isLast || /!$/.test(line);
                const isQuestion = /\?$/.test(line);
                const ending = lineEnding(line);
                const landsRhyme = !isLast && prevEnding && ending && ending === prevEnding;

                
                
                
                const rampRate = 1 + progress * 0.06;
                const rampPitch = progress * 0.05;

                
                
                
                const jitterRate = 1 + (Math.random() - 0.5) * 0.05;
                const jitterPitch = (Math.random() - 0.5) * 0.06;

                const utterance = new SpeechSynthesisUtterance(line);
                utterance.lang = 'id-ID';
                utterance.rate = Math.max(0.5, Math.min(2,
                    profile.rate * emoMod.rateMult * rampRate * jitterRate));

                let pitch = profile.pitch * emoMod.pitchMult + rampPitch + jitterPitch;
                if (isPunchline) pitch += profile.punchlineBoost;
                if (isQuestion) pitch += profile.punchlineBoost * 0.5;
                if (landsRhyme) pitch += profile.punchlineBoost * 0.4; 
                utterance.pitch = Math.max(0.1, Math.min(2, pitch));
                utterance.volume = Math.max(0.3, Math.min(1, (profile.volume || 0.9) + (Math.random() - 0.5) * 0.06));
                if (indonesianVoice) utterance.voice = indonesianVoice;

                prevEnding = ending;

                utterance.onend = function() { resolve(); };
                utterance.onerror = function() { resolve(); };
                window.speechSynthesis.speak(utterance);
            });
        }

        (async function deliver() {
            
            if (profile.adlibs && profile.adlibs.length > 0 && Math.random() < 0.6) {
                await speakOneLine(profile.adlibs[Math.floor(Math.random() * profile.adlibs.length)], false, 0);
                await new Promise(function(r) { setTimeout(r, lineGapMs * 0.4); });
            }
            for (let i = 0; i < lines.length; i++) {
                if (getRapAbort && getRapAbort()) break;
                const isLast = i === lines.length - 1;
                const progress = lines.length > 1 ? i / (lines.length - 1) : 1;

                
                
                
                
                if (i > 0 && !isLast && i % 4 === 0 && profile.adlibs && profile.adlibs.length > 0 && Math.random() < 0.25) {
                    await speakOneLine(profile.adlibs[Math.floor(Math.random() * profile.adlibs.length)], false, progress);
                    await new Promise(function(r) { setTimeout(r, lineGapMs * 0.3); });
                }

                await speakOneLine(lines[i], isLast, progress);
                if (!isLast) {
                    await new Promise(function(r) { setTimeout(r, lineGapMs); });
                }
            }
        })();
    } catch (e) {
        
    }
}




function saveHistory(rapData) {
    try {
        let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
        const battle = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...rapData
        };
        history.unshift(battle);
        if (history.length > CONFIG.MAX_HISTORY) {
            history.length = CONFIG.MAX_HISTORY;
        }
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(history));
        
        if (window.KESEMPATAN?.KesDatabase?.mirrorHistoryItem) {
            window.KESEMPATAN.KesDatabase.mirrorHistoryItem('rap_battle_history', battle);
        }
    } catch (e) {
        console.warn('[RapBattle] Save history failed:', e.message);
    }
}

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
        if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
            window.KESEMPATAN.KesDatabase.migrateArrayOnce('rap_battle_history', history);
        }
        return history;
    } catch (e) {
        return [];
    }
}




function analyzeFlow(text) {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/);

    function detectRhymes(t) {
        const lines = t.split('\n').filter(function(l) {
            return l.trim().length > 0;
        });
        const endWords = lines.map(function(l) {
            const w = l.trim().split(/\s+/);
            return w[w.length - 1] || '';
        });

        let rhymeCount = 0;
        for (let i = 0; i < endWords.length - 1; i++) {
            for (let j = i + 1; j < endWords.length; j++) {
                if (endWords[i].length > 2 && endWords[j].length > 2) {
                    const a = endWords[i].toLowerCase();
                    const b = endWords[j].toLowerCase();
                    const aEnd = a.slice(-2);
                    const bEnd = b.slice(-2);
                    if (aEnd === bEnd) {
                        rhymeCount++;
                    }
                }
            }
        }
        return rhymeCount;
    }

    const rhymes = detectRhymes(text);
    const avgLineLength = words.length / (sentences.length || 1);
    const flowScore = Math.min(100, Math.round(
        (rhymes * 10) +
        (avgLineLength > 5 && avgLineLength < 15 ? 20 : 10) +
        (sentences.length > 2 ? 10 : 0)
    ));

    return {
        wordCount: words.length,
        sentenceCount: sentences.length,
        rhymes: rhymes,
        avgLineLength: avgLineLength.toFixed(1),
        flowScore: flowScore,
        complexity: words.length > 50 ? 'High' : words.length > 25 ? 'Medium' : 'Low'
    };
}




function exportRapResult(format) {
    format = format || 'pdf';

    if (rapState.history.length === 0) {
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('Tidak ada hasil rap battle untuk di-export', 'warn');
        }
        return;
    }

    const cleanHistory = rapState.history.map(function(entry) {
        let cleanMessage = entry.message || '';
        if (typeof cleanMessage === 'string') {
            cleanMessage = cleanMessage.replace(/\*/g, '');
        }
        return { ...entry, message: cleanMessage };
    });

    const winnerName = document.querySelector('#rapResult .winner-name')?.textContent || 'Unknown';
    let winnerReason = document.querySelector('#rapResult .winner-reason')?.textContent || 'No reason';
    if (typeof winnerReason === 'string') {
        winnerReason = winnerReason.replace(/\*/g, '');
    }
    const scoreA = document.querySelector('#rapScoreA')?.textContent || '0';
    const scoreB = document.querySelector('#rapScoreB')?.textContent || '0';

    const data = {
        topic: rapState.topic || 'Unknown',
        agentA: getDisplayName(rapState.agentA),
        agentB: getDisplayName(rapState.agentB),
        rounds: rapState.currentRound,
        history: cleanHistory,
        winner: winnerName,
        reason: winnerReason,
        scoreA: scoreA,
        scoreB: scoreB
    };

    if (format === 'pdf') {
        if (typeof window.jspdf !== 'undefined' || typeof jspdf !== 'undefined') {
            try {
                const { jsPDF } = window.jspdf || jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                let y = 20;

                doc.setFontSize(20);
                doc.setTextColor(255, 215, 0);
                doc.text('🎤 RAP BATTLE RESULT', pageWidth / 2, y, { align: 'center' });
                y += 12;

                doc.setTextColor(0);
                doc.setFontSize(12);
                doc.text('Topic: ' + data.topic, 20, y);
                y += 8;
                doc.text('Date: ' + new Date().toLocaleString(), 20, y);
                y += 8;
                doc.text('Rounds: ' + data.rounds, 20, y);
                y += 12;

                doc.setFontSize(16);
                doc.setTextColor(0, 200, 0);
                doc.text('🏆 WINNER: ' + data.winner, 20, y);
                y += 10;

                doc.setTextColor(0);
                doc.setFontSize(12);
                doc.text('Score: ' + data.scoreA + ' vs ' + data.scoreB, 20, y);
                y += 8;
                doc.text('Reason: ' + data.reason, 20, y);
                y += 12;

                if (data.history.length > 0) {
                    doc.setFontSize(14);
                    doc.text('📝 Battle History', 20, y);
                    y += 8;
                    doc.setFontSize(9);
                    for (let i = 0; i < data.history.length; i++) {
                        const entry = data.history[i];
                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                        const msg = (entry.message || '').substring(0, 80);
                        doc.text(entry.sender + ': ' + msg + '...', 20, y);
                        y += 5;
                    }
                }

                doc.save('rap-battle-' + Date.now() + '.pdf');
                if (KESEMPATAN.RapBattle.ui) {
                    KESEMPATAN.RapBattle.ui.showToast('✅ PDF berhasil di-export!', 'success');
                }
                return;
            } catch (e) {
                
            }
        }
        exportRapResult('txt');
    } else if (format === 'json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rap-battle-' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('✅ JSON berhasil di-export!', 'success');
        }
    } else {
        let content = '========================================\n';
        content += '        RAP BATTLE RESULT\n';
        content += '========================================\n\n';
        content += 'Topic: ' + data.topic + '\n';
        content += 'Date: ' + new Date().toLocaleString() + '\n';
        content += 'Rounds: ' + data.rounds + '\n\n';
        content += 'Winner: ' + data.winner + '\n';
        content += 'Score: ' + data.scoreA + ' vs ' + data.scoreB + '\n';
        content += 'Reason: ' + data.reason + '\n\n';
        content += '----------------------------------------\n';
        content += 'BATTLE HISTORY\n';
        content += '----------------------------------------\n\n';

        for (let i = 0; i < data.history.length; i++) {
            const entry = data.history[i];
            content += '[' + entry.time + '] ' + entry.sender + ': ' + entry.message + '\n';
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rap-battle-' + Date.now() + '.txt';
        a.click();
        URL.revokeObjectURL(url);
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('✅ TXT berhasil di-export!', 'success');
        }
    }
}




async function startRapBattle(topic, agentA, agentB, rounds) {
    rounds = rounds || 3;

    if (agentA === agentB) {
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('Agent A dan Agent B harus berbeda!', 'error');
        }
        return;
    }

    if (getRapBattleActive()) {
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('Rap battle sedang berjalan', 'warn');
        }
        return;
    }

    setRapBattleActive(true);
    setRapAbort(false);

    rapState.status = 'running';
    rapState.currentRound = 0;
    rapState.maxRounds = rounds;
    rapState.topic = topic;
    rapState.agentA = agentA;
    rapState.agentB = agentB;
    rapState.history = [];
    rapState.startTime = Date.now();

    const apiKey = getApiKey();
    if (!apiKey) {
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.showToast('Masukkan API Key terlebih dahulu', 'error');
        }
        setRapBattleActive(false);
        return;
    }

    let memoryContext = null;
    if (memory) {
        try {
            memoryContext = await memory.search(topic, { topK: 3 });
            rapState.memoryContext = memoryContext;
        } catch (e) {
            
        }
    }

    initBeat();
    playBeat();
    startAutoReactions();

    const displayA = getDisplayName(agentA);
    const displayB = getDisplayName(agentB);

    const songContext = buildSongContext();

    if (KESEMPATAN.RapBattle.ui && KESEMPATAN.RapBattle.ui.addMessage) {
        KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '🌍 SELAMAT DATANG DI PANGGUNG RAP BATTLE INTERNASIONAL! 🔥');
        KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '📌 Topik: "' + topic + '"');
        KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', displayA + ' 🆚 ' + displayB + ' — ' + rounds + ' ronde');
        if (songContext) {
            KESEMPATAN.RapBattle.ui.addMessage('🎶 MC', 'Instrumental malam ini: "' + songContext.title + '" (' +
                songContext.mood + ', ' + songContext.bpm + ' BPM)');
        }
    }

    
    if (KESEMPATAN.RapBattle.ui && KESEMPATAN.RapBattle.ui.startVisualizer) {
        KESEMPATAN.RapBattle.ui.startVisualizer();
    }

    let lastRapA = '';
    let lastRapB = '';
    let allRapA = '';
    let allRapB = '';

    const memoryA = { usedEndings: new Set(), usedOpeners: new Set(), wordCounts: {}, ownVerses: [] };
    const memoryB = { usedEndings: new Set(), usedOpeners: new Set(), wordCounts: {}, ownVerses: [] };

    for (let round = 1; round <= rounds; round++) {
        if (getRapAbort()) {
            break;
        }
        rapState.currentRound = round;

        
        
        
        
        const roundSongContext = buildSongContext();
        const plan = RapEngine.getBattlePlan ? RapEngine.getBattlePlan(round, rounds) : null;

        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.updateRapStats();
            
            
            
            
            
            if (plan) {
                KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '--- RONDE ' + round + ': ' + plan.strategy.toUpperCase() + ' 🎤 ---');
                KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '🎯 ' + plan.goal);
            } else {
                KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '--- RONDE ' + round + ' 🎤 ---');
            }
        }

        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '⏳ ' + displayA + ' sedang menyusun bait...');
        }
        const rapA = await RapEngine.getRap(agentA, topic, lastRapB, round, rounds, apiKey, memoryA, memoryContext, roundSongContext);
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.addMessage(displayA, '🎙️ ' + rapA);
            if (KESEMPATAN.RapBattle.ui.updateVisualizerLyric) {
                KESEMPATAN.RapBattle.ui.updateVisualizerLyric(rapA);
            }
        }
        speakRap(rapA, displayA, agentA, round, rounds);
        allRapA += rapA + '\n';
        lastRapA = rapA;

        addAudienceReaction(RapEngine.predictCrowdReaction ? RapEngine.predictCrowdReaction(rapA).emoji : randomReaction());

        if (getRapAbort()) {
            break;
        }

        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.addMessage('🎤 MC', '⏳ ' + displayB + ' sedang menyusun balasan...');
        }
        const rapB = await RapEngine.getRap(agentB, topic, rapA, round, rounds, apiKey, memoryB, memoryContext, roundSongContext);
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.addMessage(displayB, '🎤 ' + rapB);
            if (KESEMPATAN.RapBattle.ui.updateVisualizerLyric) {
                KESEMPATAN.RapBattle.ui.updateVisualizerLyric(rapB);
            }
        }
        speakRap(rapB, displayB, agentB, round, rounds);
        allRapB += rapB + '\n';
        lastRapB = rapB;

        addAudienceReaction(RapEngine.predictCrowdReaction ? RapEngine.predictCrowdReaction(rapB).emoji : randomReaction());

        
        
        
        
        
        
        if (plan && plan.strategy === 'Callback' && roundSongContext && roundSongContext.hook) {
            if (KESEMPATAN.RapBattle.ui) {
                KESEMPATAN.RapBattle.ui.addMessage('🎶 HOOK', '"' + roundSongContext.hook + '"');
            }
            speakHook(roundSongContext.hook);
            addAudienceReaction('🎉');
            addAudienceReaction('🔥');
        }

        if (getRapAbort()) {
            break;
        }

        if (KESEMPATAN.RapBattle.ui) {
            const flowA = analyzeFlow(rapA);
            const flowB = analyzeFlow(rapB);
            KESEMPATAN.RapBattle.ui.updateFlowStats(flowA, flowB);
            KESEMPATAN.RapBattle.ui.updateRapStats();
        }
    }

    if (getRapAbort()) {
        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.addMessage('⏹️ MC', 'Rap battle dihentikan user.');
            if (KESEMPATAN.RapBattle.ui.stopVisualizer) {
                KESEMPATAN.RapBattle.ui.stopVisualizer();
            }
            if (KESEMPATAN.RapBattle.ui.clearVisualizerLyric) {
                KESEMPATAN.RapBattle.ui.clearVisualizerLyric();
            }
        }
        setRapBattleActive(false);
        stopBeat();
        stopAutoReactions();
        return;
    }

    if (KESEMPATAN.RapBattle.ui) {
        KESEMPATAN.RapBattle.ui.addMessage('⚖️ MC', '⏳ Juri menilai rap battle...');
    }

    let winner;
    try {
        winner = await RapEngine.judgeRap(topic, agentA, agentB, allRapA, allRapB, apiKey);
    } catch (e) {
        winner = {
            winner: displayA,
            reason: 'Penilaian default',
            scoreA: 50,
            scoreB: 50,
            breakdown: {
                rhyme: { A: 25, B: 25 },
                flow: { A: 25, B: 25 },
                punchline: { A: 25, B: 25 },
                creativity: { A: 25, B: 25 }
            }
        };
    }

    rapState.status = 'finished';
    stopBeat();
    stopAutoReactions();

    if (KESEMPATAN.RapBattle.ui && KESEMPATAN.RapBattle.ui.stopVisualizer) {
        KESEMPATAN.RapBattle.ui.stopVisualizer();
    }
    if (KESEMPATAN.RapBattle.ui && KESEMPATAN.RapBattle.ui.clearVisualizerLyric) {
        KESEMPATAN.RapBattle.ui.clearVisualizerLyric();
    }

    saveHistory({
        topic: topic,
        agentA: displayA,
        agentB: displayB,
        rounds: rounds,
        winner: winner.winner,
        reason: winner.reason,
        scoreA: winner.scoreA,
        scoreB: winner.scoreB,
        history: rapState.history
    });

    
    
    
    
    
    try {
        const battleSummary = '🎤 Rap Battle: "' + topic + '" — ' + displayA + ' vs ' + displayB +
            '. Pemenang: ' + winner.winner + '. Alasan: ' + (winner.reason || '-') +
            '. Skor: ' + winner.scoreA + '-' + winner.scoreB + ' (' + rounds + ' ronde).';
        const battleMetadata = {
            type: 'rap-battle',
            topic: topic,
            agentA: displayA,
            agentB: displayB,
            winner: winner.winner,
            scoreA: winner.scoreA,
            scoreB: winner.scoreB,
            rounds: rounds,
            timestamp: Date.now()
        };

        if (memory && typeof memory.save === 'function') {
            memory.save(battleSummary, battleMetadata).catch(function(e) { console.warn('[RapOrchestrator] memory.save failed:', e.message); });
        }

        const db = window.KESDatabase || (window.getDatabaseV10 ? window.getDatabaseV10() : null);
        if (db && typeof db.save === 'function') {
            db.save('rap_battle_history', Object.assign({ summary: battleSummary }, battleMetadata)).catch(function(e) { console.warn('[RapOrchestrator] db.save failed:', e.message); });
        }
    } catch (e) {
        
        
    }

    try {
        RapEngine.learn({
            topic: topic,
            winner: winner.winner,
            strategy: rapState.currentRound > 3 ? 'long' : 'short'
        });
    } catch (e) {
        
    }

    if (KESEMPATAN.RapBattle.ui) {
        KESEMPATAN.RapBattle.ui.showResult(winner, displayA, displayB);
        KESEMPATAN.RapBattle.ui.showToast('🏆 Pemenang: ' + winner.winner, 'success');
        KESEMPATAN.RapBattle.ui.updateRapStats();
    }

    setRapBattleActive(false);
    return winner;
}

function abortRap() {
    setRapAbort(true);
}










function getFameTier(wins) {
    if (wins >= 20) return { tier: 'GOAT Legend', icon: '👑' };
    if (wins >= 10) return { tier: 'Juara Dunia', icon: '🏆' };
    if (wins >= 5) return { tier: 'Kontender Elite', icon: '🔥' };
    if (wins >= 1) return { tier: 'Rising Star', icon: '⭐' };
    return { tier: 'Rookie', icon: '🎤' };
}

function getLeaderboard() {
    const history = loadHistory();
    const tally = {};
    history.forEach(function(entry) {
        [entry.agentA, entry.agentB].forEach(function(name) {
            if (!name) return;
            if (!tally[name]) tally[name] = { name: name, battles: 0, wins: 0 };
            tally[name].battles++;
        });
        if (entry.winner && tally[entry.winner]) {
            tally[entry.winner].wins++;
        }
    });
    const board = Object.keys(tally).map(function(name) {
        const t = tally[name];
        const fame = getFameTier(t.wins);
        return {
            name: t.name,
            battles: t.battles,
            wins: t.wins,
            winRate: t.battles > 0 ? Math.round((t.wins / t.battles) * 100) : 0,
            fameTier: fame.tier,
            fameIcon: fame.icon
        };
    });
    board.sort(function(a, b) { return b.wins - a.wins || b.winRate - a.winRate; });
    return board;
}

function announceHallOfFame(limit) {
    const board = getLeaderboard().slice(0, limit || 3);
    if (KESEMPATAN.RapBattle.ui && KESEMPATAN.RapBattle.ui.addMessage) {
        if (board.length === 0) {
            KESEMPATAN.RapBattle.ui.addMessage('🏆 HALL OF FAME', 'Belum ada battle tercatat — jadilah yang pertama legendaris!');
        } else {
            KESEMPATAN.RapBattle.ui.addMessage('🏆 HALL OF FAME', '--- PAPAN PERINGKAT ---');
            board.forEach(function(row, i) {
                KESEMPATAN.RapBattle.ui.addMessage('🏆 HALL OF FAME',
                    (i + 1) + '. ' + row.fameIcon + ' ' + row.name + ' — ' + row.fameTier +
                    ' (' + row.wins + ' menang / ' + row.battles + ' battle, ' + row.winRate + '%)');
            });
        }
    }
    return board;
}








function runTournament(agentKeys, topic, roundsPerMatch) {
    return (async function() {
        let contestants = (agentKeys && agentKeys.length >= 2)
            ? agentKeys.slice()
            : (KESEMPATAN.RapCharacterEngine ? KESEMPATAN.RapCharacterEngine.getAllPersonas() : []);

        if (contestants.length < 2) {
            if (KESEMPATAN.RapBattle.ui) KESEMPATAN.RapBattle.ui.showToast('Minimal 2 rapper untuk turnamen', 'error');
            return null;
        }

        
        for (let i = contestants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [contestants[i], contestants[j]] = [contestants[j], contestants[i]];
        }

        const bracketLog = [];
        let roundNum = 1;

        if (KESEMPATAN.RapBattle.ui && KESEMPATAN.RapBattle.ui.addMessage) {
            KESEMPATAN.RapBattle.ui.addMessage('🌍 MC', '🏟️ TURNAMEN RAP BATTLE — PANGGUNG KONTES DIMULAI! 🏟️');
            KESEMPATAN.RapBattle.ui.addMessage('🌍 MC', 'Peserta (' + contestants.length + '): ' +
                contestants.map(getDisplayName).join(', '));
        }

        while (contestants.length > 1) {
            if (getRapAbort()) return null;
            const nextRound = [];

            if (KESEMPATAN.RapBattle.ui) {
                KESEMPATAN.RapBattle.ui.addMessage('🌍 MC', '--- BABAK ' + roundNum + ' (' + contestants.length + ' peserta) ---');
            }

            for (let i = 0; i < contestants.length; i += 2) {
                if (getRapAbort()) return null;

                if (i + 1 >= contestants.length) {
                    
                    nextRound.push(contestants[i]);
                    if (KESEMPATAN.RapBattle.ui) {
                        KESEMPATAN.RapBattle.ui.addMessage('🌍 MC', getDisplayName(contestants[i]) + ' lolos otomatis ke babak berikutnya (bye)');
                    }
                    continue;
                }

                const a = contestants[i];
                const b = contestants[i + 1];
                const result = await startRapBattle(topic, a, b, roundsPerMatch || 3);
                if (!result) return null; 

                bracketLog.push({ round: roundNum, agentA: getDisplayName(a), agentB: getDisplayName(b), winner: result.winner });
                nextRound.push(result.winner === getDisplayName(b) ? b : a);
            }

            contestants = nextRound;
            roundNum++;
        }

        const championKey = contestants[0];
        const board = announceHallOfFame(1);

        if (KESEMPATAN.RapBattle.ui) {
            KESEMPATAN.RapBattle.ui.addMessage('👑 MC', '🎉 JUARA TURNAMEN: ' + getDisplayName(championKey) + '! Sang legenda panggung ini! 🎉');
            KESEMPATAN.RapBattle.ui.showToast('👑 Juara Turnamen: ' + getDisplayName(championKey), 'success');
        }

        return { champion: championKey, championDisplay: getDisplayName(championKey), bracketLog: bracketLog, leaderboard: board };
    })();
}




export const RapOrchestrator = {
    initBeat: initBeat,
    playBeat: playBeat,
    stopBeat: stopBeat,
    toggleBeat: toggleBeat,
    setActiveSong: setActiveSong,
    getActiveSong: getActiveSong,
    getCurrentBPM: getCurrentBPM,
    buildSongContext: buildSongContext,
    speakHook: speakHook,
    setBeatPattern: setBeatPattern,
    getBeatPattern: getBeatPattern,
    addAudienceReaction: addAudienceReaction,
    randomReaction: randomReaction,
    startAutoReactions: startAutoReactions,
    stopAutoReactions: stopAutoReactions,
    speakRap: speakRap,
    saveHistory: saveHistory,
    loadHistory: loadHistory,
    exportRapResult: exportRapResult,
    analyzeFlow: analyzeFlow,
    startRapBattle: startRapBattle,
    abortRap: abortRap,
    runTournament: runTournament,
    getLeaderboard: getLeaderboard,
    getFameTier: getFameTier,
    announceHallOfFame: announceHallOfFame,
    getMemoryContext: function() {
        return rapState.memoryContext;
    }
};

KESEMPATAN.RapOrchestrator = RapOrchestrator;

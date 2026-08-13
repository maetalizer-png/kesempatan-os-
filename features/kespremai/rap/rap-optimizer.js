

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;





const SYLLABLE_OVERRIDES = {
    'yang': 1,
    'telah': 2,
    'dengan': 2,
    'kepada': 3,
    'daripada': 4,
    'sebelum': 3,
    'sesudah': 3,
    'karena': 3,
    'seperti': 3,
    'untuk': 2,
    'adalah': 3,
    'bukan': 2,
    'sangat': 2,
    'mereka': 3,
    'kamu': 2,
    'aku': 2,
    'kau': 1,
    'ku': 1,
    'tak': 1,
    'pun': 1,
    'juga': 2,
    'saja': 2,
    'lagi': 2,
    'sudah': 2,
    'belum': 2,
    'dari': 2,
    'di': 1,
    'ke': 1,
    'dan': 1,
    'atau': 2,
    'tapi': 2,
    'jika': 2,
    'maka': 2,
    'kita': 2,
    'kami': 2,
    'saya': 2,
    'anda': 2,
    'dia': 2,
    'ini': 2,
    'itu': 2,
    'ada': 2,
    'bisa': 2,
    'harus': 2,
    'akan': 2,
    'tidak': 2,
    'ya': 1,
    'oh': 1,
    'yeah': 1,
    'yo': 1,
    'ah': 1,
    'eh': 1
};

function countSyllables(word) {
    const cleanWord = word.replace(/[.,!?;:()"']/g, '');
    const lower = cleanWord.toLowerCase();
    if (SYLLABLE_OVERRIDES[lower]) {
        return SYLLABLE_OVERRIDES[lower];
    }
    const vowels = 'aiueoAIUEO';
    let count = 0;
    for (let i = 0; i < cleanWord.length; i++) {
        if (vowels.includes(cleanWord[i])) count++;
    }
    return Math.max(1, count);
}

function countSyllablesInLine(line) {
    const words = line.trim().split(/\s+/).filter(Boolean);
    return words.reduce(function(sum, w) { return sum + countSyllables(w); }, 0);
}

function analyzeRhythm(verse) {
    const lines = verse.split('\n').filter(function(l) { return l.trim().length > 0; });
    if (lines.length === 0) return { counts: [], avg: 0, variance: 0, isConsistent: false };

    const counts = lines.map(function(line) { return countSyllablesInLine(line); });
    const avg = counts.reduce(function(a,b) { return a + b; }, 0) / counts.length;
    const variance = counts.reduce(function(a,b) { return a + Math.pow(b - avg, 2); }, 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        counts: counts,
        avg: avg,
        variance: variance,
        stdDev: stdDev,
        isConsistent: stdDev < 2.5 && counts.every(function(c) { return c >= 8 && c <= 14; })
    };
}





let targetSyllables = 11;
let syllableTolerance = 4;

function updateTargetFromConfig() {
    try {
        if (KESEMPATAN.RapConfig && KESEMPATAN.RapConfig.CONFIG) {
            const cfg = KESEMPATAN.RapConfig.CONFIG;
            if (cfg.TARGET_SYLLABLES) targetSyllables = cfg.TARGET_SYLLABLES;
            if (cfg.SYLLABLE_TOLERANCE) syllableTolerance = cfg.SYLLABLE_TOLERANCE;
        }
    } catch(e) { console.warn('[RapOptimizer] RapConfig lookup failed:', e.message); }
}
updateTargetFromConfig();

const QUALITY_RULES = {
    minWords: 40,
    maxWords: 160,
    minRhymes: 3,
    minPunchlines: 1,
    maxLineLengthVariance: 2.5,
    targetSyllablesPerLine: targetSyllables,
    syllableTolerance: syllableTolerance
};

function detectRhymes(text) {
    const lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
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
                const aEnd = a.slice(-3);
                const bEnd = b.slice(-3);
                if (aEnd === bEnd) rhymeCount++;
            }
        }
    }
    return rhymeCount;
}

function detectPunchlines(text) {
    const lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
    const punchlines = [];
    for (const line of lines) {
        const trimmed = line.trim();
        const words = trimmed.split(/\s+/);
        if (words.length >= 2 && words.length <= 6) {
            punchlines.push(trimmed);
        }
        if (trimmed.includes('!') && words.length < 10) {
            punchlines.push(trimmed);
        }
    }
    return punchlines;
}

function checkQuality(verse) {
    const words = verse.split(/\s+/).filter(Boolean);
    const lines = verse.split('\n').filter(function(l) { return l.trim().length > 0; });
    const rhymes = detectRhymes(verse);
    const punchlines = detectPunchlines(verse);
    const rhythm = analyzeRhythm(verse);
    
    const issues = [];
    const strengths = [];
    
    
    if (words.length < QUALITY_RULES.minWords) {
        issues.push('Terlalu pendek (' + words.length + ' kata)');
    } else if (words.length > QUALITY_RULES.maxWords) {
        issues.push('Terlalu panjang (' + words.length + ' kata)');
    } else {
        strengths.push('Panjang ideal (' + words.length + ' kata)');
    }
    
    
    if (rhymes < QUALITY_RULES.minRhymes) {
        issues.push('Kurang rima (' + rhymes + ' rima)');
    } else {
        strengths.push('Rima bagus (' + rhymes + ' rima)');
    }
    
    
    if (punchlines.length < QUALITY_RULES.minPunchlines) {
        issues.push('Tidak ada punchline kuat');
    } else {
        strengths.push(punchlines.length + ' punchline kuat');
    }
    
    
    if (lines.length >= 4) {
        const lens = lines.map(function(l) { return l.trim().split(/\s+/).length; });
        const mean = lens.reduce(function(a, b) { return a + b; }, 0) / lens.length;
        const variance = lens.reduce(function(a, b) { return a + Math.pow(b - mean, 2); }, 0) / lens.length;
        if (Math.sqrt(variance) < QUALITY_RULES.maxLineLengthVariance) {
            issues.push('Panjang baris terlalu seragam (robotic)');
        } else {
            strengths.push('Variasi panjang baris baik');
        }
    }
    
    
    
    const notes = [];
    if (rhythm.isConsistent) {
        strengths.push('Ritme konsisten (avg ' + rhythm.avg.toFixed(1) + ' suku kata/baris)');
    } else {
        if (rhythm.counts.length > 0) {
            const diff = Math.abs(rhythm.avg - QUALITY_RULES.targetSyllablesPerLine);
            if (diff > QUALITY_RULES.syllableTolerance) {
                notes.push('Rata-rata suku kata (' + rhythm.avg.toFixed(1) + ') jauh dari target (' + QUALITY_RULES.targetSyllablesPerLine + ') — tapi BOLEH jika ekspresi kuat');
            } else {
                notes.push('Variasi suku kata cukup tinggi (stdDev: ' + rhythm.stdDev.toFixed(1) + ')');
            }
        }
    }
    
    
    const cliches = ['aku yang terbaik', 'yo yo', 'siapkan mental', 'kau cuma bayang'];
    let foundCliche = false;
    cliches.forEach(function(c) {
        if (verse.toLowerCase().includes(c)) {
            issues.push('Mengandung klise: "' + c + '"');
            foundCliche = true;
        }
    });
    if (!foundCliche) {
        strengths.push('Bebas klise! Original!');
    }
    
    let score = 100;
    score -= issues.length * 15;
    score = Math.max(0, Math.min(100, score));
    
    return {
        score: score,
        issues: issues,
        notes: notes,
        strengths: strengths,
        wordCount: words.length,
        lineCount: lines.length,
        rhymes: rhymes,
        punchlines: punchlines,
        rhythm: rhythm,
        isProfessional: score >= 75 && strengths.length >= 2  
    };
}





const SYNONYM_DICT = {
    'aku': 'ku',
    'saya': 'ku',
    'kamu': 'kau',
    'kau': 'kamu',
    'dia': 'ia',
    'mereka': 'mereka',
    'kami': 'kita',
    'tidak': 'tak',
    'bukan': 'bukan',
    'akan': 'kan',
    'sudah': 'udah',
    'belum': 'lum',
    'bisa': 'bisa',
    'harus': 'rus',
    'ingin': 'in',
    'mau': 'mau',
    'karena': 'karna',
    'sebab': 'soal',
    'tetapi': 'tapi',
    'tapi': 'tapi',
    'dan': 'dan',
    'atau': 'atau',
    'jika': 'kalau',
    'kalau': 'kalo',
    'maka': 'makanya',
    'sehingga': 'hingga',
    'dengan': 'ngan',
    'kepada': 'pada',
    'pada': 'ke',
    'ke': 'ke',
    'dari': 'dar',
    'daripada': 'dar',
    'untuk': 'tuk',
    'bagi': 'buat',
    'buat': 'buat',
    'seperti': 'perti',
    'sama': 'sama',
    'begitu': 'gitu',
    'demikian': 'gitu',
    'banyak': 'banyak',
    'sedikit': 'dikit',
    'besar': 'gede',
    'kecil': 'cil',
    'baik': 'baik',
    'buruk': 'jelek',
    'baru': 'baru',
    'lama': 'lama',
    'orang': 'orang',
    'manusia': 'manusia',
    'dunia': 'dunia',
    'hidup': 'hidup',
    'mati': 'mati',
    'kata': 'kata',
    'bicara': 'bicara',
    'omong': 'omong',
    'pikir': 'pikir',
    'rasa': 'rasa',
    'waktu': 'waktu',
    'hari': 'hari',
    'malam': 'malam',
    'siang': 'siang',
    'ya': 'yo',
    'oh': 'oh',
    'ah': 'ah',
    'eh': 'eh',
    'adalah': 'alah',
    'merupakan': 'rupanya',
    'sebelum': 'belum',
    'sesudah': 'sudah',
    'antara': 'tara',
    'melalui': 'lewat',
    'tanpa': 'tanpa',
    'terhadap': 'hadap',
    'oleh': 'oleh',
    'sebagai': 'bagai'
};

const EXPAND_DICT = {
    'aku': 'diriku',
    'kau': 'dirimu',
    'dia': 'dirinya',
    'kita': 'kita semua',
    'kami': 'kami semua',
    'mereka': 'mereka semua',
    'tak': 'tidak',
    'kan': 'akan',
    'tuk': 'untuk',
    'ke': 'kepada',
    'dari': 'daripada',
    'ngan': 'dengan',
    'tu': 'itu',
    'ini': 'ini',
    'yo': 'yeah yo',
    'oh': 'oh yeah',
    'ah': 'ah',
    'eh': 'eh'
};

function adjustSyllables(line, target) {
    let words = line.trim().split(/\s+/).filter(Boolean);
    let current = words.reduce(function(sum, w) { return sum + countSyllables(w); }, 0);
    let attempts = 0;
    const maxAttempts = 30;

    while (Math.abs(current - target) > 1 && attempts < maxAttempts) {
        let changed = false;
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const lower = w.toLowerCase();
            if (SYNONYM_DICT[lower]) {
                const newWord = SYNONYM_DICT[lower];
                const oldSyl = countSyllables(w);
                const newSyl = countSyllables(newWord);
                const newTotal = current - oldSyl + newSyl;
                if (Math.abs(newTotal - target) < Math.abs(current - target)) {
                    words[i] = newWord;
                    current = newTotal;
                    changed = true;
                    break;
                }
            }
        }
        if (!changed) break;
        attempts++;
    }

    if (current > target + 1) {
        const stopwords = ['yang', 'dan', 'di', 'ke', 'dari', 'juga', 'saja', 'lagi'];
        for (let i = 0; i < words.length; i++) {
            if (stopwords.includes(words[i].toLowerCase())) {
                const oldSyl = countSyllables(words[i]);
                words.splice(i, 1);
                current -= oldSyl;
                if (Math.abs(current - target) <= 1) break;
                i--;
            }
        }
    }

    if (current < target - 1) {
        for (let i = 0; i < words.length; i++) {
            const lower = words[i].toLowerCase();
            if (EXPAND_DICT[lower]) {
                const newWord = EXPAND_DICT[lower];
                const oldSyl = countSyllables(words[i]);
                const newSyl = countSyllables(newWord);
                const newTotal = current - oldSyl + newSyl;
                if (Math.abs(newTotal - target) < Math.abs(current - target)) {
                    words[i] = newWord;
                    current = newTotal;
                    if (Math.abs(current - target) <= 1) break;
                }
            }
        }
    }

    if (current < target - 1) {
        const yo = 'yo';
        const sylYo = countSyllables(yo);
        if (Math.abs(current + sylYo - target) < Math.abs(current - target)) {
            words.unshift(yo);
            current += sylYo;
        }
    }

    if (current < target - 1) {
        const yeah = 'yeah';
        const sylYeah = countSyllables(yeah);
        if (Math.abs(current + sylYeah - target) < Math.abs(current - target)) {
            words.push(yeah);
            current += sylYeah;
        }
    }

    return words.join(' ');
}

function optimizeVerse(verse, issues) {
    let optimized = verse;
    const lines = optimized.split('\n').filter(function(l) { return l.trim().length > 0; });
    
    
    if (issues.some(function(i) { return i.includes('panjang'); })) {
        const newLines = [];
        for (const line of lines) {
            const words = line.trim().split(/\s+/);
            if (words.length > 12) {
                const mid = Math.floor(words.length / 2);
                newLines.push(words.slice(0, mid).join(' '));
                newLines.push(words.slice(mid).join(' '));
            } else {
                newLines.push(line);
            }
        }
        optimized = newLines.join('\n');
    }
    
    
    if (issues.some(function(i) { return i.includes('punchline'); })) {
        const lastLine = lines[lines.length - 1];
        if (!lastLine.includes('!')) {
            lines[lines.length - 1] = lastLine + '!';
        }
        optimized = lines.join('\n');
    }
    
    
    if (issues.some(function(i) { return i.includes('rima'); })) {
        const rhymeWords = ['bang', 'lang', 'tang', 'rang', 'dang', 'sang'];
        const newLines = lines.map(function(line, i) {
            const trimmed = line.trim();
            if (i < lines.length - 1 && !trimmed.includes(rhymeWords[i % rhymeWords.length])) {
                return trimmed + ' ' + rhymeWords[i % rhymeWords.length];
            }
            return line;
        });
        optimized = newLines.join('\n');
    }

    
    const rhythmIssues = issues.some(function(i) { 
        return i.includes('jauh dari target') || i.includes('stdDev'); 
    });
    if (rhythmIssues) {
        const target = QUALITY_RULES.targetSyllablesPerLine;
        const newLines = optimized.split('\n').filter(function(l) { return l.trim().length > 0; });
        const adjusted = newLines.map(function(line) {
            const current = countSyllablesInLine(line);
            
            if (Math.abs(current - target) > QUALITY_RULES.syllableTolerance + 1) {
                return adjustSyllables(line, target);
            }
            return line;
        });
        optimized = adjusted.join('\n');
    }
    
    return optimized;
}





const LearningEngine = {
    _history: [],
    _punchlineWeights: {},
    _strategyWeights: {},
    _maxHistory: 50,
    
    _init: function() {
        try {
            const saved = localStorage.getItem('rap_learning_data');
            if (saved) {
                const data = JSON.parse(saved);
                this._history = data.history || [];
                this._punchlineWeights = data.punchlineWeights || {};
                this._strategyWeights = data.strategyWeights || {};
            }
        } catch(e) { console.warn('[RapOptimizer] Load learning data failed:', e.message); }
        if (window.KESEMPATAN?.KesDatabase?.migrateLegacySnapshotOnce) {
            window.KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce('rap_learning_data', 'rap_learning_data');
        }
    },
    
    learn: function(battleResult) {
        this._history.push({
            topic: battleResult.topic,
            winner: battleResult.winner,
            strategy: battleResult.strategy || 'unknown',
            timestamp: Date.now()
        });
        
        if (this._history.length > this._maxHistory) {
            this._history = this._history.slice(-this._maxHistory);
        }
        
        if (battleResult.winner) {
            const strategy = battleResult.strategy || 'unknown';
            this._strategyWeights[strategy] = (this._strategyWeights[strategy] || 0) + 1;
        }
        
        this._save();
    },
    
    getLessons: function() {
        const total = Object.values(this._strategyWeights).reduce(function(a, b) { return a + b; }, 0);
        const bestStrategy = Object.entries(this._strategyWeights)
            .sort(function(a, b) { return b[1] - a[1]; })[0];
        
        const recentBattles = this._history.slice(-10);
        const winRate = recentBattles.filter(function(b) { 
            return b.winner === 'agentA' || b.winner === 'agentB'; 
        }).length / (recentBattles.length || 1);
        
        return {
            totalBattles: this._history.length,
            bestStrategy: bestStrategy ? bestStrategy[0] : 'balanced',
            strategyConfidence: bestStrategy ? Math.round((bestStrategy[1] / total) * 100) : 50,
            recentWinRate: Math.round(winRate * 100),
            advice: this._generateAdvice()
        };
    },
    
    _generateAdvice: function() {
        const lessons = this.getLessons();
        if (lessons.totalBattles < 3) {
            return 'Belum cukup data untuk saran. Lakukan lebih banyak battle!';
        }
        if (lessons.recentWinRate > 70) {
            return 'Strategi ' + lessons.bestStrategy + ' sangat efektif! Pertahankan!';
        }
        if (lessons.recentWinRate < 30) {
            return 'Strategi saat ini kurang efektif. Coba variasi baru!';
        }
        return 'Terus bereksperimen dengan strategi berbeda.';
    },
    
    _save: function() {
        try {
            const snapshot = {
                history: this._history,
                punchlineWeights: this._punchlineWeights,
                strategyWeights: this._strategyWeights
            };
            localStorage.setItem('rap_learning_data', JSON.stringify(snapshot));
            if (window.KESEMPATAN?.KesDatabase?.mirrorSnapshot) {
                window.KESEMPATAN.KesDatabase.mirrorSnapshot('rap_learning_data', snapshot);
            }
        } catch(e) { console.warn('[RapOptimizer] Save learning data failed:', e.message); }
    }
};

LearningEngine._init();





export const RapOptimizerEngine = {
    LearningEngine: LearningEngine,
    optimizeVerse: optimizeVerse,
    checkQuality: checkQuality,
    QUALITY_RULES: QUALITY_RULES,
    detectRhymes: detectRhymes,
    detectPunchlines: detectPunchlines,
    countSyllables: countSyllables,
    countSyllablesInLine: countSyllablesInLine,
    analyzeRhythm: analyzeRhythm,
    adjustSyllables: adjustSyllables,
    SYLLABLE_OVERRIDES: SYLLABLE_OVERRIDES,
    SYNONYM_DICT: SYNONYM_DICT,
    EXPAND_DICT: EXPAND_DICT,
    updateTargetFromConfig: updateTargetFromConfig
};

KESEMPATAN.RapOptimizerEngine = RapOptimizerEngine;

import { CONFIG, AUTO_TRIGGER_CONFIG, CATEGORIES } from './observ-config.js';
import { Observation } from './observ-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = Observation;

const state = OBS.getState();
const autoTriggerState = state.autoTriggerState;

const SENTIMENT_WORDS = {
    sangat_positif: [
        'gemilang', 'luar biasa', 'fantastis', 'spektakuler', 'terbaik',
        'revolusioner', 'mengguncang', 'dominan', 'moncer', 'cetak rekor'
    ],
    positif: [
        'baik', 'naik', 'tumbuh', 'meningkat', 'sukses', 'cerah',
        'positif', 'maju', 'untung', 'rekor', 'baru', 'tembus',
        'melonjak', 'stabil', 'tinggi', 'kuat', 'pesat', 'berhasil',
        'potensial', 'prospek', 'optimis', 'terus', 'gemilang'
    ],
    negatif: [
        'buruk', 'turun', 'krisis', 'gagal', 'konflik', 'ancaman',
        'jatuh', 'negatif', 'berhenti', 'tutup', 'rugi', 'berisiko',
        'hancur', 'melemah', 'rendah', 'lemah', 'berat', 'menurun',
        'memburuk', 'stagnan'
    ],
    sangat_negatif: [
        'bencana', 'kiamat', 'gawat', 'darurat', 'runtuh', 'ambruk',
        'kritis', 'mengerikan', 'tragis', 'parah', 'memprihatinkan'
    ]
};

function analyzeSentiment(text) {
    const lower = text.toLowerCase();
    let score = 0;

    const negations = ['tidak', 'bukan', 'kurang', 'tanpa', 'belum'];
    const words = lower.split(/\s+/);
    let skipNext = 0;

    for (let i = 0; i < words.length; i++) {
        if (skipNext > 0) { skipNext--; continue; }
        const word = words[i];
        if (negations.includes(word) && i + 1 < words.length) {
            const nextWord = words[i + 1];
            let weight = getWordWeight(nextWord);
            if (weight !== 0) {
                score -= weight;
                skipNext = 1;
                continue;
            }
        }
        score += getWordWeight(word);
    }

    const total = words.length;
    const normalized = total > 0 ? Math.max(-2, Math.min(2, score / (total / 10))) : 0;

    if (normalized > 0.5) return { label: 'positif', emoji: 'smile', color: '#00C97C' };
    if (normalized < -0.5) return { label: 'negatif', emoji: 'frown', color: '#6C86C4' };
    return { label: 'netral', emoji: 'meh', color: '#C99A2E' };
}

function getWordWeight(word) {
    if (SENTIMENT_WORDS.sangat_positif.includes(word)) return CONFIG.SENTIMENT.STRONG_POSITIVE;
    if (SENTIMENT_WORDS.positif.includes(word)) return CONFIG.SENTIMENT.POSITIVE_WEIGHT;
    if (SENTIMENT_WORDS.negatif.includes(word)) return CONFIG.SENTIMENT.NEGATIVE_WEIGHT;
    if (SENTIMENT_WORDS.sangat_negatif.includes(word)) return CONFIG.SENTIMENT.STRONG_NEGATIVE;
    return 0;
}

function analyzeSignal(signal) {
    const sentiment = analyzeSentiment(signal.title + ' ' + signal.desc);
    const cfg = CATEGORIES[signal.category] || { color: '#8A94A6', emoji: 'newspaper', score: 50 };

    let confidence = cfg.score || 70;
    if (sentiment.label === 'positif') confidence += 15;
    if (sentiment.label === 'negatif') confidence -= 10;
    if (signal.desc && signal.desc.length > 50) confidence += 5;
    if (signal.title.includes('💰') || signal.title.includes('🚀') || signal.title.includes('📈')) confidence += 5;
    confidence = Math.min(95, Math.max(40, confidence));

    return {
        ...signal,
        sentiment: sentiment,
        confidence: confidence,
        isFavorite: state.favorites.includes(signal.id)
    };
}

function getCategoryStats(signals) {
    const stats = {};
    for (const s of signals) {
        stats[s.category] = (stats[s.category] || 0) + 1;
    }
    return stats;
}

function generateAIInsight(signals) {
    if (!signals || signals.length === 0) {
        return {
            summary: 'Belum ada data sinyal untuk dianalisis.',
            prediction: 'Belum cukup data untuk prediksi.'
        };
    }

    const analyzedAll = signals.map(s => ({ s, a: analyzeSignal(s) }));
    const total = analyzedAll.length;

    const posCount = analyzedAll.filter(x => x.a.sentiment.label === 'positif').length;
    const negCount = analyzedAll.filter(x => x.a.sentiment.label === 'negatif').length;
    const netCount = total - posCount - negCount;

    let sentimentSkew = 'netral';
    let skewCount = netCount;
    if (posCount > negCount && posCount > netCount) { sentimentSkew = 'positif'; skewCount = posCount; }
    else if (negCount > posCount && negCount > netCount) { sentimentSkew = 'negatif'; skewCount = negCount; }

    const catCount = {};
    analyzedAll.forEach(x => catCount[x.s.category] = (catCount[x.s.category] || 0) + 1);
    const catEntries = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
    const dominantCat = catEntries.length > 0 ? catEntries[0] : null;

    const avgConfidence = Math.round(
        analyzedAll.reduce((sum, x) => sum + x.a.confidence, 0) / total
    );

    const today = new Date();
    const dayCounts = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const count = signals.filter(s => new Date(s.timestamp).toDateString() === d.toDateString()).length;
        dayCounts.push(count);
    }
    const firstHalf = dayCounts.slice(0, 3).reduce((a, b) => a + b, 0);
    const secondHalf = dayCounts.slice(4).reduce((a, b) => a + b, 0);
    let momentum = 'stabil';
    if (secondHalf > firstHalf) momentum = 'meningkat';
    else if (secondHalf < firstHalf) momentum = 'menurun';

    const skewPct = total > 0 ? Math.round((skewCount / total) * 100) : 0;
    const summary = `Dari ${total} sinyal, mayoritas bersentimen <strong>${sentimentSkew}</strong> (${skewPct}%)` +
        (dominantCat ? `, didominasi kategori <strong>${dominantCat[0]}</strong> (${dominantCat[1]} sinyal)` : '') +
        `. Rata-rata confidence <strong>${avgConfidence}%</strong>.`;

    const prediction = momentum === 'meningkat'
        ? `Volume sinyal cenderung <strong>meningkat</strong>${dominantCat ? ` di kategori ${dominantCat[0]}` : ''} — momentum sedang naik, pertimbangkan pantau lebih intensif.`
        : momentum === 'menurun'
        ? `Volume sinyal cenderung <strong>menurun</strong> — minat/perhatian terhadap topik ini mulai mereda.`
        : `Volume sinyal relatif <strong>stabil</strong> dalam 7 hari terakhir.`;

    return { summary, prediction };
}

function loadAutoTriggerPrefs() {
    try {
        const saved = localStorage.getItem('kes_obs_auto_trigger');
        if (saved) {
            const parsed = JSON.parse(saved);
            AUTO_TRIGGER_CONFIG.enabled = parsed.enabled !== undefined ? parsed.enabled : true;
            AUTO_TRIGGER_CONFIG.minConfidence = parsed.minConfidence || 85;
        }
    } catch(e) { console.warn('[ObsAnalyzer] loadAutoTriggerPrefs failed:', e.message); }
}

function saveAutoTriggerPrefs() {
    try {
        localStorage.setItem('kes_obs_auto_trigger', JSON.stringify({
            enabled: AUTO_TRIGGER_CONFIG.enabled,
            minConfidence: AUTO_TRIGGER_CONFIG.minConfidence
        }));
    } catch(e) { console.warn('[ObsAnalyzer] saveAutoTriggerPrefs failed:', e.message); }
}

function saveTriggerHistory(signal, analyzed) {
    try {
        const history = JSON.parse(localStorage.getItem('kes_obs_trigger_history') || '[]');
        const entry = {
            timestamp: Date.now(),
            title: signal.title,
            confidence: analyzed.confidence,
            sentiment: analyzed.sentiment.label,
            category: signal.category,
            source: signal.source
        };
        history.unshift(entry);
        if (history.length > 20) history.pop();
        localStorage.setItem('kes_obs_trigger_history', JSON.stringify(history));
        
        if (window.KESEMPATAN?.KesDatabase?.mirrorHistoryItem) {
            window.KESEMPATAN.KesDatabase.mirrorHistoryItem('obs_trigger_history', entry);
        }
    } catch (e) {
        console.warn('[Observation] Save trigger history failed:', e.message);
    }
}

function showTriggerHistory() {
    const history = JSON.parse(localStorage.getItem('kes_obs_trigger_history') || '[]');
    if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
        window.KESEMPATAN.KesDatabase.migrateArrayOnce('obs_trigger_history', history);
    }
    if (history.length === 0) {
        OBS.showToast('Belum ada auto-trigger', 'info');
        return;
    }
    let msg = 'Auto-Trigger History:\n';
    history.forEach((h, i) => {
        msg += `${i+1}. ${h.title.substring(0,40)} | ${h.confidence}% | ${new Date(h.timestamp).toLocaleString()}\n`;
    });
    OBS.showToast(msg, 'info');
}

async function autoTriggerWorkflow(signal) {
    if (!AUTO_TRIGGER_CONFIG.enabled) return false;
    if (autoTriggerState.isProcessing) return false;
    if (autoTriggerState.triggerCount >= AUTO_TRIGGER_CONFIG.maxPerSession) {
        OBS.showToast('Auto-trigger limit reached (' + AUTO_TRIGGER_CONFIG.maxPerSession + ')', 'warning');
        return false;
    }

    const now = Date.now();
    if (now - autoTriggerState.lastTrigger < AUTO_TRIGGER_CONFIG.cooldownMs) return false;

    const analyzed = analyzeSignal(signal);
    if (analyzed.confidence < AUTO_TRIGGER_CONFIG.minConfidence) return false;
    if (analyzed.sentiment.label !== AUTO_TRIGGER_CONFIG.sentimentRequired) return false;

    if (!window.KESEMPATAN?.WorkflowEngine || window.KESEMPATAN?.WorkflowEngine.isRunning()) return false;

    autoTriggerState.isProcessing = true;
    autoTriggerState.lastTrigger = now;
    autoTriggerState.triggerCount++;

    OBS.showToast('Auto-trigger: "' + signal.title.substring(0, 40) + '..."', 'success');

    try {
        const payload = {
            topic: signal.title,
            instruction: `Auto-triggered from Observation Engine\n\nSinyal: ${signal.title}\nDeskripsi: ${signal.desc}\nKategori: ${signal.category}\nConfidence: ${analyzed.confidence}%\nSentimen: ${analyzed.sentiment.label}\n\nLakukan analisis mendalam untuk peluang ini.`
        };
        await window.KESEMPATAN?.WorkflowEngine.start(payload, '');
        saveTriggerHistory(signal, analyzed);
        OBS.showToast('Auto-analysis completed for: ' + signal.title.substring(0, 30), 'success');
    } catch (err) {
        OBS.showToast('Auto-trigger failed: ' + err.message, 'error');
    } finally {
        autoTriggerState.isProcessing = false;
    }
    return true;
}

OBS.analyzeSentiment = analyzeSentiment;
OBS.analyzeSignal = analyzeSignal;
OBS.getCategoryStats = getCategoryStats;
OBS.generateAIInsight = generateAIInsight;
OBS.loadAutoTriggerPrefs = loadAutoTriggerPrefs;
OBS.saveAutoTriggerPrefs = saveAutoTriggerPrefs;
OBS.saveTriggerHistory = saveTriggerHistory;
OBS.showTriggerHistory = showTriggerHistory;
OBS.autoTriggerWorkflow = autoTriggerWorkflow;
OBS.autoTriggerState = autoTriggerState;

KESEMPATAN.Observation = OBS;

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// SOFTMAX (numerically stable) — duplikat kecil disengaja, sama
// seperti alasan llm-runtime.js: llm-sampler.js tidak WAJIB bergantung ke
// llm-attention.js cuma buat softmax dasar.
// ============================================================
function softmax(row) {
    let max = -Infinity;
    for (let i = 0; i < row.length; i++) {
        if (row[i] > max) max = row[i];
    }
    const exps = row.map(function (x) { return Math.exp(x - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
}

function argmax(row) {
    let bestIdx = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < row.length; i++) {
        if (row[i] > bestVal) {
            bestVal = row[i];
            bestIdx = i;
        }
    }
    return bestIdx;
}

function sampleFromProbabilities(probabilities) {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (r <= cumulative) {
            return i;
        }
    }
    return probabilities.length - 1; // jaga-jaga pembulatan floating point
}

// ============================================================
// STRATEGI 1: GREEDY — selalu ambil logit tertinggi, deterministik
// ============================================================
function greedySample(logits) {
    return argmax(logits);
}

// ============================================================
// STRATEGI 2: TEMPERATURE — skala logits sebelum softmax.
// temperature < 1 → lebih "yakin"/tajam, > 1 → lebih acak/kreatif
// ============================================================
function temperatureSample(logits, temperature) {
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = softmax(scaled);
    return sampleFromProbabilities(probs);
}

// ============================================================
// STRATEGI 3: TOP-K — cuma pertimbangkan K token dengan logit
// tertinggi, sisanya dibuang sebelum sampling.
// ============================================================
function topKSample(logits, k, temperature) {
    k = Math.max(1, Math.min(k, logits.length));
    const indexed = logits.map(function (v, i) { return { v: v, i: i }; });
    indexed.sort(function (a, b) { return b.v - a.v; });
    const topIndices = indexed.slice(0, k).map(function (e) { return e.i; });

    const filtered = logits.map(function (v, i) {
        return topIndices.includes(i) ? v : -Infinity;
    });

    const T = Math.max(1e-6, temperature);
    const scaled = filtered.map(function (v) { return v === -Infinity ? -Infinity : v / T; });
    const probs = softmax(scaled);
    return sampleFromProbabilities(probs);
}

// ============================================================
// STRATEGI 4: TOP-P / NUCLEUS — urutkan probabilitas menurun,
// pertahankan himpunan terkecil yang jumlah kumulatifnya >= p.
// ============================================================
function topPSample(logits, p, temperature) {
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = softmax(scaled);

    const indexed = probs.map(function (prob, i) { return { prob: prob, i: i }; });
    indexed.sort(function (a, b) { return b.prob - a.prob; });

    let cumulative = 0;
    const nucleus = [];
    for (let n = 0; n < indexed.length; n++) {
        nucleus.push(indexed[n]);
        cumulative += indexed[n].prob;
        if (cumulative >= p) {
            break;
        }
    }

    const nucleusSum = nucleus.reduce(function (sum, e) { return sum + e.prob; }, 0);
    const renormalized = nucleus.map(function (e) { return e.prob / nucleusSum; });

    const chosenLocal = sampleFromProbabilities(renormalized);
    return nucleus[chosenLocal].i;
}

// ============================================================
// REPETITION PENALTY — turunkan logit token yang sudah muncul di
// sequence yang baru digenerate (CTRL-style: logit positif dibagi
// penalty, logit negatif dikali penalty, supaya keduanya bergerak
// ke arah "kurang mungkin dipilih lagi"). penalty=1 = tidak ada efek.
// ============================================================
function applyRepetitionPenalty(logits, recentTokenIds, penalty) {
    if (!penalty || penalty === 1 || !recentTokenIds || recentTokenIds.length === 0) {
        return logits;
    }
    const seen = new Set(recentTokenIds);
    return logits.map(function (v, i) {
        if (!seen.has(i)) return v;
        return v > 0 ? v / penalty : v * penalty;
    });
}

// ============================================================
// DISPATCHER
// ============================================================
// options.strategy: 'greedy' | 'temperature' | 'topK' | 'topP' (default 'temperature')
// options.repetitionPenalty + options.recentTokenIds: opsional, diterapkan
// ke logits SEBELUM strategi pemilihan token manapun (termasuk greedy).
function sample(logits, options) {
    options = options || {};
    const strategy = options.strategy || 'temperature';
    const temperature = typeof options.temperature === 'number' ? options.temperature : 0.8;
    const penalizedLogits = applyRepetitionPenalty(logits, options.recentTokenIds, options.repetitionPenalty);

    switch (strategy) {
        case 'greedy':
            return greedySample(penalizedLogits);
        case 'topK':
            return topKSample(penalizedLogits, options.k || 40, temperature);
        case 'topP':
            return topPSample(penalizedLogits, options.p || 0.9, temperature);
        case 'temperature':
            return temperatureSample(penalizedLogits, temperature);
        default:
            throw new Error('[LLMSampler] strategy "' + strategy + '" tidak dikenal');
    }
}

export const LLMSampler = {
    softmax: softmax,
    argmax: argmax,
    greedySample: greedySample,
    temperatureSample: temperatureSample,
    topKSample: topKSample,
    topPSample: topPSample,
    applyRepetitionPenalty: applyRepetitionPenalty,
    sample: sample
};

window.LLMSampler = LLMSampler;

Logger.info('LLMSampler', 'llm-sampler.js loaded');

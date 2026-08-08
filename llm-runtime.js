/* ============================================================
KESEMPATAN OS - KESEMPATAN LLM
📁 kesem-llm/llm-runtime.js
🔥 Titik kumpul: bikin model (tokenizer+vocab+bobot), jalankan
context window, loop generate token demi token.
🔧 TAHAP 2 (anti-macet): generate() sekarang ASYNC dan melepas
kendali ke event loop (setTimeout(0)) tiap beberapa token, supaya
browser sempat menggambar & membaca klik di sela perhitungan —
layar TIDAK LAGI beku total saat LLM lokal bekerja. Total waktu
generate hampir sama, tapi UI tetap hidup. generate() juga
menghormati options.stopSignal (objek {stopped:true} atau fungsi
→ boolean) supaya loop bisa diputus dari luar; wiring tombol STOP
ke stopSignal dipasang terpisah (TAHAP 3), infrastruktur di sini
sudah siap.
🔥 100% const, Zero console.log, guard idempotensi.
============================================================ */
(function () {
'use strict';
if (window.__LLMRuntimeLoaded) {
    return;
}
window.__LLMRuntimeLoaded = true;
const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireDeps() {
    const missing = ['LLMConfig', 'LLMTokenizer', 'LLMVocabulary', 'LLMEmbedding', 'LLMInference']
        .filter(function (name) { return !window[name]; });
    if (missing.length > 0) {
        throw new Error('[LLMRuntime] Modul belum dimuat: ' + missing.join(', '));
    }
    return {
        Config: window.LLMConfig,
        Tokenizer: window.LLMTokenizer,
        Vocabulary: window.LLMVocabulary,
        Inference: window.LLMInference
    };
}
// ============================================================
// BUAT MODEL
// ============================================================
async function createModel(options) {
    const { Config, Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    if (!Array.isArray(options.corpus) || options.corpus.length === 0) {
        throw new Error('[LLMRuntime] createModel butuh options.corpus (array teks buat latih tokenizer)');
    }
    const config = Config.createConfig(options.configOptions || {});
    const numMerges = Math.max(1, config.model.vocabSize - 4 - 256);
    const bpeResult = await Tokenizer.trainBPE(options.corpus, numMerges, { yieldEvery: options.yieldEvery });
    const vocab = Vocabulary.buildVocabulary(
        bpeResult.vocab,
        config.specialTokens,
        config.specialTokenIds,
        config.model.vocabSize
    );
    const weights = Inference.createModelWeights(config.model);
    return {
        config: config,
        merges: bpeResult.merges,
        vocab: vocab,
        embeddingMatrix: weights.embeddingMatrix,
        decoderWeights: weights.decoderWeights
    };
}
// ============================================================
// SAMPLING DASAR
// ============================================================
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
function sampleWeighted(probabilities) {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (r <= cumulative) {
            return i;
        }
    }
    return probabilities.length - 1;
}
// Q1 (Juli 2026, DIPERBAIKI setelah verifikasi empiris menunjukkan mask
// awal tidak cukup): mask SEMUA id yang TIDAK punya token nyata di
// vocab.idToToken — bukan cuma unkId literal. decode() (llm-vocabulary.js)
// mengembalikan string "<unk>" utk id APAPUN yang tidak ada di map, dan
// BPE sering menghasilkan vocabulary AKTUAL lebih kecil dari vocabSize
// yang dikonfigurasi (banyak id di ujung atas TIDAK PERNAH dipetakan ke
// token nyata) — model bisa memilih id "kosong" itu, semuanya decode
// jadi <unk> walau bukan unkId resmi. Daftar id valid dihitung SEKALI
// per model (cache di closure, bukan per-token) demi performa.
const validIdCache = new WeakMap();
function getInvalidIdMask(vocab, vocabSize) {
    let cached = validIdCache.get(vocab);
    if (cached) return cached;
    const invalidIds = [];
    for (let id = 0; id < vocabSize; id++) {
        if (!vocab.idToToken.has(id)) invalidIds.push(id);
    }
    validIdCache.set(vocab, invalidIds);
    return invalidIds;
}
function maskSpecialTokens(logits, vocab) {
    const masked = logits.slice();
    if (typeof vocab.unkId === 'number') masked[vocab.unkId] = -Infinity;
    if (typeof vocab.padId === 'number') masked[vocab.padId] = -Infinity;
    if (typeof vocab.bosId === 'number') masked[vocab.bosId] = -Infinity;
    // Blokir SEMUA id tanpa token nyata (akar masalah sebenarnya —
    // lihat catatan di atas), bukan cuma id spesial yang bernama.
    const invalidIds = getInvalidIdMask(vocab, logits.length);
    for (let i = 0; i < invalidIds.length; i++) {
        masked[invalidIds[i]] = -Infinity;
    }
    return masked;
}
function sampleNextToken(logits, temperature, greedy) {
    if (greedy) {
        return argmax(logits);
    }
    if (window.LLMSampler) {
        return window.LLMSampler.sample(logits, { strategy: 'topP', p: 0.9, temperature: temperature });
    }
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = window.LLMAttention ? window.LLMAttention.softmaxRow(scaled) : softmaxFallback(scaled);
    return sampleWeighted(probs);
}
function softmaxFallback(row) {
    const max = Math.max.apply(null, row);
    const exps = row.map(function (x) { return Math.exp(x - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
}
// ============================================================
// STOP SIGNAL — baca dari options.stopSignal (objek atau fungsi)
// ============================================================
function isStopped(options) {
    if (!options) {
        return false;
    }
    const s = options.stopSignal;
    if (!s) {
        return false;
    }
    if (typeof s === 'function') {
        return !!s();
    }
    if (typeof s === 'object') {
        return !!s.stopped;
    }
    return false;
}
// ============================================================
// GENERATE — loop token demi token (ASYNC, tidak membekukan UI)
// ============================================================
// options: { maxNewTokens, temperature, greedy, yieldEvery, stopSignal }
// yieldEvery: lepas kendali ke browser tiap sekian token (default 1 =
//   tiap token, paling responsif). Satu forward pass tetap sinkron,
//   tapi jeda antar-token membuat layar bisa scroll & klik diproses.
// stopSignal: objek {stopped:true} atau fungsi ()=>boolean; kalau true
//   di awal suatu langkah, loop berhenti (stoppedBySignal=true).
async function generate(model, promptText, options) {
    const { Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const pieces = Tokenizer.tokenize(promptText, model.merges);
    const promptIds = Vocabulary.encode(pieces, model.vocab);
    let ids = [model.vocab.bosId].concat(promptIds);
    if (ids.length >= model.config.model.maxContextLength) {
        ids = ids.slice(ids.length - model.config.model.maxContextLength + 1);
    }
    const generatedIds = [];
    let stoppedAtEos = false;
    let stoppedBySignal = false;
    for (let step = 0; step < maxNewTokens; step++) {
        if (isStopped(options)) {
            stoppedBySignal = true;
            break;
        }
        if (ids.length >= model.config.model.maxContextLength) {
            break;
        }
        const logits = Inference.getNextTokenLogits(ids, model, model.config.model);
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab), temperature, greedy);
        if (nextId === model.vocab.eosId) {
            stoppedAtEos = true;
            break;
        }
        ids.push(nextId);
        generatedIds.push(nextId);
        if ((step + 1) % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
    }
    const generatedPieces = Vocabulary.decode(generatedIds, model.vocab);
    const text = Tokenizer.detokenize(generatedPieces);
    return {
        text: text,
        tokenIds: generatedIds,
        tokensGenerated: generatedIds.length,
        stoppedAtEos: stoppedAtEos,
        stoppedBySignal: stoppedBySignal
    };
}
// Versi KV-CACHE dari generate() — panggilan PERTAMA proses seluruh
// prompt sekali (bangun cache awal), langkah SELANJUTNYA cuma proses 1
// token baru lewat forwardCached() (bukan mengulang seluruh sequence
// yang terus tumbuh tiap langkah seperti generate() lama). Solusi O(n)
// menggantikan O(n²) — inilah akar lambatnya generate() sebelumnya.
// generate() lama TIDAK diubah/dihapus, tetap tersedia sbg referensi.
async function generateCached(model, promptText, options) {
    const { Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const pieces = Tokenizer.tokenize(promptText, model.merges);
    const promptIds = Vocabulary.encode(pieces, model.vocab);
    let ids = [model.vocab.bosId].concat(promptIds);
    // FIX ROOT CAUSE SEBENARNYA (Juli 2026, ditemukan dari laporan
    // pengguna nyata): panggilan PERTAMA forwardCached() (di bawah)
    // memproses SELURUH prompt tanpa cache (belum ada apa pun utk
    // di-cache) — biayanya O(promptLen²), TIDAK terbantu KV-cache
    // sama sekali (cache cuma membantu token SETELAH prompt). Prompt
    // agen ASLI (~422 token, bukan prompt pendek uji coba sebelumnya)
    // bikin langkah ini sendiri makan puluhan detik di SKALA MANAPUN
    // (diukur: 24,6 detik di preset medium, 37 detik di large) —
    // inilah akar lambat sebenarnya, BUKAN soal ukuran model semata.
    // Dibatasi khusus jalur lokal, simpan bagian AKHIR prompt (biasanya
    // berisi topik/instruksi spesifik, bukan cuma system prompt umum).
    // FIX (Juli 2026, rekomendasi eksternal yang tepat): truncation
    // SEBELUMNYA cuma simpan bagian AKHIR prompt — tapi identitas agen
    // ("Anda adalah RahmadRaharjo, agen analisis...") ada di system
    // prompt di AWAL (lihat buildPrompt() di workflow.js), bukan di
    // akhir. Simpan-akhir-saja membuang identitas agen, kemungkinan
    // penyebab jawaban terasa generik/kurang sesuai karakter masing2
    // agen. MIDDLE TRUNCATION: simpan AWAL (identitas+instruksi inti)
    // DAN AKHIR (topik+format output yang diminta), buang bagian TENGAH
    // (biasanya few-shot examples — panjang tapi kurang kritis
    // dibanding identitas & instruksi output).
    const LOCAL_MAX_PROMPT_TOKENS = 150;
    if (ids.length > LOCAL_MAX_PROMPT_TOKENS) {
        const headLen = Math.floor(LOCAL_MAX_PROMPT_TOKENS * 0.4); // ~40% utk identitas/awal
        const tailLen = LOCAL_MAX_PROMPT_TOKENS - headLen - 1; // sisanya utk topik/akhir (−1 utk BOS)
        const head = ids.slice(1, 1 + headLen); // lewati BOS lama, diambil lagi di bawah
        const tail = ids.slice(ids.length - tailLen);
        ids = [model.vocab.bosId].concat(head, tail);
    }
    if (ids.length >= model.config.model.maxContextLength) {
        ids = ids.slice(ids.length - model.config.model.maxContextLength + 1);
    }

    // Panggilan PERTAMA: proses SELURUH prompt sekali, bangun cache awal.
    let result = Inference.forwardCached(ids, model, model.config.model, null, 0);
    let layerCaches = result.layerCaches;
    let positionOffset = ids.length;

    const generatedIds = [];
    let stoppedAtEos = false;
    let stoppedBySignal = false;
    for (let step = 0; step < maxNewTokens; step++) {
        if (isStopped(options)) {
            stoppedBySignal = true;
            break;
        }
        if (positionOffset >= model.config.model.maxContextLength) {
            break;
        }
        const logits = result.logits[result.logits.length - 1];
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab), temperature, greedy);
        if (nextId === model.vocab.eosId) {
            stoppedAtEos = true;
            break;
        }
        generatedIds.push(nextId);
        if ((step + 1) % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        if (step + 1 >= maxNewTokens) {
            break; // token terakhir sudah di-sample, tidak perlu forward lagi
        }
        // Langkah SELANJUTNYA: cuma proses token BARU yang baru di-sample
        // (1 token), pakai & perbarui cache — BUKAN mengulang seluruh
        // sequence dari awal.
        result = Inference.forwardCached([nextId], model, model.config.model, layerCaches, positionOffset);
        layerCaches = result.layerCaches;
        positionOffset += 1;
    }
    const generatedPieces = Vocabulary.decode(generatedIds, model.vocab);
    const text = Tokenizer.detokenize(generatedPieces);
    return {
        text: text,
        tokenIds: generatedIds,
        tokensGenerated: generatedIds.length,
        stoppedAtEos: stoppedAtEos,
        stoppedBySignal: stoppedBySignal
    };
}
window.LLMRuntime = {
    createModel: createModel,
    generate: generate,
    generateCached: generateCached,
    sampleNextToken: sampleNextToken,
    argmax: argmax
};
Logger.info('LLMRuntime', 'llm-runtime.js loaded');
})();
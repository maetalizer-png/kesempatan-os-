/* ============================================================
KESEMPATAN OS - KESEMPATAN LLM
📁 kesem-llm/llm-core.js
🔥 MAIN CLASS — orkestrasi level tinggi: inisialisasi model
(baru atau dari checkpoint tersimpan), generate teks, train,
simpan/muat. Ini "instance" yang dipakai llm-api.js di baliknya.
Pola sama seperti memory/llm-core.js (MAIN CLASS VectorMemoryV5).
🔥 100% const, Zero console.log, guard idempotensi.
============================================================ */
(function () {
'use strict';
if (window.__LLMCoreLoaded) {
    return;
}
window.__LLMCoreLoaded = true;
const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireDeps() {
    const missing = ['LLMRuntime', 'LLMCheckpoint', 'LLMTrainer', 'LLMTokenizer']
        .filter(function (name) { return !window[name]; });
    if (missing.length > 0) {
        throw new Error('[LLMCore] Modul belum dimuat: ' + missing.join(', '));
    }
    return {
        Runtime: window.LLMRuntime,
        Checkpoint: window.LLMCheckpoint,
        Trainer: window.LLMTrainer,
        Tokenizer: window.LLMTokenizer
    };
}
let activeModel = null;
// ============================================================
// INISIALISASI
// ============================================================
async function initialize(options) {
    const { Runtime, Checkpoint, Trainer, Tokenizer } = requireDeps();
    options = options || {};
    if (options.fromCheckpoint) {
        const saved = await Checkpoint.loadCheckpointFromStorage(options.fromCheckpoint);
        if (saved) {
            activeModel = Checkpoint.restoreModelFromCheckpoint(saved);
            Logger.info('LLMCore', 'Model dipulihkan dari checkpoint "' + options.fromCheckpoint + '"');
            return activeModel;
        }
        Logger.warn('LLMCore', 'Checkpoint "' + options.fromCheckpoint + '" tidak ditemukan, bikin model baru');
    }
    if (!options.corpus) {
        throw new Error('[LLMCore] initialize butuh options.corpus (kalau tidak ada checkpoint valid untuk dipulihkan)');
    }
    activeModel = await Runtime.createModel({ corpus: options.corpus, configOptions: options.configOptions });
    Logger.info('LLMCore', 'Model baru dibuat (vocab size: ' + activeModel.vocab.size + ')');
    if (!options.skipAutoTrain) {
        try {
            const maxSequences = Number.isInteger(options.autoTrainMaxSequences) ? options.autoTrainMaxSequences : 30;
            const sequences = options.corpus
                .slice(0, maxSequences)
                .map(function (text) {
                    const pieces = Tokenizer.tokenize(text, activeModel.merges);
                    const ids = window.LLMVocabulary.encode(pieces, activeModel.vocab);
                    return [activeModel.vocab.bosId].concat(ids, [activeModel.vocab.eosId]);
                })
                .filter(function (seq) { return seq.length >= 2; });
            if (sequences.length > 0) {
                const epochs = Number.isInteger(options.autoTrainEpochs) ? options.autoTrainEpochs : 1;
                const learningRate = typeof options.autoTrainLearningRate === 'number' ? options.autoTrainLearningRate : 1e-3;
                const trainResult = await Trainer.trainOnCorpus(activeModel, sequences, {
                    epochs: epochs,
                    learningRate: learningRate,
                    optimizer: 'adam',
                    onProgress: function (p) {
                        if (p.step % 5 === 0 || p.step === p.totalSteps) {
                            Logger.info('LLMCore', 'Training... langkah ' + p.step + '/' + p.totalSteps + ' (loss: ' + p.loss.toFixed(3) + ')');
                        }
                    }
                });
                Logger.info('LLMCore', 'Auto-training selesai: ' + trainResult.finalStep + ' langkah (' + epochs + ' epoch, ' + sequences.length + ' kalimat)');
            }
        } catch (e) {
            Logger.warn('LLMCore', 'Auto-training gagal, lanjut dengan bobot awal: ' + e.message);
        }
    }
    return activeModel;
}
function isReady() {
    return activeModel !== null;
}
function getModel() {
    if (!activeModel) {
        throw new Error('[LLMCore] Belum ada model aktif — panggil initialize() dulu');
    }
    return activeModel;
}
// ============================================================
// GENERATE
// ============================================================
// 🔧 TAHAP 2 (anti-macet): generateText sekarang async supaya bisa
// meng-await Runtime.generate() yang (setelah llm-runtime.js diperbarui)
// melepas kendali ke event loop tiap token. Sebelum runtime diperbarui,
// Runtime.generate masih sinkron — `await` pada nilai sinkron tetap
// mengembalikan nilai itu apa adanya, jadi perubahan ini AMAN ditempel
// lebih dulu: perilaku tidak berubah sampai runtime ikut di-update.
async function generateText(promptText, options) {
    const { Runtime } = requireDeps();
    return await Runtime.generateCached(getModel(), promptText, options);
}
// ============================================================
// TRAIN
// ============================================================
async function train(corpusTexts, options) {
    const { Trainer, Tokenizer } = requireDeps();
    const model = getModel();
    const sequences = corpusTexts.map(function (text) {
        const pieces = Tokenizer.tokenize(text, model.merges);
        const ids = window.LLMVocabulary.encode(pieces, model.vocab);
        return [model.vocab.bosId].concat(ids, [model.vocab.eosId]);
    });
    return await Trainer.trainOnCorpus(model, sequences, options);
}
// ============================================================
// SIMPAN / MUAT
// ============================================================
async function save(name, metadata) {
    const { Checkpoint } = requireDeps();
    const checkpoint = Checkpoint.createCheckpoint(getModel(), metadata);
    return await Checkpoint.saveCheckpointToStorage(checkpoint, name);
}
async function load(name) {
    const { Checkpoint } = requireDeps();
    // FIX KRITIS: loadCheckpointFromStorage() sekarang ASYNC (IndexedDB,
    // bukan localStorage lagi) — SEBELUMNYA kode ini memperlakukan
    // hasilnya sbg nilai langsung, padahal itu Promise (selalu truthy,
    // dan restoreModelFromCheckpoint() akan menerima objek Promise alih-
    // alih data checkpoint asli — salah total). Sekarang di-await dengan
    // benar.
    const saved = await Checkpoint.loadCheckpointFromStorage(name);
    if (!saved) {
        throw new Error('[LLMCore] Checkpoint "' + name + '" tidak ditemukan');
    }
    activeModel = Checkpoint.restoreModelFromCheckpoint(saved);
    return activeModel;
}
// ============================================================
// CHECKPOINT SEBAGAI OBJEK MURNI (tanpa localStorage) — dipakai
// llm-worker.js, yang TIDAK punya akses localStorage (API itu cuma
// ada di Window, bukan di Worker). Thread utama yang menyimpan/
// membaca localStorage; worker cuma mengolah datanya.
// ============================================================
function buildCheckpointObject(metadata) {
    const { Checkpoint } = requireDeps();
    return Checkpoint.createCheckpoint(getModel(), metadata);
}
function restoreFromCheckpointObject(checkpointObj) {
    const { Checkpoint } = requireDeps();
    activeModel = Checkpoint.restoreModelFromCheckpoint(checkpointObj);
    return activeModel;
}
function getStats() {
    const model = getModel();
    const W = window.LLMWeights;
    return {
        vocabSize: model.vocab.size,
        configuredVocabSize: model.config.model.vocabSize,
        dModel: model.config.model.dModel,
        nLayers: model.config.model.nLayers,
        nHeads: model.config.model.nHeads,
        maxContextLength: model.config.model.maxContextLength,
        parameterCount: W ? W.countParameters(model) : null
    };
}
window.LLMCore = {
    initialize: initialize,
    isReady: isReady,
    getModel: getModel,
    generateText: generateText,
    train: train,
    save: save,
    load: load,
    buildCheckpointObject: buildCheckpointObject,
    restoreFromCheckpointObject: restoreFromCheckpointObject,
    getStats: getStats
};
Logger.info('LLMCore', 'llm-core.js loaded');
})();
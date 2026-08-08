/* ============================================================
   KESEMPATAN OS - KESEMPATAN LLM
   📁 kesem-llm/llm-index.js
   🔥 Agregator akhir — window.KesempatanLLM mengumpulkan semua
      global per-file (LLMConfig, LLMTokenizer, dst) jadi satu
      namespace rapi untuk yang mau pakai lewat 1 pintu, TANPA
      menghapus global per-file-nya (keduanya tetap bisa dipakai —
      modul lain di kesem-llm/ sendiri tetap saling panggil lewat
      global masing-masing, ini cuma kenyamanan untuk KONSUMEN LUAR
      seperti workflow.js).
   🔥 File ini WAJIB paling akhir di loader kesem-llm.js.
   🔥 100% const, Zero console.log, guard idempotensi.
   ============================================================ */

(function () {
    'use strict';

    if (window.__LLMIndexLoaded) {
        return;
    }
    window.__LLMIndexLoaded = true;

    const Logger = window.Utils?.Logger || {
        info: function () { /* silent */ },
        warn: function () { /* silent */ },
        error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
    };

    const REQUIRED = [
        'LLMConfig', 'LLMTokenizer', 'LLMVocabulary', 'LLMEmbedding',
        'LLMAttention', 'LLMTransformer', 'LLMEncoder', 'LLMDecoder',
        'LLMInference', 'LLMSampler', 'LLMRuntime', 'LLMKnowledgeGraph',
        'LLMRetriever', 'LLMContextBuilder', 'LLMReasoning', 'LLMToolRouter',
        'LLMWeights', 'LLMCheckpoint', 'LLMQuantization', 'LLMOptimizer',
        'LLMScheduler', 'LLMTrainer', 'LLMApi', 'LLMCore'
    ];

    const missing = REQUIRED.filter(function (name) { return !window[name]; });
    if (missing.length > 0) {
        throw new Error('[LLMIndex] Modul berikut belum dimuat, cek urutan di kesem-llm.js: ' + missing.join(', '));
    }

    window.KesempatanLLM = {
        config: window.LLMConfig,
        tokenizer: window.LLMTokenizer,
        vocabulary: window.LLMVocabulary,
        embedding: window.LLMEmbedding,
        attention: window.LLMAttention,
        transformer: window.LLMTransformer,
        encoder: window.LLMEncoder,
        decoder: window.LLMDecoder,
        inference: window.LLMInference,
        sampler: window.LLMSampler,
        runtime: window.LLMRuntime,
        knowledgeGraph: window.LLMKnowledgeGraph,
        retriever: window.LLMRetriever,
        contextBuilder: window.LLMContextBuilder,
        reasoning: window.LLMReasoning,
        toolRouter: window.LLMToolRouter,
        weights: window.LLMWeights,
        checkpoint: window.LLMCheckpoint,
        quantization: window.LLMQuantization,
        optimizer: window.LLMOptimizer,
        scheduler: window.LLMScheduler,
        trainer: window.LLMTrainer,
        api: window.LLMApi,
        core: window.LLMCore,

        // Jalan pintas paling sering dipakai konsumen luar (workflow.js) —
        // langsung ke LLMCore/LLMApi tanpa perlu tahu strukturnya di dalam.
        initialize: window.LLMCore.initialize,
        isReady: window.LLMApi.isReady,
        generate: window.LLMApi.generate
    };

    Logger.info('LLMIndex', '✅ Engine termuat — 24 modul siap dipakai, window.KesempatanLLM tersedia (CATATAN: ini BUKAN berarti model sudah bisa generate — cek window.KesempatanLLM.isReady() dulu, panggil .initialize() kalau masih false)');

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('kesempatan-llm-ready'));
    }
    if (window._onKesempatanLLMReady && typeof window._onKesempatanLLMReady === 'function') {
        window._onKesempatanLLMReady();
    }
})();

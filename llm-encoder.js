/* ============================================================
   KESEMPATAN OS - KESEMPATAN LLM
   📁 kesem-llm/llm-encoder.js
   🔥 Tumpukan N blok transformer, BIDIRECTIONAL (tanpa causal mask
      — tiap token boleh "lihat" semua token lain, cocok untuk
      representasi/embedding, bukan generasi berurutan). Dipakai
      llm-inference.js kalau suatu saat butuh mode encoder-decoder;
      untuk generasi teks utama (GPT-style), lihat llm-decoder.js.
   🔥 100% const, Zero console.log, guard idempotensi.
   ============================================================ */

(function () {
    'use strict';

    if (window.__LLMEncoderLoaded) {
        return;
    }
    window.__LLMEncoderLoaded = true;

    const Logger = window.Utils?.Logger || {
        info: function () { /* silent */ },
        warn: function () { /* silent */ },
        error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
    };

    function requireTransformer() {
        if (!window.LLMTransformer) {
            throw new Error('[LLMEncoder] window.LLMTransformer belum dimuat');
        }
        return window.LLMTransformer;
    }

    // Buat bobot untuk `config.nLayers` blok transformer + 1 LayerNorm
    // final (konvensi umum: normalisasi sekali lagi di ujung stack).
    function createEncoderWeights(config) {
        const T = requireTransformer();
        const layers = new Array(config.nLayers);
        for (let i = 0; i < config.nLayers; i++) {
            layers[i] = T.createTransformerBlockWeights(config);
        }
        return {
            layers: layers,
            finalNorm: T.createLayerNormParams(config.dModel)
        };
    }

    // x: seqLen×dModel (embedding + positional encoding yang sudah digabung)
    function runEncoder(x, encoderWeights, config) {
        const T = requireTransformer();
        let hidden = x;
        for (let i = 0; i < encoderWeights.layers.length; i++) {
            hidden = T.transformerBlock(hidden, encoderWeights.layers[i], config, null);
        }
        return T.layerNorm(hidden, encoderWeights.finalNorm);
    }

    window.LLMEncoder = {
        createEncoderWeights: createEncoderWeights,
        runEncoder: runEncoder
    };

    Logger.info('LLMEncoder', 'llm-encoder.js loaded');
})();

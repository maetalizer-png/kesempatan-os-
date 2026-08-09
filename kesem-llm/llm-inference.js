/* ============================================================
   KESEMPATAN OS - KESEMPATAN LLM
   📁 kesem-llm/llm-inference.js
   🔥 Orkestrasi SATU forward pass penuh: token IDs → embedding +
      positional encoding → decoder → logits. Tidak tahu apa-apa
      soal loop generate/sampling token berikutnya — itu tanggung
      jawab llm-runtime.js (Tahap 10), supaya "hitung 1x lewat model"
      terpisah dari "gimana caranya menghasilkan banyak token".
   🔥 100% const, Zero console.log, guard idempotensi.
   ============================================================ */

(function () {
    'use strict';

    if (window.__LLMInferenceLoaded) {
        return;
    }
    window.__LLMInferenceLoaded = true;

    const Logger = window.Utils?.Logger || {
        info: function () { /* silent */ },
        warn: function () { /* silent */ },
        error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
    };

    function requireDeps() {
        if (!window.LLMEmbedding) throw new Error('[LLMInference] window.LLMEmbedding belum dimuat');
        if (!window.LLMDecoder) throw new Error('[LLMInference] window.LLMDecoder belum dimuat');
        return { E: window.LLMEmbedding, D: window.LLMDecoder };
    }

    // ============================================================
    // BUAT BOBOT MODEL (embedding + decoder) — dipanggil SEKALI
    // saat model diinisialisasi (lihat llm-runtime.js), bukan tiap forward pass.
    // ============================================================
    function createModelWeights(config) {
        const { E, D } = requireDeps();
        const embeddingMatrix = E.createEmbeddingMatrix(config.vocabSize, config.dModel, config.initStd);
        const decoderWeights = D.createDecoderWeights(config);

        // WEIGHT TYING: outputProjection = transpose(embeddingMatrix),
        // bukan matriks acak terpisah — memangkas (vocabSize × dModel)
        // parameter tanpa mengorbankan ekspresivitas (teknik standar,
        // dipakai GPT-2 dkk). Disinkronkan ulang tiap langkah training
        // di llm-trainer.js (lihat trainStep) supaya tetap terikat
        // setelah bobotnya diperbarui.
        decoderWeights.outputProjection = E.transpose(embeddingMatrix);

        return {
            embeddingMatrix: embeddingMatrix,
            decoderWeights: decoderWeights
        };
    }

    // ============================================================
    // FORWARD PASS
    // ============================================================
    // tokenIds: array int (SATU sequence, sudah dalam batas maxContextLength).
    // Mengembalikan logits: seqLen×vocabSize (skor mentah, BELUM softmax —
    // softmax/sampling jadi urusan llm-runtime.js supaya llm-inference.js murni
    // matematika model, tidak ikut campur strategi pemilihan token).
    function forward(tokenIds, model, config) {
        const { E, D } = requireDeps();

        if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
            throw new Error('[LLMInference] forward butuh tokenIds non-kosong');
        }
        if (tokenIds.length > config.maxContextLength) {
            throw new Error('[LLMInference] panjang sequence (' + tokenIds.length + ') melebihi maxContextLength (' + config.maxContextLength + ')');
        }

        const tokenEmbeddings = E.lookupEmbeddings(model.embeddingMatrix, tokenIds);
        const posEnc = E.getPositionalEncoding(tokenIds.length, config.dModel);
        const x = E.addPositionalEncoding(tokenEmbeddings, posEnc);

        const hidden = D.runDecoder(x, model.decoderWeights, config);
        return D.projectToLogits(hidden, model.decoderWeights);
    }

    // Versi ber-cache dari forward() — newTokenIds cuma token BARU (1
    // token tiap langkah generate, atau seluruh prompt di panggilan
    // pertama). positionOffset = berapa token yang SUDAH ada di cache
    // (0 di panggilan pertama) — penting supaya positional encoding
    // token baru benar (posisi absolut, bukan mulai dari 0 lagi tiap
    // panggilan). layerCaches null di panggilan pertama.
    function forwardCached(newTokenIds, model, config, layerCaches, positionOffset) {
        const { E, D } = requireDeps();

        if (!Array.isArray(newTokenIds) || newTokenIds.length === 0) {
            throw new Error('[LLMInference] forwardCached butuh newTokenIds non-kosong');
        }
        const totalLen = positionOffset + newTokenIds.length;
        if (totalLen > config.maxContextLength) {
            throw new Error('[LLMInference] panjang sequence (' + totalLen + ') melebihi maxContextLength (' + config.maxContextLength + ')');
        }

        const tokenEmbeddings = E.lookupEmbeddings(model.embeddingMatrix, newTokenIds);
        // getPositionalEncoding sudah pakai pool (lihat llm-embedding.js) —
        // ambil sampai totalLen lalu iris baris posisi absolut yang
        // relevan (positionOffset..totalLen-1), bukan mulai dari 0 lagi.
        const fullPosEnc = E.getPositionalEncoding(totalLen, config.dModel);
        const posEncForNew = fullPosEnc.slice(positionOffset, totalLen);
        const x = E.addPositionalEncoding(tokenEmbeddings, posEncForNew);

        const result = D.runDecoderCached(x, model.decoderWeights, config, layerCaches);
        const logits = D.projectToLogits(result.hidden, model.decoderWeights);
        return { logits: logits, layerCaches: result.layerCaches };
    }

    // Ambil logits token BERIKUTNYA saja (baris terakhir) — inilah yang
    // dipakai llm-runtime.js tiap langkah generation loop.
    function getNextTokenLogits(tokenIds, model, config) {
        const logits = forward(tokenIds, model, config);
        return logits[logits.length - 1];
    }

    window.LLMInference = {
        createModelWeights: createModelWeights,
        forward: forward,
        forwardCached: forwardCached,
        getNextTokenLogits: getNextTokenLogits
    };

    Logger.info('LLMInference', 'llm-inference.js loaded');
})();

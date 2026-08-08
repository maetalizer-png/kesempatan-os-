/* ============================================================
   KESEMPATAN OS - KESEMPATAN LLM
   📁 kesem-llm/llm-context-builder.js
   🔥 Rakit prompt akhir: systemPrompt + cuplikan hasil llm-retriever.js
      + pertanyaan user, dipangkas supaya muat di maxContextLength
      (pakai tokenizer ASLI buat hitung panjang persis, bukan
      estimasi karakter kasar). Reusable — tidak terikat ke
      buildPrompt() manual yang ada di workflow.js.
   🔥 100% const, Zero console.log, guard idempotensi.
   ============================================================ */

(function () {
    'use strict';

    if (window.__LLMContextBuilderLoaded) {
        return;
    }
    window.__LLMContextBuilderLoaded = true;

    const Logger = window.Utils?.Logger || {
        info: function () { /* silent */ },
        warn: function () { /* silent */ },
        error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
    };

    function requireDeps() {
        if (!window.LLMTokenizer || !window.LLMVocabulary) {
            throw new Error('[LLMContextBuilder] window.LLMTokenizer/LLMVocabulary belum dimuat');
        }
        return { Tokenizer: window.LLMTokenizer, Vocabulary: window.LLMVocabulary };
    }

    // Hitung panjang token PERSIS pakai tokenizer+vocab model yang aktif
    // (bukan estimasi kasar) — supaya budget context window akurat.
    function countTokens(text, model) {
        const { Tokenizer, Vocabulary } = requireDeps();
        const pieces = Tokenizer.tokenize(text, model.merges);
        return Vocabulary.encode(pieces, model.vocab).length;
    }

    // ============================================================
    // RAKIT KONTEKS
    // ============================================================
    // snippets: hasil LLMRetriever.retrieveAll() — array {source, text, score}
    // Anggaran token: sisihkan `reserveForGeneration` token buat jawaban,
    // sisanya (systemPrompt + query WAJIB masuk dulu, baru snippet
    // dipangkas dari yang skornya PALING RENDAH kalau kelebihan).
    function buildContext(query, systemPrompt, snippets, model, options) {
        options = options || {};
        const reserveForGeneration = options.reserveForGeneration || model.config.runtime.maxNewTokens;
        const budget = model.config.model.maxContextLength - reserveForGeneration;

        if (budget <= 0) {
            throw new Error('[LLMContextBuilder] maxContextLength terlalu kecil untuk reserveForGeneration yang diminta');
        }

        // 🔧 FIX (integrasi RAG↔LLM lokal — sebelumnya lapisan ini kode
        // mati secara praktis): prompt asli dari workflow.js buildPrompt()
        // (system prompt agen + few-shot + instruksi) HAMPIR SELALU jauh
        // lebih besar dari maxContextLength preset 'tiny' (256 token) yang
        // dipakai KESEMPATAN LLM. Versi lama di sini langsung THROW kalau
        // systemPrompt+query saja sudah melebihi anggaran — di praktiknya
        // ini SELALU terjadi untuk prompt agen nyata, jadi try/catch di
        // llm-api.js SELALU menangkapnya dan diam-diam skip seluruh pengayaan
        // RAG. Sekarang: kalau kelebihan, systemPrompt dipangkas dari
        // DEPAN (bukan throw) — mempertahankan bagian AKHIR prompt yang
        // biasanya berisi instruksi format output JSON paling penting
        // (lihat buildPrompt() di workflow.js, instruksi itu selalu di
        // akhir). Dipangkas ~25% panjang karakter per iterasi (bukan
        // token-per-token yang jauh lebih lambat) — beberapa iterasi
        // cukup konvergen karena rasio karakter:token relatif stabil.
        let effectiveSystemPrompt = systemPrompt || '';
        let header = effectiveSystemPrompt + '\n\nPertanyaan: ' + query + '\n\nKonteks:\n';
        let usedTokens = countTokens(header, model);

        let guard = 0;
        while (usedTokens > budget && effectiveSystemPrompt.length > 0 && guard < 20) {
            const cutLength = Math.max(1, Math.ceil(effectiveSystemPrompt.length * 0.25));
            effectiveSystemPrompt = effectiveSystemPrompt.slice(cutLength);
            header = effectiveSystemPrompt + '\n\nPertanyaan: ' + query + '\n\nKonteks:\n';
            usedTokens = countTokens(header, model);
            guard++;
        }

        if (usedTokens > budget) {
            throw new Error(
                '[LLMContextBuilder] Query saja (tanpa systemPrompt) masih ' + usedTokens +
                ' token, melebihi anggaran ' + budget + ' token (maxContextLength=' +
                model.config.model.maxContextLength + ' - reserveForGeneration=' + reserveForGeneration +
                ') — perbesar maxContextLength, perkecil reserveForGeneration, atau perpendek query'
            );
        }

        // Snippet diurutkan skor tertinggi dulu — kalau anggaran habis,
        // yang paling TIDAK relevan (skor rendah) yang dibuang duluan.
        const sorted = snippets.slice().sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
        const includedSnippets = [];

        for (let i = 0; i < sorted.length; i++) {
            const line = '- [' + sorted[i].source + '] ' + sorted[i].text + '\n';
            const lineTokens = countTokens(line, model);
            if (usedTokens + lineTokens > budget) {
                break; // anggaran habis, sisanya (skor lebih rendah) dibuang
            }
            includedSnippets.push(sorted[i]);
            usedTokens += lineTokens;
        }

        const contextText = includedSnippets.map(function (s) { return '- [' + s.source + '] ' + s.text; }).join('\n');
        const finalPrompt = header + (contextText || '(tidak ada konteks tambahan)');

        return {
            prompt: finalPrompt,
            snippetsIncluded: includedSnippets.length,
            snippetsDropped: snippets.length - includedSnippets.length,
            tokensUsed: usedTokens,
            tokenBudget: budget
        };
    }

    window.LLMContextBuilder = {
        countTokens: countTokens,
        buildContext: buildContext
    };

    Logger.info('LLMContextBuilder', 'llm-context-builder.js loaded');
})();

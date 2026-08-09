/* ============================================================
KESEMPATAN OS - KESEMPATAN LLM
📁 kesem-llm/llm-reasoning.js
🔥 Orkestrasi generate() yang lebih andal: self-consistency &
chain 2-langkah (draft → refine). Dibangun DI ATAS llm-runtime.js.
🔧 TAHAP 2: karena LLMRuntime.generateCached() sekarang ASYNC, kedua
fungsi di sini wajib meng-await-nya (versi lama mendorong/membaca
hasil sinkron — akan rusak begitu generate jadi Promise).
🔥 100% const, Zero console.log, guard idempotensi.
============================================================ */
(function () {
'use strict';
if (window.__LLMReasoningLoaded) {
    return;
}
window.__LLMReasoningLoaded = true;
const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireRuntime() {
    if (!window.LLMRuntime) {
        throw new Error('[LLMReasoning] window.LLMRuntime belum dimuat');
    }
    return window.LLMRuntime;
}
// ============================================================
// SELF-CONSISTENCY — generate N kali (sampling), ambil yang paling
// representatif (panjang token paling dekat median).
// ============================================================
async function generateWithSelfConsistency(model, promptText, options) {
    const Runtime = requireRuntime();
    options = options || {};
    const n = options.samples || 3;
    const results = [];
    for (let i = 0; i < n; i++) {
        results.push(await Runtime.generateCached(model, promptText, Object.assign({}, options, { greedy: false })));
    }
    const lengths = results.map(function (r) { return r.tokensGenerated; }).sort(function (a, b) { return a - b; });
    const median = lengths[Math.floor(lengths.length / 2)];
    const chosen = results.find(function (r) { return r.tokensGenerated === median; }) || results[0];
    return { chosen: chosen, allResults: results };
}
// ============================================================
// CHAIN 2-LANGKAH: DRAFT → REFINE
// ============================================================
async function draftThenRefine(model, promptText, refineInstruction, options) {
    const Runtime = requireRuntime();
    options = options || {};
    refineInstruction = refineInstruction || 'Perbaiki dan pertajam jawaban di atas, buat lebih ringkas dan akurat:';
    const draft = await Runtime.generateCached(model, promptText, options);
    const refinePrompt = promptText + '\n\nDraf jawaban:\n' + draft.text + '\n\n' + refineInstruction;
    const refined = await Runtime.generateCached(model, refinePrompt, options);
    return { draft: draft, refined: refined };
}
window.LLMReasoning = {
    generateWithSelfConsistency: generateWithSelfConsistency,
    draftThenRefine: draftThenRefine
};
Logger.info('LLMReasoning', 'llm-reasoning.js loaded');
})();
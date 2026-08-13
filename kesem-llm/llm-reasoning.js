import { LLMRuntime } from './llm-runtime.js';

const Logger = window.Utils?.Logger || {
    info: function () {  },
    warn: function () {  },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireRuntime() {
    return LLMRuntime;
}




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



async function draftThenRefine(model, promptText, refineInstruction, options) {
    const Runtime = requireRuntime();
    options = options || {};
    refineInstruction = refineInstruction || 'Perbaiki dan pertajam jawaban di atas, buat lebih ringkas dan akurat:';
    const draft = await Runtime.generateCached(model, promptText, options);
    const refinePrompt = promptText + '\n\nDraf jawaban:\n' + draft.text + '\n\n' + refineInstruction;
    const refined = await Runtime.generateCached(model, refinePrompt, options);
    return { draft: draft, refined: refined };
}
export const LLMReasoning = {
    generateWithSelfConsistency: generateWithSelfConsistency,
    draftThenRefine: draftThenRefine
};

window.LLMReasoning = LLMReasoning;

Logger.info('LLMReasoning', 'llm-reasoning.js loaded');

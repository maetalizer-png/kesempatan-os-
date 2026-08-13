import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';

const Logger = window.Utils?.Logger || {
    info: function () {  },
    warn: function () {  },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireDeps() {
    return { Tokenizer: LLMTokenizer, Vocabulary: LLMVocabulary };
}



function countTokens(text, model) {
    const { Tokenizer, Vocabulary } = requireDeps();
    const pieces = Tokenizer.tokenize(text, model.merges);
    return Vocabulary.encode(pieces, model.vocab).length;
}








function buildContext(query, systemPrompt, snippets, model, options) {
    options = options || {};
    const reserveForGeneration = options.reserveForGeneration || model.config.runtime.maxNewTokens;
    const budget = model.config.model.maxContextLength - reserveForGeneration;

    if (budget <= 0) {
        throw new Error('[LLMContextBuilder] maxContextLength terlalu kecil untuk reserveForGeneration yang diminta');
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    let effectiveSystemPrompt = systemPrompt || '';
    let header = effectiveSystemPrompt + '\n\nPertanyaan: ' + query + '\n\nKonteks:\n';
    let usedTokens = countTokens(header, model);

    let guard = 0;
    while (usedTokens > budget && effectiveSystemPrompt.length > 40 && guard < 20) {
        const totalKeep = Math.max(40, Math.floor(effectiveSystemPrompt.length * 0.85));
        const headLen = Math.floor(totalKeep * 0.4);
        const tailLen = totalKeep - headLen;
        const head = effectiveSystemPrompt.slice(0, headLen);
        const tail = tailLen > 0 ? effectiveSystemPrompt.slice(effectiveSystemPrompt.length - tailLen) : '';
        effectiveSystemPrompt = head + tail;
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

    
    
    const sorted = snippets.slice().sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
    const includedSnippets = [];

    for (let i = 0; i < sorted.length; i++) {
        const line = '- [' + sorted[i].source + '] ' + sorted[i].text + '\n';
        const lineTokens = countTokens(line, model);
        if (usedTokens + lineTokens > budget) {
            break; 
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

export const LLMContextBuilder = {
    countTokens: countTokens,
    buildContext: buildContext
};

window.LLMContextBuilder = LLMContextBuilder;

Logger.info('LLMContextBuilder', 'llm-context-builder.js loaded');

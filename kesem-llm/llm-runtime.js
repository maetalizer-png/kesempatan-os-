import { LLMConfig } from './llm-config.js';
import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMInference } from './llm-inference.js';

const Logger = window.Utils?.Logger || {
    info: function () {  },
    warn: function () {  },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireDeps() {
    return {
        Config: LLMConfig,
        Tokenizer: LLMTokenizer,
        Vocabulary: LLMVocabulary,
        Inference: LLMInference
    };
}



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
    
    
    const invalidIds = getInvalidIdMask(vocab, logits.length);
    for (let i = 0; i < invalidIds.length; i++) {
        masked[invalidIds[i]] = -Infinity;
    }
    return masked;
}
function sampleNextToken(logits, temperature, greedy, samplingOptions) {
    samplingOptions = samplingOptions || {};
    if (greedy) {
        
        
        if (window.LLMSampler) {
            let penalized = window.LLMSampler.applyRepetitionPenalty(logits, samplingOptions.recentTokenIds, samplingOptions.repetitionPenalty);
            if (samplingOptions.jsonGrammarState && samplingOptions.vocab) {
                penalized = window.LLMSampler.constrainLogitsToJSON(penalized, samplingOptions.vocab, samplingOptions.jsonGrammarState, samplingOptions.eosId, samplingOptions.wordBoundaryPending).logits;
            }
            return window.LLMSampler.argmax(penalized);
        }
        return argmax(logits);
    }
    if (window.LLMSampler) {
        return window.LLMSampler.sample(logits, {
            strategy: 'topP',
            p: typeof samplingOptions.topP === 'number' ? samplingOptions.topP : 0.9,
            temperature: temperature,
            repetitionPenalty: samplingOptions.repetitionPenalty,
            recentTokenIds: samplingOptions.recentTokenIds,
            jsonGrammarState: samplingOptions.jsonGrammarState,
            vocab: samplingOptions.vocab,
            eosId: samplingOptions.eosId,
            wordBoundaryPending: samplingOptions.wordBoundaryPending
        });
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









async function generate(model, promptText, options) {
    const { Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const topP = typeof options.topP === 'number' ? options.topP : model.config.runtime.topP;
    const repetitionPenalty = typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : model.config.runtime.repetitionPenalty;
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
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab), temperature, greedy, {
            topP: topP,
            repetitionPenalty: repetitionPenalty,
            recentTokenIds: generatedIds.slice(-64)
        });
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






async function generateCached(model, promptText, options) {
    const { Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const topP = typeof options.topP === 'number' ? options.topP : model.config.runtime.topP;
    const repetitionPenalty = typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : model.config.runtime.repetitionPenalty;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    
    
    
    
    const constrainJSON = options.constrainJSON === true && !!window.LLMJSONGrammar;
    let jsonGrammarState = constrainJSON ? window.LLMJSONGrammar.createState() : null;
    
    
    
    
    let jsonWordBoundaryPending = false;
    const pieces = Tokenizer.tokenize(promptText, model.merges);
    const promptIds = Vocabulary.encode(pieces, model.vocab);
    let ids = [model.vocab.bosId].concat(promptIds);
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const LOCAL_MAX_PROMPT_TOKENS = 150;
    if (ids.length > LOCAL_MAX_PROMPT_TOKENS) {
        const headLen = Math.floor(LOCAL_MAX_PROMPT_TOKENS * 0.4); 
        const tailLen = LOCAL_MAX_PROMPT_TOKENS - headLen - 1; 
        const head = ids.slice(1, 1 + headLen); 
        const tail = ids.slice(ids.length - tailLen);
        ids = [model.vocab.bosId].concat(head, tail);
    }
    if (ids.length >= model.config.model.maxContextLength) {
        ids = ids.slice(ids.length - model.config.model.maxContextLength + 1);
    }

    
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
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab), temperature, greedy, {
            topP: topP,
            repetitionPenalty: repetitionPenalty,
            recentTokenIds: generatedIds.slice(-64),
            jsonGrammarState: jsonGrammarState,
            vocab: model.vocab,
            eosId: model.vocab.eosId,
            wordBoundaryPending: jsonWordBoundaryPending
        });
        if (nextId === model.vocab.eosId) {
            stoppedAtEos = true;
            break;
        }
        if (constrainJSON && window.LLMSampler) {
            const advanced = window.LLMSampler.advanceJSONGrammar(jsonGrammarState, nextId, model.vocab, model.vocab.eosId, jsonWordBoundaryPending);
            jsonGrammarState = advanced.state;
            jsonWordBoundaryPending = advanced.wordBoundaryPending;
        }
        generatedIds.push(nextId);
        if ((step + 1) % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        if (step + 1 >= maxNewTokens) {
            break; 
        }
        
        
        
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
export const LLMRuntime = {
    createModel: createModel,
    generate: generate,
    generateCached: generateCached,
    sampleNextToken: sampleNextToken,
    argmax: argmax
};

window.LLMRuntime = LLMRuntime;

Logger.info('LLMRuntime', 'llm-runtime.js loaded');

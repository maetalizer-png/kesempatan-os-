import { LLMCore } from './llm-core.js';

const Logger = window.Utils?.Logger || {
    info: function () {  },
    warn: function () {  },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireCore() {
    return LLMCore;
}




function isReady() {
    return LLMCore.isReady();
}



async function generate(promptText, agentName, topic, extraOptions) {
    const Core = requireCore();
    if (!Core.isReady()) {
        throw new Error('[LLMApi] KESEMPATAN LLM belum diinisialisasi — panggil LLMCore.initialize() dulu');
    }
    const agentConfig = (typeof window.getAgentConfig === 'function')
        ? window.getAgentConfig(agentName)
        : {};
    const options = Object.assign({}, extraOptions || {});
    if (typeof agentConfig.temperature === 'number') {
        options.temperature = agentConfig.temperature;
    }
    if (typeof agentConfig.maxTokens === 'number') {
        options.maxNewTokens = agentConfig.maxTokens;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const LOCAL_MAX_NEW_TOKENS_CAP = 220;
    if (!options.maxNewTokens || options.maxNewTokens > LOCAL_MAX_NEW_TOKENS_CAP) {
        options.maxNewTokens = LOCAL_MAX_NEW_TOKENS_CAP;
    }
    
    
    
    
    
    
    
    
    
    
    
    const LOCAL_MIN_TEMPERATURE = 0.3;
    const LOCAL_MAX_TEMPERATURE = 0.5;
    if (typeof options.temperature !== 'number') {
        options.temperature = 0.4;
    } else if (options.temperature > LOCAL_MAX_TEMPERATURE) {
        options.temperature = LOCAL_MAX_TEMPERATURE;
    } else if (options.temperature < LOCAL_MIN_TEMPERATURE) {
        options.temperature = LOCAL_MIN_TEMPERATURE;
    }
    let finalPrompt = promptText;
    if (window.LLMRetriever && window.LLMContextBuilder) {
        try {
            const model = Core.getModel();
            
            
            
            const snippets = await window.LLMRetriever.retrieveAll(topic || promptText, { topKPerSource: 2, topKFinal: 3 });
            if (snippets.length > 0) {
                const built = window.LLMContextBuilder.buildContext(topic || 'Analisis peluang', promptText, snippets, model, options);
                finalPrompt = built.prompt;
            }
        } catch (e) {
            Logger.warn('LLMApi', 'Pengayaan konteks (RAG) dilewati: ' + e.message);
        }
    }
    const useRefine = options.useRefine === true || agentConfig.useRefine === true;
    let result;
    if (useRefine && window.LLMReasoning) {
        const model = Core.getModel();
        const chained = await window.LLMReasoning.draftThenRefine(model, finalPrompt, null, options);
        result = chained.refined;
    } else {
        
        
        
        
        
        result = await Core.generateText(finalPrompt, options);
    }
    Logger.info('LLMApi', 'generate() untuk agent "' + agentName + '" — ' + result.tokensGenerated + ' token dihasilkan' + (useRefine ? ' (draft+refine)' : ''));
    return result.text;
}
export const LLMApi = {
    isReady: isReady,
    generate: generate
};

window.LLMApi = LLMApi;

Logger.info('LLMApi', 'llm-api.js loaded');

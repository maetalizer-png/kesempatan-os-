import { LLMRetriever } from './llm-retriever.js';

const Logger = window.Utils?.Logger || {
    info: function () {  },
    warn: function () {  },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

const registry = new Map(); 






function registerTool(name, matcher, executor, priority) {
    registry.set(name, { matcher: matcher, executor: executor, priority: priority || 0 });
}

function unregisterTool(name) {
    registry.delete(name);
}





function route(query) {
    const matched = [];
    registry.forEach(function (tool, name) {
        if (tool.matcher(query)) {
            matched.push({ name: name, priority: tool.priority });
        }
    });
    return matched.sort(function (a, b) { return b.priority - a.priority; }).map(function (m) { return m.name; });
}

async function executeTools(query, toolNames, options) {
    const results = {};
    for (let i = 0; i < toolNames.length; i++) {
        const name = toolNames[i];
        const tool = registry.get(name);
        if (!tool) continue;
        try {
            results[name] = await tool.executor(query, options);
        } catch (e) {
            Logger.warn('LLMToolRouter', 'Tool "' + name + '" gagal: ' + e.message);
            results[name] = null;
        }
    }
    return results;
}















function embedText(text) {
    if (window.MemoryUtils && typeof window.MemoryUtils.simpleEmbed === 'function') {
        return window.MemoryUtils.simpleEmbed(text);
    }
    return null;
}

function registerSemanticTool(name, exemplarPhrases, executor, options) {
    options = options || {};
    const threshold = typeof options.threshold === 'number' ? options.threshold : 0.25;
    const priority = options.priority || 0;
    const fallbackKeywords = Array.isArray(options.fallbackKeywords) ? options.fallbackKeywords : [];

    
    
    
    
    let exemplarEmbeddings = null;

    function ensureExemplars() {
        if (exemplarEmbeddings === null) {
            exemplarEmbeddings = exemplarPhrases
                .map(embedText)
                .filter(function (e) { return Array.isArray(e); });
        }
        return exemplarEmbeddings;
    }

    registry.set(name, {
        matcher: function (query) {
            const calcSim = window.calculateSimilarity;
            const exemplars = ensureExemplars();

            if (exemplars.length > 0 && typeof calcSim === 'function') {
                const queryEmb = embedText(query);

                if (queryEmb) {
                    let bestSim = -Infinity;

                    for (const exemplarEmb of exemplars) {
                        const sim = calcSim(queryEmb, exemplarEmb, 'cosine');

                        if (sim > bestSim) {
                            bestSim = sim;
                        }
                    }

                    return bestSim >= threshold;
                }
            }

            
            
            
            if (fallbackKeywords.length > 0) {
                const lower = query.toLowerCase();
                return fallbackKeywords.some(function (kw) { return lower.includes(kw); });
            }

            return false;
        },
        executor: executor,
        priority: priority
    });
}






function registerDefaultTools() {
    registerTool('vectorMemory',
        function () { return true; }, 
        function (query, options) { return LLMRetriever.retrieveFromVectorMemory(query, (options && options.topK) || 5); },
        1
    );

    registerSemanticTool('database',
        [
            'berapa banyak data yang tersimpan',
            'lihat riwayat transaksi bulan lalu',
            'statistik penjualan minggu ini',
            'jumlah laporan yang sudah dibuat',
            'tampilkan history analisis sebelumnya'
        ],
        function (query, options) { return LLMRetriever.retrieveFromDatabase(query, (options && options.topK) || 5); },
        {
            priority: 2,
            threshold: 0.25,
            fallbackKeywords: ['data', 'riwayat', 'history', 'berapa', 'jumlah', 'statistik', 'laporan']
        }
    );

    registerTool('worldData',
        function () { return window.__STATIC_DATA && window.__STATIC_DATA.length > 0; },
        function (query, options) { return LLMRetriever.retrieveFromWorldData(query, (options && options.topK) || 5); },
        1
    );
}

registerDefaultTools();

export const LLMToolRouter = {
    registerTool: registerTool,
    registerSemanticTool: registerSemanticTool,
    unregisterTool: unregisterTool,
    route: route,
    executeTools: executeTools
};

window.LLMToolRouter = LLMToolRouter;

Logger.info('LLMToolRouter', 'llm-tool-router.js loaded');

(function() {
'use strict';
if (window.__AIClientsLoaded) return;
window.__AIClientsLoaded = true;

const CONFIG = window.KESEMPATAN?.Config || window.CONFIG;
const Utils = window.KESEMPATAN?.Utils || window.Utils;
const Logger = Utils?.Logger;
const RetryEngine = Utils?.RetryEngine;

const PRICING = {
    groq: { input: 0, output: 0 },
    huggingface: { input: 0, output: 0 },
    gemini: { input: 0, output: 0 },
    gemini15: { input: 0, output: 0 },
    gemini15pro: { input: 0.00125, output: 0.005 },
    deepseek: { input: 0.00014, output: 0.00028 },
    deepseekreasoner: { input: 0.00055, output: 0.00219 },
    cohere: { input: 0.001, output: 0.002 },
    mistral: { input: 0.002, output: 0.006 },
    ai21: { input: 0.001, output: 0.002 },
    claude: { input: 0.003, output: 0.015 },
    claudeopus: { input: 0.015, output: 0.075 },
    claudesonnet5: { input: 0.003, output: 0.015 },
    claudehaiku: { input: 0.0008, output: 0.004 },
    perplexity: { input: 0.005, output: 0.015 },
    openrouter: { input: 0.00014, output: 0.00028 },
    openai: { input: 0.0025, output: 0.01 },
    openaimini: { input: 0.00015, output: 0.0006 },
    qwen: { input: 0.0016, output: 0.0064 },
    qwenplus: { input: 0.0004, output: 0.0012 }
};

function createOpenAICompatClient(providerName, opts) {
    return {
        async generate(apiKey, prompt, model, temperature = 0.5, maxTokens = 2000) {
            if (!apiKey) throw new Error('No API Key');
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
            try {
                const url = typeof opts.endpoint === 'function' ? opts.endpoint(model) : opts.endpoint;
                const body = {
                    messages: [{ role: 'user', content: prompt }],
                    temperature: temperature,
                    max_tokens: maxTokens
                };
                if (opts.modelInBody !== false) body.model = model;
                if (opts.responseFormat) body.response_format = { type: 'json_object' };
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: controller.signal
                });
                const data = await res.json();
                clearTimeout(timeout);
                if (!res.ok) throw new Error(data.error?.message || (providerName + ' error'));
                return data.choices?.[0]?.message?.content || '';
            } catch (error) {
                clearTimeout(timeout);
                throw error;
            }
        }
    };
}

const OpenRouterClient = createOpenAICompatClient('OpenRouter', { endpoint: 'https://openrouter.ai/api/v1/chat/completions', responseFormat: true });
const GroqClient = createOpenAICompatClient('Groq', { endpoint: 'https://api.groq.com/openai/v1/chat/completions', responseFormat: true });
const PerplexityClient = createOpenAICompatClient('Perplexity', { endpoint: 'https://api.perplexity.ai/chat/completions', responseFormat: false });
const DeepSeekDirectClient = createOpenAICompatClient('DeepSeek', { endpoint: 'https://api.deepseek.com/v1/chat/completions', responseFormat: true });
const MistralClient = createOpenAICompatClient('Mistral', { endpoint: 'https://api.mistral.ai/v1/chat/completions', responseFormat: true });
const AI21Client = createOpenAICompatClient('AI21', { endpoint: (model) => `https://api.ai21.com/studio/v1/${model}/chat/completions`, responseFormat: false, modelInBody: false });
const OpenAIClient = createOpenAICompatClient('OpenAI', { endpoint: 'https://api.openai.com/v1/chat/completions', responseFormat: true });
const QwenClient = createOpenAICompatClient('Qwen', { endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', responseFormat: false });

const HuggingFaceClient = {
    async generate(apiKey, prompt, model, temperature = 0.5, maxTokens = 2000) {
        if (!apiKey) throw new Error('No API Key');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        try {
            const url = `https://api-inference.huggingface.co/models/${model}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: maxTokens, temperature: temperature } }),
                signal: controller.signal
            });
            const data = await res.json();
            clearTimeout(timeout);
            if (!res.ok) throw new Error(data.error || 'HF error');
            if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
            return data.generated_text || '';
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
};

const GeminiClient = {
    async generate(apiKey, prompt, model, temperature = 0.5, maxTokens = 2000) {
        if (!apiKey) throw new Error('No API Key');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: temperature, maxOutputTokens: maxTokens }
                }),
                signal: controller.signal
            });
            const data = await res.json();
            clearTimeout(timeout);
            if (!res.ok) throw new Error(data.error?.message || 'Gemini error');
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
};

const AnthropicClient = {
    async generate(apiKey, prompt, model, temperature = 0.5, maxTokens = 2000) {
        if (!apiKey) throw new Error('No API Key');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: model, max_tokens: maxTokens, temperature: temperature, messages: [{ role: 'user', content: prompt }] }),
                signal: controller.signal
            });
            const data = await res.json();
            clearTimeout(timeout);
            if (!res.ok) throw new Error(data.error?.message || 'Claude error');
            return data.content?.[0]?.text || '';
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
};

const CohereClient = {
    async generate(apiKey, prompt, model, temperature = 0.5, maxTokens = 2000) {
        if (!apiKey) throw new Error('No API Key');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        try {
            const res = await fetch('https://api.cohere.ai/v1/generate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: model, prompt: prompt, max_tokens: maxTokens, temperature: temperature }),
                signal: controller.signal
            });
            const data = await res.json();
            clearTimeout(timeout);
            if (!res.ok) throw new Error(data.message || 'Cohere error');
            return data.generations?.[0]?.text || '';
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
};

const CostTracker = {
    totalCost: 0,
    dailyUsage: {},
    monthlyLimit: 10,
    alerts: { 50: false, 70: false, 80: false, 90: false, 100: false },
    calculateCost(provider, inputTokens, outputTokens) {
        const price = PRICING[provider] || { input: 0, output: 0 };
        return (inputTokens * price.input) + (outputTokens * price.output);
    },
    addCost(provider, inputTokens, outputTokens) {
        const cost = this.calculateCost(provider, inputTokens, outputTokens);
        this.totalCost += cost;
        const today = new Date().toISOString().split('T')[0];
        if (!this.dailyUsage[today]) this.dailyUsage[today] = { total: 0, details: [] };
        this.dailyUsage[today].total += cost;
        this.dailyUsage[today].details.push({ provider: provider, inputTokens: inputTokens, outputTokens: outputTokens, cost: cost, timestamp: Date.now() });
        this.save();
        this.checkAlerts();
        return cost;
    },
    checkAlerts() {
        const percentage = (this.totalCost / this.monthlyLimit) * 100;
        const thresholds = [50, 70, 80, 90, 100];
        const showToast = window.KESEMPATAN?.Utils?.showToast || window.showToast;
        for (const threshold of thresholds) {
            if (percentage >= threshold && !this.alerts[threshold]) {
                this.alerts[threshold] = true;
                if (Logger) Logger.warn('COST', `⚠️ API cost mencapai ${threshold}% ($${this.totalCost.toFixed(2)})`);
                if (showToast) showToast(`⚠️ Cost ${threshold}%`, 'warning');
            }
        }
    },
    save() {
        localStorage.setItem('kes_api_cost', JSON.stringify({ totalCost: this.totalCost, dailyUsage: this.dailyUsage, monthlyLimit: this.monthlyLimit, alerts: this.alerts }));
    },
    load() {
        try {
            const saved = localStorage.getItem('kes_api_cost');
            if (saved) {
                const data = JSON.parse(saved);
                this.totalCost = data.totalCost || 0;
                this.dailyUsage = data.dailyUsage || {};
                this.monthlyLimit = data.monthlyLimit || 10;
                this.alerts = data.alerts || { 50: false, 70: false, 80: false, 90: false, 100: false };
            }
        } catch (error) { console.warn('[AIClients] CostTracker.load failed:', error.message); }
    },
    getStats() {
        const today = new Date().toISOString().split('T')[0];
        return {
            totalCost: this.totalCost.toFixed(4),
            todayCost: (this.dailyUsage[today]?.total || 0).toFixed(4),
            monthlyLimit: this.monthlyLimit,
            remainingBudget: (this.monthlyLimit - this.totalCost).toFixed(2),
            percentageUsed: Math.min(100, (this.totalCost / this.monthlyLimit) * 100).toFixed(0),
            dailyBreakdown: this.dailyUsage[today]?.details || []
        };
    },
    resetMonthly() {
        this.totalCost = 0;
        this.dailyUsage = {};
        this.alerts = { 50: false, 70: false, 80: false, 90: false, 100: false };
        this.save();
    },
    setMonthlyLimit(limit) {
        this.monthlyLimit = limit;
        this.save();
    }
};
CostTracker.load();

class SecureStorage {
    constructor() {
        this.secret = localStorage.getItem('kes_storage_secret') || btoa(navigator.userAgent + Date.now() + Math.random());
        localStorage.setItem('kes_storage_secret', this.secret);
    }
    encrypt(text) { return text ? btoa(encodeURIComponent(text)) : ''; }
    decrypt(encrypted) { try { return encrypted ? decodeURIComponent(atob(encrypted)) : ''; } catch (error) { return ''; } }
    set(key, value) { localStorage.setItem(key, this.encrypt(value)); }
    get(key) { const encrypted = localStorage.getItem(key); return encrypted ? this.decrypt(encrypted) : null; }
}
const secureStorage = new SecureStorage();

class RequestQueue {
    constructor(maxConcurrent = 5) {
        this.maxConcurrent = maxConcurrent;
        this.running = 0;
        this.queue = [];
    }
    async add(task) {
        if (this.running >= this.maxConcurrent) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        this.running++;
        try { return await task(); }
        finally { this.running--; if (this.queue.length > 0) this.queue.shift()(); }
    }
}
const requestQueue = new RequestQueue(5);

async function validateApiKey(provider, apiKey) {
    if (!apiKey) return false;
    try {
        switch (provider) {
            case 'openrouter': {
                const res = await fetch('https://openrouter.ai/api/v1/auth/key', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'groq': {
                const res = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'huggingface': {
                const res = await fetch('https://api-inference.huggingface.co/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'gemini':
            case 'gemini15':
            case 'gemini15pro': {
                const model = provider === 'gemini15pro' ? 'gemini-1.5-pro' : (provider === 'gemini' ? 'gemini-2.0-flash' : 'gemini-1.5-flash');
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`);
                return res.ok;
            }
            case 'claude':
            case 'claudeopus':
            case 'claudesonnet5':
            case 'claudehaiku': {
                const res = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } });
                return res.ok;
            }
            case 'cohere': {
                const res = await fetch('https://api.cohere.ai/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'deepseek':
            case 'deepseekreasoner': {
                const res = await fetch('https://api.deepseek.com/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'mistral': {
                const res = await fetch('https://api.mistral.ai/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'perplexity': {
                const res = await fetch('https://api.perplexity.ai/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'ai21': {
                const res = await fetch('https://api.ai21.com/studio/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'openai':
            case 'openaimini': {
                const res = await fetch('https://api.openai.com/v1/models', { headers: { 'Authorization': `Bearer ${apiKey}` } });
                return res.ok;
            }
            case 'qwen':
            case 'qwenplus': {
                const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'qwen-turbo', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 })
                });
                return res.ok || res.status === 400;
            }
            default:
                return true;
        }
    } catch (error) {
        return false;
    }
}

let responseCache = null;
const PROVIDER_PRIORITY = ['groq', 'huggingface', 'gemini', 'gemini15', 'openaimini', 'qwenplus', 'deepseek', 'cohere', 'mistral', 'ai21', 'claudehaiku', 'claude', 'claudesonnet5', 'claudeopus', 'gemini15pro', 'qwen', 'openai', 'deepseekreasoner', 'perplexity', 'openrouter'];

function getAgentConfig(agentName) {
    if (window.KESEMPATAN?.getAgentConfig) return window.KESEMPATAN.getAgentConfig(agentName);
    if (window.getAgentConfig) return window.getAgentConfig(agentName);
    return { temperature: 0.5, maxTokens: 700 };
}

async function generateWithFallback(prompt, agentName, initialProvider = null) {
    if (responseCache) {
        const cached = await responseCache.get(prompt, agentName, 'any');
        if (cached) {
            if (Logger) Logger.info('AI', `Cache hit untuk ${agentName}`);
            return cached;
        }
    }

    const providersToTry = initialProvider
        ? [initialProvider, ...PROVIDER_PRIORITY.filter(p => p !== initialProvider)]
        : [...PROVIDER_PRIORITY];

    let lastError = null;

    for (const provider of providersToTry) {
        const apiKey = CONFIG.API_KEYS[provider];
        if (!apiKey || apiKey.length < 5) continue;

        const isValid = await validateApiKey(provider, apiKey);
        if (!isValid) continue;

        let model = '';
        let client = null;

        switch (provider) {
            case 'openrouter': model = CONFIG.CUSTOM_MODELS.openrouter || 'deepseek/deepseek-chat'; client = OpenRouterClient; break;
            case 'groq': model = CONFIG.CUSTOM_MODELS.groq || 'mixtral-8x7b-32768'; client = GroqClient; break;
            case 'huggingface': model = CONFIG.CUSTOM_MODELS.huggingface || 'mistralai/Mistral-7B-Instruct-v0.3'; client = HuggingFaceClient; break;
            case 'gemini': model = 'gemini-2.0-flash'; client = GeminiClient; break;
            case 'gemini15': model = 'gemini-1.5-flash'; client = GeminiClient; break;
            case 'gemini15pro': model = 'gemini-1.5-pro'; client = GeminiClient; break;
            case 'claude': model = 'claude-3-5-sonnet-20241022'; client = AnthropicClient; break;
            case 'claudeopus': model = 'claude-opus-4-8'; client = AnthropicClient; break;
            case 'claudesonnet5': model = 'claude-sonnet-5'; client = AnthropicClient; break;
            case 'claudehaiku': model = 'claude-haiku-4-5-20251001'; client = AnthropicClient; break;
            case 'cohere': model = 'command-r-plus'; client = CohereClient; break;
            case 'perplexity': model = 'llama-3.1-sonar-large-128k-online'; client = PerplexityClient; break;
            case 'deepseek': model = 'deepseek-chat'; client = DeepSeekDirectClient; break;
            case 'deepseekreasoner': model = 'deepseek-reasoner'; client = DeepSeekDirectClient; break;
            case 'mistral': model = 'mistral-large-latest'; client = MistralClient; break;
            case 'ai21': model = 'jamba-1.5-large'; client = AI21Client; break;
            case 'openai': model = 'gpt-4o'; client = OpenAIClient; break;
            case 'openaimini': model = 'gpt-4o-mini'; client = OpenAIClient; break;
            case 'qwen': model = 'qwen-max'; client = QwenClient; break;
            case 'qwenplus': model = 'qwen-plus'; client = QwenClient; break;
            default: continue;
        }

        const agentConfig = getAgentConfig(agentName);
        const temperature = agentConfig.temperature || 0.5;
        const maxTokens = agentConfig.maxTokens || 1000;

        try {
            const result = await requestQueue.add(async () => {
                return await client.generate(apiKey, prompt, model, temperature, maxTokens);
            });

            if (result && result.length > 0) {
                const inputTokens = Math.ceil(prompt.length / 4);
                const outputTokens = Math.ceil(result.length / 4);
                const cost = CostTracker.addCost(provider, inputTokens, outputTokens);
                if (Logger) Logger.success('AI', `✅ ${provider} → ${agentName} ($${cost.toFixed(6)})`);
                // Cache key uses 'any' for the model, matching the get() lookup above —
                // this cache is intentionally model-agnostic (a hit from any provider
                // that succeeded before is fine, since fallback tries many models per
                // request). Previously this wrote under the real model name while get()
                // always queried 'any', so the hash never matched and reads never hit.
                if (responseCache) await responseCache.set(prompt, agentName, 'any', result);
                return result;
            }
        } catch (error) {
            if (Logger) Logger.warn('AI', `Provider ${provider} gagal: ${error.message}`);
            lastError = error;
            continue;
        }
    }

    throw new Error(`Semua provider gagal. Error terakhir: ${lastError?.message}`);
}

const AIClients = Object.freeze({
    OpenRouterClient: OpenRouterClient,
    GroqClient: GroqClient,
    HuggingFaceClient: HuggingFaceClient,
    GeminiClient: GeminiClient,
    AnthropicClient: AnthropicClient,
    CohereClient: CohereClient,
    PerplexityClient: PerplexityClient,
    DeepSeekDirectClient: DeepSeekDirectClient,
    MistralClient: MistralClient,
    AI21Client: AI21Client,
    OpenAIClient: OpenAIClient,
    QwenClient: QwenClient,
    validateApiKey: validateApiKey,
    generateWithFallback: generateWithFallback,
    setCache: (cache) => { responseCache = cache; },
    CostTracker: CostTracker,
    requestQueue: requestQueue,
    secureStorage: secureStorage,
    getProviderPriority: () => [...PROVIDER_PRIORITY]
});

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.AIClients = AIClients;
window.AIClients = AIClients;
})();
export const CONFIG = {
    APP_NAME: 'KESEMPATAN OS',
    PROVIDERS: {
        local: { name: 'LLM Lokal (Prioritas, Tanpa API Key)', model: 'kesempatan-llm-local', free: true, local: true, description: 'Jalan langsung di perangkat via Web Worker, tidak butuh koneksi/API key/biaya. Prioritas utama — provider lain di bawah ini cuma cadangan opsional.' },
        groq: { name: 'Groq (Mixtral)', model: 'mixtral-8x7b-32768', free: true, rateLimit: 30, description: 'Cepat, gratis, rate limit 30 req/menit' },
        huggingface: { name: 'HuggingFace (Mistral)', model: 'mistralai/Mistral-7B-Instruct-v0.3', free: true, rateLimit: 30, description: 'Gratis, banyak model, rate limit 30 req/menit' },
        gemini: { name: 'Google Gemini 2.0 Flash', model: 'gemini-2.0-flash', free: true, rateLimit: 60, description: 'Gratis, 60 request/menit, kualitas bagus' },
        deepseek: { name: 'DeepSeek V3 Direct', model: 'deepseek-chat', free: false, priceInput: 0.14, priceOutput: 0.28, description: 'Termurah di pasar, $0.14/M input token' },
        cohere: { name: 'Cohere Command R+', model: 'command-r-plus', free: false, priceInput: 2.5, priceOutput: 10, description: 'Bagus untuk summarization & RAG' },
        mistral: { name: 'Mistral Large', model: 'mistral-large-latest', free: false, priceInput: 2, priceOutput: 6, description: 'Model Eropa, kompetitif dengan GPT-4' },
        ai21: { name: 'AI21 Jamba 1.5', model: 'jamba-1.5-large', free: false, priceInput: 1, priceOutput: 2.5, description: 'Arsitektur SSM-Transformer hybrid' },
        claude: { name: 'Anthropic Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', free: false, priceInput: 3, priceOutput: 15, description: 'Terbaik untuk reasoning & coding' },
        perplexity: { name: 'Perplexity Sonar', model: 'llama-3.1-sonar-large-128k-online', free: false, priceInput: 5, priceOutput: 15, features: ['web_search'], description: 'Dengan web search real-time' },
        openrouter: { name: 'OpenRouter (Fallback)', model: 'deepseek/deepseek-chat', free: false, description: 'Akses ke 100+ model via satu API' },
        gemini15: { name: 'Google Gemini 1.5 Flash', model: 'gemini-1.5-flash', free: true, rateLimit: 60, description: 'Versi lama Gemini, gratis' },
        gemini15pro: { name: 'Google Gemini 1.5 Pro', model: 'gemini-1.5-pro', free: false, priceInput: 1.25, priceOutput: 5, description: 'Gemini varian "Pro" — konteks lebih besar, lebih pintar dari Flash' },
        claudeopus: { name: 'Anthropic Claude Opus 4.8', model: 'claude-opus-4-8', free: false, priceInput: 15, priceOutput: 75, description: 'Claude paling pintar — reasoning & tugas kompleks' },
        claudesonnet5: { name: 'Anthropic Claude Sonnet 5', model: 'claude-sonnet-5', free: false, priceInput: 3, priceOutput: 15, description: 'Claude generasi terbaru — seimbang kualitas & kecepatan' },
        claudehaiku: { name: 'Anthropic Claude Haiku 4.5', model: 'claude-haiku-4-5-20251001', free: false, priceInput: 0.8, priceOutput: 4, description: 'Claude tercepat & termurah — cocok tugas ringan/volume tinggi' },
        deepseekreasoner: { name: 'DeepSeek Reasoner (R1)', model: 'deepseek-reasoner', free: false, priceInput: 0.55, priceOutput: 2.19, description: 'DeepSeek varian reasoning — tampilkan rantai berpikir sebelum jawab' },
        openai: { name: 'OpenAI ChatGPT (GPT-4o)', model: 'gpt-4o', free: false, priceInput: 2.5, priceOutput: 10, description: 'ChatGPT model utama OpenAI — serbaguna & andal' },
        openaimini: { name: 'OpenAI ChatGPT (GPT-4o mini)', model: 'gpt-4o-mini', free: false, priceInput: 0.15, priceOutput: 0.6, description: 'ChatGPT varian murah & cepat, cocok tugas ringan volume tinggi' },
        qwen: { name: 'Alibaba Qwen (Qwen-Max)', model: 'qwen-max', free: false, priceInput: 1.6, priceOutput: 6.4, description: 'Qwen model unggulan Alibaba Cloud — kuat di Bahasa Indonesia & Asia' },
        qwenplus: { name: 'Alibaba Qwen (Qwen-Plus)', model: 'qwen-plus', free: false, priceInput: 0.4, priceOutput: 1.2, description: 'Qwen varian lebih murah & cepat drpd Qwen-Max' }
    },
    PROVIDER_FALLBACK: ['groq', 'huggingface', 'gemini', 'gemini15', 'openaimini', 'qwenplus', 'deepseek', 'cohere', 'mistral', 'ai21', 'claudehaiku', 'claude', 'claudesonnet5', 'claudeopus', 'gemini15pro', 'qwen', 'openai', 'deepseekreasoner', 'perplexity', 'openrouter'],
    AI_PROVIDER: 'groq',
    API_KEYS: { openrouter: '', groq: '', huggingface: '', gemini: '', gemini15: '', gemini15pro: '', claude: '', claudeopus: '', claudesonnet5: '', claudehaiku: '', cohere: '', perplexity: '', deepseek: '', deepseekreasoner: '', mistral: '', ai21: '', openai: '', openaimini: '', qwen: '', qwenplus: '' },
    CUSTOM_MODELS: { openrouter: 'deepseek/deepseek-chat', groq: 'mixtral-8x7b-32768', huggingface: 'mistralai/Mistral-7B-Instruct-v0.3' },
    REQUEST_TIMEOUT: 60000,
    MAX_RETRIES: 2,
    RETRY_BASE_DELAY: 1500,
    MEMORY_LIMIT: 1000,
    CACHE_TTL: 3600000,
    AGENTS: ['Manager', 'Researcher', 'Hunter', 'Analyst', 'Strategist', 'Copywriter', 'Script', 'Planner', 'Distributor', 'Optimizer', 'Memory', 'Verifier', 'PromptOptimizer', 'RahmadRaharjo'],
    MAX_UPLOAD_SIZE_MB: 10,
    CONCURRENCY: 3,
    AUTO_APPROVE_CONFIDENCE: 70,
    MONTHLY_API_LIMIT_USD: 10,
    DEFAULT_THEME: 'dark',
    DEFAULT_LANGUAGE: 'id',
    SPEECH_ENABLED: true,
    FEATURES: { parallelMode: false, offlineMode: true, realTimeNews: true, multiSourceSearch: true, aiPodcast: true, voiceCommand: false, costTracking: true },
    CURRENT_CONTEXT: { year: new Date().getFullYear() }
};

try {
    const savedProvider = localStorage.getItem('kes_ai_provider');
    if (savedProvider && CONFIG.PROVIDERS[savedProvider]) CONFIG.AI_PROVIDER = savedProvider;
    for (const provider of Object.keys(CONFIG.PROVIDERS)) {
        const encodedKey = localStorage.getItem(`kes_api_key_${provider}`);
        if (encodedKey) {
            try { CONFIG.API_KEYS[provider] = decodeURIComponent(atob(encodedKey)); }
            catch (error) { console.warn('[Config] Failed to decode stored API key for', provider, error.message); }
        }
    }
    const savedThreshold = localStorage.getItem('kes_auto_approve_threshold');
    if (savedThreshold) CONFIG.AUTO_APPROVE_CONFIDENCE = parseInt(savedThreshold);
    const parallelMode = localStorage.getItem('kes_parallel_mode');
    if (parallelMode !== null) CONFIG.FEATURES.parallelMode = parallelMode === 'true';
    const costLimit = localStorage.getItem('kes_monthly_api_limit');
    if (costLimit) CONFIG.MONTHLY_API_LIMIT_USD = parseFloat(costLimit);
    const speechEnabled = localStorage.getItem('kes_speech_enabled');
    if (speechEnabled !== null) CONFIG.FEATURES.speechEnabled = speechEnabled === 'true';
} catch (error) { console.warn('[Config] Failed to load saved preferences from localStorage:', error.message); }

export function getActiveProviders() {
    const activeProviders = [];
    for (const provider of CONFIG.PROVIDER_FALLBACK) {
        if (CONFIG.API_KEYS[provider] && CONFIG.API_KEYS[provider].length > 0) activeProviders.push(provider);
    }
    return activeProviders;
}

export function isProviderFree(provider) {
    return CONFIG.PROVIDERS[provider]?.free === true;
}

export function getProviderPrice(provider, type = 'output') {
    const providerConfig = CONFIG.PROVIDERS[provider];
    if (!providerConfig) return { input: 0, output: 0 };
    return { input: providerConfig.priceInput || 0, output: providerConfig.priceOutput || 0 };
}

export function updateApiKey(provider, apiKey) {
    if (CONFIG.API_KEYS.hasOwnProperty(provider)) {
        CONFIG.API_KEYS[provider] = apiKey;
        localStorage.setItem(`kes_api_key_${provider}`, btoa(encodeURIComponent(apiKey)));
        return true;
    }
    return false;
}

export function setActiveProvider(provider) {
    if (CONFIG.PROVIDERS[provider]) {
        CONFIG.AI_PROVIDER = provider;
        localStorage.setItem('kes_ai_provider', provider);
        return true;
    }
    return false;
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.Config = CONFIG;
window.KESEMPATAN.getActiveProviders = getActiveProviders;
window.KESEMPATAN.isProviderFree = isProviderFree;
window.KESEMPATAN.getProviderPrice = getProviderPrice;
window.KESEMPATAN.updateApiKey = updateApiKey;
window.KESEMPATAN.setActiveProvider = setActiveProvider;

// Bridge for consumers not yet migrated to `import { CONFIG } from './config.js'`.
// Remove once every consumer reads window.KESEMPATAN.Config instead of this bare global.
window.CONFIG = CONFIG;
window.getActiveProviders = getActiveProviders;
window.isProviderFree = isProviderFree;
window.getProviderPrice = getProviderPrice;
window.updateApiKey = updateApiKey;
window.setActiveProvider = setActiveProvider;

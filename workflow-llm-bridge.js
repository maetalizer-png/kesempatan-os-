(function() {
'use strict';
if (window.__WorkflowLLMBridgeLoaded) return;
window.__WorkflowLLMBridgeLoaded = true;

const { Logger, showToast } = window.Utils || {};

const LLM_GENERATE_TIMEOUT_MS = 45000;
const LLM_SLOW_DEVICE_KEY = 'kes_llm_slow_device_until';
const LLM_SLOW_DEVICE_TTL_MS = 24 * 60 * 60 * 1000;

function isDeviceKnownSlow() {
    try {
        const until = parseInt(localStorage.getItem(LLM_SLOW_DEVICE_KEY), 10);
        return !isNaN(until) && Date.now() < until;
    } catch (e) {
        return false;
    }
}

function markDeviceSlow() {
    try {
        localStorage.setItem(LLM_SLOW_DEVICE_KEY, String(Date.now() + LLM_SLOW_DEVICE_TTL_MS));
    } catch (e) {}
}

let __activeGenerateCount = 0;

async function callGenerativeEngine(prompt, agent, topic) {
    if (!window.__kesempatanLLMSkipThisSession && window.KesempatanLLM && window.KesempatanLLM.isReady && window.KesempatanLLM.isReady()) {
        __activeGenerateCount++;
        try {
            const stopSignal = { stopped: false };
            const genPromise = window.KesempatanLLM.generate(prompt, agent, topic, { stopSignal: stopSignal });
            const requestId = genPromise.requestId;
            const timeoutId = setTimeout(function() {
                stopSignal.stopped = true;
                if (typeof window.KesempatanLLM.stop === 'function') {
                    window.KesempatanLLM.stop(requestId);
                }
            }, LLM_GENERATE_TIMEOUT_MS);
            try {
                const text = await genPromise;
                clearTimeout(timeoutId);
                if (stopSignal.stopped && text.trim().length < 10) {
                    if (Logger) {
                        Logger.warn('Workflow', 'Agent "' + agent + '": KESEMPATAN LLM dihentikan (timeout ' + (LLM_GENERATE_TIMEOUT_MS / 1000) + 's) dengan hasil nyaris kosong, coba provider luar');
                    }
                    return await window.AIClients.generateWithFallback(prompt, agent, null, topic);
                }
                return text;
            } catch (e) {
                clearTimeout(timeoutId);
                throw e;
            }
        } finally {
            __activeGenerateCount--;
        }
    }
    return await window.AIClients.generateWithFallback(prompt, agent, null, topic);
}

const MAX_BOOTSTRAP_AGENTS = 999;
const MAX_BOOTSTRAP_TEXT_LENGTH = 800;

function buildBootstrapCorpus() {
    const texts = [];
    if (window.AGENTS_CONFIG) {
        const names = Object.keys(window.AGENTS_CONFIG).slice(0, MAX_BOOTSTRAP_AGENTS);
        names.forEach(function(name) {
            const cfg = window.AGENTS_CONFIG[name];
            if (cfg && cfg.systemPrompt) {
                texts.push(String(cfg.systemPrompt).slice(0, MAX_BOOTSTRAP_TEXT_LENGTH));
            }
            if (cfg && Array.isArray(cfg.fewShotExamples)) {
                cfg.fewShotExamples.forEach(function(ex) {
                    if (typeof ex === 'string') {
                        texts.push(ex.slice(0, MAX_BOOTSTRAP_TEXT_LENGTH));
                    } else if (ex && typeof ex.output === 'string') {
                        texts.push(ex.output.slice(0, MAX_BOOTSTRAP_TEXT_LENGTH));
                    } else if (ex && typeof ex.input === 'string') {
                        texts.push(ex.input.slice(0, MAX_BOOTSTRAP_TEXT_LENGTH));
                    }
                });
            }
        });
    }
    return texts;
}

const BOOTSTRAP_CHECKPOINT_NAME = 'kesempatan-llm-bootstrap-large';
let __backgroundTrainingPromise = null;

function trainInBackgroundThenSave(corpus) {
    if (__backgroundTrainingPromise) return;
    __backgroundTrainingPromise = (async function() {
        await new Promise(function(resolve) { setTimeout(resolve, 0); });
        try {
            if (Logger) {
                Logger.info('KesempatanLLM', 'Training latar belakang dimulai (tidak memblokir eksekusi)...');
            }
            await window.KesempatanLLM.core.train(corpus.slice(0, 15), { epochs: 1, learningRate: 1e-3, optimizer: 'adam' });
            const saveResult = await window.KesempatanLLM.core.save(BOOTSTRAP_CHECKPOINT_NAME, { name: BOOTSTRAP_CHECKPOINT_NAME });
            if (Logger) {
                Logger.info('KesempatanLLM', saveResult && saveResult.success
                    ? 'Training latar belakang selesai, checkpoint tersimpan — run berikutnya akan lebih baik'
                    : 'Training latar belakang selesai, TAPI checkpoint gagal tersimpan: ' + (saveResult && saveResult.error));
            }
        } catch (e) {
            if (Logger) {
                Logger.warn('KesempatanLLM', 'Training latar belakang gagal (model tetap bisa dipakai dengan bobot sebelumnya): ' + e.message);
            }
        } finally {
            __backgroundTrainingPromise = null;
        }
    })();
}

function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise(function(_, reject) {
            setTimeout(function() {
                reject(new Error('Timeout: ' + label + ' melebihi ' + ms + 'ms'));
            }, ms);
        })
    ]);
}

async function ensureKesempatanLLMReady() {
    if (window.KesempatanLLM && window.KesempatanLLM.isReady && window.KesempatanLLM.isReady()) {
        return true;
    }
    if (!window.KesempatanLLM || !window.KesempatanLLM.isReady) {
        return false;
    }
    if (window.KesempatanLLM.isReady()) {
        return true;
    }
    if (isDeviceKnownSlow()) {
        window.__kesempatanLLMSkipThisSession = true;
        if (Logger) {
            Logger.info('KesempatanLLM', 'Perangkat ini tercatat lambat dari sesi sebelumnya (cache 24 jam) — langsung pakai provider luar, tidak menunggu inisialisasi ulang');
        }
        return false;
    }
    try {
        await withTimeout(
            window.KesempatanLLM.initialize({ fromCheckpoint: BOOTSTRAP_CHECKPOINT_NAME }),
            15000,
            'pemulihan checkpoint'
        );
        if (window.KesempatanLLM.isReady()) {
            if (Logger) {
                Logger.info('KesempatanLLM', 'Dipulihkan dari checkpoint tersimpan');
            }
            return true;
        }
    } catch (e) {
        if (Logger && e.message && e.message.indexOf('Timeout') === 0) {
            Logger.warn('KesempatanLLM', 'Pemulihan checkpoint ' + e.message + ', lanjut coba bikin model baru');
        }
    }
    const corpus = buildBootstrapCorpus();
    if (corpus.length === 0) {
        return false;
    }
    if (showToast) {
        showToast('🧠 Menyiapkan KESEMPATAN LLM...', 'info');
    }
    await new Promise(function(resolve) { setTimeout(resolve, 50); });
    try {
        await withTimeout(
            window.KesempatanLLM.initialize({
                corpus: corpus,
                configOptions: { preset: 'large' },
                skipAutoTrain: true
            }),
            45000,
            'inisialisasi model baru'
        );
        if (showToast) {
            showToast('✅ KESEMPATAN LLM siap (belajar lanjut di latar belakang)', 'success');
        }
        const ready = window.KesempatanLLM.isReady();
        if (ready) {
            (async function() {
                await new Promise(function(resolve) { setTimeout(resolve, 5000); });
                while (__activeGenerateCount > 0) {
                    await new Promise(function(resolve) { setTimeout(resolve, 2000); });
                }
                trainInBackgroundThenSave(corpus);
            })();
        }
        return ready;
    } catch (e) {
        window.__kesempatanLLMSkipThisSession = true;
        markDeviceSlow();
        if (Logger) {
            Logger.error('KesempatanLLM', (e.message && e.message.indexOf('Timeout') === 0
                ? 'Inisialisasi ' + e.message + ' — perangkat ini kemungkinan terlalu lambat untuk KESEMPATAN LLM, pakai provider luar untuk sesi ini'
                : 'Auto-inisialisasi gagal: ' + e.message));
        }
        if (showToast) {
            showToast('⚠️ KESEMPATAN LLM terlalu lambat di perangkat ini — pakai provider luar', 'warning');
        }
        return false;
    }
}

function searchWorldData(topic) {
    if (!Array.isArray(window.__STATIC_DATA) || window.__STATIC_DATA.length === 0) {
        return [];
    }
    const keywords = topic.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 3; });
    if (keywords.length === 0) {
        return [];
    }
    const matches = [];
    for (let i = 0; i < window.__STATIC_DATA.length && matches.length < 2; i++) {
        const text = JSON.stringify(window.__STATIC_DATA[i]).toLowerCase();
        if (keywords.some(function(kw) { return text.includes(kw); })) {
            matches.push(window.__STATIC_DATA[i]);
        }
    }
    return matches;
}

async function searchPastReports(topic, db) {
    if (!db || typeof db.getReports !== 'function') {
        return [];
    }
    try {
        const reports = await db.getReports(20);
        const keywords = topic.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 3; });
        return reports.filter(function(r) {
            const text = (r.topic || '').toLowerCase();
            return keywords.some(function(kw) { return text.includes(kw); });
        }).slice(0, 2);
    } catch (_) {
        return [];
    }
}

function getAgentCacheKey(agent, model, prompt) {
    let hash = 0;
    const str = agent + '|' + model + '|' + prompt.substring(0, 500);
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(36);
}

async function tryGetCachedAgentResult(agent, model, prompt) {
    if (!window.KesCacheDB) return null;
    try {
        const key = getAgentCacheKey(agent, model, prompt);
        const entry = await window.KesCacheDB.getCachedResponse(key);
        if (!entry) return null;
        const ONE_HOUR = 3600000;
        if (Date.now() - entry.timestamp > ONE_HOUR) return null;
        return entry.response;
    } catch (_) {
        return null;
    }
}

async function cacheAgentResultIfValid(agent, model, prompt, parsed) {
    if (!window.KesCacheDB) return;
    const hasNoMetrics = !parsed.metrics || Object.values(parsed.metrics).every(function(v) { return !v; });
    const isFailed = parsed.status === 'fallback' || parsed.status === 'failed' || parsed.status === 'degraded' || (parsed.score === 0 && hasNoMetrics);
    if (isFailed) return;
    try {
        const key = getAgentCacheKey(agent, model, prompt);
        await window.KesCacheDB.setCachedResponse(key, agent, parsed);
    } catch (_) {}
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.WorkflowLLMBridge = Object.freeze({
    callGenerativeEngine: callGenerativeEngine,
    ensureKesempatanLLMReady: ensureKesempatanLLMReady,
    searchWorldData: searchWorldData,
    searchPastReports: searchPastReports,
    getAgentCacheKey: getAgentCacheKey,
    tryGetCachedAgentResult: tryGetCachedAgentResult,
    cacheAgentResultIfValid: cacheAgentResultIfValid
});

window.callGenerativeEngine = callGenerativeEngine;
window.ensureKesempatanLLMReady = ensureKesempatanLLMReady;
window.searchWorldData = searchWorldData;
window.searchPastReports = searchPastReports;
window.getAgentCacheKey = getAgentCacheKey;
window.tryGetCachedAgentResult = tryGetCachedAgentResult;
window.cacheAgentResultIfValid = cacheAgentResultIfValid;
})();
import { Utils } from './utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const { Logger, showToast, InternalLogger } = Utils;

const LLM_GENERATE_TIMEOUT_MS = 45000;
const LLM_SLOW_DEVICE_KEY = 'kes_llm_slow_device_until';
const LLM_SLOW_DEVICE_TTL_MS = 24 * 60 * 60 * 1000;

// Pilihan model lokal pengguna (Pengaturan -> settings.js) — disimpan di
// localStorage supaya tidak reset saat refresh. 'engine-50m-offline' bukan
// modelKey Core Engine v2 sungguhan — itu sinyal "jangan pakai v2 sama
// sekali, langsung Core Engine v1" (transformer buatan sendiri, <15MB,
// selalu tersedia tanpa jaringan).
const LLM_MODEL_CHOICE_KEY = 'kes_llm_model_choice';
const LLM_MODEL_CHOICE_OFFLINE = 'engine-50m-offline';
const LLM_MODEL_CHOICE_DEFAULT = 'smollm2-135m';

function getPersistedModelChoice() {
    try {
        return localStorage.getItem(LLM_MODEL_CHOICE_KEY) || LLM_MODEL_CHOICE_DEFAULT;
    } catch (e) {
        return LLM_MODEL_CHOICE_DEFAULT;
    }
}

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
    } catch (e) {
        InternalLogger.warn('Workflow', 'Mark device slow failed: ' + e.message);
    }
}

let __activeGenerateCount = 0;

// ============================================================
// TELEMETRI — window.KESEMPATAN.LLMTelemetry: hitung berapa kali jalur
// lokal vs eksternal benar-benar dipakai, latensi, dan berapa karakter
// dihasilkan lokal — dipakai untuk memverifikasi "Primary Route" (lokal
// harus jadi jalur utama, eksternal cuma fallback) benar-benar terjadi
// di lapangan, bukan cuma niat di kode.
// ============================================================
const LLM_TELEMETRY = window.KESEMPATAN.LLMTelemetry || (function() {
    const store = {
        local: { calls: 0, failures: 0, totalLatencyMs: 0, totalCharsGenerated: 0 },
        external: { calls: 0, failures: 0, totalLatencyMs: 0 },
        recent: []
    };
    window.KESEMPATAN.LLMTelemetry = store;
    return store;
})();

function recordLLMTelemetry(engine, latencyMs, success, extra) {
    const bucket = engine === 'local' ? LLM_TELEMETRY.local : LLM_TELEMETRY.external;
    bucket.calls++;
    if (!success) bucket.failures++;
    bucket.totalLatencyMs += latencyMs;
    if (engine === 'local' && extra && typeof extra.chars === 'number') {
        bucket.totalCharsGenerated += extra.chars;
    }
    LLM_TELEMETRY.recent.push(Object.assign({ engine: engine, latencyMs: latencyMs, success: success, ts: Date.now() }, extra || {}));
    if (LLM_TELEMETRY.recent.length > 30) {
        LLM_TELEMETRY.recent.shift();
    }
}

// Kondisi PERSIS yang menentukan apakah callGenerativeEngine() akan
// mencoba jalur lokal lebih dulu — diekspos terpisah supaya workflow.js
// bisa MEMPREDIKSI kunci cache (response-cache.js) SEBELUM generate()
// benar-benar dipanggil, tanpa duplikasi kondisi yang bisa melenceng.
function isLocalEngineEligible() {
    return !window.__kesempatanLLMSkipThisSession && !!window.KesempatanLLM &&
        typeof window.KesempatanLLM.isReady === 'function' && window.KesempatanLLM.isReady();
}

// Core Engine v2 (model pretrained sungguhan lewat @huggingface/transformers,
// lihat llm-transformers-bridge.js) — kalau siap, INI yang dicoba PALING
// DULU (Primary Route), sebelum Core Engine v1 (transformer buatan sendiri
// ~50 juta parameter) dan sebelum provider API eksternal.
function isV2EngineEligible() {
    if (getPersistedModelChoice() === LLM_MODEL_CHOICE_OFFLINE) return false;
    return !window.__kesempatanLLM2SkipThisSession && !!window.KesempatanLLM2 &&
        typeof window.KesempatanLLM2.isReady === 'function' && window.KesempatanLLM2.isReady();
}

// Mengembalikan { text, engine } — engine: 'local-v2' | 'local' | 'external'.
// Dulu cuma mengembalikan string mentah, membuat pemanggil (workflow.js)
// TIDAK BISA tahu mesin mana yang sebenarnya menjawab (termasuk saat lokal
// timeout lalu diam-diam fallback ke luar di tengah panggilan) — akibatnya
// cache respons (response-cache.js) menyimpan hasil dari mesin berbeda-beda
// di bawah SATU kunci model yang sama, saling menimpa cache secara acak.
// Sekarang engine yang SEBENARNYA dipakai selalu ikut dikembalikan.
//
// URUTAN (Primary Route sesuai permintaan — jangan panggil API eksternal
// selama Worker lokal berjalan normal):
//   1. Core Engine v2 (pretrained, WebGPU/WASM)
//   2. Core Engine v1 (transformer buatan sendiri, selalu tersedia offline)
//   3. Provider API eksternal (last resort)
async function callGenerativeEngine(prompt, agent, topic) {
    if (isV2EngineEligible()) {
        __activeGenerateCount++;
        const startedAt = performance.now();
        try {
            const text = await withTimeout(
                window.KesempatanLLM2.generate(prompt, {}),
                LLM_GENERATE_TIMEOUT_MS,
                'generate Core Engine v2'
            );
            if (text && text.trim().length >= 10) {
                recordLLMTelemetry('local-v2', Math.round(performance.now() - startedAt), true, { agent: agent, chars: text.length });
                return { text: text, engine: 'local-v2' };
            }
            if (Logger) {
                Logger.warn('Workflow', 'Agent "' + agent + '": Core Engine v2 hasil nyaris kosong, coba engine berikutnya');
            }
            recordLLMTelemetry('local-v2', Math.round(performance.now() - startedAt), false, { agent: agent, reason: 'empty-output' });
        } catch (e) {
            // Generasi yang masih berjalan di Worker TIDAK dibatalkan paksa
            // (transformers.js belum terbukti mendukung interupsi per-token
            // yang andal) — dibiarkan selesai sendiri di latar belakang,
            // hasilnya cuma dibuang. UI tidak pernah menunggu/beku karenanya.
            if (Logger) {
                Logger.warn('Workflow', 'Agent "' + agent + '": Core Engine v2 gagal/timeout (' + e.message + '), coba engine berikutnya');
            }
            recordLLMTelemetry('local-v2', Math.round(performance.now() - startedAt), false, { agent: agent, reason: e.message });
        } finally {
            __activeGenerateCount--;
        }
        // jatuh ke Core Engine v1 di bawah (bukan langsung ke eksternal)
    }

    if (isLocalEngineEligible()) {
        __activeGenerateCount++;
        const startedAt = performance.now();
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
                    recordLLMTelemetry('local', Math.round(performance.now() - startedAt), false, { agent: agent, reason: 'timeout' });
                    const extStartedAt = performance.now();
                    const externalText = await window.AIClients.generateWithFallback(prompt, agent, null, topic);
                    recordLLMTelemetry('external', Math.round(performance.now() - extStartedAt), true, { agent: agent, reason: 'local-timeout-fallback' });
                    return { text: externalText, engine: 'external' };
                }
                recordLLMTelemetry('local', Math.round(performance.now() - startedAt), true, { agent: agent, chars: text.length });
                return { text: text, engine: 'local' };
            } catch (e) {
                clearTimeout(timeoutId);
                recordLLMTelemetry('local', Math.round(performance.now() - startedAt), false, { agent: agent, reason: e.message });
                throw e;
            }
        } finally {
            __activeGenerateCount--;
        }
    }
    const extStartedAt = performance.now();
    const externalText = await window.AIClients.generateWithFallback(prompt, agent, null, topic);
    recordLLMTelemetry('external', Math.round(performance.now() - extStartedAt), true, { agent: agent, reason: 'local-unavailable' });
    return { text: externalText, engine: 'external' };
}

const MAX_BOOTSTRAP_AGENTS = 999;
const MAX_BOOTSTRAP_TEXT_LENGTH = 800;

function buildBootstrapCorpus() {
    const texts = [];
    if (window.AGENTS_CONFIG) {
        const names = Object.keys(window.AGENTS_CONFIG).slice(0, MAX_BOOTSTRAP_AGENTS);
        names.forEach(function(name) {
            const agentConfig = window.AGENTS_CONFIG[name];
            if (agentConfig && agentConfig.systemPrompt) {
                texts.push(String(agentConfig.systemPrompt).slice(0, MAX_BOOTSTRAP_TEXT_LENGTH));
            }
            if (agentConfig && Array.isArray(agentConfig.fewShotExamples)) {
                agentConfig.fewShotExamples.forEach(function(ex) {
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

// ============================================================
// CORE ENGINE v2 READINESS — mirip ensureKesempatanLLMReady() di bawah,
// tapi jauh lebih sederhana: v2 tidak perlu bootstrap corpus/training,
// cuma initialize() sekali (unduh+muat model, dicache lewat IndexedDB di
// llm-transformers-worker.js sehingga percobaan BERIKUTNYA jauh lebih
// cepat). Kunci localStorage TERPISAH dari v1 supaya kegagalan salah satu
// engine tidak ikut membuat engine yang lain dilewati.
// ============================================================
const LLM2_SLOW_DEVICE_KEY = 'kes_llm2_slow_device_until';
const LLM2_INIT_TIMEOUT_MS = 90000; // unduh model pertama kali bisa perlu waktu lebih lama dari v1

function isV2DeviceKnownSlow() {
    try {
        const until = parseInt(localStorage.getItem(LLM2_SLOW_DEVICE_KEY), 10);
        return !isNaN(until) && Date.now() < until;
    } catch (e) {
        return false;
    }
}

function markV2DeviceSlow() {
    try {
        localStorage.setItem(LLM2_SLOW_DEVICE_KEY, String(Date.now() + LLM_SLOW_DEVICE_TTL_MS));
    } catch (e) {
        InternalLogger.warn('Workflow', 'Mark v2 device slow failed: ' + e.message);
    }
}

let __v2InitPromise = null;

async function ensureKesempatanLLMv2Ready() {
    const modelKey = getPersistedModelChoice();
    if (modelKey === LLM_MODEL_CHOICE_OFFLINE) {
        // Pengguna secara eksplisit memilih "Engine 50M (Cadangan Offline)"
        // di Pengaturan -- v2 (pretrained, butuh unduhan) tidak boleh dicoba
        // sama sekali, langsung ke Core Engine v1.
        return false;
    }
    if (window.KesempatanLLM2 && window.KesempatanLLM2.isReady && window.KesempatanLLM2.isReady()) {
        const active = window.KesempatanLLM2.getDeviceInfo ? window.KesempatanLLM2.getDeviceInfo().modelKey : null;
        if (active === modelKey) {
            return true;
        }
        // Pengguna ganti pilihan model SETELAH model lain sudah termuat --
        // initialize() di bawah akan lepas model lama & muat yang baru
        // (lihat initializeEngine() di llm-transformers-worker.js), jadi
        // lanjut ke jalur inisialisasi normal, bukan early-return true.
    }
    if (!window.KesempatanLLM2 || !window.KesempatanLLM2.initialize) {
        return false;
    }
    if (window.__kesempatanLLM2SkipThisSession) {
        return false;
    }
    if (isV2DeviceKnownSlow()) {
        window.__kesempatanLLM2SkipThisSession = true;
        if (Logger) {
            Logger.info('KesempatanLLM2', 'Perangkat/browser ini tercatat gagal memuat Core Engine v2 sebelumnya (cache 24 jam) — langsung coba engine lain');
        }
        return false;
    }
    // Kalau initialize() sedang berjalan (dipanggil bersamaan dari beberapa
    // agen paralel), semua pemanggil menunggu Promise YANG SAMA, bukan
    // memicu initialize() berkali-kali.
    if (__v2InitPromise) {
        return __v2InitPromise;
    }
    __v2InitPromise = (async function () {
        try {
            if (showToast) {
                showToast('⬇️ Menyiapkan Core Engine v2 (model bisa perlu diunduh sekali)...', 'info');
            }
            await withTimeout(window.KesempatanLLM2.initialize(modelKey), LLM2_INIT_TIMEOUT_MS, 'inisialisasi Core Engine v2');
            if (Logger) {
                Logger.info('KesempatanLLM2', 'Core Engine v2 siap dipakai (' + modelKey + ')');
            }
            return true;
        } catch (e) {
            window.__kesempatanLLM2SkipThisSession = true;
            markV2DeviceSlow();
            if (Logger) {
                Logger.warn('KesempatanLLM2', 'Inisialisasi Core Engine v2 gagal (' + e.message + ') — pakai Core Engine v1/provider luar untuk sesi ini');
            }
            return false;
        } finally {
            __v2InitPromise = null;
        }
    })();
    return __v2InitPromise;
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
    } catch (error) {
        InternalLogger.warn('Workflow', 'Search past reports failed: ' + error.message);
        return [];
    }
}

function getAgentCacheKey(agent, model, prompt) {
    let hash = 0;
    const cacheKeySource = agent + '|' + model + '|' + prompt.substring(0, 500);
    for (let i = 0; i < cacheKeySource.length; i++) {
        hash = ((hash << 5) - hash) + cacheKeySource.charCodeAt(i);
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
    } catch (error) {
        InternalLogger.warn('Workflow', 'Read agent cache failed: ' + error.message);
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
    } catch (error) {
        InternalLogger.warn('Workflow', 'Write agent cache failed: ' + error.message);
    }
}

export const WorkflowLLMBridge = Object.freeze({
    callGenerativeEngine: callGenerativeEngine,
    ensureKesempatanLLMReady: ensureKesempatanLLMReady,
    ensureKesempatanLLMv2Ready: ensureKesempatanLLMv2Ready,
    searchWorldData: searchWorldData,
    searchPastReports: searchPastReports,
    getAgentCacheKey: getAgentCacheKey,
    tryGetCachedAgentResult: tryGetCachedAgentResult,
    cacheAgentResultIfValid: cacheAgentResultIfValid,
    isLocalEngineEligible: isLocalEngineEligible,
    isV2EngineEligible: isV2EngineEligible,
    getPersistedModelChoice: getPersistedModelChoice
});

KESEMPATAN.WorkflowLLMBridge = WorkflowLLMBridge;
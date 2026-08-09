/* ============================================================
   KESEMPATAN OS - CORE ENGINE v2 ENTRY POINT (Web Worker Bridge)
   📁 llm-transformers-bridge.js

   Jembatan pesan ke llm-transformers-worker.js (Worker module yang
   menjalankan model pretrained sungguhan lewat @huggingface/transformers).
   Pola SAMA seperti kesem-llm.js (id-based request/response, Worker lazy,
   destroy() untuk bebaskan RAM/VRAM) — bedanya di sini Worker HARUS
   dibuat dengan { type: 'module' } karena worker-nya pakai import()
   dinamis untuk memuat pustaka dari CDN.

   window.KesempatanLLM2 dipakai workflow-llm-bridge.js sebagai jalur
   PALING UTAMA (Core Engine v2) — window.KesempatanLLM (v1, transformer
   buatan sendiri ~50 juta parameter) tetap ada sebagai fallback kedua
   yang selalu tersedia tanpa jaringan sama sekali, sebelum akhirnya
   jatuh ke provider API eksternal.
   ============================================================ */

(function () {
    'use strict';

    if (window.__KesemLLM2EntryLoaded) {
        return;
    }
    window.__KesemLLM2EntryLoaded = true;

    const Logger = window.Utils?.Logger || {
        info: function () { /* silent */ },
        warn: function () { /* silent */ },
        error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
    };

    let worker = null;
    let nextId = 1;
    const pending = new Map();
    let engineReady = false;
    let lastKnownDevice = null;
    let lastKnownModelId = null;

    const progressListeners = [];
    function onProgress(listener) {
        if (typeof listener === 'function') progressListeners.push(listener);
        return function unsubscribe() {
            const idx = progressListeners.indexOf(listener);
            if (idx > -1) progressListeners.splice(idx, 1);
        };
    }

    function emitProgress(data) {
        window.KESEMPATAN = window.KESEMPATAN || {};
        window.KESEMPATAN.ModelDownloadProgress = Object.assign({ updatedAt: Date.now() }, data);
        progressListeners.forEach(function (listener) {
            try { listener(data); } catch (e) { /* listener error tidak boleh mematikan worker */ }
        });
    }

    // Idle cleanup — sama seperti kesem-llm.js: model pretrained ini bisa
    // menempati RAM/VRAM signifikan (puluhan-ratusan MB tergantung dtype),
    // bebaskan otomatis kalau tidak dipakai lama.
    let lastActivityAt = Date.now();
    const IDLE_DESTROY_MS = 10 * 60 * 1000;
    let idleWatcherInterval = null;

    function touchActivity() {
        lastActivityAt = Date.now();
    }

    function destroy() {
        if (worker) {
            worker.terminate();
            worker = null;
        }
        pending.forEach(function (entry) {
            entry.reject(new Error('[KesempatanLLM2] Worker dihentikan (destroy/idle cleanup)'));
        });
        pending.clear();
        engineReady = false;
        Logger.info('KesemLLM2Entry', 'Worker Core Engine v2 dihentikan, RAM/VRAM dibebaskan');
    }

    function ensureIdleWatcher() {
        if (idleWatcherInterval) return;
        idleWatcherInterval = setInterval(function () {
            if (worker && pending.size === 0 && (Date.now() - lastActivityAt) > IDLE_DESTROY_MS) {
                destroy();
            }
        }, 60000);
    }

    function ensureWorker() {
        if (worker) return worker;
        // { type: 'module' } wajib -- llm-transformers-worker.js pakai
        // dynamic import() untuk memuat @huggingface/transformers dari CDN.
        worker = new Worker('llm-transformers-worker.js', { type: 'module' });
        ensureIdleWatcher();
        worker.onmessage = function (e) {
            if (e.data && e.data.type === 'progress') {
                lastKnownDevice = e.data.device || lastKnownDevice;
                lastKnownModelId = e.data.modelId || lastKnownModelId;
                lastKnownModelKey = e.data.modelKey || lastKnownModelKey;
                emitProgress(e.data);
                return;
            }
            const id = e.data.id;
            const entry = pending.get(id);
            if (!entry) return;
            pending.delete(id);
            if (e.data.success) {
                entry.resolve(e.data.result);
            } else {
                entry.reject(new Error(e.data.error || 'Worker Core Engine v2 error tanpa pesan'));
            }
        };
        worker.onerror = function (err) {
            Logger.error('KesemLLM2Entry', 'Worker Core Engine v2 error: ' + (err && err.message ? err.message : String(err)));
            pending.forEach(function (entry) {
                entry.reject(new Error('Worker Core Engine v2 crash: ' + (err && err.message ? err.message : String(err))));
            });
            pending.clear();
        };
        return worker;
    }

    function callWorker(type, payload) {
        touchActivity();
        return new Promise(function (resolve, reject) {
            const id = nextId++;
            pending.set(id, { resolve: resolve, reject: reject });
            ensureWorker().postMessage({ id: id, type: type, payload: payload || {} });
        });
    }

    let lastKnownModelKey = null;

    // modelKey: 'smollm2-135m' (default) | 'qwen2.5-0.5b' — lihat
    // MODEL_REGISTRY di llm-transformers-worker.js. Kalau berbeda dari
    // model yang sedang aktif, Worker otomatis lepas pipeline lama dan
    // muat yang baru (lihat initializeEngine() di worker).
    async function initialize(modelKey) {
        const result = await callWorker('initialize', { modelKey: modelKey });
        engineReady = true;
        lastKnownDevice = result.device;
        lastKnownModelId = result.modelId;
        lastKnownModelKey = result.modelKey;
        Logger.info('KesempatanLLM2', 'Core Engine v2 siap — model "' + result.modelId + '" @ ' + result.device + ' (dtype: ' + result.dtype + ')');
        return result;
    }

    function isReady() {
        return engineReady;
    }

    function getDeviceInfo() {
        return { device: lastKnownDevice, modelId: lastKnownModelId, modelKey: lastKnownModelKey, ready: engineReady };
    }

    // options: { systemPrompt, maxNewTokens, temperature, topP, repetitionPenalty }
    async function generate(prompt, options) {
        const result = await callWorker('generate', { prompt: prompt, options: options || {} });
        return result.text;
    }

    window.KesempatanLLM2 = {
        isReady: isReady,
        initialize: initialize,
        generate: generate,
        destroy: destroy,
        getDeviceInfo: getDeviceInfo,
        onProgress: onProgress
    };

    Logger.info('KesemLLM2Entry', '✅ Core Engine v2 (Transformers.js) bridge siap — Worker dibuat lazy di panggilan pertama');
})();

/* ============================================================
   KESEMPATAN OS - KESEMPATAN LLM ENTRY POINT (WEB WORKER BRIDGE)
   📁 kesem-llm/kesem-llm.js

   🔧 PERUBAHAN ARSITEKTURAL (Juli 2026): file ini SEBELUMNYA memuat 25
   modul lewat <script> tag berurutan di thread UI utama — artinya
   SEBERAT apapun komputasinya (training, BPE, forward pass transformer),
   itu semua ikut menempati thread yang sama dengan rendering/input
   pengguna. Beberapa percobaan (yield setTimeout(0), pangkas panjang
   sekuens, perkecil korpus bootstrap) hanya MENGURANGI durasi tiap
   "jeda beku", tidak pernah MENGHILANGKANNYA — di perangkat yang lambat,
   satu langkah komputasi yang masih berat tetap terasa macet.

   Sekarang: 24 modul (llm-config.js ... llm-index.js) dipindah untuk
   berjalan di dalam Web Worker (lihat llm-worker.js) — thread terpisah
   sepenuhnya dari UI di level browser/OS. window.KesempatanLLM di sini
   adalah JEMBATAN PESAN ke worker itu, dengan bentuk API yang PERSIS
   SAMA seperti sebelumnya (isReady/initialize/generate/core.save/
   core.load/core.train) — kode pemanggil (workflow.js) TIDAK PERLU
   diubah sama sekali.

   Satu pengecualian: localStorage TIDAK ADA di dalam Worker, jadi
   penyimpanan checkpoint dipecah — worker cuma membangun/memulihkan
   OBJEK checkpoint (komputasi murni), thread utama (di sini) yang
   benar-benar baca/tulis localStorage.
   ============================================================ */

(function() {
    'use strict';

    if (window.__KesemLLMEntryLoaded) {
        return;
    }
    window.__KesemLLMEntryLoaded = true;

    const Logger = window.Utils?.Logger || {
        info: function() { /* silent — pakai window.Utils.Logger kalau tersedia */ },
        warn: function() { /* silent */ },
        error: function(mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
    };

    // (STORAGE_PREFIX localStorage lama dihapus — sudah migrasi ke
    // IndexedDB, lihat saveCheckpointObjectToStorage/
    // loadCheckpointObjectFromStorage di bawah)

    // ============================================================
    // 1. BUAT WORKER + JEMBATAN PESAN (request/response berbasis id)
    // ============================================================
    let worker = null;
    let nextId = 1;
    const pending = new Map();
    let modelReady = false;

    function ensureWorker() {
        if (worker) {
            return worker;
        }
        worker = new Worker('llm-worker.js');
        worker.onmessage = function(e) {
            if (e.data && e.data.type === 'progress') {
                Logger.info('KesemLLMEntry', '✅ Loaded: kesem-llm/' + e.data.file + ' (' + e.data.loaded + '/' + e.data.total + ')');
                return;
            }
            const id = e.data.id;
            const entry = pending.get(id);
            if (!entry) {
                return; // pesan tanpa pending request (tidak seharusnya terjadi)
            }
            pending.delete(id);
            if (e.data.success) {
                entry.resolve(e.data.result);
            } else {
                entry.reject(new Error(e.data.error || 'Worker error tanpa pesan'));
            }
        };
        worker.onerror = function(err) {
            Logger.error('KesemLLMEntry', 'Worker error: ' + (err && err.message ? err.message : String(err)));
            pending.forEach(function(entry) {
                entry.reject(new Error('Worker crash: ' + (err && err.message ? err.message : String(err))));
            });
            pending.clear();
        };
        return worker;
    }

    function callWorker(type, payload) {
        return new Promise(function(resolve, reject) {
            const id = nextId++;
            pending.set(id, { resolve: resolve, reject: reject });
            ensureWorker().postMessage({ id: id, type: type, payload: payload || {} });
        });
    }

    // ============================================================
    // 2. PENYIMPANAN CHECKPOINT (localStorage cuma ada di thread ini)
    // ============================================================
    // MIGRASI KE INDEXEDDB (Juli 2026) — root cause SEBENARNYA kenapa
    // model tidak pernah mengingat training antar sesi: localStorage
    // cuma ~5-10MB, checkpoint model besar puluhan MB — SELALU
    // QuotaExceededError, diam-diam gagal. IndexedDB kuotanya jauh
    // lebih besar. Sama seperti llm-checkpoint.js, tapi file INI yang
    // benar-benar dipanggil workflow.js lewat window.KesempatanLLM.
    const IDB_NAME = 'kesempatan_llm_checkpoints';
    const IDB_VERSION = 1;
    const IDB_STORE = 'checkpoints';

    function openCheckpointDB() {
        return new Promise(function (resolve, reject) {
            const request = indexedDB.open(IDB_NAME, IDB_VERSION);
            request.onupgradeneeded = function () {
                const db = request.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE, { keyPath: 'name' });
                }
            };
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error || new Error('Gagal membuka IndexedDB')); };
        });
    }

    async function saveCheckpointObjectToStorage(checkpointObj, name) {
        try {
            const db = await openCheckpointDB();
            await new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put({ name: name, checkpoint: checkpointObj, savedAt: Date.now() });
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error || new Error('Gagal menulis checkpoint')); };
            });
            db.close();
            return { success: true, key: name, sizeBytes: JSON.stringify(checkpointObj).length };
        } catch (e) {
            return { success: false, error: e.message || String(e) };
        }
    }

    async function loadCheckpointObjectFromStorage(name) {
        try {
            const db = await openCheckpointDB();
            const result = await new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const req = tx.objectStore(IDB_STORE).get(name);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error || new Error('Gagal membaca checkpoint')); };
            });
            db.close();
            return result ? result.checkpoint : null;
        } catch (e) {
            return null;
        }
    }

    // ============================================================
    // 3. window.KesempatanLLM — BENTUK API PERSIS SAMA SEPERTI SEBELUM
    //    MIGRASI WORKER, supaya workflow.js/api.js tidak perlu berubah
    // ============================================================
    async function initialize(options) {
        options = options || {};

        if (options.fromCheckpoint) {
            const saved = await loadCheckpointObjectFromStorage(options.fromCheckpoint);
            if (!saved) {
                throw new Error('[KesempatanLLM] Checkpoint "' + options.fromCheckpoint + '" tidak ditemukan');
            }
            const result = await callWorker('restoreFromCheckpoint', { checkpoint: saved });
            modelReady = true;
            Logger.info('KesempatanLLM', 'Dipulihkan dari checkpoint "' + options.fromCheckpoint + '" (vocab: ' + result.vocabSize + ')');
            return result;
        }

        if (!options.corpus) {
            throw new Error('[KesempatanLLM] initialize butuh options.corpus (kalau tidak ada fromCheckpoint)');
        }

        const result = await callWorker('initialize', {
            corpus: options.corpus,
            configOptions: options.configOptions,
            skipAutoTrain: options.skipAutoTrain,
            autoTrainMaxSequences: options.autoTrainMaxSequences,
            autoTrainEpochs: options.autoTrainEpochs,
            autoTrainLearningRate: options.autoTrainLearningRate,
            yieldEvery: options.yieldEvery
        });
        modelReady = true;
        return result;
    }

    function isReady() {
        return modelReady;
    }

    function generate(prompt, agentName, topic, extraOptions) {
        const promise = callWorker('generate', { prompt: prompt, agentName: agentName, topic: topic, extraOptions: extraOptions });
        // Id dipakai callWorker() SEBELUM promise ini dibuat (nextId sudah
        // bertambah di dalamnya) — ambil dari nextId-1 supaya pemanggil
        // bisa targetkan stop() ke request YANG BENAR, bukan "yang sedang
        // aktif" (root cause bug: 1 agen di mode paralel bisa tersasar
        // sinyal stop milik agen lain).
        promise.requestId = nextId - 1;
        return promise;
    }

    function stop(targetId) {
        if (worker) {
            worker.postMessage({ id: 0, type: 'stop', payload: { targetId: targetId } });
        }
    }

    async function coreSave(name, metadata) {
        const checkpointObj = await callWorker('buildCheckpoint', { metadata: metadata });
        return saveCheckpointObjectToStorage(checkpointObj, name);
    }

    async function coreLoad(name) {
        const saved = await loadCheckpointObjectFromStorage(name);
        if (!saved) {
            throw new Error('[KesempatanLLM] Checkpoint "' + name + '" tidak ditemukan');
        }
        const result = await callWorker('restoreFromCheckpoint', { checkpoint: saved });
        modelReady = true;
        return result;
    }

    function coreTrain(corpus, options) {
        return callWorker('train', { corpus: corpus, options: options });
    }

    function coreGetStats() {
        return callWorker('getStats');
    }

    window.KesempatanLLM = {
        isReady: isReady,
        initialize: initialize,
        generate: generate,
        stop: stop,
        core: {
            save: coreSave,
            load: coreLoad,
            train: coreTrain,
            getStats: coreGetStats
        }
    };

    // ============================================================
    // 4. SIAP — Worker dibuat LAZY (baru benar-benar start di panggilan
    //    pertama lewat ensureWorker()), jadi event ini bisa langsung
    //    dipancarkan tanpa menunggu apa pun.
    // ============================================================
    Logger.info('KesemLLMEntry', '✅ KESEMPATAN LLM siap (mode Web Worker — UI tidak akan pernah beku karenanya)');
    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('kesem-llm-ready'));
    }
    if (window._onKesemLLMReady && typeof window._onKesemLLMReady === 'function') {
        window._onKesemLLMReady();
    }

})();

/* ============================================================
   KESEMPATAN OS - KESEMPATAN LLM Web Worker
   Lokasi: kesem-llm/llm-worker.js

   FIX ARSITEKTURAL (bukan tambal sulam lagi): semua percobaan
   sebelumnya (yield setTimeout(0), pangkas panjang sekuens, perkecil
   korpus bootstrap) hanya MENGURANGI seberapa sering/seberapa besar
   satu "jeda beku" terjadi — tidak pernah MENGHILANGKANNYA, karena
   selama komputasi berjalan di thread UI yang sama, satu langkah yang
   masih berat (forward+backward transformer, BPE merge korpus besar,
   dst) tetap akan terasa macet di perangkat yang lambat.

   File ini menjalankan SELURUH engine KESEMPATAN LLM (24 modul, lewat
   importScripts) di dalam Web Worker — thread terpisah sepenuhnya dari
   UI. Seberapa berat pun komputasi di sini, thread UI utama TIDAK
   PERNAH ikut beku, karena keduanya benar-benar berjalan paralel di
   level browser/OS, bukan sekadar "bergiliran" seperti yield.

   Tidak ada satu pun dari 24 file modul (llm-config.js ... llm-api.js,
   llm-index.js) yang perlu diubah untuk ini — baris `self.window = self`
   di bawah membuat semua `window.LLMXxx = {...}` di file-file itu tetap
   berfungsi apa adanya di dalam worker (window tidak ada di worker,
   tapi `self` ada, dan keduanya sekarang menunjuk objek yang sama).

   BATASAN YANG PERLU DIKETAHUI:
   1. localStorage TIDAK ADA di dalam Worker (beda dari window) — save/
      load checkpoint karena itu dipecah: worker cuma membangun/memulihkan
      OBJEK checkpoint (murni komputasi), penyimpanan ke localStorage
      dilakukan thread utama (lihat kesem-llm.js) lewat pesan.
   2. Retriever RAG (llm-retriever.js) mencari window.VectorMemory/
      KESDatabase/World — semua itu hidup di thread utama, TIDAK bisa
      diakses dari dalam worker (scope global benar-benar terpisah).
      Guard di retriever.js sudah aman (return array kosong, tidak
      throw), jadi RAG otomatis nonaktif di dalam worker untuk saat ini
      — perlu jembatan pesan terpisah kalau mau diaktifkan lagi
      (di luar cakupan perbaikan sesi ini).
   ============================================================ */

// Shim supaya SEMUA file modul (yang menulis `window.LLMXxx = ...`)
// tetap berfungsi tanpa diubah sedikit pun di dalam Worker.
self.window = self;

const MODULES = [
    'llm-config.js', 'llm-tokenizer.js', 'llm-vocabulary.js', 'llm-embedding.js',
    'llm-gpu.js', 'llm-attention.js', 'llm-transformer.js', 'llm-encoder.js', 'llm-decoder.js',
    'llm-inference.js', 'llm-sampler.js', 'llm-runtime.js', 'llm-knowledge-graph.js',
    'llm-retriever.js', 'llm-context-builder.js', 'llm-reasoning.js', 'llm-tool-router.js',
    'llm-weights.js', 'llm-checkpoint.js', 'llm-quantization.js', 'llm-optimizer.js',
    'llm-scheduler.js', 'llm-trainer.js', 'llm-core.js', 'llm-api.js', 'llm-index.js'
];
MODULES.forEach(function (file, i) {
    importScripts(file);
    self.postMessage({ type: 'progress', file: file, loaded: i + 1, total: MODULES.length });
});

// stopSignal BERSAMA untuk panggilan 'generate' yang sedang berjalan —
// pesan 'stop' dari thread utama meng-aktifkannya, menghentikan loop
// generate() SUNGGUHAN (bukan cuma berhenti ditunggu).
// Peta stopSignal per-id request — SEBELUMNYA satu variabel dipakai
// bersama semua request 'generate', menyebabkan sinyal timeout salah
// sasaran kalau 2+ request diproses berdekatan (persis situasi mode
// paralel: beberapa agen kirim 'generate' hampir bersamaan). Sekarang
// tiap request generate dilacak dengan id-nya sendiri.
const stopSignals = new Map();

self.onmessage = async function (e) {
    const id = e.data.id;
    const type = e.data.type;
    const payload = e.data.payload || {};

    try {
        let result;
        switch (type) {
            case 'isReady':
                result = self.KesempatanLLM.isReady();
                break;

            case 'initialize': {
                const model = await self.KesempatanLLM.initialize(payload);
                // Objek model (Map, closure, dll) tidak bisa di-postMessage
                // utuh — cukup kirim ringkasan, model asli tetap tersimpan
                // di dalam worker (di closure llm-core.js).
                result = { vocabSize: model.vocab.size };
                break;
            }

            case 'generate': {
                const signal = { stopped: false };
                stopSignals.set(id, signal);
                const extraOptions = Object.assign({}, payload.extraOptions || {}, { stopSignal: signal });
                try {
                    result = await self.KesempatanLLM.generate(payload.prompt, payload.agentName, payload.topic, extraOptions);
                } finally {
                    stopSignals.delete(id);
                }
                break;
            }

            case 'stop':
                if (payload.targetId && stopSignals.has(payload.targetId)) {
                    stopSignals.get(payload.targetId).stopped = true;
                } else if (!payload.targetId) {
                    // Tidak ada target spesifik — hentikan semua yang sedang
                    // jalan (fallback aman utk pemanggil lama/generik).
                    stopSignals.forEach(function (s) { s.stopped = true; });
                }
                result = { stopped: true };
                break;

            case 'train':
                result = await self.KesempatanLLM.core.train(payload.corpus, payload.options);
                break;

            case 'buildCheckpoint':
                // Bagian PENYIMPANAN (localStorage) sengaja TIDAK di sini —
                // lihat catatan batasan di atas. Ini cuma membangun objek
                // checkpoint (murni komputasi); thread utama yang menyimpan.
                result = self.KesempatanLLM.core.buildCheckpointObject(payload.metadata);
                break;

            case 'restoreFromCheckpoint':
                {
                    const model = self.KesempatanLLM.core.restoreFromCheckpointObject(payload.checkpoint);
                    result = { vocabSize: model.vocab.size };
                }
                break;

            case 'getStats':
                result = self.KesempatanLLM.core.getStats();
                break;

            default:
                throw new Error('[llm-worker] Tipe pesan tidak dikenal: ' + type);
        }
        self.postMessage({ id: id, success: true, result: result });
    } catch (err) {
        self.postMessage({ id: id, success: false, error: err && err.message ? err.message : String(err) });
    }
};

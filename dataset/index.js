// KESEMPATAN OS - DATASET LOADER
// Menggabungkan 5 file kategori (bisnis, general, politik, global, sains —
// masing-masing selaras 1:1 dengan salah satu dari 5 file agents/agents-*.js)
// jadi satu korpus datar. Dipakai sebagai bahan konteks tambahan untuk LLM
// lokal lewat buildBootstrapCorpus() di js/workflow/workflow-llm-bridge.js — BUKAN
// untuk RAG/world-knowledge (itu tugas dataries/world.js, jalur terpisah).
//
// Setiap entri: { text: string, metadata: { category:'dataset', domain,
// agent, topic, tags } }. `domain` menunjuk salah satu dari 5 kategori;
// `agent` (kalau ada) menunjuk nama key persis di window.AGENTS_CONFIG.
import { DATA as BISNIS } from './bisnis.js';
import { DATA as GENERAL } from './general.js';
import { DATA as POLITIK } from './politik.js';
import { DATA as GLOBAL } from './global.js';
import { DATA as SAINS } from './sains.js';

export const DATASET_CORPUS = [
    ...BISNIS,
    ...GENERAL,
    ...POLITIK,
    ...GLOBAL,
    ...SAINS
];

export const DATASET_BY_DOMAIN = {
    bisnis: BISNIS,
    general: GENERAL,
    politik: POLITIK,
    global: GLOBAL,
    sains: SAINS
};

// getDatasetTexts(maxEntries, maxCharsPerEntry): bentuk siap-pakai untuk
// buildBootstrapCorpus() — array string biasa (bukan {text,metadata}),
// masing-masing dipotong ke maxCharsPerEntry, dibatasi total maxEntries.
// Pembatasan ini disengaja: korpus dipakai juga untuk melatih ulang
// tokenizer BPE (lihat createModel() di kesem-llm/llm-runtime.js) yang
// biaya komputasinya naik seiring ukuran korpus — caller yang menentukan
// batas aman, fungsi ini sendiri tidak memaksakan default tersembunyi.
export function getDatasetTexts(maxEntries, maxCharsPerEntry) {
    const limit = Number.isInteger(maxEntries) && maxEntries > 0 ? maxEntries : DATASET_CORPUS.length;
    const charCap = Number.isInteger(maxCharsPerEntry) && maxCharsPerEntry > 0 ? maxCharsPerEntry : 800;
    return DATASET_CORPUS.slice(0, limit).map(function (item) {
        return String(item.text || '').slice(0, charCap);
    });
}

window.KESEMPATAN_DATASET = {
    corpus: DATASET_CORPUS,
    byDomain: DATASET_BY_DOMAIN,
    getTexts: getDatasetTexts
};

if (window.InternalLogger) {
    window.InternalLogger.info('DatasetIndex', 'Dataset LLM lokal siap: ' + DATASET_CORPUS.length + ' entri dari 5 domain (bisnis/general/politik/global/sains)');
}

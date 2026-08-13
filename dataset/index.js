









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

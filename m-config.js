/* ============================================================
KESEMPATAN OS - MEMORY CONFIG
============================================================ */
(function () {
'use strict';

if (window.__MemoryConfigLoaded) {
    return;
}

window.__MemoryConfigLoaded = true;

window.MemoryConfig = Object.freeze({
    DIMENSION: 384,
    MAX_MEMORY: 10000000,
    CACHE_TTL: 3600000,
    BATCH_SIZE: 1000,
    SIMILARITY_THRESHOLD: 0.1,
    AUTO_OPTIMIZE_INTERVAL: 300000,
    ENCRYPTION_ENABLED: true,
    INDEX_REBUILD_THRESHOLD: 10000,
    NUM_SHARDS: 4,
    NUM_HASH_FUNCTIONS: 10,
    PQ_SUBVECTORS: 8,
    PQ_CENTROIDS: 256,
    HNSW_MAX_CONNECTIONS: 16,
    HNSW_EF_CONSTRUCTION: 200,
    HNSW_EF_SEARCH: 50,
    GPU_ENABLED: true,
    WASM_ENABLED: false,
    MULTIMODAL_ENABLED: true,
    FEDERATED_LEARNING_ENABLED: true,
    AUTO_TUNE_K_FOLD: 5,
    WASM_PATH: 'vector_memory.wasm'
});

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('MemoryConfig', 'Loaded');
}

})();
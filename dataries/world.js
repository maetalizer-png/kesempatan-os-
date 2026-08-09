/* ============================================================
KESEMPATAN OS - WORLD LOADER
Auto-loader data statis & dinamis (country, city, lingo, src,
marplace, paluang, sapaan). Data statis -> __STATIC_DATA,
data dinamis -> VectorMemory.
============================================================ */
(function () {
'use strict';

// ============================================================
// CEK DOUBLE LOAD
// ============================================================
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__WorldLoaderLoaded) {
    return;
}

window.__WorldLoaderLoaded = true;

// ============================================================
// FALLBACK LOGGER
// Menulis ke console HANYA jika logger terpusat (InternalLogger
// dari helpers.js) belum ada saat file ini jalan. Karena world.js
// biasanya di-load SEBELUM helpers.js, fallback inilah yang
// menampilkan progres load di console. JANGAN di-senyap-kan
// (jangan dijadikan function kosong), karena itu akan menghilangkan
// SELURUH log world.js dari console (ini penyebab log "hilang"
// pada versi sebelumnya). Pada boot normal di mana InternalLogger
// sudah tersedia, objek ini tidak dipakai dan log mengalir ke
// logger terpusat.
// ============================================================
const InternalLogger = window.InternalLogger || {
    _logs: [],
    _maxLogs: 1000,
    _levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 },
    _level: 1,
    _getLevelPrefix: function (level) {
        const prefixes = { 0: '[DEBUG]', 1: '[INFO]', 2: '[WARN]', 3: '[ERROR]', 4: '[CRITICAL]' };
        return prefixes[level] || '[INFO]';
    },
    log: function (level, module, message) {
        if (this._level <= level && typeof console !== 'undefined') {
            const prefix = this._getLevelPrefix(level);
            console.log(prefix + ' [' + module + '] ' + message);
        }
    },
    info: function (module, message) { this.log(this._levels.INFO, module, message); },
    warn: function (module, message) { this.log(this._levels.WARN, module, message); },
    error: function (module, message) { this.log(this._levels.ERROR, module, message); }
};

// ============================================================
// KONFIGURASI
// ============================================================
const CONFIG = Object.freeze({
    BATCH_SIZE: 10,
    DELAY_BETWEEN_BATCH: 100,
    DELAY_BETWEEN_FILES: 50,
    MAX_RETRIES: 2,
    RETRY_DELAY: 2000,
    MAX_DATA_PER_SESSION: 1000,
    STORAGE_KEY: 'kes_world_loader_progress',
    MAX_DYNAMIC_VECTORS: 300
});

// ============================================================
// DAFTAR FILE YANG AKAN DI-LOAD
// ============================================================
const FILES_TO_LOAD = Object.freeze([
    // ========== SAPAAN (2 file - 26 sapaan + 82 balasan kabar) ==========
    // FIX: dipindah ke PALING AWAL (sebelumnya paling akhir dari daftar
    // file). Loader ini sequential dengan jeda 500ms/file + 1000ms/batch
    // simpan, jadi kalau sapaan ada di urutan terakhir butuh belasan-
    // puluhan detik dulu baru siap. Padahal sapaan paling sering
    // dibutuhkan di detik-detik pertama sesi chat (user buka app lalu
    // langsung bilang "selamat pagi"). Datanya kecil jadi taruh di depan
    // tidak menunda data lain secara berarti.
    'dataries/sapaan/greetings.js',
    'dataries/sapaan/interaktif.js',
    // ========== ASIA (5 file - 48 negara) ==========
    'dataries/country/asian-tenggara.js',
    'dataries/country/asian-timur.js',
    'dataries/country/asian-selatan.js',
    'dataries/country/asian-barat.js',
    'dataries/country/asian-tengah.js',
    // ========== EROPA (5 file - 42 negara) ==========
    'dataries/country/eropan-timur.js',
    'dataries/country/eropan-barat.js',
    'dataries/country/eropan-selatan.js',
    'dataries/country/eropan-tengah.js',
    'dataries/country/eropan-utara.js',
    // ========== AMERIKA (4 file - 30 negara) ==========
    'dataries/country/american-utara.js',
    'dataries/country/american-tengah.js',
    'dataries/country/american-karibia.js',
    'dataries/country/american-selatan.js',
    // ========== AFRIKA (5 file - 29 negara) ==========
    'dataries/country/african-utara.js',
    'dataries/country/african-timur.js',
    'dataries/country/african-selatan.js',
    'dataries/country/african-barat.js',
    'dataries/country/african-tengah.js',
    // ========== OSEANIA (1 file - 20 negara) ==========
    'dataries/country/osenian.js',
    // ========== CITIES (1 file - 12 kota) ==========
    'dataries/cities/asia-tenggara.js',
    // ========== LINGO (5 file - 100+ bahasa) ==========
    'dataries/lingo/asean-tenggara.js',
    'dataries/lingo/asean-timur.js',
    'dataries/lingo/asean-selatan.js',
    'dataries/lingo/asean-barat.js',
    'dataries/lingo/asean-tengah.js',
    // ========== SRC (3 file - 120+ sumber) ==========
    'dataries/src/regional.js',
    'dataries/src/global.js',
    'dataries/src/international.js',
    // ========== MARPLACE (5 file - 22 data) ==========
    'dataries/marplace/ecommerce.js',
    'dataries/marplace/properti.js',
    'dataries/marplace/otomotif.js',
    'dataries/marplace/freelance.js',
    'dataries/marplace/karir.js',
    // ========== PALUANG (5 file - 27 data) ==========
    'dataries/paluang/sektor.js',
    'dataries/paluang/peluang-daerah.js',
    'dataries/paluang/tren.js',
    'dataries/paluang/kompetensi.js',
    'dataries/paluang/investasi.js'
]);

// ============================================================
// STATE
// ============================================================
let loadedFiles = 0;
const totalFiles = FILES_TO_LOAD.length;
let hasError = false;
let isProcessing = false;
let isPaused = false;
let totalDataItems = 0;
let successItems = 0;
let failedItems = 0;
let currentBatch = 0;
let totalBatches = 0;
let startTime = 0;
let staticCount = 0;
let dynamicCount = 0;

// ============================================================
// SLEEP
// ============================================================
const sleep = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};

// ============================================================
// LOAD FILE SATU PER SATU
// ============================================================
const loadFile = function (path) {
    return new Promise(function (resolve) {
        const script = document.createElement('script');

        script.src = path;
        script.async = false;

        script.onload = function () {
            loadedFiles++;
            InternalLogger.info('WorldLoader', 'Loaded: ' + path + ' (' + loadedFiles + '/' + totalFiles + ')');
            resolve();
        };

        script.onerror = function () {
            fetch(path)
                .then(function (r) {
                    if (!r.ok) {
                        throw new Error('HTTP ' + r.status);
                    }

                    return r.text();
                })
                .then(function (code) {
                    try {
                        // === ZONA MERAH (KEAMANAN) ===
                        // eval() mengeksekusi string sebagai kode. Aman HANYA
                        // selama isi file data sepenuhnya lokal & tepercaya.
                        // Jika sumber data bisa dipengaruhi pihak luar, ganti
                        // fallback ini (mis. tolak, atau parse sebagai data
                        // murni via JSON terkontrol). Jangan biarkan eval
                        // menelan input yang tidak tepercaya.
                        eval(code);
                        loadedFiles++;
                        InternalLogger.info('WorldLoader', 'Loaded (fallback): ' + path + ' (' + loadedFiles + '/' + totalFiles + ')');
                        resolve();
                    } catch (e) {
                        hasError = true;
                        loadedFiles++;
                        InternalLogger.warn('WorldLoader', 'Error in: ' + path + ' - ' + e.message);
                        resolve();
                    }
                })
                .catch(function (err) {
                    hasError = true;
                    loadedFiles++;
                    InternalLogger.warn('WorldLoader', 'Failed: ' + path + ' (' + err.message + ')');
                    resolve();
                });
        };

        document.head.appendChild(script);
    });
};

// ============================================================
// CEK TIPE DATA (STATIS ATAU DINAMIS)
// ============================================================
const isStaticData = function (item) {
    const type = item.metadata?.type || '';
    const category = item.metadata?.category || '';
    const subcategory = item.metadata?.subcategory || '';

    // Data statis tidak masuk VectorMemory.
    const STATIC_TYPES = ['country', 'language', 'city', 'source', 'marplace', 'paluang', 'sapaan'];
    const STATIC_CATEGORIES = ['country', 'language', 'city', 'source', 'marplace', 'paluang', 'sapaan'];
    const STATIC_SUBCATEGORIES = ['regional', 'international', 'global'];

    if (STATIC_TYPES.includes(type)) {
        return true;
    }

    if (STATIC_CATEGORIES.includes(category)) {
        return true;
    }

    if (STATIC_SUBCATEGORIES.includes(subcategory)) {
        return true;
    }

    return false;
};

// ============================================================
// SAVE BATCH KE TEMPAT YANG TEPAT
// ============================================================
const saveBatchWithRetry = async function (batch, batchIndex, retryCount) {
    retryCount = retryCount || 0;

    try {
        for (let i = 0; i < batch.length; i++) {
            const item = batch[i];

            // Pilah data statis vs dinamis.
            if (isStaticData(item)) {
                // Statis -> __STATIC_DATA (memori langsung).
                if (typeof window.__STATIC_DATA === 'undefined') {
                    window.__STATIC_DATA = [];
                }

                window.__STATIC_DATA.push(item);
                staticCount++;
            } else {
                // Dinamis -> VectorMemory.
                if (dynamicCount < CONFIG.MAX_DYNAMIC_VECTORS) {
                    await window.VectorMemory.save(item.text, item.metadata);
                    dynamicCount++;
                } else {
                    // Lewat batas dinamis -> jatuh ke statis.
                    if (typeof window.__STATIC_DATA === 'undefined') {
                        window.__STATIC_DATA = [];
                    }

                    window.__STATIC_DATA.push(item);
                    staticCount++;
                    InternalLogger.warn('WorldLoader', 'Dynamic limit reached, storing as static');
                }
            }

            successItems++;
            totalDataItems++;
        }

        return {
            success: true,
            count: batch.length
        };
    } catch (error) {
        if (retryCount < CONFIG.MAX_RETRIES) {
            InternalLogger.warn('WorldLoader', 'Batch ' + batchIndex + ' failed, retrying (' + (retryCount + 1) + '/' + CONFIG.MAX_RETRIES + ')');
            await sleep(CONFIG.RETRY_DELAY);

            return saveBatchWithRetry(batch, batchIndex, retryCount + 1);
        }

        failedItems += batch.length;
        InternalLogger.error('WorldLoader', 'Batch ' + batchIndex + ' failed after ' + CONFIG.MAX_RETRIES + ' retries');

        return {
            success: false,
            count: 0,
            error: error.message
        };
    }
};

// ============================================================
// PROSES DATA DENGAN QUEUE
// ============================================================
const processDataWithQueue = async function (dataItems) {
    if (typeof dataItems === 'undefined' || dataItems.length === 0) {
        return {
            success: 0,
            failed: 0,
            total: 0
        };
    }

    if (typeof window.VectorMemory === 'undefined') {
        InternalLogger.warn('WorldLoader', 'VectorMemory not available, saving all to static memory');

        // Fallback: semua jadi statis.
        if (typeof window.__STATIC_DATA === 'undefined') {
            window.__STATIC_DATA = [];
        }

        for (const item of dataItems) {
            window.__STATIC_DATA.push(item);
            staticCount++;
        }

        return {
            success: dataItems.length,
            failed: 0,
            total: dataItems.length
        };
    }

    const maxData = CONFIG.MAX_DATA_PER_SESSION;
    const limitedData = dataItems.slice(0, maxData);

    if (dataItems.length > maxData) {
        InternalLogger.warn('WorldLoader', 'Data limited to ' + maxData + ' items (total: ' + dataItems.length + ')');
    }

    const total = limitedData.length;
    const batches = [];
    const batchSize = CONFIG.BATCH_SIZE;

    for (let i = 0; i < total; i += batchSize) {
        batches.push(limitedData.slice(i, i + batchSize));
    }

    totalBatches = batches.length;
    currentBatch = 0;

    let totalSuccess = 0;
    let totalFailed = 0;

    InternalLogger.info('WorldLoader', 'Processing ' + total + ' items in ' + totalBatches + ' batches');
    InternalLogger.info('WorldLoader', 'Static data: ' + staticCount + ' | Dynamic data: ' + dynamicCount);

    for (let b = 0; b < batches.length; b++) {
        while (isPaused) {
            InternalLogger.info('WorldLoader', 'Paused, waiting');
            await sleep(1000);
        }

        currentBatch = b + 1;

        const batch = batches[b];
        const result = await saveBatchWithRetry(batch, b + 1);

        if (result.success) {
            totalSuccess += result.count;
        } else {
            totalFailed += batch.length;
        }

        if (b < batches.length - 1) {
            await sleep(CONFIG.DELAY_BETWEEN_BATCH);
        }
    }

    return {
        success: totalSuccess,
        failed: totalFailed,
        total: total
    };
};

// ============================================================
// PROSES SEMUA DATA
// ============================================================
const processAllData = async function () {
    if (isProcessing) {
        return;
    }

    isProcessing = true;
    startTime = Date.now();
    staticCount = 0;
    dynamicCount = 0;

    const register = window.__DATA_REGISTER || [];
    const totalData = register.length;

    InternalLogger.info('WorldLoader', 'Processing ' + totalData + ' data items');
    InternalLogger.info('WorldLoader', 'Static -> Memory | Dynamic -> VectorMemory');

    if (totalData === 0) {
        InternalLogger.warn('WorldLoader', 'No data to process');
        isProcessing = false;

        return;
    }

    const results = await processDataWithQueue(register);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    InternalLogger.info('WorldLoader', 'Data processing complete (' + elapsed + 's)');
    InternalLogger.info('WorldLoader', '   Success: ' + results.success);
    InternalLogger.info('WorldLoader', '   Failed: ' + results.failed);
    InternalLogger.info('WorldLoader', '   Total: ' + results.total);
    InternalLogger.info('WorldLoader', '   Static: ' + staticCount + ' (Memory)');
    InternalLogger.info('WorldLoader', '   Dynamic: ' + dynamicCount + ' (VectorMemory)');

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('world-data-loaded', {
            detail: {
                success: results.success,
                failed: results.failed,
                total: results.total,
                static: staticCount,
                dynamic: dynamicCount,
                elapsed: elapsed,
                timestamp: Date.now()
            }
        }));
    }

    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            total: results.total,
            success: results.success,
            failed: results.failed,
            static: staticCount,
            dynamic: dynamicCount,
            elapsed: elapsed
        }));
    } catch (e) {
        // silent
    }

    isProcessing = false;
};

// ============================================================
// LOAD SEMUA FILE
// ============================================================
const loadAllFiles = async function () {
    InternalLogger.info('WorldLoader', 'Loading ' + totalFiles + ' files');
    InternalLogger.info('WorldLoader', 'Country Asia: 5 files (48 countries)');
    InternalLogger.info('WorldLoader', 'Country Eropa: 5 files (42 countries)');
    InternalLogger.info('WorldLoader', 'Country Amerika: 4 files (30 countries)');
    InternalLogger.info('WorldLoader', 'Country Afrika: 5 files (29 countries)');
    InternalLogger.info('WorldLoader', 'Country Oseania: 1 file (20 countries)');
    InternalLogger.info('WorldLoader', 'Cities: 1 file (12 cities)');
    InternalLogger.info('WorldLoader', 'Lingo: 5 files (100+ languages)');
    InternalLogger.info('WorldLoader', 'Src: 3 files (120+ sources)');
    InternalLogger.info('WorldLoader', 'Marplace: 5 files (22 data)');
    InternalLogger.info('WorldLoader', 'Paluang: 5 files (27 data)');
    InternalLogger.info('WorldLoader', 'Sapaan: 2 files (26 sapaan)');
    InternalLogger.info('WorldLoader', 'TOTAL: 200+ countries, 100+ languages, 27 peluang, 26 sapaan');

    for (let i = 0; i < FILES_TO_LOAD.length; i++) {
        await loadFile(FILES_TO_LOAD[i]);

        if (i < FILES_TO_LOAD.length - 1) {
            await sleep(CONFIG.DELAY_BETWEEN_FILES);
        }
    }

    if (hasError) {
        InternalLogger.warn('WorldLoader', 'Loaded with errors, continuing');
    } else {
        InternalLogger.info('WorldLoader', 'All ' + totalFiles + ' files loaded');
    }

    await processAllData();

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('world-ready', {
            detail: {
                filesLoaded: loadedFiles,
                totalFiles: totalFiles,
                hasError: hasError,
                dataCount: (window.__DATA_REGISTER || []).length,
                staticCount: staticCount,
                dynamicCount: dynamicCount,
                timestamp: Date.now()
            }
        }));
    }
};

// ============================================================
// PUBLIC API
// ============================================================
const WorldLoader = Object.freeze({
    load: loadAllFiles,
    pause: function () {
        isPaused = true;
        InternalLogger.info('WorldLoader', 'Paused');
    },
    resume: function () {
        isPaused = false;
        InternalLogger.info('WorldLoader', 'Resumed');
    },
    getStatus: function () {
        return Object.freeze({
            isComplete: loadedFiles >= totalFiles && !isProcessing,
            loadedFiles: loadedFiles,
            totalFiles: totalFiles,
            hasError: hasError,
            isProcessing: isProcessing,
            isPaused: isPaused,
            dataCount: (window.__DATA_REGISTER || []).length,
            staticCount: staticCount,
            dynamicCount: dynamicCount,
            successItems: successItems,
            failedItems: failedItems,
            totalItems: totalDataItems,
            currentBatch: currentBatch,
            totalBatches: totalBatches,
            progress: totalBatches > 0 ? Math.round((currentBatch / totalBatches) * 100) : 0
        });
    },
    getData: function () {
        return window.__DATA_REGISTER || [];
    },
    getStaticData: function () {
        return window.__STATIC_DATA || [];
    },
    getStats: function () {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);

            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    reset: function () {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            window.__STATIC_DATA = [];
        } catch (e) {
            // silent
        }

        staticCount = 0;
        dynamicCount = 0;
        InternalLogger.info('WorldLoader', 'Reset complete');
    }
});

// ============================================================
// EKSEKUSI
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(loadAllFiles, 500);
    });
} else {
    setTimeout(loadAllFiles, 500);
}

// ============================================================
// EXPOSE
// ============================================================
KESEMPATAN.WorldLoader = WorldLoader;
window.__WorldLoaderLoaded = true;

// Inisialisasi __STATIC_DATA
if (typeof window.__STATIC_DATA === 'undefined') {
    window.__STATIC_DATA = [];
}

InternalLogger.info('WorldLoader', 'WorldLoader ready');
InternalLogger.info('WorldLoader', totalFiles + ' files registered');
InternalLogger.info('WorldLoader', '200+ countries loaded');
InternalLogger.info('WorldLoader', '100+ languages loaded');
InternalLogger.info('WorldLoader', 'Marplace loaded');
InternalLogger.info('WorldLoader', 'Paluang (5 files) loaded');
InternalLogger.info('WorldLoader', 'Sapaan loaded');
InternalLogger.info('WorldLoader', 'Batch size: ' + CONFIG.BATCH_SIZE);
InternalLogger.info('WorldLoader', 'Static data -> Memory | Dynamic -> VectorMemory');
InternalLogger.info('WorldLoader', 'Max dynamic: ' + CONFIG.MAX_DYNAMIC_VECTORS);

})();
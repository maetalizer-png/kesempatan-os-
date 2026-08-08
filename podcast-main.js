/* ============================================================
   KESEMPATAN OS v18.6 — PODCAST MAIN
   ✅ Inisialisasi, hubungkan core & ui, expose API publik
   ✅ UI sudah terpisah (renderer, handlers, main)
   ✅ TERINTEGRASI DENGAN MEMORY.JS, WORLD.JS, & KES DATABASE!
   ============================================================ */

(function() {
    'use strict';

    if (window.PodcastMain) return;
    window.PodcastMain = {};

    // ========== REFERENSI ==========
    const config = window.Podcast.config;
    const core = window.Podcast.core;
    const ui = window.Podcast.ui;

    if (!config || !core || !ui) {
        // Silent fail jika modul belum lengkap
        return;
    }

    const state = core.state;

    // ============================================================
    // 🔥 STATUS INTEGRASI EKSTERNAL
    // ============================================================
    let externalReady = {
        memory: false,
        database: false,
        world: false
    };

    function checkMemoryReady() {
        const mem = core.getMemoryInstance ? core.getMemoryInstance() : null;
        return !!mem;
    }

    function checkDatabaseReady() {
        const db = core.getDatabaseInstance ? core.getDatabaseInstance() : null;
        return !!db;
    }

    function checkWorldReady() {
        const data = core.getStaticData ? core.getStaticData() : [];
        return data.length > 0;
    }

    function updateExternalStatus() {
        externalReady.memory = checkMemoryReady();
        externalReady.database = checkDatabaseReady();
        externalReady.world = checkWorldReady();
    }

    // ============================================================
    // 🔥 LISTENER DARI EXTERNAL MODULES
    // ============================================================

    // Memory.js ready
    document.addEventListener('memory-ready', function() {
        externalReady.memory = true;
        if (window.VectorMemoryV5 && window.Podcast && window.Podcast.state) {
            window.Podcast.state._memoryInstance = window.VectorMemoryV5;
        }
        if (window.Podcast.uiRenderer && window.Podcast.uiRenderer.showToast) {
            window.Podcast.uiRenderer.showToast('🧠 Memory terhubung!');
        }
    });

    // KES Database ready
    document.addEventListener('database-ready', function(event) {
        externalReady.database = true;
        const db = event.detail || window.KESDatabase || window.db || window.Database;
        if (db && window.Podcast && window.Podcast.state) {
            window.Podcast.state._databaseInstance = db;
        }
        if (window.Podcast.uiRenderer && window.Podcast.uiRenderer.showToast) {
            window.Podcast.uiRenderer.showToast('📊 Database terhubung!');
        }
    });

    // World.js ready
    document.addEventListener('world-ready', function() {
        externalReady.world = true;
        if (window.Podcast.uiRenderer && window.Podcast.uiRenderer.showToast) {
            window.Podcast.uiRenderer.showToast('🌍 World data terhubung!');
        }
    });

    // ============================================================
    // 🔥 CEK LANGSUNG (jika sudah terload sebelum listener dipasang)
    // ============================================================
    (function checkExternalReady() {
        updateExternalStatus();
        
        // Cek Memory
        if (window.VectorMemoryV5 && !externalReady.memory) {
            externalReady.memory = true;
            if (window.Podcast && window.Podcast.state) {
                window.Podcast.state._memoryInstance = window.VectorMemoryV5;
            }
        }
        
        // Cek Database
        const db = window.KESDatabase || window.db || window.Database;
        if (db && !externalReady.database) {
            externalReady.database = true;
            if (window.Podcast && window.Podcast.state) {
                window.Podcast.state._databaseInstance = db;
            }
        }
        
        // Cek World
        if (window.__STATIC_DATA && window.__STATIC_DATA.length > 0 && !externalReady.world) {
            externalReady.world = true;
        }
    })();

    // ============================================================
    // 🔥 INIT
    // ============================================================
    function init() {
        try {
            core.loadHistory();
            core.preloadVoice();
            
            const savedTheme = state.currentTheme || 'dark';
            if (ui.applyTheme) {
                ui.applyTheme(savedTheme);
            }
            
            if (ui.render) {
                ui.render();
            }
            
            // 🔥 Update status integrasi di UI
            if (window.Podcast.uiRenderer && window.Podcast.uiRenderer.showToast) {
                const status = getIntegrationStatus();
                const ready = [];
                if (status.memory) ready.push('Memory');
                if (status.database) ready.push('Database');
                if (status.world) ready.push('World');
                if (ready.length > 0) {
                    window.Podcast.uiRenderer.showToast('🔗 Terhubung: ' + ready.join(', '));
                }
            }
            
            if ('Notification' in window) {
                Notification.requestPermission();
            }
            
            // 🔥 Auto-generate jika ada data di dashboard
            if (window.lastAggregated && ui.updateScript) {
                setTimeout(function() {
                    ui.updateScript();
                }, 1000);
            }
            
        } catch (e) {
            if (ui.showToast) {
                ui.showToast('⚠️ Gagal inisialisasi Podcast Generator', 'error');
            }
        }
    }

    // ============================================================
    // 🆕 TAHAP 2.1 — VOICE LIBRARY WORKFLOW (Filter/Search/Favorite)
    // Murni DOM manipulation, tanpa render() ulang, tanpa menyentuh
    // ui-handlers.js. Dipanggil lewat onclick/oninput di HTML (pola yang
    // sama seperti applyTheme), konsisten dengan konvensi yang sudah ada.
    // ============================================================
    function applyVoiceLibraryFilters() {
        const container = document.getElementById('voiceLibraryList');
        if (!container) return;
        const category = container.getAttribute('data-active-category') || 'all';
        const searchInput = document.getElementById('voiceSearchInput');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        container.querySelectorAll('.voice-preset-btn').forEach(function(row) {
            const gender = row.getAttribute('data-gender');
            const age = row.getAttribute('data-age');
            const style = row.getAttribute('data-style');
            const searchText = row.getAttribute('data-search') || '';

            let matchesCategory = true;
            if (category === 'male') matchesCategory = gender === 'male';
            else if (category === 'female') matchesCategory = gender === 'female';
            else if (category === 'young') matchesCategory = age === 'young';
            else if (category === 'adult') matchesCategory = age === 'adult';
            else if (category === 'senior') matchesCategory = age === 'senior';
            else if (category === 'podcast') matchesCategory = (style === 'podcast' || style === 'narrative' || style === 'storytelling');
            else if (category === 'regional') matchesCategory = style === 'accent';

            const matchesSearch = !query || searchText.indexOf(query) !== -1;
            row.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
        });
    }

    function filterVoiceBooth(category, chipEl) {
        const container = document.getElementById('voiceLibraryList');
        if (container) container.setAttribute('data-active-category', category);
        document.querySelectorAll('.voice-category-chip').forEach(function(chip) {
            const isSelected = chip === chipEl;
            chip.style.opacity = isSelected ? '1' : '0.6';
            chip.style.background = isSelected ? (config.THEMES[core.state.currentTheme] || config.THEMES.dark).primary + '18' : 'rgba(255,255,255,0.03)';
            chip.style.borderColor = isSelected ? (config.THEMES[core.state.currentTheme] || config.THEMES.dark).primary : 'transparent';
        });
        applyVoiceLibraryFilters();
    }

    function searchVoiceBooth() {
        applyVoiceLibraryFilters();
    }

    function toggleFavoriteVoice(voiceKey, event) {
        if (event) event.stopPropagation();
        try {
            const key = 'kesempatan_voice_favorites';
            let favs = JSON.parse(localStorage.getItem(key) || '[]');
            const idx = favs.indexOf(voiceKey);
            let isFav;
            if (idx >= 0) { favs.splice(idx, 1); isFav = false; } else { favs.unshift(voiceKey); isFav = true; }
            localStorage.setItem(key, JSON.stringify(favs));
            if (event && event.currentTarget) {
                event.currentTarget.textContent = isFav ? '★' : '☆';
                event.currentTarget.style.opacity = isFav ? '1' : '0.3';
            }
        } catch (_) {}
    }

    // ============================================================
    // 🔥 PUBLIC API
    // ============================================================
    
    window.PodcastGenerator = {
        // ===== CORE =====
        init: init,
        render: ui.render || function() {},
        
        // ===== CONTROL =====
        play: ui.togglePlay || function() {},
        stop: ui.stopPodcast || function() {},
        generate: ui.updateScript || function() {},
        export: ui.exportAudio || function() {},
        
        // ===== THEME & EMOTION =====
        applyTheme: ui.applyTheme || function() {},
        setEmotion: ui.setEmotion || function() {},
        applyVoice: ui.applyVoice || function() {},

        // ===== 🆕 VOICE LIBRARY WORKFLOW (Tahap 2.1) =====
        filterVoiceBooth: filterVoiceBooth,
        searchVoiceBooth: searchVoiceBooth,
        toggleFavoriteVoice: toggleFavoriteVoice,
        
        // ===== NAVIGATION =====
        skipTime: ui.skipTime || function() {},
        setSpeed: ui.setSpeed || function() {},
        togglePlayerMode: ui.togglePlayerMode || function() {},
        
        // ===== BOOKMARKS =====
        addBookmark: ui.addBookmark || function() {},
        jumpToBookmark: ui.jumpToBookmark || function() {},
        
        // ===== HISTORY =====
        loadHistoryItem: ui.loadHistoryItem || function() {},
        
        // ===== OTHER =====
        jumpToChapter: ui.jumpToChapter || function() {},
        generatePodcastText: ui.generatePodcastText || function() {},
        previewVoice: ui.previewVoice || function() {},
        toggleAutoSchedule: ui.toggleAutoSchedule || function() {},
        toggleLiveStream: ui.toggleLiveStream || function() {},
        toggleCollaborative: ui.toggleCollaborative || function() {},
        downloadScript: ui.downloadScript || function() {},
        sharePodcast: ui.sharePodcast || function() {},
        
        // ===== INTERNAL (ADVANCED) =====
        realMP3Exporter: core.exporter,
        realLiveStreamer: core.live,
        realCollaborative: core.collab,
        ai: core.ai,
        voiceEngine: core.voiceEngine,
        trackAnalytics: core.trackAnalytics || function() {},
        cleanupEventListeners: ui.cleanupEventListeners || function() {},
        
        // ============================================================
        // 🔥🔥🔥 STATUS INTEGRASI EKSTERNAL 🔥🔥🔥
        // ============================================================
        
        isMemoryReady: function() {
            return checkMemoryReady();
        },
        
        isDatabaseReady: function() {
            return checkDatabaseReady();
        },
        
        isWorldReady: function() {
            return checkWorldReady();
        },
        
        getIntegrationStatus: function() {
            updateExternalStatus();
            return {
                memory: externalReady.memory,
                database: externalReady.database,
                world: externalReady.world,
                staticDataCount: core.getStaticData ? core.getStaticData().length : 0,
                memoryVectors: (function() {
                    const mem = core.getMemoryInstance ? core.getMemoryInstance() : null;
                    return mem && mem.vectors ? mem.vectors.length : 0;
                })()
            };
        },
        
        // ============================================================
        // 🔥🔥🔥 AKSES DATA LANGSUNG 🔥🔥🔥
        // ============================================================
        
        getStaticData: function() {
            return core.getStaticData ? core.getStaticData() : [];
        },
        
        getMemoryInstance: function() {
            return core.getMemoryInstance ? core.getMemoryInstance() : null;
        },
        
        getDatabaseInstance: function() {
            return core.getDatabaseInstance ? core.getDatabaseInstance() : null;
        },
        
        // ============================================================
        // 🔥🔥🔥 FETCH DATA DARI EXTERNAL SOURCES 🔥🔥🔥
        // ============================================================
        
        fetchStaticData: function(topic) {
            return core.fetchStaticData ? core.fetchStaticData(topic) : [];
        },
        
        fetchMemoryData: function(topic, topK) {
            return core.fetchFromVectorMemory ? core.fetchFromVectorMemory(topic, topK) : Promise.resolve([]);
        },
        
        fetchDatabaseData: function(topic, limit) {
            return core.fetchFromDatabase ? core.fetchFromDatabase(topic, limit) : Promise.resolve([]);
        },
        
        // ============================================================
        // 🔥🔥🔥 SIMPAN KE EXTERNAL SOURCES 🔥🔥🔥
        // ============================================================
        
        savePodcast: function(data) {
            return core.savePodcastToMemory ? core.savePodcastToMemory(data) : Promise.resolve();
        },
        
        // ============================================================
        // 🔥🔥🔥 GET ALL CONTEXT UNTUK PODCAST 🔥🔥🔥
        // ============================================================
        
        getAllContext: async function(topic) {
            const [staticData, memoryData, dbData] = await Promise.all([
                Promise.resolve(core.fetchStaticData ? core.fetchStaticData(topic) : []),
                core.fetchFromVectorMemory ? core.fetchFromVectorMemory(topic, 3) : Promise.resolve([]),
                core.fetchFromDatabase ? core.fetchFromDatabase(topic, 3) : Promise.resolve([])
            ]);
            
            return {
                static: staticData,
                memory: memoryData,
                database: dbData,
                combined: [...staticData, ...memoryData, ...dbData],
                count: {
                    static: staticData.length,
                    memory: memoryData.length,
                    database: dbData.length,
                    total: staticData.length + memoryData.length + dbData.length
                }
            };
        },
        
        // ============================================================
        // 🔥🔥🔥 GENERATE PODCAST DENGAN SEMUA KONTEKS 🔥🔥🔥
        // ============================================================
        
        generateWithContext: async function(topic) {
            const context = await this.getAllContext(topic);
            const staticData = context.static;
            const memoryData = context.memory;
            const dbData = context.database;
            
            // Bangun prompt dengan semua data
            let prompt = 'Buat podcast profesional tentang "' + topic + '" untuk pengusaha dan pebisnis. ';
            prompt += 'Gaya: informatif, inspiratif, dan mudah dipahami. ';
            prompt += 'Struktur: Pembukaan menarik → Analisis utama → Tips praktis → Penutup. ';
            prompt += 'Durasi: 3-5 menit. ';
            prompt += 'Gunakan bahasa yang profesional namun santai, mudah dicerna, dan memotivasi.\n\n';
            
            if (staticData.length > 0) {
                prompt += '📚 DATA & FAKTA DARI WORLD:\n';
                staticData.forEach(function(item, i) {
                    const text = item.text || '';
                    prompt += (i + 1) + '. ' + text.substring(0, 200) + '...\n';
                });
                prompt += '\n';
            }
            
            if (memoryData.length > 0) {
                prompt += '🧠 INSPIRASI DARI MEMORY:\n';
                memoryData.forEach(function(item, i) {
                    const text = item.text || '';
                    prompt += (i + 1) + '. ' + text.substring(0, 200) + '...\n';
                });
                prompt += '\n';
            }
            
            if (dbData.length > 0) {
                prompt += '📊 DATA DARI DATABASE:\n';
                dbData.forEach(function(item, i) {
                    const summary = item.summary || item.insight || '';
                    prompt += (i + 1) + '. ' + summary.substring(0, 200) + '...\n';
                });
                prompt += '\n';
            }
            
            prompt += '📝 BUAT PODCAST DENGAN KONTEN DI ATAS!';
            
            // Generate dengan AI
            const text = core.ai.generateText(prompt, 800, 0.7);
            
            // 🔥 Simpan hasil ke Memory & Database
            await this.savePodcast({
                topic: topic,
                script: text,
                score: window.lastAggregated ? window.lastAggregated.score : 0,
                voice: state.currentVoiceType,
                summary: text.substring(0, 150)
            });
            
            return text;
        }
    };

    // ============================================================
    // 🔥 AUTO INIT
    // ============================================================
    if (document.readyState === 'complete') {
        setTimeout(init, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 100);
        });
    }

})();
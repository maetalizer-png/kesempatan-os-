import { THEMES } from './podcast-config.js';
import { core } from './podcast-core.js';
import { ui } from './ui-main.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.PodcastMain = {};

const state = core.state;




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






document.addEventListener('memory-ready', function() {
    externalReady.memory = true;
    if (window.VectorMemoryV5 && KESEMPATAN.Podcast && KESEMPATAN.Podcast.state) {
        KESEMPATAN.Podcast.state._memoryInstance = window.VectorMemoryV5;
    }
    if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
        KESEMPATAN.Podcast.uiRenderer.showToast('🧠 Memory terhubung!');
    }
});


document.addEventListener('database-ready', function(event) {
    externalReady.database = true;
    const db = event.detail || window.KESDatabase || window.db || window.Database;
    if (db && KESEMPATAN.Podcast && KESEMPATAN.Podcast.state) {
        KESEMPATAN.Podcast.state._databaseInstance = db;
    }
    if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
        KESEMPATAN.Podcast.uiRenderer.showToast('📊 Database terhubung!');
    }
});


document.addEventListener('world-ready', function() {
    externalReady.world = true;
    if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
        KESEMPATAN.Podcast.uiRenderer.showToast('🌍 World data terhubung!');
    }
});




(function checkExternalReady() {
    updateExternalStatus();
    
    
    if (window.VectorMemoryV5 && !externalReady.memory) {
        externalReady.memory = true;
        if (KESEMPATAN.Podcast && KESEMPATAN.Podcast.state) {
            KESEMPATAN.Podcast.state._memoryInstance = window.VectorMemoryV5;
        }
    }
    
    
    const db = window.KESDatabase || window.db || window.Database;
    if (db && !externalReady.database) {
        externalReady.database = true;
        if (KESEMPATAN.Podcast && KESEMPATAN.Podcast.state) {
            KESEMPATAN.Podcast.state._databaseInstance = db;
        }
    }
    
    
    if (window.__STATIC_DATA && window.__STATIC_DATA.length > 0 && !externalReady.world) {
        externalReady.world = true;
    }
})();




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
        
        
        if (KESEMPATAN.Podcast.uiRenderer && KESEMPATAN.Podcast.uiRenderer.showToast) {
            const status = PodcastGenerator.getIntegrationStatus();
            const ready = [];
            if (status.memory) ready.push('Memory');
            if (status.database) ready.push('Database');
            if (status.world) ready.push('World');
            if (ready.length > 0) {
                KESEMPATAN.Podcast.uiRenderer.showToast('🔗 Terhubung: ' + ready.join(', '));
            }
        }
        
        if ('Notification' in window) {
            Notification.requestPermission();
        }
        
        
        if (window.lastAggregated && ui.updateScript) {
            setTimeout(function() {
                ui.updateScript();
            }, 1000);
        }
        
    } catch (e) {
        console.error('[PodcastMain] init() gagal:', e);
        if (ui.showToast) {
            ui.showToast('⚠️ Gagal inisialisasi Podcast Generator', 'error');
        }
    }
}







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
        chip.style.background = isSelected ? (THEMES[core.state.currentTheme] || THEMES.dark).primary + '18' : 'rgba(255,255,255,0.03)';
        chip.style.borderColor = isSelected ? (THEMES[core.state.currentTheme] || THEMES.dark).primary : 'transparent';
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
    } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
}

export const PodcastGenerator = {
    init: init,
    render: ui.render || function() {},
    
    
    play: ui.togglePlay || function() {},
    stop: ui.stopPodcast || function() {},
    generate: ui.updateScript || function() {},
    export: ui.exportAudio || function() {},
    
    
    applyTheme: ui.applyTheme || function() {},
    setEmotion: ui.setEmotion || function() {},
    applyVoice: ui.applyVoice || function() {},

    
    filterVoiceBooth: filterVoiceBooth,
    searchVoiceBooth: searchVoiceBooth,
    toggleFavoriteVoice: toggleFavoriteVoice,
    
    
    skipTime: ui.skipTime || function() {},
    setSpeed: ui.setSpeed || function() {},
    togglePlayerMode: ui.togglePlayerMode || function() {},
    
    
    addBookmark: ui.addBookmark || function() {},
    jumpToBookmark: ui.jumpToBookmark || function() {},
    
    
    loadHistoryItem: ui.loadHistoryItem || function() {},
    
    
    jumpToChapter: ui.jumpToChapter || function() {},
    generatePodcastText: ui.generatePodcastText || function() {},
    previewVoice: ui.previewVoice || function() {},
    toggleAutoSchedule: ui.toggleAutoSchedule || function() {},
    toggleLiveStream: ui.toggleLiveStream || function() {},
    toggleCollaborative: ui.toggleCollaborative || function() {},
    downloadScript: ui.downloadScript || function() {},
    sharePodcast: ui.sharePodcast || function() {},
    
    
    realMP3Exporter: core.exporter,
    realLiveStreamer: core.live,
    realCollaborative: core.collab,
    ai: core.ai,
    voiceEngine: core.voiceEngine,
    trackAnalytics: core.trackAnalytics || function() {},
    cleanupEventListeners: ui.cleanupEventListeners || function() {},
    
    
    
    
    
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
    
    
    
    
    
    getStaticData: function() {
        return core.getStaticData ? core.getStaticData() : [];
    },
    
    getMemoryInstance: function() {
        return core.getMemoryInstance ? core.getMemoryInstance() : null;
    },
    
    getDatabaseInstance: function() {
        return core.getDatabaseInstance ? core.getDatabaseInstance() : null;
    },
    
    
    
    
    
    fetchStaticData: function(topic) {
        return core.fetchStaticData ? core.fetchStaticData(topic) : [];
    },
    
    fetchMemoryData: function(topic, topK) {
        return core.fetchFromVectorMemory ? core.fetchFromVectorMemory(topic, topK) : Promise.resolve([]);
    },
    
    fetchDatabaseData: function(topic, limit) {
        return core.fetchFromDatabase ? core.fetchFromDatabase(topic, limit) : Promise.resolve([]);
    },
    
    
    
    
    
    savePodcast: function(data) {
        return core.savePodcastToMemory ? core.savePodcastToMemory(data) : Promise.resolve();
    },
    
    
    
    
    
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
    
    
    
    
    
    generateWithContext: async function(topic) {
        const context = await this.getAllContext(topic);
        const staticData = context.static;
        const memoryData = context.memory;
        const dbData = context.database;
        
        
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
        
        
        const text = core.ai.generateText(prompt, 800, 0.7);
        
        
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

KESEMPATAN.PodcastGenerator = PodcastGenerator;

if (document.readyState === 'complete') {
    setTimeout(init, 100);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 100);
    });
}
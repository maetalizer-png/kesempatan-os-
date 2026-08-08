/* ============================================================
   📁 rap/logic.js (AGGREGATOR)
   🔥 GABUNGKAN SEMUA MODUL RAP, EKSPOR KE KESEMPATAN.RapBattle.logic
   🔥 ✅ SUDAH TERHUBUNG KE ENGINE BARU!
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__RapLogicAggregator) return;
    window.__RapLogicAggregator = true;

    // Pastikan semua modul sudah dimuat
    if (!KESEMPATAN.RapConfig || !KESEMPATAN.RapHelpers || !KESEMPATAN.RapEngine || !KESEMPATAN.RapOrchestrator) {
        return;
    }

    const config = KESEMPATAN.RapConfig;
    const helpers = KESEMPATAN.RapHelpers;
    const engine = KESEMPATAN.RapEngine;
    const orchestrator = KESEMPATAN.RapOrchestrator;

    // ========== GABUNGKAN SEMUA ==========
    KESEMPATAN.RapBattle = KESEMPATAN.RapBattle || {};

    KESEMPATAN.RapBattle.logic = {
        // Config & State
        CONFIG: config.CONFIG,
        rapState: config.rapState,
        getRapBattleActive: config.getRapBattleActive,
        setRapBattleActive: config.setRapBattleActive,
        getRapAbort: config.getRapAbort,
        setRapAbort: config.setRapAbort,

        // Helpers
        sanitizeHTML: helpers.sanitizeHTML,
        getTimestamp: helpers.getTimestamp,
        getDisplayName: helpers.getDisplayName,
        getApiKey: helpers.getApiKey,

        // Beat
        initBeat: orchestrator.initBeat,
        playBeat: orchestrator.playBeat,
        stopBeat: orchestrator.stopBeat,
        toggleBeat: orchestrator.toggleBeat,
        // 🔥 FIX: setBeatPattern/getBeatPattern sudah ada di orchestrator.js
        // tapi sebelumnya TIDAK diteruskan ke sini — jadi dropdown genre
        // beat di UI memanggil fungsi yang undefined (silent no-op).
        setBeatPattern: orchestrator.setBeatPattern,
        getBeatPattern: orchestrator.getBeatPattern,
        // 🔥 BARU: sistem lagu (soundbank) — ganti lagu sekaligus genre & BPM
        setActiveSong: orchestrator.setActiveSong,
        getActiveSong: orchestrator.getActiveSong,
        getCurrentBPM: orchestrator.getCurrentBPM,
        buildSongContext: orchestrator.buildSongContext,
        speakHook: orchestrator.speakHook,

        // Flow
        analyzeFlow: orchestrator.analyzeFlow,

        // Audience
        addAudienceReaction: orchestrator.addAudienceReaction,
        randomReaction: orchestrator.randomReaction,
        startAutoReactions: orchestrator.startAutoReactions,
        stopAutoReactions: orchestrator.stopAutoReactions,

        // Voice
        speakRap: orchestrator.speakRap,

        // History
        saveHistory: orchestrator.saveHistory,
        loadHistory: orchestrator.loadHistory,

        // Export
        exportRapResult: orchestrator.exportRapResult,

        // ============================================================
        // 🔥 ENGINE BARU — METHOD YANG TERSEDIA
        // ============================================================
        
        // Character Engine
        getPersona: engine.getPersona,
        getEmotion: engine.getEmotion,
        getEmotionModifier: engine.getEmotionModifier,
        getAllPersonas: engine.getAllPersonas,
        getAllPersonaCards: engine.getAllPersonaCards,
        getVoiceProfile: engine.getVoiceProfile,

        // Intelligence Engine
        getAgents: engine.getAgents,
        createBattleDirector: engine.createBattleDirector,
        predictCrowdReaction: engine.predictCrowdReaction,
        getReactions: engine.getReactions,
        getBattlePlan: engine.getBattlePlan,

        // Optimizer Engine
        learn: engine.learn,
        getLessons: engine.getLessons,
        optimizeVerse: engine.optimizeVerse,
        checkQuality: engine.checkQuality,

        // AI & Core
        buildRapPrompt: engine.buildRapPrompt,
        callAI: engine.callAI,
        getRap: engine.getRap,
        judgeRap: engine.judgeRap,

        // ============================================================
        // 🔥 COMPATIBILITY — METHOD LAMA YANG MASIH DIPERLUKAN
        // ============================================================
        
        // 🔥 Diganti dengan getBattlePlan (tetap export untuk kompatibilitas)
        chooseStrategy: function(round, totalRounds, opponentAnalysis, memory) {
            return engine.getBattlePlan(round, totalRounds);
        },

        // 🔥 Diganti dengan checkQuality (tetap export untuk kompatibilitas)
        evaluateVerseLocal: function(verse, memory) {
            return engine.checkQuality(verse);
        },

        // 🔥 Diganti dengan _analyzeOpponent (tetap export untuk kompatibilitas)
        analyzeOpponent: function(opponentVerse) {
            // Panggil private method melalui wrapper
            return engine._analyzeOpponent ? 
                engine._analyzeOpponent(opponentVerse) : 
                { keywords: [], repeatedWords: [], weaknesses: [] };
        },

        // 🔥 Battle Memory (tetap)
        createBattleMemory: engine._extractSignature ? 
            function() { return { usedEndings: new Set(), usedOpeners: new Set(), wordCounts: {}, ownVerses: [] }; } :
            function() { return { usedEndings: new Set(), usedOpeners: new Set(), wordCounts: {}, ownVerses: [] }; },
        
        updateMemory: function(memory, verse) {
            if (!memory) return;
            if (engine._extractSignature) {
                const sig = engine._extractSignature(verse);
                sig.endings.forEach(function(e) { memory.usedEndings.add(e); });
                memory.ownVerses.push(verse);
                if (memory.ownVerses.length > 2) memory.ownVerses.shift();
            }
        },

        // Orchestrator - Main
        startRapBattle: orchestrator.startRapBattle,
        abortRap: orchestrator.abortRap,
        runTournament: orchestrator.runTournament,
        getLeaderboard: orchestrator.getLeaderboard,
        getFameTier: orchestrator.getFameTier,
        announceHallOfFame: orchestrator.announceHallOfFame
    };

    // (log dihapus)
})();
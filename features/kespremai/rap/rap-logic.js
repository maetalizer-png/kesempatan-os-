

import { RapConfig as config } from './rap-config.js';
import { RapHelpers as helpers } from './rap-helpers.js';
import { RapEngine as engine } from './rap-engine.js';
import { RapOrchestrator as orchestrator } from './rap-orchestrator.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.RapBattle = KESEMPATAN.RapBattle || {};

export const logic = {
    
    CONFIG: config.CONFIG,
    rapState: config.rapState,
    getRapBattleActive: config.getRapBattleActive,
    setRapBattleActive: config.setRapBattleActive,
    getRapAbort: config.getRapAbort,
    setRapAbort: config.setRapAbort,

    
    sanitizeHTML: helpers.sanitizeHTML,
    getTimestamp: helpers.getTimestamp,
    getDisplayName: helpers.getDisplayName,
    getApiKey: helpers.getApiKey,

    
    initBeat: orchestrator.initBeat,
    playBeat: orchestrator.playBeat,
    stopBeat: orchestrator.stopBeat,
    toggleBeat: orchestrator.toggleBeat,
    
    
    
    setBeatPattern: orchestrator.setBeatPattern,
    getBeatPattern: orchestrator.getBeatPattern,
    
    setActiveSong: orchestrator.setActiveSong,
    getActiveSong: orchestrator.getActiveSong,
    getCurrentBPM: orchestrator.getCurrentBPM,
    buildSongContext: orchestrator.buildSongContext,
    speakHook: orchestrator.speakHook,

    
    analyzeFlow: orchestrator.analyzeFlow,

    
    addAudienceReaction: orchestrator.addAudienceReaction,
    randomReaction: orchestrator.randomReaction,
    startAutoReactions: orchestrator.startAutoReactions,
    stopAutoReactions: orchestrator.stopAutoReactions,

    
    speakRap: orchestrator.speakRap,

    
    saveHistory: orchestrator.saveHistory,
    loadHistory: orchestrator.loadHistory,

    
    exportRapResult: orchestrator.exportRapResult,

    
    
    
    
    
    getPersona: engine.getPersona,
    getEmotion: engine.getEmotion,
    getEmotionModifier: engine.getEmotionModifier,
    getAllPersonas: engine.getAllPersonas,
    getAllPersonaCards: engine.getAllPersonaCards,
    getVoiceProfile: engine.getVoiceProfile,

    
    getAgents: engine.getAgents,
    createBattleDirector: engine.createBattleDirector,
    predictCrowdReaction: engine.predictCrowdReaction,
    getReactions: engine.getReactions,
    getBattlePlan: engine.getBattlePlan,

    
    learn: engine.learn,
    getLessons: engine.getLessons,
    optimizeVerse: engine.optimizeVerse,
    checkQuality: engine.checkQuality,

    
    buildRapPrompt: engine.buildRapPrompt,
    callAI: engine.callAI,
    getRap: engine.getRap,
    judgeRap: engine.judgeRap,

    
    
    
    
    
    chooseStrategy: function(round, totalRounds, opponentAnalysis, memory) {
        return engine.getBattlePlan(round, totalRounds);
    },

    
    evaluateVerseLocal: function(verse, memory) {
        return engine.checkQuality(verse);
    },

    
    analyzeOpponent: function(opponentVerse) {
        
        return engine._analyzeOpponent ? 
            engine._analyzeOpponent(opponentVerse) : 
            { keywords: [], repeatedWords: [], weaknesses: [] };
    },

    
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

    
    startRapBattle: orchestrator.startRapBattle,
    abortRap: orchestrator.abortRap,
    runTournament: orchestrator.runTournament,
    getLeaderboard: orchestrator.getLeaderboard,
    getFameTier: orchestrator.getFameTier,
    announceHallOfFame: orchestrator.announceHallOfFame
};

KESEMPATAN.RapBattle.logic = logic;



const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;


const CONFIG = {
    
    STORAGE_KEY: 'rap_battle_history_v11',
    MAX_HISTORY: 50,

    
    VOICE_RATE: 0.95,
    VOICE_PITCH: 1.1,

    
    MAX_ROUNDS: 7,
    BEAT_BPM: 140,
    REACTIONS: ['🔥', '😂', '🎉', '💯', '👏', '🔥🔥', '💀'],

    
    AI_TEMPERATURE: 1.0,       
    AI_MAX_TOKENS: 800,        

    
    TARGET_SYLLABLES: 11,
    SYLLABLE_TOLERANCE: 5      
};


const rapState = {
    status: 'idle',
    currentRound: 0,
    maxRounds: 3,
    topic: '',
    agentA: '',
    agentB: '',
    history: [],
    startTime: null,
    timerId: null
};

let rapBattleActive = false;
let rapAbort = false;


export const RapConfig = {
    CONFIG: CONFIG,
    rapState: rapState,
    getRapBattleActive: function() { return rapBattleActive; },
    setRapBattleActive: function(val) { rapBattleActive = val; },
    getRapAbort: function() { return rapAbort; },
    setRapAbort: function(val) { rapAbort = val; }
};

KESEMPATAN.RapConfig = RapConfig;

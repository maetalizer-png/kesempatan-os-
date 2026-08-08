/* ============================================================
   📁 rap/config.js
   🔥 KONFIGURASI & STATE RAP BATTLE
   🔥 ENHANCE: Temperature lebih tinggi untuk kreativitas maksimal
   ============================================================ */

(function() {
    'use strict';

    if (window.__RapConfig) return;
    window.__RapConfig = true;

    // ========== CONFIG ==========
    const CONFIG = {
        // Storage
        STORAGE_KEY: 'rap_battle_history_v11',
        MAX_HISTORY: 50,

        // Voice
        VOICE_RATE: 0.95,
        VOICE_PITCH: 1.1,

        // Battle
        MAX_ROUNDS: 7,
        BEAT_BPM: 140,
        REACTIONS: ['🔥', '😂', '🎉', '💯', '👏', '🔥🔥', '💀'],

        // 🔥 AI CONFIG — KREATIVITAS TINGGI
        AI_TEMPERATURE: 1.0,       // lebih tinggi = lebih kreatif & berani (default 0.85)
        AI_MAX_TOKENS: 800,        // lebih panjang untuk cerita yang lebih kaya

        // 🔥 RHYTHM CONFIG — Longgar, fokus ke ekspresi
        TARGET_SYLLABLES: 11,
        SYLLABLE_TOLERANCE: 5      // lebih longgar (6-16) biar ekspresi bebas
    };

    // ========== STATE ==========
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

    // ========== EXPORT ==========
    window.RapConfig = {
        CONFIG: CONFIG,
        rapState: rapState,
        getRapBattleActive: function() { return rapBattleActive; },
        setRapBattleActive: function(val) { rapBattleActive = val; },
        getRapAbort: function() { return rapAbort; },
        setRapAbort: function(val) { rapAbort = val; }
    };
})();
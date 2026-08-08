/* ============================================================
   📁 rap/engine/intelligence.js
   🔥 INTELLIGENCE ENGINE — MULTI-AGEN + STRATEGI + CROWD
   🔥 11 AGEN SPESIALIS DISKUSI + BATTLE PLANNER 7 RONDE
   ============================================================ */

(function() {
    'use strict';

    if (window.__RapIntelligenceEngine) return;
    window.__RapIntelligenceEngine = true;

    // ============================================================
    // 1. REACTIONS — PREDIKSI REAKSI CROWD
    // ============================================================
    
    const REACTIONS = {
        laugh: { emoji: '😂', name: 'Laugh', trigger: 'humor' },
        gasp: { emoji: '😱', name: 'Gasps', trigger: 'shock' },
        silence: { emoji: '🤫', name: 'Silence', trigger: 'deep' },
        replay: { emoji: '🔄', name: 'Replay', trigger: 'callback' },
        roomShaker: { emoji: '🔥', name: 'Room Shaker', trigger: 'energy' },
        haymaker: { emoji: '💥', name: 'Haymaker', trigger: 'punchline' },
        standingOvation: { emoji: '🎊', name: 'Standing Ovation', trigger: 'closer' },
        crowdSplit: { emoji: '⚔️', name: 'Crowd Split', trigger: 'controversial' },
        shockValue: { emoji: '😲', name: 'Shock Value', trigger: 'unexpected' }
    };

    function predictCrowdReaction(verse) {
        const lower = verse.toLowerCase();
        if (lower.includes('!')) return REACTIONS.haymaker;
        if (lower.includes('?')) return REACTIONS.shockValue;
        if (verse.length < 50) return REACTIONS.silence;
        if (verse.includes('😂') || lower.includes('laugh')) return REACTIONS.laugh;
        return REACTIONS.roomShaker;
    }

    // ============================================================
    // 2. AGEN SPESIALIS (11 AGEN)
    // ============================================================
    
    const AGENTS = {
        strategist: {
            name: 'Strategist',
            role: 'Strategi keseluruhan battle',
            prompt: function(context) {
                return 'Kamu adalah Strategist. Tentukan strategi keseluruhan untuk battle ini. Topik: ' + context.topic;
            }
        },
        researcher: {
            name: 'Researcher',
            role: 'Cari data & fakta pendukung',
            prompt: function(context) {
                return 'Kamu adalah Researcher. Cari data & fakta tentang: ' + context.topic;
            }
        },
        psychologist: {
            name: 'Psychologist',
            role: 'Analisis kelemahan mental lawan',
            prompt: function(context) {
                return 'Kamu adalah Psychologist. Analisis kelemahan psikologis lawan: ' + context.agentB;
            }
        },
        comedian: {
            name: 'Comedian',
            role: 'Buat humor & sindiran',
            prompt: function(context) {
                return 'Kamu adalah Comedian. Buat humor & sindiran untuk topik: ' + context.topic;
            }
        },
        technicalRapper: {
            name: 'Technical Rapper',
            role: 'Saran flow & rima teknis',
            prompt: function(context) {
                return 'Kamu adalah Technical Rapper. Berikan saran flow & rima untuk ronde: ' + context.round;
            }
        },
        storyteller: {
            name: 'Storyteller',
            role: 'Buat narasi & cerita',
            prompt: function(context) {
                return 'Kamu adalah Storyteller. Buat narasi menarik tentang: ' + context.topic;
            }
        },
        punchlineArchitect: {
            name: 'Punchline Architect',
            role: 'Rancang punchline kuat',
            prompt: function(context) {
                return 'Kamu adalah Punchline Architect. Rancang punchline untuk: ' + context.topic;
            }
        },
        rhymeScientist: {
            name: 'Rhyme Scientist',
            role: 'Rima multisyllabic',
            prompt: function(context) {
                return 'Kamu adalah Rhyme Scientist. Buat rima multisyllabic untuk: ' + context.topic;
            }
        },
        wordplayEngineer: {
            name: 'Wordplay Engineer',
            role: 'Double entendre & wordplay',
            prompt: function(context) {
                return 'Kamu adalah Wordplay Engineer. Buat double entendre & wordplay untuk: ' + context.topic;
            }
        },
        metaphorGenerator: {
            name: 'Metaphor Generator',
            role: 'Metafora unik & kuat',
            prompt: function(context) {
                return 'Kamu adalah Metaphor Generator. Buat metafora unik tentang: ' + context.topic;
            }
        },
        crowdAnalyst: {
            name: 'Crowd Analyst',
            role: 'Prediksi reaksi penonton',
            prompt: function(context) {
                return 'Kamu adalah Crowd Analyst. Prediksi reaksi penonton untuk verse ini.';
            }
        }
    };

    // ============================================================
    // 3. BATTLE PLANNER — RENCANA 7 RONDE
    // ============================================================
    
    const BATTLE_PLANS = [
        { round: 1, strategy: 'Perkenalan', emotion: 'Santai', goal: 'Tunjukkan identitas' },
        { round: 2, strategy: 'Serang Balik', emotion: 'Kesal', goal: 'Balas serangan lawan' },
        { round: 3, strategy: 'Serang Ego', emotion: 'Marah', goal: 'Hancurkan kepercayaan diri lawan' },
        { round: 4, strategy: 'Humor', emotion: 'Mengolok', goal: 'Ejek & hina dengan humor' },
        { round: 5, strategy: 'Haymaker', emotion: 'Percaya Diri', goal: 'Pukulan keras' },
        { round: 6, strategy: 'Callback', emotion: 'Dominan', goal: 'Kembalikan ke ronde sebelumnya' },
        { round: 7, strategy: 'Closer', emotion: 'Santai', goal: 'Mic drop, kemenangan' }
    ];

    function getBattlePlan(round, totalRounds) {
        totalRounds = totalRounds || BATTLE_PLANS.length;
        // Sebelumnya: index = min(round-1, BATTLE_PLANS.length-1) — totalRounds
        // sama sekali tidak dipakai. Akibatnya battle 3 ronde (default UI)
        // cuma pernah kebagian plan index 0,1,2 ("Perkenalan","Serang Balik",
        // "Serang Ego") dan TIDAK PERNAH sampai ke "Haymaker"/"Callback"/
        // "Closer" — arc emosional battle jadi flat & terasa monoton.
        // Sekarang: posisi round diskalakan proporsional ke rentang 0..1
        // (round pertama = 0, round terakhir = 1), lalu dipetakan ke 7 tahap
        // arc battle. Jadi battle 3 ronde tetap dapat Perkenalan → tengah →
        // Closer, sama seperti battle 7 ronde, hanya lebih padat.
        const ratio = (round - 1) / Math.max(1, totalRounds - 1);
        const index = Math.min(BATTLE_PLANS.length - 1, Math.round(ratio * (BATTLE_PLANS.length - 1)));
        return BATTLE_PLANS[index] || BATTLE_PLANS[0];
    }

    // ============================================================
    // 4. BATTLE DIRECTOR — KONDUKTOR
    // ============================================================
    
    function BattleDirector(topic, agentA, agentB, rounds) {
        this.topic = topic;
        this.agentA = agentA;
        this.agentB = agentB;
        this.rounds = Math.min(rounds, 7);
        this.plans = [];
        this.discussion = {};
        this._init();
    }

    BattleDirector.prototype._init = function() {
        for (let i = 1; i <= this.rounds; i++) {
            this.plans.push(getBattlePlan(i, this.rounds));
        }
    };

    BattleDirector.prototype.getPlanForRound = function(round) {
        return this.plans[round - 1] || this.plans[0];
    };

    BattleDirector.prototype.runDiscussion = function(round) {
        const plan = this.getPlanForRound(round);
        const results = {};
        for (const [key, agent] of Object.entries(AGENTS)) {
            results[key] = agent.prompt({
                topic: this.topic,
                agentA: this.agentA,
                agentB: this.agentB,
                round: round,
                plan: plan
            });
        }
        this.discussion = results;
        return results;
    };

    BattleDirector.prototype.getStrategicAdvice = function() {
        const advice = [];
        for (const [key, agent] of Object.entries(AGENTS)) {
            advice.push({
                agent: agent.name,
                role: agent.role,
                prompt: agent.prompt({ topic: this.topic, agentB: this.agentB })
            });
        }
        return advice;
    };

    // ============================================================
    // 5. EXPOSE
    // ============================================================
    
    window.RapIntelligenceEngine = {
        AGENTS: AGENTS,
        BattleDirector: BattleDirector,
        predictCrowdReaction: predictCrowdReaction,
        REACTIONS: REACTIONS,
        BATTLE_PLANS: BATTLE_PLANS,
        getBattlePlan: getBattlePlan
    };

})();
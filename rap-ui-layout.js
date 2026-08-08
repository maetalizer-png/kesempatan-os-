/* ============================================================
   📁 rap/ui-renderer/ui-layout.js
   🔥 LAYOUT LAYER — seluruh markup HTML + fungsi render roster/select.
   Dipindahkan apa adanya dari ui-renderer.js (byte-identik):
   renderCypherLounge(), markRole(), clearRole(), syncHiddenSelects(),
   renderSongSelect() TIDAK diubah satu karakter pun.
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__RapUILayout) return;
    window.__RapUILayout = true;

    function renderCypherLounge(container) {
        const grid = container.querySelector('#cypherLoungeGrid');
        if (!grid) return;
        if (!KESEMPATAN.RapCharacterEngine || !KESEMPATAN.RapCharacterEngine.getAllPersonaCards) {
            grid.innerHTML = '<div style="padding:12px; color:#555; font-size:11px;">⏳ Memuat roster rapper...</div>';
            return;
        }
        const cards = KESEMPATAN.RapCharacterEngine.getAllPersonaCards();
        grid.innerHTML = cards.map(function(p) {
            return '<div class="rapper-card lounge-card" data-agent="' + p.id + '" title="' + p.catchphrase + '">' +
                '<span class="role-badge" style="display:none;"></span>' +
                '<div class="rapper-avatar" style="background:linear-gradient(135deg,' + p.color1 + ',' + p.color2 + ');">' + p.emoji + '</div>' +
                '<div>' +
                    '<div class="rapper-name">' + p.name + '</div>' +
                    '<div class="rapper-role">' + p.archetype + '</div>' +
                '</div>' +
            '</div>';
        }).join('');

        // Default: 2 rapper pertama otomatis jadi Agent A & Agent B,
        // sama seperti perilaku default sebelumnya (RahmadRaharjo vs Manager).
        const allCards = grid.querySelectorAll('.rapper-card');
        if (allCards[0]) markRole(allCards[0], 'A');
        if (allCards[1]) markRole(allCards[1], 'B');
        syncHiddenSelects(container);
    }

    // Tandai sebuah kartu sebagai Agent A / Agent B secara visual.
    function markRole(card, role) {
        card.classList.remove('selected', 'role-a', 'role-b');
        card.dataset.role = role;
        card.classList.add('selected', role === 'A' ? 'role-a' : 'role-b');
        const badge = card.querySelector('.role-badge');
        if (badge) {
            badge.style.display = 'flex';
            badge.textContent = role;
        }
    }

    function clearRole(card) {
        card.classList.remove('selected', 'role-a', 'role-b');
        delete card.dataset.role;
        const badge = card.querySelector('.role-badge');
        if (badge) badge.style.display = 'none';
    }

    // Sinkronkan hidden <select> (dipakai kode lama untuk kompatibilitas)
    // dengan kartu yang sedang berperan A/B di Cypher Lounge.
    function syncHiddenSelects(container) {
        const grid = container.querySelector('#cypherLoungeGrid');
        const selA = container.querySelector('#rapAgentA');
        const selB = container.querySelector('#rapAgentB');
        if (!grid || !selA || !selB) return;
        const cardA = grid.querySelector('.rapper-card[data-role="A"]');
        const cardB = grid.querySelector('.rapper-card[data-role="B"]');
        const opts = KESEMPATAN.RapCharacterEngine ? KESEMPATAN.RapCharacterEngine.getAllPersonas() : [];
        function fillSelect(sel, current) {
            sel.innerHTML = opts.map(function(id) {
                return '<option value="' + id + '"' + (id === current ? ' selected' : '') + '>' + id + '</option>';
            }).join('');
        }
        fillSelect(selA, cardA ? cardA.dataset.agent : null);
        fillSelect(selB, cardB ? cardB.dataset.agent : null);

        const vsSub = container.querySelector('#lounge-vs-sub');
        if (vsSub) {
            vsSub.textContent = (cardA && cardB)
                ? 'siap battle!'
                : 'pilih Agent A & B di atas';
        }
    }

    // ============================================================
    // 🔥 SONG SELECT — DAFTAR 24 LAGU DARI SOUNDBANK, DIKELOMPOKKAN GENRE
    // ✅ Sebelumnya cuma 3 opsi genre polos (Trap/Boom Bap/Drill) tanpa
    //    identitas lagu. Sekarang setiap opsi adalah LAGU sungguhan
    //    dengan judul & BPM sendiri — pilih lagu, genre+BPM ikut berubah.
    // ============================================================
    function renderSongSelect(container) {
        const select = container.querySelector('#beatPatternSelect');
        if (!select) return;
        if (!KESEMPATAN.RapSoundbank) {
            select.innerHTML = '<option value="trap">🎵 Trap (default)</option>';
            return;
        }
        const genreLabels = { 'trap': '🔥 Trap', 'boom-bap': '🥁 Boom Bap', 'drill': '⚡ Drill' };
        const genres = ['trap', 'boom-bap', 'drill'];
        select.innerHTML = genres.map(function(genre) {
            const songs = KESEMPATAN.RapSoundbank.getSongsByGenre(genre);
            const options = songs.map(function(s) {
                return '<option value="' + s.id + '">' + s.title + ' — ' + s.bpm + ' BPM</option>';
            }).join('');
            return '<optgroup label="' + genreLabels[genre] + '">' + options + '</optgroup>';
        }).join('');
    }


    function buildHTML() {
        return `
            <div class="rap-modern-wrapper">

                <!-- ===== ARENA HEADER — entrance, bukan sekadar judul ===== -->
                <div class="rap-header-arena">
                    <div class="arena-brand">
                        <span class="arena-title">KESEMPATAN OS</span>
                        <span class="arena-tag">RAP BATTLE ARENA</span>
                    </div>
                    <div class="arena-sub">Flow · Rhyme · Punchline · AI Judge</div>
                </div>

                <!-- ===== BATTLE SCOREBOARD — satu bar, bukan 5 widget ===== -->
                <div class="scoreboard-bar broadcast-frame"><span class="bf-tr"></span><span class="bf-bl"></span>
                    <div class="score-cell timer">
                        <div id="rapTimerDisplay" class="stat-number green">00:00</div>
                        <div class="stat-label">Timer</div>
                    </div>
                    <div class="score-cell round">
                        <div id="rapRoundDisplay" class="stat-number cyan">0/3</div>
                        <div class="stat-label">Round</div>
                        <div class="progress-bar"><div id="roundProgressBar" class="progress-fill" style="width:0%;"></div></div>
                    </div>
                    <div class="score-cell agent-a">
                        <div id="rapScoreA" class="stat-number cyan">0%</div>
                        <div class="stat-label">Agent A</div>
                        <div class="progress-bar"><div id="scoreAFill" class="progress-fill" style="width:0%; background:linear-gradient(90deg,#00D4FF,#00FFA3);"></div></div>
                    </div>
                    <div class="score-cell agent-b">
                        <div id="rapScoreB" class="stat-number pink">0%</div>
                        <div class="stat-label">Agent B</div>
                        <div class="progress-bar"><div id="scoreBFill" class="progress-fill" style="width:0%; background:linear-gradient(90deg,#FF6B6B,#FF2D75);"></div></div>
                    </div>
                    <div class="score-cell audience">
                        <div class="stat-number green" style="display:flex; align-items:center; justify-content:center; gap:4px;"><span id="reactionCount">0</span></div>
                        <div class="stat-label">Audience</div>
                        <div id="audienceReactions" class="reactions"></div>
                    </div>
                </div>

                <!-- ===== BATTLE STAGE — HERO, focal point utama halaman ===== -->
                <div class="battle-stage broadcast-frame"><span class="bf-tr"></span><span class="bf-bl"></span>
                    <div class="stage-vignette"></div>
                    <div class="arena-floor"></div>
                    <div class="spotlight-beam beam-left"></div>
                    <div class="spotlight-beam beam-right"></div>
                    <div class="stage-side side-a">
                        <span class="stage-ready-dot"></span>
                        <span class="stage-nameplate"><span class="stage-label">AGENT A</span></span>
                        <span class="stage-podium-status">PODIUM</span>
                    </div>
                    <div class="vs-badge">
                        <div class="vs-emblem"><span class="vs-text">VS</span></div>
                        <span id="lounge-vs-sub" class="vs-sub">pilih Agent A &amp; B di bawah</span>
                    </div>
                    <div class="stage-side side-b">
                        <span class="stage-ready-dot"></span>
                        <span class="stage-nameplate"><span class="stage-label">AGENT B</span></span>
                        <span class="stage-podium-status">PODIUM</span>
                    </div>
                    <!-- hidden select untuk kompatibilitas dengan logic lama -->
                    <select id="rapAgentA" style="display:none;"></select>
                    <select id="rapAgentB" style="display:none;"></select>
                </div>

                <!-- ===== CONTROL ROOM — AI Judge + Beat Engine, satu rack horizontal ===== -->
                <div class="rap-panel control-room">
                    <div class="control-room-col judge-col broadcast-frame frame-purple"><span class="bf-tr"></span><span class="bf-bl"></span>
                        <div class="rap-panel-label">CH.02 — AI JUDGE</div>
                        <div class="rap-panel-row">
                            <span class="rap-status on">READY</span>
                            <div class="console-shell" style="flex:1; min-width:140px;">
                            <select id="rapJudge" class="console-native console-select judge-select">
                                <option value="ai">AI Judge — Decision Engine</option>
                                <option value="user">User Vote</option>
                            </select>
                            </div>
                        </div>
                        <div id="flowAnalysisContainer" style="display:none;" class="rap-panel-readout">
                            <span id="flowStats">Flow: - | Rhymes: - | Words: -</span>
                        </div>
                    </div>
                    <div class="control-room-divider"></div>
                    <div class="control-room-col beat-col broadcast-frame frame-amber"><span class="bf-tr"></span><span class="bf-bl"></span>
                        <div class="rap-panel-label" style="display:flex; align-items:center; gap:6px;">BEAT ENGINE <span class="eq-bars"><span></span><span></span><span></span><span></span></span></div>
                        <div class="rap-panel-row">
                            <div class="console-shell" style="flex:1;">
                            <select id="beatPatternSelect" class="console-native console-select">
                                <!-- diisi otomatis oleh renderSongSelect() dari RapSoundbank (24 lagu) -->
                            </select>
                            </div>
                            <button onclick="window.KESEMPATAN.RapBattle.toggleBeat()" class="beat-btn">Beat</button>
                            <span id="beatIndicator" class="bpm-badge" onclick="window.KESEMPATAN.RapBattle.toggleBeat()">140 BPM</span>
                        </div>
                        <div class="visualizer-section">
                            <canvas id="rapVisualizer" width="800" height="80" style="width:100%; height:54px;"></canvas>
                            <div class="rap-panel-readout" style="display:flex; justify-content:space-between;">
                                <span>Waveform</span>
                                <span id="beatSyncStatus">Sinkronisasi</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== PLAYER BENCH — Cypher Lounge, gaya Voice Library (rows scroll, header tetap) ===== -->
                <div class="cypher-lounge-header">
                    <span class="lounge-title">PLAYER BENCH</span>
                    <span class="lounge-sub">pilih 2 rapper untuk battle — sisanya di battle queue</span>
                </div>
                <div class="broadcast-frame"><span class="bf-tr"></span><span class="bf-bl"></span>
                <div id="cypherLoungeGrid" class="cypher-lounge-grid">
                    <!-- diisi otomatis oleh renderCypherLounge() dari SEMUA persona di character.js -->
                </div>
                </div>

                <!-- ===== TOOLBAR INDUSTRIAL — kontrol utama mulai battle ===== -->
                <div class="controls broadcast-frame"><span class="bf-tr"></span><span class="bf-bl"></span>
                    <div class="controls-row">
                        <div class="console-shell" style="flex:2; min-width:120px;">
                            <input type="text" id="rapTopic" placeholder="Topik rap battle..." class="console-native">
                        </div>
                        <div class="console-shell">
                        <select id="rapRounds" class="console-native console-select">
                            <option value="1">1 Ronde</option>
                            <option value="3" selected>3 Ronde</option>
                            <option value="5">5 Ronde</option>
                            <option value="7">7 Ronde</option>
                        </select>
                        </div>
                    </div>
                    <div class="actions-row">
                        <button id="startRapBtn" class="btn-start">MULAI RAP</button>
                        <button id="stopRapBtn" class="btn-stop" style="display:none;">STOP</button>
                        <button id="rapTournamentBtn" class="btn-tournament">TURNAMEN DUNIA</button>
                    </div>
                </div>

                <!-- ===== BATTLE ARCHIVE — History + Hall of Fame + Export + log, satu chassis ===== -->
                <div class="rap-panel archive-panel broadcast-frame"><span class="bf-tr"></span><span class="bf-bl"></span>
                    <div class="rap-panel-label">BATTLE ARCHIVE</div>
                    <div class="rap-panel-row" style="margin-bottom:8px;">
                        <button id="rapHistoryBtn" class="history-btn">Archive</button>
                        <button id="rapHallOfFameBtn" class="history-btn">Hall of Fame</button>
                        <button onclick="window.KESEMPATAN.RapBattle.exportResult('pdf')" class="btn-export">PDF</button>
                        <button onclick="window.KESEMPATAN.RapBattle.exportResult('json')" class="btn-export">JSON</button>
                        <button onclick="window.KESEMPATAN.RapBattle.exportResult('txt')" class="btn-export">TXT</button>
                    </div>
                    <div id="rapBattleContainer" class="battle-log"></div>
                    <div id="rapBattleResult" style="margin-top:8px;"></div>
                </div>

                <!-- ===== BACK BUTTON ===== -->
                <button onclick="window.showPage('dashboard')" class="back-btn">← Kembali ke Dasbor</button>

            </div>
`;
    }

    KESEMPATAN.RapUILayout = {
        buildHTML: buildHTML,
        renderCypherLounge: renderCypherLounge,
        markRole: markRole,
        clearRole: clearRole,
        syncHiddenSelects: syncHiddenSelects,
        renderSongSelect: renderSongSelect
    };
})();

/* ============================================================
   interactive/tournament/tor-core.js
   INTI TURNAMEN — Arena visual, bracket, orkestrasi
   pertandingan, panel & init. Dimuat PALING TERAKHIR.
   ============================================================ */
import { TRN_showToast, TRN_getFullAgentPool } from './tor-config.js';
import { TRN_State } from './tor-state.js';
import { TRN_SecurityManager } from './tor-classes.js';
import { TRN_DebateArena } from './tor-tournament-arena.js';

    function TRN_upgradeTournamentUI() {
        const container = document.getElementById('interactiveTournamentPanel');
        if (!container) {
            return;
        }
        if (container.dataset.uiUpgraded === 'true') {
            return;
        }
        container.dataset.uiUpgraded = 'true';

        const styleId = 'tournament-light-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .live-indicator-light { display:flex; align-items:center; gap:8px; padding:4px 12px; background:rgba(255,0,0,0.08); border-radius:20px; border:1px solid rgba(255,0,0,0.1); margin-bottom:10px; font-size:10px; color:#FF6B6B; font-weight:600; animation:livePulseLight 2s ease-in-out infinite; }
                @keyframes livePulseLight { 0%,100%{opacity:1} 50%{opacity:0.6} }
                .live-dot-light { width:6px; height:6px; background:#FF0000; border-radius:50%; animation:dotPulseLight 1s ease-in-out infinite; }
                @keyframes dotPulseLight { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(0.7)} }
                .btn-start-light { transition:all 0.3s ease; }
                .btn-start-light:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,255,163,0.2); }
                #tournamentContainer::-webkit-scrollbar { width:6px; }
                #tournamentContainer::-webkit-scrollbar-track { background:rgba(255,255,255,0.05); border-radius:3px; }
                #tournamentContainer::-webkit-scrollbar-thumb { background:rgba(0,255,163,0.3); border-radius:3px; }
            `;
            document.head.appendChild(style);
        }

        const startBtn = document.getElementById('startTournamentBtn');
        if (startBtn && !startBtn.dataset.upgraded) {
            startBtn.dataset.upgraded = 'true';
            startBtn.classList.add('btn-start-light');
        }
    }

    // ============================================================
    // 11. INITIALIZATION
    // ============================================================
    const tournamentArena = new TRN_DebateArena();
    // window.TournamentArena must stay bare: the history list below renders
    // onclick="window.TournamentArena?.exporter/history...()" strings, which
    // can only resolve a real window global, never window.KESEMPATAN.X.
    window.TournamentArena = tournamentArena;
    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.TournamentArena = tournamentArena;


    function TRN_injectTournamentArenaStyle() {
        const styleId = 'tournament-arena-style';
        if (document.getElementById(styleId)) {
            return;
        }
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent =
            '@keyframes arenaGlow { 0%,100%{box-shadow:0 0 20px rgba(0,255,163,0.15);} 50%{box-shadow:0 0 34px rgba(0,255,163,0.35);} }' +
            '@keyframes arenaPulseVs { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12);} }' +
            '@keyframes arenaSlideIn { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:translateY(0);} }' +
            '.arena-header { text-align:center; padding:18px 12px; border-radius:18px; margin-bottom:14px; background:linear-gradient(135deg, rgba(255,215,0,0.08), rgba(0,255,163,0.05)); border:1px solid rgba(255,215,0,0.25); animation:arenaGlow 3s ease-in-out infinite; }' +
            '.arena-header .arena-title { font-size:20px; font-weight:800; letter-spacing:1px; background:linear-gradient(135deg,#FFD700,#00FFA3); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }' +
            '.arena-header .arena-sub { font-size:10px; color:#A0B3C9; margin-top:4px; letter-spacing:2px; text-transform:uppercase; }' +
            '.arena-bracket { display:flex; gap:10px; overflow-x:auto; padding:10px 4px; margin-bottom:12px; }' +
            '.arena-round-col { min-width:150px; display:flex; flex-direction:column; gap:8px; }' +
            '.arena-round-label { font-size:9px; color:#FFD700; text-transform:uppercase; letter-spacing:1px; text-align:center; margin-bottom:2px; font-weight:700; }' +
            '.arena-match-card { background:rgba(255,255,255,0.03); border:1px solid rgba(0,255,163,0.15); border-radius:10px; padding:8px; font-size:10px; animation:arenaSlideIn 0.3s ease; }' +
            '.arena-match-card .arena-fighter { display:flex; justify-content:space-between; align-items:center; padding:3px 0; color:#A0B3C9; }' +
            '.arena-match-card .arena-fighter.arena-winner { color:#00FFA3; font-weight:700; }' +
            '.arena-match-card .arena-fighter.arena-loser { opacity:0.4; text-decoration:line-through; }' +
            '.arena-match-card .arena-vs { text-align:center; font-size:8px; color:#FFD700; margin:2px 0; }' +
            '.arena-match-card.arena-pending { opacity:0.5; border-style:dashed; }' +
            '.arena-match-card.arena-live { border-color:#FFD700; animation:arenaPulseVs 1.5s ease-in-out infinite; }' +
            '.arena-champion-podium { text-align:center; padding:28px 16px; background:linear-gradient(135deg, rgba(255,215,0,0.12), rgba(0,255,163,0.06)); border-radius:18px; border:1px solid rgba(255,215,0,0.3); }' +
            '.arena-champion-podium .arena-crown { font-size:52px; margin-bottom:6px; }' +
            '.arena-champion-podium .arena-champ-name { font-size:26px; font-weight:800; color:#FFD700; text-shadow:0 0 20px rgba(255,215,0,0.4); }' +
            '.arena-vscard { display:flex; align-items:center; justify-content:center; gap:14px; padding:14px; margin-bottom:12px; background:rgba(0,0,0,0.25); border-radius:14px; border:1px solid rgba(255,215,0,0.15); }' +
            '.arena-vscard .arena-vs-fighter { flex:1; text-align:center; font-size:12px; color:#fff; font-weight:600; }' +
            '.arena-vscard .arena-vs-badge { font-size:16px; font-weight:800; color:#FFD700; animation:arenaPulseVs 1.2s ease-in-out infinite; }';
        document.head.appendChild(style);
    }

    function TRN_renderTournamentPanel() {
        const container = document.getElementById('interactiveTournamentPanel');
        if (!container || container.dataset.rendered === 'true') {
            return;
        }
        container.dataset.rendered = 'true';
        TRN_injectTournamentArenaStyle();
        container.innerHTML =
            '<div class="arena-header"><div class="arena-title">ARENA TURNAMEN AI</div><div class="arena-sub">Single Elimination Championship</div></div>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;"><input type="text" id="tournamentTopic" placeholder="Topik turnamen" style="flex:3;"><select id="tournamentFormat" style="flex:1;"><option value="full">Full 200 Agen</option><option value="top16">⭐ Top 16</option><option value="top8">⭐ Top 8</option></select><select id="tournamentMode" style="flex:1;"><option value="fast">Cepat</option><option value="best3">Best of 3</option></select></div>' +
            '<div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;"><label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="voiceTournamentToggle"><span style="color:#00FFA3; font-size:12px;">Mode Voice Turnamen</span></label></div>' +
            '<div style="display:flex; gap:10px; margin-bottom:16px;"><button id="startTournamentBtn" class="execute-btn" style="flex:1;">MULAI TURNAMEN</button><button id="stopTournamentBtn" class="execute-btn secondary" style="flex:0 0 auto; display:none; background:#ff4444; color:#fff;">Stop</button><button id="tournamentHistoryBtn" class="execute-btn secondary" style="flex:0 0 auto;">Riwayat</button></div>' +
            '<div id="tournamentProgress" style="display:none; margin-bottom:10px;"></div>' +
            '<div id="tournamentVsCard"></div>' +
            '<div id="tournamentBracketArena" class="arena-bracket"></div>' +
            '<div id="tournamentContainer" class="log-box" style="height:180px;"></div>' +
            '<div id="tournamentChampion" style="margin-top:12px;"></div>';
    }

    // ============================================================
    // PENYUSUN BRACKET & RESOLUSI PEMENANG
    // ============================================================
    function TRN_buildBracketPool(formatKey) {
        const pool = TRN_getFullAgentPool();
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = pool[i];
            pool[i] = pool[j];
            pool[j] = tmp;
        }
        if (formatKey === 'top8') {
            return pool.slice(0, Math.min(8, pool.length));
        }
        if (formatKey === 'top16') {
            return pool.slice(0, Math.min(16, pool.length));
        }
        // 'full' — seluruh roster yang terdeteksi dari dashboard (bisa
        // sampai ~200 agen). Match berjumlah besar = banyak panggilan
        // AI dan makan waktu lama; ini konsekuensi wajar dari pilihan
        // format ini, bukan bug.
        return pool;
    }

    function TRN_resolveMatchWinner(result, agentA, agentB) {
        const nameA = tournamentArena.getDisplayName(agentA).toLowerCase().replace(/[^\w\s]/g, '').trim();
        const nameB = tournamentArena.getDisplayName(agentB).toLowerCase().replace(/[^\w\s]/g, '').trim();
        const w = ((result && result.winner) || '').toLowerCase();
        if (w) {
            if (w.includes(agentA.toLowerCase()) || w.includes(nameA)) {
                return agentA;
            }
            if (w.includes(agentB.toLowerCase()) || w.includes(nameB)) {
                return agentB;
            }
        }
        if (result && typeof result.scoreA === 'number' && typeof result.scoreB === 'number') {
            return (result.scoreB > result.scoreA) ? agentB : agentA;
        }
        return agentA;
    }

    // ============================================================
    // ORKESTRASI TURNAMEN (single-elimination bracket)
    // ============================================================

    function TRN_updateTournamentProgress(text) {
        const el = document.getElementById('tournamentProgress');
        if (!el) {
            return;
        }
        if (!text) {
            el.style.display = 'none';
            el.innerHTML = '';
            return;
        }
        el.style.display = 'block';
        el.innerHTML = '<div style="font-size:11px; color:#A0B3C9; padding:6px 10px; background:rgba(0,255,163,0.05); border-radius:8px; border:1px solid rgba(0,255,163,0.1);">' + text + '</div>';
    }

    function TRN_renderBracketVisual(bracketRounds) {
        const container = document.getElementById('tournamentBracketArena');
        if (!container) {
            return;
        }
        container.innerHTML = bracketRounds.map(function(round, idx) {
            const cards = round.map(function(m) {
                const nameA = tournamentArena.getDisplayName(m.agentA);
                if (!m.agentB) {
                    return '<div class="arena-match-card"><div class="arena-fighter arena-winner">' + TRN_SecurityManager.sanitizeHTML(nameA) + ' (BYE)</div></div>';
                }
                const nameB = tournamentArena.getDisplayName(m.agentB);
                const cardClass = 'arena-match-card' + (m.status === 'live' ? ' arena-live' : (m.status === 'pending' ? ' arena-pending' : ''));
                const aClass = 'arena-fighter' + (m.winner === m.agentA ? ' arena-winner' : (m.winner === m.agentB ? ' arena-loser' : ''));
                const bClass = 'arena-fighter' + (m.winner === m.agentB ? ' arena-winner' : (m.winner === m.agentA ? ' arena-loser' : ''));
                return '<div class="' + cardClass + '"><div class="' + aClass + '">' + TRN_SecurityManager.sanitizeHTML(nameA) + '</div><div class="arena-vs">VS</div><div class="' + bClass + '">' + TRN_SecurityManager.sanitizeHTML(nameB) + '</div></div>';
            }).join('');
            return '<div class="arena-round-col"><div class="arena-round-label">Babak ' + (idx + 1) + '</div>' + cards + '</div>';
        }).join('');
        container.scrollLeft = container.scrollWidth;
    }

    function TRN_renderVsCard(agentA, agentB) {
        const el = document.getElementById('tournamentVsCard');
        if (!el) {
            return;
        }
        el.innerHTML = '<div class="arena-vscard"><div class="arena-vs-fighter">' + TRN_SecurityManager.sanitizeHTML(tournamentArena.getDisplayName(agentA)) + '</div><div class="arena-vs-badge"><br>VS</div><div class="arena-vs-fighter">' + TRN_SecurityManager.sanitizeHTML(tournamentArena.getDisplayName(agentB)) + '</div></div>';
    }

    function TRN_clearVsCard() {
        const el = document.getElementById('tournamentVsCard');
        if (el) {
            el.innerHTML = '';
        }
    }

    async function TRN_runTournamentBracket(topic, formatKey, modeKey) {
        const rounds = (modeKey === 'best3') ? 3 : 1;
        let participants = TRN_buildBracketPool(formatKey);

        if (participants.length < 2) {
            if (TRN_showToast) {
                TRN_showToast('Tidak ada agen terdeteksi dari Dashboard. Buka halaman Dashboard dulu supaya daftar agen termuat, lalu kembali ke sini.', 'error');
            }
            return;
        }

        const totalParticipants = participants.length;
        const championEl = document.getElementById('tournamentChampion');
        if (championEl) {
            championEl.innerHTML = '';
        }
        const bracketData = [];
        TRN_renderBracketVisual(bracketData);
        TRN_clearVsCard();

        tournamentArena.addMessage('SISTEM', 'Turnamen dimulai! Topik: "' + topic + '" — ' + participants.length + ' peserta, mode ' + (modeKey === 'best3' ? 'Best of 3' : 'Cepat') + '.');

        let roundNum = 1;
        let stoppedEarly = false;
        while (participants.length > 1) {
            if (TRN_State.tournamentAbort) {
                stoppedEarly = true;
                break;
            }
            tournamentArena.addMessage('SISTEM', '--- BABAK ' + roundNum + ' (' + participants.length + ' peserta) ---');
            const pairPool = participants.slice();
            const nextRound = [];
            const totalMatches = Math.floor(pairPool.length / 2);
            let matchIndex = 0;
            const roundMatches = [];
            bracketData.push(roundMatches);

            if (pairPool.length % 2 !== 0) {
                const byeAgent = pairPool.pop();
                tournamentArena.addMessage('BYE', tournamentArena.getDisplayName(byeAgent) + ' otomatis lolos ke babak berikutnya.');
                roundMatches.push({ agentA: byeAgent, agentB: null, winner: byeAgent, status: 'done' });
                nextRound.push(byeAgent);
                TRN_renderBracketVisual(bracketData);
            }

            for (let i = 0; i < pairPool.length; i += 2) {
                if (TRN_State.tournamentAbort) {
                    stoppedEarly = true;
                    break;
                }
                matchIndex++;
                TRN_updateTournamentProgress('Babak ' + roundNum + ' • Match ' + matchIndex + '/' + totalMatches + ' • ' + participants.length + ' peserta tersisa');
                const agentA = pairPool[i];
                const agentB = pairPool[i + 1];
                const matchEntry = { agentA: agentA, agentB: agentB, winner: null, status: 'live' };
                roundMatches.push(matchEntry);
                TRN_renderVsCard(agentA, agentB);
                TRN_renderBracketVisual(bracketData);
                tournamentArena.addMessage('MATCH', tournamentArena.getDisplayName(agentA) + ' VS ' + tournamentArena.getDisplayName(agentB));
                let winnerKey = agentA;
                try {
                    const result = await tournamentArena.startDebate({
                        topic: topic,
                        agentA: agentA,
                        agentB: agentB,
                        rounds: rounds,
                        model: tournamentArena.config.DEFAULT_MODEL,
                        moderator: 'ai'
                    });
                    winnerKey = TRN_resolveMatchWinner(result, agentA, agentB);
                } catch (e) {
                    if (TRN_State.tournamentAbort) {
                        stoppedEarly = true;
                        break;
                    }
                    tournamentArena.addMessage('SISTEM', 'Match gagal (' + e.message + '), ' + tournamentArena.getDisplayName(agentA) + ' lanjut otomatis.');
                }
                matchEntry.winner = winnerKey;
                matchEntry.status = 'done';
                TRN_renderBracketVisual(bracketData);
                tournamentArena.addMessage('HASIL', tournamentArena.getDisplayName(winnerKey) + ' menang & lanjut ke babak berikutnya.');
                nextRound.push(winnerKey);
            }

            if (stoppedEarly) {
                break;
            }
            participants = nextRound;
            roundNum++;
        }

        TRN_clearVsCard();
        TRN_updateTournamentProgress(null);

        if (stoppedEarly) {
            tournamentArena.addMessage('SISTEM', 'Turnamen dihentikan oleh user.');
            if (TRN_showToast) {
                TRN_showToast('Turnamen dihentikan', 'warn');
            }
            return;
        }

        const championKey = participants[0];
        const championLabel = tournamentArena.getDisplayName(championKey);
        tournamentArena.addMessage('JUARA', championLabel + ' adalah JUARA TURNAMEN!');
        if (championEl) {
            championEl.innerHTML = '<div class="arena-champion-podium"><div class="arena-crown"></div><div class="arena-champ-name">' + TRN_SecurityManager.sanitizeHTML(championLabel) + '</div><div style="color:#A0B3C9; font-size:13px; margin-top:8px;">Juara turnamen "' + TRN_SecurityManager.sanitizeHTML(topic) + '"</div></div>';
        }
        if (TRN_showToast) {
            TRN_showToast('Juara turnamen: ' + championLabel, 'success');
        }

        tournamentArena.history.save({
            topic: topic,
            agentA: 'Turnamen (' + totalParticipants + ' peserta)',
            agentB: (formatKey === 'top8' ? 'Top 8' : formatKey === 'top16' ? 'Top 16' : 'Full') + ' • ' + (modeKey === 'best3' ? 'Best of 3' : 'Cepat'),
            winner: championLabel,
            reason: 'Juara single-elimination bracket',
            history: tournamentArena.state.history.slice(-20)
        });
    }

    function TRN_initTournamentUI() {
        TRN_renderTournamentPanel();

        const voiceToggle = document.getElementById('voiceTournamentToggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('change', function(e) {
                tournamentArena.voice.isActive = e.target.checked;
                if (e.target.checked && window.speechSynthesis) {
                    // FIX suara tidak keluar: sama spt Debat — buka kunci
                    // speechSynthesis persis di gesture klik toggle ini.
                    window.speechSynthesis.cancel();
                    const unlock = new SpeechSynthesisUtterance('ok');
                    unlock.volume = 0.01;
                    window.speechSynthesis.speak(unlock);
                    setTimeout(function() {
                        window.speechSynthesis.cancel();
                    }, 50);
                }
                if (TRN_showToast) {
                    TRN_showToast(e.target.checked ? 'Voice Turnamen AKTIF!' : 'Voice Turnamen NONAKTIF', e.target.checked ? 'success' : 'info');
                }
                if (e.target.checked && tournamentArena.voice.synthesis) {
                    tournamentArena.voice.loadVoices();
                }
            });
        }

        const startBtn = document.getElementById('startTournamentBtn');
        const stopBtn = document.getElementById('stopTournamentBtn');
        const historyBtn = document.getElementById('tournamentHistoryBtn');
        const inputs = document.querySelectorAll('#tournamentTopic, #tournamentFormat, #tournamentMode');

        if (startBtn) {
            startBtn.addEventListener('click', async function() {
                const topic = document.getElementById('tournamentTopic')?.value?.trim();
                const format = document.getElementById('tournamentFormat')?.value || 'full';
                const mode = document.getElementById('tournamentMode')?.value || 'fast';

                if (!topic || topic.length < 3) {
                    if (TRN_showToast) {
                        TRN_showToast('Masukkan topik turnamen (min. 3 karakter)', 'error');
                    }
                    return;
                }
                if (window.__tournamentRunning) {
                    return;
                }

                window.__tournamentRunning = true;
                TRN_State.tournamentAbort = false;
                startBtn.disabled = true;
                startBtn.textContent = 'Turnamen berjalan...';
                if (stopBtn) {
                    stopBtn.style.display = 'inline-block';
                }
                inputs.forEach(function(el) { if (el) el.disabled = true; });

                try {
                    await TRN_runTournamentBracket(topic, format, mode);
                } catch (e) {
                    if (TRN_showToast) {
                        TRN_showToast('Turnamen gagal: ' + e.message, 'error');
                    }
                } finally {
                    window.__tournamentRunning = false;
                    TRN_State.tournamentAbort = false;
                    startBtn.disabled = false;
                    startBtn.textContent = 'MULAI TURNAMEN';
                    if (stopBtn) {
                        stopBtn.style.display = 'none';
                    }
                    inputs.forEach(function(el) { if (el) el.disabled = false; });
                }
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                if (!window.__tournamentRunning) {
                    return;
                }
                TRN_State.tournamentAbort = true;
                tournamentArena.abort();
                if (TRN_showToast) {
                    TRN_showToast('Menghentikan turnamen setelah match berjalan selesai...', 'info');
                }
            });
        }

        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                const history = tournamentArena.history.loadAll();
                if (history.length === 0) {
                    if (TRN_showToast) {
                        TRN_showToast('Belum ada histori turnamen', 'info');
                    }
                    return;
                }
                TRN_showHistoryModal(history);
            });
        }

        setTimeout(TRN_upgradeTournamentUI, 200);
    }

    // ============================================================
    // 12. HISTORY MODAL (belum ada tombol pemicu di panel Turnamen;
    //     fungsi disiapkan untuk pemakaian mendatang)
    // ============================================================
    function TRN_showHistoryModal(history) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; animation:fadeIn 0.3s ease;';
        const content = document.createElement('div');
        content.style.cssText = 'background:#1a1a2e; border-radius:16px; max-width:800px; width:100%; max-height:80vh; padding:24px; border:1px solid rgba(0,255,163,0.1); overflow-y:auto;';
        let html = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;"><h2 style="color:#00FFA3; margin:0;">Histori Debat</h2><button onclick="this.closest(\'div[style*=\"fixed\"]\').remove()" style="background:none; border:none; color:#888; font-size:24px; cursor:pointer;">X</button></div>';
        if (history.length === 0) {
            html += '<p style="color:#888; text-align:center;">Belum ada histori</p>';
        } else {
            history.forEach(function(item) {
                const date = new Date(item.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                html += '<div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:14px; margin-bottom:10px; border-left:3px solid #00FFA3;"><div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;"><span style="font-weight:bold; color:#00FFA3;">' + TRN_SecurityManager.sanitizeHTML(item.agentA) + ' vs ' + TRN_SecurityManager.sanitizeHTML(item.agentB) + '</span><span style="font-size:11px; color:#666;">' + date + '</span></div><div style="font-size:13px; color:#A0B3C9;">Topic: ' + TRN_SecurityManager.sanitizeHTML(item.topic) + '</div>' + (item.winner ? '<div style="font-size:13px; color:#00FFA3;">Winner: ' + TRN_SecurityManager.sanitizeHTML(item.winner) + '</div>' : '') + '<div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;"><button onclick="window.TournamentArena?.exporter?.exportToJSON(' + JSON.stringify(item).replace(/"/g,'&quot;') + ')" style="padding:3px 10px; background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:6px; color:#00FFA3; cursor:pointer; font-size:10px;">JSON</button><button onclick="window.TournamentArena?.exporter?.exportToPDF(' + JSON.stringify(item).replace(/"/g,'&quot;') + ')" style="padding:3px 10px; background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:6px; color:#00FFA3; cursor:pointer; font-size:10px;">PDF</button><button onclick="if(confirm(\'Hapus?\')){window.TournamentArena?.history?.delete(' + item.id + ');location.reload();}" style="padding:3px 10px; background:rgba(255,107,107,0.05); border:1px solid rgba(255,107,107,0.1); border-radius:6px; color:#FF6B6B; cursor:pointer; font-size:10px;"></button></div></div>';
            });
            html += '<div style="margin-top:12px; display:flex; gap:8px; justify-content:center;"><button onclick="if(confirm(\'Hapus semua?\')){window.TournamentArena?.history?.clear();location.reload();}" style="padding:6px 14px; background:rgba(255,107,107,0.1); border:1px solid #FF6B6B; border-radius:8px; color:#FF6B6B; cursor:pointer; font-size:11px;">Hapus Semua</button><button onclick="this.closest(\'div[style*=\"fixed\"]\').remove()" style="padding:6px 14px; background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:8px; color:#00FFA3; cursor:pointer; font-size:11px;">Tutup</button></div>';
        }
        content.innerHTML = html;
        modal.appendChild(content);
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.body.contains(modal)) {
                modal.remove();
            }
        });
    }

    // ============================================================
    // 13. CSS ANIMATIONS
    // ============================================================
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} } #tournamentContainer::-webkit-scrollbar { width:6px; } #tournamentContainer::-webkit-scrollbar-track { background:rgba(255,255,255,0.05); border-radius:3px; } #tournamentContainer::-webkit-scrollbar-thumb { background:rgba(0,255,163,0.3); border-radius:3px; } #tournamentContainer::-webkit-scrollbar-thumb:hover { background:rgba(0,255,163,0.5); } .btn-start-light { transition:all 0.3s ease; } .btn-start-light:hover { box-shadow:0 8px 30px rgba(0,255,163,0.2); }';
    document.head.appendChild(style);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', TRN_initTournamentUI);
    } else {
        TRN_initTournamentUI();
    }

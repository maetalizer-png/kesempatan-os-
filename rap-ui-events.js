/* ============================================================
   📁 rap/ui-events.js
   🔥 EVENT & INTERAKSI - addMessage, showResult, stats, history
   🔥 PANGGIL RENDERER UNTUK UPDATE DOM
   🔥 ✅ ASTERISK (*) DIHAPUS DARI RAP!
   🔥 ✅ SCORE UPDATE DITAMBAHKAN!
   🔥 ✅ BREAKDOWN JURI DITAMBAHKAN!
   🔥 ✅ HAPUS CONFIG (TIDAK TERPAKAI)
   🔥 ✅ VISUALIZER ENGINE
   🔥 ✅ BEAT PATTERN SYNC
   ============================================================ */

(function() {
    'use strict';

    if (window.__RapUIEvents) {
        return;
    }
    window.__RapUIEvents = true;

    const renderer = window.RapUIRenderer;
    const logic = window.RapBattle.logic;

    if (!renderer || !logic) {
        return;
    }

    const rapState = logic.rapState;
    const sanitizeHTML = logic.sanitizeHTML;
    const getDisplayName = logic.getDisplayName;
    const loadHistory = logic.loadHistory;
    const analyzeFlow = logic.analyzeFlow;
    const addAudienceReaction = logic.addAudienceReaction;
    const randomReaction = logic.randomReaction;
    const startRapBattle = logic.startRapBattle;
    const abortRap = logic.abortRap;
    const exportRapResult = logic.exportRapResult;
    const toggleBeat = logic.toggleBeat;
    const getRapBattleActive = logic.getRapBattleActive;
    const runTournament = logic.runTournament;
    const getLeaderboard = logic.getLeaderboard;

    const showToast = renderer.showToast;

    // ============================================================
    // 🔥 CLEAN TEXT — HAPUS ASTERISK
    // ============================================================
    function cleanRapText(text) {
        if (typeof text !== 'string') {
            return text;
        }
        return text.replace(/\*/g, '');
    }

    // ============================================================
    // 🔥 ADD MESSAGE
    // ============================================================
    function addMessage(sender, message, container) {
        container = container || document.getElementById('rapBattleContainer');
        if (!container) {
            return;
        }

        const time = logic.getTimestamp();
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.style.padding = '8px 12px';
        div.style.borderLeft = '3px solid #FFD700';
        div.style.background = 'rgba(255,215,0,0.03)';
        div.style.borderRadius = '8px';
        div.style.animation = 'fadeIn 0.3s ease';

        const cleanMessage = cleanRapText(message);
        const safeSender = sanitizeHTML(sender);
        const safeMessage = sanitizeHTML(cleanMessage);

        let color = '#FFD700';
        if (sender.includes('Rahmad') || sender.includes('Agent A')) {
            color = '#00FFA3';
        } else if (sender.includes('Manager') || sender.includes('Agent B')) {
            color = '#FF6B6B';
        } else if (sender.includes('MC')) {
            color = '#FFD700';
        }

        div.innerHTML = '\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">\n                <strong style="color:' + color + ';">' + safeSender + '</strong>\n                <span style="font-size:9px; color:rgba(255,255,255,0.2);">' + time + '</span>\n            </div>\n            <div style="font-size:13px; line-height:1.5; white-space:pre-wrap;">' + safeMessage + '</div>\n        ';

        container.appendChild(div);
        container.scrollTop = container.scrollHeight;

        rapState.history.push({
            sender: sender,
            message: cleanMessage,
            time: time
        });
    }

    // ============================================================
    // 🔥 SHOW RESULT (DENGAN BREAKDOWN)
    // ============================================================
    function showResult(winner, displayA, displayB) {
        const container = document.getElementById('rapBattleResult');
        if (!container) {
            return;
        }

        const cleanReason = cleanRapText(winner.reason || '');
        const cleanWinner = cleanRapText(winner.winner || '');
        const cleanDisplayA = cleanRapText(displayA || '');
        const cleanDisplayB = cleanRapText(displayB || '');

        // 🔥 BREAKDOWN HTML (jika ada)
        let breakdownHtml = '';
        if (winner.breakdown) {
            const b = winner.breakdown;
            breakdownHtml = `
                <div style="margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:8px; text-align:center; font-size:11px; color:#A0B3C9; background:rgba(0,0,0,0.2); border-radius:10px; padding:10px;">
                    <div>🎵 Rhyme: <span style="color:#00FFA3;">${b.rhyme.A}</span> vs <span style="color:#FF6B6B;">${b.rhyme.B}</span></div>
                    <div>🌀 Flow: <span style="color:#00FFA3;">${b.flow.A}</span> vs <span style="color:#FF6B6B;">${b.flow.B}</span></div>
                    <div>💥 Punchline: <span style="color:#00FFA3;">${b.punchline.A}</span> vs <span style="color:#FF6B6B;">${b.punchline.B}</span></div>
                    <div>🎨 Creativity: <span style="color:#00FFA3;">${b.creativity.A}</span> vs <span style="color:#FF6B6B;">${b.creativity.B}</span></div>
                </div>
            `;
        }

        container.innerHTML = `
            <div id="rapResult" style="text-align:center; padding:20px; background:linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.03)); border-radius:16px; border:1px solid rgba(255,215,0,0.15); animation: pulse 2s infinite;">
                <div style="font-size:48px; margin-bottom:4px;">🏆</div>
                <div class="winner-name" style="font-size:24px; color:#FFD700; font-weight:bold;">${sanitizeHTML(cleanWinner)}</div>
                <div class="winner-reason" style="color:#A0B3C9; font-size:13px; max-width:500px; margin:8px auto;">${sanitizeHTML(cleanReason)}</div>
                <div style="margin-top:16px; display:flex; justify-content:center; gap:60px; flex-wrap:wrap;">
                    <div style="text-align:center;">
                        <div style="font-size:12px; color:#888;">${sanitizeHTML(cleanDisplayA)}</div>
                        <div id="rapScoreA" style="font-size:28px; color:#00FFA3; font-weight:bold;">${winner.scoreA}</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:12px; color:#888;">${sanitizeHTML(cleanDisplayB)}</div>
                        <div id="rapScoreB" style="font-size:28px; color:#FF6B6B; font-weight:bold;">${winner.scoreB}</div>
                    </div>
                </div>
                ${breakdownHtml}
                <div style="margin-top:12px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
                    <button onclick="window.RapBattle.exportResult('pdf')" class="btn-export-rap" style="padding:6px 16px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.2); border-radius:8px; color:#FFD700; cursor:pointer; font-size:11px;">📄 PDF</button>
                    <button onclick="window.RapBattle.exportResult('json')" class="btn-export-rap" style="padding:6px 16px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.2); border-radius:8px; color:#FFD700; cursor:pointer; font-size:11px;">📊 JSON</button>
                    <button onclick="window.RapBattle.exportResult('txt')" class="btn-export-rap" style="padding:6px 16px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.2); border-radius:8px; color:#FFD700; cursor:pointer; font-size:11px;">📝 TXT</button>
                </div>
                <div style="margin-top:8px; font-size:11px; color:#666;">📝 ${rapState.history.length} pesan dalam battle</div>
            </div>
        `;
    }

    // ============================================================
    // 🔥 UPDATE STATS
    // ============================================================
    function updateRapStats() {
        const timerEl = document.getElementById('rapTimerDisplay');
        if (timerEl && rapState.startTime) {
            const elapsed = Math.floor((Date.now() - rapState.startTime) / 1000);
            const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const secs = String(elapsed % 60).padStart(2, '0');
            timerEl.textContent = mins + ':' + secs;
        }

        const roundEl = document.getElementById('rapRoundDisplay');
        if (roundEl) {
            roundEl.textContent = rapState.currentRound + '/' + rapState.maxRounds;
        }

        // 🔥 UPDATE SCORE
        const scoreA = document.getElementById('rapScoreA');
        const scoreB = document.getElementById('rapScoreB');
        const fillA = document.getElementById('scoreAFill');
        const fillB = document.getElementById('scoreBFill');

        // Cek apakah ada hasil battle
        const resultContainer = document.getElementById('rapBattleResult');
        if (resultContainer) {
            const resultScoreA = resultContainer.querySelector('#rapScoreA');
            const resultScoreB = resultContainer.querySelector('#rapScoreB');
            if (resultScoreA && resultScoreA.textContent !== '0') {
                if (scoreA) {
                    scoreA.textContent = resultScoreA.textContent;
                }
                if (fillA) {
                    const val = parseInt(resultScoreA.textContent) || 0;
                    fillA.style.width = Math.min(val, 100) + '%';
                }
            }
            if (resultScoreB && resultScoreB.textContent !== '0') {
                if (scoreB) {
                    scoreB.textContent = resultScoreB.textContent;
                }
                if (fillB) {
                    const val = parseInt(resultScoreB.textContent) || 0;
                    fillB.style.width = Math.min(val, 100) + '%';
                }
            }
        }

        // Progress bar round
        const progressFill = document.getElementById('roundProgressBar');
        if (progressFill) {
            const progress = (rapState.currentRound / rapState.maxRounds) * 100;
            progressFill.style.width = Math.min(progress, 100) + '%';
        }
    }

    // ============================================================
    // 🔥 UPDATE FLOW STATS
    // ============================================================
    function updateFlowStats(flowA, flowB) {
        const container = document.getElementById('flowAnalysisContainer');
        if (!container) {
            return;
        }

        const displayA = getDisplayName(rapState.agentA);
        const displayB = getDisplayName(rapState.agentB);

        container.style.display = 'block';
        container.innerHTML = `
            <span class="flow-stat-item">🎤 ${displayA}: <span class="value">${flowA.flowScore}</span> (Rhymes: ${flowA.rhymes})</span>
            <span class="flow-stat-item">🎤 ${displayB}: <span class="value">${flowB.flowScore}</span> (Rhymes: ${flowB.rhymes})</span>
            <span class="flow-stat-item">📊 Complexity: ${flowA.complexity} vs ${flowB.complexity}</span>
        `;
    }

    // ============================================================
    // 🔥 START RAP TIMER
    // ============================================================
    function startRapTimer() {
        if (rapState.timerId) {
            clearInterval(rapState.timerId);
        }
        rapState.timerId = setInterval(updateRapStats, 1000);
    }

    // ============================================================
    // 🔥 VISUALIZER ENGINE
    // ============================================================
    let visualizerAnimId = null;
    let visualizerActive = false;

    function startVisualizer() {
        const canvas = document.getElementById('rapVisualizer');
        if (!canvas) return;
        visualizerActive = true;
        canvas.classList.add('active');
        renderVisualizer(canvas);
    }

    function stopVisualizer() {
        visualizerActive = false;
        if (visualizerAnimId) {
            cancelAnimationFrame(visualizerAnimId);
            visualizerAnimId = null;
        }
        const canvas = document.getElementById('rapVisualizer');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.classList.remove('active');
        }
        const status = document.getElementById('beatSyncStatus');
        if (status) {
            status.textContent = '● Sinkronisasi';
            status.style.color = 'rgba(255,255,255,0.2)';
        }
    }

    function renderVisualizer(canvas) {
        if (!visualizerActive) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const now = Date.now() / 1000;

        ctx.clearRect(0, 0, width, height);

        // Background
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, 'rgba(0,255,163,0.02)');
        grad.addColorStop(0.5, 'rgba(0,255,163,0.05)');
        grad.addColorStop(1, 'rgba(0,255,163,0.02)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Waveform bars
        const bars = 64;
        const barWidth = width / bars;
        const beatActive = window.RapBattle.logic.getRapBattleActive();

        for (let i = 0; i < bars; i++) {
            const time = now * 2 + (i / bars) * 4;
            let value = Math.sin(time * Math.PI * 2) * 0.5 + 0.5;
            const step = Math.floor(now * 2) % 16;
            if (step % 4 === 0) value = Math.min(1, value * 1.5);
            if (step % 8 === 4) value = Math.min(1, value * 1.3);

            const barHeight = value * height * 0.7 + 10;
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            const alpha = beatActive ? 0.6 : 0.15;
            const hue = 160 + value * 80;
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }

        // Beat indicator
        if (beatActive) {
            const pulse = Math.sin(now * 4) * 0.3 + 0.7;
            const x = (now * 2 % 1) * width;
            ctx.beginPath();
            ctx.arc(x, height / 2, 6 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,215,0,${0.3 * pulse})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFD700';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        visualizerAnimId = requestAnimationFrame(function() {
            renderVisualizer(canvas);
        });
    }

    function updateVisualizerLyric(line) {
        const status = document.getElementById('beatSyncStatus');
        if (status && line) {
            const short = line.length > 40 ? line.substring(0, 40) + '...' : line;
            status.textContent = '🎤 ' + short;
            status.style.color = '#00FFA3';
        }
    }

    function clearVisualizerLyric() {
        const status = document.getElementById('beatSyncStatus');
        if (status) {
            status.textContent = '● Sinkronisasi';
            status.style.color = 'rgba(255,255,255,0.2)';
        }
    }

    // ============================================================
    // 🔥 HISTORY MODAL
    // ============================================================
    function showHistoryModal(history) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.85); display:flex; align-items:center;
            justify-content:center; z-index:9999; padding:20px;
            animation:fadeIn 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background:#1a1a2e; border-radius:16px; max-width:800px; width:100%;
            max-height:80vh; padding:24px; border:1px solid rgba(255,215,0,0.1);
            overflow-y:auto;
        `;

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="color:#FFD700; margin:0;">🎤 Histori Rap Battle</h2>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none; border:none; color:#888; font-size:24px; cursor:pointer;">✕</button>
            </div>
        `;

        if (history.length === 0) {
            html += '<p style="color:#888; text-align:center;">Belum ada histori</p>';
        } else {
            for (let i = 0; i < history.length; i++) {
                const item = history[i];
                const date = new Date(item.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const cleanAgentA = cleanRapText(item.agentA || '');
                const cleanAgentB = cleanRapText(item.agentB || '');
                const cleanTopic = cleanRapText(item.topic || '');
                const cleanWinner = cleanRapText(item.winner || '');

                html += `
                    <div style="background:rgba(255,215,0,0.03); border-radius:12px; padding:14px; margin-bottom:10px; border-left:3px solid #FFD700;">
                        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">
                            <span style="font-weight:bold; color:#FFD700;">${sanitizeHTML(cleanAgentA)} vs ${sanitizeHTML(cleanAgentB)}</span>
                            <span style="font-size:11px; color:#666;">${date}</span>
                        </div>
                        <div style="font-size:13px; color:#A0B3C9;">Topic: ${sanitizeHTML(cleanTopic)}</div>
                        ${item.winner ? `<div style="font-size:13px; color:#FFD700;">🏆 Winner: ${sanitizeHTML(cleanWinner)}</div>` : ''}
                        <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
                            <button onclick="window.RapBattle.exportResult('json')" style="padding:3px 10px; background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.1); border-radius:6px; color:#FFD700; cursor:pointer; font-size:10px;">📊 JSON</button>
                            <button onclick="window.RapBattle.exportResult('pdf')" style="padding:3px 10px; background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.1); border-radius:6px; color:#FFD700; cursor:pointer; font-size:10px;">📄 PDF</button>
                            <button onclick="if(confirm('Hapus?')){localStorage.removeItem('rap_battle_history_v11');location.reload();}" style="padding:3px 10px; background:rgba(255,107,107,0.05); border:1px solid rgba(255,107,107,0.1); border-radius:6px; color:#FF6B6B; cursor:pointer; font-size:10px;">🗑️</button>
                        </div>
                    </div>
                `;
            }

            html += `
                <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
                    <button onclick="if(confirm('Hapus semua?')){localStorage.removeItem('rap_battle_history_v11');location.reload();}" style="padding:6px 14px; background:rgba(255,107,107,0.1); border:1px solid #FF6B6B; border-radius:8px; color:#FF6B6B; cursor:pointer; font-size:11px;">🗑️ Hapus Semua</button>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="padding:6px 14px; background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.1); border-radius:8px; color:#FFD700; cursor:pointer; font-size:11px;">Tutup</button>
                </div>
            `;
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
    // 🏆 HALL OF FAME MODAL — PAPAN PERINGKAT "RAPPER TERKENAL"
    // ✅ Reuse gaya visual showHistoryModal supaya konsisten, tapi
    //    menampilkan getLeaderboard() (agregasi dari history yang sudah
    //    ada — tidak ada storage baru).
    // ============================================================
    function showHallOfFameModal(board) {
        board = board || [];
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.85); display:flex; align-items:center;
            justify-content:center; z-index:9999; padding:20px;
            animation:fadeIn 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background:#1a1a2e; border-radius:16px; max-width:640px; width:100%;
            max-height:80vh; padding:24px; border:1px solid rgba(255,215,0,0.15);
            overflow-y:auto;
        `;

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="color:#FFD700; margin:0;">👑 Hall of Fame — Panggung Kontes Dunia</h2>
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none; border:none; color:#888; font-size:24px; cursor:pointer;">✕</button>
            </div>
        `;

        if (board.length === 0) {
            html += '<p style="color:#888; text-align:center;">Belum ada battle tercatat — jadilah rapper pertama yang legendaris!</p>';
        } else {
            const medals = ['🥇', '🥈', '🥉'];
            board.forEach(function(row, i) {
                const rankBadge = medals[i] || ('#' + (i + 1));
                html += `
                    <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,215,0,0.03); border-radius:12px; padding:12px 14px; margin-bottom:8px; border-left:3px solid #FFD700;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:20px; width:28px; text-align:center;">${rankBadge}</span>
                            <div>
                                <div style="font-weight:bold; color:#FFD700;">${row.fameIcon} ${sanitizeHTML(cleanRapText(row.name))}</div>
                                <div style="font-size:11px; color:#A0B3C9;">${sanitizeHTML(cleanRapText(row.fameTier))}</div>
                            </div>
                        </div>
                        <div style="text-align:right; font-size:11px; color:#888;">
                            <div>${row.wins} menang / ${row.battles} battle</div>
                            <div>${row.winRate}% win rate</div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            <div style="margin-top:12px; display:flex; gap:8px; justify-content:center;">
                <button onclick="this.closest('div[style*=fixed]').remove()" style="padding:6px 14px; background:rgba(255,215,0,0.05); border:1px solid rgba(255,215,0,0.1); border-radius:8px; color:#FFD700; cursor:pointer; font-size:11px;">Tutup</button>
            </div>
        `;

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
    // 🔥 EXPORT RESULT (wrapper)
    // ============================================================
    function exportResult(format) {
        format = format || 'pdf';
        exportRapResult(format);
    }

    // ============================================================
    // 🔥 ATTACH EVENTS
    // ============================================================
    function attachEvents(container) {
        container = container || document.getElementById('rapBattlePanel');
        if (!container) {
            return;
        }

        // 🔥 CYPHER LOUNGE — klik kartu untuk pilih Agent A / Agent B.
        // Sebelumnya logic ini cuma didesain untuk PERSIS 2 kartu (klik
        // salah satu → otomatis jadi A, sisanya dianggap B via
        // ":not(.selected)"). Itu rusak total begitu roster diperluas
        // jadi 14 rapper (Cypher Lounge) — makanya diganti dengan logic
        // role-cycling: klik kartu kosong → isi slot A dulu, lalu slot B;
        // klik kartu yang sudah A/B → lepas peran itu (biar bisa ganti).
        const renderer = window.RapUIRenderer;
        const cards = container.querySelectorAll('.rapper-card[data-agent]');
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            card.addEventListener('click', function() {
                const grid = container.querySelector('#cypherLoungeGrid') || container;
                const currentRole = this.dataset.role;

                if (currentRole === 'A' || currentRole === 'B') {
                    // Klik ulang kartu yang sudah berperan → lepas peran itu.
                    if (renderer && renderer.clearRole) renderer.clearRole(this);
                } else {
                    // Kartu belum berperan — isi slot A dulu, kalau A sudah
                    // terisi baru isi slot B. Kalau A & B sudah penuh,
                    // geser: kartu ini menggantikan slot B (biar user tetap
                    // bisa eksplorasi roster tanpa harus lepas manual dulu).
                    const hasA = grid.querySelector('.rapper-card[data-role="A"]');
                    const hasB = grid.querySelector('.rapper-card[data-role="B"]');
                    if (renderer && renderer.markRole) {
                        if (!hasA) {
                            renderer.markRole(this, 'A');
                        } else if (!hasB) {
                            renderer.markRole(this, 'B');
                        } else {
                            renderer.clearRole(hasB);
                            renderer.markRole(this, 'B');
                        }
                    }
                }

                if (renderer && renderer.syncHiddenSelects) {
                    renderer.syncHiddenSelects(container);
                }
            });
        }

        // 🔥 SONG SELECT — sekarang berisi ID lagu dari RapSoundbank
        // (bukan cuma nama genre polos), jadi pakai setActiveSong yang
        // sekaligus mengatur genre pattern & BPM sesuai lagu yang dipilih.
        const patternSelect = container.querySelector('#beatPatternSelect');
        if (patternSelect) {
            patternSelect.addEventListener('change', function() {
                const songId = this.value;
                if (window.RapBattle.logic.setActiveSong) {
                    window.RapBattle.logic.setActiveSong(songId);
                } else if (window.RapBattle.logic.setBeatPattern) {
                    // Fallback kalau soundbank belum sempat load.
                    window.RapBattle.logic.setBeatPattern(songId);
                }
            });
            // Sinkronkan pilihan awal dengan lagu/pattern aktif saat ini
            const activeSong = window.RapBattle.logic.getActiveSong && window.RapBattle.logic.getActiveSong();
            if (activeSong) {
                patternSelect.value = activeSong.id;
            } else if (window.RapBattle.logic.getBeatPattern) {
                const currentPattern = window.RapBattle.logic.getBeatPattern();
                if (currentPattern && window.RapSoundbank) {
                    const def = window.RapSoundbank.getDefaultSongForGenre(currentPattern);
                    if (def) patternSelect.value = def.id;
                }
            }
        }

        const startBtn = container.querySelector('#startRapBtn');
        if (startBtn) {
            startBtn.addEventListener('click', async function() {
                const topic = container.querySelector('#rapTopic')?.value || '';
                // 🔥 FIX: baca dari data-role (A/B) di Cypher Lounge, bukan
                // lagi dari asumsi "kartu terpilih vs kartu lain" yang cuma
                // valid untuk 2 kartu.
                const grid = container.querySelector('#cypherLoungeGrid') || container;
                const cardA = grid.querySelector('.rapper-card[data-role="A"]');
                const cardB = grid.querySelector('.rapper-card[data-role="B"]');
                const agentA = cardA?.dataset.agent || 'RahmadRaharjo';
                const agentB = cardB?.dataset.agent || 'Manager';
                const rounds = parseInt(container.querySelector('#rapRounds')?.value || 3);

                if (!topic) {
                    showToast('Masukkan topik rap battle!', 'error');
                    return;
                }

                if (!cardA || !cardB) {
                    showToast('Pilih Agent A dan Agent B dari Cypher Lounge dulu!', 'error');
                    return;
                }

                if (agentA === agentB) {
                    showToast('Agent A dan Agent B harus berbeda!', 'error');
                    return;
                }

                startBtn.disabled = true;
                startBtn.textContent = '⏳ Memulai...';

                try {
                    await startRapBattle(topic, agentA, agentB, rounds);
                } catch (e) {
                    // Silent fail
                } finally {
                    startBtn.disabled = false;
                    startBtn.textContent = '🎤 MULAI RAP';
                }
            });
        }

        const stopBtn = container.querySelector('#stopRapBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                abortRap();
            });
        }

        const historyBtn = container.querySelector('#rapHistoryBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                const history = loadHistory();
                if (history.length === 0) {
                    showToast('Belum ada histori rap battle', 'info');
                    return;
                }
                showHistoryModal(history);
            });
        }

        const hofBtn = container.querySelector('#rapHallOfFameBtn');
        if (hofBtn) {
            hofBtn.addEventListener('click', function() {
                const board = getLeaderboard ? getLeaderboard() : [];
                showHallOfFameModal(board);
            });
        }

        const tournamentBtn = container.querySelector('#rapTournamentBtn');
        if (tournamentBtn) {
            tournamentBtn.addEventListener('click', async function() {
                if (getRapBattleActive()) {
                    showToast('Rap battle/turnamen sedang berjalan', 'warn');
                    return;
                }
                const topic = container.querySelector('#rapTopic')?.value || '';
                if (!topic) {
                    showToast('Isi topik dulu sebelum memulai turnamen!', 'error');
                    return;
                }
                const rounds = parseInt(container.querySelector('#rapRounds')?.value || 3);
                if (!confirm('Mulai Turnamen Dunia dengan semua rapper di roster? Ini akan menjalankan beberapa battle berurutan.')) {
                    return;
                }

                tournamentBtn.disabled = true;
                tournamentBtn.textContent = '⏳ Turnamen Berjalan...';
                try {
                    await runTournament(null, topic, rounds);
                } catch (e) {
                    // Silent fail
                } finally {
                    tournamentBtn.disabled = false;
                    tournamentBtn.textContent = '🏆 TURNAMEN DUNIA';
                }
            });
        }
    }

    // ============================================================
    // 🔥 EXPOSE
    // ============================================================
    window.RapUIEvents = {
        attachEvents: attachEvents,
        addMessage: addMessage,
        showResult: showResult,
        updateRapStats: updateRapStats,
        updateFlowStats: updateFlowStats,
        startRapTimer: startRapTimer,
        showHistoryModal: showHistoryModal,
        showHallOfFameModal: showHallOfFameModal,
        exportResult: exportResult,
        startVisualizer: startVisualizer,
        stopVisualizer: stopVisualizer,
        updateVisualizerLyric: updateVisualizerLyric,
        clearVisualizerLyric: clearVisualizerLyric
    };

})();

import { DEB_CONFIG, DEB_showToast, DEB_getAgentProfile, DEB_populateAgentSelect } from './deb-config.js';
import { DEB_State } from './deb-state.js';
import { DEB_clearCache, DEB_getCacheStats } from './deb-data-engine.js';
import { DEB_SecurityManager } from './deb-classes.js';
import { DEB_DebateArena } from './deb-debate-arena.js';

    window.KESEMPATAN = window.KESEMPATAN || {};

    function DEB_upgradeDebateUI() {
        const container = document.getElementById('interactiveDebatePanel');
        if (!container) {
            return;
        }
        if (container.dataset.uiUpgraded === 'true') {
            return;
        }
        container.dataset.uiUpgraded = 'true';

        const styleId = 'debate-light-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .agent-selector-light { display:flex; align-items:center; justify-content:center; gap:16px; padding:12px 0; flex-wrap:wrap; }
                .agent-card-light { display:flex; align-items:center; gap:10px; padding:6px 16px 6px 6px; background:rgba(255,255,255,0.03); border-radius:14px; border:2px solid transparent; cursor:pointer; transition:all 0.3s ease; min-width:140px; }
                .agent-card-light:hover { background:rgba(255,255,255,0.05); transform:translateY(-2px); }
                .agent-card-light.selected { border-color:#00FFA3; background:rgba(0,255,163,0.05); box-shadow:0 0 30px rgba(0,255,163,0.05); }
                .agent-avatar-light { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
                .agent-name-light { font-weight:600; font-size:12px; color:#fff; }
                .agent-role-light { font-size:9px; color:rgba(255,255,255,0.3); }
                .vs-badge-light { font-size:14px; font-weight:700; color:#FFD700; text-shadow:0 0 20px rgba(255,215,0,0.2); }
                .debate-stats-light { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:8px 0 12px 0; }
                .stat-card-light { background:rgba(255,255,255,0.02); border-radius:12px; padding:8px 12px; text-align:center; border:1px solid rgba(255,255,255,0.03); }
                .stat-label-light { font-size:9px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.5px; display:block; }
                .stat-value-light { font-size:18px; font-weight:700; display:block; margin:2px 0; }
                .stat-bar-light { width:100%; height:3px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden; margin-top:4px; }
                .stat-fill-light { height:100%; border-radius:4px; transition:width 0.5s ease; }
                .live-indicator-light { display:flex; align-items:center; gap:8px; padding:4px 12px; background:rgba(255,0,0,0.08); border-radius:20px; border:1px solid rgba(255,0,0,0.1); margin-bottom:10px; font-size:10px; color:#FF6B6B; font-weight:600; animation:livePulseLight 2s ease-in-out infinite; }
                @keyframes livePulseLight { 0%,100%{opacity:1} 50%{opacity:0.6} }
                .live-dot-light { width:6px; height:6px; background:#FF0000; border-radius:50%; animation:dotPulseLight 1s ease-in-out infinite; }
                @keyframes dotPulseLight { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(0.7)} }
                .btn-start-light { padding:8px 24px; background:linear-gradient(135deg,#00FFA3,#00AA6E); border:none; border-radius:10px; color:#03050A; font-weight:600; font-size:13px; cursor:pointer; transition:all 0.3s ease; }
                .btn-start-light:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,255,163,0.2); }
                .btn-stop-light { padding:8px 24px; background:linear-gradient(135deg,#FF6B6B,#EE5A24); border:none; border-radius:10px; color:#fff; font-weight:600; font-size:13px; cursor:pointer; }
                .btn-stop-light:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(255,107,107,0.2); }
                .btn-export-light { padding:8px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:10px; color:rgba(255,255,255,0.5); font-size:11px; cursor:pointer; transition:all 0.3s ease; }
                .btn-export-light:hover { background:rgba(255,255,255,0.06); color:#fff; }
                @media (max-width:768px) { .debate-stats-light { grid-template-columns:repeat(2,1fr); } .agent-selector-light { flex-direction:column; gap:8px; } .agent-card-light { min-width:100%; } }
            `;
            document.head.appendChild(style);
        }

        if (!container.querySelector('.agent-selector-light')) {
            const cardsHTML = '<div class="agent-selector-light"><div class="agent-card-light selected" id="debateCardA"></div><div class="vs-badge-light">VS</div><div class="agent-card-light selected" id="debateCardB"></div></div>';
            let anchor = container.firstChild;
            while (anchor && anchor.nodeType !== 1) {
                anchor = anchor.nextSibling;
            }
            if (anchor) {
                anchor.insertAdjacentHTML('beforebegin', cardsHTML);
            } else {
                container.insertAdjacentHTML('afterbegin', cardsHTML);
            }

            const cardPalette = ['#00FFA3,#00AA6E', '#9B59B6,#8E44AD', '#3498DB,#2980B9', '#E67E22,#D35400', '#E74C3C,#C0392B'];

            function renderAgentCard(cardId, selectEl, paletteIndex) {
                const card = document.getElementById(cardId);
                if (!card || !selectEl || !selectEl.value) {
                    return;
                }
                const profile = DEB_getAgentProfile(selectEl.value);
                const gradient = cardPalette[paletteIndex % cardPalette.length];
                card.innerHTML = '<div class="agent-avatar-light" style="background:linear-gradient(135deg,' + gradient + ');">' + (profile.emoji || '') + '</div><div><div class="agent-name-light">' + DEB_SecurityManager.sanitizeHTML(profile.name) + '</div><div class="agent-role-light">' + DEB_SecurityManager.sanitizeHTML(profile.role || 'Agen KESEMPATAN OS') + '</div></div>';
            }

            const selA = document.getElementById('debateAgentA');
            const selB = document.getElementById('debateAgentB');
            renderAgentCard('debateCardA', selA, 0);
            renderAgentCard('debateCardB', selB, 1);
            if (selA) {
                selA.addEventListener('change', function() {
                    renderAgentCard('debateCardA', selA, 0);
                });
            }
            if (selB) {
                selB.addEventListener('change', function() {
                    renderAgentCard('debateCardB', selB, 1);
                });
            }
        }

        if (!container.querySelector('.debate-stats-light')) {
            const statsHTML = '<div class="debate-stats-light" id="debateStatsContainer"><div class="stat-card-light"><span class="stat-label-light">Agent A</span><span class="stat-value-light" id="debateScoreA" style="color:#00FFA3;">0%</span><div class="stat-bar-light"><div class="stat-fill-light" id="debateBarA" style="width:0%;background:#00FFA3;"></div></div></div><div class="stat-card-light"><span class="stat-label-light">Agent B</span><span class="stat-value-light" id="debateScoreB" style="color:#FF6B6B;">0%</span><div class="stat-bar-light"><div class="stat-fill-light" id="debateBarB" style="width:0%;background:#FF6B6B;"></div></div></div><div class="stat-card-light"><span class="stat-label-light">Timer</span><span class="stat-value-light" id="debateTimerDisplay" style="color:#FFD700;">00:00</span></div><div class="stat-card-light"><span class="stat-label-light">Round</span><span class="stat-value-light" id="debateRoundDisplay" style="color:#00D4FF;">0/3</span></div></div>';
            const insertAfter = container.querySelector('.agent-selector-light') || container.firstChild;
            if (insertAfter) {
                insertAfter.insertAdjacentHTML('afterend', statsHTML);
            } else {
                container.insertAdjacentHTML('afterbegin', statsHTML);
            }
        }

        document.querySelectorAll('#startDebateBtn, #stopDebateBtn, #exportPDFBtn, #exportJSONBtn, #historyBtn').forEach(function(btn) {
            if (btn && !btn.dataset.upgraded) {
                btn.dataset.upgraded = 'true';
                if (btn.id === 'startDebateBtn') {
                    btn.classList.add('btn-start-light');
                } else if (btn.id === 'stopDebateBtn') {
                    btn.classList.add('btn-stop-light');
                } else {
                    btn.classList.add('btn-export-light');
                }
            }
        });
    }

    
    
    
    function DEB_showHistoryModal(history) {
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
                html += '<div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:14px; margin-bottom:10px; border-left:3px solid #00FFA3;"><div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;"><span style="font-weight:bold; color:#00FFA3;">' + DEB_SecurityManager.sanitizeHTML(item.agentA) + ' vs ' + DEB_SecurityManager.sanitizeHTML(item.agentB) + '</span><span style="font-size:11px; color:#666;">' + date + '</span></div><div style="font-size:13px; color:var(--text-secondary);">Topic: ' + DEB_SecurityManager.sanitizeHTML(item.topic) + '</div>' + (item.winner ? '<div style="font-size:13px; color:#00FFA3;">Winner: ' + DEB_SecurityManager.sanitizeHTML(item.winner) + '</div>' : '') + '<div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;"><button onclick="window.KESEMPATAN.DebateArena?.exporter?.exportToJSON(' + JSON.stringify(item).replace(/"/g,'&quot;') + ')" style="padding:3px 10px; background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:6px; color:#00FFA3; cursor:pointer; font-size:10px;">JSON</button><button onclick="window.KESEMPATAN.DebateArena?.exporter?.exportToPDF(' + JSON.stringify(item).replace(/"/g,'&quot;') + ')" style="padding:3px 10px; background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:6px; color:#00FFA3; cursor:pointer; font-size:10px;">PDF</button><button onclick="if(confirm(\'Hapus?\')){window.KESEMPATAN.DebateArena?.history?.delete(' + item.id + ');location.reload();}" style="padding:3px 10px; background:rgba(255,107,107,0.05); border:1px solid rgba(255,107,107,0.1); border-radius:6px; color:#FF6B6B; cursor:pointer; font-size:10px;"></button></div></div>';
            });
            html += '<div style="margin-top:12px; display:flex; gap:8px; justify-content:center;"><button onclick="if(confirm(\'Hapus semua?\')){window.KESEMPATAN.DebateArena?.history?.clear();location.reload();}" style="padding:6px 14px; background:rgba(255,107,107,0.1); border:1px solid #FF6B6B; border-radius:8px; color:#FF6B6B; cursor:pointer; font-size:11px;">Hapus Semua</button><button onclick="this.closest(\'div[style*=\"fixed\"]\').remove()" style="padding:6px 14px; background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:8px; color:#00FFA3; cursor:pointer; font-size:11px;">Tutup</button></div>';
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

    
    
    

    const styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes fadeIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} } #debateLiveContainer::-webkit-scrollbar { width:6px; } #debateLiveContainer::-webkit-scrollbar-track { background:rgba(255,255,255,0.05); border-radius:3px; } #debateLiveContainer::-webkit-scrollbar-thumb { background:rgba(0,255,163,0.3); border-radius:3px; } #debateLiveContainer::-webkit-scrollbar-thumb:hover { background:rgba(0,255,163,0.5); } .btn-start-light, .btn-stop-light, .btn-export-light { transition:all 0.3s ease; } .btn-start-light:hover, .btn-stop-light:hover { transform:translateY(-2px); } .btn-start-light:hover { box-shadow:0 8px 30px rgba(0,255,163,0.2); } .btn-stop-light:hover { box-shadow:0 8px 30px rgba(255,107,107,0.2); } .btn-export-light:hover { background:rgba(255,255,255,0.06); color:#fff; }';
    document.head.appendChild(styleEl);

    
    
    
    const debate = new DEB_DebateArena();
    window.KESEMPATAN.DebateArena = debate;

    function DEB_renderDebatePanel() {
        const container = document.getElementById('interactiveDebatePanel');
        if (!container || container.dataset.rendered === 'true') {
            return;
        }
        container.dataset.rendered = 'true';
        container.innerHTML = '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"><label><input type="checkbox" id="voiceDebatToggle"><span style="color:#00FFA3;">Mode Voice Debat</span></label></div><div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;"><select id="debateAgentA" style="flex:1;"></select><span style="color:#00FFA3;">VS</span><select id="debateAgentB" style="flex:1;"></select></div><div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;"><input type="text" id="debateTopic" placeholder="Topik debat" style="flex:3;"><select id="debateRounds" style="flex:1;"><option value="1">1 Ronde</option><option value="3" selected>3 Ronde</option><option value="5">5 Ronde</option></select><select id="debateModerator" style="flex:1;"><option value="ai">AI Juri</option><option value="user">Saya Juri</option></select><select id="debateModel" style="flex:1;"></select></div><div style="display:flex; gap:10px; margin-bottom:16px;"><button id="startDebateBtn" class="execute-btn" style="flex:1;">MULAI DEBAT</button><button id="stopDebateBtn" class="execute-btn secondary" style="flex:0 0 auto; display:none; background:#ff4444; color:#fff;">Stop</button></div><div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;"><button id="exportPDFBtn" class="execute-btn secondary" style="flex:1;">Export PDF</button><button id="exportJSONBtn" class="execute-btn secondary" style="flex:1;">Export JSON</button><button id="historyBtn" class="execute-btn secondary" style="flex:1;">Riwayat</button></div><div id="debateLiveContainer" class="log-box" style="height:250px;"></div><div id="debateResult" style="margin-top:12px;"></div>';
        DEB_populateAgentSelect(document.getElementById('debateAgentA'), 0);
        DEB_populateAgentSelect(document.getElementById('debateAgentB'), 1);

        
        
        
        
        [500, 1500, 3000].forEach(function(delay) {
            setTimeout(function() {
                const selA = document.getElementById('debateAgentA');
                const selB = document.getElementById('debateAgentB');
                if (selA && (!selA.value || selA.options.length <= 1)) {
                    DEB_populateAgentSelect(selA, 0);
                }
                if (selB && (!selB.value || selB.options.length <= 1)) {
                    DEB_populateAgentSelect(selB, 1);
                }
            }, delay);
        });
    }

    function DEB_initDebateUI() {
        DEB_renderDebatePanel();

        const voiceToggle = document.getElementById('voiceDebatToggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('change', function() {
                debate.voice.toggle();
                if (debate.voice.isActive) {
                    
                    
                    
                    
                    
                    
                    if (window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        const unlock = new SpeechSynthesisUtterance('ok');
                        unlock.volume = 0.01;
                        window.speechSynthesis.speak(unlock);
                        setTimeout(function() {
                            window.speechSynthesis.cancel();
                        }, 50);
                    }
                    if (DEB_showToast) {
                        DEB_showToast('Voice Debat AKTIF!', 'success');
                    }
                    if (debate.voice.synthesis) {
                        debate.voice.loadVoices();
                    }
                } else {
                    if (DEB_showToast) {
                        DEB_showToast('Voice Debat NONAKTIF', 'info');
                    }
                }
            });
            if (voiceToggle.checked) {
                debate.voice.isActive = true;
                DEB_State.speechEnabled = true;
            }
        }

        const startBtn = document.getElementById('startDebateBtn');
        if (startBtn) {
            startBtn.addEventListener('click', async function() {
                let topic = document.getElementById('debateTopic')?.value;
                let agentASel = document.getElementById('debateAgentA');
                let agentBSel = document.getElementById('debateAgentB');
                let agentA = agentASel?.value;
                let agentB = agentBSel?.value;
                const moderator = document.getElementById('debateModerator')?.value || 'ai';
                const rounds = parseInt(document.getElementById('debateRounds')?.value || 3);
                const model = document.getElementById('debateModel')?.value || DEB_CONFIG.DEFAULT_MODEL;

                if (!topic) {
                    if (DEB_showToast) {
                        DEB_showToast('Masukkan topik debat', 'error');
                    }
                    return;
                }

                
                
                
                
                if (!agentA || !agentB) {
                    DEB_populateAgentSelect(agentASel, 0);
                    DEB_populateAgentSelect(agentBSel, 1);
                    agentA = agentASel?.value;
                    agentB = agentBSel?.value;
                }
                if (!agentA || !agentB) {
                    if (DEB_showToast) {
                        DEB_showToast('Tidak ada agen terdeteksi dari Dashboard. Buka halaman Dashboard dulu supaya daftar agen termuat, lalu kembali ke sini.', 'error');
                    }
                    return;
                }

                startBtn.disabled = true;
                startBtn.textContent = 'Memulai...';
                try {
                    await debate.startDebate({ topic: topic, agentA: agentA, agentB: agentB, rounds: rounds, model: model, moderator: moderator });
                } catch (_) {
                    
                } finally {
                    startBtn.disabled = false;
                    startBtn.textContent = 'Mulai Debat';
                }
            });
        }

        const stopBtn = document.getElementById('stopDebateBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                debate.abort();
            });
        }

        const exportPDFBtn = document.getElementById('exportPDFBtn');
        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', async function() {
                await debate.exportResult('pdf');
            });
        }

        const exportJSONBtn = document.getElementById('exportJSONBtn');
        if (exportJSONBtn) {
            exportJSONBtn.addEventListener('click', async function() {
                await debate.exportResult('json');
            });
        }

        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                const history = debate.history.loadAll();
                if (history.length === 0) {
                    if (DEB_showToast) {
                        DEB_showToast('Belum ada histori debat', 'info');
                    }
                    return;
                }
                DEB_showHistoryModal(history);
            });
        }

        const modelSelect = document.getElementById('debateModel');
        if (modelSelect) {
            const models = DEB_CONFIG.SUPPORTED_MODELS;
            modelSelect.innerHTML = Object.entries(models).map(function(pair) {
                return '<option value="' + pair[0] + '">' + pair[1] + '</option>';
            }).join('');
            modelSelect.value = DEB_CONFIG.DEFAULT_MODEL;
        }

        window.KESEMPATAN.DebateCache = { clear: DEB_clearCache, getStats: DEB_getCacheStats };

        setTimeout(DEB_upgradeDebateUI, 200);
    }

    
    
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', DEB_initDebateUI);
    } else {
        DEB_initDebateUI();
    }

/* ============================================================
   interactive/forum/for-core.js
   INTI FORUM — tanya semua agen, mode switcher 5 panel, upgrade
   UI lintas panel, preferensi, notifikasi, render panel, init,
   ekspor window.ChatModule. Dimuat PALING TERAKHIR.
   ============================================================ */

window.askAllAgents = async function(question) {
        if (FOR_forumRunning) {
            return;
        }
        if (document.querySelectorAll('.agent-checkbox[data-agent]').length === 0 && window.KESEMPATAN?.AgentRenderer?.renderAllAgents) {
            window.KESEMPATAN?.AgentRenderer?.renderAllAgents();
        }
        const checkboxes = document.querySelectorAll('.agent-checkbox:checked');
        const agents = Array.from(checkboxes).map(function(cb) {
            return cb.dataset.agent;
        });
        if (agents.length === 0) {
            return;
        }
        const apiKey = FOR_getApiKey();
        if (!apiKey) {
            return;
        }
        
        // AMBIL DATA DARI 3 SUMBER (SAMA KAYAK CHAT AI!)
        const context = await FOR_getAllContext(question, {
            forceRefresh: false,
            topK: FOR_CONFIG.TOP_K_MEMORY,
            dbLimit: FOR_CONFIG.DB_LIMIT,
            maxResults: FOR_CONFIG.MAX_RESULTS
        });
        
        FOR_forumAbort = false;
        FOR_forumRunning = true;
        const sendBtn = document.getElementById('forumSendBtn');
        const stopBtn = document.getElementById('forumStopBtn');
        if (sendBtn) {
            sendBtn.style.display = 'none';
        }
        if (stopBtn) {
            stopBtn.style.display = 'inline-block';
        }
        FOR_addForumMessage('Anda', question, true);
        
        for (let i = 0; i < agents.length; i++) {
            if (FOR_forumAbort) {
                break;
            }
            const agent = agents[i];
            const displayName = FOR_getAgentDisplayName(agent);
            FOR_addForumMessage('Sistem', 'Menanyai ' + displayName + ' (' + (i + 1) + '/' + agents.length + ')...', false);
            try {
                const cfg = window.getAgentConfig ? window.getAgentConfig(agent) : null;
                const role = cfg?.role || 'ahli';
                
                // BUILD PROMPT DENGAN DATA DARI 3 SUMBER (SAMA KAYAK CHAT AI!)
                const prompt = FOR_buildForumPrompt(agent, role, question, context);
                
                // PAKAI CALL AI LANGSUNG (SAMA KAYAK CHAT AI!)
                const response = await FOR_callAI(prompt, apiKey);
                
                // CLEAN RESPONSE
                let answer = response;
                if (window.safeParseResponse) {
                    const parsed = window.safeParseResponse(response);
                    answer = parsed.summary || parsed.recommendation || response;
                }
                
                // BATASI PANJANG JAWABAN
                answer = answer.substring(0, 600);
                
                FOR_addForumMessage(displayName, answer, false);
                FOR_saveMessageToMemory(question, answer, displayName);
                await new Promise(function(r) {
                    setTimeout(r, 800);
                });
            } catch (err) {
                FOR_addForumMessage(displayName, 'Error: ' + err.message, false);
            }
        }
        if (FOR_forumAbort) {
            FOR_addForumMessage('Forum', 'Proses dihentikan.', false);
        } else {
            FOR_addForumMessage('Forum', 'Selesai! ' + agents.length + ' agen memberikan pendapat.', false);
        }
        FOR_forumRunning = false;
        if (sendBtn) {
            sendBtn.style.display = 'inline-block';
        }
        if (stopBtn) {
            stopBtn.style.display = 'none';
        }
    };

function FOR_initChatModeButtons() {
        const aiBtn = document.getElementById('modeChatAiBtn');
        const agentBtn = document.getElementById('modeChatAgentBtn');
        const forumBtn = document.getElementById('modeForumBtn');
        const debateBtn = document.getElementById('modeDebateBtn');
        const tournamentBtn = document.getElementById('modeTournamentBtn');
        const aiPanel = document.getElementById('interactiveChatAiPanel');
        const agentPanel = document.getElementById('interactiveChatAgentPanel');
        const forumPanel = document.getElementById('interactiveForumPanel');
        const debatePanel = document.getElementById('interactiveDebatePanel');
        const tournamentPanel = document.getElementById('interactiveTournamentPanel');
        if (!aiBtn || !agentBtn || !forumBtn) {
            return;
        }
        const newAi = aiBtn.cloneNode(true);
        const newAgent = agentBtn.cloneNode(true);
        const newForum = forumBtn.cloneNode(true);
        aiBtn.parentNode.replaceChild(newAi, aiBtn);
        agentBtn.parentNode.replaceChild(newAgent, agentBtn);
        forumBtn.parentNode.replaceChild(newForum, forumBtn);
        const finalAi = document.getElementById('modeChatAiBtn');
        const finalAgent = document.getElementById('modeChatAgentBtn');
        const finalForum = document.getElementById('modeForumBtn');

        // Debat & Turnamen dulu di-switch dari main.js (initInteractivePageButtons,
        // sudah dihapus — lihat KESEMPATAN_OS_REORG_NOTES.md). Sekarang jadi
        // satu-satunya sumber switching untuk seluruh 5 panel Fitur Interaktif,
        // supaya main.js tidak perlu tahu apa-apa soal halaman ini lagi.
        let finalDebate = debateBtn;
        let finalTournament = tournamentBtn;
        if (debateBtn) {
            const newDebate = debateBtn.cloneNode(true);
            debateBtn.parentNode.replaceChild(newDebate, debateBtn);
            finalDebate = document.getElementById('modeDebateBtn');
        }
        if (tournamentBtn) {
            const newTournament = tournamentBtn.cloneNode(true);
            tournamentBtn.parentNode.replaceChild(newTournament, tournamentBtn);
            finalTournament = document.getElementById('modeTournamentBtn');
        }

        const allBtns = [finalAi, finalAgent, finalForum, finalDebate, finalTournament];
        const allPanels = [aiPanel, agentPanel, forumPanel, debatePanel, tournamentPanel];

        function resetAll() {
            allBtns.forEach(function(btn) {
                if (btn) {
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.classList.remove('chat-mode-active');
                    btn.classList.remove('active');
                }
            });
            allPanels.forEach(function(panel) {
                if (panel) {
                    panel.style.display = 'none';
                }
            });
        }

        function setActive(btn, panel) {
            resetAll();
            if (panel) {
                panel.style.display = 'block';
            }
            if (btn) {
                btn.style.background = 'linear-gradient(135deg, #00FFA3, #00AA6E)';
                btn.style.color = '#03050A';
                btn.classList.add('chat-mode-active');
                btn.classList.add('active');
            }
        }

        finalAi.onclick = function() {
            setActive(finalAi, aiPanel);
            localStorage.setItem('kes_chat_mode', 'ai');
        };
        finalAgent.onclick = function() {
            setActive(finalAgent, agentPanel);
            localStorage.setItem('kes_chat_mode', 'agent');
        };
        finalForum.onclick = function() {
            setActive(finalForum, forumPanel);
            localStorage.setItem('kes_chat_mode', 'forum');
        };
        if (finalDebate) {
            finalDebate.onclick = function() {
                setActive(finalDebate, debatePanel);
                localStorage.setItem('kes_chat_mode', 'debate');
            };
        }
        if (finalTournament) {
            finalTournament.onclick = function() {
                setActive(finalTournament, tournamentPanel);
                localStorage.setItem('kes_chat_mode', 'tournament');
            };
        }

        const saved = localStorage.getItem('kes_chat_mode') || 'ai';
        if (saved === 'agent') {
            finalAgent.onclick();
        } else if (saved === 'forum') {
            finalForum.onclick();
        } else if (saved === 'debate' && finalDebate) {
            finalDebate.onclick();
        } else if (saved === 'tournament' && finalTournament) {
            finalTournament.onclick();
        } else {
            finalAi.onclick();
        }
    }

function FOR_upgradeChatUI() {
        const container = document.getElementById('interactivePage');
        if (!container) {
            return;
        }
        
        container.style.maxWidth = '1400px';
        container.style.margin = '0 auto';
        container.style.padding = '0 10px';
        
        const panels = container.querySelectorAll('.chat-panel, #interactiveChatAiPanel, #interactiveChatAgentPanel, #interactiveForumPanel');
        panels.forEach(function(panel) {
            if (panel) {
                panel.style.width = '100%';
                panel.style.maxWidth = '100%';
                panel.style.minHeight = '400px';
            }
        });
        
        const messages = container.querySelectorAll('.chat-messages-premium, #chatAiMessages, #chatAgentMessages, #interactiveForumMessages');
        messages.forEach(function(msg) {
            if (msg) {
                msg.style.height = '500px';
                msg.style.maxHeight = '70vh';
                msg.style.minHeight = '300px';
                msg.style.overflowY = 'auto';
            }
        });
        
        const inputs = container.querySelectorAll('.input-wrapper-premium, .input-wrapper');
        inputs.forEach(function(inp) {
            if (inp) {
                inp.style.maxWidth = '100%';
                inp.style.width = '100%';
            }
        });
        
        const inputFields = container.querySelectorAll('.input-wrapper-premium input, .input-wrapper input, #chatAiInput, #chatAgentInput, #forumInput');
        inputFields.forEach(function(field) {
            if (field) {
                field.style.fontSize = '16px';
                field.style.padding = '14px 18px';
                field.style.width = '100%';
            }
        });
        
        if (!container.querySelector('.chat-header-premium')) {
            const headerBtnStyle = 'white-space:nowrap; font-size:10px; padding:4px 8px; flex-shrink:0;';
            const headerHTML = '<div class="chat-header-premium"><div class="chat-header-left"><span class="chat-header-icon"></span><div><div class="chat-header-title">AI Chat Center</div><div class="chat-header-sub">Streaming • Voice • Agents • Personal</div></div></div><div class="chat-header-right" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;"><button class="chat-header-btn" id="themeToggleBtn" title="Toggle Theme" style="' + headerBtnStyle + '">Tema</button><button class="chat-header-btn" id="toggleSpeechBtn" title="Suara ON/OFF" style="' + headerBtnStyle + '">Suara</button><button class="chat-header-btn" id="cancelRequestBtn" title="Batal Request" style="' + headerBtnStyle + '">Batal</button><button class="chat-header-btn" id="exportTxtBtn" title="Export TXT" style="' + headerBtnStyle + '">TXT</button><button class="chat-header-btn" id="exportPdfHeaderBtn" title="Export PDF" style="' + headerBtnStyle + '">PDF</button><button class="chat-header-btn" id="typingSoundBtn" title="Typing Sound" style="' + headerBtnStyle + '">Bunyi</button><button class="chat-header-btn" id="clearAllChatBtn" title="Clear Chat" style="' + headerBtnStyle + '">Hapus</button></div></div>';
            let anchor = container.firstChild;
            while (anchor && anchor.nodeType !== 1) {
                anchor = anchor.nextSibling;
            }
            if (anchor) {
                anchor.insertAdjacentHTML('beforebegin', headerHTML);
            } else {
                container.insertAdjacentHTML('afterbegin', headerHTML);
            }

            // Sambungkan tombol header ke fungsi asli (dulu dipanggil lewat
            // onclick="FOR_toggleTheme()" dkk — nama global yang tidak pernah ada,
            // jadi tombol-tombol ini tidak pernah berfungsi).
            const cm = window.ChatModule || {};
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn && cm.toggleTheme) {
                themeBtn.addEventListener('click', cm.toggleTheme);
            }
            if (cm.initSpeechToggle) {
                cm.initSpeechToggle();
            }
            const cancelBtn = document.getElementById('cancelRequestBtn');
            if (cancelBtn && cm.cancelAIRequest) {
                cancelBtn.addEventListener('click', cm.cancelAIRequest);
            }
            const exportTxtBtn = document.getElementById('exportTxtBtn');
            if (exportTxtBtn && cm.exportChat) {
                exportTxtBtn.addEventListener('click', function() {
                    cm.exportChat('chatAiMessages');
                });
            }
            const exportPdfHeaderBtn = document.getElementById('exportPdfHeaderBtn');
            if (exportPdfHeaderBtn && cm.exportChatPDF) {
                exportPdfHeaderBtn.addEventListener('click', function() {
                    cm.exportChatPDF('chatAiMessages');
                });
            }
            const typingSoundBtn = document.getElementById('typingSoundBtn');
            if (typingSoundBtn && cm.toggleTypingSound) {
                typingSoundBtn.addEventListener('click', cm.toggleTypingSound);
            }
            const clearAllBtn = document.getElementById('clearAllChatBtn');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', function() {
                    if (!confirm('Hapus semua chat?')) {
                        return;
                    }
                    ['chatAiMessages', 'chatAgentMessages', 'interactiveForumMessages'].forEach(function(id) {
                        const el = document.getElementById(id);
                        if (el) {
                            el.innerHTML = '';
                        }
                        FOR_clearChatHistory(id);
                    });
                });
            }
        }
        
        const panelsList = [
            { id: 'interactiveChatAiPanel', msgId: 'chatAiMessages', inputId: 'chatAiInput', sendId: 'chatAiSendBtn' },
            { id: 'interactiveChatAgentPanel', msgId: 'chatAgentMessages', inputId: 'chatAgentInput', sendId: 'chatAgentSendBtn' },
            { id: 'interactiveForumPanel', msgId: 'interactiveForumMessages', inputId: 'forumInput', sendId: 'forumSendBtn', stopId: 'forumStopBtn' }
        ];
        
        panelsList.forEach(function(p) {
            const panel = document.getElementById(p.id);
            if (!panel || panel.dataset.chatUpgraded === 'true') {
                return;
            }
            panel.dataset.chatUpgraded = 'true';
            
            const msg = panel.querySelector('#' + p.msgId);
            if (msg && !msg.classList.contains('chat-messages-premium')) {
                msg.classList.add('chat-messages-premium');
                // FIX: kalau panel SUDAH punya pesan hidup (user sempat
                // kirim pesan sebelum setTimeout ini sempat jalan), JANGAN
                // pulihkan riwayat lagi — riwayat itu sudah mengandung pesan
                // yang sama, dan menampilkannya lagi bikin dobel persis.
                const alreadyHasLiveMessages = msg.querySelector('.message-wrapper') !== null;
                if (!alreadyHasLiveMessages) {
                    const history = FOR_loadChatHistory(p.msgId);
                    history.forEach(function(h) {
                        FOR_addMessage(msg, h.sender, h.message, h.isUser);
                    });
                }
            }
            
            const input = panel.querySelector('#' + p.inputId);
            if (input) {
                const parent = input.parentNode;
                if (parent && !parent.classList.contains('input-wrapper-premium')) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'input-wrapper-premium';
                    const sendBtn = panel.querySelector('#' + p.sendId);
                    
                    const voiceBtn = document.createElement('button');
                    voiceBtn.className = 'voice-btn-premium';
                    voiceBtn.textContent = 'Rekam';
                    voiceBtn.title = 'Input Suara';
                    voiceBtn.style.cssText = 'width:auto; min-width:0; white-space:nowrap; font-size:10px; padding:4px 8px; flex-shrink:0;';
                    voiceBtn.dataset.voiceFor = p.inputId;
                    voiceBtn.onclick = function() {
                        FOR_startVoiceInput(p.inputId);
                    };
                    
                    const emojiBtn = document.createElement('button');
                    emojiBtn.className = 'voice-btn-premium';
                    emojiBtn.id = 'emojiBtn';
                    emojiBtn.textContent = 'Emoji';
                    emojiBtn.title = 'Pilih Emoji';
                    emojiBtn.style.cssText = 'width:auto; min-width:0; white-space:nowrap; font-size:10px; padding:4px 8px; flex-shrink:0;';
                    emojiBtn.onclick = function(e) {
                        e.stopPropagation();
                        FOR_toggleEmojiPicker(p.inputId);
                    };
                    
                    if (sendBtn) {
                        parent.removeChild(input);
                        if (sendBtn) {
                            parent.removeChild(sendBtn);
                        }
                        wrapper.appendChild(voiceBtn);
                        wrapper.appendChild(emojiBtn);
                        wrapper.appendChild(input);
                        if (sendBtn) {
                            wrapper.appendChild(sendBtn);
                        }
                        parent.appendChild(wrapper);
                    }
                }
            }
            
            const sendBtn = panel.querySelector('#' + p.sendId);
            if (sendBtn && !sendBtn.classList.contains('send-btn-premium')) {
                sendBtn.classList.add('send-btn-premium');
                sendBtn.textContent = 'Kirim';
                sendBtn.title = 'Kirim';
                sendBtn.style.width = 'auto';
                sendBtn.style.minWidth = '0';
                sendBtn.style.whiteSpace = 'nowrap';
                sendBtn.style.flexShrink = '0';
                sendBtn.addEventListener('click', FOR_playTypingSound);
            }
            
            if (p.stopId) {
                const stopBtn = panel.querySelector('#' + p.stopId);
                if (stopBtn && !stopBtn.classList.contains('stop-btn-premium')) {
                    stopBtn.classList.add('stop-btn-premium');
                }
            }
        });
        
        FOR_loadTheme();
    }

function FOR_showPreferencesPanel() {
        const existing = document.getElementById('preferencesPanel');
        if (existing) {
            existing.remove();
            return;
        }
        const panel = document.createElement('div');
        panel.id = 'preferencesPanel';
        panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a1a2e; border:1px solid rgba(0,255,163,0.2); border-radius:16px; padding:24px; z-index:9999; max-width:420px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.8); animation:fadeIn 0.3s ease;';
        panel.innerHTML = '<h3 style="color:#00FFA3;margin:0 0 16px 0;">Preferensi Chat</h3>' +
            '<div style="margin-bottom:12px;"><label style="color:#A0B3C9;font-size:12px;display:block;margin-bottom:4px;">Gaya Jawaban</label><select id="prefStyle" style="width:100%;padding:8px;border-radius:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,163,0.2);color:#fff;"><option value="casual" ' + (FOR_userPreferences.style === 'casual' ? 'selected' : '') + '>Santai</option><option value="formal" ' + (FOR_userPreferences.style === 'formal' ? 'selected' : '') + '>Formal</option></select></div>' +
            '<div style="display:flex;gap:8px;"><button onclick="FOR_savePreferencesPanel()" style="flex:1;padding:8px;border:none;border-radius:8px;background:linear-gradient(135deg,#00FFA3,#00AA6E);color:#03050A;font-weight:bold;cursor:pointer;">Simpan</button><button onclick="document.getElementById(\'preferencesPanel\').remove()" style="padding:8px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:transparent;color:#A0B3C9;cursor:pointer;">Tutup</button></div>';
        document.body.appendChild(panel);
    }

window.savePreferencesPanel = function() {
        const style = document.getElementById('prefStyle').value;
        const prefs = {
            style: style,
            categories: FOR_userPreferences.categories,
            updateInterval: FOR_userPreferences.updateInterval,
            sources: FOR_userPreferences.sources
        };
        FOR_savePreferences(prefs);
        FOR_stylePreference = style;
        const panel = document.getElementById('preferencesPanel');
        if (panel) {
            panel.remove();
        }
    };

function FOR_sendPushNotification(title, body, link) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        try {
            const notification = new Notification('' + title, {
                body: body,
                icon: 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27%2300FFA3%27/%3E%3Ctext x=%2750%27 y=%2768%27 font-size=%2750%27 text-anchor=%27middle%27 fill=%27%2303050A%27%3EK%3C/text%3E%3C/svg%3E',
                silent: false,
                tag: Date.now().toString(),
                requireInteraction: false
            });
            notification.onclick = function() {
                if (link && link !== '#') {
                    window.open(link, '_blank');
                }
                notification.close();
            };
            setTimeout(function() {
                notification.close();
            }, 8000);
        } catch (_) {
            // Silent fail
        }
    }

function FOR_renderForumPanel() {
        const container = document.getElementById('interactiveForumPanel');
        if (!container || container.dataset.rendered === 'true') {
            return;
        }
        container.dataset.rendered = 'true';
        container.innerHTML = "<div id=\"interactiveForumMessages\" class=\"chat-messages\" style=\"height:300px; background:rgba(0,0,0,0.3); border-radius:16px; padding:12px; overflow-y:auto;\"><div style=\"color:#00FFA3;\">FORUM 55 AGEN</div><div style=\"color:#A0B3C9;\">Pilih agen (centang di dashboard), lalu tanyakan apa saja.</div></div><div style=\"display:flex; gap:10px; margin-top:12px;\"><input type=\"text\" id=\"forumInput\" placeholder=\"Misal: Bagaimana cara jualan online buat pemula?\" style=\"flex:1;\"><button id=\"forumSendBtn\" class=\"execute-btn success\">Tanyakan</button><button id=\"forumStopBtn\" class=\"execute-btn secondary\" style=\"display:none;\">Stop</button></div>";
    }

function FOR_initForumPrefs() {
    FOR_userPreferences = FOR_loadPreferences();
}

function FOR_initForum() {
        FOR_initForumPrefs();
        FOR_renderForumPanel();

        FOR_initChatModeButtons();

        const forumSend = document.getElementById('forumSendBtn');
        const forumStop = document.getElementById('forumStopBtn');
        const forumInput = document.getElementById('forumInput');

        if (forumSend) {
            forumSend.onclick = function() {
                const q = forumInput?.value.trim();
                if (q && window.askAllAgents) {
                    window.askAllAgents(q);
                }
                if (forumInput) {
                    forumInput.value = '';
                }
            };
        }
        if (forumStop) {
            forumStop.onclick = function() {
                FOR_forumAbort = true;
            };
        }
        if (forumInput) {
            forumInput.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    forumSend?.click();
                }
            };
        }

        setTimeout(FOR_upgradeChatUI, 300);

        window.fetchLatestNews = window.fetchLatestNews || function() {};
        window.refreshNewsNow = window.refreshNewsNow || function() {};
        window.newsCache = window.newsCache || function() { return []; };
        window.enhancePromptWithNews = window.enhancePromptWithNews || function(prompt) { return prompt; };
        window.showPreferencesPanel = FOR_showPreferencesPanel;
        window.sendPushNotification = FOR_sendPushNotification;
    }

window.ChatModule = window.ChatModule || {};
Object.assign(window.ChatModule, {
    askAllAgents: window.askAllAgents,
    buildForumPrompt: FOR_buildForumPrompt,
    showPreferencesPanel: FOR_showPreferencesPanel,
    sendPushNotification: FOR_sendPushNotification,
    clearCache: FOR_clearCache,
    getCacheStats: FOR_getCacheStats,
    CONFIG: FOR_CONFIG
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FOR_initForum);
} else {
    FOR_initForum();
}

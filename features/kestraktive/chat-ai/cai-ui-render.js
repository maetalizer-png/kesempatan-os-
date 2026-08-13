
import { CAI_CONFIG } from './cai-config.js';
import { CAI_State } from './cai-state.js';


export function CAI_loadPreferences() {
        try {
            const saved = localStorage.getItem(CAI_CONFIG.PREF_KEY);
            if (saved) {
                const prefs = JSON.parse(saved);
                return {
                    categories: prefs.categories || ['politik', 'ekonomi'],
                    sources: prefs.sources || [],
                    updateInterval: prefs.updateInterval || 60000,
                    language: prefs.language || 'id',
                    style: prefs.style || 'casual',
                    name: prefs.name || '',
                    preferences: prefs.preferences || {}
                };
            }
        } catch (_) {
            
        }
        return {
            categories: ['politik', 'ekonomi', 'teknologi'],
            sources: [],
            updateInterval: 60000,
            language: 'id',
            style: 'casual',
            name: '',
            preferences: {}
        };
    }

export function CAI_savePreferences(prefs) {
        try {
            localStorage.setItem(CAI_CONFIG.PREF_KEY, JSON.stringify(prefs));
            CAI_State.userPreferences = prefs;
            if (prefs.language) {
                CAI_State.languagePreference = prefs.language;
            }
            if (prefs.style) {
                CAI_State.stylePreference = prefs.style;
            }
        } catch (_) {
            
        }
    }

export function CAI_loadFeedback() {
        try {
            const saved = localStorage.getItem(CAI_CONFIG.FEEDBACK_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (_) {
            
        }
        return [];
    }

export function CAI_saveFeedback(feedback) {
        try {
            CAI_State.feedbackHistory.push(feedback);
            if (CAI_State.feedbackHistory.length > 200) {
                CAI_State.feedbackHistory = CAI_State.feedbackHistory.slice(-200);
            }
            localStorage.setItem(CAI_CONFIG.FEEDBACK_KEY, JSON.stringify(CAI_State.feedbackHistory));
        } catch (_) {
            
        }
    }

export function CAI_handleFeedback(messageId, rating) {
        const feedback = { messageId: messageId, rating: rating, timestamp: Date.now() };
        CAI_saveFeedback(feedback);
        
        if (rating < 3) {
            CAI_State.stylePreference = 'formal';
        } else if (rating >= 4) {
            CAI_State.stylePreference = 'casual';
        }
        
        const prefs = CAI_loadPreferences();
        prefs.style = CAI_State.stylePreference;
        CAI_savePreferences(prefs);
        
        const container = document.getElementById('chatAiMessages');
        if (container && rating >= 4) {
            const feedbackMsg = document.createElement('div');
            feedbackMsg.style.cssText = 'text-align:center;color:rgba(0,255,163,0.4);font-size:11px;padding:4px 0;';
            feedbackMsg.textContent = 'Terima kasih feedbacknya!';
            container.appendChild(feedbackMsg);
            setTimeout(function() {
                if (feedbackMsg.parentNode) {
                    feedbackMsg.remove();
                }
            }, 3000);
        }
    }






export function CAI_stripMarkdown(text) {
        return text
            .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/`{1,3}([^`]*?)`{1,3}/g, '$1')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/^[-*+]\s+/gm, '')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/~~(.*?)~~/g, '$1');
    }

export function CAI_speakText(text) {
        if (!CAI_State.speechEnabled) {
            return;
        }
        if (!text || text.length === 0) {
            return;
        }
        window.speechSynthesis.cancel();
        const cleanText = CAI_stripMarkdown(text).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 600);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = CAI_State.languagePreference === 'en' ? 'en-US' : 'id-ID';
        utterance.rate = 0.92;
        const voices = window.speechSynthesis.getVoices();
        const targetVoice = voices.find(function(v) {
            return v.lang === utterance.lang;
        });
        if (targetVoice) {
            utterance.voice = targetVoice;
        }
        
        
        
        
        
        const keepAlive = setInterval(function() {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.resume();
            } else {
                clearInterval(keepAlive);
            }
        }, 5000);
        utterance.onend = function() {
            clearInterval(keepAlive);
        };
        utterance.onerror = function() {
            clearInterval(keepAlive);
        };
        CAI_State.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

export function CAI_initSpeechToggle() {
        const toggleBtn = document.getElementById('toggleSpeechBtn');
        if (!toggleBtn) {
            return;
        }
        const saved = localStorage.getItem('kes_speech_enabled');
        if (saved !== null) {
            CAI_State.speechEnabled = saved === 'true';
        }
        toggleBtn.textContent = CAI_State.speechEnabled ? 'ON' : 'OFF';
        toggleBtn.title = CAI_State.speechEnabled ? 'Suara ON' : 'Suara OFF';
        toggleBtn.addEventListener('click', function() {
            CAI_State.speechEnabled = !CAI_State.speechEnabled;
            localStorage.setItem('kes_speech_enabled', CAI_State.speechEnabled);
            toggleBtn.textContent = CAI_State.speechEnabled ? 'ON' : 'OFF';
            toggleBtn.title = CAI_State.speechEnabled ? 'Suara ON' : 'Suara OFF';
            if (!CAI_State.speechEnabled && CAI_State.currentUtterance) {
                window.speechSynthesis.cancel();
            }
        });
    }

export function CAI_startVoiceInput(inputId) {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            return;
        }
        if (CAI_State.isListening) {
            if (CAI_State.recognition) {
                CAI_State.recognition.stop();
            }
            CAI_State.isListening = false;
            return;
        }
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        CAI_State.recognition = new SpeechRecognition();
        CAI_State.recognition.lang = CAI_State.languagePreference === 'en' ? 'en-US' : 'id-ID';
        CAI_State.recognition.continuous = false;
        CAI_State.recognition.interimResults = true;
        CAI_State.recognition.onstart = function() {
            CAI_State.isListening = true;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Merekam...';
                btn.style.background = 'rgba(255,107,107,0.2)';
                btn.style.borderColor = '#FF6B6B';
            }
        };
        CAI_State.recognition.onresult = function(e) {
            const transcript = e.results[0][0].transcript;
            const input = document.getElementById(inputId);
            if (input) {
                input.value = transcript;
                const sendBtn = input.closest('.input-wrapper-premium')?.querySelector('.send-btn-premium');
                if (sendBtn && e.results[0].isFinal) {
                    setTimeout(function() {
                        sendBtn.click();
                    }, 300);
                }
            }
        };
        CAI_State.recognition.onend = function() {
            CAI_State.isListening = false;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Rekam';
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        };
        CAI_State.recognition.onerror = function() {
            CAI_State.isListening = false;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Rekam';
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        };
        CAI_State.recognition.start();
    }


export function CAI_saveChatHistory(panelId, messages) {
        try {
            const history = JSON.parse(localStorage.getItem(CAI_CONFIG.STORAGE_KEY) || '{}');
            history[panelId] = messages.slice(-CAI_CONFIG.MAX_HISTORY);
            localStorage.setItem(CAI_CONFIG.STORAGE_KEY, JSON.stringify(history));
        } catch (_) {
            
        }
    }

export function CAI_loadChatHistory(panelId) {
        try {
            const history = JSON.parse(localStorage.getItem(CAI_CONFIG.STORAGE_KEY) || '{}');
            return history[panelId] || [];
        } catch (_) {
            return [];
        }
    }

export function CAI_clearChatHistory(panelId) {
        try {
            const history = JSON.parse(localStorage.getItem(CAI_CONFIG.STORAGE_KEY) || '{}');
            delete history[panelId];
            localStorage.setItem(CAI_CONFIG.STORAGE_KEY, JSON.stringify(history));
        } catch (_) {
            
        }
    }

export function CAI_saveMessageToHistory(panelId, sender, message, isUser) {
        const history = CAI_loadChatHistory(panelId);
        history.push({ sender: sender, message: message, time: CAI_getTimestamp(), isUser: isUser });
        CAI_saveChatHistory(panelId, history);
    }

export function CAI_searchChat(panelId, query) {
        const container = document.getElementById(panelId);
        if (!container) {
            return [];
        }
        const messages = container.querySelectorAll('.message-wrapper');
        const results = [];
        messages.forEach(function(msg) {
            const body = msg.querySelector('.message-body')?.textContent || '';
            if (body.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    element: msg,
                    text: body,
                    sender: msg.querySelector('.message-sender')?.textContent || 'Unknown',
                    time: msg.querySelector('.message-time')?.textContent || ''
                });
                msg.style.background = 'rgba(0,255,163,0.1)';
                msg.style.borderLeft = '3px solid #00FFA3';
                setTimeout(function() {
                    msg.style.background = '';
                    msg.style.borderLeft = '';
                }, 3000);
            }
        });
        return results;
    }

export function CAI_exportChatPDF(panelId, filename) {
        filename = filename || 'chat-history.pdf';
        const container = document.getElementById(panelId);
        if (!container) {
            return;
        }
        const messages = container.querySelectorAll('.message-wrapper');
        if (messages.length === 0) {
            return;
        }
        if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
            CAI_exportChat(panelId, 'txt');
            return;
        }
        try {
            const { jsPDF } = window.jspdf || jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            let y = 20;
            doc.setFontSize(18);
            doc.setTextColor(0, 200, 0);
            doc.text('CHAT HISTORY', pageWidth / 2, y, { align: 'center' });
            y += 10;
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Tanggal: ' + new Date().toLocaleString(), 20, y);
            y += 8;
            doc.text('Total Pesan: ' + messages.length, 20, y);
            y += 12;
            doc.setFontSize(9);
            doc.setTextColor(50);
            messages.forEach(function(msg) {
                const sender = msg.querySelector('.message-sender')?.textContent || 'Unknown';
                const body = msg.querySelector('.message-body')?.textContent || '';
                const time = msg.querySelector('.message-time')?.textContent || '';
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.setFont('helvetica', 'bold');
                doc.text('[' + time + '] ' + sender, 20, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                const lines = doc.splitTextToSize(body, pageWidth - 40);
                doc.text(lines, 20, y);
                y += (lines.length * 5) + 3;
            });
            doc.save(filename);
        } catch (_) {
            CAI_exportChat(panelId, 'txt');
        }
    }


export function CAI_toggleEmojiPicker(inputId) {
        const existingPicker = document.getElementById('emojiPickerContainer');
        if (existingPicker) {
            existingPicker.remove();
            return;
        }
        const input = document.getElementById(inputId);
        if (!input) {
            return;
        }
        const container = document.createElement('div');
        container.id = 'emojiPickerContainer';
        container.style.cssText = 'position:absolute; bottom:50px; left:0; background:#1a1a2e; border:1px solid rgba(0,255,163,0.2); border-radius:12px; padding:8px; display:grid; grid-template-columns:repeat(6,1fr); gap:4px; max-width:200px; z-index:999; box-shadow:0 8px 30px rgba(0,0,0,0.5); animation:fadeIn 0.2s ease;';
        CAI_CONFIG.EMOJIS.forEach(function(emoji) {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.cssText = 'background:transparent; border:none; font-size:20px; cursor:pointer; padding:4px; border-radius:6px; transition:all 0.2s ease;';
            btn.onmouseenter = function() {
                btn.style.background = 'rgba(0,255,163,0.1)';
            };
            btn.onmouseleave = function() {
                btn.style.background = 'transparent';
            };
            btn.onclick = function() {
                input.value += emoji;
                input.focus();
                container.remove();
            };
            container.appendChild(btn);
        });
        const rect = input.getBoundingClientRect();
        container.style.position = 'fixed';
        container.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        container.style.left = (rect.left) + 'px';
        document.body.appendChild(container);
        setTimeout(function() {
            document.addEventListener('click', function closePicker(e) {
                if (!container.contains(e.target) && e.target.id !== 'emojiBtn') {
                    container.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }

export function CAI_initTypingSound() {
        try {
            CAI_State.typingSoundContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (_) {
            
        }
    }

export function CAI_playTypingSound() {
        if (!CAI_State.typingSoundEnabled || !CAI_State.typingSoundContext) {
            return;
        }
        try {
            const oscillator = CAI_State.typingSoundContext.createOscillator();
            const gainNode = CAI_State.typingSoundContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(CAI_State.typingSoundContext.destination);
            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.03;
            oscillator.start();
            oscillator.stop(CAI_State.typingSoundContext.currentTime + 0.05);
        } catch (_) {
            
        }
    }

export function CAI_toggleTypingSound() {
        CAI_State.typingSoundEnabled = !CAI_State.typingSoundEnabled;
        localStorage.setItem('kes_typing_sound', CAI_State.typingSoundEnabled);
    }

export function CAI_toggleTheme() {
        CAI_State.darkMode = !CAI_State.darkMode;
        const root = document.documentElement;
        const chatContainer = document.getElementById('interactivePage');
        if (CAI_State.darkMode) {
            root.style.setProperty('--chat-bg', '#0a0a1a');
            root.style.setProperty('--chat-text', '#ffffff');
            root.style.setProperty('--chat-border', 'rgba(0,255,163,0.1)');
            root.style.setProperty('--chat-input-bg', 'rgba(255,255,255,0.03)');
            root.style.setProperty('--chat-msg-bg', 'rgba(0,0,0,0.2)');
            if (chatContainer) {
                chatContainer.style.background = '';
                chatContainer.style.color = '';
            }
        } else {
            root.style.setProperty('--chat-bg', '#f0f4f8');
            root.style.setProperty('--chat-text', '#1a1a2e');
            root.style.setProperty('--chat-border', 'rgba(0,0,0,0.1)');
            root.style.setProperty('--chat-input-bg', 'rgba(0,0,0,0.03)');
            root.style.setProperty('--chat-msg-bg', 'rgba(0,0,0,0.05)');
            if (chatContainer) {
                chatContainer.style.background = '#f0f4f8';
                chatContainer.style.color = '#1a1a2e';
            }
        }
        localStorage.setItem(CAI_CONFIG.THEME_KEY, CAI_State.darkMode ? 'dark' : 'light');
        CAI_updateThemeUI();
    }

export function CAI_updateThemeUI() {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.textContent = CAI_State.darkMode ? 'Gelap' : 'Terang';
            btn.title = CAI_State.darkMode ? 'Switch to Light' : 'Switch to Dark';
        }
    }

export function CAI_loadTheme() {
        const saved = localStorage.getItem(CAI_CONFIG.THEME_KEY);
        if (saved === 'light') {
            CAI_State.darkMode = false;
            CAI_toggleTheme();
        }
        CAI_updateThemeUI();
    }


export function CAI_renderMarkdown(text) {
        let html = CAI_escapeHtml(text);
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

export function CAI_exportChat(panelId) {
        const container = document.getElementById(panelId);
        if (!container) {
            return;
        }
        const messages = container.querySelectorAll('.message-wrapper');
        if (messages.length === 0) {
            return;
        }
        let content = '========================================\n        CHAT HISTORY\n========================================\n\n';
        messages.forEach(function(msg) {
            const sender = msg.querySelector('.message-sender')?.textContent || 'Unknown';
            const body = msg.querySelector('.message-body')?.textContent || '';
            const time = msg.querySelector('.message-time')?.textContent || '';
            content += '[' + time + '] ' + sender + ': ' + body + '\n';
        });
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat_' + Date.now() + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    }

export function CAI_escapeHtml(text) {
        if (!text) {
            return '';
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

export function CAI_getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

export function CAI_humanizeAgentName(agent) {
        if (!agent || typeof agent !== 'string') {
            return '';
        }
        return agent
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .trim();
    }

export function CAI_getAgentProfile(agent) {
        if (window.getAgentConfig) {
            const cfg = window.getAgentConfig(agent);
            if (cfg) {
                return {
                    name: cfg.name || cfg.displayName || CAI_humanizeAgentName(agent),
                    role: cfg.role || cfg.expertise || cfg.description || '',
                    emoji: cfg.emoji || cfg.icon || ''
                };
            }
        }
        return { name: CAI_humanizeAgentName(agent), role: '', emoji: '' };
    }

export function CAI_getAgentDisplayName(agent) {
        const profile = CAI_getAgentProfile(agent);
        return (profile.emoji ? profile.emoji + ' ' : '') + profile.name;
    }

export function CAI_getApiKey() {
        const input = document.getElementById('apiKeyInput');
        if (input?.value?.length > 10) {
            return input.value.trim();
        }
        if (window.CONFIG?.API_KEYS?.openrouter) {
            return window.CONFIG.API_KEYS.openrouter;
        }
        return null;
    }


export function CAI_addReaction(messageWrapper, emoji) {
        const existing = messageWrapper.querySelector('.reaction-bar');
        if (existing) {
            const btn = existing.querySelector('[data-reaction="' + emoji + '"]');
            if (btn) {
                const count = parseInt(btn.dataset.count || 0) + 1;
                btn.dataset.count = count;
                btn.textContent = emoji + ' ' + count;
            } else {
                const newBtn = document.createElement('button');
                newBtn.dataset.reaction = emoji;
                newBtn.dataset.count = 1;
                newBtn.textContent = emoji + ' 1';
                newBtn.style.cssText = 'background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:12px; padding:2px 8px; color:#fff; font-size:11px; cursor:pointer; transition:all 0.2s ease;';
                newBtn.onclick = function(e) {
                    e.stopPropagation();
                    CAI_addReaction(messageWrapper, emoji);
                };
                existing.appendChild(newBtn);
            }
        } else {
            const reactionBar = document.createElement('div');
            reactionBar.className = 'reaction-bar';
            reactionBar.style.cssText = 'display:flex; gap:4px; margin-top:4px; flex-wrap:wrap;';
            const btn = document.createElement('button');
            btn.dataset.reaction = emoji;
            btn.dataset.count = 1;
            btn.textContent = emoji + ' 1';
            btn.style.cssText = 'background:rgba(0,255,163,0.05); border:1px solid rgba(0,255,163,0.1); border-radius:12px; padding:2px 8px; color:#fff; font-size:11px; cursor:pointer; transition:all 0.2s ease;';
            btn.onclick = function(e) {
                e.stopPropagation();
                CAI_addReaction(messageWrapper, emoji);
            };
            reactionBar.appendChild(btn);
            const body = messageWrapper.querySelector('.message-body');
            if (body) {
                body.after(reactionBar);
            } else {
                messageWrapper.appendChild(reactionBar);
            }
        }
    }

export function CAI_showReactionPicker(messageWrapper) {
        const existing = document.getElementById('reactionPicker');
        if (existing) {
            existing.remove();
        }
        const picker = document.createElement('div');
        picker.id = 'reactionPicker';
        picker.style.cssText = 'position:absolute; background:#1a1a2e; border:1px solid rgba(0,255,163,0.2); border-radius:12px; padding:8px; display:flex; gap:4px; z-index:999; box-shadow:0 8px 30px rgba(0,0,0,0.5); animation:fadeIn 0.2s ease;';
        CAI_CONFIG.REACTIONS.forEach(function(emoji) {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.cssText = 'background:transparent; border:none; font-size:20px; cursor:pointer; padding:4px 8px; border-radius:6px; transition:all 0.2s ease;';
            btn.onmouseenter = function() {
                btn.style.background = 'rgba(0,255,163,0.1)';
            };
            btn.onmouseleave = function() {
                btn.style.background = 'transparent';
            };
            btn.onclick = function(e) {
                e.stopPropagation();
                CAI_addReaction(messageWrapper, emoji);
                picker.remove();
            };
            picker.appendChild(btn);
        });
        const rect = messageWrapper.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = (rect.top - 50) + 'px';
        picker.style.left = (rect.left + 20) + 'px';
        document.body.appendChild(picker);
        setTimeout(function() {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }

export function CAI_editMessage(messageWrapper) {
        const body = messageWrapper.querySelector('.message-body');
        const currentText = body.textContent;
        const picker = document.getElementById('reactionPicker');
        if (picker) {
            picker.remove();
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.style.cssText = 'width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(0,255,163,0.2); border-radius:8px; color:#fff; padding:6px 10px; font-size:13px; outline:none;';
        body.innerHTML = '';
        body.appendChild(input);
        input.focus();
        input.select();
        input.onkeypress = function(e) {
            if (e.key === 'Enter') {
                const newText = input.value.trim();
                if (newText) {
                    body.textContent = newText;
                    const container = messageWrapper.closest('.chat-messages-premium');
                    if (container) {
                        const panelId = container.id;
                        const history = CAI_loadChatHistory(panelId);
                        const messages = container.querySelectorAll('.message-wrapper');
                        const index = Array.from(messages).indexOf(messageWrapper);
                        if (history[index]) {
                            history[index].message = newText;
                            CAI_saveChatHistory(panelId, history);
                        }
                    }
                } else {
                    body.textContent = currentText;
                }
            }
        };
        input.onkeydown = function(e) {
            if (e.key === 'Escape') {
                body.textContent = currentText;
            }
        };
    }

export function CAI_deleteMessage(messageWrapper) {
        const container = messageWrapper.closest('.chat-messages-premium');
        if (container) {
            const panelId = container.id;
            const history = CAI_loadChatHistory(panelId);
            const messages = container.querySelectorAll('.message-wrapper');
            const index = Array.from(messages).indexOf(messageWrapper);
            if (index !== -1 && history[index]) {
                history.splice(index, 1);
                CAI_saveChatHistory(panelId, history);
            }
        }
        messageWrapper.remove();
    }

export function CAI_getAgentAvatar(agent) {
        const profile = CAI_getAgentProfile(agent);
        return profile.emoji || '';
    }


export function CAI_cancelAIRequest() {
        if (CAI_State.currentAbortController) {
            CAI_State.currentAbortController.abort();
            CAI_State.currentAbortController = null;
        }
    }

export function CAI_addStreamingMessage(container, sender) {
        const time = CAI_getTimestamp();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.id = 'streaming-wrapper-' + Date.now();
        wrapper.style.animation = 'messageSlideIn 0.3s ease';
        const isAI = sender === 'AI' || sender === 'AI';
        const bubble = document.createElement('div');
        bubble.className = isAI ? 'ai-message-modern' : 'agent-message-modern';
        const avatar = isAI ? '' : CAI_getAgentAvatar(sender);
        bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + avatar + ' ' + CAI_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span></div><div class="message-body"><span class="streaming-text"></span><span class="cursor-blink">█</span></div>';
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        return {
            wrapper: wrapper,
            textSpan: wrapper.querySelector('.streaming-text'),
            cursorSpan: wrapper.querySelector('.cursor-blink')
        };
    }

export function CAI_finishStreamingMessage(wrapper, cursorSpan, textSpan, rawText) {
        if (cursorSpan) {
            cursorSpan.remove();
        }
        if (textSpan && rawText !== undefined && rawText !== null) {
            textSpan.innerHTML = CAI_renderMarkdown(rawText);
        }
    }

export async function CAI_streamTextToElement(textSpan, text, speed) {
        speed = speed || 15;
        for (let i = 0; i < text.length; i++) {
            textSpan.textContent += text[i];
            await new Promise(function(r) {
                setTimeout(r, speed);
            });
        }
    }

export function CAI_showTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator-modern';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        return typingDiv;
    }

export function CAI_addMessage(container, sender, message, isUser) {
        if (!container) {
            return;
        }
        const time = CAI_getTimestamp();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.style.animation = 'messageSlideIn 0.4s ease';
        wrapper.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            if (wrapper.id && wrapper.id.startsWith('streaming-wrapper-')) {
                return;
            }
            const existing = document.getElementById('contextMenu');
            if (existing) {
                existing.remove();
            }
            const menu = document.createElement('div');
            menu.id = 'contextMenu';
            menu.style.cssText = 'position:fixed; background:#1a1a2e; border:1px solid rgba(0,255,163,0.2); border-radius:12px; padding:6px; z-index:9999; box-shadow:0 8px 30px rgba(0,0,0,0.5); min-width:150px; animation:fadeIn 0.2s ease;';
            menu.style.top = e.clientY + 'px';
            menu.style.left = e.clientX + 'px';
            const items = [
                { text: 'Reaksi', action: function() { CAI_showReactionPicker(wrapper); } },
                { text: 'Edit', action: function() { CAI_editMessage(wrapper); } },
                { text: 'Delete', action: function() { CAI_deleteMessage(wrapper); } },
                { text: 'Copy', action: function() {
                    const text = wrapper.querySelector('.message-body')?.textContent || '';
                    navigator.clipboard.writeText(text);
                } }
            ];
            items.forEach(function(item) {
                const btn = document.createElement('button');
                btn.textContent = item.text;
                btn.style.cssText = 'display:block; width:100%; padding:6px 12px; background:transparent; border:none; color:#fff; font-size:12px; text-align:left; cursor:pointer; border-radius:6px; transition:all 0.2s ease;';
                btn.onmouseenter = function() {
                    btn.style.background = 'rgba(0,255,163,0.05)';
                };
                btn.onmouseleave = function() {
                    btn.style.background = 'transparent';
                };
                btn.onclick = function(e) {
                    e.stopPropagation();
                    item.action();
                    menu.remove();
                };
                menu.appendChild(btn);
            });
            document.body.appendChild(menu);
            setTimeout(function() {
                document.addEventListener('click', function closeMenu(e) {
                    if (!menu.contains(e.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                });
            }, 100);
        });
        const bubble = document.createElement('div');
        if (isUser) {
            bubble.className = 'user-message-modern';
            bubble.innerHTML = '<div class="message-header"><span class="message-sender">Anda</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + CAI_renderMarkdown(message) + '</div>';
        } else {
            const isAI = sender === 'AI' || sender === 'AI';
            bubble.className = isAI ? 'ai-message-modern' : 'agent-message-modern';
            const avatar = isAI ? '' : CAI_getAgentAvatar(sender);
            bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + avatar + ' ' + CAI_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + CAI_renderMarkdown(message) + '</div>';
        }
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        const panelId = container.id;
        const history = CAI_loadChatHistory(panelId);
        history.push({ sender: sender, message: message, time: time, isUser: isUser });
        CAI_saveChatHistory(panelId, history);
    }

export function CAI_addFeedbackButtons(messageWrapper) {
        const existing = messageWrapper.querySelector('.feedback-buttons');
        if (existing) {
            return;
        }
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-buttons';
        feedbackDiv.style.cssText = 'display:flex; gap:6px; margin-top:6px; opacity:0.5; transition:opacity 0.3s ease;';
        const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
        messageWrapper.dataset.messageId = messageId;
        const ratings = [
            { value: 5, label: 'Bagus!' },
            { value: 4, label: 'Oke' },
            { value: 3, label: 'Biasa' },
            { value: 1, label: 'Kurang' }
        ];
        ratings.forEach(function(r) {
            const btn = document.createElement('button');
            btn.textContent = r.label;
            btn.title = r.label;
            btn.style.cssText = 'background:transparent; border:none; font-size:11px; cursor:pointer; padding:2px 6px; border-radius:4px; transition:all 0.2s ease;';
            btn.onmouseenter = function() {
                btn.style.background = 'rgba(255,255,255,0.05)';
            };
            btn.onmouseleave = function() {
                btn.style.background = 'transparent';
            };
            btn.onclick = function() {
                CAI_handleFeedback(messageId, r.value);
                feedbackDiv.querySelectorAll('button').forEach(function(b) {
                    b.style.opacity = '0.3';
                    b.style.transform = 'scale(0.9)';
                });
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.2)';
                btn.style.color = '#00FFA3';
                setTimeout(function() {
                    feedbackDiv.style.opacity = '0.3';
                }, 2000);
            };
            feedbackDiv.appendChild(btn);
        });
        const ratingText = document.createElement('span');
        ratingText.textContent = 'Rating:';
        ratingText.style.cssText = 'font-size:10px; color:rgba(255,255,255,0.3); margin-right:4px; display:flex; align-items:center;';
        feedbackDiv.prepend(ratingText);
        const bodyEl = messageWrapper.querySelector('.message-body');
        if (bodyEl) {
            bodyEl.after(feedbackDiv);
        } else {
            messageWrapper.appendChild(feedbackDiv);
        }
        messageWrapper.addEventListener('mouseenter', function() {
            feedbackDiv.style.opacity = '1';
        });
        messageWrapper.addEventListener('mouseleave', function() {
            feedbackDiv.style.opacity = '0.5';
        });
    }


    const styleId = 'chat-complete-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            :root {
                --chat-bg: #0a0a1a;
                --chat-text: #ffffff;
                --chat-border: rgba(0,255,163,0.1);
                --chat-input-bg: rgba(255,255,255,0.03);
                --chat-msg-bg: rgba(0,0,0,0.2);
            }
            
            .chat-header-premium {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 20px;
                background: linear-gradient(135deg, rgba(0,255,163,0.08), rgba(0,0,0,0.3));
                border-radius: 14px 14px 0 0;
                border-bottom: 1px solid var(--chat-border);
                margin-bottom: 0;
                flex-wrap: wrap;
                gap: 8px;
                flex-shrink: 0;
            }
            .chat-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .chat-header-icon {
                font-size: 28px;
                animation: chatPulse 2s ease-in-out infinite;
            }
            @keyframes chatPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
            .chat-header-title {
                font-size: 18px;
                font-weight: 700;
                background: linear-gradient(135deg, #00FFA3, #00D4FF);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin: 0;
            }
            .chat-header-sub {
                font-size: 10px;
                color: rgba(255,255,255,0.3);
                margin: 0;
                letter-spacing: 0.5px;
            }
            .chat-header-right {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }
            .chat-header-btn {
                width: 30px;
                height: 30px;
                border-radius: 8px;
                border: 1px solid var(--chat-border);
                background: var(--chat-input-bg);
                color: rgba(255,255,255,0.5);
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .chat-header-btn:hover {
                background: rgba(0,255,163,0.1);
                color: #fff;
                transform: scale(1.05);
            }
            
            .chat-messages-premium {
                height: 300px;
                overflow-y: auto;
                padding: 16px 18px;
                background: var(--chat-msg-bg);
                border-radius: 0 0 12px 12px;
                scroll-behavior: smooth;
            }
            .chat-messages-premium::-webkit-scrollbar { width: 4px; }
            .chat-messages-premium::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
            .chat-messages-premium::-webkit-scrollbar-thumb { background: rgba(0,255,163,0.2); border-radius: 4px; }
            
            .message-wrapper { margin-bottom: 12px; }
            @keyframes messageSlideIn { from{opacity:0;transform:translateY(15px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
            .user-message-modern {
                background: linear-gradient(135deg, #00FFA3, #00AA6E);
                color: #03050A;
                padding: 10px 16px;
                border-radius: 18px 18px 4px 18px;
                max-width: 80%;
                margin-left: auto;
                box-shadow: 0 4px 20px rgba(0,255,163,0.15);
            }
            .ai-message-modern {
                background: rgba(255,255,255,0.04);
                border: 1px solid var(--chat-border);
                padding: 10px 16px;
                border-radius: 18px 18px 18px 4px;
                max-width: 85%;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                backdrop-filter: blur(10px);
            }
            .agent-message-modern {
                background: linear-gradient(135deg, rgba(155,89,182,0.08), rgba(142,68,173,0.03));
                border-left: 3px solid #9B59B6;
                padding: 10px 16px;
                border-radius: 4px 18px 18px 4px;
                max-width: 85%;
            }
            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
                gap: 8px;
                flex-wrap: wrap;
            }
            .message-sender { font-weight: 600; font-size: 12px; opacity: 0.8; }
            .message-time { font-size: 9px; opacity: 0.3; }
            .message-body { font-size: 13px; line-height: 1.6; word-break: break-word; }
            .copy-btn { opacity: 0; transition: opacity 0.3s ease; background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 11px; padding: 0 4px; }
            .message-wrapper:hover .copy-btn { opacity: 1; }
            
            .feedback-buttons { opacity: 0.5; transition: opacity 0.3s ease; }
            .feedback-buttons button { background: transparent; border: none; font-size: 16px; cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.2s ease; color: rgba(255,255,255,0.5); }
            .feedback-buttons button:hover { background: rgba(255,255,255,0.05); color: #fff; }
            .reaction-bar { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
            
            .typing-indicator-modern { display: flex; gap: 5px; padding: 8px 14px; margin: 4px 0; }
            .typing-dot { width: 7px; height: 7px; background: rgba(0,255,163,0.4); border-radius: 50%; animation: typingDot 1.2s ease-in-out infinite; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.3} 30%{transform:translateY(-8px);opacity:1} }
            
            .input-wrapper-premium {
                display: flex;
                gap: 4px;
                background: var(--chat-input-bg);
                border-radius: 14px;
                padding: 4px;
                border: 1px solid var(--chat-border);
                transition: all 0.3s ease;
                margin-top: 8px;
            }
            .input-wrapper-premium:focus-within {
                border-color: rgba(0,255,163,0.2);
                box-shadow: 0 0 30px rgba(0,255,163,0.05);
            }
            .input-field-modern {
                flex: 1;
                padding: 10px 14px;
                background: transparent;
                border: none;
                color: var(--chat-text);
                font-size: 13px;
                outline: none;
                min-width: 60px;
            }
            .input-field-modern::placeholder { color: rgba(255,255,255,0.2); font-size: 12px; }
            
            .voice-btn-premium {
                width: 36px;
                height: 42px;
                border-radius: 10px;
                border: none;
                background: transparent;
                color: rgba(255,255,255,0.4);
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .voice-btn-premium:hover { background: rgba(255,255,255,0.05); color: #fff; }
            .voice-btn-premium.listening {
                background: rgba(255,107,107,0.2);
                color: #FF6B6B;
                animation: pulse 1s infinite;
            }
            
            .send-btn-premium {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #00FFA3, #00AA6E);
                color: #03050A;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .send-btn-premium:hover { transform: scale(1.06); box-shadow: 0 4px 25px rgba(0,255,163,0.3); }
            .send-btn-premium:active { transform: scale(0.94); }
            
            .stop-btn-premium {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                border: none;
                background: linear-gradient(135deg, #FF6B6B, #EE5A24);
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .stop-btn-premium:hover { transform: scale(1.06); box-shadow: 0 4px 25px rgba(255,107,107,0.3); }
            
            #preferencesPanel { animation: fadeIn 0.3s ease; }
            
            @media (max-width: 768px) {
                .chat-header-premium { flex-direction: column; align-items: flex-start; gap: 8px; padding: 10px 14px; }
                .chat-header-right { width: 100%; justify-content: flex-start; gap: 4px; }
                .chat-messages-premium { height: 200px; padding: 12px; }
                .chat-header-title { font-size: 15px; }
                .chat-header-icon { font-size: 22px; }
                .user-message-modern, .ai-message-modern, .agent-message-modern { max-width: 95%; }
                .voice-btn-premium { width: 32px; height: 36px; font-size: 14px; }
                .send-btn-premium, .stop-btn-premium { width: 36px; height: 36px; font-size: 16px; }
                .chat-header-btn { width: 28px; height: 28px; font-size: 12px; }
                #preferencesPanel { max-width: 95%; padding: 16px; }
                #interactivePage { padding: 0 8px !important; }
                .chat-messages-premium, #chatAiMessages, #chatAgentMessages, #interactiveForumMessages {
                    height: 350px !important;
                    max-height: 60vh !important;
                    min-height: 200px !important;
                }
                .input-wrapper-premium input { font-size: 14px !important; padding: 10px 12px !important; }
            }
            @media (max-width: 480px) {
                .chat-header-title { font-size: 13px; }
                .chat-header-sub { font-size: 8px; }
                .input-field-modern { font-size: 12px; padding: 8px 12px; }
                .send-btn-premium, .stop-btn-premium { width: 32px; height: 32px; font-size: 14px; }
                .voice-btn-premium { width: 28px; height: 32px; font-size: 12px; }
                .chat-messages-premium, #chatAiMessages, #chatAgentMessages, #interactiveForumMessages {
                    height: 250px !important;
                    max-height: 50vh !important;
                    min-height: 150px !important;
                }
                .input-wrapper-premium input { font-size: 12px !important; padding: 8px 10px !important; }
            }
            
            @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
            @keyframes fadeIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
            
            #interactivePage {
                max-width: 1400px !important;
                margin: 0 auto !important;
                padding: 0 10px !important;
            }
            #interactivePage .chat-panel,
            #interactivePage #interactiveChatAiPanel,
            #interactivePage #interactiveChatAgentPanel,
            #interactivePage #interactiveForumPanel {
                width: 100% !important;
                max-width: 100% !important;
                min-height: 400px !important;
            }
            #interactivePage .chat-messages-premium,
            #interactivePage #chatAiMessages,
            #interactivePage #chatAgentMessages,
            #interactivePage #interactiveForumMessages {
                height: 500px !important;
                max-height: 70vh !important;
                min-height: 300px !important;
                overflow-y: auto !important;
            }
            #interactivePage .input-wrapper-premium,
            #interactivePage .input-wrapper {
                max-width: 100% !important;
                width: 100% !important;
            }
            #interactivePage .input-wrapper-premium input,
            #interactivePage .input-wrapper input,
            #interactivePage #chatAiInput,
            #interactivePage #chatAgentInput,
            #interactivePage #forumInput {
                font-size: 16px !important;
                padding: 14px 18px !important;
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }

    

/* ============================================================
   interactive/forum/for-ui-render.js
   TAMPILAN FORUM — suara, riwayat, tema, emoji, reaksi, streaming,
   render pesan forum.
   ============================================================ */
import { FOR_CONFIG } from './for-config.js';
import { FOR_State } from './for-state.js';
import { FOR_getAgentAvatar } from './for-data-engine.js';

// ---------- SUARA (STT) ----------
export function FOR_startVoiceInput(inputId) {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            return;
        }
        if (FOR_State.isListening) {
            if (FOR_State.recognition) {
                FOR_State.recognition.stop();
            }
            FOR_State.isListening = false;
            return;
        }
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        FOR_State.recognition = new SpeechRecognition();
        FOR_State.recognition.lang = FOR_State.languagePreference === 'en' ? 'en-US' : 'id-ID';
        FOR_State.recognition.continuous = false;
        FOR_State.recognition.interimResults = true;
        FOR_State.recognition.onstart = function() {
            FOR_State.isListening = true;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Merekam...';
                btn.style.background = 'rgba(255,107,107,0.2)';
                btn.style.borderColor = '#FF6B6B';
            }
        };
        FOR_State.recognition.onresult = function(e) {
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
        FOR_State.recognition.onend = function() {
            FOR_State.isListening = false;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Rekam';
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        };
        FOR_State.recognition.onerror = function() {
            FOR_State.isListening = false;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Rekam';
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        };
        FOR_State.recognition.start();
    }

// ---------- HISTORY (localStorage) ----------
export function FOR_saveChatHistory(panelId, messages) {
        try {
            const history = JSON.parse(localStorage.getItem(FOR_CONFIG.STORAGE_KEY) || '{}');
            history[panelId] = messages.slice(-FOR_CONFIG.MAX_HISTORY);
            localStorage.setItem(FOR_CONFIG.STORAGE_KEY, JSON.stringify(history));
        } catch (_) {
            // Silent fail
        }
    }

export function FOR_loadChatHistory(panelId) {
        try {
            const history = JSON.parse(localStorage.getItem(FOR_CONFIG.STORAGE_KEY) || '{}');
            return history[panelId] || [];
        } catch (_) {
            return [];
        }
    }

export function FOR_clearChatHistory(panelId) {
        try {
            const history = JSON.parse(localStorage.getItem(FOR_CONFIG.STORAGE_KEY) || '{}');
            delete history[panelId];
            localStorage.setItem(FOR_CONFIG.STORAGE_KEY, JSON.stringify(history));
        } catch (_) {
            // Silent fail
        }
    }

export function FOR_saveMessageToHistory(panelId, sender, message, isUser) {
        const history = FOR_loadChatHistory(panelId);
        history.push({ sender: sender, message: message, time: FOR_getTimestamp(), isUser: isUser });
        FOR_saveChatHistory(panelId, history);
    }

// ---------- EMOJI, TYPING SOUND, TEMA ----------
export function FOR_toggleEmojiPicker(inputId) {
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
        FOR_CONFIG.EMOJIS.forEach(function(emoji) {
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

export function FOR_initTypingSound() {
        try {
            FOR_State.typingSoundContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (_) {
            // Silent fail
        }
    }

export function FOR_playTypingSound() {
        if (!FOR_State.typingSoundEnabled || !FOR_State.typingSoundContext) {
            return;
        }
        try {
            const oscillator = FOR_State.typingSoundContext.createOscillator();
            const gainNode = FOR_State.typingSoundContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(FOR_State.typingSoundContext.destination);
            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.03;
            oscillator.start();
            oscillator.stop(FOR_State.typingSoundContext.currentTime + 0.05);
        } catch (_) {
            // Silent fail
        }
    }

export function FOR_toggleTypingSound() {
        FOR_State.typingSoundEnabled = !FOR_State.typingSoundEnabled;
        localStorage.setItem('kes_typing_sound', FOR_State.typingSoundEnabled);
    }

export function FOR_toggleTheme() {
        FOR_State.darkMode = !FOR_State.darkMode;
        const root = document.documentElement;
        const chatContainer = document.getElementById('interactivePage');
        if (FOR_State.darkMode) {
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
        localStorage.setItem(FOR_CONFIG.THEME_KEY, FOR_State.darkMode ? 'dark' : 'light');
        FOR_updateThemeUI();
    }

export function FOR_updateThemeUI() {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.textContent = FOR_State.darkMode ? 'Gelap' : 'Terang';
            btn.title = FOR_State.darkMode ? 'Switch to Light' : 'Switch to Dark';
        }
    }

export function FOR_loadTheme() {
        const saved = localStorage.getItem(FOR_CONFIG.THEME_KEY);
        if (saved === 'light') {
            FOR_State.darkMode = false;
            FOR_toggleTheme();
        }
        FOR_updateThemeUI();
    }

// ---------- UTIL TAMPILAN ----------
export function FOR_renderMarkdown(text) {
        let html = FOR_escapeHtml(text);
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

export function FOR_escapeHtml(text) {
        if (!text) {
            return '';
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

export function FOR_getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

export function FOR_getApiKey() {
        const input = document.getElementById('apiKeyInput');
        if (input?.value?.length > 10) {
            return input.value.trim();
        }
        if (window.CONFIG?.API_KEYS?.openrouter) {
            return window.CONFIG.API_KEYS.openrouter;
        }
        return null;
    }

// ---------- REAKSI & EDIT PESAN ----------
export function FOR_addReaction(messageWrapper, emoji) {
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
                    FOR_addReaction(messageWrapper, emoji);
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
                FOR_addReaction(messageWrapper, emoji);
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

export function FOR_showReactionPicker(messageWrapper) {
        const existing = document.getElementById('reactionPicker');
        if (existing) {
            existing.remove();
        }
        const picker = document.createElement('div');
        picker.id = 'reactionPicker';
        picker.style.cssText = 'position:absolute; background:#1a1a2e; border:1px solid rgba(0,255,163,0.2); border-radius:12px; padding:8px; display:flex; gap:4px; z-index:999; box-shadow:0 8px 30px rgba(0,0,0,0.5); animation:fadeIn 0.2s ease;';
        FOR_CONFIG.REACTIONS.forEach(function(emoji) {
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
                FOR_addReaction(messageWrapper, emoji);
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

export function FOR_editMessage(messageWrapper) {
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
                        const history = FOR_loadChatHistory(panelId);
                        const messages = container.querySelectorAll('.message-wrapper');
                        const index = Array.from(messages).indexOf(messageWrapper);
                        if (history[index]) {
                            history[index].message = newText;
                            FOR_saveChatHistory(panelId, history);
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

export function FOR_deleteMessage(messageWrapper) {
        const container = messageWrapper.closest('.chat-messages-premium');
        if (container) {
            const panelId = container.id;
            const history = FOR_loadChatHistory(panelId);
            const messages = container.querySelectorAll('.message-wrapper');
            const index = Array.from(messages).indexOf(messageWrapper);
            if (index !== -1 && history[index]) {
                history.splice(index, 1);
                FOR_saveChatHistory(panelId, history);
            }
        }
        messageWrapper.remove();
    }

// ---------- RENDER PESAN & STREAMING ----------
export function FOR_addStreamingMessage(container, sender) {
        const time = FOR_getTimestamp();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.id = 'streaming-wrapper-' + Date.now();
        wrapper.style.animation = 'messageSlideIn 0.3s ease';
        const isAI = sender === 'AI' || sender === 'AI';
        const bubble = document.createElement('div');
        bubble.className = isAI ? 'ai-message-modern' : 'agent-message-modern';
        const avatar = isAI ? '' : FOR_getAgentAvatar(sender);
        bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + avatar + ' ' + FOR_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span></div><div class="message-body"><span class="streaming-text"></span><span class="cursor-blink">█</span></div>';
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        return {
            wrapper: wrapper,
            textSpan: wrapper.querySelector('.streaming-text'),
            cursorSpan: wrapper.querySelector('.cursor-blink')
        };
    }

export function FOR_finishStreamingMessage(wrapper, cursorSpan) {
        if (cursorSpan) {
            cursorSpan.remove();
        }
    }

export async function FOR_streamTextToElement(textSpan, text, speed) {
        speed = speed || 15;
        for (let i = 0; i < text.length; i++) {
            textSpan.textContent += text[i];
            await new Promise(function(r) {
                setTimeout(r, speed);
            });
        }
    }

export function FOR_showTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator-modern';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        return typingDiv;
    }

export function FOR_addMessage(container, sender, message, isUser) {
        if (!container) {
            return;
        }
        const time = FOR_getTimestamp();
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
                { text: 'Reaksi', action: function() { FOR_showReactionPicker(wrapper); } },
                { text: 'Edit', action: function() { FOR_editMessage(wrapper); } },
                { text: 'Delete', action: function() { FOR_deleteMessage(wrapper); } },
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
            bubble.innerHTML = '<div class="message-header"><span class="message-sender">Anda</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + FOR_renderMarkdown(message) + '</div>';
        } else {
            const isAI = sender === 'AI' || sender === 'AI';
            bubble.className = isAI ? 'ai-message-modern' : 'agent-message-modern';
            const avatar = isAI ? '' : FOR_getAgentAvatar(sender);
            bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + avatar + ' ' + FOR_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + FOR_renderMarkdown(message) + '</div>';
        }
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        const panelId = container.id;
        const history = FOR_loadChatHistory(panelId);
        history.push({ sender: sender, message: message, time: time, isUser: isUser });
        FOR_saveChatHistory(panelId, history);
    }

export function FOR_addForumMessage(sender, message, isUser) {
        const container = document.getElementById('interactiveForumMessages');
        if (!container) {
            return;
        }
        const time = FOR_getTimestamp();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.style.animation = 'messageSlideIn 0.4s ease';
        const bubble = document.createElement('div');
        bubble.className = isUser ? 'user-message-modern' : (sender === 'Sistem' || sender === 'Forum') ? 'ai-message-modern' : 'agent-message-modern';
        bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + FOR_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + FOR_renderMarkdown(message) + '</div>';
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        FOR_saveMessageToHistory(container.id, sender, message, isUser);
    }

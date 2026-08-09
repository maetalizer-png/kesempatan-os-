/* ============================================================
   interactive/chat-agent/cag-ui-render.js
   TAMPILAN CHAT AGENT — suara, riwayat, tema, reaksi, streaming.
   ============================================================ */
import { CAG_CONFIG } from './cag-config.js';
import { CAG_State } from './cag-state.js';
// Impor sirkular yang disengaja — lihat catatan di cag-data-engine.js.
import { CAG_getAgentAvatar } from './cag-data-engine.js';

// ---------- SUARA (TTS/STT) ----------
// Sama seperti CAI_stripMarkdown — cegah TTS baca tanda markdown secara harfiah.
export function CAG_stripMarkdown(text) {
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

export function CAG_speakText(text) {
        if (!CAG_State.speechEnabled) {
            return;
        }
        if (!text || text.length === 0) {
            return;
        }
        window.speechSynthesis.cancel();
        const cleanText = CAG_stripMarkdown(text).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 600);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = CAG_State.languagePreference === 'en' ? 'en-US' : 'id-ID';
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
        CAG_State.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

export function CAG_startVoiceInput(inputId) {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            return;
        }
        if (CAG_State.isListening) {
            if (CAG_State.recognition) {
                CAG_State.recognition.stop();
            }
            CAG_State.isListening = false;
            return;
        }
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        CAG_State.recognition = new SpeechRecognition();
        CAG_State.recognition.lang = CAG_State.languagePreference === 'en' ? 'en-US' : 'id-ID';
        CAG_State.recognition.continuous = false;
        CAG_State.recognition.interimResults = true;
        CAG_State.recognition.onstart = function() {
            CAG_State.isListening = true;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Merekam...';
                btn.style.background = 'rgba(255,107,107,0.2)';
                btn.style.borderColor = '#FF6B6B';
            }
        };
        CAG_State.recognition.onresult = function(e) {
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
        CAG_State.recognition.onend = function() {
            CAG_State.isListening = false;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Rekam';
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        };
        CAG_State.recognition.onerror = function() {
            CAG_State.isListening = false;
            const btn = document.querySelector('[data-voice-for="' + inputId + '"]');
            if (btn) {
                btn.textContent = 'Rekam';
                btn.style.background = '';
                btn.style.borderColor = '';
            }
        };
        CAG_State.recognition.start();
    }

// ---------- HISTORY (localStorage) ----------
export function CAG_saveChatHistory(panelId, messages) {
        try {
            const history = JSON.parse(localStorage.getItem(CAG_CONFIG.STORAGE_KEY) || '{}');
            history[panelId] = messages.slice(-CAG_CONFIG.MAX_HISTORY);
            localStorage.setItem(CAG_CONFIG.STORAGE_KEY, JSON.stringify(history));
        } catch (_) {
            // Silent fail
        }
    }

export function CAG_loadChatHistory(panelId) {
        try {
            const history = JSON.parse(localStorage.getItem(CAG_CONFIG.STORAGE_KEY) || '{}');
            return history[panelId] || [];
        } catch (_) {
            return [];
        }
    }

export function CAG_clearChatHistory(panelId) {
        try {
            const history = JSON.parse(localStorage.getItem(CAG_CONFIG.STORAGE_KEY) || '{}');
            delete history[panelId];
            localStorage.setItem(CAG_CONFIG.STORAGE_KEY, JSON.stringify(history));
        } catch (_) {
            // Silent fail
        }
    }

export function CAG_saveMessageToHistory(panelId, sender, message, isUser) {
        const history = CAG_loadChatHistory(panelId);
        history.push({ sender: sender, message: message, time: CAG_getTimestamp(), isUser: isUser });
        CAG_saveChatHistory(panelId, history);
    }

export function CAG_searchChat(panelId, query) {
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

export function CAG_exportChatPDF(panelId, filename) {
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
            CAG_exportChat(panelId, 'txt');
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
            CAG_exportChat(panelId, 'txt');
        }
    }

// ---------- EMOJI, TYPING SOUND, TEMA ----------
export function CAG_toggleEmojiPicker(inputId) {
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
        CAG_CONFIG.EMOJIS.forEach(function(emoji) {
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

export function CAG_initTypingSound() {
        try {
            CAG_State.typingSoundContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (_) {
            // Silent fail
        }
    }

export function CAG_playTypingSound() {
        if (!CAG_State.typingSoundEnabled || !CAG_State.typingSoundContext) {
            return;
        }
        try {
            const oscillator = CAG_State.typingSoundContext.createOscillator();
            const gainNode = CAG_State.typingSoundContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(CAG_State.typingSoundContext.destination);
            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.03;
            oscillator.start();
            oscillator.stop(CAG_State.typingSoundContext.currentTime + 0.05);
        } catch (_) {
            // Silent fail
        }
    }

export function CAG_toggleTypingSound() {
        CAG_State.typingSoundEnabled = !CAG_State.typingSoundEnabled;
        localStorage.setItem('kes_typing_sound', CAG_State.typingSoundEnabled);
    }

export function CAG_toggleTheme() {
        CAG_State.darkMode = !CAG_State.darkMode;
        const root = document.documentElement;
        const chatContainer = document.getElementById('interactivePage');
        if (CAG_State.darkMode) {
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
        localStorage.setItem(CAG_CONFIG.THEME_KEY, CAG_State.darkMode ? 'dark' : 'light');
        CAG_updateThemeUI();
    }

export function CAG_updateThemeUI() {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.textContent = CAG_State.darkMode ? 'Gelap' : 'Terang';
            btn.title = CAG_State.darkMode ? 'Switch to Light' : 'Switch to Dark';
        }
    }

export function CAG_loadTheme() {
        const saved = localStorage.getItem(CAG_CONFIG.THEME_KEY);
        if (saved === 'light') {
            CAG_State.darkMode = false;
            CAG_toggleTheme();
        }
        CAG_updateThemeUI();
    }

// ---------- UTIL TAMPILAN ----------
export function CAG_renderMarkdown(text) {
        let html = CAG_escapeHtml(text);
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;font-family:monospace;">$1</code>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

export function CAG_exportChat(panelId) {
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

export function CAG_escapeHtml(text) {
        if (!text) {
            return '';
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

export function CAG_getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

export function CAG_getApiKey() {
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
export function CAG_addReaction(messageWrapper, emoji) {
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
                    CAG_addReaction(messageWrapper, emoji);
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
                CAG_addReaction(messageWrapper, emoji);
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

export function CAG_showReactionPicker(messageWrapper) {
        const existing = document.getElementById('reactionPicker');
        if (existing) {
            existing.remove();
        }
        const picker = document.createElement('div');
        picker.id = 'reactionPicker';
        picker.style.cssText = 'position:absolute; background:#1a1a2e; border:1px solid rgba(0,255,163,0.2); border-radius:12px; padding:8px; display:flex; gap:4px; z-index:999; box-shadow:0 8px 30px rgba(0,0,0,0.5); animation:fadeIn 0.2s ease;';
        CAG_CONFIG.REACTIONS.forEach(function(emoji) {
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
                CAG_addReaction(messageWrapper, emoji);
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

export function CAG_editMessage(messageWrapper) {
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
                        const history = CAG_loadChatHistory(panelId);
                        const messages = container.querySelectorAll('.message-wrapper');
                        const index = Array.from(messages).indexOf(messageWrapper);
                        if (history[index]) {
                            history[index].message = newText;
                            CAG_saveChatHistory(panelId, history);
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

export function CAG_deleteMessage(messageWrapper) {
        const container = messageWrapper.closest('.chat-messages-premium');
        if (container) {
            const panelId = container.id;
            const history = CAG_loadChatHistory(panelId);
            const messages = container.querySelectorAll('.message-wrapper');
            const index = Array.from(messages).indexOf(messageWrapper);
            if (index !== -1 && history[index]) {
                history.splice(index, 1);
                CAG_saveChatHistory(panelId, history);
            }
        }
        messageWrapper.remove();
    }

// ---------- RENDER PESAN & STREAMING ----------
export function CAG_cancelAIRequest() {
        if (CAG_State.currentAbortController) {
            CAG_State.currentAbortController.abort();
            CAG_State.currentAbortController = null;
        }
    }

export function CAG_addStreamingMessage(container, sender) {
        const time = CAG_getTimestamp();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.id = 'streaming-wrapper-' + Date.now();
        wrapper.style.animation = 'messageSlideIn 0.3s ease';
        const isAI = sender === 'AI' || sender === 'AI';
        const bubble = document.createElement('div');
        bubble.className = isAI ? 'ai-message-modern' : 'agent-message-modern';
        const avatar = isAI ? '' : CAG_getAgentAvatar(sender);
        bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + avatar + ' ' + CAG_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span></div><div class="message-body"><span class="streaming-text"></span><span class="cursor-blink">█</span></div>';
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        return {
            wrapper: wrapper,
            textSpan: wrapper.querySelector('.streaming-text'),
            cursorSpan: wrapper.querySelector('.cursor-blink')
        };
    }

export function CAG_finishStreamingMessage(wrapper, cursorSpan, textSpan, rawText) {
        if (cursorSpan) {
            cursorSpan.remove();
        }
        if (textSpan && rawText !== undefined && rawText !== null) {
            textSpan.innerHTML = CAG_renderMarkdown(rawText);
        }
    }

export async function CAG_streamTextToElement(textSpan, text, speed) {
        speed = speed || 15;
        for (let i = 0; i < text.length; i++) {
            textSpan.textContent += text[i];
            await new Promise(function(r) {
                setTimeout(r, speed);
            });
        }
    }

export function CAG_showTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator-modern';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        return typingDiv;
    }

export function CAG_addMessage(container, sender, message, isUser) {
        if (!container) {
            return;
        }
        const time = CAG_getTimestamp();
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
                { text: 'Reaksi', action: function() { CAG_showReactionPicker(wrapper); } },
                { text: 'Edit', action: function() { CAG_editMessage(wrapper); } },
                { text: 'Delete', action: function() { CAG_deleteMessage(wrapper); } },
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
            bubble.innerHTML = '<div class="message-header"><span class="message-sender">Anda</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + CAG_renderMarkdown(message) + '</div>';
        } else {
            const isAI = sender === 'AI' || sender === 'AI';
            bubble.className = isAI ? 'ai-message-modern' : 'agent-message-modern';
            const avatar = isAI ? '' : CAG_getAgentAvatar(sender);
            bubble.innerHTML = '<div class="message-header"><span class="message-sender">' + avatar + ' ' + CAG_escapeHtml(sender) + '</span><span class="message-time">' + time + '</span><button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest(\'.message-wrapper\').querySelector(\'.message-body\').textContent);" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:11px;"></button></div><div class="message-body">' + CAG_renderMarkdown(message) + '</div>';
        }
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
        container.scrollTop = container.scrollHeight;
        const panelId = container.id;
        const history = CAG_loadChatHistory(panelId);
        history.push({ sender: sender, message: message, time: time, isUser: isUser });
        CAG_saveChatHistory(panelId, history);
    }

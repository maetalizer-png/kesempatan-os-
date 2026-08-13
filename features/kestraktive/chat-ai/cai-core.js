
import { CAI_CONFIG, CAI_PROMPT_SAPAN } from './cai-config.js';
import { CAI_State } from './cai-state.js';
import {
    CAI_buildChatPrompt, CAI_callAI, CAI_clearCache, CAI_detectGreetingIntent,
    CAI_detectKabarIntent, CAI_extractGreetingWord, CAI_getAllContext, CAI_getCacheStats,
    CAI_getCountryGreeting, CAI_getGreetingByWord, CAI_getGreetingData, CAI_getKabarReply,
    CAI_getKabarReplyByMood, CAI_getRegionalOrHolidayGreeting, CAI_getTimeBasedGreeting,
    CAI_saveMessageToMemory, CAI_smartSearch, CAI_waitForGreetingData
} from './cai-data-engine.js';
import {
    CAI_addFeedbackButtons, CAI_addMessage, CAI_addReaction, CAI_addStreamingMessage,
    CAI_cancelAIRequest, CAI_deleteMessage, CAI_editMessage, CAI_exportChat, CAI_exportChatPDF,
    CAI_finishStreamingMessage, CAI_getApiKey, CAI_initSpeechToggle, CAI_initTypingSound,
    CAI_loadFeedback, CAI_loadPreferences, CAI_loadTheme, CAI_playTypingSound,
    CAI_saveMessageToHistory, CAI_searchChat, CAI_showTypingIndicator, CAI_speakText,
    CAI_startVoiceInput, CAI_streamTextToElement, CAI_toggleEmojiPicker, CAI_toggleTheme,
    CAI_toggleTypingSound
} from './cai-ui-render.js';

async function CAI_sendChatToAI() {
        
        
        
        
        
        
        if (CAI_State.isSendingToAI) {
            return;
        }
        if (CAI_State.speechEnabled && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
                const unlockUtterance = new SpeechSynthesisUtterance('ok');
                unlockUtterance.volume = 0.01;
                window.speechSynthesis.speak(unlockUtterance);
                
                
                
                
                
                
                
                setTimeout(function() {
                    window.speechSynthesis.cancel();
                }, 50);
            } catch (e) { console.warn('[ChatAI] Speech unlock failed:', e.message); }
        }
        const input = document.getElementById('chatAiInput');
        const message = input.value.trim();
        if (!message) {
            return;
        }
        CAI_State.isSendingToAI = true;
        const sendBtn = document.getElementById('chatAiSendBtn');
        if (sendBtn) sendBtn.disabled = true;

        try {
            const container = document.getElementById('chatAiMessages');

            CAI_State.conversationContext.push({ message: message, isUser: true });

            CAI_addMessage(container, 'AI', message, true);
            input.value = '';
            CAI_playTypingSound();

            
            
            
            
            
            
            if (CAI_detectGreetingIntent(message)) {
                const typing = CAI_showTypingIndicator(container);
                await CAI_waitForGreetingData(1500, 'waktu'); 
                
                
                
                
                
                const greetingWord = CAI_extractGreetingWord(message);
                const greetingItem = CAI_getRegionalOrHolidayGreeting(message) || CAI_getGreetingByWord(greetingWord) || CAI_getTimeBasedGreeting();
                if (greetingItem && greetingItem.text) {
                    typing.remove();
                    const streamData = CAI_addStreamingMessage(container, 'AI');
                    await CAI_streamTextToElement(streamData.textSpan, greetingItem.text, CAI_CONFIG.STREAM_SPEED);
                    CAI_finishStreamingMessage(streamData.wrapper, streamData.cursorSpan, streamData.textSpan, greetingItem.text);
                    CAI_State.conversationContext.push({ message: greetingItem.text, isUser: false });
                    CAI_speakText(greetingItem.text);
                    CAI_addFeedbackButtons(streamData.wrapper);
                    CAI_saveMessageToHistory(container.id, 'AI', greetingItem.text, false);
                    return;
                }
                typing.remove();
                
                
                
            }

            
            
            
            
            
            if (CAI_detectKabarIntent(message)) {
                const typing = CAI_showTypingIndicator(container);
                await CAI_waitForGreetingData(1500, 'kabar');
                const kabarItem = CAI_getKabarReply(message);
                if (kabarItem && kabarItem.text) {
                    typing.remove();
                    const streamData = CAI_addStreamingMessage(container, 'AI');
                    await CAI_streamTextToElement(streamData.textSpan, kabarItem.text, CAI_CONFIG.STREAM_SPEED);
                    CAI_finishStreamingMessage(streamData.wrapper, streamData.cursorSpan, streamData.textSpan, kabarItem.text);
                    CAI_State.conversationContext.push({ message: kabarItem.text, isUser: false });
                    CAI_speakText(kabarItem.text);
                    CAI_addFeedbackButtons(streamData.wrapper);
                    CAI_saveMessageToHistory(container.id, 'AI', kabarItem.text, false);
                    return;
                }
                typing.remove();
            }

            const apiKey = CAI_getApiKey();
            const hasFallbackProvider = typeof window.getActiveProviders === 'function' && window.getActiveProviders().length > 0;
            if (!apiKey && !hasFallbackProvider) {
                CAI_addMessage(container, 'AI', 'Masukkan API Key.', false);
                return;
            }

            const context = await CAI_getAllContext(message, {
                forceRefresh: false,
                topK: CAI_CONFIG.TOP_K_MEMORY,
                dbLimit: CAI_CONFIG.DB_LIMIT,
                maxResults: CAI_CONFIG.MAX_RESULTS
            });

            const finalPrompt = CAI_buildChatPrompt(message, context);

            const typing = CAI_showTypingIndicator(container);
            let retries = 0;
            const maxRetries = 2;
            while (retries <= maxRetries) {
                try {
                    const streamData = CAI_addStreamingMessage(container, 'AI');
                    typing.remove();
                    const response = await CAI_callAI(finalPrompt, apiKey);
                    await CAI_streamTextToElement(streamData.textSpan, response, CAI_CONFIG.STREAM_SPEED);
                    CAI_finishStreamingMessage(streamData.wrapper, streamData.cursorSpan, streamData.textSpan, response);

                    CAI_State.conversationContext.push({ message: response, isUser: false });
                    if (CAI_State.conversationContext.length > CAI_CONFIG.MAX_HISTORY) {
                        CAI_State.conversationContext = CAI_State.conversationContext.slice(-CAI_CONFIG.MAX_HISTORY);
                    }

                    CAI_speakText(response);
                    CAI_addFeedbackButtons(streamData.wrapper);
                    CAI_saveMessageToHistory(container.id, 'AI', response, false);
                    CAI_saveMessageToMemory(message, response);
                    break;
                } catch (error) {
                    typing.remove();
                    if (error.name === 'AbortError') {
                        CAI_addMessage(container, 'AI', 'Request dibatalkan.', false);
                        break;
                    }
                    retries++;
                    if (retries > maxRetries) {
                        CAI_addMessage(container, 'AI', 'Error: ' + error.message, false);
                    } else {
                        CAI_addMessage(container, 'AI', 'Mencoba ulang (' + retries + '/' + maxRetries + ')...', false);
                        await new Promise(function(r) {
                            setTimeout(r, 1000 * retries);
                        });
                    }
                }
            }
        } finally {
            CAI_State.isSendingToAI = false;
            if (sendBtn) sendBtn.disabled = false;
        }
    }


function CAI_renderChatAiPanel() {
        const container = document.getElementById('interactiveChatAiPanel');
        if (!container || container.dataset.rendered === 'true') {
            return;
        }
        container.dataset.rendered = 'true';
        container.innerHTML = "<div id=\"chatAiMessages\" class=\"chat-messages\" style=\"height:300px; background:rgba(0,0,0,0.3); border-radius:16px; padding:12px; overflow-y:auto;\"><div style=\"color:#00FFA3;\">AI Assistant:</div><div style=\"color:#A0B3C9;\">Halo! Tanyakan tentang bisnis, peluang, atau strategi. Saya bisa bicara! </div></div><div style=\"display:flex; gap:10px; margin-top:12px;\"><input type=\"text\" id=\"chatAiInput\" placeholder=\"Ketik pertanyaan...\" style=\"flex:1;\"><button id=\"chatAiSendBtn\" class=\"execute-btn secondary\">Kirim</button></div>";
    }


function CAI_initChatAi() {
        CAI_renderChatAiPanel();

        CAI_State.userPreferences = CAI_loadPreferences();
        CAI_State.feedbackHistory = CAI_loadFeedback();
        const prefs = CAI_State.userPreferences;
        if (prefs.language) {
            CAI_State.languagePreference = prefs.language;
        }
        if (prefs.style) {
            CAI_State.stylePreference = prefs.style;
        }

        CAI_initSpeechToggle();
        CAI_initTypingSound();
        CAI_loadTheme();

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const savedSound = localStorage.getItem('kes_typing_sound');
        if (savedSound !== null) {
            CAI_State.typingSoundEnabled = savedSound === 'true';
        }

        const aiSend = document.getElementById('chatAiSendBtn');
        const aiInput = document.getElementById('chatAiInput');
        if (aiSend) {
            aiSend.onclick = CAI_sendChatToAI;
        }
        if (aiInput) {
            aiInput.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    aiSend?.click();
                }
            };
        }

        window.showPreferencesPanel = window.showPreferencesPanel || function() {};
        window.clearChatCache = CAI_clearCache;
        window.getChatCacheStats = CAI_getCacheStats;
    }






window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.ChatModule = window.KESEMPATAN.ChatModule || window.ChatModule || {};
window.ChatModule = window.KESEMPATAN.ChatModule;
Object.assign(window.ChatModule, {
    sendChatToAI: CAI_sendChatToAI,
    speakText: CAI_speakText,
    startVoiceInput: CAI_startVoiceInput,
    initSpeechToggle: CAI_initSpeechToggle,
    exportChat: CAI_exportChat,
    exportChatPDF: CAI_exportChatPDF,
    cancelAIRequest: CAI_cancelAIRequest,
    searchChat: CAI_searchChat,
    toggleTheme: CAI_toggleTheme,
    toggleTypingSound: CAI_toggleTypingSound,
    toggleEmojiPicker: CAI_toggleEmojiPicker,
    addReaction: CAI_addReaction,
    editMessage: CAI_editMessage,
    deleteMessage: CAI_deleteMessage,
    clearCache: CAI_clearCache,
    getCacheStats: CAI_getCacheStats,
    CONFIG: CAI_CONFIG,
    getAllContext: CAI_getAllContext,
    buildChatPrompt: CAI_buildChatPrompt,
    smartSearch: CAI_smartSearch,
    PROMPT_SAPAN: CAI_PROMPT_SAPAN,
    getGreetingData: CAI_getGreetingData,
    detectGreetingIntent: CAI_detectGreetingIntent,
    getTimeBasedGreeting: CAI_getTimeBasedGreeting,
    extractGreetingWord: CAI_extractGreetingWord,
    getGreetingByWord: CAI_getGreetingByWord,
    getCountryGreeting: CAI_getCountryGreeting,
    detectKabarIntent: CAI_detectKabarIntent,
    getKabarReply: CAI_getKabarReply,
    getKabarReplyByMood: CAI_getKabarReplyByMood
});


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CAI_initChatAi);
} else {
    CAI_initChatAi();
}

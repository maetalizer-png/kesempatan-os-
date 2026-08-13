
import { DEB_CONFIG } from './deb-config.js';
import { DEB_State } from './deb-state.js';





import { DEB_SecurityManager } from './deb-classes.js';

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    export function DEB_hashAgentKey(key) {
        let hash = 0;
        const str = String(key || '');
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }
        return hash;
    }

    export function DEB_getVoiceProfile(agentKey) {
        
        
        
        
        const PROFILES = [
            { pitch: 0.82, rate: 0.93, voiceIndex: 0 },
            { pitch: 1.22, rate: 1.05, voiceIndex: 1 }
        ];
        if (!agentKey) {
            return { pitch: 1.0, rate: DEB_CONFIG.VOICE_RATE, voiceIndex: 0 };
        }
        return PROFILES[DEB_hashAgentKey(agentKey) % 2];
    }

    export function DEB_getIndonesianVoices() {
        const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
        const idVoices = voices.filter(function(v) {
            return v.lang === 'id-ID' || v.lang.indexOf('id') === 0;
        });
        return idVoices.length > 0 ? idVoices : voices;
    }

    export function DEB_splitIntoSentences(text) {
        const parts = text.match(/[^.!?]+[.!?]*/g);
        if (!parts || parts.length === 0) {
            return [text];
        }
        return parts.map(function(s) { return s.trim(); }).filter(Boolean);
    }

    export function DEB_speakUtteranceChain(text, profile) {
        return new Promise(function(resolve) {
            if (!window.speechSynthesis) {
                resolve();
                return;
            }
            const sentences = DEB_splitIntoSentences(text);
            const idVoices = DEB_getIndonesianVoices();
            const chosenVoice = idVoices.length > 0 ? idVoices[profile.voiceIndex % idVoices.length] : null;
            let i = 0;

            function speakNext() {
                if (i >= sentences.length) {
                    resolve();
                    return;
                }
                const utterance = new SpeechSynthesisUtterance(sentences[i]);
                utterance.lang = 'id-ID';
                utterance.rate = profile.rate;
                utterance.pitch = profile.pitch;
                if (chosenVoice) {
                    utterance.voice = chosenVoice;
                }
                utterance.onend = function() {
                    i++;
                    setTimeout(speakNext, 130); 
                };
                utterance.onerror = function() {
                    i++;
                    speakNext();
                };
                window.speechSynthesis.speak(utterance);
            }
            speakNext();
        });
    }

    export function DEB_speakText(text, agentKey) {
        if (!DEB_State.speechEnabled || !text || text.length === 0) {
            return Promise.resolve();
        }
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        const stripped = DEB_SecurityManager.stripMarkdown(text);
        const cleanText = stripped.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (!cleanText) {
            return Promise.resolve();
        }
        const profile = DEB_getVoiceProfile(agentKey);
        
        DEB_State.speechQueue = DEB_State.speechQueue.then(function() {
            return DEB_speakUtteranceChain(cleanText, profile);
        }).catch(function() {
            return Promise.resolve();
        });
        return DEB_State.speechQueue;
    }

    export function DEB_stopAllSpeech() {
        DEB_State.speechQueue = Promise.resolve();
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }
    

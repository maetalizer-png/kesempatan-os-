/* ============================================================
   interactive/chat-agent/cag-core.js
   INTI CHAT AGENT — kirim pesan, render panel, init, ekspor
   window.ChatModule. Dimuat PALING TERAKHIR.
   ============================================================ */
import { CAG_CONFIG, CAG_PROMPT_SAPAN } from './cag-config.js';
import { CAG_State } from './cag-state.js';
import {
    CAG_callAI, CAG_getAgentDisplayName, CAG_getAllContext, CAG_loadPreferences,
    CAG_populateAgentSelect, CAG_saveMessageToMemory
} from './cag-data-engine.js';
import {
    CAG_addMessage, CAG_addStreamingMessage, CAG_finishStreamingMessage, CAG_getApiKey,
    CAG_loadTheme, CAG_playTypingSound, CAG_saveMessageToHistory, CAG_showTypingIndicator,
    CAG_speakText, CAG_streamTextToElement
} from './cag-ui-render.js';

// Jalur eksekusi tugas otonom (spec 18: entry point AI Agent lewat chat,
// bukan halaman baru) — dipicu HANYA saat #chatAgentAutoModeToggle
// dicentang user, jadi jalur tanya-jawab satu putaran yang sudah ada di
// CAG_sendChatToAgent() di bawah tetap berjalan persis seperti sebelumnya
// saat toggle mati (default).
async function CAG_runAutonomousAgentTask(message, container, displayName) {
    const runtime = window.KESEMPATAN && window.KESEMPATAN.AIAgent;
    if (!runtime || typeof runtime.runAgentTask !== 'function') {
        CAG_addMessage(container, displayName, 'Mode Agent Otonom belum siap (ai-agent/agent-runtime.js belum termuat). Coba lagi sebentar.', false);
        return;
    }
    const typing = CAG_showTypingIndicator(container);
    try {
        const task = await runtime.runAgentTask(message, { topic: message, instruction: message }, { executionMode: 'AUTO' });
        typing.remove();

        const lines = [];
        lines.push('**Status tugas:** ' + task.status + (task.replanCount ? ' (replanning ' + task.replanCount + 'x)' : ''));
        (task.stepResults || []).forEach(function(step, i) {
            const mark = step.success ? '✅' : '❌';
            const label = (step.description || step.stepId || ('Langkah ' + (i + 1)));
            lines.push(mark + ' ' + label + (step.error ? ' — ' + step.error : ''));
        });
        if (task.evaluation) {
            lines.push('');
            lines.push('Ringkasan: ' + task.evaluation.passedCount + '/' + task.evaluation.evaluations.length + ' langkah berhasil.');
        }
        const response = lines.join('\n');

        CAG_addMessage(container, displayName, response, false);
        CAG_saveMessageToHistory(container.id, displayName, response, false);
        CAG_saveMessageToMemory(message, response, displayName);
    } catch (error) {
        typing.remove();
        CAG_addMessage(container, displayName, 'Agent Otonom gagal: ' + error.message, false);
    }
}

async function CAG_sendChatToAgent() {
        // FIX: penjaga anti-panggil-ganda yang sama seperti sendChatToAI().
        if (CAG_State.isSendingToAgent) {
            return;
        }
        if (CAG_State.speechEnabled && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
                const unlockUtterance = new SpeechSynthesisUtterance('ok');
                unlockUtterance.volume = 0.01;
                window.speechSynthesis.speak(unlockUtterance);
                setTimeout(function() {
                    window.speechSynthesis.cancel();
                }, 50);
            } catch (e) { console.warn('[ChatAgent] Speech unlock failed:', e.message); }
        }
        const input = document.getElementById('chatAgentInput');
        const message = input.value.trim();
        if (!message) {
            return;
        }
        CAG_State.isSendingToAgent = true;
        const sendBtn = document.getElementById('chatAgentSendBtn');
        if (sendBtn) sendBtn.disabled = true;

        try {
            let agentSelect = document.getElementById('chatAgentSelect');
            let agent = agentSelect?.value;
            if (!agent) {
                CAG_populateAgentSelect(agentSelect);
                agent = agentSelect?.value;
            }
            if (!agent) {
                const container = document.getElementById('chatAgentMessages');
                if (container) {
                    CAG_addMessage(container, 'Sistem', 'Tidak ada agen terdeteksi dari Dashboard. Buka halaman Dashboard dulu supaya daftar agen termuat, lalu kembali ke sini.', false);
                }
                return;
            }
            const container = document.getElementById('chatAgentMessages');
            const displayName = CAG_getAgentDisplayName(agent);

            CAG_addMessage(container, displayName, message, true);
            input.value = '';
            CAG_playTypingSound();
            const apiKey = CAG_getApiKey();
            const hasFallbackProvider = typeof window.getActiveProviders === 'function' && window.getActiveProviders().length > 0;
            if (!apiKey && !hasFallbackProvider) {
                CAG_addMessage(container, displayName, 'Masukkan API Key.', false);
                return;
            }

            const autoModeToggle = document.getElementById('chatAgentAutoModeToggle');
            if (autoModeToggle && autoModeToggle.checked) {
                await CAG_runAutonomousAgentTask(message, container, displayName);
                return;
            }

            const context = await CAG_getAllContext(message, {
                forceRefresh: false,
                topK: CAG_CONFIG.TOP_K_MEMORY,
                dbLimit: CAG_CONFIG.DB_LIMIT,
                maxResults: CAG_CONFIG.MAX_RESULTS
            });

            let roleDesc = 'Business Advisor';
            let agentSystemPrompt = '';
            if (window.getAgentConfig) {
                const cfg = window.getAgentConfig(agent);
                if (cfg?.role) {
                    roleDesc = cfg.role;
                }
                if (cfg?.systemPrompt) {
                    agentSystemPrompt = cfg.systemPrompt;
                }
            }

            let prompt = CAG_PROMPT_SAPAN;

            if (agentSystemPrompt) {
                // FIX KUALITAS: sebelumnya cuma pakai roleDesc (1 kalimat
                // singkat, mis. "Senior Business Strategist"). Sekarang
                // inject PROFIL KEAHLIAN LENGKAP dari prompts/*.json (sama
                // yg dipakai Dashboard) — instruksi analisis, gaya
                // berpikir, dan disiplin per-agen ikut terpakai di sini.
                // Instruksi format JSON di ujung prompt asli DIABAIKAN
                // (chat butuh jawaban natural, bukan laporan terstruktur).
                prompt += '\nPROFIL & KEAHLIAN ANDA (' + displayName + '):\n' + agentSystemPrompt + '\n';
                prompt += '\nCATATAN: instruksi "Output dalam format JSON" di atas TIDAK berlaku di percakapan ini — jawab dengan bahasa natural percakapan biasa, TAPI tetap terapkan cara berpikir, ketajaman analisis, dan disiplin dari profil di atas.\n';
            }

            if (context && context.combined && context.combined.length > 0) {
                context.combined.slice(0, 3).forEach(function(item, i) {
                    const text = item.text || '';
                    let source = 'Sumber';
                    if (item._source === 'static' || item.metadata?.source) {
                        source = item.metadata?.source || 'World';
                    } else if (item.metadata?.type) {
                        source = item.metadata.type;
                    }
                    prompt += (i + 1) + '. ' + text.substring(0, 300) + ' [' + source + ']\n';
                });
            } else {
                prompt += '(Tidak ada data proyek yang relevan tersedia — kalau pertanyaan bersifat umum, jawab dari pengetahuan umummu)\n';
            }

            if (context && context.observation && context.observation.marketInsight) {
                prompt += '\nSENTIMEN PASAR/BERITA TERKINI:\n' + context.observation.marketInsight + '\n';
            }
            if (context && context.observation && context.observation.credibilityNote) {
                prompt += '\n' + context.observation.credibilityNote + '\n';
            }

            prompt += '\nAnda adalah ' + displayName + ', ' + roleDesc + '.\n';
            prompt += 'PERTANYAAN USER:\n' + message + '\n\n';
            prompt += 'JAWABAN (utamakan DATA di atas kalau relevan; kalau pertanyaan umum di luar cakupan DATA, jawab dari pengetahuan umum secara akurat sesuai peran Anda di atas):';

            const typing = CAG_showTypingIndicator(container);
            try {
                const streamData = CAG_addStreamingMessage(container, displayName);
                typing.remove();
                const response = await CAG_callAI(prompt, apiKey);
                await CAG_streamTextToElement(streamData.textSpan, response, CAG_CONFIG.STREAM_SPEED);
                CAG_finishStreamingMessage(streamData.wrapper, streamData.cursorSpan, streamData.textSpan, response);
                CAG_speakText(response);
                CAG_saveMessageToHistory(container.id, displayName, response, false);
                CAG_saveMessageToMemory(message, response, displayName);
            } catch (error) {
                typing.remove();
                if (error.name === 'AbortError') {
                    CAG_addMessage(container, displayName, 'Request dibatalkan.', false);
                } else {
                    CAG_addMessage(container, displayName, 'Error: ' + error.message, false);
                }
            }
        } finally {
            CAG_State.isSendingToAgent = false;
            if (sendBtn) sendBtn.disabled = false;
        }
    }

function CAG_renderChatAgentPanel() {
        const container = document.getElementById('interactiveChatAgentPanel');
        if (!container || container.dataset.rendered === 'true') {
            return;
        }
        container.dataset.rendered = 'true';
        container.innerHTML = "<select id=\"chatAgentSelect\" style=\"width:100%; margin-bottom:12px;\"></select><div id=\"chatAgentMessages\" class=\"chat-messages\" style=\"height:300px; background:rgba(0,0,0,0.3); border-radius:16px; padding:12px; overflow-y:auto;\"></div><label style=\"display:flex; align-items:center; gap:8px; margin-top:10px; font-size:13px; color:#A0B3C9; cursor:pointer;\"><input type=\"checkbox\" id=\"chatAgentAutoModeToggle\"> Mode Agent Otonom (rencana &amp; eksekusi multi-langkah otomatis, pakai kapabilitas AI Agent)</label><div style=\"display:flex; gap:10px; margin-top:12px;\"><input type=\"text\" id=\"chatAgentInput\" placeholder=\"Ketik pesan untuk agen...\" style=\"flex:1;\"><button id=\"chatAgentSendBtn\" class=\"execute-btn secondary\">Kirim</button></div>";
        CAG_populateAgentSelect(document.getElementById('chatAgentSelect'));

        // Roster agen dashboard bisa selesai dirender SETELAH panel ini
        // pertama kali tampil. Coba isi ulang beberapa kali di awal.
        [500, 1500, 3000].forEach(function(delay) {
            setTimeout(function() {
                const sel = document.getElementById('chatAgentSelect');
                if (sel && (!sel.value || sel.options.length <= 1)) {
                    CAG_populateAgentSelect(sel);
                }
            }, delay);
        });
    }

function CAG_initChatAgentPrefs() {
    CAG_State.userPreferences = CAG_loadPreferences();
    if (CAG_State.userPreferences.language) {
        CAG_State.languagePreference = CAG_State.userPreferences.language;
    }
    if (CAG_State.userPreferences.style) {
        CAG_State.stylePreference = CAG_State.userPreferences.style;
    }
}

function CAG_initChatAgent() {
        CAG_initChatAgentPrefs();
        CAG_renderChatAgentPanel();
        CAG_loadTheme();

        const agentSend = document.getElementById('chatAgentSendBtn');
        const agentInput = document.getElementById('chatAgentInput');
        if (agentSend) {
            agentSend.onclick = CAG_sendChatToAgent;
        }
        if (agentInput) {
            agentInput.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    agentSend?.click();
                }
            };
        }
    }

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.ChatModule = window.KESEMPATAN.ChatModule || window.ChatModule || {};
window.ChatModule = window.KESEMPATAN.ChatModule;
Object.assign(window.ChatModule, {
    sendChatToAgent: CAG_sendChatToAgent
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CAG_initChatAgent);
} else {
    CAG_initChatAgent();
}

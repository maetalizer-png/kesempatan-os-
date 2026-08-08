/* ============================================================
   KESEMPATAN OS v18.5 — UI PLAYER
   ✅ Play, stop, audio visualizer, background music, bookmark, skip
   ✅ Perbaikan: menghapus renderer.renderChapters() yang tidak ada
   ✅ TAMBAHAN: playDiscussion dengan parser fleksibel
   ============================================================ */

(function() {
    'use strict';

    if (window.Podcast && window.Podcast.uiPlayer) return;
    window.Podcast = window.Podcast || {};

    // ========== REFERENSI ==========
    const core = window.Podcast.core;
    const config = window.Podcast.config;
    const renderer = window.Podcast.uiRenderer;
    const generator = window.Podcast.uiGenerator;
    if (!core || !config || !renderer || !generator) {
        console.warn('[UI Player] Core/Config/Renderer/Generator belum dimuat!');
        return;
    }

    const state = core.state;
    const VOICE_PRESETS = config.VOICE_PRESETS;
    const VOICE_EMOTIONS = config.VOICE_EMOTIONS;
    const LANGUAGES = config.LANGUAGES;
    const THEMES = config.THEMES;
    const BG_MUSIC = config.BG_MUSIC;
    const AGENT_VOICES = config.AGENT_VOICES;

    const showToast = renderer.showToast;
    const sanitizeHtml = renderer.sanitizeHtml;
    const updatePlayButtons = renderer.updatePlayButtons;
    const updateGallery = renderer.updateGallery;
    const renderBookmarks = renderer.renderBookmarks;
    const addSafeEventListener = renderer.addSafeEventListener;

    // ============================================================
    // 🆕 MESIN RITME & INTONASI (upgrade kualitas suara)
    // ============================================================
    // Web Speech API cuma terima 1 pitch/rate statis per utterance, jadi
    // kalau 1 baris panjang dibacakan sekaligus, hasilnya flat & terburu-buru
    // (gak ada "napas"). Di sini teks dipecah per kalimat, tiap kalimat dapat:
    //  - jeda antar-kalimat natural (lebih panjang di tanda tanya/seru, dan
    //    diskalakan oleh pauseFactor persona - Skeptic mikir lebih lama,
    //    Host lebih cepat menyambung)
    //  - wobble pitch mikro acak (pitchVariance) supaya gak terdengar robotic
    //  - infleksi otomatis: naik dikit di kalimat tanya, sedikit lebih
    //    energik di kalimat seru, sedikit melambat di kalimat panjang
    const INTERJECTION_RE = /^(Wah|Hmm+|Eh|Iya nih|Lho|Oke|Nah|Waduh)[,!]?\s*/i;

    function splitIntoSentences(text) {
        const matches = text.match(/[^.!?]+[.!?]*/g) || [text];
        return matches.map(function(s) { return s.trim(); }).filter(Boolean);
    }

    function speakExpressive(fullText, voiceParams, langCode, rateMultiplier, callbacks) {
        callbacks = callbacks || {};
        const sentences = splitIntoSentences(fullText);
        if (sentences.length === 0) {
            if (callbacks.onDone) callbacks.onDone();
            return null;
        }
        const pauseFactor = voiceParams.pauseFactor || 1;
        const pitchVariance = voiceParams.pitchVariance || 0;
        let i = 0;
        let cancelled = false;
        let searchFrom = 0; // 🆕 posisi pencarian kalimat di dalam fullText, untuk karaoke caption

        function speakNext() {
            if (cancelled) return;
            if (i >= sentences.length) {
                if (callbacks.onDone) callbacks.onDone();
                return;
            }
            const sentence = sentences[i];
            const sentenceStart = fullText.indexOf(sentence, searchFrom);
            if (sentenceStart >= 0) searchFrom = sentenceStart + sentence.length;
            const isQuestion = /\?\s*$/.test(sentence);
            const isExclaim = /!\s*$/.test(sentence);
            const hasInterjection = INTERJECTION_RE.test(sentence);

            const wobble = pitchVariance ? (1 + (Math.random() * 2 - 1) * pitchVariance) : 1;
            let pitchAdj = voiceParams.pitch * wobble;
            if (isQuestion) pitchAdj *= 1.08;
            if (isExclaim) pitchAdj *= 1.05;

            let rateAdj = voiceParams.rate * (rateMultiplier || 1);
            if (isExclaim) rateAdj *= 1.05;
            if (sentence.length > 90) rateAdj *= 0.97;

            const utter = new SpeechSynthesisUtterance(sentence);
            utter.lang = langCode;
            utter.pitch = Math.max(0.5, Math.min(2.0, pitchAdj));
            utter.rate = Math.max(0.5, Math.min(2.0, rateAdj));
            utter.volume = voiceParams.volume != null ? Math.max(0, Math.min(1, voiceParams.volume)) : 1;
            if (voiceParams.voice) utter.voice = voiceParams.voice;

            if (i === 0 && callbacks.onStart) callbacks.onStart(fullText);

            // 🆕 KARAOKE CAPTION — highlight kata yang sedang diucapkan.
            // Dukungan `onboundary` (word/sentence boundary) bervariasi per
            // browser/TTS engine; kalau tidak didukung, caption tetap
            // tampil statis seperti sebelumnya (degradasi aman, tidak error).
            utter.onboundary = function(e) {
                if (renderer.highlightSpokenWord && sentenceStart >= 0 && (e.name === 'word' || !e.name)) {
                    renderer.highlightSpokenWord(sentenceStart + e.charIndex, e.charLength || 1);
                }
            };

            let basePause = (isQuestion || isExclaim) ? 380 : 240;
            if (hasInterjection) basePause += 100;
            const pauseMs = Math.round(basePause * pauseFactor + Math.random() * 120);

            utter.onend = function() { i++; setTimeout(speakNext, pauseMs); };
            utter.onerror = function() { i++; setTimeout(speakNext, pauseMs); };
            window.speechSynthesis.speak(utter);
        }
        speakNext();
        return { cancel: function() { cancelled = true; } };
    }

    // ========== PLAY / STOP ==========
    // ============================================================
    // 🎬 AUDIO STINGER — jingle intro/outro sintesis (Web Audio API,
    // tanpa file eksternal). Ini yang membedakan "podcast rumahan" dari
    // "podcast dunia" - branding audio singkat di awal & akhir episode,
    // seperti jingle NPR/Spotify Original/dsb.
    // ============================================================
    function playStinger(type) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            // Intro: arpeggio naik (C5-E5-G5-C6) - cerah, mengundang.
            // Outro: arpeggio turun (G5-E5-C5) - hangat, menutup dengan mantap.
            const notes = type === 'intro' ? [523.25, 659.25, 783.99, 1046.50] : [783.99, 659.25, 523.25];
            notes.forEach(function(freq, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const start = now + i * 0.12;
                const dur = 0.35;
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + dur + 0.05);
            });
            setTimeout(function() { try { ctx.close(); } catch (_) {} }, (notes.length * 120 + 500));
        } catch (_) {}
    }

    function playPodcast() {
        if (!state.podcastText || state.podcastText.trim() === '') {
            showToast('⚠️ Generate naskah terlebih dahulu!');
            return;
        }

        if (window.speechSynthesis.speaking) {
            if (state.currentUtterance && typeof state.currentUtterance.cancel === 'function') {
                state.currentUtterance.cancel();
            }
            window.speechSynthesis.cancel();
            state.currentUtterance = null;
            state.isPlaying = false;
            state.isDebatePlaying = false;
            updatePlayButtons();
            duckBackgroundMusic(false);
            stopBackgroundMusic();
            stopAudioVisualizer();
            if (renderer.clearActiveSpeaker) renderer.clearActiveSpeaker();
            return;
        }

        let pitch, rate;
        if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
            pitch = AGENT_VOICES[state.currentAgentVoice].pitch;
            rate = AGENT_VOICES[state.currentAgentVoice].rate;
        } else {
            const preset = VOICE_PRESETS[state.currentVoiceType] || VOICE_PRESETS.professional_male;
            pitch = preset.pitch;
            rate = preset.rate;
        }

        const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
        pitch = Math.max(0.5, Math.min(2.0, pitch * emotionMod.pitch));
        rate = Math.max(0.5, Math.min(2.0, rate * emotionMod.rate));

        const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';

        if (state.speakerMode === 'debate') {
            playDebate();
            return;
        }
        if (state.speakerMode === 'discussion') {
            playDiscussion();
            return;
        }

        let genderForVoice = null;
        if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
            genderForVoice = core.inferAgentGender(state.currentAgentVoice);
        } else {
            const presetForGender = VOICE_PRESETS[state.currentVoiceType] || VOICE_PRESETS.professional_male;
            genderForVoice = presetForGender.gender === 'female' ? 'female' : 'male';
        }
        const voice = core.getCachedVoice(langCode, genderForVoice);

        const voiceParams = {
            pitch: pitch,
            rate: rate,
            volume: (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice] && AGENT_VOICES[state.currentAgentVoice].volume != null)
                ? AGENT_VOICES[state.currentAgentVoice].volume : 1,
            pauseFactor: (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice] && AGENT_VOICES[state.currentAgentVoice].pauseFactor) || 1,
            pitchVariance: (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice] && AGENT_VOICES[state.currentAgentVoice].pitchVariance) || 0.04,
            voice: voice
        };

        playStinger('intro');
        state.currentUtterance = speakExpressive(state.podcastText, voiceParams, langCode, state.currentRate, {
            onStart: function() {
                state.isPlaying = true;
                updatePlayButtons();
                if (state.currentBgMusic !== 'off') playBackgroundMusic();
                startAudioVisualizer();
                duckBackgroundMusic(true);
                if (renderer.setActiveSpeaker) renderer.setActiveSpeaker('Narator', state.podcastText.substring(0, 120));
                core.trackAnalytics('play', {
                    topic: generator.getTopic ? generator.getTopic() : (document.getElementById('topicInput') ? document.getElementById('topicInput').value : ''),
                    voice: state.currentVoiceType,
                    duration: state.podcastText.length / 10
                });
            },
            onDone: function() {
                state.isPlaying = false;
                updatePlayButtons();
                duckBackgroundMusic(false);
                stopBackgroundMusic();
                stopAudioVisualizer();
                if (renderer.clearActiveSpeaker) renderer.clearActiveSpeaker();
                playStinger('outro');
                savePodcastToHistory();
                state.currentUtterance = null;
            }
        });

        if (core.collab.isConnected) {
            core.collab.syncScript(state.podcastText);
        }
    }

    function playDebate() {
        const lines = state.podcastText.split('\n');
        const agentLines = lines.filter(function(l) {
            return l.includes('(PRO)') || l.includes('(KONTRA)') || l.includes('(MEDIATOR)') || l.includes('(ANALIS)') || l.includes('(MODERATOR)');
        });
        if (agentLines.length === 0) {
            showToast('⚠️ Format debat tidak dikenali, play normal');
            return;
        }
        let idx = 0;
        state.isDebatePlaying = true;
        const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';
        const speakNextLine = function() {
            if (!state.isDebatePlaying || idx >= agentLines.length) {
                const finishedNaturally = idx >= agentLines.length;
                state.isDebatePlaying = false;
                updatePlayButtons();
                duckBackgroundMusic(false);
                stopBackgroundMusic();
                stopAudioVisualizer();
                if (renderer.clearActiveSpeaker) renderer.clearActiveSpeaker();
                if (finishedNaturally) playStinger('outro');
                savePodcastToHistory();
                return;
            }
            const line = agentLines[idx];
            let agentKey = 'Manager';
            const keys = Object.keys(AGENT_VOICES);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (line.includes(AGENT_VOICES[key].name)) {
                    agentKey = key;
                    break;
                }
            }
            const agentVoice = AGENT_VOICES[agentKey] || AGENT_VOICES['Manager'];
            const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
            const pitch = Math.max(0.5, Math.min(2.0, agentVoice.pitch * emotionMod.pitch));
            const rate = Math.max(0.5, Math.min(2.0, agentVoice.rate * emotionMod.rate));
            const agentIndex = keys.indexOf(agentKey);
            const voice = core.getVoiceForSpeaker(langCode, agentIndex >= 0 ? agentIndex : 0, core.inferAgentGender(agentKey));
            const cleanLine = line.replace(/^.*?(\(PRO\)|\(KONTRA\)|\(MEDIATOR\)|\(ANALIS\)|\(MODERATOR\))\s*:?\s*/, '');
            const pauseMs = 700 + Math.floor(Math.random() * 300);

            state.currentUtterance = speakExpressive(cleanLine, {
                pitch: pitch,
                rate: rate,
                volume: agentVoice.volume != null ? agentVoice.volume : 1,
                pauseFactor: agentVoice.pauseFactor || 1,
                pitchVariance: agentVoice.pitchVariance || 0.04,
                voice: voice
            }, langCode, state.currentRate, {
                onStart: function() {
                    if (renderer.setActiveSpeaker) renderer.setActiveSpeaker(agentKey, cleanLine);
                },
                onDone: function() {
                    idx++;
                    setTimeout(speakNextLine, pauseMs);
                }
            });
        };
        state.isPlaying = true;
        updatePlayButtons();
        if (state.currentBgMusic !== 'off') playBackgroundMusic();
        startAudioVisualizer();
        duckBackgroundMusic(true);
        playStinger('intro');
        speakNextLine();
    }

    // ========== PLAY DISCUSSION (TAMBAHAN - PARSER FLEKSIBEL) ==========
    function playDiscussion() {
        const lines = state.podcastText.split('\n');
        // Pola untuk mendeteksi pembicara
        const speakerPatterns = [
            /^\[(Host|Expert|Storyteller|Skeptic)\]/i,
            /^(Host|Expert|Storyteller|Skeptic)\s*[:：]\s*/i,
            /^(Host|Expert|Storyteller|Skeptic)\s*[-—]\s*/i
        ];

        let speakerLines = [];
        let usedPattern = null;

        // Coba setiap pola, ambil yang paling banyak match
        for (let p of speakerPatterns) {
            const matched = lines.filter(l => p.test(l.trim()));
            if (matched.length > speakerLines.length) {
                speakerLines = matched;
                usedPattern = p;
            }
        }

        if (speakerLines.length === 0) {
            showToast('⚠️ Format diskusi tidak dikenali, play normal');
            playPodcast(); // fallback
            return;
        }

        // 🆕 pakai varian suara pria/wanita sesuai pilihan gender per peran
        // (state.discussionGenders), fallback ke 'pria' kalau belum diset
        const genders = state.discussionGenders || {};
        const speakerMap = {
            'Host': 'discussion_host_' + (genders.Host || 'pria'),
            'Expert': 'discussion_expert_' + (genders.Expert || 'wanita'),
            'Storyteller': 'discussion_storyteller_' + (genders.Storyteller || 'pria'),
            'Skeptic': 'discussion_skeptic_' + (genders.Skeptic || 'wanita')
        };
        // index tetap per peran supaya tiap peran konsisten dapat voice yang sama
        // sepanjang episode (bukan acak tiap baris), meski episode di-generate ulang
        const speakerVoiceIndex = { 'Host': 0, 'Expert': 1, 'Storyteller': 2, 'Skeptic': 3 };

        let idx = 0;
        state.isDebatePlaying = true;
        const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';

        const speakNext = function() {
            if (!state.isDebatePlaying || idx >= speakerLines.length) {
                const finishedNaturally = idx >= speakerLines.length;
                state.isDebatePlaying = false;
                state.isPlaying = false;
                updatePlayButtons();
                duckBackgroundMusic(false);
                stopBackgroundMusic();
                stopAudioVisualizer();
                if (renderer.clearActiveSpeaker) renderer.clearActiveSpeaker();
                if (finishedNaturally) playStinger('outro');
                savePodcastToHistory();
                return;
            }

            const rawLine = speakerLines[idx];
            let speaker = null;
            let text = '';

            // Ekstrak pembicara menggunakan pola yang ditemukan
            const trimmed = rawLine.trim();
            for (let p of speakerPatterns) {
                const match = trimmed.match(p);
                if (match) {
                    speaker = match[1];
                    let remainder = trimmed.replace(p, '').trim();
                    // Bersihkan sisa karakter
                    remainder = remainder.replace(/^[:：\-—]\s*/, '').trim();
                    text = remainder;
                    break;
                }
            }

            // Fallback: cari kata kunci di awal
            if (!speaker) {
                const words = trimmed.split(/\s+/);
                const firstWord = words[0] ? words[0].replace(/[\[\]:：\-—]/g, '') : '';
                const possibleSpeakers = ['Host', 'Expert', 'Storyteller', 'Skeptic'];
                for (let s of possibleSpeakers) {
                    if (firstWord.toLowerCase() === s.toLowerCase()) {
                        speaker = s;
                        text = words.slice(1).join(' ');
                        break;
                    }
                }
            }

            if (!speaker) {
                // Tidak dikenali, skip
                idx++;
                setTimeout(speakNext, 200);
                return;
            }

            const agentKey = speakerMap[speaker] || 'Manager';
            const agentVoice = AGENT_VOICES[agentKey] || AGENT_VOICES['Manager'];
            const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
            const pitch = Math.max(0.5, Math.min(2.0, agentVoice.pitch * emotionMod.pitch));
            const rate = Math.max(0.5, Math.min(2.0, agentVoice.rate * emotionMod.rate));
            const voice = core.getVoiceForSpeaker(langCode, speakerVoiceIndex[speaker] ?? 0, core.inferAgentGender(agentKey));

            // jeda antar giliran bicara dibuat variatif dan diskalakan pauseFactor
            // persona (mis. Skeptic mikir dulu sebelum nyanggah, Host lebih cepat
            // menyambung) - biar gak terasa "robotic metronome"
            const pauseFactor = agentVoice.pauseFactor || 1;
            const pauseMs = Math.round((700 + Math.floor(Math.random() * 400)) * pauseFactor);

            state.currentUtterance = speakExpressive(text, {
                pitch: pitch,
                rate: rate,
                volume: agentVoice.volume != null ? agentVoice.volume : 1,
                pauseFactor: agentVoice.pauseFactor || 1,
                pitchVariance: agentVoice.pitchVariance || 0.04,
                voice: voice
            }, langCode, state.currentRate, {
                onStart: function() {
                    if (renderer.setActiveSpeaker) renderer.setActiveSpeaker(speaker, text);
                },
                onDone: function() {
                    idx++;
                    setTimeout(speakNext, pauseMs);
                }
            });
        };

        state.isPlaying = true;
        updatePlayButtons();
        if (state.currentBgMusic !== 'off') playBackgroundMusic();
        startAudioVisualizer();
        duckBackgroundMusic(true);
        playStinger('intro');
        speakNext();
    }

    function stopPodcast() {
        if (state.currentUtterance && typeof state.currentUtterance.cancel === 'function') {
            state.currentUtterance.cancel();
        }
        window.speechSynthesis.cancel();
        state.currentUtterance = null;
        state.isPlaying = false;
        state.isDebatePlaying = false;
        updatePlayButtons();
        duckBackgroundMusic(false);
        stopBackgroundMusic();
        stopAudioVisualizer();
        if (renderer.clearActiveSpeaker) renderer.clearActiveSpeaker();
    }

    function togglePlay() {
        if (state.isPlaying) stopPodcast();
        else playPodcast();
    }

    // ========== AUDIO VISUALIZER ==========
    function startAudioVisualizer() {
        const container = document.getElementById('playerProContainer');
        if (!container) return;
        const bars = container.querySelectorAll('.waveform-bar');
        if (!bars.length) return;
        stopAudioVisualizer();
        state.audioVisualizerInterval = setInterval(function() {
            bars.forEach(function(bar, i) {
                const height = 10 + Math.sin(Date.now() / 200 + i * 0.5) * 15 + Math.random() * 10;
                bar.style.height = height + 'px';
                bar.style.background = i < 20 ? THEMES[state.currentTheme].primary : 'rgba(255,255,255,0.2)';
            });
        }, 100);
    }

    function stopAudioVisualizer() {
        if (state.audioVisualizerInterval) {
            clearInterval(state.audioVisualizerInterval);
            state.audioVisualizerInterval = null;
        }
    }

    // ========== BACKGROUND MUSIC ==========
    function playBackgroundMusic() {
        if (state.bgAudio) { state.bgAudio.pause(); state.bgAudio = null; }
        const music = BG_MUSIC[state.currentBgMusic];
        if (!music || music.url === null) return;
        state.bgAudio = new Audio(music.url);
        state.bgAudio.loop = true;
        state.bgAudio.volume = 0.15;
        state.bgAudio.play().catch(function() {});
    }

    function stopBackgroundMusic() {
        if (state.bgAudio) { state.bgAudio.pause(); state.bgAudio = null; }
    }

    // 🆕 AUTO-DUCKING — teknik mixing podcast profesional: musik latar
    // otomatis mengecil selagi ada yang bicara, naik lagi saat jeda,
    // supaya narasi/dialog tetap jelas terdengar di atas musik.
    let duckInterval = null;
    function duckBackgroundMusic(active) {
        if (!state.bgAudio) return;
        const target = active ? 0.045 : 0.15;
        if (duckInterval) clearInterval(duckInterval);
        duckInterval = setInterval(function() {
            if (!state.bgAudio) { clearInterval(duckInterval); return; }
            const diff = target - state.bgAudio.volume;
            if (Math.abs(diff) < 0.005) {
                state.bgAudio.volume = target;
                clearInterval(duckInterval);
                return;
            }
            state.bgAudio.volume = Math.max(0, Math.min(1, state.bgAudio.volume + diff * 0.3));
        }, 40);
    }

    // ========== SAVE HISTORY ==========
    function savePodcastToHistory() {
        const topic = generator.getTopic ? generator.getTopic() : (document.getElementById('topicInput') ? document.getElementById('topicInput').value : 'Topik tidak disebutkan');
        state.podcastHistory.push({
            episodeNumber: state.podcastHistory.length + 1, // 🆕 penomoran episode otomatis
            text: state.podcastText.substring(0, 200) + '...',
            fullText: state.podcastText,
            voice: state.currentVoiceType,
            agentVoice: state.currentAgentVoice,
            date: Date.now(),
            topic: topic,
            mode: state.speakerMode,
            lang: state.currentLang,
            theme: state.currentTheme,
            emotion: state.currentEmotion,
            duration: state.podcastText.length / 10,
            aiContext: state.aiContext,
            chapters: state.currentChapters,
            wordCount: state.podcastText.split(' ').length
        });
        core.saveHistory();
        updateGallery();
    }

    function loadHistoryItem(index) {
        const item = state.podcastHistory[index];
        if (!item) return;
        state.podcastText = item.fullText;
        state.originalPodcastText = item.fullText;
        state.currentVoiceType = item.voice || 'professional_male';
        state.currentLang = item.lang || 'id';
        state.speakerMode = item.mode || 'single';
        if (item.theme && THEMES[item.theme]) {
            window.Podcast.uiHandlers.applyTheme(item.theme);
        }
        if (item.emotion) {
            state.currentEmotion = item.emotion;
        }
        if (item.aiContext) {
            state.aiContext = item.aiContext;
        }
        if (item.chapters) {
            state.currentChapters = item.chapters;
        }
        showToast('📂 Memuat podcast dari ' + new Date(item.date).toLocaleString());
        renderer.render();
        const editor = document.getElementById('scriptEditor');
        if (editor) editor.value = state.podcastText;
        generator.updateAIContext();
        // renderer.renderChapters(); // 🔥 Dihapus karena fungsi tidak tersedia
    }

    // ========== BOOKMARK ==========
    function addBookmark() {
        const time = Math.floor(state.bookmarks.length * 30);
        const text = state.podcastText.substring(0, 30) + '...';
        state.bookmarks.push({ time: time, text: text, timestamp: Date.now() });
        showToast('⭐ Bookmark at ' + Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0'));
        core.saveHistory();
        renderBookmarks();
    }

    function jumpToBookmark(index) {
        const bm = state.bookmarks[index];
        if (bm) {
            showToast('⭐ Jumping to bookmark ' + (index + 1));
            skipTime(bm.time - state.audioPosition);
        }
    }

    // ========== SKIP & SPEED ==========
    function skipTime(seconds) {
        if (state.currentUtterance) {
            window.speechSynthesis.cancel();
            state.audioPosition += seconds;
            if (state.audioPosition < 0) state.audioPosition = 0;
            if (state.audioPosition > state.audioDuration) {
                state.audioDuration = state.podcastText.length / 10;
            }
            if (state.audioPosition > state.audioDuration) state.audioPosition = state.audioDuration;
            const text = state.podcastText;
            const words = text.split(' ');
            const totalWords = words.length;
            const positionRatio = state.audioPosition / state.audioDuration;
            const startIndex = Math.floor(positionRatio * totalWords);
            const remainingText = words.slice(startIndex).join(' ');
            let voiceData;
            if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
                voiceData = AGENT_VOICES[state.currentAgentVoice];
            } else {
                voiceData = VOICE_PRESETS[state.currentVoiceType] || VOICE_PRESETS.professional_male;
            }
            const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
            const pitch = Math.max(0.5, Math.min(2.0, voiceData.pitch * emotionMod.pitch));
            const rate = Math.max(0.5, Math.min(2.0, voiceData.rate * emotionMod.rate));
            const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';
            const utterance = new SpeechSynthesisUtterance(remainingText);
            utterance.lang = langCode;
            utterance.rate = rate * state.currentRate;
            utterance.pitch = pitch;
            const voiceGender = state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]
                ? core.inferAgentGender(state.currentAgentVoice)
                : (voiceData.gender === 'female' ? 'female' : 'male');
            const voice = core.getCachedVoice(langCode, voiceGender);
            if (voice) utterance.voice = voice;
            state.currentUtterance = utterance;
            utterance.onstart = function() {
                state.isPlaying = true;
                updatePlayButtons();
                startAudioVisualizer();
            };
            utterance.onend = function() {
                state.isPlaying = false;
                updatePlayButtons();
                stopAudioVisualizer();
                savePodcastToHistory();
                state.currentUtterance = null;
            };
            utterance.onerror = function() {
                state.isPlaying = false;
                updatePlayButtons();
                stopAudioVisualizer();
                state.currentUtterance = null;
            };
            window.speechSynthesis.speak(utterance);
            showToast('⏭️ Skip ' + seconds + 's (' + Math.floor(state.audioPosition) + 's)');
        } else {
            showToast('⏭️ Skip ' + seconds + 's (not playing)');
        }
    }

    function setSpeed(speed) {
        state.currentRate = parseFloat(speed);
        const label = document.getElementById('superRateLabel');
        if (label) label.textContent = speed + 'x';
        const slider = document.getElementById('superRateSlider');
        if (slider) slider.value = state.currentRate;
        showToast('⚡ Speed: ' + speed + 'x');
    }

    function togglePlayerMode() {
        state.currentPlayerMode = state.currentPlayerMode === 'pro' ? 'simple' : 'pro';
        showToast('🎧 Player mode: ' + state.currentPlayerMode);
        renderer.render();
    }

    function jumpToChapter(index) {
        const ch = state.currentChapters[index];
        if (!ch) return;
        showToast('📑 Jumping to: ' + ch.title);
        skipTime(ch.start);
    }

    // ========== RENDER WRAPPER ==========
    function render() {
        renderer.render();
    }

    // ========== EKSPOR ==========
    window.Podcast.uiPlayer = {
        render: render,
        playPodcast: playPodcast,
        stopPodcast: stopPodcast,
        togglePlay: togglePlay,
        skipTime: skipTime,
        setSpeed: setSpeed,
        togglePlayerMode: togglePlayerMode,
        addBookmark: addBookmark,
        jumpToBookmark: jumpToBookmark,
        jumpToChapter: jumpToChapter,
        loadHistoryItem: loadHistoryItem,
        savePodcastToHistory: savePodcastToHistory,
        startAudioVisualizer: startAudioVisualizer,
        stopAudioVisualizer: stopAudioVisualizer,
        playBackgroundMusic: playBackgroundMusic,
        stopBackgroundMusic: stopBackgroundMusic
    };
})();
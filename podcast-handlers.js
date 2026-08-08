/* ============================================================
   KESEMPATAN OS v18.5 — UI HANDLERS (LENGKAP)
   ✅ Semua tombol & kontrol terpasang event listener
   ✅ Debat, Single, Diskusi, Auto Schedule, Live, Download, Export, Share, Collab, AI
   ✅ Select bahasa, bg music, emotion, rate slider
   ✅ Event delegation untuk tombol preview (data-action)
   ✅ FIX: Agent button menggunakan data-agent
   ✅ Hilangkan semua console.log/warn
   ✅ TAMBAHAN: handler untuk tombol Diskusi
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (KESEMPATAN.Podcast && KESEMPATAN.Podcast.uiHandlers) return;
    KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

    const core = KESEMPATAN.Podcast.core;
    const config = KESEMPATAN.Podcast.config;
    const renderer = KESEMPATAN.Podcast.uiRenderer;
    const generator = KESEMPATAN.Podcast.uiGenerator;
    const player = KESEMPATAN.Podcast.uiPlayer;
    if (!core || !config || !renderer || !generator || !player) {
        return;
    }

    const state = core.state;
    const VOICE_PRESETS = config.VOICE_PRESETS;
    const VOICE_EMOTIONS = config.VOICE_EMOTIONS;
    const LANGUAGES = config.LANGUAGES;
    const THEMES = config.THEMES;
    const AGENT_VOICES = config.AGENT_VOICES;
    const BG_MUSIC = config.BG_MUSIC;

    const showToast = renderer.showToast;
    const sanitizeHtml = renderer.sanitizeHtml;
    const addSafeEventListener = renderer.addSafeEventListener;
    const cleanupEventListeners = renderer.cleanupEventListeners;
    const updatePlayButtons = renderer.updatePlayButtons;
    const updateGallery = renderer.updateGallery;
    const renderBookmarks = renderer.renderBookmarks;

    function setEmotion(emotion) {
        if (VOICE_EMOTIONS[emotion]) {
            state.currentEmotion = emotion;
            core.saveHistory();
            showToast('💭 Emotion: ' + VOICE_EMOTIONS[emotion].label);
            renderer.render();
        }
    }

    function exportAudio() {
        if (!state.podcastText) {
            showToast('⚠️ Generate naskah terlebih dahulu!');
            return;
        }
        let voiceData;
        if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
            voiceData = AGENT_VOICES[state.currentAgentVoice];
        } else {
            voiceData = VOICE_PRESETS[state.currentVoiceType] || VOICE_PRESETS.professional_male;
        }
        const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';
        const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
        const pitch = Math.max(0.5, Math.min(2.0, voiceData.pitch * emotionMod.pitch));
        const rate = Math.max(0.5, Math.min(2.0, voiceData.rate * emotionMod.rate));
        core.exporter.exportToMP3(state.podcastText, {
            lang: langCode,
            rate: rate,
            pitch: pitch
        }, function(progress) {
            const btn = document.getElementById('exportAudioBtn');
            if (btn) {
                btn.textContent = '⏳ ' + progress + '%';
                if (progress === 100) {
                    state.lastExportAction = { type: 'audio', time: Date.now() };
                    setTimeout(function() { if (btn) btn.textContent = '🔊 EXPORT'; }, 2000);
                }
            }
        });
    }

    function toggleCollaborative() {
        const collab = core.collab;
        if (collab.isConnected) {
            collab.disconnect();
            showToast('🌐 Disconnected from room');
            const btn = document.getElementById('collabBtn');
            if (btn) btn.style.color = THEMES[state.currentTheme].secondary;
        } else {
            const action = confirm('Buat room baru? OK=Create, Cancel=Join');
            if (action) {
                collab.createRoom(showToast);
                const btn = document.getElementById('collabBtn');
                if (btn) btn.style.color = '#00FFA3';
                collab.onMessage(function(data) {
                    if (data.text) {
                        const editor = document.getElementById('scriptEditor');
                        if (editor) {
                            editor.value = data.text;
                            state.podcastText = data.text;
                            showToast('🔄 Script synced from peer!');
                        }
                    }
                });
            } else {
                const roomId = prompt('Masukkan Room ID:');
                if (roomId) {
                    collab.joinRoom(roomId, showToast);
                    const btn = document.getElementById('collabBtn');
                    if (btn) btn.style.color = '#00FFA3';
                    collab.onMessage(function(data) {
                        if (data.text) {
                            const editor = document.getElementById('scriptEditor');
                            if (editor) {
                                editor.value = data.text;
                                state.podcastText = data.text;
                                showToast('🔄 Script synced from peer!');
                            }
                        }
                    });
                }
            }
        }
    }

    function applyTheme(theme) {
        if (!THEMES[theme]) return;
        state.currentTheme = theme;
        const t = THEMES[theme];
        document.documentElement.style.setProperty('--podcast-bg', t.bg);
        document.documentElement.style.setProperty('--podcast-primary', t.primary);
        document.documentElement.style.setProperty('--podcast-secondary', t.secondary);
        document.documentElement.style.setProperty('--podcast-text', t.text);
        document.documentElement.style.setProperty('--podcast-card', t.card);
        document.documentElement.style.setProperty('--podcast-border', t.border);
        core.saveHistory();
        showToast('🎨 Theme: ' + theme.toUpperCase());
        renderer.render();
    }

    function applyVoice(voiceKey) {
        if (VOICE_PRESETS[voiceKey]) {
            state.currentVoiceType = voiceKey;
            state.useAgentVoice = false;
            renderer.render();
            showToast('🎤 Applied: ' + VOICE_PRESETS[voiceKey].name);

            // 🔥 BARU: highlight sesaat di kartu ACTIVE supaya perpindahan
            // suara terlihat jelas, bukan cuma lewat toast yang gampang
            // terlewat. Kelas dihapus lagi setelah animasi selesai supaya
            // bisa replay lagi di perpindahan berikutnya.
            requestAnimationFrame(function() {
                const panel = document.getElementById('activeVoicePanel');
                if (panel) {
                    panel.classList.add('voice-just-switched');
                    setTimeout(function() {
                        panel.classList.remove('voice-just-switched');
                    }, 650);
                }
            });
        }
    }

    function downloadScript() {
        if (!state.podcastText) {
            showToast('⚠️ Generate naskah dulu!');
            return;
        }
        const blob = new Blob([state.podcastText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kes_podcast_' + new Date().toISOString().slice(0, 10) + '.txt';
        a.click();
        URL.revokeObjectURL(url);
        state.lastExportAction = { type: 'naskah', time: Date.now() };
        showToast('📥 Naskah diunduh!');
    }

    // ============================================================
    // 🆕 SHOW NOTES GENERATOR — deskripsi episode siap-publish (judul
    // alternatif, ringkasan, poin utama, timestamp chapter) buat
    // ditempel di YouTube/Spotify/show notes page.
    // ============================================================
    function generateShowNotes() {
        if (!state.podcastText) {
            showToast('⚠️ Generate naskah dulu!');
            return;
        }
        const topic = generator.getTopic ? generator.getTopic() : 'Topik Podcast';
        const ctx = state.aiContext || {};
        const chapters = state.currentChapters || [];
        const recs = state.currentRecommendations || [];

        const titleOptions = [
            topic + ': Apa yang Perlu Kamu Tahu',
            'Ngobrolin ' + topic + ' Bareng KESEMPATAN OS',
            topic + ' — Peluang atau Sekadar Hype?'
        ];

        function fmtTime(sec) {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60);
            return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        }

        let notes = '🎙️ SHOW NOTES — Episode #' + (state.podcastHistory.length + 1) + ' — ' + topic + '\n';
        notes += '='.repeat(40) + '\n\n';
        notes += '📌 Judul Alternatif:\n';
        titleOptions.forEach(function(t, i) { notes += (i + 1) + '. ' + t + '\n'; });
        notes += '\n📝 Deskripsi Episode:\n';
        notes += (ctx.executiveSummary || ctx.summary || ('Episode kali ini membahas ' + topic + ' secara mendalam, lengkap dengan insight dan strategi praktis.')) + '\n';

        if (recs.length > 0) {
            notes += '\n💡 Poin-Poin Utama:\n';
            recs.slice(0, 5).forEach(function(r) {
                notes += '• ' + (r.action || '') + (r.detail ? ' — ' + r.detail : '') + '\n';
            });
        }

        if (chapters.length > 0) {
            notes += '\n⏱️ Chapter:\n';
            chapters.forEach(function(c) {
                notes += fmtTime(c.start) + ' — ' + c.title + '\n';
            });
        }

        notes += '\n🔔 Subscribe KESEMPATAN OS untuk episode lainnya!\n';
        notes += '👉 youtube.com/@KESEMPATANOS • @kesempatanos • t.me/kesempatanos\n';

        const blob = new Blob([notes], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'show_notes_' + new Date().toISOString().slice(0, 10) + '.txt';
        a.click();
        URL.revokeObjectURL(url);
        state.lastExportAction = { type: 'shownotes', time: Date.now() };
        showToast('📝 Show notes siap diunduh!');
    }

    // ============================================================
    // 🆕 EXPORT SUBTITLE (.srt) — caption siap upload ke YouTube/IG/TikTok.
    // Timing diestimasi dari jumlah kata per baris (≈2.3 kata/detik,
    // disesuaikan kecepatan bicara state.currentRate) karena Web Speech
    // API tidak memberi timestamp asli per kata.
    // ============================================================
    function exportSubtitles() {
        if (!state.podcastText) {
            showToast('⚠️ Generate naskah dulu!');
            return;
        }
        const rawLines = state.podcastText.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
        const tagRe = /^\[(Host|Expert|Storyteller|Skeptic)\]\s*/i;
        const wordsPerSecond = 2.3 * (state.currentRate || 1);

        function fmtSrtTime(totalSec) {
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = Math.floor(totalSec % 60);
            const ms = Math.round((totalSec - Math.floor(totalSec)) * 1000);
            const pad = function(n, len) { return String(n).padStart(len || 2, '0'); };
            return pad(h) + ':' + pad(m) + ':' + pad(s) + ',' + pad(ms, 3);
        }

        let srt = '';
        let cursor = 0;
        let idx = 1;
        rawLines.forEach(function(line) {
            if (/^📢|^👉|^📱|^💬|^🚀/.test(line)) return; // lewati footer subscribe, bukan dialog
            const cleanLine = line.replace(tagRe, function(m) { return m.trim() + ' '; });
            const wordCount = Math.max(1, cleanLine.split(/\s+/).length);
            const duration = Math.max(1.2, wordCount / wordsPerSecond);
            const startT = cursor;
            const endT = cursor + duration;
            srt += idx + '\n' + fmtSrtTime(startT) + ' --> ' + fmtSrtTime(endT) + '\n' + cleanLine + '\n\n';
            cursor = endT + 0.15;
            idx++;
        });

        const blob = new Blob([srt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subtitle_' + new Date().toISOString().slice(0, 10) + '.srt';
        a.click();
        URL.revokeObjectURL(url);
        state.lastExportAction = { type: 'subtitle', time: Date.now() };
        showToast('🎬 Subtitle (.srt) siap diunduh! (timing estimasi)');
    }

    function sharePodcast() {
        if (!state.podcastText) {
            showToast('⚠️ Generate naskah dulu!');
            return;
        }
        if (navigator.share) {
            navigator.share({
                title: 'KESEMPATAN OS Podcast',
                text: state.podcastText.substring(0, 500) + '...',
                url: window.location.href
            }).catch(function() {});
        } else {
            navigator.clipboard.writeText(state.podcastText).then(function() {
                showToast('📋 Naskah disalin!');
            }).catch(function() {
                showToast('⚠️ Gagal menyalin');
            });
        }
    }

    function previewVoice() {
        try {
            const previewText = 'Halo Bos! Ini preview suara manusia.';
            let voiceData;
            if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
                voiceData = AGENT_VOICES[state.currentAgentVoice];
            } else {
                voiceData = VOICE_PRESETS[state.currentVoiceType] || VOICE_PRESETS.professional_male;
            }

            if (!voiceData) {
                showToast('⚠️ Suara tidak ditemukan!', 'error');
                return;
            }

            if (!window.speechSynthesis) {
                showToast('⚠️ Browser tidak mendukung Speech Synthesis', 'error');
                return;
            }

            showToast('👂 Menyiapkan voice...', 'info');
            core.waitForVoices(1500).then(function() {
                const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';
                const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
                const pitch = Math.max(0.5, Math.min(2.0, voiceData.pitch * emotionMod.pitch));
                const rate = Math.max(0.5, Math.min(2.0, voiceData.rate * emotionMod.rate));

                const utterance = new SpeechSynthesisUtterance(previewText);
                utterance.lang = langCode;
                utterance.rate = rate;
                utterance.pitch = pitch;

                const previewGender = (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice])
                    ? core.inferAgentGender(state.currentAgentVoice)
                    : (voiceData.gender === 'female' ? 'female' : 'male');
                const voice = core.getCachedVoice(langCode, previewGender);
                if (voice) utterance.voice = voice;

                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);

                const emotionLabel = VOICE_EMOTIONS[state.currentEmotion] ? VOICE_EMOTIONS[state.currentEmotion].label : 'Netral';
                showToast('👂 Preview: ' + voiceData.name + ' (' + emotionLabel + ')', 'success');
            });
        } catch(e) {
            showToast('⚠️ Gagal preview suara: ' + e.message, 'error');
        }
    }

    // 🆕 Preview suara per kursi di Podcast Room - tap avatar kursi untuk
    // dengar contoh suaranya langsung, sebelum generate naskah penuh.
    function previewSeatVoice(seatKey) {
        try {
            if (!window.speechSynthesis) {
                showToast('⚠️ Browser tidak mendukung Speech Synthesis', 'error');
                return;
            }
            let agentKey = null;
            let sampleLine = 'Halo! Ini contoh suara saya.';
            if (state.speakerMode === 'discussion' && seatKey) {
                const gender = (state.discussionGenders && state.discussionGenders[seatKey]) || 'pria';
                agentKey = 'discussion_' + seatKey.toLowerCase() + '_' + gender;
                sampleLine = 'Halo, saya ' + seatKey + '. Begini kira-kira gaya bicara saya di diskusi ini.';
            } else if (state.speakerMode === 'debate' && seatKey && AGENT_VOICES[seatKey]) {
                agentKey = seatKey;
                sampleLine = 'Halo, saya ' + AGENT_VOICES[seatKey].name.replace(/[^\w\s]/g, '').trim() + '. Siap berargumen di sesi debat ini.';
            } else {
                previewVoice();
                return;
            }
            const agentVoice = AGENT_VOICES[agentKey];
            if (!agentVoice) {
                showToast('⚠️ Voice tidak ditemukan untuk kursi ini', 'error');
                return;
            }
            const langCode = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].code : 'id-ID';
            const emotionMod = VOICE_EMOTIONS[state.currentEmotion] || VOICE_EMOTIONS.neutral;
            const pitch = Math.max(0.5, Math.min(2.0, agentVoice.pitch * emotionMod.pitch));
            const rate = Math.max(0.5, Math.min(2.0, agentVoice.rate * emotionMod.rate));
            const gender = core.inferAgentGender(agentKey);

            core.waitForVoices(1500).then(function() {
                const voice = core.getCachedVoice(langCode, gender);
                const utterance = new SpeechSynthesisUtterance(sampleLine);
                utterance.lang = langCode;
                utterance.pitch = pitch;
                utterance.rate = rate;
                utterance.volume = agentVoice.volume != null ? agentVoice.volume : 1;
                if (voice) utterance.voice = voice;

                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
                showToast('👂 Preview: ' + agentVoice.name);
            });
        } catch (e) {
            showToast('⚠️ Gagal preview suara: ' + e.message, 'error');
        }
    }

    function toggleLiveStream() {
        if (state.isLiveStreaming) {
            core.live.stopLiveStream();
            state.isLiveStreaming = false;
            const btn = document.getElementById('liveStreamBtn');
            if (btn) {
                btn.textContent = '📡 Go Live';
                btn.style.background = 'rgba(255,0,0,0.1)';
                btn.style.color = '#FF0000';
            }
        } else {
            const platform = prompt('Pilih platform: youtube, twitch, facebook, custom', 'youtube');
            if (platform) {
                core.live.startLiveStream(platform, showToast).then(function(success) {
                    if (success) {
                        state.isLiveStreaming = true;
                        const btn = document.getElementById('liveStreamBtn');
                        if (btn) {
                            btn.textContent = '📡 LIVE';
                            btn.style.background = '#FF0000';
                            btn.style.color = 'white';
                        }
                    }
                });
            }
        }
    }

    function toggleAutoSchedule() {
        state.autoScheduleActive = !state.autoScheduleActive;
        if (state.autoScheduleActive) {
            state.scheduleInterval = setInterval(function() {
                if (window.lastAggregated) {
                    generator.updateScript();
                    showToast('⏰ Auto Podcast generated!');
                    if (Notification.permission === 'granted') {
                        new Notification('KESEMPATAN OS Podcast', {
                            body: 'Podcast baru telah di-generate!',
                            icon: '🎙️'
                        });
                    }
                }
            }, 60 * 60 * 1000);
        } else {
            if (state.scheduleInterval) {
                clearInterval(state.scheduleInterval);
                state.scheduleInterval = null;
            }
        }
        const btn = document.getElementById('autoScheduleBtn');
        if (btn) {
            btn.textContent = state.autoScheduleActive ? '⏹️ Stop' : '⏰ Auto Schedule';
            btn.style.background = state.autoScheduleActive ? '#FF6B6B' : 'rgba(0,255,163,0.1)';
        }
        showToast(state.autoScheduleActive ? '⏰ Auto Schedule AKTIF!' : '⏰ Auto Schedule NONAKTIF');
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                generator.updateScript();
                showToast('⌨️ Generated!');
            }
            if (e.key === ' ' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                player.togglePlay();
            }
            if (e.key === 's' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                player.stopPodcast();
            }
            if (e.key === 'b' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                player.addBookmark();
            }
            if (e.key === 'ArrowRight' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                player.skipTime(10);
            }
            if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                player.skipTime(-10);
            }
            if (e.key >= '1' && e.key <= '9' && !e.target.matches('input, textarea, select')) {
                const voices = Object.keys(VOICE_PRESETS);
                const idx = parseInt(e.key) - 1;
                if (idx < voices.length) {
                    state.useAgentVoice = false;
                    state.currentVoiceType = voices[idx];
                    renderer.render();
                    showToast('⌨️ Voice: ' + VOICE_PRESETS[state.currentVoiceType].name);
                }
            }
        });
    }

    function render() {
        renderer.render();
    }

    let delegatedVoiceClickAttached = false;
    function attachVoiceCardDelegation() {
        if (delegatedVoiceClickAttached) return;
        delegatedVoiceClickAttached = true;
        document.addEventListener('click', function(e) {
            const voiceEl = e.target.closest('[data-voice]');
            if (voiceEl) {
                applyVoice(voiceEl.getAttribute('data-voice'));
                return;
            }
            const genderBtn = e.target.closest('.gender-toggle-btn');
            if (genderBtn) {
                const role = genderBtn.getAttribute('data-role');
                if (role) {
                    state.discussionGenders = state.discussionGenders || {};
                    const current = state.discussionGenders[role] === 'wanita' ? 'wanita' : 'pria';
                    state.discussionGenders[role] = current === 'pria' ? 'wanita' : 'pria';
                    renderer.render();
                    showToast('🚻 ' + role + ': suara ' + (state.discussionGenders[role] === 'wanita' ? 'Wanita' : 'Pria'));
                }
                return;
            }
            const seatPreviewBtn = e.target.closest('.seat-preview-btn');
            if (seatPreviewBtn) {
                const seatKey = seatPreviewBtn.getAttribute('data-preview-seat');
                previewSeatVoice(seatKey);
                return;
            }
            const shuffleBtn = e.target.closest('#shuffleVoicesBtn');
            if (shuffleBtn) {
                const roles = ['Host', 'Expert', 'Storyteller', 'Skeptic'];
                state.discussionGenders = state.discussionGenders || {};
                roles.forEach(function(role) {
                    state.discussionGenders[role] = Math.random() < 0.5 ? 'pria' : 'wanita';
                });
                renderer.render();
                showToast('🔀 Suara karakter diacak ulang!');
                return;
            }
            const agentEl = e.target.closest('[data-agent]') || e.target.closest('[data-agent-voice]');
            if (agentEl) {
                const agentKey = agentEl.getAttribute('data-agent') || agentEl.getAttribute('data-agent-voice');
                if (AGENT_VOICES[agentKey]) {
                    state.currentAgentVoice = agentKey;
                    state.useAgentVoice = true;
                    renderer.render();
                    showToast('🤖 Agent voice: ' + AGENT_VOICES[agentKey].name);
                }
            }
        });
    }

    function attachEvents() {
        cleanupEventListeners();
        attachVoiceCardDelegation();

        const previewBtn = document.getElementById('voicePreviewBtn')
            || document.getElementById('previewVoiceBtn')
            || document.getElementById('btnPreviewVoice');
        if (previewBtn) {
            addSafeEventListener(previewBtn, 'click', previewVoice);
        } else {
            document.querySelectorAll('button').forEach(function(btn) {
                if (btn.textContent && btn.textContent.trim().indexOf('Preview') !== -1) {
                    addSafeEventListener(btn, 'click', previewVoice);
                }
            });
        }

        const generateBtn = document.getElementById('superGenerateBtn');
        if (generateBtn) {
            addSafeEventListener(generateBtn, 'click', function(e) {
                e.preventDefault();
                generator.updateScript();
            });
        }
        const playBtn = document.getElementById('superPlayBtn');
        if (playBtn) {
            addSafeEventListener(playBtn, 'click', function(e) {
                e.preventDefault();
                player.togglePlay();
            });
        }
        const stopBtn = document.getElementById('superStopBtn');
        if (stopBtn) {
            addSafeEventListener(stopBtn, 'click', function(e) {
                e.preventDefault();
                player.stopPodcast();
            });
        }

        const debateBtn = document.getElementById('debateModeBtn');
        if (debateBtn) {
            addSafeEventListener(debateBtn, 'click', function(e) {
                e.preventDefault();
                state.speakerMode = 'debate';
                renderer.render();
                showToast('🎤 Mode Debat aktif');
            });
        }
        const singleBtn = document.getElementById('singleModeBtn');
        if (singleBtn) {
            addSafeEventListener(singleBtn, 'click', function(e) {
                e.preventDefault();
                state.speakerMode = 'single';
                renderer.render();
                showToast('🗣️ Mode Single aktif');
            });
        }
        // ===== HANDLER DISKUSI (BARU) =====
        const discussionBtn = document.getElementById('discussionModeBtn');
        if (discussionBtn) {
            addSafeEventListener(discussionBtn, 'click', function(e) {
                e.preventDefault();
                state.speakerMode = 'discussion';
                renderer.render();
                showToast('💬 Mode Diskusi Ruangan aktif');
            });
        }

        const autoBtn = document.getElementById('autoScheduleBtn');
        if (autoBtn) {
            addSafeEventListener(autoBtn, 'click', function(e) {
                e.preventDefault();
                toggleAutoSchedule();
            });
        }
        const liveBtn = document.getElementById('liveStreamBtn');
        if (liveBtn) {
            addSafeEventListener(liveBtn, 'click', function(e) {
                e.preventDefault();
                toggleLiveStream();
            });
        }

        const downloadBtn = document.getElementById('superDownloadBtn');
        if (downloadBtn) {
            addSafeEventListener(downloadBtn, 'click', function(e) {
                e.preventDefault();
                downloadScript();
            });
        }
        const showNotesBtn = document.getElementById('showNotesBtn');
        if (showNotesBtn) {
            addSafeEventListener(showNotesBtn, 'click', function(e) {
                e.preventDefault();
                generateShowNotes();
            });
        }
        const subtitleBtn = document.getElementById('subtitleExportBtn');
        if (subtitleBtn) {
            addSafeEventListener(subtitleBtn, 'click', function(e) {
                e.preventDefault();
                exportSubtitles();
            });
        }
        const exportBtn = document.getElementById('exportAudioBtn');
        if (exportBtn) {
            addSafeEventListener(exportBtn, 'click', function(e) {
                e.preventDefault();
                exportAudio();
            });
        }
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            addSafeEventListener(shareBtn, 'click', function(e) {
                e.preventDefault();
                sharePodcast();
            });
        }
        const collabBtn = document.getElementById('collabBtn');
        if (collabBtn) {
            addSafeEventListener(collabBtn, 'click', function(e) {
                e.preventDefault();
                toggleCollaborative();
            });
        }
        const aiBtn2 = document.getElementById('aiGenerateBtn2');
        if (aiBtn2) {
            addSafeEventListener(aiBtn2, 'click', function(e) {
                e.preventDefault();
                generator.updateScriptWithAI();
            });
        }

        const rateSlider = document.getElementById('superRateSlider');
        if (rateSlider) {
            addSafeEventListener(rateSlider, 'input', function(e) {
                const val = parseFloat(e.target.value);
                player.setSpeed(val);
            });
        }

        const langSelect = document.getElementById('langSelect');
        if (langSelect) {
            addSafeEventListener(langSelect, 'change', function(e) {
                state.currentLang = e.target.value;
                core.saveHistory();
                renderer.render();
                showToast('🌍 Language: ' + LANGUAGES[state.currentLang].name);
            });
        }
        const bgSelect = document.getElementById('bgMusicSelect');
        if (bgSelect) {
            addSafeEventListener(bgSelect, 'change', function(e) {
                state.currentBgMusic = e.target.value;
                core.saveHistory();
                showToast('🎵 Background: ' + BG_MUSIC[state.currentBgMusic].name);
            });
        }
        const emotionSelect = document.getElementById('emotionSelect');
        if (emotionSelect) {
            addSafeEventListener(emotionSelect, 'change', function(e) {
                setEmotion(e.target.value);
            });
        }

        document.querySelectorAll('.debate-agent-select').forEach(function(btn) {
            addSafeEventListener(btn, 'click', function(e) {
                const agentKey = this.getAttribute('data-agent');
                if (!agentKey) return;
                const idx = state.debateAgents.indexOf(agentKey);
                if (idx !== -1) {
                    state.debateAgents.splice(idx, 1);
                } else {
                    if (state.debateAgents.length >= 5) {
                        showToast('⚠️ Maksimal 5 agen');
                        return;
                    }
                    state.debateAgents.push(agentKey);
                }
                renderer.render();
                showToast('👥 Agen: ' + state.debateAgents.join(', '));
            });
        });

        if (!window.__previewActionListener) {
            window.__previewActionListener = true;
            document.addEventListener('click', function(e) {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                const action = target.getAttribute('data-action');
                const ai = core.ai;
                const generator = KESEMPATAN.Podcast.uiGenerator;
                const state = core.state;
                const showToast = renderer.showToast;
                const LANGUAGES = config.LANGUAGES;
                const THEMES = config.THEMES;
                const sanitizeHtml = renderer.sanitizeHtml;

                // 🔥 FIX: dulu tombol GEN/ENHANCE/IMPROVE/Q&A/TRANSLATE/RESET
                // ini TIDAK melewati render() sama sekali — mereka langsung
                // ubah innerHTML #aiContextContainer/#recommendationsContainer
                // lewat updateAIContext(), jadi perbaikan penjaga scroll yang
                // sudah ada di render() TIDAK berlaku di sini. Kalau konten
                // itu berubah tinggi (misal "AI Context" box baru muncul),
                // semua di bawahnya ikut bergeser tanpa transisi halus.
                // Sekarang posisi scroll disimpan di sini juga, dipulihkan
                // setelah update selesai.
                const savedScrollY_actionBtn = window.scrollY;
                const restoreScroll_actionBtn = function() {
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            window.scrollTo(0, savedScrollY_actionBtn);
                        });
                    });
                };

                switch (action) {
                    case 'reset':
                        state.podcastText = state.originalPodcastText || state.podcastText;
                        const editorReset = document.getElementById('scriptEditor');
                        if (editorReset) editorReset.value = state.podcastText;
                        showToast('📝 Naskah direset!');
                        if (generator) generator.updateAIContext();
                        break;
                    case 'ai-generate':
                        const topicInput = document.getElementById('podcastTopicInput') || document.getElementById('topicInput');
                        const topic = topicInput ? topicInput.value : 'bisnis digital';
                        const newText = ai.generateText('Buat podcast tentang ' + topic + ' untuk pengusaha.', 800, 0.7);
                        const editorGen = document.getElementById('scriptEditor');
                        if (editorGen) {
                            editorGen.value = newText;
                            state.podcastText = newText;
                            state.originalPodcastText = newText;
                            showToast('🤖 AI generated new script!');
                            if (generator) generator.updateAIContext();
                        }
                        break;
                    case 'enhance':
                        const editorEnh = document.getElementById('scriptEditor');
                        if (editorEnh) {
                            const enhanced = ai.improveScript(editorEnh.value, 'professional');
                            editorEnh.value = enhanced;
                            state.podcastText = enhanced;
                            showToast('✨ Naskah di-enhance!');
                            if (generator) generator.updateAIContext();
                        }
                        break;
                    case 'improve':
                        const editorImp = document.getElementById('scriptEditor');
                        if (editorImp) {
                            const style = prompt('Pilih style: professional, casual, inspiring', 'professional');
                            const improved = ai.improveScript(editorImp.value, style || 'professional');
                            editorImp.value = improved;
                            state.podcastText = improved;
                            showToast('⭐ Improved with ' + style + ' style!');
                            if (generator) generator.updateAIContext();
                        }
                        break;
                    case 'qa':
                        const editorQa = document.getElementById('scriptEditor');
                        if (editorQa) {
                            const numQ = parseInt(prompt('Jumlah pertanyaan? (1-5)', '3')) || 3;
                            const qa = ai.generateQA(editorQa.value, Math.min(numQ, 5));
                            const container = document.getElementById('qaContainer');
                            if (container) {
                                let qaHtml = '';
                                for (let i = 0; i < qa.length; i++) {
                                    const q = qa[i];
                                    qaHtml += '<div style="margin-bottom:6px; padding:4px; background:rgba(0,0,0,0.2); border-radius:4px;"><div style="color:' + THEMES[state.currentTheme].primary + '; font-size:9px; font-weight:bold;">Q' + (i+1) + ': ' + sanitizeHtml(q.question) + '</div><div style="color:' + THEMES[state.currentTheme].text + '; opacity:0.7; font-size:8px;">A: ' + sanitizeHtml(q.answer) + '</div></div>';
                                }
                                container.innerHTML = `
                                    <div style="background:rgba(255,107,107,0.1); border-radius:8px; padding:8px; border:1px solid #FF6B6B44;">
                                        <div style="color:#FF6B6B; font-size:10px; margin-bottom:4px;">❓ AI Q&A</div>
                                        ${qaHtml}
                                    </div>
                                `;
                                showToast('❓ Generated ' + qa.length + ' Q&A pairs!');
                            }
                        }
                        break;
                    case 'translate':
                        const editorTr = document.getElementById('scriptEditor');
                        if (editorTr) {
                            const target = prompt('Pilih bahasa: en, id, ms, zh, ja, ko, es, fr, de, ar, hi, pt, ru, it', 'en');
                            if (target && LANGUAGES[target]) {
                                const translated = ai.translate(editorTr.value, target);
                                editorTr.value = translated;
                                state.podcastText = translated;
                                showToast('🌍 Translated to ' + LANGUAGES[target].name + '!');
                                if (generator) generator.updateAIContext();
                            }
                        }
                        break;
                }

                restoreScroll_actionBtn();
            });
        }
    }

    KESEMPATAN.Podcast.uiHandlers = {
        render: render,
        attachEvents: attachEvents,
        setupKeyboardShortcuts: setupKeyboardShortcuts,
        setEmotion: setEmotion,
        exportAudio: exportAudio,
        toggleCollaborative: toggleCollaborative,
        applyTheme: applyTheme,
        applyVoice: applyVoice,
        downloadScript: downloadScript,
        generateShowNotes: generateShowNotes,
        exportSubtitles: exportSubtitles,
        sharePodcast: sharePodcast,
        previewVoice: previewVoice,
        toggleLiveStream: toggleLiveStream,
        toggleAutoSchedule: toggleAutoSchedule,
        updateScript: generator.updateScript,
        updateScriptWithAI: generator.updateScriptWithAI,
        generatePodcastText: generator.generatePodcastText,
        updateAIContext: generator.updateAIContext,
        playPodcast: player.playPodcast,
        stopPodcast: player.stopPodcast,
        togglePlay: player.togglePlay,
        skipTime: player.skipTime,
        setSpeed: player.setSpeed,
        addBookmark: player.addBookmark,
        jumpToBookmark: player.jumpToBookmark,
        togglePlayerMode: player.togglePlayerMode,
        loadHistoryItem: player.loadHistoryItem,
        jumpToChapter: player.jumpToChapter,
        savePodcastToHistory: player.savePodcastToHistory
    };
})();
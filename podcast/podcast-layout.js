import { HUMAN_VOICES as VOICE_PRESETS, VOICE_EMOTIONS, LANGUAGES, THEMES, BG_MUSIC, AGENT_VOICES } from './podcast-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

// ============================================================
// VOICE ACTIVE PANEL + LIBRARY WORKFLOW
// ============================================================
const RECENT_KEY = 'kesempatan_voice_recent';
const FAV_KEY = 'kesempatan_voice_favorites';

function safeLSGet(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
}
function safeLSSet(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (_) { console.warn('[Podcast] Non-fatal error:', _.message); }
}

// Dicatat sebagai efek samping ringan saat render (BUKAN di ui-handlers.js,
// yang tidak boleh disentuh) - satu-satunya cara aman melacak "baru dipakai"
// tanpa mengubah applyVoice() yang sudah frozen.
function recordRecentVoice(voiceKey) {
    if (!voiceKey) return;
    let recent = safeLSGet(RECENT_KEY);
    recent = recent.filter(function(k) { return k !== voiceKey; });
    recent.unshift(voiceKey);
    safeLSSet(RECENT_KEY, recent.slice(0, 5));
}

// Panel Voice Aktif — permanen, selalu terlihat, TERPISAH dari Library
function buildActiveVoicePanel(state, theme) {
    let voiceData, name, emoji, desc;
    if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
        voiceData = AGENT_VOICES[state.currentAgentVoice];
        const parts = String(voiceData.name).split(' ');
        emoji = parts[0] || '🎤';
        name = parts.slice(1).join(' ') || voiceData.name;
        desc = voiceData.desc || 'Karakter agen';
    } else {
        voiceData = VOICE_PRESETS[state.currentVoiceType] || VOICE_PRESETS.professional_male;
        emoji = voiceData.emoji || '🎤';
        name = voiceData.name.replace(/[^\w\s]/g, '').trim();
        desc = voiceData.desc || '-';
        recordRecentVoice(state.currentVoiceType);
    }
    const langLabel = LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].label : state.currentLang;
    return `
        <div class="desk-console" style="padding:4px; margin:0 0 12px;">
            <div class="desk-channel" id="activeVoicePanel" style="padding:12px 10px;">
                <span style="font-size:30px; flex-shrink:0;">${emoji}</span>
                <div style="flex:1; min-width:0;">
                    <div class="desk-label" style="text-align:left;">CH.01 — VOICE ENGINE</div>
                    <div class="desk-title" style="color:${theme.primary};">${name}</div>
                    <div class="desk-readout" style="color:${theme.text}; opacity:0.5;">${desc} · ${langLabel} · ${state.currentRate}x</div>
                </div>
                <span style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
                    <span class="desk-indicator on" style="background:${theme.primary};"></span>
                    <span class="desk-status on">ACTIVE</span>
                </span>
            </div>
        </div>
    `;
}

// ============================================================
// 🆕 PODCAST ROOM — visual "ruang podcast" dengan kursi pembicara
// yang menyala saat gilirannya bicara (di-update oleh ui-player.js
// lewat renderer.setActiveSpeaker / clearActiveSpeaker, bukan lewat
// render ulang penuh, supaya animasi mulus saat sedang diputar).
// ============================================================
function buildPodcastRoom(state, theme) {
    let seats = [];
    if (state.speakerMode === 'discussion') {
        const genders = state.discussionGenders || {};
        const roleIcons = { Host: '🎙️', Expert: '📊', Storyteller: '📖', Skeptic: '🤔' };
        seats = ['Host', 'Expert', 'Storyteller', 'Skeptic'].map(function(role) {
            const gender = genders[role] === 'wanita' ? 'wanita' : 'pria';
            return { key: role, label: role, icon: roleIcons[role], gender: gender };
        });
    } else if (state.speakerMode === 'debate') {
        seats = (state.debateAgents || []).slice(0, 5).map(function(key) {
            const info = AGENT_VOICES[key] || { name: key };
            const parts = String(info.name).split(' ');
            return { key: key, label: parts.slice(1).join(' ') || info.name, icon: parts[0] || '🎙️' };
        });
        if (seats.length === 0) {
            seats = [{ key: 'none', label: 'Pilih agen debat', icon: '👥' }];
        }
    } else {
        let label = 'Narator';
        let icon = '🎙️';
        if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
            const info = AGENT_VOICES[state.currentAgentVoice];
            const parts = String(info.name).split(' ');
            icon = parts[0] || '🎙️';
            label = parts.slice(1).join(' ') || info.name;
        } else if (VOICE_PRESETS[state.currentVoiceType]) {
            const info = VOICE_PRESETS[state.currentVoiceType];
            icon = info.emoji || '🎙️';
            label = info.name.replace(/[^\w\s]/g, '').trim();
        }
        seats = [{ key: 'Narator', label: label, icon: icon }];
    }

    const seatsHtml = seats.map(function(seat) {
        const genderChip = seat.gender ? `
            <button class="gender-toggle-btn" data-role="${seat.key}" style="margin-top:5px; font-size:10px; padding:5px 12px; min-height:26px; border-radius:12px; border:none; background:rgba(255,255,255,0.1); color:${theme.text}; opacity:0.9; cursor:pointer; touch-action:manipulation;">
                ${seat.gender === 'wanita' ? '👩 Wanita' : '👨 Pria'}
            </button>
        ` : '';
        return `
            <div class="podcast-seat" data-seat="${seat.key}" style="display:flex; flex-direction:column; align-items:center; width:72px;">
                <div class="seat-ring seat-preview-btn" data-preview-seat="${seat.key}" style="width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); transition:all 0.25s; cursor:pointer; touch-action:manipulation;">${seat.icon}</div>
                <div style="font-size:9px; margin-top:6px; color:${theme.text}; text-align:center; max-width:72px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; opacity:0.85;">${seat.label}</div>
                ${genderChip}
                <div class="seat-wave" style="display:flex; gap:2px; height:10px; margin-top:3px; opacity:0; align-items:flex-end;">
                    <span style="width:2px; background:${theme.primary}; border-radius:1px; animation: podcastWave 0.6s ease-in-out infinite;"></span>
                    <span style="width:2px; background:${theme.primary}; border-radius:1px; animation: podcastWave 0.6s ease-in-out infinite 0.15s;"></span>
                    <span style="width:2px; background:${theme.primary}; border-radius:1px; animation: podcastWave 0.6s ease-in-out infinite 0.3s;"></span>
                </div>
            </div>
        `;
    }).join('');

    const agg = window.lastAggregated;
    const aiSources = state.aiSourcesUsed || { world: 0, memory: 0, database: 0, internal: false };
    const sourceChip = function(label, icon, active) {
        return '<span style="display:inline-flex; align-items:center; gap:2px; font-size:8px; padding:2px 6px; border-radius:8px; background:' +
            (active ? theme.primary + '22' : 'rgba(255,255,255,0.04)') + '; color:' + (active ? theme.primary : theme.text) +
            '; opacity:' + (active ? '1' : '0.35') + ';">' + label + '</span>';
    };

    return `
        <style>
            @keyframes podcastWave { 0%,100%{height:4px;} 50%{height:10px;} }
            @keyframes podcastPulse { 0%,100%{box-shadow:0 0 0 0 ${theme.primary}55;} 50%{box-shadow:0 0 0 6px ${theme.primary}00;} }
            @keyframes seatBreathe { 0%,100%{opacity:0.85; transform:scale(1);} 50%{opacity:1; transform:scale(1.03);} }
            .podcast-seat .seat-ring { animation: seatBreathe 3.2s ease-in-out infinite; }
            .podcast-seat:nth-child(2) .seat-ring { animation-delay: 0.4s; }
            .podcast-seat:nth-child(3) .seat-ring { animation-delay: 0.8s; }
            .podcast-seat:nth-child(4) .seat-ring { animation-delay: 1.2s; }
            .podcast-seat:nth-child(5) .seat-ring { animation-delay: 1.6s; }
        </style>
        <div id="podcastRoom" style="position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span id="onAirDot" style="width:8px; height:8px; border-radius:50%; background:${state.isPlaying ? '#FF3B30' : '#555'}; ${state.isPlaying ? 'animation:podcastPulse 1s ease-in-out infinite;' : ''}"></span>
                    <span id="onAirLabel" style="font-size:10px; font-weight:bold; letter-spacing:0.5px; color:${state.isPlaying ? '#FF3B30' : theme.text}; opacity:${state.isPlaying ? 1 : 0.4};">${state.isPlaying ? 'ON AIR' : 'STUDIO'}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${state.speakerMode === 'discussion' ? '<button id="shuffleVoicesBtn" style="font-size:8px; padding:3px 8px; border-radius:10px; border:none; background:rgba(255,255,255,0.06); color:' + theme.text + '; opacity:0.8; cursor:pointer;">🔀 Acak Suara</button>' : ''}
                </div>
            </div>

            <!-- 🆕 STATUS INTEGRASI AI INTERNAL -->
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
                <span style="font-size:8px; color:${theme.text}; opacity:0.4;"> AI Internal :</span>
                ${sourceChip('World', '🌐', aiSources.world > 0)}
                ${sourceChip('Memory', '💾', aiSources.memory > 0)}
                ${sourceChip('Database', '🗄️', aiSources.database > 0)}
                ${agg ? sourceChip('Skor ' + agg.score, '📊', true) : ''}
            </div>

            <!-- 🔥 FIX: dulu tanpa min-height, container ini berubah
                 tinggi drastis tergantung mode (1 kursi Single vs 4
                 kursi+tombol gender Diskusi vs 5 kursi Debat) — karena
                 section ini ada DI ATAS tombol Debat/Single/Diskusi,
                 perubahan tingginya mendorong tombol itu sendiri naik/
                 turun, terasa seperti "tombol bergerak" padahal
                 tombolnya sendiri diam, cuma didorong dari atas.
                 min-height menjamin ruang yang sama dipakai di semua
                 mode (dihitung dari skenario terbesar: kursi + tombol
                 gender + indikator gelombang suara). -->
            <div id="podcastSeats" style="display:flex; gap:14px; justify-content:center; flex-wrap:wrap; padding:6px 0 14px; position:relative; min-height:232px; transition:min-height 280ms ease;">
                ${seatsHtml}
            </div>
            <div id="podcastCaptions" class="desk-screen" style="padding:10px 12px; min-height:20px; font-size:11px; color:${theme.text}; line-height:1.5;">
                <span style="opacity:0.35;">💬 Transkrip langsung muncul di sini saat diputar...</span>
            </div>
        </div>
    `;
}

// ============================================================
// 🆕 TOP STATUS BAR — pill modern, SEMUA DATA REAL (bukan dummy):
// Status AI, Episode, Jumlah Kata, Lama Generate, Voice Aktif,
// Recording Status, Export Status. Fungsi modular baru di dalam file
// yang sudah ada (tidak membuat file baru), dipanggil dari
// buildPodcastLayout di bawah.
// ============================================================
function buildTopStatusBar(state, theme) {
    const aiStatus = state.isGenerating
        ? { label: 'Generating', icon: '🧠', color: '#FFB020' }
        : (state.isPlaying ? { label: 'Recording', icon: '🔴', color: '#FF3B30' } : { label: 'Idle', icon: '⚪', color: theme.primary });

    const episodeNum = (state.podcastHistory ? state.podcastHistory.length : 0) + (state.podcastText ? 1 : 0);
    const wordCount = state.podcastText ? state.podcastText.trim().split(/\s+/).filter(Boolean).length : 0;
    const genDuration = state.lastGenerateDurationMs ? (state.lastGenerateDurationMs / 1000).toFixed(1) + 's' : '-';

    let voiceLabel = '-';
    if (state.useAgentVoice && state.currentAgentVoice && AGENT_VOICES[state.currentAgentVoice]) {
        voiceLabel = AGENT_VOICES[state.currentAgentVoice].name.replace(/[^\w\s()]/g, '').trim();
    } else if (VOICE_PRESETS[state.currentVoiceType]) {
        voiceLabel = VOICE_PRESETS[state.currentVoiceType].name.replace(/[^\w\s]/g, '').trim();
    }

    const recStatus = state.isPlaying ? { label: 'ON AIR', color: '#FF3B30', pulse: true } : { label: 'Standby', color: theme.text, pulse: false };

    let exportLabel = 'Belum ada';
    if (state.lastExportAction) {
        const secondsAgo = Math.max(0, Math.round((Date.now() - state.lastExportAction.time) / 1000));
        const timeLabel = secondsAgo < 60 ? secondsAgo + 'd lalu' : Math.round(secondsAgo / 60) + 'm lalu';
        const typeLabels = { naskah: 'Naskah', audio: 'Audio', subtitle: 'Subtitle', shownotes: 'Show Notes' };
        exportLabel = (typeLabels[state.lastExportAction.type] || state.lastExportAction.type) + ' • ' + timeLabel;
    }

    const pill = function(label, value, statusClass) {
        return `
            <div style="display:flex; align-items:center; gap:4px; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:3px 8px; white-space:nowrap; flex-shrink:0;">
                <span style="font-size:6.5px; color:${theme.text}; opacity:0.35; text-transform:uppercase; letter-spacing:0.2px;">${label}</span>
                <span class="${statusClass ? 'desk-status ' + statusClass : 'desk-readout'}" style="${statusClass ? '' : 'color:' + theme.text + '; opacity:0.75;'}">${value}</span>
            </div>
        `;
    };

    const aiStatusClass = state.isGenerating ? 'warn' : (state.isPlaying ? 'error' : 'on');
    const recStatusClass = state.isPlaying ? 'error' : 'off';

    return `
        <div class="studio-hud-strip" style="justify-content:flex-start; margin-bottom:2px;">
            ${pill('AI', aiStatus.label, aiStatusClass)}
            ${pill('Ep', '#' + episodeNum)}
            ${pill('Kata', wordCount)}
            ${pill('Gen', genDuration)}
            ${pill('Voice', voiceLabel)}
            ${pill('Rec', recStatus.label, recStatusClass)}
            ${pill('Exp', exportLabel)}
        </div>
    `;
}

function buildPodcastLayout(state) {
    const theme = THEMES[state.currentTheme] || THEMES.dark;
    const totalVoices = Object.keys(VOICE_PRESETS).length;
    const totalLangs = Object.keys(LANGUAGES).length;
    const collab = KESEMPATAN.Podcast.core ? KESEMPATAN.Podcast.core.collab : { isConnected: false, roomId: null };

    return `
        <style>
            /* ================================================================
               KESEMPATAN OS DESIGN SYSTEM — BASELINE (dibekukan di Tahap Final)
               ================================================================
               Semua fitur baru WAJIB mengikuti bahasa desain di bawah ini,
               bukan membuat gaya baru. Referensi cepat:

               PANEL
                 desk-console  → chassis utama (Meja Mixing), radius 18px
                 desk-unit     → seam-divided section di dalam desk-console
                 desk-screen   → layar tertanam gelap (waveform, topic input)
                 desk-monitor  → panel monitoring, radius 12px, material sama
                                  dengan desk-screen
                 desk-channel  → baris channel (Voice Engine, Project rows)
                 studio-secondary-panel → panel sekunder redup (Settings,
                                  Voice Library, Gallery), radius 12px
                 dashboard-continuous  → chassis gabungan Settings s/d
                                  Projects, satu chassis bukan kartu terpisah

               TYPOGRAPHY (4 level, jangan campur)
                 desk-title    → L1, nama/nilai utama
                 desk-label    → L2, header seksi gaya silkscreen (uppercase,
                                  letter-spacing 2px, monospace)
                 desk-readout  → L3, nilai/angka mesin (monospace)
                 desk-metadata → L4, teks pendukung paling kecil/redup

               STATUS
                 desk-status (+ .on/.warn/.error/.off) → satu komponen untuk
                 SEMUA status (ACTIVE/READY/ONLINE/PLAYING/STANDBY/dst).
                 Warna: hijau=on, kuning=warn, merah=error, abu=off. Tidak
                 ada warna status lain di luar 4 ini.
                 desk-indicator → dot LED (dipasangkan dengan desk-status)

               MOTION
                 --motion-fast (120ms) / --motion-normal (240ms) /
                 --motion-slow (1000ms), semua pakai --motion-ease yang sama.
                 Hover = brightness/border-glow saja, tidak ada scale.
                 Selected/active = opacity atau glow pelan, tidak ada blink.

               SPACING & RADIUS
                 Radius keluarga: 18px (console/outer), 12px (screen/monitor/
                 secondary-panel), 8-10px (chip/tombol kecil). Jangan buat
                 angka radius baru di luar skala ini.
                 Antar section dalam satu chassis: separator 1px opacity
                 rendah, bukan gap/margin besar.

               SHADOW
                 Console: inset + outer glow tipis dari theme.primary.
                 Screen/monitor: inset shadow gelap + edge-highlight 1px.
                 Jangan ada glow yang lebih besar dari milik desk-console.

               COLOR
                 Hijau (theme.primary) adalah SATU-SATUNYA sumber cahaya/
                 aksen. Semua panel dapat wash hijau sangat tipis (3-5%)
                 sebagai "signature power state", bukan neon acak.
               ================================================================ */
            /* ============================================================
               STUDIO ENVIRONMENT — TAHAP 1.5
               Prinsip dari referensi ruang: cahaya menjiplak BATAS
               struktur (bukan mengisi semua ruang), depth lewat
               gelap-terang berlapis, satu pusat gravitasi visual.
               ============================================================ */
            @keyframes studioLedPulse { 0%,100% { opacity:0.45; } 50% { opacity:0.9; } }
            @keyframes ringGlowPulse { 0%,100% { opacity:0.5; transform:scale(1); } 50% { opacity:0.85; transform:scale(1.03); } }

            /* ============================================================
               🎬 TAHAP 6 — MOTION VOCABULARY
               Satu sistem durasi/easing untuk SELURUH aplikasi. Tidak ada
               animasi "melompat" - semua transisi pakai token yang sama.
               ============================================================ */
            /* Vignette full-halaman: gelap di tepi, konsentrasi cahaya
               di area Meja Mixing - meniru "titik hilang" perspektif ruang */
            .studio-atmosphere {
                --motion-fast: 120ms;
                --motion-normal: 240ms;
                --motion-slow: 1000ms;
                --motion-ease: cubic-bezier(0.4, 0, 0.2, 1);
                scroll-behavior: smooth;
                position: relative;
                background:
                    radial-gradient(ellipse 140% 45% at 50% 0%, ${theme.primary}14, transparent 60%),
                    radial-gradient(ellipse 140% 80% at 50% 95%, ${theme.primary}0c, transparent 75%),
                    radial-gradient(ellipse 100% 60% at 50% 100%, rgba(0,0,0,0.35), transparent 70%);
            }
            .studio-atmosphere::before {
                content: '';
                position: fixed; top: 0; left: 0; right: 0; height: 1.5px;
                background: linear-gradient(90deg, transparent, ${theme.primary}, transparent);
                box-shadow: 0 0 10px 1px ${theme.primary}88;
                animation: studioLedPulse 4s ease-in-out infinite;
                z-index: 1; pointer-events: none;
            }

            /* Watermark identitas - bukan lagi blok warna, cuma jejak
               cahaya samar di balik Meja Mixing (echo dari layar
               KESEMPATAN OS di referensi, bukan banner UI) */
            .studio-watermark {
                text-align: center; padding: 6px 0 2px;
                font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
                color: ${theme.primary}; opacity: 0.35; font-weight: 700;
            }

            /* Ring glow di balik Meja Mixing - echo dari ring lantai
               neon di referensi ruang, sumber cahaya utama halaman */
            .desk-console-ring {
                position: absolute; left: 50%; top: 50%;
                width: 130%; height: 85%;
                transform: translate(-50%, -50%);
                background: radial-gradient(ellipse at center, ${theme.primary}22, transparent 68%);
                filter: blur(2px);
                animation: ringGlowPulse 3.5s ease-in-out infinite;
                pointer-events: none; z-index: 0;
            }

            /* ===== MEJA MIXING — satu-satunya pusat gravitasi visual ===== */
            .desk-console {
                position: relative; overflow: visible;
                background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)),
                    repeating-linear-gradient(135deg, rgba(255,255,255,0.008) 0px, rgba(255,255,255,0.008) 1px, transparent 1px, transparent 10px);
                backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
                border: 1px solid ${theme.primary}40;
                border-radius: 18px;
                padding: 4px;
                margin: 4px 0 18px;
                box-shadow: 0 0 0 1px ${theme.primary}1a, 0 16px 50px rgba(0,0,0,0.45), 0 0 90px -15px ${theme.primary}55;
            }

            /* ============================================================
               🔠 TAHAP 5.2 — TYPOGRAPHY HIERARCHY (satu sistem, 4 level)
               ============================================================ */
            /* LEVEL 1 — Console Title (identitas utama halaman) */
            .desk-title {
                font-size: 13px; font-weight: 700; letter-spacing: 0.3px;
                color: ${theme.text};
            }
            /* LEVEL 2 — Channel/Section label, gaya silkscreen dicetak di panel */
            .desk-label {
                font-size: 8px; letter-spacing: 2px; text-transform: uppercase;
                color: ${theme.primary}; opacity: 0.6; text-align: center;
                font-family: 'Courier New', monospace;
                position: relative; z-index: 1;
            }
            /* LEVEL 3 — Readout (angka/nilai mesin: latency, memory, plays, dst) */
            .desk-readout {
                font-family: 'Courier New', monospace;
                font-size: 9px; letter-spacing: 0.5px;
            }
            /* LEVEL 4 — Metadata (teks pendukung paling kecil/redup) */
            .desk-metadata {
                font-size: 8px; color: ${theme.text}; opacity: 0.35;
            }

            .desk-console > *:not(.desk-console-ring) { position: relative; z-index: 1; }
            /* Satu "unit" chassis dalam meja mixing - seam/groove sebagai
               pemisah antar komponen, BUKAN gap/margin seperti kartu terpisah */
            .desk-unit {
                padding: 12px 14px;
                border-top: 1px solid rgba(255,255,255,0.05);
            }
            .desk-unit:first-child { border-top: none; }
            /* ============================================================
               🎚️ TAHAP 8 — PANEL DEPTH SYSTEM
               4 level kedalaman, satu bahasa shadow: makin dalam level,
               makin gelap inset-nya, tapi resep (inset + edge-highlight)
               sama untuk semua supaya terasa satu keluarga material.
               ============================================================ */
            /* LEVEL 2 — Desk Screen/Monitor: kaca monitor hardware.
               Edge-highlight tipis di atas (reflection), inset shadow
               dalam, TANPA blur berlebihan. */
            .desk-screen, .desk-monitor {
                background: linear-gradient(180deg, ${theme.primary}04, rgba(0,0,0,0.4) 40%);
                border-radius: 12px;
                position: relative;
                box-shadow: inset 0 0 22px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05);
            }
            /* Glass reflection sangat tipis - garis cahaya diagonal halus
               menyeberang layar, seperti pantulan kaca monitor asli */
            .desk-screen::before, .desk-monitor::before {
                content: ''; position: absolute; inset: 0; border-radius: inherit;
                background: linear-gradient(115deg, rgba(255,255,255,0.025) 0%, transparent 18%);
                pointer-events: none;
            }
            /* LEVEL 3 — Monitoring: sedikit lebih dangkal dari layar utama */
            .desk-monitor { box-shadow: inset 0 0 14px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04); }

            /* INDUSTRIAL LIGHTING — seolah ada lampu studio dari kiri-atas,
               sangat halus, nyaris tidak terasa (bukan gradient besar) */
            .desk-console::after {
                content: ''; position: absolute; inset: 0; border-radius: inherit;
                background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 30%);
                pointer-events: none; z-index: 1;
            }
            .desk-btn {
                font-family: inherit; font-weight: 700; font-size: 13px; cursor: pointer;
                border-radius: 12px; padding: 14px; letter-spacing: 0.3px;
                transition: transform var(--motion-fast, 120ms) var(--motion-ease, ease),
                            opacity var(--motion-normal, 240ms) var(--motion-ease, ease),
                            filter var(--motion-normal, 240ms) var(--motion-ease, ease),
                            box-shadow var(--motion-normal, 240ms) var(--motion-ease, ease);
            }
            .desk-btn:active { transform: scale(0.97); }
            /* HOVER SYSTEM — satu bahasa untuk semua kontrol: brightness naik
               sedikit + border-glow tipis + shadow bertambah. TIDAK membesar
               (bukan gaya website modern), terasa seperti panel mesin. */
            .desk-btn, .voice-preset-btn, .voice-category-chip, .desk-channel {
                transition: filter var(--motion-normal, 240ms) var(--motion-ease, ease),
                            box-shadow var(--motion-normal, 240ms) var(--motion-ease, ease),
                            background var(--motion-normal, 240ms) var(--motion-ease, ease);
            }
            .desk-btn:hover, .voice-preset-btn:hover, .voice-category-chip:hover, .desk-channel:hover {
                filter: brightness(1.12);
                box-shadow: 0 0 0 1px ${theme.primary}33, 0 0 10px -2px ${theme.primary}44;
            }
            /* 🔥 BARU: dulu voice-preset-btn cuma punya transisi untuk
               :hover — pseudo-class ini TIDAK reliable di layar sentuh
               (HP), beda dari mouse di desktop. Rap Battle terasa lebih
               responsif karena pakai class seleksi yang persisten.
               Karena di sini item langsung hilang dari daftar begitu
               dipilih (render ulang penuh), :active memberi feedback
               sentuhan INSTAN yang reliable di HP — sebelum item itu
               menghilang saat render ulang. */
            .voice-preset-btn:active {
                background: ${theme.primary}18 !important;
                filter: brightness(1.2);
                transition: background 0.08s ease, filter 0.08s ease;
            }

            /* ============================================================
               🖥️ VOCABULARY (Production Workstation) — satu keluarga
               radius/border/shadow, kontras berbeda cuma lewat opacity.
               ============================================================ */
            .desk-monitor {
                padding: 10px 12px;
            }
            .desk-channel {
                display: flex; align-items: center; gap: 10px;
                padding: 8px 10px;
                background: transparent;
                border-radius: 8px;
                transition: background 0.15s ease;
            }
            .desk-channel + .desk-channel { border-top: 1px solid rgba(255,255,255,0.04); }

            /* STATUS CHIP SERAGAM — satu komponen untuk semua status.
               Hijau = ACTIVE/ONLINE/READY. Merah = ERROR. Kuning = WARNING.
               Abu = OFFLINE/STANDBY. Tidak ada warna lain di luar ini. */
            .desk-status {
                font-family: 'Courier New', monospace; font-size: 8px;
                letter-spacing: 0.5px; padding: 1px 0;
            }
            .desk-status.on { color: ${theme.primary}; }
            .desk-status.warn { color: #FFB020; }
            .desk-status.error { color: #FF4444; }
            .desk-status.off { color: ${theme.text}; opacity: 0.4; }

            .desk-indicator {
                width: 6px; height: 6px; border-radius: 50%;
                display: inline-block; flex-shrink: 0;
                box-shadow: 0 0 3px 0 currentColor;
            }
            @keyframes deskLedGlow {
                0%, 100% { box-shadow: 0 0 2px 0 currentColor; opacity: 0.75; }
                50% { box-shadow: 0 0 5px 1px currentColor; opacity: 1; }
            }
            .desk-indicator.on { animation: deskLedGlow 3.2s var(--motion-ease, ease-in-out) infinite; }

            /* ACTIVE STATE — hidup lewat glow/opacity halus, TIDAK scale,
               TIDAK blink cepat (bukan lampu darurat, lampu indikator mesin) */
            @keyframes deskStatusLive {
                0%, 100% { opacity: 0.85; text-shadow: 0 0 2px currentColor; }
                50% { opacity: 1; text-shadow: 0 0 6px currentColor; }
            }
            .desk-status.on { animation: deskStatusLive 3.2s var(--motion-ease, ease-in-out) infinite; }

            /* Konsol bernapas pelan saat idle - brightness bergeser 2-3%,
               bukan efek loading, terasa "mesin hidup" */
            @keyframes consolePowerBreathe {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.025); }
            }
            .desk-console { animation: consolePowerBreathe 6s var(--motion-ease, ease-in-out) infinite; }

            /* Ambience waveform - glow lembut memantul ke chassis, bukan neon besar */
            .waveform-container { box-shadow: inset 0 0 24px rgba(0,0,0,0.55), 0 0 16px -6px ${theme.primary}33 !important; }

            /* AI Producer monitor - flicker sangat lambat & halus */
            @keyframes monitorFlicker { 0%, 96%, 100% { opacity: 0.5; } 98% { opacity: 0.35; } }
            .ai-producer-monitor::after { animation: monitorFlicker 9s linear infinite; }

            /* Details (Voice Library / Detail Analysis / More Tools) - transisi
               halus saat dibuka, tidak snap. CSS-only, animasi replay tiap kali
               [open] muncul di render tree. */
            @keyframes detailsReveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            details[open] > *:not(summary) { animation: detailsReveal var(--motion-normal, 240ms) var(--motion-ease, ease) both; }
            /* 🔥 FIX: dulu animasi reveal di atas replay tiap render()
               membongkar ulang DOM — termasuk saat panel yang SUDAH
               terbuka cuma dipulihkan lagi statusnya (bukan genuinely
               baru dibuka user). Ini yang terlihat sebagai flash/kedip
               setiap pilih karakter suara/Tema/tab. Kelas ini dipasang
               HANYA saat pemulihan otomatis (lihat ui-renderer.js),
               animasi asli tetap jalan normal untuk buka-tutup manual. */
            details[open].no-reveal-anim > *:not(summary) { animation: none !important; }

            /* 🔥 BARU: highlight sesaat saat suara BENAR-BENAR berpindah
               (dipicu manual lewat JS di applyVoice(), bukan otomatis di
               setiap render — supaya tidak replay terus seperti bug
               animasi <details> yang sudah diperbaiki). */
            @keyframes voiceSwitchGlow {
                0% { box-shadow: 0 0 0 0 ${theme.primary}88; }
                50% { box-shadow: 0 0 0 6px ${theme.primary}00; }
                100% { box-shadow: 0 0 0 0 ${theme.primary}00; }
            }
            #activeVoicePanel.voice-just-switched {
                animation: voiceSwitchGlow 600ms ease;
            }

            /* 🔥 BARU: transisi halus untuk section yang toggle
               berdasar mode (AI CAST) — menggantikan display:none/block
               yang tidak bisa dianimasikan. */
            .mode-panel-transition {
                transition: max-height 280ms ease, opacity 220ms ease, padding 280ms ease, margin 280ms ease, border-width 280ms ease;
            }

            /* ============================================================
               🎛️ TAHAP 9.6 — DEBATE SELECTOR (Voice Library blueprint)
               Row datar seperti Voice Library: border-left aksen +
               border-bottom seam, TANPA card/glow/pulse/scale. Transisi
               dibatasi 180ms ease saja.
               ============================================================ */
            /* ============================================================
               🔗 TAHAP 9.11 — DASHBOARD CHASSIS (final)
               Diperluas: sekarang membungkus Settings→Mode→Export→More
               Tools→Monitoring→Projects sebagai SATU chassis. Setiap
               anak langsung kehilangan bg/border/radius individunya
               (scoped ke .dashboard-continuous saja, tidak menyentuh
               .desk-monitor/.studio-secondary-panel di tempat lain),
               diganti separator 1px opacity rendah + padding 8px.
               ============================================================ */
            .dashboard-continuous {
                border-radius: 12px;
                background: linear-gradient(180deg, ${theme.primary}05, rgba(255,255,255,0.01));
                border: 1px solid ${theme.primary}14;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
                overflow: hidden;
                padding: 2px 0;
            }
            .dashboard-continuous .desk-monitor,
            .dashboard-continuous .studio-secondary-panel,
            .dashboard-continuous > details {
                border: none !important; border-radius: 0 !important;
                background: transparent !important; box-shadow: none !important;
                margin: 0 !important;
                padding-left: 12px !important; padding-right: 12px !important;
            }
            .dashboard-continuous > *:not(:first-child) {
                border-top: 1px solid rgba(255,255,255,0.05) !important;
            }
            .dashboard-continuous #analyticsContainer > .desk-monitor {
                padding: 8px 12px !important;
            }
            .dashboard-continuous #podcastGallery {
                min-height: 64px;
            }
            .dashboard-continuous #debateAgentsSelector {
                padding-top: 8px !important; padding-bottom: 8px !important;
            }

            .desk-chip {
                font-family: 'Courier New', monospace; font-size: 7px; letter-spacing: 0.5px;
                padding: 2px 6px; border-radius: 8px;
                background: rgba(255,255,255,0.06); color: ${theme.text}; opacity: 0.6;
                flex-shrink: 0;
            }
            #debateAgentsSelector .debate-agent-select {
                transition: background 180ms ease, border-color 180ms ease, opacity 180ms ease;
            }
            #debateAgentsSelector .debate-agent-select:hover:not(.selected) {
                background: rgba(255,255,255,0.02);
            }
            #debateAgentsSelector .debate-agent-select.selected {
                border-left-color: ${theme.primary} !important;
                background: ${theme.primary}0d;
            }
            #debateAgentsSelector .debate-agent-select.full-dim { opacity: 0.55; }

            /* AI Producer monitor - scanline sangat halus, tidak mengganggu ketik */
            .ai-producer-monitor { overflow: hidden; transition: box-shadow var(--motion-slow, 1000ms) var(--motion-ease, ease); }
            .ai-producer-monitor:focus-within {
                box-shadow: inset 0 0 22px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 0 1px ${theme.primary}40, 0 0 16px -4px ${theme.primary}55;
            }
            .ai-producer-monitor::after {
                content: '';
                position: absolute; inset: 0; pointer-events: none; z-index: 2;
                background: repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px);
            }

            /* ===== Panel sekunder — sengaja jadi "siluet", bukan card
               yang bersaing terang dengan Meja Mixing ===== */
            .studio-secondary-panel {
                background: linear-gradient(180deg, ${theme.primary}05, rgba(255,255,255,0.012));
                border: 1px solid ${theme.primary}14;
                border-radius: 12px;
                padding: 10px 12px;
                margin-bottom: 8px;
                opacity: 0.8;
            }
            .studio-hud-strip {
                display: flex; gap: 5px; overflow-x: auto; padding: 2px 2px 6px;
                -webkit-overflow-scrolling: touch; scrollbar-width: none; opacity: 0.7;
            }
        </style>

        <div class="podcast-container studio-atmosphere" style="position:relative; padding: 10px 14px; color:${theme.text}; overflow:hidden;">

            <!-- HUD tipis - metadata pendukung, bukan lagi section penuh -->
            ${buildTopStatusBar(state, theme)}

            <!-- Watermark identitas - jejak cahaya, bukan banner -->
            <div class="studio-watermark">KESEMPATAN OS · AI PODCAST STUDIO</div>

            <!-- 🎛️ MEJA MIXING — pusat gravitasi visual, hal PERTAMA yang dominan -->
            <div class="desk-console">
                <div class="desk-console-ring"></div>

                <div class="desk-unit">
                    <div class="desk-label" style="margin-bottom:8px;">LIVE WAVEFORM</div>
                    <div id="playerProContainer">
                        <div class="waveform-container desk-screen" style="padding:12px; height:72px; display:flex; align-items:center; gap:2px;">
                            ${Array.from({length: 48}, function(_, i) {
                                return '<div class="waveform-bar" style="width:3px; height:18px; background:' + (i < 24 ? theme.primary : 'rgba(255,255,255,0.16)') + '; border-radius:2px; transition: all 0.3s;"></div>';
                            }).join('')}
                        </div>
                        ${state.currentPlayerMode === 'pro' ? `
                            <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:10px;">
                                <div style="display:flex; gap:6px;">
                                    <button onclick="window.KESEMPATAN.PodcastGenerator.skipTime(-10)" style="background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:${theme.text}; padding:4px 8px; cursor:pointer; font-size:11px;">⏮ 10s</button>
                                    <button onclick="window.KESEMPATAN.PodcastGenerator.play()" style="background:${theme.primary}; border:none; border-radius:8px; color:${theme.bg}; padding:4px 12px; cursor:pointer; font-size:13px; font-weight:bold;">
                                        ${state.isPlaying ? '⏸' : '▶'}
                                    </button>
                                    <button onclick="window.KESEMPATAN.PodcastGenerator.skipTime(10)" style="background:transparent; border:1px solid rgba(255,255,255,0.12); border-radius:8px; color:${theme.text}; padding:4px 8px; cursor:pointer; font-size:11px;">⏭ 10s</button>
                                </div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:10px; color:${theme.text}; opacity:0.6;">🔊</span>
                                    <input type="range" min="0" max="1" step="0.01" value="0.8" style="width:60px; accent-color:${theme.primary};">
                                </div>
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <select onchange="window.KESEMPATAN.PodcastGenerator.setSpeed(this.value)" style="background:rgba(0,0,0,0.3); border:none; border-bottom:1px solid rgba(255,255,255,0.1); color:${theme.text}; padding:2px 4px; font-size:10px;">
                                        <option value="0.5">0.5x</option>
                                        <option value="0.75">0.75x</option>
                                        <option value="1" selected>1x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2">2x</option>
                                    </select>
                                </div>
                                <button onclick="window.KESEMPATAN.PodcastGenerator.addBookmark()" style="background:transparent; border:1px solid rgba(255,215,0,0.25); border-radius:8px; color:#FFD700; padding:4px 8px; cursor:pointer; font-size:11px;">⭐</button>
                                <button onclick="window.KESEMPATAN.PodcastGenerator.togglePlayerMode()" style="background:transparent; border:none; color:${theme.text}; opacity:0.5; cursor:pointer; font-size:9px; margin-left:auto;">📱 Simple</button>
                            </div>
                            <div id="bookmarksContainer" style="margin-top:8px; display:flex; gap:4px; flex-wrap:wrap;"></div>
                            <div style="margin-top:8px; font-size:9px; color:${theme.text}; opacity:0.45; display:flex; justify-content:space-between;">
                                <span>${state.bookmarks.length} bookmarks • ${state.currentRate}x</span>
                                <span>💭 ${VOICE_EMOTIONS[state.currentEmotion] ? VOICE_EMOTIONS[state.currentEmotion].label : 'Netral'}</span>
                            </div>
                        ` : `
                            <div style="text-align:right; margin-top:6px;">
                                <button onclick="window.KESEMPATAN.PodcastGenerator.togglePlayerMode()" style="background:transparent; border:none; color:${theme.text}; opacity:0.4; cursor:pointer; font-size:9px;">🎛 Pro Mode</button>
                            </div>
                        `}
                    </div>
                </div>

                <div class="desk-unit">
                    <div class="desk-label" style="margin-bottom:8px; text-align:left;">TOPIC INPUT</div>
                    <input type="text" id="podcastTopicInput" placeholder="Masukkan topik podcast (contoh: bisnis digital)"
                           class="desk-screen"
                           style="width:100%; padding:10px 12px; border:none;
                                  color:${theme.text}; font-size:13px; outline:none; box-sizing:border-box;">
                </div>

                <!-- 🏛️ STUDIO — Podcast Room, sekarang jadi bagian console yang sama -->
                <div class="desk-unit">
                    <div class="desk-label" style="margin-bottom:8px; text-align:left;">STUDIO</div>
                    ${buildPodcastRoom(state, theme)}
                </div>

                <!-- 📟 MONITORING — Laporan/Skor, dilebur sebagai readout console -->
                <div class="desk-unit" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div id="superStatus" style="display:flex; gap:16px; align-items:center;">
                        <div>
                            <span style="color: ${theme.text}; opacity:0.4; font-size: 8px;">LAPORAN </span>
                            <span id="superTopicDisplay" style="color: ${theme.primary}; font-weight: bold; font-size: 10px;">-</span>
                        </div>
                        <div>
                            <span style="color: ${theme.text}; opacity:0.4; font-size: 8px;">SKOR </span>
                            <span id="superScoreDisplay" style="color: #FFD700; font-weight: bold; font-size: 12px;">0</span>
                        </div>
                        <span id="superStatusBadge" style="background: #FFA500; color: #03050A; padding: 2px 8px; border-radius: 10px; font-size: 8px;">BELUM</span>
                    </div>
                    <button id="voicePreviewBtn" style="background:transparent; border:1px solid ${theme.primary}55; border-radius:8px; padding:5px 12px; color:${theme.primary}; cursor:pointer; font-size:9px; font-weight:bold;">PREVIEW</button>
                </div>

                <div class="desk-unit" style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button id="superGenerateBtn" class="desk-btn" style="flex: 2; background: rgba(255,255,255,0.05); border: 1.5px solid ${theme.primary}; color: ${theme.primary}; box-shadow: 0 0 24px -6px ${theme.primary}77, inset 0 0 20px -10px ${theme.primary}55;">GENERATE</button>
                    <button id="superPlayBtn" class="desk-btn" style="flex: 1; background: rgba(255,255,255,0.05); border: 1.5px solid ${theme.primary}66; color: ${theme.primary};">▶ PLAY</button>
                    <button id="superStopBtn" class="desk-btn" style="flex: 1; background: rgba(255,255,255,0.05); border: 1.5px solid #ff444488; color: #ff4444; display: ${state.isPlaying ? 'inline-block' : 'none'};">■ STOP</button>
                </div>
            </div>

            <!-- 🆕 VOICE ACTIVE — panel permanen, TERPISAH dari Voice Booth/Library -->
            ${buildActiveVoicePanel(state, theme)}

            <!-- Theme picker - disembunyikan default (native <details>, tanpa JS baru) -->
            <!-- 📝 REVIEW AI — hasil naskah muncul di sini, TEPAT setelah Console,
                 sebelum Voice Booth/Settings. Sebelumnya ini ada di paling bawah
                 halaman (setelah Voice Booth+Settings+Mode+Tools), jadi user harus
                 scroll jauh untuk lihat hasil Generate-nya sendiri. -->
            <div id="superPreview" style="margin-top: 4px; margin-bottom: 12px;"></div>

            <!-- 🎙️ VOICE BOOTH — ruang rekaman, bukan grid tombol. Collapsed
                 default (Expand/Collapse), bahasa visual sama dengan Console
                 (desk-screen, seam divider, monokrom + hijau utk aktif). -->
            <details class="studio-secondary-panel" id="detailsVoiceLibrary">
                <summary style="cursor:pointer; list-style:none;">
                    <div class="desk-label" style="text-align:left; display:inline; opacity:0.55;">VOICE LIBRARY</div>
                    <div style="margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:${theme.text}; opacity:0.6; font-weight:bold; font-size:11px;">Pilih karakter suara lain</span>
                        <span style="color:${theme.text}; opacity:0.35; font-size:8px;">${totalVoices - 1} suara lain · Tap to Open</span>
                    </div>
                </summary>

                <div style="margin-top:10px;">
                    ${(function() {
                        const favKeys = safeLSGet(FAV_KEY).filter(function(k) { return VOICE_PRESETS[k] && k !== state.currentVoiceType; });
                        const recentKeys = safeLSGet(RECENT_KEY).filter(function(k) { return VOICE_PRESETS[k] && k !== state.currentVoiceType && favKeys.indexOf(k) === -1; }).slice(0, 5);

                        function miniRow(key) {
                            const val = VOICE_PRESETS[key];
                            const isFav = favKeys.indexOf(key) !== -1;
                            return `<div class="voice-preset-btn" data-voice="${key}" style="display:inline-flex; align-items:center; gap:5px; padding:5px 9px; background:rgba(255,255,255,0.03); border-radius:10px; cursor:pointer; margin:2px;">
                                <span style="font-size:14px;">${val.emoji || '🎤'}</span>
                                <span style="font-size:9px; color:${theme.text};">${val.name.replace(/[^\w\s]/g, '').trim()}</span>
                            </div>`;
                        }

                        let html = '';
                        if (favKeys.length > 0) {
                            html += `<div style="margin-bottom:10px;"><div style="font-size:8px; color:${theme.primary}; opacity:0.6; letter-spacing:0.5px; margin-bottom:4px;">★ FAVORITE</div><div>${favKeys.map(miniRow).join('')}</div></div>`;
                        }
                        if (recentKeys.length > 0) {
                            html += `<div style="margin-bottom:10px;"><div style="font-size:8px; color:${theme.text}; opacity:0.4; letter-spacing:0.5px; margin-bottom:4px;">🕐 RECENTLY USED</div><div>${recentKeys.map(miniRow).join('')}</div></div>`;
                        }
                        return html;
                    })()}

                    <!-- Quick Category filter - murni show/hide, tidak ubah data/handler -->
                    <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px;">
                        ${['all', 'male', 'female', 'young', 'adult', 'senior', 'podcast', 'regional'].map(function(cat, i) {
                            const labels = { all: 'All', male: 'Male', female: 'Female', young: 'Young', adult: 'Adult', senior: 'Senior', podcast: 'Podcast', regional: 'Regional' };
                            return `<button class="voice-category-chip" data-category="${cat}" onclick="window.KESEMPATAN.PodcastGenerator.filterVoiceBooth('${cat}', this)" style="padding:3px 9px; font-size:8px; border-radius:8px; background:${i === 0 ? theme.primary + '18' : 'rgba(255,255,255,0.03)'}; border:1px solid ${i === 0 ? theme.primary : 'transparent'}; color:${i === 0 ? theme.primary : theme.text}; opacity:${i === 0 ? '1' : '0.6'}; cursor:pointer;">${labels[cat]}</button>`;
                        }).join('')}
                    </div>

                    <!-- Search - realtime, client-side saja -->
                    <input type="text" id="voiceSearchInput" placeholder="🔍 Cari nama, kategori, atau karakter..."
                           oninput="window.KESEMPATAN.PodcastGenerator.searchVoiceBooth(this.value)"
                           class="desk-screen" style="width:100%; padding:7px 10px; border:none; color:${theme.text}; font-size:11px; outline:none; box-sizing:border-box; margin-bottom:8px;">
                </div>

                <div class="desk-screen" id="voiceLibraryList" data-active-category="all" style="max-height: 260px; overflow-y: auto; padding: 2px 0; scroll-behavior: smooth;">
                    ${Object.entries(VOICE_PRESETS).filter(function(pair) { return pair[0] !== state.currentVoiceType || state.useAgentVoice; }).map(function(pair) {
                        const key = pair[0];
                        const val = pair[1];
                        const favKeys = safeLSGet(FAV_KEY);
                        const isFav = favKeys.indexOf(key) !== -1;
                        const searchText = (val.name + ' ' + (val.style || '') + ' ' + (val.desc || '') + ' ' + val.gender + ' ' + val.age).toLowerCase().replace(/"/g, '');
                        return `
                            <div class="voice-preset-btn" data-voice="${key}" data-gender="${val.gender}" data-age="${val.age}" data-style="${val.style || ''}" data-search="${searchText}" style="display:flex; align-items:center; gap:10px; width:100%; text-align:left;
                                padding:9px 12px; background:transparent; box-sizing:border-box;
                                border-left:2px solid transparent;
                                border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;">
                                <span style="font-size:20px; opacity:0.5; flex-shrink:0;">${val.emoji || '🎤'}</span>
                                <span style="flex:1; min-width:0;">
                                    <span style="display:block; font-size:11px; font-weight:400; color:${theme.text}; opacity:0.65;">${val.name.replace(/[^\w\s]/g, '').trim()}</span>
                                    <span style="display:block; font-size:8px; color:${theme.text}; opacity:0.35;">${val.style || 'general'} · ${val.gender} · ${val.age}</span>
                                </span>
                                <button onclick="window.KESEMPATAN.PodcastGenerator.toggleFavoriteVoice('${key}', event)" style="background:none; border:none; cursor:pointer; font-size:13px; padding:2px 4px; flex-shrink:0; color:${theme.primary}; opacity:${isFav ? '1' : '0.3'};">${isFav ? '★' : '☆'}</button>
                                <span class="desk-status off" style="flex-shrink:0;">STANDBY</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.04); padding-top:8px;">
                    ${state.speakerMode === 'single' ? `
                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">
                        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                            <span style="color:${theme.text}; opacity:0.4; font-size:8px;">AGEN:</span>
                            ${Object.entries(AGENT_VOICES).filter(function(pair) { return pair[0].indexOf('discussion_') !== 0; }).map(function(pair) {
                                const key = pair[0];
                                const val = pair[1];
                                const isActive = state.useAgentVoice && state.currentAgentVoice === key;
                                return '<button class="agent-voice-btn" data-agent="' + key + '" style="padding:1px 4px; background: transparent; border: none; color: ' + (isActive ? theme.primary : theme.text) + '; opacity: ' + (isActive ? '1' : '0.5') + '; cursor: pointer; font-size: 7px;">' + val.name + '</button>';
                            }).join('')}
                        </div>
                        <span style="color:${theme.text}; opacity:0.25; font-size:7px;">${totalVoices} voices • 1-9 shortcut</span>
                    </div>
                    ` : `
                    <div style="font-size:8px; color:${theme.text}; opacity:0.4; padding:2px 0;">
                        ${state.speakerMode === 'discussion' ? '💬 Mode Diskusi pakai 4 karakter tetap (Host/Expert/Storyteller/Skeptic) — atur suaranya di 🎙️ Ruang Podcast di atas.' : '🎤 Mode Debat pakai agen yang dipilih di bawah — daftar AGEN di atas tidak berlaku untuk mode ini.'}
                    </div>
                    `}
                </div>
            </details>

            <!-- 🔗 DASHBOARD CHASSIS — Settings s/d Projects satu kesatuan -->
            <div class="dashboard-continuous">
            <!-- SETTINGS + EMOTIONS — collapsed default, ringkasan tetap kelihatan -->
            <details class="studio-secondary-panel" id="detailsVoiceSettings">
                <summary style="color:${theme.text}; opacity:0.6; font-size:11px; font-weight:bold; cursor:pointer; list-style:none;">⚙️ Pengaturan Suara — ${state.currentRate}x · ${LANGUAGES[state.currentLang] ? LANGUAGES[state.currentLang].label : state.currentLang} · ${VOICE_EMOTIONS[state.currentEmotion] ? VOICE_EMOTIONS[state.currentEmotion].label : 'Netral'}</summary>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:8px; margin-top:8px;">
                <div>
                    <div style="color:${theme.text}; opacity:0.5; font-size:8px; margin-bottom:4px;">⚡ Kecepatan</div>
                    <div style="display:flex; justify-content:space-between; font-size:10px;">
                        <span id="superRateLabel" style="color:${theme.primary};">${state.currentRate}x</span>
                    </div>
                    <input type="range" id="superRateSlider" min="0.25" max="3" step="0.05" value="${state.currentRate}" style="width:100%; accent-color:${theme.primary};">
                </div>

                <div>
                    <div style="color:${theme.text}; opacity:0.5; font-size:8px; margin-bottom:4px;">🌍 Bahasa (${totalLangs})</div>
                    <select id="langSelect" style="width:100%; background:rgba(0,0,0,0.2); border:none; border-bottom:1px solid rgba(255,255,255,0.08); border-radius:0; padding:2px 4px; color:${theme.text}; font-size:8px;">
                        ${Object.entries(LANGUAGES).map(function(pair) {
                            const key = pair[0];
                            const val = pair[1];
                            return '<option value="' + key + '" ' + (state.currentLang === key ? 'selected' : '') + '>' + val.name + '</option>';
                        }).join('')}
                    </select>
                </div>

                <div>
                    <div style="color:${theme.text}; opacity:0.5; font-size:8px; margin-bottom:4px;">🎵 Background</div>
                    <select id="bgMusicSelect" style="width:100%; background:rgba(0,0,0,0.2); border:none; border-bottom:1px solid rgba(255,255,255,0.08); border-radius:0; padding:2px 4px; color:${theme.text}; font-size:8px;">
                        ${Object.entries(BG_MUSIC).map(function(pair) {
                            const key = pair[0];
                            const val = pair[1];
                            return '<option value="' + key + '" ' + (state.currentBgMusic === key ? 'selected' : '') + '>' + val.name + '</option>';
                        }).join('')}
                    </select>
                </div>

                <div>
                    <div style="color:${theme.text}; opacity:0.5; font-size:8px; margin-bottom:4px;">💭 Emotion</div>
                    <select id="emotionSelect" style="width:100%; background:rgba(0,0,0,0.2); border:none; border-bottom:1px solid rgba(255,255,255,0.08); border-radius:0; padding:2px 4px; color:${theme.text}; font-size:8px;">
                        ${Object.entries(VOICE_EMOTIONS).map(function(pair) {
                            const key = pair[0];
                            const val = pair[1];
                            return '<option value="' + key + '" ' + (state.currentEmotion === key ? 'selected' : '') + '>' + val.label + '</option>';
                        }).join('')}
                    </select>
                </div>
                </div>

                <!-- Tema - digabung ke Studio Settings, bukan section sendiri -->
                <div style="margin-top:10px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.04);">
                    <div style="color:${theme.text}; opacity:0.4; font-size:8px; margin-bottom:4px;">🎨 Tema</div>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${Object.keys(THEMES).map(function(t) {
                            return '<button onclick="window.KESEMPATAN.PodcastGenerator.applyTheme(\'' + t + '\')" style="background:' + (state.currentTheme === t ? theme.primary : 'rgba(255,255,255,0.05)') + '; border:1px solid ' + (state.currentTheme === t ? theme.primary : 'rgba(255,255,255,0.08)') + '; border-radius:8px; padding:2px 7px; color:' + (state.currentTheme === t ? theme.bg : theme.text) + '; cursor:pointer; font-size:7px;">' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>';
                        }).join('')}
                    </div>
                </div>
            </details>

            <!-- MODE BUTTONS — segmented control tunggal, seragam, tanpa emoji dekoratif -->
            <div style="display:flex; gap:2px; padding:3px; background:rgba(0,0,0,0.2); border-radius:10px; margin-bottom:6px; flex-wrap:wrap;">
                <button id="debateModeBtn" style="flex:1; min-width:56px; padding:6px 8px; font-size:8px; background:${state.speakerMode === 'debate' ? theme.secondary : 'transparent'}; border:none; border-radius:7px; color:${state.speakerMode === 'debate' ? 'white' : theme.text}; opacity:${state.speakerMode === 'debate' ? '1' : '0.5'}; cursor:pointer;">Debat</button>
                <button id="singleModeBtn" style="flex:1; min-width:56px; padding:6px 8px; font-size:8px; background:${state.speakerMode === 'single' ? theme.secondary : 'transparent'}; border:none; border-radius:7px; color:${state.speakerMode === 'single' ? 'white' : theme.text}; opacity:${state.speakerMode === 'single' ? '1' : '0.5'}; cursor:pointer;">Single</button>
                <button id="discussionModeBtn" style="flex:1; min-width:56px; padding:6px 8px; font-size:8px; background:${state.speakerMode === 'discussion' ? theme.secondary : 'transparent'}; border:none; border-radius:7px; color:${state.speakerMode === 'discussion' ? 'white' : theme.text}; opacity:${state.speakerMode === 'discussion' ? '1' : '0.5'}; cursor:pointer;">Diskusi</button>
                <button id="autoScheduleBtn" style="flex:1; min-width:56px; padding:6px 8px; font-size:8px; background:${state.autoScheduleActive ? '#FF6B6B' : 'transparent'}; border:none; border-radius:7px; color:${theme.text}; opacity:${state.autoScheduleActive ? '1' : '0.5'}; cursor:pointer;">${state.autoScheduleActive ? 'Stop' : 'Auto'}</button>
                <button id="liveStreamBtn" style="flex:1; min-width:56px; padding:6px 8px; font-size:8px; background:${state.isLiveStreaming ? '#FF0000' : 'transparent'}; border:none; border-radius:7px; color:${state.isLiveStreaming ? 'white' : '#FF6B6B'}; opacity:${state.isLiveStreaming ? '1' : '0.6'}; cursor:pointer;">${state.isLiveStreaming ? 'LIVE' : 'Go Live'}</button>
            </div>

            <!-- 🎙️ DEBATE SELECTOR — mengikuti blueprint Voice Library -->
            <!-- 🔥 FIX: dulu display:none/block — properti display
                 TIDAK BISA dianimasikan CSS, jadi section ini muncul/
                 hilang SNAP mendadak, terasa seperti layar "nyendal"
                 saat pindah mode. max-height BISA bertransisi halus,
                 dan cuma animasi saat mode BENAR-BENAR berubah (bukan
                 replay di setiap render seperti animasi <details>). -->
            <div id="debateAgentsSelector" class="studio-secondary-panel mode-panel-transition" style="${state.speakerMode === 'debate' ? 'max-height:2000px; opacity:1;' : 'max-height:0px; opacity:0; padding-top:0; padding-bottom:0; margin-bottom:0; border-width:0;'} overflow:hidden; padding:10px 0 10px 12px;">
                ${(function() {
                    const ROLE_BADGE = {
                        RahmadRaharjo: 'MENTOR', Manager: 'HOST', StartupFounder: 'FOUNDER',
                        SundanyaAsep: 'STORYTELLER', Analyst: 'ANALYST', Moderator: 'MODERATOR',
                        NenekBijak: 'MENTOR', KakekSantai: 'MENTOR', CewekKece: 'STORYTELLER',
                        CowokKalem: 'SKEPTIC', KakakMotivator: 'HOST', TanteBawel: 'STORYTELLER'
                    };
                    const POSITION_SLOTS = ['Host', 'Expert', 'Analyst', 'Moderator', 'Skeptic'];
                    const selected = state.debateAgents || [];
                    const isFull = selected.length >= 5;
                    const keys = Object.keys(AGENT_VOICES).filter(function(k) { return k.indexOf('discussion_') !== 0; });

                    const header = `
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px; padding-right:12px;">
                            <div class="desk-label" style="text-align:left;">AI CAST</div>
                            <span class="desk-readout" style="color:${isFull ? theme.primary : theme.text}; opacity:${isFull ? '1' : '0.6'};">${selected.length} / 5 Selected</span>
                        </div>
                    `;

                    const rows = keys.map(function(key) {
                        const isSelected = selected.indexOf(key) !== -1;
                        const info = AGENT_VOICES[key];
                        const displayName = String(info.name).replace(/[^\w\s]/g, '').trim();
                        const role = ROLE_BADGE[key] || 'PARTICIPANT';
                        const rowClass = 'debate-agent-select' + (isSelected ? ' selected' : '') + (isFull && !isSelected ? ' full-dim' : '');
                        return `
                            <div class="${rowClass}" data-agent="${key}" style="display:flex; align-items:center; gap:8px; padding:6px 12px 6px 0; border-left:2px solid transparent; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;">
                                <span class="desk-indicator ${isSelected ? 'on' : ''}" style="background:${isSelected ? theme.primary : 'rgba(255,255,255,0.2)'}; flex-shrink:0;"></span>
                                <span style="flex:1; min-width:0;">
                                    <span class="desk-title" style="display:block; font-size:10px; line-height:1.3; color:${isSelected ? theme.primary : theme.text}; opacity:${isSelected ? '1' : '0.75'};">${displayName}</span>
                                    <span class="desk-metadata" style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${info.desc || '-'}</span>
                                </span>
                                <span class="desk-chip">${role}</span>
                                <span class="desk-status ${isSelected ? 'on' : 'off'}" style="flex-shrink:0; min-width:48px; text-align:right;">${isFull && !isSelected ? 'FULL' : (isSelected ? 'SELECTED' : 'READY')}</span>
                            </div>
                        `;
                    }).join('');
                    const rowsScroll = `<div style="max-height:300px; overflow-y:auto; overflow-x:hidden;">${rows}</div>`;

                    const estMinutes = selected.length > 0 ? Math.max(4, selected.length * 2) : 0;
                    const footer = `
                        <div style="margin-top:6px; padding: 5px 12px 0 0; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                            <span class="desk-metadata">Estimated Discussion</span>
                            <span class="desk-readout" style="color:${theme.text}; opacity:0.5;">${selected.length} Speakers · ~${estMinutes} min · ${selected.length >= 2 ? 'Balanced' : 'Incomplete'}</span>
                        </div>
                    `;

                    const castSummary = `
                        <details style="margin-top:6px;" id="detailsCastSummary">
                            <summary style="padding-right:12px; font-size:8px; color:${theme.text}; opacity:0.5; cursor:pointer; list-style:none;">▼ Cast Summary</summary>
                            <div style="margin-top:4px; padding-right:12px;">
                                ${POSITION_SLOTS.map(function(slot, i) {
                                    const agentKey = selected[i];
                                    const label = agentKey ? String(AGENT_VOICES[agentKey].name).replace(/[^\w\s]/g, '').trim() : '—';
                                    return '<div style="display:flex; justify-content:space-between; padding:2px 0;"><span class="desk-metadata">' + slot + '</span><span class="desk-readout" style="color:' + (agentKey ? theme.primary : theme.text) + '; opacity:' + (agentKey ? '1' : '0.3') + ';">' + label + '</span></div>';
                                }).join('')}
                            </div>
                        </details>
                    `;

                    return header + rowsScroll + castSummary + footer + (selected.length < 2 ? '<div class="desk-metadata" style="margin-top:4px; padding-right:12px;">Pilih minimal 2 agen untuk debat</div>' : '');
                })()}
            </div>

            <!-- LORONG KELUAR — diringankan, bukan lagi fokus setelah AI CAST -->
            <div style="display: flex; gap: 4px; margin-bottom: 4px; flex-wrap: wrap; opacity:0.5; padding:3px;">
                <button id="exportAudioBtn" style="flex: 1; padding: 4px 6px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; color: ${theme.text}; font-size: 8px; cursor: pointer;">EXPORT</button>
                <button id="shareBtn" style="flex: 1; padding: 4px 6px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; color: ${theme.text}; font-size: 8px; cursor: pointer;">SHARE</button>
                <button id="showNotesBtn" style="flex: 1; padding: 4px 6px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; color: ${theme.text}; font-size: 8px; cursor: pointer;">NOTES</button>
            </div>
            <details style="margin-bottom:4px; margin-top:4px; opacity:0.35;" id="detailsMoreTools">
                <summary style="font-size:7px; color:${theme.text}; cursor:pointer; list-style:none;">⋯ More Tools</summary>
                <div style="display: flex; gap: 5px; margin-top:4px; flex-wrap: wrap;">
                    <button id="superDownloadBtn" style="flex: 1; padding: 6px 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; color: ${theme.text}; font-size: 9px; cursor: pointer;">NASKAH</button>
                    <button id="subtitleExportBtn" style="flex: 1; padding: 6px 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; color: ${theme.text}; font-size: 9px; cursor: pointer;">SUB</button>
                    <button id="collabBtn" style="flex: 1; padding: 6px 8px; background: ${collab.isConnected ? theme.primary + '15' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${collab.isConnected ? theme.primary + '44' : 'rgba(255,255,255,0.05)'}; border-radius: 8px; color: ${collab.isConnected ? theme.primary : theme.text}; font-size: 9px; cursor: pointer;">
                        ${collab.isConnected ? collab.roomId : 'Collab'}
                    </button>
                    <button id="aiGenerateBtn2" style="flex: 1; padding: 6px 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; color: ${theme.text}; font-size: 9px; cursor: pointer;">AI</button>
                    <button onclick="window.showPage('dashboard')" style="flex: 1; padding: 6px 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; color: ${theme.text}; font-size: 9px; cursor: pointer;">← KEMBALI</button>
                </div>
            </details>

            <!-- ANALYTICS -->
            <div id="analyticsContainer"></div>

            <!-- GALLERY -->
            <div id="podcastGallery" class="studio-secondary-panel" style="margin-top: 0;">
                <div class="gallery-items"></div>
            </div>
            </div>
        </div>
    `;
}

export const uiLayout = {
    buildPodcastLayout: buildPodcastLayout
};

KESEMPATAN.Podcast.uiLayout = uiLayout;
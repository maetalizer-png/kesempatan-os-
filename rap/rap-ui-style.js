/* ============================================================
   📁 rap/ui-renderer/ui-style.js
   🔥 STYLE LAYER — seluruh CSS Rap Battle Arena.
   Dipindahkan apa adanya dari ui-renderer.js (byte-identik),
   tidak ada desain/warna/class/selector yang diubah.
   ============================================================ */

(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__RapUIStyle) return;
    window.__RapUIStyle = true;

    function inject() {
        const styleId = 'rap-arena-final';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* ================================================================
                   KESEMPATAN OS — RAP BATTLE ARENA (design system diturunkan
                   dari Podcast Studio: hijau = identitas utama, cyan = Agent A,
                   pink/merah = Agent B sebagai warna lawan. Ungu/amber cuma
                   aksen ambient tipis, bukan warna utama.)
                   ================================================================ */
                .rap-modern-wrapper {
                    background: transparent;
                    padding: 12px;
                    color: #E8F0F8;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                /* ===== BATTLE HUD HEADER ===== */
                .rap-header-arena {
                    text-align: center;
                    margin-bottom: 6px;
                    padding: 10px 0 8px 0;
                    border-bottom: 1px solid rgba(0,255,163,0.14);
                    background: radial-gradient(ellipse 100% 100% at 50% 0%, rgba(0,255,163,0.05), transparent 70%);
                    position: relative;
                }
                .rap-header-arena::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 25%;
                    width: 50%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #00FFA3, transparent);
                    opacity: 0.4;
                }
                .arena-brand {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .arena-title {
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #00FFA3;
                    text-shadow: 0 0 20px rgba(0,255,163,0.25);
                }
                .arena-tag {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: rgba(0,255,163,0.55);
                    text-transform: uppercase;
                    padding: 3px 12px 3px 10px;
                    background: rgba(0,255,163,0.06);
                    clip-path: polygon(6% 0, 100% 0, 94% 100%, 0 100%);
                }
                .arena-sub {
                    font-size: 9px;
                    color: rgba(0,255,163,0.3);
                    letter-spacing: 1px;
                    margin-top: 2px;
                    font-family: 'Courier New', monospace;
                }

                /* ===== STATS (scoreboard readouts) ===== */
                .scoreboard-bar {
                    display: flex;
                    background: rgba(0,0,0,0.22);
                    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                    border: 1px solid rgba(255,255,255,0.04);
                    box-shadow: inset 0 1px 0 rgba(0,255,163,0.15), inset 0 -8px 16px rgba(0,0,0,0.3);
                    margin-bottom: 4px;
                    opacity: 0.75;
                }
                .score-cell {
                    flex: 1;
                    min-width: 62px;
                    padding: 6px 8px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    min-height: 44px;
                    position: relative;
                }
                /* Diagonal separator — bukan garis lurus, motif "score strip"
                   broadcast (mengganti border-left rounded-panel biasa) */
                .score-cell:not(:first-child)::before {
                    content: '';
                    position: absolute; left: 0; top: 15%; bottom: 15%;
                    width: 1px;
                    background: rgba(255,255,255,0.08);
                    transform: skewX(-12deg);
                }
                .score-cell .reactions { min-height: 0; margin-top: 3px; justify-content: center; }
                .score-cell.agent-a { background: rgba(0,212,255,0.03); }
                .score-cell.agent-b { background: rgba(255,45,117,0.03); }

                .stat-number {
                    font-size: 15px;
                    font-weight: 800;
                    line-height: 1.2;
                    font-family: 'Courier New', monospace;
                }
                .stat-number.green { color: #00FFA3; text-shadow: 0 0 12px rgba(0,255,163,0.25); }
                .stat-number.cyan { color: #00D4FF; text-shadow: 0 0 12px rgba(0,212,255,0.2); }
                .stat-number.pink { color: #FF6B6B; text-shadow: 0 0 12px rgba(255,107,107,0.2); }

                .stat-label {
                    font-size: 7px;
                    color: rgba(255,255,255,0.35);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 3px;
                }
                .progress-bar {
                    width: 100%;
                    height: 3px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 3px;
                    margin-top: 5px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    border-radius: 3px;
                    background: #00FFA3;
                    transition: width 0.6s ease;
                }

                /* ===== BATTLE STAGE — focal point utama halaman ===== */
                .battle-stage {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 24px;
                    padding: 40px 16px 46px 16px;
                    margin: 16px 0 18px 0;
                    clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
                    overflow: hidden;
                    background: linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 35%),
                        radial-gradient(ellipse 140% 120% at 50% 10%, rgba(0,255,163,0.1), transparent 65%), rgba(0,0,0,0.36);
                    border: 1px solid rgba(0,255,163,0.16);
                    box-shadow: inset 0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.3);
                }
                /* Arena floor — CSS-only, kesan podium berpijak di panggung,
                   bukan gambar. Gradient horizontal + radial lantai. */
                .arena-floor {
                    position: absolute; left: 8%; right: 8%; bottom: 0; height: 40%;
                    background: radial-gradient(ellipse 80% 100% at 50% 100%, rgba(0,255,163,0.1), transparent 75%);
                    border-bottom: 1px solid rgba(0,255,163,0.14);
                    pointer-events: none;
                    z-index: 0;
                }
                /* Spotlight beam — lighting rig, CSS-only conic-gradient dari
                   sudut atas panggung, bukan glow datar */
                .spotlight-beam {
                    position: absolute; top: -10%; width: 55%; height: 90%;
                    pointer-events: none; z-index: 0; opacity: 0.5;
                }
                .beam-left {
                    left: -8%;
                    background: conic-gradient(from 100deg at 20% 0%, rgba(0,212,255,0.1), transparent 22%);
                }
                .beam-right {
                    right: -8%;
                    background: conic-gradient(from 260deg at 80% 0%, rgba(255,45,117,0.1), transparent 22%);
                }
                .stage-vignette {
                    position: absolute; inset: 0;
                    background: radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.4) 100%);
                    pointer-events: none; z-index: 0;
                }
                .stage-side, .vs-badge { position: relative; z-index: 1; }
                .stage-side {
                    flex: 1;
                    text-align: center;
                    padding: 16px 8px;
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .stage-side.side-a { box-shadow: inset 0 0 0 1px rgba(0,212,255,0.18), inset 0 0 20px rgba(0,212,255,0.04); background: rgba(0,212,255,0.04); }
                .stage-side.side-b { box-shadow: inset 0 0 0 1px rgba(255,45,117,0.18), inset 0 0 20px rgba(255,45,117,0.04); background: rgba(255,45,117,0.04); }
                .stage-ready-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    display: inline-block;
                }
                .stage-side.side-a .stage-ready-dot { background: #00D4FF; box-shadow: 0 0 4px 0 #00D4FF; }
                .stage-side.side-b .stage-ready-dot { background: #FF2D75; box-shadow: 0 0 4px 0 #FF2D75; }
                .stage-podium-status {
                    font-size: 7px; letter-spacing: 1.5px; opacity: 0.35;
                    font-family: 'Courier New', monospace;
                    color: #E8F0F8;
                }
                .stage-nameplate {
                    display: inline-block;
                    padding: 5px 18px;
                    clip-path: polygon(8% 0, 100% 0, 92% 100%, 0 100%);
                    background: rgba(255,255,255,0.04);
                }
                .stage-side.side-a .stage-nameplate { background: rgba(0,212,255,0.08); box-shadow: inset 0 0 0 1px rgba(0,212,255,0.2); }
                .stage-side.side-b .stage-nameplate { background: rgba(255,45,117,0.08); box-shadow: inset 0 0 0 1px rgba(255,45,117,0.2); }
                .stage-label {
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    font-family: 'Courier New', monospace;
                }
                .stage-side.side-a .stage-label { color: #00D4FF; text-shadow: 0 0 16px rgba(0,212,255,0.3); }
                .stage-side.side-b .stage-label { color: #FF2D75; text-shadow: 0 0 16px rgba(255,45,117,0.3); }

                .vs-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-shrink: 0;
                    padding: 0 6px;
                }
                .vs-emblem {
                    width: 72px; height: 72px;
                    clip-path: polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%);
                    display: flex; align-items: center; justify-content: center;
                    background: linear-gradient(160deg, rgba(255,255,255,0.08), rgba(0,0,0,0.35));
                    filter: drop-shadow(0 0 0 1px rgba(0,255,163,0.4)) drop-shadow(0 4px 10px rgba(0,0,0,0.5));
                    margin-bottom: 4px;
                    position: relative;
                }
                .vs-emblem::after {
                    content: '';
                    position: absolute; inset: 0;
                    clip-path: polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -8px 16px rgba(0,0,0,0.45);
                    pointer-events: none;
                }
                .vs-text {
                    font-size: 22px;
                    font-weight: 900;
                    color: #00FFA3;
                    text-shadow: 0 0 8px rgba(0,255,163,0.35);
                    letter-spacing: 1px;
                    font-family: 'Courier New', monospace;
                }
                .vs-sub {
                    font-size: 7px;
                    color: rgba(0,255,163,0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 2px;
                }

                /* ===== RAP PANEL (Judge Booth / Beat Engine) — shared chassis ===== */
                /* ============================================================
                   BROADCAST FRAME — bracket sudut tactical HUD. Elemen ini
                   TIDAK ADA padanannya di Podcast Studio sama sekali - murni
                   vocabulary Arena. Dipakai berulang di Stage/Judge/Beat/
                   Bench/Archive supaya jadi signature nyata.
                   ============================================================ */
                .broadcast-frame { position: relative; }
                .broadcast-frame::before, .broadcast-frame::after,
                .broadcast-frame .bf-tr, .broadcast-frame .bf-bl {
                    content: ''; position: absolute; width: 10px; height: 10px;
                    border-color: #00FFA3; opacity: 0.5; pointer-events: none;
                }
                .broadcast-frame::before { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
                .broadcast-frame::after { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }
                .broadcast-frame .bf-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
                .broadcast-frame .bf-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
                .broadcast-frame.frame-cyan::before, .broadcast-frame.frame-cyan::after,
                .broadcast-frame.frame-cyan .bf-tr, .broadcast-frame.frame-cyan .bf-bl { border-color: #00D4FF; }
                .broadcast-frame.frame-magenta::before, .broadcast-frame.frame-magenta::after,
                .broadcast-frame.frame-magenta .bf-tr, .broadcast-frame.frame-magenta .bf-bl { border-color: #FF2D75; }
                .broadcast-frame.frame-purple::before, .broadcast-frame.frame-purple::after,
                .broadcast-frame.frame-purple .bf-tr, .broadcast-frame.frame-purple .bf-bl { border-color: #B57EDC; }
                .broadcast-frame.frame-amber::before, .broadcast-frame.frame-amber::after,
                .broadcast-frame.frame-amber .bf-tr, .broadcast-frame.frame-amber .bf-bl { border-color: #FFB020; }

                .rap-panel {
                    background: rgba(0,0,0,0.32);
                    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
                    border: 1px solid rgba(0,255,163,0.08);
                    clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
                    padding: 10px 12px;
                    margin-bottom: 6px;
                }
                .rap-panel-label {
                    font-size: 8px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #00FFA3;
                    opacity: 0.6;
                    font-family: 'Courier New', monospace;
                    margin-bottom: 6px;
                }
                .rap-panel-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .rap-panel-readout {
                    font-size: 9px;
                    color: rgba(255,255,255,0.35);
                    font-family: 'Courier New', monospace;
                    margin-top: 6px;
                }
                .rap-status {
                    font-family: 'Courier New', monospace;
                    font-size: 8px;
                    letter-spacing: 0.5px;
                    padding: 2px 8px;
                    clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);
                    background: rgba(255,255,255,0.05);
                    flex-shrink: 0;
                }
                .rap-status.on { color: #00FFA3; background: rgba(0,255,163,0.1); }
                .rap-status.on::before {
                    content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%;
                    background: currentColor; margin-right: 4px; vertical-align: middle;
                    box-shadow: 0 0 4px 0 currentColor;
                    animation: ledPulseArena 1.8s ease-in-out infinite;
                }
                @keyframes ledPulseArena { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                .control-room { display: flex; gap: 0; padding: 4px 0; opacity: 0.8; }
                .control-room-col { flex: 1; padding: 0 12px; }
                .control-room-divider { width: 1px; background: rgba(255,255,255,0.05); align-self: stretch; }
                .archive-panel { border-color: rgba(0,255,163,0.08); }
                .judge-select { flex: 1; min-width: 140px; }
                .judge-col .rap-panel-label { color: #B57EDC; opacity: 0.7; }
                .judge-col .rap-status.on { color: #B57EDC; background: rgba(181,126,220,0.12); }
                .beat-col .rap-panel-label { color: #FFB020; opacity: 0.7; }
                /* EQ bars — dekoratif, kesan audio hardware, animasi statis ringan */
                .eq-bars { display: inline-flex; align-items: flex-end; gap: 1.5px; height: 8px; opacity: 0.6; }
                .eq-bars span { width: 2px; background: #FFB020; display: block; }
                .eq-bars span:nth-child(1) { height: 40%; animation: eqBounce 0.9s ease-in-out infinite -0.3s; }
                .eq-bars span:nth-child(2) { height: 80%; animation: eqBounce 0.9s ease-in-out infinite -0.6s; }
                .eq-bars span:nth-child(3) { height: 55%; animation: eqBounce 0.9s ease-in-out infinite -0.1s; }
                .eq-bars span:nth-child(4) { height: 90%; animation: eqBounce 0.9s ease-in-out infinite -0.45s; }
                @keyframes eqBounce { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }

                /* ===== PLAYER BENCH (Cypher Lounge) — gaya Voice Library:
                   header tetap, isi jadi ROWS yang scroll (bukan grid kartu) ===== */
                .cypher-lounge-header {
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    padding: 4px 2px 3px 2px;
                    flex-wrap: wrap;
                }
                .lounge-title {
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    color: #00FFA3;
                    text-transform: uppercase;
                    padding: 3px 12px 3px 8px;
                    background: rgba(0,255,163,0.06);
                    clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
                }
                .lounge-sub {
                    font-size: 9px;
                    color: rgba(255,255,255,0.3);
                }
                .cypher-lounge-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: 4px 0 8px 0;
                    max-height: 280px;
                    overflow-y: auto;
                    background: rgba(0,0,0,0.2);
                    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
                    counter-reset: seed;
                }
                .rapper-card.lounge-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 6px 12px 6px 28px;
                    background: transparent;
                    border-radius: 0;
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    cursor: pointer;
                    transition: background 0.13s ease;
                    min-width: 0;
                    max-width: none;
                    flex: none;
                    position: relative;
                    counter-increment: seed;
                }
                .rapper-card.lounge-card::before {
                    content: counter(seed, decimal-leading-zero);
                    position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
                    font-family: 'Courier New', monospace;
                    font-size: 8px;
                    color: rgba(0,255,163,0.3);
                }
                .rapper-card.lounge-card:hover {
                    background: rgba(255,255,255,0.03);
                    transform: none;
                }
                .rapper-card.role-a { background: rgba(0,255,163,0.06) !important; border-color: rgba(0,255,163,0.15) !important; }
                .rapper-card.role-b { background: rgba(255,45,117,0.06) !important; border-color: rgba(255,45,117,0.15) !important; }

                .rapper-avatar {
                    width: 30px;
                    height: 30px;
                    clip-path: polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                    color: #fff;
                }
                .rapper-name {
                    font-weight: 600;
                    font-size: 12px;
                    color: #E8F0F8;
                }
                .rapper-role {
                    font-size: 8px;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                }
                .rapper-role::after {
                    content: ' · READY';
                    font-family: 'Courier New', monospace;
                    color: rgba(255,255,255,0.2);
                    letter-spacing: 0.5px;
                }
                .rapper-card.selected .rapper-role::after {
                    content: ' · ACTIVE';
                    color: #00FFA3;
                }
                .rapper-card .role-badge {
                    position: static;
                    margin-left: auto;
                    width: 20px;
                    height: 20px;
                    clip-path: polygon(30% 0, 100% 0, 100% 70%, 70% 100%, 0 100%, 0 30%);
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: 900;
                    color: #03050A;
                    flex-shrink: 0;
                }
                .rapper-card.role-a .role-badge { background: #00FFA3; display: flex !important; }
                .rapper-card.role-b .role-badge { background: #FF2D75; display: flex !important; }

                /* ===== CROWD METER ===== */
                .audience-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 14px;
                    background: rgba(0,0,0,0.25);
                    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
                    margin: 6px 0 8px 0;
                    flex-wrap: wrap;
                    border: 1px solid rgba(0,255,163,0.06);
                }
                .audience-label {
                    font-size: 8px;
                    letter-spacing: 1.5px;
                    color: rgba(0,255,163,0.4);
                    text-transform: uppercase;
                    font-family: 'Courier New', monospace;
                }
                .reactions {
                    display: flex;
                    gap: 2px;
                    flex-wrap: wrap;
                    min-height: 20px;
                    flex: 1;
                }
                .reaction-count {
                    font-size: 10px;
                    color: #00FFA3;
                    font-weight: 600;
                    font-family: 'Courier New', monospace;
                }

                /* ===== VISUALIZER ===== */
                .visualizer-section canvas {
                    border-radius: 6px;
                    background: rgba(0,0,0,0.35);
                    transition: all 0.15s ease;
                }
                .visualizer-section canvas.active {
                    box-shadow: 0 0 20px rgba(0,255,163,0.08);
                }
                .visualizer-section canvas:not(.active) {
                    opacity: 0.4;
                }

                /* ===== TOOLBAR INDUSTRIAL ===== */
                .controls {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 10px 12px;
                    margin-bottom: 6px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(0,255,163,0.06);
                    clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
                }
                .controls-row {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                /* ============================================================
                   CONSOLE SHELL — perbaikan bug: input/select native Android
                   WebView tetap memaksakan chrome rounded-nya sendiri walau
                   clip-path sudah dipasang langsung di elemen. Solusinya:
                   pisahkan bentuk visual (di wrapper div) dari kontrol native
                   (dibuat transparan total di dalamnya) - bentuk cut-corner
                   sekarang datang dari wrapper yang tidak bisa "dilawan" oleh
                   native chrome apa pun.
                   ============================================================ */
                .console-shell {
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(0,255,163,0.1);
                    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .console-native {
                    display: block;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 6px 12px;
                    background: transparent;
                    background-color: transparent;
                    border: none;
                    border-radius: 0;
                    outline: none;
                    color: #E8F0F8;
                    font-size: 11px;
                    font-family: inherit;
                    -webkit-appearance: none;
                    appearance: none;
                }
                .console-select {
                    cursor: pointer;
                    font-size: 10px;
                    background-image: linear-gradient(45deg, transparent 50%, #00FFA3 50%), linear-gradient(135deg, #00FFA3 50%, transparent 50%);
                    background-position: calc(100% - 14px) center, calc(100% - 9px) center;
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                }
                .console-native::placeholder { color: rgba(232,240,248,0.35); }

                .topic-input {
                    flex: 2;
                    min-width: 120px;
                    padding: 6px 12px;
                    background: rgba(0,0,0,0.32);
                    border: 1px solid rgba(0,255,163,0.08);
                    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
                    color: #E8F0F8;
                    font-size: 11px;
                    outline: none;
                }
                .select-input {
                    padding: 6px 12px;
                    background: rgba(0,0,0,0.45);
                    border: 1px solid rgba(0,255,163,0.1);
                    clip-path: polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px);
                    color: #E8F0F8;
                    font-size: 10px;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                    background-image: linear-gradient(45deg, transparent 50%, #00FFA3 50%), linear-gradient(135deg, #00FFA3 50%, transparent 50%);
                    background-position: calc(100% - 14px) center, calc(100% - 9px) center;
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                }
                .beat-btn {
                    padding: 6px 12px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 1px solid #FFB02055;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5);
                    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
                    color: #FFB020;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .bpm-badge {
                    padding: 4px 10px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 1px solid #FFB02055;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5);
                    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
                    font-size: 9px;
                    color: #FFB020;
                    cursor: pointer;
                    font-family: 'Courier New', monospace;
                }
                .history-btn {
                    padding: 5px 12px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 1px solid rgba(255,255,255,0.12);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5);
                    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
                    color: rgba(255,255,255,0.7);
                    font-size: 9px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .hof-btn {
                    border-color: rgba(0,255,163,0.2);
                    color: #00FFA3;
                }
                .btn-tournament {
                    padding: 12px 20px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 1.5px solid #FF6B6B;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5);
                    clip-path: polygon(10px 0, 100% 0, 100% 100%, calc(100% - 10px) 100%, 0 100%, 0 10px);
                    color: #FF6B6B;
                    font-weight: 700;
                    font-size: 11px;
                    letter-spacing: 1px;
                    cursor: pointer;
                }
                .actions-row {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .btn-start {
                    padding: 16px 30px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 2px solid #00FFA3;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.6), 0 0 24px -6px rgba(0,255,163,0.6);
                    clip-path: polygon(12px 0, 100% 0, 100% 100%, calc(100% - 12px) 100%, 0 100%, 0 12px);
                    color: #00FFA3;
                    font-weight: 900;
                    font-size: 13px;
                    letter-spacing: 1.5px;
                    cursor: pointer;
                }
                .btn-start:disabled {
                    border-color: #FF6B6B;
                    color: #FF6B6B;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.6);
                }
                .btn-stop {
                    padding: 16px 30px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 2px solid #FF6B6B;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.6), 0 0 24px -6px rgba(255,107,107,0.7);
                    clip-path: polygon(12px 0, 100% 0, 100% 100%, calc(100% - 12px) 100%, 0 100%, 0 12px);
                    color: #FF6B6B;
                    font-weight: 900;
                    font-size: 13px;
                    letter-spacing: 1.5px;
                    cursor: pointer;
                }
                .btn-export {
                    padding: 6px 10px;
                    background: linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5);
                    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
                    color: rgba(255,255,255,0.6);
                    font-size: 9px;
                    font-weight: 700;
                    cursor: pointer;
                }

                /* ===== BATTLE ARCHIVE (log/result) ===== */
                .battle-log {
                    height: 200px;
                    overflow-y: auto;
                    padding: 10px 14px;
                    background: rgba(0,0,0,0.32);
                    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
                    margin: 4px 0 6px 0;
                    border: 1px solid rgba(0,255,163,0.06);
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.5;
                    color: #E8F0F8;
                }
                .battle-log::-webkit-scrollbar { width: 3px; }
                .battle-log::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .battle-log::-webkit-scrollbar-thumb { background: rgba(0,255,163,0.15); border-radius: 4px; }

                /* ===== BACK BUTTON ===== */
                .back-btn {
                    margin-top: 10px;
                    padding: 5px 14px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(0,255,163,0.06);
                    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
                    color: rgba(255,255,255,0.4);
                    font-size: 10px;
                    cursor: pointer;
                }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 768px) {
                    .rap-modern-wrapper { padding: 8px; }
                    .arena-title { font-size: 15px; }
                    .scoreboard-bar { overflow-x: auto; }
                    .score-cell { flex: 0 0 auto; min-width: 78px; }
                    .control-room { flex-direction: column; }
                    .control-room-divider { display: none; }
                    .battle-stage { flex-direction: column; }
                    .controls-row { flex-direction: column; align-items: stretch; }
                    .controls-row .console-shell:first-child { min-width: 100%; }
                    .actions-row { justify-content: center; }
                    .battle-log { height: 180px; }
                }

                /* ===== ANIMATIONS (dipertahankan, motion vocabulary sama) ===== */
                @keyframes reactionPop {
                    0%{transform:scale(0) rotate(0deg); opacity:0}
                    50%{transform:scale(1.5) rotate(20deg); opacity:1}
                    70%{transform:scale(0.8) rotate(-10deg)}
                    100%{transform:scale(1) rotate(0deg); opacity:1}
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .flow-stat-item {
                    display:inline-block; padding:2px 8px; margin:0 4px;
                    background:rgba(0,255,163,0.03); border-radius:6px;
                    font-size:9px; color:rgba(255,255,255,0.4);
                }
                .flow-stat-item .value { color:#00FFA3; font-weight:bold; }
`;
            document.head.appendChild(style);
        }
    }

    KESEMPATAN.RapUIStyle = {
        inject: inject
    };
})();

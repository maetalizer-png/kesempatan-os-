(function() {
    'use strict';
    if (window.__NoiseUIRenderLoaded) return;
    window.__NoiseUIRenderLoaded = true;

    const CONFIG = window.__NoiseConfig?.CONFIG || {};
    const Utils = window.__NoiseUtils?.Utils || {};
    const NoiseState = window.__NoiseState || {};
    const NoiseCore = window.NoiseCore || {};
    const NoiseChart = window.NoiseChart || {};
    const NoiseEvents = window.NoiseEvents || {};
    const noiseIcon = window.noiseIcon || function() { return ''; };
    const _state = NoiseState.state || {};

    function updateStatsUI() {
        const stats = _state.stats;
        const totalEl = document.getElementById('noise-total');
        const allowedEl = document.getElementById('noise-allowed');
        const filteredEl = document.getElementById('noise-filtered');
        const blockedEl = document.getElementById('noise-blocked');
        if (totalEl) totalEl.textContent = stats.total;
        if (allowedEl) allowedEl.textContent = stats.allowed;
        if (filteredEl) filteredEl.textContent = stats.filtered;
        if (blockedEl) blockedEl.textContent = stats.blocked;

        const pct = function(n) { return stats.total ? ((n / stats.total) * 100).toFixed(1) : '0.0'; };
        const allowedPctEl = document.getElementById('noise-allowed-pct');
        const filteredPctEl = document.getElementById('noise-filtered-pct');
        const blockedPctEl = document.getElementById('noise-blocked-pct');
        if (allowedPctEl) allowedPctEl.textContent = pct(stats.allowed) + '%';
        if (filteredPctEl) filteredPctEl.textContent = pct(stats.filtered) + '%';
        if (blockedPctEl) blockedPctEl.textContent = pct(stats.blocked) + '%';

        const avgConfEl = document.getElementById('noise-avg-conf');
        if (avgConfEl) {
            const signals = _state.signals || [];
            if (signals.length) {
                let sum = 0;
                signals.forEach(function(s) { sum += (s.confidence || 0); });
                avgConfEl.textContent = Math.round(sum / signals.length) + '%';
            } else {
                avgConfEl.textContent = '—';
            }
        }
    }

    function updateStatusUI(isScanning) {
        const statusText = document.getElementById('noise-status-text');
        const statusDot = document.getElementById('noise-status-dot');
        const spinner = document.getElementById('noise-spinner');
        if (!statusText || !statusDot) return;
        if (isScanning) {
            statusText.innerHTML = noiseIcon('radio', 11) + ' MEMINDAI...';
            statusDot.style.color = '#FFB224';
            if (spinner) spinner.style.display = 'inline-block';
        } else if (_state.isRunning) {
            statusText.innerHTML = noiseIcon('radio', 11) + ' LIVE';
            statusDot.style.color = '#00FFA3';
            if (spinner) spinner.style.display = 'none';
        } else {
            statusText.innerHTML = noiseIcon('power-off', 11) + ' STOP';
            statusDot.style.color = '#FF4D5E';
            if (spinner) spinner.style.display = 'none';
        }
        const lastScanEl = document.getElementById('noise-last-scan');
        if (lastScanEl) {
            lastScanEl.textContent = _state.lastScan ? new Date(_state.lastScan).toLocaleTimeString() : '-';
        }
    }

    function updateSignalList(signals) {
        const container = document.getElementById('noise-signal-list');
        if (!container) return;
        let filtered = signals;
        if (_state.statusFilter && _state.statusFilter !== 'all') {
            filtered = filtered.filter(function(s) { return s.status === _state.statusFilter; });
        }
        if (_state.sentimentFilter && _state.sentimentFilter !== 'all') {
            filtered = filtered.filter(function(s) { return s.sentiment === _state.sentimentFilter; });
        }
        if (filtered.length === 0) {
            container.innerHTML = '<div class="nf-empty">' + noiseIcon('inbox', 24) + '<div class="nf-empty-text">Tidak ada sinyal yang cocok. Ubah filter status atau sentimen untuk melihat sinyal lain.</div></div>';
            return;
        }
        let html = '';
        filtered.slice(0, 40).forEach(function(s) {
            const statusColors = { allowed: '#00FFA3', filtered: '#FFB224', blocked: '#FF4D5E' };
            const iconNames = { allowed: 'shield-check', filtered: 'shield-alert', blocked: 'shield-x' };
            const color = statusColors[s.status] || '#7C8A83';
            const icon = noiseIcon(iconNames[s.status] || 'pin', 11, color);
            const time = s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : '-';
            const conf = s.confidence || 0;
            const barColor = conf >= 70 ? '#00FFA3' : (conf >= 40 ? '#FFB224' : '#FF4D5E');
            html += '<article class="nf-signal" style="--sig:' + color + ';">' +
                '<div class="nf-signal-verdict">' +
                    '<div class="nf-signal-conf" style="color:' + barColor + ';">' + conf + '<span>%</span></div>' +
                    '<div class="nf-signal-conf-label">CONFIDENCE</div>' +
                    '<div class="nf-signal-status" style="color:' + color + ';border-color:' + color + '55;background:' + color + '14;">' + s.status.toUpperCase() + '</div>' +
                '</div>' +
                '<div class="nf-signal-body">' +
                    '<div class="nf-signal-content">' + icon + ' ' + Utils.escapeHtml(s.content.substring(0, 120)) + '</div>' +
                    '<div class="nf-signal-meta">' +
                        '<span>' + noiseIcon('pin', 9) + ' ' + Utils.escapeHtml(s.source || 'Unknown') + '</span>' +
                        '<span>' + time + '</span>' +
                        '<span>' + noiseIcon('message-circle', 9) + ' ' + s.sentiment + '</span>' +
                        '<span>' + noiseIcon('bar-chart-2', 9) + ' ' + s.credibilityScore + '%</span>' +
                    '</div>' +
                    '<div class="nf-signal-reason">' + s.reason + '</div>' +
                    '<div class="nf-signal-track"><div class="nf-signal-fill" style="width:' + conf + '%;background:' + barColor + ';box-shadow:0 0 8px ' + barColor + '66;"></div></div>' +
                '</div>' +
            '</article>';
        });
        container.innerHTML = html;
    }

    function updateHistoryList(history) {
        const container = document.getElementById('noise-history-list');
        if (!container) return;
        if (history.length === 0) {
            container.innerHTML = '<div class="nf-empty"><div class="nf-empty-text">Belum ada riwayat. Riwayat terisi otomatis setiap kali pemindaian selesai.</div></div>';
            return;
        }
        let html = '';
        history.slice(0, 10).forEach(function(h) {
            const d = new Date(h.timestamp).toLocaleTimeString();
            html += '<div class="nf-history-row">' +
                '<span class="nf-history-time">' + d + '</span>' +
                '<span class="nf-history-counts">' +
                    '<em style="color:#00FFA3;">' + noiseIcon('shield-check', 10, '#00FFA3') + ' ' + h.allowed + '</em>' +
                    '<em style="color:#FFB224;">' + noiseIcon('shield-alert', 10, '#FFB224') + ' ' + h.filtered + '</em>' +
                    '<em style="color:#FF4D5E;">' + noiseIcon('shield-x', 10, '#FF4D5E') + ' ' + h.blocked + '</em>' +
                '</span>' +
                '<span class="nf-history-total">' + h.total + ' sinyal</span>' +
            '</div>';
        });
        container.innerHTML = html;
    }

    function setStatusFilter(filter) {
        _state.statusFilter = filter;
        if (NoiseCore.saveState) NoiseCore.saveState();
        updateSignalList(_state.signals);
        const btns = document.querySelectorAll('.noise-page .filter-btn[data-filter]');
        btns.forEach(function(btn) { btn.classList.toggle('active', btn.dataset.filter === filter); });
    }

    function setSentimentFilter(filter) {
        _state.sentimentFilter = filter;
        if (NoiseCore.saveState) NoiseCore.saveState();
        updateSignalList(_state.signals);
        const btns = document.querySelectorAll('.noise-page .filter-btn[data-sentiment]');
        btns.forEach(function(btn) { btn.classList.toggle('active', btn.dataset.sentiment === filter); });
    }

    function renderDashboard() {
        const inner = document.getElementById('noisePage');
        if (!inner) {
            const fallback = document.getElementById('pageInner');
            if (fallback) {
                fallback.innerHTML = '<div style="padding:20px; color:#ff4444;">⚠️ Kontainer #noisePage tidak ditemukan. Pastikan index.html sudah diperbarui.</div>';
            }
            return;
        }

        const stats = _state.stats;
        const isRunning = _state.isRunning;
        const lastScan = _state.lastScan ? new Date(_state.lastScan).toLocaleTimeString() : '-';
        const statusColor = isRunning ? '#00FFA3' : '#FF4D5E';
        const statusText = isRunning ? (noiseIcon('radio', 11) + ' LIVE') : (noiseIcon('power-off', 11) + ' STOP');
        const blacklistStr = _state.blacklist.join(', ');
        const whitelistStr = _state.whitelist.join(', ');
        const statusFilter = _state.statusFilter || 'all';
        const sentimentFilter = _state.sentimentFilter || 'all';
        const pipelineStages = ['Signal Intake', 'AI Classification', 'Rule Engine', 'Noise Detection', 'Decision Engine', 'Output'];
        let avgConfInitial = '—';
        if (_state.signals && _state.signals.length) {
            let confSum = 0;
            _state.signals.forEach(function(s) { confSum += (s.confidence || 0); });
            avgConfInitial = Math.round(confSum / _state.signals.length) + '%';
        }

        inner.innerHTML = [
            '<div class="noise-page">',
                '<style>',
                    '.noise-page {',
                        '--nf-bg: #05070A;',
                        '--nf-ink: #E6F2EC;',
                        '--nf-ink-2: #9DB2A8;',
                        '--nf-ink-3: #5A6B64;',
                        '--nf-acc: #00FFA3;',
                        '--nf-amber: #FFB224;',
                        '--nf-red: #FF4D5E;',
                        '--nf-line: rgba(0,255,163,0.14);',
                        '--nf-hair: rgba(230,242,236,0.07);',
                        '--nf-glass: rgba(9,14,18,0.55);',
                        '--nf-mono: ui-monospace, "SF Mono", "Roboto Mono", monospace;',
                        'background: var(--nf-bg);',
                        'color: var(--nf-ink);',
                        'min-height: 100%;',
                    '}',
                    '.noise-page * { box-sizing: border-box; }',
                    '.noise-page .nf-shell { max-width: 560px; margin: 0 auto; padding: 18px 16px 28px; }',
                    '.noise-page .nf-eyebrow { font-family: var(--nf-mono); font-size: 8.5px; font-weight: 700; letter-spacing: 2.2px; text-transform: uppercase; color: var(--nf-acc); opacity: 0.75; }',
                    '.noise-page .nf-section-label { display: flex; align-items: center; gap: 8px; font-family: var(--nf-mono); font-size: 8.5px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--nf-ink-3); margin: 26px 0 12px; }',
                    '.noise-page .nf-section-label::before { content: ""; width: 14px; height: 1px; background: var(--nf-acc); box-shadow: 0 0 6px rgba(0,255,163,0.6); }',
                    '.noise-page .nf-section-label::after { content: ""; flex: 1; height: 1px; background: var(--nf-hair); }',
                    '.noise-page .noise-header { position: relative; overflow: hidden; padding: 20px 2px 18px; border-bottom: 1px solid var(--nf-line); margin-bottom: 4px; }',
                    '.noise-page .noise-header::after { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,255,163,0.85), transparent); animation: nfScanline 5.5s ease-in-out infinite; opacity: 0.5; pointer-events: none; }',
                    '@keyframes nfScanline { 0% { transform: translateY(0); opacity: 0; } 8% { opacity: 0.55; } 50% { transform: translateY(96px); opacity: 0.25; } 92% { opacity: 0.5; } 100% { transform: translateY(0); opacity: 0; } }',
                    '.noise-page .nf-header-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }',
                    '.noise-page .noise-header .title { font-family: var(--nf-mono); font-size: clamp(27px, 8.4vw, 40px); font-weight: 800; line-height: 0.98; letter-spacing: -0.5px; text-transform: uppercase; color: var(--nf-acc); text-shadow: 0 0 22px rgba(0,255,163,0.32), 0 0 60px rgba(0,255,163,0.12); }',
                    '.noise-page .noise-header .sub { font-size: 11px; line-height: 1.55; color: var(--nf-ink-2); margin-top: 10px; max-width: 40ch; }',
                    '.noise-page .nf-header-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }',
                    '.noise-page .noise-header .badge-active { font-family: var(--nf-mono); font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--nf-acc); background: rgba(0,255,163,0.07); border: 1px solid rgba(0,255,163,0.3); border-radius: 999px; padding: 4px 12px; }',
                    '.noise-page .noise-header .badge-interval { font-family: var(--nf-mono); font-size: 9px; letter-spacing: 0.6px; color: var(--nf-ink-2); background: rgba(230,242,236,0.03); border: 1px solid var(--nf-hair); border-radius: 999px; padding: 4px 12px; }',
                    '.noise-page .noise-status-bar { display: flex; flex-direction: column; gap: 10px; margin: 14px 0 4px; padding: 12px 14px; background: var(--nf-glass); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid var(--nf-hair); border-left: 2px solid var(--nf-acc); border-radius: 10px; }',
                    '.noise-page .noise-status-bar .status-info { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; font-family: var(--nf-mono); font-size: 10.5px; }',
                    '.noise-page .noise-status-bar .status-info .nf-kv { color: var(--nf-ink-3); }',
                    '.noise-page .noise-status-bar .status-info .nf-kv b { color: var(--nf-ink-2); font-weight: 600; }',
                    '.noise-page .noise-status-dot { font-size: 15px; line-height: 1; }',
                    '.noise-page .noise-status-dot.live-pulse { animation: nfPulse 1.8s ease-out infinite; border-radius: 50%; }',
                    '@keyframes nfPulse { 0% { text-shadow: 0 0 0 rgba(0,255,163,0.7); } 70% { text-shadow: 0 0 14px rgba(0,255,163,0); } 100% { text-shadow: 0 0 0 rgba(0,255,163,0); } }',
                    '.noise-page .noise-spinner { display: none; width: 14px; height: 14px; border: 2px solid rgba(0,255,163,0.18); border-top-color: var(--nf-acc); border-radius: 50%; animation: noise-spin 0.6s linear infinite; vertical-align: middle; }',
                    '@keyframes noise-spin { to { transform: rotate(360deg); } }',
                    '.noise-page .noise-center-panel { display: flex; align-items: center; gap: 18px; padding: 16px 4px 6px; }',
                    '.noise-page .noise-ring-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }',
                    '.noise-page .noise-ring-legend { display: flex; gap: 10px; font-family: var(--nf-mono); font-size: 7.5px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--nf-ink-3); }',
                    '.noise-page .noise-ring-legend span { display: flex; align-items: center; gap: 4px; }',
                    '.noise-page .noise-ring-legend i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; box-shadow: 0 0 5px currentColor; }',
                    '.noise-page .stats-compact { flex: 1; min-width: 0; display: grid; grid-template-columns: 1fr 1fr; }',
                    '.noise-page .stats-compact .stat-item { padding: 10px 12px; border-left: 1px solid var(--nf-hair); transition: background 140ms ease-out; }',
                    '.noise-page .stats-compact .stat-item:nth-child(-n+2) { border-bottom: 1px solid var(--nf-hair); }',
                    '.noise-page .stats-compact .stat-item:active { background: rgba(0,255,163,0.05); }',
                    '.noise-page .stats-compact .stat-item .stat-number { font-family: var(--nf-mono); font-size: 26px; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }',
                    '.noise-page .stats-compact .stat-item .stat-label { font-family: var(--nf-mono); font-size: 7.5px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--nf-ink-3); display: flex; align-items: center; gap: 4px; margin-top: 2px; }',
                    '.noise-page .stats-compact .stat-item .stat-pct { font-family: var(--nf-mono); font-size: 8px; color: var(--nf-ink-3); margin-top: 2px; }',
                    '.noise-page .stats-compact .stat-item.total .stat-number { color: var(--nf-ink); }',
                    '.noise-page .stats-compact .stat-item.allowed .stat-number { color: var(--nf-acc); text-shadow: 0 0 14px rgba(0,255,163,0.3); }',
                    '.noise-page .stats-compact .stat-item.filtered .stat-number { color: var(--nf-amber); }',
                    '.noise-page .stats-compact .stat-item.blocked .stat-number { color: var(--nf-red); }',
                    '.noise-page .nf-avg-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-top: 12px; padding: 10px 14px; border: 1px solid var(--nf-hair); border-radius: 10px; background: rgba(0,255,163,0.025); }',
                    '.noise-page .nf-avg-row .nf-avg-label { font-family: var(--nf-mono); font-size: 8px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--nf-ink-3); }',
                    '.noise-page .nf-avg-row .nf-avg-value { font-family: var(--nf-mono); font-size: 20px; font-weight: 800; color: var(--nf-acc); font-variant-numeric: tabular-nums; }',
                    '.noise-page .nf-pipeline { position: relative; padding: 6px 0 6px 22px; }',
                    '.noise-page .nf-pipeline::before { content: ""; position: absolute; left: 7px; top: 10px; bottom: 10px; width: 1px; background: linear-gradient(180deg, rgba(0,255,163,0.5), rgba(0,255,163,0.08)); }',
                    '.noise-page .nf-pipeline::after { content: ""; position: absolute; left: 5px; top: 10px; width: 5px; height: 5px; border-radius: 50%; background: var(--nf-acc); box-shadow: 0 0 10px rgba(0,255,163,0.9); animation: nfFlow 4.2s linear infinite; }',
                    '@keyframes nfFlow { 0% { transform: translateY(0); opacity: 0; } 6% { opacity: 1; } 94% { opacity: 1; } 100% { transform: translateY(198px); opacity: 0; } }',
                    '.noise-page .nf-stage { position: relative; display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 8px 0; }',
                    '.noise-page .nf-stage::before { content: ""; position: absolute; left: -18.5px; top: 50%; transform: translateY(-50%); width: 6px; height: 6px; border-radius: 50%; border: 1px solid var(--nf-acc); background: var(--nf-bg); }',
                    '.noise-page .nf-stage-name { font-family: var(--nf-mono); font-size: 11px; font-weight: 600; letter-spacing: 0.4px; color: var(--nf-ink-2); }',
                    '.noise-page .nf-stage-idx { font-family: var(--nf-mono); font-size: 8px; letter-spacing: 1.2px; color: var(--nf-ink-3); }',
                    '.noise-page .nf-filter-block { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }',
                    '.noise-page .filter-group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }',
                    '.noise-page .filter-group-label { font-family: var(--nf-mono); font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--nf-ink-3); flex-basis: 100%; }',
                    '.noise-page .filter-btn { padding: 5px 13px; border-radius: 999px; border: 1px solid var(--nf-hair); background: transparent; color: var(--nf-ink-2); cursor: pointer; font-size: 10px; font-family: var(--nf-mono); transition: background 140ms ease-out, border-color 140ms ease-out, color 140ms ease-out, box-shadow 140ms ease-out; }',
                    '.noise-page .filter-btn.active { background: rgba(0,255,163,0.12); border-color: var(--nf-acc); color: var(--nf-acc); box-shadow: 0 0 12px rgba(0,255,163,0.18); }',
                    '.noise-page .filter-btn:hover { background: rgba(0,255,163,0.06); border-color: rgba(0,255,163,0.4); }',
                    '#noise-signal-list { max-height: 430px; overflow-y: auto; margin-bottom: 6px; scrollbar-width: thin; scrollbar-color: rgba(0,255,163,0.25) transparent; }',
                    '.noise-page .nf-signal { display: grid; grid-template-columns: 74px 1fr; gap: 12px; padding: 12px 12px 12px 14px; margin-bottom: 8px; background: var(--nf-glass); border: 1px solid var(--nf-hair); border-radius: 12px; position: relative; overflow: hidden; }',
                    '.noise-page .nf-signal::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px; border-radius: 2px; background: var(--sig); box-shadow: 0 0 8px var(--sig); }',
                    '.noise-page .nf-signal-verdict { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border-right: 1px solid var(--nf-hair); padding-right: 10px; text-align: center; }',
                    '.noise-page .nf-signal-conf { font-family: var(--nf-mono); font-size: 27px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }',
                    '.noise-page .nf-signal-conf span { font-size: 13px; font-weight: 700; opacity: 0.7; }',
                    '.noise-page .nf-signal-conf-label { font-family: var(--nf-mono); font-size: 6px; letter-spacing: 1.4px; color: var(--nf-ink-3); }',
                    '.noise-page .nf-signal-status { font-family: var(--nf-mono); font-size: 7.5px; font-weight: 700; letter-spacing: 0.8px; border: 1px solid; border-radius: 4px; padding: 2px 6px; margin-top: 3px; white-space: nowrap; }',
                    '.noise-page .nf-signal-body { min-width: 0; }',
                    '.noise-page .nf-signal-content { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 1.45; color: var(--nf-ink); }',
                    '.noise-page .nf-signal-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 7px; font-size: 9px; font-family: var(--nf-mono); color: var(--nf-ink-3); }',
                    '.noise-page .nf-signal-meta span { display: flex; align-items: center; gap: 4px; }',
                    '.noise-page .nf-signal-reason { margin-top: 5px; font-size: 9.5px; font-family: var(--nf-mono); color: var(--nf-ink-2); opacity: 0.8; }',
                    '.noise-page .nf-signal-track { margin-top: 8px; height: 2px; background: rgba(230,242,236,0.06); border-radius: 2px; overflow: hidden; }',
                    '.noise-page .nf-signal-fill { height: 100%; transition: width 240ms ease-out; }',
                    '.noise-page .nf-empty { color: var(--nf-ink-3); padding: 34px 18px; text-align: center; }',
                    '.noise-page .nf-empty-text { margin-top: 10px; font-size: 11px; line-height: 1.6; max-width: 34ch; margin-left: auto; margin-right: auto; }',
                    '.noise-page .chart-container { background: var(--nf-glass); border: 1px solid var(--nf-hair); border-radius: 12px; padding: 14px; text-align: center; }',
                    '.noise-page .chart-container canvas { width: 100%; height: auto; max-height: 120px; }',
                    '.noise-page .nf-chart-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }',
                    '.noise-page .nf-chart-title { font-family: var(--nf-mono); font-size: 8px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--nf-ink-3); }',
                    '.noise-page .nf-chart-legend { display: flex; gap: 12px; font-size: 7.5px; font-family: var(--nf-mono); color: var(--nf-ink-3); }',
                    '.noise-page .nf-chart-legend i { display: inline-block; width: 10px; height: 2px; margin-right: 4px; vertical-align: middle; }',
                    '.noise-page details { margin-top: 14px; }',
                    '.noise-page details summary { cursor: pointer; list-style: none; display: flex; align-items: center; gap: 8px; font-family: var(--nf-mono); font-size: 9px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: var(--nf-ink-2); padding: 10px 0; border-top: 1px solid var(--nf-hair); }',
                    '.noise-page details summary::-webkit-details-marker { display: none; }',
                    '.noise-page details summary::after { content: "+"; margin-left: auto; color: var(--nf-acc); font-size: 12px; }',
                    '.noise-page details[open] summary::after { content: "−"; }',
                    '.noise-page .nf-history-panel { background: var(--nf-glass); border: 1px solid var(--nf-hair); border-radius: 12px; padding: 6px 12px; max-height: 200px; overflow-y: auto; }',
                    '.noise-page .nf-history-row { display: grid; grid-template-columns: 64px 1fr auto; align-items: center; gap: 8px; padding: 7px 2px; border-bottom: 1px solid var(--nf-hair); font-size: 9.5px; font-family: var(--nf-mono); }',
                    '.noise-page .nf-history-row:last-child { border-bottom: none; }',
                    '.noise-page .nf-history-time { color: var(--nf-ink-2); }',
                    '.noise-page .nf-history-counts { display: flex; gap: 12px; }',
                    '.noise-page .nf-history-counts em { font-style: normal; display: flex; align-items: center; gap: 3px; }',
                    '.noise-page .nf-history-total { color: var(--nf-ink-3); text-align: right; }',
                    '.noise-page .nf-sec-grid { display: flex; flex-direction: column; gap: 10px; }',
                    '.noise-page .nf-sec-panel { background: var(--nf-glass); border: 1px solid var(--nf-hair); border-radius: 12px; padding: 12px 14px; position: relative; overflow: hidden; }',
                    '.noise-page .nf-sec-panel::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px; border-radius: 2px; background: var(--sec); box-shadow: 0 0 8px var(--sec); }',
                    '.noise-page .nf-sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }',
                    '.noise-page .nf-sec-title { display: flex; align-items: center; gap: 6px; font-family: var(--nf-mono); font-size: 8.5px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; }',
                    '.noise-page .nf-sec-count { font-family: var(--nf-mono); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }',
                    '.noise-page .nf-sec-tags { display: flex; flex-wrap: wrap; gap: 5px; }',
                    '.noise-page .nf-sec-tag { font-size: 9px; font-family: var(--nf-mono); border: 1px solid; border-radius: 4px; padding: 2px 7px; }',
                    '.noise-page .nf-sec-empty { color: var(--nf-ink-3); font-size: 10px; }',
                    '.noise-page .nf-rules-row { display: flex; justify-content: space-between; gap: 8px; font-family: var(--nf-mono); font-size: 9px; color: var(--nf-ink-3); padding: 8px 2px 0; }',
                    '.noise-page .nf-rules-row b { color: var(--nf-ink-2); font-weight: 600; }',
                    '.noise-page .nf-deck { position: sticky; bottom: 10px; z-index: 5; margin-top: 24px; padding: 12px; background: rgba(6,10,13,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--nf-line); border-radius: 14px; box-shadow: 0 -8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(0,255,163,0.05); }',
                    '.noise-page .action-buttons { display: flex; flex-wrap: wrap; gap: 8px; }',
                    '.noise-page .action-buttons .nf-deck-row { display: flex; gap: 8px; flex-basis: 100%; }',
                    '.noise-page .execute-btn { background: rgba(0,255,163,0.08); border: 1px solid rgba(0,255,163,0.35); border-radius: 9px; color: var(--nf-acc); cursor: pointer; font-family: var(--nf-mono); font-weight: 700; font-size: 11px; letter-spacing: 0.6px; padding: 11px 14px; flex: 1; white-space: nowrap; transition: background 140ms ease-out, border-color 140ms ease-out, box-shadow 140ms ease-out, transform 100ms ease-out; }',
                    '.noise-page .execute-btn:hover { background: rgba(0,255,163,0.16); border-color: var(--nf-acc); box-shadow: 0 0 16px rgba(0,255,163,0.18); }',
                    '.noise-page .execute-btn:active { transform: scale(0.98); }',
                    '.noise-page .execute-btn.secondary { background: rgba(230,242,236,0.03); border-color: var(--nf-hair); color: var(--nf-ink-2); }',
                    '.noise-page .execute-btn.secondary:hover { background: rgba(230,242,236,0.07); box-shadow: none; }',
                    '.noise-page .execute-btn.danger { border-color: rgba(255,77,94,0.5); color: var(--nf-red); }',
                    '.noise-page .execute-btn.danger:hover { background: rgba(255,77,94,0.12); }',
                    '.noise-page .nf-deck .nf-deck-small { flex: 0 1 auto; padding: 8px 12px; font-size: 9.5px; font-weight: 600; }',
                    '#noise-settings-panel { margin-top: 14px; padding: 16px; background: var(--nf-glass); border: 1px solid var(--nf-line); border-radius: 12px; }',
                    '#noise-settings-panel h4 { margin: 0 0 12px; font-family: var(--nf-mono); font-size: 9px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: var(--nf-acc); }',
                    '.noise-page .noise-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }',
                    '.noise-page .noise-settings-grid label { display: block; font-size: 9px; font-family: var(--nf-mono); letter-spacing: 0.6px; color: var(--nf-ink-2); margin-bottom: 5px; }',
                    '.noise-page .noise-settings-grid input { width: 100%; padding: 9px 10px; background: rgba(0,0,0,0.35); border: 1px solid var(--nf-hair); border-radius: 8px; color: var(--nf-ink); font-family: var(--nf-mono); font-size: 12px; transition: border-color 140ms ease-out, box-shadow 140ms ease-out; }',
                    '.noise-page .noise-settings-grid input:focus { outline: none; border-color: rgba(0,255,163,0.5); box-shadow: 0 0 0 2px rgba(0,255,163,0.12); }',
                    '.noise-page .noise-footer { margin-top: 22px; padding: 14px 0 4px; border-top: 1px solid var(--nf-hair); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-family: var(--nf-mono); font-size: 8.5px; letter-spacing: 0.8px; color: var(--nf-ink-3); }',
                    '@media (prefers-reduced-motion: reduce) { .noise-page .noise-header::after, .noise-page .nf-pipeline::after, .noise-page .noise-status-dot.live-pulse { animation: none; } }',
                    '@media (max-width: 380px) { .noise-page .noise-center-panel { flex-direction: column; align-items: stretch; } .noise-page .stats-compact .stat-item .stat-number { font-size: 22px; } .noise-page .nf-signal { grid-template-columns: 64px 1fr; } .noise-page .nf-signal-conf { font-size: 23px; } }',
                    '@media print { .noise-page .noise-header .badge-active, .noise-page .noise-header .badge-interval, .noise-page .filter-btn, .noise-page .execute-btn, .noise-page .nf-deck { display: none !important; } .noise-page .noise-footer { display: none !important; } }',
                '</style>',
                '<div class="nf-shell">',
                    '<div class="noise-header">',
                        '<div class="nf-header-top">',
                            '<span class="nf-eyebrow">KESEMPATAN OS · AI Filtering</span>',
                            '<span class="badge-active">' + (isRunning ? (noiseIcon('radio', 9) + ' ACTIVE') : (noiseIcon('power-off', 9) + ' PAUSED')) + '</span>',
                        '</div>',
                        '<div class="title">Noise<br>Filtering Engine</div>',
                        '<div class="sub">Menyaring sinyal real-time dari Observation Engine</div>',
                        '<div class="nf-header-badges">',
                            '<span class="badge-interval">' + noiseIcon('zap', 9) + ' ' + (_state.intervalMs / 1000).toFixed(0) + 's</span>',
                            '<span class="badge-interval">' + noiseIcon('bar-chart-2', 9) + ' ' + _state.signals.length + ' sinyal</span>',
                            '<span class="badge-interval">' + noiseIcon('target', 9) + ' ' + _state.threshold + '%</span>',
                        '</div>',
                    '</div>',
                    '<div class="noise-status-bar">',
                        '<div class="status-info">',
                            '<span id="noise-status-dot" class="noise-status-dot' + (isRunning ? ' live-pulse' : '') + '" style="color:' + statusColor + ';">●</span>',
                            '<span id="noise-status-text" style="color:' + statusColor + ';font-weight:700;">' + statusText + '</span>',
                            '<span class="noise-spinner" id="noise-spinner"></span>',
                            '<span class="nf-kv">Last scan <b id="noise-last-scan">' + lastScan + '</b></span>',
                            '<span class="nf-kv">Interval <b>' + (_state.intervalMs / 1000).toFixed(0) + 's</b></span>',
                            '<span class="nf-kv">Threshold <b>' + _state.threshold + '%</b></span>',
                        '</div>',
                    '</div>',
                    '<div class="nf-section-label">Ringkasan Penyaringan</div>',
                    '<div class="noise-center-panel">',
                        '<div class="noise-ring-wrap">',
                            '<canvas id="noise-verdict-ring" width="140" height="140"></canvas>',
                            '<div class="noise-ring-legend">',
                                '<span><i style="background:#00FFA3;color:#00FFA3;"></i>Lolos</span>',
                                '<span><i style="background:#FFB224;color:#FFB224;"></i>Difilter</span>',
                                '<span><i style="background:#FF4D5E;color:#FF4D5E;"></i>Diblokir</span>',
                            '</div>',
                        '</div>',
                        '<div class="stats-compact">',
                            '<div class="stat-item total"><div class="stat-number" id="noise-total" data-target="' + stats.total + '">0</div><div class="stat-label">Total Sinyal</div><div class="stat-pct">100%</div></div>',
                            '<div class="stat-item allowed"><div class="stat-number" id="noise-allowed" data-target="' + stats.allowed + '">0</div><div class="stat-label">' + noiseIcon('shield-check', 9, '#00FFA3') + ' Lolos</div><div id="noise-allowed-pct" class="stat-pct">' + (stats.total ? ((stats.allowed / stats.total) * 100).toFixed(1) : 0) + '%</div></div>',
                            '<div class="stat-item filtered"><div class="stat-number" id="noise-filtered" data-target="' + stats.filtered + '">0</div><div class="stat-label">' + noiseIcon('shield-alert', 9, '#FFB224') + ' Difilter</div><div id="noise-filtered-pct" class="stat-pct">' + (stats.total ? ((stats.filtered / stats.total) * 100).toFixed(1) : 0) + '%</div></div>',
                            '<div class="stat-item blocked"><div class="stat-number" id="noise-blocked" data-target="' + stats.blocked + '">0</div><div class="stat-label">' + noiseIcon('shield-x', 9, '#FF4D5E') + ' Diblokir</div><div id="noise-blocked-pct" class="stat-pct">' + (stats.total ? ((stats.blocked / stats.total) * 100).toFixed(1) : 0) + '%</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="nf-avg-row"><span class="nf-avg-label">Rata-rata Confidence</span><span class="nf-avg-value" id="noise-avg-conf">' + avgConfInitial + '</span></div>',
                    '<div class="nf-section-label">Filtering Pipeline</div>',
                    '<div class="nf-pipeline">',
                        pipelineStages.map(function(name, i) {
                            return '<div class="nf-stage"><span class="nf-stage-name">' + name + '</span><span class="nf-stage-idx">STAGE ' + (i + 1) + '/' + pipelineStages.length + '</span></div>';
                        }).join(''),
                    '</div>',
                    '<div class="nf-section-label">Sinyal Terkini</div>',
                    '<div class="nf-filter-block">',
                        '<div class="filter-group">',
                            '<span class="filter-group-label">Status</span>',
                            '<button class="filter-btn ' + (statusFilter === 'all' ? 'active' : '') + '" data-filter="all">Semua</button>',
                            '<button class="filter-btn ' + (statusFilter === 'allowed' ? 'active' : '') + '" data-filter="allowed" style="border-color:rgba(0,255,163,0.4);color:#00FFA3;">' + noiseIcon('shield-check', 10) + ' Lolos</button>',
                            '<button class="filter-btn ' + (statusFilter === 'filtered' ? 'active' : '') + '" data-filter="filtered" style="border-color:rgba(255,178,36,0.4);color:#FFB224;">' + noiseIcon('shield-alert', 10) + ' Difilter</button>',
                            '<button class="filter-btn ' + (statusFilter === 'blocked' ? 'active' : '') + '" data-filter="blocked" style="border-color:rgba(255,77,94,0.4);color:#FF4D5E;">' + noiseIcon('shield-x', 10) + ' Diblokir</button>',
                        '</div>',
                        '<div class="filter-group">',
                            '<span class="filter-group-label">Sentimen</span>',
                            '<button class="filter-btn ' + (sentimentFilter === 'all' ? 'active' : '') + '" data-sentiment="all">Semua</button>',
                            '<button class="filter-btn ' + (sentimentFilter === 'positive' ? 'active' : '') + '" data-sentiment="positive" style="border-color:rgba(0,255,163,0.4);color:#00FFA3;">' + noiseIcon('smile', 10) + ' Positif</button>',
                            '<button class="filter-btn ' + (sentimentFilter === 'negative' ? 'active' : '') + '" data-sentiment="negative" style="border-color:rgba(255,77,94,0.4);color:#FF4D5E;">' + noiseIcon('frown', 10) + ' Negatif</button>',
                            '<button class="filter-btn ' + (sentimentFilter === 'neutral' ? 'active' : '') + '" data-sentiment="neutral" style="border-color:rgba(255,178,36,0.4);color:#FFB224;">' + noiseIcon('meh', 10) + ' Netral</button>',
                        '</div>',
                    '</div>',
                    '<div id="noise-signal-list">',
                        (_state.signals.length === 0 ? '<div class="nf-empty"><div class="nf-empty-text">Belum ada sinyal. Pemindaian sedang berjalan — sinyal baru muncul di sini secara otomatis.</div></div>' : ''),
                    '</div>',
                    '<div class="nf-section-label">Aktivitas Pemindaian</div>',
                    '<div class="chart-container">',
                        '<div class="nf-chart-head">',
                            '<div class="nf-chart-title">7 Scan Terakhir</div>',
                            '<div class="nf-chart-legend">',
                                '<span><i style="background:#00FFA3;"></i>Total Sinyal</span>',
                                '<span><i style="background:#8E7CFF;"></i>Rata² Kredibilitas</span>',
                            '</div>',
                        '</div>',
                        '<canvas id="noise-history-chart" width="600" height="120"></canvas>',
                    '</div>',
                    '<details>',
                        '<summary>' + noiseIcon('file-text', 11) + ' Riwayat Scan (' + _state.history.length + ')</summary>',
                        '<div class="nf-history-panel"><div id="noise-history-list"></div></div>',
                    '</details>',
                    '<div class="nf-section-label">Security Console</div>',
                    '<div class="nf-sec-grid">',
                        '<div class="nf-sec-panel" style="--sec:#FF4D5E;">',
                            '<div class="nf-sec-head">',
                                '<span class="nf-sec-title" style="color:#FF4D5E;">' + noiseIcon('shield-x', 11) + ' Daftar Hitam</span>',
                                '<span class="nf-sec-count" style="color:#FF4D5E;">' + _state.blacklist.length + '</span>',
                            '</div>',
                            '<div class="nf-sec-tags">',
                                (_state.blacklist.length ? _state.blacklist.map(function(k) { return '<span class="nf-sec-tag" style="color:#FF4D5E;border-color:rgba(255,77,94,0.3);background:rgba(255,77,94,0.07);">#' + Utils.escapeHtml(k) + '</span>'; }).join('') : '<span class="nf-sec-empty">Belum ada kata kunci. Tambahkan lewat Pengaturan.</span>'),
                            '</div>',
                        '</div>',
                        '<div class="nf-sec-panel" style="--sec:#00FFA3;">',
                            '<div class="nf-sec-head">',
                                '<span class="nf-sec-title" style="color:#00FFA3;">' + noiseIcon('shield-check', 11) + ' Daftar Putih</span>',
                                '<span class="nf-sec-count" style="color:#00FFA3;">' + _state.whitelist.length + '</span>',
                            '</div>',
                            '<div class="nf-sec-tags">',
                                (_state.whitelist.length ? _state.whitelist.map(function(k) { return '<span class="nf-sec-tag" style="color:#00FFA3;border-color:rgba(0,255,163,0.3);background:rgba(0,255,163,0.07);">#' + Utils.escapeHtml(k) + '</span>'; }).join('') : '<span class="nf-sec-empty">Belum ada kata kunci. Tambahkan lewat Pengaturan.</span>'),
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="nf-rules-row">',
                        '<span>Aturan aktif <b>' + (_state.blacklist.length + _state.whitelist.length) + '</b></span>',
                        '<span>Threshold <b>' + _state.threshold + '%</b></span>',
                        '<span>Diblokir <b>' + stats.blocked + '</b></span>',
                    '</div>',
                    '<div class="nf-deck">',
                        '<div class="action-buttons">',
                            '<div class="nf-deck-row">',
                                '<button id="noise-start-btn" class="execute-btn secondary" style="' + (isRunning ? 'display:none;' : '') + 'border-color:rgba(0,255,163,0.5);color:#00FFA3;">' + noiseIcon('radio', 10) + ' MULAI</button>',
                                '<button id="noise-stop-btn" class="execute-btn secondary" style="' + (isRunning ? '' : 'display:none;') + 'border-color:rgba(255,178,36,0.5);color:#FFB224;">' + noiseIcon('power-off', 10) + ' STOP</button>',
                                '<button id="noise-export-btn" class="execute-btn">' + noiseIcon('download', 10) + ' Ekspor</button>',
                                '<button id="noise-settings-btn" class="execute-btn secondary">' + noiseIcon('settings', 12) + ' Pengaturan</button>',
                            '</div>',
                            '<div class="nf-deck-row">',
                                '<button id="noise-print-btn" class="execute-btn secondary nf-deck-small">' + noiseIcon('printer', 10) + ' Cetak</button>',
                                '<button id="noise-notify-btn" class="execute-btn secondary nf-deck-small">' + noiseIcon('bell', 10) + ' Izinkan</button>',
                                '<button id="noise-clear-btn" class="execute-btn secondary danger nf-deck-small">' + noiseIcon('trash', 11) + '</button>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div id="noise-settings-panel" style="display:none;">',
                        '<h4>' + noiseIcon('settings', 11) + ' Pengaturan</h4>',
                        '<div class="noise-settings-grid">',
                            '<div><label>Interval (detik)</label><input type="number" id="noise-interval-input" value="' + (_state.intervalMs / 1000).toFixed(0) + '" min="5" max="300"></div>',
                            '<div><label>Confidence Threshold (%)</label><input type="number" id="noise-threshold-input" value="' + _state.threshold + '" min="20" max="95"></div>',
                            '<div style="grid-column:1/-1;"><label>Blacklist (pisahkan dengan koma)</label><input type="text" id="noise-blacklist-input" value="' + Utils.escapeHtml(blacklistStr) + '"></div>',
                            '<div style="grid-column:1/-1;"><label>Whitelist (pisahkan dengan koma)</label><input type="text" id="noise-whitelist-input" value="' + Utils.escapeHtml(whitelistStr) + '"></div>',
                        '</div>',
                        '<button id="noise-save-settings-btn" class="execute-btn secondary" style="margin-top:12px;flex:none;width:auto;padding:9px 24px;">' + noiseIcon('save', 11) + ' Simpan Pengaturan</button>',
                    '</div>',
                    '<div class="noise-footer">',
                        '<span><strong style="color:#00FFA3;">KESEMPATAN OS</strong></span>',
                        '<span>Noise Filtering</span>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');

        updateSignalList(_state.signals);
        updateHistoryList(_state.history);
        if (NoiseChart.renderHistoryChart) NoiseChart.renderHistoryChart();
        if (NoiseChart.renderVerdictRing) NoiseChart.renderVerdictRing();
        if (NoiseCore.updateNotificationButton) NoiseCore.updateNotificationButton();

        inner.querySelectorAll('.stat-number[data-target]').forEach(function(el) {
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return;
            const duration = 600;
            const startTime = performance.now ? performance.now() : Date.now();
            function tick(now) {
                const progress = Math.min(1, (now - startTime) / duration);
                el.textContent = Math.round(target * progress);
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            }
            requestAnimationFrame(tick);
        });

        if (NoiseEvents.attachEvents) NoiseEvents.attachEvents(inner);
    }

    window.__NoiseUIRender = {
        renderDashboard: renderDashboard,
        updateStatsUI: updateStatsUI,
        updateStatusUI: updateStatusUI,
        updateSignalList: updateSignalList,
        updateHistoryList: updateHistoryList,
        setStatusFilter: setStatusFilter,
        setSentimentFilter: setSentimentFilter
    };
    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.NoiseUIRender = window.__NoiseUIRender;
})();
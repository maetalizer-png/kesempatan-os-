import { CONFIG, CATEGORIES } from './observ-config.js';
import { Observation } from './observ-state.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const OBS = Observation;
const state = OBS.getState();

const ICON_PATHS = {
    radar: '<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6l.01 0"/><path d="M2.29 9.62a10 10 0 1 0 12.09-2.28"/><path d="M12 12v9"/><path d="M12 12l4-2"/><circle cx="12" cy="12" r="1"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    'refresh-cw': '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
    loader: '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    frown: '<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    meh: '<circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>',
    sparkles: '<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    x: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'shield-x': '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/><path d="M9.5 9.5l5 5"/><path d="M14.5 9.5l-5 5"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/><path d="M9 12l2 2 4-4"/>',
    newspaper: '<path d="M4 4h12a2 2 0 0 1 2 2v13a1 1 0 0 1-1.71.71L15 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M18 8h2a2 2 0 0 1 2 2v9a1 1 0 0 1-1.7.7"/><path d="M7 8h5"/><path d="M7 11h5"/><path d="M7 14h3"/>',
    'bar-chart-2': '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/>',
    landmark: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M2 11l10-6 10 6"/><path d="M4 11h16"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
    smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    tv: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 2l4 4 4-4"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M17 5h3a2 2 0 0 1-2 4h-1"/><path d="M7 5H4a2 2 0 0 0 2 4h1"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-5 4-5 10a3.5 3.5 0 1 1-7 0"/><path d="M8.5 12a2.5 2.5 0 1 1 5 0c0 1.5-1 2-1 3.5"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    'chevron-down': '<path d="M6 9l6 6 6-6"/>',
    archive: '<rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>'
};

function icon(name, size, color, extraStyle) {
    const path = ICON_PATHS[name];
    if (!path) return '';
    size = size || 14;
    const colorAttr = color ? 'color:' + color + ';' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
        '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px; flex-shrink:0; ' +
        colorAttr + (extraStyle || '') + '">' + path + '</svg>';
}

function escAttr(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function iconStar(filled, size, color) {
    const path = ICON_PATHS.star;
    size = size || 14;
    const fill = filled ? (color || 'currentColor') : 'none';
    const colorAttr = color ? 'color:' + color + ';' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
        '" viewBox="0 0 24 24" fill="' + fill + '" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px; flex-shrink:0; ' + colorAttr + '">' + path + '</svg>';
}

const analysisCache = new WeakMap();
const getAnalysis = function(s) {
    let cached = analysisCache.get(s);
    if (!cached) {
        cached = OBS.analyzeSignal(s);
        analysisCache.set(s, cached);
    }
    return cached;
};

const sourceIconMap = (function() {
    const map = {};
    (KESEMPATAN.ObservationConfig.RSS_SOURCES || []).forEach(function(src) {
        map[src.name] = src.icon || 'newspaper';
    });
    return map;
})();

const EMOJI_TO_ICON = {
    '📰': 'newspaper', '💰': 'bar-chart-2', '🏛️': 'shield-check',
    '🌐': 'radio', '⚡': 'sparkles', '🎯': 'target', '📊': 'bar-chart-2'
};
function resolveIcon(emojiOrIconName, size, color) {
    const name = EMOJI_TO_ICON[emojiOrIconName] || emojiOrIconName;
    return ICON_PATHS[name] ? icon(name, size, color) : icon('newspaper', size, color);
}

function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; }
    return Math.abs(h);
}

function buildRadarPing(color) {
    return `<span class="obsroom-ping" style="--ping-color:${color || 'var(--obs-accent)'};"><span class="obsroom-ping-core"></span><span class="obsroom-ping-ring"></span><span class="obsroom-ping-ring obsroom-ping-ring--2"></span></span>`;
}

function buildClarityMeter(pct, color, large) {
    const cls = large ? 'obsroom-clarity obsroom-clarity--lg' : 'obsroom-clarity';
    const label = large ? '<span class="obsroom-clarity-ring-label">CONFIDENCE</span>' : '';
    return `
        <span class="${cls}" title="Kejernihan sinyal ${pct}%" style="--ring-pct:${pct}; --ring-color:${color};">
            <span class="obsroom-clarity-ring">${large ? `<span class="obsroom-clarity-ring-center">${pct}%${label}</span>` : ''}</span>
            ${large ? '' : `<span class="obsroom-clarity-value" style="color:${color};">${pct}%</span>`}
        </span>
    `;
}

function computeSignalStage(s, analyzed, index, total) {
    const verdict = (window.NoisePage && typeof window.NoisePage.getVerdict === 'function')
        ? window.NoisePage.getVerdict(s.id) : null;
    const ageMin = (Date.now() - new Date(s.timestamp).getTime()) / 60000;
    const minConfidence = (KESEMPATAN.ObservationConfig.AUTO_TRIGGER_CONFIG && KESEMPATAN.ObservationConfig.AUTO_TRIGGER_CONFIG.minConfidence) || 85;

    if (verdict && verdict.status === 'blocked') {
        return { label: 'Ditandai mencurigakan', color: '#D64545', iconName: 'shield-x' };
    }
    if (ageMin < 6 && analyzed.confidence < 45) {
        return { label: 'Sedang didengar', color: '#8A94A6', iconName: 'ear' };
    }
    if (analyzed.confidence >= minConfidence) {
        return { label: 'Prioritas dinaikkan', color: '#00C97C', iconName: 'target' };
    }
    if (verdict && verdict.status === 'filtered') {
        return { label: 'Sedang diverifikasi', color: '#C99A2E', iconName: 'shield-alert' };
    }
    if (analyzed.confidence >= 55 || (verdict && verdict.status === 'allowed')) {
        return { label: 'Terverifikasi', color: '#1F9D55', iconName: 'shield-check' };
    }
    if (ageMin > 180 || (total > 4 && index >= total - 2)) {
        return { label: 'Diarsipkan ke memori', color: '#5B6577', iconName: 'archive' };
    }
    return { label: 'Sedang dianalisis', color: '#3B82C4', iconName: 'activity' };
}

function buildSourceNode(src, state) {
    const st = state.sourceStatus ? state.sourceStatus[src.name] : null;
    const ok = st ? st.success : null;
    const resting = st ? !!st.cooldown : false;
    const color = resting ? '#4A5262' : (ok === true ? '#1F9D55' : (ok === false ? '#D64545' : '#5B6577'));
    const label = resting ? (st.error || 'istirahat') : (ok === true ? (st.count + ' item') : (ok === false ? (st.error || 'gagal') : 'menunggu'));
    const delay = (hashStr(src.name) % 24) * 90;
    const speed = 2.4 + (hashStr(src.name) % 10) * 0.15;
    return `<span class="obsroom-node" title="${src.name} · ${label}" style="--node-color:${color}; animation-delay:-${delay}ms; animation-duration:${speed.toFixed(2)}s;"></span>`;
}

function buildSourceNetwork(state) {
    const sources = KESEMPATAN.ObservationConfig.RSS_SOURCES || [];
    const groups = KESEMPATAN.ObservationConfig.REGION_GROUPS || {};
    const byRegion = {};
    sources.forEach(function(src) {
        const region = src.region || 'nasional';
        if (!byRegion[region]) byRegion[region] = [];
        byRegion[region].push(src);
    });

    return Object.keys(byRegion).map(function(region) {
        const g = groups[region] || { label: region, color: '#8A94A6' };
        return `
            <div class="obsroom-node-row">
                <span class="obsroom-node-region" style="color:${g.color};">${g.label}</span>
                <div class="obsroom-node-cluster">
                    ${byRegion[region].map(function(src) { return buildSourceNode(src, state); }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function computeObservationLevel(pool) {
    if (!pool.length) return { label: 'TENANG', color: '#00C97C', speed: '8s', intensity: 0.24 };
    let sum = 0, high = 0;
    const minConfidence = (KESEMPATAN.ObservationConfig.AUTO_TRIGGER_CONFIG && KESEMPATAN.ObservationConfig.AUTO_TRIGGER_CONFIG.minConfidence) || 85;
    pool.forEach(function(s) {
        const a = getAnalysis(s);
        sum += a.confidence;
        if (a.confidence >= minConfidence) high++;
    });
    const avg = sum / pool.length;
    if (high >= 3 || avg >= 80) return { label: 'TINGGI', color: 'var(--obs-accent, #00C97C)', speed: '2.8s', intensity: 0.5 };
    if (avg >= 60) return { label: 'MENINGKAT', color: '#C99A2E', speed: '4.6s', intensity: 0.36 };
    return { label: 'TENANG', color: '#00C97C', speed: '8s', intensity: 0.24 };
}

function buildFocusZone(top, level, poolLen) {
    if (!top) {
        const scanning = !!state.isRefreshing;
        return {
            html: `
                <div class="obsroom-focus obsroom-focus--idle">
                    ${buildRadarPing(scanning ? '#C99A2E' : level.color)}
                    <div class="obsroom-focus-eyebrow">${icon(scanning ? 'radar' : 'ear', 11)} ${scanning ? 'SEDANG MEMINDAI SUMBER' : 'SEDANG MENDENGARKAN'}</div>
                    <div class="obsroom-focus-headline">${scanning ? 'Memindai dunia sekarang' : 'Belum ada yang cukup jernih'}</div>
                    <div class="obsroom-focus-sub">${scanning ? 'Sinyal baru sedang dikumpulkan dari seluruh sumber. Sebentar lagi hasilnya akan tersaring di sini.' : 'Kebisingan dunia terus disaring. Ruang ini akan memanggil Anda begitu sesuatu yang berarti mengeras dari derau.'}</div>
                    <div class="obsroom-scansweep"></div>
                </div>
            `,
            topId: null
        };
    }

    const analyzed = getAnalysis(top);
    const cfg = CATEGORIES[top.category] || { color: '#8A94A6', emoji: 'newspaper' };
    const srcIconName = sourceIconMap[top.source] || 'newspaper';
    const isFavorite = state.favorites.includes(top.id);
    const stage = computeSignalStage(top, analyzed, 0, poolLen);

    return {
        html: `
        <div class="signal-card obsroom-focus" data-title="${escAttr(top.title)}" style="--obsroom-focal-glow:${cfg.color};">
            <span class="favorite-toggle" data-id="${top.id}" style="position:absolute; top:4px; right:6px; cursor:pointer; z-index:2; padding:10px;">${iconStar(isFavorite, 16, isFavorite ? '#C99A2E' : 'rgba(228,233,240,0.28)')}</span>
            ${buildRadarPing(stage.color)}
            <div class="obsroom-focus-eyebrow" style="color:${stage.color};">${icon(stage.iconName, 11)} ${stage.label.toUpperCase()} · ${OBS.getTimeAgo(top.timestamp)}</div>
            <div class="obsroom-focus-headline signal-title"></div>
            <div class="obsroom-focus-sub signal-desc"></div>
            <div class="obsroom-focus-meta">
                ${buildClarityMeter(analyzed.confidence, 'var(--obs-accent)', true)}
                <span class="obsroom-dim">${icon(analyzed.sentiment.label === 'positif' ? 'smile' : (analyzed.sentiment.label === 'negatif' ? 'frown' : 'meh'), 12, analyzed.sentiment.color)} ${analyzed.sentiment.label}</span>
                <span class="obsroom-dim">${resolveIcon(cfg.emoji, 12, cfg.color)} ${top.category}</span>
                <span class="obsroom-dim">${icon(srcIconName, 12)} terdengar dari ${top.source}</span>
            </div>
            <div class="obsroom-scansweep"></div>
            <div class="obsroom-focus-hint">${icon('bar-chart-2', 10)} Ketuk untuk masuk ke ruang investigasi</div>
        </div>
        `,
        topId: top.id
    };
}

function buildMainHTML(filtered, total, uniqueSources, categories, stats, textColor, borderColor) {
    const state = OBS.getState();
    const level = computeObservationLevel(state.signals);
    const pool = filtered.length ? filtered : state.signals;

    let top = null, topScore = -1;
    pool.forEach(function(s) {
        const a = getAnalysis(s);
        if (a.confidence > topScore) { topScore = a.confidence; top = s; }
    });
    const focus = buildFocusZone(top, level, pool.length);
    const streamList = focus.topId ? filtered.filter(function(s) { return s.id !== focus.topId; }) : filtered;

    let sentPos = 0, sentNeg = 0, sentNeu = 0;
    state.signals.forEach(function(s) {
        const label = getAnalysis(s).sentiment.label;
        if (label === 'positif') sentPos++;
        else if (label === 'negatif') sentNeg++;
        else sentNeu++;
    });

    return `
        <div class="obsroom" style="--obsroom-ambient-color:${level.color}; --obsroom-pulse-speed:${level.speed}; --obsroom-ambient-intensity:${level.intensity};">
            <div class="obsroom-ambient-glow"></div>
            <div class="obsroom-ambient-glow obsroom-ambient-glow--2"></div>
            <div class="obsroom-ambient-vignette"></div>
            <div class="obsroom-ambient-noise"></div>

            <div class="obsroom-stage">

                <!-- ================= STRIP IDENTITAS ================= -->
                <div class="obsroom-topstrip">
                    <div style="display:flex; align-items:center; gap:9px; min-width:0;">
                        ${buildRadarPing(state.isRefreshing ? '#C99A2E' : 'var(--obs-accent)')}
                        <span class="obsroom-topstrip-title">OBSERVATION ENGINE</span>
                        <span class="obsroom-topstrip-sep">·</span>
                        <span class="obsroom-topstrip-sub">OBSERVATION CENTER</span>
                    </div>
                    <span class="obsroom-live-tag" style="color:${state.isRefreshing ? '#C99A2E' : 'var(--obs-accent)'};">${state.isRefreshing ? 'SCANNING' : 'LIVE'}</span>
                </div>

                <!-- ================= FOCUS ZONE (pusat observasi) ================= -->
                <div class="obsroom-chapter">CH.01 — FOCUS OBSERVATION</div>
                ${focus.html}

                <div class="obsroom-flowline"></div>

                
                <div class="obsroom-companion">
                    <span class="obsroom-companion-avatar">${icon('brain', 13, '#9B6FC9')}</span>
                    <div class="obsroom-companion-text">
                        <div id="aiSummary" class="obsroom-companion-line"></div>
                        <div id="aiPrediction" class="obsroom-companion-line obsroom-companion-line--muted"></div>
                        <div class="obsroom-companion-tally">
                            <span style="color:#1F9D55;">${icon('smile', 9, '#1F9D55')} ${sentPos}</span>
                            <span style="color:#6C86C4;">${icon('frown', 9, '#6C86C4')} ${sentNeg}</span>
                            <span style="color:#C99A2E;">${icon('meh', 9, '#C99A2E')} ${sentNeu}</span>
                        </div>
                    </div>
                </div>

                <!-- ================= PENYARINGAN — tenang, bukan toolbar aplikasi ================= -->
                <div class="obsroom-controls">
                    <div class="obsroom-tabs">
                        <button class="filter-btn" data-filter="all" style="color: ${state.currentFilter === 'all' ? 'var(--obs-accent)' : 'var(--obs-text-dim)'}; border-bottom-color: ${state.currentFilter === 'all' ? 'var(--obs-accent)' : 'transparent'};">Semua</button>
                        ${Object.keys(CATEGORIES).map(cat => {
                            const cfg = CATEGORIES[cat];
                            return `<button class="filter-btn" data-filter="${cat}" style="color: ${state.currentFilter === cat ? cfg.color : 'var(--obs-text-dim)'}; border-bottom-color: ${state.currentFilter === cat ? cfg.color : 'transparent'};">${cat}</button>`;
                        }).join('')}
                        <button class="filter-btn" data-filter="favorites" style="color: ${state.currentFilter === 'favorites' ? '#C99A2E' : 'var(--obs-text-dim)'}; border-bottom-color: ${state.currentFilter === 'favorites' ? '#C99A2E' : 'transparent'};">${iconStar(state.currentFilter === 'favorites', 9, state.currentFilter === 'favorites' ? '#C99A2E' : 'currentColor')} Ditandai</button>
                    </div>
                    <div class="obsroom-controls-row2">
                        <div class="obsroom-sentiment-group">
                            <button class="filter-sentiment" style="color: ${state.sentimentFilter === 'all' ? 'var(--obs-text)' : 'var(--obs-text-dim)'}; opacity:${state.sentimentFilter === 'all' ? '1' : '0.55'};" data-sentiment="all">${icon('list', 10)}</button>
                            <button class="filter-sentiment" style="color: ${state.sentimentFilter === 'positif' ? '#1F9D55' : 'var(--obs-text-dim)'}; opacity:${state.sentimentFilter === 'positif' ? '1' : '0.55'};" data-sentiment="positif">${icon('smile', 10)}</button>
                            <button class="filter-sentiment" style="color: ${state.sentimentFilter === 'netral' ? '#C99A2E' : 'var(--obs-text-dim)'}; opacity:${state.sentimentFilter === 'netral' ? '1' : '0.55'};" data-sentiment="netral">${icon('meh', 10)}</button>
                            <button class="filter-sentiment" style="color: ${state.sentimentFilter === 'negatif' ? '#6C86C4' : 'var(--obs-text-dim)'}; opacity:${state.sentimentFilter === 'negatif' ? '1' : '0.55'};" data-sentiment="negatif">${icon('frown', 10)}</button>
                        </div>
                        <div class="obsroom-search-wrap">
                            <span class="obsroom-search-icon">${icon('search', 11)}</span>
                            <input type="text" id="searchSignals" placeholder="Telusuri sinyal..." value="${state.searchQuery}">
                        </div>
                        <button id="clearFiltersBtn" class="obsroom-reset">${icon('x', 10)} Bersihkan</button>
                    </div>
                    <div class="obsroom-controls-meta">
                        <span>${streamList.length} sinyal lain mengalir di bawah ini</span>
                        <span class="obsroom-level" style="color:${level.color};">${icon('activity', 9)} LEVEL ${level.label}</span>
                    </div>
                </div>

                <!-- ================= ALIRAN OBSERVASI ================= -->
                <div class="obsroom-chapter">CH.02 — SIGNAL STREAM</div>
                <div class="signals-scroll obsroom-stream">
                    ${buildSignalsGrid(streamList)}
                </div>

                <!-- ================= RUANG MESIN — panel monitoring aktif, selalu
                     terbuka (bukan accordion tersembunyi, bukan footer terpisah) ================= -->
                <div class="obsroom-chapter">CH.03 — TELEMETRY</div>
                <div class="obsroom-enginepanel">
                    <div class="obsroom-enginepanel-header">${icon('ear', 11)} Pendengaran &amp; Monitoring Sistem</div>

                    <div class="obsroom-readout-row">
                        <div class="obsroom-readout"><span class="stat-value obsroom-readout-value" data-stat="loaded" data-target="${filtered.length}">0</span><span class="obsroom-readout-label">termuat</span></div>
                        <div class="obsroom-readout"><span class="stat-value obsroom-readout-value" data-stat="channels" data-target="${uniqueSources.size}">0</span><span class="obsroom-readout-label">kanal</span></div>
                        <div class="obsroom-readout"><span class="stat-value obsroom-readout-value" data-stat="domains" data-target="${categories.size}">0</span><span class="obsroom-readout-label">ranah</span></div>
                        <div class="obsroom-readout"><span class="obsroom-readout-value" style="font-size:var(--obs-type-headline-size);">${CONFIG.REFRESH_INTERVAL/1000}s</span><span class="obsroom-readout-label">interval</span></div>
                    </div>

                    <div class="obsroom-node-network">${buildSourceNetwork(state)}</div>
                    <div id="autoTriggerStatus"></div>
                    <div class="obsroom-category-tally">
                        ${Object.entries(stats).map(([cat, count]) => {
                            const cfg = CATEGORIES[cat] || { color: '#8A94A6', emoji: 'newspaper' };
                            return `<span style="font-size: var(--obs-type-caption-size); color: ${cfg.color}; display:inline-flex; align-items:center; gap:4px;">${resolveIcon(cfg.emoji, 9)} ${cat} <strong style="color:${textColor}; opacity:0.6;">${count}</strong></span>`;
                        }).join('')}
                    </div>

                    <div class="obsroom-pulseline">${icon('activity', 9)} denyut 7 hari</div>
                    <div id="trendChartContainer" class="obsroom-chart"></div>
                </div>

                <div class="obsroom-controlstrip">
                    <button id="themeToggleBtn" class="obsroom-sysbtn">${state.darkMode ? icon('sun', 11) : icon('moon', 11)}</button>
                    <button id="exportJsonBtn" class="obsroom-sysbtn">${icon('download', 10)} JSON</button>
                    <button id="exportCsvBtn" class="obsroom-sysbtn">${icon('download', 10)} CSV</button>
                    <span class="obsroom-footer-fill"></span>
                    <button id="refreshObsBtn" class="obsroom-sysbtn obsroom-sysbtn--accent">
                        ${state.isRefreshing ? icon('loader', 10, null, 'animation:spin 0.8s linear infinite;') : icon('refresh-cw', 10) + ' Refresh'}
                    </button>
                </div>
            </div>

            <!-- ================= RUANG INVESTIGASI (modal detail) ================= -->
            <div id="signalDetailModal" onclick="if(event.target===this) this.style.display='none'" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(6,9,14,0.8); z-index: 99999; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(2px);">
                <div style="background: #0B0F14; border-radius: var(--obs-radius-lg); max-width: 480px; width: 100%; max-height: 80vh; padding: 20px; border: 1px solid rgba(255,255,255,0.06); overflow-y: auto; box-shadow: var(--obs-shadow-floating);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div>
                            <div style="font-size: var(--obs-type-caption-size); color:var(--obs-accent); font-weight:700; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:3px; display:flex; align-items:center; gap:4px;">${icon('eye', 10)} Ruang Investigasi</div>
                            <h3 style="color: var(--obs-text); margin: 0; font-size: var(--obs-type-title-size);" id="detailTitle">Detail Sinyal</h3>
                        </div>
                        <button class="obsroom-modal-close" onclick="document.getElementById('signalDetailModal').style.display='none'" style="background: none; border: none; color: var(--obs-text-dim); cursor: pointer; display:flex; padding:4px; border-radius:var(--obs-radius-sm); transition: background var(--obs-transition), color var(--obs-transition);">${icon('x', 18)}</button>
                    </div>
                    <div id="detailContent"></div>
                    <div style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
                        <button class="execute-btn" data-title="" style="padding: 5px 12px; font-size: var(--obs-type-caption-size); display:inline-flex; align-items:center; gap:4px;">${icon('bar-chart-2', 10)} Selidiki</button>
                        <button onclick="document.getElementById('signalDetailModal').style.display='none'" class="execute-btn secondary" style="padding: 5px 12px; font-size: var(--obs-type-caption-size);">Tutup</button>
                    </div>
                </div>
            </div>

            <style>
                :root {
                    --obs-surface: rgba(255,255,255,0.03);
                    --obs-surface-2: rgba(255,255,255,0.05);
                    --obs-border: rgba(255,255,255,0.08);
                    --obs-text: #E4E9F0;
                    --obs-text-dim: #8A94A6;
                    --obs-accent: #00C97C;
                    --obs-accent-soft: rgba(0,201,124,0.12);
                    --obs-font-display: -apple-system, "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif;
                    --obs-font-mono: ui-monospace, "SF Mono", "JetBrains Mono", "Roboto Mono", "Consolas", monospace;
                    --obs-tracking-tight: -0.3px;
                    --obs-tracking-base: 0.4px;
                    --obs-tracking-wide: 1.1px;
                    --obs-transition: 180ms ease-out;
                    --obs-motion-fast: 120ms ease-out;
                    --obs-motion-base: 180ms ease-out;
                    --obs-motion-slow: 240ms ease-out;
                    --obs-radius-pill: 20px;
                    --obs-radius-sm: 6px;
                    --obs-radius-md: 8px;
                    --obs-radius-lg: 10px;
                    --obs-glow-primary: 0 0 10px rgba(0,201,124,0.28);
                    --obs-glow-soft: 0 0 8px rgba(0,201,124,0.14);
                    --obs-glow-critical: 0 0 8px rgba(214,69,69,0.22);
                    --obs-shadow-surface: inset 0 1px 0 rgba(255,255,255,0.03);
                    --obs-shadow-panel:
                        inset 0 1px 0 rgba(255,255,255,0.06),
                        inset 0 -10px 16px -12px rgba(0,0,0,0.4),
                        0 8px 20px -14px rgba(0,201,124,0.12);
                    --obs-shadow-module:
                        inset 0 1px 0 rgba(255,255,255,0.06),
                        inset 0 2px 5px rgba(0,0,0,0.4),
                        inset 0 10px 14px -10px rgba(0,0,0,0.55);
                    --obs-shadow-floating: 0 12px 32px rgba(0,0,0,0.45);
                    --obs-space-1: 4px;
                    --obs-space-2: 8px;
                    --obs-space-3: 12px;
                    --obs-space-4: 16px;
                    --obs-space-5: 20px;
                    --obs-space-6: 24px;
                    --obs-space-7: 32px;

                    --obs-type-display-size: clamp(20px, 6.2vw, 27px); --obs-type-display-weight: 800; --obs-type-display-ls: -0.3px; --obs-type-display-lh: 1.2;
                    --obs-type-headline-size: 17px; --obs-type-headline-weight: 800; --obs-type-headline-ls: -0.1px; --obs-type-headline-lh: 1.15;
                    --obs-type-title-size: 13px; --obs-type-title-weight: 600; --obs-type-title-ls: 0px; --obs-type-title-lh: 1.55;
                    --obs-type-body-size: 11px; --obs-type-body-weight: 500; --obs-type-body-ls: 0px; --obs-type-body-lh: 1.6;
                    --obs-type-caption-size: 9px; --obs-type-caption-weight: 700; --obs-type-caption-ls: var(--obs-tracking-wide); --obs-type-caption-lh: 1.4;
                    --obs-type-micro-size: 7.5px; --obs-type-micro-weight: 600; --obs-type-micro-ls: var(--obs-tracking-base); --obs-type-micro-lh: 1.4;
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
                @keyframes obsroom-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes obsroom-glow-pulse {
                    0%, 100% { opacity: calc(var(--obsroom-ambient-intensity, 0.3) * 0.65); }
                    50% { opacity: var(--obsroom-ambient-intensity, 0.3); }
                }
                @keyframes obsroom-glow-pulse-2 {
                    0%, 100% { opacity: calc(var(--obsroom-ambient-intensity, 0.3) * 0.4); }
                    50% { opacity: calc(var(--obsroom-ambient-intensity, 0.3) * 0.7); }
                }
                @keyframes obsroom-rise { from { opacity: 0.4; transform: translateY(4px); } to { opacity: 1; transform: none; } }
                @keyframes obsroom-ping-ring {
                    0% { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(4.2); opacity: 0; }
                }
                @keyframes obsroom-sweep {
                    0% { left: -15%; opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { left: 105%; opacity: 0; }
                }

                .obsroom { position: relative; padding: 10px 12px 22px; background: transparent; isolation: isolate; font-family: var(--obs-font-display); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
                .obsroom-stage { position: relative; z-index: 1; padding: 6px; }
                .obsroom-stage::before {
                    content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none;
                    opacity: 0.4;
                    background-image:
                        linear-gradient(var(--obs-accent), var(--obs-accent)), linear-gradient(var(--obs-accent), var(--obs-accent)),
                        linear-gradient(var(--obs-accent), var(--obs-accent)), linear-gradient(var(--obs-accent), var(--obs-accent)),
                        linear-gradient(var(--obs-accent), var(--obs-accent)), linear-gradient(var(--obs-accent), var(--obs-accent)),
                        linear-gradient(var(--obs-accent), var(--obs-accent)), linear-gradient(var(--obs-accent), var(--obs-accent));
                    background-repeat: no-repeat;
                    background-size: 12px 2px, 2px 12px, 12px 2px, 2px 12px, 12px 2px, 2px 12px, 12px 2px, 2px 12px;
                    background-position:
                        top 0 left 0, top 0 left 0,
                        top 0 right 0, top 0 right 0,
                        bottom 0 left 0, bottom 0 left 0,
                        bottom 0 right 0, bottom 0 right 0;
                }
                .obsroom-dim { color: var(--obs-text-dim); opacity: 0.75; }

                .obsroom-ambient-glow {
                    position: absolute; inset: -6% -8% auto -8%; height: 68%;
                    background: radial-gradient(circle at 28% 0%, var(--obsroom-ambient-color, #00C97C), transparent 62%);
                    filter: blur(22px);
                    animation: obsroom-glow-pulse var(--obsroom-pulse-speed, 6s) ease-in-out infinite;
                    pointer-events: none; z-index: 0;
                }
                .obsroom-ambient-glow--2 {
                    inset: 10% -15% auto auto; width: 65%; height: 40%;
                    background: radial-gradient(circle at 80% 20%, var(--obsroom-ambient-color, #00C97C), transparent 65%);
                    filter: blur(28px);
                    animation-name: obsroom-glow-pulse-2;
                    animation-duration: calc(var(--obsroom-pulse-speed, 6s) * 1.4);
                }
                .obsroom-ambient-vignette {
                    position: absolute; inset: 0; pointer-events: none; z-index: 0;
                    background: radial-gradient(120% 90% at 50% 20%, transparent 55%, rgba(3,5,8,0.55) 100%);
                }
                .obsroom-ambient-noise {
                    position: absolute; inset: 0; pointer-events: none; z-index: 0;
                    opacity: 0.035; mix-blend-mode: overlay;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
                }

                .obsroom-ping { position: relative; width: 8px; height: 8px; display: inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
                .obsroom-ping-core { width: 6px; height: 6px; border-radius: 50%; background: var(--ping-color, var(--obs-accent)); position:relative; z-index:1; animation: obsroom-breathe 2.4s ease-in-out infinite; }
                .obsroom-ping-ring {
                    position: absolute; inset: 0; margin: auto; width: 6px; height: 6px; border-radius: 50%;
                    border: 1px solid var(--ping-color, var(--obs-accent));
                    animation: obsroom-ping-ring 2.8s ease-out infinite;
                }
                .obsroom-ping-ring--2 { animation-delay: 1.4s; }

                .obsroom-clarity { display: inline-flex; align-items: center; gap: 6px; }
                .obsroom-clarity-ring {
                    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; position: relative;
                    background: conic-gradient(var(--ring-color, var(--obs-accent)) calc(var(--ring-pct, 0) * 1%), rgba(255,255,255,0.1) 0);
                    filter: drop-shadow(0 0 2px var(--ring-color, var(--obs-accent)));
                }
                .favorite-toggle { transition: opacity var(--obs-transition), transform var(--obs-transition); }
                .favorite-toggle:hover { opacity: 0.75; transform: scale(1.12); }
                .obsroom-clarity-ring::before { content: ''; position: absolute; inset: 2.5px; border-radius: 50%; background: #05070B; }
                .obsroom-clarity-value { font-size: var(--obs-type-caption-size); font-weight: 700; font-family: var(--obs-font-mono); font-variant-numeric: tabular-nums; }

                .obsroom-clarity--lg { display: inline-flex; position: relative; }
                .obsroom-clarity--lg .obsroom-clarity-ring {
                    width: 80px; height: 80px;
                    filter: drop-shadow(0 0 11px var(--ring-color, var(--obs-accent)));
                    animation: obsroom-ring-breathe 20s ease-in-out infinite;
                }
                .obsroom-clarity--lg .obsroom-clarity-ring::before { inset: 9px; background: #05070B; }
                .obsroom-clarity--lg .obsroom-clarity-ring::after {
                    content: ''; position: absolute; inset: -4px; border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.07); pointer-events: none;
                }
                .obsroom-clarity-ring-center {
                    position: absolute; inset: 9px; border-radius: 50%; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 2px; overflow: hidden;
                    font-family: var(--obs-font-mono); font-size: var(--obs-type-headline-size); font-weight: var(--obs-type-headline-weight); color: var(--obs-text);
                    text-shadow: 0 0 12px rgba(0,201,124,0.35);
                }
                .obsroom-clarity-ring-label { font-size: 5px; font-weight: 700; letter-spacing: 0.6px; color: var(--obs-text-dim); opacity: 0.75; white-space: nowrap; }
                @keyframes obsroom-ring-breathe {
                    0%, 100% { filter: drop-shadow(0 0 9px var(--ring-color, var(--obs-accent))); }
                    50% { filter: drop-shadow(0 0 16px var(--ring-color, var(--obs-accent))); }
                }

                .obsroom-topstrip { display:flex; align-items:center; justify-content:space-between; padding: 2px 2px 6px; gap: 8px; }
                .obsroom-live-tag { font-family: var(--obs-font-mono); font-size: var(--obs-type-micro-size); font-weight: 700; letter-spacing: var(--obs-tracking-wide); opacity: 0.6; white-space: nowrap; flex-shrink: 0; }
                .obsroom-topstrip-title { font-size: var(--obs-type-body-size); font-weight: 800; letter-spacing: var(--obs-tracking-wide); color: var(--obs-text); white-space:nowrap; opacity:0.78; flex-shrink: 0; }
                .obsroom-topstrip-sep { color: var(--obs-text-dim); opacity:0.4; font-size:var(--obs-type-caption-size); flex-shrink: 0; }
                .obsroom-topstrip-sub { font-size: var(--obs-type-caption-size); font-weight: 700; letter-spacing: 1.3px; color: var(--obs-accent); opacity:0.6; white-space:nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
                .obsroom-chapter {
                    font-family: var(--obs-font-mono); font-size: var(--obs-type-micro-size); font-weight: var(--obs-type-caption-weight);
                    letter-spacing: var(--obs-type-caption-ls); text-transform: uppercase; color: var(--obs-accent);
                    opacity: 0.55; margin: 14px 2px 8px; display: flex; align-items: center; gap: 8px;
                }
                .obsroom-chapter::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, var(--obs-border), transparent); }
                .obsroom-exit { background: transparent; border:none; color: var(--obs-text-dim); opacity:0.55; width: 26px; height: 26px; border-radius: 7px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: opacity var(--obs-transition), background var(--obs-transition); }
                .obsroom-exit:hover { opacity:1; background: var(--obs-surface-2); }

                .obsroom-focus {
                    position: relative;
                    min-height: 58vh;
                    display: flex; flex-direction: column; justify-content: center;
                    padding: var(--obs-space-3) var(--obs-space-3) var(--obs-space-2);
                    margin-bottom: 2px;
                    cursor: default;
                    animation: obsroom-rise 240ms ease both;
                    box-shadow:
                        inset 0 1px 0 rgba(255,255,255,0.06),
                        inset 0 -40px 50px -46px rgba(0,0,0,0.4),
                        inset 1px 0 0 rgba(255,255,255,0.025),
                        inset -1px 0 0 rgba(255,255,255,0.025),
                        inset 0 0 0 1px rgba(255,255,255,0.018);
                }
                .obsroom-focus::before {
                    content: ''; position: absolute; inset: 0 0 auto 0; height: 58%; z-index: -1;
                    background:
                        radial-gradient(38% 55% at 16% 22%, rgba(255,255,255,0.075), transparent 72%),
                        linear-gradient(to bottom, rgba(255,255,255,0.035), transparent 42%),
                        linear-gradient(118deg, transparent 28%, rgba(255,255,255,0.028) 46%, transparent 62%);
                    pointer-events: none;
                }
                .obsroom-focus::after {
                    content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
                    background: radial-gradient(130% 95% at 30% 36%, transparent 46%, rgba(2,4,7,0.3) 100%);
                }
                .obsroom-focus--idle { cursor: default; }
                .obsroom-focus > .obsroom-ping { position: absolute; top: 10px; left: 6px; }
                .obsroom-focus-eyebrow {
                    display: flex; align-items: center; gap: 8px;
                    font-size: var(--obs-type-caption-size); font-weight: var(--obs-type-caption-weight); letter-spacing: var(--obs-type-caption-ls);
                    text-transform: uppercase; margin-bottom: 22px; padding-left: 18px;
                }
                .obsroom-focus-headline {
                    color: var(--obs-text); font-size: var(--obs-type-display-size); font-weight: var(--obs-type-display-weight);
                    line-height: var(--obs-type-display-lh); letter-spacing: var(--obs-type-display-ls); max-width: 94%;
                    text-shadow: 0 1px 0 rgba(0,0,0,0.25), 0 0 32px rgba(0,201,124,0.22);
                }
                .obsroom-focus-sub { color: var(--obs-text-dim); font-size: var(--obs-type-body-size); line-height: var(--obs-type-body-lh); margin-top: var(--obs-space-4); max-width: 88%; opacity: 0.92; }
                .obsroom-focus-meta { display: flex; flex-wrap: wrap; gap: var(--obs-space-5); align-items: center; margin-top: var(--obs-space-6); font-size: var(--obs-type-body-size); font-weight: 600; }
                .obsroom-focus-hint { display: none; }
                .obsroom-scansweep { position: relative; height: 1px; margin: 26px 0 4px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent); overflow: visible; }
                .obsroom-scansweep::after {
                    content: ''; position: absolute; top: -1px; left: -15%; width: 90px; height: 3px;
                    background: linear-gradient(90deg, transparent, var(--obs-accent), transparent);
                    filter: blur(2px); opacity: 0.7; animation: obsroom-sweep 7s ease-in-out infinite;
                }
                .obsroom-flowline {
                    width: 1px; height: 18px; margin: 0 auto 8px 22px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0.14), transparent);
                }

                .obsroom-companion {
                    display: flex; gap: var(--obs-space-3); align-items: flex-start; margin: 0 var(--obs-space-1) var(--obs-space-4); padding: var(--obs-space-3) var(--obs-space-4) var(--obs-space-3) var(--obs-space-3);
                    border-radius: var(--obs-radius-md); border-left: 2px solid rgba(155,111,201,0.4);
                    background: linear-gradient(155deg, rgba(155,111,201,0.055), transparent 60%), rgba(255,255,255,0.014);
                    box-shadow: var(--obs-shadow-surface);
                }
                .obsroom-companion-avatar {
                    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
                    background: transparent; display:flex; align-items:center; justify-content:center;
                    filter: drop-shadow(0 0 4px rgba(155,111,201,0.5));
                    animation: obsroom-breathe 3s ease-in-out infinite;
                }
                .obsroom-companion-text { min-width: 0; max-width: 96%; }
                .obsroom-companion-line { position:relative; font-size: var(--obs-type-title-size); line-height: var(--obs-type-title-lh); color: var(--obs-text); font-style: italic; font-weight: var(--obs-type-title-weight); opacity: 0.96; }
                .obsroom-companion-line::before {
                    content: '\u201C'; font-style: normal; color: var(--obs-accent); opacity: 0.55;
                    font-size: 1.3em; line-height: 0; vertical-align: -0.18em; margin-right: 3px;
                }
                .obsroom-companion-line--muted {
                    font-size: var(--obs-type-body-size); font-style: normal; font-weight: var(--obs-type-body-weight); color: var(--obs-text-dim);
                    opacity: 0.75; margin-top: var(--obs-space-2); line-height: var(--obs-type-body-lh);
                    padding: var(--obs-space-2) var(--obs-space-2) var(--obs-space-2) 10px;
                    background: rgba(255,255,255,0.018); border-radius: var(--obs-radius-sm); border-left: 2px solid rgba(255,255,255,0.08);
                }
                .obsroom-companion-line--muted::before {
                    content: '→'; color: var(--obs-accent); opacity: 0.7; margin-right: 5px; font-weight: 700;
                }
                .obsroom-companion-tally { display: flex; gap: 10px; font-size: var(--obs-type-micro-size); margin-top: 9px; opacity: 0.55; }

                .obsroom-controls { margin: 6px 0 2px; }
                .obsroom-tabs { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
                .obsroom-tabs .filter-btn {
                    padding: 0 0 5px; background: transparent; border: none; border-bottom: 2px solid transparent;
                    font-size: var(--obs-type-body-size); cursor:pointer; display:inline-flex; align-items:center; gap:4px;
                    transition: color var(--obs-transition), border-color var(--obs-transition), opacity var(--obs-transition);
                }
                .obsroom-tabs .filter-btn:hover { color: var(--obs-text); opacity: 0.9; }
                .obsroom-tabs .filter-btn:active { opacity: 0.6; }
                .obsroom-controls-row2 { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
                .obsroom-sentiment-group { display: flex; gap: 6px; }
                .obsroom-sentiment-group .filter-sentiment { padding: 3px; background:transparent; border:none; cursor:pointer; transition: opacity var(--obs-transition), color var(--obs-transition), transform var(--obs-transition); }
                .obsroom-sentiment-group .filter-sentiment:hover { opacity: 1; transform: scale(1.15); }
                .obsroom-sentiment-group .filter-sentiment:active { transform: scale(0.92); }
                .obsroom-search-wrap { flex: 1; min-width: 80px; position: relative; }
                .obsroom-search-icon { position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--obs-text-dim); pointer-events:none; opacity:0.6; }
                .obsroom-search-wrap input {
                    width: 100%; padding: 5px 8px 5px 24px; background: transparent;
                    border: none; border-bottom: 1px solid rgba(255,255,255,0.08); color: var(--obs-text);
                    font-size: var(--obs-type-body-size); outline: none; box-sizing: border-box;
                    transition: border-color var(--obs-transition);
                }
                .obsroom-search-wrap input:focus { border-bottom-color: var(--obs-accent); }
                .obsroom-search-wrap input:focus + .obsroom-search-icon,
                .obsroom-search-wrap:focus-within .obsroom-search-icon { color: var(--obs-accent); opacity: 0.9; }
                .obsroom-reset { background: transparent; border:none; color: var(--obs-text-dim); opacity: 0.55; font-size: var(--obs-type-caption-size); padding: 5px 4px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; transition: opacity var(--obs-transition); }
                .obsroom-reset:hover { opacity: 0.9; }
                .obsroom-controls-meta { display: flex; justify-content: space-between; align-items: center; font-size: var(--obs-type-caption-size); color: var(--obs-text-dim); opacity: 0.55; margin-top: 14px; padding: 0 2px; letter-spacing: var(--obs-tracking-base); }
                .obsroom-level { font-family: var(--obs-font-mono); font-weight: 700; letter-spacing: var(--obs-tracking-base); display:inline-flex; align-items:center; gap:4px; }

                .obsroom-stream {
                    display: flex !important; flex-direction: column;
                    max-height: 60vh; overflow-y: auto; overflow-x: hidden;
                    overflow-anchor: auto;
                    margin: 8px -12px 0; padding: 16px 12px 24px;
                    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 26px, #000 calc(100% - 26px), transparent);
                    mask-image: linear-gradient(to bottom, transparent, #000 26px, #000 calc(100% - 26px), transparent);
                }
                .obsroom-row { animation: obsroom-rise 200ms ease both; margin-bottom: 10px; }
                .signals-scroll::-webkit-scrollbar { width: 3px; }
                .signals-scroll::-webkit-scrollbar-track { background: transparent; }
                .signals-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

                .obsroom-stage-tag {
                    display: inline-flex; align-items: center; gap: 5px; font-size: var(--obs-type-caption-size); font-weight: var(--obs-type-caption-weight);
                    font-family: var(--obs-font-mono); letter-spacing: var(--obs-type-caption-ls); text-transform: uppercase;
                    width: fit-content; padding: 3px 9px; border-radius: var(--obs-radius-pill);
                }
                .obsroom-verdict-pill {
                    font-size: var(--obs-type-micro-size); font-weight: 600; display: inline-flex; align-items: center; gap: 3px;
                    padding: 3px 7px; border-radius: var(--obs-radius-pill);
                }
                .signal-sentiment, .signal-category {
                    font-size: var(--obs-type-micro-size); font-weight: 600; opacity: 0.9; display: inline-flex; align-items: center;
                    gap: 3px; padding: 2px 7px; border-radius: var(--obs-radius-pill); background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                }
                .analyze-btn {
                    padding: 4px 11px; background: rgba(0,201,124,0.06); border: 1px solid var(--obs-accent);
                    color: var(--obs-accent); cursor: pointer; font-size: var(--obs-type-caption-size); font-weight: var(--obs-type-caption-weight);
                    width: fit-content; margin-top: 4px; border-radius: var(--obs-radius-sm);
                    display:inline-flex; align-items:center; gap:4px;
                    box-shadow: var(--obs-glow-soft);
                    transition: box-shadow var(--obs-transition), background var(--obs-transition);
                }
                .analyze-btn:hover { background: var(--obs-accent-soft); box-shadow: var(--obs-glow-primary); }
                .obsroom-timeband {
                    font-family: var(--obs-font-mono); font-size: var(--obs-type-micro-size); font-weight: var(--obs-type-caption-weight); letter-spacing: var(--obs-type-caption-ls);
                    text-transform: uppercase; color: var(--obs-text-dim); opacity: 0.45;
                    margin: 18px 6px 8px; display: flex; align-items: center; gap: 8px;
                }
                .obsroom-timeband:first-child { margin-top: 2px; }
                .obsroom-timeband::after { content: ''; flex: 1; height: 1px; background: var(--obs-border); }
                .obsroom-verdict-row { padding-top: 2px; border-top: 1px dashed var(--obs-border); margin-top: 1px; }

                .obsroom-enginepanel {
                    margin: var(--obs-space-2) 2px var(--obs-space-4); padding: var(--obs-space-4) var(--obs-space-4) var(--obs-space-3);
                    background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005) 40%, rgba(0,0,0,0.06) 100%), var(--obs-surface);
                    border: 1px solid var(--obs-border); border-radius: var(--obs-radius-lg);
                    box-shadow: var(--obs-shadow-panel);
                    display: flex; flex-direction: column; gap: 16px;
                }
                .obsroom-enginepanel-header {
                    font-size: var(--obs-type-caption-size); font-weight: var(--obs-type-caption-weight); letter-spacing: var(--obs-type-caption-ls);
                    color: var(--obs-text-dim); display: flex; align-items: center; gap: 6px;
                    text-transform: uppercase; opacity: 0.85;
                }
                .obsroom-readout-row {
                    display: flex; gap: 0; border: 1px solid var(--obs-border); border-radius: var(--obs-radius-md); overflow: hidden;
                    background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 60%);
                    box-shadow: var(--obs-shadow-module);
                }
                .obsroom-readout {
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
                    padding: 9px 4px; border-right: 1px solid var(--obs-border);
                }
                .obsroom-readout:last-child { border-right: none; }
                .obsroom-readout-value { font-family: var(--obs-font-mono); font-size: var(--obs-type-headline-size); font-weight: var(--obs-type-headline-weight); color: var(--obs-text); font-variant-numeric: tabular-nums; }
                .obsroom-readout-label { font-size: var(--obs-type-micro-size); letter-spacing: var(--obs-type-micro-ls); text-transform: uppercase; color: var(--obs-text-dim); opacity: 0.7; }
                .obsroom-node-network { display: flex; flex-direction: column; gap: 8px; }
                .obsroom-node-row { display: flex; align-items: center; gap: 10px; }
                .obsroom-node-region { font-size: var(--obs-type-micro-size); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: 58px; flex-shrink: 0; opacity: 0.85; }
                .obsroom-node-cluster { display: flex; flex-wrap: wrap; gap: 6px; }
                .obsroom-node {
                    width: 7px; height: 7px; border-radius: 50%; background: var(--node-color, #5B6577);
                    box-shadow: 0 0 3px var(--node-color, transparent);
                    animation: obsroom-breathe 3s ease-in-out infinite;
                }
                .obsroom-category-tally { display: flex; flex-wrap: wrap; gap: 6px; }
                .obsroom-pulseline { font-size: var(--obs-type-micro-size); color: var(--obs-text-dim); opacity: 0.5; letter-spacing: 0.5px; text-transform: uppercase; padding-top: 12px; border-top: 1px solid var(--obs-border); display:flex; align-items:center; gap:5px; }
                .obsroom-chart { position: relative; height: 78px; opacity: 0.92; }
                .obsroom-chart-beacon {
                    position: absolute; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px;
                    border-radius: 50%; background: var(--obs-accent); pointer-events: none;
                    box-shadow: 0 0 6px var(--obs-accent);
                    animation: obsroom-beacon-pulse 2.6s ease-in-out infinite;
                }
                .obsroom-chart-beacon::after {
                    content: ''; position: absolute; inset: -7px; border-radius: 50%;
                    border: 1px solid var(--obs-accent); opacity: 0;
                    animation: obsroom-beacon-ring 2.6s ease-out infinite;
                }
                @keyframes obsroom-beacon-pulse { 0%, 100% { opacity: 0.85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
                @keyframes obsroom-beacon-ring { 0% { opacity: 0.55; transform: scale(0.5); } 100% { opacity: 0; transform: scale(2.2); } }

                .obsroom-controlstrip { display: flex; align-items: center; gap: var(--obs-space-2); flex-wrap: wrap; padding: var(--obs-space-1) var(--obs-space-1) var(--obs-space-1); }
                .obsroom-footer-fill { flex: 1; }
                .obsroom-sysbtn {
                    background: transparent; border: none; border-bottom: 1px solid transparent; color: var(--obs-text-dim);
                    padding: 5px 8px; border-radius: 0; font-size: var(--obs-type-caption-size); font-family: var(--obs-font-display); cursor:pointer;
                    display: inline-flex; align-items: center; gap: 4px; transition: border-color var(--obs-transition), color var(--obs-transition);
                }
                .obsroom-sysbtn:hover { color: var(--obs-text); border-bottom-color: var(--obs-border); }
                .obsroom-sysbtn--accent {
                    color: var(--obs-accent); font-weight: 700; border: 1px solid var(--obs-accent);
                    border-radius: var(--obs-radius-sm); box-shadow: var(--obs-glow-soft); padding: 5px 12px;
                }
                .obsroom-sysbtn--accent:hover { border-bottom-color: var(--obs-accent); box-shadow: var(--obs-glow-primary); }
                #resetTriggerCounterBtn:hover { opacity: 1; color: var(--obs-text); }
                #showTriggerHistoryBtn:hover { opacity: 1; }
                #toggleAutoTriggerBtn:hover { filter: brightness(1.15); }
                .obsroom-modal-close:hover { background: rgba(255,255,255,0.06); color: var(--obs-text); }
            </style>
        </div>
    `;
}

function buildSignalsGrid(filtered) {
    if (filtered.length === 0) {
        return `
            <div style="text-align: center; padding: 32px 10px; color: var(--obs-text-dim); opacity:0.7;">
                <div style="margin-bottom: 8px; opacity: 0.5;">${icon('radar', 22)}</div>
                <div style="font-size: var(--obs-type-body-size);">Tidak ada yang mengalir dari penyaringan ini.</div>
                <button id="resetFilterBtn" style="margin-top: 10px; padding: 5px 14px; background: transparent; border: none; border-bottom: 1px solid var(--obs-accent); color: var(--obs-accent); cursor: pointer; font-size: var(--obs-type-caption-size); transition: opacity var(--obs-transition);">Bersihkan saringan</button>
            </div>
        `;
    }

    let html = '';
    const total = filtered.length;
    let idx = 0;
    let lastBand = null;
    for (const s of filtered) {
        const analyzed = getAnalysis(s);
        const cfg = CATEGORIES[s.category] || { color: '#8A94A6', emoji: 'newspaper' };
        const srcIconName = sourceIconMap[s.source] || 'newspaper';
        const isFavorite = state.favorites.includes(s.id);
        const stage = computeSignalStage(s, analyzed, idx, total);
        const rowOpacity = Math.max(0.62, 1 - (idx / Math.max(total, 1)) * 0.34).toFixed(2);

        const ageMin = (Date.now() - new Date(s.timestamp).getTime()) / 60000;
        const band = ageMin < 60 ? 'BARU SAJA' : (ageMin < 360 ? 'BEBERAPA JAM LALU' : (ageMin < 1440 ? 'HARI INI' : 'LEBIH LAWAS'));
        let bandDivider = '';
        if (band !== lastBand) {
            bandDivider = `<div class="obsroom-timeband">${band}</div>`;
            lastBand = band;
        }

        const verdict = (window.NoisePage && typeof window.NoisePage.getVerdict === 'function')
            ? window.NoisePage.getVerdict(s.id) : null;
        let verdictBadge = '';
        if (verdict) {
            const vMap = {
                blocked: { iconName: 'shield-x', label: 'Hoax', color: '#D64545' },
                filtered: { iconName: 'shield-alert', label: 'Perlu Verifikasi', color: '#C99A2E' },
                allowed: { iconName: 'shield-check', label: 'Terverifikasi', color: '#1F9D55' }
            };
            const v = vMap[verdict.status] || vMap.filtered;
            const safeReason = escAttr(OBS.sanitizeText ? OBS.sanitizeText(verdict.reason || '') : (verdict.reason || ''));
            verdictBadge = `<div class="obsroom-verdict-row"><span title="${safeReason}" class="obsroom-verdict-pill" style="color: ${v.color}; background:${v.color}14; border:1px solid ${v.color}33;">${icon(v.iconName, 8)} ${v.label} · ${verdict.corroboratingSources || 1}src</span></div>`;
        }

        html += `
            ${bandDivider}
            <div class="signal-card obsroom-row" data-title="${escAttr(s.title)}" style="
                padding: var(--obs-space-4) var(--obs-space-3) var(--obs-space-4) var(--obs-space-4);
                cursor: default;
                opacity: ${rowOpacity};
                background: linear-gradient(155deg, ${stage.color}0a, transparent 60%), rgba(255,255,255,0.015);
                border-left: 1.5px solid ${stage.color}80;
                border-radius: 0 var(--obs-radius-md) var(--obs-radius-md) 0;
                box-shadow: var(--obs-shadow-surface), -4px 0 10px -12px ${stage.color};
                transform: translateX(${((1 - rowOpacity) * -3).toFixed(1)}px);
            ">
                <div style="display: flex; flex-direction: column; gap: var(--obs-space-2);">
                    <div class="obsroom-stage-tag" style="color:${stage.color}; background:${stage.color}14; border:1px solid ${stage.color}33;">${icon(stage.iconName, 9, stage.color)} ${stage.label}</div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <span class="signal-title" style="color: var(--obs-text); font-size: ${(11 + rowOpacity * 1.4).toFixed(1)}px; font-weight: 600; line-height: 1.4; letter-spacing: -0.1px; flex:1; opacity:0.9;"></span>
                        <span class="favorite-toggle" data-id="${s.id}" style="cursor: pointer; flex-shrink:0; display:flex; margin-top:1px;">${iconStar(isFavorite, 12, isFavorite ? '#C99A2E' : '#4A5262')}</span>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items:center;">
                        ${buildClarityMeter(analyzed.confidence, 'var(--obs-accent)')}
                        <span class="signal-sentiment" style="color: ${analyzed.sentiment.color};">${icon(analyzed.sentiment.label === 'positif' ? 'smile' : (analyzed.sentiment.label === 'negatif' ? 'frown' : 'meh'), 8)} ${analyzed.sentiment.label}</span>
                        <span class="signal-category" style="color: ${cfg.color};">${resolveIcon(cfg.emoji, 8)} ${s.category}</span>
                    </div>
                    ${verdictBadge}
                    <div style="display: flex; gap: 6px; font-size: var(--obs-type-micro-size); color: var(--obs-text-dim); opacity:0.5; align-items:center; font-weight: var(--obs-type-micro-weight);">
                        <span style="display:flex; align-items:center; gap:3px;">${icon(srcIconName, 8)} terdengar dari ${s.source}</span>
                        <span>·</span>
                        <span>${OBS.getTimeAgo(s.timestamp)}</span>
                    </div>
                    <div class="signal-desc" style="color: var(--obs-text-dim); font-size: var(--obs-type-body-size); line-height: 1.4; margin-top: 1px; opacity:0.85;"></div>
                    <button class="analyze-btn" data-title="${escAttr(s.title)}">${icon('bar-chart-2', 9)} Selidiki</button>
                </div>
            </div>
        `;
        idx++;
    }
    return html;
}

function fillSignalCards() {
    document.querySelectorAll('.signal-card').forEach(card => {
        const title = card.dataset.title;
        const signal = state.signals.find(s => s.title === title);
        if (!signal) return;

        const titleEl = card.querySelector('.signal-title');
        if (titleEl) titleEl.textContent = signal.title;

        const descEl = card.querySelector('.signal-desc');
        if (descEl) descEl.textContent = signal.desc.length > 60 ? signal.desc.substring(0,60) + '...' : signal.desc;
    });
}

function buildDetailContent(signal, analyzed, cfg) {
    const content = document.getElementById('detailContent');
    if (!content) return;

    content.innerHTML = '';
    const descDiv = document.createElement('div');
    descDiv.style.cssText = 'margin-bottom:10px;';
    descDiv.innerHTML = `
        <div style="color:var(--obs-text-dim);font-size: var(--obs-type-caption-size);margin-bottom:2px;display:flex;align-items:center;gap:4px;">${icon('file-text', 10)} Deskripsi</div>
        <div style="color:var(--obs-text);font-size:var(--obs-type-body-size);line-height:var(--obs-type-body-lh);"></div>
    `;
    descDiv.querySelector('div:last-child').textContent = signal.desc;
    content.appendChild(descDiv);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:var(--obs-type-body-size);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px;';
    const items = [
        ['Kategori', `${resolveIcon(cfg.emoji, 10)} ${signal.category}`, cfg.color],
        ['Terdengar dari', signal.source, 'var(--obs-text-dim)'],
        ['Terdeteksi', OBS.getTimeAgo(signal.timestamp), 'var(--obs-text-dim)'],
        ['Sentimen', `${icon(analyzed.sentiment.label === 'positif' ? 'smile' : (analyzed.sentiment.label === 'negatif' ? 'frown' : 'meh'), 10)} ${analyzed.sentiment.label}`, analyzed.sentiment.color],
        ['Kejernihan', `${analyzed.confidence}%`, 'var(--obs-accent)']
    ];
    items.forEach(([label, value, color]) => {
        const div = document.createElement('div');
        div.innerHTML = `<span style="color:var(--obs-text-dim);">${label}</span><br><span style="color:${color};">${value}</span>`;
        grid.appendChild(div);
    });
    content.appendChild(grid);
}

OBS.UI = {
    buildMainHTML,
    buildSignalsGrid,
    fillSignalCards,
    buildDetailContent,
    icon,
    iconStar
};

KESEMPATAN.Observation = OBS;

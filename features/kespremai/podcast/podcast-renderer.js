import { HUMAN_VOICES as VOICE_PRESETS, VOICE_EMOTIONS, LANGUAGES, THEMES, BG_MUSIC, AGENT_VOICES } from './podcast-config.js';
import { core } from './podcast-core.js';
import { uiLayout as layout } from './podcast-layout.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Podcast = KESEMPATAN.Podcast || {};

const state = core.state;

function sanitizeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function showToast(msg, type) {
    const existingToasts = document.querySelectorAll('.toast, .toast-custom');
    existingToasts.forEach(function(el) { el.remove(); });

    const container = document.getElementById('toastContainer');
    if (!container) {
        const toast = document.createElement('div');
        toast.className = 'toast-custom';
        toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#00FFA3; color:#03050A; padding:10px 20px; border-radius:30px; z-index:9999; font-weight:bold; font-size:13px;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2500);
        return;
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
    else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
}

const eventListeners = [];

function addSafeEventListener(element, event, handler) {
    if (!element) return;
    element.removeEventListener(event, handler);
    element.addEventListener(event, handler);
    eventListeners.push({ element: element, event: event, handler: handler });
}

function cleanupEventListeners() {
    for (let i = 0; i < eventListeners.length; i++) {
        const item = eventListeners[i];
        item.element.removeEventListener(item.event, item.handler);
    }
    eventListeners.length = 0;
}


function syncTopicInput() {
    const podcastInput = document.getElementById('podcastTopicInput');
    const dashboardInput = document.getElementById('topicInput');
    if (podcastInput && dashboardInput && !podcastInput.value.trim()) {
        const dashboardTopic = dashboardInput.value.trim();
        if (dashboardTopic) {
            podcastInput.placeholder = '📌 Topik dari Dashboard: "' + dashboardTopic + '"';
        } else {
            podcastInput.placeholder = 'Masukkan topik podcast (contoh: bisnis digital)';
        }
    }
}


function renderPreview() {
    const previewDiv = document.getElementById('superPreview');
    if (!previewDiv) return;

    if (!state.podcastText || state.podcastText.trim() === '') {
        previewDiv.innerHTML = '';
        return;
    }

    const theme = THEMES[state.currentTheme] || THEMES.dark;
    const text = state.podcastText;

    previewDiv.innerHTML = `
        <div class="desk-console" style="margin-top:0;">
            <div class="desk-unit">
                <div class="desk-label" style="margin-bottom:8px; text-align:left;">AI PRODUCER — TIMELINE</div>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    <button class="desk-btn" data-action="ai-generate" style="flex:1; padding:8px; font-size:10px; letter-spacing:0.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:${theme.text};">GEN</button>
                    <button class="desk-btn" data-action="enhance" style="flex:1; padding:8px; font-size:10px; letter-spacing:0.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:${theme.text};">ENHANCE</button>
                    <button class="desk-btn" data-action="improve" style="flex:1; padding:8px; font-size:10px; letter-spacing:0.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:${theme.text};">IMPROVE</button>
                    <button class="desk-btn" data-action="qa" style="flex:1; padding:8px; font-size:10px; letter-spacing:0.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:${theme.text};">Q&amp;A</button>
                    <button class="desk-btn" data-action="translate" style="flex:1; padding:8px; font-size:10px; letter-spacing:0.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:${theme.text};">TRANSLATE</button>
                    <button class="desk-btn" data-action="reset" style="flex:1; padding:8px; font-size:10px; letter-spacing:0.5px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,68,68,0.3); color:#ff6b6b;">RESET</button>
                </div>
            </div>
            <div class="desk-unit">
                <div class="ai-producer-monitor desk-screen" style="position:relative; padding:0;">
                    <textarea id="scriptEditor" style="width:100%; min-height:180px; padding:12px; border:none; color:${theme.text}; font-size:13px; line-height:1.6; resize:vertical; font-family:inherit; box-sizing:border-box; caret-color:${theme.primary}; position:relative; z-index:1; background:transparent;">${sanitizeHtml(text)}</textarea>
                </div>
                <div style="margin-top:8px; display:flex; justify-content:space-between; font-size:9px; color:${theme.text}; opacity:0.4;">
                    <span>✏️ Edit naskah langsung, lalu tekan PLAY (⌨️ Space)</span>
                    <span id="wordCount">${text.split(' ').length} kata</span>
                </div>
            </div>
            <div class="desk-unit">
                <div class="desk-readout" style="color:${theme.text}; opacity:0.5; margin-bottom:4px;">
                    ${state.aiContext ? ('COMPLEXITY ' + (state.aiContext.complexity || 0) + '% · SENTIMENT ' + (state.aiContext.sentiment ? state.aiContext.sentiment.label.toUpperCase() : 'NETRAL') + (state.aiContext.marketScore ? ' · MARKET ' + state.aiContext.marketScore + '/100' : '') + ' · MEMORY ' + (core.ai.conversationHistory ? core.ai.conversationHistory.length : 0) + ' CTX') : 'Belum ada analisis'}
                </div>
                ${state.currentRecommendations && state.currentRecommendations.length > 0 ? `
                    <div style="font-size:9px; color:${theme.primary}; margin-bottom:6px;">💡 TOP: ${sanitizeHtml((state.currentRecommendations[0].action || '') + (state.currentRecommendations[0].detail ? ' — ' + state.currentRecommendations[0].detail : ''))}</div>
                ` : ''}
                <details id="detailsAnalysis">
                    <summary style="font-size:8px; color:${theme.text}; opacity:0.5; cursor:pointer; list-style:none;">Detail Analysis</summary>
                    <div id="aiContextContainer" style="margin-top:6px;"></div>
                    <div id="recommendationsContainer"></div>
                    <div id="qaContainer"></div>
                    <div id="chaptersContainer"></div>
                    <div id="voiceRecommendationContainer"></div>
                </details>
            </div>
        </div>
    `;

    const editor = document.getElementById('scriptEditor');
    if (editor) {
        addSafeEventListener(editor, 'input', function(e) {
            state.podcastText = e.target.value;
            const wc = document.getElementById('wordCount');
            if (wc) wc.textContent = e.target.value.split(' ').length + ' kata';
        });
    }

    const generator = KESEMPATAN.Podcast.uiGenerator;
    if (generator && typeof generator.updateAIContext === 'function') {
        generator.updateAIContext();
    }
}






function setActiveSpeaker(seatKey, line) {
    const theme = THEMES[state.currentTheme] || THEMES.dark;
    const seats = document.querySelectorAll('.podcast-seat');
    seats.forEach(function(el) {
        const ring = el.querySelector('.seat-ring');
        const wave = el.querySelector('.seat-wave');
        const isActive = el.getAttribute('data-seat') === seatKey;
        if (ring) {
            ring.style.borderColor = isActive ? theme.primary : theme.border;
            ring.style.background = isActive ? theme.primary + '33' : 'rgba(255,255,255,0.06)';
            ring.style.transform = isActive ? 'scale(1.12)' : 'scale(1)';
            ring.style.boxShadow = isActive ? '0 0 16px ' + theme.primary + '99' : 'none';
        }
        if (wave) wave.style.opacity = isActive ? '1' : '0';
        el.style.transform = isActive ? 'translateY(-3px)' : 'translateY(0)';
    });

    const onAirDot = document.getElementById('onAirDot');
    const onAirLabel = document.getElementById('onAirLabel');
    if (onAirDot) {
        onAirDot.style.background = '#FF3B30';
        onAirDot.style.animation = 'podcastPulse 1s ease-in-out infinite';
    }
    if (onAirLabel) {
        onAirLabel.textContent = 'ON AIR';
        onAirLabel.style.color = '#FF3B30';
        onAirLabel.style.opacity = '1';
    }

    const captionsEl = document.getElementById('podcastCaptions');
    if (captionsEl && line) {
        currentCaptionLine = line;
        currentCaptionSpeaker = seatKey;
        captionsEl.innerHTML = '<b style="color:' + theme.primary + ';">' + sanitizeHtml(seatKey) + ':</b> ' + sanitizeHtml(line);
    }
}





let currentCaptionLine = '';
let currentCaptionSpeaker = '';
function highlightSpokenWord(charIndex, charLength) {
    const captionsEl = document.getElementById('podcastCaptions');
    if (!captionsEl || !currentCaptionLine) return;
    const theme = THEMES[state.currentTheme] || THEMES.dark;
    const before = currentCaptionLine.substring(0, charIndex);
    const word = currentCaptionLine.substring(charIndex, charIndex + charLength);
    const after = currentCaptionLine.substring(charIndex + charLength);
    captionsEl.innerHTML = '<b style="color:' + theme.primary + ';">' + sanitizeHtml(currentCaptionSpeaker) + ':</b> ' +
        sanitizeHtml(before) +
        '<mark style="background:' + theme.primary + '; color:' + theme.bg + '; border-radius:4px; padding:0 2px;">' + sanitizeHtml(word) + '</mark>' +
        sanitizeHtml(after);
}

function clearActiveSpeaker() {
    const theme = THEMES[state.currentTheme] || THEMES.dark;
    document.querySelectorAll('.podcast-seat').forEach(function(el) {
        const ring = el.querySelector('.seat-ring');
        const wave = el.querySelector('.seat-wave');
        if (ring) {
            ring.style.borderColor = theme.border;
            ring.style.background = 'rgba(255,255,255,0.06)';
            ring.style.transform = 'scale(1)';
            ring.style.boxShadow = 'none';
        }
        if (wave) wave.style.opacity = '0';
        el.style.transform = 'translateY(0)';
    });
    const onAirDot = document.getElementById('onAirDot');
    const onAirLabel = document.getElementById('onAirLabel');
    if (onAirDot) {
        onAirDot.style.background = '#555';
        onAirDot.style.animation = 'none';
    }
    if (onAirLabel) {
        onAirLabel.textContent = 'STUDIO';
        onAirLabel.style.color = theme.text;
        onAirLabel.style.opacity = '0.45';
    }
}


let isRendering = false;
let initialRenderDone = false; 

function render() {
    if (isRendering) {
        return;
    }
    isRendering = true;
    try {
        let container = document.getElementById('podcastGeneratorPanel');
        if (!container) {
            const page = document.getElementById('podcastPage');
            if (page) {
                container = document.createElement('div');
                container.id = 'podcastGeneratorPanel';
                container.className = 'result-container';
                page.appendChild(container);
            } else {
                container = document.createElement('div');
                container.id = 'podcastGeneratorPanel';
                container.className = 'result-container';
                document.body.appendChild(container);
            }
        }

        
        
        
        
        
        
        
        
        
        const scrollContainer = container.closest('.result-container') || container;
        const savedScrollY = window.scrollY;
        const savedContainerScrollTop = scrollContainer.scrollTop;

        
        
        
        
        
        
        
        
        
        
        
        const openDetailsIds = Array.from(container.querySelectorAll('details[id]'))
            .filter(function(d) { return d.open; })
            .map(function(d) { return d.id; });

        container.innerHTML = layout.buildPodcastLayout(state);

        openDetailsIds.forEach(function(id) {
            const el = document.getElementById(id);
            if (el && el.tagName === 'DETAILS') {
                
                
                
                
                el.classList.add('no-reveal-anim');
                el.open = true;
            }
        });

        syncTopicInput();

        updateStatus();
        updateGallery();
        renderBookmarks();
        updatePlayButtons();

        if (state.podcastText && state.podcastText.trim() !== '') {
            renderPreview();
        }

        const analyticsContainer = document.getElementById('analyticsContainer');
        if (analyticsContainer && core.renderAnalytics) {
            analyticsContainer.innerHTML = core.renderAnalytics();
        }

        if (KESEMPATAN.Podcast && KESEMPATAN.Podcast.uiHandlers && KESEMPATAN.Podcast.uiHandlers.attachEvents) {
            KESEMPATAN.Podcast.uiHandlers.attachEvents();
        }

        
        
        
        
        
        
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                window.scrollTo(0, savedScrollY);
                if (scrollContainer && scrollContainer !== window) {
                    scrollContainer.scrollTop = savedContainerScrollTop;
                }
            });
        });

        
        if (!initialRenderDone) {
            initialRenderDone = true;
            if (window.lastAggregated && KESEMPATAN.Podcast.uiHandlers) {
                
                setTimeout(function() {
                    KESEMPATAN.Podcast.uiHandlers.updateScript();
                }, 500);
            }
        }

        
        setTimeout(function() {
            updateGallery();
        }, 300);
    } finally {
        isRendering = false;
    }
}


function updateStatus() {
    const topicInput = document.getElementById('topicInput');
    const topic = topicInput ? topicInput.value : '-';
    const agg = window.lastAggregated;
    const topicEl = document.getElementById('superTopicDisplay');
    const scoreEl = document.getElementById('superScoreDisplay');
    const badgeEl = document.getElementById('superStatusBadge');
    const theme = THEMES[state.currentTheme];
    if (topicEl) topicEl.innerText = topic.substring(0, 30);
    if (scoreEl) scoreEl.innerText = agg ? agg.score : '0';
    if (badgeEl) {
        if (agg) {
            badgeEl.innerHTML = '✅ READY';
            badgeEl.style.background = theme.primary;
            badgeEl.style.color = theme.bg;
        } else {
            badgeEl.innerHTML = '⚠️ BELUM';
            badgeEl.style.background = '#FFA500';
            badgeEl.style.color = '#03050A';
        }
    }
    updateGallery();
}

function updatePlayButtons() {
    const playBtn = document.getElementById('superPlayBtn');
    const stopBtn = document.getElementById('superStopBtn');
    if (playBtn) {
        playBtn.style.display = state.isPlaying ? 'none' : 'inline-block';
        playBtn.textContent = state.isPlaying ? '⏸️' : '▶️ PLAY';
    }
    if (stopBtn) {
        stopBtn.style.display = state.isPlaying ? 'inline-block' : 'none';
    }
}

function updateGallery() {
    const galleryDiv = document.getElementById('podcastGallery');
    if (!galleryDiv) return;
    const container = galleryDiv.querySelector('.gallery-items') || galleryDiv;
    const theme = THEMES[state.currentTheme];
    if (state.podcastHistory.length === 0) {
        container.innerHTML = '<div style="color:#666; text-align:center; padding:20px; font-size:9px; font-family:\'Courier New\',monospace;">EMPTY — belum ada project tersimpan</div>';
        return;
    }
    const items = state.podcastHistory.slice(-5).reverse();
    let itemsHtml = '';
    for (let i = 0; i < items.length; i++) {
        const p = items[i];
        const isActive = i === 0; 
        const idx = state.podcastHistory.indexOf(p);
        itemsHtml += `<div class="desk-channel" style="cursor:pointer; ${isActive ? 'background:' + theme.primary + '0d;' : ''}" onclick="window.KESEMPATAN.PodcastGenerator.loadHistoryItem(${idx})">
            <span class="desk-indicator ${isActive ? 'on' : ''}" style="background:${isActive ? theme.primary : 'rgba(255,255,255,0.15)'};"></span>
            <span style="flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:10px; color:${isActive ? theme.primary : theme.text}; opacity:${isActive ? '1' : '0.5'}; font-weight:${isActive ? '700' : '400'};">Ep. ${p.episodeNumber || (idx + 1)} — ${sanitizeHtml(p.topic.substring(0, 22))}</span>
            <span class="desk-status ${isActive ? 'on' : 'off'}" style="flex-shrink:0;">${isActive ? 'READY' : ''}</span>
        </div>`;
    }
    container.innerHTML = `
        <div class="desk-label" style="text-align:left; margin-bottom:6px;">PROJECTS (${state.podcastHistory.length})</div>
        ${itemsHtml}
    `;
}

function renderBookmarks() {
    const container = document.getElementById('bookmarksContainer');
    if (!container) return;
    let bmHtml = '';
    for (let i = 0; i < state.bookmarks.length; i++) {
        const bm = state.bookmarks[i];
        bmHtml += '<span style="background:rgba(255,215,0,0.1); border:1px solid #FFD700; border-radius:12px; padding:2px 8px; font-size:8px; color:#FFD700; cursor:pointer;" onclick="window.KESEMPATAN.PodcastGenerator.jumpToBookmark(' + i + ')">⭐ ' + new Date(bm.time * 1000).toISOString().substr(14, 5) + '</span>';
    }
    container.innerHTML = bmHtml;
}

export const uiRenderer = {
    render: render,
    renderPreview: renderPreview,
    updateGallery: updateGallery,
    updateStatus: updateStatus,
    updatePlayButtons: updatePlayButtons,
    renderBookmarks: renderBookmarks,
    showToast: showToast,
    sanitizeHtml: sanitizeHtml,
    cleanupEventListeners: cleanupEventListeners,
    addSafeEventListener: addSafeEventListener,
    setActiveSpeaker: setActiveSpeaker,
    highlightSpokenWord: highlightSpokenWord,
    clearActiveSpeaker: clearActiveSpeaker
};

KESEMPATAN.Podcast.uiRenderer = uiRenderer;
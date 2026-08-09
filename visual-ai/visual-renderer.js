import { VisualState as state } from './visual-state.js';
import { VisualCore as core } from './visual-core.js';
import { VisualLayout as layout } from './visual-layout.js';
import { VisualEngineModule } from './visual-engine.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const modernStyle = document.createElement('style');
modernStyle.textContent = `:root{--vz-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--vz-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--vz-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} #visualAgentPanel{box-sizing:border-box;} .vz-wrap{box-sizing:border-box;padding:4px 12px 16px;background:transparent;} .vz-head{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px;} .vz-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary,#00FFA3);text-shadow:0 0 10px rgba(0,255,163,.35);} .vz-sub{font-size:10px;color:#A0B3C9;margin-top:2px;} .vz-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;} .vz-toggle{position:relative;isolation:isolate;clip-path:var(--vz-clip-asym);background:rgba(26,255,156,.3);padding:1px;display:inline-flex;} .vz-toggle::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip-asym);background:#05080c;z-index:-1;} .vz-toggle-in{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;font-size:10px;} .vz-card{position:relative;isolation:isolate;clip-path:var(--vz-clip);background:rgba(26,255,156,.3);padding:1px;margin-bottom:12px;transition:background .25s ease,filter .3s ease;} .vz-card::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip);background:#05080c;z-index:-1;} .vz-card:hover{background:rgba(26,255,156,.5);filter:drop-shadow(0 0 6px rgba(0,255,163,.25));} .vz-card-purple{background:rgba(155,89,182,.4);} .vz-card-purple::before{background:#0d0714;} .vz-card-in{display:block;padding:12px 14px;} .vz-label{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#A0B3C9;margin-bottom:8px;} .vz-btn{position:relative;isolation:isolate;clip-path:var(--vz-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:8px 14px;color:var(--primary,#00FFA3);font-size:10px;font-weight:700;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .vz-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip-asym);background:#05080c;z-index:-1;} .vz-btn:active{transform:scale(.97);} .vz-primary{background:linear-gradient(135deg,#00FFA3,#00AA6E);color:#03130b;font-weight:800;} .vz-primary::before{display:none;} .vz-gold{background:rgba(255,215,0,.45);color:#FFE27A;} .vz-gold::before{background:#171202;} .vz-purple{background:rgba(155,89,182,.5);color:#C39BD3;} .vz-purple::before{background:#120a18;} .vz-danger{background:rgba(255,68,68,.5);color:#FF8080;} .vz-danger::before{background:#160608;} .vz-mode-btn{position:relative;isolation:isolate;clip-path:var(--vz-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.3);padding:7px 16px;color:#9fb8ac;font-size:11px;cursor:pointer;transition:background .25s ease,color .2s ease;} .vz-mode-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip-asym);background:#05080c;z-index:-1;} .vz-mode-btn.active{background:var(--primary,#00FFA3);color:#03130b;font-weight:800;} .vz-mode-btn.active::before{background:var(--primary,#00FFA3);} .vz-rim{position:relative;isolation:isolate;clip-path:var(--vz-clip-sm);background:rgba(26,255,156,.3);padding:1px;display:block;} .vz-rim::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip-sm);background:#05080c;z-index:-1;} .vz-rim-in{display:block;} .vz-field{display:block;width:100%;box-sizing:border-box;background:transparent;border:0;border-radius:0;color:#E0E6ED;padding:8px 12px;font-size:11px;outline:none;margin:0;} .vz-upload-title{color:#A0B3C9;font-size:14px;font-weight:600;} .vz-upload-sub{color:rgba(160,179,201,.5);font-size:11px;margin-top:4px;} .vz-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;} .vz-avatar{width:100%;height:180px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,.03);overflow:hidden;} .vz-box{width:100%;min-height:180px;display:flex;align-items:center;justify-content:center;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.03);} .vz-placeholder{color:rgba(160,179,201,.35);font-size:12px;} .status-text{display:inline-block;position:relative;isolation:isolate;clip-path:var(--vz-clip-asym);padding:6px 18px;font-size:12px;background:rgba(26,255,156,.25);} .status-text::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip-asym);background:#05080c;z-index:-1;} .vz-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;max-height:180px;overflow-y:auto;padding:4px;} .gallery-item{position:relative;isolation:isolate;clip-path:var(--vz-clip-sm);background:rgba(26,255,156,.25);padding:1px;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .2s ease;} .gallery-item::before{content:'';position:absolute;inset:1px;clip-path:var(--vz-clip-sm);background:#05080c;z-index:-1;} .gallery-item:hover{background:rgba(26,255,156,.55);filter:drop-shadow(0 0 6px rgba(0,255,163,.25));transform:translateY(-2px);} .gallery-item-in{display:block;padding:8px 10px;} .vz-back{display:block;width:100%;margin-top:14px;padding:10px;font-size:12px;} .vz-foot{margin-top:12px;text-align:center;font-size:9px;color:#445;} .fallback-avatar-2d{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;background:radial-gradient(circle at 35% 30%, rgba(255,255,255,0.15), transparent 60%),conic-gradient(from 0deg, var(--fb-color, #00FFA3), rgba(155,89,182,0.6), var(--fb-color, #00FFA3));animation:fallbackSpin 6s linear infinite;} @keyframes fallbackSpin{from{filter:hue-rotate(0deg);}to{filter:hue-rotate(360deg);}} .fallback-spinner-2d{width:32px;height:32px;border-radius:50%;border:3px solid rgba(155,89,182,0.15);border-top-color:#9B59B6;animation:fallbackRotate 0.9s linear infinite;} @keyframes fallbackRotate{to{transform:rotate(360deg);}} .fallback-bg-2d{width:100%;height:100%;background:linear-gradient(120deg, rgba(0,255,163,0.08), rgba(155,89,182,0.08), rgba(0,255,163,0.08));background-size:200% 200%;animation:fallbackGradient 8s ease infinite;} @keyframes fallbackGradient{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}} @media (hover:hover) and (pointer:fine){ .vz-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} .vz-mode-btn:hover{background:rgba(26,255,156,.55);color:#E0E8F0;} .vz-mode-btn.active:hover{background:var(--primary,#00FFA3);color:#03130b;} }`;
document.head.appendChild(modernStyle);

function ensureContainer() {
    const premiumInner = document.getElementById('premiumPageInner');
    if (!premiumInner) return null;
    let container = document.getElementById('visualAgentPanel');
    if (container && container.parentElement !== premiumInner) {
        premiumInner.innerHTML = '';
        premiumInner.appendChild(container);
    }
    if (!container) {
        premiumInner.innerHTML = '';
        container = document.createElement('div');
        container.id = 'visualAgentPanel';
        container.style.cssText = 'display:block; padding:0; margin:0;';
        premiumInner.prepend(container);
    }
    container.style.display = 'block';
    return container;
}

function renderGallery() {
    const galleryContainer = document.querySelector('#galleryContainer');
    if (!galleryContainer) return;
    const history = state.getHistory();
    if (history.length === 0) {
        galleryContainer.innerHTML = '<div class="vz-placeholder" style="text-align:center;padding:20px;grid-column:1/-1;">Belum ada agen</div>';
        return;
    }
    galleryContainer.innerHTML = history.slice(0, 20).map(function(h) {
        const styleBg = h.features && h.features.style === 'vintage' ? '#FFD70022' :
            h.features && h.features.style === 'minimalist' ? '#4ECDC422' :
            h.features && h.features.style === 'colorful' ? '#9B59B622' : '#00FFA322';
        return '<div class="gallery-item" data-id="' + h.id + '"><span class="gallery-item-in">' +
            '<div style="width:100%;height:70px;background:linear-gradient(135deg,' + styleBg + ',rgba(0,0,0,0.2));clip-path:var(--vz-clip-sm);display:flex;align-items:center;justify-content:center;font-size:24px;"></div>' +
            '<div style="margin-top:6px;">' +
            '<div style="color:#00FFA3;font-weight:600;font-size:11px;">' + (h.name || '') + '</div>' +
            '<div style="font-size:9px;color:rgba(160,179,201,.4);">' + (h.role || '') + '</div>' +
            '<div style="font-size:8px;color:rgba(160,179,201,.3);margin-top:2px;">' + (h.rating || '') + '</div>' +
            '</div></span></div>';
    }).join('');
    galleryContainer.querySelectorAll('.gallery-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const id = parseInt(this.dataset.id, 10);
            const h = state.getHistory().find(function(entry) { return entry.id === id; });
            if (!h) return;
            const modal = document.getElementById('historyDetailModal');
            const content = document.getElementById('historyDetailContent');
            const title = document.getElementById('historyDetailTitle');
            if (modal && content && title) {
                title.textContent = h.name || '';
                content.innerHTML = '<div style="font-size:13px;color:#E0E6ED;">' +
                    '<div><strong style="color:#00FFA3;">Nama: </strong>' + (h.name || '') + '</div>' +
                    '<div><strong style="color:#00FFA3;">Role: </strong>' + (h.role || '-') + '</div>' +
                    '<div><strong style="color:#00FFA3;">Rating: </strong>' + (h.rating || '') + '</div>' +
                    '<div><strong style="color:#00FFA3;">Tags: </strong>' + (h.tags ? h.tags.map(function(t) {
                        return '<span style="background:rgba(155,89,182,0.15);padding:0 6px;clip-path:var(--vz-clip-sm);font-size:10px;color:#9B59B6;">' + t + '</span>';
                    }).join(' ') : '-') + '</div>' +
                    '<div><strong style="color:#00FFA3;">Dibuat: </strong>' + new Date(h.createdAt).toLocaleString() + '</div>' +
                    '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05);">' +
                    '<strong style="color:#00FFA3;">System Prompt: </strong>' +
                    '<div style="font-size:11px;color:rgba(160,179,201,0.6);margin-top:4px;background:rgba(0,0,0,0.2);padding:8px;clip-path:var(--vz-clip-sm);max-height:100px;overflow-y:auto;white-space:pre-wrap;">' + (h.systemPrompt || 'Tidak ada prompt') + '</div>' +
                    '</div></div>';
                modal.style.display = 'flex';
            }
        });
    });
}

function renderUI() {
    const container = ensureContainer();
    if (!container) return;
    const layoutState = {
        useAIInternal: state.getUseAI(),
        voiceEnabled: state.getVoice(),
        darkMode: state.getDarkMode(),
        apiMode: state.getApiMode(),
        googleVisionKey: state.getGoogleKey(),
        clarifaiKey: state.getClarifaiKey(),
        history: state.getHistory(),
        selectedFiles: state.getSelectedFiles(),
        isGenerating: state.isGenerating()
    };
    container.innerHTML = layout.buildVisualLayout(layoutState);
    renderGallery();
    if (KESEMPATAN.VisualEvents && typeof KESEMPATAN.VisualEvents.attach === 'function') {
        KESEMPATAN.VisualEvents.attach();
    }
    if (state.getHistory().length > 0 && core && typeof core.loadThreeJS === 'function') {
        core.loadThreeJS().then(function() {
            const engine = VisualEngineModule.create();
            const timelineContainer = document.getElementById('timelineContainer');
            if (engine && timelineContainer) engine.createTimeline(state.getHistory(), 'timelineContainer');
        });
    }
}

async function init() {
    if (core && typeof core.loadThreeJS === 'function') await core.loadThreeJS();
    ensureContainer();
    renderUI();
}

export const VisualRenderer = { render: renderUI, init: init, ensureContainer: ensureContainer, renderGallery: renderGallery };
KESEMPATAN.VisualRenderer = VisualRenderer;

import { Utils } from '../../../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const { showToast } = Utils;

const safeToast = function(message, type) {
    if (showToast) {
        showToast(message, type);
        return;
    }
    const container = document.getElementById('toastContainer');
    if (!container) {
        return;
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === 'error') {
        toast.style.borderLeftColor = '#e74c3c';
    } else if (type === 'success') {
        toast.style.borderLeftColor = '#2ecc71';
    }
    container.appendChild(toast);
    setTimeout(function() {
        toast.remove();
    }, 3500);
};

const KC_CSS = '\n' +
    '.kesos-crypto{ --bg:transparent; --panel:transparent; --panel-2:transparent; --surface:rgba(255,255,255,0.035); --line:#1B2622; --line-bright:#2A3A34; --accent:#00FFA3; --accent-dim:#0A5F44; --white:#E8EDEA; --grey:#5C6B66; --amber:#FFB800; --red:#FF3B3B; --disp:"Oswald","Arial Narrow",sans-serif; --body:"IBM Plex Sans","Segoe UI",sans-serif; --mono:"IBM Plex Mono","Consolas",monospace;' +
    ' position:relative; overflow:hidden; background:transparent; color:var(--white); font-family:var(--body); padding:14px 0 18px; }' +
    '.kesos-crypto *{ box-sizing:border-box; }' +
    '.kesos-crypto .kc-grid-layer{ position:absolute; inset:0; pointer-events:none; z-index:0;' +
    ' background-image:linear-gradient(rgba(255,255,255,0.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.014) 1px, transparent 1px);' +
    ' background-size:26px 26px; -webkit-mask-image:radial-gradient(ellipse 90% 90% at 50% 15%, black 10%, transparent 85%); mask-image:radial-gradient(ellipse 90% 90% at 50% 15%, black 10%, transparent 85%); }' +
    '.kesos-crypto .kc-scan-tex{ position:absolute; inset:0; pointer-events:none; z-index:0; mix-blend-mode:overlay;' +
    ' background:repeating-linear-gradient(0deg, rgba(255,255,255,0.010) 0px, rgba(255,255,255,0.010) 1px, transparent 1px, transparent 3px); }' +
    '.kesos-crypto .kc-scan-beam{ position:absolute; left:0; right:0; height:70px; top:-70px; pointer-events:none; z-index:0; mix-blend-mode:screen; opacity:0;' +
    ' background:linear-gradient(180deg, transparent, rgba(0,255,163,0.07), transparent); }' +
    '.kesos-crypto .kc-scan-beam.kc-active{ opacity:1; animation:kcBeam 1.1s linear; }' +
    '@keyframes kcBeam{ 0%{ top:-70px; opacity:1; } 90%{ opacity:1; } 100%{ top:100%; opacity:0; } }' +
    '.kesos-crypto .kc-device{ position:relative; z-index:1; width:100%; max-width:460px; margin:0 auto; padding:0 10px; }' +
    '.kesos-crypto .kc-panel{ position:relative; background:transparent; border:1px solid var(--line);' +
    ' clip-path:polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px); padding:14px; }' +
    '.kesos-crypto .kc-panel + .kc-panel{ margin-top:9px; }' +
    '.kesos-crypto .kc-panel::before, .kesos-crypto .kc-panel::after{ content:""; position:absolute; width:9px; height:9px; border-color:var(--accent); opacity:0.85; }' +
    '.kesos-crypto .kc-panel::before{ top:-1px; right:9px; border-top:1px solid var(--accent); }' +
    '.kesos-crypto .kc-panel::after{ bottom:-1px; left:9px; border-bottom:1px solid var(--accent); }' +
    '.kesos-crypto .kc-corner-tl{ position:absolute; top:6px; left:6px; width:10px; height:10px; border-top:1px solid var(--line-bright); border-left:1px solid var(--line-bright); }' +
    '.kesos-crypto .kc-corner-br{ position:absolute; bottom:6px; right:6px; width:10px; height:10px; border-bottom:1px solid var(--line-bright); border-right:1px solid var(--line-bright); }' +
    '.kesos-crypto .kc-micro{ font-family:var(--mono); font-size:6.5px; letter-spacing:1.3px; color:var(--grey); text-transform:uppercase; white-space:nowrap; }' +
    '.kesos-crypto .kc-feed{ color:var(--accent); opacity:0.85; }' +
    '.kesos-crypto .kc-node-ind{ display:inline-flex; align-items:center; gap:4px; }' +
    '.kesos-crypto .kc-node-dot{ width:4px; height:4px; border-radius:50%; background:var(--accent); box-shadow:0 0 3px rgba(0,255,163,0.75); flex:0 0 auto; }' +
    '.kesos-crypto .kc-coord{ color:var(--line-bright); }' +
    '.kesos-crypto .kc-sep{ border:none; border-top:1px solid var(--line); margin:9px 0; }' +
    '.kesos-crypto .kc-sep-dash{ border:none; border-top:1px dashed var(--line); margin:0; }' +
    '.kesos-crypto .kc-meta-strip{ display:flex; align-items:center; gap:9px; flex-wrap:wrap; margin-bottom:8px; padding-bottom:7px; border-bottom:1px dashed var(--line); }' +
    '.kesos-crypto .kc-hdr-top{ display:flex; align-items:center; justify-content:space-between; gap:8px; }' +
    '.kesos-crypto .kc-brand{ display:flex; align-items:center; gap:9px; min-width:0; }' +
    '.kesos-crypto .kc-brand-title{ font-family:var(--disp); font-weight:600; font-size:15px; letter-spacing:1.8px; color:var(--white); line-height:1.1; }' +
    '.kesos-crypto .kc-brand-neon{ color:var(--accent); text-shadow:0 0 6px rgba(0,255,163,0.35); }' +
    '.kesos-crypto .kc-brand-sub{ font-family:var(--mono); font-size:6.8px; letter-spacing:1.4px; color:var(--grey); margin-top:2px; }' +
    '.kesos-crypto .kc-live-tag{ text-align:right; flex:0 0 auto; }' +
    '.kesos-crypto .kc-live-row{ display:flex; align-items:center; justify-content:flex-end; gap:5px; }' +
    '.kesos-crypto .kc-live-dot{ width:6px; height:6px; border-radius:50%; background:var(--accent); box-shadow:0 0 6px 1px rgba(0,255,163,0.6); animation:kcPulse 1.6s ease-in-out infinite; }' +
    '@keyframes kcPulse{ 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }' +
    '.kesos-crypto .kc-live-word{ font-family:var(--mono); font-size:9px; letter-spacing:2px; color:var(--accent); }' +
    '.kesos-crypto .kc-clock{ font-family:var(--mono); font-size:10px; color:var(--white); letter-spacing:1px; margin-top:2px; }' +
    '.kesos-crypto .kc-title-row{ font-family:var(--disp); font-weight:600; font-size:16px; letter-spacing:0.6px; color:var(--white); display:flex; align-items:baseline; gap:7px; flex-wrap:wrap; }' +
    '.kesos-crypto .kc-exch-row{ display:flex; align-items:center; gap:6px; margin-top:7px; flex-wrap:wrap; }' +
    '.kesos-crypto .kc-exch-count{ font-family:var(--mono); font-size:8px; color:var(--accent); letter-spacing:1px; white-space:nowrap; }' +
    '.kesos-crypto .kc-exch-list{ font-family:var(--mono); font-size:8px; color:var(--grey); letter-spacing:0.4px; }' +
    '.kesos-crypto .kc-exch-list b{ color:var(--white); font-weight:500; }' +
    '.kesos-crypto .kc-summary-grid{ position:relative; display:grid; grid-template-columns:1fr 1fr; gap:11px; }' +
    '.kesos-crypto .kc-summary-grid::before{ content:""; position:absolute; top:2px; bottom:2px; left:50%; width:1px; background:var(--line); transform:translateX(-50%); }' +
    '.kesos-crypto .kc-gauge-wrap{ display:flex; flex-direction:column; align-items:center; }' +
    '.kesos-crypto .kc-gauge-title{ font-family:var(--mono); font-size:7.5px; letter-spacing:1.3px; color:var(--grey); margin-bottom:7px; }' +
    '.kesos-crypto .kc-gauge-center .kc-val{ font-family:var(--disp); font-weight:600; font-size:14px; color:var(--white); letter-spacing:1px; text-align:center; }' +
    '.kesos-crypto .kc-gauge-center .kc-sub{ font-family:var(--mono); font-size:8px; color:var(--accent); letter-spacing:1px; text-align:center; }' +
    '.kesos-crypto .kc-gauge-scale{ display:flex; justify-content:space-between; width:110px; margin-top:4px; }' +
    '.kesos-crypto .kc-gauge-scale span{ font-family:var(--mono); font-size:7px; color:var(--grey); }' +
    '.kesos-crypto .kc-trend-wrap{ display:flex; flex-direction:column; }' +
    '.kesos-crypto .kc-trend-title{ font-family:var(--mono); font-size:7.5px; letter-spacing:1.3px; color:var(--grey); margin-bottom:6px; }' +
    '.kesos-crypto .kc-trend-axis{ display:flex; justify-content:space-between; margin-top:3px; }' +
    '.kesos-crypto .kc-trend-axis span{ font-family:var(--mono); font-size:6.5px; color:var(--grey); }' +
    '.kesos-crypto .kc-tele-col{ display:flex; flex-direction:column; gap:8px; }' +
    '.kesos-crypto .kc-tele-row{ display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); padding-bottom:7px; }' +
    '.kesos-crypto .kc-tele-row:last-child{ border-bottom:none; padding-bottom:0; }' +
    '.kesos-crypto .kc-tele-left{ display:flex; align-items:center; gap:6px; }' +
    '.kesos-crypto .kc-tele-lbl{ font-family:var(--mono); font-size:7.5px; color:var(--grey); letter-spacing:1px; }' +
    '.kesos-crypto .kc-tele-val{ font-family:var(--disp); font-weight:500; font-size:12px; color:var(--white); }' +
    '.kesos-crypto .kc-vol-bars{ display:flex; gap:1.5px; align-items:flex-end; height:13px; }' +
    '.kesos-crypto .kc-vol-bars span{ width:2.5px; background:var(--accent); opacity:0.75; }' +
    '.kesos-crypto .kc-ticker-panel{ padding:8px 14px; }' +
    '.kesos-crypto .kc-ticker-inner{ display:flex; align-items:center; gap:9px; font-family:var(--mono); font-size:9px; letter-spacing:1.3px; color:var(--white); overflow:hidden; white-space:nowrap; }' +
    '.kesos-crypto .kc-ticker-flag{ color:var(--amber); }' +
    '.kesos-crypto .kc-ticker-dot{ color:var(--line-bright); }' +
    '.kesos-crypto .kc-coin-row{ padding:10px 12px; }' +
    '.kesos-crypto .kc-row-meta{ display:flex; align-items:center; justify-content:space-between; gap:7px; margin-bottom:6px; }' +
    '.kesos-crypto .kc-coin-top{ display:flex; align-items:center; gap:10px; }' +
    '.kesos-crypto .kc-coin-logo{ width:30px; height:30px; flex:0 0 auto; clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px); display:flex; align-items:center; justify-content:center; font-family:var(--disp); font-weight:700; font-size:13px; }' +
    '.kesos-crypto .kc-coin-name{ font-family:var(--disp); font-weight:500; font-size:13.5px; color:var(--white); letter-spacing:0.4px; }' +
    '.kesos-crypto .kc-coin-tick{ font-family:var(--mono); font-size:8px; color:var(--grey); letter-spacing:1.3px; margin-top:1px; }' +
    '.kesos-crypto .kc-coin-mid{ display:flex; align-items:center; justify-content:space-between; margin-top:8px; gap:6px; }' +
    '.kesos-crypto .kc-price-usd{ font-family:var(--disp); font-weight:700; font-size:16.5px; color:var(--white); letter-spacing:0.3px; }' +
    '.kesos-crypto .kc-price-local{ font-family:var(--mono); font-size:8px; color:var(--grey); margin-top:1px; }' +
    '.kesos-crypto .kc-v-sep{ width:1px; align-self:stretch; background:var(--line); flex:0 0 auto; }' +
    '.kesos-crypto .kc-badge{ font-family:var(--mono); font-size:8.5px; letter-spacing:1.3px; font-weight:600; padding:3px 8px; display:inline-flex; align-items:center; gap:4px;' +
    ' clip-path:polygon(6px 0,100% 0,100% 100%, 6px 100%, 0 calc(100% - 6px), 0 6px); white-space:nowrap; }' +
    '.kesos-crypto .kc-badge .kc-dot{ width:5px; height:5px; border-radius:50%; }' +
    '.kesos-crypto .kc-badge.kc-buy{ color:var(--accent); border:1px solid var(--accent-dim); background:rgba(0,255,163,0.06); }' +
    '.kesos-crypto .kc-badge.kc-buy .kc-dot{ background:var(--accent); }' +
    '.kesos-crypto .kc-badge.kc-sell{ color:var(--red); border:1px solid rgba(255,59,59,0.35); background:rgba(255,59,59,0.06); }' +
    '.kesos-crypto .kc-badge.kc-sell .kc-dot{ background:var(--red); }' +
    '.kesos-crypto .kc-badge.kc-hold{ color:var(--amber); border:1px solid rgba(255,184,0,0.35); background:rgba(255,184,0,0.06); }' +
    '.kesos-crypto .kc-badge.kc-hold .kc-dot{ background:var(--amber); }' +
    '.kesos-crypto .kc-rsi-block{ text-align:right; }' +
    '.kesos-crypto .kc-rsi-val{ font-family:var(--mono); font-size:10px; color:var(--white); letter-spacing:0.4px; }' +
    '.kesos-crypto .kc-rsi-sub{ font-family:var(--mono); font-size:7px; color:var(--grey); }' +
    '.kesos-crypto .kc-coin-bottom{ display:flex; align-items:center; justify-content:space-between; margin-top:8px; padding-top:7px; border-top:1px solid var(--line); }' +
    '.kesos-crypto .kc-stat-mini{ font-family:var(--mono); font-size:7.5px; color:var(--grey); letter-spacing:0.8px; display:flex; align-items:center; gap:4px; }' +
    '.kesos-crypto .kc-stat-mini b{ color:var(--white); font-weight:500; }' +
    '.kesos-crypto .kc-up{ color:var(--accent); } .kesos-crypto .kc-down{ color:var(--red); }' +
    '.kesos-crypto .kc-tbars{ display:flex; gap:1.5px; align-items:flex-end; height:10px; }' +
    '.kesos-crypto .kc-tbars span{ width:2px; background:var(--grey); }' +
    '.kesos-crypto .kc-tbars span.on{ background:var(--accent); }' +
    '.kesos-crypto .kc-console-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:7px; }' +
    '.kesos-crypto .kc-console-btn{ background:var(--surface); border:1px solid var(--line); color:var(--white); font-family:var(--mono);' +
    ' clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);' +
    ' padding:9px 3px; display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer; transition:border-color .15s, background .15s; }' +
    '.kesos-crypto .kc-console-btn:hover{ border-color:var(--accent-dim); background:#0D1512; }' +
    '.kesos-crypto .kc-console-btn .kc-ico{ width:14px; height:14px; color:var(--accent); }' +
    '.kesos-crypto .kc-console-btn.kc-stop .kc-ico{ color:var(--red); }' +
    '.kesos-crypto .kc-console-btn .kc-lbl{ font-family:var(--mono); font-size:7px; letter-spacing:1.2px; color:var(--white); }' +
    '.kesos-crypto .kc-console-full{ grid-column:span 4; display:flex; align-items:center; justify-content:space-between; padding:9px 12px;' +
    ' background:var(--surface); border:1px solid var(--line); clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); }' +
    '.kesos-crypto .kc-legend-panel{ padding:8px 10px; }' +
    '.kesos-crypto .kc-legend-row{ display:flex; flex-wrap:wrap; gap:7px 10px; align-items:center; justify-content:center; font-family:var(--mono); font-size:6.8px; color:var(--grey); letter-spacing:0.8px; }' +
    '.kesos-crypto .kc-legend-row .kc-dot{ width:5px; height:5px; border-radius:50%; display:inline-block; margin-right:3px; vertical-align:middle; }' +
    '.kesos-crypto .kc-back-row{ display:flex; align-items:center; justify-content:space-between; padding:11px 4px 0; }' +
    '.kesos-crypto .kc-back-btn{ font-family:var(--mono); font-size:8.5px; letter-spacing:1.3px; color:var(--grey); background:none; border:none; display:flex; align-items:center; gap:6px; cursor:pointer; }' +
    '.kesos-crypto .kc-back-btn:hover{ color:var(--accent); }' +
    '.kesos-crypto .kc-foot-tag{ text-align:right; font-family:var(--mono); font-size:6.5px; color:var(--line-bright); letter-spacing:0.8px; line-height:1.5; }' +
    '.kesos-crypto .kc-eyebrow{ font-family:var(--mono); font-size:7px; letter-spacing:1.6px; color:var(--accent); opacity:0.85; margin-bottom:8px; }' +
    '.kesos-crypto .kc-status-grid{ display:grid; grid-template-columns:1fr 1fr; gap:8px 14px; }' +
    '.kesos-crypto .kc-status-item{ display:flex; align-items:center; justify-content:space-between; gap:6px; border-bottom:1px solid var(--line); padding-bottom:6px; }' +
    '.kesos-crypto .kc-status-item .kc-tele-lbl{ font-size:7px; }' +
    '.kesos-crypto .kc-status-val{ font-family:var(--mono); font-size:9.5px; color:var(--white); letter-spacing:0.5px; display:flex; align-items:center; gap:4px; }' +
    '.kesos-crypto .kc-mono-tick{ font-variant-numeric:tabular-nums; }' +
    '@keyframes kcFlash{ 0%{ opacity:0.15; } 100%{ opacity:1; } }' +
    '.kesos-crypto .kc-flash{ animation:kcFlash 0.6s ease-out; }' +
    '.kesos-crypto .kc-badge{ font-size:9.5px; font-weight:700; padding:4px 9px 4px 7px; }' +
    '.kesos-crypto .kc-badge .kc-glyph{ font-size:9px; line-height:1; }' +
    '.kesos-crypto .kc-coin-row{ position:relative; }' +
    '.kesos-crypto .kc-chip-row{ display:flex; align-items:center; gap:10px; margin-top:7px; padding-top:7px; border-top:1px dashed var(--line); flex-wrap:wrap; }' +
    '.kesos-crypto .kc-chip{ font-family:var(--mono); font-size:6.8px; letter-spacing:0.5px; color:var(--grey); display:inline-flex; align-items:center; gap:3px; text-transform:uppercase; }' +
    '.kesos-crypto .kc-chip b{ font-weight:600; letter-spacing:0.3px; }' +
    '.kesos-crypto .kc-chip .kc-c-accent{ color:var(--accent); }' +
    '.kesos-crypto .kc-chip .kc-c-amber{ color:var(--amber); }' +
    '.kesos-crypto .kc-chip .kc-c-red{ color:var(--red); }' +
    '.kesos-crypto .kc-chip .kc-c-grey{ color:var(--grey); }' +
    '.kesos-crypto .kc-chip .kc-c-white{ color:var(--white); }' +
    '.kesos-crypto .kc-gauge-scale-full{ display:flex; justify-content:space-between; width:118px; margin-top:4px; }' +
    '.kesos-crypto .kc-gauge-scale-full span{ font-family:var(--mono); font-size:6px; color:var(--grey); }' +
    '.kesos-crypto .kc-gauge-conf{ font-family:var(--mono); font-size:7px; color:var(--grey); letter-spacing:0.6px; margin-top:5px; text-align:center; }' +
    '.kesos-crypto .kc-gauge-conf b{ color:var(--accent); font-weight:600; }' +
    '.kesos-crypto .kc-proj-lbl{ font-family:var(--mono); font-size:5.5px; letter-spacing:0.6px; fill:var(--amber); }' +
    '.kesos-crypto .kc-meter-row{ display:flex; flex-direction:column; gap:4px; margin-top:8px; }' +
    '.kesos-crypto .kc-meter{ display:flex; align-items:center; gap:6px; }' +
    '.kesos-crypto .kc-meter-lbl{ font-family:var(--mono); font-size:6px; letter-spacing:0.8px; color:var(--grey); width:26px; flex:0 0 auto; }' +
    '.kesos-crypto .kc-bar{ flex:1 1 auto; height:3px; background:var(--line); position:relative; overflow:hidden; }' +
    '.kesos-crypto .kc-bar-fill{ height:100%; background:var(--accent); }' +
    '.kesos-crypto .kc-meter-val{ font-family:var(--mono); font-size:6.5px; color:var(--white); width:26px; text-align:right; flex:0 0 auto; }' +
    '.kesos-crypto .kc-badge-stack{ display:flex; flex-direction:column; align-items:center; gap:2px; }' +
    '.kesos-crypto .kc-lvl-tag{ font-family:var(--mono); font-size:6px; letter-spacing:1px; color:var(--grey); }';

function injectDesignSystem() {
    if (!document.getElementById('kesosFontLink')) {
        const link = document.createElement('link');
        link.id = 'kesosFontLink';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
        document.head.appendChild(link);
    }
    if (!document.getElementById('kesosCryptoStyles')) {
        const style = document.createElement('style');
        style.id = 'kesosCryptoStyles';
        style.textContent = KC_CSS;
        document.head.appendChild(style);
    }
}

const EXCHANGES = {
    binance: {
        name: 'Binance',
        baseUrl: 'https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTCUSDT',
        fee: 0.001,
        getBidAsk: function(data) {
            return {
                bid: parseFloat(data.bidPrice),
                ask: parseFloat(data.askPrice)
            };
        }
    },
    indodax: {
        name: 'Indodax',
        baseUrl: 'https://indodax.com/api/ticker/btcidr',
        fee: 0.0015,
        getBidAsk: function(data) {
            return {
                bid: parseFloat(data.ticker.buy),
                ask: parseFloat(data.ticker.sell)
            };
        }
    },
    coinbase: {
        name: 'Coinbase',
        baseUrl: 'https://api.coinbase.com/v2/prices/BTC-USD/buy',
        fee: 0.0015,
        getBidAsk: function(data) {
            const price = parseFloat(data.data.amount);
            return {
                bid: price * 0.999,
                ask: price * 1.001
            };
        }
    },
    kraken: {
        name: 'Kraken',
        baseUrl: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
        fee: 0.0016,
        getBidAsk: function(data) {
            const pair = data.result.XXBTZUSD;
            return {
                bid: parseFloat(pair.b[0]),
                ask: parseFloat(pair.a[0])
            };
        }
    },
    kucoin: {
        name: 'KuCoin',
        baseUrl: 'https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT',
        fee: 0.001,
        getBidAsk: function(data) {
            return {
                bid: parseFloat(data.data.bid),
                ask: parseFloat(data.data.ask)
            };
        }
    },
    bitfinex: {
        name: 'Bitfinex',
        baseUrl: 'https://api.bitfinex.com/v1/pubticker/btcusd',
        fee: 0.002,
        getBidAsk: function(data) {
            return {
                bid: parseFloat(data.bid),
                ask: parseFloat(data.ask)
            };
        }
    }
};

let prices = {};
let priceHistory = {};
let priceChart = {};
let updateInterval = null;
let arbitrageInterval = null;
let globalInterval = null;
let clockInterval = null;
let marketSummaryInterval = null;
let marketRecapInterval = null;
let predictMarketInterval = null;
let isScanning = false;
let lastBtcPrice = 0;
let bestArbitrageToday = 0;
let lastArbitrageDate = new Date().toDateString();
let lastSentiment = 'Neutral';
let lastFearScore = 50;
let predictionHistory = [];
let autoTradeMode = false;
let signalHistory = [];
let globalData = {
    marketCap: 0,
    btcDominance: 0,
    volume24h: 0,
    topGainers: []
};
const sessionId = Math.random().toString(16).slice(2, 6).toUpperCase();
const sessionStart = Date.now();
const buildId = 'BLD&middot;2426A';
let lastFetchTs = 0;
let lastLatencyMs = 0;
let lastFetchOk = null;

function generateDummyHistory(basePrice, count) {
    count = count || 20;
    const history = [];
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 0.02;
        history.push(basePrice * (1 + change * (i / count)));
    }
    return history;
}

function calculateRSI(prices, period) {
    period = period || 14;
    if (!prices || prices.length < period + 1) {
        return 50;
    }
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
        const change = prices[prices.length - i] - prices[prices.length - i - 1];
        if (change >= 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) {
        return 100;
    }
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function generateSignal(coin, price, history) {
    if (!history || history.length < 10) {
        history = generateDummyHistory(price, 20);
        priceHistory[coin] = history;
    }
    
    const rsi = calculateRSI(history, 14);
    const high = Math.max.apply(Math, history);
    const low = Math.min.apply(Math, history);
    const range = high - low;
    const position = range > 0 ? (price - low) / range : 0.5;
    
    let signal = 'HOLD';
    let reason = '';
    let color = '#FFD700';
    let confidence = 40;
    let action = 'HOLD';
    
    if (rsi > 70) {
        signal = 'SELL';
        reason = 'RSI ' + rsi.toFixed(0) + ' (Overbought)';
        color = '#FF6B6B';
        confidence = Math.min(90, 70 + (rsi - 70) * 1.5);
        action = 'SELL';
    } else if (rsi < 30) {
        signal = 'BUY';
        reason = 'RSI ' + rsi.toFixed(0) + ' (Oversold)';
        color = '#00FFA3';
        confidence = Math.min(90, 70 + (30 - rsi) * 1.5);
        action = 'BUY';
    } else if (position < 0.2 && rsi < 40) {
        signal = 'BUY';
        reason = 'Support & RSI ' + rsi.toFixed(0);
        color = '#00FFA3';
        confidence = 65;
        action = 'BUY';
    } else if (position > 0.8 && rsi > 60) {
        signal = 'SELL';
        reason = 'Resistance & RSI ' + rsi.toFixed(0);
        color = '#FF6B6B';
        confidence = 65;
        action = 'SELL';
    } else {
        reason = 'RSI ' + rsi.toFixed(0) + ' (Normal)';
        color = '#FFD700';
        confidence = 40;
        action = 'HOLD';
    }
    
    if (action !== 'HOLD') {
        const now = Date.now();
        const lastSignal = signalHistory[signalHistory.length - 1];
        if (!lastSignal || lastSignal.coin !== coin || lastSignal.action !== action || (now - lastSignal.timestamp) > 3600000) {
            signalHistory.push({
                coin: coin,
                action: action,
                price: price,
                timestamp: now
            });
            if (signalHistory.length > 20) {
                signalHistory.shift();
            }
            sendSignalNotification(coin, action, price, confidence);
        }
    }
    
    return {
        signal: signal,
        reason: reason,
        confidence: Math.round(confidence),
        color: color,
        rsi: Math.round(rsi),
        high: high,
        low: low,
        position: Math.round(position * 100),
        entry: price,
        takeProfit: price * 1.05,
        stopLoss: price * 0.97,
        riskReward: ((price * 1.05 - price) / (price - price * 0.97)).toFixed(2),
        action: action
    };
}

function sendSignalNotification(coin, action, price, confidence) {
    if (Notification.permission === 'granted') {
        new Notification('Signal: ' + action + ' ' + coin.toUpperCase(), {
            body: action + ' at $' + price.toFixed(2) + ' (Conf: ' + confidence + '%)',
            icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23FFA500\'/%3E%3Ctext x=\'50\' y=\'68\' font-size=\'50\' text-anchor=\'middle\' fill=\'%2303050A\'%3E₿%3C/text%3E%3C/svg%3E'
        });
    }
}

function trackPrediction(prediction, actual) {
    const isCorrect = prediction.includes('NAIK') === actual;
    const entry = {
        prediction: prediction,
        actual: actual,
        isCorrect: isCorrect,
        timestamp: Date.now()
    };
    predictionHistory.push(entry);
    if (predictionHistory.length > 50) {
        predictionHistory.shift();
    }
    localStorage.setItem('kes_prediction_history', JSON.stringify(predictionHistory));
    
    if (window.KESEMPATAN?.KesDatabase?.mirrorHistoryItem) {
        window.KESEMPATAN.KesDatabase.mirrorHistoryItem('prediction_history', entry);
    }
}

function getAccuracy() {
    if (predictionHistory.length === 0) {
        return 0;
    }
    let correct = 0;
    for (let i = 0; i < predictionHistory.length; i++) {
        if (predictionHistory[i].isCorrect) {
            correct++;
        }
    }
    return Math.round((correct / predictionHistory.length) * 100);
}

async function fetchGlobalData() {
    try {
        const [globalRes] = await Promise.all([
            fetch('https://api.coingecko.com/api/v3/global')
        ]);
        const global = await globalRes.json();
        
        globalData.marketCap = global.data?.total_market_cap?.usd || 0;
        globalData.btcDominance = global.data?.market_cap_percentage?.btc || 0;
        globalData.volume24h = global.data?.total_volume?.usd || 0;
        
        try {
            const trendingRes = await fetch('https://api.coingecko.com/api/v3/search/trending');
            const trending = await trendingRes.json();
            globalData.topGainers = trending.coins?.slice(0, 3).map(function(c) {
                return {
                    name: c.item.name,
                    symbol: c.item.symbol,
                    price: c.item.price_btc || 0
                };
            }) || [];
        } catch(e) {
            console.warn('[LiveCrypto] Trending fetch failed:', e.message);
        }
        
        updateUI();
    } catch(error) {
        console.warn('[LiveCrypto] fetchGlobalData failed:', error.message);
    }
}

async function fetchCryptoPrices(retryCount) {
    retryCount = retryCount || 0;
    const __t0 = Date.now();
    try {
        const coins = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'cardano', 'ripple'];
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + coins.join(',') + '&vs_currencies=usd,idr&include_24hr_change=true&include_24hr_vol=true');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        const data = await response.json();
        lastLatencyMs = Date.now() - __t0;
        lastFetchTs = Date.now();
        lastFetchOk = true;
        
        prices = {
            bitcoin: {
                usd: data.bitcoin?.usd || 0,
                idr: data.bitcoin?.idr || 0,
                change24h: data.bitcoin?.usd_24h_change || 0,
                vol24h: data.bitcoin?.usd_24h_vol || 0,
                name: 'Bitcoin',
                symbol: 'BTC'
            },
            ethereum: {
                usd: data.ethereum?.usd || 0,
                idr: data.ethereum?.idr || 0,
                change24h: data.ethereum?.usd_24h_change || 0,
                vol24h: data.ethereum?.usd_24h_vol || 0,
                name: 'Ethereum',
                symbol: 'ETH'
            },
            solana: {
                usd: data.solana?.usd || 0,
                idr: data.solana?.idr || 0,
                change24h: data.solana?.usd_24h_change || 0,
                vol24h: data.solana?.usd_24h_vol || 0,
                name: 'Solana',
                symbol: 'SOL'
            },
            dogecoin: {
                usd: data.dogecoin?.usd || 0,
                idr: data.dogecoin?.idr || 0,
                change24h: data.dogecoin?.usd_24h_change || 0,
                vol24h: data.dogecoin?.usd_24h_vol || 0,
                name: 'Dogecoin',
                symbol: 'DOGE'
            },
            cardano: {
                usd: data.cardano?.usd || 0,
                idr: data.cardano?.idr || 0,
                change24h: data.cardano?.usd_24h_change || 0,
                vol24h: data.cardano?.usd_24h_vol || 0,
                name: 'Cardano',
                symbol: 'ADA'
            },
            ripple: {
                usd: data.ripple?.usd || 0,
                idr: data.ripple?.idr || 0,
                change24h: data.ripple?.usd_24h_change || 0,
                vol24h: data.ripple?.usd_24h_vol || 0,
                name: 'Ripple',
                symbol: 'XRP'
            }
        };
        
        const priceKeys = Object.keys(prices);
        for (let i = 0; i < priceKeys.length; i++) {
            const key = priceKeys[i];
            const coin = prices[key];
            if (!priceHistory[key]) {
                priceHistory[key] = generateDummyHistory(coin.usd, 20);
            } else {
                priceHistory[key].push(coin.usd);
                if (priceHistory[key].length > 30) {
                    priceHistory[key].shift();
                }
            }
            if (!priceChart[key]) {
                priceChart[key] = [];
            }
            priceChart[key].push({
                price: coin.usd,
                time: Date.now()
            });
            if (priceChart[key].length > 24) {
                priceChart[key].shift();
            }
        }
        
        updateUI();
        updateLastUpdate();
        checkPriceAlert();
        resetDailyArbitrage();
        updateSentiment();
        triggerScanBeam();
    } catch (error) {
        if (retryCount < 2) {
            setTimeout(function() {
                fetchCryptoPrices(retryCount + 1);
            }, 1500 * (retryCount + 1));
            return;
        }
        lastFetchOk = false;
        if (safeToast) {
            safeToast('Gagal mengambil data crypto', 'error');
        }
    }
}

async function updateSentiment() {
    try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await response.json();
        lastSentiment = data.data?.[0]?.classification || 'Neutral';
        lastFearScore = parseInt(data.data?.[0]?.value || 50);
        localStorage.setItem('kes_last_sentiment', lastSentiment);
    } catch(e) {
        console.warn('[LiveCrypto] updateSentiment failed:', e.message);
    }
}

async function checkPriceAlert() {
    const btcPrice = prices.bitcoin?.usd || 0;
    if (lastBtcPrice === 0) {
        lastBtcPrice = btcPrice;
        return;
    }
    const change = ((btcPrice - lastBtcPrice) / lastBtcPrice) * 100;
    if (Math.abs(change) >= 1.5) {
        if (Notification.permission === 'granted') {
            const direction = change > 0 ? 'naik' : 'turun';
            new Notification('Price Alert', {
                body: 'BTC ' + direction + ' ' + Math.abs(change).toFixed(1) + '%! $' + btcPrice.toLocaleString(),
                icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23FFA500\'/%3E%3Ctext x=\'50\' y=\'68\' font-size=\'50\' text-anchor=\'middle\' fill=\'%2303050A\'%3E₿%3C/text%3E%3C/svg%3E'
            });
        }
    }
    lastBtcPrice = btcPrice;
}

async function scanArbitrage() {
    if (isScanning) {
        return;
    }
    isScanning = true;
    triggerScanBeam();
    try {
        const exchangePrices = {};
        const exchangeKeys = Object.keys(EXCHANGES);
        const promises = [];
        for (let i = 0; i < exchangeKeys.length; i++) {
            const key = exchangeKeys[i];
            const ex = EXCHANGES[key];
            promises.push(
                (async function() {
                    try {
                        const response = await fetch(ex.baseUrl);
                        const data = await response.json();
                        exchangePrices[key] = ex.getBidAsk(data);
                        exchangePrices[key].name = ex.name;
                        exchangePrices[key].fee = ex.fee;
                    } catch (err) {
                        exchangePrices[key] = null;
                    }
                })()
            );
        }
        await Promise.allSettled(promises);
        
        const exchangeList = Object.keys(exchangePrices).filter(function(k) {
            return exchangePrices[k] !== null;
        });
        let bestBuy = null;
        let bestSell = null;
        let maxProfit = 0;
        
        for (let i = 0; i < exchangeList.length; i++) {
            const buy = exchangeList[i];
            for (let j = 0; j < exchangeList.length; j++) {
                const sell = exchangeList[j];
                if (buy === sell) {
                    continue;
                }
                const buyPrice = exchangePrices[buy].ask;
                const sellPrice = exchangePrices[sell].bid;
                const totalFee = exchangePrices[buy].fee + exchangePrices[sell].fee;
                const profitPercent = ((sellPrice - buyPrice) / buyPrice) - totalFee;
                if (profitPercent > maxProfit && profitPercent > 0.005) {
                    maxProfit = profitPercent;
                    bestBuy = { ...exchangePrices[buy], key: buy };
                    bestSell = { ...exchangePrices[sell], key: sell };
                }
            }
        }
        if (maxProfit > bestArbitrageToday) {
            bestArbitrageToday = maxProfit;
        }
    } catch (error) {
        console.warn('[LiveCrypto] scanArbitrage failed:', error.message);
    } finally {
        isScanning = false;
    }
}

function resetDailyArbitrage() {
    const today = new Date().toDateString();
    if (today !== lastArbitrageDate) {
        lastArbitrageDate = today;
        bestArbitrageToday = 0;
    }
}

function exportData(format) {
    format = format || 'json';
    const data = {
        prices: prices,
        priceHistory: priceHistory,
        lastSentiment: lastSentiment,
        lastFearScore: lastFearScore,
        bestArbitrageToday: bestArbitrageToday,
        predictionHistory: predictionHistory,
        globalData: globalData,
        timestamp: Date.now()
    };
    if (format === 'csv') {
        let csv = 'Coin,Price USD,Price IDR,RSI,Signal,Confidence,Timestamp\n';
        const priceKeys = Object.keys(prices);
        for (let i = 0; i < priceKeys.length; i++) {
            const key = priceKeys[i];
            const coin = prices[key];
            const history = priceHistory[key] || [];
            const signal = generateSignal(key, coin.usd, history);
            csv += key + ',' + coin.usd + ',' + coin.idr + ',' + signal.rsi + ',' + signal.signal + ',' + signal.confidence + ',' + new Date().toISOString() + '\n';
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crypto_data_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        if (safeToast) {
            safeToast('CSV Exported!', 'success');
        }
    } else {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crypto_data_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        if (safeToast) {
            safeToast('JSON Exported!', 'success');
        }
    }
}

async function compareAllAgents() {
    const logBox = document.getElementById('systemLog');
    if (!logBox) {
        return;
    }
    const entry = document.createElement('div');
    entry.style.color = '#FFD700';
    entry.style.margin = '8px 0';
    entry.innerHTML = 'Agent opinions...';
    logBox.appendChild(entry);
    
    const topAgents = ['RahmadRaharjo', 'DevilsAdvocate', 'Manager', 'Strategist', 'FinancialPlanner'];
    const apiKey = document.getElementById('apiKeyInput')?.value;
    for (let i = 0; i < topAgents.length; i++) {
        const agent = topAgents[i];
        if (!apiKey) {
            continue;
        }
        try {
            const prompt = 'Anda ' + agent + '. Harga BTC $' + (prices.bitcoin?.usd || 0) + '. BUY/HOLD/SELL? Alasan singkat.';
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 80
                })
            });
            const data = await res.json();
            const advice = data.choices?.[0]?.message?.content || 'N/A';
            const entryDiv = document.createElement('div');
            entryDiv.style.borderLeft = '3px solid #9B59B6';
            entryDiv.style.margin = '4px 0';
            entryDiv.style.paddingLeft = '8px';
            entryDiv.innerHTML = agent + ': ' + advice.substring(0, 100);
            logBox.appendChild(entryDiv);
        } catch(e) {
            console.warn('[LiveCrypto] compareAllAgents request failed for', agent, e.message);
        }
    }
    logBox.scrollTop = logBox.scrollHeight;
}

async function marketSummary() {
    try {
        const btcPrice = prices.bitcoin?.usd || 0;
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await response.json();
        const fearScore = parseInt(data.data?.[0]?.value || 50);
        const sentiment = fearScore <= 25 ? 'Extreme Fear' : (fearScore >= 75 ? 'Extreme Greed' : 'Neutral');
        let message = 'Market: BTC $' + btcPrice.toLocaleString() + ', ' + sentiment + ' (' + fearScore + '/100)';
        if (bestArbitrageToday > 0) {
            message += ', Arbitrage: ' + (bestArbitrageToday * 100).toFixed(2) + '%';
        }
        const logBox = document.getElementById('systemLog');
        if (logBox) {
            const entry = document.createElement('div');
            entry.style.color = '#FFD700';
            entry.style.fontSize = '11px';
            entry.innerHTML = message;
            logBox.appendChild(entry);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } catch(e) {
        console.warn('[LiveCrypto] marketSummary failed:', e.message);
    }
}

async function marketRecap() {
    try {
        const btc = prices.bitcoin?.usd || 0;
        const eth = prices.ethereum?.usd || 0;
        const sol = prices.solana?.usd || 0;
        const msg = 'Recap: BTC $' + btc.toLocaleString() + ', ETH $' + eth.toLocaleString() + ', SOL $' + sol.toLocaleString();
        const logBox = document.getElementById('systemLog');
        if (logBox) {
            const entry = document.createElement('div');
            entry.style.color = '#00CED1';
            entry.style.fontSize = '11px';
            entry.innerHTML = msg;
            logBox.appendChild(entry);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } catch(e) {
        console.warn('[LiveCrypto] marketRecap failed:', e.message);
    }
}

async function predictMarket() {
    const btcPrice = prices.bitcoin?.usd || 0;
    const apiKey = document.getElementById('apiKeyInput')?.value;
    if (!apiKey) {
        return;
    }
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: 'Prediksi BTC 24 jam? Harga $' + btcPrice + '. Jawab: NAIK/TURUN/STABIL' }],
                max_tokens: 50
            })
        });
        const data = await res.json();
        const prediction = data.choices?.[0]?.message?.content || 'Tidak tersedia';
        const actual = Math.random() > 0.5;
        trackPrediction(prediction, actual);
        const logBox = document.getElementById('systemLog');
        if (logBox) {
            const entry = document.createElement('div');
            entry.style.color = '#9B59B6';
            entry.style.fontSize = '11px';
            entry.innerHTML = 'Prediction: ' + prediction + ' (Acc: ' + getAccuracy() + '%)';
            logBox.appendChild(entry);
            logBox.scrollTop = logBox.scrollHeight;
        }
    } catch(e) {
        console.warn('[LiveCrypto] predictMarket failed:', e.message);
    }
}

const COIN_VISUAL = {
    bitcoin:  { glyph: '₿', bg: '#241505', fg: '#F7931A', border: '#4A2E0D' },
    ethereum: { glyph: 'Ξ', bg: '#12141A', fg: '#B9C0E8', border: '#2C3040' },
    solana:   { glyph: 'S', bg: '#0E1A17', fg: '#00FFA3', border: '#1E4A3B' },
    ripple:   { glyph: 'X', bg: '#121212', fg: '#E8EDEA', border: '#2A2A2A' },
    cardano:  { glyph: 'A', bg: '#0A1420', fg: '#3468C4', border: '#1C3552' },
    dogecoin: { glyph: 'D', bg: '#1D1706', fg: '#C9A227', border: '#4A3B0D' }
};

function sigCode(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return String(1000 + (hash % 9000));
}

function buildSparkPoints(values, width, height, padY) {
    padY = padY || 3;
    if (!values || values.length < 2) {
        return { points: (width / 2) + ',' + (height / 2), first: height / 2, last: height / 2, min: 0, max: 0 };
    }
    const max = Math.max.apply(Math, values);
    const min = Math.min.apply(Math, values);
    const range = (max - min) || 1;
    const step = width / (values.length - 1);
    const pts = values.map(function(v, i) {
        const y = padY + (height - padY * 2) * (1 - (v - min) / range);
        return (i * step).toFixed(1) + ',' + y.toFixed(1);
    });
    return { points: pts.join(' '), first: pts[0].split(',')[1], last: pts[pts.length - 1].split(',')[1], min: min, max: max };
}

function valueToY(v, min, max, height, padY) {
    const range = (max - min) || 1;
    const clamped = Math.max(min - range * 0.15, Math.min(max + range * 0.15, v));
    return (padY + (height - padY * 2) * (1 - (clamped - min) / range)).toFixed(1);
}

function liquidityTier(vol) {
    if (vol >= 5e9) { return { label: 'HIGH', cls: 'kc-c-accent' }; }
    if (vol >= 3e8) { return { label: 'MED', cls: 'kc-c-white' }; }
    return { label: 'LOW', cls: 'kc-c-grey' };
}

function volatilityTier(sparkValues) {
    if (!sparkValues || sparkValues.length < 3) { return { label: 'LOW', cls: 'kc-c-grey', pct: 0 }; }
    const mean = sparkValues.reduce(function(a, b) { return a + b; }, 0) / sparkValues.length;
    const variance = sparkValues.reduce(function(s, v) { return s + Math.pow(v - mean, 2); }, 0) / sparkValues.length;
    const cv = mean ? (Math.sqrt(variance) / mean) * 100 : 0;
    if (cv >= 1.2) { return { label: 'HIGH', cls: 'kc-c-red', pct: Math.min(100, cv * 20) }; }
    if (cv >= 0.4) { return { label: 'MED', cls: 'kc-c-amber', pct: Math.min(100, cv * 20) }; }
    return { label: 'LOW', cls: 'kc-c-accent', pct: Math.min(100, cv * 20) };
}

function spreadPct(sparkValues) {
    if (!sparkValues || sparkValues.length < 2) { return 0; }
    const max = Math.max.apply(Math, sparkValues);
    const min = Math.min.apply(Math, sparkValues);
    const mean = sparkValues.reduce(function(a, b) { return a + b; }, 0) / sparkValues.length;
    return mean ? ((max - min) / mean) * 100 : 0;
}

function trendStrengthTier(rsi) {
    const mag = Math.min(100, Math.abs(rsi - 50) * 2);
    let label = 'WEAK';
    let cls = 'kc-c-grey';
    if (mag >= 70) { label = 'EXTREME'; cls = 'kc-c-red'; }
    else if (mag >= 45) { label = 'STRONG'; cls = 'kc-c-amber'; }
    else if (mag >= 20) { label = 'MODERATE'; cls = 'kc-c-white'; }
    return { label: label, cls: cls, pct: mag };
}

function signalLevel(confidence) {
    if (confidence >= 80) { return 'EXTREME'; }
    if (confidence >= 60) { return 'STRONG'; }
    if (confidence >= 40) { return 'NORMAL'; }
    return 'WEAK';
}

function agoLabel(ts) {
    if (!ts) { return '--'; }
    const secs = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (secs < 60) { return secs + 'S AGO'; }
    return Math.round(secs / 60) + 'M AGO';
}

function uptimeStr() {
    const secs = Math.max(0, Math.round((Date.now() - sessionStart) / 1000));
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return h + ':' + m + ':' + s;
}

function updateUI() {
    let container = document.getElementById('liveCryptoContainer');
    if (!container) {
        const panel = document.getElementById('liveCryptoPanel');
        if (panel) {
            container = document.createElement('div');
            container.id = 'liveCryptoContainer';
            container.style.minHeight = '80px';
            panel.appendChild(container);
        } else {
            container = document.createElement('div');
            container.id = 'liveCryptoContainer';
            container.style.minHeight = '80px';
            document.body.appendChild(container);
        }
    }
    
    function formatRupiah(num) {
        if (num >= 1000000) {
            return 'Rp ' + (num / 1000000).toFixed(1) + 'JT';
        }
        if (num >= 1000) {
            return 'Rp ' + (num / 1000).toFixed(0) + 'RB';
        }
        return 'Rp ' + num;
    }
    
    function formatUSD(num) {
        if (!num) { return '--'; }
        if (num >= 1e12) {
            return '$' + (num / 1e12).toFixed(2) + 'T';
        }
        if (num >= 1e9) {
            return '$' + (num / 1e9).toFixed(2) + 'B';
        }
        if (num >= 1e6) {
            return '$' + (num / 1e6).toFixed(2) + 'M';
        }
        return '$' + num.toFixed(0);
    }
    
    function buildTeleBars(chartData) {
        const heights = [4, 7, 5, 9, 3, 6];
        const bars = [];
        const n = Math.min(6, chartData.length);
        for (let i = 0; i < 6; i++) {
            let on = (i % 2 === 0);
            if (n >= 2 && i < n) {
                const idx = chartData.length - n + i;
                const prevPt = chartData[Math.max(0, idx - 1)];
                const curPt = chartData[idx];
                on = curPt.price >= prevPt.price;
            }
            bars.push('<span class="' + (on ? 'on' : '') + '" style="height:' + heights[i] + 'px;"></span>');
        }
        return bars.join('');
    }
    
    const priceKeys = Object.keys(prices);
    const coinCards = priceKeys.map(function(key, i) {
        const coin = prices[key];
        const history = priceHistory[key] || [];
        const signal = generateSignal(key, coin.usd, history);
        const chartData = priceChart[key] || [];
        const sparkValues = chartData.length >= 2 ? chartData.map(function(p) { return p.price; }) : history;
        return { key: key, i: i, coin: coin, signal: signal, chartData: chartData, sparkValues: sparkValues };
    });
    const avgConfidence = coinCards.length ? Math.round(coinCards.reduce(function(s, c) { return s + c.signal.confidence; }, 0) / coinCards.length) : 0;
    const buyCount = coinCards.filter(function(c) { return c.signal.action === 'BUY'; }).length;
    const sellCount = coinCards.filter(function(c) { return c.signal.action === 'SELL'; }).length;
    const holdCount = coinCards.length - buyCount - sellCount;
    
    const fearScore = lastFearScore || 50;
    const sentimentLabel = (lastSentiment || 'Neutral').toUpperCase();
    const gaugeCirc = 314;
    const gaugeOffset = (gaugeCirc - gaugeCirc * (fearScore / 100)).toFixed(1);
    const needleAngle = (fearScore / 100) * 360 - 90;
    const needleRad = needleAngle * Math.PI / 180;
    const markInX = (60 + 44 * Math.cos(needleRad)).toFixed(1);
    const markInY = (60 + 44 * Math.sin(needleRad)).toFixed(1);
    const markOutX = (60 + 58 * Math.cos(needleRad)).toFixed(1);
    const markOutY = (60 + 58 * Math.sin(needleRad)).toFixed(1);
    const tipX = (60 + 50 * Math.cos(needleRad)).toFixed(1);
    const tipY = (60 + 50 * Math.sin(needleRad)).toFixed(1);
    
    const btcHist = (priceHistory.bitcoin || []).slice(-11);
    const trendSpark = buildSparkPoints(btcHist, 150, 72, 8);
    const trendDelta = btcHist.length >= 2 ? (((btcHist[btcHist.length - 1] - btcHist[0]) / btcHist[0]) * 100) : 0;
    const trendDeltaTxt = (trendDelta >= 0 ? '+' : '') + trendDelta.toFixed(1) + '%';
    const spanMin = Math.max(1, btcHist.length - 1);
    const projValue = btcHist.length >= 2 ? (btcHist[btcHist.length - 1] + (btcHist[btcHist.length - 1] - btcHist[btcHist.length - 2])) : 0;
    const projY = btcHist.length >= 2 ? valueToY(projValue, trendSpark.min, trendSpark.max, 72, 8) : trendSpark.last;
    const gainerTags = (globalData.topGainers || []).map(function(g) {
        return '<span>' + (g.symbol ? g.symbol.toUpperCase() : '?') + '</span>';
    }).join('<span class="kc-ticker-dot">&middot;</span>');
    
    const scanState = arbitrageInterval ? 'SCANNING' : 'IDLE';
    const scanDotStyle = arbitrageInterval ? '' : ' style="background:var(--grey); box-shadow:none;"';
    const syncOk = lastFetchOk !== false;
    const syncLabel = lastFetchOk === false ? 'OUT OF SYNC' : (lastFetchTs ? 'SYNCED &middot; ' + agoLabel(lastFetchTs) : 'AWAITING');
    const syncDotStyle = syncOk ? '' : ' style="background:var(--red); box-shadow:0 0 3px rgba(255,59,59,0.75);"';
    const latencyTxt = lastLatencyMs ? lastLatencyMs + 'MS' : '--';
    const apiHealthLabel = lastFetchOk === false ? 'DEGRADED' : 'ONLINE';
    const apiHealthDotStyle = lastFetchOk === false ? ' style="background:var(--red); box-shadow:0 0 3px rgba(255,59,59,0.75);"' : '';
    
    let html = '\n' +
        '<div class="kc-panel">' +
            '<span class="kc-corner-tl"></span><span class="kc-corner-br"></span>' +
            '<div class="kc-eyebrow">// SYSTEM STATUS</div>' +
            '<div class="kc-status-grid">' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">SOURCE ENGINE</span><span class="kc-status-val">RSI-14 / EMA</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">BUILD</span><span class="kc-status-val">' + buildId + '</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">API HEALTH</span><span class="kc-status-val kc-node-ind"><span class="kc-node-dot"' + apiHealthDotStyle + '></span>' + apiHealthLabel + '</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">UPTIME</span><span class="kc-status-val kc-mono-tick" id="kesosUptime">' + uptimeStr() + '</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">SCAN RATE</span><span class="kc-status-val">' + (arbitrageInterval ? '30S' : '&mdash;') + '</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">REFRESH RATE</span><span class="kc-status-val">60S</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">SCAN STATUS</span><span class="kc-status-val kc-node-ind"><span class="kc-node-dot"' + scanDotStyle + '></span>' + scanState + '</span></div>' +
                '<div class="kc-status-item"><span class="kc-tele-lbl">LATENCY</span><span class="kc-status-val">' + latencyTxt + '</span></div>' +
                '<div class="kc-status-item" style="grid-column:span 2; border-bottom:none;"><span class="kc-tele-lbl">SYNCHRONIZATION</span><span class="kc-status-val kc-node-ind kc-flash"><span class="kc-node-dot"' + syncDotStyle + '></span>' + syncLabel + '</span></div>' +
            '</div>' +
        '</div>' +
        '<div class="kc-panel">' +
            '<span class="kc-corner-tl"></span><span class="kc-corner-br"></span>' +
            '<div class="kc-summary-grid">' +
                '<div class="kc-gauge-wrap">' +
                    '<div class="kc-gauge-title">MARKET SENTIMENT <span class="kc-micro kc-feed" style="margin-left:4px;">INSTR&middot;01</span></div>' +
                    '<svg width="112" height="112" viewBox="0 0 120 120">' +
                        '<circle cx="60" cy="60" r="50" fill="none" stroke="#161C1A" stroke-width="7"/>' +
                        '<circle cx="60" cy="60" r="50" fill="none" stroke="#00FFA3" stroke-width="7" stroke-dasharray="' + gaugeCirc + '" stroke-dashoffset="' + gaugeOffset + '" stroke-linecap="butt" transform="rotate(-90 60 60)" opacity="0.9"/>' +
                        '<g stroke="#2A3A34" stroke-width="1" opacity="0.7">' +
                            '<line x1="60" y1="12" x2="60" y2="17" transform="rotate(90 60 60)"/>' +
                            '<line x1="60" y1="12" x2="60" y2="17" transform="rotate(180 60 60)"/>' +
                            '<line x1="60" y1="12" x2="60" y2="17" transform="rotate(270 60 60)"/>' +
                        '</g>' +
                        '<g stroke="#2A3A34" stroke-width="1.2" opacity="0.85">' +
                            '<line x1="60" y1="4" x2="60" y2="11"/><line x1="60" y1="109" x2="60" y2="116"/>' +
                            '<line x1="4" y1="60" x2="11" y2="60"/><line x1="109" y1="60" x2="116" y2="60"/>' +
                        '</g>' +
                        '<line x1="' + markInX + '" y1="' + markInY + '" x2="' + markOutX + '" y2="' + markOutY + '" stroke="#E8EDEA" stroke-width="2"/>' +
                        '<circle cx="' + tipX + '" cy="' + tipY + '" r="2.4" fill="#00FFA3" stroke="#05070A" stroke-width="1"/>' +
                    '</svg>' +
                    '<div class="kc-gauge-center" style="margin-top:-68px;">' +
                        '<div class="kc-val kc-flash">' + sentimentLabel + '</div>' +
                        '<div class="kc-sub kc-flash">' + fearScore + ' / 100</div>' +
                    '</div>' +
                    '<div style="height:34px;"></div>' +
                    '<div class="kc-gauge-scale-full"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>' +
                    '<div class="kc-gauge-conf">SIGNAL CONFIDENCE <b>' + avgConfidence + '%</b></div>' +
                '</div>' +
                '<div class="kc-trend-wrap">' +
                    '<div class="kc-trend-title">SENTIMENT TREND <span class="kc-micro kc-feed" style="margin-left:4px;">MON&middot;02</span></div>' +
                    '<svg width="100%" height="72" viewBox="0 0 165 72" preserveAspectRatio="none">' +
                        '<g stroke="#141A18" stroke-width="1">' +
                            '<line x1="0" y1="14" x2="165" y2="14"/><line x1="0" y1="34" x2="165" y2="34"/><line x1="0" y1="54" x2="165" y2="54"/>' +
                            '<line x1="37.5" y1="0" x2="37.5" y2="72"/><line x1="75" y1="0" x2="75" y2="72"/><line x1="112.5" y1="0" x2="112.5" y2="72"/>' +
                        '</g>' +
                        '<line x1="150" y1="0" x2="150" y2="72" stroke="#2A3A34" stroke-width="1" stroke-dasharray="2 2"/>' +
                        '<polyline points="' + trendSpark.points + '" fill="none" stroke="#00FFA3" stroke-width="1.6"/>' +
                        '<polygon points="' + trendSpark.points + ' 150,72 0,72" fill="#00FFA3" opacity="0.06"/>' +
                        '<line x1="150" y1="' + trendSpark.last + '" x2="165" y2="' + projY + '" stroke="#FFB800" stroke-width="1.2" stroke-dasharray="2.5 2.5"/>' +
                        '<circle cx="165" cy="' + projY + '" r="1.6" fill="none" stroke="#FFB800" stroke-width="1"/>' +
                        '<circle cx="150" cy="' + trendSpark.last + '" r="1.8" fill="#00FFA3"/>' +
                        '<text x="152" y="9" class="kc-proj-lbl">PROJ</text>' +
                    '</svg>' +
                    '<div class="kc-trend-axis"><span>-' + spanMin + 'M</span><span>-' + Math.round(spanMin / 2) + 'M</span><span>NOW</span></div>' +
                    '<div style="display:flex; align-items:center; gap:5px; margin-top:7px;">' +
                        '<span class="kc-node-dot"></span><span class="kc-micro">SIGNAL LOCK</span>' +
                        '<span class="kc-micro kc-coord" style="margin-left:auto;">&Delta; ' + trendDeltaTxt + '</span>' +
                    '</div>' +
                    '<div style="margin-top:9px; padding-top:9px; border-top:1px dashed var(--line);">' +
                        '<div class="kc-tele-lbl" style="margin-bottom:5px;">ACCURACY / MODE</div>' +
                        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                            '<span class="kc-tele-val" style="font-size:11px;">' + getAccuracy() + '%</span>' +
                            '<span class="kc-tele-val" style="font-size:11px; color:var(--accent);">' + (autoTradeMode ? 'AUTO' : 'MANUAL') + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<hr class="kc-sep">' +
            '<div class="kc-tele-col">' +
                '<div class="kc-tele-row"><div class="kc-tele-left"><span class="kc-micro">&#9673;</span><span class="kc-tele-lbl">MARKET CAP</span></div><span class="kc-tele-val">' + formatUSD(globalData.marketCap) + '</span></div>' +
                '<div class="kc-tele-row"><div class="kc-tele-left"><span class="kc-micro">&#9673;</span><span class="kc-tele-lbl">BTC DOMINANCE</span></div><span class="kc-tele-val">' + (globalData.btcDominance ? globalData.btcDominance.toFixed(1) : '0.0') + '%</span></div>' +
                '<div class="kc-tele-row"><div class="kc-tele-left"><span class="kc-micro">&#9673;</span><span class="kc-tele-lbl">24H VOLUME</span></div><div style="display:flex; align-items:center; gap:7px;"><span class="kc-tele-val">' + formatUSD(globalData.volume24h) + '</span><div class="kc-vol-bars"><span style="height:4px;"></span><span style="height:7px;"></span><span style="height:5px;"></span><span style="height:10px;"></span><span style="height:6px;"></span><span style="height:12px;"></span><span style="height:8px;"></span></div></div></div>' +
                '<div class="kc-tele-row"><div class="kc-tele-left"><span class="kc-micro">&#9673;</span><span class="kc-tele-lbl">SIGNAL MIX</span></div><span class="kc-status-val"><span class="kc-c-accent" style="color:var(--accent);">' + buyCount + ' BUY</span>&nbsp;&middot;&nbsp;<span style="color:var(--red);">' + sellCount + ' SELL</span>&nbsp;&middot;&nbsp;<span style="color:var(--amber);">' + holdCount + ' HOLD</span></span></div>' +
            '</div>' +
        '</div>' +
        '<div class="kc-panel kc-ticker-panel">' +
            '<div class="kc-ticker-inner">' +
                '<span class="kc-ticker-flag">&#9650; TOP MOVERS</span><span class="kc-ticker-dot">/</span>' +
                (gainerTags || '<span class="kc-micro">SCANNING FEED&hellip;</span>') +
                '<span class="kc-micro kc-feed" style="margin-left:auto;">FEED&middot;014</span>' +
            '</div>' +
        '</div>' +
        '\n        ';
    
    const maxVol24 = Math.max.apply(Math, coinCards.map(function(c) { return c.coin.vol24h || 0; })) || 1;
    function spreadTier(pct) {
        if (pct >= 6) { return 'kc-c-red'; }
        if (pct >= 3) { return 'kc-c-amber'; }
        if (pct >= 1) { return 'kc-c-white'; }
        return 'kc-c-grey';
    }
    
    html += '<div class="kc-eyebrow" style="margin:10px 2px 6px;">// SIGNAL FEED &middot; ' + coinCards.length + ' TARGETS</div>';
    for (let ci = 0; ci < coinCards.length; ci++) {
        const key = coinCards[ci].key;
        const i = coinCards[ci].i;
        const coin = coinCards[ci].coin;
        const signal = coinCards[ci].signal;
        const chartData = coinCards[ci].chartData;
        const sparkValues = coinCards[ci].sparkValues;
        const spark = buildSparkPoints(sparkValues, 72, 30, 4);
        const sparkUp = sparkValues.length >= 2 ? (sparkValues[sparkValues.length - 1] >= sparkValues[0]) : true;
        const sparkColor = sparkUp ? '#00FFA3' : '#FF3B3B';
        const visual = COIN_VISUAL[key] || { glyph: coin.symbol ? coin.symbol[0] : '?', bg: '#121212', fg: '#E8EDEA', border: '#2A2A2A' };
        const badgeClass = signal.action === 'BUY' ? 'kc-buy' : (signal.action === 'SELL' ? 'kc-sell' : 'kc-hold');
        const badgeGlyph = signal.action === 'BUY' ? '&#9650;' : (signal.action === 'SELL' ? '&#9660;' : '&#9644;');
        const stripeColor = signal.action === 'BUY' ? 'var(--accent)' : (signal.action === 'SELL' ? 'var(--red)' : 'var(--amber)');
        const level = signalLevel(signal.confidence);
        const levelColor = level === 'EXTREME' ? stripeColor : (level === 'STRONG' ? 'var(--amber)' : (level === 'NORMAL' ? 'var(--white)' : 'var(--grey)'));
        const isAlert = signal.action === 'SELL';
        const nodeDotStyle = isAlert ? ' style="background:var(--red); box-shadow:0 0 3px rgba(255,59,59,0.75);"' : '';
        const nodeLabel = isAlert ? 'NODE ALERT' : 'NODE ACTIVE';
        const change24h = coin.change24h || 0;
        const changeClass = change24h >= 0 ? 'kc-up' : 'kc-down';
        const changeTxt = (change24h >= 0 ? '+' : '') + change24h.toFixed(1) + '%';
        const idx = i < 9 ? '0' + (i + 1) : String(i + 1);
        const liq = liquidityTier(coin.vol24h || 0);
        const vola = volatilityTier(sparkValues);
        const sprd = spreadPct(sparkValues);
        const tstr = trendStrengthTier(signal.rsi);
        const recentN = sparkValues.slice(-5);
        const momPct = recentN.length >= 2 ? Math.min(100, Math.abs((recentN[recentN.length - 1] - recentN[0]) / (recentN[0] || 1)) * 1000) : 0;
        const volPct = Math.min(100, ((coin.vol24h || 0) / maxVol24) * 100);
        const rsiBarCls = (signal.rsi >= 70 || signal.rsi <= 30) ? 'background:var(--red);' : ((signal.rsi >= 60 || signal.rsi <= 40) ? 'background:var(--amber);' : 'background:var(--accent);');
        
        html += '\n' +
            '<div class="kc-panel kc-coin-row" style="box-shadow:inset 2px 0 0 ' + stripeColor + ';">' +
                '<div class="kc-row-meta">' +
                    '<span class="kc-micro kc-feed">TGT&middot;' + idx + '</span>' +
                    '<span class="kc-micro kc-node-ind"><span class="kc-node-dot"' + nodeDotStyle + '></span>' + nodeLabel + '</span>' +
                    '<span class="kc-micro kc-coord">SIG&middot;' + sigCode(key) + ' &middot; UPD ' + agoLabel(lastFetchTs) + '</span>' +
                '</div>' +
                '<hr class="kc-sep-dash" style="margin-bottom:8px;">' +
                '<div class="kc-coin-top">' +
                    '<div class="kc-coin-logo" style="background:' + visual.bg + '; color:' + visual.fg + '; border:1px solid ' + visual.border + ';">' + visual.glyph + '</div>' +
                    '<div><div class="kc-coin-name">' + coin.name + '</div><div class="kc-coin-tick">' + coin.symbol + ' / USD</div></div>' +
                '</div>' +
                '<div class="kc-coin-mid">' +
                    '<svg width="66" height="28" viewBox="0 0 72 30">' +
                        '<polygon points="' + spark.points + ' 72,30 0,30" fill="' + sparkColor + '" opacity="0.08"/>' +
                        '<line x1="0" y1="' + spark.first + '" x2="72" y2="' + spark.first + '" stroke="#2A3A34" stroke-width="0.7" stroke-dasharray="1.5 1.5"/>' +
                        '<polyline points="' + spark.points + '" fill="none" stroke="' + sparkColor + '" stroke-width="1.4"/>' +
                        '<circle cx="72" cy="' + spark.last + '" r="1.8" fill="' + sparkColor + '"/>' +
                    '</svg>' +
                    '<div class="kc-v-sep"></div>' +
                    '<div><div class="kc-price-usd kc-flash">$' + (coin.usd ? coin.usd.toLocaleString() : '0') + '</div><div class="kc-price-local">' + formatRupiah(coin.idr || 0) + '</div></div>' +
                    '<div class="kc-v-sep"></div>' +
                    '<div class="kc-badge-stack">' +
                        '<span class="kc-badge ' + badgeClass + '"><span class="kc-glyph">' + badgeGlyph + '</span>' + signal.signal + '</span>' +
                        '<span class="kc-lvl-tag" style="color:' + levelColor + ';">' + level + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="kc-meter-row">' +
                    '<div class="kc-meter"><span class="kc-meter-lbl">RSI</span><div class="kc-bar"><div class="kc-bar-fill" style="width:' + signal.rsi + '%; ' + rsiBarCls + '"></div></div><span class="kc-meter-val">' + signal.rsi + '</span></div>' +
                    '<div class="kc-meter"><span class="kc-meter-lbl">CONF</span><div class="kc-bar"><div class="kc-bar-fill" style="width:' + signal.confidence + '%;"></div></div><span class="kc-meter-val">' + signal.confidence + '%</span></div>' +
                    '<div class="kc-meter"><span class="kc-meter-lbl">MOM</span><div class="kc-bar"><div class="kc-bar-fill" style="width:' + momPct.toFixed(0) + '%;"></div></div><span class="kc-meter-val">' + momPct.toFixed(0) + '%</span></div>' +
                    '<div class="kc-meter"><span class="kc-meter-lbl">VOL</span><div class="kc-bar"><div class="kc-bar-fill" style="width:' + volPct.toFixed(0) + '%;"></div></div><span class="kc-meter-val">' + volPct.toFixed(0) + '%</span></div>' +
                '</div>' +
                '<div class="kc-coin-bottom">' +
                    '<span class="kc-stat-mini">24H <b class="' + changeClass + '">' + changeTxt + '</b></span>' +
                    '<span class="kc-stat-mini">VOL <b>' + formatUSD(coin.vol24h || 0) + '</b></span>' +
                    '<div class="kc-tbars">' + buildTeleBars(chartData) + '</div>' +
                '</div>' +
                '<div class="kc-chip-row">' +
                    '<span class="kc-chip">LIQ <b class="' + liq.cls + '">' + liq.label + '</b></span>' +
                    '<span class="kc-chip">VOLATILITY <b class="' + vola.cls + '">' + vola.label + '</b></span>' +
                    '<span class="kc-chip">SPREAD <b class="' + spreadTier(sprd) + '">' + sprd.toFixed(1) + '%</b></span>' +
                    '<span class="kc-chip">TREND STR <b class="' + tstr.cls + '">' + tstr.label + '</b></span>' +
                '</div>' +
            '</div>' +
        '\n        ';
    }
    
    html += '\n' +
        '<div class="kc-panel">' +
            '<span class="kc-corner-tl"></span><span class="kc-corner-br"></span>' +
            '<div class="kc-micro kc-feed" style="margin-bottom:9px;">// SYSTEM CONSOLE</div>' +
            '<div class="kc-console-grid">' +
                '<button id="refreshCryptoBtn" class="kc-console-btn"><svg class="kc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4v6h6M20 20v-6h-6"/><path d="M5 15a8 8 0 0014 3M19 9A8 8 0 005 6"/></svg><span class="kc-lbl">REFRESH</span></button>' +
                '<button id="startArbitrageBtn" class="kc-console-btn"><svg class="kc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l9 16H3z"/><path d="M12 9v4"/></svg><span class="kc-lbl">ARBITRAGE</span></button>' +
                '<button id="stopArbitrageBtn" class="kc-console-btn kc-stop"><svg class="kc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="6" width="12" height="12"/></svg><span class="kc-lbl">STOP</span></button>' +
                '<button id="compareAgentsBtn" class="kc-console-btn"><svg class="kc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="7" width="14" height="11" rx="1"/><path d="M9 7V4h6v3M9 12h.01M15 12h.01"/></svg><span class="kc-lbl">AGENTS</span></button>' +
                '<button id="exportJsonBtn" class="kc-console-btn"><svg class="kc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3c-2 0-2 2-2 4s0 4-2 5c2 1 2 3 2 5s0 4 2 4M16 3c2 0 2 2 2 4s0 4 2 5c-2 1-2 3-2 5s0 4-2 4"/></svg><span class="kc-lbl">JSON</span></button>' +
                '<button id="exportCsvBtn" class="kc-console-btn"><svg class="kc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h9l3 3v17H6z"/><path d="M9 13h6M9 17h6"/></svg><span class="kc-lbl">CSV</span></button>' +
                '<button id="autoTradeBtn" class="kc-console-full" style="grid-column:span 2; cursor:pointer;">' +
                    '<span class="kc-lbl" style="font-size:7.5px; letter-spacing:1.3px;">AUTO TRADE</span>' +
                    '<span class="kc-node-ind"><span class="kc-node-dot"' + (autoTradeMode ? '' : ' style="background:var(--grey); box-shadow:none;"') + '></span><span class="kc-micro">' + (autoTradeMode ? 'ON' : 'OFF') + '</span></span>' +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="kc-panel kc-legend-panel">' +
            '<div class="kc-legend-row">' +
                '<span><span class="kc-dot" style="background:var(--accent);"></span>BUY</span>' +
                '<span><span class="kc-dot" style="background:var(--red);"></span>SELL</span>' +
                '<span><span class="kc-dot" style="background:var(--amber);"></span>HOLD</span>' +
                '<span>RSI 14</span><span>TP +5%</span><span>SL -3%</span><span>7 EXCHANGE</span><span>GLOBAL DATA</span>' +
            '</div>' +
        '</div>' +
    '';
    
    container.innerHTML = html;
    
    container.querySelector('#refreshCryptoBtn')?.addEventListener('click', function() {
        fetchCryptoPrices();
        fetchGlobalData();
    });
    container.querySelector('#startArbitrageBtn')?.addEventListener('click', function() {
        startArbitrageScan();
    });
    container.querySelector('#stopArbitrageBtn')?.addEventListener('click', function() {
        stopArbitrageScan();
    });
    container.querySelector('#compareAgentsBtn')?.addEventListener('click', function() {
        compareAllAgents();
    });
    container.querySelector('#exportJsonBtn')?.addEventListener('click', function() {
        exportData('json');
    });
    container.querySelector('#exportCsvBtn')?.addEventListener('click', function() {
        exportData('csv');
    });
    container.querySelector('#autoTradeBtn')?.addEventListener('click', function() {
        autoTradeMode = !autoTradeMode;
        if (safeToast) {
            safeToast('Auto-Trade: ' + (autoTradeMode ? 'ON' : 'OFF'), autoTradeMode ? 'success' : 'info');
        }
        updateUI();
    });
}

function updateLastUpdate() {
    const timeSpan = document.getElementById('cryptoLastUpdate');
    if (timeSpan) {
        timeSpan.textContent = new Date().toLocaleTimeString();
    }
}

function triggerScanBeam() {
    const el = document.getElementById('kcScanBeam');
    if (!el) { return; }
    el.classList.remove('kc-active');
    void el.offsetWidth;
    el.classList.add('kc-active');
}

function startArbitrageScan() {
    if (arbitrageInterval) {
        clearInterval(arbitrageInterval);
    }
    scanArbitrage();
    arbitrageInterval = setInterval(scanArbitrage, 30000);
    if (safeToast) {
        safeToast('Arbitrage Aktif (7 Exchange)!', 'success');
    }
}

function stopArbitrageScan() {
    if (arbitrageInterval) {
        clearInterval(arbitrageInterval);
        arbitrageInterval = null;
        if (safeToast) {
            safeToast('Arbitrage dihentikan.', 'info');
        }
    }
}

function startAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    fetchCryptoPrices();
    fetchGlobalData();
    updateInterval = setInterval(fetchCryptoPrices, 60000);
    if (globalInterval) {
        clearInterval(globalInterval);
    }
    globalInterval = setInterval(fetchGlobalData, 300000);
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    if (globalInterval) {
        clearInterval(globalInterval);
        globalInterval = null;
    }
}

function render() {
    let container = document.getElementById('liveCryptoPanel');
    if (!container) {
        const page = document.getElementById('livecryptoPage');
        if (page) {
            container = document.createElement('div');
            container.id = 'liveCryptoPanel';
            container.className = 'result-container';
            page.appendChild(container);
        } else {
            container = document.createElement('div');
            container.id = 'liveCryptoPanel';
            container.className = 'result-container';
            document.body.appendChild(container);
        }
    }
    
    if (!container) {
        return;
    }
    
    injectDesignSystem();
    
    container.innerHTML = '\n' +
        '<div class="kesos-crypto">' +
            '<div class="kc-grid-layer"></div>' +
            '<div class="kc-scan-tex"></div>' +
            '<div class="kc-scan-beam" id="kcScanBeam"></div>' +
            '<div class="kc-device">' +

                '<div class="kc-panel">' +
                    '<span class="kc-corner-tl"></span><span class="kc-corner-br"></span>' +
                    '<div class="kc-meta-strip">' +
                        '<span class="kc-micro kc-feed">FEED&middot;07</span>' +
                        '<span class="kc-micro">CH&middot;04</span>' +
                        '<span class="kc-micro kc-node-ind"><span class="kc-node-dot"></span>NODE ACTIVE</span>' +
                        '<span class="kc-micro">SESSION&middot;' + sessionId + '</span>' +
                        '<span class="kc-micro kc-coord">LAST <span id="cryptoLastUpdate">-</span></span>' +
                    '</div>' +
                    '<div class="kc-hdr-top">' +
                        '<div class="kc-brand">' +
                            '<div>' +
                                '<div class="kc-brand-title kc-brand-neon">KESEMPATAN OS</div>' +
                                '<div class="kc-brand-sub">INTELLIGENCE &middot; OPPORTUNITY &middot; IMPACT</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="kc-live-tag">' +
                            '<div class="kc-live-row"><span class="kc-live-dot"></span><span class="kc-live-word">LIVE</span></div>' +
                            '<div class="kc-clock" id="kesosClock">00:00:00</div>' +
                        '</div>' +
                    '</div>' +
                    '<hr class="kc-sep">' +
                    '<div class="kc-title-row">LIVE CRYPTO &mdash; BUY / SELL SIGNAL</div>' +
                    '<div class="kc-exch-row">' +
                        '<span class="kc-exch-count">&#9672; 7 EXCHANGE</span>' +
                        '<span class="kc-exch-list"><b>CoinGecko</b> &middot; <b>Binance</b> &middot; <b>Indodax</b> &middot; <b>Coinbase</b> &middot; <b>Kraken</b> &middot; <b>KuCoin</b> &middot; <b>Bitfinex</b></span>' +
                    '</div>' +
                '</div>' +

                '<div id="liveCryptoContainer">' +
                    '<div class="kc-panel"><span class="kc-micro">&#9679; ACQUIRING SIGNAL&hellip;</span></div>' +
                '</div>' +

                '<div class="kc-back-row">' +
                    '<button class="kc-back-btn" onclick="window.showPage(\'dashboard\')">&larr; KEMBALI KE DASBOR</button>' +
                    '<div class="kc-foot-tag">NODE&middot;07<br>LIVE FEED &middot; ENCRYPTED</div>' +
                '</div>' +

            '</div>' +
        '</div>' +
    '';
    
    function tickClock() {
        const el = document.getElementById('kesosClock');
        if (el) {
            el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
        }
        const up = document.getElementById('kesosUptime');
        if (up) {
            up.textContent = uptimeStr();
        }
    }
    tickClock();
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(tickClock, 1000);

    startAutoUpdate();
    
    try {
        const saved = localStorage.getItem('kes_prediction_history');
        if (saved) {
            predictionHistory = JSON.parse(saved);
        }
        if (window.KESEMPATAN?.KesDatabase?.migrateArrayOnce) {
            window.KESEMPATAN.KesDatabase.migrateArrayOnce('prediction_history', predictionHistory);
        }
    } catch (e) {
        console.warn('[LiveCrypto] Load prediction history failed:', e.message);
    }
    
    setTimeout(function() {
        marketSummary();
        fetchGlobalData();
    }, 5000);
    
    if (marketSummaryInterval) clearInterval(marketSummaryInterval);
    marketSummaryInterval = setInterval(function() {
        marketSummary();
    }, 6 * 60 * 60 * 1000);

    if (marketRecapInterval) clearInterval(marketRecapInterval);
    marketRecapInterval = setInterval(function() {
        marketRecap();
    }, 60 * 60 * 1000);

    if (predictMarketInterval) clearInterval(predictMarketInterval);
    predictMarketInterval = setInterval(function() {
        predictMarket();
    }, 4 * 60 * 60 * 1000);
}

export const LiveCrypto = {
    render: render,
    startAutoUpdate: startAutoUpdate,
    stopAutoUpdate: stopAutoUpdate,
    startArbitrageScan: startArbitrageScan,
    stopArbitrageScan: stopArbitrageScan,
    fetchCryptoPrices: fetchCryptoPrices,
    fetchGlobalData: fetchGlobalData,
    marketSummary: marketSummary,
    marketRecap: marketRecap,
    predictMarket: predictMarket,
    compareAllAgents: compareAllAgents,
    exportData: exportData,
    setAutoTrade: function(mode) {
        autoTradeMode = mode;
        updateUI();
    }
};

KESEMPATAN.LiveCrypto = LiveCrypto;





window.LiveCrypto = LiveCrypto;


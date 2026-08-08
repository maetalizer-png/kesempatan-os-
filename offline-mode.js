(function () {
"use strict";
if (window.__OfflineModeLoaded) return;
window.__OfflineModeLoaded = true;

const OFFLINE_SAMPLE_AGENTS = ['RahmadRaharjo', 'Manager', 'StartupFounder', 'SundanyaAsep'];

function initials(name) {
const p = String(name || '').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ');
if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
return (p[0][0] + (p[p.length - 1][0] || '')).toUpperCase();
}

const showToast = (window.Utils && window.Utils.showToast)
? window.Utils.showToast
: function (msg, type) {
const c = document.getElementById('toastContainer');
if (!c) return;
const t = document.createElement('div');
t.className = 'toast';
t.textContent = msg;
if (type === 'error') t.style.borderLeftColor = '#FF5A5A';
else if (type === 'success') t.style.borderLeftColor = '#00FFA3';
c.appendChild(t);
setTimeout(() => t.remove(), 3500);
};

const CONSTANTS = {
CACHE_KEY: 'kes_offline_cache', PENDING_KEY: 'kes_pending_requests',
STATS_KEY: 'kes_offline_stats', SYNC_KEY: 'kes_offline_data',
HISTORY_KEY: 'kes_offline_history', SIMULATE_KEY: 'kes_offline_simulate',
CONTEXT_KEY: 'kes_offline_context', FEEDBACK_KEY: 'kes_offline_feedback',
KNOWLEDGE_KEY: 'kes_offline_knowledge', EVOLUTION_KEY: 'kes_offline_evolution',
QUALITY_KEY: 'kes_offline_quality', ENCRYPT_KEY: 'kes_offline_encrypt',
SESSION_KEY: 'kes_oc_session',
FEED_KEY: 'kes_oc_feed', NODE_KEY: 'kes_oc_node', LOG_KEY: 'kes_oc_console',
TAB_KEY: 'kes_oc_tab',
CACHE_METRICS_KEY: 'kes_oc_cache_metrics', LAST_SYNC_KEY: 'kes_oc_last_sync',
MAX_CACHE_ITEMS: 50, CACHE_TTL: 86400000, MAX_RETRIES: 3,
DASHBOARD_INTERVAL: 1000, SYNC_INTERVAL: 300000, PROGRESS_INTERVAL: 10000,
RECOMMENDATION_INTERVAL: 5000, MAX_LOGS: 80, MAX_TIMELINE: 80
};

const TABS = [
{ id: 'nexus', label: 'GATEWAY', title: 'GATEWAY NEXUS — SIGNAL RELAY // OUTER GATEWAY' },
{ id: 'engine', label: 'ENGINE', title: 'COGNITIVE ENGINE — INTERNAL CORE MATRIX' },
{ id: 'operative', label: 'OPERATIVE', title: 'OPERATIVE MATRIX — AGENT REGISTRY' },
{ id: 'archive', label: 'ARCHIVE', title: 'MEMORY ARCHIVE — LOCAL VAULT // CONTINUITY' },
{ id: 'telemetry', label: 'TELEMETRY', title: 'CORE TELEMETRY — RESOURCE VECTOR' },
{ id: 'relay', label: 'RELAY', title: 'CONTINUITY RELAY — UPLINK // BEACON SYNC' },
{ id: 'sealed', label: 'SEALED', title: 'SEALED REGISTRY — MISSION HOLD' },
{ id: 'recovery', label: 'RECOVERY', title: 'RECOVERY CYCLES — RE-ENGAGEMENT' },
{ id: 'integrity', label: 'INTEGRITY', title: 'CORE INTEGRITY MATRIX — CORE VERIFICATION GRID' },
{ id: 'intelligence', label: 'INTELLIGENCE', title: 'INTELLIGENCE MATRIX — DOMAIN PERFORMANCE' },
{ id: 'chronicle', label: 'CHRONICLE', title: 'MISSION CHRONICLE — OPERATION ARCHIVE' },
{ id: 'trace', label: 'TRACE', title: 'OPERATIONAL TRACE — RUNTIME LEDGER' },
{ id: 'console', label: 'CONSOLE', title: 'MISSION CONSOLE — DIRECTIVE SHELL' },
{ id: 'command', label: 'COMMAND', title: 'COMMAND DECK — OPERATION MATRIX' }
];

const ICONS = {
retry: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v6h-6"/>',
sync: '<path d="M7 4v16"/><path d="M3 8l4-4 4 4"/><path d="M17 20V4"/><path d="M21 16l-4 4-4-4"/>',
trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
upload: '<path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M4 20h16"/>',
download: '<path d="M12 4v12"/><path d="M8 12l4 4 4-4"/><path d="M4 20h16"/>',
wifioff: '<path d="M3 3l18 18"/><path d="M9.9 9.9a4 4 0 0 0 4.2 4.2"/><path d="M6.3 6.3a9 9 0 0 1 11.4 0"/><path d="M12 20h.01"/>',
lock: '<rect x="5" y="11" width="14" height="9"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
activity: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
listx: '<path d="M9 6h11"/><path d="M9 12h7"/><path d="M9 18h11"/><path d="M3 5l2 2-2 2"/><path d="M3 15l2 2-2 2"/>',
x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
stack: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
broadcast: '<circle cx="12" cy="12" r="2"/><path d="M7 7a7 7 0 0 0 0 10"/><path d="M17 7a7 7 0 0 1 0 10"/><path d="M4 4a12 12 0 0 0 0 16"/><path d="M20 4a12 12 0 0 1 0 16"/>',
link: '<path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1"/>',
cpu: '<rect x="7" y="7" width="10" height="10"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
hdd: '<rect x="3" y="6" width="18" height="12"/><path d="M7 10h.01M7 14h.01"/>',
heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>'
};

function icon(name, size) {
size = size || 14;
return '<svg class="oc-ic" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}

const HEALTH_ICON = {
'LOCAL REGISTRY': 'shield', 'ARCHIVE INTEGRITY': 'db', 'MISSION HOLD': 'stack',
'CIPHER': 'lock', 'MESH CHANNEL': 'broadcast',
'ENGINE HOOK': 'cpu', 'VAULT QUOTA': 'hdd'
};

const GREEN_VAL = ['ENABLED', 'ACTIVE', 'OPEN', 'ENGAGED', 'RW OK', 'LIVE', 'READY', 'LINKED', 'NOMINAL'];
const RED_VAL = ['PLAIN', 'FAULT', 'MISSING', 'CLOSED', 'DISABLED', 'EXHAUSTED', 'TERMINATED'];
const AMBER_VAL = ['STANDBY', 'NULL', 'WAITING', 'QUEUED', 'RECOVERY', 'RE-ENGAGE'];

function valClass(v) {
v = String(v || '');
if (GREEN_VAL.indexOf(v) !== -1) return 'oc-value-ok';
if (RED_VAL.indexOf(v) !== -1) return 'oc-value-danger';
if (AMBER_VAL.indexOf(v) !== -1) return 'oc-value-warn';
return '';
}

const OC_CSS = `:root{ --oc-bg:#0a0f12; --oc-panel:#0c1418; --oc-panel2:#0e171b; --oc-text:#EAFBF6; --oc-dim:#889099; --oc-micro:#566570; --oc-primary:#00FFA3; --oc-cyan:#35C8FF; --oc-warn:#FFC146; --oc-danger:#FF5A5A; --oc-purple:#9B7BFF; --oc-soft:rgba(255,255,255,.018); --oc-soft2:rgba(255,255,255,.014); --oc-ease:cubic-bezier(.22,.61,.36,1); } .oc-command-center,.oc-page{ color:var(--oc-text); font-family:"IBM Plex Mono","JetBrains Mono","Space Mono",ui-monospace,Consolas,"Courier New",monospace; font-size:11px; line-height:1.4; -webkit-font-smoothing:antialiased; } .oc-page{ position:relative; padding:12px; min-height:100%; background-color:var(--oc-bg); background-image: radial-gradient(1100px 560px at 82% -8%, rgba(0,255,163,.05), transparent 60%), radial-gradient(900px 520px at -5% 108%, rgba(53,200,255,.035), transparent 60%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E"); background-size:auto,auto,180px 180px; } .oc-panel{position:relative; background:transparent; border:none; box-shadow:none;} .oc-panel-head{position:relative; display:flex; align-items:flex-start; gap:9px; padding:9px 12px; min-height:44px; background:linear-gradient(90deg, rgba(0,255,163,.16), rgba(0,255,163,.04) 8px, rgba(0,255,163,0) 62%);} .oc-head-left{display:flex; gap:9px; align-items:flex-start; flex:1; min-width:0;} .oc-head-left>.oc-led{margin-top:3px;} .oc-head-titles{min-width:0; flex:1;} .oc-panel-head h4{margin:0; font-size:10px; letter-spacing:.2em; color:var(--oc-primary); font-weight:700; text-transform:uppercase; line-height:1.15; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 0 10px rgba(0,255,163,.15);} .oc-head-sub{font-size:7px; letter-spacing:.2em; color:var(--oc-micro); text-transform:uppercase; margin-top:4px;} .oc-hbolts{display:inline-flex; gap:3px; align-self:center; margin:0 8px 0 2px;} .oc-hbolts i{width:4px; height:4px; background:rgba(0,255,163,.16);} .oc-panel-id{font-size:8px; letter-spacing:.16em; color:var(--oc-primary); padding:2px 7px; background:rgba(0,255,163,.06); white-space:nowrap; align-self:flex-start;} .oc-panel-body{position:relative; padding:10px 12px;} .oc-topbar{display:flex; justify-content:space-between; align-items:center; gap:14px; padding:12px 14px; flex-wrap:wrap;} .oc-top-left{display:flex; align-items:center; gap:12px; min-width:0;} .oc-logo{font-size:18px; font-weight:800; letter-spacing:.2em; color:var(--oc-primary); text-shadow:0 0 14px rgba(0,255,163,.22); line-height:1;} .oc-tagline{font-size:7.5px; letter-spacing:.3em; color:var(--oc-dim); margin-top:4px; text-transform:uppercase;} .oc-head-boxes{display:flex; gap:8px; flex-wrap:wrap; align-items:stretch;} .oc-hbox{display:flex; flex-direction:column; gap:3px; justify-content:center; background:var(--oc-soft); padding:5px 10px; min-width:78px;} .oc-hb-l{font-size:7px; letter-spacing:.2em; color:var(--oc-micro); text-transform:uppercase;} .oc-hb-v{font-size:10px; letter-spacing:.08em; color:var(--oc-text); white-space:nowrap;} .oc-hb-v.ok{color:var(--oc-primary);} .oc-hb-v.warn{color:var(--oc-warn);} .oc-hb-v.err{color:var(--oc-danger); animation:ocPulse 2.2s infinite;} .oc-hbox.clock{background:rgba(0,255,163,.05);} .oc-hbox.clock .oc-hb-v{color:var(--oc-primary); font-size:13px; letter-spacing:.1em; text-shadow:0 0 10px rgba(0,255,163,.3);} .oc-linkbar{display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:8px 14px; margin-top:8px; background:var(--oc-soft2);} .oc-link-label{font-size:9px; letter-spacing:.18em; font-weight:700; text-transform:uppercase;} .oc-link-sub{font-size:7px; letter-spacing:.2em; color:var(--oc-micro); text-transform:uppercase;} .oc-link-toggle{margin-left:auto; min-height:30px; padding:6px 12px; font-size:7.5px; clip-path:polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px);} .oc-link-toggle::before{display:none;} .oc-link-toggle .oc-ic{width:14px; height:14px;} .oc-telemetry-strip,.oc-telemetry-chips{display:none!important;} .oc-tabs{display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:12px;} @media(min-width:640px){.oc-tabs{grid-template-columns:repeat(4,1fr);}} @media(min-width:1080px){.oc-tabs{grid-template-columns:repeat(7,1fr);}} .oc-tab{position:relative; display:flex; align-items:center; justify-content:flex-start; gap:9px; width:100%; min-height:42px; padding:0 14px; background:rgba(255,255,255,.035); border:none; color:var(--oc-dim); font-family:inherit; font-size:8px; letter-spacing:.16em; text-transform:uppercase; cursor:pointer; white-space:nowrap; overflow:hidden; clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px); transition:background .18s ease, color .18s ease;} .oc-tab::before{content:""; width:6px; height:6px; background:#33424b; flex:none; transition:background .18s ease, box-shadow .18s ease;} .oc-tab:hover{background:rgba(255,255,255,.06); color:var(--oc-text);} .oc-tab.active{background:rgba(0,255,163,.10); color:var(--oc-primary);} .oc-tab.active::before{background:var(--oc-primary); box-shadow:0 0 7px rgba(0,255,163,.6);} .oc-tab-panels{margin-top:8px;} .oc-tab-panel{display:none;} .oc-tab-panel.active{display:block; animation:ocTabIn .28s var(--oc-ease);} @keyframes ocTabIn{from{opacity:0; transform:translateY(6px);}to{opacity:1; transform:none;}} @media(max-width:520px){ .oc-topbar{flex-direction:column; align-items:stretch;} .oc-head-boxes{justify-content:space-between;} .oc-link-toggle{margin-left:0;} } .oc-kv{display:flex; justify-content:space-between; align-items:center; gap:10px; padding:5px 0;} .oc-kv>span:first-child{display:inline-flex; align-items:center; gap:7px; color:var(--oc-dim); font-size:8px; letter-spacing:.12em; text-transform:uppercase;} .oc-kv>span:first-child::before{content:""; width:5px; height:5px; background:var(--oc-primary); box-shadow:0 0 5px rgba(0,255,163,.5); flex:none;} .oc-kv b{color:var(--oc-text); font-size:9px; font-weight:600; text-align:right; letter-spacing:.04em; max-width:62%; word-break:break-word;} .oc-value-ok{color:var(--oc-primary)!important;} .oc-value-warn{color:var(--oc-warn)!important;} .oc-value-danger{color:var(--oc-danger)!important;} .oc-value-info{color:var(--oc-cyan)!important;} .oc-hrow{display:flex; justify-content:space-between; align-items:center; gap:8px; padding:5px 0;} .oc-hrow .lbl{display:flex; align-items:center; gap:8px; color:var(--oc-dim); font-size:8px; letter-spacing:.1em; text-transform:uppercase;} .oc-hic{display:inline-flex;} .oc-hic.ok{color:var(--oc-primary);} .oc-hic.warn{color:var(--oc-warn);} .oc-hic.err{color:var(--oc-danger);} .oc-hrow b{font-size:9px; font-weight:600; letter-spacing:.05em;} .oc-led{display:inline-block; width:6px; height:6px; background:#263139; flex:none;} .oc-led.ok{background:var(--oc-primary); box-shadow:0 0 6px rgba(0,255,163,.45); animation:ocPulse 3s infinite;} .oc-led.warn{background:var(--oc-warn); box-shadow:0 0 5px rgba(255,193,70,.4);} .oc-led.err{background:var(--oc-danger); box-shadow:0 0 5px rgba(255,90,90,.4);} .oc-led.off{background:#31404B;} @keyframes ocPulse{0%,100%{opacity:1;}50%{opacity:.5;}} .oc-bar{height:6px; background:rgba(4,9,11,.9); position:relative; overflow:hidden; margin:4px 0; box-shadow:inset 0 1px 3px rgba(0,0,0,.6);} .oc-bar i{display:block; height:100%; background:linear-gradient(90deg, rgba(0,255,163,.65), var(--oc-primary)); box-shadow:0 0 8px rgba(0,255,163,.25); transition:width .6s var(--oc-ease);} .oc-bar.warn i{background:linear-gradient(90deg, rgba(255,193,70,.6), var(--oc-warn));} .oc-bar.err i{background:linear-gradient(90deg, rgba(255,90,90,.6), var(--oc-danger));} .oc-bar.cyan i{background:linear-gradient(90deg, rgba(53,200,255,.6), var(--oc-cyan));} .oc-bar--seg{background-color:rgba(0,255,163,.06); background-image:repeating-linear-gradient(90deg, transparent 0 6px, #06100d 6px 8px);} .oc-bar--seg i{background-color:transparent; background-image:repeating-linear-gradient(90deg, var(--oc-primary) 0 6px, transparent 6px 8px); box-shadow:0 0 6px rgba(0,255,163,.2);} .oc-bar--seg.warn{background-color:rgba(255,193,70,.06);} .oc-bar--seg.warn i{background-image:repeating-linear-gradient(90deg, var(--oc-warn) 0 6px, transparent 6px 8px);} .oc-bar--seg.cyan{background-color:rgba(53,200,255,.06);} .oc-bar--seg.cyan i{background-image:repeating-linear-gradient(90deg, var(--oc-cyan) 0 6px, transparent 6px 8px);} .oc-topic{display:grid; grid-template-columns:62px 1fr 26px; align-items:center; gap:8px; font-size:8px; margin:4px 0;} .oc-topic span{color:var(--oc-dim); letter-spacing:.1em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;} .oc-topic-bar{height:4px; background:rgba(0,255,163,.08); position:relative; overflow:hidden;} .oc-topic-bar b{position:absolute; left:0; top:0; bottom:0; background:var(--oc-primary); box-shadow:0 0 6px rgba(0,255,163,.35); transition:width .6s var(--oc-ease);} .oc-topic em{font-style:normal; color:var(--oc-text); text-align:right;} .oc-two-col{display:grid; grid-template-columns:1fr 1fr; gap:14px;} @media(max-width:520px){.oc-two-col{grid-template-columns:1fr;}} .oc-table{width:100%; border-collapse:collapse; font-size:8px;} .oc-table th{color:var(--oc-micro); text-transform:uppercase; letter-spacing:.12em; font-weight:600; text-align:left; padding:4px;} .oc-table td{padding:4px; color:#A9BCC8; vertical-align:top;} .oc-table tbody tr:nth-child(odd) td{background:var(--oc-soft);} .oc-scope{position:relative; margin-top:8px; overflow:hidden; background:radial-gradient(120% 120% at 50% 0%, #06140f, #03080a); box-shadow:inset 0 2px 10px rgba(0,0,0,.6);} .oc-scope svg{display:block; width:100%; height:62px; position:relative; z-index:1;} .oc-empty{color:#415666; font-size:9px; text-align:center; padding:12px; letter-spacing:.12em; background:rgba(0,0,0,.16); box-shadow:inset 0 1px 4px rgba(0,0,0,.5);} .oc-empty--scope{position:relative; min-height:128px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:10px; color:var(--oc-micro); font-size:9px; letter-spacing:.2em; background:rgba(0,0,0,.16); box-shadow:inset 0 1px 4px rgba(0,0,0,.5);} .oc-console{background:#04070A; padding:7px; height:178px; overflow:auto; font-size:8px; line-height:1.55; box-shadow:inset 0 2px 10px rgba(0,0,0,.6);} .oc-console-line{display:flex; gap:7px; padding:2px 0;} .oc-console-time{color:#3E5464;} .oc-console-src{color:var(--oc-cyan); min-width:42px;} .oc-console-msg{color:#B9C9D3; word-break:break-word;} .level-ok .oc-console-msg{color:var(--oc-primary);} .level-warn .oc-console-msg{color:var(--oc-warn);} .level-error .oc-console-msg{color:var(--oc-danger);} .level-action .oc-console-msg{color:#D5E3EA;} .level-info .oc-console-msg{color:#B9C9D3;} .oc-prompt{display:flex; align-items:center; gap:6px; margin-top:7px; font-size:9px; color:var(--oc-primary);} .oc-prompt .cur{width:7px; height:12px; background:var(--oc-primary); animation:ocPulse 1.1s infinite;} .oc-console-input{display:flex; gap:6px; margin-top:7px;} .oc-console-input input{flex:1; background:#04070A; color:var(--oc-primary); font-family:inherit; font-size:9px; padding:6px 7px; outline:none; letter-spacing:.04em; box-shadow:inset 0 1px 4px rgba(0,0,0,.6);} .oc-console-input input::placeholder{color:#3E5464;} .oc-timeline{position:relative; padding-left:13px; max-height:190px; overflow:auto;} .oc-timeline::before{content:""; position:absolute; left:3px; top:0; bottom:0; width:1px; background:linear-gradient(180deg, var(--oc-primary), transparent); opacity:.3;} .oc-tl-item{position:relative; padding:5px 0;} .oc-tl-item::before{content:""; position:absolute; left:-11px; top:9px; width:5px; height:5px; background:var(--oc-primary); box-shadow:0 0 6px rgba(0,255,163,.45);} .oc-tl-time{font-size:7px; color:var(--oc-micro); letter-spacing:.06em;} .oc-tl-action{font-size:9px; color:#B9C9D3;} .oc-agent{padding:7px; margin-bottom:7px; background:linear-gradient(180deg, rgba(255,255,255,.012), rgba(0,0,0,.10)); box-shadow:inset 0 1px 4px rgba(0,0,0,.4);} .oc-agent:last-child{margin-bottom:0;} .oc-agent-top{display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px;} .oc-agent-name{display:flex; align-items:center; gap:7px; font-size:9px; color:#D5E3EA; letter-spacing:.06em;} .oc-agent-badge{display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; color:var(--oc-primary); font-size:8px; font-weight:700; letter-spacing:.04em; background:rgba(0,255,163,.06);} .oc-agent-meta{font-size:7px; color:var(--oc-micro); text-transform:uppercase; letter-spacing:.12em;} .oc-actions{display:grid; grid-template-columns:repeat(3,1fr); gap:8px;} .oc-actions-full{margin-top:8px;} .oc-actions-full .oc-btn{width:100%;} @media(max-width:560px){.oc-actions{grid-template-columns:repeat(2,1fr);}} .oc-btn{position:relative; display:inline-flex; align-items:center; gap:9px; padding:9px 11px; min-height:48px; background:linear-gradient(180deg, #0c171a, #0a1316); border:none; color:var(--oc-text); font-family:inherit; font-size:8px; letter-spacing:.13em; text-transform:uppercase; cursor:pointer; text-align:left; clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px); box-shadow:inset 0 -2px 5px rgba(0,0,0,.45); transition:background .16s ease, box-shadow .16s ease, transform .12s ease;} .oc-btn:hover{background:linear-gradient(180deg, #102126, #0c181b); box-shadow:inset 0 -2px 6px rgba(0,0,0,.55), inset 0 0 14px rgba(0,255,163,.06);} .oc-btn:active{transform:translateY(1px);} .oc-btn::before{content:""; position:absolute; top:6px; right:7px; width:5px; height:5px; border-radius:50%; background:var(--oc-primary); box-shadow:0 0 6px var(--oc-primary);} .oc-btn .oc-ic{width:17px; height:17px; stroke:var(--oc-primary); flex:none;} .oc-btn-t{display:flex; flex-direction:column; gap:3px; line-height:1.2;} .oc-btn-l{color:var(--oc-text);} .oc-btn kbd{font-family:inherit; font-size:7px; color:var(--oc-micro); letter-spacing:.1em;} .oc-btn.info::before{background:var(--oc-cyan); box-shadow:0 0 6px var(--oc-cyan);} .oc-btn.info .oc-ic{stroke:var(--oc-cyan);} .oc-btn.warn::before{background:var(--oc-warn); box-shadow:0 0 6px var(--oc-warn);} .oc-btn.warn .oc-ic{stroke:var(--oc-warn);} .oc-btn.danger{background:linear-gradient(180deg, #1a0d0e, #140a0b);} .oc-btn.danger::before{background:var(--oc-danger); box-shadow:0 0 6px var(--oc-danger);} .oc-btn.danger .oc-ic{stroke:var(--oc-danger);} .oc-btn.danger .oc-btn-l{color:#FF8A8A;} .oc-btn.neutral .oc-ic{stroke:var(--oc-dim);} .oc-btn.neutral::before{background:var(--oc-dim); box-shadow:none;} .oc-deck-plate{position:relative; padding:8px; margin-top:2px; background-color:#0a1316; background-image: radial-gradient(circle at 7px 7px, #2c4d55 0 1.6px, #06100d 2px 3px, transparent 3.4px), radial-gradient(circle at calc(100% - 7px) 7px, #2c4d55 0 1.6px, #06100d 2px 3px, transparent 3.4px), radial-gradient(circle at 7px calc(100% - 7px), #2c4d55 0 1.6px, #06100d 2px 3px, transparent 3.4px), radial-gradient(circle at calc(100% - 7px) calc(100% - 7px), #2c4d55 0 1.6px, #06100d 2px 3px, transparent 3.4px), repeating-linear-gradient(135deg, rgba(255,255,255,.012) 0 2px, transparent 2px 4px), linear-gradient(180deg, #0c171a, #080f12); background-repeat:no-repeat, no-repeat, no-repeat, no-repeat, repeat, no-repeat; box-shadow:inset 0 2px 9px rgba(0,0,0,.6);} .oc-deck-plate .oc-actions{gap:0;} .oc-deck-plate .oc-actions-full{margin-top:0;} .oc-deck-plate .oc-btn{clip-path:polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px); background:linear-gradient(180deg, rgba(10,18,21,.5), rgba(6,12,14,.7)); box-shadow:inset 0 1px 3px rgba(0,0,0,.5); min-height:50px;} .oc-deck-plate .oc-btn:hover{background:linear-gradient(180deg, rgba(13,24,28,.7), rgba(8,15,18,.84)); box-shadow:inset 0 2px 7px rgba(0,0,0,.7), inset 0 0 12px rgba(0,255,163,.05);} .oc-deck-plate .oc-btn:active{box-shadow:inset 0 3px 9px rgba(0,0,0,.82), inset 0 0 14px rgba(0,255,163,.09);} .oc-deck-plate .oc-btn::before{top:7px; right:8px; width:5px; height:5px; box-shadow:0 0 5px currentColor;} .oc-deck-plate .oc-btn.danger{background:linear-gradient(180deg, rgba(26,13,14,.5), rgba(16,9,10,.7));} .oc-deck-plate .oc-btn.danger .oc-btn-l{color:#FF8A8A;} .oc-sep{height:6px; background:none; margin:2px 0;} .oc-micro{font-size:7px; color:var(--oc-micro); letter-spacing:.16em; text-transform:uppercase;} .oc-note{font-size:8px; color:#4A6172; letter-spacing:.06em;} .oc-status-foot{display:flex; align-items:center; gap:8px; margin-top:9px; padding-top:8px; font-size:8px; letter-spacing:.14em; color:var(--oc-micro); text-transform:uppercase;} .oc-status-foot b{margin-left:auto;} .oc-protocol{display:flex; align-items:center; gap:12px; margin-top:10px; padding:9px 12px; background:var(--oc-soft2); font-size:8px; letter-spacing:.08em; color:var(--oc-dim); flex-wrap:wrap;} .oc-protocol .tag{color:var(--oc-primary); letter-spacing:.18em; text-transform:uppercase; font-weight:700;} .oc-kv b,.oc-hb-v,.oc-hrow b{transition:color .35s ease;} .oc-scope-beacon{position:absolute; width:7px; height:7px; margin:-3.5px 0 0 -3.5px; border-radius:50%; left:0; top:50%; opacity:0; z-index:3; pointer-events:none; background:var(--oc-primary); box-shadow:0 0 9px rgba(0,255,163,.75); transition:left .6s var(--oc-ease), top .6s var(--oc-ease), opacity .4s ease; animation:ocBeacon 2.6s ease-in-out infinite;} @keyframes ocBeacon{0%,100%{transform:scale(1); opacity:.9;}50%{transform:scale(1.55); opacity:.32;}} @media (prefers-reduced-motion: reduce){ .oc-bar i,.oc-topic-bar b,.oc-scope-beacon,.oc-kv b,.oc-hb-v,.oc-hrow b{transition:none;} .oc-scope-beacon,.oc-led.ok,.oc-prompt .cur,.oc-hb-v.err,.oc-tab-panel.active{animation:none;} }`;

const state = {
isOnline: navigator.onLine, pendingRequests: [], offlineCache: {}, isRetrying: false,
stats: { count: 0, lastUsed: null, lastOnline: null, avgDuration: 0, successRate: 0, failed: 0, retries: 0, success: 0, avgResponseMs: 0, responseSamples: 0 },
isSimulating: localStorage.getItem(CONSTANTS.SIMULATE_KEY) === 'true',
activeTab: (function () { try { return localStorage.getItem(CONSTANTS.TAB_KEY) || 'nexus'; } catch (e) { return 'nexus'; } })(),
dashboardRendered: false, contexts: {}, feedbacks: {}, qualities: {}, evolutions: {}, offlineKnowledge: {},
encryptionEnabled: localStorage.getItem(CONSTANTS.ENCRYPT_KEY) === 'true',
broadcastChannel: null, dashboardInterval: null, telemetryInterval: null,
bootTime: Date.now(), sessionID: '', feedID: '', nodeID: '', consoleLogs: [],
cacheMetrics: { hits: 0, misses: 0 }, lastSync: Number(localStorage.getItem(CONSTANTS.LAST_SYNC_KEY)) || null,
storageEstimate: null, latencyMs: 0, cpuEstimate: 0, memEstimate: 0,
healthCache: [], healthCacheTime: 0, pid: 0, hash: '', fps: 60, scopeBuf: [],
uiDirty: { console: true, timeline: true, pending: true, health: true, agents: true, stats: true }
};

const DEFAULT_KNOWLEDGE_BASE = {
'bisnis': { insights: ['Peluang bisnis perlu validasi pasar', 'Mulai dari skala kecil, iterasi cepat', 'Customer feedback adalah emas'], score: 65, demand: 80, competition: 70, monetization: 75, virality: 60, sustainability: 65, scalability: 70, timing: 75, attention: 65, execution: 70, longterm: 65 },
'teknologi': { insights: ['Tren teknologi bergerak sangat cepat', 'Adaptasi adalah kunci sukses', 'Fokus pada solusi, bukan teknologi'], score: 70, demand: 85, competition: 65, monetization: 70, virality: 65, sustainability: 75, scalability: 80, timing: 85, attention: 80, execution: 65, longterm: 75 },
'startup': { insights: ['Fokus pada product-market fit', 'Burn rate perlu dimonitor ketat', 'Tim solid > ide bagus'], score: 72, demand: 75, competition: 80, monetization: 65, virality: 70, sustainability: 60, scalability: 85, timing: 80, attention: 75, execution: 65, longterm: 70 },
'marketing': { insights: ['Konten adalah raja, distribusi adalah ratu', 'Kenali audiens Anda', 'Konsistensi > viral'], score: 68, demand: 70, competition: 85, monetization: 65, virality: 85, sustainability: 60, scalability: 75, timing: 70, attention: 90, execution: 70, longterm: 60 },
'keuangan': { insights: ['Kelola cash flow dengan disiplin', 'Diversifikasi adalah perlindungan', 'Belajar dari kegagalan'], score: 75, demand: 65, competition: 60, monetization: 90, virality: 50, sustainability: 85, scalability: 70, timing: 75, attention: 60, execution: 80, longterm: 90 },
'kreatif': { insights: ['Kreativitas bisa dilatih', 'Inspirasi datang dari mana saja', 'Jangan takut bereksperimen'], score: 78, demand: 60, competition: 50, monetization: 70, virality: 90, sustainability: 65, scalability: 60, timing: 70, attention: 95, execution: 75, longterm: 65 },
'pendidikan': { insights: ['Pendidikan adalah investasi terbaik', 'Belajar sepanjang hayat', 'Metode pengajaran berevolusi'], score: 80, demand: 90, competition: 55, monetization: 60, virality: 55, sustainability: 90, scalability: 85, timing: 80, attention: 70, execution: 75, longterm: 95 },
'kesehatan': { insights: ['Kesehatan adalah aset paling berharga', 'Pencegahan > pengobatan', 'Teknologi kesehatan berkembang'], score: 82, demand: 95, competition: 50, monetization: 65, virality: 50, sustainability: 90, scalability: 70, timing: 85, attention: 75, execution: 70, longterm: 95 },
'sosial': { insights: ['Media sosial pedang bermata dua', 'Authenticity adalah kunci', 'Konsistensi > frekuensi'], score: 76, demand: 75, competition: 80, monetization: 60, virality: 95, sustainability: 55, scalability: 80, timing: 85, attention: 98, execution: 75, longterm: 55 }
};

const DEFAULT_KNOWLEDGE = { insights: ['Analisis offline berdasarkan pengetahuan internal', 'Perlu validasi online', 'Sistem siap membantu'], score: 55, demand: 60, competition: 55, monetization: 60, virality: 50, sustainability: 55, scalability: 60, timing: 55, attention: 55, execution: 60, longterm: 55 };

const AGENT_TOPICS = { 'RahmadRaharjo': ['bisnis', 'startup', 'keuangan', 'umum'], 'Manager': ['bisnis', 'manajemen', 'operasional', 'umum'], 'StartupFounder': ['startup', 'bisnis', 'teknologi', 'umum'], 'SundanyaAsep': ['kreatif', 'sosial', 'marketing', 'umum'] };

const EVOLUTION_CONFIGS = { 'excellent': { temperature: 0.7, style: 'confident', confidenceBoost: 15 }, 'good': { temperature: 0.6, style: 'professional', confidenceBoost: 8 }, 'average': { temperature: 0.5, style: 'balanced', confidenceBoost: 0 }, 'learning': { temperature: 0.3, style: 'cautious', confidenceBoost: -5 } };

const AGENT_PREFIXES = { 'RahmadRaharjo': { confident: 'Bos, ini analisis saya yang paling mantap! ', cautious: 'Bos, ini analisis awal saya, bisa dikembangkan lebih lanjut. ', default: 'Bos, ini analisis dari ingatan saya. ' }, 'Manager': { confident: 'Berdasarkan data internal terbaik, ', default: 'Berdasarkan data internal yang tersimpan, ' }, 'SundanyaAsep': { confident: 'Aduuh, berdasarkan pengalaman saya yang luar biasa mah... ', default: 'Aduuh, berdasarkan pengalaman saya mah... ' } };

const POSITIVE_WORDS = ['baik', 'bagus', 'hebat', 'luar biasa', 'unggul', 'berhasil', 'sukses', 'efektif', 'meningkat', 'maju', 'cerah', 'positif', 'optimis', 'menjanjikan'];
const NEGATIVE_WORDS = ['buruk', 'jelek', 'gagal', 'lemah', 'kurang', 'masalah', 'rugi', 'hancur', 'sulit', 'berat', 'negatif', 'pesimis', 'risiko', 'bahaya'];

const TOPIC_KEYWORDS = { 'bisnis': ['bisnis', 'usaha', 'jualan', 'dagang', 'wirausaha', 'startup'], 'teknologi': ['teknologi', 'digital', 'ai', 'kecerdasan', 'otomatisasi', 'software'], 'marketing': ['marketing', 'pemasaran', 'promosi', 'branding', 'iklan', 'social media'], 'keuangan': ['keuangan', 'modal', 'investasi', 'profit', 'cashflow', 'hutang'], 'kreatif': ['kreatif', 'desain', 'seni', 'foto', 'video', 'konten'], 'pendidikan': ['pendidikan', 'belajar', 'kursus', 'pelatihan', 'sekolah'], 'kesehatan': ['kesehatan', 'medis', 'dokter', 'obat', 'rumah sakit'], 'sosial': ['sosial', 'media sosial', 'instagram', 'tiktok', 'facebook'] };

function clamp(v, min, max) { const n = Number(v) || 0; return Math.min(max, Math.max(min, n)); }
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = String(t === null || t === undefined ? '' : t); return d.innerHTML; }
function setTxt(id, v) { const el = document.getElementById(id); if (!el) return; el.textContent = (v === null || v === undefined || v === '') ? '--' : String(v); }
function setHTML(id, h) { const el = document.getElementById(id); if (!el) return; el.innerHTML = h; }
function setBar(id, p) { const el = document.getElementById(id); if (!el) return; el.style.width = clamp(p, 0, 100) + '%'; }
function setLed(id, s) { const el = document.getElementById(id); if (!el) return; el.className = 'oc-led ' + s; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function formatDateTime(ts) { if (!ts) return '--'; try { return new Date(ts).toLocaleString('id-ID', { hour12: false }); } catch (e) { return new Date(ts).toLocaleString(); } }
function formatTime(ts) { if (!ts) return '--'; try { return new Date(ts).toLocaleTimeString('id-ID', { hour12: false }); } catch (e) { return new Date(ts).toLocaleTimeString(); } }
function formatUptime(ms) { const t = Math.floor((ms || 0) / 1000), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; if (h > 0) return pad2(h) + ':' + pad2(m) + ':' + pad2(s); if (m > 0) return pad2(m) + ':' + pad2(s); return '00:' + pad2(s); }
function formatBytes(b) { const n = Number(b) || 0; if (n === 0) return '0 B'; const k = 1024, sz = ['B', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(n) / Math.log(k)); return parseFloat((n / Math.pow(k, i)).toFixed(1)) + ' ' + sz[i]; }
function formatAge(ts) { const d = Date.now() - (ts || Date.now()); if (d < 60000) return Math.floor(d / 1000) + 's'; if (d < 3600000) return Math.floor(d / 60000) + 'm'; return Math.floor(d / 3600000) + 'h'; }
function formatClock() { const d = new Date(); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + ' / ' + d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function makeId(p) { return p + '-' + Date.now().toString(36).slice(-4).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function getPersistedId(k, p) { try { let v = localStorage.getItem(k); if (!v) { v = makeId(p); localStorage.setItem(k, v); } return v; } catch (e) { return makeId(p); } }

function initIdentity() {
state.sessionID = getPersistedId(CONSTANTS.SESSION_KEY, 'SES');
state.feedID = getPersistedId(CONSTANTS.FEED_KEY, 'FEED');
state.nodeID = getPersistedId(CONSTANTS.NODE_KEY, 'NODE');
state.pid = 1000 + (Date.now() % 9000);
const digits = (state.nodeID.replace(/\D/g, '') || '101').slice(-6);
state.hash = '0x' + ((parseInt(digits, 10) ^ 0x5A5A) >>> 0).toString(16).toUpperCase().slice(0, 6);
}

function getBuild() { return 'KOS-OFFLINE-CC'; }
function getChannel() { return 'BC:KES-OFFLINE-01'; }
function storageAvailable() { try { const k = 'oc_test'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return true; } catch (e) { return false; } }

const REDUCED_MOTION = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;

const OCSmooth = (function () {
const raf = new WeakMap();
function num(el, to, dur, fmt) {
if (!el) return;
const from = parseFloat(el.getAttribute('data-v'));
const fromV = isNaN(from) ? to : from;
if (REDUCED_MOTION || Math.abs(to - fromV) < 0.05) { el.textContent = fmt(to); el.setAttribute('data-v', String(to)); return; }
const old = raf.get(el); if (old) cancelAnimationFrame(old);
const t0 = performance.now(); dur = dur || 420;
function step(t) {
let k = (t - t0) / dur; if (k > 1) k = 1;
const e = 1 - Math.pow(1 - k, 3);
el.textContent = fmt(fromV + (to - fromV) * e);
if (k < 1) { raf.set(el, requestAnimationFrame(step)); }
else { el.setAttribute('data-v', String(to)); raf.delete(el); }
}
raf.set(el, requestAnimationFrame(step));
}
return { num: num };
})();

function setNum(id, val, suffix, dec) {
const el = document.getElementById(id); if (!el) return;
const n = Number(val) || 0; const d = dec || 0; const sfx = suffix || '';
OCSmooth.num(el, n, 420, function (v) { return (d ? v.toFixed(d) : String(Math.round(v))) + sfx; });
}

function renderTabs() {
return '<nav class="oc-tabs" role="tablist">' + TABS.map(function (t) {
return '<button class="oc-tab" type="button" role="tab" data-tab-target="' + t.id + '" title="' + t.title + '">' + t.label + '</button>';
}).join('') + '</nav>';
}

function switchTab(id) {
state.activeTab = id;
try { localStorage.setItem(CONSTANTS.TAB_KEY, id); } catch (e) {}
applyActiveTab();
}

function applyActiveTab() {
const root = document.getElementById('ocRoot'); if (!root) return;
const panels = root.querySelectorAll('.oc-tab-panel');
let found = false;
panels.forEach(function (p) { if (p.getAttribute('data-tab') === state.activeTab) found = true; });
if (!found) state.activeTab = 'nexus';
root.querySelectorAll('.oc-tab').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab-target') === state.activeTab); });
panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-tab') === state.activeTab); });
}

function loadConsoleLogs() { try { const s = localStorage.getItem(CONSTANTS.LOG_KEY); state.consoleLogs = s ? JSON.parse(s) : []; } catch (e) { state.consoleLogs = []; } return state.consoleLogs; }
function saveConsoleLogs() { try { localStorage.setItem(CONSTANTS.LOG_KEY, JSON.stringify(state.consoleLogs)); } catch (e) {} }

function addConsoleLog(message, level, source) {
state.consoleLogs.unshift({ ts: Date.now(), message: String(message), level: level || 'info', source: source || 'SYS' });
if (state.consoleLogs.length > CONSTANTS.MAX_LOGS) state.consoleLogs.length = CONSTANTS.MAX_LOGS;
saveConsoleLogs();
if (state.uiDirty) state.uiDirty.console = true;
updateConsoleOnly();
}

function clearConsoleLogs() { state.consoleLogs = []; saveConsoleLogs(); if (state.uiDirty) state.uiDirty.console = true; updateConsoleOnly(); showToast('Console dibersihkan', 'success'); }

function renderConsoleLines() {
if (!state.consoleLogs.length) return '<div class="oc-empty">MISSION CONSOLE READY</div>';
return state.consoleLogs.slice(0, 40).map(function (l) {
return '<div class="oc-console-line level-' + escapeHtml(l.level) + '"><span class="oc-console-time">' + formatTime(l.ts) + '</span><span class="oc-console-src">' + escapeHtml(l.source) + '</span><span class="oc-console-msg">' + escapeHtml(l.message) + '</span></div>';
}).join('');
}

function renderActivityLog() {
const logs = state.consoleLogs.filter(function (l) { return ['action', 'ok', 'warn', 'error'].indexOf(l.level) !== -1; }).slice(0, 30);
if (!logs.length) return '<div class="oc-empty">NO TRACE RECORDED</div>';
return logs.map(function (l) {
return '<div class="oc-console-line level-' + escapeHtml(l.level) + '"><span class="oc-console-time">' + formatTime(l.ts) + '</span><span class="oc-console-src">' + escapeHtml(l.source) + '</span><span class="oc-console-msg">' + escapeHtml(l.message) + '</span></div>';
}).join('');
}

function updateConsoleOnly() { setHTML('ocSystemConsole', renderConsoleLines()); setHTML('ocActivityLog', renderActivityLog()); }

function loadCacheMetrics() { try { const s = localStorage.getItem(CONSTANTS.CACHE_METRICS_KEY); state.cacheMetrics = s ? JSON.parse(s) : { hits: 0, misses: 0 }; } catch (e) { state.cacheMetrics = { hits: 0, misses: 0 }; } return state.cacheMetrics; }
function saveCacheMetrics() { try { localStorage.setItem(CONSTANTS.CACHE_METRICS_KEY, JSON.stringify(state.cacheMetrics)); } catch (e) {} }

function trackCacheHit(hit) {
if (hit) state.cacheMetrics.hits++; else state.cacheMetrics.misses++;
const t = state.cacheMetrics.hits + state.cacheMetrics.misses;
if (t > 10000) { state.cacheMetrics.hits = Math.round(state.cacheMetrics.hits / 2); state.cacheMetrics.misses = Math.round(state.cacheMetrics.misses / 2); }
saveCacheMetrics(); updateCacheDisplay();
}

function getCacheHitRatio() { const t = (state.cacheMetrics.hits || 0) + (state.cacheMetrics.misses || 0); if (!t) return 0; return Math.round((state.cacheMetrics.hits || 0) / t * 100); }

function measureLatency() { const t0 = performance.now(); try { localStorage.getItem(CONSTANTS.STATS_KEY); } catch (e) {} state.latencyMs = Math.max(0.1, Math.round((performance.now() - t0) * 100) / 100); }

function updateResourceEstimates() {
const pending = state.pendingRequests.length, cacheCount = Object.keys(state.offlineCache).length;
if (performance.memory) { const u = performance.memory.usedJSHeapSize || 0, l = performance.memory.jsHeapSizeLimit || 1; state.memEstimate = clamp(Math.round((u / l) * 100), 0, 100); }
else state.memEstimate = clamp(18 + cacheCount + pending * 2 + ((Math.sin(Date.now() / 20000) + 1) * 4), 5, 92);
const cores = navigator.hardwareConcurrency || 4;
const load = (state.latencyMs * 1.8) + (pending * 2.4) + (cacheCount / 18) + (state.consoleLogs.length / 25) + ((Math.sin(Date.now() / 15000) + 1) * 3);
state.cpuEstimate = clamp(Math.round((load / cores) * 18 + 4), 2, 97);
if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { state.storageEstimate = e; }).catch(function () {});
}

function getLocalDatabaseInfo() {
let keys = 0, chars = 0;
try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('kes') === 0) { keys++; chars += (localStorage.getItem(k) || '').length; } } } catch (e) {}
const raw = chars * 2; return { keys: keys, rawBytes: raw, size: formatBytes(raw) };
}

function updateResponseDuration(ms) {
ms = Math.max(1, Math.round(ms));
const s = (state.stats.responseSamples || 0) + 1, prev = state.stats.avgResponseMs || 0;
state.stats.avgResponseMs = Math.round(((prev * (s - 1)) + ms) / s); state.stats.responseSamples = s;
state.stats.avgDuration = Math.max(1, Math.round(state.stats.avgResponseMs / 1000));
saveOfflineStats();
}

function getEngineStatus() { if (!isActuallyOnline()) return 'ACTIVE'; if (state.isSimulating) return 'ACTIVE'; if (state.pendingRequests.length > 0) return 'RE-ENGAGE'; return 'STANDBY'; }
function getSyncStatus() { if (!isActuallyOnline()) return 'SEALED'; const q = loadOfflineData().length; if (q > 0) return 'READY'; return 'IDLE'; }
function getHealthScore(c) { if (!c || !c.length) return 0; const ok = c.filter(function (x) { return x.ok; }).length; return Math.round((ok / c.length) * 100); }

function runHealthCheck(force) {
if (!force && state.healthCache.length && Date.now() - (state.healthCacheTime || 0) < 5000) return state.healthCache;
const db = getLocalDatabaseInfo(), cs = getCacheStats();
const storageOk = state.storageEstimate ? (state.storageEstimate.usage / (state.storageEstimate.quota || 1)) < 0.85 : true;
const checks = [
{ label: 'LOCAL REGISTRY', ok: storageAvailable(), detail: storageAvailable() ? 'RW OK' : 'FAULT' },
{ label: 'ARCHIVE INTEGRITY', ok: cs.total <= CONSTANTS.MAX_CACHE_ITEMS, detail: cs.valid + '/' + cs.total },
{ label: 'MISSION HOLD', ok: state.pendingRequests.length <= 80, detail: state.pendingRequests.length + '/100' },
{ label: 'CIPHER', ok: true, detail: state.encryptionEnabled ? 'ENABLED' : 'PLAIN' },
{ label: 'MESH CHANNEL', ok: !!state.broadcastChannel, detail: state.broadcastChannel ? 'ACTIVE' : 'NULL' },
{ label: 'ENGINE HOOK', ok: !!(window.AIClients && window.AIClients.generateWithFallback), detail: (window.AIClients && window.AIClients.generateWithFallback) ? 'ENGAGED' : 'MISSING' },
{ label: 'VAULT QUOTA', ok: storageOk, detail: state.storageEstimate ? formatBytes(state.storageEstimate.usage) : db.size }
];
state.healthCache = checks; state.healthCacheTime = Date.now();
if (state.uiDirty) state.uiDirty.health = true;
return checks;
}

function getLocalDiagnostics() {
const db = getLocalDatabaseInfo();
return [
{ label: 'BUILD', value: getBuild() }, { label: 'PLATFORM', value: navigator.platform || 'N/A' },
{ label: 'LANGUAGE', value: navigator.language || 'N/A' }, { label: 'CPU CORES', value: navigator.hardwareConcurrency || 'N/A' },
{ label: 'VIEWPORT', value: window.innerWidth + 'x' + window.innerHeight }, { label: 'SCREEN', value: (screen.width || 0) + 'x' + (screen.height || 0) },
{ label: 'UTC TIME', value: new Date().toISOString() }, { label: 'REGISTRY SIZE', value: db.size },
{ label: 'RECALL METRICS', value: state.cacheMetrics.hits + 'H/' + state.cacheMetrics.misses + 'M' },
{ label: 'ENCRYPTION', value: state.encryptionEnabled ? 'ENABLED' : 'DISABLED' }
];
}

function getSparkValues() {
const h = loadOfflineHistory(), d = h.map(function (x) { return x.duration || 0; }).reverse();
if (d.length < 2) { const q = OFFLINE_SAMPLE_AGENTS.map(function (a) { return getOfflineAgentQuality(a); }); return q.length ? q : [50, 55, 60]; }
return d.slice(-24);
}

function sparkPoints(values, w, h) {
values = values && values.length ? values : [50]; if (values.length < 2) values = [values[0], values[0]];
const max = Math.max.apply(null, values.concat([1])), min = Math.min.apply(null, values.concat([0])), r = (max - min) || 1;
return values.map(function (v, i) { const x = (i / (values.length - 1)) * w, y = h - (((v - min) / r) * (h - 4)) - 2; return x.toFixed(1) + ',' + y.toFixed(1); }).join(' ');
}

function renderSparkline(values, color) {
color = color || '#00FFA3';
const w = 220, h = 34, pts = sparkPoints(values, w, h);
return '<svg width="100%" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="background:#04070A;display:block;box-shadow:inset 0 1px 3px rgba(0,0,0,.6)"><polyline id="ocSparkLine" points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="1.5" style="filter:drop-shadow(0 0 3px rgba(0,255,163,.35));"/></svg>';
}

function updateSparkline() { const pl = document.getElementById('ocSparkLine'); if (!pl) return; pl.setAttribute('points', sparkPoints(getSparkValues(), 220, 34)); }

function renderScope() {
return '<div class="oc-scope"><svg id="ocScopeSvg" viewBox="0 0 240 62" preserveAspectRatio="none"><line x1="0" y1="31" x2="240" y2="31" stroke="rgba(0,255,163,.14)" stroke-width="1" stroke-dasharray="3 4"/><polyline id="ocScopeLine" points="" fill="none" stroke="#00FFA3" stroke-width="1.4" style="filter:drop-shadow(0 0 4px rgba(0,255,163,.5));"/></svg><span class="oc-scope-beacon" id="ocScopeBeacon"></span></div>';
}

function scopePoints() {
const buf = state.scopeBuf, w = 240, h = 62;
const max = Math.max.apply(null, buf.concat([1])), min = Math.min.apply(null, buf.concat([0])), r = (max - min) || 1;
return buf.map(function (v, i) { const x = (i / Math.max(1, buf.length - 1)) * w, y = h - (((v - min) / r) * (h - 8)) - 4; return x.toFixed(1) + ',' + y.toFixed(1); }).join(' ');
}

function positionScopeBeacon() {
const bc = document.getElementById('ocScopeBeacon'); if (!bc) return;
const buf = state.scopeBuf; if (!buf.length) { bc.style.opacity = '0'; return; }
const w = 240, h = 62;
const max = Math.max.apply(null, buf.concat([1])), min = Math.min.apply(null, buf.concat([0])), r = (max - min) || 1;
const last = buf[buf.length - 1];
const ly = h - (((last - min) / r) * (h - 8)) - 4;
bc.style.left = '100%'; bc.style.top = (ly / h * 100) + '%'; bc.style.opacity = '1';
}

function extractTopic(p) { const lp = String(p || '').toLowerCase(); for (const t in TOPIC_KEYWORDS) { const kw = TOPIC_KEYWORDS[t]; for (const k of kw) { if (lp.includes(k)) return t; } } return 'umum'; }

function analyzeSentiment(t) {
const lt = String(t || '').toLowerCase(); let pos = 0, neg = 0;
for (const w of POSITIVE_WORDS) { if (lt.includes(w)) pos++; }
for (const w of NEGATIVE_WORDS) { if (lt.includes(w)) neg++; }
const tot = pos + neg; if (tot === 0) return { sentiment: 'neutral', score: 0, label: 'Netral' };
const s = ((pos - neg) / tot) * 100;
if (s > 20) return { sentiment: 'positive', score: Math.min(100, Math.round(s + 50)), label: 'Positif' };
if (s < -20) return { sentiment: 'negative', score: Math.max(0, Math.round(s + 50)), label: 'Negatif' };
return { sentiment: 'neutral', score: 50, label: 'Netral' };
}

function encryptData(d) { if (!state.encryptionEnabled) return d; try { return btoa(encodeURIComponent(JSON.stringify(d))); } catch (e) { return d; } }
function decryptData(e) { if (!state.encryptionEnabled || typeof e !== 'string') return e; try { return JSON.parse(decodeURIComponent(atob(e))); } catch (e2) { return e; } }

function loadOfflineCache() { try { const s = localStorage.getItem(CONSTANTS.CACHE_KEY); if (s) { const d = decryptData(s); state.offlineCache = typeof d === 'object' ? d : {}; } } catch (e) { state.offlineCache = {}; } return state.offlineCache; }
function saveOfflineCache() { try { const d = state.encryptionEnabled ? encryptData(state.offlineCache) : state.offlineCache; localStorage.setItem(CONSTANTS.CACHE_KEY, typeof d === 'string' ? d : JSON.stringify(d)); } catch (e) {} broadcastUpdate('cache_update', { cache: state.offlineCache }); }
function loadOfflineStats() {
const def = { count: 0, lastUsed: null, lastOnline: null, avgDuration: 0, successRate: 0, failed: 0, retries: 0, success: 0, avgResponseMs: 0, responseSamples: 0 };
try { const s = localStorage.getItem(CONSTANTS.STATS_KEY); state.stats = Object.assign({}, def, s ? JSON.parse(s) : {}); } catch (e) { state.stats = Object.assign({}, def); }
return state.stats;
}
function saveOfflineStats() { try { localStorage.setItem(CONSTANTS.STATS_KEY, JSON.stringify(state.stats)); } catch (e) {} }
function loadPendingRequests() { try { const s = localStorage.getItem(CONSTANTS.PENDING_KEY); state.pendingRequests = s ? JSON.parse(s) : []; } catch (e) { state.pendingRequests = []; } return state.pendingRequests; }
function savePendingRequests() { try { localStorage.setItem(CONSTANTS.PENDING_KEY, JSON.stringify(state.pendingRequests)); } catch (e) {} if (state.uiDirty) state.uiDirty.pending = true; broadcastUpdate('pending_update', { pending: state.pendingRequests }); updatePendingCounter(); }
function loadOfflineQualities() { try { const s = localStorage.getItem(CONSTANTS.QUALITY_KEY); state.qualities = s ? JSON.parse(s) : {}; } catch (e) { state.qualities = {}; } return state.qualities; }
function saveOfflineQualities() { try { localStorage.setItem(CONSTANTS.QUALITY_KEY, JSON.stringify(state.qualities)); } catch (e) {} if (state.uiDirty) state.uiDirty.agents = true; broadcastUpdate('quality_update', { qualities: state.qualities }); }
function loadOfflineKnowledge() { try { const s = localStorage.getItem(CONSTANTS.KNOWLEDGE_KEY); state.offlineKnowledge = s ? JSON.parse(s) : {}; } catch (e) { state.offlineKnowledge = {}; } return state.offlineKnowledge; }
function saveOfflineKnowledge() { try { localStorage.setItem(CONSTANTS.KNOWLEDGE_KEY, JSON.stringify(state.offlineKnowledge)); } catch (e) {} if (state.uiDirty) state.uiDirty.stats = true; }
function loadOfflineContexts() { try { const s = localStorage.getItem(CONSTANTS.CONTEXT_KEY); state.contexts = s ? JSON.parse(s) : {}; } catch (e) { state.contexts = {}; } return state.contexts; }
function saveOfflineContexts() { try { localStorage.setItem(CONSTANTS.CONTEXT_KEY, JSON.stringify(state.contexts)); } catch (e) {} if (state.uiDirty) state.uiDirty.stats = true; }
function loadOfflineEvolutions() { try { const s = localStorage.getItem(CONSTANTS.EVOLUTION_KEY); state.evolutions = s ? JSON.parse(s) : {}; } catch (e) { state.evolutions = {}; } return state.evolutions; }
function saveOfflineEvolutions() { try { localStorage.setItem(CONSTANTS.EVOLUTION_KEY, JSON.stringify(state.evolutions)); } catch (e) {} if (state.uiDirty) state.uiDirty.agents = true; }
function loadOfflineFeedback() { try { const s = localStorage.getItem(CONSTANTS.FEEDBACK_KEY); state.feedbacks = s ? JSON.parse(s) : {}; } catch (e) { state.feedbacks = {}; } return state.feedbacks; }
function saveOfflineFeedback() { try { localStorage.setItem(CONSTANTS.FEEDBACK_KEY, JSON.stringify(state.feedbacks)); } catch (e) {} if (state.uiDirty) state.uiDirty.stats = true; }
function loadOfflineHistory() { try { const s = localStorage.getItem(CONSTANTS.HISTORY_KEY); return s ? JSON.parse(s) : []; } catch (e) { return []; } }

function saveOfflineHistory(action, duration) {
duration = duration || 0; const h = loadOfflineHistory();
h.unshift({ action: action, duration: duration, timestamp: Date.now(), date: new Date().toISOString() });
if (h.length > CONSTANTS.MAX_TIMELINE) h.pop();
try { localStorage.setItem(CONSTANTS.HISTORY_KEY, JSON.stringify(h)); } catch (e) {}
if (state.uiDirty) state.uiDirty.timeline = true;
}

function clearOfflineHistory() { localStorage.removeItem(CONSTANTS.HISTORY_KEY); if (state.uiDirty) state.uiDirty.timeline = true; addConsoleLog('MISSION CHRONICLE PURGED', 'action', 'HIST'); showToast('Riwayat operasi dibersihkan', 'success'); renderDashboard(); }

function getCachedResponse(a, p) { const k = a + ':' + String(p || '').substring(0, 50), c = state.offlineCache[k]; if (c && (Date.now() - c.timestamp) < CONSTANTS.CACHE_TTL) return c.data; return null; }

function instantSetCachedResponse(a, p, d) {
const k = a + ':' + String(p || '').substring(0, 50); state.offlineCache[k] = { data: d, timestamp: Date.now() };
const keys = Object.keys(state.offlineCache);
if (keys.length > CONSTANTS.MAX_CACHE_ITEMS) { let o = keys[0]; for (const x of keys) { if (state.offlineCache[x].timestamp < state.offlineCache[o].timestamp) o = x; } delete state.offlineCache[o]; }
saveOfflineCache(); updateCacheDisplay(); return true;
}

function clearOfflineCache() { state.offlineCache = {}; saveOfflineCache(); updateCacheDisplay(); addConsoleLog('MEMORY ARCHIVE PURGED', 'action', 'ARC'); showToast('Arsip memori dibersihkan', 'success'); }

function getCacheStats() { const k = Object.keys(state.offlineCache), v = k.filter(function (x) { return (Date.now() - state.offlineCache[x].timestamp) < CONSTANTS.CACHE_TTL; }); return { total: k.length, valid: v.length }; }

function updateCacheDisplay() {
const s = getCacheStats();
const el = document.getElementById('cacheStatsDisplay'); if (el) el.innerHTML = s.valid + '/' + s.total + ' cache';
const el2 = document.getElementById('offlineCacheCount'); if (el2) el2.textContent = s.total;
setTxt('ocCacheValid', s.valid); setTxt('ocCacheTotal', s.total); setTxt('ocCacheHit', getCacheHitRatio() + '%');
}

function exportOfflineCache() {
const data = { version: getBuild(), exportDate: new Date().toISOString(), cache: state.offlineCache, stats: getOfflineStats(), knowledge: state.offlineKnowledge, qualities: state.qualities, total: Object.keys(state.offlineCache).length };
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
a.href = url; a.download = 'kes_offline_cache_' + Date.now() + '.json'; a.click(); URL.revokeObjectURL(url);
addConsoleLog('ARCHIVE EXPORT GENERATED :: ' + data.total + ' ITEMS', 'action', 'ARC'); showToast('Arsip offline diekspor!', 'success');
}

function importOfflineCache(file) {
const r = new FileReader();
r.onload = function (e) {
try {
const d = JSON.parse(e.target.result);
if (d.cache) {
state.offlineCache = d.cache; if (d.knowledge) state.offlineKnowledge = d.knowledge; if (d.qualities) state.qualities = d.qualities;
saveOfflineCache(); saveOfflineKnowledge(); saveOfflineQualities(); renderDashboard(); updateCacheDisplay();
addConsoleLog('ARCHIVE IMPORT COMPLETE :: ' + Object.keys(d.cache).length + ' ITEMS', 'ok', 'ARC'); showToast(Object.keys(d.cache).length + ' arsip diimpor!', 'success');
} else { addConsoleLog('ARCHIVE IMPORT FAILED :: INVALID FORMAT', 'error', 'ARC'); showToast('Format file tidak valid', 'error'); }
} catch (err) { addConsoleLog('ARCHIVE IMPORT FAILED :: PARSE ERROR', 'error', 'ARC'); showToast('Gagal import arsip', 'error'); }
};
r.readAsText(file);
}

function triggerImport() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = function (e) { if (e.target.files && e.target.files[0]) importOfflineCache(e.target.files[0]); }; i.click(); }

function getOfflineContext(a) { loadOfflineContexts(); const ac = state.contexts[a] || []; return ac[ac.length - 1] || null; }

function saveOfflineContext(a, p, resp) {
loadOfflineContexts(); if (!state.contexts[a]) state.contexts[a] = [];
const sent = analyzeSentiment(resp.summary || resp);
state.contexts[a].push({ topic: extractTopic(p), score: resp.score || 50, sentiment: sent.sentiment, timestamp: Date.now() });
if (state.contexts[a].length > 20) state.contexts[a].shift(); saveOfflineContexts();
}

function getOfflineAgentQuality(a) { loadOfflineQualities(); return state.qualities[a] || 50; }
function updateOfflineAgentQuality(a, c) { loadOfflineQualities(); const cur = state.qualities[a] || 50; state.qualities[a] = Math.min(100, Math.max(0, cur + c)); saveOfflineQualities(); checkRealTimeEvolution(a); return state.qualities[a]; }
function getOfflineAgentSuccessRate(a) { loadOfflineFeedback(); const d = state.feedbacks[a] || []; if (!d.length) return 0; let pos = 0; for (const it of d) { if (it.feedback === 'positive') pos++; } return Math.round((pos / d.length) * 100); }

function recordOfflineFeedback(a, fb, p, resp) {
loadOfflineFeedback(); if (!state.feedbacks[a]) state.feedbacks[a] = [];
state.feedbacks[a].push({ feedback: fb, prompt: String(p || '').substring(0, 100), score: (resp && resp.score) || 50, timestamp: Date.now() });
if (state.feedbacks[a].length > 50) state.feedbacks[a].shift(); saveOfflineFeedback();
updateOfflineAgentQuality(a, fb === 'positive' ? 2 : -1);
queueOfflineData({ type: 'feedback', agent: a, feedback: fb, timestamp: Date.now() });
addConsoleLog('SIGNAL ' + fb.toUpperCase() + ' :: ' + a, 'action', 'AI'); showToast('Signal tercatat :: ' + a, 'success');
}

function getOfflineKnowledge(topic) {
loadOfflineKnowledge(); const base = DEFAULT_KNOWLEDGE_BASE[topic] || DEFAULT_KNOWLEDGE, custom = state.offlineKnowledge[topic];
if (custom) { const ins = base.insights.slice(); for (const x of custom.insights) { if (ins.length < 8 && ins.indexOf(x) === -1) ins.push(x); } return { insights: ins, score: base.score }; }
return base;
}

function expandOfflineKnowledge(topic, insight) {
loadOfflineKnowledge(); if (!state.offlineKnowledge[topic]) state.offlineKnowledge[topic] = { insights: [], score: 55 };
if (state.offlineKnowledge[topic].insights.indexOf(insight) === -1) { state.offlineKnowledge[topic].insights.push(insight); if (state.offlineKnowledge[topic].insights.length > 10) state.offlineKnowledge[topic].insights.shift(); saveOfflineKnowledge(); return true; }
return false;
}

function getEvolutionConfig(l) { return EVOLUTION_CONFIGS[l] || EVOLUTION_CONFIGS.average; }

function getAgentEvolution(a) {
loadOfflineEvolutions(); const q = getOfflineAgentQuality(a), sr = getOfflineAgentSuccessRate(a);
let l = 'average'; if (q >= 80 && sr >= 70) l = 'excellent'; else if (q >= 60 && sr >= 50) l = 'good'; else if (q >= 40) l = 'average'; else l = 'learning';
const cfg = getEvolutionConfig(l);
if (!state.evolutions[a] || state.evolutions[a].level !== l) { state.evolutions[a] = { level: l, config: cfg, lastUpdated: Date.now(), evolvedAt: new Date().toISOString() }; saveOfflineEvolutions(); addConsoleLog('OPERATIVE EVOLVED :: ' + a + ' -> ' + l.toUpperCase(), 'ok', 'AI'); }
return state.evolutions[a];
}

function checkRealTimeEvolution(a) { const cur = state.evolutions[a] || { level: 'average' }, nl = getAgentEvolution(a).level; if (nl !== cur.level) { if (state.uiDirty) state.uiDirty.agents = true; updateAgentQualityDisplay(); } }

function predictOfflinePerformance(a) {
const q = getOfflineAgentQuality(a), sr = getOfflineAgentSuccessRate(a), evo = getAgentEvolution(a), cc = (state.contexts[a] || []).length;
const ps = Math.min(100, Math.round(q * 0.4 + sr * 0.3 + evo.config.confidenceBoost + cc * 0.5 + 20));
const conf = Math.min(100, Math.round(cc * 2 + (q / 10) + 20));
let rec = 'MEDIUM'; if (ps >= 75 && conf >= 60) rec = 'HIGH'; else if (ps >= 50) rec = 'MEDIUM'; else rec = 'LOW';
return { predictedScore: ps, confidence: conf, recommendation: rec, quality: q, successRate: sr, evolutionLevel: evo.level, contextCount: cc };
}

function generateOfflineAIResponse(agentName, prompt) {
const topic = extractTopic(prompt), context = getOfflineContext(agentName), knowledge = getOfflineKnowledge(topic), evo = getAgentEvolution(agentName), sent = analyzeSentiment(prompt), q = getOfflineAgentQuality(agentName), perf = predictOfflinePerformance(agentName), style = evo.config.style;
let prefix = ''; const pf = AGENT_PREFIXES[agentName];
if (pf) { if (style === 'confident') prefix = pf.confident || pf.default; else if (style === 'cautious') prefix = pf.cautious || pf.default; else prefix = pf.default || ''; }
let ins = knowledge.insights || ['Analisis offline berdasarkan pengetahuan internal'];
if (context && context.topic === topic) ins = ins.concat(['Berdasarkan percakapan sebelumnya tentang "' + context.topic + '"']);
const base = knowledge.score || 55, adj = ((q - 50) / 10) + (evo.config.confidenceBoost / 10), final = Math.min(100, Math.max(0, Math.round(base + adj)));
const conf = Math.min(85, Math.round(60 + (q / 5) + (context ? 5 : 0) + (perf.confidence / 10)));
const resp = {
agent: agentName, status: 'offline_ai', summary: prefix + '[AI OFFLINE] ' + (ins[0] || 'Analisis berdasarkan pengetahuan internal.'),
reasoning_summary: 'Analisis offline oleh ' + agentName + ' dengan gaya ' + style, score: final, confidence: conf, insight: ins.slice(0, 5),
strategy: ['Lakukan riset pasar lebih lanjut saat online', 'Validasi asumsi dengan data real-time', 'Gunakan pendekatan ' + style + ' dalam eksekusi', 'Konsultasikan dengan tim untuk perspektif berbeda'],
risk: ['Data mungkin tidak terbaru', 'Tanpa validasi real-time', 'Quality score: ' + q + '/100', 'Perlu feedback untuk meningkatkan akurasi'],
recommendation: ins[1] || 'Lakukan analisis lanjutan saat koneksi pulih.',
demand: knowledge.demand || 60, competition: knowledge.competition || 55, monetization: knowledge.monetization || 60, virality: knowledge.virality || 50, sustainability: knowledge.sustainability || 55, scalability: knowledge.scalability || 60, timing: knowledge.timing || 55, attention: knowledge.attention || 55, execution: knowledge.execution || 60, longterm: knowledge.longterm || 55,
_offlineMeta: { topic: topic, cacheHit: false, timestamp: Date.now(), quality: q, evolution: evo.level, sentiment: sent.sentiment, confidence: conf, style: style }
};
saveOfflineContext(agentName, prompt, resp); return resp;
}

function getSmartFallback(a, p) {
const c = getCachedResponse(a, p); if (c) { c._offlineMeta = c._offlineMeta || {}; c._offlineMeta.cacheHit = true; return c; }
const ai = generateOfflineAIResponse(a, p); if (ai) { instantSetCachedResponse(a, p, ai); return ai; }
const b = DEFAULT_KNOWLEDGE;
return { agent: a, status: 'offline', summary: '[OFFLINE] ' + a + ' menganalisis berdasarkan pengetahuan internal.', reasoning_summary: 'Analisis offline default', score: b.score || 50, confidence: 50, insight: ['Mode offline aktif', 'Gunakan hasil dengan bijak', 'Feedback membantu meningkatkan kualitas'], strategy: ['Hubungkan internet untuk analisis lebih akurat'], risk: ['Data tidak terbaru', 'Tanpa validasi real-time'], recommendation: 'Sambungkan internet dan ulangi analisis.', demand: 50, competition: 50, monetization: 50, virality: 50, sustainability: 50, scalability: 50, timing: 50, attention: 50, execution: 50, longterm: 50, _offlineMeta: { topic: 'unknown', cacheHit: false, timestamp: Date.now() } };
}

function calculateRelevance(a, p) { const t = extractTopic(p), ts = AGENT_TOPICS[a] || ['umum']; return ts.indexOf(t) !== -1 ? 20 : 5; }

function getOfflineAgentRecommendation(p) {
const scores = [];
for (const a of OFFLINE_SAMPLE_AGENTS) { const q = getOfflineAgentQuality(a), perf = predictOfflinePerformance(a), rel = calculateRelevance(a, p); scores.push({ agent: a, quality: q, predictedScore: perf.predictedScore, confidence: perf.confidence, relevance: rel, totalScore: q + perf.predictedScore + rel }); }
scores.sort(function (x, y) { return y.totalScore - x.totalScore; });
return scores[0] || { agent: 'RahmadRaharjo', quality: 50, predictedScore: 50, confidence: 50 };
}

function updateRealtimeRecommendation() {
const pi = document.getElementById('topicInput'), p = pi ? (pi.value || 'Analisis peluang') : 'Analisis peluang', rec = getOfflineAgentRecommendation(p);
setHTML('ocRecommendation', 'BEST OPERATIVE :: <b style="color:var(--oc-primary)">' + escapeHtml(rec.agent) + '</b> • Q ' + (rec.quality || 0) + '% • SCORE ' + (rec.predictedScore || 0) + ' • CONF ' + (rec.confidence || 0) + '%');
const old = document.getElementById('realtimeRecommendation');
if (old) old.innerHTML = 'Best Agent: <strong style="color:#00FFA3;">' + escapeHtml(rec.agent) + '</strong> <span style="font-size:8px;color:#666;">(quality: ' + (rec.quality || 0) + '%, score: ' + (rec.predictedScore || 0) + ')</span> <span style="font-size:8px;color:#9B7BFF;">' + (rec.confidence || 0) + '%</span>';
}

function queueRequest(a, p, prov) {
const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
state.pendingRequests.push({ id: id, agent: a, prompt: p, provider: prov, timestamp: Date.now(), retries: 0, quality: getOfflineAgentQuality(a) });
if (state.pendingRequests.length > 100) state.pendingRequests.shift();
savePendingRequests(); updateProgress(); addConsoleLog('SEAL DIRECTIVE :: ' + a + ' :: ' + String(p || '').substring(0, 42), 'warn', 'HOLD');
}

function removePendingRequest(id) { state.pendingRequests = state.pendingRequests.filter(function (r) { return r.id !== id; }); savePendingRequests(); updateProgress(); }

function updatePendingCounter() {
const pending = state.pendingRequests.length;
const el = document.getElementById('pendingCounter'); if (el) { el.textContent = pending; el.style.color = pending > 0 ? '#FFC146' : '#666'; el.style.animation = pending > 0 ? 'blink 1s infinite' : 'none'; }
const badge = document.getElementById('pendingBadge'); if (badge) { badge.textContent = pending > 0 ? pending : ''; badge.style.display = pending > 0 ? 'inline' : 'none'; }
setTxt('ocPendingCount', pending); setTxt('ocRetryCount', state.pendingRequests.filter(function (r) { return r.retries > 0; }).length);
if (state.uiDirty) state.uiDirty.pending = true;
}

async function retryPendingRequests() {
if (state.isRetrying || state.pendingRequests.length === 0 || !isActuallyOnline()) { if (!isActuallyOnline()) addConsoleLog('RE-ENGAGE HELD :: GATEWAY SEALED', 'warn', 'RELAY'); return; }
state.isRetrying = true; let success = 0, fail = 0;
addConsoleLog('RE-ENGAGE SEQUENCE START :: ' + state.pendingRequests.length + ' DIRECTIVE(S)', 'action', 'RELAY');
const gen = (window.AIClients && window.AIClients.__originalGenerateWithFallback) ? window.AIClients.__originalGenerateWithFallback : null;
const queue = state.pendingRequests.slice();
for (const req of queue) {
if (req.retries >= CONSTANTS.MAX_RETRIES) { fail++; state.stats.failed = (state.stats.failed || 0) + 1; removePendingRequest(req.id); addConsoleLog('CYCLE EXHAUSTED :: ' + req.agent, 'error', 'RELAY'); continue; }
try {
if (!gen) throw new Error('NO_GENERATOR');
await gen.call(window.AIClients, req.prompt, req.agent, req.provider);
success++; state.stats.success = (state.stats.success || 0) + 1; removePendingRequest(req.id); updateOfflineAgentQuality(req.agent, 3);
addConsoleLog('RE-ENGAGE COMPLETE :: ' + req.agent, 'ok', 'RELAY'); showToast('Directive "' + req.agent + '" selesai!', 'success');
} catch (e) {
req.retries++; state.stats.retries = (state.stats.retries || 0) + 1; savePendingRequests();
if (req.retries >= CONSTANTS.MAX_RETRIES) { fail++; state.stats.failed = (state.stats.failed || 0) + 1; removePendingRequest(req.id); updateOfflineAgentQuality(req.agent, -2); addConsoleLog('RE-ENGAGE TERMINATED :: ' + req.agent, 'error', 'RELAY'); }
else addConsoleLog('RE-ENGAGE DEFERRED :: ' + req.agent + ' [' + req.retries + '/' + CONSTANTS.MAX_RETRIES + ']', 'warn', 'RELAY');
}
await new Promise(function (r) { setTimeout(r, 1000); });
}
state.isRetrying = false; saveOfflineStats();
if (success > 0) showToast(success + ' directive selesai!', 'success');
if (fail > 0) showToast(fail + ' directive gagal', 'warning');
addConsoleLog('RE-ENGAGE SEQUENCE END :: COMPLETE=' + success + ' TERMINATED=' + fail, success > 0 ? 'ok' : 'warn', 'RELAY');
updateProgress(); renderDashboard();
}

function setupInstantRetry() { window.addEventListener('online', function () { if (state.pendingRequests.length > 0) retryPendingRequests(); }); }

function initBroadcastChannel() {
try {
state.broadcastChannel = new BroadcastChannel('kes_offline_sync');
state.broadcastChannel.onmessage = function (ev) {
const d = ev.data;
if (d.type === 'cache_update' && d.cache) { state.offlineCache = d.cache; saveOfflineCache(); updateCacheDisplay(); renderDashboard(); }
if (d.type === 'pending_update' && d.pending !== undefined) { state.pendingRequests = d.pending; savePendingRequests(); updatePendingCounter(); updateProgress(); }
if (d.type === 'quality_update' && d.qualities) { state.qualities = d.qualities; saveOfflineQualities(); renderDashboard(); }
if (d.type === 'stats_update' && d.stats) { state.stats = d.stats; saveOfflineStats(); renderDashboard(); }
};
addConsoleLog('MESH CHANNEL VERIFIED', 'ok', 'BC');
} catch (e) { state.broadcastChannel = null; }
}

function broadcastUpdate(t, d) { if (state.broadcastChannel) { try { state.broadcastChannel.postMessage({ type: t, data: d, timestamp: Date.now() }); } catch (e) {} } }

function loadOfflineData() { try { const s = localStorage.getItem(CONSTANTS.SYNC_KEY); return s ? JSON.parse(s) : []; } catch (e) { return []; } }
function saveOfflineData(d) { try { localStorage.setItem(CONSTANTS.SYNC_KEY, JSON.stringify(d)); } catch (e) {} }
function queueOfflineData(d) { const q = loadOfflineData(); q.push({ id: Date.now().toString() + Math.random().toString(36).substr(2, 4), data: d, timestamp: Date.now() }); if (q.length > 100) q.shift(); saveOfflineData(q); }

async function syncOfflineData() {
if (!isActuallyOnline()) { addConsoleLog('CONTINUITY HELD :: GATEWAY SEALED', 'warn', 'RELAY'); showToast('Gateway disegel, transmisi ditunda', 'warning'); return; }
const q = loadOfflineData(); if (!q.length) { addConsoleLog('CONTINUITY CHECK :: NO PENDING TRANSMISSION', 'info', 'RELAY'); showToast('Tidak ada transmisi tertahan', 'info'); return; }
let synced = 0;
for (const it of q) { try { if (window.supabaseClient) { const r = await window.supabaseClient.from('offline_sync').insert([{ data: it.data }]); if (!r.error) synced++; } else synced++; } catch (e) {} }
saveOfflineData(q.slice(synced));
if (synced > 0) { state.lastSync = Date.now(); try { localStorage.setItem(CONSTANTS.LAST_SYNC_KEY, String(state.lastSync)); } catch (e) {} addConsoleLog('CONTINUITY COMPLETE :: ' + synced + ' TRANSMISSION(S)', 'ok', 'RELAY'); showToast(synced + ' transmisi selesai!', 'success'); }
renderDashboard();
}

function realTimeEncryptionToggle() {
state.encryptionEnabled = !state.encryptionEnabled; localStorage.setItem(CONSTANTS.ENCRYPT_KEY, state.encryptionEnabled ? 'true' : 'false');
if (state.encryptionEnabled) { const all = { cache: state.offlineCache, stats: state.stats, qualities: state.qualities, knowledge: state.offlineKnowledge }; localStorage.setItem('kes_offline_encrypted_data', encryptData(all)); addConsoleLog('CIPHER ENGINE ARMED', 'ok', 'SEC'); showToast('Data dienkripsi!', 'success'); }
else { localStorage.removeItem('kes_offline_encrypted_data'); addConsoleLog('CIPHER ENGINE DISENGAGED', 'warn', 'SEC'); showToast('Data didekripsi!', 'success'); }
renderDashboard(); return state.encryptionEnabled;
}

function applyOfflineTheme() { const off = !isActuallyOnline(); if (off) { document.body.classList.add('offline-mode'); document.documentElement.style.setProperty('--offline-primary', '#FF5A5A'); } else { document.body.classList.remove('offline-mode'); document.documentElement.style.setProperty('--offline-primary', ''); } }

function updateSidebarStatus() {
const s = document.getElementById('offlineStatusSidebar'); if (!s) return;
const on = isActuallyOnline(), label = on ? 'LINKED' : 'SEALED', color = on ? '#00FFA3' : '#FF5A5A';
s.innerHTML = state.isSimulating ? 'SIMULASI' : label; s.style.color = state.isSimulating ? '#FFC146' : color; s.style.animation = (!on || state.isSimulating) ? 'blink 1.5s infinite' : 'none';
}

function updateProgress() {}
function updateAgentQualityDisplay() { const el = document.getElementById('ocAgentGrid'); if (el) el.innerHTML = renderAgentGrid(); }

function trackOfflineUsage() { state.stats.count = (state.stats.count || 0) + 1; state.stats.lastUsed = Date.now(); saveOfflineStats(); saveOfflineHistory('core_engaged', Math.floor(Math.random() * 60) + 30); broadcastUpdate('stats_update', { stats: state.stats }); }
function trackOnlineStatus() { state.stats.lastOnline = Date.now(); saveOfflineStats(); broadcastUpdate('stats_update', { stats: state.stats }); }
function getOfflineStats() { loadOfflineStats(); return state.stats; }

function getOfflinePerformance() {
const stats = getOfflineStats(); let aq = 0; for (const a of OFFLINE_SAMPLE_AGENTS) aq += getOfflineAgentQuality(a); aq = Math.round(aq / OFFLINE_SAMPLE_AGENTS.length);
const tc = (stats.success || 0) + (stats.failed || 0); let sr = tc ? Math.round((stats.success || 0) / tc * 100) : (stats.successRate || 0);
if (!sr) { let x = 0; for (const a of OFFLINE_SAMPLE_AGENTS) x += getOfflineAgentSuccessRate(a); sr = Math.round(x / OFFLINE_SAMPLE_AGENTS.length); }
const chr = getCacheHitRatio();
const acc = clamp(Math.round((aq * 0.55) + (sr * 0.25) + (chr * 0.20)), 0, 100) || 55;
return { totalOffline: stats.count || 0, avgDuration: stats.avgDuration || 0, avgResponseMs: stats.avgResponseMs || 0, successRate: sr, lastOffline: stats.lastUsed ? new Date(stats.lastUsed).toLocaleString() : 'Tidak pernah', lastOnline: stats.lastOnline ? new Date(stats.lastOnline).toLocaleString() : 'Tidak pernah', avgQuality: aq, pendingCount: state.pendingRequests.length, cacheCount: Object.keys(state.offlineCache).length, failed: stats.failed || 0, retries: stats.retries || 0, cacheHitRatio: chr, accuracy: acc, lastSync: state.lastSync };
}

function startTelemetry() { if (state.telemetryInterval) clearInterval(state.telemetryInterval); if (state.dashboardInterval) clearInterval(state.dashboardInterval); const tick = function () { updateTelemetry(); }; tick(); state.telemetryInterval = setInterval(tick, CONSTANTS.DASHBOARD_INTERVAL); }

function fpsLoop(t) {
if (document.hidden) { state._fpsLast = 0; state._fpsFrames = 0; requestAnimationFrame(fpsLoop); return; }
state._fpsFrames = (state._fpsFrames || 0) + 1; if (!state._fpsLast) state._fpsLast = t;
if (t - state._fpsLast >= 1000) { state.fps = state._fpsFrames; state._fpsFrames = 0; state._fpsLast = t; }
requestAnimationFrame(fpsLoop);
}

function countFeedbacks() { let n = 0; for (const k in state.feedbacks) { if (Object.prototype.hasOwnProperty.call(state.feedbacks, k)) n += state.feedbacks[k].length; } return n; }
function countContexts() { let n = 0; for (const k in state.contexts) { if (Object.prototype.hasOwnProperty.call(state.contexts, k)) n += state.contexts[k].length; } return n; }
function countEvolutions() { return Object.keys(state.evolutions).length; }

function renderAgentGrid() {
return OFFLINE_SAMPLE_AGENTS.map(function (a) {
const q = getOfflineAgentQuality(a), evo = getAgentEvolution(a), sr = getOfflineAgentSuccessRate(a), bc = q >= 70 ? '' : q >= 40 ? 'warn' : 'err';
const topics = (AGENT_TOPICS[a] || ['umum']).join('/').toUpperCase();
return '<div class="oc-agent"><div class="oc-agent-top"><span class="oc-agent-name"><span class="oc-agent-badge">' + initials(a) + '</span>' + escapeHtml(a) + '</span><span class="oc-agent-meta">' + escapeHtml(evo.level.toUpperCase()) + ' • SR ' + sr + '%</span></div><div class="oc-bar ' + bc + '"><i style="width:' + q + '%"></i></div><div class="oc-agent-meta">QUALITY ' + q + '% • TOPIC ' + topics + '</div></div>';
}).join('');
}

function renderPendingRows(req) {
if (!req || !req.length) return '<tr><td colspan="5" class="oc-empty">NO SEALED DIRECTIVES</td></tr>';
return req.slice(0, 20).map(function (r) { return '<tr><td>' + escapeHtml(r.agent) + '</td><td>' + escapeHtml(String(r.prompt || '').substring(0, 26)) + '</td><td>' + (r.retries || 0) + '/' + CONSTANTS.MAX_RETRIES + '</td><td>' + (r.quality || 50) + '</td><td>' + formatAge(r.timestamp) + '</td></tr>'; }).join('');
}

function renderRetryRows(req) {
const rt = (req || []).filter(function (r) { return r.retries > 0; });
if (!rt.length) return '<tr><td colspan="4" class="oc-empty">NO ACTIVE CYCLES</td></tr>';
return rt.slice(0, 20).map(function (r) { const st = r.retries >= CONSTANTS.MAX_RETRIES ? 'TERMINATED' : 'STANDBY'; return '<tr><td>' + escapeHtml(r.agent) + '</td><td>' + (r.retries || 0) + '/' + CONSTANTS.MAX_RETRIES + '</td><td>' + (r.quality || 50) + '</td><td class="' + valClass(st) + '">' + st + '</td></tr>'; }).join('');
}

function renderHealthRows(checks) {
if (!checks || !checks.length) return '<div class="oc-empty">NO INTEGRITY DATA</div>';
return checks.map(function (c) {
const ic = HEALTH_ICON[c.label] || 'activity', vc = valClass(c.detail), icc = c.ok ? 'ok' : (RED_VAL.indexOf(c.detail) !== -1 ? 'err' : 'warn');
return '<div class="oc-hrow"><span class="lbl"><span class="oc-hic ' + icc + '">' + icon(ic) + '</span>' + escapeHtml(c.label) + '</span><b class="' + vc + '">' + escapeHtml(c.detail) + '</b></div>';
}).join('');
}

function renderDiagnosticsRows(items) { if (!items || !items.length) return '<div class="oc-empty">NO NODE READOUT</div>'; return items.map(function (it) { return '<div class="oc-kv"><span>' + escapeHtml(it.label) + '</span><b>' + escapeHtml(it.value) + '</b></div>'; }).join(''); }

function renderTopicStats() {
return Object.keys(DEFAULT_KNOWLEDGE_BASE).slice(0, 6).map(function (t) { const s = getOfflineKnowledge(t).score || 0; return '<div class="oc-topic"><span>' + escapeHtml(t.toUpperCase()) + '</span><i class="oc-topic-bar"><b style="width:' + s + '%"></b></i><em>' + s + '</em></div>'; }).join('');
}

function renderEventTimeline() {
const h = loadOfflineHistory();
if (!h.length) return '<div class="oc-empty--scope"><svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="rgba(0,255,163,.4)" stroke-width="1"><circle cx="23" cy="23" r="11"/><line x1="23" y1="2" x2="23" y2="14"/><line x1="23" y1="32" x2="23" y2="44"/><line x1="2" y1="23" x2="14" y2="23"/><line x1="32" y1="23" x2="44" y2="23"/></svg><span>NO MISSION CHRONICLE</span></div>';
return h.slice(0, 18).map(function (it) { return '<div class="oc-tl-item"><div class="oc-tl-time">' + formatDateTime(it.timestamp) + ' • ' + (it.duration || 0) + 'ms</div><div class="oc-tl-action">' + escapeHtml(it.action) + '</div></div>'; }).join('');
}

function ph(ledId, ledCls, title, sub, pid) {
const led = '<span class="oc-led ' + ledCls + '"' + (ledId ? ' id="' + ledId + '"' : '') + '></span>';
return '<div class="oc-panel-head"><div class="oc-head-left">' + led + '<div class="oc-head-titles"><h4>' + title + '</h4><div class="oc-head-sub">' + sub + '</div></div></div><span class="oc-hbolts"><i></i><i></i></span><span class="oc-panel-id">' + pid + '</span></div>';
}

function ab(action, variant, ic, label, kbd) {
return '<button class="oc-btn ' + (variant || '') + '" data-oc-action="' + action + '">' + icon(ic) + '<span class="oc-btn-t"><span class="oc-btn-l">' + label + '</span>' + (kbd ? '<kbd>' + kbd + '</kbd>' : '') + '</span></button>';
}

function commandCenterHTML() {
const isOnline = isActuallyOnline();
return (
'<div class="oc-command-center" id="ocRoot">' +
'<header class="oc-topbar oc-panel">' +
'<div class="oc-top-left">' +
'<div><div class="oc-logo">KESEMPATAN OS</div><div class="oc-tagline">INTELLIGENCE • OPPORTUNITY • IMPACT</div></div>' +
'</div>' +
'<div class="oc-head-boxes">' +
'<div class="oc-hbox"><span class="oc-hb-l">STATE</span><span class="oc-hb-v" id="ocHeadMode">--</span></div>' +
'<div class="oc-hbox"><span class="oc-hb-l">NODE</span><span class="oc-hb-v">' + escapeHtml(state.nodeID) + '</span></div>' +
'<div class="oc-hbox"><span class="oc-hb-l">MISSION</span><span class="oc-hb-v">' + escapeHtml(state.sessionID) + '</span></div>' +
'<div class="oc-hbox clock"><span class="oc-hb-l">LOCAL TIME</span><span class="oc-hb-v" id="ocHeadClock">--</span></div>' +
'</div>' +
'</header>' +
'<div class="oc-linkbar">' +
'<span class="oc-led warn" id="ocLinkLed"></span>' +
'<span class="oc-link-label" id="ocLinkLabel">--</span>' +
'<span class="oc-link-sub" id="ocLinkSub">--</span>' +
'<button class="oc-btn oc-link-toggle neutral" id="ocLinkToggle" data-oc-action="simulate">' + icon('wifioff') + '<span class="oc-btn-l" id="ocLinkToggleLabel">SEAL GATEWAY</span></button>' +
'</div>' +
renderTabs() +
'<main class="oc-tab-panels">' +
'<section class="oc-panel oc-tab-panel" data-tab="nexus">' + ph('ocConnLed', isOnline ? 'ok' : 'err', 'GATEWAY NEXUS', 'SIGNAL RELAY // OUTER GATEWAY', 'GW-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Operation Mode</span><b id="ocConnMode">--</b></div>' +
'<div class="oc-kv"><span>Gateway State</span><b id="ocConnStatus">--</b></div>' +
'<div class="oc-kv"><span>Last Beacon</span><b id="ocLastOnline">--</b></div>' +
'<div class="oc-kv"><span>Last Continuity</span><b id="ocLastSync">--</b></div>' +
'<div class="oc-kv"><span>Relay State</span><b id="ocSyncStatus">--</b></div>' +
'<div class="oc-kv"><span>Control Channel</span><b>' + getChannel() + '</b></div>' +
'<div class="oc-kv"><span>Mission ID</span><b>' + escapeHtml(state.sessionID) + '</b></div>' +
'<div class="oc-kv"><span>Feed Vector</span><b>' + escapeHtml(state.feedID) + '</b></div>' +
'<div class="oc-kv"><span>Node Registry</span><b>' + escapeHtml(state.nodeID) + '</b></div>' +
'<div class="oc-kv"><span>Mesh Channel</span><b id="ocBroadcastStatus">--</b></div>' +
'<div class="oc-status-foot"><span class="oc-led ok" id="ocStatusLed"></span> CORE INTEGRITY <b id="ocStatusFoot" class="oc-value-ok">ALL SYSTEMS NOMINAL</b></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="engine">' + ph('ocEngineLed', 'ok', 'COGNITIVE ENGINE', 'INTERNAL CORE MATRIX', 'ENG-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Engine State</span><b id="ocEngineStatus">--</b></div>' +
'<div class="oc-kv"><span>Knowledge Source</span><b id="ocSource">--</b></div>' +
'<div class="oc-kv"><span>Core Calibration</span><b id="ocModelQuality">--</b></div>' +
'<div class="oc-bar oc-bar--seg"><i id="ocModelQualityBar" style="width:0%"></i></div>' +
'<div class="oc-kv"><span>Integrity Index</span><b id="ocAccuracy">--</b></div>' +
'<div class="oc-bar cyan"><i id="ocAccuracyBar" style="width:0%"></i></div>' +
'<div class="oc-kv"><span>Mission Success</span><b id="ocSuccessRate">--</b></div>' +
'<div class="oc-kv"><span>Response Latency</span><b id="ocAvgResponse">--</b></div>' +
'<div class="oc-kv"><span>Recall Ratio</span><b id="ocCacheHitRatio">--</b></div>' +
'<div class="oc-kv"><span>Recovery Cycles</span><b id="ocRetryCounter">--</b></div>' +
'<div class="oc-kv"><span>Terminated Missions</span><b id="ocFailedRequests">--</b></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="operative">' + ph('ocAgentLed', 'ok', 'OPERATIVE MATRIX', 'AGENT REGISTRY', 'AGT-01') +
'<div class="oc-panel-body"><div id="ocRecommendation" class="oc-note" style="margin-bottom:8px;"></div><div id="ocAgentGrid"></div></div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="archive">' + ph('ocCacheLed', 'ok', 'MEMORY ARCHIVE', 'LOCAL VAULT // CONTINUITY', 'ARC-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Archive Valid</span><b id="ocCacheValid">--</b></div>' +
'<div class="oc-kv"><span>Archive Total</span><b id="ocCacheTotal">--</b></div>' +
'<div class="oc-kv"><span>Recall Rate</span><b id="ocCacheHit">--</b></div>' +
'<div class="oc-kv"><span>Vault Capacity</span><b>' + CONSTANTS.MAX_CACHE_ITEMS + '</b></div>' +
'<div class="oc-kv"><span>Retention</span><b>24H</b></div>' +
'<div class="oc-sep"></div>' +
'<div class="oc-kv"><span>Vault Load</span><b id="ocStorageUsage">--</b></div>' +
'<div class="oc-bar oc-bar--seg"><i id="ocStorageBar" style="width:0%"></i></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="telemetry">' + ph('ocResourceLed', 'warn', 'CORE TELEMETRY', 'RESOURCE VECTOR', 'RES-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Core Load [' + (navigator.hardwareConcurrency || 4) + ' CORE]</span><b id="ocCpuUsage">--</b></div>' +
'<div class="oc-bar oc-bar--seg warn"><i id="ocCpuBar" style="width:0%"></i></div>' +
'<div class="oc-kv"><span>Heap Vector</span><b id="ocMemoryUsage">--</b></div>' +
'<div class="oc-bar oc-bar--seg cyan"><i id="ocMemoryBar" style="width:0%"></i></div>' +
'<div class="oc-kv"><span>Local Registry</span><b id="ocLocalDb">--</b></div>' +
'<div class="oc-bar oc-bar--seg"><i id="ocDbBar" style="width:0%"></i></div>' +
'<div class="oc-kv"><span>Cipher State</span><b id="ocEncryptionStatus">--</b></div>' +
'<div class="oc-kv"><span>Registry Keys</span><b id="ocStorageKeys">--</b></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="relay">' + ph('ocSyncLed', 'info', 'CONTINUITY RELAY', 'UPLINK // BEACON SYNC', 'UPLINK-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Relay State</span><b id="ocSyncStatus2">--</b></div>' +
'<div class="oc-kv"><span>Pending Transmission</span><b id="ocSyncQueue">--</b></div>' +
'<div class="oc-kv"><span>Last Sync</span><b id="ocSyncLast">--</b></div>' +
'<div class="oc-kv"><span>Mesh Link</span><b id="ocSyncBroadcast">--</b></div>' +
'<div class="oc-kv"><span>Beacon Interval</span><b>300s</b></div>' +
renderScope() +
'<div class="oc-note" style="margin-top:7px;">Sealed directives re-engage the uplink the instant gateway integrity returns.</div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="sealed">' + ph('ocPendingLed', 'warn', 'SEALED REGISTRY', 'MISSION HOLD', 'HOLD-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Sealed Directives</span><b id="ocPendingCount">--</b></div>' +
'<div class="oc-kv"><span>Registry Capacity</span><b>100</b></div>' +
'<div class="oc-sep"></div>' +
'<div style="overflow:auto;max-height:168px;"><table class="oc-table"><thead><tr><th>Operative</th><th>Directive</th><th>Cycle</th><th>Cal</th><th>Age</th></tr></thead><tbody id="ocPendingTable"></tbody></table></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="recovery">' + ph('ocRetryLed', 'warn', 'RECOVERY CYCLES', 'RE-ENGAGEMENT', 'RCY-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>Active Cycles</span><b id="ocRetryCount">--</b></div>' +
'<div class="oc-kv"><span>Cycle Limit</span><b>' + CONSTANTS.MAX_RETRIES + '</b></div>' +
'<div class="oc-kv"><span>Terminated Missions</span><b id="ocFailedRequests2">--</b></div>' +
'<div class="oc-sep"></div>' +
'<div style="overflow:auto;max-height:150px;"><table class="oc-table"><thead><tr><th>Operative</th><th>Cycle</th><th>Cal</th><th>State</th></tr></thead><tbody id="ocRetryTable"></tbody></table></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="integrity">' + ph('ocHealthLed', 'ok', 'CORE INTEGRITY MATRIX', 'CORE VERIFICATION GRID', 'DIAG-01') +
'<div class="oc-panel-body">' +
'<div class="oc-kv"><span>' + icon('heart', 12) + ' Core Integrity</span><b id="ocHealthScore" class="oc-value-ok">--</b></div>' +
'<div id="ocHealthList" style="margin:7px 0;"></div>' +
'<div class="oc-sep"></div>' +
'<div class="oc-micro" style="margin-bottom:5px;">NODE READOUT</div>' +
'<div id="ocDiagnostics"></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="intelligence">' + ph('ocStatsLed', 'ok', 'INTELLIGENCE MATRIX', 'DOMAIN PERFORMANCE', 'AI-01') +
'<div class="oc-panel-body"><div class="oc-two-col">' +
'<div>' +
'<div class="oc-kv"><span>Domain Registry</span><b>' + Object.keys(DEFAULT_KNOWLEDGE_BASE).length + '</b></div>' +
'<div class="oc-kv"><span>Signal Intake</span><b id="ocFeedbackCount">--</b></div>' +
'<div class="oc-kv"><span>Context Continuity</span><b id="ocContextCount">--</b></div>' +
'<div class="oc-kv"><span>Evolved Operatives</span><b id="ocEvolvedCount">--</b></div>' +
'<div class="oc-kv"><span>Core Calibration</span><b id="ocModelQuality2">--</b></div>' +
'<div class="oc-bar oc-bar--seg"><i id="ocModelQualityBar2" style="width:0%"></i></div>' +
'</div>' +
'<div><div class="oc-micro" style="margin-bottom:5px;">SIGNAL VECTOR</div>' + renderSparkline(getSparkValues()) + '<div id="ocTopicStats" style="margin-top:7px;"></div></div>' +
'</div></div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="chronicle">' + ph('', 'ok', 'MISSION CHRONICLE', 'OPERATION ARCHIVE', 'TIM-01') +
'<div class="oc-panel-body"><div class="oc-timeline" id="ocEventTimeline"></div></div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="trace">' + ph('', 'ok', 'OPERATIONAL TRACE', 'RUNTIME LEDGER', 'LOG-01') +
'<div class="oc-panel-body"><div class="oc-console" id="ocActivityLog" style="height:190px;"></div></div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="console">' + ph('', 'ok', 'MISSION CONSOLE', 'DIRECTIVE SHELL', 'CON-01') +
'<div class="oc-panel-body">' +
'<div class="oc-console" id="ocSystemConsole"></div>' +
'<div class="oc-prompt"><span>kes-os@offline:~$</span><span class="cur"></span></div>' +
'<div class="oc-console-input"><input id="ocConsoleInput" placeholder="type directive: help, status, re-engage, transmit, purge" autocomplete="off"/><button class="oc-btn" id="ocConsoleExec" style="min-height:auto;clip-path:none;">EXEC</button></div>' +
'</div>' +
'</section>' +
'<section class="oc-panel oc-tab-panel" data-tab="command">' + ph('', 'ok', 'COMMAND DECK', 'OPERATION MATRIX', 'CTRL-01') +
'<div class="oc-panel-body">' +
'<div class="oc-deck-plate">' +
'<div class="oc-actions">' +
ab('retry', '', 'retry', 'RE-ENGAGE', 'F1') +
ab('sync', 'info', 'sync', 'TRANSMIT', 'F2') +
ab('clear-cache', 'danger', 'trash', 'PURGE ARCHIVE', 'Ctrl+R') +
ab('export', 'warn', 'upload', 'EXPORT ARCHIVE', 'Ctrl+E') +
ab('import', 'warn', 'download', 'IMPORT ARCHIVE', 'Ctrl+I') +
ab('simulate', 'neutral', 'wifioff', 'SEAL GATEWAY', 'F9') +
ab('encrypt', 'danger', 'lock', 'CIPHER TOGGLE', 'Ctrl+L') +
ab('health', '', 'activity', 'INTEGRITY SCAN', '') +
ab('clear-history', 'neutral', 'listx', 'PURGE TRACE', '') +
'</div>' +
'<div class="oc-actions-full">' + ab('clear-console', 'danger', 'x', 'PURGE CONSOLE', 'Ctrl+K') + '</div>' +
'</div>' +
'<div class="oc-note" style="margin-top:9px;">OPERATION PROTOCOL :: execute on core first • seal outbound missions • re-engage relay on gateway integrity • preserve operation trace</div>' +
'</div>' +
'</section>' +
'</main>' +
'<div class="oc-protocol"><span class="tag">OPERATION PROTOCOL</span><span>execute on core first • seal outbound missions • re-engage relay on gateway integrity • preserve operation trace</span></div>' +
'</div>'
);
}

function attachOfflineActions(root) {
root.querySelectorAll('[data-oc-action]').forEach(function (btn) {
btn.addEventListener('click', function (e) { e.stopPropagation(); handleUIAction(this.getAttribute('data-oc-action')); });
});
root.querySelectorAll('.oc-tab').forEach(function (btn) {
btn.addEventListener('click', function (e) { e.stopPropagation(); switchTab(this.getAttribute('data-tab-target')); });
});
const execBtn = root.querySelector('#ocConsoleExec'), input = root.querySelector('#ocConsoleInput');
function execCmd() { if (!input) return; const c = input.value.trim(); if (!c) return; input.value = ''; processCommand(c); }
if (execBtn) execBtn.addEventListener('click', execCmd);
if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') execCmd(); });
}

function handleUIAction(a) {
switch (a) {
case 'retry': retryPendingRequests(); break;
case 'sync': syncOfflineData(); break;
case 'clear-cache': clearOfflineCache(); renderDashboard(); break;
case 'export': exportOfflineCache(); break;
case 'import': triggerImport(); break;
case 'simulate': toggleOfflineSimulation(); break;
case 'encrypt': realTimeEncryptionToggle(); break;
case 'health': runHealthCheck(true); addConsoleLog('INTEGRITY SCAN EXECUTED', 'action', 'DIAG'); updateTelemetry(); break;
case 'clear-history': clearOfflineHistory(); renderDashboard(); break;
case 'clear-console': clearConsoleLogs(); break;
}
}

function processCommand(raw) {
const cmd = String(raw || '').toLowerCase(); addConsoleLog('> ' + raw, 'action', 'CMD');
const parts = cmd.split(/\s+/), name = parts[0];
switch (name) {
case 'help': addConsoleLog('DIRECTIVES: status, re-engage, transmit, purge archive, purge trace, purge console, export, import, seal, cipher, scan, operatives', 'info', 'CMD'); break;
case 'status': { const p = getOfflinePerformance(); addConsoleLog('STATUS :: sealed=' + p.totalOffline + ' hold=' + p.pendingCount + ' success=' + p.successRate + '% calibration=' + p.avgQuality + '% integrity=' + p.accuracy + '%', 'info', 'SYS'); break; }
case 'retry': retryPendingRequests(); break;
case 'sync': syncOfflineData(); break;
case 'clear': if (parts[1] === 'cache') clearOfflineCache(); else if (parts[1] === 'history') clearOfflineHistory(); else if (parts[1] === 'console') clearConsoleLogs(); else addConsoleLog('PURGE WHAT? archive | trace | console', 'warn', 'CMD'); break;
case 'export': exportOfflineCache(); break;
case 'import': triggerImport(); break;
case 'simulate': toggleOfflineSimulation(); break;
case 'encrypt': realTimeEncryptionToggle(); break;
case 'health': runHealthCheck(true); addConsoleLog('INTEGRITY SCAN EXECUTED', 'action', 'CMD'); updateTelemetry(); break;
case 'agents': addConsoleLog(OFFLINE_SAMPLE_AGENTS.map(function (a) { return a + ' :: ' + getOfflineAgentQuality(a) + '%CAL'; }).join(' | '), 'info', 'AI'); break;
default: addConsoleLog('UNKNOWN DIRECTIVE :: ' + name + ' — type help', 'error', 'CMD'); break;
}
}

function renderDashboard() {
const container = document.getElementById('offlineDashboardContainer'); if (!container) return;
const vp = document.getElementById('visualAgentPanel'); if (vp) vp.remove();
container.innerHTML = commandCenterHTML(); attachOfflineActions(container); applyActiveTab();
state.dashboardRendered = true;
state.uiDirty = { console: true, timeline: true, pending: true, health: true, agents: true, stats: true };
updateTelemetry();
}

function updateLinkBar(isOnline, isSim) {
const ll = document.getElementById('ocLinkLabel');
if (ll) {
ll.textContent = isSim ? 'GATEWAY SEALED // SIM' : (isOnline ? 'GATEWAY OPEN // LINKED' : 'GATEWAY SEALED // OFFLINE');
ll.className = 'oc-link-label ' + (isSim ? 'oc-value-warn' : (isOnline ? 'oc-value-ok' : 'oc-value-danger'));
}
setTxt('ocLinkSub', isSim ? 'SIMULATION ENGAGED' : (isOnline ? 'UPLINK ACTIVE' : 'CORE ENGINE ACTIVE'));
setLed('ocLinkLed', isSim ? 'warn' : (isOnline ? 'ok' : 'err'));
const tLab = document.getElementById('ocLinkToggleLabel'); if (tLab) tLab.textContent = isSim ? 'RELEASE SEAL' : 'SEAL GATEWAY';
const tBtn = document.getElementById('ocLinkToggle'); if (tBtn) tBtn.className = 'oc-btn oc-link-toggle ' + (isSim ? 'warn' : 'neutral');
}

function updateTelemetry() {
if (!document.getElementById('ocRoot')) return;
measureLatency(); updateResourceEstimates();
state.scopeBuf.push(state.latencyMs + (state.cpuEstimate / 6)); if (state.scopeBuf.length > 60) state.scopeBuf.shift();
const sl = document.getElementById('ocScopeLine'); if (sl) sl.setAttribute('points', scopePoints());
positionScopeBeacon();
const isOnline = isActuallyOnline(), isSim = state.isSimulating, perf = getOfflinePerformance(), cs = getCacheStats(), db = getLocalDatabaseInfo();
const pending = state.pendingRequests.length, retryActive = state.pendingRequests.filter(function (r) { return r.retries > 0; }).length;
const syncQueue = loadOfflineData().length;
setTxt('ocHeadClock', formatClock());
updateLinkBar(isOnline, isSim);
const hm = document.getElementById('ocHeadMode'); if (hm) { hm.textContent = (isOnline ? 'LINKED' : 'SEALED') + (isSim ? ' // SIM' : ''); hm.className = 'oc-hb-v ' + (isOnline ? 'ok' : (isSim ? 'warn' : 'err')); }
const hs0 = getHealthScore(runHealthCheck(false)); const nom = hs0 >= 75;
setLed('ocConnLed', isOnline ? 'ok' : 'err'); setLed('ocEngineLed', isOnline ? 'ok' : 'warn');
setLed('ocAgentLed', perf.avgQuality >= 60 ? 'ok' : 'warn'); setLed('ocCacheLed', cs.total > 0 ? 'ok' : 'off');
setLed('ocResourceLed', state.cpuEstimate > 75 ? 'err' : state.cpuEstimate > 45 ? 'warn' : 'ok');
setLed('ocPendingLed', pending > 0 ? 'warn' : 'ok'); setLed('ocRetryLed', retryActive > 0 ? 'warn' : 'ok');
setLed('ocSyncLed', isOnline ? 'ok' : 'warn'); setLed('ocHealthLed', nom ? 'ok' : 'warn'); setLed('ocStatsLed', 'ok');
setTxt('ocConnMode', isOnline ? 'GATEWAY OPEN' : 'GATEWAY SEALED');
const conn = document.getElementById('ocConnStatus'); if (conn) { conn.textContent = isOnline ? 'ACTIVE' : 'GATEWAY SEALED'; conn.className = isOnline ? 'oc-value-ok' : 'oc-value-danger'; }
setTxt('ocLastOnline', formatDateTime(state.stats.lastOnline)); setTxt('ocLastSync', formatDateTime(state.lastSync)); setTxt('ocSyncStatus', getSyncStatus());
setTxt('ocBroadcastStatus', state.broadcastChannel ? 'ACTIVE' : 'NULL');
setTxt('ocEngineStatus', getEngineStatus()); setTxt('ocSource', isOnline ? 'NETWORK + ARCHIVE' : 'CORE KB + ARCHIVE');
setNum('ocModelQuality', perf.avgQuality, '%'); setBar('ocModelQualityBar', perf.avgQuality);
setNum('ocModelQuality2', perf.avgQuality, '%'); setBar('ocModelQualityBar2', perf.avgQuality);
setNum('ocAccuracy', perf.accuracy, '%'); setBar('ocAccuracyBar', perf.accuracy);
setNum('ocSuccessRate', perf.successRate, '%'); setNum('ocAvgResponse', perf.avgResponseMs || 0, 'ms');
setNum('ocCacheHitRatio', perf.cacheHitRatio, '%'); setNum('ocRetryCounter', state.stats.retries || 0, '');
setNum('ocFailedRequests', state.stats.failed || 0, ''); setNum('ocFailedRequests2', state.stats.failed || 0, '');
setNum('ocCacheValid', cs.valid, ''); setNum('ocCacheTotal', cs.total, ''); setNum('ocCacheHit', perf.cacheHitRatio, '%');
setNum('ocCpuUsage', state.cpuEstimate, '%'); setBar('ocCpuBar', state.cpuEstimate);
setNum('ocMemoryUsage', state.memEstimate, '%'); setBar('ocMemoryBar', state.memEstimate);
setTxt('ocLocalDb', db.size); setBar('ocDbBar', Math.min(100, db.rawBytes / 60000));
setNum('ocStorageKeys', db.keys, '');
const encEl = document.getElementById('ocEncryptionStatus'); if (encEl) { encEl.textContent = state.encryptionEnabled ? 'ENABLED' : 'DISABLED'; encEl.className = state.encryptionEnabled ? 'oc-value-ok' : 'oc-value-danger'; }
if (state.storageEstimate) { const pct = state.storageEstimate.quota ? Math.round((state.storageEstimate.usage / state.storageEstimate.quota) * 100) : 0; setTxt('ocStorageUsage', formatBytes(state.storageEstimate.usage) + ' / ' + formatBytes(state.storageEstimate.quota)); setBar('ocStorageBar', pct); }
else { setTxt('ocStorageUsage', db.size); setBar('ocStorageBar', Math.min(100, db.rawBytes / 100000)); }
setNum('ocPendingCount', pending, ''); setNum('ocRetryCount', retryActive, '');
if (state.uiDirty.pending) { setHTML('ocPendingTable', renderPendingRows(state.pendingRequests)); setHTML('ocRetryTable', renderRetryRows(state.pendingRequests)); state.uiDirty.pending = false; }
setTxt('ocSyncStatus2', getSyncStatus()); setNum('ocSyncQueue', syncQueue, ''); setTxt('ocSyncLast', formatDateTime(state.lastSync));
setTxt('ocSyncBroadcast', state.broadcastChannel ? 'ACTIVE' : 'NULL');
if (state.uiDirty.agents) { updateAgentQualityDisplay(); updateRealtimeRecommendation(); state.uiDirty.agents = false; }
if (state.uiDirty.stats) { setNum('ocFeedbackCount', countFeedbacks(), ''); setNum('ocContextCount', countContexts(), ''); setNum('ocEvolvedCount', countEvolutions(), ''); setHTML('ocTopicStats', renderTopicStats()); updateSparkline(); state.uiDirty.stats = false; }
if (state.uiDirty.health) { const h = runHealthCheck(false); const hs = getHealthScore(h); setNum('ocHealthScore', hs, '%'); setHTML('ocHealthList', renderHealthRows(h)); setHTML('ocDiagnostics', renderDiagnosticsRows(getLocalDiagnostics())); const sf = document.getElementById('ocStatusFoot'), sl2 = document.getElementById('ocStatusLed'); if (sf) { sf.textContent = nom ? 'ALL SYSTEMS NOMINAL' : 'DEGRADED'; sf.className = nom ? 'oc-value-ok' : 'oc-value-warn'; } if (sl2) sl2.className = 'oc-led ' + (nom ? 'ok' : 'warn'); state.uiDirty.health = false; }
if (state.uiDirty.timeline) { setHTML('ocEventTimeline', renderEventTimeline()); state.uiDirty.timeline = false; }
if (state.uiDirty.console) { updateConsoleOnly(); state.uiDirty.console = false; }
}

function showOfflineAlert(action) { if (!isActuallyOnline()) { addConsoleLog('SEALED ALERT :: ' + action + ' HELD', 'warn', 'NET'); showToast('Gateway disegel! "' + action + '" ditahan hingga gateway terbuka.', 'warning'); saveOfflineHistory('alert_' + action, 0); } }

function toggleOfflineSimulation() {
state.isSimulating = !state.isSimulating; localStorage.setItem(CONSTANTS.SIMULATE_KEY, state.isSimulating ? 'true' : 'false');
if (state.isSimulating) { addConsoleLog('GATEWAY SEAL SIMULATION ENGAGED', 'warn', 'SIM'); showToast('Simulasi seal ON — Gateway disegel!', 'warning'); saveOfflineHistory('simulation_on', 0); }
else { addConsoleLog('GATEWAY SEAL SIMULATION DISENGAGED', 'ok', 'SIM'); showToast('Simulasi seal OFF — Gateway terbuka!', 'success'); saveOfflineHistory('simulation_off', 0); }
updateSidebarStatus(); renderDashboard();
}

function isActuallyOnline() { if (state.isSimulating) return false; return navigator.onLine; }

function hookOfflineMode() {
if (window.AIClients && window.AIClients.generateWithFallback) {
const originalAIClients = window.AIClients;
const original = originalAIClients.generateWithFallback;

async function hookedGenerateWithFallback(prompt, agentName, initialProvider) {
const started = performance.now();
if (!isActuallyOnline()) {
trackOfflineUsage();
const cached = getCachedResponse(agentName, prompt);
if (cached) { trackCacheHit(true); updateOfflineAgentQuality(agentName, 1); updateResponseDuration(performance.now() - started); addConsoleLog('ARCHIVE RECALL :: ' + agentName + ' :: ' + String(prompt || '').substring(0, 42), 'ok', 'AI'); return JSON.stringify(cached); }
trackCacheHit(false); queueRequest(agentName, prompt, initialProvider);
const resp = getSmartFallback(agentName, prompt); if (resp && resp._offlineMeta) resp._offlineMeta.generated = 'ai_internal';
updateResponseDuration(performance.now() - started); addConsoleLog('CORE ENGINE RESPONSE :: ' + agentName + ' :: ' + String(prompt || '').substring(0, 42), 'warn', 'AI'); return JSON.stringify(resp);
}
try {
const result = await original.call(originalAIClients, prompt, agentName, initialProvider);
try { const parsed = JSON.parse(result); if (parsed && !parsed._offlineMeta) { instantSetCachedResponse(agentName, prompt, parsed); updateOfflineAgentQuality(agentName, 2); state.stats.success = (state.stats.success || 0) + 1; saveOfflineStats(); addConsoleLog('UPLINK RESPONSE ARCHIVED :: ' + agentName, 'ok', 'NET'); } } catch (e) {}
updateResponseDuration(performance.now() - started); return result;
} catch (e) {
const resp = getSmartFallback(agentName, prompt); updateOfflineAgentQuality(agentName, -1); state.stats.failed = (state.stats.failed || 0) + 1; saveOfflineStats();
updateResponseDuration(performance.now() - started); addConsoleLog('UPLINK FAULT :: ' + agentName + ' -> CORE FALLBACK', 'error', 'NET'); return JSON.stringify(resp);
}
}

window.AIClients = Object.assign({}, originalAIClients, {
generateWithFallback: hookedGenerateWithFallback,
__originalGenerateWithFallback: original
});
}
}

function hookAIWorkersOffline() {
if (window.AIWorkers && window.AIWorkers.executeWorkerTask) {
const originalAIWorkers = window.AIWorkers;
const original = originalAIWorkers.executeWorkerTask;

async function hookedExecuteWorkerTask(worker) {
if (!isActuallyOnline()) { trackOfflineUsage(); const topic = worker.category || 'general', k = getOfflineKnowledge(topic), q = getOfflineAgentQuality(worker.name || 'Worker'); addConsoleLog('WORKER SEALED :: ' + (worker.name || 'Worker'), 'warn', 'WORKER'); return '[OFFLINE AI] ' + (worker.name || 'Worker') + ': ' + ((k.insights && k.insights[0]) || 'Bekerja dengan data internal.') + ' (skor: ' + (k.score || 55) + '/100, quality: ' + q + '%)'; }
return original.call(originalAIWorkers, worker);
}

window.AIWorkers = Object.assign({}, originalAIWorkers, {
executeWorkerTask: hookedExecuteWorkerTask
});
}
}

function hookLiveCryptoOffline() {
if (window.LiveCrypto && window.LiveCrypto.fetchCryptoPrices) {
const originalLiveCrypto = window.LiveCrypto;
const original = originalLiveCrypto.fetchCryptoPrices;

async function hookedFetchCryptoPrices() {
if (!isActuallyOnline()) {
trackOfflineUsage();
if (originalLiveCrypto.prices && Object.keys(originalLiveCrypto.prices).length > 0) { originalLiveCrypto.updateUI(); addConsoleLog('CRYPTO LAST DATA DISPLAYED', 'info', 'CRYPTO'); showToast('Menampilkan data crypto terakhir', 'info'); }
else { originalLiveCrypto.prices = { bitcoin: { usd: 60000, idr: 960000000, name: 'Bitcoin', symbol: 'BTC' }, ethereum: { usd: 3000, idr: 48000000, name: 'Ethereum', symbol: 'ETH' }, solana: { usd: 150, idr: 2400000, name: 'Solana', symbol: 'SOL' }, dogecoin: { usd: 0.1, idr: 1600, name: 'Dogecoin', symbol: 'DOGE' }, cardano: { usd: 0.3, idr: 4800, name: 'Cardano', symbol: 'ADA' }, ripple: { usd: 0.5, idr: 8000, name: 'Ripple', symbol: 'XRP' } }; originalLiveCrypto.updateUI(); addConsoleLog('CRYPTO DEFAULT DATA LOADED', 'info', 'CRYPTO'); showToast('Menampilkan data crypto default', 'info'); }
return;
}
return original.call(originalLiveCrypto);
}

window.LiveCrypto = Object.assign({}, originalLiveCrypto, {
fetchCryptoPrices: hookedFetchCryptoPrices
});
}
}

function notifyOnline() {
if (Notification.permission === 'granted') new Notification('KESEMPATAN OS', { body: 'Gateway terbuka // LINKED. Siap melanjutkan operasi.', icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2300FFA3"/%3E%3Ctext x="50" y="68" font-size="50" text-anchor="middle" fill="%2303050A"%3EK%3C/text%3E%3C/svg%3E' });
addConsoleLog('OUTER GATEWAY REOPENED', 'ok', 'NET'); showToast('Gateway terbuka // LINKED', 'success');
if (state.pendingRequests.length > 0) retryPendingRequests(); setTimeout(syncOfflineData, 1000);
renderDashboard(); saveOfflineHistory('gateway_open', 0); trackOnlineStatus();
}

function notifyOffline() { addConsoleLog('OUTER GATEWAY SEALED', 'error', 'NET'); showToast('Gateway disegel // CORE ENGINE aktif', 'warning'); trackOfflineUsage(); renderDashboard(); saveOfflineHistory('gateway_sealed', 0); }

function initConnectionDetection() {
window.addEventListener('online', function () { if (!state.isSimulating) { state.isOnline = true; updateSidebarStatus(); applyOfflineTheme(); notifyOnline(); renderDashboard(); saveOfflineHistory('gateway_open', 0); } });
window.addEventListener('offline', function () { if (!state.isSimulating) { state.isOnline = false; updateSidebarStatus(); applyOfflineTheme(); notifyOffline(); renderDashboard(); saveOfflineHistory('gateway_sealed', 0); } });
}

function injectOfflineStyles() { let s = document.getElementById('offlineStyle'); if (!s) { s = document.createElement('style'); s.id = 'offlineStyle'; document.head.appendChild(s); } s.textContent = OC_CSS; }

function init() {
injectOfflineStyles(); initIdentity();
loadConsoleLogs(); loadCacheMetrics(); loadOfflineCache(); loadPendingRequests(); loadOfflineStats();
loadOfflineContexts(); loadOfflineFeedback(); loadOfflineQualities(); loadOfflineKnowledge(); loadOfflineEvolutions();
hookOfflineMode(); hookAIWorkersOffline(); hookLiveCryptoOffline();
initConnectionDetection(); initBroadcastChannel(); setupInstantRetry();
updateSidebarStatus(); applyOfflineTheme(); updateCacheDisplay(); updatePendingCounter();
runHealthCheck(true);
addConsoleLog('CORE MATRIX ONLINE :: KESEMPATAN OS COMMAND NEXUS', 'ok', 'SYS');
addConsoleLog('BUILD ' + getBuild() + ' :: NODE ' + state.nodeID, 'info', 'SYS');
addConsoleLog('NODE REGISTRY MOUNTED', 'ok', 'SYS');
addConsoleLog('LOCAL VAULT MOUNTED', 'ok', 'ARC');
addConsoleLog('CIPHER ENGINE STANDBY', 'info', 'SEC');
addConsoleLog('CONTROL LINE STABILIZED', 'ok', 'SYS');
setTimeout(startTelemetry, 500); requestAnimationFrame(fpsLoop);
setInterval(function () { if (isActuallyOnline()) syncOfflineData(); }, CONSTANTS.SYNC_INTERVAL);
setInterval(updateRealtimeRecommendation, CONSTANTS.RECOMMENDATION_INTERVAL);
document.addEventListener('visibilitychange', function () {
if (document.hidden) { if (state.telemetryInterval) { clearInterval(state.telemetryInterval); state.telemetryInterval = null; } }
else if (!state.telemetryInterval) { startTelemetry(); }
});
}

function renderFullPage(container) {
if (!container) return;
container.innerHTML = '<div class="oc-page"><div id="offlineDashboardContainer"></div></div>';
setTimeout(function () { renderDashboard(); startTelemetry(); }, 120);
}

window.renderOfflinePage = function () { const inner = document.getElementById('premiumPageInner'); if (inner) renderFullPage(inner); };

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.OfflineMode = Object.freeze({
renderFullPage: renderFullPage,
isOnline: isActuallyOnline,
getCache: function () { return state.offlineCache; },
getCacheStats: getCacheStats,
clearCache: clearOfflineCache,
exportCache: exportOfflineCache,
importCache: importOfflineCache,
getPending: function () { return state.pendingRequests; },
getStats: getOfflineStats,
getPerformance: getOfflinePerformance,
getHistory: loadOfflineHistory,
clearHistory: clearOfflineHistory,
retryPending: retryPendingRequests,
syncData: syncOfflineData,
renderDashboard: renderDashboard,
toggleSimulation: toggleOfflineSimulation,
isSimulating: function () { return state.isSimulating; },
getQuality: getOfflineAgentQuality,
getFeedback: function () { return state.feedbacks; },
recordFeedback: recordOfflineFeedback,
getContext: getOfflineContext,
getEvolution: getAgentEvolution,
predictPerformance: predictOfflinePerformance,
getRecommendation: getOfflineAgentRecommendation,
toggleEncryption: realTimeEncryptionToggle,
isEncryptionEnabled: function () { return state.encryptionEnabled; },
getBroadcastStatus: function () { return state.broadcastChannel !== null; },
updateRealtimeRecommendation: updateRealtimeRecommendation,
startDashboard: startTelemetry,
stopDashboard: function () { if (state.telemetryInterval) { clearInterval(state.telemetryInterval); state.telemetryInterval = null; } if (state.dashboardInterval) { clearInterval(state.dashboardInterval); state.dashboardInterval = null; } },
getKnowledgeBase: function () { return state.offlineKnowledge; },
extractTopic: extractTopic,
showAlert: showOfflineAlert,
getConsoleLogs: function () { return state.consoleLogs; },
clearConsoleLogs: clearConsoleLogs,
runHealthCheck: runHealthCheck,
getDiagnostics: getLocalDiagnostics,
switchTab: switchTab,
getActiveTab: function () { return state.activeTab; }
});

window.OfflineMode = {
renderFullPage: renderFullPage, isOnline: isActuallyOnline,
getCache: function () { return state.offlineCache; }, getCacheStats: getCacheStats, clearCache: clearOfflineCache, exportCache: exportOfflineCache, importCache: importOfflineCache,
getPending: function () { return state.pendingRequests; }, getStats: getOfflineStats, getPerformance: getOfflinePerformance,
getHistory: loadOfflineHistory, clearHistory: clearOfflineHistory, retryPending: retryPendingRequests, syncData: syncOfflineData,
renderDashboard: renderDashboard, toggleSimulation: toggleOfflineSimulation, isSimulating: function () { return state.isSimulating; },
getQuality: getOfflineAgentQuality, getFeedback: function () { return state.feedbacks; }, recordFeedback: recordOfflineFeedback,
getContext: getOfflineContext, getEvolution: getAgentEvolution, predictPerformance: predictOfflinePerformance, getRecommendation: getOfflineAgentRecommendation,
toggleEncryption: realTimeEncryptionToggle, isEncryptionEnabled: function () { return state.encryptionEnabled; },
getBroadcastStatus: function () { return state.broadcastChannel !== null; },
updateRealtimeRecommendation: updateRealtimeRecommendation, startDashboard: startTelemetry,
stopDashboard: function () { if (state.telemetryInterval) { clearInterval(state.telemetryInterval); state.telemetryInterval = null; } if (state.dashboardInterval) { clearInterval(state.dashboardInterval); state.dashboardInterval = null; } },
getKnowledgeBase: function () { return state.offlineKnowledge; }, extractTopic: extractTopic, showAlert: showOfflineAlert,
getConsoleLogs: function () { return state.consoleLogs; }, clearConsoleLogs: clearConsoleLogs, runHealthCheck: runHealthCheck, getDiagnostics: getLocalDiagnostics,
switchTab: switchTab, getActiveTab: function () { return state.activeTab; }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 100);
})();
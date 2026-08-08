(function() {
'use strict';
if (window.__VoiceCloneUILayout) return;
window.__VoiceCloneUILayout = true;

const config = window.VoiceCloneConfig;
if (!config) return;

const LANGUAGES = config.LANGUAGES;
const VOICE_CONFIG = config.VOICE_CONFIG;
const THEMES = config.THEMES;

const V_CSS = ':root{--v-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--v-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--v-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} .v-wrap{box-sizing:border-box;padding:4px 12px 16px;} .v-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;} .v-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary,#00FFA3);text-shadow:0 0 10px rgba(0,255,163,.35);} .v-sub{font-size:10px;color:#A0B3C9;margin-top:4px;} .v-btnrow{display:flex;gap:6px;flex-wrap:wrap;} .v-btn{position:relative;isolation:isolate;clip-path:var(--v-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:8px 14px;color:var(--primary,#00FFA3);font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .v-btn::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-asym);background:#06100b;z-index:-1;} .v-btn:active{transform:scale(.97);} .v-btn.gold{background:rgba(255,215,0,.45);color:#FFE27A;} .v-btn.gold::before{background:#171202;} .v-btn.warm{background:linear-gradient(135deg,#FF6B6B,#ee5a24);color:#fff;} .v-btn.warm::before{display:none;} .v-btn.cyan{background:rgba(0,255,255,.4);color:#7EE9EC;} .v-btn.cyan::before{background:#021616;} .v-btn.purple{background:rgba(155,89,182,.5);color:#fff;} .v-btn.purple::before{display:none;} .v-btn.danger{background:rgba(255,68,68,.5);color:#FF8080;} .v-btn.danger::before{background:#160608;} .v-btn.primary{background:linear-gradient(135deg,var(--primary,#00FFA3),#00AA6E);color:#03130b;} .v-btn.primary::before{display:none;} .v-tiles{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;} .v-tile{position:relative;isolation:isolate;clip-path:var(--v-clip-sm);background:rgba(26,255,156,.25);padding:1px;flex:1 1 100px;} .v-tile::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-sm);background:#05080c;z-index:-1;} .v-tile-in{display:block;padding:6px 10px;} .v-tile-lbl{display:block;font-size:8px;color:#666;} .v-tile-val{display:block;font-size:11px;color:var(--primary,#00FFA3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .v-tile-val.gold{color:#FFD700;} .v-cols{display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-bottom:14px;} .v-panel{position:relative;isolation:isolate;clip-path:var(--v-clip);background:rgba(26,255,156,.25);padding:1px;} .v-panel::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip);background:#05080c;z-index:-1;} .v-panel-in{display:block;padding:12px 14px;} .v-panel-title{font-size:12px;font-weight:800;letter-spacing:.5px;color:#FFD700;text-shadow:0 0 8px rgba(255,215,0,.3);margin-bottom:10px;} .v-presets{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px;} .v-preset{position:relative;isolation:isolate;clip-path:var(--v-clip-sm);background:rgba(26,255,156,.3);padding:1px;transition:background .25s ease,transform .15s ease;} .v-preset::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-sm);background:#07130d;z-index:-1;} .v-preset.active{background:var(--primary,#00FFA3);} .v-preset.active::before{background:var(--primary,#00FFA3);} .v-preset-btn{display:block;width:100%;background:transparent;border:0;color:#A0B3C9;padding:8px 4px 6px;cursor:pointer;text-align:center;font-size:8px;} .v-preset.active .v-preset-btn{color:#03130b;font-weight:800;} .v-preset-ico{display:block;font-size:14px;} .v-preset-lbl{display:block;margin-top:2px;} .v-favorite{position:absolute;top:3px;right:3px;z-index:2;background:rgba(0,0,0,.35);border:0;border-radius:50%;width:16px;height:16px;color:#666;cursor:pointer;font-size:9px;display:flex;align-items:center;justify-content:center;} .v-favorite.fav{color:#FFD700;} .v-lblrow{display:flex;justify-content:space-between;font-size:9px;color:#A0B3C9;margin-bottom:4px;} .v-lblrow .val{color:var(--primary,#00FFA3);} .v-lblrow .val.gold{color:#FFD700;} .v-range{-webkit-appearance:none;appearance:none;display:block;width:100%;height:16px;margin:0 0 10px;padding:0;border:0;border-radius:0;background:transparent;outline:none;cursor:pointer;} .v-range::-webkit-slider-runnable-track{height:16px;border:0;border-radius:0;clip-path:var(--v-clip-sm);background:linear-gradient(to right,var(--primary,#00FFA3),#00AA6E);} .v-range::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;width:16px;height:16px;margin-top:0;border-radius:50%;background:var(--primary,#00FFA3);border:2px solid #03050A;box-shadow:0 0 8px rgba(0,255,163,.35);cursor:pointer;} .v-range::-moz-range-track{height:16px;border:0;border-radius:0;clip-path:var(--v-clip-sm);background:linear-gradient(to right,var(--primary,#00FFA3),#00AA6E);} .v-range::-moz-range-thumb{box-sizing:border-box;width:16px;height:16px;border-radius:50%;background:var(--primary,#00FFA3);border:2px solid #03050A;} .v-speedrow{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;} .v-speed-preset{position:relative;isolation:isolate;clip-path:var(--v-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.3);padding:3px 8px;color:#9fb8ac;font-size:7px;cursor:pointer;} .v-speed-preset::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-asym);background:#06100b;z-index:-1;} .v-speed-preset.active{background:var(--primary,#00FFA3);color:#03130b;font-weight:800;} .v-speed-preset.active::before{background:var(--primary,#00FFA3);} .v-rim{position:relative;isolation:isolate;clip-path:var(--v-clip-sm);background:rgba(26,255,156,.3);padding:1px;display:block;margin-bottom:10px;} .v-rim::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-sm);background:#05080c;z-index:-1;} .v-rim select,.v-rim input{display:block;width:100%;box-sizing:border-box;background:transparent;border:0;border-radius:0;color:#E0E6ED;padding:8px 10px;font-size:10px;outline:none;margin:0;} .v-wave{position:relative;isolation:isolate;clip-path:var(--v-clip);background:rgba(26,255,156,.25);padding:1px;margin-bottom:14px;} .v-wave::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip);background:#05080c;z-index:-1;} .v-wave:empty{display:none;} .v-wave canvas{display:block;width:100%;} .v-testrow{display:flex;gap:8px;flex-wrap:wrap;} .v-testrow .v-rim{flex:2 1 180px;margin-bottom:0;} .v-testrow .v-btn{flex:1 1 90px;} .v-ssml{display:inline-flex;align-items:center;gap:8px;font-size:9px;color:#A0B3C9;cursor:pointer;} .v-langs{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;} .v-lang{position:relative;isolation:isolate;clip-path:var(--v-clip-sm);border:0;border-radius:0;background:rgba(26,255,156,.3);padding:1px;cursor:pointer;text-align:center;font-size:9px;color:#E0E6ED;} .v-lang::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-sm);background:#07130d;z-index:-1;} .v-lang-in{display:block;padding:7px 2px;} .v-lang.active{background:var(--primary,#00FFA3);} .v-lang.active::before{background:var(--primary,#00FFA3);} .v-lang.active .v-lang-in{color:#03130b;font-weight:800;} .v-clone{position:relative;isolation:isolate;clip-path:var(--v-clip);background:rgba(155,89,182,.4);padding:1px;margin-bottom:14px;} .v-clone::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip);background:#0b0713;z-index:-1;} .v-clone-in{display:block;padding:12px 14px;} .v-clone-title{font-size:12px;font-weight:800;color:#9B59B6;text-shadow:0 0 8px rgba(155,89,182,.4);} .v-premium{background:linear-gradient(135deg,#9B59B6,#8E44AD);padding:2px 8px;clip-path:var(--v-clip-sm);font-size:8px;color:#fff;margin-left:6px;} .v-clone-empty{text-align:center;padding:14px;background:rgba(0,0,0,.2);clip-path:var(--v-clip-sm);font-size:11px;color:#666;margin-top:10px;} .v-clone-chip{position:relative;isolation:isolate;clip-path:var(--v-clip-asym);background:rgba(26,255,156,.25);padding:1px;display:inline-flex;margin:0 6px 6px 0;} .v-clone-chip::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-asym);background:#05080c;z-index:-1;} .v-clone-chip-in{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;font-size:11px;color:#E0E6ED;} .v-chip-btn{background:rgba(0,255,163,.15);border:none;clip-path:var(--v-clip-sm);padding:2px 8px;color:var(--primary,#00FFA3);cursor:pointer;font-size:9px;} .v-chip-btn.use{background:rgba(0,255,163,.1);border:1px solid rgba(0,255,163,.2);color:#A0B3C9;} .v-chip-btn.use.on{background:rgba(0,255,163,.3);border-color:var(--primary,#00FFA3);color:var(--primary,#00FFA3);} .v-chip-del{background:none;border:none;color:#ff4444;cursor:pointer;font-size:12px;} .v-chatrow{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;} .v-chatrow .v-rim{flex:1;min-width:120px;margin-bottom:0;} .v-msgs{position:relative;isolation:isolate;clip-path:var(--v-clip-sm);background:rgba(26,255,156,.2);padding:1px;margin-bottom:8px;} .v-msgs::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip-sm);background:#05080c;z-index:-1;} .v-msgs-in{display:block;height:120px;overflow-y:auto;padding:10px;font-size:11px;color:#A0B3C9;} .v-status{font-size:10px;color:#A0B3C9;} .v-hist{position:relative;isolation:isolate;clip-path:var(--v-clip);background:rgba(26,255,156,.2);padding:1px;margin-bottom:14px;} .v-hist::before{content:"";position:absolute;inset:1px;clip-path:var(--v-clip);background:#05080c;z-index:-1;} .v-hist-in{display:block;padding:12px 14px;} .v-hist-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;} .v-hist-title{font-size:11px;font-weight:800;color:#A0B3C9;} .v-hist-x{background:none;border:none;color:#ff4444;cursor:pointer;font-size:12px;} .v-foot{font-size:9px;color:#444;text-align:center;margin-top:8px;} @media (max-width:768px){.v-cols{grid-template-columns:1fr;}.v-langs{grid-template-columns:repeat(3,1fr);}.v-testrow .v-rim{flex:1 1 100%;}} @media (hover:hover) and (pointer:fine){ .v-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} .v-preset:hover{background:rgba(26,255,156,.5);} .v-preset.active:hover{background:var(--primary,#00FFA3);} .v-lang:hover{background:rgba(26,255,156,.5);} .v-lang.active:hover{background:var(--primary,#00FFA3);} }';

function injectCSS() {
if (document.getElementById('voiceCloneStyle')) return;
const s = document.createElement('style');
s.id = 'voiceCloneStyle';
s.textContent = V_CSS;
document.head.appendChild(s);
}

function buildVoiceLayout(state) {
injectCSS();
const t = THEMES[state.currentTheme] || THEMES.dark;
const presets = VOICE_CONFIG.presets;
const bgMusic = VOICE_CONFIG.bgMusic;
const speedPresets = VOICE_CONFIG.speedPresets;
const clones = state.clones || [];
const activeCloneId = state.activeCloneId || null;
const settings = state.settings || VOICE_CONFIG.defaults;
const totalPresets = Object.keys(presets).length;
const totalLangs = Object.keys(LANGUAGES).length;
const totalHistory = (state.history || []).length;
const favorites = state.favorites || [];

let html = '<div class="v-wrap">';
html += '<div class="v-head"><div><div class="v-title">VOICE & CLONE</div><div class="v-sub">' + totalPresets + ' Karakter • ' + totalLangs + ' Bahasa • AI Internal</div></div>' +
'<div class="v-btnrow">' +
'<button id="vThemeBtn" class="v-btn">' + (state.currentTheme === 'dark' ? 'Light' : 'Dark') + '</button>' +
'<button id="vExportBtn" class="v-btn">Backup</button>' +
'<button id="vImportBtn" class="v-btn gold">Restore</button>' +
'<button id="vBackBtn" class="v-btn">← Kembali</button>' +
'</div></div>';

html += '<div class="v-tiles">' +
'<span class="v-tile"><span class="v-tile-in"><span class="v-tile-lbl">Suara</span><span class="v-tile-val">' + (activeCloneId ? 'Clone' : ((presets[settings.preset] && presets[settings.preset].name) || 'Profesional')) + '</span></span></span>' +
'<span class="v-tile"><span class="v-tile-in"><span class="v-tile-lbl">Bahasa</span><span class="v-tile-val gold">' + ((LANGUAGES[settings.language] && LANGUAGES[settings.language].name) || 'Indonesia') + '</span></span></span>' +
'<span class="v-tile"><span class="v-tile-in"><span class="v-tile-lbl">Speed</span><span class="v-tile-val">' + settings.rate + 'x</span></span></span>' +
'<span class="v-tile"><span class="v-tile-in"><span class="v-tile-lbl">Efek</span><span class="v-tile-val gold">' + (settings.effect || 'None') + '</span></span></span>' +
'<span class="v-tile"><span class="v-tile-in"><span class="v-tile-lbl">Favorit</span><span class="v-tile-val gold">' + favorites.length + '</span></span></span>' +
'</div>';

html += '<div class="v-cols">';
html += '<div class="v-panel"><span class="v-panel-in"><div class="v-panel-title">KARAKTER (' + totalPresets + ')</div>' +
'<div style="font-size:8px;color:#666;margin-bottom:8px;">☆ Klik bintang untuk favorit</div>' +
'<div class="v-presets">';
for (const id in presets) {
const p = presets[id];
const isActive = settings.preset === id && !activeCloneId;
const isFav = favorites.indexOf(id) !== -1;
const icon = p.name.split(' ')[0];
const label = p.name.split(' ').slice(1).join(' ') || p.name;
html += '<div class="v-preset' + (isActive ? ' active' : '') + '" data-id="' + id + '">' +
'<button class="v-preset-btn" type="button"><span class="v-preset-ico">' + icon + '</span><span class="v-preset-lbl">' + label + '</span></button>' +
'<button class="v-favorite' + (isFav ? ' fav' : '') + '" data-id="' + id + '" type="button">' + (isFav ? '★' : '☆') + '</button></div>';
}
html += '</div></span></div>';

html += '<div class="v-panel"><span class="v-panel-in"><div class="v-panel-title">SETTINGS</div>' +
'<div class="v-lblrow"><span>Kecepatan ([ ] shortcut)</span><span class="val" id="vRate">' + settings.rate + 'x</span></div>' +
'<input type="range" id="vRateSlider" class="v-range" min="0.5" max="2" step="0.05" value="' + settings.rate + '">' +
'<div class="v-speedrow">';
for (const sid in speedPresets) {
html += '<button class="v-speed-preset' + (state.speedPreset === sid ? ' active' : '') + '" data-id="' + sid + '">' + speedPresets[sid].name + '</button>';
}
html += '</div>' +
'<div class="v-lblrow"><span>Nada</span><span class="val" id="vPitch">' + settings.pitch + 'x</span></div>' +
'<input type="range" id="vPitchSlider" class="v-range" min="0.5" max="2" step="0.05" value="' + settings.pitch + '">' +
'<div class="v-lblrow"><span>Volume</span><span class="val" id="vVol">' + Math.round(settings.volume * 100) + '%</span></div>' +
'<input type="range" id="vVolSlider" class="v-range" min="0" max="1" step="0.05" value="' + settings.volume + '">' +
'<div class="v-lblrow"><span>Efek</span><span class="val gold" id="vEffectLabel">' + (settings.effect || 'None') + '</span></div>' +
'<span class="v-rim"><select id="vEffectSelect">' +
'<option value="none"' + (settings.effect === 'none' ? ' selected' : '') + '>None</option>' +
'<option value="robot"' + (settings.effect === 'robot' ? ' selected' : '') + '>Robot</option>' +
'<option value="echo"' + (settings.effect === 'echo' ? ' selected' : '') + '>Echo</option>' +
'<option value="reverb"' + (settings.effect === 'reverb' ? ' selected' : '') + '>Reverb</option>' +
'<option value="chipmunk"' + (settings.effect === 'chipmunk' ? ' selected' : '') + '>Chipmunk</option>' +
'<option value="demon"' + (settings.effect === 'demon' ? ' selected' : '') + '>Demon</option>' +
'<option value="angel"' + (settings.effect === 'angel' ? ' selected' : '') + '>Angel</option>' +
'</select></span>' +
'<div class="v-lblrow"><span>BGM</span><span class="val gold" id="vBgmLabel">' + ((bgMusic[settings.bgMusic] && bgMusic[settings.bgMusic].name) || 'Off') + '</span></div>' +
'<span class="v-rim"><select id="vBgmSelect">';
for (const bid in bgMusic) {
html += '<option value="' + bid + '"' + (settings.bgMusic === bid ? ' selected' : '') + '>' + bgMusic[bid].name + '</option>';
}
html += '</select></span>' +
'<label class="v-ssml"><input type="checkbox" id="vSsml"' + (settings.ssml ? ' checked' : '') + ' style="accent-color:var(--primary,#00FFA3);width:16px;height:16px;margin:0;"> SSML</label>' +
'</span></div></div>';

html += '<div id="waveformContainer" class="v-wave"></div>';

html += '<div class="v-panel" style="margin-bottom:14px;"><span class="v-panel-in"><div class="v-panel-title" style="color:var(--primary,#00FFA3);text-shadow:0 0 8px rgba(0,255,163,.3);">TEST & EXPORT MP3</div>' +
'<div class="v-testrow"><span class="v-rim"><input id="voiceTestText" type="text" placeholder="Teks test..." value="Halo! Ini adalah test suara dari KESEMPATAN OS."></span>' +
'<button id="vTestBtn" class="v-btn">Test</button>' +
'<button id="vExportMP3Btn" class="v-btn warm">Export MP3</button>' +
'<button id="vShareBtn" class="v-btn cyan">Share</button></div>' +
'</span></div>';

html += '<div class="v-panel" style="margin-bottom:14px;"><span class="v-panel-in"><div class="v-panel-title">BAHASA (' + totalLangs + ')</div><div class="v-langs">';
for (const code in LANGUAGES) {
html += '<button class="v-lang' + (settings.language === code ? ' active' : '') + '" data-code="' + code + '"><span class="v-lang-in">' + LANGUAGES[code].name + '</span></button>';
}
html += '</div></span></div>';

html += '<div class="v-clone"><span class="v-clone-in">' +
'<div style="display:flex;align-items:center;margin-bottom:10px;"><span class="v-clone-title">VOICE CLONE</span><span class="v-premium">PREMIUM</span><span style="font-size:10px;color:#666;margin-left:8px;">' + clones.length + '/5</span></div>' +
'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">' +
'<button id="vRecordBtn" class="v-btn purple">REKAM SUARA</button>' +
'<span id="cloneStatus" style="font-size:10px;color:#A0B3C9;"></span></div>' +
(activeCloneId ? '<button id="vClearCloneBtn" class="v-btn danger" style="margin-bottom:10px;">Kembali ke Default</button>' : '');
if (clones.length > 0) {
html += '<div style="display:flex;flex-wrap:wrap;">';
for (let i = 0; i < clones.length; i++) {
const c = clones[i];
const isOn = activeCloneId == c.id;
html += '<span class="v-clone-chip"><span class="v-clone-chip-in">' +
'<span style="' + (isOn ? 'color:var(--primary,#00FFA3);font-weight:bold;' : '') + '">' + (window.VoiceCloneCore && window.VoiceCloneCore.sanitizeHtml ? window.VoiceCloneCore.sanitizeHtml(c.name) : c.name) + '</span>' +
'<button class="v-chip-btn v-play-clone" data-id="' + c.id + '">Play</button>' +
'<button class="v-chip-btn use v-use-clone' + (isOn ? ' on' : '') + '" data-id="' + c.id + '">' + (isOn ? '✓' : 'Pakai') + '</button>' +
'<button class="v-chip-del v-del-clone" data-id="' + c.id + '">✕</button>' +
'</span></span>';
}
html += '</div>';
} else {
html += '<div class="v-clone-empty">Belum ada suara clone. Klik REKAM SUARA!</div>';
}
html += '</span></div>';

html += '<div class="v-panel" style="margin-bottom:14px;"><span class="v-panel-in">' +
'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><span class="v-panel-title" style="margin-bottom:0;">LIVE VOICE CHAT</span><span class="v-premium">AI INTERNAL</span></div>' +
'<div class="v-chatrow"><span class="v-rim"><select id="liveVoiceAgent">' +
'<option value="RahmadRaharjo">Rahmad Raharjo</option><option value="Manager">Manager</option>' +
'<option value="StartupFounder">StartupFounder</option><option value="DevilsAdvocate">DevilsAdvocate</option>' +
'<option value="SundanyaAsep">Sundanya Asep</option></select></span>' +
'<button id="vChatStartBtn" class="v-btn primary">Mulai Bicara</button>' +
'<button id="vStopSpeakingBtn" class="v-btn danger">Stop Suara</button></div>' +
'<span class="v-msgs"><span class="v-msgs-in"><div id="liveVoiceMessages"><div style="color:#A0B3C9;text-align:center;">Klik Mulai Bicara, ngobrol dengan agen AI Internal!</div></div></span></span>' +
'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;"><span id="liveVoiceStatus" class="v-status">Klik Mulai Bicara</span></div>' +
'</span></div>';

html += '<div class="v-hist"><span class="v-hist-in">' +
'<div class="v-hist-head"><span class="v-hist-title">RIWAYAT SUARA (' + totalHistory + ')</span><button id="vClearHistoryBtn" class="v-hist-x">✕</button></div>' +
'<div id="voiceHistoryContainer" style="max-height:150px;overflow-y:auto;"></div>' +
'</span></div>';

html += '<div class="v-foot">KESEMPATAN OS • Voice & Clone</div>';
html += '</div>';
return html;
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VoiceLayout = { buildVoiceLayout: buildVoiceLayout, injectCSS: injectCSS };
window.VoiceCloneUILayout = { buildVoiceLayout: buildVoiceLayout, injectCSS: injectCSS };
})();
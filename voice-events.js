(function() {
'use strict';
if (window.__VoiceCloneEvents) return;
window.__VoiceCloneEvents = true;

const state = window.VoiceCloneState;
const core = window.VoiceCloneCore;
const renderer = window.VoiceCloneRenderer;
const visualizer = window.VoiceCloneVisualizer;
const showToast = window.Utils?.showToast || function() {};
const VOICE_CONFIG = window.VoiceCloneConfig.VOICE_CONFIG;
const LANGUAGES = window.VoiceCloneConfig.LANGUAGES;

const attachEvents = function(container) {
if (!container) return;

container.querySelectorAll('.v-preset').forEach(function(btn) {
btn.addEventListener('click', function() {
if (state.getActiveCloneId()) state.setActiveCloneId(null);
const settings = state.getSettings();
settings.preset = btn.dataset.id;
state.setSettings(settings);
state.save();
renderer.render();
if (showToast) showToast(VOICE_CONFIG.presets[settings.preset].name, 'success');
});
});

container.querySelectorAll('.v-favorite').forEach(function(btn) {
btn.addEventListener('click', function(e) {
e.stopPropagation();
core.toggleFavorite(btn.dataset.id);
});
});

container.querySelectorAll('.v-lang').forEach(function(btn) {
btn.addEventListener('click', function() {
const settings = state.getSettings();
settings.language = btn.dataset.code;
state.setSettings(settings);
state.save();
renderer.render();
if (showToast) showToast(LANGUAGES[settings.language].name, 'success');
});
});

container.querySelectorAll('.v-speed-preset').forEach(function(btn) {
btn.addEventListener('click', function() {
core.applySpeedPreset(btn.dataset.id);
renderer.render();
});
});

const rateSlider = container.querySelector('#vRateSlider');
if (rateSlider) {
rateSlider.addEventListener('input', function(e) {
const settings = state.getSettings();
settings.rate = parseFloat(e.target.value);
state.setSettings(settings);
state.setSpeedPreset('normal');
const label = container.querySelector('#vRate');
if (label) label.textContent = settings.rate + 'x';
state.save();
});
}

const pitchSlider = container.querySelector('#vPitchSlider');
if (pitchSlider) {
pitchSlider.addEventListener('input', function(e) {
const settings = state.getSettings();
settings.pitch = parseFloat(e.target.value);
state.setSettings(settings);
const label = container.querySelector('#vPitch');
if (label) label.textContent = settings.pitch + 'x';
state.save();
});
}

const volSlider = container.querySelector('#vVolSlider');
if (volSlider) {
volSlider.addEventListener('input', function(e) {
const settings = state.getSettings();
settings.volume = parseFloat(e.target.value);
state.setSettings(settings);
const label = container.querySelector('#vVol');
if (label) label.textContent = Math.round(settings.volume * 100) + '%';
state.save();
});
}

const effectSelect = container.querySelector('#vEffectSelect');
if (effectSelect) {
effectSelect.addEventListener('change', function(e) {
const settings = state.getSettings();
settings.effect = e.target.value;
state.setSettings(settings);
const label = container.querySelector('#vEffectLabel');
if (label) label.textContent = settings.effect || 'None';
state.save();
renderer.render();
if (showToast) showToast('Efek: ' + (settings.effect || 'None'), 'info');
});
}

const bgmSelect = container.querySelector('#vBgmSelect');
if (bgmSelect) {
bgmSelect.addEventListener('change', function(e) {
const settings = state.getSettings();
settings.bgMusic = e.target.value;
state.setSettings(settings);
const label = container.querySelector('#vBgmLabel');
if (label) label.textContent = (VOICE_CONFIG.bgMusic[settings.bgMusic] && VOICE_CONFIG.bgMusic[settings.bgMusic].name) || 'Off';
state.save();
if (settings.bgMusic !== 'none') visualizer.playBGM();
else visualizer.stopBGM();
});
}

const ssmlCheck = container.querySelector('#vSsml');
if (ssmlCheck) {
ssmlCheck.addEventListener('change', function(e) {
const settings = state.getSettings();
settings.ssml = e.target.checked;
state.setSettings(settings);
state.save();
});
}

const recordBtn = container.querySelector('#vRecordBtn');
if (recordBtn) {
recordBtn.addEventListener('click', function() {
if (state.isCloneRecording()) {
core.stopRecording();
recordBtn.textContent = 'REKAM SUARA';
recordBtn.style.background = 'linear-gradient(135deg,#9B59B6,#8E44AD)';
} else {
core.startRecording();
recordBtn.textContent = 'STOP REKAM';
recordBtn.style.background = 'linear-gradient(135deg,#ff4444,#cc0000)';
}
});
}

container.querySelectorAll('.v-play-clone').forEach(function(btn) {
btn.addEventListener('click', function() { core.playClone(btn.dataset.id); });
});
container.querySelectorAll('.v-use-clone').forEach(function(btn) {
btn.addEventListener('click', function() { core.useClone(btn.dataset.id); });
});
container.querySelectorAll('.v-del-clone').forEach(function(btn) {
btn.addEventListener('click', function() { core.deleteClone(btn.dataset.id); });
});

const clearCloneBtn = container.querySelector('#vClearCloneBtn');
if (clearCloneBtn) clearCloneBtn.addEventListener('click', core.clearActiveClone);

const chatStartBtn = container.querySelector('#vChatStartBtn');
if (chatStartBtn) {
chatStartBtn.addEventListener('click', function() {
core.startListening();
chatStartBtn.textContent = 'Berhenti';
chatStartBtn.style.background = 'linear-gradient(135deg,#ff4444,#cc0000)';
});
}

const stopSpeakingBtn = container.querySelector('#vStopSpeakingBtn');
if (stopSpeakingBtn) stopSpeakingBtn.addEventListener('click', core.stopSpeaking);

const testBtn = container.querySelector('#vTestBtn');
if (testBtn) {
testBtn.addEventListener('click', function() {
try {
const input = container.querySelector('#voiceTestText');
if (input && input.value) core.speak(input.value, 'Test');
else core.testVoice();
} catch(e) {
if (showToast) showToast('Test gagal: ' + e.message, 'error');
}
});
}

const exportBtn = container.querySelector('#vExportMP3Btn');
if (exportBtn) {
exportBtn.addEventListener('click', function() {
try { core.exportVoiceMP3(); }
catch(e) { if (showToast) showToast('Export gagal: ' + e.message, 'error'); }
});
}

const shareBtn = container.querySelector('#vShareBtn');
if (shareBtn) {
shareBtn.addEventListener('click', function() {
const input = container.querySelector('#voiceTestText');
const text = input ? input.value : 'Halo! Ini dari KESEMPATAN OS.';
core.shareVoice(text);
});
}

const clearHistoryBtn = container.querySelector('#vClearHistoryBtn');
if (clearHistoryBtn) {
clearHistoryBtn.addEventListener('click', function() {
if (!confirm('Hapus semua riwayat?')) return;
state.setHistory([]);
state.save();
renderer.render();
if (showToast) showToast('Riwayat dihapus', 'success');
});
}

const themeBtn = container.querySelector('#vThemeBtn');
if (themeBtn) {
themeBtn.addEventListener('click', function() {
if (renderer && typeof renderer.toggleTheme === 'function') renderer.toggleTheme();
});
}

const exportSettingsBtn = container.querySelector('#vExportBtn');
if (exportSettingsBtn) exportSettingsBtn.addEventListener('click', core.exportSettings);

const importSettingsBtn = container.querySelector('#vImportBtn');
if (importSettingsBtn) importSettingsBtn.addEventListener('click', core.importSettings);

const backBtn = container.querySelector('#vBackBtn');
if (backBtn) {
backBtn.addEventListener('click', function() {
if (typeof window.showPage === 'function') window.showPage('dashboard');
});
}
};

window.VoiceCloneEvents = { attach: attachEvents };

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.VoiceEvents = window.VoiceCloneEvents;
})();
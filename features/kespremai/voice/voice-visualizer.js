import { VoiceState as state } from './voice-state.js';
import { VoiceConfig as config } from './voice-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const playBGM = function() {
    const track = config.VOICE_CONFIG.bgMusic[state.getSettings().bgMusic];
    if (!track || !track.url) return;
    let audioContext = state.getAudioContext();
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.setAudioContext(audioContext);
    }
    fetch(track.url).then(function(r) { return r.arrayBuffer(); })
        .then(function(b) { return audioContext.decodeAudioData(b); })
        .then(function(buf) {
            const source = audioContext.createBufferSource();
            source.buffer = buf;
            source.loop = true;
            const gain = audioContext.createGain();
            gain.gain.value = track.volume;
            source.connect(gain);
            gain.connect(audioContext.destination);
            source.start();
            state.setBgAudio(source);
            if (audioContext.state === 'suspended') audioContext.resume();
        }).catch(function(e) { console.warn('[VoiceClone] playBGM failed:', e.message); });
};

const stopBGM = function() {
    const bgAudio = state.getBgAudio();
    if (bgAudio) {
        try { bgAudio.stop(); } catch(e) { console.warn('[VoiceClone] stopBGM failed:', e.message); }
        state.setBgAudio(null);
    }
};

const initWaveform = function() {
    const container = document.getElementById('waveformContainer');
    if (!container) return;
    let canvas = state.getWaveformCanvas();
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = container.clientWidth || 400;
        canvas.height = 60;
        canvas.style.width = '100%';
        canvas.style.height = '60px';
        canvas.style.borderRadius = '8px';
        canvas.style.background = 'rgba(0,0,0,0.3)';
        canvas.style.cursor = 'pointer';
        container.appendChild(canvas);
        state.setWaveformCanvas(canvas);
        canvas.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const duration = state.getAudioDuration() || 60;
            const seekTime = x * duration;
            if (KESEMPATAN.VoiceCore && KESEMPATAN.VoiceCore.skipTime) {
                KESEMPATAN.VoiceCore.skipTime(seekTime - state.getAudioPosition());
            }
        });
    }
    const ctx = canvas.getContext('2d');
    state.setWaveformCtx(ctx);
    drawWaveformSilent();
};

const drawWaveformSilent = function() {
    const canvas = state.getWaveformCanvas();
    const ctx = state.getWaveformCtx();
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,255,163,0.3)';
    ctx.lineWidth = 2;
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
};

const drawWaveform = function(analyser) {
    const canvas = state.getWaveformCanvas();
    const ctx = state.getWaveformCtx();
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = '#00FFA3';
    ctx.lineWidth = 2;
    const sliceWidth = w / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * h / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
    }
    ctx.stroke();
    const volume = dataArray.reduce(function(sum, val) { return sum + Math.abs(val - 128); }, 0) / bufferLength / 128;
    const meterWidth = Math.min(w, volume * w * 2);
    ctx.fillStyle = 'rgba(0,255,163,0.15)';
    ctx.fillRect(0, h - 4, meterWidth, 4);
};

const startWaveformAnimation = function() {
    let animation = state.getWaveformAnimation();
    if (animation) cancelAnimationFrame(animation);
    let audioContext = state.getAudioContext();
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.setAudioContext(audioContext);
    }
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();
    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioContext.destination);
    const animate = function() {
        drawWaveform(analyser);
        state.setWaveformAnimation(requestAnimationFrame(animate));
    };
    animate();
};

const stopWaveformAnimation = function() {
    const animation = state.getWaveformAnimation();
    if (animation) {
        cancelAnimationFrame(animation);
        state.setWaveformAnimation(null);
    }
    drawWaveformSilent();
};

export const VoiceVisualizer = {
    playBGM: playBGM, stopBGM: stopBGM,
    initWaveform: initWaveform,
    drawWaveformSilent: drawWaveformSilent,
    drawWaveform: drawWaveform,
    startWaveformAnimation: startWaveformAnimation,
    stopWaveformAnimation: stopWaveformAnimation
};
KESEMPATAN.VoiceVisualizer = VoiceVisualizer;

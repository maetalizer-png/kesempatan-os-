(function() {
"use strict";
if (window.__AIEditorLoaded) return;
window.__AIEditorLoaded = true;

const Utils = window.KESEMPATAN?.Utils || window.Utils || {};
const showToastFn = Utils.showToast || null;

function toast(msg, type) {
    if (showToastFn) { showToastFn(msg, type); return; }
    let c = document.getElementById('toastContainer');
    if (!c) {
        c = document.createElement('div');
        c.id = 'toastContainer';
        c.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:6px;pointer-events:none;';
        document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'background:#0a1218;border:1px solid rgba(0,255,163,.4);color:#E0E6ED;padding:8px 14px;border-radius:8px;font-size:12px;max-width:90vw;';
    c.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
}

const EDITOR_CSS = `:root{--ed-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--ed-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--ed-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} .editor-container{display:flex;flex-direction:column;box-sizing:border-box;padding:4px 12px !important;} .ed-grp{position:relative;margin:0;padding:2px 0 16px;} .ed-grp::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(224,230,237,0.14);} .ed-grp:last-child::after{display:none;} .ed-rim{position:relative;display:block;clip-path:var(--ed-clip);background:rgba(26,255,156,.3);padding:1px;transition:background .25s ease,filter .3s ease;} .ed-rim:hover{background:rgba(26,255,156,.55);filter:drop-shadow(0 0 7px rgba(0,255,163,.35));} .ed-rim-in{display:block;clip-path:var(--ed-clip);background:#05080c;} .ed-file{cursor:pointer;} .ed-file .ed-rim-in{display:flex;align-items:center;gap:9px;min-height:34px;padding:8px 14px;} .ed-file svg{flex:0 0 18px;width:18px;height:18px;color:#00FFA3;} .ed-file .ed-txt{flex:1 1 auto;min-width:0;font-weight:800;letter-spacing:.4px;font-size:12.5px;text-transform:uppercase;color:#E0E6ED;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .ed-file .ed-sub{margin-left:auto;font-size:10px;color:#7c8a82;} .ed-file input[type="file"]{display:none;} .ed-preview-in{padding:12px;position:relative;} .ed-preview-in canvas,.ed-preview-in video{display:block;width:100%;max-height:340px;border-radius:0;background:#12141f;} .ed-canvas-wrap{position:relative;display:block;} .ed-canvas-wrap.erasing canvas{cursor:crosshair;} .ed-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;} .ed-btn{position:relative;isolation:isolate;clip-path:var(--ed-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:8px 12px;color:#00FFA3;font-size:12px;font-weight:700;text-align:center;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} .ed-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--ed-clip-asym);background:#06100b;z-index:-1;} .ed-btn:active{transform:scale(.97);} .ed-btn.on{background:#00FFA3;color:#03130b;} .ed-btn.on::before{background:#00FFA3;} .ed-warn{background:rgba(255,170,0,.5);color:#FFC04D;} .ed-warn::before{background:#160f02;} .ed-danger{background:rgba(255,68,68,.5);color:#FF8080;} .ed-danger::before{background:#160608;} .ed-cam{background:linear-gradient(135deg,#00FFA3,#00AA6E);color:#03130b;font-weight:800;} .ed-cam::before{display:none;} .ed-rec{background:linear-gradient(135deg,#FFD700,#FFA500);color:#1c1500;font-weight:800;} .ed-rec::before{display:none;} .ed-g-purple{background:linear-gradient(135deg,#9B59B6,#8E44AD);color:#fff;} .ed-g-purple::before{display:none;} .ed-g-red{background:linear-gradient(135deg,#E74C3C,#C0392B);color:#fff;} .ed-g-red::before{display:none;} .ed-g-blue{background:linear-gradient(135deg,#3498DB,#2980B9);color:#fff;} .ed-g-blue::before{display:none;} .ed-g-orange{background:linear-gradient(135deg,#F39C12,#E67E22);color:#1c1500;} .ed-g-orange::before{display:none;} .ed-g-green{background:linear-gradient(135deg,#27AE60,#2ECC71);color:#03130b;} .ed-g-green::before{display:none;} .ed-o-pink{background:rgba(255,105,180,.45);color:#FF9CCF;} .ed-o-pink::before{background:#170a10;} .filter-badge{position:relative;isolation:isolate;clip-path:var(--ed-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:8px 10px;font-size:11px;color:#9fb8ac;cursor:pointer;text-align:center;} .filter-badge::before{content:'';position:absolute;inset:1px;clip-path:var(--ed-clip-asym);background:#06100b;z-index:-1;} .filter-badge.active{background:#00FFA3;color:#03050A;font-weight:700;} .filter-badge.active::before{background:#00FFA3;} .editor-slider{display:flex;align-items:center;gap:10px;margin:10px 0;} .editor-slider .ed-lbl{flex:0 0 auto;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#00FFA3;} .editor-slider .value{flex:0 0 auto;font-size:12px;color:#E0E6ED;} .editor-slider input[type="range"]{-webkit-appearance:none;appearance:none;flex:1;height:16px;margin:0;padding:0;border:0;border-radius:0;background:transparent;outline:none;cursor:pointer;} .editor-slider input[type="range"]::-webkit-slider-runnable-track{height:16px;border:0;border-radius:0;clip-path:var(--ed-clip-sm);background:linear-gradient(to right,#00FFA3,#00AA6E);} .editor-slider input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;width:16px;height:16px;margin-top:0;border-radius:50%;background:#00FFA3;border:2px solid #03050A;box-shadow:0 0 8px rgba(0,255,163,.35);} .editor-slider input[type="range"]::-moz-range-track{height:16px;border:0;border-radius:0;clip-path:var(--ed-clip-sm);background:linear-gradient(to right,#00FFA3,#00AA6E);} .editor-slider input[type="range"]::-moz-range-thumb{box-sizing:border-box;width:16px;height:16px;border-radius:50%;background:#00FFA3;border:2px solid #03050A;} .ed-ai-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;} .ed-ai-title{font-size:13px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#9B59B6;text-shadow:0 0 10px rgba(155,89,182,.4);} .ed-ai-badge{clip-path:var(--ed-clip-sm);background:#00FFA3;color:#03130b;padding:3px 10px;font-size:10px;font-weight:800;text-transform:uppercase;} .ed-ai .ed-row{margin-bottom:8px;} .ed-input{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(26,255,156,.25);clip-path:var(--ed-clip-sm);border-radius:0;color:#E0E6ED;padding:8px 12px;font-size:12px;outline:none;margin:0 0 8px;} .ed-select{background:rgba(0,0,0,.35);border:1px solid rgba(26,255,156,.25);border-radius:0;clip-path:var(--ed-clip-sm);color:#E0E6ED;padding:8px 10px;font-size:12px;outline:none;margin:0;} .ed-camview{position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:9999;background:#000;} .ed-overlay{position:fixed;left:50%;transform:translateX(-50%);z-index:10000;padding:15px 30px;font-size:18px;font-weight:800;border:0;border-radius:0;clip-path:var(--ed-clip-asym);cursor:pointer;} @media (hover:hover) and (pointer:fine){ .ed-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 10px rgba(0,255,163,.35));} .filter-badge:hover{background:rgba(26,255,156,.6);color:#E0E8F0;} }`;

function injectCSS() {
    if (document.getElementById('aiEditorStyle')) return;
    const s = document.createElement('style');
    s.id = 'aiEditorStyle';
    s.textContent = EDITOR_CSS;
    document.head.appendChild(s);
}

const SVG_FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9.5 13.5l1.8 1.8 3.4-3.6"/></svg>';

let currentImage = null;
let historyStack = [];
let historyIndex = -1;
let rotation = 0, flipH = false, flipV = false;
let currentFilter = 'none';
let curBright = 100, curContrast = 100, curSat = 100;
let eraserMode = false;

function updateCanvas() {
    const canvas = document.getElementById('fotoCanvas');
    if (!canvas || !currentImage) return;
    const ctx = canvas.getContext('2d');
    let w = currentImage.width, h = currentImage.height;
    const swap = (rotation % 180) !== 0;
    if (w > 550) { h = h * 550 / w; w = 550; }
    if (h > 400) { w = w * 400 / h; h = 400; }
    canvas.width = swap ? h : w;
    canvas.height = swap ? w : h;
    ctx.filter = (currentFilter !== 'none' ? currentFilter + ' ' : '') +
        'brightness(' + curBright + '%) contrast(' + curContrast + '%) saturate(' + curSat + '%)';
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(currentImage, -w / 2, -h / 2, w, h);
    ctx.restore();
}

function pushHistory() {
    const canvas = document.getElementById('fotoCanvas');
    if (!canvas || !currentImage) return;
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(canvas.toDataURL());
    if (historyStack.length > 20) historyStack.shift();
    historyIndex = historyStack.length - 1;
}

function loadEditorImage(img, msg) {
    currentImage = img;
    rotation = 0; flipH = false; flipV = false;
    currentFilter = 'none'; curBright = 100; curContrast = 100; curSat = 100;
    historyStack = []; historyIndex = -1;
    updateCanvas();
    pushHistory();
    if (msg) toast(msg, 'success');
}

function cropRatio(ratio) {
    if (!currentImage) { toast('Tidak ada gambar!', 'error'); return; }
    const w0 = currentImage.width, h0 = currentImage.height;
    let cw = w0, ch = h0;
    if (ratio > 0) {
        if (w0 / h0 > ratio) cw = Math.round(h0 * ratio);
        else ch = Math.round(w0 / ratio);
    }
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    c.getContext('2d').drawImage(currentImage, (w0 - cw) / 2, (h0 - ch) / 2, cw, ch, 0, 0, cw, ch);
    const img = new Image();
    img.onload = function() { loadEditorImage(img, 'Crop diterapkan'); };
    img.src = c.toDataURL('image/png');
}

function enhance2x() {
    if (!currentImage) { toast('Tidak ada gambar!', 'error'); return; }
    toast('Enhance: upscale 2x + sharpen...', 'warning');
    const w = Math.min(4096, currentImage.width * 2);
    const h = Math.min(4096, currentImage.height * 2);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(currentImage, 0, 0, w, h);
    try {
        const d = ctx.getImageData(0, 0, w, h);
        const src = new Uint8ClampedArray(d.data);
        const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                for (let ch = 0; ch < 3; ch++) {
                    let acc = 0, ki = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            acc += src[i + (dy * w + dx) * 4 + ch] * k[ki++];
                        }
                    }
                    d.data[i + ch] = acc;
                }
            }
        }
        ctx.putImageData(d, 0, 0);
    } catch (e) {}
    const img = new Image();
    img.onload = function() { loadEditorImage(img, 'Enhance 2x selesai'); };
    img.src = c.toDataURL('image/png');
}

function autoFix() {
    if (!currentImage) { toast('Tidak ada gambar!', 'error'); return; }
    const c = document.createElement('canvas');
    c.width = currentImage.width; c.height = currentImage.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(currentImage, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height);
    let min = 255, max = 0;
    for (let i = 0; i < d.data.length; i += 4) {
        const l = 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
        if (l < min) min = l;
        if (l > max) max = l;
    }
    const range = Math.max(1, max - min);
    for (let i = 0; i < d.data.length; i += 4) {
        for (let ch = 0; ch < 3; ch++) {
            d.data[i + ch] = ((d.data[i + ch] - min) / range) * 255;
        }
    }
    ctx.putImageData(d, 0, 0);
    const img = new Image();
    img.onload = function() { loadEditorImage(img, 'Auto Fix (levels) selesai'); };
    img.src = c.toDataURL('image/png');
}

function magicEraseAt(canvas, x, y, r) {
    const ctx = canvas.getContext('2d');
    const ox = Math.max(0, x - r - 5), oy = Math.max(0, y - r - 5);
    const ring = ctx.getImageData(ox, oy, r * 2 + 10, r * 2 + 10);
    let rr = 0, gg = 0, bb = 0, n = 0;
    for (let py = 0; py < ring.height; py++) {
        for (let px = 0; px < ring.width; px++) {
            const dx = (ox + px) - x, dy = (oy + py) - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > r && dist < r + 5) {
                const i = (py * ring.width + px) * 4;
                rr += ring.data[i]; gg += ring.data[i + 1]; bb += ring.data[i + 2]; n++;
            }
        }
    }
    if (n === 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(' + Math.round(rr / n) + ',' + Math.round(gg / n) + ',' + Math.round(bb / n) + ')';
    ctx.filter = 'blur(2px)';
    ctx.fill();
    ctx.restore();
}

function generateArt() {
    const promptEl = document.getElementById('artPrompt');
    const styleEl = document.getElementById('artStyle');
    const base = (promptEl && promptEl.value.trim()) || '';
    if (base.length < 3) { toast('Masukkan deskripsi minimal 3 karakter!', 'error'); return; }
    const style = styleEl ? styleEl.value : '';
    const full = style ? base + ', ' + style : base;
    toast('Sedang menggambar...', 'warning');
    const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(full) + '?width=1024&height=1024&nologo=true';
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() { loadEditorImage(img, 'Gambar selesai! Bisa diedit.'); };
    img.onerror = function() { toast('Gagal generate gambar.', 'error'); };
    img.src = url;
}

function removeBackground() {
    let apiKey = localStorage.getItem('remove_bg_api_key');
    if (!apiKey) {
        apiKey = prompt('Masukkan API Key remove.bg (gratis di remove.bg):');
        if (apiKey) localStorage.setItem('remove_bg_api_key', apiKey);
        else { toast('API Key diperlukan!', 'error'); return; }
    }
    if (!currentImage) { toast('Tidak ada gambar!', 'error'); return; }
    toast('Menghapus background...', 'warning');
    const c = document.createElement('canvas');
    c.width = currentImage.width; c.height = currentImage.height;
    c.getContext('2d').drawImage(currentImage, 0, 0);
    c.toBlob(function(blob) {
        const fd = new FormData();
        fd.append('image_file', blob, 'image.png');
        fd.append('size', 'auto');
        fetch('https://api.remove.bg/v1.0/removebg', { method: 'POST', headers: { 'X-Api-Key': apiKey }, body: fd })
            .then(function(res) { if (!res.ok) throw new Error('Gagal'); return res.blob(); })
            .then(function(rb) {
                const url = URL.createObjectURL(rb);
                const img = new Image();
                img.onload = function() { loadEditorImage(img, 'Background dihapus!'); URL.revokeObjectURL(url); };
                img.src = url;
            })
            .catch(function() { toast('Gagal. Cek API key atau coba lagi.', 'error'); });
    }, 'image/png');
}

function styleTransfer() {
    let apiKey = localStorage.getItem('deepai_api_key');
    if (!apiKey) {
        apiKey = prompt('Masukkan API Key DeepAI (gratis di deepai.org):');
        if (apiKey) localStorage.setItem('deepai_api_key', apiKey);
        else { toast('API Key diperlukan!', 'error'); return; }
    }
    if (!currentImage) { toast('Tidak ada gambar!', 'error'); return; }
    const styles = ['anime', 'vintage', 'cyberpunk', 'oilpainting'];
    const sel = prompt('Pilih gaya:\n1. Anime\n2. Vintage\n3. Cyberpunk\n4. Oil Painting', '1');
    const styleName = styles[parseInt(sel, 10) - 1] || 'anime';
    toast('Mengubah gaya ke ' + styleName + '...', 'warning');
    const c = document.createElement('canvas');
    c.width = currentImage.width; c.height = currentImage.height;
    c.getContext('2d').drawImage(currentImage, 0, 0);
    c.toBlob(function(blob) {
        const fd = new FormData();
        fd.append('image', blob, 'image.png');
        let api = 'https://api.deepai.org/api/';
        if (styleName === 'anime') api += 'animegan';
        else if (styleName === 'vintage') api += 'sepia-filter';
        else if (styleName === 'cyberpunk') api += 'neon-filter';
        else api += 'oil-painting-filter';
        fetch(api, { method: 'POST', headers: { 'api-key': apiKey }, body: fd })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (!data.output_url) throw new Error('Gagal');
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function() { loadEditorImage(img, 'Gaya ' + styleName + ' berhasil!'); };
                img.src = data.output_url;
            })
            .catch(function() { toast('Gagal style transfer.', 'error'); });
    }, 'image/png');
}

function pickMime() {
    const list = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
    for (let i = 0; i < list.length; i++) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(list[i])) return list[i];
    }
    return '';
}

function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 4000);
}

function kenBurnsExport() {
    if (!currentImage) { toast('Tidak ada gambar untuk dijadikan video!', 'error'); return; }
    if (!window.MediaRecorder) { toast('Browser tidak mendukung MediaRecorder!', 'error'); return; }
    toast('Membuat video Ken Burns (6 detik)...', 'warning');
    const c = document.createElement('canvas');
    c.width = 1280; c.height = 720;
    const ctx = c.getContext('2d');
    const stream = c.captureStream(30);
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    rec.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = function() {
        downloadBlob(new Blob(chunks, { type: mime || 'video/webm' }), 'kenburns_' + Date.now() + '.webm');
        toast('Video Ken Burns selesai!', 'success');
    };
    const secs = 6;
    const t0 = performance.now();
    function drawCover(scale, panX, panY) {
        const iw = currentImage.width, ih = currentImage.height;
        const base = Math.max(c.width / iw, c.height / ih);
        const w = iw * base * scale, h = ih * base * scale;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(currentImage, (c.width - w) / 2 + panX, (c.height - h) / 2 + panY, w, h);
    }
    function frame(t) {
        const p = Math.min(1, (t - t0) / (secs * 1000));
        drawCover(1 + 0.25 * p, 40 * p, 20 * p);
        if (p < 1) requestAnimationFrame(frame);
        else rec.stop();
    }
    rec.start();
    requestAnimationFrame(frame);
}

function fallbackCapture(kind) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = kind === 'photo' ? 'image/*' : 'video/*';
    inp.setAttribute('capture', kind === 'photo' ? 'environment' : 'user');
    inp.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (kind === 'photo') {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = new Image();
                img.onload = function() { loadEditorImage(img, 'Foto dari kamera dimuat!'); };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            loadVideoFile(file);
        }
    };
    inp.click();
}

function openCamera(kind) {
    const secure = window.isSecureContext === true;
    if (!secure || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast('Kamera web butuh HTTPS; membuka kamera native...', 'info');
        fallbackCapture(kind);
        return;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: kind === 'video' })
        .then(function(stream) {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.className = 'ed-camview';
            document.body.appendChild(video);
            const mainBtn = document.createElement('button');
            mainBtn.className = 'ed-overlay ed-cam';
            mainBtn.style.bottom = '100px';
            mainBtn.textContent = kind === 'photo' ? 'CAPTURE' : 'RECORD';
            document.body.appendChild(mainBtn);
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'ed-overlay ed-danger';
            cancelBtn.style.bottom = '30px';
            cancelBtn.textContent = 'CANCEL';
            document.body.appendChild(cancelBtn);
            video.play();
            let rec = null, chunks = [], recording = false;
            function cleanup() {
                stream.getTracks().forEach(function(t) { t.stop(); });
                video.remove(); mainBtn.remove(); cancelBtn.remove();
            }
            mainBtn.onclick = function() {
                if (kind === 'photo') {
                    const c = document.createElement('canvas');
                    c.width = video.videoWidth; c.height = video.videoHeight;
                    c.getContext('2d').drawImage(video, 0, 0);
                    const img = new Image();
                    img.onload = function() { loadEditorImage(img, 'Foto berhasil diambil!'); };
                    img.src = c.toDataURL('image/png');
                    cleanup();
                } else {
                    if (!recording) {
                        chunks = [];
                        const mime = pickMime();
                        rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
                        rec.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };
                        rec.start();
                        recording = true;
                        mainBtn.textContent = 'STOP';
                        mainBtn.className = 'ed-overlay ed-warn';
                        toast('Merekam... Klik STOP untuk selesai', 'warning');
                    } else {
                        rec.onstop = function() {
                            downloadBlob(new Blob(chunks, { type: mime || 'video/webm' }), 'rec_' + Date.now() + '.webm');
                            toast('Video direkam & diunduh!', 'success');
                            cleanup();
                        };
                        rec.stop();
                    }
                }
            };
            cancelBtn.onclick = function() {
                if (rec && recording) { rec.onstop = null; rec.stop(); }
                cleanup();
                toast('Dibatalkan', 'info');
            };
        })
        .catch(function() {
            toast('Kamera ditolak; membuka kamera native...', 'info');
            fallbackCapture(kind);
        });
}

function loadVideoFile(file) {
    const url = URL.createObjectURL(file);
    const vp = document.getElementById('videoPreview');
    if (vp) {
        vp.src = url;
        vp.load();
        const st = document.getElementById('videoStatus');
        if (st) st.textContent = file.name;
        toast('Video dimuat!', 'success');
    }
}

function exportTrim() {
    const vp = document.getElementById('videoPreview');
    if (!vp || !vp.src || !vp.duration) { toast('Video belum dimuat!', 'error'); return; }
    if (!window.MediaRecorder) { toast('Browser tidak mendukung MediaRecorder!', 'error'); return; }
    const s = parseInt((document.getElementById('trimStartSlider') || {}).value || 0, 10);
    const e = parseInt((document.getElementById('trimEndSlider') || {}).value || 100, 10);
    if (e <= s) { toast('Trim end harus > trim start!', 'error'); return; }
    toast('Merekam hasil trim (real-time)...', 'warning');
    const c = document.createElement('canvas');
    c.width = vp.videoWidth || 640; c.height = vp.videoHeight || 360;
    const ctx = c.getContext('2d');
    const stream = c.captureStream(30);
    try {
        if (vp.captureStream) {
            const vs = vp.captureStream();
            vs.getAudioTracks().forEach(function(t) { stream.addTrack(t); });
        }
    } catch (err) {}
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    rec.ondataavailable = function(ev) { if (ev.data.size > 0) chunks.push(ev.data); };
    rec.onstop = function() {
        downloadBlob(new Blob(chunks, { type: mime || 'video/webm' }), 'trim_' + Date.now() + '.webm');
        toast('Export trim selesai!', 'success');
    };
    const startT = (s / 100) * vp.duration;
    const endT = (e / 100) * vp.duration;
    vp.currentTime = startT;
    vp.play();
    rec.start();
    (function draw() {
        if (vp.ended || vp.currentTime >= endT) { vp.pause(); rec.stop(); return; }
        ctx.drawImage(vp, 0, 0, c.width, c.height);
        requestAnimationFrame(draw);
    })();
}

function fileTile(inputId, statusId, label, accept) {
    return '<label class="ed-rim ed-file"><span class="ed-rim-in">' + SVG_FILE +
        '<span class="ed-txt">' + label + '</span><span class="ed-sub" id="' + statusId + '"></span>' +
        '<input type="file" id="' + inputId + '" accept="' + accept + '"></span></label>';
}

function sliderHTML(label, id, min, max, value, valueId, suffix) {
    return '<div class="editor-slider"><span class="ed-lbl">' + label + '</span>' +
        '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" value="' + value + '">' +
        '<span class="value" id="' + valueId + '">' + value + suffix + '</span></div>';
}

function renderEditFoto() {
    injectCSS();
    let container = document.getElementById('editFotoContainer');
    if (!container) {
        const page = document.getElementById('editfotoPage');
        container = document.createElement('div');
        container.id = 'editFotoContainer';
        container.className = 'editor-container';
        if (page) page.appendChild(container);
        else document.body.appendChild(container);
    }
    container.innerHTML =
        '<div class="ed-grp"><div class="ed-rim"><span class="ed-rim-in ed-preview-in"><span class="ed-canvas-wrap" id="canvasWrap"><canvas id="fotoCanvas" width="500" height="350"></canvas></span></span></div></div>' +
        '<div class="ed-grp">' + fileTile('fotoInput', 'fotoStatus', 'Select Image', 'image/*') + '</div>' +
        '<div class="ed-grp ed-row"><button id="ambilFotoBtn" class="ed-btn ed-cam">Take Photo</button><button id="rekamVideoBtn" class="ed-btn ed-rec">Record Video</button></div>' +
        '<div class="ed-grp ed-row"><button id="undoFotoBtn" class="ed-btn ed-warn">Undo</button><button id="redofotoBtn" class="ed-btn ed-warn">Redo</button><button id="resetFotoBtn" class="ed-btn ed-danger">Reset</button><button id="rotateLeftBtn" class="ed-btn">-90°</button><button id="rotateRightBtn" class="ed-btn">+90°</button><button id="flipHBtn" class="ed-btn">Flip H</button><button id="flipVBtn" class="ed-btn">Flip V</button></div>' +
        '<div class="ed-grp ed-row"><button id="cropOrigBtn" class="ed-btn">Original</button><button id="crop11Btn" class="ed-btn">1:1</button><button id="crop43Btn" class="ed-btn">4:3</button><button id="crop169Btn" class="ed-btn">16:9</button><button id="enhanceBtn" class="ed-btn ed-g-green">Enhance 2x</button><button id="autoEnhanceBtn" class="ed-btn ed-g-green">Auto Fix</button><button id="eraserBtn" class="ed-btn ed-o-pink">Magic Eraser</button></div>' +
        '<div class="ed-grp ed-row"><span class="filter-badge active" data-filter="none">Normal</span><span class="filter-badge" data-filter="sepia(100%)">Sepia</span><span class="filter-badge" data-filter="grayscale(100%)">Grayscale</span><span class="filter-badge" data-filter="invert(100%)">Invert</span><span class="filter-badge" data-filter="sepia(50%) contrast(120%) brightness(90%)">Vintage</span><span class="filter-badge" data-filter="brightness(120%) saturate(200%) hue-rotate(80deg)">Neon</span><span class="filter-badge" data-filter="blur(3px)">Blur</span></div>' +
        '<div class="ed-grp">' +
            sliderHTML('Brightness', 'brightnessVal', 0, 200, 100, 'brightnessValue', '%') +
            sliderHTML('Contrast', 'contrastVal', 0, 200, 100, 'contrastValue', '%') +
            sliderHTML('Saturation', 'saturationVal', 0, 200, 100, 'saturationValue', '%') +
            sliderHTML('Rotate Fine', 'rotateSlider', 0, 360, 0, 'rotateValue', '°') +
        '</div>' +
        '<div class="ed-grp ed-row"><button id="resize720Btn" class="ed-btn">720p</button><button id="resize1080Btn" class="ed-btn">1080p</button><button id="resizeCustomBtn" class="ed-btn">Custom</button><button id="downloadJpgBtn" class="ed-btn">JPG</button><button id="downloadPngBtn" class="ed-btn">PNG</button><button id="downloadWebpBtn" class="ed-btn">WebP</button></div>' +
        '<div class="ed-grp ed-ai"><div class="ed-ai-head"><span class="ed-ai-title">Editor Tools (Real)</span><span class="ed-ai-badge">Active</span></div>' +
        '<input class="ed-input" id="artPrompt" placeholder="Deskripsi gambar (contoh: kota futuristik saat hujan, neon)...">' +
        '<div class="ed-row"><select id="artStyle" class="ed-select"><option value="">Tanpa gaya</option><option value="cyberpunk style">Cyberpunk</option><option value="anime style">Anime</option><option value="photorealistic">Photorealistic</option><option value="oil painting">Oil Painting</option><option value="3d render">3D Render</option></select><button id="aiArtGeneratorBtn" class="ed-btn ed-g-purple">Generate Image</button><button id="kenburnsBtn" class="ed-btn ed-g-blue">Generate Video</button></div>' +
        '<div class="ed-row"><button id="aiBgRemoverBtn" class="ed-btn ed-g-red">Remove Background</button><button id="aiStyleTransferBtn" class="ed-btn ed-g-blue">Style Transfer</button></div>' +
        '</div>';
    wireFoto(container);
}

function on(c, id, fn) {
    const el = c.querySelector('#' + id);
    if (el) el.addEventListener('click', fn);
    return el;
}

function wireFoto(c) {
    const fotoInput = c.querySelector('#fotoInput');
    if (fotoInput) {
        fotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const st = c.querySelector('#fotoStatus');
            if (st) st.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = new Image();
                img.onload = function() { loadEditorImage(img, 'Gambar dimuat!'); };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    on(c, 'ambilFotoBtn', function() { openCamera('photo'); });
    on(c, 'rekamVideoBtn', function() { openCamera('video'); });
    on(c, 'undoFotoBtn', function() {
        if (historyIndex > 0) {
            historyIndex--;
            const img = new Image();
            img.onload = function() { currentImage = img; updateCanvas(); toast('Undo', 'info'); };
            img.src = historyStack[historyIndex];
        } else toast('Tidak ada yang bisa di-undo', 'warning');
    });
    on(c, 'redofotoBtn', function() {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            const img = new Image();
            img.onload = function() { currentImage = img; updateCanvas(); toast('Redo', 'info'); };
            img.src = historyStack[historyIndex];
        } else toast('Tidak ada yang bisa di-redo', 'warning');
    });
    on(c, 'resetFotoBtn', function() {
        if (historyStack.length > 0) {
            const img = new Image();
            img.onload = function() { loadEditorImage(img, 'Reset selesai'); };
            img.src = historyStack[0];
        } else toast('Belum ada gambar', 'warning');
    });
    on(c, 'rotateLeftBtn', function() { rotation -= 90; updateCanvas(); pushHistory(); toast('Rotate -90°', 'info'); });
    on(c, 'rotateRightBtn', function() { rotation += 90; updateCanvas(); pushHistory(); toast('Rotate +90°', 'info'); });
    on(c, 'flipHBtn', function() { flipH = !flipH; updateCanvas(); pushHistory(); toast('Flip Horizontal', 'info'); });
    on(c, 'flipVBtn', function() { flipV = !flipV; updateCanvas(); pushHistory(); toast('Flip Vertical', 'info'); });
    on(c, 'cropOrigBtn', function() { cropRatio(0); });
    on(c, 'crop11Btn', function() { cropRatio(1); });
    on(c, 'crop43Btn', function() { cropRatio(4 / 3); });
    on(c, 'crop169Btn', function() { cropRatio(16 / 9); });
    on(c, 'enhanceBtn', enhance2x);
    on(c, 'autoEnhanceBtn', autoFix);
    on(c, 'eraserBtn', function() {
        eraserMode = !eraserMode;
        const wrap = document.getElementById('canvasWrap');
        if (wrap) wrap.classList.toggle('erasing', eraserMode);
        this.classList.toggle('on', eraserMode);
        toast(eraserMode ? 'Magic Eraser ON: ketuk area yang mau dihapus' : 'Magic Eraser OFF', 'info');
    });

    const badges = c.querySelectorAll('.filter-badge');
    badges.forEach(function(b) {
        b.addEventListener('click', function() {
            currentFilter = b.dataset.filter;
            badges.forEach(function(x) { x.classList.remove('active'); });
            b.classList.add('active');
            updateCanvas();
            pushHistory();
            toast('Filter: ' + b.textContent.trim(), 'info');
        });
    });

    function bindSlider(id, valueId, suffix, apply) {
        const s = c.querySelector('#' + id);
        if (!s) return;
        s.addEventListener('input', function() {
            const v = parseInt(s.value, 10);
            const vd = c.querySelector('#' + valueId);
            if (vd) vd.textContent = v + suffix;
            apply(v);
            updateCanvas();
        });
        s.addEventListener('change', pushHistory);
    }
    bindSlider('brightnessVal', 'brightnessValue', '%', function(v) { curBright = v; });
    bindSlider('contrastVal', 'contrastValue', '%', function(v) { curContrast = v; });
    bindSlider('saturationVal', 'saturationValue', '%', function(v) { curSat = v; });
    bindSlider('rotateSlider', 'rotateValue', '°', function(v) { rotation = v; });

    function resizeImage(w, h) {
        if (!currentImage) { toast('Tidak ada gambar!', 'error'); return; }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(currentImage, 0, 0, w, h);
        const img = new Image();
        img.onload = function() { loadEditorImage(img, 'Resize ' + w + 'x' + h); };
        img.src = cv.toDataURL('image/png');
    }
    on(c, 'resize720Btn', function() { resizeImage(1280, 720); });
    on(c, 'resize1080Btn', function() { resizeImage(1920, 1080); });
    on(c, 'resizeCustomBtn', function() {
        const w = prompt('Lebar (px):', '800');
        const h = prompt('Tinggi (px):', '600');
        if (w && h) resizeImage(parseInt(w, 10), parseInt(h, 10));
    });

    function downloadImage(mime, ext) {
        const canvas = document.getElementById('fotoCanvas');
        if (!canvas || !currentImage) { toast('Tidak ada gambar!', 'error'); return; }
        canvas.toBlob(function(b) { downloadBlob(b, 'edited_' + Date.now() + '.' + ext); toast('Download ' + ext.toUpperCase(), 'success'); }, mime, 0.92);
    }
    on(c, 'downloadJpgBtn', function() { downloadImage('image/jpeg', 'jpg'); });
    on(c, 'downloadPngBtn', function() { downloadImage('image/png', 'png'); });
    on(c, 'downloadWebpBtn', function() { downloadImage('image/webp', 'webp'); });
    on(c, 'aiArtGeneratorBtn', generateArt);
    on(c, 'kenburnsBtn', kenBurnsExport);
    on(c, 'aiBgRemoverBtn', removeBackground);
    on(c, 'aiStyleTransferBtn', styleTransfer);

    const canvas = c.querySelector('#fotoCanvas');
    if (canvas) {
        canvas.addEventListener('pointerup', function(ev) {
            if (!eraserMode) return;
            const rect = canvas.getBoundingClientRect();
            const scale = canvas.width / rect.width;
            const x = Math.round((ev.clientX - rect.left) * scale);
            const y = Math.round((ev.clientY - rect.top) * scale);
            magicEraseAt(canvas, x, y, 20);
            pushHistory();
            toast('Area dihapus', 'success');
        });
    }
}

function renderEditVideo() {
    injectCSS();
    let container = document.getElementById('editVideoContainer');
    if (!container) {
        const page = document.getElementById('editvideoPage');
        container = document.createElement('div');
        container.id = 'editVideoContainer';
        container.className = 'editor-container';
        if (page) page.appendChild(container);
        else document.body.appendChild(container);
    }
    container.innerHTML =
        '<div class="ed-grp"><div class="ed-rim"><span class="ed-rim-in ed-preview-in"><video id="videoPreview" controls playsinline></video></span></div></div>' +
        '<div class="ed-grp">' + fileTile('videoInput', 'videoStatus', 'Select Video', 'video/*') + '</div>' +
        '<div class="ed-grp ed-row"><button id="ambilVideoBtn" class="ed-btn ed-rec">Record Video</button></div>' +
        '<div class="ed-grp">' + sliderHTML('Trim Start', 'trimStartSlider', 0, 100, 0, 'trimStartValue', '%') + sliderHTML('Trim End', 'trimEndSlider', 0, 100, 100, 'trimEndValue', '%') + '</div>' +
        '<div class="ed-grp ed-row"><button id="applyTrimBtn" class="ed-btn">Preview Trim</button><button id="exportTrimBtn" class="ed-btn ed-g-green">Export Trim (WebM)</button><button id="extractFrameBtn" class="ed-btn">Extract Frame</button></div>' +
        '<div class="ed-grp">' + sliderHTML('Speed', 'speedSlider', 25, 400, 100, 'speedValue', 'x') + sliderHTML('Volume', 'volumeSlider', 0, 100, 100, 'volumeValue', '%') + '</div>' +
        '<div class="ed-grp ed-row"><button id="loopVideoBtn" class="ed-btn">Loop</button><button id="muteVideoBtn" class="ed-btn">Mute</button></div>';

    const videoInput = container.querySelector('#videoInput');
    if (videoInput) {
        videoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) loadVideoFile(file);
        });
    }

    on(container, 'ambilVideoBtn', function() { openCamera('video'); });
    on(container, 'applyTrimBtn', function() {
        const vp = document.getElementById('videoPreview');
        if (!vp || !vp.duration) { toast('Video belum dimuat!', 'error'); return; }
        const s = parseInt(container.querySelector('#trimStartSlider').value, 10);
        vp.currentTime = (s / 100) * vp.duration;
        vp.play();
        toast('Preview trim dari ' + s + '%', 'info');
    });
    on(container, 'exportTrimBtn', exportTrim);
    on(container, 'extractFrameBtn', function() {
        const vp = document.getElementById('videoPreview');
        if (!vp || !vp.src) { toast('Video belum dimuat!', 'error'); return; }
        const c = document.createElement('canvas');
        c.width = vp.videoWidth || 640; c.height = vp.videoHeight || 480;
        c.getContext('2d').drawImage(vp, 0, 0);
        c.toBlob(function(b) { downloadBlob(b, 'frame_' + Date.now() + '.png'); toast('Frame diekstrak!', 'success'); }, 'image/png');
    });

    const sp = container.querySelector('#speedSlider');
    if (sp) sp.addEventListener('input', function() {
        const v = parseInt(sp.value, 10) / 100;
        const vd = container.querySelector('#speedValue');
        if (vd) vd.textContent = v + 'x';
        const vp = document.getElementById('videoPreview');
        if (vp) vp.playbackRate = v;
    });

    const vo = container.querySelector('#volumeSlider');
    if (vo) vo.addEventListener('input', function() {
        const vd = container.querySelector('#volumeValue');
        if (vd) vd.textContent = vo.value + '%';
        const vp = document.getElementById('videoPreview');
        if (vp) vp.volume = parseInt(vo.value, 10) / 100;
    });

    on(container, 'loopVideoBtn', function() {
        const vp = document.getElementById('videoPreview');
        if (vp) { vp.loop = !vp.loop; this.classList.toggle('on', vp.loop); toast(vp.loop ? 'Loop ON' : 'Loop OFF', 'info'); }
    });
    on(container, 'muteVideoBtn', function() {
        const vp = document.getElementById('videoPreview');
        if (vp) { vp.muted = !vp.muted; this.classList.toggle('on', vp.muted); toast(vp.muted ? 'Mute ON' : 'Mute OFF', 'info'); }
    });
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.AIEditor = Object.freeze({
    renderEditFoto: renderEditFoto,
    renderEditVideo: renderEditVideo
});

window.renderEditFoto = renderEditFoto;
window.renderEditVideo = renderEditVideo;
})();
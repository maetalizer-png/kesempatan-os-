const SLIDES = [
    { step: '1. Tulis topik & fokus dalam satu kalimat', example: 'analisis warung kopi kontainer di pinggir tol, fokus modal di bawah 50 juta' },
    { step: '2. Sistem merekomendasikan agen relevan otomatis', example: 'riset kelayakan aplikasi laundry on-demand, target 8 bulan balik modal' },
    { step: '3. Jalankan dan lihat skor 10 dimensi', example: 'bandingkan peluang kedai kopi vs kedai teh untuk anak muda' }
];

const ROTATE_MS = 6000;
let currentIndex = 0;
let rotateTimer = null;

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

function renderSlide(index) {
    const track = document.getElementById('infoRotatorTrack');
    const dotsEl = document.getElementById('infoRotatorDots');
    if (!track) return;
    const slide = SLIDES[index];
    track.innerHTML =
        '<span class="pi-rotator-step">' + escapeHtml(slide.step) + '</span>' +
        '<button type="button" class="pi-rotator-example" data-example="' + escapeHtml(slide.example) + '">"' + escapeHtml(slide.example) + '"</button>';
    if (dotsEl) {
        dotsEl.innerHTML = SLIDES.map(function(_, i) {
            return '<span class="pi-dot' + (i === index ? ' active' : '') + '" data-dot-index="' + i + '"></span>';
        }).join('');
    }
}

function goTo(index) {
    currentIndex = (index + SLIDES.length) % SLIDES.length;
    renderSlide(currentIndex);
}

function startRotation() {
    stopRotation();
    rotateTimer = setInterval(function() { goTo(currentIndex + 1); }, ROTATE_MS);
}

function stopRotation() {
    if (rotateTimer) clearInterval(rotateTimer);
}

function fillCommandInput(text) {
    const commandInput = document.getElementById('commandInput');
    if (!commandInput) return;
    commandInput.value = text;
    commandInput.dispatchEvent(new Event('input', { bubbles: true }));
    commandInput.focus();
}

let wired = false;

function init(attempt) {
    const track = document.getElementById('infoRotatorTrack');
    if (!track) {
        if ((attempt || 0) < 20) setTimeout(function() { init((attempt || 0) + 1); }, 150);
        return;
    }
    renderSlide(currentIndex);
    startRotation();

    if (wired) return;
    wired = true;

    track.addEventListener('click', function(e) {
        const btn = e.target.closest('.pi-rotator-example');
        if (!btn) return;
        fillCommandInput(btn.dataset.example);
    });

    const dotsEl = document.getElementById('infoRotatorDots');
    if (dotsEl) {
        dotsEl.addEventListener('click', function(e) {
            const dot = e.target.closest('.pi-dot');
            if (!dot) return;
            goTo(parseInt(dot.dataset.dotIndex, 10) || 0);
            startRotation();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { init(0); });
} else {
    init(0);
}

export const InfoRotator = Object.freeze({ goTo: goTo, SLIDES: SLIDES });

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.InfoRotator = InfoRotator;

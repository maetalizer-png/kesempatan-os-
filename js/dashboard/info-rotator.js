const SLIDES = [
    { step: '1. Insert data file (CSV/JSON/TXT)' },
    { step: '2. Write your analysis topic' },
    { step: '3. Add instruction (optional)' }
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
    track.innerHTML = '<span class="pi-rotator-step">' + escapeHtml(slide.step) + '</span>';
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

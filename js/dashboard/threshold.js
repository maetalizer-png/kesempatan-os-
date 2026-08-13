import { CONFIG } from '../core/config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function renderUI(container) {
    if (!container) return;
    container.innerHTML =
        '<div class="threshold-section">' +
            '<div class="threshold-header">' +
                '<span class="threshold-icon"></span>' +
                '<span class="threshold-title">Auto-Approve Threshold</span>' +
                '<span class="threshold-value" id="thresholdValue">70%</span>' +
            '</div>' +
            '<div class="threshold-slider-wrapper">' +
                '<input type="range" id="confidenceThreshold" min="50" max="90" step="5" value="70">' +
            '</div>' +
        '</div>';
    initThresholdSlider();
}

function initThresholdSlider() {
    const slider = document.getElementById('confidenceThreshold');
    const span = document.getElementById('thresholdValue');
    const noteSpan = document.getElementById('thresholdNoteValue');
    if (slider && span) {
        const saved = localStorage.getItem('kes_auto_approve_threshold');
        const value = saved || 70;
        slider.value = value;
        span.textContent = value + '%';
        if (noteSpan) noteSpan.textContent = value;
        slider.addEventListener('input', function(e) {
            const thresholdValue = parseInt(e.target.value, 10);
            span.textContent = thresholdValue + '%';
            if (noteSpan) noteSpan.textContent = thresholdValue;
            CONFIG.AUTO_APPROVE_CONFIDENCE = thresholdValue;
            localStorage.setItem('kes_auto_approve_threshold', thresholdValue);
        });
    }
}

export const ThresholdPanel = Object.freeze({ renderUI: renderUI });

KESEMPATAN.ThresholdPanel = ThresholdPanel;

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('thresholdContainer'));
});
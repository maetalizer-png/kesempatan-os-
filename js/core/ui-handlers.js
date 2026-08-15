import { Utils } from './utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function initUIHandlers() {
    const showToast = Utils.showToast;

    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');

    if (hamburger && sidebar) {
        const newHamburger = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamburger, hamburger);
        newHamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) && !newHamburger.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    let touchStartX = 0;
    let touchCurrentX = 0;
    let isSwiping = false;

    sidebar.addEventListener('touchstart', function(e) {
        if (window.innerWidth > 768 || !sidebar.classList.contains('open')) return;
        touchStartX = e.touches[0].clientX;
        touchCurrentX = touchStartX;
        isSwiping = true;
    }, { passive: true });

    sidebar.addEventListener('touchmove', function(e) {
        if (!isSwiping) return;
        touchCurrentX = e.touches[0].clientX;
    }, { passive: true });

    sidebar.addEventListener('touchend', function() {
        if (!isSwiping) return;
        isSwiping = false;
        const deltaX = touchCurrentX - touchStartX;
        if (deltaX < -50) sidebar.classList.remove('open');
    });

    function initSubmenu(menuBtnId, submenuId) {
        const button = document.getElementById(menuBtnId);
        const submenu = document.getElementById(submenuId);
        if (button && submenu) {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function(e) {
                e.stopPropagation();
                submenu.classList.toggle('open');
            });
        }
    }

    initSubmenu('premiumMenuBtn', 'premiumSubmenu');
    initSubmenu('aiworkersMenuBtn', 'aiworkersSubmenu');
    initSubmenu('marketdataMenuBtn', 'marketdataSubmenu');
    initSubmenu('kesmediaMenuBtn', 'kesmediaSubmenu');
    initSubmenu('monitoringMenuBtn', 'monitoringSubmenu');

    const autonomySelect = document.getElementById('autonomyModeSidebar');
    if (autonomySelect) {
        const newAutonomySelect = autonomySelect.cloneNode(true);
        autonomySelect.parentNode.replaceChild(newAutonomySelect, autonomySelect);
        newAutonomySelect.addEventListener('change', function() {
            localStorage.setItem('kes_autonomy_mode', newAutonomySelect.value);
        });
        const savedAutonomyMode = localStorage.getItem('kes_autonomy_mode');
        if (savedAutonomyMode) newAutonomySelect.value = savedAutonomyMode;
    }

    (function initVoiceInput() {
        const voiceButton = document.getElementById('voiceInputBtn');
        const stopButton = document.getElementById('stopVoiceBtn');
        const commandInput = document.getElementById('commandInput');
        const topicInput = document.getElementById('topicInput');
        if (!voiceButton || (!commandInput && !topicInput)) return;

        let recognition = null;
        const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;

        if (SpeechRecognitionAPI) {
            recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'id-ID';

            recognition.onstart = function() {
                if (voiceButton) voiceButton.style.display = 'none';
                if (stopButton) stopButton.style.display = 'block';
                showToast('Listening...', 'info');
            };
            recognition.onend = function() {
                if (voiceButton) voiceButton.style.display = 'block';
                if (stopButton) stopButton.style.display = 'none';
            };
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                if (commandInput) {
                    commandInput.value = transcript;
                    commandInput.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (topicInput) {
                    topicInput.value = transcript;
                }
                showToast('"' + transcript + '"', 'success');
            };
            recognition.onerror = function() {
                showToast('Failed', 'error');
                if (voiceButton) voiceButton.style.display = 'block';
                if (stopButton) stopButton.style.display = 'none';
            };

            if (voiceButton) {
                const newVoiceButton = voiceButton.cloneNode(true);
                voiceButton.parentNode.replaceChild(newVoiceButton, voiceButton);
                newVoiceButton.onclick = function() { recognition.start(); };
            }
            if (stopButton) {
                const newStopButton = stopButton.cloneNode(true);
                stopButton.parentNode.replaceChild(newStopButton, stopButton);
                newStopButton.onclick = function() { recognition.stop(); };
            }
        } else {
            if (voiceButton) voiceButton.style.display = 'none';
        }
    })();
}

export const UIHandlers = Object.freeze({ initUIHandlers: initUIHandlers });

KESEMPATAN.UIHandlers = UIHandlers;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUIHandlers);
} else {
    initUIHandlers();
}
import { Utils } from '../core/utils.js';
import { Main } from '../core/main.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const showToast = Utils.showToast || function(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
    else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
};

function showHistoryPanelAndScroll() {
    Main.showHistoryPanel();
    const panel = document.getElementById('historyPanel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReportDock() {
    const container = document.getElementById('reportDockContainer');
    if (!container) return;
    container.innerHTML =
        '<div class="dock-label-group" id="dockToggleLabel" role="button" tabindex="0" aria-expanded="false">REPORT DOCK <span class="section-toggle-arrow" id="dockToggleArrow">▾</span></div>' +
        '<div class="dock-icons-wrapper" id="dockIconsWrapper" style="display:none;">' +
            '<div class="app-icon" id="saveHistoryIcon"><div class="app-icon-circle"><i class="fas fa-save"></i></div><span class="app-icon-label">Simpan</span></div>' +
            '<div class="app-icon" id="loadHistoryIcon"><div class="app-icon-circle"><i class="fas fa-folder-open"></i></div><span class="app-icon-label">History</span></div>' +
            '<div class="app-icon" id="whatsappIcon"><div class="app-icon-circle"><i class="fab fa-whatsapp"></i></div><span class="app-icon-label">WA</span></div>' +
            '<div class="app-icon" id="telegramIcon"><div class="app-icon-circle"><i class="fab fa-telegram-plane"></i></div><span class="app-icon-label">TG</span></div>' +
        '</div>';

    const toggleLabel = document.getElementById('dockToggleLabel');
    const iconsWrapper = document.getElementById('dockIconsWrapper');
    const toggleArrow = document.getElementById('dockToggleArrow');

    function setDockOpen(open) {
        iconsWrapper.style.display = open ? 'flex' : 'none';
        toggleArrow.textContent = open ? '▴' : '▾';
        toggleLabel.setAttribute('aria-expanded', open ? 'true' : 'false');
        localStorage.setItem('kes_dock_open', open ? '1' : '0');
    }

    if (toggleLabel) {
        toggleLabel.addEventListener('click', function() {
            setDockOpen(iconsWrapper.style.display === 'none');
        });
        toggleLabel.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setDockOpen(iconsWrapper.style.display === 'none');
            }
        });
    }
    setDockOpen(localStorage.getItem('kes_dock_open') === '1');

    function buildShareMessage() {
        const topicInput = document.getElementById('topicInput');
        const topic = topicInput ? topicInput.value : 'Opportunity';
        const score = window.lastAggregated.score;
        const insights = (window.lastAggregated.insight || []).slice(0, 3).join('\n• ');
        const rec = window.lastAggregated.recommendation || '';
        return '*KESEMPATAN OS*\n' + topic + '\nSkor: ' + score + '/100\nInsight:\n• ' + insights + '\n' + rec;
    }

    const saveIcon = document.getElementById('saveHistoryIcon');
    if (saveIcon) {
        saveIcon.addEventListener('click', function() {
            if (!window.lastAggregated) {
                showToast('Tidak ada laporan', 'error');
                return;
            }
            const topicInput = document.getElementById('topicInput');
            Main.saveReportToHistory(window.lastAggregated, topicInput ? topicInput.value : 'Untitled');
        });
    }

    const loadIcon = document.getElementById('loadHistoryIcon');
    if (loadIcon) {
        loadIcon.addEventListener('click', function() {
            showHistoryPanelAndScroll();
        });
    }

    const waIcon = document.getElementById('whatsappIcon');
    if (waIcon) {
        waIcon.addEventListener('click', function() {
            if (!window.lastAggregated) {
                showToast('Tidak ada laporan', 'error');
                return;
            }
            const msg = buildShareMessage();
            const phone = prompt('Masukkan nomor WhatsApp:', '');
            if (phone) window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
            else window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
        });
    }

    const tgIcon = document.getElementById('telegramIcon');
    if (tgIcon) {
        tgIcon.addEventListener('click', function() {
            if (!window.lastAggregated) {
                showToast('Tidak ada laporan', 'error');
                return;
            }
            const msg = buildShareMessage();
            window.open('https://t.me/share/url?url=&text=' + encodeURIComponent(msg), '_blank');
        });
    }
}

function renderHistoryPanelShell() {
    const container = document.getElementById('historyPanel');
    if (!container) return;
    container.innerHTML =
        '<h2>Riwayat Analisis Tersimpan</h2>' +
        '<div id="historyList" style="max-height:400px; overflow-y:auto;"><p class="text-dim">Belum ada riwayat.</p></div>' +
        '<div style="display:flex; gap:10px; margin-top:16px;">' +
            '<button id="closeHistoryBtn" class="execute-btn secondary">Tutup</button>' +
            '<button id="clearHistoryBtn" class="execute-btn secondary" style="background:#ff4444; color:white;">Hapus Semua</button>' +
        '</div>';

    const closeBtn = document.getElementById('closeHistoryBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('historyPanel').style.display = 'none';
        });
    }

    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            Main.clearAllHistory();
        });
    }
}

function initReportDockAndHistoryPanel() {
    renderReportDock();
    renderHistoryPanelShell();
}

export const ReportDock = Object.freeze({
    renderReportDock: renderReportDock,
    renderHistoryPanelShell: renderHistoryPanelShell
});

KESEMPATAN.ReportDock = ReportDock;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReportDockAndHistoryPanel);
} else {
    initReportDockAndHistoryPanel();
}
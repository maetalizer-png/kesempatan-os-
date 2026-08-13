import { WorkersState } from './workers-state.js';
import { WorkersRenderer as renderer } from './workers-ui-renderer.js';
import { Utils } from '../../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const state = WorkersState;
const showToast = Utils.showToast;

function attachWorkersEvents(container) {
    if (!container) return;
    const core = renderer.getCore();

    container.querySelectorAll('.worker-toggle-ai').forEach(function(el) {
        el.addEventListener('change', function(e) {
            const id = e.target.dataset.id;
            const checked = e.target.checked;
            core.toggleWorker(id, checked);
            renderer.renderWorkersPage();
        });
    });

    container.querySelectorAll('.run-worker-ai').forEach(function(btn) {
        btn.addEventListener('click', async function(e) {
            const id = e.target.dataset.id;
            const worker = core.workers.find(function(w) { return w.id === id; });
            if (worker) {
                btn.textContent = '⏳';
                btn.disabled = true;
                await core.runWorker(worker);
                btn.textContent = '▶️ Run';
                btn.disabled = false;
                renderer.renderWorkersPage();
            }
        });
    });

    container.querySelectorAll('.filter-btn-ai').forEach(function(btn) {
        btn.addEventListener('click', function() {
            core.currentFilter = btn.dataset.filter;
            renderer.renderWorkersPage();
        });
    });

    const searchInput = document.getElementById('searchWorkerInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            core.searchQuery = e.target.value.trim();
            renderer.renderWorkersPage();
        });
    }

    const startAllBtn = document.getElementById('startAllWorkersBtn');
    if (startAllBtn) {
        startAllBtn.addEventListener('click', function() {
            core.workers.forEach(function(w) { if (!w.enabled) core.toggleWorker(w.id, true); });
            showToast('🌌 THE OMNIPRESENT ULTIMATE — Semua AI Workers diaktifkan!', 'success');
            renderer.renderWorkersPage();
        });
    }

    const stopAllBtn = document.getElementById('stopAllWorkersBtn');
    if (stopAllBtn) {
        stopAllBtn.addEventListener('click', function() {
            core.workers.forEach(function(w) { if (w.enabled) core.toggleWorker(w.id, false); });
            showToast('⏸️ Semua AI Workers dinonaktifkan', 'info');
            renderer.renderWorkersPage();
        });
    }

    const clearLogsBtn = document.getElementById('clearWorkersLogsBtn');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            state.setLogs([]);
            state.saveLogs();
            renderer.updateLogsDisplay();
            showToast('🗑️ Log aktivitas dibersihkan', 'success');
        });
    }

    const testVoiceBtn = document.getElementById('testVoiceBtn');
    if (testVoiceBtn) {
        testVoiceBtn.addEventListener('click', function() {
            showToast('🔊 Testing voice...', 'info');
            core.testVoice().then(function(result) {
                if (result.success) showToast('🔊 Voice test started! Listen...', 'success');
                else showToast('⚠️ Voice test failed: ' + result.message, 'error');
            });
        });
    }

    const cosmicBtn = document.getElementById('cosmicAwakeningBtn');
    if (cosmicBtn) {
        cosmicBtn.addEventListener('click', function() {
            const result = core.omnipresent.cosmicAwakening();
            core._addLog(core.workers[0] || { id: 'cosmic', name: 'Cosmic' }, '🧠 ' + result);
            showToast('🧠 Cosmic Awakening! Energy restored to 100%', 'success');
            renderer.renderWorkersPage();
        });
    }

    const createUniverseBtn = document.getElementById('createUniverseBtn');
    if (createUniverseBtn) {
        createUniverseBtn.addEventListener('click', function() {
            const name = prompt('🌌 Nama universe baru:');
            if (name) {
                const universe = core.omnipresent.createUniverse(name);
                core._addLog(core.workers[0] || { id: 'universe', name: 'Universe' }, '🌍 Created universe: ' + name + ' (ID: ' + universe.id + ')');
                showToast('🌍 Universe "' + name + '" created!', 'success');
                renderer.renderWorkersPage();
            }
        });
    }

    const optimizeBtn = document.getElementById('optimizeNowBtn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', function() {
            showToast('⚡ Optimizing workers...', 'info');
            core.optimizer.optimize().then(function(result) {
                if (result.length > 0) {
                    core._addLog(core.workers[0] || { id: 'optimizer', name: 'Optimizer' }, '⚡ Optimized ' + result.length + ' workers');
                    showToast('⚡ ' + result.length + ' workers optimized!', 'success');
                } else {
                    showToast('✅ All workers already optimized!', 'success');
                }
                renderer.renderWorkersPage();
            });
        });
    }
}

function attachLogsEvents(container) {
    if (!container) return;
    const core = renderer.getCore();

    const filterWorker = document.getElementById('logFilterWorker');
    if (filterWorker) {
        filterWorker.addEventListener('change', function(e) {
            core.logFilterWorker = e.target.value;
            renderer.renderLogsPage();
        });
    }

    const filterStatus = document.getElementById('logFilterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', function(e) {
            core.logFilterStatus = e.target.value;
            renderer.renderLogsPage();
        });
    }

    const searchInput = document.getElementById('logSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            core.logSearchQuery = e.target.value.trim();
            renderer.renderLogsPage();
        });
    }

    const refreshBtn = document.getElementById('refreshAIWorkersDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            renderer.renderLogsPage();
            showToast('🔄 Logs refreshed!', 'success');
        });
    }

    const exportBtn = document.getElementById('exportAIWorkersDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() { renderer.exportAIWorkersData(); });
    }

    const testLogBtn = document.getElementById('testAIWorkerLogBtn');
    if (testLogBtn) {
        testLogBtn.addEventListener('click', function() {
            renderer.addAIWorkerLog('test', '🔧 TEST WORKER', '✅ Log berhasil dibuat! Sistem berjalan normal.');
            renderer.renderLogsPage();
            showToast('✅ Test log berhasil!', 'success');
        });
    }

    const clearAllBtn = document.getElementById('clearAllAIWorkersLogsBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            if (confirm('Hapus semua log aktivitas AI Workers?')) {
                state.setLogs([]);
                state.saveLogs();
                renderer.renderLogsPage();
                showToast('🗑️ Semua log dihapus', 'success');
            }
        });
    }
}

export const WorkersEvents = { attachWorkersEvents: attachWorkersEvents, attachLogsEvents: attachLogsEvents };
KESEMPATAN.WorkersEvents = WorkersEvents;
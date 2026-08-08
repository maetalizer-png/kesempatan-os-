(function() {
'use strict';
const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

if (window.__MainLoaded) return;
window.__MainLoaded = true;

const Utils = KESEMPATAN.Utils || window.Utils || {};
const Logger = Utils.Logger || {
    system: function() {},
    success: function(type, message) {
        if (window.showToast) window.showToast(message, 'success');
    },
    error: function(type, message) {
        if (window.showToast) window.showToast(message, 'error');
    },
    warn: function() {},
    info: function() {}
};
const showToast = Utils.showToast || function(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
    else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
};
const RetryEngine = Utils.RetryEngine || {
    execute: async function(action, retries, delay) {
        retries = retries || 2;
        delay = delay || 1500;
        let attempt = 0;
        while (attempt <= retries) {
            try {
                return await action();
            } catch (error) {
                attempt++;
                if (attempt > retries) throw error;
                await new Promise(function(resolve) { setTimeout(resolve, delay * attempt); });
            }
        }
    }
};
const obfuscate = Utils.obfuscate || {
    encrypt: function(value) {
        try { return btoa(encodeURIComponent(value)); }
        catch (error) { return value; }
    },
    decrypt: function(encoded) {
        try { return decodeURIComponent(atob(encoded)); }
        catch (error) { return ''; }
    }
};
const escapeHtml = Utils.escapeHtml || function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(char) {
        const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return entityMap[char] || char;
    });
};

function saveReportToHistory(aggregated, topic) {
    if (!aggregated) return;
    const history = JSON.parse(localStorage.getItem('kes_report_history') || '[]');
    const report = {
        id: Date.now(),
        topic: topic || 'Untitled',
        score: aggregated.score,
        summary: aggregated.summary,
        insight: aggregated.insight,
        recommendation: aggregated.recommendation,
        metrics: aggregated.metrics,
        timestamp: new Date().toISOString()
    };
    history.unshift(report);
    if (history.length > 50) history.pop();
    localStorage.setItem('kes_report_history', JSON.stringify(history));
    renderHistoryPanel();
}

function renderHistoryPanel() {
    const history = JSON.parse(localStorage.getItem('kes_report_history') || '[]');
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-dim">Belum ada riwayat. Selesaikan analisis untuk menyimpan laporan.</p>';
        return;
    }
    historyList.innerHTML = history.map(function(item) {
        return '<div class="history-item" data-id="' + item.id + '">' +
            '<div style="display:flex;justify-content:space-between;">' +
                '<span style="font-weight:bold;color:#00FFA3;">' + escapeHtml(item.topic?.substring(0, 50) || 'Untitled') + '</span>' +
                '<span style="font-size:11px;">' + item.score + '/100</span>' +
            '</div>' +
            '<div style="font-size:11px;color:#A0B3C9;">' + new Date(item.timestamp).toLocaleString() + '</div>' +
            '<div style="font-size:12px;margin-top:8px;">' + escapeHtml(item.summary?.substring(0, 100) || '') + '...</div>' +
        '</div>';
    }).join('');
    document.querySelectorAll('.history-item').forEach(function(element) {
        element.addEventListener('click', function() {
            loadReportFromHistory(parseInt(element.dataset.id, 10));
        });
    });
}

function renderReportSummaryToContainer(report) {
    const container = document.getElementById('reportContainer');
    if (!container) return;
    container.innerHTML =
        '<div><strong>RINGKASAN (' + new Date(report.timestamp).toLocaleString() + ')</strong></div>' +
        '<div>' + escapeHtml(report.summary) + '</div>' +
        '<div><strong>INSIGHT</strong><ul>' + (report.insight?.map(function(insight) {
            return '<li>' + escapeHtml(insight) + '</li>';
        }).join('') || '<li>Tidak ada insight</li>') + '</ul></div>' +
        '<div><strong>REKOMENDASI</strong><div>' + escapeHtml(report.recommendation) + '</div></div>' +
        '<div><strong>SKOR AKHIR: ' + report.score + '/100</strong></div>';
}

function restoreLastReportOnLoad() {
    try {
        const history = JSON.parse(localStorage.getItem('kes_report_history') || '[]');
        if (!history.length) return;
        const container = document.getElementById('reportContainer');
        if (!container || container.dataset.reportRendered === 'true') return;
        const latest = history[0];
        window.lastAggregated = latest;
        if (window.KESEMPATAN?.ChartManager?.ScoreEngine) {
            window.KESEMPATAN.ChartManager.ScoreEngine.updateFromAggregated(latest);
        } else if (window.ScoreEngine) {
            window.ScoreEngine.updateFromAggregated(latest);
        }
        if (window.KESEMPATAN?.ChartManager?.updateChart && latest.metrics) {
            window.KESEMPATAN.ChartManager.updateChart(latest.metrics);
        } else if (window.updateChart && latest.metrics) {
            window.updateChart(latest.metrics);
        }
        renderReportSummaryToContainer(latest);
        container.dataset.reportRendered = 'true';
    } catch (error) {
        Logger.warn('INIT', 'restoreLastReportOnLoad gagal: ' + error.message);
    }
}

function loadReportFromHistory(id) {
    const history = JSON.parse(localStorage.getItem('kes_report_history') || '[]');
    const report = history.find(function(item) { return item.id === id; });
    if (!report) return;
    window.lastAggregated = report;
    if (window.KESEMPATAN?.ChartManager?.ScoreEngine) {
        window.KESEMPATAN.ChartManager.ScoreEngine.updateFromAggregated(report);
    } else if (window.ScoreEngine) {
        window.ScoreEngine.updateFromAggregated(report);
    }
    if (window.KESEMPATAN?.ChartManager?.updateChart && report.metrics) {
        window.KESEMPATAN.ChartManager.updateChart(report.metrics);
    } else if (window.updateChart && report.metrics) {
        window.updateChart(report.metrics);
    }
    renderReportSummaryToContainer(report);
    const container = document.getElementById('reportContainer');
    if (container) container.dataset.reportRendered = 'true';
    showToast('Memuat: ' + report.topic, 'success');
    if (window.KESEMPATAN?.Router?.showPage) window.KESEMPATAN.Router.showPage('report');
}

function resetReportDisplay() {
    window.lastAggregated = null;
    window.__lastAggregated = null;
    try { localStorage.removeItem('kes_last_aggregated'); } catch (error) {
        Logger.warn('REPORT', 'Clear last aggregated failed: ' + error.message);
    }
    const container = document.getElementById('reportContainer');
    if (container) {
        container.innerHTML = '';
        delete container.dataset.reportRendered;
    }
    const scoreEngine = window.KESEMPATAN?.ChartManager?.ScoreEngine || window.ScoreEngine;
    if (scoreEngine && scoreEngine.updateFromAggregated) {
        const emptyMetrics = {};
        for (const metricKey of scoreEngine.metricsKeys) {
            emptyMetrics[metricKey] = 0;
        }
        scoreEngine.updateFromAggregated({ metrics: emptyMetrics });
    }
    const updateChart = window.KESEMPATAN?.ChartManager?.updateChart || window.updateChart;
    if (typeof updateChart === 'function') updateChart({});
}

function clearAllHistory() {
    if (confirm('Hapus semua riwayat laporan?')) {
        localStorage.removeItem('kes_report_history');
        resetReportDisplay();
        renderHistoryPanel();
        showToast('Semua riwayat dihapus', 'success');
    }
}

function showHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    if (panel) {
        renderHistoryPanel();
        panel.style.display = 'block';
    }
}

function createProject() {
    const serverUrl = document.getElementById('serverUrlInput')?.value || 'ws://localhost:3000';
    showToast('Mencoba membuat project di ' + serverUrl + '...', 'info');
    showToast("Fitur kolaborasi: Jalankan 'node server.js' terlebih dahulu", 'info');
}

function joinProject() {
    const serverUrl = document.getElementById('serverUrlInput')?.value || 'ws://localhost:3000';
    showToast('Mencoba join project di ' + serverUrl + '...', 'info');
    showToast("Fitur kolaborasi: Jalankan 'node server.js' terlebih dahulu", 'info');
}

function sendChatMessage() {
    const message = document.getElementById('chatInput')?.value;
    if (!message) {
        showToast('Ketik pesan terlebih dahulu', 'error');
        return;
    }
    showToast('Pesan terkirim: "' + message.substring(0, 50) + '"', 'success');
    document.getElementById('chatInput').value = '';
}

function testNotification() {
    if (Notification.permission === 'granted') {
        new Notification('KESEMPATAN OS', {
            body: 'Notifikasi berhasil! KESEMPATAN OS siap digunakan.',
            icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%2300FFA3\'/%3E%3Ctext x=\'50\' y=\'68\' font-size=\'50\' text-anchor=\'middle\' fill=\'%2303050A\'%3EK%3C/text%3E%3C/svg%3E'
        });
        showToast('Notifikasi berhasil dikirim!', 'success');
    } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                testNotification();
            } else {
                showToast('Izin notifikasi ditolak', 'error');
            }
        });
    } else {
        showToast('Izin notifikasi sudah ditolak. Aktifkan di pengaturan browser.', 'error');
    }
}

function setup3DHooks() {
    const scoreEngine = window.KESEMPATAN?.ChartManager?.ScoreEngine || window.ScoreEngine;
    if (scoreEngine && scoreEngine.updateFromAggregated) {
        const original = scoreEngine.updateFromAggregated;
        scoreEngine.updateFromAggregated = function(aggregated) {
            const result = original.call(this, aggregated);
            if (window.update3DVizMetrics && aggregated?.metrics) {
                window.update3DVizMetrics(aggregated.metrics);
            }
            return result;
        };
    }
    if (window.Telemetry && window.Telemetry.recordLatency) {
        const original = window.Telemetry.recordLatency;
        window.Telemetry.recordLatency = function(agent, latency) {
            const result = original.call(this, agent, latency);
            if (window.update3DVizTelemetry) {
                const averageLatency = window.Telemetry.getAverageLatency();
                const failures = window.FlowAnalytics?.stats?.agentFailures ? Object.values(window.FlowAnalytics.stats.agentFailures).reduce(function(a, b) { return a + b; }, 0) : 0;
                window.update3DVizTelemetry(averageLatency, failures);
            }
            return result;
        };
    }
}

async function initSupabaseCloud() {
    const supabaseUrl = localStorage.getItem('kes_supabase_url');
    const supabaseKey = localStorage.getItem('kes_supabase_key');
    if (supabaseUrl && supabaseKey && typeof initSupabase === 'function') {
        await initSupabase();
    }
}

async function initApiKeyStatus() {
    const input = document.getElementById('apiKeyInput');
    const span = document.getElementById('apiKeyStatus');
    if (!input || !span) return;
    const update = async function() {
        const key = input.value.trim();
        if (!key) {
            span.textContent = '';
            span.className = 'api-status unknown';
            return;
        }
        span.textContent = 'Memeriksa...';
        const AIClients = window.KESEMPATAN?.AIClients || window.AIClients;
        const CONFIG = window.KESEMPATAN?.Config || window.CONFIG;
        const isValid = await AIClients.validateApiKey(CONFIG.AI_PROVIDER, key);
        span.textContent = isValid ? 'Valid' : 'Tidak valid';
        span.className = 'api-status ' + (isValid ? 'valid' : 'invalid');
        if (isValid) {
            CONFIG.API_KEYS[CONFIG.AI_PROVIDER] = key;
            localStorage.setItem('kes_api_key_' + CONFIG.AI_PROVIDER, obfuscate.encrypt(key));
        }
    };
    input.addEventListener('blur', update);
    update();
}

function setupFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const statusDiv = document.getElementById('uploadStatus');
    if (!fileInput) return;
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const CONFIG = window.KESEMPATAN?.Config || window.CONFIG;
        if (file.size > CONFIG.MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
            statusDiv.innerText = 'File terlalu besar (max ' + CONFIG.MAX_UPLOAD_SIZE_MB + ' MB)';
            fileInput.value = '';
            return;
        }
        statusDiv.innerText = 'Membaca...';
        try {
            const text = await file.text();
            if (file.name.endsWith('.json')) {
                JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                const firstLine = text.split('\n')[0];
                if (firstLine.split(',').length < 1) {
                    throw new Error('CSV tidak valid');
                }
            }
            window.__uploadedData = text;
            statusDiv.innerText = '✅ ' + file.name + ' siap (' + Math.round(text.length / 1024) + ' KB)';
        } catch (error) {
            statusDiv.innerText = 'Gagal baca file: ' + error.message;
            fileInput.value = '';
            delete window.__uploadedData;
        }
    });
}

function bindNotificationTestButton() {
    const testBtn = document.getElementById('testNotificationBtn');
    if (testBtn) testBtn.onclick = testNotification;
}

function setupEventListeners() {
    const buttonIds = ['executeBtn', 'mainExecuteBtn'];
    let lastStart = 0;
    const startWorkflow = async function() {
        if (Date.now() - lastStart < 2000) {
            showToast('Tunggu sebentar', 'warn');
            return;
        }
        lastStart = Date.now();
        const apiKey = document.getElementById('apiKeyInput')?.value || '';
        const topic = document.getElementById('topicInput')?.value || '';
        const instruction = document.getElementById('promptInput')?.value || '';
        if (!topic || !instruction) {
            showToast('Isi Topik dan Instruksi!', 'error');
            return;
        }
        try {
            if (window.KESEMPATAN?.WorkflowLLMBridge?.ensureKesempatanLLMReady) {
                await window.KESEMPATAN.WorkflowLLMBridge.ensureKesempatanLLMReady();
            }
            const kesempatanLLMReady = window.KesempatanLLM && window.KesempatanLLM.isReady && window.KesempatanLLM.isReady();
            if (!kesempatanLLMReady) {
                const CONFIG = window.KESEMPATAN?.Config || window.CONFIG;
                const AIClients = window.KESEMPATAN?.AIClients || window.AIClients;
                const provider = CONFIG.AI_PROVIDER;
                let key = CONFIG.API_KEYS[provider];
                if (!key && apiKey) key = apiKey;
                if (!key) {
                    showToast('API Key untuk ' + CONFIG.PROVIDERS[provider].name + ' belum diisi.', 'error');
                    return;
                }
                const isValid = await AIClients.validateApiKey(provider, key);
                if (!isValid) {
                    showToast('API Key ' + CONFIG.PROVIDERS[provider].name + ' tidak valid.', 'error');
                    return;
                }
                CONFIG.API_KEYS[provider] = key;
                localStorage.setItem('kes_api_key_' + provider, obfuscate.encrypt(key));
            }
            const uploaded = window.__uploadedData || '';
            await window.KESEMPATAN.WorkflowEngine.start({ topic: topic, instruction: instruction }, uploaded);
        } catch (error) {
            const shortMessage = (error && error.message) ? error.message : String(error);
            showToast('Gagal memulai eksekusi: ' + shortMessage, 'error');
            Logger.system('EKSEKUSI', 'Gagal memulai eksekusi: ' + shortMessage);
            if (error && error.stack) {
                Logger.system('EKSEKUSI-TRACE', error.stack.split('\n').slice(0, 6).join(' ← '));
            }
        }
    };
    buttonIds.forEach(function(id) {
        const button = document.getElementById(id);
        if (button) button.addEventListener('click', startWorkflow);
    });
    document.addEventListener('system-log', function(e) {
        if (Utils.Logger && Utils.Logger.system) {
            Utils.Logger.system(e.detail.type, e.detail.message);
        }
        const logBox = document.getElementById('systemLog');
        if (logBox && logBox.children.length > 200) {
            logBox.removeChild(logBox.children[0]);
        }
    });
}

function initUI() {
    const quickAgents = document.getElementById('quickAgents');
    const CONFIG = window.KESEMPATAN?.Config || window.CONFIG;
    if (quickAgents && CONFIG?.AGENTS) {
        quickAgents.textContent = CONFIG.AGENTS.length;
    }
}

function waitForModules() {
    const required = ['CONFIG', 'Utils', 'AIClients', 'ResponseCacheManager', 'VectorMemory', 'AutoLearning', 'ChartManager', 'HITL', 'ExportManager', 'WorkflowEngine'];
    const allLoaded = required.every(function(moduleName) {
        return window[moduleName] || window.KESEMPATAN?.[moduleName];
    });
    if (allLoaded) {
        initApp();
    } else {
        window.__kesWaitAttempts = (window.__kesWaitAttempts || 0) + 1;
        if (window.__kesWaitAttempts >= 100) {
            const missing = required.filter(function(moduleName) {
                return !window[moduleName] && !window.KESEMPATAN?.[moduleName];
            });
            if (window.showToast) {
                window.showToast('Modul belum siap: ' + missing.join(', '), 'error');
            }
            if (Logger && Logger.error) {
                Logger.error('INIT', 'waitForModules timeout — modul hilang: ' + missing.join(', '));
            }
            return;
        }
        setTimeout(waitForModules, 100);
    }
}

async function initApp() {
    const CONFIG = window.KESEMPATAN?.Config || window.CONFIG;
    Logger.system(CONFIG.APP_NAME);
    restoreLastReportOnLoad();

    if (typeof getDatabase !== 'undefined') {
        try {
            const db = await getDatabase();
            if (window.KESEMPATAN?.ResponseCache?.setDatabase) window.KESEMPATAN.ResponseCache.setDatabase(db);
            else if (window.setCacheDatabase) window.setCacheDatabase(db);
            if (window.setMemoryDatabase) window.setMemoryDatabase(db);
            if (window.setLearningDatabase) window.setLearningDatabase(db);
            if (window.KESEMPATAN?.WorkflowEngine?.setDatabase) window.KESEMPATAN.WorkflowEngine.setDatabase(db);
        } catch (error) {
            Logger.warn('INIT', 'getDatabase gagal (lanjut tanpa DB): ' + error.message);
        }
    }

    if (typeof KnowledgeGraph !== 'undefined') {
        try {
            window.knowledgeGraph = new KnowledgeGraph();
            await window.knowledgeGraph.load();
            if (window.KESEMPATAN?.WorkflowEngine?.setKnowledgeGraph) window.KESEMPATAN.WorkflowEngine.setKnowledgeGraph(window.knowledgeGraph);
        } catch (error) {
            Logger.warn('INIT', 'KnowledgeGraph gagal (lanjut tanpa KG): ' + error.message);
        }
    }

    try { await AutoLearning.load(); }
    catch (error) { Logger.warn('INIT', 'AutoLearning.load gagal: ' + error.message); }

    try {
        const AIClients = window.KESEMPATAN?.AIClients || window.AIClients;
        const ResponseCacheManager = window.KESEMPATAN?.ResponseCache || window.ResponseCacheManager;
        AIClients.setCache(ResponseCacheManager);
    } catch (error) {
        Logger.warn('INIT', 'AIClients.setCache gagal: ' + error.message);
    }

    try { await initSupabaseCloud(); }
    catch (error) { Logger.warn('INIT', 'initSupabaseCloud gagal: ' + error.message); }

    initUI();
    setupEventListeners();
    initApiKeyStatus();
    setupFileUpload();
    bindNotificationTestButton();

    const ResponseCacheManager = window.KESEMPATAN?.ResponseCache || window.ResponseCacheManager;
    if (ResponseCacheManager && ResponseCacheManager.updateStatsDisplay) {
        ResponseCacheManager.updateStatsDisplay();
    }

    setup3DHooks();

    if (KESEMPATAN.AgentRenderer?.renderAllAgents) {
        try {
            KESEMPATAN.AgentRenderer.renderAllAgents();
            Logger.system('Agen berhasil dirender dari data (agent-renderer.js)');
        } catch (error) {
            Logger.error('RENDER', 'Gagal render agen: ' + error.message);
        }
    } else {
        Logger.warn('RENDER', 'renderAllAgents tidak ditemukan, pastikan agent-renderer.js sudah di-load');
    }

    if (typeof window.updateSelectedCount === 'function') {
        setTimeout(function() { window.updateSelectedCount(); }, 100);
    }

    Logger.success('SISTEM', 'KESEMPATAN OS siap - Fitur lengkap + Custom Agents + Render Agen!');
}

window.addEventListener('error', function(event) {
    const error = event.error;
    const trace = (error && error.stack) ? error.stack.split('\n').slice(0, 6).join(' ← ') : (event.message || 'unknown error');
    if (typeof Logger !== 'undefined' && Logger.system) {
        Logger.system('UNCAUGHT-ERROR', trace);
    }
});

window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const trace = (reason && reason.stack) ? reason.stack.split('\n').slice(0, 6).join(' ← ') : String(reason);
    if (typeof Logger !== 'undefined' && Logger.system) {
        Logger.system('UNHANDLED-REJECTION', trace);
    }
});

KESEMPATAN.Main = Object.freeze({
    initApp: initApp,
    waitForModules: waitForModules,
    saveReportToHistory: saveReportToHistory,
    renderHistoryPanel: renderHistoryPanel,
    loadReportFromHistory: loadReportFromHistory,
    resetReportDisplay: resetReportDisplay,
    clearAllHistory: clearAllHistory,
    showHistoryPanel: showHistoryPanel,
    createProject: createProject,
    joinProject: joinProject,
    sendChatMessage: sendChatMessage,
    testNotification: testNotification
});

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(waitForModules, 100);
});
})();
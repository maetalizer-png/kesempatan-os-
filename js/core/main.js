import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { AIClients } from '../ai-io/ai-clients.js';
import { ResponseCacheManager } from '../ai-io/response-cache.js';
import { ChartManager } from '../dashboard/chart.js';
import { HITL } from '../dashboard/hitl.js';
import { ExportManager } from '../dashboard/export.js';
import { WorkflowLLMBridge } from '../workflow/workflow-llm-bridge.js';
import { WorkflowEngine } from '../workflow/workflow.js';
import { AgentRenderer } from '../agent-runtime/agent-renderer.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

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
    
    
    if (window.KESEMPATAN?.KesDatabase && window.KESDatabase && !window.KESDatabase._isDummy) {
        window.KESDatabase.saveReport(report.topic, report.score, report).catch(function (error) {
            Logger.warn('REPORT', 'IndexedDB report backup failed: ' + error.message);
        });
    }
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
            '<div style="font-size:11px;color:var(--text-secondary);">' + new Date(item.timestamp).toLocaleString() + '</div>' +
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
        ChartManager.ScoreEngine.updateFromAggregated(latest);
        if (latest.metrics) {
            ChartManager.updateChart(latest.metrics);
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
    ChartManager.ScoreEngine.updateFromAggregated(report);
    if (report.metrics) {
        ChartManager.updateChart(report.metrics);
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
    const emptyMetrics = {};
    for (const metricKey of ChartManager.ScoreEngine.metricsKeys) {
        emptyMetrics[metricKey] = 0;
    }
    ChartManager.ScoreEngine.updateFromAggregated({ metrics: emptyMetrics });
    ChartManager.updateChart({});
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
    const original = ChartManager.ScoreEngine.updateFromAggregated;
    ChartManager.ScoreEngine.updateFromAggregated = function(aggregated) {
        const result = original.call(this, aggregated);
        if (window.KESEMPATAN?.ThreeViz?.update3DVizMetrics && aggregated?.metrics) {
            window.KESEMPATAN.ThreeViz.update3DVizMetrics(aggregated.metrics);
        }
        return result;
    };
    if (window.Telemetry && window.Telemetry.recordLatency) {
        const original = window.Telemetry.recordLatency;
        window.Telemetry.recordLatency = function(agent, latency) {
            const result = original.call(this, agent, latency);
            if (window.KESEMPATAN?.ThreeViz?.update3DVizTelemetry) {
                const averageLatency = window.Telemetry.getAverageLatency();
                const failures = window.FlowAnalytics?.stats?.agentFailures ? Object.values(window.FlowAnalytics.stats.agentFailures).reduce(function(a, b) { return a + b; }, 0) : 0;
                window.KESEMPATAN.ThreeViz.update3DVizTelemetry(averageLatency, failures);
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
        if (file.size > CONFIG.MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
            statusDiv.innerText = 'File too large (max ' + CONFIG.MAX_UPLOAD_SIZE_MB + ' MB)';
            fileInput.value = '';
            return;
        }
        statusDiv.innerText = 'Reading...';
        try {
            const text = await file.text();
            if (file.name.endsWith('.json')) {
                JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                const firstLine = text.split('\n')[0];
                if (firstLine.split(',').length < 1) {
                    throw new Error('Invalid CSV');
                }
            }
            window.__uploadedData = text;
            statusDiv.innerText = '✅ ' + file.name + ' ready (' + Math.round(text.length / 1024) + ' KB)';
        } catch (error) {
            statusDiv.innerText = 'Failed to read file: ' + error.message;
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
            showToast('Please wait a moment', 'warn');
            return;
        }
        lastStart = Date.now();
        const apiKey = document.getElementById('apiKeyInput')?.value || '';
        const topic = document.getElementById('topicInput')?.value || '';
        const instruction = document.getElementById('promptInput')?.value || '';
        if (!topic || !instruction) {
            showToast('Write your analysis topic and instruction!', 'error');
            return;
        }
        try {
            await WorkflowLLMBridge.ensureKesempatanLLMv2Ready();
            const kesempatanLLMv2Ready = window.KesempatanLLM2 && window.KesempatanLLM2.isReady && window.KesempatanLLM2.isReady();
            if (!kesempatanLLMv2Ready) {
                await WorkflowLLMBridge.ensureKesempatanLLMReady();
            }
            const kesempatanLLMReady = kesempatanLLMv2Ready || (window.KesempatanLLM && window.KesempatanLLM.isReady && window.KesempatanLLM.isReady());
            if (!kesempatanLLMReady) {
                const provider = CONFIG.AI_PROVIDER;
                let key = CONFIG.API_KEYS[provider];
                if (!key && apiKey) key = apiKey;
                if (!key) {
                    showToast('API Key for ' + CONFIG.PROVIDERS[provider].name + ' is not set.', 'error');
                    return;
                }
                const isValid = await AIClients.validateApiKey(provider, key);
                if (!isValid) {
                    showToast('API Key for ' + CONFIG.PROVIDERS[provider].name + ' is invalid.', 'error');
                    return;
                }
                CONFIG.API_KEYS[provider] = key;
                localStorage.setItem('kes_api_key_' + provider, obfuscate.encrypt(key));
            }
            const uploaded = window.__uploadedData || '';
            await WorkflowEngine.start({ topic: topic, instruction: instruction }, uploaded);
        } catch (error) {
            const shortMessage = (error && error.message) ? error.message : String(error);
            showToast('Failed to start execution: ' + shortMessage, 'error');
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
    if (quickAgents && CONFIG?.AGENTS) {
        quickAgents.textContent = CONFIG.AGENTS.length;
    }
}







function waitForModules() {
    const required = ['VectorMemory', 'AutoLearning'];
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
    Logger.system(CONFIG.APP_NAME);
    restoreLastReportOnLoad();

    if (window.KESEMPATAN?.KesDatabase?.getDatabase) {
        try {
            const db = await window.KESEMPATAN.KesDatabase.getDatabase();
            ResponseCacheManager.setDatabase(db);
            if (window.setMemoryDatabase) window.setMemoryDatabase(db);
            if (window.setLearningDatabase) window.setLearningDatabase(db);
            WorkflowEngine.setDatabase(db);

            
            if (!db._isDummy) {
                const flagKey = 'kes_idb_migrated_reports';
                if (!localStorage.getItem(flagKey)) {
                    const existing = JSON.parse(localStorage.getItem('kes_report_history') || '[]');
                    for (const oldReport of existing) {
                        await db.saveReport(oldReport.topic, oldReport.score, oldReport).catch(function (error) {
                            Logger.warn('INIT', 'Migrate legacy report failed: ' + error.message);
                        });
                    }
                    localStorage.setItem(flagKey, '1');
                }
            }
        } catch (error) {
            Logger.warn('INIT', 'getDatabase gagal (lanjut tanpa DB): ' + error.message);
        }
    }

    if (typeof KnowledgeGraph !== 'undefined') {
        try {
            window.knowledgeGraph = new KnowledgeGraph();
            await window.knowledgeGraph.load();
            WorkflowEngine.setKnowledgeGraph(window.knowledgeGraph);
        } catch (error) {
            Logger.warn('INIT', 'KnowledgeGraph gagal (lanjut tanpa KG): ' + error.message);
        }
    }

    try { await AutoLearning.load(); }
    catch (error) { Logger.warn('INIT', 'AutoLearning.load gagal: ' + error.message); }

    try {
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

    ResponseCacheManager.updateStatsDisplay();

    setup3DHooks();

    try {
        AgentRenderer.renderAllAgents();
        Logger.system('Agen berhasil dirender dari data (agent-renderer.js)');
    } catch (error) {
        Logger.error('RENDER', 'Gagal render agen: ' + error.message);
    }

    if (typeof window.KESEMPATAN?.AgentControl?.updateSelectedCount === 'function') {
        setTimeout(function() { window.KESEMPATAN.AgentControl.updateSelectedCount(); }, 100);
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

export const Main = Object.freeze({
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

KESEMPATAN.Main = Main;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(waitForModules, 100);
});
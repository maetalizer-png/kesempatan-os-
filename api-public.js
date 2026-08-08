(function() {
"use strict";
if (window.__PublicAPILoaded) return;
window.__PublicAPILoaded = true;

const API_SERVER_URL = localStorage.getItem('kes_api_server_url') || 'http://localhost:3456';
let currentApiKey = localStorage.getItem('kes_api_key_real') || '';

const showToast = function(message, type) {
    type = type || 'info';
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

async function checkServerStatus() {
    const statusSpan = document.getElementById('serverStatus');
    if (!statusSpan) return;
    try {
        const response = await fetch(API_SERVER_URL + '/health');
        if (response.ok) {
            statusSpan.innerHTML = 'ONLINE';
            statusSpan.style.color = '#00FFA3';
            return true;
        }
        throw new Error();
    } catch(e) {
        statusSpan.innerHTML = 'OFFLINE (jalankan: node api-server.js)';
        statusSpan.style.color = '#FF4444';
        return false;
    }
}

async function generateApiKey() {
    const nameInput = document.getElementById('apiKeyNameInput');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        showToast('Masukkan nama aplikasi!', 'error');
        return;
    }
    try {
        const response = await fetch(API_SERVER_URL + '/keys/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        const data = await response.json();
        if (data.success) {
            currentApiKey = data.apiKey;
            localStorage.setItem('kes_api_key_real', currentApiKey);
            showToast('API Key generated! Simpan key ini.', 'success');
            renderUI();
        } else {
            showToast('Gagal generate API Key', 'error');
        }
    } catch(e) {
        showToast('Server tidak merespon. Jalankan node api-server.js', 'error');
    }
}

function saveExistingKey() {
    const keyInput = document.getElementById('existingKeyInput');
    const key = keyInput ? keyInput.value.trim() : '';
    if (!key || !key.startsWith('kes ')) {
        showToast('Masukkan API Key yang valid (harus mulai dengan "kes ")', 'error');
        return;
    }
    currentApiKey = key;
    localStorage.setItem('kes_api_key_real', currentApiKey);
    showToast('API Key tersimpan!', 'success');
    renderUI();
}

function copyApiKey() {
    navigator.clipboard.writeText(currentApiKey);
    showToast('API Key disalin ke clipboard!', 'success');
}

function regenerateApiKey() {
    if (confirm('Regenerate API Key? Key lama tidak akan bisa dipakai lagi.')) {
        localStorage.removeItem('kes_api_key_real');
        currentApiKey = '';
        renderUI();
    }
}

async function testEndpoint(endpoint) {
    if (!currentApiKey) {
        showToast('Buat atau masukkan API Key dulu!', 'error');
        return;
    }
    const resultDiv = document.getElementById('testResult');
    if (!resultDiv) return;
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="color: #FFD700;">Memuat...</div>';
    try {
        const response = await fetch(API_SERVER_URL + endpoint, {
            headers: { 'X-API-Key': currentApiKey }
        });
        const data = await response.json();
        resultDiv.innerHTML = '<div style="color: #00FFA3;">Status: ' + response.status + '</div><pre style="margin-top: 8px; white-space: pre-wrap; word-break: break-all;">' + JSON.stringify(data, null, 2) + '</pre>';
    } catch(e) {
        resultDiv.innerHTML = '<div style="color: #FF4444;">Error: ' + e.message + '</div>';
    }
}

async function testAnalyze() {
    if (!currentApiKey) {
        showToast('Buat atau masukkan API Key dulu!', 'error');
        return;
    }
    const topic = prompt('Masukkan topik analisis:', 'AI untuk UMKM Indonesia 2025');
    if (!topic) return;
    const resultDiv = document.getElementById('testResult');
    if (!resultDiv) return;
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="color: #FFD700;">Menganalisis...</div>';
    try {
        const response = await fetch(API_SERVER_URL + '/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': currentApiKey
            },
            body: JSON.stringify({
                topic: topic,
                instruction: 'Analisis peluang bisnis'
            })
        });
        const data = await response.json();
        resultDiv.innerHTML = '<div style="color: #00FFA3;">Analysis Complete!</div><div style="margin-top: 8px;"><strong>Skor: </strong>' + (data.report?.score || '?') + '/100</div><div style="margin-top: 4px;"><strong>Ringkasan: </strong>' + (data.report?.summary || '') + '</div><pre style="margin-top: 8px; white-space: pre-wrap; word-break: break-all;">' + JSON.stringify(data, null, 2) + '</pre>';
    } catch(e) {
        resultDiv.innerHTML = '<div style="color: #FF4444;">Error: ' + e.message + '</div>';
    }
}

function renderUI() {
    let container = document.getElementById('publicApiContainer');
    if (!container) {
        const page = document.getElementById('publicapiPage');
        if (page) {
            container = document.createElement('div');
            container.id = 'publicApiContainer';
            container.className = 'result-container';
            page.appendChild(container);
        } else {
            container = document.createElement('div');
            container.id = 'publicApiContainer';
            container.className = 'result-container';
            document.body.appendChild(container);
        }
    }

    const hasKey = !!currentApiKey;
    container.innerHTML =
        '<div style="padding: 16px;">' +
            '<div style="background: rgba(0,255,163,0.1); border-radius: 12px; padding: 12px; margin-bottom: 16px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">' +
                    '<span style="color: #00FFA3;">Server Status:</span>' +
                    '<span id="serverStatus" style="color: #FFD700;">Checking...</span>' +
                '</div>' +
                '<div style="font-size: 11px; color: #666; margin-top: 4px;">Server: ' + API_SERVER_URL + '</div>' +
            '</div>' +
            '<div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin-bottom: 16px;">' +
                '<div style="color: #00FFA3; font-weight: bold; margin-bottom: 8px;">API Key</div>' +
                (hasKey ?
                    '<div style="background: #03050A; padding: 8px; border-radius: 8px; font-family: monospace; font-size: 10px; word-break: break-all; margin-bottom: 8px;">' + currentApiKey.substring(0, 30) + '...</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                        '<button id="copyApiKeyBtn" class="execute-btn secondary" style="width: auto; padding: 4px 12px;">Copy</button>' +
                        '<button id="regenerateApiKeyBtn" class="execute-btn secondary" style="width: auto; padding: 4px 12px;">Regenerate</button>' +
                    '</div>'
                :
                    '<div style="margin-bottom: 12px;">' +
                        '<input type="text" id="apiKeyNameInput" placeholder="Nama aplikasi (contoh: MyApp)" style="width: 100%; margin-bottom: 8px;">' +
                        '<button id="generateApiKeyBtn" class="execute-btn" style="width: 100%;">Generate API Key</button>' +
                    '</div>' +
                    '<div style="margin-top: 8px;">' +
                        '<input type="text" id="existingKeyInput" placeholder="Atau masukkan API Key yang sudah ada" style="width: 100%;">' +
                        '<button id="saveExistingKeyBtn" class="execute-btn secondary" style="width: 100%; margin-top: 4px;">Simpan Key</button>' +
                    '</div>'
                ) +
            '</div>' +
            '<div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin-bottom: 16px;">' +
                '<div style="color: #00FFA3; font-weight: bold; margin-bottom: 8px;">Endpoints</div>' +
                '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; font-size: 10px;">' +
                    '<code>GET /health</code><code>GET /agents</code><code>GET /workers</code><code>GET /report/latest</code><code>POST /analyze</code>' +
                '</div>' +
            '</div>' +
            '<div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px;">' +
                '<div style="color: #00FFA3; font-weight: bold; margin-bottom: 8px;">Test API</div>' +
                '<div style="display: flex; flex-wrap: wrap; gap: 8px;">' +
                    '<button id="testHealthBtn" class="execute-btn secondary" style="width: auto; padding: 4px 12px;">Test Health</button>' +
                    '<button id="testAgentsBtn" class="execute-btn secondary" style="width: auto; padding: 4px 12px;">Test Agents</button>' +
                    '<button id="testAnalyzeBtn" class="execute-btn secondary" style="width: auto; padding: 4px 12px;">Test Analyze</button>' +
                '</div>' +
                '<div id="testResult" style="margin-top: 12px; background: #03050A; border-radius: 8px; padding: 8px; font-size: 10px; max-height: 150px; overflow-y: auto; display: none;"></div>' +
            '</div>' +
        '</div>';

    checkServerStatus();

    if (!hasKey) {
        document.getElementById('generateApiKeyBtn')?.addEventListener('click', generateApiKey);
        document.getElementById('saveExistingKeyBtn')?.addEventListener('click', saveExistingKey);
    } else {
        document.getElementById('copyApiKeyBtn')?.addEventListener('click', copyApiKey);
        document.getElementById('regenerateApiKeyBtn')?.addEventListener('click', regenerateApiKey);
    }

    document.getElementById('testHealthBtn')?.addEventListener('click', function() { testEndpoint('/health'); });
    document.getElementById('testAgentsBtn')?.addEventListener('click', function() { testEndpoint('/agents'); });
    document.getElementById('testAnalyzeBtn')?.addEventListener('click', testAnalyze);
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.PublicAPI = Object.freeze({
    renderUI: renderUI,
    getApiKey: function() { return currentApiKey; }
});

window.PublicAPI = {
    renderUI: renderUI,
    getApiKey: function() { return currentApiKey; }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(renderUI, 100); });
} else {
    setTimeout(renderUI, 100);
}
})();
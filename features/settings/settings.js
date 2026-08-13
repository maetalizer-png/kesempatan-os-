import { Utils } from '../../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const showToast = Utils.showToast;

const SETTINGS_CSS = `:root{--pg-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--pg-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--pg-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));} #pageInner .pg-wrap{box-sizing:border-box;padding:4px 12px 16px;} #pageInner .pg-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary,#00FFA3);text-shadow:0 0 10px rgba(0,255,163,.35);margin:0 0 14px;} #pageInner .pg-card{position:relative;isolation:isolate;clip-path:var(--pg-clip);background:rgba(26,255,156,.35);padding:1px;margin-bottom:14px;} #pageInner .pg-card::before{content:'';position:absolute;inset:1px;clip-path:var(--pg-clip);background:#0d1420;z-index:-1;} #pageInner .pg-card-in{display:block;padding:14px 16px;} #pageInner .pg-h4{font-size:13px;font-weight:800;color:#E0E6ED;margin:0 0 10px;} #pageInner .pg-p{font-size:12px;color:#A0B3C9;line-height:1.5;margin:0 0 12px;} #pageInner .pg-status{position:relative;isolation:isolate;clip-path:var(--pg-clip-sm);background:rgba(255,180,0,.55);padding:1px;margin-bottom:12px;} #pageInner .pg-status::before{content:'';position:absolute;inset:1px;clip-path:var(--pg-clip-sm);background:#0d1420;z-index:-1;} #pageInner .pg-status-in{display:block;padding:10px 12px;font-size:12px;color:#A0B3C9;} #pageInner .pg-lbl{display:block;font-size:11px;color:#A0B3C9;margin-bottom:6px;} #pageInner .pg-rim{position:relative;isolation:isolate;clip-path:var(--pg-clip-sm);background:rgba(26,255,156,.35);padding:1px;display:block;margin-bottom:10px;} #pageInner .pg-rim::before{content:'';position:absolute;inset:1px;clip-path:var(--pg-clip-sm);background:#0d1420;z-index:-1;} #pageInner .pg-rim-in{display:flex;align-items:center;gap:8px;} #pageInner .pg-input,#pageInner .pg-select{flex:1;width:100%;box-sizing:border-box;background:transparent;border:0;border-radius:0;color:#E0E6ED;padding:10px 14px;font-size:12px;outline:none;margin:0;} #pageInner .pg-select option{background:#0d1420;color:#E0E6ED;} #pageInner .api-status{font-size:14px;min-width:24px;text-align:center;color:#A0B3C9;padding-right:10px;} #pageInner .api-status.valid{color:var(--primary,#00FFA3);} #pageInner .api-status.invalid{color:#FF6B6B;} #pageInner .pg-btn{position:relative;isolation:isolate;clip-path:var(--pg-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:9px 16px;color:var(--primary,#00FFA3);font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;} #pageInner .pg-btn::before{content:'';position:absolute;inset:1px;clip-path:var(--pg-clip-asym);background:#0d1420;z-index:-1;} #pageInner .pg-btn:active{transform:scale(.97);} #pageInner .pg-primary{background:linear-gradient(135deg,var(--primary,#00FFA3),#00AA6E);color:#03130b;} #pageInner .pg-primary::before{display:none;} @media (hover:hover) and (pointer:fine){ #pageInner .pg-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} }`;

function injectCSS() {
    if (document.getElementById('settingsTheme')) return;
    const s = document.createElement('style');
    s.id = 'settingsTheme';
    s.textContent = SETTINGS_CSS;
    document.head.appendChild(s);
}

const PROVIDER_GROUPS = [
    { label: 'Gratis', keys: ['groq', 'huggingface', 'gemini', 'gemini15'] },
    { label: 'Google', keys: ['gemini15pro'] },
    { label: 'OpenAI (ChatGPT)', keys: ['openaimini', 'openai'] },
    { label: 'Anthropic (Claude)', keys: ['claudehaiku', 'claude', 'claudesonnet5', 'claudeopus'] },
    { label: 'DeepSeek', keys: ['deepseek', 'deepseekreasoner'] },
    { label: 'Alibaba (Qwen)', keys: ['qwenplus', 'qwen'] },
    { label: 'Lainnya', keys: ['cohere', 'mistral', 'ai21', 'perplexity', 'openrouter'] }
];

function isLocalLLMReady() {
    return !!(window.KesempatanLLM && typeof window.KesempatanLLM.isReady === 'function' && window.KesempatanLLM.isReady());
}







const LOCAL_MODEL_OPTIONS = [
    { value: 'smollm2-135m', label: 'SmolLM2 135M — Ringan & Cepat (~90 MB)' },
    { value: 'qwen2.5-0.5b', label: 'Qwen2.5 0.5B — Lebih Cerdas (~350 MB)' },
    { value: 'engine-50m-offline', label: 'Engine 50M — Cadangan Offline (<15 MB, tanpa internet)' }
];
const LOCAL_MODEL_CHOICE_KEY = 'kes_llm_model_choice';

function getLocalModelChoice() {
    if (window.KESEMPATAN?.WorkflowLLMBridge?.getPersistedModelChoice) {
        return window.KESEMPATAN.WorkflowLLMBridge.getPersistedModelChoice();
    }
    try {
        return localStorage.getItem(LOCAL_MODEL_CHOICE_KEY) || 'smollm2-135m';
    } catch (e) {
        return 'smollm2-135m';
    }
}

function buildLocalModelOptions() {
    const current = getLocalModelChoice();
    return LOCAL_MODEL_OPTIONS.map(function(opt) {
        return '<option value="' + opt.value + '"' + (opt.value === current ? ' selected' : '') + '>' + opt.label + '</option>';
    }).join('');
}

function buildProviderOptions() {
    const providers = (window.CONFIG && window.CONFIG.PROVIDERS) || {};
    const currentProvider = window.CONFIG ? window.CONFIG.AI_PROVIDER : '';
    let html = '<option value="local"' + (currentProvider === 'local' ? ' selected' : '') + '>LLM Lokal (Prioritas, Tanpa API Key)</option>';
    const grouped = new Set();
    PROVIDER_GROUPS.forEach(function(group) {
        const options = group.keys
            .filter(function(key) { return providers[key]; })
            .map(function(key) {
                grouped.add(key);
                const selected = currentProvider === key ? ' selected' : '';
                return '<option value="' + key + '"' + selected + '>' + providers[key].name + '</option>';
            }).join('');
        if (options) {
            html += '<optgroup label="' + group.label + '">' + options + '</optgroup>';
        }
    });
    const ungrouped = Object.keys(providers).filter(function(k) { return k !== 'local' && !grouped.has(k); });
    if (ungrouped.length > 0) {
        html += '<optgroup label="Lainnya">' + ungrouped.map(function(key) {
            const selected = currentProvider === key ? ' selected' : '';
            return '<option value="' + key + '"' + selected + '>' + providers[key].name + '</option>';
        }).join('') + '</optgroup>';
    }
    return html;
}

function render() {
    injectCSS();
    const inner = document.getElementById('pageInner');
    if (!inner) return;
    const providerOptions = buildProviderOptions();
    const currentProvider = window.CONFIG ? window.CONFIG.AI_PROVIDER : '';
    const currentApiKey = (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS[currentProvider]) || '';
    const localReady = isLocalLLMReady();
    inner.innerHTML =
        '<div class="pg-wrap">' +
        '<h3 class="pg-title">Pengaturan Sistem</h3>' +
        '<div class="pg-card"><span class="pg-card-in">' +
        '<div class="pg-h4">Konfigurasi AI</div>' +
        '<p class="pg-p">KESEMPATAN OS memprioritaskan <strong>LLM Lokal</strong> (jalan langsung di perangkat, tidak butuh API key, tidak ada biaya). Provider eksternal di bawah ini bersifat <strong>opsional</strong> — cuma dipakai sebagai cadangan kalau LLM Lokal belum siap atau hasilnya ingin dibandingkan.</p>' +
        '<div id="localLlmStatusCard" class="pg-status"><span class="pg-status-in"><strong>LLM Lokal:</strong> <span style="color:' + (localReady ? '#00FFA3' : '#FFB400') + ';">' + (localReady ? 'Siap dipakai' : 'Belum siap / masih menyiapkan') + '</span></span></div>' +
        '<label class="pg-lbl" for="localModelChoiceSelect">Model lokal (100% gratis, tanpa API key, tanpa login Hugging Face)</label>' +
        '<span class="pg-rim"><span class="pg-rim-in"><select id="localModelChoiceSelect" class="pg-select">' + buildLocalModelOptions() + '</select></span></span>' +
        '<p class="pg-p" style="margin-top:-4px;font-size:11px;">Model pretrained diunduh otomatis SATU KALI (progress muncul di bawah layar), lalu dicache di perangkat ini. "Engine 50M" tidak mengunduh apa pun — jalan instan tanpa internet.</p>' +
        '<label class="pg-lbl" for="aiProviderSelect">Pilih sumber AI</label>' +
        '<span class="pg-rim"><span class="pg-rim-in"><select id="aiProviderSelect" class="pg-select">' + providerOptions + '</select></span></span>' +
        '<div id="externalProviderFields">' +
        '<span class="pg-rim"><span class="pg-rim-in"><input type="password" id="settingApiKey" class="pg-input" placeholder="API Key" value="' + currentApiKey.replace(/./g, '•') + '"><span id="apiKeyStatusIcon" class="api-status">-</span></span></span>' +
        '<div id="apiKeyMessage" class="pg-lbl">Masukkan API Key</div>' +
        '</div>' +
        '<button id="saveSettingsBtn" class="pg-btn pg-primary">Simpan</button>' +
        '</span></div>' +
        '<div class="pg-card"><span class="pg-card-in">' +
        '<div class="pg-h4">Cloud Sync (Supabase)</div>' +
        '<div id="supabaseStatus" class="pg-p" style="margin-bottom:10px;">Belum login</div>' +
        '<span class="pg-rim"><span class="pg-rim-in"><input type="email" id="supabaseEmail" class="pg-input" placeholder="Email"></span></span>' +
        '<span class="pg-rim"><span class="pg-rim-in"><input type="password" id="supabasePassword" class="pg-input" placeholder="Password"></span></span>' +
        '<div class="pg-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<button id="supabaseLoginBtn" class="pg-btn">Login</button>' +
        '<button id="supabaseSignupBtn" class="pg-btn">Daftar</button>' +
        '<button id="supabaseLogoutBtn" class="pg-btn" style="display:none;">Logout</button>' +
        '</div>' +
        '<div class="pg-row" style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button id="syncToCloudBtn" class="pg-btn" style="display:none;">Simpan ke Cloud</button>' +
        '<button id="loadFromCloudBtn" class="pg-btn" style="display:none;">Muat dari Cloud</button>' +
        '</div>' +
        '</span></div>' +
        '<div class="pg-card"><span class="pg-card-in">' +
        '<div class="pg-h4">Info Sistem</div>' +
        '<p class="pg-p" style="margin-bottom:4px;">IndexedDB: Aktif</p>' +
        '<p class="pg-p" style="margin-bottom:0;">Cache: <span id="cacheCountInfo">0</span> entri</p>' +
        '</span></div>' +
        '</div>';

    if (window.ResponseCacheManager) {
        window.ResponseCacheManager.getStats().then(function(stats) {
            const cacheSpan = document.getElementById('cacheCountInfo');
            if (cacheSpan) cacheSpan.textContent = stats.valid;
        }).catch(function(e) { console.warn('[Settings] ResponseCacheManager.getStats failed:', e.message); });
    }

    const providerSelect = document.getElementById('aiProviderSelect');
    const apiKeyInput = document.getElementById('settingApiKey');
    const apiKeyStatus = document.getElementById('apiKeyStatusIcon');
    const apiKeyMessage = document.getElementById('apiKeyMessage');
    const externalFields = document.getElementById('externalProviderFields');

    function toggleExternalFields() {
        const isLocal = providerSelect && providerSelect.value === 'local';
        if (externalFields) externalFields.style.display = isLocal ? 'none' : 'block';
    }

    async function checkApiKeyStatus() {
        const provider = providerSelect ? providerSelect.value : '';
        if (provider === 'local') return;
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
        if (!apiKey) {
            if (apiKeyStatus) apiKeyStatus.textContent = '-';
            if (apiKeyMessage) apiKeyMessage.textContent = 'Masukkan API Key';
            return;
        }
        if (apiKeyStatus) apiKeyStatus.textContent = '...';
        const isValid = window.AIClients && window.AIClients.validateApiKey ? await window.AIClients.validateApiKey(provider, apiKey) : false;
        if (isValid) {
            if (apiKeyStatus) { apiKeyStatus.textContent = 'OK'; apiKeyStatus.className = 'api-status valid'; }
            if (apiKeyMessage) apiKeyMessage.textContent = 'API Key valid';
        } else {
            if (apiKeyStatus) { apiKeyStatus.textContent = 'X'; apiKeyStatus.className = 'api-status invalid'; }
            if (apiKeyMessage) apiKeyMessage.textContent = 'API Key tidak valid';
        }
    }

    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', function() {
            setTimeout(checkApiKeyStatus, 500);
        });
    }

    if (providerSelect) {
        providerSelect.addEventListener('change', function() {
            toggleExternalFields();
            if (providerSelect.value === 'local') return;
            const newApiKey = (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS[providerSelect.value]) || '';
            if (apiKeyInput) apiKeyInput.value = newApiKey.replace(/./g, '•');
            checkApiKeyStatus();
        });
    }

    toggleExternalFields();
    setTimeout(checkApiKeyStatus, 100);

    const localModelSelect = document.getElementById('localModelChoiceSelect');
    if (localModelSelect) {
        localModelSelect.addEventListener('change', function() {
            const choice = localModelSelect.value;
            try {
                localStorage.setItem(LOCAL_MODEL_CHOICE_KEY, choice);
            } catch (e) {
                if (showToast) showToast('Gagal menyimpan pilihan model: ' + e.message, 'error');
                return;
            }
            
            
            
            window.__kesempatanLLM2SkipThisSession = false;
            const label = LOCAL_MODEL_OPTIONS.find(function(o) { return o.value === choice; });
            if (showToast) {
                showToast('✅ Model lokal: ' + (label ? label.label : choice) + ' (dipakai mulai eksekusi berikutnya)', 'success');
            }
        });
    }

    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const provider = providerSelect.value;
            if (provider === 'local') {
                window.CONFIG.AI_PROVIDER = 'local';
                localStorage.setItem('kes_ai_provider', 'local');
                if (showToast) showToast('LLM Lokal dipilih sebagai prioritas', 'success');
                return;
            }
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                if (showToast) showToast('API Key harus diisi', 'error');
                return;
            }
            const isValid = window.AIClients && window.AIClients.validateApiKey ? await window.AIClients.validateApiKey(provider, apiKey) : false;
            if (!isValid) {
                if (showToast) showToast('API Key tidak valid', 'error');
                return;
            }
            window.CONFIG.AI_PROVIDER = provider;
            window.CONFIG.API_KEYS[provider] = apiKey;
            localStorage.setItem('kes_ai_provider', provider);
            localStorage.setItem('kes_api_key_' + provider, btoa(encodeURIComponent(apiKey)));
            if (showToast) showToast('Pengaturan tersimpan', 'success');
            const mainApiInput = document.getElementById('apiKeyInput');
            if (mainApiInput) mainApiInput.value = apiKey;
        });
    }

    setTimeout(function() {
        const sbStatus = document.getElementById('supabaseStatus');
        const loginBtn = document.getElementById('supabaseLoginBtn');
        const signupBtn = document.getElementById('supabaseSignupBtn');
        const logoutBtn = document.getElementById('supabaseLogoutBtn');
        if (loginBtn) {
            loginBtn.onclick = function() {
                if (sbStatus) sbStatus.textContent = 'Login (demo)';
                loginBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
            };
            if (signupBtn) {
                signupBtn.onclick = function() {
                    if (sbStatus) sbStatus.textContent = 'Pendaftaran (demo)';
                };
            }
            if (logoutBtn) {
                logoutBtn.onclick = function() {
                    if (sbStatus) sbStatus.textContent = 'Belum login';
                    loginBtn.style.display = 'inline-block';
                    if (signupBtn) signupBtn.style.display = 'inline-block';
                    logoutBtn.style.display = 'none';
                };
            }
        }
    }, 100);
}

export const SettingsPage = Object.freeze({ render: render });
KESEMPATAN.SettingsPage = SettingsPage;
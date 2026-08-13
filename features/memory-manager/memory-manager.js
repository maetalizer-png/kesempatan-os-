import { Utils } from '../../js/core/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const InternalLogger = (function() {
    const _logs = [];
    const _maxLogs = 50;
    const _levels = { INFO: 1, WARN: 2, ERROR: 3 };
    function log(level, module, message) {
        const entry = { timestamp: Date.now(), level: level, module: module, message: message };
        _logs.push(entry);
        if (_logs.length > _maxLogs) _logs.shift();
        return entry;
    }
    return Object.freeze({
        info: function(m, msg) { return log(_levels.INFO, m, msg); },
        warn: function(m, msg) { return log(_levels.WARN, m, msg); },
        error: function(m, msg) { return log(_levels.ERROR, m, msg); },
        getLogs: function(l) { return _logs.slice(-(l || 20)); }
    });
})();

const showToast = Utils.showToast;

function escapeHtml(text) {
    if (!text) return '';
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(text);
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showConfirmDialog(title, message, onConfirm, confirmText) {
    confirmText = confirmText || 'Ya';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#10161f;border-radius:16px;padding:24px;max-width:400px;width:90%;border:1px solid rgba(0,255,163,0.2);';
    box.innerHTML = '<h3 style="color:#FF6B6B;margin:0 0 8px 0;font-size:16px;">' + escapeHtml(title) + '</h3>' +
        '<p style="color:#A0B3C9;margin:0 0 20px 0;font-size:13px;line-height:1.5;">' + escapeHtml(message) + '</p>' +
        '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
        '<button class="confirm-cancel" style="padding:8px 20px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:30px;color:#A0B3C9;cursor:pointer;font-size:13px;">Batal</button>' +
        '<button class="confirm-ok" style="padding:8px 20px;background:#FF4444;border:none;border-radius:30px;color:white;font-weight:bold;cursor:pointer;font-size:13px;">' + escapeHtml(confirmText) + '</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const close = function() { overlay.remove(); };
    const cancelBtn = box.querySelector('.confirm-cancel');
    const okBtn = box.querySelector('.confirm-ok');
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (okBtn) okBtn.addEventListener('click', function() { close(); if (typeof onConfirm === 'function') onConfirm(); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
}

function injectCSS() {
    if (document.getElementById('memoryStyle')) return;
    const s = document.createElement('style');
    s.id = 'memoryStyle';
    s.textContent =
        ':root{--mm-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--mm-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));}' +
        '.mm-btn{position:relative;isolation:isolate;clip-path:var(--mm-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:11px 16px;color:#00FFA3;font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;}' +
        '.mm-btn::before{content:"";position:absolute;inset:1px;clip-path:var(--mm-clip-asym);background:#0a1014;z-index:-1;}' +
        '.mm-btn:active{transform:scale(.97);}' +
        '.mm-btn.warn{background:rgba(255,170,0,.5);color:#FFC04D;}' +
        '.mm-btn.warn::before{background:#160f02;}' +
        '.mm-btn.danger{background:rgba(255,68,68,.5);color:#FF8080;}' +
        '.mm-btn.danger::before{background:#160608;}' +
        '.mm-btn.primary{background:linear-gradient(135deg,#00FFA3,#00AA6E);color:#03130b;}' +
        '.mm-btn.primary::before{display:none;}' +
        '.mm-rim{position:relative;isolation:isolate;clip-path:var(--mm-clip-sm);background:rgba(26,255,156,.3);padding:1px;display:block;}' +
        '.mm-rim::before{content:"";position:absolute;inset:1px;clip-path:var(--mm-clip-sm);background:#0a1014;z-index:-1;}' +
        '.mm-input{display:block;width:100%;box-sizing:border-box;background:transparent;border:0;border-radius:0;color:#E0E6ED;padding:11px 14px;font-size:13px;outline:none;margin:0;}' +
        '@media (hover:hover) and (pointer:fine){.mm-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.3));}}';
    document.head.appendChild(s);
}

const _state = {
    intervalId: null,
    handlers: [],
    isRendering: false,
    lastCount: null,
    autoRefreshInterval: 10000,
    isPageVisible: true,
    searchQuery: '',
    searchResults: [],
    searchDebounceId: null,
    searchRequestId: 0
};

async function getMemoryStats() {
    try {
        if (!window.VectorMemory || typeof window.VectorMemory.getCount !== 'function') {
            return { count: 0, available: false, error: 'VectorMemory tidak tersedia' };
        }
        const count = await window.VectorMemory.getCount();
        return { count: count || 0, available: true };
    } catch (e) {
        InternalLogger.error('MemoryManager', 'Gagal stats: ' + e.message);
        return { count: 0, available: false, error: e.message };
    }
}

async function getMaxCapacity() {
    try {
        if (window.VectorMemory && typeof window.VectorMemory.getMaxCapacity === 'function') {
            return (await window.VectorMemory.getMaxCapacity()) || 500;
        }
        return 500;
    } catch (e) { return 500; }
}

async function searchMemory(query) {
    if (!query || query.length < 2) { _state.searchResults = []; return []; }
    try {
        if (!window.VectorMemory || typeof window.VectorMemory.search !== 'function') return [];
        const results = await window.VectorMemory.search(query, 10);
        _state.searchResults = results || [];
        return _state.searchResults;
    } catch (e) {
        InternalLogger.error('MemoryManager', 'Gagal search: ' + e.message);
        return [];
    }
}

function updateStatsUI(stats, maxCapacity) {
    const el = document.getElementById('memoryStats');
    if (!el) return;
    if (!stats.available) {
        el.innerHTML = '<span style="color:#e74c3c;font-size:12px;">' + escapeHtml(stats.error || 'VectorMemory tidak tersedia') + '</span>';
        return;
    }
    const count = stats.count || 0;
    const cap = maxCapacity || 500;
    const pct = Math.min(100, Math.round((count / cap) * 100));
    const color = pct >= 80 ? '#e74c3c' : (pct >= 60 ? '#f39c12' : '#2ecc71');
    el.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:10px;">' +
        '<span style="font-size:26px;font-weight:800;color:#E0E6ED;">' + count + ' <span style="font-size:11px;font-weight:400;color:#7c8a99;margin-left:6px;">entri tersimpan</span></span>' +
        '<span style="font-size:11px;color:#7c8a99;">Kapasitas: <strong style="color:#A0B3C9;">' + cap + 'MB+</strong></span>' +
        '<span style="font-size:12px;font-weight:700;color:' + color + ';">' + pct + '% terpakai</span></div>' +
        '<div style="width:100%;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:8px;overflow:hidden;">' +
        '<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:2px;transition:width .5s ease;"></div></div>' +
        '<div style="font-size:10px;color:#5a6a7a;margin-top:6px;">' +
        (pct >= 80 ? 'Memori hampir penuh! Pertimbangkan pruning.' : pct >= 60 ? 'Memori mulai penuh. Pruning direkomendasikan.' : 'Ruang memori tersedia.') + '</div>';
}

function updateSearchUI(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    if (!results || results.length === 0) {
        container.innerHTML = '<div style="color:#5a6a7a;text-align:center;padding:10px;font-size:12px;">Tidak ada hasil</div>';
        return;
    }
    container.innerHTML = results.map(function(item) {
        const text = item.text || item.content || '';
        const score = item.score || item.similarity || 0;
        const metadata = item.metadata || {};
        const agent = metadata.agent || 'Unknown';
        const summary = metadata.summary || text.substring(0, 100) + '...';
        return '<div style="padding:8px 0 8px 10px;border-left:2px solid #00FFA3;border-bottom:1px solid rgba(255,255,255,0.05);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">' +
            '<span style="color:#00FFA3;font-weight:500;font-size:12px;">' + escapeHtml(agent) + '</span>' +
            '<span style="color:#5a6a7a;font-size:10px;">' + Math.round(score * 100) + '%</span></div>' +
            '<div style="color:#A0B3C9;font-size:11px;margin-top:2px;">' + escapeHtml(summary) + '</div></div>';
    }).join('');
}

async function render() {
    if (_state.isRendering) return;
    _state.isRendering = true;
    injectCSS();
    const inner = document.getElementById('pageInner');
    if (!inner) { _state.isRendering = false; return; }
    const stats = await getMemoryStats();
    const maxCapacity = await getMaxCapacity();
    _state.lastCount = stats.count || 0;
    inner.innerHTML = '<div style="padding:20px;" role="main" aria-label="Memory Manager">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">' +
        '<div><h3 style="color:#00FFA3;margin:0 0 4px 0;font-size:20px;">Memory Manager</h3>' +
        '<p style="color:#A0B3C9;font-size:12px;margin:0;">Mengelola vector memory di IndexedDB (kapasitas ' + maxCapacity + 'MB+)' + (!_state.isPageVisible ? ' | Paused' : '') + '</p></div>' +
        '<button id="refreshMemoryBtn" class="mm-btn">Refresh</button></div>' +
        '<div id="memoryStats" style="margin-bottom:20px;"></div>' +
        '<div style="margin-bottom:20px;">' +
        '<span class="mm-rim"><input type="text" id="searchMemoryInput" class="mm-input" placeholder="Cari entri memori (min 2 karakter)..." value="' + escapeHtml(_state.searchQuery) + '"></span>' +
        '<button id="clearSearchBtn" class="mm-btn" style="margin-top:8px;padding:6px 14px;font-size:10px;' + (_state.searchQuery ? '' : 'display:none;') + '">✕</button>' +
        '<div id="searchResults" style="margin-top:10px;max-height:200px;overflow-y:auto;' + (_state.searchResults.length === 0 ? 'display:none;' : '') + '"></div></div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:20px;">' +
        '<button id="exportMemoryBtn" class="mm-btn">Export Memory</button>' +
        '<button id="importMemoryBtn" class="mm-btn">Import Memory</button>' +
        '<button id="pruneMemoryBtn" class="mm-btn warn">Pruning</button>' +
        '<button id="clearMemoryBtn" class="mm-btn danger">Hapus Semua</button></div>' +
        '<div id="progressContainer" style="display:none;margin-bottom:16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
        '<span id="progressLabel" style="color:#A0B3C9;font-size:12px;">Memproses...</span>' +
        '<span id="progressPercent" style="color:#00FFA3;font-size:12px;font-weight:bold;">0%</span></div>' +
        '<div style="width:100%;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:4px;overflow:hidden;">' +
        '<div id="progressFill" style="width:0%;height:100%;background:#00FFA3;border-radius:2px;transition:width .3s ease;"></div></div></div>' +
        '<div style="font-size:10px;color:#44556a;margin-top:16px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;text-align:center;">' +
        'Stats diperbarui otomatis setiap ' + (_state.autoRefreshInterval / 1000) + ' detik' +
        (!_state.isPageVisible ? ' | Auto-refresh paused' : '') +
        (_state.searchResults.length > 0 ? ' | ' + _state.searchResults.length + ' hasil' : '') + '</div>' +
        '<button onclick="window.showPage(\'dashboard\')" class="mm-btn primary" style="display:block;width:100%;margin-top:16px;">← Kembali ke Dasbor</button>' +
        '</div>';
    updateStatsUI(stats, maxCapacity);
    if (_state.searchResults.length > 0) {
        updateSearchUI(_state.searchResults);
        const r = document.getElementById('searchResults');
        if (r) r.style.display = 'block';
    }
    const container = inner.querySelector('div');
    if (container) {
        const handler = function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            const id = target.id;
            if (id === 'refreshMemoryBtn') {
                showToast('Memori direfresh', 'info');
                render();
            } else if (id === 'clearSearchBtn') {
                _state.searchQuery = '';
                _state.searchResults = [];
                const input = document.getElementById('searchMemoryInput');
                if (input) input.value = '';
                const resultsEl = document.getElementById('searchResults');
                if (resultsEl) resultsEl.style.display = 'none';
                target.style.display = 'none';
            } else if (id === 'exportMemoryBtn') {
                const count = _state.lastCount || 0;
                const run = function() {
                    try {
                        if (window.VectorMemory && typeof window.VectorMemory.exportJSON === 'function') {
                            window.VectorMemory.exportJSON();
                            showToast('Memori diekspor! (' + count + ' entries)', 'success');
                        } else showToast('VectorMemory tidak tersedia', 'warning');
                    } catch (e) { showToast('Gagal ekspor: ' + e.message, 'error'); }
                };
                if (count > 100) {
                    showConfirmDialog('Export Memory (' + count + ' entries)', 'Memori berisi ' + count + ' entri. File JSON mungkin besar. Lanjutkan?', run, 'Ya, Ekspor');
                } else run();
            } else if (id === 'importMemoryBtn') {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.style.display = 'none';
                document.body.appendChild(input);
                input.onchange = async function(e) {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const progressContainer = document.getElementById('progressContainer');
                    const progressFill = document.getElementById('progressFill');
                    const progressLabel = document.getElementById('progressLabel');
                    const progressPercent = document.getElementById('progressPercent');
                    if (progressContainer) progressContainer.style.display = 'block';
                    if (progressLabel) progressLabel.textContent = 'Mengimpor: ' + file.name;
                    try {
                        const text = await file.text();
                        if (progressFill) progressFill.style.width = '30%';
                        if (progressPercent) progressPercent.textContent = '30%';
                        if (window.VectorMemory && typeof window.VectorMemory.importJSON === 'function') {
                            await window.VectorMemory.importJSON(text, true);
                            if (progressFill) progressFill.style.width = '100%';
                            if (progressPercent) progressPercent.textContent = '100%';
                            if (progressLabel) progressLabel.textContent = 'Selesai: ' + file.name;
                            showToast('Memori diimpor! (' + file.name + ')', 'success');
                            setTimeout(function() {
                                if (progressContainer) progressContainer.style.display = 'none';
                                if (progressFill) progressFill.style.width = '0%';
                                render();
                            }, 1000);
                        } else {
                            showToast('VectorMemory tidak tersedia', 'warning');
                            if (progressContainer) progressContainer.style.display = 'none';
                        }
                    } catch (e) {
                        showToast('Gagal impor: ' + e.message, 'error');
                        if (progressContainer) progressContainer.style.display = 'none';
                    }
                    input.remove();
                };
                input.click();
            } else if (id === 'pruneMemoryBtn') {
                showConfirmDialog('Pruning Memory', 'Pruning akan menghapus entri memori yang jarang digunakan untuk mengoptimalkan ruang. Lanjutkan?', function() {
                    try {
                        if (window.VectorMemory && typeof window.VectorMemory.smartPrune === 'function') {
                            window.VectorMemory.smartPrune();
                            showToast('Pruning selesai!', 'success');
                            setTimeout(function() { render(); }, 500);
                        } else showToast('VectorMemory tidak tersedia', 'warning');
                    } catch (e) { showToast('Gagal pruning: ' + e.message, 'error'); }
                }, 'Ya, Prune');
            } else if (id === 'clearMemoryBtn') {
                showConfirmDialog('Hapus Semua Memori', 'Semua data memori akan dihapus permanen. Tindakan ini tidak dapat dibatalkan! Yakin?', async function() {
                    try {
                        if (window.VectorMemory && typeof window.VectorMemory.clear === 'function') {
                            await window.VectorMemory.clear();
                            _state.searchResults = [];
                            _state.searchQuery = '';
                            showToast('Semua memori dihapus!', 'success');
                            render();
                        } else showToast('VectorMemory tidak tersedia', 'warning');
                    } catch (e) { showToast('Gagal hapus: ' + e.message, 'error'); }
                }, 'Ya, Hapus Semua');
            }
        };
        container.addEventListener('click', handler);
        _state.handlers.push({ element: container, event: 'click', handler: handler });
    }
    const searchInput = document.getElementById('searchMemoryInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) {
        const searchHandler = function(e) {
            const query = e.target.value.trim();
            _state.searchQuery = query;
            if (clearSearchBtn) clearSearchBtn.style.display = query.length > 0 ? 'inline-block' : 'none';
            const resultsEl = document.getElementById('searchResults');

            if (_state.searchDebounceId) {
                clearTimeout(_state.searchDebounceId);
                _state.searchDebounceId = null;
            }

            if (query.length === 0) {
                _state.searchResults = [];
                if (resultsEl) resultsEl.style.display = 'none';
                return;
            }
            if (query.length < 2) {
                if (resultsEl) {
                    resultsEl.style.display = 'block';
                    resultsEl.innerHTML = '<div style="color:#5a6a7a;text-align:center;padding:10px;font-size:12px;">Ketik minimal 2 karakter untuk mencari</div>';
                }
                return;
            }

            
            
            
            
            _state.searchDebounceId = setTimeout(async function() {
                const requestId = ++_state.searchRequestId;
                const results = await searchMemory(query);
                if (requestId !== _state.searchRequestId) return;
                if (resultsEl) {
                    resultsEl.style.display = 'block';
                    if (results.length > 0) updateSearchUI(results);
                    else resultsEl.innerHTML = '<div style="color:#5a6a7a;text-align:center;padding:10px;font-size:12px;">Tidak ada hasil untuk "' + escapeHtml(query) + '"</div>';
                }
            }, 250);
        };
        searchInput.addEventListener('input', searchHandler);
        _state.handlers.push({ element: searchInput, event: 'input', handler: searchHandler });
        if (_state.searchQuery.length >= 2) {
            setTimeout(function() {
                searchInput.value = _state.searchQuery;
                searchInput.dispatchEvent(new Event('input'));
            }, 100);
        }
    }
    setupAutoRefresh();
    if (!window.__memoryManagerVisibilitySetup) {
        const visibilityHandler = function() {
            _state.isPageVisible = !document.hidden;
            if (_state.isPageVisible) setupAutoRefresh();
            else if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
        _state.handlers.push({ element: document, event: 'visibilitychange', handler: visibilityHandler });
        window.__memoryManagerVisibilitySetup = true;
    }
    _state.isRendering = false;
    InternalLogger.info('MemoryManager', 'Render complete - ' + (stats.count || 0) + ' entries');
}

function setupAutoRefresh() {
    if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    _state.intervalId = setInterval(async function() {
        if (!_state.isPageVisible) return;
        const inner = document.getElementById('pageInner');
        if (!inner || !inner.parentElement) return;
        if (inner.parentElement.style.display === 'none') return;
        const stats = await getMemoryStats();
        if (stats.count !== _state.lastCount) {
            _state.lastCount = stats.count;
            const maxCapacity = await getMaxCapacity();
            updateStatsUI(stats, maxCapacity);
        }
    }, _state.autoRefreshInterval);
}

function destroy() {
    const handlers = _state.handlers || [];
    handlers.forEach(function(h) { if (h.element && h.element.removeEventListener) h.element.removeEventListener(h.event, h.handler); });
    _state.handlers = [];
    if (_state.intervalId) { clearInterval(_state.intervalId); _state.intervalId = null; }
    if (_state.searchDebounceId) { clearTimeout(_state.searchDebounceId); _state.searchDebounceId = null; }
    window.__memoryManagerVisibilitySetup = false;
    _state.isRendering = false;
}

export const MemoryPage = {
    render: render,
    destroy: destroy,
    refresh: function() { render(); },
    search: function(q) { _state.searchQuery = q; render(); },
    getState: function() {
        return {
            handlers: _state.handlers.length,
            isRendering: _state.isRendering,
            autoRefreshInterval: _state.autoRefreshInterval,
            isPageVisible: _state.isPageVisible,
            lastCount: _state.lastCount,
            searchQuery: _state.searchQuery,
            searchResultsCount: _state.searchResults.length
        };
    },
    setAutoRefreshInterval: function(ms) {
        if (ms >= 3000) {
            _state.autoRefreshInterval = ms;
            setupAutoRefresh();
            showToast('Interval refresh: ' + (ms / 1000) + ' detik', 'info');
            return true;
        }
        showToast('Minimal 3 detik', 'warning');
        return false;
    }
};

KESEMPATAN.MemoryPage = MemoryPage;

const inner0 = document.getElementById('pageInner');
if (inner0 && inner0.parentElement && inner0.parentElement.style.display !== 'none') render();
window.addEventListener('beforeunload', function() { destroy(); });
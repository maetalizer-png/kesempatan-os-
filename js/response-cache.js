(function() {
'use strict';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const InternalLogger = (function() {
    const _logs = [];
    const _maxLogs = 50;
    const _levels = { INFO: 1, WARN: 2, ERROR: 3 };

    function log(level, module, message) {
        const entry = {
            timestamp: Date.now(),
            level: level,
            module: module,
            message: message,
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
        };
        _logs.push(entry);
        if (_logs.length > _maxLogs) _logs.shift();
        return entry;
    }

    return Object.freeze({
        info: function(module, message) { return log(_levels.INFO, module, message); },
        warn: function(module, message) { return log(_levels.WARN, module, message); },
        error: function(module, message) { return log(_levels.ERROR, module, message); },
        getLogs: function(limit) {
            limit = limit || 20;
            return _logs.slice(-limit);
        }
    });
})();

const Utils = window.KESEMPATAN?.Utils || window.Utils || {};
const showToast = Utils.showToast || window.showToast || function(msg, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    const colors = { error: '#e74c3c', success: '#2ecc71', warning: '#f39c12', info: '#3498db' };
    toast.style.borderLeftColor = colors[type] || '#00FFA3';
    container.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3500);
};

function escapeHtml(text) {
    if (!text) return '';
    const globalEscape = window.KESEMPATAN?.Utils?.escapeHtml || window.escapeHtml;
    if (typeof globalEscape === 'function') return globalEscape(text);
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showConfirmDialog(title, message, onConfirm, confirmText) {
    confirmText = confirmText || 'Ya';
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e;border-radius:16px;padding:24px;max-width:400px;width:90%;border:1px solid rgba(0,255,163,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.5);';
    box.innerHTML =
        '<h3 style="color:#FF6B6B;margin:0 0 8px 0;font-size:16px;">' + escapeHtml(title) + '</h3>' +
        '<p style="color:#A0B3C9;margin:0 0 20px 0;font-size:13px;line-height:1.5;">' + escapeHtml(message) + '</p>' +
        '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
            '<button class="confirm-cancel" style="padding:8px 20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:30px;color:#A0B3C9;cursor:pointer;font-size:13px;">Batal</button>' +
            '<button class="confirm-ok" style="padding:8px 20px;background:#FF4444;border:none;border-radius:30px;color:white;font-weight:bold;cursor:pointer;font-size:13px;">' + escapeHtml(confirmText) + '</button>' +
        '</div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const close = function() { overlay.remove(); };
    const cancelBtn = box.querySelector('.confirm-cancel');
    const okBtn = box.querySelector('.confirm-ok');
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (okBtn) {
        okBtn.addEventListener('click', function() {
            close();
            if (typeof onConfirm === 'function') onConfirm();
        });
    }
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) close();
    });
    if (!document.getElementById('confirmFadeStyle')) {
        const style = document.createElement('style');
        style.id = 'confirmFadeStyle';
        style.textContent = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }';
        document.head.appendChild(style);
    }
}

const _state = {
    appDatabase: null,
    intervalId: null,
    handlers: [],
    isRendering: false,
    lastStats: null,
    autoRefreshInterval: 10000,
    isPageVisible: true,
    searchQuery: '',
    allCache: [],
    filteredCache: [],
    cacheSupportWarned: false
};

function dbSupportsCache(db) {
    const isSupported = !!db &&
        typeof db.getAllCache === 'function' &&
        typeof db.getCachedResponse === 'function' &&
        typeof db.setCachedResponse === 'function' &&
        typeof db.deleteCachedResponse === 'function' &&
        typeof db.clearCache === 'function';
    if (!isSupported && !_state.cacheSupportWarned) {
        _state.cacheSupportWarned = true;
        InternalLogger.warn('ResponseCache', 'appDatabase belum implementasi method cache — fitur cache nonaktif.');
    }
    return isSupported;
}

function setDatabase(db) {
    _state.appDatabase = db;
    InternalLogger.info('ResponseCache', 'Database set');
}

async function getKey(prompt, agentName, model) {
    let hash = 0;
    const str = agentName + '|' + model + '|' + prompt.substring(0, 500);
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(36);
}

async function getCachedResponse(prompt, agentName, model) {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) return null;
    const key = await getKey(prompt, agentName, model);
    try {
        return await db.getCachedResponse(key);
    } catch (e) {
        InternalLogger.error('ResponseCache', 'Get failed: ' + e.message);
        return null;
    }
}

async function setCachedResponse(prompt, agentName, model, response) {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) return;
    const key = await getKey(prompt, agentName, model);
    try {
        await db.setCachedResponse(key, agentName, response);
        updateStatsDisplay();
        InternalLogger.info('ResponseCache', 'Cached: ' + agentName);
    } catch (e) {
        InternalLogger.error('ResponseCache', 'Set failed: ' + e.message);
    }
}

async function clearAllCache() {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) return;
    try {
        await db.clearCache();
        _state.allCache = [];
        _state.filteredCache = [];
        updateStatsDisplay();
        InternalLogger.info('ResponseCache', 'Cache cleared');
    } catch (e) {
        InternalLogger.error('ResponseCache', 'Clear failed: ' + e.message);
        throw e;
    }
}

async function deleteSingleCache(key) {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) return;
    try {
        await db.deleteCachedResponse(key);
        _state.allCache = _state.allCache.filter(function(e) { return e.key !== key; });
        _state.filteredCache = _state.filteredCache.filter(function(e) { return e.key !== key; });
        updateStatsDisplay();
        InternalLogger.info('ResponseCache', 'Deleted entry: ' + key);
    } catch (e) {
        InternalLogger.error('ResponseCache', 'Delete failed: ' + e.message);
        throw e;
    }
}

async function getStats() {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) return { total: 0, valid: 0, agents: [], sizeBytes: 0, sizeMB: '0' };
    try {
        const allCache = await db.getAllCache();
        _state.allCache = allCache || [];
        const now = Date.now();
        const valid = allCache.filter(function(e) {
            return (now - e.timestamp) < 3600000;
        });
        const agents = {};
        allCache.forEach(function(e) {
            if (e.agent) agents[e.agent] = (agents[e.agent] || 0) + 1;
        });
        const agentList = Object.keys(agents).map(function(a) {
            return { agent: a, count: agents[a] };
        }).sort(function(a, b) { return b.count - a.count; });
        let sizeBytes = 0;
        allCache.forEach(function(e) {
            try {
                const str = JSON.stringify(e);
                sizeBytes += str.length * 2;
            } catch (err) { InternalLogger.warn('ResponseCache', 'Size calc skipped for entry: ' + err.message); }
        });
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        return {
            total: allCache.length,
            valid: valid.length,
            agents: agentList.slice(0, 10),
            sizeBytes: sizeBytes,
            sizeMB: sizeMB
        };
    } catch (e) {
        InternalLogger.error('ResponseCache', 'Stats failed: ' + e.message);
        return { total: 0, valid: 0, agents: [], sizeBytes: 0, sizeMB: '0' };
    }
}

function filterCache(query) {
    const allCache = _state.allCache || [];
    if (!query || query.length < 2) {
        _state.filteredCache = allCache.slice(0, 20);
        return _state.filteredCache;
    }
    const lower = query.toLowerCase();
    _state.filteredCache = allCache.filter(function(e) {
        return (e.agent || '').toLowerCase().includes(lower) ||
               (e.key || '').toLowerCase().includes(lower) ||
               (e.response || '').toLowerCase().includes(lower);
    }).slice(0, 20);
    return _state.filteredCache;
}

function updateStatsDisplay() {
    const statsDiv = document.getElementById('cacheStats');
    if (!statsDiv) return;
    getStats().then(function(stats) {
        _state.lastStats = stats;
        const color = stats.valid > 50 ? '#2ecc71' : (stats.valid > 20 ? '#f39c12' : '#e74c3c');
        statsDiv.style.display = 'block';
        statsDiv.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
                '<span><strong>' + stats.valid + '</strong> entri valid</span>' +
                '<span>Total: <strong>' + stats.total + '</strong> entri</span>' +
                '<span><strong>' + stats.sizeMB + '</strong> MB</span>' +
                '<span style="color:' + color + ';">' + (stats.valid > 0 ? 'Cache aktif' : 'Tidak ada cache') + '</span>' +
            '</div>' +
            (stats.agents.length > 0 ?
                '<div style="font-size:10px;color:#666;margin-top:4px;">Top agents: ' +
                stats.agents.slice(0, 5).map(function(a) { return a.agent + ' (' + a.count + ')'; }).join(', ') +
                '</div>' : '');
    }).catch(function() {
        statsDiv.innerHTML = 'Gagal mengambil stats';
    });
}

function updatePageStats() {
    const statsDiv = document.getElementById('cachePageStats');
    if (!statsDiv) return;
    getStats().then(function(stats) {
        statsDiv.innerHTML =
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;">' +
                '<div style="text-align:center;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;"><div style="font-size:22px;font-weight:bold;color:#00FFA3;">' + stats.total + '</div><div style="font-size:9px;color:#A0B3C9;">Total Entries</div></div>' +
                '<div style="text-align:center;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;"><div style="font-size:22px;font-weight:bold;color:#2ecc71;">' + stats.valid + '</div><div style="font-size:9px;color:#A0B3C9;">Valid (≤1 jam)</div></div>' +
                '<div style="text-align:center;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;"><div style="font-size:22px;font-weight:bold;color:#3498db;">' + stats.sizeMB + '</div><div style="font-size:9px;color:#A0B3C9;">Size (MB)</div></div>' +
                '<div style="text-align:center;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px;"><div style="font-size:22px;font-weight:bold;color:#f39c12;">' + stats.agents.length + '</div><div style="font-size:9px;color:#A0B3C9;">Active Agents</div></div>' +
            '</div>' +
            (stats.agents.length > 0 ?
                '<div style="font-size:10px;color:#666;margin-top:8px;text-align:center;">Top Agent: <span style="color:#00FFA3;">' + escapeHtml(stats.agents[0].agent) + '</span> (' + stats.agents[0].count + ' entries)</div>' : '');
    });
}

function renderCacheList() {
    const container = document.getElementById('cacheList');
    if (!container) return;
    const cacheToShow = _state.filteredCache.length > 0 || _state.searchQuery.length >= 2
        ? _state.filteredCache
        : _state.allCache.slice(0, 20);

    if (cacheToShow.length === 0) {
        container.innerHTML =
            '<div style="color:#666;text-align:center;padding:30px 20px;">' +
                '<div style="font-size:13px;">' + (_state.searchQuery.length >= 2 ? 'Tidak ada hasil untuk "' + escapeHtml(_state.searchQuery) + '"' : 'Belum ada cache tersimpan') + '</div>' +
                (_state.searchQuery.length >= 2 ? '<div style="font-size:11px;color:#444;margin-top:4px;">Coba kata kunci lain</div>' : '') +
            '</div>';
        return;
    }

    container.innerHTML = cacheToShow.map(function(entry) {
        const age = Math.round((Date.now() - entry.timestamp) / 60000);
        const isExpired = age > 60;
        const color = isExpired ? '#e74c3c' : '#2ecc71';
        const preview = (entry.response || '').substring(0, 120) + (entry.response && entry.response.length > 120 ? '...' : '');
        const timeStr = age < 1 ? 'Just now' : age + 'm ago';
        return '<div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:12px 14px;margin-bottom:8px;border-left:3px solid ' + color + ';cursor:pointer;transition:background 0.2s;" class="cache-entry" data-key="' + escapeHtml(entry.key) + '">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<span style="color:#00FFA3;font-weight:600;font-size:13px;">' + escapeHtml(entry.agent || 'Unknown') + '</span>' +
                    (isExpired ? '<span style="font-size:8px;background:rgba(231,76,60,0.2);color:#e74c3c;padding:1px 8px;border-radius:10px;">EXPIRED</span>' : '<span style="font-size:8px;background:rgba(46,204,113,0.2);color:#2ecc71;padding:1px 8px;border-radius:10px;">ACTIVE</span>') +
                '</div>' +
                '<span style="color:#666;font-size:10px;">' + timeStr + '</span>' +
            '</div>' +
            '<div style="color:#A0B3C9;font-size:12px;margin-top:4px;line-height:1.4;">' + escapeHtml(preview) + '</div>' +
            '<div style="display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:#555;">' +
                '<span>' + escapeHtml(entry.key.substring(0, 12)) + '...</span>' +
                '<span>' + new Date(entry.timestamp).toLocaleString() + '</span>' +
            '</div>' +
        '</div>';
    }).join('');

    const listContainer = document.getElementById('cacheList');
    if (listContainer) {
        const oldHandler = listContainer._clickHandler;
        if (oldHandler) listContainer.removeEventListener('click', oldHandler);
        const handler = function(e) {
            const entryEl = e.target.closest('.cache-entry');
            if (!entryEl) return;
            const key = entryEl.dataset.key;
            const entry = _state.allCache.find(function(e) { return e.key === key; });
            if (entry) showCacheDetail(entry);
        };
        listContainer._clickHandler = handler;
        listContainer.addEventListener('click', handler);
        _state.handlers.push({ element: listContainer, event: 'click', handler: handler });
    }

    const countInfo = document.getElementById('cacheCountInfo');
    if (countInfo) {
        const total = _state.allCache.length;
        const shown = cacheToShow.length;
        countInfo.textContent = total > 20 ? 'Showing ' + shown + ' of ' + total + ' entries' : 'Showing ' + total + ' entries';
    }
}

function showCacheDetail(entry) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:99998;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.25s ease;';
    const age = Math.round((Date.now() - entry.timestamp) / 60000);
    const isExpired = age > 60;
    const statusColor = isExpired ? '#e74c3c' : '#2ecc71';
    const statusText = isExpired ? 'Expired' : 'Active';
    overlay.innerHTML =
        '<div style="background:#1a1a2e;border-radius:20px;padding:30px;max-width:650px;width:90%;max-height:85vh;overflow-y:auto;border:1px solid rgba(0,255,163,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">' +
                '<div>' +
                    '<h3 style="color:#00FFA3;margin:0 0 4px 0;font-size:20px;">Cache Detail</h3>' +
                    '<div style="color:#A0B3C9;font-size:12px;">Agent: <span style="color:#00FFA3;font-weight:500;">' + escapeHtml(entry.agent) + '</span><span style="color:#666;margin:0 6px;">|</span>Status: <span style="color:' + statusColor + ';">' + statusText + '</span></div>' +
                '</div>' +
                '<button class="close-detail-btn" style="background:rgba(255,255,255,0.05);border:none;color:#A0B3C9;font-size:20px;cursor:pointer;padding:4px 12px;border-radius:8px;transition:background 0.2s;">✕</button>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
                '<div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:10px 14px;"><div style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Key</div><div style="font-size:11px;color:#A0B3C9;word-break:break-all;font-family:monospace;">' + escapeHtml(entry.key) + '</div></div>' +
                '<div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:10px 14px;"><div style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Timestamp</div><div style="font-size:12px;color:#A0B3C9;">' + new Date(entry.timestamp).toLocaleString() + '</div><div style="font-size:10px;color:#666;">' + age + 'm ago</div></div>' +
            '</div>' +
            '<div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:14px;margin-bottom:16px;">' +
                '<div style="font-size:9px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Response</div>' +
                '<div style="font-size:13px;color:#A0B3C9;line-height:1.6;max-height:200px;overflow-y:auto;white-space:pre-wrap;font-family:monospace;background:rgba(0,0,0,0.2);padding:10px;border-radius:6px;">' + escapeHtml(entry.response || '') + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<button class="close-btn" style="flex:1;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:30px;color:#A0B3C9;cursor:pointer;transition:all 0.2s;">Tutup</button>' +
                '<button class="delete-entry-btn" style="flex:1;padding:10px;background:rgba(231,76,60,0.1);border:1px solid #e74c3c;border-radius:30px;color:#e74c3c;cursor:pointer;transition:all 0.2s;">Hapus Entry</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);

    const closeHandlers = function() { overlay.remove(); };
    overlay.querySelector('.close-detail-btn').addEventListener('click', closeHandlers);
    overlay.querySelector('.close-btn').addEventListener('click', closeHandlers);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('.delete-entry-btn').addEventListener('click', function() {
        showConfirmDialog(
            'Hapus Entry Cache',
            'Hapus cache untuk agent "' + escapeHtml(entry.agent) + '"?',
            async function() {
                try {
                    await deleteSingleCache(entry.key);
                    showToast('Entry cache dihapus!', 'success');
                    overlay.remove();
                    updatePageStats();
                    updateStatsDisplay();
                    renderCacheList();
                    renderCachePage();
                } catch (e) {
                    showToast('Gagal hapus: ' + e.message, 'error');
                }
            },
            'Ya, Hapus'
        );
    });

    overlay.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.02)'; });
        btn.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });
    });
}

async function exportCache() {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) {
        showToast('Fitur cache belum aktif di database', 'warning');
        return;
    }
    try {
        const cache = await db.getAllCache();
        const stats = await getStats();
        const exportData = {
            exportDate: new Date().toISOString(),
            cache: cache,
            stats: stats
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'kes_cache_backup_' + Date.now() + '.json';
        link.click();
        URL.revokeObjectURL(url);
        showToast('Cache berhasil diekspor! (' + cache.length + ' entri, ' + stats.sizeMB + ' MB)', 'success');
    } catch (e) {
        showToast('Gagal ekspor: ' + e.message, 'error');
        InternalLogger.error('ResponseCache', 'Export failed: ' + e.message);
    }
}

async function importCache(file) {
    const db = _state.appDatabase;
    if (!dbSupportsCache(db)) {
        showToast('Fitur cache belum aktif di database', 'warning');
        return;
    }
    try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!imported.cache || !Array.isArray(imported.cache)) {
            throw new Error('Format file tidak valid');
        }
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressLabel = document.getElementById('progressLabel');
        const progressPercent = document.getElementById('progressPercent');
        if (progressContainer) progressContainer.style.display = 'block';
        if (progressLabel) progressLabel.textContent = 'Mengimpor: ' + file.name;
        const total = imported.cache.length;
        for (let i = 0; i < total; i++) {
            const item = imported.cache[i];
            await db.setCachedResponse(item.key, item.agent, item.response);
            const percent = Math.round(((i + 1) / total) * 100);
            if (progressFill) progressFill.style.width = percent + '%';
            if (progressPercent) progressPercent.textContent = percent + '%';
        }
        if (progressFill) progressFill.style.width = '100%';
        if (progressPercent) progressPercent.textContent = '100%';
        if (progressLabel) progressLabel.textContent = 'Selesai: ' + file.name;
        await getStats();
        updateStatsDisplay();
        updatePageStats();
        renderCacheList();
        showToast('Cache diimpor! (' + total + ' entri)', 'success');
        setTimeout(function() {
            if (progressContainer) progressContainer.style.display = 'none';
            if (progressFill) progressFill.style.width = '0%';
        }, 1500);
    } catch (e) {
        showToast('Gagal impor: ' + e.message, 'error');
        InternalLogger.error('ResponseCache', 'Import failed: ' + e.message);
    }
}

function setupAutoRefresh() {
    if (_state.intervalId) {
        clearInterval(_state.intervalId);
        _state.intervalId = null;
    }
    _state.intervalId = setInterval(function() {
        if (!_state.isPageVisible) return;
        const inner = document.getElementById('pageInner');
        if (!inner || !inner.parentElement) return;
        if (inner.parentElement.style.display === 'none') return;
        getStats().then(function(stats) {
            if (stats.total !== _state.lastStats?.total) {
                _state.lastStats = stats;
                InternalLogger.info('ResponseCache', 'Stats updated: ' + stats.valid + ' valid');
                updateStatsDisplay();
                updatePageStats();
                renderCacheList();
            }
        });
    }, _state.autoRefreshInterval);
}

function setupPageVisibility() {
    const handler = function() {
        _state.isPageVisible = !document.hidden;
        if (_state.isPageVisible) {
            setupAutoRefresh();
        } else {
            if (_state.intervalId) {
                clearInterval(_state.intervalId);
                _state.intervalId = null;
            }
        }
    };
    document.addEventListener('visibilitychange', handler);
    return handler;
}

function showLoading(container) {
    if (!container) return;
    container.innerHTML = '';
    const loading = document.createElement('div');
    loading.style.cssText = 'padding:60px 20px;text-align:center;';
    loading.innerHTML =
        '<div style="display:inline-block;width:40px;height:40px;border:4px solid rgba(0,255,163,0.15);border-top-color:#00FFA3;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:16px;"></div>' +
        '<p style="color:#A0B3C9;font-size:14px;">Memuat Response Cache...</p>' +
        '<style>@keyframes spin { to { transform: rotate(360deg); } }</style>';
    container.appendChild(loading);
}

function renderCachePage() {
    if (_state.isRendering) return;
    _state.isRendering = true;
    const container = document.getElementById('cachePage');
    if (!container) {
        _state.isRendering = false;
        InternalLogger.warn('ResponseCache', 'Container #cachePage tidak ditemukan');
        return;
    }
    showLoading(container);
    setTimeout(function() {
        try {
            getStats().then(function() {
                container.innerHTML = '';
                const wrapper = document.createElement('div');
                wrapper.style.padding = '20px';
                wrapper.setAttribute('role', 'main');
                wrapper.setAttribute('aria-label', 'Response Cache Manager');
                wrapper.innerHTML =
                    '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:20px;">' +
                        '<div><h3 style="color:#00FFA3;margin:0 0 4px 0;font-size:22px;font-weight:700;">Response Cache Manager</h3><p style="color:#A0B3C9;font-size:13px;margin:0;">Mengelola cache respons agen di IndexedDB' + (!_state.isPageVisible ? ' | Paused' : '') + '</p></div>' +
                        '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button id="refreshCacheBtn" class="execute-btn secondary" style="padding:6px 18px;font-size:12px;border-radius:30px;" aria-label="Refresh stats">Refresh</button></div>' +
                    '</div>' +
                    '<div style="background:rgba(0,255,163,0.03);border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid rgba(0,255,163,0.08);"><div id="cachePageStats" class="cache-stats" style="display:block;"></div></div>' +
                    '<div style="margin-bottom:16px;"><div style="display:flex;gap:10px;align-items:center;">' +
                        '<div style="flex:1;position:relative;"><input type="text" id="searchCacheInput" placeholder="Cari cache (agent, key, atau response)..." value="' + escapeHtml(_state.searchQuery) + '" style="width:100%;padding:12px 16px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,255,163,0.15);border-radius:12px;color:white;font-size:13px;transition:border-color 0.3s;"><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#666;font-size:11px;" id="cacheCountInfo">' + (_state.allCache.length > 20 ? 'Showing 20 of ' + _state.allCache.length : 'Showing ' + _state.allCache.length) + '</span></div>' +
                        '<button id="clearSearchBtn" class="execute-btn secondary" style="padding:6px 14px;font-size:11px;border-radius:30px;' + (_state.searchQuery ? '' : 'display:none;') + '">✕ Clear</button>' +
                    '</div></div>' +
                    '<div id="progressContainer" style="display:none;margin-bottom:16px;background:rgba(0,0,0,0.2);border-radius:12px;padding:16px;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;"><span id="progressLabel" style="color:#A0B3C9;font-size:13px;">Memproses...</span><span id="progressPercent" style="color:#00FFA3;font-size:14px;font-weight:bold;">0%</span></div>' +
                        '<div style="width:100%;height:6px;background:rgba(255,255,255,0.05);border-radius:4px;margin-top:6px;overflow:hidden;"><div id="progressFill" style="width:0%;height:100%;background:linear-gradient(90deg,#00FFA3,#00AA6E);border-radius:4px;transition:width 0.4s ease;"></div></div>' +
                    '</div>' +
                    '<div style="background:rgba(0,0,0,0.15);border-radius:16px;padding:16px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.03);">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h4 style="color:#A0B3C9;margin:0;font-size:13px;font-weight:500;">Cache Entries</h4><span style="color:#666;font-size:10px;">Click entry for details</span></div>' +
                        '<div id="cacheList" style="max-height:350px;overflow-y:auto;padding-right:4px;"></div>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">' +
                        '<button id="exportCacheBtn" class="execute-btn secondary" style="padding:14px;font-size:13px;border-radius:12px;transition:all 0.2s;" aria-label="Export cache ke JSON">Export Cache</button>' +
                        '<button id="importCacheBtn" class="execute-btn secondary" style="padding:14px;font-size:13px;border-radius:12px;transition:all 0.2s;" aria-label="Import cache dari JSON">Import Cache</button>' +
                        '<button id="clearCacheBtn" class="execute-btn secondary" style="padding:14px;font-size:13px;border-radius:12px;border-color:#e74c3c;color:#e74c3c;transition:all 0.2s;" aria-label="Hapus semua cache">Clear All Cache</button>' +
                    '</div>' +
                    '<div style="font-size:10px;color:#444;margin-top:16px;border-top:1px solid rgba(255,255,255,0.03);padding-top:12px;text-align:center;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">' +
                        '<span>Cache berlaku 1 jam (otomatis di-prune)</span>' +
                        (!_state.isPageVisible ? '<span>Auto-refresh paused</span>' : '') +
                        '<span>Refresh setiap ' + (_state.autoRefreshInterval / 1000) + 's</span>' +
                    '</div>';
                container.appendChild(wrapper);
                updatePageStats();
                renderCacheList();

                const handler = function(e) {
                    const target = e.target.closest('button');
                    if (!target) return;
                    const id = target.id;
                    if (id === 'refreshCacheBtn') {
                        showToast('Cache direfresh', 'info');
                        getStats().then(function() {
                            updatePageStats();
                            updateStatsDisplay();
                            renderCacheList();
                        });
                    } else if (id === 'clearSearchBtn') {
                        _state.searchQuery = '';
                        const input = document.getElementById('searchCacheInput');
                        if (input) input.value = '';
                        _state.filteredCache = [];
                        target.style.display = 'none';
                        renderCacheList();
                    } else if (id === 'exportCacheBtn') {
                        getStats().then(function(stats) {
                            if (stats.total > 100) {
                                showConfirmDialog(
                                    'Export Cache (' + stats.total + ' entries)',
                                    'Cache berisi ' + stats.total + ' entri (' + stats.sizeMB + ' MB). File JSON mungkin besar. Lanjutkan?',
                                    function() { exportCache(); },
                                    'Ya, Ekspor'
                                );
                            } else {
                                exportCache();
                            }
                        });
                    } else if (id === 'importCacheBtn') {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.style.display = 'none';
                        document.body.appendChild(input);
                        input.onchange = function(e) {
                            const file = e.target.files && e.target.files[0];
                            if (file) importCache(file);
                            input.remove();
                        };
                        input.click();
                    } else if (id === 'clearCacheBtn') {
                        getStats().then(function(stats) {
                            showConfirmDialog(
                                'Clear All Cache',
                                'Semua cache respons agen (' + stats.total + ' entries, ' + stats.sizeMB + ' MB) akan dihapus permanen. Tindakan ini tidak dapat dibatalkan! Yakin?',
                                async function() {
                                    try {
                                        await clearAllCache();
                                        showToast('Semua cache dihapus!', 'success');
                                        updatePageStats();
                                        updateStatsDisplay();
                                        renderCacheList();
                                        renderCachePage();
                                    } catch (e) {
                                        showToast('Gagal hapus: ' + e.message, 'error');
                                    }
                                },
                                'Ya, Hapus Semua'
                            );
                        });
                    }
                };
                wrapper.addEventListener('click', handler);
                _state.handlers.push({ element: wrapper, event: 'click', handler: handler });

                const searchInput = document.getElementById('searchCacheInput');
                const clearSearchBtn = document.getElementById('clearSearchBtn');
                if (searchInput) {
                    const searchHandler = function(e) {
                        const query = e.target.value.trim();
                        _state.searchQuery = query;
                        if (clearSearchBtn) {
                            clearSearchBtn.style.display = query.length > 0 ? 'inline-block' : 'none';
                        }
                        if (query.length >= 2) {
                            filterCache(query);
                        } else {
                            _state.filteredCache = [];
                        }
                        renderCacheList();
                    };
                    searchInput.addEventListener('input', searchHandler);
                    _state.handlers.push({ element: searchInput, event: 'input', handler: searchHandler });
                    if (_state.searchQuery.length >= 2) {
                        searchInput.value = _state.searchQuery;
                        filterCache(_state.searchQuery);
                        renderCacheList();
                    }
                }

                setupAutoRefresh();
                if (!window.__responseCacheVisibilitySetup) {
                    const visibilityHandler = setupPageVisibility();
                    _state.handlers.push({ element: document, event: 'visibilitychange', handler: visibilityHandler });
                    window.__responseCacheVisibilitySetup = true;
                }
                _state.isRendering = false;
                InternalLogger.info('ResponseCache', 'Render complete - ' + _state.allCache.length + ' entries');
            });
        } catch (e) {
            _state.isRendering = false;
            InternalLogger.error('ResponseCache', 'Render error: ' + e.message);
            showToast('Gagal render: ' + e.message, 'error');
        }
    }, 100);
}

function destroy() {
    const handlers = _state.handlers || [];
    handlers.forEach(function(h) {
        if (h.element && h.element.removeEventListener) {
            h.element.removeEventListener(h.event, h.handler);
        }
    });
    _state.handlers = [];
    if (_state.intervalId) {
        clearInterval(_state.intervalId);
        _state.intervalId = null;
    }
    window.__responseCacheVisibilitySetup = false;
    _state.isRendering = false;
    InternalLogger.info('ResponseCache', 'Destroy complete');
}

const ResponseCacheManager = Object.freeze({
    get: getCachedResponse,
    set: setCachedResponse,
    clear: clearAllCache,
    delete: deleteSingleCache,
    getStats: getStats,
    exportCache: exportCache,
    importCache: importCache,
    updateStatsDisplay: updateStatsDisplay,
    setDatabase: setDatabase,
    renderPage: renderCachePage,
    search: filterCache
});

KESEMPATAN.ResponseCache = ResponseCacheManager;
window.ResponseCacheManager = ResponseCacheManager;
window.setCacheDatabase = setDatabase;

const CachePageManager = {
    render: renderCachePage,
    destroy: destroy,
    setDatabase: setDatabase,
    refresh: function() {
        getStats().then(function() {
            updatePageStats();
            updateStatsDisplay();
            renderCacheList();
        });
    },
    getState: function() {
        return {
            handlers: _state.handlers.length,
            isRendering: _state.isRendering,
            autoRefreshInterval: _state.autoRefreshInterval,
            isPageVisible: _state.isPageVisible,
            lastStats: _state.lastStats,
            totalEntries: _state.allCache.length,
            searchQuery: _state.searchQuery
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
// CachePage stays bare (in addition to the KESEMPATAN pointer below) because
// cache-db-bridge.js reads window.CachePage directly as an explicit fallback
// when window.KESEMPATAN.ResponseCache isn't ready yet.
KESEMPATAN.CachePage = CachePageManager;
window.CachePage = CachePageManager;

const container = document.getElementById('cachePage');
if (container && container.parentElement && container.parentElement.style.display !== 'none') {
    renderCachePage();
}

window.addEventListener('beforeunload', function() {
    destroy();
});

InternalLogger.info('ResponseCache', 'Module loaded');
})();
export const InternalLogger = Object.freeze({
    _logs: [],
    _maxLogs: 1000,
    _levels: Object.freeze({ DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 }),
    _level: 1,
    log: function(level, module, message, data) {
        const entry = Object.freeze({
            timestamp: Date.now(),
            level: level,
            module: module,
            message: message,
            data: data || null,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
        });
        this._logs.push(entry);
        if (this._logs.length > this._maxLogs) this._logs.shift();
        return entry;
    },
    debug: function(module, message, data) { return this.log(this._levels.DEBUG, module, message, data); },
    info: function(module, message, data) { return this.log(this._levels.INFO, module, message, data); },
    warn: function(module, message, data) { return this.log(this._levels.WARN, module, message, data); },
    error: function(module, message, data) { return this.log(this._levels.ERROR, module, message, data); },
    critical: function(module, message, data) { return this.log(this._levels.CRITICAL, module, message, data); },
    getLogs: function(level, limit) {
        limit = limit || 100;
        let result = this._logs;
        if (level !== undefined) result = result.filter(function(log) { return log.level >= level; });
        return result.slice(-limit);
    },
    clear: function() { this._logs = []; },
    setLevel: function(level) { this._level = level; },
    getLevel: function() { return this._level; }
});

export const NotificationSystem = Object.freeze({
    _notifications: [],
    _maxNotifications: 100,
    _listeners: [],
    _types: Object.freeze({ SUCCESS: 'success', INFO: 'info', WARNING: 'warning', ERROR: 'error', CRITICAL: 'critical' }),
    notify: function(type, title, message, details) {
        const notification = Object.freeze({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
            type: type, title: title, message: message,
            details: details || null, timestamp: Date.now(), read: false
        });
        this._notifications.push(notification);
        if (this._notifications.length > this._maxNotifications) this._notifications.shift();
        for (let i = 0; i < this._listeners.length; i++) {
            try { this._listeners[i](notification); } catch (e) { console.warn('[AutoLearning] Notification listener failed:', e.message); }
        }
        const levelMap = { 'success': 1, 'info': 1, 'warning': 2, 'error': 3, 'critical': 4 };
        InternalLogger.log(levelMap[type] || 1, 'Notification', title + ': ' + message);
        return notification;
    },
    success: function(title, message, details) { return this.notify(this._types.SUCCESS, title, message, details); },
    info: function(title, message, details) { return this.notify(this._types.INFO, title, message, details); },
    warning: function(title, message, details) { return this.notify(this._types.WARNING, title, message, details); },
    error: function(title, message, details) { return this.notify(this._types.ERROR, title, message, details); },
    critical: function(title, message, details) { return this.notify(this._types.CRITICAL, title, message, details); },
    subscribe: function(listener) {
        this._listeners.push(listener);
        return function() {
            const index = this._listeners.indexOf(listener);
            if (index > -1) this._listeners.splice(index, 1);
        }.bind(this);
    },
    getNotifications: function(unreadOnly, limit) {
        limit = limit || 50;
        let result = this._notifications;
        if (unreadOnly) result = result.filter(function(n) { return !n.read; });
        return result.slice(-limit);
    },
    markAsRead: function(id) {
        const notification = this._notifications.find(function(n) { return n.id === id; });
        if (notification) notification.read = true;
    },
    markAllAsRead: function() {
        for (let i = 0; i < this._notifications.length; i++) this._notifications[i].read = true;
    },
    clear: function() { this._notifications = []; },
    getStats: function() {
        const total = this._notifications.length;
        const unread = this._notifications.filter(function(n) { return !n.read; }).length;
        const byType = {};
        const typeKeys = Object.keys(this._types);
        for (let i = 0; i < typeKeys.length; i++) {
            const type = typeKeys[i];
            byType[type] = this._notifications.filter(function(n) { return n.type === type; }).length;
        }
        return Object.freeze({ total: total, unread: unread, byType: byType });
    }
});

export const showToast = function(message, type) {
    type = type || 'info';
    try {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (type === 'error') toast.style.borderLeftColor = '#e74c3c';
        else if (type === 'success') toast.style.borderLeftColor = '#2ecc71';
        else if (type === 'warning') toast.style.borderLeftColor = '#f39c12';
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3500);
    } catch(e) { console.warn('[AutoLearning] showToast failed:', e.message); }
};

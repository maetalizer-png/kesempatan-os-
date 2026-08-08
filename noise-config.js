(function() {
    'use strict';
    if (window.__NoiseConfigLoaded) {
        return;
    }
    window.__NoiseConfigLoaded = true;

    const CONFIG = Object.freeze({
        STORAGE_KEY: 'kes_noise_filter_data_v2',
        INTERVAL_DEFAULT: 30000,
        THRESHOLD_DEFAULT: 60,
        MAX_HISTORY: 200,
        AI_MODEL: 'deepseek/deepseek-chat',
        AI_MAX_TOKENS: 300,
        AI_TEMPERATURE: 0.3,
        SOURCES: {
            OBSERVATION: true,
            BROWSING_AGENT: true,
            NEWS_AGGREGATOR: true,
            RSS: false,
            SOCIAL: false
        },
        DEFAULT_BLACKLIST: [
            'scam', 'ponzi', 'guaranteed return', '500%', '1000%',
            'kaya dalam semalam', 'modal 50rb', 'rahasia sukses'
        ],
        DEFAULT_WHITELIST: [
            'pemerintah', 'resmi', 'kementerian', 'bank indonesia', 'ojk'
        ],
        CACHE_TTL: 3600000,
        ADAPTIVE_INTERVAL_MIN: 10000,
        ADAPTIVE_INTERVAL_MAX: 120000,
        SIMILARITY_THRESHOLD: 0.8,
        BOT_TIME_WINDOW: 2000,
        IDB_RETRY_COUNT: 3,
        IDB_RETRY_DELAY: 300,
        AUTO_EXPORT_INTERVAL: 10
    });

    const NOISE_ICON_PATHS = {
        bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        x: '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>',
        'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        'shield-x': '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/><path d="M9.5 9.5l5 5"/><path d="M14.5 9.5l-5 5"/>',
        'shield-alert': '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
        'shield-check': '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/><path d="M9 12l2 2 4-4"/>',
        pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
        'bar-chart-2': '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
        inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
        trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
        printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
        smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
        frown: '<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
        meh: '<circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
        radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
        'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>',
        shield: '<path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z"/>',
        zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
        'power-off': '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><path d="M12 2v10"/>',
        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>'
    };

    function noiseIcon(name, size, color, extraStyle) {
        const path = NOISE_ICON_PATHS[name];
        if (!path) return '';
        size = size || 14;
        const colorAttr = color ? 'color:' + color + ';' : '';
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
            '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-2px; flex-shrink:0; ' +
            colorAttr + (extraStyle || '') + '">' + path + '</svg>';
    }

    window.__NoiseConfig = {
        CONFIG: CONFIG,
        NOISE_ICON_PATHS: NOISE_ICON_PATHS,
        noiseIcon: noiseIcon
    };
    window.noiseIcon = noiseIcon;

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.NoiseConfig = window.__NoiseConfig;
})();
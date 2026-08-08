
(function() {
    'use strict';

    if (window.__OBS_CONFIG) return;
    window.__OBS_CONFIG = true;

    const CONFIG = Object.freeze({
        STORAGE_KEY: 'kes_observation_v5',
        REFRESH_INTERVAL: 90000,
        MAX_SIGNALS: 150,
        THEME_KEY: 'kes_observation_theme',
        FAVORITES_KEY: 'kes_observation_favorites',
        MAX_RETRIES: 2,
        RETRY_DELAY: 1000,
        MAX_CONSECUTIVE_FAILS: 3,
        SOURCE_COOLDOWN_MS: 10 * 60 * 1000,
        ITEMS_PER_SOURCE: 5,
        SENTIMENT: {
            POSITIVE_WEIGHT: 1,
            NEGATIVE_WEIGHT: -1,
            STRONG_POSITIVE: 2,
            STRONG_NEGATIVE: -2
        }
    });

    const AUTO_TRIGGER_CONFIG = {
        enabled: true,
        minConfidence: 85,
        sentimentRequired: 'positif',
        cooldownMs: 60000,
        maxPerSession: 5
    };

    const RSS_SOURCES = Object.freeze([
        { name: 'ANTARA', icon: 'radio', tier: 1, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.antaranews.com/rss/terkini.xml' },
        { name: 'ANTARA English', icon: 'newspaper', tier: 1, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://en.antaranews.com/rss/news.xml' },
        { name: 'Detik', icon: 'smartphone', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://news.detik.com/rss' },
        { name: 'CNN Indo', icon: 'tv', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.cnnindonesia.com/nasional/rss' },
        { name: 'Republika', icon: 'newspaper', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.republika.co.id/rss/nasional/' },
        { name: 'Tribunnews', icon: 'newspaper', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.tribunnews.com/rss' },
        { name: 'Liputan6', icon: 'radio', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feed.liputan6.com/rss/news' },
        { name: 'Sindonews', icon: 'newspaper', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.sindonews.com/feed' },
        { name: 'Suara.com', icon: 'radio', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.suara.com/rss' },
        { name: 'Merdeka.com', icon: 'newspaper', tier: 2, region: 'nasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.merdeka.com/feed/' },
        { name: 'ANTARA Ekonomi', icon: 'bar-chart-2', tier: 1, region: 'ekonomi', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.antaranews.com/rss/ekonomi' },
        { name: 'Detik Finance', icon: 'bar-chart-2', tier: 2, region: 'ekonomi', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://finance.detik.com/rss' },
        { name: 'CNBC Indonesia', icon: 'bar-chart-2', tier: 2, region: 'ekonomi', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbcindonesia.com/news/rss' },
        { name: 'ANTARA Olahraga', icon: 'trophy', tier: 1, region: 'olahraga', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.antaranews.com/rss/olahraga' },
        { name: 'BBC World', icon: 'globe', tier: 1, region: 'internasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'Al Jazeera', icon: 'globe', tier: 1, region: 'internasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.com/xml/rss/all.xml' },
        { name: 'The Guardian', icon: 'newspaper', tier: 1, region: 'internasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.theguardian.com/world/rss' },
        { name: 'DW News', icon: 'newspaper', tier: 1, region: 'internasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.dw.com/rdf/rss-en-top' },
        { name: 'CNA (Asia)', icon: 'newspaper', tier: 1, region: 'internasional', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml' }
    ]);

    const REGION_GROUPS = Object.freeze({
        nasional: { label: 'Nasional', color: '#1F9D55', icon: 'landmark' },
        ekonomi: { label: 'Ekonomi', color: '#C99A2E', icon: 'bar-chart-2' },
        olahraga: { label: 'Olahraga', color: '#D97A3B', icon: 'trophy' },
        internasional: { label: 'Internasional', color: '#3B82C4', icon: 'globe' }
    });

    const FALLBACK_SIGNALS = Object.freeze([
        { title: 'AI untuk UMKM Akan Melonjak 300%', desc: 'Penggunaan AI oleh UMKM diprediksi meningkat drastis', cat: 'Teknologi', src: 'ANTARA' },
        { title: 'Paket Kebijakan Digital 2026 Diumumkan', desc: 'Pemerintah siapkan 5 program prioritas', cat: 'Politik', src: 'Detik' },
        { title: 'Bitcoin Tembus Level $100.000!', desc: 'Cryptocurrency terbesar di dunia mencetak rekor baru', cat: 'Bisnis', src: 'CNBC Indonesia' },
        { title: 'Startup AI Dapat Pendanaan Seri B $50M', desc: 'Pendanaan dari VC global untuk startup AI lokal', cat: 'Teknologi', src: 'Detik' },
        { title: 'IMF Prediksi Ekonomi Global Tumbuh 3.2%', desc: 'Pertumbuhan ekonomi global tetap stabil', cat: 'Global', src: 'BBC World' }
    ]);

    const CATEGORIES = Object.freeze({
        'Bisnis': { color: '#00C97C', emoji: 'briefcase', score: 80 },
        'Teknologi': { color: '#3B82C4', emoji: 'cpu', score: 85 },
        'Politik': { color: '#D97A3B', emoji: 'landmark', score: 55 },
        'Global': { color: '#9B6FC9', emoji: 'globe', score: 70 },
        'Olahraga': { color: '#C99A2E', emoji: 'trophy', score: 50 },
        'Umum': { color: '#8A94A6', emoji: 'newspaper', score: 45 }
    });

    window.OBS_CONFIG = { CONFIG, AUTO_TRIGGER_CONFIG, RSS_SOURCES, REGION_GROUPS, FALLBACK_SIGNALS, CATEGORIES };
})();

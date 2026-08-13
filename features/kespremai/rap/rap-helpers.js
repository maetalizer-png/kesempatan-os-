

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getTimestamp() {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDisplayName(agent) {
    const map = {
        'RahmadRaharjo': '👨 Rahmad Raharjo',
        'Manager': '📋 Manager',
        'StartupFounder': '🚀 StartupFounder',
        'DevilsAdvocate': '👿 DevilsAdvocate',
        'SundanyaAsep': '😂 SundanyaAsep',
        'Statistika': '📊 Statistika',
        'Researcher': '🔍 Researcher',
        'Hunter': '🎯 Hunter',
        'Analyst': '📈 Analyst',
        'Strategist': '🎯 Strategist',
        'Copywriter': '✍️ Copywriter'
    };
    return map[agent] || agent;
}

function getApiKey() {
    const input = document.getElementById('apiKeyInput');
    if (input && input.value && input.value.trim().length > 10) {
        return input.value.trim();
    }
    if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) {
        return window.CONFIG.API_KEYS.openrouter;
    }
    return null;
}

export const RapHelpers = {
    sanitizeHTML: sanitizeHTML,
    getTimestamp: getTimestamp,
    getDisplayName: getDisplayName,
    getApiKey: getApiKey
};

KESEMPATAN.RapHelpers = RapHelpers;

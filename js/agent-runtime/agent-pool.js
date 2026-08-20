const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const CATEGORIES = [
    { tab: 'bisnis', label: 'BISNIS (14)', active: true },
    { tab: 'sains', label: 'SAINS & TEKNO (14)' },
    { tab: 'umum', label: 'UMUM (12)' },
    { tab: 'politik', label: 'POLITIK (5)' },
    { tab: 'global', label: 'GLOBAL (10)' }
];

function buildTabsHTML() {
    return CATEGORIES.map(function(category) {
        return '<button class="tab-btn' + (category.active ? ' active' : '') + '" data-tab="' + category.tab + '">' + category.label + '</button>';
    }).join('');
}

function buildPanelsHTML() {
    return CATEGORIES.map(function(category) {
        const activeClass = category.active ? ' active-panel' : '';
        return '<div id="tab-' + category.tab + '" class="agent-tab-panel' + activeClass + '"><div class="agents-grid"></div></div>';
    }).join('');
}

function switchTab(tabId) {
    document.querySelectorAll('.agent-tab-panel').forEach(function(panel) {
        panel.classList.remove('active-panel');
    });
    document.querySelectorAll('.tab-btn').forEach(function(tab) {
        tab.classList.remove('active');
    });
    const activePanel = document.getElementById('tab-' + tabId);
    if (activePanel) activePanel.classList.add('active-panel');
    const activeTab = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    if (activeTab) activeTab.classList.add('active');
    localStorage.setItem('kes_active_agent_tab', tabId);
}

function wireTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(tab) {
        tab.addEventListener('click', function() {
            switchTab(tab.getAttribute('data-tab'));
        });
    });
    const validTabs = CATEGORIES.map(function(category) { return category.tab; });
    const savedTab = localStorage.getItem('kes_active_agent_tab');
    if (savedTab && validTabs.indexOf(savedTab) !== -1) {
        switchTab(savedTab);
    } else {
        switchTab('bisnis');
    }
}

function renderUI(container) {
    if (!container) return;
    container.className = 'agent-pool';
    container.innerHTML =
        '<div class="agents-tabs" id="agentTabs" style="margin-top:16px">' + buildTabsHTML() + '</div>' +
        buildPanelsHTML();
    wireTabs();
}

export const AgentPool = Object.freeze({ renderUI: renderUI, switchTab: switchTab, CATEGORIES: CATEGORIES });

KESEMPATAN.AgentPool = AgentPool;

document.addEventListener('DOMContentLoaded', function() {
    renderUI(document.getElementById('agentPoolContainer'));
});
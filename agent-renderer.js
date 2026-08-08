(function() {
    'use strict';
    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__AgentRendererLoaded) return;
    window.__AgentRendererLoaded = true;

    function getAgentsFromConfig() {
        const agents = {
            bisnis: [],
            sains: [],
            umum: [],
            politik: [],
            global: []
        };
        if (window.AGENTS_BISNIS && Array.isArray(window.AGENTS_BISNIS)) agents.bisnis = window.AGENTS_BISNIS;
        if (window.AGENTS_SCIENCE && Array.isArray(window.AGENTS_SCIENCE)) agents.sains = window.AGENTS_SCIENCE;
        if (window.AGENTS_GENERAL && Array.isArray(window.AGENTS_GENERAL)) agents.umum = window.AGENTS_GENERAL;
        if (window.AGENTS_POLITICS && Array.isArray(window.AGENTS_POLITICS)) agents.politik = window.AGENTS_POLITICS;
        if (window.AGENTS_GLOBAL && Array.isArray(window.AGENTS_GLOBAL)) agents.global = window.AGENTS_GLOBAL;
        return agents;
    }

    function renderAgentTab(tabId, agents, isChecked) {
        isChecked = (isChecked !== undefined) ? isChecked : false;
        const panel = document.getElementById('tab-' + tabId);
        if (!panel) return;
        const grid = panel.querySelector('.agents-grid');
        if (!grid) return;
        if (!agents || agents.length === 0) {
            grid.innerHTML = '<div class="text-dim" style="grid-column:1/-1; text-align:center; padding:20px;">⚠️ Tidak ada agen untuk kategori ini</div>';
            return;
        }
        let html = '';
        const agentCount = agents.length;
        for (let i = 0; i < agentCount; i++) {
            const agentName = agents[i];
            const checkedAttribute = isChecked ? 'checked' : '';
            html += '<div class="agent-badge" data-agent="' + agentName + '">' +
                '<input type="checkbox" class="agent-checkbox" data-agent="' + agentName + '" ' + checkedAttribute + '> ' + agentName +
                '</div>';
        }
        grid.innerHTML = html;
    }

    function updateAgentCount() {
        const checkboxes = document.querySelectorAll('.agent-checkbox');
        const totalSpan = document.getElementById('totalAgentCount');
        const selectedSpan = document.getElementById('selectedAgentsCount');
        const totalAgentsSpan = document.getElementById('totalAgents');
        if (totalSpan) totalSpan.textContent = checkboxes.length;
        if (totalAgentsSpan) totalAgentsSpan.textContent = checkboxes.length;
        const checkedBoxes = document.querySelectorAll('.agent-checkbox:checked');
        if (selectedSpan) selectedSpan.textContent = checkedBoxes.length + '/' + checkboxes.length + ' agen dipilih';
    }

    function renderAllAgents() {
        const agentData = getAgentsFromConfig();
        renderAgentTab('bisnis', agentData.bisnis);
        renderAgentTab('sains', agentData.sains);
        renderAgentTab('umum', agentData.umum);
        renderAgentTab('politik', agentData.politik);
        renderAgentTab('global', agentData.global);
        document.dispatchEvent(new CustomEvent('kes-agents-rendered'));
        setTimeout(updateAgentCount, 100);
    }

    KESEMPATAN.AgentRenderer = Object.freeze({
        renderAllAgents: renderAllAgents,
        renderAgentTab: renderAgentTab,
        updateAgentCount: updateAgentCount
    });
})();
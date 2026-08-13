const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;






function getAgentsFromConfig() {
    const agents = {
        bisnis: [],
        sains: [],
        umum: [],
        politik: [],
        global: []
    };
    const bisnis = KESEMPATAN.Agents?.Bisnis;
    const sains = KESEMPATAN.Agents?.Science;
    const umum = KESEMPATAN.Agents?.General;
    const politik = KESEMPATAN.Agents?.Politics;
    const global = KESEMPATAN.Agents?.Global;
    if (bisnis && Array.isArray(bisnis)) agents.bisnis = bisnis;
    if (sains && Array.isArray(sains)) agents.sains = sains;
    if (umum && Array.isArray(umum)) agents.umum = umum;
    if (politik && Array.isArray(politik)) agents.politik = politik;
    if (global && Array.isArray(global)) agents.global = global;
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

export const AgentRenderer = Object.freeze({
    renderAllAgents: renderAllAgents,
    renderAgentTab: renderAgentTab,
    updateAgentCount: updateAgentCount
});

KESEMPATAN.AgentRenderer = AgentRenderer;
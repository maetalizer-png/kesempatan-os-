import './custom-config.js';
import { CustomAIState } from './custom-state.js';
import { CustomAICore } from './custom-core.js';
import { CustomAIUIRenderer } from './custom-renderer.js';
import './custom-events.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

export const CustomAutoAgent = {
    render: function() {
        CustomAIUIRenderer.render();
    },
    renderCheckboxList: function(container) {
        if (!container) return;
        try {
            const customAgents = CustomAICore.getFilteredAgents();
            if (!customAgents || customAgents.length === 0) {
                container.innerHTML = '<div class="text-dim" style="grid-column:1/-1; text-align:center; padding:20px;">Agen custom akan muncul di sini</div>';
                return;
            }
            let html = '';
            for (let i = 0; i < customAgents.length; i++) {
                const agent = customAgents[i];
                html += '<div class="agent-badge" data-agent="' + agent.name + '">' +
                    '<input type="checkbox" class="agent-checkbox" data-agent="' + agent.name + '" checked> ' + agent.name +
                    '</div>';
            }
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div class="text-dim" style="grid-column:1/-1; text-align:center; padding:20px;">Error loading custom agents</div>';
        }
    },
    renderIntoGrid: function() {
        const grid = document.getElementById('customAgentsGrid');
        if (!grid) return;
        this.renderCheckboxList(grid);
    },
    add: function() { return CustomAICore.addCustomAgent.apply(null, arguments); },
    edit: function() { return CustomAICore.editCustomAgent.apply(null, arguments); },
    delete: function() { return CustomAICore.deleteCustomAgent.apply(null, arguments); },
    generateAI: function() { return CustomAICore.generateAgentFromAI.apply(null, arguments); },
    share: function() { return CustomAICore.shareAgent.apply(null, arguments); },
    getAgents: function() { return CustomAIState.getAgents(); },
    getRatings: function() { return CustomAIState.getRatings(); },
    getAnalytics: function() { return CustomAIState.getAnalytics(); },
    selectAll: function() { return CustomAICore.selectAllAgents(); },
    deselectAll: function() { return CustomAICore.deselectAllAgents(); },
    deleteSelected: function() { return CustomAICore.deleteSelectedAgents(); },
    exportSelected: function() { return CustomAICore.exportSelectedAgents(); },
    autoTag: function() { return CustomAICore.autoTagAgent.apply(null, arguments); },
    autoCategory: function() { return CustomAICore.autoCategory.apply(null, arguments); },
    predictPerformance: function() { return CustomAICore.predictPerformance.apply(null, arguments); },
    compareAgents: function() { return CustomAICore.compareAgents.apply(null, arguments); },
    previewVoice: function() { return CustomAICore.previewAgentVoice.apply(null, arguments); },
    suggestSmartTags: function() { return CustomAICore.suggestSmartTags.apply(null, arguments); },
    previewAgent: function() { return CustomAICore.previewAgent.apply(null, arguments); }
};
KESEMPATAN.CustomAutoAgent = CustomAutoAgent;

document.addEventListener('kes-agents-rendered', function() {
    CustomAutoAgent.renderIntoGrid();
});

CustomAIUIRenderer.init();
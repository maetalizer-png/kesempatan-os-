(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__CustomAutoAgentLoaded) return;
    window.__CustomAutoAgentLoaded = true;

    const MODULES = [
        'custom-config.js',
        'custom-state.js',
        'custom-core.js',
        'custom-renderer.js',
        'custom-events.js'
    ];

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (!hasError) {
                if (KESEMPATAN.CustomAIUIRenderer && typeof KESEMPATAN.CustomAIUIRenderer.init === 'function') {
                    KESEMPATAN.CustomAIUIRenderer.init();
                }
            }
            return;
        }
        const src = MODULES[loaded];
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = function() { loaded++; loadNext(); };
        script.onerror = function() { hasError = true; loaded++; loadNext(); };
        document.head.appendChild(script);
    }

    KESEMPATAN.CustomAutoAgent = {
        render: function() {
            if (KESEMPATAN.CustomAIUIRenderer && typeof KESEMPATAN.CustomAIUIRenderer.render === 'function') {
                KESEMPATAN.CustomAIUIRenderer.render();
                return;
            }
            const page = document.getElementById('customautoagentPage');
            if (page) {
                page.innerHTML = '<div style="padding:20px; color:#FF6B6B;">' +
                    'Modul Custom & Auto Agen gagal dimuat (KESEMPATAN.CustomAIUIRenderer tidak tersedia).<br>' +
                    'Cek Console browser (F12) untuk pesan kegagalan pemuatan modul.' +
                    '</div>';
            }
        },
        renderCheckboxList: function(container) {
            if (!container) return;
            try {
                const customAgents = (KESEMPATAN.CustomAICore && typeof KESEMPATAN.CustomAICore.getFilteredAgents === 'function')
                    ? KESEMPATAN.CustomAICore.getFilteredAgents()
                    : (KESEMPATAN.CustomAIState && typeof KESEMPATAN.CustomAIState.getAgents === 'function')
                        ? KESEMPATAN.CustomAIState.getAgents()
                        : [];
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
            if (KESEMPATAN.CustomAICore || KESEMPATAN.CustomAIState) {
                this.renderCheckboxList(grid);
            } else {
                const self = this;
                setTimeout(function() { self.renderIntoGrid(); }, 200);
            }
        },
        add: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.addCustomAgent.apply(null, arguments); },
        edit: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.editCustomAgent.apply(null, arguments); },
        delete: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.deleteCustomAgent.apply(null, arguments); },
        generateAI: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.generateAgentFromAI.apply(null, arguments); },
        share: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.shareAgent.apply(null, arguments); },
        getAgents: function() { return KESEMPATAN.CustomAIState ? KESEMPATAN.CustomAIState.getAgents() : []; },
        getRatings: function() { return KESEMPATAN.CustomAIState ? KESEMPATAN.CustomAIState.getRatings() : {}; },
        getAnalytics: function() { return KESEMPATAN.CustomAIState ? KESEMPATAN.CustomAIState.getAnalytics() : {}; },
        selectAll: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.selectAllAgents(); },
        deselectAll: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.deselectAllAgents(); },
        deleteSelected: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.deleteSelectedAgents(); },
        exportSelected: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.exportSelectedAgents(); },
        autoTag: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.autoTagAgent.apply(null, arguments); },
        autoCategory: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.autoCategory.apply(null, arguments); },
        predictPerformance: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.predictPerformance.apply(null, arguments); },
        compareAgents: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.compareAgents.apply(null, arguments); },
        previewVoice: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.previewAgentVoice.apply(null, arguments); },
        suggestSmartTags: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.suggestSmartTags.apply(null, arguments); },
        previewAgent: function() { if (KESEMPATAN.CustomAICore) return KESEMPATAN.CustomAICore.previewAgent.apply(null, arguments); }
    };

    document.addEventListener('kes-agents-rendered', function() {
        KESEMPATAN.CustomAutoAgent.renderIntoGrid();
    });

    loadNext();
})();
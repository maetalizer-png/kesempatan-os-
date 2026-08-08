(function() {
    'use strict';
    if (window.__CustomAutoAgentLoaded) return;
    window.__CustomAutoAgentLoaded = true;

    const MODULES = [
        'custom-ai/custom-config.js',
        'custom-ai/custom-state.js',
        'custom-ai/custom-core.js',
        'custom-ai/custom-renderer.js',
        'custom-ai/custom-events.js'
    ];

    let loaded = 0;
    const total = MODULES.length;
    let hasError = false;

    function loadNext() {
        if (loaded >= total) {
            if (!hasError) {
                if (window.CustomAIUIRenderer && typeof window.CustomAIUIRenderer.init === 'function') {
                    window.CustomAIUIRenderer.init();
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

    window.CustomAutoAgent = {
        render: function() {
            if (window.CustomAIUIRenderer && typeof window.CustomAIUIRenderer.render === 'function') {
                window.CustomAIUIRenderer.render();
                return;
            }
            const page = document.getElementById('customautoagentPage');
            if (page) {
                page.innerHTML = '<div style="padding:20px; color:#FF6B6B;">' +
                    'Modul Custom & Auto Agen gagal dimuat (window.CustomAIUIRenderer tidak tersedia).<br>' +
                    'Cek Console browser (F12) untuk pesan kegagalan pemuatan modul.' +
                    '</div>';
            }
        },
        renderCheckboxList: function(container) {
            if (!container) return;
            try {
                const customAgents = (window.CustomAICore && typeof window.CustomAICore.getFilteredAgents === 'function')
                    ? window.CustomAICore.getFilteredAgents()
                    : (window.CustomAIState && typeof window.CustomAIState.getAgents === 'function')
                        ? window.CustomAIState.getAgents()
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
            if (window.CustomAICore || window.CustomAIState) {
                this.renderCheckboxList(grid);
            } else {
                const self = this;
                setTimeout(function() { self.renderIntoGrid(); }, 200);
            }
        },
        add: function() { if (window.CustomAICore) return window.CustomAICore.addCustomAgent.apply(null, arguments); },
        edit: function() { if (window.CustomAICore) return window.CustomAICore.editCustomAgent.apply(null, arguments); },
        delete: function() { if (window.CustomAICore) return window.CustomAICore.deleteCustomAgent.apply(null, arguments); },
        generateAI: function() { if (window.CustomAICore) return window.CustomAICore.generateAgentFromAI.apply(null, arguments); },
        share: function() { if (window.CustomAICore) return window.CustomAICore.shareAgent.apply(null, arguments); },
        getAgents: function() { return window.CustomAIState ? window.CustomAIState.getAgents() : []; },
        getRatings: function() { return window.CustomAIState ? window.CustomAIState.getRatings() : {}; },
        getAnalytics: function() { return window.CustomAIState ? window.CustomAIState.getAnalytics() : {}; },
        selectAll: function() { if (window.CustomAICore) return window.CustomAICore.selectAllAgents(); },
        deselectAll: function() { if (window.CustomAICore) return window.CustomAICore.deselectAllAgents(); },
        deleteSelected: function() { if (window.CustomAICore) return window.CustomAICore.deleteSelectedAgents(); },
        exportSelected: function() { if (window.CustomAICore) return window.CustomAICore.exportSelectedAgents(); },
        autoTag: function() { if (window.CustomAICore) return window.CustomAICore.autoTagAgent.apply(null, arguments); },
        autoCategory: function() { if (window.CustomAICore) return window.CustomAICore.autoCategory.apply(null, arguments); },
        predictPerformance: function() { if (window.CustomAICore) return window.CustomAICore.predictPerformance.apply(null, arguments); },
        compareAgents: function() { if (window.CustomAICore) return window.CustomAICore.compareAgents.apply(null, arguments); },
        previewVoice: function() { if (window.CustomAICore) return window.CustomAICore.previewAgentVoice.apply(null, arguments); },
        suggestSmartTags: function() { if (window.CustomAICore) return window.CustomAICore.suggestSmartTags.apply(null, arguments); },
        previewAgent: function() { if (window.CustomAICore) return window.CustomAICore.previewAgent.apply(null, arguments); }
    };

    document.addEventListener('kes-agents-rendered', function() {
        window.CustomAutoAgent.renderIntoGrid();
    });

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.CustomAutoAgent = window.CustomAutoAgent;

    loadNext();
})();
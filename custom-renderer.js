(function() {
    'use strict';
    if (window.__CustomAIUIRenderer) return;
    window.__CustomAIUIRenderer = true;

    const state = window.CustomAIState;
    const core = window.CustomAICore;
    const config = window.CustomAIConfig;
    const CATEGORIES = config.CATEGORIES;
    const ALL_TAGS = config.ALL_TAGS;

    const CA_CSS = '<style>' +
        ':root{--ca-clip:polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px));--ca-clip-asym:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);--ca-clip-sm:polygon(0 6px,6px 0,calc(100% - 6px) 0,100% 6px,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px));}' +
        '#customAgentContainer{box-sizing:border-box;padding:4px 12px !important;}' +
        '.ca-wrap{position:relative;margin:0 0 16px;padding:2px 0 16px;}' +
        '.ca-wrap::after{content:\'\';position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(224,230,237,0.14);}' +
        '.ca-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:6px;}' +
        '.ca-title{font-size:clamp(15px,4vw,19px);font-weight:800;letter-spacing:.2px;color:var(--primary,#00FFA3);text-shadow:0 0 10px rgba(0,255,163,.35);}' +
        '.ca-sub{font-size:9px;color:#A0B3C9;margin-top:4px;}' +
        '.ca-count{font-size:10px;color:#666;}' +
        '.ca-stack{display:flex;flex-direction:column;gap:10px;margin-bottom:12px;}' +
        '.ca-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px;}' +
        '.ca-eq{display:flex;flex-wrap:wrap;gap:8px;}' +
        '.ca-eq>.ca-btn{flex:1 1 100px;}' +
        '.ca-eq>.ca-rim{flex:1 1 130px;margin-bottom:0;}' +
        '.ca-eq>.ca-selcount{flex:1 1 70px;align-self:center;text-align:center;}' +
        '.ca-flex{flex:1;min-width:120px;}' +
        '.ca-rim{position:relative;isolation:isolate;clip-path:var(--ca-clip-sm);background:rgba(26,255,156,.3);padding:1px;display:block;transition:background .25s ease,filter .3s ease;}' +
        '.ca-rim::before{content:\'\';position:absolute;inset:1px;clip-path:var(--ca-clip-sm);background:#05080c;z-index:-1;}' +
        '.ca-rim:hover{background:rgba(26,255,156,.55);}' +
        '.ca-input,.ca-select,.ca-textarea{display:block;width:100%;box-sizing:border-box;background:transparent;border:0;border-radius:0;color:#E0E6ED;padding:9px 12px;font-size:12px;outline:none;margin:0;font-family:inherit;}' +
        '.ca-textarea{resize:vertical;min-height:70px;line-height:1.5;}' +
        '.ca-select option{background:#05080c;color:#E0E6ED;}' +
        '.ca-btn{position:relative;isolation:isolate;clip-path:var(--ca-clip-asym);border:0;border-radius:0;background:rgba(26,255,156,.35);padding:9px 16px;color:var(--primary,#00FFA3);font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:background .25s ease,filter .25s ease,transform .15s ease;}' +
        '.ca-btn::before{content:\'\';position:absolute;inset:1px;clip-path:var(--ca-clip-asym);background:#06100b;z-index:-1;}' +
        '.ca-btn:active{transform:scale(.97);}' +
        '.ca-primary{background:linear-gradient(135deg,var(--primary,#00FFA3),#00AA6E);color:#03130b;}' +
        '.ca-primary::before{display:none;}' +
        '.ca-purple{background:rgba(155,89,182,.5);color:#C39BD3;}' +
        '.ca-purple::before{background:#120a18;}' +
        '.ca-pink{background:rgba(255,105,180,.45);color:#FF9CCF;}' +
        '.ca-pink::before{background:#170a10;}' +
        '.ca-gold{background:rgba(255,215,0,.45);color:#FFE27A;}' +
        '.ca-gold::before{background:#171202;}' +
        '.ca-danger{background:rgba(255,68,68,.5);color:#FF8080;}' +
        '.ca-danger::before{background:#160608;}' +
        '.ca-cyan{background:rgba(0,255,255,.4);color:#7EE9EC;}' +
        '.ca-cyan::before{background:#021616;}' +
        '.ca-box{position:relative;isolation:isolate;clip-path:var(--ca-clip);background:rgba(26,255,156,.25);padding:1px;margin-bottom:12px;}' +
        '.ca-box::before{content:\'\';position:absolute;inset:1px;clip-path:var(--ca-clip);background:#05080c;z-index:-1;}' +
        '.ca-box-purple{background:rgba(155,89,182,.4);}' +
        '.ca-box-purple::before{background:#0b0713;}' +
        '.ca-box-gold{background:rgba(255,215,0,.35);}' +
        '.ca-box-gold::before{background:#12100a;}' +
        '.ca-box-in{display:block;padding:12px 14px;}' +
        '.ca-box-title{font-size:12px;font-weight:800;letter-spacing:.5px;color:#FFD700;margin-bottom:10px;}' +
        '.ca-purple-t{color:#9B59B6;text-shadow:0 0 8px rgba(155,89,182,.4);}' +
        '.ca-gold-t{color:#FFD700;text-shadow:0 0 8px rgba(255,215,0,.3);}' +
        '.ca-hint{font-size:9px;color:#A0B3C9;font-weight:400;}' +
        '.ca-lbl{font-size:9px;color:#A0B3C9;letter-spacing:.5px;}' +
        '.ca-range{-webkit-appearance:none;appearance:none;flex:1;min-width:100px;height:16px;margin:0;padding:0;border:0;border-radius:0;background:transparent;outline:none;cursor:pointer;}' +
        '.ca-range::-webkit-slider-runnable-track{height:16px;border:0;border-radius:0;clip-path:var(--ca-clip-sm);background:linear-gradient(to right,var(--primary,#00FFA3),#00AA6E);}' +
        '.ca-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;box-sizing:border-box;width:16px;height:16px;margin-top:0;border-radius:50%;background:var(--primary,#00FFA3);border:2px solid #03050A;box-shadow:0 0 8px rgba(0,255,163,.35);cursor:pointer;}' +
        '.ca-range::-moz-range-track{height:16px;border:0;border-radius:0;clip-path:var(--ca-clip-sm);background:linear-gradient(to right,var(--primary,#00FFA3),#00AA6E);}' +
        '.ca-range::-moz-range-thumb{box-sizing:border-box;width:16px;height:16px;border-radius:50%;background:var(--primary,#00FFA3);border:2px solid #03050A;}' +
        '.ca-tempval{font-size:11px;color:var(--primary,#00FFA3);min-width:30px;}' +
        '.ca-selcount{font-size:9px;color:#666;}' +
        '.ca-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;}' +
        '.ca-pred{margin-top:8px;padding:8px 10px;clip-path:var(--ca-clip-sm);background:rgba(155,89,182,.08);font-size:11px;color:#9B59B6;}' +
        '.ca-status{font-size:11px;color:#A0B3C9;margin-top:8px;}' +
        '.ca-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px;}' +
        '.ca-grid .ca-btn{width:100%;}' +
        '.ca-full{grid-column:1/-1;}' +
        '.ca-vs{color:#FFD700;font-weight:800;font-size:12px;}' +
        '.ca-list{display:flex;flex-direction:column;gap:6px;margin-top:8px;max-height:400px;overflow-y:auto;}' +
        '.ca-chip{position:relative;isolation:isolate;clip-path:var(--ca-clip-sm);background:rgba(26,255,156,.25);padding:1px;}' +
        '.ca-chip::before{content:\'\';position:absolute;inset:1px;clip-path:var(--ca-clip-sm);background:#07130d;z-index:-1;}' +
        '.ca-chip-in{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:6px 10px;font-size:9px;color:#666;}' +
        '.ca-ava{font-size:14px;}' +
        '.ca-name{font-weight:700;font-size:11px;color:var(--primary,#00FFA3);}' +
        '.ca-rate{font-size:8px;color:#FFD700;}' +
        '.ca-ai{font-size:7px;background:rgba(0,255,163,0.15);padding:0 4px;clip-path:var(--ca-clip-sm);color:var(--primary,#00FFA3);}' +
        '.ca-tagchip{font-size:7px;background:rgba(0,255,163,0.1);padding:0 4px;clip-path:var(--ca-clip-sm);color:var(--primary,#00FFA3);}' +
        '.ca-chip .edit-custom-list{background:none;border:0;color:#FFD700;cursor:pointer;font-size:10px;}' +
        '.ca-chip .share-custom-list{background:none;border:0;color:#00BFFF;cursor:pointer;font-size:10px;}' +
        '.ca-chip .delete-custom-list{background:none;border:0;color:#ff4444;cursor:pointer;font-size:10px;}' +
        '.ca-back{display:block;width:100%;margin-top:14px;}' +
        '@media (hover:hover) and (pointer:fine){ .ca-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 8px rgba(0,255,163,.35));} .ca-rim:hover{filter:drop-shadow(0 0 6px rgba(0,255,163,.25));} }' +
        '</style>';

    const ensureContainer = function() {
        const page = document.getElementById('customautoagentPage');
        if (!page) {
            return null;
        }
        let container = document.getElementById('customAgentContainer');
        if (container && container.parentElement !== page) {
            page.appendChild(container);
        }
        if (!container) {
            container = document.createElement('div');
            container.id = 'customAgentContainer';
            container.style.cssText = 'display:block; padding:0; margin:0;';
            page.appendChild(container);
        }
        return container;
    };

    const updateAgentList = function() {
        const listContainer = document.getElementById('customAgentList');
        if (!listContainer) return;
        const filtered = core.getFilteredAgents();
        const agents = state.getAgents();
        const totalDisplay = agents.length;
        const filteredDisplay = filtered.length;
        const filterTag = state.getFilterTag();
        const filterCategory = state.getFilterCategory();
        const sortMode = state.getSortMode();
        if (agents.length === 0) {
            listContainer.innerHTML = '<div style="text-align:center;padding:16px;font-size:11px;color:#666;">Belum ada agen custom. Buat agen pertama Anda!</div>';
            return;
        }
        let html = '<div style="font-size:10px;color:#666;margin-bottom:8px;">' + filteredDisplay + '/' + totalDisplay + ' agen ' + (filterTag !== 'all' ? '(tag: ' + filterTag + ')' : '') + (filterCategory !== 'all' ? '(cat: ' + filterCategory + ')' : '') + ' | Sort: ' + sortMode + '</div>';
        for (const agent of filtered) {
            const rating = core.getAgentRating(agent.id);
            const analytics = core.getAgentAnalytics(agent.id);
            const starDisplay = rating.count > 0 ? rating.average + '/5' : '-';
            html += '<span class="ca-chip"><span class="ca-chip-in">' +
                '<span class="ca-ava">' + (agent.avatar || '●') + '</span>' +
                '<span class="ca-name">' + core.escapeHtml(agent.name) + '</span>' +
                '<span class="ca-rate">' + starDisplay + '</span>' +
                '<span>' + (analytics.usageCount || 0) + 'x</span>' +
                '<span class="ca-ai">AI ' + (agent.aiScore || 50) + '</span>' +
                (agent.tags && agent.tags.length > 0 ? '<span class="ca-tagchip">#' + agent.tags[0] + '</span>' : '') +
                '<span>' + (agent.category || 'General') + '</span>' +
                '<button class="edit-custom-list" data-id="' + agent.id + '">Edit</button>' +
                '<button class="share-custom-list" data-id="' + agent.id + '">Share</button>' +
                '<button class="delete-custom-list" data-id="' + agent.id + '">✕</button>' +
                '</span></span>';
        }
        listContainer.innerHTML = html;
        listContainer.querySelectorAll('.edit-custom-list').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = btn.getAttribute('data-id');
                const agent = state.getAgents().find(function(a) { return a.id === id; });
                if (agent) {
                    state.setEditingId(id);
                    document.getElementById('customAgentName').value = agent.name;
                    document.getElementById('customAgentRole').value = agent.role;
                    document.getElementById('customAgentPrompt').value = agent.systemPrompt;
                    document.getElementById('customAgentTemp').value = agent.temperature;
                    document.getElementById('tempValue').textContent = agent.temperature;
                    document.getElementById('addCustomAgentBtn').textContent = 'UPDATE AGEN';
                    if (window.Utils && window.Utils.showToast) window.Utils.showToast('Edit mode: ' + agent.name, 'info');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
        listContainer.querySelectorAll('.share-custom-list').forEach(function(btn) {
            btn.addEventListener('click', function() {
                core.shareAgent(btn.getAttribute('data-id'));
            });
        });
        listContainer.querySelectorAll('.delete-custom-list').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const id = btn.getAttribute('data-id');
                if (id && confirm('Hapus agen custom ini?')) core.deleteCustomAgent(id);
            });
        });
    };

    const renderUI = function() {
        const container = ensureContainer();
        if (!container) {
            setTimeout(renderUI, 200);
            return;
        }
        state.loadAgents();
        state.loadRatings();
        state.loadAnalytics();
        state.loadFeedback();
        state.loadTraining();
        const agents = state.getAgents();
        const templates = state.loadTemplates();
        const templateOptions = Object.entries(templates).map(function(entry) {
            return '<option value="' + entry[0] + '">' + entry[1].name + '</option>';
        }).join('');
        const tagOptions = ALL_TAGS.map(function(tag) {
            return '<option value="' + tag + '">#' + tag + '</option>';
        }).join('');
        const categoryOptions = CATEGORIES.map(function(cat) {
            return '<option value="' + cat + '">' + cat + '</option>';
        }).join('');
        const sortOptions = [
            { value: 'aiScore', label: 'AI Score' },
            { value: 'usage', label: 'Usage' },
            { value: 'rating', label: 'Rating' },
            { value: 'name', label: 'Name' },
            { value: 'newest', label: 'Newest' }
        ];
        const selectedCount = state.getSelected().size;
        const filteredCount = core.getFilteredAgents().length;
        const agentOptions = agents.map(function(a) {
            return '<option value="' + a.id + '">' + (a.avatar || '') + ' ' + a.name + '</option>';
        }).join('');
        container.innerHTML = CA_CSS +
            '<div class="ca-wrap">' +
            '<div class="ca-head"><div><div class="ca-title">CUSTOM & AUTO AGEN</div><div class="ca-sub">Manual • AI • Edit • Template • Rating • Preview • Share • Analytics</div></div><div class="ca-count">' + agents.length + ' agen • ' + filteredCount + ' visible</div></div>' +
            '<div class="ca-stack">' +
            '<span class="ca-rim"><span class="ca-rim-in"><input type="text" id="searchAgentInput" class="ca-input" placeholder="Cari agen..."></span></span>' +
            '<div class="ca-eq">' +
            '<span class="ca-rim"><span class="ca-rim-in"><select id="filterTagSelect" class="ca-select"><option value="all">All Tags</option>' + tagOptions + '</select></span></span>' +
            '<span class="ca-rim"><span class="ca-rim-in"><select id="filterCategorySelect" class="ca-select"><option value="all">All Categories</option>' + categoryOptions + '</select></span></span>' +
            '<span class="ca-rim"><span class="ca-rim-in"><select id="sortSelect" class="ca-select">' + sortOptions.map(function(s) { return '<option value="' + s.value + '"' + (state.getSortMode() === s.value ? ' selected' : '') + '>' + s.label + '</option>'; }).join('') + '</select></span></span>' +
            '<button id="clearFilterBtn" class="ca-btn">Clear</button>' +
            '</div>' +
            '<div class="ca-eq">' +
            '<button id="selectAllBtn" class="ca-btn">Pilih Semua</button>' +
            '<button id="deselectAllBtn" class="ca-btn">Batal</button>' +
            '<span class="ca-selcount">' + selectedCount + ' terpilih</span>' +
            '<button id="deleteSelectedBtn" class="ca-btn ca-danger">Hapus</button>' +
            '<button id="exportSelectedBtn" class="ca-btn ca-cyan">Export</button>' +
            '</div>' +
            '</div>' +
            '<div class="ca-box"><span class="ca-box-in"><div class="ca-box-title">TEMPLATE</div>' +
            '<div class="ca-eq"><span class="ca-rim ca-flex"><span class="ca-rim-in"><select id="templateSelect" class="ca-select"><option value="">-- Pilih Template --</option>' + templateOptions + '</select></span></span>' +
            '<button id="applyTemplateBtn" class="ca-btn">Apply</button>' +
            '<button id="saveTemplateBtn" class="ca-btn ca-gold">Save</button></div>' +
            '</span></div>' +
            '<div class="ca-box"><span class="ca-box-in">' +
            '<span class="ca-rim" style="margin-bottom:8px;"><span class="ca-rim-in"><input type="text" id="customAgentName" class="ca-input" placeholder="Nama agen (contoh: SEO Expert)"></span></span>' +
            '<span class="ca-rim" style="margin-bottom:8px;"><span class="ca-rim-in"><input type="text" id="customAgentRole" class="ca-input" placeholder="Role (contoh: Spesialis SEO)"></span></span>' +
            '<span class="ca-rim" style="margin-bottom:10px;"><span class="ca-rim-in"><textarea id="customAgentPrompt" rows="3" class="ca-textarea" placeholder="System prompt (contoh: Anda adalah ahli SEO...)"></textarea></span></span>' +
            '<div class="ca-row"><span class="ca-lbl">Tags:</span>' +
            '<span class="ca-rim ca-flex"><span class="ca-rim-in"><select id="tagSelect" class="ca-select"><option value="">-- Add Tag --</option>' + tagOptions + '</select></span></span>' +
            '<button id="addTagBtn" class="ca-btn">+</button>' +
            '<button id="autoTagBtn" class="ca-btn ca-purple">Auto-Tag</button></div>' +
            '<div id="tagDisplay" class="ca-tags"></div>' +
            '<div class="ca-row"><span class="ca-lbl">Category:</span>' +
            '<span class="ca-rim ca-flex"><span class="ca-rim-in"><select id="categorySelect" class="ca-select">' + categoryOptions + '</select></span></span>' +
            '<button id="autoCategoryBtn" class="ca-btn ca-purple">Auto-Category</button></div>' +
            '<div class="ca-row"><span class="ca-lbl">Temperatur:</span>' +
            '<input type="range" id="customAgentTemp" class="ca-range" min="0" max="1" step="0.05" value="0.5">' +
            '<span id="tempValue" class="ca-tempval">0.5</span></div>' +
            '<div class="ca-eq">' +
            '<button id="addCustomAgentBtn" class="ca-btn ca-primary">TAMBAH AGEN</button>' +
            '<button id="previewBtn" class="ca-btn">PREVIEW</button>' +
            '<button id="predictBtn" class="ca-btn ca-purple">Predict</button>' +
            '<button id="voicePreviewBtn" class="ca-btn ca-pink">Voice</button>' +
            '<button id="clearFormBtn" class="ca-btn">Clear</button></div>' +
            '<div id="agentPreview" style="display:none;"></div>' +
            '<div id="predictionResult" class="ca-pred" style="display:none;"></div>' +
            '</span></div>' +
            '<div class="ca-box ca-box-purple"><span class="ca-box-in"><div class="ca-box-title ca-purple-t">AI BIKIN AGEN <span class="ca-hint">(Deskripsikan agen yang diinginkan)</span></div>' +
            '<span class="ca-rim" style="margin-bottom:10px;"><span class="ca-rim-in"><input type="text" id="autoAgentDesc" class="ca-input" placeholder="Contoh: \'Agen ahli kopi yang bisa merekomendasikan biji kopi terbaik\'"></span></span>' +
            '<div class="ca-eq"><span class="ca-rim ca-flex"><span class="ca-rim-in"><select id="batchCount" class="ca-select"><option value="1">1 Agen</option><option value="2">2 Agen</option><option value="3">3 Agen</option></select></span></span>' +
            '<button id="generateAgentBtn" class="ca-btn ca-purple">GENERATE</button></div>' +
            '<div id="autoAgentStatus" class="ca-status"></div>' +
            '</span></div>' +
            '<div class="ca-grid">' +
            '<button id="exportAgentsBtn" class="ca-btn">Export All</button>' +
            '<button id="importAgentsBtn" class="ca-btn">Import JSON</button>' +
            '<button id="clearAllBtn" class="ca-btn ca-danger">Hapus Semua</button>' +
            '<button id="refreshBtn" class="ca-btn">Refresh</button>' +
            '<button id="competitionBtn" class="ca-btn ca-gold ca-full">Competition</button>' +
            '</div>' +
            '<div id="competitionArena" class="ca-box ca-box-gold" style="display:none;"><span class="ca-box-in"><div class="ca-box-title ca-gold-t">COMPETITION ARENA</div>' +
            '<div class="ca-eq"><span class="ca-rim ca-flex"><span class="ca-rim-in"><select id="competitionAgentA" class="ca-select">' + agentOptions + '</select></span></span>' +
            '<span class="ca-vs">VS</span>' +
            '<span class="ca-rim ca-flex"><span class="ca-rim-in"><select id="competitionAgentB" class="ca-select">' + agentOptions + '</select></span></span></div>' +
            '<div class="ca-eq"><span class="ca-rim ca-flex"><span class="ca-rim-in"><input type="text" id="competitionPrompt" class="ca-input" placeholder="Test prompt..."></span></span>' +
            '<button id="startCompetitionBtn" class="ca-btn ca-gold">FIGHT</button>' +
            '<button id="closeCompetitionBtn" class="ca-btn">✕</button></div>' +
            '<div id="comparisonResult"></div>' +
            '</span></div>' +
            '<div id="customAgentList" class="ca-list"></div>' +
            '<button onclick="window.showPage(\'dashboard\')" class="ca-btn ca-back">← Kembali ke Dasbor</button>' +
            '</div>';
        if (window.CustomAIUIEvents) {
            window.CustomAIUIEvents.attach(container);
        }
        updateAgentList();
    };

    const init = function() {
        const container = ensureContainer();
        if (container) {
            state.loadAgents();
            state.loadRatings();
            state.loadAnalytics();
            state.loadFeedback();
            state.loadTraining();
            renderUI();
        } else {
            setTimeout(init, 200);
        }
    };

    window.CustomAIUIRenderer = {
        render: renderUI,
        updateList: updateAgentList,
        init: init,
        ensureContainer: ensureContainer
    };

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.CustomAIUIRenderer = window.CustomAIUIRenderer;
})();
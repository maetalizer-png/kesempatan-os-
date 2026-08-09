(function() {
    'use strict';

    const KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN = KESEMPATAN;

    if (window.__CustomAIUIEvents) return;
    window.__CustomAIUIEvents = true;

    const state = KESEMPATAN.CustomAIState;
    const core = KESEMPATAN.CustomAICore;
    const renderer = KESEMPATAN.CustomAIUIRenderer;
    const showToast = KESEMPATAN.Utils ? KESEMPATAN.Utils.showToast : (window.Utils ? window.Utils.showToast : null);

    const attachEvents = function(container) {
        const tempSlider = container.querySelector('#customAgentTemp');
        const tempSpan = container.querySelector('#tempValue');
        if (tempSlider && tempSpan) {
            tempSlider.addEventListener('input', function(e) {
                tempSpan.textContent = parseFloat(e.target.value).toFixed(2);
            });
        }

        const updateTagDisplay = function() {
            const display = container.querySelector('#tagDisplay');
            if (!display) return;
            const currentTags = state.getCurrentTags();
            display.innerHTML = currentTags.map(function(t) {
                return '<span style="background:rgba(0,255,163,0.1);padding:2px 8px;border-radius:12px;font-size:9px;color:#00FFA3;display:inline-flex;align-items:center;gap:4px;">#' + t +
                    '<button class="remove-tag" data-tag="' + t + '" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:9px;">×</button></span>';
            }).join('');
            display.querySelectorAll('.remove-tag').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const tags = state.getCurrentTags().filter(function(t) { return t !== btn.dataset.tag; });
                    state.setCurrentTags(tags);
                    updateTagDisplay();
                });
            });
        };
        updateTagDisplay();

        const addTagBtn = container.querySelector('#addTagBtn');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', function() {
                const select = container.querySelector('#tagSelect');
                const tag = select.value;
                const currentTags = state.getCurrentTags();
                if (tag && !currentTags.includes(tag)) {
                    currentTags.push(tag);
                    state.setCurrentTags(currentTags);
                    updateTagDisplay();
                }
            });
        }

        const autoTagBtn = container.querySelector('#autoTagBtn');
        if (autoTagBtn) {
            autoTagBtn.addEventListener('click', async function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                const role = (container.querySelector('#customAgentRole') || {}).value;
                const prompt = (container.querySelector('#customAgentPrompt') || {}).value;
                if (!name || !role || !prompt) {
                    if (showToast) showToast('Isi nama, role, dan prompt dulu!', 'error');
                    return;
                }
                const tags = await core.autoTagAgent(name.trim(), role.trim(), prompt.trim());
                if (tags && tags.length > 0) {
                    state.setCurrentTags(tags);
                    updateTagDisplay();
                    if (showToast) showToast('Auto-tag: ' + tags.join(', '), 'success');
                }
            });
        }

        const autoCategoryBtn = container.querySelector('#autoCategoryBtn');
        if (autoCategoryBtn) {
            autoCategoryBtn.addEventListener('click', async function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                const role = (container.querySelector('#customAgentRole') || {}).value;
                const prompt = (container.querySelector('#customAgentPrompt') || {}).value;
                if (!name || !role || !prompt) {
                    if (showToast) showToast('Isi nama, role, dan prompt dulu!', 'error');
                    return;
                }
                const category = await core.autoCategory({ name: name.trim(), role: role.trim(), systemPrompt: prompt.trim() });
                if (category) {
                    container.querySelector('#categorySelect').value = category;
                    if (showToast) showToast('Auto-category: ' + category, 'success');
                }
            });
        }

        const previewBtn = container.querySelector('#previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                const role = (container.querySelector('#customAgentRole') || {}).value;
                const prompt = (container.querySelector('#customAgentPrompt') || {}).value;
                const temp = parseFloat((container.querySelector('#customAgentTemp') || {}).value || 0.5);
                if (!prompt) {
                    if (showToast) showToast('Masukkan system prompt!', 'error');
                    return;
                }
                core.previewAgent(name || 'Preview Agent', role || 'Agent', prompt, temp);
            });
        }

        const predictBtn = container.querySelector('#predictBtn');
        if (predictBtn) {
            predictBtn.addEventListener('click', async function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                const role = (container.querySelector('#customAgentRole') || {}).value;
                const prompt = (container.querySelector('#customAgentPrompt') || {}).value;
                const temp = parseFloat((container.querySelector('#customAgentTemp') || {}).value || 0.5);
                if (!name || !role || !prompt) {
                    if (showToast) showToast('Isi semua field!', 'error');
                    return;
                }
                const resultDiv = container.querySelector('#predictionResult');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = 'Memprediksi performa...';
                const prediction = await core.predictPerformance({ name: name.trim(), role: role.trim(), systemPrompt: prompt.trim(), temperature: temp, tags: state.getCurrentTags() });
                if (prediction) {
                    const color = prediction.score >= 70 ? '#00FFA3' : (prediction.score >= 50 ? '#FFD700' : '#FF6B6B');
                    resultDiv.innerHTML = '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
                        '<div><div style="font-weight:bold;color:' + color + ';">Predicted Score: ' + prediction.score + '/100</div>' +
                        '<div style="font-size:10px;color:#666;">Confidence: ' + prediction.confidence + '%</div>' +
                        '<div style="font-size:10px;color:#A0B3C9;">' + (prediction.reason || '') + '</div></div></div>';
                }
            });
        }

        const voicePreviewBtn = container.querySelector('#voicePreviewBtn');
        if (voicePreviewBtn) {
            voicePreviewBtn.addEventListener('click', async function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                const prompt = (container.querySelector('#customAgentPrompt') || {}).value;
                if (!name || !prompt) {
                    if (showToast) showToast('Isi nama dan system prompt!', 'error');
                    return;
                }
                await core.previewAgentVoice(name.trim(), prompt.trim());
            });
        }

        const applyTemplateBtn = container.querySelector('#applyTemplateBtn');
        if (applyTemplateBtn) {
            applyTemplateBtn.addEventListener('click', function() {
                const select = container.querySelector('#templateSelect');
                const key = select ? select.value : null;
                const templates = state.loadTemplates();
                const tpl = templates[key];
                if (tpl) {
                    container.querySelector('#customAgentName').value = tpl.name;
                    container.querySelector('#customAgentRole').value = tpl.role;
                    container.querySelector('#customAgentPrompt').value = tpl.systemPrompt;
                    container.querySelector('#customAgentTemp').value = tpl.temperature;
                    container.querySelector('#tempValue').textContent = tpl.temperature;
                    state.setCurrentTags(tpl.tags || []);
                    container.querySelector('#categorySelect').value = tpl.category || 'General';
                    updateTagDisplay();
                    if (showToast) showToast('Template "' + tpl.name + '" diterapkan!', 'success');
                }
            });
        }

        const saveTemplateBtn = container.querySelector('#saveTemplateBtn');
        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                if (!name) {
                    if (showToast) showToast('Isi nama agen dulu!', 'error');
                    return;
                }
                const templateName = prompt('Nama template:', name);
                if (templateName) {
                    const role = (container.querySelector('#customAgentRole') || {}).value || '';
                    const promptVal = (container.querySelector('#customAgentPrompt') || {}).value || '';
                    const temp = parseFloat((container.querySelector('#customAgentTemp') || {}).value || 0.5);
                    const category = (container.querySelector('#categorySelect') || {}).value || 'General';
                    const templates = state.loadTemplates();
                    templates[templateName] = { name: name, role: role, systemPrompt: promptVal, temperature: temp, tags: state.getCurrentTags(), category: category };
                    state.saveTemplates(templates);
                    if (showToast) showToast('Template "' + templateName + '" tersimpan!', 'success');
                    renderer.render();
                }
            });
        }

        const addBtn = container.querySelector('#addCustomAgentBtn');
        if (addBtn) {
            addBtn.addEventListener('click', async function() {
                const name = (container.querySelector('#customAgentName') || {}).value;
                const role = (container.querySelector('#customAgentRole') || {}).value;
                const prompt = (container.querySelector('#customAgentPrompt') || {}).value;
                const temp = parseFloat((container.querySelector('#customAgentTemp') || {}).value || 0.5);
                const category = (container.querySelector('#categorySelect') || {}).value || 'General';
                if (!name || !role || !prompt) {
                    if (showToast) showToast('Isi semua field!', 'error');
                    return;
                }
                const editingId = state.getEditingId();
                if (editingId) {
                    core.editCustomAgent(editingId, name.trim(), role.trim(), prompt.trim(), temp, state.getCurrentTags(), category);
                    addBtn.textContent = 'TAMBAH AGEN';
                } else {
                    await core.addCustomAgent(name.trim(), role.trim(), prompt.trim(), temp, state.getCurrentTags(), category);
                }
                container.querySelector('#customAgentName').value = '';
                container.querySelector('#customAgentRole').value = '';
                container.querySelector('#customAgentPrompt').value = '';
                if (tempSlider) tempSlider.value = '0.5';
                if (tempSpan) tempSpan.textContent = '0.5';
                state.setCurrentTags([]);
                updateTagDisplay();
                container.querySelector('#predictionResult').style.display = 'none';
                renderer.render();
            });
        }

        const clearBtn = container.querySelector('#clearFormBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                container.querySelector('#customAgentName').value = '';
                container.querySelector('#customAgentRole').value = '';
                container.querySelector('#customAgentPrompt').value = '';
                if (tempSlider) tempSlider.value = '0.5';
                if (tempSpan) tempSpan.textContent = '0.5';
                state.setCurrentTags([]);
                updateTagDisplay();
                container.querySelector('#categorySelect').value = 'General';
                state.setEditingId(null);
                addBtn.textContent = 'TAMBAH AGEN';
                container.querySelector('#predictionResult').style.display = 'none';
                if (showToast) showToast('Form dibersihkan', 'info');
            });
        }

        const generateBtn = container.querySelector('#generateAgentBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', async function() {
                const desc = (container.querySelector('#autoAgentDesc') || {}).value;
                const count = parseInt((container.querySelector('#batchCount') || {}).value || 1);
                if (!desc) {
                    if (showToast) showToast('Masukkan deskripsi agen!', 'error');
                    return;
                }
                await core.generateAgentFromAI(desc.trim(), count);
                container.querySelector('#autoAgentDesc').value = '';
                renderer.render();
            });
        }

        const exportBtn = container.querySelector('#exportAgentsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                state.loadAgents();
                const data = {
                    exportDate: new Date().toISOString(),
                    agents: state.getAgents(),
                    ratings: state.getRatings(),
                    analytics: state.getAnalytics(),
                    training: state.getTraining()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'kes_agents_' + Date.now() + '.json';
                a.click();
                URL.revokeObjectURL(url);
                if (showToast) showToast('Semua agen diekspor!', 'success');
            });
        }

        const importBtn = container.querySelector('#importAgentsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', function() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = async function(event) {
                            try {
                                const data = JSON.parse(event.target.result);
                                if (data.agents && Array.isArray(data.agents)) {
                                    let count = 0;
                                    for (const agent of data.agents) {
                                        const success = await core.addCustomAgent(agent.name, agent.role, agent.systemPrompt, agent.temperature || 0.5, agent.tags || [], agent.category || 'General');
                                        if (success) count++;
                                    }
                                    if (data.ratings) { state.setRatings(data.ratings); state.saveRatings(); }
                                    if (data.analytics) { state.setAnalytics(data.analytics); state.saveAnalytics(); }
                                    if (data.training) { state.setTraining(data.training); state.saveTraining(); }
                                    if (showToast) showToast(count + ' agen berhasil diimpor!', 'success');
                                    renderer.render();
                                } else {
                                    if (showToast) showToast('Format file tidak valid', 'error');
                                }
                            } catch (err) {
                                if (showToast) showToast('Gagal impor: ' + err.message, 'error');
                            }
                        };
                        reader.readAsText(file);
                    }
                };
                input.click();
            });
        }

        const clearAllBtn = container.querySelector('#clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                if (confirm('Hapus SEMUA agen custom?')) {
                    state.setAgents([]);
                    state.setRatings({});
                    state.setAnalytics({});
                    state.setTraining({});
                    state.clearSelected();
                    state.saveAgents();
                    state.saveRatings();
                    state.saveAnalytics();
                    state.saveTraining();
                    renderer.render();
                    if (showToast) showToast('Semua agen dihapus', 'success');
                }
            });
        }

        const refreshBtn = container.querySelector('#refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                renderer.render();
                if (showToast) showToast('Direfresh!', 'success');
            });
        }

        const competitionBtn = container.querySelector('#competitionBtn');
        if (competitionBtn) {
            competitionBtn.addEventListener('click', function() {
                const arena = container.querySelector('#competitionArena');
                if (arena) {
                    arena.style.display = arena.style.display === 'none' ? 'block' : 'none';
                    if (arena.style.display === 'block' && state.getAgents().length >= 2) {
                        const selA = container.querySelector('#competitionAgentA');
                        const selB = container.querySelector('#competitionAgentB');
                        const agents = state.getAgents();
                        if (selA) selA.value = agents[0].id;
                        if (selB) selB.value = (agents[1] && agents[1].id) || agents[0].id;
                    }
                }
            });
        }

        const startCompBtn = container.querySelector('#startCompetitionBtn');
        if (startCompBtn) {
            startCompBtn.addEventListener('click', async function() {
                const id1 = (container.querySelector('#competitionAgentA') || {}).value;
                const id2 = (container.querySelector('#competitionAgentB') || {}).value;
                const prompt = (container.querySelector('#competitionPrompt') || {}).value || 'Analisis peluang bisnis AI untuk UMKM';
                if (id1 && id2) await core.compareAgents(id1, id2, prompt);
            });
        }

        const closeCompBtn = container.querySelector('#closeCompetitionBtn');
        if (closeCompBtn) {
            closeCompBtn.addEventListener('click', function() {
                container.querySelector('#competitionArena').style.display = 'none';
            });
        }

        const selectAllBtn = container.querySelector('#selectAllBtn');
        if (selectAllBtn) selectAllBtn.addEventListener('click', core.selectAllAgents);
        const deselectAllBtn = container.querySelector('#deselectAllBtn');
        if (deselectAllBtn) deselectAllBtn.addEventListener('click', core.deselectAllAgents);
        const deleteSelectedBtn = container.querySelector('#deleteSelectedBtn');
        if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', core.deleteSelectedAgents);
        const exportSelectedBtn = container.querySelector('#exportSelectedBtn');
        if (exportSelectedBtn) exportSelectedBtn.addEventListener('click', core.exportSelectedAgents);

        const searchInput = container.querySelector('#searchAgentInput');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                state.setSearchQuery(e.target.value);
                renderer.updateList();
            });
        }

        const filterTagSelect = container.querySelector('#filterTagSelect');
        if (filterTagSelect) {
            filterTagSelect.addEventListener('change', function(e) {
                state.setFilterTag(e.target.value);
                renderer.updateList();
            });
        }

        const filterCategorySelect = container.querySelector('#filterCategorySelect');
        if (filterCategorySelect) {
            filterCategorySelect.addEventListener('change', function(e) {
                state.setFilterCategory(e.target.value);
                renderer.updateList();
            });
        }

        const sortSelect = container.querySelector('#sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function(e) {
                state.setSortMode(e.target.value);
                renderer.updateList();
            });
        }

        const clearFilterBtn = container.querySelector('#clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', function() {
                container.querySelector('#searchAgentInput').value = '';
                container.querySelector('#filterTagSelect').value = 'all';
                container.querySelector('#filterCategorySelect').value = 'all';
                container.querySelector('#sortSelect').value = 'aiScore';
                state.setSearchQuery('');
                state.setFilterTag('all');
                state.setFilterCategory('all');
                state.setSortMode('aiScore');
                renderer.updateList();
            });
        }
    };

    KESEMPATAN.CustomAIUIEvents = {
        attach: attachEvents
    };
})();
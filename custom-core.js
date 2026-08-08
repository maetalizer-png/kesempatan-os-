(function() {
    'use strict';
    if (window.__CustomAICore) return;
    window.__CustomAICore = true;

    const state = window.CustomAIState;
    const config = window.CustomAIConfig;
    const showToast = window.Utils ? window.Utils.showToast : null;

    const AVATARS = config.AVATARS;
    const CATEGORIES = config.CATEGORIES;
    const ALL_TAGS = config.ALL_TAGS;

    const escapeHtml = function(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    };

    const getApiKey = function() {
        const input = document.getElementById('apiKeyInput');
        if (input && input.value && input.value.trim().length > 10) return input.value.trim();
        if (window.CONFIG && window.CONFIG.API_KEYS && window.CONFIG.API_KEYS.openrouter) return window.CONFIG.API_KEYS.openrouter;
        return null;
    };

    const callAI = async function(prompt, apiKey) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]) return data.choices[0].message.content;
        throw new Error((data.error && data.error.message) || 'Gagal memanggil AI');
    };

    const parseJSON = function(str) {
        try {
            let cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
            const first = cleaned.indexOf('{');
            const last = cleaned.lastIndexOf('}');
            if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
            return JSON.parse(cleaned);
        } catch (e) {
            return {};
        }
    };

    const generateAvatar = function(name) {
        const index = name.length % AVATARS.length;
        return AVATARS[index];
    };

    const getAgentRating = function(id) {
        state.loadRatings();
        const ratings = state.getRatings();
        if (ratings[id]) {
            return {
                average: (ratings[id].total / ratings[id].count).toFixed(1),
                count: ratings[id].count
            };
        }
        return { average: 0, count: 0 };
    };

    const getAgentAnalytics = function(id) {
        state.loadAnalytics();
        const analytics = state.getAnalytics();
        if (analytics[id]) return analytics[id];
        return { usageCount: 0, avgScore: 0, successRate: 0, lastUsed: null, aiScore: 50 };
    };

    const updateAgentAnalytics = function(id, score, success) {
        state.loadAnalytics();
        const analytics = state.getAnalytics();
        if (!analytics[id]) {
            analytics[id] = { usageCount: 0, avgScore: 0, successRate: 0, lastUsed: null, aiScore: 50 };
        }
        const stats = analytics[id];
        stats.usageCount++;
        stats.avgScore = ((stats.avgScore * (stats.usageCount - 1)) + score) / stats.usageCount;
        stats.successRate = ((stats.successRate * (stats.usageCount - 1)) + (success ? 1 : 0)) / stats.usageCount * 100;
        stats.lastUsed = Date.now();
        stats.aiScore = Math.min(100, Math.max(0, stats.aiScore + (success ? 1 : -0.5)));
        state.saveAnalytics();
    };

    const autoTagAgent = async function(name, role, systemPrompt) {
        const apiKey = getApiKey();
        if (!apiKey) return ['general'];
        try {
            const prompt = 'Berdasarkan agen berikut, berikan 3 tag yang paling sesuai dari daftar ini: ' + ALL_TAGS.join(', ') +
                '\n\nNama: ' + name + '\nRole: ' + role + '\nSystem Prompt: ' + systemPrompt.substring(0, 300) +
                '\n\nOutput HANYA array JSON, contoh: ["marketing", "digital", "creative"]';
            const response = await callAI(prompt, apiKey);
            const parsed = parseJSON(response);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(function(t) { return ALL_TAGS.includes(t); }).slice(0, 3);
            }
            return ['general'];
        } catch (e) {
            return ['general'];
        }
    };

    const predictPerformance = async function(agent) {
        const apiKey = getApiKey();
        if (!apiKey) return { score: 50, confidence: 0, reason: 'Tidak ada API Key' };
        try {
            const prompt = 'Prediksi performa agen AI ini berdasarkan:\nNama: ' + agent.name + '\nRole: ' + agent.role +
                '\nSystem Prompt: ' + agent.systemPrompt.substring(0, 300) + '\nTemperature: ' + agent.temperature +
                '\nTags: ' + (agent.tags || []).join(', ') + '\n\nOutput dalam format JSON: { score: 0-100, confidence: 0-100, reason: "alasan singkat" }';
            const response = await callAI(prompt, apiKey);
            const parsed = parseJSON(response);
            if (parsed.score) return parsed;
            return { score: 50, confidence: 30, reason: 'Default prediction' };
        } catch (e) {
            return { score: 50, confidence: 20, reason: 'Gagal prediksi' };
        }
    };

    const autoCategory = async function(agent) {
        const apiKey = getApiKey();
        if (!apiKey) return 'General';
        try {
            const prompt = 'Kategorikan agen ini ke salah satu kategori: ' + CATEGORIES.join(', ') +
                '\nNama: ' + agent.name + '\nRole: ' + agent.role + '\nSystem Prompt: ' + agent.systemPrompt.substring(0, 300) +
                '\n\nOutput HANYA nama kategori, tanpa penjelasan.';
            const response = await callAI(prompt, apiKey);
            const category = response.trim();
            return CATEGORIES.includes(category) ? category : 'General';
        } catch (e) {
            return 'General';
        }
    };

    const generateSmartDescription = async function(name, role, systemPrompt) {
        const apiKey = getApiKey();
        if (!apiKey) return 'Agen ' + name + ' - ' + role;
        try {
            const prompt = 'Buatkan deskripsi singkat (1 kalimat) untuk agen AI ini:\nNama: ' + name + '\nRole: ' + role +
                '\nSystem Prompt: ' + systemPrompt.substring(0, 300) + '\n\nOutput HANYA teks deskripsi, maks 50 kata.';
            const response = await callAI(prompt, apiKey);
            return response || 'Agen ' + name + ' - ' + role;
        } catch (e) {
            return 'Agen ' + name + ' - ' + role;
        }
    };

    const suggestSmartTags = async function(systemPrompt) {
        const apiKey = getApiKey();
        if (!apiKey) return [];
        try {
            const prompt = 'Berdasarkan teks berikut, berikan 5 tag yang paling relevan dari daftar ini: ' + ALL_TAGS.join(', ') +
                '\n\n' + systemPrompt.substring(0, 500) + '\n\nOutput HANYA array JSON, contoh: ["marketing", "digital", "creative", "seo", "content"]';
            const response = await callAI(prompt, apiKey);
            const parsed = parseJSON(response);
            return Array.isArray(parsed) ? parsed.filter(function(t) { return ALL_TAGS.includes(t); }).slice(0, 5) : [];
        } catch (e) {
            return [];
        }
    };

    const addCustomAgent = async function(name, role, systemPrompt, temperature, tags, category) {
        temperature = temperature || 0.5;
        tags = tags || [];
        category = category || 'General';
        if (!name || !role || !systemPrompt) {
            if (showToast) showToast('Isi semua field!', 'error');
            return false;
        }
        const id = Date.now().toString();
        if (!tags || tags.length === 0) tags = await autoTagAgent(name, role, systemPrompt);
        if (!category || category === 'General') category = await autoCategory({ name: name, role: role, systemPrompt: systemPrompt });
        const prediction = await predictPerformance({ name: name, role: role, systemPrompt: systemPrompt, temperature: temperature, tags: tags });
        const agent = {
            id: id,
            name: name,
            role: role,
            systemPrompt: systemPrompt,
            temperature: parseFloat(temperature),
            isCustom: true,
            createdAt: new Date().toISOString(),
            rating: 0,
            ratingCount: 0,
            tags: tags || [],
            category: category,
            avatar: generateAvatar(name),
            description: await generateSmartDescription(name, role, systemPrompt),
            aiScore: prediction.score || 50,
            predictionConfidence: prediction.confidence || 0,
            predictionReason: prediction.reason || '',
            logoUrl: null
        };
        if (typeof window.AGENTS_CONFIG !== 'undefined') {
            window.AGENTS_CONFIG[id] = { name: name, role: role, systemPrompt: systemPrompt, temperature: agent.temperature, maxTokens: 800, fewShotExamples: [] };
        }
        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
            if (!window.CONFIG.AGENTS.includes(id)) window.CONFIG.AGENTS.push(id);
        }
        const agents = state.getAgents();
        agents.push(agent);
        state.saveAgents();
        if (showToast) showToast('Agen "' + name + '" berhasil ditambahkan! (AI Score: ' + agent.aiScore + ')', 'success');
        if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
        return true;
    };

    const editCustomAgent = function(id, name, role, systemPrompt, temperature, tags, category) {
        const agents = state.getAgents();
        const agent = agents.find(function(a) { return a.id === id; });
        if (!agent) {
            if (showToast) showToast('Agen tidak ditemukan!', 'error');
            return false;
        }
        agent.name = name;
        agent.role = role;
        agent.systemPrompt = systemPrompt;
        agent.temperature = parseFloat(temperature);
        if (tags) agent.tags = tags;
        if (category) agent.category = category;
        if (typeof window.AGENTS_CONFIG !== 'undefined' && window.AGENTS_CONFIG[id]) {
            window.AGENTS_CONFIG[id].name = name;
            window.AGENTS_CONFIG[id].role = role;
            window.AGENTS_CONFIG[id].systemPrompt = systemPrompt;
            window.AGENTS_CONFIG[id].temperature = agent.temperature;
        }
        state.saveAgents();
        if (showToast) showToast('Agen "' + name + '" berhasil diupdate!', 'success');
        state.setEditingId(null);
        if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
        return true;
    };

    const deleteCustomAgent = function(id) {
        const agents = state.getAgents();
        const agent = agents.find(function(a) { return a.id === id; });
        if (!agent) return false;
        if (typeof window.AGENTS_CONFIG !== 'undefined') delete window.AGENTS_CONFIG[id];
        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
            const idx = window.CONFIG.AGENTS.indexOf(id);
            if (idx !== -1) window.CONFIG.AGENTS.splice(idx, 1);
        }
        const index = agents.findIndex(function(a) { return a.id === id; });
        if (index !== -1) agents.splice(index, 1);
        state.saveAgents();
        state.deleteSelected(id);
        if (showToast) showToast('Agen "' + agent.name + '" dihapus', 'info');
        if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
        return true;
    };

    const previewAgent = async function(name, role, systemPrompt, temperature) {
        const apiKey = getApiKey();
        if (!apiKey) {
            if (showToast) showToast('Masukkan API Key!', 'error');
            return;
        }
        const container = document.getElementById('agentPreview');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = 'Menghasilkan preview...';
        try {
            const prompt = systemPrompt + '\n\nBerikan contoh analisis singkat tentang "bisnis AI untuk UMKM" berdasarkan peran Anda sebagai ' + role + '. Maks 100 kata.';
            const response = await callAI(prompt, apiKey);
            container.innerHTML = '<div style="background:rgba(0,255,163,0.05);border-radius:8px;padding:12px;border:1px solid rgba(0,255,163,0.2);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="color:#00FFA3;font-weight:bold;">Preview: ' + escapeHtml(name) + '</span>' +
                '<span style="font-size:9px;color:#666;">Temp: ' + temperature + '</span></div>' +
                '<div style="font-size:12px;color:#A0B3C9;line-height:1.6;white-space:pre-wrap;">' + escapeHtml(response) + '</div>' +
                '<button onclick="document.getElementById(\'agentPreview\').style.display=\'none\'" style="margin-top:8px;padding:2px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#666;cursor:pointer;font-size:9px;">Tutup</button></div>';
        } catch (e) {
            container.innerHTML = '<div style="color:#FF4444;">Gagal preview: ' + e.message + '</div>';
        }
    };

    const previewAgentVoice = async function(name, systemPrompt) {
        const apiKey = getApiKey();
        if (!apiKey) {
            if (showToast) showToast('Masukkan API Key!', 'error');
            return;
        }
        const prompt = systemPrompt + '\n\nPerkenalkan diri Anda singkat sebagai ' + name + '. Maks 50 kata.';
        try {
            const response = await callAI(prompt, apiKey);
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.lang = 'id-ID';
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                const voices = window.speechSynthesis.getVoices();
                const indonesianVoice = voices.find(function(v) { return v.lang === 'id-ID' || v.lang === 'id'; });
                if (indonesianVoice) utterance.voice = indonesianVoice;
                window.speechSynthesis.speak(utterance);
                if (showToast) showToast('Mendengarkan suara agen...', 'info');
            } else {
                if (showToast) showToast('Browser tidak support speech', 'error');
            }
        } catch (e) {
            if (showToast) showToast('Gagal preview voice', 'error');
        }
    };

    const compareAgents = async function(id1, id2, testPrompt) {
        const agents = state.getAgents();
        const agent1 = agents.find(function(a) { return a.id === id1; });
        const agent2 = agents.find(function(a) { return a.id === id2; });
        if (!agent1 || !agent2) {
            if (showToast) showToast('Agen tidak ditemukan!', 'error');
            return;
        }
        const apiKey = getApiKey();
        if (!apiKey) {
            if (showToast) showToast('Masukkan API Key!', 'error');
            return;
        }
        const container = document.getElementById('comparisonResult');
        if (!container) return;
        container.innerHTML = '<div style="color:#FFD700;text-align:center;">Membandingkan...</div>';
        try {
            const responses = await Promise.all([
                callAI(agent1.systemPrompt + '\n\n' + testPrompt, apiKey),
                callAI(agent2.systemPrompt + '\n\n' + testPrompt, apiKey)
            ]);
            const judgePrompt = 'Bandingkan 2 respons ini dan tentukan mana yang lebih baik:\n\nRESPONS 1 (' + agent1.name + '):\n' + responses[0] +
                '\n\nRESPONS 2 (' + agent2.name + '):\n' + responses[1] +
                '\n\nOutput JSON: { winner: "nama agen", reason: "alasan singkat", score1: 0-100, score2: 0-100 }';
            const judgeResult = await callAI(judgePrompt, apiKey);
            const result = parseJSON(judgeResult);
            container.innerHTML = '<div style="background:linear-gradient(135deg,rgba(0,255,163,0.05),rgba(155,89,182,0.05));border-radius:16px;padding:16px;border:1px solid rgba(0,255,163,0.15);">' +
                '<div style="color:#FFD700;font-weight:bold;font-size:16px;text-align:center;margin-bottom:12px;">AGEN COMPARISON</div>' +
                '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;">' +
                '<div style="text-align:center;"><div style="font-size:32px;">' + (agent1.avatar || '●') + '</div>' +
                '<div style="font-weight:bold;color:#00FFA3;">' + escapeHtml(agent1.name) + '</div>' +
                '<div style="font-size:24px;font-weight:bold;color:' + (result.score1 >= result.score2 ? '#00FFA3' : '#666') + ';">' + result.score1 + '</div></div>' +
                '<div style="font-size:28px;color:#FFD700;">VS</div>' +
                '<div style="text-align:center;"><div style="font-size:32px;">' + (agent2.avatar || '●') + '</div>' +
                '<div style="font-weight:bold;color:#00FFA3;">' + escapeHtml(agent2.name) + '</div>' +
                '<div style="font-size:24px;font-weight:bold;color:' + (result.score2 >= result.score1 ? '#00FFA3' : '#666') + ';">' + result.score2 + '</div></div></div>' +
                '<div style="text-align:center;margin-top:12px;padding:8px;background:rgba(0,0,0,0.2);border-radius:8px;">' +
                '<div style="font-size:18px;font-weight:bold;color:#FFD700;">' + result.winner + '</div>' +
                '<div style="font-size:11px;color:#A0B3C9;">' + (result.reason || 'Penilaian AI') + '</div></div>' +
                '<button onclick="document.getElementById(\'comparisonResult\').innerHTML=\'\'" style="margin-top:8px;padding:4px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#666;cursor:pointer;font-size:9px;">Tutup</button></div>';
        } catch (e) {
            container.innerHTML = '<div style="color:#FF4444;">Gagal membandingkan: ' + e.message + '</div>';
        }
    };

    const shareAgent = function(id) {
        const agents = state.getAgents();
        const agent = agents.find(function(a) { return a.id === id; });
        if (!agent) return;
        const data = {
            type: 'agent_share',
            agent: {
                name: agent.name,
                role: agent.role,
                systemPrompt: agent.systemPrompt,
                temperature: agent.temperature,
                tags: agent.tags || [],
                category: agent.category || 'General'
            },
            timestamp: Date.now()
        };
        const json = JSON.stringify(data);
        const encoded = btoa(encodeURIComponent(json));
        const url = window.location.origin + window.location.pathname + '?import=' + encoded;
        navigator.clipboard.writeText(url).then(function() {
            if (showToast) showToast('Link share disalin! Bisa dibagikan ke orang lain.', 'success');
        }).catch(function() {});
    };

    const selectAllAgents = function() {
        const filtered = getFilteredAgents();
        filtered.forEach(function(a) { state.addSelected(a.id); });
        if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
    };

    const deselectAllAgents = function() {
        state.clearSelected();
        if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
    };

    const deleteSelectedAgents = function() {
        const selected = state.getSelected();
        if (selected.size === 0) {
            if (showToast) showToast('Pilih agen dulu!', 'error');
            return;
        }
        if (confirm('Hapus ' + selected.size + ' agen terpilih?')) {
            const ids = Array.from(selected);
            ids.forEach(function(id) { deleteCustomAgent(id); });
            state.clearSelected();
            if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
            if (showToast) showToast(ids.length + ' agen dihapus', 'success');
        }
    };

    const exportSelectedAgents = function() {
        const selected = state.getSelected();
        if (selected.size === 0) {
            if (showToast) showToast('Pilih agen dulu!', 'error');
            return;
        }
        const ids = Array.from(selected);
        const agents = state.getAgents().filter(function(a) { return ids.includes(a.id); });
        const data = {
            exportDate: new Date().toISOString(),
            count: agents.length,
            agents: agents,
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
        if (showToast) showToast(agents.length + ' agen diekspor!', 'success');
    };

    const generateAgentFromAI = async function(description, count) {
        const apiKey = getApiKey();
        if (!apiKey) {
            if (showToast) showToast('Masukkan API Key!', 'error');
            return;
        }
        if (state.isGenerating()) return;
        state.setIsGenerating(true);
        const statusDiv = document.getElementById('autoAgentStatus');
        if (statusDiv) statusDiv.innerHTML = 'AI sedang menciptakan ' + count + ' agen...';
        try {
            const prompt = 'Buatkan ' + count + ' agen AI berdasarkan deskripsi: "' + description + '".\nOutput dalam format JSON array: [{ name, role, systemPrompt, temperature, tags, category }]\n\nPastikan:\n- name: nama agen (maks 20 karakter)\n- role: peran agen\n- systemPrompt: prompt lengkap (maks 300 karakter)\n- temperature: 0.1-1.0\n- tags: array dari [' + ALL_TAGS.join(', ') + ']\n- category: salah satu dari [' + CATEGORIES.join(', ') + ']';
            const response = await callAI(prompt, apiKey);
            const agents = parseJSON(response);
            let successCount = 0;
            if (Array.isArray(agents)) {
                for (const agentData of agents) {
                    if (agentData.name && agentData.role && agentData.systemPrompt) {
                        const success = await addCustomAgent(
                            agentData.name,
                            agentData.role,
                            agentData.systemPrompt,
                            agentData.temperature || 0.5,
                            agentData.tags || [],
                            agentData.category || 'General'
                        );
                        if (success) successCount++;
                    }
                }
            }
            if (statusDiv) statusDiv.innerHTML = successCount + ' agen berhasil diciptakan!';
            if (showToast) showToast(successCount + ' agen diciptakan AI!', 'success');
            if (window.CustomAIUIRenderer) window.CustomAIUIRenderer.render();
        } catch (e) {
            if (statusDiv) statusDiv.innerHTML = 'Gagal: ' + e.message;
            if (showToast) showToast('Gagal generate: ' + e.message, 'error');
        }
        state.setIsGenerating(false);
    };

    const getFilteredAgents = function() {
        const agents = state.getAgents();
        const search = state.getSearchQuery();
        const tag = state.getFilterTag();
        const category = state.getFilterCategory();
        const sort = state.getSortMode();
        let filtered = agents.filter(function(a) {
            const matchName = a.name.toLowerCase().includes(search.toLowerCase());
            const matchRole = a.role.toLowerCase().includes(search.toLowerCase());
            const matchTags = tag === 'all' || (a.tags && a.tags.includes(tag));
            const matchCategory = category === 'all' || a.category === category;
            return (matchName || matchRole) && matchTags && matchCategory;
        });
        if (sort === 'aiScore') {
            filtered.sort(function(a, b) { return (getAgentAnalytics(b.id).aiScore || 0) - (getAgentAnalytics(a.id).aiScore || 0); });
        } else if (sort === 'usage') {
            filtered.sort(function(a, b) { return (getAgentAnalytics(b.id).usageCount || 0) - (getAgentAnalytics(a.id).usageCount || 0); });
        } else if (sort === 'rating') {
            filtered.sort(function(a, b) {
                const ratingA = getAgentRating(a.id);
                const ratingB = getAgentRating(b.id);
                return (parseFloat(ratingB.average) || 0) - (parseFloat(ratingA.average) || 0);
            });
        } else if (sort === 'name') {
            filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
        } else if (sort === 'newest') {
            filtered.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        }
        return filtered;
    };

    if (window.WorkflowEngine) {
        const originalStart = window.WorkflowEngine.start;
        window.WorkflowEngine.start = async function(payload, uploadedContent) {
            const result = await originalStart.call(this, payload, uploadedContent);
            const checkboxes = document.querySelectorAll('.agent-checkbox:checked');
            const agents = Array.from(checkboxes).map(function(cb) { return cb.dataset.agent; });
            for (const agent of agents) {
                const isCustom = state.getAgents().find(function(a) { return a.id === agent || a.name === agent; });
                if (isCustom) {
                    const score = (window.lastAggregated && window.lastAggregated.score) || 50;
                    updateAgentAnalytics(isCustom.id, score, score >= 70);
                }
            }
            return result;
        };
    }

    window.CustomAICore = {
        escapeHtml: escapeHtml,
        getApiKey: getApiKey,
        callAI: callAI,
        parseJSON: parseJSON,
        generateAvatar: generateAvatar,
        getAgentRating: getAgentRating,
        getAgentAnalytics: getAgentAnalytics,
        updateAgentAnalytics: updateAgentAnalytics,
        autoTagAgent: autoTagAgent,
        predictPerformance: predictPerformance,
        autoCategory: autoCategory,
        generateSmartDescription: generateSmartDescription,
        suggestSmartTags: suggestSmartTags,
        addCustomAgent: addCustomAgent,
        editCustomAgent: editCustomAgent,
        deleteCustomAgent: deleteCustomAgent,
        previewAgent: previewAgent,
        previewAgentVoice: previewAgentVoice,
        compareAgents: compareAgents,
        shareAgent: shareAgent,
        selectAllAgents: selectAllAgents,
        deselectAllAgents: deselectAllAgents,
        deleteSelectedAgents: deleteSelectedAgents,
        exportSelectedAgents: exportSelectedAgents,
        generateAgentFromAI: generateAgentFromAI,
        getFilteredAgents: getFilteredAgents
    };

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.CustomAICore = window.CustomAICore;
})();
(function() {
"use strict";

if (typeof window.extendGeneralAgents === 'undefined') {
    window.extendGeneralAgents = async function() {
        async function loadPrompt(agentName) {
            try {
                const response = await fetch(`${agentName}.txt`);
                if (response.ok) return await response.text();
            } catch (error) { console.warn('[AgentsConfig] loadPrompt fetch failed:', error.message); }
            return `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda. Output dalam format JSON.`;
        }

        const generalAgents = {
            Hukum: { name: "Hukum", role: "Profesor Hukum", systemPrompt: await loadPrompt('hukum'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            Ekonomi: { name: "Ekonomi", role: "Profesor Ekonomi", systemPrompt: await loadPrompt('ekonomi'), temperature: 0.6, maxTokens: 1500, fewShotExamples: [] },
            Psikologi: { name: "Psikologi", role: "Profesor Psikologi", systemPrompt: await loadPrompt('psikologi'), temperature: 0.7, maxTokens: 1500, fewShotExamples: [] },
            Geografi: { name: "Geografi", role: "Profesor Geografi", systemPrompt: await loadPrompt('geografi'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Sejarah: { name: "Sejarah", role: "Profesor Sejarah", systemPrompt: await loadPrompt('sejarah'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            Filsafat: { name: "Filsafat", role: "Profesor Filsafat", systemPrompt: await loadPrompt('filsafat'), temperature: 0.6, maxTokens: 1500, fewShotExamples: [] },
            SeniBudaya: { name: "SeniBudaya", role: "Profesor Seni Budaya", systemPrompt: await loadPrompt('senibudaya'), temperature: 0.7, maxTokens: 1500, fewShotExamples: [] },
            Olahraga: { name: "Olahraga", role: "Profesor Olahraga", systemPrompt: await loadPrompt('olahraga'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            Pendidikan: { name: "Pendidikan", role: "Profesor Pendidikan", systemPrompt: await loadPrompt('pendidikan'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Agama: { name: "Agama", role: "Profesor Agama", systemPrompt: await loadPrompt('agama'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            Pertanian: { name: "Pertanian", role: "Profesor Pertanian", systemPrompt: await loadPrompt('pertanian'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            TeknologiInformasi: { name: "TeknologiInformasi", role: "Profesor Teknologi Informasi", systemPrompt: await loadPrompt('teknologiinformasi'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] }
        };

        if (typeof window.AGENTS_CONFIG !== 'undefined') {
            for (const [key, value] of Object.entries(generalAgents)) {
                if (!window.AGENTS_CONFIG[key]) window.AGENTS_CONFIG[key] = value;
            }
        }

        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
            for (const agent of Object.keys(generalAgents)) {
                if (!window.CONFIG.AGENTS.includes(agent)) window.CONFIG.AGENTS.push(agent);
            }
        }

        window.AGENTS_GENERAL = Object.keys(generalAgents);

        window.KESEMPATAN = window.KESEMPATAN || {};
        window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
        window.KESEMPATAN.Agents.General = window.AGENTS_GENERAL;

        if (window.KESEMPATAN?.AgentRenderer?.renderAllAgents) window.KESEMPATAN.AgentRenderer.renderAllAgents();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.extendGeneralAgents());
    } else {
        window.extendGeneralAgents();
    }
}
})();
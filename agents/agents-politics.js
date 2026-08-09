(function() {
"use strict";

if (typeof window.extendPoliticsAgents === 'undefined') {
    window.extendPoliticsAgents = async function() {
        async function loadPrompt(agentName) {
            try {
                const response = await fetch(`prompts/${agentName}.txt`);
                if (response.ok) return await response.text();
            } catch (error) { console.warn('[AgentsConfig] loadPrompt fetch failed:', error.message); }
            return `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda. Output dalam format JSON.`;
        }

        const politicsAgents = {
            PolitikDalamNegeri: { name: "PolitikDalamNegeri", role: "Profesor Politik Dalam Negeri", systemPrompt: await loadPrompt('politikdalamnegeri'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            HubunganInternasional: { name: "HubunganInternasional", role: "Profesor Hubungan Internasional", systemPrompt: await loadPrompt('hubunganinternasional'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            KebijakanPublik: { name: "KebijakanPublik", role: "Profesor Kebijakan Publik", systemPrompt: await loadPrompt('kebijakanpublik'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            Geopolitik: { name: "Geopolitik", role: "Profesor Geopolitik", systemPrompt: await loadPrompt('geopolitik'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            KomunikasiPolitik: { name: "KomunikasiPolitik", role: "Profesor Komunikasi Politik", systemPrompt: await loadPrompt('komunikasipolitik'), temperature: 0.6, maxTokens: 1500, fewShotExamples: [] }
        };

        if (typeof window.AGENTS_CONFIG !== 'undefined') {
            for (const [key, value] of Object.entries(politicsAgents)) {
                if (!window.AGENTS_CONFIG[key]) window.AGENTS_CONFIG[key] = value;
            }
        }

        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
            for (const agent of Object.keys(politicsAgents)) {
                if (!window.CONFIG.AGENTS.includes(agent)) window.CONFIG.AGENTS.push(agent);
            }
        }

        window.AGENTS_POLITICS = Object.keys(politicsAgents);

        window.KESEMPATAN = window.KESEMPATAN || {};
        window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
        window.KESEMPATAN.Agents.Politics = window.AGENTS_POLITICS;

        if (window.KESEMPATAN?.AgentRenderer?.renderAllAgents) window.KESEMPATAN.AgentRenderer.renderAllAgents();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.extendPoliticsAgents());
    } else {
        window.extendPoliticsAgents();
    }
}
})();
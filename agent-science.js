(function() {
"use strict";

if (typeof window.extendScienceAgents === 'undefined') {
    window.extendScienceAgents = async function() {
        async function loadPrompt(agentName) {
            try {
                const response = await fetch(`prompts/${agentName}.txt`);
                if (response.ok) return await response.text();
            } catch (error) {}
            return `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda. Output dalam format JSON.`;
        }

        const scienceAgents = {
            Matematika: { name: "Matematika", role: "Profesor Matematika", systemPrompt: await loadPrompt('matematika'), temperature: 0.3, maxTokens: 1500, fewShotExamples: [] },
            Biologi: { name: "Biologi", role: "Profesor Biologi", systemPrompt: await loadPrompt('biologi'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Fisika: { name: "Fisika", role: "Profesor Fisika", systemPrompt: await loadPrompt('fisika'), temperature: 0.3, maxTokens: 1500, fewShotExamples: [] },
            Sains: { name: "Sains", role: "Profesor Sains", systemPrompt: await loadPrompt('sains'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Astronomi: { name: "Astronomi", role: "Profesor Astronomi", systemPrompt: await loadPrompt('astronomi'), temperature: 0.3, maxTokens: 1500, fewShotExamples: [] },
            Kedokteran: { name: "Kedokteran", role: "Profesor Kedokteran", systemPrompt: await loadPrompt('kedokteran'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Teknik: { name: "Teknik", role: "Profesor Teknik", systemPrompt: await loadPrompt('teknik'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Kimia: { name: "Kimia", role: "Profesor Kimia", systemPrompt: await loadPrompt('kimia'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Robotika: { name: "Robotika", role: "Profesor Robotika", systemPrompt: await loadPrompt('robotika'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Coding: { name: "Coding", role: "Profesor Coding", systemPrompt: await loadPrompt('coding'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Cyber: { name: "Cyber", role: "Profesor Keamanan Siber", systemPrompt: await loadPrompt('cyber'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            IlmuKomputer: { name: "IlmuKomputer", role: "Profesor Ilmu Komputer", systemPrompt: await loadPrompt('ilmukomputer'), temperature: 0.3, maxTokens: 1500, fewShotExamples: [] },
            Arsitektur: { name: "Arsitektur", role: "Profesor Arsitektur", systemPrompt: await loadPrompt('arsitektur'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            Statistika: { name: "Statistika", role: "Profesor Statistika", systemPrompt: await loadPrompt('statistika'), temperature: 0.3, maxTokens: 1500, fewShotExamples: [] }
        };

        if (typeof window.AGENTS_CONFIG !== 'undefined') {
            for (const [key, value] of Object.entries(scienceAgents)) {
                if (!window.AGENTS_CONFIG[key]) window.AGENTS_CONFIG[key] = value;
            }
        }

        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
            for (const agent of Object.keys(scienceAgents)) {
                if (!window.CONFIG.AGENTS.includes(agent)) window.CONFIG.AGENTS.push(agent);
            }
        }

        window.AGENTS_SCIENCE = Object.keys(scienceAgents);

        window.KESEMPATAN = window.KESEMPATAN || {};
        window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
        window.KESEMPATAN.Agents.Science = window.AGENTS_SCIENCE;

        if (typeof window.renderAllAgents === 'function') window.renderAllAgents();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.extendScienceAgents());
    } else {
        window.extendScienceAgents();
    }
}
})();
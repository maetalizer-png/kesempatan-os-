(function() {
"use strict";

window.AGENTS_CONFIG = window.AGENTS_CONFIG || {};

async function loadPrompt(agentName) {
    const currentYear = new Date().getFullYear();
    try {
        const response = await fetch(`${agentName}.txt`);
        if (response.ok) {
            const text = await response.text();
            return text.replace(/\{\{TAHUN\}\}/g, currentYear);
        }
    } catch (error) {}
    return `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda untuk tahun ${currentYear}. Output dalam format JSON.`;
}

window.extendBisnisAgents = async function() {
    const bisnisAgents = {
        RahmadRaharjo: { name: "Rahmad Raharjo", role: "Senior Business Strategist & Opportunity Analyst", systemPrompt: await loadPrompt('rahmadraharjo'), temperature: 0.85, maxTokens: 1300, fewShotExamples: [] },
        Manager: { name: "Manager", role: "Strategic Business Coordinator with 15+ years experience", systemPrompt: await loadPrompt('manager'), temperature: 0.5, maxTokens: 1300, fewShotExamples: [] },
        Hunter: { name: "Hunter", role: "Opportunity Seeker & Market Explorer", systemPrompt: await loadPrompt('hunter'), temperature: 0.7, maxTokens: 1300, fewShotExamples: [] },
        Analyst: { name: "Analyst", role: "Quantitative Analyst & Data Expert", systemPrompt: await loadPrompt('analyst'), temperature: 0.3, maxTokens: 1300, fewShotExamples: [] },
        Strategist: { name: "Strategist", role: "Long-term Strategy Planner", systemPrompt: await loadPrompt('strategist'), temperature: 0.6, maxTokens: 1300, fewShotExamples: [] },
        Verifier: { name: "Verifier", role: "Truth & Consistency Verifier", systemPrompt: await loadPrompt('verifier'), temperature: 0.1, maxTokens: 1300, fewShotExamples: [] },
        Researcher: { name: "Researcher", role: "Data & Research Specialist", systemPrompt: await loadPrompt('researcher'), temperature: 0.3, maxTokens: 1300, fewShotExamples: [] },
        Copywriter: { name: "Copywriter", role: "Marketing Copy & Content Writer", systemPrompt: await loadPrompt('copywriter'), temperature: 0.8, maxTokens: 1300, fewShotExamples: [] },
        Script: { name: "Script", role: "Video Script Writer", systemPrompt: await loadPrompt('script'), temperature: 0.7, maxTokens: 1300, fewShotExamples: [] },
        Planner: { name: "Planner", role: "Content & Social Media Planner", systemPrompt: await loadPrompt('planner'), temperature: 0.5, maxTokens: 1300, fewShotExamples: [] },
        Distributor: { name: "Distributor", role: "Distribution Channel Manager", systemPrompt: await loadPrompt('distributor'), temperature: 0.4, maxTokens: 1300, fewShotExamples: [] },
        Optimizer: { name: "Optimizer", role: "Performance & Conversion Optimizer", systemPrompt: await loadPrompt('optimizer'), temperature: 0.3, maxTokens: 1300, fewShotExamples: [] },
        Memory: { name: "Memory", role: "Memory & Knowledge Manager", systemPrompt: await loadPrompt('memory'), temperature: 0.2, maxTokens: 1300, fewShotExamples: [] },
        PromptOptimizer: { name: "PromptOptimizer", role: "Prompt Engineer & A/B Testing Specialist", systemPrompt: await loadPrompt('promptoptimizer'), temperature: 0.6, maxTokens: 1300, fewShotExamples: [] }
    };

    for (const [key, value] of Object.entries(bisnisAgents)) {
        window.AGENTS_CONFIG[key] = value;
    }

    if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
        for (const agent of Object.keys(bisnisAgents)) {
            if (!window.CONFIG.AGENTS.includes(agent)) {
                window.CONFIG.AGENTS.push(agent);
            }
        }
    }

    window.AGENTS_BISNIS = Object.keys(bisnisAgents);

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
    window.KESEMPATAN.Agents.Bisnis = window.AGENTS_BISNIS;
    window.KESEMPATAN.Agents.Config = window.AGENTS_CONFIG;

    if (typeof window.renderAllAgents === 'function') {
        window.renderAllAgents();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.extendBisnisAgents());
} else {
    window.extendBisnisAgents();
}
})();

function getAgentConfig(agentName) {
    return window.AGENTS_CONFIG[agentName] || {
        name: agentName,
        role: "General AI",
        systemPrompt: "Analisis peluang bisnis, beri output dalam format JSON dengan field: reasoning_summary (max 100 kata), score (0-100), confidence (0-100), insight (array of string, max 5), strategy (array of string, max 5), risk (array of string, max 5), recommendation (string, max 150 kata), dan demand, competition, monetization, virality, sustainability, scalability, timing, attention, execution, longterm (semua 0-100).",
        temperature: 0.5,
        maxTokens: 1300,
        fewShotExamples: []
    };
}

if (typeof window !== 'undefined') {
    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.getAgentConfig = getAgentConfig;
    window.getAgentConfig = getAgentConfig;
}
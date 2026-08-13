import { CONFIG } from '../js/config.js';
import { loadPrompt as loadPromptShared } from './prompt-loader.js';

export const AGENTS_CONFIG = {};

async function loadPrompt(agentName) {
    return loadPromptShared(agentName, { replaceYear: true });
}

export async function extendBisnisAgents() {
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
        AGENTS_CONFIG[key] = value;
    }

    if (CONFIG.AGENTS) {
        for (const agent of Object.keys(bisnisAgents)) {
            if (!CONFIG.AGENTS.includes(agent)) {
                CONFIG.AGENTS.push(agent);
            }
        }
    }

    const AGENTS_BISNIS = Object.keys(bisnisAgents);

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
    window.KESEMPATAN.Agents.Bisnis = AGENTS_BISNIS;
    window.KESEMPATAN.Agents.Config = AGENTS_CONFIG;

    if (window.KESEMPATAN?.AgentRenderer?.renderAllAgents) {
        window.KESEMPATAN.AgentRenderer.renderAllAgents();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extendBisnisAgents());
} else {
    extendBisnisAgents();
}

export function getAgentConfig(agentName) {
    return AGENTS_CONFIG[agentName] || {
        name: agentName,
        role: "General AI",
        systemPrompt: "Analisis peluang bisnis, beri output dalam format JSON dengan field: reasoning_summary (max 100 kata), score (0-100), confidence (0-100), insight (array of string, max 5), strategy (array of string, max 5), risk (array of string, max 5), recommendation (string, max 150 kata), dan demand, competition, monetization, virality, sustainability, scalability, timing, attention, execution, longterm (semua 0-100).",
        temperature: 0.5,
        maxTokens: 1300,
        fewShotExamples: []
    };
}

window.KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN.getAgentConfig = getAgentConfig;

// Bridge for consumers not yet migrated to import { AGENTS_CONFIG, getAgentConfig } from '../agents/agents-config.js'.
window.AGENTS_CONFIG = AGENTS_CONFIG;
window.getAgentConfig = getAgentConfig;
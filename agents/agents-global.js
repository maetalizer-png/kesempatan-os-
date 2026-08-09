(function() {
"use strict";

if (typeof window.extendGlobalAgents === 'undefined') {
    window.extendGlobalAgents = async function() {
        async function loadPrompt(agentName) {
            try {
                const response = await fetch(`prompts/${agentName}.txt`);
                if (response.ok) return await response.text();
            } catch (error) { console.warn('[AgentsConfig] loadPrompt fetch failed:', error.message); }
            return `Anda adalah ahli ${agentName}. Analisis berdasarkan bidang keahlian Anda. Output dalam format JSON.`;
        }

        const globalAgents = {
            StartupFounder: { name: "startupfounder", role: "Startup Founder & Entrepreneur", systemPrompt: await loadPrompt('StartupFounder'), temperature: 0.7, maxTokens: 1500, fewShotExamples: [] },
            VentureCapitalist: { name: "venturecapitalist", role: "Venture Capitalist", systemPrompt: await loadPrompt('VentureCapitalist'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            RiskManager: { name: "riskmanager", role: "Risk Manager", systemPrompt: await loadPrompt('RiskManager'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            FutureForecaster: { name: "futureforecaster", role: "Future Forecaster", systemPrompt: await loadPrompt('FutureForecaster'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            GenZAnalyst: { name: "genzanalyst", role: "Gen Z Analyst", systemPrompt: await loadPrompt('GenZAnalyst'), temperature: 0.6, maxTokens: 1500, fewShotExamples: [] },
            BehavioralEconomist: { name: "behavioraleconomist", role: "Behavioral Economist", systemPrompt: await loadPrompt('BehavioralEconomist'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            ConsumerBehavior: { name: "consumerbehavior", role: "Consumer Behavior Analyst", systemPrompt: await loadPrompt('ConsumerBehavior'), temperature: 0.6, maxTokens: 1500, fewShotExamples: [] },
            FinancialPlanner: { name: "financialplanner", role: "Financial Planner", systemPrompt: await loadPrompt('FinancialPlanner'), temperature: 0.4, maxTokens: 1500, fewShotExamples: [] },
            DevilsAdvocate: { name: "devilsadvocate", role: "Devil's Advocate", systemPrompt: await loadPrompt('DevilsAdvocate'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
            SundanyaAsep: { name: "sundanyaasep", role: "Pengusaha Sunda", systemPrompt: await loadPrompt('SundanyaAsep'), temperature: 0.7, maxTokens: 1500, fewShotExamples: [] }
        };

        if (typeof window.AGENTS_CONFIG !== 'undefined') {
            for (const [key, value] of Object.entries(globalAgents)) {
                if (!window.AGENTS_CONFIG[key]) window.AGENTS_CONFIG[key] = value;
            }
        }

        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.AGENTS) {
            for (const agent of Object.keys(globalAgents)) {
                if (!window.CONFIG.AGENTS.includes(agent)) window.CONFIG.AGENTS.push(agent);
            }
        }

        window.AGENTS_GLOBAL = Object.keys(globalAgents);

        window.KESEMPATAN = window.KESEMPATAN || {};
        window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
        window.KESEMPATAN.Agents.Global = window.AGENTS_GLOBAL;

        if (window.KESEMPATAN?.AgentRenderer?.renderAllAgents) window.KESEMPATAN.AgentRenderer.renderAllAgents();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.extendGlobalAgents());
    } else {
        window.extendGlobalAgents();
    }
}
})();
import { CONFIG } from '../js/core/config.js';
import { AGENTS_CONFIG } from './agents-config.js';
import { loadPrompt } from './prompt-loader.js';

export async function extendPoliticsAgents() {

    const politicsAgents = {
        PolitikDalamNegeri: { name: "PolitikDalamNegeri", role: "Profesor Politik Dalam Negeri", systemPrompt: await loadPrompt('politikdalamnegeri'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
        HubunganInternasional: { name: "HubunganInternasional", role: "Profesor Hubungan Internasional", systemPrompt: await loadPrompt('hubunganinternasional'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
        KebijakanPublik: { name: "KebijakanPublik", role: "Profesor Kebijakan Publik", systemPrompt: await loadPrompt('kebijakanpublik'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
        Geopolitik: { name: "Geopolitik", role: "Profesor Geopolitik", systemPrompt: await loadPrompt('geopolitik'), temperature: 0.5, maxTokens: 1500, fewShotExamples: [] },
        KomunikasiPolitik: { name: "KomunikasiPolitik", role: "Profesor Komunikasi Politik", systemPrompt: await loadPrompt('komunikasipolitik'), temperature: 0.6, maxTokens: 1500, fewShotExamples: [] }
    };

    for (const [key, value] of Object.entries(politicsAgents)) {
        if (!AGENTS_CONFIG[key]) AGENTS_CONFIG[key] = value;
    }

    if (CONFIG.AGENTS) {
        for (const agent of Object.keys(politicsAgents)) {
            if (!CONFIG.AGENTS.includes(agent)) CONFIG.AGENTS.push(agent);
        }
    }

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
    window.KESEMPATAN.Agents.Politics = Object.keys(politicsAgents);

    if (window.KESEMPATAN?.AgentRenderer?.renderAllAgents) window.KESEMPATAN.AgentRenderer.renderAllAgents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extendPoliticsAgents());
} else {
    extendPoliticsAgents();
}
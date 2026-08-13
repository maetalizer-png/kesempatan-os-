import { CONFIG } from '../js/config.js';
import { AGENTS_CONFIG } from './agents-config.js';
import { loadPrompt } from './prompt-loader.js';

export async function extendGeneralAgents() {

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

    for (const [key, value] of Object.entries(generalAgents)) {
        if (!AGENTS_CONFIG[key]) AGENTS_CONFIG[key] = value;
    }

    if (CONFIG.AGENTS) {
        for (const agent of Object.keys(generalAgents)) {
            if (!CONFIG.AGENTS.includes(agent)) CONFIG.AGENTS.push(agent);
        }
    }

    window.KESEMPATAN = window.KESEMPATAN || {};
    window.KESEMPATAN.Agents = window.KESEMPATAN.Agents || {};
    window.KESEMPATAN.Agents.General = Object.keys(generalAgents);

    if (window.KESEMPATAN?.AgentRenderer?.renderAllAgents) window.KESEMPATAN.AgentRenderer.renderAllAgents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extendGeneralAgents());
} else {
    extendGeneralAgents();
}
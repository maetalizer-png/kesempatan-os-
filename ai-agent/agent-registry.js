

import { AGENTS_CONFIG, getAgentConfig } from '../agents/agents-config.js';
import { WorkersConfig } from '../features/kesworker/workers-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getAnalysisAgent(name) {
    if (!AGENTS_CONFIG[name]) return null;
    const cfg = getAgentConfig(name);
    return { pool: 'analysis-agent', id: name, name: cfg.name || name, role: cfg.role || '', config: cfg };
}

function listAnalysisAgents() {
    return Object.keys(AGENTS_CONFIG).map(function(name) {
        return getAnalysisAgent(name);
    });
}

function getWorker(id) {
    const worker = WorkersConfig.AI_WORKERS_LIST.find(function(w) { return w.id === id; });
    if (!worker) return null;
    return { pool: 'kesworker', id: worker.id, name: worker.name, category: worker.category, priority: worker.priority, config: worker };
}

function listWorkers(category) {
    const list = WorkersConfig.AI_WORKERS_LIST;
    const filtered = category ? list.filter(function(w) { return w.category === category; }) : list;
    return filtered.map(function(w) {
        return { pool: 'kesworker', id: w.id, name: w.name, category: w.category, priority: w.priority, config: w };
    });
}

function listWorkerCategories() {
    const seen = {};
    WorkersConfig.AI_WORKERS_LIST.forEach(function(w) { seen[w.category] = true; });
    return Object.keys(seen);
}






function findAgent(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    const results = [];
    listAnalysisAgents().forEach(function(a) {
        const hay = (a.name + ' ' + a.role).toLowerCase();
        if (hay.includes(q)) results.push(a);
    });
    listWorkers().forEach(function(w) {
        const hay = (w.name + ' ' + w.category).toLowerCase();
        if (hay.includes(q)) results.push(w);
    });
    return results;
}

export const AgentRegistry = Object.freeze({
    getAnalysisAgent: getAnalysisAgent,
    listAnalysisAgents: listAnalysisAgents,
    getWorker: getWorker,
    listWorkers: listWorkers,
    listWorkerCategories: listWorkerCategories,
    findAgent: findAgent
});

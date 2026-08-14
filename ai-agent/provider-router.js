

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getBridge() {
    return KESEMPATAN.WorkflowLLMBridge || null;
}



async function generate(prompt, meta) {
    const bridge = getBridge();
    if (!bridge || typeof bridge.callGenerativeEngine !== 'function') {
        throw new Error('ProviderRouter: WorkflowLLMBridge belum siap');
    }
    meta = meta || {};
    const agent = meta.agent || 'AIAgent';
    const topic = meta.topic || '';
    const { text, engine } = await bridge.callGenerativeEngine(prompt, agent, topic);
    return { text: text, engine: engine };
}

function isReady() {
    const bridge = getBridge();
    return !!(bridge && typeof bridge.callGenerativeEngine === 'function');
}

function scoreAgentRelevance(agent, query) {
    const q = (query || '').toLowerCase();
    if (!q) return 0;
    const words = q.split(/\s+/).filter(function(w) { return w.length > 3; });
    const hay = ((agent.name || '') + ' ' + (agent.role || '')).toLowerCase();
    let score = 0;
    words.forEach(function(w) { if (hay.includes(w)) score += 1; });
    return score;
}

function selectRelevantAgents(query, allAgents, limit) {
    limit = limit || 13;
    const scored = allAgents.map(function(agent) {
        return Object.assign({}, agent, { relevance: scoreAgentRelevance(agent, query) });
    });
    scored.sort(function(a, b) { return b.relevance - a.relevance; });
    const withMatch = scored.filter(function(agent) { return agent.relevance > 0; });
    return (withMatch.length >= 3 ? withMatch : scored).slice(0, limit);
}

export const ProviderRouter = Object.freeze({
    generate: generate,
    isReady: isReady,
    selectRelevantAgents: selectRelevantAgents
});

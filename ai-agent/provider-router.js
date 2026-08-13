

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

export const ProviderRouter = Object.freeze({
    generate: generate,
    isReady: isReady
});

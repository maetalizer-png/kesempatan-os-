import { AutoLearningUltimate } from './th-core.js';

export function installLearningHooks() {
    if (window.KESEMPATAN.WorkflowEngine && !window.KESEMPATAN.WorkflowEngine.__thresholdHookInstalled) {
        const originalStart = window.KESEMPATAN.WorkflowEngine.start;
        window.KESEMPATAN.WorkflowEngine.start = async function(payload, uploadedContent) {
            const result = await originalStart.call(this, payload, uploadedContent);
            if (window.lastAggregated && window.KESEMPATAN?.HITL) {
                const results = window.KESEMPATAN.HITL.getAllResults ? window.KESEMPATAN.HITL.getAllResults() : [];
                for (let i = 0; i < results.length; i++) {
                    const item = results[i];
                    if (item && item.agent) {
                        await AutoLearningUltimate.recordApproval(item.agent, item.originalResult?.confidence || 70, item.approved !== false);
                    }
                }
            }
            return result;
        };
        window.KESEMPATAN.WorkflowEngine.__thresholdHookInstalled = true;
    }
    if (window.recordFeedback && !window.recordFeedback.__thresholdHookInstalled) {
        const originalRecord = window.recordFeedback;
        const wrapped = async function(agent, message, feedback, topic) {
            const result = await originalRecord.call(this, agent, message, feedback, topic);
            await AutoLearningUltimate.recordApproval(agent, 70, feedback === 'like');
            return result;
        };
        wrapped.__thresholdHookInstalled = true;
        window.recordFeedback = wrapped;
    }
}



import { ToolRegistry } from './tool-registry.js';
import { WorkflowEngineAdapter } from './workflow-engine.js';
import { AgentRegistry } from './agent-registry.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;






function resolveAgentName(name) {
    if (AgentRegistry.getAnalysisAgent(name)) return name;
    const hits = AgentRegistry.findAgent(name).filter(function(hit) { return hit.pool === 'analysis-agent'; });
    return hits.length ? hits[0].id : name;
}

async function executeStep(step, taskContext) {
    taskContext = taskContext || {};
    try {
        let output;
        if (step.kind === 'tool') {
            output = await ToolRegistry.invoke(step.name, step.args || {});
        } else if (step.kind === 'agent') {
            const args = step.args || {};
            output = await WorkflowEngineAdapter.runOneAgent(
                resolveAgentName(step.name),
                args.topic || taskContext.topic,
                args.instruction || taskContext.instruction,
                args.uploadedData
            );
        } else if (step.kind === 'worker') {
            output = await ToolRegistry.invoke('worker.run', { workerId: step.name });
        } else {
            throw new Error('ExecutionEngine: step.kind tidak dikenal: ' + step.kind);
        }
        return { stepId: step.id, success: true, output: output, error: null };
    } catch (e) {
        return { stepId: step.id, success: false, output: null, error: e.message };
    }
}

export const ExecutionEngine = Object.freeze({
    executeStep: executeStep
});

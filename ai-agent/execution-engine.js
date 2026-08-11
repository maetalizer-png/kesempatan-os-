/* ============================================================
   ai-agent/execution-engine.js
   Executes a single plan step by dispatching it to the right
   existing capability and normalizing the result. Does not talk
   to any external system directly — everything goes through
   tool-registry.js, agent-registry.js or workflow-engine.js.

   Step shape (produced by planner.js):
     {
       id: string,
       kind: 'tool' | 'agent' | 'worker',
       name: string,        // tool capability name, agent name, or worker id
       args: object,
       description: string
     }
   ============================================================ */

import { ToolRegistry } from './tool-registry.js';
import { WorkflowEngineAdapter } from './workflow-engine.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

async function executeStep(step, taskContext) {
    taskContext = taskContext || {};
    try {
        let output;
        if (step.kind === 'tool') {
            output = await ToolRegistry.invoke(step.name, step.args || {});
        } else if (step.kind === 'agent') {
            const args = step.args || {};
            output = await WorkflowEngineAdapter.runOneAgent(
                step.name,
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

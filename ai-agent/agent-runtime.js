

import { TaskManager } from './task-manager.js';
import { Planner } from './planner.js';
import { Orchestrator } from './orchestrator.js';
import { MemoryBridge } from './memory-bridge.js';
import { AgentRegistry } from './agent-registry.js';
import { ToolRegistry } from './tool-registry.js';
import { ProviderRouter } from './provider-router.js';
import { ObservationLoop } from './observation-loop.js';
import { ApprovalManager } from './approval-manager.js';
import { ExecutionEngine } from './execution-engine.js';
import { ResultEvaluator } from './result-evaluator.js';
import { WorkflowEngineAdapter } from './workflow-engine.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const MAX_REPLANS = 2;




async function runAgentTask(goal, context, options) {
    context = context || {};
    options = options || {};

    const task = TaskManager.createTask(goal, context, options);
    TaskManager.updateTask(task.id, { status: 'PLANNING' });

    let plan = await Planner.createPlan(goal, context);
    let attempt = 0;
    let outcome = null;

    for (;;) {
        outcome = await Orchestrator.runTask(task, plan, options);
        TaskManager.updateTask(task.id, { stepResults: outcome.stepResults, evaluation: outcome.evaluation });

        if (outcome.evaluation.decision === 'COMPLETE' || attempt >= MAX_REPLANS) break;

        attempt++;
        TaskManager.updateTask(task.id, { status: 'REPLANNING', replanCount: attempt });
        const feedback = goal + '\n\nCatatan: percobaan sebelumnya gagal pada ' + outcome.evaluation.failedCount + ' dari ' + outcome.evaluation.evaluations.length + ' langkah. Buat rencana yang lebih sederhana/berbeda.';
        plan = await Planner.createPlan(feedback, context);
    }

    const finalStatus = outcome.evaluation.decision === 'COMPLETE' ? 'COMPLETED' : 'FAILED';
    TaskManager.updateTask(task.id, { status: finalStatus });

    
    
    try {
        await MemoryBridge.save('AI Agent task: ' + goal, {
            agent: 'AIAgentRuntime',
            summary: goal,
            score: outcome.evaluation.passedCount,
            taskId: task.id,
            status: finalStatus
        });
    } catch (e) {  }

    return TaskManager.getTask(task.id);
}

export const AgentRuntime = Object.freeze({
    runAgentTask: runAgentTask,
    getTask: TaskManager.getTask,
    listTasks: TaskManager.listTasks
});

KESEMPATAN.AIAgent = {
    Runtime: AgentRuntime,
    TaskManager: TaskManager,
    Planner: Planner,
    Orchestrator: Orchestrator,
    ExecutionEngine: ExecutionEngine,
    ResultEvaluator: ResultEvaluator,
    ApprovalManager: ApprovalManager,
    AgentRegistry: AgentRegistry,
    ToolRegistry: ToolRegistry,
    ProviderRouter: ProviderRouter,
    ObservationLoop: ObservationLoop,
    MemoryBridge: MemoryBridge,
    WorkflowEngineAdapter: WorkflowEngineAdapter,
    
    runAgentTask: runAgentTask
};

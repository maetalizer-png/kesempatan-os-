

import { WorkflowEngineAdapter } from './workflow-engine.js';

const DEFAULT_CONFIDENCE_THRESHOLD = 70;
const DEFAULT_AUDITOR = 'Verifier';

function evaluateStep(stepResult) {
    if (!stepResult || !stepResult.success) {
        return { passed: false, reason: (stepResult && stepResult.error) || 'step gagal dieksekusi' };
    }
    const output = stepResult.output;
    if (output && output.notImplemented) {
        return { passed: false, reason: 'capability belum tersedia: ' + (output.reason || '') };
    }
    
    
    if (output && typeof output.confidence === 'number') {
        const threshold = (window.AutoLearning && typeof window.AutoLearning.getRecommendedThreshold === 'function')
            ? window.AutoLearning.getRecommendedThreshold(output.agent)
            : DEFAULT_CONFIDENCE_THRESHOLD;
        const passed = output.confidence >= threshold;
        return { passed: passed, reason: passed ? 'confidence ' + output.confidence + '>=' + threshold : 'confidence ' + output.confidence + '<' + threshold, threshold: threshold };
    }
    return { passed: true, reason: 'ok' };
}

function evaluateTask(stepResults) {
    const evaluations = stepResults.map(evaluateStep);
    const failed = evaluations.filter(function(e) { return !e.passed; });
    return {
        allPassed: failed.length === 0,
        passedCount: evaluations.length - failed.length,
        failedCount: failed.length,
        evaluations: evaluations,
        decision: failed.length === 0 ? 'COMPLETE' : 'REPLAN'
    };
}

async function auditAgentOutput(output, options) {
    options = options || {};
    if (!output || typeof output !== 'object' || !output.agent) {
        return { audited: false, reason: 'output kosong atau tidak punya field agent' };
    }
    const auditorName = options.auditor || DEFAULT_AUDITOR;
    if (auditorName === output.agent) {
        return { audited: false, reason: 'auditor sama dengan agen yang diaudit, dilewati' };
    }
    const instruction = 'Anda bertindak sebagai auditor independen. Agen "' + output.agent +
        '" mengklaim skor ' + (output.score || 0) + ' dengan confidence ' + (output.confidence || 0) +
        '. Ringkasannya: "' + (output.summary || '') + '". ' +
        'Nilai kewajaran klaim ini berdasarkan data yang tersedia (jangan analisis dari nol), lalu berikan skor dan confidence Anda sendiri sebagai penilaian audit.';
    const auditResult = await WorkflowEngineAdapter.runOneAgent(auditorName, options.topic || '', instruction);
    const auditorConfidence = typeof auditResult.confidence === 'number' ? auditResult.confidence : 50;
    const agrees = auditorConfidence >= 50 && (auditResult.score || 0) >= (output.score || 0) * 0.6;
    return {
        audited: true,
        auditor: auditorName,
        target: output.agent,
        agrees: agrees,
        auditorScore: auditResult.score || 0,
        auditorConfidence: auditorConfidence,
        auditorSummary: auditResult.summary || '',
        note: agrees
            ? 'Auditor "' + auditorName + '" menilai hasil "' + output.agent + '" wajar.'
            : 'Auditor "' + auditorName + '" meragukan klaim "' + output.agent + '".'
    };
}

async function evaluateTaskWithAudit(stepResults, options) {
    options = options || {};
    const base = evaluateTask(stepResults);
    const auditable = stepResults
        .filter(function(r) { return r.success && r.output && typeof r.output.confidence === 'number' && r.output.agent; })
        .map(function(r) { return r.output; });
    const audits = [];
    for (let i = 0; i < auditable.length; i++) {
        audits.push(await auditAgentOutput(auditable[i], options));
    }
    const disputed = audits.filter(function(a) { return a.audited && !a.agrees; });
    return Object.assign({}, base, {
        audits: audits,
        disputedCount: disputed.length,
        decision: (base.decision === 'COMPLETE' && disputed.length === 0) ? 'COMPLETE' : (base.decision === 'REPLAN' ? 'REPLAN' : 'DISPUTED')
    });
}

export const ResultEvaluator = Object.freeze({
    evaluateStep: evaluateStep,
    evaluateTask: evaluateTask,
    auditAgentOutput: auditAgentOutput,
    evaluateTaskWithAudit: evaluateTaskWithAudit
});

/* ============================================================
   ai-agent/planner.js
   Turns a natural-language goal into a dynamic step list by
   asking the LLM (via provider-router.js) what capabilities are
   available right now — nothing here hardcodes a fixed workflow
   (spec section 13/15: capability-driven, not a hardcoded path).
   ============================================================ */

import { ProviderRouter } from './provider-router.js';
import { ToolRegistry } from './tool-registry.js';
import { AgentRegistry } from './agent-registry.js';

function describeCapabilities() {
    const tools = ToolRegistry.list().filter(function(t) { return t.available; }).map(function(t) { return t.name; });
    const workerCategories = AgentRegistry.listWorkerCategories();
    return {
        tools: tools,
        workerCategories: workerCategories,
        note: 'Untuk kind="agent", gunakan nama agen analisis yang persis (mis. "RahmadRaharjo", "Analyst", "Researcher"). Untuk kind="worker", gunakan id KESWORKER yang persis dan kategori di atas sebagai panduan (mis. "bitcoin_trader" untuk kategori crypto).'
    };
}

function buildPlanningPrompt(goal, context, capabilities) {
    return [
        'Anda adalah Planner untuk sebuah AI Agent orchestration layer.',
        'Tugas pengguna: "' + goal + '"',
        context && context.topic ? 'Topik: ' + context.topic : '',
        '',
        'Kapabilitas yang TERSEDIA SEKARANG (jangan buat kapabilitas di luar daftar ini):',
        'Tools: ' + capabilities.tools.join(', '),
        'Kategori KESWORKER: ' + capabilities.workerCategories.join(', '),
        capabilities.note,
        '',
        'Buat rencana langkah demi langkah dalam format JSON array (HANYA JSON, tanpa teks lain). Setiap langkah:',
        '{ "id": string, "kind": "tool"|"agent"|"worker", "name": string, "args": object, "description": string }',
        'Maksimal 6 langkah. Pilih hanya langkah yang benar-benar diperlukan untuk tujuan di atas.'
    ].filter(Boolean).join('\n');
}

function parsePlanJSON(text) {
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const first = cleaned.indexOf('[');
    const last = cleaned.lastIndexOf(']');
    if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1);
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error('Planner: hasil bukan array');
    return parsed.filter(function(step) {
        return step && typeof step.kind === 'string' && typeof step.name === 'string';
    }).map(function(step, index) {
        return {
            id: step.id || ('s' + index),
            kind: step.kind,
            name: step.name,
            args: step.args || {},
            description: step.description || ''
        };
    });
}

async function createPlan(goal, context) {
    const capabilities = describeCapabilities();
    const prompt = buildPlanningPrompt(goal, context, capabilities);
    const { text } = await ProviderRouter.generate(prompt, { agent: 'AIAgentPlanner', topic: (context && context.topic) || goal });
    try {
        return parsePlanJSON(text);
    } catch (e) {
        // Degraded but honest fallback: a single-step plan running the goal
        // itself through the default analysis-agent path, rather than
        // silently failing the whole task on a malformed plan response.
        return [{ id: 's0', kind: 'agent', name: 'Analyst', args: { instruction: goal }, description: 'Fallback: plan LLM tidak valid, jalankan analisis langsung.' }];
    }
}

export const Planner = Object.freeze({
    createPlan: createPlan,
    describeCapabilities: describeCapabilities
});

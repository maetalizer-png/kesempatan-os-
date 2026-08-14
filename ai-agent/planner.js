

import { ProviderRouter } from './provider-router.js';
import { ToolRegistry } from './tool-registry.js';
import { AgentRegistry } from './agent-registry.js';






function describeCapabilities(goal) {
    const tools = ToolRegistry.list().filter(function(t) { return t.available; }).map(function(t) { return t.name; });
    const workerCategories = AgentRegistry.listWorkerCategories();
    const relevantAgents = ProviderRouter.selectRelevantAgents(goal || '', AgentRegistry.listAnalysisAgents(), 13);
    const coreAgents = relevantAgents.map(function(a) {
        return a.id + ' (' + a.role + ')' + (a.relevance > 0 ? ' [relevansi:' + a.relevance + ']' : '');
    });
    return {
        tools: tools,
        workerCategories: workerCategories,
        coreAgents: coreAgents,
        note: 'Daftar agen di atas sudah dirangking berdasar relevansi kata kunci terhadap tugas pengguna (bukan urutan statis). Untuk kind="agent", pilih dari daftar ini kalau cocok. Kalau perlu spesialisasi lain di luar daftar itu (mis. bidang tertentu), tetap boleh sebut nama agen yang masuk akal secara role — sistem akan mencarinya di roster lengkap (~200 agen) lewat pencocokan role/kata kunci. Untuk kind="worker", gunakan id KESWORKER yang persis dan kategori di atas sebagai panduan (mis. "bitcoin_trader" untuk kategori crypto).'
    };
}

function buildPlanningPrompt(goal, context, capabilities) {
    return [
        'Anda adalah Planner untuk sebuah AI Agent orchestration layer.',
        'Tugas pengguna: "' + goal + '"',
        context && context.topic ? 'Topik: ' + context.topic : '',
        '',
        'Kapabilitas yang TERSEDIA SEKARANG (jangan buat kapabilitas di luar daftar ini):',
        'Agen analisis (contoh peran umum): ' + capabilities.coreAgents.join(', '),
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
    const capabilities = describeCapabilities(goal);
    const prompt = buildPlanningPrompt(goal, context, capabilities);
    const { text } = await ProviderRouter.generate(prompt, { agent: 'AIAgentPlanner', topic: (context && context.topic) || goal });
    try {
        return parsePlanJSON(text);
    } catch (e) {
        
        
        
        return [{ id: 's0', kind: 'agent', name: 'Analyst', args: { instruction: goal }, description: 'Fallback: plan LLM tidak valid, jalankan analisis langsung.' }];
    }
}

export const Planner = Object.freeze({
    createPlan: createPlan,
    describeCapabilities: describeCapabilities
});

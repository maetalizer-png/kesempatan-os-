import { CONFIG } from '../core/config.js';
import { Utils } from '../core/utils.js';
import { WorkflowState } from './workflow-state.js';
import { WorkflowLLMBridge } from './workflow-llm-bridge.js';
import { ChartManager } from '../dashboard/chart.js';
import { HITL } from '../dashboard/hitl.js';
import { ExportManager } from '../dashboard/export.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const { Logger, RetryEngine, KnowledgeBase, safeParseResponse, escapeHtml, showToast, InternalLogger } = Utils;
const { updateChart } = ChartManager;
const { autoApproveResults, hidePanel: hideHitlPanel } = HITL;
const { setData: setExportData } = ExportManager;





const WORKFLOW_CONFIG = Object.freeze({
    maxRetries: 3,
    
    
    
    
    
    
    
    
    maxBatchSize: 5,
    minBatchSize: 3,
    enablePriorityQueue: true,
    parallelRetries: 3,
    sequentialThreshold: 5,
    autoMode: localStorage.getItem('kes_workflow_auto_mode') !== 'false'
});

let currentUserMode = localStorage.getItem('kes_workflow_mode') || 'auto';
let workflowLock = false;
let workflowAbort = false;
let workflowPaused = false;

KESEMPATAN.Runtime = KESEMPATAN.Runtime || {};
KESEMPATAN.Runtime.WorkflowConfig = WORKFLOW_CONFIG;
KESEMPATAN.Runtime.WorkflowRuntimeFlags = {
    get abort() { return workflowAbort; },
    set abort(v) { workflowAbort = v; },
    get paused() { return workflowPaused; },
    set paused(v) { workflowPaused = v; },
    get userMode() { return currentUserMode; },
    set userMode(v) { currentUserMode = v; }
};

let currentMode = 'sequential';
let lastAggregated = null;
let lastVerifierNote = "";
let lastTopic = "";
let appDatabase = null;
let knowledgeGraph = null;

function getAgentConfig(agent) {
    if (window.getAgentConfig) return window.getAgentConfig(agent);
    return {
        systemPrompt: "Analisis peluang",
        temperature: 0.5,
        maxTokens: 700,
        fewShotExamples: []
    };
}

async function searchVectorMemory(topic) {
    if (window.VectorMemory && window.VectorMemory.search) {
        return await window.VectorMemory.search(topic, { topK: 2 });
    }
    return [];
}

async function saveVectorMemory(text, metadata) {
    if (window.VectorMemory && window.VectorMemory.save) {
        await window.VectorMemory.save(text, metadata);
    }
}

function highlightAgent(agent, active) {
    const badge = document.querySelector(`.agent-badge[data-agent="${agent}"]`);
    if (badge) {
        if (active) badge.classList.add("active");
        else badge.classList.remove("active");
    }
}

function markAgentCompleted(agent) {
    const badge = document.querySelector(`.agent-badge[data-agent="${agent}"]`);
    if (badge && !badge.classList.contains("completed")) {
        badge.classList.add("completed");
        if (!badge.querySelector(".check-mark")) {
            const check = document.createElement("span");
            check.textContent = "✓";
            check.style.color = "#00FFA3";
            badge.appendChild(check);
        }
    }
}

function updateMetricDisplays(result) {
    if (!result.metrics) return;
    for (const [key, val] of Object.entries(result.metrics)) {
        const el = document.getElementById('m-' + key);
        if (el && !el.dataset.finalized) {
            const current = parseInt(el.textContent) || 0;
            const count = (parseInt(el.dataset.count) || 0) + 1;
            const newAvg = Math.round((current * (count - 1) + val) / count);
            el.textContent = newAvg;
            el.dataset.count = count;
        }
    }
}

async function buildPrompt(agent, context, uploadedData) {
    const agentConfig = getAgentConfig(agent);
    const similarMemories = await searchVectorMemory(context.topic);
    let memSection = similarMemories.length ? "\nMemori:\n" + similarMemories.map(function(memory) {
        return '- ' + (memory.metadata.summary?.substring(0, 200) || '') + ' (skor:' + (memory.metadata.score || 0) + ')';
    }).join("\n") : "";
    const worldMatches = WorkflowLLMBridge.searchWorldData(context.topic);
    let worldSection = worldMatches.length ? "\nData referensi:\n" + worldMatches.map(function(w) {
        return '- ' + JSON.stringify(w).substring(0, 200);
    }).join("\n") : "";
    const pastReports = await WorkflowLLMBridge.searchPastReports(context.topic, appDatabase);
    let historySection = pastReports.length ? "\nLaporan serupa sebelumnya:\n" + pastReports.map(function(r) {
        return '- ' + (r.topic || '') + ' (skor:' + (r.score || 0) + ')';
    }).join("\n") : "";
    let dataSection = uploadedData ? `\nData tambahan:\n${uploadedData.substring(0, 1500)}` : "";
    let kgHint = "";
    if (knowledgeGraph) {
        const summary = knowledgeGraph.getGraphSummary();
        if (summary.nodes) {
            kgHint = `\nKnowledge graph: ${summary.nodes} konsep, ${summary.edges} relasi.`;
        }
    }

    // Each context section above is capped individually, but nothing capped
    // their combined total — several long sections at once could still build
    // an oversized prompt with no safety net. Truncate the combined "extra
    // context" blob (not the system prompt / topic / instruction / JSON
    // format footer, which must stay intact) to a character budget, dropping
    // lowest-priority sections first (kg hint, then history, then world data)
    // if it's still too long. ~4 chars/token is the same estimate this
    // codebase already uses for cost tracking (ai-clients.js).
    const CONTEXT_CHAR_BUDGET = 12000;
    let extraContext = dataSection + memSection + worldSection + historySection + kgHint;
    if (extraContext.length > CONTEXT_CHAR_BUDGET) {
        const drop = [
            function() { kgHint = ''; },
            function() { historySection = ''; },
            function() { worldSection = ''; }
        ];
        for (const dropSection of drop) {
            dropSection();
            extraContext = dataSection + memSection + worldSection + historySection + kgHint;
            if (extraContext.length <= CONTEXT_CHAR_BUDGET) break;
        }
        if (extraContext.length > CONTEXT_CHAR_BUDGET) {
            extraContext = extraContext.substring(0, CONTEXT_CHAR_BUDGET);
        }
    }

    let prompt = agentConfig.systemPrompt + "\n\n";
    if (agentConfig.fewShotExamples && agentConfig.fewShotExamples.length > 0) {
        prompt += "Contoh format output yang diharapkan:\n";
        agentConfig.fewShotExamples.forEach(function(ex) {
            prompt += "Input: " + ex.input + "\nOutput: " + JSON.stringify(ex.output, null, 2) + "\n\n";
        });
    }
    prompt += 'Sekarang, analisis topik berikut: "' + context.topic + '".\nInstruksi tambahan: ' + context.instruction + "\n";
    prompt += extraContext + "\n\n";
    prompt += 'Berikan output dalam format JSON (hanya JSON) dengan field: agent, status, reasoning_summary, score, confidence, insight (array), strategy (array), risk (array), recommendation, demand, competition, monetization, virality, sustainability, scalability, timing, attention, execution, longterm.';
    if (typeof window.KESEMPATAN?.ReactionLearning?.getLearningPrompt === 'function') {
        try {
            prompt = window.KESEMPATAN.ReactionLearning.getLearningPrompt(agent, prompt, context.topic);
        } catch (e) {
            InternalLogger.warn('Workflow', 'getLearningPrompt failed, using base prompt: ' + e.message);
        }
    }
    return prompt;
}

async function executeAgentWithRetryCore(agent, context, uploadedData, retryCount, mode) {
    retryCount = retryCount || 0;
    const isParallel = mode === 'parallel';
    const modeLabel = isParallel ? 'PARALLEL' : 'SEQUENTIAL';
    const MAX_RETRIES = isParallel
        ? (WORKFLOW_CONFIG.parallelRetries || 2)
        : WORKFLOW_CONFIG.maxRetries;

    highlightAgent(agent, true);
    const startTime = performance.now();

    if (Logger) {
        Logger.info("AGENT", agent + " mulai (attempt " + (retryCount + 1) + "/" + (MAX_RETRIES + 1) + ") [" + modeLabel + "]");
    }

    try {
        const prompt = await buildPrompt(agent, context, uploadedData);
        // Kunci cache HARUS beda antar mesin — mesin berkualitas beda saling
        // menimpa cache satu sama lain kalau dipukul rata di bawah 1 nama
        // model (bug lama). Nama konsisten tiap kali jawaban BENAR-BENAR
        // datang dari mesin itu. Prediksi di sini (SEBELUM generate) cuma
        // optimasi pembacaan cache — sisi TULIS di bawah selalu pakai engine
        // ASLI yang benar-benar dipakai, jadi prediksi meleset paling apes
        // cuma cache-miss, tidak pernah menyajikan hasil yang salah.
        const ENGINE_CACHE_NAMES = { 'local-v2': 'local-llm-v2', 'local': 'local-llm-50m' };
        const externalModelForCache = CONFIG.DEFAULT_MODEL || 'default';
        function predictEngineCacheName() {
            if (WorkflowLLMBridge.isV2EngineEligible && WorkflowLLMBridge.isV2EngineEligible()) return ENGINE_CACHE_NAMES['local-v2'];
            if (WorkflowLLMBridge.isLocalEngineEligible && WorkflowLLMBridge.isLocalEngineEligible()) return ENGINE_CACHE_NAMES['local'];
            return externalModelForCache;
        }
        let modelForCache = predictEngineCacheName();
        const cached = await WorkflowLLMBridge.tryGetCachedAgentResult(agent, modelForCache, prompt);
        if (cached) {
            if (Logger) {
                Logger.success("AGENT", agent + " selesai (dari CACHE, skor: " + cached.score + ", conf: " + cached.confidence + ") [" + modeLabel + "]");
            }
            highlightAgent(agent, false);
            markAgentCompleted(agent);
            return cached;
        }

        const generatePromise = WorkflowLLMBridge.callGenerativeEngine(prompt, agent, context.topic);
        const { text: raw, engine } = await generatePromise;
        let parsed = safeParseResponse(raw);
        parsed.agent = agent;
        parsed = (KnowledgeBase && KnowledgeBase.enrich) ? KnowledgeBase.enrich(parsed, context.topic) : parsed;

        modelForCache = ENGINE_CACHE_NAMES[engine] || externalModelForCache;
        await WorkflowLLMBridge.cacheAgentResultIfValid(agent, modelForCache, prompt, parsed);
        await saveVectorMemory(agent + ': ' + (parsed.summary || ''), {
            agent: agent,
            summary: parsed.summary,
            score: parsed.score
        });

        if (knowledgeGraph) {
            knowledgeGraph.addNode(agent, "agent", agent);
            knowledgeGraph.addNode(context.topic.slice(0, 30), "topic", context.topic.slice(0, 50));
            knowledgeGraph.addEdge(agent, context.topic.slice(0, 30), "analyzes", parsed.confidence / 100);
        }

        const latency = Math.round(performance.now() - startTime);
        if (Logger) {
            Logger.success("AGENT", agent + " selesai (skor: " + parsed.score + ", conf: " + parsed.confidence + ", " + latency + "ms) [" + modeLabel + "]");
        }

        highlightAgent(agent, false);
        markAgentCompleted(agent);
        return parsed;
    } catch (err) {
        if (Logger) Logger.error(agent, err.message);
        if (retryCount < MAX_RETRIES) {
            if (Logger) {
                Logger.warn("AGENT", agent + " gagal, retry " + (retryCount + 1) + "/" + MAX_RETRIES + "... (" + modeLabel + ")");
            }
            if (showToast) {
                showToast('🔄 ' + agent + ' retry ' + (retryCount + 1) + '/' + MAX_RETRIES + ' (' + modeLabel + ')', 'info');
            }
            await new Promise(function(resolve) {
                setTimeout(resolve, Math.min(15000, 1000 * Math.pow(2, retryCount)) + Math.random() * 500);
            });
            return executeAgentWithRetryCore(agent, context, uploadedData, retryCount + 1, mode);
        }
        highlightAgent(agent, false);
        const fallback = {
            agent: agent,
            status: "failed",
            summary: "Error: " + err.message.substring(0, 100),
            score: 0,
            confidence: 10,
            insight: [],
            strategy: [],
            risk: [],
            recommendation: "",
            reasoning_summary: "",
            demand: 0, competition: 0, monetization: 0, virality: 0,
            sustainability: 0, scalability: 0, timing: 0, attention: 0,
            execution: 0, longterm: 0
        };
        return fallback;
    }
}

async function executeAgentWithRetrySequential(agent, context, uploadedData, retryCount) {
    return executeAgentWithRetryCore(agent, context, uploadedData, retryCount, 'sequential');
}

async function executeAgentWithRetryParallel(agent, context, uploadedData, retryCount) {
    return executeAgentWithRetryCore(agent, context, uploadedData, retryCount, 'parallel');
}

function aggregateResults(approvedItems, topic) {
    let combined = {
        summary: 'Laporan agregasi dari ' + approvedItems.length + ' agen untuk "' + topic + '". ',
        insight: [],
        strategy: [],
        risk: [],
        recommendation: [],
        metrics: {
            demand: 0, competition: 0, monetization: 0, virality: 0,
            sustainability: 0, scalability: 0, timing: 0, attention: 0,
            execution: 0, longterm: 0
        },
        totalWeight: 0
    };

    let validCount = 0;
    let failedCount = 0;
    const failedAgents = [];

    for (let i = 0; i < approvedItems.length; i++) {
        const item = approvedItems[i];
        const r = item.originalResult || item;
        const hasNoMetrics = !r.metrics || Object.values(r.metrics).every(function(v) { return !v; });
        const isFailed = r.status === 'fallback' || r.status === 'failed' || r.status === 'degraded' || (r.score === 0 && hasNoMetrics);

        if (isFailed) {
            failedCount++;
            failedAgents.push(r.agent || 'unknown');
            continue;
        }

        validCount++;
        const w = (r.confidence || 70) / 100;
        combined.totalWeight += w;

        if (r.insight) combined.insight.push.apply(combined.insight, r.insight);
        if (r.strategy) combined.strategy.push.apply(combined.strategy, r.strategy);
        if (r.risk) combined.risk.push.apply(combined.risk, r.risk);
        if (r.recommendation) combined.recommendation.push(r.recommendation);

        for (const metricKey of Object.keys(combined.metrics)) {
            const val = (r.metrics && r.metrics[metricKey] !== undefined) ? r.metrics[metricKey] : (r[metricKey] !== undefined ? r[metricKey] : 50);
            combined.metrics[metricKey] += val * w;
        }
    }

    combined.validCount = validCount;
    combined.failedCount = failedCount;
    combined.failedAgents = failedAgents;

    if (combined.totalWeight === 0) {
        const FALLBACK = (Utils && Utils.FALLBACK_RESPONSE) ? Utils.FALLBACK_RESPONSE : {
            score: 0, summary: '', insight: [], strategy: [], risk: [],
            recommendation: '', confidence: 5, metrics: combined.metrics
        };
        return { ...FALLBACK, metrics: combined.metrics, score: 0, validCount: validCount, failedCount: failedCount, failedAgents: failedAgents };
    }

    for (const metricKey of Object.keys(combined.metrics)) {
        combined.metrics[metricKey] = Math.min(100, Math.round(combined.metrics[metricKey] / combined.totalWeight));
    }

    const STOPWORDS_ID = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan',
        'ini', 'itu', 'akan', 'dapat', 'bisa', 'atau', 'adalah', 'sebagai', 'juga', 'tidak',
        'tersebut', 'oleh', 'dalam', 'secara', 'hingga', 'sudah', 'belum', 'lebih', 'sangat',
        'agar', 'karena', 'jika', 'saat', 'antara', 'per', 'ada', 'tetap', 'maupun', 'serta']);

    const tokenize = function(text) {
        return text.toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, ' ')
            .split(/\s+/)
            .filter(function(w) { return w.length > 2 && !STOPWORDS_ID.has(w); });
    };

    const jaccardSimilarity = function(tokensA, tokensB) {
        const setA = new Set(tokensA);
        const setB = new Set(tokensB);
        if (setA.size === 0 || setB.size === 0) return 0;
        let intersect = 0;
        setA.forEach(function(w) { if (setB.has(w)) intersect++; });
        const union = setA.size + setB.size - intersect;
        return union === 0 ? 0 : intersect / union;
    };

    const countDigits = function(text) {
        const digitMatches = text.match(/\d/g);
        return digitMatches ? digitMatches.length : 0;
    };

    const NEAR_DUP_THRESHOLD = 0.55;
    const unique = function(items) {
        const buckets = [];
        for (let i = 0; i < items.length; i++) {
            const x = items[i];
            if (!x || !x.trim()) continue;
            const trimmed = x.trim();
            const tokens = tokenize(trimmed);
            const digits = countDigits(trimmed);
            let dupIndex = -1;
            for (let j = 0; j < buckets.length; j++) {
                if (jaccardSimilarity(tokens, buckets[j].tokens) >= NEAR_DUP_THRESHOLD) {
                    dupIndex = j;
                    break;
                }
            }
            if (dupIndex === -1) {
                buckets.push({ text: trimmed, tokens: tokens, digits: digits });
            } else if (digits > buckets[dupIndex].digits) {
                buckets[dupIndex] = { text: trimmed, tokens: tokens, digits: digits };
            }
        }
        return buckets.map(function(b) { return b.text; });
    };

    combined.insight = unique(combined.insight).slice(0, 12);
    combined.strategy = unique(combined.strategy).slice(0, 10);
    combined.risk = unique(combined.risk).slice(0, 8);
    combined.recommendation = unique(combined.recommendation)
        .slice(0, 3)
        .map(function(r) { return r.replace(/[.!?]+\s*$/, ''); })
        .join(". ");
    if (combined.recommendation) combined.recommendation += ".";

    let rawScore = Math.round(Object.values(combined.metrics).reduce(function(a, b) { return a + b; }, 0) / 10);
    let finalScore = rawScore;
    combined.score = Math.min(100, Math.max(1, finalScore));
    return combined;
}

function renderReport(agg, note) {
    note = note || "";
    const container = document.getElementById("reportContainer");
    if (!container) return;
    if (agg && !agg.score && agg.failedCount > 0 && agg.validCount === 0) {
        container.innerHTML = '<p class="text-dim">⚠️ Semua agen (' + agg.failedCount + ') gagal menghasilkan analisis yang valid — biasanya terjadi karena output AI lokal tidak sesuai format yang diharapkan. Coba jalankan ulang, pilih agen lain, atau isi API Key provider eksternal di Settings untuk hasil yang lebih stabil.</p>';
        return;
    }
    if (!agg || !agg.score) {
        container.innerHTML = '<p class="text-dim">Belum ada laporan final. Kalau baru saja menjalankan analisis, cek panel review agen di bawah — laporan final muncul setelah hasil tiap agen di-approve.</p>';
        return;
    }
    const warningHtml = (agg.failedCount > 0)
        ? '<div class="kes-report__warning">' + agg.validCount + ' dari ' + (agg.validCount + agg.failedCount) + ' agen berhasil dianalisis (' + agg.failedCount + ' gagal: ' + escapeHtml((agg.failedAgents || []).join(', ')) + ') — skor akhir dihitung HANYA dari agen yang berhasil, tidak ikut menjatuhkan skor.</div>'
        : '';
    let html = `<div class="kes-report">
        <section class="kes-report__section kes-report__section--summary">
            <h3 class="kes-report__title">Ringkasan</h3>
            <div class="kes-report__body">${escapeHtml(agg.summary || 'Tidak ada ringkasan')}</div>
            ${warningHtml}
        </section>
        <section class="kes-report__section kes-report__section--insight">
            <h3 class="kes-report__title">Insight</h3>
            <ul class="kes-report__list">${(agg.insight || []).map(function(i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') || '<li>Tidak ada insight</li>'}</ul>
        </section>
        <section class="kes-report__section kes-report__section--strategy">
            <h3 class="kes-report__title">Strategi</h3>
            <ul class="kes-report__list">${(agg.strategy || []).map(function(s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') || '<li>Tidak ada strategi</li>'}</ul>
        </section>
        <section class="kes-report__section kes-report__section--risk">
            <h3 class="kes-report__title">Risiko</h3>
            <ul class="kes-report__list">${(agg.risk || []).map(function(r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') || '<li>Tidak ada risiko</li>'}</ul>
        </section>
        <section class="kes-report__section kes-report__section--recommendation">
            <h3 class="kes-report__title">Rekomendasi</h3>
            <div class="kes-report__body">${escapeHtml(agg.recommendation || 'Tidak ada rekomendasi')}</div>
        </section>
        <section class="kes-report__section kes-report__section--score">
            <h3 class="kes-report__title">Skor Akhir</h3>
            <div class="kes-report__score-value">${agg.score || 0}<span class="kes-report__score-max">/100</span></div>
        </section>
        <div class="kes-report__note">${escapeHtml(note)}</div>
    </div>`;
    container.innerHTML = html;

    if (window.__lastWorkflowResults && window.__lastWorkflowResults.length > 0) {
        setTimeout(function() {
            HITL.addHITLButtonToReport(window.__lastWorkflowResults);
        }, 500);
    }
}

function finalizeAggregation(itemsOrResults, topic, note, successToast) {
    const plainResults = (itemsOrResults || []).map(function(i) {
        return i.originalResult || i;
    });
    const aggregated = aggregateResults(plainResults, topic);
    window.lastAggregated = aggregated;
    lastAggregated = aggregated;
    lastVerifierNote = note || '';
    renderReport(aggregated, note || '');
    ChartManager.ScoreEngine.updateFromAggregated(aggregated);
    if (aggregated.metrics) updateChart(aggregated.metrics);
    if (appDatabase) appDatabase.saveReport(topic, aggregated.score, aggregated);
    setExportData(aggregated, note || '');
    if (window.KESEMPATAN?.Main?.saveReportToHistory) window.KESEMPATAN.Main.saveReportToHistory(aggregated, topic);
    if (hideHitlPanel) hideHitlPanel();
    if (showToast && successToast) showToast(successToast, 'success');
    return aggregated;
}

document.addEventListener('hitlConfirmed', function(e) {
    const approved = e?.detail?.approved;
    if (!approved || approved.length === 0) {
        if (showToast) showToast('⚠️ Tidak ada agen yang disetujui', 'error');
        return;
    }
    finalizeAggregation(approved, lastTopic, 'Diagregasi ulang setelah review manual (' + approved.length + ' agen)', '✅ Laporan diperbarui dari hasil review');
});

function validateInput(payload) {
    if (!payload || !payload.topic) {
        if (showToast) showToast("❌ Payload tidak valid!", "error");
        return false;
    }
    if (!payload.topic.trim()) {
        if (showToast) showToast("❌ Topik tidak boleh kosong!", "error");
        return false;
    }
    if (payload.topic.length > 500) {
        if (showToast) showToast("⚠️ Topik terlalu panjang (max 500 karakter)", "error");
        return false;
    }
    return true;
}

function forceGenerateReport(results, payload) {
    InternalLogger.warn("LAPORAN", "⚠️ FORCE GENERATE: Memaksa laporan keluar...");
    let allResults = [];
    if (results && results.length > 0) {
        allResults = results.map(function(r) {
            return { agent: r.agent, originalResult: r, approved: true, editedScore: r.score || 50 };
        });
    } else {
        const hitlResults = HITL.getAllResults();
        if (hitlResults && hitlResults.length > 0) allResults = hitlResults;
    }

    if (allResults.length === 0) {
        InternalLogger.error("LAPORAN", "❌ Tidak ada hasil sama sekali!");
        renderReport({
            score: 0, metrics: {},
            summary: 'Tidak ada hasil dari agen. Periksa API Key dan koneksi.',
            insight: ['Pastikan API Key valid', 'Coba dengan agen lebih sedikit', 'Gunakan mode Sequential'],
            strategy: ['Restart aplikasi'],
            risk: ['API Key mungkin expired'],
            recommendation: 'Periksa pengaturan dan coba lagi.'
        }, 'Error: Tidak ada hasil');
        return false;
    }

    const metricKeys = ['demand', 'competition', 'monetization', 'virality',
        'sustainability', 'scalability', 'timing', 'attention', 'execution', 'longterm'];
    const metrics = {};
    let hasMetrics = false;
    for (const key of metricKeys) {
        const el = document.getElementById('m-' + key);
        const val = parseInt(el?.textContent) || 0;
        metrics[key] = val;
        if (val > 0) hasMetrics = true;
    }

    let finalScore = 0;
    if (hasMetrics) {
        finalScore = Math.round(Object.values(metrics).reduce(function(a, b) { return a + b; }, 0) / 10);
    } else {
        const scores = allResults.map(function(r) {
            return r.originalResult?.score || r.editedScore || 0;
        });
        const validScores = scores.filter(function(s) { return s > 0; });
        if (validScores.length > 0) {
            finalScore = Math.round(validScores.reduce(function(a, b) { return a + b; }, 0) / validScores.length);
        } else {
            finalScore = 50;
        }
    }

    const cleanTopic = (payload?.topic || 'Opportunity').trim().replace(/^["']+|["']+$/g, '');
    const aggregated = {
        score: finalScore,
        metrics: metrics,
        summary: 'Laporan intelijen dari ' + allResults.length + ' agen untuk "' + cleanTopic + '"',
        insight: allResults.slice(0, 5).map(function(r) {
            return r.originalResult?.insight?.[0] ||
                r.originalResult?.summary?.substring(0, 60) ||
                'Analisis dari ' + r.agent;
        }),
        strategy: ['Eksekusi bertahap dengan validasi', 'Gunakan data tambahan', 'Konsultasikan dengan tim'],
        risk: ['Data mungkin belum lengkap', 'Perlu verifikasi manual'],
        recommendation: 'Lanjutkan dengan analisis lebih mendalam dan validasi pasar.'
    };

    window.lastAggregated = aggregated;
    window.lastVerifierNote = 'Laporan dipaksa keluar (force generate)';
    renderReport(aggregated, 'Laporan berhasil digenerate! (' + allResults.length + ' agen)');
    ChartManager.ScoreEngine.updateFromAggregated(aggregated);
    if (aggregated.metrics) updateChart(aggregated.metrics);
    setExportData(aggregated, 'Force generate');
    if (window.KESEMPATAN?.Main?.saveReportToHistory) {
        window.KESEMPATAN.Main.saveReportToHistory(aggregated, payload?.topic || 'Opportunity');
    }
    try {
        localStorage.setItem('kes_last_aggregated', JSON.stringify(aggregated));
    } catch (e) {
        InternalLogger.warn('Workflow', 'Save last aggregated failed: ' + e.message);
    }
    hideHitlPanel();
    if (showToast) showToast('📊 Laporan siap! Skor: ' + finalScore + '/100', 'success');

    const progressSpan = document.getElementById('agentProgress');
    const progressFill = document.getElementById('progressFill');
    if (progressSpan) progressSpan.textContent = allResults.length + '/' + allResults.length;
    if (progressFill) progressFill.style.width = '100%';

    window.__lastWorkflowResults = results;
    setTimeout(function() {
        HITL.addHITLButtonToReport(results);
    }, 600);

    InternalLogger.info("LAPORAN", "✅ Laporan berhasil digenerate! Skor: " + finalScore);
    return true;
}

export const WorkflowEngine = {
    async start(payload, uploadedContent) {
        if (workflowLock) {
            if (showToast) showToast("Workflow sedang berjalan", "error");
            return;
        }
        if (!validateInput(payload)) return;
        lastTopic = payload.topic;

        await WorkflowLLMBridge.ensureKesempatanLLMReady();

        const apiKey = document.getElementById('apiKeyInput')?.value;
        const kesempatanLLMReady = window.KesempatanLLM && window.KesempatanLLM.isReady && window.KesempatanLLM.isReady();

        if (!kesempatanLLMReady && (!apiKey || apiKey.length < 10)) {
            if (showToast) showToast("❌ Masukkan API Key terlebih dahulu!", "error");
            return;
        }

        if (!navigator.onLine) {
            if (showToast) showToast("🌐 Tidak ada koneksi internet!", "error");
            return;
        }

        let agents = Array.from(document.querySelectorAll('.agent-checkbox:checked')).map(function(cb) {
            return cb.dataset.agent;
        });

        if (agents.length === 0) {
            if (showToast) showToast("⚠️ Pilih minimal 1 agen!", "error");
            return;
        }

        agents = KESEMPATAN.WorkflowParallel.prioritySortAgents(agents);
        currentMode = KESEMPATAN.WorkflowParallel.selectMode(agents.length);
        const isParallel = currentMode === 'parallel';
        const batchSize = isParallel ? KESEMPATAN.WorkflowParallel.getOptimalBatchSize() : 1;

        if (Logger) {
            Logger.system('📋 Workflow — Mode: ' + currentMode.toUpperCase() + ' | ' + agents.length + ' agen | Batch: ' + batchSize);
        }
        if (showToast) {
            showToast((isParallel ? '⚡' : '🐢') + ' Mode ' + currentMode.toUpperCase() + ' (' + agents.length + ' agen)', "info");
        }

        const savedState = WorkflowState.loadWorkflowState();
        let results = [];
        let completed = 0;

        if (savedState && savedState.topic === payload.topic && savedState.mode === currentMode && WorkflowState.showResumeDialog(savedState)) {
            if (Logger) {
                Logger.system('Resume workflow dari ' + savedState.completedCount + ' agen yang sudah selesai');
            }
            results = savedState.results || [];
            completed = savedState.completedCount;
            const remainingAgents = agents.filter(function(a) {
                return !savedState.completedAgents?.includes(a);
            });
            agents = remainingAgents;
            WorkflowState.clearWorkflowState();
            if (showToast) showToast('📂 Lanjut dari ' + completed + ' agen', "info");

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                markAgentCompleted(result.agent);
                updateMetricDisplays(result);
            }
        }

        workflowLock = true;
        workflowAbort = false;
        workflowPaused = false;

        const totalAgents = agents.length + completed;

        document.querySelectorAll('.agent-badge').forEach(function(badge) {
            if (!badge.classList.contains("completed")) {
                badge.classList.remove("active");
            }
        });

        const loadingDiv = document.getElementById("loadingIndicator");
        const progressSpan = document.getElementById("agentProgress");
        const progressFill = document.getElementById("progressFill");
        const totalSpan = document.getElementById("totalAgents");

        if (loadingDiv) loadingDiv.style.display = "block";
        if (totalSpan) totalSpan.textContent = totalAgents;
        if (progressSpan) progressSpan.textContent = completed + '/' + totalAgents;
        if (progressFill) progressFill.style.width = (completed / totalAgents * 100) + '%';

        KESEMPATAN.WorkflowParallel.startTimer();
        KESEMPATAN.WorkflowParallel.mulaiEstimasiWaktu(totalAgents, currentMode);
        WorkflowState.addWorkflowControls(currentMode);

        const logBox = document.getElementById("systemLog");
        let finalResults = [];

        if (isParallel) {
            if (Logger) {
                Logger.system('⚡ PARALLEL MODE: ' + agents.length + ' agen, batch ' + batchSize + 'x, retry ' + WORKFLOW_CONFIG.parallelRetries + 'x');
            }
            const totalBatches = Math.ceil(agents.length / batchSize);

            for (let i = 0; i < agents.length; i += batchSize) {
                while (workflowPaused && !workflowAbort) {
                    await new Promise(function(resolve) { setTimeout(resolve, 500); });
                }
                if (workflowAbort) break;

                const batch = agents.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;

                if (Logger) {
                    Logger.system('⚡ Batch ' + batchNum + '/' + totalBatches + ': ' + batch.join(', ') + ' (with retry)');
                }

                const batchResults = await Promise.all(
                    batch.map(function(agent) {
                        return executeAgentWithRetryParallel(agent, payload, uploadedContent);
                    })
                );

                finalResults.push.apply(finalResults, batchResults);
                results.push.apply(results, batchResults);
                completed += batchResults.length;

                if (progressSpan) progressSpan.textContent = completed + '/' + totalAgents;
                if (progressFill) progressFill.style.width = (completed / totalAgents * 100) + '%';

                for (let j = 0; j < batchResults.length; j++) {
                    const result = batchResults[j];
                    if (logBox) {
                        const line = document.createElement("div");
                        line.style.marginBottom = "8px";
                        line.style.borderLeft = "3px solid #FFD700";
                        line.style.paddingLeft = "10px";
                        line.style.fontSize = "12px";
                        line.innerHTML = '<span style="color:#FFD700;">⚡ ' + result.agent + '</span> selesai | Skor: ' + result.score + ' | Conf: ' + result.confidence + '%';
                        logBox.appendChild(line);
                        logBox.scrollTop = logBox.scrollHeight;
                    }
                    markAgentCompleted(result.agent);
                    updateMetricDisplays(result);
                }

                WorkflowState.saveWorkflowState({
                    completedCount: completed,
                    totalAgents: totalAgents,
                    results: results,
                    topic: payload.topic,
                    instruction: payload.instruction,
                    completedAgents: results.map(function(r) { return r.agent; })
                }, currentMode);

                if (i + batchSize < agents.length && !workflowPaused && !workflowAbort) {
                    await new Promise(function(resolve) { setTimeout(resolve, 500); });
                }
            }
        } else {
            if (Logger) {
                Logger.system('🐢 SEQUENTIAL MODE: ' + agents.length + ' agen, retry ' + WORKFLOW_CONFIG.maxRetries + 'x');
            }

            for (let i = 0; i < agents.length; i++) {
                while (workflowPaused && !workflowAbort) {
                    await new Promise(function(resolve) { setTimeout(resolve, 500); });
                }
                if (workflowAbort) break;

                const agent = agents[i];
                const result = await executeAgentWithRetrySequential(agent, payload, uploadedContent);

                finalResults.push(result);
                results.push(result);
                completed++;

                if (progressSpan) progressSpan.textContent = completed + '/' + totalAgents;
                if (progressFill) progressFill.style.width = (completed / totalAgents * 100) + '%';

                if (logBox) {
                    const line = document.createElement("div");
                    line.style.marginBottom = "8px";
                    line.style.borderLeft = "3px solid #00FFA3";
                    line.style.paddingLeft = "10px";
                    line.style.fontSize = "12px";
                    line.innerHTML = '<span style="color:#00FFA3;">🐢 ' + agent + '</span> selesai | Skor: ' + result.score + ' | Conf: ' + result.confidence + '%';
                    logBox.appendChild(line);
                    logBox.scrollTop = logBox.scrollHeight;
                }

                markAgentCompleted(agent);
                updateMetricDisplays(result);

                WorkflowState.saveWorkflowState({
                    completedCount: completed,
                    totalAgents: totalAgents,
                    results: results,
                    topic: payload.topic,
                    instruction: payload.instruction,
                    completedAgents: results.map(function(r) { return r.agent; })
                }, currentMode);

                if (i < agents.length - 1 && !workflowPaused && !workflowAbort) {
                    const delay = KESEMPATAN.WorkflowParallel.getRateLimit(agent);
                    await new Promise(function(resolve) { setTimeout(resolve, delay); });
                }
            }
        }

        const totalTime = KESEMPATAN.WorkflowParallel.stopTimer(currentMode);
        KESEMPATAN.WorkflowParallel.hentikanEstimasiWaktu(currentMode);
        WorkflowState.removeWorkflowControls();

        if (loadingDiv) loadingDiv.style.display = "none";

        if (workflowAbort) {
            WorkflowState.clearWorkflowState();
            workflowLock = false;
            if (showToast) showToast("⏹️ Workflow dihentikan", "info");
            return;
        }

        WorkflowState.clearWorkflowState();

        if (Logger) {
            Logger.system('✅ Workflow selesai dalam ' + totalTime.toFixed(1) + ' detik (' + currentMode + ')');
        }
        if (showToast) {
            showToast('✅ Selesai! ' + totalTime.toFixed(1) + ' detik (' + currentMode.toUpperCase() + ')', "success");
        }

        WorkflowState.saveAnalytics({
            mode: currentMode,
            score: results.reduce(function(s, r) { return s + (r.score || 0); }, 0) / results.length,
            time: totalTime,
            agents: results.length,
            topic: payload.topic
        });

        window.__lastWorkflowResults = results;

        const autonomyMode =
            document.getElementById("autonomyMode")?.value ||
            document.getElementById("autonomyModeSidebar")?.value ||
            localStorage.getItem("kes_autonomy_mode") ||
            "plan";

        let hasAggregated = false;

        if (autonomyMode === 'act') {
            const autoApproved = autoApproveResults ? autoApproveResults(results, 'act') : null;
            if (!autoApproved || autoApproved.filter(function(item) { return item.approved; }).length === 0) {
                if (Logger) {
                    Logger.error("Workflow", "Tidak ada agen memenuhi threshold, fallback ke laporan + review manual");
                }
                workflowLock = false;
                setTimeout(function() {
                    if (!window.lastAggregated) forceGenerateReport(results, payload);
                    workflowLock = false;
                }, 35000);
                return;
            }

            const approvedItems = autoApproved.filter(function(item) { return item.approved; });
            finalizeAggregation(
                approvedItems,
                payload.topic,
                currentMode.toUpperCase() + ' mode | ' + totalTime.toFixed(1) + ' detik | ' + results.length + ' agen [AUTO-APPROVED via ACT mode]',
                '✅ ACT mode: ' + approvedItems.length + ' agen auto-approved (' + currentMode + ')'
            );
            hasAggregated = true;
            workflowLock = false;

            setTimeout(function() {
                if (!window.lastAggregated) forceGenerateReport(results, payload);
            }, 2000);
        } else if (autonomyMode === 'observe') {
            if (showToast) showToast("Mode Observe: tidak ada agregasi", "info");
            workflowLock = false;
        } else {
            if (window.AutoLearning) {
                for (let i = 0; i < results.length; i++) {
                    const r = results[i];
                    await window.AutoLearning.recordApproval(r.agent, r.confidence, true);
                }
            }

            finalizeAggregation(
                results,
                payload.topic,
                currentMode.toUpperCase() + ' mode | ' + totalTime.toFixed(1) + ' detik | ' + results.length + ' agen',
                '✅ Laporan selesai — review & approve tersedia di panel di bawah laporan'
            );
            hasAggregated = true;
            workflowLock = false;
        }
    },

    setMode: function(mode) {
        if (mode === 'auto' || mode === 'sequential' || mode === 'parallel') {
            currentUserMode = mode;
            localStorage.setItem('kes_workflow_mode', mode);
            if (showToast) showToast('🔄 Mode: ' + mode.toUpperCase(), "info");
            return true;
        }
        return false;
    },

    getMode: function() { return currentUserMode; },
    getCurrentMode: function() { return currentMode; },
    isRunning: function() { return workflowLock; },
    isPaused: function() { return workflowPaused; },

    resume: function() {
        if (workflowPaused) {
            workflowPaused = false;
            const btn = document.getElementById('workflowPauseBtn');
            if (btn) {
                btn.textContent = '⏸️ PAUSE';
                btn.style.background = '#FFD700';
            }
            const status = document.getElementById('workflowStatus');
            if (status) {
                status.textContent = '● RUNNING';
                status.style.color = '#00FFA3';
            }
            if (showToast) showToast("▶️ Workflow dilanjutkan", "info");
            return true;
        }
        return false;
    },

    stop: function() {
        if (workflowLock) {
            workflowAbort = true;
            workflowPaused = false;
            if (showToast) showToast("⏹️ Workflow dihentikan", "info");
            return true;
        }
        return false;
    },

    setDatabase: function(db) { appDatabase = db; },
    setKnowledgeGraph: function(kg) { knowledgeGraph = kg; },

    
    
    
    
    
    
    
    async runSingleAgent(agentName, topic, instruction, uploadedData) {
        const context = { topic: topic, instruction: instruction || 'Analisis peluang dan berikan rekomendasi.' };
        return executeAgentWithRetrySequential(agentName, context, uploadedData || null, 0);
    },

    
    
    
    aggregateResults: aggregateResults
};

KESEMPATAN.WorkflowEngine = WorkflowEngine;

InternalLogger.info('Workflow', 'Workflow engine loaded');
InternalLogger.info('Workflow', 'HITL panel siap');

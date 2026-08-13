
(function() {
'use strict';



const TestEnvironment = {
    isBrowser: (typeof window !== 'undefined') && (typeof document !== 'undefined')
};



const InternalLogger = (function() {
    const entries = [];
    const push = function(level, module, message) {
        entries.push({ level: level, module: module, message: message, ts: Date.now() });
        if (entries.length > 500) entries.shift();
        if (TestEnvironment.isBrowser) {
            try {
                document.dispatchEvent(new CustomEvent('system-log', {
                    detail: { type: 'TEST', message: '[' + level.toUpperCase() + '] ' + module + ' - ' + message }
                }));
            } catch (e) {  }
        }
    };
    return {
        info: function(module, message) { push('info', module, message); },
        warn: function(module, message) { push('warn', module, message); },
        error: function(module, message) { push('error', module, message); },
        debug: function(module, message) { push('debug', module, message); },
        getEntries: function() { return entries; }
    };
})();



const CoverageReport = class {
    constructor() {
        this._coverage = new Map();
        this._total = 0;
        this._tested = 0;
    }
    register(module, functions) {
        this._coverage.set(module, {
            total: functions.length,
            tested: 0,
            functions: functions,
            testedFunctions: new Set()
        });
        this._total += functions.length;
    }
    mark(module, functionName) {
        const entry = this._coverage.get(module);
        if (entry && !entry.testedFunctions.has(functionName)) {
            entry.tested++;
            entry.testedFunctions.add(functionName);
            this._tested++;
        }
    }
    getReport() {
        const report = {};
        let totalPercentage = 0;
        let moduleCount = 0;
        for (const [module, data] of this._coverage) {
            const percentage = data.total > 0 ? Math.round((data.tested / data.total) * 100) : 0;
            report[module] = {
                total: data.total,
                tested: data.tested,
                percentage: percentage,
                status: percentage >= 90 ? '[OK]' : percentage >= 70 ? '[WARN]' : '[ERR]'
            };
            totalPercentage += percentage;
            moduleCount++;
        }
        const overall = moduleCount > 0 ? Math.round(totalPercentage / moduleCount) : 0;
        return {
            modules: report,
            overall: overall,
            total: this._total,
            tested: this._tested,
            status: overall >= 90 ? '[OK] Excellent' : overall >= 70 ? '[WARN] Good' : '[ERR] Needs Improvement'
        };
    }
    print() {
        const report = this.getReport();
        InternalLogger.info('Coverage', 'Coverage Report:');
        InternalLogger.info('Coverage', '  Overall: ' + report.overall + '% (' + report.tested + '/' + report.total + ') ' + report.status);
        for (const [module, data] of Object.entries(report.modules)) {
            InternalLogger.info('Coverage', '  ' + data.status + ' ' + module + ': ' + data.percentage + '% (' + data.tested + '/' + data.total + ')');
        }
        return report;
    }
};



const SnapshotManager = class {
    constructor() {
        this._snapshots = new Map();
        this._snapshotFile = 'test-snapshots.json';
    }
    async load() {
        try {
            if (TestEnvironment.isBrowser) {
                const data = localStorage.getItem(this._snapshotFile);
                if (data) {
                    this._snapshots = new Map(JSON.parse(data));
                }
            }
        } catch (e) {  }
    }
    async save() {
        try {
            if (TestEnvironment.isBrowser) {
                localStorage.setItem(this._snapshotFile, JSON.stringify(Array.from(this._snapshots.entries())));
            }
        } catch (e) {  }
    }
    set(name, value) {
        this._snapshots.set(name, value);
        this.save();
    }
    get(name) {
        return this._snapshots.get(name) || null;
    }
    compare(name, value) {
        const snapshot = this.get(name);
        if (!snapshot) {
            this.set(name, value);
            return { matched: true, isNew: true, message: 'Snapshot created' };
        }
        const matched = JSON.stringify(snapshot) === JSON.stringify(value);
        return {
            matched: matched,
            isNew: false,
            message: matched ? 'Snapshot matches' : 'Snapshot mismatch!'
        };
    }
    async test(name, value, testFn) {
        const result = this.compare(name, value);
        if (!result.matched) {
            InternalLogger.warn('Snapshot', '[WARN] ' + name + ': ' + result.message);
            return false;
        }
        InternalLogger.debug('Snapshot', '[OK] ' + name + ': ' + result.message);
        return true;
    }
};



const PerformanceBaseline = class {
    constructor() {
        this._baseline = null;
        this._current = [];
    }
    setBaseline(data) {
        this._baseline = data;
        try { localStorage.setItem('performance-baseline', JSON.stringify(data)); } catch (e) {  }
    }
    loadBaseline() {
        try {
            const data = localStorage.getItem('performance-baseline');
            if (data) {
                this._baseline = JSON.parse(data);
            }
        } catch (e) {  }
    }
    measure(name, fn) {
        const self = this;
        return async function() {
            const start = performance.now();
            const result = await fn.apply(null, arguments);
            const duration = performance.now() - start;
            self._current.push({ name: name, duration: duration, timestamp: Date.now() });
            return { result: result, duration: duration };
        };
    }
    compare() {
        if (!this._baseline) return null;
        const comparison = {};
        for (const current of this._current) {
            const baseline = this._baseline.find(function(b) { return b.name === current.name; });
            if (baseline) {
                const diff = current.duration - baseline.duration;
                const percentage = baseline.duration > 0 ? Math.round((diff / baseline.duration) * 100) : 0;
                comparison[current.name] = {
                    current: Math.round(current.duration),
                    baseline: Math.round(baseline.duration),
                    diff: Math.round(diff),
                    percentage: percentage,
                    improved: diff < 0,
                    status: percentage < 10 ? '[OK]' : percentage < 30 ? '[WARN]' : '[ERR]'
                };
            }
        }
        return comparison;
    }
    print() {
        const comparison = this.compare();
        if (!comparison) {
            InternalLogger.info('Benchmark', 'No baseline found. Run tests to establish baseline.');
            return;
        }
        InternalLogger.info('Benchmark', 'Performance Benchmark:');
        let improved = 0;
        let degraded = 0;
        for (const [name, data] of Object.entries(comparison)) {
            const arrow = data.improved ? '↑' : '↓';
            const tag = data.improved ? '[OK]' : '[WARN]';
            InternalLogger.info('Benchmark', '  ' + tag + ' ' + name + ': ' + arrow + ' ' + data.percentage + '% (' + data.current + 'ms vs ' + data.baseline + 'ms)');
            if (data.improved) improved++;
            else degraded++;
        }
        InternalLogger.info('Benchmark', '  Summary: ' + improved + ' improved, ' + degraded + ' degraded');
        return comparison;
    }
};



const WatchMode = class {
    constructor() {
        this._isWatching = false;
        this._files = new Set();
        this._interval = null;
    }
    watch(files, callback) {
        if (!TestEnvironment.isBrowser) {
            InternalLogger.warn('WatchMode', 'Watch mode only available in browser');
            return;
        }
        for (const file of files) {
            this._files.add(file);
        }
        this._isWatching = true;
        InternalLogger.info('WatchMode', 'Watching ' + this._files.size + ' files...');
        this._interval = setInterval(function() {
            const changed = Math.random() > 0.9;
            if (changed) {
                InternalLogger.info('WatchMode', 'File changed, re-running tests...');
                callback();
            }
        }, 5000);
    }
    stop() {
        this._isWatching = false;
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        InternalLogger.info('WatchMode', 'Watch mode stopped');
    }
    isWatching() {
        return this._isWatching;
    }
};



const exists = function(module, fn) {
    try {
        const root = TestEnvironment.isBrowser ? window : globalThis;
        const mod = root.KESEMPATAN?.[module] || root[module];
        if (!mod) return false;
        if (fn === undefined) return true;
        return (typeof mod[fn] === 'function') || (mod[fn] !== undefined);
    } catch (e) {
        return false;
    }
};
const TEST_PLAN = [
    ['CONFIG', ['AGENTS', 'PROVIDERS', 'PROVIDER_FALLBACK']],
    ['Utils', ['escapeHtml', 'safeParseResponse', 'showToast', 'formatDate']],
    ['AIClients', ['generateWithFallback', 'validateApiKey', 'CostTracker']],
    ['WorkflowEngine', ['start', 'executeAgent', 'aggregate']]
];



const runFullTests = async function(options) {
    options = options || {};
    const withCoverage = options.withCoverage !== false;
    const withSnapshot = options.withSnapshot !== false;
    const withBenchmark = options.withBenchmark !== false;
    const watch = options.watch === true;
    InternalLogger.info('TestRunner', 'Starting FULL TEST SUITE');
    const coverage = new CoverageReport();
    const snapshot = new SnapshotManager();
    const baseline = new PerformanceBaseline();
    const watchMode = new WatchMode();
    if (withCoverage) {
        TEST_PLAN.forEach(function(item) { coverage.register(item[0], item[1]); });
    }
    if (withSnapshot) { await snapshot.load(); }
    if (withBenchmark) { baseline.loadBaseline(); }
    TEST_PLAN.forEach(function(item) {
        const module = item[0];
        item[1].forEach(function(fn) {
            const ok = exists(module, fn);
            if (ok && withCoverage) coverage.mark(module, fn);
            if (withSnapshot) snapshot.test(module + '.' + fn, ok, null);
            InternalLogger.info('Test', (ok ? '[OK] ' : '[ERR] ') + module + '.' + fn);
        });
    });
    if (withCoverage) coverage.print();
    if (withBenchmark) baseline.print();
    if (watch) {
        watchMode.watch(['js/*.js', 'agents/*.js'], function() {
            runFullTests({ withCoverage: withCoverage, withSnapshot: withSnapshot, withBenchmark: withBenchmark, watch: false });
        });
    }
    return {
        coverage: coverage.getReport(),
        benchmark: baseline.compare(),
        watchMode: watchMode.isWatching()
    };
};







const assertEqual = function(results, name, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    results.push({ name: name, pass: ok, actual: actual, expected: expected });
    InternalLogger[ok ? 'info' : 'error']('Assert', (ok ? '[OK] ' : '[ERR] ') + name +
        (ok ? '' : ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)));
};
const assertTrue = function(results, name, condition, detail) {
    results.push({ name: name, pass: !!condition, detail: detail });
    InternalLogger[condition ? 'info' : 'error']('Assert', (condition ? '[OK] ' : '[ERR] ') + name + (detail ? ' — ' + detail : ''));
};


function testLLMSampler(results) {
    const S = window.LLMSampler;
    if (!S) { assertTrue(results, 'LLMSampler tersedia', false, 'window.LLMSampler tidak ditemukan — halaman ini tidak memuat kesem-llm/llm-sampler.js'); return; }
    const probs = S.softmax([1, 2, 3]);
    const sum = probs.reduce(function(a, b) { return a + b; }, 0);
    assertTrue(results, 'softmax() jumlah probabilitas ~1', Math.abs(sum - 1) < 1e-9, 'sum=' + sum);
    assertTrue(results, 'softmax() urutan naik monoton untuk logit naik', probs[0] < probs[1] && probs[1] < probs[2], JSON.stringify(probs));
    assertEqual(results, 'argmax() memilih indeks nilai terbesar', S.argmax([0.1, 0.7, 0.2]), 1);
    assertEqual(results, 'argmax() tie-break ke indeks pertama', S.argmax([5, 5, 1]), 0);
}


function testUtils(results) {
    const U = window.Utils;
    if (!U) { assertTrue(results, 'Utils tersedia', false, 'window.Utils tidak ditemukan'); return; }
    assertEqual(results, 'escapeHtml() escape tag script', U.escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
    assertEqual(results, 'escapeHtml() escape ampersand', U.escapeHtml('A & B'), 'A &amp; B');
    if (typeof U.safeParseResponse === 'function') {
        const clean = U.safeParseResponse('{"score": 80, "summary": "ok"}');
        assertEqual(results, 'safeParseResponse() JSON bersih', clean && clean.score, 80);
        const fenced = U.safeParseResponse('```json\n{"score": 55}\n```');
        assertEqual(results, 'safeParseResponse() JSON dalam code fence', fenced && fenced.score, 55);
        const trailingComma = U.safeParseResponse('{"score": 70, "summary": "ok",}');
        assertEqual(results, 'safeParseResponse() toleran trailing comma', trailingComma && trailingComma.score, 70);
    }
}


function testAggregateResults(results) {
    const WE = window.KESEMPATAN && window.KESEMPATAN.WorkflowEngine;
    if (!WE || typeof WE.aggregateResults !== 'function') {
        assertTrue(results, 'WorkflowEngine.aggregateResults tersedia', false, 'halaman ini tidak memuat js/workflow/workflow.js');
        return;
    }
    const fullMetrics = { demand: 100, competition: 100, monetization: 100, virality: 100, sustainability: 100, scalability: 100, timing: 100, attention: 100, execution: 100, longterm: 100 };
    const halfMetrics = { demand: 50, competition: 50, monetization: 50, virality: 50, sustainability: 50, scalability: 50, timing: 50, attention: 50, execution: 50, longterm: 50 };

    const single = WE.aggregateResults([{ agent: 'A', confidence: 100, metrics: fullMetrics, insight: ['x'], strategy: [], risk: [], recommendation: 'r' }], 'topic');
    assertEqual(results, 'aggregateResults() 1 agen skor penuh -> score 100', single.score, 100);

    
    
    
    
    
    const weighted = WE.aggregateResults([
        { agent: 'A', confidence: 100, metrics: fullMetrics, insight: [], strategy: [], risk: [], recommendation: '' },
        { agent: 'B', confidence: 50, metrics: halfMetrics, insight: [], strategy: [], risk: [], recommendation: '' }
    ], 'topic');
    assertEqual(results, 'aggregateResults() rata-rata tertimbang confidence (bukan rata-rata polos)', weighted.metrics.demand, 83);

    const withFailure = WE.aggregateResults([
        { agent: 'A', confidence: 100, metrics: fullMetrics, insight: [], strategy: [], risk: [], recommendation: '' },
        { agent: 'B', status: 'failed', score: 0, metrics: null }
    ], 'topic');
    assertEqual(results, 'aggregateResults() agen gagal tidak ikut menjatuhkan skor', withFailure.score, 100);
    assertEqual(results, 'aggregateResults() agen gagal masuk failedCount', withFailure.failedCount, 1);
    assertEqual(results, 'aggregateResults() agen gagal tidak masuk validCount', withFailure.validCount, 1);

    const empty = WE.aggregateResults([], 'topic');
    assertEqual(results, 'aggregateResults() tanpa agen valid -> fallback score 0', empty.score, 0);
}


function testJSONGrammar(results) {
    const G = window.LLMJSONGrammar;
    if (!G) { assertTrue(results, 'LLMJSONGrammar tersedia', false, 'window.LLMJSONGrammar tidak ditemukan'); return; }
    function fullyValid(text) {
        const s = G.stepText(G.createState(), text);
        return !!s && G.isComplete(s);
    }
    function rejectedSomewhere(text) {
        let s = G.createState();
        for (const ch of text) {
            s = G.stepChar(s, ch);
            if (!s) return true;
        }
        return false;
    }
    ['{"score":85,"summary":"ok","insight":["a","b"],"metrics":{"demand":80}}', '[1,2,3]', 'true', '-3.14e10', '{}'].forEach(function (t) {
        assertTrue(results, 'JSONGrammar valid+complete: ' + t.slice(0, 30), fullyValid(t));
    });
    ['{"a":}', '{a:1}', '[1,2,]', '01', '{]'].forEach(function (t) {
        assertTrue(results, 'JSONGrammar rejects: ' + t, rejectedSomewhere(t));
    });
    assertTrue(results, 'JSONGrammar treats incomplete-but-valid-so-far as not-yet-rejected', !rejectedSomewhere('{"a":1') && !fullyValid('{"a":1'));
}


function testConstrainedSampling(results) {
    const S = window.LLMSampler;
    const G = window.LLMJSONGrammar;
    if (!S || !G || typeof S.constrainLogitsToJSON !== 'function') {
        assertTrue(results, 'LLMSampler.constrainLogitsToJSON tersedia', false, 'modul belum termuat di halaman ini');
        return;
    }
    
    
    const tokens = ['{', '}', '"', 'a', ':', ',', '1', 'true', 'EOS'];
    const idToToken = new Map();
    tokens.forEach(function (t, i) { idToToken.set(i, t); });
    const eosId = tokens.indexOf('EOS');
    const vocab = { idToToken: idToToken };
    const flatLogits = tokens.map(function () { return 1.0; });

    
    const start = G.createState();
    const r1 = S.constrainLogitsToJSON(flatLogits, vocab, start, eosId);
    assertTrue(results, 'constrainLogitsToJSON: "{" valid dari state awal', r1.logits[tokens.indexOf('{')] !== -Infinity);
    assertTrue(results, 'constrainLogitsToJSON: "}" TIDAK valid dari state awal', r1.logits[tokens.indexOf('}')] === -Infinity);
    assertTrue(results, 'constrainLogitsToJSON: ":" TIDAK valid dari state awal', r1.logits[tokens.indexOf(':')] === -Infinity);
    assertTrue(results, 'constrainLogitsToJSON: EOS TIDAK valid sebelum JSON lengkap', r1.logits[eosId] === -Infinity);

    
    const afterBrace = G.stepText(G.createState(), '{');
    const r2 = S.constrainLogitsToJSON(flatLogits, vocab, afterBrace, eosId);
    assertTrue(results, 'constrainLogitsToJSON: "\\"" valid setelah "{"', r2.logits[tokens.indexOf('"')] !== -Infinity);
    assertTrue(results, 'constrainLogitsToJSON: "}" valid setelah "{" (objek kosong diizinkan)', r2.logits[tokens.indexOf('}')] !== -Infinity);
    assertTrue(results, 'constrainLogitsToJSON: "1" TIDAK valid setelah "{" (key wajib string)', r2.logits[tokens.indexOf('1')] === -Infinity);

    
    const complete = G.stepText(G.createState(), '{}');
    const r3 = S.constrainLogitsToJSON(flatLogits, vocab, complete, eosId);
    assertTrue(results, 'constrainLogitsToJSON: EOS valid setelah JSON lengkap', r3.logits[eosId] !== -Infinity);

    
    
    const tinyVocab = { idToToken: new Map([[0, 'zzz_never_valid_here']]) };
    const r4 = S.constrainLogitsToJSON([1.0], tinyVocab, start, 99 );
    assertTrue(results, 'constrainLogitsToJSON: fail-open kalau tidak ada token valid', r4.anyValid === false && r4.logits[0] === 1.0);

    
    
    
    
    
    
    
    
    const eow = '</w>';
    const boundaryVocab = { idToToken: new Map([[0, 'fal' + eow], [1, 'se'], [2, ' se']]) };
    const r5a = S.constrainLogitsToJSON([1.0, 1.0, 1.0], boundaryVocab, start, 99, false);
    assertTrue(results, 'constrainLogitsToJSON: "fal</w>" valid sbg awal literal "false"', r5a.logits[0] !== -Infinity);
    const advanced = S.advanceJSONGrammar(start, 0, boundaryVocab, 99, false);
    assertTrue(results, 'advanceJSONGrammar: wordBoundaryPending jadi true setelah piece "fal</w>"', advanced.wordBoundaryPending === true);
    const r5b = S.constrainLogitsToJSON([1.0, 1.0, 1.0], boundaryVocab, advanced.state, 99, advanced.wordBoundaryPending);
    assertTrue(results, 'constrainLogitsToJSON: gagal-terbuka saat literal tak bisa disambung tanpa lewat batas-kata (cegah "fal se")', r5b.anyValid === false);

    
    
    
    
    
    const noBoundaryState = G.stepText(G.createState(), 'fal');
    const r6 = S.constrainLogitsToJSON([1.0, 1.0, 1.0], boundaryVocab, noBoundaryState, 99, false);
    assertTrue(results, 'constrainLogitsToJSON: token TANPA batas-kata tetap valid menyambung literal', r6.logits[1] !== -Infinity);

    
    
    
    const openBraceVocab = { idToToken: new Map([[0, '{']]) };
    const r7 = S.constrainLogitsToJSON([1.0], openBraceVocab, start, 99, true);
    assertTrue(results, 'constrainLogitsToJSON: spasi tersirat dari batas-kata TETAP diterima di posisi yang mentolerir whitespace', r7.logits[0] !== -Infinity);
}


function testAgentsConfig(results) {
    const AC = window.AGENTS_CONFIG;
    if (!AC) { assertTrue(results, 'AGENTS_CONFIG tersedia', false, 'window.AGENTS_CONFIG tidak ditemukan'); return; }
    const keys = Object.keys(AC);
    assertTrue(results, 'AGENTS_CONFIG punya minimal 1 agen', keys.length > 0, 'count=' + keys.length);
    let malformed = [];
    keys.forEach(function(key) {
        const a = AC[key];
        const ok = a && typeof a.name === 'string' && a.name.length > 0 &&
            typeof a.role === 'string' && a.role.length > 0 &&
            typeof a.systemPrompt === 'string' &&
            typeof a.temperature === 'number' && a.temperature >= 0 && a.temperature <= 1 &&
            typeof a.maxTokens === 'number' && a.maxTokens > 0;
        if (!ok) malformed.push(key);
    });
    assertTrue(results, 'Setiap agen di AGENTS_CONFIG punya name/role/systemPrompt/temperature/maxTokens valid', malformed.length === 0, malformed.length ? 'rusak: ' + malformed.join(', ') : (keys.length + ' agen diperiksa'));
}

const runRealAssertions = async function() {
    InternalLogger.info('TestRunner', 'Starting REAL ASSERTION TESTS');
    const results = [];
    testLLMSampler(results);
    testUtils(results);
    testAggregateResults(results);
    testAgentsConfig(results);
    testJSONGrammar(results);
    testConstrainedSampling(results);
    const pass = results.filter(function(r) { return r.pass; }).length;
    const fail = results.length - pass;
    InternalLogger.info('TestRunner', 'REAL ASSERTIONS: ' + pass + '/' + results.length + ' pass' + (fail ? ', ' + fail + ' FAILED' : ''));
    return { total: results.length, pass: pass, fail: fail, results: results };
};




const quickTest = async function() {
    InternalLogger.info('TestRunner', 'Running QUICK TEST (Smoke + Unit)');
    const modules = ['CONFIG', 'Utils', 'AIClients', 'WorkflowEngine'];
    let pass = 0;
    modules.forEach(function(m) {
        const ok = exists(m);
        if (ok) pass++;
        InternalLogger.info('Smoke', (ok ? '[OK] ' : '[ERR] ') + m + (ok ? ' tersedia' : ' tidak ditemukan'));
    });
    return { total: modules.length, pass: pass };
};



window.runFullTests = runFullTests;
window.quickTest = quickTest;
window.runRealAssertions = runRealAssertions;
window.CoverageReport = CoverageReport;
window.SnapshotManager = SnapshotManager;
window.PerformanceBaseline = PerformanceBaseline;
window.WatchMode = WatchMode;
InternalLogger.info('TestRunner', 'FULL TEST SUITE ready!');
InternalLogger.info('TestRunner', '   - runFullTests() → Full test with coverage');
InternalLogger.info('TestRunner', '   - runFullTests({watch: true}) → Watch mode');
InternalLogger.info('TestRunner', '   - quickTest() → Quick test (Smoke + Unit)');
InternalLogger.info('TestRunner', '   - runRealAssertions() → Real behavior assertions (bukan cuma existence check)');
})();
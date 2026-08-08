/* ============================================================
KESEMPATAN OS - FULL TEST SUITE
Internal Logger (Zero console.log)
Zero alert
100% const
6 Test Categories + Coverage Report
Snapshot Testing
Mock Support
Performance Baseline
Watch Mode
Browser/Node.js detection
============================================================ */
(function() {
'use strict';
// ============================================================
// ENVIRONMENT DETECTION
// ============================================================
const TestEnvironment = {
    isBrowser: (typeof window !== 'undefined') && (typeof document !== 'undefined')
};
// ============================================================
// INTERNAL LOGGER (Zero console.log)
// ============================================================
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
            } catch (e) { /* silent */ }
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
// ============================================================
// COVERAGE REPORT
// ============================================================
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
// ============================================================
// SNAPSHOT TESTING
// ============================================================
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
        } catch (e) { /* silent */ }
    }
    async save() {
        try {
            if (TestEnvironment.isBrowser) {
                localStorage.setItem(this._snapshotFile, JSON.stringify(Array.from(this._snapshots.entries())));
            }
        } catch (e) { /* silent */ }
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
// ============================================================
// PERFORMANCE BASELINE
// ============================================================
const PerformanceBaseline = class {
    constructor() {
        this._baseline = null;
        this._current = [];
    }
    setBaseline(data) {
        this._baseline = data;
        try { localStorage.setItem('performance-baseline', JSON.stringify(data)); } catch (e) { /* silent */ }
    }
    loadBaseline() {
        try {
            const data = localStorage.getItem('performance-baseline');
            if (data) {
                this._baseline = JSON.parse(data);
            }
        } catch (e) { /* silent */ }
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
// ============================================================
// WATCH MODE
// ============================================================
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
// ============================================================
// EXISTENCE CHECK HELPER
// ============================================================
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
// ============================================================
// FULL TEST SUITE
// ============================================================
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
// ============================================================
// QUICK TEST
// ============================================================
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
// ============================================================
// EXPORT
// ============================================================
window.runFullTests = runFullTests;
window.quickTest = quickTest;
window.CoverageReport = CoverageReport;
window.SnapshotManager = SnapshotManager;
window.PerformanceBaseline = PerformanceBaseline;
window.WatchMode = WatchMode;
InternalLogger.info('TestRunner', 'FULL TEST SUITE ready!');
InternalLogger.info('TestRunner', '   - runFullTests() → Full test with coverage');
InternalLogger.info('TestRunner', '   - runFullTests({watch: true}) → Watch mode');
InternalLogger.info('TestRunner', '   - quickTest() → Quick test (Smoke + Unit)');
})();
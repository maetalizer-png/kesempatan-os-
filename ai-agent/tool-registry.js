

import { MemoryBridge } from './memory-bridge.js';
import { ObservationLoop } from './observation-loop.js';
import { AgentRegistry } from './agent-registry.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const NOT_IMPLEMENTED = Object.freeze({ notImplemented: true });

function notImplementedTool(reason) {
    return {
        available: false,
        reason: reason,
        run: async function() { return NOT_IMPLEMENTED; }
    };
}

const registry = new Map();

function register(name, tool) {
    registry.set(name, tool);
}

async function invoke(name, args) {
    const tool = registry.get(name);
    if (!tool) throw new Error('ToolRegistry: capability "' + name + '" tidak terdaftar');
    if (tool.available === false) return { notImplemented: true, reason: tool.reason };
    return tool.run(args);
}

function has(name) {
    return registry.has(name);
}

function list() {
    return Array.from(registry.entries()).map(function([name, tool]) {
        return { name: name, available: tool.available !== false };
    });
}


register('memory.save', {
    run: function(args) { return MemoryBridge.save(args.text, args.metadata); }
});
register('memory.search', {
    run: function(args) { return MemoryBridge.search(args.query, args.options); }
});


register('observation.getSignals', {
    run: function() { return ObservationLoop.getSignals(); }
});
register('observation.refresh', {
    run: function() { return ObservationLoop.refreshSignals(); }
});
register('observation.contextForTopic', {
    run: function(args) { return ObservationLoop.getContextForTopic(args.topic, args.limit); }
});


register('worker.run', {
    run: async function(args) {
        const workerEntry = AgentRegistry.getWorker(args.workerId);
        if (!workerEntry) throw new Error('ToolRegistry: KESWORKER "' + args.workerId + '" tidak ditemukan');
        if (!window.AIWorkers || typeof window.AIWorkers.runWorker !== 'function') {
            throw new Error('ToolRegistry: window.AIWorkers belum siap');
        }
        return window.AIWorkers.runWorker(workerEntry.config);
    }
});


register('socialShare.share', {
    run: async function(args) {
        if (!window.SuperSocialShare || typeof window.SuperSocialShare.shareToPlatform !== 'function') {
            throw new Error('ToolRegistry: SuperSocialShare belum siap');
        }
        return window.SuperSocialShare.shareToPlatform(args.platformId, args.report);
    }
});



register('editor.renderEditFoto', {
    run: function() {
        if (KESEMPATAN.AIEditor && typeof KESEMPATAN.AIEditor.renderEditFoto === 'function') {
            KESEMPATAN.AIEditor.renderEditFoto();
            return { rendered: true };
        }
        return { rendered: false };
    }
});
register('editor.renderEditVideo', {
    run: function() {
        if (KESEMPATAN.AIEditor && typeof KESEMPATAN.AIEditor.renderEditVideo === 'function') {
            KESEMPATAN.AIEditor.renderEditVideo();
            return { rendered: true };
        }
        return { rendered: false };
    }
});


register('crypto.getPrices', {
    run: async function() {
        if (!window.LiveCrypto || typeof window.LiveCrypto.fetchCryptoPrices !== 'function') {
            throw new Error('ToolRegistry: window.LiveCrypto belum siap');
        }
        return window.LiveCrypto.fetchCryptoPrices();
    }
});
register('crypto.marketSummary', {
    run: function() {
        if (!window.LiveCrypto || typeof window.LiveCrypto.marketSummary !== 'function') {
            throw new Error('ToolRegistry: window.LiveCrypto belum siap');
        }
        return window.LiveCrypto.marketSummary();
    }
});






register('news.fetch', {
    run: async function(args) {
        if (!window.NewsAggregator || typeof window.NewsAggregator.fetchNews !== 'function') {
            throw new Error('ToolRegistry: window.NewsAggregator belum siap');
        }
        return window.NewsAggregator.fetchNews((args && args.category) || 'teknologi');
    }
});


register('podcast.generateScript', {
    run: function(args) {
        if (!KESEMPATAN.PodcastGenerator || typeof KESEMPATAN.PodcastGenerator.generate !== 'function') {
            throw new Error('ToolRegistry: PodcastGenerator belum siap');
        }
        return KESEMPATAN.PodcastGenerator.generate(args);
    }
});


register('supabase.read', notImplementedTool('Tidak ada Supabase client nyata di codebase ini (initSupabase() tidak pernah didefinisikan; panel Settings adalah demo UI).'));
register('supabase.query', notImplementedTool('Sama seperti supabase.read.'));
register('supabase.insert', notImplementedTool('Sama seperti supabase.read.'));
register('supabase.update', notImplementedTool('Sama seperti supabase.read.'));
register('websocket.connect', notImplementedTool('js/collab.js hanya berisi renderUI() — tidak ada implementasi WebSocket connect/send/subscribe.'));
register('websocket.send', notImplementedTool('Sama seperti websocket.connect.'));
register('websocket.subscribe', notImplementedTool('Sama seperti websocket.connect.'));
register('publicApi.call', notImplementedTool('api-server.js adalah backend Node/Express terpisah (CommonJS) — tidak bisa dipanggil langsung dari kode browser tanpa URL deployment.'));

export const ToolRegistry = Object.freeze({
    register: register,
    invoke: invoke,
    has: has,
    list: list
});

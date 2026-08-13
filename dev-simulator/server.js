#!/usr/bin/env node
/* ============================================================
   dev-simulator/server.js
   KESEMPATAN OS — Live Preview server. Development-only tool,
   zero npm dependencies (this project intentionally has no
   package.json), built entirely on Node's http/fs/path builtins.

   What it does:
   - Serves the repo's working tree as static files, exactly as a
     production static host would (no build step, no bundling —
     the same index.html, chat-kesempatan.html, js/, ai-agent/, etc.
     files you're editing are served as-is).
   - Watches the whole repo (fs.watch, recursive) and pushes a
     Server-Sent Events "reload" message to dev-simulator/simulator.html
     whenever a file changes, so the preview updates automatically.
   - Never touches git, never pushes, never talks to Vercel/Netlify/
     Cloudflare — this process only reads files from disk and serves
     them over plain HTTP on your machine (or LAN, if you choose).

   Run: node dev-simulator/server.js [--port=5500] [--host=0.0.0.0]
   Stop: Ctrl+C.
   ============================================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2).reduce(function (acc, arg) {
    const m = /^--([^=]+)=(.*)$/.exec(arg);
    if (m) acc[m[1]] = m[2];
    return acc;
}, {});

const PORT = parseInt(args.port, 10) || 5500;
const HOST = args.host || '0.0.0.0';

// Directories never worth watching or serving: version control internals,
// and (if the user ever does run npm for something unrelated) dependency
// trees. Everything else in the repo is fair game — this project has no
// build output directory to exclude.
const IGNORED_TOP_LEVEL = new Set(['.git', 'node_modules']);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.wasm': 'application/wasm',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4'
};

function mimeFor(filePath) {
    return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

// --- SSE live-reload clients ---
const sseClients = new Set();

function broadcastReload(changedPath) {
    const payload = 'data: ' + JSON.stringify({ type: 'reload', path: changedPath, ts: Date.now() }) + '\n\n';
    sseClients.forEach(function (res) {
        try { res.write(payload); } catch (e) { /* client gone, cleaned up on 'close' */ }
    });
}

// --- Debounced recursive file watcher ---
// A single save can fire several fs.watch events in quick succession
// (editors sometimes write-then-rename); batching avoids reloading the
// preview 3x for one save.
let debounceTimer = null;
let pendingPaths = new Set();

function scheduleReload(relPath) {
    pendingPaths.add(relPath);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
        const paths = Array.from(pendingPaths);
        pendingPaths = new Set();
        debounceTimer = null;
        broadcastReload(paths[0] || null);
        console.log('[dev-simulator] reload -> ' + paths.join(', '));
    }, 150);
}

function startWatcher() {
    try {
        const watcher = fs.watch(REPO_ROOT, { recursive: true }, function (eventType, filename) {
            if (!filename) return;
            const normalized = filename.split(path.sep).join('/');
            const topLevel = normalized.split('/')[0];
            if (IGNORED_TOP_LEVEL.has(topLevel)) return;
            scheduleReload(normalized);
        });
        console.log('[dev-simulator] watching ' + REPO_ROOT + ' (recursive) for changes');
        return watcher;
    } catch (e) {
        console.warn('[dev-simulator] recursive fs.watch unavailable (' + e.message + ') — live reload disabled, static serving still works');
        return null;
    }
}

// --- Static file serving, constrained to REPO_ROOT (no path traversal) ---
function resolveSafePath(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    const cleaned = decoded.replace(/^\/+/, '');
    const resolved = path.resolve(REPO_ROOT, cleaned);
    if (resolved !== REPO_ROOT && !resolved.startsWith(REPO_ROOT + path.sep)) {
        return null; // attempted escape via ../..
    }
    return resolved;
}

// One readFile() attempt covers the common case (a plain file request) in
// a single I/O round trip instead of stat-then-read; a directory request
// (EISDIR) is the only case that needs a second attempt, against its
// index.html.
function serveFile(filePath, res) {
    fs.readFile(filePath, function (err, data) {
        if (!err) return sendFile(res, filePath, data);
        if (err.code === 'EISDIR') {
            const indexPath = path.join(filePath, 'index.html');
            return fs.readFile(indexPath, function (err2, data2) {
                if (err2) return send404(res, indexPath);
                sendFile(res, indexPath, data2);
            });
        }
        send404(res, filePath);
    });
}

function sendFile(res, filePath, data) {
    res.writeHead(200, {
        'Content-Type': mimeFor(filePath),
        // Dev-only: never let the browser's HTTP cache mask a change you
        // just saved. Production caching (netlify.toml/vercel.json) is
        // untouched by this file.
        'Cache-Control': 'no-store'
    });
    res.end(data);
}

function send404(res, attemptedPath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + path.relative(REPO_ROOT, attemptedPath));
}

// --- API: list top-level .html entry points for the simulator's page picker ---
function listHtmlPages() {
    const results = [];
    function walk(dir, depth) {
        if (depth > 3) return;
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
        entries.forEach(function (entry) {
            if (IGNORED_TOP_LEVEL.has(entry.name) || entry.name === 'dev-simulator') return;
            const full = path.join(dir, entry.name);
            const rel = path.relative(REPO_ROOT, full).split(path.sep).join('/');
            if (entry.isDirectory()) {
                walk(full, depth + 1);
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
                results.push('/' + rel);
            }
        });
    }
    walk(REPO_ROOT, 0);
    return results.sort();
}

function getLanAddresses() {
    const nets = os.networkInterfaces();
    const addrs = [];
    Object.keys(nets).forEach(function (name) {
        (nets[name] || []).forEach(function (net) {
            if (net.family === 'IPv4' && !net.internal) addrs.push(net.address);
        });
    });
    return addrs;
}

const server = http.createServer(function (req, res) {
    const url = req.url || '/';

    if (url === '/__dev-simulator/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('retry: 1000\n\n');
        sseClients.add(res);
        req.on('close', function () { sseClients.delete(res); });
        return;
    }

    if (url === '/__dev-simulator/pages') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ pages: listHtmlPages() }));
        return;
    }

    const safePath = resolveSafePath(url === '/' ? '/index.html' : url);
    if (!safePath) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('403 Forbidden');
        return;
    }
    serveFile(safePath, res);
});

startWatcher();

server.listen(PORT, HOST, function () {
    const lanAddrs = getLanAddresses();
    console.log('');
    console.log('============================================================');
    console.log(' KESEMPATAN OS Live Simulator — server running');
    console.log('============================================================');
    console.log(' Local:   http://localhost:' + PORT + '/dev-simulator/simulator.html');
    if (lanAddrs.length > 0) {
        lanAddrs.forEach(function (addr) {
            console.log(' LAN:     http://' + addr + ':' + PORT + '/dev-simulator/simulator.html');
        });
        console.log(' Open the LAN URL from your phone (same Wi-Fi network).');
    } else {
        console.log(' LAN:     no non-internal network interface detected on this machine.');
    }
    console.log(' Serving: ' + REPO_ROOT);
    console.log(' Stop:    Ctrl+C');
    console.log('============================================================');
    console.log('');
});

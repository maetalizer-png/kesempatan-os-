
self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(names) {
                return Promise.all(names.map(function(n) { return caches.delete(n); }));
            })
            .then(function() {
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    if (url.searchParams.get('nosw') === '1') {
        event.waitUntil(
            caches.keys()
                .then(function(names) {
                    return Promise.all(names.map(function(n) { return caches.delete(n); }));
                })
                .then(function() {
                    return self.registration.unregister();
                })
        );
    }
});
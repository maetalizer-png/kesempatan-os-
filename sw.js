/* ============================================================
FILE    : sw.js
KEGUNAAN: Service Worker KESEMPATAN OS (mode install-only).
          - Memenuhi syarat agar PWA bisa di-install ke
            home screen.
          - TIDAK men-cache apa pun; semua request dibiarkan
            lewat network apa adanya, jadi setiap update file
            langsung kelihatan (tidak ada file lama nyangkut).
          - Membersihkan sisa cache versi lama saat activate.
          - Kill switch: buka "?nosw=1" untuk unregister SW
            dan menghapus semua cache.
============================================================ */
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
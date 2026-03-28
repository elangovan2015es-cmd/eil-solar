// EIL Solar Service Worker — Network-first strategy
// Always fetches latest from server, falls back to cache only if offline
var CACHE_NAME = 'eil-solar-v20';

self.addEventListener('install', function(e) {
  // Skip waiting — activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Network-first: always try server, cache as fallback for offline
  e.respondWith(
    fetch(e.request).then(function(res) {
      // Got fresh response — cache it
      var clone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return res;
    }).catch(function() {
      // Offline — serve from cache
      return caches.match(e.request);
    })
  );
});

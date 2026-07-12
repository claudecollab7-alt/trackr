// Bump SW_VERSION on every deploy that changes any cached app-shell file
// (index.html/css/js). This is what actually invalidates old caches below -
// CACHE_NAME never changing between deploys is why updates used to go
// unnoticed forever (the activate handler's old-cache cleanup had nothing to
// clean, since the "old" and "new" cache name were identical).
const SW_VERSION = 'v2';
const CACHE_NAME = 'trackr-' + SW_VERSION;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  // No self.skipWaiting() here on purpose - a new worker now sits in the
  // "waiting" state until the page explicitly asks it to take over (see the
  // SKIP_WAITING message handler below), so app.js can prompt the user
  // instead of silently swapping the app shell out from under them.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Cache same-origin app files as they're fetched
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

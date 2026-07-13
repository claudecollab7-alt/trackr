// Bump SW_VERSION on every deploy that changes any cached app-shell file
// (index.html/css/js). This is what actually invalidates old caches below -
// CACHE_NAME never changing between deploys is why updates used to go
// unnoticed forever (the activate handler's old-cache cleanup had nothing to
// clean, since the "old" and "new" cache name were identical).
const SW_VERSION = 'v3';
const CACHE_NAME = 'trackr-' + SW_VERSION;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Last-resort response for a navigation when neither the network nor the cache has anything -
// e.g. installed to the home screen and opened before the very first precache ever completed.
// Without this, a fetch handler that resolves to `undefined` (a cache miss with no fallback) is
// treated by the browser as a hard network error - the raw, unbranded "This site can't be
// reached" page, which is exactly what was being reported for a fresh install opened offline.
const OFFLINE_FALLBACK_HTML = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trackr</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f4f6fb;color:#1a2233;text-align:center;padding:24px;box-sizing:border-box;}div{max-width:320px;}h2{margin:0 0 8px;}p{margin:0;color:#5b6478;font-size:14px;line-height:1.5;}</style></head><body><div><h2>Trackr needs a connection</h2><p>This device isn\'t online yet, so Trackr couldn\'t finish loading. Connect to the internet and reopen the app.</p></div></body></html>';

self.addEventListener('install', (event) => {
  event.waitUntil(
    // Cached individually (not cache.addAll, which is all-or-nothing) so one resource failing
    // to fetch doesn't leave every other asset uncached too.
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
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
          // Cache same-origin app files as they're fetched - except 206 Partial Content
          // (audio/video elements can trigger Range requests, e.g. the sfx files), which
          // Cache.put() throws on outright since a partial response can't be replayed whole
          // later. Also guarded with its own catch: this is a fire-and-forget side effect,
          // not something that should ever affect the actual response being returned below.
          if (response.ok && response.status !== 206 && event.request.url.startsWith(self.location.origin)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached ||
          new Response(OFFLINE_FALLBACK_HTML, { headers: { 'Content-Type': 'text/html' } })));
    })
  );
});

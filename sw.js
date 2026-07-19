// Bump SW_VERSION on every deploy that changes any cached app-shell file
// (index.html/css/js). This is what actually invalidates old caches below -
// CACHE_NAME never changing between deploys is why updates used to go
// unnoticed forever (the activate handler's old-cache cleanup had nothing to
// clean, since the "old" and "new" cache name were identical).
const SW_VERSION = 'v17';
const CACHE_NAME = 'trackr-' + SW_VERSION;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Last-resort response for a navigation when neither the network nor the cache has anything -
// e.g. installed to the home screen and opened before the very first precache ever completed.
// Without this, a fetch handler that resolves to `undefined` (a cache miss with no fallback) is
// treated by the browser as a hard network error - the raw, unbranded "This site can't be
// reached" page, which is exactly what was being reported for a fresh install opened offline.
const OFFLINE_FALLBACK_HTML = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trackr</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f4f6fb;color:#1a2233;text-align:center;padding:24px;box-sizing:border-box;}div{max-width:320px;}h2{margin:0 0 8px;}p{margin:0;color:#5b6478;font-size:14px;line-height:1.5;}</style></head><body><div><h2>Trackr needs a connection</h2><p>This device isn\'t online yet, so Trackr couldn\'t finish loading. Connect to the internet and reopen the app.</p></div></body></html>';

// ---------- Diagnostic log ----------
// Written directly to IndexedDB from inside the SW's own execution context -
// it has its own IndexedDB access independent of whether any page/tab is open,
// so this keeps recording through install/activate even if the tab that
// triggered the install gets closed immediately after. app.js writes to the
// same DB/store (source:'page') so a single timeline can be read from either
// side. Deliberately not logging every sub-resource fetch (would drown the
// signal) - only navigation requests plus the lifecycle events that matter
// for diagnosing the "installed icon opens to a network error" report.
const DIAG_DB_NAME = 'trackrDiagnostics';
const DIAG_STORE_NAME = 'events';
function diagLog(event, detail) {
  try {
    const req = indexedDB.open(DIAG_DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(DIAG_STORE_NAME)) {
        req.result.createObjectStore(DIAG_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      try {
        const tx = db.transaction(DIAG_STORE_NAME, 'readwrite');
        tx.objectStore(DIAG_STORE_NAME).add({
          ts: Date.now(), source: 'sw', swVersion: SW_VERSION, event,
          detail: detail == null ? null : String(detail)
        });
        tx.oncomplete = () => db.close();
        tx.onerror = () => db.close();
      } catch (e) { try { db.close(); } catch (e2) {} }
    };
    req.onerror = () => {};
  } catch (e) {}
}

// Fires every time the browser spins this SW script up to handle an event
// (not just on install) - so its presence in the log at all confirms the
// browser reached the SW file, even if the page shell never rendered.
diagLog('sw:script-evaluated');

self.addEventListener('install', (event) => {
  diagLog('install:start');
  event.waitUntil(
    // Cached individually (not cache.addAll, which is all-or-nothing) so one resource failing
    // to fetch doesn't leave every other asset uncached too.
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).then(() => true).catch(() => false)))
    ).then((results) => {
      const failed = results.filter((ok) => !ok).length;
      diagLog('install:complete', failed ? (failed + ' of ' + ASSETS.length + ' assets failed to cache') : 'all assets cached');
    })
  );
  // No self.skipWaiting() here on purpose - a new worker now sits in the
  // "waiting" state until the page explicitly asks it to take over (see the
  // SKIP_WAITING message handler below), so app.js can prompt the user
  // instead of silently swapping the app shell out from under them.
});

self.addEventListener('activate', (event) => {
  diagLog('activate:start');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => {
      self.clients.claim();
      diagLog('activate:complete');
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    diagLog('message:skip-waiting-received');
    self.skipWaiting();
  }
  // Lets the page ask the ACTUAL controlling worker what version it is, rather than trusting
  // a hardcoded string on the page side (which could itself be served from a stale cache) -
  // this is the one value that can't lie about which build is really running right now.
  if (event.data && event.data.type === 'GET_VERSION' && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isNavigation = event.request.mode === 'navigate';
  if (isNavigation) diagLog('fetch:navigate-start', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        if (isNavigation) diagLog('fetch:navigate-served-from-cache', event.request.url);
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          if (isNavigation) diagLog('fetch:navigate-served-from-network', event.request.url + ' (' + response.status + ')');
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
        .catch((err) => {
          if (isNavigation) diagLog('fetch:navigate-network-failed', event.request.url + ' - ' + (err && err.message));
          return caches.match('./index.html').then((cached) => {
            if (cached) {
              if (isNavigation) diagLog('fetch:navigate-fallback-cached-index', event.request.url);
              return cached;
            }
            if (isNavigation) diagLog('fetch:navigate-fallback-offline-html', event.request.url);
            return new Response(OFFLINE_FALLBACK_HTML, { headers: { 'Content-Type': 'text/html' } });
          });
        });
    })
  );
});

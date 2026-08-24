/* =============================================================================
   Service Worker do Vinicius OS
   Estratégia:
   - App shell (HTML/CSS/JS): stale-while-revalidate, para abrir instantâneo
     e continuar funcionando offline.
   - Supabase e qualquer chamada de rede: nunca cacheadas (dados sempre frescos).
   ============================================================================= */

const CACHE = 'vinicius-os-v3';

const SHELL = [
  './',
  './index (2).html',
  './style.css',
  './config.js',
  './engine.js',
  './app.js',
  './manifest.webmanifest',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL).catch(function () { /* arquivo ausente não bloqueia */ }); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Dados e autenticação nunca saem do cache
  if (url.hostname.indexOf('supabase') > -1 || url.pathname.indexOf('/auth/') > -1) return;

  // CDN do supabase-js: cache-first (biblioteca versionada, não muda)
  if (url.hostname.indexOf('jsdelivr') > -1) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
    return;
  }

  // App shell: stale-while-revalidate
  e.respondWith(
    caches.match(req).then(function (hit) {
      const net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});

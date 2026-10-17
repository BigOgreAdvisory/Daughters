/* Offline cache for Ale's Games. Bump VERSION on every deploy so phones pick up the new files.
   Caches are shared by the whole site, so only caches starting with PREFIX are ever touched here. */
const PREFIX = 'ale-';
const VERSION = 'ale-v1';
const FILES = ['./', './index.html', './ale.css', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './themes/fairy.js', './themes/ocean.js',
  './js/words.js', './js/engine.js', './js/spell.js', './js/family.js', './js/sight.js', './js/readpick.js', './js/warmup.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;          // never touch other origins
  e.respondWith(
    caches.open(VERSION).then(c => c.match(req, {ignoreSearch: true})).then(hit => hit || fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.open(VERSION).then(c => c.match('./index.html'))))
  );
});

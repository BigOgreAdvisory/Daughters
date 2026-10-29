/* Offline cache for Word Quest. Bump VERSION on every deploy so tablets pick up the new files.
   Caches are shared by the whole site, so only caches starting with PREFIX are ever touched here. */
const PREFIX = 'dolch-';
const VERSION = 'dolch-v3';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  '../shared/app.js', '../shared/app.css', '../shared/words.js', '../shared/fonts/andika.ttf', '../shared/fonts/andika-bold.ttf'];

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
  if(url.origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(c => c.match(req, {ignoreSearch: true})).then(hit => hit || fetch(req).then(res => {
      if(res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.open(VERSION).then(c => c.match('./index.html'))))
  );
});

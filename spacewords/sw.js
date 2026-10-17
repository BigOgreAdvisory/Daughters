/* Offline cache for Space Words (web version).
   Two caches:
     VERSION (spacewords-shell-vN): every page, script, style, font, picture and data file, listed in
       precache.json (tools/make-precache.mjs writes that file). Cache-first, so BUMP VERSION ON EVERY
       DEPLOY or phones keep showing the old files.
     AUDIO (spacewords-audio): the ~4,700 voice clips (about 60 MB). Not needed to install; a clip is
       cached the first time it plays, and pwa.js asks this worker to fetch all of them in the
       background so the whole voice works offline after the first few minutes online. Kept across
       versions (the clips rarely change); delete the cache from the browser's site settings to reset it.
   Only caches starting with PREFIX are ever touched, so this can share an origin with other apps. */
const PREFIX = 'spacewords-';
const VERSION = 'spacewords-shell-v1';
const AUDIO = 'spacewords-audio';
const SCOPE = new URL(self.registration.scope);

function key(url){ return url.origin + url.pathname; }   // cache by path: match.html?g=rhyme is match.html
function isAudio(url){ return /\/audio\/[^/]+\.mp3$/.test(url.pathname); }

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const list = await (await fetch('./precache.json', {cache: 'no-cache'})).json();
    const cache = await caches.open(VERSION);
    const files = ['./', './index.html', './manifest.webmanifest', './precache.json', ...list];
    // in batches: one addAll of 400 files fails outright if any one of them is missing
    for (let i = 0; i < files.length; i += 40) {
      await Promise.all(files.slice(i, i + 40).map(async f => {
        const url = new URL(f, SCOPE);
        const res = await fetch(url.href, {cache: 'no-cache'});
        if (res.ok) await cache.put(key(url), res);
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION && k !== AUDIO).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  e.respondWith(isAudio(url) ? serveAudio(url) : serveShell(req, url));
});

async function serveShell(req, url){
  const cache = await caches.open(VERSION);
  const hit = await cache.match(key(url));
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok && res.status === 200) cache.put(key(url), res.clone());
    return res;
  } catch (err) {
    if (req.mode === 'navigate') {
      const home = await cache.match(key(new URL('./index.html', SCOPE)));
      if (home) return home;
    }
    return new Response('Offline', {status: 503, statusText: 'Offline'});
  }
}

/* Media elements ask with a Range header; a cached full clip answers that fine. A miss fetches the
   whole clip (no Range, so the answer is a 200 that the cache will take) and keeps it. */
async function serveAudio(url){
  const cache = await caches.open(AUDIO);
  const k = key(url);
  const hit = await cache.match(k);
  if (hit) return hit;
  try {
    const res = await fetch(k);
    if (res.status === 200) cache.put(k, res.clone());
    return res;
  } catch (err) {
    return new Response('', {status: 503, statusText: 'Offline'});
  }
}

/* Background download of every clip, asked for by pwa.js on each page. Skips what is cached already,
   so it picks up where it left off if the browser stops the worker. */
let prefetching = null;
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'prefetch-audio') return;
  if (!prefetching) prefetching = prefetchAudio().catch(() => {}).then(() => { prefetching = null; });
  e.waitUntil(prefetching);
});

async function prefetchAudio(){
  const idx = new URL('./audio/index.json', SCOPE);
  const res = (await caches.match(key(idx))) || (await fetch(idx.href));
  if (!res || !res.ok) return;
  const keys = await res.clone().json();
  const cache = await caches.open(AUDIO);
  const have = new Set((await cache.keys()).map(r => r.url));
  const todo = keys.map(k => key(new URL('./audio/' + k + '.mp3', SCOPE))).filter(u => !have.has(u));
  let i = 0;
  async function worker(){
    while (i < todo.length) {
      const u = todo[i++];
      try {
        const r = await fetch(u);
        if (r.status === 200) await cache.put(u, r);
      } catch (err) { return; }   // offline: stop; the next page load tries again
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
}

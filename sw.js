/* Cleanup worker. The root page does NOT register a service worker.
   This file exists only because the first version of Ana's app was installed at the site root
   and registered a worker here. Browsers re-check this file, install this version, and it then
   removes the old root cache ('pl-*'), unregisters itself and reloads the page so the chooser shows.
   It never touches the 'ana-*' or 'ale-*' caches. */
const VERSION = 'root-cleanup-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('pl-')).map(k => caches.delete(k)));
    await self.registration.unregister();
    const wins = await self.clients.matchAll({type: 'window'});
    wins.forEach(w => { try{ w.navigate(w.url); }catch(_){} });
  })());
});

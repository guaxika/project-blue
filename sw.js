// Project Blue — service worker
// Sempre tenta a internet primeiro (assim as atualizações do site aparecem na hora);
// se estiver sem internet, abre a última versão guardada.
const CACHE = 'project-blue-v3';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return; // Supabase, tradutor e bibliotecas passam direto
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    }).catch(async () => (await caches.match(r)) || (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});

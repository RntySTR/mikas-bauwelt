// Mikas Bauwelt: startet auch ohne Internet. Die Spieldatei kommt frisch, wenn online; Bibliotheken und Schriften aus dem Zwischenspeicher.
const V = 'bauwelt-d5b43677fd';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin){
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { if (r.ok){ const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque'){ const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })));
  }
});

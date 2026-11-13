// Офлайн-кэш: страница — «сначала сеть», остальное — «сначала кэш»
const CACHE = 's201-v40';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('yandex.ru')) return;   // Метрика — мимо кэша
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isPage) {
    e.respondWith(fetch(req, {cache:'no-cache'}).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { if (res.ok && url.origin === location.origin) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })));
  }
});

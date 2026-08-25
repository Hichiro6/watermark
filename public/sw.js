// Service Worker — Cache pour fonctionnement hors-ligne
const CACHE_NAME = 'watermark-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/src/main.js',
  '/src/presets.js',
  '/src/image-handler.js',
  '/src/pdf-handler.js',
  '/manifest.json',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Stratégie : cache-first, fallback réseau
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Mettre en cache les nouvelles ressources
        if (response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback offline — retourner la page principale
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

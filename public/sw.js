// Service Worker for PWA
const CACHE_NAME = 'dario-caseificio-v1';
const urlsToCache = [
  '/',
  '/calendario',
  '/formaggi',
  '/produzioni',
  '/statistiche',
  '/frog-logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

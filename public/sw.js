// public/sw.js
// Service Worker for Uangku PWA

const CACHE_NAME = 'uangku-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/transactions',
  '/wallets',
  '/bills',
  '/budgets',
  '/goals',
  '/categories',
  '/profile',
  '/settings',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle dynamic Next.js chunks - cache them for offline access
  if (event.request.url.includes('_next/static/chunks')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // If cache hit, return cached response
          if (response) {
            return response;
          }
          // Otherwise fetch from network and cache it
          return fetch(event.request)
            .then((networkResponse) => {
              // Clone the response to store in cache
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return networkResponse;
            })
            .catch(() => {
              // If both cache and network fail, return error
              console.error('Failed to fetch chunk:', event.request.url);
              return new Response('Error loading chunk', { status: 500 });
            });
        })
    );
  }
  // Handle API requests specially - only cache successful responses
  else if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to use it in multiple places
          const responseToCache = response.clone();
          
          // Cache successful API responses for better performance
          if (response.ok) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If the network request fails, try to get from cache
          return caches.match(event.request);
        })
    );
  } else {
    // Handle static assets normally
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available, otherwise fetch from network
          if (response) {
            return response;
          }
          return fetch(event.request)
            .catch(() => {
              // For HTML pages, serve the main page when offline
              if (event.request.destination === 'document') {
                return caches.match('/');
              }
            });
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
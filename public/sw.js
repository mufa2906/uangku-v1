// public/sw.js
// Service Worker for Uangku PWA

const CACHE_NAME = 'uangku-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Simplified fetch handler to properly handle Next.js development and external requests
self.addEventListener('fetch', (event) => {
  // Skip processing for external resources (like Clerk, analytics, etc.)
  if (event.request.url.startsWith('http') && !event.request.url.includes(self.location.host)) {
    // For external requests, just fetch normally without caching
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Return the response as-is when online
          return response;
        })
        .catch(() => {
          // When offline, try to return the main page
          return caches.match('/')
            .then((response) => {
              return response || new Response(
                '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please reconnect to access the application.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        })
    );
  }
  // Handle authentication API requests specially - don't cache them
  else if (event.request.url.includes('/api/auth/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache auth responses to ensure fresh session data
          return response;
        })
        .catch(() => {
          // For auth requests when offline, return a specific response
          return new Response(
            JSON.stringify({ 
              user: null,
              session: null,
              error: 'OFFLINE',
              message: 'Currently in offline mode. Authentication will work when online.'
            }), 
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        })
    );
  }
  // Handle other API requests
  else if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to cache
          const responseToCache = response.clone();
          
          // Cache successful responses for non-auth API requests
          if (response.ok) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to return cached response
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // For API requests when offline, return appropriate response
              if (event.request.url.includes('/api/')) {
                return new Response(
                  JSON.stringify({ 
                    error: 'OFFLINE', 
                    message: 'Currently in offline mode. Data will sync when online.',
                    offline: true 
                  }), 
                  { 
                    status: 200, 
                    headers: { 'Content-Type': 'application/json' } 
                  }
                );
              }
              
              return new Response(
                JSON.stringify({ error: 'OFFLINE', message: 'No internet connection' }), 
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            });
        })
    );
  }
  // Handle all other requests (same origin)
  else {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // If found in cache, return it
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, fetch from network
          return fetch(event.request)
            .then((response) => {
              // If the response is valid and it's a GET request, cache it
              if (response.ok && event.request.method === 'GET') {
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }

              return response;
            })
            .catch(() => {
              // For assets that can't be fetched when offline
              const destination = event.request.destination;
              if (destination === 'image') {
                // Return a transparent 1x1 pixel gif for images
                return new Response('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', {
                  headers: { 'Content-Type': 'image/gif' }
                });
              }
              
              // For other resources when offline, return the main page to allow app to handle
              return caches.match('/');
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

// Push notification support
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let title = 'Uangku Notification';
  let options = {
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'uangku-notification'
  };
  
  // Handle different types of push notifications
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    options.body = data.body || options.body;
    options.icon = data.icon || options.icon;
    options.badge = data.badge || options.badge;
    options.tag = data.tag || options.tag;
    
    // Add click action if provided
    if (data.url) {
      options.data = {
        url: data.url
      };
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Redirect to URL if provided
  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If there's already a window open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
  // In a real implementation, you would re-subscribe the user to push notifications
});
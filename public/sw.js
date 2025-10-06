/**
 * Service Worker for caching static assets and images
 */

const CACHE_NAME = 'travel-showcase-v1';
const STATIC_CACHE = 'static-v1';
const IMAGE_CACHE = 'images-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/trips',
  '/favicon.svg',
  // Add other critical assets here
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== IMAGE_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }

              return fetch(request)
                .then((networkResponse) => {
                  // Only cache successful responses
                  if (networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Return a fallback image if available
                  return cache.match('/images/fallback.jpg');
                });
            });
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                // Serve from cache and update in background
                fetch(request)
                  .then((networkResponse) => {
                    if (networkResponse.status === 200) {
                      cache.put(request, networkResponse.clone());
                    }
                  })
                  .catch(() => {
                    // Network failed, but we have cache
                  });
                return cachedResponse;
              }

              // Not in cache, fetch from network
              return fetch(request)
                .then((networkResponse) => {
                  if (networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Return offline page if available
                  return cache.match('/offline.html');
                });
            });
        })
    );
    return;
  }

  // Handle other requests (CSS, JS, etc.)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses for static assets
            if (networkResponse.status === 200 && 
                (url.pathname.endsWith('.css') || 
                 url.pathname.endsWith('.js') || 
                 url.pathname.endsWith('.svg'))) {
              
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
            }
            
            return networkResponse;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    );
  }
});

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'travel-notification'
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
/* ===================================================================
   AgroGuard PWA - Enterprise Service Worker
   Offline First, Network-Resilient Strategy with Background Sync & Push
   =================================================================== */

const CACHE_VERSION = 'agroguard-v1.0.0';
const STATIC_CACHE = `agroguard-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `agroguard-dynamic-${CACHE_VERSION}`;
const API_CACHE = `agroguard-api-${CACHE_VERSION}`;

// Pre-cached core app shell assets
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/badge-72x72.png'
];

// 1. INSTALL LIFECYCLE
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[AgroGuard SW] Pre-caching core application shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    }).catch((err) => {
      console.warn('[AgroGuard SW] Pre-cache non-fatal error:', err);
    })
  );
});

// 2. ACTIVATE LIFECYCLE (Cleanup Old Caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE) {
            console.log('[AgroGuard SW] Deleting obsolete cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      console.log('[AgroGuard SW] Activated and claimed clients');
      return self.clients.claim();
    })
  );
});

// Helper to determine request type
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2|woff|ttf)$/) ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

function isApiRequest(url) {
  return url.port === '8000' || 
         url.pathname.startsWith('/api') ||
         url.pathname.includes('/farms') ||
         url.pathname.includes('/scans') ||
         url.pathname.includes('/weather') ||
         url.pathname.includes('/auth') ||
         url.pathname.includes('/dosage');
}

// 3. FETCH INTERCEPTION & CACHING STRATEGIES
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests for standard caching (Handle POST/PUT in sync queue)
  if (request.method !== 'GET') {
    return;
  }

  // Strategy A: Navigation Requests (HTML Pages) -> Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[AgroGuard SW] Network failed for navigation; checking cache');
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const indexResponse = await caches.match('/index.html');
          if (indexResponse) {
            return indexResponse;
          }
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Strategy B: API Requests -> Network-First with Local Cache Fallback
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[AgroGuard SW] API offline, serving cached payload:', url.pathname);
          const cachedData = await caches.match(request);
          if (cachedData) {
            return cachedData;
          }
          // Return structured offline JSON response
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Device is offline. Showing locally saved data.',
              timestamp: new Date().toISOString()
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200
            }
          );
        })
    );
    return;
  }

  // Strategy C: Static Assets -> Stale-While-Revalidate / Cache-First
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Asset offline; cachedResponse handles it
          });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default Fallback
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => caches.match('/offline.html'));
    })
  );
});

// 4. BACKGROUND SYNC (Offline Form Submissions & Notes)
self.addEventListener('sync', (event) => {
  console.log('[AgroGuard SW] Background Sync Triggered:', event.tag);
  if (event.tag === 'sync-offline-actions' || event.tag === 'agroguard-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'AGROGUARD_SYNC_REQUIRED',
            message: 'Network restored, syncing queued field actions...'
          });
        });
      })
    );
  }
});

// 5. PUSH NOTIFICATIONS (Spray Windows, Severe Weather, Harvest Alarms)
self.addEventListener('push', (event) => {
  let data = {
    title: 'AgroGuard Alert',
    body: 'Farm status update received.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'agroguard-alert',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    vibrate: [200, 100, 200, 100, 250],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: '👁️ Open AgroGuard' },
      { action: 'dismiss', title: '✖ Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 6. NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

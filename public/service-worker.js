/**
 * Service Worker for Dart Score Manager PWA
 */

const CACHE_NAME = 'dart-score-manager-v1';
const STATIC_CACHE_NAME = 'dart-score-manager-static-v1';
const DYNAMIC_CACHE_NAME = 'dart-score-manager-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/dart.svg',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/.*/,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Same origin requests
    if (url.pathname === '/') {
      // Homepage - serve from cache first
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    } else if (url.pathname.startsWith('/static/')) {
      // Static assets - serve from cache first
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      // API requests - network first with cache fallback
      event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    } else {
      // Other requests - network first
      event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    }
  } else {
    // Cross-origin requests - network first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    return new Response('Offline content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get stored offline actions
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/dart.svg',
    badge: '/dart.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/dart.svg',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/dart.svg',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Dart Score Manager', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_GAME_DATA') {
    event.waitUntil(cacheGameData(event.data.data));
  }
  
  if (event.data && event.data.type === 'GET_CACHED_GAME_DATA') {
    event.waitUntil(getCachedGameData().then(data => {
      event.ports[0].postMessage(data);
    }));
  }
});

// Cache game data
async function cacheGameData(gameData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(gameData), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put('/api/game-data', response);
    console.log('Game data cached successfully');
  } catch (error) {
    console.error('Failed to cache game data:', error);
  }
}

// Get cached game data
async function getCachedGameData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = await cache.match('/api/game-data');
    if (response) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached game data:', error);
    return null;
  }
}

// Store offline actions
async function storeOfflineAction(action) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const actions = await getOfflineActions();
    actions.push({ ...action, id: Date.now() });
    
    const response = new Response(JSON.stringify(actions), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    await cache.put('/api/offline-actions', response);
  } catch (error) {
    console.error('Failed to store offline action:', error);
  }
}

// Get offline actions
async function getOfflineActions() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = await cache.match('/api/offline-actions');
    if (response) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Failed to get offline actions:', error);
    return [];
  }
}

// Remove offline action
async function removeOfflineAction(actionId) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const actions = await getOfflineActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    
    const response = new Response(JSON.stringify(filteredActions), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    await cache.put('/api/offline-actions', response);
  } catch (error) {
    console.error('Failed to remove offline action:', error);
  }
}

// Process offline action
async function processOfflineAction(action) {
  // This would typically make the actual API call
  // For now, we'll just log it
  console.log('Processing offline action:', action);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, action };
}

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove old cached items (older than 7 days)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (responseDate < oneWeekAgo) {
            await cache.delete(request);
          }
        }
      }
    }
    
    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

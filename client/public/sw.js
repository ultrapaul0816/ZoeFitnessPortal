const CACHE_NAME = 'postpartum-recovery-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const FONT_CACHE = 'postpartum-fonts-v1';
const API_CACHE = 'postpartum-api-v1';

const CACHEABLE_API_ROUTES = [
  '/api/programs',
  '/api/courses'
];

const API_CACHE_DURATION = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name !== CACHE_NAME && 
            name !== FONT_CACHE && 
            name !== API_CACHE
          )
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  if (url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }
  
  if (url.pathname.startsWith('/api/')) {
    const isCacheable = CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route));
    
    if (isCacheable) {
      event.respondWith(
        caches.open(API_CACHE).then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseWithTimestamp = response.clone();
                cache.put(event.request, responseWithTimestamp);
              }
              return response;
            })
            .catch(() => {
              return cache.match(event.request);
            });
        })
      );
      return;
    }
    return;
  }
  
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.ok && url.origin === self.location.origin) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

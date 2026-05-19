// HomeFinance Service Worker
// Version: 1779172892
// Auto-updates when new version deployed

const CACHE_NAME = 'homefinance-v1779172892';
const URL_TO_CACHE = './HomeFinance.html';

// Install: cache the app
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(URL_TO_CACHE))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME)
        .map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim()) // take control immediately
  );
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', e => {
  if (!e.request.url.includes('HomeFinance.html')) return;
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Store fresh response in cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request)) // offline fallback
  );
});

// Listen for skip-waiting message
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

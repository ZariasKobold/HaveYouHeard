// HeardTale — Service Worker
// Version is injected from APP_VERSION in index.html via cache name
// Changing CACHE_VERSION busts the cache and triggers an update for all users

const CACHE_VERSION = 'heardtale-1.4.0';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install — cache the app shell, then skip waiting so update activates fast
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.allSettled(SHELL_ASSETS.map(url => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

// Activate — delete old caches, then claim all clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first for APIs, cache-first for app shell
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network-first for live data
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('api.themoviedb.org') ||
    url.hostname.includes('openlibrary.org') ||
    url.hostname.includes('api.rawg.io') ||
    url.hostname.includes('boardgamegeek.com')
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Network-first for HTML documents so updates are always picked up
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for everything else (fonts, scripts, icons)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Notify clients when a new version is available
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

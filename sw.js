// Have You Heard? — Service Worker
// Caches the app shell for fast loads and basic offline support

const CACHE_NAME = 'hyh-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install — cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can; don't fail install if external resources are unavailable
      return Promise.allSettled(
        SHELL_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
// Network-first for Supabase API calls, cache-first for app shell
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go network-first for Supabase and external APIs
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('api.themoviedb.org') ||
    url.hostname.includes('openlibrary.org') ||
    url.hostname.includes('api.rawg.io') ||
    url.hostname.includes('boardgamegeek.com')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return a simple offline JSON response for API calls
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Cache-first for everything else (app shell, fonts, scripts)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache valid responses for future use
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If we're offline and there's no cache, return the main page
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

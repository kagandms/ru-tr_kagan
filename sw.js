/**
 * Service Worker - Offline Desteği
 */

const CACHE_NAME = 'rutr-v17';
const ASSETS = [
    '/',
    '/index.html',
    '/kelimeler_tam.txt',
    '/sentences.json',
    '/css/style.css',
    '/js/app.js',
    '/js/data.js',
    '/js/favorites.js',
    '/js/goals.js',
    '/js/ai.js',
    '/js/flashcard.js',
    '/js/quiz.js',
    '/js/matching.js',
    '/js/hardwords.js',
    '/js/reversequiz.js',
    '/js/synonyms.js',
    '/js/daily.js',
    '/js/torfl.js',
    '/js/ielts.js',
    '/js/ielts_data.js',
    '/js/srs.js',
    '/js/tracker.js',
    '/js/stats.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install - Cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(fetchResponse => {
                    // Cache new resources
                    if (fetchResponse.status === 200) {
                        const responseClone = fetchResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return fetchResponse;
                });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});

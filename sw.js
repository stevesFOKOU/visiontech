// Vision Tech Service Worker - Ultra-Resilient v2
const CACHE_NAME = 'visiontech-cache-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.webmanifest',
    '/data/logo.jpeg',
    '/data/logo_watermark.png',
    '/data/icon-192.png',
    '/data/icon-512.png',
    '/data/favicon.png'
];

// Install: Cache critical core shell assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of STATIC_ASSETS) {
                try {
                    await cache.add(asset);
                } catch (e) {
                    // Silently ignore non-critical asset
                }
            }
        })
    );
});

// Activate: Purge ALL older caches and claim clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Helper: Network fetch with timeout (3.5 seconds)
function fetchWithTimeout(request, timeoutMs = 3500) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
        fetch(request)
            .then((response) => {
                clearTimeout(timer);
                resolve(response);
            })
            .catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

// Fetch: Secure handling that NEVER returns undefined
self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Ne pas intercepter les requêtes externes (CDNs, Google Fonts, extensions du navigateur)
    if (url.origin !== self.location.origin) {
        return;
    }

    // 1. Navigation (pages HTML)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetchWithTimeout(request, 3000)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Si le réseau traîne ou échoue, renvoyer la version en cache
                    const cached = await caches.match(request);
                    if (cached) return cached;

                    const indexCached = await caches.match('/index.html') || await caches.match('/');
                    if (indexCached) return indexCached;

                    // Fallback ultime propre
                    return new Response(
                        '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vision Tech</title><style>body{background:#0a1628;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px;}</style></head><body><div><h2 style="color:#f59e0b">Vision Tech</h2><p>Connexion lente. Chargement en cours...</p><button onclick="location.reload()" style="background:#f59e0b;color:#0a1628;border:none;padding:12px 24px;border-radius:8px;font-weight:bold;cursor:pointer;margin-top:10px;">Réessayer</button></div></body></html>',
                        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                })
        );
        return;
    }

    // 2. Fichiers statiques internes (CSS, JS, Images locales)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return networkResponse;
            }).catch(() => {
                return new Response('', { status: 404, statusText: 'Not Found' });
            });
        })
    );
});

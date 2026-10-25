
// Vision Tech - Service Worker v3
const CACHE_NAME = 'visiontech-cache-v3';

// Ressources essentielles à conserver sur le téléphone
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

// Pages principales à préparer pour une utilisation hors connexion
const HTML_PAGES = [
    '/electricite.html',
    '/climatisation.html',
    '/solaire.html',
    '/videosurveillance.html'
];

const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vision Tech - Hors connexion</title>
<style>
body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a1628;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
}
main { padding: 25px; }
h2 { color: #f59e0b; }
button {
    padding: 12px 22px;
    border: 0;
    border-radius: 8px;
    background: #f59e0b;
    color: #0a1628;
    font-weight: bold;
    cursor: pointer;
}
</style>
</head>
<body>
<main>
<h2>Vision Tech</h2>
<p>La connexion Internet est momentanément indisponible.</p>
<p>Vérifiez votre connexion puis réessayez.</p>
<button onclick="location.reload()">Réessayer</button>
</main>
</body>
</html>`;

// INSTALLATION
self.addEventListener('install', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // On tente chaque ressource sans bloquer
            // l'installation si un fichier est indisponible.
            await Promise.allSettled(
                [...STATIC_ASSETS, ...HTML_PAGES].map(async asset => {
                    const response = await fetch(asset);

                    if (response.ok) {
                        await cache.put(asset, response);
                    }
                })
            );

            await self.skipWaiting();
        })()
    );
});

// ACTIVATION
self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key =>
                        key.startsWith('visiontech-') &&
                        key !== CACHE_NAME
                    )
                    .map(key => caches.delete(key))
            );

            await self.clients.claim();
        })()
    );
});

// METTRE EN CACHE UNE RÉPONSE VALIDE
async function saveInCache(request, response) {
    if (!response || !response.ok) return;

    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
}

// RÉCUPÉRER UNE PAGE HTML
self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Ne pas intercepter les services externes
    if (url.origin !== self.location.origin) return;

    // STRATÉGIE 1 : PAGES HTML
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                const networkRequest = fetch(request)
                    .then(async response => {
                        if (response.ok) {
                            await saveInCache(request, response);
                        }
                        return response;
                    });

                // Le réseau dispose de 8 secondes pour répondre.
                // La requête continue en arrière-plan si le délai expire.
                const timeout = new Promise((_, reject) => {
                    setTimeout(
                        () => reject(new Error('Connexion trop lente')),
                        8000
                    );
                });

                try {
                    return await Promise.race([
                        networkRequest,
                        timeout
                    ]);
                } catch (error) {
                    // Version exacte déjà enregistrée
                    const cachedPage = await caches.match(request);

                    if (cachedPage) return cachedPage;

                    // Page d'accueil comme solution de secours
                    const home = await caches.match('/index.html');

                    if (home) return home;

                    // Dernier recours
                    return new Response(OFFLINE_PAGE, {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8'
                        }
                    });
                }
            })()
        );

        return;
    }

    // STRATÉGIE 2 : CSS, JS, IMAGES ET AUTRES RESSOURCES LOCALES
    event.respondWith(
        (async () => {
            const cached = await caches.match(request);

            const networkRequest = fetch(request)
                .then(async response => {
                    if (response.ok) {
                        await saveInCache(request, response);
                    }
                    return response;
                });

            // Une ressource déjà enregistrée est affichée immédiatement.
            if (cached) {
                event.waitUntil(
                    networkRequest.catch(() => { })
                );

                return cached;
            }

            // Si elle n'est pas encore en cache, on essaie Internet.
            try {
                return await networkRequest;
            } catch (error) {
                return new Response(
                    'Ressource temporairement indisponible.',
                    {
                        status: 503,
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8'
                        }
                    }
                );
            }
        })()
    );
});

// Service Worker para RDscore PWA
const CACHE_NAME = 'rdscore-v1.0.0';
const RUNTIME_CACHE = 'rdscore-runtime';
const API_CACHE = 'rdscore-api';

// Recursos críticos para cachear durante la instalación
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-cacheando recursos críticos');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        // Eliminar cachés antiguos
                        return cacheName !== CACHE_NAME &&
                            cacheName !== RUNTIME_CACHE &&
                            cacheName !== API_CACHE;
                    })
                    .map((cacheName) => {
                        console.log('[SW] Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia de caché para diferentes tipos de recursos
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests que no sean GET
    if (request.method !== 'GET') return;

    // Estrategia para API calls
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request, API_CACHE));
        return;
    }

    // Estrategia para assets estáticos
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
    ) {
        event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
        return;
    }

    // Estrategia para navegación (HTML)
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstStrategy(request, CACHE_NAME));
        return;
    }

    // Default: Network First
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

// Estrategia: Cache First (para assets estáticos)
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] Sirviendo desde caché:', request.url);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        // Cachear la respuesta si es exitosa
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Error en cacheFirstStrategy:', error);
        return new Response('Offline - Recurso no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia: Network First (para contenido dinámico)
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        // Cachear la respuesta si es exitosa
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network falló, intentando caché:', request.url);

        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Si es navegación y no hay caché, mostrar página offline
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) return offlinePage;
        }

        return new Response('Offline - Sin conexión', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// Sincronización en segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        // Aquí puedes sincronizar datos pendientes cuando vuelva la conexión
        console.log('[SW] Sincronizando datos...');
        // Implementar lógica de sincronización
    } catch (error) {
        console.error('[SW] Error en sincronización:', error);
    }
}

// Push Notifications (opcional para futuro)
self.addEventListener('push', (event) => {
    console.log('[SW] Push recibido:', event);

    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: '/logo-rdscore.png',
        badge: '/logo-rdscore.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('RDscore', options)
    );
});

console.log('[SW] Service Worker cargado correctamente');

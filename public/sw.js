/* eslint-env serviceworker */
/* eslint-disable no-console */
// Service Worker para FEBADOM PWA
const CACHE_NAME = 'febadom-v1.0.0';
const STATIC_CACHE_NAME = 'febadom-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'febadom-dynamic-v1.0.0';
const API_CACHE_NAME = 'febadom-api-v1.0.0';

// Recursos estáticos para cachear
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/players',
    '/games',
    '/teams',
    '/analysis/predictive',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/icon-72x72.svg',
    '/icons/icon-96x96.svg',
    '/icons/icon-128x128.svg',
    '/icons/icon-144x144.svg',
    '/icons/icon-152x152.svg',
    '/icons/icon-192x192.svg',
    '/icons/icon-384x384.svg',
    '/icons/icon-512x512.svg',
    // Fuentes y recursos críticos
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
];

// URLs de API para cachear (para uso futuro)
const _API_URLS = [
    '/api/players',
    '/api/games',
    '/api/teams',
    '/api/stats',
    '/api/predictions',
];

// URLs que siempre deben ir a la red
const NETWORK_ONLY = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/notifications/send',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker');

    event.waitUntil(
        Promise.all([
            // Cache de recursos estáticos
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Forzar activación inmediata
            self.skipWaiting()
        ])
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker');

    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (
                            cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName !== API_CACHE_NAME
                        ) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Tomar control inmediato
            self.clients.claim()
        ])
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo manejar requests HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }

    // Ignorar requests a dominios externos (excepto API del backend)
    if (url.origin !== self.location.origin && !url.origin.includes('localhost:8000')) {
        return;
    }

    // Network-only requests
    if (NETWORK_ONLY.some(pattern => request.url.includes(pattern))) {
        event.respondWith(fetch(request));
        return;
    }

    // Estrategias de cache según el tipo de recurso
    if (request.destination === 'document') {
        // HTML: Network First con fallback a cache
        event.respondWith(networkFirstStrategy(request));
    } else if (url.pathname.startsWith('/api/')) {
        // API: Cache First para datos, Network First para acciones
        if (request.method === 'GET') {
            event.respondWith(cacheFirstStrategy(request, API_CACHE_NAME));
        } else {
            event.respondWith(networkOnlyStrategy(request));
        }
    } else if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font'
    ) {
        // Recursos estáticos: Cache First
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
    } else {
        // Otros recursos: Stale While Revalidate
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

// Estrategia Network First
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback para páginas HTML
        if (request.destination === 'document') {
            return caches.match('/');
        }

        throw error;
    }
}

// Estrategia Cache First
async function cacheFirstStrategy(request, cacheName = DYNAMIC_CACHE_NAME) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Actualizar cache en background para APIs
        if (request.url.includes('/api/')) {
            fetch(request).then(response => {
                if (response.ok) {
                    const cache = caches.open(cacheName);
                    cache.then(c => c.put(request, response.clone()));
                }
            }).catch(() => {
                // Silenciar errores de background update
            });
        }

        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Para APIs, devolver datos offline si están disponibles
        if (request.url.includes('/api/')) {
            return new Response(
                JSON.stringify({
                    error: 'Offline',
                    message: 'Datos no disponibles sin conexión',
                    offline: true
                }),
                {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        throw error;
    }
}

// Estrategia Network Only
async function networkOnlyStrategy(request) {
    return fetch(request);
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidateStrategy(request) {
    const cachedResponse = await caches.match(request);

    const networkResponsePromise = fetch(request).then(async response => {
        if (response && response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            // Clonar antes de usar la respuesta
            await cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // Silenciar errores de red
        return null;
    });

    const result = cachedResponse || await networkResponsePromise;

    // Si no hay respuesta válida, retornar una respuesta de error
    if (!result) {
        return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    return result;
}

// Manejar notificaciones push
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    let notificationData = {
        title: 'FEBADOM',
        body: 'Nueva notificación',
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        tag: 'febadom-notification',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'Ver'
            },
            {
                action: 'dismiss',
                title: 'Descartar'
            }
        ],
        data: {
            url: '/dashboard',
            timestamp: Date.now()
        }
    };

    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('[SW] Error parsing push data:', error);
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');

    event.notification.close();

    const { action, data } = event;
    let url = data?.url || '/dashboard';

    switch (action) {
        case 'view':
            url = data?.url || '/dashboard';
            break;
        case 'dismiss':
            return; // No hacer nada, solo cerrar
        default:
            url = data?.url || '/dashboard';
            break;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Buscar ventana existente
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        url: url,
                        data: data
                    });
                    return;
                }
            }

            // Abrir nueva ventana si no hay ninguna
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed');

    // Opcional: enviar analytics sobre notificaciones cerradas
    const { data } = event.notification;
    if (data?.trackClose) {
        // Enviar evento de tracking
        fetch('/api/analytics/notification-close', {
            method: 'POST',
            body: JSON.stringify({
                notificationId: data.id,
                timestamp: Date.now()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(() => {
            // Silenciar errores de tracking
        });
    }
});

// Sincronización en background
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Función de sincronización en background
async function doBackgroundSync() {
    try {
        // Sincronizar datos pendientes
        const pendingData = await getStoredPendingData();

        for (const item of pendingData) {
            try {
                await fetch(item.url, {
                    method: item.method,
                    body: item.body,
                    headers: item.headers
                });

                // Remover de almacenamiento local si fue exitoso
                await removePendingData(item.id);
            } catch (error) {
                console.error('[SW] Failed to sync item:', item.id, error);
            }
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Funciones auxiliares para datos pendientes
async function getStoredPendingData() {
    // Implementar lógica para obtener datos pendientes del IndexedDB
    return [];
}

async function removePendingData(_id) {
    // Implementar lógica para remover datos del IndexedDB
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    const { type } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        default:
            console.log('[SW] Unknown message type:', type);
    }
});

// Limpiar todos los caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Logging de errores
self.addEventListener('error', (event) => {
    console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');
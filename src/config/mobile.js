/**
 * Configuración para funcionalidades móviles y PWA
 */

// Configuración PWA
export const PWA_CONFIG = {
    name: 'FEBADOM',
    shortName: 'FEBADOM',
    description: 'Sistema de análisis táctico y predictivo para la Selección Nacional de Baloncesto de la República Dominicana',
    themeColor: '#CE1126',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'portrait-primary',
    startUrl: '/',
    scope: '/',

    // Configuración de instalación
    installPrompt: {
        showAfter: 3000, // Mostrar después de 3 segundos
        showAgainAfter: 7 * 24 * 60 * 60 * 1000, // 7 días
        maxDismissals: 3, // Máximo 3 rechazos antes de no mostrar más
    },

    // Configuración de cache
    cache: {
        version: '1.0.0',
        staticCacheName: 'febadom-static-v1.0.0',
        dynamicCacheName: 'febadom-dynamic-v1.0.0',
        apiCacheName: 'febadom-api-v1.0.0',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        maxEntries: 100,
    },
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
    vapidPublicKey: process.env.REACT_APP_VAPID_PUBLIC_KEY ||
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmqmkNpQHC7WgXr1gYKQ0i5_-kCBhqsFS8qXH0I2JGOo',

    // Tipos de notificaciones
    types: {
        GAME_START: 'game_start',
        GAME_END: 'game_end',
        PLAYER_MILESTONE: 'player_milestone',
        TEAM_NEWS: 'team_news',
        PREDICTION_READY: 'prediction_ready',
        SYSTEM_UPDATE: 'system_update',
    },

    // Configuración por defecto
    defaultOptions: {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'view',
                title: 'Ver',
                icon: '/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Descartar',
                icon: '/icons/action-dismiss.png'
            }
        ],
    },

    // Configuración de solicitud de permisos
    permissionRequest: {
        showAfter: 30000, // 30 segundos después de cargar
        showOnActions: ['game_favorite', 'player_follow'], // Mostrar después de ciertas acciones
        maxAttempts: 2, // Máximo 2 intentos de solicitud
    },
};

// Configuración de gestos táctiles
export const GESTURE_CONFIG = {
    // Umbrales de detección
    swipeThreshold: 50, // Píxeles mínimos para detectar swipe
    tapThreshold: 10, // Píxeles máximos para detectar tap
    longPressDelay: 500, // Milisegundos para long press
    doubleTapDelay: 300, // Milisegundos entre taps para doble tap
    pinchThreshold: 10, // Diferencia mínima para detectar pinch

    // Configuración por componente
    components: {
        navigation: {
            swipeToOpen: true,
            swipeThreshold: 100,
            edgeSwipeWidth: 20, // Ancho del borde para swipe
        },

        cards: {
            swipeActions: true,
            swipeThreshold: 80,
            snapBack: true,
            snapBackDuration: 300,
        },

        carousel: {
            swipeNavigation: true,
            swipeThreshold: 30,
            momentum: true,
            loop: false,
        },

        pullToRefresh: {
            enabled: true,
            threshold: 80,
            resistance: 2.5,
            snapBackDuration: 300,
        },
    },
};

// Configuración offline
export const OFFLINE_CONFIG = {
    // Estrategias de cache
    strategies: {
        documents: 'networkFirst', // HTML
        assets: 'cacheFirst', // CSS, JS, imágenes
        api: 'networkFirst', // APIs
        images: 'cacheFirst', // Imágenes
    },

    // URLs que siempre van a la red
    networkOnly: [
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/refresh',
        '/api/notifications/send',
        '/api/analytics/track',
    ],

    // URLs que se cachean automáticamente
    precache: [
        '/',
        '/dashboard',
        '/players',
        '/games',
        '/teams',
        '/analysis/predictive',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
    ],

    // Configuración de sincronización
    sync: {
        backgroundSync: true,
        syncInterval: 30000, // 30 segundos
        maxRetries: 3,
        retryDelay: 5000, // 5 segundos
    },

    // Configuración de almacenamiento
    storage: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        maxEntries: 500,
        purgeOnQuotaError: true,
    },
};

// Configuración de dispositivos
export const DEVICE_CONFIG = {
    // Breakpoints
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280,
    },

    // Configuración por tipo de dispositivo
    mobile: {
        navigation: 'bottom',
        sidebar: 'overlay',
        density: 'comfortable',
        animations: 'reduced',
        virtualScrolling: false,
    },

    tablet: {
        navigation: 'side',
        sidebar: 'persistent',
        density: 'normal',
        animations: 'full',
        virtualScrolling: true,
    },

    desktop: {
        navigation: 'side',
        sidebar: 'persistent',
        density: 'compact',
        animations: 'full',
        virtualScrolling: true,
    },

    // Configuración de rendimiento por dispositivo
    performance: {
        mobile: {
            maxConcurrentRequests: 2,
            imageQuality: 70,
            debounceDelay: 400,
            throttleDelay: 32,
        },
        tablet: {
            maxConcurrentRequests: 4,
            imageQuality: 80,
            debounceDelay: 300,
            throttleDelay: 16,
        },
        desktop: {
            maxConcurrentRequests: 6,
            imageQuality: 90,
            debounceDelay: 250,
            throttleDelay: 16,
        },
    },
};

// Configuración de accesibilidad móvil
export const ACCESSIBILITY_CONFIG = {
    // Configuración de focus
    focus: {
        trapInModals: true,
        highlightOnTouch: true,
        skipLinks: true,
    },

    // Configuración de gestos
    gestures: {
        alternativeInputs: true, // Proporcionar alternativas a gestos
        gestureHints: true, // Mostrar pistas de gestos
        customGestures: false, // Permitir gestos personalizados
    },

    // Configuración de texto
    text: {
        minSize: 16, // Tamaño mínimo para evitar zoom en iOS
        scalable: true, // Permitir escalado de texto
        highContrast: 'auto', // Soporte para alto contraste
    },

    // Configuración de animaciones
    animations: {
        respectReducedMotion: true,
        providePauseControls: true,
        maxDuration: 500, // Máximo 500ms para animaciones
    },
};

// Función para obtener configuración según el dispositivo
export const getDeviceConfig = () => {
    const width = window.innerWidth;
    const isMobile = width < DEVICE_CONFIG.breakpoints.mobile;
    const isTablet = width >= DEVICE_CONFIG.breakpoints.mobile && width < DEVICE_CONFIG.breakpoints.desktop;

    if (isMobile) return DEVICE_CONFIG.mobile;
    if (isTablet) return DEVICE_CONFIG.tablet;
    return DEVICE_CONFIG.desktop;
};

// Función para detectar capacidades del dispositivo
export const getDeviceCapabilities = () => {
    return {
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        online: navigator.onLine,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notifications: 'Notification' in window,
        geolocation: 'geolocation' in navigator,
        camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        vibration: 'vibrate' in navigator,
        battery: 'getBattery' in navigator,
        connection: 'connection' in navigator,
        deviceMemory: 'deviceMemory' in navigator,
        hardwareConcurrency: 'hardwareConcurrency' in navigator,
    };
};

export default {
    PWA_CONFIG,
    NOTIFICATION_CONFIG,
    GESTURE_CONFIG,
    OFFLINE_CONFIG,
    DEVICE_CONFIG,
    ACCESSIBILITY_CONFIG,
    getDeviceConfig,
    getDeviceCapabilities,
};
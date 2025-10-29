/**
 * Configuración de rendimiento para componentes avanzados
 */

// Configuración de debounce para diferentes tipos de input
export const DEBOUNCE_DELAYS = {
    search: 300,
    filter: 250,
    validation: 500,
    autoSave: 2000,
    resize: 100,
    scroll: 16,
};

// Configuración de throttle
export const THROTTLE_DELAYS = {
    scroll: 16,
    resize: 100,
    mousemove: 16,
    animation: 16,
};

// Configuración de virtualización
export const VIRTUALIZATION_CONFIG = {
    table: {
        itemHeight: 50,
        overscan: 5,
        threshold: 100, // Activar virtualización con más de 100 elementos
    },
    list: {
        itemHeight: 60,
        overscan: 3,
        threshold: 50,
    },
    grid: {
        itemHeight: 200,
        itemWidth: 250,
        overscan: 2,
        threshold: 20,
    },
};

// Configuración de lazy loading
export const LAZY_LOADING_CONFIG = {
    intersection: {
        threshold: 0.1,
        rootMargin: '50px',
    },
    image: {
        threshold: 0.1,
        rootMargin: '100px',
    },
    component: {
        threshold: 0.1,
        rootMargin: '200px',
    },
};

// Configuración de cache
export const CACHE_CONFIG = {
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutos
    cleanupInterval: 60 * 1000, // 1 minuto
};

// Configuración de memoización
export const MEMO_CONFIG = {
    // Componentes que siempre deben ser memoizados
    alwaysMemo: [
        'AdvancedDataTable',
        'MultiStepForm',
        'DragDropList',
        'Tooltip',
    ],
    // Componentes que solo se memorizan bajo ciertas condiciones
    conditionalMemo: {
        'TableRow': { threshold: 50 }, // Memoizar si hay más de 50 filas
        'FormField': { threshold: 10 }, // Memoizar si hay más de 10 campos
        'ListItem': { threshold: 20 }, // Memoizar si hay más de 20 elementos
    },
};

// Configuración de bundle splitting
export const BUNDLE_CONFIG = {
    // Componentes que deben cargarse de forma lazy
    lazyComponents: [
        'AdvancedDataTable',
        'MultiStepForm',
        'DragDropList',
        'FilterPanel',
        'BulkActions',
    ],
    // Componentes críticos que se cargan inmediatamente
    criticalComponents: [
        'Tooltip',
        'Button',
        'Input',
        'Modal',
    ],
    // Preload de componentes basado en rutas
    routePreloads: {
        '/dashboard': ['AdvancedDataTable'],
        '/forms': ['MultiStepForm'],
        '/lists': ['DragDropList'],
    },
};

// Configuración de optimización de imágenes
export const IMAGE_CONFIG = {
    formats: ['webp', 'avif', 'jpg'],
    sizes: [320, 640, 768, 1024, 1280, 1920],
    quality: 80,
    placeholder: 'blur',
    loading: 'lazy',
};

// Configuración de Web Workers
export const WORKER_CONFIG = {
    // Tareas que pueden ejecutarse en Web Workers
    workerTasks: [
        'dataProcessing',
        'csvExport',
        'imageProcessing',
        'calculations',
    ],
    maxWorkers: navigator.hardwareConcurrency || 4,
};

// Configuración de Service Worker
export const SW_CONFIG = {
    cacheStrategies: {
        static: 'CacheFirst',
        api: 'NetworkFirst',
        images: 'CacheFirst',
        fonts: 'CacheFirst',
    },
    cacheTTL: {
        static: 365 * 24 * 60 * 60 * 1000, // 1 año
        api: 5 * 60 * 1000, // 5 minutos
        images: 30 * 24 * 60 * 60 * 1000, // 30 días
        fonts: 365 * 24 * 60 * 60 * 1000, // 1 año
    },
};

// Configuración de métricas de rendimiento
export const METRICS_CONFIG = {
    // Core Web Vitals thresholds
    thresholds: {
        LCP: 2500, // Largest Contentful Paint
        FID: 100,  // First Input Delay
        CLS: 0.1,  // Cumulative Layout Shift
        FCP: 1800, // First Contentful Paint
        TTI: 3800, // Time to Interactive
    },
    // Métricas personalizadas
    customMetrics: {
        tableRenderTime: 500,
        formValidationTime: 100,
        searchResponseTime: 300,
        exportTime: 5000,
    },
    // Sampling rate para métricas
    sampleRate: 0.1, // 10% de las sesiones
};

// Configuración de optimización por dispositivo
export const DEVICE_CONFIG = {
    mobile: {
        maxConcurrentRequests: 2,
        imageQuality: 70,
        enableVirtualization: true,
        debounceDelay: 400,
        throttleDelay: 32,
    },
    tablet: {
        maxConcurrentRequests: 4,
        imageQuality: 80,
        enableVirtualization: true,
        debounceDelay: 300,
        throttleDelay: 16,
    },
    desktop: {
        maxConcurrentRequests: 6,
        imageQuality: 90,
        enableVirtualization: false,
        debounceDelay: 250,
        throttleDelay: 16,
    },
};

// Configuración de optimización de red
export const NETWORK_CONFIG = {
    slow3g: {
        maxConcurrentRequests: 1,
        imageQuality: 60,
        enablePrefetch: false,
        enablePreload: false,
    },
    '4g': {
        maxConcurrentRequests: 4,
        imageQuality: 80,
        enablePrefetch: true,
        enablePreload: true,
    },
    wifi: {
        maxConcurrentRequests: 8,
        imageQuality: 90,
        enablePrefetch: true,
        enablePreload: true,
    },
};

// Función para obtener configuración basada en el dispositivo
export const getDeviceConfig = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent) && !isMobile;

    if (isMobile) return DEVICE_CONFIG.mobile;
    if (isTablet) return DEVICE_CONFIG.tablet;
    return DEVICE_CONFIG.desktop;
};

// Función para obtener configuración basada en la conexión
export const getNetworkConfig = () => {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;

        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                return NETWORK_CONFIG.slow3g;
            case '3g':
                return NETWORK_CONFIG.slow3g;
            case '4g':
                return NETWORK_CONFIG['4g'];
            default:
                return NETWORK_CONFIG.wifi;
        }
    }

    return NETWORK_CONFIG.wifi;
};

// Función para obtener configuración optimizada
export const getOptimizedConfig = () => {
    const deviceConfig = getDeviceConfig();
    const networkConfig = getNetworkConfig();

    return {
        ...deviceConfig,
        ...networkConfig,
        debounceDelays: {
            ...DEBOUNCE_DELAYS,
            search: Math.max(DEBOUNCE_DELAYS.search, deviceConfig.debounceDelay),
            filter: Math.max(DEBOUNCE_DELAYS.filter, deviceConfig.debounceDelay),
        },
        throttleDelays: {
            ...THROTTLE_DELAYS,
            scroll: Math.max(THROTTLE_DELAYS.scroll, deviceConfig.throttleDelay),
            resize: Math.max(THROTTLE_DELAYS.resize, deviceConfig.throttleDelay),
        },
    };
};

export default {
    DEBOUNCE_DELAYS,
    THROTTLE_DELAYS,
    VIRTUALIZATION_CONFIG,
    LAZY_LOADING_CONFIG,
    CACHE_CONFIG,
    MEMO_CONFIG,
    BUNDLE_CONFIG,
    IMAGE_CONFIG,
    WORKER_CONFIG,
    SW_CONFIG,
    METRICS_CONFIG,
    DEVICE_CONFIG,
    NETWORK_CONFIG,
    getDeviceConfig,
    getNetworkConfig,
    getOptimizedConfig,
};
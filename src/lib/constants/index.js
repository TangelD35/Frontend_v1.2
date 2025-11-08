// Configuración centralizada de la aplicación
export const config = {
    // URLs de servicios
    api: {
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
        timeout: 30000,
    },

    websocket: {
        url: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
        reconnectAttempts: parseInt(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS) || 5,
        reconnectDelay: parseInt(import.meta.env.VITE_WS_RECONNECT_DELAY) || 1000,
    },

    // Información de la aplicación
    app: {
        name: import.meta.env.VITE_APP_NAME || 'BasktscoreRD',
        version: import.meta.env.VITE_APP_VERSION || '2.0',
        debug: import.meta.env.VITE_DEBUG === 'true',
        isDevelopment: import.meta.env.DEV,
        isProduction: import.meta.env.PROD,
    },

    // Configuración de autenticación
    auth: {
        tokenKey: 'token',
        jwtExpiry: parseInt(import.meta.env.VITE_JWT_EXPIRY) || 3600,
    },

    // Configuración de uploads
    upload: {
        maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
        allowedTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['.csv', '.xlsx', '.xls', '.json'],
    },

    // Configuración de análisis predictivo
    prediction: {
        confidenceThreshold: parseFloat(import.meta.env.VITE_PREDICTION_CONFIDENCE_THRESHOLD) || 0.7,
        maxSimulationIterations: parseInt(import.meta.env.VITE_MAX_SIMULATION_ITERATIONS) || 10000,
    },

    // Configuración de exportación
    export: {
        defaultFormat: import.meta.env.VITE_DEFAULT_EXPORT_FORMAT || 'pdf',
        quality: import.meta.env.VITE_EXPORT_QUALITY || 'high',
    },

    // Configuración de dashboard
    dashboard: {
        defaultRefreshInterval: 5000,
        maxWidgets: 20,
        autoSave: true,
        gridSnap: true,
    },

    // Configuración de logging
    logging: {
        level: import.meta.env.VITE_LOG_LEVEL || 'info',
        enableApiLogs: import.meta.env.DEV,
        enableWebSocketLogs: import.meta.env.DEV,
    },
};

// Función para obtener configuración específica
export const getConfig = (path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], config);
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => config.app.isDevelopment;

// Función para verificar si estamos en producción
export const isProduction = () => config.app.isProduction;

// Función para obtener la URL base de la API
export const getApiBaseURL = () => config.api.baseURL;

// Función para obtener la URL del WebSocket
export const getWebSocketURL = () => config.websocket.url;

// Re-exportar constantes de app.js
export {
    APP_INFO,
    NAVIGATION_ITEMS,
    SYSTEM_STATS,
    USER_ROLES,
    ROLE_OPTIONS,
    DEMO_CREDENTIALS,
    VALIDATION_RULES,
    ERROR_MESSAGES
} from './app';

// Exportar configuración por defecto
export default config;
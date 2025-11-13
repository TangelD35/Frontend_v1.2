// Configuración de la aplicación BasktAPI
export const config = {
    // Configuración de la API
    api: {
        baseURL: 'http://localhost:8000',
        timeout: 30000, // 30 segundos
    },
    
    // Configuración de autenticación
    auth: {
        tokenKey: 'basketscore_token',
        refreshTokenKey: 'basketscore_refresh_token',
        userKey: 'basketscore_user',
    },
    
    // Configuración de logging
    logging: {
        enableApiLogs: process.env.NODE_ENV === 'development',
        enablePerformanceLogs: process.env.NODE_ENV === 'development',
        logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    },
    
    // Configuración de la aplicación
    app: {
        name: 'BasketscoreRD',
        version: '1.0.0',
        description: 'Sistema de Análisis Táctico • Selección Nacional RD',
        defaultLanguage: 'es',
        supportedLanguages: ['es', 'en'],
    },
    
    // Configuración de UI
    ui: {
        theme: {
            default: 'light',
            storageKey: 'basketscore_theme',
        },
        colors: {
            primary: {
                red: '#CE1126',    // Rojo dominicano
                blue: '#002D62',   // Azul dominicano
            },
            secondary: {
                gray: '#6B7280',
                lightGray: '#F3F4F6',
                darkGray: '#374151',
            }
        },
        animations: {
            duration: {
                fast: 150,
                normal: 300,
                slow: 500,
            },
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }
    },
    
    // Configuración de paginación
    pagination: {
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        maxPageSize: 100,
    },
    
    // Configuración de archivos
    files: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        uploadEndpoint: '/api/v1/upload',
    },
    
    // URLs externas
    external: {
        fiba: 'https://www.fiba.basketball',
        fedombal: 'https://fedombal.com',
        documentation: 'https://docs.basketscore.do',
    }
};

// Constantes de la aplicación
export const APP_CONSTANTS = {
    // Roles de usuario
    USER_ROLES: {
        ADMIN: 'admin',
        COACH: 'coach',
        ANALYST: 'analyst',
        VIEWER: 'viewer',
    },
    
    // Estados de partidos
    GAME_STATUS: {
        SCHEDULED: 'scheduled',
        LIVE: 'live',
        FINISHED: 'finished',
        CANCELLED: 'cancelled',
        POSTPONED: 'postponed',
    },
    
    // Tipos de torneos
    TOURNAMENT_TYPES: {
        FIBA_WORLD_CUP: 'fiba_world_cup',
        FIBA_AMERICAS: 'fiba_americas',
        CENTROBASKET: 'centrobasket',
        QUALIFIERS: 'qualifiers',
        FRIENDLY: 'friendly',
    },
    
    // Posiciones de jugadores
    PLAYER_POSITIONS: {
        PG: 'Point Guard',
        SG: 'Shooting Guard', 
        SF: 'Small Forward',
        PF: 'Power Forward',
        C: 'Center',
    },
    
    // Tipos de estadísticas
    STAT_TYPES: {
        BASIC: 'basic',
        ADVANCED: 'advanced',
        SHOOTING: 'shooting',
        DEFENSIVE: 'defensive',
    },
    
    // Filtros de tiempo
    TIME_FILTERS: {
        ALL_TIME: 'all_time',
        LAST_YEAR: 'last_year',
        LAST_TOURNAMENT: 'last_tournament',
        CUSTOM: 'custom',
    }
};

// Configuración de desarrollo
export const DEV_CONFIG = {
    enableMockData: false,
    enableDebugMode: process.env.NODE_ENV === 'development',
    showPerformanceMetrics: process.env.NODE_ENV === 'development',
    logApiCalls: process.env.NODE_ENV === 'development',
};

export default config;

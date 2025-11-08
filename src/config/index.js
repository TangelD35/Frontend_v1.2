/**
 * @deprecated Este archivo se mantiene solo para compatibilidad.
 * Por favor, usa '../lib/constants' en su lugar.
 * 
 * Este archivo re-exporta todo desde lib/constants para mantener
 * compatibilidad con código existente que pueda importar desde aquí.
 */

// Re-exportar todo desde lib/constants
export {
    config,
    getConfig,
    isDevelopment,
    isProduction,
    getApiBaseURL,
    getWebSocketURL,
    APP_INFO,
    NAVIGATION_ITEMS,
    SYSTEM_STATS,
    USER_ROLES,
    ROLE_OPTIONS,
    DEMO_CREDENTIALS,
    VALIDATION_RULES,
    ERROR_MESSAGES
} from '../lib/constants';

// Re-exportar como default para compatibilidad
export { config as default } from '../lib/constants';
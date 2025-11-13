/**
 * Logger centralizado para la aplicación
 * 
 * Este módulo proporciona un sistema de logging consistente que:
 * - Solo loguea en desarrollo (o cuando está explícitamente habilitado)
 * - Proporciona diferentes niveles de log (debug, info, warn, error)
 * - Formatea los mensajes de manera consistente
 * - Puede ser fácilmente extendido para enviar logs a servicios externos
 */

import { config } from '../../lib/constants/index';

/**
 * Niveles de log disponibles
 */
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4,
};

/**
 * Mapeo de niveles de log a nombres
 */
const levelNames = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
};

/**
 * Mapeo de niveles de log a emojis
 */
const levelEmojis = {
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.ERROR]: '❌',
};

/**
 * Mapeo de strings a niveles de log
 */
const levelMap = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR,
    none: LogLevel.NONE,
};

/**
 * Obtener el nivel de log actual desde la configuración
 */
const getCurrentLogLevel = () => {
    const configLevel = config.logging?.level || 'info';
    return levelMap[configLevel.toLowerCase()] ?? LogLevel.INFO;
};

/**
 * Verificar si el logging está habilitado
 */
const isLoggingEnabled = (level) => {
    // En producción, solo loguear errores y warnings
    if (config.app.isProduction) {
        return level >= LogLevel.WARN;
    }

    // En desarrollo, respetar el nivel configurado
    const currentLevel = getCurrentLogLevel();
    return level >= currentLevel;
};

/**
 * Formatear mensaje de log
 */
const formatMessage = (level, context, message, ...args) => {
    const timestamp = new Date().toISOString();
    const levelName = levelNames[level];
    const emoji = levelEmojis[level];
    const contextStr = context ? `[${context}]` : '';

    return {
        timestamp,
        level: levelName,
        emoji,
        context: contextStr,
        message,
        args: args.length > 0 ? args : undefined,
    };
};

/**
 * Logger principal
 */
class Logger {
    constructor(context = 'App') {
        this.context = context;
    }

    /**
     * Crear un logger con un contexto específico
     */
    create(context) {
        return new Logger(context);
    }

    /**
     * Log de debug
     */
    debug(message, ...args) {
        if (isLoggingEnabled(LogLevel.DEBUG)) {
            const formatted = formatMessage(LogLevel.DEBUG, this.context, message, ...args);
            console.debug(
                `${formatted.emoji} ${formatted.context} ${formatted.message}`,
                ...(formatted.args || [])
            );
        }
    }

    /**
     * Log de información
     */
    info(message, ...args) {
        if (isLoggingEnabled(LogLevel.INFO)) {
            const formatted = formatMessage(LogLevel.INFO, this.context, message, ...args);
            console.info(
                `${formatted.emoji} ${formatted.context} ${formatted.message}`,
                ...(formatted.args || [])
            );
        }
    }

    /**
     * Log de advertencia
     */
    warn(message, ...args) {
        if (isLoggingEnabled(LogLevel.WARN)) {
            const formatted = formatMessage(LogLevel.WARN, this.context, message, ...args);
            console.warn(
                `${formatted.emoji} ${formatted.context} ${formatted.message}`,
                ...(formatted.args || [])
            );
        }
    }

    /**
     * Log de error
     */
    error(message, error = null, ...args) {
        if (isLoggingEnabled(LogLevel.ERROR)) {
            const formatted = formatMessage(LogLevel.ERROR, this.context, message, ...args);
            console.error(
                `${formatted.emoji} ${formatted.context} ${formatted.message}`,
                ...(formatted.args || []),
                error || ''
            );

            // En producción, podrías enviar errores a un servicio de tracking
            if (config.app.isProduction && error) {
                // TODO: Integrar con servicio de error tracking (Sentry, LogRocket, etc.)
                // trackError(error, { context: this.context, message });
            }
        }
    }

    /**
     * Log de grupo (para agrupar logs relacionados)
     */
    group(label) {
        if (isLoggingEnabled(LogLevel.DEBUG)) {
            console.group(`${this.context}: ${label}`);
        }
    }

    /**
     * Cerrar grupo
     */
    groupEnd() {
        if (isLoggingEnabled(LogLevel.DEBUG)) {
            console.groupEnd();
        }
    }

    /**
     * Log de tabla (útil para objetos/arrays)
     */
    table(data) {
        if (isLoggingEnabled(LogLevel.DEBUG)) {
            console.table(data);
        }
    }

    /**
     * Log de tiempo (para medir performance)
     */
    time(label) {
        if (isLoggingEnabled(LogLevel.DEBUG)) {
            console.time(`${this.context}: ${label}`);
        }
    }

    /**
     * Finalizar log de tiempo
     */
    timeEnd(label) {
        if (isLoggingEnabled(LogLevel.DEBUG)) {
            console.timeEnd(`${this.context}: ${label}`);
        }
    }
}

// Instancia por defecto
const defaultLogger = new Logger();

// Exportar instancia por defecto y clase
export default defaultLogger;
export { Logger };

// Funciones de conveniencia
export const log = {
    debug: (message, ...args) => defaultLogger.debug(message, ...args),
    info: (message, ...args) => defaultLogger.info(message, ...args),
    warn: (message, ...args) => defaultLogger.warn(message, ...args),
    error: (message, error, ...args) => defaultLogger.error(message, error, ...args),
    create: (context) => new Logger(context),
};


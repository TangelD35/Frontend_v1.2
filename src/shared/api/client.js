import axios from 'axios';
import { config as appConfig } from '../../lib/constants';

import logger from '../utils/logger';

// Configuración base del cliente API
const apiClient = axios.create({
    baseURL: `${appConfig.api.baseURL}/api/v1`,
    timeout: appConfig.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests
apiClient.interceptors.request.use(
    (config) => {
        // Agregar token de autenticación si existe
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log de requests en desarrollo
        if (appConfig.logging?.enableApiLogs) {
            logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params
            });
        }

        return config;
    },
    (error) => {
        logger.error('Request Error', error);
        return Promise.reject(error);
    }
);

// Interceptor para responses
apiClient.interceptors.response.use(
    (response) => {
        // Log de responses en desarrollo
        if (appConfig.logging?.enableApiLogs) {
            logger.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data
            });
        }

        return response;
    },
    (error) => {
        // Manejo de errores globales
        if (error.response) {
            // El servidor respondió con un código de error
            const { status, data } = error.response;

            logger.error(`API Error ${status}`, null, data);

            // Manejo específico de errores
            switch (status) {
                case 401:
                    // Token expirado o credenciales inválidas
                    logger.warn('Token expirado o no válido');
                    localStorage.removeItem(appConfig.auth.tokenKey || 'token');

                    // Evitar redirección automática para endpoints de autenticación
                    const requestUrl = error.config?.url || '';
                    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/me'].some(endpoint => requestUrl.includes(endpoint));
                    const currentPath = window.location.pathname;
                    const isAlreadyOnLogin = currentPath === '/login' || currentPath === '/';

                    if (!isAuthEndpoint && !isAlreadyOnLogin) {
                        logger.info('Redirecting to login due to 401 error');
                        window.location.href = '/login';
                    } else {
                        logger.info('Skipping redirect - already on login page or auth endpoint');
                    }
                    break;
                case 403:
                    logger.warn('Acceso denegado');
                    break;
                case 404:
                    logger.warn('Recurso no encontrado');
                    break;
                case 409:
                    // Conflict - usuario o recurso ya existe
                    logger.warn('Conflicto: recurso ya existe', null, data.detail || data.message);
                    break;
                case 422:
                    logger.warn('Error de validación', null, data.errors || data.message);
                    break;
                case 500:
                    logger.error('Error interno del servidor');
                    break;
                default:
                    logger.error('Error desconocido', null, data.message || 'Error en la comunicación con el servidor');
            }

            // Retornar error estructurado preservando toda la información del error original
            return Promise.reject({
                response: {
                    status,
                    data: data, // Preservar data completa para que authStore pueda acceder a detail
                    ...error.response
                },
                status,
                message: data.message || data.detail || 'Error en la comunicación con el servidor',
                detail: data.detail || data.message, // Preservar detail para errores 409
                errors: data.errors || null,
                originalError: error
            });
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            logger.error('Network Error', error);
            return Promise.reject({
                status: 0,
                message: 'Error de conexión. Verifica tu conexión a internet.',
                originalError: error
            });
        } else {
            // Algo pasó al configurar la petición
            logger.error('Request Setup Error', error);
            return Promise.reject({
                status: -1,
                message: error.message,
                originalError: error
            });
        }
    }
);

// Métodos de conveniencia
export const api = {
    // GET request
    get: (url, config = {}) => apiClient.get(url, config),

    // POST request
    post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

    // PUT request
    put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

    // PATCH request
    patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

    // DELETE request
    delete: (url, config = {}) => apiClient.delete(url, config),

    // Upload file
    upload: (url, formData, onUploadProgress = null) => {
        return apiClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onUploadProgress ? (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onUploadProgress(progress);
            } : undefined,
        });
    },

    // Download file
    download: (url, filename = null) => {
        return apiClient.get(url, {
            responseType: 'blob',
        }).then(response => {
            // Crear URL para descarga
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);

            if (filename) {
                // Descargar automáticamente
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(downloadUrl);
            }

            return {
                blob,
                downloadUrl,
                filename: filename || 'download'
            };
        });
    }
};

// Configuración de autenticación
export const setAuthToken = (token) => {
    const tokenKey = appConfig.auth.tokenKey || 'token';
    if (token) {
        localStorage.setItem(tokenKey, token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem(tokenKey);
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Obtener token actual
export const getAuthToken = () => {
    return localStorage.getItem(appConfig.auth.tokenKey || 'token');
};

// Verificar si está autenticado
export const isAuthenticated = () => {
    return !!getAuthToken();
};

// Configurar base URL dinámicamente
export const setBaseURL = (baseURL) => {
    apiClient.defaults.baseURL = baseURL;
};

// Obtener configuración actual
export const getConfig = () => {
    return {
        baseURL: apiClient.defaults.baseURL,
        timeout: apiClient.defaults.timeout,
        headers: apiClient.defaults.headers
    };
};

export default apiClient;
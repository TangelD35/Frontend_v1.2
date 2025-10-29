import axios from 'axios';
import { config as appConfig } from '../../lib/constants';

// Configuración base del cliente API
const apiClient = axios.create({
    baseURL: appConfig.api.baseURL,
    timeout: appConfig.api.timeout,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests
apiClient.interceptors.request.use(
    (config) => {
        // Agregar token de autenticación si existe
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log de requests en desarrollo
        if (appConfig.logging?.enableApiLogs) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para responses
apiClient.interceptors.response.use(
    (response) => {
        // Log de responses en desarrollo
        if (appConfig.logging?.enableApiLogs) {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
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

            console.error(`❌ API Error ${status}:`, data);

            // Manejo específico de errores
            switch (status) {
                case 401:
                    // Token expirado o no válido
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('Acceso denegado');
                    break;
                case 404:
                    console.error('Recurso no encontrado');
                    break;
                case 422:
                    console.error('Error de validación:', data.errors || data.message);
                    break;
                case 500:
                    console.error('Error interno del servidor');
                    break;
                default:
                    console.error('Error desconocido:', data.message || 'Error en la comunicación con el servidor');
            }

            // Retornar error estructurado
            return Promise.reject({
                status,
                message: data.message || 'Error en la comunicación con el servidor',
                errors: data.errors || null,
                originalError: error
            });
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('❌ Network Error:', error.request);
            return Promise.reject({
                status: 0,
                message: 'Error de conexión. Verifica tu conexión a internet.',
                originalError: error
            });
        } else {
            // Algo pasó al configurar la petición
            console.error('❌ Request Setup Error:', error.message);
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
    if (token) {
        localStorage.setItem('authToken', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Obtener token actual
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
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
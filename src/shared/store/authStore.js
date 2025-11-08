import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../api/endpoints/auth';
import logger from '../utils/logger';

const useAuthStore = create(
    persist(
        (set, get) => {
            // Inicializar desde localStorage si existe
            const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            return {
            user: null,
                token: initialToken,
                isAuthenticated: !!initialToken,
            isLoading: false,
            error: null,

            // Inicializar autenticación
            initializeAuth: async () => {
                    if (typeof window === 'undefined') {
                        return;
                    }

                const token = localStorage.getItem('token');
                if (!token) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                    return;
                }

                set({ isLoading: true });
                try {
                    const userData = await authService.getCurrentUser();
                    set({
                        user: userData,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (_error) {
                        // Token inválido o expirado
                    authService.logout();
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            // Login
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { token, user } = await authService.login(credentials);

                        // Asegurar que el token se guarda en localStorage
                        if (token && typeof window !== 'undefined') {
                            localStorage.setItem('token', token);
                        }

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                        return { success: true, user, token };
                } catch (_error) {
                        const errorMessage = _error.response?.data?.detail || _error.message || 'Error al iniciar sesión';

                        // Limpiar token si hay error
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('token');
                        }

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Register
            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.register(userData);

                    set({
                        isLoading: false,
                        error: null,
                    });
                    return { success: true, data };
                } catch (error) {
                        // Mejor manejo de errores del servidor
                        // El error puede venir directamente de axios o del interceptor transformado
                        const status = error.status || error.response?.status;
                        const errorResponse = error.response?.data || error.response || error;
                        const detail = errorResponse.detail || error.detail || errorResponse.message || error.message;
                    let errorMessage = 'Error al registrarse';
                        let fieldErrors = {}; // Errores por campo

                        logger.debug('Error capturado en registro', {
                            status,
                            detail,
                            errorStatus: error.status,
                            errorResponseStatus: error.response?.status
                        });

                        // Manejo específico para error 409 (Conflict) - usuario o email ya existe
                        if (status === 409) {
                            logger.debug('Error 409 detectado', { detail, type: typeof detail });
                            if (typeof detail === 'string') {
                                errorMessage = detail;
                                const lowerDetail = detail.toLowerCase();
                                // Detectar si es error de username o email basado en el mensaje
                                if (lowerDetail.includes('username') || lowerDetail.includes('usuario') || lowerDetail.includes('nombre de usuario')) {
                                    fieldErrors.username = detail; // Usar el mensaje original del backend
                                    logger.debug('Error asignado a username', fieldErrors.username);
                                } else if (lowerDetail.includes('email') || lowerDetail.includes('correo') || lowerDetail.includes('correo electrónico')) {
                                    fieldErrors.email = detail; // Usar el mensaje original del backend
                                    logger.debug('Error asignado a email', fieldErrors.email);
                                }
                            } else {
                                errorMessage = 'El usuario o email ya está registrado';
                            }
                        }
                        // Si es un array de errores de validación (FastAPI 422)
                        else if (Array.isArray(detail)) {
                            const errorMessages = [];
                            detail.forEach((issue) => {
                                // Extraer el campo si está disponible
                                const loc = issue.loc || [];
                                const field = loc[loc.length - 1] || 'general';
                                const message = issue.msg || issue.detail || JSON.stringify(issue);

                                // Mapear campos del backend a campos del frontend
                                let frontendField = field;
                                if (field === 'first_name') frontendField = 'name';
                                else if (field === 'last_name') frontendField = 'lastName';

                                if (field !== 'general' && field !== 'body') {
                                    fieldErrors[frontendField] = message;
                                }
                                errorMessages.push(message);
                            });
                            errorMessage = errorMessages.join('. ');
                    } else if (typeof detail === 'string') {
                        errorMessage = detail;
                            // Intentar extraer campo del mensaje si es posible
                            const lowerDetail = detail.toLowerCase();
                            if (lowerDetail.includes('username') || lowerDetail.includes('usuario')) {
                                fieldErrors.username = detail;
                            } else if (lowerDetail.includes('email') || lowerDetail.includes('correo')) {
                                fieldErrors.email = detail;
                            } else if (lowerDetail.includes('password') || lowerDetail.includes('contraseña')) {
                                fieldErrors.password = detail;
                            } else if (lowerDetail.includes('first_name') || lowerDetail.includes('nombre')) {
                                fieldErrors.name = detail;
                            } else if (lowerDetail.includes('last_name') || lowerDetail.includes('apellido')) {
                                fieldErrors.lastName = detail;
                            }
                    } else if (detail && typeof detail === 'object') {
                        errorMessage = detail.msg || detail.detail || JSON.stringify(detail);
                        } else if (error.message) {
                            errorMessage = error.message;
                    }

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });

                        const returnValue = {
                            success: false,
                            error: errorMessage,
                            fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : null
                        };

                        if (Object.keys(fieldErrors).length > 0) {
                            logger.debug('Retornando fieldErrors', fieldErrors);
                        }

                        return returnValue;
                }
            },

            // Logout
            logout: () => {
                authService.logout();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                        isLoading: false,
                    error: null,
                });
            },

            // Get current user (para compatibilidad)
            getCurrentUser: async () => {
                    if (typeof window === 'undefined') {
                        return;
                    }

                const token = localStorage.getItem('token');
                if (!token) {
                        set({ isAuthenticated: false, user: null, isLoading: false });
                    return;
                }

                set({ isLoading: true });
                try {
                    const userData = await authService.getCurrentUser();
                    set({
                        user: userData,
                            token,
                        isAuthenticated: true,
                        isLoading: false,
                            error: null,
                    });
                } catch (error) {
                    authService.logout();
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                            error: null,
                    });
                }
            },

            // Clear error
            clearError: () => set({ error: null }),
            };
        },
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

export default useAuthStore;

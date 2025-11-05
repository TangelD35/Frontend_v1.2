import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../api/endpoints/auth';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: localStorage.getItem('token'),
            isAuthenticated: !!localStorage.getItem('token'),
            isLoading: false,
            error: null,

            // Inicializar autenticación
            initializeAuth: async () => {
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

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return { success: true };
                } catch (_error) {
                    const errorMessage = _error.response?.data?.detail || 'Error al iniciar sesión';
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
                    const detail = error.response?.data?.detail;
                    let errorMessage = 'Error al registrarse';

                    if (Array.isArray(detail)) {
                        errorMessage = detail
                            .map((issue) => issue.msg || issue.detail || JSON.stringify(issue))
                            .join('\n');
                    } else if (typeof detail === 'string') {
                        errorMessage = detail;
                    } else if (detail && typeof detail === 'object') {
                        errorMessage = detail.msg || detail.detail || JSON.stringify(detail);
                    }

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Logout
            logout: () => {
                authService.logout();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Get current user (para compatibilidad)
            getCurrentUser: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                set({ isLoading: true });
                try {
                    const userData = await authService.getCurrentUser();
                    set({
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    authService.logout();
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),
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
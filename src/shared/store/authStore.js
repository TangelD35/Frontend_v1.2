import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: localStorage.getItem('token'),
            isAuthenticated: !!localStorage.getItem('token'),
            isLoading: false,
            error: null,

            // Inicializar autenticación
            initializeAuth: () => {
                const token = localStorage.getItem('token');
                if (token) {
                    const userData = get().getMockUserData();
                    set({
                        user: userData,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    set({ isLoading: false });
                }
            },

            // Datos de usuario simulados (centralizado)
            getMockUserData: () => ({
                id: 1,
                email: 'analista@basktscorerd.com',
                name: 'Analista BasktscoreRD',
                full_name: 'Analista Senior',
                username: 'analista_basktscorerd',
                role: 'analyst'
            }),

            // Login
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    // Simulación de login (comentar cuando API esté lista)
                    // const response = await api.post('/auth/login', credentials);

                    const userData = get().getMockUserData();
                    const token = `simulated_jwt_token_${Date.now()}`;

                    localStorage.setItem('token', token);
                    set({
                        user: userData,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return { success: true };
                } catch (_error) {
                    const errorMessage = _error.response?.data?.message || 'Error al iniciar sesión';
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
                    // Simular llamada API - reemplazar con tu servicio real
                    console.warn('Register attempt:', userData);

                    set({
                        isLoading: false,
                        error: null,
                    });
                    return { success: true, data: userData };
                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'Error al registrarse';
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            // Logout
            logout: () => {
                localStorage.removeItem('token');
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
                    const userData = get().getMockUserData();
                    set({
                        user: userData,
                        isLoading: false,
                    });
                } catch (error) {
                    localStorage.removeItem('token');
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
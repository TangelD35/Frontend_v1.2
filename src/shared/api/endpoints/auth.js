import axiosInstance from './axiosConfig';


export const authService = {
    // Login - FastAPI usa OAuth2PasswordRequestForm (form-data)
    login: async (credentials) => {
        // Convertir a form-data como espera FastAPI
        const formData = new FormData();
        formData.append('username', credentials.username || credentials.email);
        formData.append('password', credentials.password);

        const response = await axiosInstance.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const { access_token, user } = response.data;

        if (access_token) {
            localStorage.setItem('token', access_token);
        }

        return {
            token: access_token,
            user: user
        };
    },

    // Register
    register: async (userData) => {
        const response = await axiosInstance.post('/auth/register', {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            full_name: userData.full_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone ?? null,
            organization: userData.organization ?? null,
            role: userData.role ?? null,
            is_active: true,
            is_superuser: false
        });
        return response.data;
    },

    // Verificar disponibilidad de username
    checkUsernameAvailability: async (username) => {
        try {
            // El backend no tiene este endpoint aún, pero podemos prepararlo
            // Por ahora retornamos true asumiendo que está disponible
            // TODO: Implementar endpoint en backend para verificar disponibilidad
            return { available: true };
        } catch (error) {
            return { available: false, error: error.message };
        }
    },

    // Verificar disponibilidad de email
    checkEmailAvailability: async (email) => {
        try {
            // Similar al username, preparado para futura implementación
            return { available: true };
        } catch (error) {
            return { available: false, error: error.message };
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default authService;
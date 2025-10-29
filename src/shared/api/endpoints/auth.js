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
            username: userData.username || userData.email.split('@')[0],
            password: userData.password,
            full_name: userData.name || userData.full_name,
            is_active: true,
            is_superuser: false
        });
        return response.data;
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
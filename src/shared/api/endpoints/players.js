import axiosInstance from './axiosConfig';

export const playersService = {
    // Obtener todos los jugadores
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/players', { params });
        return response.data;
    },

    // Obtener un jugador por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/players/${id}`);
        return response.data;
    },

    // Crear un jugador
    create: async (playerData) => {
        const response = await axiosInstance.post('/players', playerData);
        return response.data;
    },

    // Actualizar un jugador
    update: async (id, playerData) => {
        const response = await axiosInstance.put(`/players/${id}`, playerData);
        return response.data;
    },

    // Eliminar un jugador
    delete: async (id) => {
        const response = await axiosInstance.delete(`/players/${id}`);
        return response.data;
    },

    // Obtener estadísticas de un jugador
    getStats: async (id) => {
        const response = await axiosInstance.get(`/players/${id}/stats`);
        return response.data;
    },
};

export default playersService;
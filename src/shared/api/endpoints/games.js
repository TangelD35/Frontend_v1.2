import axiosInstance from './axiosConfig';

export const gamesService = {
    // Obtener todos los partidos
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/games', { params });
        return response.data;
    },

    // Obtener un partido por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/games/${id}`);
        return response.data;
    },

    // Crear un partido
    create: async (gameData) => {
        const response = await axiosInstance.post('/games', gameData);
        return response.data;
    },

    // Actualizar un partido
    update: async (id, gameData) => {
        const response = await axiosInstance.put(`/games/${id}`, gameData);
        return response.data;
    },

    // Eliminar un partido
    delete: async (id) => {
        const response = await axiosInstance.delete(`/games/${id}`);
        return response.data;
    },

    // Obtener detalles del partido (estadísticas detalladas)
    getDetails: async (id) => {
        const response = await axiosInstance.get(`/games/${id}/details`);
        return response.data;
    },

    // Obtener resumen de estadísticas de partidos
    getSummary: async (params = {}) => {
        const response = await axiosInstance.get('/games/summary', { params });
        return response.data;
    },
};

export default gamesService;
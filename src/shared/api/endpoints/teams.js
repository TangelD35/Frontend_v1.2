import axiosInstance from './axiosConfig';

export const teamsService = {
    // Obtener todos los equipos
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/teams', { params });
        return response.data;
    },

    // Obtener un equipo por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/teams/${id}`);
        return response.data;
    },

    // Crear un equipo
    create: async (teamData) => {
        const response = await axiosInstance.post('/teams', teamData);
        return response.data;
    },

    // Actualizar un equipo
    update: async (id, teamData) => {
        const response = await axiosInstance.put(`/teams/${id}`, teamData);
        return response.data;
    },

    // Eliminar un equipo
    delete: async (id) => {
        const response = await axiosInstance.delete(`/teams/${id}`);
        return response.data;
    },

    // Obtener jugadores de un equipo
    getPlayers: async (id) => {
        const response = await axiosInstance.get(`/teams/${id}/players`);
        return response.data;
    },

    // Obtener estadísticas de un equipo
    getStats: async (id) => {
        const response = await axiosInstance.get(`/teams/${id}/stats`);
        return response.data;
    },
};

export default teamsService;
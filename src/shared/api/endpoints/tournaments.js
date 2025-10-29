import axiosInstance from './axiosConfig';

export const tournamentsService = {
    // Obtener todos los torneos
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/tournaments', { params });
        return response.data;
    },

    // Obtener un torneo por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/tournaments/${id}`);
        return response.data;
    },

    // Crear un torneo
    create: async (tournamentData) => {
        const response = await axiosInstance.post('/tournaments', tournamentData);
        return response.data;
    },

    // Actualizar un torneo
    update: async (id, tournamentData) => {
        const response = await axiosInstance.put(`/tournaments/${id}`, tournamentData);
        return response.data;
    },

    // Eliminar un torneo
    delete: async (id) => {
        const response = await axiosInstance.delete(`/tournaments/${id}`);
        return response.data;
    },

    // Obtener equipos de un torneo
    getTeams: async (id) => {
        const response = await axiosInstance.get(`/tournaments/${id}/teams`);
        return response.data;
    },

    // Obtener partidos de un torneo
    getGames: async (id) => {
        const response = await axiosInstance.get(`/tournaments/${id}/games`);
        return response.data;
    },
};

export default tournamentsService;
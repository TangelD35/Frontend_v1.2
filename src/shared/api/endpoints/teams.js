import axiosInstance from './axiosConfig';

export const teamsService = {
    // Obtener todos los equipos con filtros y paginación
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/teams/', { params });
        return response.data;
    },

    // Obtener un equipo por ID con estadísticas
    getById: async (id) => {
        const response = await axiosInstance.get(`/teams/${id}`);
        return response.data;
    },

    // Obtener un equipo con todas sus estadísticas
    getWithStats: async (id) => {
        const response = await axiosInstance.get(`/teams/${id}/with-stats`);
        return response.data;
    },

    // Crear un equipo (solo admin)
    create: async (teamData) => {
        const response = await axiosInstance.post('/teams/', teamData);
        return response.data;
    },

    // Actualizar un equipo (solo admin)
    update: async (id, teamData) => {
        const response = await axiosInstance.put(`/teams/${id}`, teamData);
        return response.data;
    },

    // Eliminar un equipo (solo admin)
    delete: async (id) => {
        const response = await axiosInstance.delete(`/teams/${id}`);
        return response.data;
    },

    // Obtener estadísticas de un equipo
    getStats: async (id) => {
        const response = await axiosInstance.get(`/teams/${id}/statistics`);
        return response.data;
    },

    // Crear estadísticas para un equipo
    createStats: async (id, statsData) => {
        const response = await axiosInstance.post(`/teams/${id}/statistics`, statsData);
        return response.data;
    },

    // Actualizar estadísticas de un equipo
    updateStats: async (teamId, statId, statsData) => {
        const response = await axiosInstance.put(`/teams/${teamId}/statistics/${statId}`, statsData);
        return response.data;
    },
};

export default teamsService;
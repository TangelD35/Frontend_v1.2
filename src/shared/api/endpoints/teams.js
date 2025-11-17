import axiosInstance from './axiosConfig';

export const teamsService = {
    // Obtener todos los equipos con filtros y paginación
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/teams/', { params });
        return response.data;
    },

    // Buscar equipo por nombre (optimizado)
    searchByName: async (name) => {
        const response = await axiosInstance.get('/teams/', {
            params: { search: name, limit: 1 }
        });
        return response.data;
    },

    // Obtener equipo de República Dominicana (método dedicado)
    getDominicanTeam: async () => {
        try {
            // Intentar con nombre completo primero
            let response = await axiosInstance.get('/teams/', {
                params: { search: 'República Dominicana', limit: 1 }
            });

            if (response.data?.items?.length > 0) {
                return response.data.items[0];
            }

            // Fallback: buscar por "Dominicana"
            response = await axiosInstance.get('/teams/', {
                params: { search: 'Dominicana', limit: 1 }
            });

            return response.data?.items?.[0] || null;
        } catch (error) {
            console.error('Error buscando equipo dominicano:', error);
            return null;
        }
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
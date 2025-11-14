import axiosInstance from './axiosConfig';

export const analyticsService = {
    // Obtener datos principales de analytics
    getAnalytics: async (params = {}) => {
        const response = await axiosInstance.get('/analytics', { params });
        return response.data;
    },

    // Obtener resumen general
    getSummary: async () => {
        const response = await axiosInstance.get('/analytics');
        return response.data;
    },

    // Obtener estadísticas por torneo
    getTournamentStats: async (tournamentId) => {
        const response = await axiosInstance.get(`/analytics/tournaments/${tournamentId}`);
        return response.data;
    },

    // Obtener estadísticas por equipo
    getTeamStats: async (teamId) => {
        const response = await axiosInstance.get(`/analytics/teams/${teamId}`);
        return response.data;
    },

    // Obtener estadísticas por jugador
    getPlayerStats: async (playerId) => {
        const response = await axiosInstance.get(`/analytics/players/${playerId}`);
        return response.data;
    },

    // Obtener tendencias
    getTrends: async (params = {}) => {
        const response = await axiosInstance.get('/analytics/trends', { params });
        return response.data;
    },

    // Obtener comparaciones
    getComparisons: async (type, ids) => {
        const response = await axiosInstance.get('/analytics/compare', {
            params: { type, ids: ids.join(',') }
        });
        return response.data;
    },

    // Obtener reportes personalizados
    getCustomReport: async (reportConfig) => {
        const response = await axiosInstance.post('/analytics/custom-report', reportConfig);
        return response.data;
    },
};

export default analyticsService;
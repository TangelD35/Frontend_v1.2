import axiosInstance from './axiosConfig';

export const analyticsService = {
    // Obtener resumen general
    getSummary: async () => {
        const response = await axiosInstance.get('/analytics/summary');
        return response.data;
    },

    // Obtener overview detallado de un equipo (acepta team_id, start_year, end_year)
    getTeamOverview: async (params = {}) => {
        const response = await axiosInstance.get('/analytics/team/overview', {
            params,
        });
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

    // Obtener temporadas (años) en las que un jugador participó
    getPlayerSeasons: async (playerId) => {
        const response = await axiosInstance.get(`/analytics/players/${playerId}/seasons`);
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

    // Obtener eficiencia ofensiva de equipo
    getTeamOffensiveEfficiency: async (teamId, tournamentId = null) => {
        const params = { team_id: teamId };
        if (tournamentId) params.tournament_id = tournamentId;
        const response = await axiosInstance.get('/analytics/team/offensive-efficiency', { params });
        return response.data;
    },

    // Obtener eficiencia defensiva de equipo
    getTeamDefensiveEfficiency: async (teamId, tournamentId = null) => {
        const params = { team_id: teamId };
        if (tournamentId) params.tournament_id = tournamentId;
        const response = await axiosInstance.get('/analytics/team/defensive-efficiency', { params });
        return response.data;
    },

    // Obtener ranking de jugadores
    getPlayerRankings: async (metric = 'points', position = null, limit = 10) => {
        const params = { metric, limit };
        if (position) params.position = position;
        const response = await axiosInstance.get('/analytics/player/ranking', { params });
        return response.data;
    },

    // Obtener tendencias del equipo por temporada
    getTeamTrends: async (teamId, startYear = 2010, endYear = 2025) => {
        const params = { team_id: teamId, start_year: startYear, end_year: endYear };
        const response = await axiosInstance.get('/analytics/team/trends', { params });
        return response.data;
    },

    // Obtener estadísticas de torneo (ruta directa)
    getTournamentStatsById: async (tournamentId) => {
        const response = await axiosInstance.get(`/analytics/tournament/${tournamentId}/stats`);
        return response.data;
    },

    // Obtener métricas del modelo clasificador ML
    getMLClassifierMetrics: async () => {
        const response = await axiosInstance.get('/analytics/ml/metrics/classifier');
        return response.data;
    },

    // Obtener métricas del modelo de puntos de jugador ML
    getMLPlayerPointsMetrics: async () => {
        const response = await axiosInstance.get('/analytics/ml/metrics/player-points');
        return response.data;
    },
};

export default analyticsService;
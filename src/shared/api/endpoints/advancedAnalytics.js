import axiosInstance from './axiosConfig';

export const advancedAnalyticsService = {
    // Obtener estadísticas avanzadas de jugador
    getPlayerAdvancedStats: async (playerId, season) => {
        const response = await axiosInstance.get(`/advanced-analytics/player/${playerId}/advanced-stats`, {
            params: { season }
        });
        return response.data;
    },

    // Obtener PER de jugador
    getPlayerPER: async (playerId, season) => {
        const response = await axiosInstance.get(`/advanced-analytics/player/${playerId}/per`, {
            params: { season }
        });
        return response.data;
    },

    // Obtener métricas rápidas de jugador
    getPlayerQuickMetrics: async (playerId, season) => {
        const response = await axiosInstance.get(`/advanced-analytics/player/${playerId}/quick-metrics`, {
            params: { season }
        });
        return response.data;
    },

    // Calcular True Shooting %
    calculateTrueShootingPercentage: async (points, fga, fta) => {
        const response = await axiosInstance.get('/advanced-analytics/metrics/calculate/ts-percentage', {
            params: { points, fga, fta }
        });
        return response.data;
    },

    // Calcular Effective Field Goal %
    calculateEffectiveFieldGoalPercentage: async (fgm, threePm, fga) => {
        const response = await axiosInstance.get('/advanced-analytics/metrics/calculate/efg-percentage', {
            params: { fgm, three_pm: threePm, fga }
        });
        return response.data;
    },

    // Obtener promedios de liga
    getLeagueAverages: async (season) => {
        const response = await axiosInstance.get(`/advanced-analytics/league/averages/${season}`);
        return response.data;
    },

    // Obtener documentación de métricas
    getMetricsDocumentation: async () => {
        const response = await axiosInstance.get('/advanced-analytics/help/metrics');
        return response.data;
    },
};

export default advancedAnalyticsService;

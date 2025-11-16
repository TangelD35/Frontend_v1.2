import { useState, useEffect, useCallback } from 'react';
import { advancedAnalyticsService } from '../../../shared/api/endpoints/advancedAnalytics';
import useAuthStore from '../../../shared/store/authStore';

const DEFAULT_SEASON = '2024';

const mapLeagueAveragesToTeamRatings = (averages = {}) => ([
    {
        metric_name: 'Promedio de puntos',
        value: averages.avg_points ?? '—',
        description: 'Producción ofensiva promedio de la liga'
    },
    {
        metric_name: 'Promedio de asistencias',
        value: averages.avg_assists ?? '—',
        description: 'Creación de juego colectiva'
    },
    {
        metric_name: 'Promedio de rebotes',
        value: averages.avg_rebounds ?? '—',
        description: 'Control del tablero'
    }
]);

export const useAdvancedAnalytics = () => {
    const [playerAdvancedStats, setPlayerAdvancedStats] = useState([]);
    const [teamRatings, setTeamRatings] = useState([]);
    const [leagueAverages, setLeagueAverages] = useState(null);
    const [metricsDocumentation, setMetricsDocumentation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();

    // Obtener estadísticas avanzadas de jugador
    const fetchPlayerAdvancedStats = useCallback(async (playerId, season) => {
        if (!user || !playerId) return null;

        try {
            const data = await advancedAnalyticsService.getPlayerAdvancedStats(playerId, season);
            setPlayerAdvancedStats(data);
            return data;
        } catch (err) {
            console.error('Error fetching player advanced stats:', err);
            throw err;
        }
    }, [user]);

    // Obtener PER de jugador
    const fetchPlayerPER = useCallback(async (playerId, season) => {
        if (!user || !playerId) return null;

        try {
            const data = await advancedAnalyticsService.getPlayerPER(playerId, season);
            return data;
        } catch (err) {
            console.error('Error fetching player PER:', err);
            throw err;
        }
    }, [user]);

    // Obtener métricas rápidas de jugador
    const fetchPlayerQuickMetrics = useCallback(async (playerId, season) => {
        if (!user || !playerId) return null;

        try {
            const data = await advancedAnalyticsService.getPlayerQuickMetrics(playerId, season);
            return data;
        } catch (err) {
            console.error('Error fetching player quick metrics:', err);
            throw err;
        }
    }, [user]);

    // Calcular True Shooting %
    const calculateTrueShootingPercentage = useCallback(async (points, fga, fta) => {
        if (!user) return null;

        try {
            const data = await advancedAnalyticsService.calculateTrueShootingPercentage(points, fga, fta);
            return data;
        } catch (err) {
            console.error('Error calculating TS%:', err);
            throw err;
        }
    }, [user]);

    // Calcular Effective Field Goal %
    const calculateEffectiveFieldGoalPercentage = useCallback(async (fgm, threePm, fga) => {
        if (!user) return null;

        try {
            const data = await advancedAnalyticsService.calculateEffectiveFieldGoalPercentage(fgm, threePm, fga);
            return data;
        } catch (err) {
            console.error('Error calculating eFG%:', err);
            throw err;
        }
    }, [user]);

    // Obtener promedios de liga
    const fetchLeagueAverages = useCallback(async (season = DEFAULT_SEASON) => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await advancedAnalyticsService.getLeagueAverages(season);
            setLeagueAverages(data);
            setTeamRatings(mapLeagueAveragesToTeamRatings(data));
        } catch (err) {
            console.error('Error fetching league averages:', err);
            setError(err);
            setTeamRatings([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Obtener documentación de métricas
    const fetchMetricsDocumentation = useCallback(async () => {
        if (!user) return;

        try {
            const data = await advancedAnalyticsService.getMetricsDocumentation();
            setMetricsDocumentation(data);
        } catch (err) {
            console.error('Error fetching metrics documentation:', err);
            setError(err);
        }
    }, [user]);

    // Refetch all data
    const refetch = useCallback(async (season = DEFAULT_SEASON) => {
        await Promise.all([
            fetchLeagueAverages(season),
            fetchMetricsDocumentation()
        ]);
    }, [fetchLeagueAverages, fetchMetricsDocumentation]);

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            fetchLeagueAverages(DEFAULT_SEASON);
            fetchMetricsDocumentation();
        }
    }, [user, fetchLeagueAverages, fetchMetricsDocumentation]);

    return {
        // Data
        playerAdvancedStats,
        teamRatings,
        leagueAverages,
        metricsDocumentation,

        // States
        loading,
        error,

        // Actions
        fetchPlayerAdvancedStats,
        fetchPlayerPER,
        fetchPlayerQuickMetrics,
        calculateTrueShootingPercentage,
        calculateEffectiveFieldGoalPercentage,
        fetchLeagueAverages,
        fetchMetricsDocumentation,
        refetch
    };
};

export default useAdvancedAnalytics;

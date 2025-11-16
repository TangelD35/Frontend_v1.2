import { useState, useEffect, useCallback } from 'react';
import { advancedAnalyticsService } from '../../../shared/api/endpoints/advancedAnalytics';
import useAuthStore from '../../../shared/store/authStore';

// Período histórico completo de análisis
const DEFAULT_START_YEAR = 2010;
const DEFAULT_END_YEAR = 2025;

const mapLeagueAveragesToTeamRatings = (averages = {}) => ([
    {
        metric_name: 'Promedio de puntos',
        value: averages.avg_points ?? '—',
        description: 'Producción ofensiva promedio de la liga (2010-2025)'
    },
    {
        metric_name: 'Promedio de asistencias',
        value: averages.avg_assists ?? '—',
        description: 'Creación de juego colectiva (2010-2025)'
    },
    {
        metric_name: 'Promedio de rebotes',
        value: averages.avg_rebounds ?? '—',
        description: 'Control del tablero (2010-2025)'
    }
]);

export const useAdvancedAnalytics = () => {
    const [playerAdvancedStats, setPlayerAdvancedStats] = useState([]);
    const [teamRatings, setTeamRatings] = useState([]);
    const [leagueAverages, setLeagueAverages] = useState(null);
    const [teamTrends, setTeamTrends] = useState([]);
    const [topPlayers, setTopPlayers] = useState([]);
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

    // Obtener promedios de liga (período completo 2010-2025)
    const fetchLeagueAverages = useCallback(async (startYear = DEFAULT_START_YEAR, endYear = DEFAULT_END_YEAR) => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await advancedAnalyticsService.getLeagueAverages(startYear, endYear);
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

    // Obtener tendencias del equipo por períodos
    const fetchTeamTrends = useCallback(async (teamId, startYear = DEFAULT_START_YEAR, endYear = DEFAULT_END_YEAR) => {
        if (!user || !teamId) return [];

        try {
            setLoading(true);
            setError(null);
            const data = await advancedAnalyticsService.getTeamTrends(teamId, startYear, endYear);
            setTeamTrends(data);
            return data;
        } catch (err) {
            console.error('Error fetching team trends:', err);
            setError(err);
            setTeamTrends([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Obtener top jugadores por métrica
    const fetchTopPlayers = useCallback(async (metric, limit = 5, startYear = DEFAULT_START_YEAR, endYear = DEFAULT_END_YEAR) => {
        if (!user) return [];

        try {
            setLoading(true);
            setError(null);
            const data = await advancedAnalyticsService.getTopPlayers(metric, limit, startYear, endYear);
            setTopPlayers(data);
            return data;
        } catch (err) {
            console.error('Error fetching top players:', err);
            setError(err);
            setTopPlayers([]);
            return [];
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
    const refetch = useCallback(async (startYear = DEFAULT_START_YEAR, endYear = DEFAULT_END_YEAR) => {
        await Promise.all([
            fetchLeagueAverages(startYear, endYear),
            fetchMetricsDocumentation()
        ]);
    }, [fetchLeagueAverages, fetchMetricsDocumentation]);

    // Cargar datos iniciales (período completo 2010-2025)
    useEffect(() => {
        if (user) {
            fetchLeagueAverages(DEFAULT_START_YEAR, DEFAULT_END_YEAR);
            fetchMetricsDocumentation();
        }
    }, [user, fetchLeagueAverages, fetchMetricsDocumentation]);

    return {
        // Data
        playerAdvancedStats,
        teamRatings,
        leagueAverages,
        teamTrends,
        topPlayers,
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
        fetchTeamTrends,
        fetchTopPlayers,
        fetchMetricsDocumentation,
        refetch
    };
};

export default useAdvancedAnalytics;

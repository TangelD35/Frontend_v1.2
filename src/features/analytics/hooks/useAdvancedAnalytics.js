import { useState, useEffect, useCallback } from 'react';
import { advancedAnalyticsService } from '../../../shared/api/endpoints/advancedAnalytics';
import { useAuthStore } from '../../../shared/store/authStore';

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

    // Obtener ratings de equipo
    const fetchTeamRatings = useCallback(async (teamId, season) => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await advancedAnalyticsService.getTeamRatings(teamId, season);
            setTeamRatings(data);
        } catch (err) {
            console.error('Error fetching team ratings:', err);
            setError(err);
        } finally {
            setLoading(false);
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
    const fetchLeagueAverages = useCallback(async (season) => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await advancedAnalyticsService.getLeagueAverages(season);
            setLeagueAverages(data);
        } catch (err) {
            console.error('Error fetching league averages:', err);
            setError(err);
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
    const refetch = useCallback(async (season = '2024') => {
        await Promise.all([
            fetchTeamRatings('republica_dominicana', season),
            fetchLeagueAverages(season),
            fetchMetricsDocumentation()
        ]);
    }, [fetchTeamRatings, fetchLeagueAverages, fetchMetricsDocumentation]);

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            refetch();
        }
    }, [user, refetch]);

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
        fetchTeamRatings,
        calculateTrueShootingPercentage,
        calculateEffectiveFieldGoalPercentage,
        fetchLeagueAverages,
        fetchMetricsDocumentation,
        refetch
    };
};

export default useAdvancedAnalytics;

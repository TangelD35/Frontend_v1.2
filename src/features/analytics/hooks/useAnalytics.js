import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../../shared/api/endpoints/analytics';
import useAuthStore from '../../../shared/store/authStore';

export const useAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [comparisons, setComparisons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();

    // Obtener resumen general
    const fetchSummary = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await analyticsService.getAnalytics();
            setSummary(data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Obtener tendencias
    const fetchTrends = useCallback(async (params = {}) => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await analyticsService.getTrends(params);
            setTrends(data);
        } catch (err) {
            console.error('Error fetching trends:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Obtener estadísticas por torneo
    const fetchTournamentStats = useCallback(async (tournamentId) => {
        if (!user || !tournamentId) return null;

        try {
            const data = await analyticsService.getTournamentStats(tournamentId);
            return data;
        } catch (err) {
            console.error('Error fetching tournament stats:', err);
            throw err;
        }
    }, [user]);

    // Obtener estadísticas por equipo
    const fetchTeamStats = useCallback(async (teamId) => {
        if (!user || !teamId) return null;

        try {
            const data = await analyticsService.getTeamStats(teamId);
            return data;
        } catch (err) {
            console.error('Error fetching team stats:', err);
            throw err;
        }
    }, [user]);

    // Obtener estadísticas por jugador
    const fetchPlayerStats = useCallback(async (playerId) => {
        if (!user || !playerId) return null;

        try {
            const data = await analyticsService.getPlayerStats(playerId);
            return data;
        } catch (err) {
            console.error('Error fetching player stats:', err);
            throw err;
        }
    }, [user]);

    // Obtener comparaciones
    const fetchComparisons = useCallback(async (type, ids) => {
        if (!user || !type || !ids?.length) return;

        try {
            setLoading(true);
            const data = await analyticsService.getComparisons(type, ids);
            setComparisons(data);
        } catch (err) {
            console.error('Error fetching comparisons:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Crear reporte personalizado
    const createCustomReport = useCallback(async (reportConfig) => {
        if (!user) return null;

        try {
            const data = await analyticsService.getCustomReport(reportConfig);
            return data;
        } catch (err) {
            console.error('Error creating custom report:', err);
            throw err;
        }
    }, [user]);

    // Refetch all data
    const refetch = useCallback(async () => {
        await Promise.all([
            fetchSummary(),
            fetchTrends()
        ]);
    }, [fetchSummary, fetchTrends]);

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            fetchSummary();
            fetchTrends();
        }
    }, [user, fetchSummary, fetchTrends]);

    return {
        // Data
        summary,
        trends,
        comparisons,

        // States
        loading,
        error,

        // Actions
        fetchSummary,
        fetchTrends,
        fetchTournamentStats,
        fetchTeamStats,
        fetchPlayerStats,
        fetchComparisons,
        createCustomReport,
        refetch
    };
};

export default useAnalytics;

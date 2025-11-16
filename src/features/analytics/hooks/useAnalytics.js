import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../../../shared/api/endpoints/analytics';
import useAuthStore from '../../../shared/store/authStore';

export const useAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState(null);
    const [comparisons, setComparisons] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastTrendParams, setLastTrendParams] = useState(null);
    const { user } = useAuthStore();

    const sanitizeIdsParam = useCallback((value) => {
        if (!value) return '';

        if (Array.isArray(value)) {
            return value
                .map((id) => (typeof id === 'string' ? id : String(id ?? '')).trim())
                .filter(Boolean)
                .join(',');
        }

        if (typeof value === 'string') {
            return value
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean)
                .join(',');
        }

        return '';
    }, []);

    // Obtener resumen general
    const fetchSummary = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const data = await analyticsService.getSummary();
            setSummary(data);
        } catch (err) {
            console.error('Error fetching analytics summary:', err);
            setError(err);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Obtener tendencias
    const fetchTrends = useCallback(async (params = null) => {
        if (!user) return null;

        const baseParams = params ?? lastTrendParams;
        const normalizedIds = sanitizeIdsParam(baseParams?.ids);

        if (!normalizedIds) {
            if (params) {
                console.warn('Skipping trends fetch: no valid IDs provided.');
            }
            return null;
        }

        const payload = {
            type: baseParams?.type || 'team',
            metric: baseParams?.metric || 'points_per_game',
            ids: normalizedIds
        };

        try {
            setLoading(true);
            const data = await analyticsService.getTrends(payload);
            setTrends(data ?? null);
            setLastTrendParams(payload);
            return data;
        } catch (err) {
            console.error('Error fetching trends:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, lastTrendParams, sanitizeIdsParam]);

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
            setComparisons(data ?? null);
            return data;
        } catch (err) {
            console.error('Error fetching comparisons:', err);
            throw err;
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
        const tasks = [fetchSummary()];

        if (lastTrendParams?.ids) {
            tasks.push(fetchTrends(lastTrendParams));
        }

        await Promise.all(tasks);
    }, [fetchSummary, fetchTrends, lastTrendParams]);

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            fetchSummary();
        }
    }, [user, fetchSummary]);

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

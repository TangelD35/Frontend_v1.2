import { useState, useEffect } from 'react';
import { teamsService } from '../../../shared/api/endpoints/teams';
import useAuth from '../../../shared/hooks/useAuth';

export const useTeamDetail = (teamId) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchTeam = async () => {
        if (!user || !teamId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const teamData = await teamsService.getById(teamId);
            setTeam(teamData);
        } catch (err) {
            console.error('Error fetching team:', err);
            setError(err.response?.data?.detail || 'Error al cargar el equipo');
            setTeam(null);
        } finally {
            setLoading(false);
        }
    };

    const getTeamStatistics = async () => {
        if (!user || !teamId) return [];
        
        try {
            const stats = await teamsService.getStats(teamId);
            return stats;
        } catch (err) {
            console.error('Error fetching team statistics:', err);
            return [];
        }
    };

    // Cargar equipo al montar el componente o cuando cambie el teamId
    useEffect(() => {
        if (user && teamId) {
            fetchTeam();
        }
    }, [user, teamId]);

    return {
        team,
        loading,
        error,
        getTeamStatistics,
        refetch: fetchTeam
    };
};

export default useTeamDetail;

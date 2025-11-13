import { useState, useEffect } from 'react';
import { teamsService } from '../../../shared/api/endpoints/teams';
import useAuth from '../../../shared/hooks/useAuth';
import axiosInstance from '../../../shared/api/endpoints/axiosConfig';

export const useTeams = (initialFilters = {}) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 20
    });
    const [filters, setFilters] = useState({
        search: '',
        country: null,
        is_national_team: null,
        order_by: 'name',
        sort: 'asc',
        ...initialFilters
    });

    const { user } = useAuth();

    const fetchTeams = async (newFilters = {}) => {
        console.log('🔍 useTeams - fetchTeams called', { user, newFilters });
        
        if (!user) {
            console.log('❌ useTeams - No user found, skipping fetch');
            return;
        }
        
        console.log('✅ useTeams - User found, fetching teams...', user);
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                skip: pagination.skip,
                limit: pagination.limit,
                ...filters,
                ...newFilters
            };

            // Limpiar parámetros vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '' || params[key] === undefined) {
                    delete params[key];
                }
            });

            console.log('📡 useTeams - Making API call with params:', params);
            
            const response = await teamsService.getAll(params);
            console.log('📦 useTeams - API response:', response);
            
            setTeams(response.items || []);
            setPagination({
                total: response.total || 0,
                skip: response.skip || 0,
                limit: response.limit || 20
            });
            
            console.log('✅ useTeams - Teams set:', response.items?.length || 0, 'teams');
        } catch (err) {
            console.error('❌ useTeams - Error fetching teams:', err);
            console.error('❌ useTeams - Error response:', err.response);
            console.error('❌ useTeams - Error status:', err.response?.status);
            console.error('❌ useTeams - Error data:', err.response?.data);
            console.error('❌ useTeams - Request URL:', err.config?.url);
            
            setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Error al cargar los equipos');
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    const createTeam = async (teamData) => {
        try {
            setLoading(true);
            const newTeam = await teamsService.create(teamData);
            await fetchTeams(); // Recargar la lista
            return { success: true, data: newTeam };
        } catch (err) {
            console.error('Error creating team:', err);
            const errorMessage = err.response?.data?.detail || 'Error al crear el equipo';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateTeam = async (teamId, teamData) => {
        try {
            setLoading(true);
            const updatedTeam = await teamsService.update(teamId, teamData);
            await fetchTeams(); // Recargar la lista
            return { success: true, data: updatedTeam };
        } catch (err) {
            console.error('Error updating team:', err);
            const errorMessage = err.response?.data?.detail || 'Error al actualizar el equipo';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const deleteTeam = async (teamId) => {
        try {
            setLoading(true);
            await teamsService.delete(teamId);
            await fetchTeams(); // Recargar la lista
            return { success: true };
        } catch (err) {
            console.error('Error deleting team:', err);
            const errorMessage = err.response?.data?.detail || 'Error al eliminar el equipo';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        setPagination(prev => ({ ...prev, skip: 0 })); // Reset pagination
        fetchTeams(updatedFilters);
    };

    const updatePagination = (newPagination) => {
        const updatedPagination = { ...pagination, ...newPagination };
        setPagination(updatedPagination);
        fetchTeams({ skip: updatedPagination.skip, limit: updatedPagination.limit });
    };

    // Cargar equipos al montar el componente o cuando cambie el usuario
    useEffect(() => {
        if (user) {
            fetchTeams();
        }
    }, [user]);

    return {
        teams,
        loading,
        error,
        pagination,
        filters,
        createTeam,
        updateTeam,
        deleteTeam,
        updateFilters,
        updatePagination,
        refetch: fetchTeams
    };
};

export default useTeams;

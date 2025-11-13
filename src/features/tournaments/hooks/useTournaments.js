import { useState, useEffect } from 'react';
import { tournamentsService } from '../../../shared/api/endpoints/tournaments';
import useAuth from '../../../shared/hooks/useAuth';

export const useTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 20
    });
    const [filters, setFilters] = useState({
        search: '',
        year: '',
        type: '',
        order_by: 'start_date',
        sort: 'desc'
    });

    const { user } = useAuth();

    // Función para obtener torneos
    const fetchTournaments = async (customFilters = {}) => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                skip: pagination.skip,
                limit: pagination.limit,
                ...filters,
                ...customFilters
            };

            // Limpiar parámetros vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await tournamentsService.getAll(params);
            
            setTournaments(response.items || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0
            }));
        } catch (err) {
            console.error('Error fetching tournaments:', err);
            setError(err.response?.data?.detail || 'Error al cargar los torneos');
        } finally {
            setLoading(false);
        }
    };

    // Función para crear torneo
    const createTournament = async (tournamentData) => {
        setLoading(true);
        setError(null);
        
        try {
            const newTournament = await tournamentsService.create(tournamentData);
            await fetchTournaments(); // Recargar la lista
            return newTournament;
        } catch (err) {
            console.error('Error creating tournament:', err);
            const errorMessage = err.response?.data?.detail || 'Error al crear el torneo';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar torneo
    const updateTournament = async (id, tournamentData) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedTournament = await tournamentsService.update(id, tournamentData);
            await fetchTournaments(); // Recargar la lista
            return updatedTournament;
        } catch (err) {
            console.error('Error updating tournament:', err);
            const errorMessage = err.response?.data?.detail || 'Error al actualizar el torneo';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar torneo
    const deleteTournament = async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            await tournamentsService.delete(id);
            await fetchTournaments(); // Recargar la lista
        } catch (err) {
            console.error('Error deleting tournament:', err);
            const errorMessage = err.response?.data?.detail || 'Error al eliminar el torneo';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar filtros
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, skip: 0 })); // Reset pagination
    };

    // Función para actualizar paginación
    const updatePagination = (newPagination) => {
        setPagination(prev => ({ ...prev, ...newPagination }));
    };

    // Efecto para cargar torneos cuando cambian filtros o paginación
    useEffect(() => {
        fetchTournaments();
    }, [user, pagination.skip, pagination.limit, filters]);

    return {
        tournaments,
        loading,
        error,
        pagination,
        filters,
        createTournament,
        updateTournament,
        deleteTournament,
        updateFilters,
        updatePagination,
        refetch: fetchTournaments
    };
};

export default useTournaments;

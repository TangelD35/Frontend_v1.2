import { useState, useEffect } from 'react';
import { gamesService } from '../../../shared/api/endpoints/games';
import useAuth from '../../../shared/hooks/useAuth';

export const useGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 12
    });
    const [filters, setFilters] = useState({
        search: '',
        tournament_id: '',
        status: 'todos',
        team_id: '',
        order_by: 'game_date',
        sort: 'desc'
    });

    const { user } = useAuth();

    // Función para obtener partidos
    const fetchGames = async (customFilters = {}) => {
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
                if (params[key] === '' || params[key] === null || params[key] === undefined || params[key] === 'todos') {
                    delete params[key];
                }
            });

            const response = await gamesService.getAll(params);
            
            setGames(response.items || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0
            }));
        } catch (err) {
            console.error('Error fetching games:', err);
            setError(err.response?.data?.detail || 'Error al cargar los partidos');
        } finally {
            setLoading(false);
        }
    };

    // Función para crear partido
    const createGame = async (gameData) => {
        setLoading(true);
        setError(null);
        
        try {
            const newGame = await gamesService.create(gameData);
            await fetchGames(); // Recargar la lista
            return newGame;
        } catch (err) {
            console.error('Error creating game:', err);
            const errorMessage = err.response?.data?.detail || 'Error al crear el partido';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar partido
    const updateGame = async (id, gameData) => {
        setLoading(true);
        setError(null);
        
        try {
            const updatedGame = await gamesService.update(id, gameData);
            await fetchGames(); // Recargar la lista
            return updatedGame;
        } catch (err) {
            console.error('Error updating game:', err);
            const errorMessage = err.response?.data?.detail || 'Error al actualizar el partido';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar partido
    const deleteGame = async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            await gamesService.delete(id);
            await fetchGames(); // Recargar la lista
        } catch (err) {
            console.error('Error deleting game:', err);
            const errorMessage = err.response?.data?.detail || 'Error al eliminar el partido';
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

    // Efecto para cargar partidos cuando cambian filtros o paginación
    useEffect(() => {
        fetchGames();
    }, [user, pagination.skip, pagination.limit, filters]);

    return {
        games,
        loading,
        error,
        pagination,
        filters,
        createGame,
        updateGame,
        deleteGame,
        updateFilters,
        updatePagination,
        refetch: fetchGames
    };
};

export default useGames;

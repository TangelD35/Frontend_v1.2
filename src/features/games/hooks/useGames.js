import { useState, useEffect, useCallback } from 'react';
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
        tournament_id: '',
        team_id: '',
        order_by: 'game_date',
        sort: 'desc'
    });

    const { user } = useAuth();

    // Función para obtener partidos con reintentos (memoizada)
    const fetchGames = useCallback(async (customFilters = {}, retryCount = 0) => {
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

            // Soportar tanto respuesta paginada { items, total, ... }
            // como un array simple de partidos
            const items = Array.isArray(response)
                ? response
                : (response.items || []);

            const total = Array.isArray(response)
                ? response.length
                : (response.total ?? items.length);

            setGames(items);
            setPagination(prev => ({
                ...prev,
                total
            }));
        } catch (err) {
            console.error('Error fetching games:', err);

            // Manejar diferentes tipos de errores
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                // Error de timeout - intentar reintento
                if (retryCount < 2) {
                    setTimeout(() => {
                        fetchGames(customFilters, retryCount + 1);
                    }, 2000 * (retryCount + 1)); // Delay incremental
                    return;
                } else {
                    setError('El servidor está tardando mucho en responder. Por favor, inténtalo más tarde.');
                }
            } else if (err.status === 429) {
                setError('Demasiadas solicitudes. Esperando antes de reintentar...');
                // Esperar más tiempo para rate limiting
                setTimeout(() => {
                    if (retryCount < 1) {
                        fetchGames(customFilters, retryCount + 1);
                    }
                }, 10000); // 10 segundos de espera
                return;
            } else if (err.status === 0) {
                setError('Sin conexión al servidor. Verifica tu conexión a internet.');
            } else {
                setError(err.response?.data?.detail || err.message || 'Error al cargar los partidos');
            }
        } finally {
            setLoading(false);
        }
    }, [user, pagination.skip, pagination.limit, filters]);

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

    // Función para actualizar filtros (memoizada)
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, skip: 0 })); // Reset pagination
    }, []);

    // Función para actualizar paginación (memoizada)
    const updatePagination = useCallback((newPagination) => {
        setPagination(prev => ({ ...prev, ...newPagination }));
    }, []);

    // Función para ajustar el límite dinámicamente según el estado del sidebar (memoizada)
    const adjustLimit = useCallback((showFilters) => {
        const newLimit = showFilters ? 3 : 4; // 3 elementos cuando sidebar abierto, 4 cuando cerrado
        setPagination(prev => {
            if (prev.limit !== newLimit) {
                return {
                    ...prev,
                    limit: newLimit,
                    skip: 0 // Resetear a la primera página
                };
            }
            return prev; // No cambiar si el límite es el mismo
        });
    }, []);

    // useEffect con debounce para evitar llamadas excesivas
    useEffect(() => {
        if (!user) {
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchGames();
        }, 500); // Debounce de 500ms (aumentado)

        return () => {
            clearTimeout(timeoutId);
        };
    }, [fetchGames]);

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
        adjustLimit,
        refetch: fetchGames
    };
};

export default useGames;

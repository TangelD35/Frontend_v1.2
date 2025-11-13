import { useState, useEffect, useCallback } from 'react';
import { playersService } from '../../../shared/api/endpoints/players';
import useAuth from '../../../shared/hooks/useAuth';

export const usePlayers = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        skip: 0,
        limit: 18
    });
    const [filters, setFilters] = useState({
        search: '',
        position: '',
        status: 'todos', // Mostrar todos por defecto
        order_by: 'full_name',
        sort: 'asc'
    });

    const { user } = useAuth();

    // Función para obtener jugadores del backend real
    const fetchPlayers = useCallback(async (customFilters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                skip: pagination.skip,
                limit: pagination.limit,
                ...filters,
                ...customFilters
            };

            // Convertir status a active para el backend
            if (params.status === 'activo') {
                params.active = true;
                delete params.status;
            } else if (params.status === 'inactivo') {
                params.active = false;
                delete params.status;
            } else if (params.status === 'todos') {
                delete params.status;
            }

            // Convertir posiciones de abreviaciones a nombres completos en español
            if (params.position) {
                const positionMap = {
                    'PG': 'Armador',
                    'SG': 'Escolta', 
                    'SF': 'Alero',
                    'PF': 'Ala-pívot',
                    'C': 'Pívot'
                };
                
                if (positionMap[params.position]) {
                    params.position = positionMap[params.position];
                }
            }

            // Limpiar parámetros vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await playersService.getAll(params);
            setPlayers(response.items || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0
            }));
        } catch (err) {
            let errorMessage = 'Error al cargar los jugadores';
            if (err.response?.status === 500) {
                errorMessage = 'Error interno del servidor. Verifica que el backend esté funcionando.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Sin permisos para acceder a los jugadores.';
            } else if (err.code === 'ERR_NETWORK') {
                errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en puerto 8000.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [pagination.skip, pagination.limit, filters]);

    // Función para crear jugador
    const createPlayer = async (playerData) => {
        console.log('🏀 Creating player:', playerData);
        setLoading(true);
        setError(null);

        try {
            const response = await playersService.create(playerData);
            await fetchPlayers(); // Recargar la lista
            console.log('✅ Player created successfully');
            return response;
        } catch (err) {
            console.error('❌ Error creating player:', err);
            const errorMessage = err.response?.data?.detail || 'Error al crear el jugador';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para actualizar jugador
    const updatePlayer = async (id, playerData) => {
        console.log('🏀 Updating player:', id, playerData);
        setLoading(true);
        setError(null);

        try {
            const response = await playersService.update(id, playerData);
            await fetchPlayers(); // Recargar la lista
            console.log('✅ Player updated successfully');
            return response;
        } catch (err) {
            console.error('❌ Error updating player:', err);
            const errorMessage = err.response?.data?.detail || 'Error al actualizar el jugador';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar jugador
    const deletePlayer = async (id) => {
        console.log('🏀 Deleting player:', id);
        setLoading(true);
        setError(null);

        try {
            await playersService.delete(id);
            await fetchPlayers(); // Recargar la lista
            console.log('✅ Player deleted successfully');
        } catch (err) {
            console.error('❌ Error deleting player:', err);
            const errorMessage = err.response?.data?.detail || 'Error al eliminar el jugador';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener estadísticas de un jugador
    const getPlayerStats = async (id) => {
        try {
            const stats = await playersService.getStats(id);
            return stats;
        } catch (err) {
            console.error('Error fetching player stats:', err);
            throw new Error(err.response?.data?.detail || 'Error al cargar las estadísticas');
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

    // Función para ajustar el límite dinámicamente
    const adjustLimit = (showFilters) => {
        const newLimit = showFilters ? 12 : 18; // 12 elementos (2×6) cuando sidebar abierto, 18 (3×6) cuando cerrado
        if (pagination.limit !== newLimit) {
            setPagination(prev => ({ 
                ...prev, 
                limit: newLimit,
                skip: 0 // Resetear a la primera página
            }));
        }
    };

    // Efecto para cargar datos cuando cambien filtros o paginación
    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    return {
        players,
        loading,
        error,
        pagination,
        filters,
        createPlayer,
        updatePlayer,
        deletePlayer,
        getPlayerStats,
        updateFilters,
        updatePagination,
        adjustLimit,
        fetchPlayers,
        refetch: fetchPlayers
    };
};

export default usePlayers;

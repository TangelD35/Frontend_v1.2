import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../shared/api/services/apiClient';
import { useWebSocket } from './useWebSocket';
import { useNotifications } from './useNotifications';

/**
 * Hook para manejar datos de tabla avanzada con integración API
 * @param {Object} config - Configuración del hook
 * @returns {Object} Estado y funciones para manejo de datos
 */
export const useAdvancedTableData = ({
    endpoint,
    initialData = [],
    serverSide = false,
    realTimeUpdates = false,
    cacheKey = null,
    refreshInterval = null,
    onError = null,
    transformData = null,
    dependencies = [],
}) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [lastFetch, setLastFetch] = useState(null);

    const { addNotification } = useNotifications();
    const { isConnected, subscribe, unsubscribe } = useWebSocket();

    // Cache management
    const getCachedData = useCallback(() => {
        if (!cacheKey) return null;
        try {
            const cached = localStorage.getItem(`table_cache_${cacheKey}`);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }, [cacheKey]);

    const setCachedData = useCallback((data, metadata = {}) => {
        if (!cacheKey) return;
        try {
            localStorage.setItem(`table_cache_${cacheKey}`, JSON.stringify({
                data,
                metadata,
                timestamp: Date.now(),
            }));
        } catch (error) {
            console.warn('Failed to cache table data:', error);
        }
    }, [cacheKey]);

    // Fetch data from API
    const fetchData = useCallback(async (params = {}) => {
        if (!endpoint) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get(endpoint, { params });

            let responseData = response.data;

            // Transform data if transformer is provided
            if (transformData) {
                responseData = transformData(responseData);
            }

            // Handle different response formats
            if (responseData.data && Array.isArray(responseData.data)) {
                setData(responseData.data);
                setTotalCount(responseData.total || responseData.count || responseData.data.length);
            } else if (Array.isArray(responseData)) {
                setData(responseData);
                setTotalCount(responseData.length);
            } else {
                throw new Error('Invalid response format');
            }

            setLastFetch(Date.now());

            // Cache the data
            setCachedData(responseData, { totalCount: responseData.total || responseData.length });

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al cargar datos';
            setError(errorMessage);

            if (onError) {
                onError(err);
            } else {
                addNotification({
                    type: 'error',
                    title: 'Error de carga',
                    message: errorMessage,
                });
            }

            // Try to load cached data as fallback
            const cachedData = getCachedData();
            if (cachedData) {
                setData(cachedData.data);
                setTotalCount(cachedData.metadata.totalCount || 0);
                addNotification({
                    type: 'warning',
                    title: 'Datos desde caché',
                    message: 'Mostrando datos guardados localmente',
                });
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint, transformData, onError, addNotification, setCachedData, getCachedData]);

    // Server-side pagination, sorting, and filtering
    const fetchServerData = useCallback(async (pagination, sorting, filters) => {
        const params = {};

        if (pagination) {
            params.page = pagination.pageIndex + 1;
            params.limit = pagination.pageSize;
        }

        if (sorting && sorting.length > 0) {
            params.sortBy = sorting.map(sort =>
                `${sort.id}:${sort.desc ? 'desc' : 'asc'}`
            ).join(',');
        }

        if (filters) {
            if (filters.globalFilter) {
                params.search = filters.globalFilter;
            }
            if (filters.columnFilters && filters.columnFilters.length > 0) {
                filters.columnFilters.forEach(filter => {
                    params[`filter_${filter.id}`] = filter.value;
                });
            }
        }

        await fetchData(params);
    }, [fetchData]);

    // Real-time updates via WebSocket
    useEffect(() => {
        if (realTimeUpdates && isConnected && endpoint) {
            const channel = `table_updates_${endpoint.replace(/\//g, '_')}`;

            const handleUpdate = (update) => {
                setData(currentData => {
                    switch (update.type) {
                        case 'create':
                            return [...currentData, update.data];
                        case 'update':
                            return currentData.map(item =>
                                item.id === update.data.id ? { ...item, ...update.data } : item
                            );
                        case 'delete':
                            return currentData.filter(item => item.id !== update.data.id);
                        case 'refresh':
                            fetchData();
                            return currentData;
                        default:
                            return currentData;
                    }
                });
            };

            subscribe(channel, handleUpdate);

            return () => {
                unsubscribe(channel, handleUpdate);
            };
        }
    }, [realTimeUpdates, isConnected, endpoint, subscribe, unsubscribe, fetchData]);

    // Auto-refresh interval
    useEffect(() => {
        if (refreshInterval && refreshInterval > 0) {
            const interval = setInterval(() => {
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    // Initial data load
    useEffect(() => {
        // Load cached data first for better UX
        const cachedData = getCachedData();
        if (cachedData && cachedData.data) {
            setData(cachedData.data);
            setTotalCount(cachedData.metadata.totalCount || 0);
        }

        // Then fetch fresh data
        fetchData();
    }, [endpoint, ...dependencies]);

    // CRUD operations
    const createItem = useCallback(async (itemData) => {
        try {
            setLoading(true);
            const response = await apiClient.post(endpoint, itemData);

            if (!serverSide) {
                setData(prev => [...prev, response.data]);
                setTotalCount(prev => prev + 1);
            } else {
                // Refresh data for server-side
                await fetchData();
            }

            addNotification({
                type: 'success',
                title: 'Elemento creado',
                message: 'El elemento se ha creado exitosamente',
            });

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al crear elemento';
            addNotification({
                type: 'error',
                title: 'Error de creación',
                message: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint, serverSide, fetchData, addNotification]);

    const updateItem = useCallback(async (itemId, updates) => {
        try {
            setLoading(true);
            const response = await apiClient.put(`${endpoint}/${itemId}`, updates);

            if (!serverSide) {
                setData(prev => prev.map(item =>
                    item.id === itemId ? { ...item, ...response.data } : item
                ));
            } else {
                await fetchData();
            }

            addNotification({
                type: 'success',
                title: 'Elemento actualizado',
                message: 'El elemento se ha actualizado exitosamente',
            });

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar elemento';
            addNotification({
                type: 'error',
                title: 'Error de actualización',
                message: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint, serverSide, fetchData, addNotification]);

    const deleteItem = useCallback(async (itemId) => {
        try {
            setLoading(true);
            await apiClient.delete(`${endpoint}/${itemId}`);

            if (!serverSide) {
                setData(prev => prev.filter(item => item.id !== itemId));
                setTotalCount(prev => prev - 1);
            } else {
                await fetchData();
            }

            addNotification({
                type: 'success',
                title: 'Elemento eliminado',
                message: 'El elemento se ha eliminado exitosamente',
            });

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al eliminar elemento';
            addNotification({
                type: 'error',
                title: 'Error de eliminación',
                message: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint, serverSide, fetchData, addNotification]);

    const bulkDelete = useCallback(async (itemIds) => {
        try {
            setLoading(true);
            await apiClient.delete(endpoint, { data: { ids: itemIds } });

            if (!serverSide) {
                setData(prev => prev.filter(item => !itemIds.includes(item.id)));
                setTotalCount(prev => prev - itemIds.length);
            } else {
                await fetchData();
            }

            addNotification({
                type: 'success',
                title: 'Elementos eliminados',
                message: `${itemIds.length} elemento(s) eliminado(s) exitosamente`,
            });

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al eliminar elementos';
            addNotification({
                type: 'error',
                title: 'Error de eliminación masiva',
                message: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint, serverSide, fetchData, addNotification]);

    const bulkUpdate = useCallback(async (itemIds, updates) => {
        try {
            setLoading(true);
            await apiClient.patch(endpoint, { ids: itemIds, updates });

            if (!serverSide) {
                setData(prev => prev.map(item =>
                    itemIds.includes(item.id) ? { ...item, ...updates } : item
                ));
            } else {
                await fetchData();
            }

            addNotification({
                type: 'success',
                title: 'Elementos actualizados',
                message: `${itemIds.length} elemento(s) actualizado(s) exitosamente`,
            });

            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar elementos';
            addNotification({
                type: 'error',
                title: 'Error de actualización masiva',
                message: errorMessage,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint, serverSide, fetchData, addNotification]);

    // Export data
    const exportData = useCallback(async (selectedData = null, format = 'csv') => {
        try {
            const dataToExport = selectedData || data;

            if (format === 'csv') {
                const { exportToCSV } = await import('../utils/componentUtils');
                exportToCSV(dataToExport, `${endpoint.replace(/\//g, '_')}_export.csv`);
            } else if (format === 'json') {
                const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${endpoint.replace(/\//g, '_')}_export.json`;
                link.click();
                URL.revokeObjectURL(url);
            }

            addNotification({
                type: 'success',
                title: 'Exportación exitosa',
                message: `Datos exportados en formato ${format.toUpperCase()}`,
            });
        } catch (err) {
            addNotification({
                type: 'error',
                title: 'Error de exportación',
                message: 'No se pudieron exportar los datos',
            });
        }
    }, [data, endpoint, addNotification]);

    // Refresh data
    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Get fresh data (bypass cache)
    const refetch = useCallback(async (params = {}) => {
        if (cacheKey) {
            localStorage.removeItem(`table_cache_${cacheKey}`);
        }
        await fetchData(params);
    }, [fetchData, cacheKey]);

    // Computed values
    const isEmpty = useMemo(() => data.length === 0, [data]);
    const hasError = useMemo(() => error !== null, [error]);
    const isStale = useMemo(() => {
        if (!lastFetch || !refreshInterval) return false;
        return Date.now() - lastFetch > refreshInterval;
    }, [lastFetch, refreshInterval]);

    return {
        // Data state
        data,
        loading,
        error,
        totalCount,
        isEmpty,
        hasError,
        isStale,
        lastFetch,

        // Actions
        fetchData,
        fetchServerData,
        refresh,
        refetch,
        createItem,
        updateItem,
        deleteItem,
        bulkDelete,
        bulkUpdate,
        exportData,

        // Utilities
        setData,
        setError,
        clearError: () => setError(null),
    };
};

export default useAdvancedTableData;
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar funcionalidades offline
 */
export const useOffline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);
    const [offlineQueue, setOfflineQueue] = useState([]);
    const [syncInProgress, setSyncInProgress] = useState(false);

    // Manejar cambios de conectividad
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setWasOffline(false);
                // Sincronizar datos pendientes
                syncOfflineData();
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    // Cargar cola offline del localStorage
    useEffect(() => {
        const loadOfflineQueue = () => {
            try {
                const stored = localStorage.getItem('febadom_offline_queue');
                if (stored) {
                    setOfflineQueue(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Error loading offline queue:', error);
            }
        };

        loadOfflineQueue();
    }, []);

    // Guardar cola offline en localStorage
    const saveOfflineQueue = useCallback((queue) => {
        try {
            localStorage.setItem('febadom_offline_queue', JSON.stringify(queue));
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }, []);

    // Agregar acción a la cola offline
    const addToOfflineQueue = useCallback((action) => {
        const newAction = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            ...action
        };

        setOfflineQueue(prev => {
            const updated = [...prev, newAction];
            saveOfflineQueue(updated);
            return updated;
        });

        return newAction.id;
    }, [saveOfflineQueue]);

    // Remover acción de la cola offline
    const removeFromOfflineQueue = useCallback((actionId) => {
        setOfflineQueue(prev => {
            const updated = prev.filter(action => action.id !== actionId);
            saveOfflineQueue(updated);
            return updated;
        });
    }, [saveOfflineQueue]);

    // Sincronizar datos offline
    const syncOfflineData = useCallback(async () => {
        if (syncInProgress || offlineQueue.length === 0) return;

        setSyncInProgress(true);

        try {
            const results = [];

            for (const action of offlineQueue) {
                try {
                    const result = await executeOfflineAction(action);
                    results.push({ action, result, success: true });
                    removeFromOfflineQueue(action.id);
                } catch (error) {
                    console.error('Failed to sync offline action:', action, error);
                    results.push({ action, error, success: false });
                }
            }

            return results;
        } finally {
            setSyncInProgress(false);
        }
    }, [syncInProgress, offlineQueue, removeFromOfflineQueue]);

    // Ejecutar acción offline
    const executeOfflineAction = async (action) => {
        const { type, url, method, data, headers } = action;

        switch (type) {
            case 'api_request':
                const response = await fetch(url, {
                    method: method || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    body: data ? JSON.stringify(data) : undefined
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();

            case 'form_submission':
                // Manejar envío de formularios
                return await submitForm(action.formData, action.endpoint);

            case 'file_upload':
                // Manejar subida de archivos
                return await uploadFile(action.file, action.endpoint);

            default:
                throw new Error(`Unknown offline action type: ${type}`);
        }
    };

    // Funciones auxiliares
    const submitForm = async (formData, endpoint) => {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Form submission failed: ${response.statusText}`);
        }

        return await response.json();
    };

    const uploadFile = async (file, endpoint) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`File upload failed: ${response.statusText}`);
        }

        return await response.json();
    };

    // Limpiar cola offline
    const clearOfflineQueue = useCallback(() => {
        setOfflineQueue([]);
        localStorage.removeItem('febadom_offline_queue');
    }, []);

    // Obtener datos desde cache
    const getCachedData = useCallback(async (key) => {
        try {
            const cache = await caches.open('febadom-api-v1.0.0');
            const response = await cache.match(key);

            if (response) {
                return await response.json();
            }

            return null;
        } catch (error) {
            console.error('Error getting cached data:', error);
            return null;
        }
    }, []);

    // Guardar datos en cache
    const setCachedData = useCallback(async (key, data) => {
        try {
            const cache = await caches.open('febadom-api-v1.0.0');
            const response = new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'max-age=86400' // 24 horas
                }
            });

            await cache.put(key, response);
            return true;
        } catch (error) {
            console.error('Error setting cached data:', error);
            return false;
        }
    }, []);

    // Verificar si hay datos en cache
    const hasCachedData = useCallback(async (key) => {
        try {
            const cache = await caches.open('febadom-api-v1.0.0');
            const response = await cache.match(key);
            return !!response;
        } catch (error) {
            console.error('Error checking cached data:', error);
            return false;
        }
    }, []);

    return {
        // Estados
        isOnline,
        wasOffline,
        offlineQueue,
        syncInProgress,

        // Funciones de cola offline
        addToOfflineQueue,
        removeFromOfflineQueue,
        syncOfflineData,
        clearOfflineQueue,

        // Funciones de cache
        getCachedData,
        setCachedData,
        hasCachedData,
    };
};

/**
 * Hook para datos offline específicos
 */
export const useOfflineData = (key, fetcher, options = {}) => {
    const {
        cacheTime = 24 * 60 * 60 * 1000, // 24 horas
        staleTime = 5 * 60 * 1000, // 5 minutos
        refetchOnReconnect = true,
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const { isOnline, getCachedData, setCachedData } = useOffline();

    // Cargar datos
    const loadData = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            // Intentar cargar desde cache primero
            if (!forceRefresh) {
                const cachedData = await getCachedData(key);
                if (cachedData && cachedData.timestamp) {
                    const age = Date.now() - new Date(cachedData.timestamp).getTime();

                    if (age < staleTime || !isOnline) {
                        setData(cachedData.data);
                        setLastFetch(new Date(cachedData.timestamp));
                        setLoading(false);

                        // Si los datos no están muy viejos, no hacer fetch
                        if (age < staleTime) {
                            return cachedData.data;
                        }
                    }
                }
            }

            // Intentar fetch si estamos online
            if (isOnline) {
                const freshData = await fetcher();
                const dataWithTimestamp = {
                    data: freshData,
                    timestamp: new Date().toISOString()
                };

                await setCachedData(key, dataWithTimestamp);
                setData(freshData);
                setLastFetch(new Date());

                return freshData;
            } else {
                // Si estamos offline y no hay datos en cache
                if (!data) {
                    throw new Error('No hay datos disponibles sin conexión');
                }
            }
        } catch (err) {
            setError(err);

            // Intentar cargar datos viejos del cache como fallback
            const cachedData = await getCachedData(key);
            if (cachedData) {
                setData(cachedData.data);
                setLastFetch(new Date(cachedData.timestamp));
            }
        } finally {
            setLoading(false);
        }
    }, [key, fetcher, isOnline, staleTime, getCachedData, setCachedData, data]);

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Refetch cuando se reconecta
    useEffect(() => {
        if (isOnline && refetchOnReconnect && lastFetch) {
            const age = Date.now() - lastFetch.getTime();
            if (age > staleTime) {
                loadData();
            }
        }
    }, [isOnline, refetchOnReconnect, lastFetch, staleTime, loadData]);

    const refetch = useCallback(() => {
        return loadData(true);
    }, [loadData]);

    return {
        data,
        loading,
        error,
        lastFetch,
        refetch,
        isStale: lastFetch && (Date.now() - lastFetch.getTime()) > staleTime,
    };
};

export default useOffline;
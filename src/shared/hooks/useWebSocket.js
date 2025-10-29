import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../api/services/websocketService';

export const useWebSocket = (url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000', options = {}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [lastMessage, setLastMessage] = useState(null);
    const unsubscribeRefs = useRef([]);

    // Verificar si WebSocket está habilitado
    const wsEnabled = import.meta.env.VITE_WS_ENABLED !== 'false';

    const {
        autoConnect = true,
        reconnectOnMount = true,
        maxReconnectAttempts = 5
    } = options;

    // Conectar al WebSocket
    const connect = useCallback(() => {
        if (!wsEnabled) {
            console.log('[WebSocket] Deshabilitado por configuración');
            return;
        }
        try {
            websocketService.connect(url);
        } catch (error) {
            setConnectionError(error);
        }
    }, [url, wsEnabled]);

    // Desconectar del WebSocket
    const disconnect = useCallback(() => {
        websocketService.disconnect();
        setIsConnected(false);
    }, []);

    // Enviar mensaje
    const sendMessage = useCallback((event, data) => {
        return websocketService.send(event, data);
    }, []);

    // Suscribirse a eventos
    const subscribe = useCallback((event, callback) => {
        const unsubscribe = websocketService.on(event, callback);
        unsubscribeRefs.current.push(unsubscribe);
        return unsubscribe;
    }, []);

    // Configurar listeners del servicio
    useEffect(() => {
        const unsubscribeStatus = websocketService.on('connection_status', ({ connected }) => {
            setIsConnected(connected);
            if (connected) {
                setConnectionError(null);
                setReconnectAttempts(0);
            }
        });

        const unsubscribeError = websocketService.on('connection_error', ({ error, attempts }) => {
            setConnectionError(error);
            setReconnectAttempts(attempts);
        });

        const unsubscribeReconnect = websocketService.on('reconnected', ({ attempts }) => {
            setReconnectAttempts(attempts);
        });

        unsubscribeRefs.current.push(unsubscribeStatus, unsubscribeError, unsubscribeReconnect);

        return () => {
            unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
            unsubscribeRefs.current = [];
        };
    }, []);

    // Auto-conectar si está habilitado
    useEffect(() => {
        if (autoConnect && !isConnected && wsEnabled) {
            connect();
        }

        return () => {
            if (!reconnectOnMount) {
                disconnect();
            }
        };
    }, [autoConnect, connect, disconnect, isConnected, reconnectOnMount]);

    return {
        isConnected,
        connectionError,
        reconnectAttempts,
        lastMessage,
        connect,
        disconnect,
        sendMessage,
        subscribe,
        // Métodos específicos de la aplicación
        subscribeToStats: websocketService.subscribeToStats.bind(websocketService),
        subscribeToGame: websocketService.subscribeToGame.bind(websocketService),
        subscribeToPlayer: websocketService.subscribeToPlayer.bind(websocketService),
        subscribeToTeam: websocketService.subscribeToTeam.bind(websocketService),
        subscribeToPredictions: websocketService.subscribeToPredictions.bind(websocketService),
        requestLiveStats: websocketService.requestLiveStats.bind(websocketService),
        setAlert: websocketService.setAlert.bind(websocketService)
    };
};

// Hook específico para estadísticas en tiempo real
export const useRealTimeStats = (filters = {}) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isConnected, subscribe, subscribeToStats } = useWebSocket();

    useEffect(() => {
        if (!isConnected) return;

        setLoading(true);

        // Suscribirse a actualizaciones de estadísticas
        const unsubscribe = subscribe('stats_update', (data) => {
            setStats(data);
            setLoading(false);
            setError(null);
        });

        // Solicitar estadísticas iniciales
        subscribeToStats(filters);

        return unsubscribe;
    }, [isConnected, filters, subscribe, subscribeToStats]);

    return { stats, loading, error, isConnected };
};

// Hook para actualizaciones de juegos en vivo
export const useLiveGame = (gameId) => {
    const [gameData, setGameData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isConnected, subscribe, subscribeToGame } = useWebSocket();

    useEffect(() => {
        if (!isConnected || !gameId) return;

        setLoading(true);

        const unsubscribe = subscribe('game_update', (data) => {
            if (data.gameId === gameId) {
                setGameData(data);
                setLoading(false);
                setError(null);
            }
        });

        subscribeToGame(gameId);

        return unsubscribe;
    }, [isConnected, gameId, subscribe, subscribeToGame]);

    return { gameData, loading, error, isConnected };
};

// Hook para alertas
export const useAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const { isConnected, subscribe, setAlert } = useWebSocket();

    useEffect(() => {
        if (!isConnected) return;

        const unsubscribe = subscribe('alert', (alertData) => {
            setAlerts(prev => [alertData, ...prev.slice(0, 9)]); // Mantener solo las últimas 10 alertas
        });

        return unsubscribe;
    }, [isConnected, subscribe]);

    const addAlert = useCallback((alertConfig) => {
        return setAlert(alertConfig);
    }, [setAlert]);

    const removeAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, []);

    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    return {
        alerts,
        addAlert,
        removeAlert,
        clearAlerts,
        isConnected
    };
};

export default useWebSocket;
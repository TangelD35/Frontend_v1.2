import { io } from 'socket.io-client';
import config from '../../../lib/constants';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = config.websocket.reconnectAttempts;
        this.reconnectDelay = config.websocket.reconnectDelay;
        this.listeners = new Map();
    }

    connect(url = config.websocket.url) {
        try {
            this.socket = io(url, {
                transports: ['websocket', 'polling'],
                timeout: 5000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay
            });

            this.setupEventListeners();
            return this.socket;
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            return null;
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connection_status', { connected: true });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.isConnected = false;
            this.emit('connection_status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            this.reconnectAttempts++;
            // Solo mostrar error después de varios intentos fallidos
            if (this.reconnectAttempts >= 3) {
                console.warn('WebSocket: Backend no disponible (intentos:', this.reconnectAttempts, ')');
            }
            this.emit('connection_error', { error, attempts: this.reconnectAttempts });
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('WebSocket reconnected after', attemptNumber, 'attempts');
            this.emit('reconnected', { attempts: attemptNumber });
        });

        // Eventos específicos de la aplicación
        this.socket.on('stats_update', (data) => {
            this.emit('stats_update', data);
        });

        this.socket.on('game_update', (data) => {
            this.emit('game_update', data);
        });

        this.socket.on('player_update', (data) => {
            this.emit('player_update', data);
        });

        this.socket.on('team_update', (data) => {
            this.emit('team_update', data);
        });

        this.socket.on('prediction_update', (data) => {
            this.emit('prediction_update', data);
        });

        this.socket.on('alert', (data) => {
            this.emit('alert', data);
        });
    }

    // Método para emitir eventos a los listeners locales
    emit(event, data) {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in listener for event ${event}:`, error);
            }
        });
    }

    // Suscribirse a eventos
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        // Retornar función para desuscribirse
        return () => {
            const listeners = this.listeners.get(event) || [];
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }

    // Desuscribirse de eventos
    off(event, callback) {
        const listeners = this.listeners.get(event) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    // Enviar datos al servidor
    send(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
            return true;
        } else {
            console.warn('WebSocket not connected. Cannot send:', event, data);
            return false;
        }
    }

    // Métodos específicos para la aplicación
    subscribeToStats(filters = {}) {
        return this.send('subscribe_stats', filters);
    }

    subscribeToGame(gameId) {
        return this.send('subscribe_game', { gameId });
    }

    subscribeToPlayer(playerId) {
        return this.send('subscribe_player', { playerId });
    }

    subscribeToTeam(teamId) {
        return this.send('subscribe_team', { teamId });
    }

    subscribeToPredictions() {
        return this.send('subscribe_predictions', {});
    }

    unsubscribeFromStats() {
        return this.send('unsubscribe_stats', {});
    }

    unsubscribeFromGame(gameId) {
        return this.send('unsubscribe_game', { gameId });
    }

    unsubscribeFromPlayer(playerId) {
        return this.send('unsubscribe_player', { playerId });
    }

    unsubscribeFromTeam(teamId) {
        return this.send('unsubscribe_team', { teamId });
    }

    unsubscribeFromPredictions() {
        return this.send('unsubscribe_predictions', {});
    }

    // Solicitar datos específicos
    requestLiveStats() {
        return this.send('request_live_stats', {});
    }

    requestGameUpdate(gameId) {
        return this.send('request_game_update', { gameId });
    }

    requestPlayerStats(playerId, timeframe = '24h') {
        return this.send('request_player_stats', { playerId, timeframe });
    }

    requestTeamStats(teamId, timeframe = '24h') {
        return this.send('request_team_stats', { teamId, timeframe });
    }

    // Configurar alertas
    setAlert(alertConfig) {
        return this.send('set_alert', alertConfig);
    }

    removeAlert(alertId) {
        return this.send('remove_alert', { alertId });
    }

    // Gestión de conexión
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
        }
    }

    reconnect() {
        if (this.socket) {
            this.socket.connect();
        }
    }

    getConnectionStatus() {
        return {
            connected: this.isConnected,
            attempts: this.reconnectAttempts,
            socket: this.socket?.connected || false
        };
    }

    // Cleanup
    destroy() {
        this.disconnect();
        this.listeners.clear();
    }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
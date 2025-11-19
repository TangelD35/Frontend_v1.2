import { config } from './index';


// Constantes de API
export const API_BASE_URL = config.api.baseURL;
export const WS_BASE_URL = config.websocket.url;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout'
    },
    PLAYERS: {
        LIST: '/players',
        DETAIL: '/players/:id',
        CREATE: '/players',
        UPDATE: '/players/:id',
        DELETE: '/players/:id'
    },
    GAMES: {
        LIST: '/games',
        DETAIL: '/games/:id',
        CREATE: '/games',
        UPDATE: '/games/:id',
        DELETE: '/games/:id'
    },
    TEAMS: {
        LIST: '/teams',
        DETAIL: '/teams/:id',
        CREATE: '/teams',
        UPDATE: '/teams/:id',
        DELETE: '/teams/:id'
    },
    ANALYTICS: {
        DASHBOARD: '/analytics/dashboard',
        PREDICTIONS: '/analytics/predictions',
        STATS: '/analytics/stats'
    }
};
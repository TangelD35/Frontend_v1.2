import axiosInstance from './axiosConfig';

/**
 * Servicio para endpoints de Machine Learning
 * Conecta con /api/v1/ml
 */
export const mlPredictionsService = {
    // ==================== INFORMACIÓN DE MODELOS ====================

    /**
     * Obtener información de todos los modelos ML disponibles
     * @returns {Promise<Object>} Información de modelos
     */
    getModelsInfo: async () => {
        const response = await axiosInstance.get('/ml/models/info');
        return response.data;
    },

    // ==================== PREDICCIÓN DE PUNTOS DE JUGADOR ====================

    /**
     * Predecir puntos que anotará un jugador
     * @param {Object} data - Datos del jugador
     * @param {number} data.minutes_played - Minutos jugados (0-48)
     * @param {number} data.field_goal_percentage - FG% (0-100)
     * @param {number} data.free_throw_percentage - FT% (0-100)
     * @param {number} data.total_rebounds - Rebotes totales
     * @param {number} data.assists - Asistencias
     * @param {number} data.field_goals_made - Tiros de campo anotados
     * @param {number} data.three_point_made - Triples anotados
     * @returns {Promise<Object>} Predicción de puntos
     */
    predictPlayerPoints: async (data) => {
        const response = await axiosInstance.post('/ml/predict-player-points', data);
        return response.data;
    },

    // ==================== PRONÓSTICO DE RENDIMIENTO DE JUGADOR ====================

    /**
     * Pronosticar rendimiento futuro de un jugador
     * @param {Object} data - Datos históricos del jugador
     * @param {number} data.edad - Edad del jugador (15-50)
     * @param {number} data.mpg - Minutos por partido (0-48)
     * @param {number} data.efficiency - Eficiencia del jugador
     * @param {number} data.rpg - Rebotes por partido
     * @param {number} data.apg - Asistencias por partido
     * @param {number} data.hist_ppg - Promedio histórico de puntos
     * @param {number} data.hist_efficiency - Promedio histórico de eficiencia
     * @param {number} data.num_torneos - Número de torneos jugados
     * @param {number} data.experiencia - Total de partidos en carrera
     * @returns {Promise<Object>} Pronóstico de rendimiento
     */
    forecastPlayerPerformance: async (data) => {
        const response = await axiosInstance.post('/ml/forecast-player-performance', data);
        return response.data;
    },

    // ==================== PREDICCIÓN DE RESULTADO DE PARTIDO ====================

    /**
     * Predecir resultado de un partido RD vs Rival
     * @param {Object} data - Datos del partido
     * @param {boolean} data.rd_es_local - ¿RD juega como local?
     * @param {number} data.rd_fg_pct - FG% de RD (0-100)
     * @param {number} data.rival_fg_pct - FG% del rival (0-100)
     * @param {number} data.rd_reb - Rebotes de RD
     * @param {number} data.rival_reb - Rebotes del rival
     * @param {number} data.rd_ast - Asistencias de RD
     * @param {number} data.rival_ast - Asistencias del rival
     * @returns {Promise<Object>} Predicción de resultado
     */
    predictGameOutcome: async (data) => {
        const response = await axiosInstance.post('/ml/predict-game-outcome', data);
        return response.data;
    },

    // ==================== CLUSTERING DE EQUIPOS ====================

    /**
     * Clasificar estilo de juego de un equipo (clustering simple)
     * @param {Object} data - Estadísticas del equipo
     * @param {number} data.points_per_game - Puntos por partido (o points)
     * @param {number} data.field_goal_percentage - FG% (0-100) (o field_goals_percentage)
     * @param {number} data.three_point_percentage - 3P% (0-100)
     * @param {number} data.free_throw_percentage - FT% (0-100)
     * @param {number} data.rebounds_per_game - Rebotes por partido (o total_rebounds)
     * @param {number} data.assists_per_game - Asistencias por partido (o assists)
     * @param {number} data.steals_per_game - Robos por partido (o steals)
     * @param {number} data.blocks_per_game - Bloqueos por partido (o blocks)
     * @param {number} data.turnovers_per_game - Pérdidas por partido (o turnovers)
     * @param {number} data.win_percentage - Porcentaje de victorias (0-100)
     * @returns {Promise<Object>} Cluster asignado
     */
    predictTeamCluster: async (data) => {
        // Transformar nombres de campos al formato esperado por el backend
        const teamStats = {
            points: data.points_per_game || data.points || 0,
            field_goals_percentage: data.field_goal_percentage || data.field_goals_percentage || 0,
            three_point_percentage: data.three_point_percentage || 0,
            free_throw_percentage: data.free_throw_percentage || 0,
            total_rebounds: data.rebounds_per_game || data.total_rebounds || 0,
            assists: data.assists_per_game || data.assists || 0,
            steals: data.steals_per_game || data.steals || 0,
            blocks: data.blocks_per_game || data.blocks || 0,
            turnovers: data.turnovers_per_game || data.turnovers || 0,
            win_percentage: data.win_percentage || 0
        };

        const response = await axiosInstance.post('/ml/team-clustering', { team_stats: teamStats });
        return response.data;
    },

    /**
     * Clustering avanzado con PCA
     * @param {Object} data - Estadísticas completas del equipo
     * @returns {Promise<Object>} Análisis avanzado de cluster
     */
    advancedClustering: async (data) => {
        const response = await axiosInstance.post('/ml/advanced-clustering', data);
        return response.data;
    },

    // ==================== OPTIMIZACIÓN DE LINEUPS ====================

    /**
     * Optimizar lineup de jugadores
     * @param {Object} data - Datos de jugadores disponibles
     * @param {Array<string>} data.available_players - IDs de jugadores
     * @returns {Promise<Object>} Lineup óptimo
     */
    optimizeLineup: async (data) => {
        const response = await axiosInstance.post('/ml/optimize-lineup', data);
        return response.data;
    },

    // ==================== NUEVOS ENDPOINTS V2 ====================

    /**
     * Obtener importancia de features de un modelo
     * @param {string} modelName - Nombre del modelo (game_outcome, player_points, etc.)
     * @returns {Promise<Object>} Feature importance
     */
    getFeatureImportance: async (modelName) => {
        const response = await axiosInstance.get(`/ml/feature-importance/${modelName}`);
        return response.data;
    },

    /**
     * Obtener métricas detalladas de un modelo
     * @param {string} modelName - Nombre del modelo
     * @returns {Promise<Object>} Métricas del modelo
     */
    getModelMetrics: async (modelName) => {
        const response = await axiosInstance.get(`/ml/model-metrics/${modelName}`);
        return response.data;
    },

    /**
     * Obtener resumen de todos los modelos V2
     * @returns {Promise<Object>} Resumen completo de modelos
     */
    getModelsSummary: async () => {
        const response = await axiosInstance.get('/ml/models/summary');
        return response.data;
    },

    // ==================== UTILIDADES ====================

    /**
     * Calcular True Shooting % (TS%)
     * @param {number} points - Puntos anotados
     * @param {number} fga - Intentos de tiro de campo
     * @param {number} fta - Intentos de tiros libres
     * @returns {number} TS%
     */
    calculateTrueShootingPercentage: (points, fga, fta) => {
        if (fga === 0 && fta === 0) return 0;
        return (points / (2 * (fga + 0.44 * fta))) * 100;
    },

    /**
     * Calcular Effective FG % (eFG%)
     * @param {number} fgm - Tiros de campo anotados
     * @param {number} fg3m - Triples anotados
     * @param {number} fga - Intentos de tiro de campo
     * @returns {number} eFG%
     */
    calculateEffectiveFGPercentage: (fgm, fg3m, fga) => {
        if (fga === 0) return 0;
        return ((fgm + 0.5 * fg3m) / fga) * 100;
    },

    /**
     * Calcular Four Factors
     * @param {Object} stats - Estadísticas del equipo
     * @returns {Object} Four Factors
     */
    calculateFourFactors: (stats) => {
        const { fgm, fg3m, fga, tov, possessions, oreb, dreb, fta } = stats;

        return {
            efg: ((fgm + 0.5 * fg3m) / fga) * 100,
            tov_pct: (tov / possessions) * 100,
            orb_pct: (oreb / (oreb + dreb)) * 100,
            ft_rate: (fta / fga) * 100
        };
    },
};

export default mlPredictionsService;

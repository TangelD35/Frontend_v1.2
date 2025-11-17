import axiosInstance from './axiosConfig';

/**
 * Servicio para endpoints de Machine Learning
 * Conecta con /api/v1/ml-predictions
 */
export const mlPredictionsService = {
    // ==================== INFORMACIÓN DE MODELOS ====================

    /**
     * Obtener información de todos los modelos ML disponibles
     * @returns {Promise<Object>} Información de modelos
     */
    getModelsInfo: async () => {
        const response = await axiosInstance.get('/ml-predictions/models/info');
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
        const response = await axiosInstance.post('/ml-predictions/predict-player-points', data);
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
        const response = await axiosInstance.post('/ml-predictions/forecast-player-performance', data);
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
        const response = await axiosInstance.post('/ml-predictions/predict-game-outcome', data);
        return response.data;
    },

    // ==================== CLUSTERING DE EQUIPOS ====================

    /**
     * Clasificar estilo de juego de un equipo (clustering simple)
     * @param {Object} data - Estadísticas del equipo
     * @param {number} data.points_per_game - Puntos por partido
     * @param {number} data.field_goal_percentage - FG% (0-100)
     * @param {number} data.three_point_percentage - 3P% (0-100)
     * @param {number} data.free_throw_percentage - FT% (0-100)
     * @param {number} data.rebounds_per_game - Rebotes por partido
     * @param {number} data.assists_per_game - Asistencias por partido
     * @param {number} data.steals_per_game - Robos por partido
     * @param {number} data.blocks_per_game - Bloqueos por partido
     * @param {number} data.turnovers_per_game - Pérdidas por partido
     * @param {number} data.win_percentage - Porcentaje de victorias (0-1)
     * @returns {Promise<Object>} Cluster asignado
     */
    predictTeamCluster: async (data) => {
        const response = await axiosInstance.post('/ml-predictions/predict-team-cluster', data);
        return response.data;
    },

    /**
     * Clustering avanzado con PCA
     * @param {Object} data - Estadísticas completas del equipo
     * @returns {Promise<Object>} Análisis avanzado de cluster
     */
    advancedClustering: async (data) => {
        const response = await axiosInstance.post('/ml-predictions/advanced-clustering', data);
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
        const response = await axiosInstance.post('/ml-predictions/optimize-lineup', data);
        return response.data;
    },
};

export default mlPredictionsService;

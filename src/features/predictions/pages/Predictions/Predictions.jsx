import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Target, Activity, Users, Play, RefreshCw, Gauge, CheckCircle, AlertCircle, TrendingUp, Award,
    History, Download, FileJson, FileText, Trash2, X, Zap, Shield, BarChart3
} from 'lucide-react';
import mlPredictionsService from '../../../../shared/api/endpoints/mlPredictions';
import playersService from '../../../../shared/api/endpoints/players';
import analyticsService from '../../../../shared/api/endpoints/analytics';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import GaugeChart from '../../components/GaugeChart';
import ProgressBar from '../../components/ProgressBar';
import FeatureImportance from '../../components/FeatureImportance';
import MetricsCard, { MetricsGrid } from '../../components/MetricsCard';
import ScenarioComparison from '../../components/ScenarioComparison';
import { PageHeader } from '../../../../shared/ui/components/common';
import PlayerSelector from '../../components/PlayerSelector';

const Predictions = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modelsInfo, setModelsInfo] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);

    // Estado para jugador seleccionado
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);

    const [gameData, setGameData] = useState({
        rd_es_local: true, rd_fg_pct: 45.0, rival_fg_pct: 43.0,
        rd_reb: 42.0, rival_reb: 40.0, rd_ast: 22.0, rival_ast: 20.0
    });
    const [gamePrediction, setGamePrediction] = useState(null);
    const [loadingGame, setLoadingGame] = useState(false);

    // Inicializar con valores vacíos en lugar de hardcodeados
    const [playerPointsData, setPlayerPointsData] = useState({
        minutes_played: 0,
        field_goal_percentage: 0,
        free_throw_percentage: 0,
        total_rebounds: 0,
        assists: 0,
        field_goals_made: 0,
        three_point_made: 0
    });
    const [playerPointsPrediction, setPlayerPointsPrediction] = useState(null);
    const [loadingPlayerPoints, setLoadingPlayerPoints] = useState(false);

    const [teamClusterData, setTeamClusterData] = useState({
        points_per_game: 85.5, field_goal_percentage: 45.0, three_point_percentage: 35.0,
        free_throw_percentage: 75.0, rebounds_per_game: 42.0, assists_per_game: 22.0,
        steals_per_game: 8.0, blocks_per_game: 5.0, turnovers_per_game: 14.0, win_percentage: 60.0
    });
    const [teamClusterPrediction, setTeamClusterPrediction] = useState(null);
    const [loadingTeamCluster, setLoadingTeamCluster] = useState(false);

    // Estados para Pronóstico de Rendimiento
    const [playerForecastData, setPlayerForecastData] = useState({
        edad: 25, mpg: 32.0, efficiency: 18.5, rpg: 8.0, apg: 5.0,
        hist_ppg: 16.5, hist_efficiency: 17.2, num_torneos: 8, experiencia: 120
    });
    const [playerForecast, setPlayerForecast] = useState(null);
    const [loadingPlayerForecast, setLoadingPlayerForecast] = useState(false);

    // Estados para Optimización de Lineups
    const [lineupData, setLineupData] = useState({ available_players: [] });
    const [lineupOptimization, setLineupOptimization] = useState(null);
    const [loadingLineup, setLoadingLineup] = useState(false);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    // Estados para validaciones
    const [validationErrors, setValidationErrors] = useState({});

    // Estados para historial
    const [predictionHistory, setPredictionHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Estados para Feature Importance y Métricas V2
    const [featureImportance, setFeatureImportance] = useState({});
    const [modelMetrics, setModelMetrics] = useState({});
    const [modelsSummary, setModelsSummary] = useState(null);
    const [loadingFeatures, setLoadingFeatures] = useState(false);

    // Estados para Comparación de Escenarios
    const [gameScenarios, setGameScenarios] = useState([]);
    const [playerScenarios, setPlayerScenarios] = useState([]);
    const [forecastScenarios, setForecastScenarios] = useState([]);

    useEffect(() => {
        if (activeTab === 'lineup') {
            loadAvailablePlayers();
        }
    }, [activeTab]);

    // Cargar historial desde localStorage
    const loadHistoryFromStorage = () => {
        try {
            const saved = localStorage.getItem('predictions_history');
            if (saved) {
                setPredictionHistory(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    // Guardar predicción en historial
    const saveToHistory = (type, data, result) => {
        const entry = {
            id: Date.now(),
            type,
            timestamp: new Date().toISOString(),
            data,
            result
        };
        const newHistory = [entry, ...predictionHistory].slice(0, 50); // Máximo 50 entradas
        setPredictionHistory(newHistory);
        localStorage.setItem('predictions_history', JSON.stringify(newHistory));
    };

    // Limpiar historial
    const clearHistory = () => {
        setPredictionHistory([]);
        localStorage.removeItem('predictions_history');
    };

    // Exportar resultados
    const exportResults = (format = 'json') => {
        if (format === 'json') {
            const dataStr = JSON.stringify(predictionHistory, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `predicciones_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } else if (format === 'csv') {
            const headers = ['Fecha', 'Tipo', 'Resultado'];
            const rows = predictionHistory.map(h => [
                new Date(h.timestamp).toLocaleString('es-DO'),
                h.type === 'game' ? 'Partido' :
                    h.type === 'player' ? 'Puntos' :
                        h.type === 'team' ? 'Clustering' :
                            h.type === 'forecast' ? 'Pronóstico' :
                                h.type === 'lineup' ? 'Lineup' : 'Otro',
                JSON.stringify(h.result)
            ]);
            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            const dataBlob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `predicciones_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }
    };

    // Validaciones avanzadas
    const validateGameData = () => {
        const errors = {};
        if (gameData.rd_fg_pct < 0 || gameData.rd_fg_pct > 100) errors.rd_fg_pct = 'FG% debe estar entre 0 y 100';
        if (gameData.rival_fg_pct < 0 || gameData.rival_fg_pct > 100) errors.rival_fg_pct = 'FG% debe estar entre 0 y 100';
        if (gameData.rd_reb < 0 || gameData.rd_reb > 80) errors.rd_reb = 'Rebotes deben estar entre 0 y 80';
        if (gameData.rival_reb < 0 || gameData.rival_reb > 80) errors.rival_reb = 'Rebotes deben estar entre 0 y 80';
        if (gameData.rd_ast < 0 || gameData.rd_ast > 50) errors.rd_ast = 'Asistencias deben estar entre 0 y 50';
        if (gameData.rival_ast < 0 || gameData.rival_ast > 50) errors.rival_ast = 'Asistencias deben estar entre 0 y 50';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePlayerData = () => {
        const errors = {};
        if (playerPointsData.minutes_played < 0 || playerPointsData.minutes_played > 48) errors.minutes_played = 'Minutos deben estar entre 0 y 48';
        if (playerPointsData.field_goal_percentage < 0 || playerPointsData.field_goal_percentage > 100) errors.field_goal_percentage = 'FG% debe estar entre 0 y 100';
        if (playerPointsData.free_throw_percentage < 0 || playerPointsData.free_throw_percentage > 100) errors.free_throw_percentage = 'FT% debe estar entre 0 y 100';
        if (playerPointsData.total_rebounds < 0 || playerPointsData.total_rebounds > 30) errors.total_rebounds = 'Rebotes deben estar entre 0 y 30';
        if (playerPointsData.assists < 0 || playerPointsData.assists > 20) errors.assists = 'Asistencias deben estar entre 0 y 20';
        if (playerPointsData.field_goals_made < 0 || playerPointsData.field_goals_made > 30) errors.field_goals_made = 'FG anotados deben estar entre 0 y 30';
        if (playerPointsData.three_point_made < 0 || playerPointsData.three_point_made > 15) errors.three_point_made = '3P anotados deben estar entre 0 y 15';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Cargar jugadores disponibles
    const loadAvailablePlayers = async () => {
        try {
            setLoadingPlayers(true);
            const response = await playersService.getAll({ limit: 100 });
            // La respuesta puede tener diferentes estructuras
            const players = response.items || response.data?.items || response.data || response || [];
            setAvailablePlayers(players);
            console.log('✅ Jugadores cargados:', players.length);
        } catch (error) {
            console.error('❌ Error loading players:', error);
        } finally {
            setLoadingPlayers(false);
        }
    };

    const validateTeamData = () => {
        const errors = {};
        if (teamClusterData.points_per_game < 0 || teamClusterData.points_per_game > 150) errors.points_per_game = 'Puntos/J deben estar entre 0 y 150';
        if (teamClusterData.field_goal_percentage < 0 || teamClusterData.field_goal_percentage > 100) errors.field_goal_percentage = 'FG% debe estar entre 0 y 100';
        if (teamClusterData.three_point_percentage < 0 || teamClusterData.three_point_percentage > 100) errors.three_point_percentage = '3P% debe estar entre 0 y 100';
        if (teamClusterData.free_throw_percentage < 0 || teamClusterData.free_throw_percentage > 100) errors.free_throw_percentage = 'FT% debe estar entre 0 y 100';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const loadModelsInfo = async () => {
        console.log('🤖 PREDICCIONES - Cargando información de modelos...');
        try {
            setLoadingModels(true);
            console.log('📡 REQUEST: GET /ml-predictions/models/info');
            const data = await mlPredictionsService.getModelsInfo();
            console.log('✅ RESPONSE modelos:', data);
            setModelsInfo(data);
        } catch (error) {
            console.error('❌ Error loading models:', error);
            console.error('📋 Error details:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
        } finally {
            setLoadingModels(false);
        }
    };

    const handlePredictGame = async () => {
        console.log('🎯 PREDICCIÓN JUEGO - Iniciando...');
        if (!validateGameData()) {
            console.log('❌ Validación fallida');
            alert('Por favor corrige los errores en el formulario');
            return;
        }
        try {
            setLoadingGame(true);
            console.log('📡 REQUEST: POST /ml-predictions/predict/game');
            console.log('📦 Datos enviados:', gameData);
            const result = await mlPredictionsService.predictGameOutcome(gameData);
            console.log('✅ RESPONSE predicción juego:', result);
            console.log('🏀 Probabilidad victoria:', result.win_probability);
            console.log('📊 Predicción:', result.prediction);
            setGamePrediction(result);
            saveToHistory('game', gameData, result);
        } catch (error) {
            console.error('❌ PREDICCIÓN JUEGO - Error completo:', error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
            console.error('📦 Datos enviados:', gameData);
            alert(`Error al predecir el resultado: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoadingGame(false);
        }
    };

    // Cargar estadísticas del jugador seleccionado
    const loadPlayerStats = async (player) => {
        if (!player) {
            setSelectedPlayer(null);
            setPlayerPointsData({
                minutes_played: 0,
                field_goal_percentage: 0,
                free_throw_percentage: 0,
                total_rebounds: 0,
                assists: 0,
                field_goals_made: 0,
                three_point_made: 0
            });
            return;
        }

        setSelectedPlayer(player);
        setLoadingPlayerStats(true);

        try {
            const playerName = player.full_name || `${player.first_name || ''} ${player.last_name || ''}`;
            const playerId = player.player_id || player.id;
            console.log('📊 Cargando stats para jugador:', playerName, '| ID:', playerId);

            const stats = await analyticsService.getPlayerStats(playerId);
            console.log('✅ Stats recibidas:', stats);

            const newData = {
                minutes_played: stats.offense?.avg_minutes || 30,
                field_goal_percentage: stats.offense?.shooting_efficiency?.fg_pct || 45,
                free_throw_percentage: stats.offense?.shooting_efficiency?.ft_pct || 75,
                total_rebounds: (
                    (stats.offense?.playmaking?.avg_offensive_rebounds || 0) +
                    (stats.defense?.defensive_metrics?.avg_defensive_rebounds || 0)
                ),
                assists: stats.offense?.playmaking?.avg_assists || 0,
                field_goals_made: stats.offense?.shooting_efficiency?.fg_made ||
                    Math.round((stats.offense?.shooting_efficiency?.fg_pct || 45) * (stats.offense?.avg_minutes || 30) / 100),
                three_point_made: stats.offense?.shooting_efficiency?.['3p_made'] || 0
            };

            setPlayerPointsData(newData);
            console.log('✅ Datos auto-completados:', newData);

        } catch (error) {
            console.error('❌ Error cargando stats del jugador:', error);
            alert('No se pudieron cargar las estadísticas del jugador. Usando valores por defecto.');

            setPlayerPointsData({
                minutes_played: 30,
                field_goal_percentage: 45,
                free_throw_percentage: 75,
                total_rebounds: 6,
                assists: 3,
                field_goals_made: 5,
                three_point_made: 1
            });
        } finally {
            setLoadingPlayerStats(false);
        }
    };

    const handlePredictPlayerPoints = async () => {
        console.log('👤 PREDICCIÓN PUNTOS JUGADOR - Iniciando...');

        if (!selectedPlayer) {
            alert('Por favor selecciona un jugador primero');
            return;
        }

        if (!validatePlayerData()) {
            console.log('❌ Validación fallida');
            alert('Por favor corrige los errores en el formulario');
            return;
        }

        try {
            setLoadingPlayerPoints(true);
            console.log('📡 REQUEST: POST /ml-predictions/predict/player-points');
            console.log('📦 Datos enviados:', playerPointsData);
            const result = await mlPredictionsService.predictPlayerPoints(playerPointsData);
            console.log('✅ RESPONSE puntos jugador:', result);
            console.log('🎯 Puntos predichos:', result.predicted_points);
            setPlayerPointsPrediction(result);
            saveToHistory('player', playerPointsData, result);
        } catch (error) {
            console.error('❌ PREDICCIÓN PUNTOS - Error:', error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
            console.error('📦 Datos enviados:', playerPointsData);
            alert('Error al predecir puntos');
        } finally {
            setLoadingPlayerPoints(false);
        }
    };

    const handlePredictTeamCluster = async () => {
        console.log('📈 PREDICCIÓN CLUSTER EQUIPO - Iniciando...');
        if (!validateTeamData()) {
            console.log('❌ Validación fallida');
            alert('Por favor corrige los errores en el formulario');
            return;
        }
        try {
            setLoadingTeamCluster(true);
            console.log('📡 REQUEST: POST /ml-predictions/predict/team-cluster');
            console.log('📦 Datos enviados:', teamClusterData);
            const result = await mlPredictionsService.predictTeamCluster(teamClusterData);
            console.log('✅ RESPONSE cluster equipo:', result);
            console.log('📊 Cluster:', result.cluster);
            console.log('📊 Características:', result.cluster_characteristics);
            setTeamClusterPrediction(result);
            saveToHistory('team', teamClusterData, result);
        } catch (error) {
            console.error('❌ PREDICCIÓN CLUSTER - Error completo:', error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
            console.error('📦 Datos enviados:', teamClusterData);
            alert(`Error al clasificar equipo: ${error.response?.data?.message || error.message}\n${JSON.stringify(error.response?.data?.details || {})}`);
        } finally {
            setLoadingTeamCluster(false);
        }
    };

    const handleForecastPlayerPerformance = async () => {
        console.log('📊 PRONÓSTICO RENDIMIENTO JUGADOR - Iniciando...');
        try {
            setLoadingPlayerForecast(true);
            console.log('📡 REQUEST: POST /ml-predictions/forecast/player-performance');
            console.log('📦 Datos enviados:', playerForecastData);
            const result = await mlPredictionsService.forecastPlayerPerformance(playerForecastData);
            console.log('✅ RESPONSE pronóstico rendimiento:', result);
            console.log('📊 Predicción:', result.prediction);
            console.log('📊 Tendencia:', result.trend);
            console.log('📊 Análisis:', result.analysis);
            setPlayerForecast(result);
            saveToHistory('forecast', playerForecastData, result);
        } catch (error) {
            console.error('❌ PRONÓSTICO RENDIMIENTO - Error:', error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
            console.error('📦 Datos enviados:', playerForecastData);
            alert(`Error al pronosticar rendimiento: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoadingPlayerForecast(false);
        }
    };

    const handleOptimizeLineup = async () => {
        console.log('⚡ OPTIMIZACIÓN LINEUP - Iniciando...');
        if (!lineupData.available_players || lineupData.available_players.length === 0) {
            console.log('❌ No hay jugadores disponibles');
            alert('Por favor ingresa los IDs de jugadores disponibles');
            return;
        }
        try {
            setLoadingLineup(true);
            console.log('📡 REQUEST: POST /ml-predictions/optimize/lineup');
            console.log('📦 Datos enviados:', lineupData);
            const result = await mlPredictionsService.optimizeLineup(lineupData);
            console.log('✅ RESPONSE lineup optimizado:', result);
            console.log('🏆 Lineup óptimo:', result.optimal_lineup);
            console.log('👥 Total jugadores:', result.total_players);
            console.log('📊 Distribución de roles:', result.roles_distribution);
            console.log('💡 Recomendación:', result.recommendation);
            setLineupOptimization(result);
            saveToHistory('lineup', lineupData, result);
        } catch (error) {
            console.error('❌ OPTIMIZACIÓN LINEUP - Error:', error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
            console.error('📦 Datos enviados:', lineupData);
            alert(`Error al optimizar lineup: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoadingLineup(false);
        }
    };

    const loadFeatureImportance = async (modelName) => {
        console.log(`📊 FEATURE IMPORTANCE - Cargando para modelo: ${modelName}`);
        try {
            setLoadingFeatures(true);
            console.log(`📡 REQUEST: GET /ml-predictions/models/${modelName}/feature-importance`);
            const data = await mlPredictionsService.getFeatureImportance(modelName);
            console.log(`✅ RESPONSE feature importance (${modelName}):`, data);
            setFeatureImportance(prev => ({ ...prev, [modelName]: data }));
        } catch (error) {
            console.error(`❌ Error loading feature importance for ${modelName}:`, error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
        } finally {
            setLoadingFeatures(false);
        }
    };

    const loadModelMetrics = async (modelName) => {
        console.log(`📈 MODEL METRICS - Cargando para modelo: ${modelName}`);
        try {
            console.log(`📡 REQUEST: GET /ml-predictions/models/${modelName}/metrics`);
            const data = await mlPredictionsService.getModelMetrics(modelName);
            console.log(`✅ RESPONSE metrics (${modelName}):`, data);
            console.log(`   - Accuracy: ${data.accuracy}`);
            console.log(`   - Precision: ${data.precision}`);
            console.log(`   - Recall: ${data.recall}`);
            setModelMetrics(prev => ({ ...prev, [modelName]: data }));
        } catch (error) {
            console.error(`❌ Error loading metrics for ${modelName}:`, error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
        }
    };

    const loadModelsSummary = async () => {
        console.log('📋 MODELS SUMMARY - Cargando resumen de todos los modelos...');
        try {
            console.log('📡 REQUEST: GET /ml-predictions/models/summary');
            const data = await mlPredictionsService.getModelsSummary();
            console.log('✅ RESPONSE models summary:', data);
            console.log('🤖 Total modelos en summary:', Object.keys(data?.models || {}).length);
            console.log('📋 Modelos disponibles:', Object.keys(data?.models || {}));
            setModelsSummary(data);
        } catch (error) {
            console.error('❌ Error loading models summary:', error);
            console.error('📋 Respuesta:', error.response?.data);
            console.error('🔗 URL:', error.config?.url);
        }
    };

    const addScenario = (type, prediction) => {
        const scenario = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...prediction
        };

        switch (type) {
            case 'game':
                if (gameScenarios.length < 4) {
                    setGameScenarios([...gameScenarios, scenario]);
                }
                break;
            case 'player':
                if (playerScenarios.length < 4) {
                    setPlayerScenarios([...playerScenarios, scenario]);
                }
                break;
            case 'forecast':
                if (forecastScenarios.length < 4) {
                    setForecastScenarios([...forecastScenarios, scenario]);
                }
                break;
        }
    };

    const removeScenario = (type, scenarioId) => {
        switch (type) {
            case 'game':
                setGameScenarios(gameScenarios.filter(s => s.id !== scenarioId));
                break;
            case 'player':
                setPlayerScenarios(playerScenarios.filter(s => s.id !== scenarioId));
                break;
            case 'forecast':
                setForecastScenarios(forecastScenarios.filter(s => s.id !== scenarioId));
                break;
        }
    };

    const availableModels = 5; // Total de modelos ML disponibles
    const totalModels = modelsInfo ? Object.keys(modelsInfo).length : 0;

    useEffect(() => {
        loadModelsInfo();
        loadModelsSummary();
        loadHistoryFromStorage();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Predicciones ML"
                    subtitle="Machine Learning • República Dominicana"
                    action={
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowHistory(true)} className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold flex items-center gap-2 relative transition-all">
                                <History className="w-4 h-4" />
                                {predictionHistory.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CE1126] rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg">
                                        {predictionHistory.length}
                                    </span>
                                )}
                            </button>
                            <button onClick={loadModelsInfo} disabled={loadingModels} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all">
                                <RefreshCw className={`w-4 h-4 ${loadingModels ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    }
                />

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 mb-4">
                    <div className="flex gap-2 flex-wrap">
                        {['dashboard', 'game', 'player', 'team', 'forecast', 'lineup'].map((tab, i) => {
                            const labels = {
                                dashboard: 'Panel',
                                game: 'Partidos',
                                player: 'Puntos',
                                team: 'Clustering',
                                forecast: 'Pronóstico',
                                lineup: 'Lineups'
                            };
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`min-w-[100px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === tab
                                        ? (i % 2 === 0 ? 'bg-[#CE1126] text-white shadow-lg' : 'bg-[#002D62] text-white shadow-lg')
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {labels[tab]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        {loadingModels ? (
                            <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-gray-400 animate-spin" /></div>
                        ) : modelsInfo ? (
                            <>
                                {/* KPIs Premium con Glassmorphism */}
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    {[
                                        { label: 'Modelos V2', value: `${availableModels}/5`, icon: Brain, color: 'red', desc: 'Enhanced ML' },
                                        { label: 'Accuracy', value: modelsSummary?.average_accuracy ? `${(modelsSummary.average_accuracy * 100).toFixed(1)}%` : '85.3%', icon: Target, color: 'blue', desc: 'Promedio' },
                                        { label: 'Features', value: '66', icon: BarChart3, color: 'red', desc: 'Avanzadas' },
                                        { label: 'Predicciones', value: predictionHistory.length, icon: TrendingUp, color: 'blue', desc: 'Historial' }
                                    ].map((kpi, i) => {
                                        const Icon = kpi.icon;
                                        const isRed = kpi.color === 'red';
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 100 }}
                                                className="relative group hover:scale-105 transition-transform"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-white/40 group-hover:border-white/60 transition-all shadow-xl" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                                <div className="relative p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className={`text-[10px] font-extrabold uppercase tracking-[0.15em] ${isRed ? 'text-[#CE1126]' : 'text-[#002D62]'}`}>
                                                            {kpi.label}
                                                        </p>
                                                        <div className={`p-2 rounded-xl bg-gradient-to-br ${isRed ? 'from-red-500/30 to-red-600/20' : 'from-blue-500/30 to-blue-600/20'} group-hover:scale-110 transition-transform`}>
                                                            <Icon className={`w-6 h-6 ${isRed ? 'text-[#CE1126]' : 'text-[#002D62]'}`} />
                                                        </div>
                                                    </div>
                                                    <p className={`text-4xl font-black drop-shadow-2xl tracking-tight ${isRed ? 'text-[#CE1126]' : 'text-[#002D62]'}`}>
                                                        {kpi.value}
                                                    </p>
                                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1">
                                                        {kpi.desc}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Models Summary V2 */}
                                {modelsSummary && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
                                    >
                                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Zap className="w-5 h-5 text-[#CE1126]" />
                                            Resumen de Modelos V2
                                        </h2>
                                        <div className="grid grid-cols-5 gap-4">
                                            {Object.entries(modelsSummary.models || {}).map(([name, data], idx) => (
                                                <motion.div
                                                    key={name}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                                    className="p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600"
                                                >
                                                    <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                                        {name.replace(/_/g, ' ')}
                                                    </p>
                                                    <p className={`text-2xl font-black ${idx % 2 === 0 ? 'text-[#CE1126]' : 'text-[#002D62]'}`}>
                                                        {data.version || 'V2'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                                                        {data.features_count || 0} features
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(modelsInfo).map(([key, model]) => (
                                        <div key={key} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                                            <div className={`px-4 py-2 ${model.status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                <p className="text-xs font-bold text-white">{model.status === 'available' ? '✓ Disponible' : '✗ No disponible'}</p>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-sm font-bold mb-2">{model.model_name}</h3>
                                                {model.trained_samples && <p className="text-xs text-gray-500">Muestras: {model.trained_samples}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : <p className="text-center py-20 text-gray-500">No se pudieron cargar los modelos</p>}
                    </>
                )}

                {/* Game Tab */}
                {activeTab === 'game' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Activity className="w-5 h-5 text-[#CE1126]" />
                                Predicción de Resultado
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-semibold">¿RD juega como local?</span>
                                    <button onClick={() => setGameData({ ...gameData, rd_es_local: !gameData.rd_es_local })} className={`relative inline-flex h-6 w-11 items-center rounded-full ${gameData.rd_es_local ? 'bg-[#CE1126]' : 'bg-gray-300'}`}>
                                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${gameData.rd_es_local ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[#CE1126]">REPÚBLICA DOMINICANA</label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {[
                                            { key: 'rd_fg_pct', label: 'FG%' },
                                            { key: 'rd_reb', label: 'Rebotes' },
                                            { key: 'rd_ast', label: 'Asistencias' }
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold">{label}</label>
                                                <input type="number" value={gameData[key]} onChange={(e) => setGameData({ ...gameData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[#002D62]">EQUIPO RIVAL</label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {[
                                            { key: 'rival_fg_pct', label: 'FG%' },
                                            { key: 'rival_reb', label: 'Rebotes' },
                                            { key: 'rival_ast', label: 'Asistencias' }
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold">{label}</label>
                                                <input type="number" value={gameData[key]} onChange={(e) => setGameData({ ...gameData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handlePredictGame} disabled={loadingGame} className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                                    {loadingGame ? <><RefreshCw className="w-4 h-4 animate-spin" /> Prediciendo...</> : <><Play className="w-4 h-4" /> Predecir Resultado</>}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-[#002D62]" />
                                Resultado
                            </h2>
                            {gamePrediction ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    <div className="flex justify-center">
                                        <GaugeChart
                                            value={(gameData.rd_es_local ? gamePrediction.home_win_probability : gamePrediction.away_win_probability) * 100}
                                            label="% Victoria RD"
                                            color="#CE1126"
                                            size={180}
                                        />
                                    </div>
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-950/20 dark:to-blue-950/20 border-2 border-[#CE1126] dark:border-[#CE1126]/50 shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-5 h-5 text-[#CE1126]" />
                                            <p className="text-xs font-bold text-[#CE1126] dark:text-[#CE1126] uppercase">Ganador Predicho</p>
                                        </div>
                                        <p className="text-2xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                            {(gameData.rd_es_local ? gamePrediction.home_win_probability : gamePrediction.away_win_probability) > 0.5 ? 'República Dominicana' : 'Equipo Rival'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <ProgressBar
                                            value={gamePrediction.confidence * 100}
                                            label="Confianza del Modelo"
                                            color="#002D62"
                                        />
                                        <ProgressBar
                                            value={gamePrediction.model_accuracy * 100}
                                            label="Precisión Histórica"
                                            color="#CE1126"
                                        />
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                            <p className="text-xs font-bold text-blue-700 uppercase">Interpretación</p>
                                        </div>
                                        <p className="text-sm text-blue-900">{gamePrediction.interpretation}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addScenario('game', gamePrediction)}
                                            disabled={gameScenarios.length >= 4}
                                            className="flex-1 px-3 py-2 bg-[#CE1126] hover:bg-[#8B0D1A] disabled:bg-gray-300 text-white rounded-lg text-xs font-semibold transition-all shadow-md disabled:cursor-not-allowed"
                                        >
                                            + Comparar
                                        </button>
                                        <button
                                            onClick={() => loadFeatureImportance('game_outcome')}
                                            className="flex-1 px-3 py-2 bg-[#002D62] hover:bg-[#001D42] text-white rounded-lg text-xs font-semibold transition-all shadow-md"
                                        >
                                            Ver Features
                                        </button>
                                        <button
                                            onClick={() => setGamePrediction(null)}
                                            className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg text-xs font-semibold transition-all shadow-md"
                                        >
                                            Nueva
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Gauge className="w-16 h-16 mb-3" />
                                    <p className="text-sm text-center">Completa el formulario y presiona "Predecir Resultado"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Feature Importance */}
                {featureImportance.game_outcome && (
                    <div className="col-span-2">
                        <FeatureImportance
                            features={featureImportance.game_outcome.features || []}
                            modelName="Game Outcome Prediction"
                            loading={loadingFeatures}
                        />
                    </div>
                )}

                {/* Scenario Comparison */}
                {gameScenarios.length > 0 && (
                    <div className="col-span-2">
                        <ScenarioComparison
                            scenarios={gameScenarios}
                            onRemoveScenario={(id) => removeScenario('game', id)}
                            type="game"
                        />
                    </div>
                )}

                {/* Player Tab */}
                {activeTab === 'player' && (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Selector de Jugador - COLUMNA COMPLETA */}
                        <div className="col-span-2 mb-4">
                            <PlayerSelector
                                label="Seleccionar Jugador"
                                onSelect={loadPlayerStats}
                                selectedPlayer={selectedPlayer}
                                showStats={true}
                                filterActive={true}
                            />
                        </div>

                        {/* Indicador de carga */}
                        {loadingPlayerStats && (
                            <div className="col-span-2 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Cargando estadísticas del jugador...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Mostrar jugador seleccionado */}
                        {selectedPlayer && (
                            <div className="col-span-2 mb-4 p-4 bg-gradient-to-r from-[#CE1126]/10 to-[#002D62]/10 rounded-lg border border-[#CE1126]/30">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Predicción para: <span className="text-[#CE1126]">{selectedPlayer.name}</span>
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Los datos se han auto-completado con las estadísticas del jugador. Puedes ajustarlos manualmente.
                                </p>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Users className="w-5 h-5 text-[#CE1126]" />
                                Predicción de Puntos
                            </h2>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'minutes_played', label: 'Minutos' },
                                        { key: 'field_goal_percentage', label: 'FG%' },
                                        { key: 'free_throw_percentage', label: 'FT%' },
                                        { key: 'total_rebounds', label: 'Rebotes' },
                                        { key: 'assists', label: 'Asistencias' },
                                        { key: 'field_goals_made', label: 'FG Anotados' },
                                        { key: 'three_point_made', label: '3P Anotados' }
                                    ].map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{label}</label>
                                            <input type="number" value={playerPointsData[key]} onChange={(e) => setPlayerPointsData({ ...playerPointsData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handlePredictPlayerPoints} disabled={loadingPlayerPoints} className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2 mt-4">
                                    {loadingPlayerPoints ? <><RefreshCw className="w-4 h-4 animate-spin" /> Prediciendo...</> : <><Play className="w-4 h-4" /> Predecir Puntos</>}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Resultado</h2>
                            {playerPointsPrediction ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    <div className="flex justify-center">
                                        <GaugeChart
                                            value={playerPointsPrediction.predicted_points}
                                            max={50}
                                            label="Puntos"
                                            color="#CE1126"
                                            size={180}
                                        />
                                    </div>
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-5 h-5 text-orange-600" />
                                            <p className="text-xs font-bold text-orange-700 uppercase">Predicción de Puntos</p>
                                        </div>
                                        <p className="text-3xl font-black text-orange-900">{playerPointsPrediction.predicted_points.toFixed(1)} puntos</p>
                                    </div>
                                    <div className="space-y-2">
                                        <ProgressBar
                                            value={playerPointsPrediction.confidence_score * 100}
                                            label="Confianza del Modelo (R²)"
                                            color="#002D62"
                                        />
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                            <p className="text-xs font-bold text-blue-700 uppercase">Interpretación</p>
                                        </div>
                                        <p className="text-sm text-blue-900">{playerPointsPrediction.interpretation}</p>
                                    </div>
                                    <button onClick={() => setPlayerPointsPrediction(null)} className="w-full px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg text-sm font-semibold transition-all shadow-md">Nueva Predicción</button>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Target className="w-16 h-16 mb-3" />
                                    <p className="text-sm text-center">Ingresa las estadísticas del jugador</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Brain className="w-5 h-5 text-[#002D62]" />
                                Clustering de Equipo
                            </h2>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'points_per_game', label: 'Puntos/J' },
                                        { key: 'field_goal_percentage', label: 'FG%' },
                                        { key: 'three_point_percentage', label: '3P%' },
                                        { key: 'free_throw_percentage', label: 'FT%' },
                                        { key: 'rebounds_per_game', label: 'Rebotes/J' },
                                        { key: 'assists_per_game', label: 'Asistencias/J' },
                                        { key: 'steals_per_game', label: 'Robos/J' },
                                        { key: 'blocks_per_game', label: 'Bloqueos/J' },
                                        { key: 'turnovers_per_game', label: 'Pérdidas/J' },
                                        { key: 'win_percentage', label: '% Victorias' }
                                    ].map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{label}</label>
                                            <input type="number" value={teamClusterData[key]} onChange={(e) => setTeamClusterData({ ...teamClusterData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" step={key === 'win_percentage' ? '0.01' : '0.1'} />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handlePredictTeamCluster} disabled={loadingTeamCluster} className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2 mt-4">
                                    {loadingTeamCluster ? <><RefreshCw className="w-4 h-4 animate-spin" /> Clasificando...</> : <><Play className="w-4 h-4" /> Clasificar Equipo</>}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Resultado</h2>
                            {teamClusterPrediction ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-purple-600" />
                                            <p className="text-xs font-bold text-purple-700 uppercase">Cluster Asignado</p>
                                        </div>
                                        <p className="text-3xl font-black text-purple-900">{teamClusterPrediction.cluster_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-lg bg-gray-50">
                                            <p className="text-xs text-gray-600">Cluster ID</p>
                                            <p className="text-xl font-black">{teamClusterPrediction.cluster_id}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-gray-50">
                                            <p className="text-xs text-gray-600">Total Clusters</p>
                                            <p className="text-xl font-black">{teamClusterPrediction.total_clusters}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                        <p className="text-xs font-bold text-blue-700 uppercase mb-1">Características</p>
                                        <div className="space-y-1">
                                            {teamClusterPrediction.cluster_characteristics && Object.entries(teamClusterPrediction.cluster_characteristics).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-blue-700 font-semibold">{key}:</span>
                                                    <span className="text-blue-900">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-xs font-bold text-green-700">Equipos Similares</p>
                                        <p className="text-lg font-black text-green-900">{teamClusterPrediction.similar_teams?.length || 0} equipos</p>
                                    </div>
                                    <button onClick={() => setTeamClusterPrediction(null)} className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold">Nueva Clasificación</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Brain className="w-16 h-16 mb-3" />
                                    <p className="text-sm text-center">Ingresa las estadísticas del equipo</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Forecast Tab - Pronóstico de Rendimiento */}
                {activeTab === 'forecast' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#CE1126]" />
                                Pronóstico de Rendimiento
                            </h2>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'edad', label: 'Edad', min: 15, max: 50 },
                                        { key: 'mpg', label: 'Minutos/J', min: 0, max: 48 },
                                        { key: 'efficiency', label: 'Eficiencia', min: 0, max: 50 },
                                        { key: 'rpg', label: 'Rebotes/J', min: 0, max: 20 },
                                        { key: 'apg', label: 'Asistencias/J', min: 0, max: 15 },
                                        { key: 'hist_ppg', label: 'Puntos/J Hist.', min: 0, max: 40 },
                                        { key: 'hist_efficiency', label: 'Efic. Hist.', min: 0, max: 50 },
                                        { key: 'num_torneos', label: 'Torneos', min: 0, max: 30 },
                                        { key: 'experiencia', label: 'Partidos', min: 0, max: 500 }
                                    ].map(({ key, label, min, max }) => (
                                        <div key={key}>
                                            <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{label}</label>
                                            <input
                                                type="number"
                                                value={playerForecastData[key]}
                                                onChange={(e) => setPlayerForecastData({ ...playerForecastData, [key]: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                                min={min}
                                                max={max}
                                                step="0.1"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleForecastPlayerPerformance}
                                    disabled={loadingPlayerForecast}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                >
                                    {loadingPlayerForecast ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Pronosticando...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Pronosticar Rendimiento
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4">Pronóstico</h2>
                            {playerForecast ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    {/* Proyección Futura */}
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10 border-2 border-[#CE1126]/30 shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-[#CE1126]" />
                                            <p className="text-xs font-bold text-[#CE1126] uppercase tracking-wider">Proyección Futura</p>
                                        </div>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                                            {playerForecast.forecasted_ppg ?
                                                `${playerForecast.forecasted_ppg.toFixed(1)} pts/juego` :
                                                playerForecast.predicted_ppg ?
                                                    `${playerForecast.predicted_ppg.toFixed(1)} pts/juego` :
                                                    'Calculando...'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Promedio histórico: {playerForecastData.hist_ppg.toFixed(1)} pts/juego
                                        </p>
                                    </div>

                                    {/* Tendencia */}
                                    {playerForecast.trend && (
                                        <div className={`p-4 rounded-lg border-2 shadow-lg ${playerForecast.trend === 'improving' || playerForecast.trend === 'stable'
                                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-700'
                                            : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-300 dark:border-orange-700'
                                            }`}>
                                            <p className={`text-xs font-bold uppercase mb-2 tracking-wider ${playerForecast.trend === 'improving' || playerForecast.trend === 'stable'
                                                ? 'text-green-700 dark:text-green-300'
                                                : 'text-orange-700 dark:text-orange-300'
                                                }`}>
                                                Tendencia
                                            </p>
                                            <p className={`text-lg font-bold ${playerForecast.trend === 'improving' || playerForecast.trend === 'stable'
                                                ? 'text-green-900 dark:text-green-100'
                                                : 'text-orange-900 dark:text-orange-100'
                                                }`}>
                                                {playerForecast.trend === 'improving' ? '📈 Mejorando' :
                                                    playerForecast.trend === 'declining' ? '📉 Declinando' :
                                                        playerForecast.trend === 'stable' ? '➡️ Estable' :
                                                            playerForecast.trend}
                                            </p>
                                        </div>
                                    )}

                                    {/* Análisis */}
                                    {playerForecast.interpretation && (
                                        <button
                                            onClick={() => setPlayerForecast(null)}
                                            className="w-full px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 rounded-lg text-sm font-semibold transition-all shadow-md"
                                        >
                                            Nuevo Pronóstico
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <TrendingUp className="w-16 h-16 mb-3" />
                                    <p className="text-sm text-center">Ingresa los datos del jugador para pronosticar su rendimiento futuro</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Lineup Tab - Optimización de Lineups */}
                {activeTab === 'lineup' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Users className="w-5 h-5 text-[#002D62]" />
                                Optimización de Lineup
                            </h2>
                            {/* Selector de Jugadores */}
                            <div className="space-y-3 mb-4">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Jugadores Disponibles
                                </label>

                                {loadingPlayers ? (
                                    <div className="flex justify-center py-4">
                                        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {availablePlayers.map(player => (
                                            <label
                                                key={player.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={lineupData.available_players.includes(player.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setLineupData({
                                                                ...lineupData,
                                                                available_players: [...lineupData.available_players, player.id]
                                                            });
                                                        } else {
                                                            setLineupData({
                                                                ...lineupData,
                                                                available_players: lineupData.available_players.filter(id => id !== player.id)
                                                            });
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-[#CE1126] rounded focus:ring-[#CE1126]"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {player.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {player.position || 'N/A'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Seleccionados: {lineupData.available_players.length} jugadores
                                </p>
                            </div>

                            <button
                                onClick={handleOptimizeLineup}
                                disabled={loadingLineup || lineupData.available_players.length < 5}
                                className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingLineup ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Optimizando...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Optimizar Lineup
                                    </>
                                )}
                            </button>

                            {lineupData.available_players.length < 5 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center">
                                    Selecciona al menos 5 jugadores
                                </p>
                            )}
                        </div>

                        {/* Resultado del Lineup */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                                Lineup Óptimo
                            </h2>
                            {lineupOptimization ? (
                                <div className="space-y-4">
                                    {/* Lineup Óptimo */}
                                    {lineupOptimization.optimal_lineup && lineupOptimization.optimal_lineup.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    Jugadores Seleccionados ({lineupOptimization.total_players || lineupOptimization.optimal_lineup.length})
                                                </h3>
                                                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                                        Optimizado
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Lista de jugadores */}
                                            <div className="grid gap-2">
                                                {lineupOptimization.optimal_lineup.map((player, index) => (
                                                    <div
                                                        key={player.player_id || index}
                                                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CE1126] to-[#002D62] flex items-center justify-center text-white font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                                {player.name || player.player_name || `Jugador ${player.player_id}`}
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                {player.position || player.role || 'N/A'} • Score: {player.score?.toFixed(2) || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Distribución de Roles */}
                                            {lineupOptimization.roles_distribution && (
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                                                        Distribución de Roles
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(lineupOptimization.roles_distribution).map(([role, count]) => (
                                                            <div key={role} className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-700 dark:text-gray-300 font-semibold">{role}:</span>
                                                                <span className="text-blue-600 dark:text-blue-400 font-bold">{count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recomendación */}
                                            {lineupOptimization.recommendation && (
                                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                                    <p className="text-xs text-green-700 dark:text-green-400">
                                                        💡 {lineupOptimization.recommendation}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                No se generó un lineup óptimo. Verifica los datos enviados.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Users className="w-16 h-16 mb-3" />
                                    <p className="text-sm text-center">
                                        Selecciona jugadores y optimiza el lineup
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Footer Info */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Nota sobre las predicciones</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Las predicciones son estimaciones basadas en modelos de Machine Learning entrenados con datos históricos de la Selección Nacional de República Dominicana (2010-2025). Los resultados tienen fines informativos y de análisis táctico.
                        </p>
                    </div>
                </div>
                {/* Modal de Historial */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowHistory(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                            >
                                {/* HEADER */}
                                <div className="bg-gradient-to-r from-[#CE1126] to-[#002D62] p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <History className="w-6 h-6 text-white" />
                                        <div>
                                            <h2 className="text-xl font-black text-white">Historial de Predicciones</h2>
                                            <p className="text-white/80 text-xs">{predictionHistory.length} predicciones guardadas</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowHistory(false)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>

                                {/* BOTONES DE ACCIÓN */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => exportResults('json')}
                                            disabled={predictionHistory.length === 0}
                                            className="px-4 py-2 bg-[#002D62] hover:bg-[#002D62]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                                        >
                                            <FileJson className="w-4 h-4" />
                                            Exportar JSON
                                        </button>
                                        <button
                                            onClick={() => exportResults('csv')}
                                            disabled={predictionHistory.length === 0}
                                            className="px-4 py-2 bg-[#CE1126] hover:bg-[#CE1126]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Exportar CSV
                                        </button>
                                    </div>
                                    <button
                                        onClick={clearHistory}
                                        disabled={predictionHistory.length === 0}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Limpiar Todo
                                    </button>
                                </div>

                                {/* LISTA DE HISTORIAL */}
                                <div className="p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
                                    {predictionHistory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                            <History className="w-16 h-16 mb-3" />
                                            <p className="text-sm font-semibold">No hay predicciones en el historial</p>
                                            <p className="text-xs mt-1">Las predicciones se guardarán automáticamente aquí</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {predictionHistory.map((entry) => (
                                                <motion.div
                                                    key={entry.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {entry.type === 'game' && <Activity className="w-5 h-5 text-[#CE1126]" />}
                                                            {entry.type === 'player' && <Users className="w-5 h-5 text-[#002D62]" />}
                                                            {entry.type === 'team' && <Brain className="w-5 h-5 text-purple-600" />}
                                                            {entry.type === 'forecast' && <TrendingUp className="w-5 h-5 text-indigo-600" />}
                                                            {entry.type === 'lineup' && <Award className="w-5 h-5 text-green-600" />}
                                                            <span className="font-bold text-sm">
                                                                {entry.type === 'game' ? 'Predicción de Partido' :
                                                                    entry.type === 'player' ? 'Predicción de Puntos' :
                                                                        entry.type === 'team' ? 'Clustering de Equipo' :
                                                                            entry.type === 'forecast' ? 'Pronóstico de Rendimiento' :
                                                                                entry.type === 'lineup' ? 'Optimización de Lineup' : 'Predicción'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(entry.timestamp).toLocaleString('es-DO', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                        {entry.type === 'game' && entry.result && (
                                                            <p className="font-semibold text-green-700 dark:text-green-400">
                                                                Ganador: {entry.result.predicted_winner === 'home' ? 'República Dominicana' : 'Rival'} ({(entry.result.home_win_probability * 100).toFixed(1)}%)
                                                            </p>
                                                        )}
                                                        {entry.type === 'player' && entry.result && (
                                                            <p className="font-semibold text-orange-700 dark:text-orange-400">
                                                                Puntos predichos: {entry.result.predicted_points?.toFixed(1)} pts
                                                            </p>
                                                        )}
                                                        {entry.type === 'team' && entry.result && (
                                                            <p className="font-semibold text-purple-700 dark:text-purple-400">
                                                                Cluster: {entry.result.cluster_name}
                                                            </p>
                                                        )}

                                                        {entry.type === 'forecast' && entry.result && (
                                                            <p className="font-semibold text-indigo-700 dark:text-indigo-400">
                                                                Rendimiento proyectado: {entry.result.forecasted_performance?.toFixed(1)} pts
                                                            </p>
                                                        )}
                                                        {entry.type === 'lineup' && entry.result && (
                                                            <p className="font-semibold text-green-700 dark:text-green-400">
                                                                Lineup óptimo: {entry.result.optimal_lineup?.length || 0} jugadores
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

export default Predictions;
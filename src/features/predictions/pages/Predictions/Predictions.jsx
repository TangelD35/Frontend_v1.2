import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, Target, Activity, Users, Play, RefreshCw, Gauge, CheckCircle, AlertCircle, TrendingUp, Award
} from 'lucide-react';
import mlPredictionsService from '../../../../shared/api/endpoints/mlPredictions';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import GaugeChart from '../../components/GaugeChart';
import ProgressBar from '../../components/ProgressBar';

const Predictions = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modelsInfo, setModelsInfo] = useState(null);
    const [loadingModels, setLoadingModels] = useState(true);

    const [gameData, setGameData] = useState({
        rd_es_local: true, rd_fg_pct: 45.0, rival_fg_pct: 43.0,
        rd_reb: 42.0, rival_reb: 40.0, rd_ast: 22.0, rival_ast: 20.0
    });
    const [gamePrediction, setGamePrediction] = useState(null);
    const [loadingGame, setLoadingGame] = useState(false);

    const [playerPointsData, setPlayerPointsData] = useState({
        minutes_played: 32.5, field_goal_percentage: 45.5, free_throw_percentage: 80.0,
        total_rebounds: 8.0, assists: 5.0, field_goals_made: 6.0, three_point_made: 2.0
    });
    const [playerPointsPrediction, setPlayerPointsPrediction] = useState(null);
    const [loadingPlayerPoints, setLoadingPlayerPoints] = useState(false);

    const [teamClusterData, setTeamClusterData] = useState({
        points_per_game: 85.5, field_goal_percentage: 45.0, three_point_percentage: 35.0,
        free_throw_percentage: 75.0, rebounds_per_game: 42.0, assists_per_game: 22.0,
        steals_per_game: 8.0, blocks_per_game: 5.0, turnovers_per_game: 14.0, win_percentage: 0.65
    });
    const [teamClusterPrediction, setTeamClusterPrediction] = useState(null);
    const [loadingTeamCluster, setLoadingTeamCluster] = useState(false);

    // Estados para validaciones
    const [validationErrors, setValidationErrors] = useState({});

    // Estados para historial
    const [predictionHistory, setPredictionHistory] = useState([]);

    useEffect(() => {
        loadModelsInfo();
        loadHistoryFromStorage();
    }, []);

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
                h.type === 'game' ? 'Partido' : h.type === 'player' ? 'Jugador' : 'Equipo',
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

    const validateTeamData = () => {
        const errors = {};
        if (teamClusterData.points_per_game < 0 || teamClusterData.points_per_game > 150) errors.points_per_game = 'Puntos/J deben estar entre 0 y 150';
        if (teamClusterData.field_goal_percentage < 0 || teamClusterData.field_goal_percentage > 100) errors.field_goal_percentage = 'FG% debe estar entre 0 y 100';
        if (teamClusterData.three_point_percentage < 0 || teamClusterData.three_point_percentage > 100) errors.three_point_percentage = '3P% debe estar entre 0 y 100';
        if (teamClusterData.free_throw_percentage < 0 || teamClusterData.free_throw_percentage > 100) errors.free_throw_percentage = 'FT% debe estar entre 0 y 100';
        if (teamClusterData.win_percentage < 0 || teamClusterData.win_percentage > 1) errors.win_percentage = '% Victorias debe estar entre 0 y 1';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const loadModelsInfo = async () => {
        try {
            setLoadingModels(true);
            const data = await mlPredictionsService.getModelsInfo();
            setModelsInfo(data);
        } catch (error) {
            console.error('Error loading models:', error);
        } finally {
            setLoadingModels(false);
        }
    };

    const handlePredictGame = async () => {
        if (!validateGameData()) {
            alert('Por favor corrige los errores en el formulario');
            return;
        }
        try {
            setLoadingGame(true);
            const result = await mlPredictionsService.predictGameOutcome(gameData);
            setGamePrediction(result);
            saveToHistory('game', gameData, result);
        } catch (error) {
            alert('Error al predecir el resultado');
        } finally {
            setLoadingGame(false);
        }
    };

    const handlePredictPlayerPoints = async () => {
        if (!validatePlayerData()) {
            alert('Por favor corrige los errores en el formulario');
            return;
        }
        try {
            setLoadingPlayerPoints(true);
            const result = await mlPredictionsService.predictPlayerPoints(playerPointsData);
            setPlayerPointsPrediction(result);
            saveToHistory('player', playerPointsData, result);
        } catch (error) {
            alert('Error al predecir puntos');
        } finally {
            setLoadingPlayerPoints(false);
        }
    };

    const handlePredictTeamCluster = async () => {
        if (!validateTeamData()) {
            alert('Por favor corrige los errores en el formulario');
            return;
        }
        try {
            setLoadingTeamCluster(true);
            const result = await mlPredictionsService.predictTeamCluster(teamClusterData);
            setTeamClusterPrediction(result);
            saveToHistory('team', teamClusterData, result);
        } catch (error) {
            alert('Error al clasificar equipo');
        } finally {
            setLoadingTeamCluster(false);
        }
    };

    const availableModels = modelsInfo ? Object.values(modelsInfo).filter(m => m.status === 'available').length : 0;
    const totalModels = modelsInfo ? Object.keys(modelsInfo).length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-5 shadow-lg mb-4">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)' }} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 overflow-hidden flex items-center justify-center">
                                <img src={BanderaDominicana} alt="RD" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white">PREDICCIONES ML</h1>
                                <p className="text-white/80 text-xs">Machine Learning • República Dominicana</p>
                            </div>
                        </div>
                        <button onClick={loadModelsInfo} disabled={loadingModels} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                            <RefreshCw className={`w-4 h-4 ${loadingModels ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 mb-4">
                    <div className="flex gap-2">
                        {['dashboard', 'game', 'player', 'team'].map((tab, i) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === tab ? (i % 2 === 0 ? 'bg-[#CE1126] text-white shadow-lg' : 'bg-[#002D62] text-white shadow-lg') : 'text-gray-600 hover:bg-gray-100'}`}>
                                {tab === 'dashboard' ? 'Dashboard' : tab === 'game' ? 'Partidos' : tab === 'player' ? 'Jugadores' : 'Equipos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <>
                        {loadingModels ? (
                            <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-gray-400 animate-spin" /></div>
                        ) : modelsInfo ? (
                            <>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white rounded-xl shadow-lg border p-5 text-center">
                                        <p className="text-sm font-bold uppercase text-[#CE1126] mb-2">Modelos Disponibles</p>
                                        <p className="text-4xl font-black">{availableModels}/{totalModels}</p>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg border p-5 text-center">
                                        <p className="text-sm font-bold uppercase text-[#002D62] mb-2">Precisión Promedio</p>
                                        <p className="text-4xl font-black">96.3%</p>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg border p-5 text-center">
                                        <p className="text-sm font-bold uppercase text-gray-600 mb-2">Capacidades</p>
                                        <p className="text-4xl font-black">6</p>
                                    </div>
                                </div>
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
                        <div className="bg-white rounded-xl shadow-lg border p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                                                <label className="text-[10px] text-gray-600">{label}</label>
                                                <input type="number" value={gameData[key]} onChange={(e) => setGameData({ ...gameData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md" />
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
                                                <label className="text-[10px] text-gray-600">{label}</label>
                                                <input type="number" value={gameData[key]} onChange={(e) => setGameData({ ...gameData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handlePredictGame} disabled={loadingGame} className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                                    {loadingGame ? <><RefreshCw className="w-4 h-4 animate-spin" /> Prediciendo...</> : <><Play className="w-4 h-4" /> Predecir Resultado</>}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg border p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-[#002D62]" />
                                Resultado
                            </h2>
                            {gamePrediction ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    <div className="flex justify-center">
                                        <GaugeChart
                                            value={gamePrediction.home_win_probability * 100}
                                            label="% Victoria RD"
                                            color="#CE1126"
                                            size={180}
                                        />
                                    </div>
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award className="w-5 h-5 text-green-600" />
                                            <p className="text-xs font-bold text-green-700 uppercase">Ganador Predicho</p>
                                        </div>
                                        <p className="text-2xl font-black text-green-900">{gamePrediction.predicted_winner === 'home' ? 'República Dominicana' : 'Equipo Rival'}</p>
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
                                    <button onClick={() => setGamePrediction(null)} className="w-full px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg text-sm font-semibold transition-all shadow-md">Nueva Predicción</button>
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

                {/* Player Tab */}
                {activeTab === 'player' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl shadow-lg border p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                                            <label className="text-xs text-gray-600">{label}</label>
                                            <input type="number" value={playerPointsData[key]} onChange={(e) => setPlayerPointsData({ ...playerPointsData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handlePredictPlayerPoints} disabled={loadingPlayerPoints} className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2 mt-4">
                                    {loadingPlayerPoints ? <><RefreshCw className="w-4 h-4 animate-spin" /> Prediciendo...</> : <><Play className="w-4 h-4" /> Predecir Puntos</>}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg border p-4">
                            <h2 className="text-lg font-bold mb-4">Resultado</h2>
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
                        <div className="bg-white rounded-xl shadow-lg border p-4">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                                            <label className="text-xs text-gray-600">{label}</label>
                                            <input type="number" value={teamClusterData[key]} onChange={(e) => setTeamClusterData({ ...teamClusterData, [key]: parseFloat(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded-md" step={key === 'win_percentage' ? '0.01' : '0.1'} />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handlePredictTeamCluster} disabled={loadingTeamCluster} className="w-full px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg font-semibold flex items-center justify-center gap-2 mt-4">
                                    {loadingTeamCluster ? <><RefreshCw className="w-4 h-4 animate-spin" /> Clasificando...</> : <><Play className="w-4 h-4" /> Clasificar Equipo</>}
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg border p-4">
                            <h2 className="text-lg font-bold mb-4">Resultado</h2>
                            {teamClusterPrediction ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                                        <p className="text-xs font-bold text-purple-700 uppercase mb-2">Cluster Asignado</p>
                                        <p className="text-3xl font-black text-purple-900 mb-2">{teamClusterPrediction.cluster_name}</p>
                                        <p className="text-sm text-purple-700">{teamClusterPrediction.cluster_description}</p>
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
                                        <p className="text-xs font-bold text-blue-700 uppercase mb-2">Características</p>
                                        <div className="space-y-1">
                                            {Object.entries(teamClusterPrediction.characteristics).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-blue-700 font-semibold">{key}:</span>
                                                    <span className="text-blue-900">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-xs font-bold text-green-700">Equipos Similares</p>
                                        <p className="text-lg font-black text-green-900">{teamClusterPrediction.similar_teams_count} equipos</p>
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
            </div>
        </div>
    );
};

export default Predictions;
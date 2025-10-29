import { useState, useEffect } from 'react';
import {
    Brain,
    TrendingUp,
    Target,
    AlertTriangle,
    BarChart3,
    Zap,
    Settings,
    Play,
    Pause,
    RefreshCw,
    Download,
    Info
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import predictiveAnalysisService from '../../../shared/api/services/predictiveAnalysisService';

const PredictiveAnalysis = () => {
    const [activeTab, setActiveTab] = useState('game-prediction');
    const [isLoading, setIsLoading] = useState(false);
    const [predictions, setPredictions] = useState({});
    const [selectedModel, setSelectedModel] = useState('game_outcome_model');
    const [availableModels, setAvailableModels] = useState([]);
    const [realTimeMode, setRealTimeMode] = useState(false);
    const [confidence, setConfidence] = useState(0.85);

    const tabs = [
        {
            id: 'game-prediction',
            label: 'Predicción de Juegos',
            icon: Target,
            description: 'Predice resultados de próximos partidos'
        },
        {
            id: 'player-performance',
            label: 'Rendimiento de Jugadores',
            icon: TrendingUp,
            description: 'Analiza el rendimiento futuro de jugadores'
        },
        {
            id: 'team-strategy',
            label: 'Estrategia de Equipo',
            icon: BarChart3,
            description: 'Optimiza estrategias y tácticas'
        },
        {
            id: 'injury-risk',
            label: 'Riesgo de Lesiones',
            icon: AlertTriangle,
            description: 'Identifica riesgos de lesiones'
        },
        {
            id: 'scenario-simulation',
            label: 'Simulación de Escenarios',
            icon: Zap,
            description: 'Simula diferentes escenarios de juego'
        }
    ];

    // Datos simulados para las predicciones
    const [mockData] = useState({
        gameOutcome: {
            homeTeam: 'República Dominicana',
            awayTeam: 'Puerto Rico',
            prediction: {
                homeWinProbability: 0.68,
                awayWinProbability: 0.32,
                predictedScore: { home: 89, away: 82 },
                confidence: 0.85
            },
            factors: [
                { factor: 'Ventaja de local', impact: 0.15, positive: true },
                { factor: 'Forma reciente', impact: 0.22, positive: true },
                { factor: 'Historial enfrentamientos', impact: 0.18, positive: true },
                { factor: 'Lesiones clave', impact: -0.08, positive: false }
            ],
            scenarios: [
                { scenario: 'Optimista', probability: 0.25, score: { home: 95, away: 78 } },
                { scenario: 'Esperado', probability: 0.50, score: { home: 89, away: 82 } },
                { scenario: 'Pesimista', probability: 0.25, score: { home: 83, away: 86 } }
            ]
        },
        playerPerformance: [
            {
                player: 'Juan Pérez',
                predictions: {
                    points: { expected: 22.5, range: [18, 27], confidence: 0.82 },
                    rebounds: { expected: 8.2, range: [6, 11], confidence: 0.78 },
                    assists: { expected: 5.8, range: [4, 8], confidence: 0.75 },
                    efficiency: { expected: 18.5, range: [15, 22], confidence: 0.80 }
                },
                form: 'Excelente',
                riskFactors: ['Carga de minutos alta']
            },
            {
                player: 'Carlos López',
                predictions: {
                    points: { expected: 18.3, range: [14, 23], confidence: 0.79 },
                    rebounds: { expected: 6.5, range: [4, 9], confidence: 0.76 },
                    assists: { expected: 3.2, range: [2, 5], confidence: 0.73 },
                    efficiency: { expected: 15.8, range: [12, 19], confidence: 0.77 }
                },
                form: 'Buena',
                riskFactors: []
            }
        ],
        teamStrategy: {
            recommendedStrategies: [
                {
                    strategy: 'Juego rápido en transición',
                    effectiveness: 0.78,
                    description: 'Aprovechar la velocidad del equipo',
                    implementation: 'Aumentar el ritmo de juego en un 15%'
                },
                {
                    strategy: 'Defensa por zonas',
                    effectiveness: 0.72,
                    description: 'Contrarrestar el juego interior rival',
                    implementation: 'Zona 2-3 en situaciones clave'
                },
                {
                    strategy: 'Rotaciones frecuentes',
                    effectiveness: 0.69,
                    description: 'Mantener frescura durante todo el partido',
                    implementation: 'Rotaciones cada 6-8 minutos'
                }
            ],
            matchupAnalysis: [
                { position: 'Base', advantage: 'Favorable', margin: '+12%' },
                { position: 'Escolta', advantage: 'Neutral', margin: '0%' },
                { position: 'Alero', advantage: 'Desfavorable', margin: '-8%' },
                { position: 'Ala-Pívot', advantage: 'Favorable', margin: '+15%' },
                { position: 'Pívot', advantage: 'Neutral', margin: '+2%' }
            ]
        },
        injuryRisk: [
            {
                player: 'Juan Pérez',
                riskScore: 0.35,
                riskLevel: 'Medio',
                factors: [
                    { factor: 'Carga de trabajo', impact: 0.4, status: 'Alto' },
                    { factor: 'Historial de lesiones', impact: 0.2, status: 'Bajo' },
                    { factor: 'Fatiga muscular', impact: 0.3, status: 'Medio' }
                ],
                recommendations: [
                    'Reducir minutos de juego en 10%',
                    'Sesiones adicionales de recuperación',
                    'Monitoreo biomecánico semanal'
                ]
            },
            {
                player: 'Carlos López',
                riskScore: 0.15,
                riskLevel: 'Bajo',
                factors: [
                    { factor: 'Carga de trabajo', impact: 0.2, status: 'Medio' },
                    { factor: 'Historial de lesiones', impact: 0.1, status: 'Muy Bajo' },
                    { factor: 'Fatiga muscular', impact: 0.1, status: 'Bajo' }
                ],
                recommendations: [
                    'Mantener rutina actual',
                    'Monitoreo mensual'
                ]
            }
        ]
    });

    useEffect(() => {
        loadAvailableModels();
    }, []);

    const loadAvailableModels = async () => {
        const result = await predictiveAnalysisService.getAvailableModels();
        if (result.success) {
            setAvailableModels(result.models);
        }
    };

    const runPrediction = async () => {
        setIsLoading(true);
        try {
            // Simular llamada a la API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // En una implementación real, aquí harías la llamada al servicio
            setPredictions(mockData);
        } catch (error) {
            console.error('Error running prediction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderGamePrediction = () => {
        const data = predictions.gameOutcome || mockData.gameOutcome;

        return (
            <div className="space-y-6">
                {/* Predicción Principal */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/30 dark:border-blue-700/30">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {data.homeTeam} vs {data.awayTeam}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Confianza: {(data.prediction.confidence * 100).toFixed(1)}%
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {data.prediction.predictedScore.home}
                            </div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                {data.homeTeam}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {(data.prediction.homeWinProbability * 100).toFixed(1)}% probabilidad
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                                {data.prediction.predictedScore.away}
                            </div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                {data.awayTeam}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {(data.prediction.awayWinProbability * 100).toFixed(1)}% probabilidad
                            </div>
                        </div>
                    </div>

                    {/* Barra de probabilidad */}
                    <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${data.prediction.homeWinProbability * 100}%` }}
                        />
                        <div
                            className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-1000"
                            style={{ width: `${data.prediction.awayWinProbability * 100}%` }}
                        />
                    </div>
                </div>

                {/* Factores Contribuyentes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Factores Contribuyentes
                    </h4>
                    <div className="space-y-3">
                        {data.factors.map((factor, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{factor.factor}</span>
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded text-sm ${factor.positive
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        }`}>
                                        {factor.positive ? '+' : ''}{(factor.impact * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Escenarios */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Escenarios Posibles
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        {data.scenarios.map((scenario, index) => (
                            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="font-semibold text-gray-800 dark:text-white mb-2">
                                    {scenario.scenario}
                                </div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    {scenario.score.home} - {scenario.score.away}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {(scenario.probability * 100).toFixed(0)}% probabilidad
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderPlayerPerformance = () => {
        const data = predictions.playerPerformance || mockData.playerPerformance;

        return (
            <div className="space-y-6">
                {data.map((player, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {player.player}
                            </h4>
                            <div className={`px-3 py-1 rounded-full text-sm ${player.form === 'Excelente' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                                player.form === 'Buena' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
                                    'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                }`}>
                                Forma: {player.form}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {Object.entries(player.predictions).map(([stat, prediction]) => (
                                <div key={stat} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                                        {stat === 'efficiency' ? 'Eficiencia' : stat}
                                    </div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                                        {prediction.expected}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                        {prediction.range[0]} - {prediction.range[1]}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400">
                                        {(prediction.confidence * 100).toFixed(0)}% confianza
                                    </div>
                                </div>
                            ))}
                        </div>

                        {player.riskFactors.length > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-medium">Factores de riesgo:</span>
                                    <span>{player.riskFactors.join(', ')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderTeamStrategy = () => {
        const data = predictions.teamStrategy || mockData.teamStrategy;

        return (
            <div className="space-y-6">
                {/* Estrategias Recomendadas */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Estrategias Recomendadas
                    </h4>
                    <div className="space-y-4">
                        {data.recommendedStrategies.map((strategy, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-800 dark:text-white">
                                        {strategy.strategy}
                                    </h5>
                                    <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm">
                                        {(strategy.effectiveness * 100).toFixed(0)}% efectividad
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                    {strategy.description}
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <strong>Implementación:</strong> {strategy.implementation}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Análisis de Emparejamientos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Análisis de Emparejamientos
                    </h4>
                    <div className="space-y-3">
                        {data.matchupAnalysis.map((matchup, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {matchup.position}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-sm ${matchup.advantage === 'Favorable' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                                        matchup.advantage === 'Neutral' ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300' :
                                            'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        }`}>
                                        {matchup.advantage}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {matchup.margin}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderInjuryRisk = () => {
        const data = predictions.injuryRisk || mockData.injuryRisk;

        return (
            <div className="space-y-6">
                {data.map((player, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {player.player}
                            </h4>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${player.riskLevel === 'Bajo' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                                player.riskLevel === 'Medio' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                                    'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                }`}>
                                Riesgo {player.riskLevel}
                            </div>
                        </div>

                        {/* Score de Riesgo */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Score de Riesgo</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                    {(player.riskScore * 100).toFixed(0)}/100
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-1000 ${player.riskScore < 0.3 ? 'bg-green-500' :
                                        player.riskScore < 0.6 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                    style={{ width: `${player.riskScore * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Factores de Riesgo */}
                        <div className="mb-4">
                            <h5 className="font-medium text-gray-800 dark:text-white mb-2">Factores de Riesgo</h5>
                            <div className="space-y-2">
                                {player.factors.map((factor, factorIndex) => (
                                    <div key={factorIndex} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{factor.factor}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs ${factor.status === 'Muy Bajo' || factor.status === 'Bajo' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                                                factor.status === 'Medio' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                                                    'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                                }`}>
                                                {factor.status}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                                {(factor.impact * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recomendaciones */}
                        <div>
                            <h5 className="font-medium text-gray-800 dark:text-white mb-2">Recomendaciones</h5>
                            <ul className="space-y-1">
                                {player.recommendations.map((rec, recIndex) => (
                                    <li key={recIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderScenarioSimulation = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Configuración de Simulación
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Número de simulaciones
                            </label>
                            <input
                                type="number"
                                defaultValue={1000}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de escenario
                            </label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option>Resultado del partido</option>
                                <option>Rendimiento individual</option>
                                <option>Estrategia de equipo</option>
                                <option>Análisis de temporada</option>
                            </select>
                        </div>
                    </div>

                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Ejecutar Simulación
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Resultados de Simulación
                    </h4>
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Ejecuta una simulación para ver los resultados
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'game-prediction':
                return renderGamePrediction();
            case 'player-performance':
                return renderPlayerPerformance();
            case 'team-strategy':
                return renderTeamStrategy();
            case 'injury-risk':
                return renderInjuryRisk();
            case 'scenario-simulation':
                return renderScenarioSimulation();
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Análisis Predictivo
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Inteligencia artificial para análisis deportivo avanzado
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Modelo:</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                            <option value="game_outcome_model">Resultado de Juegos</option>
                            <option value="player_performance_model">Rendimiento de Jugadores</option>
                            <option value="team_strategy_model">Estrategia de Equipo</option>
                            <option value="injury_risk_model">Riesgo de Lesiones</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setRealTimeMode(!realTimeMode)}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${realTimeMode
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {realTimeMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        {realTimeMode ? 'Tiempo Real' : 'Manual'}
                    </button>

                    <button
                        onClick={runPrediction}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Zap className="w-4 h-4" />
                        )}
                        {isLoading ? 'Analizando...' : 'Ejecutar Análisis'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default PredictiveAnalysis;
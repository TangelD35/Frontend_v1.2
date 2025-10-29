import { Target, TrendingUp, Cpu, AlertCircle, CheckCircle, Brain, Play, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import {
    SectionHeader,
    ActionButton,
    Badge,
    StatsGrid,
    Chart,
    Table,
    Modal,
    Select,
    Toast
} from '../../../../shared/ui/components/common';

const Predictions = () => {
    const [selectedModel, setSelectedModel] = useState('neural');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    const predictions = [
        {
            id: 1,
            homeTeam: { name: 'República Dominicana', logo: '🇩🇴' },
            awayTeam: { name: 'Estados Unidos', logo: '🇺🇸' },
            date: '2024-11-20',
            prediction: {
                winner: 'awayTeam',
                homeWinProb: 35,
                awayWinProb: 65,
                confidence: 'high',
                predictedScore: { home: 78, away: 92 }
            },
            factors: [
                { name: 'Rating ELO', impact: 'high' },
                { name: 'Forma Reciente', impact: 'medium' },
                { name: 'Ventaja Local', impact: 'low' }
            ]
        },
        {
            id: 2,
            homeTeam: { name: 'República Dominicana', logo: '🇩🇴' },
            awayTeam: { name: 'Puerto Rico', logo: '🇵🇷' },
            date: '2024-12-05',
            prediction: {
                winner: 'homeTeam',
                homeWinProb: 68,
                awayWinProb: 32,
                confidence: 'high',
                predictedScore: { home: 88, away: 79 }
            },
            factors: [
                { name: 'Ventaja Local', impact: 'high' },
                { name: 'Historial H2H', impact: 'medium' },
                { name: 'Lesiones', impact: 'low' }
            ]
        },
    ];

    const highConfidencePredictions = predictions.filter(p => p.prediction.confidence === 'high').length;
    const confidencePercentage = Math.round((highConfidencePredictions / predictions.length) * 100);

    const stats = [
        {
            title: 'Precisión General',
            value: '72.3%',
            icon: Target,
            change: '+4.1%',
            trend: 'up',
            description: 'Modelo Red Neuronal'
        },
        {
            title: 'Predicciones Activas',
            value: predictions.length.toString(),
            icon: Brain,
            change: '+2',
            trend: 'up',
            description: 'Próximos partidos'
        },
        {
            title: 'Confianza Alta',
            value: `${confidencePercentage}%`,
            icon: CheckCircle,
            change: '+5%',
            trend: 'up',
            description: 'Predicciones confiables'
        },
    ];

    const models = [
        { id: 'neural', name: 'Red Neuronal', accuracy: 72.3, description: 'Deep Learning avanzado' },
        { id: 'ensemble', name: 'Ensemble', accuracy: 69.8, description: 'Combinación de modelos' },
        { id: 'gradient', name: 'Gradient Boost', accuracy: 68.5, description: 'XGBoost optimizado' },
    ];

    // Datos para gráfico de precisión histórica
    const accuracyData = [
        { name: 'Ene', value: 65 },
        { name: 'Feb', value: 68 },
        { name: 'Mar', value: 70 },
        { name: 'Abr', value: 69 },
        { name: 'May', value: 71 },
        { name: 'Jun', value: 72.3 },
    ];

    // Datos para gráfico de distribución de confianza
    const confidenceData = [
        { name: 'Alta', value: 68 },
        { name: 'Media', value: 22 },
        { name: 'Baja', value: 10 },
    ];

    const columns = [
        {
            key: 'match',
            label: 'Partido',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{row.homeTeam.logo}</span>
                    <span className="font-semibold">{row.homeTeam.name}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-2xl">{row.awayTeam.logo}</span>
                    <span className="font-semibold">{row.awayTeam.name}</span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Fecha',
            render: (value) => new Date(value).toLocaleDateString('es-ES')
        },
        {
            key: 'prediction',
            label: 'Predicción',
            sortable: false,
            render: (_, row) => (
                <div className="text-sm">
                    <div className="font-semibold text-gray-800">
                        {row.prediction.predictedScore.home} - {row.prediction.predictedScore.away}
                    </div>
                    <div className="text-xs text-gray-500">
                        Prob: {row.prediction.homeWinProb}% - {row.prediction.awayWinProb}%
                    </div>
                </div>
            )
        },
        {
            key: 'confidence',
            label: 'Confianza',
            render: (_, row) => {
                const variants = {
                    high: 'success',
                    medium: 'warning',
                    low: 'danger'
                };
                const labels = {
                    high: 'Alta',
                    medium: 'Media',
                    low: 'Baja'
                };
                return (
                    <Badge variant={variants[row.prediction.confidence]}>
                        {labels[row.prediction.confidence]}
                    </Badge>
                );
            }
        },
        {
            key: 'winner',
            label: 'Ganador Predicho',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <span className="text-xl">
                        {row.prediction.winner === 'homeTeam' ? row.homeTeam.logo : row.awayTeam.logo}
                    </span>
                    <span className="font-semibold text-green-600">
                        {row.prediction.winner === 'homeTeam' ? row.homeTeam.name : row.awayTeam.name}
                    </span>
                </div>
            )
        }
    ];

    const handleRunModel = async () => {
        setIsRunning(true);

        // Simular ejecución del modelo
        setTimeout(() => {
            setIsRunning(false);
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Modelo ejecutado correctamente. Predicciones actualizadas.'
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 transition-all duration-500 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/50">
                <SectionHeader
                    title="Sistema Predictivo"
                    description="Predicciones basadas en Machine Learning para la Selección Nacional"
                    icon={Brain}
                    action={
                        <div className="flex gap-3">
                            <ActionButton
                                variant="secondary"
                                icon={RefreshCw}
                                onClick={() => window.location.reload()}
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Actualizar
                            </ActionButton>
                            <ActionButton
                                variant="primary"
                                icon={isRunning ? null : Play}
                                onClick={handleRunModel}
                                disabled={isRunning}
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isRunning ? 'Ejecutando...' : 'Ejecutar Modelo'}
                            </ActionButton>
                        </div>
                    }
                />
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 dark:border-gray-700/30">
                <StatsGrid stats={stats} className="mb-0" />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Chart
                    type="line"
                    data={accuracyData}
                    xKey="name"
                    yKey="value"
                    title="Evolución de Precisión del Modelo"
                    height={250}
                />
                <Chart
                    type="pie"
                    data={confidenceData}
                    xKey="name"
                    yKey="value"
                    title="Distribución de Confianza"
                    height={250}
                />
            </div>

            {/* Selector de modelo */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-8 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    Seleccionar Modelo Predictivo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-[1.02] hover:shadow-lg ${selectedModel === model.id
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg'
                                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 bg-white/50 dark:bg-gray-700/50'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{model.name}</h4>
                                {selectedModel === model.id && (
                                    <CheckCircle className="w-6 h-6 text-purple-600 animate-pulse" />
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{model.description}</p>
                            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Precisión:</span>
                                <span className="text-lg font-bold text-green-700 dark:text-green-300">{model.accuracy}%</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabla de predicciones */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Predicciones Activas</h3>
                <Table
                    columns={columns}
                    data={predictions}
                    sortable
                    hoverable
                />
            </div>

            {/* Cards de predicciones */}
            <div className="space-y-8">
                {predictions.map((prediction) => (
                    <div
                        key={prediction.id}
                        className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Fecha del partido</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(prediction.date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={prediction.prediction.confidence === 'high' ? 'success' : 'warning'}>
                                Confianza {prediction.prediction.confidence === 'high' ? 'Alta' : 'Media'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-8 items-center mb-8">
                            <div className="text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{prediction.homeTeam.logo}</div>
                                <p className="font-bold text-gray-800 dark:text-white mb-4 text-lg">{prediction.homeTeam.name}</p>
                                <div className="space-y-3">
                                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3 shadow-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {prediction.prediction.predictedScore.home}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">pts</span>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-bold px-3 py-2 rounded-lg ${prediction.prediction.winner === 'homeTeam'
                                        ? 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20'
                                        : 'text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-700/20'
                                        }`}>
                                        {prediction.prediction.homeWinProb}%
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="mb-4">
                                    <div className="text-sm text-purple-600 dark:text-purple-400 mb-3 font-medium">Probabilidad de Victoria</div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out"
                                            style={{ width: `${prediction.prediction.homeWinProb}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{prediction.awayTeam.logo}</div>
                                <p className="font-bold text-gray-800 dark:text-white mb-4 text-lg">{prediction.awayTeam.name}</p>
                                <div className="space-y-3">
                                    <div className="bg-white/70 dark:bg-gray-700/70 rounded-xl p-3 shadow-sm">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                {prediction.prediction.predictedScore.away}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">pts</span>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-bold px-3 py-2 rounded-lg ${prediction.prediction.winner === 'awayTeam'
                                        ? 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20'
                                        : 'text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-700/20'
                                        }`}>
                                        {prediction.prediction.awayWinProb}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Factores de Influencia
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                {prediction.factors.map((factor, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-700">{factor.name}</span>
                                        <Badge variant={
                                            factor.impact === 'high' ? 'danger' :
                                                factor.impact === 'medium' ? 'warning' : 'default'
                                        } size="small">
                                            {factor.impact === 'high' ? 'Alto' : factor.impact === 'medium' ? 'Medio' : 'Bajo'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Nota sobre las predicciones</h4>
                    <p className="text-sm text-blue-700">
                        Las predicciones son estimaciones basadas en análisis histórico y modelos de Machine Learning.
                    </p>
                </div>
            </div>

            <Toast
                type={toast.type}
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
};

export default Predictions;
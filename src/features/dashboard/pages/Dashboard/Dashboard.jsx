import {
    Users, Target, TrendingUp, TrendingDown, Calendar, Shield, Zap,
    BarChart3, Play, Flag, Download,
    Eye, ArrowRight, Activity, MapPin, Clock,
    AlertCircle, CheckCircle
} from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ActionButton,
    Badge,
    Modal,
    Select,
    Toast
} from '../../../../shared/ui/components/common';
import { GlassCard, AnimatedButton } from '../../../../shared/ui/components/modern';
import { useRealTimeStats } from '../../../../shared/hooks/useWebSocket';

// Componente optimizado para estadística individual
const StatCard = memo(({ stat, index }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group"
        >
            <GlassCard
                hover
                className="p-6 h-full cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/analytics')}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                        stat.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                    }`}>
                        {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                         stat.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                         <Activity className="w-4 h-4" />}
                        <span>{stat.change}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                        {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        {stat.description}
                    </p>
                </div>

                {/* Indicador de conexión */}
                <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                </div>
            </GlassCard>
        </motion.div>
    );
});

// Componente optimizado para juego próximo
const GameCard = memo(({ game, index, onViewDetails }) => {
    const getConfidenceBadge = (confidence) => {
        const config = {
            high: { variant: 'success', label: 'Alta' },
            medium: { variant: 'warning', label: 'Media' },
            low: { variant: 'danger', label: 'Baja' }
        };
        return config[confidence] || config.medium;
    };

    const getStatusBadge = (status) => {
        const config = {
            analysis_pending: { variant: 'warning', label: 'Análisis Pendiente' },
            in_study: { variant: 'default', label: 'En Estudio' },
            planned: { variant: 'success', label: 'Planificado' },
            completed: { variant: 'success', label: 'Completado' },
            in_review: { variant: 'warning', label: 'En Revisión' },
            validated: { variant: 'success', label: 'Validado' },
            default: { variant: 'default', label: 'Sin Estado' }
        };
        return config[status] || config.default;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="group"
        >
            <GlassCard
                hover
                className="p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                onClick={() => onViewDetails('game', game.id)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="primary" className="text-xs">
                        {game.tournament}
                    </Badge>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(game.status).variant} size="small">
                            {getStatusBadge(game.status).label}
                        </Badge>
                        <Badge variant={getConfidenceBadge(game.confidence).variant} size="small">
                            {getConfidenceBadge(game.confidence).label}
                        </Badge>
                    </div>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                            <div className="text-3xl mb-2 animate-bounce">{game.homeLogo}</div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">DOM</p>
                        </div>
                        <div className="text-center px-6">
                            <span className="text-xl text-gray-400 font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">VS</span>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">{game.awayLogo}</div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{game.opponent}</p>
                        </div>
                    </div>
                </div>

                {/* Game Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(game.date).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold text-blue-600 dark:text-blue-400">{game.time}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{game.venue}</span>
                    </div>

                    {/* Prediction */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Probabilidad:
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {game.prediction}
                            </span>
                            <Badge variant="success" size="small" className="animate-pulse">
                                ML
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-blue-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </GlassCard>
        </motion.div>
    );
});

// Componente optimizado para jugador clave
const PlayerCard = memo(({ player, index, onViewDetails }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4, type: 'spring' }}
            className="group"
        >
            <GlassCard
                hover
                className="p-4 cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:shadow-xl"
                onClick={() => onViewDetails('player', player.id)}
            >
                <div className="flex items-center gap-4">
                    {/* Avatar con rating */}
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-blue-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                            <div className="absolute -inset-1 bg-gradient-to-br from-red-400 to-blue-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 animate-pulse"></div>
                            <span className="relative text-white font-bold text-lg">{player.rating}</span>
                        </div>
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg ${
                            player.trend === 'up' ? 'bg-green-500' :
                            player.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                            {player.trend === 'up' ? <TrendingUp className="w-3 h-3 text-white" /> :
                             player.trend === 'down' ? <TrendingDown className="w-3 h-3 text-white" /> :
                             <Activity className="w-3 h-3 text-white" />}
                        </div>
                    </div>

                    {/* Info del jugador */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 dark:text-white text-base truncate">
                            {player.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {player.position}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={player.impact === 'high' ? 'success' : 'warning'}
                                size="small"
                                className="animate-pulse"
                            >
                                {player.impact === 'high' ? '⭐ Alto Impacto' : '⭐ Impacto Medio'}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <button
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails('player', player.id);
                            }}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <div className="w-6 h-1 bg-gradient-to-r from-red-200 to-blue-200 dark:from-red-800 dark:to-blue-800 rounded-full"></div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
});

const Dashboard = () => {
    const navigate = useNavigate();
    const { stats, isConnected } = useRealTimeStats();

    // Estados optimizados
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [analysisType, setAnalysisType] = useState('comprehensive');
    // Datos optimizados con useMemo
    const teamStats = useMemo(() => [
        {
            icon: Target,
            label: 'Eficiencia Ofensiva',
            value: stats?.offensiveEfficiency || '112.4',
            change: '+5.2',
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            trend: 'up',
            period: '2020-2025',
            description: 'Puntos por 100 posesiones'
        },
        {
            icon: Shield,
            label: 'Eficiencia Defensiva',
            value: stats?.defensiveEfficiency || '98.7',
            change: '-3.1',
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            trend: 'down',
            period: '2020-2025',
            description: 'Puntos permitidos por 100 posesiones'
        },
        {
            icon: Zap,
            label: 'Ritmo de Juego',
            value: stats?.pace || '96.2',
            change: '+2.4',
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            trend: 'up',
            period: 'Posesiones/40min',
            description: 'Velocidad del juego'
        },
        {
            icon: BarChart3,
            label: 'Predicción Victorias',
            value: stats?.winPrediction || '68%',
            change: '+8%',
            color: 'bg-gradient-to-br from-orange-500 to-orange-600',
            trend: 'up',
            period: 'Próximo Torneo',
            description: 'Probabilidad de victoria'
        },
    ], [stats]);

    const upcomingGames = useMemo(() => [
        {
            id: 1,
            tournament: 'FIBA AmeriCup 2025',
            opponent: 'Estados Unidos',
            date: '2025-03-15',
            time: '20:00',
            venue: 'Madison Square Garden',
            prediction: '45%',
            confidence: 'high',
            status: 'analysis_pending',
            homeLogo: '🇩🇴',
            awayLogo: '🇺🇸'
        },
        {
            id: 2,
            tournament: 'Clasificatorio JO Paris 2024',
            opponent: 'Canadá',
            date: '2025-02-22',
            time: '18:30',
            venue: 'Palacio de los Deportes',
            prediction: '52%',
            confidence: 'medium',
            status: 'in_study',
            homeLogo: '🇩🇴',
            awayLogo: '🇨🇦'
        },
        {
            id: 3,
            tournament: 'Torneo Preolímpico',
            opponent: 'Argentina',
            date: '2025-04-10',
            time: '21:00',
            venue: 'Estadio Luna Park',
            prediction: '61%',
            confidence: 'high',
            status: 'planned',
            homeLogo: '🇩🇴',
            awayLogo: '🇦🇷'
        }
    ], []);

    const keyPlayers = useMemo(() => [
        {
            id: 1,
            name: 'Karl-Anthony Towns',
            impact: 'high',
            position: 'Pívot',
            trend: 'up',
            rating: 95,
            team: 'República Dominicana'
        },
        {
            id: 2,
            name: 'Al Horford',
            impact: 'medium',
            position: 'Ala-Pívot',
            trend: 'stable',
            rating: 88,
            team: 'República Dominicana'
        },
        {
            id: 3,
            name: 'Chris Duarte',
            impact: 'high',
            position: 'Escolta',
            trend: 'up',
            rating: 82,
            team: 'República Dominicana'
        },
        {
            id: 4,
            name: 'Andrés Feliz',
            impact: 'medium',
            position: 'Base',
            trend: 'up',
            rating: 85,
            team: 'República Dominicana'
        }
    ], []);

    // Opciones de análisis optimizadas
    const analysisOptions = useMemo(() => [
        { value: 'comprehensive', label: 'Análisis Integral', description: 'Evaluación completa del equipo' },
        { value: 'offensive', label: 'Análisis Ofensivo', description: 'Enfoque en estrategias de ataque' },
        { value: 'defensive', label: 'Análisis Defensivo', description: 'Evaluación de sistemas defensivos' },
        { value: 'predictive', label: 'Análisis Predictivo', description: 'Proyecciones con modelos ML' },
    ], []);

    // Handlers optimizados con useCallback
    const handleRunAnalysis = useCallback(() => {
        setIsAnalysisModalOpen(true);
    }, []);

    const handleStartAnalysis = useCallback(() => {
        setToast({
            isVisible: true,
            type: 'success',
            message: `Análisis ${analysisOptions.find(opt => opt.value === analysisType)?.label} iniciado`
        });
        setIsAnalysisModalOpen(false);

        // Simular análisis en segundo plano
        setTimeout(() => {
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Análisis completado. Resultados disponibles.'
            });
        }, 3000);
    }, [analysisType, analysisOptions]);

    const handleExportDashboard = useCallback(() => {
        setToast({
            isVisible: true,
            type: 'success',
            message: 'Dashboard exportado correctamente'
        });
        setIsExportModalOpen(false);
    }, []);

    const handleViewDetails = useCallback((type, id) => {
        switch (type) {
            case 'player':
                navigate(`/players/${id}`);
                break;
            case 'analysis':
                navigate(`/analytics`);
                break;
            case 'game':
                navigate(`/games/${id}`);
                break;
            default:
                break;
        }
    }, [navigate]);

    return (
        <div className="min-h-screen space-y-8">
            {/* Header con identidad dominicana mejorado */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <GlassCard
                    hover
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-8 relative overflow-hidden group"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-blue-50/20 to-purple-50/30 dark:from-red-900/10 dark:via-blue-900/5 dark:to-purple-900/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 flex-1">
                        {/* Logo y Título */}
                        <div className="flex items-center gap-6">
                            <motion.div
                                className="relative group/logo"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-full opacity-20 group-hover/logo:opacity-30 transition-opacity duration-300 animate-pulse"></div>
                                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl">
                                    <Target className="w-12 h-12 text-red-600" />
                                    <Flag className="w-6 h-6 text-blue-600 absolute -top-1 -right-1 animate-bounce" />
                                </div>
                            </motion.div>

                            <div className="space-y-2">
                                <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-clip-text text-transparent">
                                    Sistema de Análisis Táctico
                                </h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-lg">
                                        Selección Nacional de Baloncesto
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-bold text-red-600 dark:text-red-400">República Dominicana</span>
                                    <motion.span
                                        className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        2010-2025
                                    </motion.span>
                                </div>
                            </div>
                        </div>

                        {/* Status y Actions */}
                        <div className="flex items-center gap-4">
                            {/* Connection Status */}
                            <motion.div
                                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 border border-green-200 dark:border-green-800"
                                animate={{
                                    boxShadow: isConnected ?
                                        '0 0 20px rgba(34, 197, 94, 0.3)' :
                                        '0 0 20px rgba(239, 68, 68, 0.3)'
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="flex items-center gap-2">
                                    {isConnected ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    <div className="flex flex-col">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Estado</p>
                                        <p className={`text-sm font-bold ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {isConnected ? 'Conectado' : 'Desconectado'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <AnimatedButton
                                    variant="secondary"
                                    icon={Download}
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    Exportar
                                </AnimatedButton>
                                <AnimatedButton
                                    variant="primary"
                                    icon={Play}
                                    onClick={handleRunAnalysis}
                                    className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700"
                                >
                                    Análisis
                                </AnimatedButton>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Grid de Estadísticas Principales */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamStats.map((stat, index) => (
                        <StatCard key={stat.label} stat={stat} index={index} />
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Próximos Compromisos */}
                <motion.div
                    className="xl:col-span-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <GlassCard hover className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <Calendar className="w-7 h-7 text-blue-600" />
                                Próximos Compromisos
                                <motion.div
                                    className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </h2>
                            <button
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all duration-200"
                                onClick={() => navigate('/games')}
                            >
                                Ver Todos
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {upcomingGames.map((game, index) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    index={index}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Jugadores Clave */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <GlassCard hover className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <Users className="w-7 h-7 text-purple-600" />
                                Jugadores Clave
                                <motion.div
                                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                />
                            </h2>
                            <button
                                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all duration-200"
                                onClick={() => navigate('/players')}
                            >
                                Ver Todos
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {keyPlayers.map((player, index) => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    index={index}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Modales optimizados */}
            <AnimatePresence>
                {isAnalysisModalOpen && (
                    <Modal
                        isOpen={isAnalysisModalOpen}
                        onClose={() => setIsAnalysisModalOpen(false)}
                        title="Ejecutar Análisis Táctico"
                    >
                        <div className="space-y-6">
                            <Select
                                label="Tipo de Análisis"
                                name="analysisType"
                                value={analysisType}
                                onChange={(e) => setAnalysisType(e.target.value)}
                                options={analysisOptions}
                            />

                            <motion.div
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Descripción del Análisis
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {analysisOptions.find(opt => opt.value === analysisType)?.description}
                                </p>
                            </motion.div>

                            <div className="flex gap-3 justify-end pt-4">
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => setIsAnalysisModalOpen(false)}
                                >
                                    Cancelar
                                </ActionButton>
                                <ActionButton
                                    variant="primary"
                                    onClick={handleStartAnalysis}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Iniciar Análisis
                                </ActionButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isExportModalOpen && (
                    <Modal
                        isOpen={isExportModalOpen}
                        onClose={() => setIsExportModalOpen(false)}
                        title="Exportar Dashboard"
                    >
                        <div className="space-y-6">
                            <Select
                                label="Formato de Exportación"
                                name="exportFormat"
                                options={[
                                    { value: 'pdf', label: 'PDF Report' },
                                    { value: 'excel', label: 'Excel' },
                                    { value: 'json', label: 'JSON' },
                                    { value: 'csv', label: 'CSV' }
                                ]}
                            />

                            <Select
                                label="Rango de Datos"
                                name="dateRange"
                                options={[
                                    { value: 'current', label: 'Datos Actuales' },
                                    { value: 'last_week', label: 'Última Semana' },
                                    { value: 'last_month', label: 'Último Mes' },
                                    { value: 'all', label: 'Todos los Datos' }
                                ]}
                            />

                            <div className="flex gap-3 justify-end pt-4">
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => setIsExportModalOpen(false)}
                                >
                                    Cancelar
                                </ActionButton>
                                <ActionButton
                                    variant="primary"
                                    onClick={handleExportDashboard}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </ActionButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Toast optimizado */}
            <AnimatePresence>
                {toast.isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Toast
                            type={toast.type}
                            message={toast.message}
                            isVisible={toast.isVisible}
                            onClose={() => setToast({ ...toast, isVisible: false })}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(Dashboard);
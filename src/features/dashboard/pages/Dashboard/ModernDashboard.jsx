import {
    Users, Target, TrendingUp, TrendingDown, Calendar, Shield, Zap,
    BarChart3, Play, Download, Eye, ArrowRight, Activity,
    MapPin, Star, Clock, AlertCircle, CheckCircle, Flag
} from 'lucide-react';
import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    GlassCard,
    AnimatedButton,
    GradientBadge,
    ModernModal,
    LoadingState,
    ErrorState,
    ThemeSwitcher
} from '../../../../shared/ui/components/modern';
import { useRealTimeStats } from '../../../../shared/hooks/useWebSocket';
import RecentAnalysisCard from './components/RecentAnalysisCard';

// Componente optimizado para estadística
const ModernStatCard = memo(({ stat, index }) => {
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
                className="p-6 cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/analytics')}
            >
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                        <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
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
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {stat.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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

// Componente optimizado para jugador
const ModernPlayerCard = memo(({ player, index, onViewDetails }) => {
    const metrics = useMemo(() => [
        { label: 'PPG', value: player.ppg ?? '--', color: 'text-red-600 dark:text-red-400' },
        { label: 'RPG', value: player.rpg ?? '--', color: 'text-blue-600 dark:text-blue-400' },
        { label: 'APG', value: player.apg ?? '--', color: 'text-purple-600 dark:text-purple-400' }
    ], [player]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4, type: 'spring' }}
            className="group w-full"
        >
            <GlassCard
                hover
                className="p-4 sm:p-5 lg:p-6 cursor-pointer transición-all duración-300 hover:scale-[1.04] hover:shadow-xl"
                onClick={() => onViewDetails('player', player.id)}
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Avatar con rating */}
                    <motion.div
                        whileHover={{ scale: 1.06, rotate: 8 }}
                        transition={{ duration: 0.4 }}
                        className="relative self-start"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-blue-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transición-all duración-300">
                            <div className="absolute -inset-1 bg-gradient-to-br from-red-400 to-blue-400 rounded-full opacity-20 group-hover:opacity-40 transición-opacity duración-300 animate-pulse"></div>
                            <span className="relative text-white font-bold text-lg">{player.rating ?? '--'}</span>
                        </div>
                        <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                    </motion.div>

                    {/* Info del jugador */}
                    <div className="flex-1 min-w-0 space-y-3 sm:space-y-2">
                        <div className="space-y-1">
                            <h3 className="font-bold text-gray-800 dark:text-white text-base truncate">
                                {player.name || 'Jugador sin nombre'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {player.position || 'Sin posición'}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                            {metrics.map((metric) => (
                                <div className="text-center" key={metric.label}>
                                    <p className={`font-bold ${metric.color}`}>{metric.value}</p>
                                    <p className="text-gray-500 dark:text-gray-400">{metric.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col gap-2 sm:items-end self-stretch">
                        <GradientBadge
                            variant={player.impact === 'high' ? 'success' : 'warning'}
                            size="small"
                            className="animate-pulse"
                        >
                            {player.impact === 'high' ? 'Alto' : 'Medio'}
                        </GradientBadge>
                        <AnimatedButton
                            variant="ghost"
                            size="sm"
                            aria-label={`Ver detalles de ${player.name || 'jugador'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails('player', player.id);
                            }}
                            icon={Eye}
                        />
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
});

const ModernDashboard = () => {
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();
    const { stats, isConnected } = useRealTimeStats();
    const dashboardTopRef = useRef(null);

    // Estados optimizados
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
    const [keyPlayers, setKeyPlayers] = useState([]);
    const [isKeyPlayersLoading, setIsKeyPlayersLoading] = useState(true);
    const [recentAnalysis, setRecentAnalysis] = useState([]);
    const [isRecentAnalysisLoading, setIsRecentAnalysisLoading] = useState(true);

    // Datos optimizados con useMemo
    const teamStats = useMemo(() => [
        {
            icon: Target,
            label: 'Eficiencia Ofensiva',
            value: stats?.offensiveEfficiency || '112.4',
            change: '+5.2',
            gradient: 'from-green-500 to-emerald-600',
            trend: 'up',
            description: 'Puntos por 100 posesiones'
        },
        {
            icon: Shield,
            label: 'Eficiencia Defensiva',
            value: stats?.defensiveEfficiency || '98.7',
            change: '-3.1',
            gradient: 'from-blue-500 to-cyan-600',
            trend: 'down',
            description: 'Puntos permitidos por 100 posesiones'
        },
        {
            icon: Zap,
            label: 'Ritmo de Juego',
            value: stats?.pace || '96.2',
            change: '+2.4',
            gradient: 'from-purple-500 to-pink-600',
            trend: 'up',
            description: 'Velocidad del juego'
        },
        {
            icon: BarChart3,
            label: 'Predicción Victorias',
            value: stats?.winPrediction || '68%',
            change: '+8%',
            gradient: 'from-orange-500 to-red-600',
            trend: 'up',
            description: 'Probabilidad de victoria'
        },
    ], [stats]);

    useEffect(() => {
        let isActive = true;
        setIsUpcomingLoading(true);
        setIsKeyPlayersLoading(true);
        setIsRecentAnalysisLoading(true);

        const timer = setTimeout(() => {
            if (!isActive) return;

            setUpcomingGames([
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
                }
            ]);
            setKeyPlayers([
                {
                    id: 1,
                    name: 'Karl-Anthony Towns',
                    position: 'Pívot',
                    rating: 95,
                    ppg: 22.5,
                    rpg: 11.2,
                    apg: 3.8,
                    impact: 'high'
                },
                {
                    id: 2,
                    name: 'Al Horford',
                    position: 'Ala-Pívot',
                    rating: 88,
                    ppg: 12.3,
                    rpg: 8.7,
                    apg: 3.2,
                    impact: 'medium'
                },
                {
                    id: 3,
                    name: 'Chris Duarte',
                    position: 'Escolta',
                    rating: 82,
                    ppg: 15.8,
                    rpg: 4.2,
                    apg: 2.5,
                    impact: 'high'
                }
            ]);
            setRecentAnalysis([
                {
                    id: 1,
                    title: 'Análisis Ofensivo vs Argentina',
                    date: '2024-10-15',
                    type: 'offensive',
                    result: 'Victoria 89-84',
                    confidence: 'high',
                    status: 'completed'
                },
                {
                    id: 2,
                    title: 'Estudio Defensivo Canadá',
                    date: '2024-10-08',
                    type: 'defensive',
                    result: 'Derrota 76-80',
                    confidence: 'medium',
                    status: 'in_review'
                }
            ]);
            setIsUpcomingLoading(false);
            setIsKeyPlayersLoading(false);
            setIsRecentAnalysisLoading(false);
        }, 600);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!isAnalysisModalOpen && !isExportModalOpen) return;

        const targetElement = dashboardTopRef.current;
        if (!targetElement) {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const nav = document.querySelector('[data-app-navbar]') || document.querySelector('nav');
        const navHeight = nav ? nav.getBoundingClientRect().height : 0;
        const offset = Math.max(0, rect.top + window.scrollY - navHeight - 16);

        window.requestAnimationFrame(() => {
            window.scrollTo({ top: offset, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }, [isAnalysisModalOpen, isExportModalOpen, prefersReducedMotion]);

    // Handlers optimizados con useCallback
    const handleRunAnalysis = useCallback(() => {
        setIsAnalysisModalOpen(true);
    }, []);

    const handleStartAnalysis = useCallback(() => {
        setIsLoading(true);
        setIsAnalysisModalOpen(false);

        // Simular análisis
        setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    }, []);

    const handleExportDashboard = useCallback(() => {
        setIsExportModalOpen(true);
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

    const getConfidenceBadge = useCallback((confidence) => {
        const config = {
            high: { variant: 'success', label: 'Alta' },
            medium: { variant: 'warning', label: 'Media' },
            low: { variant: 'danger', label: 'Baja' }
        };
        return config[confidence] || config.medium;
    }, []);

    const getStatusBadge = useCallback((status) => {
        const config = {
            analysis_pending: { variant: 'warning', label: 'Análisis Pendiente' },
            in_study: { variant: 'info', label: 'En Estudio' },
            completed: { variant: 'success', label: 'Completado' },
            in_review: { variant: 'warning', label: 'En Revisión' }
        };
        return config[status] || config.info;
    }, []);

    // Loading state mejorado
    if (isLoading) {
        return (
            <LoadingState
                message="Ejecutando análisis táctico..."
                variant="basketball"
            />
        );
    }

    // Error state mejorado
    if (hasError) {
        return (
            <ErrorState
                title="Error al cargar el dashboard"
                message="No se pudieron cargar los datos del sistema. Por favor, inténtalo de nuevo."
                onRetry={() => setHasError(false)}
                onGoHome={() => navigate('/dashboard')}
            />
        );
    }

    return (
        <div ref={dashboardTopRef} className="min-h-screen space-y-8">
            {/* Header moderno con glassmorphism y colores dominicanos */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <GlassCard hover className="p-6 md:p-8 relative overflow-hidden">
                    {/* Background Pattern Dominicano */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-blue-50/20 to-purple-50/30 dark:from-red-900/10 dark:via-blue-900/5 dark:to-purple-900/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
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
                                    <motion.div
                                        className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        2010-2025
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-6 lg:mt-0">
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
                                    onClick={handleExportDashboard}
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

            {/* Grid de estadísticas con animaciones */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
                {teamStats.map((stat, index) => (
                    <ModernStatCard key={stat.label} stat={stat} index={index} />
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                {/* Próximos Compromisos */}
                <motion.div
                    className="lg:col-span-2 2xl:col-span-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <GlassCard hover className="p-6 md:p-8">
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
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/games')}
                                icon={ArrowRight}
                            >
                                Ver Todos
                            </AnimatedButton>
                        </div>

                        <div className="space-y-4">
                            {isUpcomingLoading ? (
                                Array.from({ length: 2 }).map((_, skeletonIndex) => (
                                    <div
                                        key={`upcoming-skeleton-${skeletonIndex}`}
                                        className="h-36 rounded-2xl bg-gray-100/80 dark:bg-gray-800/40 animate-pulse"
                                    />
                                ))
                            ) : upcomingGames.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p className="font-medium">Sin compromisos próximos.</p>
                                    <p className="text-sm">Regresa más tarde o programa un nuevo partido.</p>
                                </div>
                            ) : (
                                upcomingGames.map((game, index) => {
                                    const confidenceConfig = getConfidenceBadge(game.confidence);
                                    const statusConfig = getStatusBadge(game.status);

                                    return (
                                        <motion.div
                                            key={game.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.15, duration: 0.5 }}
                                            className="group relative overflow-hidden p-6 lg:p-7 bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/10 rounded-2xl border border-blue-200/30 dark:border-gray-600 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm"
                                            onClick={() => navigate(`/games/${game.id}`)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <GradientBadge variant="info" size="small">
                                                    {game.tournament}
                                                </GradientBadge>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <GradientBadge variant={statusConfig.variant} size="small">
                                                        {statusConfig.label}
                                                    </GradientBadge>
                                                    <GradientBadge variant={confidenceConfig.variant} size="small">
                                                        {confidenceConfig.label}
                                                    </GradientBadge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="text-center flex-shrink-0">
                                                        <div className="text-3xl mb-2 animate-bounce">{game.homeLogo}</div>
                                                        <p className="font-bold text-gray-800 dark:text-white text-sm">DOM</p>
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <span className="text-base md:text-xl text-gray-400 font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                            VS
                                                        </span>
                                                    </div>
                                                    <div className="text-center flex-shrink-0">
                                                        <div className="text-3xl mb-2">{game.awayLogo}</div>
                                                        <p className="font-bold text-gray-800 dark:text-white text-sm">{game.opponent}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm md:self-end">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(game.date).toLocaleDateString('es-ES')}</span>
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">{game.time}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-4">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{game.venue}</span>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
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
                                                    <GradientBadge variant="success" size="small" className="animate-pulse">
                                                        ML
                                                    </GradientBadge>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-blue-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Jugadores Clave */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <GlassCard hover className="p-6 md:p-8">
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
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/players')}
                                icon={ArrowRight}
                            >
                                Ver Todos
                            </AnimatedButton>
                        </div>

                        <div className="space-y-4">
                            {isKeyPlayersLoading ? (
                                Array.from({ length: 3 }).map((_, skeletonIndex) => (
                                    <div
                                        key={`player-skeleton-${skeletonIndex}`}
                                        className="h-24 rounded-2xl bg-gray-100/80 dark:bg-gray-800/40 animate-pulse"
                                    />
                                ))
                            ) : keyPlayers.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <p className="font-medium">No hay jugadores destacados aun.</p>
                                    <p className="text-sm">Actualiza la base de datos o agrega nuevos registros.</p>
                                </div>
                            ) : (
                                keyPlayers.map((player, index) => (
                                    <ModernPlayerCard
                                        key={player.id}
                                        player={player}
                                        index={index}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Análisis Recientes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
                <GlassCard hover className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <Activity className="w-7 h-7 text-orange-600" />
                            Análisis Recientes
                            <motion.div
                                className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                            />
                        </h2>
                        <AnimatedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/analytics')}
                            icon={ArrowRight}
                        >
                            Ver Todos
                        </AnimatedButton>
                    </div>

                    {recentAnalysis.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <p className="font-medium">Aún no hay análisis recientes.</p>
                            <p className="text-sm mt-1">Ejecuta un nuevo análisis para ver resultados aquí.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {isRecentAnalysisLoading ? (
                                Array.from({ length: 2 }).map((_, skeletonIndex) => (
                                    <div
                                        key={`analysis-skeleton-${skeletonIndex}`}
                                        className="h-32 lg:h-36 rounded-2xl bg-gray-100/80 dark:bg-gray-800/40 animate-pulse"
                                    />
                                ))
                            ) : (
                                recentAnalysis.map((analysis, index) => (
                                    <RecentAnalysisCard
                                        key={analysis.id}
                                        analysis={analysis}
                                        index={index}
                                        onNavigate={navigate}
                                        getConfidenceBadge={getConfidenceBadge}
                                        getStatusBadge={getStatusBadge}
                                        prefersReducedMotion={prefersReducedMotion}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </GlassCard>
            </motion.div>

            {/* Modales optimizados */}
            <AnimatePresence>
                {isAnalysisModalOpen && (
                    <ModernModal
                        isOpen={isAnalysisModalOpen}
                        onClose={() => setIsAnalysisModalOpen(false)}
                        title="Ejecutar Análisis Táctico"
                        size="md"
                    >
                        <div className="space-y-6">
                            <motion.div
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Análisis Integral
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Evaluación completa del equipo con análisis ofensivo, defensivo y predictivo.
                                </p>
                            </motion.div>

                            <div className="flex gap-3 justify-end pt-4">
                                <AnimatedButton
                                    variant="secondary"
                                    onClick={() => setIsAnalysisModalOpen(false)}
                                >
                                    Cancelar
                                </AnimatedButton>
                                <AnimatedButton
                                    variant="primary"
                                    onClick={handleStartAnalysis}
                                    icon={Play}
                                >
                                    Iniciar Análisis
                                </AnimatedButton>
                            </div>
                        </div>
                    </ModernModal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isExportModalOpen && (
                    <ModernModal
                        isOpen={isExportModalOpen}
                        onClose={() => setIsExportModalOpen(false)}
                        title="Exportar Dashboard"
                        size="md"
                    >
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Formato de Exportación
                                </label>
                                <select className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 transition-all">
                                    <option value="pdf">PDF Report</option>
                                    <option value="excel">Excel</option>
                                    <option value="json">JSON</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <AnimatedButton
                                    variant="secondary"
                                    onClick={() => setIsExportModalOpen(false)}
                                >
                                    Cancelar
                                </AnimatedButton>
                                <AnimatedButton
                                    variant="primary"
                                    onClick={() => setIsExportModalOpen(false)}
                                    icon={Download}
                                >
                                    Exportar
                                </AnimatedButton>
                            </div>
                        </div>
                    </ModernModal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(ModernDashboard);

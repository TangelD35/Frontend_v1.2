import {
    Users, Target, TrendingUp, TrendingDown, Calendar, Shield, Zap,
    BarChart3, Play, Download, Eye, ArrowRight, Activity,
    MapPin, Star, Trophy, Clock, AlertCircle, CheckCircle, Flag,
    Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GlassCard,
    AnimatedButton,
    GradientBadge,
    ModernTable,
    ModernModal,
    LoadingState,
    ErrorState,
    ThemeSwitcher,
    FloatingInput,
    SkeletonLoader,
    useNotifications
} from '../../../../../shared/ui/components/modern';
import { useRealTimeStats } from '../../../../../shared/hooks/useRealTimeStats';
import { useAuth } from '../../../../../shared/hooks/useAuth';

// Componente optimizado para estadística
const ExampleStatCard = memo(({ stat, index }) => {
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
                onClick={() => {}}
            >
                <div className="flex items-center justify-between mb-4">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                        <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
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
            </GlassCard>
        </motion.div>
    );
});

const ModernDashboardExample = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stats, isConnected, lastUpdate } = useRealTimeStats();
    const { addNotification } = useNotifications();

    // Estados optimizados
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSkeleton, setShowSkeleton] = useState(false);

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

    const players = useMemo(() => [
        { id: 1, name: 'Karl-Anthony Towns', position: 'Pívot', rating: 95, ppg: 22.5, rpg: 11.2, apg: 3.8 },
        { id: 2, name: 'Al Horford', position: 'Ala-Pívot', rating: 88, ppg: 12.3, rpg: 8.7, apg: 3.2 },
        { id: 3, name: 'Chris Duarte', position: 'Escolta', rating: 82, ppg: 15.8, rpg: 4.2, apg: 2.5 },
    ], []);

    const columns = useMemo(() => [
        {
            key: 'name',
            label: 'Jugador',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-blue-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{row.position}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                        {value}
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-gradient-to-r from-red-600 to-blue-600 h-2 rounded-full"
                        />
                    </div>
                </div>
            )
        },
        {
            key: 'stats',
            label: 'Estadísticas',
            render: (_, row) => (
                <div className="flex gap-2">
                    <GradientBadge variant="success" size="small">{row.ppg} PPG</GradientBadge>
                    <GradientBadge variant="info" size="small">{row.rpg} RPG</GradientBadge>
                    <GradientBadge variant="warning" size="small">{row.apg} APG</GradientBadge>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <AnimatedButton
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/players/${row.id}`)}
                        icon={Eye}
                    />
                </div>
            )
        }
    ], [navigate]);

    // Handlers optimizados
    const handleRunAnalysis = useCallback(() => {
        setIsAnalysisModalOpen(true);
    }, []);

    const handleStartAnalysis = useCallback(() => {
        setIsLoading(true);
        setIsAnalysisModalOpen(false);

        addNotification({
            type: 'info',
            title: 'Análisis Iniciado',
            message: 'El análisis táctico está en progreso...',
            duration: 3000
        });

        setTimeout(() => {
            setIsLoading(false);
            addNotification({
                type: 'success',
                title: 'Análisis Completado',
                message: 'Los resultados están disponibles',
                duration: 5000
            });
        }, 3000);
    }, [addNotification]);

    const handleExportDashboard = useCallback(() => {
        setIsExportModalOpen(true);
    }, []);

    const handleExport = useCallback(() => {
        setIsExportModalOpen(false);
        addNotification({
            type: 'success',
            title: 'Exportación Exitosa',
            message: 'El dashboard ha sido exportado correctamente',
            duration: 5000
        });
    }, [addNotification]);

    const handleShowSkeleton = useCallback(() => {
        setShowSkeleton(true);
        setTimeout(() => setShowSkeleton(false), 3000);
    }, []);

    const handleShowError = useCallback(() => {
        setHasError(true);
        setTimeout(() => setHasError(false), 5000);
    }, []);

    // Estados de carga y error
    if (hasError) {
        return (
            <ErrorState
                title="Error al cargar el dashboard"
                message="No se pudieron cargar los datos del sistema. Por favor, inténtalo de nuevo."
                onRetry={() => setHasError(false)}
                onGoHome={() => navigate('/dashboard')}
                onGoBack={() => navigate(-1)}
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingState
                message="Ejecutando análisis táctico..."
                variant="basketball"
            />
        );
    }

    return (
        <div className="min-h-screen space-y-8">
            {/* Header moderno con glassmorphism y colores dominicanos */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <GlassCard hover gradient className="p-8 relative overflow-hidden">
                    {/* Background Pattern Dominicano */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-blue-50/20 to-purple-50/30 dark:from-red-900/10 dark:via-blue-900/5 dark:to-purple-900/10" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
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

                        <div className="flex items-center gap-4 mt-6 lg:mt-0">
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

                            <ThemeSwitcher />
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

            {/* Barra de búsqueda con FloatingInput */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <GlassCard className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <FloatingInput
                                label="Buscar jugadores, equipos, partidos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="flex gap-2">
                            <AnimatedButton
                                variant="outline"
                                icon={Filter}
                                onClick={handleShowSkeleton}
                            >
                                Filtros
                            </AnimatedButton>
                            <AnimatedButton
                                variant="outline"
                                icon={Settings}
                                onClick={handleShowError}
                            >
                                Configuración
                            </AnimatedButton>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Grid de estadísticas con animaciones */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {teamStats.map((stat, index) => (
                    <ExampleStatCard key={stat.label} stat={stat} index={index} />
                ))}
            </motion.div>

            {/* Tabla moderna con datos */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <Users className="w-7 h-7 text-purple-600" />
                            Jugadores del Plantel
                            <motion.div
                                className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </h2>
                        <AnimatedButton
                            variant="ghost"
                            size="small"
                            onClick={() => navigate('/players')}
                            icon={ArrowRight}
                        >
                            Ver Todos
                        </AnimatedButton>
                    </div>

                    {showSkeleton ? (
                        <div className="space-y-4">
                            <SkeletonLoader lines={5} />
                        </div>
                    ) : (
                        <ModernTable
                            columns={columns}
                            data={players}
                            onRowClick={(row) => navigate(`/players/${row.id}`)}
                        />
                    )}
                </GlassCard>
            </motion.div>

            {/* Sección de acciones rápidas */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <GlassCard hover className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        Sistema Operativo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Todos los servicios funcionando correctamente
                    </p>
                    <GradientBadge variant="success" size="medium">
                        En Línea
                    </GradientBadge>
                </GlassCard>

                <GlassCard hover className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        Análisis Activos
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        3 análisis en progreso
                    </p>
                    <GradientBadge variant="info" size="medium">
                        Procesando
                    </GradientBadge>
                </GlassCard>

                <GlassCard hover className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                        Notificaciones
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        5 notificaciones pendientes
                    </p>
                    <GradientBadge variant="warning" size="medium">
                        Pendientes
                    </GradientBadge>
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
                                    onClick={handleExport}
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

export default memo(ModernDashboardExample);
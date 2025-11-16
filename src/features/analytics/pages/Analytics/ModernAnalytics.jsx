import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Target,
    Users,
    RefreshCw,
    TrendingUp,
    Trophy,
    Shield,
    Award,
    X,
    Activity,
    Zap,
    Eye,
    Crosshair
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';

import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { advancedAnalyticsService } from '../../../../shared/api/endpoints/advancedAnalytics';
import { teamsService } from '../../../../shared/api/endpoints/teams';
import { analyticsService } from '../../../../shared/api/endpoints/analytics';
import LoadingSpinner from '../../../../shared/ui/components/common/feedback/LoadingSpinner';
import ErrorState from '../../../../shared/ui/components/modern/ErrorState/ErrorState';
import BanderaDominicana from '../../../../assets/icons/do.svg';

const ModernAnalytics = () => {
    const {
        leagueAverages,
        teamTrends,
        topPlayers,
        loading: advancedLoading,
        error: advancedError,
        fetchTeamTrends,
        fetchTopPlayers,
        refetch: refetchAdvanced
    } = useAdvancedAnalytics();

    const [activeTab, setActiveTab] = useState('resumen');
    const [trendMetric, setTrendMetric] = useState('puntos');
    const [playerMetric, setPlayerMetric] = useState('ppg');

    // Estados para pestaña de Jugadores
    const [selectedPlayerMetric, setSelectedPlayerMetric] = useState('ppg');
    const [topPlayersData, setTopPlayersData] = useState([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [playersPeriod, setPlayersPeriod] = useState({ start: 2010, end: 2025 });
    const [leagueAvg, setLeagueAvg] = useState(null);
    const [rdTeamId, setRdTeamId] = useState(null);
    const [summary, setSummary] = useState(null);

    // Estados para modal de detalles de jugador
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerDetails, setPlayerDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);

    // Cargar datos al montar el componente
    useEffect(() => {
        const loadData = async () => {
            try {
                // Cargar summary
                const summaryData = await analyticsService.getSummary();
                setSummary(summaryData);

                // Obtener todos los equipos
                const teamsResponse = await teamsService.getAll({ limit: 50 });

                if (teamsResponse?.items?.length > 0) {
                    // Buscar equipo de República Dominicana
                    let rdTeam = teamsResponse.items.find(team =>
                        team.nombre?.toLowerCase().includes('dominicana') ||
                        team.nombre?.toLowerCase().includes('república') ||
                        team.name?.toLowerCase().includes('dominicana') ||
                        team.name?.toLowerCase().includes('república') ||
                        team.nombre?.toLowerCase().includes('rd') ||
                        team.name?.toLowerCase().includes('rd')
                    );

                    // Si no encuentra por nombre, usar el primer equipo
                    if (!rdTeam && teamsResponse.items.length > 0) {
                        rdTeam = teamsResponse.items[0];
                    }

                    if (rdTeam) {
                        setRdTeamId(rdTeam.id);

                        // Cargar tendencias del equipo
                        await fetchTeamTrends(rdTeam.id, 2010, 2025);
                    }
                }

                // Cargar top jugadores con métrica inicial
                await fetchTopPlayers(playerMetric, 5, 2010, 2025);

            } catch (error) {
                console.error('Error cargando datos de analytics:', error);
            }
        };

        loadData();
    }, [fetchTeamTrends, fetchTopPlayers, playerMetric]);

    // Cargar top jugadores cuando cambia la métrica o período
    useEffect(() => {
        if (activeTab === 'jugadores') {
            loadTopPlayers();
            loadLeagueAverages();
        }
    }, [activeTab, selectedPlayerMetric, playersPeriod]);

    const loadTopPlayers = async () => {
        try {
            setLoadingPlayers(true);
            const data = await advancedAnalyticsService.getTopPlayers(
                selectedPlayerMetric,
                10,
                playersPeriod.start,
                playersPeriod.end
            );
            setTopPlayersData(data || []);
        } catch (error) {
            console.error('Error loading top players:', error);
            setTopPlayersData([]);
        } finally {
            setLoadingPlayers(false);
        }
    };

    const loadLeagueAverages = async () => {
        try {
            const data = await advancedAnalyticsService.getLeagueAverages(
                playersPeriod.start,
                playersPeriod.end
            );
            setLeagueAvg(data || null);
        } catch (error) {
            console.error('Error loading league averages:', error);
            setLeagueAvg(null);
        }
    };

    const getMetricConfig = (metric) => {
        const configs = {
            ppg: { label: 'Puntos por Juego', color: '#CE1126', icon: Target, unit: 'PPG' },
            apg: { label: 'Asistencias por Juego', color: '#002D62', icon: Users, unit: 'APG' },
            rpg: { label: 'Rebotes por Juego', color: '#6b7280', icon: TrendingUp, unit: 'RPG' },
            spg: { label: 'Robos por Juego', color: '#10B981', icon: Shield, unit: 'SPG' },
            bpg: { label: 'Bloqueos por Juego', color: '#8B5CF6', icon: Award, unit: 'BPG' },
            per: { label: 'Player Efficiency Rating', color: '#F59E0B', icon: Trophy, unit: 'PER' },
            fg_pct: { label: 'Porcentaje de Campo', color: '#3B82F6', icon: Target, unit: 'FG%' }
        };
        return configs[metric] || configs.ppg;
    };

    const formatMetricValue = (value, metric) => {
        if (value === null || value === undefined) return 'N/A';
        if (metric === 'fg_pct') return `${(value * 100).toFixed(1)}%`;
        return value.toFixed(1);
    };

    // Cargar detalles completos de un jugador usando TODOS los endpoints
    const loadPlayerDetails = async (player) => {
        try {
            setLoadingDetails(true);
            setSelectedPlayer(player);
            setShowPlayerModal(true);

            const currentSeason = new Date().getFullYear().toString();

            // Llamadas paralelas a TODOS los endpoints de jugador
            const [playerStats, advancedStats, perData, quickMetrics] = await Promise.allSettled([
                // 1. GET /analytics/players/{player_id} - Stats básicas offense/defense
                analyticsService.getPlayerStats(player.player_id),

                // 2. GET /advanced-analytics/player/{player_id}/advanced-stats
                advancedAnalyticsService.getPlayerAdvancedStats(player.player_id, currentSeason),

                // 3. GET /advanced-analytics/player/{player_id}/per
                advancedAnalyticsService.getPlayerPER(player.player_id, currentSeason),

                // 4. GET /advanced-analytics/player/{player_id}/quick-metrics
                advancedAnalyticsService.getPlayerQuickMetrics(player.player_id, currentSeason)
            ]);

            setPlayerDetails({
                basic: player,
                stats: playerStats.status === 'fulfilled' ? playerStats.value : null,
                advanced: advancedStats.status === 'fulfilled' ? advancedStats.value : null,
                per: perData.status === 'fulfilled' ? perData.value : null,
                quickMetrics: quickMetrics.status === 'fulfilled' ? quickMetrics.value : null
            });

        } catch (error) {
            console.error('Error loading player details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closePlayerModal = () => {
        setShowPlayerModal(false);
        setSelectedPlayer(null);
        setPlayerDetails(null);
    };

    // Helper para formatear números
    const formatNumber = (value, decimals = 0) => {
        if (value == null || isNaN(value)) return '0';
        return Number(value).toFixed(decimals);
    };

    // Calcular dominio dinámico para el eje Y según la métrica
    const getYAxisDomain = (metric) => {
        if (!teamTrends || teamTrends.length === 0) return [0, 100];

        let values = [];
        switch (metric) {
            case 'puntos':
                values = teamTrends.map(t => t.avg_points);
                break;
            case 'asistencias':
                values = teamTrends.map(t => t.avg_assists);
                break;
            case 'rebotes':
                values = teamTrends.map(t => t.avg_rebounds);
                break;
            default:
                return [0, 100];
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.15; // 15% de padding

        return [
            Math.floor(min - padding),
            Math.ceil(max + padding)
        ];
    };

    // Generar insights automáticos del gráfico
    const getChartInsights = (metric) => {
        if (!teamTrends || teamTrends.length < 2) return null;

        let values = [];
        let metricName = '';
        let unit = '';

        switch (metric) {
            case 'puntos':
                values = teamTrends.map(t => t.avg_points);
                metricName = 'puntos';
                unit = 'pts';
                break;
            case 'asistencias':
                values = teamTrends.map(t => t.avg_assists);
                metricName = 'asistencias';
                unit = 'ast';
                break;
            case 'rebotes':
                values = teamTrends.map(t => t.avg_rebounds);
                metricName = 'rebotes';
                unit = 'reb';
                break;
            default:
                return null;
        }

        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const maxYear = teamTrends[values.indexOf(maxValue)].periodo;
        const minYear = teamTrends[values.indexOf(minValue)].periodo;
        const change = lastValue - firstValue;
        const changePercent = ((change / firstValue) * 100).toFixed(1);
        const trend = change > 0 ? 'alza' : change < 0 ? 'baja' : 'estable';

        // Calcular promedio
        const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

        return {
            metricName,
            unit,
            firstValue: firstValue.toFixed(1),
            lastValue: lastValue.toFixed(1),
            maxValue: maxValue.toFixed(1),
            minValue: minValue.toFixed(1),
            maxYear,
            minYear,
            change: Math.abs(change).toFixed(1),
            changePercent: Math.abs(changePercent),
            trend,
            average,
            isPositive: change > 0
        };
    };

    if (advancedError) {
        return (
            <ErrorState
                title="No se pudieron cargar las analíticas"
                message={advancedError?.message || 'Verifica tu sesión o intenta de nuevo.'}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-['Inter',system-ui,sans-serif]">
            <main className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-10">
                {advancedLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="large" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Pestañas de Navegación */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2"
                        >
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setActiveTab('resumen')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'resumen'
                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Resumen
                                </button>
                                <button
                                    onClick={() => setActiveTab('jugadores')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'jugadores'
                                        ? 'bg-[#002D62] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Jugadores
                                </button>
                                <button
                                    onClick={() => setActiveTab('equipo')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'equipo'
                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Equipo
                                </button>
                                <button
                                    onClick={() => setActiveTab('torneo')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'torneo'
                                        ? 'bg-[#002D62] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Torneo
                                </button>
                                <button
                                    onClick={() => setActiveTab('metricas')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'metricas'
                                        ? 'bg-gray-700 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Métricas
                                </button>
                            </div>
                        </motion.div>

                        {/* Hero Section - República Dominicana */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-8 shadow-2xl border border-white/10"
                        >
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                                    animation: 'slide 20s linear infinite'
                                }}></div>
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

                            {/* Content */}
                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/40 overflow-hidden">
                                            <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">República Dominicana</h2>
                                            <p className="text-white/80 text-sm font-medium">Selección Nacional de Baloncesto</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Período</p>
                                        <p className="text-white text-xl font-bold">2010 - 2025</p>
                                    </div>
                                </div>

                                {/* KPIs del summary */}
                                {summary ? (
                                    <div className="flex justify-center">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl w-full">
                                            {/* Total Torneos */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                                                className="group relative overflow-hidden rounded-2xl"
                                            >
                                                {/* Fondo con gradiente */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>

                                                {/* Efecto hover brillante */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* Borde animado */}
                                                <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-2xl transition-all duration-300"></div>

                                                {/* Contenido */}
                                                <div className="relative p-6 transform group-hover:scale-105 transition-transform duration-300">
                                                    <div className="flex flex-col items-center">
                                                        {/* Icono grande con gradiente rojo */}
                                                        <div className="mb-3 p-4 rounded-2xl bg-gradient-to-br from-red-500/30 to-red-600/20 backdrop-blur-sm shadow-2xl group-hover:shadow-red-500/20 transition-all duration-300 group-hover:scale-110">
                                                            <Trophy className="w-9 h-9 text-white drop-shadow-lg" />
                                                        </div>

                                                        {/* Título */}
                                                        <p className="text-white/90 text-xs font-extrabold uppercase tracking-[0.15em] mb-4 group-hover:text-white transition-colors">
                                                            Torneos
                                                        </p>

                                                        {/* Número principal */}
                                                        <div className="mb-2">
                                                            <p className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                                                                {summary.tournaments || 0}
                                                            </p>
                                                        </div>

                                                        {/* Descripción */}
                                                        <p className="text-white/70 text-sm font-semibold group-hover:text-white/90 transition-colors">
                                                            Registrados
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Total Jugadores */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                                className="group relative overflow-hidden rounded-2xl"
                                            >
                                                {/* Fondo con gradiente */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>

                                                {/* Efecto hover brillante */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* Borde animado */}
                                                <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-2xl transition-all duration-300"></div>

                                                {/* Contenido */}
                                                <div className="relative p-6 transform group-hover:scale-105 transition-transform duration-300">
                                                    <div className="flex flex-col items-center">
                                                        {/* Icono grande con gradiente azul */}
                                                        <div className="mb-3 p-4 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 backdrop-blur-sm shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-110">
                                                            <Users className="w-9 h-9 text-white drop-shadow-lg" />
                                                        </div>

                                                        {/* Título */}
                                                        <p className="text-white/90 text-xs font-extrabold uppercase tracking-[0.15em] mb-4 group-hover:text-white transition-colors">
                                                            Jugadores
                                                        </p>

                                                        {/* Número principal */}
                                                        <div className="mb-2">
                                                            <p className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                                                                {summary.players || 0}
                                                            </p>
                                                        </div>

                                                        {/* Descripción */}
                                                        <p className="text-white/70 text-sm font-semibold group-hover:text-white/90 transition-colors">
                                                            Registrados
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Total Partidos */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                                className="group relative overflow-hidden rounded-2xl"
                                            >
                                                {/* Fondo con gradiente */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>

                                                {/* Efecto hover brillante */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                {/* Borde animado */}
                                                <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-2xl transition-all duration-300"></div>

                                                {/* Contenido */}
                                                <div className="relative p-6 transform group-hover:scale-105 transition-transform duration-300">
                                                    <div className="flex flex-col items-center">
                                                        {/* Icono grande con gradiente rojo */}
                                                        <div className="mb-3 p-4 rounded-2xl bg-gradient-to-br from-red-500/30 to-red-600/20 backdrop-blur-sm shadow-2xl group-hover:shadow-red-500/20 transition-all duration-300 group-hover:scale-110">
                                                            <Target className="w-9 h-9 text-white drop-shadow-lg" />
                                                        </div>

                                                        {/* Título */}
                                                        <p className="text-white/90 text-xs font-extrabold uppercase tracking-[0.15em] mb-4 group-hover:text-white transition-colors">
                                                            Partidos
                                                        </p>

                                                        {/* Número principal */}
                                                        <div className="mb-2">
                                                            <p className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                                                                {summary.games || 0}
                                                            </p>
                                                        </div>

                                                        {/* Descripción */}
                                                        <p className="text-white/70 text-sm font-semibold group-hover:text-white/90 transition-colors">
                                                            Jugados
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-8 h-8 text-white/50 animate-spin mr-3" />
                                        <p className="text-white/70">Cargando estadísticas del equipo...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Contenido según pestaña activa */}
                        {activeTab === 'resumen' && (
                            <>
                                {/* Grid Principal: Evolución Temporal + Top Players */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Evolución Temporal - 2/3 del espacio */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                        className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                                                    <TrendingUp className="w-5 h-5 text-[#CE1126]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolución Temporal del Equipo</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">República Dominicana 2010-2025</p>
                                                </div>
                                            </div>
                                            {/* Filtros de métrica */}
                                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                <button
                                                    onClick={() => setTrendMetric('puntos')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${trendMetric === 'puntos'
                                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Puntos
                                                </button>
                                                <button
                                                    onClick={() => setTrendMetric('asistencias')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${trendMetric === 'asistencias'
                                                        ? 'bg-[#002D62] text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Asistencias
                                                </button>
                                                <button
                                                    onClick={() => setTrendMetric('rebotes')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${trendMetric === 'rebotes'
                                                        ? 'bg-gray-600 text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Rebotes
                                                </button>
                                            </div>
                                        </div>

                                        {/* Gráfico de Tendencias */}
                                        {teamTrends && teamTrends.length > 0 ? (
                                            <div style={{ width: '100%', height: '350px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart
                                                        data={teamTrends.map(period => ({
                                                            año: period.periodo,
                                                            puntos: period.avg_points,
                                                            asistencias: period.avg_assists,
                                                            rebotes: period.avg_rebounds
                                                        }))}
                                                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                                                        <XAxis
                                                            dataKey="año"
                                                            stroke="#6b7280"
                                                            style={{ fontSize: '12px' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            domain={getYAxisDomain(trendMetric)}
                                                            stroke="#6b7280"
                                                            style={{ fontSize: '11px' }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        {trendMetric === 'puntos' && (
                                                            <Line
                                                                type="monotone"
                                                                dataKey="puntos"
                                                                stroke="#CE1126"
                                                                strokeWidth={3}
                                                                dot={{ fill: '#CE1126', r: 5 }}
                                                                activeDot={{ r: 7 }}
                                                            />
                                                        )}
                                                        {trendMetric === 'asistencias' && (
                                                            <Line
                                                                type="monotone"
                                                                dataKey="asistencias"
                                                                stroke="#002D62"
                                                                strokeWidth={3}
                                                                dot={{ fill: '#002D62', r: 5 }}
                                                                activeDot={{ r: 7 }}
                                                            />
                                                        )}
                                                        {trendMetric === 'rebotes' && (
                                                            <Line
                                                                type="monotone"
                                                                dataKey="rebotes"
                                                                stroke="#6b7280"
                                                                strokeWidth={3}
                                                                dot={{ fill: '#6b7280', r: 5 }}
                                                                activeDot={{ r: 7 }}
                                                            />
                                                        )}
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-20">
                                                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-2" />
                                                <p className="text-gray-500">Cargando tendencias...</p>
                                            </div>
                                        )}

                                        {/* Lectura/Insights del Gráfico */}
                                        {teamTrends && teamTrends.length > 0 && (() => {
                                            const insights = getChartInsights(trendMetric);
                                            if (!insights) return null;

                                            return (
                                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                        {/* Tendencia General */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#CE1126] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Tendencia</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-red-50 dark:bg-red-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.isPositive ? '↑' : '↓'} {insights.changePercent}%
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    {insights.trend === 'alza' ? 'En alza' : insights.trend === 'baja' ? 'En baja' : 'Estable'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                                                                    {insights.change} {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Promedio General */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#002D62] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Promedio</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.average}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    2010-2025
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                                                                    {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Mejor Año */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#CE1126] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Mejor Año</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-red-50 dark:bg-red-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.maxYear}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    {insights.maxValue} {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Peor Año */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#002D62] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Peor Año</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.minYear}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    {insights.minValue} {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Texto descriptivo */}
                                                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                            <span className="font-bold text-gray-900 dark:text-white">Análisis:</span> Los {insights.metricName} de República Dominicana muestran una tendencia <span className="font-semibold">{insights.trend === 'alza' ? 'positiva' : insights.trend === 'baja' ? 'negativa' : 'estable'}</span> en 2010-2025,
                                                            {insights.isPositive ? ' con un incremento de ' : ' con una disminución de '}
                                                            <span className="font-bold text-gray-900 dark:text-white">{insights.changePercent}%</span>
                                                            {' '}(de {insights.firstValue} a {insights.lastValue} {insights.unit}).
                                                            Mejor desempeño: <span className="font-bold text-gray-900 dark:text-white">{insights.maxYear}</span> con {insights.maxValue} {insights.unit}.
                                                            Menor: <span className="font-bold text-gray-900 dark:text-white">{insights.minYear}</span> con {insights.minValue} {insights.unit}.
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </motion.div>

                                    {/* Top 5 Jugadores - 1/3 del espacio */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                        className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        {/* Header */}
                                        <div className="mb-4">
                                            <div className="mb-3">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Top 5 Jugadores</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Máximos por métrica</p>
                                            </div>

                                            {/* Botones de Métricas */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setPlayerMetric('ppg')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'ppg'
                                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Puntos
                                                </button>
                                                <button
                                                    onClick={() => setPlayerMetric('apg')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'apg'
                                                        ? 'bg-[#002D62] text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Asistencias
                                                </button>
                                                <button
                                                    onClick={() => setPlayerMetric('rpg')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'rpg'
                                                        ? 'bg-gray-600 text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Rebotes
                                                </button>
                                                <button
                                                    onClick={() => setPlayerMetric('per')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'per'
                                                        ? 'bg-orange-600 text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    PER
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lista de jugadores */}
                                        {topPlayers && topPlayers.length > 0 ? (
                                            <div className="space-y-2.5">
                                                {topPlayers.slice(0, 5).map((player, index) => (
                                                    <div
                                                        key={player.player_id || index}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                                                    >
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                                                index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{player.player_name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{player.position || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-[#CE1126] dark:text-[#FF5252]">{formatNumber(player.metric_value, 1)}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{player.metric_name || 'Pts'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                                                <p className="text-sm text-gray-500">Cargando jugadores...</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Grid Secundario: Promedios de Liga */}
                                {
                                    leagueAverages && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.7 }}
                                            className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-300"
                                        >
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Promedios de Liga</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Comparativa general del sistema</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Card 1: Azul - Puntos */}
                                                <div className="rounded-2xl bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 overflow-hidden shadow-lg">
                                                    <div className="p-8 flex flex-col items-center justify-center">
                                                        <p className="text-lg font-bold text-[#002D62] dark:text-[#002D62] uppercase tracking-wider mb-3">Puntos</p>
                                                        <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">{formatNumber(leagueAverages.avg_points, 1)}</p>
                                                    </div>
                                                    <div className="h-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-100 dark:to-gray-50">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { value: leagueAverages.avg_points * 0.85 },
                                                                { value: leagueAverages.avg_points * 0.92 },
                                                                { value: leagueAverages.avg_points * 0.88 },
                                                                { value: leagueAverages.avg_points * 0.95 },
                                                                { value: leagueAverages.avg_points * 1.0 },
                                                                { value: leagueAverages.avg_points * 0.98 },
                                                                { value: leagueAverages.avg_points * 1.02 }
                                                            ]}>
                                                                <defs>
                                                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#002D62" stopOpacity={0.4} />
                                                                        <stop offset="100%" stopColor="#002D62" stopOpacity={0.05} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="value" stroke="#002D62" strokeWidth={2} fill="url(#colorBlue)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Card 2: Blanca - Asistencias */}
                                                <div className="rounded-2xl bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 overflow-hidden shadow-lg">
                                                    <div className="p-8 flex flex-col items-center justify-center">
                                                        <p className="text-lg font-bold text-gray-700 dark:text-gray-700 uppercase tracking-wider mb-3">Asistencias</p>
                                                        <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">{formatNumber(leagueAverages.avg_assists, 1)}</p>
                                                    </div>
                                                    <div className="h-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-100 dark:to-gray-50">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { value: leagueAverages.avg_assists * 0.88 },
                                                                { value: leagueAverages.avg_assists * 0.90 },
                                                                { value: leagueAverages.avg_assists * 0.95 },
                                                                { value: leagueAverages.avg_assists * 0.92 },
                                                                { value: leagueAverages.avg_assists * 1.0 },
                                                                { value: leagueAverages.avg_assists * 0.97 },
                                                                { value: leagueAverages.avg_assists * 1.01 }
                                                            ]}>
                                                                <defs>
                                                                    <linearGradient id="colorGray" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#6b7280" stopOpacity={0.3} />
                                                                        <stop offset="100%" stopColor="#6b7280" stopOpacity={0.05} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="value" stroke="#6b7280" strokeWidth={2} fill="url(#colorGray)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Card 3: Roja - Rebotes */}
                                                <div className="rounded-2xl bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 overflow-hidden shadow-lg">
                                                    <div className="p-8 flex flex-col items-center justify-center">
                                                        <p className="text-lg font-bold text-[#CE1126] dark:text-[#CE1126] uppercase tracking-wider mb-3">Rebotes</p>
                                                        <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">{formatNumber(leagueAverages.avg_rebounds, 1)}</p>
                                                    </div>
                                                    <div className="h-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-100 dark:to-gray-50">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { value: leagueAverages.avg_rebounds * 0.86 },
                                                                { value: leagueAverages.avg_rebounds * 0.93 },
                                                                { value: leagueAverages.avg_rebounds * 0.89 },
                                                                { value: leagueAverages.avg_rebounds * 0.96 },
                                                                { value: leagueAverages.avg_rebounds * 1.0 },
                                                                { value: leagueAverages.avg_rebounds * 0.94 },
                                                                { value: leagueAverages.avg_rebounds * 1.03 }
                                                            ]}>
                                                                <defs>
                                                                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#CE1126" stopOpacity={0.4} />
                                                                        <stop offset="100%" stopColor="#CE1126" stopOpacity={0.05} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="value" stroke="#CE1126" strokeWidth={2} fill="url(#colorRed)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                }
                            </>
                        )}

                        {/* Pestaña Jugadores */}
                        {activeTab === 'jugadores' && (
                            <>
                                {/* Selector de Métricas */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Análisis de Jugadores</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Selección Nacional RD {playersPeriod.start}-{playersPeriod.end}</p>
                                        </div>
                                        {/* Filtros de Período */}
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={playersPeriod.start}
                                                onChange={(e) => setPlayersPeriod({ ...playersPeriod, start: parseInt(e.target.value) })}
                                                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#CE1126] focus:border-transparent"
                                            >
                                                {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <span className="text-gray-500">-</span>
                                            <select
                                                value={playersPeriod.end}
                                                onChange={(e) => setPlayersPeriod({ ...playersPeriod, end: parseInt(e.target.value) })}
                                                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#CE1126] focus:border-transparent"
                                            >
                                                {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Tabs de Métricas */}
                                    <div className="flex flex-wrap gap-2">
                                        {['ppg', 'apg', 'rpg', 'spg', 'bpg', 'per', 'fg_pct'].map((metric) => {
                                            const config = getMetricConfig(metric);
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={metric}
                                                    onClick={() => setSelectedPlayerMetric(metric)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${selectedPlayerMetric === metric
                                                        ? 'shadow-lg scale-105'
                                                        : 'hover:scale-105'
                                                        }`}
                                                    style={{
                                                        backgroundColor: selectedPlayerMetric === metric ? config.color : 'transparent',
                                                        color: selectedPlayerMetric === metric ? 'white' : config.color,
                                                        border: `2px solid ${config.color}`
                                                    }}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span>{config.unit}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Grid: Top 10 + Gráfico Comparativo */}
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    {/* Top 10 Jugadores */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="mb-6">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Top 10 Jugadores</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{getMetricConfig(selectedPlayerMetric).label}</p>
                                        </div>

                                        {loadingPlayers ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                                                <p className="text-sm text-gray-500">Cargando jugadores...</p>
                                            </div>
                                        ) : topPlayersData.length > 0 ? (
                                            <div className="space-y-3">
                                                {topPlayersData.map((player, index) => {
                                                    const config = getMetricConfig(selectedPlayerMetric);
                                                    return (
                                                        <motion.div
                                                            key={player.player_id || index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            onClick={() => loadPlayerDetails(player)}
                                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border-2 border-yellow-400' :
                                                                index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/10 border-2 border-gray-400' :
                                                                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border-2 border-orange-400' :
                                                                        'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                                                }`}
                                                        >
                                                            {/* Ranking Badge */}
                                                            <div
                                                                className={`flex items-center justify-center w-10 h-10 rounded-lg font-black text-base ${index === 0 ? 'bg-yellow-500 text-white shadow-lg' :
                                                                    index === 1 ? 'bg-gray-400 text-white shadow-lg' :
                                                                        index === 2 ? 'bg-orange-500 text-white shadow-lg' :
                                                                            'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600'
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </div>

                                                            {/* Avatar con iniciales */}
                                                            <div
                                                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md"
                                                                style={{ backgroundColor: config.color }}
                                                            >
                                                                {player.player_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'N/A'}
                                                            </div>

                                                            {/* Nombre y Posición */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                                                    {player.player_name || 'Jugador Desconocido'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {player.position || 'N/A'} • {player.games_played || 0} juegos
                                                                </p>
                                                            </div>

                                                            {/* Valor de Métrica */}
                                                            <div className="text-right">
                                                                <p className="text-xl font-black" style={{ color: config.color }}>
                                                                    {formatMetricValue(player.metric_value, selectedPlayerMetric)}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {config.unit}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500">No hay datos disponibles</p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Gráfico Comparativo */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="lg:col-span-3 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="mb-6">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Comparativa Visual</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Rendimiento relativo de los top jugadores</p>
                                        </div>

                                        {loadingPlayers ? (
                                            <div className="flex items-center justify-center h-96">
                                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                                            </div>
                                        ) : topPlayersData.length > 0 ? (
                                            <div style={{ width: '100%', height: '420px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={topPlayersData.slice(0, 10)}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} horizontal={false} />
                                                        <XAxis
                                                            type="number"
                                                            stroke="#6b7280"
                                                            style={{ fontSize: '12px' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="player_name"
                                                            stroke="#6b7280"
                                                            style={{ fontSize: '11px' }}
                                                            tickLine={false}
                                                            width={90}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                fontSize: '12px'
                                                            }}
                                                            formatter={(value) => [formatMetricValue(value, selectedPlayerMetric), getMetricConfig(selectedPlayerMetric).label]}
                                                        />
                                                        <Bar
                                                            dataKey="metric_value"
                                                            fill={getMetricConfig(selectedPlayerMetric).color}
                                                            radius={[0, 8, 8, 0]}
                                                            animationDuration={800}
                                                        >
                                                            {topPlayersData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        index === 0 ? '#EAB308' :
                                                                            index === 1 ? '#9CA3AF' :
                                                                                index === 2 ? '#F97316' :
                                                                                    getMetricConfig(selectedPlayerMetric).color
                                                                    }
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-96">
                                                <p className="text-sm text-gray-500">No hay datos para mostrar</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Estadísticas Contextuales */}
                                {leagueAvg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="mb-6">
                                            <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">Contexto Estadístico</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Promedios históricos de la liga ({playersPeriod.start}-{playersPeriod.end})</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Puntos */}
                                            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#CE1126]/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="w-5 h-5 text-[#CE1126]" />
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Puntos</p>
                                                </div>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{leagueAvg.avg_points?.toFixed(1) || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 mt-1">PPG promedio</p>
                                            </div>

                                            {/* Asistencias */}
                                            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-[#002D62]/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Users className="w-5 h-5 text-[#002D62]" />
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Asistencias</p>
                                                </div>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{leagueAvg.avg_assists?.toFixed(1) || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 mt-1">APG promedio</p>
                                            </div>

                                            {/* Rebotes */}
                                            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-500/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="w-5 h-5 text-gray-600" />
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Rebotes</p>
                                                </div>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{leagueAvg.avg_rebounds?.toFixed(1) || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 mt-1">RPG promedio</p>
                                            </div>

                                            {/* Partidos Analizados */}
                                            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-500/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Award className="w-5 h-5 text-blue-600" />
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Partidos</p>
                                                </div>
                                                <p className="text-3xl font-black text-gray-900 dark:text-white">{leagueAvg.total_games || 0}</p>
                                                <p className="text-xs text-gray-500 mt-1">Analizados</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModernAnalytics;

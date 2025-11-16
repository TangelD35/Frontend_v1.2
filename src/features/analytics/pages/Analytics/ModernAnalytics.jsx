import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Target,
    Users,
    RefreshCw,
    TrendingUp,
    Trophy,
    Shield
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts';

import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { teamsService } from '../../../../shared/api/endpoints/teams';
import LoadingSpinner from '../../../../shared/ui/components/common/feedback/LoadingSpinner';
import ErrorState from '../../../../shared/ui/components/modern/ErrorState/ErrorState';

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

    const [trendMetric, setTrendMetric] = useState('puntos');
    const [rdTeamId, setRdTeamId] = useState(null);

    // Cargar datos al montar el componente
    useEffect(() => {
        const loadData = async () => {
            try {
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

                // Cargar top jugadores
                await fetchTopPlayers('ppg', 5, 2010, 2025);

            } catch (error) {
                console.error('Error cargando datos de analytics:', error);
            }
        };

        loadData();
    }, [fetchTeamTrends, fetchTopPlayers]);

    // Helper para formatear números
    const formatNumber = (value, decimals = 0) => {
        if (value == null || isNaN(value)) return '0';
        return Number(value).toFixed(decimals);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <main className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-10">
                {advancedLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="large" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Hero Section - República Dominicana */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-6 shadow-2xl"
                        >
                            {/* Pattern Background */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)' }}></div>
                            </div>

                            {/* Content */}
                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                                            <Shield className="w-10 h-10 text-white" />
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

                                {/* KPIs del último período */}
                                {teamTrends && teamTrends.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Puntos */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 rounded-lg bg-white/20">
                                                    <Target className="w-4 h-4 text-white" />
                                                </div>
                                                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Puntos</p>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{formatNumber(teamTrends[teamTrends.length - 1].avg_points, 1)}</p>
                                            <p className="text-white/60 text-xs">PPG • Promedio</p>
                                        </motion.div>

                                        {/* Asistencias */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 rounded-lg bg-white/20">
                                                    <Users className="w-4 h-4 text-white" />
                                                </div>
                                                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Asistencias</p>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{formatNumber(teamTrends[teamTrends.length - 1].avg_assists, 1)}</p>
                                            <p className="text-white/60 text-xs">APG • Promedio</p>
                                        </motion.div>

                                        {/* Rebotes */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 rounded-lg bg-white/20">
                                                    <BarChart3 className="w-4 h-4 text-white" />
                                                </div>
                                                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Rebotes</p>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">{formatNumber(teamTrends[teamTrends.length - 1].avg_rebounds, 1)}</p>
                                            <p className="text-white/60 text-xs">RPG • Promedio</p>
                                        </motion.div>

                                        {/* % Victorias */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-1.5 rounded-lg bg-white/20">
                                                    <Trophy className="w-4 h-4 text-white" />
                                                </div>
                                                <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Victorias</p>
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-1">
                                                {teamTrends[teamTrends.length - 1].wins && teamTrends[teamTrends.length - 1].total_games
                                                    ? formatNumber((teamTrends[teamTrends.length - 1].wins / teamTrends[teamTrends.length - 1].total_games) * 100, 1)
                                                    : '0.0'
                                                }%
                                            </p>
                                            <p className="text-white/60 text-xs">
                                                {teamTrends[teamTrends.length - 1].wins || 0}W - {teamTrends[teamTrends.length - 1].losses || 0}L
                                            </p>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-8 h-8 text-white/50 animate-spin mr-3" />
                                        <p className="text-white/70">Cargando estadísticas del equipo...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

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
                                                    periodo: period.periodo,
                                                    puntos: period.avg_points,
                                                    asistencias: period.avg_assists,
                                                    rebotes: period.avg_rebounds
                                                }))}
                                                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                                                <XAxis
                                                    dataKey="periodo"
                                                    stroke="#6b7280"
                                                    style={{ fontSize: '12px' }}
                                                    tickLine={false}
                                                />
                                                <YAxis
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
                            </motion.div>

                            {/* Top 5 Jugadores - 1/3 del espacio */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                            >
                                {/* Header */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Top 5 Jugadores</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Mejores del sistema</p>
                                </div>

                                {/* Lista de jugadores */}
                                {topPlayers && topPlayers.length > 0 ? (
                                    <div className="space-y-3">
                                        {topPlayers.slice(0, 5).map((player, index) => (
                                            <div
                                                key={player.player_id || index}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700"
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
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                                        <p className="text-sm text-gray-500">Cargando jugadores...</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Grid Secundario: Promedios de Liga */}
                        {leagueAverages && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                            >
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Promedios de Liga</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Comparativa general del sistema</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Puntos */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 border border-red-200 dark:border-red-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">Puntos Promedio</p>
                                        </div>
                                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatNumber(leagueAverages.avg_points, 1)}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">PPG</p>
                                    </div>

                                    {/* Asistencias */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">Asistencias Promedio</p>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(leagueAverages.avg_assists, 1)}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">APG</p>
                                    </div>

                                    {/* Rebotes */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/20 dark:to-gray-600/10 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">Rebotes Promedio</p>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{formatNumber(leagueAverages.avg_rebounds, 1)}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">RPG</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModernAnalytics;
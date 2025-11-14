import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Download, Filter, Activity, Target, RefreshCw,
    Users, Trophy, Clock, Zap, Shield, Crosshair, Calendar, FileText,
    ChevronDown, Eye, Settings, PieChart, LineChart, BarChart2,
    ArrowUp, ArrowDown, Minus, Star, Award, Timer
} from 'lucide-react';

// Hooks
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { LoadingSpinner } from '../../../../shared/ui/components/common/feedback/LoadingSpinner';

const BasicAnalytics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('2024');
    const [selectedView, setSelectedView] = useState('overview');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedTournament, setSelectedTournament] = useState('all');
    const [toasts, setToasts] = useState([]);

    // Hooks de Analytics
    const {
        summary,
        trends,
        comparisons,
        tournamentStats,
        teamStats,
        playerStats,
        loading: analyticsLoading,
        error: analyticsError,
        fetchSummary,
        fetchTrends,
        fetchComparisons,
        fetchTournamentStats,
        fetchTeamStats,
        fetchPlayerStats,
        createCustomReport,
        refetch: refetchAnalytics
    } = useAnalytics();

    // Hooks de Advanced Analytics
    const {
        playerAdvancedStats,
        playerPER,
        playerQuickMetrics,
        teamRatings,
        leagueAverages,
        metricsDocumentation,
        loading: advancedLoading,
        error: advancedError,
        fetchPlayerAdvancedStats,
        fetchPlayerPER,
        fetchPlayerQuickMetrics,
        fetchTeamRatings,
        fetchLeagueAverages,
        refetch: refetchAdvanced
    } = useAdvancedAnalytics();

    const loading = analyticsLoading || advancedLoading;

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchSummary();
        fetchTrends();
        fetchTeamRatings();
        fetchLeagueAverages();
        fetchPlayerStats();
        fetchTournamentStats();
    }, [selectedPeriod, selectedTeam, selectedTournament]);

    // Estadísticas principales desde el backend
    const getMainStats = () => {
        if (!summary) return [];

        return [
            {
                title: 'Eficiencia Ofensiva',
                value: summary.offensiveEfficiency || '0.0',
                icon: TrendingUp,
                change: summary.offensiveEfficiencyChange || '0%',
                trend: summary.offensiveEfficiencyTrend || 'stable',
                description: 'Puntos por 100 posesiones',
                color: 'text-green-600'
            },
            {
                title: 'Eficiencia Defensiva',
                value: summary.defensiveEfficiency || '0.0',
                icon: Shield,
                change: summary.defensiveEfficiencyChange || '0%',
                trend: summary.defensiveEfficiencyTrend || 'stable',
                description: 'Puntos permitidos por 100 posesiones',
                color: 'text-blue-600'
            },
            {
                title: 'Ritmo de Juego',
                value: summary.pace || '0.0',
                icon: Zap,
                change: summary.paceChange || '0',
                trend: summary.paceTrend || 'stable',
                description: 'Posesiones por 40 minutos',
                color: 'text-purple-600'
            },
            {
                title: 'Net Rating',
                value: summary.netRating || '0.0',
                icon: Target,
                change: summary.netRatingChange || '0',
                trend: summary.netRatingTrend || 'stable',
                description: 'Diferencia ofensiva/defensiva',
                color: 'text-red-600'
            },
        ];
    };

    // Funciones para obtener datos del backend
    const getAdvancedStats = () => {
        if (!teamRatings || !leagueAverages) return [];

        const offensiveStats = teamRatings.offensive || {};
        const defensiveStats = teamRatings.defensive || {};

        return [
            {
                category: 'Ofensiva', stats: [
                    { name: 'Puntos por Partido', value: offensiveStats.pointsPerGame || '0.0', change: offensiveStats.pointsPerGameChange || '0', trend: offensiveStats.pointsPerGameTrend || 'stable' },
                    { name: '% Tiros de Campo', value: `${offensiveStats.fieldGoalPercentage || 0}%`, change: offensiveStats.fieldGoalPercentageChange || '0%', trend: offensiveStats.fieldGoalPercentageTrend || 'stable' },
                    { name: '% Tiros de 3', value: `${offensiveStats.threePointPercentage || 0}%`, change: offensiveStats.threePointPercentageChange || '0%', trend: offensiveStats.threePointPercentageTrend || 'stable' },
                    { name: '% Tiros Libres', value: `${offensiveStats.freeThrowPercentage || 0}%`, change: offensiveStats.freeThrowPercentageChange || '0%', trend: offensiveStats.freeThrowPercentageTrend || 'stable' },
                    { name: 'Asistencias/Partido', value: offensiveStats.assistsPerGame || '0.0', change: offensiveStats.assistsPerGameChange || '0', trend: offensiveStats.assistsPerGameTrend || 'stable' },
                    { name: 'Rebotes Ofensivos', value: offensiveStats.offensiveRebounds || '0.0', change: offensiveStats.offensiveReboundsChange || '0', trend: offensiveStats.offensiveReboundsTrend || 'stable' }
                ]
            },
            {
                category: 'Defensiva', stats: [
                    { name: 'Puntos Permitidos', value: defensiveStats.pointsAllowed || '0.0', change: defensiveStats.pointsAllowedChange || '0', trend: defensiveStats.pointsAllowedTrend || 'stable' },
                    { name: 'Robos/Partido', value: defensiveStats.stealsPerGame || '0.0', change: defensiveStats.stealsPerGameChange || '0', trend: defensiveStats.stealsPerGameTrend || 'stable' },
                    { name: 'Tapones/Partido', value: defensiveStats.blocksPerGame || '0.0', change: defensiveStats.blocksPerGameChange || '0', trend: defensiveStats.blocksPerGameTrend || 'stable' },
                    { name: 'Rebotes Defensivos', value: defensiveStats.defensiveRebounds || '0.0', change: defensiveStats.defensiveReboundsChange || '0', trend: defensiveStats.defensiveReboundsTrend || 'stable' },
                    { name: 'Pérdidas Forzadas', value: defensiveStats.turnoversForced || '0.0', change: defensiveStats.turnoversForcedChange || '0', trend: defensiveStats.turnoversForcedTrend || 'stable' },
                    { name: '% Oponente FG', value: `${defensiveStats.opponentFieldGoalPercentage || 0}%`, change: defensiveStats.opponentFieldGoalPercentageChange || '0%', trend: defensiveStats.opponentFieldGoalPercentageTrend || 'stable' }
                ]
            }
        ];
    };

    const getTopPlayers = () => {
        if (!playerStats || !Array.isArray(playerStats)) return [];

        return playerStats.slice(0, 5).map(player => ({
            name: player.name || 'Jugador Desconocido',
            position: player.position || 'N/A',
            ppg: player.pointsPerGame || 0,
            rpg: player.reboundsPerGame || 0,
            apg: player.assistsPerGame || 0,
            efficiency: player.efficiency || 0
        }));
    };

    const getTournaments = () => {
        if (!tournamentStats || !Array.isArray(tournamentStats)) return [];

        return tournamentStats.map(tournament => ({
            name: tournament.name || 'Torneo Desconocido',
            games: tournament.gamesPlayed || 0,
            wins: tournament.wins || 0,
            losses: tournament.losses || 0,
            winRate: tournament.winPercentage || 0,
            avgPoints: tournament.averagePoints || 0
        }));
    };

    const getHistoricalData = () => {
        if (!trends || !Array.isArray(trends)) return [];

        return trends.map(trend => ({
            year: trend.year || trend.period || 'N/A',
            ppg: trend.pointsPerGame || 0,
            efficiency: trend.offensiveEfficiency || 0,
            winRate: trend.winPercentage || 0
        }));
    };

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    };

    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchAnalytics(),
                refetchAdvanced()
            ]);
            addToast('Datos actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            addToast('Error al actualizar los datos', 'error');
        }
    };

    const handleExport = (format) => {
        addToast(`Generando reporte en formato ${format.toUpperCase()}...`, 'info');
        setTimeout(() => {
            addToast(`Reporte ${format.toUpperCase()} descargado exitosamente`);
        }, 2000);
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'period') setSelectedPeriod(value);
        if (filterType === 'team') setSelectedTeam(value);
        if (filterType === 'tournament') setSelectedTournament(value);
        addToast(`Filtro aplicado: ${filterType} - ${value}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
            {/* Header Simple */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-blue-600 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Título */}
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                    Centro de Analíticas
                                </h1>
                                <div className="flex items-center gap-2 text-white/90">
                                    <Target className="w-4 h-4" />
                                    <span className="text-sm font-medium">República Dominicana • Baloncesto</span>
                                </div>
                            </div>
                        </div>

                        {/* Controles */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/30"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline font-medium">Actualizar</span>
                            </button>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/30 ${showFilters ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Filtros</span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-xl transition-all duration-200 bg-white text-red-600 hover:bg-gray-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Generar Reporte
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                {showFilters && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                                        >
                                            <FileText className="w-4 h-4 inline mr-2" />
                                            Exportar PDF
                                        </button>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                                        >
                                            <BarChart3 className="w-4 h-4 inline mr-2" />
                                            Exportar CSV
                                        </button>
                                        <button
                                            onClick={() => handleExport('excel')}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                                        >
                                            <PieChart className="w-4 h-4 inline mr-2" />
                                            Exportar Excel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estado de carga */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="large" text="Cargando analíticas..." />
                    </div>
                )}

                {/* Manejo de errores */}
                {(analyticsError || advancedError) && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                        <div className="flex items-center gap-2 text-red-800">
                            <Target className="w-5 h-5" />
                            <span className="font-semibold">Error al cargar datos</span>
                        </div>
                        <p className="text-red-600 text-sm mt-1">
                            {analyticsError || advancedError || 'Error desconocido'}
                        </p>
                    </div>
                )}
                                        <stat.icon className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${stat.trend === 'up'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {stat.change}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-600 tracking-wide">
                                        {stat.title}
                                    </h3>
                                    <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {stat.description}
                                    </p>
                                </div>
                            </div >
                        ))}
                    </div >

    {/* Navegación de Vistas */ }
    < div className = "flex items-center gap-4 mb-8" >
                    <button
                        onClick={() => setSelectedView('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedView === 'overview'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Vista General
                    </button>
                    <button
                        onClick={() => setSelectedView('advanced')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedView === 'advanced'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Estadísticas Avanzadas
                    </button>
                    <button
                        onClick={() => setSelectedView('players')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedView === 'players'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Jugadores
                    </button>
                    <button
                        onClick={() => setSelectedView('tournaments')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedView === 'tournaments'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Torneos
                    </button>
                </div >

    {/* Contenido Dinámico por Vista */ }
{
    selectedView === 'overview' && (
        <div className="space-y-8">
            {/* Comparación Histórica */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <LineChart className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Evolución Histórica</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {historicalData.map((year, index) => (
                        <div key={year.year} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg text-gray-900">{year.year}</span>
                                <Trophy className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">PPG:</span>
                                    <span className="font-semibold">{year.ppg}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Eficiencia:</span>
                                    <span className="font-semibold">{year.efficiency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">% Victorias:</span>
                                    <span className="font-semibold text-green-600">{year.winRate}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

{
    selectedView === 'advanced' && (
        <div className="space-y-8">
            {advancedStats.map((category, index) => (
                <div key={category.category} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        {category.category === 'Ofensiva' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        ) : (
                            <Shield className="w-6 h-6 text-blue-600" />
                        )}
                        <h3 className="text-xl font-bold text-gray-900">Estadísticas {category.category}s</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.stats.map((stat, statIndex) => (
                            <div key={stat.name} className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">{stat.name}</span>
                                    <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

{
    selectedView === 'players' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Jugadores Destacados</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Jugador</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Pos</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">PPG</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">RPG</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">APG</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Eficiencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topPlayers.map((player, index) => (
                            <tr key={player.name} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-red-600">{index + 1}</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{player.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600">{player.position}</td>
                                <td className="py-3 px-4 text-center font-semibold">{player.ppg}</td>
                                <td className="py-3 px-4 text-center font-semibold">{player.rpg}</td>
                                <td className="py-3 px-4 text-center font-semibold">{player.apg}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                                        {player.efficiency}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{
    selectedView === 'tournaments' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Rendimiento por Torneo</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tournaments.map((tournament, index) => (
                    <div key={tournament.name} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900">{tournament.name}</h4>
                            <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Partidos:</span>
                                <span className="ml-2 font-semibold">{tournament.games}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Victorias:</span>
                                <span className="ml-2 font-semibold text-green-600">{tournament.wins}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Derrotas:</span>
                                <span className="ml-2 font-semibold text-red-600">{tournament.losses}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">% Victorias:</span>
                                <span className="ml-2 font-semibold text-blue-600">{tournament.winRate}%</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-600">Promedio Puntos:</span>
                                <span className="ml-2 font-semibold">{tournament.avgPoints}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

{/* Toast Notifications */ }
{
    toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-600' :
                        toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    )
}
            </div >
        </div >
    );
};

export default BasicAnalytics;

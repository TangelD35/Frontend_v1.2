import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Download, Filter, Activity, Target, RefreshCw,
    Users, Trophy, Clock, Zap, Shield, Crosshair, Calendar, FileText,
    ChevronDown, Eye, Settings, PieChart, LineChart, BarChart2,
    ArrowUp, ArrowDown, Minus, Star, Award, Timer
} from 'lucide-react';

const BasicAnalytics = () => {
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('2024');
    const [selectedView, setSelectedView] = useState('overview');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedTournament, setSelectedTournament] = useState('all');
    const [toasts, setToasts] = useState([]);

    // Estadísticas principales
    const mainStats = [
        {
            title: 'Eficiencia Ofensiva',
            value: '112.4',
            icon: TrendingUp,
            change: '+5.2%',
            trend: 'up',
            description: 'Puntos por 100 posesiones',
            color: 'text-green-600'
        },
        {
            title: 'Eficiencia Defensiva',
            value: '98.7',
            icon: Shield,
            change: '-3.1%',
            trend: 'up',
            description: 'Puntos permitidos por 100 posesiones',
            color: 'text-blue-600'
        },
        {
            title: 'Ritmo de Juego',
            value: '96.2',
            icon: Zap,
            change: '+2.4',
            trend: 'up',
            description: 'Posesiones por 40 minutos',
            color: 'text-purple-600'
        },
        {
            title: 'Net Rating',
            value: '+13.7',
            icon: Target,
            change: '+8.5',
            trend: 'up',
            description: 'Diferencia ofensiva/defensiva',
            color: 'text-red-600'
        },
    ];

    // Estadísticas avanzadas
    const advancedStats = [
        {
            category: 'Ofensiva', stats: [
                { name: 'Puntos por Partido', value: '87.4', change: '+4.2', trend: 'up' },
                { name: '% Tiros de Campo', value: '46.8%', change: '+2.1%', trend: 'up' },
                { name: '% Tiros de 3', value: '35.2%', change: '-1.4%', trend: 'down' },
                { name: '% Tiros Libres', value: '78.5%', change: '+3.2%', trend: 'up' },
                { name: 'Asistencias/Partido', value: '21.6', change: '+3.1', trend: 'up' },
                { name: 'Rebotes Ofensivos', value: '12.4', change: '+0.5', trend: 'up' }
            ]
        },
        {
            category: 'Defensiva', stats: [
                { name: 'Puntos Permitidos', value: '78.9', change: '-5.3', trend: 'up' },
                { name: 'Robos/Partido', value: '8.9', change: '+1.2', trend: 'up' },
                { name: 'Tapones/Partido', value: '4.3', change: '+0.3', trend: 'up' },
                { name: 'Rebotes Defensivos', value: '28.7', change: '+2.4', trend: 'up' },
                { name: 'Pérdidas Forzadas', value: '14.6', change: '+1.8', trend: 'up' },
                { name: '% Oponente FG', value: '42.1%', change: '-3.2%', trend: 'up' }
            ]
        }
    ];

    // Datos de jugadores destacados
    const topPlayers = [
        { name: 'Karl-Anthony Towns', position: 'C', ppg: 24.8, rpg: 11.2, apg: 3.1, efficiency: 118.5 },
        { name: 'Al Horford', position: 'PF/C', ppg: 18.4, rpg: 8.9, apg: 4.2, efficiency: 115.2 },
        { name: 'Chris Duarte', position: 'SG', ppg: 16.7, rpg: 4.1, apg: 3.8, efficiency: 112.8 },
        { name: 'Lester Quiñones', position: 'SF', ppg: 14.2, rpg: 5.3, apg: 2.9, efficiency: 108.9 },
        { name: 'Jean Montero', position: 'PG', ppg: 12.8, rpg: 3.2, apg: 7.4, efficiency: 106.3 }
    ];

    // Datos de torneos
    const tournaments = [
        { name: 'FIBA World Cup 2023', games: 8, wins: 6, losses: 2, winRate: 75.0, avgPoints: 89.2 },
        { name: 'FIBA AmeriCup 2022', games: 6, wins: 5, losses: 1, winRate: 83.3, avgPoints: 92.1 },
        { name: 'Olympic Qualifying 2024', games: 4, wins: 3, losses: 1, winRate: 75.0, avgPoints: 85.7 },
        { name: 'FIBA World Cup Qualifiers', games: 12, wins: 9, losses: 3, winRate: 75.0, avgPoints: 88.4 }
    ];

    // Comparación histórica
    const historicalData = [
        { year: '2020', ppg: 78.5, efficiency: 102.3, winRate: 52.3 },
        { year: '2021', ppg: 81.2, efficiency: 105.8, winRate: 55.8 },
        { year: '2022', ppg: 83.6, efficiency: 108.2, winRate: 64.2 },
        { year: '2023', ppg: 85.1, efficiency: 110.5, winRate: 68.7 },
        { year: '2024', ppg: 87.4, efficiency: 112.4, winRate: 72.7 }
    ];

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            addToast('Datos actualizados correctamente');
        }, 1500);
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
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {mainStats.map((stat, index) => (
                        <div
                            key={stat.title}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-red-100 to-blue-100 rounded-xl">
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
                        </div>
                    ))}
                </div>

                {/* Navegación de Vistas */}
                <div className="flex items-center gap-4 mb-8">
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
                </div>

                {/* Contenido Dinámico por Vista */}
                {selectedView === 'overview' && (
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
                )}

                {selectedView === 'advanced' && (
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
                )}

                {selectedView === 'players' && (
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
                )}

                {selectedView === 'tournaments' && (
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
                )}

                {/* Toast Notifications */}
                {toasts.length > 0 && (
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
                )}
            </div>
        </div>
    );
};

export default BasicAnalytics;

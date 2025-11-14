import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Activity, Target, RefreshCw } from 'lucide-react';

const BasicAnalytics = () => {
    const [loading, setLoading] = useState(false);

    // Estadísticas estáticas
    const stats = [
        {
            title: 'Eficiencia Ofensiva',
            value: '112.4',
            icon: TrendingUp,
            change: '+5.2%',
            trend: 'up',
            description: 'Puntos por 100 posesiones'
        },
        {
            title: 'Eficiencia Defensiva',
            value: '98.7',
            icon: Activity,
            change: '-3.1%',
            trend: 'up',
            description: 'Puntos permitidos por 100 posesiones'
        },
        {
            title: 'Ritmo de Juego',
            value: '96.2',
            icon: BarChart3,
            change: '+2.4',
            trend: 'up',
            description: 'Posesiones por 40 minutos'
        },
        {
            title: 'Net Rating',
            value: '+13.7',
            icon: Target,
            change: '+8.5',
            trend: 'up',
            description: 'Diferencia ofensiva/defensiva'
        },
    ];

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
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

                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/30">
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Filtros</span>
                            </button>

                            <button className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-xl transition-all duration-200 bg-white text-red-600 hover:bg-gray-50">
                                <Download className="w-4 h-4" />
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
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

                {/* Mensaje informativo */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Sistema de Analíticas Avanzadas
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Plataforma de análisis táctico y predictivo para la Selección Nacional de Baloncesto de República Dominicana
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span>• Período 2010-2025</span>
                        <span>• Torneos FIBA</span>
                        <span>• Análisis ML</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicAnalytics;

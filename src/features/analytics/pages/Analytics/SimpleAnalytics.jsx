import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Activity, Target, RefreshCw } from 'lucide-react';
import { RDScoreLogo } from '../../../../shared/ui/components/common/layout/RDScoreLogo';

const SimpleAnalytics = () => {
    const [loading, setLoading] = useState(false);

    // Estadísticas estáticas para evitar problemas de API
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
        <div className="min-h-screen bg-gradient-to-br from-[#CE1126]/5 via-white to-[#002D62]/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header Gubernamental Profesional */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-[#CE1126] via-[#CE1126]/95 to-[#002D62] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl">
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Identidad Institucional */}
                        <div className="flex items-center gap-6">
                            <RDScoreLogo size={64} className="flex-shrink-0" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                        Centro de Analíticas
                                    </h1>
                                    <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                                        <Activity className="w-4 h-4 text-white/80" />
                                        <span className="text-xs font-semibold text-white/90 tracking-wide">AVANZADO</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-white/90">
                                    <Target className="w-4 h-4" />
                                    <span className="text-sm font-medium">Análisis Táctico y Predictivo • República Dominicana</span>
                                </div>
                            </div>
                        </div>

                        {/* Controles de Acción */}
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
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/30"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Filtros</span>
                            </button>

                            <button
                                className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-xl transition-all duration-200 border bg-gradient-to-r from-white to-white/90 hover:from-white/90 hover:to-white text-[#CE1126] border-white/50"
                            >
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
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10 rounded-xl">
                                    <stat.icon className="w-6 h-6 text-[#CE1126]" />
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${stat.trend === 'up'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {stat.change}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide">
                                    {stat.title}
                                </h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stat.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mensaje informativo */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 dark:border-gray-700/50 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Sistema de Analíticas Avanzadas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Plataforma de análisis táctico y predictivo para la Selección Nacional de Baloncesto de República Dominicana
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>• Período 2010-2025</span>
                        <span>• Torneos FIBA</span>
                        <span>• Análisis ML</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleAnalytics;

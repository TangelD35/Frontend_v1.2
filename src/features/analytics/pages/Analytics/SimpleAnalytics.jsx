import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Activity, Target, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../../shared/ui/components/common';

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 space-y-4">
            {/* Header */}
            <PageHeader
                title="Centro de Analíticas"
                subtitle="Análisis Táctico y Predictivo • República Dominicana"
                action={
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#CE1126] hover:bg-[#002D62] text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline font-medium">Actualizar</span>
                    </button>
                }
            />

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.title}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10 rounded-lg">
                                    <stat.icon className="w-5 h-5 text-[#CE1126]" />
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${stat.trend === 'up'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {stat.change}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    {stat.title}
                                </h3>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {stat.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mensaje informativo */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                    <div className="flex items-center justify-center mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Sistema de Analíticas Avanzadas
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Plataforma de análisis táctico y predictivo para la Selección Nacional de Baloncesto de República Dominicana
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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

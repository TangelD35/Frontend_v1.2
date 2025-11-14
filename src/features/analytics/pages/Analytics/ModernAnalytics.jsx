import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, Download, Filter, Activity, Target,
    Calendar, Users, ChevronDown, Eye, RefreshCw, Settings,
    Trophy, Zap, PieChart, LineChart, BarChart2, Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useFilters from '../../../../shared/hooks/useFilters';

// Components
import { ModernModal } from '../../../../shared/ui/components/modern/ModernModal';
import { StatusIndicator } from '../../../../shared/ui/components/common/feedback/StatusIndicator';
import { LoadingSpinner } from '../../../../shared/ui/components/common/feedback/LoadingSpinner';
import ErrorState from '../../../../shared/ui/components/modern/ErrorState/ErrorState';
// RDScoreLogo component doesn't exist, will use icon instead

const ModernAnalytics = () => {
    const navigate = useNavigate();

    // Hooks
    const {
        summary,
        trends,
        comparisons,
        loading: analyticsLoading,
        error: analyticsError,
        fetchSummary,
        fetchTrends,
        fetchComparisons,
        createCustomReport,
        refetch: refetchAnalytics
    } = useAnalytics();

    const {
        teamRatings,
        leagueAverages,
        metricsDocumentation,
        loading: advancedLoading,
        error: advancedError,
        fetchTeamRatings,
        fetchLeagueAverages,
        refetch: refetchAdvanced
    } = useAdvancedAnalytics();

    // Removed unused hooks

    // Estados locales
    const [selectedPeriod, setSelectedPeriod] = useState('2024');
    const [selectedMetric, setSelectedMetric] = useState('offensive');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Filtros
    const {
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters
    } = useFilters({
        period: '2024',
        metric: 'all',
        team: '',
        tournament: ''
    });

    // Validación de formularios
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAndSubmit,
        reset,
        setFieldValue
    } = useFormValidation({
        reportName: '',
        startDate: '',
        endDate: '',
        metrics: [],
        teams: [],
        description: ''
    }, {});

    // Detectar tamaño de pantalla
    useEffect(() => {
        const checkSidebarState = () => {
            const isLargeScreen = window.innerWidth >= 1024;
            setIsSidebarOpen(isLargeScreen);
        };

        checkSidebarState();
        window.addEventListener('resize', checkSidebarState);
        return () => window.removeEventListener('resize', checkSidebarState);
    }, []);

    // Estadísticas principales basadas en summary
    const mainStats = summary ? [
        {
            title: 'Eficiencia Ofensiva',
            value: summary.offensive_rating || '112.4',
            icon: TrendingUp,
            change: '+5.2%',
            trend: 'up',
            description: 'Puntos por 100 posesiones'
        },
        {
            title: 'Eficiencia Defensiva',
            value: summary.defensive_rating || '98.7',
            icon: Activity,
            change: '-3.1%',
            trend: 'up',
            description: 'Puntos permitidos por 100 posesiones'
        },
        {
            title: 'Ritmo de Juego',
            value: summary.pace || '96.2',
            icon: BarChart3,
            change: '+2.4',
            trend: 'up',
            description: 'Posesiones por 40 minutos'
        },
        {
            title: 'Net Rating',
            value: summary.net_rating || '+13.7',
            icon: Target,
            change: '+8.5',
            trend: 'up',
            description: 'Diferencia ofensiva/defensiva'
        },
    ] : [];

    // Función para mostrar toasts
    const showToast = (type, title, message) => {
        const id = Date.now();
        const newToast = {
            id,
            type,
            title,
            message,
            duration: 5000
        };
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Manejar actualización de datos
    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchAnalytics(),
                refetchAdvanced()
            ]);
            showToast(
                'success',
                'Datos actualizados',
                'La información de analíticas ha sido actualizada correctamente.'
            );
        } catch (error) {
            showToast(
                'error',
                'Error al actualizar',
                'No se pudieron actualizar los datos. Verifica tu conexión e inténtalo de nuevo.'
            );
        }
    };

    // Abrir modales
    const openFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const closeFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const openReportModal = () => {
        reset();
        setIsReportModalOpen(true);
    };

    const closeReportModal = () => {
        setIsReportModalOpen(false);
        reset();
    };

    // Manejar creación de reporte personalizado
    const onSubmitReport = async (formData) => {
        try {
            const reportConfig = {
                name: formData.reportName,
                start_date: formData.startDate,
                end_date: formData.endDate,
                metrics: formData.metrics,
                teams: formData.teams,
                description: formData.description
            };

            const report = await createCustomReport(reportConfig);

            // Descargar reporte
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte-${formData.reportName.replace(/\s+/g, '-').toLowerCase()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast(
                'success',
                'Reporte creado',
                'El reporte personalizado ha sido generado y descargado correctamente.'
            );

            closeReportModal();
        } catch (error) {
            showToast(
                'error',
                'Error al crear reporte',
                error.message || 'No se pudo crear el reporte personalizado.'
            );
        }
    };

    const loading = analyticsLoading || advancedLoading;

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
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
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
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/30"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline font-medium">Actualizar</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openFilterModal}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 border border-white/30"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Filtros</span>
                                {hasActiveFilters && (
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openReportModal}
                                className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-xl transition-all duration-200 border bg-gradient-to-r from-white to-white/90 hover:from-white/90 hover:to-white text-[#CE1126] border-white/50"
                            >
                                <Download className="w-4 h-4" />
                                Generar Reporte
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner size="large" />
                    </div>
                ) : (
                    <>
                        {/* Estadísticas Principales */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        >
                            {mainStats.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
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
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Sección de Métricas Avanzadas */}
                        {teamRatings && teamRatings.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 mb-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl">
                                            <Calculator className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Métricas Avanzadas
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Análisis estadístico profundo del rendimiento
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {teamRatings.map((rating, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                        {rating.metric_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {rating.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                                {rating.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Estado vacío si no hay datos */}
                        {!summary && !loading && (
                            <ErrorState
                                title="No hay datos de analíticas disponibles"
                                message="Los datos de analíticas se cargarán automáticamente cuando estén disponibles."
                                onRetry={handleRefresh}
                                showRetry={true}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Modal de Filtros */}
            <ModernModal
                isOpen={isFilterModalOpen}
                onClose={closeFilterModal}
                title="Filtros Avanzados"
                size="md"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Período de Análisis
                        </label>
                        <select
                            value={filters.period}
                            onChange={(e) => updateFilters({ period: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200"
                        >
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="all">Todos los períodos</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Métrica
                        </label>
                        <select
                            value={filters.metric}
                            onChange={(e) => updateFilters({ metric: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200"
                        >
                            <option value="all">Todas las métricas</option>
                            <option value="offensive">Ofensivas</option>
                            <option value="defensive">Defensivas</option>
                            <option value="advanced">Avanzadas</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={clearFilters}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200"
                        >
                            Limpiar Filtros
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={closeFilterModal}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] hover:from-[#a00e1e] hover:to-[#001a4d] text-white rounded-xl font-medium transition-all duration-200"
                        >
                            Aplicar Filtros
                        </motion.button>
                    </div>
                </div>
            </ModernModal>

            {/* Modal de Reporte Personalizado */}
            <ModernModal
                isOpen={isReportModalOpen}
                onClose={closeReportModal}
                title="Generar Reporte Personalizado"
                size="lg"
            >
                <form onSubmit={validateAndSubmit(onSubmitReport)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Nombre del Reporte *
                            </label>
                            <input
                                type="text"
                                name="reportName"
                                value={values.reportName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200"
                                placeholder="Ej: Análisis Mensual Enero 2024"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Fecha de Inicio *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={values.startDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 resize-none"
                            placeholder="Describe el propósito y alcance del reporte..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={closeReportModal}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200"
                        >
                            Cancelar
                        </motion.button>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] hover:from-[#a00e1e] hover:to-[#001a4d] text-white rounded-xl font-medium transition-all duration-200"
                        >
                            Generar Reporte
                        </motion.button>
                    </div>
                </form>
            </ModernModal>

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className={`p-4 rounded-xl shadow-lg backdrop-blur-sm border max-w-sm ${toast.type === 'success'
                            ? 'bg-green-50/90 border-green-200 text-green-800'
                            : toast.type === 'error'
                                ? 'bg-red-50/90 border-red-200 text-red-800'
                                : 'bg-blue-50/90 border-blue-200 text-blue-800'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{toast.title}</h4>
                                <p className="text-sm opacity-90">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-current opacity-50 hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ModernAnalytics;

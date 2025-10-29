import { BarChart3, TrendingUp, Download, Filter, Activity, Target, Plus, Calendar, Users, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import { analyticsSchema } from '../../../../lib/validations/schemas';
import {
    SectionHeader,
    ActionButton,
    Badge,
    StatsGrid,
    Chart,
    Table,
    Select,
    Modal,
    Input,
    Textarea,
    Toast
} from '../../../../shared/ui/components/common';

const Analytics = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('2020-2025');
    const [selectedMetric, setSelectedMetric] = useState('offensive');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [exportLoading, setExportLoading] = useState(false);
    const [customReportLoading, setCustomReportLoading] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Hook de validación para reportes personalizados
    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit: validateAndSubmit,
        reset,
        setFieldValue
    } = useFormValidation({
        reportName: '',
        startDate: '',
        endDate: '',
        metrics: [],
        teams: [],
        description: ''
    }, analyticsSchema);

    // Datos estáticos
    const stats = [
        { title: 'Eficiencia Ofensiva', value: '112.4', icon: TrendingUp, change: '+5.2%', trend: 'up' },
        { title: 'Eficiencia Defensiva', value: '98.7', icon: Activity, change: '-3.1%', trend: 'up' },
        { title: 'Ritmo de Juego', value: '96.2', icon: BarChart3, change: '+2.4', trend: 'up' },
        { title: 'Victorias Proyectadas', value: '68%', icon: Target, change: '+8%', trend: 'up' },
    ];

    const periods = [
        { id: '2024-2025', label: '2024-2025' },
        { id: '2023-2024', label: '2023-2024' },
        { id: '2020-2025', label: '2010-2025 (Completo)' },
    ];

    // Datos para gráficos
    const pointsPerGameData = [
        { name: '2020', value: 78.5 },
        { name: '2021', value: 81.2 },
        { name: '2022', value: 83.6 },
        { name: '2023', value: 85.1 },
        { name: '2024', value: 87.4 },
    ];

    const efficiencyData = [
        { name: '2020', offensive: 102.3, defensive: 105.2 },
        { name: '2021', offensive: 105.8, defensive: 103.1 },
        { name: '2022', offensive: 108.2, defensive: 101.5 },
        { name: '2023', offensive: 110.5, defensive: 99.8 },
        { name: '2024', offensive: 112.4, defensive: 98.7 },
    ];

    const shootingData = [
        { name: 'Tiros de Campo', value: 46.8 },
        { name: 'Tiros de 3', value: 35.2 },
        { name: 'Tiros Libres', value: 78.5 },
    ];

    const offensiveMetrics = [
        {
            category: 'Anotación', metrics: [
                { name: 'Puntos por Partido', value: '87.4', trend: 'up', change: '+4.2' },
                { name: '% Tiros de Campo', value: '46.8%', trend: 'up', change: '+2.1%' },
                { name: '% Tiros de 3', value: '35.2%', trend: 'down', change: '-1.4%' },
                { name: '% Tiros Libres', value: '78.5%', trend: 'up', change: '+3.2%' },
            ]
        },
        {
            category: 'Distribución', metrics: [
                { name: 'Asistencias/Partido', value: '21.6', trend: 'up', change: '+3.1' },
                { name: 'Relación Ast/TO', value: '1.8', trend: 'up', change: '+0.3' },
                { name: 'Segundas Oportunidades', value: '12.4', trend: 'stable', change: '+0.5' },
                { name: 'Puntos en Transición', value: '18.7', trend: 'up', change: '+2.3' },
            ]
        },
    ];

    const defensiveMetrics = [
        {
            category: 'Presión Defensiva', metrics: [
                { name: 'Robos/Partido', value: '8.9', trend: 'up', change: '+1.2' },
                { name: 'Tapones/Partido', value: '4.3', trend: 'stable', change: '+0.3' },
                { name: 'Pérdidas Forzadas', value: '14.6', trend: 'up', change: '+1.8' },
                { name: 'Deflexiones', value: '22.3', trend: 'up', change: '+3.2' },
            ]
        },
        {
            category: 'Control de Rebotes', metrics: [
                { name: 'Rebotes Defensivos', value: '28.7', trend: 'up', change: '+2.4' },
                { name: 'Rebotes Ofensivos Permitidos', value: '9.2', trend: 'down', change: '-1.5' },
                { name: '% Rebotes Totales', value: '52.8%', trend: 'up', change: '+3.1%' },
                { name: 'Segundas Oportunidades Permitidas', value: '8.9', trend: 'down', change: '-2.1' },
            ]
        },
    ];

    const advancedMetrics = [
        { name: 'Offensive Rating', value: 112.4, description: 'Puntos por 100 posesiones' },
        { name: 'Defensive Rating', value: 98.7, description: 'Puntos permitidos por 100 posesiones' },
        { name: 'Net Rating', value: 13.7, description: 'Diferencia Off/Def Rating' },
        { name: 'Pace', value: 96.2, description: 'Posesiones por 40 minutos' },
        { name: 'eFG%', value: 53.2, description: 'Porcentaje efectivo de tiro' },
        { name: 'TS%', value: 57.8, description: 'Porcentaje real de tiro' },
    ];

    const yearlyComparison = [
        { year: '2020', ppg: 78.5, efficiency: 102.3, winRate: 52.3 },
        { year: '2021', ppg: 81.2, efficiency: 105.8, winRate: 55.8 },
        { year: '2022', ppg: 83.6, efficiency: 108.2, winRate: 54.2 },
        { year: '2023', ppg: 85.1, efficiency: 110.5, winRate: 58.7 },
        { year: '2024', ppg: 87.4, efficiency: 112.4, winRate: 57.7 },
    ];

    const comparisonColumns = [
        { key: 'year', label: 'Año' },
        {
            key: 'ppg',
            label: 'PPG',
            render: (value) => <span className="font-semibold">{value}</span>
        },
        {
            key: 'efficiency',
            label: 'Eficiencia Ofensiva',
            render: (value) => <span className="font-semibold text-green-600">{value}</span>
        },
        {
            key: 'winRate',
            label: '% Victorias',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{value}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                </div>
            )
        },
    ];

    // Funciones auxiliares para exportación
    const convertToCSV = (data) => {
        const headers = ['Métrica', 'Valor', 'Período', 'Tendencia'];
        const rows = [];

        data.datos.estadisticas.forEach(stat => {
            rows.push([
                stat.title,
                stat.value,
                data.periodo,
                stat.trend
            ]);
        });

        data.datos.comparacionAnual.forEach(item => {
            rows.push([
                `PPG ${item.year}`,
                item.ppg,
                data.periodo,
                'historical'
            ]);
            rows.push([
                `Eficiencia ${item.year}`,
                item.efficiency,
                data.periodo,
                'historical'
            ]);
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const generatePDFContent = (data) => {
        return `
            REPORTE DE ANALÍTICAS - ${data.periodo}
            Generado: ${new Date(data.generadoEn).toLocaleDateString('es-ES')}
            
            ESTADÍSTICAS PRINCIPALES:
            ${data.datos.estadisticas.map(stat =>
            `${stat.title}: ${stat.value} (${stat.change})`
        ).join('\n')}
            
            MÉTRICAS AVANZADAS:
            ${data.datos.metricasAvanzadas.map(metric =>
            `${metric.name}: ${metric.value} - ${metric.description}`
        ).join('\n')}
        `;
    };

    const generateCustomReportData = (formData) => {
        const startYear = new Date(formData.startDate).getFullYear();
        const endYear = new Date(formData.endDate).getFullYear();

        const filteredYearlyData = yearlyComparison.filter(item => {
            const year = parseInt(item.year);
            return year >= startYear && year <= endYear;
        });

        const filteredEfficiencyData = efficiencyData.filter(item => {
            const year = parseInt(item.name);
            return year >= startYear && year <= endYear;
        });

        return {
            periodo: `${startYear}-${endYear}`,
            comparacionAnual: filteredYearlyData,
            eficiencia: filteredEfficiencyData,
            metricasIncluidas: formData.metrics,
            equipos: formData.teams
        };
    };

    // Funciones principales
    const getCurrentMetrics = () => {
        return selectedMetric === 'offensive' ? offensiveMetrics : defensiveMetrics;
    };

    const handleExport = async (format = 'csv') => {
        setExportLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const exportData = {
                periodo: selectedPeriod,
                metricas: selectedMetric,
                datos: {
                    estadisticas: stats,
                    comparacionAnual: yearlyComparison,
                    metricasAvanzadas: advancedMetrics,
                    evolucionPuntos: pointsPerGameData,
                    eficiencia: efficiencyData
                },
                generadoEn: new Date().toISOString()
            };

            let blob, filename, mimeType;

            switch (format) {
                case 'csv':
                    const csvContent = convertToCSV(exportData);
                    blob = new Blob([csvContent], { type: 'text/csv' });
                    filename = `reporte-analiticas-${selectedPeriod}.csv`;
                    mimeType = 'text/csv';
                    break;

                case 'json':
                    const jsonContent = JSON.stringify(exportData, null, 2);
                    blob = new Blob([jsonContent], { type: 'application/json' });
                    filename = `reporte-analiticas-${selectedPeriod}.json`;
                    mimeType = 'application/json';
                    break;

                case 'pdf':
                    const pdfContent = generatePDFContent(exportData);
                    blob = new Blob([pdfContent], { type: 'application/pdf' });
                    filename = `reporte-analiticas-${selectedPeriod}.pdf`;
                    mimeType = 'application/pdf';
                    break;

                default:
                    throw new Error('Formato no soportado');
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setToast({
                isVisible: true,
                type: 'success',
                message: `Reporte exportado en formato ${format.toUpperCase()}`
            });

        } catch (error) {
            console.error('Error al exportar:', error);
            setToast({
                isVisible: true,
                type: 'error',
                message: `Error al exportar el reporte: ${error.message}`
            });
        } finally {
            setExportLoading(false);
            setShowExportMenu(false);
        }
    };

    const handleCustomReportSubmit = async (formData) => {
        setCustomReportLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const customReport = {
                nombre: formData.reportName,
                periodo: `${formData.startDate} a ${formData.endDate}`,
                metricasSeleccionadas: formData.metrics,
                equiposAnalizados: formData.teams,
                descripcion: formData.description,
                datos: generateCustomReportData(formData),
                configuracion: {
                    fechaGeneracion: new Date().toISOString(),
                    modelo: 'Analytics v2.1'
                }
            };

            const jsonContent = JSON.stringify(customReport, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const filename = `reporte-personalizado-${formData.reportName.replace(/\s+/g, '-').toLowerCase()}.json`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setToast({
                isVisible: true,
                type: 'success',
                message: 'Reporte personalizado creado y descargado correctamente'
            });

            setIsCustomReportModalOpen(false);
            reset();

        } catch (error) {
            console.error('Error al crear reporte personalizado:', error);
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al crear el reporte personalizado'
            });
        } finally {
            setCustomReportLoading(false);
        }
    };

    const openCustomReportModal = () => {
        reset();
        setIsCustomReportModalOpen(true);
    };

    const closeCustomReportModal = () => {
        setIsCustomReportModalOpen(false);
        reset();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20 dark:from-gray-900 dark:via-orange-900/10 dark:to-red-900/10 transition-all duration-500 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/50">
                <SectionHeader
                    title="Analíticas Avanzadas"
                    description="Métricas y tendencias del equipo nacional dominicano"
                    icon={BarChart3}
                    action={
                        <div className="flex gap-3">
                            <ActionButton
                                variant="secondary"
                                icon={Filter}
                                onClick={() => setIsModalOpen(true)}
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Filtros
                            </ActionButton>
                            <ActionButton
                                variant="secondary"
                                icon={Plus}
                                onClick={openCustomReportModal}
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Reporte Personalizado
                            </ActionButton>
                            <div className="relative">
                                <ActionButton
                                    variant="primary"
                                    icon={exportLoading ? null : Download}
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={exportLoading}
                                    className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    {exportLoading ? 'Exportando...' : (
                                        <>
                                            Exportar
                                            <ChevronDown className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </ActionButton>

                                {showExportMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-gray-700/50 z-10 overflow-hidden">
                                        <button
                                            onClick={() => handleExport('csv')}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors duration-200 first:rounded-t-xl"
                                        >
                                            📊 Exportar CSV
                                        </button>
                                        <button
                                            onClick={() => handleExport('json')}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors duration-200"
                                        >
                                            📝 Exportar JSON
                                        </button>
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-colors duration-200 last:rounded-b-xl"
                                        >
                                            📄 Exportar PDF
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Estadísticas principales */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 dark:border-gray-700/30">
                <StatsGrid
                    stats={stats.map(stat => ({
                        ...stat,
                        description: stat.title === 'Eficiencia Ofensiva' ? 'Puntos por 100 posesiones' :
                            stat.title === 'Eficiencia Defensiva' ? 'Puntos permitidos por 100 posesiones' :
                                stat.title === 'Ritmo de Juego' ? 'Posesiones por 40 minutos' :
                                    'Probabilidad de victoria'
                    }))}
                    className="mb-0"
                />
            </div>

            {/* Controles de período */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 mb-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Período de Análisis</h3>
                    <div className="flex gap-2">
                        {periods.map((period) => (
                            <button
                                key={period.id}
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === period.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Chart
                    type="line"
                    data={pointsPerGameData}
                    xKey="name"
                    yKey="value"
                    title="Evolución de Puntos por Partido"
                    height={300}
                />
                <Chart
                    type="bar"
                    data={shootingData}
                    xKey="name"
                    yKey="value"
                    title="Porcentajes de Tiro"
                    height={300}
                />
            </div>

            {/* Gráfico de eficiencia comparativa */}
            <div className="mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Eficiencia Ofensiva vs Defensiva</h3>
                    <div className="h-80">
                        <Chart
                            type="line"
                            data={efficiencyData.map(item => ({
                                name: item.name,
                                'Eficiencia Ofensiva': item.offensive,
                                'Eficiencia Defensiva': item.defensive
                            }))}
                            xKey="name"
                            yKey="Eficiencia Ofensiva"
                            height={320}
                            colors={['#10B981', '#3B82F6']}
                        />
                    </div>
                </div>
            </div>

            {/* Selector de métricas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => setSelectedMetric('offensive')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${selectedMetric === 'offensive'
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                            }`}
                    >
                        <h4 className="font-bold text-gray-800 mb-1">Métricas Ofensivas</h4>
                        <p className="text-sm text-gray-600">Análisis de capacidad anotadora</p>
                    </button>
                    <button
                        onClick={() => setSelectedMetric('defensive')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${selectedMetric === 'defensive'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                            }`}
                    >
                        <h4 className="font-bold text-gray-800 mb-1">Métricas Defensivas</h4>
                        <p className="text-sm text-gray-600">Análisis de capacidad defensiva</p>
                    </button>
                </div>
            </div>

            {/* Métricas detalladas */}
            <div className="space-y-6 mb-6">
                {getCurrentMetrics().map((category, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedMetric === 'offensive' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />
                            {category.category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {category.metrics.map((metric, metricIndex) => (
                                <div
                                    key={metricIndex}
                                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-sm text-gray-600">{metric.name}</span>
                                        <Badge
                                            variant={
                                                metric.trend === 'up' ? 'success' :
                                                    metric.trend === 'down' ? 'danger' : 'default'
                                            }
                                            size="small"
                                        >
                                            {metric.change}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-gray-800">{metric.value}</span>
                                        {metric.trend === 'up' && (
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        )}
                                        {metric.trend === 'down' && (
                                            <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Métricas avanzadas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Métricas Avanzadas (Advanced Stats)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {advancedMetrics.map((metric, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">{metric.name}</h4>
                                    <p className="text-xs text-gray-600">{metric.description}</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-700">{metric.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabla de comparación anual */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Comparación por Año</h3>
                <Table
                    columns={comparisonColumns}
                    data={yearlyComparison}
                    sortable
                />
            </div>

            {/* Insights y recomendaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Fortalezas Principales
                    </h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5" />
                            <span>Eficiencia ofensiva superior al promedio regional (+12.4 puntos)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5" />
                            <span>Excelente distribución del balón (21.6 asistencias/partido)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt=1.5" />
                            <span>Dominio en el rebote defensivo (28.7 por partido)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                    <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Áreas de Mejora
                    </h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5" />
                            <span>Porcentaje de triples por debajo del objetivo (35.2% vs 37% ideal)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5" />
                            <span>Defensa perimetral requiere atención especial</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-1.5" />
                            <span>Reducir pérdidas de balón en momentos críticos</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Modal de filtros */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Filtros Avanzados"
            >
                <div className="space-y-4">
                    <Select
                        label="Período de Análisis"
                        name="period"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        options={periods.map(p => ({ value: p.id, label: p.label }))}
                    />
                    <Select
                        label="Tipo de Métrica"
                        name="metric"
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        options={[
                            { value: 'offensive', label: 'Ofensivas' },
                            { value: 'defensive', label: 'Defensivas' },
                            { value: 'all', label: 'Todas' }
                        ]}
                    />
                    <div className="flex gap-3 justify-end pt-4">
                        <ActionButton variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </ActionButton>
                        <ActionButton variant="primary" onClick={() => setIsModalOpen(false)}>
                            Aplicar Filtros
                        </ActionButton>
                    </div>
                </div>
            </Modal>

            {/* Modal de Reporte Personalizado */}
            <Modal
                isOpen={isCustomReportModalOpen}
                onClose={closeCustomReportModal}
                title="Crear Reporte Personalizado"
                size="large"
            >
                <form onSubmit={validateAndSubmit(handleCustomReportSubmit)} className="space-y-4">
                    <Input
                        label="Nombre del Reporte"
                        name="reportName"
                        value={values.reportName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.reportName && errors.reportName}
                        placeholder="Análisis Ofensivo Temporada 2024"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Fecha de Inicio"
                            name="startDate"
                            type="date"
                            value={values.startDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.startDate && errors.startDate}
                            icon={Calendar}
                            required
                        />
                        <Input
                            label="Fecha de Fin"
                            name="endDate"
                            type="date"
                            value={values.endDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.endDate && errors.endDate}
                            icon={Calendar}
                            required
                        />
                    </div>

                    {errors.endDate && typeof errors.endDate === 'string' && errors.endDate.includes('posterior') && (
                        <div className="text-red-500 text-sm -mt-2 mb-2">{errors.endDate}</div>
                    )}

                    <Select
                        label="Métricas a Incluir"
                        name="metrics"
                        value={values.metrics}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.metrics && errors.metrics}
                        multiple
                        options={[
                            { value: 'offensive', label: 'Métricas Ofensivas' },
                            { value: 'defensive', label: 'Métricas Defensivas' },
                            { value: 'advanced', label: 'Métricas Avanzadas' },
                            { value: 'shooting', label: 'Estadísticas de Tiro' },
                            { value: 'player', label: 'Métricas por Jugador' }
                        ]}
                        required
                    />

                    <Select
                        label="Equipos a Analizar"
                        name="teams"
                        value={values.teams}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.teams && errors.teams}
                        multiple
                        icon={Users}
                        options={[
                            { value: 'dominican-republic', label: 'República Dominicana' },
                            { value: 'usa', label: 'Estados Unidos' },
                            { value: 'spain', label: 'España' },
                            { value: 'argentina', label: 'Argentina' },
                            { value: 'puerto-rico', label: 'Puerto Rico' }
                        ]}
                        required
                    />

                    <Textarea
                        label="Descripción del Reporte"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.description && errors.description}
                        rows={3}
                        placeholder="Objetivos y alcance del análisis..."
                    />

                    <div className="flex gap-3 justify-end pt-4">
                        <ActionButton
                            variant="secondary"
                            type="button"
                            onClick={closeCustomReportModal}
                            disabled={customReportLoading}
                        >
                            Cancelar
                        </ActionButton>
                        <ActionButton
                            variant="primary"
                            type="submit"
                            disabled={customReportLoading}
                        >
                            {customReportLoading ? 'Generando Reporte...' : 'Crear Reporte'}
                        </ActionButton>
                    </div>
                </form>
            </Modal>

            <Toast
                type={toast.type}
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
};

export default Analytics;
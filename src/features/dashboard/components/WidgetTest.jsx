import { useState } from 'react';
import {
    WidgetContainer,
    StatsWidget,
    AdvancedFiltersWidget,
    ExportWidget
} from '../../../shared/ui/components/common/widgets';

const WidgetTest = () => {
    const [selectedWidget, setSelectedWidget] = useState('stats');

    // Datos de prueba
    const testData = {
        kpi: [
            { name: 'Partidos Jugados', value: 24, trend: 5 },
            { name: 'Victorias', value: 18, trend: 12 },
            { name: 'Promedio Puntos', value: 89.5, trend: -2 },
            { name: 'Eficiencia', value: 75, trend: 8 }
        ],
        bar: [
            { name: 'Juan Pérez', value: 22.5 },
            { name: 'Carlos López', value: 18.3 },
            { name: 'Miguel Rodríguez', value: 16.8 },
            { name: 'Antonio García', value: 15.2 },
            { name: 'Luis Martínez', value: 12.7 }
        ],
        line: [
            { name: 'Ene', value: 85 },
            { name: 'Feb', value: 88 },
            { name: 'Mar', value: 92 },
            { name: 'Abr', value: 89 },
            { name: 'May', value: 94 },
            { name: 'Jun', value: 91 }
        ],
        pie: [
            { name: 'Victorias', value: 18 },
            { name: 'Derrotas', value: 6 },
            { name: 'Empates', value: 0 }
        ]
    };

    const widgets = [
        { id: 'stats', label: 'Widget de Estadísticas', component: 'stats' },
        { id: 'filters', label: 'Widget de Filtros', component: 'filters' },
        { id: 'export', label: 'Widget de Exportación', component: 'export' }
    ];

    const renderSelectedWidget = () => {
        switch (selectedWidget) {
            case 'stats':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <WidgetContainer
                            id="kpi-test"
                            title="KPI Widget"
                            style={{ position: 'relative', width: '100%', height: '400px' }}
                        >
                            <StatsWidget
                                type="kpi"
                                data={testData.kpi}
                                title="Indicadores Clave"
                            />
                        </WidgetContainer>

                        <WidgetContainer
                            id="bar-test"
                            title="Bar Chart Widget"
                            style={{ position: 'relative', width: '100%', height: '400px' }}
                        >
                            <StatsWidget
                                type="bar"
                                data={testData.bar}
                                title="Estadísticas de Jugadores"
                            />
                        </WidgetContainer>

                        <WidgetContainer
                            id="line-test"
                            title="Line Chart Widget"
                            style={{ position: 'relative', width: '100%', height: '400px' }}
                        >
                            <StatsWidget
                                type="line"
                                data={testData.line}
                                title="Rendimiento Mensual"
                            />
                        </WidgetContainer>

                        <WidgetContainer
                            id="pie-test"
                            title="Pie Chart Widget"
                            style={{ position: 'relative', width: '100%', height: '400px' }}
                        >
                            <StatsWidget
                                type="pie"
                                data={testData.pie}
                                title="Distribución de Resultados"
                            />
                        </WidgetContainer>
                    </div>
                );

            case 'filters':
                return (
                    <div className="max-w-md mx-auto">
                        <WidgetContainer
                            id="filters-test"
                            title="Filtros Avanzados"
                            style={{ position: 'relative', width: '100%', height: '600px' }}
                        >
                            <AdvancedFiltersWidget
                                onFiltersChange={(filters) => console.log('Filtros:', filters)}
                                availableTeams={[
                                    { id: 1, name: 'Selección Nacional' },
                                    { id: 2, name: 'Equipo Juvenil' },
                                    { id: 3, name: 'Equipo Sub-21' }
                                ]}
                                availablePlayers={[
                                    { id: 1, name: 'Juan Pérez' },
                                    { id: 2, name: 'Carlos López' },
                                    { id: 3, name: 'Miguel Rodríguez' },
                                    { id: 4, name: 'Antonio García' },
                                    { id: 5, name: 'Luis Martínez' }
                                ]}
                                availableSeasons={[
                                    { id: 1, name: '2024' },
                                    { id: 2, name: '2023' },
                                    { id: 3, name: '2022' }
                                ]}
                            />
                        </WidgetContainer>
                    </div>
                );

            case 'export':
                return (
                    <div className="max-w-md mx-auto">
                        <WidgetContainer
                            id="export-test"
                            title="Exportar Reportes"
                            style={{ position: 'relative', width: '100%', height: '500px' }}
                        >
                            <ExportWidget
                                data={Object.values(testData).flat()}
                                onExport={(format, options) => {
                                    console.log('Exportando:', format, options);
                                    alert(`Exportando en formato ${format}`);
                                }}
                            />
                        </WidgetContainer>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Prueba de Widgets
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Prueba individual de cada widget implementado
                    </p>
                </div>
            </div>

            {/* Widget Selector */}
            <div className="flex gap-2 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {widgets.map(widget => (
                    <button
                        key={widget.id}
                        onClick={() => setSelectedWidget(widget.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedWidget === widget.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {widget.label}
                    </button>
                ))}
            </div>

            {/* Widget Content */}
            <div className="flex-1 overflow-auto p-6">
                {renderSelectedWidget()}
            </div>
        </div>
    );
};

export default WidgetTest;
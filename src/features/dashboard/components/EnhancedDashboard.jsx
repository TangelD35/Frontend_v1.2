import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
    Plus,
    Settings,
    RotateCcw,
    Grid,
    Eye,
    EyeOff,
    Wifi,
    WifiOff,
    ChevronDown
} from 'lucide-react';
import {
    WidgetContainer,
    StatsWidget,
    AdvancedFiltersWidget,
    ExportWidget
} from '../../../shared/ui/components/common/widgets';
import { useRealTimeStats, useAlerts } from '../../../shared/hooks/useWebSocket';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';

const EnhancedDashboard = memo(() => {
    const dashboardRef = useRef(null);
    const addMenuRef = useRef(null);
    const [widgets, setWidgets] = useLocalStorage('dashboard-widgets', [
        {
            id: 'stats-overview',
            type: 'stats',
            title: 'Resumen de Estadísticas',
            position: { x: 20, y: 20 },
            size: { width: 400, height: 300 },
            config: { type: 'kpi', realTime: true },
            visible: true
        },
        {
            id: 'team-performance',
            type: 'stats',
            title: 'Rendimiento del Equipo',
            position: { x: 440, y: 20 },
            size: { width: 400, height: 300 },
            config: { type: 'line', realTime: true },
            visible: true
        },
        {
            id: 'player-stats',
            type: 'stats',
            title: 'Estadísticas de Jugadores',
            position: { x: 20, y: 340 },
            size: { width: 400, height: 300 },
            config: { type: 'bar', realTime: false },
            visible: true
        },
        {
            id: 'filters',
            type: 'filters',
            title: 'Filtros Avanzados',
            position: { x: 860, y: 20 },
            size: { width: 350, height: 500 },
            config: {},
            visible: true
        },
        {
            id: 'export',
            type: 'export',
            title: 'Exportar Reportes',
            position: { x: 440, y: 340 },
            size: { width: 400, height: 300 },
            config: {},
            visible: true
        }
    ]);

    const [dashboardSettings, setDashboardSettings] = useLocalStorage('dashboard-settings', {
        autoSave: true,
        gridSnap: true,
        realTimeUpdates: true,
        theme: 'light',
        refreshInterval: 5000
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [availableWidgets] = useState([
        { type: 'stats', label: 'Gráfico de Estadísticas', icon: '📊' },
        { type: 'filters', label: 'Filtros Avanzados', icon: '🔍' },
        { type: 'export', label: 'Exportar Reportes', icon: '📤' },
        { type: 'alerts', label: 'Alertas en Tiempo Real', icon: '🔔' },
        { type: 'calendar', label: 'Calendario de Juegos', icon: '📅' },
        { type: 'leaderboard', label: 'Tabla de Posiciones', icon: '🏆' }
    ]);

    const toggleAddMenu = useCallback(() => {
        setIsAddMenuOpen(prev => !prev);
    }, []);

    useEffect(() => {
        if (!isAddMenuOpen) return undefined;

        const handleClickOutside = (event) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
                setIsAddMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsAddMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isAddMenuOpen]);

    // Hooks para datos en tiempo real
    const { stats, isConnected } = useRealTimeStats();
    const { alerts } = useAlerts();

    // Datos simulados para los widgets
    const [widgetData, setWidgetData] = useState({
        'stats-overview': [
            { name: 'Partidos Jugados', value: 24, trend: 5 },
            { name: 'Victorias', value: 18, trend: 12 },
            { name: 'Promedio Puntos', value: 89.5, trend: -2 },
            { name: 'Eficiencia', value: 75, trend: 8 }
        ],
        'team-performance': [
            { name: 'Ene', value: 85 },
            { name: 'Feb', value: 88 },
            { name: 'Mar', value: 92 },
            { name: 'Abr', value: 89 },
            { name: 'May', value: 94 },
            { name: 'Jun', value: 91 }
        ],
        'player-stats': [
            { name: 'Juan Pérez', value: 22.5 },
            { name: 'Carlos López', value: 18.3 },
            { name: 'Miguel Rodríguez', value: 16.8 },
            { name: 'Antonio García', value: 15.2 },
            { name: 'Luis Martínez', value: 12.7 }
        ]
    });

    // Actualizar datos con información en tiempo real
    useEffect(() => {
        if (stats && dashboardSettings.realTimeUpdates) {
            setWidgetData(prev => ({
                ...prev,
                ...stats
            }));
        }
    }, [stats, dashboardSettings.realTimeUpdates]);

    // Auto-guardar configuración
    useEffect(() => {
        if (dashboardSettings.autoSave) {
            const saveTimeout = setTimeout(() => {
                localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
            }, 1000);
            return () => clearTimeout(saveTimeout);
        }
    }, [widgets, dashboardSettings.autoSave]);

    const handleWidgetUpdate = useCallback((widgetId, updates) => {
        setWidgets(prev => prev.map(widget =>
            widget.id === widgetId ? { ...widget, ...updates } : widget
        ));
    }, [setWidgets]);

    const handleWidgetRemove = useCallback((widgetId) => {
        setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    }, [setWidgets]);

    const handleWidgetAdd = useCallback((widgetType) => {
        const newWidget = {
            id: `${widgetType}-${Date.now()}`,
            type: widgetType,
            title: availableWidgets.find(w => w.type === widgetType)?.label || 'Nuevo Widget',
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 },
            config: {},
            visible: true
        };
        setWidgets(prev => [...prev, newWidget]);
        setIsAddMenuOpen(false);
    }, [availableWidgets, setWidgets]);

    const handleFiltersChange = useCallback((filters) => {
        console.log('Filters changed:', filters);
    }, []);

    const handleExport = useCallback((format, options) => {
        console.log('Exporting dashboard:', format, options);
    }, []);

    const resetDashboard = useCallback(() => {
        if (window.confirm('¿Estás seguro de que quieres restablecer el dashboard a su configuración por defecto?')) {
            localStorage.removeItem('dashboard-widgets');
            window.location.reload();
        }
    }, []);

    const toggleWidgetVisibility = useCallback((widgetId) => {
        handleWidgetUpdate(widgetId, {
            visible: !widgets.find(w => w.id === widgetId)?.visible
        });
    }, [widgets, handleWidgetUpdate]);

    const visibleWidgets = useMemo(() => widgets.filter(widget => widget.visible), [widgets]);

    const getGridClasses = useCallback((width, height) => {
        const colClass = width >= 900
            ? 'col-span-1 md:col-span-2 xl:col-span-3'
            : width >= 600
                ? 'col-span-1 md:col-span-2'
                : 'col-span-1';

        const rowSpan = Math.min(3, Math.max(1, Math.round(height / 280)));
        const rowClassMap = {
            1: 'row-span-1',
            2: 'row-span-2',
            3: 'row-span-3'
        };

        return `${colClass} ${rowClassMap[rowSpan]}`;
    }, []);

    const renderWidget = useCallback((widget) => {
        const width = widget.size?.width ?? 400;
        const height = widget.size?.height ?? 300;
        const gridClasses = getGridClasses(width, height);

        const commonProps = {
            id: widget.id,
            title: widget.title,
            onRemove: handleWidgetRemove,
            className: `${gridClasses} h-full min-h-[280px]`
        };

        switch (widget.type) {
            case 'stats':
                return (
                    <WidgetContainer key={widget.id} {...commonProps}>
                        <StatsWidget
                            type={widget.config.type || 'bar'}
                            data={widgetData[widget.id] || []}
                            title={widget.title}
                            config={widget.config}
                            realTime={widget.config.realTime && dashboardSettings.realTimeUpdates}
                            refreshInterval={dashboardSettings.refreshInterval}
                        />
                    </WidgetContainer>
                );

            case 'filters':
                return (
                    <WidgetContainer key={widget.id} {...commonProps}>
                        <AdvancedFiltersWidget
                            onFiltersChange={handleFiltersChange}
                            availableTeams={[
                                { id: 1, name: 'Selección Nacional' },
                                { id: 2, name: 'Equipo Juvenil' }
                            ]}
                            availablePlayers={[
                                { id: 1, name: 'Juan Pérez' },
                                { id: 2, name: 'Carlos López' }
                            ]}
                        />
                    </WidgetContainer>
                );

            case 'export':
                return (
                    <WidgetContainer key={widget.id} {...commonProps}>
                        <ExportWidget
                            data={Object.values(widgetData).flat()}
                            dashboardRef={dashboardRef}
                            onExport={handleExport}
                        />
                    </WidgetContainer>
                );

            default:
                return (
                    <WidgetContainer key={widget.id} {...commonProps}>
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Widget tipo "{widget.type}" no implementado
                        </div>
                    </WidgetContainer>
                );
        }
    }, [getGridClasses, handleWidgetRemove, widgetData, dashboardSettings, handleExport, dashboardRef]);

    return (
        <div className="relative h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />
                <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-purple-200/20 blur-3xl dark:bg-purple-500/10" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-white/60 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-5">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
                        Dashboard Avanzado
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow-sm ${isConnected
                            ? 'bg-green-100/80 dark:bg-green-500/15 text-green-700 dark:text-green-300'
                            : 'bg-red-100/80 dark:bg-red-500/15 text-red-700 dark:text-red-300'
                            }`}>
                            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </div>
                        {alerts.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-orange-100/80 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 shadow-sm">
                                <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                {alerts.length} alertas
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Widget Visibility Toggle */}
                    <div className="flex items-center gap-1 pr-4 mr-3 border-r border-white/60 dark:border-white/10">
                        {widgets.map(widget => (
                            <button
                                type="button"
                                key={widget.id}
                                onClick={() => toggleWidgetVisibility(widget.id)}
                                className={`inline-flex items-center justify-center h-9 w-9 rounded-full border text-sm font-medium transition-all duration-200 ${widget.visible
                                    ? 'bg-blue-500/10 border-blue-400/40 text-blue-600 dark:text-blue-300 shadow-sm'
                                    : 'bg-white/70 border-white/60 text-gray-400 dark:bg-gray-800/60 dark:border-white/10'
                                    } hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 active:translate-y-0`}
                                title={`${widget.visible ? 'Ocultar' : 'Mostrar'} ${widget.title}`}
                                aria-pressed={widget.visible}
                            >
                                {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>

                    {/* Add Widget Dropdown */}
                    <div ref={addMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={toggleAddMenu}
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 active:translate-y-0 ${isAddMenuOpen ? 'hover:shadow-xl -translate-y-0.5' : 'hover:-translate-y-0.5 hover:shadow-xl'}`}
                            aria-expanded={isAddMenuOpen}
                            aria-haspopup="menu"
                            aria-label="Agregar widget"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Widget
                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                                {availableWidgets.length}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div
                            className={`absolute right-0 top-full mt-3 w-72 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-white/80 dark:border-white/10 transition-all z-50 backdrop-blur ${isAddMenuOpen
                                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                                }`}
                            role="menu"
                        >
                            <div className="p-3 space-y-1">
                                {availableWidgets.map(widget => (
                                    <button
                                        key={widget.type}
                                        onClick={() => handleWidgetAdd(widget.type)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left hover:bg-blue-50/60 dark:hover:bg-gray-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
                                        type="button"
                                        role="menuitem"
                                    >
                                        <span className="text-xl">{widget.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{widget.label}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Clic para añadir</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isEditMode
                            ? 'bg-orange-100/80 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 shadow-sm'
                            : 'bg-white/70 border border-white/60 text-gray-600 dark:text-gray-300 hover:bg-white/90 hover:-translate-y-0.5'
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 active:translate-y-0`}
                    >
                        <Settings className="w-4 h-4" />
                        {isEditMode ? 'Salir de Edición' : 'Editar'}
                    </button>

                    <button
                        onClick={resetDashboard}
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-white/70 border border-white/60 text-gray-600 dark:text-gray-300 hover:bg-white/90 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 active:translate-y-0"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Restablecer
                    </button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div
                ref={dashboardRef}
                className="relative z-10 flex-1 overflow-auto px-6 py-6"
                style={{ minHeight: '600px' }}
            >
                {visibleWidgets.length > 0 ? (
                    <div className="grid gap-6 auto-rows-[minmax(280px,_1fr)] grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {visibleWidgets.map(renderWidget)}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center bg-white/70 dark:bg-gray-900/70 border border-white/60 dark:border-white/10 rounded-3xl px-10 py-12 shadow-xl backdrop-blur">
                            <Grid className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                No hay widgets visibles
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                                Agrega widgets para comenzar a visualizar tus datos
                            </p>
                            <button
                                onClick={() => handleWidgetAdd('stats')}
                                type="button"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 active:translate-y-0"
                            >
                                Agregar Primer Widget
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Settings Panel */}
            {isEditMode && (
                <div className="relative z-10 border-t border-white/60 dark:border-white/10 bg-white/80 dark:bg-gray-900/85 backdrop-blur px-6 py-5 shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Configuración del Dashboard
                        </h3>
                        <div className="flex flex-wrap items-center gap-5">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={dashboardSettings.autoSave}
                                    onChange={(e) => setDashboardSettings(prev => ({
                                        ...prev,
                                        autoSave: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Auto-guardar</span>
                            </label>

                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={dashboardSettings.realTimeUpdates}
                                    onChange={(e) => setDashboardSettings(prev => ({
                                        ...prev,
                                        realTimeUpdates: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Tiempo real</span>
                            </label>

                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <label>Intervalo:</label>
                                <select
                                    value={dashboardSettings.refreshInterval}
                                    onChange={(e) => setDashboardSettings(prev => ({
                                        ...prev,
                                        refreshInterval: parseInt(e.target.value)
                                    }))}
                                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/90 dark:bg-gray-800/80 text-gray-900 dark:text-white text-sm shadow-sm"
                                >
                                    <option value={1000}>1s</option>
                                    <option value={5000}>5s</option>
                                    <option value={10000}>10s</option>
                                    <option value={30000}>30s</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default EnhancedDashboard;
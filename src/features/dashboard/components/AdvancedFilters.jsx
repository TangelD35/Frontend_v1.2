import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Calendar, Users, Trophy, X, RotateCcw } from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActionButton } from '../../../shared/ui/components/common/actions';
import { Select, Input } from '../../../shared/ui/components/common/inputs';
import { Badge } from '../../../shared/ui/components/common/data-display';

const AdvancedFilters = ({ onFiltersChange, initialFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'last_month',
        startDate: '',
        endDate: '',
        teams: [],
        players: [],
        tournaments: [],
        metrics: [],
        ...initialFilters
    });

    const dateRangeOptions = [
        { value: 'today', label: 'Hoy' },
        { value: 'last_week', label: 'Última Semana' },
        { value: 'last_month', label: 'Último Mes' },
        { value: 'last_3_months', label: 'Últimos 3 Meses' },
        { value: 'last_year', label: 'Último Año' },
        { value: 'custom', label: 'Rango Personalizado' }
    ];

    const teamOptions = [
        { value: 'dominican-republic', label: 'República Dominicana' },
        { value: 'usa', label: 'Estados Unidos' },
        { value: 'spain', label: 'España' },
        { value: 'argentina', label: 'Argentina' },
        { value: 'puerto-rico', label: 'Puerto Rico' }
    ];

    const metricOptions = [
        { value: 'offensive', label: 'Métricas Ofensivas' },
        { value: 'defensive', label: 'Métricas Defensivas' },
        { value: 'advanced', label: 'Métricas Avanzadas' },
        { value: 'shooting', label: 'Estadísticas de Tiro' },
        { value: 'rebounding', label: 'Rebotes' }
    ];

    const tournamentOptions = [
        { value: 'fiba-americup', label: 'FIBA AmeriCup' },
        { value: 'world-cup', label: 'Copa Mundial FIBA' },
        { value: 'olympics', label: 'Juegos Olímpicos' },
        { value: 'friendly', label: 'Partidos Amistosos' }
    ];

    const getDateRange = (range) => {
        const now = new Date();
        switch (range) {
            case 'today':
                return { start: now, end: now };
            case 'last_week':
                return { start: subDays(now, 7), end: now };
            case 'last_month':
                return { start: subMonths(now, 1), end: now };
            case 'last_3_months':
                return { start: subMonths(now, 3), end: now };
            case 'last_year':
                return { start: subYears(now, 1), end: now };
            default:
                return null;
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };

        // Auto-set dates for predefined ranges
        if (key === 'dateRange' && value !== 'custom') {
            const dateRange = getDateRange(value);
            if (dateRange) {
                newFilters.startDate = format(dateRange.start, 'yyyy-MM-dd');
                newFilters.endDate = format(dateRange.end, 'yyyy-MM-dd');
            }
        }

        setFilters(newFilters);
        onFiltersChange?.(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            dateRange: 'last_month',
            startDate: '',
            endDate: '',
            teams: [],
            players: [],
            tournaments: [],
            metrics: []
        };
        setFilters(resetFilters);
        onFiltersChange?.(resetFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.teams.length > 0) count++;
        if (filters.players.length > 0) count++;
        if (filters.tournaments.length > 0) count++;
        if (filters.metrics.length > 0) count++;
        if (filters.dateRange !== 'last_month') count++;
        return count;
    };

    const activeCount = getActiveFiltersCount();

    return (
        <div className="relative">
            <ActionButton
                variant="secondary"
                icon={Filter}
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                Filtros Avanzados
                {activeCount > 0 && (
                    <Badge variant="primary" size="small" className="absolute -top-2 -right-2">
                        {activeCount}
                    </Badge>
                )}
            </ActionButton>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                    Filtros Avanzados
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleReset}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                        title="Resetear filtros"
                                    >
                                        <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Filters Content */}
                            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Rango de Fechas
                                    </label>
                                    <Select
                                        value={filters.dateRange}
                                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                        options={dateRangeOptions}
                                        className="mb-2"
                                    />

                                    {filters.dateRange === 'custom' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                placeholder="Fecha inicio"
                                            />
                                            <Input
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                placeholder="Fecha fin"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Teams */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Equipos
                                    </label>
                                    <Select
                                        value={filters.teams}
                                        onChange={(e) => handleFilterChange('teams', Array.from(e.target.selectedOptions, option => option.value))}
                                        options={teamOptions}
                                        multiple
                                    />
                                </div>

                                {/* Tournaments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Trophy className="w-4 h-4 inline mr-1" />
                                        Torneos
                                    </label>
                                    <Select
                                        value={filters.tournaments}
                                        onChange={(e) => handleFilterChange('tournaments', Array.from(e.target.selectedOptions, option => option.value))}
                                        options={tournamentOptions}
                                        multiple
                                    />
                                </div>

                                {/* Metrics */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Métricas
                                    </label>
                                    <Select
                                        value={filters.metrics}
                                        onChange={(e) => handleFilterChange('metrics', Array.from(e.target.selectedOptions, option => option.value))}
                                        options={metricOptions}
                                        multiple
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {activeCount > 0 ? `${activeCount} filtros activos` : 'Sin filtros activos'}
                                    </div>
                                    <ActionButton
                                        variant="primary"
                                        size="small"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Aplicar
                                    </ActionButton>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedFilters;
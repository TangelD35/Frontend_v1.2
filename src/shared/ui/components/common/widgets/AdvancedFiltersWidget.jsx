import { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    Shield,
    Filter,
    Search,
    ChevronDown,
    RotateCcw
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const AdvancedFiltersWidget = ({
    onFiltersChange,
    initialFilters = {},
    availableTeams = [],
    availablePlayers = [],
    availableSeasons = []
}) => {
    const [filters, setFilters] = useState({
        dateRange: {
            start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            end: format(new Date(), 'yyyy-MM-dd'),
            preset: 'last30days'
        },
        teams: [],
        players: [],
        season: '',
        gameType: 'all',
        venue: 'all',
        searchTerm: '',
        ...initialFilters
    });

    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Presets de fechas
    const datePresets = [
        { value: 'today', label: 'Hoy', days: 0 },
        { value: 'yesterday', label: 'Ayer', days: 1 },
        { value: 'last7days', label: 'Últimos 7 días', days: 7 },
        { value: 'last30days', label: 'Últimos 30 días', days: 30 },
        { value: 'thisMonth', label: 'Este mes', custom: true },
        { value: 'lastMonth', label: 'Mes pasado', custom: true },
        { value: 'custom', label: 'Personalizado', custom: true }
    ];

    const gameTypes = [
        { value: 'all', label: 'Todos los juegos' },
        { value: 'regular', label: 'Temporada regular' },
        { value: 'playoff', label: 'Playoffs' },
        { value: 'friendly', label: 'Amistosos' },
        { value: 'international', label: 'Internacionales' }
    ];

    const venues = [
        { value: 'all', label: 'Todas las sedes' },
        { value: 'home', label: 'Local' },
        { value: 'away', label: 'Visitante' },
        { value: 'neutral', label: 'Neutral' }
    ];

    // Contar filtros activos
    useEffect(() => {
        let count = 0;
        if (filters.teams.length > 0) count++;
        if (filters.players.length > 0) count++;
        if (filters.season) count++;
        if (filters.gameType !== 'all') count++;
        if (filters.venue !== 'all') count++;
        if (filters.searchTerm) count++;
        if (filters.dateRange.preset !== 'last30days') count++;

        setActiveFiltersCount(count);
    }, [filters]);

    // Notificar cambios
    useEffect(() => {
        onFiltersChange?.(filters);
    }, [filters, onFiltersChange]);

    const handleDatePresetChange = (preset) => {
        const today = new Date();
        let start, end;

        switch (preset) {
            case 'today':
                start = end = format(today, 'yyyy-MM-dd');
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                start = end = format(yesterday, 'yyyy-MM-dd');
                break;
            case 'thisMonth':
                start = format(startOfMonth(today), 'yyyy-MM-dd');
                end = format(endOfMonth(today), 'yyyy-MM-dd');
                break;
            case 'lastMonth':
                const lastMonth = subDays(startOfMonth(today), 1);
                start = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
                end = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
                break;
            default:
                const daysAgo = datePresets.find(p => p.value === preset)?.days || 30;
                start = format(subDays(today, daysAgo), 'yyyy-MM-dd');
                end = format(today, 'yyyy-MM-dd');
        }

        setFilters(prev => ({
            ...prev,
            dateRange: { start, end, preset }
        }));
    };

    const handleTeamToggle = (teamId) => {
        setFilters(prev => ({
            ...prev,
            teams: prev.teams.includes(teamId)
                ? prev.teams.filter(id => id !== teamId)
                : [...prev.teams, teamId]
        }));
    };

    const handlePlayerToggle = (playerId) => {
        setFilters(prev => ({
            ...prev,
            players: prev.players.includes(playerId)
                ? prev.players.filter(id => id !== playerId)
                : [...prev.players, playerId]
        }));
    };

    const resetFilters = () => {
        setFilters({
            dateRange: {
                start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                end: format(new Date(), 'yyyy-MM-dd'),
                preset: 'last30days'
            },
            teams: [],
            players: [],
            season: '',
            gameType: 'all',
            venue: 'all',
            searchTerm: ''
        });
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                        Filtros Avanzados
                    </h4>
                    {activeFiltersCount > 0 && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Limpiar
                </button>
            </div>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar equipos, jugadores..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Rango de fechas */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Período
                </label>
                <select
                    value={filters.dateRange.preset}
                    onChange={(e) => handleDatePresetChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {datePresets.map(preset => (
                        <option key={preset.value} value={preset.value}>
                            {preset.label}
                        </option>
                    ))}
                </select>

                {filters.dateRange.preset === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, start: e.target.value }
                            }))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                dateRange: { ...prev.dateRange, end: e.target.value }
                            }))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            {/* Filtros básicos */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de juego
                    </label>
                    <select
                        value={filters.gameType}
                        onChange={(e) => setFilters(prev => ({ ...prev, gameType: e.target.value }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {gameTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sede
                    </label>
                    <select
                        value={filters.venue}
                        onChange={(e) => setFilters(prev => ({ ...prev, venue: e.target.value }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {venues.map(venue => (
                            <option key={venue.value} value={venue.value}>
                                {venue.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Filtros avanzados */}
            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    Filtros Avanzados
                </button>

                {showAdvanced && (
                    <div className="mt-3 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {/* Equipos */}
                        {availableTeams.length > 0 && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Shield className="w-4 h-4" />
                                    Equipos
                                </label>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {availableTeams.map(team => (
                                        <label key={team.id} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.teams.includes(team.id)}
                                                onChange={() => handleTeamToggle(team.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">{team.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Jugadores */}
                        {availablePlayers.length > 0 && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Users className="w-4 h-4" />
                                    Jugadores
                                </label>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {availablePlayers.map(player => (
                                        <label key={player.id} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={filters.players.includes(player.id)}
                                                onChange={() => handlePlayerToggle(player.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">{player.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Temporada */}
                        {availableSeasons.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Temporada
                                </label>
                                <select
                                    value={filters.season}
                                    onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todas las temporadas</option>
                                    {availableSeasons.map(season => (
                                        <option key={season.id} value={season.id}>
                                            {season.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedFiltersWidget;
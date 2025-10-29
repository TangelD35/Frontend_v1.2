import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

const SearchAndFilter = ({
    searchValue,
    onSearchChange,
    filters = [],
    activeFilters = {},
    onFilterChange,
    placeholder = "Buscar...",
    className = ""
}) => {
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = Object.values(activeFilters).some(value =>
        value && value !== 'all' && value !== ''
    );

    const clearAllFilters = () => {
        const clearedFilters = {};
        filters.forEach(filter => {
            clearedFilters[filter.key] = filter.defaultValue || 'all';
        });
        onFilterChange(clearedFilters);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 transition-colors ${className}`}>
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Barra de búsqueda */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    />
                </div>

                {/* Botones de filtro */}
                <div className="flex items-center gap-2">
                    {filters.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${showFilters || hasActiveFilters
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                            {hasActiveFilters && (
                                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                    {Object.values(activeFilters).filter(v => v && v !== 'all' && v !== '').length}
                                </span>
                            )}
                        </button>
                    )}

                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && filters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {filter.label}
                                </label>
                                <select
                                    value={activeFilters[filter.key] || filter.defaultValue || 'all'}
                                    onChange={(e) => onFilterChange({
                                        ...activeFilters,
                                        [filter.key]: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                >
                                    {filter.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchAndFilter;
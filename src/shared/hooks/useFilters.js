import { useState, useMemo } from 'react';

const useFilters = (data, filterConfig = {}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState(() => {
        const initialFilters = {};
        Object.keys(filterConfig).forEach(key => {
            initialFilters[key] = filterConfig[key].defaultValue || 'all';
        });
        return initialFilters;
    });

    const filteredData = useMemo(() => {
        if (!data) return [];

        return data.filter(item => {
            // Filtro de búsqueda
            const searchFields = filterConfig.searchFields || ['name', 'title'];
            const matchesSearch = searchTerm === '' || searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });

            if (!matchesSearch) return false;

            // Filtros específicos
            return Object.keys(filters).every(filterKey => {
                const filterValue = filters[filterKey];
                if (!filterValue || filterValue === 'all') return true;

                const config = filterConfig[filterKey];
                if (!config) return true;

                if (config.filterFn) {
                    return config.filterFn(item, filterValue);
                }

                // Filtro por defecto: comparación directa
                return item[filterKey] === filterValue;
            });
        });
    }, [data, searchTerm, filters, filterConfig]);

    const updateFilter = (filterKey, value) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    const updateFilters = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        const clearedFilters = {};
        Object.keys(filterConfig).forEach(key => {
            clearedFilters[key] = filterConfig[key].defaultValue || 'all';
        });
        setFilters(clearedFilters);
    };

    const hasActiveFilters = useMemo(() => {
        return searchTerm !== '' || Object.keys(filters).some(key => {
            const value = filters[key];
            const defaultValue = filterConfig[key]?.defaultValue || 'all';
            return value !== defaultValue;
        });
    }, [searchTerm, filters, filterConfig]);

    return {
        searchTerm,
        setSearchTerm,
        filters,
        updateFilter,
        updateFilters,
        clearFilters,
        filteredData,
        hasActiveFilters,
        totalCount: data?.length || 0,
        filteredCount: filteredData.length
    };
};

export default useFilters;
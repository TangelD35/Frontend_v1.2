import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Plus, Trash2, RotateCcw } from 'lucide-react';
import { classNames } from '../../../../../lib/utils/componentUtils';
import ColumnFilter from './ColumnFilter';

const FilterPanel = ({
    columns = [],
    filters = [],
    onFiltersChange,
    data = [],
    isOpen = false,
    onClose,
    className = ''
}) => {
    const [activeFilters, setActiveFilters] = useState(filters);

    const addFilter = () => {
        const availableColumns = columns.filter(col =>
            col.accessorKey &&
            !activeFilters.some(filter => filter.columnId === col.accessorKey)
        );

        if (availableColumns.length > 0) {
            const newFilter = {
                id: Date.now().toString(),
                columnId: availableColumns[0].accessorKey,
                operator: 'contains',
                value: '',
                type: availableColumns[0].filterType || 'text'
            };

            const newFilters = [...activeFilters, newFilter];
            setActiveFilters(newFilters);
            onFiltersChange(newFilters);
        }
    };

    const removeFilter = (filterId) => {
        const newFilters = activeFilters.filter(filter => filter.id !== filterId);
        setActiveFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const updateFilter = (filterId, updates) => {
        const newFilters = activeFilters.map(filter =>
            filter.id === filterId ? { ...filter, ...updates } : filter
        );
        setActiveFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        onFiltersChange([]);
    };

    const getColumnOptions = (excludeColumnId = null) => {
        return columns
            .filter(col =>
                col.accessorKey &&
                col.accessorKey !== excludeColumnId &&
                !activeFilters.some(filter =>
                    filter.columnId === col.accessorKey && filter.id !== excludeColumnId
                )
            )
            .map(col => ({
                value: col.accessorKey,
                label: col.header || col.accessorKey,
                type: col.filterType || 'text'
            }));
    };

    const getOperatorOptions = (filterType) => {
        switch (filterType) {
            case 'number':
                return [
                    { value: 'equals', label: 'Igual a' },
                    { value: 'notEquals', label: 'No igual a' },
                    { value: 'greaterThan', label: 'Mayor que' },
                    { value: 'lessThan', label: 'Menor que' },
                    { value: 'greaterThanOrEqual', label: 'Mayor o igual que' },
                    { value: 'lessThanOrEqual', label: 'Menor o igual que' },
                    { value: 'between', label: 'Entre' },
                ];
            case 'date':
                return [
                    { value: 'equals', label: 'Igual a' },
                    { value: 'before', label: 'Antes de' },
                    { value: 'after', label: 'Después de' },
                    { value: 'between', label: 'Entre' },
                ];
            case 'select':
                return [
                    { value: 'in', label: 'Incluye' },
                    { value: 'notIn', label: 'No incluye' },
                ];
            case 'boolean':
                return [
                    { value: 'equals', label: 'Es' },
                ];
            default: // text
                return [
                    { value: 'contains', label: 'Contiene' },
                    { value: 'notContains', label: 'No contiene' },
                    { value: 'equals', label: 'Igual a' },
                    { value: 'notEquals', label: 'No igual a' },
                    { value: 'startsWith', label: 'Comienza con' },
                    { value: 'endsWith', label: 'Termina con' },
                    { value: 'isEmpty', label: 'Está vacío' },
                    { value: 'isNotEmpty', label: 'No está vacío' },
                ];
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={classNames(
                        'bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700',
                        className
                    )}
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Filtros Avanzados
                                </h3>
                                {activeFilters.length > 0 && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                        {activeFilters.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {activeFilters.length > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Limpiar todo
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {activeFilters.map((filter, index) => {
                                    const column = columns.find(col => col.accessorKey === filter.columnId);
                                    const columnOptions = getColumnOptions(filter.id);
                                    const operatorOptions = getOperatorOptions(filter.type);

                                    return (
                                        <motion.div
                                            key={filter.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                        >
                                            {index > 0 && (
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Y
                                                </div>
                                            )}

                                            {/* Column selector */}
                                            <select
                                                value={filter.columnId}
                                                onChange={(e) => {
                                                    const newColumn = columns.find(col => col.accessorKey === e.target.value);
                                                    updateFilter(filter.id, {
                                                        columnId: e.target.value,
                                                        type: newColumn?.filterType || 'text',
                                                        operator: 'contains',
                                                        value: ''
                                                    });
                                                }}
                                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value={filter.columnId}>
                                                    {column?.header || filter.columnId}
                                                </option>
                                                {columnOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Operator selector */}
                                            <select
                                                value={filter.operator}
                                                onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                                                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {operatorOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Value input */}
                                            {!['isEmpty', 'isNotEmpty'].includes(filter.operator) && (
                                                <div className="flex-1">
                                                    <ColumnFilter
                                                        column={column}
                                                        value={filter.value}
                                                        onChange={(value) => updateFilter(filter.id, { value })}
                                                        data={data}
                                                        filterType={filter.type}
                                                        placeholder="Valor..."
                                                    />
                                                </div>
                                            )}

                                            {/* Remove filter button */}
                                            <button
                                                onClick={() => removeFilter(filter.id)}
                                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Eliminar filtro"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Add filter button */}
                            {columns.filter(col => col.accessorKey && !activeFilters.some(filter => filter.columnId === col.accessorKey)).length > 0 && (
                                <button
                                    onClick={addFilter}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 transition-colors w-full justify-center"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar filtro
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FilterPanel;
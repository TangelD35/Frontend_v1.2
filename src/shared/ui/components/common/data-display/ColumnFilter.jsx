import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Hash, Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { classNames } from '../../../../../lib/utils/componentUtils';

const ColumnFilter = ({
    column,
    value,
    onChange,
    data = [],
    filterType = 'text',
    placeholder = 'Filtrar...',
    options = [],
    className = ''
}) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(new Set(Array.isArray(value) ? value : []));

    // Debounce effect for text inputs
    useEffect(() => {
        if (filterType === 'text' || filterType === 'number') {
            const timer = setTimeout(() => {
                onChange(localValue);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [localValue, onChange, filterType]);

    // Auto-generate options for select filters
    const autoOptions = useMemo(() => {
        if (options.length > 0) return options;

        if (filterType === 'select' && data.length > 0) {
            const uniqueValues = [...new Set(
                data.map(row => row[column.accessorKey])
                    .filter(val => val != null && val !== '')
            )].sort();

            return uniqueValues.map(val => ({
                label: String(val),
                value: val
            }));
        }

        return [];
    }, [options, filterType, data, column.accessorKey]);

    const handleTextChange = (e) => {
        setLocalValue(e.target.value);
    };

    const handleSelectChange = (optionValue) => {
        const newSelected = new Set(selectedOptions);
        if (newSelected.has(optionValue)) {
            newSelected.delete(optionValue);
        } else {
            newSelected.add(optionValue);
        }
        setSelectedOptions(newSelected);
        onChange(Array.from(newSelected));
    };

    const handleDateChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        onChange(newValue);
    };

    const handleRangeChange = (type, e) => {
        const newValue = e.target.value;
        const currentRange = Array.isArray(localValue) ? localValue : ['', ''];
        const newRange = [...currentRange];

        if (type === 'min') {
            newRange[0] = newValue;
        } else {
            newRange[1] = newValue;
        }

        setLocalValue(newRange);
        onChange(newRange);
    };

    const clearFilter = () => {
        setLocalValue('');
        setSelectedOptions(new Set());
        onChange('');
    };

    const renderTextFilter = () => (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                value={localValue}
                onChange={handleTextChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localValue && (
                <button
                    onClick={clearFilter}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                    <X className="w-3 h-3 text-gray-400" />
                </button>
            )}
        </div>
    );

    const renderNumberFilter = () => (
        <div className="space-y-2">
            <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="number"
                    value={Array.isArray(localValue) ? localValue[0] : localValue}
                    onChange={(e) => Array.isArray(localValue) ? handleRangeChange('min', e) : handleTextChange(e)}
                    placeholder="Mínimo"
                    className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            {Array.isArray(localValue) && (
                <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="number"
                        value={localValue[1]}
                        onChange={(e) => handleRangeChange('max', e)}
                        placeholder="Máximo"
                        className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            )}
            {(localValue || (Array.isArray(localValue) && (localValue[0] || localValue[1]))) && (
                <button
                    onClick={clearFilter}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Limpiar filtro
                </button>
            )}
        </div>
    );

    const renderDateFilter = () => (
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="date"
                value={localValue}
                onChange={handleDateChange}
                className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localValue && (
                <button
                    onClick={clearFilter}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                    <X className="w-3 h-3 text-gray-400" />
                </button>
            )}
        </div>
    );

    const renderSelectFilter = () => (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span>
                        {selectedOptions.size === 0
                            ? placeholder
                            : `${selectedOptions.size} seleccionado(s)`
                        }
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                        <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Opciones ({autoOptions.length})
                                </span>
                                {selectedOptions.size > 0 && (
                                    <button
                                        onClick={clearFilter}
                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                    >
                                        Limpiar todo
                                    </button>
                                )}
                            </div>
                            {autoOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.has(option.value)}
                                        onChange={() => handleSelectChange(option.value)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderBooleanFilter = () => (
        <div className="flex gap-2">
            <button
                onClick={() => onChange(true)}
                className={classNames(
                    'flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors',
                    value === true
                        ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
            >
                <Check className="w-4 h-4" />
                Sí
            </button>
            <button
                onClick={() => onChange(false)}
                className={classNames(
                    'flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors',
                    value === false
                        ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
            >
                <X className="w-4 h-4" />
                No
            </button>
            {value !== undefined && (
                <button
                    onClick={clearFilter}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Limpiar
                </button>
            )}
        </div>
    );

    return (
        <div className={classNames('min-w-48', className)}>
            {filterType === 'text' && renderTextFilter()}
            {filterType === 'number' && renderNumberFilter()}
            {filterType === 'date' && renderDateFilter()}
            {filterType === 'select' && renderSelectFilter()}
            {filterType === 'boolean' && renderBooleanFilter()}
        </div>
    );
};

export default ColumnFilter;
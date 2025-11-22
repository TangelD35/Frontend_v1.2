import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Table = ({
    columns,
    data,
    className = '',
    mobileBreakpoint = 'md', // sm, md, lg
    onRowClick = null,
    sortable = false,
    hoverable = true
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Función de ordenamiento
    const handleSort = (key) => {
        if (!sortable) return;

        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Ordenar datos
    const sortedData = sortable && sortConfig.key
        ? [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })
        : data;

    // Clases responsive para ocultar tabla en móvil
    const hideOnMobile = {
        sm: 'hidden sm:block',
        md: 'hidden md:block',
        lg: 'hidden lg:block'
    }[mobileBreakpoint];

    const showOnMobile = {
        sm: 'block sm:hidden',
        md: 'block md:hidden',
        lg: 'block lg:hidden'
    }[mobileBreakpoint];

    return (
        <div className={className}>
            {/* Vista de Tabla (Desktop) */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${hideOnMobile}`}>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    <table className="w-full min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap ${sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                                            } ${col.className || ''}`}
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {sortable && sortConfig.key === col.key && (
                                                sortConfig.direction === 'asc'
                                                    ? <ChevronUp className="w-4 h-4" />
                                                    : <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedData.map((row, i) => (
                                <tr
                                    key={i}
                                    className={`${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
                                        } transition-colors ${onRowClick ? 'cursor-pointer active:bg-gray-100 dark:active:bg-gray-600' : ''
                                        }`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-800 dark:text-gray-200 ${col.className || ''}`}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista de Cards (Móvil) */}
            <div className={`space-y-3 ${showOnMobile}`}>
                {sortedData.map((row, i) => (
                    <div
                        key={i}
                        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${onRowClick ? 'cursor-pointer active:bg-gray-100 dark:active:bg-gray-700' : ''
                            } transition-colors`}
                        onClick={() => onRowClick && onRowClick(row)}
                    >
                        {columns.map((col) => (
                            <div key={col.key} className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {col.label}
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white text-right ml-4">
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Mensaje si no hay datos */}
            {data.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No hay datos disponibles</p>
                </div>
            )}
        </div>
    );
};

export default Table;
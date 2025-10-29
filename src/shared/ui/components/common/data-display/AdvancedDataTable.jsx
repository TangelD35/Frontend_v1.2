import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Filter,
    Download,
    RefreshCw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Settings,
    Columns,
    SortAsc,
    SortDesc,
    X,
    Check,
    FileText,
    FileSpreadsheet,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePagination } from '../../../../../shared/hooks/usePagination';
import { classNames, exportToCSV, formatNumber, formatDate } from '../../../../../lib/utils/componentUtils';
import { TableApiIntegration, useComponentAuth, handleApiError } from '../utils/apiIntegration';
import { useDebounce, useStableCallback, useRenderTime, useOptimizedScroll } from '../utils/performanceUtils';

const AdvancedDataTable = React.memo(({
    data = [],
    columns = [],
    loading = false,
    serverSide = false,
    totalCount = 0,
    pageSize = 25,
    onPageChange,
    onSortChange,
    onFilterChange,
    onRowClick,
    onRowSelect,
    onBulkAction,
    selectable = false,
    searchable = true,
    filterable = true,
    exportable = true,
    refreshable = true,
    virtualScrolling = false,
    rowHeight = 50,
    maxHeight = 600,
    onRefresh,
    onExport,
    customRenderers = {},
    stickyHeader = true,
    resizable = true,
    sortable = true,
    className = '',
    emptyMessage = 'No hay datos disponibles',
    loadingMessage = 'Cargando datos...',
    showColumnToggle = true,
    showDensityToggle = true,
    density = 'normal', // 'compact', 'normal', 'comfortable'
    striped = true,
    bordered = false,
    // Nuevas props para integración API
    apiEndpoint = null,
    tableId = null,
    enableRealTimeUpdates = false,
    autoRefreshInterval = 30000,
    requireAuth = false,
    requiredPermission = null,
}) => {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState({});
    const [currentDensity, setCurrentDensity] = useState(density);
    const [showFilters, setShowFilters] = useState(false);
    const [showColumnSettings, setShowColumnSettings] = useState(false);
    const [apiData, setApiData] = useState([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiTotalCount, setApiTotalCount] = useState(0);

    const tableRef = useRef(null);
    const apiIntegrationRef = useRef(null);
    const autoRefreshIntervalRef = useRef(null);

    // Hooks de autenticación
    const { isAuthenticated, checkPermission } = useComponentAuth();

    // Performance monitoring
    useRenderTime('AdvancedDataTable');

    // Debounced search
    const debouncedGlobalFilter = useDebounce(globalFilter, 300);

    // Use custom pagination hook
    const {
        paginatedData,
        currentPage,
        totalPages,
        pageSize: currentPageSize,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        changePageSize,
        getRangeText,
    } = usePagination(serverSide ? apiData : data, {
        initialPageSize: pageSize,
        pageSizeOptions: [10, 25, 50, 100, 200],
    });

    // Verificar permisos de autenticación
    const hasPermission = useMemo(() => {
        if (!requireAuth) return true;
        if (!isAuthenticated) return false;
        if (requiredPermission && !checkPermission(requiredPermission)) return false;
        return true;
    }, [requireAuth, isAuthenticated, requiredPermission, checkPermission]);

    // Inicializar integración API
    useEffect(() => {
        if (apiEndpoint && hasPermission) {
            apiIntegrationRef.current = new TableApiIntegration(apiEndpoint);
        }
        return () => {
            if (apiIntegrationRef.current) {
                apiIntegrationRef.current.cleanup();
            }
        };
    }, [apiEndpoint, hasPermission]);

    // Cargar datos desde API
    const fetchApiData = useCallback(async (params = {}) => {
        if (!apiIntegrationRef.current || !hasPermission) return;

        setApiLoading(true);
        setApiError(null);

        try {
            const result = await apiIntegrationRef.current.fetchData({
                page: currentPage - 1,
                pageSize: currentPageSize,
                sortBy: sorting,
                filters: columnFilters.reduce((acc, filter) => {
                    acc[filter.id] = filter.value;
                    return acc;
                }, {}),
                globalFilter: debouncedGlobalFilter,
                ...params
            });

            setApiData(result.data);
            setApiTotalCount(result.totalCount);
        } catch (error) {
            const errorMessage = handleApiError(error);
            setApiError(errorMessage);
            console.error('Error fetching table data:', error);
        } finally {
            setApiLoading(false);
        }
    }, [currentPage, currentPageSize, sorting, columnFilters, debouncedGlobalFilter, hasPermission]);

    // Configurar actualizaciones en tiempo real
    useEffect(() => {
        if (enableRealTimeUpdates && tableId && apiIntegrationRef.current && hasPermission) {
            const cleanup = apiIntegrationRef.current.subscribeToUpdates(tableId, (updateData) => {
                // Actualizar datos según el tipo de actualización
                switch (updateData.type) {
                    case 'refresh':
                        fetchApiData();
                        break;
                    case 'update':
                        setApiData(prevData =>
                            prevData.map(item =>
                                item.id === updateData.item.id ? { ...item, ...updateData.item } : item
                            )
                        );
                        break;
                    case 'delete':
                        setApiData(prevData =>
                            prevData.filter(item => item.id !== updateData.itemId)
                        );
                        break;
                    case 'create':
                        setApiData(prevData => [updateData.item, ...prevData]);
                        break;
                    default:
                        break;
                }
            });

            return cleanup;
        }
    }, [enableRealTimeUpdates, tableId, hasPermission, fetchApiData]);

    // Auto-refresh
    useEffect(() => {
        if (autoRefreshInterval > 0 && apiEndpoint && hasPermission) {
            autoRefreshIntervalRef.current = setInterval(() => {
                fetchApiData();
            }, autoRefreshInterval);

            return () => {
                if (autoRefreshIntervalRef.current) {
                    clearInterval(autoRefreshIntervalRef.current);
                }
            };
        }
    }, [autoRefreshInterval, apiEndpoint, hasPermission, fetchApiData]);

    // Cargar datos iniciales desde API
    useEffect(() => {
        if (serverSide && apiEndpoint && hasPermission) {
            fetchApiData();
        }
    }, [serverSide, apiEndpoint, hasPermission, fetchApiData]);



    // Configurar columnas con acciones si es necesario
    const tableColumns = useMemo(() => {
        const baseColumns = columns.map(col => ({
            ...col,
            enableSorting: sortable && (col.enableSorting !== false),
            enableResizing: resizable && (col.enableResizing !== false),
            cell: col.cell || (({ getValue }) => {
                const value = getValue();
                if (customRenderers[col.accessorKey]) {
                    return customRenderers[col.accessorKey](value);
                }

                // Auto-format common data types
                if (col.dataType === 'number') {
                    return formatNumber(value, col.formatOptions);
                }
                if (col.dataType === 'date') {
                    return formatDate(value, col.formatOptions?.format);
                }
                if (col.dataType === 'boolean') {
                    return value ? (
                        <Check className="w-4 h-4 text-green-600" />
                    ) : (
                        <X className="w-4 h-4 text-red-600" />
                    );
                }

                return value;
            }),
        }));

        // Agregar columna de selección si es seleccionable
        if (selectable) {
            baseColumns.unshift({
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={table.getIsAllPageRowsSelected()}
                            onChange={table.getToggleAllPageRowsSelectedHandler()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                ),
                size: 50,
                enableSorting: false,
                enableResizing: false,
            });
        }

        // Agregar columna de acciones si hay onRowClick
        if (onRowClick) {
            baseColumns.push({
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(row.original, 'view');
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Ver detalles"
                        >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(row.original, 'edit');
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(row.original, 'delete');
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                    </div>
                ),
                size: 120,
                enableSorting: false,
                enableResizing: false,
            });
        }

        return baseColumns;
    }, [columns, selectable, onRowClick]);

    // Determinar fuente de datos
    const tableData = useMemo(() => {
        if (serverSide) {
            return apiData;
        }
        return paginatedData;
    }, [serverSide, apiData, paginatedData]);

    // Determinar estado de carga
    const isLoading = useMemo(() => {
        return loading || (serverSide && apiLoading);
    }, [loading, serverSide, apiLoading]);

    // Determinar total count
    const totalRowCount = useMemo(() => {
        if (serverSide) {
            return apiTotalCount;
        }
        return totalCount || data.length;
    }, [serverSide, apiTotalCount, totalCount, data.length]);

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: serverSide,
        manualSorting: serverSide,
        manualFiltering: serverSide,
        enableColumnResizing: resizable,
        columnResizeMode: 'onChange',
        rowCount: totalRowCount,
    });

    // Efectos para server-side
    useEffect(() => {
        if (serverSide && onPageChange) {
            onPageChange(currentPage - 1, currentPageSize);
        }
    }, [currentPage, currentPageSize, serverSide, onPageChange]);

    useEffect(() => {
        if (serverSide && onSortChange) {
            onSortChange(sorting);
        }
    }, [sorting, serverSide, onSortChange]);

    useEffect(() => {
        if (serverSide && onFilterChange) {
            onFilterChange({ globalFilter, columnFilters });
        }
    }, [globalFilter, columnFilters, serverSide, onFilterChange]);

    // Efectos para selección
    useEffect(() => {
        if (onRowSelect) {
            const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
            onRowSelect(selectedRows);
        }
    }, [rowSelection, onRowSelect, table]);

    // Stable callbacks for better performance
    const handleRefresh = useStableCallback(async () => {
        if (onRefresh) {
            onRefresh();
        } else if (serverSide && apiIntegrationRef.current) {
            await fetchApiData();
        }
    }, [onRefresh, serverSide, fetchApiData]);

    const handleExport = useStableCallback(async (format = 'csv') => {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
        const dataToExport = selectedRows.length > 0 ? selectedRows : (serverSide ? apiData : data);

        if (onExport) {
            onExport(dataToExport, format);
        } else if (apiIntegrationRef.current) {
            try {
                await apiIntegrationRef.current.exportData(dataToExport, format, `table-export-${Date.now()}`);
            } catch (error) {
                console.error('Export failed:', error);
                // Fallback to client-side export
                if (format === 'csv') {
                    exportToCSV(dataToExport, 'table-data.csv');
                }
            }
        } else {
            // Default CSV export
            if (format === 'csv') {
                exportToCSV(dataToExport, 'table-data.csv');
            }
        }
    }, [table, data, apiData, serverSide, onExport]);

    const handleBulkAction = useStableCallback(async (action) => {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
        if (selectedRows.length === 0) return;

        if (onBulkAction) {
            onBulkAction(action, selectedRows);
        } else if (apiIntegrationRef.current) {
            try {
                await apiIntegrationRef.current.performBulkAction(action, selectedRows);
                // Refresh data after bulk action
                await fetchApiData();
                // Clear selection
                setRowSelection({});
            } catch (error) {
                const errorMessage = handleApiError(error);
                setApiError(errorMessage);
                console.error('Bulk action failed:', error);
            }
        }
    }, [table, onBulkAction, fetchApiData]);

    const handleDensityChange = useCallback((newDensity) => {
        setCurrentDensity(newDensity);
    }, []);

    const getRowHeight = useCallback(() => {
        switch (currentDensity) {
            case 'compact': return 40;
            case 'comfortable': return 60;
            default: return rowHeight;
        }
    }, [currentDensity, rowHeight]);

    // Verificar permisos antes de renderizar
    if (requireAuth && !hasPermission) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center ${className}`}>
                <div className="text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                    <p>No tienes permisos para ver esta tabla de datos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Error Display */}
            {apiError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Error:</span>
                        <span>{apiError}</span>
                        <button
                            onClick={() => setApiError(null)}
                            className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header con controles */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Búsqueda global */}
                        {searchable && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={globalFilter ?? ''}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Información de selección */}
                        {selectable && Object.keys(rowSelection).length > 0 && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Object.keys(rowSelection).length} elemento(s) seleccionado(s)
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Botón de filtros */}
                        {filterable && (
                            <button
                                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                title="Filtros"
                            >
                                <Filter className="w-4 h-4" />
                                Filtros
                            </button>
                        )}

                        {/* Botón de exportar */}
                        {exportable && (
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                title="Exportar"
                            >
                                <Download className="w-4 h-4" />
                                Exportar
                            </button>
                        )}

                        {/* Botón de actualizar */}
                        {refreshable && (
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                title="Actualizar"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                        style={{ width: header.getSize() }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                                                    }`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="flex flex-col">
                                                        {header.column.getIsSorted() === 'asc' ? (
                                                            <ArrowUp className="w-4 h-4" />
                                                        ) : header.column.getIsSorted() === 'desc' ? (
                                                            <ArrowDown className="w-4 h-4" />
                                                        ) : (
                                                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <AnimatePresence>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={table.getAllColumns().length} className="px-4 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            {loadingMessage}
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={table.getAllColumns().length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row, index) => (
                                    <motion.tr
                                        key={row.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            } ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick && onRowClick(row.original, 'click')}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Mostrar</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                        <span>de {serverSide ? totalRowCount : table.getFilteredRowModel().rows.length} resultados</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </span>

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

AdvancedDataTable.displayName = 'AdvancedDataTable';

export default AdvancedDataTable;
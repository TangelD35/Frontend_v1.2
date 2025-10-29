import { useState, useMemo, useCallback } from 'react';

/**
 * Hook personalizado para manejar paginación avanzada
 * @param {Array} data - Datos a paginar
 * @param {Object} options - Configuración de paginación
 * @returns {Object} Estado y funciones de paginación
 */
export const usePagination = (data = [], {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
} = {}) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Calcular información de paginación
    const paginationInfo = useMemo(() => {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const hasNextPage = currentPage < totalPages;
        const hasPreviousPage = currentPage > 1;

        return {
            totalItems,
            totalPages,
            currentPage,
            pageSize,
            startIndex,
            endIndex,
            hasNextPage,
            hasPreviousPage,
            startItem: startIndex + 1,
            endItem: endIndex,
        };
    }, [data.length, currentPage, pageSize]);

    // Obtener datos de la página actual
    const paginatedData = useMemo(() => {
        const { startIndex, endIndex } = paginationInfo;
        return data.slice(startIndex, endIndex);
    }, [data, paginationInfo]);

    // Ir a página específica
    const goToPage = useCallback((page) => {
        const { totalPages } = paginationInfo;
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [paginationInfo]);

    // Ir a página siguiente
    const goToNextPage = useCallback(() => {
        if (paginationInfo.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    }, [paginationInfo.hasNextPage]);

    // Ir a página anterior
    const goToPreviousPage = useCallback(() => {
        if (paginationInfo.hasPreviousPage) {
            setCurrentPage(prev => prev - 1);
        }
    }, [paginationInfo.hasPreviousPage]);

    // Ir a primera página
    const goToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Ir a última página
    const goToLastPage = useCallback(() => {
        setCurrentPage(paginationInfo.totalPages);
    }, [paginationInfo.totalPages]);

    // Cambiar tamaño de página
    const changePageSize = useCallback((newPageSize) => {
        if (pageSizeOptions.includes(newPageSize)) {
            const { startIndex } = paginationInfo;
            const newPage = Math.floor(startIndex / newPageSize) + 1;

            setPageSize(newPageSize);
            setCurrentPage(newPage);
        }
    }, [pageSizeOptions, paginationInfo]);

    // Generar números de página para mostrar
    const getPageNumbers = useCallback((maxVisible = 5) => {
        const { totalPages, currentPage } = paginationInfo;

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [paginationInfo]);

    // Reset a primera página cuando cambien los datos
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Obtener información de rango para mostrar
    const getRangeText = useCallback(() => {
        const { startItem, endItem, totalItems } = paginationInfo;

        if (totalItems === 0) {
            return 'No hay elementos';
        }

        if (totalItems === 1) {
            return '1 elemento';
        }

        return `${startItem}-${endItem} de ${totalItems} elementos`;
    }, [paginationInfo]);

    return {
        // Datos paginados
        paginatedData,

        // Información de paginación
        ...paginationInfo,

        // Configuración
        pageSizeOptions,

        // Acciones
        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        changePageSize,
        resetPagination,

        // Utilidades
        getPageNumbers,
        getRangeText,
    };
};

export default usePagination;
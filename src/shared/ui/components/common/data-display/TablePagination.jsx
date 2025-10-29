import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal
} from 'lucide-react';
import { classNames } from '../../../../../lib/utils/componentUtils';

const TablePagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 25,
    pageSizeOptions = [10, 25, 50, 100],
    onPageChange,
    onPageSizeChange,
    showPageSizeSelector = true,
    showPageInfo = true,
    showQuickJumper = true,
    maxVisiblePages = 7,
    className = '',
    size = 'default' // 'small' | 'default' | 'large'
}) => {
    const [jumpToPage, setJumpToPage] = useState('');

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    const handlePageSizeChange = (newPageSize) => {
        if (onPageSizeChange) {
            onPageSizeChange(newPageSize);
        }
    };

    const handleJumpToPage = (e) => {
        e.preventDefault();
        const page = parseInt(jumpToPage);
        if (page >= 1 && page <= totalPages) {
            handlePageChange(page);
            setJumpToPage('');
        }
    };

    const getVisiblePages = () => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        const pages = [];

        // Always show first page
        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push('...');
            }
        }

        // Add visible pages
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Always show last page
        if (end < totalPages) {
            if (end < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return {
                    button: 'px-2 py-1 text-xs',
                    select: 'px-2 py-1 text-xs',
                    input: 'px-2 py-1 text-xs w-12',
                    text: 'text-xs'
                };
            case 'large':
                return {
                    button: 'px-4 py-3 text-base',
                    select: 'px-3 py-2 text-base',
                    input: 'px-3 py-2 text-base w-16',
                    text: 'text-base'
                };
            default:
                return {
                    button: 'px-3 py-2 text-sm',
                    select: 'px-3 py-2 text-sm',
                    input: 'px-2 py-1 text-sm w-14',
                    text: 'text-sm'
                };
        }
    };

    const sizeClasses = getSizeClasses();
    const visiblePages = getVisiblePages();

    if (totalPages <= 1 && !showPageSizeSelector) {
        return null;
    }

    return (
        <div className={classNames(
            'flex items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
            className
        )}>
            {/* Left side - Page size selector and info */}
            <div className="flex items-center gap-4">
                {showPageSizeSelector && (
                    <div className="flex items-center gap-2">
                        <span className={classNames('text-gray-600 dark:text-gray-400', sizeClasses.text)}>
                            Mostrar
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className={classNames(
                                'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                sizeClasses.select
                            )}
                        >
                            {pageSizeOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span className={classNames('text-gray-600 dark:text-gray-400', sizeClasses.text)}>
                            por página
                        </span>
                    </div>
                )}

                {showPageInfo && totalItems > 0 && (
                    <div className={classNames('text-gray-600 dark:text-gray-400', sizeClasses.text)}>
                        Mostrando {startItem.toLocaleString()} - {endItem.toLocaleString()} de {totalItems.toLocaleString()} resultados
                    </div>
                )}
            </div>

            {/* Right side - Pagination controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    {/* Quick jumper */}
                    {showQuickJumper && totalPages > maxVisiblePages && (
                        <form onSubmit={handleJumpToPage} className="flex items-center gap-2 mr-4">
                            <span className={classNames('text-gray-600 dark:text-gray-400', sizeClasses.text)}>
                                Ir a:
                            </span>
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={jumpToPage}
                                onChange={(e) => setJumpToPage(e.target.value)}
                                placeholder={currentPage.toString()}
                                className={classNames(
                                    'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                    sizeClasses.input
                                )}
                            />
                        </form>
                    )}

                    {/* First page button */}
                    <motion.button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={classNames(
                            'border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                            sizeClasses.button
                        )}
                        whileHover={{ scale: currentPage !== 1 ? 1.05 : 1 }}
                        whileTap={{ scale: currentPage !== 1 ? 0.95 : 1 }}
                        title="Primera página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </motion.button>

                    {/* Previous page button */}
                    <motion.button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={classNames(
                            'border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                            sizeClasses.button
                        )}
                        whileHover={{ scale: currentPage !== 1 ? 1.05 : 1 }}
                        whileTap={{ scale: currentPage !== 1 ? 0.95 : 1 }}
                        title="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {visiblePages.map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <div className={classNames(
                                        'flex items-center justify-center text-gray-400',
                                        sizeClasses.button
                                    )}>
                                        <MoreHorizontal className="w-4 h-4" />
                                    </div>
                                ) : (
                                    <motion.button
                                        onClick={() => handlePageChange(page)}
                                        className={classNames(
                                            'border rounded-lg transition-colors',
                                            page === currentPage
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
                                            sizeClasses.button
                                        )}
                                        whileHover={{ scale: page !== currentPage ? 1.05 : 1 }}
                                        whileTap={{ scale: page !== currentPage ? 0.95 : 1 }}
                                    >
                                        {page}
                                    </motion.button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Next page button */}
                    <motion.button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={classNames(
                            'border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                            sizeClasses.button
                        )}
                        whileHover={{ scale: currentPage !== totalPages ? 1.05 : 1 }}
                        whileTap={{ scale: currentPage !== totalPages ? 0.95 : 1 }}
                        title="Página siguiente"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>

                    {/* Last page button */}
                    <motion.button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={classNames(
                            'border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                            sizeClasses.button
                        )}
                        whileHover={{ scale: currentPage !== totalPages ? 1.05 : 1 }}
                        whileTap={{ scale: currentPage !== totalPages ? 0.95 : 1 }}
                        title="Última página"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default TablePagination;
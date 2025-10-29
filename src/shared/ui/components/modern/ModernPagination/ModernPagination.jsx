import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * ModernPagination Component
 * 
 * Paginación moderna con animaciones y controles visuales claros.
 * Incluye navegación rápida y transiciones suaves.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.currentPage - Página actual (1-indexed)
 * @param {number} props.totalPages - Total de páginas
 * @param {Function} props.onPageChange - Manejador de cambio de página
 * @param {number} props.siblingCount - Número de páginas a mostrar a cada lado
 * @param {boolean} props.showFirstLast - Mostrar botones primera/última
 */
const ModernPagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    siblingCount = 1,
    showFirstLast = true,
    className = '',
    ...props
}) => {
    // Generar array de números de página a mostrar
    const getPageNumbers = () => {
        const pages = [];
        const leftSibling = Math.max(currentPage - siblingCount, 1);
        const rightSibling = Math.min(currentPage + siblingCount, totalPages);

        // Mostrar primera página
        if (leftSibling > 1) {
            pages.push(1);
            if (leftSibling > 2) pages.push('...');
        }

        // Páginas del medio
        for (let i = leftSibling; i <= rightSibling; i++) {
            pages.push(i);
        }

        // Mostrar última página
        if (rightSibling < totalPages) {
            if (rightSibling < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange?.(page);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div
            className={clsx(
                'flex items-center justify-center gap-2',
                'py-4',
                className
            )}
            {...props}
        >
            {/* First Page Button */}
            {showFirstLast && (
                <motion.button
                    className={clsx(
                        'p-2 rounded-lg transition-all duration-200',
                        'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl',
                        'border border-white/20 dark:border-white/10',
                        'hover:shadow-lg hover:shadow-purple-500/20',
                        currentPage === 1
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-purple-500'
                    )}
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                >
                    <ChevronsLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
            )}

            {/* Previous Button */}
            <motion.button
                className={clsx(
                    'p-2 rounded-lg transition-all duration-200',
                    'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl',
                    'border border-white/20 dark:border-white/10',
                    'hover:shadow-lg hover:shadow-purple-500/20',
                    currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-purple-500'
                )}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-2 text-gray-400 dark:text-gray-600"
                            >
                                ...
                            </span>
                        );
                    }

                    const isActive = page === currentPage;

                    return (
                        <motion.button
                            key={page}
                            className={clsx(
                                'min-w-[40px] px-3 py-2 rounded-lg',
                                'font-medium text-sm transition-all duration-200',
                                'backdrop-blur-xl border',
                                isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/30'
                                    : 'bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20'
                            )}
                            onClick={() => handlePageChange(page)}
                            whileHover={!isActive ? { scale: 1.05 } : {}}
                            whileTap={!isActive ? { scale: 0.95 } : {}}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {page}
                        </motion.button>
                    );
                })}
            </div>

            {/* Next Button */}
            <motion.button
                className={clsx(
                    'p-2 rounded-lg transition-all duration-200',
                    'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl',
                    'border border-white/20 dark:border-white/10',
                    'hover:shadow-lg hover:shadow-purple-500/20',
                    currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-purple-500'
                )}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Last Page Button */}
            {showFirstLast && (
                <motion.button
                    className={clsx(
                        'p-2 rounded-lg transition-all duration-200',
                        'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl',
                        'border border-white/20 dark:border-white/10',
                        'hover:shadow-lg hover:shadow-purple-500/20',
                        currentPage === totalPages
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-purple-500'
                    )}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                >
                    <ChevronsRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
            )}
        </div>
    );
};

ModernPagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    siblingCount: PropTypes.number,
    showFirstLast: PropTypes.bool,
    className: PropTypes.string
};

export default ModernPagination;

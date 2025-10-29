import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '../../shared/hooks/useGestures';

const PullToRefresh = ({
    onRefresh,
    children,
    threshold = 80,
    className = ''
}) => {
    const {
        containerRef,
        isPulling,
        pullDistance,
        isRefreshing,
        progress
    } = usePullToRefresh(onRefresh, { threshold });

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Indicador de pull-to-refresh */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
                style={{
                    height: Math.min(pullDistance, threshold),
                    opacity: isPulling ? 1 : 0
                }}
                animate={{
                    y: isPulling ? 0 : -threshold
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                <div className="flex flex-col items-center gap-2 py-4">
                    {isRefreshing ? (
                        <>
                            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Actualizando...
                            </span>
                        </>
                    ) : (
                        <>
                            <motion.div
                                animate={{
                                    rotate: progress >= 1 ? 180 : 0,
                                    scale: Math.min(progress * 1.2, 1)
                                }}
                                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                            >
                                <ArrowDown className="w-6 h-6 text-blue-500" />
                            </motion.div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {progress >= 1 ? 'Suelta para actualizar' : 'Desliza hacia abajo'}
                            </span>
                        </>
                    )}

                    {/* Barra de progreso */}
                    <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                                width: `${Math.min(progress * 100, 100)}%`
                            }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Contenido principal */}
            <motion.div
                style={{
                    paddingTop: isPulling ? Math.min(pullDistance, threshold) : 0
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PullToRefresh;
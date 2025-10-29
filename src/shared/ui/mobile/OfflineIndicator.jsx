import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useOffline } from '../../shared/hooks/useOffline';

const OfflineIndicator = () => {
    const {
        isOnline,
        wasOffline,
        offlineQueue,
        syncInProgress,
        syncOfflineData
    } = useOffline();

    const handleSync = () => {
        if (!syncInProgress) {
            syncOfflineData();
        }
    };

    return (
        <AnimatePresence>
            {/* Indicador offline */}
            {!isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-16 left-0 right-0 z-40 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
                >
                    <div className="flex items-center justify-center gap-2">
                        <WifiOff className="w-4 h-4" />
                        <span>Sin conexión a internet</span>
                        {offlineQueue.length > 0 && (
                            <span className="bg-red-600 px-2 py-0.5 rounded-full text-xs">
                                {offlineQueue.length} pendiente{offlineQueue.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Indicador de reconexión */}
            {isOnline && wasOffline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-16 left-0 right-0 z-40 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Wifi className="w-4 h-4" />
                        <span>Conexión restaurada</span>
                        {offlineQueue.length > 0 && !syncInProgress && (
                            <button
                                onClick={handleSync}
                                className="ml-2 bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded text-xs transition-colors"
                            >
                                Sincronizar ({offlineQueue.length})
                            </button>
                        )}
                        {syncInProgress && (
                            <div className="flex items-center gap-1 ml-2">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span className="text-xs">Sincronizando...</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Panel de estado offline (móvil) */}
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                Modo Offline
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                Puedes seguir usando la aplicación. Los cambios se sincronizarán cuando vuelvas a tener conexión.
                            </p>

                            {offlineQueue.length > 0 && (
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{offlineQueue.length} acción{offlineQueue.length !== 1 ? 'es' : ''} pendiente{offlineQueue.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineIndicator;
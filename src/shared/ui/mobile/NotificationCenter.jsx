import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    BellOff,
    Settings,
    X,
    Check,
    AlertCircle,
    Info,
    Trophy,
    Users,
    Calendar,
    TrendingUp
} from 'lucide-react';
import { useNotifications } from '../../shared/hooks/useNotifications';

const NotificationCenter = ({ isOpen, onClose }) => {
    const {
        permission,
        isSupported,
        isSubscribed,
        requestPermission,
        subscribe,
        unsubscribe,
        getNotificationHistory
    } = useNotifications();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        gameUpdates: true,
        playerStats: true,
        teamNews: true,
        predictions: false,
        marketing: false
    });

    // Cargar historial de notificaciones
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const history = await getNotificationHistory(20);
            setNotifications(history || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnableNotifications = async () => {
        try {
            const granted = await requestPermission();
            if (granted) {
                await subscribe();
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
        }
    };

    const handleDisableNotifications = async () => {
        try {
            await unsubscribe();
        } catch (error) {
            console.error('Error disabling notifications:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'game':
                return <Calendar className="w-5 h-5 text-blue-500" />;
            case 'player':
                return <Users className="w-5 h-5 text-green-500" />;
            case 'stats':
                return <TrendingUp className="w-5 h-5 text-purple-500" />;
            case 'achievement':
                return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 'alert':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return `${Math.floor(diff / 86400000)}d`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Notificaciones
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Notification Settings */}
                        {isSupported && (
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Notificaciones Push
                                    </span>
                                    {permission === 'granted' && isSubscribed ? (
                                        <button
                                            onClick={handleDisableNotifications}
                                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <BellOff className="w-4 h-4" />
                                            Desactivar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEnableNotifications}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            <Bell className="w-4 h-4" />
                                            Activar
                                        </button>
                                    )}
                                </div>

                                {permission === 'denied' && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            Las notificaciones están bloqueadas. Puedes habilitarlas en la configuración del navegador.
                                        </p>
                                    </div>
                                )}

                                {permission === 'granted' && isSubscribed && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Tipos de notificaciones:
                                        </p>
                                        {Object.entries(preferences).map(([key, enabled]) => (
                                            <label key={key} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={enabled}
                                                    onChange={(e) => setPreferences(prev => ({
                                                        ...prev,
                                                        [key]: e.target.checked
                                                    }))}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="p-4">
                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No hay notificaciones
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {notification.body}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => {
                                // Marcar todas como leídas
                                setNotifications(prev =>
                                    prev.map(n => ({ ...n, read: true }))
                                );
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Marcar todas como leídas
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationCenter;
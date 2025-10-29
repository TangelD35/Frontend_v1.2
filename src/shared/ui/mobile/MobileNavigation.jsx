import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    Calendar,
    TrendingUp,
    Settings,
    Bell,
    Search,
    Menu,
    X
} from 'lucide-react';
import { useGestures } from '../../shared/hooks/useGestures';

const MobileNavigation = ({ onNotificationClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const mainNavItems = [
        { path: '/dashboard', icon: Home, label: 'Inicio' },
        { path: '/players', icon: Users, label: 'Jugadores' },
        { path: '/games', icon: Calendar, label: 'Partidos' },
        { path: '/analysis/predictive', icon: TrendingUp, label: 'Análisis' },
    ];

    const secondaryNavItems = [
        { path: '/teams', icon: Users, label: 'Equipos' },
        { path: '/tournaments', icon: Calendar, label: 'Torneos' },
        { path: '/predictions', icon: TrendingUp, label: 'Predicciones' },
        { path: '/settings', icon: Settings, label: 'Configuración' },
    ];

    // Gestos para navegación
    useGestures(document.body, {
        onSwipeRight: () => {
            if (!isMenuOpen) {
                setIsMenuOpen(true);
            }
        },
        onSwipeLeft: () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        },
        threshold: 100
    });

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ||
            (path !== '/dashboard' && location.pathname.startsWith(path));
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-pb"
            >
                <div className="flex items-center justify-around px-2 py-2">
                    {mainNavItems.map((item) => {
                        const IconComponent = item.icon;
                        const active = isActive(item.path);

                        return (
                            <motion.button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${active
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="relative">
                                    <IconComponent className="w-6 h-6" />
                                    {active && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                                        />
                                    )}
                                </div>
                                <span className="text-xs font-medium">{item.label}</span>
                            </motion.button>
                        );
                    })}

                    {/* Menu Button */}
                    <motion.button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 dark:text-gray-400"
                        whileTap={{ scale: 0.95 }}
                    >
                        <Menu className="w-6 h-6" />
                        <span className="text-xs font-medium">Más</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Top Action Bar */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 safe-area-pt"
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-dominican-red to-dominican-blue rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">F</span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                            FEBADOM
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            onClick={() => navigate('/search')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            whileTap={{ scale: 0.95 }}
                        >
                            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </motion.button>

                        <motion.button
                            onClick={onNotificationClick}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                            whileTap={{ scale: 0.95 }}
                        >
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            {/* Notification badge */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Side Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Menu Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-dominican-red to-dominican-blue rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">F</span>
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">
                                            FEBADOM
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Sistema de Análisis
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="p-4">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        Navegación Principal
                                    </h3>

                                    {mainNavItems.map((item) => {
                                        const IconComponent = item.icon;
                                        const active = isActive(item.path);

                                        return (
                                            <motion.button
                                                key={item.path}
                                                onClick={() => handleNavigation(item.path)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${active
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 mt-6">
                                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                        Más Opciones
                                    </h3>

                                    {secondaryNavItems.map((item) => {
                                        const IconComponent = item.icon;
                                        const active = isActive(item.path);

                                        return (
                                            <motion.button
                                                key={item.path}
                                                onClick={() => handleNavigation(item.path)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${active
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Safe area spacers */}
            <div className="h-16 md:hidden" /> {/* Top spacer */}
            <div className="h-20 md:hidden" /> {/* Bottom spacer */}
        </>
    );
};

export default MobileNavigation;
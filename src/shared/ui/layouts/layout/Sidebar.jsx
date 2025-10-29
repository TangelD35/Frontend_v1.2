import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Activity, X } from 'lucide-react';
import { useState } from 'react';
import { NAVIGATION_ITEMS, SYSTEM_STATS, APP_INFO } from '../../../../lib/constants';
import { getIcon } from '../../../../lib/utils/iconMap';
import { NavItem } from '../../components/common';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);

    // Usar elementos de navegación desde constantes
    const menuItems = NAVIGATION_ITEMS.map(item => ({
        ...item,
        icon: getIcon(item.icon)
    }));

    if (!isOpen) return null;

    return (
        <>
            <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
                    fixed top-16 bottom-0 left-0 z-30 w-80 flex flex-col
                    bg-gradient-to-b from-white/95 via-red-50/30 to-blue-50/30
                    dark:bg-gradient-to-b dark:from-gray-900/95 dark:via-red-900/10 dark:to-blue-900/10
                    backdrop-blur-2xl
                    border-r border-red-200/50 dark:border-red-800/50
                    shadow-2xl
                    ${isMobile ? 'lg:transform-none' : ''}
                    overflow-hidden
                `}
            >
                {/* Header del Sidebar */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-red-700 via-red-600/85 to-blue-600 px-6 py-5 border-b border-white/15 shadow-lg shadow-red-900/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg shadow-red-900/30">
                                    <Flag className="w-5 h-5 text-white" />
                                </div>
                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-wide text-white/80">
                                    {APP_INFO.COUNTRY_FLAG}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white drop-shadow-md">
                                    {APP_INFO.NAME}
                                </h2>
                                <p className="text-xs text-white/75 drop-shadow">
                                    Plataforma de análisis · v{APP_INFO.VERSION}
                                </p>
                            </div>
                        </div>
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors lg:hidden"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        )}
                    </div>
                    <div className="mt-5 h-px w-full bg-gradient-to-r from-white/0 via-white/45 to-white/0" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 sidebar-scroll overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-red-300 dark:scrollbar-thumb-red-700 scrollbar-track-transparent hover:scrollbar-thumb-red-400 dark:hover:scrollbar-thumb-red-600">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-3">
                            Navegación Principal
                        </h3>
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <NavItem
                                        {...item}
                                        onClick={() => isMobile && onClose()}
                                        onHover={setHoveredItem}
                                        isHovered={hoveredItem === item.path}
                                        isActive={location.pathname === item.path}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Estadísticas Básicas */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-3">
                            Estadísticas
                        </h3>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-red-600 dark:text-red-400">
                                        {SYSTEM_STATS.TOTAL_GAMES}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Partidos
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                        {SYSTEM_STATS.VICTORIES}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Victorias
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Efectividad
                                    </span>
                                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                        {SYSTEM_STATS.EFFECTIVENESS}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-gradient-to-r from-red-500 via-red-600 to-blue-600 h-2 rounded-full shadow-sm"
                                        style={{ width: `${SYSTEM_STATS.EFFECTIVENESS}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estado del Sistema Básico */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-3">
                            Sistema
                        </h3>
                        <div className="bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                                        Sistema Activo
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Todos los servicios operativos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Periodo */}
                    <div className="bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-red-900/20 dark:via-gray-800 dark:to-blue-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                Periodo de Análisis
                            </h4>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Periodo</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{SYSTEM_STATS.PERIOD}</span>
                            </div>
                            <div className="pt-2 border-t border-red-200 dark:border-red-800">
                                <p className="text-xs text-center text-red-700 dark:text-red-300 font-semibold">
                                    15 años de datos
                                </p>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Footer del Sidebar */}
                <div className="sticky bottom-0 p-4 bg-gradient-to-t from-white/95 via-red-50/30 to-transparent dark:from-gray-900/95 dark:via-red-900/10 border-t border-red-200/50 dark:border-red-800/50">
                    <div className="bg-gradient-to-r from-red-50/90 to-blue-50/90 dark:from-red-900/40 dark:to-blue-900/40 rounded-xl p-3 text-center border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Conectado
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {APP_INFO.NAME} v{APP_INFO.VERSION}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            © {APP_INFO.YEAR} {APP_INFO.ORGANIZATION}
                        </p>
                    </div>
                </div>
            </motion.aside>

            {/* Enhanced Animations */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }

                /* Custom scrollbar for sidebar */
                .sidebar-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgb(206 17 38 / 0.3);
                    border-radius: 3px;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgb(206 17 38 / 0.5);
                }
                .dark .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgb(206 17 38 / 0.7);
                }
                .dark .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgb(206 17 38 / 0.9);
                }
            `}</style>
        </>
    );
};

export default Sidebar;
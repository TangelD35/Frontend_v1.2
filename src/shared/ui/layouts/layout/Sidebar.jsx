import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Activity, X } from 'lucide-react';
import { useState } from 'react';
import { config, NAVIGATION_ITEMS, SYSTEM_STATS } from '../../../../lib/constants/index';
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
                    bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl
                    border-r border-gray-200/40 dark:border-white/15
                    shadow-2xl shadow-[#CE1126]/5 dark:shadow-[#002D62]/10
                    ${isMobile ? 'lg:transform-none' : ''}
                    overflow-hidden
                `}
            >
                {/* Header del Sidebar */}
                <div className="sticky top-0 z-10 px-6 py-5 border-b border-gray-200/40 dark:border-white/15 bg-gradient-to-br from-red-50/80 via-white/60 to-blue-50/80 dark:from-[#CE1126]/30 dark:via-[#0f2244]/25 dark:to-[#002D62]/30 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl border-2 border-[#CE1126]/30 dark:border-white/25 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 dark:from-[#CE1126]/30 dark:to-[#002D62]/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-[#CE1126]/30 dark:shadow-[#CE1126]/40">
                                    <Flag className="w-5 h-5 text-[#CE1126] dark:text-white/90" />
                                </div>
                                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-wide text-gray-600 dark:text-white/80">
                                    🇩🇴
                                </span>
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white drop-shadow">
                                    {config.app.name}
                                </h2>
                                <p className="text-xs text-gray-600 dark:text-white/60">
                                    {config.app.description}
                                </p>
                            </div>
                        </div>
                        {isMobile && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg border border-gray-300 dark:border-white/20 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors lg:hidden"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-white" />
                            </button>
                        )}
                    </div>
                    <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-white/45 to-transparent" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 sidebar-scroll overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[#CE1126]/40 dark:scrollbar-thumb-[#CE1126]/60 scrollbar-track-transparent hover:scrollbar-thumb-[#CE1126]/60 dark:hover:scrollbar-thumb-[#CE1126]/80">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-[0.2em] mb-3 px-3">
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

                    {/* Información del Periodo */}
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 backdrop-blur-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-gray-600 dark:text-white/80" />
                            <h4 className="text-xs font-bold text-gray-600 dark:text-white/60">
                                Periodo de Análisis
                            </h4>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-white/60">Periodo</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{SYSTEM_STATS.PERIOD}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                                <p className="text-xs text-center text-gray-700 dark:text-white/70 font-semibold">
                                    15 años de datos estratégicos
                                </p>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Footer del Sidebar */}
                <div className="sticky bottom-0 p-4 bg-gradient-to-t from-white/95 via-gray-50/85 to-transparent dark:from-slate-950/95 dark:via-slate-900/85 dark:to-transparent border-t border-gray-200/30 dark:border-white/10">
                    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 backdrop-blur-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-white/70">
                                Conectado
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-white/60">
                            {config.app.name} v{config.app.version}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                            © 2025 Federación Dominicana de Baloncesto
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
                    background: rgb(239 68 68 / 0.4);
                    border-radius: 3px;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgb(239 68 68 / 0.6);
                }
                .dark .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgb(206 17 38 / 0.6);
                }
                .dark .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgb(206 17 38 / 0.8);
                }
            `}</style>
        </>
    );
};

export default Sidebar;
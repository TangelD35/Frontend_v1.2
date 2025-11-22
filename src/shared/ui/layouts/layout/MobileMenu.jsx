import { X, Home, BarChart3, Users, Trophy, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../../../shared/store/authStore';

const MobileMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'text-blue-600 dark:text-blue-400' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', color: 'text-purple-600 dark:text-purple-400' },
        { icon: Users, label: 'Jugadores', path: '/players', color: 'text-green-600 dark:text-green-400' },
        { icon: Trophy, label: 'Equipos', path: '/teams', color: 'text-yellow-600 dark:text-yellow-400' },
        { icon: Calendar, label: 'Partidos', path: '/games', color: 'text-red-600 dark:text-red-400' },
        { icon: Trophy, label: 'Torneos', path: '/tournaments', color: 'text-indigo-600 dark:text-indigo-400' },
        { icon: Settings, label: 'Configuración', path: '/settings', color: 'text-gray-600 dark:text-gray-400' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        onClick={onClose}
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 z-50 shadow-2xl md:hidden safe-area-inset-all"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#CE1126] to-[#002D62]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <img
                                        src="/logo-rdscore.png"
                                        alt="Logo"
                                        className="w-8 h-8 object-cover rounded-full"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">RDscore</h2>
                                    <p className="text-xs text-white/80">Menú Principal</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors touch-target"
                                aria-label="Cerrar menú"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* User Info */}
                        {user && (
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CE1126] to-[#002D62] flex items-center justify-center text-white font-bold text-lg">
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {user.name || 'Usuario'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email || 'usuario@example.com'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Items */}
                        <nav className="flex-1 overflow-y-auto py-4 scroll-smooth-y">
                            <ul className="space-y-1 px-3">
                                {menuItems.map((item, index) => (
                                    <motion.li
                                        key={item.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <button
                                            onClick={() => handleNavigation(item.path)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group touch-target"
                                        >
                                            <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                                {item.label}
                                            </span>
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                        </nav>

                        {/* Footer - Logout */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 font-medium touch-target"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;

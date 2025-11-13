import { useNavigate } from 'react-router-dom';
import {
    LogOut, User, Bell, Settings, ChevronDown, Search,
    Sun, Moon, X, Menu
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../shared/providers/ThemeContext';
import useAuthStore from '../../../../shared/store/authStore';
import { config } from '../../../../lib/constants/index';
import NotificationPanel from '../../components/common/feedback/NotificationPanel';
import useNotifications from '../../../../shared/hooks/useNotifications';

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuthStore();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // Usar hook de notificaciones
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    } = useNotifications([
        {
            id: 1,
            title: 'Nuevo análisis',
            message: 'Predicción de partido lista para revisión',
            time: '5 min',
            read: false,
            type: 'success',
            action: 'Ver análisis'
        },
        {
            id: 2,
            title: 'Actualización del sistema',
            message: 'Estadísticas de jugadores actualizadas',
            time: '1h',
            read: true,
            type: 'info'
        },
        {
            id: 3,
            title: 'Partido programado',
            message: 'RD vs Puerto Rico - Mañana 8:00 PM',
            time: '2h',
            read: false,
            type: 'event',
            action: 'Ver detalles'
        },
        {
            id: 4,
            title: 'Alerta de rendimiento',
            message: 'Baja efectividad en tiros libres detectada',
            time: '3h',
            read: false,
            type: 'warning',
            action: 'Revisar'
        }
    ]);

    const userMenuRef = useRef(null);
    const notificationsRef = useRef(null);

    // Cerrar menús al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200/20 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl shadow-[0_20px_40px_-24px_rgba(8,25,43,0.8)]">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 dark:from-[#0f2244]/40 dark:via-transparent dark:to-[#5a0f1c]/40 opacity-70 pointer-events-none" />

                <div className="px-4 sm:px-6 relative z-10">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            {/* Menu Toggle Button with enhanced animation */}
                            <button
                                onClick={onMenuToggle}
                                className="p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-all duration-200 border border-gray-300/20 dark:border-white/10"
                                aria-label="Toggle menu"
                            >
                                {isSidebarOpen ? (
                                    <X className="w-5 h-5 text-gray-600 dark:text-white/80" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-600 dark:text-white/80" />
                                )}
                            </button>

                            {/* Logo */}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-transparent">
                                    <img
                                        src="/logo-rdscore.png"
                                        alt="Logo BasktscoreRD"
                                        className="w-full h-full object-cover"
                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-black bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                                        {config.app.name}
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                                        Plataforma analítica
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Center Section - Search */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar jugadores, equipos, partidos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSearchModal(true)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl 
                                             focus:ring-2 focus:ring-red-500 transition-all duration-200
                                             text-sm placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search Mobile */}
                            <button
                                onClick={() => setShowSearchModal(true)}
                                className="md:hidden p-2 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-300 group"
                            >
                                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                            </button>

                            {/* Theme Toggle with enhanced animation */}
                            <button
                                onClick={toggleTheme}
                                className="relative p-2 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300 group overflow-hidden"
                                aria-label="Toggle theme"
                            >
                                <div className="relative z-10">
                                    {theme === 'dark' ? (
                                        <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-indigo-600 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
                                    )}
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 dark:from-indigo-500/20 dark:to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                            </button>

                            {/* Notifications with enhanced styling */}
                            <div className="relative" ref={notificationsRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-300 group"
                                >
                                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse shadow-lg shadow-red-500/50">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <NotificationPanel
                                    notifications={notifications}
                                    isOpen={showNotifications}
                                    onClose={() => setShowNotifications(false)}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                />
                            </div>

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-2 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {user?.name || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Analista
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''
                                        }`} />
                                </button>

                                {/* User Dropdown */}
                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {user?.name || 'Administrador'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {user?.email || 'admin@basktscorerd.com'}
                                            </p>
                                        </div>

                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    navigate('/profile');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Mi Perfil
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate('/settings');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    Configuración
                                                </span>
                                            </button>
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm font-medium">Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-50 bg-black/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20">
                    <div className="w-full max-w-2xl mx-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl shadow-2xl">
                        <div className="p-4 border-b border-gray-200 dark:border-white/10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar jugadores, equipos, partidos, estadísticas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-2 focus:ring-red-500"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setShowSearchModal(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-white/60" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 max-h-96 overflow-y-auto">
                            {searchQuery ? (
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-500 dark:text-white/50">
                                        Resultados para "{searchQuery}"
                                    </div>
                                    {/* Resultados simulados */}
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors">
                                            <div className="font-medium text-gray-900 dark:text-white">Karl-Anthony Towns</div>
                                            <div className="text-sm text-gray-500 dark:text-white/50">Jugador - Centro</div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors">
                                            <div className="font-medium text-gray-900 dark:text-white">Selección Nacional</div>
                                            <div className="text-sm text-gray-500 dark:text-white/50">Equipo - República Dominicana</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-sm font-medium text-gray-600 dark:text-white/70">Búsquedas recientes</div>
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors">
                                            <div className="font-medium text-gray-900 dark:text-white">Estadísticas 2024</div>
                                        </div>
                                        <div className="p-3 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-colors">
                                            <div className="font-medium text-gray-900 dark:text-white">Análisis vs USA</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
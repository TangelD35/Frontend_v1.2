import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Breadcrumbs from '../../components/common/navigation/Breadcrumbs';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    // Detectar tamaño de pantalla
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsSidebarOpen(!mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Loading state para transiciones de página
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Pattern Dominicano */}
            <div className="fixed inset-0 bg-gradient-to-br from-red-50/40 via-white to-blue-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                {/* Patrón de bandera sutil */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                    <div className="absolute top-1/3 left-0 w-full h-1 bg-blue-500" />
                    <div className="absolute bottom-1/3 left-0 w-full h-1 bg-red-500" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500" />
                </div>

                {/* Radial gradients decorativos */}
                <div className="absolute top-10 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Navbar */}
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                </motion.div>

                {/* Mobile Overlay */}
                <AnimatePresence>
                    {isMobile && isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                            onClick={toggleSidebar}
                        />
                    )}
                </AnimatePresence>

                <div className="flex pt-16">
                    {/* Sidebar */}
                    <AnimatePresence mode="wait">
                        {isSidebarOpen && (
                            <motion.div
                                key="sidebar"
                                initial={{ x: -320, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -320, opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                            >
                                <Sidebar
                                    isOpen={isSidebarOpen}
                                    onClose={toggleSidebar}
                                    isMobile={isMobile}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <motion.main
                        layout
                        className={`
                            flex-1 transition-all duration-500 ease-in-out
                            ${isSidebarOpen && !isMobile ? 'lg:ml-80' : 'ml-0'}
                            p-4 sm:p-6 lg:p-8
                        `}
                        style={{
                            marginLeft: isSidebarOpen && !isMobile ? '320px' : '0px'
                        }}
                    >
                        <div className="max-w-7xl mx-auto">
                            {/* Breadcrumbs */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-6"
                            >
                                <Breadcrumbs className="text-gray-600 dark:text-gray-400" />
                            </motion.div>

                            {/* Page Content with Enhanced Glassmorphism */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: 'easeInOut',
                                        scale: { duration: 0.3 }
                                    }}
                                    className="
                                        relative overflow-hidden
                                        bg-white/90 dark:bg-gray-800/90
                                        backdrop-blur-2xl
                                        rounded-3xl shadow-2xl dark:shadow-gray-900/50
                                        transition-all duration-500
                                        border border-red-200/30 dark:border-red-800/30
                                        hover:shadow-3xl hover:border-red-300/50 dark:hover:border-red-700/50
                                        group
                                    "
                                >
                                    {/* Enhanced Background Pattern */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-blue-50/30 to-purple-50/50 dark:from-red-900/20 dark:via-blue-900/10 dark:to-purple-900/20 pointer-events-none" />

                                    {/* Decorative Elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />

                                    {/* Animated Border */}
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/20 via-blue-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

                                    {/* Content Container */}
                                    <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                                        {isLoading ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center justify-center py-20"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 border-4 border-red-200 dark:border-red-800 rounded-full animate-spin border-t-red-500 dark:border-t-red-400" />
                                                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-pulse border-l-blue-500 dark:border-l-blue-400" />
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                        Cargando contenido...
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                            >
                                                <Outlet />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Floating Action Button for Mobile Menu */}
                                    {isMobile && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={toggleSidebar}
                                            className="absolute top-4 right-4 z-20 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200 lg:hidden"
                                        >
                                            <motion.svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 12h18M3 6h18M3 18h18"
                                                />
                                            </motion.svg>
                                        </motion.button>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.main>
                </div>

                {/* Floating Dominican Elements */}
                <div className="fixed top-20 right-4 z-20 hidden xl:block">
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="w-3 h-3 bg-red-500 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0s' }}
                    />
                </div>
                <div className="fixed top-32 right-8 z-20 hidden xl:block">
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '0.5s' }}
                    />
                </div>
                <div className="fixed bottom-20 left-4 z-20 hidden xl:block">
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="w-2 h-2 bg-red-500 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: '1s' }}
                    />
                </div>
            </div>

            {/* Enhanced Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Layout;
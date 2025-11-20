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
            {/* Background Pattern Dominicano Mejorado */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-red-50/20 to-blue-50/20 dark:from-slate-950 dark:via-[#021633] dark:to-slate-950">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-red-100/30 to-blue-100/30 dark:from-slate-950/90 dark:via-[#021633]/95 dark:to-slate-950/90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(206,17,38,0.15)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,rgba(0,45,98,0.15)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(206,17,38,0.3)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,rgba(0,45,98,0.3)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
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
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={`
                            flex-1 transition-all duration-300 ease-in-out
                            ${isSidebarOpen && !isMobile ? 'lg:ml-80' : 'ml-0'}
                            p-4 sm:p-6 lg:p-8
                            min-h-[calc(100vh-4rem)]
                        `}
                    >
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* Breadcrumbs */}
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.3 }}
                                className="flex flex-wrap items-center justify-between gap-4"
                            >
                                <Breadcrumbs className="text-sm text-gray-600 dark:text-white/60" />
                                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 uppercase tracking-[0.3em]">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-400/40 shadow" />
                                    Modo Analítico
                                </div>
                            </motion.div>

                            {/* Page Content with Enhanced Glassmorphism */}
                            <AnimatePresence mode="wait">
                                <motion.section
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -24, scale: 0.98 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: 'easeInOut'
                                    }}
                                    className="relative overflow-hidden rounded-[32px] border border-gray-200/30 dark:border-white/10 bg-white/90 dark:bg-white/5 shadow-[0_40px_120px_-45px_rgba(8,25,43,0.75)] backdrop-blur-3xl"
                                >
                                    {/* Luminiscencia superior */}
                                    <div className="absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b from-red-50/60 via-red-50/30 to-transparent dark:from-white/25 dark:via-white/10 dark:to-transparent" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(206,17,38,0.15)_0%,transparent_60%),radial-gradient(circle_at_80%_0,rgba(0,45,98,0.15)_0%,transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_-20%,rgba(206,17,38,0.35)_0%,transparent_60%),radial-gradient(circle_at_80%_0,rgba(0,45,98,0.35)_0%,transparent_55%)] opacity-70" />
                                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.01)_45%,rgba(0,0,0,0)_55%),linear-gradient(300deg,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0)_35%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_45%,rgba(255,255,255,0)_55%),linear-gradient(300deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_35%)] opacity-60" />

                                    {/* Content Container */}
                                    <div className="relative z-10 p-6 sm:p-10 lg:p-12">
                                        {isLoading ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-10"
                                            >
                                                <div className="grid gap-6 lg:grid-cols-2">
                                                    {[1, 2, 3, 4].map((item) => (
                                                        <div
                                                            key={`skeleton-card-${item}`}
                                                            className="relative overflow-hidden rounded-2xl border border-gray-200/20 dark:border-white/10 bg-gray-100/50 dark:bg-white/10 p-6 shadow-inner"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 dark:via-white/15 to-transparent translate-x-[-100%] animate-[shimmer_1.8s_infinite]" />
                                                            <div className="h-5 w-32 rounded-full bg-gray-300/40 dark:bg-white/15" />
                                                            <div className="mt-4 space-y-3">
                                                                <div className="h-3 w-3/4 rounded-full bg-gray-200/50 dark:bg-white/10" />
                                                                <div className="h-3 w-2/3 rounded-full bg-gray-200/50 dark:bg-white/10" />
                                                                <div className="h-3 w-5/6 rounded-full bg-gray-200/50 dark:bg-white/10" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-12 w-12">
                                                        <div className="absolute inset-0 rounded-full border-2 border-gray-300/40 dark:border-white/20" />
                                                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#CE1126] dark:border-t-white/70 animate-spin" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white/80">Cargando panel analítico</p>
                                                        <p className="text-xs text-gray-600 dark:text-white/50">Optimizando KPIs y visualizaciones para la Selección Nacional</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                            >
                                                <Outlet />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Mobile FAB */}
                                    {isMobile && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={toggleSidebar}
                                            className="absolute top-5 right-5 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#CE1126] to-[#002D62] px-4 py-2 text-xs font-semibold text-white shadow-lg lg:hidden"
                                        >
                                            {isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                                        </motion.button>
                                    )}
                                </motion.section>
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
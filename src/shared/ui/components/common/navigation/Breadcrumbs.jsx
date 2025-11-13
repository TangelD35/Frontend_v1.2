import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAVIGATION_ITEMS } from '../../../../../lib/constants/index';
import { getIcon } from '../../../../../lib/utils/iconMap';

const Breadcrumbs = ({ className = '' }) => {
    const location = useLocation();

    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);

        // Si estamos en la ruta raíz o dashboard, no mostrar breadcrumbs
        if (location.pathname === '/' || location.pathname === '/dashboard') {
            return [];
        }

        const breadcrumbs = [{
            label: 'Inicio',
            path: '/dashboard',
            icon: Home,
            key: 'inicio-dashboard' // Clave única fija
        }];

        let currentPath = '';
        pathSegments.forEach((segment, segmentIndex) => {
            currentPath += `/${segment}`;

            // No agregar el breadcrumb si es la misma ruta que "Inicio"
            if (currentPath === '/dashboard') {
                return;
            }

            const navItem = NAVIGATION_ITEMS.find(item => item.path === currentPath);
            // Crear clave única usando el path y el índice del segmento
            const uniqueKey = `${currentPath}-${segmentIndex}`;

            if (navItem) {
                breadcrumbs.push({
                    label: navItem.label,
                    path: currentPath,
                    icon: getIcon(navItem.icon),
                    key: uniqueKey // Usar clave única
                });
            } else {
                // Para rutas dinámicas como /players/123
                breadcrumbs.push({
                    label: segment.charAt(0).toUpperCase() + segment.slice(1),
                    path: currentPath,
                    key: uniqueKey // Usar clave única
                });
            }
        });

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    // Debug: verificar breadcrumbs duplicados
    if (process.env.NODE_ENV === 'development') {
        const keys = breadcrumbs.map(b => b.key);
        const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
        if (duplicates.length > 0) {
            console.warn('Breadcrumbs con claves duplicadas:', duplicates, breadcrumbs);
        }
    }

    if (breadcrumbs.length <= 1) return null;

    return (
        <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center space-x-2 text-sm ${className}`}
        >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 shadow-lg">
                {breadcrumbs.map((crumb, index) => (
                    <motion.div
                        key={crumb.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center"
                    >
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 dark:text-gray-500" />
                        )}
                        <div className="flex items-center gap-2">
                            {crumb.icon && (
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <crumb.icon className={`w-4 h-4 ${index === breadcrumbs.length - 1
                                            ? 'text-purple-600 dark:text-purple-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`} />
                                </motion.div>
                            )}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="text-gray-900 dark:text-gray-100 font-semibold px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="relative group px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600"
                                >
                                    <span className="relative z-10 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
                                        {crumb.label}
                                    </span>
                                    {/* Underline animation */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                                        initial={{ scaleX: 0 }}
                                        whileHover={{ scaleX: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.nav>
    );
};

export default Breadcrumbs;

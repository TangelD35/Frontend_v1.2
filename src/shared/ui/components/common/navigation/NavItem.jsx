import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const NavItem = ({
    path,
    icon: Icon,
    label,
    description,
    color,
    onClick,
    isActive,
    onHover,
    isHovered
}) => {
    return (
        <NavLink
            to={path}
            onClick={onClick}
            onMouseEnter={() => onHover?.(path)}
            onMouseLeave={() => onHover?.(null)}
            className={({ isActive }) =>
                `group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/30 dark:to-blue-900/30 shadow-lg border border-red-200 dark:border-red-800'
                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-800/30'
                }`
            }
        >
            {/* Indicador de activo animado */}
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-red-500 via-purple-500 to-blue-500 rounded-r-full shadow-lg shadow-red-500/50"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}

            {/* Icono con gradiente y animación */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    relative p-2.5 rounded-xl transition-all duration-300
                    ${isActive
                        ? `bg-gradient-to-br ${color} shadow-lg shadow-red-500/30`
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600'
                    }
                `}
            >
                <Icon className={`
                    w-5 h-5 transition-all duration-300
                    ${isActive ? 'text-white drop-shadow-lg' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'}
                `} />

                {/* Shine effect on icon */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                )}
            </motion.div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
                <span className={`
                    block font-semibold text-sm transition-colors duration-300
                    ${isActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                    }
                `}>
                    {label}
                </span>
                <span className={`
                    block text-xs transition-colors duration-300
                    ${isActive
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'
                    }
                `}>
                    {description}
                </span>
            </div>

            {/* Flecha de hover animada */}
            <motion.div
                animate={{
                    x: isActive ? 0 : -8,
                    opacity: isActive ? 1 : 0
                }}
                whileHover={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronRight className={`
                    w-4 h-4 transition-colors duration-300
                    ${isActive
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }
                `} />
            </motion.div>

            {/* Efecto de brillo en hover */}
            {isHovered && !isActive && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent rounded-xl"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 0.8 }}
                />
            )}

            {/* Background glow effect when active */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-xl blur-xl -z-10" />
            )}
        </NavLink>
    );
};

export default NavItem;
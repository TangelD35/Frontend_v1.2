import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../../providers/ThemeContext';

const ThemeSwitcher = ({ className = '' }) => {
    const { theme, toggleTheme, isTransitioning } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            disabled={isTransitioning}
            className={`
        relative p-3 rounded-xl
        bg-white/80 dark:bg-gray-800/80
        backdrop-blur-xl
        border border-white/20 dark:border-gray-700/50
        shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        group overflow-hidden
        ${className}
      `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon container */}
            <div className="relative z-10 flex items-center justify-center">
                <motion.div
                    key={theme}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-yellow-500 drop-shadow-lg" />
                    ) : (
                        <Moon className="w-5 h-5 text-indigo-600 drop-shadow-lg" />
                    )}
                </motion.div>
            </div>

            {/* Ripple effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
        </motion.button>
    );
};

export default ThemeSwitcher;

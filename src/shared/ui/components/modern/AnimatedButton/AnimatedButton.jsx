import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const AnimatedButton = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    loading = false,
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
        secondary: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
        outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
        ghost: 'text-purple-600 hover:bg-purple-50',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
        danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <motion.button
            className={clsx(
                'relative overflow-hidden rounded-xl font-semibold',
                variants[variant],
                sizes[size],
                'shadow-lg hover:shadow-xl',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2 justify-center',
                className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5" />}
                    {children}
                </>
            )}

            {/* Shine effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />
        </motion.button>
    );
};

export default AnimatedButton;
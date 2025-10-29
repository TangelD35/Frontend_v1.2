import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const GlassCard = ({
    children,
    className = '',
    hover = true,
    gradient = false,
    onClick,
    ...props
}) => {
    return (
        <motion.div
            className={clsx(
                'relative overflow-hidden rounded-2xl',
                'bg-white/70 dark:bg-gray-900/70',
                'backdrop-blur-xl',
                'border border-white/20 dark:border-white/10',
                'shadow-xl',
                hover && 'hover:shadow-2xl hover:scale-[1.02]',
                gradient && 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/10 before:to-pink-500/10',
                'transition-all duration-300',
                className
            )}
            whileHover={hover ? { y: -4 } : {}}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
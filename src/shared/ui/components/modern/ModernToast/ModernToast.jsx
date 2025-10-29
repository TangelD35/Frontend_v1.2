import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect } from 'react';

const ModernToast = ({
    id,
    title,
    message,
    type = 'info',
    duration = 5000,
    onClose,
    action,
    ...props
}) => {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    };

    const colors = {
        success: 'from-green-500 to-emerald-600',
        error: 'from-red-500 to-pink-600',
        warning: 'from-yellow-500 to-orange-600',
        info: 'from-blue-500 to-cyan-600'
    };

    const Icon = icons[type];

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose?.(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={clsx(
                'relative overflow-hidden rounded-xl',
                'bg-white/95 dark:bg-gray-900/95',
                'backdrop-blur-xl',
                'border border-white/20 dark:border-gray-700/50',
                'shadow-2xl',
                'max-w-sm w-full'
            )}
            {...props}
        >
            {/* Gradient overlay */}
            <div className={clsx(
                'absolute inset-0 bg-gradient-to-r opacity-10',
                colors[type]
            )} />

            <div className="relative z-10 p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={clsx(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        'bg-gradient-to-r text-white',
                        colors[type]
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                {title}
                            </h4>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {message}
                        </p>
                        {action && (
                            <button
                                onClick={action.onClick}
                                className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                            >
                                {action.label}
                            </button>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => onClose?.(id)}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
                <motion.div
                    className={clsx(
                        'absolute bottom-0 left-0 h-1 bg-gradient-to-r',
                        colors[type]
                    )}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                />
            )}
        </motion.div>
    );
};

export default ModernToast;

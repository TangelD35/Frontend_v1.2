import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const ModernModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
    showCloseButton = true,
    ...props
}) => {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4'
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={clsx(
                        'relative w-full',
                        sizes[size],
                        'bg-white/95 dark:bg-gray-900/95',
                        'backdrop-blur-xl',
                        'rounded-2xl shadow-2xl',
                        'border border-white/20 dark:border-gray-700/50',
                        className
                    )}
                    {...props}
                >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 rounded-2xl pointer-events-none" />

                    {/* Header */}
                    {title && (
                        <div className="relative z-10 flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-6">
                        {children}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ModernModal;

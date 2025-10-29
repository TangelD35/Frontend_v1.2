import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import AnimatedButton from '../AnimatedButton';

const ErrorState = ({
    title = 'Algo salió mal',
    message = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
    onRetry,
    onGoHome,
    onGoBack,
    className = '',
    showActions = true,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={clsx(
                'flex flex-col items-center justify-center p-12 text-center',
                'min-h-[400px]',
                className
            )}
            {...props}
        >
            {/* Error Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-6 shadow-2xl"
            >
                <AlertCircle className="w-12 h-12 text-white" />
            </motion.div>

            {/* Error Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-md"
            >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
            </motion.div>

            {/* Actions */}
            {showActions && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-3 justify-center"
                >
                    {onRetry && (
                        <AnimatedButton
                            variant="primary"
                            onClick={onRetry}
                            icon={RefreshCw}
                        >
                            Intentar de nuevo
                        </AnimatedButton>
                    )}

                    {onGoBack && (
                        <AnimatedButton
                            variant="secondary"
                            onClick={onGoBack}
                            icon={ArrowLeft}
                        >
                            Volver
                        </AnimatedButton>
                    )}

                    {onGoHome && (
                        <AnimatedButton
                            variant="outline"
                            onClick={onGoHome}
                            icon={Home}
                        >
                            Ir al inicio
                        </AnimatedButton>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default ErrorState;


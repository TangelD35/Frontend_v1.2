import { motion } from 'framer-motion';
import { Loader2, Target, Circle } from 'lucide-react';
import { clsx } from 'clsx';

const LoadingState = ({ 
  message = 'Cargando...',
  showSpinner = true,
  variant = 'default',
  className = '',
  ...props 
}) => {
  const variants = {
    default: {
      icon: Loader2,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
    },
    basketball: {
      icon: Circle,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    },
    target: {
      icon: Target,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    }
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'flex flex-col items-center justify-center p-12 text-center',
        'min-h-[300px]',
        'bg-gradient-to-br rounded-2xl',
        config.bgGradient,
        className
      )}
      {...props}
    >
      {/* Loading Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center mb-6',
          'bg-gradient-to-br text-white shadow-2xl',
          config.gradient
        )}
      >
        <Icon className="w-8 h-8" />
      </motion.div>

      {/* Loading Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          {message}
        </h3>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingState;


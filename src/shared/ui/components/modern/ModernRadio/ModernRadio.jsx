import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';

/**
 * ModernRadio Component
 * 
 * Radio button moderno con animaciones y efectos visuales.
 * Incluye animación de selección y estados hover/focus.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del radio
 * @param {boolean} props.checked - Estado checked
 * @param {Function} props.onChange - Manejador de cambio
 * @param {string} props.value - Valor del radio
 * @param {string} props.name - Nombre del grupo de radios
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {string} props.size - Tamaño (sm, md, lg)
 */
const ModernRadio = ({
    label,
    checked = false,
    onChange,
    value,
    name,
    disabled = false,
    size = 'md',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: {
            outer: 'w-4 h-4',
            inner: 'w-2 h-2',
            text: 'text-sm'
        },
        md: {
            outer: 'w-5 h-5',
            inner: 'w-2.5 h-2.5',
            text: 'text-base'
        },
        lg: {
            outer: 'w-6 h-6',
            inner: 'w-3 h-3',
            text: 'text-lg'
        }
    };

    return (
        <label
            className={clsx(
                'flex items-center gap-3 cursor-pointer select-none',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <div className="relative">
                {/* Hidden Input */}
                <input
                    type="radio"
                    checked={checked}
                    onChange={onChange}
                    value={value}
                    name={name}
                    disabled={disabled}
                    className="sr-only"
                    {...props}
                />

                {/* Custom Radio */}
                <motion.div
                    className={clsx(
                        sizes[size].outer,
                        'rounded-full border-2 transition-all duration-300',
                        'flex items-center justify-center',
                        checked
                            ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
                        !disabled && 'hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20'
                    )}
                    whileHover={!disabled ? { scale: 1.1 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                >
                    {/* Inner Circle */}
                    <motion.div
                        className={clsx(
                            sizes[size].inner,
                            'rounded-full bg-gradient-to-r from-purple-600 to-pink-600'
                        )}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: checked ? 1 : 0,
                            opacity: checked ? 1 : 0
                        }}
                        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                    />
                </motion.div>

                {/* Focus Ring */}
                {!disabled && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-purple-500"
                        initial={{ opacity: 0, scale: 1 }}
                        whileFocus={{ opacity: 1, scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>

            {/* Label */}
            {label && (
                <span className={clsx(
                    sizes[size].text,
                    'text-gray-700 dark:text-gray-300',
                    !disabled && 'group-hover:text-gray-900 dark:group-hover:text-gray-100'
                )}>
                    {label}
                </span>
            )}
        </label>
    );
};

ModernRadio.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string
};

export default ModernRadio;

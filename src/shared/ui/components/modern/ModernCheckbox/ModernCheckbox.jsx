import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

/**
 * ModernCheckbox Component
 * 
 * Checkbox moderno con animaciones y efectos visuales.
 * Incluye animación de check y estados hover/focus.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del checkbox
 * @param {boolean} props.checked - Estado checked
 * @param {Function} props.onChange - Manejador de cambio
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {string} props.size - Tamaño (sm, md, lg)
 */
const ModernCheckbox = ({
    label,
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    className = '',
    ...props
}) => {
    const sizes = {
        sm: {
            box: 'w-4 h-4',
            icon: 'w-3 h-3',
            text: 'text-sm'
        },
        md: {
            box: 'w-5 h-5',
            icon: 'w-4 h-4',
            text: 'text-base'
        },
        lg: {
            box: 'w-6 h-6',
            icon: 'w-5 h-5',
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
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only"
                    {...props}
                />

                {/* Custom Checkbox */}
                <motion.div
                    className={clsx(
                        sizes[size].box,
                        'rounded-lg border-2 transition-all duration-300',
                        'flex items-center justify-center',
                        checked
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
                        !disabled && 'hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20'
                    )}
                    whileHover={!disabled ? { scale: 1.1 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                >
                    {/* Check Icon */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: checked ? 1 : 0,
                            opacity: checked ? 1 : 0
                        }}
                        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                    >
                        <Check className={clsx(sizes[size].icon, 'text-white')} strokeWidth={3} />
                    </motion.div>
                </motion.div>

                {/* Focus Ring */}
                {!disabled && (
                    <motion.div
                        className="absolute inset-0 rounded-lg border-2 border-purple-500"
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

ModernCheckbox.propTypes = {
    label: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string
};

export default ModernCheckbox;

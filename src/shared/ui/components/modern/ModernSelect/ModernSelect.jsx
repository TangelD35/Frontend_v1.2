import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

/**
 * ModernSelect Component
 * 
 * Select moderno con glassmorphism y animaciones.
 * Dropdown personalizado con efectos visuales mejorados.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del select
 * @param {string} props.value - Valor seleccionado
 * @param {Function} props.onChange - Manejador de cambio
 * @param {Array} props.options - Opciones del select [{value, label}]
 * @param {string} props.error - Mensaje de error
 * @param {string} props.placeholder - Texto placeholder
 * @param {boolean} props.required - Campo requerido
 * @param {boolean} props.disabled - Campo deshabilitado
 * @param {React.Component} props.icon - Icono a mostrar
 */
const ModernSelect = ({
    label,
    value,
    onChange,
    options = [],
    error,
    placeholder = 'Selecciona una opción',
    required = false,
    disabled = false,
    icon: Icon,
    className = '',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focused, setFocused] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            setFocused(!isOpen);
        }
    };

    return (
        <div className={clsx('relative w-full', className)}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Select Button */}
            <div
                className={clsx(
                    'relative rounded-xl border-2 transition-all duration-300 cursor-pointer',
                    'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl',
                    focused && !error && 'border-purple-500 shadow-lg shadow-purple-500/20',
                    !focused && !error && 'border-gray-300 dark:border-gray-600',
                    error && 'border-red-500 shadow-lg shadow-red-500/20',
                    disabled && 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800',
                    isOpen && 'rounded-b-none'
                )}
                onClick={handleToggle}
                {...props}
            >
                {/* Icon */}
                {Icon && (
                    <div className={clsx(
                        'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300',
                        focused ? 'text-purple-500' : 'text-gray-400',
                        error && 'text-red-500'
                    )}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                {/* Selected Value or Placeholder */}
                <div className={clsx(
                    'px-4 py-3 pr-10',
                    Icon && 'pl-12',
                    !selectedOption && 'text-gray-400'
                )}>
                    {selectedOption ? selectedOption.label : placeholder}
                </div>

                {/* Chevron Icon */}
                <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>

                {/* Error Icon */}
                {error && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={clsx(
                            'absolute z-50 w-full mt-[-2px]',
                            'rounded-b-xl border-2 border-t-0',
                            'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
                            'shadow-xl',
                            error ? 'border-red-500' : 'border-purple-500',
                            'max-h-60 overflow-y-auto'
                        )}
                    >
                        {options.map((option, index) => (
                            <motion.div
                                key={option.value}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={clsx(
                                    'px-4 py-3 cursor-pointer transition-colors duration-200',
                                    'hover:bg-purple-50 dark:hover:bg-purple-900/20',
                                    'flex items-center justify-between',
                                    value === option.value && 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                )}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 text-sm text-red-500 flex items-center gap-1"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Click Outside Handler */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsOpen(false);
                        setFocused(false);
                    }}
                />
            )}
        </div>
    );
};

ModernSelect.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired
        })
    ).isRequired,
    error: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.elementType,
    className: PropTypes.string
};

export default ModernSelect;

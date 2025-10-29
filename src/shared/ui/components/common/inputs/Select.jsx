import { AlertCircle, ChevronDown } from 'lucide-react';

const Select = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    error = '',
    required = false,
    disabled = false,
    placeholder = 'Selecciona una opción',
    helper = '',
    className = '',
    multiple = false,
    icon: Icon,
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {Icon && <Icon className="w-4 h-4 inline mr-2" />}
                    {label}
                    {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value || (multiple ? [] : '')}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    multiple={multiple}
                    className={`
                        w-full px-4 py-3 border rounded-lg transition-colors
                        ${multiple ? '' : 'appearance-none'}
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-white
                        disabled:bg-gray-100 dark:disabled:bg-gray-900
                        disabled:cursor-not-allowed
                        ${multiple ? '' : 'pr-10'}
                        ${multiple ? 'min-h-[120px]' : ''}
                        ${error
                            ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                        }
                        focus:ring-2 focus:border-transparent
                    `}
                >
                    {!multiple && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {!multiple && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
            </div>

            {multiple && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples opciones
                </p>
            )}

            {error && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {helper && !error && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
            )}
        </div>
    );
};

export default Select;
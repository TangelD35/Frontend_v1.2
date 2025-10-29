import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ValidatedInput = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
    icon: Icon,
    ...props
}) => {
    const hasError = error && touched;
    const isValid = touched && value && !error;

    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                )}

                <input
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${Icon ? 'pl-10' : ''}
                        ${hasError
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : isValid
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
                        dark:bg-gray-800 dark:text-white
                    `}
                    {...props}
                />

                {/* Indicador de validación */}
                {touched && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {hasError ? (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : isValid ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : null}
                    </div>
                )}
            </div>

            {hasError && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default ValidatedInput;
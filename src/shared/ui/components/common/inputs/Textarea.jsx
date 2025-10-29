import { AlertCircle } from 'lucide-react';

const Textarea = ({
    label,
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    rows = 4,
    maxLength = null,
    helper = '',
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                </label>
            )}

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={`
                    w-full px-4 py-3 border rounded-lg transition-colors resize-none
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    disabled:bg-gray-100 dark:disabled:bg-gray-900
                    disabled:cursor-not-allowed
                    ${error
                        ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                    }
                    focus:ring-2 focus:border-transparent
                `}
                {...props}
            />

            <div className="flex items-center justify-between mt-2">
                <div className="flex-1">
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {helper && !error && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{helper}</p>
                    )}
                </div>

                {maxLength && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {value?.length || 0}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Textarea;
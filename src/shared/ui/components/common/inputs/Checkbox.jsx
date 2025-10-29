const Checkbox = ({
    label,
    name,
    checked,
    onChange,
    disabled = false,
    helper = '',
    className = '',
}) => {
    return (
        <div className={`flex items-start ${className}`}>
            <div className="flex items-center h-5">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 dark:text-blue-500 
                             bg-white dark:bg-gray-800
                             border-gray-300 dark:border-gray-600 
                             rounded 
                             focus:ring-blue-500 dark:focus:ring-blue-400 
                             focus:ring-2 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors"
                />
            </div>
            {label && (
                <div className="ml-3">
                    <label
                        htmlFor={name}
                        className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                    >
                        {label}
                    </label>
                    {helper && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {helper}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Checkbox;
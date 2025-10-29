const Input = ({ label, error, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <input
                className="w-full px-4 py-3 border rounded-lg transition-colors
                 bg-white dark:bg-gray-800 
                 border-gray-300 dark:border-gray-600
                 text-gray-900 dark:text-white
                 placeholder-gray-400 dark:placeholder-gray-500
                 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                 focus:border-transparent"
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};

export default Input;
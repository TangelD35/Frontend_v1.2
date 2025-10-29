const LoadingSpinner = ({ size = 'medium', text = '', className = '' }) => {
    const sizes = {
        small: 'w-4 h-4 border-2',
        medium: 'w-8 h-8 border-4',
        large: 'w-12 h-12 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`${sizes[size]} border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}
            />
            {text && (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
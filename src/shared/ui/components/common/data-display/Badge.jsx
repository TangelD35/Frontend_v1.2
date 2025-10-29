const Badge = ({
    children,
    variant = 'default',
    size = 'medium',
    className = ''
}) => {
    const variants = {
        default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        info: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    };

    const sizes = {
        small: 'text-xs px-2 py-0.5',
        medium: 'text-sm px-3 py-1',
        large: 'text-base px-4 py-1.5',
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
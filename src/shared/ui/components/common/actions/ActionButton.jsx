const ActionButton = ({
    children,
    variant = 'primary',
    size = 'medium',
    icon: Icon = null,
    onClick = () => { },
    disabled = false,
    loading = false,
    className = '',
    type = 'button',
}) => {
    const variants = {
        primary:
            'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-300',
        secondary:
            'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:disabled:bg-gray-800',
        success:
            'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 dark:bg-green-500 dark:hover:bg-green-600',
        danger:
            'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 dark:bg-red-500 dark:hover:bg-red-600',
        outline:
            'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
    };

    const sizes = {
        small: 'px-3 py-2 sm:px-3 sm:py-1.5 text-sm min-h-[44px] sm:min-h-[36px]',
        medium: 'px-4 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-base min-h-[44px] sm:min-h-[40px]',
        large: 'px-6 py-3 sm:px-6 sm:py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[44px]',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg transition-all duration-300
        disabled:cursor-not-allowed disabled:opacity-50
        active:scale-95 touch-manipulation
        ${variants[variant]} ${sizes[size]} ${className}
      `}
        >
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cargando...
                </>
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5" />}
                    {children}
                </>
            )}
        </button>
    );
};

export default ActionButton;
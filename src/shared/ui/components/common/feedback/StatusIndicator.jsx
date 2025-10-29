const StatusIndicator = ({
    status = 'active',
    label = '',
    showLabel = true,
    size = 'medium',
    pulse = false
}) => {
    const statusConfig = {
        active: {
            color: 'bg-green-500 dark:bg-green-400',
            text: 'Activo',
            textColor: 'text-green-700 dark:text-green-300'
        },
        inactive: {
            color: 'bg-gray-400 dark:bg-gray-500',
            text: 'Inactivo',
            textColor: 'text-gray-700 dark:text-gray-300'
        },
        pending: {
            color: 'bg-yellow-500 dark:bg-yellow-400',
            text: 'Pendiente',
            textColor: 'text-yellow-700 dark:text-yellow-300'
        },
        error: {
            color: 'bg-red-500 dark:bg-red-400',
            text: 'Error',
            textColor: 'text-red-700 dark:text-red-300'
        },
        warning: {
            color: 'bg-orange-500 dark:bg-orange-400',
            text: 'Advertencia',
            textColor: 'text-orange-700 dark:text-orange-300'
        },
    };

    const sizes = {
        small: 'w-2 h-2',
        medium: 'w-3 h-3',
        large: 'w-4 h-4',
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
        <div className="inline-flex items-center gap-2">
            <div className={`${sizes[size]} ${config.color} rounded-full ${pulse ? 'animate-pulse' : ''}`} />
            {showLabel && (
                <span className={`text-sm font-medium ${config.textColor}`}>
                    {label || config.text}
                </span>
            )}
        </div>
    );
};

export default StatusIndicator;
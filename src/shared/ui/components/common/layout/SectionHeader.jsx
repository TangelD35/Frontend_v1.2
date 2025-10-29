const SectionHeader = ({
    title,
    description = '',
    action = null,
    icon: Icon = null,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition-colors">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

export default SectionHeader;
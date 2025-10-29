import { Inbox } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Inbox,
    title = 'No hay datos',
    description = 'No se encontraron elementos para mostrar',
    action = null,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
};

export default EmptyState;
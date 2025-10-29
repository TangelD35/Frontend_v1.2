import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const CardView = ({
    data,
    onView,
    onEdit,
    onDelete,
    renderCard,
    className = "",
    columns = 3
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const handleAction = (action, item, event) => {
        event.stopPropagation();
        setActiveDropdown(null);

        switch (action) {
            case 'view':
                onView?.(item);
                break;
            case 'edit':
                onEdit?.(item);
                break;
            case 'delete':
                onDelete?.(item);
                break;
        }
    };

    const getGridCols = () => {
        switch (columns) {
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    return (
        <div className={`grid ${getGridCols()} gap-6 ${className}`}>
            {data.map((item) => (
                <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => onView?.(item)}
                >
                    {/* Contenido personalizado de la tarjeta */}
                    <div className="p-6">
                        {renderCard ? renderCard(item) : (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                    {item.name || item.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {item.description || 'Sin descripción'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Menú de acciones */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === item.id ? null : item.id);
                                }}
                                className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>

                            {activeDropdown === item.id && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                                    {onView && (
                                        <button
                                            onClick={(e) => handleAction('view', item, e)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            Ver detalles
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            onClick={(e) => handleAction('edit', item, e)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                            Editar
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => handleAction('delete', item, e)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CardView;
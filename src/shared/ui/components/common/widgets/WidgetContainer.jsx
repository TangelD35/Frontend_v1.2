import { useState, useRef } from 'react';
import {
    GripVertical,
    X,
    Maximize2,
    Minimize2,
    Settings,
    RefreshCw
} from 'lucide-react';

const WidgetContainer = ({
    id,
    title,
    children,
    onRemove,
    onRefresh,
    onSettings,
    className = '',
    style = {}
}) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);

    const handleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const handleRefresh = async () => {
        if (onRefresh) {
            setIsLoading(true);
            try {
                await onRefresh();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const containerStyle = isMaximized ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        ...style
    } : style;

    const actionButtonBase = 'inline-flex items-center justify-center rounded-full p-2 text-gray-500 transition-all duration-200 hover:text-blue-600 hover:bg-blue-50/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none';

    const cardClasses = `relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm transition-all duration-300 transform-gpu ${
        isMaximized
            ? 'shadow-2xl ring-1 ring-blue-200/60 dark:ring-blue-500/40'
            : 'shadow-lg hover:-translate-y-1 hover:shadow-2xl'
    }`;

    return (
        <div
            ref={containerRef}
            className={`widget-container ${className} ${isMaximized ? 'z-[1000]' : ''}`}
            style={containerStyle}
        >
            <div className={cardClasses}>
                {/* Header */}
                <div className="widget-drag-handle flex items-center justify-between px-5 py-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm border-b border-white/60 dark:border-white/5 cursor-move">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                            <GripVertical className="w-4 h-4" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                                {title}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Arrastra para reordenar
                            </span>
                        </div>
                        {isLoading && (
                            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className={`${actionButtonBase} ${isLoading ? 'cursor-wait' : ''}`}
                                title="Actualizar"
                                aria-label="Actualizar widget"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
                            </button>
                        )}

                        {onSettings && (
                            <button
                                type="button"
                                onClick={onSettings}
                                className={actionButtonBase}
                                title="Configuración"
                                aria-label="Configurar widget"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleMaximize}
                            className={actionButtonBase}
                            title={isMaximized ? 'Minimizar' : 'Maximizar'}
                            aria-label={isMaximized ? 'Minimizar widget' : 'Maximizar widget'}
                            aria-pressed={isMaximized}
                        >
                            {isMaximized ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </button>

                        {onRemove && (
                            <button
                                type="button"
                                onClick={() => onRemove(id)}
                                className={`${actionButtonBase} hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-500/10`}
                                title="Eliminar widget"
                                aria-label="Eliminar widget"
                            >
                                <X className="w-4 h-4 text-red-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto px-5 py-5 bg-gradient-to-b from-white/60 via-white/30 to-white/20 dark:from-gray-900/30 dark:via-gray-900/20 dark:to-gray-900/10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default WidgetContainer;
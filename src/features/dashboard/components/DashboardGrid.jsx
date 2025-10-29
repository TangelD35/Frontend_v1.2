import { useState, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Maximize2, Minimize2 } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardGrid = ({ widgets, onLayoutChange, onWidgetRemove, onWidgetSettings }) => {
    const [layouts, setLayouts] = useState({});
    const [maximizedWidget, setMaximizedWidget] = useState(null);

    const handleLayoutChange = useCallback((layout, layouts) => {
        setLayouts(layouts);
        onLayoutChange?.(layout, layouts);
    }, [onLayoutChange]);

    const handleMaximize = (widgetId) => {
        setMaximizedWidget(widgetId);
    };

    const handleMinimize = () => {
        setMaximizedWidget(null);
    };

    const renderWidget = (widget) => (
        <motion.div
            key={widget.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${maximizedWidget === widget.id ? 'fixed inset-4 z-50' : ''
                }`}
        >
            {/* Widget Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div className="flex items-center gap-2">
                    {widget.icon && <widget.icon className="w-5 h-5 text-blue-600" />}
                    <h3 className="font-semibold text-gray-800 dark:text-white">{widget.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    {maximizedWidget === widget.id ? (
                        <button
                            onClick={handleMinimize}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                            <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleMaximize(widget.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                            <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                    <button
                        onClick={() => onWidgetSettings?.(widget)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                        <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                        onClick={() => onWidgetRemove?.(widget.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                </div>
            </div>

            {/* Widget Content */}
            <div className={`p-4 ${maximizedWidget === widget.id ? 'h-full overflow-auto' : ''}`}>
                {widget.component}
            </div>
        </motion.div>
    );

    if (maximizedWidget) {
        const widget = widgets.find(w => w.id === maximizedWidget);
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={handleMinimize}
                />
                {widget && renderWidget(widget)}
            </AnimatePresence>
        );
    }

    return (
        <div className="w-full">
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                onLayoutChange={handleLayoutChange}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                isDraggable={true}
                isResizable={true}
                margin={[16, 16]}
                containerPadding={[0, 0]}
                useCSSTransforms={true}
            >
                {widgets.map(renderWidget)}
            </ResponsiveGridLayout>
        </div>
    );
};

export default DashboardGrid;
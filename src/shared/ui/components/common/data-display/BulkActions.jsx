import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    Edit,
    Download,
    Archive,
    Copy,
    Send,
    MoreHorizontal,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import { classNames } from '../../../../../lib/utils/componentUtils';

const BulkActions = ({
    selectedCount = 0,
    totalCount = 0,
    onAction,
    actions = [],
    onSelectAll,
    onClearSelection,
    className = '',
    position = 'top' // 'top' | 'bottom' | 'floating'
}) => {
    const [showConfirmation, setShowConfirmation] = useState(null);

    const defaultActions = [
        {
            id: 'delete',
            label: 'Eliminar',
            icon: Trash2,
            variant: 'danger',
            requiresConfirmation: true,
            confirmationMessage: '¿Estás seguro de que quieres eliminar los elementos seleccionados?'
        },
        {
            id: 'export',
            label: 'Exportar',
            icon: Download,
            variant: 'default'
        },
        {
            id: 'archive',
            label: 'Archivar',
            icon: Archive,
            variant: 'default'
        },
        {
            id: 'duplicate',
            label: 'Duplicar',
            icon: Copy,
            variant: 'default'
        }
    ];

    const allActions = actions.length > 0 ? actions : defaultActions;

    const handleAction = (action) => {
        if (action.requiresConfirmation) {
            setShowConfirmation(action);
        } else {
            onAction(action.id);
        }
    };

    const confirmAction = () => {
        if (showConfirmation) {
            onAction(showConfirmation.id);
            setShowConfirmation(null);
        }
    };

    const cancelAction = () => {
        setShowConfirmation(null);
    };

    const getVariantClasses = (variant) => {
        switch (variant) {
            case 'danger':
                return 'text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20';
            case 'primary':
                return 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20';
            case 'success':
                return 'text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20';
            default:
                return 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700';
        }
    };

    if (selectedCount === 0) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
                    className={classNames(
                        'flex items-center justify-between gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg',
                        position === 'floating' && 'fixed bottom-4 left-4 right-4 z-50 shadow-lg',
                        className
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {selectedCount} de {totalCount} elemento(s) seleccionado(s)
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={onSelectAll}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                            >
                                Seleccionar todo
                            </button>
                            <span className="text-blue-400 dark:text-blue-500">•</span>
                            <button
                                onClick={onClearSelection}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                            >
                                Limpiar selección
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {allActions.slice(0, 3).map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => handleAction(action)}
                                    className={classNames(
                                        'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                                        getVariantClasses(action.variant)
                                    )}
                                    title={action.label}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{action.label}</span>
                                </button>
                            );
                        })}

                        {allActions.length > 3 && (
                            <div className="relative group">
                                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>

                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    {allActions.slice(3).map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleAction(action)}
                                                className={classNames(
                                                    'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors first:rounded-t-lg last:rounded-b-lg',
                                                    getVariantClasses(action.variant)
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={cancelAction}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Confirmar acción
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Esta acción no se puede deshacer
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    {showConfirmation.confirmationMessage}
                                </p>

                                <div className="flex items-center gap-3 justify-end">
                                    <button
                                        onClick={cancelAction}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmAction}
                                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        {showConfirmation.label}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default BulkActions;
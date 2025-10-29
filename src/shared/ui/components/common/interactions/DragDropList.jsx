import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, GripHorizontal, Move, Info } from 'lucide-react';
import { useDragAndDrop } from '../../../../../shared/hooks/useDragAndDrop';
import { useDragDropAccessibility } from '../../../../../shared/hooks/useDragDropAccessibility';
import { classNames } from '../../../../../lib/utils/componentUtils';
import {
    dragItemVariants,
    dropZoneVariants,
    dropIndicatorVariants,
    listContainerVariants,
    dragHandleVariants,
    layoutTransition,
} from './dragDropAnimations';

// Componente individual draggable
const DraggableItem = ({
    item,
    index,
    children,
    direction = 'vertical',
    className = '',
    dragHandle = true,
    disabled = false,
    isDragging = false,
    isDraggedOver = false,
    handlers = {},
    keyExtractor,
    ariaAttributes = {},
    isFocused = false,
}) => {
    const GripIcon = direction === 'horizontal' ? GripHorizontal : GripVertical;
    const itemId = keyExtractor ? keyExtractor(item, index) : index;

    return (
        <motion.div
            className={classNames('relative', className)}
            layout
            layoutId={`item-${itemId}`}
            variants={dragItemVariants}
            initial="initial"
            animate={isDraggedOver ? "hover" : "animate"}
            exit="exit"
            whileDrag="drag"
            layoutTransition={layoutTransition}
        >
            <motion.div
                draggable={!disabled}
                className={classNames(
                    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
                    'select-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && 'cursor-move',
                    isFocused && 'ring-2 ring-blue-500 ring-opacity-50'
                )}
                variants={dropZoneVariants}
                initial="initial"
                animate={isDraggedOver ? "hover" : "initial"}
                whileHover={!disabled ? "hover" : "initial"}
                {...handlers}
                {...ariaAttributes}
                onKeyDown={(e) => handlers.onKeyDown?.(e, index)}
                style={{
                    boxShadow: isDragging
                        ? '0 20px 40px rgba(0,0,0,0.15)'
                        : '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                {dragHandle && !disabled && (
                    <motion.div
                        className={classNames(
                            'absolute p-1 cursor-grab active:cursor-grabbing z-10',
                            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                            'rounded hover:bg-gray-100 dark:hover:bg-gray-700',
                            direction === 'horizontal' ? 'top-2 left-2' : 'top-2 right-2'
                        )}
                        variants={dragHandleVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="active"
                        title="Arrastrar para reordenar"
                        aria-label={`Reordenar elemento ${index + 1}`}
                    >
                        <GripIcon className="w-4 h-4" />
                    </motion.div>
                )}

                <div className={dragHandle && !disabled ? 'pr-8' : ''}>
                    {children}
                </div>

                {/* Indicador visual de zona de drop con animación */}
                <AnimatePresence>
                    {isDraggedOver && (
                        <motion.div
                            className="absolute inset-0 border-2 border-dashed border-green-400 rounded-lg pointer-events-none"
                            variants={dropIndicatorVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        />
                    )}
                </AnimatePresence>

                {/* Efecto de brillo durante el arrastre */}
                {isDragging && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </motion.div>
        </motion.div>
    );
};

const DragDropList = ({
    items = [],
    onReorder,
    direction = 'vertical',
    className = '',
    itemClassName = '',
    renderItem,
    keyExtractor = (item, index) => item.id || index,
    disabled = false,
    dragHandle = true,
    spacing = 'gap-4',
    emptyMessage = 'No hay elementos para mostrar',
    animateLayoutChanges = true,
    dropZoneClassName = '',
    showDropIndicator = true,
    allowKeyboardReorder = true,
    showInstructions = true,
    accessibilityOptions = {},
}) => {
    const containerRef = useRef(null);
    const [focusedIndex, setFocusedIndex] = useState(0);

    const {
        items: dragItems,
        draggedItem,
        draggedOverItem,
        isDragging,
        handlers,
        actions,
    } = useDragAndDrop(items, onReorder);

    const {
        handleKeyDown: handleAccessibilityKeyDown,
        announce,
        announcePickup,
        announceDrop,
        getItemAriaAttributes,
        getContainerAriaAttributes,
        getUsageInstructions,
    } = useDragDropAccessibility(items, onReorder, {
        keyboardEnabled: allowKeyboardReorder,
        ...accessibilityOptions,
    });

    // Sincronizar items cuando cambien las props
    useEffect(() => {
        actions.updateItems(items);
    }, [items, actions]);

    const handleReorder = (newItems, fromIndex, toIndex) => {
        if (onReorder) {
            onReorder(newItems, {
                oldIndex: fromIndex,
                newIndex: toIndex,
                item: items[fromIndex]
            });

            // Anunciar el cambio para screen readers
            announceDrop(items[fromIndex], fromIndex, toIndex);
        }
    };

    // Manejar eventos de teclado combinados
    const handleKeyDown = (event, index) => {
        const accessibilityResult = handleAccessibilityKeyDown(event, index);

        if (accessibilityResult.handled) {
            // Actualizar el foco si es necesario
            if (accessibilityResult.newIndex !== index) {
                setFocusedIndex(accessibilityResult.newIndex);
                // Enfocar el nuevo elemento después de un breve delay
                setTimeout(() => {
                    const newElement = containerRef.current?.children[accessibilityResult.newIndex];
                    if (newElement) {
                        newElement.focus();
                    }
                }, 100);
            }
        } else {
            // Manejar navegación básica
            handlers.onKeyDown?.(event, index);
        }
    };

    if (dragItems.length === 0) {
        return (
            <div className={classNames(
                'flex items-center justify-center p-8 text-gray-500 dark:text-gray-400',
                className
            )}>
                <div className="text-center">
                    <Move className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    const containerClass = direction === 'horizontal'
        ? `flex ${spacing}`
        : `flex flex-col ${spacing}`;

    return (
        <>
            {/* Instrucciones de uso para screen readers */}
            {showInstructions && (
                <div
                    id="drag-drop-instructions"
                    className="sr-only"
                    aria-hidden="true"
                >
                    {getUsageInstructions()}
                </div>
            )}

            <motion.div
                ref={containerRef}
                className={classNames(containerClass, className)}
                {...getContainerAriaAttributes()}
                variants={listContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <AnimatePresence mode="popLayout">
                    {dragItems.map((item, index) => {
                        const itemId = keyExtractor(item, index);
                        const isDraggedItem = draggedItem?.index === index;
                        const isDraggedOver = draggedOverItem?.index === index;

                        const itemHandlers = {
                            onDragStart: (e) => {
                                handlers.onDragStart(e, item, index);
                                announcePickup(item, index);
                            },
                            onDragEnd: handlers.onDragEnd,
                            onDragOver: handlers.onDragOver,
                            onDragEnter: (e) => handlers.onDragEnter(e, item, index),
                            onDragLeave: handlers.onDragLeave,
                            onDrop: (e) => handlers.onDrop(e, item, index),
                            onKeyDown: allowKeyboardReorder ? handleKeyDown : undefined,
                            onFocus: () => setFocusedIndex(index),
                        };

                        return (
                            <DraggableItem
                                key={itemId}
                                item={item}
                                index={index}
                                direction={direction}
                                className={classNames(itemClassName)}
                                dragHandle={dragHandle}
                                disabled={disabled}
                                isDragging={isDraggedItem}
                                isDraggedOver={isDraggedOver && showDropIndicator}
                                handlers={itemHandlers}
                                keyExtractor={keyExtractor}
                                ariaAttributes={getItemAriaAttributes(item, index, isDraggedItem)}
                                isFocused={focusedIndex === index}
                            >
                                {renderItem ? renderItem(item, index, isDraggedItem) : (
                                    <div className="p-4">
                                        {typeof item === 'string' ? item : (
                                            <div>
                                                <div className="font-medium">
                                                    {item.title || item.name || `Elemento ${index + 1}`}
                                                </div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </DraggableItem>
                        );
                    })}
                </AnimatePresence>

                {/* Zona de drop global cuando se está arrastrando */}
                <AnimatePresence>
                    {isDragging && showDropIndicator && (
                        <motion.div
                            variants={dropIndicatorVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={classNames(
                                'border-2 border-dashed border-blue-400 rounded-lg p-4',
                                'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                                'flex items-center justify-center text-sm font-medium',
                                dropZoneClassName
                            )}
                            whileHover={{
                                scale: 1.02,
                                borderColor: '#3B82F6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            }}
                        >
                            <motion.div
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Move className="w-4 h-4 mr-2" />
                            </motion.div>
                            Suelta aquí para reordenar
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

// Componente de ejemplo para mostrar uso
const DragDropExample = () => {
    const [items, setItems] = useState([
        { id: '1', title: 'Elemento 1', description: 'Descripción del elemento 1' },
        { id: '2', title: 'Elemento 2', description: 'Descripción del elemento 2' },
        { id: '3', title: 'Elemento 3', description: 'Descripción del elemento 3' },
        { id: '4', title: 'Elemento 4', description: 'Descripción del elemento 4' },
    ]);

    const handleReorder = (newItems, { oldIndex, newIndex, item }) => {
        setItems(newItems);
        console.log(`Moved "${item.title}" from position ${oldIndex} to ${newIndex}`);
    };

    const renderItem = (item, index, isDragging) => (
        <div className={`p-4 transition-all ${isDragging ? 'opacity-50' : ''}`}>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Posición: {index + 1}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Lista Reordenable
            </h2>
            <DragDropList
                items={items}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                className="max-w-md"
            />
        </div>
    );
};

export default DragDropList;
export { DragDropExample, DraggableItem };
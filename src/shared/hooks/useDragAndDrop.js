import { useState, useRef, useCallback } from 'react';

/**
 * Hook personalizado para manejar funcionalidad de drag and drop
 * @param {Array} initialItems - Lista inicial de elementos
 * @param {Function} onReorder - Callback cuando se reordena la lista
 * @returns {Object} Estado y funciones para drag and drop
 */
export const useDragAndDrop = (initialItems = [], onReorder = null) => {
    const [items, setItems] = useState(initialItems);
    const [draggedItem, setDraggedItem] = useState(null);
    const [draggedOverItem, setDraggedOverItem] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const draggedItemRef = useRef(null);
    const draggedOverItemRef = useRef(null);

    const handleDragStart = useCallback((e, item, index) => {
        setDraggedItem({ item, index });
        setIsDragging(true);
        draggedItemRef.current = { item, index };

        // Configurar datos de transferencia para accesibilidad
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ item, index }));

        // Agregar clase visual al elemento arrastrado
        e.target.classList.add('dragging');
    }, []);

    const handleDragEnd = useCallback((e) => {
        setDraggedItem(null);
        setDraggedOverItem(null);
        setIsDragging(false);
        draggedItemRef.current = null;
        draggedOverItemRef.current = null;

        // Remover clase visual
        e.target.classList.remove('dragging');
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDragEnter = useCallback((e, item, index) => {
        e.preventDefault();
        setDraggedOverItem({ item, index });
        draggedOverItemRef.current = { item, index };
    }, []);

    const handleDragLeave = useCallback((e) => {
        // Solo limpiar si realmente salimos del elemento
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDraggedOverItem(null);
        }
    }, []);

    const handleDrop = useCallback((e, targetItem, targetIndex) => {
        e.preventDefault();

        const draggedData = draggedItemRef.current;
        if (!draggedData || draggedData.index === targetIndex) {
            return;
        }

        const newItems = [...items];
        const draggedElement = newItems[draggedData.index];

        // Remover elemento de posición original
        newItems.splice(draggedData.index, 1);

        // Insertar en nueva posición
        const insertIndex = draggedData.index < targetIndex ? targetIndex - 1 : targetIndex;
        newItems.splice(insertIndex, 0, draggedElement);

        setItems(newItems);

        // Llamar callback si existe
        if (onReorder) {
            onReorder(newItems, draggedData.index, insertIndex);
        }
    }, [items, onReorder]);

    // Función para reordenar programáticamente
    const reorderItems = useCallback((fromIndex, toIndex) => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
            fromIndex >= items.length || toIndex >= items.length) {
            return;
        }

        const newItems = [...items];
        const draggedElement = newItems[fromIndex];

        newItems.splice(fromIndex, 1);
        newItems.splice(toIndex, 0, draggedElement);

        setItems(newItems);

        if (onReorder) {
            onReorder(newItems, fromIndex, toIndex);
        }
    }, [items, onReorder]);

    // Función para manejar navegación por teclado
    const handleKeyDown = useCallback((e, index) => {
        if (e.key === 'ArrowUp' && index > 0) {
            e.preventDefault();
            reorderItems(index, index - 1);
        } else if (e.key === 'ArrowDown' && index < items.length - 1) {
            e.preventDefault();
            reorderItems(index, index + 1);
        }
    }, [reorderItems, items.length]);

    // Actualizar items cuando cambie la prop inicial
    const updateItems = useCallback((newItems) => {
        setItems(newItems);
    }, []);

    return {
        items,
        draggedItem,
        draggedOverItem,
        isDragging,
        handlers: {
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
            onDragOver: handleDragOver,
            onDragEnter: handleDragEnter,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            onKeyDown: handleKeyDown,
        },
        actions: {
            reorderItems,
            updateItems,
        },
    };
};

export default useDragAndDrop;
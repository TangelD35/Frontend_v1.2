import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook para manejar accesibilidad en componentes drag and drop
 * @param {Array} items - Lista de elementos
 * @param {Function} onReorder - Función para reordenar elementos
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Funciones y estado para accesibilidad
 */
export const useDragDropAccessibility = (items = [], onReorder, options = {}) => {
    const {
        announceReorder = true,
        announcePickup = true,
        announceDrop = true,
        keyboardEnabled = true,
    } = options;

    const announcementRef = useRef(null);
    const focusedIndexRef = useRef(0);

    // Crear elemento para anuncios de screen reader
    useEffect(() => {
        if (!announcementRef.current) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            document.body.appendChild(announcement);
            announcementRef.current = announcement;
        }

        return () => {
            if (announcementRef.current && document.body.contains(announcementRef.current)) {
                document.body.removeChild(announcementRef.current);
            }
        };
    }, []);

    // Función para hacer anuncios
    const announce = useCallback((message) => {
        if (announcementRef.current) {
            announcementRef.current.textContent = message;
            // Limpiar después de un tiempo para permitir nuevos anuncios
            setTimeout(() => {
                if (announcementRef.current) {
                    announcementRef.current.textContent = '';
                }
            }, 1000);
        }
    }, []);

    // Obtener descripción del elemento
    const getItemDescription = useCallback((item, index) => {
        if (typeof item === 'string') {
            return item;
        }

        if (item.title) return item.title;
        if (item.name) return item.name;
        if (item.label) return item.label;

        return `Elemento ${index + 1}`;
    }, []);

    // Manejar navegación por teclado
    const handleKeyDown = useCallback((event, currentIndex) => {
        if (!keyboardEnabled) return;

        const { key, ctrlKey, altKey, shiftKey } = event;
        let handled = false;
        let newIndex = currentIndex;

        switch (key) {
            case 'ArrowUp':
                if (altKey || ctrlKey) {
                    // Mover elemento hacia arriba
                    if (currentIndex > 0) {
                        newIndex = currentIndex - 1;
                        if (onReorder) {
                            const newItems = [...items];
                            const item = newItems[currentIndex];
                            newItems.splice(currentIndex, 1);
                            newItems.splice(newIndex, 0, item);
                            onReorder(newItems, { oldIndex: currentIndex, newIndex, item });

                            if (announceReorder) {
                                announce(`${getItemDescription(item, currentIndex)} movido a la posición ${newIndex + 1}`);
                            }
                        }
                    }
                    handled = true;
                } else {
                    // Navegar hacia arriba
                    if (currentIndex > 0) {
                        focusedIndexRef.current = currentIndex - 1;
                        // El foco se manejará en el componente
                    }
                    handled = true;
                }
                break;

            case 'ArrowDown':
                if (altKey || ctrlKey) {
                    // Mover elemento hacia abajo
                    if (currentIndex < items.length - 1) {
                        newIndex = currentIndex + 1;
                        if (onReorder) {
                            const newItems = [...items];
                            const item = newItems[currentIndex];
                            newItems.splice(currentIndex, 1);
                            newItems.splice(newIndex, 0, item);
                            onReorder(newItems, { oldIndex: currentIndex, newIndex, item });

                            if (announceReorder) {
                                announce(`${getItemDescription(item, currentIndex)} movido a la posición ${newIndex + 1}`);
                            }
                        }
                    }
                    handled = true;
                } else {
                    // Navegar hacia abajo
                    if (currentIndex < items.length - 1) {
                        focusedIndexRef.current = currentIndex + 1;
                    }
                    handled = true;
                }
                break;

            case 'Home':
                if (altKey || ctrlKey) {
                    // Mover elemento al inicio
                    if (currentIndex > 0) {
                        newIndex = 0;
                        if (onReorder) {
                            const newItems = [...items];
                            const item = newItems[currentIndex];
                            newItems.splice(currentIndex, 1);
                            newItems.unshift(item);
                            onReorder(newItems, { oldIndex: currentIndex, newIndex, item });

                            if (announceReorder) {
                                announce(`${getItemDescription(item, currentIndex)} movido al inicio de la lista`);
                            }
                        }
                    }
                    handled = true;
                } else {
                    // Ir al primer elemento
                    focusedIndexRef.current = 0;
                    handled = true;
                }
                break;

            case 'End':
                if (altKey || ctrlKey) {
                    // Mover elemento al final
                    if (currentIndex < items.length - 1) {
                        newIndex = items.length - 1;
                        if (onReorder) {
                            const newItems = [...items];
                            const item = newItems[currentIndex];
                            newItems.splice(currentIndex, 1);
                            newItems.push(item);
                            onReorder(newItems, { oldIndex: currentIndex, newIndex, item });

                            if (announceReorder) {
                                announce(`${getItemDescription(item, currentIndex)} movido al final de la lista`);
                            }
                        }
                    }
                    handled = true;
                } else {
                    // Ir al último elemento
                    focusedIndexRef.current = items.length - 1;
                    handled = true;
                }
                break;

            case ' ':
            case 'Enter':
                if (shiftKey) {
                    // Activar modo de reordenamiento
                    announce(`${getItemDescription(items[currentIndex], currentIndex)} seleccionado para reordenar. Use las flechas con Ctrl para mover.`);
                    handled = true;
                }
                break;

            case 'Escape':
                // Cancelar operación
                announce('Operación de reordenamiento cancelada');
                handled = true;
                break;

            default:
                break;
        }

        if (handled) {
            event.preventDefault();
            event.stopPropagation();
        }

        return { handled, newIndex: focusedIndexRef.current };
    }, [items, onReorder, keyboardEnabled, announce, getItemDescription, announceReorder]);

    // Anunciar cuando se recoge un elemento
    const announcePickupAction = useCallback((item, index) => {
        if (announcePickup) {
            announce(`${getItemDescription(item, index)} recogido para reordenar`);
        }
    }, [announce, getItemDescription, announcePickup]);

    // Anunciar cuando se suelta un elemento
    const announceDropAction = useCallback((item, oldIndex, newIndex) => {
        if (announceDrop) {
            if (oldIndex === newIndex) {
                announce(`${getItemDescription(item, oldIndex)} soltado en la misma posición`);
            } else {
                announce(`${getItemDescription(item, oldIndex)} movido de la posición ${oldIndex + 1} a la posición ${newIndex + 1}`);
            }
        }
    }, [announce, getItemDescription, announceDrop]);

    // Obtener instrucciones de uso
    const getUsageInstructions = useCallback(() => {
        return 'Use las flechas para navegar, Ctrl+flechas para reordenar, Home/End para ir al inicio/final, Ctrl+Home/End para mover al inicio/final';
    }, []);

    // Obtener atributos ARIA para un elemento
    const getItemAriaAttributes = useCallback((item, index, isDragging = false) => {
        const description = getItemDescription(item, index);

        return {
            'aria-label': `${description}, posición ${index + 1} de ${items.length}`,
            'aria-describedby': 'drag-drop-instructions',
            'aria-grabbed': isDragging,
            'aria-dropeffect': isDragging ? 'move' : 'none',
            'role': 'listitem',
            'tabIndex': 0,
        };
    }, [items.length, getItemDescription]);

    // Obtener atributos ARIA para el contenedor
    const getContainerAriaAttributes = useCallback(() => {
        return {
            'role': 'list',
            'aria-label': `Lista reordenable con ${items.length} elementos`,
            'aria-describedby': 'drag-drop-instructions',
        };
    }, [items.length]);

    return {
        handleKeyDown,
        announce,
        announcePickup: announcePickupAction,
        announceDrop: announceDropAction,
        getItemDescription,
        getUsageInstructions,
        getItemAriaAttributes,
        getContainerAriaAttributes,
        focusedIndex: focusedIndexRef.current,
    };
};

export default useDragDropAccessibility;
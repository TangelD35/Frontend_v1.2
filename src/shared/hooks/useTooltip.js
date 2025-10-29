import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook personalizado para manejar tooltips con posicionamiento inteligente
 * @param {Object} options - Configuración del tooltip
 * @returns {Object} Estado y funciones para tooltip
 */
export const useTooltip = ({
    delay = 300,
    hideDelay = 100,
    placement = 'top',
    trigger = 'hover',
    offset = 8,
} = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [actualPlacement, setActualPlacement] = useState(placement);

    const targetRef = useRef(null);
    const tooltipRef = useRef(null);
    const showTimeoutRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Calcular posición óptima del tooltip
    const calculatePosition = useCallback((targetElement, tooltipElement, preferredPlacement) => {
        if (!targetElement || !tooltipElement) return { x: 0, y: 0, placement: preferredPlacement };

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        const positions = {
            top: {
                x: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
                y: targetRect.top - tooltipRect.height - offset,
            },
            bottom: {
                x: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
                y: targetRect.bottom + offset,
            },
            left: {
                x: targetRect.left - tooltipRect.width - offset,
                y: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
            },
            right: {
                x: targetRect.right + offset,
                y: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
            },
        };

        // Verificar si la posición preferida cabe en el viewport
        const preferredPos = positions[preferredPlacement];
        const fitsInViewport = {
            top: preferredPos.y >= 0,
            bottom: preferredPos.y + tooltipRect.height <= viewport.height,
            left: preferredPos.x >= 0,
            right: preferredPos.x + tooltipRect.width <= viewport.width,
        };

        // Si la posición preferida cabe, usarla
        if (fitsInViewport.top && fitsInViewport.bottom && fitsInViewport.left && fitsInViewport.right) {
            return { ...preferredPos, placement: preferredPlacement };
        }

        // Buscar la mejor posición alternativa
        const placements = ['top', 'bottom', 'left', 'right'];
        for (const placement of placements) {
            const pos = positions[placement];
            const fits = {
                vertical: pos.y >= 0 && pos.y + tooltipRect.height <= viewport.height,
                horizontal: pos.x >= 0 && pos.x + tooltipRect.width <= viewport.width,
            };

            if (fits.vertical && fits.horizontal) {
                return { ...pos, placement };
            }
        }

        // Si ninguna posición cabe perfectamente, usar la preferida con ajustes
        let finalPos = { ...preferredPos };

        // Ajustar horizontalmente
        if (finalPos.x < 0) {
            finalPos.x = 8;
        } else if (finalPos.x + tooltipRect.width > viewport.width) {
            finalPos.x = viewport.width - tooltipRect.width - 8;
        }

        // Ajustar verticalmente
        if (finalPos.y < 0) {
            finalPos.y = 8;
        } else if (finalPos.y + tooltipRect.height > viewport.height) {
            finalPos.y = viewport.height - tooltipRect.height - 8;
        }

        return { ...finalPos, placement: preferredPlacement };
    }, [offset]);

    // Mostrar tooltip
    const show = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        if (!isVisible) {
            showTimeoutRef.current = setTimeout(() => {
                setIsVisible(true);

                // Calcular posición después de que el tooltip sea visible
                setTimeout(() => {
                    if (targetRef.current && tooltipRef.current) {
                        const { x, y, placement: newPlacement } = calculatePosition(
                            targetRef.current,
                            tooltipRef.current,
                            placement
                        );
                        setPosition({ x, y });
                        setActualPlacement(newPlacement);
                    }
                }, 0);
            }, delay);
        }
    }, [isVisible, delay, calculatePosition, placement]);

    // Ocultar tooltip
    const hide = useCallback(() => {
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }

        if (isVisible) {
            hideTimeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, hideDelay);
        }
    }, [isVisible, hideDelay]);

    // Toggle tooltip (para trigger click)
    const toggle = useCallback(() => {
        if (isVisible) {
            hide();
        } else {
            show();
        }
    }, [isVisible, show, hide]);

    // Handlers para diferentes triggers
    const getHandlers = useCallback(() => {
        const handlers = {};

        if (trigger === 'hover') {
            handlers.onMouseEnter = show;
            handlers.onMouseLeave = hide;
            handlers.onFocus = show;
            handlers.onBlur = hide;
        } else if (trigger === 'click') {
            handlers.onClick = toggle;
        } else if (trigger === 'focus') {
            handlers.onFocus = show;
            handlers.onBlur = hide;
        }

        return handlers;
    }, [trigger, show, hide, toggle]);

    // Limpiar timeouts al desmontar
    useEffect(() => {
        return () => {
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    // Recalcular posición cuando cambie el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => {
            if (isVisible && targetRef.current && tooltipRef.current) {
                const { x, y, placement: newPlacement } = calculatePosition(
                    targetRef.current,
                    tooltipRef.current,
                    placement
                );
                setPosition({ x, y });
                setActualPlacement(newPlacement);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isVisible, calculatePosition, placement]);

    return {
        isVisible,
        position,
        actualPlacement,
        targetRef,
        tooltipRef,
        handlers: getHandlers(),
        actions: {
            show,
            hide,
            toggle,
        },
    };
};

export default useTooltip;
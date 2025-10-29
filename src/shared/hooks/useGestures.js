import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para manejar gestos táctiles
 */
export const useGestures = (element, options = {}) => {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        onPinch,
        onTap,
        onDoubleTap,
        onLongPress,
        threshold = 50,
        timeThreshold = 500,
        longPressDelay = 500,
        pinchThreshold = 10,
    } = options;

    const [isTouch, setIsTouch] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [lastTap, setLastTap] = useState(0);
    const [longPressTimer, setLongPressTimer] = useState(null);
    const [initialDistance, setInitialDistance] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);

    const elementRef = useRef(element);

    // Actualizar referencia del elemento
    useEffect(() => {
        elementRef.current = element;
    }, [element]);

    // Detectar si es dispositivo táctil
    useEffect(() => {
        const checkTouch = () => {
            setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };

        checkTouch();
        window.addEventListener('resize', checkTouch);
        return () => window.removeEventListener('resize', checkTouch);
    }, []);

    // Calcular distancia entre dos puntos táctiles
    const getDistance = useCallback((touch1, touch2) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Manejar inicio de toque
    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        const now = Date.now();

        setTouchStart({
            x: touch.clientX,
            y: touch.clientY,
            time: now
        });

        // Detectar doble tap
        if (now - lastTap < 300) {
            onDoubleTap?.(e);
            setLastTap(0);
        } else {
            setLastTap(now);
        }

        // Configurar long press
        if (onLongPress) {
            const timer = setTimeout(() => {
                onLongPress(e);
            }, longPressDelay);
            setLongPressTimer(timer);
        }

        // Manejar pinch (dos dedos)
        if (e.touches.length === 2) {
            const distance = getDistance(e.touches[0], e.touches[1]);
            setInitialDistance(distance);
        }
    }, [lastTap, onDoubleTap, onLongPress, longPressDelay, getDistance]);

    // Manejar movimiento de toque
    const handleTouchMove = useCallback((e) => {
        // Cancelar long press si hay movimiento
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        // Manejar pinch
        if (e.touches.length === 2 && initialDistance > 0) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;

            if (Math.abs(scale - currentScale) > pinchThreshold / 100) {
                setCurrentScale(scale);
                onPinch?.(scale, e);
            }
        }

        const touch = e.touches[0];
        setTouchEnd({
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        });
    }, [longPressTimer, initialDistance, currentScale, pinchThreshold, getDistance, onPinch]);

    // Manejar fin de toque
    const handleTouchEnd = useCallback((e) => {
        // Cancelar long press
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        if (!touchStart || !touchEnd) return;

        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = touchEnd.y - touchStart.y;
        const deltaTime = touchEnd.time - touchStart.time;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Verificar si es un tap (movimiento mínimo)
        if (distance < 10 && deltaTime < 200) {
            onTap?.(e);
            return;
        }

        // Verificar si es un swipe válido
        if (distance > threshold && deltaTime < timeThreshold) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absX > absY) {
                // Swipe horizontal
                if (deltaX > 0) {
                    onSwipeRight?.(e, { deltaX, deltaY, distance, deltaTime });
                } else {
                    onSwipeLeft?.(e, { deltaX, deltaY, distance, deltaTime });
                }
            } else {
                // Swipe vertical
                if (deltaY > 0) {
                    onSwipeDown?.(e, { deltaX, deltaY, distance, deltaTime });
                } else {
                    onSwipeUp?.(e, { deltaX, deltaY, distance, deltaTime });
                }
            }
        }

        // Reset
        setTouchStart(null);
        setTouchEnd(null);
        setInitialDistance(0);
        setCurrentScale(1);
    }, [
        touchStart,
        touchEnd,
        longPressTimer,
        threshold,
        timeThreshold,
        onTap,
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown
    ]);

    // Configurar event listeners
    useEffect(() => {
        const el = elementRef.current;
        if (!el || !isTouch) return;

        const options = { passive: false };

        el.addEventListener('touchstart', handleTouchStart, options);
        el.addEventListener('touchmove', handleTouchMove, options);
        el.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            el.removeEventListener('touchstart', handleTouchStart, options);
            el.removeEventListener('touchmove', handleTouchMove, options);
            el.removeEventListener('touchend', handleTouchEnd, options);
        };
    }, [isTouch, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        isTouch,
        touchStart,
        touchEnd,
        currentScale,
    };
};

/**
 * Hook para swipe en listas/carruseles
 */
export const useSwipeNavigation = (itemCount, options = {}) => {
    const {
        initialIndex = 0,
        loop = false,
        onIndexChange,
        threshold = 50,
    } = options;

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const containerRef = useRef(null);

    const goToIndex = useCallback((index) => {
        let newIndex = index;

        if (loop) {
            if (newIndex < 0) newIndex = itemCount - 1;
            if (newIndex >= itemCount) newIndex = 0;
        } else {
            newIndex = Math.max(0, Math.min(itemCount - 1, newIndex));
        }

        setCurrentIndex(newIndex);
        onIndexChange?.(newIndex);
    }, [itemCount, loop, onIndexChange]);

    const goNext = useCallback(() => {
        goToIndex(currentIndex + 1);
    }, [currentIndex, goToIndex]);

    const goPrevious = useCallback(() => {
        goToIndex(currentIndex - 1);
    }, [currentIndex, goToIndex]);

    useGestures(containerRef.current, {
        onSwipeLeft: () => goNext(),
        onSwipeRight: () => goPrevious(),
        threshold,
    });

    return {
        currentIndex,
        containerRef,
        goToIndex,
        goNext,
        goPrevious,
    };
};

/**
 * Hook para pull-to-refresh
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
    const {
        threshold = 80,
        resistance = 2.5,
        snapBackDuration = 300,
    } = options;

    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef(null);
    const startY = useRef(0);

    const handleTouchStart = useCallback((e) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isPulling || window.scrollY > 0) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY.current;

        if (deltaY > 0) {
            e.preventDefault();
            const distance = Math.min(deltaY / resistance, threshold * 1.5);
            setPullDistance(distance);
        }
    }, [isPulling, resistance, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        setIsPulling(false);

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        // Animación de regreso
        setPullDistance(0);
    }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const options = { passive: false };

        el.addEventListener('touchstart', handleTouchStart, options);
        el.addEventListener('touchmove', handleTouchMove, options);
        el.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            el.removeEventListener('touchstart', handleTouchStart, options);
            el.removeEventListener('touchmove', handleTouchMove, options);
            el.removeEventListener('touchend', handleTouchEnd, options);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        isPulling,
        pullDistance,
        isRefreshing,
        progress: Math.min(pullDistance / threshold, 1),
    };
};

export default useGestures;
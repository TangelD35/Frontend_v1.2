import React from 'react';

/**
 * Utilidades para optimización de rendimiento en componentes avanzados
 */

// ===== LAZY LOADING UTILITIES =====

// Lazy loading para componentes grandes
export const createLazyComponent = (importFunc, fallback = null) => {
    const LazyComponent = React.lazy(importFunc);

    return React.forwardRef((props, ref) =>
        React.createElement(React.Suspense,
            { fallback: fallback || React.createElement(ComponentSkeleton) },
            React.createElement(LazyComponent, { ...props, ref })
        )
    );
};

// Skeleton loader genérico
export const ComponentSkeleton = ({
    lines = 3,
    height = 'h-4',
    className = ''
}) =>
    React.createElement('div',
        { className: `animate-pulse space-y-3 ${className}` },
        Array.from({ length: lines }).map((_, index) =>
            React.createElement('div', {
                key: index,
                className: `bg-gray-200 dark:bg-gray-700 rounded ${height} ${index === lines - 1 ? 'w-3/4' : 'w-full'
                    }`
            })
        )
    );

// ===== MEMOIZATION UTILITIES =====

// Memoización profunda para objetos complejos
export const useDeepMemo = (factory, deps) => {
    const ref = React.useRef();
    const signalRef = React.useRef(0);

    if (!ref.current || !areDeepEqual(ref.current.deps, deps)) {
        ref.current = {
            deps: deps,
            result: factory()
        };
        signalRef.current += 1;
    }

    return React.useMemo(() => ref.current.result, [signalRef.current]);
};

// Comparación profunda optimizada
const areDeepEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        return a.every((item, index) => areDeepEqual(item, b[index]));
    }

    if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => areDeepEqual(a[key], b[key]));
    }

    return false;
};

// Hook para memoización de callbacks costosos
export const useStableCallback = (callback, deps) => {
    const callbackRef = React.useRef(callback);
    const depsRef = React.useRef(deps);

    if (!areDeepEqual(depsRef.current, deps)) {
        callbackRef.current = callback;
        depsRef.current = deps;
    }

    return React.useCallback(callbackRef.current, []);
};

// ===== DEBOUNCING & THROTTLING =====

// Hook para debouncing
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook para throttling
export const useThrottle = (value, limit) => {
    const [throttledValue, setThrottledValue] = React.useState(value);
    const lastRan = React.useRef(Date.now());

    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
};

// Función de debounce para callbacks
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

// Función de throttle para callbacks
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ===== VIRTUALIZATION UTILITIES =====

// Hook para virtualización de listas
export const useVirtualization = (items, containerHeight, itemHeight) => {
    const [scrollTop, setScrollTop] = React.useState(0);

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

    const visibleItems = React.useMemo(() =>
        items.slice(startIndex, endIndex).map((item, index) => ({
            ...item,
            index: startIndex + index,
            top: (startIndex + index) * itemHeight
        }))
        , [items, startIndex, endIndex, itemHeight]);

    const totalHeight = items.length * itemHeight;

    return {
        visibleItems,
        totalHeight,
        startIndex,
        endIndex,
        setScrollTop
    };
};

// ===== INTERSECTION OBSERVER =====

// Hook para lazy loading con Intersection Observer
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = React.useState(false);
    const [hasIntersected, setHasIntersected] = React.useState(false);
    const elementRef = React.useRef(null);

    React.useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
            if (entry.isIntersecting && !hasIntersected) {
                setHasIntersected(true);
            }
        }, {
            threshold: 0.1,
            rootMargin: '50px',
            ...options
        });

        observer.observe(element);

        return () => observer.unobserve(element);
    }, [hasIntersected, options]);

    return { elementRef, isIntersecting, hasIntersected };
};

// ===== PERFORMANCE MONITORING =====

// Hook para medir tiempo de renderizado
export const useRenderTime = (componentName) => {
    const renderStart = React.useRef(performance.now());

    React.useEffect(() => {
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart.current;

        if (process.env.NODE_ENV === 'development') {
            console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }

        renderStart.current = performance.now();
    });
};

// Hook para detectar re-renders innecesarios
export const useWhyDidYouUpdate = (name, props) => {
    const previousProps = React.useRef();

    React.useEffect(() => {
        if (previousProps.current) {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changedProps = {};

            allKeys.forEach(key => {
                if (previousProps.current[key] !== props[key]) {
                    changedProps[key] = {
                        from: previousProps.current[key],
                        to: props[key]
                    };
                }
            });

            if (Object.keys(changedProps).length) {
                console.log('[why-did-you-update]', name, changedProps);
            }
        }

        previousProps.current = props;
    });
};

// ===== MEMORY MANAGEMENT =====

// Hook para limpiar recursos automáticamente
export const useCleanup = (cleanupFn) => {
    React.useEffect(() => {
        return cleanupFn;
    }, [cleanupFn]);
};

// Hook para gestión de memoria en listas grandes
export const useMemoryOptimizedList = (items, maxCachedItems = 1000) => {
    const [cachedItems, setCachedItems] = React.useState(new Map());

    const getItem = React.useCallback((index) => {
        if (cachedItems.has(index)) {
            return cachedItems.get(index);
        }

        const item = items[index];
        if (item && cachedItems.size < maxCachedItems) {
            setCachedItems(prev => new Map(prev).set(index, item));
        }

        return item;
    }, [items, cachedItems, maxCachedItems]);

    const clearCache = React.useCallback(() => {
        setCachedItems(new Map());
    }, []);

    return { getItem, clearCache, cacheSize: cachedItems.size };
};

// ===== BUNDLE SIZE OPTIMIZATION =====

// Importación dinámica con cache
const moduleCache = new Map();

export const dynamicImport = async (modulePath) => {
    if (moduleCache.has(modulePath)) {
        return moduleCache.get(modulePath);
    }

    try {
        const module = await import(/* @vite-ignore */ modulePath);
        moduleCache.set(modulePath, module);
        return module;
    } catch (error) {
        console.error(`Failed to load module: ${modulePath}`, error);
        throw error;
    }
};

// Hook para carga condicional de módulos
export const useConditionalImport = (condition, modulePath) => {
    const [module, setModule] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!condition) return;

        setLoading(true);
        setError(null);

        dynamicImport(modulePath)
            .then(setModule)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [condition, modulePath]);

    return { module, loading, error };
};

// ===== IMAGE OPTIMIZATION =====

// Hook para lazy loading de imágenes
export const useLazyImage = (src, placeholder = null) => {
    const [imageSrc, setImageSrc] = React.useState(placeholder);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const { elementRef, isIntersecting } = useIntersectionObserver();

    React.useEffect(() => {
        if (isIntersecting && src) {
            const img = new Image();
            img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
            };
            img.src = src;
        }
    }, [isIntersecting, src]);

    return { elementRef, imageSrc, isLoaded };
};

// ===== PERFORMANCE UTILITIES =====

// Función para medir performance de funciones
export const measurePerformance = (fn, name = 'Function') => {
    return (...args) => {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();

        if (process.env.NODE_ENV === 'development') {
            console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
        }

        return result;
    };
};

// Hook para optimización de scroll
export const useOptimizedScroll = (callback, delay = 16) => {
    const callbackRef = React.useRef(callback);
    const frameRef = React.useRef();

    React.useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const optimizedCallback = React.useCallback(
        throttle((event) => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }

            frameRef.current = requestAnimationFrame(() => {
                callbackRef.current(event);
            });
        }, delay),
        [delay]
    );

    React.useEffect(() => {
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return optimizedCallback;
};

// Exportar utilidades principales
export default {
    createLazyComponent,
    ComponentSkeleton,
    useDeepMemo,
    useStableCallback,
    useDebounce,
    useThrottle,
    debounce,
    throttle,
    useVirtualization,
    useIntersectionObserver,
    useRenderTime,
    useWhyDidYouUpdate,
    useCleanup,
    useMemoryOptimizedList,
    dynamicImport,
    useConditionalImport,
    useLazyImage,
    measurePerformance,
    useOptimizedScroll,
};
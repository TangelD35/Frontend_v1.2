// Configuración de rendimiento para componentes modernos
export const performanceConfig = {
    // Configuración de animaciones
    animations: {
        // Duración base para transiciones
        duration: {
            fast: 150,
            base: 300,
            slow: 500
        },
        // Easing functions
        easing: {
            easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 0.6, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        // Configuración para reduced motion
        reducedMotion: {
            duration: 0.01,
            iterations: 1
        }
    },

    // Configuración de lazy loading
    lazyLoading: {
        // Componentes que deben cargarse de forma diferida
        components: [
            'ModernTable',
            'ModernModal',
            'ToastContainer'
        ],
        // Threshold para intersection observer
        threshold: 0.1,
        // Root margin para precarga
        rootMargin: '50px'
    },

    // Configuración de memoización
    memoization: {
        // Componentes que deben ser memoizados
        memoizedComponents: [
            'GlassCard',
            'GradientBadge',
            'SkeletonLoader'
        ],
        // Dependencias para useMemo
        dependencies: {
            shallow: true,
            deep: false
        }
    },

    // Configuración de virtualización
    virtualization: {
        // Altura estimada de elementos
        itemHeight: 60,
        // Número de elementos a renderizar fuera del viewport
        overscan: 5,
        // Threshold para activar virtualización
        threshold: 100
    },

    // Configuración de debounce
    debounce: {
        // Tiempo de debounce para búsquedas
        search: 300,
        // Tiempo de debounce para resize
        resize: 100,
        // Tiempo de debounce para scroll
        scroll: 16
    },

    // Configuración de notificaciones
    notifications: {
        // Duración por defecto
        defaultDuration: 5000,
        // Máximo número de notificaciones simultáneas
        maxNotifications: 5,
        // Intervalo de limpieza automática
        cleanupInterval: 10000
    },

    // Configuración de temas
    themes: {
        // Transición entre temas
        transitionDuration: 300,
        // Preferencia del sistema
        respectSystemPreference: true,
        // Persistencia en localStorage
        persistInStorage: true
    }
};

// Utilidades de rendimiento
export const performanceUtils = {
    // Verificar si el usuario prefiere movimiento reducido
    prefersReducedMotion: () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Verificar si el dispositivo es móvil
    isMobile: () => {
        return window.innerWidth < 768;
    },

    // Verificar si el dispositivo tiene poca memoria
    isLowEndDevice: () => {
        return navigator.hardwareConcurrency <= 2;
    },

    // Optimizar animaciones según el dispositivo
    getOptimizedAnimationConfig: () => {
        const isLowEnd = performanceUtils.isLowEndDevice();
        const prefersReduced = performanceUtils.prefersReducedMotion();

        if (prefersReduced || isLowEnd) {
            return {
                duration: performanceConfig.animations.reducedMotion.duration,
                iterations: performanceConfig.animations.reducedMotion.iterations
            };
        }

        return performanceConfig.animations;
    },

    // Throttle para eventos de scroll
    throttle: (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce para eventos de input
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

export default performanceConfig;

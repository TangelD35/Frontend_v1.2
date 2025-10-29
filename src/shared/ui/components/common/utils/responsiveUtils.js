import React from 'react';

/**
 * Utilidades para diseño responsivo en componentes avanzados
 */

// Breakpoints consistentes con Tailwind CSS
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

// Hook personalizado para detectar tamaño de pantalla
export const useScreenSize = () => {
    const [screenSize, setScreenSize] = React.useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSize;
};

// Hook para detectar breakpoints específicos
export const useBreakpoint = (breakpoint) => {
    const { width } = useScreenSize();
    return width >= BREAKPOINTS[breakpoint];
};

// Utilidades para clases responsivas
export const getResponsiveClasses = (baseClasses, responsiveClasses = {}) => {
    const { width } = useScreenSize();

    let classes = baseClasses;

    // Aplicar clases responsivas según el tamaño de pantalla
    Object.entries(responsiveClasses).forEach(([breakpoint, breakpointClasses]) => {
        if (width >= BREAKPOINTS[breakpoint]) {
            classes += ` ${breakpointClasses}`;
        }
    });

    return classes;
};

// Configuraciones responsivas para componentes específicos
export const RESPONSIVE_CONFIGS = {
    // AdvancedDataTable
    table: {
        mobile: {
            pageSize: 10,
            showColumns: ['name', 'status'], // Columnas esenciales en móvil
            density: 'compact',
            showFilters: false,
            showColumnToggle: false,
        },
        tablet: {
            pageSize: 25,
            showColumns: null, // Mostrar todas las columnas
            density: 'normal',
            showFilters: true,
            showColumnToggle: true,
        },
        desktop: {
            pageSize: 50,
            showColumns: null,
            density: 'comfortable',
            showFilters: true,
            showColumnToggle: true,
        },
    },

    // MultiStepForm
    form: {
        mobile: {
            showProgress: true,
            showSummary: false,
            animationDirection: 'vertical',
            allowBackNavigation: true,
        },
        tablet: {
            showProgress: true,
            showSummary: true,
            animationDirection: 'horizontal',
            allowBackNavigation: true,
        },
        desktop: {
            showProgress: true,
            showSummary: true,
            animationDirection: 'horizontal',
            allowBackNavigation: true,
        },
    },

    // DragDropList
    dragDrop: {
        mobile: {
            direction: 'vertical',
            showHandle: true,
            touchEnabled: true,
            animation: { duration: 200 },
        },
        tablet: {
            direction: 'vertical',
            showHandle: false,
            touchEnabled: true,
            animation: { duration: 300 },
        },
        desktop: {
            direction: 'horizontal',
            showHandle: false,
            touchEnabled: false,
            animation: { duration: 300 },
        },
    },

    // Tooltip
    tooltip: {
        mobile: {
            placement: 'top',
            trigger: 'click',
            maxWidth: 250,
            interactive: true,
        },
        tablet: {
            placement: 'auto',
            trigger: 'hover',
            maxWidth: 300,
            interactive: false,
        },
        desktop: {
            placement: 'auto',
            trigger: 'hover',
            maxWidth: 400,
            interactive: false,
        },
    },
};

// Función para obtener configuración responsiva
export const getResponsiveConfig = (component, screenWidth = window.innerWidth) => {
    const config = RESPONSIVE_CONFIGS[component];
    if (!config) return {};

    if (screenWidth < BREAKPOINTS.md) {
        return config.mobile || {};
    } else if (screenWidth < BREAKPOINTS.lg) {
        return config.tablet || {};
    } else {
        return config.desktop || {};
    }
};

// Hook para configuración responsiva automática
export const useResponsiveConfig = (component) => {
    const { width } = useScreenSize();
    return React.useMemo(() => getResponsiveConfig(component, width), [component, width]);
};

// Utilidades para grid responsivo
export const getGridColumns = (screenWidth, itemCount, minItemWidth = 250) => {
    const availableWidth = screenWidth - 64; // Considerando padding
    const maxColumns = Math.floor(availableWidth / minItemWidth);
    return Math.min(maxColumns, itemCount);
};

// Hook para grid responsivo
export const useResponsiveGrid = (itemCount, minItemWidth = 250) => {
    const { width } = useScreenSize();
    return React.useMemo(() => getGridColumns(width, itemCount, minItemWidth), [width, itemCount, minItemWidth]);
};

// Utilidades para texto responsivo
export const getResponsiveTextSize = (screenWidth) => {
    if (screenWidth < BREAKPOINTS.sm) {
        return {
            title: 'text-lg',
            subtitle: 'text-base',
            body: 'text-sm',
            caption: 'text-xs',
        };
    } else if (screenWidth < BREAKPOINTS.lg) {
        return {
            title: 'text-xl',
            subtitle: 'text-lg',
            body: 'text-base',
            caption: 'text-sm',
        };
    } else {
        return {
            title: 'text-2xl',
            subtitle: 'text-xl',
            body: 'text-base',
            caption: 'text-sm',
        };
    }
};

// Hook para tamaños de texto responsivos
export const useResponsiveText = () => {
    const { width } = useScreenSize();
    return React.useMemo(() => getResponsiveTextSize(width), [width]);
};

// Utilidades para espaciado responsivo
export const getResponsiveSpacing = (screenWidth) => {
    if (screenWidth < BREAKPOINTS.sm) {
        return {
            container: 'px-4 py-2',
            section: 'mb-4',
            element: 'gap-2',
        };
    } else if (screenWidth < BREAKPOINTS.lg) {
        return {
            container: 'px-6 py-4',
            section: 'mb-6',
            element: 'gap-4',
        };
    } else {
        return {
            container: 'px-8 py-6',
            section: 'mb-8',
            element: 'gap-6',
        };
    }
};

// Hook para espaciado responsivo
export const useResponsiveSpacing = () => {
    const { width } = useScreenSize();
    return React.useMemo(() => getResponsiveSpacing(width), [width]);
};

// Utilidad para detectar dispositivos táctiles
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Hook para detectar dispositivos táctiles
export const useTouchDevice = () => {
    const [isTouch, setIsTouch] = React.useState(false);

    React.useEffect(() => {
        setIsTouch(isTouchDevice());
    }, []);

    return isTouch;
};

// Utilidad para orientación de pantalla
export const useOrientation = () => {
    const [orientation, setOrientation] = React.useState(
        typeof window !== 'undefined' && window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    );

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOrientationChange = () => {
            setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
        };

        window.addEventListener('resize', handleOrientationChange);
        return () => window.removeEventListener('resize', handleOrientationChange);
    }, []);

    return orientation;
};

// Utilidades para media queries en JavaScript
export const mediaQueries = {
    sm: `(min-width: ${BREAKPOINTS.sm}px)`,
    md: `(min-width: ${BREAKPOINTS.md}px)`,
    lg: `(min-width: ${BREAKPOINTS.lg}px)`,
    xl: `(min-width: ${BREAKPOINTS.xl}px)`,
    '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
    mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
    tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
    desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
    touch: '(hover: none) and (pointer: coarse)',
    mouse: '(hover: hover) and (pointer: fine)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    highContrast: '(prefers-contrast: high)',
    darkMode: '(prefers-color-scheme: dark)',
};

// Hook para media queries
export const useMediaQuery = (query) => {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const handleChange = (e) => setMatches(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
};

// Exportar todo como default
export default {
    BREAKPOINTS,
    RESPONSIVE_CONFIGS,
    useScreenSize,
    useBreakpoint,
    getResponsiveClasses,
    getResponsiveConfig,
    useResponsiveConfig,
    getGridColumns,
    useResponsiveGrid,
    getResponsiveTextSize,
    useResponsiveText,
    getResponsiveSpacing,
    useResponsiveSpacing,
    isTouchDevice,
    useTouchDevice,
    useOrientation,
    mediaQueries,
    useMediaQuery,
};
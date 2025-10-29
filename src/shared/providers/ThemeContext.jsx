import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Cargar tema guardado al inicializar
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Detectar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    // Aplicar tema al documento con transición suave
    useEffect(() => {
        const root = window.document.documentElement;

        // Agregar clase de transición
        setIsTransitioning(true);

        // Quita cualquier posible clase previa
        root.classList.remove('dark');
        root.removeAttribute('data-theme');

        // Aplicar el tema usando data-theme attribute
        root.setAttribute('data-theme', theme);

        // Si el tema es oscuro, también agrega la clase dark para compatibilidad con Tailwind
        if (theme === 'dark') {
            root.classList.add('dark');
        }

        // Guardar preferencia
        localStorage.setItem('theme', theme);

        // Remover clase de transición después de completar
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [theme]);

    // Escuchar cambios en la preferencia del sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            // Solo cambiar si no hay preferencia guardada
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setLightTheme = () => {
        setTheme('light');
    };

    const setDarkTheme = () => {
        setTheme('dark');
    };

    const value = {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        isTransitioning
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
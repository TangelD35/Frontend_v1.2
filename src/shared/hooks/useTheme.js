/**
 * useTheme Hook
 * 
 * Custom hook para acceder al contexto de tema de la aplicación.
 * Proporciona acceso al tema actual y funciones para cambiarlo.
 * 
 * @returns {Object} Objeto con propiedades y métodos del tema
 * @property {string} theme - Tema actual ('light' o 'dark')
 * @property {Function} toggleTheme - Alterna entre temas claro y oscuro
 * @property {Function} setLightTheme - Establece el tema claro
 * @property {Function} setDarkTheme - Establece el tema oscuro
 * @property {boolean} isDark - True si el tema actual es oscuro
 * @property {boolean} isLight - True si el tema actual es claro
 * @property {boolean} isTransitioning - True durante la transición de tema
 * 
 * @example
 * const { theme, toggleTheme, isDark } = useTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     {isDark ? 'Modo Claro' : 'Modo Oscuro'}
 *   </button>
 * );
 */

import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeContext';

const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }

    return context;
};

export default useTheme;

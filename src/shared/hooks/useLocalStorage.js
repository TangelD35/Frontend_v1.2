import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
    // Función para obtener el valor inicial
    const getInitialValue = () => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState(getInitialValue);

    // Función para actualizar el valor
    const setValue = (value) => {
        try {
            // Permitir que value sea una función para que tengamos la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Guardar en el estado
            setStoredValue(valueToStore);

            // Guardar en localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Función para remover el valor
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    };

    // Escuchar cambios en localStorage desde otras pestañas/ventanas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error(`Error parsing localStorage value for key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
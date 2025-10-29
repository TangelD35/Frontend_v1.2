import { useState, useEffect } from 'react';

const useViewMode = (defaultMode = 'table', storageKey = 'viewMode') => {
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            return saved || defaultMode;
        }
        return defaultMode;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, viewMode);
        }
    }, [viewMode, storageKey]);

    const toggleViewMode = () => {
        setViewMode(current => current === 'table' ? 'cards' : 'table');
    };

    const setMode = (mode) => {
        if (['table', 'cards'].includes(mode)) {
            setViewMode(mode);
        }
    };

    return {
        viewMode,
        isTableView: viewMode === 'table',
        isCardView: viewMode === 'cards',
        toggleViewMode,
        setMode
    };
};

export default useViewMode;
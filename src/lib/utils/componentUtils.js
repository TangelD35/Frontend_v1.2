/**
 * Utilidades para componentes avanzados
 */

// Generar ID único para componentes
export const generateId = (prefix = 'component') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Combinar clases CSS de forma segura
export const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Debounce para optimizar rendimiento
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle para limitar frecuencia de ejecución
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

// Verificar si un elemento está visible en el viewport
export const isElementInViewport = (element) => {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Obtener posición de scroll de un elemento
export const getScrollPosition = (element = window) => {
    if (element === window) {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop,
        };
    }

    return {
        x: element.scrollLeft,
        y: element.scrollTop,
    };
};

// Formatear números para mostrar en tablas
export const formatNumber = (value, options = {}) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '-';
    }

    const {
        decimals = 0,
        prefix = '',
        suffix = '',
        thousandsSeparator = ',',
    } = options;

    const formatted = Number(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return `${prefix}${formatted.replace(/,/g, thousandsSeparator)}${suffix}`;
};

// Formatear fechas para mostrar en tablas
export const formatDate = (date, format = 'short') => {
    if (!date) return '-';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';

    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        time: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
    };

    return dateObj.toLocaleDateString('es-ES', options[format] || options.short);
};

// Validar email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar teléfono (formato internacional básico)
export const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Escapar HTML para prevenir XSS
export const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Truncar texto con elipsis
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

// Obtener contraste de color para accesibilidad
export const getContrastColor = (hexColor) => {
    // Convertir hex a RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Retornar color de contraste
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Generar colores para gráficos
export const generateChartColors = (count) => {
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1',
    ];

    if (count <= colors.length) {
        return colors.slice(0, count);
    }

    // Generar colores adicionales si se necesitan más
    const additionalColors = [];
    for (let i = colors.length; i < count; i++) {
        const hue = (i * 137.508) % 360; // Golden angle approximation
        additionalColors.push(`hsl(${hue}, 70%, 50%)`);
    }

    return [...colors, ...additionalColors];
};

// Exportar datos a CSV
export const exportToCSV = (data, filename = 'data.csv') => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escapar comillas y envolver en comillas si contiene comas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
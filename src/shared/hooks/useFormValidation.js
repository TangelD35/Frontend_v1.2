import { useState } from 'react';

// Reglas de validación predefinidas
const validationRules = {
    required: (value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0 || 'Este campo es requerido';
        }
        return value !== null && value !== undefined && value !== '' || 'Este campo es requerido';
    },

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Email inválido';
    },

    minLength: (min) => (value) => {
        return value.length >= min || `Debe tener al menos ${min} caracteres`;
    },

    maxLength: (max) => (value) => {
        return value.length <= max || `No puede exceder ${max} caracteres`;
    },

    min: (min) => (value) => {
        return Number(value) >= min || `Debe ser mayor o igual a ${min}`;
    },

    max: (max) => (value) => {
        return Number(value) <= max || `Debe ser menor o igual a ${max}`;
    },

    pattern: (regex, message = 'Formato inválido') => (value) => {
        return regex.test(value) || message;
    },

    number: (value) => {
        return !isNaN(value) || 'Debe ser un número válido';
    },

    integer: (value) => {
        return Number.isInteger(Number(value)) || 'Debe ser un número entero';
    },

    positive: (value) => {
        return Number(value) > 0 || 'Debe ser un número positivo';
    },

    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return 'URL inválida';
        }
    },

    date: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Fecha inválida';
    },

    futureDate: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today || 'La fecha debe ser futura';
    },

    pastDate: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today || 'La fecha debe ser pasada';
    },

    match: (fieldName, fieldLabel) => (value, formData) => {
        return value === formData[fieldName] || `No coincide con ${fieldLabel}`;
    },

    custom: (validationFn, message) => (value, formData) => {
        return validationFn(value, formData) || message;
    },
};

const useFormValidation = (initialValues = {}, validationSchema = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validar un campo específico
    const validateField = (name, value) => {
        const fieldRules = validationSchema[name];

        if (!fieldRules) return '';

        for (const rule of fieldRules) {
            const result = rule(value, values);
            if (result !== true) {
                return result;
            }
        }

        return '';
    };

    // Validar todos los campos
    const validateAll = () => {
        const newErrors = {};

        Object.keys(validationSchema).forEach((name) => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambio de valor
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setValues(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Validar en tiempo real si el campo ya fue tocado
        if (touched[name]) {
            const error = validateField(name, newValue);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    // Manejar blur (cuando el usuario sale del campo)
    const handleBlur = (e) => {
        const { name, value } = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Manejar submit
    const handleSubmit = (onSubmit) => async (e) => {
        e.preventDefault();

        // Marcar todos los campos como tocados
        const allTouched = {};
        Object.keys(validationSchema).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validar todos los campos
        const isValid = validateAll();

        if (!isValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Error en submit:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resetear formulario
    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    };

    // Establecer valores manualmente
    const setFieldValue = (name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Establecer error manualmente
    const setFieldError = (name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    // Establecer múltiples errores (útil para errores del servidor)
    const setServerErrors = (serverErrors) => {
        setErrors(serverErrors);
    };

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
        setServerErrors,
        validateField,
        validateAll,
        isValid: Object.keys(errors).length === 0,
    };
};

// Exportar el hook y las reglas
export { validationRules };
export default useFormValidation;
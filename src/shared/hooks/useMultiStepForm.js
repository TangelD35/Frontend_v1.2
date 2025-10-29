import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para manejar formularios multi-paso
 * @param {Array} steps - Configuración de pasos del formulario
 * @param {Object} initialData - Datos iniciales del formulario
 * @returns {Object} Estado y funciones del formulario multi-paso
 */
export const useMultiStepForm = (steps = [], initialData = {}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState(initialData);
    const [stepErrors, setStepErrors] = useState({});
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Información del paso actual
    const currentStep = useMemo(() => {
        return steps[currentStepIndex] || null;
    }, [steps, currentStepIndex]);

    // Información de progreso
    const progress = useMemo(() => {
        const totalSteps = steps.length;
        const currentStepNumber = currentStepIndex + 1;
        const percentage = totalSteps > 0 ? (currentStepNumber / totalSteps) * 100 : 0;

        return {
            currentStep: currentStepNumber,
            totalSteps,
            percentage,
            isFirstStep: currentStepIndex === 0,
            isLastStep: currentStepIndex === totalSteps - 1,
        };
    }, [steps.length, currentStepIndex]);

    // Validar paso específico
    const validateStep = useCallback(async (stepIndex, data = formData) => {
        const step = steps[stepIndex];
        if (!step || !step.validation) {
            return { isValid: true, errors: {} };
        }

        try {
            // Si es una función de validación personalizada
            if (typeof step.validation === 'function') {
                const result = await step.validation(data);
                return {
                    isValid: result.isValid !== false,
                    errors: result.errors || {},
                };
            }

            // Si es un esquema de validación (Yup, Zod, etc.)
            if (step.validation.validate) {
                await step.validation.validate(data, { abortEarly: false });
                return { isValid: true, errors: {} };
            }

            return { isValid: true, errors: {} };
        } catch (error) {
            // Manejar errores de validación de Yup
            if (error.inner) {
                const errors = {};
                error.inner.forEach(err => {
                    errors[err.path] = err.message;
                });
                return { isValid: false, errors };
            }

            // Manejar otros tipos de errores
            return {
                isValid: false,
                errors: { general: error.message || 'Error de validación' },
            };
        }
    }, [steps, formData]);

    // Actualizar datos del formulario
    const updateFormData = useCallback((updates) => {
        setFormData(prev => ({
            ...prev,
            ...updates,
        }));
    }, []);

    // Actualizar campo específico
    const updateField = useCallback((fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value,
        }));
    }, []);

    // Ir al siguiente paso
    const goToNextStep = useCallback(async () => {
        const validation = await validateStep(currentStepIndex);

        if (validation.isValid) {
            setStepErrors(prev => ({ ...prev, [currentStepIndex]: {} }));
            setCompletedSteps(prev => new Set([...prev, currentStepIndex]));

            if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            }

            return true;
        } else {
            setStepErrors(prev => ({ ...prev, [currentStepIndex]: validation.errors }));
            return false;
        }
    }, [currentStepIndex, steps.length, validateStep]);

    // Ir al paso anterior
    const goToPreviousStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    // Ir a paso específico
    const goToStep = useCallback(async (stepIndex) => {
        if (stepIndex < 0 || stepIndex >= steps.length) {
            return false;
        }

        // Si vamos hacia adelante, validar pasos intermedios
        if (stepIndex > currentStepIndex) {
            for (let i = currentStepIndex; i < stepIndex; i++) {
                const validation = await validateStep(i);
                if (!validation.isValid) {
                    setStepErrors(prev => ({ ...prev, [i]: validation.errors }));
                    return false;
                }
                setCompletedSteps(prev => new Set([...prev, i]));
            }
        }

        setCurrentStepIndex(stepIndex);
        return true;
    }, [currentStepIndex, steps.length, validateStep]);

    // Validar todo el formulario
    const validateAllSteps = useCallback(async () => {
        const allErrors = {};
        let isFormValid = true;

        for (let i = 0; i < steps.length; i++) {
            const validation = await validateStep(i);
            if (!validation.isValid) {
                allErrors[i] = validation.errors;
                isFormValid = false;
            }
        }

        setStepErrors(allErrors);
        return { isValid: isFormValid, errors: allErrors };
    }, [steps.length, validateStep]);

    // Enviar formulario
    const submitForm = useCallback(async (onSubmit) => {
        if (!onSubmit) return false;

        setIsSubmitting(true);

        try {
            const validation = await validateAllSteps();

            if (validation.isValid) {
                const result = await onSubmit(formData);
                setIsSubmitting(false);
                return result;
            } else {
                // Ir al primer paso con errores
                const firstErrorStep = Object.keys(validation.errors)[0];
                if (firstErrorStep !== undefined) {
                    setCurrentStepIndex(parseInt(firstErrorStep));
                }
                setIsSubmitting(false);
                return false;
            }
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            setIsSubmitting(false);
            return false;
        }
    }, [formData, validateAllSteps]);

    // Reset del formulario
    const resetForm = useCallback(() => {
        setCurrentStepIndex(0);
        setFormData(initialData);
        setStepErrors({});
        setCompletedSteps(new Set());
        setIsSubmitting(false);
    }, [initialData]);

    // Obtener errores del paso actual
    const getCurrentStepErrors = useCallback(() => {
        return stepErrors[currentStepIndex] || {};
    }, [stepErrors, currentStepIndex]);

    // Verificar si un paso está completado
    const isStepCompleted = useCallback((stepIndex) => {
        return completedSteps.has(stepIndex);
    }, [completedSteps]);

    // Verificar si se puede navegar a un paso
    const canNavigateToStep = useCallback((stepIndex) => {
        if (stepIndex <= currentStepIndex) return true;

        // Verificar que todos los pasos anteriores estén completados
        for (let i = 0; i < stepIndex; i++) {
            if (!completedSteps.has(i)) return false;
        }

        return true;
    }, [currentStepIndex, completedSteps]);

    return {
        // Estado actual
        currentStep,
        currentStepIndex,
        formData,
        progress,
        isSubmitting,

        // Errores
        stepErrors,
        getCurrentStepErrors,

        // Acciones de navegación
        goToNextStep,
        goToPreviousStep,
        goToStep,

        // Acciones de datos
        updateFormData,
        updateField,

        // Validación y envío
        validateStep,
        validateAllSteps,
        submitForm,

        // Utilidades
        resetForm,
        isStepCompleted,
        canNavigateToStep,
    };
};

export default useMultiStepForm;
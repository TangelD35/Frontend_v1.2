import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    AlertCircle,
    Info,
    X,
    Save,
    RotateCcw,
    Eye,
    EyeOff
} from 'lucide-react';
import { useMultiStepForm } from '../../../../../shared/hooks/useMultiStepForm';
import { classNames } from '../../../../../lib/utils/componentUtils';
import { FormApiIntegration, useComponentAuth, handleApiError } from '../utils/apiIntegration';
import { useStableCallback, useRenderTime } from '../utils/performanceUtils';

const MultiStepForm = React.memo(({
    steps = [],
    onSubmit,
    onStepChange,
    initialData = {},
    className = '',
    showProgress = true,
    showSummary = true,
    allowSkip = false,
    allowBackNavigation = true,
    autoSave = false,
    autoSaveInterval = 30000,
    onCancel,
    onAutoSave,
    submitText = 'Finalizar',
    nextText = 'Siguiente',
    prevText = 'Anterior',
    skipText = 'Omitir',
    summaryTitle = 'Resumen',
    persistData = false,
    storageKey = 'multiStepForm',
    showStepValidation = true,
    animationDirection = 'horizontal',
    // Nuevas props para integración API
    formId = null,
    enableApiIntegration = false,
    enableServerValidation = false,
    requireAuth = false,
    requiredPermission = null,
    loadSavedData = false,
}) => {
    const formRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);
    const apiIntegrationRef = useRef(null);

    // Hooks de autenticación
    const { isAuthenticated, checkPermission } = useComponentAuth();

    // Performance monitoring
    useRenderTime('MultiStepForm');

    const {
        currentStep,
        currentStepIndex,
        formData,
        progress,
        isSubmitting,
        stepErrors,
        getCurrentStepErrors,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        updateFormData,
        updateField,
        validateStep,
        validateAllSteps,
        submitForm,
        resetForm,
        isStepCompleted,
        canNavigateToStep,
    } = useMultiStepForm(steps, initialData);

    // Verificar permisos
    const hasPermission = React.useMemo(() => {
        if (!requireAuth) return true;
        if (!isAuthenticated) return false;
        if (requiredPermission && !checkPermission(requiredPermission)) return false;
        return true;
    }, [requireAuth, isAuthenticated, requiredPermission, checkPermission]);

    // Inicializar integración API
    useEffect(() => {
        if (enableApiIntegration && formId && hasPermission) {
            apiIntegrationRef.current = new FormApiIntegration(formId);

            // Cargar datos guardados si está habilitado
            if (loadSavedData) {
                apiIntegrationRef.current.loadSavedData().then(savedData => {
                    if (savedData && savedData.data) {
                        updateFormData(savedData.data);
                        if (savedData.step_index !== undefined) {
                            goToStep(savedData.step_index);
                        }
                    }
                }).catch(error => {
                    console.warn('Could not load saved form data:', error);
                });
            }
        }

        return () => {
            if (apiIntegrationRef.current) {
                apiIntegrationRef.current.cleanup();
            }
        };
    }, [enableApiIntegration, formId, hasPermission, loadSavedData, updateFormData, goToStep]);

    // Auto-save functionality
    useEffect(() => {
        if (autoSave && hasPermission) {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            autoSaveTimeoutRef.current = setTimeout(() => {
                if (onAutoSave) {
                    onAutoSave(formData, currentStepIndex);
                } else if (apiIntegrationRef.current) {
                    apiIntegrationRef.current.autoSave(formData, currentStepIndex);
                }
            }, autoSaveInterval);
        }

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [formData, autoSave, onAutoSave, autoSaveInterval, currentStepIndex, hasPermission]);

    // Notify parent of step changes
    useEffect(() => {
        if (onStepChange) {
            onStepChange(currentStepIndex, formData, currentStep);
        }
    }, [currentStepIndex, formData, currentStep, onStepChange]);

    // Stable callbacks for better performance
    const handleDataChange = useStableCallback((field, value) => {
        updateField(field, value);
    }, [updateField]);

    // Manejar navegación
    const handleNext = useStableCallback(async () => {
        // Validación del servidor si está habilitada
        if (enableServerValidation && apiIntegrationRef.current) {
            try {
                const validation = await apiIntegrationRef.current.validateStep(
                    formData,
                    currentStepIndex
                );

                if (!validation.isValid) {
                    // Actualizar errores del paso actual
                    Object.entries(validation.errors).forEach(([field, error]) => {
                        stepErrors[currentStepIndex] = {
                            ...stepErrors[currentStepIndex],
                            [field]: error
                        };
                    });
                    return false;
                }
            } catch (error) {
                console.error('Server validation failed:', error);
                // Continuar con validación local si falla la del servidor
            }
        }

        const success = await goToNextStep();
        return success;
    }, [enableServerValidation, formData, currentStepIndex, stepErrors, goToNextStep]);

    const handlePrev = () => {
        if (allowBackNavigation) {
            goToPreviousStep();
        }
    };

    const handleSkip = () => {
        if (allowSkip && currentStepIndex < steps.length - 1) {
            goToStep(currentStepIndex + 1);
        }
    };

    const handleStepClick = (stepIndex) => {
        if (canNavigateToStep(stepIndex)) {
            goToStep(stepIndex);
        }
    };

    // Enviar formulario
    const handleSubmit = async () => {
        if (apiIntegrationRef.current && !onSubmit) {
            // Usar integración API si no hay onSubmit personalizado
            try {
                const result = await apiIntegrationRef.current.submitForm(formData);
                if (result.success) {
                    return true;
                } else {
                    console.error('Form submission failed:', result.error);
                    return false;
                }
            } catch (error) {
                console.error('Form submission error:', error);
                return false;
            }
        } else {
            const success = await submitForm(onSubmit);
            return success;
        }
    };

    // Reset formulario
    const handleReset = () => {
        resetForm();
    };

    const currentStepData = currentStep;
    const isLastStep = progress.isLastStep;
    const isFirstStep = progress.isFirstStep;
    const currentErrors = getCurrentStepErrors();

    // Animaciones
    const getStepVariants = () => {
        if (animationDirection === 'vertical') {
            return {
                enter: (direction) => ({
                    y: direction > 0 ? 300 : -300,
                    opacity: 0
                }),
                center: {
                    zIndex: 1,
                    y: 0,
                    opacity: 1
                },
                exit: (direction) => ({
                    zIndex: 0,
                    y: direction < 0 ? 300 : -300,
                    opacity: 0
                })
            };
        }

        return {
            enter: (direction) => ({
                x: direction > 0 ? 300 : -300,
                opacity: 0
            }),
            center: {
                zIndex: 1,
                x: 0,
                opacity: 1
            },
            exit: (direction) => ({
                zIndex: 0,
                x: direction < 0 ? 300 : -300,
                opacity: 0
            })
        };
    };

    const stepVariants = getStepVariants();

    // Verificar permisos antes de renderizar
    if (requireAuth && !hasPermission) {
        return (
            <div className={classNames(
                'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center',
                className
            )}>
                <div className="text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                    <p>No tienes permisos para acceder a este formulario.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={formRef}
            className={classNames(
                'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            {/* Progress Bar */}
            {showProgress && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {currentStepData?.title || `Paso ${progress.currentStep}`}
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {progress.currentStep} de {progress.totalSteps}
                            </span>
                            {autoSave && (
                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <Save className="w-3 h-3" />
                                    Auto-guardado
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center overflow-x-auto pb-2">
                        {steps.map((step, index) => (
                            <div key={step.id || index} className="flex items-center flex-shrink-0">
                                <motion.button
                                    onClick={() => handleStepClick(index)}
                                    className={classNames(
                                        'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all relative',
                                        isStepCompleted(index) && 'bg-green-500 border-green-500 text-white',
                                        index === currentStepIndex && 'bg-blue-500 border-blue-500 text-white',
                                        !isStepCompleted(index) && index !== currentStepIndex && 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400',
                                        canNavigateToStep(index) ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed',
                                        stepErrors[index] && Object.keys(stepErrors[index]).length > 0 && 'ring-2 ring-red-400 ring-opacity-50'
                                    )}
                                    disabled={!canNavigateToStep(index)}
                                    whileHover={canNavigateToStep(index) ? { scale: 1.1 } : {}}
                                    whileTap={canNavigateToStep(index) ? { scale: 0.95 } : {}}
                                >
                                    {isStepCompleted(index) ? (
                                        <Check className="w-4 h-4" />
                                    ) : stepErrors[index] && Object.keys(stepErrors[index]).length > 0 ? (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}

                                    {/* Step validation indicator */}
                                    {showStepValidation && stepErrors[index] && Object.keys(stepErrors[index]).length > 0 && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                                    )}
                                </motion.button>

                                {index < steps.length - 1 && (
                                    <motion.div
                                        className={classNames(
                                            'w-12 h-0.5 mx-2',
                                            isStepCompleted(index) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                        )}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: isStepCompleted(index) ? 1 : 0.3 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            className="bg-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div className="p-6 min-h-[400px] relative overflow-hidden">
                <AnimatePresence mode="wait" custom={currentStepIndex}>
                    <motion.div
                        key={currentStepIndex}
                        custom={currentStepIndex}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            y: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="w-full"
                    >
                        {/* Step Title and Description */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                {currentStepData?.title}
                            </h3>
                            {currentStepData?.description && (
                                <p className="text-gray-600 dark:text-gray-400">
                                    {currentStepData.description}
                                </p>
                            )}
                        </div>

                        {/* Step Component */}
                        {currentStepData?.component && (
                            <currentStepData.component
                                data={formData}
                                onChange={handleDataChange}
                                updateField={updateField}
                                updateFormData={updateFormData}
                                errors={currentErrors}
                                stepErrors={stepErrors}
                                onNext={handleNext}
                                onPrev={handlePrev}
                                onSkip={handleSkip}
                                onReset={handleReset}
                                isFirst={isFirstStep}
                                isLast={isLastStep}
                                progress={progress}
                                validateStep={validateStep}
                                canNavigate={canNavigateToStep}
                            />
                        )}

                        {/* Summary Step */}
                        {showSummary && isLastStep && !currentStepData?.component && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                                    {summaryTitle}
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                        {JSON.stringify(formData, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Error Summary */}
                        {Object.keys(currentErrors).length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                            >
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-medium">Por favor corrige los siguientes errores:</span>
                                </div>
                                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                    {Object.entries(currentErrors).map(([field, error]) => (
                                        <li key={field}>• {error}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Validation Status */}
                        {showStepValidation && (
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                {Object.keys(currentErrors).length === 0 ? (
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <Check className="w-4 h-4" />
                                        <span>Paso válido</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{Object.keys(currentErrors).length} error(es) encontrado(s)</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {!isFirstStep && allowBackNavigation && (
                            <motion.button
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {prevText}
                            </motion.button>
                        )}

                        {onCancel && (
                            <motion.button
                                onClick={onCancel}
                                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </motion.button>
                        )}

                        {/* Reset Button */}
                        <motion.button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title="Reiniciar formulario"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reiniciar
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Step Info */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                            {Object.keys(currentErrors).length === 0 ? (
                                <span className="text-green-600 dark:text-green-400">✓ Válido</span>
                            ) : (
                                <span className="text-red-600 dark:text-red-400">
                                    {Object.keys(currentErrors).length} error(es)
                                </span>
                            )}
                        </div>

                        {allowSkip && !isLastStep && (
                            <motion.button
                                onClick={handleSkip}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {skipText}
                            </motion.button>
                        )}

                        {isLastStep ? (
                            <motion.button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={classNames(
                                    'flex items-center gap-2 px-6 py-2 rounded-lg transition-colors',
                                    isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700',
                                    'text-white'
                                )}
                                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                            >
                                {isSubmitting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {submitText}
                                    </>
                                )}
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={handleNext}
                                disabled={Object.keys(currentErrors).length > 0}
                                className={classNames(
                                    'flex items-center gap-2 px-6 py-2 rounded-lg transition-colors',
                                    Object.keys(currentErrors).length > 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700',
                                    'text-white'
                                )}
                                whileHover={Object.keys(currentErrors).length === 0 ? { scale: 1.02 } : {}}
                                whileTap={Object.keys(currentErrors).length === 0 ? { scale: 0.98 } : {}}
                            >
                                {nextText}
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

MultiStepForm.displayName = 'MultiStepForm';

export default MultiStepForm;
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Trophy,
    Mail, Lock, User, Phone, Building, Check,
    Target, BarChart3, Users, Globe, Loader2, XCircle,
    Activity, Zap, Award, TrendingUp
} from 'lucide-react';
import '../Login/Login.css';

// Componente Basketball personalizado (lucide-react no tiene este icono)
const Basketball = ({ className, fill = 'none' }) => (
    <svg className={className} fill={fill} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0-4-10 15.3 15.3 0 0 0 4-10z" />
    </svg>
);
import useAuthStore from '../../../../shared/store/authStore';
import { ROLE_OPTIONS, VALIDATION_RULES, ERROR_MESSAGES } from '../../../../lib/constants';
import { Toast } from '../../../../shared/ui/components/common';
import logger from '../../../../shared/utils/logger';

const Register = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        lastName: '',
        phone: '',
        organization: '',
        role: 'analyst',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        acceptPrivacy: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [serverFieldErrors, setServerFieldErrors] = useState({}); // Errores específicos del servidor por campo
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isFormTouched, setIsFormTouched] = useState(false);
    const [buttonStatus, setButtonStatus] = useState('idle'); // idle | loading | success | error
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '', title: '' });
    const [currentStep, setCurrentStep] = useState(0);
    const [validatingFields, setValidatingFields] = useState({}); // Campos que se están validando
    const [fieldStatus, setFieldStatus] = useState({}); // Estado de cada campo: 'valid' | 'invalid' | 'validating'
    const validationTimeoutsRef = useRef({}); // Referencia para timeouts de validación

    const featureHighlights = [
        {
            icon: <Activity className="w-5 h-5" />,
            title: 'Análisis Táctico Avanzado',
            subtitle: 'Métricas ofensivas y defensivas de la Selección Nacional (2010-2025).'
        },
        {
            icon: <TrendingUp className="w-5 h-5" />,
            title: 'Predicción de Rendimiento',
            subtitle: 'Inteligencia artificial para análisis predictivo de torneos internacionales.'
        },
        {
            icon: <Basketball className="w-5 h-5" />,
            title: 'Centro de Alto Rendimiento',
            subtitle: 'Plataforma oficial de la Federación Dominicana de Baloncesto.'
        }
    ];

    const trustBadges = [
        {
            name: 'BasktscoreRD',
            description: 'Centro de Análisis Táctico'
        },
        {
            name: 'Selección Nacional',
            description: 'Período 2010-2025'
        },
        {
            name: 'CAR',
            description: 'Centro de Alto Rendimiento'
        }
    ];

    const steps = [
        {
            id: 'personal',
            title: 'Datos personales',
            description: 'Cuéntanos más sobre ti.'
        },
        {
            id: 'security',
            title: 'Seguridad',
            description: 'Protege tu cuenta con una contraseña fuerte.'
        },
        {
            id: 'confirmation',
            title: 'Revisión y permisos',
            description: 'Confirma tu información y acepta las políticas.'
        }
    ];

    const stepHelperText = {
        personal: 'Completa tus datos básicos para continuar.',
        security: 'Elige una contraseña segura y confírmala.',
        confirmation: 'Revisa tu información y acepta las políticas para finalizar.'
    };

    const stepFieldMap = {
        personal: ['name', 'lastName', 'username', 'email', 'phone', 'organization', 'role'],
        security: ['password', 'confirmPassword'],
        confirmation: ['acceptTerms', 'acceptPrivacy']
    };

    const isLastStep = currentStep === steps.length - 1;

    const summaryItems = [
        {
            label: 'Nombre completo',
            value: `${formData.name || '—'} ${formData.lastName || ''}`.trim()
        },
        {
            label: 'Usuario',
            value: formData.username || '—'
        },
        {
            label: 'Correo',
            value: formData.email || '—'
        },
        {
            label: 'Teléfono',
            value: formData.phone || '—'
        },
        {
            label: 'Organización',
            value: formData.organization || '—'
        },
        {
            label: 'Rol',
            value: ROLE_OPTIONS.find(option => option.value === formData.role)?.label || '—'
        }
    ];

    // Redirect si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Función helper para calcular fortaleza de contraseña
    const calculatePasswordStrength = useCallback((password) => {
            let strength = 0;
            if (password.length >= 8) strength += 1;
            if (/[a-z]/.test(password)) strength += 1;
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            return strength;
    }, []);

    // Limpiar errores al desmontar
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    // Calcular fortaleza de contraseña
    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password, calculatePasswordStrength]);

    const validateFields = (fields) => {
        const errors = {};

        const shouldValidate = (field) => fields.includes(field);

        if (shouldValidate('username')) {
            if (!formData.username.trim()) {
                errors.username = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (formData.username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
                errors.username = ERROR_MESSAGES.USERNAME_TOO_SHORT;
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                errors.username = ERROR_MESSAGES.USERNAME_INVALID_CHARS;
            }
        }

        if (shouldValidate('name')) {
            if (!formData.name.trim()) {
                errors.name = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (formData.name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
                errors.name = ERROR_MESSAGES.NAME_TOO_SHORT;
            }
        }

        if (shouldValidate('lastName')) {
            if (!formData.lastName.trim()) {
                errors.lastName = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (formData.lastName.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
                errors.lastName = ERROR_MESSAGES.NAME_TOO_SHORT;
            }
        }

        if (shouldValidate('email')) {
            if (!formData.email.trim()) {
                errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = ERROR_MESSAGES.INVALID_EMAIL;
            }
        }

        if (shouldValidate('phone')) {
            if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
                errors.phone = ERROR_MESSAGES.INVALID_PHONE;
            }
        }

        if (shouldValidate('password')) {
            if (!formData.password) {
                errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (formData.password.length < 8) {
                errors.password = 'La contraseña debe tener al menos 8 caracteres';
            } else {
                // Validar requisitos del backend: minúsculas, mayúsculas, números y símbolo
                const hasLower = /[a-z]/.test(formData.password);
                const hasUpper = /[A-Z]/.test(formData.password);
                const hasNumber = /[0-9]/.test(formData.password);
                const hasSymbol = /[^A-Za-z0-9]/.test(formData.password);

                if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
                    errors.password = 'La contraseña debe incluir minúsculas, mayúsculas, números y un símbolo';
            } else if (passwordStrength < VALIDATION_RULES.STRONG_PASSWORD_MIN_SCORE) {
                errors.password = ERROR_MESSAGES.WEAK_PASSWORD;
                }
            }
        }

        if (shouldValidate('confirmPassword')) {
            if (!formData.confirmPassword) {
                errors.confirmPassword = 'Confirma tu contraseña';
            } else if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
            }
        }

        if (shouldValidate('acceptTerms') && !formData.acceptTerms) {
            errors.acceptTerms = ERROR_MESSAGES.ACCEPT_TERMS;
        }

        if (shouldValidate('acceptPrivacy') && !formData.acceptPrivacy) {
            errors.acceptPrivacy = ERROR_MESSAGES.ACCEPT_PRIVACY;
        }

        setValidationErrors(prev => {
            const updated = { ...prev };
            fields.forEach(field => {
                if (errors[field]) {
                    updated[field] = errors[field];
                } else {
                    delete updated[field];
                }
            });
            return updated;
        });

        return Object.keys(errors).length === 0;
    };

    const validateStep = (stepIndex) => {
        const stepId = steps[stepIndex].id;
        const fields = stepFieldMap[stepId] ?? [];
        return validateFields(fields);
    };

    // Validación en tiempo real para campos específicos
    const validateFieldInRealTime = useCallback((fieldName, value) => {
        const fields = [fieldName];
        const errors = {};

        // Validar solo el campo específico
        if (fieldName === 'username') {
            if (!value.trim()) {
                errors.username = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (value.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
                errors.username = ERROR_MESSAGES.USERNAME_TOO_SHORT;
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                errors.username = ERROR_MESSAGES.USERNAME_INVALID_CHARS;
            }
        } else if (fieldName === 'email') {
            if (!value.trim()) {
                errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.email = ERROR_MESSAGES.INVALID_EMAIL;
            }
        } else if (fieldName === 'password') {
            if (!value) {
                errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
            } else if (value.length < 8) {
                errors.password = 'La contraseña debe tener al menos 8 caracteres';
            } else {
                const strength = calculatePasswordStrength(value);
                if (strength < VALIDATION_RULES.STRONG_PASSWORD_MIN_SCORE) {
                    errors.password = ERROR_MESSAGES.WEAK_PASSWORD;
                }
            }
        } else if (fieldName === 'confirmPassword') {
            if (!value) {
                errors.confirmPassword = 'Confirma tu contraseña';
            } else if (formData.password !== value) {
                errors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
            }
        }

        // Actualizar errores solo para este campo
        setValidationErrors(prev => {
            const updated = { ...prev };
            if (errors[fieldName]) {
                updated[fieldName] = errors[fieldName];
                setFieldStatus(prevStatus => ({ ...prevStatus, [fieldName]: 'invalid' }));
            } else {
                delete updated[fieldName];
                // Marcar como válido solo si tiene valor y no hay error
                if (value && value.trim()) {
                    setFieldStatus(prevStatus => ({ ...prevStatus, [fieldName]: 'valid' }));
                } else {
                    setFieldStatus(prevStatus => {
                        const newStatus = { ...prevStatus };
                        delete newStatus[fieldName];
                        return newStatus;
                    });
                }
            }
            return updated;
        });
    }, [formData.password, calculatePasswordStrength]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIsFormTouched(true);

        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));

        // Limpiar errores de validación y del servidor para este campo
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }

        // Solo limpiar errores del servidor si el usuario está escribiendo (no si viene del servidor)
        // Esto evita que se limpien los errores que acabamos de establecer
        if (serverFieldErrors[name] && !isLoading) {
            setServerFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }

        // Limpiar error del servidor general
        if (error) {
            clearError();
        }

        // Validación en tiempo real con debounce para campos específicos
        if (type !== 'checkbox' && ['username', 'email', 'password', 'confirmPassword'].includes(name)) {
            // Limpiar timeout anterior si existe
            if (validationTimeoutsRef.current[name]) {
                clearTimeout(validationTimeoutsRef.current[name]);
            }

            // Crear nuevo timeout
            validationTimeoutsRef.current[name] = setTimeout(() => {
                validateFieldInRealTime(name, newValue);
            }, 500);
        }
    };

    // Limpiar timeouts al desmontar
    useEffect(() => {
        return () => {
            Object.values(validationTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormTouched(true);

        const allFields = [
            'name',
            'lastName',
            'username',
            'email',
            'phone',
            'organization',
            'role',
            'password',
            'confirmPassword',
            'acceptTerms',
            'acceptPrivacy'
        ];

        if (!validateFields(allFields)) {
            return;
        }

        const { confirmPassword, acceptTerms, acceptPrivacy, name, lastName, ...registerData } = formData;
        setButtonStatus('loading');

        // Normalizar teléfono: convertir a número o null
        let normalizedPhone = null;
        if (registerData.phone && registerData.phone.trim()) {
            const cleanedPhone = String(registerData.phone).replace(/\D/g, '');
            if (cleanedPhone.length >= 8) {
                try {
                    normalizedPhone = parseInt(cleanedPhone, 10);
                    if (isNaN(normalizedPhone)) {
                        normalizedPhone = null;
                    }
                } catch (e) {
                    normalizedPhone = null;
                }
            }
        }

        const trimmedFirstName = name.trim();
        const trimmedLastName = lastName.trim();
        const combinedFullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

        // Normalizar campos opcionales
        const normalizedOrganization = registerData.organization?.trim() || null;
        const normalizedRole = registerData.role?.trim() || null;

        try {
            logger.debug('Iniciando registro de usuario', {
                username: registerData.username,
                email: registerData.email,
            phone: normalizedPhone,
                first_name: trimmedFirstName,
                last_name: trimmedLastName
            });

            const result = await register({
                email: registerData.email.trim(),
                username: registerData.username.trim(),
                password: registerData.password,
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
                full_name: combinedFullName,
                phone: normalizedPhone,
                organization: normalizedOrganization,
                role: normalizedRole,
                is_active: true,
                is_superuser: false
            });

            logger.debug('Resultado del registro recibido', result);

        if (result.success) {
            clearError();
                setServerFieldErrors({});
                logger.info('Registro exitoso', { username: registerData.username });

            setToast({
                isVisible: true,
                type: 'success',
                title: 'Registro completado',
                message: 'Tu cuenta fue creada exitosamente. Redirigiendo al inicio de sesión...',
            });
            setButtonStatus('success');
            setTimeout(() => setSuccess(true), 400);
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            return;
        }

            // Manejar errores del servidor
        const errorMessage = result.error || 'No pudimos completar el registro. Intenta de nuevo.';

            // Si hay errores por campo, mostrarlos
            // Verificar si fieldErrors existe y no es null/undefined
            const hasFieldErrors = result.fieldErrors && typeof result.fieldErrors === 'object' && Object.keys(result.fieldErrors).length > 0;
            
            // Función helper optimizada para establecer errores y limpiar fieldStatus
            const setFieldErrors = () => {
                // Limpiar fieldStatus para los campos con errores del servidor
                setFieldStatus(prevStatus => {
                    const updated = { ...prevStatus };
                    Object.keys(result.fieldErrors).forEach(field => {
                        delete updated[field]; // Limpiar el estado 'valid' para campos con errores
                    });
                    return updated;
                });
                
                // Establecer errores del servidor
                setServerFieldErrors(result.fieldErrors);
                
                // Agregar errores del servidor a los errores de validación para mostrarlos
                setValidationErrors(prev => {
                    const updated = { ...prev, ...result.fieldErrors };
                    return updated;
                });
            };

            if (hasFieldErrors) {
                logger.debug('Errores de campo recibidos del servidor', result.fieldErrors);
                
                // Establecer errores inmediatamente
                setFieldErrors();
                
                // Determinar el paso al que navegar basado en los campos con error
                let targetStep = null;
                if (result.fieldErrors.username || result.fieldErrors.email || result.fieldErrors.name || result.fieldErrors.lastName) {
                    targetStep = 0; // Paso de datos personales
                    logger.debug('Navegando al paso 0 (datos personales)');
                } else if (result.fieldErrors.password || result.fieldErrors.confirmPassword) {
                    targetStep = 1; // Paso de seguridad
                    logger.debug('Navegando al paso 1 (seguridad)');
                }
                
                // Si hay un paso específico, navegar y establecer errores después de un solo setTimeout
                if (targetStep !== null) {
                    setCurrentStep(targetStep);
                    // Un solo setTimeout consolidado para establecer errores después de cambiar el paso
                    setTimeout(() => {
                        setFieldErrors();
                    }, 150);
                } else {
                    // Si no hay paso específico, solo re-forzar errores después de un pequeño delay
                    setTimeout(() => {
                        setFieldErrors();
                    }, 100);
                }
                
                logger.warn('Errores de validación en registro', result.fieldErrors);
            } else {
                logger.debug('No hay errores de campo en el resultado', result);
            }

        setToast({
            isVisible: true,
            type: 'error',
            title: 'Error en el registro',
            message: errorMessage,
        });
        setButtonStatus('error');

        setTimeout(() => setButtonStatus('idle'), 2000);
        } catch (err) {
            logger.error('Error inesperado en registro', err);
            setToast({
                isVisible: true,
                type: 'error',
                title: 'Error inesperado',
                message: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
            });
            setButtonStatus('error');
            setTimeout(() => setButtonStatus('idle'), 2000);
        }
    };

    const handleNext = () => {
        const isValid = validateStep(currentStep);
        if (!isValid) {
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
        setButtonStatus('idle');
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 2) return 'bg-orange-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        if (passwordStrength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return 'Muy débil';
        if (passwordStrength <= 2) return 'Débil';
        if (passwordStrength <= 3) return 'Regular';
        if (passwordStrength <= 4) return 'Fuerte';
        return 'Muy fuerte';
    };

    // Usar opciones de roles desde constantes

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#CE1126] via-[#002D62] to-[#CE1126] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animación de fondo */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-white rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-white rounded-full animate-pulse delay-700"></div>
                    </div>

                <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative z-10 border-4 border-white/20">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                        <CheckCircle className="w-14 h-14 text-white" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Basketball className="w-8 h-8 text-[#CE1126]" fill="currentColor" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#CE1126] to-[#002D62] bg-clip-text text-transparent">
                            ¡Registro Exitoso!
                        </h2>
                        <Basketball className="w-8 h-8 text-[#002D62]" fill="currentColor" />
                    </div>
                    <p className="text-gray-700 mb-6 text-lg font-medium">
                        Tu cuenta ha sido creada correctamente. Bienvenido al <span className="text-[#CE1126] font-bold">Centro de Análisis Táctico</span> de la Selección Nacional.
                    </p>
                    <div className="bg-gradient-to-r from-[#002D62]/10 to-[#CE1126]/10 border-2 border-[#002D62]/30 rounded-xl p-5 mb-6">
                        <p className="text-sm text-gray-800 font-semibold mb-3">
                            <Trophy className="w-5 h-5 inline mr-2 text-[#CE1126]" />
                            Próximos pasos:
                        </p>
                        <ul className="text-left space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#002D62] flex-shrink-0" />
                                Revisa tu email para verificar tu cuenta
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#002D62] flex-shrink-0" />
                                Inicia sesión con tus credenciales
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#002D62] flex-shrink-0" />
                                Accede al análisis táctico (2010-2025)
                            </li>
                        </ul>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 font-medium">
                        <div className="w-2 h-2 bg-[#CE1126] rounded-full animate-pulse"></div>
                        Redirigiendo al inicio de sesión...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
                {/* Imagen de fondo más visible */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                    style={{
                        backgroundImage: `url(/baskt.webp)`,
                        imageRendering: '-webkit-optimize-contrast',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                    }}
                ></div>

                {/* Overlay oscuro sobre la imagen */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-[#002D62]/70 to-slate-950/80"></div>

                {/* Fondo con patrón de cuadrícula sutil */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                {/* Efectos de luz modernos */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#CE1126]/20 blur-3xl" />
                    <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-[#002D62]/20 blur-3xl" />
                </div>

            <div className="relative flex min-h-screen flex-col lg:flex-row">
                {/* Panel izquierdo */}
                    <div className="hidden w-full max-w-lg flex-col justify-between border-r border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-10 py-12 backdrop-blur-xl lg:flex relative overflow-hidden">
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CE1126]/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#002D62]/30 rounded-full blur-3xl -ml-24 -mb-24"></div>

                        <div className="relative z-10">
                        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-xl blur-md opacity-50"></div>
                                        <div className="relative bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                                <img
                                    src="/logo-rdscore.png"
                                                alt="BasktscoreRD Logo"
                                    className="h-10 w-auto drop-shadow-lg sm:h-12"
                                />
                                        </div>
                                    </div>
                                <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-white/90 font-bold">BasktscoreRD</p>
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                            Centro de Análisis Táctico
                                        </h1>
                                </div>
                            </div>
                                <div className="rounded-full border-2 border-[#CE1126]/50 bg-gradient-to-r from-[#CE1126]/20 to-[#002D62]/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm shadow-lg">
                                    <span className="flex items-center gap-2">
                                        <Award className="w-3 h-3" />
                                        Período 2010-2025
                                    </span>
                            </div>
                        </div>

                            <h2 className="text-3xl font-bold leading-snug text-white sm:text-4xl mb-4">
                                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                                    Analiza el rendimiento de la
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-[#CE1126] via-red-400 to-[#CE1126] bg-clip-text text-transparent">
                                    Selección Nacional
                                </span>
                        </h2>

                            <p className="mt-6 text-sm text-white/90 sm:text-base leading-relaxed font-medium">
                                Plataforma oficial de análisis táctico y predictivo para el rendimiento ofensivo y defensivo
                                de la Selección Nacional de Baloncesto de República Dominicana en torneos internacionales.
                        </p>

                        <div className="mt-10 space-y-4">
                                {featureHighlights.map(({ icon, title, subtitle }, index) => (
                                    <div
                                        key={title}
                                        className="group flex items-start gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-sm hover:border-[#CE1126]/50 hover:bg-white/10 transition-all duration-300"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#CE1126] to-[#002D62] text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {icon}
                                    </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                                            <p className="text-sm text-white/80 leading-relaxed">{subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                        <div className="mt-10 space-y-4 sm:mt-12 relative z-10">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70 font-semibold">
                                <Shield className="w-4 h-4" />
                                Respaldan la plataforma
                            </div>
                        <div className="flex flex-wrap gap-3">
                                {trustBadges.map((badge, index) => (
                                    <div
                                        key={badge.name}
                                        className="group relative overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-4 py-2 backdrop-blur-sm hover:border-[#CE1126]/50 transition-all duration-300"
                                    >
                                        <div className="relative z-10">
                                            <div className="text-xs font-bold text-white">{badge.name}</div>
                                            <div className="text-[10px] text-white/70">{badge.description}</div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#CE1126]/20 to-[#002D62]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel derecho */}
                    <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 relative z-10">
                        <div className="w-full max-w-xl overflow-hidden rounded-[28px] border-2 border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl sm:max-w-2xl sm:rounded-[32px] relative">
                            {/* Efecto de brillo superior */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                            <div className="border-b border-white/20 bg-gradient-to-r from-[#CE1126]/10 via-transparent to-[#002D62]/10 px-5 py-6 sm:px-8 sm:py-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3 sm:gap-4">
                                <div>
                                        <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#CE1126]/50 bg-gradient-to-r from-[#CE1126]/20 to-[#002D62]/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm shadow-lg">
                                            <Shield className="h-4 w-4" />
                                            Registro Oficial BasktscoreRD
                                    </span>
                                        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                                            <span className="bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent">
                                                Crear cuenta de analista
                                            </span>
                                        </h2>
                                        <p className="mt-2 text-sm text-white/80 sm:text-base font-medium">
                                            Accede al análisis táctico y predictivo de la Selección Nacional (2010-2025)
                                        </p>
                                </div>
                                <div className="hidden sm:block">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-2xl blur-lg opacity-50"></div>
                                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#CE1126] to-[#002D62] text-white shadow-xl">
                                                <UserPlus className="h-8 w-8" />
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
                            {/* Error del servidor */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-2xl border border-red-200/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Paso {currentStep + 1} de {steps.length}</p>
                                                <h3 className="text-lg font-semibold text-white">{steps[currentStep].title}</h3>
                                                <p className="text-sm text-white/70">{steps[currentStep].description}</p>
                                            </div>
                                            <div className="hidden items-center gap-2 text-xs text-white/60 sm:flex">
                                                {steps.map((step, index) => {
                                                    const isCompleted = index < currentStep;
                                                    const isActive = index === currentStep;
                                                    return (
                                                        <div key={step.id} className="flex items-center">
                                                            <div
                                                                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-all ${isActive
                                                                    ? 'border-blue-300 bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                                                                    : isCompleted
                                                                        ? 'border-emerald-300 bg-emerald-500 text-white'
                                                                        : 'border-white/20 bg-white/10 text-white/60'
                                                                    }`}
                                                                aria-current={isActive ? 'step' : undefined}
                                                            >
                                                                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                                                            </div>
                                                            {index < steps.length - 1 && (
                                                                <div className={`mx-2 h-px w-8 transition-all ${isCompleted
                                                                    ? 'bg-emerald-400'
                                                                    : isActive
                                                                        ? 'bg-blue-400'
                                                                        : 'bg-white/20'
                                                                    }`}></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-xs text-white/60 sm:hidden">
                                            <span className="truncate text-white/40">{steps[currentStep - 1]?.title || '\u200B'}</span>
                                            <div className="flex items-center gap-2">
                                                {steps.map((step, index) => (
                                                    <span
                                                        key={step.id}
                                                        className={`h-1.5 w-8 rounded-full transition-all ${index <= currentStep ? 'bg-blue-400' : 'bg-white/20'}`}
                                                    ></span>
                                                ))}
                                            </div>
                                            <span className="truncate text-right text-white/40">{steps[currentStep + 1]?.title || '\u200B'}</span>
                                        </div>
                                    </div>
                                </div>

                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Nombre *
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                            className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${(validationErrors.name || serverFieldErrors.first_name || serverFieldErrors.name)
                                                            ? 'border-red-400/70 bg-red-50'
                                                                : fieldStatus.name === 'valid'
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="Juan"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                    {(validationErrors.name || serverFieldErrors.first_name || serverFieldErrors.name) && (
                                                        <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            {validationErrors.name || serverFieldErrors.first_name || serverFieldErrors.name}
                                                        </p>
                                                    )}
                                                    {fieldStatus.name === 'valid' && !validationErrors.name && (
                                                        <p className="mt-1 text-sm text-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Nombre válido
                                                        </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Apellido *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                        className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${(validationErrors.lastName || serverFieldErrors.last_name)
                                                        ? 'border-red-400/70 bg-red-50'
                                                            : fieldStatus.lastName === 'valid'
                                                            ? 'border-emerald-400/70 bg-emerald-50/60'
                                                            : 'border-transparent'
                                                        }`}
                                                    placeholder="Pérez"
                                                    disabled={isLoading}
                                                />
                                                    {(validationErrors.lastName || serverFieldErrors.last_name) && (
                                                        <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            {validationErrors.lastName || serverFieldErrors.last_name}
                                                        </p>
                                                    )}
                                                    {fieldStatus.lastName === 'valid' && !validationErrors.lastName && (
                                                        <p className="mt-1 text-sm text-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Apellido válido
                                                        </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Nombre de usuario *
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                            className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${(validationErrors.username || serverFieldErrors.username)
                                                            ? 'border-red-400/70 bg-red-50'
                                                                : fieldStatus.username === 'valid'
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="usuario123"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                    {(validationErrors.username || serverFieldErrors.username) && (
                                                        <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            {validationErrors.username || serverFieldErrors.username}
                                                        </p>
                                                    )}
                                                    {fieldStatus.username === 'valid' && !validationErrors.username && !serverFieldErrors.username && (
                                                        <p className="mt-1 text-sm text-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Usuario disponible
                                                        </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Email *
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <Mail className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                            className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${(validationErrors.email || serverFieldErrors.email)
                                                            ? 'border-red-400/70 bg-red-50'
                                                                : fieldStatus.email === 'valid'
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="tu@email.com"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                    {(validationErrors.email || serverFieldErrors.email) && (
                                                        <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            {validationErrors.email || serverFieldErrors.email}
                                                        </p>
                                                    )}
                                                    {fieldStatus.email === 'valid' && !validationErrors.email && (
                                                        <p className="mt-1 text-sm text-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Email válido
                                                        </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Teléfono (opcional)
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.phone
                                                            ? 'border-red-400/70 bg-red-50'
                                                            : 'border-transparent'
                                                            }`}
                                                        placeholder="+1 (809) 123-4567"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                {validationErrors.phone && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.phone}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="organization" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Organización (opcional)
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <Building className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="organization"
                                                        name="organization"
                                                        value={formData.organization}
                                                        onChange={handleChange}
                                                        className="w-full rounded-2xl border border-transparent bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 hover:border-blue-400/40 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                                        placeholder="BasktscoreRD, Club, Universidad..."
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="role" className="mb-2 block text-sm font-semibold text-slate-100">
                                                Rol Profesional *
                                            </label>
                                            <select
                                                id="role"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border border-transparent bg-white/90 px-4 py-3 text-slate-900 shadow-inner transition-all duration-200 hover:border-blue-400/40 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                                disabled={isLoading}
                                            >
                                                {ROLE_OPTIONS.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Contraseña *
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <Lock className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        id="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                            className={`w-full rounded-2xl border bg-white/90 pl-10 pr-12 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${(validationErrors.password || serverFieldErrors.password)
                                                            ? 'border-red-400/70 bg-red-50'
                                                                : fieldStatus.password === 'valid'
                                                                    ? 'border-emerald-400/70 bg-emerald-50/60'
                                                            : 'border-transparent'
                                                            }`}
                                                        placeholder="••••••••"
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 transition-colors hover:text-blue-600"
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>

                                                {formData.password && (
                                                    <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                                                        <div className="flex items-center justify-between">
                                                            <span>Fortaleza de la contraseña</span>
                                                            <span className="font-semibold text-white">{getPasswordStrengthText()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 rounded-full bg-slate-200/30">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-white/70">{passwordStrength}/5</span>
                                                        </div>
                                                        <ul className="list-disc pl-5 text-xs text-white/70">
                                                            <li>Usa al menos 8 caracteres.</li>
                                                            <li>Combina mayúsculas, minúsculas, números y símbolos.</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                    {(validationErrors.password || serverFieldErrors.password) && (
                                                        <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            {validationErrors.password || serverFieldErrors.password}
                                                        </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-100">
                                                    Confirmar contraseña *
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400/80">
                                                        <Lock className="h-5 w-5" />
                                                    </div>
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                            className={`w-full rounded-2xl border bg-white/90 pl-10 pr-12 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${(validationErrors.confirmPassword || serverFieldErrors.confirmPassword)
                                                            ? 'border-red-400/70 bg-red-50'
                                                                : fieldStatus.confirmPassword === 'valid'
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="••••••••"
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 transition-colors hover:text-blue-600"
                                                        disabled={isLoading}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                                        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500">
                                                            <Check className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                    {(validationErrors.confirmPassword || serverFieldErrors.confirmPassword) && (
                                                        <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            {validationErrors.confirmPassword || serverFieldErrors.confirmPassword}
                                                        </p>
                                                    )}
                                                    {fieldStatus.confirmPassword === 'valid' && formData.password === formData.confirmPassword && (
                                                        <p className="mt-1 text-sm text-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Las contraseñas coinciden
                                                        </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
                                            <h4 className="text-sm font-semibold text-white">Resumen rápido</h4>
                                            <p className="mt-1 text-xs text-white/60">Verifica que la información esté correcta antes de finalizar.</p>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                {summaryItems.map(item => (
                                                    <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">{item.label}</p>
                                                        <p className="text-sm text-white">{item.value || '—'}</p>
                                                    </div>
                                                ))}
                                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Contraseña</p>
                                                    <p className="text-sm text-white">{formData.password ? '••••••••' : 'No proporcionada'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
                                                <input
                                                    type="checkbox"
                                                    id="acceptTerms"
                                                    name="acceptTerms"
                                                    checked={formData.acceptTerms}
                                                    onChange={handleChange}
                                                    className="mt-1 h-5 w-5 rounded border-white/30 bg-white/20 text-blue-500 focus:ring-blue-500"
                                                    disabled={isLoading}
                                                />
                                                <label htmlFor="acceptTerms" className="text-sm">
                                                    Acepto los{' '}
                                                    <Link to="/terms" className="font-semibold text-blue-200 hover:text-blue-100">
                                                        términos y condiciones
                                                    </Link>{' '}
                                                    del sistema *
                                                </label>
                                            </div>
                                            {validationErrors.acceptTerms && (
                                                <p className="ml-8 text-sm text-red-200">{validationErrors.acceptTerms}</p>
                                            )}

                                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
                                                <input
                                                    type="checkbox"
                                                    id="acceptPrivacy"
                                                    name="acceptPrivacy"
                                                    checked={formData.acceptPrivacy}
                                                    onChange={handleChange}
                                                    className="mt-1 h-5 w-5 rounded border-white/30 bg-white/20 text-blue-500 focus:ring-blue-500"
                                                    disabled={isLoading}
                                                />
                                                <label htmlFor="acceptPrivacy" className="text-sm">
                                                    Acepto la{' '}
                                                    <Link to="/privacy" className="font-semibold text-blue-200 hover:text-blue-100">
                                                        política de privacidad
                                                    </Link>{' '}
                                                    y el tratamiento de mis datos *
                                                </label>
                                            </div>
                                            {validationErrors.acceptPrivacy && (
                                                <p className="ml-8 text-sm text-red-200">{validationErrors.acceptPrivacy}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-xs text-white/60">{stepHelperText[steps[currentStep].id]}</div>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {currentStep > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/15"
                                            >
                                                Volver
                                            </button>
                                        )}

                                        {!isLastStep && (
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#CE1126] via-red-600 to-[#002D62] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#CE1126]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#CE1126]/60"
                                            >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                Continuar
                                                        <Zap className="w-4 h-4" />
                                                    </span>
                                                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            </button>
                                        )}

                                        {isLastStep && (
                                            <button
                                                type="submit"
                                                disabled={isLoading || !formData.acceptTerms || !formData.acceptPrivacy}
                                                    className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#CE1126] via-red-600 to-[#002D62] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#CE1126]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#CE1126]/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                                            >
                                                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                <span className="relative flex items-center gap-2">
                                                    {buttonStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                                                    {buttonStatus === 'idle' && !isLoading && buttonStatus !== 'success' && buttonStatus !== 'error' && (
                                                            <>
                                                                <Basketball className="h-5 w-5" fill="currentColor" />
                                                                <span>Crear cuenta de analista</span>
                                                            </>
                                                    )}
                                                        {buttonStatus === 'success' && (
                                                            <>
                                                                <CheckCircle className="h-5 w-5" />
                                                                <span>¡Registro enviado!</span>
                                                            </>
                                                        )}
                                                        {buttonStatus === 'error' && (
                                                            <>
                                                                <AlertCircle className="h-5 w-5" />
                                                                <span>Error al registrar</span>
                                                            </>
                                                        )}
                                                        {buttonStatus === 'loading' && <span>Procesando registro...</span>}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Link a login */}
                        <div className="text-center text-sm text-white/70">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-200 transition-colors hover:text-blue-100"
                            >
                                Inicia sesión
                            </Link>
                        </div>

                        {/* Footer */}
                            <div className="border-t border-white/20 bg-gradient-to-r from-[#CE1126]/10 via-transparent to-[#002D62]/10 px-6 py-5 backdrop-blur-sm sm:px-10">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                                        <Shield className="h-4 w-4 text-[#CE1126]" />
                                        <span>Registro seguro cifrado 256-bit</span>
                                </div>
                                    <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#CE1126]" />
                                        <span>Plataforma oficial BasktscoreRD</span>
                                </div>
                            </div>
                                <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                    <p className="text-[10px] text-white/60 uppercase tracking-wider">
                                        Análisis Táctico y Predictivo • Selección Nacional RD • 2010-2025
                                    </p>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            isVisible={toast.isVisible}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            duration={5000}
            position="top-right"
        />
        </>
    );
};

export default Register;
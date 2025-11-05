import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Trophy,
    Mail, Lock, User, Phone, Building, Shield, Check,
    Target, BarChart3, Users, Globe, Loader2
} from 'lucide-react';
import useAuthStore from '../../../../shared/store/authStore';
import { ROLE_OPTIONS, VALIDATION_RULES, ERROR_MESSAGES } from '../../../../lib/constants';
import { Toast } from '../../../../shared/ui/components/common';

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
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isFormTouched, setIsFormTouched] = useState(false);
    const [buttonStatus, setButtonStatus] = useState('idle'); // idle | loading | success | error
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '', title: '' });
    const [currentStep, setCurrentStep] = useState(0);

    const featureHighlights = [
        {
            icon: <Users className="w-4 h-4" />,
            title: 'Comunidad profesional',
            subtitle: 'Conecta con scouts y analistas certificados.'
        },
        {
            icon: <BarChart3 className="w-4 h-4" />,
            title: 'Analítica avanzada',
            subtitle: 'Visualiza métricas clave en tiempo real.'
        },
        {
            icon: <Target className="w-4 h-4" />,
            title: 'Planes personalizados',
            subtitle: 'Optimiza estrategias para cada torneo.'
        }
    ];

    const trustBadges = [
        'Federación Dominicana de Baloncesto',
        'Centro de Alto Rendimiento',
        'Selección Nacional'
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

    // Limpiar errores al desmontar
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    // Calcular fortaleza de contraseña
    useEffect(() => {
        const calculatePasswordStrength = (password) => {
            let strength = 0;
            if (password.length >= 8) strength += 1;
            if (/[a-z]/.test(password)) strength += 1;
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            return strength;
        };

        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password]);

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
            } else if (passwordStrength < VALIDATION_RULES.STRONG_PASSWORD_MIN_SCORE) {
                errors.password = ERROR_MESSAGES.WEAK_PASSWORD;
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIsFormTouched(true);

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }

        // Limpiar error del servidor
        if (error) {
            clearError();
        }
    };

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
        const rawPhone = registerData.phone ?? '';
        const cleanedPhone = String(rawPhone).replace(/\D/g, '');
        const normalizedPhone = cleanedPhone.length >= 8 ? Number(cleanedPhone) : null;
        const trimmedFirstName = name.trim();
        const trimmedLastName = lastName.trim();
        const combinedFullName = `${trimmedFirstName} ${trimmedLastName}`.trim();

        const result = await register({
            ...registerData,
            phone: normalizedPhone,
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            full_name: combinedFullName
        });

        if (result.success) {
            clearError();
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

        const errorMessage = result.error || 'No pudimos completar el registro. Intenta de nuevo.';
        setToast({
            isVisible: true,
            type: 'error',
            title: 'Error en el registro',
            message: errorMessage,
        });
        setButtonStatus('error');
        setTimeout(() => setButtonStatus('idle'), 2000);
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
            <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Registro Exitoso!</h2>
                    <p className="text-gray-600 mb-6 text-lg">
                        Tu cuenta ha sido creada correctamente. Bienvenido al sistema de análisis táctico.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Próximos pasos:</strong><br />
                            1. Revisa tu email para verificar tu cuenta<br />
                            2. Inicia sesión con tus credenciales<br />
                            3. Completa tu perfil profesional
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Redirigiendo al inicio de sesión...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-600/40 blur-3xl" />
                <div className="absolute top-1/2 -left-24 h-80 w-80 -translate-y-1/2 rounded-full bg-red-600/40 blur-3xl" />
                <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-cyan-500/30 blur-3xl" />
            </div>

            <div className="relative flex min-h-screen flex-col lg:flex-row">
                {/* Panel izquierdo */}
                <div className="hidden w-full max-w-lg flex-col justify-between border-r border-white/10 bg-white/5 px-10 py-12 backdrop-blur-lg lg:flex">
                    <div>
                        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/logo-rdscore.png"
                                    className="h-10 w-auto drop-shadow-lg sm:h-12"
                                />
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80">BasktscoreRD</p>
                                    <h1 className="text-2xl font-semibold text-white">Centro de Rendimiento</h1>
                                </div>
                            </div>
                            <div className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white/80">
                                Programa Elite 2025
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold leading-snug text-white sm:text-4xl">
                            Construye tu perfil profesional de analista y suma valor al baloncesto nacional.
                        </h2>

                        <p className="mt-6 text-sm text-white/80 sm:text-base">
                            Da el siguiente paso con una plataforma diseñada para potenciar tu análisis táctico,
                            fortalecer tus reportes y colaborar con el cuerpo técnico oficial.
                        </p>

                        <div className="mt-10 space-y-4">
                            {featureHighlights.map(({ icon, title, subtitle }) => (
                                <div key={title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-900/20">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-100 sm:h-10 sm:w-10">
                                        {icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                                        <p className="text-sm text-white/70">{subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 space-y-3 sm:mt-12 sm:space-y-4">
                        <div className="text-xs uppercase tracking-[0.3em] text-white/60">Respaldan la plataforma</div>
                        <div className="flex flex-wrap gap-3">
                            {trustBadges.map((badge) => (
                                <span key={badge} className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80 sm:px-4 sm:py-2 sm:text-xs">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel derecho */}
                <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl shadow-blue-900/40 backdrop-blur-xl sm:max-w-2xl sm:rounded-[32px]">
                        <div className="border-b border-white/10 bg-white/5 px-5 py-6 sm:px-8 sm:py-8">
                            <div className="flex items-center justify-between gap-3 sm:gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-100 sm:text-xs">
                                        <Shield className="h-3.5 w-3.5" />
                                        Registro verificado
                                    </span>
                                    <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Crear cuenta profesional</h2>
                                    <p className="mt-2 text-xs text-white/70 sm:text-sm">Completa tu perfil para acceder al panel táctico y a los reportes oficiales.</p>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40">
                                        <UserPlus className="h-7 w-7" />
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
                                                        className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.name
                                                            ? 'border-red-400/70 bg-red-50'
                                                            : isFormTouched && formData.name
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="Juan"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                {validationErrors.name && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.name}</p>
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
                                                    className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.lastName
                                                        ? 'border-red-400/70 bg-red-50'
                                                        : isFormTouched && formData.lastName
                                                            ? 'border-emerald-400/70 bg-emerald-50/60'
                                                            : 'border-transparent'
                                                        }`}
                                                    placeholder="Pérez"
                                                    disabled={isLoading}
                                                />
                                                {validationErrors.lastName && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.lastName}</p>
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
                                                        className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.username
                                                            ? 'border-red-400/70 bg-red-50'
                                                            : isFormTouched && formData.username
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="usuario123"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                {validationErrors.username && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.username}</p>
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
                                                        className={`w-full rounded-2xl border bg-white/90 pl-10 pr-4 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.email
                                                            ? 'border-red-400/70 bg-red-50'
                                                            : isFormTouched && formData.email
                                                                ? 'border-emerald-400/70 bg-emerald-50/60'
                                                                : 'border-transparent'
                                                            }`}
                                                        placeholder="tu@email.com"
                                                        disabled={isLoading}
                                                    />
                                                </div>
                                                {validationErrors.email && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.email}</p>
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
                                                        className={`w-full rounded-2xl border bg-white/90 pl-10 pr-12 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.password
                                                            ? 'border-red-400/70 bg-red-50'
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

                                                {validationErrors.password && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.password}</p>
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
                                                        className={`w-full rounded-2xl border bg-white/90 pl-10 pr-12 py-3 text-slate-900 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${validationErrors.confirmPassword
                                                            ? 'border-red-400/70 bg-red-50'
                                                            : formData.confirmPassword && formData.password === formData.confirmPassword
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
                                                {validationErrors.confirmPassword && (
                                                    <p className="mt-1 text-sm text-red-200">{validationErrors.confirmPassword}</p>
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
                                                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl"
                                            >
                                                Continuar
                                                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            </button>
                                        )}

                                        {isLastStep && (
                                            <button
                                                type="submit"
                                                disabled={isLoading || !formData.acceptTerms || !formData.acceptPrivacy}
                                                className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                <span className="relative flex items-center gap-2">
                                                    {buttonStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                                                    {buttonStatus === 'idle' && !isLoading && buttonStatus !== 'success' && buttonStatus !== 'error' && (
                                                        <UserPlus className="h-5 w-5" />
                                                    )}
                                                    {buttonStatus === 'success' && <CheckCircle className="h-5 w-5 text-emerald-200" />}
                                                    {buttonStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-200" />}
                                                    <span>
                                                        {buttonStatus === 'loading'
                                                            ? 'Procesando registro...'
                                                            : buttonStatus === 'success'
                                                                ? '¡Registro enviado!'
                                                                : buttonStatus === 'error'
                                                                    ? 'Error al registrar'
                                                                    : 'Crear cuenta profesional'}
                                                    </span>
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
                        <div className="border-t border-white/10 bg-white/5 px-6 py-5 text-xs text-white/60 sm:px-10">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    <span>Registro seguro y cifrado 256-bit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                    Soporte activo 24/7
                                </div>
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
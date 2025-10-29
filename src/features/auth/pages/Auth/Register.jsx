import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Trophy,
    Mail, Lock, User, Phone, Building, Shield, Check,
    Target, BarChart3, Users, Globe
} from 'lucide-react';
import useAuthStore from '../../../../shared/store/authStore';
import { ROLE_OPTIONS, VALIDATION_RULES, ERROR_MESSAGES } from '../../../../lib/constants';

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

    const validateForm = () => {
        const errors = {};

        // Username
        if (!formData.username.trim()) {
            errors.username = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (formData.username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
            errors.username = ERROR_MESSAGES.USERNAME_TOO_SHORT;
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = ERROR_MESSAGES.USERNAME_INVALID_CHARS;
        }

        // Name
        if (!formData.name.trim()) {
            errors.name = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (formData.name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
            errors.name = ERROR_MESSAGES.NAME_TOO_SHORT;
        }

        // Last name
        if (!formData.lastName.trim()) {
            errors.lastName = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (formData.lastName.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
            errors.lastName = ERROR_MESSAGES.NAME_TOO_SHORT;
        }

        // Email
        if (!formData.email.trim()) {
            errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = ERROR_MESSAGES.INVALID_EMAIL;
        }

        // Phone (opcional pero si se proporciona debe ser válido)
        if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = ERROR_MESSAGES.INVALID_PHONE;
        }

        // Password
        if (!formData.password) {
            errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (formData.password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        } else if (passwordStrength < VALIDATION_RULES.STRONG_PASSWORD_MIN_SCORE) {
            errors.password = ERROR_MESSAGES.WEAK_PASSWORD;
        }

        // Confirm password
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
        }

        // Terms and privacy
        if (!formData.acceptTerms) {
            errors.acceptTerms = ERROR_MESSAGES.ACCEPT_TERMS;
        }

        if (!formData.acceptPrivacy) {
            errors.acceptPrivacy = ERROR_MESSAGES.ACCEPT_PRIVACY;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIsFormTouched(true);

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Limpiar error de validación del campo
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }

        // Limpiar error del servidor
        if (error) {
            clearError();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormTouched(true);

        if (!validateForm()) {
            return;
        }

        const { confirmPassword, acceptTerms, acceptPrivacy, ...registerData } = formData;
        const result = await register({
            ...registerData,
            full_name: `${formData.name} ${formData.lastName}`
        });

        if (result.success) {
            setSuccess(true);
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
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
        <div className="min-h-screen bg-gradient-to-br from-red-600 via-blue-600 to-red-800 flex">
            {/* Panel izquierdo - Información del sistema */}
            <div className="hidden lg:flex lg:w-2/5 flex-col justify-center p-12 text-white">
                <div className="max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Únete al Equipo</h1>
                            <p className="text-white/80 text-sm">Plataforma BasktscoreRD</p>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Forma Parte del Futuro del Baloncesto Dominicano
                    </h2>

                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Accede a herramientas profesionales de análisis, únete a un equipo de expertos
                        y contribuye al éxito de la Selección Nacional.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Colaboración con profesionales del baloncesto</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Herramientas avanzadas de análisis</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Acceso a datos exclusivos del equipo nacional</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Análisis de competencias internacionales</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario de registro */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h1>
                        <p className="text-gray-600">Únete a BasktscoreRD</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error del servidor */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Información personal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.name
                                            ? 'border-red-500 bg-red-50'
                                            : isFormTouched && formData.name
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="Juan"
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                                )}
                            </div>

                            {/* Apellido */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.lastName
                                        ? 'border-red-500 bg-red-50'
                                        : isFormTouched && formData.lastName
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    placeholder="Pérez"
                                    disabled={isLoading}
                                />
                                {validationErrors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Username y Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre de usuario *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.username
                                            ? 'border-red-500 bg-red-50'
                                            : isFormTouched && formData.username
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="usuario123"
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.username && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.email
                                            ? 'border-red-500 bg-red-50'
                                            : isFormTouched && formData.email
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="tu@email.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Teléfono y Organización */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Teléfono */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Teléfono (opcional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.phone
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="+1 (809) 123-4567"
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                                )}
                            </div>

                            {/* Organización */}
                            <div>
                                <label htmlFor="organization" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Organización (opcional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="organization"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                        placeholder="BasktscoreRD, Club, Universidad..."
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rol */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                Rol Profesional *
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                disabled={isLoading}
                            >
                                {ROLE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Contraseñas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contraseña *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.password
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Indicador de fortaleza de contraseña */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {validationErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirmar contraseña *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${validationErrors.confirmPassword
                                            ? 'border-red-500 bg-red-50'
                                            : formData.confirmPassword && formData.password === formData.confirmPassword
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Términos y condiciones */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                    disabled={isLoading}
                                />
                                <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
                                    Acepto los{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                                        términos y condiciones
                                    </Link>{' '}
                                    del sistema *
                                </label>
                            </div>
                            {validationErrors.acceptTerms && (
                                <p className="text-sm text-red-600 ml-8">{validationErrors.acceptTerms}</p>
                            )}

                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="acceptPrivacy"
                                    name="acceptPrivacy"
                                    checked={formData.acceptPrivacy}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                                    disabled={isLoading}
                                />
                                <label htmlFor="acceptPrivacy" className="text-sm text-gray-600 cursor-pointer">
                                    Acepto la{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                                        política de privacidad
                                    </Link>{' '}
                                    y el tratamiento de mis datos *
                                </label>
                            </div>
                            {validationErrors.acceptPrivacy && (
                                <p className="text-sm text-red-600 ml-8">{validationErrors.acceptPrivacy}</p>
                            )}
                        </div>

                        {/* Botón de submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.acceptTerms || !formData.acceptPrivacy}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Crear Cuenta
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link a login */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span>Registro seguro y protegido</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
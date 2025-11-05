import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LogIn, Eye, EyeOff, AlertCircle, Shield, Trophy,
    Target, BarChart3, Mail, Lock, User, CheckCircle2,
    Globe, Users, TrendingUp
} from 'lucide-react';
import useAuthStore from '../../../../shared/store/authStore';
import { DEMO_CREDENTIALS, VALIDATION_RULES, ERROR_MESSAGES, APP_INFO } from '../../../../lib/constants';

const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isFormTouched, setIsFormTouched] = useState(false);

    // Redirect si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Limpiar errores al desmontar
    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'El usuario o email es requerido';
        } else if (formData.username.includes('@')) {
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.username)) {
                errors.username = ERROR_MESSAGES.INVALID_EMAIL;
            }
        } else if (formData.username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
            errors.username = ERROR_MESSAGES.USERNAME_TOO_SHORT;
        }

        if (!formData.password) {
            errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
        } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
            errors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIsFormTouched(true);

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (value || ''),
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

        await login(formData);
    };

    // Usar credenciales de demostración desde constantes

    const fillDemoCredentials = (credentials) => {
        setFormData(prev => ({
            ...prev,
            username: credentials.username,
            password: credentials.password
        }));
        setIsFormTouched(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 via-blue-600 to-red-800 flex">
            {/* Panel izquierdo - Información del sistema */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white">
                <div className="max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Sistema de Análisis</h1>
                            <p className="text-white/80 text-sm">Baloncesto República Dominicana</p>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Análisis Táctico y Predictivo para la Selección Nacional
                    </h2>

                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Plataforma integral para el análisis del rendimiento, predicción de resultados
                        y optimización táctica del equipo nacional de baloncesto.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Análisis avanzado con Machine Learning</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Predicciones tácticas en tiempo real</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Métricas de rendimiento detalladas</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                            </div>
                            <span className="text-white/90">Competencias internacionales</span>
                        </div>
                    </div>

                    <div className="mt-12 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-green-300" />
                            <span className="font-semibold text-green-300">Sistema Seguro</span>
                        </div>
                        <p className="text-sm text-white/80">
                            Datos protegidos con encriptación de nivel empresarial y acceso controlado por roles.
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario de login */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-2xl font-bold text-white">🇩🇴</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h1>
                        <p className="text-gray-600">Accede al sistema de análisis táctico</p>
                    </div>

                    {/* Credenciales de demostración */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">Cuentas de Demostración</span>
                        </div>
                        <div className="space-y-2">
                            {DEMO_CREDENTIALS.map((cred, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillDemoCredentials(cred)}
                                    className="w-full text-left p-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                                    disabled={isLoading}
                                >
                                    <div className="font-medium text-blue-800">{cred.role}</div>
                                    <div className="text-blue-600">{cred.username}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error del servidor */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Username/Email */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                Usuario o Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {formData.username.includes('@') ? (
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-400" />
                                    )}
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
                                    placeholder="usuario o tu@email.com"
                                    disabled={isLoading}
                                />
                                {isFormTouched && formData.username && !validationErrors.username && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                            {validationErrors.username && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Contraseña
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
                                        : isFormTouched && formData.password && formData.password.length >= 6
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Recordar sesión y recuperar contraseña */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                    Recordarme
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Botón de submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.username || !formData.password}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    {/* Link a registro */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            ¿No tienes cuenta?{' '}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>

                    {/* Footer con información adicional */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center text-xs text-gray-500">
                            <p className="mb-2">Sistema oficial de la Federación Dominicana de Baloncesto</p>
                            <div className="flex items-center justify-center gap-4">
                                <span>{APP_INFO.COUNTRY_FLAG} {APP_INFO.ORGANIZATION}</span>
                                <span>•</span>
                                <span>Versión {APP_INFO.VERSION}</span>
                                <span>•</span>
                                <span>{APP_INFO.YEAR}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
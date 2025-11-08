import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LogIn, Eye, EyeOff, AlertCircle, Shield, Trophy,
    Target, BarChart3, Mail, Lock, User, CheckCircle2,
    Globe, TrendingUp, Activity, Award, Loader2
} from 'lucide-react';
import useAuthStore from '../../../../shared/store/authStore';
import { VALIDATION_RULES, ERROR_MESSAGES, APP_INFO } from '../../../../lib/constants';
import logger from '../../../../shared/utils/logger';

// Componente Basketball personalizado (lucide-react no tiene este icono)
const Basketball = ({ className, fill = 'none' }) => (
    <svg className={className} fill={fill} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0-4-10 15.3 15.3 0 0 0 4-10z" />
    </svg>
);

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

        try {
            logger.debug('Iniciando sesión', { username: formData.username });
            const result = await login(formData);
            
            if (result?.success) {
                logger.info('Login exitoso, redirigiendo al dashboard');
                // El useEffect se encargará de navegar cuando isAuthenticated cambie
                // Pero también podemos navegar directamente aquí para asegurar
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 100);
            }
        } catch (err) {
            logger.error('Error en login', err);
            // El error ya se maneja en el authStore
        }
    };

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

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#002D62] via-slate-900 to-[#CE1126] text-white">
            {/* Patrón de fondo con baloncesto */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255,255,255,0.03) 100px, rgba(255,255,255,0.03) 200px)`
                }}></div>
                        </div>
            
            {/* Efectos de luz animados con colores dominicanos */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#CE1126]/30 blur-3xl animate-pulse" />
                <div className="absolute top-1/2 -left-32 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#002D62]/40 blur-3xl animate-pulse delay-700" />
                <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full bg-white/5 blur-2xl animate-pulse delay-300" />
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
                            <Shield className="w-4 h-4 text-[#CE1126]" />
                            Sistema Seguro
                        </div>
                        <div className="p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 backdrop-blur-sm">
                            <p className="text-sm text-white/90">
                            Datos protegidos con encriptación de nivel empresarial y acceso controlado por roles.
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Formulario de login */}
                <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 relative z-10">
                    <div className="w-full max-w-md overflow-hidden rounded-[28px] border-2 border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl sm:rounded-[32px] relative">
                        {/* Efecto de brillo superior */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                        
                        <div className="border-b border-white/20 bg-gradient-to-r from-[#CE1126]/10 via-transparent to-[#002D62]/10 px-5 py-6 sm:px-8 sm:py-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3 sm:gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#CE1126]/50 bg-gradient-to-r from-[#CE1126]/20 to-[#002D62]/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm shadow-lg">
                                        <Shield className="h-4 w-4" />
                                        Acceso Oficial BasktscoreRD
                                    </span>
                                    <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                                        <span className="bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent">
                                            Iniciar Sesión
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
                                            <LogIn className="h-8 w-8" />
                                        </div>
                                    </div>
                        </div>
                    </div>
                        </div>

                        <div className="px-5 py-8 sm:px-8 sm:py-10">
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Basketball className="w-6 h-6 text-[#CE1126]" fill="currentColor" />
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#CE1126] to-[#002D62] bg-clip-text text-transparent">
                                        Bienvenido
                                    </h1>
                                    <Basketball className="w-6 h-6 text-[#002D62]" fill="currentColor" />
                        </div>
                                <p className="text-sm text-white/70">Accede al sistema de análisis táctico</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error del servidor */}
                        {error && (
                                    <div className="bg-red-500/10 border-2 border-red-400/50 text-red-100 px-4 py-3 rounded-xl flex items-center gap-2 backdrop-blur-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-300" />
                                        <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Username/Email */}
                        <div>
                                    <label htmlFor="username" className="block text-sm font-bold text-white mb-2">
                                Usuario o Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {formData.username.includes('@') ? (
                                                <Mail className="w-5 h-5 text-white/60" />
                                    ) : (
                                                <User className="w-5 h-5 text-white/60" />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-white/90 border rounded-2xl text-slate-900 focus:ring-4 focus:ring-[#CE1126]/30 focus:border-[#CE1126] transition-all duration-200 placeholder:text-slate-400 ${validationErrors.username
                                                ? 'border-red-400/70 bg-red-50'
                                                : isFormTouched && formData.username && !validationErrors.username
                                                    ? 'border-emerald-400/70 bg-emerald-50/60'
                                                    : 'border-transparent'
                                        }`}
                                    placeholder="usuario o tu@email.com"
                                    disabled={isLoading}
                                />
                                {isFormTouched && formData.username && !validationErrors.username && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                )}
                            </div>
                            {validationErrors.username && (
                                        <p className="mt-2 text-sm text-red-200 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                                    <label htmlFor="password" className="block text-sm font-bold text-white mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-white/60" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                            className={`w-full pl-10 pr-12 py-3 bg-white/90 border rounded-2xl text-slate-900 focus:ring-4 focus:ring-[#CE1126]/30 focus:border-[#CE1126] transition-all duration-200 placeholder:text-slate-400 ${validationErrors.password
                                                ? 'border-red-400/70 bg-red-50'
                                                : isFormTouched && formData.password && formData.password.length >= 6 && !validationErrors.password
                                                    ? 'border-emerald-400/70 bg-emerald-50/60'
                                                    : 'border-transparent'
                                        }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CE1126] hover:text-[#002D62] transition-colors"
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
                                        <p className="mt-2 text-sm text-red-200 flex items-center gap-1">
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
                                            className="w-4 h-4 text-[#CE1126] border-white/30 rounded focus:ring-[#CE1126] bg-white/20 transition-colors"
                                    disabled={isLoading}
                                />
                                        <span className="ml-2 text-sm text-white/80 hover:text-white transition-colors font-medium">
                                    Recordarme
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                        className="text-sm text-white/80 hover:text-[#CE1126] font-semibold transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Botón de submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.username || !formData.password}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#CE1126] via-red-600 to-[#002D62] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#CE1126]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#CE1126]/60 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <span className="relative flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                                <LogIn className="h-5 w-5" />
                                    Iniciar Sesión
                                </>
                            )}
                                    </span>
                        </button>
                    </form>

                    {/* Link a registro */}
                            <div className="mt-6 text-center text-sm text-white/70">
                            ¿No tienes cuenta?{' '}
                            <Link
                                to="/register"
                                    className="font-bold text-[#CE1126] hover:text-[#002D62] transition-colors"
                            >
                                Regístrate aquí
                            </Link>
                    </div>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t border-white/20 text-center">
                                <div className="text-xs text-white/60">
                                    <p className="mb-2">Plataforma oficial BasktscoreRD</p>
                            <div className="flex items-center justify-center gap-4">
                                <span>{APP_INFO.COUNTRY_FLAG} {APP_INFO.ORGANIZATION}</span>
                                <span>•</span>
                                <span>Versión {APP_INFO.VERSION}</span>
                                <span>•</span>
                                <span>{APP_INFO.YEAR}</span>
                                    </div>
                                    <p className="mt-3 text-[10px] uppercase tracking-wider">
                                        Análisis Táctico y Predictivo • Selección Nacional RD • 2010-2025
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
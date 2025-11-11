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
import backgroundImage from '../../../../assets/images/unnamed.jpg';

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
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            {/* Imagen de fondo más visible */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{ 
                    backgroundImage: `url(${backgroundImage})`,
                    imageRendering: '-webkit-optimize-contrast',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                }}
            ></div>
            
            {/* Overlay oscuro sobre la imagen */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-[#002D62]/75 to-slate-950/85"></div>
            
            {/* Fondo con patrón de cuadrícula sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Efectos de luz modernos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#CE1126]/20 blur-3xl" />
                <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-[#002D62]/20 blur-3xl" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center p-4">
                {/* Contenedor del formulario centrado */}
                <div className="w-full max-w-md relative z-10">
                    {/* Imagen destacada arriba */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative w-full max-w-xs h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                            <img 
                                src={backgroundImage} 
                                alt="Basketball" 
                                className="w-full h-full object-cover"
                                style={{
                                    imageRendering: '-webkit-optimize-contrast',
                                    backfaceVisibility: 'hidden',
                                    transform: 'translateZ(0)',
                                }}
                                loading="eager"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                            <div className="absolute bottom-3 left-0 right-0 text-center">
                                <p className="text-xs font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">Selección Nacional RD</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Logo y título arriba */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[#CE1126] to-[#002D62] p-0.5 shadow-2xl shadow-[#CE1126]/50">
                                <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
                                    <Basketball className="h-10 w-10 text-white" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                                BasktscoreRD
                            </span>
                        </h1>
                        <p className="text-sm text-white/60">
                            Sistema de Análisis Táctico • Selección Nacional RD
                        </p>
                    </div>
                    {/* Formulario */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                        {/* Borde gradiente animado */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#CE1126]/50 via-[#002D62]/50 to-[#CE1126]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                        
                        <div className="relative p-8 sm:p-10">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    Bienvenido de vuelta
                                </h2>
                                <p className="text-sm text-white/60">
                                    Ingresa tus credenciales para continuar
                                </p>
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
                                            className={`w-full pl-10 pr-4 py-3 bg-white/95 border-2 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 placeholder:text-slate-400 ${validationErrors.username
                                                ? 'border-red-400 bg-red-50'
                                                : isFormTouched && formData.username && !validationErrors.username
                                                    ? 'border-emerald-400 bg-emerald-50'
                                                    : 'border-white/20'
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
                                            className={`w-full pl-10 pr-12 py-3 bg-white/95 border-2 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 placeholder:text-slate-400 ${validationErrors.password
                                                ? 'border-red-400 bg-red-50'
                                                : isFormTouched && formData.password && formData.password.length >= 6 && !validationErrors.password
                                                    ? 'border-emerald-400 bg-emerald-50'
                                                    : 'border-white/20'
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
                                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#CE1126] to-[#002D62] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#CE1126]/30 transition-all duration-200 hover:shadow-xl hover:shadow-[#CE1126]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                        >
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

                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-2">
                            <Shield className="w-3 h-3" />
                            <span>Datos protegidos con encriptación de nivel empresarial</span>
                        </div>
                        <p className="text-xs text-white/30">
                            © {APP_INFO.YEAR} BasktscoreRD • Versión {APP_INFO.VERSION}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
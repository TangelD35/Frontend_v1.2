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
import backgroundImage from '../../../../assets/images/baskt.webp';
import './Login.css';

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
    const [fieldTouched, setFieldTouched] = useState({ username: false, password: false });
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);

    // Redirect si ya está autenticado (solo al cargar la página)
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, []); // Solo ejecutar al montar el componente

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

        // Validación en tiempo real solo si el campo ya fue tocado
        if (fieldTouched[name] && name !== 'rememberMe') {
            const errors = {};
            if (name === 'username') {
                if (!value.trim()) {
                    errors.username = 'El usuario o email es requerido';
                } else if (value.includes('@')) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        errors.username = 'Email inválido';
                    }
                } else if (value.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
                    errors.username = `Mínimo ${VALIDATION_RULES.USERNAME_MIN_LENGTH} caracteres`;
                }
            } else if (name === 'password') {
                if (!value) {
                    errors.password = 'La contraseña es requerida';
                } else if (value.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
                    errors.password = `Mínimo ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`;
                }
            }
            setValidationErrors(prev => ({ ...prev, ...errors, [name]: errors[name] || '' }));
        } else {
            // Limpiar error si existe
            if (validationErrors[name]) {
                setValidationErrors(prev => ({ ...prev, [name]: '' }));
            }
        }

        // Limpiar error del servidor
        if (error) {
            clearError();
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setFieldTouched(prev => ({ ...prev, [name]: true }));
        // Trigger validation on blur
        handleChange(e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormTouched(true);

        if (!validateForm()) {
            return;
        }

        // Verificar si está bloqueado
        if (isBlocked) {
            return;
        }

        try {
            logger.debug('Iniciando sesión', { username: formData.username });
            const result = await login(formData);
            
            if (result?.success) {
                logger.info('Login exitoso, redirigiendo al dashboard');
                setLoginAttempts(0); // Reset intentos
                // Navegar al dashboard
                navigate('/dashboard', { replace: true });
            } else {
                // Login fallido - NO navegar, quedarse en la página
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);
                
                // Analizar el mensaje de error para mostrar mensaje específico
                const errorMsg = result?.error || error || '';
                const lowerError = errorMsg.toLowerCase();
                
                // Determinar si es error de usuario o contraseña
                if (lowerError.includes('usuario') || lowerError.includes('username') || lowerError.includes('user not found')) {
                    setValidationErrors(prev => ({ ...prev, username: 'Usuario no encontrado' }));
                } else if (lowerError.includes('contraseña') || lowerError.includes('password') || lowerError.includes('incorrect') || lowerError.includes('incorrecta')) {
                    setValidationErrors(prev => ({ ...prev, password: 'Contraseña incorrecta' }));
                } else if (lowerError.includes('credenciales') || lowerError.includes('credentials')) {
                    setValidationErrors(prev => ({ 
                        username: 'Credenciales incorrectas',
                        password: 'Credenciales incorrectas'
                    }));
                }
                
                // Bloquear después de 5 intentos
                if (newAttempts >= 5) {
                    setIsBlocked(true);
                    setTimeout(() => {
                        setIsBlocked(false);
                        setLoginAttempts(0);
                    }, 30000); // 30 segundos de bloqueo
                }
            }
        } catch (err) {
            logger.error('Error en login', err);
            // Error de red u otro - NO navegar
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            
            if (newAttempts >= 5) {
                setIsBlocked(true);
                setTimeout(() => {
                    setIsBlocked(false);
                    setLoginAttempts(0);
                }, 30000);
            }
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
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ 
                    backgroundImage: `url(${backgroundImage})`,
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

            <div className="relative flex min-h-screen items-center justify-center p-4">
                {/* Contenedor del formulario centrado */}
                <div className="w-full max-w-md relative z-10">
                    {/* Logo y título arriba */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[#CE1126] via-white to-[#002D62] p-1 shadow-2xl shadow-[#CE1126]/50">
                                <div className="h-full w-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center p-1">
                                    <img 
                                        src="/logo-rdscore.png" 
                                        alt="BasktscoreRD Logo" 
                                        className="h-full w-full object-contain drop-shadow-lg"
                                        style={{
                                            imageRendering: '-webkit-optimize-contrast',
                                            backfaceVisibility: 'hidden',
                                            transform: 'translateZ(0) scale(1.15)',
                                            filter: 'brightness(1.1) contrast(1.1)',
                                        }}
                                    />
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
                        {/* Mensaje de bloqueo */}
                        {isBlocked && (
                            <div className="bg-orange-500/10 border-2 border-orange-400/50 text-orange-100 px-4 py-3 rounded-xl flex items-center gap-2 backdrop-blur-sm animate-pulse">
                                <Shield className="w-5 h-5 flex-shrink-0 text-orange-300" />
                                <div>
                                    <p className="text-sm font-bold">Cuenta bloqueada temporalmente</p>
                                    <p className="text-xs text-orange-200/80">Demasiados intentos fallidos. Espera 30 segundos.</p>
                                </div>
                            </div>
                        )}

                        {/* Error del servidor */}
                        {error && !isBlocked && (
                            <div className="bg-red-500/10 border-2 border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-300 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{error}</p>
                                        {loginAttempts > 0 && loginAttempts < 5 && (
                                            <p className="text-xs text-red-200/70 mt-1">
                                                Intentos restantes: {5 - loginAttempts}
                                            </p>
                                        )}
                                    </div>
                                </div>
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
                                    onBlur={handleBlur}
                                    autoComplete="username"
                                            className={`w-full pl-10 pr-4 py-3 bg-white/95 border-2 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 placeholder:text-slate-400 ${validationErrors.username
                                                ? 'border-red-400 bg-red-50 shake'
                                                : fieldTouched.username && formData.username && !validationErrors.username
                                                    ? 'border-emerald-400 bg-emerald-50'
                                                    : 'border-white/20'
                                        }`}
                                    placeholder="usuario o tu@email.com"
                                    disabled={isLoading || isBlocked}
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
                                    onBlur={handleBlur}
                                    autoComplete="current-password"
                                            className={`w-full pl-10 pr-12 py-3 bg-white/95 border-2 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 placeholder:text-slate-400 ${validationErrors.password
                                                ? 'border-red-400 bg-red-50 shake'
                                                : fieldTouched.password && formData.password && formData.password.length >= 6 && !validationErrors.password
                                                    ? 'border-emerald-400 bg-emerald-50'
                                                    : 'border-white/20'
                                        }`}
                                    placeholder="••••••••"
                                    disabled={isLoading || isBlocked}
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
                            disabled={isLoading || !formData.username || !formData.password || isBlocked}
                                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#CE1126] to-[#002D62] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#CE1126]/30 transition-all duration-200 hover:shadow-xl hover:shadow-[#CE1126]/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg disabled:grayscale"
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
// Constantes de la aplicación

// Roles de usuario
export const USER_ROLES = {
    ANALYST: 'analyst',
    COACH: 'coach',
    ASSISTANT_COACH: 'assistant_coach',
    SCOUT: 'scout',
    MANAGER: 'manager',
    ADMIN: 'admin',
};

// Opciones de roles para formularios
export const ROLE_OPTIONS = [
    { value: USER_ROLES.ANALYST, label: 'Analista de Rendimiento' },
    { value: USER_ROLES.COACH, label: 'Entrenador' },
    { value: USER_ROLES.ASSISTANT_COACH, label: 'Entrenador Asistente' },
    { value: USER_ROLES.SCOUT, label: 'Scout' },
    { value: USER_ROLES.MANAGER, label: 'Director Técnico' },
    { value: USER_ROLES.ADMIN, label: 'Administrador' },
];

// Credenciales de demostración
export const DEMO_CREDENTIALS = [
    {
        username: 'analista@basktscorerd.com',
        password: 'demo123',
        role: 'Analista Principal'
    },
    {
        username: 'entrenador@basktscorerd.com',
        password: 'demo123',
        role: 'Entrenador'
    },
    {
        username: 'admin@basktscorerd.com',
        password: 'demo123',
        role: 'Administrador'
    },
];

// Configuración de validación
export const VALIDATION_RULES = {
    USERNAME_MIN_LENGTH: 3,
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    STRONG_PASSWORD_MIN_SCORE: 3,
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'Formato de email inválido',
    INVALID_PHONE: 'Formato de teléfono inválido',
    PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`,
    PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
    USERNAME_TOO_SHORT: `El nombre de usuario debe tener al menos ${VALIDATION_RULES.USERNAME_MIN_LENGTH} caracteres`,
    USERNAME_INVALID_CHARS: 'Solo se permiten letras, números y guiones bajos',
    NAME_TOO_SHORT: `El nombre debe tener al menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`,
    WEAK_PASSWORD: 'La contraseña debe ser más segura',
    ACCEPT_TERMS: 'Debes aceptar los términos y condiciones',
    ACCEPT_PRIVACY: 'Debes aceptar la política de privacidad',
};

// Información de la aplicación
export const APP_INFO = {
    NAME: 'BasktscoreRD',
    VERSION: '2.0',
    YEAR: '2025',
    ORGANIZATION: 'BasktscoreRD',
    COUNTRY_FLAG: '🇩🇴',
};

// Elementos de navegación (iconos se importan en el componente que los usa)
export const NAVIGATION_ITEMS = [
    {
        path: '/dashboard',
        icon: 'Home',
        label: 'Dashboard',
        description: 'Vista general',
        color: 'from-red-500 to-red-600'
    },
    {
        path: '/dashboard/enhanced',
        icon: 'Grid3X3',
        label: 'Dashboard Avanzado',
        description: 'Widgets interactivos',
        color: 'from-purple-500 to-purple-600'
    },
    {
        path: '/tournaments',
        icon: 'Trophy',
        label: 'Torneos',
        description: 'Competiciones',
        color: 'from-blue-500 to-blue-600'
    },
    {
        path: '/teams',
        icon: 'Shield',
        label: 'Equipos',
        description: 'Análisis rivales',
        color: 'from-red-600 to-red-700'
    },
    {
        path: '/players',
        icon: 'UserCircle',
        label: 'Jugadores',
        description: 'Plantel nacional',
        color: 'from-blue-600 to-blue-700'
    },
    {
        path: '/games',
        icon: 'Calendar',
        label: 'Partidos',
        description: 'Encuentros',
        color: 'from-red-500 to-blue-500'
    },
    {
        path: '/analytics',
        icon: 'BarChart3',
        label: 'Analíticas',
        description: 'Métricas',
        color: 'from-red-600 to-blue-600'
    },
    {
        path: '/predictions',
        icon: 'Target',
        label: 'Predicciones',
        description: 'Modelos ML',
        color: 'from-blue-500 to-red-500'
    },
    {
        path: '/data/management',
        icon: 'Database',
        label: 'Gestión de Datos',
        description: 'Importar y exportar',
        color: 'from-green-500 to-green-600'
    }
];

// Estadísticas del sistema
export const SYSTEM_STATS = {
    PERIOD: '2010-2025',
    TOTAL_GAMES: 245,
    VICTORIES: 142,
    EFFECTIVENESS: 57.9,
};
import { validationRules } from '../../shared/hooks/useFormValidation';

// Esquema de validación para Torneos
export const tournamentSchema = {
    name: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(200),
    ],
    season: [
        validationRules.required,
        validationRules.minLength(4),
        validationRules.maxLength(50),
    ],
    type: [
        validationRules.maxLength(100),
    ],
    sede: [
        validationRules.maxLength(150),
    ],
    start_date: [
        validationRules.required,
        validationRules.date,
    ],
    end_date: [
        validationRules.required,
        validationRules.date,
        validationRules.custom(
            (value, formData) => {
                if (!value || !formData.start_date) return true;
                return new Date(value) >= new Date(formData.start_date);
            },
            'La fecha de fin debe ser posterior a la de inicio'
        ),
    ],
    total_participants: [
        validationRules.required,
        validationRules.number,
        validationRules.integer,
        validationRules.min(2),
        validationRules.max(100),
    ],
    is_international: [
        // Campo booleano, no necesita validación especial
    ],
};

// Esquema de validación para Equipos
export const teamSchema = {
    name: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(255),
    ],
    country: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(100),
    ],
    coach: [
        validationRules.minLength(3),
        validationRules.maxLength(150),
    ],
    founded_year: [
        validationRules.number,
        validationRules.integer,
        validationRules.min(1800),
        validationRules.max(new Date().getFullYear()),
    ],
    is_national_team: [
        // Boolean field, no validation needed
    ],
};

// Esquema de validación para Jugadores
export const playerSchema = {
    first_name: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(100),
        validationRules.pattern(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            'El nombre solo puede contener letras y espacios'
        ),
    ],
    last_name: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(100),
        validationRules.pattern(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            'El apellido solo puede contener letras y espacios'
        ),
    ],
    full_name: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(200),
    ],
    jersey_number: [
        validationRules.number,
        validationRules.integer,
        validationRules.min(0),
        validationRules.max(99),
    ],
    height_cm: [
        validationRules.number,
        validationRules.integer,
        validationRules.min(150),
        validationRules.max(250),
    ],
    position: [
        // Opcional, se valida con opciones predefinidas
    ],
    nationality: [
        validationRules.maxLength(100),
    ],
    birth_date: [
        validationRules.date,
    ],
    team_id: [
        validationRules.required,
    ],
    status: [
        validationRules.required,
        validationRules.custom(
            (value) => ['activo', 'inactivo'].includes(value),
            'El status debe ser activo o inactivo'
        ),
    ],
};

// Esquema de validación para Partidos
export const gameSchema = {
    homeTeam: [
        validationRules.required,
        validationRules.minLength(2),
    ],
    awayTeam: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.custom(
            (value, formData) => value !== formData.homeTeam,
            'El equipo visitante debe ser diferente al local'
        ),
    ],
    date: [
        validationRules.required,
        validationRules.date,
    ],
    time: [
        validationRules.required,
        validationRules.pattern(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            'Formato de hora inválido. Use: HH:MM'
        ),
    ],
    venue: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(200),
    ],
    tournament: [
        validationRules.required,
        validationRules.minLength(2),
    ],
};

// Esquema de validación para Login
export const loginSchema = {
    username: [
        validationRules.required,
        validationRules.minLength(3),
    ],
    password: [
        validationRules.required,
        validationRules.minLength(6),
    ],
};

// Esquema de validación para Registro
export const registerSchema = {
    username: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(50),
        validationRules.pattern(
            /^[a-zA-Z0-9_]+$/,
            'Solo letras, números y guiones bajos'
        ),
    ],
    email: [
        validationRules.required,
        validationRules.email,
    ],
    name: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(100),
    ],
    password: [
        validationRules.required,
        validationRules.minLength(6),
        validationRules.maxLength(50),
        validationRules.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Debe contener al menos una mayúscula, una minúscula y un número'
        ),
    ],
    confirmPassword: [
        validationRules.required,
        validationRules.match('password', 'la contraseña'),
    ],
};

// Esquema de validación para estadísticas de partido
export const gameStatsSchema = {
    homeScore: [
        validationRules.required,
        validationRules.number,
        validationRules.integer,
        validationRules.min(0),
        validationRules.max(200),
    ],
    awayScore: [
        validationRules.required,
        validationRules.number,
        validationRules.integer,
        validationRules.min(0),
        validationRules.max(200),
    ],
};

// Esquema de validación para estadísticas de jugador
export const playerStatsSchema = {
    points: [
        validationRules.required,
        validationRules.number,
        validationRules.min(0),
        validationRules.max(100),
    ],
    rebounds: [
        validationRules.required,
        validationRules.number,
        validationRules.min(0),
        validationRules.max(50),
    ],
    assists: [
        validationRules.required,
        validationRules.number,
        validationRules.min(0),
        validationRules.max(50),
    ],
    minutes: [
        validationRules.required,
        validationRules.number,
        validationRules.min(0),
        validationRules.max(48),
    ],
};

export const analyticsSchema = {
    reportName: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(100),
    ],
    startDate: [
        validationRules.required,
        validationRules.date,
        validationRules.pastDate,
    ],
    endDate: [
        validationRules.required,
        validationRules.date,
        validationRules.custom(
            (value, formData) => {
                if (!value || !formData.startDate) return true;
                return new Date(value) >= new Date(formData.startDate);
            },
            'La fecha de fin debe ser posterior a la de inicio'
        ),
    ],
    metrics: [
        validationRules.required,
        validationRules.custom(
            (value) => value && value.length > 0,
            'Selecciona al menos una métrica'
        ),
    ],
    teams: [
        validationRules.required,
        validationRules.custom(
            (value) => value && value.length > 0,
            'Selecciona al menos un equipo'
        ),
    ],
    description: [
        validationRules.maxLength(500),
    ],
};
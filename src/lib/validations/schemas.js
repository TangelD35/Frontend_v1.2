import { validationRules } from '../../shared/hooks/useFormValidation';

// Esquema de validación para Torneos
export const tournamentSchema = {
    name: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(100),
    ],
    type: [
        validationRules.required,
    ],
    startDate: [
        validationRules.required,
        validationRules.date,
    ],
    endDate: [
        validationRules.date,
        validationRules.custom(
            (value, formData) => {
                if (!value || !formData.startDate) return true;
                return new Date(value) >= new Date(formData.startDate);
            },
            'La fecha de fin debe ser posterior a la de inicio'
        ),
    ],
    location: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(200),
    ],
    teams: [
        validationRules.required,
        validationRules.number,
        validationRules.integer,
        validationRules.min(2),
        validationRules.max(100),
    ],
    description: [
        validationRules.maxLength(500),
    ],
};

// Esquema de validación para Equipos
export const teamSchema = {
    name: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(100),
    ],
    country: [
        validationRules.required,
        validationRules.minLength(2),
        validationRules.maxLength(50),
    ],
    category: [
        validationRules.required,
    ],
    coach: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(100),
    ],
    founded: [
        validationRules.date,
        validationRules.pastDate,
    ],
    description: [
        validationRules.maxLength(500),
    ],
};

// Esquema de validación para Jugadores
export const playerSchema = {
    name: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(100),
        validationRules.pattern(
            /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            'El nombre solo puede contener letras y espacios'
        ),
    ],
    number: [
        validationRules.required,
        validationRules.number,
        validationRules.integer,
        validationRules.min(0),
        validationRules.max(99),
    ],
    position: [
        validationRules.required,
    ],
    age: [
        validationRules.required,
        validationRules.number,
        validationRules.integer,
        validationRules.min(15),
        validationRules.max(50),
    ],
    height: [
        validationRules.required,
        validationRules.pattern(
            /^\d\.\d{2}m$/,
            'Formato de altura inválido. Use: 2.13m'
        ),
    ],
    team: [
        validationRules.required,
        validationRules.minLength(2),
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
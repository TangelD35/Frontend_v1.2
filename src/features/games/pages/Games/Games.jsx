import {
    Plus,
    Calendar,
    Clock,
    MapPin,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    Trophy,
    Target,
    Activity,
    Zap,
    Shield,
    Star,
    Users,
    TrendingUp,
    X,
    CheckCircle,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { gameSchema } from '../../../../lib/validations/schemas';
import { useGames } from '../../hooks/useGames';
import { useTeams } from '../../../teams/hooks/useTeams';
import { useTournaments } from '../../../tournaments/hooks/useTournaments';
import { GlassCard, AnimatedButton, LoadingState, ErrorState, ModernModal, ToastContainer } from '../../../../shared/ui/components/modern';

import {
    Table,
    Input,
    Select,
    StatusIndicator
} from '../../../../shared/ui/components/common';

// Componente de Logo RDscore
const RDScoreLogo = ({ size = 48, className = "" }) => (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <img
            src="/logo-rdscore.png"
            alt="RDscore Logo"
            className="w-full h-full object-contain rounded-xl shadow-2xl"
            style={{ width: size, height: size }}
        />
    </div>
);

// Componente de Estadística Deportiva Personalizada
const SportsStat = ({ icon: Icon, value, label, trend, color = "blue", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay }}
        className="relative group"
    >
        <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-2xl"></div>

            {/* Contenido */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br from-${color}-500/20 to-${color}-600/30 rounded-xl shadow-lg`}>
                        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-semibold">+{trend}%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {value}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                </div>
            </div>

            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </div>
    </motion.div>
);

const Games = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [hasAdminPermissions, setHasAdminPermissions] = useState(true); // Por defecto true, se actualizará con el primer error 403

    // Hooks para obtener datos reales desde la API
    const { games, loading, error, pagination, filters, createGame, updateGame, deleteGame, updateFilters, updatePagination, adjustLimit, refetch } = useGames();
    const { teams } = useTeams({ limit: 200 });
    const { tournaments } = useTournaments();

    // Usar el hook de validación
    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit: validateAndSubmit,
        reset,
        setFieldValue
    } = useFormValidation({
        homeTeam: '',
        awayTeam: '',
        date: '',
        time: '',
        venue: '',
        tournament: ''
    }, gameSchema);

    // Mapas de ayuda para mostrar nombres en lugar de IDs
    const teamNameById = {
        'republica_dominicana': 'República Dominicana'
    };
    (teams || []).forEach(team => {
        if (team?.id) {
            teamNameById[team.id] = team.name;
        }
    });

    const tournamentNameById = {
        'copa_mundial_fiba_2023': 'Copa Mundial FIBA 2023',
        'americup_2022': 'AmeriCup 2022',
        'centrobasket_2024': 'Centrobasket 2024',
        'clasificatorias_fiba': 'Clasificatorias FIBA'
    };
    (tournaments || []).forEach(tournament => {
        if (tournament?.id) {
            tournamentNameById[tournament.id] = tournament.name;
        }
    });

    // Adaptar datos de la API a un formato amigable para la UI
    const mappedGames = (games || []).map((game) => {
        const dateObj = game.game_date ? new Date(game.game_date) : null;

        const homeName = teamNameById[game.home_team_id] || 'Equipo local';
        const awayName = teamNameById[game.away_team_id] || 'Equipo visitante';
        const tournamentName = tournamentNameById[game.tournament_id] || 'Torneo';


        return {
            id: game.id,
            homeTeam: homeName,
            awayTeam: awayName,
            homeLogo: '🏀',
            awayLogo: '🏀',
            homeScore: game.home_score,
            awayScore: game.away_score,
            date: dateObj ? dateObj.toISOString() : null,
            time: dateObj
                ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                : '--:--',
            venue: game.location || 'Sin sede',
            tournament: tournamentName,
            status: game.status || 'unknown', // Mostrar 'unknown' si el estado es null/undefined
        };
    });

    // Detectar tamaño de pantalla para ajustar sidebar
    useEffect(() => {
        const checkSidebarState = () => {
            const isLargeScreen = window.innerWidth >= 1024;
            setIsSidebarOpen(isLargeScreen);
        };

        checkSidebarState();
        window.addEventListener('resize', checkSidebarState);
        return () => window.removeEventListener('resize', checkSidebarState);
    }, []);

    // Estadísticas
    const completedGames = mappedGames.filter(g => g.status === 'completed');
    const victories = completedGames.filter(g =>
        (g.homeTeam === 'República Dominicana' && g.homeScore > g.awayScore) ||
        (g.awayTeam === 'República Dominicana' && g.awayScore > g.homeScore)
    ).length;
    const upcomingGames = mappedGames.filter(g => g.status === 'scheduled').length;

    // Configuración de columnas
    const columns = [
        {
            key: 'teams',
            label: 'Encuentro',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div className="text-2xl mb-1">{row.homeLogo}</div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">{row.homeTeam}</p>
                    </div>
                    <div className="text-center px-4">
                        {row.status === 'completed' ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{row.homeScore}</span>
                                <span className="text-gray-500 font-medium">-</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{row.awayScore}</span>
                            </div>
                        ) : (
                            <span className="text-lg text-gray-500 font-bold tracking-wider">VS</span>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-1">{row.awayLogo}</div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">{row.awayTeam}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'tournament',
            label: 'Torneo',
            render: (value) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm tracking-wide">{value}</p>
                </div>
            )
        },
        {
            key: 'datetime',
            label: 'Fecha y Hora',
            sortable: false,
            render: (_, row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">
                            {row.date ? new Date(row.date).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium">{row.time}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Estado',
            render: (value) => {
                const normalized = (value || '').toLowerCase();
                const config = {
                    completed: { status: 'inactive', label: 'Finalizado' },
                    scheduled: { status: 'pending', label: 'Programado' },
                    live: { status: 'active', label: 'En Vivo' },
                };

                const fallback = { status: 'pending', label: normalized || 'Desconocido' };
                const mapped = config[normalized] || fallback;

                return <StatusIndicator status={mapped.status} label={mapped.label} />;
            }
        },
        {
            key: 'actions',
            label: 'Acciones',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/games/${row.id}`);
                        }}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasAdminPermissions) {
                                handleEdit(row);
                            } else {
                                showToast(
                                    'warning',
                                    'Permisos Requeridos',
                                    'Necesitas permisos de administrador para editar encuentros.'
                                );
                            }
                        }}
                        disabled={!hasAdminPermissions}
                        className={`p-2 rounded-lg transition-colors ${hasAdminPermissions
                            ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Función para mostrar toasts modernos
    const showToast = (type, title, message) => {
        const id = Date.now();
        const newToast = {
            id,
            type,
            title,
            message,
            duration: 5000
        };
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Funciones de manejo
    const handleEdit = (game) => {
        // Buscar el juego original para obtener los IDs reales
        const originalGame = (games || []).find(g => g.id === game.id);

        setSelectedGame(game);
        setFieldValue('homeTeam', originalGame?.home_team_id || '');
        setFieldValue('awayTeam', originalGame?.away_team_id || '');
        setFieldValue('date', game.date ? game.date.split('T')[0] : '');
        setFieldValue('time', game.time);
        setFieldValue('venue', game.venue);
        setFieldValue('tournament', originalGame?.tournament_id || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (game) => {
        if (confirm(`¿Eliminar el partido ${game.homeTeam} vs ${game.awayTeam}?`)) {
            try {
                await deleteGame(game.id);
                showToast(
                    'success',
                    'Partido eliminado',
                    `El partido ${game.homeTeam} vs ${game.awayTeam} ha sido eliminado correctamente.`
                );
            } catch (error) {
                console.error('Error al eliminar partido:', error);

                // Manejo específico de errores de permisos
                if (error.status === 403) {
                    setHasAdminPermissions(false); // Actualizar estado de permisos
                    showToast(
                        'error',
                        'Acceso Denegado',
                        'No tienes permisos de administrador para eliminar partidos. Contacta al administrador del sistema.'
                    );
                } else if (error.status === 401) {
                    showToast(
                        'error',
                        'Sesión Expirada',
                        'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                    );
                } else {
                    showToast(
                        'error',
                        'Error al eliminar',
                        error.message || 'No se pudo eliminar el partido. Por favor, inténtalo de nuevo.'
                    );
                }
            }
        }
    };

    const onSubmit = async (formData) => {
        try {
            const isEditing = selectedGame !== null;

            // Preparar datos para la API
            const gameData = {
                home_team_id: formData.homeTeam, // Esto debería ser el ID del equipo
                away_team_id: formData.awayTeam, // Esto debería ser el ID del equipo
                game_date: new Date(`${formData.date}T${formData.time}`).toISOString(),
                location: formData.venue,
                tournament_id: formData.tournament, // Esto debería ser el ID del torneo
                status: 'scheduled' // Estado por defecto para nuevos partidos
            };

            // Obtener nombres para mostrar en los toasts
            const homeTeamName = teamNameById[formData.homeTeam] || formData.homeTeam;
            const awayTeamName = teamNameById[formData.awayTeam] || formData.awayTeam;

            if (isEditing) {
                // Actualizar partido existente
                await updateGame(selectedGame.id, gameData);
                showToast(
                    'success',
                    'Encuentro actualizado',
                    `El encuentro ${homeTeamName} vs ${awayTeamName} ha sido actualizado correctamente.`
                );
            } else {
                // Crear nuevo partido
                await createGame(gameData);
                showToast(
                    'success',
                    'Encuentro programado',
                    `El encuentro ${homeTeamName} vs ${awayTeamName} ha sido programado para el ${new Date(formData.date).toLocaleDateString('es-ES')}.`
                );
            }

            setIsModalOpen(false);
            reset();
        } catch (error) {
            console.error('Error al guardar partido:', error);

            // Manejo específico de errores de permisos
            if (error.status === 403) {
                setHasAdminPermissions(false); // Actualizar estado de permisos
                showToast(
                    'error',
                    'Acceso Denegado',
                    'No tienes permisos de administrador para crear partidos. Contacta al administrador del sistema.'
                );
            } else if (error.status === 401) {
                showToast(
                    'error',
                    'Sesión Expirada',
                    'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                );
            } else if (error.status === 422) {
                showToast(
                    'error',
                    'Datos Inválidos',
                    'Los datos del formulario no son válidos. Verifica que todos los campos estén completos y correctos.'
                );
            } else {
                showToast(
                    'error',
                    'Error al guardar',
                    error.message || 'No se pudo guardar el partido. Por favor, inténtalo de nuevo.'
                );
            }
        }
    };

    const openCreateModal = () => {
        setSelectedGame(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleRefresh = async () => {
        try {
            await refetch();
            showToast(
                'success',
                'Datos actualizados',
                'La información de los partidos ha sido actualizada correctamente.'
            );
        } catch (error) {
            showToast(
                'error',
                'Error al actualizar',
                'No se pudieron actualizar los datos. Verifica tu conexión e inténtalo de nuevo.'
            );
        }
    };


    // Ajustar límite de elementos por página cuando cambie el estado del sidebar
    useEffect(() => {
        adjustLimit(isSidebarOpen);
    }, [isSidebarOpen, adjustLimit]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#CE1126]/5 via-white to-[#002D62]/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header Gubernamental Profesional */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-[#CE1126] via-[#CE1126]/95 to-[#002D62] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl">
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Identidad Institucional */}
                        <div className="flex items-center gap-6">
                            <RDScoreLogo size={64} className="flex-shrink-0" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                                        Sistema de Partidos
                                    </h1>
                                    <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                                        <Activity className="w-4 h-4 text-white/80" />
                                        <span className="text-xs font-semibold text-white/90 tracking-wide">EN VIVO</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-white/90">
                                    <Target className="w-4 h-4" />
                                    <span className="text-sm font-medium">Selección Nacional de República Dominicana</span>
                                </div>
                            </div>
                        </div>

                        {/* Controles de Acción */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 text-white font-medium transition-all duration-200 shadow-lg"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Actualizar</span>
                            </motion.button>

                            <motion.button
                                whileHover={hasAdminPermissions ? { scale: 1.05 } : {}}
                                whileTap={hasAdminPermissions ? { scale: 0.95 } : {}}
                                onClick={hasAdminPermissions ? openCreateModal : () => {
                                    showToast(
                                        'warning',
                                        'Permisos Requeridos',
                                        'Necesitas permisos de administrador para programar encuentros.'
                                    );
                                }}
                                disabled={!hasAdminPermissions}
                                className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-xl transition-all duration-200 border ${hasAdminPermissions
                                    ? 'bg-gradient-to-r from-white to-white/90 hover:from-white/90 hover:to-white text-[#CE1126] border-white/50 cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Programar Encuentro</span>
                                <span className="sm:hidden">Nuevo</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Línea decorativa inferior */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CE1126] via-white/50 to-[#002D62]"></div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Dashboard de Estadísticas RDscore Profesional */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Carta 1: Encuentros Totales */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="relative group h-48"
                        >
                            <div className="h-full bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-900/85 backdrop-blur-xl rounded-2xl border border-[#CE1126]/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                                {/* Borde superior decorativo */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CE1126] to-[#CE1126]/70"></div>

                                <div className="p-6 h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 bg-gradient-to-br from-[#CE1126]/15 to-[#CE1126]/25 rounded-xl shadow-md">
                                            <Trophy className="w-7 h-7 text-[#CE1126]" />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                            <span className="text-xs font-semibold text-green-600">+12%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                                {pagination.total}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                partidos
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-[#CE1126] leading-tight">
                                            Encuentros Totales
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Registro completo del sistema
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Carta 2: Victorias RD */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative group h-48"
                        >
                            <div className="h-full bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-900/85 backdrop-blur-xl rounded-2xl border border-[#002D62]/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                                {/* Borde superior decorativo */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#002D62] to-[#002D62]/70"></div>

                                <div className="p-6 h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 bg-gradient-to-br from-[#002D62]/15 to-[#002D62]/25 rounded-xl shadow-md">
                                            <Target className="w-7 h-7 text-[#002D62]" />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                            <span className="text-xs font-semibold text-green-600">+8%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                                {victories}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                triunfos
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-[#002D62] leading-tight">
                                            Victorias RD
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Éxitos de la Selección Nacional
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Carta 3: Efectividad */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="relative group h-48"
                        >
                            <div className="h-full bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-900/85 backdrop-blur-xl rounded-2xl border border-green-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                                {/* Borde superior decorativo */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>

                                <div className="p-6 h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 bg-gradient-to-br from-green-500/15 to-green-600/25 rounded-xl shadow-md">
                                            <Activity className="w-7 h-7 text-green-600" />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                            <span className="text-xs font-semibold text-green-600">+5%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                                {Math.round((victories / Math.max(pagination.total, 1)) * 100)}%
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                ratio
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-green-600 leading-tight">
                                            Efectividad
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Porcentaje de victorias logradas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Barra de búsqueda y filtros mejorada */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-900/85 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-xl overflow-hidden">
                        {/* Header del panel de filtros */}
                        <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 rounded-lg">
                                        <Activity className="w-5 h-5 text-[#CE1126]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Filtros de Encuentros
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Filtra encuentros por estado, torneo y equipo participante
                                        </p>
                                    </div>
                                </div>

                                {/* Indicador de estado de conexión */}
                                {error && error.includes('timeout') ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                        Conexión lenta
                                    </div>
                                ) : error && error.includes('conexión') ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Sin conexión
                                    </div>
                                ) : loading ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        Cargando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Conectado
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Filtros */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Filtro por Torneo */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Torneo o Competición
                                    </label>
                                    <div className="relative">
                                        <Trophy className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            value={filters.tournament_id || 'todos'}
                                            onChange={(e) => updateFilters({ tournament_id: e.target.value === 'todos' ? null : e.target.value })}
                                            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#002D62]/50 focus:border-[#002D62] transition-all duration-200 text-base font-medium shadow-sm hover:shadow-md appearance-none cursor-pointer"
                                        >
                                            <option value="todos">Todas las competiciones</option>
                                            {(tournaments || []).map((tournament) => (
                                                <option key={tournament.id} value={tournament.id}>
                                                    {tournament.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Filtro por Equipo */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Equipo Participante
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            value={filters.team_id || 'todos'}
                                            onChange={(e) => updateFilters({ team_id: e.target.value === 'todos' ? null : e.target.value })}
                                            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 text-base font-medium shadow-sm hover:shadow-md appearance-none cursor-pointer"
                                        >
                                            <option value="todos">Todos los equipos</option>
                                            {(teams || []).map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Indicadores de filtros activos */}
                            {(filters.tournament_id || filters.team_id) && (
                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-[#CE1126]" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Filtros activos:
                                            </span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {filters.tournament_id && (
                                                    <span className="px-2 py-1 bg-[#002D62]/10 text-[#002D62] text-xs font-medium rounded-md">
                                                        Torneo seleccionado
                                                    </span>
                                                )}
                                                {filters.team_id && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                                                        Equipo seleccionado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                updateFilters({ tournament_id: null, team_id: null });
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Limpiar filtros
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabla de partidos mejorada */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-[#CE1126]/5 to-[#002D62]/5 px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 rounded-xl">
                                    <Calendar className="w-6 h-6 text-[#CE1126]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        Encuentros Programados
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Calendario oficial de la Selección Nacional
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {loading ? (
                                <LoadingState
                                    title="Cargando encuentros"
                                    description="Obteniendo información actualizada de los partidos..."
                                />
                            ) : error ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Error al cargar encuentros
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        {error}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => refetch()}
                                            className="px-6 py-3 bg-[#CE1126] hover:bg-[#a00e1e] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <RefreshCw className="w-4 h-4 inline mr-2" />
                                            Reintentar
                                        </motion.button>
                                        {error.includes('timeout') || error.includes('tardando') ? (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    // Reducir el límite temporalmente para cargas más rápidas
                                                    updatePagination({ limit: 2, skip: 0 });
                                                    refetch();
                                                }}
                                                className="px-6 py-3 bg-[#002D62] hover:bg-[#001a3d] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                            >
                                                <Zap className="w-4 h-4 inline mr-2" />
                                                Carga Rápida (2 elementos)
                                            </motion.button>
                                        ) : null}
                                    </div>
                                </div>
                            ) : mappedGames.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {(filters.tournament_id || filters.team_id) ? (
                                            <Activity className="w-10 h-10 text-[#CE1126]" />
                                        ) : (
                                            <Calendar className="w-10 h-10 text-[#CE1126]" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {(filters.tournament_id || filters.team_id) ? 'Sin resultados con estos filtros' : 'Sin encuentros programados'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {(filters.tournament_id || filters.team_id)
                                            ? 'No se encontraron partidos que coincidan con los filtros seleccionados. Intenta con otros criterios.'
                                            : 'No hay partidos registrados en el sistema actualmente.'
                                        }
                                    </p>
                                    {(filters.tournament_id || filters.team_id) ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                updateFilters({ tournament_id: null, team_id: null });
                                            }}
                                            className="px-6 py-3 bg-[#002D62] hover:bg-[#001a3d] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            Limpiar filtros
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={hasAdminPermissions ? { scale: 1.05 } : {}}
                                            whileTap={hasAdminPermissions ? { scale: 0.95 } : {}}
                                            onClick={hasAdminPermissions ? openCreateModal : () => {
                                                showToast(
                                                    'warning',
                                                    'Permisos Requeridos',
                                                    'Necesitas permisos de administrador para programar encuentros.'
                                                );
                                            }}
                                            disabled={!hasAdminPermissions}
                                            className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-200 ${hasAdminPermissions
                                                ? 'bg-gradient-to-r from-[#CE1126] to-[#002D62] hover:shadow-xl text-white cursor-pointer'
                                                : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                                                }`}
                                        >
                                            Programar Primer Encuentro
                                        </motion.button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Tabla personalizada mejorada */}
                                    <div className="overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                {/* Header de la tabla */}
                                                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-gray-700/50 dark:to-gray-800/40">
                                                    <tr>
                                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                            Encuentro
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                            Torneo
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                            Fecha
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                            Acciones
                                                        </th>
                                                    </tr>
                                                </thead>

                                                {/* Cuerpo de la tabla */}
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200/50 dark:divide-gray-700/50">
                                                    {mappedGames.map((game, index) => (
                                                        <motion.tr
                                                            key={game.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                                            onClick={() => navigate(`/games/${game.id}`)}
                                                            className="hover:bg-gradient-to-r hover:from-[#CE1126]/5 hover:to-[#002D62]/5 transition-all duration-200 cursor-pointer group"
                                                        >
                                                            {/* Columna Encuentro */}
                                                            <td className="px-6 py-6 text-center">
                                                                <div className="flex items-center justify-between max-w-md mx-auto">
                                                                    {/* Equipo Local */}
                                                                    <div className="flex flex-col items-center text-center min-w-0 flex-1">
                                                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                                                            🏀
                                                                        </div>
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">
                                                                            {game.homeTeam}
                                                                        </p>
                                                                        <div className="w-8 h-0.5 bg-gradient-to-r from-[#CE1126] to-[#002D62] mt-1 rounded-full"></div>
                                                                    </div>

                                                                    {/* Marcador/VS con Estado */}
                                                                    <div className="flex flex-col items-center px-4 min-w-0">
                                                                        {game.status === 'completed' ? (
                                                                            <div className="flex flex-col items-center">
                                                                                <div className="flex items-center gap-3 mb-2">
                                                                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                                                        {game.homeScore}
                                                                                    </span>
                                                                                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                                                                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                                                        {game.awayScore}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                        Finalizado
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="text-2xl font-black text-gray-500 dark:text-gray-400 mb-2">
                                                                                    VS
                                                                                </span>
                                                                                <div className="flex items-center gap-2">
                                                                                    {game.status === 'live' ? (
                                                                                        <>
                                                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                                En Vivo
                                                                                            </span>
                                                                                        </>
                                                                                    ) : game.status === 'cancelled' ? (
                                                                                        <>
                                                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                                Cancelado
                                                                                            </span>
                                                                                        </>
                                                                                    ) : game.status === 'postponed' ? (
                                                                                        <>
                                                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                                Pospuesto
                                                                                            </span>
                                                                                        </>
                                                                                    ) : game.status === 'unknown' ? (
                                                                                        <>
                                                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                                Sin Estado
                                                                                            </span>
                                                                                        </>
                                                                                    ) : game.status === 'scheduled' ? (
                                                                                        <>
                                                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                                Programado
                                                                                            </span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                                            <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                                                                                                {game.status || 'Desconocido'}
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Equipo Visitante */}
                                                                    <div className="flex flex-col items-center text-center min-w-0 flex-1">
                                                                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                                                                            🏀
                                                                        </div>
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">
                                                                            {game.awayTeam}
                                                                        </p>
                                                                        <div className="w-8 h-0.5 bg-gradient-to-r from-[#002D62] to-[#CE1126] mt-1 rounded-full"></div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Columna Torneo */}
                                                            <td className="px-6 py-6 text-center">
                                                                <div className="flex flex-col items-center justify-center">
                                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                                        {game.tournament}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                        Competición oficial
                                                                    </p>
                                                                </div>
                                                            </td>

                                                            {/* Columna Fecha */}
                                                            <td className="px-6 py-6 text-center">
                                                                <div className="flex items-center justify-center">
                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                        {game.date ? new Date(game.date).toLocaleDateString('es-ES', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        }) : 'Sin fecha'}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            {/* Columna Acciones */}
                                                            <td className="px-6 py-6 text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/games/${game.id}`);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-[#002D62] hover:bg-[#001a3d] text-white text-xs font-semibold rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                                                                        title="Ver detalles"
                                                                    >
                                                                        Ver
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={hasAdminPermissions ? { scale: 1.05 } : {}}
                                                                        whileTap={hasAdminPermissions ? { scale: 0.95 } : {}}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (hasAdminPermissions) {
                                                                                handleEdit(game);
                                                                            } else {
                                                                                showToast(
                                                                                    'warning',
                                                                                    'Permisos Requeridos',
                                                                                    'Necesitas permisos de administrador para editar encuentros.'
                                                                                );
                                                                            }
                                                                        }}
                                                                        disabled={!hasAdminPermissions}
                                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 shadow-sm border ${hasAdminPermissions
                                                                            ? 'bg-white hover:bg-gray-50 text-[#002D62] border-[#002D62] hover:shadow-md cursor-pointer'
                                                                            : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                                                                            }`}
                                                                        title={hasAdminPermissions ? "Editar encuentro" : "Permisos requeridos"}
                                                                    >
                                                                        Editar
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={hasAdminPermissions ? { scale: 1.05 } : {}}
                                                                        whileTap={hasAdminPermissions ? { scale: 0.95 } : {}}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (hasAdminPermissions) {
                                                                                handleDelete(game);
                                                                            } else {
                                                                                showToast(
                                                                                    'warning',
                                                                                    'Permisos Requeridos',
                                                                                    'Necesitas permisos de administrador para eliminar encuentros.'
                                                                                );
                                                                            }
                                                                        }}
                                                                        disabled={!hasAdminPermissions}
                                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 shadow-sm ${hasAdminPermissions
                                                                            ? 'bg-[#CE1126] hover:bg-[#a00e1e] text-white hover:shadow-md cursor-pointer'
                                                                            : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                                                                            }`}
                                                                        title={hasAdminPermissions ? "Eliminar encuentro" : "Permisos requeridos"}
                                                                    >
                                                                        Eliminar
                                                                    </motion.button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Paginación RDscore */}
                {pagination.total > pagination.limit && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-xl rounded-2xl p-6 mt-8 border border-white/20 dark:border-gray-700/30 shadow-xl">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 rounded-lg">
                                        <Calendar className="w-5 h-5 text-[#CE1126]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            Página {Math.floor(pagination.skip / pagination.limit) + 1} de {Math.ceil(pagination.total / pagination.limit)}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {pagination.total} encuentros totales • {pagination.limit} por página {isSidebarOpen ? '(vista compacta)' : '(vista expandida)'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updatePagination({ skip: Math.max(0, pagination.skip - pagination.limit) })}
                                        disabled={pagination.skip === 0}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${pagination.skip === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#CE1126]/10 to-[#002D62]/10 text-[#CE1126] hover:from-[#CE1126]/20 hover:to-[#002D62]/20 shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        ← Anterior
                                    </motion.button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => {
                                            const pageNumber = i + 1;
                                            const isCurrentPage = Math.floor(pagination.skip / pagination.limit) + 1 === pageNumber;
                                            const totalPages = Math.ceil(pagination.total / pagination.limit);

                                            // Mostrar solo algunas páginas alrededor de la actual
                                            const currentPageIndex = Math.floor(pagination.skip / pagination.limit);
                                            const showPage = i === 0 || i === totalPages - 1 || Math.abs(i - currentPageIndex) <= 1;

                                            if (!showPage) {
                                                if (i === currentPageIndex - 2 || i === currentPageIndex + 2) {
                                                    return <span key={i} className="px-2 text-gray-400 font-bold">•••</span>;
                                                }
                                                return null;
                                            }

                                            return (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => updatePagination({ skip: i * pagination.limit })}
                                                    className={`w-10 h-10 rounded-xl font-bold transition-all duration-200 ${isCurrentPage
                                                        ? 'bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white shadow-lg'
                                                        : 'bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-[#CE1126]/10 hover:to-[#002D62]/10 hover:text-[#CE1126] shadow-md hover:shadow-lg'
                                                        }`}
                                                >
                                                    {pageNumber}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updatePagination({ skip: pagination.skip + pagination.limit })}
                                        disabled={pagination.skip + pagination.limit >= pagination.total}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${pagination.skip + pagination.limit >= pagination.total
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#CE1126]/10 to-[#002D62]/10 text-[#CE1126] hover:from-[#CE1126]/20 hover:to-[#002D62]/20 shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        Siguiente →
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Modal Moderno */}
                <ModernModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={selectedGame ? 'Editar Partido' : 'Programar Partido'}
                    size="lg"
                >
                    <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-6">
                        {/* Sección de equipos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#CE1126]/20 to-[#CE1126]/30 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-[#CE1126]" />
                                </div>
                                Equipos Participantes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Equipo Local *
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            name="homeTeam"
                                            value={values.homeTeam}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md appearance-none ${touched.homeTeam && errors.homeTeam
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        >
                                            <option value="">Seleccionar equipo local</option>
                                            <option value="republica_dominicana">🇩🇴 República Dominicana</option>
                                            {(teams || []).map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                    {touched.homeTeam && errors.homeTeam && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.homeTeam}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Equipo Visitante *
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            name="awayTeam"
                                            value={values.awayTeam}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-[#002D62]/50 focus:border-[#002D62] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md appearance-none ${touched.awayTeam && errors.awayTeam
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        >
                                            <option value="">Seleccionar equipo visitante</option>
                                            {(teams || []).map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                    {touched.awayTeam && errors.awayTeam && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.awayTeam}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sección de torneo */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#002D62]/20 to-[#002D62]/30 rounded-lg flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-[#002D62]" />
                                </div>
                                Información del Torneo
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Torneo o Competición *
                                </label>
                                <div className="relative">
                                    <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        name="tournament"
                                        value={values.tournament}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-[#002D62]/50 focus:border-[#002D62] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md appearance-none ${touched.tournament && errors.tournament
                                            ? 'border-red-300 dark:border-red-600'
                                            : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                        required
                                    >
                                        <option value="">Seleccionar torneo</option>
                                        <option value="copa_mundial_fiba_2023">🏆 Copa Mundial FIBA 2023</option>
                                        <option value="americup_2022">🏀 AmeriCup 2022</option>
                                        <option value="centrobasket_2024">🏅 Centrobasket 2024</option>
                                        <option value="clasificatorias_fiba">📋 Clasificatorias FIBA</option>
                                        {(tournaments || []).map((tournament) => (
                                            <option key={tournament.id} value={tournament.id}>
                                                {tournament.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                                {touched.tournament && errors.tournament && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tournament}</p>
                                )}
                            </div>
                        </div>

                        {/* Sección de fecha y hora */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                Programación del Encuentro
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha del Partido *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            name="date"
                                            value={values.date}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${touched.date && errors.date
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {touched.date && errors.date && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Hora del Partido *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="time"
                                            name="time"
                                            value={values.time}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${touched.time && errors.time
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {touched.time && errors.time && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sección de sede */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-orange-600" />
                                </div>
                                Ubicación del Encuentro
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Sede o Pabellón *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="venue"
                                        value={values.venue}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Palacio de los Deportes, Centro Olímpico Juan Pablo Duarte"
                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${touched.venue && errors.venue
                                            ? 'border-red-300 dark:border-red-600'
                                            : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                        required
                                    />
                                </div>
                                {touched.venue && errors.venue && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.venue}</p>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={closeModal}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] hover:from-[#a00e1e] hover:to-[#001a3d] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4" />
                                        {selectedGame ? 'Actualizar Partido' : 'Programar Encuentro'}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </ModernModal>

                {/* Toast Container Moderno */}
                <ToastContainer
                    toasts={toasts}
                    onRemove={removeToast}
                    position="top-right"
                />
            </div>
        </div >
    );
};

export default Games;

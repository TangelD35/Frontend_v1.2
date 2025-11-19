import { Plus, User, Edit, Trash2, Eye, Grid, List, Search, Calendar, MapPin, Users, Trophy, Target, Filter, CheckCircle, XCircle, Circle, RefreshCw, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { playerSchema } from '../../../../lib/validations/schemas';
import { usePlayers } from '../../hooks/usePlayers';
import { teamsService } from '../../../../shared/api/endpoints/teams';
import { playersService } from '../../../../shared/api/endpoints/players';

const Players = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [teams, setTeams] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Hook para cambiar entre vista de cartas y tabla
    const { viewMode, isTableView, toggleViewMode } = useViewMode('cards', 'players-view');

    // Hook para manejar jugadores desde el backend
    const {
        players,
        loading,
        error,
        pagination,
        filters,
        createPlayer,
        updatePlayer,
        deletePlayer,
        updateFilters,
        updatePagination,
        adjustLimit,
        fetchPlayers
    } = usePlayers();

    // Usar los filtros del hook directamente (después de la destructuración)
    const statusFilter = filters.status || 'todos';
    const positionFilter = filters.position || '';
    const searchTerm = filters.search || '';

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
        first_name: '',
        last_name: '',
        full_name: '',
        jersey_number: '',
        height_cm: '',
        position: '',
        nationality: 'Dominicana',
        birth_date: '',
        team_id: '',
        status: 'activo'
    }, playerSchema);

    // Cargar equipos al montar el componente
    useEffect(() => {
        const loadTeams = async () => {
            try {
                console.log('🏀 Loading teams from backend...');
                const response = await teamsService.getAll({ limit: 100 });
                setTeams(response.items || []);
                console.log('✅ Teams loaded:', response.items?.length || 0);
            } catch (error) {
                console.error('❌ Error loading teams:', error);
                // Fallback a datos básicos si falla
                const fallbackTeams = [
                    {
                        id: '1',
                        name: 'República Dominicana',
                        country: 'República Dominicana'
                    }
                ];
                setTeams(fallbackTeams);
                console.log('⚠️ Using fallback teams');
            }
        };
        loadTeams();
    }, []);

    // Auto-generar nombre completo
    useEffect(() => {
        if (values.first_name && values.last_name) {
            setFieldValue('full_name', `${values.first_name} ${values.last_name}`);
        }
    }, [values.first_name, values.last_name, setFieldValue]);

    // Ajustar límite de elementos por página cuando cambie el estado del sidebar
    useEffect(() => {
        adjustLimit(showFilters);
    }, [showFilters, adjustLimit]);

    // Función para obtener nombre corto (primer nombre + primer apellido)
    const getShortName = (fullName) => {
        if (!fullName) return '';
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length === 1) return nameParts[0];
        if (nameParts.length >= 2) {
            return `${nameParts[0]} ${nameParts[1]}`;
        }
        return fullName;
    };

    // Función para obtener posición abreviada
    const getShortPosition = (position) => {
        const positionAbbr = {
            'Armador': 'PG',
            'Escolta': 'SG',
            'Alero': 'SF',
            'Ala-pívot': 'PF',
            'Pívot': 'C'
        };
        return positionAbbr[position] || position;
    };

    // Handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        updateFilters({ search: value });
    };

    const handleStatusFilterChange = (status) => {
        updateFilters({ status });
    };

    const handlePositionFilterChange = (position) => {
        updateFilters({ position });
    };

    const handleRefresh = () => {
        fetchPlayers();
    };

    const handleClearFilters = () => {
        updateFilters({ search: '', status: 'todos', position: '' });
    };

    // Estadísticas calculadas - usar pagination.total para obtener el total real del backend
    // Para activos e inactivos, necesitamos hacer peticiones separadas o calcular del total
    const [totalActivePlayers, setTotalActivePlayers] = useState(0);
    const [totalInactivePlayers, setTotalInactivePlayers] = useState(0);

    // Calcular totales de activos e inactivos desde el backend
    useEffect(() => {
        const calculateTotals = async () => {
            try {
                // Obtener todos los jugadores activos
                const activeResponse = await playersService.getAll({ status: 'activo', limit: 1 });
                setTotalActivePlayers(activeResponse.pagination?.total || 0);

                // Obtener todos los jugadores inactivos
                const inactiveResponse = await playersService.getAll({ status: 'inactivo', limit: 1 });
                setTotalInactivePlayers(inactiveResponse.pagination?.total || 0);
            } catch (error) {
                console.error('Error calculating totals:', error);
            }
        };
        calculateTotals();
    }, []); // Solo calcular una vez al montar
    const averageHeight = players.length > 0
        ? Math.round(players.reduce((sum, p) => sum + (p.height_cm || 0), 0) / players.length)
        : 0;

    // Estadísticas por posición
    const positionStats = players.reduce((acc, player) => {
        const pos = player.position || 'Sin posición';
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
    }, {});

    const handleEdit = (player) => {
        setSelectedPlayer(player);
        setFieldValue('first_name', player.first_name);
        setFieldValue('last_name', player.last_name);
        setFieldValue('full_name', player.full_name);
        setFieldValue('jersey_number', player.jersey_number?.toString() || '');
        setFieldValue('height_cm', player.height_cm?.toString() || '');
        setFieldValue('position', player.position || '');
        setFieldValue('nationality', player.nationality || 'Dominicana');
        setFieldValue('birth_date', player.birth_date || '');
        setFieldValue('team_id', player.team_id);
        setFieldValue('status', player.status || 'activo');
        setIsModalOpen(true);
    };

    const handleDelete = async (player) => {
        if (confirm(`¿Estás seguro de eliminar al jugador "${player.full_name}"?`)) {
            try {
                await deletePlayer(player.id);
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: `Jugador "${player.full_name}" eliminado correctamente`
                });
            } catch (error) {
                setToast({
                    isVisible: true,
                    type: 'error',
                    message: 'Error al eliminar el jugador'
                });
            }
        }
    };

    const onSubmit = async (formData) => {
        try {
            if (selectedPlayer) {
                await updatePlayer(selectedPlayer.id, formData);
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: 'Jugador actualizado correctamente'
                });
            } else {
                await createPlayer(formData);
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: 'Jugador creado correctamente'
                });
            }
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: error.message || 'Error al guardar el jugador'
            });
        }
    };

    const openCreateModal = () => {
        setSelectedPlayer(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
        reset();
    };

    const getPositionName = (position) => {
        const positions = {
            'PG': 'Base',
            'SG': 'Escolta',
            'SF': 'Alero',
            'PF': 'Ala-Pívot',
            'C': 'Pívot'
        };
        return positions[position] || position;
    };

    const getPositionColor = (position) => {
        const colors = {
            'PG': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'SG': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            'SF': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            'PF': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            'C': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        return colors[position] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Componente PlayerAvatar con fallback automático a múltiples extensiones
    const PlayerAvatar = ({ playerName, size = 10 }) => {
        const [currentExtIndex, setCurrentExtIndex] = useState(0);
        const [showFallback, setShowFallback] = useState(false);
        const extensions = ['webp', 'avif', 'png', 'jpg', 'jpeg'];
        const basePath = '/images/jugadores/';
        const currentSrc = showFallback ? null : `${basePath}${playerName}.${extensions[currentExtIndex]}`;

        const handleImageError = () => {
            if (currentExtIndex < extensions.length - 1) {
                setCurrentExtIndex(prev => prev + 1);
            } else {
                setShowFallback(true);
            }
        };

        if (showFallback || !playerName) {
            return (
                <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 text-xs bg-white dark:bg-gray-700">
                    {playerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                </div>
            );
        }

        return (
            <img
                src={currentSrc}
                alt={playerName}
                className="w-full h-full rounded-full object-cover"
                onError={handleImageError}
            />
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Header compacto con fondo gradiente */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl shadow-xl bg-gradient-to-r from-[#CE1126] from-0% via-white via-50% to-[#002D62] to-100% p-4 mb-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        {/* Lado izquierdo: título compacto */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/60 overflow-hidden">
                                <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-white">
                                    Gestión de Jugadores
                                </h1>
                                <p className="text-[10px] font-bold text-white">
                                    Selección Nacional • República Dominicana
                                </p>
                            </div>
                        </div>

                        {/* Lado derecho: botones compactos */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleViewMode}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-[#CE1126] dark:hover:border-[#002D62] text-gray-700 dark:text-gray-300 hover:text-[#CE1126] dark:hover:text-[#002D62] rounded-lg transition-all shadow-sm hover:shadow-md"
                                title={isTableView ? 'Vista de cartas' : 'Vista de tabla'}
                            >
                                {isTableView ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                <span className="text-xs font-bold">{isTableView ? 'Cartas' : 'Tabla'}</span>
                            </button>

                            <button
                                onClick={openCreateModal}
                                className="px-4 py-1.5 text-xs font-bold rounded-md bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white hover:shadow-lg transition-all"
                            >
                                <Plus className="w-3 h-3 inline mr-1" />
                                Nuevo Jugador
                            </button>
                        </div>
                    </div>
                </motion.div>
                {/* Stats Cards compactas - clickeables para filtrar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <button
                        onClick={() => updateFilters({ status: 'todos' })}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#CE1126]/30 hover:border-[#CE1126]/60 hover:shadow-lg transition-all text-left"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                                Total Jugadores
                            </p>
                            <p className="text-3xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                {pagination.total}
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => updateFilters({ status: 'activo' })}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#002D62]/30 hover:border-[#002D62]/60 hover:shadow-lg transition-all text-left"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                                Activos
                            </p>
                            <p className="text-3xl font-black text-[#002D62] dark:text-[#002D62]">
                                {totalActivePlayers}
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => updateFilters({ status: 'inactivo' })}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#CE1126]/30 hover:border-[#CE1126]/60 hover:shadow-lg transition-all text-left"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                                Inactivos
                            </p>
                            <p className="text-3xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                {totalInactivePlayers}
                            </p>
                        </div>
                    </button>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#002D62]/30 hover:border-[#002D62]/60 hover:shadow-lg transition-all">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                                Altura Promedio
                            </p>
                            <p className="text-3xl font-black text-[#002D62] dark:text-[#002D62]">
                                {averageHeight} cm
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search - simplificado */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar jugadores por nombre..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Jugadores Content */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CE1126] dark:border-[#002D62]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="text-center py-20">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No se encontraron jugadores</p>
                        </div>
                    ) : isTableView ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                                        <th className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                            Jugador
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                            Posición
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                            Altura
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                            Edad
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                            Estado
                                        </th>
                                        <th className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700">
                                    {players.map((player) => (
                                        <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                                                        <PlayerAvatar playerName={player.full_name} size={10} />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {player.full_name}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                            #{player.jersey_number || '?'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {player.position && (
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${getPositionColor(player.position)}`}>
                                                        {player.position}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs font-bold text-gray-900 dark:text-white">
                                                {player.height_cm ? `${player.height_cm} cm` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs font-bold text-gray-900 dark:text-white">
                                                {calculateAge(player.birth_date) || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border-2 ${player.status === 'activo'
                                                    ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
                                                    : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
                                                    }`}>
                                                    {player.status === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => navigate(`/players/${player.id}`)}
                                                        className="px-2 py-1 bg-[#002D62] hover:bg-[#001a3d] text-white text-[10px] font-bold rounded border-2 border-black transition-all duration-200"
                                                        title="Ver detalles"
                                                    >
                                                        Ver
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleEdit(player)}
                                                        className="px-2 py-1 bg-white hover:bg-gray-50 text-[#002D62] border-2 border-black text-[10px] font-bold rounded transition-all duration-200"
                                                        title="Editar"
                                                    >
                                                        Editar
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDelete(player)}
                                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded border-2 border-black transition-all duration-200"
                                                        title="Eliminar"
                                                    >
                                                        Eliminar
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginación profesional y compacta para tabla */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t-2 border-gray-200 dark:border-gray-700 bg-[#CE1126]/10 dark:bg-[#002D62]/10">
                                    <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                        Pág. {pagination.page} de {pagination.pages} • {pagination.total} total
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updatePagination({ page: pagination.page - 1 })}
                                            disabled={pagination.page === 1}
                                            className="p-1.5 text-gray-500 hover:text-[#CE1126] hover:bg-white dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                            let page;
                                            if (pagination.pages <= 5) {
                                                page = i + 1;
                                            } else if (pagination.page <= 3) {
                                                page = i + 1;
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                page = pagination.pages - 4 + i;
                                            } else {
                                                page = pagination.page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => updatePagination({ page })}
                                                    className={`min-w-[28px] h-7 px-2 text-[10px] font-bold rounded transition-all ${pagination.page === page
                                                        ? 'bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white shadow-md'
                                                        : 'text-[#CE1126] dark:text-[#002D62] hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => updatePagination({ page: pagination.page + 1 })}
                                            disabled={pagination.page === pagination.pages}
                                            className="p-1.5 text-gray-500 hover:text-[#002D62] hover:bg-white dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/50 dark:hover:border-[#002D62]/50 transition-all hover:shadow-lg"
                                >
                                    {/* Header con imagen redonda */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
                                            <PlayerAvatar playerName={player.full_name} size={12} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                                                {player.full_name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {player.position && (
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getPositionColor(player.position)}`}>
                                                        {player.position}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${player.status === 'activo'
                                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {player.status === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Información compacta */}
                                    <div className="space-y-1.5 mb-3">
                                        {player.height_cm && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Altura:</span>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{player.height_cm} cm</span>
                                            </div>
                                        )}
                                        {player.birth_date && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Edad:</span>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{calculateAge(player.birth_date)} años</span>
                                            </div>
                                        )}
                                        {teams.find(t => t.id === player.team_id) && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Equipo:</span>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate" title={teams.find(t => t.id === player.team_id)?.name}>
                                                    {teams.find(t => t.id === player.team_id)?.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones compactas */}
                                    <div className="flex items-center gap-2 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => navigate(`/players/${player.id}`)}
                                            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white text-[10px] font-bold rounded-lg hover:shadow-md transition-all"
                                        >
                                            <Eye className="w-3 h-3 inline mr-1" />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => handleEdit(player)}
                                            className="p-1.5 text-[#CE1126] hover:bg-[#CE1126]/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(player)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {pagination.total > pagination.limit && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Mostrando {pagination.skip + 1} a {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total} jugadores
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updatePagination({ skip: Math.max(0, pagination.skip - pagination.limit) })}
                                    disabled={pagination.skip === 0}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    Anterior
                                </button>

                                {/* Números de página */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => {
                                        const pageNumber = i + 1;
                                        const isCurrentPage = Math.floor(pagination.skip / pagination.limit) + 1 === pageNumber;
                                        const totalPages = Math.ceil(pagination.total / pagination.limit);

                                        // Mostrar solo algunas páginas alrededor de la actual
                                        const currentPageIndex = Math.floor(pagination.skip / pagination.limit);
                                        const showPage = i === 0 || i === totalPages - 1 || Math.abs(i - currentPageIndex) <= 2;

                                        if (!showPage) {
                                            if (i === currentPageIndex - 3 || i === currentPageIndex + 3) {
                                                return <span key={i} className="px-2 text-gray-400">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => updatePagination({ skip: i * pagination.limit })}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg ${isCurrentPage
                                                    ? 'bg-[#CE1126] text-white dark:bg-[#002D62]'
                                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => updatePagination({ skip: pagination.skip + pagination.limit })}
                                    disabled={pagination.skip + pagination.limit >= pagination.total}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de crear/editar jugador */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8">
                            {/* Header del modal */}
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-lg">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedPlayer ? 'Editar Jugador' : 'Crear Nuevo Jugador'}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Contenido del modal */}
                            <form onSubmit={validateAndSubmit(onSubmit)} className="p-6 space-y-6">
                                {/* Información personal */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Información Personal
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={values.first_name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="ej. Karl-Anthony"
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.first_name && errors.first_name
                                                    ? 'border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                    }`}
                                            />
                                            {touched.first_name && errors.first_name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Apellido *
                                            </label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={values.last_name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="ej. Towns"
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.last_name && errors.last_name
                                                    ? 'border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                    }`}
                                            />
                                            {touched.last_name && errors.last_name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre Completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={values.full_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Se genera automáticamente"
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
                                            readOnly
                                        />
                                        {touched.full_name && errors.full_name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.full_name}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha de Nacimiento
                                            </label>
                                            <input
                                                type="date"
                                                name="birth_date"
                                                value={values.birth_date}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nacionalidad
                                            </label>
                                            <input
                                                type="text"
                                                name="nationality"
                                                value={values.nationality}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="ej. Dominicana"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Información deportiva */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Información Deportiva
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Número de Camiseta
                                            </label>
                                            <input
                                                type="number"
                                                name="jersey_number"
                                                value={values.jersey_number}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                min="0"
                                                max="99"
                                                placeholder="ej. 32"
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.jersey_number && errors.jersey_number
                                                    ? 'border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                    }`}
                                            />
                                            {touched.jersey_number && errors.jersey_number && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.jersey_number}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Posición
                                            </label>
                                            <select
                                                name="position"
                                                value={values.position}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="">Seleccionar posición</option>
                                                <option value="PG">Base (PG)</option>
                                                <option value="SG">Escolta (SG)</option>
                                                <option value="SF">Alero (SF)</option>
                                                <option value="PF">Ala-Pívot (PF)</option>
                                                <option value="C">Pívot (C)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Altura (cm)
                                            </label>
                                            <input
                                                type="number"
                                                name="height_cm"
                                                value={values.height_cm}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                min="150"
                                                max="250"
                                                placeholder="ej. 211"
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.height_cm && errors.height_cm
                                                    ? 'border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                    }`}
                                            />
                                            {touched.height_cm && errors.height_cm && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.height_cm}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Equipo *
                                        </label>
                                        <select
                                            name="team_id"
                                            value={values.team_id}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.team_id && errors.team_id
                                                ? 'border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                }`}
                                        >
                                            <option value="">Seleccionar equipo</option>
                                            {teams.map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name} ({team.country})
                                                </option>
                                            ))}
                                        </select>
                                        {touched.team_id && errors.team_id && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.team_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={values.status}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.status && errors.status
                                                ? 'border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                }`}
                                        >
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </select>
                                        {touched.status && errors.status && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-[#CE1126] hover:bg-[#B00E20] dark:bg-[#002D62] dark:hover:bg-[#001F4A] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <User className="w-4 h-4" />
                                                {selectedPlayer ? 'Actualizar Jugador' : 'Crear Jugador'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Toast para notificaciones */}
                {toast.isVisible && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' :
                        toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                        } text-white`}>
                        {toast.message}
                        <button
                            onClick={() => setToast({ ...toast, isVisible: false })}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Players;

import { Plus, User, Edit, Trash2, Eye, Grid, List, Search, Calendar, MapPin, Users, Trophy, Target, Filter, CheckCircle, XCircle, Circle, RefreshCw, Download, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { playerSchema } from '../../../../lib/validations/schemas';
import { usePlayers } from '../../hooks/usePlayers';
import { teamsService } from '../../../../shared/api/endpoints/teams';

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

    // Estadísticas calculadas
    const activePlayers = players.filter(p => p.status === 'activo').length;
    const inactivePlayers = players.filter(p => p.status === 'inactivo').length;
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/20">
            {/* Header profesional */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-[#CE1126] to-[#B00E20] dark:from-[#002D62] dark:to-[#001F4A] rounded-xl shadow-lg">
                                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                                    Gestión de Jugadores
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Sistema de análisis táctico • BasketscoreRD
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${showFilters
                                    ? 'bg-[#CE1126] text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                Filtros
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                            <button
                                onClick={toggleViewMode}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                            >
                                {isTableView ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                {isTableView ? 'Cartas' : 'Tabla'}
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#CE1126] hover:bg-[#B00E20] dark:bg-[#002D62] dark:hover:bg-[#001F4A] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                Nuevo Jugador
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-[#CE1126]/10 dark:bg-[#002D62]/20 rounded-lg">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{activePlayers}</p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Activos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{inactivePlayers}</p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 bg-[#CE1126]/10 dark:bg-[#002D62]/20 rounded-lg">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{averageHeight}cm</p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Altura Promedio</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar jugadores por nombre..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Quick Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleStatusFilterChange('todos')}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${statusFilter === 'todos'
                                    ? 'bg-[#CE1126] text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Circle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Todos</span>
                                <span className="sm:hidden">Todo</span>
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('activo')}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${statusFilter === 'activo'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Activos</span>
                                <span className="sm:hidden">Activo</span>
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('inactivo')}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${statusFilter === 'inactivo'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Inactivos</span>
                                <span className="sm:hidden">Inact.</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Posición
                                    </label>
                                    <select
                                        value={positionFilter}
                                        onChange={(e) => handlePositionFilterChange(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent"
                                    >
                                        <option value="">Todas las posiciones</option>
                                        <option value="PG">Base (PG)</option>
                                        <option value="SG">Escolta (SG)</option>
                                        <option value="SF">Alero (SF)</option>
                                        <option value="PF">Ala-Pívot (PF)</option>
                                        <option value="C">Pívot (C)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Ordenar por
                                    </label>
                                    <select
                                        value={filters.order_by}
                                        onChange={(e) => updateFilters({ order_by: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent"
                                    >
                                        <option value="full_name">Nombre</option>
                                        <option value="jersey_number">Número</option>
                                        <option value="position">Posición</option>
                                        <option value="height_cm">Altura</option>
                                    </select>
                                </div>

                                <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Jugadores Content */}
                <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden transition-all duration-300 ${showFilters ? 'lg:max-w-none' : ''
                    }`}>
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
                        /* Vista de Tabla */
                        <div className={`overflow-x-auto transition-all duration-300 ${showFilters ? 'text-sm' : ''}`}>
                            <table className={`w-full ${showFilters ? 'min-w-[500px]' : 'min-w-[650px]'}`}>
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className={`text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${showFilters ? 'px-3 py-2' : 'px-6 py-3'
                                            }`}>
                                            Jugador
                                        </th>
                                        <th className={`text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${showFilters ? 'px-3 py-2' : 'px-6 py-3'
                                            }`}>
                                            Posición
                                        </th>
                                        <th className={`text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${showFilters ? 'hidden xl:table-cell px-2 py-2' : 'px-6 py-3'}`}>
                                            Altura
                                        </th>
                                        <th className={`text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${showFilters ? 'px-3 py-2' : 'px-6 py-3'
                                            }`}>
                                            Status
                                        </th>
                                        <th className={`text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${showFilters ? 'px-2 py-2' : 'px-6 py-3'
                                            }`}>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {players.map((player) => (
                                        <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className={`whitespace-nowrap ${showFilters ? 'px-3 py-3' : 'px-6 py-4'
                                                }`}>
                                                <div className="flex items-center">
                                                    <div className={`bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-lg flex items-center justify-center text-white font-bold text-sm ${showFilters ? 'w-8 h-8 mr-2' : 'w-10 h-10 mr-4'
                                                        }`}>
                                                        {player.jersey_number || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white" title={player.full_name}>
                                                            {getShortName(player.full_name)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {player.nationality || 'Sin nacionalidad'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`whitespace-nowrap ${showFilters ? 'px-3 py-3' : 'px-6 py-4'
                                                }`}>
                                                {player.position && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`} 
                                                          title={getPositionName(player.position)}>
                                                        {showFilters ? getShortPosition(player.position) : getPositionName(player.position)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`whitespace-nowrap text-sm text-gray-900 dark:text-white ${showFilters ? 'hidden xl:table-cell px-2 py-3' : 'px-6 py-4'}`}>
                                                {player.height_cm ? `${player.height_cm}cm` : '-'}
                                            </td>
                                            <td className={`whitespace-nowrap ${showFilters ? 'px-3 py-3' : 'px-6 py-4'
                                                }`}>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${player.status === 'activo'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    }`}>
                                                    {player.status === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className={`whitespace-nowrap text-right text-sm font-medium ${showFilters ? 'px-2 py-3' : 'px-6 py-4'
                                                }`}>
                                                <div className={`flex items-center justify-end ${showFilters ? 'gap-1' : 'gap-2'}`}>
                                                    <button
                                                        onClick={() => navigate(`/players/${player.id}`)}
                                                        className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ${showFilters ? 'p-1' : 'p-1.5'}`}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className={`${showFilters ? 'w-3 h-3' : 'w-4 h-4'}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(player)}
                                                        className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 ${showFilters ? 'p-1' : 'p-1.5'}`}
                                                        title="Editar"
                                                    >
                                                        <Edit className={`${showFilters ? 'w-3 h-3' : 'w-4 h-4'}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(player)}
                                                        className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${showFilters ? 'p-1' : 'p-1.5'}`}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className={`${showFilters ? 'w-3 h-3' : 'w-4 h-4'}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Vista de Cartas */
                        <div className={`grid p-4 sm:p-6 transition-all duration-300 ${showFilters
                            ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8'
                            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6'
                            }`}>
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/30 dark:hover:border-[#002D62]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-5"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {player.jersey_number || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1" 
                                                    title={player.full_name}>
                                                    {getShortName(player.full_name)}
                                                </h3>
                                                {player.position && (
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                                                        {getPositionName(player.position)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${
                                            player.status === 'activo' ? 'bg-green-500' : 'bg-red-500'
                                        } shadow-sm`} title={player.status === 'activo' ? 'Activo' : 'Inactivo'} />
                                    </div>

                                    {/* Información */}
                                    <div className="space-y-3 mb-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            {player.height_cm && (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Altura</div>
                                                    <div className="text-base font-bold text-gray-900 dark:text-white">{player.height_cm}cm</div>
                                                </div>
                                            )}
                                            {player.birth_date && (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Edad</div>
                                                    <div className="text-base font-bold text-gray-900 dark:text-white">{calculateAge(player.birth_date)} años</div>
                                                </div>
                                            )}
                                        </div>
                                        {teams.find(t => t.id === player.team_id) && (
                                            <div className="bg-gradient-to-r from-[#CE1126]/10 to-[#002D62]/10 dark:from-[#CE1126]/20 dark:to-[#002D62]/20 rounded-lg p-3 text-center border border-[#CE1126]/20 dark:border-[#002D62]/20">
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Equipo</div>
                                                <div className="text-base font-bold text-[#CE1126] dark:text-[#002D62] truncate" title={teams.find(t => t.id === player.team_id)?.name}>
                                                    {teams.find(t => t.id === player.team_id)?.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => navigate(`/players/${player.id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#CE1126] to-[#B00E20] dark:from-[#002D62] dark:to-[#001F4A] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 transform hover:scale-105"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Perfil
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(player)}
                                                className="p-2 text-gray-500 hover:text-[#CE1126] dark:hover:text-[#002D62] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Editar jugador"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(player)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Eliminar jugador"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
        </div>
    );
};

export default Players;

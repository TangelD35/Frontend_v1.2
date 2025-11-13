import { Plus, User, Edit, Trash2, Eye, Grid, List, Search, Calendar, MapPin, Users, Trophy, Target } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [teams, setTeams] = useState([]);

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
        updatePagination
    } = usePlayers();

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
        status: 'active'
    }, playerSchema);

    // Cargar equipos al montar el componente
    useEffect(() => {
        const loadTeams = async () => {
            try {
                const response = await teamsService.getAll({ limit: 100 });
                setTeams(response.items || []);
            } catch (error) {
                console.error('Error loading teams:', error);
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

    // Handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        updateFilters({ search: value });
    };

    // Estadísticas calculadas
    const activePlayers = players.filter(p => p.status === 'active').length;
    const averageHeight = players.length > 0 
        ? Math.round(players.reduce((sum, p) => sum + (p.height_cm || 0), 0) / players.length)
        : 0;

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
        setFieldValue('status', player.status || 'active');
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
        reset();
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

    const getPositionName = (position) => {
        const names = {
            'PG': 'Base',
            'SG': 'Escolta',
            'SF': 'Alero',
            'PF': 'Ala-Pívot',
            'C': 'Pívot'
        };
        return names[position] || position;
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
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-xl shadow-lg">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Gestión de Jugadores
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Sistema de análisis táctico • BasketscoreRD
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
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

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#CE1126]/10 dark:bg-[#002D62]/20 rounded-lg">
                                <Users className="w-6 h-6 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Jugadores</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#002D62]/10 dark:bg-[#CE1126]/20 rounded-lg">
                                <Target className="w-6 h-6 text-[#002D62] dark:text-[#CE1126]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePlayers}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Jugadores Activos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#CE1126]/10 dark:bg-[#002D62]/20 rounded-lg">
                                <Trophy className="w-6 h-6 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageHeight}cm</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Altura Promedio</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar jugadores por nombre..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Jugadores Content */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
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
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/30 dark:hover:border-[#002D62]/30 transition-all duration-200 hover:shadow-lg"
                                >
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                            {player.jersey_number || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {player.full_name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {player.position && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
                                                        {getPositionName(player.position)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Información */}
                                    <div className="space-y-2 mb-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {player.height_cm && (
                                                <div className="text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Altura:</span> {player.height_cm}cm
                                                </div>
                                            )}
                                            {player.birth_date && (
                                                <div className="text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium">Edad:</span> {calculateAge(player.birth_date)} años
                                                </div>
                                            )}
                                            {player.nationality && (
                                                <div className="text-gray-600 dark:text-gray-400 col-span-2">
                                                    <span className="font-medium">Nacionalidad:</span> {player.nationality}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Acciones */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => navigate(`/players/${player.id}`)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#CE1126]/10 dark:bg-[#002D62]/20 text-[#CE1126] dark:text-[#002D62] rounded-lg text-sm font-medium hover:bg-[#CE1126]/20 dark:hover:bg-[#002D62]/30 transition-colors"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Ver
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(player)}
                                                className="p-1.5 text-gray-400 hover:text-[#002D62] dark:hover:text-[#CE1126] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(player)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.first_name && errors.first_name
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.last_name && errors.last_name
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.jersey_number && errors.jersey_number
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.height_cm && errors.height_cm
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
                                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                touched.team_id && errors.team_id
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
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
                        toast.type === 'success' ? 'bg-green-600' : 
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

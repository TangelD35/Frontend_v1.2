import { Plus, Trophy, Edit, Trash2, Eye, Grid, List, Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Filter, RefreshCw, TrendingUp, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { tournamentSchema } from '../../../../lib/validations/schemas';
import { useTournaments } from '../../hooks/useTournaments';
import { GlassCard, AnimatedButton, LoadingState, ErrorState } from '../../../../shared/ui/components/modern';

const Tournaments = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [showFilters, setShowFilters] = useState(false);

    // Hook para cambiar entre vista de cartas y tabla
    const { viewMode, isTableView, toggleViewMode } = useViewMode('cards', 'tournaments-view');

    // Hook para manejar torneos desde el backend
    const {
        tournaments,
        loading,
        error,
        pagination,
        filters,
        createTournament,
        updateTournament,
        deleteTournament,
        updateFilters,
        updatePagination
    } = useTournaments();

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
        name: '',
        season: '',
        type: '',
        sede: '',
        start_date: '',
        end_date: '',
        total_participants: '',
        is_international: false
    }, tournamentSchema);

    // Función para obtener el estado del torneo basado en las fechas
    const getTournamentStatus = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (now < start) return 'pending';
        if (now > end) return 'completed';
        return 'active';
    };

    // Handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        updateFilters({ search: value });
    };

    // Estadísticas calculadas
    const activeTournaments = tournaments.filter(t => getTournamentStatus(t.start_date, t.end_date) === 'active').length;
    const totalParticipants = tournaments.reduce((sum, t) => sum + (t.total_participants || 0), 0);

    const handleEdit = (tournament) => {
        setSelectedTournament(tournament);
        setFieldValue('name', tournament.name);
        setFieldValue('season', tournament.season);
        setFieldValue('type', tournament.type || '');
        setFieldValue('sede', tournament.sede || '');
        setFieldValue('start_date', tournament.start_date);
        setFieldValue('end_date', tournament.end_date);
        setFieldValue('total_participants', tournament.total_participants.toString());
        setFieldValue('is_international', tournament.is_international);
        setIsModalOpen(true);
    };

    const handleDelete = async (tournament) => {
        if (confirm(`¿Estás seguro de eliminar el torneo "${tournament.name}"?`)) {
            try {
                await deleteTournament(tournament.id);
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: `Torneo "${tournament.name}" eliminado correctamente`
                });
            } catch (error) {
                setToast({
                    isVisible: true,
                    type: 'error',
                    message: 'Error al eliminar el torneo'
                });
            }
        }
    };

    const onSubmit = async (formData) => {
        try {
            if (selectedTournament) {
                await updateTournament(selectedTournament.id, formData);
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: 'Torneo actualizado correctamente'
                });
            } else {
                await createTournament(formData);
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: 'Torneo creado correctamente'
                });
            }
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: error.message || 'Error al guardar el torneo'
            });
        }
    };

    const openCreateModal = () => {
        setSelectedTournament(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handlePageChange = (page) => {
        updatePagination({ skip: (page - 1) * pagination.limit });
    };

    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/20">
            {/* Header profesional */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-xl shadow-lg">
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Gestión de Torneos
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Sistema de análisis táctico • BasketscoreRD
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <AnimatedButton
                                variant={showFilters ? "danger" : "ghost"}
                                size="sm"
                                icon={Filter}
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? "!bg-[#CE1126]" : "!text-gray-700 dark:!text-gray-300"}
                            >
                                Filtros
                            </AnimatedButton>
                            
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                icon={RefreshCw}
                                onClick={() => window.location.reload()}
                                disabled={loading}
                                loading={loading}
                                className="!text-gray-700 dark:!text-gray-300"
                            >
                                Actualizar
                            </AnimatedButton>
                            
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                icon={isTableView ? Grid : List}
                                onClick={toggleViewMode}
                                className="!text-gray-700 dark:!text-gray-300"
                            >
                                {isTableView ? 'Cartas' : 'Tabla'}
                            </AnimatedButton>
                            
                            <AnimatedButton
                                variant="primary"
                                size="md"
                                icon={Plus}
                                onClick={openCreateModal}
                                className="!bg-gradient-to-r !from-[#CE1126] !to-[#002D62] hover:!shadow-xl"
                            >
                                Nuevo Torneo
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="p-4 sm:p-6 hover:shadow-2xl">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 rounded-xl">
                                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#CE1126] dark:text-[#002D62]" />
                                </div>
                                <div>
                                    <motion.p 
                                        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                    >
                                        {pagination.total}
                                    </motion.p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-4 sm:p-6 hover:shadow-2xl">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
                                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <motion.p 
                                        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                    >
                                        {tournaments.filter(t => getTournamentStatus(t.start_date, t.end_date) === 'active').length}
                                    </motion.p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Activos</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassCard className="p-4 sm:p-6 hover:shadow-2xl">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <motion.p 
                                        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring" }}
                                    >
                                        {tournaments.filter(t => getTournamentStatus(t.start_date, t.end_date) === 'completed').length}
                                    </motion.p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Completados</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <GlassCard className="p-4 sm:p-6 hover:shadow-2xl">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-gradient-to-br from-[#002D62]/20 to-[#CE1126]/20 rounded-xl">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#002D62] dark:text-[#CE1126]" />
                                </div>
                                <div>
                                    <motion.p 
                                        className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                    >
                                        {totalParticipants}
                                    </motion.p>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Participantes</p>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <GlassCard className="p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar torneos por nombre..."
                                value={filters.search || ''}
                                onChange={(e) => updateFilters({ search: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Quick Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => updateFilters({ status: 'todos' })}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${(filters.status || 'todos') === 'todos'
                                    ? 'bg-[#CE1126] text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Todos</span>
                                <span className="sm:hidden">Todo</span>
                            </button>
                            <button
                                onClick={() => updateFilters({ status: 'active' })}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${filters.status === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Activos</span>
                                <span className="sm:hidden">Activo</span>
                            </button>
                            <button
                                onClick={() => updateFilters({ status: 'completed' })}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${filters.status === 'completed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Completados</span>
                                <span className="sm:hidden">Comp.</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Torneo
                                    </label>
                                    <select
                                        value={filters.type || ''}
                                        onChange={(e) => updateFilters({ type: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent"
                                    >
                                        <option value="">Todos los tipos</option>
                                        <option value="FIBA">FIBA</option>
                                        <option value="Centrobasket">Centrobasket</option>
                                        <option value="AmeriCup">AmeriCup</option>
                                        <option value="Clasificatorias">Clasificatorias</option>
                                        <option value="Amistoso">Amistoso</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Ordenar por
                                    </label>
                                    <select
                                        value={filters.order_by || 'name'}
                                        onChange={(e) => updateFilters({ order_by: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent"
                                    >
                                        <option value="name">Nombre</option>
                                        <option value="start_date">Fecha de Inicio</option>
                                        <option value="season">Temporada</option>
                                        <option value="total_participants">Participantes</option>
                                    </select>
                                </div>

                                <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                                    <button
                                        onClick={() => updateFilters({ search: '', status: 'todos', type: '', order_by: 'name' })}
                                        className="w-full px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    </GlassCard>
                </motion.div>

                {/* Torneos Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <GlassCard className="overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CE1126] dark:border-[#002D62]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : tournaments.length === 0 ? (
                        <div className="text-center py-20">
                            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No se encontraron torneos</p>
                        </div>
                    ) : isTableView ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Torneo
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Temporada
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Sede
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Participantes
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {tournaments.map((tournament) => {
                                        const status = getTournamentStatus(tournament.start_date, tournament.end_date);
                                        return (
                                            <motion.tr 
                                                key={tournament.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-lg flex items-center justify-center">
                                                            <Trophy className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{tournament.name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {tournament.is_international ? 'Internacional' : 'Nacional'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {tournament.season}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {tournament.type || 'No especificado'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {tournament.sede || 'No especificado'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {tournament.total_participants || 0} equipos
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        status === 'active' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                    }`}>
                                                        {status === 'active' ? 'Activo' : status === 'completed' ? 'Completado' : 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                                            className="p-2 text-gray-400 hover:text-[#CE1126] dark:hover:text-[#002D62] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="Ver detalles"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(tournament)}
                                                            className="p-2 text-gray-400 hover:text-[#002D62] dark:hover:text-[#CE1126] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(tournament)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {tournaments.map((tournament) => (
                                <div
                                    key={tournament.id}
                                    className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/30 dark:hover:border-[#002D62]/30 transition-all duration-200 hover:shadow-lg"
                                >
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-lg flex items-center justify-center">
                                            <Trophy className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {tournament.name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{tournament.season}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Información */}
                                    <div className="space-y-2 mb-4">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {tournament.is_international ? 'Torneo Internacional' : 'Torneo Nacional'}
                                        </div>
                                        {tournament.sede && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                {tournament.sede}
                                            </div>
                                        )}
                                        {tournament.total_participants && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Users className="w-3 h-3" />
                                                {tournament.total_participants} equipos
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Acciones */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#CE1126]/10 dark:bg-[#002D62]/20 text-[#CE1126] dark:text-[#002D62] rounded-lg text-sm font-medium hover:bg-[#CE1126]/20 dark:hover:bg-[#002D62]/30 transition-colors"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Ver
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(tournament)}
                                                className="p-1.5 text-gray-400 hover:text-[#002D62] dark:hover:text-[#CE1126] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tournament)}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Mostrando {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total} torneos
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <AnimatedButton
                                    variant="ghost"
                                    size="sm"
                                    icon={ChevronLeft}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="!text-gray-600 dark:!text-gray-400 disabled:!opacity-50"
                                >
                                    <span className="sr-only">Anterior</span>
                                </AnimatedButton>
                                
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let page;
                                    if (totalPages <= 5) {
                                        page = i + 1;
                                    } else if (currentPage <= 3) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        page = totalPages - 4 + i;
                                    } else {
                                        page = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <AnimatedButton
                                            key={page}
                                            variant={currentPage === page ? "primary" : "ghost"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={currentPage === page 
                                                ? "!bg-[#CE1126] !text-white" 
                                                : "!text-gray-600 dark:!text-gray-400 hover:!bg-gray-100 dark:hover:!bg-gray-700"
                                            }
                                        >
                                            {page}
                                        </AnimatedButton>
                                    );
                                })}
                                
                                <AnimatedButton
                                    variant="ghost"
                                    size="sm"
                                    icon={ChevronRight}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="!text-gray-600 dark:!text-gray-400 disabled:!opacity-50"
                                >
                                    <span className="sr-only">Siguiente</span>
                                </AnimatedButton>
                            </div>
                        </div>
                    )}
                    </GlassCard>
                </motion.div>

                {/* Modal de crear/editar torneo */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            {/* Header del modal */}
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-lg">
                                            <Trophy className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedTournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
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
                                {/* Información básica */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Información Básica
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre del Torneo *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="ej. FIBA AmeriCup 2025"
                                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                touched.name && errors.name
                                                    ? 'border-red-500 focus:ring-red-500/20'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                            }`}
                                        />
                                        {touched.name && errors.name && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Temporada *
                                            </label>
                                            <input
                                                type="text"
                                                name="season"
                                                value={values.season}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="ej. 2024-2025"
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.season && errors.season
                                                        ? 'border-red-500 focus:ring-red-500/20'
                                                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                }`}
                                            />
                                            {touched.season && errors.season && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.season}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipo de Torneo
                                            </label>
                                            <select
                                                name="type"
                                                value={values.type}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="">Seleccionar tipo</option>
                                                <option value="FIBA">FIBA</option>
                                                <option value="Centrobasket">Centrobasket</option>
                                                <option value="AmeriCup">AmeriCup</option>
                                                <option value="Clasificatorias">Clasificatorias</option>
                                                <option value="Amistoso">Amistoso</option>
                                                <option value="Regional">Regional</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sede del Torneo
                                        </label>
                                        <input
                                            type="text"
                                            name="sede"
                                            value={values.sede}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="ej. Santo Domingo, República Dominicana"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Fechas del Torneo
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha de Inicio *
                                            </label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={values.start_date}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.start_date && errors.start_date
                                                        ? 'border-red-500 focus:ring-red-500/20'
                                                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                }`}
                                            />
                                            {touched.start_date && errors.start_date && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha de Fin *
                                            </label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={values.end_date}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.end_date && errors.end_date
                                                        ? 'border-red-500 focus:ring-red-500/20'
                                                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                }`}
                                            />
                                            {touched.end_date && errors.end_date && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Configuración */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Configuración
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Número de Equipos *
                                            </label>
                                            <input
                                                type="number"
                                                name="total_participants"
                                                value={values.total_participants}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                min="2"
                                                max="100"
                                                placeholder="ej. 12"
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                                    touched.total_participants && errors.total_participants
                                                        ? 'border-red-500 focus:ring-red-500/20'
                                                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20'
                                                }`}
                                            />
                                            {touched.total_participants && errors.total_participants && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.total_participants}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center pt-8">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="is_international"
                                                    checked={values.is_international}
                                                    onChange={(e) => setFieldValue('is_international', e.target.checked)}
                                                    className="w-5 h-5 text-[#CE1126] dark:text-[#002D62] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#CE1126]/20 dark:focus:ring-[#002D62]/20"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Torneo Internacional
                                                </span>
                                            </label>
                                        </div>
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
                                                <Trophy className="w-4 h-4" />
                                                {selectedTournament ? 'Actualizar Torneo' : 'Crear Torneo'}
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

export default Tournaments;

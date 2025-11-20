import { Plus, Trophy, Edit, Trash2, Eye, Grid, List, Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Filter, RefreshCw, TrendingUp, Sparkles, Target } from 'lucide-react';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { tournamentSchema } from '../../../../lib/validations/schemas';
import { useTournaments } from '../../hooks/useTournaments';
import { GlassCard, AnimatedButton, LoadingState, ErrorState } from '../../../../shared/ui/components/modern';
import { PageHeader } from '../../../../shared/ui/components/common';

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
        updatePagination,
        refetch
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

    // Función para ajustar el límite según el estado del sidebar
    const adjustLimit = (filtersOpen) => {
        const baseLimit = 12;
        const newLimit = filtersOpen ? Math.max(6, baseLimit - 3) : baseLimit;
        if (pagination.limit !== newLimit) {
            updatePagination({ limit: newLimit, skip: 0 });
        }
    };

    // Ajustar límite cuando cambie el estado del sidebar
    useEffect(() => {
        adjustLimit(showFilters);
    }, [showFilters]);

    // Auto-ocultar toast después de 3 segundos
    useEffect(() => {
        if (toast.isVisible) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, isVisible: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.isVisible]);

    // Función para refresh manual
    const handleRefresh = async () => {
        try {
            await refetch();
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Datos actualizados correctamente'
            });
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al actualizar los datos'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Header consistente con otras páginas */}
                <PageHeader
                    title="Gestión de Torneos"
                    subtitle="Selección Nacional • República Dominicana"
                    action={
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
                                Nuevo Torneo
                            </button>
                        </div>
                    }
                />

                {/* Stats Cards compactas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#CE1126]/30 hover:border-[#CE1126]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Total Torneos
                            </p>
                            <p className="text-3xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                {pagination.total}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#002D62]/30 hover:border-[#002D62]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Activos
                            </p>
                            <p className="text-3xl font-black text-[#002D62] dark:text-[#002D62]">
                                {tournaments.filter(t => getTournamentStatus(t.start_date, t.end_date) === 'active').length}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#CE1126]/30 hover:border-[#CE1126]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Completados
                            </p>
                            <p className="text-3xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                {tournaments.length}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#002D62]/30 hover:border-[#002D62]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Participantes
                            </p>
                            <p className="text-3xl font-black text-[#002D62] dark:text-[#002D62]">
                                {tournaments.reduce((sum, t) => sum + (t.total_participants || 0), 0)}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <div className="flex flex-col gap-3">
                            {/* Search solo */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar torneos por nombre..."
                                    value={filters.search || ''}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all"
                                />
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
                    </div>
                </motion.div>

                {/* Torneos Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Torneo
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Temporada
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Tipo
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Sede
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Participantes
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Estado
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700">
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
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-xs text-gray-900 dark:text-white">{tournament.name}</p>
                                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                                            {tournament.is_international ? 'Internacional' : 'Nacional'}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                                                        {tournament.season}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                                                        {tournament.type || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                                                        {tournament.sede || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                                                        {tournament.total_participants || 0}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border-2 ${status === 'active'
                                                            ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
                                                            : status === 'completed'
                                                                ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
                                                                : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'
                                                            }`}>
                                                            {status === 'active' ? 'Activo' : status === 'completed' ? 'Finalizado' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                                                className="px-2 py-1 bg-[#002D62] hover:bg-[#001a3d] text-white text-[10px] font-bold rounded border-2 border-black transition-all duration-200"
                                                                title="Ver detalles"
                                                            >
                                                                Ver
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleEdit(tournament)}
                                                                className="px-2 py-1 bg-white hover:bg-gray-50 text-[#002D62] border-2 border-black text-[10px] font-bold rounded transition-all duration-200"
                                                                title="Editar"
                                                            >
                                                                Editar
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDelete(tournament)}
                                                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded border-2 border-black transition-all duration-200"
                                                                title="Eliminar"
                                                            >
                                                                Eliminar
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {tournaments.map((tournament) => {
                                    const status = getTournamentStatus(tournament.start_date, tournament.end_date);
                                    return (
                                        <div
                                            key={tournament.id}
                                            className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/40 dark:hover:border-[#002D62]/40 transition-all hover:shadow-lg"
                                        >
                                            {/* Header compacto */}
                                            <div className="mb-3">
                                                <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">
                                                    {tournament.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                    {tournament.season} • {tournament.is_international ? 'Internacional' : 'Nacional'}
                                                </p>
                                            </div>

                                            {/* Información compacta */}
                                            <div className="space-y-1.5 mb-3">
                                                {tournament.sede && (
                                                    <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                                                        📍 {tournament.sede}
                                                    </p>
                                                )}
                                                {tournament.total_participants && (
                                                    <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                                                        👥 {tournament.total_participants} equipos
                                                    </p>
                                                )}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border-2 ${status === 'active'
                                                    ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
                                                    : status === 'completed'
                                                        ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
                                                        : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'
                                                    }`}>
                                                    {status === 'active' ? 'Activo' : status === 'completed' ? 'Finalizado' : 'Pendiente'}
                                                </span>
                                            </div>

                                            {/* Acciones compactas */}
                                            <div className="flex items-center gap-1 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                                    className="flex-1 px-2 py-1.5 bg-[#002D62] hover:bg-[#001a3d] text-white text-[10px] font-bold rounded transition-all"
                                                >
                                                    Ver
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(tournament)}
                                                    className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#002D62] border-2 border-[#002D62] text-[10px] font-bold rounded transition-all"
                                                >
                                                    Editar
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(tournament)}
                                                    className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

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
                    </div>
                </motion.div>

                {/* Modal de crear/editar torneo */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
                        <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.name && errors.name
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.season && errors.season
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.start_date && errors.start_date
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.end_date && errors.end_date
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
                                                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.total_participants && errors.total_participants
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

export default Tournaments;

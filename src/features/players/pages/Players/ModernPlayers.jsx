import { Plus, UserCircle, Edit, Trash2, Eye, Grid, List, Sparkles, TrendingUp, Users, Target, Trophy, Shield, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { playerSchema } from '../../../../lib/validations/schemas';
import usePlayers from '../../hooks/usePlayers';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import {
    SectionHeader,
    Badge,
    Modal,
    Input,
    Select,
    Toast
} from '../../../../shared/ui/components/common';
import {
    GlassCard,
    AnimatedButton,
    GradientBadge,
    ModernTable
} from '../../../../shared/ui/components/modern';
import LoadingSpinner from '../../../../shared/ui/components/common/feedback/LoadingSpinner';
import ErrorState from '../../../../shared/ui/components/modern/ErrorState/ErrorState';

const ModernPlayers = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const { viewMode, isTableView, toggleViewMode } = useViewMode('grid', 'players-view');

    const {
        players,
        loading,
        error,
        pagination,
        filters: apiFilters,
        createPlayer,
        updatePlayer,
        deletePlayer,
        updateFilters: updateApiFilters,
        updatePagination,
        refetch
    } = usePlayers();

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
        number: '',
        position: '',
        age: '',
        height: '',
        team: 'República Dominicana'
    }, playerSchema);

    // Calcular estadísticas
    const totalPlayers = players.length;
    const avgPPG = players.length > 0 ? (players.reduce((acc, p) => acc + (p.ppg || 0), 0) / players.length).toFixed(1) : '0.0';
    const avgRating = players.length > 0 ? Math.round(players.reduce((acc, p) => acc + (p.rating || 0), 0) / players.length) : 0;

    const filterConfig = {
        position: {
            defaultValue: 'all',
            filterFn: (player, value) => value === 'all' || player.position === value
        },
        searchFields: ['name', 'team', 'position']
    };

    const {
        searchTerm,
        setSearchTerm,
        filters,
        updateFilters,
        filteredData: filteredPlayers,
        hasActiveFilters,
        totalCount,
        filteredCount
    } = useFilters(players, filterConfig);

    const stats = [
        { title: 'Total Jugadores', value: totalPlayers.toString(), icon: Users, description: 'Registrados' },
        { title: 'Promedio PPG', value: avgPPG, icon: Target, description: 'Puntos por partido' },
        { title: 'Rating Promedio', value: avgRating.toString(), icon: Trophy, description: 'Valoración general' },
    ];

    const columns = [
        {
            key: 'number',
            label: '#',
            render: (value) => (
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {value}
                </motion.div>
            )
        },
        {
            key: 'name',
            label: 'Jugador',
            render: (value, row) => (
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.team}</p>
                </div>
            )
        },
        { key: 'position', label: 'Posición', render: (value) => <GradientBadge variant="primary" size="small">{value}</GradientBadge> },
        { key: 'age', label: 'Edad' },
        { key: 'height', label: 'Altura' },
        {
            key: 'rating',
            label: 'Rating',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{value}</span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay: 0.2 }} className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" />
                    </div>
                </div>
            )
        },
        {
            key: 'stats',
            label: 'Estadísticas',
            sortable: false,
            render: (_, row) => (
                <div className="flex gap-2">
                    <GradientBadge variant="success" size="small">{row.ppg} PPG</GradientBadge>
                    <GradientBadge variant="info" size="small">{row.rpg} RPG</GradientBadge>
                    <GradientBadge variant="warning" size="small">{row.apg} APG</GradientBadge>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); navigate(`/players/${row.id}`); }} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600">
                        <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg text-yellow-600">
                        <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); handleDelete(row); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
            )
        }
    ];

    const availableFilters = [
        {
            key: 'position',
            label: 'Posición',
            options: [
                { value: 'all', label: 'Todas las posiciones' },
                { value: 'Base', label: 'Base' },
                { value: 'Escolta', label: 'Escolta' },
                { value: 'Alero', label: 'Alero' },
                { value: 'Ala-Pívot', label: 'Ala-Pívot' },
                { value: 'Pívot', label: 'Pívot' }
            ],
            defaultValue: 'all'
        }
    ];

    const handleEdit = (player) => {
        setSelectedPlayer(player);
        setFieldValue('name', player.name);
        setFieldValue('number', player.number.toString());
        setFieldValue('position', player.position);
        setFieldValue('age', player.age.toString());
        setFieldValue('height', player.height);
        setFieldValue('team', player.team);
        setIsModalOpen(true);
    };

    const handleDelete = (player) => {
        if (confirm(`¿Eliminar a "${player.name}"?`)) {
            setToast({ isVisible: true, type: 'success', message: `Jugador eliminado` });
        }
    };

    const onSubmit = async (formData) => {
        try {
            setToast({ isVisible: true, type: 'success', message: selectedPlayer ? 'Jugador actualizado' : 'Jugador creado' });
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({ isVisible: true, type: 'error', message: 'Error al guardar el jugador' });
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

    if (error) {
        return (
            <ErrorState
                title="Error al cargar jugadores"
                message={error}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-['Inter',system-ui,sans-serif]">
            <main className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-8 shadow-2xl border border-white/10"
                >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                            animation: 'slide 20s linear infinite'
                        }}></div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

                    {/* Content */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/40 overflow-hidden">
                                    <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Plantel Nacional</h2>
                                    <p className="text-white/80 text-sm font-medium">Selección Dominicana de Baloncesto</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleViewMode}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold text-sm transition-all border border-white/30 flex items-center gap-2"
                                >
                                    {isTableView ? <><Grid className="w-4 h-4" /> Tarjetas</> : <><List className="w-4 h-4" /> Tabla</>}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={openCreateModal}
                                    className="px-4 py-2 bg-white text-[#CE1126] hover:bg-white/90 rounded-lg font-semibold text-sm transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar Jugador
                                </motion.button>
                            </div>
                        </div>

                        {/* KPIs del plantel */}
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="large" />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl w-full">
                                    {stats.map((stat, index) => (
                                        <motion.div
                                            key={stat.title}
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: 0.1 * (index + 1), type: "spring", stiffness: 100 }}
                                            className="group relative overflow-hidden rounded-2xl"
                                        >
                                            {/* Fondo con gradiente */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>

                                            {/* Efecto hover brillante */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {/* Borde animado */}
                                            <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-2xl transition-all duration-300"></div>

                                            {/* Contenido */}
                                            <div className="relative p-6 transform group-hover:scale-105 transition-transform duration-300">
                                                <div className="flex flex-col items-center">
                                                    {/* Icono grande con gradiente alternado */}
                                                    <div className={`mb-3 p-4 rounded-2xl bg-gradient-to-br ${index % 2 === 0 ? 'from-red-500/30 to-red-600/20' : 'from-blue-500/30 to-blue-600/20'} backdrop-blur-sm shadow-2xl group-hover:shadow-${index % 2 === 0 ? 'red' : 'blue'}-500/20 transition-all duration-300 group-hover:scale-110`}>
                                                        <stat.icon className="w-9 h-9 text-white drop-shadow-lg" />
                                                    </div>

                                                    {/* Título */}
                                                    <p className="text-white/90 text-xs font-extrabold uppercase tracking-[0.15em] mb-4 group-hover:text-white transition-colors">
                                                        {stat.title}
                                                    </p>

                                                    {/* Número principal */}
                                                    <div className="mb-2">
                                                        <p className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                                                            {stat.value}
                                                        </p>
                                                    </div>

                                                    {/* Descripción */}
                                                    <p className="text-white/70 text-sm font-semibold group-hover:text-white/90 transition-colors">
                                                        {stat.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Sección de búsqueda y filtros */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar jugadores por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#CE1126] focus:border-[#CE1126] transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filters.position || 'all'}
                                onChange={(e) => updateFilters('position', e.target.value)}
                                className="pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002D62] focus:border-[#002D62] transition-all appearance-none cursor-pointer min-w-[200px]"
                            >
                                {availableFilters[0].options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isTableView ? (
                            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                <ModernTable columns={columns} data={filteredPlayers} onRowClick={(row) => navigate(`/players/${row.id}`)} />
                            </motion.div>
                        ) : (
                            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPlayers.map((player, index) => (
                                    <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                                        <GlassCard hover onClick={() => navigate(`/players/${player.id}`)} className="p-6 cursor-pointer group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.5 }} className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                    <span>{player.number}</span>
                                                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-400" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{player.name}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{player.team}</p>
                                                    <GradientBadge variant="primary" size="small" className="mt-2">{player.position}</GradientBadge>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{player.rating}</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-400">Rating</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">PPG</p>
                                                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{player.ppg}</p>
                                                </div>
                                                <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-3">
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">RPG</p>
                                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{player.rpg}</p>
                                                </div>
                                                <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3">
                                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">APG</p>
                                                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{player.apg}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <AnimatedButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/players/${player.id}`); }} className="flex-1">
                                                    <Eye className="w-4 h-4 mr-1" />Ver
                                                </AnimatedButton>
                                                <AnimatedButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(player); }} className="flex-1">
                                                    <Edit className="w-4 h-4 mr-1" />Editar
                                                </AnimatedButton>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Modal de crear/editar jugador */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedPlayer ? 'Editar Jugador' : 'Agregar Jugador'}>
                    <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-4">
                        <Input label="Nombre Completo" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && errors.name} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Número" name="number" type="number" value={values.number} onChange={handleChange} onBlur={handleBlur} error={touched.number && errors.number} required />
                            <Select label="Posición" name="position" value={values.position} onChange={handleChange} onBlur={handleBlur} error={touched.position && errors.position} options={[
                                { value: 'Base', label: 'Base' },
                                { value: 'Escolta', label: 'Escolta' },
                                { value: 'Alero', label: 'Alero' },
                                { value: 'Ala-Pívot', label: 'Ala-Pívot' },
                                { value: 'Pívot', label: 'Pívot' }
                            ]} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Edad" name="age" type="number" value={values.age} onChange={handleChange} onBlur={handleBlur} error={touched.age && errors.age} required />
                            <Input label="Altura" name="height" value={values.height} onChange={handleChange} onBlur={handleBlur} error={touched.height && errors.height} placeholder="2.13m" required />
                        </div>
                        <Input label="Equipo" name="team" value={values.team} onChange={handleChange} onBlur={handleBlur} error={touched.team && errors.team} required />
                        <div className="flex gap-3 justify-end pt-4">
                            <AnimatedButton variant="secondary" type="button" onClick={closeModal} disabled={isSubmitting}>Cancelar</AnimatedButton>
                            <AnimatedButton variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (selectedPlayer ? 'Actualizar' : 'Crear')}
                            </AnimatedButton>
                        </div>
                    </form>
                </Modal>

                {/* Toast notifications */}
                <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
            </main>
        </div>
    );
};

export default ModernPlayers;

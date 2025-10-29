import { Plus, UserCircle, Edit, Trash2, Eye, Grid, List, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { playerSchema } from '../../../../lib/validations/schemas';
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

const ModernPlayers = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const { viewMode, isTableView, toggleViewMode } = useViewMode('table', 'players-view');

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

    const players = [
        { id: 1, name: 'Karl-Anthony Towns', number: 32, position: 'Pívot', team: 'República Dominicana', age: 28, height: '2.13m', rating: 95, ppg: 22.5, rpg: 11.2, apg: 3.8 },
        { id: 2, name: 'Al Horford', number: 42, position: 'Ala-Pívot', team: 'República Dominicana', age: 37, height: '2.08m', rating: 88, ppg: 12.3, rpg: 8.7, apg: 3.2 },
        { id: 3, name: 'Chris Duarte', number: 21, position: 'Escolta', team: 'República Dominicana', age: 26, height: '1.96m', rating: 82, ppg: 15.8, rpg: 4.2, apg: 2.5 },
        { id: 4, name: 'Andrés Feliz', number: 7, position: 'Base', team: 'República Dominicana', age: 29, height: '1.88m', rating: 85, ppg: 14.2, rpg: 3.1, apg: 6.8 },
        { id: 5, name: 'Víctor Liz', number: 15, position: 'Alero', team: 'República Dominicana', age: 31, height: '2.01m', rating: 80, ppg: 11.5, rpg: 5.3, apg: 2.1 },
    ];

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
        { title: 'Total Jugadores', value: totalCount.toString(), icon: UserCircle, change: '+3', trend: 'up', description: hasActiveFilters ? `${filteredCount} filtrados` : 'Plantel completo', gradient: 'from-blue-500 to-cyan-600' },
        { title: 'Promedio PPG', value: '16.9', icon: TrendingUp, change: '+2.1', trend: 'up', description: 'Puntos por partido', gradient: 'from-green-500 to-emerald-600' },
        { title: 'Rating Promedio', value: '88', icon: Sparkles, change: '+4', trend: 'up', description: 'Valoración general', gradient: 'from-purple-500 to-pink-600' },
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

    return (
        <div className="space-y-8">
            <GlassCard hover className="p-8">
                <SectionHeader
                    title="Plantel Nacional"
                    description="Gestión de jugadores de la Selección Dominicana"
                    icon={UserCircle}
                    action={
                        <div className="flex gap-3">
                            <AnimatedButton variant="secondary" size="md" onClick={toggleViewMode}>
                                {isTableView ? <Grid className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
                                {isTableView ? 'Vista Tarjetas' : 'Vista Tabla'}
                            </AnimatedButton>
                            <AnimatedButton variant="primary" size="md" onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Jugador
                            </AnimatedButton>
                        </div>
                    }
                />
            </GlassCard>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}>
                        <GlassCard hover className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </motion.div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    <TrendingUp className="w-4 h-4" />
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{stat.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar jugadores..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                    </div>
                    <select
                        value={filters.position || 'all'}
                        onChange={(e) => updateFilters('position', e.target.value)}
                        className="px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                        {availableFilters[0].options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
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
            </GlassCard>

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

            <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={() => setToast({ ...toast, isVisible: false })} />
        </div>
    );
};

export default ModernPlayers;

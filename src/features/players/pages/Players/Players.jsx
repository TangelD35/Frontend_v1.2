import { Plus, UserCircle, Edit, Trash2, Eye, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { playerSchema } from '../../../../lib/validations/schemas';
import {
    SectionHeader,
    ActionButton,
    Badge,
    StatsGrid,
    Table,
    CardView,
    SearchAndFilter,
    Modal,
    Input,
    Select,
    Toast
} from '../../../../shared/ui/components/common';

const Players = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Hooks personalizados
    const { viewMode, isTableView, toggleViewMode } = useViewMode('table', 'players-view');

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
        number: '',
        position: '',
        age: '',
        height: '',
        team: 'República Dominicana' // Valor por defecto
    }, playerSchema);

    const players = [
        {
            id: 1,
            name: 'Karl-Anthony Towns',
            number: 32,
            position: 'Pívot',
            team: 'República Dominicana',
            age: 28,
            height: '2.13m',
            rating: 95,
            ppg: 22.5,
            rpg: 11.2,
            apg: 3.8
        },
        {
            id: 2,
            name: 'Al Horford',
            number: 42,
            position: 'Ala-Pívot',
            team: 'República Dominicana',
            age: 37,
            height: '2.08m',
            rating: 88,
            ppg: 12.3,
            rpg: 8.7,
            apg: 3.2
        },
        {
            id: 3,
            name: 'Chris Duarte',
            number: 21,
            position: 'Escolta',
            team: 'República Dominicana',
            age: 26,
            height: '1.96m',
            rating: 82,
            ppg: 15.8,
            rpg: 4.2,
            apg: 2.5
        },
    ];

    // Configuración de filtros
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
        {
            title: 'Total Jugadores',
            value: totalCount.toString(),
            icon: UserCircle,
            change: '+3',
            trend: 'up',
            description: hasActiveFilters ? `${filteredCount} filtrados` : 'Plantel completo'
        },
        {
            title: 'Promedio PPG',
            value: '16.9',
            icon: UserCircle,
            change: '+2.1',
            trend: 'up',
            description: 'Puntos por partido'
        },
        {
            title: 'Rating Promedio',
            value: '88',
            icon: UserCircle,
            change: '+4',
            trend: 'up',
            description: 'Valoración general'
        },
    ];

    const columns = [
        {
            key: 'number',
            label: '#',
            render: (value) => (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {value}
                </div>
            )
        },
        {
            key: 'name',
            label: 'Jugador',
            render: (value, row) => (
                <div>
                    <p className="font-semibold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{row.team}</p>
                </div>
            )
        },
        {
            key: 'position',
            label: 'Posición',
            render: (value) => <Badge variant="primary">{value}</Badge>
        },
        { key: 'age', label: 'Edad' },
        { key: 'height', label: 'Altura' },
        {
            key: 'rating',
            label: 'Rating',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">{value}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                </div>
            )
        },
        {
            key: 'stats',
            label: 'Estadísticas',
            sortable: false,
            render: (_, row) => (
                <div className="text-xs text-gray-600">
                    {row.ppg} PPG • {row.rpg} RPG • {row.apg} APG
                </div>
            )
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
                            navigate(`/players/${row.id}`);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Filtros disponibles
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
        // Usar setFieldValue para establecer los valores del formulario
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
            // Aquí iría tu lógica para guardar en la API
            console.log('Datos del formulario:', formData);

            setToast({
                isVisible: true,
                type: 'success',
                message: selectedPlayer ? 'Jugador actualizado' : 'Jugador creado'
            });
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al guardar el jugador'
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 transition-all duration-500 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/50">
                <SectionHeader
                    title="Plantel Nacional"
                    description="Gestión de jugadores de la Selección Dominicana"
                    icon={UserCircle}
                    action={
                        <div className="flex gap-3">
                            <ActionButton
                                variant="secondary"
                                icon={isTableView ? Grid : List}
                                onClick={toggleViewMode}
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                {isTableView ? 'Vista Tarjetas' : 'Vista Tabla'}
                            </ActionButton>
                            <ActionButton
                                variant="primary"
                                icon={Plus}
                                onClick={openCreateModal}
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                Agregar Jugador
                            </ActionButton>
                        </div>
                    }
                />
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 dark:border-gray-700/30">
                <StatsGrid stats={stats} className="mb-0" />
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 dark:border-gray-700/30 shadow-lg">
                <SearchAndFilter
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={availableFilters}
                    activeFilters={filters}
                    onFilterChange={updateFilters}
                    placeholder="Buscar jugadores..."
                    className="mb-0"
                />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                {isTableView ? (
                    <div className="p-6">
                        <Table
                            columns={columns}
                            data={filteredPlayers}
                            onRowClick={(row) => navigate(`/players/${row.id}`)}
                            sortable
                            hoverable
                        />
                    </div>
                ) : (
                    <div className="p-6">
                        <CardView
                            data={filteredPlayers}
                            onView={(player) => navigate(`/players/${player.id}`)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            renderCard={(player) => (
                                <div className="group bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20 dark:from-gray-700 dark:via-purple-900/20 dark:to-blue-900/10 rounded-2xl p-6 border border-purple-200/30 dark:border-gray-600/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 animate-pulse"></div>
                                            <span className="relative">{player.number}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{player.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{player.team}</p>
                                            <Badge variant="primary" className="mt-2 shadow-sm">{player.position}</Badge>
                                        </div>
                                        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-3 shadow-sm">
                                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{player.rating}</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Rating</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200/50 dark:border-gray-600/50">
                                        <div className="text-center bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">PPG</p>
                                            <p className="text-lg font-bold text-green-700 dark:text-green-300">{player.ppg}</p>
                                        </div>
                                        <div className="text-center bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">RPG</p>
                                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{player.rpg}</p>
                                        </div>
                                        <div className="text-center bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-3">
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">APG</p>
                                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{player.apg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            columns={3}
                        />
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedPlayer ? 'Editar Jugador' : 'Agregar Jugador'}
            >
                <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nombre Completo"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && errors.name}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Número"
                            name="number"
                            type="number"
                            value={values.number}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.number && errors.number}
                            required
                        />
                        <Select
                            label="Posición"
                            name="position"
                            value={values.position}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.position && errors.position}
                            options={[
                                { value: 'Base', label: 'Base' },
                                { value: 'Escolta', label: 'Escolta' },
                                { value: 'Alero', label: 'Alero' },
                                { value: 'Ala-Pívot', label: 'Ala-Pívot' },
                                { value: 'Pívot', label: 'Pívot' }
                            ]}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Edad"
                            name="age"
                            type="number"
                            value={values.age}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.age && errors.age}
                            required
                        />
                        <Input
                            label="Altura"
                            name="height"
                            value={values.height}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.height && errors.height}
                            placeholder="2.13m"
                            required
                        />
                    </div>
                    <Input
                        label="Equipo"
                        name="team"
                        value={values.team}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.team && errors.team}
                        required
                    />
                    <div className="flex gap-3 justify-end pt-4">
                        <ActionButton
                            variant="secondary"
                            type="button"
                            onClick={closeModal}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </ActionButton>
                        <ActionButton
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : (selectedPlayer ? 'Actualizar' : 'Crear')}
                        </ActionButton>
                    </div>
                </form>
            </Modal>

            <Toast
                type={toast.type}
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
};

export default Players;
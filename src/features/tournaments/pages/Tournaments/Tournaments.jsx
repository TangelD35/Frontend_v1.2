import { Plus, Trophy, Edit, Trash2, Eye, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { tournamentSchema } from '../../../../lib/validations/schemas';
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

const TournamentsWithTable = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Hooks personalizados
    const { viewMode, isTableView, toggleViewMode } = useViewMode('table', 'tournaments-view');

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
        type: '',
        startDate: '',
        endDate: '',
        location: '',
        teams: '',
        description: ''
    }, tournamentSchema);

    // Datos de ejemplo
    const tournaments = [
        {
            id: 1,
            name: 'FIBA AmeriCup 2025',
            type: 'Internacional',
            startDate: '2025-01-15',
            endDate: '2025-01-30',
            location: 'República Dominicana',
            teams: 12,
            status: 'active',
            description: 'Torneo continental de baloncesto'
        },
        {
            id: 2,
            name: 'Copa del Caribe',
            type: 'Regional',
            startDate: '2024-08-20',
            endDate: '2024-08-28',
            location: 'Jamaica',
            teams: 8,
            status: 'completed',
            description: 'Competencia regional del Caribe'
        },
        {
            id: 3,
            name: 'Clasificatorio Mundial',
            type: 'Internacional',
            startDate: '2025-03-10',
            endDate: '2025-11-15',
            location: 'Varios países',
            teams: 16,
            status: 'pending',
            description: 'Clasificatorias para el Mundial de Baloncesto'
        },
    ];

    const columns = [
        {
            key: 'name',
            label: 'Torneo',
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-600" />
                    <div>
                        <span className="font-semibold block">{value}</span>
                        {row.description && (
                            <span className="text-xs text-gray-500">{row.description}</span>
                        )}
                    </div>
                </div>
            )
        },
        { key: 'type', label: 'Tipo' },
        {
            key: 'dates',
            label: 'Fechas',
            sortable: false,
            render: (_, row) => (
                <div className="text-sm">
                    <div>Inicio: {new Date(row.startDate).toLocaleDateString('es-ES')}</div>
                    {row.endDate && (
                        <div>Fin: {new Date(row.endDate).toLocaleDateString('es-ES')}</div>
                    )}
                </div>
            )
        },
        { key: 'location', label: 'Ubicación' },
        { key: 'teams', label: 'Equipos', sortable: true },
        {
            key: 'status',
            label: 'Estado',
            render: (value) => {
                const variants = {
                    active: 'success',
                    completed: 'default',
                    pending: 'warning'
                };
                const labels = {
                    active: 'Activo',
                    completed: 'Finalizado',
                    pending: 'Próximo'
                };
                return <Badge variant={variants[value]}>{labels[value]}</Badge>;
            }
        },
        {
            key: 'actions',
            label: 'Acciones',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Configuración de filtros
    const filterConfig = {
        type: {
            defaultValue: 'all',
            filterFn: (tournament, value) => value === 'all' || tournament.type === value
        },
        status: {
            defaultValue: 'all',
            filterFn: (tournament, value) => value === 'all' || tournament.status === value
        },
        searchFields: ['name', 'location', 'description']
    };

    const {
        searchTerm,
        setSearchTerm,
        filters,
        updateFilters,
        filteredData: filteredTournaments,
        hasActiveFilters,
        totalCount,
        filteredCount
    } = useFilters(tournaments, filterConfig);

    // Filtros disponibles
    const availableFilters = [
        {
            key: 'type',
            label: 'Tipo',
            options: [
                { value: 'all', label: 'Todos los tipos' },
                { value: 'Internacional', label: 'Internacional' },
                { value: 'Regional', label: 'Regional' },
                { value: 'Nacional', label: 'Nacional' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'status',
            label: 'Estado',
            options: [
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Activo' },
                { value: 'completed', label: 'Finalizado' },
                { value: 'pending', label: 'Próximo' }
            ],
            defaultValue: 'all'
        }
    ];

    const activeTournaments = tournaments.filter(t => t.status === 'active').length;
    const completedTournaments = tournaments.filter(t => t.status === 'completed').length;
    const totalTeams = tournaments.reduce((sum, t) => sum + t.teams, 0);

    const stats = [
        {
            title: 'Total Torneos',
            value: totalCount.toString(),
            icon: Trophy,
            change: '+3',
            trend: 'up',
            description: hasActiveFilters ? `${filteredCount} filtrados` : 'Torneos registrados'
        },
        {
            title: 'Torneos Activos',
            value: activeTournaments.toString(),
            icon: Trophy,
            change: '+1',
            trend: 'up',
            description: 'En curso actualmente'
        },
        {
            title: 'Equipos Participantes',
            value: totalTeams.toString(),
            icon: Trophy,
            change: '+24',
            trend: 'up',
            description: 'Total de equipos'
        },
    ];

    const handleEdit = (tournament) => {
        setSelectedTournament(tournament);
        setFieldValue('name', tournament.name);
        setFieldValue('type', tournament.type);
        setFieldValue('startDate', tournament.startDate);
        setFieldValue('endDate', tournament.endDate || '');
        setFieldValue('location', tournament.location);
        setFieldValue('teams', tournament.teams.toString());
        setFieldValue('description', tournament.description || '');
        setIsModalOpen(true);
    };

    const handleDelete = (tournament) => {
        if (confirm(`¿Estás seguro de eliminar el torneo "${tournament.name}"?`)) {
            setToast({
                isVisible: true,
                type: 'success',
                message: `Torneo "${tournament.name}" eliminado correctamente`
            });
        }
    };

    const onSubmit = async (formData) => {
        try {
            console.log('Guardar torneo:', formData);
            setToast({
                isVisible: true,
                type: 'success',
                message: selectedTournament ? 'Torneo actualizado' : 'Torneo creado'
            });
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al guardar el torneo'
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

    return (
        <div>
            <SectionHeader
                title="Torneos Internacionales"
                description="Gestiona todos los torneos de baloncesto"
                icon={Trophy}
                action={
                    <div className="flex gap-2">
                        <ActionButton
                            variant="secondary"
                            icon={isTableView ? Grid : List}
                            onClick={toggleViewMode}
                        >
                            {isTableView ? 'Vista Tarjetas' : 'Vista Tabla'}
                        </ActionButton>
                        <ActionButton
                            variant="primary"
                            icon={Plus}
                            onClick={openCreateModal}
                        >
                            Nuevo Torneo
                        </ActionButton>
                    </div>
                }
            />

            <StatsGrid stats={stats} className="mb-6" />

            <SearchAndFilter
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={availableFilters}
                activeFilters={filters}
                onFilterChange={updateFilters}
                placeholder="Buscar torneos..."
                className="mb-6"
            />

            {isTableView ? (
                <Table
                    columns={columns}
                    data={filteredTournaments}
                    onRowClick={(row) => navigate(`/tournaments/${row.id}`)}
                    sortable
                    hoverable
                    emptyMessage="No se encontraron torneos"
                />
            ) : (
                <CardView
                    data={filteredTournaments}
                    onView={(tournament) => navigate(`/tournaments/${tournament.id}`)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    renderCard={(tournament) => (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-8 h-8 text-yellow-600" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{tournament.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{tournament.location}</p>
                                    </div>
                                </div>
                                <Badge variant={
                                    tournament.status === 'active' ? 'success' :
                                        tournament.status === 'completed' ? 'default' : 'warning'
                                }>
                                    {tournament.status === 'active' ? 'Activo' :
                                        tournament.status === 'completed' ? 'Finalizado' : 'Próximo'}
                                </Badge>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tournament.description}</p>
                                <Badge variant="primary" className="text-xs">{tournament.type}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Equipos</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{tournament.teams}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Inicio</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">
                                        {new Date(tournament.startDate).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    columns={2}
                />
            )}

            {/* Modal de formulario */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedTournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
                size="large"
            >
                <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nombre del Torneo"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && errors.name}
                        placeholder="FIBA AmeriCup 2025"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tipo"
                            name="type"
                            value={values.type}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.type && errors.type}
                            options={[
                                { value: 'Internacional', label: 'Internacional' },
                                { value: 'Regional', label: 'Regional' },
                                { value: 'Nacional', label: 'Nacional' }
                            ]}
                            required
                        />

                        <Input
                            label="Ubicación"
                            name="location"
                            value={values.location}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.location && errors.location}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Fecha de Inicio"
                            name="startDate"
                            type="date"
                            value={values.startDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.startDate && errors.startDate}
                            required
                        />

                        <Input
                            label="Fecha de Fin (Opcional)"
                            name="endDate"
                            type="date"
                            value={values.endDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.endDate && errors.endDate}
                        />
                    </div>

                    {/* Mostrar error de validación para fechas */}
                    {errors.endDate && typeof errors.endDate === 'string' && errors.endDate.includes('posterior') && (
                        <div className="text-red-500 text-sm -mt-2 mb-2">{errors.endDate}</div>
                    )}

                    <Input
                        label="Número de Equipos"
                        name="teams"
                        type="number"
                        value={values.teams}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.teams && errors.teams}
                        min="2"
                        max="100"
                        required
                    />

                    <Input
                        label="Descripción (Opcional)"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.description && errors.description}
                        placeholder="Breve descripción del torneo..."
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
                            {isSubmitting ? 'Guardando...' : (selectedTournament ? 'Actualizar' : 'Crear')}
                        </ActionButton>
                    </div>
                </form>
            </Modal>

            {/* Toast */}
            <Toast
                type={toast.type}
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
};

export default TournamentsWithTable;
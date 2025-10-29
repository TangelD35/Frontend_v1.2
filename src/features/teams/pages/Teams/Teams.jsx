import { Plus, Shield, Edit, Trash2, Eye, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { teamSchema } from '../../../../lib/validations/schemas';
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
    Textarea,
    Toast
} from '../../../../shared/ui/components/common';

const Teams = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Hooks personalizados
    const { viewMode, isTableView, toggleViewMode } = useViewMode('table', 'teams-view');

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
        country: '',
        category: '',
        coach: '',
        founded: '',
        description: ''
    }, teamSchema);

    const teams = [
        {
            id: 1,
            name: 'Estados Unidos',
            logo: '🇺🇸',
            country: 'USA',
            category: 'Selección Nacional',
            wins: 245,
            losses: 18,
            winRate: 93.1,
            worldRanking: 1,
            coach: 'Steve Kerr',
            avgPoints: 98.5,
            avgDefense: 78.2
        },
        {
            id: 2,
            name: 'España',
            logo: '🇪🇸',
            country: 'ESP',
            category: 'Selección Nacional',
            wins: 189,
            losses: 56,
            winRate: 77.1,
            worldRanking: 2,
            coach: 'Sergio Scariolo',
            avgPoints: 87.3,
            avgDefense: 81.5
        },
        {
            id: 3,
            name: 'República Dominicana',
            logo: '🇩🇴',
            country: 'DOM',
            category: 'Selección Nacional',
            wins: 45,
            losses: 33,
            winRate: 57.7,
            worldRanking: 18,
            coach: 'Néstor García',
            avgPoints: 82.4,
            avgDefense: 85.1
        },
    ];

    // Configuración de filtros
    const filterConfig = {
        category: {
            defaultValue: 'all',
            filterFn: (team, value) => value === 'all' || team.category === value
        },
        searchFields: ['name', 'country', 'coach', 'category']
    };

    const {
        searchTerm,
        setSearchTerm,
        filters,
        updateFilters,
        filteredData: filteredTeams,
        hasActiveFilters,
        totalCount,
        filteredCount
    } = useFilters(teams, filterConfig);

    // Filtros disponibles
    const availableFilters = [
        {
            key: 'category',
            label: 'Categoría',
            options: [
                { value: 'all', label: 'Todas las categorías' },
                { value: 'Selección Nacional', label: 'Selección Nacional' },
                { value: 'Club', label: 'Club' },
                { value: 'Universidad', label: 'Universidad' }
            ],
            defaultValue: 'all'
        }
    ];

    const stats = [
        {
            title: 'Total Equipos',
            value: totalCount.toString(),
            icon: Shield,
            change: '+2',
            trend: 'up',
            description: hasActiveFilters ? `${filteredCount} filtrados` : 'Equipos registrados'
        },
        {
            title: 'Promedio Victorias',
            value: '68.2%',
            icon: Shield,
            change: '+3.5%',
            trend: 'up',
            description: 'Porcentaje de victorias'
        },
        {
            title: 'Ranking Promedio',
            value: '7',
            icon: Shield,
            change: '-2',
            trend: 'up',
            description: 'Posición mundial promedio'
        },
    ];

    const columns = [
        {
            key: 'logo',
            label: 'Logo',
            sortable: false,
            render: (value) => <span className="text-3xl">{value}</span>
        },
        {
            key: 'name',
            label: 'Equipo',
            render: (value, row) => (
                <div>
                    <p className="font-semibold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{row.coach}</p>
                </div>
            )
        },
        { key: 'category', label: 'Categoría' },
        {
            key: 'worldRanking',
            label: 'Ranking',
            render: (value) => <Badge variant="primary">#{value}</Badge>
        },
        {
            key: 'record',
            label: 'Récord',
            sortable: false,
            render: (_, row) => `${row.wins}V - ${row.losses}D`
        },
        {
            key: 'winRate',
            label: '% Victorias',
            render: (value) => (
                <span className="font-semibold text-green-600">{value.toFixed(1)}%</span>
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
                            navigate(`/teams/${row.id}`);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];



    const handleEdit = (team) => {
        setSelectedTeam(team);
        setFieldValue('name', team.name);
        setFieldValue('country', team.country);
        setFieldValue('category', team.category);
        setFieldValue('coach', team.coach);
        setFieldValue('founded', team.founded || '');
        setFieldValue('description', team.description || '');
        setIsModalOpen(true);
    };

    const handleDelete = (team) => {
        if (confirm(`¿Eliminar "${team.name}"?`)) {
            setToast({
                isVisible: true,
                type: 'success',
                message: `Equipo "${team.name}" eliminado`
            });
        }
    };

    const onSubmit = async (formData) => {
        try {
            console.log('Datos del equipo:', formData);

            setToast({
                isVisible: true,
                type: 'success',
                message: selectedTeam ? 'Equipo actualizado' : 'Equipo creado'
            });
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al guardar el equipo'
            });
        }
    };

    const openCreateModal = () => {
        setSelectedTeam(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 transition-all duration-500 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/50">
                <SectionHeader
                    title="Equipos Rivales"
                    description="Análisis y gestión de equipos internacionales"
                    icon={Shield}
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
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Agregar Equipo
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
                    placeholder="Buscar equipos..."
                    className="mb-0"
                />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                {isTableView ? (
                    <div className="p-6">
                        <Table
                            columns={columns}
                            data={filteredTeams}
                            onRowClick={(row) => navigate(`/teams/${row.id}`)}
                            sortable
                            hoverable
                        />
                    </div>
                ) : (
                    <div className="p-6">
                        <CardView
                            data={filteredTeams}
                            onView={(team) => navigate(`/teams/${team.id}`)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            renderCard={(team) => (
                                <div className="group bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/10 rounded-2xl p-6 border border-blue-200/30 dark:border-gray-600/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{team.logo}</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{team.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{team.coach}</p>
                                            <Badge variant="primary" className="mt-2 shadow-sm">{team.category}</Badge>
                                        </div>
                                        <div className="text-center">
                                            <Badge variant="primary" className="text-lg px-3 py-1 shadow-lg">#{team.worldRanking}</Badge>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ranking Mundial</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-200/50 dark:border-gray-600/50">
                                        <div className="text-center bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Pts/Partido</p>
                                            <p className="text-lg font-bold text-green-700 dark:text-green-300">{team.avgPoints}</p>
                                        </div>
                                        <div className="text-center bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Def/Partido</p>
                                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{team.avgDefense}</p>
                                        </div>
                                        <div className="text-center bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-3">
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">% Vict.</p>
                                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{team.winRate.toFixed(1)}%</p>
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
                title={selectedTeam ? 'Editar Equipo' : 'Agregar Equipo'}
                size="large"
            >
                <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nombre del Equipo"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name && errors.name}
                            required
                        />
                        <Input
                            label="País"
                            name="country"
                            value={values.country}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.country && errors.country}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Categoría"
                            name="category"
                            value={values.category}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.category && errors.category}
                            options={[
                                { value: 'Selección Nacional', label: 'Selección Nacional' },
                                { value: 'Club', label: 'Club' },
                                { value: 'Universidad', label: 'Universidad' }
                            ]}
                            required
                        />
                        <Input
                            label="Entrenador"
                            name="coach"
                            value={values.coach}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.coach && errors.coach}
                            required
                        />
                    </div>
                    <Input
                        label="Fecha de Fundación"
                        name="founded"
                        type="date"
                        value={values.founded}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.founded && errors.founded}
                    />
                    <Textarea
                        label="Descripción"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.description && errors.description}
                        rows={3}
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
                            {isSubmitting ? 'Guardando...' : (selectedTeam ? 'Actualizar' : 'Crear')}
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

export default Teams;
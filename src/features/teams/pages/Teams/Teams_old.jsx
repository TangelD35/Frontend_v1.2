import { Plus, Shield, Edit, Trash2, Eye, Grid, List, Flag, Search, Filter, Users, Trophy, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { teamSchema } from '../../../../lib/validations/schemas';
import { useTeams } from '../../hooks/useTeams';
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

    // Hook para manejar equipos desde el backend
    const {
        teams,
        loading,
        error,
        pagination,
        filters,
        createTeam,
        updateTeam,
        deleteTeam,
        updateFilters,
        updatePagination
    } = useTeams();

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
        coach: '',
        founded_year: '',
        is_national_team: false
    }, teamSchema);

    // Función para obtener el emoji de la bandera del país
    const getCountryFlag = (country) => {
        const flags = {
            'USA': '🇺🇸',
            'ESP': '🇪🇸', 
            'DOM': '🇩🇴',
            'ARG': '🇦🇷',
            'BRA': '🇧🇷',
            'CAN': '🇨🇦',
            'FRA': '🇫🇷',
            'GER': '🇩🇪',
            'ITA': '🇮🇹',
            'AUS': '🇦🇺'
        };
        return flags[country.toUpperCase()] || '🏀';
    };

    // Filtros disponibles
    const handleSearchChange = (search) => {
        updateFilters({ search });
    };

    const handleFilterChange = (newFilters) => {
        updateFilters(newFilters);
    };

    // Filtros disponibles
    const availableFilters = [
        {
            key: 'is_national_team',
            label: 'Tipo de Equipo',
            options: [
                { value: '', label: 'Todos los tipos' },
                { value: 'true', label: 'Selección Nacional' },
                { value: 'false', label: 'Equipos de Club' }
            ],
            defaultValue: ''
        },
        {
            key: 'country',
            label: 'País',
            options: [
                { value: '', label: 'Todos los países' },
                { value: 'USA', label: 'Estados Unidos' },
                { value: 'ESP', label: 'España' },
                { value: 'DOM', label: 'República Dominicana' },
                { value: 'ARG', label: 'Argentina' },
                { value: 'BRA', label: 'Brasil' }
            ],
            defaultValue: ''
        }
    ];

    const stats = [
        {
            title: 'Total Equipos',
            value: pagination.total.toString(),
            icon: Shield,
            change: '+2',
            trend: 'up',
            description: 'Equipos registrados'
        },
        {
            title: 'Selecciones Nacionales',
            value: teams.filter(t => t.is_national_team).length.toString(),
            icon: Flag,
            change: '+1',
            trend: 'up',
            description: 'Equipos nacionales'
        },
        {
            title: 'Equipos de Club',
            value: teams.filter(t => !t.is_national_team).length.toString(),
            icon: Shield,
            change: '+1',
            trend: 'up',
            description: 'Equipos de club'
        },
    ];

    const columns = [
        {
            key: 'country',
            label: 'País',
            sortable: false,
            render: (value) => (
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCountryFlag(value)}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{value}</span>
                </div>
            )
        },
        {
            key: 'name',
            label: 'Equipo',
            render: (value, row) => (
                <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.coach || 'Sin entrenador'}</p>
                </div>
            )
        },
        {
            key: 'is_national_team',
            label: 'Tipo',
            render: (value) => (
                <Badge variant={value ? "primary" : "secondary"}>
                    {value ? 'Selección Nacional' : 'Club'}
                </Badge>
            )
        },
        {
            key: 'founded_year',
            label: 'Fundado',
            render: (value) => value || 'N/A'
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
                        className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
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
        setFieldValue('coach', team.coach || '');
        setFieldValue('founded_year', team.founded_year || '');
        setFieldValue('is_national_team', team.is_national_team);
        setIsModalOpen(true);
    };

    const handleDelete = async (team) => {
        if (confirm(`¿Eliminar "${team.name}"?`)) {
            const result = await deleteTeam(team.id);
            
            if (result.success) {
                setToast({
                    isVisible: true,
                    type: 'success',
                    message: `Equipo "${team.name}" eliminado correctamente`
                });
            } else {
                setToast({
                    isVisible: true,
                    type: 'error',
                    message: result.error || 'Error al eliminar el equipo'
                });
            }
        }
    };

    const onSubmit = async (formData) => {
        let result;
        
        if (selectedTeam) {
            result = await updateTeam(selectedTeam.id, formData);
        } else {
            result = await createTeam(formData);
        }
        
        if (result.success) {
            setToast({
                isVisible: true,
                type: 'success',
                message: selectedTeam ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente'
            });
            setIsModalOpen(false);
            reset();
            setSelectedTeam(null);
        } else {
            setToast({
                isVisible: true,
                type: 'error',
                message: result.error || 'Error al guardar el equipo'
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
                    searchValue={filters.search || ''}
                    onSearchChange={handleSearchChange}
                    filters={availableFilters}
                    activeFilters={filters}
                    onFilterChange={handleFilterChange}
                    placeholder="Buscar equipos..."
                    className="mb-0"
                />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                {isTableView ? (
                    <div className="p-6">
                        <Table
                            columns={columns}
                            data={teams}
                            onRowClick={(row) => navigate(`/teams/${row.id}`)}
                            sortable
                            hoverable
                            loading={loading}
                            error={error}
                        />
                    </div>
                ) : (
                    <div className="p-6">
                        <CardView
                            data={teams}
                            onView={(team) => navigate(`/teams/${team.id}`)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            loading={loading}
                            error={error}
                            renderCard={(team) => (
                                <div className="group bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-700 dark:via-blue-900/20 dark:to-purple-900/10 rounded-2xl p-6 border border-blue-200/30 dark:border-gray-600/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">{getCountryFlag(team.country)}</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{team.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{team.coach || 'Sin entrenador'}</p>
                                            <Badge variant={team.is_national_team ? "primary" : "secondary"} className="mt-2 shadow-sm">
                                                {team.is_national_team ? 'Selección Nacional' : 'Club'}
                                            </Badge>
                                        </div>
                                        <div className="text-center">
                                            <Badge variant="secondary" className="text-lg px-3 py-1 shadow-lg">{team.country}</Badge>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">País</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/50 dark:border-gray-600/50">
                                        <div className="text-center bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Fundado</p>
                                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{team.founded_year || 'N/A'}</p>
                                        </div>
                                        <div className="text-center bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-3">
                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Tipo</p>
                                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                                {team.is_national_team ? 'Nacional' : 'Club'}
                                            </p>
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
                            label="Tipo de Equipo"
                            name="is_national_team"
                            value={values.is_national_team ? 'true' : 'false'}
                            onChange={(e) => handleChange({
                                target: {
                                    name: 'is_national_team',
                                    value: e.target.value === 'true'
                                }
                            })}
                            onBlur={handleBlur}
                            error={touched.is_national_team && errors.is_national_team}
                            options={[
                                { value: 'true', label: 'Selección Nacional' },
                                { value: 'false', label: 'Equipo de Club' }
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
                            placeholder="Nombre del entrenador (opcional)"
                        />
                    </div>
                    <Input
                        label="Año de Fundación"
                        name="founded_year"
                        type="number"
                        value={values.founded_year}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.founded_year && errors.founded_year}
                        placeholder="Ej: 1990"
                        min="1800"
                        max={new Date().getFullYear()}
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
import { Plus, Shield, Edit, Trash2, Eye, Grid, List, Search, Users, Calendar, MapPin, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { teamSchema } from '../../../../lib/validations/schemas';
import { useTeams } from '../../hooks/useTeams';

const Teams = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    // Hook para cambiar entre vista de cartas y tabla
    const { viewMode, isTableView, toggleViewMode } = useViewMode('cards', 'teams-view');

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
            'USA': '🇺🇸', 'ESP': '🇪🇸', 'DOM': '🇩🇴', 'ARG': '🇦🇷', 'BRA': '🇧🇷',
            'CAN': '🇨🇦', 'FRA': '🇫🇷', 'GER': '🇩🇪', 'ITA': '🇮🇹', 'AUS': '🇦🇺'
        };
        return flags[country?.toUpperCase()] || '🏀';
    };

    // Handlers
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        updateFilters({ search: value });
    };

    const openCreateModal = () => {
        setSelectedTeam(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (team) => {
        setSelectedTeam(team);
        setFieldValue('name', team.name);
        setFieldValue('country', team.country);
        setFieldValue('coach', team.coach || '');
        setFieldValue('founded_year', team.founded_year || '');
        setFieldValue('is_national_team', team.is_national_team || false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
        reset();
    };

    const handleFormSubmit = validateAndSubmit(async (formData) => {
        try {
            if (selectedTeam) {
                await updateTeam(selectedTeam.id, formData);
                setToast({ isVisible: true, type: 'success', message: 'Equipo actualizado exitosamente' });
            } else {
                await createTeam(formData);
                setToast({ isVisible: true, type: 'success', message: 'Equipo creado exitosamente' });
            }
            closeModal();
        } catch (error) {
            setToast({ isVisible: true, type: 'error', message: error.message || 'Error al procesar la solicitud' });
        }
    });

    const handleDelete = async (teamId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
            try {
                await deleteTeam(teamId);
                setToast({ isVisible: true, type: 'success', message: 'Equipo eliminado exitosamente' });
            } catch (error) {
                setToast({ isVisible: true, type: 'error', message: error.message || 'Error al eliminar el equipo' });
            }
        }
    };

    const handlePageChange = (page) => {
        updatePagination({ skip: (page - 1) * pagination.limit });
    };

    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    // Columnas para la vista de tabla
    const columns = [
        {
            key: 'country',
            label: 'País',
            render: (team) => (
                <div className="flex items-center gap-2">
                    <span className="text-xl">{getCountryFlag(team.country)}</span>
                    <span className="font-medium">{team.country}</span>
                </div>
            )
        },
        {
            key: 'name',
            label: 'Nombre del Equipo',
            render: (team) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{team.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {team.is_national_team ? 'Selección Nacional' : 'Club'}
                    </p>
                </div>
            )
        },
        {
            key: 'coach',
            label: 'Entrenador',
            render: (team) => team.coach || <span className="text-gray-400 italic">No especificado</span>
        },
        {
            key: 'founded_year',
            label: 'Fundado',
            render: (team) => team.founded_year || <span className="text-gray-400 italic">No especificado</span>
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (team) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/teams/${team.id}`)}
                        className="p-2 text-gray-400 hover:text-[#CE1126] dark:hover:text-[#002D62] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => openEditModal(team)}
                        className="p-2 text-gray-400 hover:text-[#002D62] dark:hover:text-[#CE1126] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(team.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/20">
            {/* Header profesional */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-[#CE1126] to-[#002D62] rounded-xl shadow-lg">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Gestión de Equipos
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
                                Nuevo Equipo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#CE1126]/10 dark:bg-[#002D62]/20 rounded-lg">
                                <Users className="w-6 h-6 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Equipos</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#002D62]/10 dark:bg-[#CE1126]/20 rounded-lg">
                                <MapPin className="w-6 h-6 text-[#002D62] dark:text-[#CE1126]" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {new Set(teams.map(team => team.country)).size}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Países Representados</p>
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
                            placeholder="Buscar equipos por nombre o país..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Teams Content */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CE1126] dark:border-[#002D62]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-20">
                            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No se encontraron equipos</p>
                        </div>
                    ) : isTableView ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        {columns.map((column) => (
                                            <th key={column.key} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {teams.map((team) => (
                                        <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            {columns.map((column) => (
                                                <td key={column.key} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {column.render(team)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {teams.map((team) => (
                                <div
                                    key={team.id}
                                    className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/30 dark:hover:border-[#002D62]/30 transition-all duration-200 hover:shadow-lg"
                                >
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                                            {getCountryFlag(team.country)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {team.name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{team.country}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Información */}
                                    <div className="space-y-2 mb-4">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {team.is_national_team ? 'Selección Nacional' : 'Club'}
                                        </div>
                                        {team.coach && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Users className="w-3 h-3" />
                                                {team.coach}
                                            </div>
                                        )}
                                        {team.founded_year && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {team.founded_year}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Acciones */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => navigate(`/teams/${team.id}`)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#CE1126]/10 dark:bg-[#002D62]/20 text-[#CE1126] dark:text-[#002D62] rounded-lg text-sm font-medium hover:bg-[#CE1126]/20 dark:hover:bg-[#002D62]/30 transition-colors"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Ver
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEditModal(team)}
                                                className="p-1.5 text-gray-400 hover:text-[#002D62] dark:hover:text-[#CE1126] hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(team.id)}
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
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Mostrando {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total} equipos
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                                    currentPage === page
                                                        ? 'bg-[#CE1126] dark:bg-[#002D62] text-white'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal para crear/editar equipo */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                            </h2>
                        </div>
                        
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre del Equipo *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Los Angeles Lakers"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                    {touched.name && errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        País *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={values.country}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: USA"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                    {touched.country && errors.country && (
                                        <p className="text-red-600 text-sm mt-1">{errors.country}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Entrenador
                                    </label>
                                    <input
                                        type="text"
                                        name="coach"
                                        value={values.coach}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Phil Jackson"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                    {touched.coach && errors.coach && (
                                        <p className="text-red-600 text-sm mt-1">{errors.coach}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Año de Fundación
                                    </label>
                                    <input
                                        type="number"
                                        name="founded_year"
                                        value={values.founded_year}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: 1947"
                                        min="1800"
                                        max={new Date().getFullYear()}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                    {touched.founded_year && errors.founded_year && (
                                        <p className="text-red-600 text-sm mt-1">{errors.founded_year}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="is_national_team"
                                    name="is_national_team"
                                    checked={values.is_national_team}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="is_national_team" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Es Selección Nacional
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-[#CE1126] hover:bg-[#B00E20] dark:bg-[#002D62] dark:hover:bg-[#001F4A] text-white font-medium rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Procesando...' : (selectedTeam ? 'Actualizar' : 'Crear')} Equipo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast para notificaciones */}
            {toast.isVisible && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className={`px-6 py-4 rounded-xl shadow-lg ${
                        toast.type === 'success' ? 'bg-green-600 text-white' :
                        toast.type === 'error' ? 'bg-red-600 text-white' :
                        'bg-blue-600 text-white'
                    }`}>
                        <p>{toast.message}</p>
                        <button
                            onClick={() => setToast({ ...toast, isVisible: false })}
                            className="ml-4 text-white/80 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;

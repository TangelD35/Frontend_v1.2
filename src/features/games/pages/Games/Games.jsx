import { Plus, Calendar, Clock, MapPin, Edit, Trash2, Eye, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { gameSchema } from '../../../../lib/validations/schemas';
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
    StatusIndicator,
    Toast
} from '../../../../shared/ui/components/common';

const Games = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Hooks personalizados
    const { viewMode, isTableView, toggleViewMode } = useViewMode('table', 'games-view');

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
        homeTeam: '',
        awayTeam: '',
        date: '',
        time: '',
        venue: '',
        tournament: ''
    }, gameSchema);

    const games = [
        {
            id: 1,
            homeTeam: 'República Dominicana',
            homeLogo: '🇩🇴',
            homeScore: 89,
            awayTeam: 'Argentina',
            awayLogo: '🇦🇷',
            awayScore: 84,
            date: '2024-10-15',
            time: '20:00',
            venue: 'Palacio de los Deportes',
            tournament: 'FIBA AmeriCup',
            status: 'completed'
        },
        {
            id: 2,
            homeTeam: 'Estados Unidos',
            homeLogo: '🇺🇸',
            homeScore: null,
            awayTeam: 'República Dominicana',
            awayLogo: '🇩🇴',
            awayScore: null,
            date: '2024-11-20',
            time: '19:30',
            venue: 'Madison Square Garden',
            tournament: 'Amistoso Internacional',
            status: 'scheduled'
        },
        {
            id: 3,
            homeTeam: 'República Dominicana',
            homeLogo: '🇩🇴',
            homeScore: 76,
            awayTeam: 'Canadá',
            awayLogo: '🇨🇦',
            awayScore: 80,
            date: '2024-10-08',
            time: '21:00',
            venue: 'Centro Olímpico',
            tournament: 'Clasificatorio Mundial',
            status: 'completed'
        },
    ];

    // Configuración de filtros
    const filterConfig = {
        status: {
            defaultValue: 'all',
            filterFn: (game, value) => value === 'all' || game.status === value
        },
        tournament: {
            defaultValue: 'all',
            filterFn: (game, value) => value === 'all' || game.tournament === value
        },
        searchFields: ['homeTeam', 'awayTeam', 'tournament', 'venue']
    };

    const {
        searchTerm,
        setSearchTerm,
        filters,
        updateFilters,
        filteredData: filteredGames,
        hasActiveFilters,
        totalCount,
        filteredCount
    } = useFilters(games, filterConfig);

    // Filtros disponibles
    const availableFilters = [
        {
            key: 'status',
            label: 'Estado',
            options: [
                { value: 'all', label: 'Todos los estados' },
                { value: 'scheduled', label: 'Programados' },
                { value: 'completed', label: 'Finalizados' },
                { value: 'live', label: 'En Vivo' }
            ],
            defaultValue: 'all'
        },
        {
            key: 'tournament',
            label: 'Torneo',
            options: [
                { value: 'all', label: 'Todos los torneos' },
                { value: 'FIBA AmeriCup', label: 'FIBA AmeriCup' },
                { value: 'Amistoso Internacional', label: 'Amistoso Internacional' },
                { value: 'Clasificatorio Mundial', label: 'Clasificatorio Mundial' }
            ],
            defaultValue: 'all'
        }
    ];

    const completedGames = games.filter(g => g.status === 'completed');
    const victories = completedGames.filter(g =>
        (g.homeTeam === 'República Dominicana' && g.homeScore > g.awayScore) ||
        (g.awayTeam === 'República Dominicana' && g.awayScore > g.homeScore)
    ).length;
    const upcomingGames = games.filter(g => g.status === 'scheduled').length;

    const stats = [
        {
            title: 'Total Partidos',
            value: totalCount.toString(),
            icon: Calendar,
            change: '+12',
            trend: 'up',
            description: hasActiveFilters ? `${filteredCount} filtrados` : 'Partidos registrados'
        },
        {
            title: 'Victorias',
            value: victories.toString(),
            icon: Calendar,
            change: '+1',
            trend: 'up',
            description: 'Partidos ganados'
        },
        {
            title: 'Próximos',
            value: upcomingGames.toString(),
            icon: Clock,
            change: null,
            trend: 'neutral',
            description: 'Partidos programados'
        },
    ];

    const columns = [
        {
            key: 'teams',
            label: 'Encuentro',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div className="text-2xl mb-1">{row.homeLogo}</div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{row.homeTeam}</p>
                    </div>
                    <div className="text-center px-4">
                        {row.status === 'completed' ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-gray-800 dark:text-white">{row.homeScore}</span>
                                <span className="text-gray-400">-</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-white">{row.awayScore}</span>
                            </div>
                        ) : (
                            <span className="text-lg text-gray-400 font-bold">VS</span>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-1">{row.awayLogo}</div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{row.awayTeam}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'tournament',
            label: 'Torneo',
            render: (value) => (
                <div>
                    <p className="font-medium text-gray-800 dark:text-white">{value}</p>
                </div>
            )
        },
        {
            key: 'datetime',
            label: 'Fecha y Hora',
            sortable: false,
            render: (_, row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        {new Date(row.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {row.time}
                    </div>
                </div>
            )
        },
        {
            key: 'venue',
            label: 'Sede',
            render: (value) => (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {value}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Estado',
            render: (value) => {
                const config = {
                    completed: { status: 'inactive', label: 'Finalizado', variant: 'default' },
                    scheduled: { status: 'pending', label: 'Programado', variant: 'warning' },
                    live: { status: 'active', label: 'En Vivo', variant: 'success' },
                };
                const { status, label } = config[value];
                return <StatusIndicator status={status} label={label} />;
            }
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
                            navigate(`/games/${row.id}`);
                        }}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];



    const handleEdit = (game) => {
        setSelectedGame(game);
        // Usar setFieldValue para establecer los valores del formulario
        setFieldValue('homeTeam', game.homeTeam);
        setFieldValue('awayTeam', game.awayTeam);
        setFieldValue('date', game.date);
        setFieldValue('time', game.time);
        setFieldValue('venue', game.venue);
        setFieldValue('tournament', game.tournament);
        setIsModalOpen(true);
    };

    const handleDelete = (game) => {
        if (confirm(`¿Eliminar el partido?`)) {
            setToast({ isVisible: true, type: 'success', message: 'Partido eliminado' });
        }
    };

    const onSubmit = async (formData) => {
        try {
            // Aquí iría tu lógica para guardar en la API
            console.log('Datos del formulario:', formData);

            setToast({
                isVisible: true,
                type: 'success',
                message: selectedGame ? 'Partido actualizado' : 'Partido programado'
            });
            setIsModalOpen(false);
            reset();
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al guardar el partido'
            });
        }
    };

    const openCreateModal = () => {
        setSelectedGame(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/20 dark:from-gray-900 dark:via-green-900/10 dark:to-blue-900/10 text-gray-900 dark:text-white transition-all duration-500 p-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20 dark:border-gray-700/50">
                <SectionHeader
                    title="Partidos y Encuentros"
                    description="Calendario y resultados de la Selección Nacional"
                    icon={Calendar}
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
                                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            >
                                Programar Partido
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
                    placeholder="Buscar partidos..."
                    className="mb-0"
                />
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                {isTableView ? (
                    <div className="p-6">
                        <Table
                            columns={columns}
                            data={filteredGames}
                            onRowClick={(row) => navigate(`/games/${row.id}`)}
                            sortable
                            hoverable
                        />
                    </div>
                ) : (
                    <div className="p-6">
                        <CardView
                            data={filteredGames}
                            onView={(game) => navigate(`/games/${game.id}`)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            renderCard={(game) => (
                                <div className="group bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 dark:from-gray-700 dark:via-green-900/20 dark:to-blue-900/10 rounded-2xl p-6 border border-green-200/30 dark:border-gray-600/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <Badge variant="primary" className="text-sm shadow-sm bg-gradient-to-r from-green-600 to-blue-600 text-white">
                                            {game.tournament}
                                        </Badge>
                                        <StatusIndicator
                                            status={game.status === 'completed' ? 'inactive' : game.status === 'live' ? 'active' : 'pending'}
                                            label={game.status === 'completed' ? 'Finalizado' : game.status === 'live' ? 'En Vivo' : 'Programado'}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="text-center flex-1 bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4">
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.homeLogo}</div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-white">{game.homeTeam}</p>
                                        </div>

                                        <div className="text-center px-6">
                                            {game.status === 'completed' ? (
                                                <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-4 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{game.homeScore}</span>
                                                        <span className="text-gray-400 text-xl">-</span>
                                                        <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{game.awayScore}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 shadow-sm">
                                                    <span className="text-2xl text-gray-500 font-bold">VS</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center flex-1 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
                                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.awayLogo}</div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-white">{game.awayTeam}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-green-200/50 dark:border-gray-600/50">
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20 rounded-lg p-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">{new Date(game.date).toLocaleDateString('es-ES')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-2">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">{game.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="font-medium">{game.venue}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            columns={2}
                        />
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={selectedGame ? 'Editar Partido' : 'Programar Partido'}
                size="large"
            >
                <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Equipo Local"
                            name="homeTeam"
                            value={values.homeTeam}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.homeTeam && errors.homeTeam}
                            required
                        />
                        <Input
                            label="Equipo Visitante"
                            name="awayTeam"
                            value={values.awayTeam}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.awayTeam && errors.awayTeam}
                            required
                        />
                    </div>

                    {/* Mostrar error de validación personalizado para equipos diferentes */}
                    {errors.awayTeam && typeof errors.awayTeam === 'string' && errors.awayTeam.includes('diferente') && (
                        <div className="text-red-500 dark:text-red-400 text-sm -mt-2 mb-2">{errors.awayTeam}</div>
                    )}

                    <Input
                        label="Torneo"
                        name="tournament"
                        value={values.tournament}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.tournament && errors.tournament}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Fecha"
                            name="date"
                            type="date"
                            value={values.date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.date && errors.date}
                            required
                        />
                        <Input
                            label="Hora"
                            name="time"
                            type="time"
                            value={values.time}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.time && errors.time}
                            required
                        />
                    </div>

                    <Input
                        label="Sede"
                        name="venue"
                        value={values.venue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.venue && errors.venue}
                        icon={MapPin}
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
                            {isSubmitting ? 'Guardando...' : (selectedGame ? 'Actualizar' : 'Programar')}
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

export default Games;
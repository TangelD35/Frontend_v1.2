import { Plus, Calendar, Clock, MapPin, Edit, Trash2, Eye, Search, RefreshCw, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import useFilters from '../../../../shared/hooks/useFilters';
import { gameSchema } from '../../../../lib/validations/schemas';
import { useGames } from '../../hooks/useGames';
import { useTeams } from '../../../teams/hooks/useTeams';
import { useTournaments } from '../../../tournaments/hooks/useTournaments';
import { GlassCard, AnimatedButton, LoadingState, ErrorState } from '../../../../shared/ui/components/modern';

import {
    Table,
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
    const { viewMode } = useViewMode('table', 'games-view');

    // Hooks para obtener datos reales desde la API
    const { games, loading, error, refetch } = useGames();
    const { teams } = useTeams({ limit: 200 });
    const { tournaments } = useTournaments();

    // Estados adicionales para UI moderna
    const [showFilters, setShowFilters] = useState(false);
    const [searchValue, setSearchValue] = useState('');

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

    // Mapas de ayuda para mostrar nombres en lugar de IDs
    const teamNameById = {};
    (teams || []).forEach(team => {
        if (team?.id) {
            teamNameById[team.id] = team.name;
        }
    });

    const tournamentNameById = {};
    (tournaments || []).forEach(tournament => {
        if (tournament?.id) {
            tournamentNameById[tournament.id] = tournament.name;
        }
    });

    // Adaptar datos de la API a un formato amigable para la UI
    const mappedGames = (games || []).map((game) => {
        const dateObj = game.game_date ? new Date(game.game_date) : null;

        const homeName = teamNameById[game.home_team_id] || 'Equipo local';
        const awayName = teamNameById[game.away_team_id] || 'Equipo visitante';
        const tournamentName = tournamentNameById[game.tournament_id] || 'Torneo';

        return {
            id: game.id,
            homeTeam: homeName,
            awayTeam: awayName,
            homeLogo: '🏀',
            awayLogo: '🏀',
            homeScore: game.home_score,
            awayScore: game.away_score,
            date: dateObj ? dateObj.toISOString() : null,
            time: dateObj
                ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                : '--:--',
            venue: game.location || 'Sin sede',
            tournament: tournamentName,
            status: game.status || 'scheduled',
        };
    });

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
    } = useFilters(mappedGames, filterConfig);

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

    const completedGames = mappedGames.filter(g => g.status === 'completed');
    const victories = completedGames.filter(g =>
        (g.homeTeam === 'República Dominicana' && g.homeScore > g.awayScore) ||
        (g.awayTeam === 'República Dominicana' && g.awayScore > g.homeScore)
    ).length;
    const upcomingGames = mappedGames.filter(g => g.status === 'scheduled').length;

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
                const normalized = (value || '').toLowerCase();
                const config = {
                    completed: { status: 'inactive', label: 'Finalizado' },
                    scheduled: { status: 'pending', label: 'Programado' },
                    live: { status: 'active', label: 'En Vivo' },
                };

                const fallback = { status: 'pending', label: normalized || 'Desconocido' };
                const mapped = config[normalized] || fallback;

                return <StatusIndicator status={mapped.status} label={mapped.label} />;
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

                const openCreateModal = () => {
                    setSelectedGame(null);
                    reset();
                    setIsModalOpen(true);
                };

< div className = "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 dark:border-gray-700/30" >
            <StatsGrid stats={stats} className="mb-0" />
</div >

<div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30 dark:border-gray-700/30">
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
                <SearchAndFilter
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={availableFilters}
                    activeFilters={filters}
                    onFilterChange={updateFilters}
                    placeholder="Buscar partidos..."
                    className="mb-0"
                />
            </div >

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                <div className="p-6">
                    {loading ? (
                        <LoadingState
                            title="Cargando partidos"
                            description="Estamos obteniendo la información más reciente de los partidos."
                        />
                    ) : error ? (
                        <ErrorState
                            title="Error al cargar los partidos"
                            description={error}
                        />
                    ) : filteredGames.length === 0 ? (
                        <ErrorState
                            title="Sin partidos registrados"
                            description="Aún no hay partidos en el sistema. Crea uno nuevo para comenzar."
                        />
                    ) : (
                        <Table
                            columns={columns}
                            data={filteredGames}
                            onRowClick={(row) => navigate(`/games/${row.id}`)}
                            sortable
                            hoverable
                        />
                    )}
                </div>
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
        </div >
    );
};

export default Games;
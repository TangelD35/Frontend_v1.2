import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ActionButton,
    Badge,
    Table,
    Modal,
    Toast,
    LoadingSpinner
} from '../../../../shared/ui/components/common';
import { tournamentsService } from '../../../../shared/api/endpoints/tournaments';
import { gamesService } from '../../../../shared/api/endpoints/games';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Cargar datos del torneo
    useEffect(() => {
        const loadTournamentData = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                // Cargar datos del torneo
                const tournamentData = await tournamentsService.getById(id);
                setTournament(tournamentData);

                // Cargar partidos del torneo usando el endpoint correcto
                try {
                    const gamesResponse = await gamesService.getAll({ tournament_id: id });
                    setGames(gamesResponse?.items || []);
                } catch (err) {
                    console.error('Error loading games:', err);
                    setGames([]);
                }
            } catch (err) {
                console.error('Error loading tournament:', err);
                setError(err.response?.data?.detail || 'Error al cargar el torneo');
            } finally {
                setLoading(false);
            }
        };

        loadTournamentData();
    }, [id]);

    // Columnas para tabla de partidos
    const gamesColumns = [
        {
            key: 'game_date',
            label: 'Fecha',
            className: 'text-center',
            render: (value) => (
                <span className="font-bold text-gray-900 dark:text-white">
                    {value ? new Date(value).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }) : 'N/A'}
                </span>
            )
        },
        {
            key: 'round',
            label: 'Ronda',
            className: 'text-center',
            render: (value) => (
                <span className="font-bold text-gray-900 dark:text-white">
                    {value || 'N/A'}
                </span>
            )
        },
        {
            key: 'location',
            label: 'Ubicación',
            className: 'text-center',
            render: (value) => (
                <span className="font-bold text-gray-900 dark:text-white">
                    {value || 'N/A'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Estado',
            className: 'text-center',
            render: (value) => {
                const statusConfig = {
                    'scheduled': { bg: '#002D62', text: 'Programado' },
                    'in_progress': { bg: '#FFA500', text: 'En Progreso' },
                    'completed': { bg: '#10B981', text: 'Finalizado' },
                    'cancelled': { bg: '#CE1126', text: 'Cancelado' }
                };
                const config = statusConfig[value] || { bg: '#6B7280', text: value };
                return (
                    <span
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white border-2 border-white/20 shadow-sm inline-block"
                        style={{ backgroundColor: config.bg }}
                    >
                        {config.text}
                    </span>
                );
            }
        },
        {
            key: 'home_score',
            label: 'Resultado',
            className: 'text-center',
            render: (value, row) => {
                if (row.status === 'completed' && value !== null && row.away_score !== null) {
                    const homeWon = value > row.away_score;
                    const awayWon = row.away_score > value;
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <span className={`font-black text-lg px-2 py-1 rounded border-2 ${homeWon ? 'text-green-600 dark:text-green-400 border-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                                }`}>
                                {value}
                            </span>
                            <span className="font-bold text-gray-500 dark:text-gray-400">-</span>
                            <span className={`font-black text-lg px-2 py-1 rounded border-2 ${awayWon ? 'text-green-600 dark:text-green-400 border-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                                }`}>
                                {row.away_score}
                            </span>
                        </div>
                    );
                }
                return <span className="font-bold text-gray-400">-</span>;
            }
        },
    ];

    // Calcular estadísticas
    const calculateDuration = () => {
        if (!tournament?.start_date || !tournament?.end_date) return 0;
        const start = new Date(tournament.start_date);
        const end = new Date(tournament.end_date);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calcular estadísticas de partidos
    const completedGames = games.filter(g => g.status === 'completed').length;
    const scheduledGames = games.filter(g => g.status === 'scheduled').length;
    const inProgressGames = games.filter(g => g.status === 'in_progress').length;

    // Calcular equipo campeón (equipo con más victorias)
    const calculateChampion = () => {
        if (completedGames === 0) return null;

        const teamWins = {};
        games.filter(g => g.status === 'completed').forEach(game => {
            if (game.home_score > game.away_score) {
                teamWins[game.home_team_id] = (teamWins[game.home_team_id] || 0) + 1;
            } else if (game.away_score > game.home_score) {
                teamWins[game.away_team_id] = (teamWins[game.away_team_id] || 0) + 1;
            }
        });

        if (Object.keys(teamWins).length === 0) return null;

        const championId = Object.keys(teamWins).reduce((a, b) =>
            teamWins[a] > teamWins[b] ? a : b
        );

        return {
            teamId: championId,
            wins: teamWins[championId]
        };
    };

    const champion = calculateChampion();

    const allStats = tournament ? [
        {
            title: 'Total de Partidos',
            value: games.length,
            color: 'red'
        },
        {
            title: 'Partidos Completados',
            value: completedGames,
            color: 'green'
        },
        {
            title: 'Partidos Programados',
            value: scheduledGames,
            color: 'blue'
        },
        {
            title: 'Días de Duración',
            value: calculateDuration(),
            color: 'purple'
        },
    ] : [];

    // Filtrar estadísticas con valor mayor a 0
    const stats = allStats.filter(stat => stat.value > 0);

    const handleDelete = async () => {
        try {
            await tournamentsService.delete(id);
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Torneo eliminado correctamente'
            });
            setTimeout(() => navigate('/tournaments'), 1500);
        } catch (error) {
            console.error('Error deleting tournament:', error);
            setToast({
                isVisible: true,
                type: 'error',
                message: error.response?.data?.detail || 'Error al eliminar el torneo'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <LoadingSpinner size="large" text="Cargando detalles del torneo..." />
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {error || 'Torneo no encontrado'}
                    </h2>
                    <button
                        onClick={() => navigate('/tournaments')}
                        className="mt-4 px-6 py-2 bg-[#CE1126] text-white rounded-lg hover:bg-[#8B0D1A] transition-colors"
                    >
                        Volver a Torneos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Hero Section compacto */}
            <div className="relative bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-6">
                    <button
                        onClick={() => navigate('/tournaments')}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight mb-1">
                                {tournament.name}
                            </h1>
                            {tournament.description && (
                                <p className="text-white/80 text-sm">{tournament.description}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/tournaments/${id}/edit`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all text-sm font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-lg transition-all text-sm font-medium border border-red-400/30"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* KPIs Compactos */}
                {stats.length > 0 && (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-5xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {stats.map((stat, index) => {
                            const colorClasses = {
                                red: 'from-[#CE1126] to-[#8B0D1A]',
                                green: 'from-green-500 to-green-600',
                                blue: 'from-[#002D62] to-blue-600',
                                purple: 'from-sky-400 to-sky-600'
                            };
                            return (
                                <motion.div
                                    key={index}
                                    className={`relative bg-gradient-to-br ${colorClasses[stat.color]} rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/30`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative text-center">
                                        <p className="text-xs font-bold uppercase tracking-wider text-white/90 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-4xl font-black text-white drop-shadow-md">
                                            {stat.value}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Equipo Campeón */}
                {champion && (
                    <motion.div
                        className="max-w-3xl mx-auto bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-2xl border-4 border-yellow-300 p-8 mb-6 relative overflow-hidden"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Efecto de brillo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                        <div className="relative text-center">
                            <div className="inline-block mb-4 animate-bounce">
                                <div className="text-7xl filter drop-shadow-2xl">🏆</div>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 drop-shadow-2xl uppercase tracking-wider">
                                Equipo Campeón
                            </h2>
                            <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 border-3 border-white/50 inline-block shadow-xl">
                                <p className="text-xs font-bold text-white uppercase tracking-widest mb-2">ID del Equipo</p>
                                <p className="text-4xl font-black text-white drop-shadow-lg mb-3">
                                    {champion.teamId.substring(0, 8)}...
                                </p>
                                <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                                    <p className="text-lg font-black text-white">
                                        {champion.wins} {champion.wins === 1 ? 'Victoria' : 'Victorias'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Información del torneo */}
                <motion.div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-5 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Información del Torneo</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {tournament.type && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Tipo</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.type}</p>
                            </div>
                        )}
                        {tournament.start_date && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                    Fecha de Inicio
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(tournament.start_date).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                        {tournament.end_date && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                    Fecha de Fin
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(tournament.end_date).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                        {tournament.location && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                    Ubicación
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.location}</p>
                            </div>
                        )}
                        {tournament.year && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Año</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.year}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Estadísticas del Torneo */}
                {games.length > 0 && (completedGames > 0 || scheduledGames > 0 || inProgressGames > 0) && (
                    <motion.div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-5 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Progreso del Torneo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {completedGames > 0 && (
                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border-2 border-green-300 dark:border-green-600 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mb-1">Completados</p>
                                    <p className="text-3xl font-black text-green-900 dark:text-green-300">{completedGames}</p>
                                    <p className="text-xs font-bold text-green-600 dark:text-green-500 mt-1">
                                        {Math.round((completedGames / games.length) * 100)}% del total
                                    </p>
                                </div>
                            )}
                            {scheduledGames > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-600 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">Programados</p>
                                    <p className="text-3xl font-black text-blue-900 dark:text-blue-300">{scheduledGames}</p>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-500 mt-1">
                                        {Math.round((scheduledGames / games.length) * 100)}% del total
                                    </p>
                                </div>
                            )}
                            {inProgressGames > 0 && (
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-600 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 mb-1">En Progreso</p>
                                    <p className="text-3xl font-black text-yellow-900 dark:text-yellow-300">{inProgressGames}</p>
                                    <p className="text-xs font-bold text-yellow-600 dark:text-yellow-500 mt-1">
                                        {Math.round((inProgressGames / games.length) * 100)}% del total
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Calendario de Partidos */}
                {games.length > 0 && (
                    <motion.div
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-gray-300 dark:border-gray-600 p-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Calendario de Partidos</h2>
                        <Table
                            columns={gamesColumns}
                            data={games}
                            onRowClick={(row) => navigate(`/games/${row.id}`)}
                            sortable
                            hoverable
                        />
                    </motion.div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Eliminación"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        ¿Estás seguro de que deseas eliminar el torneo <strong>{tournament.name}</strong>?
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <ActionButton
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancelar
                        </ActionButton>
                        <ActionButton
                            variant="danger"
                            onClick={handleDelete}
                        >
                            Eliminar
                        </ActionButton>
                    </div>
                </div>
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

export default TournamentDetail;

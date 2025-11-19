import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    ActionButton,
    Badge,
    DataCard,
    Table,
    Chart,
    Modal,
    Toast,
    LoadingSpinner
} from '../../../../shared/ui/components/common';

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Datos de ejemplo (reemplazar con llamada a API)
    const tournament = {
        id: 1,
        name: 'FIBA AmeriCup 2025',
        type: 'Internacional',
        startDate: '2025-01-15',
        endDate: '2025-01-28',
        location: 'República Dominicana',
        venue: 'Palacio de los Deportes',
        teams: 12,
        games: 45,
        status: 'active',
        description: 'Torneo internacional de baloncesto de la FIBA para equipos de las Américas.',
        organizer: 'FIBA Americas',
        sponsor: 'Nike Basketball',
        prizePool: '$500,000',
    };

    const stats = [
        { title: 'Equipos Participantes', value: tournament.teams.toString(), icon: Users, change: null, trend: 'neutral' },
        { title: 'Total de Partidos', value: tournament.games.toString(), icon: Trophy, change: '+5', trend: 'up' },
        { title: 'Días de Duración', value: '14', icon: Calendar, change: null, trend: 'neutral' },
        { title: 'Asistencia Promedio', value: '8,500', icon: Users, change: '+12%', trend: 'up' },
    ];

    // Equipos participantes
    const teams = [
        { id: 1, name: 'República Dominicana', logo: '🇩🇴', ranking: 18, wins: 0, losses: 0 },
        { id: 2, name: 'Estados Unidos', logo: '🇺🇸', ranking: 1, wins: 0, losses: 0 },
        { id: 3, name: 'Argentina', logo: '🇦🇷', ranking: 5, wins: 0, losses: 0 },
        { id: 4, name: 'Brasil', logo: '🇧🇷', ranking: 12, wins: 0, losses: 0 },
    ];

    const teamsColumns = [
        {
            key: 'logo',
            label: 'Logo',
            sortable: false,
            render: (value) => <span className="text-3xl">{value}</span>
        },
        { key: 'name', label: 'Equipo' },
        {
            key: 'ranking',
            label: 'Ranking Mundial',
            render: (value) => <Badge variant="primary">#{value}</Badge>
        },
        { key: 'wins', label: 'Victorias' },
        { key: 'losses', label: 'Derrotas' },
    ];

    // Partidos del torneo
    const games = [
        {
            id: 1,
            homeTeam: 'República Dominicana',
            homeLogo: '🇩🇴',
            homeScore: null,
            awayTeam: 'Brasil',
            awayLogo: '🇧🇷',
            awayScore: null,
            date: '2025-01-16',
            time: '20:00',
            status: 'scheduled'
        },
        {
            id: 2,
            homeTeam: 'Estados Unidos',
            homeLogo: '🇺🇸',
            homeScore: null,
            awayTeam: 'Argentina',
            awayLogo: '🇦🇷',
            awayScore: null,
            date: '2025-01-16',
            time: '22:00',
            status: 'scheduled'
        },
    ];

    const gamesColumns = [
        {
            key: 'matchup',
            label: 'Partido',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{row.homeLogo}</span>
                    <span className="font-semibold">{row.homeTeam}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-2xl">{row.awayLogo}</span>
                    <span className="font-semibold">{row.awayTeam}</span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Fecha',
            render: (value) => new Date(value).toLocaleDateString('es-ES')
        },
        { key: 'time', label: 'Hora' },
        {
            key: 'status',
            label: 'Estado',
            render: (value) => {
                const config = {
                    scheduled: { variant: 'warning', label: 'Programado' },
                    live: { variant: 'success', label: 'En Vivo' },
                    completed: { variant: 'default', label: 'Finalizado' }
                };
                return <Badge variant={config[value].variant}>{config[value].label}</Badge>;
            }
        },
    ];

    // Datos para gráficos
    const attendanceData = [
        { name: 'Día 1', value: 7500 },
        { name: 'Día 2', value: 8200 },
        { name: 'Día 3', value: 8800 },
        { name: 'Día 4', value: 9100 },
    ];

    const handleDelete = async () => {
        try {
            // Aquí iría la llamada a la API para eliminar
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Torneo eliminado correctamente'
            });
            setTimeout(() => navigate('/tournaments'), 1500);
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al eliminar el torneo'
            });
        }
    };

    if (loading) {
        return <LoadingSpinner size="large" text="Cargando detalles del torneo..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Hero Section con gradiente dominicano */}
            <div className="relative bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] overflow-hidden">
                {/* Patrón de fondo animado */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
                    }}></div>
                </div>

                {/* Círculos decorativos */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#002D62]/20 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-8 py-12">
                    <button
                        onClick={() => navigate('/tournaments')}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver a Torneos
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Contenedor de icono */}
                            <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/40 overflow-hidden flex items-center justify-center">
                                <Trophy className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-black text-white drop-shadow-2xl tracking-tight">{tournament.name}</h1>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${tournament.status === 'active'
                                            ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                                            : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                                        }`}>
                                        {tournament.status === 'active' ? 'Activo' : 'Próximo'}
                                    </span>
                                </div>
                                <p className="text-white/90 text-sm font-semibold">{tournament.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/tournaments/${id}/edit`)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all hover:scale-105 font-semibold"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white rounded-lg transition-all hover:scale-105 font-semibold border border-red-400/30"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* KPIs Premium con glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const isRed = index % 2 === 0;
                        return (
                            <div
                                key={index}
                                className="relative bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl border-2 border-white/40 hover:border-white/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl group"
                            >
                                {/* Efecto hover brillante */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br group-hover:scale-110 transition-transform duration-300 ${isRed ? 'from-red-500/30 to-red-600/20' : 'from-blue-500/30 to-blue-600/20'
                                            }`}>
                                            <stat.icon className={`w-9 h-9 ${isRed ? 'text-[#CE1126] dark:text-red-400' : 'text-[#002D62] dark:text-blue-400'
                                                }`} />
                                        </div>
                                    </div>
                                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-gray-700 dark:text-gray-300 mb-2">
                                        {stat.title}
                                    </p>
                                    <p className="text-6xl font-black text-gray-900 dark:text-white drop-shadow-2xl tracking-tight">
                                        {stat.value}
                                    </p>
                                    {stat.change && (
                                        <p className={`text-sm font-semibold mt-2 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {stat.change}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Información del torneo */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                                <Trophy className="w-6 h-6 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Información del Torneo</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Tipo</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.type}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Organizador</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.organizer}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Fecha de Inicio
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(tournament.startDate).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Fecha de Fin
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {new Date(tournament.endDate).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    Ubicación
                                </p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.location}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Sede Principal</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.venue}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Patrocinador</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.sponsor}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Bolsa de Premios</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{tournament.prizePool}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de asistencia */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                                <Users className="w-5 h-5 text-[#CE1126] dark:text-[#002D62]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asistencia por Día</h3>
                        </div>
                        <Chart
                            type="bar"
                            data={attendanceData}
                            xKey="name"
                            yKey="value"
                            height={280}
                        />
                    </div>
                </div>

                {/* Equipos Participantes */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                            <Users className="w-6 h-6 text-[#CE1126] dark:text-[#002D62]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Equipos Participantes</h2>
                    </div>
                    <Table
                        columns={teamsColumns}
                        data={teams}
                        onRowClick={(row) => navigate(`/teams/${row.id}`)}
                        sortable
                        hoverable
                    />
                </div>

                {/* Calendario de Partidos */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                            <Calendar className="w-6 h-6 text-[#CE1126] dark:text-[#002D62]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendario de Partidos</h2>
                    </div>
                    <Table
                        columns={gamesColumns}
                        data={games}
                        onRowClick={(row) => navigate(`/games/${row.id}`)}
                        sortable
                        hoverable
                    />
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Eliminación"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
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
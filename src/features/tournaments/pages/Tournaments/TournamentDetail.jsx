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
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/tournaments')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a Torneos
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">{tournament.name}</h1>
                            <Badge variant={tournament.status === 'active' ? 'success' : 'warning'}>
                                {tournament.status === 'active' ? 'Activo' : 'Próximo'}
                            </Badge>
                        </div>
                        <p className="text-gray-600">{tournament.description}</p>
                    </div>

                    <div className="flex gap-2">
                        <ActionButton
                            variant="secondary"
                            icon={Edit}
                            onClick={() => navigate(`/tournaments/${id}/edit`)}
                        >
                            Editar
                        </ActionButton>
                        <ActionButton
                            variant="danger"
                            icon={Trash2}
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Eliminar
                        </ActionButton>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <DataCard key={index} {...stat} />
                ))}
            </div>

            {/* Información del torneo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Torneo</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tipo</p>
                            <p className="font-semibold text-gray-800">{tournament.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Organizador</p>
                            <p className="font-semibold text-gray-800">{tournament.organizer}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Fecha de Inicio
                            </p>
                            <p className="font-semibold text-gray-800">
                                {new Date(tournament.startDate).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Fecha de Fin
                            </p>
                            <p className="font-semibold text-gray-800">
                                {new Date(tournament.endDate).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                Ubicación
                            </p>
                            <p className="font-semibold text-gray-800">{tournament.location}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Sede Principal</p>
                            <p className="font-semibold text-gray-800">{tournament.venue}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Patrocinador</p>
                            <p className="font-semibold text-gray-800">{tournament.sponsor}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Bolsa de Premios</p>
                            <p className="font-semibold text-gray-800">{tournament.prizePool}</p>
                        </div>
                    </div>
                </div>

                {/* Gráfico de asistencia */}
                <div>
                    <Chart
                        type="bar"
                        data={attendanceData}
                        xKey="name"
                        yKey="value"
                        title="Asistencia por Día"
                        height={280}
                    />
                </div>
            </div>

            {/* Equipos Participantes */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Equipos Participantes</h2>
                <Table
                    columns={teamsColumns}
                    data={teams}
                    onRowClick={(row) => navigate(`/teams/${row.id}`)}
                    sortable
                    hoverable
                />
            </div>

            {/* Calendario de Partidos */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Calendario de Partidos</h2>
                <Table
                    columns={gamesColumns}
                    data={games}
                    onRowClick={(row) => navigate(`/games/${row.id}`)}
                    sortable
                    hoverable
                />
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
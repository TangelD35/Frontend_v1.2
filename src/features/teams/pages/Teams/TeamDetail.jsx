import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, TrendingUp, Award, Users, Edit, Trash2 } from 'lucide-react';
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

const TeamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

    // Datos de ejemplo
    const team = {
        id: 1,
        name: 'República Dominicana',
        logo: '🇩🇴',
        country: 'República Dominicana',
        category: 'Selección Nacional',
        coach: 'Néstor García',
        assistant: 'Carlos González',
        founded: '1946',
        worldRanking: 18,
        wins: 45,
        losses: 33,
        winRate: 57.7,
        avgPoints: 82.4,
        avgDefense: 85.1,
        championships: 2,
        description: 'Selección nacional de baloncesto de República Dominicana',
    };

    const stats = [
        { title: 'Ranking Mundial', value: `#${team.worldRanking}`, icon: Award, change: '+2', trend: 'up' },
        { title: 'Victorias', value: team.wins.toString(), icon: TrendingUp, change: '+5', trend: 'up' },
        { title: 'Porcentaje Victorias', value: `${team.winRate}%`, icon: Shield, change: '+3.2%', trend: 'up' },
        { title: 'Campeonatos', value: team.championships.toString(), icon: Award, change: null, trend: 'neutral' },
    ];

    // Jugadores del equipo
    const players = [
        { id: 1, name: 'Karl-Anthony Towns', number: 32, position: 'Pívot', ppg: 22.5, rpg: 11.2, apg: 3.8 },
        { id: 2, name: 'Al Horford', number: 42, position: 'Ala-Pívot', ppg: 12.3, rpg: 8.7, apg: 3.2 },
        { id: 3, name: 'Chris Duarte', number: 21, position: 'Escolta', ppg: 15.8, rpg: 4.2, apg: 2.5 },
        { id: 4, name: 'Andrés Feliz', number: 5, position: 'Base', ppg: 11.2, rpg: 2.8, apg: 6.5 },
    ];

    const playersColumns = [
        {
            key: 'number',
            label: '#',
            render: (value) => (
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {value}
                </div>
            )
        },
        { key: 'name', label: 'Jugador' },
        {
            key: 'position',
            label: 'Posición',
            render: (value) => <Badge variant="primary">{value}</Badge>
        },
        { key: 'ppg', label: 'PPG' },
        { key: 'rpg', label: 'RPG' },
        { key: 'apg', label: 'APG' },
    ];

    // Últimos partidos
    const recentGames = [
        { id: 1, opponent: 'Argentina', result: 'W', score: '89-84', date: '2024-10-15' },
        { id: 2, opponent: 'Canadá', result: 'L', score: '76-80', date: '2024-10-08' },
        { id: 3, opponent: 'Puerto Rico', result: 'W', score: '92-78', date: '2024-09-25' },
        { id: 4, opponent: 'Brasil', result: 'W', score: '85-79', date: '2024-09-20' },
    ];

    const gamesColumns = [
        {
            key: 'date',
            label: 'Fecha',
            render: (value) => new Date(value).toLocaleDateString('es-ES')
        },
        { key: 'opponent', label: 'Oponente' },
        { key: 'score', label: 'Marcador' },
        {
            key: 'result',
            label: 'Resultado',
            render: (value) => (
                <Badge variant={value === 'W' ? 'success' : 'danger'}>
                    {value === 'W' ? 'Victoria' : 'Derrota'}
                </Badge>
            )
        },
    ];

    // Datos para gráficos
    const performanceData = [
        { name: '2020', ppg: 78, rpg: 42, apg: 18 },
        { name: '2021', ppg: 80, rpg: 44, apg: 19 },
        { name: '2022', ppg: 81, rpg: 43, apg: 20 },
        { name: '2023', ppg: 82, rpg: 45, apg: 21 },
    ];

    const winRateData = [
        { name: 'Victorias', value: team.wins },
        { name: 'Derrotas', value: team.losses },
    ];

    const handleDelete = async () => {
        try {
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Equipo eliminado correctamente'
            });
            setTimeout(() => navigate('/teams'), 1500);
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al eliminar el equipo'
            });
        }
    };

    if (loading) {
        return <LoadingSpinner size="large" text="Cargando detalles del equipo..." />;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/teams')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a Equipos
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-6xl">{team.logo}</div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{team.name}</h1>
                            <p className="text-gray-600">{team.description}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <ActionButton
                            variant="secondary"
                            icon={Edit}
                            onClick={() => navigate(`/teams/${id}/edit`)}
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

            {/* Información del equipo y gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Equipo</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Categoría</p>
                            <p className="font-semibold text-gray-800">{team.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Entrenador Principal</p>
                            <p className="font-semibold text-gray-800">{team.coach}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Asistente Técnico</p>
                            <p className="font-semibold text-gray-800">{team.assistant}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Fundado</p>
                            <p className="font-semibold text-gray-800">{team.founded}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Pts Promedio</p>
                            <p className="font-semibold text-gray-800">{team.avgPoints}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Def Promedio</p>
                            <p className="font-semibold text-gray-800">{team.avgDefense}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Chart
                        type="bar"
                        data={performanceData}
                        xKey="name"
                        yKey="ppg"
                        title="Rendimiento por Año"
                        height={300}
                    />
                </div>
            </div>

            {/* Gráfico de victorias/derrotas */}
            <div className="mb-6">
                <Chart
                    type="pie"
                    data={winRateData}
                    xKey="name"
                    yKey="value"
                    title="Victorias vs Derrotas"
                    height={300}
                />
            </div>

            {/* Plantel de jugadores */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Plantel de Jugadores</h2>
                <Table
                    columns={playersColumns}
                    data={players}
                    onRowClick={(row) => navigate(`/players/${row.id}`)}
                    sortable
                    hoverable
                />
            </div>

            {/* Últimos partidos */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Últimos Partidos</h2>
                <Table
                    columns={gamesColumns}
                    data={recentGames}
                    onRowClick={(row) => navigate(`/games/${row.id}`)}
                    sortable
                    hoverable
                />
            </div>

            {/* Modal de confirmación */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Eliminación"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        ¿Estás seguro de que deseas eliminar el equipo <strong>{team.name}</strong>?
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

export default TeamDetail;
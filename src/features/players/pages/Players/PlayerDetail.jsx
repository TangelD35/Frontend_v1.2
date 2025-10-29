import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UserCircle, TrendingUp, Award, Activity,
    Edit, Trash2, Target, BarChart3, Calendar, Trophy
} from 'lucide-react';
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

const PlayerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [selectedTab, setSelectedTab] = useState('overview');

    // Datos de ejemplo - reemplazar con llamada a API
    const player = {
        id: 1,
        name: 'Karl-Anthony Towns',
        number: 32,
        position: 'Pívot',
        team: 'República Dominicana',
        age: 28,
        height: '2.13m',
        weight: '112kg',
        birthDate: '1995-11-15',
        birthPlace: 'Edison, New Jersey, USA',
        nationality: 'Dominicano-Estadounidense',
        currentTeam: 'New York Knicks (NBA)',
        yearsActive: '2015-Presente',
        rating: 95,
        image: '🏀',
        description: 'Pívot estrella de la selección dominicana, conocido por su versatilidad ofensiva y dominio en el poste.'
    };

    // Estadísticas de carrera
    const careerStats = {
        gamesPlayed: 45,
        gamesStarted: 42,
        minutesPerGame: 32.5,
        ppg: 22.5,
        rpg: 11.2,
        apg: 3.8,
        spg: 0.9,
        bpg: 1.8,
        tpg: 2.3,
        fgPercentage: 51.2,
        fg3Percentage: 38.5,
        ftPercentage: 82.3,
        efficiency: 28.7,
        doubleDoubles: 28,
        tripleDoubles: 2
    };

    const stats = [
        { title: 'Puntos por Partido', value: careerStats.ppg.toFixed(1), icon: Target, change: '+2.3', trend: 'up' },
        { title: 'Rebotes por Partido', value: careerStats.rpg.toFixed(1), icon: Activity, change: '+1.5', trend: 'up' },
        { title: 'Asistencias por Partido', value: careerStats.apg.toFixed(1), icon: TrendingUp, change: '+0.8', trend: 'up' },
        { title: 'Eficiencia', value: careerStats.efficiency.toFixed(1), icon: BarChart3, change: '+3.2', trend: 'up' }
    ];

    // Evolución temporal
    const performanceData = [
        { season: '2020', ppg: 18.2, rpg: 9.5, apg: 2.8 },
        { season: '2021', ppg: 19.8, rpg: 10.1, apg: 3.2 },
        { season: '2022', ppg: 21.3, rpg: 10.8, apg: 3.5 },
        { season: '2023', ppg: 22.5, rpg: 11.2, apg: 3.8 }
    ];

    // Porcentajes de tiro
    const shootingData = [
        { name: 'TC%', value: careerStats.fgPercentage },
        { name: '3P%', value: careerStats.fg3Percentage },
        { name: 'TL%', value: careerStats.ftPercentage }
    ];

    // Últimos partidos
    const recentGames = [
        {
            id: 1,
            opponent: 'Argentina',
            date: '2024-10-15',
            result: 'V 89-84',
            minutes: 35,
            points: 28,
            rebounds: 13,
            assists: 5,
            fg: '11/19',
            efficiency: 32
        },
        {
            id: 2,
            opponent: 'Canadá',
            date: '2024-10-08',
            result: 'D 76-80',
            minutes: 33,
            points: 22,
            rebounds: 11,
            assists: 4,
            fg: '9/17',
            efficiency: 28
        },
        {
            id: 3,
            opponent: 'Puerto Rico',
            date: '2024-09-25',
            result: 'V 92-78',
            minutes: 30,
            points: 25,
            rebounds: 10,
            assists: 3,
            fg: '10/16',
            efficiency: 30
        },
        {
            id: 4,
            opponent: 'Brasil',
            date: '2024-09-20',
            result: 'V 85-79',
            minutes: 34,
            points: 20,
            rebounds: 12,
            assists: 6,
            fg: '8/15',
            efficiency: 31
        }
    ];

    const gamesColumns = [
        {
            key: 'date',
            label: 'Fecha',
            render: (value) => new Date(value).toLocaleDateString('es-ES')
        },
        { key: 'opponent', label: 'Oponente' },
        {
            key: 'result',
            label: 'Resultado',
            render: (value) => (
                <Badge variant={value.startsWith('V') ? 'success' : 'danger'}>
                    {value}
                </Badge>
            )
        },
        {
            key: 'minutes',
            label: 'MIN',
            render: (value) => `${value}'`
        },
        {
            key: 'points',
            label: 'PTS',
            render: (value) => <span className="font-bold text-blue-600">{value}</span>
        },
        { key: 'rebounds', label: 'REB' },
        { key: 'assists', label: 'AST' },
        { key: 'fg', label: 'TC' },
        {
            key: 'efficiency',
            label: 'EFF',
            render: (value) => <span className="font-semibold">{value}</span>
        }
    ];

    // Comparación con equipo
    const teamComparison = [
        { metric: 'Puntos por Partido', player: 22.5, team: 16.9, diff: '+33%' },
        { metric: 'Rebotes por Partido', player: 11.2, team: 7.8, diff: '+44%' },
        { metric: 'Asistencias por Partido', player: 3.8, team: 3.2, diff: '+19%' },
        { metric: '% Tiros de Campo', player: 51.2, team: 46.8, diff: '+9%' }
    ];

    // Logros y reconocimientos
    const achievements = [
        { year: '2023', title: 'MVP del Torneo Preolímpico', icon: '🏆' },
        { year: '2022', title: 'Mejor Jugador del Partido vs Argentina', icon: '⭐' },
        { year: '2021', title: 'Quinteto Ideal FIBA Americas', icon: '🌟' },
        { year: '2020', title: 'Líder en Rebotes - Clasificatorios', icon: '📊' }
    ];

    const handleDelete = async () => {
        try {
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Jugador eliminado correctamente'
            });
            setTimeout(() => navigate('/players'), 1500);
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al eliminar el jugador'
            });
        }
    };

    if (loading) {
        return <LoadingSpinner size="large" text="Cargando detalles del jugador..." />;
    }

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: UserCircle },
        { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
        { id: 'games', label: 'Partidos', icon: Calendar },
        { id: 'achievements', label: 'Logros', icon: Trophy }
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/players')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a Jugadores
                </button>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-6xl border-4 border-white/30">
                                {player.image}
                            </div>

                            {/* Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold">{player.name}</h1>
                                    <Badge variant="success" className="bg-white/20 text-white border border-white/30">
                                        Rating {player.rating}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-lg mb-4">
                                    <span className="font-semibold">#{player.number}</span>
                                    <span>•</span>
                                    <span>{player.position}</span>
                                    <span>•</span>
                                    <span>{player.team}</span>
                                </div>
                                <p className="text-blue-100 max-w-2xl">{player.description}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <ActionButton
                                variant="secondary"
                                icon={Edit}
                                onClick={() => navigate(`/players/${id}/edit`)}
                                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                            >
                                Editar
                            </ActionButton>
                            <ActionButton
                                variant="danger"
                                icon={Trash2}
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-white border border-red-300/30"
                            >
                                Eliminar
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${selectedTab === tab.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content based on selected tab */}
            {selectedTab === 'overview' && (
                <>
                    {/* Estadísticas principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {stats.map((stat, index) => (
                            <DataCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Información personal y gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Información Personal */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Información Personal</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Edad</p>
                                    <p className="font-semibold text-gray-800">{player.age} años</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Altura / Peso</p>
                                    <p className="font-semibold text-gray-800">{player.height} / {player.weight}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Fecha de Nacimiento</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(player.birthDate).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Lugar de Nacimiento</p>
                                    <p className="font-semibold text-gray-800">{player.birthPlace}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Nacionalidad</p>
                                    <p className="font-semibold text-gray-800">{player.nationality}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Equipo Actual</p>
                                    <p className="font-semibold text-gray-800">{player.currentTeam}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Años Activo</p>
                                    <p className="font-semibold text-gray-800">{player.yearsActive}</p>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de Evolución */}
                        <div className="lg:col-span-2">
                            <Chart
                                type="line"
                                data={performanceData}
                                xKey="season"
                                yKey="ppg"
                                title="Evolución de Rendimiento"
                                height={350}
                            />
                        </div>
                    </div>

                    {/* Porcentajes de Tiro */}
                    <div className="mb-6">
                        <Chart
                            type="bar"
                            data={shootingData}
                            xKey="name"
                            yKey="value"
                            title="Porcentajes de Tiro"
                            height={300}
                        />
                    </div>
                </>
            )}

            {selectedTab === 'stats' && (
                <>
                    {/* Estadísticas Detalladas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Estadísticas Ofensivas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas Ofensivas</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Puntos por Partido</span>
                                    <span className="text-xl font-bold text-blue-600">{careerStats.ppg}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">% Tiros de Campo</span>
                                    <span className="text-xl font-bold text-blue-600">{careerStats.fgPercentage}%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">% Triples</span>
                                    <span className="text-xl font-bold text-blue-600">{careerStats.fg3Percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">% Tiros Libres</span>
                                    <span className="text-xl font-bold text-blue-600">{careerStats.ftPercentage}%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Asistencias por Partido</span>
                                    <span className="text-xl font-bold text-blue-600">{careerStats.apg}</span>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas Defensivas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas Defensivas y Otras</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Rebotes por Partido</span>
                                    <span className="text-xl font-bold text-green-600">{careerStats.rpg}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Robos por Partido</span>
                                    <span className="text-xl font-bold text-green-600">{careerStats.spg}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Tapones por Partido</span>
                                    <span className="text-xl font-bold text-green-600">{careerStats.bpg}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Pérdidas por Partido</span>
                                    <span className="text-xl font-bold text-orange-600">{careerStats.tpg}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700">Eficiencia</span>
                                    <span className="text-xl font-bold text-purple-600">{careerStats.efficiency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparación con el Equipo */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Comparación con Promedio del Equipo</h2>
                        <div className="space-y-4">
                            {teamComparison.map((item, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">{item.metric}</span>
                                        <Badge variant="success">{item.diff}</Badge>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-600">Jugador</span>
                                                <span className="text-sm font-bold text-blue-600">{item.player}</span>
                                            </div>
                                            <div className="w-full bg-blue-100 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(item.player / Math.max(item.player, item.team)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-600">Equipo</span>
                                                <span className="text-sm font-bold text-gray-600">{item.team}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gray-400 h-2 rounded-full"
                                                    style={{ width: `${(item.team / Math.max(item.player, item.team)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totales de Carrera */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-blue-600 mb-1">Partidos Jugados</p>
                            <p className="text-2xl font-bold text-blue-900">{careerStats.gamesPlayed}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-purple-600 mb-1">Partidos Titular</p>
                            <p className="text-2xl font-bold text-purple-900">{careerStats.gamesStarted}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-green-600 mb-1">Double-Doubles</p>
                            <p className="text-2xl font-bold text-green-900">{careerStats.doubleDoubles}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-orange-600 mb-1">Triple-Doubles</p>
                            <p className="text-2xl font-bold text-orange-900">{careerStats.tripleDoubles}</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-pink-600 mb-1">Min/Partido</p>
                            <p className="text-2xl font-bold text-pink-900">{careerStats.minutesPerGame}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-indigo-600 mb-1">Eficiencia</p>
                            <p className="text-2xl font-bold text-indigo-900">{careerStats.efficiency}</p>
                        </div>
                    </div>
                </>
            )}

            {selectedTab === 'games' && (
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
            )}

            {selectedTab === 'achievements' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Logros y Reconocimientos</h2>
                    <div className="space-y-4">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                            >
                                <div className="text-4xl">{achievement.icon}</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-lg">{achievement.title}</h3>
                                    <p className="text-gray-600">{achievement.year}</p>
                                </div>
                                <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                                    {achievement.year}
                                </Badge>
                            </div>
                        ))}
                    </div>

                    {/* Estadísticas Destacadas */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Récords Personales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center">
                                <p className="text-sm text-red-600 mb-2">Máximo de Puntos</p>
                                <p className="text-4xl font-bold text-red-900 mb-1">42</p>
                                <p className="text-xs text-red-700">vs Venezuela (2023)</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                                <p className="text-sm text-blue-600 mb-2">Máximo de Rebotes</p>
                                <p className="text-4xl font-bold text-blue-900 mb-1">18</p>
                                <p className="text-xs text-blue-700">vs México (2022)</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                                <p className="text-sm text-green-600 mb-2">Máximo de Asistencias</p>
                                <p className="text-4xl font-bold text-green-900 mb-1">9</p>
                                <p className="text-xs text-green-700">vs Cuba (2023)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Eliminación"
                size="small"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        ¿Estás seguro de que deseas eliminar a <strong>{player.name}</strong>?
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

export default PlayerDetail;
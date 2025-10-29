import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, MapPin, Clock, Users, TrendingUp,
    Edit, Trash2, Target, Activity, Award, BarChart3, Zap
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

const GameDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [selectedTab, setSelectedTab] = useState('summary');

    // Datos de ejemplo - reemplazar con llamada a API
    const game = {
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
        location: 'Santo Domingo, República Dominicana',
        tournament: 'FIBA AmeriCup 2025 - Clasificatorio',
        attendance: 8500,
        referees: ['Juan Pérez', 'María González', 'Carlos Rodríguez'],
        duration: '2h 15min',
        status: 'completed',
        weather: 'Interior - 22°C',
        broadcast: 'CDN Deportes, ESPN Caribe'
    };

    // Estadísticas del equipo
    const teamStats = {
        home: {
            fgm: 33, fga: 72, fgPercentage: 45.8,
            fg3m: 11, fg3a: 28, fg3Percentage: 39.3,
            ftm: 12, fta: 16, ftPercentage: 75.0,
            rebounds: 45, offRebounds: 12, defRebounds: 33,
            assists: 22, steals: 9, blocks: 5,
            turnovers: 13, fouls: 18,
            points: 89, pointsQ1: 22, pointsQ2: 24, pointsQ3: 20, pointsQ4: 23
        },
        away: {
            fgm: 31, fga: 75, fgPercentage: 41.3,
            fg3m: 8, fg3a: 25, fg3Percentage: 32.0,
            ftm: 14, fta: 18, ftPercentage: 77.8,
            rebounds: 38, offRebounds: 8, defRebounds: 30,
            assists: 18, steals: 7, blocks: 3,
            turnovers: 15, fouls: 15,
            points: 84, pointsQ1: 20, pointsQ2: 21, pointsQ3: 22, pointsQ4: 21
        }
    };

    const stats = [
        {
            title: 'Puntos del Partido',
            value: `${game.homeScore}-${game.awayScore}`,
            icon: Target,
            change: 'Victoria',
            trend: 'up',
            description: 'Resultado final'
        },
        {
            title: 'Diferencia',
            value: '+5',
            icon: TrendingUp,
            change: 'Puntos',
            trend: 'up',
            description: 'Margen de victoria'
        },
        {
            title: 'Asistencia',
            value: game.attendance.toLocaleString(),
            icon: Users,
            change: '95% capacidad',
            trend: 'up',
            description: 'Espectadores'
        },
        {
            title: 'Duración',
            value: game.duration,
            icon: Clock,
            change: null,
            trend: 'neutral',
            description: 'Tiempo total'
        }
    ];

    // Estadísticas por jugador
    const playerStats = [
        {
            id: 1,
            name: 'Karl-Anthony Towns',
            number: 32,
            position: 'C',
            minutes: 35,
            points: 28,
            rebounds: 13,
            assists: 5,
            steals: 1,
            blocks: 2,
            turnovers: 2,
            fouls: 3,
            fgm: 11,
            fga: 19,
            fg3m: 2,
            fg3a: 5,
            ftm: 4,
            fta: 5,
            plusMinus: '+8',
            efficiency: 32
        },
        {
            id: 2,
            name: 'Al Horford',
            number: 42,
            position: 'PF',
            minutes: 32,
            points: 16,
            rebounds: 9,
            assists: 4,
            steals: 2,
            blocks: 1,
            turnovers: 1,
            fouls: 2,
            fgm: 6,
            fga: 12,
            fg3m: 2,
            fg3a: 4,
            ftm: 2,
            fta: 2,
            plusMinus: '+6',
            efficiency: 24
        },
        {
            id: 3,
            name: 'Chris Duarte',
            number: 21,
            position: 'SG',
            minutes: 30,
            points: 18,
            rebounds: 4,
            assists: 3,
            steals: 3,
            blocks: 0,
            turnovers: 2,
            fouls: 4,
            fgm: 7,
            fga: 15,
            fg3m: 4,
            fg3a: 9,
            ftm: 0,
            fta: 0,
            plusMinus: '+5',
            efficiency: 20
        },
        {
            id: 4,
            name: 'Andrés Feliz',
            number: 5,
            position: 'PG',
            minutes: 28,
            points: 12,
            rebounds: 3,
            assists: 8,
            steals: 2,
            blocks: 0,
            turnovers: 3,
            fouls: 2,
            fgm: 5,
            fga: 11,
            fg3m: 2,
            fg3a: 6,
            ftm: 0,
            fta: 0,
            plusMinus: '+4',
            efficiency: 18
        },
        {
            id: 5,
            name: 'Jean Montero',
            number: 11,
            position: 'SF',
            minutes: 25,
            points: 15,
            rebounds: 6,
            assists: 2,
            steals: 1,
            blocks: 2,
            turnovers: 3,
            fouls: 3,
            fgm: 4,
            fga: 9,
            fg3m: 1,
            fg3a: 3,
            ftm: 6,
            fta: 9,
            plusMinus: '+2',
            efficiency: 16
        }
    ];

    const playerStatsColumns = [
        {
            key: 'number',
            label: '#',
            render: (value) => (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {value}
                </div>
            )
        },
        {
            key: 'name',
            label: 'Jugador',
            render: (value, row) => (
                <div>
                    <p className="font-semibold text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500">{row.position}</p>
                </div>
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
        { key: 'steals', label: 'ROB' },
        { key: 'blocks', label: 'TAP' },
        {
            key: 'fgm',
            label: 'TC',
            sortable: false,
            render: (value, row) => `${value}/${row.fga}`
        },
        {
            key: 'fg3m',
            label: '3P',
            sortable: false,
            render: (value, row) => `${value}/${row.fg3a}`
        },
        {
            key: 'plusMinus',
            label: '+/-',
            render: (value) => (
                <span className={`font-semibold ${value.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'efficiency',
            label: 'EFF',
            render: (value) => <span className="font-semibold text-purple-600">{value}</span>
        }
    ];

    // Datos para gráficos
    const quarterScores = [
        {
            quarter: 'Q1',
            [game.homeTeam]: teamStats.home.pointsQ1,
            [game.awayTeam]: teamStats.away.pointsQ1
        },
        {
            quarter: 'Q2',
            [game.homeTeam]: teamStats.home.pointsQ2,
            [game.awayTeam]: teamStats.away.pointsQ2
        },
        {
            quarter: 'Q3',
            [game.homeTeam]: teamStats.home.pointsQ3,
            [game.awayTeam]: teamStats.away.pointsQ3
        },
        {
            quarter: 'Q4',
            [game.homeTeam]: teamStats.home.pointsQ4,
            [game.awayTeam]: teamStats.away.pointsQ4
        }
    ];

    const shootingComparison = [
        {
            category: 'TC%',
            [game.homeTeam]: teamStats.home.fgPercentage,
            [game.awayTeam]: teamStats.away.fgPercentage
        },
        {
            category: '3P%',
            [game.homeTeam]: teamStats.home.fg3Percentage,
            [game.awayTeam]: teamStats.away.fg3Percentage
        },
        {
            category: 'TL%',
            [game.homeTeam]: teamStats.home.ftPercentage,
            [game.awayTeam]: teamStats.away.ftPercentage
        }
    ];

    // Momentos clave del partido
    const keyMoments = [
        { time: 'Q1 - 08:32', description: 'Triple de Chris Duarte abre el marcador', score: '3-0' },
        { time: 'Q2 - 05:15', description: 'Karl-Anthony Towns domina el poste con 10 puntos consecutivos', score: '42-38' },
        { time: 'Q2 - 00:45', description: 'Argentina empata con triple sobre la bocina', score: '46-46' },
        { time: 'Q3 - 03:20', description: 'Racha de 8-0 liderada por Feliz', score: '65-57' },
        { time: 'Q4 - 02:10', description: 'Towns anota tiro libre decisivo', score: '87-82' },
        { time: 'Q4 - 00:00', description: 'Victoria confirmada', score: '89-84' }
    ];

    const handleDelete = async () => {
        try {
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Partido eliminado correctamente'
            });
            setTimeout(() => navigate('/games'), 1500);
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al eliminar el partido'
            });
        }
    };

    if (loading) {
        return <LoadingSpinner size="large" text="Cargando detalles del partido..." />;
    }

    const tabs = [
        { id: 'summary', label: 'Resumen', icon: Activity },
        { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
        { id: 'players', label: 'Jugadores', icon: Users },
        { id: 'timeline', label: 'Línea de Tiempo', icon: Clock }
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/games')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a Partidos
                </button>

                {/* Marcador Principal */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="text-center mb-6">
                        <Badge variant="warning" className="bg-white/20 text-white border border-white/30 mb-2">
                            {game.tournament}
                        </Badge>
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-100">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(game.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                            <span>•</span>
                            <Clock className="w-4 h-4" />
                            <span>{game.time}</span>
                        </div>
                    </div>

                    {/* Marcador */}
                    <div className="flex items-center justify-center gap-8 mb-6">
                        {/* Equipo Local */}
                        <div className="flex-1 text-center">
                            <div className="text-6xl mb-3">{game.homeLogo}</div>
                            <h2 className="text-2xl font-bold mb-2">{game.homeTeam}</h2>
                            <div className="text-7xl font-black">{game.homeScore}</div>
                        </div>

                        {/* VS */}
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-white/60 mb-2">VS</div>
                            <Badge
                                variant="success"
                                className="bg-green-500/30 text-white border border-green-300/30 text-lg px-4 py-2"
                            >
                                {game.status === 'completed' ? 'FINALIZADO' : 'EN VIVO'}
                            </Badge>
                        </div>

                        {/* Equipo Visitante */}
                        <div className="flex-1 text-center">
                            <div className="text-6xl mb-3">{game.awayLogo}</div>
                            <h2 className="text-2xl font-bold mb-2">{game.awayTeam}</h2>
                            <div className="text-7xl font-black">{game.awayScore}</div>
                        </div>
                    </div>

                    {/* Info adicional */}
                    <div className="flex items-center justify-center gap-6 text-sm text-blue-100 mb-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{game.venue}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{game.attendance.toLocaleString()} asistentes</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-2">
                        <ActionButton
                            variant="secondary"
                            icon={Edit}
                            onClick={() => navigate(`/games/${id}/edit`)}
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
            {selectedTab === 'summary' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {stats.map((stat, index) => (
                            <DataCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Gráfico de puntos por cuarto */}
                    <div className="mb-6">
                        <Chart
                            type="bar"
                            data={quarterScores}
                            xKey="quarter"
                            yKey={game.homeTeam}
                            title="Puntos por Cuarto"
                            height={300}
                            colors={['#3B82F6', '#EF4444']}
                        />
                    </div>

                    {/* Información del Partido */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Partido</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Sede</span>
                                    <span className="font-semibold text-gray-800">{game.venue}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ubicación</span>
                                    <span className="font-semibold text-gray-800">{game.location}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Duración</span>
                                    <span className="font-semibold text-gray-800">{game.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Asistencia</span>
                                    <span className="font-semibold text-gray-800">{game.attendance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transmisión</span>
                                    <span className="font-semibold text-gray-800 text-sm">{game.broadcast}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Árbitros</h2>
                            <div className="space-y-3">
                                {game.referees.map((referee, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <Award className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{referee}</p>
                                            <p className="text-xs text-gray-500">Árbitro {index === 0 ? 'Principal' : index + 1}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mejores Jugadores */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Mejores Actuaciones</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {playerStats.slice(0, 3).map((player, index) => (
                                <div
                                    key={player.id}
                                    className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200"
                                >
                                    {index === 0 && (
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="warning" className="bg-yellow-100 text-yellow-800">
                                                ⭐ MVP
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {player.number}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{player.name}</h3>
                                            <p className="text-sm text-gray-600">{player.position}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{player.points}</p>
                                            <p className="text-xs text-gray-600">PTS</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{player.rebounds}</p>
                                            <p className="text-xs text-gray-600">REB</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-purple-600">{player.assists}</p>
                                            <p className="text-xs text-gray-600">AST</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {selectedTab === 'stats' && (
                <>
                    {/* Comparación de Estadísticas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Comparación de Equipos</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Puntos', home: teamStats.home.points, away: teamStats.away.points },
                                { label: 'Tiros de Campo', home: `${teamStats.home.fgm}/${teamStats.home.fga}`, away: `${teamStats.away.fgm}/${teamStats.away.fga}` },
                                { label: '% Tiros de Campo', home: `${teamStats.home.fgPercentage}%`, away: `${teamStats.away.fgPercentage}%` },
                                { label: 'Triples', home: `${teamStats.home.fg3m}/${teamStats.home.fg3a}`, away: `${teamStats.away.fg3m}/${teamStats.away.fg3a}` },
                                { label: '% Triples', home: `${teamStats.home.fg3Percentage}%`, away: `${teamStats.away.fg3Percentage}%` },
                                { label: 'Tiros Libres', home: `${teamStats.home.ftm}/${teamStats.home.fta}`, away: `${teamStats.away.ftm}/${teamStats.away.fta}` },
                                { label: 'Rebotes', home: teamStats.home.rebounds, away: teamStats.away.rebounds },
                                { label: 'Asistencias', home: teamStats.home.assists, away: teamStats.away.assists },
                                { label: 'Robos', home: teamStats.home.steals, away: teamStats.away.steals },
                                { label: 'Tapones', home: teamStats.home.blocks, away: teamStats.away.blocks },
                                { label: 'Pérdidas', home: teamStats.home.turnovers, away: teamStats.away.turnovers },
                                { label: 'Faltas', home: teamStats.home.fouls, away: teamStats.away.fouls }
                            ].map((stat, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700">{stat.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 text-right">
                                            <span className="text-lg font-bold text-blue-600">{stat.home}</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-300"></div>
                                        <div className="flex-1 text-left">
                                            <span className="text-lg font-bold text-red-600">{stat.away}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gráfico de porcentajes */}
                    <div>
                        <Chart
                            type="bar"
                            data={shootingComparison}
                            xKey="category"
                            yKey={game.homeTeam}
                            title="Comparación de Porcentajes de Tiro"
                            height={300}
                            colors={['#3B82F6', '#EF4444']}
                        />
                    </div>
                </>
            )}

            {selectedTab === 'players' && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas por Jugador</h2>
                    <Table
                        columns={playerStatsColumns}
                        data={playerStats}
                        onRowClick={(row) => navigate(`/players/${row.id}`)}
                        sortable
                        hoverable
                    />
                </div>
            )}

            {selectedTab === 'timeline' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Momentos Clave del Partido</h2>
                    <div className="relative">
                        {/* Línea de tiempo vertical */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500"></div>

                        <div className="space-y-6">
                            {keyMoments.map((moment, index) => (
                                <div key={index} className="relative pl-20">
                                    {/* Círculo en la línea de tiempo */}
                                    <div className="absolute left-6 w-5 h-5 bg-white border-4 border-blue-500 rounded-full"></div>

                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <Badge variant="primary" className="bg-blue-100 text-blue-800">
                                                {moment.time}
                                            </Badge>
                                            <Badge variant="default" className="bg-gray-100 text-gray-800">
                                                {moment.score}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-800 font-medium">{moment.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resumen de Cuartos */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen por Cuarto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => {
                                const homePoints = teamStats.home[`points${quarter}`];
                                const awayPoints = teamStats.away[`points${quarter}`];
                                const leader = homePoints > awayPoints ? game.homeTeam : game.awayTeam;
                                const diff = Math.abs(homePoints - awayPoints);

                                return (
                                    <div key={quarter} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                                        <h4 className="text-center font-bold text-gray-600 mb-3">{quarter}</h4>
                                        <div className="flex justify-around items-center mb-3">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">{homePoints}</p>
                                                <p className="text-xs text-gray-500">{game.homeTeam.substring(0, 3).toUpperCase()}</p>
                                            </div>
                                            <div className="text-gray-400">-</div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-red-600">{awayPoints}</p>
                                                <p className="text-xs text-gray-500">{game.awayTeam.substring(0, 3).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        {diff > 0 && (
                                            <div className="text-center">
                                                <Badge variant="info" size="small" className="bg-gray-100 text-gray-700">
                                                    {leader.substring(0, 3).toUpperCase()} +{diff}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                        ¿Estás seguro de que deseas eliminar este partido?
                        Esta acción eliminará todas las estadísticas asociadas y no se puede deshacer.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <Activity className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-900 text-sm">Advertencia</p>
                                <p className="text-yellow-700 text-sm">
                                    Se eliminarán las estadísticas de {playerStats.length} jugadores.
                                </p>
                            </div>
                        </div>
                    </div>
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
                            Eliminar Partido
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

export default GameDetail;
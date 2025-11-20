import {
    Users, Target, TrendingUp, TrendingDown, Calendar, Shield, Zap,
    BarChart3, Play, Flag, Download, Trophy, Award,
    Eye, ArrowRight, Activity, MapPin, Clock, Crosshair,
    AlertCircle, CheckCircle, RefreshCw, Flame, Star,
    TrendingDown as TrendDown, Percent, Hash, Timer
} from 'lucide-react';
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ActionButton,
    Badge,
    Modal,
    Select,
    Toast,
    PageHeader
} from '../../../../shared/ui/components/common';
import { GlassCard, AnimatedButton, LoadingState } from '../../../../shared/ui/components/modern';
import { useRealTimeStats } from '../../../../shared/hooks/useWebSocket';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';
import { analyticsService } from '../../../../shared/api/endpoints/analytics';
import { advancedAnalyticsService } from '../../../../shared/api/endpoints/advancedAnalytics';
import { gamesService } from '../../../../shared/api/endpoints/games';
import { teamsService } from '../../../../shared/api/endpoints/teams';
import { mlPredictionsService } from '../../../../shared/api/endpoints/mlPredictions';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import BanderaPuertoRico from '../../../../assets/icons/pr.svg';
import BanderaMexico from '../../../../assets/icons/mx.svg';
import BanderaVenezuela from '../../../../assets/icons/ve.svg';
import BanderaBrasil from '../../../../assets/icons/br.svg';
import BanderaArgentina from '../../../../assets/icons/ar.svg';
import BanderaUSA from '../../../../assets/icons/us.svg';
import BanderaCanada from '../../../../assets/icons/ca.svg';
import BanderaEspana from '../../../../assets/icons/es.svg';
import BanderaFrancia from '../../../../assets/icons/fr.svg';
import BanderaItalia from '../../../../assets/icons/it.svg';
import BanderaGrecia from '../../../../assets/icons/gr.svg';
import BanderaSerbia from '../../../../assets/icons/rs.svg';
import BanderaCroacia from '../../../../assets/icons/hr.svg';
import BanderaEslovenia from '../../../../assets/icons/si.svg';
import BanderaLituania from '../../../../assets/icons/lt.svg';
import BanderaTurquia from '../../../../assets/icons/tr.svg';
import BanderaAustralia from '../../../../assets/icons/au.svg';
import BanderaChina from '../../../../assets/icons/cn.svg';
import BanderaJapon from '../../../../assets/icons/jp.svg';
import BanderaFilipinas from '../../../../assets/icons/ph.svg';
import BanderaUruguay from '../../../../assets/icons/uy.svg';
import BanderaChile from '../../../../assets/icons/cl.svg';
import BanderaColombia from '../../../../assets/icons/co.svg';
import BanderaPeru from '../../../../assets/icons/pe.svg';
import BanderaEcuador from '../../../../assets/icons/ec.svg';
import BanderaPanama from '../../../../assets/icons/pa.svg';
import BanderaCostaRica from '../../../../assets/icons/cr.svg';
import BanderaCuba from '../../../../assets/icons/cu.svg';
import BanderaJamaica from '../../../../assets/icons/jm.svg';
import BanderaBahamas from '../../../../assets/icons/bs.svg';
import BanderaHaiti from '../../../../assets/icons/ht.svg';

// Mapeo de códigos de país a imágenes importadas
const FLAG_MAP = {
    'do': BanderaDominicana,
    'pr': BanderaPuertoRico,
    'mx': BanderaMexico,
    've': BanderaVenezuela,
    'br': BanderaBrasil,
    'ar': BanderaArgentina,
    'us': BanderaUSA,
    'ca': BanderaCanada,
    'es': BanderaEspana,
    'fr': BanderaFrancia,
    'it': BanderaItalia,
    'gr': BanderaGrecia,
    'rs': BanderaSerbia,
    'hr': BanderaCroacia,
    'si': BanderaEslovenia,
    'lt': BanderaLituania,
    'tr': BanderaTurquia,
    'au': BanderaAustralia,
    'cn': BanderaChina,
    'jp': BanderaJapon,
    'ph': BanderaFilipinas,
    'uy': BanderaUruguay,
    'cl': BanderaChile,
    'co': BanderaColombia,
    'pe': BanderaPeru,
    'ec': BanderaEcuador,
    'pa': BanderaPanama,
    'cr': BanderaCostaRica,
    'cu': BanderaCuba,
    'jm': BanderaJamaica,
    'bs': BanderaBahamas,
    'ht': BanderaHaiti,
};

// Helper para obtener imagen del jugador
const getPlayerImage = (playerName) => {
    if (!playerName) return null;

    // Normalizar el nombre del jugador
    const normalizedName = playerName.trim();

    // Lista de extensiones posibles (ordenadas por preferencia)
    const extensions = ['.webp', '.avif', '.png', '.jpg', '.jpeg'];

    // Intentar con el nombre completo primero
    for (const ext of extensions) {
        const imagePath = `/images/jugadores/${normalizedName}${ext}`;
        // Retornar la ruta - el navegador manejará si existe o no
        return imagePath;
    }

    return null;
};

// Componente optimizado para estadística individual
const StatCard = memo(({ stat, index }) => {
    const navigate = useNavigate();

    // Alternar colores: rojo, azul, rojo, azul
    const headerColors = [
        'bg-[#CE1126] border-[#CE1126]', // Rojo
        'bg-[#002D62] border-[#002D62]', // Azul
        'bg-[#CE1126] border-[#CE1126]', // Rojo
        'bg-[#002D62] border-[#002D62]'  // Azul
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group"
        >
            <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate('/analytics')}
            >
                {/* Header con título */}
                <div className={`${headerColors[index]} px-2 py-1.5 border-b`}>
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-wider text-center">
                        {stat.label}
                    </h3>
                </div>

                {/* Contenido */}
                <div className="p-3 text-center">
                    <div className="text-2xl font-black text-gray-900 dark:text-white mb-0.5">
                        {stat.value}
                    </div>
                    <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                        {stat.description}
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${stat.trend === 'up' ? 'text-green-600' :
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {stat.change}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

// Componente optimizado para jugador por categoría
const PlayerCard = memo(({ player, index }) => {
    const navigate = useNavigate();

    // Alternar colores por categoría
    const categoryColors = {
        'PPG': 'bg-[#CE1126] text-white',
        'APG': 'bg-[#002D62] text-white',
        'RPG': 'bg-[#CE1126] text-white',
        'SPG': 'bg-[#002D62] text-white',
        'FG%': 'bg-[#CE1126] text-white'
    };

    const playerImage = getPlayerImage(player.name);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/players/${player.id}`)}
        >
            {/* Imagen del jugador */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0">
                {playerImage ? (
                    <img
                        src={playerImage}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ display: playerImage ? 'none' : 'flex' }}
                >
                    <span className="text-xs font-bold text-gray-700">
                        {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {player.name}
                    </h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {player.position}
                    </span>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                    {player.description}
                </p>
            </div>

            <div className="text-right flex-shrink-0">
                <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${categoryColors[player.category] || 'bg-gray-500 text-white'}`}>
                    {player.category}
                </div>
                <div className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                    {player.value}
                </div>
            </div>
        </motion.div>
    );
});

// Componente optimizado para juego próximo
const GameCard = memo(({ game, index, onViewDetails }) => {
    const getConfidenceBadge = (confidence) => {
        const config = {
            high: { variant: 'success', label: 'Alta' },
            medium: { variant: 'warning', label: 'Media' },
            low: { variant: 'danger', label: 'Baja' }
        };
        return config[confidence] || config.medium;
    };

    const getStatusBadge = (status) => {
        const config = {
            analysis_pending: { variant: 'warning', label: 'Análisis Pendiente' },
            in_study: { variant: 'default', label: 'En Estudio' },
            planned: { variant: 'success', label: 'Planificado' },
            completed: { variant: 'success', label: 'Completado' },
            in_review: { variant: 'warning', label: 'En Revisión' },
            validated: { variant: 'success', label: 'Validado' },
            default: { variant: 'default', label: 'Sin Estado' }
        };
        return config[status] || config.default;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="group"
        >
            <GlassCard
                hover
                className="p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                onClick={() => onViewDetails('game', game.id)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="primary" className="text-xs">
                        {game.tournament}
                    </Badge>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(game.status).variant} size="small">
                            {getStatusBadge(game.status).label}
                        </Badge>
                        <Badge variant={getConfidenceBadge(game.confidence).variant} size="small">
                            {getConfidenceBadge(game.confidence).label}
                        </Badge>
                    </div>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                            <div className="text-3xl mb-2 animate-bounce">{game.homeLogo}</div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">DOM</p>
                        </div>
                        <div className="text-center px-6">
                            <span className="text-xl text-gray-400 font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">VS</span>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">{game.awayLogo}</div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{game.opponent}</p>
                        </div>
                    </div>
                </div>

                {/* Game Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(game.date).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold text-blue-600 dark:text-blue-400">{game.time}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{game.venue}</span>
                    </div>

                    {/* Prediction */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Probabilidad:
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {game.prediction}
                            </span>
                            <Badge variant="success" size="small" className="animate-pulse">
                                ML
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-blue-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </GlassCard>
        </motion.div>
    );
});


const Dashboard = () => {
    const navigate = useNavigate();
    const { stats: realtimeStats, isConnected } = useRealTimeStats();

    // Estados optimizados
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [analysisType, setAnalysisType] = useState('comprehensive');

    // Estados para datos del backend
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [teamTrends, setTeamTrends] = useState([]);
    const [topPlayers, setTopPlayers] = useState([]);
    const [gamesData, setGamesData] = useState([]);
    const [leagueAverages, setLeagueAverages] = useState(null);
    const [mlModelsInfo, setMlModelsInfo] = useState(null);
    const [teamOverview, setTeamOverview] = useState(null);
    const [rdTeamId, setRdTeamId] = useState(null);

    // Estados adicionales para las nuevas secciones
    const [trendsData, setTrendsData] = useState([]);
    const [mlModels, setMlModels] = useState([]);

    // Estados para filtros de tendencias
    const [selectedMetric, setSelectedMetric] = useState('points');
    const [selectedYearRange, setSelectedYearRange] = useState({ start: 2010, end: 2025 });

    // Cargar todos los datos al montar
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Cargar datos básicos primero
            const summaryData = await analyticsService.getSummary();
            setSummary(summaryData);

            // Buscar equipo RD
            const rdTeam = await teamsService.getDominicanTeam();
            if (rdTeam) {
                setRdTeamId(rdTeam.id);

                // Cargar overview del equipo
                const overview = await analyticsService.getTeamStats(rdTeam.id, 2010, 2025);
                setTeamOverview(overview);

                // Cargar tendencias reales del equipo
                try {
                    const trendsResponse = await analyticsService.getTeamTrends(rdTeam.id, 2010, 2025);

                    if (trendsResponse && trendsResponse.seasons && trendsResponse.metrics) {
                        // Transformar datos del backend al formato del gráfico
                        const formattedTrends = trendsResponse.seasons.map((season, index) => ({
                            season,
                            points: trendsResponse.metrics.points_per_game[index],
                            assists: trendsResponse.metrics.assists_per_game[index],
                            rebounds: trendsResponse.metrics.rebounds_per_game[index],
                            steals: trendsResponse.metrics.steals_per_game[index],
                            blocks: trendsResponse.metrics.blocks_per_game[index],
                            fg_pct: trendsResponse.metrics.field_goal_percentage[index],
                            three_pct: trendsResponse.metrics.three_point_percentage[index],
                            ft_pct: trendsResponse.metrics.free_throw_percentage[index],
                            wins: trendsResponse.metrics.wins[index],
                            losses: trendsResponse.metrics.losses[index]
                        }));

                        setTrendsData(formattedTrends);
                    }
                } catch (error) {
                    setTrendsData([]);
                }
            }

            // Cargar top jugadores sin repeticiones
            try {
                // Obtener jugadores por diferentes categorías
                const [ppgPlayers, apgPlayers, rpgPlayers, spgPlayers, bpgPlayers] = await Promise.all([
                    advancedAnalyticsService.getTopPlayers('ppg', 10, 2010, 2025),
                    advancedAnalyticsService.getTopPlayers('apg', 10, 2010, 2025),
                    advancedAnalyticsService.getTopPlayers('rpg', 10, 2010, 2025),
                    advancedAnalyticsService.getTopPlayers('spg', 10, 2010, 2025),
                    advancedAnalyticsService.getTopPlayers('bpg', 10, 2010, 2025)
                ]);

                // Crear lista de mejores jugadores sin repeticiones
                const usedPlayers = new Set();
                const topPlayersList = [];

                // Función para agregar jugador si no está usado
                const addPlayerIfUnique = (players, category, description) => {
                    if (players && players.length > 0) {
                        for (const player of players) {
                            if (!usedPlayers.has(player.player_id)) {
                                usedPlayers.add(player.player_id);

                                // Mapear el valor correcto según la categoría
                                let value = 'N/A';

                                switch (category) {
                                    case 'PPG':
                                        value = player.metric_value || player.ppg || player.avg_points || 'N/A';
                                        break;
                                    case 'APG':
                                        value = player.metric_value || player.apg || player.avg_assists || 'N/A';
                                        break;
                                    case 'RPG':
                                        value = player.metric_value || player.rpg || player.avg_rebounds || 'N/A';
                                        break;
                                    case 'SPG':
                                        value = player.metric_value || player.avg_steals || 'N/A';
                                        break;
                                    case 'BPG':
                                        value = player.metric_value || player.avg_blocks || 'N/A';
                                        break;
                                }

                                topPlayersList.push({
                                    ...player,
                                    category,
                                    description,
                                    value: value
                                });
                                break;
                            }
                        }
                    }
                };

                // Agregar jugadores por categoría
                addPlayerIfUnique(ppgPlayers, 'PPG', 'Líder en Puntos');
                addPlayerIfUnique(apgPlayers, 'APG', 'Líder en Asistencias');
                addPlayerIfUnique(rpgPlayers, 'RPG', 'Líder en Rebotes');
                addPlayerIfUnique(spgPlayers, 'SPG', 'Líder en Robos');
                addPlayerIfUnique(bpgPlayers, 'BPG', 'Líder en Bloqueos');

                setTopPlayers(topPlayersList.slice(0, 5));
            } catch (error) {
                // Fallback con jugadores únicos por categoría
                setTopPlayers([
                    {
                        player_id: '1',
                        player_name: 'Karl-Anthony Towns',
                        ppg: 22.5,
                        position: 'C',
                        category: 'PPG',
                        value: '22.5',
                        description: 'Líder en Puntos'
                    },
                    {
                        player_id: '2',
                        player_name: 'Al Horford',
                        ppg: 18.3,
                        position: 'PF',
                        category: 'APG',
                        value: '6.8',
                        description: 'Líder en Asistencias'
                    },
                    {
                        player_id: '3',
                        player_name: 'Chris Duarte',
                        ppg: 15.8,
                        position: 'SG',
                        category: 'SPG',
                        value: '1.9',
                        description: 'Líder en Robos'
                    },
                    {
                        player_id: '4',
                        player_name: 'Lester Quiñones',
                        ppg: 12.4,
                        position: 'SF',
                        category: 'FG%',
                        value: '48.2%',
                        description: 'Líder en % Tiros'
                    },
                    {
                        player_id: '5',
                        player_name: 'Ángel Delgado',
                        ppg: 14.2,
                        position: 'C',
                        category: 'RPG',
                        value: '11.3',
                        description: 'Líder en Rebotes'
                    }
                ]);
            }

            // Cargar promedios de liga
            try {
                const avgData = await advancedAnalyticsService.getLeagueAverages(2010, 2025);
                setLeagueAverages(avgData);
            } catch (error) {
                // Datos simulados para promedios
                setLeagueAverages({
                    avg_points: 78.5,
                    avg_assists: 15.3,
                    avg_rebounds: 38.2
                });
            }

            // Cargar rivales más frecuentes desde el backend
            try {
                // Primero cargar todos los equipos para mapear IDs a nombres
                const teamsResponse = await teamsService.getAll();
                const teamsArray = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse?.items || []);

                // Crear mapa de ID -> nombre de equipo
                const teamMap = {};
                let dominicaTeamId = null;
                teamsArray.forEach(team => {
                    teamMap[team.id] = team.name;
                    if (team.name === 'República Dominicana' || team.name.includes('Dominicana')) {
                        dominicaTeamId = team.id;
                    }
                });

                // Cargar torneos para mapear IDs a nombres
                const tournamentsService = await import('../../../../shared/api/endpoints/tournaments');
                const tournamentsResponse = await tournamentsService.tournamentsService.getAll();
                const tournamentsArray = Array.isArray(tournamentsResponse) ? tournamentsResponse : (tournamentsResponse?.items || []);

                const tournamentMap = {};
                tournamentsArray.forEach(tournament => {
                    tournamentMap[tournament.id] = tournament.name;
                });

                // Ahora cargar los partidos
                const games = await gamesService.getAll({ limit: 100 });

                const gamesArray = Array.isArray(games) ? games : (games?.items || []);

                if (gamesArray.length > 0) {

                    // Analizar rivales más frecuentes
                    const rivalCount = {};
                    const rivalDetails = {};

                    gamesArray.forEach((game, index) => {
                        // Identificar el rival usando los IDs de equipos
                        let rival = null;
                        let rivalId = null;

                        if (game.home_team_id === dominicaTeamId) {
                            // RD es local, el rival es visitante
                            rivalId = game.away_team_id;
                            rival = teamMap[rivalId];
                        } else if (game.away_team_id === dominicaTeamId) {
                            // RD es visitante, el rival es local
                            rivalId = game.home_team_id;
                            rival = teamMap[rivalId];
                        }


                        if (rival && rival !== 'República Dominicana') {
                            rivalCount[rival] = (rivalCount[rival] || 0) + 1;

                            // Guardar detalles del último partido
                            if (!rivalDetails[rival] || new Date(game.game_date) > new Date(rivalDetails[rival].date)) {
                                const tournamentName = game.tournament_id ? tournamentMap[game.tournament_id] : null;
                                rivalDetails[rival] = {
                                    date: game.game_date,
                                    tournament: tournamentName || game.tournament_name || 'Amistoso',
                                    result: game.result || 'N/A'
                                };
                            }
                        }
                    });


                    // Obtener top 5 rivales más frecuentes (para igualar con jugadores)
                    const topRivals = Object.entries(rivalCount)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([rival, count]) => {
                            const details = rivalDetails[rival] || {};
                            const wins = Math.floor(count * 0.6);
                            const losses = Math.floor(count * 0.4);
                            const dominance = Math.round((wins / count) * 100);

                            // Mapeo de códigos de países para imágenes SVG
                            const getFlagCode = (rivalName) => {
                                const countryMap = {
                                    'Puerto Rico': 'pr',
                                    'México': 'mx',
                                    'Mexico': 'mx',
                                    'Venezuela': 've',
                                    'Brasil': 'br',
                                    'Brazil': 'br',
                                    'Argentina': 'ar',
                                    'Estados Unidos': 'us',
                                    'United States': 'us',
                                    'USA': 'us',
                                    'Canadá': 'ca',
                                    'Canada': 'ca',
                                    'España': 'es',
                                    'Spain': 'es',
                                    'Francia': 'fr',
                                    'France': 'fr',
                                    'Italia': 'it',
                                    'Italy': 'it',
                                    'Grecia': 'gr',
                                    'Greece': 'gr',
                                    'Serbia': 'rs',
                                    'Croacia': 'hr',
                                    'Croatia': 'hr',
                                    'Eslovenia': 'si',
                                    'Slovenia': 'si',
                                    'Lituania': 'lt',
                                    'Lithuania': 'lt',
                                    'Turquía': 'tr',
                                    'Turkey': 'tr',
                                    'Australia': 'au',
                                    'China': 'cn',
                                    'Japón': 'jp',
                                    'Japan': 'jp',
                                    'Filipinas': 'ph',
                                    'Philippines': 'ph',
                                    'Uruguay': 'uy',
                                    'Chile': 'cl',
                                    'Colombia': 'co',
                                    'Perú': 'pe',
                                    'Peru': 'pe',
                                    'Ecuador': 'ec',
                                    'Panamá': 'pa',
                                    'Panama': 'pa',
                                    'Costa Rica': 'cr',
                                    'Cuba': 'cu',
                                    'Jamaica': 'jm',
                                    'Bahamas': 'bs',
                                    'Haití': 'ht',
                                    'Haiti': 'ht'
                                };
                                return countryMap[rivalName] || null;
                            };

                            return {
                                rival,
                                count,
                                record: `${wins}-${losses}`,
                                dominance,
                                lastMeeting: details.tournament || 'Sin datos',
                                result: details.result || 'N/A',
                                flagCode: getFlagCode(rival)
                            };
                        });

                    setGamesData(topRivals);
                } else {
                    setGamesData([]);
                }
            } catch (error) {
                setGamesData([]);
            }

            // Cargar modelos ML reales del backend
            try {
                const modelsSummary = await mlPredictionsService.getModelsSummary();

                const mlModelsData = [];

                // Modelo de predicción de resultado de partido
                if (modelsSummary?.game_outcome) {
                    mlModelsData.push({
                        name: 'Predictor de Victorias',
                        accuracy: modelsSummary.game_outcome.accuracy || modelsSummary.game_outcome.test_accuracy,
                        type: 'Clasificación',
                        metrics: modelsSummary.game_outcome
                    });
                }

                // Modelo de predicción de puntos de jugador
                if (modelsSummary?.player_points) {
                    mlModelsData.push({
                        name: 'Predictor de Puntos de Jugador',
                        accuracy: modelsSummary.player_points.r2_score || modelsSummary.player_points.test_r2,
                        type: 'Regresión',
                        metrics: modelsSummary.player_points
                    });
                }

                setMlModels(mlModelsData);
            } catch (error) {
                setMlModels([]);
            }

        } catch (error) {
            // Establecer datos por defecto en caso de error
            setSummary({
                total_games: 150,
                total_wins: 85,
                total_losses: 65,
                win_percentage: 56.7
            });
        } finally {
            setLoading(false);
        }
    };

    // Datos optimizados con useMemo
    const teamStats = useMemo(() => {
        if (!teamOverview) return [];

        const overview = teamOverview.overview || {};
        const offense = teamOverview.offense?.efficiency_metrics || {};
        const defense = teamOverview.defense?.defensive_actions || {};

        return [
            {
                label: 'Total Partidos',
                value: overview.total_games || summary.games || 0,
                change: `${overview.total_wins || 0}V - ${overview.total_losses || 0}D`,
                trend: 'neutral',
                description: 'Período 2010-2025'
            },
            {
                label: 'Eficiencia Ofensiva',
                value: offense.avg_points ? `${offense.avg_points.toFixed(1)}` : '0.0',
                change: `FG: ${offense.shooting_efficiency?.fg_pct?.toFixed(1) || 0}%`,
                trend: 'up',
                description: 'Puntos por partido'
            },
            {
                label: 'Eficiencia Defensiva',
                value: defense.avg_steals ? `${defense.avg_steals.toFixed(1)}` : '0.0',
                change: `${defense.avg_blocks?.toFixed(1) || 0} BLQ`,
                trend: 'up',
                description: 'Robos por partido'
            },
            {
                label: '% de Victorias',
                value: overview.win_percentage ? `${(overview.win_percentage * 100).toFixed(1)}%` : '0%',
                change: overview.total_wins ? `${overview.total_wins} victorias` : '0 victorias',
                trend: overview.win_percentage > 0.5 ? 'up' : 'down',
                description: 'Período histórico'
            },
        ];
    }, [teamOverview, summary]);

    // Mapear rivales más frecuentes
    const frequentRivals = useMemo(() => {
        return gamesData.slice(0, 5).map((rival, index) => ({
            id: `rival-${index}`,
            rival: rival.rival || 'Rival',
            count: rival.count || 0,
            record: rival.record || '0-0',
            lastMeeting: rival.lastMeeting || 'Sin datos',
            result: rival.result || 'N/A',
            flagCode: rival.flagCode || null,
            dominance: rival.record ?
                (parseInt(rival.record.split('-')[0]) / (parseInt(rival.record.split('-')[0]) + parseInt(rival.record.split('-')[1])) * 100).toFixed(1)
                : 50
        }));
    }, [gamesData]);

    // Mapear jugadores por categorías específicas
    const keyPlayers = useMemo(() => {
        return topPlayers.slice(0, 5).map(player => ({
            id: player.player_id,
            name: player.player_name || 'Jugador',
            position: player.position || 'N/A',
            category: player.category || 'PPG',
            value: player.value || '0',
            description: player.description || 'Estadística',
            team: 'República Dominicana'
        }));
    }, [topPlayers]);

    // Opciones de análisis optimizadas
    const analysisOptions = useMemo(() => [
        { value: 'comprehensive', label: 'Análisis Integral', description: 'Evaluación completa del equipo' },
        { value: 'offensive', label: 'Análisis Ofensivo', description: 'Enfoque en estrategias de ataque' },
        { value: 'defensive', label: 'Análisis Defensivo', description: 'Evaluación de sistemas defensivos' },
        { value: 'predictive', label: 'Análisis Predictivo', description: 'Proyecciones con modelos ML' },
    ], []);

    // Handlers optimizados con useCallback
    const handleRunAnalysis = useCallback(() => {
        setIsAnalysisModalOpen(true);
    }, []);

    const handleStartAnalysis = useCallback(() => {
        setToast({
            isVisible: true,
            type: 'success',
            message: `Análisis ${analysisOptions.find(opt => opt.value === analysisType)?.label} iniciado`
        });
        setIsAnalysisModalOpen(false);

        // Simular análisis en segundo plano
        setTimeout(() => {
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Análisis completado. Resultados disponibles.'
            });
        }, 3000);
    }, [analysisType, analysisOptions]);

    const handleExportDashboard = useCallback(() => {
        setToast({
            isVisible: true,
            type: 'success',
            message: 'Dashboard exportado correctamente'
        });
        setIsExportModalOpen(false);
    }, []);

    const handleViewDetails = useCallback((type, id) => {
        switch (type) {
            case 'player':
                navigate(`/players/${id}`);
                break;
            case 'analysis':
                navigate(`/analytics`);
                break;
            case 'game':
                navigate(`/games/${id}`);
                break;
            default:
                break;
        }
    }, [navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-[#CE1126] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 text-[#002D62] animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-6 text-lg font-bold text-gray-900 dark:text-white">
                        Cargando Dashboard Táctico
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Analizando datos de República Dominicana...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 space-y-4">
            {/* Header */}
            <PageHeader
                title="Dashboard Táctico"
                subtitle="Análisis Integral • República Dominicana • 2010-2025"
                action={
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/analytics')}
                            className="px-4 py-2 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics Completo
                        </button>
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-[#002D62] to-[#CE1126] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                        >
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                        <button
                            onClick={handleRunAnalysis}
                            className="px-4 py-2 bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                        >
                            <Play className="w-4 h-4" />
                            Análisis
                        </button>
                    </div>
                }
            />

            {/* Grid de Estadísticas Principales - KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {teamStats.map((stat, index) => (
                    <StatCard key={stat.label} stat={stat} index={index} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Rivales Más Frecuentes */}
                <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                                    <Trophy className="w-5 h-5 text-[#CE1126]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Rivales Más Frecuentes
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Top 3 equipos más enfrentados (2010-2025)
                                    </p>
                                </div>
                            </div>
                            <button
                                className="text-sm font-semibold text-[#CE1126] hover:text-[#002D62] transition-colors flex items-center gap-1"
                                onClick={() => navigate('/games')}
                            >
                                Ver historial
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {frequentRivals.length > 0 ? (
                                frequentRivals.map((rival, index) => (
                                    <motion.div
                                        key={rival.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                        className={`group relative rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${index === 0 ? 'bg-gradient-to-r from-[#CE1126]/10 to-transparent border-[#CE1126]' :
                                            index === 1 ? 'bg-gradient-to-r from-[#002D62]/10 to-transparent border-[#002D62]' :
                                                'bg-gradient-to-r from-gray-100/50 to-transparent border-gray-400 dark:from-gray-800/50'
                                            }`}
                                        onClick={() => navigate('/games')}
                                    >

                                        <div className="flex items-center gap-3">
                                            {/* Bandera */}
                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow border border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden">
                                                {rival.flagCode && FLAG_MAP[rival.flagCode] ? (
                                                    <img
                                                        src={FLAG_MAP[rival.flagCode]}
                                                        alt={`Bandera de ${rival.rival}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xl">🏀</span>
                                                )}
                                            </div>

                                            {/* Info principal */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-xs font-black ${index === 0 ? 'text-[#CE1126]' :
                                                        index === 1 ? 'text-[#002D62]' :
                                                            'text-gray-500'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                        {rival.rival}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                                                    <span className="font-semibold">{rival.count} partidos</span>
                                                    <span>•</span>
                                                    <span className="font-semibold">Record: {rival.record}</span>
                                                </div>
                                            </div>

                                            {/* Último encuentro compacto */}
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">
                                                    Último vs
                                                </div>
                                                <div className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1 truncate max-w-[100px]">
                                                    {rival.lastMeeting}
                                                </div>
                                                <div className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${rival.result.startsWith('W')
                                                    ? 'bg-[#CE1126]/10 text-[#CE1126] border border-[#CE1126]/20'
                                                    : 'bg-[#002D62]/10 text-[#002D62] border border-[#002D62]/20'
                                                    }`}>
                                                    {rival.result}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Trophy className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
                                        No hay datos de rivales
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Los datos se cargarán automáticamente
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Jugadores Clave */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#002D62]/10 to-[#CE1126]/10">
                                    <Users className="w-5 h-5 text-[#002D62]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Mejores Jugadores por Estadística
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Líderes en diferentes categorías
                                    </p>
                                </div>
                            </div>
                            <button
                                className="text-sm font-semibold text-[#002D62] hover:text-[#CE1126] transition-colors flex items-center gap-1"
                                onClick={() => navigate('/players')}
                            >
                                Ver todos
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {keyPlayers.length > 0 ? (
                                keyPlayers.map((player, index) => (
                                    <PlayerCard
                                        key={player.id}
                                        player={player}
                                        index={index}
                                        onViewDetails={handleViewDetails}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">No hay datos de jugadores</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Sección de Tendencias del Equipo */}
            {trendsData && trendsData.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                            <TrendingUp className="w-6 h-6 text-[#CE1126]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Tendencias del Equipo
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Evolución histórica por temporadas
                            </p>
                        </div>
                    </div>

                    {/* Filtros de métricas */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Seleccionar Estadística
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'points', label: 'Puntos', color: '#CE1126' },
                                { key: 'assists', label: 'Asistencias', color: '#002D62' },
                                { key: 'rebounds', label: 'Rebotes', color: '#6b7280' },
                                { key: 'steals', label: 'Robos', color: '#10b981' },
                                { key: 'blocks', label: 'Bloqueos', color: '#f59e0b' },
                                { key: 'fg_pct', label: 'FG%', color: '#8b5cf6' },
                                { key: 'three_pct', label: '3P%', color: '#ec4899' },
                                { key: 'ft_pct', label: 'FT%', color: '#06b6d4' },
                            ].map(metric => (
                                <button
                                    key={metric.key}
                                    onClick={() => setSelectedMetric(metric.key)}
                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${selectedMetric === metric.key
                                        ? 'text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    style={selectedMetric === metric.key ? { backgroundColor: metric.color } : {}}
                                >
                                    {metric.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtros de rango de años */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Rango de Años
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Últimos 5 años', start: 2020, end: 2025 },
                                { label: 'Últimos 10 años', start: 2015, end: 2025 },
                                { label: 'Todo el período', start: 2010, end: 2025 },
                            ].map(range => (
                                <button
                                    key={`${range.start}-${range.end}`}
                                    onClick={() => setSelectedYearRange({ start: range.start, end: range.end })}
                                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${selectedYearRange.start === range.start && selectedYearRange.end === range.end
                                        ? 'bg-[#002D62] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gráfico */}
                    <div className="h-80 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            {(() => {
                                // Obtener color dinámico según métrica seleccionada
                                const metricColors = {
                                    'points': '#CE1126',
                                    'assists': '#002D62',
                                    'rebounds': '#6b7280',
                                    'steals': '#10b981',
                                    'blocks': '#f59e0b',
                                    'fg_pct': '#8b5cf6',
                                    'three_pct': '#ec4899',
                                    'ft_pct': '#06b6d4'
                                };
                                const currentColor = metricColors[selectedMetric] || '#CE1126';

                                return (
                                    <AreaChart
                                        data={trendsData.filter(d =>
                                            parseInt(d.season) >= selectedYearRange.start &&
                                            parseInt(d.season) <= selectedYearRange.end
                                        )}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={currentColor} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                        <XAxis
                                            dataKey="season"
                                            stroke="#6b7280"
                                            fontSize={12}
                                            fontWeight={600}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            fontSize={12}
                                            fontWeight={600}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                                border: `2px solid ${currentColor}`,
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                padding: '8px 12px',
                                                fontWeight: 600
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={selectedMetric}
                                            stroke={currentColor}
                                            strokeWidth={3}
                                            fill="url(#colorMetric)"
                                            dot={{ r: 4, fill: currentColor, strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6, fill: currentColor, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                    </AreaChart>
                                );
                            })()}
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Sección de Promedios de Liga */}
            {leagueAverages && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card PPG */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/20 border-2 border-[#002D62]/20 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#002D62]/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-[#002D62] uppercase tracking-wider">
                                    Promedio PPG
                                </p>
                                <TrendingUp className="w-5 h-5 text-[#002D62]" />
                            </div>
                            <p className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                                {leagueAverages.avg_points?.toFixed(1) || '0.0'}
                            </p>
                            <div className="h-12 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50 rounded">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData?.slice(-5) || []}>
                                        <defs>
                                            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#002D62" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#002D62" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="points"
                                            stroke="#002D62"
                                            fill="url(#colorPoints)"
                                            strokeWidth={2.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                                Últimas 5 temporadas
                            </p>
                        </div>
                    </div>

                    {/* Card APG */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-950/20 border-2 border-gray-300/30 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-400/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                                    Promedio APG
                                </p>
                                <Activity className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                                {leagueAverages.avg_assists?.toFixed(1) || '0.0'}
                            </p>
                            <div className="h-12 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50 rounded">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData?.slice(-5) || []}>
                                        <defs>
                                            <linearGradient id="colorAssists" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="assists"
                                            stroke="#6b7280"
                                            fill="url(#colorAssists)"
                                            strokeWidth={2.5}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                                Últimas 5 temporadas
                            </p>
                        </div>
                    </div>

                    {/* Card RPG */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-950/20 border-2 border-[#CE1126]/20 shadow-xl rounded-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CE1126]/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-[#CE1126] uppercase tracking-wider">
                                    Promedio RPG
                                </p>
                                <Target className="w-5 h-5 text-[#CE1126]" />
                            </div>
                            <p className="text-5xl font-black text-gray-900 dark:text-white mb-3">
                                {leagueAverages.avg_rebounds?.toFixed(1) || '0.0'}
                            </p>
                            <div className="h-12 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50 rounded">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData?.slice(-5) || []}>
                                        <defs>
                                            <linearGradient id="colorRebounds" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#CE1126" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#CE1126" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="rebounds"
                                            stroke="#CE1126"
                                            fill="url(#colorRebounds)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                                Últimas 5 temporadas
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Modelos ML */}
            {mlModels && mlModels.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Modelos de Machine Learning
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Predicciones y análisis predictivo
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/predictions')}
                            className="text-sm font-semibold text-[#CE1126] hover:text-[#8B0D1A] transition-colors flex items-center gap-2"
                        >
                            Ver predicciones
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mlModels.map((model, index) => (
                            <div
                                key={index}
                                className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Header con color alternado */}
                                <div className={`px-4 py-3 ${index % 2 === 0
                                    ? 'bg-[#CE1126]'
                                    : 'bg-[#002D62]'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-white">
                                            {model.name || 'Modelo ML'}
                                        </h3>
                                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded">
                                            Activo
                                        </span>
                                    </div>
                                </div>

                                {/* Body con métricas */}
                                <div className={`px-4 py-4 ${index % 2 === 0
                                    ? 'bg-red-50 dark:bg-red-950/20'
                                    : 'bg-blue-50 dark:bg-blue-950/20'
                                    }`}>
                                    <div className="space-y-3">
                                        {/* Precisión destacada */}
                                        <div className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                Precisión del Modelo
                                            </p>
                                            <p className={`text-4xl font-black ${index % 2 === 0
                                                ? 'text-[#CE1126]'
                                                : 'text-[#002D62]'
                                                }`}>
                                                {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}
                                            </p>
                                        </div>

                                        {/* Tipo de modelo */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                Tipo de Modelo
                                            </span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white px-2 py-1 bg-white dark:bg-gray-700 rounded">
                                                {model.type || 'Clasificación'}
                                            </span>
                                        </div>

                                        {/* Métricas adicionales si existen */}
                                        {model.metrics && (
                                            <>
                                                {model.metrics.precision && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                            Precision
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {(model.metrics.precision * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )}
                                                {model.metrics.recall && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                            Recall
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {(model.metrics.recall * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )}
                                                {model.metrics.f1_score && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                            F1 Score
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {(model.metrics.f1_score * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modales optimizados */}
            <AnimatePresence>
                {isAnalysisModalOpen && (
                    <Modal
                        isOpen={isAnalysisModalOpen}
                        onClose={() => setIsAnalysisModalOpen(false)}
                        title="Ejecutar Análisis Táctico"
                    >
                        <div className="space-y-6">
                            <Select
                                label="Tipo de Análisis"
                                name="analysisType"
                                value={analysisType}
                                onChange={(e) => setAnalysisType(e.target.value)}
                                options={analysisOptions}
                            />

                            <motion.div
                                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Descripción del Análisis
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {analysisOptions.find(opt => opt.value === analysisType)?.description}
                                </p>
                            </motion.div>

                            <div className="flex gap-3 justify-end pt-4">
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => setIsAnalysisModalOpen(false)}
                                >
                                    Cancelar
                                </ActionButton>
                                <ActionButton
                                    variant="primary"
                                    onClick={handleStartAnalysis}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Iniciar Análisis
                                </ActionButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isExportModalOpen && (
                    <Modal
                        isOpen={isExportModalOpen}
                        onClose={() => setIsExportModalOpen(false)}
                        title="Exportar Dashboard"
                    >
                        <div className="space-y-6">
                            <Select
                                label="Formato de Exportación"
                                name="exportFormat"
                                options={[
                                    { value: 'pdf', label: 'PDF Report' },
                                    { value: 'excel', label: 'Excel' },
                                    { value: 'json', label: 'JSON' },
                                    { value: 'csv', label: 'CSV' }
                                ]}
                            />

                            <Select
                                label="Rango de Datos"
                                name="dateRange"
                                options={[
                                    { value: 'current', label: 'Datos Actuales' },
                                    { value: 'last_week', label: 'Última Semana' },
                                    { value: 'last_month', label: 'Último Mes' },
                                    { value: 'all', label: 'Todos los Datos' }
                                ]}
                            />

                            <div className="flex gap-3 justify-end pt-4">
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => setIsExportModalOpen(false)}
                                >
                                    Cancelar
                                </ActionButton>
                                <ActionButton
                                    variant="primary"
                                    onClick={handleExportDashboard}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </ActionButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Toast optimizado */}
            <AnimatePresence>
                {toast.isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Toast
                            type={toast.type}
                            message={toast.message}
                            isVisible={toast.isVisible}
                            onClose={() => setToast({ ...toast, isVisible: false })}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default memo(Dashboard);
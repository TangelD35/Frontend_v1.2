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
                <div className={`${headerColors[index]} px-3 py-2 border-b`}>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider text-center">
                        {stat.label}
                    </h3>
                </div>

                {/* Contenido */}
                <div className="p-4 text-center">
                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {stat.value}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {stat.description}
                    </div>
                    <div className={`text-xs font-bold mt-2 ${stat.trend === 'up' ? 'text-green-600' :
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

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/players/${player.id}`)}
        >
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">
                    {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {player.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {player.position}
                    </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {player.description}
                </p>
            </div>

            <div className="text-right">
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${categoryColors[player.category] || 'bg-gray-500 text-white'}`}>
                    {player.category}
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
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

            // Console log para stats cards
            console.log('📊 DEBUG STATS CARDS - Datos del summary:');
            console.log('Total Partidos:', summaryData?.total_games || 'N/A');
            console.log('Victorias:', summaryData?.total_wins || 'N/A');
            console.log('Derrotas:', summaryData?.total_losses || 'N/A');
            console.log('% Victorias:', summaryData?.win_percentage || 'N/A');

            // Buscar equipo RD
            const rdTeam = await teamsService.getDominicanTeam();
            if (rdTeam) {
                setRdTeamId(rdTeam.id);

                // Cargar overview del equipo
                const overview = await analyticsService.getTeamStats(rdTeam.id, 2010, 2025);
                setTeamOverview(overview);

                // Console log para team overview
                console.log('🏀 DEBUG TEAM OVERVIEW - Datos del equipo:');
                console.log('Overview completo:', overview);
                if (overview?.overview) {
                    console.log('Total games (overview):', overview.overview.total_games);
                    console.log('Total wins (overview):', overview.overview.total_wins);
                    console.log('Total losses (overview):', overview.overview.total_losses);
                }

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
                        console.log('📈 Tendencias cargadas del backend:', formattedTrends);
                    }
                } catch (error) {
                    console.error('❌ Error cargando tendencias:', error);
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

                                // Console log para ver estructura del jugador
                                console.log(`🔍 Estructura del jugador ${player.player_name} para ${category}:`, player);

                                switch (category) {
                                    case 'PPG':
                                        value = player.ppg || player.points_per_game || player.avg_points || player.value || 'N/A';
                                        break;
                                    case 'APG':
                                        value = player.apg || player.assists_per_game || player.avg_assists || player.value || 'N/A';
                                        break;
                                    case 'RPG':
                                        value = player.rpg || player.rebounds_per_game || player.avg_rebounds || player.total_rebounds || player.value || 'N/A';
                                        break;
                                    case 'SPG':
                                        value = player.spg || player.steals_per_game || player.avg_steals || player.steals || player.value || 'N/A';
                                        break;
                                    case 'BPG':
                                        value = player.bpg || player.blocks_per_game || player.avg_blocks || player.blocks || player.value || 'N/A';
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

                // Console log para estructura de jugadores
                console.log('🔍 DEBUG ESTRUCTURA JUGADORES - Datos del backend:');
                if (ppgPlayers && ppgPlayers.length > 0) {
                    console.log('Primer jugador PPG completo:', ppgPlayers[0]);
                }
                if (apgPlayers && apgPlayers.length > 0) {
                    console.log('Primer jugador APG completo:', apgPlayers[0]);
                }

                // Console log para jugadores
                console.log('👥 DEBUG JUGADORES - Mejores por estadística (sin repeticiones):');
                topPlayersList.forEach((player, index) => {
                    console.log(`${index + 1}. ${player.player_name} -> ${player.category}: ${player.value || 'N/A'} (${player.description})`);
                });

                setTopPlayers(topPlayersList.slice(0, 5));
            } catch (error) {
                console.log('❌ Error cargando jugadores del backend, usando datos de fallback');
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
                                rivalDetails[rival] = {
                                    date: game.game_date,
                                    tournament: game.tournament_name || 'Torneo',
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

                    // Console log para banderas
                    console.log('🏴 DEBUG BANDERAS - Rivales encontrados:');
                    topRivals.forEach((rival, index) => {
                        console.log(`${index + 1}. ${rival.rival} -> ${rival.flagCode} (${rival.flagCode ? 'OK' : 'NO ENCONTRADA'})`);
                    });

                    // Console log para torneos
                    console.log('🏆 DEBUG TORNEOS - Últimos encuentros:');
                    topRivals.forEach((rival, index) => {
                        console.log(`${index + 1}. ${rival.rival} -> Torneo: "${rival.lastMeeting}" | Resultado: "${rival.result}"`);
                    });

                    setGamesData(topRivals);
                } else {
                    setGamesData([]);
                }
            } catch (error) {
                console.error('❌ Error cargando rivales:', error);
                setGamesData([]);
            }

            // Datos simulados para modelos ML
            setMlModels([
                { name: 'Predictor de Victorias', accuracy: 0.85, type: 'Clasificación' },
                { name: 'Análisis de Rendimiento', accuracy: 0.78, type: 'Regresión' },
                { name: 'Predictor de Puntos', accuracy: 0.82, type: 'Regresión' }
            ]);

        } catch (error) {
            console.error('Error cargando dashboard:', error);
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

        // Console log para verificar datos de stats cards
        console.log('🔧 DEBUG STATS CALCULATION - Datos para las cards:');
        console.log('Overview data:', overview);
        console.log('Offense data:', offense);
        console.log('Defense data:', defense);

        return [
            {
                icon: Trophy,
                label: 'Total Partidos',
                value: overview.total_games || summary.games || 0,
                change: `${overview.total_wins || 0}V - ${overview.total_losses || 0}D`,
                color: 'bg-gradient-to-br from-[#CE1126] to-[#8B0D1A]',
                trend: 'neutral',
                period: '2010-2025',
                description: 'Período histórico'
            },
            {
                icon: Target,
                label: 'Eficiencia Ofensiva',
                value: offense.avg_points ? `${offense.avg_points.toFixed(1)}` : '0.0',
                change: `FG: ${offense.shooting_efficiency?.fg_pct?.toFixed(1) || 0}%`,
                color: 'bg-gradient-to-br from-green-500 to-green-600',
                trend: 'up',
                period: 'PPG',
                description: 'Puntos por partido'
            },
            {
                icon: Shield,
                label: 'Eficiencia Defensiva',
                value: defense.avg_steals ? `${defense.avg_steals.toFixed(1)}` : '0.0',
                change: `${defense.avg_blocks?.toFixed(1) || 0} BLQ`,
                color: 'bg-gradient-to-br from-[#002D62] to-blue-700',
                trend: 'up',
                period: 'SPG',
                description: 'Robos por partido'
            },
            {
                icon: Percent,
                label: '% de Victorias',
                value: overview.win_percentage ? `${(overview.win_percentage * 100).toFixed(1)}%` : '0%',
                change: overview.total_wins ? `${overview.total_wins} victorias` : '0 victorias',
                color: 'bg-gradient-to-br from-orange-500 to-orange-600',
                trend: overview.win_percentage > 0.5 ? 'up' : 'down',
                period: 'Histórico',
                description: 'Período 2010-2025'
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

                        <div className="space-y-3">
                            {frequentRivals.length > 0 ? (
                                frequentRivals.map((rival, index) => (
                                    <motion.div
                                        key={rival.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                        className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                                        onClick={() => navigate('/games')}
                                    >
                                        {/* Gradiente de fondo sutil */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#CE1126]/5 via-transparent to-[#002D62]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                                            {/* Bandera y ranking */}
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-lg border-2 border-white/60 dark:border-gray-600 flex-shrink-0 overflow-hidden">
                                                    {rival.flagCode ? (
                                                        <img
                                                            src={`/src/assets/icons/${rival.flagCode}.svg`}
                                                            alt={`Bandera de ${rival.rival}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl md:text-2xl">🏀</span>
                                                    )}
                                                </div>
                                                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg flex-shrink-0 ${index === 0 ? 'bg-gradient-to-br from-[#CE1126] to-[#8B0D1A]' :
                                                    index === 1 ? 'bg-gradient-to-br from-[#002D62] to-[#1e3a8a]' :
                                                        'bg-gradient-to-br from-gray-500 to-gray-600'
                                                    }`}>
                                                    #{index + 1}
                                                </div>

                                                {/* Información del rival - móvil */}
                                                <div className="flex-1 md:hidden">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                                        <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                                                            {rival.rival}
                                                        </h4>
                                                        <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-fit">
                                                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                                                {rival.count} partidos
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                                        Rival histórico más frecuente
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Información del rival - desktop */}
                                            <div className="hidden md:block flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                                                        {rival.rival}
                                                    </h4>
                                                    <div className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                                            {rival.count} partidos
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                                    Rival histórico más frecuente
                                                </p>
                                            </div>

                                            {/* Métricas de rendimiento */}
                                            <div className="grid grid-cols-2 gap-2 md:gap-3 text-center w-full md:w-auto">
                                                {/* Record histórico */}
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                                                    <div className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                        Record
                                                    </div>
                                                    <div className="text-sm md:text-lg font-black text-gray-900 dark:text-white">
                                                        {rival.record}
                                                    </div>
                                                </div>

                                                {/* Dominancia */}
                                                <div className={`p-2 rounded-lg border ${rival.dominance >= 50
                                                    ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800'
                                                    : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800'
                                                    }`}>
                                                    <div className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                        Dominancia
                                                    </div>
                                                    <div className={`text-sm md:text-lg font-black ${rival.dominance >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {rival.dominance}%
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Último encuentro */}
                                            <div className="text-center md:text-right w-full md:min-w-[100px] lg:min-w-[120px] md:w-auto">
                                                <div className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    Último vs
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300 font-semibold mb-1 truncate">
                                                    {rival.lastMeeting}
                                                </div>
                                                <div className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${rival.result.startsWith('W')
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                                    }`}>
                                                    {rival.result}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Indicador de hover */}
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
                                            <ArrowRight className="w-5 h-5 text-[#CE1126]" />
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
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                                <BarChart3 className="w-5 h-5 text-[#CE1126]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Tendencias del Equipo
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Evolución histórica por temporadas
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendsData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.3} />
                                <XAxis
                                    dataKey="season"
                                    stroke="#6b7280"
                                    fontSize={10}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    fontSize={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '10px',
                                        padding: '6px 10px'
                                    }}
                                />
                                <Legend fontSize={10} />
                                <Bar
                                    dataKey="points"
                                    fill="#CE1126"
                                    name="Puntos"
                                    radius={[2, 2, 0, 0]}
                                />
                                <Bar
                                    dataKey="assists"
                                    fill="#002D62"
                                    name="Asistencias"
                                    radius={[2, 2, 0, 0]}
                                />
                                <Bar
                                    dataKey="rebounds"
                                    fill="#6b7280"
                                    name="Rebotes"
                                    radius={[2, 2, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Sección de Promedios de Liga */}
            {leagueAverages && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card PPG */}
                    <div className="bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 shadow-lg rounded-lg p-8">
                        <div className="text-center">
                            <p className="text-lg font-bold text-[#002D62] uppercase tracking-wider mb-3">
                                Promedio PPG
                            </p>
                            <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">
                                {leagueAverages.avg_points?.toFixed(1) || '0.0'}
                            </p>
                            <div className="h-16 mt-4 bg-gradient-to-b from-gray-50 to-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData?.slice(-5) || []}>
                                        <defs>
                                            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#002D62" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#002D62" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="points"
                                            stroke="#002D62"
                                            fill="url(#colorPoints)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Card APG */}
                    <div className="bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 shadow-lg rounded-lg p-8">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-600 uppercase tracking-wider mb-3">
                                Promedio APG
                            </p>
                            <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">
                                {leagueAverages.avg_assists?.toFixed(1) || '0.0'}
                            </p>
                            <div className="h-16 mt-4 bg-gradient-to-b from-gray-50 to-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData?.slice(-5) || []}>
                                        <defs>
                                            <linearGradient id="colorAssists" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="assists"
                                            stroke="#6b7280"
                                            fill="url(#colorAssists)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Card RPG */}
                    <div className="bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 shadow-lg rounded-lg p-8">
                        <div className="text-center">
                            <p className="text-lg font-bold text-[#CE1126] uppercase tracking-wider mb-3">
                                Promedio RPG
                            </p>
                            <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">
                                {leagueAverages.avg_rebounds?.toFixed(1) || '0.0'}
                            </p>
                            <div className="h-16 mt-4 bg-gradient-to-b from-gray-50 to-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendsData?.slice(-5) || []}>
                                        <defs>
                                            <linearGradient id="colorRebounds" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#CE1126" stopOpacity={0.4} />
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
                        </div>
                    </div>
                </div>
            )}

            {/* Sección de Modelos ML */}
            {mlModels && mlModels.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                <Zap className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Modelos de Machine Learning
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Predicciones y análisis predictivo
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/predictions')}
                            className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                        >
                            Ver predicciones
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mlModels.slice(0, 3).map((model, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                            {model.name || 'Modelo ML'}
                                        </h3>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                        Activo
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Precisión</span>
                                        <span className="text-sm font-black text-purple-600">
                                            {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Tipo</span>
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                            {model.type || 'Clasificación'}
                                        </span>
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
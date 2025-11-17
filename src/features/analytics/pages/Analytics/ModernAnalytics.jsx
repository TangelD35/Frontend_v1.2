import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Target,
    Users,
    RefreshCw,
    TrendingUp,
    Trophy,
    Shield,
    Award,
    X,
    Activity,
    Zap,
    Eye,
    Crosshair,
    Search
} from 'lucide-react';
// Componente temporal de avatar
const PlayerAvatar = ({ playerName, size = 32, color = '#002D62' }) => {
    const getInitials = (name) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div
            className="rounded-full flex items-center justify-center font-bold text-white"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                fontSize: `${size * 0.4}px`
            }}
        >
            {getInitials(playerName)}
        </div>
    );
};
import BanderaDominicana from '../../../../assets/icons/do.svg';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';

import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { advancedAnalyticsService } from '../../../../shared/api/endpoints/advancedAnalytics';
import { teamsService } from '../../../../shared/api/endpoints/teams';
import { analyticsService } from '../../../../shared/api/endpoints/analytics';
import { playersService } from '../../../../shared/api/endpoints/players';
import LoadingSpinner from '../../../../shared/ui/components/common/feedback/LoadingSpinner';
import ErrorState from '../../../../shared/ui/components/modern/ErrorState/ErrorState';

const ModernAnalytics = () => {
    const {
        leagueAverages,
        teamTrends,
        topPlayers,
        loading: advancedLoading,
        error: advancedError,
        fetchTeamTrends,
        fetchTopPlayers,
        refetch: refetchAdvanced
    } = useAdvancedAnalytics();

    const [activeTab, setActiveTab] = useState('resumen');
    const [trendMetric, setTrendMetric] = useState('puntos');
    const [playerMetric, setPlayerMetric] = useState('ppg');

    // Estados para pestaña de Jugadores
    const [selectedPlayerMetric, setSelectedPlayerMetric] = useState('ppg');
    const [topPlayersData, setTopPlayersData] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [playersPeriod, setPlayersPeriod] = useState({ start: 2010, end: 2025 });
    const [leagueAvg, setLeagueAvg] = useState(null);
    const [rdTeamId, setRdTeamId] = useState(null);
    const [summary, setSummary] = useState(null);

    // Estados para modal de detalles de jugador
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerDetails, setPlayerDetails] = useState(null);
    const [selectedPlayersForComparison, setSelectedPlayersForComparison] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [performanceSearchTerm, setPerformanceSearchTerm] = useState('');
    const [selectedPlayerForRadar, setSelectedPlayerForRadar] = useState(null);

    // Estados para pestaña de Equipos
    const [teamData, setTeamData] = useState(null);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [teamMetric, setTeamMetric] = useState('points_per_game');
    const [teamTrendsData, setTeamTrendsData] = useState(null);

    // Filtrar jugadores basado en el término de búsqueda
    const filteredPlayers = allPlayers.filter(player => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (player.player_name?.toLowerCase().includes(searchLower)) ||
            (player.team?.toLowerCase().includes(searchLower)) ||
            (player.position?.toLowerCase().includes(searchLower))
        );
    }).filter(player => !selectedPlayersForComparison.some(p => p.player_id === player.player_id));

    const performanceFilteredPlayers = allPlayers.filter(player => {
        if (!performanceSearchTerm) return false;
        const searchLower = performanceSearchTerm.toLowerCase();
        return (
            (player.player_name?.toLowerCase().includes(searchLower)) ||
            (player.team?.toLowerCase().includes(searchLower)) ||
            (player.position?.toLowerCase().includes(searchLower))
        );
    });

    // Cargar datos al montar el componente
    useEffect(() => {
        const loadData = async () => {
            try {
                // Cargar summary
                const summaryData = await analyticsService.getSummary();
                setSummary(summaryData);

                // Buscar equipo de República Dominicana (optimizado)
                const rdTeam = await teamsService.getDominicanTeam();

                if (rdTeam) {
                    setRdTeamId(rdTeam.id);
                    // Cargar tendencias del equipo
                    await fetchTeamTrends(rdTeam.id, 2010, 2025);
                }

                // Cargar top jugadores con métrica inicial
                await fetchTopPlayers(playerMetric, 5, 2010, 2025);

            } catch (error) {
                console.error('Error cargando datos de analytics:', error);
            }
        };

        loadData();
    }, [fetchTeamTrends, fetchTopPlayers, playerMetric]);

    // Cargar top jugadores cuando cambia la métrica o período
    useEffect(() => {
        if (activeTab === 'jugadores') {
            loadTopPlayers();
            loadAllPlayers();
            loadLeagueAverages();
        }
    }, [activeTab, selectedPlayerMetric, playersPeriod]);

    // Cargar datos de comparación cuando cambian los jugadores seleccionados
    useEffect(() => {
        const loadComparison = async () => {
            if (selectedPlayersForComparison.length > 0 && activeTab === 'jugadores') {
                await loadComparisonData(selectedPlayersForComparison);
            } else {
                setComparisonData([]);
            }
        };
        loadComparison();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlayersForComparison.map(p => p.player_id).join(','), playersPeriod.start, playersPeriod.end, activeTab]);

    // Cargar datos del equipo cuando se activa la pestaña
    useEffect(() => {
        if (activeTab === 'equipo' && rdTeamId) {
            loadTeamData();
            loadTeamTrends();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, rdTeamId, teamMetric]);

    // Load comparison data with real stats
    const loadComparisonData = async (players) => {
        try {
            setLoadingComparison(true);

            // Get detailed stats for each selected player
            const comparisonStats = await Promise.all(
                players.map(async (player) => {
                    try {
                        const stats = await analyticsService.getPlayerStats(player.player_id);
                        const seasons = await analyticsService.getPlayerSeasons(player.player_id);

                        // El endpoint /analytics/players/{id} devuelve { offense, defense }
                        const offense = stats?.offense || {};
                        const defense = stats?.defense || {};
                        const shooting = offense.shooting_efficiency || {};
                        const playmaking = offense.playmaking || {};
                        const defensiveMetrics = defense.defensive_metrics || {};

                        // Promedios ofensivos/defensivos ya vienen calculados por partido
                        const ppg = typeof offense.average_points === 'number' ? offense.average_points : 0;
                        const apg = typeof playmaking.avg_assists === 'number' ? playmaking.avg_assists : 0;
                        const offReb = typeof playmaking.avg_offensive_rebounds === 'number' ? playmaking.avg_offensive_rebounds : 0;
                        const defReb = typeof defensiveMetrics.avg_defensive_rebounds === 'number' ? defensiveMetrics.avg_defensive_rebounds : 0;
                        const rpg = offReb + defReb;
                        const spg = typeof defensiveMetrics.avg_steals === 'number' ? defensiveMetrics.avg_steals : 0;
                        const bpg = typeof defensiveMetrics.avg_blocks === 'number' ? defensiveMetrics.avg_blocks : 0;

                        let fgPctRaw = typeof shooting.fg_pct === 'number' ? shooting.fg_pct : 0;
                        let threePctRaw = typeof shooting['3p_pct'] === 'number' ? shooting['3p_pct'] : 0;
                        let ftPctRaw = typeof shooting.ft_pct === 'number' ? shooting.ft_pct : 0;

                        // Normalizar porcentajes: si vienen como 0-1, convertir a 0-100; si ya vienen 0-100, mantener
                        if (fgPctRaw > 0 && fgPctRaw <= 1.5) fgPctRaw *= 100;
                        if (threePctRaw > 0 && threePctRaw <= 1.5) threePctRaw *= 100;
                        if (ftPctRaw > 0 && ftPctRaw <= 1.5) ftPctRaw *= 100;

                        // Guardamos porcentajes en rango 0-100; formatMetricValue añade el símbolo
                        const careerAverages = {
                            ppg: ppg.toFixed(1),
                            rpg: rpg.toFixed(1),
                            apg: apg.toFixed(1),
                            spg: spg.toFixed(1),
                            bpg: bpg.toFixed(1),
                            fg_pct: fgPctRaw.toFixed(1),
                            three_pct: threePctRaw.toFixed(1),
                            ft_pct: ftPctRaw.toFixed(1),
                            // Por ahora no tenemos un total de partidos agregados desde este endpoint
                            games_played: 0,
                            seasons: seasons.length || 0,
                            last_season: seasons[seasons.length - 1] || 'N/A'
                        };

                        return {
                            ...player,
                            ...careerAverages,
                            stats,
                            seasons
                        };
                    } catch (error) {
                        console.error(`Error loading comparison data for player ${player.player_id}:`, error);
                        return {
                            ...player,
                            ppg: '0.0',
                            rpg: '0.0',
                            apg: '0.0',
                            spg: '0.0',
                            bpg: '0.0',
                            fg_pct: '0.0',
                            three_pct: '0.0',
                            ft_pct: '0.0',
                            games_played: 0,
                            seasons: 0,
                            last_season: 'N/A'
                        };
                    }
                })
            );

            setComparisonData(comparisonStats);
        } catch (error) {
            console.error('Error loading comparison data:', error);
            setComparisonData([]);
        } finally {
            setLoadingComparison(false);
        }
    };

    const loadRadarPlayerMetrics = async (player) => {
        try {
            const stats = await analyticsService.getPlayerStats(player.player_id);
            const seasons = await analyticsService.getPlayerSeasons(player.player_id);

            const offense = stats?.offense || {};
            const defense = stats?.defense || {};
            const shooting = offense.shooting_efficiency || {};
            const playmaking = offense.playmaking || {};
            const defensiveMetrics = defense.defensive_metrics || {};

            // Valores desde stats por temporada
            let ppg = typeof offense.average_points === 'number' ? offense.average_points : NaN;
            let apg = typeof playmaking.avg_assists === 'number' ? playmaking.avg_assists : NaN;
            const offReb = typeof playmaking.avg_offensive_rebounds === 'number' ? playmaking.avg_offensive_rebounds : NaN;
            const defReb = typeof defensiveMetrics.avg_defensive_rebounds === 'number' ? defensiveMetrics.avg_defensive_rebounds : NaN;
            let rpg = !isNaN(offReb) && !isNaN(defReb) ? offReb + defReb : NaN;
            let spg = typeof defensiveMetrics.avg_steals === 'number' ? defensiveMetrics.avg_steals : NaN;
            let bpg = typeof defensiveMetrics.avg_blocks === 'number' ? defensiveMetrics.avg_blocks : NaN;

            let fgPctRaw = typeof shooting.fg_pct === 'number' ? shooting.fg_pct : NaN;
            if (!isNaN(fgPctRaw) && fgPctRaw > 0 && fgPctRaw <= 1.5) fgPctRaw *= 100;

            // Fallback a métricas ya calculadas en player (mismas que usas en Top 10 / Comparativa)
            const fallbackPPG = Number(player.ppg) || 0;
            const fallbackAPG = Number(player.apg) || 0;
            const fallbackRPG = Number(player.rpg) || 0;
            const fallbackSPG = Number(player.spg) || 0;
            const fallbackBPG = Number(player.bpg) || 0;
            const fallbackFG = Number(player.fg_pct) || 0;
            const fallbackPER = Number(player.per) || 0;

            ppg = !isNaN(ppg) && ppg > 0 ? ppg : fallbackPPG;
            apg = !isNaN(apg) && apg > 0 ? apg : fallbackAPG;
            rpg = !isNaN(rpg) && rpg > 0 ? rpg : fallbackRPG;
            spg = !isNaN(spg) && spg >= 0 ? spg : fallbackSPG;
            bpg = !isNaN(bpg) && bpg >= 0 ? bpg : fallbackBPG;
            fgPctRaw = !isNaN(fgPctRaw) && fgPctRaw > 0 ? fgPctRaw : fallbackFG;
            const per = fallbackPER;

            return {
                ...player,
                ppg,
                apg,
                rpg,
                spg,
                bpg,
                fg_pct: fgPctRaw,
                per,
                games_played: stats?.games_played || player.games_played || 0,
                seasons: seasons?.length || player.seasons || 0
            };
        } catch (error) {
            console.error('Error loading radar metrics for player', player.player_id, error);
            return player;
        }
    };

    const loadTopPlayers = async () => {
        try {
            setLoadingPlayers(true);
            const data = await advancedAnalyticsService.getTopPlayers(
                selectedPlayerMetric,
                10,
                playersPeriod.start,
                playersPeriod.end
            );
            setTopPlayersData(data || []);
        } catch (error) {
            console.error('Error loading top players:', error);
            setTopPlayersData([]);
        } finally {
            setLoadingPlayers(false);
        }
    };

    const loadAllPlayers = async () => {
        try {
            setLoadingPlayers(true);
            const response = await playersService.getAll({
                limit: 500,
                order_by: 'full_name'
            });

            const playersData = response.items || response;

            const mappedPlayers = playersData.map(player => ({
                player_id: player.id || player.player_id,
                player_name: player.full_name || player.player_name || player.name,
                position: player.position || 'N/A',
                team: player.team || 'N/A',
                ppg: player.ppg || 0,
                apg: player.apg || 0,
                rpg: player.rpg || 0,
                spg: player.spg || 0,
                bpg: player.bpg || 0,
                fg_pct: player.fg_pct || 0,
                three_pct: player.three_pct || 0,
                ft_pct: player.ft_pct || 0,
                per: player.per || 0
            }));

            setAllPlayers(mappedPlayers);

            // Cargar automáticamente los primeros 4 jugadores para la comparación
            if (mappedPlayers.length > 0) {
                setSelectedPlayersForComparison(prev => {
                    // Solo actualizar si no hay jugadores seleccionados
                    return prev.length === 0 ? mappedPlayers.slice(0, 4) : prev;
                });
            }
        } catch (error) {
            setAllPlayers([]);
        } finally {
            setLoadingPlayers(false);
        }
    };

    const togglePlayerForComparison = (player) => {
        setSelectedPlayersForComparison(prev => {
            const alreadySelected = prev.some(p => p.player_id === player.player_id);

            if (alreadySelected) {
                return prev.filter(p => p.player_id !== player.player_id);
            }

            if (prev.length >= 4) {
                console.warn('Máximo de 4 jugadores para comparación alcanzado.');
                return prev;
            }

            return [...prev, player];
        });
    };

    // Helper function to load player data with retry logic
    const loadPlayerWithRetry = async (player, maxRetries = 2) => {
        let retries = 0;

        while (retries <= maxRetries) {
            try {
                const [stats, seasons] = await Promise.all([
                    analyticsService.getPlayerStats(player.id || player.player_id),
                    analyticsService.getPlayerSeasons(player.id || player.player_id)
                ]);

                // Calculate career averages if we have stats
                let careerAverages = {};
                if (stats && typeof stats === 'object') {
                    const totalGames = stats.games_played || 1; // Avoid division by zero
                    careerAverages = {
                        ppg: (stats.points / totalGames).toFixed(1),
                        rpg: (stats.rebounds / totalGames).toFixed(1),
                        apg: (stats.assists / totalGames).toFixed(1),
                        spg: ((stats.steals || 0) / totalGames).toFixed(1),
                        bpg: ((stats.blocks || 0) / totalGames).toFixed(1),
                        fg_pct: stats.fg_pct ? (stats.fg_pct * 100).toFixed(1) : '0.0',
                        three_pct: stats.three_pct ? (stats.three_pct * 100).toFixed(1) : '0.0',
                        ft_pct: stats.ft_pct ? (stats.ft_pct * 100).toFixed(1) : '0.0',
                        games_played: stats.games_played || 0,
                        seasons: seasons?.length || 0,
                        last_season: seasons?.[seasons.length - 1] || 'N/A'
                    };
                }

                return {
                    ...player,
                    player_id: player.id || player.player_id,
                    player_name: player.full_name || player.player_name || player.name,
                    position: player.position || 'N/A',
                    stats: stats || {},
                    careerAverages,
                    years_played: seasons?.length || 0,
                    last_season: seasons?.[seasons.length - 1] || 'N/A'
                };
            } catch (error) {
                retries++;
                console.warn(`Attempt ${retries} failed for player ${player.id || player.player_id}:`, error);

                if (retries > maxRetries) {
                    console.error(`Max retries (${maxRetries}) exceeded for player ${player.id || player.player_id}`);
                    return {
                        ...player,
                        player_id: player.id || player.player_id,
                        player_name: player.full_name || player.player_name || player.name,
                        position: player.position || 'N/A',
                        stats: {},
                        careerAverages: {},
                        years_played: 0,
                        last_season: 'N/A',
                        error: 'Error loading player data'
                    };
                }

                // Exponential backoff
                const delay = 1000 * Math.pow(2, retries);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    const loadLeagueAverages = async () => {
        try {
            const data = await advancedAnalyticsService.getLeagueAverages(
                playersPeriod.start,
                playersPeriod.end
            );
            setLeagueAvg(data || null);
        } catch (error) {
            console.error('Error loading league averages:', error);
            setLeagueAvg(null);
        }
    };

    // Funciones para pestaña de Equipos
    const loadTeamData = async () => {
        if (!rdTeamId) return;

        setLoadingTeam(true);
        try {
            const data = await analyticsService.getTeamStats(rdTeamId, 2010, 2025);
            setTeamData(data);
        } catch (error) {
            setTeamData(null);
        } finally {
            setLoadingTeam(false);
        }
    };

    const loadTeamTrends = async () => {
        if (!rdTeamId) return;

        try {
            const response = await analyticsService.getTrends({
                type: 'team',
                metric: teamMetric,
                ids: rdTeamId
            });
            if (response.trends && response.trends.length > 0) {
                setTeamTrendsData(response.trends[0]);
            }
        } catch (error) {
            setTeamTrendsData(null);
        }
    };

    const getTeamMetricLabel = (metric) => {
        const labels = {
            'points_per_game': 'Puntos por Juego',
            'assists_per_game': 'Asistencias por Juego',
            'rebounds_per_game': 'Rebotes por Juego',
            'efficiency': 'Eficiencia',
            'wins': 'Victorias',
            'field_goals_percentage': 'Porcentaje de Campo',
            'three_point_percentage': 'Porcentaje de Triples'
        };
        return labels[metric] || metric;
    };

    const getMetricConfig = (metric) => {
        const configs = {
            ppg: { label: 'Puntos por Juego', color: '#CE1126', icon: Target, unit: 'PPG' },
            apg: { label: 'Asistencias por Juego', color: '#002D62', icon: Users, unit: 'APG' },
            rpg: { label: 'Rebotes por Juego', color: '#CE1126', icon: TrendingUp, unit: 'RPG' },
            spg: { label: 'Robos por Juego', color: '#002D62', icon: Shield, unit: 'SPG' },
            bpg: { label: 'Bloqueos por Juego', color: '#CE1126', icon: Award, unit: 'BPG' },
            per: { label: 'Player Efficiency Rating', color: '#002D62', icon: Trophy, unit: 'PER' },
            fg_pct: { label: 'Porcentaje de Campo', color: '#CE1126', icon: Target, unit: 'FG%' },
            three_pct: { label: 'Porcentaje de Triples', color: '#002D62', icon: Target, unit: '3P%' },
            ft_pct: { label: 'Porcentaje de Tiros Libres', color: '#CE1126', icon: Target, unit: 'FT%' },
            games_played: { label: 'Partidos Jugados', color: '#002D62', icon: Activity, unit: 'PJ' },
            seasons: { label: 'Temporadas Analizadas', color: '#CE1126', icon: TrendingUp, unit: 'TEMP' },
            last_season: { label: 'Última Temporada', color: '#002D62', icon: Eye, unit: '' }
        };
        return configs[metric] || configs.ppg;
    };

    const formatMetricValue = (value, metric) => {
        // Manejar valores nulos, indefinidos o strings vacíos
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        // Para last_season, devolver el valor tal cual
        if (metric === 'last_season') {
            return typeof value === 'string' ? value : String(value);
        }

        // Si el valor ya es un string que termina en %, devolverlo tal cual
        if (typeof value === 'string' && value.endsWith('%')) {
            return value;
        }

        // Convertir a número si es un string que puede convertirse
        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

        // Si no es un número válido después de la conversión
        if (isNaN(numValue)) {
            return 'N/A'; // Devolver N/A si no se puede convertir a número
        }

        // Manejo especial para porcentajes
        const percentageMetrics = ['fg_pct', 'three_pct', 'ft_pct'];
        if (percentageMetrics.includes(metric)) {
            return `${numValue.toFixed(1)}%`;
        }

        // Métricas que deben mostrarse como enteros
        const integerMetrics = ['games_played', 'seasons'];
        if (integerMetrics.includes(metric)) {
            return numValue.toFixed(0);
        }

        // Para otros valores numéricos, formatear con 1 decimal
        return numValue.toFixed(1);
    };

    // Función para calcular distribución de posiciones
    const calculatePositionDistribution = () => {
        if (!topPlayersData || topPlayersData.length === 0) return [];

        // Función para normalizar posiciones españolas a categorías
        const normalizePosition = (position) => {
            if (!position) return 'Otro';
            const pos = position.toLowerCase();

            // Detectar posición primaria
            if (pos.includes('base') || pos.includes('pg')) return 'Base';
            if (pos.includes('escolta') || pos.includes('sg')) return 'Escolta';
            if (pos.includes('alero') && !pos.includes('pívot')) return 'Alero';
            if (pos.includes('ala-pívot') || pos.includes('ala-pivot') || (pos.includes('ala') && pos.includes('pívot'))) return 'Ala-Pívot';
            if (pos.includes('pívot') || pos.includes('pivot') || pos.includes('center')) return 'Pívot';

            return 'Otro';
        };

        const positionColors = {
            'Base': '#CE1126',
            'Escolta': '#002D62',
            'Alero': '#d4af37',
            'Ala-Pívot': '#E57373',
            'Pívot': '#4A77C5',
            'Otro': '#D0D4DA'
        };

        // Contar jugadores por posición normalizada
        const counts = topPlayersData.reduce((acc, player) => {
            const normalized = normalizePosition(player.position);
            acc[normalized] = (acc[normalized] || 0) + 1;
            return acc;
        }, {});

        // Convertir a formato para PieChart
        return Object.entries(counts)
            .filter(([pos]) => pos !== 'Otro' || counts[pos] > 0)
            .map(([position, count]) => ({
                name: position,
                value: count,
                color: positionColors[position]
            }))
            .sort((a, b) => b.value - a.value);
    };

    // Componente para avatar de jugador con fallback automático a múltiples extensiones
    const PlayerAvatar = ({ playerName, color, size = 9 }) => {
        const [currentExtIndex, setCurrentExtIndex] = useState(0);
        const [showFallback, setShowFallback] = useState(false);
        const extensions = ['webp', 'avif', 'png', 'jpg', 'jpeg'];

        const basePath = '/images/jugadores/';
        const currentSrc = showFallback ? null : `${basePath}${playerName}.${extensions[currentExtIndex]}`;

        const handleImageError = () => {
            // Intentar siguiente extensión
            if (currentExtIndex < extensions.length - 1) {
                setCurrentExtIndex(prev => prev + 1);
            } else {
                // Ya intentamos todas las extensiones, mostrar fallback
                setShowFallback(true);
            }
        };

        if (showFallback || !playerName) {
            return (
                <div
                    className={`rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md`}
                    style={{ backgroundColor: color, width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
                >
                    {playerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'N/A'}
                </div>
            );
        }

        return (
            <img
                src={currentSrc}
                alt={playerName}
                className={`rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md`}
                style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
                onError={handleImageError}
            />
        );
    };

    // Función para obtener la imagen del jugador (intenta múltiples extensiones)
    const getPlayerImage = (playerName) => {
        if (!playerName) return null;

        // Ruta a carpeta de imágenes de jugadores en public/
        const basePath = '/images/jugadores/';

        // Las imágenes tienen diferentes extensiones, el componente PlayerAvatar
        // intentará cargarlas y hará fallback a iniciales si falla
        // Intentar en orden de calidad/tamaño: webp, avif, png, jpg, jpeg
        const extensions = ['webp', 'avif', 'png', 'jpg', 'jpeg'];

        // Retornar la primera ruta (PlayerAvatar manejará el fallback con onError)
        return `${basePath}${playerName}.${extensions[0]}`;
    };

    // Cargar detalles completos de un jugador usando TODOS los endpoints y calculando promedios históricos
    const loadPlayerDetails = async (player) => {
        try {
            setLoadingDetails(true);
            setSelectedPlayer(player);
            setShowPlayerModal(true);

            // Obtener stats básicas (no depende de temporada)
            const playerStatsPromise = analyticsService.getPlayerStats(player.player_id);

            // PASO 1: Obtener SOLO las temporadas donde el jugador participó (optimización)
            let years = [];
            try {
                years = await analyticsService.getPlayerSeasons(player.player_id);
            } catch (error) {
                // Fallback: intentar con rango completo solo si falla el endpoint
                years = Array.from({ length: 15 }, (_, i) => (2010 + i).toString());
            }

            // Si no hay temporadas, no hacer más peticiones
            if (years.length === 0) {
                const playerStats = await playerStatsPromise;
                setPlayerDetails({
                    basic: player,
                    stats: playerStats,
                    advanced: null,
                    per: null,
                    quickMetrics: null,
                    yearsAnalyzed: 0,
                    yearRange: 'Sin datos'
                });
                return;
            }

            // Helper para agregar delay entre batches (evitar throttling)
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Procesar en batches de 3 años para evitar sobrecarga
            const batchSize = 3;
            const yearlyData = [];

            for (let i = 0; i < years.length; i += batchSize) {
                const batchYears = years.slice(i, i + batchSize);

                const batchPromises = batchYears.map(async (year) => {
                    const [advancedStats, perData, quickMetrics] = await Promise.allSettled([
                        advancedAnalyticsService.getPlayerAdvancedStats(player.player_id, year),
                        advancedAnalyticsService.getPlayerPER(player.player_id, year),
                        advancedAnalyticsService.getPlayerQuickMetrics(player.player_id, year)
                    ]);

                    return {
                        year,
                        advanced: advancedStats.status === 'fulfilled' ? advancedStats.value : null,
                        per: perData.status === 'fulfilled' ? perData.value : null,
                        quickMetrics: quickMetrics.status === 'fulfilled' ? quickMetrics.value : null
                    };
                });

                const batchResults = await Promise.all(batchPromises);
                yearlyData.push(...batchResults);

                // Update UI with current progress

                // Add delay between batches if not the last batch
                if (i + batchSize < years.length) {
                    await delay(100);
                }
            }

            // Esperar stats básicas
            const playerStats = await playerStatsPromise;

            // Filtrar solo años con datos válidos
            const validYears = yearlyData.filter(data =>
                data.advanced || data.per || data.quickMetrics
            );

            // Calcular promedios de todas las temporadas
            const aggregatedData = calculatePlayerAverages(validYears);

            const details = {
                basic: player,
                stats: playerStats,
                advanced: aggregatedData.advanced,
                per: aggregatedData.per,
                quickMetrics: aggregatedData.quickMetrics,
                yearsAnalyzed: validYears.length,
                yearRange: validYears.length > 0
                    ? `${validYears[0].year}-${validYears[validYears.length - 1].year}`
                    : 'N/A'
            };

            setPlayerDetails(details);

        } catch (error) {
            console.error('❌ Error loading player details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Función para calcular promedios de múltiples temporadas
    const calculatePlayerAverages = (yearlyData) => {
        if (yearlyData.length === 0) return { advanced: null, per: null, quickMetrics: null };

        // Inicializar acumuladores
        const accumulator = {
            quickMetrics: { ts_percentage: [], efg_percentage: [], per: [], usage_rate: [] },
            per: { per: [], season: [] },
            advanced: {
                shooting_efficiency: { ts_percentage: [], efg_percentage: [], fg_percentage: [] },
                scoring: { ppg: [], scoring_efficiency: [] },
                playmaking: { apg: [], ast_to_tov: [] }
            }
        };

        // Acumular datos de cada año
        yearlyData.forEach(data => {
            if (data.quickMetrics) {
                if (data.quickMetrics.ts_percentage) accumulator.quickMetrics.ts_percentage.push(data.quickMetrics.ts_percentage);
                if (data.quickMetrics.efg_percentage) accumulator.quickMetrics.efg_percentage.push(data.quickMetrics.efg_percentage);
                if (data.quickMetrics.per) accumulator.quickMetrics.per.push(data.quickMetrics.per);
                if (data.quickMetrics.usage_rate) accumulator.quickMetrics.usage_rate.push(data.quickMetrics.usage_rate);
            }

            if (data.per && data.per.per) {
                accumulator.per.per.push(data.per.per);
                accumulator.per.season.push(data.year);
            }

            if (data.advanced) {
                if (data.advanced.shooting_efficiency) {
                    if (data.advanced.shooting_efficiency.ts_percentage)
                        accumulator.advanced.shooting_efficiency.ts_percentage.push(data.advanced.shooting_efficiency.ts_percentage);
                    if (data.advanced.shooting_efficiency.efg_percentage)
                        accumulator.advanced.shooting_efficiency.efg_percentage.push(data.advanced.shooting_efficiency.efg_percentage);
                    if (data.advanced.shooting_efficiency.fg_percentage)
                        accumulator.advanced.shooting_efficiency.fg_percentage.push(data.advanced.shooting_efficiency.fg_percentage);
                }
                if (data.advanced.scoring) {
                    if (data.advanced.scoring.ppg) accumulator.advanced.scoring.ppg.push(data.advanced.scoring.ppg);
                    if (data.advanced.scoring.scoring_efficiency)
                        accumulator.advanced.scoring.scoring_efficiency.push(data.advanced.scoring.scoring_efficiency);
                }
                if (data.advanced.playmaking) {
                    if (data.advanced.playmaking.apg) accumulator.advanced.playmaking.apg.push(data.advanced.playmaking.apg);
                    if (data.advanced.playmaking.ast_to_tov)
                        accumulator.advanced.playmaking.ast_to_tov.push(data.advanced.playmaking.ast_to_tov);
                }
            }
        });

        // Función auxiliar para calcular promedio
        const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

        // Calcular promedios
        return {
            quickMetrics: {
                ts_percentage: avg(accumulator.quickMetrics.ts_percentage),
                efg_percentage: avg(accumulator.quickMetrics.efg_percentage),
                per: avg(accumulator.quickMetrics.per),
                usage_rate: avg(accumulator.quickMetrics.usage_rate)
            },
            per: {
                per: avg(accumulator.per.per),
                season: accumulator.per.season.length > 0
                    ? `${accumulator.per.season[0]}-${accumulator.per.season[accumulator.per.season.length - 1]}`
                    : 'N/A'
            },
            advanced: {
                shooting_efficiency: {
                    ts_percentage: avg(accumulator.advanced.shooting_efficiency.ts_percentage),
                    efg_percentage: avg(accumulator.advanced.shooting_efficiency.efg_percentage),
                    fg_percentage: avg(accumulator.advanced.shooting_efficiency.fg_percentage)
                },
                scoring: {
                    ppg: avg(accumulator.advanced.scoring.ppg),
                    scoring_efficiency: avg(accumulator.advanced.scoring.scoring_efficiency)
                },
                playmaking: {
                    apg: avg(accumulator.advanced.playmaking.apg),
                    ast_to_tov: avg(accumulator.advanced.playmaking.ast_to_tov)
                }
            }
        };
    };

    const getRadarSource = () => {
        let source = null;

        if (selectedPlayerForRadar) {
            // Datos provenientes de /players (allPlayers) ya calculados para todos los jugadores
            source = {
                name: selectedPlayerForRadar.player_name,
                ppg: Number(selectedPlayerForRadar.ppg) || 0,
                apg: Number(selectedPlayerForRadar.apg) || 0,
                rpg: Number(selectedPlayerForRadar.rpg) || 0,
                spg: Number(selectedPlayerForRadar.spg) || 0,
                bpg: Number(selectedPlayerForRadar.bpg) || 0,
                per: Number(selectedPlayerForRadar.per) || 0,
                fg_pct: Number(selectedPlayerForRadar.fg_pct) || 0
            };
        } else if (playerDetails) {
            // Fallback: usar los mismos cálculos agregados que servimos en Top 10 / comparativa
            const adv = playerDetails.advanced || {};
            const scoring = adv.scoring || {};
            const playmaking = adv.playmaking || {};
            const shootingAdv = adv.shooting_efficiency || {};
            const defenseMetrics = playerDetails.stats?.defense?.defensive_metrics || {};
            const offense = playerDetails.stats?.offense || {};

            source = {
                name: playerDetails.basic?.player_name || selectedPlayer?.player_name,
                ppg: Number(scoring.ppg) || Number(offense.average_points) || 0,
                apg: Number(playmaking.apg) || Number(offense.playmaking?.avg_assists) || 0,
                rpg: Number(defenseMetrics.avg_total_rebounds) || 0,
                spg: Number(defenseMetrics.avg_steals) || 0,
                bpg: Number(defenseMetrics.avg_blocks) || 0,
                per: Number(playerDetails.quickMetrics?.per || playerDetails.per?.per) || 0,
                fg_pct: Number(shootingAdv.fg_percentage || offense.shooting_efficiency?.fg_pct) || 0
            };
        }

        return source;
    };

    const getRadarPerformanceData = () => {
        const source = getRadarSource();
        if (!source) return [];

        return [
            {
                metric: 'PTS',
                value: Math.min((source.ppg / 30) * 100, 100),
                fullMark: 100
            },
            {
                metric: 'AST',
                value: Math.min((source.apg / 10) * 100, 100),
                fullMark: 100
            },
            {
                metric: 'REB',
                value: Math.min((source.rpg / 15) * 100, 100),
                fullMark: 100
            },
            {
                metric: 'ROB',
                value: Math.min((source.spg / 3) * 100, 100),
                fullMark: 100
            },
            {
                metric: 'BLO',
                value: Math.min((source.bpg / 3) * 100, 100),
                fullMark: 100
            },
            {
                metric: 'FG%',
                value: Math.min(source.fg_pct, 100),
                fullMark: 100
            }
        ];
    };

    const getRadarRawMetrics = () => {
        const source = getRadarSource();
        if (!source) return null;

        return {
            ppg: source.ppg,
            apg: source.apg,
            rpg: source.rpg,
            spg: source.spg,
            bpg: source.bpg,
            fg_pct: source.fg_pct,
            per: source.per
        };
    };

    const closePlayerModal = () => {
        setShowPlayerModal(false);
        setSelectedPlayer(null);
        setPlayerDetails(null);
    };

    // Helper para formatear números
    const formatNumber = (value, decimals = 0) => {
        if (value == null || isNaN(value)) return '0';
        return Number(value).toFixed(decimals);
    };

    // Calcular dominio dinámico para el eje Y según la métrica
    const getYAxisDomain = (metric) => {
        if (!teamTrends || teamTrends.length === 0) return [0, 100];

        let values = [];
        switch (metric) {
            case 'puntos':
                values = teamTrends.map(t => t.avg_points);
                break;
            case 'asistencias':
                values = teamTrends.map(t => t.avg_assists);
                break;
            case 'rebotes':
                values = teamTrends.map(t => t.avg_rebounds);
                break;
            default:
                return [0, 100];
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.15; // 15% de padding

        return [
            Math.floor(min - padding),
            Math.ceil(max + padding)
        ];
    };

    // Generar insights automáticos del gráfico
    const getChartInsights = (metric) => {
        if (!teamTrends || teamTrends.length < 2) return null;

        let values = [];
        let metricName = '';
        let unit = '';

        switch (metric) {
            case 'puntos':
                values = teamTrends.map(t => t.avg_points);
                metricName = 'puntos';
                unit = 'pts';
                break;
            case 'asistencias':
                values = teamTrends.map(t => t.avg_assists);
                metricName = 'asistencias';
                unit = 'ast';
                break;
            case 'rebotes':
                values = teamTrends.map(t => t.avg_rebounds);
                metricName = 'rebotes';
                unit = 'reb';
                break;
            default:
                return null;
        }

        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const maxYear = teamTrends[values.indexOf(maxValue)].periodo;
        const minYear = teamTrends[values.indexOf(minValue)].periodo;
        const change = lastValue - firstValue;
        const changePercent = ((change / firstValue) * 100).toFixed(1);
        const trend = change > 0 ? 'alza' : change < 0 ? 'baja' : 'estable';

        // Calcular promedio
        const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

        return {
            metricName,
            unit,
            firstValue: firstValue.toFixed(1),
            lastValue: lastValue.toFixed(1),
            maxValue: maxValue.toFixed(1),
            minValue: minValue.toFixed(1),
            maxYear,
            minYear,
            change: Math.abs(change).toFixed(1),
            changePercent: Math.abs(changePercent),
            trend,
            average,
            isPositive: change > 0
        };
    };

    if (advancedError) {
        return (
            <ErrorState
                title="No se pudieron cargar las analíticas"
                message={advancedError?.message || 'Verifica tu sesión o intenta de nuevo.'}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
            <style>{`
                /* Estilos personalizados de scrollbar */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 3px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #4b5563;
                }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
                
                /* Estilos para nombres de jugadores en gráfico - modo claro */
                .recharts-cartesian-axis.yAxis .recharts-cartesian-axis-tick-value {
                    fill: #1f2937 !important;
                    font-weight: 700 !important;
                }
                
                /* Estilos para nombres de jugadores en gráfico - modo oscuro */
                .dark .recharts-cartesian-axis-tick-value {
                    fill: #ffffff !important;
                    font-weight: 700 !important;
                }
                .dark .recharts-cartesian-axis.yAxis .recharts-cartesian-axis-tick-value {
                    fill: #ffffff !important;
                }
                .dark .recharts-cartesian-axis.yAxis line {
                    stroke: #9ca3af !important;
                }
            `}</style>
            <main className="max-w-7xl mx-auto px-4 pt-6 pb-10 space-y-10">
                {advancedLoading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="large" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Pestañas de Navegación */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2"
                        >
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setActiveTab('resumen')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'resumen'
                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Resumen
                                </button>
                                <button
                                    onClick={() => setActiveTab('jugadores')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'jugadores'
                                        ? 'bg-[#002D62] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Jugadores
                                </button>
                                <button
                                    onClick={() => setActiveTab('equipo')}
                                    className={`flex-1 min-w-[110px] px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === 'equipo'
                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Equipo
                                </button>
                            </div>
                        </motion.div>

                        {/* Contenido según pestaña activa */}
                        {activeTab === 'resumen' && (
                            <>
                                {/* Hero Section Compacto */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-5 shadow-lg border border-white/10 mb-4"
                                >
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                                            animation: 'slide 20s linear infinite'
                                        }}></div>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 overflow-hidden">
                                                    <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">República Dominicana</h2>
                                                    <p className="text-white/80 text-xs font-medium">Selección Nacional de Baloncesto</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white/70 text-[10px] uppercase tracking-wider">Período</p>
                                                <p className="text-white text-base font-bold">2010 - 2025</p>
                                            </div>
                                        </div>

                                        {/* KPIs del summary */}
                                        {summary ? (
                                            <div className="flex justify-center mt-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-5xl w-full">
                                                    {/* Total Torneos */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.05, duration: 0.3 }}
                                                        className="group relative overflow-hidden rounded-xl"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-xl transition-all duration-300"></div>

                                                        <div className="relative p-4 transform group-hover:scale-105 transition-transform duration-300">
                                                            <div className="flex flex-col items-center">
                                                                <div className="mb-2 p-3 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/20 backdrop-blur-sm shadow-xl group-hover:shadow-red-500/20 transition-all duration-300 group-hover:scale-110">
                                                                    <Trophy className="w-7 h-7 text-white drop-shadow-lg" />
                                                                </div>
                                                                <p className="text-white/90 text-[10px] font-extrabold uppercase tracking-wider mb-2 group-hover:text-white transition-colors">
                                                                    Torneos
                                                                </p>
                                                                <div className="mb-1">
                                                                    <p className="text-4xl font-black text-white drop-shadow-xl tracking-tight">
                                                                        {summary.tournaments || 0}
                                                                    </p>
                                                                </div>
                                                                <p className="text-white/70 text-xs font-semibold group-hover:text-white/90 transition-colors">
                                                                    Registrados
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>

                                                    {/* Total Jugadores */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1, duration: 0.3 }}
                                                        className="group relative overflow-hidden rounded-xl"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-xl transition-all duration-300"></div>

                                                        <div className="relative p-4 transform group-hover:scale-105 transition-transform duration-300">
                                                            <div className="flex flex-col items-center">
                                                                <div className="mb-2 p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 backdrop-blur-sm shadow-xl group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-110">
                                                                    <Users className="w-7 h-7 text-white drop-shadow-lg" />
                                                                </div>
                                                                <p className="text-white/90 text-[10px] font-extrabold uppercase tracking-wider mb-2 group-hover:text-white transition-colors">
                                                                    Jugadores
                                                                </p>
                                                                <div className="mb-1">
                                                                    <p className="text-4xl font-black text-white drop-shadow-xl tracking-tight">
                                                                        {summary.players || 0}
                                                                    </p>
                                                                </div>
                                                                <p className="text-white/70 text-xs font-semibold group-hover:text-white/90 transition-colors">
                                                                    Registrados
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>

                                                    {/* Total Partidos */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.15, duration: 0.3 }}
                                                        className="group relative overflow-hidden rounded-xl"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/15 to-white/5 backdrop-blur-xl"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        <div className="absolute inset-0 border-2 border-white/40 group-hover:border-white/60 rounded-xl transition-all duration-300"></div>

                                                        <div className="relative p-4 transform group-hover:scale-105 transition-transform duration-300">
                                                            <div className="flex flex-col items-center">
                                                                <div className="mb-2 p-3 rounded-xl bg-gradient-to-br from-red-500/30 to-red-600/20 backdrop-blur-sm shadow-xl group-hover:shadow-red-500/20 transition-all duration-300 group-hover:scale-110">
                                                                    <Target className="w-7 h-7 text-white drop-shadow-lg" />
                                                                </div>
                                                                <p className="text-white/90 text-[10px] font-extrabold uppercase tracking-wider mb-2 group-hover:text-white transition-colors">
                                                                    Partidos
                                                                </p>
                                                                <div className="mb-1">
                                                                    <p className="text-4xl font-black text-white drop-shadow-xl tracking-tight">
                                                                        {summary.games || 0}
                                                                    </p>
                                                                </div>
                                                                <p className="text-white/70 text-xs font-semibold group-hover:text-white/90 transition-colors">
                                                                    Jugados
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-8">
                                                <RefreshCw className="w-8 h-8 text-white/50 animate-spin mr-3" />
                                                <p className="text-white/70">Cargando estadísticas del equipo...</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Grid Principal: Evolución Temporal + Top Players */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Evolución Temporal - 2/3 del espacio */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                        className="lg:col-span-2 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                                                    <TrendingUp className="w-5 h-5 text-[#CE1126]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolución Temporal del Equipo</h3>
                                                    <p className="text-xs text-gray-900 dark:text-white">República Dominicana 2010-2025</p>
                                                </div>
                                            </div>
                                            {/* Filtros de métrica */}
                                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                <button
                                                    onClick={() => setTrendMetric('puntos')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${trendMetric === 'puntos'
                                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Puntos
                                                </button>
                                                <button
                                                    onClick={() => setTrendMetric('asistencias')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${trendMetric === 'asistencias'
                                                        ? 'bg-[#002D62] text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Asistencias
                                                </button>
                                                <button
                                                    onClick={() => setTrendMetric('rebotes')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${trendMetric === 'rebotes'
                                                        ? 'bg-gray-600 text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Rebotes
                                                </button>
                                            </div>
                                        </div>

                                        {/* Gráfico de Tendencias */}
                                        {teamTrends && teamTrends.length > 0 ? (
                                            <div style={{ width: '100%', height: '350px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart
                                                        data={teamTrends.map(period => ({
                                                            año: period.periodo,
                                                            puntos: period.avg_points,
                                                            asistencias: period.avg_assists,
                                                            rebotes: period.avg_rebounds
                                                        }))}
                                                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
                                                        <XAxis
                                                            dataKey="año"
                                                            stroke="#6b7280"
                                                            style={{ fontSize: '12px' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            domain={getYAxisDomain(trendMetric)}
                                                            stroke="#6b7280"
                                                            style={{ fontSize: '11px' }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        {trendMetric === 'puntos' && (
                                                            <Line
                                                                type="monotone"
                                                                dataKey="puntos"
                                                                stroke="#CE1126"
                                                                strokeWidth={3}
                                                                dot={{ fill: '#CE1126', r: 5 }}
                                                                activeDot={{ r: 7 }}
                                                            />
                                                        )}
                                                        {trendMetric === 'asistencias' && (
                                                            <Line
                                                                type="monotone"
                                                                dataKey="asistencias"
                                                                stroke="#002D62"
                                                                strokeWidth={3}
                                                                dot={{ fill: '#002D62', r: 5 }}
                                                                activeDot={{ r: 7 }}
                                                            />
                                                        )}
                                                        {trendMetric === 'rebotes' && (
                                                            <Line
                                                                type="monotone"
                                                                dataKey="rebotes"
                                                                stroke="#6b7280"
                                                                strokeWidth={3}
                                                                dot={{ fill: '#6b7280', r: 5 }}
                                                                activeDot={{ r: 7 }}
                                                            />
                                                        )}
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-20">
                                                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-2" />
                                                <p className="text-gray-500">Cargando tendencias...</p>
                                            </div>
                                        )}

                                        {/* Lectura/Insights del Gráfico */}
                                        {teamTrends && teamTrends.length > 0 && (() => {
                                            const insights = getChartInsights(trendMetric);
                                            if (!insights) return null;

                                            return (
                                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                        {/* Tendencia General */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#CE1126] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Tendencia</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-red-50 dark:bg-red-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.isPositive ? '↑' : '↓'} {insights.changePercent}%
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    {insights.trend === 'alza' ? 'En alza' : insights.trend === 'baja' ? 'En baja' : 'Estable'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                                                                    {insights.change} {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Promedio General */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#002D62] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Promedio</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.average}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    2010-2025
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                                                                    {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Mejor Año */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#CE1126] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Mejor Año</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-red-50 dark:bg-red-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.maxYear}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    {insights.maxValue} {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Peor Año */}
                                                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                                                            {/* Encabezado con color fuerte */}
                                                            <div className="bg-[#002D62] px-3 py-2">
                                                                <p className="text-xs font-bold text-white uppercase tracking-wider text-center">Peor Año</p>
                                                            </div>
                                                            {/* Cuerpo con color suave */}
                                                            <div className="bg-blue-50 dark:bg-blue-950/20 px-3 py-4">
                                                                <p className="text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                                                                    {insights.minYear}
                                                                </p>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold text-center">
                                                                    {insights.minValue} {insights.unit}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Texto descriptivo */}
                                                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700">
                                                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                                            <span className="font-bold text-gray-900 dark:text-white">Análisis:</span> Los {insights.metricName} de República Dominicana muestran una tendencia <span className="font-semibold">{insights.trend === 'alza' ? 'positiva' : insights.trend === 'baja' ? 'negativa' : 'estable'}</span> en 2010-2025,
                                                            {insights.isPositive ? ' con un incremento de ' : ' con una disminución de '}
                                                            <span className="font-bold text-gray-900 dark:text-white">{insights.changePercent}%</span>
                                                            {' '}(de {insights.firstValue} a {insights.lastValue} {insights.unit}).
                                                            Mejor desempeño: <span className="font-bold text-gray-900 dark:text-white">{insights.maxYear}</span> con {insights.maxValue} {insights.unit}.
                                                            Menor: <span className="font-bold text-gray-900 dark:text-white">{insights.minYear}</span> con {insights.minValue} {insights.unit}.
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </motion.div>

                                    {/* Top 5 Jugadores - 1/3 del espacio */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                        className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        {/* Header */}
                                        <div className="mb-4">
                                            <div className="mb-3">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Top 5 Jugadores</h3>
                                                <p className="text-xs text-gray-900 dark:text-white">Máximos por métrica</p>
                                            </div>

                                            {/* Botones de Métricas */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setPlayerMetric('ppg')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'ppg'
                                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Puntos
                                                </button>
                                                <button
                                                    onClick={() => setPlayerMetric('apg')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'apg'
                                                        ? 'bg-[#002D62] text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Asistencias
                                                </button>
                                                <button
                                                    onClick={() => setPlayerMetric('rpg')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'rpg'
                                                        ? 'bg-gray-600 text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Rebotes
                                                </button>
                                                <button
                                                    onClick={() => setPlayerMetric('per')}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${playerMetric === 'per'
                                                        ? 'bg-orange-600 text-white shadow-lg'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    PER
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lista de jugadores */}
                                        {topPlayers && topPlayers.length > 0 ? (
                                            <div className="space-y-2.5">
                                                {topPlayers.slice(0, 5).map((player, index) => (
                                                    <div
                                                        key={player.player_id || index}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                                                    >
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                                                index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{player.player_name}</p>
                                                            <p className="text-xs text-gray-900 dark:text-white">{player.position || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-[#002D62] dark:text-[#FF5252]">{formatNumber(player.metric_value, 1)}</p>
                                                            <p className="text-xs text-gray-900 dark:text-white">{player.metric_name || 'Pts'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                                                <p className="text-sm text-gray-500">Cargando jugadores...</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Grid Secundario: Promedios de Liga */}
                                {
                                    leagueAverages && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.7 }}
                                            className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-300"
                                        >
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Promedios de Liga</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Comparativa general del sistema</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Card 1: Azul - Puntos */}
                                                <div className="rounded-2xl bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 overflow-hidden shadow-lg">
                                                    <div className="p-8 flex flex-col items-center justify-center">
                                                        <p className="text-lg font-bold text-[#002D62] dark:text-[#002D62] uppercase tracking-wider mb-3">Puntos</p>
                                                        <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">{formatNumber(leagueAverages.avg_points, 1)}</p>
                                                    </div>
                                                    <div className="h-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-100 dark:to-gray-50">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { value: leagueAverages.avg_points * 0.85 },
                                                                { value: leagueAverages.avg_points * 0.92 },
                                                                { value: leagueAverages.avg_points * 0.88 },
                                                                { value: leagueAverages.avg_points * 0.95 },
                                                                { value: leagueAverages.avg_points * 1.0 },
                                                                { value: leagueAverages.avg_points * 0.98 },
                                                                { value: leagueAverages.avg_points * 1.02 }
                                                            ]}>
                                                                <defs>
                                                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#002D62" stopOpacity={0.4} />
                                                                        <stop offset="100%" stopColor="#002D62" stopOpacity={0.05} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="value" stroke="#002D62" strokeWidth={2} fill="url(#colorBlue)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Card 2: Blanca - Asistencias */}
                                                <div className="rounded-2xl bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 overflow-hidden shadow-lg">
                                                    <div className="p-8 flex flex-col items-center justify-center">
                                                        <p className="text-lg font-bold text-gray-700 dark:text-gray-700 uppercase tracking-wider mb-3">Asistencias</p>
                                                        <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">{formatNumber(leagueAverages.avg_assists, 1)}</p>
                                                    </div>
                                                    <div className="h-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-100 dark:to-gray-50">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { value: leagueAverages.avg_assists * 0.88 },
                                                                { value: leagueAverages.avg_assists * 0.90 },
                                                                { value: leagueAverages.avg_assists * 0.95 },
                                                                { value: leagueAverages.avg_assists * 0.92 },
                                                                { value: leagueAverages.avg_assists * 1.0 },
                                                                { value: leagueAverages.avg_assists * 0.97 },
                                                                { value: leagueAverages.avg_assists * 1.01 }
                                                            ]}>
                                                                <defs>
                                                                    <linearGradient id="colorGray" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#6b7280" stopOpacity={0.3} />
                                                                        <stop offset="100%" stopColor="#6b7280" stopOpacity={0.05} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="value" stroke="#6b7280" strokeWidth={2} fill="url(#colorGray)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Card 3: Roja - Rebotes */}
                                                <div className="rounded-2xl bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 overflow-hidden shadow-lg">
                                                    <div className="p-8 flex flex-col items-center justify-center">
                                                        <p className="text-lg font-bold text-[#CE1126] dark:text-[#CE1126] uppercase tracking-wider mb-3">Rebotes</p>
                                                        <p className="text-6xl font-black text-gray-900 dark:text-gray-900 mb-1">{formatNumber(leagueAverages.avg_rebounds, 1)}</p>
                                                    </div>
                                                    <div className="h-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-100 dark:to-gray-50">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { value: leagueAverages.avg_rebounds * 0.86 },
                                                                { value: leagueAverages.avg_rebounds * 0.93 },
                                                                { value: leagueAverages.avg_rebounds * 0.89 },
                                                                { value: leagueAverages.avg_rebounds * 0.96 },
                                                                { value: leagueAverages.avg_rebounds * 1.0 },
                                                                { value: leagueAverages.avg_rebounds * 0.94 },
                                                                { value: leagueAverages.avg_rebounds * 1.03 }
                                                            ]}>
                                                                <defs>
                                                                    <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#CE1126" stopOpacity={0.4} />
                                                                        <stop offset="100%" stopColor="#CE1126" stopOpacity={0.05} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area type="monotone" dataKey="value" stroke="#CE1126" strokeWidth={2} fill="url(#colorRed)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                }
                            </>
                        )}

                        {/* Pestaña Jugadores */}
                        {activeTab === 'jugadores' && (
                            <>
                                {/* Encabezado Jugadores - gradiente dominicano con centro blanco */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="rounded-2xl shadow-xl bg-gradient-to-r from-[#CE1126] via-white to-[#002D62] p-[1px]"
                                >
                                    <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-white/60 dark:border-gray-700">
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Lado izquierdo: bandera + título */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-[#CE1126]/70 overflow-hidden">
                                                    <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Análisis de Jugadores</h3>
                                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                        Selección Nacional • {playersPeriod.start}-{playersPeriod.end}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Lado derecho: filtros de período */}
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase mr-1">Período</span>
                                                <select
                                                    value={playersPeriod.start}
                                                    onChange={(e) => setPlayersPeriod({ ...playersPeriod, start: parseInt(e.target.value) })}
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#CE1126]"
                                                >
                                                    {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">-</span>
                                                <select
                                                    value={playersPeriod.end}
                                                    onChange={(e) => setPlayersPeriod({ ...playersPeriod, end: parseInt(e.target.value) })}
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#CE1126]"
                                                >
                                                    {Array.from({ length: 16 }, (_, i) => 2010 + i).map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Tabs de Métricas - compacto, rojo/azul */}
                                        <div className="flex flex-wrap gap-2 mt-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                            {['ppg', 'apg', 'rpg', 'spg', 'bpg', 'per', 'fg_pct'].map((metric) => {
                                                const config = getMetricConfig(metric);
                                                const isActive = selectedPlayerMetric === metric;
                                                return (
                                                    <button
                                                        key={metric}
                                                        onClick={() => setSelectedPlayerMetric(metric)}
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${isActive
                                                            ? 'shadow-lg scale-105'
                                                            : 'hover:scale-105'}
                                                        ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                                                        style={{
                                                            background: isActive
                                                                ? `linear-gradient(135deg, ${config.color}, ${config.color === '#CE1126' ? '#8B0D1A' : '#002D62'})`
                                                                : 'transparent',
                                                            border: `1px solid ${config.color}`
                                                        }}
                                                    >
                                                        {config.unit}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>


                                {/* Grid Superior: Top 10 + Gráfico Comparativo */}
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    {/* Top 10 Jugadores */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="lg:col-span-2 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Top 10 Jugadores</h4>
                                            <p className="text-[10px] text-gray-900 dark:text-white">{getMetricConfig(selectedPlayerMetric).label}</p>
                                        </div>

                                        {loadingPlayers ? (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                                                <p className="text-sm text-gray-500">Cargando jugadores...</p>
                                            </div>
                                        ) : topPlayersData.length > 0 ? (
                                            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                                                {topPlayersData.map((player, index) => {
                                                    const config = getMetricConfig(selectedPlayerMetric);
                                                    return (
                                                        <motion.div
                                                            key={player.player_id || index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            onClick={() => loadPlayerDetails(player)}
                                                            className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 cursor-pointer hover:scale-[1.01] ${index === 0 ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-[#CE1126]/20 dark:to-[#CE1126]/10 border border-[#CE1126]' :
                                                                index === 1 ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-[#002D62]/20 dark:to-[#002D62]/10 border border-[#002D62]' :
                                                                    index === 2 ? 'bg-gradient-to-r from-red-50 to-blue-50 dark:from-[#CE1126]/10 dark:to-[#002D62]/10 border border-[#CE1126]/50' :
                                                                        'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                                                }`}
                                                        >
                                                            {/* Ranking Badge - más pequeño */}
                                                            <div
                                                                className={`flex items-center justify-center w-7 h-7 rounded-md font-black text-xs ${index === 0 ? 'bg-[#CE1126] text-white shadow-md' :
                                                                    index === 1 ? 'bg-[#002D62] text-white shadow-md' :
                                                                        index === 2 ? 'bg-gradient-to-br from-[#CE1126] to-[#002D62] text-white shadow-md' :
                                                                            'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                                                    }`}
                                                            >
                                                                {index + 1}
                                                            </div>

                                                            {/* Foto del jugador o avatar de fallback */}
                                                            <PlayerAvatar
                                                                playerName={player.player_name}
                                                                color={config.color}
                                                                size={9}
                                                            />

                                                            {/* Nombre y Posición - más compacto */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                                                    {player.player_name || 'Jugador Desconocido'}
                                                                </p>
                                                                <p className="text-[10px] text-gray-900 dark:text-white">
                                                                    {player.position || 'N/A'} • {player.games_played || 0} PJ
                                                                </p>
                                                            </div>

                                                            {/* Valor de Métrica */}
                                                            <div className="text-right">
                                                                <p className="text-base font-black text-[#002D62] dark:text-[#CE1126]">
                                                                    {formatMetricValue(player.metric_value, selectedPlayerMetric)}
                                                                </p>
                                                                <p className="text-[10px] text-gray-900 dark:text-white">
                                                                    {config.unit}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500">No hay datos disponibles</p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Gráfico Comparativo */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="lg:col-span-3 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Comparativa Visual</h4>
                                            <p className="text-[10px] text-gray-900 dark:text-white">Rendimiento relativo de los top jugadores</p>
                                        </div>

                                        {loadingPlayers ? (
                                            <div className="flex items-center justify-center h-72">
                                                <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                                            </div>
                                        ) : topPlayersData.length > 0 ? (
                                            <div style={{ width: '100%', height: '320px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={topPlayersData.slice(0, 10)}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 20, left: 90, bottom: 5 }}
                                                        barSize={18}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.6} horizontal={false} />
                                                        <XAxis
                                                            type="number"
                                                            stroke="#374151"
                                                            style={{ fontSize: '10px', fill: '#374151' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="player_name"
                                                            stroke="#1f2937"
                                                            style={{ fontSize: '10px', fill: '#1f2937', fontWeight: 700 }}
                                                            tickLine={false}
                                                            width={85}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '6px',
                                                                fontSize: '11px',
                                                                padding: '6px 10px'
                                                            }}
                                                            formatter={(value) => [formatMetricValue(value, selectedPlayerMetric), getMetricConfig(selectedPlayerMetric).label]}
                                                        />
                                                        <Bar
                                                            dataKey="metric_value"
                                                            fill={getMetricConfig(selectedPlayerMetric).color}
                                                            radius={[0, 6, 6, 0]}
                                                            animationDuration={800}
                                                        >
                                                            {topPlayersData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        index === 0 ? '#CE1126' :
                                                                            index === 1 ? '#002D62' :
                                                                                index === 2 ? '#CE1126' :
                                                                                    index % 2 === 0 ? '#CE1126' : '#002D62'
                                                                    }
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-96">
                                                <p className="text-sm text-gray-500">No hay datos para mostrar</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Grid Inferior: Distribución + Comparativa */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="space-y-4"
                                    >
                                        {loadingPlayers ? (
                                            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-[260px]">
                                                <div className="flex flex-col items-center">
                                                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mb-2" />
                                                    <p className="text-xs text-gray-500">Cargando distribución por posición...</p>
                                                </div>
                                            </div>
                                        ) : topPlayersData.length > 0 ? (
                                            <>
                                                {/* Card: Distribución por Posición (Donut) */}
                                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                                                    <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Distribución por Posición</h4>
                                                        <p className="text-[10px] font-semibold text-gray-900 dark:text-white">Top 10 • {getMetricConfig(selectedPlayerMetric).label}</p>
                                                    </div>

                                                    <div style={{ width: '100%', height: '220px' }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={calculatePositionDistribution()}
                                                                    cx="50%"
                                                                    cy="52%"
                                                                    labelLine={false}
                                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                    innerRadius={55}
                                                                    outerRadius={85}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                    paddingAngle={2}
                                                                >
                                                                    {calculatePositionDistribution().map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                        border: '1px solid #e5e7eb',
                                                                        borderRadius: '8px',
                                                                        fontSize: '11px',
                                                                        padding: '6px 10px'
                                                                    }}
                                                                />
                                                                <Legend
                                                                    verticalAlign="bottom"
                                                                    align="center"
                                                                    iconType="circle"
                                                                    wrapperStyle={{ paddingTop: 8 }}
                                                                    formatter={(value, entry) => (
                                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                                            {value}: {entry.payload.value}
                                                                        </span>
                                                                    )}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Card: Perfil de Rendimiento (Radar) */}
                                                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
                                                    <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                                                        <div>
                                                            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Perfil de Rendimiento</h4>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                Resumen ofensivo y defensivo del jugador seleccionado
                                                            </p>
                                                        </div>
                                                        <div className="relative w-40 sm:w-56">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Search className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#002D62] focus:border-transparent"
                                                                placeholder="Buscar jugador..."
                                                                value={performanceSearchTerm}
                                                                onChange={(e) => {
                                                                    setPerformanceSearchTerm(e.target.value);
                                                                    if (e.target.value === '') {
                                                                        setSelectedPlayerForRadar(null);
                                                                    }
                                                                }}
                                                            />
                                                            {performanceSearchTerm && performanceFilteredPlayers.length > 0 && (
                                                                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                                                                    <ul className="py-1 text-xs">
                                                                        {performanceFilteredPlayers.map(player => (
                                                                            <li key={player.player_id}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={async () => {
                                                                                        const enriched = await loadRadarPlayerMetrics(player);
                                                                                        setSelectedPlayerForRadar(enriched);
                                                                                        setPerformanceSearchTerm(enriched.player_name);
                                                                                    }}
                                                                                    className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                                                >
                                                                                    <span className="truncate">{player.player_name}</span>
                                                                                    <span className="ml-1 text-[10px] text-gray-500 dark:text-gray-400">
                                                                                        {player.position || 'N/A'}
                                                                                    </span>
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {getRadarPerformanceData().length > 0 ? (
                                                        <>
                                                            <div style={{ width: '100%', height: '220px' }}>
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <RadarChart data={getRadarPerformanceData()}>
                                                                        <PolarGrid stroke="#d1d5db" strokeDasharray="3 3" />
                                                                        <PolarAngleAxis
                                                                            dataKey="metric"
                                                                            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }}
                                                                        />
                                                                        <PolarRadiusAxis
                                                                            domain={[0, 100]}
                                                                            tick={{ fill: '#9ca3af', fontSize: 9 }}
                                                                            tickCount={5}
                                                                        />
                                                                        <Radar
                                                                            name={selectedPlayerForRadar?.player_name || selectedPlayer?.player_name || 'Jugador'}
                                                                            dataKey="value"
                                                                            stroke="#CE1126"
                                                                            fill="#CE1126"
                                                                            fillOpacity={0.3}
                                                                            strokeWidth={2}
                                                                            dot={{ r: 5, fill: '#CE1126', stroke: '#fff', strokeWidth: 2 }}
                                                                        />
                                                                        <Tooltip
                                                                            contentStyle={{
                                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                                border: '1px solid #e5e7eb',
                                                                                borderRadius: '8px',
                                                                                fontSize: '11px',
                                                                                padding: '8px 12px'
                                                                            }}
                                                                            formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                                                                        />
                                                                    </RadarChart>
                                                                </ResponsiveContainer>
                                                            </div>

                                                            {(() => {
                                                                const raw = getRadarRawMetrics();
                                                                if (!raw) return null;
                                                                return (
                                                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                                                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-md px-2 py-1">
                                                                            <span className="font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                                                PPG
                                                                            </span>
                                                                            <span className="font-bold text-[#CE1126]">
                                                                                {formatNumber(raw.ppg, 1)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-md px-2 py-1">
                                                                            <span className="font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                                                APG
                                                                            </span>
                                                                            <span className="font-bold text-[#CE1126]">
                                                                                {formatNumber(raw.apg, 1)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-md px-2 py-1">
                                                                            <span className="font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                                                RPG
                                                                            </span>
                                                                            <span className="font-bold text-[#002D62]">
                                                                                {formatNumber(raw.rpg, 1)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-md px-2 py-1">
                                                                            <span className="font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                                                SPG
                                                                            </span>
                                                                            <span className="font-bold text-[#002D62]">
                                                                                {formatNumber(raw.spg, 1)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-md px-2 py-1">
                                                                            <span className="font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                                                BPG
                                                                            </span>
                                                                            <span className="font-bold text-[#002D62]">
                                                                                {formatNumber(raw.bpg, 1)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 rounded-md px-2 py-1">
                                                                            <span className="font-semibold text-gray-600 dark:text-gray-300 uppercase">
                                                                                FG%
                                                                            </span>
                                                                            <span className="font-bold text-[#CE1126]">
                                                                                {`${formatNumber(raw.fg_pct, 1)}%`}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </>
                                                    ) : (
                                                        <div className="h-[220px] flex items-center justify-center">
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center px-4">
                                                                Escribe el nombre de un jugador o selecciona uno del Top 10 para ver su perfil de rendimiento.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center h-[260px]">
                                                <p className="text-sm text-gray-500">No hay datos disponibles</p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Comparativa de Jugadores */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Comparativa</h4>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Selecciona hasta 4 jugadores</p>
                                                </div>
                                                {selectedPlayersForComparison.length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedPlayersForComparison([])}
                                                        className="text-[10px] font-bold text-[#CE1126] hover:underline"
                                                    >
                                                        Limpiar Todo
                                                    </button>
                                                )}
                                            </div>

                                            {/* Jugadores seleccionados con X */}
                                            {selectedPlayersForComparison.length > 0 && (
                                                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <p className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1.5">Seleccionados ({selectedPlayersForComparison.length}/4)</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedPlayersForComparison.map((player) => (
                                                            <div
                                                                key={player.player_id}
                                                                className="flex items-center gap-1 px-2 py-1 bg-[#CE1126] text-white rounded-md text-[10px] font-bold"
                                                            >
                                                                <span>{player.player_name.split(' ').slice(-2).join(' ')}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPlayersForComparison(prev =>
                                                                            prev.filter(p => p.player_id !== player.player_id)
                                                                        );
                                                                    }}
                                                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Selector de jugadores */}
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Seleccionar jugadores para comparar (Máx. 4)</p>

                                                {/* Lista de jugadores disponibles */}
                                                {selectedPlayersForComparison.length < 4 && (
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Search className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#002D62] focus:border-transparent"
                                                            placeholder="Buscar jugador..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {/* Lista de jugadores filtrados */}
                                                {selectedPlayersForComparison.length < 4 && searchTerm.trim() !== '' && (
                                                    <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                                                        {filteredPlayers.length > 0 ? (
                                                            <ul className="py-1">
                                                                {filteredPlayers.map(player => (
                                                                    <li key={player.player_id}>
                                                                        <button
                                                                            onClick={() => togglePlayerForComparison(player)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                                        >
                                                                            <span className="truncate">
                                                                                {player.player_name}
                                                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                    {(() => {
                                                                                        const team = player.team || '';
                                                                                        const position = player.position || '';
                                                                                        const cleanTeam = (team === 'N/A' || team === 'N/A.' ? '' : team).trim();

                                                                                        if (cleanTeam && position) return `${cleanTeam} • ${position}`;
                                                                                        if (position) return position;
                                                                                        if (cleanTeam) return cleanTeam;
                                                                                        return '';
                                                                                    })()}
                                                                                </span>
                                                                            </span>
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                                No se encontraron jugadores
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tabla de comparación */}
                                        {loadingComparison ? (
                                            <div className="flex flex-col items-center justify-center h-60">
                                                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                                                <p className="text-xs text-gray-500">Cargando datos de comparación...</p>
                                            </div>
                                        ) : comparisonData.length > 0 ? (
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62]">
                                                            <tr>
                                                                <th className="px-4 py-3 text-center text-xs font-medium text-white/80 uppercase tracking-wide">
                                                                    Métrica
                                                                </th>
                                                                {comparisonData.map((player) => (
                                                                    <th
                                                                        key={player.player_id}
                                                                        className="px-4 py-3 text-center text-xs font-medium text-white/80 uppercase tracking-wide"
                                                                    >
                                                                        <div className="flex flex-col items-center text-center">
                                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/90 to-white/70 p-0.5 mb-1 flex items-center justify-center">
                                                                                <PlayerAvatar
                                                                                    playerName={player.player_name}
                                                                                    size={9}
                                                                                    color="#002D62"
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-white">
                                                                                {player.player_name.split(' ').slice(-2).join(' ')}
                                                                            </span>
                                                                            <span className="text-[10px] text-white/80">
                                                                                {player.position || 'N/A'}
                                                                            </span>
                                                                            {(() => {
                                                                                const games = Number(player.games_played);
                                                                                const seasons = Number(player.seasons);
                                                                                const hasGames = !isNaN(games) && games > 0;
                                                                                const hasSeasons = !isNaN(seasons) && seasons > 0;

                                                                                if (!hasGames && !hasSeasons) return null;

                                                                                const parts = [];
                                                                                if (hasGames) parts.push(`${games} PJ`);
                                                                                if (hasSeasons) parts.push(`${seasons} TEMP`);

                                                                                return (
                                                                                    <span className="text-[9px] text-white/70 mt-0.5">
                                                                                        {parts.join(' • ')}
                                                                                    </span>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                            {[
                                                                { key: 'ppg', label: 'PTS/J' },
                                                                { key: 'rpg', label: 'REB/J' },
                                                                { key: 'apg', label: 'AST/J' },
                                                                { key: 'spg', label: 'ROB/J' },
                                                                { key: 'bpg', label: 'BLO/J' },
                                                                { key: 'fg_pct', label: 'FG%' },
                                                                { key: 'three_pct', label: '3P%' },
                                                                { key: 'ft_pct', label: 'FT%' },
                                                                { key: 'last_season', label: 'ÚLT. TEMP.' }
                                                            ].map(({ key, label }) => {

                                                                // Métricas que se tratan como numéricas para calcular mejor/peor
                                                                const numericMetrics = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'fg_pct', 'three_pct', 'ft_pct'];
                                                                const offensiveMetrics = ['ppg', 'apg', 'fg_pct', 'three_pct', 'ft_pct'];
                                                                const defensiveMetrics = ['rpg', 'spg', 'bpg'];

                                                                let max = null;
                                                                let min = null;

                                                                if (numericMetrics.includes(key)) {
                                                                    const numericValues = comparisonData.map(p => {
                                                                        const raw = p[key];
                                                                        const parsed = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
                                                                        return isNaN(parsed) ? 0 : parsed;
                                                                    });

                                                                    if (numericValues.length > 0) {
                                                                        max = Math.max(...numericValues);
                                                                        min = Math.min(...numericValues);
                                                                    }
                                                                }

                                                                return (
                                                                    <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                                            <div className="flex items-center">
                                                                                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                                                                    {label}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        {comparisonData.map((player) => {
                                                                            const rawValue = player[key];

                                                                            let isBest = false;
                                                                            let isWorst = false;

                                                                            if (numericMetrics.includes(key) && max !== null && min !== null) {
                                                                                const parsed = typeof rawValue === 'string' ? parseFloat(rawValue) : Number(rawValue);
                                                                                const valueNum = isNaN(parsed) ? 0 : parsed;
                                                                                isBest = valueNum === max && max !== min;
                                                                                isWorst = valueNum === min && max !== min && comparisonData.length > 1;
                                                                            }

                                                                            let textClass = 'text-gray-700 dark:text-gray-300';

                                                                            if (offensiveMetrics.includes(key)) {
                                                                                textClass = 'text-[#CE1126] dark:text-red-300';
                                                                            } else if (defensiveMetrics.includes(key)) {
                                                                                textClass = 'text-[#002D62] dark:text-blue-300';
                                                                            }

                                                                            if (isWorst) {
                                                                                textClass = 'text-gray-400';
                                                                            }

                                                                            const fontClass = isBest ? 'font-bold' : '';

                                                                            return (
                                                                                <td
                                                                                    key={`${player.player_id}-${key}`}
                                                                                    className={`px-4 py-3 whitespace-nowrap text-sm text-center ${textClass} ${fontClass}`}
                                                                                >
                                                                                    {formatMetricValue(rawValue, key)}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : selectedPlayersForComparison.length > 0 ? (
                                            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                                                <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                                                <p className="text-xs font-bold">Preparando datos...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                                                <Users className="w-12 h-12 mb-2" />
                                                <p className="text-xs font-bold">Selecciona jugadores para comparar</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                            </>
                        )}
                    </div>
                )}

                {/* Modal de Detalles del Jugador */}
                {showPlayerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={closePlayerModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
                        >
                            {/* Header del Modal */}
                            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#CE1126] to-[#002D62] p-4 rounded-t-2xl">
                                <button
                                    onClick={closePlayerModal}
                                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>

                                {selectedPlayer && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-white/10 p-0.5">
                                            <PlayerAvatar
                                                playerName={selectedPlayer.player_name}
                                                color="rgba(255,255,255,0.3)"
                                                size={15}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-white">{selectedPlayer.player_name}</h2>
                                            <p className="text-white/80 text-xs">{selectedPlayer.position || 'N/A'} • {selectedPlayer.games_played || 0} partidos</p>
                                            {playerDetails?.yearsAnalyzed > 0 && (
                                                <p className="text-xs text-white/90 mt-1">
                                                    {playerDetails.yearsAnalyzed} temporada{playerDetails.yearsAnalyzed !== 1 ? 's' : ''} • {playerDetails.yearRange}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contenido del Modal */}
                            <div className="p-4 space-y-4">
                                {loadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mb-4" />
                                        <p className="text-gray-500">Cargando información detallada...</p>
                                    </div>
                                ) : playerDetails ? (
                                    <>
                                        {/* Métricas Avanzadas */}
                                        {playerDetails.quickMetrics && (
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                                    Métricas Avanzadas
                                                </h3>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-[#CE1126]/30">
                                                        <p className="text-[10px] font-bold text-[#CE1126] dark:text-red-400 uppercase mb-1">TS%</p>
                                                        <p className="text-2xl font-black text-[#CE1126] dark:text-red-300">
                                                            {playerDetails.quickMetrics.ts_percentage ? playerDetails.quickMetrics.ts_percentage.toFixed(1) : 'N/A'}%
                                                        </p>
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Tiro Real</p>
                                                    </div>

                                                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-[#002D62]/30">
                                                        <p className="text-[10px] font-bold text-[#002D62] dark:text-blue-400 uppercase mb-1">eFG%</p>
                                                        <p className="text-2xl font-black text-[#002D62] dark:text-blue-300">
                                                            {playerDetails.quickMetrics.efg_percentage ? playerDetails.quickMetrics.efg_percentage.toFixed(1) : 'N/A'}%
                                                        </p>
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Tiro Efectivo</p>
                                                    </div>

                                                    <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-[#CE1126]/30">
                                                        <p className="text-[10px] font-bold text-[#CE1126] dark:text-red-400 uppercase mb-1">PER</p>
                                                        <p className="text-2xl font-black text-[#CE1126] dark:text-red-300">
                                                            {playerDetails.quickMetrics.per ? playerDetails.quickMetrics.per.toFixed(1) : 'N/A'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Eficiencia</p>
                                                    </div>

                                                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-[#002D62]/30">
                                                        <p className="text-[10px] font-bold text-[#002D62] dark:text-blue-400 uppercase mb-1">USG%</p>
                                                        <p className="text-2xl font-black text-[#002D62] dark:text-blue-300">
                                                            {playerDetails.quickMetrics.usage_rate ? playerDetails.quickMetrics.usage_rate.toFixed(1) : 'N/A'}%
                                                        </p>
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">Uso</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Impacto en el Juego */}
                                        {playerDetails.stats && (
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                                    Impacto en el Juego
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Ofensiva */}
                                                    {playerDetails.stats.offense && (
                                                        <div className="rounded-lg border border-[#CE1126]/30 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 p-3">
                                                            <p className="text-xs font-bold text-[#CE1126] uppercase mb-2">Ofensiva</p>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Puntos/Juego</span>
                                                                    <span className="text-lg font-black text-[#CE1126]">
                                                                        {playerDetails.stats.offense.average_points?.toFixed(1) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Asistencias/Juego</span>
                                                                    <span className="text-lg font-black text-[#CE1126]">
                                                                        {playerDetails.stats.offense.playmaking?.avg_assists?.toFixed(1) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300">% Tiros Campo</span>
                                                                    <span className="text-lg font-black text-[#CE1126]">
                                                                        {playerDetails.stats.offense.shooting_efficiency?.fg_pct ? playerDetails.stats.offense.shooting_efficiency.fg_pct.toFixed(1) : 'N/A'}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Defensiva */}
                                                    {playerDetails.stats.defense && (
                                                        <div className="rounded-lg border border-[#002D62]/30 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 p-3">
                                                            <p className="text-xs font-bold text-[#002D62] uppercase mb-2">Defensiva</p>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Robos/Juego</span>
                                                                    <span className="text-lg font-black text-[#002D62]">
                                                                        {playerDetails.stats.defense.defensive_metrics?.avg_steals?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Bloqueos/Juego</span>
                                                                    <span className="text-lg font-black text-[#002D62]">
                                                                        {playerDetails.stats.defense.defensive_metrics?.avg_blocks?.toFixed(2) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-700 dark:text-gray-300">Rebotes Def.</span>
                                                                    <span className="text-lg font-black text-[#002D62]">
                                                                        {playerDetails.stats.defense.defensive_metrics?.avg_defensive_rebounds?.toFixed(1) || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ratio AST/TOV */}
                                        {playerDetails.advanced?.playmaking?.ast_to_tov && (
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-[#CE1126]/10 via-white to-[#002D62]/10 dark:from-red-950/20 dark:via-gray-900 dark:to-blue-950/20 border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">Ratio Asistencias/Pérdidas</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {playerDetails.advanced.playmaking.ast_to_tov >= 2.0 ? 'Excelente' :
                                                                playerDetails.advanced.playmaking.ast_to_tov >= 1.5 ? 'Bueno' :
                                                                    playerDetails.advanced.playmaking.ast_to_tov >= 1.0 ? 'Promedio' : 'Mejorable'}
                                                        </p>
                                                    </div>
                                                    <p className="text-3xl font-black bg-gradient-to-r from-[#CE1126] to-[#002D62] bg-clip-text text-transparent">
                                                        {playerDetails.advanced.playmaking.ast_to_tov.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Radar Chart de Rendimiento */}
                                        {playerDetails.stats && (
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                                    Perfil de Rendimiento
                                                </h3>
                                                <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                                    <ResponsiveContainer width="100%" height={320}>
                                                        <RadarChart data={[
                                                            {
                                                                metric: 'PTS',
                                                                value: Math.min((playerDetails.stats.offense?.average_points || 0) / 30 * 100, 100),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'AST',
                                                                value: Math.min((playerDetails.stats.offense?.playmaking?.avg_assists || 0) / 10 * 100, 100),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'REB',
                                                                value: Math.min((playerDetails.stats.defense?.defensive_metrics?.avg_total_rebounds || 0) / 15 * 100, 100),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'FG%',
                                                                value: (playerDetails.stats.offense?.shooting_efficiency?.fg_pct || 0),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'ROB',
                                                                value: Math.min((playerDetails.stats.defense?.defensive_metrics?.avg_steals || 0) / 3 * 100, 100),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'BLO',
                                                                value: Math.min((playerDetails.stats.defense?.defensive_metrics?.avg_blocks || 0) / 3 * 100, 100),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'TS%',
                                                                value: (playerDetails.quickMetrics?.ts_percentage || 0),
                                                                fullMark: 100
                                                            },
                                                            {
                                                                metric: 'PER',
                                                                value: Math.min((playerDetails.quickMetrics?.per || 0) / 30 * 100, 100),
                                                                fullMark: 100
                                                            }
                                                        ]}>
                                                            <PolarGrid stroke="#d1d5db" strokeDasharray="3 3" />
                                                            <PolarAngleAxis
                                                                dataKey="metric"
                                                                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }}
                                                            />
                                                            <PolarRadiusAxis
                                                                angle={90}
                                                                domain={[0, 100]}
                                                                tick={{ fill: '#9ca3af', fontSize: 9 }}
                                                            />
                                                            <Radar
                                                                name={selectedPlayer?.player_name}
                                                                dataKey="value"
                                                                stroke="#CE1126"
                                                                fill="#CE1126"
                                                                fillOpacity={0.4}
                                                                strokeWidth={3}
                                                                dot={{ r: 4, fill: '#CE1126', stroke: '#991b1b', strokeWidth: 2 }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '8px',
                                                                    fontSize: '11px',
                                                                    padding: '8px 12px'
                                                                }}
                                                                formatter={(value) => `${value.toFixed(1)}%`}
                                                            />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No se pudieron cargar los detalles</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Pestaña Equipos */}
                {activeTab === 'equipo' && (
                    <>
                        {loadingTeam ? (
                            <div className="flex items-center justify-center py-20">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : teamData ? (
                            <>
                                {/* Hero Section Compacto */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#CE1126] via-[#8B0D1A] to-[#002D62] p-5 mb-4 shadow-lg"
                                >
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
                                            animation: 'slide 20s linear infinite'
                                        }} />
                                    </div>

                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 overflow-hidden flex items-center justify-center">
                                            <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white drop-shadow-md">
                                                REPÚBLICA DOMINICANA
                                            </h2>
                                            <p className="text-white/80 text-xs font-medium">
                                                Selección Nacional • {teamData.overview?.period || '2010-2025'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* KPIs Principales - Estilo Resumen */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                    {/* Partidos */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.05 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 text-center"
                                    >
                                        <p className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                            Partidos
                                        </p>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                                            {teamData.overview?.total_games || 0}
                                        </p>
                                    </motion.div>

                                    {/* Victorias */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 text-center"
                                    >
                                        <p className="text-sm font-bold uppercase tracking-wider text-[#CE1126] mb-2">
                                            Victorias
                                        </p>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                                            {teamData.overview?.total_wins || 0}
                                        </p>
                                    </motion.div>

                                    {/* Porcentaje de Victorias */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.15 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 text-center"
                                    >
                                        <p className="text-sm font-bold uppercase tracking-wider text-[#002D62] mb-2">
                                            % Ganado
                                        </p>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                                            {((teamData.overview?.win_percentage || 0) * 100).toFixed(1)}%
                                        </p>
                                    </motion.div>

                                    {/* Plus/Minus Promedio */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 text-center"
                                    >
                                        <p className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                                            +/- Promedio
                                        </p>
                                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                                            {teamData.overview?.momentum?.avg_plus_minus >= 0 ? '+' : ''}
                                            {(teamData.overview?.momentum?.avg_plus_minus || 0).toFixed(1)}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Grid 2 Columnas: Ofensiva y Defensiva - Compacto */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                    {/* Análisis Ofensivo */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                                    >
                                        <div className="bg-[#CE1126] px-4 py-2">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                                Análisis Ofensivo
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {/* Anotación */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Anotación</p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                                        <p className="text-2xl font-black text-[#CE1126]">
                                                            {(teamData.offense?.efficiency_metrics?.avg_points || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">PTS/J</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                                        <p className="text-2xl font-black text-[#CE1126]">
                                                            {(teamData.offense?.playmaking?.avg_assists || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">AST/J</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                                        <p className="text-2xl font-black text-[#CE1126]">
                                                            {(teamData.offense?.playmaking?.avg_offensive_rebounds || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">REB-O</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Porcentajes de Tiro */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Porcentajes de Tiro</p>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                                                        <p className="text-lg font-black text-gray-900 dark:text-white">
                                                            {(teamData.offense?.efficiency_metrics?.shooting_efficiency?.fg_pct || 0).toFixed(1)}%
                                                        </p>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase">FG%</p>
                                                    </div>
                                                    <div className="flex-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                                                        <p className="text-lg font-black text-gray-900 dark:text-white">
                                                            {(teamData.offense?.efficiency_metrics?.shooting_efficiency?.['3p_pct'] || 0).toFixed(1)}%
                                                        </p>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase">3P%</p>
                                                    </div>
                                                    <div className="flex-1 px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                                                        <p className="text-lg font-black text-gray-900 dark:text-white">
                                                            {(teamData.offense?.efficiency_metrics?.shooting_efficiency?.ft_pct || 0).toFixed(1)}%
                                                        </p>
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase">FT%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Eficiencia Ofensiva */}
                                            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border border-red-200 dark:border-red-800">
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Eficiencia Ofensiva</p>
                                                <p className="text-4xl font-black text-[#CE1126]">
                                                    {(teamData.offense?.efficiency_metrics?.avg_efficiency || 0).toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Análisis Defensivo */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.15 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                                    >
                                        <div className="bg-[#002D62] px-4 py-2">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                                                Análisis Defensivo
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {/* Acciones Defensivas */}
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Acciones Defensivas</p>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-2xl font-black text-[#002D62]">
                                                            {(teamData.defense?.defensive_actions?.avg_defensive_rebounds || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">REB-D</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-2xl font-black text-[#002D62]">
                                                            {(teamData.defense?.defensive_actions?.avg_steals || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">ROB/J</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-2xl font-black text-[#002D62]">
                                                            {(teamData.defense?.defensive_actions?.avg_blocks || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">BLO/J</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Control del Juego */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Control del Juego</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-2xl font-black text-[#002D62] text-center">
                                                            {(teamData.defense?.control?.avg_turnovers || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Pérdidas/J</p>
                                                    </div>
                                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-2xl font-black text-[#002D62] text-center">
                                                            {teamData.defense?.control?.avg_plus_minus >= 0 ? '+' : ''}
                                                            {(teamData.defense?.control?.avg_plus_minus || 0).toFixed(1)}
                                                        </p>
                                                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">+/-</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rebotes Totales */}
                                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Rebotes Totales</p>
                                                <p className="text-4xl font-black text-[#002D62]">
                                                    {(teamData.overview?.rebounding?.avg_total_rebounds || 0).toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Gráfico de Tendencias */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                Tendencias por Temporada
                                            </h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {getTeamMetricLabel(teamMetric)}
                                            </p>
                                        </div>

                                        {/* Selector de Métrica */}
                                        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                            {['points_per_game', 'assists_per_game', 'rebounds_per_game', 'efficiency'].map((metric) => (
                                                <button
                                                    key={metric}
                                                    onClick={() => setTeamMetric(metric)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${teamMetric === metric
                                                        ? 'bg-[#CE1126] text-white shadow-lg'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {metric === 'points_per_game' ? 'Puntos' :
                                                        metric === 'assists_per_game' ? 'Asistencias' :
                                                            metric === 'rebounds_per_game' ? 'Rebotes' : 'Eficiencia'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Gráfico */}
                                    {teamTrendsData && teamTrendsData.seasons && teamTrendsData.seasons.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={260}>
                                            <LineChart data={teamTrendsData.seasons.map((season, idx) => ({
                                                season,
                                                value: teamTrendsData.values[idx]
                                            }))}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                                <XAxis
                                                    dataKey="season"
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                    stroke="#9ca3af"
                                                />
                                                <YAxis
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                    stroke="#9ca3af"
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                    formatter={(value) => [value.toFixed(2), getTeamMetricLabel(teamMetric)]}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#CE1126"
                                                    strokeWidth={3}
                                                    dot={{ r: 5, fill: '#CE1126', stroke: '#fff', strokeWidth: 2 }}
                                                    activeDot={{ r: 7 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-60 flex items-center justify-center text-gray-500">
                                            <p>No hay datos de tendencias disponibles</p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Grid 2 Columnas: Récords y Distribución */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                                    {/* Récords Históricos */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.25 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                                    >
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                            Récords Históricos
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 border-l-4 border-green-500">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Victorias Totales</span>
                                                <span className="text-lg font-black text-green-600">{teamData.overview?.total_wins || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20 border-l-4 border-red-500">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Derrotas Totales</span>
                                                <span className="text-lg font-black text-red-600">{teamData.overview?.total_losses || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 border-l-4 border-blue-500">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mejor % de Victoria</span>
                                                <span className="text-lg font-black text-blue-600">{((teamData.overview?.win_percentage || 0) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 border-l-4 border-purple-500">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Promedio de Puntos</span>
                                                <span className="text-lg font-black text-purple-600">{(teamData.offense?.efficiency_metrics?.avg_points || 0).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Distribución Victorias/Derrotas */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
                                    >
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                            Distribución de Resultados
                                        </h3>
                                        <div className="space-y-3">
                                            {/* Barra de Victorias */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-green-600">Victorias</span>
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{teamData.overview?.total_wins || 0}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                    <div
                                                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${((teamData.overview?.win_percentage || 0) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Barra de Derrotas */}
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-red-600">Derrotas</span>
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{teamData.overview?.total_losses || 0}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                                    <div
                                                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${(100 - (teamData.overview?.win_percentage || 0) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Estadísticas adicionales */}
                                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Partidos</p>
                                                    <p className="text-xl font-black text-gray-900 dark:text-white">{teamData.overview?.total_games || 0}</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Eficiencia</p>
                                                    <p className="text-xl font-black text-gray-900 dark:text-white">{(teamData.overview?.momentum?.avg_efficiency || 0).toFixed(1)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Tabla Comparativa de Métricas */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.35 }}
                                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mt-4"
                                >
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                        Métricas Clave del Equipo
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                                    <th className="text-left py-2 px-3 font-bold text-gray-700 dark:text-gray-300 uppercase">Métrica</th>
                                                    <th className="text-center py-2 px-3 font-bold text-[#CE1126]">Ofensiva</th>
                                                    <th className="text-center py-2 px-3 font-bold text-[#002D62]">Defensiva</th>
                                                    <th className="text-center py-2 px-3 font-bold text-gray-700 dark:text-gray-300">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">Puntos/J</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#CE1126]">{(teamData.offense?.efficiency_metrics?.avg_points || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 text-gray-400">-</td>
                                                    <td className="text-center py-2 px-3 font-black text-gray-900 dark:text-white">{(teamData.offense?.efficiency_metrics?.avg_points || 0).toFixed(1)}</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">Asistencias/J</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#CE1126]">{(teamData.offense?.playmaking?.avg_assists || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 text-gray-400">-</td>
                                                    <td className="text-center py-2 px-3 font-black text-gray-900 dark:text-white">{(teamData.offense?.playmaking?.avg_assists || 0).toFixed(1)}</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">Rebotes/J</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#CE1126]">{(teamData.offense?.playmaking?.avg_offensive_rebounds || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#002D62]">{(teamData.defense?.defensive_actions?.avg_defensive_rebounds || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 font-black text-gray-900 dark:text-white">{(teamData.overview?.rebounding?.avg_total_rebounds || 0).toFixed(1)}</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">Robos/J</td>
                                                    <td className="text-center py-2 px-3 text-gray-400">-</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#002D62]">{(teamData.defense?.defensive_actions?.avg_steals || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 font-black text-gray-900 dark:text-white">{(teamData.defense?.defensive_actions?.avg_steals || 0).toFixed(1)}</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">Bloqueos/J</td>
                                                    <td className="text-center py-2 px-3 text-gray-400">-</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#002D62]">{(teamData.defense?.defensive_actions?.avg_blocks || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 font-black text-gray-900 dark:text-white">{(teamData.defense?.defensive_actions?.avg_blocks || 0).toFixed(1)}</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-gray-50 dark:bg-gray-800/30">
                                                    <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">Eficiencia</td>
                                                    <td className="text-center py-2 px-3 font-black text-[#CE1126]">{(teamData.offense?.efficiency_metrics?.avg_efficiency || 0).toFixed(1)}</td>
                                                    <td className="text-center py-2 px-3 text-gray-400">-</td>
                                                    <td className="text-center py-2 px-3 font-black text-gray-900 dark:text-white">{(teamData.overview?.momentum?.avg_efficiency || 0).toFixed(1)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-gray-500 dark:text-gray-400">No se pudieron cargar los datos del equipo</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default ModernAnalytics;

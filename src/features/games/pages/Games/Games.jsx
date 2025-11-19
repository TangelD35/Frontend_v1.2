import {
    Plus,
    Calendar,
    Clock,
    MapPin,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    Trophy,
    Target,
    Activity,
    Zap,
    Shield,
    Star,
    Users,
    TrendingUp,
    X,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    Grid,
    List,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useFilters from '../../../../shared/hooks/useFilters';
import { gameSchema } from '../../../../lib/validations/schemas';
import { useGames } from '../../hooks/useGames';
import { useTeams } from '../../../teams/hooks/useTeams';
import { useTournaments } from '../../../tournaments/hooks/useTournaments';
import { gamesService } from '../../../../shared/api/endpoints/games';
import { advancedAnalyticsService } from '../../../../shared/api/endpoints/advancedAnalytics';
import { GlassCard, AnimatedButton, LoadingState, ErrorState, ModernModal, ToastContainer } from '../../../../shared/ui/components/modern';

import {
    Table,
    Input,
    Select,
    StatusIndicator,
    PageHeader
} from '../../../../shared/ui/components/common';

// Importar banderas SVG - América
import BanderaUSA from '../../../../assets/icons/us.svg';
import BanderaCanada from '../../../../assets/icons/ca.svg';
import BanderaMexico from '../../../../assets/icons/mx.svg';
import BanderaDominicana from '../../../../assets/icons/do.svg';
import BanderaPuertoRico from '../../../../assets/icons/pr.svg';
import BanderaCuba from '../../../../assets/icons/cu.svg';
import BanderaPanama from '../../../../assets/icons/pa.svg';
import BanderaCostaRica from '../../../../assets/icons/cr.svg';
import BanderaArgentina from '../../../../assets/icons/ar.svg';
import BanderaBrasil from '../../../../assets/icons/br.svg';
import BanderaChile from '../../../../assets/icons/cl.svg';
import BanderaColombia from '../../../../assets/icons/co.svg';
import BanderaVenezuela from '../../../../assets/icons/ve.svg';
import BanderaUruguay from '../../../../assets/icons/uy.svg';
import BanderaParaguay from '../../../../assets/icons/py.svg';
import BanderaPeru from '../../../../assets/icons/pe.svg';
import BanderaEcuador from '../../../../assets/icons/ec.svg';
import BanderaNicaragua from '../../../../assets/icons/ni.svg';
import BanderaJamaica from '../../../../assets/icons/jm.svg';
import BanderaBahamas from '../../../../assets/icons/bs.svg';
import BanderaIslasVirgenes from '../../../../assets/icons/vi.svg';
import BanderaIslasVirgenesBritanicas from '../../../../assets/icons/vg.svg';

// Importar banderas SVG - Europa
import BanderaAlemania from '../../../../assets/icons/de.svg';
import BanderaFrancia from '../../../../assets/icons/fr.svg';
import BanderaItalia from '../../../../assets/icons/it.svg';
import BanderaEslovenia from '../../../../assets/icons/si.svg';
import BanderaSerbia from '../../../../assets/icons/rs.svg';
import BanderaLituania from '../../../../assets/icons/lt.svg';
import BanderaTurquia from '../../../../assets/icons/tr.svg';
import BanderaFinlandia from '../../../../assets/icons/fi.svg';
import BanderaUcrania from '../../../../assets/icons/ua.svg';
import BanderaMacedonia from '../../../../assets/icons/mk.svg';
import BanderaRusia from '../../../../assets/icons/ru.svg';

// Importar banderas SVG - Asia y Oceanía
import BanderaFilipinas from '../../../../assets/icons/ph.svg';
import BanderaAustralia from '../../../../assets/icons/au.svg';
import BanderaNuevaZelanda from '../../../../assets/icons/nz.svg';
import BanderaCoreaDelSur from '../../../../assets/icons/kr.svg';
import BanderaJordan from '../../../../assets/icons/jo.svg';

// Importar banderas SVG - África
import BanderaAngola from '../../../../assets/icons/ao.svg';
import BanderaNigeria from '../../../../assets/icons/ng.svg';

// Componente de Logo RDscore
const RDScoreLogo = ({ size = 48, className = "" }) => (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <img
            src="/logo-rdscore.png"
            alt="RDscore Logo"
            className="w-full h-full object-contain rounded-xl shadow-2xl"
            style={{ width: size, height: size }}
        />
    </div>
);

// Componente de Estadística Deportiva Personalizada
const SportsStat = ({ icon: Icon, value, label, trend, color = "blue", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay }}
        className="relative group"
    >
        <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-2xl"></div>

            {/* Contenido */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br from-${color}-500/20 to-${color}-600/30 rounded-xl shadow-lg`}>
                        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-semibold">+{trend}%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {value}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                </div>
            </div>

            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </div>
    </motion.div>
);

// Función para obtener la bandera SVG del país
const getCountryFlag = (countryName) => {
    if (!countryName) return BanderaDominicana;

    // Mapeo directo de nombres de países a banderas
    const flagMap = {
        // América del Norte
        'ESTADOS UNIDOS': BanderaUSA, 'USA': BanderaUSA, 'US': BanderaUSA, 'UNITED STATES': BanderaUSA,
        'CANADÁ': BanderaCanada, 'CANADA': BanderaCanada, 'CAN': BanderaCanada,
        'MÉXICO': BanderaMexico, 'MEXICO': BanderaMexico, 'MEX': BanderaMexico,

        // América Central y Caribe
        'REPÚBLICA DOMINICANA': BanderaDominicana, 'REPUBLICA DOMINICANA': BanderaDominicana, 'DOMINICAN REPUBLIC': BanderaDominicana, 'DOM': BanderaDominicana,
        'PUERTO RICO': BanderaPuertoRico, 'PUR': BanderaPuertoRico,
        'CUBA': BanderaCuba, 'CUB': BanderaCuba,
        'PANAMÁ': BanderaPanama, 'PANAMA': BanderaPanama, 'PAN': BanderaPanama,
        'COSTA RICA': BanderaCostaRica, 'CRC': BanderaCostaRica,
        'NICARAGUA': BanderaNicaragua, 'NIC': BanderaNicaragua, 'NCA': BanderaNicaragua,
        'JAMAICA': BanderaJamaica, 'JAM': BanderaJamaica,
        'BAHAMAS': BanderaBahamas, 'BAH': BanderaBahamas,
        'ISLAS VÍRGENES': BanderaIslasVirgenes, 'ISLAS VIRGENES': BanderaIslasVirgenes, 'VIRGIN ISLANDS': BanderaIslasVirgenes, 'VIR': BanderaIslasVirgenes,
        'ISLAS VÍRGENES BRITÁNICAS': BanderaIslasVirgenesBritanicas, 'ISLAS VIRGENES BRITANICAS': BanderaIslasVirgenesBritanicas, 'BRITISH VIRGIN ISLANDS': BanderaIslasVirgenesBritanicas, 'VGB': BanderaIslasVirgenesBritanicas,

        // América del Sur
        'ARGENTINA': BanderaArgentina, 'ARG': BanderaArgentina,
        'BRASIL': BanderaBrasil, 'BRAZIL': BanderaBrasil, 'BRA': BanderaBrasil,
        'CHILE': BanderaChile, 'CHI': BanderaChile,
        'COLOMBIA': BanderaColombia, 'COL': BanderaColombia,
        'VENEZUELA': BanderaVenezuela, 'VEN': BanderaVenezuela,
        'URUGUAY': BanderaUruguay, 'URU': BanderaUruguay,
        'PARAGUAY': BanderaParaguay, 'PAR': BanderaParaguay,
        'PERÚ': BanderaPeru, 'PERU': BanderaPeru, 'PER': BanderaPeru,
        'ECUADOR': BanderaEcuador, 'ECU': BanderaEcuador,

        // Europa
        'ALEMANIA': BanderaAlemania, 'GERMANY': BanderaAlemania, 'GER': BanderaAlemania,
        'FRANCIA': BanderaFrancia, 'FRANCE': BanderaFrancia, 'FRA': BanderaFrancia,
        'ITALIA': BanderaItalia, 'ITALY': BanderaItalia, 'ITA': BanderaItalia,
        'ESLOVENIA': BanderaEslovenia, 'SLOVENIA': BanderaEslovenia, 'SLO': BanderaEslovenia,
        'SERBIA': BanderaSerbia, 'SRB': BanderaSerbia,
        'LITUANIA': BanderaLituania, 'LITHUANIA': BanderaLituania, 'LTU': BanderaLituania,
        'TURQUÍA': BanderaTurquia, 'TURQUIA': BanderaTurquia, 'TURKEY': BanderaTurquia, 'TUR': BanderaTurquia,
        'FINLANDIA': BanderaFinlandia, 'FINLAND': BanderaFinlandia, 'FIN': BanderaFinlandia,
        'UCRANIA': BanderaUcrania, 'UKRAINE': BanderaUcrania, 'UKR': BanderaUcrania,
        'MACEDONIA DEL NORTE': BanderaMacedonia, 'MACEDONIA': BanderaMacedonia, 'NORTH MACEDONIA': BanderaMacedonia, 'MKD': BanderaMacedonia,
        'RUSIA': BanderaRusia, 'RUSSIA': BanderaRusia, 'RUS': BanderaRusia,

        // Asia y Oceanía
        'FILIPINAS': BanderaFilipinas, 'PHILIPPINES': BanderaFilipinas, 'PHI': BanderaFilipinas,
        'AUSTRALIA': BanderaAustralia, 'AUS': BanderaAustralia,
        'NUEVA ZELANDA': BanderaNuevaZelanda, 'NEW ZEALAND': BanderaNuevaZelanda, 'NZL': BanderaNuevaZelanda,
        'COREA DEL SUR': BanderaCoreaDelSur, 'SOUTH KOREA': BanderaCoreaDelSur, 'KOR': BanderaCoreaDelSur,
        'JORDAN': BanderaJordan, 'JOR': BanderaJordan,

        // África
        'ANGOLA': BanderaAngola, 'ANG': BanderaAngola, 'AGO': BanderaAngola,
        'NIGERIA': BanderaNigeria, 'NGR': BanderaNigeria, 'NGA': BanderaNigeria
    };

    // Buscar en el mapa con el nombre en mayúsculas
    const upperName = countryName.toUpperCase().trim();
    return flagMap[upperName] || BanderaDominicana;
};

const Games = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [hasAdminPermissions, setHasAdminPermissions] = useState(true); // Por defecto true, se actualizará con el primer error 403

    // Hooks para obtener datos reales desde la API
    const { games, loading, error, pagination, filters, createGame, updateGame, deleteGame, updateFilters, updatePagination, adjustLimit, refetch } = useGames();
    const { teams } = useTeams({ limit: 200 });
    const { tournaments } = useTournaments();

    // Estado para almacenar TODOS los partidos (sin paginación) para estadísticas
    const [allGames, setAllGames] = useState([]);

    // Estado para estadísticas del equipo desde analytics
    const [teamStats, setTeamStats] = useState({
        victories: 0,
        losses: 0,
        winRate: 0,
        totalGames: 0
    });

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
    const teamNameById = {
        'republica_dominicana': 'República Dominicana'
    };
    (teams || []).forEach(team => {
        if (team?.id) {
            teamNameById[team.id] = team.name;
        }
    });

    const tournamentNameById = {
        'copa_mundial_fiba_2023': 'Copa Mundial FIBA 2023',
        'americup_2022': 'AmeriCup 2022',
        'centrobasket_2024': 'Centrobasket 2024',
        'clasificatorias_fiba': 'Clasificatorias FIBA'
    };
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
            homeFlag: getCountryFlag(homeName),
            awayFlag: getCountryFlag(awayName),
            homeScore: game.home_score,
            awayScore: game.away_score,
            date: dateObj ? dateObj.toISOString() : null,
            time: dateObj
                ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                : '--:--',
            venue: game.location || 'Sin sede',
            tournament: tournamentName,
            status: game.status || 'unknown', // Mostrar 'unknown' si el estado es null/undefined
        };
    });

    // Cargar estadísticas del equipo República Dominicana desde analytics
    useEffect(() => {
        const fetchTeamStats = async () => {
            try {
                // Obtener el ID del equipo República Dominicana
                const rdTeam = (teams || []).find(t =>
                    t.name?.toLowerCase().includes('dominicana') ||
                    t.id === 'republica_dominicana'
                );

                if (!rdTeam) {
                    console.warn('⚠️ No se encontró el equipo República Dominicana');
                    return;
                }

                // Obtener tendencias del equipo (2010-2025)
                const trends = await advancedAnalyticsService.getTeamTrends(rdTeam.id, 2010, 2025);

                // Sumar todas las victorias y derrotas de todos los períodos
                let totalVictories = 0;
                let totalLosses = 0;
                let totalGames = 0;

                if (trends && Array.isArray(trends)) {
                    trends.forEach(period => {
                        // El backend devuelve 'wins' y 'losses' directamente
                        totalVictories += period.wins || 0;
                        totalLosses += period.losses || 0;
                        // El backend devuelve 'games' en lugar de 'total_games'
                        totalGames += period.games || 0;
                    });
                }

                const winRate = totalGames > 0 ? Math.round((totalVictories / totalGames) * 100) : 0;

                setTeamStats({
                    victories: totalVictories,
                    losses: totalLosses,
                    winRate: winRate,
                    totalGames: totalGames
                });

                // Verificar discrepancia entre partidos del analytics vs base de datos
                console.log('📊 ESTADÍSTICAS DEL EQUIPO:');
                console.log('  - Total partidos (analytics):', totalGames);
                console.log('  - Victorias:', totalVictories);
                console.log('  - Derrotas:', totalLosses);
                console.log('  - Win Rate:', winRate + '%');
                console.log('  - Períodos analizados:', trends.length);
                console.log('  - Suma V+D:', totalVictories + totalLosses);
                if (totalGames !== (totalVictories + totalLosses)) {
                    console.warn('⚠️ DISCREPANCIA: Total partidos (' + totalGames + ') no coincide con V+D (' + (totalVictories + totalLosses) + ')');
                }

            } catch (err) {
                console.error('❌ Error al cargar estadísticas del equipo:', err);
            }
        };

        if (teams && teams.length > 0) {
            fetchTeamStats();
        }
    }, [teams]); // Recargar cuando se carguen los equipos

    // Cargar TODOS los partidos para estadísticas (sin paginación)
    useEffect(() => {
        const fetchAllGames = async () => {
            try {
                // Solicitar todos los partidos con un límite alto
                const response = await gamesService.getAll({ limit: 1000, skip: 0 });
                const allGamesData = Array.isArray(response) ? response : (response?.items || []);
                setAllGames(allGamesData);
                console.log('📊 Total de partidos en base de datos:', allGamesData.length);
            } catch (err) {
                console.error('Error al cargar todos los partidos:', err);
            }
        };

        fetchAllGames();
    }, [filters]); // Recargar cuando cambien los filtros

    // Detectar tamaño de pantalla para ajustar sidebar
    useEffect(() => {
        const checkSidebarState = () => {
            const isLargeScreen = window.innerWidth >= 1024;
            setIsSidebarOpen(isLargeScreen);
        };

        checkSidebarState();
        window.addEventListener('resize', checkSidebarState);
        return () => window.removeEventListener('resize', checkSidebarState);
    }, []);

    // Mapear TODOS los partidos para estadísticas
    const allMappedGames = (allGames || []).map((game) => {
        const homeName = teamNameById[game.home_team_id] || 'Equipo local';
        const awayName = teamNameById[game.away_team_id] || 'Equipo visitante';

        return {
            id: game.id,
            homeTeam: homeName,
            awayTeam: awayName,
            homeScore: game.home_score,
            awayScore: game.away_score,
            status: game.status || 'unknown',
        };
    });

    // Detectar países sin bandera (usando bandera dominicana como placeholder) - SOLO UNA VEZ
    useEffect(() => {
        if (allGames.length > 0) {
            const countriesWithoutFlag = new Set();

            allGames.forEach(game => {
                const homeName = teamNameById[game.home_team_id] || 'Equipo local';
                const awayName = teamNameById[game.away_team_id] || 'Equipo visitante';

                const homeFlag = getCountryFlag(homeName);
                const awayFlag = getCountryFlag(awayName);

                // Si la bandera es la dominicana pero el equipo NO es República Dominicana
                if (homeFlag === BanderaDominicana && !homeName.toLowerCase().includes('dominicana')) {
                    countriesWithoutFlag.add(homeName);
                }
                if (awayFlag === BanderaDominicana && !awayName.toLowerCase().includes('dominicana')) {
                    countriesWithoutFlag.add(awayName);
                }
            });

            if (countriesWithoutFlag.size > 0) {
                console.log('🚩 PAÍSES SIN BANDERA (total: ' + countriesWithoutFlag.size + '):');
                const sortedCountries = Array.from(countriesWithoutFlag).sort();
                sortedCountries.forEach(country => {
                    console.log('  ❌', country);
                });
            }
        }
    }, [allGames.length]); // Solo ejecutar cuando cambie la cantidad de partidos

    // Contar partidos programados desde todos los partidos
    const upcomingGames = allMappedGames.filter(g => g.status === 'scheduled' || g.status === 'programado').length;

    // Configuración de columnas
    const columns = [
        {
            key: 'teams',
            label: 'Encuentro',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-start gap-4 py-3">
                    {/* Equipo Local */}
                    <div className="flex flex-col items-center text-center min-w-[140px]">
                        <img
                            src={row.homeFlag}
                            alt={row.homeTeam}
                            className="w-14 h-14 object-cover rounded-lg shadow-lg mb-3 border-2 border-gray-200 dark:border-gray-700"
                        />
                        <p className="text-sm font-bold text-gray-900 dark:text-white tracking-wide leading-tight">{row.homeTeam}</p>
                    </div>

                    {/* Marcador o VS */}
                    <div className="flex flex-col items-center justify-center px-6 pt-2">
                        {(row.status === 'completed' || row.status === 'finalizado') ? (
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{row.homeScore}</span>
                                <span className="text-gray-400 font-bold text-xl">-</span>
                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{row.awayScore}</span>
                            </div>
                        ) : (
                            <div className="text-3xl font-black tracking-tight leading-none">
                                <span
                                    className="text-[#002D62]"
                                    style={{ color: '#002D62' }}
                                >
                                    V
                                </span>
                                <span
                                    className="text-[#CE1126]"
                                    style={{ color: '#CE1126' }}
                                >
                                    S
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex flex-col items-center text-center min-w-[140px]">
                        <img
                            src={row.awayFlag}
                            alt={row.awayTeam}
                            className="w-14 h-14 object-cover rounded-lg shadow-lg mb-3 border-2 border-gray-200 dark:border-gray-700"
                        />
                        <p className="text-sm font-bold text-gray-900 dark:text-white tracking-wide leading-tight">{row.awayTeam}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'tournament',
            label: 'Torneo',
            render: (value) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm tracking-wide">{value}</p>
                </div>
            )
        },
        {
            key: 'datetime',
            label: 'Fecha y Hora',
            sortable: false,
            render: (_, row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">
                            {row.date ? new Date(row.date).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium">{row.time}</span>
                    </div>
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
                    finalizado: { status: 'inactive', label: 'Finalizado' },
                    scheduled: { status: 'pending', label: 'Programado' },
                    programado: { status: 'pending', label: 'Programado' },
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
                            if (hasAdminPermissions) {
                                handleEdit(row);
                            } else {
                                showToast(
                                    'warning',
                                    'Permisos Requeridos',
                                    'Necesitas permisos de administrador para editar encuentros.'
                                );
                            }
                        }}
                        disabled={!hasAdminPermissions}
                        className={`p-2 rounded-lg transition-colors ${hasAdminPermissions
                            ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    // Función para mostrar toasts modernos
    const showToast = (type, title, message) => {
        const id = Date.now();
        const newToast = {
            id,
            type,
            title,
            message,
            duration: 5000
        };
        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Funciones de manejo
    const handleEdit = (game) => {
        // Buscar el juego original para obtener los IDs reales
        const originalGame = (games || []).find(g => g.id === game.id);

        // Debug: ver qué datos se están cargando para edición
        console.log('🔧 Editando partido:', game);
        console.log('📋 Datos originales:', originalGame);
        console.log('🏠 Home team ID:', originalGame?.home_team_id);
        console.log('✈️ Away team ID:', originalGame?.away_team_id);
        console.log('🏆 Tournament ID:', originalGame?.tournament_id);
        console.log('📍 Location:', originalGame?.location);

        setSelectedGame(game);
        setFieldValue('homeTeam', originalGame?.home_team_id || '');
        setFieldValue('awayTeam', originalGame?.away_team_id || '');
        setFieldValue('date', game.date ? game.date.split('T')[0] : '');
        setFieldValue('time', game.time);
        setFieldValue('venue', originalGame?.location || ''); // Usar el campo original location
        setFieldValue('tournament', originalGame?.tournament_id || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (game) => {
        if (confirm(`¿Eliminar el partido ${game.homeTeam} vs ${game.awayTeam}?`)) {
            try {
                await deleteGame(game.id);
                showToast(
                    'success',
                    'Partido eliminado',
                    `El partido ${game.homeTeam} vs ${game.awayTeam} ha sido eliminado correctamente.`
                );
            } catch (error) {
                console.error('Error al eliminar partido:', error);

                // Manejo específico de errores de permisos
                if (error.status === 403) {
                    setHasAdminPermissions(false); // Actualizar estado de permisos
                    showToast(
                        'error',
                        'Acceso Denegado',
                        'No tienes permisos de administrador para eliminar partidos. Contacta al administrador del sistema.'
                    );
                } else if (error.status === 401) {
                    showToast(
                        'error',
                        'Sesión Expirada',
                        'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                    );
                } else {
                    showToast(
                        'error',
                        'Error al eliminar',
                        error.message || 'No se pudo eliminar el partido. Por favor, inténtalo de nuevo.'
                    );
                }
            }
        }
    };

    const onSubmit = async (formData) => {
        try {
            const isEditing = selectedGame !== null;

            // Validar que todos los campos requeridos estén presentes
            if (!formData.homeTeam || !formData.awayTeam || !formData.date || !formData.time || !formData.venue || !formData.tournament) {
                showToast(
                    'error',
                    'Campos Requeridos',
                    'Por favor, completa todos los campos antes de guardar el partido.'
                );
                return;
            }

            // Validar y preparar fecha
            const gameDateTime = new Date(`${formData.date}T${formData.time}`);
            if (isNaN(gameDateTime.getTime())) {
                showToast(
                    'error',
                    'Fecha Inválida',
                    'La fecha y hora proporcionadas no son válidas.'
                );
                return;
            }

            // Preparar datos para la API
            const gameData = {
                home_team_id: formData.homeTeam,
                away_team_id: formData.awayTeam,
                game_date: gameDateTime.toISOString(),
                location: formData.venue,
                tournament_id: formData.tournament,
                status: 'scheduled'
            };

            // Debug temporal: ver qué datos se están enviando
            console.log('📤 Datos enviados al backend:', gameData);
            console.log('📝 Datos del formulario:', formData);
            console.log('👥 Equipos disponibles:', teams?.length || 0, teams);
            console.log('🏆 Torneos disponibles:', tournaments?.length || 0, tournaments);

            // Obtener nombres para mostrar en los toasts
            const homeTeamName = teamNameById[formData.homeTeam] || formData.homeTeam;
            const awayTeamName = teamNameById[formData.awayTeam] || formData.awayTeam;

            if (isEditing) {
                // Actualizar partido existente
                await updateGame(selectedGame.id, gameData);
                showToast(
                    'success',
                    'Encuentro actualizado',
                    `El encuentro ${homeTeamName} vs ${awayTeamName} ha sido actualizado correctamente.`
                );
            } else {
                // Crear nuevo partido
                await createGame(gameData);
                showToast(
                    'success',
                    'Encuentro programado',
                    `El encuentro ${homeTeamName} vs ${awayTeamName} ha sido programado para el ${new Date(formData.date).toLocaleDateString('es-ES')}.`
                );
            }

            setIsModalOpen(false);
            reset();
        } catch (error) {
            console.error('Error al guardar partido:', error);

            // Manejo específico de errores de permisos
            if (error.status === 403) {
                setHasAdminPermissions(false); // Actualizar estado de permisos
                showToast(
                    'error',
                    'Acceso Denegado',
                    'No tienes permisos de administrador para crear partidos. Contacta al administrador del sistema.'
                );
            } else if (error.status === 401) {
                showToast(
                    'error',
                    'Sesión Expirada',
                    'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                );
            } else if (error.status === 422) {
                // Mostrar detalles específicos del error de validación
                console.log('❌ Error 422 details:', error.response?.data);
                const errorDetails = error.response?.data?.details || {};
                const errorMessages = Object.values(errorDetails).flat();
                const detailMessage = errorMessages.length > 0
                    ? errorMessages.join(', ')
                    : 'Los datos del formulario no son válidos. Verifica que todos los campos estén completos y correctos.';

                showToast(
                    'error',
                    'Datos Inválidos',
                    detailMessage
                );
            } else {
                showToast(
                    'error',
                    'Error al guardar',
                    error.message || 'No se pudo guardar el partido. Por favor, inténtalo de nuevo.'
                );
            }
        }
    };

    const openCreateModal = () => {
        setSelectedGame(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleRefresh = async () => {
        try {
            await refetch();
            showToast(
                'success',
                'Datos actualizados',
                'La información de los partidos ha sido actualizada correctamente.'
            );
        } catch (error) {
            showToast(
                'error',
                'Error al actualizar',
                'No se pudieron actualizar los datos. Verifica tu conexión e inténtalo de nuevo.'
            );
        }
    };


    // Ajustar límite de elementos por página cuando cambie el estado del sidebar
    useEffect(() => {
        adjustLimit(isSidebarOpen);
    }, [isSidebarOpen, adjustLimit]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Header */}
                <PageHeader
                    title="Gestión de Partidos"
                    subtitle="Selección Nacional • República Dominicana"
                    action={
                        <button
                            onClick={hasAdminPermissions ? openCreateModal : () => {
                                showToast(
                                    'warning',
                                    'Permisos Requeridos',
                                    'Necesitas permisos de administrador para programar encuentros.'
                                );
                            }}
                            disabled={!hasAdminPermissions}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${hasAdminPermissions
                                ? 'bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white hover:shadow-lg'
                                : 'text-gray-500 cursor-not-allowed opacity-60'
                                }`}
                        >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Programar Encuentro
                        </button>
                    }
                />
                {/* Estadísticas - 4 Cards KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {/* Total Partidos */}
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
                            {teamStats.totalGames}
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
                            {teamStats.victories}
                        </p>
                    </motion.div>

                    {/* Derrotas */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 text-center"
                    >
                        <p className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                            Derrotas
                        </p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                            {teamStats.losses || 0}
                        </p>
                    </motion.div>

                    {/* Porcentaje de Victorias */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 text-center"
                    >
                        <p className="text-sm font-bold uppercase tracking-wider text-[#002D62] mb-2">
                            % Victoria
                        </p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                            {teamStats.winRate}%
                        </p>
                    </motion.div>
                </div>

                {/* Filtros */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6 shadow-md border border-gray-200 dark:border-gray-700"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Filtro por Torneo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Torneo o Competición
                            </label>
                            <div className="relative">
                                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={filters.tournament_id || 'todos'}
                                    onChange={(e) => updateFilters({ tournament_id: e.target.value === 'todos' ? null : e.target.value })}
                                    className="w-full pl-10 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="todos">Todas las competiciones</option>
                                    {(tournaments || []).map((tournament) => (
                                        <option key={tournament.id} value={tournament.id}>
                                            {tournament.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* Filtro por Equipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Equipo Participante
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={filters.team_id || 'todos'}
                                    onChange={(e) => updateFilters({ team_id: e.target.value === 'todos' ? null : e.target.value })}
                                    className="w-full pl-10 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="todos">Todos los equipos</option>
                                    {(teams || []).map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Indicadores de filtros activos */}
                    {(filters.tournament_id || filters.team_id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Filtros activos:
                                    </span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {filters.tournament_id && (
                                            <span className="px-2 py-1 bg-[#002D62]/10 text-[#002D62] dark:bg-[#002D62]/20 dark:text-[#002D62] text-[10px] font-bold rounded-md">
                                                Torneo
                                            </span>
                                        )}
                                        {filters.team_id && (
                                            <span className="px-2 py-1 bg-[#CE1126]/10 text-[#CE1126] dark:bg-[#CE1126]/20 dark:text-[#CE1126] text-[10px] font-bold rounded-md">
                                                Equipo
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        updateFilters({ tournament_id: null, team_id: null });
                                    }}
                                    className="text-xs font-bold text-[#CE1126] hover:underline transition-all"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Tabla de partidos mejorada */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10 rounded-lg">
                                        <Calendar className="w-5 h-5 text-[#CE1126]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Encuentros Programados
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Calendario oficial de la Selección Nacional
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#CE1126] dark:hover:text-[#CE1126] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                                    title="Actualizar"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <LoadingState
                                    title="Cargando encuentros"
                                    description="Obteniendo información actualizada de los partidos..."
                                />
                            ) : error ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Error al cargar encuentros
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        {error}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                        <button
                                            onClick={() => refetch()}
                                            className="px-4 py-2 bg-[#CE1126] hover:bg-[#a00e1e] text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            <RefreshCw className="w-4 h-4 inline mr-2" />
                                            Reintentar
                                        </button>
                                    </div>
                                </div>
                            ) : mappedGames.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#CE1126]/20 to-[#002D62]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {(filters.tournament_id || filters.team_id) ? (
                                            <Activity className="w-10 h-10 text-[#CE1126]" />
                                        ) : (
                                            <Calendar className="w-10 h-10 text-[#CE1126]" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {(filters.tournament_id || filters.team_id) ? 'Sin resultados con estos filtros' : 'Sin encuentros programados'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {(filters.tournament_id || filters.team_id)
                                            ? 'No se encontraron partidos que coincidan con los filtros seleccionados. Intenta con otros criterios.'
                                            : 'No hay partidos registrados en el sistema actualmente.'
                                        }
                                    </p>
                                    {(filters.tournament_id || filters.team_id) ? (
                                        <button
                                            onClick={() => {
                                                updateFilters({ tournament_id: null, team_id: null });
                                            }}
                                            className="px-4 py-2 bg-[#002D62] hover:bg-[#001a3d] text-white text-sm font-bold rounded-lg transition-all"
                                        >
                                            Limpiar filtros
                                        </button>
                                    ) : (
                                        <button
                                            onClick={hasAdminPermissions ? openCreateModal : () => {
                                                showToast(
                                                    'warning',
                                                    'Permisos Requeridos',
                                                    'Necesitas permisos de administrador para programar encuentros.'
                                                );
                                            }}
                                            disabled={!hasAdminPermissions}
                                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${hasAdminPermissions
                                                ? 'bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white cursor-pointer'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                                }`}
                                        >
                                            Programar Primer Encuentro
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {/* Tabla personalizada mejorada */}
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                {/* Header de la tabla */}
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                            Encuentro
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                            Torneo
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                            Fecha
                                                        </th>
                                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                            Acciones
                                                        </th>
                                                    </tr>
                                                </thead>

                                                {/* Cuerpo de la tabla */}
                                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {mappedGames.map((game, index) => (
                                                        <tr
                                                            key={game.id}
                                                            onClick={() => navigate(`/games/${game.id}`)}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                        >
                                                            {/* Columna Encuentro */}
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {/* Equipo Local */}
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        <div className="w-6 h-6 rounded overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                                                                            <img src={getCountryFlag(game.homeTeam)} alt={game.homeTeam} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                            {game.homeTeam}
                                                                        </p>
                                                                    </div>

                                                                    {/* Marcador/VS */}
                                                                    <div className="flex items-center gap-2 px-3">
                                                                        {game.status === 'completed' ? (
                                                                            <>
                                                                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                                                                    {game.homeScore}
                                                                                </span>
                                                                                <span className="text-gray-400">-</span>
                                                                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                                                                    {game.awayScore}
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                                                                VS
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Equipo Visitante */}
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                                            {game.awayTeam}
                                                                        </p>
                                                                        <div className="w-6 h-6 rounded overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                                                                            <img src={getCountryFlag(game.awayTeam)} alt={game.awayTeam} className="w-full h-full object-cover" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Columna Torneo */}
                                                            <td className="px-4 py-4 text-center">
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                                    {game.tournament}
                                                                </p>
                                                            </td>

                                                            {/* Columna Fecha */}
                                                            <td className="px-4 py-4 text-center">
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                                    {game.date ? new Date(game.date).toLocaleDateString('es-ES', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    }) : 'Sin fecha'}
                                                                </span>
                                                            </td>

                                                            {/* Columna Acciones */}
                                                            <td className="px-4 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/games/${game.id}`);
                                                                        }}
                                                                        className="px-2 py-1 bg-[#002D62] hover:bg-[#001a3d] text-white text-[10px] font-bold rounded transition-all"
                                                                        title="Ver detalles"
                                                                    >
                                                                        Ver
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (hasAdminPermissions) {
                                                                                handleEdit(game);
                                                                            } else {
                                                                                showToast(
                                                                                    'warning',
                                                                                    'Permisos Requeridos',
                                                                                    'Necesitas permisos de administrador para editar encuentros.'
                                                                                );
                                                                            }
                                                                        }}
                                                                        disabled={!hasAdminPermissions}
                                                                        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${hasAdminPermissions
                                                                            ? 'bg-white hover:bg-gray-50 text-[#002D62] border border-[#002D62] cursor-pointer'
                                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                                                                            }`}
                                                                        title={hasAdminPermissions ? "Editar" : "Permisos requeridos"}
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (hasAdminPermissions) {
                                                                                handleDelete(game);
                                                                            } else {
                                                                                showToast(
                                                                                    'warning',
                                                                                    'Permisos Requeridos',
                                                                                    'Necesitas permisos de administrador para eliminar encuentros.'
                                                                                );
                                                                            }
                                                                        }}
                                                                        disabled={!hasAdminPermissions}
                                                                        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${hasAdminPermissions
                                                                            ? 'bg-[#CE1126] hover:bg-[#a00e1e] text-white cursor-pointer'
                                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                                                            }`}
                                                                        title={hasAdminPermissions ? "Eliminar" : "Permisos requeridos"}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Paginación */}
                {pagination.total > pagination.limit && (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Mostrando {pagination.skip + 1} a {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total} encuentros
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updatePagination({ skip: Math.max(0, pagination.skip - pagination.limit) })}
                                    disabled={pagination.skip === 0}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    Anterior
                                </button>

                                {/* Números de página */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => {
                                        const pageNumber = i + 1;
                                        const isCurrentPage = Math.floor(pagination.skip / pagination.limit) + 1 === pageNumber;
                                        const totalPages = Math.ceil(pagination.total / pagination.limit);

                                        // Mostrar solo algunas páginas alrededor de la actual
                                        const currentPageIndex = Math.floor(pagination.skip / pagination.limit);
                                        const showPage = i === 0 || i === totalPages - 1 || Math.abs(i - currentPageIndex) <= 2;

                                        if (!showPage) {
                                            if (i === currentPageIndex - 3 || i === currentPageIndex + 3) {
                                                return <span key={i} className="px-2 text-gray-400">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => updatePagination({ skip: i * pagination.limit })}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg ${isCurrentPage
                                                    ? 'bg-[#CE1126] text-white dark:bg-[#002D62]'
                                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => updatePagination({ skip: pagination.skip + pagination.limit })}
                                    disabled={pagination.skip + pagination.limit >= pagination.total}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Moderno */}
                <ModernModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={selectedGame ? 'Editar Partido' : 'Programar Partido'}
                    size="lg"
                >
                    <form onSubmit={validateAndSubmit(onSubmit)} className="space-y-6">
                        {/* Sección de equipos */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#CE1126]/20 to-[#CE1126]/30 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-[#CE1126]" />
                                </div>
                                Equipos Participantes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Equipo Local *
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            name="homeTeam"
                                            value={values.homeTeam}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-[#CE1126]/50 focus:border-[#CE1126] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md appearance-none ${touched.homeTeam && errors.homeTeam
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        >
                                            <option value="">Seleccionar equipo local</option>
                                            <option value="republica_dominicana">🇩🇴 República Dominicana</option>
                                            {(teams || []).map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                    {touched.homeTeam && errors.homeTeam && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.homeTeam}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Equipo Visitante *
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            name="awayTeam"
                                            value={values.awayTeam}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-[#002D62]/50 focus:border-[#002D62] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md appearance-none ${touched.awayTeam && errors.awayTeam
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        >
                                            <option value="">Seleccionar equipo visitante</option>
                                            {(teams || []).map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                    {touched.awayTeam && errors.awayTeam && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.awayTeam}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sección de torneo */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#002D62]/20 to-[#002D62]/30 rounded-lg flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-[#002D62]" />
                                </div>
                                Información del Torneo
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Torneo o Competición *
                                </label>
                                <div className="relative">
                                    <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        name="tournament"
                                        value={values.tournament}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-[#002D62]/50 focus:border-[#002D62] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md appearance-none ${touched.tournament && errors.tournament
                                            ? 'border-red-300 dark:border-red-600'
                                            : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                        required
                                    >
                                        <option value="">Seleccionar torneo</option>
                                        <option value="copa_mundial_fiba_2023">🏆 Copa Mundial FIBA 2023</option>
                                        <option value="americup_2022">🏀 AmeriCup 2022</option>
                                        <option value="centrobasket_2024">🏅 Centrobasket 2024</option>
                                        <option value="clasificatorias_fiba">📋 Clasificatorias FIBA</option>
                                        {(tournaments || []).map((tournament) => (
                                            <option key={tournament.id} value={tournament.id}>
                                                {tournament.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                                {touched.tournament && errors.tournament && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tournament}</p>
                                )}
                            </div>
                        </div>

                        {/* Sección de fecha y hora */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                Programación del Encuentro
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha del Partido *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            name="date"
                                            value={values.date}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${touched.date && errors.date
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {touched.date && errors.date && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Hora del Partido *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="time"
                                            name="time"
                                            value={values.time}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${touched.time && errors.time
                                                ? 'border-red-300 dark:border-red-600'
                                                : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            required
                                        />
                                    </div>
                                    {touched.time && errors.time && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sección de sede */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-orange-600" />
                                </div>
                                Ubicación del Encuentro
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Sede o Pabellón *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="venue"
                                        value={values.venue}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Ej: Palacio de los Deportes, Centro Olímpico Juan Pablo Duarte"
                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md ${touched.venue && errors.venue
                                            ? 'border-red-300 dark:border-red-600'
                                            : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                        required
                                    />
                                </div>
                                {touched.venue && errors.venue && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.venue}</p>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={closeModal}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-[#CE1126] to-[#002D62] hover:from-[#a00e1e] hover:to-[#001a3d] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4" />
                                        {selectedGame ? 'Actualizar Partido' : 'Programar Encuentro'}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>
                </ModernModal>

                {/* Toast Container Moderno */}
                <ToastContainer
                    toasts={toasts}
                    onRemove={removeToast}
                    position="top-right"
                />
            </div>
        </div>
    );
};

export default Games;

import { Plus, Shield, Edit, Trash2, Eye, Grid, List, Search, Users, Calendar, MapPin, ChevronLeft, ChevronRight, Building2, Filter, RefreshCw, TrendingUp, Sparkles, Target } from 'lucide-react';

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

// Importar banderas SVG - Europa
import BanderaEspana from '../../../../assets/icons/es.svg';
import BanderaFrancia from '../../../../assets/icons/fr.svg';
import BanderaAlemania from '../../../../assets/icons/de.svg';
import BanderaItalia from '../../../../assets/icons/it.svg';
import BanderaGrecia from '../../../../assets/icons/gr.svg';
import BanderaSerbia from '../../../../assets/icons/rs.svg';
import BanderaCroacia from '../../../../assets/icons/hr.svg';
import BanderaEslovenia from '../../../../assets/icons/si.svg';
import BanderaLituania from '../../../../assets/icons/lt.svg';
import BanderaRusia from '../../../../assets/icons/ru.svg';
import BanderaTurquia from '../../../../assets/icons/tr.svg';

// Importar banderas SVG - Asia y Oceanía
import BanderaChina from '../../../../assets/icons/cn.svg';
import BanderaJapon from '../../../../assets/icons/jp.svg';
import BanderaCorea from '../../../../assets/icons/kr.svg';
import BanderaAustralia from '../../../../assets/icons/au.svg';
import BanderaFilipinas from '../../../../assets/icons/ph.svg';
import BanderaIndia from '../../../../assets/icons/in.svg';
import BanderaIsrael from '../../../../assets/icons/il.svg';

// Importar banderas SVG - Más países de América
import BanderaGuatemala from '../../../../assets/icons/gt.svg';
import BanderaHonduras from '../../../../assets/icons/hn.svg';
import BanderaNicaragua from '../../../../assets/icons/ni.svg';
import BanderaElSalvador from '../../../../assets/icons/sv.svg';
import BanderaJamaica from '../../../../assets/icons/jm.svg';
import BanderaBahamas from '../../../../assets/icons/bs.svg';
import BanderaHaiti from '../../../../assets/icons/ht.svg';
import BanderaBolivia from '../../../../assets/icons/bo.svg';

// Importar banderas SVG - Más países de Europa
import BanderaPortugal from '../../../../assets/icons/pt.svg';
import BanderaHolanda from '../../../../assets/icons/nl.svg';
import BanderaBelgica from '../../../../assets/icons/be.svg';
import BanderaLetonia from '../../../../assets/icons/lv.svg';
import BanderaEstonia from '../../../../assets/icons/ee.svg';
import BanderaUcrania from '../../../../assets/icons/ua.svg';
import BanderaRepCheca from '../../../../assets/icons/cz.svg';
import BanderaPolonia from '../../../../assets/icons/pl.svg';
import BanderaFinlandia from '../../../../assets/icons/fi.svg';
import BanderaReinoUnido from '../../../../assets/icons/gb.svg';

// Importar banderas SVG - África y Medio Oriente
import BanderaNigeria from '../../../../assets/icons/ng.svg';
import BanderaSenegal from '../../../../assets/icons/sn.svg';
import BanderaAngola from '../../../../assets/icons/ao.svg';
import BanderaEgipto from '../../../../assets/icons/eg.svg';
import BanderaSudafrica from '../../../../assets/icons/za.svg';
import BanderaJordania from '../../../../assets/icons/jo.svg';

// Importar banderas SVG - Territorios
import BanderaIslasVirgenesUS from '../../../../assets/icons/vi.svg';
import BanderaIslasVirgenesUK from '../../../../assets/icons/vg.svg';
import BanderaMacedonia from '../../../../assets/icons/mk.svg';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useFormValidation from '../../../../shared/hooks/useFormValidation';
import useViewMode from '../../../../shared/hooks/useViewMode';
import { teamSchema } from '../../../../lib/validations/schemas';
import { useTeams } from '../../hooks/useTeams';
import { GlassCard, AnimatedButton, LoadingState, ErrorState } from '../../../../shared/ui/components/modern';

const Teams = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [showFilters, setShowFilters] = useState(false);

    // Hook para cambiar entre vista de cartas y tabla
    const { viewMode, isTableView, toggleViewMode } = useViewMode('cards', 'teams-view');

    // Hook para manejar equipos desde el backend
    const {
        teams,
        loading,
        error,
        pagination,
        filters,
        createTeam,
        updateTeam,
        deleteTeam,
        updateFilters,
        updatePagination,
        refetch
    } = useTeams();

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
        name: '',
        country: '',
        coach: '',
        founded_year: '',
        is_national_team: false
    }, teamSchema);

    // Función para obtener la bandera SVG del país
    const getCountryFlag = (countryCode) => {
        if (!countryCode) return BanderaDominicana;

        // Mapeo directo de códigos de país a banderas importadas
        const flagMap = {
            // América del Norte
            'USA': BanderaUSA, 'US': BanderaUSA, 'ESTADOS UNIDOS': BanderaUSA, 'UNITED STATES': BanderaUSA, 'EE.UU.': BanderaUSA, 'EEUU': BanderaUSA,
            'CAN': BanderaCanada, 'CA': BanderaCanada, 'CANADÁ': BanderaCanada, 'CANADA': BanderaCanada,
            'MEX': BanderaMexico, 'MX': BanderaMexico, 'MÉXICO': BanderaMexico, 'MEXICO': BanderaMexico,

            // América Central y Caribe
            'DOM': BanderaDominicana, 'DO': BanderaDominicana, 'REPÚBLICA DOMINICANA': BanderaDominicana, 'REPUBLICA DOMINICANA': BanderaDominicana, 'DOMINICAN REPUBLIC': BanderaDominicana, 'REP. DOMINICANA': BanderaDominicana, 'R.D.': BanderaDominicana,
            'PUR': BanderaPuertoRico, 'PR': BanderaPuertoRico, 'PUERTO RICO': BanderaPuertoRico, 'P.R.': BanderaPuertoRico,
            'CUB': BanderaCuba, 'CU': BanderaCuba, 'CUBA': BanderaCuba,
            'PAN': BanderaPanama, 'PA': BanderaPanama, 'PANAMÁ': BanderaPanama, 'PANAMA': BanderaPanama,
            'CRC': BanderaCostaRica, 'CR': BanderaCostaRica, 'COSTA RICA': BanderaCostaRica, 'CRI': BanderaCostaRica,
            'GTM': BanderaGuatemala, 'GT': BanderaGuatemala, 'GUATEMALA': BanderaGuatemala, 'GUA': BanderaGuatemala,
            'HON': BanderaHonduras, 'HN': BanderaHonduras, 'HONDURAS': BanderaHonduras, 'HND': BanderaHonduras,
            'NIC': BanderaNicaragua, 'NI': BanderaNicaragua, 'NICARAGUA': BanderaNicaragua, 'NCA': BanderaNicaragua,
            'SLV': BanderaElSalvador, 'SV': BanderaElSalvador, 'EL SALVADOR': BanderaElSalvador, 'ESA': BanderaElSalvador,
            'JAM': BanderaJamaica, 'JM': BanderaJamaica, 'JAMAICA': BanderaJamaica,
            'BAH': BanderaBahamas, 'BS': BanderaBahamas, 'BAHAMAS': BanderaBahamas,
            'HAI': BanderaHaiti, 'HT': BanderaHaiti, 'HAITÍ': BanderaHaiti, 'HAITI': BanderaHaiti,
            'VIR': BanderaIslasVirgenesUS, 'VI': BanderaIslasVirgenesUS, 'ISLAS VÍRGENES': BanderaIslasVirgenesUS, 'ISLAS VIRGENES': BanderaIslasVirgenesUS, 'US VIRGIN ISLANDS': BanderaIslasVirgenesUS,
            'VGB': BanderaIslasVirgenesUK, 'VG': BanderaIslasVirgenesUK, 'ISLAS VÍRGENES BRITÁNICAS': BanderaIslasVirgenesUK, 'ISLAS VIRGENES BRITANICAS': BanderaIslasVirgenesUK, 'BRITISH VIRGIN ISLANDS': BanderaIslasVirgenesUK,

            // América del Sur
            'ARG': BanderaArgentina, 'AR': BanderaArgentina, 'ARGENTINA': BanderaArgentina,
            'BRA': BanderaBrasil, 'BR': BanderaBrasil, 'BRASIL': BanderaBrasil, 'BRAZIL': BanderaBrasil,
            'CHI': BanderaChile, 'CL': BanderaChile, 'CHILE': BanderaChile, 'CHN': BanderaChile,
            'COL': BanderaColombia, 'CO': BanderaColombia, 'COLOMBIA': BanderaColombia,
            'VEN': BanderaVenezuela, 'VE': BanderaVenezuela, 'VENEZUELA': BanderaVenezuela,
            'URU': BanderaUruguay, 'UY': BanderaUruguay, 'URUGUAY': BanderaUruguay,
            'PAR': BanderaParaguay, 'PY': BanderaParaguay, 'PARAGUAY': BanderaParaguay,
            'PER': BanderaPeru, 'PE': BanderaPeru, 'PERÚ': BanderaPeru, 'PERU': BanderaPeru,
            'ECU': BanderaEcuador, 'EC': BanderaEcuador, 'ECUADOR': BanderaEcuador,
            'BOL': BanderaBolivia, 'BO': BanderaBolivia, 'BOLIVIA': BanderaBolivia,

            // Europa
            'ESP': BanderaEspana, 'ES': BanderaEspana, 'ESPAÑA': BanderaEspana, 'SPAIN': BanderaEspana,
            'FRA': BanderaFrancia, 'FR': BanderaFrancia, 'FRANCIA': BanderaFrancia, 'FRANCE': BanderaFrancia,
            'GER': BanderaAlemania, 'DE': BanderaAlemania, 'ALEMANIA': BanderaAlemania, 'GERMANY': BanderaAlemania, 'GER': BanderaAlemania, 'DEU': BanderaAlemania,
            'ITA': BanderaItalia, 'IT': BanderaItalia, 'ITALIA': BanderaItalia, 'ITALY': BanderaItalia,
            'GRE': BanderaGrecia, 'GR': BanderaGrecia, 'GRECIA': BanderaGrecia, 'GREECE': BanderaGrecia, 'GRC': BanderaGrecia,
            'SRB': BanderaSerbia, 'RS': BanderaSerbia, 'SERBIA': BanderaSerbia,
            'CRO': BanderaCroacia, 'HR': BanderaCroacia, 'CROACIA': BanderaCroacia, 'CROATIA': BanderaCroacia, 'HRV': BanderaCroacia,
            'SLO': BanderaEslovenia, 'SI': BanderaEslovenia, 'ESLOVENIA': BanderaEslovenia, 'SLOVENIA': BanderaEslovenia, 'SVN': BanderaEslovenia,
            'LTU': BanderaLituania, 'LT': BanderaLituania, 'LITUANIA': BanderaLituania, 'LITHUANIA': BanderaLituania,
            'LAT': BanderaLetonia, 'LV': BanderaLetonia, 'LETONIA': BanderaLetonia, 'LATVIA': BanderaLetonia, 'LVA': BanderaLetonia,
            'EST': BanderaEstonia, 'EE': BanderaEstonia, 'ESTONIA': BanderaEstonia,
            'RUS': BanderaRusia, 'RU': BanderaRusia, 'RUSIA': BanderaRusia, 'RUSSIA': BanderaRusia,
            'UKR': BanderaUcrania, 'UA': BanderaUcrania, 'UCRANIA': BanderaUcrania, 'UKRAINE': BanderaUcrania,
            'TUR': BanderaTurquia, 'TR': BanderaTurquia, 'TURQUÍA': BanderaTurquia, 'TURKEY': BanderaTurquia,
            'POL': BanderaPolonia, 'PL': BanderaPolonia, 'POLONIA': BanderaPolonia, 'POLAND': BanderaPolonia,
            'CZE': BanderaRepCheca, 'CZ': BanderaRepCheca, 'REPÚBLICA CHECA': BanderaRepCheca, 'CZECH REPUBLIC': BanderaRepCheca, 'REP. CHECA': BanderaRepCheca,
            'FIN': BanderaFinlandia, 'FI': BanderaFinlandia, 'FINLANDIA': BanderaFinlandia, 'FINLAND': BanderaFinlandia,
            'POR': BanderaPortugal, 'PT': BanderaPortugal, 'PORTUGAL': BanderaPortugal,
            'NED': BanderaHolanda, 'NL': BanderaHolanda, 'HOLANDA': BanderaHolanda, 'NETHERLANDS': BanderaHolanda, 'PAÍSES BAJOS': BanderaHolanda,
            'BEL': BanderaBelgica, 'BE': BanderaBelgica, 'BÉLGICA': BanderaBelgica, 'BELGIUM': BanderaBelgica,
            'GBR': BanderaReinoUnido, 'GB': BanderaReinoUnido, 'REINO UNIDO': BanderaReinoUnido, 'UNITED KINGDOM': BanderaReinoUnido, 'UK': BanderaReinoUnido, 'GRAN BRETAÑA': BanderaReinoUnido,
            'MKD': BanderaMacedonia, 'MK': BanderaMacedonia, 'MACEDONIA DEL NORTE': BanderaMacedonia, 'NORTH MACEDONIA': BanderaMacedonia, 'MACEDONIA': BanderaMacedonia,

            // Asia y Oceanía
            'CHN': BanderaChina, 'CN': BanderaChina, 'CHINA': BanderaChina,
            'JPN': BanderaJapon, 'JP': BanderaJapon, 'JAPÓN': BanderaJapon, 'JAPAN': BanderaJapon,
            'KOR': BanderaCorea, 'KR': BanderaCorea, 'COREA DEL SUR': BanderaCorea, 'SOUTH KOREA': BanderaCorea, 'COREA': BanderaCorea,
            'AUS': BanderaAustralia, 'AU': BanderaAustralia, 'AUSTRALIA': BanderaAustralia,
            'NZL': BanderaAustralia, 'NZ': BanderaAustralia, 'NUEVA ZELANDA': BanderaAustralia, 'NEW ZEALAND': BanderaAustralia,
            'PHI': BanderaFilipinas, 'PH': BanderaFilipinas, 'FILIPINAS': BanderaFilipinas, 'PHILIPPINES': BanderaFilipinas,
            'IND': BanderaIndia, 'IN': BanderaIndia, 'INDIA': BanderaIndia,
            'ISR': BanderaIsrael, 'IL': BanderaIsrael, 'ISRAEL': BanderaIsrael,
            'JOR': BanderaJordania, 'JO': BanderaJordania, 'JORDAN': BanderaJordania, 'JORDANIA': BanderaJordania,

            // África
            'NGR': BanderaNigeria, 'NG': BanderaNigeria, 'NIGERIA': BanderaNigeria, 'NGA': BanderaNigeria,
            'SEN': BanderaSenegal, 'SN': BanderaSenegal, 'SENEGAL': BanderaSenegal,
            'ANG': BanderaAngola, 'AO': BanderaAngola, 'ANGOLA': BanderaAngola,
            'EGY': BanderaEgipto, 'EG': BanderaEgipto, 'EGIPTO': BanderaEgipto, 'EGYPT': BanderaEgipto,
            'RSA': BanderaSudafrica, 'ZA': BanderaSudafrica, 'SUDÁFRICA': BanderaSudafrica, 'SOUTH AFRICA': BanderaSudafrica, 'SUD ÁFRICA': BanderaSudafrica
        };

        // Buscar en el mapa con el código en mayúsculas
        const upperCode = countryCode.toUpperCase().trim();
        return flagMap[upperCode] || BanderaDominicana;
    };

    // Handlers

    const openCreateModal = () => {
        setSelectedTeam(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (team) => {
        setSelectedTeam(team);
        setFieldValue('name', team.name);
        setFieldValue('country', team.country);
        setFieldValue('coach', team.coach || '');
        setFieldValue('founded_year', team.founded_year || '');
        setFieldValue('is_national_team', team.is_national_team || false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeam(null);
        reset();
    };

    const handleFormSubmit = validateAndSubmit(async (formData) => {
        try {
            if (selectedTeam) {
                await updateTeam(selectedTeam.id, formData);
                setToast({ isVisible: true, type: 'success', message: 'Equipo actualizado exitosamente' });
            } else {
                await createTeam(formData);
                setToast({ isVisible: true, type: 'success', message: 'Equipo creado exitosamente' });
            }
            closeModal();
        } catch (error) {
            setToast({ isVisible: true, type: 'error', message: error.message || 'Error al procesar la solicitud' });
        }
    });

    const handleDelete = async (teamId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
            try {
                await deleteTeam(teamId);
                setToast({ isVisible: true, type: 'success', message: 'Equipo eliminado exitosamente' });
            } catch (error) {
                setToast({ isVisible: true, type: 'error', message: error.message || 'Error al eliminar el equipo' });
            }
        }
    };

    const handlePageChange = (page) => {
        updatePagination({ skip: (page - 1) * pagination.limit });
    };

    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    // Función para ajustar el límite según el estado del sidebar
    const adjustLimit = (filtersOpen) => {
        const baseLimit = 12;
        const newLimit = filtersOpen ? Math.max(6, baseLimit - 3) : baseLimit;
        if (pagination.limit !== newLimit) {
            updatePagination({ limit: newLimit, skip: 0 });
        }
    };

    // Ajustar límite cuando cambie el estado del sidebar
    useEffect(() => {
        adjustLimit(showFilters);
    }, [showFilters]);

    // Auto-ocultar toast después de 3 segundos
    useEffect(() => {
        if (toast.isVisible) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, isVisible: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.isVisible]);

    // Función para refresh manual
    const handleRefresh = async () => {
        try {
            await refetch();
            setToast({
                isVisible: true,
                type: 'success',
                message: 'Datos actualizados correctamente'
            });
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                message: 'Error al actualizar los datos'
            });
        }
    };

    // Columnas para la vista de tabla
    const columns = [
        {
            key: 'country',
            label: 'País',
            render: (team) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img src={getCountryFlag(team.country)} alt={team.country} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold text-xs">{team.country}</span>
                </div>
            )
        },
        {
            key: 'name',
            label: 'Equipo',
            render: (team) => (
                <div className="text-center">
                    <p className="font-bold text-xs text-gray-900 dark:text-white">{team.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {team.is_national_team ? 'Selección' : 'Club'}
                    </p>
                </div>
            )
        },
        {
            key: 'coach',
            label: 'Entrenador',
            render: (team) => <span className="font-bold text-xs text-gray-900 dark:text-white">{team.coach || 'N/A'}</span>
        },
        {
            key: 'founded_year',
            label: 'Fundado',
            render: (team) => <span className="font-bold text-xs text-gray-900 dark:text-white">{team.founded_year || 'N/A'}</span>
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (team) => (
                <div className="flex items-center justify-center gap-1">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/teams/${team.id}`)}
                        className="px-2 py-1 bg-[#002D62] hover:bg-[#001a3d] text-white text-[10px] font-bold rounded border-2 border-black transition-all duration-200"
                        title="Ver detalles"
                    >
                        Ver
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(team)}
                        className="px-2 py-1 bg-white hover:bg-gray-50 text-[#002D62] border-2 border-black text-[10px] font-bold rounded transition-all duration-200"
                        title="Editar"
                    >
                        Editar
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(team.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded border-2 border-black transition-all duration-200"
                        title="Eliminar"
                    >
                        Eliminar
                    </motion.button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Header compacto con fondo gradiente */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl shadow-xl bg-gradient-to-r from-[#CE1126] from-0% via-white via-50% to-[#002D62] to-100% p-4 mb-6"
                >
                    <div className="flex items-center justify-between gap-4">
                        {/* Lado izquierdo: título compacto */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/60 overflow-hidden">
                                <img src={BanderaDominicana} alt="Bandera Dominicana" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-white">
                                    Gestión de Equipos
                                </h1>
                                <p className="text-[10px] font-bold text-white">
                                    Selección Nacional • República Dominicana
                                </p>
                            </div>
                        </div>

                        {/* Lado derecho: botones compactos */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleViewMode}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-[#CE1126] dark:hover:border-[#002D62] text-gray-700 dark:text-gray-300 hover:text-[#CE1126] dark:hover:text-[#002D62] rounded-lg transition-all shadow-sm hover:shadow-md"
                                title={isTableView ? 'Vista de cartas' : 'Vista de tabla'}
                            >
                                {isTableView ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                <span className="text-xs font-bold">{isTableView ? 'Cartas' : 'Tabla'}</span>
                            </button>

                            <button
                                onClick={openCreateModal}
                                className="px-4 py-1.5 text-xs font-bold rounded-md bg-gradient-to-r from-[#CE1126] to-[#002D62] text-white hover:shadow-lg transition-all"
                            >
                                <Plus className="w-3 h-3 inline mr-1" />
                                Nuevo Equipo
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards compactas - datos relevantes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#CE1126]/30 hover:border-[#CE1126]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Total Equipos
                            </p>
                            <p className="text-3xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                {pagination.total}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#CE1126]/30 hover:border-[#CE1126]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Selecciones
                            </p>
                            <p className="text-3xl font-black text-[#CE1126] dark:text-[#CE1126]">
                                {teams.filter(t => t.is_national_team).length}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-[#002D62]/30 hover:border-[#002D62]/60 hover:shadow-lg transition-all"
                    >
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                Países
                            </p>
                            <p className="text-3xl font-black text-[#002D62] dark:text-[#002D62]">
                                {new Set(teams.map(team => team.country)).size}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Search - simplificado */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6 shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar equipos por nombre..."
                            value={filters.search || ''}
                            onChange={(e) => updateFilters({ search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#CE1126] dark:focus:ring-[#002D62] focus:border-transparent transition-all"
                        />
                    </div>
                </motion.div>


                {/* Teams Content */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CE1126] dark:border-[#002D62]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-20">
                            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No se encontraron equipos</p>
                        </div>
                    ) : isTableView ? (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                                        {columns.map((column) => (
                                            <th key={column.key} className="px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-700">
                                    {teams.map((team) => (
                                        <motion.tr
                                            key={team.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            {columns.map((column) => (
                                                <td key={column.key} className="px-4 py-3 text-center">
                                                    {column.render(team)}
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            {pagination.total > pagination.limit && (
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Mostrando {pagination.skip + 1} a {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total} jugadores
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
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {teams.map((team) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-[#CE1126]/50 dark:hover:border-[#002D62]/50 transition-all hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                                            <img src={getCountryFlag(team.country)} alt={team.country} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-sm text-gray-900 dark:text-white">{team.name}</h3>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{team.country}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-gray-600 dark:text-gray-400">Entrenador:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{team.coach || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-gray-600 dark:text-gray-400">Fundado:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{team.founded_year || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(`/teams/${team.id}`)}
                                            className="flex-1 px-2 py-1.5 bg-[#002D62] hover:bg-[#001a3d] text-white text-[10px] font-bold rounded transition-all"
                                        >
                                            Ver
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => openEditModal(team)}
                                            className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#002D62] border-2 border-[#002D62] text-[10px] font-bold rounded transition-all"
                                        >
                                            Editar
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDelete(team.id)}
                                            className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para crear/editar equipo - centrado arriba */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
                        <div className="mt-20">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                                    </h2>
                                </div>

                                <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre del Equipo *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Los Angeles Lakers"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                required
                                            />
                                            {touched.name && errors.name && (
                                                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                País *
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={values.country}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: USA"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                required
                                            />
                                            {touched.country && errors.country && (
                                                <p className="text-red-600 text-sm mt-1">{errors.country}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Entrenador
                                            </label>
                                            <input
                                                type="text"
                                                name="coach"
                                                value={values.coach}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: Phil Jackson"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                            {touched.coach && errors.coach && (
                                                <p className="text-red-600 text-sm mt-1">{errors.coach}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Año de Fundación
                                            </label>
                                            <input
                                                type="number"
                                                name="founded_year"
                                                value={values.founded_year}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                placeholder="Ej: 1947"
                                                min="1800"
                                                max={new Date().getFullYear()}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                            {touched.founded_year && errors.founded_year && (
                                                <p className="text-red-600 text-sm mt-1">{errors.founded_year}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="is_national_team"
                                            name="is_national_team"
                                            checked={values.is_national_team}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label htmlFor="is_national_team" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Es Selección Nacional
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors duration-200"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-[#CE1126] hover:bg-[#B00E20] dark:bg-[#002D62] dark:hover:bg-[#001F4A] text-white font-medium rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Procesando...' : (selectedTeam ? 'Actualizar' : 'Crear')} Equipo
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Toast para notificaciones */}
            {
                toast.isVisible && (
                    <div className="fixed bottom-4 right-4 z-50">
                        <div className={`px-6 py-4 rounded-xl shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' :
                            toast.type === 'error' ? 'bg-red-600 text-white' :
                                'bg-blue-600 text-white'
                            }`}>
                            <p>{toast.message}</p>
                            <button
                                onClick={() => setToast({ ...toast, isVisible: false })}
                                className="ml-4 text-white/80 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Teams;

import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UserCircle, TrendingUp, Award, Activity,
    Edit, Trash2, Target, BarChart3, Calendar, Trophy, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Badge,
    Modal,
    Toast,
    LoadingSpinner
} from '../../../../shared/ui/components/common';
import {
    GlassCard,
    AnimatedButton,
    GradientBadge,
    ModernTable
} from '../../../../shared/ui/components/modern';
import {
    ModernLineChart,
    ModernBarChart,
    ModernAreaChart
} from '../../../dashboard/components/ModernCharts';

const ModernPlayerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [selectedTab, setSelectedTab] = useState('overview');

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

    const careerStats = {
        gamesPlayed: 45, gamesStarted: 42, minutesPerGame: 32.5,
        ppg: 22.5, rpg: 11.2, apg: 3.8, spg: 0.9, bpg: 1.8, tpg: 2.3,
        fgPercentage: 51.2, fg3Percentage: 38.5, ftPercentage: 82.3,
        efficiency: 28.7, doubleDoubles: 28, tripleDoubles: 2
    };

    const stats = [
        { title: 'Puntos por Partido', value: careerStats.ppg.toFixed(1), icon: Target, change: '+2.3', trend: 'up', gradient: 'from-red-500 to-orange-600' },
        { title: 'Rebotes por Partido', value: careerStats.rpg.toFixed(1), icon: Activity, change: '+1.5', trend: 'up', gradient: 'from-blue-500 to-cyan-600' },
        { title: 'Asistencias por Partido', value: careerStats.apg.toFixed(1), icon: TrendingUp, change: '+0.8', trend: 'up', gradient: 'from-green-500 to-emerald-600' },
        { title: 'Eficiencia', value: careerStats.efficiency.toFixed(1), icon: BarChart3, change: '+3.2', trend: 'up', gradient: 'from-purple-500 to-pink-600' }
    ];

    const performanceData = [
        { season: '2020', ppg: 18.2, rpg: 9.5, apg: 2.8 },
        { season: '2021', ppg: 19.8, rpg: 10.1, apg: 3.2 },
        { season: '2022', ppg: 21.3, rpg: 10.8, apg: 3.5 },
        { season: '2023', ppg: 22.5, rpg: 11.2, apg: 3.8 }
    ];

    const shootingData = [
        { name: 'TC%', value: careerStats.fgPercentage },
        { name: '3P%', value: careerStats.fg3Percentage },
        { name: 'TL%', value: careerStats.ftPercentage }
    ];

    const recentGames = [
        { id: 1, opponent: 'Argentina', date: '2024-10-15', result: 'V 89-84', minutes: 35, points: 28, rebounds: 13, assists: 5, fg: '11/19', efficiency: 32 },
        { id: 2, opponent: 'Canadá', date: '2024-10-08', result: 'D 76-80', minutes: 33, points: 22, rebounds: 11, assists: 4, fg: '9/17', efficiency: 28 },
        { id: 3, opponent: 'Puerto Rico', date: '2024-09-25', result: 'V 92-78', minutes: 30, points: 25, rebounds: 10, assists: 3, fg: '10/16', efficiency: 30 },
        { id: 4, opponent: 'Brasil', date: '2024-09-20', result: 'V 85-79', minutes: 34, points: 20, rebounds: 12, assists: 6, fg: '8/15', efficiency: 31 }
    ];

    const gamesColumns = [
        { key: 'date', label: 'Fecha', render: (value) => new Date(value).toLocaleDateString('es-ES') },
        { key: 'opponent', label: 'Oponente' },
        { key: 'result', label: 'Resultado', render: (value) => <GradientBadge variant={value.startsWith('V') ? 'success' : 'danger'} size="small">{value}</GradientBadge> },
        { key: 'minutes', label: 'MIN', render: (value) => `${value}'` },
        { key: 'points', label: 'PTS', render: (value) => <span className="font-bold text-blue-600">{value}</span> },
        { key: 'rebounds', label: 'REB' },
        { key: 'assists', label: 'AST' },
        { key: 'fg', label: 'TC' },
        { key: 'efficiency', label: 'EFF', render: (value) => <span className="font-semibold">{value}</span> }
    ];

    const teamComparison = [
        { metric: 'Puntos por Partido', player: 22.5, team: 16.9, diff: '+33%' },
        { metric: 'Rebotes por Partido', player: 11.2, team: 7.8, diff: '+44%' },
        { metric: 'Asistencias por Partido', player: 3.8, team: 3.2, diff: '+19%' },
        { metric: '% Tiros de Campo', player: 51.2, team: 46.8, diff: '+9%' }
    ];

    const achievements = [
        { year: '2023', title: 'MVP del Torneo Preolímpico', icon: '🏆' },
        { year: '2022', title: 'Mejor Jugador del Partido vs Argentina', icon: '⭐' },
        { year: '2021', title: 'Quinteto Ideal FIBA Americas', icon: '🌟' },
        { year: '2020', title: 'Líder en Rebotes - Clasificatorios', icon: '📊' }
    ];

    const handleDelete = async () => {
        try {
            setToast({ isVisible: true, type: 'success', message: 'Jugador eliminado correctamente' });
            setTimeout(() => navigate('/players'), 1500);
        } catch (error) {
            setToast({ isVisible: true, type: 'error', message: 'Error al eliminar el jugador' });
        }
    };

    if (loading) return <LoadingSpinner size="large" text="Cargando detalles del jugador..." />;

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: UserCircle },
        { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
        { id: 'games', label: 'Partidos', icon: Calendar },
        { id: 'achievements', label: 'Logros', icon: Trophy }
    ];

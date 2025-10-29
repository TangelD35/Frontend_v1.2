import {
    Home, Trophy, Shield, UserCircle, Calendar, Target, BarChart3,
    Grid3X3, Brain, Database, Activity, Wifi, Zap, TrendingUp,
    Award, Clock, Flag, Search, Settings, Bell
} from 'lucide-react';

// Mapeo de nombres de iconos a componentes
export const ICON_MAP = {
    Home,
    Trophy,
    Shield,
    UserCircle,
    Calendar,
    Target,
    BarChart3,
    Grid3X3,
    Brain,
    Database,
    Activity,
    Wifi,
    Zap,
    TrendingUp,
    Award,
    Clock,
    Flag,
    Search,
    Settings,
    Bell,
};

// Función para obtener un icono por nombre
export const getIcon = (iconName) => {
    return ICON_MAP[iconName] || Home;
};
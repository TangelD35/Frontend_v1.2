import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { MainLayout as Layout } from '../shared/ui/layouts';
import Login from '../features/auth/pages/Auth/Login';
import Register from '../features/auth/pages/Auth/Register';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import useAuthStore from '../shared/store/authStore';
import { LoadingSpinner } from '../shared/ui/components/common';
import LazyLoadErrorBoundary from './LazyLoadErrorBoundary';

// Lazy-loaded components
const Dashboard = lazy(() => import('../features/dashboard/pages/Dashboard/ModernDashboard'));
const EnhancedDashboard = lazy(() => import('../features/dashboard/components/EnhancedDashboard'));
const WidgetTest = lazy(() => import('../features/dashboard/components/WidgetTest'));
const DataManagement = lazy(() => import('../features/settings/components/DataManagement'));
const Tournaments = lazy(() => import('../features/tournaments/pages/Tournaments/Tournaments'));
const TournamentDetail = lazy(() => import('../features/tournaments/pages/Tournaments/TournamentDetail'));
const Teams = lazy(() => import('../features/teams/pages/Teams/Teams'));
const TeamDetail = lazy(() => import('../features/teams/pages/Teams/TeamDetail'));
const Players = lazy(() => import('../features/players/pages/Players/Players'));
const PlayerDetail = lazy(() => import('../features/players/pages/Players/PlayerDetail'));
const Games = lazy(() => import('../features/games/pages/Games/Games'));
const GameDetail = lazy(() => import('../features/games/pages/Games/GameDetail'));
const Predictions = lazy(() => import('../features/predictions/pages/Predictions/Predictions'));
const Analytics = lazy(() => import('../features/analytics/pages/Analytics/Analytics'));

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Cargando página..." />
    </div>
);

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-white">404</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Página no encontrada</h1>
                <p className="text-lg text-gray-600 mb-8">La página que estás buscando no existe o ha sido movida.</p>
                <button
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    {isAuthenticated ? 'Ir al Dashboard' : 'Ir al Login'}
                </button>
            </div>
        </div>
    );
};

function App() {
    const { initializeAuth } = useAuthStore();

    useEffect(() => {
        // Inicializar autenticación solo una vez al montar la app
        initializeAuth();
    }, []); // Sin dependencias para ejecutar solo una vez

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
            <ScrollToTop />
            <LazyLoadErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route key="login" path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route key="register" path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route key="root-redirect" path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route key="protected-layout" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route key="dashboard" path="/dashboard" element={<Dashboard />} />
                            <Route key="dashboard-enhanced" path="/dashboard/enhanced" element={<EnhancedDashboard />} />
                            <Route key="dashboard-test" path="/dashboard/test" element={<WidgetTest />} />

                            <Route key="data-management" path="/data/management" element={<DataManagement />} />
                            <Route key="tournaments" path="/tournaments" element={<Tournaments />} />
                            <Route key="tournament-detail" path="/tournaments/:id" element={<TournamentDetail />} />
                            <Route key="teams" path="/teams" element={<Teams />} />
                            <Route key="team-detail" path="/teams/:id" element={<TeamDetail />} />
                            <Route key="players" path="/players" element={<Players />} />
                            <Route key="player-detail" path="/players/:id" element={<PlayerDetail />} />
                            <Route key="games" path="/games" element={<Games />} />
                            <Route key="game-detail" path="/games/:id" element={<GameDetail />} />
                            <Route key="predictions" path="/predictions" element={<Predictions />} />
                            <Route key="analytics" path="/analytics" element={<Analytics />} />
                        </Route>
                        <Route key="not-found" path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </LazyLoadErrorBoundary>
        </div>
    );
}

export default App;

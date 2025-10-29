import { Navigate } from 'react-router-dom';
import useAuthStore from '../shared/store/authStore';
import { LoadingSpinner } from '../shared/ui/components/common';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Cargando..." />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;

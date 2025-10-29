import { Navigate } from 'react-router-dom';
import useAuthStore from '../shared/store/authStore';
import { LoadingSpinner } from '../shared/ui/components/common';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <LoadingSpinner size="large" text="Verificando autenticación..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

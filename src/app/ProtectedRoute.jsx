import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../shared/store/authStore';
import { LoadingSpinner } from '../shared/ui/components/common';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

    // Inicializar autenticación si no está cargando y no hay token
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
                initializeAuth();
            }
        }
    }, [isLoading, isAuthenticated, initializeAuth]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#002D62] via-slate-900 to-[#CE1126] flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <LoadingSpinner size="large" text="Verificando autenticación..." />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

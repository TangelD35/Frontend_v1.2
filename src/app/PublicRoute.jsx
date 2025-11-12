import { Navigate } from 'react-router-dom';
import useAuthStore from '../shared/store/authStore';

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;

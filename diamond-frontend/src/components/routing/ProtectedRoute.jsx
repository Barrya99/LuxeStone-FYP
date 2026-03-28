// diamond-frontend/src/components/routing/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
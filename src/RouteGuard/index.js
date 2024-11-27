import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';


const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
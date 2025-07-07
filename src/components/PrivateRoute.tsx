import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute = ({ children, requireAdmin = false }: PrivateRouteProps) => {
  const token = localStorage.getItem('token');
  const { user } = useUser();

  console.log('🔐 [PrivateRoute] Token:', token);
  console.log('🔐 [PrivateRoute] User:', user);
  console.log('🔐 [PrivateRoute] Admin Required?', requireAdmin);

  if (!token) {
    console.warn('🚫 Token ausente — redirecionar para login');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    console.warn('🚫 Utilizador não é admin — redirecionar para home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

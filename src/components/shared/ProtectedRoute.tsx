import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type UserRole } from '@/stores/authStore';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

const ROLE_HOME: Record<UserRole, string> = {
  traveller: '/traveller',
  host: '/host',
  admin: '/admin',
};

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to the user's own dashboard
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <Outlet />;
}

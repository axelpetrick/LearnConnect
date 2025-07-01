import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('Redirecting to login - no user found');
      setLocation('/login');
    } else if (user && roles && !roles.includes(user.role)) {
      console.log('Redirecting to dashboard - insufficient role');
      setLocation('/dashboard');
    }
  }, [user, isLoading, roles, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user) {
    console.log('No user, should redirect to login');
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    console.log('Insufficient role, should redirect to dashboard');
    return null;
  }

  return <>{children}</>;
}

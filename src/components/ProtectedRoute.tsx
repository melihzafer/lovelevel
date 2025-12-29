import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { Loader } from './Loader';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}


import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/event-selection" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = user.papeis?.some(papel => 
    allowedRoles.includes(papel.codigo)
  );

  if (!hasAllowedRole) {
    return <Navigate to="/event-selection" replace />;
  }

  return <>{children}</>;
}

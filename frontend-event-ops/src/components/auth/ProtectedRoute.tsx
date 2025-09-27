import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { state } = useApp();
  const location = useLocation();

  if (requireAuth && !state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && state.user && !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
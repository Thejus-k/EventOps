import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

export function DashboardRedirect() {
  const { state } = useApp();
  
  if (!state.user) {
    return <Navigate to="/login" replace />;
  }
  
  // All users are redirected to events page first
  return <Navigate to="/events" replace />;
}
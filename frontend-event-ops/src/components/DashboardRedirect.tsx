import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

export function DashboardRedirect() {
  const { state } = useApp();
  
  if (!state.user) {
    return <Navigate to="/login" replace />;
  }
  
  // Event managers are redirected to events page first
  if (state.user.role === 'event_manager') {
    return <Navigate to="/events" replace />;
  }
  
  // Volunteers and speakers are redirected to tasks page
  return <Navigate to="/tasks" replace />;
}
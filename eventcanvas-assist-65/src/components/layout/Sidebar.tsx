import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar, 
  MessageCircle,
  Award,
  Camera,
  Settings,
  Building,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

const sidebarItems = [
  { id: 'events', label: 'My Events', icon: CalendarDays, path: '/events', roles: ['event_manager', 'volunteer', 'speaker'] },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['event_manager'] },
  { id: 'tasks', label: 'Task Manager', icon: CheckSquare, path: '/tasks', roles: ['event_manager', 'volunteer', 'speaker'] },
  { id: 'people', label: 'People', icon: Users, path: '/people', roles: ['event_manager', 'volunteer', 'speaker'] },
  { id: 'vendors', label: 'Vendors', icon: Building, path: '/vendors', roles: ['event_manager'] },
  { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda', roles: ['event_manager', 'volunteer', 'speaker'] },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle, path: '/feedback', roles: ['event_manager'] },
  { id: 'certificates', label: 'Certificates', icon: Award, path: '/certificates', roles: ['event_manager'] },
  { id: 'gallery', label: 'Gallery', icon: Camera, path: '/gallery', roles: ['event_manager', 'volunteer', 'speaker'] },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: ['event_manager', 'volunteer', 'speaker'] },
];

export function Sidebar() {
  const { state, dispatch } = useApp();

  const handleNavClick = (viewId: string) => {
    dispatch({ type: 'SET_VIEW', payload: viewId });
    
    // If clicking on "My Events", stop managing event
    if (viewId === 'events') {
      dispatch({ type: 'STOP_MANAGING_EVENT' });
    }
  };

  // Filter sidebar items based on user role and event management state
  const visibleItems = sidebarItems.filter(item => {
    if (!state.user) return false;
    
    // Always show My Events for all roles
    if (item.id === 'events') return item.roles.includes(state.user.role);
    
    // Show other items when managing/viewing an event
    if (!state.isManagingEvent) return false;
    
    return item.roles.includes(state.user.role);
  });

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Event Manager</h1>
            <p className="text-xs text-sidebar-foreground/60">Streamline your events</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => handleNavClick(item.id)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80"
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {state.user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {state.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{state.user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {state.user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">?</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Not logged in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
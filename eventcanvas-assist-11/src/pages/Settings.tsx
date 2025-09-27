import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User, LogOut, Database, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { state, mockLogout } = useApp();
  const { toast } = useToast();

  const handleLogout = () => {
    mockLogout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('event-manager-data');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Your current login information and role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Name:</span>
                <span>{state.user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Email:</span>
                <span>{state.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Role:</span>
                <Badge variant="outline">
                  {state.user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <Separator />
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Not logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your stored data and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Tasks</p>
              <p className="text-2xl font-bold text-primary">{state.tasks.length}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">People</p>
              <p className="text-2xl font-bold text-primary">
                {state.speakers.length + state.volunteers.length}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <SettingsIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">AI Logs</p>
              <p className="text-2xl font-bold text-primary">{state.aiLogs.length}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Danger Zone</h4>
            <Button 
              variant="destructive" 
              onClick={clearAllData}
              className="w-full"
            >
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground">
              This will permanently delete all your tasks, people, and settings. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Information */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Information</CardTitle>
          <CardDescription>
            This is a demo Event Manager application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• All data is stored locally in your browser</p>
            <p>• No real backend or authentication is used</p>
            <p>• Role-based access control is simulated</p>
            <p>• Data persists until you clear it or browser storage</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
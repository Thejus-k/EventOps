import React from 'react';
import { Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';
import { AddSpeakerModal } from '@/components/modals/AddSpeakerModal';
import { toast } from 'sonner';

export default function Speakers() {
  const { state } = useApp();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Speaker Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your event speakers and sessions
          </p>
        </div>
        <AddSpeakerModal>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Speaker
          </Button>
        </AddSpeakerModal>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.speakers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {state.speakers.filter(s => s.confirmed).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {state.speakers.filter(s => !s.confirmed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Speakers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.speakers.map(speaker => (
          <Card key={speaker.id} className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {getInitials(speaker.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {speaker.name}
                    {speaker.confirmed ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning" />
                    )}
                  </CardTitle>
                  <Badge variant="secondary" className={speaker.confirmed ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}>
                    {speaker.confirmed ? 'Confirmed' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {speaker.bio}
              </p>
              
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sessions</p>
                <div className="flex flex-wrap gap-1">
                  {speaker.sessions.map(session => (
                    <Badge key={session} variant="outline" className="text-xs">
                      {session}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast.info('Edit speaker functionality coming soon!')}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast.info('Contact speaker functionality coming soon!')}
                >
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {state.speakers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No speakers yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first speaker to get started
          </p>
          <AddSpeakerModal>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Speaker
            </Button>
          </AddSpeakerModal>
        </div>
      )}
    </div>
  );
}
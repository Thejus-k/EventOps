import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, MapPin, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { AddEventModal } from '@/components/modals/AddEventModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'planning' | 'active' | 'completed';
  attendees: number;
}

export default function Events() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Mock events data - this would normally come from the app context
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Annual Tech Summit 2024',
      description: 'A comprehensive conference featuring the latest in technology trends and innovations.',
      date: '2024-03-15',
      location: 'San Francisco Convention Center',
      status: 'planning',
      attendees: 500
    },
    {
      id: '2',
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop covering practical applications of AI and ML in business.',
      date: '2024-02-28',
      location: 'Tech Hub Downtown',
      status: 'active',
      attendees: 150
    },
    {
      id: '3',
      title: 'Startup Pitch Competition',
      description: 'Local entrepreneurs present their innovative ideas to potential investors.',
      date: '2024-01-20',
      location: 'Innovation Center',
      status: 'completed',
      attendees: 200
    }
  ]);

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-warning/20 text-warning';
      case 'active':
        return 'bg-success/20 text-success';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleManageEvent = (eventId: string) => {
    // Navigate to dashboard or tasks for the specific event
    navigate('/dashboard');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organized events and create new ones
          </p>
        </div>
        <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Card key={event.id} className="hover:shadow-medium transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {event.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{event.attendees} attendees</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => handleManageEvent(event.id)}
              >
                Manage Event
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
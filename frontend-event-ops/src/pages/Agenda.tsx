import React, { useState } from 'react';
import { Calendar, Plus, Clock, User, Upload, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';

export default function Agenda() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgenda = state.agenda.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.track.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'bg-primary/20 text-primary';
      case 'break':
        return 'bg-warning/20 text-warning';
      case 'networking':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const groupedByTrack = filteredAgenda.reduce((acc, item) => {
    if (!acc[item.track]) {
      acc[item.track] = [];
    }
    acc[item.track].push(item);
    return acc;
  }, {} as Record<string, typeof filteredAgenda>);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Agenda Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your event schedule
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">Agenda Builder</TabsTrigger>
          <TabsTrigger value="preview">Public Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search agenda items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{state.agenda.length} Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <span>{Object.keys(groupedByTrack).length} Tracks</span>
              </div>
            </div>
          </div>

          {/* Agenda by Track */}
          <div className="space-y-6">
            {Object.entries(groupedByTrack).map(([track, items]) => (
              <Card key={track} className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    {track}
                    <Badge variant="secondary" className="ml-auto">
                      {items.length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-sm font-mono text-muted-foreground min-w-0 flex-shrink-0">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        {item.speaker && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <User className="w-3 h-3" />
                            {item.speaker}
                          </p>
                        )}
                      </div>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAgenda.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No agenda items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Start building your event agenda'}
              </p>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Public Agenda View
              </CardTitle>
              <CardDescription>
                This is how attendees will see your event schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-secondary rounded-lg p-6 border">
                <h2 className="text-2xl font-bold text-center mb-6">Event Schedule</h2>
                
                {Object.entries(groupedByTrack).map(([track, items]) => (
                  <div key={track} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold mb-3 text-primary">{track}</h3>
                    <div className="space-y-2">
                      {items.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                        <div key={item.id} className="flex gap-4 p-3 bg-card/50 rounded border">
                          <div className="text-sm font-mono text-muted-foreground min-w-fit">
                            {item.startTime}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            {item.speaker && (
                              <p className="text-sm text-muted-foreground">by {item.speaker}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
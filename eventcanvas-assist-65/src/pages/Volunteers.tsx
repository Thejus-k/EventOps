import React, { useState } from 'react';
import { UserCheck, Plus, Mail, Tag, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/contexts/AppContext';

export default function Volunteers() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVolunteers = state.volunteers.filter(volunteer => 
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Volunteer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Coordinate your event helpers
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4 mr-2" />
          Add Volunteer
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-success" />
            <span>{state.volunteers.length} Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-info" />
            <span>{state.volunteers.reduce((acc, v) => acc + v.assignedTasks.length, 0)} Assigned Tasks</span>
          </div>
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map(volunteer => (
          <Card key={volunteer.id} className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {getInitials(volunteer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{volunteer.name}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {volunteer.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Skills */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Assigned Tasks */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Assigned Tasks ({volunteer.assignedTasks.length})
                </p>
                {volunteer.assignedTasks.length > 0 ? (
                  <div className="space-y-1">
                    {volunteer.assignedTasks.map(taskId => {
                      const task = state.tasks.find(t => t.id === taskId);
                      return task ? (
                        <div key={taskId} className="text-xs bg-muted/50 rounded px-2 py-1">
                          {task.title}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No tasks assigned</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-3 h-3 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Tag className="w-3 h-3 mr-1" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No volunteers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first volunteer to get started'}
          </p>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Add Volunteer
          </Button>
        </div>
      )}
    </div>
  );
}
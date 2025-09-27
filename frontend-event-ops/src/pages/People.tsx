import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Mic, Search, Plus, Download, Upload } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { AddSpeakerModal } from '@/components/modals/AddSpeakerModal';
import { AddVolunteerModal } from '@/components/modals/AddVolunteerModal';
import { exportSpeakersToExcel, exportVolunteersToExcel, readExcelFile, validateSpeakerData, validateVolunteerData } from '@/lib/excel-utils';
import { toast } from 'sonner';

export default function People() {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const speakerFileInputRef = useRef<HTMLInputElement>(null);
  const volunteerFileInputRef = useRef<HTMLInputElement>(null);
  
  const activeTab = searchParams.get('tab') || 'speakers';
  
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const canEdit = state.user?.role === 'event_manager';

  const handleSpeakerExport = () => {
    exportSpeakersToExcel(state.speakers);
    toast.success('Speakers exported to Excel successfully');
  };

  const handleSpeakerImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelFile(file);
      const validatedSpeakers = validateSpeakerData(data);
      
      validatedSpeakers.forEach(speaker => {
        dispatch({ type: 'ADD_SPEAKER', payload: speaker });
      });
      
      toast.success(`${validatedSpeakers.length} speakers imported successfully`);
    } catch (error) {
      toast.error('Failed to import speakers from Excel file');
    }
    
    // Reset file input
    if (speakerFileInputRef.current) {
      speakerFileInputRef.current.value = '';
    }
  };

  const handleVolunteerExport = () => {
    exportVolunteersToExcel(state.volunteers);
    toast.success('Volunteers exported to Excel successfully');
  };

  const handleVolunteerImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelFile(file);
      const validatedVolunteers = validateVolunteerData(data);
      
      validatedVolunteers.forEach(volunteer => {
        dispatch({ type: 'ADD_VOLUNTEER', payload: volunteer });
      });
      
      toast.success(`${validatedVolunteers.length} volunteers imported successfully`);
    } catch (error) {
      toast.error('Failed to import volunteers from Excel file');
    }
    
    // Reset file input
    if (volunteerFileInputRef.current) {
      volunteerFileInputRef.current.value = '';
    }
  };

  const renderSpeakersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Speakers</h2>
          <p className="text-muted-foreground">Manage event speakers and their sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSpeakerExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => speakerFileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <input
            ref={speakerFileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleSpeakerImport}
            className="hidden"
          />
          {canEdit && (
            <AddSpeakerModal>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Speaker
              </Button>
            </AddSpeakerModal>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search speakers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {state.speakers.map(speaker => (
          <Card key={speaker.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    {speaker.name}
                  </CardTitle>
                  <CardDescription>{speaker.bio}</CardDescription>
                </div>
                <Badge variant={speaker.confirmed ? "default" : "secondary"}>
                  {speaker.confirmed ? 'Confirmed' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {speaker.sessions.map(session => (
                  <Badge key={session} variant="outline">{session}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVolunteersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Volunteers</h2>
          <p className="text-muted-foreground">Manage event volunteers and task assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleVolunteerExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => volunteerFileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <input
            ref={volunteerFileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleVolunteerImport}
            className="hidden"
          />
          {canEdit && (
            <AddVolunteerModal>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Volunteer
              </Button>
            </AddVolunteerModal>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search volunteers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {state.volunteers.map(volunteer => (
          <Card key={volunteer.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                {volunteer.name}
              </CardTitle>
              <CardDescription>{volunteer.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Skills: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {volunteer.skills.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Assigned Tasks: </span>
                  <span className="text-muted-foreground">
                    {volunteer.assignedTasks.length} task(s)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAttendeesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendees</h2>
          <p className="text-muted-foreground">Manage event attendees and registrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info('Attendee export coming soon!')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Attendee import coming soon!')}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          {canEdit && (
            <Button onClick={() => toast.info('Add attendee functionality coming soon!')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Attendee
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search attendees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendee Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Attendee management functionality will be implemented here. This includes registration tracking,
            check-in status, ticket types, and session interests.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          People Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage speakers, volunteers, and attendees for your event
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="speakers">
            <Mic className="w-4 h-4 mr-2" />
            Speakers ({state.speakers.length})
          </TabsTrigger>
          <TabsTrigger value="volunteers">
            <UserCheck className="w-4 h-4 mr-2" />
            Volunteers ({state.volunteers.length})
          </TabsTrigger>
          <TabsTrigger value="attendees">
            <Users className="w-4 h-4 mr-2" />
            Attendees (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="speakers" className="mt-6">
          {renderSpeakersTab()}
        </TabsContent>

        <TabsContent value="volunteers" className="mt-6">
          {renderVolunteersTab()}
        </TabsContent>

        <TabsContent value="attendees" className="mt-6">
          {renderAttendeesTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
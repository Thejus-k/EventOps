import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface AddSpeakerModalProps {
  children: React.ReactNode;
}

export function AddSpeakerModal({ children }: AddSpeakerModalProps) {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    confirmed: false
  });
  const [sessions, setSessions] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter speaker name');
      return;
    }

    dispatch({
      type: 'ADD_SPEAKER',
      payload: {
        ...formData,
        sessions: sessions
      }
    });

    toast.success('Speaker added successfully');
    setOpen(false);
    setFormData({ name: '', bio: '', confirmed: false });
    setSessions([]);
    setCurrentSession('');
  };

  const addSession = () => {
    if (currentSession.trim() && !sessions.includes(currentSession.trim())) {
      setSessions([...sessions, currentSession.trim()]);
      setCurrentSession('');
    }
  };

  const removeSession = (session: string) => {
    setSessions(sessions.filter(s => s !== session));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Speaker</DialogTitle>
          <DialogDescription>
            Add a new speaker to your event roster.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Speaker Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter speaker name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Enter speaker bio"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Sessions</Label>
            <div className="flex gap-2">
              <Input
                value={currentSession}
                onChange={(e) => setCurrentSession(e.target.value)}
                placeholder="Enter session name"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSession())}
              />
              <Button type="button" onClick={addSession} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {sessions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sessions.map((session) => (
                  <Badge key={session} variant="secondary" className="flex items-center gap-1">
                    {session}
                    <button
                      type="button"
                      onClick={() => removeSession(session)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="confirmed"
              checked={formData.confirmed}
              onCheckedChange={(confirmed) => setFormData({ ...formData, confirmed })}
            />
            <Label htmlFor="confirmed">Confirmed Speaker</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Speaker</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
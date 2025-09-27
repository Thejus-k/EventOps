import React, { useState, useEffect } from 'react';
import { Task, useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Calendar, User, Tag, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const { dispatch } = useApp();
  const { toast } = useToast();
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [newSubtask, setNewSubtask] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when task changes or modal opens
  useEffect(() => {
    setEditedTask({ ...task });
    setNewSubtask('');
  }, [task, isOpen]);

  const handleSave = async () => {
    // Basic validation
    if (!editedTask.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      dispatch({ type: 'UPDATE_TASK', payload: editedTask });
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      dispatch({ type: 'DELETE_TASK', payload: task.id });
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const subtask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false
    };
    
    setEditedTask({
      ...editedTask,
      subtasks: [...editedTask.subtasks, subtask]
    });
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    });
  };

  const removeSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.filter(st => st.id !== subtaskId)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Edit Task
          </DialogTitle>
          <DialogDescription>Edit details, status, subtasks, and due date for this task.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Enter task title"
                className={!editedTask.title.trim() ? "border-destructive" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="assignee"
                  value={editedTask.assignee}
                  onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
                  placeholder="Assign to..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              placeholder="Task description..."
              rows={3}
            />
          </div>

          {/* Status and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value: Task['status']) => 
                  setEditedTask({ ...editedTask, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={editedTask.stage}
                onValueChange={(value: Task['stage']) => 
                  setEditedTask({ ...editedTask, stage: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-event">Pre-Event</SelectItem>
                  <SelectItem value="during-event">During Event</SelectItem>
                  <SelectItem value="post-event">Post-Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-4">
            <Label>Subtasks ({editedTask.subtasks.filter(st => st.completed).length}/{editedTask.subtasks.length} completed)</Label>
            
            {/* Add new subtask */}
            <div className="flex gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              />
              <Button onClick={addSubtask} size="sm" variant="outline" disabled={isSaving}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Subtask list */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editedTask.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                    disabled={isSaving}
                  />
                  <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtask(subtask.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} variant="default" disabled={isSaving || !editedTask.title.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { Task } from '@/contexts/AppContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export function KanbanColumn({ id, title, tasks, color }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const statusCounts = {
    completed: tasks.filter(t => t.status === 'completed').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/20 rounded-xl p-4 border-2 border-dashed transition-all duration-200",
        isOver ? "border-primary bg-primary/5" : "border-border/50",
        "min-h-[600px]"
      )}
    >
      {/* Column Header */}
      <div className={`border-l-4 ${color} pl-3 mb-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        {/* Status indicators */}
        <div className="flex gap-2 mt-2 text-xs">
          {statusCounts.completed > 0 && (
            <span className="bg-success/20 text-success px-2 py-0.5 rounded">
              ✓ {statusCounts.completed}
            </span>
          )}
          {statusCounts['in-progress'] > 0 && (
            <span className="bg-warning/20 text-warning px-2 py-0.5 rounded">
              ⟳ {statusCounts['in-progress']}
            </span>
          )}
          {statusCounts.todo > 0 && (
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded">
              ○ {statusCounts.todo}
            </span>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map(task => (
          <KanbanCard key={task.id} task={task} />
        ))}
        
        {/* Add Task Button */}
        <Button 
          variant="ghost" 
          className="w-full h-12 border-2 border-dashed border-border/50 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a task
        </Button>
      </div>
    </div>
  );
}
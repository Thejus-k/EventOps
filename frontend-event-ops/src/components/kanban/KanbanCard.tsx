import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, useApp } from '@/contexts/AppContext';
import { Calendar, User, MoreHorizontal, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskModal } from './TaskModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface KanbanCardProps {
  task: Task;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const { dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={cn(
          "bg-card rounded-lg p-4 shadow-soft border cursor-pointer transition-all duration-200",
          "hover:shadow-medium hover:scale-[1.02] hover:border-primary/50",
          isDragging && "opacity-50 rotate-6 scale-105 shadow-large",
          isOverdue && "border-l-4 border-l-destructive",
          "group"
        )}
      >
        {/* Task Status Indicator */}
        <div className="flex items-start justify-between mb-2">
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0 mt-2",
            task.status === 'completed' ? 'bg-success' :
            task.status === 'in-progress' ? 'bg-warning' :
            'bg-muted-foreground'
          )} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}>
                <Edit className="w-3 h-3 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    dispatch({ type: 'DELETE_TASK', payload: task.id });
                  }
                }}
                className="text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Title */}
        <h4 className={cn(
          "font-medium text-sm mb-2 line-clamp-2",
          task.status === 'completed' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Subtasks Progress */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {completedSubtasks}/{totalSubtasks}
            </span>
            <div className="flex-1 bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{task.assignee.split(' ')[0]}</span>
          </div>
        </div>

        {/* Priority or Tag Indicators */}
        {isOverdue && (
          <div className="mt-2">
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
              Overdue
            </span>
          </div>
        )}
      </div>

      <TaskModal 
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Task, useApp } from '@/contexts/AppContext';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTaskModal } from './AddTaskModal';

const columns = [
  { id: 'pre-event', title: 'Pre-Event', color: 'border-l-info' },
  { id: 'during-event', title: 'During Event', color: 'border-l-warning' },
  { id: 'post-event', title: 'Post-Event', color: 'border-l-success' },
];

type ViewMode = 'kanban' | 'list';

export function KanbanBoard() {
  const { state, dispatch } = useApp();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    const task = state.tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStage = over.id as Task['stage'];

    if (columns.find(col => col.id === newStage)) {
      dispatch({
        type: 'MOVE_TASK',
        payload: { taskId, newStage }
      });
    }
  };

  const getTasksByStage = (stage: Task['stage']) => {
    return state.tasks.filter(task => task.stage === stage);
  };

  const isKanbanView = viewMode === 'kanban';
  const isListView = viewMode === 'list';

  if (isListView) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize and track your event tasks
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isKanbanView ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={isListView ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* List View */}
        <div className="space-y-6">
          {columns.map(column => {
            const tasks = getTasksByStage(column.id as Task['stage']);
            return (
              <div key={column.id} className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <div className={`w-1 h-6 ${column.color.replace('border-l-', 'bg-')} rounded`} />
                  {column.title} ({tasks.length})
                </h2>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="bg-card rounded-lg p-4 shadow-soft border-l-4 border-l-muted">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            <span>Assigned: {task.assignee}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-success/20 text-success' :
                          task.status === 'in-progress' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <AddTaskModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Task Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop tasks between stages
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isKanbanView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={isListView ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(column => {
            const tasks = getTasksByStage(column.id as Task['stage']);
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <KanbanColumn
                    id={column.id}
                    title={column.title}
                    tasks={tasks}
                    color={column.color}
                  />
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-6">
              <KanbanCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
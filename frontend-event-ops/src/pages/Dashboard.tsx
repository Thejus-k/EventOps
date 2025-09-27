import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Building,
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  const completedTasks = state.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = state.tasks.length;
  const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const upcomingTasks = state.tasks.filter(task => 
    task.status !== 'completed' && 
    new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: CheckCircle,
      color: "text-primary",
      description: `${completedTasks} completed`
    },
    {
      title: "Active Vendors",
      value: state.vendors.filter(v => v.status === 'active').length,
      icon: Building,
      color: "text-success",
      description: "Ready to serve"
    },
    {
      title: "Volunteers",
      value: state.volunteers.length,
      icon: Users,  
      color: "text-info",
      description: "Registered helpers"
    },
    {
      title: "Agenda Items", 
      value: state.agenda.length,
      icon: Calendar,
      color: "text-warning",
      description: "Scheduled sessions"
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your event overview.
          </p>
        </div>
        <Button 
          variant="gradient" 
          className="shadow-glow"
          onClick={() => toast.info('Report generation coming soon!')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Task Progress */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Task Progress
            </CardTitle>
            <CardDescription>
              Overall completion status across all event stages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(tasksProgress)}%</span>
              </div>
              <Progress value={tasksProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              {['pre-event', 'during-event', 'post-event'].map(stage => {
                const stageTasks = state.tasks.filter(t => t.stage === stage);
                const stageCompleted = stageTasks.filter(t => t.status === 'completed').length;
                const stageProgress = stageTasks.length > 0 ? (stageCompleted / stageTasks.length) * 100 : 0;
                
                return (
                  <div key={stage} className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {stage.replace('-', ' ').toUpperCase()}
                    </p>
                    <p className="text-lg font-bold">{Math.round(stageProgress)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {stageCompleted}/{stageTasks.length} tasks
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>
              Tasks due within 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              upcomingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to keep your event on track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/tasks')}
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-xs">Add Task</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/people?tab=speakers')}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Add Speaker</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/agenda')}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs">Update Agenda</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/certificates')}
            >
              <Award className="w-6 h-6" />
              <span className="text-xs">Generate Certificates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
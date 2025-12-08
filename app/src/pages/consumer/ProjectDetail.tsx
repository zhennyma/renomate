import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProjectStatusBadge, TaskStatusBadge, formatBudgetRange } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  Home,
  Wallet,
  Clock,
  CheckCircle2,
  Package,
  FileText
} from 'lucide-react';
import { 
  getProjectById, 
  getProjectRooms, 
  getProjectTasks, 
  getProjectPack,
  getProjectLineItems,
  calculateProjectProgress 
} from '@/lib/repositories/projectRepository';
import type { Project, Room, Task, ProjectPack, LineItem } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [projectPack, setProjectPack] = useState<ProjectPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, roomsData, tasksData, lineItemsData, packData] = await Promise.all([
        getProjectById(projectId),
        getProjectRooms(projectId),
        getProjectTasks(projectId),
        getProjectLineItems(projectId),
        getProjectPack(projectId),
      ]);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
      setRooms(roomsData);
      setTasks(tasksData);
      setLineItems(lineItemsData);
      setProjectPack(packData);
    } catch (err) {
      setError('Failed to load project details. Please try again.');
      console.error('[Renomate] Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading project details..." />
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <ErrorState message={error || 'Project not found'} onRetry={fetchProjectData} />
      </AppLayout>
    );
  }

  const progress = calculateProjectProgress(tasks);
  
  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    villa: 'Villa',
    townhouse: 'Townhouse',
    penthouse: 'Penthouse',
    studio: 'Studio',
    office: 'Office',
  };

  const renovationDepthLabels: Record<string, string> = {
    light: 'Light',
    medium: 'Medium',
    full: 'Full',
  };

  const roomLifecycleLabels: Record<string, string> = {
    draft: 'Draft',
    open_for_bids: 'Open for Bids',
    sourcing: 'Sourcing',
    execution: 'In Execution',
    completed: 'Completed',
    paused: 'Paused',
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      case 'canceled': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const location = [project.location_area, project.location_city].filter(Boolean).join(', ');

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link 
          to="/consumer/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <ProjectStatusBadge status={project.status} />
                {project.property_type && (
                  <Badge variant="secondary">{propertyTypeLabels[project.property_type] || project.property_type}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            )}
            {project.start_date_desired && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Target start: {format(new Date(project.start_date_desired), 'MMM d, yyyy')}
              </span>
            )}
            {(project.estimated_budget_min || project.estimated_budget_max) && (
              <span className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                {formatBudgetRange(project.estimated_budget_min, project.estimated_budget_max)}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress card */}
            {tasks.length > 0 && (
              <Card className="animate-slide-up">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-card-foreground">Overall Progress</h3>
                    <span className="text-2xl font-bold text-primary">{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {progress.completed} of {progress.total} tasks completed
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs defaultValue="rooms" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="rooms" className="gap-2">
                  <Home className="h-4 w-4" />
                  Rooms ({rooms.length})
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Tasks ({tasks.length})
                </TabsTrigger>
                <TabsTrigger value="items" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Line Items ({lineItems.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rooms" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {rooms.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No rooms added yet. Add rooms to define your project scope.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {rooms.map((room) => (
                          <div key={room.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium text-card-foreground">{room.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {room.room_type || 'Room'}
                                {room.area_sqm && ` • ${room.area_sqm} sqm`}
                                {room.floor && ` • Floor ${room.floor}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {room.renovation_depth && (
                                <Badge variant="outline">
                                  {renovationDepthLabels[room.renovation_depth] || room.renovation_depth}
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                {roomLifecycleLabels[room.lifecycle_state] || room.lifecycle_state}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {tasks.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No tasks created yet. Tasks will be generated as your project progresses.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {tasks.map((task) => (
                          <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                getTaskStatusColor(task.status)
                              )} />
                              <div>
                                <p className="font-medium text-card-foreground">{task.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {task.type && `${task.type} • `}
                                  {task.due_date && `Due ${format(new Date(task.due_date), 'MMM d')}`}
                                  {task.is_blocking && ' • Blocking'}
                                </p>
                              </div>
                            </div>
                            <TaskStatusBadge status={task.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {lineItems.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No line items defined yet. Line items will be created as you define your project scope.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {lineItems.map((item) => (
                          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium text-card-foreground">{item.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.category} • {item.quantity} {item.unit}
                                {item.priority && ` • ${item.priority === 'must_have' ? 'Must Have' : 'Nice to Have'}`}
                              </p>
                            </div>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Project Pack Panel */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Project Pack
                </CardTitle>
                <CardDescription>
                  Summary of your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Budget</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatBudgetRange(project.estimated_budget_min, project.estimated_budget_max)}
                  </p>
                </div>

                {/* Timeline */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Timeline</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {project.start_date_desired 
                      ? format(new Date(project.start_date_desired), 'MMM d, yyyy')
                      : 'Start date TBD'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Target start date
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">{rooms.length}</p>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">{lineItems.length}</p>
                    <p className="text-xs text-muted-foreground">Line Items</p>
                  </div>
                </div>

                {/* Pack Status */}
                {projectPack ? (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pack Status</span>
                      <Badge variant={projectPack.status === 'published' ? 'default' : 'secondary'}>
                        {projectPack.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Version {projectPack.version}
                      {projectPack.generated_at && ` • Generated ${format(new Date(projectPack.generated_at), 'MMM d')}`}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 border-t border-border">
                    Project Pack will be generated once you add more project details.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

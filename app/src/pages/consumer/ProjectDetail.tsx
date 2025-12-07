import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProjectStatusBadge, BudgetBandBadge, TaskStatusBadge } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  Home,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Package
} from 'lucide-react';
import { 
  getProjectById, 
  getProjectRooms, 
  getProjectTasks, 
  getProjectPack,
  calculateProjectProgress 
} from '@/lib/repositories/projectRepository';
import { getBlindSpotIcon } from '@/lib/repositories/mockData';
import type { Project, Room, Task, ProjectPack } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectPack, setProjectPack] = useState<ProjectPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, roomsData, tasksData, packData] = await Promise.all([
        getProjectById(projectId),
        getProjectRooms(projectId),
        getProjectTasks(projectId),
        getProjectPack(projectId),
      ]);
      
      if (!projectData) {
        setError('Project not found');
        return;
      }
      
      setProject(projectData);
      setRooms(roomsData);
      setTasks(tasksData);
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
  const propertyTypeLabels = {
    apartment: 'Apartment',
    villa: 'Villa',
    townhouse: 'Townhouse',
    penthouse: 'Penthouse',
  };

  const renovationDepthLabels = {
    cosmetic: 'Cosmetic',
    partial: 'Partial',
    full: 'Full',
    structural: 'Structural',
  };

  const roomTypeLabels = {
    kitchen: 'Kitchen',
    bathroom: 'Bathroom',
    bedroom: 'Bedroom',
    living_room: 'Living Room',
    dining_room: 'Dining Room',
    office: 'Office',
    balcony: 'Balcony',
    other: 'Other',
  };

  const taskOwnerLabels = {
    consumer: 'You',
    designer: 'Designer',
    contractor: 'Contractor',
    supplier: 'Supplier',
    building: 'Building',
  };

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
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <ProjectStatusBadge status={project.status} />
                <BudgetBandBadge band={project.budget_band} />
                <Badge variant="secondary">{propertyTypeLabels[project.property_type]}</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {project.location}
            </span>
            {project.start_date && project.target_end_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(project.start_date), 'MMM d, yyyy')} - {format(new Date(project.target_end_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress card */}
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
              </TabsList>

              <TabsContent value="rooms" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    {rooms.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No rooms added yet
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {rooms.map((room) => (
                          <div key={room.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium text-card-foreground">{room.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {roomTypeLabels[room.room_type]}
                                {room.area_sqm && ` • ${room.area_sqm} sqm`}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {renovationDepthLabels[room.renovation_depth]}
                            </Badge>
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
                        No tasks created yet
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {tasks.map((task) => (
                          <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                task.status === 'completed' && "bg-success",
                                task.status === 'in_progress' && "bg-warning",
                                task.status === 'pending' && "bg-muted-foreground",
                                task.status === 'blocked' && "bg-info"
                              )} />
                              <div>
                                <p className="font-medium text-card-foreground">{task.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Owner: {taskOwnerLabels[task.owner]}
                                  {task.due_date && ` • Due ${format(new Date(task.due_date), 'MMM d')}`}
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
                  Summary generated from your project details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Budget</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    AED {projectPack?.budget_summary.total.toLocaleString() || project.estimated_budget?.toLocaleString() || 'TBD'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {project.budget_band} tier
                  </p>
                </div>

                {/* Timeline */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Timeline</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {projectPack?.timeline_summary.estimated_duration_weeks || '—'} weeks
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Target: {project.target_end_date ? format(new Date(project.target_end_date), 'MMM d, yyyy') : 'TBD'}
                  </p>
                </div>

                {/* Rooms count */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Rooms</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {rooms.length} rooms
                  </p>
                </div>

                {/* Blind spots */}
                {projectPack && projectPack.blind_spots.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-foreground">Blind Spots & Risks</span>
                    </div>
                    <div className="space-y-2">
                      {projectPack.blind_spots.map((spot) => (
                        <div 
                          key={spot.id}
                          className={cn(
                            "p-2 rounded-md text-sm",
                            spot.severity === 'high' && "bg-destructive/10",
                            spot.severity === 'medium' && "bg-warning/10",
                            spot.severity === 'low' && "bg-muted"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span>{getBlindSpotIcon(spot.category)}</span>
                            <div>
                              <p className="font-medium text-card-foreground">{spot.title}</p>
                              <p className="text-xs text-muted-foreground">{spot.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!projectPack && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Project Pack will be generated once more details are added.
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProjectStatusBadge, formatBudgetRange } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FolderKanban, 
  Plus, 
  MapPin, 
  Calendar,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { getConsumerProjects, getProjectTasks, calculateProjectProgress } from '@/lib/repositories/projectRepository';
import type { Project, Task } from '@/lib/types';
import { format } from 'date-fns';

interface ProjectWithProgress extends Project {
  progress: { completed: number; total: number; percentage: number };
}

export default function ProjectsList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const projectsData = await getConsumerProjects(user.id);
      
      // Fetch tasks for each project to calculate progress
      const projectsWithProgress = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasks = await getProjectTasks(project.id);
            const progress = calculateProjectProgress(tasks);
            return { ...project, progress };
          } catch {
            // If tasks fetch fails, return project with zero progress
            return { ...project, progress: { completed: 0, total: 0, percentage: 0 } };
          }
        })
      );
      
      setProjects(projectsWithProgress);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('[Renomate] Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  const propertyTypeIcons: Record<string, string> = {
    apartment: '🏢',
    villa: '🏠',
    townhouse: '🏘️',
    penthouse: '🌆',
    studio: '🏠',
    office: '🏢',
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              {user?.full_name ? `Welcome back, ${user.full_name}` : 'Manage your home renovation projects'}
            </p>
          </div>
          <Button variant="default" size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState message="Loading your projects..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchProjects} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
            title="No projects yet"
            description="Start your renovation journey by creating your first project. We'll help you plan, find suppliers, and manage the entire process."
            action={
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" />
                Start Your First Project
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/consumer/projects/${project.id}`}
                className="block animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Property type icon */}
                      <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-xl bg-secondary text-2xl">
                        {project.property_type ? propertyTypeIcons[project.property_type] || '🏠' : '🏠'}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <ProjectStatusBadge status={project.status} />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          {(project.location_city || project.location_area) && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {[project.location_area, project.location_city].filter(Boolean).join(', ')}
                            </span>
                          )}
                          {project.start_date_desired && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              Target: {format(new Date(project.start_date_desired), 'MMM d, yyyy')}
                            </span>
                          )}
                          {(project.estimated_budget_min || project.estimated_budget_max) && (
                            <span className="flex items-center gap-1.5">
                              <Wallet className="h-4 w-4" />
                              {formatBudgetRange(project.estimated_budget_min, project.estimated_budget_max)}
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        {project.progress.total > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="flex-1 max-w-xs">
                              <Progress value={project.progress.percentage} className="h-2" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {project.progress.completed} of {project.progress.total} tasks
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="hidden lg:block h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

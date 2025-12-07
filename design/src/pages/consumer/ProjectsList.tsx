import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ProjectStatusBadge, BudgetBandBadge } from '@/components/shared/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderKanban, 
  Plus, 
  MapPin, 
  Calendar,
  ArrowRight,
  Home
} from 'lucide-react';
import { getConsumerProjects, getProjectTasks, calculateProjectProgress } from '@/lib/repositories/projectRepository';
import type { Project, Task } from '@/lib/types';
import { format } from 'date-fns';

interface ProjectWithProgress extends Project {
  progress: { completed: number; total: number; percentage: number };
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectsData = await getConsumerProjects();
      
      // Fetch tasks for each project to calculate progress
      const projectsWithProgress = await Promise.all(
        projectsData.map(async (project) => {
          const tasks = await getProjectTasks(project.id);
          const progress = calculateProjectProgress(tasks);
          return { ...project, progress };
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
  }, []);

  const propertyTypeIcons = {
    apartment: '🏢',
    villa: '🏠',
    townhouse: '🏘️',
    penthouse: '🌆',
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your home renovation projects
            </p>
          </div>
          <Button variant="hero" size="lg" className="gap-2">
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
            description="Your renovation projects will appear here once you've started one."
            action={
              <Button variant="hero" className="gap-2">
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
                        {propertyTypeIcons[project.property_type]}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <ProjectStatusBadge status={project.status} />
                            <BudgetBandBadge band={project.budget_band} />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {project.location}
                          </span>
                          {project.start_date && project.target_end_date && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(project.start_date), 'MMM d')} - {format(new Date(project.target_end_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 max-w-xs">
                            <Progress value={project.progress.percentage} className="h-2" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">
                            {project.progress.completed} of {project.progress.total} tasks
                          </span>
                        </div>
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

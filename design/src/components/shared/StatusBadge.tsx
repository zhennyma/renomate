import { Badge } from '@/components/ui/badge';
import type { ProjectStatus, LeadStatus, FitScore, BudgetBand, TaskStatus } from '@/lib/types';

// Project Status
const projectStatusConfig: Record<ProjectStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'default' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  planning: { label: 'Planning', variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  on_hold: { label: 'On Hold', variant: 'muted' },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = projectStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Lead Status
const leadStatusConfig: Record<LeadStatus, { label: string; variant: 'new' | 'viewed' | 'responded' | 'success' | 'muted' }> = {
  new: { label: 'New', variant: 'new' },
  viewed: { label: 'Viewed', variant: 'viewed' },
  responded: { label: 'Responded', variant: 'responded' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'muted' },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = leadStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Fit Score
const fitScoreConfig: Record<FitScore, { label: string; variant: 'fitHigh' | 'fitMedium' | 'fitLow' }> = {
  high: { label: 'High Fit', variant: 'fitHigh' },
  medium: { label: 'Medium Fit', variant: 'fitMedium' },
  low: { label: 'Low Fit', variant: 'fitLow' },
};

export function FitScoreBadge({ score, value }: { score: FitScore; value?: number }) {
  const config = fitScoreConfig[score];
  return (
    <Badge variant={config.variant}>
      {config.label}{value !== undefined && ` (${value}%)`}
    </Badge>
  );
}

// Budget Band
const budgetBandConfig: Record<BudgetBand, { label: string; variant: 'economy' | 'standard' | 'premium' | 'luxury' }> = {
  economy: { label: 'Economy', variant: 'economy' },
  standard: { label: 'Standard', variant: 'standard' },
  premium: { label: 'Premium', variant: 'premium' },
  luxury: { label: 'Luxury', variant: 'luxury' },
};

export function BudgetBandBadge({ band }: { band: BudgetBand }) {
  const config = budgetBandConfig[band];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Task Status
const taskStatusConfig: Record<TaskStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' }> = {
  pending: { label: 'Pending', variant: 'muted' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  completed: { label: 'Done', variant: 'success' },
  blocked: { label: 'Blocked', variant: 'info' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = taskStatusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

import { Badge } from '@/components/ui/badge';
import type { 
  ProjectStatus, 
  DecisionStatus, 
  TaskStatus,
  FitScoreLevel,
  BudgetTier
} from '@/lib/types';

// Project Status - matches real database schema
const projectStatusConfig: Record<ProjectStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'default' | 'destructive' }> = {
  draft: { label: 'Draft', variant: 'muted' },
  ready_for_review: { label: 'Ready for Review', variant: 'info' },
  open_for_bids: { label: 'Open for Bids', variant: 'info' },
  sourcing: { label: 'Sourcing', variant: 'warning' },
  execution: { label: 'In Execution', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  canceled: { label: 'Canceled', variant: 'destructive' },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = projectStatusConfig[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Decision Status (for supplier invites/leads)
const decisionStatusConfig: Record<DecisionStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'default' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'info' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'muted' },
  waitlisted: { label: 'Waitlisted', variant: 'warning' },
};

export function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  const config = decisionStatusConfig[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Fit Score
const fitScoreConfig: Record<FitScoreLevel, { label: string; variant: 'success' | 'warning' | 'muted' }> = {
  high: { label: 'High Fit', variant: 'success' },
  medium: { label: 'Medium Fit', variant: 'warning' },
  low: { label: 'Low Fit', variant: 'muted' },
};

export function FitScoreBadge({ level, value }: { level: FitScoreLevel; value?: number }) {
  const config = fitScoreConfig[level];
  return (
    <Badge variant={config.variant}>
      {config.label}{value !== undefined && ` (${value}%)`}
    </Badge>
  );
}

// Budget Tier
const budgetTierConfig: Record<BudgetTier, { label: string; className: string }> = {
  low: { label: 'Budget', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  mid: { label: 'Standard', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  premium: { label: 'Premium', className: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export function BudgetTierBadge({ tier }: { tier: BudgetTier | undefined }) {
  if (!tier) return null;
  const config = budgetTierConfig[tier];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

// Task Status
const taskStatusConfig: Record<TaskStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'destructive' }> = {
  todo: { label: 'To Do', variant: 'muted' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  blocked: { label: 'Blocked', variant: 'destructive' },
  done: { label: 'Done', variant: 'success' },
  canceled: { label: 'Canceled', variant: 'muted' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = taskStatusConfig[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Format budget range for display
export function formatBudgetRange(min?: number, max?: number): string {
  if (!min && !max) return 'Budget TBD';
  
  const formatter = new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  });
  
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) {
    return `From ${formatter.format(min)}`;
  }
  if (max) {
    return `Up to ${formatter.format(max)}`;
  }
  return 'Budget TBD';
}

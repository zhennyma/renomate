import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LeadStatusBadge, FitScoreBadge, BudgetBandBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  MapPin, 
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { getSupplierLeads } from '@/lib/repositories/supplierRepository';
import type { ProjectSupplierInvite } from '@/lib/types';
import { format } from 'date-fns';

export default function LeadsList() {
  const [leads, setLeads] = useState<ProjectSupplierInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leadsData = await getSupplierLeads();
      setLeads(leadsData);
    } catch (err) {
      setError('Failed to load leads. Please try again.');
      console.error('[Renomate] Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const propertyTypeLabels = {
    apartment: 'Apartment',
    villa: 'Villa',
    townhouse: 'Townhouse',
    penthouse: 'Penthouse',
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Leads & Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Review project invitations and submit proposals
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState message="Loading your leads..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeads} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
            title="No leads yet"
            description="Leads will appear here once you're invited to renovation projects that match your expertise."
          />
        ) : (
          <div className="grid gap-4">
            {leads.map((lead, index) => (
              <Link
                key={lead.id}
                to={`/supplier/leads/${lead.id}`}
                className="block animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Fit score indicator */}
                      <div className="hidden lg:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-secondary">
                        <TrendingUp className="h-5 w-5 text-primary mb-1" />
                        <span className="text-xs font-bold text-primary">
                          {lead.fit_score_value}%
                        </span>
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                            {lead.project?.name || 'Unnamed Project'}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <LeadStatusBadge status={lead.status} />
                            <FitScoreBadge score={lead.fit_score} value={lead.fit_score_value} />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          {lead.project && (
                            <>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {lead.project.location}
                              </span>
                              <span className="capitalize">
                                {propertyTypeLabels[lead.project.property_type]}
                              </span>
                            </>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            Invited {format(new Date(lead.invited_at), 'MMM d, yyyy')}
                          </span>
                        </div>

                        {/* Budget and timeline preview */}
                        {lead.project && (
                          <div className="flex items-center gap-3">
                            <BudgetBandBadge band={lead.project.budget_band} />
                            {lead.project.estimated_budget && (
                              <span className="text-sm text-muted-foreground">
                                ~AED {(lead.project.estimated_budget / 1000).toFixed(0)}K budget
                              </span>
                            )}
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

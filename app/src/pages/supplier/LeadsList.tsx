import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { DecisionStatusBadge, FitScoreBadge, formatBudgetRange } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Calendar,
  ArrowRight,
  TrendingUp,
  Inbox,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getSupplierLeads, getSupplierProfile } from '@/lib/repositories/supplierRepository';
import type { ProjectSupplierInvite, Project } from '@/lib/types';
import { getFitScoreLevel } from '@/lib/types';
import { format } from 'date-fns';

type LeadWithProject = ProjectSupplierInvite & { project: Project };

export default function LeadsList() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierProfileId, setSupplierProfileId] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First get the supplier profile ID
      const profile = await getSupplierProfile(user.id);
      if (!profile) {
        setError('Supplier profile not found. Please complete your profile setup.');
        return;
      }
      
      setSupplierProfileId(profile.id);
      
      // Then fetch leads
      const leadsData = await getSupplierLeads(profile.id);
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
  }, [user?.id]);

  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Apartment',
    villa: 'Villa',
    townhouse: 'Townhouse',
    penthouse: 'Penthouse',
    studio: 'Studio',
    office: 'Office',
  };

  // Filter leads by status
  const pendingLeads = leads.filter(l => l.decision_status === 'pending');
  const acceptedLeads = leads.filter(l => l.decision_status === 'accepted');
  const declinedLeads = leads.filter(l => l.decision_status === 'declined' || l.decision_status === 'waitlisted');

  const renderLeadCard = (lead: LeadWithProject, index: number) => {
    const location = [lead.project.location_area, lead.project.location_city].filter(Boolean).join(', ');
    const fitScoreLevel = getFitScoreLevel(lead.fit_score ?? undefined);
    
    return (
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
                  {lead.fit_score ? `${Math.round(lead.fit_score)}%` : '—'}
                </span>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                    {lead.project.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <DecisionStatusBadge status={lead.decision_status} />
                    {lead.fit_score && (
                      <FitScoreBadge level={fitScoreLevel} value={Math.round(lead.fit_score)} />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {location}
                    </span>
                  )}
                  {lead.project.property_type && (
                    <span className="capitalize">
                      {propertyTypeLabels[lead.project.property_type] || lead.project.property_type}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Invited {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Budget preview */}
                {(lead.project.estimated_budget_min || lead.project.estimated_budget_max) && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {formatBudgetRange(lead.project.estimated_budget_min, lead.project.estimated_budget_max)}
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
    );
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Leads & Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            {user?.full_name ? `Welcome, ${user.full_name}` : 'Review project invitations and submit proposals'}
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
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Inbox className="h-4 w-4" />
                Pending ({pendingLeads.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Accepted ({acceptedLeads.length})
              </TabsTrigger>
              <TabsTrigger value="declined" className="gap-2">
                <XCircle className="h-4 w-4" />
                Declined ({declinedLeads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingLeads.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
                  title="No pending leads"
                  description="New invitations will appear here."
                />
              ) : (
                <div className="grid gap-4">
                  {pendingLeads.map((lead, index) => renderLeadCard(lead, index))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {acceptedLeads.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="h-8 w-8 text-muted-foreground" />}
                  title="No accepted leads"
                  description="Leads you've accepted will appear here."
                />
              ) : (
                <div className="grid gap-4">
                  {acceptedLeads.map((lead, index) => renderLeadCard(lead, index))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="declined" className="space-y-4">
              {declinedLeads.length === 0 ? (
                <EmptyState
                  icon={<XCircle className="h-8 w-8 text-muted-foreground" />}
                  title="No declined leads"
                  description="Leads you've declined will appear here."
                />
              ) : (
                <div className="grid gap-4">
                  {declinedLeads.map((lead, index) => renderLeadCard(lead, index))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

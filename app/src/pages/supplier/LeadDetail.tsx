import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { DecisionStatusBadge, FitScoreBadge, formatBudgetRange } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  Home,
  Wallet,
  Clock,
  FileText,
  Send,
  Package,
  Hammer,
  Palette,
  Truck,
  Check,
  X
} from 'lucide-react';
import { 
  getLeadWithDetails,
  updateInviteDecision
} from '@/lib/repositories/supplierRepository';
import type { ProjectSupplierInvite, Project, ProjectPack, Room, LineItem } from '@/lib/types';
import { getFitScoreLevel } from '@/lib/types';
import { format } from 'date-fns';

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const [invite, setInvite] = useState<ProjectSupplierInvite | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projectPack, setProjectPack] = useState<ProjectPack | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [updatingDecision, setUpdatingDecision] = useState(false);

  const fetchLeadData = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getLeadWithDetails(leadId);
      
      if (!data) {
        setError('Lead not found');
        return;
      }
      
      setInvite(data.invite);
      setProject(data.project);
      setProjectPack(data.pack);
      setRooms(data.rooms);
      setLineItems(data.lineItems);
    } catch (err) {
      setError('Failed to load lead details. Please try again.');
      console.error('[Renomate] Error fetching lead:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [leadId]);

  const handleAccept = async () => {
    if (!leadId || !invite) return;
    
    try {
      setUpdatingDecision(true);
      const updated = await updateInviteDecision(leadId, 'accepted');
      setInvite(updated);
      toast({
        title: 'Lead accepted',
        description: 'You can now prepare and submit a quote for this project.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to accept lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingDecision(false);
    }
  };

  const handleDecline = async () => {
    if (!leadId || !invite) return;
    
    try {
      setUpdatingDecision(true);
      const updated = await updateInviteDecision(leadId, 'declined');
      setInvite(updated);
      toast({
        title: 'Lead declined',
        description: 'This lead has been moved to your declined list.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to decline lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingDecision(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading lead details..." />
      </AppLayout>
    );
  }

  if (error || !invite || !project) {
    return (
      <AppLayout>
        <ErrorState message={error || 'Lead not found'} onRetry={fetchLeadData} />
      </AppLayout>
    );
  }

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

  const location = [project.location_area, project.location_city].filter(Boolean).join(', ');
  const fitScoreLevel = getFitScoreLevel(invite.fit_score ?? undefined);
  const isPending = invite.decision_status === 'pending';
  const isAccepted = invite.decision_status === 'accepted';

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Link 
          to="/supplier/leads"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <DecisionStatusBadge status={invite.decision_status} />
                {invite.fit_score && (
                  <FitScoreBadge level={fitScoreLevel} value={Math.round(invite.fit_score)} />
                )}
                {project.property_type && (
                  <Badge variant="secondary">
                    {propertyTypeLabels[project.property_type] || project.property_type}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action buttons for pending leads */}
            {isPending && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleDecline}
                  disabled={updatingDecision}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
                <Button 
                  onClick={handleAccept}
                  disabled={updatingDecision}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Accept Lead
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Invited {format(new Date(invite.created_at), 'MMM d, yyyy')}
            </span>
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
            {/* Project summary */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">{rooms.length}</p>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">{lineItems.length}</p>
                    <p className="text-xs text-muted-foreground">Line Items</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {project.start_date_desired 
                        ? format(new Date(project.start_date_desired), 'MMM')
                        : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Target Start</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {invite.fit_score ? `${Math.round(invite.fit_score)}%` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Fit Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Pack Snapshot */}
            <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Project Pack Snapshot
                </CardTitle>
                <CardDescription>
                  Detailed breakdown for quoting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room breakdown */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Room-Level Breakdown
                  </h4>
                  {rooms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No rooms specified yet</p>
                  ) : (
                    <div className="grid gap-2">
                      {rooms.map((room) => (
                        <div 
                          key={room.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{room.name}</span>
                            {room.room_type && (
                              <Badge variant="secondary" className="text-xs">
                                {room.room_type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {room.area_sqm && <span>{room.area_sqm} sqm</span>}
                            {room.renovation_depth && (
                              <Badge variant="outline" className="text-xs">
                                {renovationDepthLabels[room.renovation_depth] || room.renovation_depth}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Line items summary */}
                {lineItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Line Items ({lineItems.length})
                    </h4>
                    <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                      {lineItems.slice(0, 10).map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                        >
                          <span className="truncate">{item.description}</span>
                          <span className="text-muted-foreground whitespace-nowrap ml-2">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                      {lineItems.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{lineItems.length - 10} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Perspective hints */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Designer View</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rooms.length} rooms requiring design consultation
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Hammer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Contractor View</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lineItems.length} line items for BOQ pricing
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Material View</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Material schedule with quantities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote workspace - only show if accepted */}
            {isAccepted && (
              <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Quote / Proposal Workspace
                  </CardTitle>
                  <CardDescription>
                    Draft your response to this lead
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your draft quote notes, pricing considerations, or proposal outline here..."
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    className="min-h-[150px] resize-y"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="default" className="gap-2">
                      <Send className="h-4 w-4" />
                      Start Draft Quote
                    </Button>
                  </div>

                  {/* Placeholder for future quote builder */}
                  <div className="mt-6 p-6 rounded-lg border-2 border-dashed border-border bg-muted/30">
                    <p className="text-sm text-muted-foreground text-center">
                      Line-item quote builder coming soon. You'll be able to create detailed proposals with pricing breakdowns here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar summary */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Est. Budget</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {formatBudgetRange(project.estimated_budget_min, project.estimated_budget_max)}
                  </p>
                </div>

                {/* Timeline */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Target Start</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {project.start_date_desired 
                      ? format(new Date(project.start_date_desired), 'MMM d, yyyy')
                      : 'TBD'}
                  </p>
                </div>

                {/* Rooms */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Scope</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {rooms.length} rooms
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rooms.filter(r => r.renovation_depth === 'full').length} full renovation
                  </p>
                </div>

                {/* Pack status */}
                {projectPack && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pack Status</span>
                      <Badge variant={projectPack.status === 'published' ? 'default' : 'secondary'}>
                        {projectPack.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

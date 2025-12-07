import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LeadStatusBadge, FitScoreBadge, BudgetBandBadge } from '@/components/shared/StatusBadge';
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
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  Save,
  Package,
  Hammer,
  Palette,
  Truck
} from 'lucide-react';
import { 
  getLeadById, 
  getLeadProjectPack, 
  getLeadProjectRooms,
  saveDraftQuoteNotes 
} from '@/lib/repositories/supplierRepository';
import { getBlindSpotIcon } from '@/lib/repositories/mockData';
import type { ProjectSupplierInvite, ProjectPack, Room } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const [lead, setLead] = useState<ProjectSupplierInvite | null>(null);
  const [projectPack, setProjectPack] = useState<ProjectPack | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeadData = async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const leadData = await getLeadById(leadId);
      
      if (!leadData) {
        setError('Lead not found');
        return;
      }
      
      setLead(leadData);
      
      if (leadData.project_id) {
        const [packData, roomsData] = await Promise.all([
          getLeadProjectPack(leadData.project_id),
          getLeadProjectRooms(leadData.project_id),
        ]);
        setProjectPack(packData);
        setRooms(roomsData);
      }
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

  const handleSaveDraft = async () => {
    if (!leadId) return;
    
    try {
      setSaving(true);
      await saveDraftQuoteNotes(leadId, quoteNotes);
      toast({
        title: 'Draft saved',
        description: 'Your quote notes have been saved.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading lead details..." />
      </AppLayout>
    );
  }

  if (error || !lead) {
    return (
      <AppLayout>
        <ErrorState message={error || 'Lead not found'} onRetry={fetchLeadData} />
      </AppLayout>
    );
  }

  const project = lead.project;
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
                {project?.name || 'Project Lead'}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <LeadStatusBadge status={lead.status} />
                <FitScoreBadge score={lead.fit_score} value={lead.fit_score_value} />
                {project && (
                  <>
                    <BudgetBandBadge band={project.budget_band} />
                    <Badge variant="secondary">{propertyTypeLabels[project.property_type]}</Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {project && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {project.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Invited {format(new Date(lead.invited_at), 'MMM d, yyyy')}
              </span>
            </div>
          )}
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
                <p className="text-muted-foreground mb-4">
                  {project?.description || 'No description provided for this renovation project.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">{rooms.length}</p>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {projectPack?.timeline_summary.estimated_duration_weeks || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Weeks</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground capitalize">
                      {project?.budget_band || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Budget Tier</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {lead.fit_score_value}%
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
                    <p className="text-sm text-muted-foreground">No rooms specified</p>
                  ) : (
                    <div className="grid gap-2">
                      {rooms.map((room) => (
                        <div 
                          key={room.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{room.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {roomTypeLabels[room.room_type]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {room.area_sqm && <span>{room.area_sqm} sqm</span>}
                            <Badge variant="outline" className="text-xs">
                              {renovationDepthLabels[room.renovation_depth]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Blind spots */}
                {projectPack && projectPack.blind_spots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Constraints & Blind Spots
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {projectPack.blind_spots.map((spot) => (
                        <Badge 
                          key={spot.id}
                          variant={
                            spot.severity === 'high' ? 'destructive' :
                            spot.severity === 'medium' ? 'warning' : 'secondary'
                          }
                          className="gap-1"
                        >
                          {getBlindSpotIcon(spot.category)} {spot.title}
                        </Badge>
                      ))}
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
                      <Hammer className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">Contractor View</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      BOQ ready for pricing • MEP scope included
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-info" />
                      <span className="text-sm font-medium">Material View</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Material schedule with {rooms.length * 5}+ line items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote workspace */}
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
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleSaveDraft}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button variant="hero" className="gap-2">
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
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Est. Budget</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    AED {project?.estimated_budget?.toLocaleString() || 'TBD'}
                  </p>
                </div>

                {/* Timeline */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Target Timeline</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {projectPack?.timeline_summary.estimated_duration_weeks || '—'} weeks
                  </p>
                  {project?.target_end_date && (
                    <p className="text-xs text-muted-foreground">
                      Complete by {format(new Date(project.target_end_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                {/* Rooms */}
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">Scope</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {rooms.length} rooms
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rooms.filter(r => r.renovation_depth === 'full').length} full, {rooms.filter(r => r.renovation_depth !== 'full').length} partial
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

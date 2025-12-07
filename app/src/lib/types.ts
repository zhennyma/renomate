/**
 * Renomate Type Definitions
 * 
 * These types align with the Supabase ERD as documented in track-b-erd.md
 * 
 * SOURCE OF TRUTH:
 * - Database schema (supabase/migrations/) → defines the actual structure
 * - types.generated.ts → auto-generated from database via `npm run db:types`
 * - This file (types.ts) → app-specific types + re-exports from generated
 * 
 * WORKFLOW: When schema changes, run `npm run db:types` to regenerate.
 * 
 * Last synced: 2025-12-07
 */

// Re-export generated types for direct database access
export type { Database, Json } from '../integrations/supabase/types.generated';
import type { Database } from '../integrations/supabase/types.generated';

// Helper to extract table row types from generated types
type Tables = Database['public']['Tables'];
export type DbUser = Tables['users']['Row'];
export type DbProject = Tables['projects']['Row'];
export type DbRoom = Tables['rooms']['Row'];
export type DbTask = Tables['tasks']['Row'];
export type DbProjectPack = Tables['project_packs']['Row'];
export type DbSupplierProfile = Tables['supplier_profiles']['Row'];
export type DbProjectSupplierInvite = Tables['project_supplier_invites']['Row'];
export type DbQuote = Tables['quotes']['Row'];

// ============================================================================
// 1. CORE IDENTITY & PROFILES
// ============================================================================

export type UserRole = 'consumer' | 'supplier' | 'admin' | 'ops';

export interface User {
  id: string;
  auth_provider_id: string;
  role: UserRole;
  email?: string;
  phone?: string;
  full_name?: string;
  whatsapp_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetTier = 'low' | 'mid' | 'premium';

export interface ConsumerProfile {
  user_id: string;
  location_city?: string;
  location_area?: string;
  preferred_style?: string;
  budget_tier?: BudgetTier;
}

export type SupplierStatus = 'pending_review' | 'active' | 'suspended';

export interface SupplierProfile {
  id: string;
  user_id?: string;
  company_name: string;
  trade_type: string;
  coverage_cities: string[];
  min_project_value?: number;
  max_project_value?: number;
  styles: string[];
  status: SupplierStatus;
  created_at: string;
}

// ============================================================================
// 2. PROJECTS, ROOMS, LINE ITEMS
// ============================================================================

export type ProjectStatus = 
  | 'draft' 
  | 'ready_for_review' 
  | 'open_for_bids' 
  | 'sourcing' 
  | 'execution' 
  | 'completed' 
  | 'canceled';

export interface Project {
  id: string;
  consumer_id: string;
  title: string;
  status: ProjectStatus;
  location_city?: string;
  location_area?: string;
  property_type?: string;
  estimated_budget_min?: number;
  estimated_budget_max?: number;
  start_date_desired?: string;
  created_at: string;
  updated_at: string;
}

export type RenovationDepth = 'light' | 'medium' | 'full';
export type RoomLifecycleState = 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'paused';
export type RoomExecutionState = 'not_started' | 'in_progress' | 'ready_for_inspection' | 'rework_required' | 'complete';

export interface Room {
  id: string;
  project_id: string;
  name: string;
  room_type?: string;
  area_sqm?: number;
  floor?: number;
  renovation_depth?: RenovationDepth;
  lifecycle_state: RoomLifecycleState;
  execution_state: RoomExecutionState;
  previous_lifecycle_state?: RoomLifecycleState;
}

export type LineItemPriority = 'must_have' | 'nice_to_have';
export type LineItemStatus = 'draft' | 'ready_for_quote' | 'quoted' | 'in_execution' | 'done' | 'dropped';

export interface LineItem {
  id: string;
  project_id: string;
  room_id?: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  waste_factor_pct?: number;
  calculated_quantity?: number;
  priority?: LineItemPriority;
  status: LineItemStatus;
}

// ============================================================================
// 2.4 PROJECT PACKS
// ============================================================================

export type ProjectPackStatus = 'draft' | 'published' | 'archived';

export interface ProjectPack {
  id: string;
  project_id: string;
  version: number;
  status: ProjectPackStatus;
  generated_at?: string;
  generated_by?: string;
}

// ============================================================================
// 3. INSPIRATION MODULE
// ============================================================================

export type InspirationAssetType = 'room_photo' | 'material_reference' | 'moodboard' | 'video';
export type PriceBand = 'low' | 'mid' | 'high';
export type CreatorType = 'designer' | 'contractor' | 'platform';

export interface InspirationAsset {
  id: string;
  type: InspirationAssetType;
  media_url: string;
  title?: string;
  description?: string;
  location_city?: string;
  style_tags: string[];
  finish_tags: string[];
  price_band?: PriceBand;
  creator_type?: CreatorType;
  creator_supplier_id?: string;
  created_at: string;
}

export interface InspirationBoard {
  id: string;
  consumer_id: string;
  project_id?: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface InspirationBoardItem {
  id: string;
  board_id: string;
  asset_id: string;
  note?: string;
  created_at: string;
}

export interface Favourite {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

// ============================================================================
// 4. SUPPLIER MATCHING, INVITES, QUOTES
// ============================================================================

export type InviteChannel = 'whatsapp' | 'email' | 'dashboard';
export type DecisionStatus = 'pending' | 'accepted' | 'declined' | 'waitlisted';

export interface ProjectSupplierInvite {
  id: string;
  project_id: string;
  supplier_id: string;
  invite_channel: InviteChannel;
  decision_status: DecisionStatus;
  decline_reason?: string;
  fit_score?: number;
  magic_link_token?: string;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  project?: Project;
  supplier?: SupplierProfile;
}

export type QuoteType = 'design' | 'contracting' | 'materials';
export type QuoteStatus = 'invited' | 'accepted_invite' | 'submitted' | 'withdrawn' | 'won' | 'lost';

export interface Quote {
  id: string;
  project_id: string;
  supplier_id: string;
  quote_type: QuoteType;
  status: QuoteStatus;
  total_price?: number;
  currency: string;
  valid_until?: string;
  fit_score?: number;
  created_at: string;
  submitted_at?: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  line_item_id: string;
  catalog_item_id?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  is_sample_eligible: boolean;
  notes?: string;
}

export type CoverageType = 'full_project' | 'selected_rooms' | 'work_package';

export interface SupplierScope {
  id: string;
  supplier_id: string;
  project_id: string;
  room_id?: string;
  trade_category?: string;
  coverage_type?: CoverageType;
}

// ============================================================================
// 5. SAMPLING & SHOWROOM VISITS
// ============================================================================

export type SampleStatus = 'requested' | 'preparing' | 'in_transit' | 'delivered' | 'viewed' | 'completed' | 'canceled';
export type DeliveryMode = 'delivery' | 'showroom';

export interface Sample {
  id: string;
  project_id: string;
  room_id?: string;
  quote_line_item_id?: string;
  supplier_id: string;
  status: SampleStatus;
  delivery_mode?: DeliveryMode;
  delivery_address?: string;
  showroom_visit_id?: string;
  created_at: string;
}

export interface SampleFeedback {
  id: string;
  sample_id: string;
  user_id: string;
  rating?: number; // 1-5
  notes?: string;
  photo_urls: string[];
  created_at: string;
}

export type ShowroomVisitStatus = 'scheduled' | 'completed' | 'canceled' | 'no_show';

export interface ShowroomVisit {
  id: string;
  project_id: string;
  supplier_id: string;
  scheduled_start: string;
  scheduled_end?: string;
  location?: string;
  calendar_event_id?: string;
  status: ShowroomVisitStatus;
  created_at: string;
}

// ============================================================================
// 6. TASKS, CHANGE ORDERS, PAYMENTS
// ============================================================================

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'canceled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskSource = 'manual' | 'blind_spot_engine' | 'pack_generator';

export interface Task {
  id: string;
  project_id: string;
  room_id?: string;
  assigned_to_user_id?: string;
  assigned_to_supplier_id?: string;
  title: string;
  description?: string;
  type?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  completed_at?: string;
  is_blocking: boolean;
  source?: TaskSource;
  created_at: string;
  updated_at: string;
}

export type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish';

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: DependencyType;
  created_at: string;
}

export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ChangeOrder {
  id: string;
  project_id: string;
  requested_by_user_id?: string;
  supplier_id?: string;
  title: string;
  description?: string;
  status: ChangeOrderStatus;
  price_impact?: number;
  timeline_impact_days?: number;
  created_at: string;
  resolved_at?: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'deposit' | 'milestone' | 'final' | 'refund';

export interface Payment {
  id: string;
  project_id: string;
  supplier_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_type?: PaymentType;
  external_reference?: string;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// 7. WHATSAPP MESSAGING
// ============================================================================

export type WhatsAppThreadStatus = 'active' | 'archived' | 'closed';

export interface WhatsAppThread {
  id: string;
  project_id?: string;
  consumer_id?: string;
  supplier_id?: string;
  wa_thread_id?: string;
  status: WhatsAppThreadStatus;
  created_at: string;
  updated_at: string;
}

export type MessageDirection = 'inbound' | 'outbound';
export type SenderType = 'consumer' | 'supplier' | 'platform' | 'bot';
export type MessageType = 'text' | 'image' | 'document' | 'template' | 'interactive';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  thread_id: string;
  wa_message_id?: string;
  direction: MessageDirection;
  sender_type?: SenderType;
  sender_user_id?: string;
  content?: string;
  media_url?: string;
  message_type?: MessageType;
  status: MessageStatus;
  created_at: string;
}

// ============================================================================
// 8. AUDIT & LOGGING
// ============================================================================

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================================================
// UI HELPER TYPES (for display purposes)
// ============================================================================

/**
 * Blind spot warnings generated by the Blind Spot Engine
 */
export type BlindSpotCategory = 'permit' | 'structural' | 'timeline' | 'budget' | 'material' | 'compliance' | 'utilities' | 'other';
export type BlindSpotSeverity = 'low' | 'medium' | 'high';

export interface BlindSpot {
  id: string;
  category: BlindSpotCategory;
  title: string;
  description: string;
  severity: BlindSpotSeverity;
}

/**
 * Extended project pack with computed/joined data for UI display
 */
export interface ProjectPackWithDetails extends ProjectPack {
  project?: Project;
  rooms_count?: number;
  line_items_count?: number;
  blind_spots?: BlindSpot[];
  budget_summary?: {
    total: number;
    breakdown?: Record<string, number>;
  };
  timeline_summary?: {
    start_date?: string;
    target_end_date?: string;
    estimated_duration_weeks?: number;
  };
}

/**
 * Fit score display helper
 */
export type FitScoreLevel = 'low' | 'medium' | 'high';

export function getFitScoreLevel(score?: number): FitScoreLevel {
  if (!score || score < 50) return 'low';
  if (score < 75) return 'medium';
  return 'high';
}

/**
 * Extended supplier invite with joined project data for leads list
 */
export interface SupplierLead extends ProjectSupplierInvite {
  project: Project;
  fit_score_level: FitScoreLevel;
}

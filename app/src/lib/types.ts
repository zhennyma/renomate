/**
 * Renomate Type Definitions
 * 
 * These types align with the expected Supabase ERD structure.
 * TODO: These will be auto-generated from Supabase schema once connected.
 */

// User & Identity Types
export type UserRole = 'consumer' | 'supplier';
export type SupplierType = 'designer' | 'contractor' | 'material_supplier';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ConsumerProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  preferred_language?: string;
}

export interface SupplierProfile {
  id: string;
  user_id: string;
  company_name: string;
  supplier_type: SupplierType;
  verified: boolean;
  rating?: number;
}

// Project Types
export type ProjectStatus = 'draft' | 'planning' | 'in_progress' | 'completed' | 'on_hold';
export type PropertyType = 'apartment' | 'villa' | 'townhouse' | 'penthouse';
export type BudgetBand = 'economy' | 'standard' | 'premium' | 'luxury';
export type RenovationDepth = 'cosmetic' | 'partial' | 'full' | 'structural';

export interface Project {
  id: string;
  consumer_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  property_type: PropertyType;
  location: string;
  budget_band: BudgetBand;
  estimated_budget?: number;
  start_date?: string;
  target_end_date?: string;
  created_at: string;
  updated_at: string;
}

// Room Types
export type RoomType = 'kitchen' | 'bathroom' | 'bedroom' | 'living_room' | 'dining_room' | 'office' | 'balcony' | 'other';

export interface Room {
  id: string;
  project_id: string;
  name: string;
  room_type: RoomType;
  renovation_depth: RenovationDepth;
  area_sqm?: number;
  notes?: string;
}

// Task Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskOwner = 'consumer' | 'designer' | 'contractor' | 'supplier' | 'building';

export interface Task {
  id: string;
  project_id: string;
  room_id?: string;
  name: string;
  description?: string;
  owner: TaskOwner;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  order: number;
}

// Project Pack Types
export interface ProjectPack {
  id: string;
  project_id: string;
  budget_summary: {
    total: number;
    band: BudgetBand;
    breakdown?: Record<string, number>;
  };
  timeline_summary: {
    start_date: string;
    target_end_date: string;
    estimated_duration_weeks: number;
  };
  rooms_count: number;
  blind_spots: BlindSpot[];
  generated_at: string;
}

export interface BlindSpot {
  id: string;
  category: 'permit' | 'structural' | 'timeline' | 'budget' | 'material' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Supplier Lead Types
export type LeadStatus = 'new' | 'viewed' | 'responded' | 'accepted' | 'declined';
export type FitScore = 'low' | 'medium' | 'high';

export interface ProjectSupplierInvite {
  id: string;
  project_id: string;
  supplier_id: string;
  status: LeadStatus;
  fit_score: FitScore;
  fit_score_value?: number;
  invited_at: string;
  responded_at?: string;
  project?: Project;
}

// Quote Types (Future)
export interface Quote {
  id: string;
  project_id: string;
  supplier_id: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  total_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

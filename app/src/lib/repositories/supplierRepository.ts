/**
 * Supplier Repository
 * 
 * Data access layer for supplier leads, invites, quotes, and related data.
 * Uses Supabase for data persistence with RLS for security.
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  ProjectSupplierInvite, 
  Project, 
  ProjectPack, 
  Room, 
  LineItem,
  Quote,
  QuoteLineItem,
  SupplierProfile
} from '../types';

/**
 * Get the current user's supplier profile
 */
export async function getSupplierProfile(userId: string): Promise<SupplierProfile | null> {
  const { data, error } = await supabase
    .from('supplier_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching supplier profile:', error);
    throw error;
  }
  
  return data as SupplierProfile;
}

/**
 * Get all leads/invites for a supplier
 * RLS ensures suppliers can only see their own invites
 */
export async function getSupplierLeads(supplierId: string): Promise<(ProjectSupplierInvite & { project: Project })[]> {
  const { data, error } = await supabase
    .from('project_supplier_invites')
    .select(`
      *,
      projects (*)
    `)
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching supplier leads:', error);
    throw error;
  }
  
  // Transform the data to match expected type
  return (data || []).map(invite => ({
    ...invite,
    project: invite.projects as Project,
  })) as (ProjectSupplierInvite & { project: Project })[];
}

/**
 * Get a single lead/invite by ID
 */
export async function getLeadById(leadId: string): Promise<(ProjectSupplierInvite & { project: Project }) | null> {
  const { data, error } = await supabase
    .from('project_supplier_invites')
    .select(`
      *,
      projects (*)
    `)
    .eq('id', leadId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching lead:', error);
    throw error;
  }
  
  return {
    ...data,
    project: data.projects as Project,
  } as (ProjectSupplierInvite & { project: Project });
}

/**
 * Get full lead details including project, rooms, line items, and pack
 */
export async function getLeadWithDetails(leadId: string): Promise<{
  invite: ProjectSupplierInvite;
  project: Project;
  rooms: Room[];
  lineItems: LineItem[];
  pack: ProjectPack | null;
} | null> {
  // First get the invite with project
  const { data: inviteData, error: inviteError } = await supabase
    .from('project_supplier_invites')
    .select(`
      *,
      projects (*)
    `)
    .eq('id', leadId)
    .single();
  
  if (inviteError) {
    if (inviteError.code === 'PGRST116') {
      return null;
    }
    throw inviteError;
  }

  const projectId = inviteData.project_id;

  // Fetch related project data
  const [roomsResult, lineItemsResult, packResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .eq('project_id', projectId)
      .order('name'),
    supabase
      .from('line_items')
      .select('*')
      .eq('project_id', projectId)
      .order('category'),
    supabase
      .from('project_packs')
      .select('*')
      .eq('project_id', projectId)
      .single(),
  ]);

  return {
    invite: inviteData as ProjectSupplierInvite,
    project: inviteData.projects as Project,
    rooms: (roomsResult.data || []) as Room[],
    lineItems: (lineItemsResult.data || []) as LineItem[],
    pack: packResult.data as ProjectPack | null,
  };
}

/**
 * Update invite decision status (accept/decline)
 */
export async function updateInviteDecision(
  inviteId: string, 
  decision: 'accepted' | 'declined',
  declineReason?: string
): Promise<ProjectSupplierInvite> {
  const updates: Partial<ProjectSupplierInvite> = {
    decision_status: decision,
  };
  
  if (decision === 'declined' && declineReason) {
    updates.decline_reason = declineReason;
  }

  const { data, error } = await supabase
    .from('project_supplier_invites')
    .update(updates)
    .eq('id', inviteId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating invite decision:', error);
    throw error;
  }
  
  return data as ProjectSupplierInvite;
}

/**
 * Get quotes for a supplier
 */
export async function getSupplierQuotes(supplierId: string): Promise<(Quote & { project: Project })[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      projects (*)
    `)
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching supplier quotes:', error);
    throw error;
  }
  
  return (data || []).map(quote => ({
    ...quote,
    project: quote.projects as Project,
  })) as (Quote & { project: Project })[];
}

/**
 * Get a single quote with line items
 */
export async function getQuoteById(quoteId: string): Promise<{
  quote: Quote;
  lineItems: QuoteLineItem[];
} | null> {
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();
  
  if (quoteError) {
    if (quoteError.code === 'PGRST116') {
      return null;
    }
    throw quoteError;
  }

  const { data: lineItems, error: lineItemsError } = await supabase
    .from('quote_line_items')
    .select('*')
    .eq('quote_id', quoteId);
  
  if (lineItemsError) {
    throw lineItemsError;
  }

  return {
    quote: quote as Quote,
    lineItems: (lineItems || []) as QuoteLineItem[],
  };
}

/**
 * Create a new quote
 */
export async function createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'submitted_at'>): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
  
  return data as Quote;
}

/**
 * Update a quote
 */
export async function updateQuote(quoteId: string, updates: Partial<Quote>): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', quoteId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
  
  return data as Quote;
}

/**
 * Submit a quote (change status and set submitted_at)
 */
export async function submitQuote(quoteId: string): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select()
    .single();
  
  if (error) {
    console.error('Error submitting quote:', error);
    throw error;
  }
  
  return data as Quote;
}

/**
 * Add line items to a quote
 */
export async function addQuoteLineItems(lineItems: Omit<QuoteLineItem, 'id'>[]): Promise<QuoteLineItem[]> {
  const { data, error } = await supabase
    .from('quote_line_items')
    .insert(lineItems)
    .select();
  
  if (error) {
    console.error('Error adding quote line items:', error);
    throw error;
  }
  
  return (data || []) as QuoteLineItem[];
}

/**
 * Update supplier profile
 */
export async function updateSupplierProfile(
  profileId: string, 
  updates: Partial<SupplierProfile>
): Promise<SupplierProfile> {
  const { data, error } = await supabase
    .from('supplier_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating supplier profile:', error);
    throw error;
  }
  
  return data as SupplierProfile;
}

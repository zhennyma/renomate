/**
 * Supplier Repository
 * 
 * Data access layer for supplier leads, invites, and quotes.
 * TODO: Replace mock implementations with Supabase queries once connected.
 */

import { logRenomate } from '../supabaseClient';
import { mockSupplierInvites, mockProjectPacks, mockRooms, MOCK_SUPPLIER_ID } from './mockData';
import type { ProjectSupplierInvite, ProjectPack, Room } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all leads/invites for a supplier
 * TODO: Add RLS policy - suppliers can only see their own invites
 */
export async function getSupplierLeads(supplierId: string = MOCK_SUPPLIER_ID): Promise<ProjectSupplierInvite[]> {
  logRenomate('Fetching leads for supplier', { supplierId });
  await delay(500);
  
  return mockSupplierInvites.filter(i => i.supplier_id === supplierId);
}

/**
 * Get a single lead by ID
 * TODO: Add RLS policy - verify supplier owns this invite
 */
export async function getLeadById(leadId: string): Promise<ProjectSupplierInvite | null> {
  logRenomate('Fetching lead', { leadId });
  await delay(300);
  
  return mockSupplierInvites.find(i => i.id === leadId) || null;
}

/**
 * Get project pack for a lead's project
 * Used by suppliers to review project scope
 */
export async function getLeadProjectPack(projectId: string): Promise<ProjectPack | null> {
  logRenomate('Fetching project pack for lead', { projectId });
  await delay(300);
  
  return mockProjectPacks.find(p => p.project_id === projectId) || null;
}

/**
 * Get rooms for a lead's project
 * Suppliers need to see room breakdown for quoting
 */
export async function getLeadProjectRooms(projectId: string): Promise<Room[]> {
  logRenomate('Fetching rooms for lead project', { projectId });
  await delay(300);
  
  return mockRooms.filter(r => r.project_id === projectId);
}

/**
 * Update lead status (e.g., mark as viewed)
 * TODO: Implement actual Supabase update
 */
export async function updateLeadStatus(leadId: string, status: ProjectSupplierInvite['status']): Promise<void> {
  logRenomate('Updating lead status', { leadId, status });
  await delay(200);
  
  // TODO: Implement Supabase update
  // For now, this is a no-op in the mock
}

/**
 * Save draft quote notes
 * TODO: Implement with quotes table once available
 */
export async function saveDraftQuoteNotes(leadId: string, notes: string): Promise<void> {
  logRenomate('Saving draft quote notes', { leadId, notesLength: notes.length });
  await delay(300);
  
  // TODO: Implement with quotes/quote_line_items tables
  // For now, just log the action
}

/**
 * Mock Data for Development
 * 
 * TODO: Replace with real Supabase queries once connected.
 * This data structure aligns with the expected ERD.
 */

import type {
  Project,
  Room,
  Task,
  ProjectPack,
  ProjectSupplierInvite,
  BlindSpot,
} from '../types';

// Mock Consumer ID (simulating logged-in consumer)
export const MOCK_CONSUMER_ID = 'consumer-001';

// Mock Supplier ID (simulating logged-in supplier)
export const MOCK_SUPPLIER_ID = 'supplier-001';

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    consumer_id: MOCK_CONSUMER_ID,
    name: 'Marina Apartment Renovation',
    description: 'Complete renovation of a 2-bedroom apartment in Dubai Marina with modern finishes',
    status: 'in_progress',
    property_type: 'apartment',
    location: 'Dubai Marina',
    budget_band: 'premium',
    estimated_budget: 280000,
    start_date: '2024-02-01',
    target_end_date: '2024-05-15',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 'proj-002',
    consumer_id: MOCK_CONSUMER_ID,
    name: 'Palm Villa Kitchen Upgrade',
    description: 'Kitchen modernization with new appliances and custom cabinetry',
    status: 'planning',
    property_type: 'villa',
    location: 'Palm Jumeirah',
    budget_band: 'luxury',
    estimated_budget: 450000,
    start_date: '2024-04-01',
    target_end_date: '2024-07-30',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-18T11:00:00Z',
  },
  {
    id: 'proj-003',
    consumer_id: MOCK_CONSUMER_ID,
    name: 'JBR Studio Refresh',
    description: 'Quick cosmetic refresh for rental property',
    status: 'completed',
    property_type: 'apartment',
    location: 'JBR',
    budget_band: 'economy',
    estimated_budget: 45000,
    start_date: '2024-01-10',
    target_end_date: '2024-01-25',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-26T16:00:00Z',
  },
];

// Mock Rooms
export const mockRooms: Room[] = [
  // Project 1 rooms
  { id: 'room-001', project_id: 'proj-001', name: 'Master Bathroom', room_type: 'bathroom', renovation_depth: 'full', area_sqm: 12 },
  { id: 'room-002', project_id: 'proj-001', name: 'Guest Bathroom', room_type: 'bathroom', renovation_depth: 'partial', area_sqm: 8 },
  { id: 'room-003', project_id: 'proj-001', name: 'Open Kitchen', room_type: 'kitchen', renovation_depth: 'full', area_sqm: 18 },
  { id: 'room-004', project_id: 'proj-001', name: 'Living Area', room_type: 'living_room', renovation_depth: 'cosmetic', area_sqm: 35 },
  { id: 'room-005', project_id: 'proj-001', name: 'Master Bedroom', room_type: 'bedroom', renovation_depth: 'cosmetic', area_sqm: 22 },
  // Project 2 rooms
  { id: 'room-006', project_id: 'proj-002', name: 'Main Kitchen', room_type: 'kitchen', renovation_depth: 'full', area_sqm: 45 },
  { id: 'room-007', project_id: 'proj-002', name: 'Pantry', room_type: 'other', renovation_depth: 'full', area_sqm: 8 },
  // Project 3 rooms
  { id: 'room-008', project_id: 'proj-003', name: 'Studio Space', room_type: 'living_room', renovation_depth: 'cosmetic', area_sqm: 40 },
  { id: 'room-009', project_id: 'proj-003', name: 'Bathroom', room_type: 'bathroom', renovation_depth: 'cosmetic', area_sqm: 6 },
];

// Mock Tasks
export const mockTasks: Task[] = [
  // Project 1 tasks
  { id: 'task-001', project_id: 'proj-001', name: 'Initial design consultation', owner: 'designer', status: 'completed', due_date: '2024-02-05', order: 1 },
  { id: 'task-002', project_id: 'proj-001', name: 'NOC application submission', owner: 'building', status: 'completed', due_date: '2024-02-10', order: 2 },
  { id: 'task-003', project_id: 'proj-001', name: 'Demolition work', owner: 'contractor', status: 'completed', due_date: '2024-02-20', order: 3 },
  { id: 'task-004', project_id: 'proj-001', name: 'Plumbing rough-in', owner: 'contractor', status: 'in_progress', due_date: '2024-03-01', order: 4 },
  { id: 'task-005', project_id: 'proj-001', name: 'Electrical rewiring', owner: 'contractor', status: 'in_progress', due_date: '2024-03-05', order: 5 },
  { id: 'task-006', project_id: 'proj-001', name: 'Tile selection approval', owner: 'consumer', status: 'pending', due_date: '2024-03-08', order: 6 },
  { id: 'task-007', project_id: 'proj-001', name: 'Kitchen cabinet delivery', owner: 'supplier', status: 'pending', due_date: '2024-03-15', order: 7 },
  { id: 'task-008', project_id: 'proj-001', name: 'Tiling installation', owner: 'contractor', status: 'pending', due_date: '2024-03-25', order: 8 },
  // Project 2 tasks
  { id: 'task-009', project_id: 'proj-002', name: 'Kitchen design finalization', owner: 'designer', status: 'in_progress', due_date: '2024-03-15', order: 1 },
  { id: 'task-010', project_id: 'proj-002', name: 'Appliance selection', owner: 'consumer', status: 'pending', due_date: '2024-03-20', order: 2 },
];

// Mock Project Packs
export const mockProjectPacks: ProjectPack[] = [
  {
    id: 'pack-001',
    project_id: 'proj-001',
    budget_summary: {
      total: 280000,
      band: 'premium',
      breakdown: {
        design: 25000,
        materials: 120000,
        labor: 95000,
        permits: 15000,
        contingency: 25000,
      },
    },
    timeline_summary: {
      start_date: '2024-02-01',
      target_end_date: '2024-05-15',
      estimated_duration_weeks: 15,
    },
    rooms_count: 5,
    blind_spots: [
      {
        id: 'bs-001',
        category: 'permit',
        title: 'NOC Required',
        description: 'Building requires NOC approval before any structural work can begin',
        severity: 'high',
      },
      {
        id: 'bs-002',
        category: 'material',
        title: 'Long-Lead Items',
        description: 'Custom kitchen cabinets have 6-8 week lead time',
        severity: 'medium',
      },
      {
        id: 'bs-003',
        category: 'structural',
        title: 'AC Duct Relocation',
        description: 'Kitchen extension may require AC duct modifications',
        severity: 'medium',
      },
    ],
    generated_at: '2024-01-20T12:00:00Z',
  },
  {
    id: 'pack-002',
    project_id: 'proj-002',
    budget_summary: {
      total: 450000,
      band: 'luxury',
      breakdown: {
        design: 45000,
        materials: 220000,
        labor: 130000,
        permits: 20000,
        contingency: 35000,
      },
    },
    timeline_summary: {
      start_date: '2024-04-01',
      target_end_date: '2024-07-30',
      estimated_duration_weeks: 17,
    },
    rooms_count: 2,
    blind_spots: [
      {
        id: 'bs-004',
        category: 'structural',
        title: 'Load-Bearing Wall',
        description: 'Proposed island location may conflict with load-bearing structure',
        severity: 'high',
      },
      {
        id: 'bs-005',
        category: 'timeline',
        title: 'Summer Scheduling',
        description: 'Contractor availability may be limited during Ramadan period',
        severity: 'low',
      },
    ],
    generated_at: '2024-02-15T10:00:00Z',
  },
];

// Mock Supplier Invites (Leads)
export const mockSupplierInvites: ProjectSupplierInvite[] = [
  {
    id: 'invite-001',
    project_id: 'proj-001',
    supplier_id: MOCK_SUPPLIER_ID,
    status: 'new',
    fit_score: 'high',
    fit_score_value: 92,
    invited_at: '2024-02-18T09:00:00Z',
    project: mockProjects[0],
  },
  {
    id: 'invite-002',
    project_id: 'proj-002',
    supplier_id: MOCK_SUPPLIER_ID,
    status: 'viewed',
    fit_score: 'medium',
    fit_score_value: 74,
    invited_at: '2024-02-20T11:00:00Z',
    project: mockProjects[1],
  },
  {
    id: 'invite-003',
    project_id: 'proj-003',
    supplier_id: MOCK_SUPPLIER_ID,
    status: 'responded',
    fit_score: 'high',
    fit_score_value: 88,
    invited_at: '2024-01-08T14:00:00Z',
    responded_at: '2024-01-09T10:00:00Z',
    project: mockProjects[2],
  },
];

// Helper to get blind spots for display
export const getBlindSpotIcon = (category: BlindSpot['category']): string => {
  const icons: Record<BlindSpot['category'], string> = {
    permit: '📋',
    structural: '🏗️',
    timeline: '⏰',
    budget: '💰',
    material: '📦',
    other: '⚠️',
  };
  return icons[category];
};

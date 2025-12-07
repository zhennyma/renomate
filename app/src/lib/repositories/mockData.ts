/**
 * Mock Data for Development
 * 
 * TODO: Replace with real Supabase queries once connected.
 * This data structure aligns with the ERD (track-b-erd.md).
 * Last synced: 2025-12-07
 */

import type {
  Project,
  Room,
  Task,
  ProjectPack,
  ProjectSupplierInvite,
  BlindSpot,
  getFitScoreLevel,
} from '../types';

// Mock Consumer ID (simulating logged-in consumer)
export const MOCK_CONSUMER_ID = 'consumer-001';

// Mock Supplier ID (simulating logged-in supplier)
export const MOCK_SUPPLIER_ID = 'supplier-001';

// Mock Projects (aligned with DB schema)
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    consumer_id: MOCK_CONSUMER_ID,
    title: 'Marina Apartment Renovation',
    status: 'execution',
    property_type: 'apartment',
    location_city: 'Dubai',
    location_area: 'Dubai Marina',
    estimated_budget_min: 250000,
    estimated_budget_max: 300000,
    start_date_desired: '2024-02-01',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 'proj-002',
    consumer_id: MOCK_CONSUMER_ID,
    title: 'Palm Villa Kitchen Upgrade',
    status: 'ready_for_review',
    property_type: 'villa',
    location_city: 'Dubai',
    location_area: 'Palm Jumeirah',
    estimated_budget_min: 400000,
    estimated_budget_max: 500000,
    start_date_desired: '2024-04-01',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-18T11:00:00Z',
  },
  {
    id: 'proj-003',
    consumer_id: MOCK_CONSUMER_ID,
    title: 'JBR Studio Refresh',
    status: 'completed',
    property_type: 'apartment',
    location_city: 'Dubai',
    location_area: 'JBR',
    estimated_budget_min: 40000,
    estimated_budget_max: 50000,
    start_date_desired: '2024-01-10',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-26T16:00:00Z',
  },
];

// Mock Rooms (aligned with DB schema including state machine columns)
export const mockRooms: Room[] = [
  // Project 1 rooms
  { 
    id: 'room-001', 
    project_id: 'proj-001', 
    name: 'Master Bathroom', 
    room_type: 'bathroom', 
    renovation_depth: 'full', 
    area_sqm: 12,
    lifecycle_state: 'execution',
    execution_state: 'in_progress',
  },
  { 
    id: 'room-002', 
    project_id: 'proj-001', 
    name: 'Guest Bathroom', 
    room_type: 'bathroom', 
    renovation_depth: 'medium', 
    area_sqm: 8,
    lifecycle_state: 'execution',
    execution_state: 'not_started',
  },
  { 
    id: 'room-003', 
    project_id: 'proj-001', 
    name: 'Open Kitchen', 
    room_type: 'kitchen', 
    renovation_depth: 'full', 
    area_sqm: 18,
    lifecycle_state: 'execution',
    execution_state: 'in_progress',
  },
  { 
    id: 'room-004', 
    project_id: 'proj-001', 
    name: 'Living Area', 
    room_type: 'living_room', 
    renovation_depth: 'light', 
    area_sqm: 35,
    lifecycle_state: 'sourcing',
    execution_state: 'not_started',
  },
  { 
    id: 'room-005', 
    project_id: 'proj-001', 
    name: 'Master Bedroom', 
    room_type: 'bedroom', 
    renovation_depth: 'light', 
    area_sqm: 22,
    lifecycle_state: 'sourcing',
    execution_state: 'not_started',
  },
  // Project 2 rooms
  { 
    id: 'room-006', 
    project_id: 'proj-002', 
    name: 'Main Kitchen', 
    room_type: 'kitchen', 
    renovation_depth: 'full', 
    area_sqm: 45,
    lifecycle_state: 'draft',
    execution_state: 'not_started',
  },
  { 
    id: 'room-007', 
    project_id: 'proj-002', 
    name: 'Pantry', 
    room_type: 'pantry', 
    renovation_depth: 'full', 
    area_sqm: 8,
    lifecycle_state: 'draft',
    execution_state: 'not_started',
  },
  // Project 3 rooms
  { 
    id: 'room-008', 
    project_id: 'proj-003', 
    name: 'Studio Space', 
    room_type: 'living_room', 
    renovation_depth: 'light', 
    area_sqm: 40,
    lifecycle_state: 'completed',
    execution_state: 'complete',
  },
  { 
    id: 'room-009', 
    project_id: 'proj-003', 
    name: 'Bathroom', 
    room_type: 'bathroom', 
    renovation_depth: 'light', 
    area_sqm: 6,
    lifecycle_state: 'completed',
    execution_state: 'complete',
  },
];

// Mock Tasks (aligned with DB schema)
export const mockTasks: Task[] = [
  // Project 1 tasks
  { 
    id: 'task-001', 
    project_id: 'proj-001', 
    title: 'Initial design consultation', 
    status: 'done', 
    priority: 'high',
    due_date: '2024-02-05',
    completed_at: '2024-02-04T15:00:00Z',
    is_blocking: false,
    source: 'manual',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-04T15:00:00Z',
  },
  { 
    id: 'task-002', 
    project_id: 'proj-001', 
    title: 'NOC application submission', 
    status: 'done', 
    priority: 'critical',
    due_date: '2024-02-10',
    completed_at: '2024-02-09T12:00:00Z',
    is_blocking: true,
    source: 'blind_spot_engine',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-09T12:00:00Z',
  },
  { 
    id: 'task-003', 
    project_id: 'proj-001', 
    title: 'Demolition work', 
    status: 'done', 
    priority: 'high',
    due_date: '2024-02-20',
    completed_at: '2024-02-19T18:00:00Z',
    is_blocking: true,
    source: 'pack_generator',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-19T18:00:00Z',
  },
  { 
    id: 'task-004', 
    project_id: 'proj-001', 
    room_id: 'room-001',
    title: 'Plumbing rough-in', 
    status: 'in_progress', 
    priority: 'high',
    due_date: '2024-03-01',
    is_blocking: true,
    source: 'pack_generator',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-25T10:00:00Z',
  },
  { 
    id: 'task-005', 
    project_id: 'proj-001', 
    title: 'Electrical rewiring', 
    status: 'in_progress', 
    priority: 'high',
    due_date: '2024-03-05',
    is_blocking: true,
    source: 'pack_generator',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-02-25T10:00:00Z',
  },
  { 
    id: 'task-006', 
    project_id: 'proj-001', 
    title: 'Tile selection approval', 
    status: 'todo', 
    priority: 'medium',
    due_date: '2024-03-08',
    is_blocking: false,
    source: 'manual',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  { 
    id: 'task-007', 
    project_id: 'proj-001', 
    room_id: 'room-003',
    title: 'Kitchen cabinet delivery', 
    status: 'todo', 
    priority: 'high',
    due_date: '2024-03-15',
    is_blocking: true,
    source: 'blind_spot_engine',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  { 
    id: 'task-008', 
    project_id: 'proj-001', 
    room_id: 'room-001',
    title: 'Tiling installation', 
    status: 'todo', 
    priority: 'medium',
    due_date: '2024-03-25',
    is_blocking: false,
    source: 'pack_generator',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  // Project 2 tasks
  { 
    id: 'task-009', 
    project_id: 'proj-002', 
    room_id: 'room-006',
    title: 'Kitchen design finalization', 
    status: 'in_progress', 
    priority: 'high',
    due_date: '2024-03-15',
    is_blocking: true,
    source: 'manual',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-20T10:00:00Z',
  },
  { 
    id: 'task-010', 
    project_id: 'proj-002', 
    title: 'Appliance selection', 
    status: 'todo', 
    priority: 'medium',
    due_date: '2024-03-20',
    is_blocking: false,
    source: 'manual',
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
  },
];

// Mock Project Packs (aligned with DB schema - flat structure)
export const mockProjectPacks: ProjectPack[] = [
  {
    id: 'pack-001',
    project_id: 'proj-001',
    version: 1,
    status: 'published',
    generated_at: '2024-01-20T12:00:00Z',
    generated_by: 'system',
  },
  {
    id: 'pack-002',
    project_id: 'proj-002',
    version: 1,
    status: 'draft',
    generated_at: '2024-02-15T10:00:00Z',
    generated_by: 'system',
  },
];

// Mock Blind Spots (UI helper data - not stored in DB directly)
export const mockBlindSpots: Record<string, BlindSpot[]> = {
  'proj-001': [
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
  'proj-002': [
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
};

// Mock Supplier Invites (Leads) - aligned with DB schema
export const mockSupplierInvites: ProjectSupplierInvite[] = [
  {
    id: 'invite-001',
    project_id: 'proj-001',
    supplier_id: MOCK_SUPPLIER_ID,
    invite_channel: 'dashboard',
    decision_status: 'pending',
    fit_score: 92,
    created_at: '2024-02-18T09:00:00Z',
    updated_at: '2024-02-18T09:00:00Z',
    project: mockProjects[0],
  },
  {
    id: 'invite-002',
    project_id: 'proj-002',
    supplier_id: MOCK_SUPPLIER_ID,
    invite_channel: 'whatsapp',
    decision_status: 'pending',
    fit_score: 74,
    created_at: '2024-02-20T11:00:00Z',
    updated_at: '2024-02-20T11:00:00Z',
    project: mockProjects[1],
  },
  {
    id: 'invite-003',
    project_id: 'proj-003',
    supplier_id: MOCK_SUPPLIER_ID,
    invite_channel: 'email',
    decision_status: 'accepted',
    fit_score: 88,
    created_at: '2024-01-08T14:00:00Z',
    updated_at: '2024-01-09T10:00:00Z',
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
    compliance: '✅',
    utilities: '🔌',
    other: '⚠️',
  };
  return icons[category];
};

// Helper to get project blind spots
export const getProjectBlindSpots = (projectId: string): BlindSpot[] => {
  return mockBlindSpots[projectId] || [];
};

// Helper to get rooms for a project
export const getProjectRooms = (projectId: string): Room[] => {
  return mockRooms.filter(room => room.project_id === projectId);
};

// Helper to get tasks for a project
export const getProjectTasks = (projectId: string): Task[] => {
  return mockTasks.filter(task => task.project_id === projectId);
};

// Helper to calculate budget display
export const formatBudgetRange = (project: Project): string => {
  if (project.estimated_budget_min && project.estimated_budget_max) {
    return `AED ${(project.estimated_budget_min / 1000).toFixed(0)}k - ${(project.estimated_budget_max / 1000).toFixed(0)}k`;
  }
  if (project.estimated_budget_min) {
    return `From AED ${(project.estimated_budget_min / 1000).toFixed(0)}k`;
  }
  if (project.estimated_budget_max) {
    return `Up to AED ${(project.estimated_budget_max / 1000).toFixed(0)}k`;
  }
  return 'Budget TBD';
};

// Helper to get location display
export const formatLocation = (project: Project): string => {
  if (project.location_area && project.location_city) {
    return `${project.location_area}, ${project.location_city}`;
  }
  return project.location_area || project.location_city || 'Location TBD';
};

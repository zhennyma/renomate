/**
 * Project Repository
 * 
 * Data access layer for projects, rooms, tasks, and project packs.
 * Uses Supabase for data persistence with RLS for security.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Project, Room, Task, ProjectPack, LineItem } from '../types';

/**
 * Get all projects for a consumer
 * RLS ensures consumers can only see their own projects
 */
export async function getConsumerProjects(consumerId: string): Promise<Project[]> {
  console.log('[projectRepository] getConsumerProjects called for:', consumerId);
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('consumer_id', consumerId)
    .order('created_at', { ascending: false });
  
  console.log('[projectRepository] getConsumerProjects result:', { data, error });
  
  if (error) {
    console.error('[projectRepository] Error fetching projects:', error);
    throw error;
  }
  
  return (data || []) as Project[];
}

/**
 * Get a single project by ID
 * RLS verifies consumer owns this project
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching project:', error);
    throw error;
  }
  
  return data as Project;
}

/**
 * Get project with all related data (rooms, tasks, line items, pack)
 */
export async function getProjectWithDetails(projectId: string): Promise<{
  project: Project;
  rooms: Room[];
  tasks: Task[];
  lineItems: LineItem[];
  pack: ProjectPack | null;
} | null> {
  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (projectError) {
    if (projectError.code === 'PGRST116') {
      return null;
    }
    throw projectError;
  }

  // Fetch related data in parallel
  const [roomsResult, tasksResult, lineItemsResult, packResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('*')
      .eq('project_id', projectId)
      .order('name'),
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
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
    project: project as Project,
    rooms: (roomsResult.data || []) as Room[],
    tasks: (tasksResult.data || []) as Task[],
    lineItems: (lineItemsResult.data || []) as LineItem[],
    pack: packResult.data as ProjectPack | null,
  };
}

/**
 * Get rooms for a project
 * RLS verifies access through project ownership
 */
export async function getProjectRooms(projectId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('project_id', projectId)
    .order('name');
  
  if (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
  
  return (data || []) as Room[];
}

/**
 * Get tasks for a project
 * RLS verifies access through project ownership
 */
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  return (data || []) as Task[];
}

/**
 * Get line items for a project
 */
export async function getProjectLineItems(projectId: string): Promise<LineItem[]> {
  const { data, error } = await supabase
    .from('line_items')
    .select('*')
    .eq('project_id', projectId)
    .order('category');
  
  if (error) {
    console.error('Error fetching line items:', error);
    throw error;
  }
  
  return (data || []) as LineItem[];
}

/**
 * Get project pack for a project
 */
export async function getProjectPack(projectId: string): Promise<ProjectPack | null> {
  const { data, error } = await supabase
    .from('project_packs')
    .select('*')
    .eq('project_id', projectId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching project pack:', error);
    throw error;
  }
  
  return data as ProjectPack;
}

/**
 * Create a new project
 */
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }
  
  return data as Project;
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
  
  return data as Project;
}

/**
 * Create a new room
 */
export async function createRoom(room: Omit<Room, 'id'>): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert(room)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating room:', error);
    throw error;
  }
  
  return data as Room;
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }
  
  return data as Task;
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }
  
  return data as Task;
}

/**
 * Calculate project progress based on completed tasks
 */
export function calculateProjectProgress(tasks: Task[]): { completed: number; total: number; percentage: number } {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

/**
 * Get quote count for a project
 */
export async function getProjectQuoteCount(projectId: string): Promise<number> {
  const { count, error } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  
  if (error) {
    console.error('Error fetching quote count:', error);
    return 0;
  }
  
  return count || 0;
}

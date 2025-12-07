/**
 * Project Repository
 * 
 * Data access layer for projects, rooms, tasks, and project packs.
 * TODO: Replace mock implementations with Supabase queries once connected.
 */

import { logRenomate } from '../supabaseClient';
import { mockProjects, mockRooms, mockTasks, mockProjectPacks, MOCK_CONSUMER_ID } from './mockData';
import type { Project, Room, Task, ProjectPack } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all projects for a consumer
 * TODO: Add RLS policy - consumers can only see their own projects
 */
export async function getConsumerProjects(consumerId: string = MOCK_CONSUMER_ID): Promise<Project[]> {
  logRenomate('Fetching projects for consumer', { consumerId });
  await delay(500); // Simulate network latency
  
  return mockProjects.filter(p => p.consumer_id === consumerId);
}

/**
 * Get a single project by ID
 * TODO: Add RLS policy - verify consumer owns this project
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  logRenomate('Fetching project', { projectId });
  await delay(300);
  
  return mockProjects.find(p => p.id === projectId) || null;
}

/**
 * Get rooms for a project
 * TODO: Add RLS policy - verify access through project ownership
 */
export async function getProjectRooms(projectId: string): Promise<Room[]> {
  logRenomate('Fetching rooms for project', { projectId });
  await delay(300);
  
  return mockRooms.filter(r => r.project_id === projectId);
}

/**
 * Get tasks for a project
 * TODO: Add RLS policy - verify access through project ownership
 */
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  logRenomate('Fetching tasks for project', { projectId });
  await delay(300);
  
  return mockTasks.filter(t => t.project_id === projectId).sort((a, b) => a.order - b.order);
}

/**
 * Get project pack for a project
 * TODO: This will be populated by the Project Pack Generator engine
 */
export async function getProjectPack(projectId: string): Promise<ProjectPack | null> {
  logRenomate('Fetching project pack', { projectId });
  await delay(300);
  
  return mockProjectPacks.find(p => p.project_id === projectId) || null;
}

/**
 * Calculate project progress based on completed tasks
 */
export function calculateProjectProgress(tasks: Task[]): { completed: number; total: number; percentage: number } {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

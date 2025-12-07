-- Alignment Migration: Fix schema discrepancies between docs and implementation
-- Reference: track-b-erd.md

-- ============================================================================
-- 1. FIX projects.status TO MATCH ERD DOC
-- Doc specifies: 'draft', 'ready_for_review', 'open_for_bids', 'sourcing', 'execution', 'completed', 'canceled'
-- Current has: 'draft', 'scoping', 'sourcing', 'execution', 'completed', 'canceled'
-- ============================================================================

-- First, update any existing 'scoping' to 'ready_for_review' (closest semantic match)
UPDATE public.projects SET status = 'ready_for_review' WHERE status = 'scoping';

-- Drop the old constraint and add the correct one
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    'draft', 'ready_for_review', 'open_for_bids', 
    'sourcing', 'execution', 'completed', 'canceled'
  ));

-- ============================================================================
-- 2. FIX tasks.priority TO MATCH ERD DOC
-- Doc specifies: 'low', 'medium', 'high', 'critical'
-- Current has: 'low', 'medium', 'high', 'urgent'
-- ============================================================================

-- Update any 'urgent' to 'critical'
UPDATE public.tasks SET priority = 'critical' WHERE priority = 'urgent';

-- Drop the old constraint and add the correct one
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- ============================================================================
-- 3. FIX tasks.source TO MATCH ERD DOC
-- Doc specifies: 'manual', 'blind_spot_engine', 'pack_generator'
-- Current has: 'user', 'blind_spot_engine', 'system'
-- ============================================================================

-- Update existing values
UPDATE public.tasks SET source = 'manual' WHERE source = 'user';
UPDATE public.tasks SET source = 'pack_generator' WHERE source = 'system';

-- Drop the old constraint and add the correct one
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_source_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_source_check
  CHECK (source IN ('manual', 'blind_spot_engine', 'pack_generator'));

-- ============================================================================
-- 4. ADD MISSING completed_at COLUMN TO tasks
-- Doc specifies: completed_at TIMESTAMPTZ
-- ============================================================================

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ============================================================================
-- 5. ADD MISSING INDEX ON tasks.room_id
-- Doc specifies: tasks_room_id_idx
-- ============================================================================

CREATE INDEX IF NOT EXISTS tasks_room_id_idx ON public.tasks (room_id);

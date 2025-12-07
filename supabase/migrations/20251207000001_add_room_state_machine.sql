-- B8: Add State Machine columns to rooms table
-- Per State Machine spec for room-level lifecycle and execution tracking

-- lifecycle_state: tracks the room through the project lifecycle
ALTER TABLE public.rooms
ADD COLUMN lifecycle_state TEXT NOT NULL DEFAULT 'draft'
  CHECK (lifecycle_state IN (
    'draft', 'open_for_bids', 'sourcing', 'execution', 'completed', 'paused'
  ));

-- execution_state: tracks contractor work progress within a room
ALTER TABLE public.rooms
ADD COLUMN execution_state TEXT NOT NULL DEFAULT 'not_started'
  CHECK (execution_state IN (
    'not_started', 'in_progress', 'ready_for_inspection', 'rework_required', 'complete'
  ));

-- previous_lifecycle_state: stores state before pause for resume functionality
ALTER TABLE public.rooms
ADD COLUMN previous_lifecycle_state TEXT
  CHECK (previous_lifecycle_state IN (
    'draft', 'open_for_bids', 'sourcing', 'execution', 'completed'
  ));

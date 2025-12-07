# Track B: Data Model & ERD

> **Notion Source:** Data Model & ERD (Supabase Specs) - `9f5c77073a5f4a6fb8dc60e79b50ea67`  
> **Status:** Not Started

---

## Overview

This track creates all database tables defined in the ERD Notion page. Tables are split into logical migrations for easier review and rollback.

---

## Tasks

| ID | Task | ERD Section | Est. | Status |
|----|------|-------------|------|--------|
| B1 | Migration: users, consumer_profiles, supplier_profiles | Section 1 | 45m | Not Started |
| B2 | Migration: projects, rooms, line_items | Section 2 | 60m | Not Started |
| B3 | Migration: project_packs | Section 2.4 | 30m | Not Started |
| B4 | Migration: inspiration_assets, boards, items, favourites | Section 3 | 45m | Not Started |
| B5 | Migration: project_supplier_invites, quotes, quote_line_items, supplier_scopes | Section 4 | 60m | Not Started |
| B6 | Migration: samples, sample_feedback, showroom_visits | Section 5 | 45m | Not Started |
| B7 | Migration: tasks, task_dependencies | Section 6 | 45m | Not Started |
| B8 | Add State Machine columns to rooms | State Machine Logic | 30m | Not Started |
| B9 | Push migrations and verify schema | - | 30m | Not Started |

---

## B1: Core Identity Tables

**ERD Section 1: Core Identity & Profiles**

```sql
-- users: Single table for all authenticated actors
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'supplier', 'admin', 'ops')),
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_phone_idx ON public.users (phone);

-- consumer_profiles: Extended profile for homeowners
CREATE TABLE public.consumer_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
  location_city TEXT,
  location_area TEXT,
  preferred_style TEXT,
  budget_tier TEXT CHECK (budget_tier IN ('low', 'mid', 'premium'))
);

-- supplier_profiles: Extended profile for designers/contractors/suppliers
CREATE TABLE public.supplier_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  coverage_cities TEXT[] DEFAULT '{}',
  min_project_value NUMERIC,
  max_project_value NUMERIC,
  styles TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX supplier_profiles_trade_type_idx ON public.supplier_profiles (trade_type);
CREATE INDEX supplier_profiles_status_idx ON public.supplier_profiles (status);
```

---

## B2: Projects, Rooms, Line Items

**ERD Section 2: Projects, Rooms, Line Items**

```sql
-- projects: Central unit of work
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'ready_for_review', 'open_for_bids', 
      'sourcing', 'execution', 'completed', 'canceled'
    )),
  location_city TEXT,
  location_area TEXT,
  property_type TEXT,
  estimated_budget_min NUMERIC,
  estimated_budget_max NUMERIC,
  start_date_desired DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_consumer_id_idx ON public.projects (consumer_id);
CREATE INDEX projects_status_idx ON public.projects (status);

-- rooms: Spaces within a project
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT,
  area_sqm NUMERIC,
  floor SMALLINT,
  renovation_depth TEXT CHECK (renovation_depth IN ('light', 'medium', 'full'))
);

CREATE INDEX rooms_project_id_idx ON public.rooms (project_id);

-- line_items: Atomic units of work or materials
CREATE TABLE public.line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  waste_factor_pct NUMERIC,
  calculated_quantity NUMERIC,
  priority TEXT CHECK (priority IN ('must_have', 'nice_to_have')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'ready_for_quote', 'quoted', 'in_execution', 'done', 'dropped'
    ))
);

CREATE INDEX line_items_project_id_idx ON public.line_items (project_id);
CREATE INDEX line_items_room_id_idx ON public.line_items (room_id);
```

---

## B3: Project Packs

**ERD Section 2.4: project_packs**

```sql
CREATE TABLE public.project_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects (id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  generated_at TIMESTAMPTZ,
  generated_by UUID REFERENCES public.users (id) ON DELETE SET NULL
);
```

---

## B4: Inspiration Module

**ERD Section 3: Inspiration Module**

```sql
-- inspiration_assets: Verified UAE renovation library
CREATE TABLE public.inspiration_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('room_photo', 'material_reference', 'moodboard', 'video')),
  media_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  location_city TEXT,
  style_tags TEXT[] DEFAULT '{}',
  finish_tags TEXT[] DEFAULT '{}',
  price_band TEXT CHECK (price_band IN ('low', 'mid', 'high')),
  creator_type TEXT CHECK (creator_type IN ('designer', 'contractor', 'platform')),
  creator_supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- inspiration_boards: User's saved collections
CREATE TABLE public.inspiration_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inspiration_boards_consumer_id_idx ON public.inspiration_boards (consumer_id);

-- inspiration_board_items: Items on a board
CREATE TABLE public.inspiration_board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.inspiration_boards (id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.inspiration_assets (id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inspiration_board_items_board_id_idx ON public.inspiration_board_items (board_id);

-- favourites: Generic hearts/saves
CREATE TABLE public.favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX favourites_user_entity_idx ON public.favourites (user_id, entity_type);
```

---

## B5: Supplier Matching, Invites, Quotes

**ERD Section 4: Supplier Matching, Invites, Quotes**

```sql
-- project_supplier_invites: Qualified lead card
CREATE TABLE public.project_supplier_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
  invite_channel TEXT NOT NULL CHECK (invite_channel IN ('whatsapp', 'email', 'dashboard')),
  decision_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (decision_status IN ('pending', 'accepted', 'declined', 'waitlisted')),
  decline_reason TEXT,
  fit_score NUMERIC,
  magic_link_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_supplier_invites_project_id_idx ON public.project_supplier_invites (project_id);
CREATE INDEX project_supplier_invites_supplier_id_idx ON public.project_supplier_invites (supplier_id);

-- quotes: Supplier proposals
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
  quote_type TEXT NOT NULL CHECK (quote_type IN ('design', 'contracting', 'materials')),
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'accepted_invite', 'submitted', 'withdrawn', 'won', 'lost')),
  total_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'AED',
  valid_until DATE,
  fit_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX quotes_project_id_idx ON public.quotes (project_id);
CREATE INDEX quotes_supplier_id_idx ON public.quotes (supplier_id);

-- quote_line_items: Line-by-line pricing
CREATE TABLE public.quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes (id) ON DELETE CASCADE,
  line_item_id UUID NOT NULL REFERENCES public.line_items (id) ON DELETE CASCADE,
  catalog_item_id UUID,
  unit_price NUMERIC NOT NULL,
  quantity NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  is_sample_eligible BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE INDEX quote_line_items_quote_id_idx ON public.quote_line_items (quote_id);

-- supplier_scopes: What supplier covers
CREATE TABLE public.supplier_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
  trade_category TEXT,
  coverage_type TEXT CHECK (coverage_type IN ('full_project', 'selected_rooms', 'work_package'))
);

CREATE INDEX supplier_scopes_project_supplier_idx ON public.supplier_scopes (project_id, supplier_id);
```

---

## B6: Sampling & Showroom Visits

**ERD Section 5: Sampling & Showroom Visits**

```sql
-- samples: Material samples requested
CREATE TABLE public.samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
  quote_line_item_id UUID REFERENCES public.quote_line_items (id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'preparing', 'in_transit', 'delivered', 'viewed', 'completed', 'canceled')),
  delivery_mode TEXT CHECK (delivery_mode IN ('delivery', 'showroom')),
  delivery_address TEXT,
  showroom_visit_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX samples_project_id_idx ON public.samples (project_id);
CREATE INDEX samples_supplier_id_idx ON public.samples (supplier_id);

-- sample_feedback: Consumer feedback on samples
CREATE TABLE public.sample_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id UUID NOT NULL REFERENCES public.samples (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- showroom_visits: Scheduled visits
CREATE TABLE public.showroom_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  location TEXT,
  calendar_event_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'canceled', 'no_show')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX showroom_visits_project_id_idx ON public.showroom_visits (project_id);
```

---

## B7: Tasks & Dependencies

**ERD Section 6: Tasks, Change Orders, Payments**

```sql
-- tasks: Shared project tracker
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  assigned_to_supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'canceled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  is_blocking BOOLEAN DEFAULT FALSE,
  source TEXT CHECK (source IN ('manual', 'blind_spot_engine', 'pack_generator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tasks_project_id_idx ON public.tasks (project_id);
CREATE INDEX tasks_room_id_idx ON public.tasks (room_id);
CREATE INDEX tasks_status_idx ON public.tasks (status);

-- task_dependencies: Task ordering
CREATE TABLE public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  UNIQUE(task_id, depends_on_task_id)
);
```

---

## B8: State Machine Columns

**Notion Source:** Project State Machine Logic - `12d1addf86a84269b2f3c310cf4917ed`

```sql
-- Add lifecycle and execution states to rooms
ALTER TABLE public.rooms
ADD COLUMN lifecycle_state TEXT NOT NULL DEFAULT 'draft'
  CHECK (lifecycle_state IN (
    'draft', 'open_for_bids', 'sourcing', 'execution', 'completed', 'paused'
  ));

ALTER TABLE public.rooms
ADD COLUMN execution_state TEXT NOT NULL DEFAULT 'not_started'
  CHECK (execution_state IN (
    'not_started', 'in_progress', 'ready_for_inspection', 'rework_required', 'complete'
  ));

ALTER TABLE public.rooms
ADD COLUMN previous_lifecycle_state TEXT
  CHECK (previous_lifecycle_state IN (
    'draft', 'open_for_bids', 'sourcing', 'execution', 'completed'
  ));
```

---

## B9: Verification Checklist

After all migrations are pushed:

- [ ] Run `supabase db push`
- [ ] Verify all 20+ tables exist in Supabase dashboard
- [ ] Check all foreign key constraints
- [ ] Check all CHECK constraints
- [ ] Insert test data for basic validation
- [ ] Verify indexes are created

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Track A (Supabase CLI configured) | Track C (RLS policies) |
| | Track D (App with real data) |
| | Track E (Engines) |

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| `projects.status` aligned to State Machine | ERD had simpler status; State Machine is more complete |
| `rooms.lifecycle_state` added | Per State Machine spec for room-level state |
| `rooms.execution_state` added | Per State Machine spec for contractor work tracking |
| `tasks.source` field added | Track auto-generated vs manual tasks |
| WhatsApp tables NOT here | Moved to Track F (separate migration) |

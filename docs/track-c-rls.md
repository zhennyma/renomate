# Track C: RLS Baseline

> **Notion Source:** Row Level Security (RLS) Matrix - `1bc01dc6d0fe4ce68b4bb5d00bd0c1f9`  
> **Status:** Done  
> **Migration:** `20251208000001_rls_baseline.sql`

---

## Overview

This track implements Row Level Security policies for all tables, ensuring:
- Consumers can only see their own projects and related data
- Suppliers can only see projects they are invited to
- Admins have full access for debugging

---

## Key Concepts

### Actor Types (from RLS Matrix)

1. **Consumer** - `users.role = 'consumer'`
   - Can CRUD their own projects, rooms, line_items, tasks
   - Can view quotes and samples for their projects
   - Cannot see other consumers' data
   
2. **Supplier** - `users.role = 'supplier'`
   - Can view projects they are invited to (via `project_supplier_invites`)
   - Can CRUD quotes for projects they accepted
   - Can update invite `decision_status` (accept/decline)
   - Cannot see other suppliers' quotes (except anonymized)
   
3. **Admin/Ops** - `users.role IN ('admin', 'ops')`
   - Full read/write on all marketplace tables
   - Bypass most RLS via admin role

---

## Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| C1 | RLS for users and profiles | 45m | Done |
| C2 | RLS for projects and rooms | 60m | Done |
| C3 | RLS for project_supplier_invites | 45m | Done |
| C4 | RLS for quotes and quote_line_items | 45m | Done |
| C5 | RLS for samples and showroom_visits | 45m | Done |
| C6 | RLS for tasks | 45m | Done |
| C7 | Admin bypass policies | 30m | Done |
| C8 | Test RLS with different user roles | 60m | Done |

---

## Helper Functions

These functions simplify RLS policy definitions:

```sql
-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'ops')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get supplier profile ID for current user
CREATE OR REPLACE FUNCTION auth.supplier_id()
RETURNS UUID AS $$
  SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## C1: RLS for Users and Profiles

```sql
-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR auth.is_admin());

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (auth.is_admin());

-- Enable RLS on consumer_profiles
ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can view own profile"
  ON public.consumer_profiles FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Consumers can update own profile"
  ON public.consumer_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Consumers can insert own profile"
  ON public.consumer_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Enable RLS on supplier_profiles
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view own profile"
  ON public.supplier_profiles FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Public can view active supplier summaries"
  ON public.supplier_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Suppliers can update own profile"
  ON public.supplier_profiles FOR UPDATE
  USING (user_id = auth.uid());
```

---

## C2: RLS for Projects and Rooms

```sql
-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD own projects"
  ON public.projects FOR ALL
  USING (consumer_id = auth.uid() OR auth.is_admin());

CREATE POLICY "Suppliers can view invited projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = projects.id
      AND psi.supplier_id = auth.supplier_id()
    )
  );

-- Enable RLS on rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD rooms in own projects"
  ON public.rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = rooms.project_id
      AND (p.consumer_id = auth.uid() OR auth.is_admin())
    )
  );

CREATE POLICY "Suppliers can view rooms in invited projects"
  ON public.rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = rooms.project_id
      AND psi.supplier_id = auth.supplier_id()
    )
  );

-- Enable RLS on line_items (same pattern as rooms)
ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD line_items in own projects"
  ON public.line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = line_items.project_id
      AND (p.consumer_id = auth.uid() OR auth.is_admin())
    )
  );

CREATE POLICY "Suppliers can view line_items in invited projects"
  ON public.line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = line_items.project_id
      AND psi.supplier_id = auth.supplier_id()
    )
  );
```

---

## C3: RLS for project_supplier_invites

```sql
ALTER TABLE public.project_supplier_invites ENABLE ROW LEVEL SECURITY;

-- Consumers can manage invites for their projects
CREATE POLICY "Consumers can CRUD invites for own projects"
  ON public.project_supplier_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_supplier_invites.project_id
      AND (p.consumer_id = auth.uid() OR auth.is_admin())
    )
  );

-- Suppliers can view their own invites
CREATE POLICY "Suppliers can view own invites"
  ON public.project_supplier_invites FOR SELECT
  USING (supplier_id = auth.supplier_id());

-- Suppliers can update decision on their invites (accept/decline)
CREATE POLICY "Suppliers can update decision on own invites"
  ON public.project_supplier_invites FOR UPDATE
  USING (supplier_id = auth.supplier_id())
  WITH CHECK (supplier_id = auth.supplier_id());
```

---

## C4: RLS for Quotes

```sql
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Suppliers can CRUD their own quotes
CREATE POLICY "Suppliers can CRUD own quotes"
  ON public.quotes FOR ALL
  USING (supplier_id = auth.supplier_id() OR auth.is_admin());

-- Consumers can view quotes for their projects (read-only)
CREATE POLICY "Consumers can view quotes for own projects"
  ON public.quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = quotes.project_id
      AND p.consumer_id = auth.uid()
    )
  );

ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;

-- Suppliers can CRUD line items for their quotes
CREATE POLICY "Suppliers can CRUD own quote line items"
  ON public.quote_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q
      WHERE q.id = quote_line_items.quote_id
      AND (q.supplier_id = auth.supplier_id() OR auth.is_admin())
    )
  );

-- Consumers can view quote line items for their projects
CREATE POLICY "Consumers can view quote line items"
  ON public.quote_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q
      JOIN public.projects p ON p.id = q.project_id
      WHERE q.id = quote_line_items.quote_id
      AND p.consumer_id = auth.uid()
    )
  );
```

---

## C5: RLS for Samples and Showroom Visits

```sql
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

-- Suppliers can manage their samples
CREATE POLICY "Suppliers can CRUD own samples"
  ON public.samples FOR ALL
  USING (supplier_id = auth.supplier_id() OR auth.is_admin());

-- Consumers can view samples for their projects
CREATE POLICY "Consumers can view samples for own projects"
  ON public.samples FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = samples.project_id
      AND p.consumer_id = auth.uid()
    )
  );

-- Consumers can update sample status (confirm delivery, give feedback)
CREATE POLICY "Consumers can update samples for own projects"
  ON public.samples FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = samples.project_id
      AND p.consumer_id = auth.uid()
    )
  );

ALTER TABLE public.showroom_visits ENABLE ROW LEVEL SECURITY;

-- Similar pattern for showroom_visits
CREATE POLICY "Suppliers can CRUD own visits"
  ON public.showroom_visits FOR ALL
  USING (supplier_id = auth.supplier_id() OR auth.is_admin());

CREATE POLICY "Consumers can view visits for own projects"
  ON public.showroom_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = showroom_visits.project_id
      AND p.consumer_id = auth.uid()
    )
  );

CREATE POLICY "Consumers can update visits for own projects"
  ON public.showroom_visits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = showroom_visits.project_id
      AND p.consumer_id = auth.uid()
    )
  );
```

---

## C6: RLS for Tasks

```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Consumers can manage tasks in their projects
CREATE POLICY "Consumers can CRUD tasks in own projects"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND (p.consumer_id = auth.uid() OR auth.is_admin())
    )
  );

-- Suppliers can view tasks assigned to them
CREATE POLICY "Suppliers can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (assigned_to_supplier_id = auth.supplier_id());

-- Suppliers can update tasks assigned to them
CREATE POLICY "Suppliers can update assigned tasks"
  ON public.tasks FOR UPDATE
  USING (assigned_to_supplier_id = auth.supplier_id());
```

---

## C7: Admin Bypass

For all tables, the `auth.is_admin()` check is included in the USING clause. This means admins automatically have access through the existing policies.

For tables that need explicit admin-only operations:

```sql
-- Example: Admin-only insert for inspiration_assets
CREATE POLICY "Admins can manage inspiration assets"
  ON public.inspiration_assets FOR ALL
  USING (auth.is_admin());
```

---

## C8: Testing Checklist

### Test Users to Create
1. Consumer A (consumer role)
2. Consumer B (consumer role) 
3. Supplier X (supplier role)
4. Supplier Y (supplier role)
5. Admin (admin role)

### Test Cases

| Test | Expected Result |
|------|-----------------|
| Consumer A views projects | Only sees own projects |
| Consumer A views Consumer B's project | Access denied |
| Supplier X views all projects | Only sees invited projects |
| Supplier X views Supplier Y's quotes | Access denied |
| Supplier X updates own invite status | Allowed |
| Supplier X updates Consumer's project | Access denied |
| Admin views all projects | Full access |
| Admin updates any quote | Allowed |

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Track B (all tables exist) | Track D (secure app data access) |
| | Track G (RLS hardening) |

---

## Notes

- All policies use `auth.uid()` from Supabase Auth
- Helper functions are `SECURITY DEFINER` to run with elevated privileges
- MVP policies are intentionally simpler - will harden in Track G
- Magic link access for suppliers will be handled via custom claims (Track F)

---

## Implementation Summary (2025-12-08)

**Migration:** `supabase/migrations/20251208000001_rls_baseline.sql`

### Helper Functions Created (in `public` schema)
- `public.user_role()` - Returns current user's role
- `public.is_admin()` - Returns true if user is admin/ops
- `public.supplier_id()` - Returns supplier_profile.id for current user

### Tables with RLS Enabled

| Table | Policies |
|-------|----------|
| users | View own, Admin update |
| consumer_profiles | View/update/insert own |
| supplier_profiles | View own, Public view active, Update own |
| projects | Consumer CRUD own, Supplier view invited |
| rooms | Consumer CRUD in own projects, Supplier view invited |
| line_items | Consumer CRUD in own projects, Supplier view invited |
| project_supplier_invites | Consumer CRUD for own projects, Supplier view/update own |
| quotes | Supplier CRUD own, Consumer view for own projects |
| quote_line_items | Supplier CRUD for own quotes, Consumer view |
| samples | Supplier CRUD own, Consumer view/update for own projects |
| showroom_visits | Supplier CRUD own, Consumer view/update for own projects |
| tasks | Consumer CRUD in own projects, Supplier view/update assigned |
| inspiration_assets | Admin manage, Anyone view |
| inspiration_boards | Consumer CRUD for own projects |
| inspiration_board_items | Consumer CRUD via board ownership |
| favourites | Users CRUD own |
| supplier_scopes | Consumer view for own projects, Supplier CRUD own |
| sample_feedback | Users CRUD own, Supplier view on their samples |
| project_packs | Consumer CRUD for own projects, Supplier view invited |
| task_dependencies | Via task ownership |
| change_orders | Consumer CRUD for own projects, Supplier view invited |
| payments | Consumer view for own projects, Admin manage |
| whatsapp_threads | Via project ownership, Admin manage |
| whatsapp_messages | Via thread ownership, Admin manage |
| audit_logs | Admin view, System insert |

### Manual Testing Checklist
To verify RLS in Supabase Dashboard:
1. Go to **Table Editor** → Check "RLS Enabled" badge on each table
2. Go to **Authentication** → **Policies** → Review policies per table
3. Use **SQL Editor** with `SET LOCAL role TO authenticated; SET LOCAL request.jwt.claim.sub TO '<user-id>';` to test as different users

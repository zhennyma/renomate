-- RLS Baseline Migration: Implement Row Level Security for all tables
-- Reference: docs/track-c-rls.md
-- 
-- Actor Types:
-- - Consumer: users.role = 'consumer' - Can CRUD own projects and related data
-- - Supplier: users.role = 'supplier' - Can view invited projects, CRUD own quotes
-- - Admin/Ops: users.role IN ('admin', 'ops') - Full access

-- ============================================================================
-- HELPER FUNCTIONS
-- These simplify RLS policy definitions
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'ops')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get supplier profile ID for current user
CREATE OR REPLACE FUNCTION public.supplier_id()
RETURNS UUID AS $$
  SELECT id FROM public.supplier_profiles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- C1: RLS FOR USERS AND PROFILES
-- ============================================================================

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- Enable RLS on consumer_profiles
ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can view own profile"
  ON public.consumer_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

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
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Public can view active supplier summaries"
  ON public.supplier_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Suppliers can update own profile"
  ON public.supplier_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- C2: RLS FOR PROJECTS AND ROOMS
-- ============================================================================

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD own projects"
  ON public.projects FOR ALL
  USING (consumer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Suppliers can view invited projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = projects.id
      AND psi.supplier_id = public.supplier_id()
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
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Suppliers can view rooms in invited projects"
  ON public.rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = rooms.project_id
      AND psi.supplier_id = public.supplier_id()
    )
  );

-- Enable RLS on line_items
ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD line_items in own projects"
  ON public.line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = line_items.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Suppliers can view line_items in invited projects"
  ON public.line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = line_items.project_id
      AND psi.supplier_id = public.supplier_id()
    )
  );

-- ============================================================================
-- C3: RLS FOR PROJECT_SUPPLIER_INVITES
-- ============================================================================

ALTER TABLE public.project_supplier_invites ENABLE ROW LEVEL SECURITY;

-- Consumers can manage invites for their projects
CREATE POLICY "Consumers can CRUD invites for own projects"
  ON public.project_supplier_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_supplier_invites.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

-- Suppliers can view their own invites
CREATE POLICY "Suppliers can view own invites"
  ON public.project_supplier_invites FOR SELECT
  USING (supplier_id = public.supplier_id());

-- Suppliers can update decision on their invites (accept/decline)
CREATE POLICY "Suppliers can update decision on own invites"
  ON public.project_supplier_invites FOR UPDATE
  USING (supplier_id = public.supplier_id())
  WITH CHECK (supplier_id = public.supplier_id());

-- ============================================================================
-- C4: RLS FOR QUOTES
-- ============================================================================

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Suppliers can CRUD their own quotes
CREATE POLICY "Suppliers can CRUD own quotes"
  ON public.quotes FOR ALL
  USING (supplier_id = public.supplier_id() OR public.is_admin());

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
      AND (q.supplier_id = public.supplier_id() OR public.is_admin())
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

-- ============================================================================
-- C5: RLS FOR SAMPLES AND SHOWROOM VISITS
-- ============================================================================

ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

-- Suppliers can manage their samples
CREATE POLICY "Suppliers can CRUD own samples"
  ON public.samples FOR ALL
  USING (supplier_id = public.supplier_id() OR public.is_admin());

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

-- Suppliers can manage their showroom visits
CREATE POLICY "Suppliers can CRUD own visits"
  ON public.showroom_visits FOR ALL
  USING (supplier_id = public.supplier_id() OR public.is_admin());

-- Consumers can view visits for their projects
CREATE POLICY "Consumers can view visits for own projects"
  ON public.showroom_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = showroom_visits.project_id
      AND p.consumer_id = auth.uid()
    )
  );

-- Consumers can update visits for their projects
CREATE POLICY "Consumers can update visits for own projects"
  ON public.showroom_visits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = showroom_visits.project_id
      AND p.consumer_id = auth.uid()
    )
  );

-- ============================================================================
-- C6: RLS FOR TASKS
-- ============================================================================

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Consumers can manage tasks in their projects
CREATE POLICY "Consumers can CRUD tasks in own projects"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = tasks.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

-- Suppliers can view tasks assigned to them
CREATE POLICY "Suppliers can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (assigned_to_supplier_id = public.supplier_id());

-- Suppliers can update tasks assigned to them
CREATE POLICY "Suppliers can update assigned tasks"
  ON public.tasks FOR UPDATE
  USING (assigned_to_supplier_id = public.supplier_id());

-- ============================================================================
-- C7: ADMIN BYPASS
-- Note: Admin bypass is already included in each policy via is_admin() check
-- This section adds policies for admin-only tables
-- ============================================================================

-- Inspiration assets are admin-managed
ALTER TABLE public.inspiration_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inspiration assets"
  ON public.inspiration_assets FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view inspiration assets"
  ON public.inspiration_assets FOR SELECT
  USING (true);

-- Audit logs are admin-only
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- ADDITIONAL TABLES (not explicitly in C1-C6 but need RLS)
-- ============================================================================

-- Project packs follow project ownership
ALTER TABLE public.project_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD packs for own projects"
  ON public.project_packs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_packs.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Suppliers can view packs for invited projects"
  ON public.project_packs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = project_packs.project_id
      AND psi.supplier_id = public.supplier_id()
    )
  );

-- Inspiration boards follow project ownership
ALTER TABLE public.inspiration_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD boards for own projects"
  ON public.inspiration_boards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = inspiration_boards.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

-- Board items follow board ownership
ALTER TABLE public.inspiration_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD board items"
  ON public.inspiration_board_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspiration_boards ib
      WHERE ib.id = inspiration_board_items.board_id
      AND (ib.consumer_id = auth.uid() OR public.is_admin())
    )
  );

-- Favourites follow user ownership
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own favourites"
  ON public.favourites FOR ALL
  USING (user_id = auth.uid() OR public.is_admin());

-- Supplier scopes follow project ownership
ALTER TABLE public.supplier_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can view scopes for own projects"
  ON public.supplier_scopes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = supplier_scopes.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Suppliers can CRUD own scopes"
  ON public.supplier_scopes FOR ALL
  USING (supplier_id = public.supplier_id() OR public.is_admin());

-- Sample feedback follows sample ownership
ALTER TABLE public.sample_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sample feedback"
  ON public.sample_feedback FOR ALL
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Suppliers can view feedback on their samples"
  ON public.sample_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.samples s
      WHERE s.id = sample_feedback.sample_id
      AND s.supplier_id = public.supplier_id()
    )
  );

-- Task dependencies follow task ownership
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage task dependencies"
  ON public.task_dependencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.projects p ON p.id = t.project_id
      WHERE t.id = task_dependencies.task_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

-- Change orders follow project ownership
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can CRUD change orders for own projects"
  ON public.change_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = change_orders.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Suppliers can view change orders for invited projects"
  ON public.change_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = change_orders.project_id
      AND psi.supplier_id = public.supplier_id()
    )
  );

-- Payments follow project ownership
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consumers can view payments for own projects"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = payments.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

-- WhatsApp threads follow project ownership
ALTER TABLE public.whatsapp_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own threads"
  ON public.whatsapp_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = whatsapp_threads.project_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "System can manage threads"
  ON public.whatsapp_threads FOR ALL
  USING (public.is_admin());

-- WhatsApp messages follow thread ownership
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own threads"
  ON public.whatsapp_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.whatsapp_threads wt
      JOIN public.projects p ON p.id = wt.project_id
      WHERE wt.id = whatsapp_messages.thread_id
      AND (p.consumer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "System can manage messages"
  ON public.whatsapp_messages FOR ALL
  USING (public.is_admin());

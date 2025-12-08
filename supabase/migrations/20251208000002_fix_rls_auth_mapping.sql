-- Fix RLS policies to use auth_provider_id instead of id
-- The users.id is a separate UUID, not the Supabase auth.uid()
-- auth_provider_id stores the actual auth.uid()

-- ============================================================================
-- FIX HELPER FUNCTIONS
-- ============================================================================

-- Fix: Get current user's role using auth_provider_id
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE auth_provider_id = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix: Check if user is admin using auth_provider_id
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_provider_id = auth.uid()::text 
    AND role IN ('admin', 'ops')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix: Get supplier profile ID for current user
CREATE OR REPLACE FUNCTION public.supplier_id()
RETURNS UUID AS $$
  SELECT sp.id FROM public.supplier_profiles sp
  JOIN public.users u ON u.id = sp.user_id
  WHERE u.auth_provider_id = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Get current user's internal ID from auth_provider_id
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
  SELECT id FROM public.users WHERE auth_provider_id = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- FIX USERS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;

-- Recreate with correct auth_provider_id check
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth_provider_id = auth.uid()::text OR public.is_admin());

CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (auth_provider_id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth_provider_id = auth.uid()::text OR public.is_admin());

-- ============================================================================
-- FIX CONSUMER_PROFILES POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Consumers can view own profile" ON public.consumer_profiles;
DROP POLICY IF EXISTS "Consumers can update own profile" ON public.consumer_profiles;
DROP POLICY IF EXISTS "Consumers can insert own profile" ON public.consumer_profiles;

-- Recreate with correct check using current_user_id()
CREATE POLICY "Consumers can view own profile"
  ON public.consumer_profiles FOR SELECT
  USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "Consumers can insert own profile"
  ON public.consumer_profiles FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY "Consumers can update own profile"
  ON public.consumer_profiles FOR UPDATE
  USING (user_id = public.current_user_id());

-- ============================================================================
-- FIX SUPPLIER_PROFILES POLICIES
-- ============================================================================

-- Drop existing policies (keep public view for active suppliers)
DROP POLICY IF EXISTS "Suppliers can view own profile" ON public.supplier_profiles;
DROP POLICY IF EXISTS "Suppliers can update own profile" ON public.supplier_profiles;

-- Add insert policy (was missing)
CREATE POLICY "Suppliers can insert own profile"
  ON public.supplier_profiles FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

-- Recreate with correct check
CREATE POLICY "Suppliers can view own profile"
  ON public.supplier_profiles FOR SELECT
  USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "Suppliers can update own profile"
  ON public.supplier_profiles FOR UPDATE
  USING (user_id = public.current_user_id());

-- ============================================================================
-- FIX PROJECT POLICIES
-- ============================================================================

-- Drop and recreate project policies with correct consumer_id check
DROP POLICY IF EXISTS "Consumers can CRUD own projects" ON public.projects;
DROP POLICY IF EXISTS "Suppliers can view invited projects" ON public.projects;

CREATE POLICY "Consumers can CRUD own projects"
  ON public.projects FOR ALL
  USING (consumer_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "Suppliers can view invited projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = projects.id
      AND psi.supplier_id = public.supplier_id()
    )
  );

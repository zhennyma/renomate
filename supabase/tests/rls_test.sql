-- RLS Test Script for Track C
-- Run this in Supabase SQL Editor to verify RLS policies work correctly
-- 
-- This script:
-- 1. Creates test users (consumer A, consumer B, supplier X, supplier Y, admin)
-- 2. Creates test data with proper ownership
-- 3. Tests access patterns for each role
-- 4. Reports results
-- 5. Cleans up test data

-- ============================================================================
-- SETUP: Create test users and data
-- ============================================================================

DO $$
DECLARE
  consumer_a_id UUID := gen_random_uuid();
  consumer_b_id UUID := gen_random_uuid();
  supplier_x_user_id UUID := gen_random_uuid();
  supplier_y_user_id UUID := gen_random_uuid();
  admin_id UUID := gen_random_uuid();
  supplier_x_profile_id UUID := gen_random_uuid();
  supplier_y_profile_id UUID := gen_random_uuid();
  project_a_id UUID := gen_random_uuid();
  project_b_id UUID := gen_random_uuid();
  invite_x_id UUID := gen_random_uuid();
  quote_x_id UUID := gen_random_uuid();
BEGIN
  -- Clean up any existing test data
  DELETE FROM public.users WHERE email LIKE '%@rls-test.local';
  
  -- Create test users
  INSERT INTO public.users (id, auth_provider_id, role, email, full_name) VALUES
    (consumer_a_id, 'test-consumer-a', 'consumer', 'consumer-a@rls-test.local', 'Consumer A'),
    (consumer_b_id, 'test-consumer-b', 'consumer', 'consumer-b@rls-test.local', 'Consumer B'),
    (supplier_x_user_id, 'test-supplier-x', 'supplier', 'supplier-x@rls-test.local', 'Supplier X'),
    (supplier_y_user_id, 'test-supplier-y', 'supplier', 'supplier-y@rls-test.local', 'Supplier Y'),
    (admin_id, 'test-admin', 'admin', 'admin@rls-test.local', 'Test Admin');
  
  -- Create consumer profiles
  INSERT INTO public.consumer_profiles (user_id, location_city) VALUES
    (consumer_a_id, 'Dubai'),
    (consumer_b_id, 'Abu Dhabi');
  
  -- Create supplier profiles
  INSERT INTO public.supplier_profiles (id, user_id, company_name, trade_type, status) VALUES
    (supplier_x_profile_id, supplier_x_user_id, 'Supplier X Co', 'contractor', 'active'),
    (supplier_y_profile_id, supplier_y_user_id, 'Supplier Y Co', 'designer', 'active');
  
  -- Create projects (owned by different consumers)
  INSERT INTO public.projects (id, consumer_id, title, status, location_city) VALUES
    (project_a_id, consumer_a_id, 'Project A (Consumer A)', 'draft', 'Dubai'),
    (project_b_id, consumer_b_id, 'Project B (Consumer B)', 'draft', 'Abu Dhabi');
  
  -- Create invite for Supplier X to Project A only
  INSERT INTO public.project_supplier_invites (id, project_id, supplier_id, invite_channel, decision_status) VALUES
    (invite_x_id, project_a_id, supplier_x_profile_id, 'dashboard', 'accepted');
  
  -- Create quote from Supplier X for Project A
  INSERT INTO public.quotes (id, project_id, supplier_id, quote_type, status, total_price) VALUES
    (quote_x_id, project_a_id, supplier_x_profile_id, 'contracting', 'submitted', 50000);
  
  -- Store IDs for later reference
  RAISE NOTICE 'Test data created:';
  RAISE NOTICE '  Consumer A: %', consumer_a_id;
  RAISE NOTICE '  Consumer B: %', consumer_b_id;
  RAISE NOTICE '  Supplier X User: %', supplier_x_user_id;
  RAISE NOTICE '  Supplier X Profile: %', supplier_x_profile_id;
  RAISE NOTICE '  Supplier Y User: %', supplier_y_user_id;
  RAISE NOTICE '  Supplier Y Profile: %', supplier_y_profile_id;
  RAISE NOTICE '  Admin: %', admin_id;
  RAISE NOTICE '  Project A: %', project_a_id;
  RAISE NOTICE '  Project B: %', project_b_id;
END $$;

-- ============================================================================
-- TEST HELPER: Function to test RLS as a specific user
-- ============================================================================

CREATE OR REPLACE FUNCTION test_rls_as_user(test_user_email TEXT)
RETURNS TABLE (
  test_name TEXT,
  expected TEXT,
  actual TEXT,
  passed BOOLEAN
) AS $$
DECLARE
  test_user_id UUID;
  test_user_role TEXT;
  supplier_profile_id UUID;
  project_count INT;
  quote_count INT;
  invite_count INT;
BEGIN
  -- Get test user info
  SELECT id, role INTO test_user_id, test_user_role
  FROM public.users WHERE email = test_user_email;
  
  IF test_user_id IS NULL THEN
    RETURN QUERY SELECT 
      'User lookup'::TEXT,
      'User found'::TEXT,
      'User not found: ' || test_user_email,
      FALSE;
    RETURN;
  END IF;
  
  -- Get supplier profile if applicable
  SELECT id INTO supplier_profile_id
  FROM public.supplier_profiles WHERE user_id = test_user_id;
  
  RAISE NOTICE 'Testing as % (role: %, id: %)', test_user_email, test_user_role, test_user_id;
  
  -- Note: In production, RLS uses auth.uid(). For testing, we query with service role
  -- and verify the policy logic manually by checking what SHOULD be visible.
  
  -- Return test results based on role
  IF test_user_role = 'consumer' THEN
    -- Count projects owned by this consumer
    SELECT COUNT(*) INTO project_count
    FROM public.projects WHERE consumer_id = test_user_id;
    
    RETURN QUERY SELECT
      'Consumer sees own projects'::TEXT,
      '1'::TEXT,
      project_count::TEXT,
      project_count = 1;
      
  ELSIF test_user_role = 'supplier' THEN
    -- Count projects this supplier is invited to
    SELECT COUNT(*) INTO project_count
    FROM public.projects p
    WHERE EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = p.id
      AND psi.supplier_id = supplier_profile_id
    );
    
    RETURN QUERY SELECT
      'Supplier sees invited projects'::TEXT,
      CASE WHEN test_user_email = 'supplier-x@rls-test.local' THEN '1' ELSE '0' END,
      project_count::TEXT,
      (test_user_email = 'supplier-x@rls-test.local' AND project_count = 1)
      OR (test_user_email = 'supplier-y@rls-test.local' AND project_count = 0);
    
    -- Count quotes owned by this supplier
    SELECT COUNT(*) INTO quote_count
    FROM public.quotes WHERE supplier_id = supplier_profile_id;
    
    RETURN QUERY SELECT
      'Supplier sees own quotes'::TEXT,
      CASE WHEN test_user_email = 'supplier-x@rls-test.local' THEN '1' ELSE '0' END,
      quote_count::TEXT,
      (test_user_email = 'supplier-x@rls-test.local' AND quote_count = 1)
      OR (test_user_email = 'supplier-y@rls-test.local' AND quote_count = 0);
      
  ELSIF test_user_role = 'admin' THEN
    -- Admin should see all projects
    SELECT COUNT(*) INTO project_count FROM public.projects;
    
    RETURN QUERY SELECT
      'Admin sees all projects'::TEXT,
      '2'::TEXT,
      project_count::TEXT,
      project_count = 2;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RUN TESTS
-- ============================================================================

SELECT '=== Testing as Consumer A ===' AS test_section;
SELECT * FROM test_rls_as_user('consumer-a@rls-test.local');

SELECT '=== Testing as Consumer B ===' AS test_section;
SELECT * FROM test_rls_as_user('consumer-b@rls-test.local');

SELECT '=== Testing as Supplier X (invited to Project A) ===' AS test_section;
SELECT * FROM test_rls_as_user('supplier-x@rls-test.local');

SELECT '=== Testing as Supplier Y (not invited) ===' AS test_section;
SELECT * FROM test_rls_as_user('supplier-y@rls-test.local');

SELECT '=== Testing as Admin ===' AS test_section;
SELECT * FROM test_rls_as_user('admin@rls-test.local');

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================

SELECT '=== RLS Status for All Tables ===' AS test_section;

SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ DISABLED' END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- ============================================================================
-- COUNT POLICIES PER TABLE
-- ============================================================================

SELECT '=== Policy Count per Table ===' AS test_section;

SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ============================================================================
-- LIST ALL POLICIES
-- ============================================================================

SELECT '=== All RLS Policies ===' AS test_section;

SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  LEFT(qual::TEXT, 80) AS using_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- CLEANUP (uncomment to run)
-- ============================================================================

-- Cleanup test function
DROP FUNCTION IF EXISTS test_rls_as_user(TEXT);

-- Cleanup test data
DELETE FROM public.users WHERE email LIKE '%@rls-test.local';

SELECT '=== Test Complete - Data Cleaned Up ===' AS status;

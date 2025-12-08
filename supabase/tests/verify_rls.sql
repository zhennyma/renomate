-- Quick RLS Verification Script
-- Copy and paste this into Supabase Dashboard > SQL Editor > New Query

-- ============================================================================
-- 1. VERIFY HELPER FUNCTIONS EXIST
-- ============================================================================

SELECT '=== Helper Functions ===' AS section;

SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IN ('user_role', 'is_admin', 'supplier_id') THEN '✓ Found'
    ELSE '✗ Missing'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('user_role', 'is_admin', 'supplier_id')
ORDER BY routine_name;

-- ============================================================================
-- 2. VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================================================

SELECT '=== RLS Status ===' AS section;

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ DISABLED' END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('schema_migrations')
ORDER BY 
  CASE WHEN rowsecurity THEN 0 ELSE 1 END,
  tablename;

-- ============================================================================
-- 3. COUNT POLICIES PER TABLE
-- ============================================================================

SELECT '=== Policies per Table ===' AS section;

SELECT 
  t.tablename,
  COALESCE(p.policy_count, 0) AS policy_count,
  CASE 
    WHEN COALESCE(p.policy_count, 0) = 0 THEN '⚠ No policies'
    WHEN COALESCE(p.policy_count, 0) >= 2 THEN '✓ Multiple policies'
    ELSE '○ Single policy'
  END AS status
FROM pg_tables t
LEFT JOIN (
  SELECT tablename, COUNT(*) as policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
) p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.tablename NOT IN ('schema_migrations')
ORDER BY COALESCE(p.policy_count, 0), t.tablename;

-- ============================================================================
-- 4. LIST ALL POLICIES (summary)
-- ============================================================================

SELECT '=== All Policies ===' AS section;

SELECT 
  tablename,
  policyname,
  cmd AS operation,
  CASE permissive WHEN 'PERMISSIVE' THEN 'Allow' ELSE 'Restrict' END AS type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 5. VERIFY EXPECTED POLICY COUNT
-- ============================================================================

SELECT '=== Summary ===' AS section;

SELECT
  (SELECT COUNT(DISTINCT tablename) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) AS tables_with_rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS total_policies,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('user_role', 'is_admin', 'supplier_id')) AS helper_functions;

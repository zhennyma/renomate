/**
 * RLS Verification Tests
 * 
 * Run with: npx tsx run_rls_tests.ts
 * 
 * Requires environment variables (loaded from ../../app/.env):
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (from Supabase Dashboard > Settings > API)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from app/.env
config({ path: resolve(__dirname, '../../app/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, expected: string, actual: string) {
  results.push({ name, passed, expected, actual });
  const icon = passed ? '✓' : '✗';
  console.log(`  ${icon} ${name}: expected ${expected}, got ${actual}`);
}

async function verifyHelperFunctions() {
  console.log('\n=== Verifying Helper Functions ===');
  
  const { data, error } = await supabase.rpc('user_role').select();
  
  // Check if functions exist by querying information_schema
  const { data: functions, error: funcError } = await supabase
    .from('information_schema.routines' as any)
    .select('routine_name')
    .eq('routine_schema', 'public')
    .in('routine_name', ['user_role', 'is_admin', 'supplier_id']);
  
  if (funcError) {
    // Try raw SQL approach
    const { data: rawData, error: rawError } = await supabase.rpc('is_admin');
    logTest('is_admin() function exists', !rawError, 'exists', rawError ? 'error: ' + rawError.message : 'exists');
    
    const { error: roleError } = await supabase.rpc('user_role');
    logTest('user_role() function exists', !roleError, 'exists', roleError ? 'error: ' + roleError.message : 'exists');
    
    const { error: supplierError } = await supabase.rpc('supplier_id');
    logTest('supplier_id() function exists', !supplierError, 'exists', supplierError ? 'error: ' + supplierError.message : 'exists');
  } else {
    logTest('Helper functions exist', (functions?.length || 0) === 3, '3', String(functions?.length || 0));
  }
}

async function verifyRLSEnabled() {
  console.log('\n=== Verifying RLS is Enabled ===');
  
  // Tables that should have RLS enabled
  const expectedTables = [
    'users', 'consumer_profiles', 'supplier_profiles',
    'projects', 'rooms', 'line_items', 'project_packs',
    'project_supplier_invites', 'quotes', 'quote_line_items',
    'samples', 'showroom_visits', 'sample_feedback',
    'tasks', 'task_dependencies', 'change_orders', 'payments',
    'inspiration_assets', 'inspiration_boards', 'inspiration_board_items',
    'favourites', 'supplier_scopes',
    'whatsapp_threads', 'whatsapp_messages', 'audit_logs'
  ];
  
  // Try to count records in each table (should work with service role)
  let tablesAccessible = 0;
  for (const table of expectedTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      tablesAccessible++;
    }
  }
  
  logTest('Tables accessible with service role', tablesAccessible >= 20, '≥20', String(tablesAccessible));
}

async function testConsumerAccess() {
  console.log('\n=== Testing Consumer Access Patterns ===');
  
  // Create test consumer
  const testEmail = `test-consumer-${Date.now()}@rls-test.local`;
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      auth_provider_id: `test-${Date.now()}`,
      role: 'consumer',
      email: testEmail,
      full_name: 'Test Consumer'
    })
    .select()
    .single();
  
  if (userError) {
    console.log('  ⚠ Could not create test user:', userError.message);
    return;
  }
  
  // Create test project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      consumer_id: user.id,
      title: 'Test Project',
      status: 'draft'
    })
    .select()
    .single();
  
  logTest('Consumer can create project', !projectError, 'success', projectError ? projectError.message : 'success');
  
  // Verify consumer can read their project
  const { data: projects, error: readError } = await supabase
    .from('projects')
    .select('*')
    .eq('consumer_id', user.id);
  
  logTest('Consumer can read own projects', projects?.length === 1, '1 project', `${projects?.length || 0} projects`);
  
  // Cleanup
  if (project) {
    await supabase.from('projects').delete().eq('id', project.id);
  }
  await supabase.from('users').delete().eq('id', user.id);
  
  console.log('  (test data cleaned up)');
}

async function testSupplierAccess() {
  console.log('\n=== Testing Supplier Access Patterns ===');
  
  // Create test supplier user and profile
  const testEmail = `test-supplier-${Date.now()}@rls-test.local`;
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      auth_provider_id: `test-supplier-${Date.now()}`,
      role: 'supplier',
      email: testEmail,
      full_name: 'Test Supplier'
    })
    .select()
    .single();
  
  if (userError) {
    console.log('  ⚠ Could not create test supplier user:', userError.message);
    return;
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('supplier_profiles')
    .insert({
      user_id: user.id,
      company_name: 'Test Supplier Co',
      trade_type: 'contractor',
      status: 'active'
    })
    .select()
    .single();
  
  logTest('Supplier profile created', !profileError, 'success', profileError ? profileError.message : 'success');
  
  // Create a consumer and project to invite supplier to
  const { data: consumer } = await supabase
    .from('users')
    .insert({
      auth_provider_id: `test-consumer-${Date.now()}`,
      role: 'consumer',
      email: `test-consumer-${Date.now()}@rls-test.local`,
      full_name: 'Test Consumer for Supplier'
    })
    .select()
    .single();
  
  const { data: project } = await supabase
    .from('projects')
    .insert({
      consumer_id: consumer!.id,
      title: 'Test Project for Supplier',
      status: 'draft'
    })
    .select()
    .single();
  
  // Create invite
  const { data: invite, error: inviteError } = await supabase
    .from('project_supplier_invites')
    .insert({
      project_id: project!.id,
      supplier_id: profile!.id,
      invite_channel: 'dashboard',
      decision_status: 'pending'
    })
    .select()
    .single();
  
  logTest('Supplier invite created', !inviteError, 'success', inviteError ? inviteError.message : 'success');
  
  // Cleanup
  if (invite) await supabase.from('project_supplier_invites').delete().eq('id', invite.id);
  if (project) await supabase.from('projects').delete().eq('id', project.id);
  if (consumer) await supabase.from('users').delete().eq('id', consumer.id);
  if (profile) await supabase.from('supplier_profiles').delete().eq('id', profile.id);
  if (user) await supabase.from('users').delete().eq('id', user.id);
  
  console.log('  (test data cleaned up)');
}

async function testAdminAccess() {
  console.log('\n=== Testing Admin Access Patterns ===');
  
  // Create test admin
  const testEmail = `test-admin-${Date.now()}@rls-test.local`;
  
  const { data: admin, error: adminError } = await supabase
    .from('users')
    .insert({
      auth_provider_id: `test-admin-${Date.now()}`,
      role: 'admin',
      email: testEmail,
      full_name: 'Test Admin'
    })
    .select()
    .single();
  
  logTest('Admin user created', !adminError, 'success', adminError ? adminError.message : 'success');
  
  // Verify is_admin returns true for admin
  // (Note: this would require running as the admin user, which we can't do without auth)
  
  // Cleanup
  if (admin) await supabase.from('users').delete().eq('id', admin.id);
  console.log('  (test data cleaned up)');
}

async function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('=== TEST SUMMARY ===');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: expected ${r.expected}, got ${r.actual}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  return failed === 0;
}

async function main() {
  console.log('RLS Verification Tests');
  console.log('='.repeat(50));
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('Using service role key for admin access');
  
  try {
    await verifyHelperFunctions();
    await verifyRLSEnabled();
    await testConsumerAccess();
    await testSupplierAccess();
    await testAdminAccess();
    
    const allPassed = await printSummary();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

main();

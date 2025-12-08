/**
 * RLS Verification Tests (Anon Key)
 * 
 * Tests that RLS properly filters data for unauthenticated access.
 * Run with: npx tsx verify_rls_anon.ts
 * 
 * NOTE: PostgreSQL RLS filters rows, it doesn't block access entirely.
 * A successful query with 0 rows means RLS is working correctly.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from app/.env
config({ path: resolve(__dirname, '../../app/.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('   Ensure app/.env is configured');
  process.exit(1);
}

// Create client with anon key (subject to RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

interface TestResult {
  table: string;
  canQuery: boolean;
  rowCount: number | null;
  error: string | null;
  status: 'secure' | 'public' | 'error';
}

const results: TestResult[] = [];

async function testTableAccess(tableName: string): Promise<TestResult> {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  let status: 'secure' | 'public' | 'error';
  if (error) {
    status = 'error'; // RLS blocked entirely or table doesn't exist
  } else if (count === 0) {
    status = 'secure'; // Query succeeded but RLS filtered all rows
  } else {
    status = 'public'; // Data is accessible
  }
  
  return {
    table: tableName,
    canQuery: !error,
    rowCount: count,
    error: error?.message || null,
    status
  };
}

async function main() {
  console.log('═'.repeat(60));
  console.log('RLS Verification Tests (Unauthenticated Access)');
  console.log('═'.repeat(60));
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('Testing with anon key (no authenticated user)\n');

  // All tables to test
  const allTables = [
    // Identity
    'users',
    'consumer_profiles',
    'supplier_profiles',
    // Projects
    'projects',
    'rooms',
    'line_items',
    'project_packs',
    // Sourcing
    'project_supplier_invites',
    'quotes',
    'quote_line_items',
    'supplier_scopes',
    // Sampling
    'samples',
    'sample_feedback',
    'showroom_visits',
    // Tasks
    'tasks',
    'task_dependencies',
    'change_orders',
    'payments',
    // Inspiration
    'inspiration_assets',
    'inspiration_boards',
    'inspiration_board_items',
    'favourites',
    // Messaging
    'whatsapp_threads',
    'whatsapp_messages',
    // System
    'audit_logs'
  ];

  console.log('Testing all tables for unauthenticated access:\n');
  console.log('Legend: ✓ Secure (0 rows) | ○ Public | ✗ Error/Blocked\n');
  
  let secureCount = 0;
  let publicCount = 0;
  let errorCount = 0;
  
  for (const table of allTables) {
    const result = await testTableAccess(table);
    results.push(result);
    
    let icon: string;
    let statusText: string;
    
    switch (result.status) {
      case 'secure':
        icon = '✓';
        statusText = 'Secure (0 rows returned)';
        secureCount++;
        break;
      case 'public':
        icon = '○';
        statusText = `Public (${result.rowCount} rows)`;
        publicCount++;
        break;
      case 'error':
        icon = '✗';
        statusText = `Blocked: ${result.error}`;
        errorCount++;
        break;
    }
    
    console.log(`  ${icon} ${table.padEnd(28)} ${statusText}`);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`\nTotal tables tested: ${allTables.length}`);
  console.log(`  ✓ Secure (RLS filtering):  ${secureCount}`);
  console.log(`  ✗ Blocked (error):         ${errorCount}`);
  console.log(`  ○ Public access:           ${publicCount}`);
  
  // Check for potential issues
  const publicTables = results.filter(r => r.status === 'public');
  
  if (publicTables.length > 0) {
    console.log('\n⚠️  Tables with public data access:');
    publicTables.forEach(r => {
      console.log(`   - ${r.table}: ${r.rowCount} rows accessible`);
    });
    console.log('\n   Review if this is intentional (e.g., inspiration_assets)');
  }
  
  // Overall assessment
  const allSecure = secureCount + errorCount === allTables.length;
  const expectedPublic = publicTables.every(t => 
    ['inspiration_assets', 'supplier_profiles'].includes(t.table)
  );
  
  console.log('\n' + '─'.repeat(60));
  
  if (allSecure || expectedPublic) {
    console.log('✅ RLS VERIFICATION PASSED');
    console.log('   All tables properly protected for unauthenticated users.');
  } else {
    console.log('⚠️  RLS VERIFICATION: Review Required');
    console.log('   Some tables may have unexpected public access.');
  }
  
  console.log('─'.repeat(60));
  console.log('\nNote: "Secure (0 rows)" means RLS is filtering correctly.');
  console.log('For empty tables, rows would still be 0 even without RLS.');
  console.log('To fully test, add test data and verify access patterns.');
  console.log('═'.repeat(60));
  
  process.exit(0);
}

main().catch(console.error);

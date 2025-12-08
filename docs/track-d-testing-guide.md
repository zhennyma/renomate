# Track D: Core App Shell - Testing Guide

**Purpose**: Manual validation checklist for Track D implementation  
**Date**: 2025-12-08  
**Dev Server**: http://localhost:8080/

---

## Pre-requisites

- [x] Dev server is running (`npm run dev` in `/app`)
- [x] Supabase project is accessible (check Supabase Dashboard)
- [x] `.env` file in `/app` has valid values for:
  - `VITE_SUPABASE_URL` - Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Verify Supabase Connection

Open http://localhost:8080/ in your browser, then open the browser console (F12 or Cmd+Option+I) and run:

```javascript
// Test Supabase connection
const { supabase } = await import('/src/integrations/supabase/client.ts');
const { data, error } = await supabase.auth.getSession();
console.log('Connection test:', error ? 'FAILED' : 'OK', error || data);
```

- [x] Connection test returns "OK" (no error)

---

## 1. Landing Page (`/`)

### Expected Behavior
- Shows Renomate branding and hero section
- Two prominent buttons: "Sign In" and "Create Account"
- Two info cards explaining Consumer and Supplier features
- If already logged in, should auto-redirect to dashboard

### Test Steps
- [x] Navigate to http://localhost:8080/
- [x] Verify hero section displays correctly
- [x] Verify "Sign In" button links to `/auth/login`
- [x] Verify "Create Account" button links to `/auth/signup`
- [x] Verify both feature cards link to `/auth/signup`
- [ ] Verify auto-redirect when logged in (will test after sign up)

---

## 2. Sign Up Flow (`/auth/signup`)

### Expected Behavior
- Role selection (Homeowner vs Supplier) with visual cards
- Form fields: Name, Email, Password, Confirm Password
- Creates user in Supabase Auth
- Creates record in `users` table with selected role
- Creates profile in `consumer_profiles` or `supplier_profiles`
- Shows success message with link to sign in

### Test Steps - Consumer Sign Up
- [ ] Navigate to http://localhost:8080/auth/signup
- [ ] Select "Homeowner" role (should be selected by default)
- [ ] Enter test details:
  - Full Name: `Test Consumer`
  - Email: `consumer-test@example.com`
  - Password: `testpass123`
  - Confirm Password: `testpass123`
- [ ] Click "Create Account"
- [ ] Verify success message appears
- [ ] **In Supabase Dashboard**: Check `auth.users` table for new user
- [ ] **In Supabase Dashboard**: Check `public.users` table for new record with `role = 'consumer'`
- [ ] **In Supabase Dashboard**: Check `public.consumer_profiles` table for new profile

### Test Steps - Supplier Sign Up
- [ ] Navigate to http://localhost:8080/auth/signup
- [ ] Select "Supplier" role
- [ ] Enter test details:
  - Company Name: `Test Supplier Co`
  - Email: `supplier-test@example.com`
  - Password: `testpass123`
  - Confirm Password: `testpass123`
- [ ] Click "Create Account"
- [ ] Verify success message appears
- [ ] **In Supabase Dashboard**: Check `public.users` table for new record with `role = 'supplier'`
- [ ] **In Supabase Dashboard**: Check `public.supplier_profiles` table for new profile

### Validation Errors to Test
- [ ] Passwords don't match → Shows error
- [ ] Password too short (< 6 chars) → Shows error
- [ ] Email already exists → Shows Supabase error

---

## 3. Sign In Flow (`/auth/login`)

### Expected Behavior
- Email and password fields
- Successful login redirects to role-appropriate dashboard
- Invalid credentials show error message

### Test Steps - Consumer Login
- [ ] Navigate to http://localhost:8080/auth/login
- [ ] Enter consumer credentials:
  - Email: `consumer-test@example.com`
  - Password: `testpass123`
- [ ] Click "Sign In"
- [ ] Verify redirect to `/consumer/projects`

### Test Steps - Supplier Login
- [ ] Sign out first (if logged in)
- [ ] Navigate to http://localhost:8080/auth/login
- [ ] Enter supplier credentials:
  - Email: `supplier-test@example.com`
  - Password: `testpass123`
- [ ] Click "Sign In"
- [ ] Verify redirect to `/supplier/leads`

### Error Cases
- [ ] Wrong password → Shows "Invalid login credentials" error
- [ ] Non-existent email → Shows appropriate error

---

## 4. Protected Routes & Role Guards

### Expected Behavior
- Unauthenticated users are redirected to `/auth/login`
- Consumers cannot access supplier routes (redirected to consumer dashboard)
- Suppliers cannot access consumer routes (redirected to supplier dashboard)

### Test Steps - Unauthenticated Access
- [ ] Sign out (or use incognito window)
- [ ] Navigate directly to http://localhost:8080/consumer/projects
- [ ] Verify redirect to `/auth/login`
- [ ] Navigate directly to http://localhost:8080/supplier/leads
- [ ] Verify redirect to `/auth/login`

### Test Steps - Role-Based Access
- [ ] Sign in as Consumer
- [ ] Navigate directly to http://localhost:8080/supplier/leads
- [ ] Verify redirect to `/consumer/projects` (consumer's dashboard)
- [ ] Sign out
- [ ] Sign in as Supplier
- [ ] Navigate directly to http://localhost:8080/consumer/projects
- [ ] Verify redirect to `/supplier/leads` (supplier's dashboard)

---

## 5. Consumer Projects List (`/consumer/projects`)

### Expected Behavior
- Shows loading state while fetching
- Displays list of consumer's projects (from `projects` table)
- Shows empty state if no projects
- Each project card shows: title, status badge, location, budget, progress

### Test Steps
- [ ] Sign in as Consumer
- [ ] Navigate to http://localhost:8080/consumer/projects
- [ ] Verify page header shows "My Projects"
- [ ] Verify welcome message shows user's name (if set)
- [ ] Verify empty state displays if no projects exist
- [ ] **Optional**: Create a test project in Supabase Dashboard:
  ```sql
  INSERT INTO projects (consumer_id, title, status, location_city, location_area)
  VALUES ('<consumer-user-id>', 'Kitchen Renovation', 'draft', 'Dubai', 'Marina');
  ```
- [ ] Refresh page and verify project appears in list
- [ ] Verify project card shows status badge
- [ ] Click project card → navigates to project detail

---

## 6. Consumer Project Detail (`/consumer/projects/:id`)

### Expected Behavior
- Shows project header with title, status, property type
- Shows location and target date
- Progress bar (if tasks exist)
- Tabs: Rooms, Tasks, Line Items
- Sidebar with Project Pack summary

### Test Steps
- [ ] From Projects List, click on a project
- [ ] Verify URL is `/consumer/projects/<project-id>`
- [ ] Verify back button returns to projects list
- [ ] Verify project title displays correctly
- [ ] Verify status badge shows
- [ ] Click "Rooms" tab → shows rooms or empty state
- [ ] Click "Tasks" tab → shows tasks or empty state
- [ ] Click "Line Items" tab → shows items or empty state
- [ ] Verify sidebar shows budget and timeline info

---

## 7. Supplier Leads List (`/supplier/leads`)

### Expected Behavior
- Shows loading state while fetching
- Tabs: Pending, Accepted, Declined
- Each lead card shows: project title, fit score, location, budget, invite date
- Empty states for each tab

### Test Steps
- [ ] Sign in as Supplier
- [ ] Navigate to http://localhost:8080/supplier/leads
- [ ] Verify page header shows "Leads & Opportunities"
- [ ] Verify tabs display: Pending, Accepted, Declined
- [ ] Click each tab → shows appropriate content or empty state
- [ ] **Optional**: Create test invite in Supabase Dashboard:
  ```sql
  -- First get the supplier_id from supplier_profiles
  INSERT INTO project_supplier_invites (project_id, supplier_id, invite_channel, decision_status, fit_score)
  VALUES ('<project-id>', '<supplier-profile-id>', 'dashboard', 'pending', 85);
  ```
- [ ] Refresh and verify lead appears in Pending tab
- [ ] Verify lead card shows fit score and project details

---

## 8. Supplier Lead Detail (`/supplier/leads/:id`)

### Expected Behavior
- Shows lead header with project title, decision status, fit score
- Accept/Decline buttons for pending leads
- Project summary with stats
- Project Pack snapshot with rooms and line items
- Quote workspace (only for accepted leads)

### Test Steps
- [ ] From Leads List, click on a lead
- [ ] Verify URL is `/supplier/leads/<lead-id>`
- [ ] Verify back button returns to leads list
- [ ] Verify project title displays
- [ ] Verify decision status badge shows
- [ ] Verify Accept/Decline buttons appear for pending leads
- [ ] Click "Accept" → status changes to "Accepted"
- [ ] Verify Quote Workspace section appears after accepting
- [ ] Verify rooms breakdown shows (if rooms exist)

---

## 9. Sign Out Flow

### Expected Behavior
- User can sign out from any authenticated page
- After sign out, redirected to home page
- Protected routes no longer accessible

### Test Steps
- [ ] While logged in, look for sign out option (may need to add to UI)
- [ ] **Note**: Sign out button may not be in current UI - test via browser console:
  ```javascript
  // In browser console:
  const { supabase } = await import('/src/integrations/supabase/client.ts');
  await supabase.auth.signOut();
  ```
- [ ] Verify redirect to home page after sign out
- [ ] Verify cannot access protected routes after sign out

---

## 10. Error Handling

### Test Steps
- [ ] Disconnect internet → verify error states show
- [ ] Invalid project ID → verify "Project not found" error
- [ ] Invalid lead ID → verify "Lead not found" error

---

## Database Verification Queries

Run these in Supabase SQL Editor to verify data:

```sql
-- Check all users
SELECT id, auth_provider_id, role, email, full_name, created_at 
FROM users ORDER BY created_at DESC;

-- Check consumer profiles
SELECT cp.*, u.email 
FROM consumer_profiles cp 
JOIN users u ON u.id = cp.user_id;

-- Check supplier profiles
SELECT sp.*, u.email 
FROM supplier_profiles sp 
JOIN users u ON u.id = sp.user_id;

-- Check projects
SELECT id, consumer_id, title, status, location_city, created_at 
FROM projects ORDER BY created_at DESC;

-- Check project supplier invites
SELECT psi.*, p.title as project_title 
FROM project_supplier_invites psi 
JOIN projects p ON p.id = psi.project_id;
```

---

## Issues Found

| # | Page | Issue Description | Severity | Status |
|---|------|-------------------|----------|--------|
| 1 |      |                   |          |        |
| 2 |      |                   |          |        |
| 3 |      |                   |          |        |

---

## Sign-Off

- [ ] All critical paths tested
- [ ] No blocking issues found
- [ ] Ready for next track

**Tested By**: _______________  
**Date**: _______________

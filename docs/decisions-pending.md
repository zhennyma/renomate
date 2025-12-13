# Decisions Pending

**Purpose**: Track decisions that need to be made later during development  
**Last Updated**: 2025-12-08

---

## Decisions to be Made

| # | Track | Decision | Context | Options | Status |
|---|-------|----------|---------|---------|--------|
| 1 | Track D | Supabase Auth Rate Limiting | During testing, encountered rate limit errors ("For security purposes, you can only request this after X seconds"). Need to decide appropriate limits for production vs development. | **Option A**: Keep defaults (secure, but slower dev testing)<br>**Option B**: Loosen for dev (faster testing)<br>**Option C**: Disable email confirmation for dev | Pending |
| 2 | Track D | Database Migration Sync | Discovered `auth_provider_id` column was missing from production database despite being in migration files. Need process to ensure migrations are applied. | **Option A**: Manual SQL via Dashboard<br>**Option B**: Setup `supabase db push`<br>**Option C**: Use Supabase CLI for migrations | Resolved (manual SQL) |

---

## Issues Resolved During Track D

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Database trigger for user creation was unreliable | Replaced with RPC function `create_user_on_signup` called from frontend after email verification |
| 2 | `auth_provider_id` column missing from `users` table | Added via SQL: `ALTER TABLE public.users ADD COLUMN auth_provider_id TEXT UNIQUE` |
| 3 | RLS policies blocking user data reads | Added SELECT policies for `users`, `consumer_profiles`, `supplier_profiles`, `projects` using `auth.uid()` |
| 4 | `AppLayout` using old `RoleContext` | Updated to use `AuthContext` instead |
| 5 | Email confirmation redirect not working | Configured Supabase Site URL and Redirect URLs to use `localhost:8080` |

---

## How to Configure (Reference)

### Supabase Auth Rate Limits

**Location**: Supabase Dashboard → Authentication → Rate Limits

| Setting | Default | Description |
|---------|---------|-------------|
| Rate limit for sending emails | 1 per 60 seconds | Signup confirmation, password reset |
| Rate limit for token requests | Varies | Sign in attempts |
| SMTP hard limit | 1 email/second | Cannot be changed (server-side) |

### To Loosen for Development

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Rate Limits**
3. Reduce "Minimum interval between emails" (e.g., 60s → 5s)
4. Increase "Max emails per hour" if needed

### Alternative: Disable Email Confirmation

1. **Authentication** → **Providers** → **Email**
2. Toggle off **"Confirm email"**
3. Users can sign in immediately without verification

---

## Pending Validation

| # | Track | What to Validate | Validation SQL | Status |
|---|-------|------------------|----------------|--------|
| 1 | Track D | `auth_provider_id` column exists in users table | `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_provider_id';` | Pending |
| 2 | Track D | User record is linked to auth user | `SELECT id, auth_provider_id, email, role FROM public.users;` | Pending |
| 3 | Track D | RLS policies exist for all tables | `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';` | Pending |
| 4 | Track D | RPC function `create_user_on_signup` exists | `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'create_user_on_signup';` | Pending |
| 5 | Track D | Test projects exist for consumer | `SELECT id, title FROM public.projects;` | Pending |
| 6 | Track D | Supplier RLS policies work | Test supplier signup and leads access | Pending |

---

## Decision Log

| # | Date | Decision | Made By | Notes |
|---|------|----------|---------|-------|
| 1 | 2025-12-08 | Use RPC instead of DB trigger for user creation | Dev | Database triggers on `auth.users` were unreliable; RPC called after email verification is more predictable |
| 2 | 2025-12-08 | Add `auth_provider_id` to users table manually | Dev | Schema was out of sync; added column via SQL Editor |

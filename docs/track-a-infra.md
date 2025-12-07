# Track A: Dev Environment & Infra

> **Notion Sources:**  
> - Phase 0 – Set up dev environment - `39ad543d4d0e44188793052e1a05d148`  
> - Connect Supabase project to repo - `01feead0f1064e0385dc38c39426a638`  
> - Proposed Workflow - `2bd8ba18fd6580c6a549f3dfee843cb8`  
> **Status:** Complete

---

## Overview

This track establishes the development environment and infrastructure:
- Supabase project linking
- Environment configuration
- CLI setup for migrations
- Vercel deployment verification

---

## Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| A1 | Create `supabase/` folder structure | 30m | Done |
| A2 | Configure Supabase CLI and link project | 45m | Done |
| A3 | Set up environment variables (.env) | 30m | Done |
| A4 | Verify local app runs | 30m | Done |

---

## A1: Supabase Folder Structure (Done)

The folder already exists with:

```
supabase/
├── config.toml                           # Contains project_id (see file for value)
└── migrations/
    └── 00000000000000_initial_schema.sql # ~470 lines, full ERD
```

---

## A2: Supabase CLI Setup

### Prerequisites

```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### Link Project

```bash
cd supabase

# Login (opens browser for OAuth)
supabase login

# Link to remote project (get project-ref from supabase/config.toml)
supabase link --project-ref <your-project-ref>

# Verify link
supabase migration list
```

### Push Migrations

```bash
# See what would change
supabase db diff --linked

# Push migrations to remote
supabase db push
```

### Expected Output

After `supabase migration list`:
```
LOCAL      | REMOTE     | NAME
───────────┼────────────┼──────────────────────────────────
Applied    | Applied    | 00000000000000_initial_schema.sql
```

---

## A3: Environment Variables (Done)

**Location:** `app/.env`

```env
# Supabase Configuration (get values from Supabase dashboard or supabase/config.toml)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

# App Configuration
VITE_APP_ENV=development
```

Variables configured with both `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` for compatibility.

---

## A4: Vercel Deployment Verification

### Check Deployment Status

1. Go to [Vercel Dashboard](https://vercel.com)
2. Find the renomate project
3. Verify:
   - Build succeeds
   - Environment variables are set
   - Domain is accessible

### Set Vercel Environment Variables

In Vercel project settings, add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | All |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `<anon-key>` | All |
| `VITE_APP_ENV` | `production` | Production |
| `VITE_APP_ENV` | `development` | Preview |

### Test Deployment

```bash
# Run app locally
cd app
npm install
npm run dev

# Visit http://localhost:5173
```

---

## Troubleshooting

### "Project not linked"

```bash
supabase link --project-ref <your-project-ref>
```

### "Invalid API key" in app

- Check `.env` file has correct keys
- Restart dev server after changing `.env`
- Verify keys in Supabase dashboard match

### Migrations not applying

```bash
# Check status
supabase migration list

# Force repair if needed
supabase migration repair --status applied 00000000000000
```

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Supabase project created | Track B (ERD in database) |
| GitHub repo | Track C (RLS policies) |
| | Track D (App connects to real data) |

---

## Checklist

- [x] Supabase folder exists
- [x] config.toml has project ID
- [x] Initial migration file exists
- [x] app/.env configured
- [x] Supabase CLI installed (v2.65.5)
- [x] Project linked
- [x] Migrations pushed
- [x] Local app runs and connects to Supabase
- [ ] Vercel env vars set (optional - for production)

# Renomate

Monorepo for the Renomate platform - a home renovation marketplace connecting consumers with suppliers.

## Structure

```
renomate/
├── app/           # Lovable-generated web application (Vite + React + TypeScript)
├── design/        # Design system, tokens, and shared UI components
├── supabase/      # Database migrations and Supabase configuration
└── package.json   # Workspace configuration
```

### Packages

- **`/app`** - Consumer and supplier-facing web application
  - Built with Vite, React, TypeScript, and Tailwind CSS
  - Uses shadcn/ui components
  - Connects to Supabase for backend

- **`/design`** - Shared design system (renomate-design)
  - Design tokens (colors, typography, spacing)
  - Shared UI components
  - Can be imported by the app package

- **`/supabase`** - Database infrastructure
  - Supabase CLI configuration
  - SQL migrations for schema changes
  - RLS policies and database functions

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. Install dependencies

```bash
# Install app dependencies
cd app && npm install

# Install design package dependencies (if needed)
cd ../design && npm install
```

### 2. Configure environment variables

Create `app/.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** Never commit real keys to Git. Use `.env.example` as a template.

### 3. Run database migrations

```bash
cd supabase

# Link to your Supabase project (first time only)
supabase link --project-ref pazovpmbmhvbinbirzok

# Push migrations to dev database
supabase db push
```

### 4. Start the app

```bash
cd app
npm run dev
```

The app will be available at `http://localhost:5173`

## Development Workflow

### Database Changes

1. Create a new migration file in `supabase/migrations/`
2. Write your SQL schema changes
3. Run `supabase db push` to apply to dev
4. Commit the migration file to Git

### Design System

The design package exports shared components and tokens. To use in the app:

```typescript
// Future: import from design package
import { Button } from '@renomate/design';
```

## Project Documentation

Detailed specs and PRDs are maintained in Notion:
- Platform Technical Requirements
- Data Model & ERD
- UI/UX Design System
- Project State Machine Logic
- Blind Spot Engine Logic

## Environment Strategy

| Environment | Supabase Project | Usage |
|-------------|------------------|-------|
| Local/Dev   | renomate-dev     | Development and testing |
| Staging     | renomate-staging | Pre-production validation |
| Production  | renomate-prod    | Live application |

## License

Private - All rights reserved

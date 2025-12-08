# Track D: Core App Shell

> **Notion Sources:**  
> - Generate initial Lovable app shell - `2bd8ba18fd65806289c0fdb2ab9994b3`  
> - Consumer User Journey - `2bc8ba18fd658072b4bcf0743aa39216`  
> - Supply-side User Journey - `dcd9a321884f44b5b4d0cdec2ceb8c46`  
> - Apply Design System PRD - `design-system-prd-id`  
> **Status:** In Progress (Auth complete, Consumer flow working)

---

## Overview

This track refines the Lovable-generated app shell to:
- Connect to real Supabase data (replace mocks)
- Implement proper type definitions from ERD
- Build consumer and supplier views
- Apply design system tokens

---

## Current State

The `app/` folder contains a Lovable-generated React app with:

```
app/src/
├── components/
│   ├── shared/         # AppLayout, EmptyState, LoadingState, etc.
│   └── ui/             # shadcn/ui components
├── contexts/
│   └── RoleContext.tsx # Consumer/Supplier role switching
├── integrations/
│   └── supabase/       # Client + types (auto-generated)
├── lib/
│   ├── repositories/   # mockData.ts, projectRepository.ts
│   ├── types.ts        # Placeholder types
│   └── utils.ts
└── pages/
    ├── consumer/       # ProjectsList, ProjectDetail
    ├── supplier/       # LeadsList, LeadDetail
    └── Index.tsx       # Landing/role selector
```

---

## Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| D1 | Update types.ts to match ERD | 60m | ✅ Complete |
| D2 | Replace mock repositories with Supabase queries | 90m | ✅ Complete |
| D3 | Consumer: Projects list with real data | 60m | ✅ Complete |
| D4 | Consumer: Project detail view | 90m | ✅ Complete |
| D5 | Supplier: Leads list (invites) with real data | 60m | ✅ Complete |
| D6 | Supplier: Lead detail + quote view | 90m | ✅ Complete |
| D7 | Apply design system tokens | 60m | ✅ Complete |
| D8 | Add auth flow (login/signup) | 90m | ✅ Complete |

### Additional Work Completed

| Task | Notes |
|------|-------|
| Email confirmation flow | Added `/auth/confirm` page with token verification |
| Resend confirmation email | Added to Login page for unconfirmed users |
| RPC for user creation | Replaced unreliable database trigger with `create_user_on_signup` RPC |
| Schema fix: auth_provider_id | Added missing column to `users` table |
| RLS policies | Fixed policies for users, consumer_profiles, supplier_profiles, projects |

---

## D1: Update Types from ERD

Replace `app/src/lib/types.ts` with types matching the database schema.

### Key Types to Define

```typescript
// User & Profile types
export interface User {
  id: string;
  auth_provider_id: string;
  role: 'consumer' | 'supplier' | 'admin' | 'ops';
  email: string | null;
  phone: string | null;
  full_name: string | null;
  whatsapp_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsumerProfile {
  user_id: string;
  location_city: string | null;
  location_area: string | null;
  preferred_style: string | null;
  budget_tier: 'low' | 'mid' | 'premium' | null;
}

export interface SupplierProfile {
  id: string;
  user_id: string | null;
  company_name: string;
  trade_type: string;
  coverage_cities: string[];
  min_project_value: number | null;
  max_project_value: number | null;
  styles: string[];
  status: 'pending_review' | 'active' | 'suspended';
  created_at: string;
}

// Project types
export interface Project {
  id: string;
  consumer_id: string;
  title: string;
  status: ProjectStatus;
  location_city: string | null;
  location_area: string | null;
  property_type: string | null;
  estimated_budget_min: number | null;
  estimated_budget_max: number | null;
  start_date_desired: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 
  | 'draft' 
  | 'ready_for_review' 
  | 'open_for_bids' 
  | 'sourcing' 
  | 'execution' 
  | 'completed' 
  | 'canceled';

// ... more types for Room, LineItem, Quote, etc.
```

---

## D2: Replace Mock Repositories

### Current Mock Pattern

```typescript
// lib/repositories/mockData.ts
export const mockProjects = [/* hardcoded data */];

// lib/repositories/projectRepository.ts
export const getProjects = async () => mockProjects;
```

### Target Pattern

```typescript
// lib/repositories/projectRepository.ts
import { supabase } from '@/integrations/supabase/client';

export const getProjects = async (consumerId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('consumer_id', consumerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getProjectWithDetails = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      rooms (*),
      line_items (*),
      project_packs (*)
    `)
    .eq('id', projectId)
    .single();
  
  if (error) throw error;
  return data;
};
```

---

## D3-D4: Consumer Views

### Projects List

- Show all projects for logged-in consumer
- Display: title, status badge, location, budget range, created date
- Actions: Create new, view details, archive

### Project Detail

- Header: title, status, dates
- Rooms section: list rooms with renovation depth
- Line items: grouped by room or category
- Pack status: draft/published indicator
- Quotes received: count and summary

---

## D5-D6: Supplier Views

### Leads List (Invites)

- Show `project_supplier_invites` for logged-in supplier
- Display: project title, fit score, decision status, invite date
- Filter by: pending, accepted, declined

### Lead Detail

- Project pack view (read-only)
- Scope selection (which rooms/items to quote)
- Quote submission form
- Sample eligibility indicators

---

## D7: Design System

### Color Tokens (from Notion)

```css
:root {
  --color-primary: #2563eb;      /* Blue */
  --color-secondary: #64748b;    /* Slate */
  --color-success: #22c55e;      /* Green */
  --color-warning: #f59e0b;      /* Amber */
  --color-error: #ef4444;        /* Red */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
}
```

### Status Badge Colors

| Status | Color | Background |
|--------|-------|------------|
| draft | gray | gray-100 |
| ready_for_review | amber | amber-100 |
| open_for_bids | blue | blue-100 |
| sourcing | purple | purple-100 |
| execution | orange | orange-100 |
| completed | green | green-100 |
| canceled | red | red-100 |

---

## D8: Auth Flow

### Pages to Create

1. `/login` - Email/password or magic link
2. `/signup` - Role selection + profile creation
3. `/forgot-password` - Password reset flow

### Auth Context

```typescript
// contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ConsumerProfile | SupplierProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile from our users table
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('auth_provider_id', session.user.id)
            .single();
          setUser(data);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Track A (env configured) | Real data in UI |
| Track B (ERD pushed) | Supabase queries work |
| Track C (RLS in place) | Secure data access |

---

## Open Questions

1. Should auth use email/password, magic link, or social (Google)?
2. Do we need separate onboarding flows for consumer vs supplier?
3. Should supplier profiles require approval before accessing leads?

# Track G: Logging & Hardening

> **Notion Sources:**  
> - Add basic logging and harden RLS for pilot - `logging-prd-id`  
> - Platform Technical Requirements - `0bf559323d154c86a38395e5170a1e2c`  
> **Status:** Not Started

---

## Overview

This track prepares the MVP for pilot users:
- Add structured logging for key flows
- Harden RLS policies for production
- Add input validation and error handling
- Set up basic monitoring

---

## Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| G1 | Add audit logging for key actions | 60m | Not Started |
| G2 | Harden RLS policies (review all policies) | 90m | Not Started |
| G3 | Add input validation on critical endpoints | 60m | Not Started |
| G4 | Set up error tracking (Sentry or similar) | 45m | Not Started |
| G5 | Add rate limiting on public endpoints | 45m | Not Started |
| G6 | Security review checklist | 60m | Not Started |

---

## G1: Audit Logging

The `audit_logs` table already exists in the schema:

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users (id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Key Actions to Log

| Action | Entity Type | When |
|--------|-------------|------|
| `project.created` | project | New project created |
| `project.status_changed` | project | Status transition |
| `pack.published` | project_pack | Pack sent to suppliers |
| `invite.sent` | project_supplier_invite | Supplier invited |
| `invite.accepted` | project_supplier_invite | Supplier accepts |
| `invite.declined` | project_supplier_invite | Supplier declines |
| `quote.submitted` | quote | Quote submitted |
| `quote.accepted` | quote | Consumer accepts quote |

### Logging Function

```sql
CREATE OR REPLACE FUNCTION log_audit(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, entity_type, entity_id, old_values, new_values
  ) VALUES (
    p_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger Example

```sql
CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM log_audit(
      auth.uid(),
      'project.status_changed',
      'project',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_project_status
  AFTER UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION audit_project_changes();
```

---

## G2: RLS Hardening

### Review Checklist

| Table | Consumer | Supplier | Admin | Notes |
|-------|----------|----------|-------|-------|
| users | Own only | Own only | All | ✅ |
| projects | Own only | Invited only | All | Check invite join |
| rooms | Via project | Via invite | All | Nested access |
| line_items | Via project | Via invite | All | Nested access |
| quotes | View own project | CRUD own | All | Supplier isolation |
| tasks | Via project | Assigned only | All | Assignment check |

### Common RLS Issues to Fix

1. **Missing `WHERE` clauses** - Ensure all policies have proper predicates
2. **Overly permissive INSERT** - Add `WITH CHECK` constraints
3. **Missing DELETE policies** - Soft delete vs hard delete
4. **Admin bypass gaps** - Ensure `auth.is_admin()` covers all cases

### Example Hardened Policy

```sql
-- Before (too permissive)
CREATE POLICY "Suppliers can view projects"
  ON public.projects FOR SELECT
  USING (true);  -- BAD!

-- After (properly scoped)
CREATE POLICY "Suppliers can view invited projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_supplier_invites psi
      WHERE psi.project_id = projects.id
      AND psi.supplier_id = auth.supplier_id()
      AND psi.decision_status IN ('pending', 'accepted')  -- Only active invites
    )
    OR auth.is_admin()
  );
```

---

## G3: Input Validation

### Edge Function Validation Pattern

```typescript
// supabase/functions/submit-quote/index.ts
import { z } from 'zod';

const QuoteSubmissionSchema = z.object({
  project_id: z.string().uuid(),
  quote_type: z.enum(['design', 'contracting', 'materials']),
  line_items: z.array(z.object({
    line_item_id: z.string().uuid(),
    unit_price: z.number().positive(),
    quantity: z.number().positive(),
  })).min(1),
  valid_until: z.string().datetime().optional(),
});

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const validated = QuoteSubmissionSchema.parse(body);
    
    // Process validated data...
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400 }
      );
    }
    throw error;
  }
});
```

### Client-Side Validation

Use React Hook Form + Zod for form validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const projectSchema = z.object({
  title: z.string().min(3).max(100),
  location_city: z.string().min(2),
  estimated_budget_min: z.number().positive(),
  estimated_budget_max: z.number().positive(),
}).refine(
  (data) => data.estimated_budget_max >= data.estimated_budget_min,
  { message: "Max budget must be >= min budget" }
);
```

---

## G4: Error Tracking

### Sentry Setup

```typescript
// app/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error }) => (
      <div className="error-page">
        <h1>Something went wrong</h1>
        <p>We've been notified and are working on it.</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    ),
  }
);
```

---

## G5: Rate Limiting

### Supabase Edge Function Rate Limiting

```typescript
// Simple in-memory rate limiter (use Redis for production)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimits.get(ip);
  
  if (!record || record.resetAt < now) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// In handler:
const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
if (!checkRateLimit(clientIp)) {
  return new Response('Too Many Requests', { status: 429 });
}
```

---

## G6: Security Review Checklist

### Before Pilot Launch

- [ ] All RLS policies reviewed and tested
- [ ] No `true` policies without admin check
- [ ] Service role key not exposed in frontend
- [ ] Environment variables not in git
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured correctly
- [ ] Input validation on all forms
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging active for key actions
- [ ] Rate limiting on public endpoints
- [ ] Magic link tokens are single-use and time-limited

### Supabase Security Settings

1. **Auth settings:** Disable signup if not needed
2. **API settings:** Review exposed schemas
3. **Edge functions:** Verify JWT verification is enabled
4. **Storage:** Check bucket policies

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Track C (RLS baseline) | Hardening builds on baseline |
| Track E (Engines) | Log engine actions |
| Track F (WhatsApp) | Log messaging events |

---

## Notes

- MVP logging is basic; expand for production
- Consider PII handling in audit logs
- Rate limits may need tuning based on usage

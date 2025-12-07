# Cursor Working Rules for Renomate

> **Last Updated:** 2025-12-07  
> **Purpose:** Operating rules for AI-assisted development on Renomate MVP

---

## 1. Source of Truth

### 1.1 Notion is Canonical
- **All specs, PRDs, and logic definitions live in Notion**
- If code, intuition, or external docs disagree with Notion → Notion wins
- Before making changes, verify they align with the relevant Notion page(s)

### 1.2 Key Notion Pages
| Domain | Page | Notion ID |
|--------|------|-----------|
| Architecture | Platform Technical Requirements | `0bf559323d154c86a38395e5170a1e2c` |
| Schema | Data Model & ERD (Supabase Specs) | `9f5c77073a5f4a6fb8dc60e79b50ea67` |
| Security | Row Level Security (RLS) Matrix | `1bc01dc6d0fe4ce68b4bb5d00bd0c1f9` |
| Pack Logic | Project Pack Generator Logic | `7221cbc554804cf49f77bb2f5727d2de` |
| Risk Logic | Blind Spot Engine Logic | `107b74bc93c14d9c9623801144b8d7e3` |
| Matching | Fit Scoring Engine Logic | `99880afbf29e47f39d372a7c8f9a6a94` |
| States | Project State Machine Logic | `12d1addf86a84269b2f3c310cf4917ed` |
| Messaging | WhatsApp Integration Flows | `00897dd8f69c4decab114120aa649b43` |

---

## 2. Non-Negotiable Constraints

### 2.1 MUST NOT
- ❌ Change high-level architecture (Supabase + Vercel + Lovable/Cursor stack)
- ❌ Introduce new external services without explicit approval
- ❌ Loosen security or RLS (no broad `true` policies without discussion)
- ❌ Invent product features, tables, states, or flows not in Notion
- ❌ Silently resolve conflicts between Notion pages

### 2.2 MUST
- ✅ Keep migrations and RLS in sync with ERD and RLS Matrix
- ✅ Cite Notion page(s) when proposing implementation
- ✅ Flag conflicts clearly and propose options before proceeding
- ✅ Label anything not in Notion as "Proposed extension — requires spec update"
- ✅ Ask for clarification when requirements are ambiguous

---

## 3. Code Standards

### 3.1 TypeScript/React
- Use TypeScript for all new code
- Types should match the ERD exactly (see `lib/types.ts`)
- Prefer functional components with hooks
- Use shadcn/ui components from `components/ui/`

### 3.2 Supabase
- All schema changes via migrations in `supabase/migrations/`
- Migration filenames: `YYYYMMDDHHMMSS_description.sql`
- RLS policies in separate migration files with `_rls` suffix
- Use `auth.uid()` for user context in RLS

### 3.3 Schema Change Workflow (IMPORTANT)

**To prevent docs/code/types drift, follow this workflow for ANY schema change:**

```
┌─────────────────────────────────────────────────────────────┐
│  SCHEMA CHANGE WORKFLOW (All 4 steps required!)            │
│                                                             │
│  1. MIGRATION  →  2. PUSH  →  3. TYPES  →  4. DOCS         │
│                                                             │
│  Write SQL        Apply to     Regenerate    Update        │
│  migration        database     TypeScript    track-b-erd   │
└─────────────────────────────────────────────────────────────┘
```

**Step-by-step:**

```bash
# 1. Create migration file
# supabase/migrations/YYYYMMDDHHMMSS_description.sql

# 2. Push to database
npm run db:push

# 3. Regenerate types (from app/ folder)
npm run db:types

# 4. Update docs/track-b-erd.md with the change
```

**Available npm scripts (run from app/ folder):**

| Script | Description |
|--------|-------------|
| `npm run db:push` | Push migrations to Supabase |
| `npm run db:types` | Generate TypeScript types from live database |
| `npm run db:status` | Show which migrations are applied |
| `npm run db:diff` | Show schema differences vs remote |

**Golden Rule:** The **database** is the source of truth for schema. Everything else is derived:
- `types.generated.ts` ← generated from database
- `track-b-erd.md` ← documents what's in database
- `lib/types.ts` ← imports from or extends generated types

### 3.4 File Organization
```
renomate/
├── app/src/
│   ├── components/           # UI components
│   ├── pages/                # Route pages
│   ├── lib/
│   │   ├── types.ts          # App-specific types (extends generated)
│   │   └── repositories/     # Data access (mock → real Supabase)
│   ├── integrations/supabase/
│   │   ├── types.ts          # Hand-maintained types (legacy)
│   │   └── types.generated.ts # AUTO-GENERATED - do not edit!
│   ├── contexts/             # React contexts
│   └── hooks/                # Custom hooks
├── supabase/
│   ├── migrations/           # SQL migrations (source of truth)
│   └── config.toml           # Supabase config
└── docs/                     # Planning and documentation
```

**⚠️ Never manually edit `types.generated.ts`** — it gets overwritten by `npm run db:types`

---

## 4. Planning & Documentation

### 4.1 Before Starting a Task
1. Identify the Notion page(s) that define the requirement
2. Check if the task is in `docs/renomate-plan.md`
3. Verify dependencies are complete

### 4.2 During Implementation
1. Follow the Notion spec exactly
2. If spec is unclear, add to Open Questions and ask
3. Comment TODOs with Notion page references

### 4.3 After Completing a Task
1. Update task status in `docs/renomate-plan.md`
2. If any spec was unclear or needed interpretation, note it in Rule Updates
3. If a spec needs updating, create a follow-up item (don't silently diverge)

---

## 5. Conflict Resolution

### 5.1 When Two Notion Pages Conflict
1. Do NOT silently choose one
2. Flag the conflict in `docs/renomate-plan.md` under Open Questions
3. Propose options and wait for decision

### 5.2 When Code and Notion Conflict
1. Assume Notion is correct
2. Propose code changes to align with Notion
3. If Notion appears outdated, flag it and ask

---

## 6. Communication Style

### 6.1 With the User ("Vibe Coder")
- Provide high-level explanations for non-trivial concepts
- Use concrete examples over jargon
- Offer 2-3 options when decisions are needed
- Summarize progress every 3-5 tasks

### 6.2 In Code Comments
- Reference Notion pages: `// Per ERD Section 2.1 (9f5c77...)`
- Mark incomplete items: `// TODO: Implement per Pack Generator Logic Section 3.2`
- Flag assumptions: `// ASSUMPTION: Using default waste factor of 10%`

---

## 7. Rule Update Process

When a rule needs to change:

1. **Propose** the change in `docs/renomate-plan.md` under "Rule Updates"
2. **Ask** for confirmation
3. **Update** this file once confirmed
4. **Never** remove rules — mark as "Deprecated" with reason

---

## 8. Changelog

| Date | Change | Reason |
|------|--------|--------|
| 2025-12-07 | Initial rules created | First planning session |
| 2025-12-07 | Added Schema Change Workflow (Section 3.3) | Prevent docs/code/types drift |
| 2025-12-07 | Added npm scripts for db operations | Standardize database workflows |
| 2025-12-07 | Updated file organization (Section 3.4) | Clarify generated vs manual types |

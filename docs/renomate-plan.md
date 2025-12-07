# Renomate MVP Build Plan

> **Last Updated:** 2025-12-07  
> **Status:** In Progress (Track A & B Complete, Ready for Track C)  
> **Notion is the SINGLE source of truth.** If code or intuition disagree with Notion, treat Notion as canonical.

---

## 1. Spec Map (Notion Pages Summary)

### Cluster 1: Platform & Journeys

| Page | Notion ID | Summary |
|------|-----------|---------|
| **Platform Technical Requirements** | `0bf559323d154c86a38395e5170a1e2c` | Master architecture doc defining MVP scope, 7 core domains (Identity, Projects, Inspiration, Sourcing, Sampling, Messaging, Security), tech stack (Supabase/Vercel/React), and implementation phases. |
| **Consumer User Journey** | `2bc8ba18fd658072b4bcf0743aa39216` | End-to-end homeowner flow: INSPIRE → DEFINE PROJECT → DESIGN → SOURCE → SAMPLING → MANAGE with detailed pain points and platform features per step. |
| **Supply-side User Journey** | `dcd9a321884f44b5b4d0cdec2ceb8c46` | Designer/contractor/supplier experience: DISCOVER LEADS → REVIEW PACK → PREPARE QUOTES → SAMPLING → EXECUTION → PERFORMANCE with fit scoring and structured briefs. |
| **MVP Build Plan** | `2bd8ba18fd65804fb0fcc18217167c16` | Task sequencing across 4 phases. Includes gap analysis identifying missing WhatsApp, Fit Scoring, and State Machine PRDs. |
| **Proposed Workflow** | `2bd8ba18fd6580c6a549f3dfee843cb8` | Development workflow: Notion (specs) → Lovable (scaffold) → Cursor (refine) → Supabase (backend). |

### Cluster 2: Data Model, Access & Engines

| Page | Notion ID | Summary |
|------|-----------|---------|
| **Data Model & ERD (Supabase Specs)** | `9f5c77073a5f4a6fb8dc60e79b50ea67` | Canonical PostgreSQL schema with ~20 tables: users, profiles, projects, rooms, line_items, project_packs, inspiration_*, project_supplier_invites, quotes, samples, tasks, etc. |
| **Row Level Security (RLS) Matrix** | `1bc01dc6d0fe4ce68b4bb5d00bd0c1f9` | Access control matrix for 3 roles (Consumer/Supplier/Admin). Defines per-table SELECT/INSERT/UPDATE/DELETE permissions. |
| **Project Pack Generator Logic** | `7221cbc554804cf49f77bb2f5727d2de` | Comprehensive pack generation: 9 input categories, material mapping, quantity estimation, labor estimation, validation rules, traffic-light confidence model. |
| **Blind Spot Engine (Risk & Feasibility) Logic** | `107b74bc93c14d9c9623801144b8d7e3` | Risk detection: structural, compliance/NOC, utilities, room-specific sequencing, timeline/budget pressure. Outputs auto-generated tasks and warnings. |
| **Fit Scoring Engine (Matching) Logic** | `99880afbf29e47f39d372a7c8f9a6a94` | Supplier matching: `Score = 0.5×BudgetMatch + 0.3×TradeMatch + 0.2×LocationMatch`. Hard filters exclude misfit suppliers. |
| **Project State Machine Logic** | `12d1addf86a84269b2f3c310cf4917ed` | State transitions for projects and rooms. Defines `lifecycle_state`, `execution_state`, and API contracts. |
| **Dynamic Quoting Logic** | `f5923fe82d5e4db7bd1b8d22e034ee26` | Quote validation: per-line-item quoting, flags prices >20% deviation from baselines. Payments out of MVP scope. |

### Cluster 3: WhatsApp, Messaging & Examples

| Page | Notion ID | Summary |
|------|-----------|---------|
| **WhatsApp Integration Flows** | `00897dd8f69c4decab114120aa649b43` | WhatsApp-first strategy: phone→project mapping, "YES" reply triggers sourcing, whatsapp_threads/messages tables, webhook logic. |
| **Create WhatsApp module tables** | `bc0dcf94660d41ec84b374622597ceb7` | Task PRD for WhatsApp schema migration. |
| **Implement WhatsApp webhook handler** | `a66aca3548ec43c3b332d52c5ff6e8b5` | Task PRD for webhook endpoint and business logic. |
| **Example Project Pack – 2BR Apartment** | `20ca78ca70a54da3972f5c7a458d0f0f` | Concrete example pack for testing and validation. |

### Cluster 4: Tasks DB PRDs

| Page | Notion ID | Summary |
|------|-----------|---------|
| **Phase 0 – Set up dev environment** | `39ad543d4d0e44188793052e1a05d148` | GitHub org, repos, CI/CD, Vercel. **Status: Done** (monorepo consolidated). |
| **Generate initial Lovable app shell** | `2bd8ba18fd65806289c0fdb2ab9994b3` | Consumer + supplier UI scaffold with navigation, project/lead views, mock services. |
| **Connect Supabase to repo** | `01feead0f1064e0385dc38c39426a638` | Supabase CLI setup, migrations folder, env variables. |
| **Apply core ERD schema** | `b6162aee987f46d0893d59a937c6ec18` | Migration files for all ERD tables. |
| **Implement MVP RLS baseline** | `5916cf0b9a2b4c88a80966b688386e27` | RLS policies for consumers, suppliers, admin. |
| **Apply Design System** | `903d9a39bd454941ba22bf396455de3c` | Colors, typography, buttons, cards, nav styling. |
| **Implement Pack Generator backend** | `2d143b6d4e834e45b3c8422faaf4ff3f` | Edge function/API for pack generation. |
| **Wire Pack Generator UI** | `38a1c75b92e0448380a352fb5ad28de4` | Consumer wizard for pack inputs, pack display. |
| **Implement Blind Spot Engine** | `1c573b3b71cb408eb434fcd0672049f9` | Rule evaluation and task auto-generation. |
| **Implement State Machine APIs** | `8d28c20b584742708eb788748ce58253` | State transition endpoints with preconditions. |
| **Implement Fit Scoring Engine** | `3bcfd76522c84556819b6a20dd64fe6b` | Scoring service writing fit_score to invites. |
| **Add logging and harden RLS** | `864226740e5f4779b9d0461aaf5dfa84` | Structured logging, RLS audit. |

---

## 2. Connection Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PLATFORM & JOURNEYS                                  │
│   Platform TRs ←→ Consumer Journey ←→ Supply-side Journey               │
│         ↓              ↓                    ↓                           │
│   (defines scope, domains, tech stack, MVP outcomes)                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATA MODEL & ACCESS                                  │
│                  ERD (Supabase Specs) ←→ RLS Matrix                     │
│   (canonical schema for ~20 tables + access rules per role/table)       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          ENGINES                                         │
│   Pack Generator ←→ Blind Spot Engine ←→ Fit Scoring ←→ State Machine  │
│                            ↓                                            │
│                    Dynamic Quoting Logic                                │
│   (all consume project/room/pack data → produce tasks, scores, flags)   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                   WHATSAPP & MESSAGING                                   │
│   WhatsApp Integration Flows → whatsapp_threads/messages tables         │
│   (phone→project mapping, webhook, "YES"→sourcing transition)           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    APP SHELL & TASKS PRDs                                │
│   Lovable App Shell → Design System → Pack UI → Engines UI              │
│   (implement and orchestrate all of the above into working product)     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Current Codebase State

**Repo:** `/Users/zhen/Documents/Projects/renomate/renomate`

### What Exists
- ✅ Monorepo structure with `app/`, `design/`, `supabase/` folders
- ✅ Lovable-generated React/TypeScript app shell
- ✅ Consumer views: ProjectsList, ProjectDetail
- ✅ Supplier views: LeadsList, LeadDetail
- ✅ Mock repositories with sample data (aligned with ERD)
- ✅ UI components from shadcn/ui
- ✅ Types defined in `lib/types.ts` (synced with ERD 2025-12-07)
- ✅ Supabase types in `integrations/supabase/types.ts` (synced with ERD 2025-12-07)
- ✅ `supabase/` folder with config and migrations
- ✅ ERD schema applied to database (25+ tables)
- ✅ Alignment migration for enum values (projects.status, tasks.priority, tasks.source)
- ✅ Environment variables configured (app/.env)
- ✅ Local dev server runs on localhost:8081
- ✅ App folder committed to git (fixed gitlink issue)
- ✅ Vercel deployment configured with env vars

### What's Missing
- ❌ Real Supabase connection in UI (app still uses mocks)
- ❌ RLS policies
- ❌ Backend services for engines
- ❌ WhatsApp webhook
- ❌ Auth flow (login/signup)

### Supabase Project
- **Project Ref:** See `supabase/config.toml`
- **Status:** Connected, ERD pushed, CLI linked

---

## 4. Implementation Tracks

### Track A: Dev Environment & Infra ✅
**Notion Inputs:** Phase 0, Connect Supabase PRD, Proposed Workflow

| ID | Task | Est. | Status |
|----|------|------|--------|
| A1 | Create `supabase/` folder structure | 30m | Done |
| A2 | Configure Supabase CLI and link project | 45m | Done |
| A3 | Set up environment variables (.env) | 30m | Done |
| A4 | Verify local app runs | 30m | Done |

**Completed:** Supabase CLI v2.65.5 installed, project linked, migrations pushed, app running on localhost:8081, Vercel deployed with env vars.

### Track B: Data Model & ERD ✅
**Notion Inputs:** Data Model & ERD (Supabase Specs)

| ID | Task | Est. | Status |
|----|------|------|--------|
| B1 | Migration: Core Identity (users, consumer_profiles, supplier_profiles) | 45m | Done |
| B2 | Migration: Projects, Rooms, Line Items | 60m | Done |
| B3 | Migration: Project Packs | 30m | Done |
| B4 | Migration: Inspiration module | 45m | Done |
| B5 | Migration: Supplier Matching, Invites, Quotes | 60m | Done |
| B6 | Migration: Sampling & Showroom Visits | 45m | Done |
| B7 | Migration: Tasks, Dependencies, Change Orders, Payments | 45m | Done |
| B7b | Migration: WhatsApp tables (threads, messages) | 30m | Done |
| B7c | Migration: Audit logs | 15m | Done |
| B8 | Add State Machine columns to rooms | 30m | Done |
| B9 | Push migrations and verify schema | 30m | Done |
| B10 | Alignment migration: fix status/priority/source enums | 15m | Done |

**Completed:** All 25+ tables pushed to Supabase. Alignment migration applied to fix enum values to match ERD docs.

### Track C: RLS Baseline
**Notion Inputs:** RLS Matrix, Implement MVP RLS baseline PRD

| ID | Task | Est. | Status |
|----|------|------|--------|
| C1 | RLS: users and profiles | 45m | Not Started |
| C2 | RLS: projects and rooms | 60m | Not Started |
| C3 | RLS: project_supplier_invites | 45m | Not Started |
| C4 | RLS: quotes and quote_line_items | 45m | Not Started |
| C5 | RLS: samples and showroom_visits | 45m | Not Started |
| C6 | RLS: tasks | 45m | Not Started |
| C7 | Admin bypass policies | 30m | Not Started |
| C8 | Test RLS with different user roles | 60m | Not Started |

### Track D: Core App Shell
**Notion Inputs:** Lovable App Shell PRD, Consumer Journey, Supply-side Journey

| ID | Task | Est. | Status |
|----|------|------|--------|
| D1 | Connect app to real Supabase (replace mocks) | 60m | Not Started |
| D2 | Update types.ts to match ERD exactly | 45m | Done |
| D3 | Implement auth context with Supabase Auth | 60m | Not Started |
| D4 | Consumer: Enhance Projects List with real data | 45m | Not Started |
| D5 | Consumer: Enhance Project Detail with rooms/tasks | 60m | Not Started |
| D6 | Consumer: Add Project Pack summary panel | 45m | Not Started |
| D7 | Supplier: Enhance Leads List with fit scores | 45m | Not Started |
| D8 | Supplier: Enhance Lead Detail with pack snapshot | 60m | Not Started |
| D9 | Apply Design System tokens | 60m | Not Started |

**Partial Progress:** D2 completed - `app/src/lib/types.ts` and `app/src/integrations/supabase/types.ts` now aligned with ERD.

### Track E: Engines
**Notion Inputs:** Pack Generator, Blind Spot, Fit Scoring, State Machine Logic docs

| ID | Task | Est. | Status |
|----|------|------|--------|
| E1 | Pack Generator service skeleton | 60m | Not Started |
| E2 | Pack: material mapping logic | 90m | Not Started |
| E3 | Pack: quantity estimation | 90m | Not Started |
| E4 | Pack: labor estimation | 60m | Not Started |
| E5 | Pack: validation & confidence model | 60m | Not Started |
| E6 | Blind Spot Engine service | 60m | Not Started |
| E7 | Blind Spot: structural & compliance rules | 60m | Not Started |
| E8 | Blind Spot: room-specific sequencing | 60m | Not Started |
| E9 | Fit Scoring Engine service | 45m | Not Started |
| E10 | Fit: BudgetMatch, TradeMatch, LocationMatch | 60m | Not Started |
| E11 | State Machine: transition APIs | 60m | Not Started |
| E12 | State Machine: room lifecycle transitions | 60m | Not Started |
| E13 | State Machine: room execution transitions | 45m | Not Started |
| E14 | State Machine: project status transitions | 45m | Not Started |

### Track F: WhatsApp / Messaging
**Notion Inputs:** WhatsApp Integration Flows, WhatsApp module tables PRD

| ID | Task | Est. | Status |
|----|------|------|--------|
| F1 | Migration: whatsapp_threads, whatsapp_messages | 45m | Done (in B7b) |
| F2 | RLS for WhatsApp tables | 30m | Not Started |
| F3 | Webhook endpoint skeleton | 60m | Not Started |
| F4 | Phone normalization & thread resolution | 60m | Not Started |
| F5 | "YES" reply → sourcing transition | 60m | Not Started |
| F6 | Magic link generation for suppliers | 45m | Not Started |

**Note:** F1 tables already created in initial migration (Track B7b). RLS and implementation pending.

### Track G: Logging & Hardening
**Notion Inputs:** Add basic logging and harden RLS PRD

| ID | Task | Est. | Status |
|----|------|------|--------|
| G1 | Set up structured logging service | 60m | Not Started |
| G2 | Add logging to key flows | 60m | Not Started |
| G3 | RLS audit: review all policies | 60m | Not Started |
| G4 | Add request logging middleware | 45m | Not Started |

---

## 5. Recommended Execution Order

Based on dependencies:

1. **Track A (A1-A4)**: Infra setup — enables all other tracks
2. **Track B (B1-B9)**: ERD migrations — required before app uses real data
3. **Track C (C1-C8)**: RLS — required for secure data access
4. **Track D (D1-D5)**: Core app shell with real Supabase
5. **Track E (E1-E14)**: Engines — parallel with Track D after ERD
6. **Track F (F1-F6)**: WhatsApp — after Track B base tables
7. **Track G (G1-G4)**: Hardening — final phase before pilot

---

## 6. Open Questions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | Auth Strategy: Full Supabase Auth now or continue mocks? | Open | |
| 2 | WhatsApp Provider: Meta Cloud API vs Twilio? | Open | |
| 3 | Design System: Use existing shadcn or custom tokens? | Open | |

---

## 7. Rule Updates

| Date | Change | Reason |
|------|--------|--------|
| 2025-12-07 | Initial plan created | First planning session |
| 2025-12-07 | Track A fully complete | Fixed app/ gitlink, deployed to Vercel with env vars |
| 2025-12-07 | Track B alignment migration added | Fixed discrepancies between ERD docs and initial migration (status/priority/source enums) |
| 2025-12-07 | App types synced with ERD | Updated `lib/types.ts` and `integrations/supabase/types.ts` to match DB schema |
| 2025-12-07 | Track B docs updated | Added documentation for change_orders, payments, whatsapp, and audit_logs tables |

---

## 8. Related Docs

- [Cursor Working Rules](./cursor-working-rules.md)
- [Track A: Infra](./track-a-infra.md) ✅
- [Track B: ERD](./track-b-erd.md) ✅
- [Track C: RLS](./track-c-rls.md)
- [Track D: App Shell](./track-d-app-shell.md)
- [Track E: Engines](./track-e-engines.md)
- [Track F: WhatsApp](./track-f-whatsapp.md)
- [Track G: Logging](./track-g-logging.md)

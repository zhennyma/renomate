# Track E: Engines

> **Status:** Not Started

---

## Overview

This track implements the four core engines that power Renomate's intelligence:

1. **Pack Generator** - Transforms consumer inputs into structured project packs
2. **Blind Spot Engine** - Detects risks and auto-generates compliance tasks
3. **Fit Scoring Engine** - Matches projects to suppliers (0-100 score)
4. **State Machine** - Enforces valid project/room transitions

---

## Engine 1: Project Pack Generator

> **Notion Source:** Project Pack Generator Logic - `7221cbc554804cf49f77bb2f5727d2de`

### Purpose

Turn consumer inputs into actionable project packs that:
- Suppliers can quote against
- Feed the Fit Scoring Engine
- Power the Blind Spot Engine
- Drive the State Machine transitions

### Key Inputs (9 categories from Notion spec)

1. **Property & Context** - type, developer, location, occupancy
2. **Overall Project Scope** - rooms, renovation depth, timeline, budget
3. **Building Constraints** - working hours, MEP context, structural shell
4. **Existing Condition** - current finishes, known issues
5. **Layout Requirements** - templates, must-keep elements
6. **Style Preferences** - tags, palette, materials, inspiration refs
7. **Comfort Requirements** - thermal, noise, lighting
8. **Supplier Preferences** - design+build vs build-only
9. **Risk Tolerance** - conservative vs ambitious

### Traffic Light Confidence Model

| Status | Meaning | Behavior |
|--------|---------|----------|
| **Green** | All inputs present | Full pack generated, high confidence |
| **Amber** | Minimum inputs present | Pack generated with defaults flagged |
| **Red** | Missing critical inputs | No pack, return blocking questions |

### Output Structure

```typescript
interface ProjectPack {
  project_id: string;
  property_context: PropertyContext;
  budget: BudgetInfo;
  style_profile: StyleProfile;
  status_flags: 'green' | 'amber' | 'red';
  risks: RiskFlag[];
  rooms: RoomPack[];
}

interface RoomPack {
  room_id: string;
  room_type: string;
  dimensions: Dimensions;
  scope: 'light' | 'medium' | 'full';
  design_spec: MaterialSelections;
  quantities: QuantityEstimates;
  labour: LabourEstimates;
  budget_allocation: number;
  assumptions: string[];
}
```

### Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| E1 | Pack Generator service skeleton | 60m | Not Started |
| E2 | Material mapping logic (style x budget x room) | 90m | Not Started |
| E3 | Quantity estimation (floors, walls, paint, fixtures) | 90m | Not Started |
| E4 | Labor estimation (man-hours, crew sizes, duration) | 60m | Not Started |
| E5 | Validation and confidence model | 60m | Not Started |

---

## Engine 2: Blind Spot Engine

> **Notion Source:** Blind Spot Engine Logic - `107b74bc93c14d9c9623801144b8d7e3`

### Purpose

Proactively identify risks and missing steps:
- Sequencing conflicts (flooring before plumbing rough-in)
- Missing compliance (NOCs, permits, certifications)
- Critical path dependencies
- Timeline compression risks
- Long-lead item delays

### Rule Categories

| Category | Examples |
|----------|----------|
| **A. Structural** | Load-bearing walls, floor changes, new openings |
| **B. Compliance/NOC** | Building management, civil defense, municipality permits |
| **C. Utilities** | Gas relocation, electrical panel, HVAC, plumbing |
| **D. Room-Specific** | Kitchen/bathroom/living sequencing |
| **E. Timeline/Budget** | Compressed timelines, under-budget risks |

### Output Types

1. **Auto-add tasks** (mandatory)
   - Compliance tasks (NOC, permits, inspections)
   - Critical sequencing tasks (waterproofing, rough-in)
   - Standard dependencies

2. **Warnings** (non-blocking)
   - Timeline risks
   - Budget pressure flags
   - Coordination needs

### Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| E6 | Blind Spot Engine service skeleton | 60m | Not Started |
| E7 | Structural and compliance rules | 60m | Not Started |
| E8 | Room-specific sequencing rules | 60m | Not Started |

---

## Engine 3: Fit Scoring Engine

> **Notion Source:** Fit Scoring Engine Logic - `99880afbf29e47f39d372a7c8f9a6a94`

### Purpose

Calculate 0-100 fit score for each (project, supplier) pair.

### Formula

```
Score = 0.5 * BudgetMatch + 0.3 * TradeMatch + 0.2 * LocationMatch
```

### Hard Filters (exclude before scoring)

1. **Trade mismatch** - Supplier trade doesn't support project scope
2. **Min project value too high** - `supplier.min > project.max_budget`
3. **Location not covered** - Project city not in supplier coverage (optional)

### Sub-scores

**BudgetMatch (50% weight)**
```typescript
function budgetMatch(project, supplier): number {
  const pMin = project.estimated_budget_min;
  const pMax = project.estimated_budget_max;
  const sMin = supplier.min_project_value;
  const sMax = supplier.max_project_value;

  if (sMin && sMax) {
    if (pMin >= sMin && pMax <= sMax) return 100;  // Perfect fit
    if (pMax >= sMin && pMin <= sMax) return 70;   // Overlap
    if (pMax < sMin && pMax >= 0.8 * sMin) return 40;  // Slightly below
    return 10;  // Way outside
  }
  return 70;  // Incomplete data = neutral
}
```

**TradeMatch (30% weight)**
- 100: Perfect fit (bathroom project + bathroom specialist)
- 70: Good fit (bathroom project + general contractor)
- 40: Sub-optimal (multi-room + flooring specialist)

**LocationMatch (20% weight)**
- 100: City in supplier `coverage_cities`
- 40: Not in coverage but technically possible

### Storage

- Canonical: `project_supplier_invites.fit_score`
- Optional: `quotes.fit_score` (denormalized copy)

### Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| E9 | Fit Scoring Engine service skeleton | 45m | Not Started |
| E10 | Implement BudgetMatch, TradeMatch, LocationMatch | 60m | Not Started |

---

## Engine 4: State Machine

> **Notion Source:** Project State Machine Logic - `12d1addf86a84269b2f3c310cf4917ed`

### Purpose

Enforce valid transitions and prevent process errors.

### Project Status Flow

```
draft → ready_for_review → open_for_bids → sourcing → execution → completed
                                                                 ↘ canceled
```

### Room Lifecycle States

```
draft → open_for_bids → sourcing → execution → completed
                                            ↘ paused (can resume)
```

### Room Execution States

```
not_started → in_progress → ready_for_inspection → complete
                         ↘ rework_required ↗
```

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /rooms/:id/transition_lifecycle` | Change room lifecycle state |
| `POST /rooms/:id/transition_execution` | Change room execution state |
| `POST /projects/:id/transition_status` | Change project status |

### Key Preconditions

| Transition | Precondition |
|------------|--------------|
| draft → ready_for_review | Pack not Red |
| ready_for_review → open_for_bids | At least one room not draft, Pack Green/Amber |
| open_for_bids → sourcing | At least one room in sourcing |
| execution → completed | All rooms completed, no critical tasks open |
| any → paused | Store previous_lifecycle_state |

### Tasks

| ID | Task | Est. | Status |
|----|------|------|--------|
| E11 | State Machine transition APIs skeleton | 60m | Not Started |
| E12 | Room lifecycle transitions with preconditions | 60m | Not Started |
| E13 | Room execution transitions | 45m | Not Started |
| E14 | Project status transitions | 45m | Not Started |

---

## Implementation Approach

### Where to Implement

| Engine | Recommendation | Reason |
|--------|----------------|--------|
| Pack Generator | Supabase Edge Function | Complex logic, needs full TypeScript |
| Blind Spot | Supabase Edge Function | Rule evaluation, may call Pack data |
| Fit Scoring | Database Function (PL/pgSQL) | Simpler math, needs to be fast |
| State Machine | Database Function + API | Constraints in DB, API for validation |

### Data Flow

```
Consumer Input
      ↓
Pack Generator → project_packs table
      ↓
Blind Spot Engine → tasks table (auto-generated)
      ↓
Pack Published
      ↓
Fit Scoring Engine → project_supplier_invites.fit_score
      ↓
User Actions
      ↓
State Machine → project.status, room.lifecycle_state
```

---

## Dependencies

| Requires | Enables |
|----------|---------|
| Track B (ERD complete) | Track D (UI shows engine outputs) |
| Track C (RLS in place) | |

---

## Open Questions

1. Should engines run synchronously or via background jobs?
2. Where to store rule definitions (code vs database table)?
3. How to handle engine errors gracefully in UI?
4. Should Pack Generator cache results or always recompute?

# Renomate Design

This repo is the **design system and UI foundation** for Renomate.

It exists so that colors, typography, spacing, and shared components are:

- Defined once
- Versioned independently of the app implementation
- Reusable across multiple frontends (consumer, supplier, admin, internal tools)

---

## Repos in this project

- [`renomate-app`](https://github.com/zhennyma/renomate-app) – Product UI shell (Lovable/Cursor app)
- [`renomate-infra`](https://github.com/zhennyma/renomate-infra) – Supabase schema, migrations, RLS
- `renomate-design` (this repo) – design tokens, components, and documentation

---

## Scope

In scope:

- **Design tokens**
  - Colors (brand palette, semantic colors)
  - Typography (font stacks, sizes, weights)
  - Spacing, radius, shadows
  - Z‑index scales
- **Primitive components**
  - Buttons
  - Inputs, selects, textareas
  - Cards, panels
  - Navigation primitives (sidebars, headers)
- **Documentation**
  - Usage guidelines for tokens and components
  - Examples/snippets that the app can copy or import

Out of scope (for now):

- Full marketing site
- Complex feature‑specific components tightly coupled to app logic

---

## Possible structure

This repo will likely evolve, but a simple starting structure might look like:

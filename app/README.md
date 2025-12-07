# Renomate App (`renomate-app`)

This repo contains the **Renomate web application shell**:

- Consumer (homeowner) views: projects list + project detail
- Supplier views: leads list + lead/quote workspace
- Generated initially with **Lovable**, then iterated in **Cursor**
- Connected to **Supabase** as the backend

It is one of three core repos:

- `renomate-app` – web app (this repo)
- `renomate-infra` – Supabase schema, migrations, and RLS
- `renomate-design` – design tokens and shared UI components (optional, evolving)

---

## Working on this project

You can edit this app in three main ways:

### 1. Using Lovable

If you want to continue using Lovable’s UI:

- Open the Lovable project: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
- Prompt for changes to routes, components, or layout
- Lovable will commit changes back to this GitHub repo automatically

Use Lovable for **bigger structural changes** (new routes, large refactors) rather than small code tweaks.

### 2. Using your local IDE (Cursor, VS Code, etc.)

For day-to-day development:

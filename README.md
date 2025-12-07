# Renomate

> A platform connecting UAE homeowners with verified renovation professionals.

Renomate helps homeowners navigate their renovation journey from inspiration to completion, while giving suppliers access to qualified, well-structured project leads.

## Project Structure

```
renomate/
├── app/                    # React/TypeScript web application
│   ├── src/
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── pages/          # Consumer and supplier views
│   │   ├── lib/            # Utilities, types, repositories
│   │   └── integrations/   # Supabase client
│   └── package.json
├── supabase/               # Database schema and migrations
│   ├── config.toml         # Supabase project config
│   └── migrations/         # SQL migrations
├── design/                 # Design tokens and shared components
└── docs/                   # Project documentation
    ├── renomate-plan.md    # Build plan and task tracking
    ├── track-*.md          # Detailed track documentation
    └── cursor-working-rules.md
```

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI Components:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI
- Access to the Supabase project

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd renomate
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Configure environment**
   
   Create `app/.env` (get values from Supabase dashboard or team):
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   VITE_APP_ENV=development
   ```

4. **Link Supabase project**
   ```bash
   cd ../supabase
   supabase link --project-ref <your-project-ref>
   ```
   
   > Get your project ref from `supabase/config.toml` or the Supabase dashboard URL.

5. **Run the app**
   ```bash
   cd ../app
   npm run dev
   ```

## Development Workflow

1. **Notion** — Source of truth for specs and PRDs
2. **Lovable** — UI scaffolding and major structural changes
3. **Cursor** — Code refinement and feature implementation
4. **Supabase** — Database migrations and backend logic

See `docs/renomate-plan.md` for the current build plan and task status.

## Key Features (MVP)

### For Homeowners (Consumers)
- Browse renovation inspiration
- Define project scope and requirements
- Receive structured project packs
- Get matched with qualified suppliers
- Compare quotes and manage selections
- Track project progress

### For Suppliers
- Receive qualified, well-structured leads
- Review detailed project packs
- Submit structured quotes
- Manage samples and showroom visits
- Track execution and performance

## Documentation

| Document | Description |
|----------|-------------|
| `docs/renomate-plan.md` | Master build plan with all tracks |
| `docs/track-a-infra.md` | Infrastructure and environment setup |
| `docs/track-b-erd.md` | Database schema and migrations |
| `docs/track-c-rls.md` | Row Level Security policies |
| `docs/track-d-app-shell.md` | App shell and UI implementation |
| `docs/track-e-engines.md` | Business logic engines |
| `docs/track-f-whatsapp.md` | WhatsApp integration |
| `docs/track-g-logging.md` | Logging and security hardening |

## License

MIT License - see [LICENSE](LICENSE) for details.

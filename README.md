cat > README.md << 'EOF'
# Renomate

Monorepo for the Renomate platform.

## Structure

- `/app` - Lovable-generated web application
- `/supabase` - Database migrations and config

## Setup

1. Install dependencies: `cd app && npm install`
2. Set up environment variables: Copy `app/.env.example` to `app/.env`
3. Run migrations: `cd supabase && supabase db push`
4. Start app: `cd app && npm run dev`
EOF
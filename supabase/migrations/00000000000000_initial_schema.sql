-- Renomate Initial Schema Migration
-- Based on Data Model & ERD (Supabase Specs) from Notion
-- https://www.notion.so/9f5c77073a5f4a6fb8dc60e79b50ea67

-- ============================================================================
-- 1. CORE IDENTITY & PROFILES
-- ============================================================================

-- 1.1 users
-- Single table for all authenticated actors (consumers, suppliers, admins, ops)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_provider_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('consumer', 'supplier', 'admin', 'ops')),
    email TEXT UNIQUE,
    phone TEXT,
    full_name TEXT,
    whatsapp_opt_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_phone_idx ON public.users (phone);

-- 1.2 consumer_profiles
CREATE TABLE public.consumer_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,
    location_city TEXT,
    location_area TEXT,
    preferred_style TEXT,
    budget_tier TEXT CHECK (budget_tier IN ('low', 'mid', 'premium'))
);

-- 1.3 supplier_profiles
CREATE TABLE public.supplier_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    trade_type TEXT NOT NULL,
    coverage_cities TEXT[] DEFAULT '{}',
    min_project_value NUMERIC,
    max_project_value NUMERIC,
    styles TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending_review'
        CHECK (status IN ('pending_review', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX supplier_profiles_trade_type_idx ON public.supplier_profiles (trade_type);
CREATE INDEX supplier_profiles_status_idx ON public.supplier_profiles (status);

-- ============================================================================
-- 2. PROJECTS, ROOMS, LINE ITEMS
-- ============================================================================

-- 2.1 projects
-- Central unit of work for a homeowner renovation
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft', 'scoping', 'sourcing', 'execution', 'completed', 'canceled'
        )),
    location_city TEXT,
    location_area TEXT,
    property_type TEXT,
    estimated_budget_min NUMERIC,
    estimated_budget_max NUMERIC,
    start_date_desired DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_consumer_id_idx ON public.projects (consumer_id);
CREATE INDEX projects_status_idx ON public.projects (status);

-- 2.2 rooms
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_type TEXT,
    area_sqm NUMERIC,
    floor SMALLINT,
    renovation_depth TEXT CHECK (renovation_depth IN ('light', 'medium', 'full'))
);

CREATE INDEX rooms_project_id_idx ON public.rooms (project_id);

-- 2.3 line_items
-- Atomic units of work or materials, scoped by project and optionally room
CREATE TABLE public.line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    waste_factor_pct NUMERIC,
    calculated_quantity NUMERIC,
    priority TEXT CHECK (priority IN ('must_have', 'nice_to_have')),
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft', 'ready_for_quote', 'quoted', 'in_execution', 'done', 'dropped'
        ))
);

CREATE INDEX line_items_project_id_idx ON public.line_items (project_id);
CREATE INDEX line_items_room_id_idx ON public.line_items (room_id);

-- 2.4 project_packs
-- Represents the generated pack fed to suppliers
CREATE TABLE public.project_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects (id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    generated_at TIMESTAMPTZ,
    generated_by UUID REFERENCES public.users (id) ON DELETE SET NULL
);

-- ============================================================================
-- 3. INSPIRATION MODULE (INSPIRE stage)
-- ============================================================================

-- 3.1 inspiration_assets
CREATE TABLE public.inspiration_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('room_photo', 'material_reference', 'moodboard', 'video')),
    media_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    location_city TEXT,
    style_tags TEXT[] DEFAULT '{}',
    finish_tags TEXT[] DEFAULT '{}',
    price_band TEXT CHECK (price_band IN ('low', 'mid', 'high')),
    creator_type TEXT CHECK (creator_type IN ('designer', 'contractor', 'platform')),
    creator_supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 inspiration_boards
CREATE TABLE public.inspiration_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inspiration_boards_consumer_id_idx ON public.inspiration_boards (consumer_id);

-- 3.3 inspiration_board_items
CREATE TABLE public.inspiration_board_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES public.inspiration_boards (id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.inspiration_assets (id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX inspiration_board_items_board_id_idx ON public.inspiration_board_items (board_id);

-- 3.4 favourites
-- Generic hearts/saves across entities
CREATE TABLE public.favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX favourites_user_entity_idx ON public.favourites (user_id, entity_type);

-- ============================================================================
-- 4. SUPPLIER MATCHING, INVITES, QUOTES
-- ============================================================================

-- 4.1 project_supplier_invites
-- Represents a qualified lead card sent to a supplier
CREATE TABLE public.project_supplier_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
    invite_channel TEXT NOT NULL CHECK (invite_channel IN ('whatsapp', 'email', 'dashboard')),
    decision_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (decision_status IN ('pending', 'accepted', 'declined', 'waitlisted')),
    decline_reason TEXT,
    fit_score NUMERIC,
    magic_link_token TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_supplier_invites_project_id_idx ON public.project_supplier_invites (project_id);
CREATE INDEX project_supplier_invites_supplier_id_idx ON public.project_supplier_invites (supplier_id);

-- 4.2 quotes
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
    quote_type TEXT NOT NULL CHECK (quote_type IN ('design', 'contracting', 'materials')),
    status TEXT NOT NULL DEFAULT 'invited'
        CHECK (status IN ('invited', 'accepted_invite', 'submitted', 'withdrawn', 'won', 'lost')),
    total_price NUMERIC,
    currency TEXT NOT NULL DEFAULT 'AED',
    valid_until DATE,
    fit_score NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

CREATE INDEX quotes_project_id_idx ON public.quotes (project_id);
CREATE INDEX quotes_supplier_id_idx ON public.quotes (supplier_id);

-- 4.3 quote_line_items
CREATE TABLE public.quote_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes (id) ON DELETE CASCADE,
    line_item_id UUID NOT NULL REFERENCES public.line_items (id) ON DELETE CASCADE,
    catalog_item_id UUID,
    unit_price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    is_sample_eligible BOOLEAN DEFAULT FALSE,
    notes TEXT
);

CREATE INDEX quote_line_items_quote_id_idx ON public.quote_line_items (quote_id);

-- 4.4 supplier_scopes
-- What part of a project a supplier is willing to cover
CREATE TABLE public.supplier_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
    trade_category TEXT,
    coverage_type TEXT CHECK (coverage_type IN ('full_project', 'selected_rooms', 'work_package'))
);

CREATE INDEX supplier_scopes_project_supplier_idx
    ON public.supplier_scopes (project_id, supplier_id);

-- ============================================================================
-- 5. SAMPLING & SHOWROOM VISITS
-- ============================================================================

-- 5.1 samples
CREATE TABLE public.samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
    quote_line_item_id UUID REFERENCES public.quote_line_items (id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested', 'preparing', 'in_transit', 'delivered', 'viewed', 'completed', 'canceled')),
    delivery_mode TEXT CHECK (delivery_mode IN ('delivery', 'showroom')),
    delivery_address TEXT,
    showroom_visit_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX samples_project_id_idx ON public.samples (project_id);
CREATE INDEX samples_supplier_id_idx ON public.samples (supplier_id);

-- 5.2 sample_feedback
CREATE TABLE public.sample_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID NOT NULL REFERENCES public.samples (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    notes TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.3 showroom_visits
CREATE TABLE public.showroom_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles (id) ON DELETE CASCADE,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ,
    location TEXT,
    calendar_event_id TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'completed', 'canceled', 'no_show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX showroom_visits_project_id_idx ON public.showroom_visits (project_id);

-- ============================================================================
-- 6. TASKS, CHANGE ORDERS, PAYMENTS
-- ============================================================================

-- 6.1 tasks
-- Shared project/task tracker underpinning the MANAGE stage
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms (id) ON DELETE SET NULL,
    assigned_to_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    assigned_to_supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'canceled')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    is_blocking BOOLEAN DEFAULT FALSE,
    source TEXT CHECK (source IN ('user', 'blind_spot_engine', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tasks_project_id_idx ON public.tasks (project_id);
CREATE INDEX tasks_status_idx ON public.tasks (status);

-- 6.2 task_dependencies
CREATE TABLE public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
    dependency_type TEXT DEFAULT 'finish_to_start'
        CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (task_id, depends_on_task_id)
);

CREATE INDEX task_dependencies_task_id_idx ON public.task_dependencies (task_id);

-- 6.3 change_orders
CREATE TABLE public.change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    requested_by_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    price_impact NUMERIC,
    timeline_impact_days INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX change_orders_project_id_idx ON public.change_orders (project_id);

-- 6.4 payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'AED',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_type TEXT CHECK (payment_type IN ('deposit', 'milestone', 'final', 'refund')),
    external_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX payments_project_id_idx ON public.payments (project_id);

-- ============================================================================
-- 7. WHATSAPP MESSAGING MODULE
-- ============================================================================

-- 7.1 whatsapp_threads
CREATE TABLE public.whatsapp_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects (id) ON DELETE SET NULL,
    consumer_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.supplier_profiles (id) ON DELETE SET NULL,
    wa_thread_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX whatsapp_threads_project_id_idx ON public.whatsapp_threads (project_id);

-- 7.2 whatsapp_messages
CREATE TABLE public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.whatsapp_threads (id) ON DELETE CASCADE,
    wa_message_id TEXT UNIQUE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_type TEXT CHECK (sender_type IN ('consumer', 'supplier', 'platform', 'bot')),
    sender_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    content TEXT,
    media_url TEXT,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'template', 'interactive')),
    status TEXT DEFAULT 'sent'
        CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX whatsapp_messages_thread_id_idx ON public.whatsapp_messages (thread_id);

-- ============================================================================
-- 8. AUDIT & LOGGING
-- ============================================================================

-- 8.1 audit_logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs (user_id);
CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at);

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_supplier_invites_updated_at
    BEFORE UPDATE ON public.project_supplier_invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_threads_updated_at
    BEFORE UPDATE ON public.whatsapp_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


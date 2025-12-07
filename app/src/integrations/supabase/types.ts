/**
 * Supabase Database Types
 * 
 * Auto-generated types for Supabase tables.
 * Aligned with track-b-erd.md schema.
 * 
 * To regenerate from live database:
 *   supabase gen types typescript --local > src/integrations/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_provider_id: string
          role: 'consumer' | 'supplier' | 'admin' | 'ops'
          email: string | null
          phone: string | null
          full_name: string | null
          whatsapp_opt_in: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_provider_id: string
          role: 'consumer' | 'supplier' | 'admin' | 'ops'
          email?: string | null
          phone?: string | null
          full_name?: string | null
          whatsapp_opt_in?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_provider_id?: string
          role?: 'consumer' | 'supplier' | 'admin' | 'ops'
          email?: string | null
          phone?: string | null
          full_name?: string | null
          whatsapp_opt_in?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      consumer_profiles: {
        Row: {
          user_id: string
          location_city: string | null
          location_area: string | null
          preferred_style: string | null
          budget_tier: 'low' | 'mid' | 'premium' | null
        }
        Insert: {
          user_id: string
          location_city?: string | null
          location_area?: string | null
          preferred_style?: string | null
          budget_tier?: 'low' | 'mid' | 'premium' | null
        }
        Update: {
          user_id?: string
          location_city?: string | null
          location_area?: string | null
          preferred_style?: string | null
          budget_tier?: 'low' | 'mid' | 'premium' | null
        }
      }
      supplier_profiles: {
        Row: {
          id: string
          user_id: string | null
          company_name: string
          trade_type: string
          coverage_cities: string[]
          min_project_value: number | null
          max_project_value: number | null
          styles: string[]
          status: 'pending_review' | 'active' | 'suspended'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_name: string
          trade_type: string
          coverage_cities?: string[]
          min_project_value?: number | null
          max_project_value?: number | null
          styles?: string[]
          status?: 'pending_review' | 'active' | 'suspended'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company_name?: string
          trade_type?: string
          coverage_cities?: string[]
          min_project_value?: number | null
          max_project_value?: number | null
          styles?: string[]
          status?: 'pending_review' | 'active' | 'suspended'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          consumer_id: string
          title: string
          status: 'draft' | 'ready_for_review' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'canceled'
          location_city: string | null
          location_area: string | null
          property_type: string | null
          estimated_budget_min: number | null
          estimated_budget_max: number | null
          start_date_desired: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consumer_id: string
          title: string
          status?: 'draft' | 'ready_for_review' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'canceled'
          location_city?: string | null
          location_area?: string | null
          property_type?: string | null
          estimated_budget_min?: number | null
          estimated_budget_max?: number | null
          start_date_desired?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consumer_id?: string
          title?: string
          status?: 'draft' | 'ready_for_review' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'canceled'
          location_city?: string | null
          location_area?: string | null
          property_type?: string | null
          estimated_budget_min?: number | null
          estimated_budget_max?: number | null
          start_date_desired?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          project_id: string
          name: string
          room_type: string | null
          area_sqm: number | null
          floor: number | null
          renovation_depth: 'light' | 'medium' | 'full' | null
          lifecycle_state: 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'paused'
          execution_state: 'not_started' | 'in_progress' | 'ready_for_inspection' | 'rework_required' | 'complete'
          previous_lifecycle_state: 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          room_type?: string | null
          area_sqm?: number | null
          floor?: number | null
          renovation_depth?: 'light' | 'medium' | 'full' | null
          lifecycle_state?: 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'paused'
          execution_state?: 'not_started' | 'in_progress' | 'ready_for_inspection' | 'rework_required' | 'complete'
          previous_lifecycle_state?: 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          room_type?: string | null
          area_sqm?: number | null
          floor?: number | null
          renovation_depth?: 'light' | 'medium' | 'full' | null
          lifecycle_state?: 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | 'paused'
          execution_state?: 'not_started' | 'in_progress' | 'ready_for_inspection' | 'rework_required' | 'complete'
          previous_lifecycle_state?: 'draft' | 'open_for_bids' | 'sourcing' | 'execution' | 'completed' | null
        }
      }
      line_items: {
        Row: {
          id: string
          project_id: string
          room_id: string | null
          category: string
          description: string
          unit: string
          quantity: number
          waste_factor_pct: number | null
          calculated_quantity: number | null
          priority: 'must_have' | 'nice_to_have' | null
          status: 'draft' | 'ready_for_quote' | 'quoted' | 'in_execution' | 'done' | 'dropped'
        }
        Insert: {
          id?: string
          project_id: string
          room_id?: string | null
          category: string
          description: string
          unit: string
          quantity: number
          waste_factor_pct?: number | null
          calculated_quantity?: number | null
          priority?: 'must_have' | 'nice_to_have' | null
          status?: 'draft' | 'ready_for_quote' | 'quoted' | 'in_execution' | 'done' | 'dropped'
        }
        Update: {
          id?: string
          project_id?: string
          room_id?: string | null
          category?: string
          description?: string
          unit?: string
          quantity?: number
          waste_factor_pct?: number | null
          calculated_quantity?: number | null
          priority?: 'must_have' | 'nice_to_have' | null
          status?: 'draft' | 'ready_for_quote' | 'quoted' | 'in_execution' | 'done' | 'dropped'
        }
      }
      project_packs: {
        Row: {
          id: string
          project_id: string
          version: number
          status: 'draft' | 'published' | 'archived'
          generated_at: string | null
          generated_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          version?: number
          status?: 'draft' | 'published' | 'archived'
          generated_at?: string | null
          generated_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          version?: number
          status?: 'draft' | 'published' | 'archived'
          generated_at?: string | null
          generated_by?: string | null
        }
      }
      inspiration_assets: {
        Row: {
          id: string
          type: 'room_photo' | 'material_reference' | 'moodboard' | 'video'
          media_url: string
          title: string | null
          description: string | null
          location_city: string | null
          style_tags: string[]
          finish_tags: string[]
          price_band: 'low' | 'mid' | 'high' | null
          creator_type: 'designer' | 'contractor' | 'platform' | null
          creator_supplier_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'room_photo' | 'material_reference' | 'moodboard' | 'video'
          media_url: string
          title?: string | null
          description?: string | null
          location_city?: string | null
          style_tags?: string[]
          finish_tags?: string[]
          price_band?: 'low' | 'mid' | 'high' | null
          creator_type?: 'designer' | 'contractor' | 'platform' | null
          creator_supplier_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'room_photo' | 'material_reference' | 'moodboard' | 'video'
          media_url?: string
          title?: string | null
          description?: string | null
          location_city?: string | null
          style_tags?: string[]
          finish_tags?: string[]
          price_band?: 'low' | 'mid' | 'high' | null
          creator_type?: 'designer' | 'contractor' | 'platform' | null
          creator_supplier_id?: string | null
          created_at?: string
        }
      }
      inspiration_boards: {
        Row: {
          id: string
          consumer_id: string
          project_id: string | null
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          consumer_id: string
          project_id?: string | null
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          consumer_id?: string
          project_id?: string | null
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      inspiration_board_items: {
        Row: {
          id: string
          board_id: string
          asset_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          asset_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          asset_id?: string
          note?: string | null
          created_at?: string
        }
      }
      favourites: {
        Row: {
          id: string
          user_id: string
          entity_type: string
          entity_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entity_type: string
          entity_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entity_type?: string
          entity_id?: string
          created_at?: string
        }
      }
      project_supplier_invites: {
        Row: {
          id: string
          project_id: string
          supplier_id: string
          invite_channel: 'whatsapp' | 'email' | 'dashboard'
          decision_status: 'pending' | 'accepted' | 'declined' | 'waitlisted'
          decline_reason: string | null
          fit_score: number | null
          magic_link_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          supplier_id: string
          invite_channel: 'whatsapp' | 'email' | 'dashboard'
          decision_status?: 'pending' | 'accepted' | 'declined' | 'waitlisted'
          decline_reason?: string | null
          fit_score?: number | null
          magic_link_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          supplier_id?: string
          invite_channel?: 'whatsapp' | 'email' | 'dashboard'
          decision_status?: 'pending' | 'accepted' | 'declined' | 'waitlisted'
          decline_reason?: string | null
          fit_score?: number | null
          magic_link_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          project_id: string
          supplier_id: string
          quote_type: 'design' | 'contracting' | 'materials'
          status: 'invited' | 'accepted_invite' | 'submitted' | 'withdrawn' | 'won' | 'lost'
          total_price: number | null
          currency: string
          valid_until: string | null
          fit_score: number | null
          created_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          supplier_id: string
          quote_type: 'design' | 'contracting' | 'materials'
          status?: 'invited' | 'accepted_invite' | 'submitted' | 'withdrawn' | 'won' | 'lost'
          total_price?: number | null
          currency?: string
          valid_until?: string | null
          fit_score?: number | null
          created_at?: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          supplier_id?: string
          quote_type?: 'design' | 'contracting' | 'materials'
          status?: 'invited' | 'accepted_invite' | 'submitted' | 'withdrawn' | 'won' | 'lost'
          total_price?: number | null
          currency?: string
          valid_until?: string | null
          fit_score?: number | null
          created_at?: string
          submitted_at?: string | null
        }
      }
      quote_line_items: {
        Row: {
          id: string
          quote_id: string
          line_item_id: string
          catalog_item_id: string | null
          unit_price: number
          quantity: number
          total_price: number
          is_sample_eligible: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          quote_id: string
          line_item_id: string
          catalog_item_id?: string | null
          unit_price: number
          quantity: number
          total_price: number
          is_sample_eligible?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          quote_id?: string
          line_item_id?: string
          catalog_item_id?: string | null
          unit_price?: number
          quantity?: number
          total_price?: number
          is_sample_eligible?: boolean
          notes?: string | null
        }
      }
      supplier_scopes: {
        Row: {
          id: string
          supplier_id: string
          project_id: string
          room_id: string | null
          trade_category: string | null
          coverage_type: 'full_project' | 'selected_rooms' | 'work_package' | null
        }
        Insert: {
          id?: string
          supplier_id: string
          project_id: string
          room_id?: string | null
          trade_category?: string | null
          coverage_type?: 'full_project' | 'selected_rooms' | 'work_package' | null
        }
        Update: {
          id?: string
          supplier_id?: string
          project_id?: string
          room_id?: string | null
          trade_category?: string | null
          coverage_type?: 'full_project' | 'selected_rooms' | 'work_package' | null
        }
      }
      samples: {
        Row: {
          id: string
          project_id: string
          room_id: string | null
          quote_line_item_id: string | null
          supplier_id: string
          status: 'requested' | 'preparing' | 'in_transit' | 'delivered' | 'viewed' | 'completed' | 'canceled'
          delivery_mode: 'delivery' | 'showroom' | null
          delivery_address: string | null
          showroom_visit_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          room_id?: string | null
          quote_line_item_id?: string | null
          supplier_id: string
          status?: 'requested' | 'preparing' | 'in_transit' | 'delivered' | 'viewed' | 'completed' | 'canceled'
          delivery_mode?: 'delivery' | 'showroom' | null
          delivery_address?: string | null
          showroom_visit_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          room_id?: string | null
          quote_line_item_id?: string | null
          supplier_id?: string
          status?: 'requested' | 'preparing' | 'in_transit' | 'delivered' | 'viewed' | 'completed' | 'canceled'
          delivery_mode?: 'delivery' | 'showroom' | null
          delivery_address?: string | null
          showroom_visit_id?: string | null
          created_at?: string
        }
      }
      sample_feedback: {
        Row: {
          id: string
          sample_id: string
          user_id: string
          rating: number | null
          notes: string | null
          photo_urls: string[]
          created_at: string
        }
        Insert: {
          id?: string
          sample_id: string
          user_id: string
          rating?: number | null
          notes?: string | null
          photo_urls?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          sample_id?: string
          user_id?: string
          rating?: number | null
          notes?: string | null
          photo_urls?: string[]
          created_at?: string
        }
      }
      showroom_visits: {
        Row: {
          id: string
          project_id: string
          supplier_id: string
          scheduled_start: string
          scheduled_end: string | null
          location: string | null
          calendar_event_id: string | null
          status: 'scheduled' | 'completed' | 'canceled' | 'no_show'
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          supplier_id: string
          scheduled_start: string
          scheduled_end?: string | null
          location?: string | null
          calendar_event_id?: string | null
          status?: 'scheduled' | 'completed' | 'canceled' | 'no_show'
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          supplier_id?: string
          scheduled_start?: string
          scheduled_end?: string | null
          location?: string | null
          calendar_event_id?: string | null
          status?: 'scheduled' | 'completed' | 'canceled' | 'no_show'
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          room_id: string | null
          assigned_to_user_id: string | null
          assigned_to_supplier_id: string | null
          title: string
          description: string | null
          type: string | null
          status: 'todo' | 'in_progress' | 'blocked' | 'done' | 'canceled'
          priority: 'low' | 'medium' | 'high' | 'critical' | null
          due_date: string | null
          completed_at: string | null
          is_blocking: boolean
          source: 'manual' | 'blind_spot_engine' | 'pack_generator' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          room_id?: string | null
          assigned_to_user_id?: string | null
          assigned_to_supplier_id?: string | null
          title: string
          description?: string | null
          type?: string | null
          status?: 'todo' | 'in_progress' | 'blocked' | 'done' | 'canceled'
          priority?: 'low' | 'medium' | 'high' | 'critical' | null
          due_date?: string | null
          completed_at?: string | null
          is_blocking?: boolean
          source?: 'manual' | 'blind_spot_engine' | 'pack_generator' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          room_id?: string | null
          assigned_to_user_id?: string | null
          assigned_to_supplier_id?: string | null
          title?: string
          description?: string | null
          type?: string | null
          status?: 'todo' | 'in_progress' | 'blocked' | 'done' | 'canceled'
          priority?: 'low' | 'medium' | 'high' | 'critical' | null
          due_date?: string | null
          completed_at?: string | null
          is_blocking?: boolean
          source?: 'manual' | 'blind_spot_engine' | 'pack_generator' | null
          created_at?: string
          updated_at?: string
        }
      }
      task_dependencies: {
        Row: {
          id: string
          task_id: string
          depends_on_task_id: string
          dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish'
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          depends_on_task_id: string
          dependency_type?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish'
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          depends_on_task_id?: string
          dependency_type?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish'
          created_at?: string
        }
      }
      change_orders: {
        Row: {
          id: string
          project_id: string
          requested_by_user_id: string | null
          supplier_id: string | null
          title: string
          description: string | null
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          price_impact: number | null
          timeline_impact_days: number | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          requested_by_user_id?: string | null
          supplier_id?: string | null
          title: string
          description?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          price_impact?: number | null
          timeline_impact_days?: number | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          requested_by_user_id?: string | null
          supplier_id?: string | null
          title?: string
          description?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          price_impact?: number | null
          timeline_impact_days?: number | null
          created_at?: string
          resolved_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          project_id: string
          supplier_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_type: 'deposit' | 'milestone' | 'final' | 'refund' | null
          external_reference: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          supplier_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_type?: 'deposit' | 'milestone' | 'final' | 'refund' | null
          external_reference?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          supplier_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_type?: 'deposit' | 'milestone' | 'final' | 'refund' | null
          external_reference?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      whatsapp_threads: {
        Row: {
          id: string
          project_id: string | null
          consumer_id: string | null
          supplier_id: string | null
          wa_thread_id: string | null
          status: 'active' | 'archived' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          consumer_id?: string | null
          supplier_id?: string | null
          wa_thread_id?: string | null
          status?: 'active' | 'archived' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          consumer_id?: string | null
          supplier_id?: string | null
          wa_thread_id?: string | null
          status?: 'active' | 'archived' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          thread_id: string
          wa_message_id: string | null
          direction: 'inbound' | 'outbound'
          sender_type: 'consumer' | 'supplier' | 'platform' | 'bot' | null
          sender_user_id: string | null
          content: string | null
          media_url: string | null
          message_type: 'text' | 'image' | 'document' | 'template' | 'interactive' | null
          status: 'sent' | 'delivered' | 'read' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          wa_message_id?: string | null
          direction: 'inbound' | 'outbound'
          sender_type?: 'consumer' | 'supplier' | 'platform' | 'bot' | null
          sender_user_id?: string | null
          content?: string | null
          media_url?: string | null
          message_type?: 'text' | 'image' | 'document' | 'template' | 'interactive' | null
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          wa_message_id?: string | null
          direction?: 'inbound' | 'outbound'
          sender_type?: 'consumer' | 'supplier' | 'platform' | 'bot' | null
          sender_user_id?: string | null
          content?: string | null
          media_url?: string | null
          message_type?: 'text' | 'image' | 'document' | 'template' | 'interactive' | null
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']

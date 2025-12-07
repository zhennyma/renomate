export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price_impact: number | null
          project_id: string
          requested_by_user_id: string | null
          resolved_at: string | null
          status: string
          supplier_id: string | null
          timeline_impact_days: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price_impact?: number | null
          project_id: string
          requested_by_user_id?: string | null
          resolved_at?: string | null
          status?: string
          supplier_id?: string | null
          timeline_impact_days?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price_impact?: number | null
          project_id?: string
          requested_by_user_id?: string | null
          resolved_at?: string | null
          status?: string
          supplier_id?: string | null
          timeline_impact_days?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consumer_profiles: {
        Row: {
          budget_tier: string | null
          location_area: string | null
          location_city: string | null
          preferred_style: string | null
          user_id: string
        }
        Insert: {
          budget_tier?: string | null
          location_area?: string | null
          location_city?: string | null
          preferred_style?: string | null
          user_id: string
        }
        Update: {
          budget_tier?: string | null
          location_area?: string | null
          location_city?: string | null
          preferred_style?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favourites: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_assets: {
        Row: {
          created_at: string
          creator_supplier_id: string | null
          creator_type: string | null
          description: string | null
          finish_tags: string[] | null
          id: string
          location_city: string | null
          media_url: string
          price_band: string | null
          style_tags: string[] | null
          title: string | null
          type: string
        }
        Insert: {
          created_at?: string
          creator_supplier_id?: string | null
          creator_type?: string | null
          description?: string | null
          finish_tags?: string[] | null
          id?: string
          location_city?: string | null
          media_url: string
          price_band?: string | null
          style_tags?: string[] | null
          title?: string | null
          type: string
        }
        Update: {
          created_at?: string
          creator_supplier_id?: string | null
          creator_type?: string | null
          description?: string | null
          finish_tags?: string[] | null
          id?: string
          location_city?: string | null
          media_url?: string
          price_band?: string | null
          style_tags?: string[] | null
          title?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_assets_creator_supplier_id_fkey"
            columns: ["creator_supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_board_items: {
        Row: {
          asset_id: string
          board_id: string
          created_at: string
          id: string
          note: string | null
        }
        Insert: {
          asset_id: string
          board_id: string
          created_at?: string
          id?: string
          note?: string | null
        }
        Update: {
          asset_id?: string
          board_id?: string
          created_at?: string
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_board_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "inspiration_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspiration_board_items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "inspiration_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_boards: {
        Row: {
          consumer_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string | null
        }
        Insert: {
          consumer_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
        }
        Update: {
          consumer_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_boards_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspiration_boards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          calculated_quantity: number | null
          category: string
          description: string
          id: string
          priority: string | null
          project_id: string
          quantity: number
          room_id: string | null
          status: string
          unit: string
          waste_factor_pct: number | null
        }
        Insert: {
          calculated_quantity?: number | null
          category: string
          description: string
          id?: string
          priority?: string | null
          project_id: string
          quantity: number
          room_id?: string | null
          status?: string
          unit: string
          waste_factor_pct?: number | null
        }
        Update: {
          calculated_quantity?: number | null
          category?: string
          description?: string
          id?: string
          priority?: string | null
          project_id?: string
          quantity?: number
          room_id?: string | null
          status?: string
          unit?: string
          waste_factor_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "line_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          external_reference: string | null
          id: string
          payment_type: string | null
          project_id: string
          status: string
          supplier_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_reference?: string | null
          id?: string
          payment_type?: string | null
          project_id: string
          status?: string
          supplier_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_reference?: string | null
          id?: string
          payment_type?: string | null
          project_id?: string
          status?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_packs: {
        Row: {
          generated_at: string | null
          generated_by: string | null
          id: string
          project_id: string
          status: string
          version: number
        }
        Insert: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          project_id: string
          status?: string
          version?: number
        }
        Update: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          project_id?: string
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_packs_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_packs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_supplier_invites: {
        Row: {
          created_at: string
          decision_status: string
          decline_reason: string | null
          fit_score: number | null
          id: string
          invite_channel: string
          magic_link_token: string | null
          project_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_status?: string
          decline_reason?: string | null
          fit_score?: number | null
          id?: string
          invite_channel: string
          magic_link_token?: string | null
          project_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_status?: string
          decline_reason?: string | null
          fit_score?: number | null
          id?: string
          invite_channel?: string
          magic_link_token?: string | null
          project_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_supplier_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_supplier_invites_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          consumer_id: string
          created_at: string
          estimated_budget_max: number | null
          estimated_budget_min: number | null
          id: string
          location_area: string | null
          location_city: string | null
          property_type: string | null
          start_date_desired: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          consumer_id: string
          created_at?: string
          estimated_budget_max?: number | null
          estimated_budget_min?: number | null
          id?: string
          location_area?: string | null
          location_city?: string | null
          property_type?: string | null
          start_date_desired?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          consumer_id?: string
          created_at?: string
          estimated_budget_max?: number | null
          estimated_budget_min?: number | null
          id?: string
          location_area?: string | null
          location_city?: string | null
          property_type?: string | null
          start_date_desired?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_line_items: {
        Row: {
          catalog_item_id: string | null
          id: string
          is_sample_eligible: boolean | null
          line_item_id: string
          notes: string | null
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          catalog_item_id?: string | null
          id?: string
          is_sample_eligible?: boolean | null
          line_item_id: string
          notes?: string | null
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          catalog_item_id?: string | null
          id?: string
          is_sample_eligible?: boolean | null
          line_item_id?: string
          notes?: string | null
          quantity?: number
          quote_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          currency: string
          fit_score: number | null
          id: string
          project_id: string
          quote_type: string
          status: string
          submitted_at: string | null
          supplier_id: string
          total_price: number | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          fit_score?: number | null
          id?: string
          project_id: string
          quote_type: string
          status?: string
          submitted_at?: string | null
          supplier_id: string
          total_price?: number | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          fit_score?: number | null
          id?: string
          project_id?: string
          quote_type?: string
          status?: string
          submitted_at?: string | null
          supplier_id?: string
          total_price?: number | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          area_sqm: number | null
          execution_state: string
          floor: number | null
          id: string
          lifecycle_state: string
          name: string
          previous_lifecycle_state: string | null
          project_id: string
          renovation_depth: string | null
          room_type: string | null
        }
        Insert: {
          area_sqm?: number | null
          execution_state?: string
          floor?: number | null
          id?: string
          lifecycle_state?: string
          name: string
          previous_lifecycle_state?: string | null
          project_id: string
          renovation_depth?: string | null
          room_type?: string | null
        }
        Update: {
          area_sqm?: number | null
          execution_state?: string
          floor?: number | null
          id?: string
          lifecycle_state?: string
          name?: string
          previous_lifecycle_state?: string | null
          project_id?: string
          renovation_depth?: string | null
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_feedback: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          photo_urls: string[] | null
          rating: number | null
          sample_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_urls?: string[] | null
          rating?: number | null
          sample_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_urls?: string[] | null
          rating?: number | null
          sample_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_feedback_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      samples: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_mode: string | null
          id: string
          project_id: string
          quote_line_item_id: string | null
          room_id: string | null
          showroom_visit_id: string | null
          status: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_mode?: string | null
          id?: string
          project_id: string
          quote_line_item_id?: string | null
          room_id?: string | null
          showroom_visit_id?: string | null
          status?: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_mode?: string | null
          id?: string
          project_id?: string
          quote_line_item_id?: string | null
          room_id?: string | null
          showroom_visit_id?: string | null
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "samples_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_quote_line_item_id_fkey"
            columns: ["quote_line_item_id"]
            isOneToOne: false
            referencedRelation: "quote_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      showroom_visits: {
        Row: {
          calendar_event_id: string | null
          created_at: string
          id: string
          location: string | null
          project_id: string
          scheduled_end: string | null
          scheduled_start: string
          status: string
          supplier_id: string
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          project_id: string
          scheduled_end?: string | null
          scheduled_start: string
          status?: string
          supplier_id: string
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          project_id?: string
          scheduled_end?: string | null
          scheduled_start?: string
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showroom_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showroom_visits_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_profiles: {
        Row: {
          company_name: string
          coverage_cities: string[] | null
          created_at: string
          id: string
          max_project_value: number | null
          min_project_value: number | null
          status: string
          styles: string[] | null
          trade_type: string
          user_id: string | null
        }
        Insert: {
          company_name: string
          coverage_cities?: string[] | null
          created_at?: string
          id?: string
          max_project_value?: number | null
          min_project_value?: number | null
          status?: string
          styles?: string[] | null
          trade_type: string
          user_id?: string | null
        }
        Update: {
          company_name?: string
          coverage_cities?: string[] | null
          created_at?: string
          id?: string
          max_project_value?: number | null
          min_project_value?: number | null
          status?: string
          styles?: string[] | null
          trade_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_scopes: {
        Row: {
          coverage_type: string | null
          id: string
          project_id: string
          room_id: string | null
          supplier_id: string
          trade_category: string | null
        }
        Insert: {
          coverage_type?: string | null
          id?: string
          project_id: string
          room_id?: string | null
          supplier_id: string
          trade_category?: string | null
        }
        Update: {
          coverage_type?: string | null
          id?: string
          project_id?: string
          room_id?: string | null
          supplier_id?: string
          trade_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_scopes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_scopes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_scopes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          dependency_type: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: string | null
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to_supplier_id: string | null
          assigned_to_user_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_blocking: boolean | null
          priority: string | null
          project_id: string
          room_id: string | null
          source: string | null
          status: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          assigned_to_supplier_id?: string | null
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_blocking?: boolean | null
          priority?: string | null
          project_id: string
          room_id?: string | null
          source?: string | null
          status?: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to_supplier_id?: string | null
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_blocking?: boolean | null
          priority?: string | null
          project_id?: string
          room_id?: string | null
          source?: string | null
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_supplier_id_fkey"
            columns: ["assigned_to_supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_provider_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          whatsapp_opt_in: boolean | null
        }
        Insert: {
          auth_provider_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role: string
          updated_at?: string
          whatsapp_opt_in?: boolean | null
        }
        Update: {
          auth_provider_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          whatsapp_opt_in?: boolean | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string | null
          created_at: string
          direction: string
          id: string
          media_url: string | null
          message_type: string | null
          sender_type: string | null
          sender_user_id: string | null
          status: string | null
          thread_id: string
          wa_message_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          direction: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          sender_type?: string | null
          sender_user_id?: string | null
          status?: string | null
          thread_id: string
          wa_message_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          direction?: string
          id?: string
          media_url?: string | null
          message_type?: string | null
          sender_type?: string | null
          sender_user_id?: string | null
          status?: string | null
          thread_id?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_threads: {
        Row: {
          consumer_id: string | null
          created_at: string
          id: string
          project_id: string | null
          status: string
          supplier_id: string | null
          updated_at: string
          wa_thread_id: string | null
        }
        Insert: {
          consumer_id?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          wa_thread_id?: string | null
        }
        Update: {
          consumer_id?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          wa_thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_threads_consumer_id_fkey"
            columns: ["consumer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_threads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_threads_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

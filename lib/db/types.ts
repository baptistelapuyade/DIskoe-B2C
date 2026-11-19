// GENERATED FILE. Do not edit by hand.
//
// Source: Supabase dev project (eu-central-1, Postgres 17) after all
// migrations up to 20261027160000_review_flow.sql, generated on 2026-10-28
// with the Supabase MCP `generate_typescript_types`. The columns and function of
// 20261117120000_profile_links_and_slug.sql (instagram_handle, extra_links,
// change_profile_slug) and 20261117130000 (public_profiles.profile_image_crop) were added by hand and match the migration.
// Regenerate after every schema change (see docs/STATUS.md).
//
// Caution: these types describe table columns, not column privileges. Clients
// must still select named columns; for example `owner_id` and `actor_id` are
// typed here but are not readable by anon or authenticated.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_roles: {
        Row: {
          created_at: string
          is_founder: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          is_founder?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          is_founder?: boolean
          user_id?: string
        }
        Relationships: []
      }
      event_revisions: {
        Row: {
          access_routes: Json
          access_state: Database["public"]["Enums"]["answer_state"]
          address_line: string | null
          atmosphere_description: string | null
          atmosphere_state: Database["public"]["Enums"]["answer_state"]
          atmosphere_tags: string[]
          city: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          country_code: string | null
          created_at: string
          created_by: string
          currency: string | null
          description: string | null
          description_state: Database["public"]["Enums"]["answer_state"]
          end_at: string | null
          end_state: Database["public"]["Enums"]["answer_state"]
          event_id: string
          event_image_use_id: string | null
          format_state: Database["public"]["Enums"]["answer_state"]
          id: string
          place_name: string | null
          place_state: Database["public"]["Enums"]["answer_state"]
          postal_code: string | null
          price_amount_minor: number | null
          price_max_amount_minor: number | null
          modules: Json | null
          price_fee_model: Database["public"]["Enums"]["price_fee_model"] | null
          price_model: Database["public"]["Enums"]["price_model"] | null
          price_state: Database["public"]["Enums"]["answer_state"]
          primary_format: Database["public"]["Enums"]["primary_format"] | null
          revision_no: number
          start_at: string | null
          start_state: Database["public"]["Enums"]["answer_state"]
          timezone: string
          title: string | null
          title_state: Database["public"]["Enums"]["answer_state"]
        }
        Insert: {
          access_routes?: Json
          access_state?: Database["public"]["Enums"]["answer_state"]
          address_line?: string | null
          atmosphere_description?: string | null
          atmosphere_state?: Database["public"]["Enums"]["answer_state"]
          atmosphere_tags?: string[]
          city?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          country_code?: string | null
          created_at?: string
          created_by: string
          currency?: string | null
          description?: string | null
          description_state?: Database["public"]["Enums"]["answer_state"]
          end_at?: string | null
          end_state?: Database["public"]["Enums"]["answer_state"]
          event_id: string
          event_image_use_id?: string | null
          format_state?: Database["public"]["Enums"]["answer_state"]
          id?: string
          place_name?: string | null
          place_state?: Database["public"]["Enums"]["answer_state"]
          postal_code?: string | null
          price_amount_minor?: number | null
          price_max_amount_minor?: number | null
          modules?: Json | null
          price_fee_model?: Database["public"]["Enums"]["price_fee_model"] | null
          price_model?: Database["public"]["Enums"]["price_model"] | null
          price_state?: Database["public"]["Enums"]["answer_state"]
          primary_format?: Database["public"]["Enums"]["primary_format"] | null
          revision_no: number
          start_at?: string | null
          start_state?: Database["public"]["Enums"]["answer_state"]
          timezone?: string
          title?: string | null
          title_state?: Database["public"]["Enums"]["answer_state"]
        }
        Update: {
          access_routes?: Json
          access_state?: Database["public"]["Enums"]["answer_state"]
          address_line?: string | null
          atmosphere_description?: string | null
          atmosphere_state?: Database["public"]["Enums"]["answer_state"]
          atmosphere_tags?: string[]
          city?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string
          currency?: string | null
          description?: string | null
          description_state?: Database["public"]["Enums"]["answer_state"]
          end_at?: string | null
          end_state?: Database["public"]["Enums"]["answer_state"]
          event_id?: string
          event_image_use_id?: string | null
          format_state?: Database["public"]["Enums"]["answer_state"]
          id?: string
          place_name?: string | null
          place_state?: Database["public"]["Enums"]["answer_state"]
          postal_code?: string | null
          price_amount_minor?: number | null
          price_max_amount_minor?: number | null
          modules?: Json | null
          price_fee_model?: Database["public"]["Enums"]["price_fee_model"] | null
          price_model?: Database["public"]["Enums"]["price_model"] | null
          price_state?: Database["public"]["Enums"]["answer_state"]
          primary_format?: Database["public"]["Enums"]["primary_format"] | null
          revision_no?: number
          start_at?: string | null
          start_state?: Database["public"]["Enums"]["answer_state"]
          timezone?: string
          title?: string | null
          title_state?: Database["public"]["Enums"]["answer_state"]
        }
        Relationships: [
          {
            foreignKeyName: "event_revisions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_revisions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_revisions_image_use_fk"
            columns: ["event_image_use_id", "event_id"]
            isOneToOne: false
            referencedRelation: "media_uses"
            referencedColumns: ["id", "event_id"]
          },
        ]
      }
      events: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          draft_revision_id: string | null
          first_approved_revision_id: string | null
          id: string
          organizer_id: string
          public_status: Database["public"]["Enums"]["event_status"]
          publication_state: Database["public"]["Enums"]["publication_state"]
          published_revision_id: string | null
          slug: string
          state_version: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          draft_revision_id?: string | null
          first_approved_revision_id?: string | null
          id?: string
          organizer_id: string
          public_status?: Database["public"]["Enums"]["event_status"]
          publication_state?: Database["public"]["Enums"]["publication_state"]
          published_revision_id?: string | null
          slug: string
          state_version?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          draft_revision_id?: string | null
          first_approved_revision_id?: string | null
          id?: string
          organizer_id?: string
          public_status?: Database["public"]["Enums"]["event_status"]
          publication_state?: Database["public"]["Enums"]["publication_state"]
          published_revision_id?: string | null
          slug?: string
          state_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_draft_revision_fk"
            columns: ["draft_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "event_revisions"
            referencedColumns: ["id", "event_id"]
          },
          {
            foreignKeyName: "events_first_approved_revision_fk"
            columns: ["first_approved_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "event_revisions"
            referencedColumns: ["id", "event_id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "my_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_published_revision_fk"
            columns: ["published_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "event_revisions"
            referencedColumns: ["id", "event_id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          id: string
          mime_type: string
          original_filename: string | null
          private_object_path: string
          uploader_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type: string
          original_filename?: string | null
          private_object_path: string
          uploader_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string
          original_filename?: string | null
          private_object_path?: string
          uploader_id?: string
        }
        Relationships: []
      }
      media_uses: {
        Row: {
          alt_text: string | null
          asset_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          crop: Json | null
          event_id: string | null
          id: string
          profile_id: string | null
          public_object_path: string | null
          role: Database["public"]["Enums"]["media_role"]
        }
        Insert: {
          alt_text?: string | null
          asset_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          crop?: Json | null
          event_id?: string | null
          id?: string
          profile_id?: string | null
          public_object_path?: string | null
          role: Database["public"]["Enums"]["media_role"]
        }
        Update: {
          alt_text?: string | null
          asset_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          crop?: Json | null
          event_id?: string | null
          id?: string
          profile_id?: string | null
          public_object_path?: string | null
          role?: Database["public"]["Enums"]["media_role"]
        }
        Relationships: [
          {
            foreignKeyName: "media_uses_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "my_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_mails: {
        Row: {
          attempts: number
          claimed_at: string
          failure_code: string | null
          finished_at: string | null
          id: number
          kind: string
          profile_id: string
          provider_message_id: string | null
          revision_id: string
          status: string
        }
        Insert: {
          attempts?: number
          claimed_at?: string
          failure_code?: string | null
          finished_at?: string | null
          id?: never
          kind: string
          profile_id: string
          provider_message_id?: string | null
          revision_id: string
          status?: string
        }
        Update: {
          attempts?: number
          claimed_at?: string
          failure_code?: string | null
          finished_at?: string | null
          id?: never
          kind?: string
          profile_id?: string
          provider_message_id?: string | null
          revision_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_mails_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "my_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_mails_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_mails_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_mails_revision_fk"
            columns: ["revision_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
        ]
      }
      profile_revisions: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string
          extra_links: Json
          id: string
          instagram_handle: string | null
          name: string | null
          official_url: string | null
          profile_id: string
          profile_image_use_id: string | null
          public_contact: string | null
          revision_no: number
          short_intro: string | null
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by: string
          extra_links?: Json
          id?: string
          instagram_handle?: string | null
          name?: string | null
          official_url?: string | null
          profile_id: string
          profile_image_use_id?: string | null
          public_contact?: string | null
          revision_no: number
          short_intro?: string | null
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string
          extra_links?: Json
          id?: string
          instagram_handle?: string | null
          name?: string | null
          official_url?: string | null
          profile_id?: string
          profile_image_use_id?: string | null
          public_contact?: string | null
          revision_no?: number
          short_intro?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_revisions_image_use_fk"
            columns: ["profile_image_use_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "media_uses"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "profile_revisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "my_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_revisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_revisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          draft_revision_id: string | null
          first_approved_revision_id: string | null
          id: string
          kind: Database["public"]["Enums"]["profile_kind"]
          owner_id: string
          publication_state: Database["public"]["Enums"]["publication_state"]
          published_revision_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          draft_revision_id?: string | null
          first_approved_revision_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["profile_kind"]
          owner_id: string
          publication_state?: Database["public"]["Enums"]["publication_state"]
          published_revision_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          draft_revision_id?: string | null
          first_approved_revision_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["profile_kind"]
          owner_id?: string
          publication_state?: Database["public"]["Enums"]["publication_state"]
          published_revision_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_draft_revision_fk"
            columns: ["draft_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "profiles_first_approved_revision_fk"
            columns: ["first_approved_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "profiles_published_revision_fk"
            columns: ["published_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
        ]
      }
      publication_audit: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: number
          revision_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: never
          revision_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: never
          revision_id?: string | null
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          created_at: string
          created_by: string
          event_revision_id: string | null
          id: number
          message: string
          profile_id: string
          revision_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_revision_id?: string | null
          id?: never
          message: string
          profile_id: string
          revision_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_revision_id?: string | null
          id?: never
          message?: string
          profile_id?: string
          revision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_event_revision_id_fkey"
            columns: ["event_revision_id"]
            isOneToOne: false
            referencedRelation: "event_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "my_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_revision_fk"
            columns: ["revision_id", "profile_id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
        ]
      }
    }
    Views: {
      my_profiles: {
        Row: {
          draft_name: string | null
          draft_revision_id: string | null
          first_approved_revision_id: string | null
          id: string | null
          publication_state:
            | Database["public"]["Enums"]["publication_state"]
            | null
          published_revision_id: string | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_draft_revision_fk"
            columns: ["draft_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "profiles_first_approved_revision_fk"
            columns: ["first_approved_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
          {
            foreignKeyName: "profiles_published_revision_fk"
            columns: ["published_revision_id", "id"]
            isOneToOne: false
            referencedRelation: "profile_revisions"
            referencedColumns: ["id", "profile_id"]
          },
        ]
      }
      public_events: {
        Row: {
          access_routes: Json | null
          address_line: string | null
          atmosphere_description: string | null
          atmosphere_tags: string[] | null
          city: string | null
          country_code: string | null
          currency: string | null
          description: string | null
          end_at: string | null
          end_state: Database["public"]["Enums"]["answer_state"] | null
          event_image_path: string | null
          id: string | null
          organizer_id: string | null
          place_name: string | null
          postal_code: string | null
          price_amount_minor: number | null
          price_max_amount_minor: number | null
          price_fee_model: Database["public"]["Enums"]["price_fee_model"] | null
          price_model: Database["public"]["Enums"]["price_model"] | null
          price_state: Database["public"]["Enums"]["answer_state"] | null
          primary_format: Database["public"]["Enums"]["primary_format"] | null
          public_status: Database["public"]["Enums"]["event_status"] | null
          published_at: string | null
          slug: string | null
          start_at: string | null
          timezone: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "my_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          extra_links: Json | null
          id: string | null
          instagram_handle: string | null
          name: string | null
          official_url: string | null
          profile_image_crop: Json | null
          profile_image_path: string | null
          public_contact: string | null
          published_at: string | null
          short_intro: string | null
          slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_code_clear: {
        Args: { p_key: string }
        Returns: undefined
      }
      auth_code_fail: {
        Args: { p_key: string }
        Returns: string
      }
      auth_code_status: {
        Args: { p_key: string }
        Returns: string
      }
      approve_first_event: {
        Args: { p_event_id: string; p_expected_draft_revision_id: string }
        Returns: undefined
      }
      change_profile_slug: {
        Args: { p_profile_id: string; p_slug: string }
        Returns: string
      }
      approve_first_profile: {
        Args: { p_expected_draft_revision_id: string; p_profile_id: string }
        Returns: undefined
      }
      approve_first_publication: {
        Args: {
          p_event_id: string
          p_expected_draft_revision_id: string
          p_expected_event_draft_revision_id: string
          p_profile_id: string
        }
        Returns: undefined
      }
      cancel_event: {
        Args: {
          p_event_id: string
          p_expected_published_revision_id: string
          p_expected_state_version: number
          p_expected_status: Database["public"]["Enums"]["event_status"]
        }
        Returns: undefined
      }
      claim_profile_mail: {
        Args: { p_kind: string; p_profile_id: string; p_revision_id: string }
        Returns: string
      }
      finish_profile_mail: {
        Args: {
          p_failure_code?: string
          p_kind: string
          p_profile_id: string
          p_provider_message_id?: string
          p_revision_id: string
          p_success: boolean
        }
        Returns: undefined
      }
      postpone_event: {
        Args: {
          p_event_id: string
          p_expected_published_revision_id: string
          p_expected_state_version: number
          p_expected_status: Database["public"]["Enums"]["event_status"]
        }
        Returns: undefined
      }
      provision_profile_owner: {
        Args: {
          target_name?: string
          target_slug: string
          target_user_id: string
        }
        Returns: string
      }
      publish_event: {
        Args: {
          p_confirmed_rights?: boolean
          p_confirmed_usage?: boolean
          p_event_id: string
          p_expected_draft_revision_id: string
          p_expected_published_revision_id: string
          p_expected_state_version: number
          p_expected_status: Database["public"]["Enums"]["event_status"]
        }
        Returns: undefined
      }
      publish_profile: {
        Args: {
          p_expected_draft_revision_id: string
          p_expected_published_revision_id?: string
          p_profile_id: string
        }
        Returns: undefined
      }
      request_profile_changes: {
        Args: {
          p_expected_draft_revision_id: string
          p_expected_event_draft_revision_id?: string
          p_message: string
          p_profile_id: string
        }
        Returns: undefined
      }
      reschedule_event: {
        Args: {
          p_event_id: string
          p_expected_draft_revision_id: string
          p_expected_published_revision_id: string
          p_expected_state_version: number
          p_expected_status: Database["public"]["Enums"]["event_status"]
        }
        Returns: undefined
      }
      reschedule_event_date: {
        Args: {
          p_event_id: string
          p_expected_published_revision_id: string
          p_expected_state_version: number
          p_expected_status: Database["public"]["Enums"]["event_status"]
          p_new_end: string
          p_new_start: string
        }
        Returns: undefined
      }
      submit_first_publication: {
        Args: {
          p_confirmed_rights: boolean
          p_confirmed_usage: boolean
          p_event_id: string
          p_expected_draft_revision_id: string
          p_expected_event_draft_revision_id: string
          p_profile_id: string
        }
        Returns: undefined
      }
      submit_profile_for_review: {
        Args: {
          p_confirmed_rights: boolean
          p_confirmed_usage: boolean
          p_expected_draft_revision_id: string
          p_profile_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      access_kind: "walk_in" | "door" | "online_ticket" | "online_registration"
      answer_state:
        | "provided"
        | "unknown"
        | "not_applicable"
        | "skipped"
        | "unanswered"
      event_status:
        | "scheduled"
        | "rescheduled"
        | "postponed_undated"
        | "cancelled"
      media_role: "profile_image" | "event_image"
      price_fee_model: "included" | "unknown"
      price_model:
        | "free"
        | "fixed"
        | "unknown"
        | "range"
        | "from_price"
        | "donation"
        | "min_donation"
      primary_format:
        | "concert"
        | "dj_set"
        | "club_night"
        | "listening_session"
        | "opening"
        | "exhibition"
        | "screening"
      profile_kind: "veranstalter"
      publication_state: "private" | "published" | "withdrawn"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_kind: ["walk_in", "door", "online_ticket", "online_registration"],
      answer_state: [
        "provided",
        "unknown",
        "not_applicable",
        "skipped",
        "unanswered",
      ],
      event_status: [
        "scheduled",
        "rescheduled",
        "postponed_undated",
        "cancelled",
      ],
      media_role: ["profile_image", "event_image"],
      price_fee_model: ["included", "unknown"],
      price_model: [
        "free",
        "fixed",
        "unknown",
        "range",
        "from_price",
        "donation",
        "min_donation",
      ],
      primary_format: [
        "concert",
        "dj_set",
        "club_night",
        "listening_session",
        "opening",
        "exhibition",
        "screening",
      ],
      profile_kind: ["veranstalter"],
      publication_state: ["private", "published", "withdrawn"],
    },
  },
} as const

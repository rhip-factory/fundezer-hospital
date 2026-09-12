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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      applications: {
        Row: {
          cause_id: string | null
          created_at: string
          decided_at: string | null
          description: string | null
          hospital_id: string | null
          id: string
          patient_id: string
          requested_amount: number
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["application_status"]
          status_changed_at: string
          submitted_at: string
          title: string
          updated_at: string
          verification_notes: string | null
          verified_by: string | null
        }
        Insert: {
          cause_id?: string | null
          created_at?: string
          decided_at?: string | null
          description?: string | null
          hospital_id?: string | null
          id?: string
          patient_id: string
          requested_amount?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          status_changed_at?: string
          submitted_at?: string
          title: string
          updated_at?: string
          verification_notes?: string | null
          verified_by?: string | null
        }
        Update: {
          cause_id?: string | null
          created_at?: string
          decided_at?: string | null
          description?: string | null
          hospital_id?: string | null
          id?: string
          patient_id?: string
          requested_amount?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          status_changed_at?: string
          submitted_at?: string
          title?: string
          updated_at?: string
          verification_notes?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_name: string | null
          actor_role: string | null
          actor_user_id: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_state: Json | null
          previous_state: Json | null
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_state?: Json | null
          previous_state?: Json | null
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_state?: Json | null
          previous_state?: Json | null
        }
        Relationships: []
      }
      campaign_updates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_user_id: string | null
          campaign_id: string
          content: string
          created_at: string
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["publication_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_user_id?: string | null
          campaign_id: string
          content: string
          created_at?: string
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_user_id?: string | null
          campaign_id?: string
          content?: string
          created_at?: string
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          application_id: string | null
          cause_id: string | null
          created_at: string
          hospital_id: string | null
          id: string
          internal_summary: string | null
          is_public: boolean
          patient_id: string
          public_image_url: string | null
          public_story: string | null
          public_title: string | null
          publication_consent_granted: boolean
          published_at: string | null
          slug: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target: number
          title: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          cause_id?: string | null
          created_at?: string
          hospital_id?: string | null
          id?: string
          internal_summary?: string | null
          is_public?: boolean
          patient_id: string
          public_image_url?: string | null
          public_story?: string | null
          public_title?: string | null
          publication_consent_granted?: boolean
          published_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target?: number
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          cause_id?: string | null
          created_at?: string
          hospital_id?: string | null
          id?: string
          internal_summary?: string | null
          is_public?: boolean
          patient_id?: string
          public_image_url?: string | null
          public_story?: string | null
          public_title?: string | null
          publication_consent_granted?: boolean
          published_at?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      causes: {
        Row: {
          created_at: string
          description: string | null
          funding_target: number
          id: string
          image_url: string | null
          name: string
          status: Database["public"]["Enums"]["cause_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          funding_target?: number
          id?: string
          image_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["cause_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          funding_target?: number
          id?: string
          image_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["cause_status"]
          updated_at?: string
        }
        Relationships: []
      }
      consents: {
        Row: {
          campaign_id: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          consent_version: string
          consented_at: string | null
          created_at: string
          granted_by_name: string | null
          granted_by_user_id: string | null
          id: string
          patient_id: string | null
          status: Database["public"]["Enums"]["consent_status"]
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          consent_version?: string
          consented_at?: string | null
          created_at?: string
          granted_by_name?: string | null
          granted_by_user_id?: string | null
          id?: string
          patient_id?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          consent_type?: Database["public"]["Enums"]["consent_type"]
          consent_version?: string
          consented_at?: string | null
          created_at?: string
          granted_by_name?: string | null
          granted_by_user_id?: string | null
          id?: string
          patient_id?: string | null
          status?: Database["public"]["Enums"]["consent_status"]
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          application_id: string | null
          campaign_id: string | null
          created_at: string
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_size_bytes: number | null
          hospital_id: string | null
          id: string
          is_public: boolean
          mime_type: string | null
          patient_id: string | null
          storage_bucket: string
          storage_path: string
          title: string
          transfer_id: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          application_id?: string | null
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_size_bytes?: number | null
          hospital_id?: string | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          patient_id?: string | null
          storage_bucket?: string
          storage_path: string
          title: string
          transfer_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          application_id?: string | null
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          file_size_bytes?: number | null
          hospital_id?: string | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          patient_id?: string | null
          storage_bucket?: string
          storage_path?: string
          title?: string
          transfer_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          allocation_status: Database["public"]["Enums"]["allocation_status"]
          amount: number
          campaign_id: string | null
          cause_id: string | null
          created_at: string
          currency: string
          donation_type: Database["public"]["Enums"]["donation_type"]
          donor_email: string | null
          donor_name: string | null
          donor_user_id: string | null
          id: string
          is_anonymous: boolean
          message: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          recurring_plan_id: string | null
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          allocation_status?: Database["public"]["Enums"]["allocation_status"]
          amount: number
          campaign_id?: string | null
          cause_id?: string | null
          created_at?: string
          currency?: string
          donation_type: Database["public"]["Enums"]["donation_type"]
          donor_email?: string | null
          donor_name?: string | null
          donor_user_id?: string | null
          id?: string
          is_anonymous?: boolean
          message?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recurring_plan_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          allocation_status?: Database["public"]["Enums"]["allocation_status"]
          amount?: number
          campaign_id?: string | null
          cause_id?: string | null
          created_at?: string
          currency?: string
          donation_type?: Database["public"]["Enums"]["donation_type"]
          donor_email?: string | null
          donor_name?: string | null
          donor_user_id?: string | null
          id?: string
          is_anonymous?: boolean
          message?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recurring_plan_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hospital_capabilities: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          notes: string | null
          service_id: string
          status: Database["public"]["Enums"]["capability_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          notes?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["capability_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          notes?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["capability_status"]
          updated_at?: string
        }
        Relationships: []
      }
      hospital_equipment: {
        Row: {
          condition: string | null
          created_at: string
          hospital_id: string
          id: string
          is_operational: boolean
          name: string
          quantity: number
          updated_at: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          hospital_id: string
          id?: string
          is_operational?: boolean
          name: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          hospital_id?: string
          id?: string
          is_operational?: boolean
          name?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      hospital_users: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          job_title: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          job_title?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          job_title?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          accreditation: string | null
          address: string | null
          beds: number
          city: string
          contact_role: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          onboarded_on: string
          phone: string | null
          state: string
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          accreditation?: string | null
          address?: string | null
          beds?: number
          city: string
          contact_role?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          onboarded_on?: string
          phone?: string | null
          state: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          accreditation?: string | null
          address?: string | null
          beds?: number
          city?: string
          contact_role?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          onboarded_on?: string
          phone?: string | null
          state?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          read_at: string | null
          recipient_user_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          read_at?: string | null
          recipient_user_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          read_at?: string | null
          recipient_user_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
        }
        Relationships: []
      }
      patient_hospital_history: {
        Row: {
          created_at: string
          ended_on: string | null
          hospital_id: string
          id: string
          patient_id: string
          reason: string | null
          started_on: string
          transfer_id: string | null
          treatment_phase: Database["public"]["Enums"]["treatment_stage"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_on?: string | null
          hospital_id: string
          id?: string
          patient_id: string
          reason?: string | null
          started_on?: string
          transfer_id?: string | null
          treatment_phase?:
            | Database["public"]["Enums"]["treatment_stage"]
            | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_on?: string | null
          hospital_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          started_on?: string
          transfer_id?: string | null
          treatment_phase?:
            | Database["public"]["Enums"]["treatment_stage"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          age_band: string | null
          city: string | null
          condition: string | null
          created_at: string
          current_hospital_id: string | null
          date_of_birth: string | null
          display_name: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          medical_summary: string | null
          phone: string | null
          reference_code: string
          state: string | null
          status: Database["public"]["Enums"]["patient_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          user_id: string | null
        }
        Insert: {
          age_band?: string | null
          city?: string | null
          condition?: string | null
          created_at?: string
          current_hospital_id?: string | null
          date_of_birth?: string | null
          display_name: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_summary?: string | null
          phone?: string | null
          reference_code: string
          state?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          user_id?: string | null
        }
        Update: {
          age_band?: string | null
          city?: string | null
          condition?: string | null
          created_at?: string
          current_hospital_id?: string | null
          date_of_birth?: string | null
          display_name?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_summary?: string | null
          phone?: string | null
          reference_code?: string
          state?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          state: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_plans: {
        Row: {
          amount: number
          campaign_id: string | null
          cause_id: string | null
          created_at: string
          donor_user_id: string
          frequency: Database["public"]["Enums"]["recurring_frequency"]
          id: string
          next_run_on: string | null
          status: Database["public"]["Enums"]["recurring_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          cause_id?: string | null
          created_at?: string
          donor_user_id: string
          frequency?: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          next_run_on?: string | null
          status?: Database["public"]["Enums"]["recurring_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          cause_id?: string | null
          created_at?: string
          donor_user_id?: string
          frequency?: Database["public"]["Enums"]["recurring_frequency"]
          id?: string
          next_run_on?: string | null
          status?: Database["public"]["Enums"]["recurring_status"]
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      transfer_events: {
        Row: {
          actor_label: string | null
          actor_user_id: string | null
          created_at: string
          id: string
          note: string | null
          occurred_at: string
          status: Database["public"]["Enums"]["transfer_status"]
          transfer_id: string
        }
        Insert: {
          actor_label?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_at?: string
          status: Database["public"]["Enums"]["transfer_status"]
          transfer_id: string
        }
        Update: {
          actor_label?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_at?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          transfer_id?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          admin_decision: string | null
          admin_decision_at: string | null
          admin_decision_by: string | null
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          originating_hospital_id: string
          patient_id: string
          reason: string
          receiving_hospital_id: string | null
          reference_code: string
          requested_at: string
          scheduled_for: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          treatment_phase: Database["public"]["Enums"]["treatment_stage"] | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          admin_decision?: string | null
          admin_decision_at?: string | null
          admin_decision_by?: string | null
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          originating_hospital_id: string
          patient_id: string
          reason: string
          receiving_hospital_id?: string | null
          reference_code: string
          requested_at?: string
          scheduled_for?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          treatment_phase?:
            | Database["public"]["Enums"]["treatment_stage"]
            | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          admin_decision?: string | null
          admin_decision_at?: string | null
          admin_decision_by?: string | null
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          originating_hospital_id?: string
          patient_id?: string
          reason?: string
          receiving_hospital_id?: string | null
          reference_code?: string
          requested_at?: string
          scheduled_for?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          treatment_phase?:
            | Database["public"]["Enums"]["treatment_stage"]
            | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: []
      }
      treatment_journeys: {
        Row: {
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          hospital_id: string | null
          id: string
          patient_id: string
          position: number
          private_notes: string | null
          stage: Database["public"]["Enums"]["treatment_stage"]
          stage_status: Database["public"]["Enums"]["stage_status"]
          started_at: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          hospital_id?: string | null
          id?: string
          patient_id: string
          position?: number
          private_notes?: string | null
          stage: Database["public"]["Enums"]["treatment_stage"]
          stage_status?: Database["public"]["Enums"]["stage_status"]
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          hospital_id?: string | null
          id?: string
          patient_id?: string
          position?: number
          private_notes?: string | null
          stage?: Database["public"]["Enums"]["treatment_stage"]
          stage_status?: Database["public"]["Enums"]["stage_status"]
          started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      treatment_updates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_user_id: string | null
          campaign_id: string | null
          created_at: string
          hospital_id: string | null
          id: string
          journey_id: string | null
          patient_id: string
          private_notes: string | null
          public_summary: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["publication_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_user_id?: string | null
          campaign_id?: string | null
          created_at?: string
          hospital_id?: string | null
          id?: string
          journey_id?: string | null
          patient_id: string
          private_notes?: string | null
          public_summary?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_user_id?: string | null
          campaign_id?: string | null
          created_at?: string
          hospital_id?: string | null
          id?: string
          journey_id?: string | null
          patient_id?: string
          private_notes?: string | null
          public_summary?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_campaign_updates: {
        Row: {
          campaign_id: string | null
          content: string | null
          created_at: string | null
          id: string | null
          published_at: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      public_campaigns: {
        Row: {
          cause_id: string | null
          created_at: string | null
          hospital_id: string | null
          id: string | null
          public_image_url: string | null
          public_story: string | null
          public_title: string | null
          published_at: string | null
          slug: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_status: "active" | "inactive" | "suspended"
      allocation_status: "Allocated" | "Under Review" | "Held" | "Reversed"
      app_role:
        | "patient"
        | "donor"
        | "hospital_reviewer"
        | "doctor"
        | "hospital_finance"
        | "platform_administrator"
        | "fraud_analyst"
        | "auditor"
      application_status:
        | "Submitted"
        | "Under Review"
        | "Information Requested"
        | "Verified"
        | "Approved"
        | "Rejected"
        | "Withdrawn"
      campaign_status:
        | "Draft"
        | "Under Review"
        | "Active"
        | "Completed"
        | "Suspended"
      capability_status:
        | "Available"
        | "Temporarily Unavailable"
        | "Not Available"
      cause_status: "Active" | "Inactive"
      consent_status: "Granted" | "Declined" | "Withdrawn" | "Pending"
      consent_type:
        | "Campaign Publication Consent"
        | "Photo Consent"
        | "Treatment Update Consent"
        | "Story Consent"
        | "Contact Consent"
      document_type:
        | "Medical Report"
        | "Prescription"
        | "Laboratory Result"
        | "Imaging Report"
        | "Identification Document"
        | "Picture"
        | "Government ID"
        | "Video"
        | "Referral Letter"
        | "Other"
      donation_type: "Patient" | "Cause" | "Recurring"
      patient_status:
        | "Active"
        | "Under Treatment"
        | "Transferred"
        | "Recovered"
        | "Closed"
      payment_status: "Paid" | "Pending" | "Failed" | "Refunded"
      publication_status:
        | "Draft"
        | "Pending Approval"
        | "Approved"
        | "Published"
        | "Rejected"
      recurring_frequency: "Weekly" | "Monthly" | "Quarterly" | "Yearly"
      recurring_status: "Active" | "Paused" | "Cancelled"
      stage_status: "Pending" | "In Progress" | "Completed" | "Skipped"
      transfer_status:
        | "Submitted"
        | "Under Review"
        | "Receiving Hospital Pending"
        | "Accepted"
        | "Patient Notified"
        | "Transfer Scheduled"
        | "Treatment Commenced"
        | "Completed"
        | "Rejected"
        | "Cancelled"
      treatment_stage:
        | "Diagnosis"
        | "Treatment Planning"
        | "Funding"
        | "Admission"
        | "Treatment"
        | "Post-Treatment"
        | "Recovery"
        | "Discharged"
      urgency_level: "Low" | "Medium" | "High" | "Critical"
      verification_status: "Verified" | "Pending" | "Suspended"
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
      account_status: ["active", "inactive", "suspended"],
      allocation_status: ["Allocated", "Under Review", "Held", "Reversed"],
      app_role: [
        "patient",
        "donor",
        "hospital_reviewer",
        "doctor",
        "hospital_finance",
        "platform_administrator",
        "fraud_analyst",
        "auditor",
      ],
      application_status: [
        "Submitted",
        "Under Review",
        "Information Requested",
        "Verified",
        "Approved",
        "Rejected",
        "Withdrawn",
      ],
      campaign_status: [
        "Draft",
        "Under Review",
        "Active",
        "Completed",
        "Suspended",
      ],
      capability_status: [
        "Available",
        "Temporarily Unavailable",
        "Not Available",
      ],
      cause_status: ["Active", "Inactive"],
      consent_status: ["Granted", "Declined", "Withdrawn", "Pending"],
      consent_type: [
        "Campaign Publication Consent",
        "Photo Consent",
        "Treatment Update Consent",
        "Story Consent",
        "Contact Consent",
      ],
      document_type: [
        "Medical Report",
        "Prescription",
        "Laboratory Result",
        "Imaging Report",
        "Identification Document",
        "Picture",
        "Government ID",
        "Video",
        "Referral Letter",
        "Other",
      ],
      donation_type: ["Patient", "Cause", "Recurring"],
      patient_status: [
        "Active",
        "Under Treatment",
        "Transferred",
        "Recovered",
        "Closed",
      ],
      payment_status: ["Paid", "Pending", "Failed", "Refunded"],
      publication_status: [
        "Draft",
        "Pending Approval",
        "Approved",
        "Published",
        "Rejected",
      ],
      recurring_frequency: ["Weekly", "Monthly", "Quarterly", "Yearly"],
      recurring_status: ["Active", "Paused", "Cancelled"],
      stage_status: ["Pending", "In Progress", "Completed", "Skipped"],
      transfer_status: [
        "Submitted",
        "Under Review",
        "Receiving Hospital Pending",
        "Accepted",
        "Patient Notified",
        "Transfer Scheduled",
        "Treatment Commenced",
        "Completed",
        "Rejected",
        "Cancelled",
      ],
      treatment_stage: [
        "Diagnosis",
        "Treatment Planning",
        "Funding",
        "Admission",
        "Treatment",
        "Post-Treatment",
        "Recovery",
        "Discharged",
      ],
      urgency_level: ["Low", "Medium", "High", "Critical"],
      verification_status: ["Verified", "Pending", "Suspended"],
    },
  },
} as const

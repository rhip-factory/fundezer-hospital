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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          assessment: Json | null
          campaign_id: string | null
          condition: string
          created_at: string
          documents: Json | null
          hospital_id: string | null
          id: string
          patient_address: string | null
          patient_age: number | null
          patient_email: string | null
          patient_emergency_contact: string | null
          patient_gender: string | null
          patient_name: string
          patient_next_of_kin: string | null
          patient_nin: string | null
          patient_phone: string | null
          rejection_reason: string | null
          risk_flags: Json | null
          risk_score: number | null
          status: string
          story: string | null
          submitted: string | null
          updated_at: string
        }
        Insert: {
          assessment?: Json | null
          campaign_id?: string | null
          condition: string
          created_at?: string
          documents?: Json | null
          hospital_id?: string | null
          id: string
          patient_address?: string | null
          patient_age?: number | null
          patient_email?: string | null
          patient_emergency_contact?: string | null
          patient_gender?: string | null
          patient_name: string
          patient_next_of_kin?: string | null
          patient_nin?: string | null
          patient_phone?: string | null
          rejection_reason?: string | null
          risk_flags?: Json | null
          risk_score?: number | null
          status?: string
          story?: string | null
          submitted?: string | null
          updated_at?: string
        }
        Update: {
          assessment?: Json | null
          campaign_id?: string | null
          condition?: string
          created_at?: string
          documents?: Json | null
          hospital_id?: string | null
          id?: string
          patient_address?: string | null
          patient_age?: number | null
          patient_email?: string | null
          patient_emergency_contact?: string | null
          patient_gender?: string | null
          patient_name?: string
          patient_next_of_kin?: string | null
          patient_nin?: string | null
          patient_phone?: string | null
          rejection_reason?: string | null
          risk_flags?: Json | null
          risk_score?: number | null
          status?: string
          story?: string | null
          submitted?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          application_id: string | null
          condition: string
          created: string | null
          created_at: string
          donors: number
          goal: number
          hospital_id: string | null
          id: string
          patient_name: string
          raised: number
          status: string
          treatment_stage: number
          updated_at: string
          updates: Json | null
        }
        Insert: {
          application_id?: string | null
          condition: string
          created?: string | null
          created_at?: string
          donors?: number
          goal?: number
          hospital_id?: string | null
          id: string
          patient_name: string
          raised?: number
          status?: string
          treatment_stage?: number
          updated_at?: string
          updates?: Json | null
        }
        Update: {
          application_id?: string | null
          condition?: string
          created?: string | null
          created_at?: string
          donors?: number
          goal?: number
          hospital_id?: string | null
          id?: string
          patient_name?: string
          raised?: number
          status?: string
          treatment_stage?: number
          updated_at?: string
          updates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          donation_date: string | null
          donor: string
          id: string
        }
        Insert: {
          amount?: number
          campaign_id: string
          created_at?: string
          donation_date?: string | null
          donor: string
          id?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          donation_date?: string | null
          donor?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          decline_reason: string | null
          document: string | null
          id: string
          milestone: string
          note: string | null
          payment_date: string | null
          stage: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          campaign_id: string
          created_at?: string
          decline_reason?: string | null
          document?: string | null
          id: string
          milestone: string
          note?: string | null
          payment_date?: string | null
          stage?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          decline_reason?: string | null
          document?: string | null
          id?: string
          milestone?: string
          note?: string | null
          payment_date?: string | null
          stage?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          hospital_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          hospital_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          hospital_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hospital_reviewer" | "fundezer_reviewer"
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
    Enums: {
      app_role: ["admin", "hospital_reviewer", "fundezer_reviewer"],
    },
  },
} as const
